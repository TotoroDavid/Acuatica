// ===== LOADER FUNCTIONALITY =====
(function () {
    'use strict';

    // Initialize the counter and loader duration variables
    let counter = {
        value: 0
    };
    let loaderDuration = 8;
    let maxRetries = 10;
    let retryCount = 0;

    // Check if this is not the first time the user has visited this page
    try {
        if (sessionStorage.getItem("visited") !== null) {
            // If so, set the loader duration to 2 seconds and the counter value to 75
            loaderDuration = 2;
            counter = {
                value: 75
            };
        }
        // Set the visited item in the session storage to "true"
        sessionStorage.setItem("visited", "true");
    } catch (e) {
        // Ignore sessionStorage errors
    }

    // Define a function to update the loader text
    function updateLoaderText() {
        try {
            let progress = Math.round(counter.value);
            if (typeof $ !== 'undefined') {
                $(".loader5_number").text(progress);
            }
        } catch (e) {
            // Ignore update errors
        }
    }

    // Define a function to end the loader animation
    function endLoaderAnimation() {
        try {
            if (typeof $ !== 'undefined') {
                $(".loader5_ix-trigger").click();
            }
        } catch (e) {
            // Fallback: hide loader manually
            try {
                if (typeof $ !== 'undefined') {
                    $(".loader-wrapper").fadeOut(500);
                }
            } catch (e2) {
                // Last resort: use vanilla JS
                let loader = document.querySelector('.loader-wrapper');
                if (loader) {
                    loader.style.display = 'none';
                }
            }
        }
    }

    // Function to initialize and start the loader
    function initLoader() {
        try {
            retryCount++;

            // Check if we have the required libraries
            if (typeof $ === 'undefined' || typeof gsap === 'undefined') {
                if (retryCount < maxRetries) {
                    setTimeout(initLoader, 300);
                    return;
                }
                // Give up after max retries
                return;
            }

            // Force show the loader wrapper
            $(".loader-wrapper").show().css({
                "display": "block",
                "visibility": "visible",
                "opacity": "1"
            });

            // Create a timeline animation using GSAP
            let tl = gsap.timeline({
                onComplete: endLoaderAnimation
            });

            // Animate the counter value from 0 to 100
            tl.to(counter, {
                value: 100,
                onUpdate: updateLoaderText,
                duration: loaderDuration,
                ease: "easeInOut"
            });

            // Animate the width of the loader progress bar to 100%
            tl.to(".loader5_progress-bar", {
                width: "100%",
                duration: loaderDuration,
                ease: "easeInOut"
            }, 0);

        } catch (error) {
            // If there's an error, try again
            if (retryCount < maxRetries) {
                setTimeout(initLoader, 500);
            }
        }
    }

    // Multiple initialization strategies
    function startLoaderSafely() {
        try {
            initLoader();
        } catch (e) {
            // Ignore errors and try again
            setTimeout(startLoaderSafely, 200);
        }
    }

    // Try to start immediately
    startLoaderSafely();

    // Try when DOM is ready
    if (typeof $ !== 'undefined') {
        try {
            $(document).ready(startLoaderSafely);
        } catch (e) {
            // Ignore jQuery errors
        }
    }

    // Try when window loads
    if (typeof $ !== 'undefined') {
        try {
            $(window).on('load', startLoaderSafely);
        } catch (e) {
            // Ignore jQuery errors
        }
    }

    // Fallback with vanilla JS
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startLoaderSafely);
    } else {
        startLoaderSafely();
    }

    // Final fallback after 1 second
    setTimeout(startLoaderSafely, 1000);

})();

// ===== FALLBACK FOR LENIS (In case external script fails due to CORS) =====
(function () {
    'use strict';

    // Wait a bit to see if the external lenis.js loads successfully
    setTimeout(function () {
        // Check if Lenis was loaded from the external script
        if (typeof Lenis === 'undefined') {
            console.log('⚠️ External Lenis script failed to load (likely CORS), using fallback...');

            // Simple fallback smooth scroll using CSS
            try {
                document.documentElement.style.scrollBehavior = 'smooth';
                console.log('✅ Fallback smooth scroll enabled');
            } catch (e) {
                console.log('❌ Fallback smooth scroll failed');
            }
            return;
        }

        // If Lenis is available, initialize it
        try {
            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                console.log("🌊 Lenis Smooth Scroll & GSAP Animations Loaded");

                // Register GSAP plugins
                gsap.registerPlugin(ScrollTrigger, TextPlugin);

                // ===== LENIS SMOOTH SCROLL SETUP =====
                let lenis = new Lenis({
                    lerp: 0.1,
                    wheelMultiplier: 0.7,
                    gestureOrientation: "vertical",
                    normalizeWheel: false,
                    smoothTouch: false,
                });

                function raf(time) {
                    lenis.raf(time);
                    requestAnimationFrame(raf);
                }
                requestAnimationFrame(raf);

                // Lenis control buttons
                if (typeof $ !== 'undefined') {
                    $("[data-lenis-start]").on("click", function () {
                        lenis.start();
                    });
                    $("[data-lenis-stop]").on("click", function () {
                        lenis.stop();
                    });
                    $("[data-lenis-toggle]").on("click", function () {
                        $(this).toggleClass("stop-scroll");
                        if ($(this).hasClass("stop-scroll")) {
                            lenis.stop();
                        } else {
                            lenis.start();
                        }
                    });
                }

                // ===== LENIS + SCROLLTRIGGER INTEGRATION =====
                lenis.on('scroll', ScrollTrigger.update);

                gsap.ticker.add((time) => {
                    lenis.raf(time * 1000);
                });

                gsap.ticker.lagSmoothing(0);

                console.log("🚀 Lenis smooth scroll initialized successfully!");
            }
        } catch (error) {
            console.log('Error initializing Lenis:', error);
            // Use CSS fallback
            document.documentElement.style.scrollBehavior = 'smooth';
        }
    }, 2000); // Wait 2 seconds for external script to load

})();

// ===== ERROR HANDLING FOR CORS AND OTHER ISSUES =====
window.addEventListener('error', function (e) {
    // Suppress CORS errors to prevent them from breaking other functionality
    if (e.message && e.message.includes('CORS')) {
        console.log('🔒 CORS error suppressed:', e.filename);
        e.preventDefault();
        return false;
    }
});

// Suppress unhandled promise rejections that might come from external scripts
window.addEventListener('unhandledrejection', function (e) {
    if (e.reason && e.reason.toString().includes('CORS')) {
        console.log('🔒 CORS promise rejection suppressed');
        e.preventDefault();
        return false;
    }
});