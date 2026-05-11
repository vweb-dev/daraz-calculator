// Motion One animations for Daraz Calculator Pro
// Framer Motion-like spring animations for vanilla JS

(function() {
  // Wait for Motion to be ready
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    // Animate panels on load with staggered effect
    const panels = document.querySelectorAll('.panel');
    panels.forEach((panel, index) => {
      if (typeof motion !== 'undefined') {
        motion(panel, {
          opacity: [0, 1],
          y: [30, 0]
        }, {
          duration: 0.5,
          delay: index * 0.1,
          easing: 'spring'
        });
      }
    });

    // Animate cards on hover
    const cards = document.querySelectorAll('.metric-card, .recent-card, .bundle-scenario');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        if (typeof motion !== 'undefined') {
          motion(card, { scale: [1, 1.02] }, { duration: 0.2, easing: 'spring' });
        }
      });
      card.addEventListener('mouseleave', () => {
        if (typeof motion !== 'undefined') {
          motion(card, { scale: [1.02, 1] }, { duration: 0.2, easing: 'spring' });
        }
      });
    });

    // Animate buttons on click
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        if (typeof motion !== 'undefined') {
          // Create ripple effect
          const ripple = document.createElement('span');
          ripple.style.cssText = `
            position: absolute;
            background: rgba(255,255,255,0.4);
            border-radius: 50%;
            pointer-events: none;
            width: 100px;
            height: 100px;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) scale(0);
          `;
          this.appendChild(ripple);

          motion(ripple, {
            scale: [0, 4],
            opacity: [1, 0]
          }, {
            duration: 0.6,
            easing: 'ease-out'
          }).then(() => ripple.remove());
        }
      });
    });

    // Animate toast notifications
    const animateToast = function(toast) {
      if (typeof motion !== 'undefined') {
        motion(toast, {
          opacity: [0, 1],
          y: [-20, 0]
        }, {
          duration: 0.3,
          easing: 'spring'
        });
      }
    };

    // Hook into toast creation (if AppNotify exists)
    if (window.AppNotify) {
      const originalShow = window.AppNotify.show;
      window.AppNotify.show = function(msg, type, duration) {
        const result = originalShow.call(this, msg, type, duration);
        // Toast will be animated by CSS, but we can add motion here too
        setTimeout(() => {
          const toast = document.querySelector('.toast:last-child');
          if (toast && typeof motion !== 'undefined') {
            motion(toast, {
              opacity: [0, 1],
              x: [-30, 0]
            }, { duration: 0.4, easing: 'spring' });
          }
        }, 10);
        return result;
      };
    }

    // Animate bottom nav items on page load
    const navItems = document.querySelectorAll('.bottom-nav__item');
    navItems.forEach((item, index) => {
      if (typeof motion !== 'undefined') {
        motion(item, {
          opacity: [0, 1],
          y: [20, 0]
        }, {
          duration: 0.4,
          delay: index * 0.1 + 0.3,
          easing: 'spring'
        });
      }
    });

    // Animate FAB
    const fab = document.querySelector('.fab');
    if (fab) {
      if (typeof motion !== 'undefined') {
        motion(fab, {
          scale: [0, 1],
          opacity: [0, 1]
        }, {
          duration: 0.5,
          delay: 1,
          easing: 'spring'
        });
      }
    }

    // Number counter animation
    window.animateNumber = function(element, target, duration = 1000) {
      if (!element) return;

      const start = 0;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Spring-like easing
        const spring = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * spring);

        element.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      }

      requestAnimationFrame(update);
    };

    // Slide in animation for modals
    window.animateModal = function(modal, direction = 'up') {
      if (!modal || typeof motion === 'undefined') return;

      const transforms = {
        up: { y: [50, 0] },
        down: { y: [-50, 0] },
        left: { x: [50, 0] },
        right: { x: [-50, 0] },
        scale: { scale: [0.9, 1] }
      };

      const transform = transforms[direction] || transforms.up;

      motion(modal, {
        opacity: [0, 1],
        ...transform
      }, {
        duration: 0.4,
        easing: 'spring'
      });
    };

    // Exit animation
    window.animateExit = function(element, callback) {
      if (!element || typeof motion === 'undefined') {
        if (callback) callback();
        return;
      }

      motion(element, {
        opacity: [1, 0],
        scale: [1, 0.95]
      }, {
        duration: 0.2,
        easing: 'ease-out'
      }).then(() => {
        if (callback) callback();
      });
    };

    // Parallax effect for hero section
    const hero = document.querySelector('.hero-status');
    if (hero) {
      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (scrolled < 100 && typeof motion !== 'undefined') {
          motion(hero, {
            y: [scrolled * 0.1, 0]
          }, { duration: 0.1 });
        }
      });
    }

    // Magnetic effect on buttons
    const magneticBtns = document.querySelectorAll('.btn, .icon-btn, .chip-btn');
    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        if (typeof motion !== 'undefined') {
          motion(btn, {
            x: [0, x * 0.1],
            y: [0, y * 0.1]
          }, { duration: 0.1 });
        }
      });

      btn.addEventListener('mouseleave', () => {
        if (typeof motion !== 'undefined') {
          motion(btn, { x: 0, y: 0 }, { duration: 0.3, easing: 'spring' });
        }
      });
    });

    // Progress bar animation
    window.animateProgress = function(element, targetPercent) {
      if (!element || typeof motion === 'undefined') return;

      motion(element, {
        width: [`0%`, `${targetPercent}%`]
      }, {
        duration: 1,
        easing: 'spring'
      });
    };

    // Reveal animations on scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const revealElements = document.querySelectorAll('.metric-card, .bundle-scenario, .recent-card');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && typeof motion !== 'undefined') {
          motion(entry.target, {
            opacity: [0, 1],
            y: [30, 0]
          }, {
            duration: 0.5,
            easing: 'spring'
          });
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));

    console.log('[Motion] Animations initialized');
  });
})();