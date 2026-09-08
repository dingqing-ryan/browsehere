(() => {
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const colors = ['#e53935','#8e24aa','#3949ab','#039be5','#00897b','#7cb342','#fb8c00','#795548'];
  const numberFormat = new Intl.NumberFormat();
  const params = new URLSearchParams(location.search);
  const apiBase = document.querySelector('meta[name="catalog-api-base"]')?.content.replace(/\/$/, '') || './mock-api';
  // UI copy is bundled: country changes only require the catalog JSON request, not a
  // second locale request. Intl supplies the likely language for each ISO country.
  const uiCopy = {
    en:{regionLabel:'REGION',subtitle:'Your free window to the world’s best streaming.',countryNote:'Recommendations for {country}',eyebrow:'LOCAL STREAMING GUIDE',remoteHint:'Use ▲ ▼ ◀ ▶ to navigate',status:'{count} services available',footer:'Streaming Website Guide Hub Design by ❤️'},
    zh:{regionLabel:'当前地区',subtitle:'免费开启你的全球流媒体视界。',countryNote:'正在展示 {country} 的推荐',eyebrow:'本地化流媒体指南',remoteHint:'使用 ▲ ▼ ◀ ▶ 遥控器导航',status:'当前可浏览 {count} 个服务',footer:'流媒体网站指南中心 · 用 ❤️ 设计'},
    ja:{regionLabel:'地域',subtitle:'無料で、世界のストリーミングへ。',countryNote:'{country} 向けのおすすめ',eyebrow:'ローカル・ストリーミングガイド',remoteHint:'▲ ▼ ◀ ▶ で操作',status:'{count} 件のサービスを利用できます',footer:'ストリーミングサイトガイドハブ · ❤️ を込めてデザイン'},
    ko:{regionLabel:'지역',subtitle:'무료로 즐기는 세계 최고의 스트리밍.',countryNote:'{country} 맞춤 추천',eyebrow:'현지 스트리밍 가이드',remoteHint:'▲ ▼ ◀ ▶ 로 이동',status:'이용 가능한 서비스 {count}개',footer:'스트리밍 웹사이트 가이드 허브 · ❤️로 디자인'},
    pt:{regionLabel:'REGIÃO',subtitle:'A sua janela gratuita para o melhor streaming do mundo.',countryNote:'Recomendações para {country}',eyebrow:'GUIA LOCAL DE STREAMING',remoteHint:'Use ▲ ▼ ◀ ▶ para navegar',status:'{count} serviços disponíveis',footer:'Central de Guias de Sites de Streaming · Design com ❤️'},
    es:{regionLabel:'REGIÓN',subtitle:'Tu ventana gratuita al mejor streaming del mundo.',countryNote:'Recomendaciones para {country}',eyebrow:'GUÍA LOCAL DE STREAMING',remoteHint:'Usa ▲ ▼ ◀ ▶ para navegar',status:'{count} servicios disponibles',footer:'Centro de Guías de Sitios de Streaming · Diseño con ❤️'},
    fr:{regionLabel:'RÉGION',subtitle:'Votre fenêtre gratuite sur le meilleur du streaming mondial.',countryNote:'Recommandations pour {country}',eyebrow:'GUIDE LOCAL DU STREAMING',remoteHint:'Utilisez ▲ ▼ ◀ ▶ pour naviguer',status:'{count} services disponibles',footer:'Hub de guides des sites de streaming · Conçu avec ❤️'},
    de:{regionLabel:'REGION',subtitle:'Ihr kostenloses Fenster zum besten Streaming der Welt.',countryNote:'Empfehlungen für {country}',eyebrow:'LOKALER STREAMING-GUIDE',remoteHint:'Mit ▲ ▼ ◀ ▶ navigieren',status:'{count} Dienste verfügbar',footer:'Streaming-Website-Guide-Hub · Mit ❤️ gestaltet'},
    it:{regionLabel:'REGIONE',subtitle:'La tua finestra gratuita sul miglior streaming del mondo.',countryNote:'Consigli per {country}',eyebrow:'GUIDA LOCALE ALLO STREAMING',remoteHint:'Usa ▲ ▼ ◀ ▶ per navigare',status:'{count} servizi disponibili',footer:'Hub guida ai siti di streaming · Realizzato con ❤️'},
    ru:{regionLabel:'РЕГИОН',subtitle:'Бесплатное окно в лучший мировой стриминг.',countryNote:'Рекомендации для {country}',eyebrow:'МЕСТНЫЙ ГИД ПО СТРИМИНГУ',remoteHint:'Используйте ▲ ▼ ◀ ▶ для навигации',status:'Доступно сервисов: {count}',footer:'Центр гидов по стриминговым сайтам · Создано с ❤️'},
    ar:{regionLabel:'المنطقة',subtitle:'نافذتك المجانية إلى أفضل البث العالمي.',countryNote:'توصيات لـ {country}',eyebrow:'دليل البث المحلي',remoteHint:'استخدم ▲ ▼ ◀ ▶ للتنقل',status:'{count} خدمة متاحة',footer:'مركز دليل مواقع البث · صُمم بـ ❤️'},
    hi:{regionLabel:'क्षेत्र',subtitle:'दुनिया की बेहतरीन स्ट्रीमिंग तक आपकी निःशुल्क खिड़की।',countryNote:'{country} के लिए सुझाव',eyebrow:'स्थानीय स्ट्रीमिंग गाइड',remoteHint:'नेविगेट करने के लिए ▲ ▼ ◀ ▶ दबाएँ',status:'{count} सेवाएँ उपलब्ध हैं',footer:'स्ट्रीमिंग वेबसाइट गाइड हब · ❤️ के साथ डिज़ाइन किया गया'},
    th:{regionLabel:'ภูมิภาค',subtitle:'หน้าต่างฟรีสู่สตรีมมิงที่ดีที่สุดจากทั่วโลก',countryNote:'คำแนะนำสำหรับ {country}',eyebrow:'คู่มือสตรีมมิงท้องถิ่น',remoteHint:'ใช้ ▲ ▼ ◀ ▶ เพื่อนำทาง',status:'มีบริการ {count} รายการ',footer:'ศูนย์คู่มือเว็บไซต์สตรีมมิง · ออกแบบด้วย ❤️'},
    tr:{regionLabel:'BÖLGE',subtitle:'Dünyanın en iyi yayınlarına açılan ücretsiz pencereniz.',countryNote:'{country} için öneriler',eyebrow:'YEREL YAYIN REHBERİ',remoteHint:'Gezinmek için ▲ ▼ ◀ ▶ kullanın',status:'{count} hizmet mevcut',footer:'Yayın Web Sitesi Rehberi Merkezi · ❤️ ile tasarlandı'},
    vi:{regionLabel:'KHU VỰC',subtitle:'Cánh cửa miễn phí đến những nội dung phát trực tuyến hay nhất thế giới.',countryNote:'Gợi ý cho {country}',eyebrow:'CẨM NANG PHÁT TRỰC TUYẾN ĐỊA PHƯƠNG',remoteHint:'Dùng ▲ ▼ ◀ ▶ để điều hướng',status:'Có {count} dịch vụ',footer:'Trung tâm hướng dẫn trang web phát trực tuyến · Thiết kế với ❤️'},
    id:{regionLabel:'WILAYAH',subtitle:'Jendela gratis Anda menuju streaming terbaik dunia.',countryNote:'Rekomendasi untuk {country}',eyebrow:'PANDUAN STREAMING LOKAL',remoteHint:'Gunakan ▲ ▼ ◀ ▶ untuk menavigasi',status:'{count} layanan tersedia',footer:'Pusat Panduan Situs Streaming · Dirancang dengan ❤️'},
    nl:{regionLabel:'REGIO',subtitle:'Uw gratis venster naar de beste streaming ter wereld.',countryNote:'Aanbevelingen voor {country}',eyebrow:'LOKALE STREAMINGGIDS',remoteHint:'Gebruik ▲ ▼ ◀ ▶ om te navigeren',status:'{count} diensten beschikbaar',footer:'Streamingwebsite-gidshub · Ontworpen met ❤️'},
    pl:{regionLabel:'REGION',subtitle:'Twoje bezpłatne okno na najlepszy streaming świata.',countryNote:'Polecane dla: {country}',eyebrow:'LOKALNY PRZEWODNIK STREAMINGOWY',remoteHint:'Użyj ▲ ▼ ◀ ▶, aby nawigować',status:'Dostępnych usług: {count}',footer:'Centrum przewodników po serwisach streamingowych · Zaprojektowane z ❤️'},
    uk:{regionLabel:'РЕГІОН',subtitle:'Ваш безкоштовний доступ до найкращого світового стримінгу.',countryNote:'Рекомендації для {country}',eyebrow:'МІСЦЕВИЙ ГІД ЗІ СТРІМІНГУ',remoteHint:'Використовуйте ▲ ▼ ◀ ▶ для навігації',status:'Доступно сервісів: {count}',footer:'Центр гідів зі стримінгових сайтів · Створено з ❤️'},
    fa:{regionLabel:'منطقه',subtitle:'پنجره رایگان شما به بهترین پخش‌های جهان.',countryNote:'پیشنهادها برای {country}',eyebrow:'راهنمای پخش محلی',remoteHint:'برای پیمایش از ▲ ▼ ◀ ▶ استفاده کنید',status:'{count} سرویس در دسترس است',footer:'مرکز راهنمای وب‌سایت‌های پخش · طراحی‌شده با ❤️'},
    he:{regionLabel:'אזור',subtitle:'החלון החינמי שלכם לטוב ביותר בסטרימינג העולמי.',countryNote:'המלצות עבור {country}',eyebrow:'מדריך סטרימינג מקומי',remoteHint:'השתמשו ב־▲ ▼ ◀ ▶ לניווט',status:'{count} שירותים זמינים',footer:'מרכז מדריכי אתרי סטרימינג · עוצב עם ❤️'},
    ms:{regionLabel:'WILAYAH',subtitle:'Tingkap percuma anda ke penstriman terbaik dunia.',countryNote:'Cadangan untuk {country}',eyebrow:'PANDUAN PENSTRIMAN TEMPATAN',remoteHint:'Gunakan ▲ ▼ ◀ ▶ untuk navigasi',status:'{count} perkhidmatan tersedia',footer:'Hab Panduan Laman Web Penstriman · Direka dengan ❤️'},
    sw:{regionLabel:'ENEO',subtitle:'Dirisha lako la bure kuelekea utiririshaji bora duniani.',countryNote:'Mapendekezo kwa {country}',eyebrow:'MWONGOZO WA UTIRIRISHAJI WA ENEO HUSIKA',remoteHint:'Tumia ▲ ▼ ◀ ▶ kuvinjari',status:'Huduma {count} zinapatikana',footer:'Kitovu cha Mwongozo wa Tovuti za Utiririshaji · Imeundwa kwa ❤️'}
  };
  const categoryCopy = {
    en:{'新闻':'News','电影':'Movies','直播':'Live','运动':'Sports'}, zh:{'新闻':'新闻','电影':'电影','直播':'直播','运动':'运动'},
    ja:{'新闻':'ニュース','电影':'映画','直播':'ライブ','运动':'スポーツ'}, ko:{'新闻':'뉴스','电影':'영화','直播':'라이브','运动':'스포츠'},
    pt:{'新闻':'Notícias','电影':'Filmes','直播':'Ao vivo','运动':'Desporto'}, es:{'新闻':'Noticias','电影':'Películas','直播':'En directo','运动':'Deportes'},
    fr:{'新闻':'Actualités','电影':'Films','直播':'En direct','运动':'Sports'}, de:{'新闻':'Nachrichten','电影':'Filme','直播':'Live','运动':'Sport'},
    it:{'新闻':'Notizie','电影':'Film','直播':'Dirette','运动':'Sport'}, ru:{'新闻':'Новости','电影':'Фильмы','直播':'Прямой эфир','运动':'Спорт'},
    ar:{'新闻':'الأخبار','电影':'أفلام','直播':'مباشر','运动':'رياضة'}, hi:{'新闻':'समाचार','电影':'फ़िल्में','直播':'लाइव','运动':'खेल'},
    th:{'新闻':'ข่าว','电影':'ภาพยนตร์','直播':'ถ่ายทอดสด','运动':'กีฬา'}, tr:{'新闻':'Haberler','电影':'Filmler','直播':'Canlı','运动':'Spor'},
    vi:{'新闻':'Tin tức','电影':'Phim','直播':'Trực tiếp','运动':'Thể thao'}, id:{'新闻':'Berita','电影':'Film','直播':'Langsung','运动':'Olahraga'},
    nl:{'新闻':'Nieuws','电影':'Films','直播':'Live','运动':'Sport'}, pl:{'新闻':'Wiadomości','电影':'Filmy','直播':'Na żywo','运动':'Sport'},
    uk:{'新闻':'Новини','电影':'Фільми','直播':'Наживо','运动':'Спорт'}, fa:{'新闻':'اخبار','电影':'فیلم‌ها','直播':'زنده','运动':'ورزش'},
    he:{'新闻':'חדשות','电影':'סרטים','直播':'בשידור חי','运动':'ספורט'}, ms:{'新闻':'Berita','电影':'Filem','直播':'Langsung','运动':'Sukan'},
    sw:{'新闻':'Habari','电影':'Filamu','直播':'Moja kwa moja','运动':'Michezo'}
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
  async function resolveCountry() {
    const requested = (params.get('country') || getBareQueryKey()).trim();
    if (/^[a-z]{2}$/i.test(requested)) return requested.toUpperCase();
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 2500);
    try {
      const response = await fetch('https://api.ipquery.io/?format=json', { cache:'no-store', signal:controller.signal });
      const code = String((await response.json()).location?.country_code || '');
      if (/^[a-z]{2}$/i.test(code)) return code.toUpperCase();
    } catch { /* Use the catalog fallback when IP lookup is unavailable. */ }
    finally { clearTimeout(timeout); }
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
    return { ...fallbackCopy, ...(uiCopy[language] || uiCopy.en), language, htmlLang };
  }
  function localizedCategory(title, language) {
    return title === 'Top 50' ? title : (categoryCopy[language] || categoryCopy.en)[title] || title;
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
      const url = record.country_official_url || record.customParameter;
      sections.get(id).services.push({ id:`${id}-${record.rank}`, name:record.title || record.customParameter, url:/^https?:\/\//i.test(url) ? url : `https://${url}`, desc:record.isCountryOfficial ? 'Official website' : `#${record.rank} · ${numberFormat.format(Number(record.eventCount))} events` });
    }
    const list = [...sections.values()]; const top = list.findIndex(section => section.title === 'Top 50');
    if (top > 0) list.unshift(list.splice(top, 1)[0]);
    return { profile:{ name:country.country, code }, sections:list };
  }
  function logoLetter(name) { return [...name].find(char => /[\p{L}\p{N}]/u.test(char)) || '▶'; }
  function avatarColor(name) { let hash = 0; for (const char of name) hash = ((hash << 5) - hash + char.codePointAt(0)) | 0; return colors[Math.abs(hash) % colors.length]; }
  function makeCard(service) {
    const link = document.createElement('a'); link.className = 'site-card'; link.href = service.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.dataset.tvZone = 'site'; link.title = service.name;
    const host = new URL(service.url).hostname;
    link.innerHTML = `<div class="site-card-inner"><div class="avatar" style="--avatar:${avatarColor(service.name)}"><img alt="" loading="lazy" decoding="async" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64"></div><div class="site-info"><div class="site-name"></div><div class="site-desc"></div></div></div>`;
    $('.site-name', link).textContent = service.name; $('.site-desc', link).textContent = window.currentCopy.descriptions?.[service.id] || service.desc;
    $('img', link).addEventListener('error', event => { event.currentTarget.remove(); $('.avatar', link).textContent = logoLetter(service.name); }, {once:true});
    return link;
  }
  function render(profile, copy, sections) {
    window.currentCopy = copy;
    document.documentElement.lang = copy.htmlLang;
    document.title = `Stream Hub · ${profile.name}`;
    $('#app-name').textContent = 'Stream Hub'; $('#region-label').textContent = copy.regionLabel;
    $('#country-name').textContent = profile.name; $('#country-code').textContent = profile.code;
    $('#page-title').textContent = 'Streaming Website Guide Hub';
    $('#page-subtitle').textContent = copy.subtitle;
    $('#country-note').textContent = copy.countryNote.replace('{country}', profile.name);
    $('#eyebrow').textContent = copy.eyebrow; $('#sidebar-hint').textContent = copy.remoteHint;
    $('#remote-hint').textContent = copy.remoteHint; $('#site-footer').textContent = copy.footer;
    $('#status-line').textContent = copy.status.replace('{count}', sections.reduce((total, section) => total + section.services.length, 0));
    const menu = $('#sidebar-menu'); const catalog = $('#catalog'); menu.replaceChildren(); catalog.replaceChildren();
    for (const section of sections) {
      const label = localizedCategory(section.title, copy.language);
      const sectionId = `section-${section.id}`; const item = document.createElement('li'); const menuLink = document.createElement('a');
      menuLink.href = `#${sectionId}`; menuLink.dataset.tvZone = 'category'; menuLink.dataset.section = section.id; menuLink.innerHTML = `<span class="menu-icon">${section.icon}</span><span>${label}</span>`; item.append(menuLink); menu.append(item);
      const block = document.createElement('section'); block.className = 'section'; block.id = sectionId;
      const header = document.createElement('div'); header.className = 'section-header'; header.innerHTML = `<span class="section-icon">${section.icon}</span><h2></h2>`; $('h2', header).textContent = label;
      const grid = document.createElement('div'); grid.className = 'site-grid'; section.services.forEach(service => { const card = makeCard(service); card.dataset.section = section.id; grid.append(card); }); block.append(header, grid); catalog.append(block);
    }
    document.querySelectorAll('.sidebar-menu a').forEach(link => link.addEventListener('click', () => { $('#sidebar').classList.remove('open'); $('#menu-toggle').setAttribute('aria-expanded', 'false'); }));
  }
  $('#menu-toggle').addEventListener('click', () => { const open = $('#sidebar').classList.toggle('open'); $('#menu-toggle').setAttribute('aria-expanded', String(open)); });

  async function fetchJson(path, base = apiBase) {
    const response = await fetch(`${base}/${path}`, { cache:'default' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
  async function loadAndRender() {
    const [code, manifest] = await Promise.all([resolveCountry(), fetchJson('manifest.json').catch(() => null)]); let payload;
    try {
      const entry = manifest.countries?.find(item => String(item.countryCode).toUpperCase() === code);
      if (!entry) throw new Error(`No country data for ${code}`);
      payload = await fetchJson(entry.file);
    }
    catch { payload = { countries:[{ country:code, countryCode:code, records:[] }] }; }
    const { profile, sections } = catalogFor(payload, code);
    const copy = copyForCountry(code);
    profile.name = localizedCountryName(code, profile.name, copy.htmlLang);
    render(profile, copy, sections);
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
