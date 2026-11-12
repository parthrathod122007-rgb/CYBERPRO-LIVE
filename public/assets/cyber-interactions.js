/**
 * CYBERPRO - Ultra-Smooth High-Performance Interactive Engine
 * Hardware-Accelerated 60/120fps Smooth Scrolling, Zero Layout Thrashing,
 * Specular Green Sheen Flashlight Lighting & 3D Micro-Interactions.
 * STRICT: 100% Green Neon Palette (#39ff14, #00f5a0) Preserved.
 * FAIL-SAFE: 100% Base Visibility (zero blank elements, zero scrolling lag).
 */

(function() {
    'use strict';

    const isLowPowerDevice = (
        ('ontouchstart' in window) ||
        navigator.maxTouchPoints > 0 ||
        (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ||
        (navigator.deviceMemory && navigator.deviceMemory <= 4)
    );

    // 1. Universal Tactile Click Ripple on Interactive Elements
    function createCyberRipple(e) {
        const target = e.target.closest('button, a, .card-flagship, .card-muted, .course-card, .info-card, .feature-card, .topic-pill, .cyber-ccce-card, .nav-item');
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'cyber-click-ripple';

        const size = Math.max(rect.width, rect.height) * 1.5;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        if (!target.classList.contains('fixed') && !target.classList.contains('absolute') && !target.style.position) {
            target.style.position = 'relative';
        }

        const oldRipple = target.querySelector('.cyber-click-ripple');
        if (oldRipple) oldRipple.remove();

        target.appendChild(ripple);

        setTimeout(() => {
            if (ripple && ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
    document.addEventListener('pointerdown', createCyberRipple, { passive: true });

    // 2. Wire CCCE Rail Explorer Links
    function initCcceRail() {
        const railLinks = document.querySelectorAll('.ccce-rail-link');
        if (!railLinks.length) return;

        railLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-target') || this.getAttribute('href');
                if (!targetId || targetId === '#') return;

                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetEl.classList.add('border-parth-accent', 'shadow-[0_0_25px_rgba(57,255,20,0.4)]');
                    setTimeout(() => {
                        targetEl.classList.remove('shadow-[0_0_25px_rgba(57,255,20,0.4)]');
                    }, 2000);
                }

                railLinks.forEach(l => l.classList.remove('text-parth-accent', 'border-parth-accent'));
                this.classList.add('text-parth-accent', 'border-parth-accent');
            });
        });
    }

    // 3. Wire .ccce-open-register buttons to Admissions Modal
    function initCcceRegisterTriggers() {
        const triggers = document.querySelectorAll('.ccce-open-register');
        triggers.forEach(btn => {
            btn.addEventListener('click', function(e) {
                if (typeof window.openAdmissionsModal === 'function') {
                    window.openAdmissionsModal(e);
                    const courseSelect = document.getElementById('adm-course');
                    if (courseSelect) {
                        for (let i = 0; i < courseSelect.options.length; i++) {
                            if (courseSelect.options[i].text.toLowerCase().includes('ccce') || 
                                courseSelect.options[i].value.toLowerCase().includes('ccce')) {
                                courseSelect.selectedIndex = i;
                                break;
                            }
                        }
                    }
                }
            });
        });
    }

    // 4. Enhance Form Submissions with Cyber Loading Spinners
    function initFormCyberLoading() {
        const forms = document.querySelectorAll('form[action*="enquiry"], form[action*="contact"], #admissions-form');
        forms.forEach(form => {
            form.addEventListener('submit', function() {
                const submitBtn = this.querySelector('button[type="submit"]');
                if (!submitBtn) return;
                submitBtn.dataset.originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="inline-block animate-spin mr-2">⚙</span> Encrypting & Transmitting...';
                
                setTimeout(() => {
                    if (submitBtn.disabled) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = submitBtn.dataset.originalText || 'Transmitted';
                    }
                }, 3500);
            });
        });
    }

    // 5. Global Modal Keyboard Dismiss (ESC)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.fixed.z-50:not(.hidden), [id$="-modal"]:not(.hidden)');
            modals.forEach(m => {
                if (m.id === 'admissions-modal' && typeof window.closeAdmissionsModal === 'function') {
                    window.closeAdmissionsModal();
                } else if (m.id === 'email-inquiry-modal' && typeof window.closeEmailInquiryModal === 'function') {
                    window.closeEmailInquiryModal();
                } else if (m.id === 'community-modal' && typeof window.closeCommunityModal === 'function') {
                    window.closeCommunityModal();
                } else if (m.id === 'auth-modal' && typeof window.closeAuthModal === 'function') {
                    window.closeAuthModal();
                } else if (m.classList.contains('fixed')) {
                    m.classList.add('hidden');
                }
            });
        }
    });

    // 6. Advanced Cursor-Following Ambient Light Glow (Phase 2.3) - RAF Throttled
    function initCursorGlow() {
        if (isLowPowerDevice) return;

        let glow = document.getElementById('cyber-cursor-glow');
        if (!glow) {
            glow = document.createElement('div');
            glow.id = 'cyber-cursor-glow';
            glow.style.cssText = 'position:fixed;width:380px;height:380px;border-radius:50%;pointer-events:none;z-index:9999;' +
                                'background:radial-gradient(circle,rgba(57,255,20,0.06) 0%,rgba(0,245,160,0.02) 45%,transparent 70%);' +
                                'transform:translate(-50%,-50%);transition:opacity 0.3s ease;opacity:0;will-change:left,top;';
            document.body.appendChild(glow);
        }

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let currentX = mouseX;
        let currentY = mouseY;
        let isVisible = false;
        let animRunning = false;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!isVisible) {
                glow.style.opacity = '1';
                isVisible = true;
            }
            if (!animRunning) {
                animRunning = true;
                requestAnimationFrame(animateGlow);
            }
        }, { passive: true });

        document.addEventListener('mouseleave', () => {
            glow.style.opacity = '0';
            isVisible = false;
            animRunning = false;
        });

        function animateGlow() {
            if (!isVisible) {
                animRunning = false;
                return;
            }
            const dx = mouseX - currentX;
            const dy = mouseY - currentY;
            currentX += dx * 0.18;
            currentY += dy * 0.18;
            glow.style.left = currentX + 'px';
            glow.style.top = currentY + 'px';

            if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
                requestAnimationFrame(animateGlow);
            } else {
                animRunning = false;
            }
        }
    }

    // 7. RedSun Specular Green Sheen (Flashlight Highlight on Cards) - Delegated & RAF Throttled
    function initCardSpecularSheen() {
        if (isLowPowerDevice) return;

        const landing = document.getElementById('landing-page');
        if (!landing) return;

        let activeCard = null;
        let pendingX = 0, pendingY = 0;
        let rafPending = false;

        landing.addEventListener('pointermove', function(e) {
            const card = e.target.closest && e.target.closest(
                '.card-specular, .card-flagship, .cyber-ccce-card, .feature-card, .card-muted, [class*="bg-parth-surface"]'
            );

            if (!card) {
                if (activeCard) {
                    activeCard.style.setProperty('--specular-opacity', '0');
                    activeCard = null;
                }
                return;
            }

            if (activeCard && activeCard !== card) {
                activeCard.style.setProperty('--specular-opacity', '0');
            }
            activeCard = card;
            if (!card.classList.contains('card-specular')) {
                card.classList.add('card-specular');
            }

            pendingX = e.clientX;
            pendingY = e.clientY;

            if (!rafPending) {
                rafPending = true;
                requestAnimationFrame(() => {
                    rafPending = false;
                    if (activeCard) {
                        const rect = activeCard.getBoundingClientRect();
                        activeCard.style.setProperty('--specular-x', (pendingX - rect.left) + 'px');
                        activeCard.style.setProperty('--specular-y', (pendingY - rect.top) + 'px');
                        activeCard.style.setProperty('--specular-opacity', '1');
                    }
                });
            }
        }, { passive: true });

        landing.addEventListener('pointerleave', function() {
            if (activeCard) {
                activeCard.style.setProperty('--specular-opacity', '0');
                activeCard = null;
            }
        }, { passive: true });
    }

    // 8. 3D Card Micro-Tilt on Hover - Light GPU Transform
    function init3DCardTilt() {
        if (isLowPowerDevice) return;

        const tiltCards = document.querySelectorAll(
            '.card-flagship, .cyber-ccce-card'
        );

        tiltCards.forEach(card => {
            let rafTilt = false;
            let targetX = 0, targetY = 0;

            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                targetX = (e.clientX - rect.left) / rect.width - 0.5;
                targetY = (e.clientY - rect.top) / rect.height - 0.5;

                if (!rafTilt) {
                    rafTilt = true;
                    requestAnimationFrame(() => {
                        rafTilt = false;
                        card.style.transform = `perspective(800px) rotateY(${targetX * 5}deg) rotateX(${-targetY * 5}deg) translateY(-3px)`;
                    });
                }
            }, { passive: true });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0px)';
            });
        });
    }

    // 9. Unified Master Scroll Controller (RAF Throttled, Zero Layout Thrashing)
    function initMasterScrollController() {
        const landing = document.getElementById('landing-page');
        if (!landing) return;

        const tracker = document.getElementById('cyber-scroll-tracker');
        const topBtn = document.getElementById('m-top');
        const nav = document.querySelector('nav');
        const navLinks = document.querySelectorAll('nav a[href^="/"]');

        // Pre-cache section offsets to prevent continuous layout thrashing
        let sectionOffsets = [];
        function cacheOffsets() {
            const secIds = [
                { id: 'hero-section', path: '/' },
                { id: 'section-journey', path: '/programs' },
                { id: 'section-curriculum', path: '/programs' },
                { id: 'section-flagship', path: '/ccce' },
                { id: 'section-contact', path: '/contact' }
            ];
            sectionOffsets = secIds.map(s => {
                const el = document.getElementById(s.id);
                return { path: s.path, top: el ? el.offsetTop : 0 };
            });
        }
        cacheOffsets();
        window.addEventListener('resize', cacheOffsets, { passive: true });

        let ticking = false;
        function onScrollUpdate() {
            ticking = false;
            const st = landing.scrollTop;
            const max = landing.scrollHeight - landing.clientHeight;

            // 1. Top Laser Scroll Tracker
            if (tracker) {
                const p = max > 0 ? Math.min(1, Math.max(0, st / max)) : 0;
                tracker.style.transform = `scaleX(${p})`;
            }

            // 2. Back to top button
            if (topBtn) {
                topBtn.classList.toggle('m-show', st > 600);
            }

            // 3. Navbar scroll state
            if (nav) {
                nav.classList.toggle('m-scrolled', st > 30);
            }

            // 4. Nav link indicator (from cached offsets - ZERO layout reads!)
            if (sectionOffsets.length) {
                let activePath = '/';
                for (let i = 0; i < sectionOffsets.length; i++) {
                    if (st >= (sectionOffsets[i].top - 200)) {
                        activePath = sectionOffsets[i].path;
                    }
                }
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === activePath && activePath !== '/') {
                        link.classList.add('text-parth-accent');
                    } else if (href !== '/') {
                        link.classList.remove('text-parth-accent');
                    }
                });
            }
        }

        landing.addEventListener('scroll', function() {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(onScrollUpdate);
            }
        }, { passive: true });

        onScrollUpdate();
    }

    // 10. Native IntersectionObserver Cinematic Section Reveals (0ms Scroll Overhead)
    function initCinematicObserver() {
        if (!('IntersectionObserver' in window)) return;

        const landing = document.getElementById('landing-page');
        const sections = document.querySelectorAll('#landing-page > div, #landing-page > section');

        // Fail-safe: ensure base visibility
        sections.forEach(sec => {
            sec.style.opacity = '1';
            sec.style.visibility = 'visible';
        });

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sec = entry.target;
                    sec.classList.add('cyber-revealed');

                    // Activate heading glow pulse
                    const heading = sec.querySelector('h2, h3');
                    if (heading) {
                        heading.classList.add('glow-active');
                    }

                    // Done with this section - disconnect from observer for ZERO memory overhead
                    obs.unobserve(sec);
                }
            });
        }, {
            root: landing,
            threshold: 0.08,
            rootMargin: '0px 0px -40px 0px'
        });

        sections.forEach(sec => {
            if (sec.id === 'hero-section' || sec.classList.contains('m-aurora') || sec.tagName === 'NAV') return;
            sec.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            observer.observe(sec);
        });
    }

    // 11. Magnetic Buttons with Green Neon Micro-Glow
    function initMagneticButtons() {
        if (isLowPowerDevice) return;

        const btns = document.querySelectorAll(
            '#landing-page button.bg-parth-accent, #btn-show-login, .cyber-btn-primary'
        );

        btns.forEach(btn => {
            btn.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
            btn.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = (e.clientX - rect.left) - (rect.width / 2);
                const y = (e.clientY - rect.top) - (rect.height / 2);
                this.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
            }, { passive: true });

            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translate(0px, 0px)';
            });
        });
    }

    // Master Initialization
    function initAllInteractions() {
        initCcceRail();
        initCcceRegisterTriggers();
        initFormCyberLoading();
        initCursorGlow();
        initCardSpecularSheen();
        init3DCardTilt();
        initMasterScrollController();
        initCinematicObserver();
        initMagneticButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllInteractions);
    } else {
        initAllInteractions();
    }

})();
