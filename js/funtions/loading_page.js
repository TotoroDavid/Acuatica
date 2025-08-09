/**
 * GSAP Landing Page Reveal Animation
 * Implementa un preloader interactivo seguido de revelado de contenido
 * Arquitectura: Preloader → Transición → Revelado de Contenido
 */

// Configuración de animación
const animationConfig = {
    preloader: {
        // ⏱️ CONTADOR: Tiempo que tarda en contar de 0 a 100
        counter: { duration: 2, ease: "power2.out" }, // ↑ Aumentar = contador más lento | ↓ Disminuir = contador más rápido

        // 📊 BARRA DE PROGRESO: Animación en 2 fases
        progressBar: {
            phase1: { width: "30%", duration: 1 },    // ↑ Aumentar duration = fase 1 más lenta
            phase2: { width: "100%", duration: 1.5 }  // ↑ Aumentar duration = fase 2 más lenta
        }
    },
    reveal: {
        // 🖼️ IMÁGENES HERO: Control principal de velocidad de aparición
        images: {
            stagger: 0.5,   // ⏰ TIEMPO ENTRE IMÁGENES: ↓ Reducido de 0.7 a 0.5 para más velocidad
            duration: 1.5   // ⏳ VELOCIDAD DE APARICIÓN: ↓ Reducido de 2.0 a 1.5 para más agilidad
        },

        // 🔍 ZOOM: Efecto de acercamiento en las imágenes
        zoom: {
            scale: 1,       // 📏 NIVEL DE ZOOM: 1 = sin zoom | 1.2 = zoom ligero | 1.5 = zoom fuerte
            duration: 3     // ⏳ VELOCIDAD DE ZOOM: ↑ Aumentar = zoom más lento y suave | ↓ Disminuir = zoom más rápido
        },

        // 🧭 NAVEGACIÓN: Aparición del menú/navegación
        navigation: {
            y: 0,           // 📍 POSICIÓN FINAL: 0 = posición normal | -50 = viene desde arriba | 50 = viene desde abajo
            duration: 1.2   // ⏳ VELOCIDAD: ↑ Aumentar = navegación aparece más lento | ↓ Disminuir = aparición más rápida
        },

        // 📝 TÍTULO: Animación letra por letra
        title: {
            stagger: 0.1,   // ⏰ TIEMPO ENTRE LETRAS: ↑ Aumentar = más pausa entre letras | ↓ Disminuir = letras más seguidas
            duration: 0.8   // ⏳ VELOCIDAD DE CADA LETRA: ↑ Aumentar = cada letra aparece más lento | ↓ Disminuir = más rápido
        },

        // 🚪 SALIDA HERO: Cuándo y cómo salen las imágenes hero
        heroExit: {
            duration: 0.8,  // ⏳ VELOCIDAD DE SALIDA: ↓ Reducido de 1 a 0.8 para salida más rápida
            delay: 0.3      // ⏰ PAUSA ANTES DE SALIR: ↓ Reducido de 1 a 0.3 para menos espera
        }
    }
};

// Variables globales para elementos DOM
let preloaderElements = {};
let contentElements = {};
let masterTimeline;

/**
 * Inyecta estilos críticos necesarios para que el loader y las imágenes hero
 * tengan el estado/altura correctos sin modificar archivos CSS/HTML.
 */
function injectCriticalStyles() {
    try {
        if (document.getElementById('acuatica-critical-styles')) return;
        const css = `
            .loader-wrapper{position:fixed;inset:0;z-index:100;display:block!important;visibility:visible!important;opacity:1!important;background:#000}
            .loader_imgs{position:relative;z-index:98;display:block;min-height:100vh;overflow:hidden}
            .hero-imgs{position:relative;width:100%;height:100vh}
            .hero-img{position:absolute;inset:0;width:100%;min-height:100vh;object-fit:cover;backface-visibility:hidden;transform-origin:center center}
        `;
        const styleTag = document.createElement('style');
        styleTag.id = 'acuatica-critical-styles';
        styleTag.textContent = css;
        document.head.appendChild(styleTag);
    } catch (_) { /* noop */ }
}

