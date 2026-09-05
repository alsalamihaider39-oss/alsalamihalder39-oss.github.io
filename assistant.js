/* =====================================================================
   assistant.js — محرّك فهم الأسئلة للمساعد الذكي
   مركز كربلاء لتكنولوجيا المعلومات
   =====================================================================
   لا تحتاج تعديل هذا الملف عادةً — كل ما تعدّله موجود في kb.js

   ماذا يفعل هذا الملف؟
   1) يطبّع النص (يزيل التشكيل ويوحّد الحروف: أ إ آ → ا ، ة → ه ، ى → ي)
   2) يبني فهرساً للأسئلة بأسلوب TF-IDF مع المرادفات
   3) يحسب تشابه السؤال مع كل عنصر في قاعدة المعرفة (كلمات + تشابه حروف)
   4) يدمج بيانات الدورات والقاعات الحيّة من script.js في الجواب
   5) يحمي من محاولات تغيير تعليمات النظام (Prompt Injection)
   6) يحدّ من عدد الطلبات (Rate Limiting) قبل أي اتصال بالخادم
   7) عند وجود KCIT_AI.endpoint يسأل الخادم، وإن فشل يرجع للقاعدة المحلية

   يُصدِّر:
   • window.KCIT_KB_ANSWER(text, minScore) → نص الجواب أو null
   • window.KCIT_ASK_AI(text)             → Promise<string|null>
===================================================================== */

