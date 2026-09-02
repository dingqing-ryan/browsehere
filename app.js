(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const colors = ['#e53935','#8e24aa','#3949ab','#039be5','#00897b','#7cb342','#fb8c00','#795548'];
  const params = new URLSearchParams(location.search);
  const apiBase = document.querySelector('meta[name="catalog-api-base"]')?.content.replace(/\/$/, '') || './mock-api';
  // UI copy is bundled: country changes only require the catalog JSON request, not a
  // second locale request. Intl supplies the likely language for each ISO country.
  const uiCopy = {
    en:{regionLabel:'REGION',subtitle:'Your free window to the world’s best streaming.',countryNote:'Recommendations for {country}',eyebrow:'LOCAL STREAMING GUIDE',remoteHint:'Use ▲ ▼ ◀ ▶ to navigate',status:'{count} services available',footer:'Streaming catalog demo · Official services and clearly free content only.'},
    zh:{regionLabel:'当前地区',subtitle:'免费开启你的全球流媒体视界。',countryNote:'正在展示 {country} 的推荐',eyebrow:'本地化流媒体指南',remoteHint:'使用 ▲ ▼ ◀ ▶ 遥控器导航',status:'当前可浏览 {count} 个服务',footer:'流媒体目录演示 · 仅收录官方或明确提供免费内容的平台'},
    ja:{regionLabel:'地域',subtitle:'無料で、世界のストリーミングへ。',countryNote:'{country} 向けのおすすめ',eyebrow:'ローカル・ストリーミングガイド',remoteHint:'▲ ▼ ◀ ▶ で操作',status:'{count} 件のサービスを利用できます',footer:'ストリーミング・カタログ · 公式または無料提供が明確なサービスのみを掲載'},
    ko:{regionLabel:'지역',subtitle:'무료로 즐기는 세계 최고의 스트리밍.',countryNote:'{country} 맞춤 추천',eyebrow:'현지 스트리밍 가이드',remoteHint:'▲ ▼ ◀ ▶ 로 이동',status:'이용 가능한 서비스 {count}개',footer:'스트리밍 카탈로그 · 공식 또는 무료 제공이 명확한 서비스만 수록'},
    pt:{regionLabel:'REGIÃO',subtitle:'A sua janela gratuita para o melhor streaming do mundo.',countryNote:'Recomendações para {country}',eyebrow:'GUIA LOCAL DE STREAMING',remoteHint:'Use ▲ ▼ ◀ ▶ para navegar',status:'{count} serviços disponíveis',footer:'Catálogo de streaming · Apenas serviços oficiais ou claramente gratuitos.'},
    es:{regionLabel:'REGIÓN',subtitle:'Tu ventana gratuita al mejor streaming del mundo.',countryNote:'Recomendaciones para {country}',eyebrow:'GUÍA LOCAL DE STREAMING',remoteHint:'Usa ▲ ▼ ◀ ▶ para navegar',status:'{count} servicios disponibles',footer:'Catálogo de streaming · Solo servicios oficiales o con contenido claramente gratuito.'},
    fr:{regionLabel:'RÉGION',subtitle:'Votre fenêtre gratuite sur le meilleur du streaming mondial.',countryNote:'Recommandations pour {country}',eyebrow:'GUIDE LOCAL DU STREAMING',remoteHint:'Utilisez ▲ ▼ ◀ ▶ pour naviguer',status:'{count} services disponibles',footer:'Catalogue de streaming · Services officiels ou proposant clairement du contenu gratuit.'},
    de:{regionLabel:'REGION',subtitle:'Ihr kostenloses Fenster zum besten Streaming der Welt.',countryNote:'Empfehlungen für {country}',eyebrow:'LOKALER STREAMING-GUIDE',remoteHint:'Mit ▲ ▼ ◀ ▶ navigieren',status:'{count} Dienste verfügbar',footer:'Streaming-Katalog · Nur offizielle oder eindeutig kostenlose Angebote.'},
    it:{regionLabel:'REGIONE',subtitle:'La tua finestra gratuita sul miglior streaming del mondo.',countryNote:'Consigli per {country}',eyebrow:'GUIDA LOCALE ALLO STREAMING',remoteHint:'Usa ▲ ▼ ◀ ▶ per navigare',status:'{count} servizi disponibili',footer:'Catalogo streaming · Solo servizi ufficiali o chiaramente gratuiti.'},
    ru:{regionLabel:'РЕГИОН',subtitle:'Бесплатное окно в лучший мировой стриминг.',countryNote:'Рекомендации для {country}',eyebrow:'МЕСТНЫЙ ГИД ПО СТРИМИНГУ',remoteHint:'Используйте ▲ ▼ ◀ ▶ для навигации',status:'Доступно сервисов: {count}',footer:'Каталог стримингов · Только официальные или явно бесплатные сервисы.'},
    ar:{regionLabel:'المنطقة',subtitle:'نافذتك المجانية إلى أفضل البث العالمي.',countryNote:'توصيات لـ {country}',eyebrow:'دليل البث المحلي',remoteHint:'استخدم ▲ ▼ ◀ ▶ للتنقل',status:'{count} خدمة متاحة',footer:'دليل البث · خدمات رسمية أو تقدم محتوى مجانيًا بوضوح.'},
    hi:{regionLabel:'क्षेत्र',subtitle:'दुनिया की बेहतरीन स्ट्रीमिंग तक आपकी निःशुल्क खिड़की।',countryNote:'{country} के लिए सुझाव',eyebrow:'स्थानीय स्ट्रीमिंग गाइड',remoteHint:'नेविगेट करने के लिए ▲ ▼ ◀ ▶ दबाएँ',status:'{count} सेवाएँ उपलब्ध हैं',footer:'स्ट्रीमिंग कैटलॉग · केवल आधिकारिक या स्पष्ट रूप से मुफ्त सेवाएँ।'},
    th:{regionLabel:'ภูมิภาค',subtitle:'หน้าต่างฟรีสู่สตรีมมิงที่ดีที่สุดจากทั่วโลก',countryNote:'คำแนะนำสำหรับ {country}',eyebrow:'คู่มือสตรีมมิงท้องถิ่น',remoteHint:'ใช้ ▲ ▼ ◀ ▶ เพื่อนำทาง',status:'มีบริการ {count} รายการ',footer:'แค็ตตาล็อกสตรีมมิง · รวมเฉพาะบริการทางการหรือที่ระบุว่าฟรีชัดเจน'},
    tr:{regionLabel:'BÖLGE',subtitle:'Dünyanın en iyi yayınlarına açılan ücretsiz pencereniz.',countryNote:'{country} için öneriler',eyebrow:'YEREL YAYIN REHBERİ',remoteHint:'Gezinmek için ▲ ▼ ◀ ▶ kullanın',status:'{count} hizmet mevcut',footer:'Yayın kataloğu · Yalnızca resmi veya açıkça ücretsiz hizmetler.'},
    vi:{regionLabel:'KHU VỰC',subtitle:'Cánh cửa miễn phí đến những nội dung phát trực tuyến hay nhất thế giới.',countryNote:'Gợi ý cho {country}',eyebrow:'CẨM NANG PHÁT TRỰC TUYẾN ĐỊA PHƯƠNG',remoteHint:'Dùng ▲ ▼ ◀ ▶ để điều hướng',status:'Có {count} dịch vụ',footer:'Danh mục phát trực tuyến · Chỉ gồm dịch vụ chính thức hoặc có nội dung miễn phí rõ ràng.'},
    id:{regionLabel:'WILAYAH',subtitle:'Jendela gratis Anda menuju streaming terbaik dunia.',countryNote:'Rekomendasi untuk {country}',eyebrow:'PANDUAN STREAMING LOKAL',remoteHint:'Gunakan ▲ ▼ ◀ ▶ untuk menavigasi',status:'{count} layanan tersedia',footer:'Katalog streaming · Hanya layanan resmi atau yang jelas menyediakan konten gratis.'},
    nl:{regionLabel:'REGIO',subtitle:'Uw gratis venster naar de beste streaming ter wereld.',countryNote:'Aanbevelingen voor {country}',eyebrow:'LOKALE STREAMINGGIDS',remoteHint:'Gebruik ▲ ▼ ◀ ▶ om te navigeren',status:'{count} diensten beschikbaar',footer:'Streamingcatalogus · Alleen officiële diensten of diensten met duidelijk gratis aanbod.'},
    pl:{regionLabel:'REGION',subtitle:'Twoje bezpłatne okno na najlepszy streaming świata.',countryNote:'Polecane dla: {country}',eyebrow:'LOKALNY PRZEWODNIK STREAMINGOWY',remoteHint:'Użyj ▲ ▼ ◀ ▶, aby nawigować',status:'Dostępnych usług: {count}',footer:'Katalog streamingowy · Tylko oficjalne lub wyraźnie bezpłatne usługi.'},
    uk:{regionLabel:'РЕГІОН',subtitle:'Ваш безкоштовний доступ до найкращого світового стримінгу.',countryNote:'Рекомендації для {country}',eyebrow:'МІСЦЕВИЙ ГІД ЗІ СТРІМІНГУ',remoteHint:'Використовуйте ▲ ▼ ◀ ▶ для навігації',status:'Доступно сервісів: {count}',footer:'Каталог стримінгу · Лише офіційні або явно безкоштовні сервіси.'},
    fa:{regionLabel:'منطقه',subtitle:'پنجره رایگان شما به بهترین پخش‌های جهان.',countryNote:'پیشنهادها برای {country}',eyebrow:'راهنمای پخش محلی',remoteHint:'برای پیمایش از ▲ ▼ ◀ ▶ استفاده کنید',status:'{count} سرویس در دسترس است',footer:'فهرست پخش · فقط سرویس‌های رسمی یا سرویس‌های آشکارا رایگان.'},
    he:{regionLabel:'אזור',subtitle:'החלון החינמי שלכם לטוב ביותר בסטרימינג העולמי.',countryNote:'המלצות עבור {country}',eyebrow:'מדריך סטרימינג מקומי',remoteHint:'השתמשו ב־▲ ▼ ◀ ▶ לניווט',status:'{count} שירותים זמינים',footer:'קטלוג סטרימינג · שירותים רשמיים או כאלה שמציעים תוכן חינמי בבירור.'},
    ms:{regionLabel:'WILAYAH',subtitle:'Tingkap percuma anda ke penstriman terbaik dunia.',countryNote:'Cadangan untuk {country}',eyebrow:'PANDUAN PENSTRIMAN TEMPATAN',remoteHint:'Gunakan ▲ ▼ ◀ ▶ untuk navigasi',status:'{count} perkhidmatan tersedia',footer:'Katalog penstriman · Hanya perkhidmatan rasmi atau jelas menyediakan kandungan percuma.'},
    sw:{regionLabel:'ENEO',subtitle:'Dirisha lako la bure kuelekea utiririshaji bora duniani.',countryNote:'Mapendekezo kwa {country}',eyebrow:'MWONGOZO WA UTIRIRISHAJI WA ENEO HUSIKA',remoteHint:'Tumia ▲ ▼ ◀ ▶ kuvinjari',status:'Huduma {count} zinapatikana',footer:'Orodha ya utiririshaji · Huduma rasmi au zinazotoa maudhui ya bure waziwazi pekee.'}
  };
  const fallbackCopy = { htmlLang:'en', ...uiCopy.en, descriptions:{} };
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
  function localeForCountry(code) {
    try {
      const locale = new Intl.Locale(`und-${code}`).maximize();
      return { language:locale.language, htmlLang:locale.toString() };
    } catch { return { language:'en', htmlLang:'en' }; }
  }
  function copyForCountry(code) {
    const { language, htmlLang } = localeForCountry(code);
    return { ...fallbackCopy, ...(uiCopy[language] || uiCopy.en), htmlLang };
  }
  function localizedCountryName(code, fallback, locale) {
    try { return new Intl.DisplayNames([locale], { type:'region' }).of(code) || fallback; }
    catch { return fallback; }
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
    const link = document.createElement('a'); link.className = 'site-card'; link.href = service.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.dataset.tvZone = 'site'; link.title = service.name;
    const host = new URL(service.url).hostname;
    link.innerHTML = `<div class="site-card-inner"><div class="avatar" style="--avatar:${avatarColor(service.name)}"><img alt="" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64"></div><div class="site-info"><div class="site-name"></div><div class="site-desc"></div></div></div>`;
    $('.site-name', link).textContent = service.name; $('.site-desc', link).textContent = window.currentCopy.descriptions?.[service.id] || service.desc;
    $('img', link).addEventListener('error', event => { event.currentTarget.remove(); $('.avatar', link).textContent = logoLetter(service.name); }, {once:true});
    return link;
  }
  function render(profile, copy, source, sections) {
    window.currentCopy = copy;
    document.documentElement.lang = copy.htmlLang;
    document.title = `Stream Hub · ${profile.name}`;
    $('#app-name').textContent = 'Stream Hub'; $('#region-label').textContent = copy.regionLabel;
    $('#country-name').textContent = profile.name; $('#country-code').textContent = profile.code;
    $('#page-title').textContent = 'Free Movies-Global Streaming';
    $('#page-subtitle').textContent = copy.subtitle;
    $('#country-note').textContent = copy.countryNote.replace('{country}', profile.name);
    $('#eyebrow').textContent = copy.eyebrow; $('#sidebar-hint').textContent = copy.remoteHint;
    $('#remote-hint').textContent = copy.remoteHint; $('#data-source').textContent = source; $('#site-footer').textContent = copy.footer;
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
    const copy = copyForCountry(code);
    profile.name = localizedCountryName(code, profile.name, copy.htmlLang);
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