/**
 * Fuerza por JS el estado visible del loader al inicio (por si CSS lo oculta).
 */
function ensureInitialLoaderState() {
    const wrapper = document.querySelector('.loader-wrapper');
    if (!wrapper) return;
    if (typeof gsap !== 'undefined') {
        gsap.set(wrapper, { display: 'block', visibility: 'visible', opacity: 1 });
    } else {
        wrapper.style.display = 'block';
        wrapper.style.visibility = 'visible';
        wrapper.style.opacity = '1';
    }
}

/**
 * Asegura tamaños/posición mínimos de contenedores hero cuando el CSS aún no cargó.
 */
function ensureHeroContainers() {
    const loaderImgs = document.querySelector('.loader_imgs');
    if (loaderImgs) {
        loaderImgs.style.minHeight = '100vh';
        loaderImgs.style.overflow = 'hidden';
        loaderImgs.style.display = 'block';
        loaderImgs.style.position = loaderImgs.style.position || 'relative';
        loaderImgs.style.zIndex = loaderImgs.style.zIndex || '98';
    }

    const heroImgsContainer = document.querySelector('.hero-imgs');
    if (heroImgsContainer) {
        heroImgsContainer.style.height = '100vh';
        heroImgsContainer.style.width = '100%';
        heroImgsContainer.style.position = heroImgsContainer.style.position || 'relative';
    }

    const heroImgs = document.querySelectorAll('.hero-img');
    heroImgs.forEach((img) => {
        img.style.position = 'absolute';
        img.style.inset = '0';
        img.style.width = '100%';
        img.style.minHeight = '100vh';
        img.style.objectFit = 'cover';
        img.style.backfaceVisibility = 'hidden';
        img.style.transformOrigin = 'center center';
    });
}

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function () {
    // Asegurar estado inicial correcto aún si GSAP no está listo
    injectCriticalStyles();
    ensureInitialLoaderState();
    ensureHeroContainers();

    // Verificar que GSAP esté cargado
    if (typeof gsap === 'undefined') {
        console.error('GSAP no está cargado. Asegúrate de incluir el CDN de GSAP.');
        return;
    }

    // Inicializar elementos DOM
    initializeDOMElements();

    // Preparar texto del título para animación de letras
    prepareTextAnimation();

    // Configurar estados iniciales
    setInitialStates();

    // Crear y ejecutar timeline principal
    createMasterTimeline();
});

/**
 * Inicializa referencias a elementos DOM
 */
function initializeDOMElements() {
    // Elementos del preloader
    preloaderElements = {
        wrapper: document.querySelector('.loader-wrapper'), // Contenedor principal del loader
        container: document.querySelector('.loader5_component'),
        digits: document.querySelectorAll('.loader5_number'),
        progressBar: document.querySelector('.loader5_progress-bar'),
        progressContainer: document.querySelector('.loader5_progress')
    };

    // Elementos del contenido principal
    contentElements = {
        heroImages: document.querySelectorAll('.hero-img'),
        heroContainer: document.querySelector('.hero-imgs'),
        loaderImagesWrapper: document.querySelector('.loader_imgs'),
        navigation: document.querySelector('.navbar5_component'),
        titleContainer: document.querySelector('.header103_content-wrapper h2'),
        mainWrapper: document.querySelector('.main-wrapper')
    };

    console.log('Elementos DOM inicializados:', { preloaderElements, contentElements });
}

/**
 * Prepara el texto del título para animación letra por letra
 */
function prepareTextAnimation() {
    const titleElement = contentElements.titleContainer;
    if (!titleElement) return;

    const text = titleElement.textContent;
    titleElement.innerHTML = '';

    // Crear span para cada letra
    text.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char; // Preservar espacios
        span.style.display = 'inline-block';
        titleElement.appendChild(span);
    });

    // Actualizar referencia a los spans creados
    contentElements.titleSpans = titleElement.querySelectorAll('span');
}

