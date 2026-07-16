(() => {
  const sidebar = document.querySelector('#main-sidebar');
  const toggle = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('#sidebar-overlay');
  const notificationToggle = document.querySelector('.notification-toggle');
  const notificationPanel = document.querySelector('#notification-panel');
  if (!sidebar || !toggle || !overlay) return;

  const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

  const setMenuOpen = open => {
    const next = Boolean(open);
    sidebar.classList.toggle('open', next);
    overlay.classList.toggle('open', next);
    toggle.setAttribute('aria-expanded', String(next));
    toggle.setAttribute('aria-label', next ? 'メニューを閉じる' : 'メニューを開く');
    sidebar.setAttribute('aria-hidden', String(isMobile() ? !next : false));
    overlay.setAttribute('aria-hidden', String(!next));
    document.body.classList.toggle('menu-open', next);
  };

  const setNotificationsOpen = open => {
    if (!notificationToggle || !notificationPanel) return;
    const next = Boolean(open);
    notificationPanel.hidden = !next;
    notificationPanel.classList.toggle('open', next);
    notificationToggle.setAttribute('aria-expanded', String(next));
    notificationToggle.setAttribute('aria-label', next ? '通知を閉じる' : '通知を開く');
  };

  const navigate = view => {
    if (!view || typeof state === 'undefined' || typeof render !== 'function') return;
    state.view = view;
    state.companyId = null;
    if (view !== 'detail') state.tab = 'overview';
    render();
  };

  const updateIdentity = () => {
    const profile = typeof state !== 'undefined' ? state.profile || {} : {};
    const name = typeof userName === 'function' ? userName() : String(profile.nickname || profile.name || '').trim() || 'ゲスト';
    const initials = name === 'ゲスト' ? 'GU' : name.slice(0, 2).toUpperCase();
    const completionValue = typeof completion === 'function' ? completion() : 0;
    document.querySelector('#user-display-name')?.replaceChildren(document.createTextNode(name));
    document.querySelector('#user-profile-completion')?.replaceChildren(document.createTextNode(profile.registered ? `プロフィール ${completionValue}%` : 'プロフィール 未作成'));
    document.querySelector('#user-mini-avatar')?.replaceChildren(document.createTextNode(initials));
    document.querySelector('.top-avatar')?.replaceChildren(document.createTextNode(initials));
  };

  // Keep the stable header control in one place. Capturing prevents legacy
  // listeners attached during repeated app renders from toggling twice.
  toggle.addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    setMenuOpen(!sidebar.classList.contains('open'));
  }, true);

  overlay.addEventListener('click', event => {
    event.preventDefault();
    setMenuOpen(false);
  });

  if (notificationToggle) {
    notificationToggle.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      setNotificationsOpen(notificationPanel.hidden);
    }, true);
  }

  // All data-view controls, including those rendered later by app.js, use
  // the same delegated navigation path and therefore keep working after a
  // page render.
  document.addEventListener('click', event => {
    const control = event.target.closest?.('[data-view]');
    if (!control || control === toggle) return;
    if (control.matches('.mobile-menu')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    navigate(control.dataset.view);
    if (control.closest('#main-sidebar')) setMenuOpen(false);
  }, true);

  document.addEventListener('click', event => {
    if (notificationPanel && !notificationPanel.hidden && !event.target.closest('.notification-panel, .notification-toggle')) {
      setNotificationsOpen(false);
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (sidebar.classList.contains('open')) {
      setMenuOpen(false);
      toggle.focus();
    }
    if (notificationPanel && !notificationPanel.hidden) {
      setNotificationsOpen(false);
      notificationToggle?.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (!isMobile()) setMenuOpen(false);
    else sidebar.setAttribute('aria-hidden', String(!sidebar.classList.contains('open')));
  });

  setMenuOpen(false);
  setNotificationsOpen(false);
  updateIdentity();
  const appRoot = document.querySelector('#app');
  if (appRoot) new MutationObserver(updateIdentity).observe(appRoot, { childList: true });
  console.info('[Codra] mobile controls ready', document.querySelector('meta[name="codra-version"]')?.content || 'unknown');
})();
