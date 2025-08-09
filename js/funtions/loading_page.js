/**
 * Acuatica Landing Page Reveal Animation con GSAP
 * Animación de preloader con contador y revelado de contenido hero
 * Basado en arquitectura de capas superpuestas con clip-path
 * Version 2.0 - Limpia y sin conflictos
 */

// ===== LIMPIEZA DE CÓDIGO ANTERIOR =====
(function () {
    'use strict';

    // Limpiar cualquier loader o timeline anterior
    if (window.loaderInitialized) {
        console.log('🧹 Cleaning previous loader instance...');

        // Detener cualquier timeline anterior
        if (window.masterTimeline) {
            window.masterTimeline.kill();
            window.masterTimeline = null;
        }

        // Limpiar timeouts anteriores
        if (window.loaderTimeouts) {
            window.loaderTimeouts.forEach(timeout => clearTimeout(timeout));
            window.loaderTimeouts = [];
        }

        // Reset flags
        window.loaderInitialized = false;
        window.loaderCompleted = false;
        window.loaderStarted = false;
    }

    // Función global de limpieza de emergencia
    window.forceCleanLoader = function () {
        const wrapper = document.querySelector('.loader-wrapper');
        const heroImages = document.querySelectorAll('.hero-img');
        const navbar = document.querySelector('.navbar5_component');

        if (wrapper) {
            heroImages.forEach(img => {
                img.style.clipPath = 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)';
                img.style.opacity = '1';
                img.style.transform = 'scale(1)';
            });

            if (navbar) {
                navbar.style.opacity = '1';
                navbar.style.transform = 'translateY(0)';
            }

            wrapper.style.display = 'none';
            setTimeout(() => {
                if (wrapper.parentNode) {
                    wrapper.parentNode.removeChild(wrapper);
                }
            }, 100);
        }

        console.log('🚨 Emergency loader cleanup completed');
    };

    // Ejecutar limpieza inmediata si hay problemas
    setTimeout(() => {
        if (document.querySelector('.loader-wrapper')) {
            const hasErrors = document.querySelectorAll('[data-w-id="c681c04e-9cd1-65a3-4b77-29e07c8cf36a"]').length > 0;
            if (hasErrors) {
                console.log('🔧 Detected potential conflicts, running immediate cleanup...');
                window.forceCleanLoader();
            }
        }
    }, 3000); // Ejecutar después de 3 segundos si hay problemas
})();

/**
 * Limpiar código residual que pueda estar causando conflictos
 */
function cleanResidualCode() {
    try {
        // Limpiar elementos problemáticos de Webflow
        const problematicElements = document.querySelectorAll('[data-w-id="c681c04e-9cd1-65a3-4b77-29e07c8cf36a"]');
        problematicElements.forEach(el => {
            // Remover event listeners problemáticos
            el.onclick = null;
            el.style.pointerEvents = 'none';
        });

        // Limpiar cualquier timeline global anterior
        if (window.gsap && window.gsap.globalTimeline) {
            window.gsap.globalTimeline.getChildren().forEach(tl => {
                if (tl.vars && tl.vars.id === 'acuatica-loader') {
                    tl.kill();
                }
            });
        }

        console.log(`🧹 Cleaned ${problematicElements.length} residual elements`);
    } catch (e) {
        console.warn('Could not clean residual code:', e);
    }
}

// ===== CONFIGURACIÓN DE ANIMACIÓN =====
const animationConfig = {
    preloader: {
        duration: 8, // 8s primera visita, 2s recurrente
        counter: {
            totalDuration: 7.5,
            ease: "power2.out"
        },
        progressBar: {
            phase1: { width: "30%", duration: 2, start: 0.5 },
            phase2: { width: "100%", duration: 4.5, start: 2.5 },
            fadeOut: { duration: 0.3, start: 7.2 }
        },
        exit: { duration: 1, start: 8, ease: "power2.inOut" }
    },
    reveal: {
        images: {
            displayTime: 0.8, // Tiempo que cada imagen permanece visible
            transitionTime: 0.4, // Tiempo de transición entre imágenes
            start: 9,
            effects: {
                zoomIn: 1.1, // Zoom de entrada
                zoomHover: 1.05, // Zoom durante display
                zoomOut: 1.15 // Zoom de salida
            }
        },
        navigation: {
            duration: 0.8,
            start: 14, // Después de que terminen todas las imágenes
            ease: "power2.out"
        }
    }
};

