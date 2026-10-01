// ===== WEBSITE FUNCTIONALITY =====

document.addEventListener('DOMContentLoaded', function() {

    // ===== HERO SLIDER =====
    let slides = document.querySelectorAll('.slide');
    let dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    let currentSlide = 0;
    let autoSlideInterval = null;

    function showSlide(index) {
        if (slides.length === 0) return;
        // Hide all slides
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        // Show current slide
        slides[index].classList.add('active');
        dots[index].classList.add('active');
    }

    function nextSlide() {
        if (slides.length === 0) return;
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        if (slides.length === 0) return;
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    function startAutoSlide() {
        if (autoSlideInterval) clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    function initSlider() {
        slides = document.querySelectorAll('.slide');
        dots = document.querySelectorAll('.dot');
        currentSlide = 0;

        // Event listeners for slider controls
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
            });
        });

        startAutoSlide();
    }

    // Initial init
    initSlider();

    // Re-init when dynamic content loads
    document.addEventListener('contentLoaded', initSlider);

    // ===== MOBILE MENU =====
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');

    function setMobileMenuOpen(isOpen) {
        navMenu.classList.toggle('active', isOpen);
        mobileMenuBtn.classList.toggle('active', isOpen);
        mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
        mobileMenuBtn.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    }

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            setMobileMenuOpen(!navMenu.classList.contains('active'));
        });
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && mobileMenuBtn) setMobileMenuOpen(false);
        });
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && navMenu?.classList.contains('active')) {
            setMobileMenuOpen(false);
            mobileMenuBtn.focus();
        }
    });

    // ===== SMOOTH SCROLLING =====
    const navLinksSmooth = document.querySelectorAll('a[href^="#"]');
    navLinksSmooth.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== HEADER SCROLL EFFECT =====
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }

        lastScrollTop = scrollTop;
    });

    // ===== ANIMATION ON SCROLL =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // ===== STATS COUNTER ANIMATION =====
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                if (target.dataset.counterAnimated) return;
                target.dataset.counterAnimated = 'true';
                const finalValue = target.textContent;
                const isPercentage = finalValue.includes('%');
                const isPlus = finalValue.includes('+');
                const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));

                let currentValue = 0;
                const increment = numericValue / 50;

                const counter = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= numericValue) {
                        currentValue = numericValue;
                        clearInterval(counter);
                    }

                    let displayValue = Math.floor(currentValue);
                    if (isPlus) displayValue += '+';
                    if (isPercentage) displayValue += '%';
                    if (finalValue.includes('/')) displayValue = finalValue; // For 24/7

                    target.textContent = displayValue;
                }, 30);

                statsObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    function initializeAnimations() {
        document.querySelectorAll('.service-card, .feature-card, .portfolio-item, .contact-item').forEach(el => {
            if (el.dataset.scrollAnimationInitialized) return;
            el.dataset.scrollAnimationInitialized = 'true';
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });

        document.querySelectorAll('.stat-number').forEach(stat => {
            if (!stat.dataset.counterAnimated) statsObserver.observe(stat);
        });

        bindHoverEffects('.portfolio-item', 'translateY(-10px) scale(1.02)', 'translateY(0) scale(1)');
        bindHoverEffects('.service-card', 'translateY(-10px) scale(1.02)', 'translateY(0) scale(1)');
        bindHoverEffects('.feature-card', 'translateY(-5px)', 'translateY(0)');
    }

    function bindHoverEffects(selector, hoverTransform, restingTransform) {
        document.querySelectorAll(selector).forEach(el => {
            if (el.dataset.hoverEffectInitialized) return;
            el.dataset.hoverEffectInitialized = 'true';
            el.addEventListener('mouseenter', () => { el.style.transform = hoverTransform; });
            el.addEventListener('mouseleave', () => { el.style.transform = restingTransform; });
        });
    }

    initializeAnimations();
    document.addEventListener('contentLoaded', initializeAnimations);

    // ===== PORTFOLIO HOVER EFFECTS =====
    // ===== CONTACT FORM VALIDATION (if form exists) =====
    const contactForm = document.querySelector('form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Basic form validation
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#e74c3c';
                } else {
                    field.style.borderColor = '#2ecc71';
                }
            });

            if (isValid) {
                // Show success message
                alert('Thank you for your message! We will get back to you soon.');
                this.reset();
            }
        });
    }

    // ===== LAZY LOADING FOR IMAGES =====
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // ===== BACK TO TOP BUTTON =====
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--gradient-accent);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.visibility = 'visible';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    function animateHeroContent() {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroButtons = document.querySelector('.hero-buttons');

        if (heroTitle && !heroTitle.dataset.entranceAnimated) {
            heroTitle.dataset.entranceAnimated = 'true';
            heroTitle.style.animation = 'fadeInUp 1s ease-out';
        }
        if (heroSubtitle && !heroSubtitle.dataset.entranceAnimated) {
            heroSubtitle.dataset.entranceAnimated = 'true';
            heroSubtitle.style.animation = 'fadeInUp 1s ease-out 0.2s both';
        }
        if (heroButtons && !heroButtons.dataset.entranceAnimated) {
            heroButtons.dataset.entranceAnimated = 'true';
            heroButtons.style.animation = 'fadeInUp 1s ease-out 0.4s both';
        }
    }

    document.addEventListener('contentLoaded', animateHeroContent);

    // ===== LOADING ANIMATION =====
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        animateHeroContent();
    });

    // ===== PARALLAX EFFECT FOR HERO =====
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });

    console.log('EPH-B Website loaded successfully! 🏗️');
});
