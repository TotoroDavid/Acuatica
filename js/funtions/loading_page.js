/**
 * Acuatica Landing Page Reveal Animation con GSAP
 * Animación de preloader con contador y revelado secuencial de 7 imágenes hero
 * Basado en arquitectura de capas superpuestas con clip-path
 */

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
            displayTime: 1.0, // Tiempo que cada imagen permanece visible
            transitionTime: 0.5, // Tiempo de transición entre imágenes
            start: 9,
            effects: {
                zoomIn: 1.08, // Zoom de entrada
                zoomHover: 1.03, // Zoom durante display
                zoomOut: 1.12 // Zoom de salida
            }
        },
        navigation: {
            duration: 0.8,
            start: 16, // Después de que terminen todas las imágenes
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

    // Control de ejecución única
    if (window.acuaticaLoaderInitialized) {
        console.log('⚠️ Acuatica loader already initialized, skipping...');
        return;
    }

    window.acuaticaLoaderInitialized = true;
    console.log('🚀 Initializing Acuatica loader...');

    // Verificar si es primera visita
    try {
        if (sessionStorage.getItem("acuatica_visited") !== null) {
            isFirstVisit = false;
            loaderDuration = 2;
            // Ajustar configuración para visitantes recurrentes
            animationConfig.preloader.duration = 2;
            animationConfig.preloader.counter.totalDuration = 1.5;
            animationConfig.preloader.progressBar.phase1.duration = 0.5;
            animationConfig.preloader.progressBar.phase2.duration = 0.8;
            animationConfig.preloader.exit.start = 2;
            animationConfig.reveal.start = 3;
            animationConfig.reveal.navigation.start = 8;
        }
        sessionStorage.setItem("acuatica_visited", "true");
    } catch (e) {
        console.warn('SessionStorage not available:', e);
    }

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

        console.log(`🎬 Acuatica animation initialized (${isFirstVisit ? 'first visit' : 'returning visitor'})`);
        console.log(`📸 Found ${heroImages.length} hero images for reveal sequence`);

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

    if (heroImages.length === 0) {
        console.warn('⚠️ No hero images found! Expected 7 images with classes .hero-img.z-index-1 through .hero-img.z-index-7');
    }

    // Log de elementos encontrados para debugging
    console.log('🔍 DOM Elements found:');
    console.log('- Preloader:', !!preloader);
    console.log('- Progress bar:', !!progressBar);
    console.log('- Hero images:', heroImages.length);
    console.log('- Navbar:', !!navbar);
    console.log('- Loader number:', !!loaderNumber);

    // Log específico de imágenes hero
    heroImages.forEach((img, index) => {
        const zIndexClass = Array.from(img.classList).find(cls => cls.startsWith('z-index-'));
        console.log(`  Hero image ${index + 1}: ${zIndexClass || 'no z-index class'}`);
    });
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
            
            /* Z-index específicos para capas - CRÍTICO para la secuencia */
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

    // Preparar imágenes hero - TODAS inicialmente ocultas con clip-path
    if (heroImages.length > 0) {
        gsap.set(heroImages, {
            clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
            scale: animationConfig.reveal.images.effects.zoomIn,
            opacity: 1,
            transformOrigin: 'center center'
        });

        console.log(`🎯 Prepared ${heroImages.length} hero images with initial clip-path (hidden)`);
    }

    // Preparar navbar - inicialmente oculta
    if (navbar) {
        gsap.set(navbar, {
            y: -100,
            opacity: 0
        });
    }

    console.log('✅ All elements prepared for animation');
}

/**
 * Crear timeline principal con todas las animaciones
 */
