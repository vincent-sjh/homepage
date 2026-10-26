/* Project exploration: progressive filters and a keyboard-friendly image gallery. */
(() => {
  'use strict';
  const projects = [...document.querySelectorAll('.project[data-categories]')];
  if (!projects.length) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const toolbar = document.querySelector('.project-toolbar');
  const filters = [...document.querySelectorAll('.project-filter')];
  const results = document.querySelector('.project-results');
  const animations = new Set();
  const matches = (project, category) => category === 'all' || project.dataset.categories.split(' ').includes(category);

  function stopAnimations() {
    animations.forEach(animation => animation.cancel());
    animations.clear();
  }

  filters.forEach(button => {
    const category = button.dataset.filter;
    const count = projects.filter(project => matches(project, category)).length;
    button.querySelector('.project-filter-count').textContent = count;
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-pressed') === 'true') return;
      stopAnimations();
      filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
      let visibleIndex = 0;
      projects.forEach(project => {
        project.hidden = !matches(project, category);
        if (project.hidden) return;
        // A newly matched project is immediately available to sighted and keyboard users.
        project.classList.remove('will-reveal');
        project.classList.add('is-revealed');
        if (!motion.matches && typeof project.animate === 'function') {
          const animation = project.animate([
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ], { duration: 330, delay: Math.min(visibleIndex, 5) * 35, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards' });
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        }
        visibleIndex += 1;
      });
      const categoryName = button.firstChild.textContent.trim();
      results.textContent = category === 'all'
        ? `Showing all ${projects.length} projects`
        : `Showing ${count} of ${projects.length} projects · ${categoryName}`;
    });
  });
  toolbar.hidden = false;
  motion.addEventListener('change', () => { if (motion.matches) stopAnimations(); });

  const dialog = document.querySelector('.project-lightbox');
  // Older browsers retain the original image links without exposing a broken viewer.
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const image = dialog.querySelector('.project-lightbox-image');
  const stage = dialog.querySelector('.project-lightbox-stage');
  const title = dialog.querySelector('#project-lightbox-title');
  const category = dialog.querySelector('.project-lightbox-category');
  const position = dialog.querySelector('.project-lightbox-position');
  const previous = dialog.querySelector('.project-lightbox-prev');
  const next = dialog.querySelector('.project-lightbox-next');
  const close = dialog.querySelector('.project-lightbox-close');
  let gallery = [];
  let current = 0;
  let trigger;
  let previousOverflow = '';
  let previousPadding = '';

  function showImage(index) {
    current = (index + gallery.length) % gallery.length;
    const project = gallery[current];
    const thumbnail = project.querySelector('.project-media img');
    stage.setAttribute('aria-busy', 'true');
    image.alt = thumbnail.alt;
    image.src = project.querySelector('[data-project-image]').href;
    title.textContent = project.querySelector('.project-title').textContent.trim();
    category.textContent = project.querySelector('.project-label > span').textContent;
    position.textContent = `${String(current + 1).padStart(2, '0')} / ${String(gallery.length).padStart(2, '0')}`;
    previous.disabled = next.disabled = gallery.length < 2;
    if (image.complete) stage.setAttribute('aria-busy', 'false');
  }

  image.addEventListener('load', () => stage.setAttribute('aria-busy', 'false'));
  image.addEventListener('error', () => stage.setAttribute('aria-busy', 'false'));

  projects.forEach(project => {
    const link = project.querySelector('[data-project-image]');
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      // Modified link clicks keep their normal open-in-tab / download behavior.
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      trigger = link;
      gallery = projects.filter(item => !item.hidden);
      showImage(gallery.indexOf(project));
      previousOverflow = document.body.style.overflow;
      previousPadding = document.body.style.paddingRight;
      const stableGutter = (getComputedStyle(document.documentElement).scrollbarGutter || '').includes('stable');
      const scrollbarWidth = stableGutter ? 0 : window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + scrollbarWidth}px`;
      }
      document.body.style.overflow = 'hidden';
      dialog.showModal();
      close.focus({ preventScroll: true });
    });
  });

  close.addEventListener('click', () => dialog.close());
  previous.addEventListener('click', () => showImage(current - 1));
  next.addEventListener('click', () => showImage(current + 1));
  dialog.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || gallery.length < 2) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showImage(current + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    document.body.style.paddingRight = previousPadding;
    trigger?.focus({ preventScroll: true });
  });
})();
