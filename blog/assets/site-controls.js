/* Shared theme and responsive navigation controls; no framework or third-party runtime. */
(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.btn-dark');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const lightColor = getComputedStyle(root).getPropertyValue('--bg').trim();
  const darkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  const THEME_STORAGE_KEY = 'dark';
  // Keep in sync with the navigation breakpoint in custom.css.
  const desktop = window.matchMedia('(min-width: 1024px)');

  const readTheme = () => {
    try { return localStorage.getItem(THEME_STORAGE_KEY); } catch { return null; }
  };
  const savedTheme = readTheme();
  let explicitTheme = savedTheme === 'true' || savedTheme === 'false';
  const setTheme = (dark) => {
    root.classList.toggle('dark', dark);
    themeButton?.setAttribute('aria-pressed', String(dark));
    themeMeta?.setAttribute('content', dark ? '#000' : lightColor);
  };
  setTheme(explicitTheme ? savedTheme === 'true' : darkScheme.matches);
  themeButton?.addEventListener('click', () => {
    const dark = !root.classList.contains('dark');
    explicitTheme = true;
    setTheme(dark);
    try { localStorage.setItem(THEME_STORAGE_KEY, String(dark)); } catch { /* Works without storage. */ }
  });
  darkScheme.addEventListener('change', event => {
    if (!explicitTheme) setTheme(event.matches);
  });
  requestAnimationFrame(() => root.classList.remove('not-ready'));

  const menuButton = document.querySelector('.btn-menu');
  const navigation = document.getElementById('site-navigation');
  if (!menuButton || !navigation) return;

  const setMenu = (open, restoreFocus = false) => {
    const expanded = open && !desktop.matches;
    root.classList.toggle('open', expanded);
    menuButton.setAttribute('aria-expanded', String(expanded));
    menuButton.setAttribute('aria-label', expanded ? '关闭导航' : '打开导航');
    navigation.inert = !desktop.matches && !expanded;
    if (desktop.matches) navigation.removeAttribute('aria-hidden');
    else navigation.setAttribute('aria-hidden', String(!expanded));
    if (expanded) navigation.querySelector('a[href]')?.focus();
    else if (restoreFocus) menuButton.focus();
  };
  setMenu(false);
  menuButton.addEventListener('click', () => setMenu(!root.classList.contains('open')));
  navigation.addEventListener('click', event => {
    if (event.target.closest('a[href]')) setMenu(false, true);
  });
  desktop.addEventListener('change', () => setMenu(false));
  // Restore a predictable closed state when navigating Back from the browser cache.
  window.addEventListener('pageshow', () => setMenu(false));

  const viewCountNodes = [...document.querySelectorAll('[data-goatcounter-count]')];
  const goatCounterScript = document.querySelector('script[data-goatcounter]');
  for (const node of viewCountNodes) {
    const label = node.dataset.goatcounterLabel || '浏览';
    const pending = node.dataset.goatcounterPending || `${label}统计中…`;
    const unavailable = node.dataset.goatcounterUnavailable || `${label}暂不可用`;
    const disabled = node.dataset.goatcounterDisabled || `${label}统计未启用`;
    if (!goatCounterScript) {
      node.textContent = disabled;
      node.dataset.state = 'disabled';
      continue;
    }
    const endpoint = node.dataset.goatcounterEndpoint;
    const path = node.dataset.goatcounterPath || window.location.pathname;
    if (!endpoint || !path) {
      node.textContent = unavailable;
      node.dataset.state = 'unavailable';
      continue;
    }
    node.textContent = pending;
    fetch(`${endpoint}/counter/${encodeURIComponent(path)}.json`, { credentials: 'omit' })
      .then(response => {
        if (!response.ok) throw new Error(`GoatCounter responded with ${response.status}`);
        return response.json();
      })
      .then(data => {
        const count = data.count ?? data.count_unique;
        if (count === undefined) throw new Error('GoatCounter response has no count');
        node.textContent = `${label} ${count}`;
        node.dataset.state = 'ready';
      })
      .catch(() => {
        node.textContent = unavailable;
        node.dataset.state = 'unavailable';
      });
  }
  document.addEventListener('keydown', event => {
    if (!root.classList.contains('open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setMenu(false, true);
      return;
    }
    if (event.key !== 'Tab') return;
    const links = [...navigation.querySelectorAll('a[href]')];
    const last = links.at(-1) || menuButton;
    const active = document.activeElement;
    if (event.shiftKey && (active === menuButton || !navigation.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || (active !== menuButton && !navigation.contains(active)))) {
      event.preventDefault();
      menuButton.focus();
    }
  });
})();
