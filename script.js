/* =====================================================================
   مركز كربلاء لتكنولوجيا المعلومات
   script.js
===================================================================== */


/* =====================================================================
   إعدادات عامة
===================================================================== */

/* رقم واتساب المركز */
const CENTER_WHATSAPP_LOCAL = "07748477756";
const CENTER_WHATSAPP_INTL  = "9647748477756";


/* =====================================================================
   القائمة الجانبية
===================================================================== */

const menuButton  = document.getElementById("menuButton");
const closeButton = document.getElementById("closeButton");
const sideMenu    = document.getElementById("sideMenu");
const menuOverlay = document.getElementById("menuOverlay");
const menuLinks   = document.querySelectorAll(".menu-links a");

function openMenu() {
    sideMenu.classList.add("active");
    menuOverlay.classList.add("active");
    sideMenu.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
}

function closeMenu() {
    if (!sideMenu) return;
    sideMenu.classList.remove("active");
    menuOverlay.classList.remove("active");
    sideMenu.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
}

if (menuButton)  menuButton.addEventListener("click", openMenu);
if (closeButton) closeButton.addEventListener("click", closeMenu);
if (menuOverlay) menuOverlay.addEventListener("click", closeMenu);

menuLinks.forEach((link) => link.addEventListener("click", closeMenu));


/* =====================================================================
   تصغير الشريط العلوي عند النزول بالصفحة
===================================================================== */

(function navbarScrollState() {

    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    function update() {
        navbar.classList.toggle("is-scrolled", window.scrollY > 40);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });

})();


/* =====================================================================
   عدّاد الإحصائيات
===================================================================== */

function animateCounter(counterEl) {

    if (!counterEl || counterEl.dataset.animated === "1") return;
    counterEl.dataset.animated = "1";

    const target = Number(counterEl.dataset.target);
    if (!target) return;

    const duration = 1500;
    const startTime = performance.now();

    function animate(currentTime) {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        counterEl.textContent = Math.floor(target * ease).toLocaleString("en-US");

        if (progress < 1) requestAnimationFrame(animate);
        else counterEl.textContent = target.toLocaleString("en-US");
    }

    requestAnimationFrame(animate);
}


/* =====================================================================
   حركات الظهور عند التمرير
===================================================================== */

function observeReveals(scope) {

    const elements = (scope || document).querySelectorAll(".reveal:not([data-observed])");
    if (!elements.length) return;

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add("in-view");

                const counterEl = entry.target.querySelector(".counter");
                if (counterEl) animateCounter(counterEl);

                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    elements.forEach((el) => {
        el.setAttribute("data-observed", "1");
        revealObserver.observe(el);
    });
}

observeReveals(document);


/* =====================================================================
   الخط الزمني — حركة متسلسلة
   السنة تظهر ← ثم النص ← ثم يُرسم الخط حتى السنة التالية
===================================================================== */

(function storyTimelineSequence() {

    const timeline = document.getElementById("storyTimeline");
    const fill     = document.getElementById("timelineLineFill");
    if (!timeline || !fill) return;

    const items = Array.from(timeline.querySelectorAll(".timeline-item"));
    if (!items.length) return;

    let started  = false;
    let finished = false;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /* المسافة بين أعلى الخط الزمني ومنتصف نقطة سنة معيّنة */
    function dotOffset(item) {
        const dot = item.querySelector(".timeline-dot");
        if (!dot) return 0;
        const timelineTop = timeline.getBoundingClientRect().top;
        const dotRect = dot.getBoundingClientRect();
        return (dotRect.top - timelineTop) + (dotRect.height / 2);
    }

    function endOffset() {
        const last = items[items.length - 1];
        const rect = last.getBoundingClientRect();
        return (rect.top - timeline.getBoundingClientRect().top) + rect.height;
    }

    async function runSequence() {

        if (started) return;
        started = true;

        if (reduceMotion) {
            items.forEach((item) => item.classList.add("year-in", "text-in"));
            fill.style.height = endOffset() + "px";
            finished = true;
            return;
        }

        for (let i = 0; i < items.length; i++) {

            /* 1) الخط يُرسم حتى نقطة هذه السنة ثم نتوقف حتى يكتمل رسمه */
            fill.style.height = dotOffset(items[i]) + "px";
            await wait(i === 0 ? 420 : 560);

            /* 2) تظهر السنة */
            items[i].classList.add("year-in");
            await wait(340);

            /* 3) يظهر النص، ثم ننتقل لإكمال الخط نحو السنة التالية */
            items[i].classList.add("text-in");
            await wait(430);
        }

        /* 4) الخط يكمل حتى نهاية آخر سنة */
        fill.style.height = endOffset() + "px";
        finished = true;
    }

    /* إعادة ضبط ارتفاع الخط عند تغيير حجم الشاشة بعد انتهاء الحركة */
    let resizeTimer;

    window.addEventListener("resize", function () {
        if (!finished) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            fill.style.transition = "none";
            fill.style.height = endOffset() + "px";
            requestAnimationFrame(() => { fill.style.transition = ""; });
        }, 200);
    });

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                runSequence();
                obs.disconnect();
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    observer.observe(timeline);

})();


/* =====================================================================
   بيانات الدورات
===================================================================== */

const coursesData = {

    "computer-present": {
        title: "الحاسوب - حضوري",
        category: "تقنية ومهارات رقمية",
        description: "دورة حضورية لتعلّم أساسيات الحاسوب وأهم برامج مايكروسوفت المكتبية، مع محاضرة مجانية عن الذكاء الاصطناعي.",
        duration: "شهر إلى شهر ونصف",
        hours: "34 ساعة تدريبية",
        seats: "10 مقاعد",
        trainer: "الست حوراء المياحي",
        price: "175,000 د.ع",
        priceNote: "شامل المنهج والحقيبة التدريبية",
        certificate: true
    },

    "computer-online": {
        title: "الحاسوب - إلكتروني",
        category: "تقنية ومهارات رقمية",
        description: "نفس محتوى دورة الحاسوب عن بُعد عبر محاضرات مسجّلة، مع اختبارات وتطبيق عملي ومتابعة مستمرة من المدرب.",
        duration: "دراسة ذاتية",
        hours: "محاضرات مسجلة بواقع 7 ساعات",
        seats: "غير محدود",
        trainer: "الست حوراء المياحي",
        price: "75,000 د.ع",
        certificate: true
    },

    "editing": {
        title: "المونتاج",
        category: "التصميم والإنتاج",
        description: "دورة عملية لتعلّم مبادئ المونتاج الاحترافي من القص والانتقالات وحتى التلوين والإخراج النهائي.",
        duration: "تحدد لاحقاً",
        hours: "تحدد لاحقاً",
        seats: "تحدد لاحقاً",
        trainer: "يحدد لاحقاً",
        price: "يحدد لاحقاً",
        certificate: true
    },

    "photography": {
        title: "التصوير",
        category: "التصميم والإنتاج",
        description: "دورة تصوير عملية تغطي إعدادات الكاميرا والتكوين والإضاءة، مع تطبيق داخل المركز وتدريب ميداني خارجي.",
        duration: "تحدد لاحقاً",
        hours: "تحدد لاحقاً",
        seats: "تحدد لاحقاً",
        trainer: "يحدد لاحقاً",
        price: "يحدد لاحقاً",
        certificate: true
    },

    "photoshop": {
        title: "التصميم الكرافيكي",
        category: "التصميم",
        description: "تشمل اساسيات التصميم وانشاء الهوية البصرية مع تطبيق عملي على Photoshop و Illustrator.",
        duration: "اسبوعين",
        hours: "12 ساعة تدريبية",
        seats: "15 مقاعد",
        trainer: "الاستاذ : منتظر قندي",
        price: "179,000 د.ع",
        certificate: true
    },

    "indesign": {
        title: "الاندزاين",
        category: "التصميم",
        description: "دورة تصميم المطبوعات باستخدام Adobe InDesign وإتقان نظام الهوامش والفهارس والإخراج الطباعي.",
        duration: "شهر إلى شهر ونصف",
        hours: "20 ساعة تدريبية",
        seats: "6 مقاعد",
        trainer: "الاستاذ آدم",
        price: "200,000 د.ع",
        certificate: true
    },

    "english": {
        title: "اللغة الإنجليزية",
        category: "اللغات",
        description: "دورة لغة إنجليزية بمنهج Oxford العالمي المعتمد، بأسلوب ممتع وعملي، بمسارين حسب الفئة العمرية.",
        trainer: "الست ايلاف هاني",
        certificate: true,
        tracks: [
            {
                id: "kids",
                label: "6 - 12 سنة",
                duration: "شهر ونصف",
                hours: "36 ساعة تدريبية",
                seats: "10 مقاعد",
                price: "150,000 د.ع",
                priceNote: "شامل كتاب المنهج والقرص"
            },
            {
                id: "teens",
                label: "13 - 17 سنة",
                duration: "شهرين",
                hours: "48 ساعة تدريبية",
                seats: "10 مقاعد",
                price: "200,000 د.ع",
                priceNote: "شامل كتاب المنهج والقرص"
            }
        ]
    },

    "persian": {
        title: "اللغة الفارسية",
        category: "اللغات",
        description: "برنامج لتعلّم اللغة الفارسية باعتماد منهج (احسان قبول) التعليمي، بإشراف مدربة من السفارة الإيرانية.",
        duration: "شهر ونصف",
        hours: "36 ساعة تدريبية",
        seats: "12 مقعد",
        trainer: "الست هدى يحيى",
        price: "225,000 د.ع",
        priceNote: "شامل المنهج والحقيبة التدريبية",
        certificate: true
    },

    "ai": {
        title: "الذكاء الاصطناعي",
        category: "التكنولوجيا الحديثة",
        description: "تعرّف على أساسيات الذكاء الاصطناعي وأبرز أدواته العملية مع نظرة على الثورة التكنولوجية الحالية.",
        duration: "تحدد لاحقاً",
        hours: "تحدد لاحقاً",
        seats: "تحدد لاحقاً",
        trainer: "يحدد لاحقاً",
        price: "يحدد لاحقاً",
        certificate: true
    },

    "cyber": {
        title: "الأمن السيبراني",
        category: "الأمن والتكنولوجيا",
        description: "دورة تطبيقية في أبرز الثغرات الأمنية بالمواقع ضمن مجال الفريق الأحمر (Red Team).",
        duration: "شهر إلى شهر ونصف",
        hours: "20 ساعة تدريبية",
        seats: "8 مقاعد",
        trainer: "المهندس محمد عصام",
        price: "150,000 د.ع",
        certificate: true
    },

    "marketing": {
        title: "التسويق الإلكتروني",
        category: "التسويق الرقمي",
        description: "تعلّم أساسيات التسويق الإلكتروني وإدارة الحملات الإعلانية وترويجها عبر المنصات الرقمية.",
        duration: "تحدد لاحقاً",
        hours: "تحدد لاحقاً",
        seats: "تحدد لاحقاً",
        trainer: "يحدد لاحقاً",
        price: "يحدد لاحقاً",
        certificate: true
    },

    "horse": {
        title: "الفروسية للأطفال",
        category: "برامج الأطفال",
        description: "برنامج للأطفال لتعلّم أساسيات ركوب الخيل والتعامل الآمن معه، بتدريب خارجي في أكاديمية آشور.",
        duration: "أسبوع واحد",
        hours: "12 ساعة تدريبية",
        seats: "6 مقاعد",
        trainer: "الاستاذ احمد",
        price: "75,000 د.ع",
        certificate: false
    }

};


/* =====================================================================
   بناء بطاقات الدورات (بدون صور — ستة مربعات Glass لكل بطاقة)
===================================================================== */

/* بيانات العرض الحالية للدورة مع مراعاة المسار المختار */
function getCourseView(courseId, trackId) {

    const course = coursesData[courseId];
    if (!course) return null;

    if (course.tracks && course.tracks.length) {

        const track = course.tracks.find((t) => t.id === trackId) || course.tracks[0];

        return {
            id: courseId,
            trackId: track.id,
            title: course.title,
            fullTitle: course.title + " (" + track.label + ")",
            category: course.category,
            description: course.description,
            duration: track.duration,
            hours: track.hours,
            seats: track.seats,
            trainer: course.trainer,
            price: track.price,
            priceNote: track.priceNote || "",
            certificate: course.certificate
        };
    }

    return {
        id: courseId,
        trackId: null,
        title: course.title,
        fullTitle: course.title,
        category: course.category,
        description: course.description,
        duration: course.duration,
        hours: course.hours,
        seats: course.seats,
        trainer: course.trainer,
        price: course.price,
        priceNote: course.priceNote || "",
        certificate: course.certificate
    };
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/* ═══════════════════════════════════════════════════════════════════
   ✏️ نصوص الشهادة — غيّرها من هنا وتتغيّر في كل الدورات
   ═══════════════════════════════════════════════════════════════════
   لتحديد أي دورة تمنح شهادة: ابحث عن اسم الدورة في coursesData بالأعلى
   وغيّر  certificate: true  إلى  certificate: false  أو العكس.
   ═══════════════════════════════════════════════════════════════════ */

const CERT_TEXT = {

    chipYes: "✓ يتوفر شهادة",   /* الشارة أسفل البطاقة عند وجود شهادة */
    chipNo:  "بدون شهادة",       /* الشارة أسفل البطاقة عند عدمها */

    boxYes:  "متوفرة",           /* داخل نافذة التفاصيل والمساعد الذكي */
    boxNo:   "غير متوفرة"

};


/* =====================================================================
   أيقونات مربعات تفاصيل الدورة (نيون)
   ✏️ لتغيير لون أي أيقونة عدّل المتغيّرات في style.css قسم V33
===================================================================== */

const FACT_ICONS = {

    /* ساعة رملية — المدة */
    duration:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M7 3h10M7 21h10M8 3v3.5a4 4 0 0 0 1.6 3.2L12 12l-2.4 2.3A4 4 0 0 0 8 17.5V21M16 3v3.5a4 4 0 0 1-1.6 3.2L12 12l2.4 2.3a4 4 0 0 1 1.6 3.2V21"/></svg>',

    /* ساعة حائط — الساعات التدريبية */
    hours:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg>',

    /* مقاعد — عدد المقاعد */
    seats:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><path d="M4 11h16a1 1 0 0 1 1 1v4H3v-4a1 1 0 0 1 1-1z"/><path d="M6 16v3M18 16v3"/></svg>',

    /* مدرّب — المدرب/ة */
    trainer:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="8" r="3.4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>',

    /* عملة — السعر */
    price:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="12" r="9"/><path d="M15 9.2a3.2 3.2 0 0 0-3-1.7c-1.7 0-2.8.9-2.8 2.1 0 3 6 1.6 6 4.6 0 1.3-1.2 2.3-3 2.3a3.3 3.3 0 0 1-3.2-1.9M12 6v12"/></svg>',

    /* وسام — الشهادة */
    cert:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="9" r="5"/><path d="m8.5 13.4-1 7.1L12 18l4.5 2.5-1-7.1"/><path d="m10.2 9 1.3 1.4 2.4-2.6"/></svg>'
};


/* المربعات الستة */
function buildFactsHtml(view) {

    const certText  = view.certificate ? CERT_TEXT.boxYes : CERT_TEXT.boxNo;
    const certClass = view.certificate ? "yes" : "no";

    /* أيقونة نيون لكل مربع — التصميم SVG حتى تبقى واضحة على كل الأجهزة */
    const ico = function (name) {
        return '<span class="fact-ico ico-' + name + '" aria-hidden="true">' + FACT_ICONS[name] + '</span>';
    };

    return `
        <div class="course-fact fact-duration">
            <div class="course-fact-head">${ico("duration")} المدة</div>
            <strong>${escapeHtml(view.duration)}</strong>
        </div>

        <div class="course-fact fact-hours">
            <div class="course-fact-head">${ico("hours")} الساعات التدريبية</div>
            <strong>${escapeHtml(view.hours)}</strong>
        </div>

        <div class="course-fact fact-seats">
            <div class="course-fact-head">${ico("seats")} عدد المقاعد</div>
            <strong>${escapeHtml(view.seats)}</strong>
        </div>

        <div class="course-fact fact-trainer">
            <div class="course-fact-head">${ico("trainer")} المدرب/ة</div>
            <strong>${escapeHtml(view.trainer)}</strong>
        </div>

        <div class="course-fact is-price fact-price">
            <div class="course-fact-head">${ico("price")} السعر</div>
            <strong>${escapeHtml(view.price)}</strong>
        </div>

        <div class="course-fact is-cert fact-cert">
            <div class="course-fact-head">${ico("cert")} الشهادة</div>
            <strong class="${certClass}">${certText}</strong>
        </div>
    `;
}

function renderCourses() {

    const grid = document.getElementById("coursesGrid");
    if (!grid) return;

    const ids = Object.keys(coursesData);
    grid.innerHTML = "";

    ids.forEach((courseId, index) => {

        const course = coursesData[courseId];
        const view = getCourseView(courseId, null);

        const card = document.createElement("article");
        card.className = "course-card reveal";
        card.style.setProperty("--d", ((index % 3) * 0.09) + "s");
        card.dataset.course = courseId;
        if (view.trackId) card.dataset.track = view.trackId;

        let pillsHtml = "";

        if (course.tracks && course.tracks.length) {
            pillsHtml = '<div class="course-track-pills">' +
                course.tracks.map((track, i) =>
                    `<button type="button" class="course-track-pill${i === 0 ? " active" : ""}" data-track="${track.id}">${escapeHtml(track.label)}</button>`
                ).join("") +
                "</div>";
        }

        card.innerHTML = `
            <div class="course-card-top">
                <span class="course-category">${escapeHtml(view.category)}</span>
                <span class="course-index">${String(index + 1).padStart(2, "0")}</span>
            </div>

            <h3>${escapeHtml(view.title)}</h3>
            <p class="course-desc">${escapeHtml(view.description)}</p>

            ${pillsHtml}

            <div class="course-facts">${buildFactsHtml(view)}</div>

            <button class="course-register-btn" type="button">
                <span>التسجيل في هذه الدورة</span>
                <b>←</b>
            </button>
        `;

        /* مبدّل الفئة العمرية داخل البطاقة */
        card.querySelectorAll(".course-track-pill").forEach((pill) => {
            pill.addEventListener("click", function () {

                const trackId = pill.dataset.track;
                card.dataset.track = trackId;

                card.querySelectorAll(".course-track-pill")
                    .forEach((p) => p.classList.toggle("active", p === pill));

                const updated = getCourseView(courseId, trackId);
                card.querySelector(".course-facts").innerHTML = buildFactsHtml(updated);
            });
        });

        /* زر التسجيل */
        card.querySelector(".course-register-btn").addEventListener("click", function () {
            openRegistration(courseId, card.dataset.track || null);
        });

        grid.appendChild(card);
    });

    observeReveals(grid);
}

renderCourses();


/* =====================================================================
   نافذة التسجيل + نافذة الدفع
===================================================================== */

let activeView    = null;   /* الدورة المختارة حالياً */
let paymentMethod = null;   /* زين كاش أو كي كارد */

function showModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}

function hideModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");

    const stillOpen = ["registrationModal", "paymentModal"].some((mid) => {
        const el = document.getElementById(mid);
        return el && el.classList.contains("active");
    });

    if (!stillOpen) document.body.classList.remove("modal-open");
}

/* ---------- فتح نافذة التسجيل ---------- */

function openRegistration(courseId, trackId) {

    const view = getCourseView(courseId, trackId);
    if (!view) return;

    activeView = view;
    paymentMethod = null;

    document.getElementById("regCourseName").textContent  = view.fullTitle;
    document.getElementById("regCoursePrice").textContent = view.price;
    document.getElementById("regCourseNote").textContent  = view.priceNote || "";

    /* لمكافحة البوتات: نسجّل وقت فتح النموذج — أي إرسال أسرع من
       ثانيتين تقريباً يكون شبه مؤكد أنه بوت آلي وليس شخصاً حقيقياً */
    regFormOpenedAt = Date.now();

    showModal("registrationModal");
}

/* توقيت فتح نموذج التسجيل — يُستخدم في isLikelyBot() بالأسفل */
let regFormOpenedAt = 0;

/* فحص بسيط لمكافحة البوتات: حقل فخّ فارغ إجبارياً + مهلة دنيا للتعبئة.
   عند الاشتباه نرجّع true بهدوء دون أي رسالة خطأ تكشف الفحص للبوت. */
function isLikelyBot(honeypotId, openedAt, minMs) {
    const trap = document.getElementById(honeypotId);
    if (trap && trap.value.trim() !== "") return true;
    if (openedAt && (Date.now() - openedAt) < (minMs || 1500)) return true;
    return false;
}

function closeRegistration() {
    hideModal("registrationModal");
    resetRegistrationForm();
    activeView = null;
}

function resetRegistrationForm() {

    const form = document.getElementById("registrationForm");
    if (form) form.reset();

    ["regName", "regPhone", "regBirthDay", "regBirthMonth", "regBirthYear"].forEach((id) => {
        const field = document.getElementById(id);
        if (field) {
            field.classList.remove("invalid");
            if (field.tagName === "SELECT") field.selectedIndex = 0;
        }
    });

    ["errName", "errPhone", "errBirthdate"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = "";
    });

    paymentMethod = null;

    document.querySelectorAll(".payment-method").forEach((m) => m.classList.remove("selected"));

    const confirmBtn = document.getElementById("paymentConfirmBtn");
    if (confirmBtn) confirmBtn.classList.remove("show");
}


/* ---------- التحقق من البيانات ---------- */

function setFieldError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (error) error.textContent = message;
    if (field) field.classList.toggle("invalid", Boolean(message));
}

function validateRegistration() {

    /* فحص البوتات أولاً — بهدوء وبدون أي رسالة خطأ تكشف وجود الفحص */
    if (isLikelyBot("regWebsite", regFormOpenedAt)) return false;

    let valid = true;

    /* الاسم الثلاثي بالعربية */
    const name = document.getElementById("regName").value.trim().replace(/\s+/g, " ");
    const arabicOnly = /^[\u0621-\u064A\u0670-\u06D3\u0640\s]+$/;
    const parts = name.split(" ").filter(Boolean);

    if (!name) {
        setFieldError("regName", "errName", "يرجى إدخال الاسم الثلاثي");
        valid = false;
    } else if (!arabicOnly.test(name)) {
        setFieldError("regName", "errName", "يرجى كتابة الاسم باللغة العربية فقط");
        valid = false;
    } else if (parts.length < 3) {
        setFieldError("regName", "errName", "يرجى إدخال الاسم الثلاثي كاملاً");
        valid = false;
    } else {
        setFieldError("regName", "errName", "");
    }

    /* رقم الهاتف */
    const phone = document.getElementById("regPhone").value.trim().replace(/[\s-]/g, "");
    if (!/^07[3-9][0-9]{8}$/.test(phone)) {
        setFieldError("regPhone", "errPhone", "أدخل رقم هاتف عراقي صحيح مثل 07XXXXXXXXX");
        valid = false;
    } else {
        setFieldError("regPhone", "errPhone", "");
    }

    /* تاريخ الميلاد (يوم / شهر / سنة) */
    const day   = document.getElementById("regBirthDay").value;
    const month = document.getElementById("regBirthMonth").value;
    const year  = document.getElementById("regBirthYear").value;

    const birthSelects = ["regBirthDay", "regBirthMonth", "regBirthYear"];

    if (!day || !month || !year) {
        birthSelects.forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle("invalid", !el.value);
        });
        const err = document.getElementById("errBirthdate");
        if (err) err.textContent = "يرجى تحديد تاريخ الميلاد كاملاً";
        valid = false;
    } else if (!isRealDate(Number(day), Number(month), Number(year))) {
        birthSelects.forEach((id) => document.getElementById(id).classList.add("invalid"));
        document.getElementById("errBirthdate").textContent = "التاريخ المُدخل غير صحيح";
        valid = false;
    } else {
        birthSelects.forEach((id) => document.getElementById(id).classList.remove("invalid"));
        document.getElementById("errBirthdate").textContent = "";
    }

    if (!valid) {
        const firstInvalid = document.querySelector("#registrationModal .invalid");
        if (firstInvalid) firstInvalid.focus();
    }

    return valid;
}

function isRealDate(day, month, year) {
    const d = new Date(year, month - 1, day);
    return d.getFullYear() === year && (d.getMonth() + 1) === month && d.getDate() === day;
}

function getRegistrationData() {

    const day   = document.getElementById("regBirthDay").value;
    const month = document.getElementById("regBirthMonth").value;
    const year  = document.getElementById("regBirthYear").value;

    let formattedDate = "";

    if (day && month && year) {
        formattedDate = String(day).padStart(2, "0") + "/" +
                        String(month).padStart(2, "0") + "/" + year;
    }

    return {
        name: document.getElementById("regName").value.trim().replace(/\s+/g, " "),
        phone: document.getElementById("regPhone").value.trim().replace(/[\s-]/g, ""),
        birthdate: formattedDate
    };
}


/* ---------- بناء وإرسال رسالة الواتساب ---------- */

function buildWhatsAppMessage(paymentStatus) {

    const data = getRegistrationData();

    const priceLine = activeView.priceNote
        ? activeView.price + " (" + activeView.priceNote + ")"
        : activeView.price;

    const SEP = "━━━━━━━━━━━━━━━";

    /* موعد بدء الدورة وعدد المقاعد إن كانا محدَّدين */
    let startLine = "";
    let seatsLine = "";

    try {
        if (typeof getCourseMeta === "function") {

            const meta = getCourseMeta(activeView.id);

            if (meta.dateText && meta.dateText.trim()) {
                startLine = meta.dateText.trim();
            } else if (meta.startDate && typeof courseDateInfo === "function") {
                const info = courseDateInfo(meta.startDate);
                if (info) startLine = info.full;
            }

            if (meta.seatsText && meta.seatsText.trim()) {
                seatsLine = meta.seatsText.trim();
            } else if (meta.seatsLeft && typeof seatsText === "function") {
                seatsLine = seatsText(meta.seatsLeft);
            }
        }
    } catch (e) { /* تجاهل */ }

    /* تاريخ إرسال الطلب */
    const now = new Date();
    const sentAt = now.toLocaleDateString("ar-IQ-u-nu-latn", {
        year: "numeric", month: "long", day: "numeric"
    }) + " - " + now.toLocaleTimeString("ar-IQ-u-nu-latn", {
        hour: "2-digit", minute: "2-digit"
    });

    const lines = [];

    lines.push("🎓 *طلب تسجيل في دورة تدريبية*");
    lines.push("مركز كربلاء لتكنولوجيا المعلومات");
    lines.push("");

    lines.push(SEP);
    lines.push("📚 *تفاصيل الدورة*");
    lines.push("• الدورة: " + activeView.fullTitle);
    if (activeView.category)    lines.push("• المجال: " + activeView.category);
    if (activeView.duration)    lines.push("• المدة: " + activeView.duration);
    if (activeView.trainer)     lines.push("• المدرب: " + activeView.trainer);
    if (startLine)              lines.push("• موعد البدء: " + startLine);
    if (seatsLine)              lines.push("• المقاعد: " + seatsLine);
    lines.push("• الرسوم: " + priceLine);
    if (activeView.certificate !== undefined) {
        lines.push("• الشهادة: " + (activeView.certificate ? "متوفرة" : "غير متوفرة"));
    }
    lines.push("");

    lines.push(SEP);
    lines.push("👤 *بيانات المتدرب*");
    lines.push("• الاسم الثلاثي: " + data.name);
    lines.push("• رقم الهاتف (واتساب): " + data.phone);
    lines.push("• تاريخ الميلاد: " + data.birthdate);
    lines.push("");

    lines.push(SEP);
    lines.push("💳 *حالة الدفع:* " + paymentStatus);
    lines.push("🕒 *تاريخ إرسال الطلب:* " + sentAt);
    lines.push("");

    lines.push("أرجو تأكيد تسجيلي في الدورة وتزويدي بموعد البدء وتفاصيل الحضور.");
    lines.push("شكراً لكم 🌟");

    return lines.join("\n");
}

function openWhatsApp(message) {
    const url = "https://wa.me/" + CENTER_WHATSAPP_INTL + "?text=" + encodeURIComponent(message);
    window.open(url, "_blank", "noopener");
}

/* الزر الأول: إرسال طلب التسجيل (بدون دفع) */
function sendRegistrationWhatsApp() {

    if (!activeView) return;
    if (!validateRegistration()) return;

    const data = getRegistrationData();
    const message = buildWhatsAppMessage("لم يتم الدفع بعد — أرجو التنسيق معي لإكمال الاشتراك");

    saveRegistrationRecord({
        type: "دورة",
        course: activeView.fullTitle,
        price: activeView.price,
        paid: false,
        paymentMethod: "-",
        name: data.name,
        phone: data.phone,
        birthdate: data.birthdate,
        createdAt: new Date().toISOString()
    });

    openWhatsApp(message);
    closeRegistration();
}

/* الزر الثاني: الدفع الآن */
function openPayment() {

    if (!activeView) return;
    if (!validateRegistration()) return;

    document.getElementById("paymentCourseName").textContent  = activeView.fullTitle;
    document.getElementById("paymentCoursePrice").textContent = activeView.price;

    paymentMethod = null;
    document.querySelectorAll(".payment-method").forEach((m) => m.classList.remove("selected"));
    document.getElementById("paymentConfirmBtn").classList.remove("show");

    hideModal("registrationModal");
    showModal("paymentModal");
}

function closePayment() {
    hideModal("paymentModal");
    resetRegistrationForm();
    activeView = null;
}

function backToRegistration() {
    hideModal("paymentModal");
    showModal("registrationModal");
}

function selectPayment(method) {

    paymentMethod = (method === "zain") ? "زين كاش" : "كي كارد";

    const zain = document.getElementById("payZain");
    const qi   = document.getElementById("payQi");

    if (zain) zain.classList.toggle("selected", method === "zain");
    if (qi)   qi.classList.toggle("selected", method === "qi");

    document.getElementById("paymentConfirmBtn").classList.add("show");
}

function sendPaymentWhatsApp() {

    if (!activeView || !paymentMethod) return;

    const data = getRegistrationData();
    const message = buildWhatsAppMessage("طلب دفع عبر " + paymentMethod + " — بانتظار تأكيد المركز");

    saveRegistrationRecord({
        type: "دورة",
        course: activeView.fullTitle,
        price: activeView.price,
        paid: true,
        paymentMethod: paymentMethod,
        name: data.name,
        phone: data.phone,
        birthdate: data.birthdate,
        createdAt: new Date().toISOString()
    });

    openWhatsApp(message);
    closePayment();
}

/* شعارات الدفع: بديل نصي إذا لم تتوفر الصورة */
document.querySelectorAll(".payment-logo img").forEach((img) => {
    img.addEventListener("error", function () {
        const box = img.closest(".payment-logo");
        if (box) box.classList.add("no-image");
    });
});


/* =====================================================================
   تخزين مؤقت للطلبات داخل المتصفح
   (يُستبدل لاحقاً بطلب فعلي إلى خادم المركز)
===================================================================== */

const REGISTRATIONS_STORAGE_KEY = "karbala_it_registrations";

function saveRegistrationRecord(record) {
    try {
        const existing = JSON.parse(localStorage.getItem(REGISTRATIONS_STORAGE_KEY) || "[]");
        existing.push(record);
        localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(existing));
    } catch (e) {
        console.warn("تعذر حفظ بيانات التسجيل محلياً:", e);
    }
}

function getAllRegistrations() {
    try {
        return JSON.parse(localStorage.getItem(REGISTRATIONS_STORAGE_KEY) || "[]");
    } catch (e) {
        return [];
    }
}


/* =====================================================================
   بيانات القاعات
===================================================================== */

const hallsData = {

    /* =================================================================
       ✏️ قاعات المركز — عدّل من هنا
       • price: اتركه "" ليظهر «يُحدد عند الطلب» بدل السعر
         وعند تحديد السعر اكتبه هكذا: "15,000 د.ع"
       • features: قائمة تجهيزات القاعة كما تظهر في البطاقة
    ================================================================= */

    "hall1": {
        title: "قاعة الاجتماعات",
        label: "قاعة اجتماعات",
        description: "قاعة هادئة ومناسبة للاجتماعات واللقاءات والجلسات الصغيرة.",
        price: "",
        seats: "7 مقاعد",
        hospitality: "مجانية",
        features: ["شاشة عرض", "تكييف", "إنترنت", "ضيافة مجانية"],
        images: [
            "images/halls/hall-1/1.jpg", "images/halls/hall-1/2.jpg", "images/halls/hall-1/3.jpg",
            "images/halls/hall-1/4.jpg", "images/halls/hall-1/5.jpg"
        ]
    },

    "hall2": {
        title: "قاعة التدريب",
        label: "قاعة تدريب",
        description: "قاعة مجهزة بالحواسيب وشاشة تفاعلية ذكية، مثالية للدورات التدريبية والورش.",
        price: "",
        seats: "15 مقعداً",
        hospitality: "مجانية",
        features: ["حواسيب", "شاشة تفاعلية ذكية", "تكييف", "إنترنت", "ضيافة مجانية"],
        images: [
            "images/halls/hall-2/1.jpg", "images/halls/hall-2/2.jpg", "images/halls/hall-2/3.jpg",
            "images/halls/hall-2/4.jpg", "images/halls/hall-2/5.jpg"
        ]
    },

    "hall3": {
        title: "قاعة التدريب الثانية",
        label: "قاعة تدريب",
        description: "قاعة تدريبية مرنة يمكن زيادة عدد مقاعدها حسب حجم المجموعة.",
        price: "",
        seats: "8 مقاعد (قابلة للزيادة)",
        hospitality: "مجانية",
        features: ["سبورتان وايت بورد", "شاشة عرض", "تكييف", "إنترنت", "ضيافة مجانية"],
        images: [
            "images/halls/hall-3/1.jpg", "images/halls/hall-3/2.jpg", "images/halls/hall-3/3.jpg",
            "images/halls/hall-3/4.jpg", "images/halls/hall-3/5.jpg"
        ]
    },

    "hall4": {
        title: "قاعة الاجتماعات الصغيرة",
        label: "اجتماع عمل",
        description: "مساحة خاصة لأربعة أشخاص، مناسبة لاجتماعات العمل والجلسات المركّزة.",
        price: "",
        seats: "4 مقاعد منفصلة",
        hospitality: "مجانية",
        features: ["حاسوب", "تكييف", "إنترنت", "ضيافة مجانية"],

        images: [
            "images/halls/hall-4/1.jpg", "images/halls/hall-4/2.jpg", "images/halls/hall-4/3.jpg",
            "images/halls/hall-4/4.jpg", "images/halls/hall-4/5.jpg"
        ]
    }
};

let currentHall = null;
let currentImageIndex = 0;

function openHallModal(hallId) {

    const hall = hallsData[hallId];
    if (!hall) return;

    currentHall = hall;
    currentImageIndex = 0;

    document.getElementById("modalHallTitle").textContent       = hall.title;
    document.getElementById("modalHallLabel").textContent       = hall.label;
    document.getElementById("modalHallDescription").textContent = hall.description;
    document.getElementById("modalHallPrice").textContent       = hall.price || "يُحدد عند الطلب";
    document.getElementById("modalHallSeats").textContent       = hall.seats;
    document.getElementById("modalHallHospitality").textContent = hall.hospitality;

    updateHallImage();
    createHallThumbnails();

    document.getElementById("hallModal").classList.add("active");
    document.body.classList.add("modal-open");
}

function closeHallModal() {
    const modal = document.getElementById("hallModal");
    if (!modal) return;
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
}

function updateHallImage() {
    document.getElementById("modalMainImage").src = currentHall.images[currentImageIndex];
}

function createHallThumbnails() {

    const container = document.getElementById("modalThumbnails");
    container.innerHTML = "";

    currentHall.images.forEach((image, index) => {

        const thumbnail = document.createElement("img");
        thumbnail.src = image;
        thumbnail.alt = "صورة القاعة";
        if (index === currentImageIndex) thumbnail.classList.add("active");

        thumbnail.addEventListener("click", () => {
            currentImageIndex = index;
            updateHallImage();
            createHallThumbnails();
        });

        container.appendChild(thumbnail);
    });
}

