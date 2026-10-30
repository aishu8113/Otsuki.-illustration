/* Otuki. microCMS 公開済みJSONの表示処理。APIキーはブラウザに置かない。 */
(() => {
  const $ = (selector) => document.querySelector(selector);
  const setText = (selector, value) => {
    const el = $(selector);
    if (!el || typeof value !== 'string') return;

    const parts = value.split(/(\[sp\]|\[pc\])/);
    el.replaceChildren();

    parts.forEach((part) => {
      if (part === '[sp]' || part === '[pc]') {
        const br = document.createElement('br');
        br.className = part === '[sp]' ? 'sp-only' : 'pc-only';
        el.appendChild(br);
      } else {
        el.appendChild(document.createTextNode(part));
      }
    });
  };
  const setLink = (selector, value) => {
    const el = $(selector);
    if (!el || typeof value !== 'string' || !value.trim()) return;
    try {
      const url = new URL(value);
      if (!['https:', 'http:'].includes(url.protocol)) return;
      el.href = url.href;
      el.rel = 'noopener noreferrer';
    } catch (error) { console.warn('無効なSNS URL:', selector); }
  };
  const imageURL = (value) => value && typeof value.url === 'string' ? value.url : null;
  const make = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value != null) node.textContent = String(value);
    return node;
  };
  const makeImage = (value, alt) => {
    const box = make('div', 'image-box');
    const url = imageURL(value);
    if (url) {
      const img = make('img');
      img.src = url;
      img.alt = alt || '作品画像';
      img.loading = 'lazy';
      box.append(img);
    } else {
      box.textContent = '画像なし';
    }
    return box;
  };
  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Tokyo' }).format(date).replaceAll('/', '.');
  };
  async function getJSON(filename) {
    const response = await fetch(`./data/${filename}.json`, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`${filename}: HTTP ${response.status}`);
    return response.json();
  }
  async function loadSettings() {
    const data = await getJSON('site-settings');
    const fields = {
      heroTitle: '#hero-title', heroDescription: '.hero-text', profileText: '#profile-description',
      worksDescription: '#works .section-heading > p:last-child',
      activityDesc: '#journal .section-heading > p:last-child',
      blogsDescription: '#blog .section-heading > p:last-child',
      priceNote: '.price-panel .note',
      requestDescription: '.status-panel > p:not(.status-label)',
      contactDescription: '#contact-description'
    };
    for (const [field, selector] of Object.entries(fields)) setText(selector, data[field]);
    // セレクトフィールド（配列）と従来のテキストフィールドの両方に対応する。
    const statusElement = $('.status-label');
    if (statusElement) {
      const rawStatus = Array.isArray(data.requestStatus)
        ? data.requestStatus[0]
        : data.requestStatus;
      const status = typeof rawStatus === 'string' ? rawStatus.trim() : '';
      if (status) {
        const isStopped = status.includes('停止');
        statusElement.textContent = isStopped
          ? '● 現在、受付停止中'
          : '● お仕事受付中';
        statusElement.style.color = isStopped ? '#d45555' : '#509953';
      }
    }
    const profileImage = imageURL(data.profileImage);
    if (profileImage && $('.profile-image img')) $('.profile-image img').src = profileImage;
    for (const [field, selector] of Object.entries({
      xUrl: '#sns-x', instagramUrl: '#sns-instagram',
      youtubeUrl: '#sns-youtube', skebUrl: '#sns-skeb'
    })) setLink(selector, data[field]);
    setLink('#price-skeb-link', data.skebUrl);
    // お問い合わせボタンも同じCMSのSNSリンク設定で更新する
    setLink('#contact-skeb', data.skebUrl);
    setLink('#contact-x', data.xUrl);
  }
  function renderList(selector, entries, renderItem) {
    const container = $(selector);
    if (!container) return;
    container.replaceChildren();
    if (!entries.length) {
      container.append(make('p', 'cms-empty', '現在、掲載されている内容はありません。'));
      return;
    }
    entries.forEach((item) => container.append(renderItem(item)));
  }
  function renderWork(item) {
    const card = make('article', 'work-card');
    const imageBox = makeImage(item.image, item.title);
    const fullImage = imageURL(item.image);
    if (fullImage) {
      const button = make('button', 'work-image-trigger');
      button.type = 'button';
      button.setAttribute('aria-label', `${item.title || '作品'}の画像を拡大表示`);
      button.append(imageBox);
      button.addEventListener('click', () => openWorkLightbox(fullImage, item.title || '作品画像'));
      card.append(button);
    } else {
      card.append(imageBox);
    }
    card.append(make('h3', '', item.title || '無題'));
    card.append(make('p', '', item.description || ''));
    return card;
  }
  function renderArticle(item) {
    const card = make('article', 'article-card');
    card.append(makeImage(item.image, item.title));
    card.append(make('p', 'date', formatDate(item.date || item.publishedAt)));
    card.append(make('h3', '', item.title || '無題'));
    card.append(make('p', '', item.description || item.descriptio || ''));
    return card;
  }
  // 活動記録はカード全体をボタンにして、詳細をダイアログ表示する。
  function renderActivity(item, kind = '活動記録') {
    const card = renderArticle(item);
    card.classList.add('activity-card');
    const button = make('button', 'activity-card-trigger');
    button.type = 'button';
    button.setAttribute('aria-label', `${item.title || kind}の本文を読む`);
    while (card.firstChild) button.append(card.firstChild);
    card.append(button);
    button.addEventListener('click', () => openActivityDetail(item));
    return card;
  }
  function renderBlog(item) {
    return renderActivity(item, 'ブログ');
  }
  // microCMSのリッチテキストを許可したタグだけで描画（危険なHTMLは挿入しない）。
  function safeRichText(html) {
    const fragment = document.createDocumentFragment();
    if (typeof html !== 'string') return fragment;
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const allowed = new Set(['P','BR','STRONG','B','EM','I','U','S','BLOCKQUOTE','UL','OL','LI','H2','H3','H4','HR','A','IMG','FIGURE','FIGCAPTION','CODE','PRE']);
    function clean(node, parent) {
      if (node.nodeType === Node.TEXT_NODE) {
        parent.append(document.createTextNode(node.textContent));
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const tag = node.tagName;
      if (!allowed.has(tag)) {
        // script/style/svg等の要素は中身も含めて除去
        if (['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','SVG','MATH','FORM','INPUT','BUTTON','TEMPLATE'].includes(tag)) return;
        Array.from(node.childNodes).forEach(child => clean(child, parent));
        return;
      }
      const el = document.createElement(tag.toLowerCase());
      if (tag === 'A') {
        try {
          const href = new URL(node.getAttribute('href') || '', location.href);
          if (['http:', 'https:'].includes(href.protocol)) {
            el.href = href.href;
            el.target = '_blank';
            el.rel = 'noopener noreferrer';
          }
        } catch (_) { /* URLなし */ }
      }
      if (tag === 'IMG') {
        try {
          const src = new URL(node.getAttribute('src') || '');
          if (src.protocol !== 'https:') return;
          el.src = src.href;
          el.alt = node.getAttribute('alt') || '';
          el.loading = 'lazy';
        } catch (_) { return; }
      }
      Array.from(node.childNodes).forEach(child => clean(child, el));
      parent.append(el);
    }
    Array.from(parsed.body.childNodes).forEach(node => clean(node, fragment));
    return fragment;
  }
  let lastActivityFocus = null;
  function openActivityDetail(item) {
    const dialog = $('#activity-detail');
    if (!dialog) return;
    dialog.querySelector('.activity-detail-title').textContent = item.title || '無題';
    dialog.querySelector('.activity-detail-date').textContent = formatDate(item.date || item.publishedAt);
    const picture = dialog.querySelector('.activity-detail-image');
    const url = imageURL(item.image);
    picture.hidden = !url;
    if (url) {
      picture.src = url;
      picture.alt = item.title || '活動記録の画像';
    } else {
      picture.removeAttribute('src');
    }
    const body = dialog.querySelector('.activity-detail-body');
    body.replaceChildren();
    if (item.body) body.append(safeRichText(item.body));
    else body.append(make('p', '', item.description || item.descriptio || '本文はありません。'));
    lastActivityFocus = document.activeElement;
    dialog.showModal();
    document.body.classList.add('lightbox-open');
    dialog.querySelector('.activity-detail-close').focus();
  }
  function initActivityDetail() {
    const dialog = $('#activity-detail');
    if (!dialog) return;
    dialog.querySelector('.activity-detail-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('lightbox-open');
      if (lastActivityFocus && lastActivityFocus.isConnected) lastActivityFocus.focus();
    });
  }
  function renderPrice(item) {
    const row = make('div', 'price-row');
    const main = make('div', 'price-item');
    main.append(make('span', 'price-item-title', item.title || 'メニュー'));
    if (item.description) main.append(make('small', 'price-item-description', item.description));
    row.append(main);
    row.append(make('span', 'price-item-amount', item.price || '要相談'));
    return row;
  }
  async function loadList(filename, selector, renderItem, sortFn) {
    const data = await getJSON(filename);
    if (!Array.isArray(data.contents)) throw new Error(`${filename}: contentsが配列ではありません`);
    const items = [...data.contents];
    if (sortFn) items.sort(sortFn);
    renderList(selector, items, renderItem);
  }
  async function loadPrices() {
    const data = await getJSON('prices');
    if (!Array.isArray(data.contents)) throw new Error('prices: contentsが配列ではありません');
    const list = $('#price-list');
    if (!list) return;
    const items = [...data.contents].sort((a, b) => {
      const order = (item) => item.order === '' || item.order == null ? 999999 : Number(item.order);
      return order(a) - order(b);
    });
    list.replaceChildren();
    if (!items.length) {
      list.append(make('p', 'cms-empty', '料金はSkebでご確認ください。'));
    } else {
      items.forEach((item) => list.append(renderPrice(item)));
    }
  }

  // 作品をクリックした際の拡大表示。画像全体が見えるよう contain で表示する。
  let lastFocusedElement = null;
  function closeWorkLightbox() {
    const dialog = $('#work-lightbox');
    if (!dialog || !dialog.open) return;
    dialog.close();
    document.body.classList.remove('lightbox-open');
    if (lastFocusedElement && lastFocusedElement.isConnected) lastFocusedElement.focus();
  }
  function openWorkLightbox(url, title) {
    const dialog = $('#work-lightbox');
    if (!dialog) return;
    const img = dialog.querySelector('.work-lightbox-image');
    img.src = url;
    img.alt = title;
    lastFocusedElement = document.activeElement;
    dialog.showModal();
    document.body.classList.add('lightbox-open');
    dialog.querySelector('.work-lightbox-close').focus();
  }
  function initWorkLightbox() {
    const dialog = $('#work-lightbox');
    if (!dialog) return;
    dialog.querySelector('.work-lightbox-close').addEventListener('click', closeWorkLightbox);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeWorkLightbox();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('lightbox-open');
      if (lastFocusedElement && lastFocusedElement.isConnected) lastFocusedElement.focus();
    });
  }
  initWorkLightbox();
  initActivityDetail();
  const newestFirst = (a,b) => String(b.date || b.publishedAt || '').localeCompare(String(a.date || a.publishedAt || ''));
  const jobs = [
    ['site-settings', loadSettings],
    ['works', () => loadList('works', '#works .works-grid', renderWork)],
    ['activities', () => loadList('activities', '#journal .article-grid', renderActivity, newestFirst)],
    ['blogs', () => loadList('blogs', '#blog .article-grid', renderBlog, newestFirst)],
    ['prices', loadPrices]
  ];
  Promise.allSettled(jobs.map(async ([name, job]) => {
    try { await job(); } catch (error) { console.error(`CMS ${name} 読み込みエラー:`, error); }
  }));
})();
