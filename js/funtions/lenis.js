// ===== ACUATICA SMOOTH SCROLL & ANIMATIONS =====
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

// ===== GSAP SCROLL ANIMATIONS =====
function initScrollAnimations() {
    // Fade in animation for sections (excluding header to avoid conflicts)
    gsap.utils.toArray('section:not(.section_header)').forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // Animate service cards
    gsap.utils.toArray('.servicios_soluciones_item').forEach((card, index) => {
        gsap.from(card, {
            opacity: 0,
            y: 60,
            scale: 0.9,
            duration: 0.8,
            ease: "back.out(1.7)",
            delay: index * 0.1,
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // Animate headings with word-by-word effect
    gsap.utils.toArray('h2, h3').forEach(heading => {
        const text = heading.textContent;
        const words = text.split(' ');
        heading.innerHTML = words.map(word => `<span class="word-animate">${word}</span>`).join(' ');

        gsap.from(heading.querySelectorAll('.word-animate'), {
            opacity: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: heading,
                start: "top 90%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // Animate buttons
    gsap.utils.toArray('.button').forEach(button => {
        gsap.from(button, {
            opacity: 0,
            scale: 0.8,
            duration: 0.6,
            ease: "back.out(1.7)",
            scrollTrigger: {
                trigger: button,
                start: "top 90%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // Parallax effect for images (excluding header images)
    gsap.utils.toArray('img:not(.tab-image)').forEach(image => {
        gsap.to(image, {
            yPercent: -15,
            ease: "none",
            scrollTrigger: {
                trigger: image,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        });
    });

    // Animate testimonial cards
    gsap.utils.toArray('.testimonios_item').forEach((testimonial, index) => {
        gsap.from(testimonial, {
            opacity: 0,
            x: index % 2 === 0 ? -50 : 50,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: testimonial,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // Animate FAQ items
    gsap.utils.toArray('.faq_item').forEach((faq, index) => {
        gsap.from(faq, {
            opacity: 0,
            y: 30,
            duration: 0.6,
            delay: index * 0.1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: faq,
                start: "top 90%",
                toggleActions: "play none none reverse"
            }
        });
    });
}

// ===== MAGNETIC BUTTON EFFECTS =====
function addMagneticEffect() {
    const buttons = document.querySelectorAll('.button');

    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            gsap.to(button, {
                scale: 1.05,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        button.addEventListener('mouseleave', () => {
            gsap.to(button, {
                scale: 1,
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
        });

        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(button, {
                x: x * 0.1,
                y: y * 0.1,
                duration: 0.3,
                ease: "power2.out"
            });
        });
    });
}

// ===== NAVBAR ANIMATION =====
function initNavbarAnimation() {
    gsap.from('.navbar5_component', {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.5
    });
}

// ===== LENIS + SCROLLTRIGGER INTEGRATION =====
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// ===== INITIALIZE ALL ANIMATIONS =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all scroll animations
    initScrollAnimations();

    // Initialize magnetic button effects
    addMagneticEffect();

    // Initialize navbar animation
    initNavbarAnimation();

    console.log("🚀 All Acuatica scroll animations initialized!");
});