function nextHallImage() {
    if (!currentHall) return;
    currentImageIndex = (currentImageIndex + 1) % currentHall.images.length;
    updateHallImage();
    createHallThumbnails();
}

function previousHallImage() {
    if (!currentHall) return;
    currentImageIndex = (currentImageIndex - 1 + currentHall.images.length) % currentHall.images.length;
    updateHallImage();
    createHallThumbnails();
}


/* =====================================================================
   إغلاق النوافذ والقائمة بمفتاح Escape
===================================================================== */

document.addEventListener("keydown", function (event) {

    if (event.key !== "Escape") return;

    const paymentModal = document.getElementById("paymentModal");
    const regModal     = document.getElementById("registrationModal");
    const hallModal    = document.getElementById("hallModal");

    if (paymentModal && paymentModal.classList.contains("active")) {
        closePayment();
    } else if (regModal && regModal.classList.contains("active")) {
        closeRegistration();
    } else if (hallModal && hallModal.classList.contains("active")) {
        closeHallModal();
    } else {
        closeMenu();
    }
});


/* =====================================================================
   دعم ارتفاع الشاشة على الهاتف
===================================================================== */

(function setupMobileViewport() {

    function updateViewportHeight() {
        const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        document.documentElement.style.setProperty("--app-vh", (vh * 0.01) + "px");
    }

    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight, { passive: true });

    if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", updateViewportHeight, { passive: true });
    }

})();

/* =====================================================================
   V4 — تحسينات إضافية
===================================================================== */


/* ---------------------------------------------------------------------
   1) تعبئة قوائم تاريخ الميلاد (يوم / شهر / سنة)
--------------------------------------------------------------------- */

(function buildBirthdateSelects() {

    const daySel   = document.getElementById("regBirthDay");
    const monthSel = document.getElementById("regBirthMonth");
    const yearSel  = document.getElementById("regBirthYear");

    if (!daySel || !monthSel || !yearSel) return;

    const months = [
        "كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران",
        "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"
    ];

    function addOption(select, value, label) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        select.appendChild(option);
    }

    addOption(daySel, "", "اليوم");
    for (let d = 1; d <= 31; d++) addOption(daySel, d, d);

    addOption(monthSel, "", "الشهر");
    months.forEach((name, i) => addOption(monthSel, i + 1, name));

    const nowYear = new Date().getFullYear();
    addOption(yearSel, "", "السنة");
    for (let y = nowYear - 4; y >= 1940; y--) addOption(yearSel, y, y);

    /* إزالة علامة الخطأ فور الاختيار */
    [daySel, monthSel, yearSel].forEach((sel) => {
        sel.addEventListener("change", function () {
            sel.classList.remove("invalid");
            sel.classList.toggle("has-value", Boolean(sel.value));
            const err = document.getElementById("errBirthdate");
            if (err) err.textContent = "";
        });
    });

})();


/* ---------------------------------------------------------------------
   2) إزالة علامة الخطأ عن الحقول أثناء الكتابة
--------------------------------------------------------------------- */

(function liveFieldReset() {

    const pairs = [
        ["regName", "errName"],
        ["regPhone", "errPhone"]
    ];

    pairs.forEach(function (pair) {
        const field = document.getElementById(pair[0]);
        const error = document.getElementById(pair[1]);
        if (!field) return;

        field.addEventListener("input", function () {
            field.classList.remove("invalid");
            if (error) error.textContent = "";
        });
    });

    /* حقل الهاتف: أرقام فقط */
    const phone = document.getElementById("regPhone");
    if (phone) {
        phone.addEventListener("input", function () {
            phone.value = phone.value.replace(/[^0-9]/g, "").slice(0, 11);
        });
    }

})();


/* ---------------------------------------------------------------------
   3) شريط تقدّم القراءة أعلى الصفحة
--------------------------------------------------------------------- */

(function scrollProgress() {

    const bar = document.getElementById("scrollProgressBar");
    if (!bar) return;

    let ticking = false;

    function update() {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        const value = max > 0 ? (doc.scrollTop / max) * 100 : 0;
        bar.style.width = value + "%";
        ticking = false;
    }

    window.addEventListener("scroll", function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    }, { passive: true });

    update();

})();


/* ---------------------------------------------------------------------
   4) تتبّع القسم الحالي وتفعيله داخل القائمة
--------------------------------------------------------------------- */

(function scrollSpy() {

    const links = Array.from(document.querySelectorAll(".menu-links a[href^='#']"));
    if (!links.length) return;

    const map = new Map();

    links.forEach(function (link) {
        const section = document.querySelector(link.getAttribute("href"));
        if (section) map.set(section, link);
    });

    if (!map.size) return;

    let activeLink = null;

    const spy = new IntersectionObserver(function (entries) {

        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;

            const link = map.get(entry.target);
            if (!link || link === activeLink) return;

            links.forEach((l) => l.classList.remove("is-active"));
            link.classList.add("is-active");
            activeLink = link;
        });

    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    map.forEach(function (link, section) { spy.observe(section); });

})();


/* ---------------------------------------------------------------------
   5) تدرّج ظهور عناصر الشبكات (Stagger)
--------------------------------------------------------------------- */

(function staggerGrids() {

    const groups = document.querySelectorAll(
        ".courses-grid, .halls-grid, .about-cards, .stats-grid, .contact-grid, .mission-grid"
    );

    groups.forEach(function (group) {
        Array.from(group.children).forEach(function (child, i) {
            if (!child.style.getPropertyValue("--d")) {
                child.style.setProperty("--d", (i % 6) * 0.07 + "s");
            }
        });
    });

})();


/* ---------------------------------------------------------------------
   7) إغلاق النافذة بالسحب للأسفل على الهاتف
--------------------------------------------------------------------- */

(function sheetSwipeToClose() {

    const sheets = [
        { id: "registrationModal", close: function () { closeRegistration(); } },
        { id: "paymentModal",      close: function () { closePayment(); } }
    ];

    sheets.forEach(function (item) {

        const modal = document.getElementById(item.id);
        if (!modal) return;

        const card = modal.querySelector(".modal-card");
        if (!card) return;

        let startY = 0;
        let deltaY = 0;
        let dragging = false;

        card.addEventListener("touchstart", function (event) {
            if (window.innerWidth > 699) return;
            if (card.scrollTop > 0) return;

            const scroller = card.querySelector(".modal-scroll");
            if (scroller && scroller.contains(event.target) && scroller.scrollTop > 0) return;

            startY = event.touches[0].clientY;
            deltaY = 0;
            dragging = true;
            card.style.transition = "none";
        }, { passive: true });

        card.addEventListener("touchmove", function (event) {
            if (!dragging) return;
            deltaY = event.touches[0].clientY - startY;
            if (deltaY > 0) card.style.transform = "translateY(" + deltaY + "px)";
        }, { passive: true });

        card.addEventListener("touchend", function () {
            if (!dragging) return;
            dragging = false;
            card.style.transition = "";
            card.style.transform = "";
            if (deltaY > 110) item.close();
        });

    });

})();

/* =====================================================================
   V6 — تحسينات النوافذ والقائمة
===================================================================== */

/* ---------------------------------------------------------------------
   1) قفل تمرير الصفحة بدون قفزة عند فتح أي نافذة أو القائمة
      (هذه كانت مشكلة النوافذ: الصفحة ترجع للأعلى بعد الإغلاق)
--------------------------------------------------------------------- */

(function scrollLockManager() {

    let lockedY = 0;
    let isLocked = false;

    function anyOpen() {
        return document.body.classList.contains("modal-open")
            || document.body.classList.contains("menu-open");
    }

    function lock() {
        if (isLocked) return;
        lockedY = window.scrollY || window.pageYOffset || 0;
        document.body.style.top = (-lockedY) + "px";
        document.body.classList.add("scroll-locked");
        isLocked = true;
    }

    function unlock() {
        if (!isLocked) return;
        document.body.classList.remove("scroll-locked");
        document.body.style.top = "";
        isLocked = false;

        const behavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = "auto";
        window.scrollTo(0, lockedY);
        document.documentElement.style.scrollBehavior = behavior;
    }

    function sync() { anyOpen() ? lock() : unlock(); }

    new MutationObserver(sync).observe(document.body, {
        attributes: true,
        attributeFilter: ["class"]
    });

    sync();

})();


/* ---------------------------------------------------------------------
   2) زر القائمة يفتح ويغلق (Toggle) + إغلاق بالسحب لليسار
--------------------------------------------------------------------- */

(function menuUpgrade() {

    const button = document.getElementById("menuButton");
    const menu   = document.getElementById("sideMenu");
    if (!button || !menu) return;

    button.addEventListener("click", function (event) {
        if (menu.classList.contains("active")) {
            event.stopImmediatePropagation();
            closeMenu();
        }
    }, true);

    /* السحب لليسار يغلق القائمة على الهاتف */
    let startX = 0;
    let deltaX = 0;
    let dragging = false;

    menu.addEventListener("touchstart", function (e) {
        startX = e.touches[0].clientX;
        deltaX = 0;
        dragging = true;
    }, { passive: true });

    menu.addEventListener("touchmove", function (e) {
        if (!dragging) return;
        deltaX = e.touches[0].clientX - startX;
        if (deltaX < 0) {
            menu.style.transition = "none";
            menu.style.transform = "translateX(" + deltaX + "px)";
        }
    }, { passive: true });

    menu.addEventListener("touchend", function () {
        if (!dragging) return;
        dragging = false;
        menu.style.transition = "";
        menu.style.transform = "";
        if (deltaX < -70) closeMenu();
    });

})();


/* ---------------------------------------------------------------------
   3) التنقّل السلس عند الضغط على روابط القائمة
      (الإغلاق أولاً ثم الانتقال حتى لا يحدث اهتزاز)
--------------------------------------------------------------------- */

(function smoothMenuNavigation() {

    document.querySelectorAll(".menu-links a[href^='#']").forEach(function (link) {

        link.addEventListener("click", function (event) {

            const target = document.querySelector(link.getAttribute("href"));
            if (!target) return;

            event.preventDefault();
            closeMenu();

            setTimeout(function () {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 260);
        });

    });

})();


/* ---------------------------------------------------------------------
   4) حصر التركيز داخل النافذة المفتوحة (وصولية أفضل)
--------------------------------------------------------------------- */

(function focusTrap() {

    const SELECTOR = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function activeContainer() {
        return document.querySelector(".modal-shell.active .modal-card")
            || document.querySelector(".hall-modal.active .hall-modal-content")
            || (document.querySelector(".side-menu.active") || null);
    }

    document.addEventListener("keydown", function (event) {

        if (event.key !== "Tab") return;

        const container = activeContainer();
        if (!container) return;

        const items = Array.from(container.querySelectorAll(SELECTOR))
            .filter((el) => el.offsetParent !== null);

        if (!items.length) return;

        const first = items[0];
        const last  = items[items.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });

})();


/* ---------------------------------------------------------------------
   5) إغلاق نافذة القاعات عند النقر خارجها + دعم لوحة المفاتيح
--------------------------------------------------------------------- */

(function hallModalUx() {

    const modal = document.getElementById("hallModal");
    if (!modal) return;

    document.addEventListener("keydown", function (event) {
        if (!modal.classList.contains("active")) return;
        if (event.key === "ArrowLeft")  nextHallImage();
        if (event.key === "ArrowRight") previousHallImage();
    });

})();


/* =====================================================================
   =====================================================================
   V8 — إضافات جديدة
   1) تسجيل تطبيق الويب (PWA)
   2) فلترة وبحث الدورات
   3) بطاقة الفعالية القادمة مع عدّاد تنازلي وإضافة للتقويم
   4) اختبار «أي دورة تناسبك؟»
   5) ربط المساعد الذكي بالتسجيل والاختبار
   =====================================================================
===================================================================== */


/* ---------------------------------------------------------------------
   1) تسجيل الـ Service Worker (يعمل عند رفع الموقع على استضافة أو
      عند تشغيله من سيرفر محلي — لا يعمل بفتح الملف مباشرة)
--------------------------------------------------------------------- */

(function registerServiceWorker() {

    if (!("serviceWorker" in navigator)) return;
    if (location.protocol === "file:") return;

    window.addEventListener("load", function () {
        navigator.serviceWorker.register("sw.js").catch(function (e) {
            console.warn("تعذر تسجيل Service Worker:", e);
        });
    });

})();


/* ---------------------------------------------------------------------
   2) فلترة وبحث الدورات
--------------------------------------------------------------------- */

const COURSE_GROUPS = {
    all:       { label: "كل الدورات", ids: null },
    tech:      { label: "تقنية وبرمجة", ids: ["computer-present", "computer-online", "ai", "cyber"] },
    design:    { label: "تصميم وإنتاج", ids: ["editing", "photography", "photoshop", "indesign"] },
    languages: { label: "اللغات",       ids: ["persian", "english"] },
    marketing: { label: "التسويق",      ids: ["marketing"] },
    kids:      { label: "برامج الأطفال", ids: ["horse", "english"] }
};

(function coursesFilter() {

    const toolbar = document.getElementById("coursesToolbar");
    const grid    = document.getElementById("coursesGrid");
    const empty   = document.getElementById("coursesEmpty");

    if (!toolbar || !grid) return;

    toolbar.className = "courses-toolbar reveal";
    toolbar.innerHTML = `
        <div class="courses-search">
            <span aria-hidden="true">⌕</span>
            <input type="search" id="courseSearch" placeholder="ابحث عن دورة… مثال: حاسوب، انكليزي،  تصميم كرافيكي... "
                   aria-label="بحث في الدورات" autocomplete="off">
        </div>

        <div class="courses-filters" id="coursesFilters" role="tablist"></div>

        <button type="button" class="courses-quiz-btn" id="openQuizBtn">
            <span aria-hidden="true">✦</span>
            <span>أي دورة تناسبك؟</span>
        </button>
    `;

    const filtersBox = toolbar.querySelector("#coursesFilters");
    const searchInput = toolbar.querySelector("#courseSearch");

    Object.keys(COURSE_GROUPS).forEach(function (key, i) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "courses-filter" + (i === 0 ? " active" : "");
        btn.dataset.group = key;
        btn.textContent = COURSE_GROUPS[key].label;
        filtersBox.appendChild(btn);
    });

    let activeGroup = "all";

    function normalizeText(t) {
        return String(t || "")
            .replace(/[ً-ْٰ]/g, "")
            .replace(/[أإآٱ]/g, "ا")
            .replace(/ى/g, "ي")
            .replace(/ة/g, "ه")
            .trim().toLowerCase();
    }

    function apply() {

        const query = normalizeText(searchInput.value);
        const ids = COURSE_GROUPS[activeGroup].ids;
        let visible = 0;

        Array.from(grid.children).forEach(function (card) {

            const id = card.dataset.course;
            const course = coursesData[id] || {};

            const haystack = normalizeText([
                course.title, course.description, course.category, course.trainer
            ].join(" "));

            const matchGroup  = !ids || ids.indexOf(id) !== -1;
            const matchSearch = !query || haystack.includes(query);
            const show = matchGroup && matchSearch;

            card.style.display = show ? "" : "none";
            if (show) visible++;
        });

        if (empty) empty.hidden = visible > 0;
    }

    filtersBox.addEventListener("click", function (event) {
        const btn = event.target.closest(".courses-filter");
        if (!btn) return;
        activeGroup = btn.dataset.group;
        filtersBox.querySelectorAll(".courses-filter")
            .forEach(function (b) { b.classList.toggle("active", b === btn); });
        apply();
    });

    searchInput.addEventListener("input", apply);

    observeReveals(toolbar.parentElement);

    /* دالة عامة لفتح الفلترة على مجموعة معيّنة (يستخدمها المساعد) */
    window.filterCourses = function (group, query) {
        const btn = filtersBox.querySelector('[data-group="' + group + '"]');
        if (btn) btn.click();
        if (typeof query === "string") { searchInput.value = query; apply(); }
        document.getElementById("courses").scrollIntoView({ behavior: "smooth", block: "start" });
    };

})();


/* ---------------------------------------------------------------------
   3) الفعالية القادمة — عدّاد تنازلي + إضافة إلى التقويم
      ✏️ لتغيير الفعالية عدّل الكائن NEXT_EVENT فقط.
      إذا مرّ تاريخ الفعالية تختفي البطاقة تلقائياً.
--------------------------------------------------------------------- */

const NEXT_EVENT = {
    /* ✏️ اجعلها true عند إقامة ورشة أو فعالية جديدة */
    active: false,
    title: "ورشة صناعة الفيلم الوثائقي — من الفكرة إلى الإنتاج",
    summary: "ورشة عملية تأخذك من فكرة الفيلم الوثائقي حتى مرحلة الإنتاج النهائي.",
    start: "2027-04-15T15:45:00",
    end:   "2027-04-15T18:00:00",
    place: "مركز كربلاء لتكنولوجيا المعلومات — طريق الحر",
    seats: "مقاعد محدودة",
    price: "يُحدد عند التسجيل"
};

function renderNextEvent() {

    const box = document.getElementById("nextEventBox");
    if (!box) return;

    /* تنظيف أي بطاقة سابقة */
    clearInterval(renderNextEvent._timer);
    box.innerHTML = "";
    box.className = "";

    if (!NEXT_EVENT.active) return;

    const start = new Date(NEXT_EVENT.start);
    const end   = new Date(NEXT_EVENT.end);

    if (isNaN(start.getTime()) || end.getTime() < Date.now()) return;

    const dateText = start.toLocaleDateString("ar-IQ-u-nu-latn", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    function hhmm(d) {
        return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    }

    box.className = "next-event reveal";
    box.innerHTML = `
        <div class="next-event-tag">
            <span class="next-event-dot" aria-hidden="true"></span>
            <span>الفعالية القادمة</span>
        </div>

        <h3 class="next-event-title">${NEXT_EVENT.title}</h3>
        <p class="next-event-summary">${NEXT_EVENT.summary}</p>

        <div class="next-event-meta">
            <div class="next-event-meta-item"><small>التاريخ</small><strong>${dateText}</strong></div>
            <div class="next-event-meta-item"><small>الوقت</small><strong dir="ltr">${hhmm(start)} - ${hhmm(end)}</strong></div>
            <div class="next-event-meta-item"><small>المكان</small><strong>${NEXT_EVENT.place}</strong></div>
            <div class="next-event-meta-item"><small>المقاعد</small><strong>${NEXT_EVENT.seats}</strong></div>
        </div>

        <div class="countdown" id="eventCountdown" aria-live="polite">
            <div class="countdown-cell"><b id="cdDays">00</b><span>يوم</span></div>
            <div class="countdown-cell"><b id="cdHours">00</b><span>ساعة</span></div>
            <div class="countdown-cell"><b id="cdMinutes">00</b><span>دقيقة</span></div>
            <div class="countdown-cell"><b id="cdSeconds">00</b><span>ثانية</span></div>
        </div>

        <div class="next-event-actions">
            <button type="button" class="event-btn event-btn-main" id="eventRegisterBtn">
                <span>احجز مقعدك الآن</span><b>←</b>
            </button>
            <button type="button" class="event-btn event-btn-ghost" id="eventCalendarBtn">
                <span>أضف إلى تقويمي</span><b>🗓</b>
            </button>
        </div>
    `;

    const cd = {
        d: box.querySelector("#cdDays"),
        h: box.querySelector("#cdHours"),
        m: box.querySelector("#cdMinutes"),
        s: box.querySelector("#cdSeconds")
    };

    function pad(n) { return String(n).padStart(2, "0"); }

    function tick() {

        const diff = start.getTime() - Date.now();

        if (diff <= 0) {
            const wrap = box.querySelector("#eventCountdown");
            if (wrap) wrap.innerHTML = '<div class="countdown-live">الفعالية جارية الآن 🔴</div>';
            clearInterval(timer);
            return;
        }

        const totalSeconds = Math.floor(diff / 1000);

        cd.d.textContent = pad(Math.floor(totalSeconds / 86400));
        cd.h.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
        cd.m.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
        cd.s.textContent = pad(totalSeconds % 60);
    }

    tick();
    const timer = setInterval(tick, 1000);
    renderNextEvent._timer = timer;

    /* حجز مقعد عبر واتساب */
    box.querySelector("#eventRegisterBtn").addEventListener("click", function () {
        const message =
            "طلب حجز مقعد في فعالية\n" +
            "مركز كربلاء لتكنولوجيا المعلومات\n" +
            "ــــــــــــــــــــــــــــــ\n" +
            "الفعالية: " + NEXT_EVENT.title + "\n" +
            "التاريخ: " + dateText + "\n" +
            "الوقت: " + hhmm(start) + " - " + hhmm(end) + "\n" +
            "المكان: " + NEXT_EVENT.place;

        window.open("https://wa.me/" + CENTER_WHATSAPP_INTL + "?text=" + encodeURIComponent(message), "_blank", "noopener");
    });

    /* ملف تقويم .ics */
    box.querySelector("#eventCalendarBtn").addEventListener("click", function () {

        function toICS(d) {
            return d.getUTCFullYear() +
                pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" +
                pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + "00Z";
        }

        const ics = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Karbala IT Center//AR",
            "BEGIN:VEVENT",
            "UID:" + Date.now() + "@karbala-it",
            "DTSTAMP:" + toICS(new Date()),
            "DTSTART:" + toICS(start),
            "DTEND:" + toICS(end),
            "SUMMARY:" + NEXT_EVENT.title,
            "DESCRIPTION:" + NEXT_EVENT.summary,
            "LOCATION:" + NEXT_EVENT.place,
            "END:VEVENT",
            "END:VCALENDAR"
        ].join("\r\n");

        const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");

        a.href = url;
        a.download = "karbala-event.ics";
        document.body.appendChild(a);
        a.click();
        a.remove();

        setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    });

    observeReveals(box.parentElement);
}

renderNextEvent();


/* ---------------------------------------------------------------------
   4) اختبار «أي دورة تناسبك؟»
--------------------------------------------------------------------- */

(function courseQuiz() {

    const QUESTIONS = [
        {
            q: "أي مجال يجذبك أكثر؟",
            options: [
                { label: "الحاسوب والبرامج المكتبية", scores: { "computer-present": 4, "computer-online": 3 } },
                { label: "التصميم والصورة والفيديو",  scores: { photoshop: 4, editing: 4, photography: 4, indesign: 3 } },
                { label: "اللغات والتواصل",           scores: { english: 4, persian: 4 } },
                { label: "التقنيات الحديثة والحماية",  scores: { ai: 4, cyber: 4, marketing: 2 } }
            ]
        },
        {
            q: "ما هو مستواك الحالي في هذا المجال؟",
            options: [
                { label: "مبتدئ تماماً", scores: { "computer-present": 3, "computer-online": 2, photography: 2, english: 2, horse: 2 } },
                { label: "لدي أساسيات",  scores: { photoshop: 3, editing: 3, ai: 2, persian: 2, marketing: 2 } },
                { label: "متقدم وأبحث عن تخصص", scores: { cyber: 4, indesign: 3, marketing: 3, ai: 2 } }
            ]
        },
        {
            q: "كم من الوقت تستطيع أن تخصص؟",
            options: [
                { label: "أسبوع واحد فقط",  scores: { photography: 4, horse: 4 } },
                { label: "شهر تقريباً",      scores: { ai: 3, cyber: 3, marketing: 3, editing: 3 } },
                { label: "شهر ونصف أو أكثر", scores: { "computer-present": 3, persian: 3, english: 3, photoshop: 3, indesign: 3 } },
                { label: "أفضّل الدراسة الذاتية عن بُعد", scores: { "computer-online": 5 } }
            ]
        },
        {
            q: "ما هدفك من التدريب؟",
            options: [
                { label: "الحصول على وظيفة أو دخل",   scores: { marketing: 4, editing: 3, photoshop: 3, cyber: 3, "computer-present": 2 } },
                { label: "تطوير الذات والهواية",       scores: { photography: 3, persian: 3, english: 3, horse: 2 } },
                { label: "مواكبة التكنولوجيا الحديثة", scores: { ai: 5, cyber: 3 } },
                { label: "برنامج مناسب لطفلي",         scores: { horse: 5, english: 3 } }
            ]
        }
    ];

    /* بناء النافذة */
    const shell = document.createElement("div");
    shell.className = "modal-shell quiz-shell";
    shell.id = "quizModal";
    shell.setAttribute("aria-hidden", "true");
    shell.innerHTML = `
        <div class="modal-overlay-base" data-quiz-close></div>

        <div class="modal-card quiz-card" role="dialog" aria-modal="true" aria-label="اختبار الدورة المناسبة">
            <span class="sheet-handle" aria-hidden="true"></span>
            <button class="modal-close" data-quiz-close aria-label="إغلاق">×</button>

            <div class="quiz-head">
                <span class="quiz-eyebrow">مساعد الاختيار</span>
                <h2>أي دورة تناسبك؟</h2>
                <div class="quiz-progress"><span id="quizProgressBar"></span></div>
            </div>

            <div class="modal-scroll quiz-body" id="quizBody"></div>
        </div>
    `;

    document.body.appendChild(shell);

    const bodyEl = shell.querySelector("#quizBody");
    const barEl  = shell.querySelector("#quizProgressBar");

    let step = 0;
    let scores = {};

    function openQuiz() {
        step = 0;
        scores = {};
        renderStep();
        shell.classList.add("active");
        shell.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
    }

    function closeQuiz() {
        shell.classList.remove("active");
        shell.setAttribute("aria-hidden", "true");

        const stillOpen = ["registrationModal", "paymentModal"].some(function (id) {
            const el = document.getElementById(id);
            return el && el.classList.contains("active");
        });

        if (!stillOpen) document.body.classList.remove("modal-open");
    }

    shell.addEventListener("click", function (event) {
        if (event.target.hasAttribute("data-quiz-close")) closeQuiz();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && shell.classList.contains("active")) closeQuiz();
    });

    function renderStep() {

        barEl.style.width = ((step / QUESTIONS.length) * 100) + "%";

        if (step >= QUESTIONS.length) { renderResult(); return; }

        const item = QUESTIONS[step];

        bodyEl.innerHTML = `
            <div class="quiz-step">
                <span class="quiz-counter">السؤال ${step + 1} من ${QUESTIONS.length}</span>
                <h3 class="quiz-question">${item.q}</h3>
                <div class="quiz-options"></div>
                ${step > 0 ? '<button type="button" class="quiz-back" id="quizBack">→ السؤال السابق</button>' : ""}
            </div>
        `;

        const optionsBox = bodyEl.querySelector(".quiz-options");

        item.options.forEach(function (option) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "quiz-option";
            btn.innerHTML = "<span>" + option.label + "</span><b>←</b>";
            btn.addEventListener("click", function () {
                Object.keys(option.scores).forEach(function (id) {
                    scores[id] = (scores[id] || 0) + option.scores[id];
                });
                step++;
                renderStep();
                bodyEl.scrollTop = 0;
            });
            optionsBox.appendChild(btn);
        });

        const back = bodyEl.querySelector("#quizBack");
        if (back) back.addEventListener("click", function () { step--; renderStep(); });
    }

    function renderResult() {

        barEl.style.width = "100%";

        const ranked = Object.keys(scores)
            .filter(function (id) { return coursesData[id]; })
            .sort(function (a, b) { return scores[b] - scores[a]; })
            .slice(0, 3);

        if (!ranked.length) {
            bodyEl.innerHTML = '<p class="quiz-empty">لم نتمكن من تحديد دورة مناسبة — تصفّح كل الدورات أو تواصل معنا.</p>';
            return;
        }

        const max = scores[ranked[0]];

        bodyEl.innerHTML = `
            <div class="quiz-result">
                <span class="quiz-counter">النتيجة</span>
                <h3 class="quiz-question">هذه الدورات الأنسب لك</h3>
                <div class="quiz-cards"></div>
                <button type="button" class="quiz-restart" id="quizRestart">↻ إعادة الاختبار</button>
            </div>
        `;

        const cardsBox = bodyEl.querySelector(".quiz-cards");

        ranked.forEach(function (id, i) {

            const course = coursesData[id];
            const percent = Math.max(45, Math.round((scores[id] / max) * 100));
            const price = course.price || (course.tracks ? "من " + course.tracks[0].price : "-");

            const card = document.createElement("div");
            card.className = "quiz-card-item" + (i === 0 ? " is-top" : "");
            card.innerHTML = `
                <div class="quiz-card-head">
                    <div>
                        ${i === 0 ? '<span class="quiz-badge">الأنسب لك</span>' : ""}
                        <strong>${course.title}</strong>
                        <small>${course.category}</small>
                    </div>
                    <div class="quiz-match"><b>${percent}%</b><span>ملاءمة</span></div>
                </div>

                <p>${course.description}</p>

                <div class="quiz-card-facts">
                    <span>💳 ${price}</span>
                    <span>★ ${course.trainer}</span>
                </div>

                <button type="button" class="quiz-register">
                    <span>التسجيل في هذه الدورة</span><b>←</b>
                </button>
            `;

            card.querySelector(".quiz-register").addEventListener("click", function () {
                closeQuiz();
                setTimeout(function () { openRegistration(id, null); }, 260);
            });

            cardsBox.appendChild(card);
        });

        bodyEl.querySelector("#quizRestart").addEventListener("click", function () {
            step = 0; scores = {}; renderStep();
        });
    }

    const openBtn = document.getElementById("openQuizBtn");
    if (openBtn) openBtn.addEventListener("click", openQuiz);

    window.openCourseQuiz = openQuiz;

})();


/* =====================================================================
   =====================================================================
   V9 — حزمة التحسينات الكاملة
   1) إعدادات المركز القابلة للتعديل (حالة الدورات، المقاعد، البدء)
   2) ربط التسجيلات بجدول Google Sheets (اختياري)
   3) روابط مباشرة لكل دورة + زر مشاركة
   4) فريق المدربين (يُبنى تلقائياً)
   5) آراء المتدربين
   6) التحقق من الشهادة
   7) لمحات من المركز
   8) حاسبة حجز القاعة
   9) إشعار تحديث النسخة
   =====================================================================
===================================================================== */


/* ---------------------------------------------------------------------
   0) إعدادات عامة يمكن للمركز تعديلها بسهولة
--------------------------------------------------------------------- */

/* ══════════════════════════════════════════════════════════════
   رابط جدول Google Sheets  ←  ضع الرابط بين علامتي التنصيص
   ══════════════════════════════════════════════════════════════
   كل من يسجّل في دورة تُضاف بياناته تلقائياً إلى الجدول.
   طريقة الحصول على الرابط خطوة بخطوة في ملف: google-sheets-setup.md
   الشكل المتوقع: https://script.google.com/macros/s/AKfyc.../exec
   إذا تُرك فارغاً يبقى التسجيل عبر واتساب فقط.                        */

const SHEETS_ENDPOINT = "";


/* ═══════════════════════════════════════════════════════════════════
   لوحة تحكّم الدورات — الحالة والمواعيد والمقاعد من هنا فقط
   ═══════════════════════════════════════════════════════════════════

   ● status — الحالة، وهي التي تقرر كل شيء:

     "open"    التسجيل مفتوح  → الشريط أخضر  + زر التسجيل يعمل
     "soon"    يبدأ قريباً     → الشريط أصفر  + زر التسجيل معطّل
     "full"    اكتمل العدد    → الشريط أحمر  + زر التسجيل معطّل
     "closed"  التسجيل مغلق   → الشريط رمادي + زر التسجيل معطّل

     ⚠️ في غير حالة "open" لا تُفتح نافذة التسجيل إطلاقاً،
        حتى لو فتح أحدهم رابط الدورة مباشرة.

   ● label — نص الشريط المائل الخاص بهذه الدورة وحدها، مثل:
     "ستفتح قريباً" · "عودوا قريباً" · "مغلقة الآن" · "آخر 3 مقاعد"
     اتركه "" ليأخذ النص الافتراضي من STATUS_TEXT بالأسفل.

   ● startDate — تاريخ البدء بصيغة "2026-09-15". اتركه "" ليختفي.
   ● seatsLeft — عدد المقاعد. اتركه null ليختفي.

   ● dateText / seatsText — نص حر يحلّ محل التاريخ والعدد،
     للدورات التي لا موعد لها ولا عدد، مثل الدورة الإلكترونية.

   ملاحظات مفيدة:
   • في حالتَي "soon" و "closed" إذا تركت الموعد والمقاعد فارغين
     يكتب الموقع تلقائياً «الموعد يحدد لاحقاً» و«المقاعد تحدد لاحقاً».
   • الموعد الذي مضى يختفي وحده حتى لا يظهر تاريخ قديم.
   ═══════════════════════════════════════════════════════════════════ */

const COURSE_META_DEFAULT = {
    status: "open", label: "", seatsLeft: null, startDate: "", dateText: "", seatsText: ""
};

let COURSE_META = {

    "computer-present": { status: "open", label: "", seatsLeft: null, startDate: "2026-10-03" },

    /* دورة إلكترونية: المحاضرات تُفتح فور التسجيل، بلا موعد ولا عدد */
    "computer-online":  { status: "open", label: "",
                          dateText:  "تبدأ بعد 72 ساعة من التسجيل",
                          seatsText: "  " },

    "editing":          { status: "soon", label: "", seatsLeft: null, startDate: "" },
    "photography":      { status: "soon", label: "", seatsLeft: null, startDate: "" },
    "photoshop":        { status: "open", label: "", seatsLeft: null, startDate: "2026-09-20" },
    "indesign":         { status: "open", label: "", seatsLeft: null, startDate: "" },
    "persian":          { status: "open", label: "", seatsLeft: null, startDate: "" },
    "english":          { status: "open", label: "", seatsLeft: null, startDate: "" },
    "ai":               { status: "closed", label: "", seatsLeft: null, startDate: "" },
    "cyber":            { status: "open", label: "", seatsLeft: null, startDate: "" },
    "marketing":        { status: "closed", label: "", seatsLeft: null, startDate: "" },
    "horse":            { status: "open", label: "", seatsLeft: null, startDate: "" }

};

/* ✏️ النصوص الافتراضية للشريط المائل — غيّرها هنا لتتغيّر في كل الدورات
   (لا تغيّر أسماء المفاتيح open / soon / full / closed ولا قيم cls) */

const STATUS_TEXT = {
    open:   { label: "التسجيل مفتوح", cls: "is-open" },
    soon:   { label: "يبدأ قريباً",    cls: "is-soon" },
    full:   { label: "اكتمل العدد",    cls: "is-full" },
    closed: { label: "التسجيل مغلق",   cls: "is-closed" }
};


/* صياغة عدد المقاعد بالعربية الصحيحة:
   1 → مقعد واحد | 2 → مقعدان | 3-10 → مقاعد | 11+ → مقعداً */
function seatsText(count) {

    const n = Number(count);
    if (isNaN(n) || n <= 0) return "لا توجد مقاعد";

    if (n === 1) return "بقي مقعد واحد";
    if (n === 2) return "بقي مقعدان";
    if (n <= 10) return "بقيت " + n + " مقاعد";
    return "بقي " + n + " مقعداً";
}


/* نص التاريخ كما يظهر للزائر.
   إن كان الموعد خلال أسبوع يُكتب بصيغة قريبة: «تبدأ غداً» / «بعد 3 أيام»
   ويأخذ لوناً كهرمانياً لافتاً. والموعد الذي مضى يختفي تماماً. */

