/* Small, dependency-free enhancements. Native links and scrolling stay native. */
(() => {
  'use strict';
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 760px)');
  const nav = document.querySelector('.site-nav');
  const links = nav?.querySelector('.nav-links');
  const main = document.querySelector('main, .page');

  if (main && !document.querySelector('.skip-link')) {
    main.id ||= 'main-content';
    const skip = document.createElement('a');
    skip.className = 'skip-link';
    skip.href = `#${main.id}`;
    skip.textContent = 'Skip to content';
    document.body.prepend(skip);
  }

  if (nav && links) {
    nav.setAttribute('aria-label', 'Main navigation');
    links.id ||= 'main-navigation';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-toggle';
    toggle.setAttribute('aria-controls', links.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = 'Menu <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path class="menu-line" d="M4 7h12"/><path class="menu-line" d="M4 13h12"/></svg>';
    const controls = document.createElement('div');
    controls.className = 'nav-controls';
    controls.append(toggle);
    links.after(controls);
    nav.classList.add('nav-enhanced');
    function setOpen(open, focusToggle = false) {
      toggle.setAttribute('aria-expanded', String(open));
      links.classList.toggle('is-open', open);
      if (mobile.matches) links.inert = !open;
      if (focusToggle) toggle.focus();
    }
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      setOpen(open);
      if (open && mobile.matches) links.querySelector('a')?.focus({ preventScroll: true });
    });
    nav.addEventListener('keydown', event => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false, true);
      }
    });
    links.addEventListener('click', event => {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', event => {
      if (!nav.contains(event.target)) setOpen(false);
    });
    nav.addEventListener('focusout', event => {
      if (!nav.contains(event.relatedTarget)) setOpen(false);
    });
    links.inert = mobile.matches;
    mobile.addEventListener('change', () => {
      const hiddenFocus = mobile.matches && links.contains(document.activeElement);
      setOpen(false, hiddenFocus);
      links.inert = mobile.matches;
    });
  }

  // Theme choice follows the OS until the visitor explicitly chooses a palette.
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const themeButton = document.createElement('button');
  themeButton.className = 'theme-toggle';
  themeButton.type = 'button';
  const themeIcons = {
    light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    dark: '<path d="M20.5 13.5A8.8 8.8 0 0 1 10.5 3a9 9 0 1 0 10 10.5Z"/>',
    system: '<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor"/>'
  };
  function applyTheme(preference) {
    const theme = preference === 'system' ? (systemTheme.matches ? 'dark' : 'light') : preference;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.themePreference = preference;
    themeButton.dataset.preference = preference;
    const next = { system: 'light', light: 'dark', dark: 'system' }[preference];
    const label = `Theme: ${preference}. Switch to ${next} theme`;
    themeButton.setAttribute('aria-label', label);
    themeButton.title = label;
    themeButton.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${themeIcons[preference]}</svg>`;
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.append(meta);
    }
    meta.content = theme === 'dark' ? '#161e1a' : '#f7f7f2';
  }
  applyTheme(document.documentElement.dataset.themePreference || 'system');
  nav?.querySelector('.nav-controls')?.prepend(themeButton);
  themeButton.addEventListener('click', () => {
    const next = { system: 'light', light: 'dark', dark: 'system' }[document.documentElement.dataset.themePreference];
    applyTheme(next);
    try {
      if (next === 'system') localStorage.removeItem('vincent-theme');
      else localStorage.setItem('vincent-theme', next);
    } catch { /* Theme still works for this visit when storage is unavailable. */ }
  });
  systemTheme.addEventListener('change', () => {
    if (document.documentElement.dataset.themePreference === 'system') applyTheme('system');
  });
  window.addEventListener('storage', event => {
    if (event.key === 'vincent-theme' || event.key === null) {
      applyTheme(event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : 'system');
    }
  });

  // Moving desktop highlight stays anchored to the selected page on pointer exit.
  if (links) {
    const currentLink = links.querySelector('[aria-current="page"]');
    if (currentLink) {
      const pill = document.createElement('li');
      pill.className = 'nav-active-pill';
      pill.setAttribute('aria-hidden', 'true');
      links.prepend(pill);
      function movePill(target = currentLink) {
        if (mobile.matches) return;
        const rect = target.getBoundingClientRect();
        const parent = links.getBoundingClientRect();
        pill.style.width = `${rect.width}px`;
        pill.style.height = `${rect.height}px`;
        pill.style.transform = `translate(${rect.left - parent.left}px, ${rect.top - parent.top}px)`;
        links.classList.add('nav-has-indicator');
      }
      links.addEventListener('pointerover', event => { const target = event.target.closest('a'); if (target) movePill(target); });
      links.addEventListener('pointerleave', () => movePill());
      links.addEventListener('focusin', event => { const target = event.target.closest('a'); if (target) movePill(target); });
      links.addEventListener('focusout', event => { if (!links.contains(event.relatedTarget)) movePill(); });
      if ('ResizeObserver' in window) new ResizeObserver(() => movePill()).observe(links);
      window.addEventListener('resize', () => movePill(), { passive: true });
      document.fonts?.ready.then(() => movePill());
      movePill();
    }
  }

  const pages = [
    { path: 'index.html', label: 'Home', title: 'Back to the beginning' },
    { path: 'layout/research/research.html', label: 'Publications', title: 'Research & publications' },
    { path: 'layout/program/program.html', label: 'Projects', title: 'Ideas turned into projects' },
    { path: 'layout/selfIntro/selfIntro.html', label: 'About', title: 'The person behind the work' },
    { path: 'layout/more/more.html', label: 'More', title: 'A little more to explore' }
  ];
  const currentPage = Math.max(0, pages.findIndex(page => window.location.pathname.endsWith(page.path)));
  // Resolve relative to this script so subdirectory-hosted sites work as well.
  const scriptURL = [...document.scripts].find(script => script.src && new URL(script.src).pathname.endsWith('/script.js'))?.src;
  const siteRoot = new URL('.', scriptURL || window.location.href);
  if (main && currentPage > 0) {
    const breadcrumb = document.createElement('nav');
    breadcrumb.className = 'breadcrumbs';
    breadcrumb.setAttribute('aria-label', 'Breadcrumb');
    breadcrumb.innerHTML = `<a href="${new URL('index.html', siteRoot).href}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5-7 7 7 7M2 12h20"/></svg>Home</a><span aria-hidden="true">/</span><span aria-current="page">${pages[currentPage].label}</span>`;
    main.prepend(breadcrumb);
  }
  if (main) {
    const next = pages[(currentPage + 1) % pages.length];
    const nextLink = document.createElement('a');
    nextLink.className = 'next-page';
    nextLink.href = new URL(next.path, siteRoot).href;
    nextLink.innerHTML = `<span><small>Keep exploring · ${next.label}</small><strong>${next.title}</strong></span><span class="next-page-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></span>`;
    const footer = main.querySelector('.social-links, .site-footer');
    if (footer) footer.before(nextLink);
  }
  const socialIcons = {
    blog: '<path d="M3 4h6a4 4 0 0 1 3 1.5A4 4 0 0 1 15 4h6v16h-6a4 4 0 0 0-3 1 4 4 0 0 0-3-1H3V4Zm9 2v15"/>',
    x: '<path d="m4 3 16 18M20 3 4 21M4 3h4l12 18h-4Z"/>',
    github: '<path d="M9 19c-4 1-4-2-6-2m12 5v-4a3.5 3.5 0 0 0-1-3c3 0 6-1.5 6-5a4 4 0 0 0-1-3c.4-1 .3-2.5-.5-3-1.5 0-3 1-3 1a11 11 0 0 0-7 0s-1.5-1-3-1c-.8.5-.9 2-.5 3a4 4 0 0 0-1 3c0 3.5 3 5 6 5a3.5 3.5 0 0 0-1 3v4"/>',
    huggingface: '<circle cx="12" cy="12" r="9"/><path d="M8 9v1m8-1v1m-8 5c2 2 6 2 8 0"/>',
    youtube: '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3Z"/>',
    douyin: '<path d="M14 3v13a4 4 0 1 1-4-4m4-9c1 4 3 5 7 5"/>',
    bilibili: '<rect x="3" y="6" width="18" height="15" rx="3"/><path d="m8 2 4 4 4-4M8 11v3m8-3v3"/>',
    xiaohongshu: '<path d="M6 3h13v18H6a3 3 0 0 1 0-6h13M6 3a3 3 0 0 0-3 3v12m5-11h7m-7 4h5"/>',
    zhihu: '<path d="M21 11a9 9 0 0 1-9 9 10 10 0 0 1-4-1l-5 2 1-5a9 9 0 1 1 17-5Z"/><path d="M10 8a2 2 0 1 1 3 2c-1 .5-1 1-1 2m0 3h.01"/>'
  };
  document.querySelectorAll('.social-links a').forEach(link => {
    const host = new URL(link.href).hostname;
    const key = ['github', 'huggingface', 'youtube', 'douyin', 'bilibili', 'xiaohongshu', 'zhihu'].find(name => host === `${name}.com` || host.endsWith(`.${name}.com`) || host === `${name}.co`);
    const iconKey = host === 'x.com' ? 'x' : (key || 'blog');
    const icon = document.createElement('span');
    icon.className = 'social-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${socialIcons[iconKey]}</svg>`;
    link.prepend(icon);
  });

  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);
  const sectionNav = document.querySelector('.section-nav');
  const sections = sectionNav ? [...sectionNav.querySelectorAll('a')].map(link => ({ link, section: document.querySelector(link.getAttribute('href')) })) : [];

  const topButton = document.createElement('button');
  topButton.type = 'button';
  topButton.className = 'back-to-top';
  topButton.setAttribute('aria-label', 'Back to top');
  topButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6"/></svg>';
  document.body.append(topButton);
  topButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: motion.matches ? 'instant' : 'smooth' });
    nav?.querySelector('.nav-brand')?.focus({ preventScroll: true });
  });
  let scrollPending = false;
  function updateScroll() {
    nav?.classList.toggle('is-scrolled', window.scrollY > 12);
    topButton.classList.toggle('is-visible', window.scrollY > 650);
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0})`;
    if (sectionNav) {
      const offset = (nav?.getBoundingClientRect().height || 90) + sectionNav.offsetHeight + 35;
      let current = null;
      sections.forEach(item => { if (item.section?.getBoundingClientRect().top <= offset) current = item.link; });
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = sections.at(-1)?.link;
      sections.forEach(({ link }) => {
        if (link === current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    scrollPending = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollPending) {
      scrollPending = true;
      window.requestAnimationFrame(updateScroll);
    }
  }, { passive: true });
  updateScroll();
  window.addEventListener('resize', updateScroll, { passive: true });
  if ('ResizeObserver' in window && main) new ResizeObserver(() => updateScroll()).observe(main);

  const revealElements = document.querySelectorAll('[data-reveal]');
  let revealObserver;
  if ('IntersectionObserver' in window && !motion.matches) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
    revealElements.forEach(element => {
      // Already-visible content paints immediately; only incoming sections reveal.
      if (element.getBoundingClientRect().top > window.innerHeight - 24) {
        element.classList.add('will-reveal');
        revealObserver.observe(element);
      }
    });
    document.addEventListener('focusin', event => {
      const section = event.target.closest('[data-reveal]');
      if (section) {
        section.classList.add('is-revealed');
        revealObserver.unobserve(section);
      }
    });
  }

  let toastTimer;
  function notify(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.append(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }
  document.querySelectorAll('[data-copy]').forEach(button => {
    const originalIcon = button.innerHTML;
    const originalLabel = button.getAttribute('aria-label');
    let resetCopy;
    button.addEventListener('click', async () => {
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(button.dataset.copy);
        button.classList.add('is-copied');
        button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
        button.setAttribute('aria-label', `Copied ${button.dataset.copy}`);
        window.clearTimeout(resetCopy);
        resetCopy = window.setTimeout(() => {
          button.classList.remove('is-copied');
          button.innerHTML = originalIcon;
          button.setAttribute('aria-label', originalLabel);
        }, 2400);
        notify('Email address copied');
      } catch {
        const email = button.parentElement.querySelector('a');
        if (email) {
          const range = document.createRange();
          range.selectNodeContents(email);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
        notify('Select and copy the email address');
      }
    });
  });

  const typed = document.getElementById('index-typed');
  const counter = document.querySelector('.thought-index');
  const phrases = [
    '永远相信美好的事情即将发生。',
    '别感冒，别多想。',
    "We’ll paint the world with our colors and everyone will know.",
    'SJH ❤ ZYT.',
    'Talk is cheap, show me the code.',
    'Education is a kindling of a flame, not a filling of a vessel.',
    'Gumayusi is the greatest ADC in the world!',
    'Stay hungry, stay foolish.',
    '没有引力的世界，没有脚印的光年。',
    "I once was lost, but now I’m found.",
    'Patience is key in life.',
    'Damian Lillard got a shot!',
    '关键的问题是问题的关键。'
  ];
  let typingTimer;
  let phraseIndex = 0;
  let character = Array.from(phrases[0]).length;
  let erasing = true;
  let quoteVisible = true;
  const canType = () => typed && !motion.matches && !document.hidden && quoteVisible;
  function scheduleTyping(delay = 2200) {
    window.clearTimeout(typingTimer);
    if (canType()) typingTimer = window.setTimeout(typeStep, delay);
  }
  function typeStep() {
    if (!canType()) return;
    const characters = Array.from(phrases[phraseIndex]);
    character += erasing ? -1 : 1;
    typed.textContent = characters.slice(0, character).join('');
    if (erasing && character <= 0) {
      erasing = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      if (counter) counter.textContent = `${String(phraseIndex + 1).padStart(2, '0')} / ${phrases.length}`;
      scheduleTyping(360);
    } else if (!erasing && character >= characters.length) {
      erasing = true;
      scheduleTyping(3000);
    } else {
      scheduleTyping(erasing ? 28 : 62);
    }
  }
  if (typed) {
    // Measure all phrases in the actual font/width, preventing any text-induced shift.
    const sizing = document.querySelector('.typed-sizing');
    function reserveQuoteSpace() {
      if (!sizing) return;
      let maxHeight = 0;
      phrases.forEach(phrase => {
        sizing.textContent = phrase;
        maxHeight = Math.max(maxHeight, sizing.getBoundingClientRect().height);
      });
      sizing.textContent = '';
      sizing.style.minHeight = `${Math.ceil(maxHeight)}px`;
    }
    // Clear previous measurement before resizing so the reserved height can shrink.
    const measureQuote = () => { if (sizing) sizing.style.minHeight = ''; reserveQuoteSpace(); };
    measureQuote();
    document.fonts?.ready.then(measureQuote);
    let resizeTimer;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measureQuote, 150);
    }, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        quoteVisible = entries[0].isIntersecting;
        scheduleTyping();
      }).observe(typed.parentElement);
    } else scheduleTyping();
    document.addEventListener('visibilitychange', () => scheduleTyping());
  }
  motion.addEventListener('change', () => {
    if (motion.matches) {
      revealObserver?.disconnect();
      revealElements.forEach(element => element.classList.add('is-revealed'));
      window.clearTimeout(typingTimer);
      if (typed) typed.textContent = phrases[0];
      if (counter) counter.textContent = '01 / 13';
      phraseIndex = 0;
      character = Array.from(phrases[0]).length;
      erasing = true;
    } else scheduleTyping();
  });
})();
