// ===== Cursor (desktop only) =====
const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

function initCursor() {
  if (isTouchDevice()) return;

  const cursorGlow = document.querySelector('.cursor-glow');
  if (!cursorGlow) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  document.body.appendChild(dot);

  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(ring);

  let mouseX = 0, mouseY = 0;
  let dotX = 0, dotY = 0;
  let ringX = 0, ringY = 0;

  const updateCursor = () => {
    dotX += (mouseX - dotX) * 0.2;
    dotY += (mouseY - dotY) * 0.2;
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;

    if (cursorGlow) {
      cursorGlow.style.left = mouseX + 'px';
      cursorGlow.style.top = mouseY + 'px';
    }
    dot.style.left = dotX + 'px';
    dot.style.top = dotY + 'px';
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';

    requestAnimationFrame(updateCursor);
  };
  updateCursor();

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!document.body.classList.contains('cursor-visible')) {
      document.body.classList.add('cursor-visible');
    }
  });

  document.addEventListener('mouseleave', () => {
    document.body.classList.remove('cursor-visible', 'cursor-hover');
  });

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .complex-card, .btn')) {
      document.body.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget || !e.relatedTarget.closest('a, button, .complex-card, .btn')) {
      document.body.classList.remove('cursor-hover');
    }
  });

  document.body.style.cursor = 'none';
}

// Restore default cursor if custom cursor causes issues
if (isTouchDevice()) {
  document.documentElement.classList.add('touch-device');
}

// ===== Page Load Animation =====
function initPageLoadAnimation() {
  document.body.classList.add('page-loaded');
}

function updateNavActive(path) {
  const normalizedPath = (path || window.location.pathname).replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = (a.getAttribute('href') || '').replace(/^\//, '');
    const isActive = (href === 'index.html' && (normalizedPath === '/' || normalizedPath.endsWith('index.html'))) ||
      (href && href !== 'index.html' && (normalizedPath.endsWith(href) || normalizedPath === '/' + href));
    a.classList.toggle('active', isActive);
  });
}

// ===== Nav Backdrop (mobile) =====
function initNavBackdrop() {
  const burger = document.querySelector('.burger');
  const navLinks = document.querySelector('.nav-links');
  let backdrop = document.querySelector('.nav-backdrop');

  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);
  }

  const closeMenu = () => {
    burger?.classList.remove('active');
    navLinks?.classList.remove('open');
    backdrop?.classList.remove('active');
    document.body.classList.remove('menu-open');
  };

  backdrop.onclick = closeMenu;
}

// ===== Header Scroll =====
function initHeaderScroll() {
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });
}

// ===== Scroll Animations =====
function initScrollAnimations() {
  const animateElements = document.querySelectorAll('[data-animate], .complex-card, .advantage-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay || 0;
        setTimeout(() => el.classList.add('animate-in'), delay);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  animateElements.forEach((el, i) => {
    if (el.classList.contains('complex-card') || el.classList.contains('advantage-card')) {
      el.dataset.delay = i * 150;
    }
    observer.observe(el);
  });
}

// ===== Counter Animation =====
function initCounters() {
  const statValues = document.querySelectorAll('.stat-value[data-count]');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const duration = 2000;
        const start = performance.now();

        const update = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const current = Math.floor(eased * target);
          el.textContent = current.toLocaleString('ru-RU');
          if (t < 1) requestAnimationFrame(update);
          else el.textContent = target.toLocaleString('ru-RU');
        };
        requestAnimationFrame(update);
        countObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statValues.forEach(el => countObserver.observe(el));
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ===== Burger Menu =====
function initBurger() {
  const burger = document.querySelector('.burger');
  const navLinks = document.querySelector('.nav-links');
  const backdrop = document.querySelector('.nav-backdrop');

  if (burger) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      navLinks?.classList.toggle('open');
      backdrop?.classList.toggle('active', navLinks?.classList.contains('open'));
      document.body.classList.toggle('menu-open');
    });
  }

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        burger?.classList.remove('active');
        navLinks?.classList.remove('open');
        backdrop?.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });
  });
}

// ===== Form Submit =====
function initForms() {
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const txt = btn.textContent;
      btn.textContent = 'Отправлено!';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = txt;
        btn.disabled = false;
        contactForm.reset();
      }, 2000);
    });
  }
}

// ===== Parallax =====
function initParallax() {
  const heroShapes = document.querySelector('.hero-shapes');
  if (heroShapes) {
    window.addEventListener('scroll', () => {
      heroShapes.style.transform = `translateY(${window.pageYOffset * 0.3}px)`;
    }, { passive: true });
  }
}

// ===== Init All =====
function initPage() {
  initScrollAnimations();
  initCounters();
  initForms();
  initParallax();
}

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initPageLoadAnimation();
  initNavBackdrop();
  initHeaderScroll();
  initBurger();
  initPage();
  initSmoothScroll();
  updateNavActive();
});