function courseDateInfo(value) {

    if (!value) return null;

    const date = new Date(value + "T00:00:00");
    if (isNaN(date.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = Math.round((date - today) / 86400000);

    /* موعد مضى لا يُعرض */
    if (days < 0) return null;

    const full = date.toLocaleDateString("ar-IQ-u-nu-latn", {
        weekday: "long", day: "numeric", month: "long"
    });

    if (days === 0) return { text: "تبدأ اليوم",  soon: true,  full: full };
    if (days === 1) return { text: "تبدأ غداً",   soon: true,  full: full };
    if (days <= 7)  return { text: "تبدأ بعد " + days + " أيام", soon: true, full: full };

    return { text: "تبدأ " + full, soon: false, full: full };
}

/* نص التاريخ فقط — تستعمله نافذة التسجيل */
function formatCourseDate(value) {
    const info = courseDateInfo(value);
    return info ? info.full : "";
}


function getCourseMeta(id) {
    return Object.assign({}, COURSE_META_DEFAULT, COURSE_META[id] || {});
}


/* ---------------------------------------------------------------------
   2) شارات الحالة + المقاعد + زر المشاركة على كل بطاقة دورة
--------------------------------------------------------------------- */

function courseShareUrl(id) {
    return location.origin + location.pathname + "#course=" + id;
}

(function decorateCourseCards() {

    const grid = document.getElementById("coursesGrid");
    if (!grid) return;

    function decorate() {

        Array.from(grid.children).forEach(function (card) {

            if (card.dataset.decorated === "1") return;
            card.dataset.decorated = "1";

            const id = card.dataset.course;
            const meta = getCourseMeta(id);
            const status = STATUS_TEXT[meta.status] || STATUS_TEXT.open;

            /* شريط مائل في زاوية البطاقة */
            const ribbon = document.createElement("span");
            ribbon.className = "course-ribbon " + status.cls;
            ribbon.textContent = (meta.label && meta.label.trim()) ? meta.label.trim() : status.label;
            card.appendChild(ribbon);

            /* ---------- شرائح الموعد والمقاعد ---------- */

            const pending = (meta.status === "soon" || meta.status === "closed");
            const chips = [];

            /* المقاعد */
            if (meta.seatsText && meta.seatsText.trim()) {

                chips.push('<span class="chip-seats is-open-seats">◍ ' +
                    escapeHtml(meta.seatsText.trim()) + "</span>");

            } else if (meta.seatsLeft !== null && meta.seatsLeft !== undefined && meta.seatsLeft !== "") {

                const seats = Number(meta.seatsLeft);

                const level = seats <= 0 ? "is-none"
                            : seats <= 2 ? "is-last"
                            : seats <= 5 ? "is-low"
                            : "is-plenty";

                chips.push('<span class="chip-seats ' + level + '">◍ ' + seatsText(seats) + "</span>");

            } else if (pending) {

                chips.push('<span class="chip-seats is-tbd">◍ المقاعد تحدد لاحقاً</span>');
            }

            /* الموعد */
            if (meta.dateText && meta.dateText.trim()) {

                chips.push('<span class="chip-date is-open-date">◷ ' +
                    escapeHtml(meta.dateText.trim()) + "</span>");

            } else {

                const dateInfo = courseDateInfo(meta.startDate);

                if (dateInfo) {
                    chips.push('<span class="chip-date' + (dateInfo.soon ? " is-soon" : "") + '">◷ ' +
                        dateInfo.text + "</span>");
                } else if (pending) {
                    chips.push('<span class="chip-date is-tbd">◷ الموعد يحدد لاحقاً</span>');
                }
            }

            if (chips.length) {
                const box = document.createElement("div");
                box.className = "course-meta-chips";
                box.innerHTML = chips.join("");
                const desc = card.querySelector(".course-desc");
                if (desc) desc.after(box);
            }

            /* ---------- الزر يعمل في حالة "open" فقط ---------- */

            if (meta.status !== "open") {

                const btn = card.querySelector(".course-register-btn");

                if (btn) {

                    btn.classList.add("is-disabled");
                    btn.setAttribute("aria-disabled", "true");
                    btn.disabled = true;

                    const text = meta.status === "full"   ? "اكتمل العدد — لا يمكن التسجيل"
                               : meta.status === "soon"   ? "سيفتح التسجيل قريباً"
                               :                            "التسجيل مغلق حالياً";

                    const span = btn.querySelector("span");
                    if (span) span.textContent = text;

                    const arrow = btn.querySelector("b");
                    if (arrow) arrow.textContent = "✕";
                }

                card.classList.add("is-locked");
            }
        });
    }

    decorate();
    new MutationObserver(decorate).observe(grid, { childList: true });

})();


/* رسالة صغيرة عائمة */
function showToast(text) {

    let box = document.getElementById("kcitToast");

    if (!box) {
        box = document.createElement("div");
        box.id = "kcitToast";
        box.className = "kcit-toast";
        document.body.appendChild(box);
    }

    box.textContent = text;
    box.classList.add("show");

    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { box.classList.remove("show"); }, 2600);
}


/* ---------------------------------------------------------------------
   3) الروابط المباشرة: موقعك/#course=photography
--------------------------------------------------------------------- */

(function courseDeepLink() {

    function openFromHash() {
        const m = String(location.hash || "").match(/#course=([a-z-]+)/i);
        if (!m) return;
        const id = m[1];
        if (!coursesData[id]) return;

        const section = document.getElementById("courses");
        if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });

        setTimeout(function () { openRegistration(id, null); }, 700);
    }

    window.addEventListener("load", openFromHash);
    window.addEventListener("hashchange", openFromHash);

})();



/* ---------------------------------------------------------------------
   7) لمحات من المركز — شريط صور مختصر
   ✏️ عدّل المصفوفة أدناه بمسارات صورك. إن لم تتوفر الصور يختفي الشريط.
--------------------------------------------------------------------- */

/* ⛔️ معطّلة — استُبدلت بالمعرض المتحرك التلقائي في القسم V66 بآخر الملف */
const GLIMPSES = [];

(function buildGlimpses() {

    const box = document.getElementById("glimpsesBox");
    if (!box || !GLIMPSES.length) return;

    box.className = "glimpses reveal";
    box.innerHTML = '<div class="glimpses-track"></div>';

    const track = box.querySelector(".glimpses-track");
    let loaded = 0;
    let failed = 0;

    GLIMPSES.forEach(function (src, i) {

        const figure = document.createElement("figure");
        figure.className = "glimpse";

        const img = document.createElement("img");
        img.src = src;
        img.alt = "من أنشطة مركز كربلاء لتكنولوجيا المعلومات";
        img.loading = "lazy";
        img.decoding = "async";

        img.addEventListener("load", function () { loaded++; });

        img.addEventListener("error", function () {
            failed++;
            figure.remove();
            if (failed >= GLIMPSES.length) box.remove();
        });

        figure.appendChild(img);
        track.appendChild(figure);
    });

    observeReveals(box.parentElement);

})();


/* ---------------------------------------------------------------------
   9) إرسال كل تسجيل إلى جدول Google Sheets
   - يُرسل فوراً عند الضغط على زر التسجيل أو الدفع.
   - إذا انقطع الإنترنت يُحفظ الطلب في قائمة انتظار ويُرسل تلقائياً
     عند عودة الاتصال أو عند فتح الموقع في المرة القادمة.
--------------------------------------------------------------------- */

(function connectSheets() {

    const QUEUE_KEY = "kcit_pending_rows";

    function readQueue() {
        try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); }
        catch (e) { return []; }
    }

    function writeQueue(list) {
        try { localStorage.setItem(QUEUE_KEY, JSON.stringify(list.slice(-50))); }
        catch (e) { /* تجاهل */ }
    }

    function post(row) {
        return fetch(SHEETS_ENDPOINT, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(row)
        });
    }

    let flushing = false;

    function flush() {

        if (flushing || !SHEETS_ENDPOINT || !navigator.onLine) return;

        const queue = readQueue();
        if (!queue.length) return;

        flushing = true;

        post(queue[0])
            .then(function () {
                const rest = readQueue().slice(1);
                writeQueue(rest);
                flushing = false;
                if (rest.length) flush();
            })
            .catch(function () {
                flushing = false;   /* يُعاد المحاولة لاحقاً */
            });
    }

    const originalSave = saveRegistrationRecord;

    saveRegistrationRecord = function (record) {

        originalSave(record);

        if (!SHEETS_ENDPOINT) return;

        const row = Object.assign({
            type: "دورة",
            course: "",
            price: "",
            paid: false,
            paymentMethod: "-",
            name: "",
            phone: "",
            birthdate: "",
            note: "",
            createdAt: new Date().toISOString()
        }, record);

        const queue = readQueue();
        queue.push(row);
        writeQueue(queue);

        flush();
    };

    window.addEventListener("online", flush);
    window.addEventListener("load", flush);
    flush();

})();


/* ---------------------------------------------------------------------
   10) إشعار توفر نسخة جديدة من الموقع
--------------------------------------------------------------------- */

(function updateNotice() {

    if (!("serviceWorker" in navigator) || location.protocol === "file:") return;

    navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (updateNotice._reloaded) return;
        updateNotice._reloaded = true;
        location.reload();
    });

    navigator.serviceWorker.ready.then(function (registration) {

        registration.addEventListener("updatefound", function () {

            const worker = registration.installing;
            if (!worker) return;

            worker.addEventListener("statechange", function () {

                if (worker.state !== "installed" || !navigator.serviceWorker.controller) return;

                const bar = document.createElement("div");
                bar.className = "update-bar";
                bar.innerHTML = '<span>يتوفر تحديث جديد للموقع</span><button type="button">تحديث الآن</button>';
                document.body.appendChild(bar);

                requestAnimationFrame(function () { bar.classList.add("show"); });

                bar.querySelector("button").addEventListener("click", function () {
                    worker.postMessage({ type: "SKIP_WAITING" });
                    bar.remove();
                });
            });
        });
    });

})();


/* =====================================================================
   V10 — إعادة ترتيب بطاقات الدورات
   نقل السعر والشهادة إلى شريط سفلي ثابت، وتحويل التفاصيل إلى صفوف
   مرتبة، مع توحيد ارتفاع البطاقات ومحاذاة الأزرار.
===================================================================== */

(function restyleCourseCards() {

    const grid = document.getElementById("coursesGrid");
    if (!grid) return;

    function buildFoot(card) {

        const facts = card.querySelector(".course-facts");
        if (!facts) return;

        const priceFact = facts.querySelector(".course-fact.is-price");
        const certFact  = facts.querySelector(".course-fact.is-cert");

        /* لا شيء جديد لنقله (استدعاء ناتج عن تعديلنا نحن) */
        if (!priceFact && !certFact) return;

        /* أزل أي شريط سابق */
        const old = card.querySelector(".course-foot");
        if (old) old.remove();

        const foot = document.createElement("div");
        foot.className = "course-foot";

        const price = priceFact ? priceFact.querySelector("strong").textContent : "";
        const certEl = certFact ? certFact.querySelector("strong") : null;
        const hasCert = certEl ? certEl.classList.contains("yes") : false;

        foot.innerHTML =
            '<div class="course-price">' +
                "<small>رسوم الدورة</small>" +
                '<div class="price-line"><strong>' + price + "</strong></div>" +
            "</div>";

        /* شارة الشهادة تُوضع في أعلى البطاقة بجانب التصنيف */
        const topBar = card.querySelector(".course-card-top");

        const prevCert = card.querySelector(".course-cert");
        if (prevCert) prevCert.remove();

        if (certEl && topBar) {
            const chip = document.createElement("span");
            chip.className = "course-cert " + (hasCert ? "yes" : "no");
            chip.textContent = hasCert ? CERT_TEXT.chipYes : CERT_TEXT.chipNo;
            topBar.appendChild(chip);
        }

        if (priceFact) priceFact.remove();
        if (certFact) certFact.remove();

        const btn = card.querySelector(".course-register-btn");
        if (btn) card.insertBefore(foot, btn);
        else card.appendChild(foot);
    }

    function apply(card) {

        if (!card.dataset.course) return;

        buildFoot(card);

        /* راقب تبديل الفئة العمرية (يعيد بناء التفاصيل) */
        if (card.dataset.footWatch !== "1") {
            card.dataset.footWatch = "1";
            const facts = card.querySelector(".course-facts");
            if (facts) {
                new MutationObserver(function () { buildFoot(card); })
                    .observe(facts, { childList: true });
            }
        }
    }

    function run() { Array.from(grid.children).forEach(apply); }

    run();
    new MutationObserver(run).observe(grid, { childList: true });

})();


/* =====================================================================
   =====================================================================
   V11 — المساعد الذكي (نسخة مطوّرة)
   • يفهم العربية الفصحى واللهجة العراقية وبعض الإنجليزية
   • يميّز التحيات والمجاملات والشكر والاعتذار والوداع
   • يستخرج الدورة/القاعة والموضوع (سعر، مدة، مدرب، مقاعد...)
   • يتذكّر سياق المحادثة (سعرها؟ مدتها؟ منو استاذها؟)
   • يصحّح الأخطاء الإملائية بمقارنة تقريبية
   • ينفّذ الأوامر: التسجيل، الاختبار، الفلترة، الانتقال للأقسام
   =====================================================================
===================================================================== */

