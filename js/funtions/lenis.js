// ===== ACUATICA SMOOTH SCROLL & ANIMATIONS v2.0 =====
console.log("🌊 Lenis Smooth Scroll & GSAP Animations Loaded [v2.0]");

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// ===== LENIS SMOOTH SCROLL SETUP =====
const lenis = new Lenis({
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

// ===== GSAP + LENIS INTEGRATION =====
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ===== MAIN ANIMATION INITIALIZATION =====
function initAnimations() {

    // --- Navbar ---
    gsap.from('.navbar5_component', {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.5
    });

    // --- Magnetic Buttons ---
    // Esta animación es sutil y de bajo costo, puede quedar fuera de matchMedia si se desea
    document.querySelectorAll('.button').forEach(button => {
        const strength = 20; // Controla la fuerza del efecto magnético
        let magneto = gsap.quickTo(button, "x", { duration: 0.5, ease: "elastic.out(1, 0.3)" });
        let magnetoY = gsap.quickTo(button, "y", { duration: 0.5, ease: "elastic.out(1, 0.3)" });

        button.addEventListener('mousemove', e => {
            const { clientX, clientY } = e;
            const { height, width, left, top } = button.getBoundingClientRect();
            const x = clientX - left - width / 2;
            const y = clientY - top - height / 2;
            magneto(x * 0.15);
            magnetoY(y * 0.15);
        });

        button.addEventListener('mouseleave', () => {
            magneto(0);
            magnetoY(0);
        });
    });

    // --- SCROLL-BASED ANIMATIONS ---
    // MEJORA: Usamos matchMedia para accesibilidad y rendimiento
    ScrollTrigger.matchMedia({
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)": function () {

            // MEJORA: Animamos en lotes para un rendimiento óptimo
            // Asegúrate de poner opacity: 0 en Webflow a estos elementos
            ScrollTrigger.batch(".servicios_soluciones_item, .faq_item, .button:not(.is-nav)", {
                interval: 0.1,
                batchMax: 5,
                onEnter: batch => gsap.from(batch, {
                    opacity: 0,
                    y: 40,
                    stagger: 0.15,
                    ease: "power2.out",
                    duration: 0.8
                }),
                once: true
            });

            ScrollTrigger.batch(".testimonios_item", {
                onEnter: batch => gsap.from(batch, {
                    opacity: 0,
                    x: (i) => i % 2 === 0 ? -50 : 50, // Acceder al índice dentro de la función
                    stagger: 0.2,
                    ease: "power2.out",
                    duration: 1
                }),
                once: true
            });

            // Parallax para imágenes
            gsap.utils.toArray('img:not(.tab-image)').forEach(image => {
                gsap.to(image, {
                    yPercent: -15,
                    ease: "none",
                    scrollTrigger: {
                        trigger: image,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true // Usar 'true' es a menudo más suave que un número
                    }
                });
            });

            // Animaciones de texto más complejas
            gsap.utils.toArray('h2, h3').forEach(heading => {
                gsap.from(heading, {
                    opacity: 0,
                    y: 30,
                    ease: "power2.out",
                    duration: 1,
                    scrollTrigger: {
                        trigger: heading,
                        start: "top 90%",
                        toggleActions: "play none none reverse",
                    }
                });
            });

        }
    });
}


// ===== DOMContentLoaded -> INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    // MEJORA: Usamos gsap.context para una mejor gestión y limpieza
    let ctx = gsap.context(() => {
        initAnimations();
        console.log("🚀 All Acuatica scroll animations initialized!");
    });
});