// Safer, guarded main script
document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Hamburger Menu Toggle (guarded)
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if (hamburger && navMenu) {
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            const expanded = hamburger.classList.contains('active');
            hamburger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        });
        hamburger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                hamburger.click();
            }
        });
    }

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) navMenu.classList.remove('active');
            if (hamburger) {
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Dropdown toggle for navbar (mobile/touch)
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const parent = toggle.closest('.nav-dropdown');
            if (!parent) return;
            parent.classList.toggle('open');
            const expanded = parent.classList.contains('open');
            toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        });
    });

    // Close any open dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-dropdown.open').forEach(openDrop => {
            if (!openDrop.contains(e.target)) {
                openDrop.classList.remove('open');
                const btn = openDrop.querySelector('.dropdown-toggle');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Navbar scroll effect (guarded)
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (!navbar) return;
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Active nav link on scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
        if (!sections || !sections.length) return;
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Counter animation for stats
    function animateCounter(element, target) {
        if (!element || !target) return;
        let count = 0;
        const increment = target / 100;
        const duration = 2000;
        const stepTime = duration / 100;

        const counter = setInterval(() => {
            count += increment;
            if (count >= target) {
                element.textContent = target + '+';
                clearInterval(counter);
            } else {
                element.textContent = Math.floor(count) + '+';
            }
        }, stepTime);
    }

    // Intersection Observer for animations
    const observerOptions = { threshold: 0.3, rootMargin: '0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('about')) {
                    const statNumbers = entry.target.querySelectorAll('.stat-number');
                    statNumbers.forEach(stat => {
                        const target = parseInt(stat.getAttribute('data-target'));
                        animateCounter(stat, target);
                    });
                }

                if (entry.target.classList.contains('skills')) {
                    const skillBars = entry.target.querySelectorAll('.skill-progress');
                    skillBars.forEach(bar => {
                        const progress = bar.getAttribute('data-progress');
                        setTimeout(() => { bar.style.width = progress + '%'; }, 100);
                    });
                }

                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    if (sections && sections.length) {
        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });
    }

    const revealItems = document.querySelectorAll('.portfolio-item, .showcase-item, .achievement-item, .tool-item');
    if (revealItems && revealItems.length) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        let delay = 0;
        revealItems.forEach(item => {
            item.classList.add('reveal');
            item.style.setProperty('--delay', `${delay}s`);
            delay = Math.min(delay + 0.06, 0.36);
            revealObserver.observe(item);
        });
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            revealItems.forEach(item => { item.classList.add('show'); item.style.transition = 'none'; });
        }
    }

    // Form submission (guarded) — show a nice modal instead of alert
    const contactForm = document.getElementById('contactForm');
    const successModal = document.getElementById('successModal');
    const modalClose = document.getElementById('modalClose');
    const modalOk = document.getElementById('modalOk');
    const modalOverlay = document.getElementById('modalOverlay');

    function openModal() {
        if (!successModal) return;
        // Position the modal under the message textarea if possible
        let positioned = false;
        try {
            const textarea = contactForm ? contactForm.querySelector('textarea') : null;
            if (textarea) {
                const rect = textarea.getBoundingClientRect();
                // small offset below the textarea
                const top = Math.min(window.innerHeight - 12, rect.bottom + 8);
                let left = rect.left;
                // ensure it doesn't overflow right edge
                const modalWidth = 320; // used for calculation
                if (left + modalWidth > window.innerWidth - 12) left = Math.max(12, window.innerWidth - modalWidth - 12);
                successModal.classList.add('open');
                successModal.setAttribute('aria-hidden', 'false');
                // position the content element
                const content = successModal.querySelector('.modal-content');
                if (content) {
                    content.style.left = `${left}px`;
                    content.style.top = `${top}px`;
                    content.style.width = `${modalWidth}px`;
                }
                positioned = true;
            }
        } catch (err) {
            console.warn('Modal positioning failed:', err);
        }

        if (!positioned) {
            // fallback: center small modal
            successModal.classList.add('open');
            successModal.setAttribute('aria-hidden', 'false');
            const content = successModal.querySelector('.modal-content');
            if (content) {
                content.style.left = '50%';
                content.style.top = '20%';
                content.style.transform = 'translateX(-50%)';
            }
        }

        // focus the close/ok button for accessibility
        setTimeout(() => { if (modalOk) modalOk.focus(); }, 100);
        // auto close after 4 seconds
        window.setTimeout(() => { closeModal(); }, 4000);
    }

    function closeModal() {
        if (!successModal) return;
        successModal.classList.remove('open');
        successModal.setAttribute('aria-hidden', 'true');
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Here you would normally send the form via fetch/XHR
            contactForm.reset();
            openModal();
        });
    }

    // Modal interactions (guarded)
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOk) modalOk.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    // Portfolio item hover effect
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    if (portfolioItems && portfolioItems.length) {
        portfolioItems.forEach(item => {
            item.addEventListener('mouseenter', () => { item.style.transform = 'translateY(-10px) scale(1.02)'; });
            item.addEventListener('mouseleave', () => { item.style.transform = 'translateY(0) scale(1)'; });
        });
    }

    // Smooth scroll with offset for fixed navbar
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
    });

    // Typing effect
    function typeWriter(element, text, speed = 100) {
        if (!element || !text) return;
        let i = 0; element.textContent = '';
        function type() { if (i < text.length) { element.textContent += text.charAt(i); i++; setTimeout(type, speed); } }
        type();
    }

    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && !reduceMotion) {
        const originalText = heroTitle.textContent || heroTitle.getAttribute('data-text');
        typeWriter(heroTitle, originalText, 80);
    }

    // Glitch hover (guarded)
    const glitchTitle = document.querySelector('.hero-title');
    if (glitchTitle && !reduceMotion) {
        glitchTitle.addEventListener('mouseenter', () => { glitchTitle.style.animation = 'glitch 0.3s ease'; });
        glitchTitle.addEventListener('animationend', () => { glitchTitle.style.animation = 'glow 2s ease-in-out infinite alternate'; });
    }

    // Add glitch keyframes style
    const glitchStyle = document.createElement('style');
    glitchStyle.textContent = `@keyframes glitch { 0%{transform:translate(0);}20%{transform:translate(-2px,2px);}40%{transform:translate(-2px,-2px);}60%{transform:translate(2px,2px);}80%{transform:translate(2px,-2px);}100%{transform:translate(0);} }`;
    document.head.appendChild(glitchStyle);

    // Parallax hero content on scroll
    if (!reduceMotion) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        });
    }

    const scrollProgress = document.getElementById('scrollProgress');
    function updateProgress() {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        const clientHeight = document.documentElement.clientHeight || window.innerHeight;
        const percent = Math.min(100, Math.max(0, (scrollTop / (scrollHeight - clientHeight)) * 100));
        if (scrollProgress) scrollProgress.style.width = percent + '%';
    }
    window.addEventListener('scroll', updateProgress);
    window.addEventListener('load', updateProgress);

    // Cursor trail removed per request (no mouse-follow animations)

    // Fade-in on load
    window.addEventListener('load', () => {
        if (!reduceMotion) {
            document.body.style.opacity = '0';
            setTimeout(() => { document.body.style.transition = 'opacity 0.5s ease'; document.body.style.opacity = '1'; }, 100);
        }
    });

    console.log('CyberSec Portfolio Loaded Successfully! 🔐');
});
    const themeToggle = document.getElementById('themeToggle');
    function applyTheme(theme) {
        const root = document.documentElement;
        if (theme === 'light') {
            root.classList.add('theme-light');
            if (themeToggle) themeToggle.textContent = '☀️';
            localStorage.setItem('theme', 'light');
        } else {
            root.classList.remove('theme-light');
            if (themeToggle) themeToggle.textContent = '🌙';
            localStorage.setItem('theme', 'dark');
        }
    }
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        applyTheme(prefersLight ? 'light' : 'dark');
    }
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = document.documentElement.classList.contains('theme-light');
            applyTheme(isLight ? 'dark' : 'light');
        });
    }

    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) backToTop.classList.add('show'); else backToTop.classList.remove('show');
        });
        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