// ===== VARIABLES GLOBALES =====
let masterTimeline;
let preloader, progressBar, heroImages, navbar, loaderNumber;
let isFirstVisit = true;
let loaderDuration = 8;

// ===== INICIALIZACIÓN =====
(function () {
    'use strict';

    // Control de ejecución única con limpieza
    if (window.loaderInitialized) {
        console.log('⚠️ Loader already initialized, skipping...');
        return;
    }

    // Marcar como inicializado inmediatamente
    window.loaderInitialized = true;
    window.loaderTimeouts = [];

    // Verificar si es primera visita
    try {
        if (sessionStorage.getItem("visited") !== null) {
            isFirstVisit = false;
            loaderDuration = 2;
            // Ajustar configuración para visitantes recurrentes
            animationConfig.preloader.duration = 2;
            animationConfig.preloader.counter.totalDuration = 1.5;
            animationConfig.preloader.progressBar.phase1.duration = 0.5;
            animationConfig.preloader.progressBar.phase2.duration = 0.8;
            animationConfig.preloader.exit.start = 2;
            animationConfig.reveal.start = 3;
            animationConfig.reveal.navigation.start = 6;
        }
        sessionStorage.setItem("visited", "true");
    } catch (e) {
        console.warn('SessionStorage not available:', e);
    }

    // Limpiar cualquier código residual antes de inicializar
    cleanResidualCode();

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAnimation);
    } else {
        initializeAnimation();
    }
})();

/**
 * Inicializar elementos DOM y crear animación principal
 */
function initializeAnimation() {
    try {
        // Verificar que GSAP esté cargado
        if (typeof gsap === 'undefined') {
            console.error('GSAP no está cargado. Usando fallback...');
            fallbackAnimation();
            return;
        }

        // Inicializar elementos DOM
        initializeElements();

        // Inyectar estilos críticos
        injectCriticalStyles();

        // Preparar elementos para animación
        prepareElements();

        // Crear y ejecutar timeline principal
        createMasterTimeline();

        console.log(`🎬 Animation initialized (${isFirstVisit ? 'first visit' : 'returning visitor'})`);

    } catch (error) {
        console.error('Animation initialization error:', error);
        fallbackAnimation();
    }
}

/**
 * Inicializar referencias a elementos DOM
 */
function initializeElements() {
    preloader = document.querySelector('.loader-wrapper');
    progressBar = document.querySelector('.loader5_progress-bar');
    heroImages = document.querySelectorAll('.hero-img');
    navbar = document.querySelector('.navbar5_component');
    loaderNumber = document.querySelector('.loader5_number');

    // Verificar elementos críticos
    if (!preloader) {
        throw new Error('Loader wrapper not found');
    }

    console.log(`🎨 Found ${heroImages.length} hero images`);
}

/**
 * Inyectar estilos CSS críticos para las animaciones
 */