/**
 * Configura estados iniciales para todas las animaciones
 */
function setInitialStates() {
    // Estados iniciales del preloader
    if (preloaderElements.progressBar) {
        gsap.set(preloaderElements.progressBar, { width: "0%" });
    }

    // Estados iniciales de las imágenes hero
    if (contentElements.heroImages.length > 0) {
        gsap.set(contentElements.heroImages, {
            clipPath: "polygon(0 0, 100% 0, 100% 0%, 0 0%)" // 🔧 CONTROL DE REVELADO: 0% = oculta completamente | 100% = visible completa
        });
    }

    // Estado inicial del contenedor hero
    if (contentElements.heroContainer) {
        gsap.set(contentElements.heroContainer, { scale: 1 });
    }



    // Estado inicial de la navegación
    if (contentElements.navigation) {
        gsap.set(contentElements.navigation, { y: -150 });
    }

    // Estados iniciales de las letras del título
    if (contentElements.titleSpans && contentElements.titleSpans.length > 0) {
        gsap.set(contentElements.titleSpans, {
            y: -100,
            opacity: 0
        });
    }

    console.log('Estados iniciales configurados');
}

/**
 * Crea el timeline principal que coordina todas las animaciones
 */
function createMasterTimeline() {
    masterTimeline = gsap.timeline({
        onComplete: () => {
            console.log('Animación completa');
            // Cleanup opcional
            cleanupAnimation();
            enableScroll(); // Habilitar scroll después de la animación
        }
    });

    // Fase 1: Animaciones del preloader
    addPreloaderAnimations();

    // Fase 2: Transición de salida del preloader
    addPreloaderTransition();

    // Fase 3: Revelado del contenido
    addContentRevealAnimations();

    console.log('Timeline principal creado y ejecutándose');
}

/**
 * Añade animaciones del preloader al timeline
 */
function addPreloaderAnimations() {
    // Animación del contador (simulando odómetro)
    const counterAnimation = createCounterAnimation();
    if (counterAnimation) {
        masterTimeline.add(counterAnimation, 0);
    }

    // Animación de la barra de progreso en dos fases
    if (preloaderElements.progressBar) {
        // Fase 1: 0% → 30%
        masterTimeline.to(preloaderElements.progressBar, {
            width: animationConfig.preloader.progressBar.phase1.width,
            duration: animationConfig.preloader.progressBar.phase1.duration,
            ease: "power2.out"
        }, 0.5);

        // Fase 2: 30% → 100%
        masterTimeline.to(preloaderElements.progressBar, {
            width: animationConfig.preloader.progressBar.phase2.width,
            duration: animationConfig.preloader.progressBar.phase2.duration,
            ease: "power2.out"
        }, 1.5);

        // Desvanecimiento de la barra
        masterTimeline.to(preloaderElements.progressBar, {
            autoAlpha: 0,
            duration: 0.3
        }, 3.5);
    }
}

/**
 * Crea la animación del contador numérico
 */
function createCounterAnimation() {
    if (!preloaderElements.digits.length) return null;

    const counter = { value: 0 };

    return gsap.to(counter, {
        value: 100,
        duration: animationConfig.preloader.counter.duration,
        ease: animationConfig.preloader.counter.ease,
        onUpdate: function () {
            const progress = Math.round(counter.value);
            preloaderElements.digits.forEach(digit => {
                if (digit) digit.textContent = progress;
            });
        }
    });
}

/**
 * Añade la transición de salida del preloader
 */
function addPreloaderTransition() {
    if (preloaderElements.container) {
        masterTimeline.to(preloaderElements.container, {
            yPercent: -100,
            duration: 1,
            ease: "power2.inOut"
        }, 4); // Inicia a los 4 segundos
    }
}

/**
 * Añade las animaciones de revelado del contenido
 */
