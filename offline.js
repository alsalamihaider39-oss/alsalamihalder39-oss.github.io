/* زر «إعادة المحاولة» بصفحة عدم الاتصال — كان onclick="location.reload()"
   مضمّناً بالـ HTML، نُقل هنا حتى تصير CSP على هذه الصفحة بدون
   'unsafe-inline' إطلاقاً (لا بالسكربت ولا بالستايل). */
(function () {
    "use strict";
    const btn = document.getElementById("retryBtn");
    if (btn) btn.addEventListener("click", function () { location.reload(); });
})();