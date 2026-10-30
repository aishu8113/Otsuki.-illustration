/* Otuki. microCMS 公開済みJSONの表示処理。APIキーはブラウザに置かない。 */
(() => {
  const $ = (selector) => document.querySelector(selector);
  const setText = (selector, value) => {
    const el = $(selector);
    if (el && typeof value === 'string') el.textContent = value;
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
      priceNote: '.price-panel .note', requestStatus: '.status-label',
      requestDescription: '.status-panel > p:not(.status-label)',
      contactDescription: '#contact > p:not(.english-title)'
    };
    for (const [field, selector] of Object.entries(fields)) setText(selector, data[field]);
    const profileImage = imageURL(data.profileImage);
    if (profileImage && $('.profile-image img')) $('.profile-image img').src = profileImage;
    for (const [field, selector] of Object.entries({
      xUrl: '#sns-x', instagramUrl: '#sns-instagram',
      youtubeUrl: '#sns-youtube', skebUrl: '#sns-skeb'
    })) setLink(selector, data[field]);
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
    card.append(make('p', '', item.description || ''));
    return card;
  }
  function renderPrice(item) {
    const row = make('div', 'price-row');
    row.append(make('span', '', item.title || 'メニュー'));
    row.append(make('span', '', item.price || '要相談'));
    if (item.description) row.title = item.description;
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
    const panel = $('.price-panel');
    if (!panel) return;
    panel.querySelectorAll('.price-row').forEach((row) => row.remove());
    const note = panel.querySelector('.note');
    const items = [...data.contents].sort((a, b) => (Number(a.order) || 999999) - (Number(b.order) || 999999));
    if (!items.length) {
      panel.insertBefore(make('p', 'cms-empty', '料金はお問い合わせください。'), note);
    } else {
      items.forEach((item) => panel.insertBefore(renderPrice(item), note));
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

  const jobs = [
    ['site-settings', loadSettings],
    ['works', () => loadList('works', '#works .works-grid', renderWork)],
    ['activities', () => loadList('activities', '#journal .article-grid', renderArticle, (a,b) => String(b.date || b.publishedAt || '').localeCompare(String(a.date || a.publishedAt || '')))],
    ['blogs', () => loadList('blogs', '#blog .article-grid', renderArticle, (a,b) => String(b.date || b.publishedAt || '').localeCompare(String(a.date || a.publishedAt || '')))],
    ['prices', loadPrices]
  ];
  Promise.allSettled(jobs.map(async ([name, job]) => {
    try { await job(); } catch (error) { console.error(`CMS ${name} 読み込みエラー:`, error); }
  }));
})();