function addContentRevealAnimations() {
    const revealStart = 4.5; // Inicia 0.5s después de que comience la salida del preloader

    // Revelado de imágenes con efecto stagger
    if (contentElements.heroImages.length > 0) {
        masterTimeline.to(contentElements.heroImages, {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            duration: animationConfig.reveal.images.duration,
            stagger: animationConfig.reveal.images.stagger,
            ease: "power1.out" // Cambio a ease más suave
        }, revealStart);
    }

    // Efecto de zoom dramático
    if (contentElements.heroContainer) {
        masterTimeline.to(contentElements.heroContainer, {
            scale: animationConfig.reveal.zoom.scale,
            duration: animationConfig.reveal.zoom.duration,
            ease: "power1.out"
        }, revealStart + 0.5);
    }

    // Animación de la navegación
    if (contentElements.navigation) {
        masterTimeline.to(contentElements.navigation, {
            y: animationConfig.reveal.navigation.y,
            duration: animationConfig.reveal.navigation.duration,
            ease: "power2.out"
        }, revealStart + 1);
    }

    // Animación del título letra por letra
    if (contentElements.titleSpans && contentElements.titleSpans.length > 0) {
        masterTimeline.to(contentElements.titleSpans, {
            y: 0,
            opacity: 1,
            duration: animationConfig.reveal.title.duration,
            stagger: animationConfig.reveal.title.stagger,
            ease: "back.out(1.7)"
        }, revealStart + 1.2);
    }

    // Calcular cuándo termina la secuencia de imágenes
    const imagesCount = contentElements.heroImages.length;
    const lastImageStart = revealStart + (imagesCount - 1) * animationConfig.reveal.images.stagger;
    const lastImageEnd = lastImageStart + animationConfig.reveal.images.duration;
    const heroExitStart = lastImageEnd + animationConfig.reveal.heroExit.delay;

    // Salida de las imágenes hero hacia arriba
    if (contentElements.loaderImagesWrapper) {
        masterTimeline.to(contentElements.loaderImagesWrapper, {
            yPercent: -100,
            duration: animationConfig.reveal.heroExit.duration,
            ease: "power2.inOut"
        }, heroExitStart);
    }

    // Ocultar completamente el loader-wrapper después de que salgan las imágenes hero
    if (preloaderElements.wrapper) {
        masterTimeline.to(preloaderElements.wrapper, {
            autoAlpha: 0, // opacity: 0 + visibility: hidden
            duration: 0.1,
            onComplete: function () {
                // Forzar ocultación completa con display none
                preloaderElements.wrapper.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important;';
            }
        }, heroExitStart + animationConfig.reveal.heroExit.duration);
    }
}

/**
 * Limpieza opcional después de completar la animación
 */
function cleanupAnimation() {
    // Remover will-change para optimizar rendimiento
    const animatedElements = [
        ...contentElements.heroImages,
        contentElements.heroContainer,
        contentElements.navigation,
        ...(contentElements.titleSpans || [])
    ].filter(Boolean);

    animatedElements.forEach(element => {
        if (element && element.style) {
            element.style.willChange = 'auto';
        }
    });
}

/**
 * Desbloquea el scroll después de la animación
 */
function enableScroll() {
    // Remover todos los event listeners
    window.removeEventListener('scroll', preventDefault);
    window.removeEventListener('wheel', preventDefault);
    window.removeEventListener('touchmove', preventDefault);

    // Restaurar estilos CSS
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.width = '';

    // 🎯 FORZAR POSICIÓN AL INICIO: Siempre volver al top después de la animación
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // Sin animación suave para que sea inmediato
    });

    console.log('✅ Scroll habilitado - posición restaurada al inicio');
}

/**
 * Función de utilidad para debugging del timeline
 */
function debugTimeline() {
    if (masterTimeline) {
        console.log('Timeline duration:', masterTimeline.duration());
        console.log('Timeline progress:', masterTimeline.progress());
        console.log('Timeline time:', masterTimeline.time());
    }
}

// Exponer funciones para debugging en desarrollo
if (typeof window !== 'undefined') {
    window.debugTimeline = debugTimeline;
    window.masterTimeline = masterTimeline;
}