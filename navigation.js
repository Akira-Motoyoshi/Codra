(() => {
  const sidebar = document.querySelector('#main-sidebar');
  const toggle = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('#sidebar-overlay');
  if (!sidebar || !toggle || !overlay) return;

  const setOpen = open => {
    sidebar.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    sidebar.setAttribute('aria-hidden', String(!open && window.matchMedia('(max-width: 650px)').matches));
    overlay.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
  };

  // Capture the event before the legacy app.js listener so repeated renders cannot add duplicate toggles.
  toggle.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    setOpen(!sidebar.classList.contains('open'));
  }, true);
  overlay.addEventListener('click', () => setOpen(false));
  sidebar.addEventListener('click', event => {
    if (event.target.closest('[data-view]')) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && sidebar.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.addEventListener('resize', () => {
    if (!window.matchMedia('(max-width: 650px)').matches) setOpen(false);
    else sidebar.setAttribute('aria-hidden', String(!sidebar.classList.contains('open')));
  });
  setOpen(false);
})();
