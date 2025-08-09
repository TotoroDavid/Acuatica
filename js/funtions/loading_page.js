// ===== LOADER FUNCTIONALITY =====
(function () {
    'use strict';

    // MEJORA: Control de ejecución única
    if (window.loaderInitialized) {
        return; // Ya se inicializó, salir
    }
    window.loaderInitialized = true;

    // Initialize the counter and loader duration variables
    let counter = { value: 0 };
    let loaderDuration = 8;
    let maxRetries = 10;
    let retryCount = 0;
    let isFirstVisit = true;

    // Check if this is not the first time the user has visited this page
    try {
        if (sessionStorage.getItem("visited") !== null) {
            isFirstVisit = false;
            loaderDuration = 2;
            counter = { value: 75 };
        }
        sessionStorage.setItem("visited", "true");
    } catch (e) {
        // Ignore sessionStorage errors
        console.warn('SessionStorage not available:', e);
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
            // MEJORA: Marcar como completado para evitar múltiples ejecuciones
            window.loaderCompleted = true;

            // Intentar trigger de Webflow primero
            if (typeof $ !== 'undefined') {
                const $trigger = $(".loader5_ix-trigger");
                if ($trigger.length > 0) {
                    $trigger.click();

                    // MEJORA: Verificar si el trigger funcionó después de 1 segundo
                    setTimeout(() => {
                        const $wrapper = $(".loader-wrapper");
                        if ($wrapper.length > 0 && $wrapper.is(':visible')) {
                            console.warn('🚨 Webflow trigger failed, using manual fallback');
                            hideLoaderProperly();
                        }
                    }, 1000);
                } else {
                    // No hay trigger, usar fallback inmediatamente
                    hideLoaderProperly();
                }
            } else {
                // No hay jQuery, usar fallback
                hideLoaderProperly();
            }
        } catch (e) {
            console.error('Error in endLoaderAnimation:', e);
            hideLoaderProperly();
        }
    }

    // MEJORA: Función específica para ocultar el loader correctamente
    function hideLoaderProperly() {
        console.log('🔧 Manually hiding loader...');

        try {
            if (typeof $ !== 'undefined') {
                const $wrapper = $(".loader-wrapper");
                const $component = $(".loader5_component");

                if ($wrapper.length > 0) {
                    console.log('📍 Found loader-wrapper, hiding...');

                    // PASO 1: Inmediatamente permitir clics
                    $wrapper.css({
                        'pointer-events': 'none',
                        'z-index': '-1' // Enviar atrás para evitar bloqueos
                    });

                    // PASO 2: Animar salida
                    $wrapper.css({
                        'transition': 'opacity 0.5s ease, transform 0.5s ease',
                        'opacity': '0',
                        'transform': 'translateY(-100%)'
                    });

                    // PASO 3: Ocultar componente interno si existe
                    if ($component.length > 0) {
                        $component.css({
                            'display': 'none',
                            'opacity': '0'
                        });
                    }

                    // PASO 4: Remover completamente después de la animación
                    setTimeout(() => {
                        $wrapper.css('display', 'none');
                        setTimeout(() => {
                            $wrapper.remove();
                            console.log('✅ Loader completely removed');
                        }, 100);
                    }, 500);
                }
            }
        } catch (e) {
            console.error('jQuery fallback failed:', e);

            // Last resort: use vanilla JS
            const wrapper = document.querySelector('.loader-wrapper');
            const component = document.querySelector('.loader5_component');

            if (wrapper) {
                console.log('📍 Using vanilla JS fallback...');

                // PASO 1: Inmediatamente permitir clics
                wrapper.style.pointerEvents = 'none';
                wrapper.style.zIndex = '-1';

                // PASO 2: Animar salida
                wrapper.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                wrapper.style.opacity = '0';
                wrapper.style.transform = 'translateY(-100%)';

                // PASO 3: Ocultar componente interno
                if (component) {
                    component.style.display = 'none';
                    component.style.opacity = '0';
                }

                // PASO 4: Remover completamente
                setTimeout(() => {
                    wrapper.style.display = 'none';
                    setTimeout(() => {
                        if (wrapper.parentNode) {
                            wrapper.parentNode.removeChild(wrapper);
                            console.log('✅ Loader completely removed (vanilla JS)');
                        }
                    }, 100);
                }, 500);
            }
        }
    }

    // Function to initialize and start the loader
    function initLoader() {
        // MEJORA: Verificar si ya se completó
        if (window.loaderCompleted) {
            return;
        }

        try {
            retryCount++;

            // Check if we have the required libraries
            if (typeof $ === 'undefined' || typeof gsap === 'undefined') {
                if (retryCount < maxRetries) {
                    setTimeout(initLoader, 300);
                    return;
                }
                // MEJORA: Fallback sin GSAP
                console.warn('GSAP/jQuery not available, using fallback loader');
                fallbackLoader();
                return;
            }

            // MEJORA: Verificar que el loader existe en el DOM
            const loaderWrapper = $(".loader-wrapper");
            if (loaderWrapper.length === 0) {
                console.warn('Loader wrapper not found in DOM');
                return;
            }

            // Force show the loader wrapper
            loaderWrapper.show().css({
                "display": "block",
                "visibility": "visible",
                "opacity": "1"
            });

            // Create a timeline animation using GSAP
            const tl = gsap.timeline({
                onComplete: endLoaderAnimation
            });

            // Animate the counter value from 0 to 100
            tl.to(counter, {
                value: 100,
                onUpdate: updateLoaderText,
                duration: loaderDuration,
                ease: "power2.inOut" // MEJORA: Ease más moderno
            });

            // Animate the width of the loader progress bar to 100%
            tl.to(".loader5_progress-bar", {
                width: "100%",
                duration: loaderDuration,
                ease: "power2.inOut"
            }, 0);

            console.log(`🔄 Loader initialized (${isFirstVisit ? 'first visit' : 'returning visitor'})`);

        } catch (error) {
            console.error('Loader initialization error:', error);
            if (retryCount < maxRetries) {
                setTimeout(initLoader, 500);
            } else {
                fallbackLoader();
            }
        }
    }

    // MEJORA: Fallback loader sin dependencias
    function fallbackLoader() {
        const loader = document.querySelector('.loader-wrapper');
        if (!loader) return;

        let progress = counter.value;
        const increment = (100 - progress) / (loaderDuration * 60); // 60fps aprox

        const animate = () => {
            progress += increment;
            if (progress >= 100) {
                progress = 100;
                updateLoaderText();
                setTimeout(endLoaderAnimation, 100);
                return;
            }
            counter.value = progress;
            updateLoaderText();
            requestAnimationFrame(animate);
        };

        animate();
    }

    // MEJORA: Estrategia de inicialización única y controlada
    function startLoaderSafely() {
        // Verificar si ya se ejecutó
        if (window.loaderStarted) {
            return;
        }
        window.loaderStarted = true;

        try {
            initLoader();
        } catch (e) {
            console.error('Loader start error:', e);
            // Solo reintentar una vez
            setTimeout(() => {
                window.loaderStarted = false;
                startLoaderSafely();
            }, 500);
        }
    }

    // MEJORA: Verificación inmediata de loader atascado
    function checkForStuckLoader() {
        setTimeout(() => {
            const wrapper = document.querySelector('.loader-wrapper');
            const component = document.querySelector('.loader5_component');

            // Si el wrapper está visible pero el componente está oculto = loader atascado
            if (wrapper && component) {
                const wrapperVisible = window.getComputedStyle(wrapper).display !== 'none';
                const componentVisible = window.getComputedStyle(component).display !== 'none';

                if (wrapperVisible && !componentVisible) {
                    console.warn('🚨 Detected stuck loader on page load!');
                    hideLoaderProperly();
                }
            }
        }, 500);
    }

    // MEJORA: Una sola estrategia de inicialización basada en el estado del DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            startLoaderSafely();
            checkForStuckLoader();
        });
    } else {
        // DOM ya está listo
        startLoaderSafely();
        checkForStuckLoader();
    }

})();