(function smartAssistant() {

    /* =================================================================
       1) قاعدة المعرفة
    ================================================================= */

    const CENTER = {
        name: "مركز كربلاء لتكنولوجيا المعلومات",
        nameEn: "Karbala Information Technology Center",
        phone: "0774 847 7756",
        email: "karblaacit@gmail.com",
        address: "العراق — محافظة كربلاء، طريق الحر، مقابل مدينة ألعاب نوارس",
        addressEn: "Karbala, Iraq — Al-Hurr road, opposite Nawaris amusement park",
        map: "https://maps.app.goo.gl/vdxfvJfxjSUd8UKk6?g_st=ic",
        founded: "2023",
        social: {
            instagram: "@it.karbala",
            telegram: "@IT_karbala",
            tiktok: "@it.karbala",
            facebook: "مركز كربلاء لتكنولوجيا المعلومات"
        }
    };

    /* دمج بيانات المركز المعدّلة من لوحة التحكم */

    const waNum = (CENTER.whatsapp || "").replace(/[^0-9]/g, "");
    const WA = "https://wa.me/" + (waNum || (typeof CENTER_WHATSAPP_INTL !== "undefined" ? CENTER_WHATSAPP_INTL : "9647748477756"));

    const courses = (typeof coursesData !== "undefined") ? coursesData : {};
    const halls   = (typeof hallsData   !== "undefined") ? hallsData   : {};

    const COURSE_ALIASES = {
        "computer-present": ["حاسوب", "حاسبه", "كمبيوتر", "كومبيوتر", "حضوري", "اوفيس", "وورد", "اكسل", "بوربوينت", "مايكروسوفت", "computer", "office"],
        "computer-online":  ["حاسوب الكتروني", "اونلاين", "اون لاين", "عن بعد", "الكتروني", "مسجل", "online", "distance"],
        "editing":          ["مونتاج", "تحرير فيديو", "بريمير", "افتر", "editing", "montage", "video"],
        "photography":      ["تصوير", "كاميرا", "فوتوغرافي", "فوتوغراف", "photography", "camera", "photo"],
        "photoshop":        ["فوتوشوب", "فوتشوب", "photoshop", "معالجه صور", "تعديل صور"],
        "indesign":         ["اندزاين", "انديزاين", "ان ديزاين", "indesign", "مطبوعات", "طباعه", "مجلات"],
        "persian":          ["فارسي", "فارسيه", "الفارسيه", "ايراني", "persian", "farsi"],
        "english":          ["انكليزي", "انجليزي", "انكليزيه", "انجليزيه", "english", "اوكسفورد", "oxford", "لغه انكليزيه"],
        "ai":               ["ذكاء", "ذكاء اصطناعي", "الذكاء", "ai", "شات جي بي تي", "chatgpt", "روبوت"],
        "cyber":            ["امن سيبراني", "سيبراني", "هكر", "هاكر", "اختراق", "cyber", "ثغرات", "ريد تيم", "security"],
        "marketing":        ["تسويق", "تسويق الكتروني", "اعلانات", "ماركتنك", "marketing", "سوشيال ميديا", "ديجيتال"],
        "horse":            ["فروسيه", "خيل", "خيول", "ركوب الخيل", "حصان", "اشور", "horse"]
    };

    const HALL_ALIASES = {
        "hall1": ["القاعه الرئيسيه", "الرئيسيه", "الكبيره", "30 مقعد"],
        "hall2": ["القاعه الثانيه", "الثانيه", "التدريب الثانيه", "20 مقعد"],
        "hall3": ["قاعه الاجتماعات", "الاجتماعات", "اجتماعات", "15 مقعد"]
    };


    /* =================================================================
       2) أدوات معالجة النص
    ================================================================= */

    function normalize(text) {
        return String(text || "")
            .replace(/[ً-ْٰ]/g, "")
            .replace(/[أإآٱٲٳ]/g, "ا")
            .replace(/ى/g, "ي")
            .replace(/ة/g, "ه")
            .replace(/ؤ/g, "و")
            .replace(/ئ/g, "ي")
            .replace(/گ/g, "ك")
            .replace(/چ/g, "ج")
            .replace(/پ/g, "ب")
            .replace(/ڤ/g, "ف")
            .replace(/ـ/g, "")
            .replace(/[^ء-يa-zA-Z0-9\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();
    }

    const STOPWORDS = ["في", "من", "على", "الى", "عن", "هل", "ما", "هي", "هو", "انا", "احب", "اريد", "ابي",
                       "لو", "سمحت", "ممكن", "رجاء", "يا", "اخي", "اختي", "استاذ", "الله", "بس", "هاي", "هذا",
                       "هذه", "هاذا", "اكو", "شلون", "شنو", "شني", "وين", "الي", "ال", "عندكم", "عندك", "لديكم",
                       "the", "a", "an", "is", "are", "please", "do", "you", "i", "want", "how", "what", "where"];

    function tokens(text) {
        return normalize(text).split(" ").filter(function (w) {
            return w.length > 1 && STOPWORDS.indexOf(w) === -1;
        });
    }

    /* تشابه تقريبي لتحمّل الأخطاء الإملائية */
    function editDistance(a, b) {

        const m = a.length, n = b.length;
        if (!m) return n;
        if (!n) return m;

        let prev = new Array(n + 1);
        for (let j = 0; j <= n; j++) prev[j] = j;

        for (let i = 1; i <= m; i++) {
            const cur = [i];
            for (let j = 1; j <= n; j++) {
                cur[j] = Math.min(
                    prev[j] + 1,
                    cur[j - 1] + 1,
                    prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
                );
            }
            prev = cur;
        }

        return prev[n];
    }

    function similar(a, b) {
        if (!a || !b) return 0;
        if (a === b) return 1;
        if (a.length > 3 && b.indexOf(a) !== -1) return 0.92;
        if (b.length > 3 && a.indexOf(b) !== -1) return 0.92;
        const max = Math.max(a.length, b.length);
        return 1 - editDistance(a, b) / max;
    }

    /* مطابقة على مستوى الكلمة مع تحمّل السوابق واللواحق العربية
       (ال / و / ب / ل / لل ... و ها / هم / كم) */
    function wordMatch(token, key) {

        if (token === key) return true;
        if (key.length < 3) return false;

        const prefixes = ["ال", "و", "وال", "بال", "لل", "ب", "ل", "ك", "ف", "فال"];
        for (let i = 0; i < prefixes.length; i++) {
            if (token === prefixes[i] + key) return true;
        }

        if (key.length >= 4) {
            if (token.indexOf(key) === 0 && token.length - key.length <= 3) return true;
            if (token.length > key.length && token.indexOf(key) === token.length - key.length
                && token.length - key.length <= 3) return true;
        }

        return false;
    }

    /* درجة مطابقة كلمة مفتاحية واحدة */
    function keyScore(text, textTokens, rawKey) {

        const key = normalize(rawKey);
        if (!key) return 0;

        if (key.indexOf(" ") !== -1) {
            return text.indexOf(key) !== -1 ? 2 + key.split(" ").length * 0.6 : 0;
        }

        for (let i = 0; i < textTokens.length; i++) {
            if (wordMatch(textTokens[i], key)) return 1.7 + key.length * 0.04;
        }

        return 0;
    }

    function hasAny(text, list) {
        const tk = tokens(text).concat(normalize(text).split(" ").filter(Boolean));
        return list.some(function (k) { return keyScore(text, tk, k) > 0; });
    }

    function isEnglish(raw) {
        const latin = (raw.match(/[a-zA-Z]/g) || []).length;
        const arabic = (raw.match(/[ء-ي]/g) || []).length;
        return latin > 2 && latin > arabic;
    }


    /* =================================================================
       3) استخراج الدورة / القاعة / الموضوع
    ================================================================= */

    function detectCourse(text) {

        const textTokens = normalize(text).split(" ").filter(Boolean);
        let best = null, bestScore = 0;

        Object.keys(COURSE_ALIASES).forEach(function (id) {

            const names = COURSE_ALIASES[id].concat([courses[id] ? courses[id].title : ""]);

            names.forEach(function (rawName) {

                const key = normalize(rawName);
                if (!key) return;

                /* عبارة كاملة داخل النص */
                if (key.indexOf(" ") !== -1) {
                    if (text.indexOf(key) !== -1) {
                        const score = 2.2 + key.split(" ").length * 0.4;
                        if (score > bestScore) { bestScore = score; best = id; }
                    }
                    return;
                }

                /* كلمة مفردة مع تحمّل السوابق */
                for (let i = 0; i < textTokens.length; i++) {
                    if (wordMatch(textTokens[i], key)) {
                        const score = 2 + key.length * 0.05;
                        if (score > bestScore) { bestScore = score; best = id; }
                        return;
                    }
                }

                /* تصحيح إملائي: كلمة مقابل كلمة فقط */
                if (key.length >= 5) {
                    textTokens.forEach(function (w) {
                        if (w.length < 5) return;
                        if (Math.abs(w.length - key.length) > 3) return;
                        const sim = 1 - editDistance(w, key) / Math.max(w.length, key.length);
                        if (sim > 0.82) {
                            const score = 1.9 + sim * 0.2;
                            if (score > bestScore) { bestScore = score; best = id; }
                        }
                    });
                }
            });
        });

        return bestScore >= 1.9 ? best : null;
    }

    function detectHall(text) {
        let found = null;
        Object.keys(HALL_ALIASES).forEach(function (id) {
            if (!found && hasAny(text, HALL_ALIASES[id])) found = id;
        });
        return found;
    }

    const TOPICS = {
        price:       { w: 1,   words: ["سعر", "اسعار", "كم", "شكد", "بيش", "بكم", "كلفه", "تكلفه", "رسوم", "فلوس", "مبلغ", "غالي", "رخيص", "price", "cost", "fees"] },
        duration:    { w: 1.3, words: ["مده", "مدتها", "مدته", "كم يوم", "كم شهر", "كم اسبوع", "تستمر", "duration"] },
        hours:       { w: 1.3, words: ["ساعات", "ساعاتها", "عدد الساعات", "hours"] },
        seats:       { w: 1.3, words: ["مقاعد", "مقعد", "مقاعدها", "شواغر", "seats"] },
        trainer:     { w: 1.4, words: ["مدرب", "استاذ", "مدرس", "معلم", "مدربها", "استاذها", "منو يدرس", "من يدرس", "teacher", "trainer", "instructor"] },
        certificate: { w: 1.4, words: ["شهاده", "شهادات", "شهادتها", "معتمده", "certificate"] },
        schedule:    { w: 1.2, words: ["متى", "موعد", "مواعيد", "دوام", "شوكت", "تبدا", "يبدا", "جدول", "when", "schedule"] },
        content:     { w: 1.2, words: ["محتوى", "منهج", "منهجها", "تفاصيل", "تفاصيلها", "شرح", "content", "details", "syllabus"] }
    };

    function detectTopic(text) {

        const tk = normalize(text).split(" ").filter(Boolean);
        let best = null, bestScore = 0;

        Object.keys(TOPICS).forEach(function (key) {

            let score = 0;
            TOPICS[key].words.forEach(function (w) {
                score = Math.max(score, keyScore(text, tk, w));
            });

            score *= TOPICS[key].w;

            if (score > bestScore) { bestScore = score; best = key; }
        });

        return bestScore > 0 ? best : null;
    }


    /* =================================================================
       4) الذاكرة والسياق
    ================================================================= */

    const ctx = {
        lastCourse: null,
        lastHall: null,
        lastIntent: null,
        awaiting: null,      /* "course_for_register" مثلاً */
        turns: 0,
        greeted: false,
        lang: "ar"
    };

    const PRONOUN = ["سعرها", "سعره", "مدتها", "مدته", "ساعاتها", "ساعاته", "مقاعدها", "استاذها",
                     "مدربها", "شهادتها", "تفاصيلها", "عنها", "عنه", "بيها", "بيه", "فيها", "منهجها",
                     "its", "it"];


    /* =================================================================
       5) صياغة الإجابات
    ================================================================= */

    function courseFull(id) {

        const c = courses[id];
        const meta = (typeof getCourseMeta === "function") ? getCourseMeta(id) : { status: "open" };
        const statusText = { open: "التسجيل مفتوح ✅", soon: "تبدأ قريباً ⏳", full: "اكتمل العدد", closed: "التسجيل مغلق حالياً" };

        const SEP = "━━━━━━━━━━━━";

        /* موعد البدء وعدد المقاعد كما حدّدهما المركز */
        let startLine = "";
        if (meta.dateText && String(meta.dateText).trim()) {
            startLine = String(meta.dateText).trim();
        } else if (meta.startDate && typeof courseDateInfo === "function") {
            const info = courseDateInfo(meta.startDate);
            if (info) startLine = info.full;
        }

        let seatsLine = "";
        if (meta.seatsText && String(meta.seatsText).trim()) {
            seatsLine = String(meta.seatsText).trim();
        } else if (meta.seatsLeft && typeof seatsText === "function") {
            seatsLine = seatsText(meta.seatsLeft);
        }

        let out = "📘 " + c.title + "\n" + c.description + "\n";

        out += "\n" + SEP + "\n📌 معلومات عامة";
        out += "\n• المجال: " + (c.category || "-");
        out += "\n• المدرب: " + (c.trainer || "يحدد لاحقاً");
        out += "\n• الشهادة: " + (c.certificate
                    ? ((typeof CERT_TEXT !== "undefined" ? CERT_TEXT.boxYes : "متوفرة") + " عند إكمال الدورة بنجاح")
                    : (typeof CERT_TEXT !== "undefined" ? CERT_TEXT.boxNo : "غير متوفرة"));
        out += "\n• حالة التسجيل: " + (statusText[meta.status] || statusText.open);
        out += "\n• موعد البدء: " + (startLine || "يحدد لاحقاً");
        out += "\n• المقاعد: " + (seatsLine || "يحدد لاحقاً");

        if (c.tracks && c.tracks.length) {

            out += "\n\n" + SEP + "\n🎯 الفئات المتاحة (" + c.tracks.length + ")";

            c.tracks.forEach(function (t) {
                out += "\n\n▸ " + t.label +
                       "\n   • المدة: " + (t.duration || "-") +
                       "\n   • الساعات التدريبية: " + (t.hours || "-") +
                       "\n   • عدد المقاعد: " + (t.seats || "-") +
                       "\n   • السعر: " + (t.price || "-") +
                       (t.priceNote ? "\n   • ملاحظة: " + t.priceNote : "");
            });

        } else {

            out += "\n\n" + SEP + "\n🗂 تفاصيل الدورة";
            out += "\n• المدة: " + (c.duration || "-");
            out += "\n• الساعات التدريبية: " + (c.hours || "-");
            out += "\n• عدد المقاعد: " + (c.seats || "-");
            out += "\n• السعر: " + (c.price || "-");
            if (c.priceNote) out += "\n• ملاحظة على السعر: " + c.priceNote;
        }

        out += "\n\n" + SEP + "\n📝 طريقة التسجيل";
        out += "\n1) اضغط «التسجيل في هذه الدورة» في بطاقة الدورة.";
        out += "\n2) عبّئ الاسم الثلاثي ورقم الهاتف وتاريخ الميلاد.";
        out += "\n3) أرسل الطلب عبر واتساب ويتواصل معك المركز للتأكيد.";
        out += "\n\n💳 الدفع: زين كاش، كي كارد، أو نقداً في المركز.";
        out += "\n📍 المكان: " + CENTER.address;
        out += "\n☎️ للاستفسار: " + CENTER.phone;
        out += "\n\nتحب أفتح لك التسجيل بهذه الدورة الآن؟ اكتب «سجلني».";

        return out;
    }

    function coursePrice(id) {
        const c = courses[id];
        if (c.tracks) {
            return "💳 أسعار دورة " + c.title + ":\n" +
                c.tracks.map(function (t) {
                    return "• " + t.label + " — " + t.price + (t.priceNote ? " (" + t.priceNote + ")" : "");
                }).join("\n");
        }
        return "💳 سعر دورة " + c.title + ": " + c.price +
               (c.priceNote ? "\n(" + c.priceNote + ")" : "");
    }

    function courseTopic(id, topic) {

        const c = courses[id];
        const first = c.tracks ? c.tracks[0] : c;

        switch (topic) {
            case "price":       return coursePrice(id);
            case "duration":    return "⏳ مدة دورة " + c.title + ": " +
                                       (c.tracks ? c.tracks.map(function (t) { return t.label + ": " + t.duration; }).join(" / ") : c.duration);
            case "hours":       return "◴ الساعات التدريبية لدورة " + c.title + ": " +
                                       (c.tracks ? c.tracks.map(function (t) { return t.label + ": " + t.hours; }).join(" / ") : c.hours);
            case "seats":       return "❑ عدد المقاعد في دورة " + c.title + ": " + (first.seats || "-");
            case "trainer":     return "★ مدرب دورة " + c.title + ": " + c.trainer;
            case "certificate": return c.certificate
                                       ? "✓ نعم، دورة " + c.title + " تمنح شهادة عند إكمالها بنجاح."
                                       : "دورة " + c.title + " برنامج تدريبي بدون شهادة.";
            case "schedule":    return "مواعيد دورة " + c.title + " تُحدد مع كل مجموعة حسب الوقت المناسب لها.\nتواصل معنا على " + CENTER.phone + " لمعرفة أقرب موعد متاح.";
            case "content":     return courseFull(id);
            default:            return courseFull(id);
        }
    }

    function coursesList() {
        return "📚 الدورات المتوفرة حالياً:\n\n" +
            Object.keys(courses).map(function (id) {
                const c = courses[id];
                const price = c.price || (c.tracks ? "من " + c.tracks[0].price : "-");
                return "• " + c.title + " — " + price;
            }).join("\n") +
            "\n\nاسألني عن أي دورة بالاسم لأعطيك تفاصيلها كاملة 🌿";
    }

    function hallsList() {
        return "🏛 قاعات الإيجار:\n\n" +
            Object.keys(halls).map(function (id) {
                const h = halls[id];
                return "• " + h.title + " — " + h.price + " للساعة، " + h.seats + "، الضيافة: " + h.hospitality;
            }).join("\n") +
            "\n\nتقدر تحسب كلفة الحجز من قسم «قاعات الإيجار» ← «عرض تفاصيل القاعة».";
    }

    function hallInfo(id) {
        const h = halls[id];
        return "🏛 " + h.title + "\n" + h.description +
               "\n\n━━━━━━━━━━━━\n📌 التفاصيل" +
               "\n• النوع: " + (h.label || "قاعة") +
               "\n• سعر الساعة: " + h.price +
               "\n• عدد المقاعد: " + h.seats +
               "\n• الضيافة: " + h.hospitality +
               "\n• الصور المتاحة: " + ((h.images && h.images.length) || 0) + " صور داخل الموقع" +
               "\n\n━━━━━━━━━━━━\n📝 طريقة الحجز" +
               "\n1) افتح قسم «قاعات الإيجار» واضغط «حجز القاعة»." +
               "\n2) عبّئ اسمك ورقم هاتفك والجهة ونوع الفعالية." +
               "\n3) اختر التجهيزات المطلوبة والتاريخ وعدد الساعات — والكلفة تُحسب تلقائياً." +
               "\n4) أرسل الطلب عبر واتساب ويتواصل معك المركز للتأكيد." +
               "\n\n📍 " + CENTER.address +
               "\n☎️ " + CENTER.phone;
    }

    function eventInfo() {

        const ev = (typeof NEXT_EVENT !== "undefined") ? NEXT_EVENT : null;

        if (!ev || !ev.active) {
            return "لا توجد ورشة معلنة في الوقت الحالي.\nعند الإعلان عن ورشة جديدة ستظهر في قسم «الورشات التدريبية» مع موعدها ورابط الحجز.";
        }

        const start = new Date(ev.start);
        const dateText = isNaN(start.getTime()) ? "" :
            start.toLocaleDateString("ar-IQ-u-nu-latn", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

        return "🔴 الورشة القادمة:\n" + ev.title +
               (ev.summary ? "\n" + ev.summary : "") +
               (dateText ? "\n\n• التاريخ: " + dateText : "") +
               (ev.place ? "\n• المكان: " + ev.place : "") +
               "\n\nتقدر تحجز مقعدك من قسم «الورشات التدريبية».";
    }

    function trainersList() {
        const map = {};
        Object.keys(courses).forEach(function (id) {
            const t = (courses[id].trainer || "").trim();
            if (!t || t === "يحدد لاحقاً") return;
            if (!map[t]) map[t] = [];
            map[t].push(courses[id].title);
        });
        return "★ فريق المدربين:\n\n" +
            Object.keys(map).map(function (t) { return "• " + t + " — " + map[t].join("، "); }).join("\n");
    }


    /* =================================================================
       6) النوايا
    ================================================================= */

    const INTENTS = [
        {
            id: "greeting",
            words: ["سلام", "السلام عليكم", "مرحبا", "هلا", "هلو", "اهلا", "صباح الخير", "مساء الخير", "صباح", "مساء", "هاي", "hello", "hi", "hey", "salam"],
            weight: 1.4
        },
        { id: "howareyou", words: ["شلونك", "كيفك", "اخبارك", "شخبارك", "كيف حالك", "how are you"], weight: 1.6 },
        { id: "whoareyou", words: ["منو انت", "من انت", "شنو انت", "اسمك", "روبوت", "بوت", "who are you", "your name"], weight: 1.6 },
        { id: "thanks", words: ["شكرا", "مشكور", "ممنون", "تسلم", "يعطيك العافيه", "احسنت", "thanks", "thank you"], weight: 1.6 },
        { id: "praise", words: ["حلو", "روعه", "ممتاز", "جميل", "رائع", "احسنتم", "شغل زين", "موقع حلو", "great", "nice", "awesome"], weight: 1.3 },
        { id: "sorry", words: ["اسف", "معذره", "عفوا", "sorry"], weight: 1.5 },
        { id: "bye", words: ["مع السلامه", "باي", "الى اللقاء", "وداعا", "تصبح على خير", "bye", "goodbye"], weight: 1.6 },
        { id: "help", words: ["شنو تكدر تسوي", "شنو تسوي", "كيف تساعدني", "شنو خدماتك", "مساعده", "help", "what can you do"], weight: 1.4 },

        { id: "courses", words: ["دورات", "الدورات", "كورسات", "كورس", "دوره", "برامج", "شنو موجود", "courses"], weight: 1 },
        { id: "prices", words: ["اسعار الدورات", "قائمه الاسعار", "كل الاسعار", "الاسعار", "price list"], weight: 1.2 },
        { id: "halls", words: ["قاعه", "قاعات", "ايجار", "اجار", "استاجر", "حجز قاعه", "hall", "rent"], weight: 1.2 },
        { id: "workshops", words: ["ورشه", "ورشات", "ورش", "فعاليه", "فعاليات", "workshop", "event"], weight: 1.2 },
        { id: "kids", words: ["اطفال", "طفل", "ابني", "بنتي", "صغار", "عمره", "kids", "children"], weight: 1.2 },
        { id: "trainers", words: ["المدربين", "مدربين", "الاساتذه", "اساتذه", "الكادر", "teachers", "trainers"], weight: 1.2 },
        { id: "about", words: ["من نحن", "المركز", "عنكم", "تعريف", "متى تاسس", "رسالتكم", "خبره", "about"], weight: 1 },
        { id: "register", words: ["تسجيل", "اسجل", "سجلني", "اشترك", "انضم", "حجز مقعد", "شلون اسجل", "register", "sign up", "enroll"], weight: 1.5 },
        { id: "payment", words: ["دفع", "ادفع", "زين كاش", "كي كارد", "تقسيط", "طريقه الدفع", "payment", "pay"], weight: 1.3 },
        { id: "certificate", words: ["شهاده", "شهادات", "معتمده", "certificate"], weight: 1.1 },
        { id: "location", words: ["موقع", "وين", "عنوان", "مكان", "خريطه", "لوكيشن", "وين تقعون", "location", "address", "where"], weight: 1.3 },
        { id: "contact", words: ["تواصل", "اتصال", "رقم", "هاتف", "موبايل", "واتساب", "ايميل", "بريد", "انستا", "تلكرام", "فيسبوك", "تيك توك", "contact", "phone", "whatsapp"], weight: 1.2 },
        { id: "hours", words: ["اوقات الدوام", "دوام المركز", "متى تفتحون", "ساعات العمل", "working hours", "open"], weight: 1.4 },
        { id: "recommend", words: ["رشح", "رشحلي", "شنو تنصح", "اي دوره تناسب", "ساعدني اختار", "محتار", "احتار", "recommend", "suggest"], weight: 1.7 },
        { id: "discount", words: ["خصم", "تخفيض", "عرض", "مجاني", "مجانا", "discount", "offer", "free"], weight: 1.3 },
        { id: "online", words: ["عن بعد", "اونلاين", "من البيت", "remote", "distance"], weight: 1.1 }
    ];

    function detectIntent(text) {

        const tk = normalize(text).split(" ").filter(Boolean);
        let best = null, bestScore = 0;

        INTENTS.forEach(function (intent) {

            let score = 0;

            intent.words.forEach(function (w) {
                score = Math.max(score, keyScore(text, tk, w));
            });

            /* تصحيح إملائي بسيط */
            if (!score) {
                tk.forEach(function (word) {
                    if (word.length < 5) return;
                    intent.words.forEach(function (w) {
                        const key = normalize(w);
                        if (key.indexOf(" ") !== -1 || key.length < 5) return;
                        if (Math.abs(word.length - key.length) > 3) return;
                        const sim = 1 - editDistance(word, key) / Math.max(word.length, key.length);
                        if (sim > 0.82) score = Math.max(score, 1.6);
                    });
                });
            }

            score *= (intent.weight || 1);

            if (score > bestScore) { bestScore = score; best = intent.id; }
        });

        return bestScore >= 1.7 ? best : null;
    }


    /* =================================================================
       7) المحرك: من النص إلى الرد
    ================================================================= */

    const CHIPS_DEFAULT = ["ما هي الدورات المتوفرة؟", "أسعار الدورات", "كيف أسجل؟", "قاعات الإيجار", "أين موقع المركز؟"];

    function courseChips(id) {
        return ["كم سعرها؟", "شكد مدتها؟", "منو الأستاذ؟", "سجلني بهذه الدورة", "دورات أخرى"];
    }

    function answerEnglish(intent, text) {

        switch (intent) {
            case "greeting":
                return { text: "Hello and welcome to " + CENTER.nameEn + " 🌿\nI can help you with courses, prices, halls, and registration. How can I help?", chips: ["Courses", "Prices", "Location", "Contact"] };
            case "courses":
                return { text: "Our current courses:\n\n" + Object.keys(courses).map(function (id) {
                    const c = courses[id];
                    return "• " + c.title + " — " + (c.price || (c.tracks ? "from " + c.tracks[0].price : "-"));
                }).join("\n") + "\n\nAsk about any course for full details.", chips: ["Prices", "How to register", "Location"] };
            case "prices":
                return { text: "Course fees range from 50,000 to 225,000 IQD depending on the program. Halls start at 10,000 IQD per hour.", chips: ["Courses", "Halls"] };
            case "location":
                return { text: "📍 " + CENTER.addressEn + "\n\nMap: " + CENTER.map, chips: ["Contact", "Courses"] };
            case "contact":
                return { text: "📞 Phone / WhatsApp: " + CENTER.phone + "\n✉️ Email: " + CENTER.email + "\n📸 Instagram: " + CENTER.social.instagram, chips: ["Courses", "Halls"], link: true };
            case "register":
                return { text: "To register: open the Courses section, pick a course, press «التسجيل في هذه الدورة», fill your name, phone and date of birth, then send the request via WhatsApp.", chips: ["Courses", "Contact"], link: true };
            case "halls":
                return { text: "We rent 3 equipped halls: 15,000 / 12,000 / 10,000 IQD per hour (30, 15 and 20 seats).", chips: ["Contact", "Courses"] };
            case "thanks":
                return { text: "You're most welcome 🌷 Feel free to ask anything else about the center.", chips: CHIPS_DEFAULT };
            default:
                return { text: "I can help you with: courses and prices, halls for rent, registration and payment, trainers, location and contact.\nYou can also write in Arabic 🌿", chips: ["Courses", "Prices", "Location", "Contact"] };
        }
    }

    /* =================================================================
       7·ب) V29 — تحيات مخصّصة + إجابات موسّعة
       =================================================================
       ✏️ لإضافة سؤال وجواب جديد: أضف عنصراً إلى SMART_QA بالأسفل
          { words: ["كلمات السؤال"], reply: "الجواب" }
    ================================================================= */

    /* --- 1) نوع التحية: لكل تحية ردّها الخاص --- */

    const GREETINGS = [
        {
            id: "salam",
            words: ["السلام عليكم", "سلام عليكم", "السلام", "سلام", "assalam", "salam", "salam alaikum"],
            reply: function () {
                return "وعليكم السلام ورحمة الله وبركاته 🌿\nأهلاً وسهلاً بك في " + CENTER.name + ".\nتفضّل، كيف أقدر أخدمك؟";
            }
        },
        {
            id: "sabah",
            words: ["صباح الخير", "صباح النور", "صباحو", "صباح", "good morning", "morning"],
            reply: function () {
                return "صباح الخير والنور 🌤\nصباح مبارك عليك، وأتمنى يكون يومك موفّقاً.\nشنو تحب تعرف عن المركز اليوم؟";
            }
        },
        {
            id: "masaa",
            words: ["مساء الخير", "مساء النور", "مساء", "good evening", "evening"],
            reply: function () {
                return "مساء الخير والنور 🌙\nنوّرت، وأتمنى يكون مساؤك طيباً.\nتفضّل بسؤالك عن الدورات أو القاعات أو التسجيل.";
            }
        },
        {
            id: "marhaba",
            words: ["مرحبا", "مرحبتين", "اهلا", "اهلين", "يا هلا", "welcome"],
            reply: function () {
                return "مرحبتين وأهلاً بك 🌷\nنوّرت " + CENTER.name + ".\nاسألني عن أي دورة أو قاعة وأعطيك التفاصيل كاملة.";
            }
        },
        {
            id: "halo",
            words: ["هلو", "هلا", "هلاو", "هاي", "هالو", "hello", "hi", "hey", "yo"],
            reply: function () {
                return "هلا وغلا 👋\nأني المساعد الذكي لـ" + CENTER.name + ".\nاسألني عن الدورات، الأسعار، القاعات، أو شلون تسجّل.";
            }
        },
        {
            id: "night",
            words: ["تصبح على خير", "تصبحون على خير", "ليلة سعيدة", "good night"],
            reply: function () {
                return "وأنت من أهل الخير 🌙\nليلة سعيدة وأحلام هانئة، وأني موجود بأي وقت تحتاجني.";
            }
        },
        {
            id: "ramadan",
            words: ["رمضان كريم", "مبارك عليكم الشهر", "كل عام وانتم بخير", "عيد مبارك", "عيدكم مبارك", "مبروك العيد"],
            reply: function () {
                return "وأنتم بألف خير وصحة وسلامة 🌙✨\nتقبّل الله منّا ومنكم صالح الأعمال.\nوإذا تحتاج أي معلومة عن المركز أني بالخدمة.";
            }
        },
        {
            id: "welcome_back",
            words: ["حياك", "حياكم", "نورت", "منور", "تحياتي", "تحيه", "تحية"],
            reply: function () {
                return "الله يحيّيك ويبارك بيك 🌿\nنورت المركز، تفضّل شنو تحب أساعدك بيه؟";
            }
        }
    ];

    function greetingReply(text) {

        const tk = tokens(text).concat(normalize(text).split(" ").filter(Boolean));

        let best = null, bestScore = 0;

        GREETINGS.forEach(function (g) {
            g.words.forEach(function (w) {
                const s = keyScore(text, tk, w);
                if (s > bestScore) { bestScore = s; best = g; }
            });
        });

        return best ? best.reply() : null;
    }


    /* --- 2) بنك أسئلة وأجوبة موسّع --- */

    function nowText() {
        const d = new Date();
        return d.toLocaleDateString("ar-IQ-u-nu-latn", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) +
               "\nالساعة الآن: " + d.toLocaleTimeString("ar-IQ-u-nu-latn", { hour: "2-digit", minute: "2-digit" });
    }

    const CONTACT_TAIL = "\n\nللتأكيد النهائي تواصل مع المركز: " + CENTER.phone;

    const SMART_QA = [

        /* --- المركز والخدمات --- */
        { words: ["اوقات الدوام", "متى تفتحون", "متى تسكرون", "ساعات العمل", "الدوام"],
          reply: "أوقات الدوام تتغيّر حسب جدول الدورات والمجموعات، وغالباً الفترة المسائية هي الأكثر نشاطاً للدورات.\nأفضل شيء تتصل بينا ونحدد لك الوقت المناسب لمجموعتك." + CONTACT_TAIL },

        { words: ["عطله", "عطلة", "الجمعه", "يوم الجمعة", "اجازه"],
          reply: "أيام العطل الرسمية عادة يتوقف الدوام، والدورات تُعوَّض في موعد بديل يتفق عليه المدرب مع المجموعة." + CONTACT_TAIL },

        { words: ["مواقف", "موقف سيارات", "باركنك", "parking"],
          reply: "المركز يقع على طريق الحر مقابل مدينة ألعاب نوارس، والمنطقة فيها مساحة للوقوف قريبة من المدخل.\n📍 " + CENTER.address },

        { words: ["شلون اوصل", "كيف اوصل", "الطريق", "اقرب نقطه", "خريطه", "لوكيشن"],
          reply: "📍 عنوان المركز:\n" + CENTER.address + "\n\nافتح الموقع على خرائط جوجل مباشرة:\n" + CENTER.map + "\n\nالعلامة المميزة: مدينة ألعاب نوارس — المركز مقابلها." },

        /* --- الدراسة والتدريب --- */
        { words: ["تدريب عملي", "عملي", "تطبيق", "مشاريع", "practical"],
          reply: "نعم، أغلب دوراتنا تعتمد على التطبيق العملي: تشتغل على أجهزة وبرامج فعلية وتنفّذ تمارين ومشاريع صغيرة مع المدرب، مو محاضرات نظرية فقط 💡" },

        { words: ["مستوى", "مبتدئ", "من الصفر", "ما اعرف شي", "بدون خبره", "beginner"],
          reply: "لا تقلق أبداً 🌿 أغلب دوراتنا تبدأ من الصفر ومصمّمة للمبتدئين، والمدرب يمشي بالمجموعة خطوة بخطوة.\nإذا عندك خبرة سابقة، خبّر المدرب ويوجّهك للمستوى المناسب." },

        { words: ["لغه الدوره", "بالعربي", "لغة الشرح", "انكليزي لو عربي"],
          reply: "الشرح كله باللغة العربية (وباللهجة العراقية عند الحاجة)، مع المصطلحات التقنية بالإنجليزية لأنها المستخدمة في البرامج." },

        { words: ["جهاز", "لابتوب", "احتاج حاسبه", "اجيب لابتوب", "laptop"],
          reply: "القاعات مجهزة بأجهزة حاسوب للتدريب، فما مطلوب تجيب جهازك.\nلكن إذا تحب تتدرب على لابتوبك الشخصي تقدر تجيبه، وهذا يساعدك تطبّق بالبيت بنفس الإعدادات." },

        { words: ["غياب", "تغيبت", "فاتتني محاضره", "اعوض"],
          reply: "إذا تغيّبت عن محاضرة، تنسّق مع المدرب لتعويضها أو أخذ ملخّص ما فاتك — والمركز حريص ما يضيع على المتدرب شيء." + CONTACT_TAIL },

        { words: ["اختبار", "امتحان", "تقييم", "exam"],
          reply: "في نهاية أغلب الدورات يكون هناك تقييم عملي بسيط يقيس ما تعلّمته، وعلى أساسه تُمنح الشهادة." },

        { words: ["مجموعه", "عدد الطلاب", "كم شخص", "المجموعات"],
          reply: "المجموعات صغيرة عن قصد حتى ينتبه المدرب لكل متدرب — وعدد المقاعد في كل دورة مذكور في بطاقتها داخل الموقع." },

        { words: ["نساء", "بنات", "رجال", "مختلط", "شباب وبنات"],
          reply: "المركز يستقبل الجميع، والمجموعات تُنظَّم بشكل مناسب ومريح للكل.\nإذا عندك تفضيل معيّن لمجموعة أو وقت، خبّرنا وننسّق لك." + CONTACT_TAIL },

        /* --- الرسوم والدفع --- */
        { words: ["تقسيط", "اقساط", "ادفع على دفعات", "قسط"],
          reply: "موضوع التقسيط يُتفق عليه مع إدارة المركز حسب الدورة، وأغلب الحالات يكون هناك مرونة.\nتواصل معنا وناقش الموضوع مباشرة: " + CENTER.phone },

        { words: ["استرجاع", "استرداد", "ارجع فلوسي", "refund"],
          reply: "سياسة استرجاع الرسوم تُحدَّد مع إدارة المركز حسب حالة الدورة ووقت الانسحاب، فالأفضل تتواصل معهم مباشرة قبل التسجيل إذا عندك ظرف معيّن." + CONTACT_TAIL },

        { words: ["خصم للطلاب", "خصم جماعي", "اكثر من شخص", "مع صديقي"],
          reply: "عند تسجيل مجموعة من الأصدقاء أو فريق من جهة واحدة، غالباً يكون هناك تسهيل بالسعر.\nكلّم المركز وأخبرهم بعدد الأشخاص: " + CENTER.phone },

        /* --- بعد الدورة --- */
        { words: ["فرصه عمل", "شغل", "توظيف", "وظيفه", "سوق العمل", "job"],
          reply: "هدف المركز الأساسي تأهيلك لسوق العمل: تتعلم مهارة عملية تقدر تشتغل بيها كفريلانسر أو تتقدّم بيها لوظيفة، وتحصل شهادة تدعم سيرتك الذاتية.\nالمركز ما يضمن وظيفة، لكن المهارة والشهادة يفتحون لك أبواباً حقيقية 💪" },

        { words: ["الشهاده وين", "متى استلم الشهاده", "تسليم الشهاده"],
          reply: "الشهادة تُسلَّم بعد إكمال الدورة بنجاح واجتياز التقييم النهائي، وتستلمها من المركز مباشرة." },

        /* --- عن المساعد نفسه --- */
        { words: ["منو سواك", "من صنعك", "من برمجك", "شلون تشتغل"],
          reply: "أني مساعد ذكي مبني داخل موقع " + CENTER.name + " 🤖\nأشتغل مباشرة بمتصفحك بدون إنترنت خارجي، وأعرف كل بيانات الدورات والقاعات والأسعار المسجّلة بالموقع." },

        { words: ["تعرف كلشي", "شنو تعرف", "معلوماتك"],
          reply: "معلوماتي كلها عن " + CENTER.name + ": الدورات وتفاصيلها، الأسعار، القاعات، الورش، التسجيل، الدفع، الموقع ووسائل التواصل.\nاسألني بأي صيغة تحب وأني أفهمك 🌿" },

        { words: ["نكته", "نكتة", "ضحكني", "joke"],
          reply: "يقولون: المبرمج شنو يسوي لمن يخلص شغله؟ يفتح الحاسوب من جديد 😄\nخلينا نرجع للمفيد — تحب تعرف شنو الدورات المتوفرة؟" },

        { words: ["الوقت", "كم الساعه", "التاريخ", "اليوم شنو", "شنو اليوم"],
          reply: null },   /* يُبنى ديناميكياً بالأسفل */

        { words: ["احبك", "تحبني", "حلو انت", "شاطر"],
          reply: "ذوقك أحلى 🌷 وأني هنا حتى أسهّل عليك كل شيء يخص المركز. تفضّل شنو تحتاج؟" },

        { words: ["مو فاهم", "ما فهمت", "اعد", "وضح"],
          reply: "ولا يهمّك، راح أوضّح 🌿\nاكتبلي سؤالك بكلمات بسيطة، مثلاً: «سعر دورة التصوير» أو «شلون أسجل» أو «وين المركز».\nوإذا تحب أعطيك قائمة كاملة بالدورات اكتب «الدورات»." },

        { words: ["مشكله", "الموقع ما يشتغل", "خطا", "ما يفتح", "معلق"],
          reply: "إذا واجهتك مشكلة في الموقع جرّب تسوي تحديث للصفحة أولاً، وإذا استمرت خبّر المركز بالتفصيل وراح ينحل الموضوع." + CONTACT_TAIL }
    ];

    /* دورات يسأل عنها الناس وغير متوفرة حالياً */

    const NOT_OFFERED_MAP = {
        "برمجه": "البرمجة", "برمجة": "البرمجة", "بايثون": "البرمجة بلغة بايثون",
        "مواقع": "تصميم المواقع", "تطبيقات": "تطوير التطبيقات", "شبكات": "الشبكات",
        "محاسبه": "المحاسبة", "اوتوكاد": "الأوتوكاد", "رسم": "الرسم",
        "ثري دي": "التصميم ثلاثي الأبعاد", "تركي": "اللغة التركية", "فرنسي": "اللغة الفرنسية"
    };

    function notOfferedTopic(text) {
        let missing = null;
        Object.keys(NOT_OFFERED_MAP).forEach(function (k) {
            if (!missing && hasAny(text, [k])) missing = NOT_OFFERED_MAP[k];
        });
        return missing;
    }

    function smartAnswer(text) {

        const tk = tokens(text).concat(normalize(text).split(" ").filter(Boolean));

        let best = null, bestScore = 0;

        SMART_QA.forEach(function (qa) {
            qa.words.forEach(function (w) {
                const s = keyScore(text, tk, w);
                if (s > bestScore) { bestScore = s; best = qa; }
            });
        });

        if (!best || bestScore < 1.8) return null;

        /* السؤال عن الوقت/التاريخ يُجاب ديناميكياً */
        if (best.reply === null) {
            return "📅 اليوم: " + nowText() + "\n\nتفضّل، شنو تحب تعرف عن المركز؟";
        }

        return best.reply;
    }


    function respond(raw) {

        const text = normalize(raw);
        ctx.turns++;

        if (!text) return { text: "اكتب سؤالك وأنا أجاوبك 🙂", chips: CHIPS_DEFAULT };

        ctx.lang = isEnglish(raw) ? "en" : "ar";

        const course = detectCourse(text);
        const hall   = detectHall(text);
        const topic  = detectTopic(text);
        const intent = detectIntent(text);

        if (ctx.lang === "en" && !course && !hall) return answerEnglish(intent, text);

        /* ---------- ردود المجاملة والتحية ---------- */

        const greetShort = normalize(text).split(" ").filter(Boolean).length <= 6;

        if ((intent === "greeting" || (greetShort && greetingReply(text))) && !course && !topic) {

            ctx.greeted = true;

            const special = greetingReply(text);

            if (special) {
                return { text: special, chips: CHIPS_DEFAULT };
            }

            const hour = new Date().getHours();
            const part = hour < 12 ? "صباح الخير 🌤" : (hour < 18 ? "مساء النور 🌿" : "مساء الخير 🌙");
            return {
                text: part + " وأهلاً بك في " + CENTER.name + " 🌿\nكيف أقدر أساعدك؟ اسألني عن الدورات، الأسعار، القاعات، أو طريقة التسجيل.",
                chips: CHIPS_DEFAULT
            };
        }

        /* ---------- V36: قاعدة المعرفة (kb.js) — مطابقة عالية الثقة ---------- */

        if (!course && !hall && typeof window.KCIT_KB_ANSWER === "function") {

            const kbStrong = window.KCIT_KB_ANSWER(raw, 1.6);

            if (kbStrong) {
                return {
                    text: kbStrong,
                    chips: CHIPS_DEFAULT,
                    link: kbStrong.indexOf("تواصل") !== -1 || kbStrong.indexOf(CENTER.phone) !== -1
                };
            }
        }

        if (intent === "howareyou") {
            return { text: "بخير والحمد لله، وأسعد بخدمتك 🌷\nتفضّل، شنو تحب تعرف عن المركز؟", chips: CHIPS_DEFAULT };
        }

        if (intent === "whoareyou") {
            return { text: "أنا المساعد الذكي لـ" + CENTER.name + " 🤖\nأشتغل داخل الموقع مباشرة، وأعرف كل تفاصيل الدورات والقاعات والأسعار والتسجيل. اسألني أي شيء يخص المركز.", chips: CHIPS_DEFAULT };
        }

        if (intent === "thanks") {
            return { text: "على الرحب والسعة 🌷\nإذا احتجت أي معلومة ثانية عن المركز أني موجود.", chips: CHIPS_DEFAULT };
        }

        if (intent === "praise") {
            return { text: "شكراً لذوقك 🌟 هذا من حسن ظنّك.\nإذا حاب أساعدك بأي شيء يخص الدورات أو الحجز، تفضّل.", chips: CHIPS_DEFAULT };
        }

        if (intent === "sorry") {
            return { text: "ولا يهمّك أبداً 🌿 تفضّل، شنو تحتاج؟", chips: CHIPS_DEFAULT };
        }

        if (intent === "bye") {
            return { text: "بأمان الله 🌿 نتشرّف بزيارتك للمركز، وأي وقت تحتاج معلومة أني هنا.", chips: [] };
        }

        if (intent === "help") {
            return {
                text: "أقدر أساعدك بكل ما يخص المركز:\n\n• تفاصيل أي دورة (السعر، المدة، الساعات، المقاعد، المدرب، الشهادة)\n• قاعات الإيجار وأسعارها\n• طريقة التسجيل وطرق الدفع\n• الورشات والفعاليات\n• موقع المركز ووسائل التواصل\n\nوأقدر أنفّذ لك أوامر مثل «سجلني بدورة التصوير» أو «رشّح لي دورة».",
                chips: CHIPS_DEFAULT
            };
        }

        /* ---------- الأوامر التنفيذية ---------- */

        if (intent === "recommend") {
            return {
                text: "خلّينا نلقى الأنسب لك ✦\nراح أفتح لك اختباراً قصيراً من ٤ أسئلة يحدد أفضل دورة تناسب اهتمامك ووقتك.",
                action: "quiz",
                chips: ["ما هي الدورات المتوفرة؟", "أسعار الدورات"]
            };
        }

        if (intent === "register") {

            /* سؤال عن الطريقة وليس أمراً بالتسجيل */
            const howWords = ["شلون", "كيف", "طريقه", "طريقة", "خطوات", "how"];
            const isHow = hasAny(text, howWords);

            if (isHow && !course) {
                return {
                    text: "📝 طريقة التسجيل بسيطة:\n\n" +
                          "1) افتح قسم «الدورات التدريبية».\n" +
                          "2) اختر الدورة واضغط «التسجيل في هذه الدورة».\n" +
                          "3) عبّئ الاسم الثلاثي، رقم الهاتف (فيه واتساب)، وتاريخ الميلاد.\n" +
                          "4) اختر «إرسال طلب التسجيل» أو «الدفع الآن».\n\n" +
                          "بعدها يوصل طلبك للمركز مباشرة عبر واتساب ويتم التواصل وياك لتأكيد المقعد.\n" +
                          "وإذا تحب، كَلي اسم الدورة وأفتح لك التسجيل حالاً.",
                    chips: ["سجلني بدورة التصوير", "ما هي الدورات المتوفرة؟", "طرق الدفع"],
                    link: true
                };
            }

            const target = course || ctx.lastCourse;

            if (target) {
                ctx.lastCourse = target;
                return {
                    text: "تمام ✅ راح أفتح لك نافذة التسجيل في دورة «" + courses[target].title + "».\nعبّئ بياناتك وأرسل الطلب، وفريق المركز راح يتواصل وياك للتأكيد.",
                    action: "register:" + target,
                    chips: ["كم سعرها؟", "منو الأستاذ؟", "دورات أخرى"]
                };
            }

            ctx.awaiting = "course_for_register";
            return {
                text: "بكل سرور 🌿 بأي دورة تحب تسجّل؟\nاكتب اسم الدورة (مثال: «سجلني بدورة التصوير»)، أو اضغط «رشّح لي دورة» وأساعدك بالاختيار.",
                chips: ["رشّح لي دورة", "ما هي الدورات المتوفرة؟", "أسعار الدورات"]
            };
        }

        /* ---------- V29: بنك الأسئلة الموسّع (قبل المواضيع العامة) ---------- */

        if (!course && !hall) {

            const early = smartAnswer(text);

            if (early) {
                return {
                    text: early,
                    chips: ["ما هي الدورات المتوفرة؟", "أسعار الدورات", "كيف أسجل؟", "تواصل معنا"],
                    link: early.indexOf(CENTER.phone) !== -1
                };
            }

            const missingEarly = notOfferedTopic(text);

            if (missingEarly) {
                return {
                    text: "دورة " + missingEarly + " غير مفتوحة ضمن البرامج المعلنة حالياً 🌿\n" +
                          "لكن المركز يفتح دورات وورش جديدة بشكل دوري، وتقدر تسجّل اهتمامك عبر واتساب ليتم إعلامك عند فتحها.\n\n" +
                          "والمتوفر حالياً: الحاسوب، المونتاج، التصوير، الفوتوشوب، الاندزاين، اللغات، الذكاء الاصطناعي، الأمن السيبراني، التسويق الإلكتروني، والفروسية للأطفال.",
                    chips: ["ما هي الدورات المتوفرة؟", "رشّح لي دورة", "تواصل معنا"],
                    link: true
                };
            }
        }

        /* ---------- القاعات ---------- */

        if (hall) {
            ctx.lastHall = hall;
            return { text: hallInfo(hall), chips: ["قاعات أخرى", "كم سعر الساعة؟", "تواصل معنا"], link: true };
        }

        if (intent === "halls") {
            return { text: hallsList(), chips: ["القاعة الرئيسية", "قاعة الاجتماعات", "تواصل معنا"], link: true };
        }

        /* ---------- الدورة المحددة أو من السياق ---------- */

        const pronounUsed = hasAny(text, PRONOUN);
        const activeCourse = course || ((pronounUsed || topic) && ctx.lastCourse ? ctx.lastCourse : null);

        if (activeCourse) {

            ctx.lastCourse = activeCourse;

            if (ctx.awaiting === "course_for_register") {
                ctx.awaiting = null;
                return {
                    text: "تمام ✅ فتحت لك التسجيل في دورة «" + courses[activeCourse].title + "».",
                    action: "register:" + activeCourse,
                    chips: courseChips(activeCourse)
                };
            }

            return {
                text: courseTopic(activeCourse, topic),
                chips: courseChips(activeCourse),
                link: topic === "schedule"
            };
        }

        /* ---------- مواضيع عامة ---------- */

        if (intent === "prices" || (topic === "price" && !activeCourse)) {
            return {
                text: "💳 أسعار الدورات:\n\n" +
                    Object.keys(courses).map(function (id) {
                        const c = courses[id];
                        const p = c.price || (c.tracks ? c.tracks.map(function (t) { return t.label + ": " + t.price; }).join(" / ") : "-");
                        return "• " + c.title + " — " + p;
                    }).join("\n") +
                    "\n\nوقاعات الإيجار تبدأ من 10,000 د.ع للساعة.\nاسألني عن أي دورة لتفاصيل أدق.",
                chips: ["دورة التصوير", "دورة الحاسوب", "كيف أسجل؟"]
            };
        }

        if (intent === "courses") {
            return { text: coursesList(), chips: ["دورات التصميم", "دورات اللغات", "برامج الأطفال", "أسعار الدورات"] };
        }

        if (intent === "trainers") {
            return { text: trainersList(), chips: CHIPS_DEFAULT };
        }

        if (intent === "kids") {
            return {
                text: "👦 برامج الأطفال في المركز:\n\n" +
                      "• اللغة الإنجليزية (6 - 12 سنة) — 150,000 د.ع\n" +
                      "• اللغة الإنجليزية (13 - 17 سنة) — 200,000 د.ع\n" +
                      "• الفروسية للأطفال — 75,000 د.ع (تدريب خارجي في أكاديمية آشور)\n" +
                      "• دورات حاسوب ورسم وذكاء اصطناعي للأطفال تُفتح بشكل دوري\n\n" +
                      "للاستفسار عن الفئة العمرية المناسبة تواصل معنا.",
                chips: ["دورة الإنجليزية", "دورة الفروسية", "تواصل معنا"],
                link: true
            };
        }

        if (intent === "workshops") {
            return { text: eventInfo(), chips: ["ما هي الدورات المتوفرة؟", "تواصل معنا"], link: true };
        }

        if (intent === "certificate" || topic === "certificate") {
            const withCert = Object.keys(courses).filter(function (id) { return courses[id].certificate; })
                                    .map(function (id) { return courses[id].title; });
            return {
                text: "✓ نعم، المركز يمنح شهادة عند إكمال الدورة بنجاح.\n\nالدورات التي تمنح شهادة:\n• " + withCert.join("\n• "),
                chips: CHIPS_DEFAULT
            };
        }

        if (intent === "payment") {
            return {
                text: "💳 طرق الدفع المتاحة:\n\n• زين كاش (Zain Cash)\n• كي كارد (Qi Card)\n• الدفع النقدي في المركز\n\nبعد اختيار طريقة الدفع داخل نافذة التسجيل يصل طلبك للمركز عبر واتساب، ويتواصل معك الفريق لتزويدك بتفاصيل الدفع وتأكيد الاشتراك.",
                chips: ["كيف أسجل؟", "أسعار الدورات"],
                link: true
            };
        }

        if (intent === "location") {
            return {
                text: "📍 موقع المركز:\n" + CENTER.address + "\n\nتقدر تفتح الموقع على الخريطة من هنا:\n" + CENTER.map,
                chips: ["تواصل معنا", "ما هي الدورات المتوفرة؟"]
            };
        }

        if (intent === "contact") {
            return {
                text: "☎️ وسائل التواصل مع المركز:\n\n" +
                      "• الهاتف / واتساب: " + CENTER.phone + "\n" +
                      "• البريد: " + CENTER.email + "\n" +
                      "• إنستغرام: " + CENTER.social.instagram + "\n" +
                      "• تيليگرام: " + CENTER.social.telegram + "\n" +
                      "• تيك توك: " + CENTER.social.tiktok,
                chips: ["أين موقع المركز؟", "ما هي الدورات المتوفرة؟"],
                link: true
            };
        }

        if (intent === "hours") {
            return {
                text: "أوقات الدوام تختلف حسب جدول الدورات والمجموعات.\nأفضل طريقة تعرف الوقت المناسب لك هي التواصل معنا مباشرة على " + CENTER.phone + " وراح نعطيك أقرب موعد متاح.",
                chips: ["كيف أسجل؟", "ما هي الدورات المتوفرة؟"],
                link: true
            };
        }

        if (intent === "discount") {
            return {
                text: "العروض والخصومات تُعلن على صفحات المركز في إنستغرام وتيليگرام، وأحياناً تكون هناك ورش مجانية.\nللاستفسار عن أي عرض حالي تواصل معنا على " + CENTER.phone + ".",
                chips: ["الورشات التدريبية", "أسعار الدورات"],
                link: true
            };
        }

        if (intent === "online") {
            return {
                text: "💻 الدراسة عن بُعد متوفرة في دورة «الحاسوب - إلكتروني» بسعر 50,000 د.ع، عبر محاضرات مسجّلة مع اختبارات وتطبيق عملي ومتابعة من المدرب.\nبقية الدورات حضورية في مقر المركز.",
                chips: ["تفاصيل الدورة الإلكترونية", "كيف أسجل؟"]
            };
        }

        if (intent === "about") {
            return {
                text: "🏛 " + CENTER.name + " مركز تدريبي متخصص بتطوير المهارات الرقمية والتقنية، انطلق عام " + CENTER.founded + ".\n\n" +
                      "• أكثر من 800 متدرب\n• أكثر من 20 مدرباً خبيراً\n• أكثر من 40 دورة وورشة تدريبية\n\n" +
                      "رسالتنا: بيئة تدريبية حديثة تؤهل الشباب لسوق العمل ببرامج عملية تواكب التطور التكنولوجي.",
                chips: CHIPS_DEFAULT
            };
        }

        /* ---------- بنك الأسئلة الموسّع (V29) ---------- */

        const smart = smartAnswer(text);

        if (smart) {
            return {
                text: smart,
                chips: ["ما هي الدورات المتوفرة؟", "أسعار الدورات", "كيف أسجل؟", "تواصل معنا"],
                link: smart.indexOf(CENTER.phone) !== -1
            };
        }

        /* ---------- مواضيع يسأل عنها الناس وغير متوفرة حالياً ---------- */

        const NOT_OFFERED = {
            "برمجه": "البرمجة", "برمجة": "البرمجة", "مواقع": "تصميم المواقع", "تطبيقات": "تطوير التطبيقات",
            "شبكات": "الشبكات", "محاسبه": "المحاسبة", "اوتوكاد": "الأوتوكاد", "رسم": "الرسم", "ثري دي": "التصميم ثلاثي الأبعاد"
        };

        let missing = null;
        Object.keys(NOT_OFFERED).forEach(function (k) {
            if (!missing && hasAny(text, [k])) missing = NOT_OFFERED[k];
        });

        if (missing) {
            return {
                text: "دورة " + missing + " غير مفتوحة ضمن البرامج المعلنة حالياً 🌿\n" +
                      "لكن المركز يقيم ورشاً ودورات جديدة بشكل دوري، وتقدر تسجّل اهتمامك وياهم عبر واتساب ليتم إعلامك عند فتحها.\n\n" +
                      "والمتوفر حالياً: الحاسوب، المونتاج، التصوير، الفوتوشوب، الاندزاين، اللغات، الذكاء الاصطناعي، الأمن السيبراني، والتسويق الإلكتروني.",
                chips: ["ما هي الدورات المتوفرة؟", "رشّح لي دورة", "تواصل معنا"],
                link: true
            };
        }

        /* ---------- لم يُفهم ---------- */

        /* ---------- لم يُفهم: نقترح أقرب المواضيع ---------- */

        /* محاولة أخيرة من قاعدة المعرفة بعتبة أقل */
        if (typeof window.KCIT_KB_ANSWER === "function") {

            const kbSoft = window.KCIT_KB_ANSWER(raw, 0.95);

            if (kbSoft) {
                return {
                    text: kbSoft,
                    chips: CHIPS_DEFAULT,
                    link: kbSoft.indexOf(CENTER.phone) !== -1
                };
            }
        }

        const guesses = [];

        Object.keys(courses).forEach(function (id) {
            const t = normalize(courses[id].title).split(" ")[0];
            if (t && text.indexOf(t.slice(0, 4)) !== -1) guesses.push(courses[id].title);
        });

        if (guesses.length) {
            return {
                text: "أعتقد تقصد إحدى هذه الدورات 👇\n• " + guesses.slice(0, 4).join("\n• ") +
                      "\n\nاكتب اسم الدورة وأعطيك تفاصيلها كاملة.",
                chips: guesses.slice(0, 3).concat(["أسعار الدورات"])
            };
        }

        return {
            text: "ما وصلتني المعلومة بدقة 🤔 بس أكيد أقدر أساعدك.\n\nأقدر أجاوبك عن:\n" +
                  "• تفاصيل أي دورة كاملة (السعر، المدة، الساعات، المقاعد، المدرب، الشهادة، موعد البدء)\n" +
                  "• قاعات الإيجار وأسعارها وحجزها\n" +
                  "• التسجيل وطرق الدفع\n" +
                  "• الورش والفعاليات القادمة\n" +
                  "• موقع المركز وأوقاته ووسائل التواصل\n\n" +
                  "جرّب تكتب مثلاً: «تفاصيل دورة التصوير» أو «شلون أسجل» أو «وين موقعكم».\n" +
                  "وإذا سؤالك خاص، تقدر ترسله مباشرة لفريق المركز:",
            chips: CHIPS_DEFAULT,
            link: true,
            askAI: true          /* يُجرَّب الخادم الذكي إن كان مفعّلاً في kb.js */
        };
    }


    /* =================================================================
       8) الواجهة
    ================================================================= */

    const fab = document.createElement("button");
    fab.className = "ai-fab";
    fab.setAttribute("aria-label", "فتح المساعد الذكي");
    fab.innerHTML = '<span class="ai-fab-icon" aria-hidden="true">✦</span><span>المساعد الذكي</span>';

    const panel = document.createElement("div");
    panel.className = "ai-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "المساعد الذكي لمركز كربلاء");
    panel.innerHTML = `
        <div class="ai-head">
            <div class="ai-head-avatar" aria-hidden="true">✦</div>
            <div class="ai-head-text">
                <strong>مساعد المركز الذكي</strong>
                <small><span class="ai-dot"></span> متصل الآن — يجيب فوراً</small>
            </div>
            <button class="ai-close" aria-label="إغلاق المساعد">×</button>
        </div>

        <div class="ai-body" id="aiBody"></div>

        <div class="ai-chips" id="aiChips"></div>

        <form class="ai-form" id="aiForm">
            <input class="ai-input" id="aiInput" type="text" autocomplete="off"
                   placeholder="اكتب سؤالك عن المركز..." aria-label="اكتب سؤالك">
            <button class="ai-send" type="submit" aria-label="إرسال">➤</button>
        </form>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(panel);

    const body     = panel.querySelector("#aiBody");
    const chipsBox = panel.querySelector("#aiChips");
    const form     = panel.querySelector("#aiForm");
    const input    = panel.querySelector("#aiInput");
    const closeBtn = panel.querySelector(".ai-close");

    function setChips(list) {

        chipsBox.innerHTML = "";

        (list && list.length ? list : CHIPS_DEFAULT).forEach(function (label) {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "ai-chip";
            chip.textContent = label;
            chip.addEventListener("click", function () { send(label); });
            chipsBox.appendChild(chip);
        });
    }

    function addMessage(text, who, withLink) {

        const msg = document.createElement("div");
        msg.className = "ai-msg " + who;
        msg.textContent = text;

        if (withLink) {
            const link = document.createElement("a");
            link.className = "ai-inline-link";
            link.href = WA;
            link.target = "_blank";
            link.rel = "noopener";
            link.textContent = "💬 تواصل عبر واتساب";
            msg.appendChild(link);
        }

        body.appendChild(msg);
        body.scrollTop = body.scrollHeight;
        return msg;
    }

    function typingBubble() {
        const msg = document.createElement("div");
        msg.className = "ai-msg bot";
        msg.innerHTML = '<span class="ai-typing"><i></i><i></i><i></i></span>';
        body.appendChild(msg);
        body.scrollTop = body.scrollHeight;
        return msg;
    }

    function runAction(action) {

        if (!action) return;

        if (action === "quiz") {
            closeAssistant();
            if (window.openCourseQuiz) setTimeout(window.openCourseQuiz, 320);
            return;
        }

        if (action.indexOf("register:") === 0) {
            const id = action.split(":")[1];
            closeAssistant();
            setTimeout(function () { if (typeof openRegistration === "function") openRegistration(id, null); }, 320);
        }
    }

    function send(text) {

        const value = String(text || "").trim();
        if (!value) return;

        addMessage(value, "user", false);
        input.value = "";

        const typing = typingBubble();
        const result = respond(value);

        const delay = 380 + Math.min(result.text.length * 4, 700);

        setTimeout(function () {

            /* سؤال حرّ لم تفهمه القاعدة المحلية → نجرّب الخادم إن كان مفعّلاً */
            if (result.askAI && typeof window.KCIT_ASK_AI === "function"
                && window.KCIT_AI && window.KCIT_AI.enabled && window.KCIT_AI.endpoint) {

                window.KCIT_ASK_AI(value)
                    .then(function (answer) {
                        typing.remove();
                        addMessage(answer || result.text, "bot", answer ? false : result.link);
                        setChips(result.chips);
                    })
                    .catch(function () {
                        typing.remove();
                        addMessage(result.text, "bot", result.link);
                        setChips(result.chips);
                    });

                return;
            }

            typing.remove();
            addMessage(result.text, "bot", result.link);
            setChips(result.chips);
            runAction(result.action);
        }, delay);
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        send(input.value);
    });

    function openAssistant() {

        panel.classList.add("active");
        document.body.classList.add("ai-open");

        if (!body.children.length) {
            const hour = new Date().getHours();
            const part = hour < 12 ? "صباح الخير 🌤" : (hour < 18 ? "مساء النور 🌿" : "مساء الخير 🌙");
            const welcome = (typeof window.KCIT_WELCOME === "string" && window.KCIT_WELCOME)
                ? window.KCIT_WELCOME
                : "أنا مساعدك الذكي؛ أعرف كل تفاصيل الدورات والأسعار والقاعات والتسجيل.\n\nاسألني أي شيء، أو اختر من الاقتراحات بالأسفل.";

            addMessage(part + "، " + welcome, "bot", false);
            setChips(CHIPS_DEFAULT.concat(["رشّح لي دورة"]));
        }

        if (window.innerWidth > 560) setTimeout(function () { input.focus(); }, 350);
    }

    function closeAssistant() {
        if (!panel.classList.contains("active")) return;
        panel.classList.remove("active");
        document.body.classList.remove("ai-open");
    }

    fab.addEventListener("click", openAssistant);
    closeBtn.addEventListener("click", closeAssistant);

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && panel.classList.contains("active")) closeAssistant();
    });

    new MutationObserver(function () {
        if (document.body.classList.contains("menu-open") ||
            document.body.classList.contains("modal-open")) closeAssistant();
    }).observe(document.body, { attributes: true, attributeFilter: ["class"] });

    window.kcitAssistant = { open: openAssistant, ask: send };

})();


/* =====================================================================
   V13 — الدفع الإلكتروني عبر بوابة زين كاش
   =====================================================================
   ضع رابط خادم الدفع (Apps Script) بالأسفل لتفعيل الدفع الفعلي.
   إن بقي فارغاً يعمل الموقع كما هو: يُرسل طلب الدفع عبر واتساب.

   ⚠️ لا يُرسَل المبلغ من هنا إطلاقاً — الخادم يقرأ السعر من عنده،
      فلا يستطيع أحد تعديل المبلغ من أدوات المطوّر.

   الشرح الكامل في: payment-setup.md
===================================================================== */

const PAYMENT_ENDPOINT = "";

(function electronicPayment() {

    if (!PAYMENT_ENDPOINT) return;

    const originalSend = window.sendPaymentWhatsApp;

    window.sendPaymentWhatsApp = function () {

        if (!activeView || !paymentMethod) return;

        /* كي كارد يبقى عبر واتساب حتى تُفعّل بوابته */
        if (paymentMethod !== "زين كاش") return originalSend();

        const data = getRegistrationData();

        /* تسجيل الطلب في الجدول قبل التحويل، حتى لو لم يُكمل الدفع */
        saveRegistrationRecord({
            type: "دورة",
            course: activeView.fullTitle,
            price: activeView.price,
            paid: false,
            paymentMethod: "زين كاش",
            name: data.name,
            phone: data.phone,
            birthdate: data.birthdate,
            note: "بانتظار إتمام الدفع الإلكتروني",
            createdAt: new Date().toISOString()
        });

        const query =
            "?action=pay" +
            "&course=" + encodeURIComponent(activeView.id) +
            (activeView.trackId ? "&track=" + encodeURIComponent(activeView.trackId) : "") +
            "&name=" + encodeURIComponent(data.name) +
            "&phone=" + encodeURIComponent(data.phone) +
            "&birthdate=" + encodeURIComponent(data.birthdate);

        const btn = document.getElementById("paymentConfirmBtn");
        if (btn) {
            btn.disabled = true;
            btn.textContent = "جاري التحويل إلى بوابة الدفع…";
        }

        window.location.href = PAYMENT_ENDPOINT + query;
    };

    /* تسمية الزر بحسب الطريقة المختارة */
    const originalSelect = window.selectPayment;

    window.selectPayment = function (method) {

        originalSelect(method);

        const btn = document.getElementById("paymentConfirmBtn");
        if (!btn) return;

        btn.innerHTML = (method === "zain")
            ? "<span>المتابعة إلى الدفع الآمن</span>"
            : "<span>تأكيد وإرسال الطلب عبر واتساب</span>";
    };

})();


/* =====================================================================
   V15 — طبقة الحركة والترتيب النهائي
   =====================================================================
   1) توزيع حركات الظهور على كل الأقسام والعناصر باتجاهات مناسبة
   2) ترتيب نافذة القاعة: تمرير المصغّرات وأسهم لوحة المفاتيح
   3) تفاصيل صغيرة تجعل التنقّل أنعم على الهاتف

   كل ذلك يتوقف تلقائياً إذا فعّل المستخدم «تقليل الحركة» في جهازه.
===================================================================== */

(function motionLayer() {

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    /* ---------- 1) توزيع حركات الظهور ---------- */

    function mark(selector, variant, stagger, scope) {

        const list = (scope || document).querySelectorAll(selector);

        list.forEach(function (el, i) {

            if (el.classList.contains("reveal")) {
                /* عنصر عليه حركة أصلاً — نضيف الاتجاه فقط إن لم يكن له اتجاه */
                if (variant && !/reveal-(right|left|zoom|soft)/.test(el.className)) {
                    el.classList.add(variant);
                }
                return;
            }

            el.classList.add("reveal");
            if (variant) el.classList.add(variant);

            if (stagger && !el.style.getPropertyValue("--d")) {
                el.style.setProperty("--d", (i % 6) * stagger + "s");
            }
        });
    }

    /* بطاقات الإحصاء تكبر بلطف */
    mark(".stat-card", "reveal-zoom", 0.08);

    /* منصات التواصل */
    mark(".social-card", "reveal-soft", 0.07);
    mark(".social-heading", "reveal-soft", 0);

    /* بقية العناصر */
    mark(".workshops-notice", "reveal-soft", 0);
    mark(".hall-card", null, 0.09);
    mark(".contact-card", null, 0.08);
    mark(".footer-content", "reveal-soft", 0);
    mark(".mission-heading h2", "reveal-soft", 0);

    if (typeof observeReveals === "function") observeReveals(document);


    /* ---------- 2) نافذة القاعة: ترتيب المصغّرات ولوحة المفاتيح ---------- */

    const hallModal = document.getElementById("hallModal");

    if (hallModal) {

        /* المصغّرة النشطة تبقى ظاهرة داخل الشريط */
        const strip = document.getElementById("modalThumbnails");

        if (strip) {
            const sync = function () {
                const active = strip.querySelector("img.active");
                if (!active) return;
                active.scrollIntoView({
                    behavior: reduced ? "auto" : "smooth",
                    block: "nearest",
                    inline: "center"
                });
            };

            new MutationObserver(sync).observe(strip, {
                subtree: true,
                attributes: true,
                attributeFilter: ["class"]
            });
        }

        /* الأسهم في لوحة المفاتيح تتنقّل بين الصور */
        document.addEventListener("keydown", function (e) {

            if (!hallModal.classList.contains("active")) return;

            if (e.key === "ArrowLeft"  && typeof nextHallImage === "function")     nextHallImage();
            if (e.key === "ArrowRight" && typeof previousHallImage === "function") previousHallImage();
        });

        /* السحب الأفقي على الصورة يبدّلها (الهاتف) */
        const gallery = hallModal.querySelector(".modal-gallery");

        if (gallery) {

            let startX = null;

            gallery.addEventListener("touchstart", function (e) {
                startX = e.touches[0].clientX;
            }, { passive: true });

            gallery.addEventListener("touchend", function (e) {

                if (startX === null) return;

                const delta = e.changedTouches[0].clientX - startX;
                startX = null;

                if (Math.abs(delta) < 45) return;

                if (delta < 0 && typeof nextHallImage === "function")     nextHallImage();
                if (delta > 0 && typeof previousHallImage === "function") previousHallImage();
            }, { passive: true });
        }
    }


    /* ---------- 3) تمرير المحتوى إلى أعلى النافذة عند فتحها ---------- */

    ["registrationModal", "paymentModal"].forEach(function (id) {

        const shell = document.getElementById(id);
        if (!shell) return;

        new MutationObserver(function () {

            if (!shell.classList.contains("active")) return;

            const scroller = shell.querySelector(".modal-scroll") || shell.querySelector(".modal-card");
            if (scroller) scroller.scrollTop = 0;

        }).observe(shell, { attributes: true, attributeFilter: ["class"] });
    });

})();


/* =====================================================================
   V15 · شبكة أمان للظهور
   =====================================================================
   المراقب (IntersectionObserver) قد لا يلتقط عنصراً إذا قفز الزائر
   عبر القائمة إلى قسم بعيد أو مرّر بسرعة كبيرة، فيبقى العنصر شفافاً.
   هذه الحلقة تضمن ظهور أي عنصر وصل إلى الشاشة أو تجاوزها.
===================================================================== */

(function revealSafetyNet() {

    let scheduled = false;

    function sweep() {

        scheduled = false;

        const pending = document.querySelectorAll(".reveal:not(.in-view)");
        if (!pending.length) return;

        const limit = window.innerHeight * 0.94;

        pending.forEach(function (el) {

            const box = el.getBoundingClientRect();

            /* ظهر في الشاشة أو مررنا فوقه */
            if (box.top > limit) return;

            el.classList.add("in-view");

            const counter = el.querySelector(".counter");
            if (counter && typeof animateCounter === "function") animateCounter(counter);
        });
    }

    function schedule() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(sweep);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    document.addEventListener("visibilitychange", schedule);

    /* عند فلترة الدورات أو البحث تتغيّر مواضع البطاقات بلا تمرير،
       فنعيد الفحص حتى لا تبقى بطاقة ظهرت للتو شفافة. */
    const grid = document.getElementById("coursesGrid");

    if (grid) {
        new MutationObserver(schedule).observe(grid, {
            attributes: true,
            subtree: true,
            attributeFilter: ["style", "class"]
        });
    }

    setTimeout(schedule, 600);

})();


/* =====================================================================
   V15 · شبكة أمان للخط الزمني
   إذا مرّ الزائر بسرعة أو قفز من القائمة، تظهر كل البطاقات فوراً
   بدل أن تبقى فارغة بانتظار دورها في التسلسل.
===================================================================== */

(function timelineSafetyNet() {

    const timeline = document.getElementById("storyTimeline");
    if (!timeline) return;

    const items = Array.from(timeline.querySelectorAll(".timeline-item"));
    if (!items.length) return;

    const fill = document.getElementById("timelineLineFill");

    /* لا نتدخّل إلا فيما تجاوزه الزائر فعلاً، حتى لا نُفسد التسلسل */
    function sweep() {

        let revealedAll = true;

        items.forEach(function (item) {

            if (item.classList.contains("text-in")) return;

            const box = item.getBoundingClientRect();

            /* البطاقة خرجت من أعلى الشاشة — لم يعد لظهورها التدريجي معنى */
            if (box.bottom < 0) {
                item.classList.add("year-in", "text-in");
            } else {
                revealedAll = false;
            }
        });

        /* عند ظهور آخر بطاقة نكمل الخط حتى نهايته */
        if (revealedAll && fill) {
            const last = items[items.length - 1].getBoundingClientRect();
            const top  = timeline.getBoundingClientRect().top;
            const end  = (last.top - top) + last.height;
            if (parseFloat(fill.style.height || 0) < end) fill.style.height = end + "px";
        }
    }

    let queued = false;

    function schedule() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () { queued = false; sweep(); });
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    setTimeout(schedule, 800);

})();


/* =====================================================================
   V16 — حاسبة حجز القاعة: تاريخ عربي واضح ومنع اختيار يوم مضى
===================================================================== */



/* =====================================================================
   V18 — إعادة ترتيب نافذة تفاصيل القاعة
   =====================================================================
   • مقبض سحب أعلى النافذة على الهاتف
   • عدّاد صور «١ / ٦» فوق الصورة
   • الكلفة وزر الحجز في شريط ثابت أسفل النافذة لا يختفي مع التمرير
===================================================================== */



/* =====================================================================
   V19 — نص إرشادي داخل حقل تاريخ الحجز ما دام فارغاً
   (سفاري لا يعرض شيئاً مفهوماً في الحقل الفارغ)
===================================================================== */



/* =====================================================================
   ╔═══════════════════════════════════════════════════════════════╗
   ║  V20 — قسم آراء المتدربين                                     ║
   ╚═══════════════════════════════════════════════════════════════╝

   ✏️ كيف تعدّل الآراء:
      • غيّر الاسم والدورة والتقييم والنص في المصفوفة بالأسفل.
      • لإضافة رأي: انسخ سطراً كاملاً بين { } وضعه في النهاية.
      • لحذف رأي: امسح سطره كاملاً.
      • إذا أفرغت المصفوفة تماماً يختفي القسم من الموقع تلقائياً.

   ⚠️ الآراء الحالية نموذجية للتصميم فقط — استبدلها بآراء حقيقية
      لمتدربين أكملوا دوراتهم، ثم اجعل السطر التالي false ليختفي
      التنبيه الأصفر من الصفحة.
===================================================================== */

const TESTIMONIALS_DEMO = false;

const TESTIMONIALS = [

    { name: "زهراء عبد الرضا",  course: "دورة الحاسوب",          rating: 5, text: "اكثر شي عجبني بالمركز سهولة التعامل والاخلاق والادب والتطور تجربة جميلة في هذا المركز واكثر من رائعة." },
    { name: "عبد الله محمد",  course: "دورة التصوير",           rating: 5, text: "اكثر ما يميز مركزكم هو الحب الي نشوفة بعيونكم وتعاونكم على تقديم افضل خدمة بأحلى طريقة." },
    { name: "مؤمل حاكم",  course: "دورة المونتاج",          rating: 5, text: "كانت الدورة جيدة جداً حيث استفدت من معلومات الدورة وطبقتها شخصياً بالاضافة الى الاجواء التعليمية لطيفة وهادئة شكراً لكم." },
    { name: "بنين يعقوب يوسف",  course: "ورشة الفوتوشوب",         rating: 5, text: " مركز كربلاء من المراكز الجيدة جداً في تقديمه الدورات المتعددة والورشات المفيدة جداً شكراً لخدماتكم ." },
    { name: "غدير يحيى",  course: "دورة اللغة الإنجليزية",  rating: 5, text: "الدورة جميلة جداً والكادر متعاون والمكان مناسب وجميل واجواء تعليمية فعالة." },
    { name: "حسين ازهر",  course: "ورشة الاندزاين",  rating: 5, text: "اتقدم بالشكر الجزيل لمركزكم على تقديم هذه الورش واشكر استاذ ادم على سلاسة الشرح." },
    { name: "فاطمة علي مطر",  course: "دورة الأمن السيبراني",   rating: 5, text: "طبعاً كانت دورة مليئة بالمعلومات القيمة وكانت الاستفادة منها جيدة وكان الاستاذ جداً متعاون معنا فشكراً لمركز كربلاء على تقديم هذه الدورات." },
    { name: "اسد حيدر عبد الحسين",  course: "دورة التسويق الإلكتروني", rating: 5, text: "من البداية المكان لطيف والمدرب اكثر من رائع شكراً لكم على هذه الدورة." },
    { name: "حسين حيدر عبد الحسين",  course: "ورشة التصميم",         rating: 5, text: "خدمات المركز جيدة جداً وممتازة جداً والمركز متطور والمحاضرات والورش جيدة والمدربين اكفاء ومركز متكامل ." },
    { name: "رضا جاسم", course: "دورة الامن السيبراني",     rating: 5, text: "دورة جميلة وتحمل معلومات كثيرة ومفيدة واجمل من ذلك الاستاذ متفهم ويشرح بطريقة سهلة وجميلة." },
    { name: "نبأ صبيح هادي", course: "ورشة الفوتوشوب", rating: 5, text: "جيد جداً من ناحية تقديم العرض والشرح المبسط والاساسي للبرنامج يغطي بشكل عام كافة المحتويات الاساسية المركز ايجابي من كل النواحي." },
    { name: "انمار محمد جواد", course: "دورة التصوير",           rating: 5, text: "الدورة كانت جميلة واستفاديت كثيراً من المعلومات والموظفين كانو لطفاء والمدرب كان جميل في اداء المحاضرة  ." },
    { name: "نورهان مدحت", course: "دورة الحاسوب ",   rating: 5, text: "بالنسبة للمكان ممتاز جداً من حيث مساحة المكان كبيرة والكادر يوصف اكثر من رائع لكوني مشتركة بأكثر من مكان ولم اجد هذه الامكانية من حيث التدريس والاسلوب الراقي." },
    { name: "مهدي خضير مهدي", course: "دورة المونتاج",          rating: 5, text: "دورة جداً رائعة وكذلك اكتسبنا الكثير من المعلومات التي تهيأنا الى سوق العمل ." },
    { name: "شهد كاظم غازي", course: "دورة الفوتوشوب",         rating: 5, text: "طريقة التعامل من قبل مديرة المركز والكادر ممتازة والدورة كانت مفيدة شكراً جزيلاً لكم." }

];


(function buildTestimonials() {

    const grid    = document.getElementById("voicesGrid");
    const section = document.getElementById("voices");
    if (!grid || !section) return;

    /* لا آراء = لا قسم */
    if (!TESTIMONIALS.length) {
        section.remove();
        document.querySelectorAll('.menu-links a[href="#voices"]').forEach(function (a) { a.remove(); });
        return;
    }

    const VISIBLE_AT_FIRST = 6;

    TESTIMONIALS.forEach(function (item, i) {

        const rating = Math.max(1, Math.min(5, Number(item.rating) || 5));

        const card = document.createElement("article");
        card.className = "voice-card reveal reveal-soft";
        card.style.setProperty("--d", ((i % 3) * 0.07) + "s");
        if (i >= VISIBLE_AT_FIRST) card.classList.add("is-extra");

        let stars = "";
        for (let s = 1; s <= 5; s++) {
            stars += '<span class="' + (s <= rating ? "on" : "off") + '">★</span>';
        }

        card.innerHTML =
            '<div class="voice-top">' +
                '<strong class="voice-name">' + escapeHtml(item.name || "") + "</strong>" +
                (item.course ? '<span class="voice-course">' + escapeHtml(item.course) + "</span>" : "") +
            "</div>" +
            '<div class="voice-stars" aria-label="التقييم ' + rating + ' من 5">' + stars + "</div>" +
            '<p class="voice-text">' + escapeHtml(item.text || "") + "</p>" +
            '<span class="voice-quote" aria-hidden="true">”</span>';

        grid.appendChild(card);
    });


    /* زر عرض المزيد — يظهر فقط إذا كان هناك ما يُخفى */

    const more = document.getElementById("voicesMore");

    if (more && TESTIMONIALS.length > VISIBLE_AT_FIRST) {

        more.hidden = false;
        grid.classList.add("is-clipped");

        more.addEventListener("click", function () {

            grid.classList.remove("is-clipped");
            more.hidden = true;

            if (typeof observeReveals === "function") observeReveals(grid);
        });
    }


    /* تنبيه الآراء النموذجية */

    const note = document.getElementById("voicesDemoNote");

    if (note && TESTIMONIALS_DEMO) {
        note.className = "voices-demo-note";
        note.innerHTML =
            "<strong>هذه آراء نموذجية للتصميم فقط</strong>" +
            "<span>استبدلها بآراء متدربين حقيقيين من ملف <b>script.js</b> (ابحث عن TESTIMONIALS)، " +
            "ثم اجعل <b>TESTIMONIALS_DEMO = false</b> ليختفي هذا التنبيه.</span>";
    }

    if (typeof observeReveals === "function") observeReveals(section);

})();


/* =====================================================================
   V21 — إظهار موعد البدء والمقاعد داخل نافذة التسجيل أيضاً
   حتى يرى المتدرب الموعد قبل أن يكتب بياناته.
===================================================================== */

(function registrationSchedule() {

    const head = document.querySelector(".reg-course-head");
    if (!head) return;

    const line = document.createElement("p");
    line.className = "reg-course-when";
    head.appendChild(line);

    const originalOpen = window.openRegistration;

    window.openRegistration = function (courseId, trackId) {

        originalOpen(courseId, trackId);

        const meta = (typeof getCourseMeta === "function") ? getCourseMeta(courseId) : null;

        if (!meta) { line.textContent = ""; line.classList.remove("show"); return; }

        const parts = [];

        if (meta.dateText && meta.dateText.trim()) {
            parts.push(meta.dateText.trim());
        } else {
            const when = (typeof formatCourseDate === "function") ? formatCourseDate(meta.startDate) : "";
            if (when) parts.push("تبدأ " + when);
        }

        if (meta.seatsText && meta.seatsText.trim()) {
            parts.push(meta.seatsText.trim());
        } else {
            const seats = Number(meta.seatsLeft);
            if (meta.seatsLeft !== null && meta.seatsLeft !== "" && !isNaN(seats) && seats > 0) {
                parts.push(seatsText(seats));
            }
        }

        line.textContent = parts.join("  ·  ");
        line.classList.toggle("show", parts.length > 0);
    };

})();


/* =====================================================================
   V23 — إغلاق باب التسجيل فعلياً لا شكلاً
   =====================================================================
   الزر معطّل بصرياً، وهذه الطبقة تمنع فتح النافذة بأي طريقة أخرى:
   رابط مباشر مثل ‎#course=photoshop‎ أو ضغطة على البطاقة.
   نافذة التسجيل لا تُفتح إلا في حالة "open".
===================================================================== */

(function lockClosedCourses() {

    const originalOpen = window.openRegistration;

    window.openRegistration = function (courseId, trackId) {

        const meta = (typeof getCourseMeta === "function") ? getCourseMeta(courseId) : null;

        if (meta && meta.status !== "open") {

            const message = meta.status === "full"   ? "اكتمل عدد المقاعد في هذه الدورة"
                          : meta.status === "soon"   ? "لم يُفتح التسجيل في هذه الدورة بعد"
                          :                            "التسجيل في هذه الدورة مغلق حالياً";

            if (typeof showToast === "function") {
                showToast(message + " — تواصل معنا عبر واتساب للاستفسار");
            }

            return;
        }

        originalOpen(courseId, trackId);
    };

})();

/* =====================================================================
   ╔═══════════════════════════════════════════════════════════════╗
   ║  V25 — نظام حجز القاعات على شكل مراحل                         ║
   ╚═══════════════════════════════════════════════════════════════╝

   ثلاث مراحل بالتسلسل:
     ١) بيانات مقدّم الطلب
     ٢) تفاصيل الفعالية والتجهيزات
     ٣) الموعد والكلفة والملاحظات

   في النهاية تُجهَّز رسالة كاملة وتُرسل إلى واتساب المركز.

   ✏️ لتعديل أنواع الفعاليات أو التجهيزات، غيّر المصفوفتين بالأسفل.
===================================================================== */

const EVENT_TYPES = [
    "دورة تدريبية",
    "ورشة عمل",
    "اجتماع",
    "مؤتمر",
    "امتحان",
    "محاضرة",
    "فعالية أخرى"
];

const EQUIPMENT = [
    { id: "screen",  label: "شاشة تفاعلية" },
    { id: "pcs",     label: "أجهزة حاسوب", count: true },
    { id: "board",   label: "سبورة" },
    { id: "record",  label: "تصوير / تسجيل" },
    { id: "other",   label: "تجهيزات أخرى", note: true }
];


(function hallBookingWizard() {

    if (typeof hallsData === "undefined") return;

    let currentHall = null;
    let currentId   = null;
    let step        = 1;
    let bkFormOpenedAt = 0; /* لمكافحة البوتات — وقت فتح نموذج الحجز */

    const TOTAL_STEPS = 3;


    /* ---------- بناء النافذة ---------- */

    const shell = document.createElement("div");
    shell.className = "modal-shell booking-shell";
    shell.id = "hallBookingModal";
    shell.setAttribute("aria-hidden", "true");

    shell.innerHTML =
        '<div class="modal-overlay-base" data-close="1"></div>' +

        '<div class="modal-card booking-card" role="dialog" aria-modal="true" aria-labelledby="bkHallName">' +

            '<span class="sheet-handle" aria-hidden="true"></span>' +
            '<button class="modal-close" type="button" data-close="1" aria-label="إغلاق">×</button>' +

            /* رأس ثابت */
            '<div class="booking-head">' +
                '<span class="booking-eyebrow">حجز قاعة</span>' +
                '<h2 id="bkHallName">اسم القاعة</h2>' +
                '<div class="booking-rate"><small>سعر الساعة</small><strong id="bkHallRate">-</strong></div>' +
            "</div>" +

            /* شريط المراحل */
            '<div class="modal-steps" id="bkSteps">' +
                '<div class="modal-step active" data-step="1">' +
                    '<span class="step-num">1</span><span class="step-label">بياناتك</span>' +
                "</div>" +
                '<span class="step-line" data-line="1"></span>' +
                '<div class="modal-step" data-step="2">' +
                    '<span class="step-num">2</span><span class="step-label">الفعالية</span>' +
                "</div>" +
                '<span class="step-line" data-line="2"></span>' +
                '<div class="modal-step" data-step="3">' +
                    '<span class="step-num">3</span><span class="step-label">الموعد</span>' +
                "</div>" +
            "</div>" +

            /* المحتوى */
            '<div class="modal-scroll booking-scroll">' +

                /* ═══ المرحلة 1 ═══ */
                '<section class="booking-step" data-panel="1">' +

                    /* حقل فخّ لمكافحة البوتات — مخفي تماماً عن المستخدم الحقيقي */
                    '<div class="form-group kcit-honeypot" aria-hidden="true">' +
                        '<label for="bkWebsite">اتركه فارغاً</label>' +
                        '<input type="text" id="bkWebsite" name="website" tabindex="-1" autocomplete="off">' +
                    "</div>" +

                    '<div class="form-group">' +
                        '<label class="form-label" for="bkName">الاسم الكامل</label>' +
                        '<input class="form-input" type="text" id="bkName" placeholder="مثال: علي محمد حسين" autocomplete="name" maxlength="60">' +
                        '<span class="form-error" data-err="bkName"></span>' +
                    "</div>" +

                    '<div class="form-group">' +
                        '<label class="form-label" for="bkPhone">رقم الهاتف (يحتوي على واتساب)</label>' +
                        '<input class="form-input" type="tel" id="bkPhone" placeholder="07XXXXXXXXX" inputmode="numeric" maxlength="11" autocomplete="tel">' +
                        '<span class="form-error" data-err="bkPhone"></span>' +
                    "</div>" +

                    '<div class="form-group">' +
                        '<label class="form-label" for="bkOrg">اسم الشركة / المؤسسة / الفريق</label>' +
                        '<input class="form-input" type="text" id="bkOrg" placeholder="اكتب اسم جهتك، أو «بصفة شخصية»">' +
                        '<span class="form-error" data-err="bkOrg"></span>' +
                    "</div>" +

                "</section>" +

                /* ═══ المرحلة 2 ═══ */
                '<section class="booking-step" data-panel="2" hidden>' +

                    '<div class="form-group">' +
                        '<label class="form-label" for="bkType">نوع الفعالية</label>' +
                        '<select class="form-input" id="bkType">' +
                            '<option value="">اختر نوع الفعالية…</option>' +
                            EVENT_TYPES.map(function (t) {
                                return '<option value="' + escapeHtml(t) + '">' + escapeHtml(t) + "</option>";
                            }).join("") +
                        "</select>" +
                        '<span class="form-error" data-err="bkType"></span>' +
                    "</div>" +

                    '<div class="form-group" id="bkTypeOtherBox" hidden>' +
                        '<label class="form-label" for="bkTypeOther">اذكر نوع الفعالية</label>' +
                        '<input class="form-input" type="text" id="bkTypeOther" placeholder="اكتب نوع الفعالية">' +
                        '<span class="form-error" data-err="bkTypeOther"></span>' +
                    "</div>" +

                    '<div class="form-group">' +
                        '<span class="form-label">التجهيزات المطلوبة</span>' +

                        '<div class="check-list">' +
                            EQUIPMENT.map(function (eq) {
                                return '<label class="check-item">' +
                                        '<input type="checkbox" data-eq="' + eq.id + '">' +
                                        '<span class="check-box" aria-hidden="true"></span>' +
                                        '<span class="check-text">' + escapeHtml(eq.label) + "</span>" +
                                    "</label>" +
                                    (eq.count
                                        ? '<input class="form-input check-extra" type="number" min="1" max="60" ' +
                                          'id="bkPcsCount" placeholder="كم جهازاً؟" hidden>'
                                        : "") +
                                    (eq.note
                                        ? '<input class="form-input check-extra" type="text" ' +
                                          'id="bkEqOther" placeholder="اذكر التجهيزات المطلوبة" hidden>'
                                        : "");
                            }).join("") +
                        "</div>" +

                    "</div>" +

                "</section>" +

                /* ═══ المرحلة 3 ═══ */
                '<section class="booking-step" data-panel="3" hidden>' +

                    '<div class="booking-row">' +

                        '<label class="form-group">' +
                            '<span class="form-label">تاريخ الحجز</span>' +
                            '<input class="form-input" type="date" id="bkDate">' +
                            '<span class="form-error" data-err="bkDate"></span>' +
                        "</label>" +

                        '<label class="form-group">' +
                            '<span class="form-label">وقت البدء</span>' +
                            '<input class="form-input" type="time" id="bkTime" value="10:00">' +
                        "</label>" +

                        '<label class="form-group">' +
                            '<span class="form-label">عدد الساعات</span>' +
                            '<input class="form-input" type="number" id="bkHours" min="1" max="12" value="2">' +
                        "</label>" +

                    "</div>" +

                    '<p class="booking-date-preview" id="bkDatePreview"></p>' +

                    '<div class="form-group">' +
                        '<label class="form-label" for="bkNotes">ملاحظات إضافية</label>' +
                        '<textarea class="form-input" id="bkNotes" rows="3" ' +
                            'placeholder="اكتب أي متطلبات أو ملاحظات خاصة بالحجز…"></textarea>' +
                    "</div>" +

                    '<div class="booking-summary" id="bkSummary"></div>' +

                "</section>" +

            "</div>" +

            /* شريط الأزرار */
            '<div class="booking-actions">' +
                '<div class="booking-total" id="bkTotalBox" hidden>' +
                    "<span>الكلفة التقديرية</span>" +
                    '<strong id="bkTotal">0 د.ع</strong>' +
                "</div>" +
                '<div class="booking-nav">' +
                    '<button class="booking-btn booking-back" type="button" id="bkBack" hidden>السابق</button>' +
                    '<button class="booking-btn booking-next" type="button" id="bkNext">' +
                        "<span>التالي</span><b>←</b>" +
                    "</button>" +
                "</div>" +
            "</div>" +

        "</div>";

    document.body.appendChild(shell);


    /* ---------- عناصر ---------- */

    const $ = function (id) { return document.getElementById(id); };

    const nextBtn = $("bkNext");
    const backBtn = $("bkBack");
    const dateEl  = $("bkDate");
    const hoursEl = $("bkHours");
    const timeEl  = $("bkTime");


    /* ---------- أدوات ---------- */

    function priceNumber(text) {
        return Number(String(text || "").replace(/[^0-9]/g, "")) || 0;
    }

    function total() {
        const hours = Math.max(1, Math.min(12, Number(hoursEl.value) || 1));
        return priceNumber(currentHall && currentHall.price) * hours;
    }

    function hasPrice() {
        return priceNumber(currentHall && currentHall.price) > 0;
    }

    function refreshTotal() {

        const box = $("bkTotalBox");

        $("bkTotal").textContent = hasPrice()
            ? total().toLocaleString("en-US") + " د.ع"
            : "يُحدد بعد إرسال الطلب";

        box.hidden = (step !== 3);
    }

    function setError(id, message) {
        const el = document.querySelector('[data-err="' + id + '"]');
        if (el) el.textContent = message || "";
        const field = $(id);
        if (field) field.classList.toggle("has-error", !!message);
    }

    function clearErrors() {
        shell.querySelectorAll(".form-error").forEach(function (e) { e.textContent = ""; });
        shell.querySelectorAll(".has-error").forEach(function (e) { e.classList.remove("has-error"); });
    }


    /* ---------- التنقّل بين المراحل ---------- */

    function showStep(n) {

        step = n;

        shell.querySelectorAll(".booking-step").forEach(function (sec) {
            sec.hidden = Number(sec.dataset.panel) !== n;
        });

        shell.querySelectorAll(".modal-step").forEach(function (el) {
            const i = Number(el.dataset.step);
            el.classList.toggle("active", i === n);
            el.classList.toggle("done", i < n);
        });

        shell.querySelectorAll(".step-line").forEach(function (el) {
            el.classList.toggle("done", Number(el.dataset.line) < n);
        });

        backBtn.hidden = (n === 1);

        nextBtn.innerHTML = (n === TOTAL_STEPS)
            ? "<span>إرسال طلب الحجز عبر واتساب</span><b>←</b>"
            : "<span>التالي</span><b>←</b>";

        nextBtn.classList.toggle("is-send", n === TOTAL_STEPS);

        if (n === 3) { renderSummary(); refreshTotal(); }
        else refreshTotal();

        const scroller = shell.querySelector(".booking-scroll");
        if (scroller) scroller.scrollTop = 0;
    }


    /* ---------- التحقّق ---------- */

    function validateStep(n) {

        clearErrors();
        let ok = true;

        if (n === 1) {

            const name = $("bkName").value.trim();
            if (name.length < 5 || name.split(/\s+/).length < 2) {
                setError("bkName", "اكتب اسمك الكامل");
                ok = false;
            }

            const phone = $("bkPhone").value.replace(/\s/g, "");
            if (!/^07[0-9]{9}$/.test(phone)) {
                setError("bkPhone", "رقم غير صحيح — مثال: 07701234567");
                ok = false;
            }

            if (!$("bkOrg").value.trim()) {
                setError("bkOrg", "اكتب اسم الجهة أو «بصفة شخصية»");
                ok = false;
            }
        }

        if (n === 2) {

            const type = $("bkType").value;
            if (!type) { setError("bkType", "اختر نوع الفعالية"); ok = false; }

            if (type === "فعالية أخرى" && !$("bkTypeOther").value.trim()) {
                setError("bkTypeOther", "اذكر نوع الفعالية");
                ok = false;
            }
        }

        if (n === 3) {
            if (!dateEl.value) { setError("bkDate", "اختر تاريخ الحجز"); ok = false; }
        }

        if (!ok) {
            const first = shell.querySelector(".has-error");
            if (first) { first.focus(); first.scrollIntoView({ block: "center", behavior: "smooth" }); }
        }

        return ok;
    }


    /* ---------- جمع البيانات ---------- */

    function collect() {

        const type = $("bkType").value;

        const equipment = [];

        EQUIPMENT.forEach(function (eq) {

            const box = shell.querySelector('[data-eq="' + eq.id + '"]');
            if (!box || !box.checked) return;

            if (eq.id === "pcs") {
                const count = $("bkPcsCount").value.trim();
                equipment.push(eq.label + (count ? " (" + count + " جهاز)" : ""));
            } else if (eq.id === "other") {
                const note = $("bkEqOther").value.trim();
                equipment.push(note ? note : eq.label);
            } else {
                equipment.push(eq.label);
            }
        });

        return {
            hall:      currentHall ? currentHall.title : "",
            rate:      currentHall ? currentHall.price : "",
            name:      $("bkName").value.trim(),
            phone:     $("bkPhone").value.trim(),
            org:       $("bkOrg").value.trim(),
            type:      type === "فعالية أخرى" ? $("bkTypeOther").value.trim() : type,
            equipment: equipment,
            date:      dateEl.value,
            time:      timeEl.value,
            hours:     Math.max(1, Math.min(12, Number(hoursEl.value) || 1)),
            notes:     $("bkNotes").value.trim(),
            total:     total()
        };
    }


    /* ---------- ملخّص قبل الإرسال ---------- */

    function renderSummary() {

        const d = collect();
        const rows = [];

        rows.push(["القاعة", d.hall]);
        if (d.type) rows.push(["نوع الفعالية", d.type]);
        if (d.equipment.length) rows.push(["التجهيزات", d.equipment.join("، ")]);

        $("bkSummary").innerHTML =
            '<div class="booking-summary-title">ملخّص الطلب</div>' +
            rows.map(function (r) {
                return '<div class="booking-summary-row"><span>' + escapeHtml(r[0]) +
                       "</span><strong>" + escapeHtml(r[1]) + "</strong></div>";
            }).join("");
    }


    /* ---------- رسالة واتساب ---------- */

    function buildMessage(d) {

        const when = d.date
            ? new Date(d.date + "T00:00:00").toLocaleDateString("ar-IQ-u-nu-latn", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric"
              })
            : "-";

        const SEP = "━━━━━━━━━━━━━━━";

        /* وقت النهاية المتوقّع */
        let endTime = "";
        if (d.time && /^\d{1,2}:\d{2}$/.test(d.time)) {
            const parts = d.time.split(":");
            const mins  = (Number(parts[0]) * 60 + Number(parts[1]) + d.hours * 60) % 1440;
            endTime = String(Math.floor(mins / 60)).padStart(2, "0") + ":" +
                      String(mins % 60).padStart(2, "0");
        }

        const now = new Date();
        const sentAt = now.toLocaleDateString("ar-IQ-u-nu-latn", {
            year: "numeric", month: "long", day: "numeric"
        }) + " - " + now.toLocaleTimeString("ar-IQ-u-nu-latn", {
            hour: "2-digit", minute: "2-digit"
        });

        const lines = [];

        lines.push("🏛️ *طلب حجز قاعة*");
        lines.push("مركز كربلاء لتكنولوجيا المعلومات");
        lines.push("");

        lines.push(SEP);
        lines.push("👤 *بيانات مقدّم الطلب*");
        lines.push("• الاسم: " + d.name);
        lines.push("• رقم الهاتف (واتساب): " + d.phone);
        lines.push("• الجهة / الفريق: " + (d.org || "غير محددة"));
        lines.push("");

        lines.push(SEP);
        lines.push("📅 *تفاصيل الحجز*");
        lines.push("• القاعة: " + d.hall);
        lines.push("• نوع الفعالية: " + (d.type || "غير محدد"));
        lines.push("• التاريخ: " + when);
        lines.push("• وقت البدء: " + (d.time || "غير محدد") +
                   (endTime ? "  →  الانتهاء المتوقع: " + endTime : ""));
        const hoursWord = (function (n) {
            if (n === 1)  return "ساعة واحدة";
            if (n === 2)  return "ساعتان";
            if (n <= 10)  return n + " ساعات";
            return n + " ساعة";
        })(d.hours);

        lines.push("• عدد الساعات: " + hoursWord);
        lines.push("");

        lines.push(SEP);
        lines.push("🛠️ *التجهيزات المطلوبة*");
        if (d.equipment.length) {
            d.equipment.forEach(function (item) { lines.push("• " + item); });
        } else {
            lines.push("• لا توجد تجهيزات إضافية");
        }
        lines.push("");

        lines.push(SEP);
        lines.push("💰 *الكلفة*");

        if (d.total > 0) {
            lines.push("• سعر الساعة: " + d.rate);
            lines.push("• عدد الساعات: " + hoursWord);
            lines.push("• الإجمالي التقديري: " + d.total.toLocaleString("en-US") + " د.ع");
        } else {
            lines.push("• عدد الساعات: " + hoursWord);
            lines.push("• السعر: يُحدد من قبل المركز بعد مراجعة الطلب");
        }

        if (d.notes) {
            lines.push("");
            lines.push(SEP);
            lines.push("📝 *ملاحظات إضافية*");
            lines.push(d.notes);
        }

        lines.push("");
        lines.push(SEP);
        lines.push("🕒 *تاريخ إرسال الطلب:* " + sentAt);
        lines.push("");
        lines.push("أرجو تأكيد توفّر القاعة في الموعد أعلاه وإعلامي بالخطوة التالية.");
        lines.push("شكراً لكم 🌟");

        return lines.join("\n");
    }


    /* ---------- الإرسال ---------- */

    function send() {

        /* فحص البوتات بهدوء — لا رسالة خطأ، ولا يُكمل الإرسال فقط */
        if (typeof isLikelyBot === "function" && isLikelyBot("bkWebsite", bkFormOpenedAt)) return;

        const d = collect();

        if (typeof saveRegistrationRecord === "function") {
            saveRegistrationRecord({
                type: "حجز قاعة",
                course: d.hall,
                price: d.total.toLocaleString("en-US") + " د.ع",
                paid: false,
                paymentMethod: "-",
                name: d.name,
                phone: d.phone,
                birthdate: "-",
                note: [d.org, d.type, d.equipment.join("، "), d.date + " " + d.time,
                       d.hours + " ساعات", d.notes].filter(Boolean).join(" | "),
                createdAt: new Date().toISOString()
            });
        }

        const number = (typeof CENTER_WHATSAPP_INTL !== "undefined")
            ? CENTER_WHATSAPP_INTL : "9647748477756";

        window.open("https://wa.me/" + number + "?text=" + encodeURIComponent(buildMessage(d)),
                    "_blank", "noopener");

        if (typeof showToast === "function") showToast("تم تجهيز طلبك — أكمل الإرسال في واتساب");

        close();
    }


    /* ---------- فتح وإغلاق ---------- */

    function open(hallId) {

        currentId   = hallId;
        currentHall = hallsData[hallId];
        if (!currentHall) return;

        $("bkHallName").textContent = currentHall.title;
        $("bkHallRate").textContent = currentHall.price || "يُحدد عند الطلب";

        /* لا يمكن حجز يوم مضى */
        const today = new Date();
        const pad = function (n) { return String(n).padStart(2, "0"); };
        dateEl.min = today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate());

        clearErrors();
        showStep(1);
        bkFormOpenedAt = Date.now();

        if (typeof showModal === "function") showModal("hallBookingModal");
        else shell.classList.add("active");
    }

    function close() {
        if (typeof hideModal === "function") hideModal("hallBookingModal");
        else shell.classList.remove("active");
    }

    window.openHallBooking  = open;
    window.closeHallBooking = close;


    /* ---------- الأحداث ---------- */

    shell.querySelectorAll("[data-close]").forEach(function (el) {
        el.addEventListener("click", close);
    });

    nextBtn.addEventListener("click", function () {

        if (!validateStep(step)) return;

        if (step < TOTAL_STEPS) showStep(step + 1);
        else send();
    });

    backBtn.addEventListener("click", function () {
        if (step > 1) showStep(step - 1);
    });

    /* «فعالية أخرى» تفتح حقل التوضيح */
    $("bkType").addEventListener("change", function () {
        $("bkTypeOtherBox").hidden = (this.value !== "فعالية أخرى");
    });

    /* مربعات التجهيزات التي لها حقل إضافي */
    EQUIPMENT.forEach(function (eq) {

        if (!eq.count && !eq.note) return;

        const box   = shell.querySelector('[data-eq="' + eq.id + '"]');
        const extra = eq.count ? $("bkPcsCount") : $("bkEqOther");

        box.addEventListener("change", function () {
            extra.hidden = !this.checked;
            if (this.checked) extra.focus();
        });
    });

    /* حساب الكلفة وعرض التاريخ بالعربية */
    [hoursEl, timeEl].forEach(function (el) {
        el.addEventListener("input", refreshTotal);
        el.addEventListener("change", refreshTotal);
    });

    function renderDatePreview() {

        const box = $("bkDatePreview");

        if (!dateEl.value) { box.textContent = ""; box.classList.remove("show"); return; }

        box.textContent = "الحجز يوم " + new Date(dateEl.value + "T00:00:00")
            .toLocaleDateString("ar-IQ-u-nu-latn", {
                weekday: "long", year: "numeric", month: "long", day: "numeric"
            });

        box.classList.add("show");
    }

    dateEl.addEventListener("change", function () { renderDatePreview(); refreshTotal(); });
    dateEl.addEventListener("input",  renderDatePreview);

    /* Esc للإغلاق */
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && shell.classList.contains("active")) close();
    });

})();


/* =====================================================================
   V25 · ب) نافذة معاينة القاعة — زر حجز في أسفلها
   =====================================================================
   بعد نقل الحجز إلى نافذة مستقلة، صارت نافذة المعاينة للصور
   والتفاصيل فقط، وفي أسفلها زر ينقلك إلى الحجز مباشرة.
===================================================================== */

(function hallPreviewLayout() {

    const modal = document.getElementById("hallModal");
    if (!modal) return;

    const content = modal.querySelector(".hall-modal-content");
    const gallery = modal.querySelector(".modal-gallery");
    const strip   = document.getElementById("modalThumbnails");
    const details = modal.querySelector(".modal-hall-details");
    const back    = modal.querySelector(".hall-back-btn");

    if (!content || !gallery || !details) return;


    /* ---------- مقبض السحب ---------- */

    if (!content.querySelector(".sheet-handle")) {
        const handle = document.createElement("span");
        handle.className = "sheet-handle hall-sheet-handle";
        handle.setAttribute("aria-hidden", "true");
        content.insertBefore(handle, content.firstChild);
    }


    /* ---------- عدّاد الصور ---------- */

    const counter = document.createElement("span");
    counter.className = "gallery-counter";
    counter.setAttribute("aria-hidden", "true");
    gallery.appendChild(counter);

    function updateCounter() {

        if (!strip) return;

        const thumbs = Array.from(strip.querySelectorAll("img"));
        if (thumbs.length < 2) { counter.style.display = "none"; return; }

        counter.style.display = "";

        const index = thumbs.findIndex(function (t) { return t.classList.contains("active"); });
        counter.textContent = (index < 0 ? 1 : index + 1) + " / " + thumbs.length;
    }

    if (strip) {
        new MutationObserver(updateCounter).observe(strip, {
            childList: true, subtree: true, attributes: true, attributeFilter: ["class"]
        });
    }

    new MutationObserver(function () {
        if (modal.classList.contains("active")) setTimeout(updateCounter, 60);
    }).observe(modal, { attributes: true, attributeFilter: ["class"] });


    /* ---------- شريط سفلي: احجز هذه القاعة ---------- */

    const footer = document.createElement("div");
    footer.className = "hall-modal-footer";

    const bookBtn = document.createElement("button");
    bookBtn.type = "button";
    bookBtn.className = "hall-book-btn";
    bookBtn.innerHTML = "<span>احجز هذه القاعة</span><b>←</b>";

    bookBtn.addEventListener("click", function () {

        const id = modal.dataset.hall;
        if (typeof closeHallModal === "function") closeHallModal();

        setTimeout(function () {
            if (typeof openHallBooking === "function" && id) openHallBooking(id);
        }, 260);
    });

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "hall-footer-close";
    closeBtn.textContent = "إغلاق المعاينة";
    closeBtn.addEventListener("click", function () {
        if (typeof closeHallModal === "function") closeHallModal();
    });

    footer.appendChild(bookBtn);
    footer.appendChild(closeBtn);

    if (back) details.insertBefore(footer, back);
    else details.appendChild(footer);


    /* ---------- نتذكّر أي قاعة مفتوحة ---------- */

    const originalOpen = window.openHallModal;

    window.openHallModal = function (hallId) {
        modal.dataset.hall = hallId;
        originalOpen(hallId);
    };


    /* ---------- السحب بالإصبع وأسهم لوحة المفاتيح ---------- */

    document.addEventListener("keydown", function (e) {

        if (!modal.classList.contains("active")) return;

        if (e.key === "ArrowLeft"  && typeof nextHallImage === "function")     nextHallImage();
        if (e.key === "ArrowRight" && typeof previousHallImage === "function") previousHallImage();
    });

    let startX = null;

    gallery.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });

    gallery.addEventListener("touchend", function (e) {

        if (startX === null) return;

        const delta = e.changedTouches[0].clientX - startX;
        startX = null;

        if (Math.abs(delta) < 45) return;

        if (delta < 0 && typeof nextHallImage === "function")     nextHallImage();
        if (delta > 0 && typeof previousHallImage === "function") previousHallImage();

    }, { passive: true });

})();


/* =====================================================================
   V25 · ج) زر «عرض أقل» في قسم الآراء
===================================================================== */

(function voicesToggle() {

    const grid = document.getElementById("voicesGrid");
    const more = document.getElementById("voicesMore");

    if (!grid || !more || more.hidden) return;

    let expanded = false;

    /* نستبدل الزر بنسخة نظيفة لإلغاء أي مستمع قديم */
    const btn = more.cloneNode(true);
    more.parentNode.replaceChild(btn, more);

    btn.addEventListener("click", function () {

        expanded = !expanded;

        grid.classList.toggle("is-clipped", !expanded);

        btn.innerHTML = expanded
            ? "<span>عرض أقل</span><b>↑</b>"
            : "<span>عرض المزيد من الآراء</span><b>↓</b>";

        if (expanded) {
            if (typeof observeReveals === "function") observeReveals(grid);
        } else {
            /* عند الطيّ نرجع إلى بداية القسم حتى لا يقفز المستخدم في الفراغ */
            const section = document.getElementById("voices");
            if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });

})();

/* =====================================================================
   V26 — رسالة «الدفع الإلكتروني قريباً»
   =====================================================================
   عند الضغط على زر «الدفع الآن» تظهر رسالة تخبر المستخدم
   بأن الدفع الإلكتروني سيُفعّل لاحقاً، مع إمكانية إرسال
   طلب التسجيل عبر واتساب مباشرة.

   ✏️ للتعديل:
   • لتفعيل الدفع الإلكتروني لاحقاً: غيّر false إلى true بالسطر التالي
     ثم سيعمل الزر كما كان (نافذة اختيار طريقة الدفع).
   • لتغيير نص الرسالة: عدّل القيم داخل PAYMENT_SOON_TEXT بالأسفل.
===================================================================== */

const PAYMENT_ONLINE_READY = false;   /* ← اجعلها true عند تفعيل الدفع */

const PAYMENT_SOON_TEXT = {
    badge:  "قيد التطوير",
    title:  "الدفع الإلكتروني قريباً",
    body:   "سيتم تفعيل الدفع الإلكتروني في الموقع لاحقاً. حالياً يمكنك إرسال طلب التسجيل عبر واتساب وسيتواصل معك فريق المركز لإكمال الحجز وتفاصيل الدفع.",
    waBtn:  "إرسال طلب التسجيل عبر واتساب",
    okBtn:  "حسناً، فهمت"
};

(function paymentSoonNotice() {

    if (PAYMENT_ONLINE_READY) return;   /* الدفع مُفعّل → لا تغيّر شيئاً */

    /* ---------- بناء النافذة مرة واحدة ---------- */

    let shell = null;

    function build() {

        if (shell) return shell;

        shell = document.createElement("div");
        shell.className = "soon-shell";
        shell.id = "paymentSoonModal";
        shell.setAttribute("aria-hidden", "true");

        shell.innerHTML =
            '<div class="soon-backdrop" data-soon-close></div>' +
            '<div class="soon-card" role="dialog" aria-modal="true" aria-labelledby="soonTitle">' +
                '<button class="soon-close" type="button" data-soon-close aria-label="إغلاق">×</button>' +
                '<div class="soon-icon" aria-hidden="true">💳</div>' +
                '<span class="soon-badge"><i></i>' + PAYMENT_SOON_TEXT.badge + '</span>' +
                '<h3 id="soonTitle">' + PAYMENT_SOON_TEXT.title + '</h3>' +
                '<p>' + PAYMENT_SOON_TEXT.body + '</p>' +
                '<div class="soon-actions">' +
                    '<button class="soon-btn soon-btn-wa" type="button" id="soonWaBtn">' +
                        '<span>' + PAYMENT_SOON_TEXT.waBtn + '</span>' +
                    '</button>' +
                    '<button class="soon-btn soon-btn-ghost" type="button" data-soon-close>' +
                        '<span>' + PAYMENT_SOON_TEXT.okBtn + '</span>' +
                    '</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(shell);

        shell.querySelectorAll("[data-soon-close]").forEach(function (el) {
            el.addEventListener("click", close);
        });

        const wa = shell.querySelector("#soonWaBtn");

        if (wa) {
            wa.addEventListener("click", function () {
                close();
                /* نترك النافذة تُغلق أولاً ثم نرسل الطلب */
                setTimeout(function () {
                    if (typeof sendRegistrationWhatsApp === "function") sendRegistrationWhatsApp();
                }, 120);
            });
        }

        return shell;
    }

    function open() {
        const box = build();
        box.classList.add("active");
        box.setAttribute("aria-hidden", "false");
        const btn = box.querySelector("#soonWaBtn");
        if (btn) setTimeout(function () { btn.focus(); }, 60);
    }

    function close() {
        if (!shell) return;
        shell.classList.remove("active");
        shell.setAttribute("aria-hidden", "true");
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && shell && shell.classList.contains("active")) {
            e.stopPropagation();
            close();
        }
    }, true);

    /* ---------- استبدال زر «الدفع الآن» ---------- */

    window.openPayment = function () {

        /* نتحقق من البيانات أولاً حتى لا يمر أحد بحقول فارغة */
        if (typeof validateRegistration === "function" && !validateRegistration()) return;

        open();
    };

    window.closePaymentSoon = close;

})();

/* =====================================================================
   V27 — حركات دقيقة إضافية
   =====================================================================
   • أثر لمس (Ripple) على الأزرار الرئيسية
   • لا يمسّ قسم «قصتنا» (Timeline) نهائياً
===================================================================== */

(function microAnimations() {

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const RIPPLE_ON = [
        ".hero-btn",
        ".course-register-btn",
        ".hall-btn",
        ".reg-btn",
        ".event-btn",
        ".booking-btn",
        ".soon-btn",
        ".voices-more",
        ".courses-quiz-btn"
    ].join(",");

    document.addEventListener("pointerdown", function (e) {

        const btn = e.target.closest(RIPPLE_ON);
        if (!btn) return;
        if (btn.disabled || btn.classList.contains("is-locked")) return;
        if (btn.closest(".timeline")) return;     /* حماية الخط الزمني */

        const box = btn.getBoundingClientRect();
        const size = Math.max(box.width, box.height) * 2.2;

        const dot = document.createElement("span");
        dot.className = "v27-ripple";
        dot.style.width  = size + "px";
        dot.style.height = size + "px";
        dot.style.left   = (e.clientX - box.left) + "px";
        dot.style.top    = (e.clientY - box.top) + "px";

        const pos = getComputedStyle(btn).position;
        if (pos === "static") btn.style.position = "relative";

        btn.appendChild(dot);
        setTimeout(function () { dot.remove(); }, 640);

    }, { passive: true });

})();

/* =====================================================================
   V32 — حركة إغلاق النوافذ
   =====================================================================
   عند إزالة الصنف active من أي نافذة نضيف is-closing لفترة قصيرة
   حتى تُشغَّل حركة الخروج، ثم نزيلها.
===================================================================== */

(function modalCloseMotion() {

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const CLOSE_MS = 300;

    function watch(el, activeClass) {

        if (!el) return;

        let wasActive = el.classList.contains(activeClass);

        new MutationObserver(function () {

            const isActive = el.classList.contains(activeClass);

            if (wasActive && !isActive) {
                el.classList.add("is-closing");
                clearTimeout(el._v32t);
                el._v32t = setTimeout(function () { el.classList.remove("is-closing"); }, CLOSE_MS);
            }

            if (!wasActive && isActive) {
                clearTimeout(el._v32t);
                el.classList.remove("is-closing");
            }

            wasActive = isActive;

        }).observe(el, { attributes: true, attributeFilter: ["class"] });
    }

    function attachAll() {
        document.querySelectorAll(".modal-shell, .hall-modal, .soon-shell").forEach(function (el) {
            if (el._v32watched) return;
            el._v32watched = true;
            watch(el, "active");
        });
    }

    attachAll();

    /* النوافذ التي تُبنى لاحقاً (الحجز، الاختبار، تنبيه الدفع) */
    new MutationObserver(attachAll).observe(document.body, { childList: true });

})();

/* =====================================================================
   V34 — أيقونات نيون لتفاصيل القاعات
   =====================================================================
   تستبدل الرموز النصية (⏱ 👥 ☕) بأيقونات SVG نيون زرقاء
   في بطاقات القاعات وفي نافذة معاينة القاعة.
===================================================================== */

(function hallNeonIcons() {

    const svg = function (body) {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
               'stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';
    };

    const ICONS = {

        /* سعر الساعة */
        price: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>'),

        /* عدد المقاعد */
        seats: svg('<path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/>' +
                   '<path d="M4 11h16a1 1 0 0 1 1 1v4H3v-4a1 1 0 0 1 1-1z"/><path d="M6 16v3M18 16v3"/>'),

        /* الضيافة */
        cup:   svg('<path d="M4 8h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z"/>' +
                   '<path d="M16 9h2.2a2.3 2.3 0 0 1 0 4.6H16"/><path d="M7 3.5v2M11 3v2.5"/>')
    };

    function pick(label) {
        const t = String(label || "");
        if (t.indexOf("سعر") !== -1)   return "price";
        if (t.indexOf("مقاعد") !== -1) return "seats";
        if (t.indexOf("ضياف") !== -1)  return "cup";
        return "price";
    }

    function decorate() {

        /* بطاقات القاعات */
        document.querySelectorAll(".hall-info-item").forEach(function (item) {

            const ico = item.querySelector(".hall-info-icon");
            if (!ico || ico.dataset.neon === "1") return;

            const small = item.querySelector("small");
            const key = pick(small ? small.textContent : "");

            ico.dataset.neon = "1";
            ico.classList.add("neon-ico");
            ico.innerHTML = ICONS[key];
        });

        /* نافذة معاينة القاعة */
        document.querySelectorAll(".modal-info-box").forEach(function (box) {

            const ico = box.querySelector("span");
            if (!ico || ico.dataset.neon === "1") return;

            const small = box.querySelector("small");
            const key = pick(small ? small.textContent : "");

            ico.dataset.neon = "1";
            ico.classList.add("neon-ico");
            ico.innerHTML = ICONS[key];
        });
    }

    decorate();

    /* النوافذ التي تُعاد بناؤها */
    new MutationObserver(decorate).observe(document.body, { childList: true, subtree: true });

})();

/* =====================================================================
   V37 — العروض والخصومات
   =====================================================================
   ✏️ كل ما تحتاجه موجود في الجدول التالي فقط.

   لإضافة خصم على دورة:
     "معرّف الدورة": {
         newPrice: "150,000 د.ع",     ← السعر بعد الخصم
         until:    "2026-09-15",      ← آخر يوم للعرض (سنة-شهر-يوم)
         label:    "عرض لمدة أسبوع",  ← نص الشارة (اختياري)
         track:    ""                 ← معرّف الفئة العمرية (اختياري)
     }

   • العرض يختفي تلقائياً بعد تاريخ until — لا تحتاج تحذفه بنفسك.
   • معرّفات الدورات: computer-present, computer-online, editing,
     photography, photoshop, indesign, persian, english, ai, cyber,
     marketing, horse
   • السعر بعد الخصم يظهر في البطاقة وفي نافذة التسجيل وفي رسالة الواتساب.

   مثال جاهز (انسخه داخل الأقواس بالأسفل):

   const COURSE_OFFERS = {
       "photoshop": {
           newPrice: "150,000 د.ع",
           until:    "2026-09-15",
           label:    "عرض لمدة أسبوع"
       }
   };
===================================================================== */

const COURSE_OFFERS = {
    "photoshop": {
        newPrice: "150,000 د.ع",
        until:    "2026-09-15",
        label:    "عرض لمدة أسبوع"
    }
};


(function courseOffers() {

    const GROUP_KEY   = "offers";
    const GROUP_LABEL = "العروض والخصومات";

    const EMPTY_TEXT  = "لا توجد عروض أو خصومات حالياً 🌿 تابعنا ليصلك كل جديد.";

    /* ---------- أدوات ---------- */

    function toNumber(text) {
        const digits = String(text || "").replace(/[^\d]/g, "");
        return digits ? Number(digits) : 0;
    }

    function daysLeft(until) {
        if (!until) return null;
        const end = new Date(until + "T23:59:59");
        if (isNaN(end.getTime())) return null;
        return Math.ceil((end - Date.now()) / 86400000);
    }

    function isActive(offer) {
        if (!offer || !offer.newPrice) return false;
        const d = daysLeft(offer.until);
        return d === null || d >= 0;      /* بدون تاريخ = عرض دائم */
    }

    function activeOffer(courseId) {
        const offer = COURSE_OFFERS[courseId];
        return isActive(offer) ? offer : null;
    }

    function activeIds() {
        return Object.keys(COURSE_OFFERS).filter(function (id) {
            return activeOffer(id) && coursesData[id];
        });
    }

    function timeText(offer) {

        const d = daysLeft(offer.until);

        if (d === null) return offer.label || "عرض خاص";
        if (d === 0)    return "ينتهي العرض اليوم";
        if (d === 1)    return "ينتهي العرض غداً";
        if (d <= 10)    return "ينتهي العرض بعد " + d + " أيام";

        const end = new Date(offer.until + "T00:00:00");
        return "ينتهي العرض في " + end.toLocaleDateString("ar-IQ-u-nu-latn", {
            day: "numeric", month: "long"
        });
    }

    function percentOff(oldPrice, newPrice) {
        const a = toNumber(oldPrice), b = toNumber(newPrice);
        if (!a || !b || b >= a) return 0;
        return Math.round((1 - b / a) * 100);
    }


    /* ---------- 1) السعر بعد الخصم في نافذة التسجيل والرسائل ---------- */

    if (typeof getCourseView === "function" && !getCourseView._offersPatched) {

        const originalView = getCourseView;

        getCourseView = function (courseId, trackId) {

            const view = originalView(courseId, trackId);
            if (!view) return view;

            const offer = activeOffer(courseId);
            if (!offer) return view;

            /* عرض مخصّص لفئة عمرية معيّنة فقط */
            if (offer.track && view.trackId && offer.track !== view.trackId) return view;

            view.oldPrice  = view.price;
            view.price     = offer.newPrice;
            view.hasOffer  = true;
            view.offerNote = (offer.label ? offer.label + " — " : "") + timeText(offer);
            view.priceNote = "بدلاً من " + view.oldPrice + " · " + view.offerNote;

            return view;
        };

        getCourseView._offersPatched = true;
        window.getCourseView = getCourseView;
    }


    /* ---------- 2) شارة الخصم والسعر القديم على البطاقات ---------- */

    function decorateCard(card) {

        const id = card.dataset.course;
        if (!id) return;

        const offer = activeOffer(id);

        /* أزل أي أثر لعرض سابق */
        card.classList.remove("has-offer");
        const oldRibbon = card.querySelector(".offer-ribbon");
        if (oldRibbon) oldRibbon.remove();
        const oldHead = card.querySelector(".offer-head");
        if (oldHead) oldHead.remove();
        const oldSave = card.querySelector(".offer-save");
        if (oldSave) oldSave.remove();
        const oldChip = card.querySelector(".offer-chip");
        if (oldChip) oldChip.remove();
        const oldTimer = card.querySelector(".offer-timer");
        if (oldTimer) oldTimer.remove();
        const oldPriceEl = card.querySelector(".price-old");
        if (oldPriceEl) oldPriceEl.remove();

        if (!offer) return;
        if (offer.track && card.dataset.track && offer.track !== card.dataset.track) return;

        const priceBox = card.querySelector(".course-price");
        if (!priceBox) return;

        const strong = priceBox.querySelector("strong");
        if (!strong) return;

        const oldPrice = strong.textContent.trim();

        /* إن كان السعر المعروض هو سعر العرض أصلاً نأخذ السعر الأصلي من البيانات */
        const base = coursesData[id] || {};
        const realOld = (toNumber(oldPrice) === toNumber(offer.newPrice))
            ? (base.price || (base.tracks && base.tracks[0] ? base.tracks[0].price : ""))
            : oldPrice;

        card.classList.add("has-offer");

        const pct = percentOff(realOld, offer.newPrice);

        /* صفّ واضح فوق العنوان — لا يتداخل مع شارة «التسجيل مفتوح» */
        const head = document.createElement("div");
        head.className = "offer-head";
        /* شارة خصم صغيرة ضمن صف الشارات العلوي */
        head.remove();

        const topBar = card.querySelector(".course-card-top");

        if (topBar) {
            const chip = document.createElement("span");
            chip.className = "offer-chip";
            chip.textContent = pct ? "خصم " + pct + "%" : "عرض خاص";
            topBar.appendChild(chip);
        }

        /* السعر: القديم مشطوب ثم الجديد */
        strong.textContent = offer.newPrice;

        if (realOld && toNumber(realOld) > toNumber(offer.newPrice)) {

            const del = document.createElement("span");
            del.className = "price-old";
            del.textContent = realOld;
            strong.parentNode.insertBefore(del, strong);


        }

        /* سطر المدة المتبقية */
        const foot = card.querySelector(".course-foot");
        const timer = document.createElement("div");
        timer.className = "offer-timer";
        timer.innerHTML = '<span class="offer-pulse" aria-hidden="true"></span>' +
                          "<span>" +
                              (offer.label ? escapeHtml(offer.label) + " · " : "") +
                              timeText(offer) +
                          "</span>";

        if (foot && foot.parentNode) foot.parentNode.insertBefore(timer, foot.nextSibling);
        else card.appendChild(timer);
    }

    function decorateAll() {
        const grid = document.getElementById("coursesGrid");
        if (!grid) return;
        Array.from(grid.children).forEach(decorateCard);
    }


    /* ---------- 3) تبويب «العروض والخصومات» ---------- */

    function buildTab() {

        const box = document.getElementById("coursesFilters");
        if (!box || box.querySelector('[data-group="' + GROUP_KEY + '"]')) return;

        const ids = activeIds();

        /* نضيف المجموعة إلى جدول الفلترة الموجود */
        if (typeof COURSE_GROUPS !== "undefined") {
            COURSE_GROUPS[GROUP_KEY] = { label: GROUP_LABEL, ids: ids };
        }

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "courses-filter is-offers";
        btn.dataset.group = GROUP_KEY;
        btn.innerHTML = '<span aria-hidden="true">%</span><span>' + GROUP_LABEL + "</span>" +
                        (ids.length ? '<b class="offers-count">' + ids.length + "</b>" : "");

        box.appendChild(btn);

        /* رسالة مخصّصة عندما لا توجد عروض */
        const empty = document.getElementById("coursesEmpty");
        const originalEmpty = empty ? empty.textContent : "";

        box.addEventListener("click", function (e) {
            const clicked = e.target.closest(".courses-filter");
            if (!clicked || !empty) return;
            empty.textContent = (clicked.dataset.group === GROUP_KEY && !activeIds().length)
                ? EMPTY_TEXT
                : originalEmpty;
        });
    }


    /* ---------- 4) إخبار المساعد الذكي بالعروض ---------- */

    function updateAssistant() {

        if (!window.KCIT_FAQ) return;

        const item = window.KCIT_FAQ.filter(function (x) { return x.id === 34; })[0];
        if (!item) return;

        if (!item._original) item._original = item.a;

        const ids = activeIds();

        if (!ids.length) { item.a = item._original; return; }

        item.a = "نعم 🎉 العروض السارية حالياً:\n" +
            ids.map(function (id) {
                const o = COURSE_OFFERS[id];
                const c = coursesData[id] || {};
                const base = c.price || (c.tracks && c.tracks[0] ? c.tracks[0].price : "");
                return "• " + (c.title || id) + ": " + o.newPrice +
                       (base ? " بدلاً من " + base : "") + " — " + timeText(o);
            }).join("\n") +
            "\n\nتقدر تشوفها كلها من تبويب «العروض والخصومات» في قسم الدورات.";
    }


    /* ---------- التشغيل ---------- */

    function run() {
        buildTab();
        decorateAll();
        updateAssistant();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", run);
    } else {
        run();
    }

    /* إعادة التزيين عند تبديل الفئة العمرية أو إعادة بناء البطاقات */
    const grid = document.getElementById("coursesGrid");

    if (grid) {
        let pending = false;
        new MutationObserver(function () {
            if (pending) return;
            pending = true;
            requestAnimationFrame(function () { pending = false; decorateAll(); });
        }).observe(grid, { childList: true, subtree: true });
    }

    /* دالة عامة: افتح تبويب العروض */
    window.showOffers = function () {
        const btn = document.querySelector('.courses-filter[data-group="' + GROUP_KEY + '"]');
        if (btn) btn.click();
        const sec = document.getElementById("courses");
        if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
    };

})();

/* =====================================================================
   V39 — طلب قاعة مخصّصة
   =====================================================================
   نافذة طلب مفصّلة للفعاليات التي لا تناسبها القاعات الأربع.
   بدون أي سعر — السعر يُحدد من المركز بعد مراجعة الطلب.

   ✏️ لتعديل الخيارات غيّر القوائم بالأسفل فقط.
===================================================================== */

(function customHallRequest() {

    const EVENT_TYPES = [
        "دورة تدريبية", "ورشة عمل", "اجتماع عمل", "مؤتمر", "ندوة",
        "امتحان", "محاضرة", "جلسة تصوير", "فعالية أخرى"
    ];

    const SEATING = [
        "صفوف (مسرحي)", "طاولة اجتماعات", "حرف U", "مجموعات دائرية", "حسب رأي المركز"
    ];

    const EQUIPMENT = [
        { id: "screen",   label: "شاشة عرض" },
        { id: "smart",    label: "شاشة تفاعلية ذكية" },
        { id: "pcs",      label: "أجهزة حاسوب", count: true },
        { id: "board",    label: "سبورة وايت بورد" },
        { id: "record",   label: "تصوير / تسجيل الفعالية" },
        { id: "internet", label: "إنترنت" },
        { id: "host",     label: "ضيافة" },
        { id: "other",    label: "تجهيزات أخرى", note: true }
    ];

    const CENTER_WA = (typeof CENTER_WHATSAPP_INTL !== "undefined")
        ? CENTER_WHATSAPP_INTL : "9647748477756";


    /* ---------- بناء النافذة ---------- */

    let shell = null;

    function esc(v) {
        return String(v == null ? "" : v)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function build() {

        if (shell) return shell;

        shell = document.createElement("div");
        shell.className = "modal-shell custom-shell";
        shell.id = "customHallModal";
        shell.setAttribute("aria-hidden", "true");

        shell.innerHTML =
            '<div class="modal-overlay-base" data-cx-close></div>' +

            '<div class="modal-card custom-card" role="dialog" aria-modal="true" aria-labelledby="cxTitle">' +

                '<span class="sheet-handle" aria-hidden="true"></span>' +
                '<button class="modal-close" type="button" data-cx-close aria-label="إغلاق">×</button>' +

                '<div class="custom-head">' +
                    '<span class="custom-eyebrow">طلب خاص</span>' +
                    '<h2 id="cxTitle">قاعة مخصّصة حسب احتياجك</h2>' +
                    '<p>عبّئ التفاصيل بدقة، وفريق المركز يراجع الطلب ويحدد لك التجهيز والسعر المناسب.</p>' +
                '</div>' +

                '<div class="modal-scroll custom-scroll">' +

                    /* 1) بيانات مقدّم الطلب */
                    '<div class="custom-group-title"><span aria-hidden="true">١</span> بيانات مقدّم الطلب</div>' +

                    '<div class="form-group">' +
                        '<label class="form-label" for="cxName">الاسم الكامل</label>' +
                        '<input class="form-input" type="text" id="cxName" placeholder="مثال: علي محمد حسين">' +
                        '<span class="form-error" data-cxerr="cxName"></span>' +
                    '</div>' +

                    '<div class="form-group">' +
                        '<label class="form-label" for="cxPhone">رقم الهاتف (يحتوي على واتساب)</label>' +
                        '<input class="form-input" type="tel" id="cxPhone" placeholder="07XXXXXXXXX" inputmode="numeric" maxlength="11">' +
                        '<span class="form-error" data-cxerr="cxPhone"></span>' +
                    '</div>' +

                    '<div class="form-group">' +
                        '<label class="form-label" for="cxOrg">الجهة / الشركة / الفريق</label>' +
                        '<input class="form-input" type="text" id="cxOrg" placeholder="اكتب اسم جهتك، أو «بصفة شخصية»">' +
                    '</div>' +

                    /* 2) تفاصيل الفعالية */
                    '<div class="custom-group-title"><span aria-hidden="true">٢</span> تفاصيل الفعالية</div>' +

                    '<div class="form-group">' +
                        '<label class="form-label" for="cxType">نوع الفعالية</label>' +
                        '<select class="form-input" id="cxType">' +
                            '<option value="">اختر نوع الفعالية…</option>' +
                            EVENT_TYPES.map(function (t) {
                                return '<option value="' + esc(t) + '">' + esc(t) + "</option>";
                            }).join("") +
                        "</select>" +
                        '<span class="form-error" data-cxerr="cxType"></span>' +
                    "</div>" +

                    '<div class="form-group" id="cxTypeOtherBox" hidden>' +
                        '<label class="form-label" for="cxTypeOther">اذكر نوع الفعالية</label>' +
                        '<input class="form-input" type="text" id="cxTypeOther" placeholder="اكتب نوع فعاليتك">' +
                    '</div>' +

                    '<div class="form-group">' +
                        '<label class="form-label" for="cxPeople">العدد المتوقع للحضور</label>' +
                        '<input class="form-input" type="number" id="cxPeople" min="1" max="500" placeholder="مثال: 25">' +
                        '<span class="form-error" data-cxerr="cxPeople"></span>' +
                    '</div>' +

                    '<div class="booking-row">' +
                        '<div class="form-group">' +
                            '<label class="form-label" for="cxDate">التاريخ المطلوب</label>' +
                            '<input class="form-input" type="date" id="cxDate">' +
                            '<span class="form-error" data-cxerr="cxDate"></span>' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label class="form-label" for="cxTime">وقت البدء</label>' +
                            '<input class="form-input" type="time" id="cxTime">' +
                        '</div>' +
                    '</div>' +

                    '<div class="booking-row">' +
                        '<div class="form-group">' +
                            '<label class="form-label" for="cxDays">عدد الأيام</label>' +
                            '<input class="form-input" type="number" id="cxDays" min="1" max="30" value="1">' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label class="form-label" for="cxHours">عدد الساعات في اليوم</label>' +
                            '<input class="form-input" type="number" id="cxHours" min="1" max="12" value="2">' +
                        '</div>' +
                    '</div>' +

                    '<div class="form-group">' +
                        '<label class="form-label" for="cxSeating">ترتيب الجلوس المفضّل</label>' +
                        '<select class="form-input" id="cxSeating">' +
                            SEATING.map(function (t) {
                                return '<option value="' + esc(t) + '">' + esc(t) + "</option>";
                            }).join("") +
                        "</select>" +
                    "</div>" +

                    /* 3) التجهيزات */
                    '<div class="custom-group-title"><span aria-hidden="true">٣</span> التجهيزات المطلوبة</div>' +

                    '<div class="check-list" id="cxEquip">' +
                        EQUIPMENT.map(function (item) {
                            return '<label class="check-item">' +
                                       '<input type="checkbox" value="' + esc(item.label) + '" data-eq="' + item.id + '">' +
                                       '<span class="check-box" aria-hidden="true"></span>' +
                                       '<span class="check-text">' + esc(item.label) + "</span>" +
                                   "</label>" +
                                   (item.count
                                       ? '<input class="form-input check-extra" type="number" min="1" max="60" ' +
                                         'id="cxPcs" placeholder="عدد الأجهزة" hidden>'
                                       : "") +
                                   (item.note
                                       ? '<input class="form-input check-extra" type="text" ' +
                                         'id="cxOtherEq" placeholder="اذكر التجهيزات الأخرى" hidden>'
                                       : "");
                        }).join("") +
                    "</div>" +

                    /* 4) وصف الطلب */
                    '<div class="custom-group-title"><span aria-hidden="true">٤</span> وصف الطلب</div>' +

                    '<div class="form-group">' +
                        '<label class="form-label" for="cxDetails">اشرح لنا فعاليتك واحتياجاتك بالتفصيل</label>' +
                        '<textarea class="form-input custom-textarea" id="cxDetails" rows="5" ' +
                            'placeholder="مثال: ورشة تدريبية ليومين لعشرين متدرباً، نحتاج شاشة عرض وترتيب على شكل حرف U، مع استراحة ضيافة بين الفترتين، ونفضّل الفترة المسائية."></textarea>' +
                        '<span class="form-error" data-cxerr="cxDetails"></span>' +
                    '</div>' +

                    '<div class="form-group">' +
                        '<label class="form-label" for="cxExtra">ملاحظات إضافية (اختياري)</label>' +
                        '<textarea class="form-input custom-textarea" id="cxExtra" rows="3" ' +
                            'placeholder="أي شيء آخر تحب أن يعرفه المركز"></textarea>' +
                    '</div>' +

                    '<div class="custom-note">' +
                        '<span aria-hidden="true">!</span>' +
                        '<p>لا يوجد سعر معلن لهذا الطلب — يقوم المركز بدراسة تفاصيله ثم يتواصل معك لتحديد الكلفة والموعد النهائي.</p>' +
                    '</div>' +

                "</div>" +

                '<div class="booking-actions custom-actions">' +
                    '<button class="booking-btn booking-next is-send" type="button" id="cxSend">' +
                        "<span>إرسال طلب القاعة المخصّصة عبر واتساب</span>" +
                    "</button>" +
                "</div>" +

            "</div>";

        document.body.appendChild(shell);

        shell.querySelectorAll("[data-cx-close]").forEach(function (el) {
            el.addEventListener("click", close);
        });

        /* إظهار الحقول الإضافية عند التأشير */
        shell.querySelectorAll('#cxEquip input[type="checkbox"]').forEach(function (box) {
            box.addEventListener("change", function () {
                const id = box.dataset.eq;
                const extra = (id === "pcs") ? shell.querySelector("#cxPcs")
                            : (id === "other") ? shell.querySelector("#cxOtherEq") : null;
                if (extra) { extra.hidden = !box.checked; if (box.checked) extra.focus(); }
            });
        });

        /* حقل «فعالية أخرى» */
        const typeSel = shell.querySelector("#cxType");
        typeSel.addEventListener("change", function () {
            shell.querySelector("#cxTypeOtherBox").hidden = (typeSel.value !== "فعالية أخرى");
        });

        shell.querySelector("#cxSend").addEventListener("click", send);

        return shell;
    }


    /* ---------- التحقق ---------- */

    function setErr(id, msg) {
        const el = shell.querySelector('[data-cxerr="' + id + '"]');
        if (el) el.textContent = msg || "";
        const field = shell.querySelector("#" + id);
        if (field) field.classList.toggle("has-error", !!msg);
    }

    function validate() {

        let ok = true;
        ["cxName", "cxPhone", "cxType", "cxPeople", "cxDate", "cxDetails"]
            .forEach(function (id) { setErr(id, ""); });

        const name = shell.querySelector("#cxName").value.trim();
        if (name.length < 5 || name.split(/\s+/).length < 2) {
            setErr("cxName", "اكتب اسمك الكامل"); ok = false;
        }

        const phone = shell.querySelector("#cxPhone").value.replace(/\D/g, "");
        if (!/^07\d{9}$/.test(phone)) {
            setErr("cxPhone", "رقم الهاتف يجب أن يبدأ بـ 07 ويتكوّن من 11 رقماً"); ok = false;
        }

        if (!shell.querySelector("#cxType").value) {
            setErr("cxType", "اختر نوع الفعالية"); ok = false;
        }

        const people = Number(shell.querySelector("#cxPeople").value);
        if (!people || people < 1) {
            setErr("cxPeople", "اكتب العدد المتوقع للحضور"); ok = false;
        }

        if (!shell.querySelector("#cxDate").value) {
            setErr("cxDate", "اختر التاريخ المطلوب"); ok = false;
        }

        if (shell.querySelector("#cxDetails").value.trim().length < 15) {
            setErr("cxDetails", "اشرح طلبك بجملة أوضح حتى نجهّزه لك"); ok = false;
        }

        if (!ok) {
            const first = shell.querySelector(".has-error");
            if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        return ok;
    }


    /* ---------- جمع البيانات ---------- */

    function collect() {

        const q = function (id) { return shell.querySelector("#" + id); };

        const equipment = [];

        shell.querySelectorAll('#cxEquip input[type="checkbox"]:checked').forEach(function (box) {

            let label = box.value;

            if (box.dataset.eq === "pcs") {
                const n = q("cxPcs").value.trim();
                if (n) label += " (" + n + " جهاز)";
            }

            if (box.dataset.eq === "other") {
                const t = q("cxOtherEq").value.trim();
                if (t) label += ": " + t;
            }

            equipment.push(label);
        });

        let type = q("cxType").value;
        if (type === "فعالية أخرى") {
            const other = q("cxTypeOther").value.trim();
            if (other) type = other;
        }

        return {
            name:    q("cxName").value.trim(),
            phone:   q("cxPhone").value.replace(/\D/g, ""),
            org:     q("cxOrg").value.trim() || "بصفة شخصية",
            type:    type,
            people:  q("cxPeople").value.trim(),
            date:    q("cxDate").value,
            time:    q("cxTime").value,
            days:    Math.max(1, Number(q("cxDays").value) || 1),
            hours:   Math.max(1, Number(q("cxHours").value) || 1),
            seating: q("cxSeating").value,
            equipment: equipment,
            details: q("cxDetails").value.trim(),
            extra:   q("cxExtra").value.trim()
        };
    }


    /* ---------- رسالة واتساب ---------- */

    function buildMessage(d) {

        const SEP = "━━━━━━━━━━━━━━━";

        const when = d.date
            ? new Date(d.date + "T00:00:00").toLocaleDateString("ar-IQ-u-nu-latn", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric"
              })
            : "غير محدد";

        const now = new Date();
        const sentAt = now.toLocaleDateString("ar-IQ-u-nu-latn", {
            year: "numeric", month: "long", day: "numeric"
        }) + " - " + now.toLocaleTimeString("ar-IQ-u-nu-latn", { hour: "2-digit", minute: "2-digit" });

        const lines = [];

        lines.push("🏗️ *طلب قاعة مخصّصة*");
        lines.push("مركز كربلاء لتكنولوجيا المعلومات");
        lines.push("");

        lines.push(SEP);
        lines.push("👤 *بيانات مقدّم الطلب*");
        lines.push("• الاسم: " + d.name);
        lines.push("• رقم الهاتف (واتساب): " + d.phone);
        lines.push("• الجهة: " + d.org);
        lines.push("");

        lines.push(SEP);
        lines.push("📅 *تفاصيل الفعالية*");
        lines.push("• نوع الفعالية: " + d.type);
        lines.push("• العدد المتوقع: " + d.people + " شخصاً");
        lines.push("• التاريخ المطلوب: " + when);
        if (d.time) lines.push("• وقت البدء: " + d.time);
        lines.push("• المدة: " + d.days + " يوم × " + d.hours + " ساعة");
        lines.push("• ترتيب الجلوس: " + d.seating);
        lines.push("");

        lines.push(SEP);
        lines.push("🛠️ *التجهيزات المطلوبة*");
        if (d.equipment.length) {
            d.equipment.forEach(function (item) { lines.push("• " + item); });
        } else {
            lines.push("• لم يتم تحديد تجهيزات");
        }
        lines.push("");

        lines.push(SEP);
        lines.push("📝 *وصف الطلب*");
        lines.push(d.details);

        if (d.extra) {
            lines.push("");
            lines.push(SEP);
            lines.push("➕ *ملاحظات إضافية*");
            lines.push(d.extra);
        }

        lines.push("");
        lines.push(SEP);
        lines.push("💰 *السعر:* يُحدد من قبل المركز بعد مراجعة الطلب");
        lines.push("🕒 *تاريخ إرسال الطلب:* " + sentAt);
        lines.push("");
        lines.push("أرجو دراسة الطلب وإعلامي بالتجهيز المناسب والكلفة. شكراً لكم 🌟");

        return lines.join("\n");
    }


    /* ---------- الإرسال ---------- */

    function send() {

        if (!validate()) return;

        const d = collect();

        if (typeof saveRegistrationRecord === "function") {
            saveRegistrationRecord({
                type: "قاعة مخصّصة",
                course: "طلب قاعة مخصّصة — " + d.type,
                price: "يُحدد لاحقاً",
                paid: false,
                paymentMethod: "-",
                name: d.name,
                phone: d.phone,
                birthdate: "-",
                note: [d.org, d.people + " شخص", d.date, d.days + " يوم",
                       d.equipment.join("، "), d.details].filter(Boolean).join(" | "),
                createdAt: new Date().toISOString()
            });
        }

        window.open("https://wa.me/" + CENTER_WA + "?text=" + encodeURIComponent(buildMessage(d)),
                    "_blank", "noopener");

        if (typeof showToast === "function") {
            showToast("تم تجهيز طلبك — أكمل الإرسال في واتساب");
        }

        close();
    }


    /* ---------- فتح وإغلاق ---------- */

    function open() {

        const box = build();

        /* لا يمكن اختيار يوم مضى */
        const today = new Date();
        const pad = function (n) { return String(n).padStart(2, "0"); };
        const dateEl = box.querySelector("#cxDate");
        if (dateEl) {
            dateEl.min = today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate());
        }

        if (typeof showModal === "function") showModal("customHallModal");
        else { box.classList.add("active"); box.setAttribute("aria-hidden", "false"); }

        document.body.classList.add("modal-open");
    }

    function close() {

        if (!shell) return;

        if (typeof hideModal === "function") hideModal("customHallModal");
        else { shell.classList.remove("active"); shell.setAttribute("aria-hidden", "true"); }

        document.body.classList.remove("modal-open");
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && shell && shell.classList.contains("active")) close();
    });

    window.openCustomHall  = open;
    window.closeCustomHall = close;

})();

/* =====================================================================
   V52 — إخفاء مربعات التفاصيل من البطاقة ونقلها إلى نافذة «عرض التفاصيل»
   =====================================================================
   البطاقة تبقى مختصرة: العنوان + الوصف + السعر + زرّان.
   كل التفاصيل (المدة، الساعات، المقاعد، المدرب، الشهادة، الحالة، الموعد)
   تظهر في نافذة أنيقة عند الضغط على «عرض التفاصيل».
===================================================================== */

(function courseDetailsModal() {

    let shell = null;

    function esc(v) {
        return String(v == null ? "" : v)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    /* ---------- أيقونات ---------- */

    const ICON = (typeof FACT_ICONS !== "undefined") ? FACT_ICONS : {};

    function ico(name) {
        return ICON[name] ? '<span class="fact-ico" aria-hidden="true">' + ICON[name] + "</span>" : "";
    }


    /* ---------- بناء النافذة ---------- */

    function build() {

        if (shell) return shell;

        shell = document.createElement("div");
        shell.className = "modal-shell details-shell";
        shell.id = "courseDetailsModal";
        shell.setAttribute("aria-hidden", "true");

        shell.innerHTML =
            '<div class="modal-overlay-base" data-cd-close></div>' +
            '<div class="modal-card details-card" role="dialog" aria-modal="true" aria-labelledby="cdTitle">' +
                '<span class="sheet-handle" aria-hidden="true"></span>' +
                '<button class="modal-close" type="button" data-cd-close aria-label="إغلاق">×</button>' +

                '<div class="details-head">' +
                    '<span class="details-eyebrow" id="cdCategory">—</span>' +
                    '<h2 id="cdTitle">اسم الدورة</h2>' +
                    '<p id="cdDesc"></p>' +
                    '<div class="details-status" id="cdStatus"></div>' +
                "</div>" +

                '<div class="modal-scroll details-scroll">' +
                    '<div class="details-grid" id="cdGrid"></div>' +
                    '<div class="details-price" id="cdPrice"></div>' +
                "</div>" +

                '<div class="details-actions">' +
                    '<button class="details-btn details-btn-main" type="button" id="cdRegister">' +
                        "<span>التسجيل في هذه الدورة</span><b>←</b>" +
                    "</button>" +
                    '<button class="details-btn details-btn-ghost" type="button" data-cd-close>' +
                        "<span>إغلاق</span>" +
                    "</button>" +
                "</div>" +
            "</div>";

        document.body.appendChild(shell);

        shell.querySelectorAll("[data-cd-close]").forEach(function (el) {
            el.addEventListener("click", close);
        });

        return shell;
    }


    /* ---------- تعبئة البيانات ---------- */

    let current = { id: null, track: null };

    function row(iconName, label, value) {
        if (!value) return "";
        return '<div class="details-item">' +
                   '<div class="details-item-head">' + ico(iconName) + "<span>" + esc(label) + "</span></div>" +
                   "<strong>" + esc(value) + "</strong>" +
               "</div>";
    }

    function fill(courseId, trackId) {

        const view = (typeof getCourseView === "function") ? getCourseView(courseId, trackId) : null;
        if (!view) return false;

        const meta = (typeof getCourseMeta === "function") ? getCourseMeta(courseId) : { status: "open" };

        current = { id: courseId, track: trackId || null };

        const box = build();
        const $ = function (id) { return box.querySelector("#" + id); };

        $("cdCategory").textContent = view.category || "دورة تدريبية";
        $("cdTitle").textContent    = view.fullTitle;
        $("cdDesc").textContent     = view.description || "";

        /* حالة التسجيل */
        const st = (typeof STATUS_TEXT !== "undefined")
            ? (STATUS_TEXT[meta.status] || STATUS_TEXT.open) : null;

        $("cdStatus").innerHTML = st
            ? '<span class="details-chip ' + st.cls + '">' + esc(st.label) + "</span>"
            : "";

        /* موعد البدء والمقاعد كما حدّدهما المركز */
        let startText = "";
        if (meta.dateText && String(meta.dateText).trim()) {
            startText = String(meta.dateText).trim();
        } else if (meta.startDate && typeof courseDateInfo === "function") {
            const info = courseDateInfo(meta.startDate);
            if (info) startText = info.full;
        }

        let seatsText2 = "";
        if (meta.seatsText && String(meta.seatsText).trim()) {
            seatsText2 = String(meta.seatsText).trim();
        } else if (meta.seatsLeft && typeof seatsText === "function") {
            seatsText2 = seatsText(meta.seatsLeft);
        }

        const certText = view.certificate
            ? ((typeof CERT_TEXT !== "undefined" ? CERT_TEXT.boxYes : "متوفرة") + " عند إكمال الدورة")
            : (typeof CERT_TEXT !== "undefined" ? CERT_TEXT.boxNo : "غير متوفرة");

        $("cdGrid").innerHTML =
            row("duration", "المدة",              view.duration) +
            row("hours",    "الساعات التدريبية",  view.hours) +
            row("seats",    "عدد المقاعد",        view.seats) +
            row("trainer",  "المدرب/ة",           view.trainer) +
            row("cert",     "الشهادة",            certText) +
            row("hours",    "موعد البدء",         startText || "يحدد لاحقاً") +
            (seatsText2 ? row("seats", "المقاعد المتاحة", seatsText2) : "");

        /* السعر (مع الخصم إن وُجد) */
        $("cdPrice").innerHTML =
            '<div class="details-price-box">' +
                "<small>رسوم الدورة</small>" +
                '<div class="details-price-line">' +
                    (view.oldPrice ? '<span class="price-old">' + esc(view.oldPrice) + "</span>" : "") +
                    "<strong>" + esc(view.price) + "</strong>" +
                "</div>" +
                (view.offerNote ? '<span class="details-offer">' + esc(view.offerNote) + "</span>" : "") +
                (view.priceNote && !view.offerNote ? "<span>" + esc(view.priceNote) + "</span>" : "") +
            "</div>";

        /* زر التسجيل */
        const btn = $("cdRegister");
        const locked = ["closed", "full", "soon"].indexOf(meta.status) !== -1;

        btn.disabled = locked;
        btn.classList.toggle("is-locked", locked);
        btn.querySelector("span").textContent = locked
            ? ((st && st.label) || "التسجيل غير متاح حالياً")
            : "التسجيل في هذه الدورة";

        btn.onclick = function () {
            if (locked) return;
            close();
            setTimeout(function () {
                if (typeof openRegistration === "function") openRegistration(current.id, current.track);
            }, 320);
        };

        return true;
    }


    /* ---------- فتح وإغلاق ---------- */

    function open(courseId, trackId) {
        if (!fill(courseId, trackId)) return;
        if (typeof showModal === "function") showModal("courseDetailsModal");
        else { shell.classList.add("active"); shell.setAttribute("aria-hidden", "false"); }
        document.body.classList.add("modal-open");
    }

    function close() {
        if (!shell) return;
        if (typeof hideModal === "function") hideModal("courseDetailsModal");
        else { shell.classList.remove("active"); shell.setAttribute("aria-hidden", "true"); }
        document.body.classList.remove("modal-open");
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && shell && shell.classList.contains("active")) close();
    });

    window.openCourseDetails  = open;
    window.closeCourseDetails = close;


    /* ---------- زر «عرض التفاصيل» في كل بطاقة ---------- */

    function decorate() {

        document.querySelectorAll(".course-card").forEach(function (card) {

            const id = card.dataset.course;
            if (!id) return;

            /* شريط الأزرار */
            let actions = card.querySelector(".course-actions");
            const regBtn = card.querySelector(".course-register-btn");

            if (!actions && regBtn) {
                actions = document.createElement("div");
                actions.className = "course-actions";
                regBtn.parentNode.insertBefore(actions, regBtn);
                actions.appendChild(regBtn);
            }

            if (!actions) return;

            if (!actions.querySelector(".course-details-btn")) {

                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "course-details-btn";
                btn.innerHTML = "<span>عرض التفاصيل</span><b>◱</b>";

                btn.addEventListener("click", function () {
                    open(card.dataset.course, card.dataset.track || null);
                });

                actions.appendChild(btn);
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", decorate);
    } else {
        decorate();
    }

    const grid = document.getElementById("coursesGrid");

    if (grid) {
        let pending = false;
        new MutationObserver(function () {
            if (pending) return;
            pending = true;
            requestAnimationFrame(function () { pending = false; decorate(); });
        }).observe(grid, { childList: true, subtree: true });
    }

})();


/* =====================================================================
   V54 — بطاقة الدورة المبسّطة
   البطاقة = حالة التسجيل + الاسم + الوصف + زر التفاصيل + زر التسجيل
   وكل التفاصيل (التصنيف، الفئة العمرية، المدة، الساعات، المقاعد،
   المدرب/ة، الشهادة، الموعد، السعر والخصم) داخل نافذة «عرض التفاصيل».
===================================================================== */

(function simpleCourseCards() {

    "use strict";

    /* ---------- 1) الفئة العمرية تنتقل إلى نافذة التفاصيل ---------- */

    const originalOpen = window.openCourseDetails;

    function tracksOf(courseId) {
        const c = (typeof coursesData !== "undefined") ? coursesData[courseId] : null;
        return (c && c.tracks && c.tracks.length) ? c.tracks : null;
    }

    function syncCard(courseId, trackId) {
        const card = document.querySelector('.course-card[data-course="' + courseId + '"]');
        if (card && trackId) card.dataset.track = trackId;
    }

    function renderTracks(courseId, trackId) {

        const shell = document.getElementById("courseDetailsModal");
        if (!shell) return;

        const scroll = shell.querySelector(".details-scroll");
        const grid   = shell.querySelector("#cdGrid");
        if (!scroll || !grid) return;

        let box = shell.querySelector("#cdTracks");
        const tracks = tracksOf(courseId);

        if (!tracks) { if (box) box.remove(); return; }

        if (!box) {
            box = document.createElement("div");
            box.id = "cdTracks";
            box.className = "details-tracks";
            scroll.insertBefore(box, grid);
        }

        const active = trackId || tracks[0].id;

        box.innerHTML =
            '<span class="details-tracks-label">اختر الفئة</span>' +
            '<div class="details-tracks-row">' +
                tracks.map(function (t) {
                    return '<button type="button" class="details-track-pill' +
                           (t.id === active ? " active" : "") +
                           '" data-track="' + t.id + '">' + t.label + "</button>";
                }).join("") +
            "</div>";

        box.querySelectorAll(".details-track-pill").forEach(function (pill) {
            pill.addEventListener("click", function () {
                const id = pill.dataset.track;
                syncCard(courseId, id);
                if (typeof originalOpen === "function") originalOpen(courseId, id);
                renderTracks(courseId, id);
                if (typeof window.KCIT_REFRESH_CARD === "function") {
                    window.KCIT_REFRESH_CARD(courseId);
                }
            });
        });
    }

    if (typeof originalOpen === "function") {
        window.openCourseDetails = function (courseId, trackId) {
            originalOpen(courseId, trackId);
            renderTracks(courseId, trackId);
        };
    }


    /* ---------- 2) تنظيف البطاقة + ترتيب الأزرار ---------- */

    function tidy(card) {

        /* شارات ومعلومات لم تعد تظهر على البطاقة */
        card.querySelectorAll(
            ".course-category, .course-index, .course-cert, .offer-chip, " +
            ".offer-head, .course-track-pills, .course-facts, .course-meta-chips, " +
            ".course-status-bar, .course-foot, .offer-timer"
        ).forEach(function (el) { el.classList.add("card-hidden-detail"); });

        /* ترتيب الأزرار: «عرض التفاصيل» أولاً ثم «التسجيل» */
        const actions = card.querySelector(".course-actions");
        if (actions) {
            const details = actions.querySelector(".course-details-btn");
            if (details && actions.firstElementChild !== details) {
                actions.insertBefore(details, actions.firstElementChild);
            }
        }

        card.classList.add("course-card-simple");
    }

    function decorate() {
        document.querySelectorAll(".course-card").forEach(tidy);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", decorate);
    } else {
        decorate();
    }

    const grid = document.getElementById("coursesGrid");
    if (grid && "MutationObserver" in window) {
        let pending = false;
        new MutationObserver(function () {
            if (pending) return;
            pending = true;
            requestAnimationFrame(function () { pending = false; decorate(); });
        }).observe(grid, { childList: true, subtree: true });
    }

})();

/* =====================================================================
   V55 — حزمة الجاهزية للنشر
   • بديل أنيق لأي صورة لا تُحمَّل (بدل أيقونة الصورة المكسورة)
   • تمييز القسم الحالي في القائمة الجانبية أثناء التصفح
   • تحسينات الصور: تحميل كسول + فك ترميز غير متزامن
   • حماية أزرار الإرسال من الضغط المزدوج
   • تنبيه عند انقطاع الإنترنت وعند عودته
   • روابط خارجية آمنة + إتاحة أفضل للوحة المفاتيح
===================================================================== */

(function kcitReleasePack() {

    "use strict";

    const ready = function (fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else { fn(); }
    };


    /* -----------------------------------------------------------------
       1) بديل أنيق للصور غير المتوفرة
       أي صورة لا تُحمَّل (اسم ملف خاطئ أو صورة لم تُضف بعد) تُستبدل
       بمربع أنيق بدل أيقونة الصورة المكسورة.
    ----------------------------------------------------------------- */

    function markBroken(img) {

        if (!img || img.dataset.kcitFallback === "1") return;
        img.dataset.kcitFallback = "1";

        const holder = img.parentElement;
        if (!holder) return;

        img.style.visibility = "hidden";
        holder.classList.add("img-missing");

        if (!holder.querySelector(".img-missing-note")) {
            const note = document.createElement("span");
            note.className = "img-missing-note";
            note.setAttribute("aria-hidden", "true");
            note.textContent = "الصورة قيد الإضافة";
            holder.appendChild(note);
        }
    }

    function watchImage(img) {

        if (img.dataset.kcitWatch === "1") return;
        img.dataset.kcitWatch = "1";

        /* لا نطبّق البديل على الشعارات والأيقونات الصغيرة */
        const src = img.getAttribute("src") || "";
        if (src.indexOf("logo") !== -1) return;

        img.addEventListener("error", function () { markBroken(img); });

        if (img.complete && img.naturalWidth === 0 && src) markBroken(img);
    }

    function scanImages(root) {
        (root || document).querySelectorAll("img").forEach(function (img) {

            /* تحسينات الأداء */
            if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
            if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");

            watchImage(img);
        });
    }

    ready(function () { scanImages(document); });

    if ("MutationObserver" in window) {
        new MutationObserver(function (list) {
            list.forEach(function (m) {
                m.addedNodes.forEach(function (n) {
                    if (n.nodeType !== 1) return;
                    if (n.tagName === "IMG") { watchImage(n); }
                    else if (n.querySelectorAll) { scanImages(n); }
                });
            });
        }).observe(document.documentElement, { childList: true, subtree: true });
    }


    /* -----------------------------------------------------------------
       2) تمييز القسم الحالي في القائمة الجانبية
    ----------------------------------------------------------------- */

    ready(function () {

        const links = Array.prototype.slice.call(
            document.querySelectorAll(".menu-links a[href^='#']")
        );

        if (!links.length || !("IntersectionObserver" in window)) return;

        const map = {};

        links.forEach(function (a) {
            const id = a.getAttribute("href").slice(1);
            const sec = document.getElementById(id);
            if (sec) map[id] = a;
        });

        let currentId = null;

        function setCurrent(id) {
            if (id === currentId) return;
            currentId = id;
            links.forEach(function (a) {
                const on = a.getAttribute("href") === "#" + id;
                a.classList.toggle("is-current", on);
                if (on) a.setAttribute("aria-current", "true");
                else a.removeAttribute("aria-current");
            });
        }

        const seen = new Map();

        const io = new IntersectionObserver(function (entries) {

            entries.forEach(function (e) { seen.set(e.target.id, e.intersectionRatio); });

            let bestId = null, bestRatio = 0;
            seen.forEach(function (ratio, id) {
                if (ratio > bestRatio) { bestRatio = ratio; bestId = id; }
            });

            if (bestId && bestRatio > 0.08) setCurrent(bestId);

        }, { threshold: [0, 0.1, 0.25, 0.5, 0.75], rootMargin: "-15% 0px -45% 0px" });

        Object.keys(map).forEach(function (id) {
            const sec = document.getElementById(id);
            if (sec) io.observe(sec);
        });
    });


    /* -----------------------------------------------------------------
       3) حماية أزرار الإرسال من الضغط المزدوج
    ----------------------------------------------------------------- */

    ready(function () {

        const SELECTOR = ".reg-btn-whatsapp, .payment-confirm-btn, " +
                         ".booking-submit, .custom-hall-submit, .hall-book-submit";

        document.addEventListener("click", function (e) {

            const btn = e.target.closest ? e.target.closest(SELECTOR) : null;
            if (!btn || btn.disabled) return;

            if (btn.dataset.busy === "1") { e.preventDefault(); e.stopPropagation(); return; }

            btn.dataset.busy = "1";
            btn.classList.add("is-busy");

            setTimeout(function () {
                btn.dataset.busy = "0";
                btn.classList.remove("is-busy");
            }, 2500);

        }, true);
    });


    /* -----------------------------------------------------------------
       4) تنبيه الاتصال بالإنترنت
    ----------------------------------------------------------------- */

    ready(function () {

        if (typeof showToast !== "function") return;

        let wasOffline = false;

        window.addEventListener("offline", function () {
            wasOffline = true;
            showToast("انقطع الاتصال بالإنترنت — الموقع يعمل بالوضع المحفوظ");
        });

        window.addEventListener("online", function () {
            if (!wasOffline) return;
            wasOffline = false;
            showToast("عاد الاتصال بالإنترنت ✅");
        });
    });


    /* -----------------------------------------------------------------
       5) روابط خارجية آمنة
    ----------------------------------------------------------------- */

    ready(function () {
        document.querySelectorAll('a[target="_blank"]').forEach(function (a) {
            const rel = (a.getAttribute("rel") || "").split(/\s+/);
            if (rel.indexOf("noopener") === -1) rel.push("noopener");
            if (rel.indexOf("noreferrer") === -1) rel.push("noreferrer");
            a.setAttribute("rel", rel.join(" ").trim());
        });
    });


    /* -----------------------------------------------------------------
       6) هاتف: أرقام فقط أثناء الكتابة
    ----------------------------------------------------------------- */

    ready(function () {
        document.addEventListener("input", function (e) {
            const el = e.target;
            if (!el || el.type !== "tel") return;
            const clean = el.value.replace(/[^\d]/g, "").slice(0, 11);
            if (clean !== el.value) el.value = clean;
        });
    });

})();


/* =====================================================================
   V56 — سنة الحقوق تلقائياً + بيانات منظّمة للدورات (SEO)
===================================================================== */

(function kcitSeoAndYear() {

    "use strict";

    function ready(fn) {
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
        else fn();
    }

    /* 1) سنة الحقوق تتحدّث تلقائياً كل عام */
    ready(function () {
        const el = document.querySelector(".footer-copy");
        if (!el) return;
        const year = new Date().getFullYear();
        el.textContent = "© " + year + " جميع الحقوق محفوظة - مركز كربلاء لتكنولوجيا المعلومات";
    });

    /* 2) بيانات منظّمة لكل دورة — تساعد ظهور الدورات في نتائج البحث */
    ready(function () {

        if (typeof coursesData === "undefined") return;
        if (document.getElementById("kcitCoursesLd")) return;

        const org = {
            "@type": "EducationalOrganization",
            name: "مركز كربلاء لتكنولوجيا المعلومات",
            url: "https://karbala-it.com/"
        };

        const items = Object.keys(coursesData).map(function (id, i) {

            const c = coursesData[id];
            const track = (c.tracks && c.tracks.length) ? c.tracks[0] : null;

            return {
                "@type": "ListItem",
                position: i + 1,
                item: {
                    "@type": "Course",
                    name: c.title,
                    description: c.description || "",
                    provider: org,
                    inLanguage: "ar",
                    url: "https://karbala-it.com/#courses",
                    hasCourseInstance: {
                        "@type": "CourseInstance",
                        courseMode: (c.title || "").indexOf("إلكتروني") !== -1 ? "online" : "onsite",
                        courseWorkload: (track ? track.hours : c.hours) || "",
                        location: {
                            "@type": "Place",
                            name: "مركز كربلاء لتكنولوجيا المعلومات",
                            address: {
                                "@type": "PostalAddress",
                                streetAddress: "طريق الحر - مقابل مدينة ألعاب نوارس",
                                addressLocality: "كربلاء",
                                addressCountry: "IQ"
                            }
                        }
                    }
                }
            };
        });

        const tag = document.createElement("script");
        tag.type = "application/ld+json";
        tag.id   = "kcitCoursesLd";
        tag.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "الدورات التدريبية في مركز كربلاء لتكنولوجيا المعلومات",
            itemListElement: items
        });

        document.head.appendChild(tag);
    });

})();


/* =====================================================================
   V57 — بطاقة الدورة النهائية
   الشريط + [أيقونة التفاصيل] اسم الدورة + الوصف
   + أربعة مربعات صغيرة (المدة، الساعات، الشهادة، المدرب/ة)
   + مربع السعر كاملاً + زر التسجيل
===================================================================== */

(function courseCardFinal() {

    "use strict";

    const ICON = (typeof FACT_ICONS !== "undefined") ? FACT_ICONS : {};

    function esc(t) {
        return String(t == null ? "" : t)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function ico(name) {
        return ICON[name]
            ? '<span class="fact-ico" aria-hidden="true">' + ICON[name] + "</span>"
            : "";
    }

    function mini(iconName, label, value) {
        if (!value) return "";
        return '<span class="mini-box">' +
                   ico(iconName) +
                   '<span class="mini-text">' +
                       "<small>" + esc(label) + "</small>" +
                       "<b>" + esc(value) + "</b>" +
                   "</span>" +
               "</span>";
    }


    /* ---------- بناء محتوى البطاقة ---------- */

    function build(card) {

        const id = card.dataset.course;
        if (!id || typeof getCourseView !== "function") return;

        const view = getCourseView(id, card.dataset.track || null);
        if (!view) return;

        /* الأيقونة النيون قبل اسم الدورة — تفتح بقية التفاصيل */
        const h3 = card.querySelector("h3");

        if (h3 && !h3.querySelector(".course-title-ico")) {

            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "course-title-ico";
            btn.setAttribute("aria-label", "عرض بقية تفاصيل الدورة");
            btn.title = "بقية التفاصيل";
            btn.innerHTML = ICON.info || ICON.cert ||
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
                'stroke-linecap="round" stroke-linejoin="round">' +
                '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.6v.9"/></svg>';

            btn.addEventListener("click", function (e) {
                e.stopPropagation();
                if (typeof window.openCourseDetails === "function") {
                    window.openCourseDetails(card.dataset.course, card.dataset.track || null);
                }
            });

            h3.insertBefore(btn, h3.firstChild);
        }

        /* المربعات الصغيرة */
        const certText = view.certificate
            ? ((typeof CERT_TEXT !== "undefined" ? CERT_TEXT.boxYes : "متوفرة"))
            : (typeof CERT_TEXT !== "undefined" ? CERT_TEXT.boxNo : "غير متوفرة");

        const miniHtml =
            mini("duration", "المدة",             view.duration) +
            mini("hours",    "الساعات التدريبية", view.hours) +
            mini("cert",     "الشهادة",           certText) +
            mini("trainer",  "المدرب/ة",          view.trainer);

        let miniBox = card.querySelector(".course-mini-row");

        if (!miniBox) {
            miniBox = document.createElement("div");
            miniBox.className = "course-mini-row";
            const desc = card.querySelector(".course-desc");
            if (desc && desc.parentNode) desc.parentNode.insertBefore(miniBox, desc.nextSibling);
            else card.appendChild(miniBox);
        }

        miniBox.innerHTML = miniHtml;

        /* مربع السعر */
        let priceBox = card.querySelector(".course-price-box");

        if (!priceBox) {
            priceBox = document.createElement("div");
            priceBox.className = "course-price-box";
            card.appendChild(priceBox);
        }

        priceBox.innerHTML =
            "<small>رسوم الدورة</small>" +
            '<div class="price-row">' +
                (view.oldPrice ? '<span class="price-old">' + esc(view.oldPrice) + "</span>" : "") +
                "<strong>" + esc(view.price) + "</strong>" +
            "</div>" +
            (view.offerNote
                ? '<span class="price-offer">' + esc(view.offerNote) + "</span>"
                : (view.priceNote ? "<span class=\"price-note\">" + esc(view.priceNote) + "</span>" : ""));

        /* الترتيب: المربعات ← السعر ← زر التسجيل */
        const actions = card.querySelector(".course-actions");

        if (actions) {
            const details = actions.querySelector(".course-details-btn");
            if (details) details.remove();
            card.appendChild(actions);
        }

        card.appendChild(priceBox);
        if (actions) card.appendChild(actions);

        card.classList.add("course-card-final");
    }

    function decorate() {
        document.querySelectorAll(".course-card").forEach(build);
    }

    /* إعادة البناء عند تغيير الفئة العمرية من نافذة التفاصيل */
    window.KCIT_REFRESH_CARD = function (courseId) {
        const card = document.querySelector('.course-card[data-course="' + courseId + '"]');
        if (card) build(card);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", decorate);
    } else { decorate(); }

    const grid = document.getElementById("coursesGrid");

    if (grid && "MutationObserver" in window) {
        let pending = false;
        new MutationObserver(function () {
            if (pending) return;
            pending = true;
            requestAnimationFrame(function () { pending = false; decorate(); });
        }).observe(grid, { childList: true });
    }

})();


/* =====================================================================
   V59 — أيقونة نيون خاصة بكل دورة + مربعا «موعد البدء» و«عدد المقاعد»
   والعنوان يبدأ من أعلى البطاقة
   ---------------------------------------------------------------------
   ✏️ لإضافة دورة جديدة: أضف أيقونتها في COURSE_ICONS بنفس مُعرّف الدورة،
      وإن لم تُضف تُستعمل أيقونة افتراضية تلقائياً.
===================================================================== */

const COURSE_ICONS = {

    /* الحاسوب — شاشة حاسوب */
    "computer-present":
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="2.5" y="4" width="19" height="12.5" rx="2"/><path d="M8.5 20.5h7M12 16.5v4"/></svg>',

    /* الحاسوب إلكتروني — سحابة وتشغيل */
    "computer-online":
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M6.5 18.5A4 4 0 0 1 6 10.6a5.2 5.2 0 0 1 10.1-1.3A3.8 3.8 0 0 1 18.5 18.5z"/>' +
        '<path d="M10.8 12.4v3.2l2.9-1.6z"/></svg>',

    /* المونتاج — لقطة فيلم */
    "editing":
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="2.5" y="5" width="19" height="14" rx="2.2"/><path d="M2.5 9.5h19M7.5 5v4.5M16.5 5v4.5"/>' +
        '<path d="M10.4 12.6v3.8l3.4-1.9z"/></svg>',

    /* التصوير — كاميرا */
    "photography":
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M3 8.5h3.2l1.6-2.4h8.4l1.6 2.4H21a1 1 0 0 1 1 1v8a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 17.5v-8a1 1 0 0 1 1-1z"/>' +
        '<circle cx="12" cy="13" r="3.4"/></svg>',

    /* التصميم الكرافيكي — قلم وفرشاة */
    "photoshop":
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M15.6 3.9l4.5 4.5-9.6 9.6-5.6 1.1 1.1-5.6z"/><path d="M13.6 5.9l4.5 4.5"/></svg>',

    /* الاندزاين — صفحة وتخطيط */
    "indesign":
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="3.5" y="3" width="17" height="18" rx="2"/><path d="M7.5 7.5h5M7.5 11h9M7.5 14.5h9M7.5 18h6"/></svg>',

    /* الفارسية — كرة أرضية */
    "persian":
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z"/></svg>',

    /* الإنجليزية — فقاعتا حوار */
    "english":
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M3 6.6A1.6 1.6 0 0 1 4.6 5h9.8A1.6 1.6 0 0 1 16 6.6v5.3a1.6 1.6 0 0 1-1.6 1.6H7.4L4 16.5v-3H4.6A1.6 1.6 0 0 1 3 11.9z"/>' +
        '<path d="M18.5 9.2h.9A1.6 1.6 0 0 1 21 10.8v4.6a1.6 1.6 0 0 1-1.6 1.6H19v2.6l-3-2.6h-3"/></svg>',

    /* الذكاء الاصطناعي — دماغ / شبكة */
    "ai":
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="6.5" y="6.5" width="11" height="11" rx="2.4"/><circle cx="12" cy="12" r="2.2"/>' +
        '<path d="M9.6 3.2v3.3M14.4 3.2v3.3M9.6 17.5v3.3M14.4 17.5v3.3M3.2 9.6h3.3M3.2 14.4h3.3M17.5 9.6h3.3M17.5 14.4h3.3"/></svg>',

    /* الأمن السيبراني — درع وقفل */
    "cyber":
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M12 3l7.5 3v5.4c0 4.4-3 8.3-7.5 9.6-4.5-1.3-7.5-5.2-7.5-9.6V6z"/>' +
        '<path d="M9.9 12.2v-1.4a2.1 2.1 0 0 1 4.2 0v1.4"/><rect x="9.2" y="12.2" width="5.6" height="4.1" rx="1"/></svg>',

    /* التسويق الإلكتروني — مكبّر صوت ونمو */
    "marketing":
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M3.5 10.2v3.6a1.4 1.4 0 0 0 1.4 1.4h2.3l6.6 3.8V5L7.2 8.8H4.9a1.4 1.4 0 0 0-1.4 1.4z"/>' +
        '<path d="M17.6 8.6a4.6 4.6 0 0 1 0 6.8M19.9 6a8 8 0 0 1 0 12"/></svg>',

    /* الفروسية — حصان */
    "horse":
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M6.2 21c0-3.6 1.3-5.6 3.3-7.1 1.6-1.2 2.3-2.2 2.3-3.7"/>' +
        '<path d="M11.8 10.2 8.4 8.6 5.9 10 4.4 7.4l2.9-2.1L9 3l2.2 2.2 4.3 1.8A4.6 4.6 0 0 1 18.4 11c.4 2.3-.3 3.9-1.5 5.3-1.1 1.3-1.6 2.7-1.6 4.7"/>' +
        '<path d="M7.6 6.6h.02"/></svg>',

    /* أيقونة افتراضية لأي دورة جديدة */
    "_default":
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M3 6.8 12 3l9 3.8-9 3.8z"/><path d="M6.6 9.4v4.9c0 1.8 2.4 3.1 5.4 3.1s5.4-1.3 5.4-3.1V9.4"/>' +
        '<path d="M21 6.8v6"/></svg>'
};


(function courseCardIconsAndBoxes() {

    "use strict";

    function esc(t) {
        return String(t == null ? "" : t)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    const F = (typeof FACT_ICONS !== "undefined") ? FACT_ICONS : {};

    function ico(name) {
        return F[name] ? '<span class="fact-ico" aria-hidden="true">' + F[name] + "</span>" : "";
    }

    /* أيقونة تقويم خاصة بموعد البدء (حتى لا تتكرر أيقونة الساعة) */
    const CALENDAR_ICON =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
        'stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="3.2" y="5" width="17.6" height="16" rx="2.4"/>' +
        '<path d="M3.2 10h17.6M8.2 3v4M15.8 3v4"/>' +
        '<path d="M8 14h2.2M13.8 14H16M8 17.6h2.2M13.8 17.6H16"/></svg>';

    function miniBox(iconName, label, value, rawIcon) {
        if (!value) return "";
        const iconHtml = rawIcon
            ? '<span class="fact-ico" aria-hidden="true">' + rawIcon + "</span>"
            : ico(iconName);
        return '<span class="mini-box">' +
                   iconHtml +
                   '<span class="mini-text"><small>' + esc(label) + "</small>" +
                   "<b>" + esc(value) + "</b></span></span>";
    }

    function startText(id) {

        const meta = (typeof getCourseMeta === "function") ? getCourseMeta(id) : {};

        if (meta.dateText && String(meta.dateText).trim()) return String(meta.dateText).trim();

        if (meta.startDate && typeof courseDateInfo === "function") {
            const info = courseDateInfo(meta.startDate);
            if (info) return info.full;
        }

        return "يحدد لاحقاً";
    }

    function seatsValue(id, view) {

        const meta = (typeof getCourseMeta === "function") ? getCourseMeta(id) : {};

        if (meta.seatsText && String(meta.seatsText).trim()) return String(meta.seatsText).trim();
        if (view && view.seats) return view.seats;
        if (meta.seatsLeft && typeof seatsText === "function") return seatsText(meta.seatsLeft);

        return "يحدد لاحقاً";
    }


    function upgrade(card) {

        const id = card.dataset.course;
        if (!id) return;

        /* 1) أيقونة الدورة الخاصة */
        const btn = card.querySelector(".course-title-ico");

        if (btn && btn.dataset.themed !== id) {
            btn.innerHTML = COURSE_ICONS[id] || COURSE_ICONS._default;
            btn.dataset.themed = id;
        }

        /* 2) المربعان الإضافيان: موعد البدء + عدد المقاعد */
        const row = card.querySelector(".course-mini-row");
        if (!row) return;

        if (row.querySelectorAll(".mini-box").length >= 6) return;

        const view = (typeof getCourseView === "function")
            ? getCourseView(id, card.dataset.track || null) : null;

        row.insertAdjacentHTML("beforeend",
            miniBox(null, "موعد البدء", startText(id), CALENDAR_ICON) +
            miniBox("seats", "عدد المقاعد", seatsValue(id, view))
        );
    }

    function run() { document.querySelectorAll(".course-card").forEach(upgrade); }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () { setTimeout(run, 0); });
    } else { setTimeout(run, 0); }

    const grid = document.getElementById("coursesGrid");

    if (grid && "MutationObserver" in window) {
        let pending = false;
        new MutationObserver(function () {
            if (pending) return;
            pending = true;
            requestAnimationFrame(function () { pending = false; run(); });
        }).observe(grid, { childList: true, subtree: true });
    }

    /* عند تغيير الفئة العمرية تُعاد البطاقة ثم تُحدَّث المربعات */
    const prevRefresh = window.KCIT_REFRESH_CARD;

    window.KCIT_REFRESH_CARD = function (courseId) {
        if (typeof prevRefresh === "function") prevRefresh(courseId);
        const card = document.querySelector('.course-card[data-course="' + courseId + '"]');
        if (card) upgrade(card);
    };

})();

/* =====================================================================
   V64 — صور القاعات: مجلد خاص لكل قاعة + بحث ذكي عن الصورة
   ---------------------------------------------------------------------
   بنية المجلدات:

       images/halls/hall-1/1.jpg … 5.jpg     (قاعة الاجتماعات)
       images/halls/hall-2/1.jpg … 5.jpg     (قاعة التدريب)
       images/halls/hall-3/1.jpg … 5.jpg     (قاعة التدريب الثانية)
       images/halls/hall-4/1.jpg … 5.jpg     (قاعة الاجتماعات الصغيرة)

   ✅ ضع الصورة في مجلد قاعتها باسم 1 أو 2 أو 3 أو 4 أو 5 وانتهى الأمر.

   وإذا كان امتداد صورتك مختلفاً (png / jpeg / webp) أو بحروف كبيرة،
   يجرّبها الموقع تلقائياً — فلا داعي لتغيير اسم الملف.
   كما يبقى المسار القديم (images/hall-2-1.jpg) يعمل كاحتياط.
===================================================================== */

(function hallImageResolver() {

    "use strict";

    /* الامتدادات التي تُجرَّب بالترتيب (قائمة قصيرة تكفي عملياً) */
    const EXTENSIONS = ["jpg", "png", "jpeg", "webp"];

    /* من المسار الجديد نستخرج رقم القاعة ورقم الصورة */
    const NEW_PATH = /images\/halls\/hall-(\d+)\/(\d+)\.(\w+)$/i;

    /* بعد أول نجاح نتذكّر امتداد كل قاعة فلا نكرّر المحاولات */
    const RESOLVED = Object.create(null);

    function buildAlternatives(src) {

        const match = NEW_PATH.exec(src || "");
        if (!match) return [];

        const hall  = match[1];
        const index = match[2];
        const ext   = match[3].toLowerCase();

        const list = [];
        const seen = Object.create(null);

        function push(path) {
            if (seen[path]) return;
            seen[path] = 1;
            list.push(path);
        }

        /* 1) الامتداد الذي نجح سابقاً في نفس القاعة — يُجرَّب أولاً */
        if (RESOLVED[hall] && RESOLVED[hall] !== ext) {
            push("images/halls/hall-" + hall + "/" + index + "." + RESOLVED[hall]);
        }

        /* 2) بقية الامتدادات داخل نفس المجلد */
        EXTENSIONS.forEach(function (e) {
            if (e === ext) return;
            push("images/halls/hall-" + hall + "/" + index + "." + e);
        });

        /* 3) المسار القديم المسطّح — حتى تبقى صورك الحالية تعمل */
        push("images/hall-" + hall + "-" + index + ".jpg");
        push("images/hall-" + hall + "-" + index + ".png");

        return list;
    }

    /* حفظ الامتداد الناجح لتسريع بقية صور نفس القاعة */
    function remember(src) {
        const m = NEW_PATH.exec(src || "");
        if (m) RESOLVED[m[1]] = m[3].toLowerCase();
    }

    function clearPlaceholder(img) {

        img.style.visibility = "";
        delete img.dataset.kcitFallback;

        const holder = img.parentElement;
        if (!holder) return;

        holder.classList.remove("img-missing");

        const note = holder.querySelector(".img-missing-note");
        if (note) note.remove();
    }

    function attach(img) {

        if (!img || img.dataset.hallResolver === "1") return;

        const alternatives = buildAlternatives(img.getAttribute("src"));
        if (!alternatives.length) return;

        img.dataset.hallResolver = "1";
        img._hallAlt = alternatives;

        img.addEventListener("error", function () {
            const list = img._hallAlt || [];
            if (!list.length) return;              /* انتهت المحاولات — يظهر البديل الأنيق */
            img.src = list.shift();
        });

        img.addEventListener("load", function () {
            if (img.naturalWidth > 0) {
                remember(img.getAttribute("src"));
                clearPlaceholder(img);
            }
        });

        /* إن كانت الصورة قد فشلت قبل ربط المستمع */
        if (img.complete && img.naturalWidth === 0) {
            const list = img._hallAlt;
            if (list && list.length) img.src = list.shift();
        }
    }

    function scan(root) {

        (root || document).querySelectorAll("img").forEach(function (img) {
            const src = img.getAttribute("src") || "";
            if (src.indexOf("images/halls/") !== -1) attach(img);
        });
    }

    /* الصورة داخل نافذة المعاينة تتغيّر ديناميكياً */
    function watchModalImage() {

        const modalImg = document.getElementById("modalMainImage");
        if (!modalImg || !("MutationObserver" in window)) return;

        new MutationObserver(function () {
            delete modalImg.dataset.hallResolver;
            modalImg._hallAlt = null;
            attach(modalImg);
        }).observe(modalImg, { attributes: true, attributeFilter: ["src"] });
    }

    function start() {
        scan(document);
        watchModalImage();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else { start(); }

    if ("MutationObserver" in window) {
        new MutationObserver(function (list) {
            list.forEach(function (m) {
                m.addedNodes.forEach(function (n) {
                    if (n.nodeType !== 1) return;
                    if (n.tagName === "IMG") {
                        const src = n.getAttribute("src") || "";
                        if (src.indexOf("images/halls/") !== -1) attach(n);
                    } else if (n.querySelectorAll) { scan(n); }
                });
            });
        }).observe(document.documentElement, { childList: true, subtree: true });
    }

    /* متاح للفحص من الكونسول عند الحاجة */
    window.KCIT_HALL_IMAGE_ALTS = buildAlternatives;

    /* إعادة تفعيل البحث الذكي على صورة بعد تغيير مسارها */
    window.KCIT_ATTACH_HALL_IMG = function (img) {
        if (!img) return;
        delete img.dataset.hallResolver;
        img._hallAlt = null;
        attach(img);
    };

})();

/* =====================================================================
   V65 — صورة كل بطاقة قاعة تُضبَط من hallsData تلقائياً
   ---------------------------------------------------------------------
   لماذا؟ حتى لو بقي index.html قديماً أو تغيّرت مجلدات الصور،
   يبقى مصدر الحقيقة الوحيد هو hallsData في هذا الملف — فتظهر
   كل قاعة بصورها هي، ولا تحتاج تعديل index.html مرة أخرى أبداً.
===================================================================== */

(function syncHallCardImages() {

    "use strict";

    /* من زر البطاقة نستخرج معرّف القاعة: openHallModal('hall2') */
    function hallIdOf(card) {

        const btn = card.querySelector("[onclick*='openHallModal']");
        if (!btn) return null;

        const match = /openHallModal\(\s*['"]([^'"]+)['"]\s*\)/.exec(
            btn.getAttribute("onclick") || ""
        );

        return match ? match[1] : null;
    }

    function sync() {

        if (typeof hallsData === "undefined") return;

        document.querySelectorAll(".hall-card").forEach(function (card) {

            const id   = hallIdOf(card);
            const hall = id && hallsData[id];
            if (!hall || !hall.images || !hall.images.length) return;

            const img = card.querySelector(".hall-main-image");

            if (img) {

                const wanted = hall.images[0];

                /* لا نلمس الصورة إن كانت صحيحة أصلاً */
                if (img.getAttribute("src") !== wanted) {
                    img.setAttribute("src", wanted);

                    /* نعيد تفعيل البحث الذكي عن الامتداد الصحيح */
                    delete img.dataset.kcitWatch;

                    if (typeof window.KCIT_ATTACH_HALL_IMG === "function") {
                        window.KCIT_ATTACH_HALL_IMG(img);
                    }
                }

                if (!img.getAttribute("alt")) img.setAttribute("alt", hall.title || "قاعة");
            }

            /* عدد الصور المكتوب على الغلاف يطابق العدد الحقيقي */
            const badge = card.querySelector(".gallery-overlay span");
            if (badge) badge.textContent = hall.images.length + " صور";
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () { setTimeout(sync, 0); });
    } else { setTimeout(sync, 0); }

    /* متاح للاستدعاء اليدوي عند الحاجة */
    window.KCIT_SYNC_HALL_IMAGES = sync;

})();


/* =====================================================================
   V71 — لمحات من المركز: شريط صور ثابت (بدون حركة تلقائية)
   ---------------------------------------------------------------------
   • يعرض كل صورك بالتتابع مع فاصل منتظم بينها.
   • يمكن تمريره يدوياً باللمس أو بعجلة الفأرة أو بأزرار الأسهم.
   • لا توجد أي حركة تلقائية.
   • يبحث عن الصور في  images/gallery/  بعدّة أنماط تسمية وامتدادات.
===================================================================== */

(function kcitGalleryStatic() {

    "use strict";

    const MAX = 40;
    const DIR = "images/gallery/";
    const EXT = ["jpg", "jpeg", "png", "webp", "avif", "JPG", "JPEG", "PNG"];

    function pad(n) { return n < 10 ? "0" + n : String(n); }

    const PATTERNS = [
        function (n) { return "gallery-" + pad(n); },
        function (n) { return "gallery-" + n; },
        function (n) { return pad(n); },
        function (n) { return String(n); },
        function (n) { return "img-" + pad(n); },
        function (n) { return "img-" + n; },
        function (n) { return "photo-" + pad(n); },
        function (n) { return "image-" + pad(n); }
    ];

    let hint = null;

    function tryLoad(src) {
        return new Promise(function (done) {
            const im = new Image();
            im.onload  = function () { done(im.naturalWidth > 0 ? src : null); };
            im.onerror = function () { done(null); };
            im.src = src;
        });
    }

    function resolve(n, deep) {

        const combos = [];
        if (hint) combos.push({ p: hint.p, e: hint.e });

        if (deep) {
            PATTERNS.forEach(function (p, pi) {
                EXT.forEach(function (e, ei) {
                    if (hint && hint.p === pi && hint.e === ei) return;
                    combos.push({ p: pi, e: ei });
                });
            });
        } else if (hint) {
            EXT.forEach(function (e, ei) {
                if (ei !== hint.e) combos.push({ p: hint.p, e: ei });
            });
        }

        let i = 0;
        return new Promise(function (done) {
            (function next() {
                if (i >= combos.length) return done(null);
                const c = combos[i++];
                const src = DIR + PATTERNS[c.p](n) + "." + EXT[c.e];
                tryLoad(src).then(function (ok) {
                    if (ok) { hint = c; done(ok); } else { next(); }
                });
            })();
        });
    }

    /* ---------------- العرض ---------------- */

    function render(sources) {

        let box = document.getElementById("glimpsesBox");

        if (!box) {
            const host = document.querySelector(".about-container") ||
                         document.querySelector("#about");
            if (!host) return;
            box = document.createElement("div");
            box.id = "glimpsesBox";
            host.appendChild(box);
        }

        if (!sources.length) { box.remove(); return; }

        box.className = "glimpses v71-glimpses reveal visible";
        box.innerHTML = "";

        const track = document.createElement("div");
        track.className = "v71-track";

        function buildFigure(src, i, isClone) {
            const fig = document.createElement("figure");
            fig.className = "glimpse v71-glimpse";
            if (isClone) fig.setAttribute("aria-hidden", "true");

            const img = document.createElement("img");
            img.src = src;
            img.alt = isClone ? "" : "من أنشطة مركز كربلاء لتكنولوجيا المعلومات";
            img.loading = (!isClone && i < 4) ? "eager" : "lazy";
            img.decoding = "async";
            img.draggable = false;
            if (isClone) img.setAttribute("tabindex", "-1");

            fig.appendChild(img);
            return fig;
        }

        /* نُكرّر مجموعة الصور نسخة إضافية مخفية عن قارئ الشاشة مباشرة
           بعد النسخة الأصلية. هذا يتيح تدويراً متواصلاً بلا أي قفزة أو
           رجوع عكسي: بمجرد اكتمال الصورة رقم 20 تبدأ الصورة رقم 1
           مباشرة وبنفس اتجاه الحركة تماماً. */
        sources.forEach(function (src, i) { track.appendChild(buildFigure(src, i, false)); });
        sources.forEach(function (src, i) { track.appendChild(buildFigure(src, i, true));  });

        box.appendChild(track);

        /* تمرير أفقي بعجلة الفأرة على الحاسبة */
        track.addEventListener("wheel", function (e) {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                track.scrollLeft += e.deltaY;
                e.preventDefault();
            }
        }, { passive: false });

        if (typeof observeReveals === "function" && box.parentElement) {
            try { observeReveals(box.parentElement); } catch (e) { /* تجاهل */ }
        }
    }

    /* ---------------- التشغيل ---------------- */

    function start() {

        const manual = window.KCIT_GALLERY_IMAGES;
        if (Array.isArray(manual) && manual.length) {
            Promise.all(manual.map(tryLoad)).then(function (found) {
                render(found.filter(Boolean));
            });
            return;
        }

        resolve(1, true).then(function (first) {
            if (first) return [first, 1];
            return resolve(2, true).then(function (s) { return s ? [s, 2] : null; });
        }).then(function (seed) {

            if (!seed) { render([]); return; }

            const jobs = [];
            for (let n = seed[1] + 1; n <= MAX; n++) jobs.push(resolve(n, false));

            Promise.all(jobs).then(function (rest) {
                render([seed[0]].concat(rest.filter(Boolean)));
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }

})();


/* =====================================================================
   V72 — تدوير تلقائي لشريط «لمحات من المركز»
   ---------------------------------------------------------------------
   • يمشي الشريط تلقائياً من الصورة رقم 1 حتى الصورة رقم 20.
   • بعد اكتمال الصورة 20 يُكمل الشريط بنفس اتجاه الحركة تماماً لتبدأ
     الصورة 1 من جديد — دون أي توقف أو قفزة أو رجوع عكسي، لأن مجموعة
     الصور مكرّرة مرة إضافية خفية مباشرة بعد الأصلية (انظر render أعلاه).
   • يتوقف عند مرور المؤشر أو عند تمرير المستخدم بيده، ويكمل بعده تلقائياً.
   • يتوقف عندما يكون القسم خارج الشاشة (توفير أداء وبطارية).
   • يحترم إعداد «تقليل الحركة» في نظام المستخدم.
===================================================================== */

(function kcitGalleryAutoRotate() {

    "use strict";

    const SPEED       = 45;     /* بكسل في الثانية */
    const RESUME_MS   = 2500;   /* المهلة قبل استئناف الحركة بعد تدخّل المستخدم */

    function reduced() {
        return window.matchMedia &&
               window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function attach(track) {

        if (!track || track.dataset.v72 === "1") return;
        track.dataset.v72 = "1";

        track.style.scrollBehavior = "auto";   /* حتى لا يتعارض مع الحركة */

        let pos       = 0;
        let last      = 0;
        let paused    = false;
        let visible   = true;
        let holdUntil = 0;

        /* عرض مجموعة واحدة من الصور فقط — الشريط يحتوي نسختين متتاليتين
           (انظر render أعلاه)، فنصف عرضه هو طول الدورة الكاملة. */
        function loopWidth() {
            return track.scrollWidth / 2;
        }

        function syncPos() {
            const loop = loopWidth();
            pos = loop > 1 ? (track.scrollLeft % loop) : 0;
        }

        function frame(now) {

            requestAnimationFrame(frame);

            const dt = last ? Math.min((now - last) / 1000, 0.25) : 0;
            last = now;

            const loop = loopWidth();
            if (loop < 2) { pos = 0; return; }          /* الصور تسع الشاشة */

            if (paused || !visible || now < holdUntil || reduced()) return;

            pos += SPEED * dt;

            /* اكتملت الصورة 20 — نتابع بنفس اتجاه الحركة فتبدأ الصورة 1
               مباشرة، بفضل النسخة المكرّرة، دون أي قفزة أو رجوع عكسي */
            if (pos >= loop) pos -= loop;

            track.scrollLeft = pos;
        }

        /* --- تدخّل المستخدم --- */

        function hold() {
            holdUntil = performance.now() + RESUME_MS;
            syncPos();
        }

        ["wheel", "touchstart", "pointerdown", "keydown"].forEach(function (ev) {
            track.addEventListener(ev, hold, { passive: true });
        });

        track.addEventListener("scroll", function () {
            /* إن حرّك المستخدم الشريط نُزامن الموضع */
            if (performance.now() < holdUntil) syncPos();
        }, { passive: true });

        if (window.matchMedia && window.matchMedia("(hover: hover)").matches) {
            track.addEventListener("mouseenter", function () { paused = true; });
            track.addEventListener("mouseleave", function () {
                paused = false;
                syncPos();
            });
        }

        /* --- التوقف خارج الشاشة --- */

        if ("IntersectionObserver" in window) {
            new IntersectionObserver(function (entries) {
                entries.forEach(function (e) { visible = e.isIntersecting; });
            }, { threshold: 0.01 }).observe(track);
        }

        requestAnimationFrame(frame);
    }

    /* الشريط يُبنى بعد تحميل الصور، فنراقب ظهوره */

    function look() {
        const track = document.querySelector(".v71-track");
        if (track) { attach(track); return true; }
        return false;
    }

    if (!look()) {
        const mo = new MutationObserver(function () {
            if (look()) mo.disconnect();
        });
        mo.observe(document.body, { childList: true, subtree: true });
        setTimeout(function () { mo.disconnect(); look(); }, 15000);
    }

})();

/* =====================================================================
   V73 — تفويض الأحداث (Event Delegation) بدل onclick المضمّن بالـ HTML
   ---------------------------------------------------------------------
   لماذا؟ معالجات onclick="..." المكتوبة داخل HTML تُصنَّف "سكربت مضمّن"
   (inline script) من ناحية أمنية، فتجبر سياسة CSP على السماح بـ
   'unsafe-inline' بقسم script-src — وهذا يُضعف الحماية ضد XSS بشكل
   كبير، لأنه لو نجح مهاجم بحقن أي HTML بالصفحة (حتى بثغرة صغيرة
   بمكان آخر لم نكتشفها)، ستنفَّذ أي معالجات onclick يحقنها أيضاً.

   الحل: كل زر يحمل الآن data-action="اسم الدالة" (و data-arg
   اختيارياً كمعامل)، ومستمع واحد هنا يقرأ الضغطة وينفّذ الدالة
   المطلوبة عبر window[...]. هذا يسمح بإزالة 'unsafe-inline' من
   script-src بالكامل — راجع التحديث بالـ CSP بأعلى index.html.

   ✏️ لإضافة زر جديد مستقبلاً: أضف الوسمين data-action و data-arg
   للعنصر بدل onclick، وتأكد أن الدالة معرّفة على window (أو دالة
   top-level عادية بالملف).
===================================================================== */

(function actionDelegation() {

    "use strict";

    const ALLOWED_ACTIONS = new Set([
        "closeRegistration", "sendRegistrationWhatsApp", "openPayment",
        "closePayment", "backToRegistration", "selectPayment",
        "sendPaymentWhatsApp", "openHallBooking", "openHallModal",
        "openCustomHall", "closeHallModal", "previousHallImage",
        "nextHallImage"
    ]);

    document.addEventListener("click", function (event) {

        const el = event.target.closest("[data-action]");
        if (!el) return;

        const action = el.dataset.action;

        /* قائمة بيضاء صريحة: حتى لو تسلّل عنصر بخاصية data-action
           غريبة بأي طريقة، لا يُنفَّذ إلا الأسماء المعروفة أعلاه */
        if (!ALLOWED_ACTIONS.has(action)) return;

        const fn = window[action];
        if (typeof fn !== "function") return;

        fn(el.dataset.arg);
    });

    /* كان هذا onsubmit="return false;" مضمّناً بالـ HTML — نقلناه هنا
       لنفس سبب نقل onclick: أي معالج حدث مكتوب داخل HTML يحتاج
       'unsafe-inline' بالـ CSP، وهذا يُضعف الحماية ضد XSS */
    const regForm = document.getElementById("registrationForm");
    if (regForm) regForm.addEventListener("submit", function (e) { e.preventDefault(); });

})();