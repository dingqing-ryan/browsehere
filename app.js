(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const colors = ['#e53935','#8e24aa','#3949ab','#039be5','#00897b','#7cb342','#fb8c00','#795548'];
  const params = new URLSearchParams(location.search);
  const apiBase = document.querySelector('meta[name="catalog-api-base"]')?.content.replace(/\/$/, '') || './mock-api';
  const fallbackCopy = { htmlLang:'en', appName:'Stream Hub', regionLabel:'REGION', subtitle:'Local streaming data for big-screen viewing.', countryNote:'Recommendations for {country}', eyebrow:'LOCAL STREAMING GUIDE', remoteHint:'Use ▲ ▼ ◀ ▶ to navigate', status:'{count} services available', descriptions:{} };
  const pageNavAware = (() => {
    try { return String(window.NaviSwitch?.getCapabilities?.() || '').includes('freestreaming_pagenav_v1'); }
    catch { return false; }
  })();

  function getBareQueryKey() {
    for (const key of params.keys()) if (!params.get(key)) return key.toLowerCase();
    return '';
  }
  function resolveCountry() {
    const requested = (params.get('country') || getBareQueryKey()).trim();
    if (/^[a-z]{2}$/i.test(requested)) return requested.toUpperCase();
    return 'US';
  }
  function catalogFor(payload, code) {
    const country = payload.countries?.find(item => String(item.countryCode).toUpperCase() === code) || payload.countries?.[0] || { country:code, records:[] };
    const sections = new Map();
    for (const record of country.records) {
      const title = record.category || 'Top 50';
      const id = `category-${title}`;
      if (!sections.has(id)) sections.set(id, { id, title, icon:'▦', services:[] });
      sections.get(id).services.push({ id:`${id}-${record.rank}`, name:record.customParameter, url:/^https?:\/\//i.test(record.customParameter) ? record.customParameter : `https://${record.customParameter}`, desc:`#${record.rank} · ${Number(record.eventCount).toLocaleString()} events` });
    }
    return { profile:{ name:country.country, code }, sections:[...sections.values()] };
  }
  function logoLetter(name) { return [...name].find(char => /[\p{L}\p{N}]/u.test(char)) || '▶'; }
  function avatarColor(name) { let hash = 0; for (const char of name) hash = ((hash << 5) - hash + char.codePointAt(0)) | 0; return colors[Math.abs(hash) % colors.length]; }
  function makeCard(service) {
    const link = document.createElement('a'); link.className = 'site-card'; link.href = service.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.dataset.tvZone = 'site'; link.title = `${service.name}（在新标签页打开）`;
    const host = new URL(service.url).hostname;
    link.innerHTML = `<div class="site-card-inner"><div class="avatar" style="--avatar:${avatarColor(service.name)}"><img alt="" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64"></div><div class="site-info"><div class="site-name"></div><div class="site-desc"></div></div></div>`;
    $('.site-name', link).textContent = service.name; $('.site-desc', link).textContent = window.currentCopy.descriptions?.[service.id] || service.desc;
    $('img', link).addEventListener('error', event => { event.currentTarget.remove(); $('.avatar', link).textContent = logoLetter(service.name); }, {once:true});
    return link;
  }
  function render(profile, copy, source, sections) {
    window.currentCopy = copy;
    document.documentElement.lang = copy.htmlLang;
    document.title = `${copy.appName} · ${profile.name}`;
    $('#app-name').textContent = copy.appName; $('#region-label').textContent = copy.regionLabel;
    $('#country-name').textContent = profile.name; $('#country-code').textContent = profile.code;
    $('#page-title').textContent = 'Free Movies-Global Streaming';
    $('#page-subtitle').textContent = copy.subtitle;
    $('#country-note').textContent = copy.countryNote.replace('{country}', profile.name);
    $('#eyebrow').textContent = copy.eyebrow; $('#sidebar-hint').textContent = copy.remoteHint;
    $('#remote-hint').textContent = copy.remoteHint; $('#data-source').textContent = source;
    $('#status-line').textContent = copy.status.replace('{count}', sections.reduce((total, section) => total + section.services.length, 0));
    const menu = $('#sidebar-menu'); const catalog = $('#catalog'); menu.replaceChildren(); catalog.replaceChildren();
    for (const section of sections) {
      const sectionId = `section-${section.id}`; const item = document.createElement('li'); const menuLink = document.createElement('a');
      menuLink.href = `#${sectionId}`; menuLink.dataset.tvZone = 'category'; menuLink.dataset.section = section.id; menuLink.innerHTML = `<span class="menu-icon">${section.icon}</span><span>${section.title}</span>`; item.append(menuLink); menu.append(item);
      const block = document.createElement('section'); block.className = 'section'; block.id = sectionId;
      const header = document.createElement('div'); header.className = 'section-header'; header.innerHTML = `<span class="section-icon">${section.icon}</span><h2></h2>`; $('h2', header).textContent = section.title;
      const grid = document.createElement('div'); grid.className = 'site-grid'; section.services.forEach(service => { const card = makeCard(service); card.dataset.section = section.id; grid.append(card); }); block.append(header, grid); catalog.append(block);
    }
    document.querySelectorAll('.sidebar-menu a').forEach(link => link.addEventListener('click', () => { $('#sidebar').classList.remove('open'); $('#menu-toggle').setAttribute('aria-expanded', 'false'); }));
  }
  $('#menu-toggle').addEventListener('click', () => { const open = $('#sidebar').classList.toggle('open'); $('#menu-toggle').setAttribute('aria-expanded', String(open)); });

  async function fetchJson(path, base = apiBase) {
    const response = await fetch(`${base}/${path}`, { cache:'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
  async function loadAndRender() {
    const code = resolveCountry(); let payload;
    try {
      const manifest = await fetchJson('manifest.json');
      const entry = manifest.countries?.find(item => String(item.countryCode).toUpperCase() === code);
      if (!entry) throw new Error(`No country data for ${code}`);
      payload = await fetchJson(entry.file);
    }
    catch { payload = { countries:[{ country:code, countryCode:code, records:[] }] }; }
    const { profile, sections } = catalogFor(payload, code);
    const locale = ({ CN:'zh-CN', JP:'ja', ES:'es', IN:'hi' })[code] || 'en';
    let copy;
    try { copy = await fetchJson(`${locale}.json`, './mock-api/locales'); }
    catch { copy = fallbackCopy; }
    render(profile, copy, `ANALYTICS JSON · ${payload.generatedAt || 'UNAVAILABLE'}`, sections);
  }

  // TV remote: use viewport geometry rather than DOM order, so four-column cards
  // behave naturally with ↑ ↓ ← →. This is only activated after remote input.
  function initTvNavigation() {
    const navKeys = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' ']);
    let tvMode = false;
    let focused = null;
    const items = () => [...document.querySelectorAll('[data-tv-zone]')].filter(el => el.getClientRects().length);
    const center = (el) => { const r = el.getBoundingClientRect(); return { x:r.left + r.width / 2, y:r.top + r.height / 2, r }; };
    const setFocus = (el) => {
      if (!el) return;
      document.body.classList.toggle('tv-content-focus', el.dataset.tvZone === 'site');
      focused?.classList.remove('tv-focused'); focused = el; focused.classList.add('tv-focused');
      focused.focus({ preventScroll:true }); centerFocusedCard(); requestAnimationFrame(centerFocusedCard);
    };
    const centerFocusedCard = () => {
      if (focused?.dataset.tvZone !== 'site') return;
      const scroller = pageNavAware ? $('#main-content') : document.scrollingElement;
      const rect = focused.getBoundingClientRect();
      const viewportTop = pageNavAware ? scroller.getBoundingClientRect().top : 0;
      const cards = items().filter(el => el.dataset.tvZone === 'site');
      const max = scroller.scrollHeight - scroller.clientHeight;
      const target = focused === cards[0] ? 0 : focused === cards.at(-1) ? max : scroller.scrollTop + rect.top - viewportTop - (scroller.clientHeight - rect.height) / 2;
      scroller.scrollTop = Math.max(0, Math.min(target, max));
    };
    const nextInDirection = (current, direction) => {
      if (current.dataset.tvZone === 'category' && direction === 'ArrowRight') return document.querySelector(`[data-tv-zone="site"][data-section="${current.dataset.section}"]`);
      if (current.dataset.tvZone === 'site' && direction === 'ArrowLeft') return document.querySelector(`[data-tv-zone="category"][data-section="${current.dataset.section}"]`);
      const from = center(current); let winner = null; let best = Infinity;
      const currentZone = current.dataset.tvZone;
      const candidates = items().filter(candidate => currentZone === 'site'
        ? candidate.dataset.tvZone === 'site' || direction === 'ArrowLeft' && candidate.dataset.tvZone === 'category'
        : direction === 'ArrowRight' ? candidate.dataset.tvZone === 'site' : candidate.dataset.tvZone === 'category');
      for (const candidate of candidates) {
        if (candidate === current) continue;
        const to = center(candidate); const dx = to.x - from.x; const dy = to.y - from.y;
        const primary = direction === 'ArrowLeft' ? -dx : direction === 'ArrowRight' ? dx : direction === 'ArrowUp' ? -dy : dy;
        const secondary = ['ArrowLeft', 'ArrowRight'].includes(direction) ? Math.abs(dy) : Math.abs(dx);
        if (primary <= 5) continue;
        // Primary direction wins; the secondary distance keeps movement in the nearest row/column.
        const score = primary + secondary * 2.5;
        if (score < best) { best = score; winner = candidate; }
      }
      return winner;
    };
    const handoffToToolbar = () => {
      if (!pageNavAware || !window.NaviSwitch?.requestNavBarFocus) return;
      const { x } = center(focused); const payload = { site:'free_streaming_websites', routeKey:location.pathname + location.search + location.hash, xRatio:Math.max(0, Math.min(1, x / innerWidth)), zone:'catalog-top', timestamp:Date.now() };
      try { window.NaviSwitch.requestNavBarFocus(JSON.stringify(payload)); } catch { /* host bridge is optional */ }
    };
    document.addEventListener('keydown', (event) => {
      if (!navKeys.has(event.key)) return;
      tvMode = true; document.body.classList.add('tv-nav-active');
      if (!focused || !document.contains(focused)) {
        setFocus(items()[0]);
        event.preventDefault(); event.stopPropagation();
        return;
      }
      if (event.key.startsWith('Arrow')) {
        const target = nextInDirection(focused, event.key);
        if (target) setFocus(target); else if (event.key === 'ArrowUp') handoffToToolbar();
        event.preventDefault(); event.stopPropagation(); return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        focused.click(); event.preventDefault(); event.stopPropagation();
      }
    }, true);
    document.addEventListener('mousedown', () => { if (tvMode) { tvMode = false; document.body.classList.remove('tv-nav-active', 'tv-content-focus'); focused?.classList.remove('tv-focused'); focused = null; } });
    if (pageNavAware) {
      document.documentElement.classList.add('tv-pagenav');
      window.__TV_PAGE_NAV_BRIDGE__ = {
        restoreFromToolbar: () => { setFocus(focused || items()[0]); return true; },
        restoreAfterBrowserChrome: () => { setFocus(focused || items()[0]); return true; },
        clearSession: () => true
      };
      try { window.NaviSwitch?.setPageNavMode?.(); } catch { /* optional native host */ }
    }
  }
  initTvNavigation();
  loadAndRender();
})();