function createMasterTimeline() {
    // Crear timeline principal
    masterTimeline = gsap.timeline({
        onComplete: () => {
            console.log('✨ Master animation sequence completed');
            cleanupAnimation();
        }
    });

    // Guardar referencia global para debugging
    window.acuaticaMasterTimeline = masterTimeline;

    // Fase 1: Animaciones del preloader
    animatePreloader();

    // Fase 2: Ocultar preloader
    hidePreloader();

    // Fase 3: Revelar contenido hero (LO MÁS IMPORTANTE)
    revealHeroContent();

    // Fase 4: Animar navegación
    animateNavigation();

    console.log(`⏱️ Total timeline duration: ${masterTimeline.duration().toFixed(2)}s`);
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
 * FUNCIÓN CLAVE: Revelar contenido hero con animación de imágenes secuencial
 */
function revealHeroContent() {
    const config = animationConfig.reveal;

    if (heroImages.length === 0) {
        console.error('❌ No hero images found for reveal animation!');
        return;
    }

    console.log(`🎬 Starting hero reveal sequence with ${heroImages.length} images at ${config.images.start}s`);

    // Configurar timing para secuencia de imágenes
    const imageDisplayTime = config.images.displayTime;
    const transitionTime = config.images.transitionTime;
    let currentTime = config.images.start;

    // Ordenar imágenes por z-index para secuencia correcta
    const sortedImages = Array.from(heroImages).sort((a, b) => {
        const aIndex = parseInt(a.className.match(/z-index-(\d+)/)?.[1] || '0');
        const bIndex = parseInt(b.className.match(/z-index-(\d+)/)?.[1] || '0');
        return aIndex - bIndex;
    });

    console.log('📋 Image sequence order:');
    sortedImages.forEach((img, index) => {
        const zIndexClass = img.className.match(/z-index-(\d+)/)?.[1] || 'unknown';
        console.log(`  ${index + 1}. z-index-${zIndexClass}`);
    });

    // Animar cada imagen secuencialmente
    sortedImages.forEach((img, index) => {
        const isLastImage = index === sortedImages.length - 1;
        const zIndexClass = img.className.match(/z-index-(\d+)/)?.[1] || index + 1;

        console.log(`🎭 Animating image ${index + 1} (z-index-${zIndexClass}) at ${currentTime}s`);

        // === ENTRADA DE LA IMAGEN ===

        // 1. Revelar con clip-path desde abajo
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

        // 4. Efecto de "respiración" sutil
        masterTimeline.to(img, {
            scale: config.images.effects.zoomHover,
            duration: 0.2,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: 1
        }, currentTime + transitionTime + 0.2);

        // === SALIDA DE LA IMAGEN (excepto la última) ===

        if (!isLastImage) {
            // 5. Zoom out antes de ocultar
            masterTimeline.to(img, {
                scale: config.images.effects.zoomOut,
                duration: 0.2,
                ease: 'power2.in'
            }, currentTime + imageDisplayTime - 0.2);

            // 6. Ocultar con clip-path hacia arriba
            masterTimeline.to(img, {
                clipPath: 'polygon(0 0%, 100% 0%, 100% 0%, 0 0%)',
                duration: transitionTime * 0.8,
                ease: 'power2.in'
            }, currentTime + imageDisplayTime - 0.1);
        } else {
            // === IMAGEN FINAL (permanece visible) ===

            console.log(`🏆 Final image (z-index-${zIndexClass}) will remain visible`);

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

        // Incrementar tiempo para la siguiente imagen con overlap suave
        currentTime += imageDisplayTime - (transitionTime * 0.2);
    });

    console.log(`✅ Hero reveal sequence configured, ending at ${currentTime.toFixed(2)}s`);
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

        console.log(`🧭 Navigation animation scheduled at ${config.start}s`);
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
                // Revelar TODAS las imágenes hero
                heroImages.forEach((img, index) => {
                    setTimeout(() => {
                        img.style.clipPath = 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)';
                        img.style.opacity = '1';
                        img.style.transform = 'scale(1)';
                        console.log(`📸 Fallback: Revealed hero image ${index + 1}`);
                    }, index * 200); // 200ms entre cada imagen
                });

                // Ocultar wrapper
                setTimeout(() => {
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
                }, heroImages.length * 200 + 500);
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
        const timeouts = [10000, 15000, 20000]; // 10s, 15s, 20s

        timeouts.forEach((delay, index) => {
            setTimeout(() => {
                const wrapper = document.querySelector('.loader-wrapper');
                if (wrapper) {
                    const isVisible = window.getComputedStyle(wrapper).display !== 'none';
                    const hasOpacity = parseFloat(window.getComputedStyle(wrapper).opacity) > 0;

                    if (isVisible && hasOpacity) {
                        console.warn(`🚨 Loader timeout ${index + 1} - forcing cleanup after ${delay}ms`);

                        // Forzar revelación de todas las imágenes
                        const heroImages = document.querySelectorAll('.hero-img');
                        const navbar = document.querySelector('.navbar5_component');

                        heroImages.forEach((img, imgIndex) => {
                            img.style.clipPath = 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)';
                            img.style.opacity = '1';
                            img.style.transform = 'scale(1)';
                            console.log(`🚨 Emergency: Revealed hero image ${imgIndex + 1}`);
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
        });
    });
})();

// ===== DEBUGGING UTILITIES =====
window.debugAcuaticaAnimation = {
    timeline: () => window.acuaticaMasterTimeline,
    restart: () => window.acuaticaMasterTimeline && window.acuaticaMasterTimeline.restart(),
    pause: () => window.acuaticaMasterTimeline && window.acuaticaMasterTimeline.pause(),
    play: () => window.acuaticaMasterTimeline && window.acuaticaMasterTimeline.play(),
    seek: (time) => window.acuaticaMasterTimeline && window.acuaticaMasterTimeline.seek(time),
    getProgress: () => window.acuaticaMasterTimeline ? window.acuaticaMasterTimeline.progress() : 0,
    getDuration: () => window.acuaticaMasterTimeline ? window.acuaticaMasterTimeline.duration() : 0,

    // Test específicos
    testPreloader: () => {
        if (window.acuaticaMasterTimeline) {
            window.acuaticaMasterTimeline.pause();
            window.acuaticaMasterTimeline.seek(0);
            window.acuaticaMasterTimeline.play();
        }
    },

    testReveal: () => {
        if (window.acuaticaMasterTimeline) {
            window.acuaticaMasterTimeline.pause();
            window.acuaticaMasterTimeline.seek(animationConfig.reveal.start);
            window.acuaticaMasterTimeline.play();
        }
    },

    // Función para revelar imágenes manualmente (debugging)
    revealAllImages: () => {
        const heroImages = document.querySelectorAll('.hero-img');
        console.log(`🔧 Manually revealing ${heroImages.length} hero images...`);

        heroImages.forEach((img, index) => {
            img.style.clipPath = 'polygon(0 0%, 100% 0%, 100% 100%, 0 100%)';
            img.style.opacity = '1';
            img.style.transform = 'scale(1)';
            console.log(`✅ Revealed hero image ${index + 1}`);
        });
    },

    // Información detallada
    getInfo: () => {
        const heroImages = document.querySelectorAll('.hero-img');
        return {
            totalDuration: window.acuaticaMasterTimeline ? window.acuaticaMasterTimeline.duration() : 0,
            currentTime: window.acuaticaMasterTimeline ? window.acuaticaMasterTimeline.time() : 0,
            progress: window.acuaticaMasterTimeline ? window.acuaticaMasterTimeline.progress() : 0,
            heroImagesFound: heroImages.length,
            revealStart: animationConfig.reveal.start,
            navigationStart: animationConfig.reveal.navigation.start,
            isFirstVisit: isFirstVisit
        };
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
 * FASE 2: REVELADO HERO (9-16 segundos) - ¡LA PARTE CLAVE!
 * - 9.0s: Inicia secuencia de 7 imágenes hero
 * - Cada imagen se revela con clip-path desde abajo
 * - Efectos de zoom dramático (entrada, display, salida)
 * - Solo la última imagen (z-index-7) permanece visible
 * - Secuencia: z-index-1 → z-index-2 → ... → z-index-7
 * 
 * FASE 3: NAVEGACIÓN (16 segundos)
 * - 16.0s: Navbar entra desde arriba con fade-in
 * 
 * TOTAL: ~16 segundos de animación completa
 * 
 * ESTRUCTURA DE CAPAS:
 * 1. loader-wrapper (z-index: 100) - Preloader superior
 * 2. loader_imgs (z-index: 98) - Contenedor de imágenes hero
 * 3. hero-img.z-index-1 a 7 (z-index: 1-7) - 7 imágenes superpuestas
 * 4. navbar5_component - Navegación final
 */