(() => {
  const root = document.documentElement;
  const header = document.getElementById('site-header');
  const themeToggle = document.getElementById('theme-toggle');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  // Theme: persisted, falls back to system preference
  const savedTheme = safeGet('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  root.setAttribute('data-theme', savedTheme || (prefersLight ? 'light' : 'dark'));

  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    safeSet('theme', next);
  });

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch { /* ignore */ }
  }

  // Mobile nav
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Header shadow/border on scroll
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Scroll reveal (progressive enhancement: only hide elements once we can
  // guarantee they'll be revealed, so a slow/blocked/broken script never
  // leaves content permanently invisible)
  if ('IntersectionObserver' in window) {
    root.classList.add('js-anim');
    const revealEls = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // Active nav link tracking
  const sections = document.querySelectorAll('main section[id]');
  const navByHref = new Map(
    Array.from(document.querySelectorAll('.nav-link')).map((a) => [a.getAttribute('href'), a])
  );
  if ('IntersectionObserver' in window && sections.length) {
    const sectionIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = navByHref.get(`#${entry.target.id}`);
          if (!link) return;
          if (entry.isIntersecting) {
            navByHref.forEach((a) => a.classList.remove('active-link'));
            link.classList.add('active-link');
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((s) => sectionIO.observe(s));
  }
})();