function injectCriticalStyles() {
    if (document.getElementById('acuatica-reveal-styles')) {
        return;
    }

    const styles = `
        <style id="acuatica-reveal-styles">
            /* Optimizaciones para animaciones suaves */
            .loader-wrapper {
                position: fixed;
                inset: 0%;
                z-index: 100;
                display: block;
                min-height: 100vh;
                will-change: clip-path, opacity;
                background: #000;
            }
            
            .loader_imgs {
                position: relative;
                z-index: 98;
                overflow: hidden;
            }
            
            .hero-imgs {
                position: relative;
                width: 100%;
                height: 100vh;
            }
            
            .hero-img {
                position: absolute;
                inset: 0%;
                width: 100%;
                min-height: 100vh;
                object-fit: cover;
                will-change: clip-path, transform, opacity;
                backface-visibility: hidden;
                transform-origin: center center;
            }
            
            .navbar5_component {
                will-change: transform, opacity;
            }
            
            /* Z-index específicos para capas */
            .hero-img.z-index-1 { z-index: 1; }
            .hero-img.z-index-2 { z-index: 2; }
            .hero-img.z-index-3 { z-index: 3; }
            .hero-img.z-index-4 { z-index: 4; }
            .hero-img.z-index-5 { z-index: 5; }
            .hero-img.z-index-6 { z-index: 6; }
            .hero-img.z-index-7 { z-index: 7; }
        </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
    console.log('🎨 Critical styles injected');
}

/**
 * Preparar elementos para animación
 */
function prepareElements() {
    // Mostrar preloader
    gsap.set(preloader, {
        display: "block",
        visibility: "visible",
        opacity: 1
    });

    // Preparar imágenes hero - inicialmente ocultas
    gsap.set(heroImages, {
        clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
        scale: animationConfig.reveal.images.effects.zoomIn,
        opacity: 1,
        transformOrigin: 'center center'
    });

    // Preparar navbar - inicialmente oculta
    gsap.set(navbar, {
        y: -100,
        opacity: 0
    });

    console.log('🎯 Elements prepared for animation');
}

/**
 * Crear timeline principal con todas las animaciones
 */
function createMasterTimeline() {
    // Crear timeline principal con ID único
    masterTimeline = gsap.timeline({
        id: 'acuatica-loader',
        onComplete: () => {
            console.log('✨ Master animation sequence completed');
            cleanupAnimation();
        }
    });

    // Guardar referencia global
    window.masterTimeline = masterTimeline;

    // Fase 1: Animaciones del preloader
    animatePreloader();

    // Fase 2: Ocultar preloader
    hidePreloader();

    // Fase 3: Revelar contenido hero
    revealHeroContent();

    // Fase 4: Animar navegación
    animateNavigation();
}

/**
 * Animaciones del preloader (contador y barra de progreso)
 */
function animatePreloader() {
    const config = animationConfig.preloader;

    // Animar contador de 0 a 100
    const counterObj = { value: isFirstVisit ? 0 : 75 };

    masterTimeline.to(counterObj, {
        value: 100,
        duration: config.counter.totalDuration,
        ease: config.counter.ease,
        onUpdate: function () {
            if (loaderNumber) {
                loaderNumber.textContent = Math.round(counterObj.value);
            }
        }
    }, 0.5);

    // Animar barra de progreso en dos fases
    if (progressBar) {
        // Fase 1: 0% → 30%
        masterTimeline.to(progressBar, {
            width: config.progressBar.phase1.width,
            duration: config.progressBar.phase1.duration,
            ease: "power2.out"
        }, config.progressBar.phase1.start);

        // Fase 2: 30% → 100%
        masterTimeline.to(progressBar, {
            width: config.progressBar.phase2.width,
            duration: config.progressBar.phase2.duration,
            ease: "power2.inOut"
        }, config.progressBar.phase2.start);

        // Fade out de la barra
        masterTimeline.to(progressBar, {
            opacity: 0,
            duration: config.progressBar.fadeOut.duration,
            ease: "power2.out"
        }, config.progressBar.fadeOut.start);
    }
}

/**
 * Ocultar preloader con deslizamiento hacia arriba
 */
function hidePreloader() {
    const config = animationConfig.preloader;

    // Ocultar componente del loader primero
    masterTimeline.to('.loader5_component', {
        opacity: 0,
        scale: 0.8,
        y: -30,
        duration: 0.6,
        ease: 'power2.inOut'
    }, config.exit.start - 0.5);

    // Deslizar preloader hacia arriba con clip-path
    masterTimeline.to(preloader, {
        clipPath: 'polygon(0 0%, 100% 0%, 100% 0%, 0 0%)',
        duration: config.exit.duration,
        ease: config.exit.ease
    }, config.exit.start);
}

/**
 * Revelar contenido hero con animación de imágenes secuencial
 */
function revealHeroContent() {
    const config = animationConfig.reveal;

    if (heroImages.length === 0) {
        console.warn('No hero images found for reveal animation');
        return;
    }

    // Configurar timing para secuencia de imágenes
    const imageDisplayTime = config.images.displayTime;
    const transitionTime = config.images.transitionTime;
    let currentTime = config.images.start;

    // Animar cada imagen secuencialmente
    heroImages.forEach((img, index) => {
        const isLastImage = index === heroImages.length - 1;

        // === ENTRADA DE LA IMAGEN ===

        // 1. Revelar con clip-path
        masterTimeline.to(img, {
            clipPath: 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)',
            duration: transitionTime,
            ease: 'power2.out'
        }, currentTime);

        // 2. Zoom de entrada dramático
        masterTimeline.to(img, {
            scale: config.images.effects.zoomHover,
            duration: transitionTime * 1.2,
            ease: 'back.out(1.4)'
        }, currentTime + 0.1);

        // === MOMENTO DE DISPLAY ===

        // 3. Estabilización suave
        masterTimeline.to(img, {
            scale: 1.02,
            duration: 0.3,
            ease: 'power2.out'
        }, currentTime + transitionTime);

        // === SALIDA DE LA IMAGEN (excepto la última) ===

        if (!isLastImage) {
            // 4. Zoom out antes de ocultar
            masterTimeline.to(img, {
                scale: config.images.effects.zoomOut,
                duration: 0.2,
                ease: 'power2.in'
            }, currentTime + imageDisplayTime - 0.2);

            // 5. Ocultar con clip-path
            masterTimeline.to(img, {
                clipPath: 'polygon(0 0%, 100% 0%, 100% 0%, 0 0%)',
                duration: transitionTime * 0.8,
                ease: 'power2.in'
            }, currentTime + imageDisplayTime - 0.1);
        } else {
            // === IMAGEN FINAL (permanece visible) ===

            // Transición final suave a escala normal
            masterTimeline.to(img, {
                scale: 1,
                duration: 0.6,
                ease: 'power2.out'
            }, currentTime + imageDisplayTime - 0.3);

            // Establecer como imagen principal
            masterTimeline.set(img, {
                zIndex: 10
            }, currentTime + imageDisplayTime);
        }

        // Incrementar tiempo para la siguiente imagen
        currentTime += imageDisplayTime - (transitionTime * 0.2);
    });
}

/**
 * Animar navegación con entrada desde arriba
 */
function animateNavigation() {
    const config = animationConfig.reveal.navigation;

    if (navbar) {
        masterTimeline.to(navbar, {
            y: 0,
            opacity: 1,
            duration: config.duration,
            ease: config.ease
        }, config.start);
    }
}

/**
 * Limpiar animación y elementos
 */
function cleanupAnimation() {
    setTimeout(() => {
        if (preloader && preloader.parentNode) {
            preloader.parentNode.removeChild(preloader);
            console.log('🧹 Preloader cleaned up');
        }
    }, 500);
}

/**
 * Animación de fallback sin GSAP
 */
function fallbackAnimation() {
    console.log('🔧 Using fallback animation...');

    const wrapper = document.querySelector('.loader-wrapper');
    const heroImages = document.querySelectorAll('.hero-img');
    const navbar = document.querySelector('.navbar5_component');
    const loaderNumber = document.querySelector('.loader5_number');

    if (!wrapper) return;

    // Simular contador
    let progress = isFirstVisit ? 0 : 75;
    const increment = (100 - progress) / (loaderDuration * 60);

    const animateCounter = () => {
        progress += increment;
        if (progress >= 100) {
            progress = 100;
            if (loaderNumber) loaderNumber.textContent = Math.round(progress);

            // Ocultar loader después de completar
            setTimeout(() => {
                // Revelar imágenes hero
                heroImages.forEach(img => {
                    img.style.clipPath = 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)';
                    img.style.opacity = '1';
                });

                // Ocultar wrapper
                wrapper.style.transition = 'opacity 0.8s ease';
                wrapper.style.opacity = '0';

                // Mostrar navbar
                if (navbar) {
                    navbar.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    navbar.style.opacity = '1';
                    navbar.style.transform = 'translateY(0)';
                }

                // Remover wrapper
                setTimeout(() => {
                    if (wrapper.parentNode) {
                        wrapper.parentNode.removeChild(wrapper);
                    }
                }, 800);
            }, 200);
            return;
        }

        if (loaderNumber) loaderNumber.textContent = Math.round(progress);
        requestAnimationFrame(animateCounter);
    };

    animateCounter();
}

// ===== SISTEMA DE LIMPIEZA Y FALLBACKS =====
(function () {
    'use strict';

    // Auto-hide del loader si se queda pegado
    window.addEventListener('load', () => {
        const timeouts = [5000, 10000, 15000]; // 5s, 10s, 15s

        timeouts.forEach((delay, index) => {
            const timeoutId = setTimeout(() => {
                // Verificar si el loader aún existe y está visible
                const wrapper = document.querySelector('.loader-wrapper');
                if (!wrapper) {
                    return; // Ya fue removido
                }

                const isVisible = window.getComputedStyle(wrapper).display !== 'none';
                const hasOpacity = parseFloat(window.getComputedStyle(wrapper).opacity) > 0;

                if (isVisible && hasOpacity) {
                    console.warn(`🚨 Loader timeout ${index + 1} - forcing cleanup after ${delay}ms`);

                    // Usar la función global de limpieza
                    if (typeof window.forceCleanLoader === 'function') {
                        window.forceCleanLoader();
                    } else {
                        // Fallback directo
                        const heroImages = document.querySelectorAll('.hero-img');
                        const navbar = document.querySelector('.navbar5_component');

                        heroImages.forEach(img => {
                            img.style.clipPath = 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)';
                            img.style.opacity = '1';
                            img.style.transform = 'scale(1)';
                        });

                        if (navbar) {
                            navbar.style.opacity = '1';
                            navbar.style.transform = 'translateY(0)';
                        }

                        wrapper.style.display = 'none';
                        setTimeout(() => {
                            if (wrapper && wrapper.parentNode) {
                                wrapper.parentNode.removeChild(wrapper);
                            }
                        }, 100);
                    }
                }
            }, delay);

            // Guardar timeout ID para limpieza posterior
            if (window.loaderTimeouts) {
                window.loaderTimeouts.push(timeoutId);
            }
        });
    });
})();

// ===== LENIS SMOOTH SCROLL INTEGRATION =====
(function () {
    'use strict';

    setTimeout(function () {
        if (typeof Lenis === 'undefined') {
            console.log('⚠️ External Lenis script failed to load, using fallback...');
            document.documentElement.style.scrollBehavior = 'smooth';
            return;
        }

        try {
            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                console.log("🌊 Lenis Smooth Scroll & GSAP Animations Loaded");

                gsap.registerPlugin(ScrollTrigger, TextPlugin);

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

                // Lenis + ScrollTrigger integration
                lenis.on('scroll', ScrollTrigger.update);
                gsap.ticker.add((time) => {
                    lenis.raf(time * 1000);
                });
                gsap.ticker.lagSmoothing(0);

                console.log("🚀 Lenis smooth scroll initialized successfully!");
            }
        } catch (error) {
            console.log('Error initializing Lenis:', error);
            document.documentElement.style.scrollBehavior = 'smooth';
        }
    }, 2000);
})();

// ===== ERROR HANDLING =====
window.addEventListener('error', function (e) {
    if (e.message && e.message.includes('CORS')) {
        console.log('🔒 CORS error suppressed:', e.filename);
        e.preventDefault();
        return false;
    }
});

window.addEventListener('unhandledrejection', function (e) {
    if (e.reason && e.reason.toString().includes('CORS')) {
        console.log('🔒 CORS promise rejection suppressed');
        e.preventDefault();
        return false;
    }
});

// ===== DEBUGGING UTILITIES =====
window.debugAcuaticaAnimation = {
    timeline: () => masterTimeline,
    restart: () => masterTimeline && masterTimeline.restart(),
    pause: () => masterTimeline && masterTimeline.pause(),
    play: () => masterTimeline && masterTimeline.play(),
    seek: (time) => masterTimeline && masterTimeline.seek(time),
    getProgress: () => masterTimeline ? masterTimeline.progress() : 0,
    getDuration: () => masterTimeline ? masterTimeline.duration() : 0,

    // Test específicos
    testPreloader: () => {
        if (masterTimeline) {
            masterTimeline.pause();
            masterTimeline.seek(0);
            masterTimeline.play();
        }
    },

    testReveal: () => {
        if (masterTimeline) {
            masterTimeline.pause();
            masterTimeline.seek(animationConfig.reveal.start);
            masterTimeline.play();
        }
    },

    // Función de emergencia para limpiar todo
    emergencyClean: () => {
        console.log('🚨 EMERGENCY CLEANUP INITIATED');

        // Limpiar timeouts
        if (window.loaderTimeouts) {
            window.loaderTimeouts.forEach(timeout => clearTimeout(timeout));
            window.loaderTimeouts = [];
        }

        // Detener timeline
        if (window.masterTimeline) {
            window.masterTimeline.kill();
            window.masterTimeline = null;
        }

        // Forzar limpieza visual
        if (typeof window.forceCleanLoader === 'function') {
            window.forceCleanLoader();
        }

        // Limpiar código residual
        cleanResidualCode();

        // Reset flags
        window.loaderInitialized = false;
        window.loaderCompleted = true;
        window.loaderStarted = false;

        console.log('✅ EMERGENCY CLEANUP COMPLETED');
    }
};

/**
 * COREOGRAFÍA COMPLETA DE LA ANIMACIÓN ACUATICA:
 * 
 * FASE 1: PRELOADER (0-8 segundos primera visita, 0-2 segundos recurrente)
 * - 0.5s: Inicia contador y barra de progreso
 * - 0.5-2.5s: Barra crece 0% → 30%
 * - 2.5-7.0s: Barra crece 30% → 100%
 * - 7.2s: Barra se desvanece
 * - 7.5s: Componente del loader se oculta
 * - 8.0s: Preloader se desliza hacia arriba con clip-path
 * 
 * FASE 2: REVELADO HERO (9-14 segundos)
 * - 9.0s: Inicia secuencia de imágenes hero
 * - 9.0-13.5s: Cada imagen se revela con clip-path, zoom dramático, display, y salida
 * - 13.5s: La última imagen (z-index-7) permanece visible
 * 
 * FASE 3: NAVEGACIÓN (14 segundos)
 * - 14.0s: Navbar entra desde arriba con fade-in
 * 
 * TOTAL: ~14 segundos de animación completa con efectos de capas superpuestas
 * 
 * ESTRUCTURA DE CAPAS:
 * 1. loader-wrapper (z-index: 100) - Preloader superior
 * 2. loader_imgs (z-index: 98) - Contenedor de imágenes hero
 * 3. hero-img.z-index-1 a 7 (z-index: 1-7) - Imágenes superpuestas
 * 4. navbar5_component - Navegación final
 */