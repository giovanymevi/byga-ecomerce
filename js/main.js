document.addEventListener('DOMContentLoaded', () => {
    // Lógica para el menú desplegable en móviles
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Lógica para el menú desplegable en móviles
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', (e) => {
            // En pantallas móviles, prevenir el comportamiento del enlace y mostrar/ocultar el submenú
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const dropdownMenu = dropdownToggle.nextElementSibling;
                dropdownMenu.classList.toggle('active');
                dropdownToggle.querySelector('i').classList.toggle('rotated');
            }
        });
    }

    // Lógica para el slider de publicidad
    const slides = document.querySelector('.slides');
    if (slides) {
        // La animación se controla puramente por CSS
        // Este espacio se puede usar si se requiere control manual (pausa, etc.)
    }

    // Inicialización de Particles.js
    if (document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": "#ffffff"
                },
                "shape": {
                    "type": "circle",
                },
                "opacity": {
                    "value": 0.5,
                    "random": false,
                },
                "size": {
                    "value": 3,
                    "random": true,
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#ffffff",
                    "opacity": 0.4,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 6,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                }
            },
            "interactivity": {},
            "retina_detect": true
        });
    }
});