// ===== LOADER SESSION CONTROL =====
// MEJORA: Sistema adicional para prevenir múltiples ejecuciones
(function () {
    'use strict';

    // Limpiar cualquier loader que pueda haber quedado visible
    const cleanupStuckLoader = () => {
        const loaders = document.querySelectorAll('.loader-wrapper');
        loaders.forEach((loader, index) => {
            if (index > 0) { // Mantener solo el primero
                loader.remove();
            }
        });
    };

    // Ejecutar limpieza después de que todo se haya cargado
    window.addEventListener('load', () => {
        setTimeout(cleanupStuckLoader, 1000);

        // MEJORA: Auto-hide del loader si se queda pegado (múltiples verificaciones)
        const timeouts = [3000, 8000, 15000]; // 3s, 8s, 15s

        timeouts.forEach((delay, index) => {
            setTimeout(() => {
                const wrapper = document.querySelector('.loader-wrapper');
                if (wrapper) {
                    const isVisible = window.getComputedStyle(wrapper).display !== 'none';
                    const hasOpacity = parseFloat(window.getComputedStyle(wrapper).opacity) > 0;

                    if (isVisible && hasOpacity) {
                        console.warn(`🚨 Loader timeout ${index + 1} - forcing hide after ${delay}ms`);
                        hideLoaderProperly();
                    }
                }
            }, delay);
        });
    });
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