(function kcitAssistantEngine() {

    "use strict";

    /* =================================================================
       0) أدوات نصية
    ================================================================= */

    const AR_DIACRITICS = /[ً-ْٰـ]/g;

    function normalize(text) {
        return String(text || "")
            .replace(AR_DIACRITICS, "")
            .replace(/[أإآٱ]/g, "ا")
            .replace(/ة/g, "ه")
            .replace(/ى/g, "ي")
            .replace(/ؤ/g, "و")
            .replace(/ئ/g, "ي")
            .replace(/گ/g, "ك")
            .replace(/چ/g, "ج")
            .replace(/[^ء-يa-zA-Z0-9\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();
    }

    const STOP = new Set([
        "في", "من", "على", "الى", "عن", "هل", "ما", "ماهي", "هي", "هو", "انا", "احب",
        "اريد", "ابي", "لو", "سمحت", "ممكن", "رجاء", "يا", "اخي", "اختي", "الله",
        "بس", "هاي", "هذا", "هذه", "هاذا", "اكو", "عندكم", "عندك", "لديكم", "الي",
        "ال", "كل", "شي", "شيء", "ايش", "وش", "the", "a", "an", "is", "are", "do",
        "you", "i", "want", "please", "of", "for", "to"
    ]);

    /* جذر تقريبي: يزيل السوابق واللواحق العربية الشائعة */
    function stem(word) {

        let w = word;

        const prefixes = ["وال", "بال", "فال", "كال", "لل", "ال", "و", "ب", "ل", "ف", "ك"];
        for (const p of prefixes) {
            if (w.length > p.length + 2 && w.indexOf(p) === 0) { w = w.slice(p.length); break; }
        }

        const suffixes = ["اتها", "اتهم", "كم", "هم", "ها", "نا", "ين", "ون", "ات", "ه", "ي"];
        for (const s of suffixes) {
            if (w.length > s.length + 2 && w.slice(-s.length) === s) { w = w.slice(0, -s.length); break; }
        }

        return w;
    }

    function tokenize(text) {
        return normalize(text)
            .split(" ")
            .filter(function (w) { return w.length > 1 && !STOP.has(w); })
            .map(stem);
    }

    /* مسافة تحرير محدودة — لتحمّل الأخطاء الإملائية */
    function editDistance(a, b) {

        const m = a.length, n = b.length;
        if (!m) return n;
        if (!n) return m;
        if (Math.abs(m - n) > 3) return 99;

        let prev = new Array(n + 1);
        for (let j = 0; j <= n; j++) prev[j] = j;

        for (let i = 1; i <= m; i++) {
            const cur = [i];
            for (let j = 1; j <= n; j++) {
                cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1,
                                  prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
            }
            prev = cur;
        }
        return prev[n];
    }

    function similar(a, b) {
        if (a === b) return 1;
        const max = Math.max(a.length, b.length);
        if (!max) return 0;
        return 1 - editDistance(a, b) / max;
    }


    /* =================================================================
       1) توسيع المرادفات
    ================================================================= */

    function expand(tokens) {

        const syn = window.KCIT_SYNONYMS || {};
        const out = new Set(tokens);

        tokens.forEach(function (t) {
            Object.keys(syn).forEach(function (key) {

                const k = stem(normalize(key));
                const list = syn[key].map(function (v) { return normalize(v); });

                if (t === k) {
                    list.forEach(function (v) { v.split(" ").forEach(function (p) { out.add(stem(p)); }); });
                    return;
                }

                list.forEach(function (v) {
                    if (v.split(" ").map(stem).indexOf(t) !== -1) out.add(k);
                });
            });
        });

        return Array.from(out);
    }


    /* =================================================================
       2) بناء الفهرس (TF-IDF مبسّط)
    ================================================================= */

    let INDEX = null;

    function buildIndex() {

        const faq = window.KCIT_FAQ || [];
        const docs = [];
        const df = Object.create(null);

        faq.forEach(function (item, i) {

            const raw = [item.q].concat(item.k || []).join(" ");
            const terms = expand(tokenize(raw));
            const set = new Set(terms);

            set.forEach(function (t) { df[t] = (df[t] || 0) + 1; });

            docs.push({ i: i, terms: terms, set: set, item: item });
        });

        const N = docs.length || 1;

        const idf = Object.create(null);
        Object.keys(df).forEach(function (t) {
            idf[t] = Math.log(1 + N / df[t]);
        });

        INDEX = { docs: docs, idf: idf, N: N };
        return INDEX;
    }

    function index() {
        if (!INDEX || INDEX.N !== (window.KCIT_FAQ || []).length) buildIndex();
        return INDEX;
    }


    /* =================================================================
       3) البحث عن أقرب سؤال
    ================================================================= */

    function search(text) {

        const idx = index();
        const qTerms = expand(tokenize(text));

        if (!qTerms.length) return null;

        let best = null, bestScore = 0, second = 0;

        idx.docs.forEach(function (doc) {

            let score = 0;

            qTerms.forEach(function (t) {

                const weight = idx.idf[t] || 1;

                if (doc.set.has(t)) { score += weight * 1.0; return; }

                /* مطابقة تقريبية للكلمات الطويلة (أخطاء إملائية) */
                if (t.length >= 4) {
                    let bestSim = 0;
                    doc.set.forEach(function (d) {
                        if (d.length >= 4 && Math.abs(d.length - t.length) <= 3) {
                            const s = similar(t, d);
                            if (s > bestSim) bestSim = s;
                        }
                    });
                    if (bestSim > 0.82) score += weight * bestSim * 0.75;
                }
            });

            /* مكافأة عندما يحتوي نص السؤال كاملاً */
            const qn = normalize(doc.item.q);
            const tn = normalize(text);
            if (qn && tn.indexOf(qn) !== -1) score += 3;

            /* تطبيع بطول السؤال حتى لا تفوز الأسئلة الطويلة دائماً */
            const norm = score / Math.sqrt(Math.max(3, doc.terms.length));

            if (norm > bestScore) { second = bestScore; bestScore = norm; best = doc; }
            else if (norm > second) { second = norm; }
        });

        if (!best) return null;

        return { item: best.item, score: bestScore, margin: bestScore - second };
    }


    /* =================================================================
       4) دمج البيانات الحيّة (الدورات والقاعات) مع الجواب
    ================================================================= */

    function liveCourses() {
        try {
            if (typeof coursesData === "undefined") return null;
            return coursesData;
        } catch (e) { return null; }
    }

    function coursesSummary() {

        const courses = liveCourses();
        if (!courses) return "";

        const lines = Object.keys(courses).map(function (id) {

            const c = courses[id];
            const price = c.price || (c.tracks ? "من " + c.tracks[0].price : "-");

            let status = "";
            try {
                if (typeof getCourseMeta === "function" && typeof STATUS_TEXT !== "undefined") {
                    const meta = getCourseMeta(id);
                    const st = STATUS_TEXT[meta.status] || STATUS_TEXT.open;
                    if (st) status = " — " + st.label;
                }
            } catch (e) { /* تجاهل */ }

            return "• " + c.title + " — " + price + status;
        });

        return lines.join("\n");
    }

    /* استبدال العلامات داخل الأجوبة ببيانات حيّة */
    function fillTokens(answer) {

        const c = window.KCIT_CENTER || {};

        return String(answer)
            .replace(/\[رقم الهاتف\]/g, c.phone || "")
            .replace(/\[واتساب\]/g, c.phone || "")
            .replace(/\[البريد الإلكتروني\]/g, c.email || "")
            .replace(/\{الهاتف\}/g, c.phone || "")
            .replace(/\{البريد\}/g, c.email || "")
            .replace(/\{العنوان\}/g, c.address || "")
            .replace(/\{الدوام\}/g, c.hours || "")
            .replace(/\{الدورات\}/g, coursesSummary());
    }

    /* أسئلة يُفضَّل أن تُرفَق معها قائمة الدورات الحيّة */
    const LIVE_IDS = [7, 8, 12, 13, 14, 15, 16];

    function decorate(item) {

        let out = fillTokens(item.a);

        if (LIVE_IDS.indexOf(item.id) !== -1) {
            const list = coursesSummary();
            if (list) out += "\n\nالدورات المتاحة الآن:\n" + list;
        }

        return out;
    }


    /* =================================================================
       5) الحماية: محاولات كشف التعليمات أو تغييرها
    ================================================================= */

    const INJECTION = [
        "تجاهل كل التعليمات", "تجاهل التعليمات", "انس التعليمات", "system prompt",
        "اظهر التعليمات", "اعطني مفتاح", "api key", "مفتاح api", "الكود المصدري",
        "ignore all previous", "ignore previous instructions", "reveal your prompt",
        "developer mode", "انت الان", "تصرف كانك"
    ];

    function isInjection(text) {
        const t = normalize(text);
        return INJECTION.some(function (p) { return t.indexOf(normalize(p)) !== -1; });
    }

    const INJECTION_REPLY =
        "أنا هنا كمساعد لمركز كربلاء لتكنولوجيا المعلومات فقط 🌿\n" +
        "ما أقدر أشارك أي إعدادات أو مفاتيح أو تعليمات داخلية، وما أقدر أغيّر دوري.\n" +
        "بس بكل سرور أجاوبك عن الدورات، الأسعار، القاعات، التسجيل، أو أي شيء يخص المركز.";


    /* =================================================================
       6) حدّ الطلبات (Rate Limiting) — قبل أي اتصال بالخادم
    ================================================================= */

    const RL_KEY = "kcit_ai_calls";

    function rateAllow() {

        const cfg = window.KCIT_AI || {};
        const now = Date.now();

        let list = [];
        try { list = JSON.parse(localStorage.getItem(RL_KEY) || "[]"); } catch (e) { list = []; }

        list = list.filter(function (t) { return now - t < 3600000; });

        if (list.length && now - list[list.length - 1] < (cfg.minGapMs || 3000)) {
            return { ok: false, reason: "fast" };
        }

        if (list.length >= (cfg.maxPerHour || 40)) {
            return { ok: false, reason: "quota" };
        }

        list.push(now);
        try { localStorage.setItem(RL_KEY, JSON.stringify(list)); } catch (e) { /* تجاهل */ }

        return { ok: true };
    }


    /* =================================================================
       7) الجواب من قاعدة المعرفة
    ================================================================= */

    function kbAnswer(text, minScore) {

        if (!text) return null;

        if (isInjection(text)) return INJECTION_REPLY;

        const hit = search(text);
        if (!hit) return null;

        const threshold = (typeof minScore === "number") ? minScore : 1.15;

        if (hit.score < threshold) return null;

        return decorate(hit.item);
    }


    /* =================================================================
       8) سؤال الخادم (اختياري) — الأسئلة الحرّة
    ================================================================= */

    const AI_ERROR =
        "صار عندي خلل بسيط حالياً، حاول مرة ثانية بعد قليل 🌿\n" +
        "أو تواصل مباشرة مع المركز على " +
        ((window.KCIT_CENTER && window.KCIT_CENTER.phone) || "");

    function askAI(text) {

        const cfg = window.KCIT_AI || {};

        if (!cfg.enabled || !cfg.endpoint) return Promise.resolve(null);

        const clean = String(text || "").trim().slice(0, cfg.maxChars || 500);
        if (!clean) return Promise.resolve(null);

        if (isInjection(clean)) return Promise.resolve(INJECTION_REPLY);

        const gate = rateAllow();

        if (!gate.ok) {
            return Promise.resolve(
                gate.reason === "fast"
                    ? "مهلاً قليلاً 🌿 اسألني بعد ثانيتين وأجاوبك."
                    : "وصلت للحد الأقصى من الأسئلة لهذه الساعة 🌿 تقدر تكمل بعد شوي، " +
                      "أو تتواصل مع المركز مباشرة على " + ((window.KCIT_CENTER || {}).phone || "")
            );
        }

        /* أقرب ثلاثة عناصر من قاعدة المعرفة تُرسل كسياق للنموذج */
        const idx = index();
        const context = [];

        try {
            const qTerms = expand(tokenize(clean));
            const scored = idx.docs.map(function (doc) {
                let s = 0;
                qTerms.forEach(function (t) { if (doc.set.has(t)) s += (idx.idf[t] || 1); });
                return { s: s, item: doc.item };
            }).sort(function (a, b) { return b.s - a.s; }).slice(0, 4);

            scored.forEach(function (r) {
                if (r.s > 0) context.push({ q: r.item.q, a: fillTokens(r.item.a) });
            });
        } catch (e) { /* تجاهل */ }

        const payload = {
            question: clean,
            context:  context,
            courses:  coursesSummary(),
            center:   window.KCIT_CENTER || {}
        };

        const controller = ("AbortController" in window) ? new AbortController() : null;
        const timer = setTimeout(function () { if (controller) controller.abort(); },
                                 cfg.timeoutMs || 12000);

        return fetch(cfg.endpoint, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },  /* يتجنّب preflight */
            body: JSON.stringify(payload),
            signal: controller ? controller.signal : undefined
        })
        .then(function (res) {
            clearTimeout(timer);
            if (!res.ok) throw new Error("HTTP " + res.status);
            return res.json();
        })
        .then(function (data) {
            if (data && data.ok && data.answer) return String(data.answer);
            throw new Error((data && data.error) || "bad response");
        })
        .catch(function (err) {
            clearTimeout(timer);
            /* الخطأ يُسجَّل للمطوّر فقط — والمستخدم يرى رسالة ودّية */
            console.warn("[KCIT assistant] AI request failed:", err && err.message);
            return AI_ERROR;
        });
    }


    /* =================================================================
       9) التصدير
    ================================================================= */

    window.KCIT_KB_ANSWER = kbAnswer;
    window.KCIT_ASK_AI    = askAI;

    window.KCIT_ASSISTANT = {
        normalize: normalize,
        tokenize:  tokenize,
        search:    search,
        rebuild:   buildIndex
    };

})();