// Acuatica website custom JavaScript
console.log("Acuatica website loaded successfully");

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM is ready");

    // Add any custom functionality here
    // For example, smooth scrolling, form handling, etc.

    // Example: Smooth scrolling for anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
