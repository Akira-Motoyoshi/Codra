// Small runtime bindings for dynamically rendered primary CTAs.
(() => {
  const bindDemoCta = () => {
    const button = document.querySelector('#start-demo');
    if (button && button.dataset.runtimeBound !== 'true' && typeof window.startDemo === 'function') {
      button.dataset.runtimeBound = 'true';
      button.onclick = event => {
        event.preventDefault();
        window.startDemo();
      };
    }
  };
  const app = document.querySelector('#app');
  if (app) new MutationObserver(bindDemoCta).observe(app, { childList: true, subtree: true });
  bindDemoCta();
})();
