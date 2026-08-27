/* =========================================================
   ثانوية الصالحات الأهلية للبنات
   JAVASCRIPT
========================================================= */


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* ==============================================
           CURRENT YEAR
        =============================================== */

        const year =
            document.getElementById("year");


        if (year) {

            year.textContent =
                new Date().getFullYear();

        }



        /* ==============================================
           CONTACT CARDS ANIMATION
        =============================================== */

        const cards =
            document.querySelectorAll(
                ".contact-card"
            );


        if (
            "IntersectionObserver"
            in window
        ) {


            const observer =
                new IntersectionObserver(

                    function (entries, observer) {

                        entries.forEach(
                            function (entry, index) {

                                if (
                                    entry.isIntersecting
                                ) {


                                    setTimeout(
                                        function () {

                                            entry.target.classList.add(
                                                "visible"
                                            );

                                        },
                                        index * 90
                                    );


                                    observer.unobserve(
                                        entry.target
                                    );

                                }

                            }
                        );

                    },
                    {
                        threshold: 0.12
                    }

                );


            cards.forEach(
                function (card) {

                    observer.observe(card);

                }
            );


        } else {


            cards.forEach(
                function (card) {

                    card.classList.add(
                        "visible"
                    );

                }
            );

        }



        /* ==============================================
           SCROLL TOP
        =============================================== */

        const scrollTop =
            document.getElementById(
                "scrollTop"
            );


        if (scrollTop) {


            window.addEventListener(
                "scroll",
                function () {


                    if (
                        window.scrollY > 300
                    ) {

                        scrollTop.classList.add(
                            "show"
                        );

                    } else {

                        scrollTop.classList.remove(
                            "show"
                        );

                    }

                },
                {
                    passive: true
                }
            );


            scrollTop.addEventListener(
                "click",
                function () {

                    window.scrollTo({

                        top: 0,

                        behavior: "smooth"

                    });

                }
            );

        }



        /* ==============================================
           CONTACT CARD CLICK EFFECT
        =============================================== */

        cards.forEach(
            function (card) {


                card.addEventListener(
                    "pointerdown",
                    function () {

                        this.style.transform =
                            "scale(.985)";

                    }
                );


                card.addEventListener(
                    "pointerup",
                    function () {

                        this.style.transform =
                            "";

                    }
                );


                card.addEventListener(
                    "pointercancel",
                    function () {

                        this.style.transform =
                            "";

                    }
                );


                card.addEventListener(
                    "pointerleave",
                    function () {

                        this.style.transform =
                            "";

                    }
                );

            }
        );



        /* ==============================================
           SOCIAL ICONS EFFECT
        =============================================== */

        const socialIcons =
            document.querySelectorAll(
                ".social-icons a:not(.disabled-social)"
            );


        socialIcons.forEach(
            function (icon) {


                icon.addEventListener(
                    "pointerdown",
                    function () {

                        this.style.transform =
                            "scale(.92)";

                    }
                );


                icon.addEventListener(
                    "pointerup",
                    function () {

                        this.style.transform =
                            "";

                    }
                );


                icon.addEventListener(
                    "pointerleave",
                    function () {

                        this.style.transform =
                            "";

                    }
                );

            }
        );



        /* ==============================================
           DISABLED SOCIAL LINKS
        =============================================== */

        const disabledSocials =
            document.querySelectorAll(
                ".disabled-social"
            );


        disabledSocials.forEach(
            function (social) {

                social.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                    }
                );

            }
        );



        /* ==============================================
           LOGO ERROR CHECK
        =============================================== */

        const logos =
            document.querySelectorAll(
                ".logo, .footer-logo img"
            );


        logos.forEach(
            function (logo) {

                logo.addEventListener(
                    "error",
                    function () {

                        console.warn(
                            "تأكد من وجود ملف logo.png داخل مجلد الموقع."
                        );

                    }
                );

            }
        );


    }
);


/* =========================================================
   PAGE LOADED
========================================================= */

window.addEventListener(
    "load",
    function () {

        document.body.classList.add(
            "loaded"
        );

    }
);