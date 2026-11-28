/*
 * microCMS → サイトデータへの変換。
 * GitHub Actionsが data/*.json に取得した公開データだけを読み取ります。
 * APIキーをブラウザへ公開しません。CMSの項目は CMS_SETUP.md を参照。
 */
window.OTUKI_CMS_READY = (async () => {
  'use strict';
  const d = window.OTUKI_DATA;
  if (!d) return;
  const isObject = v => Boolean(v && typeof v === 'object' && !Array.isArray(v));
  const text = v => typeof v === 'string' ? v.replace(/\[sp\]|\[pc\]/g, '\n').trim() : '';
  const imageUrl = v => {
    const url = typeof v === 'string' ? v : (isObject(v) ? v.url : '');
    return typeof url === 'string' && /^(https?:\/\/|assets\/)/i.test(url) ? url : '';
  };
  const option = v => Array.isArray(v) ? v[0] : v;
  const setImage = (target, key, value) => { const url = imageUrl(value); if (url) target[key] = url; };
  async function read(name) {
    const response = await fetch(`./data/${name}.json`, {cache: 'no-store'});
    if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
    return response.json();
  }
  if (d.cmsWorksEnabled) {
    try {
      const result = await read('works');
      if (!Array.isArray(result.contents)) throw new Error('works.contentsが配列ではありません');
      d.works = result.contents.map((item, index) => {
        const category = option(item.category) === 'character' ? 'character' : 'illustration';
        const order = Number(item.displayOrder);
        return {
          title: text(item.title) || '無題',
          image: imageUrl(item.image),
          description: text(item.description),
          category,
          categoryLabel: category === 'character' ? 'CHARACTER DESIGN' : 'ILLUSTRATION',
          showOnTop: item.showOnTop !== false,
          displayOrder: item.displayOrder !== undefined && item.displayOrder !== null && Number.isFinite(order) ? order : 999999,
          _originalIndex: index
        };
      }).filter(item => Boolean(item.image))
        .sort((a, b) => a.displayOrder - b.displayOrder || a._originalIndex - b._originalIndex);
    } catch (error) {
      console.warn('CMS作品データを取得できません。作品表示は空のままです:', error);
    }
  }
  if (d.cmsSettingsEnabled) {
    try {
      const s = await read('site-settings');
      if (!isObject(s)) throw new Error('site-settingsがオブジェクトではありません');
      const status = text(option(s.requestStatus));
      if (status) d.status = status.replace(/^●\s*/, '');
      const address = text(s.contactEmail);
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) d.email = address;
      const links = {x:'xUrl',instagram:'instagramUrl',youtube:'youtubeUrl',skeb:'skebUrl',pixiv:'pixivUrl'};
      Object.entries(links).forEach(([key, field]) => {
        const url = text(s[field]);
        if (/^https?:\/\//i.test(url)) d.social[key] = url;
      });
      setImage(d.heroLayers, 'back', s.heroBack);
      setImage(d.heroLayers, 'main', s.heroMain || s.heroImage);
      setImage(d.heroLayers, 'front', s.heroFront);
      setImage(d, 'profileCoverImage', s.profileCoverImage);
      setImage(d, 'profileImage', s.profileImage);
      if (text(s.profileDescription)) d.profileDescription = text(s.profileDescription);
      setImage(d, 'contactImage', s.contactImage);
      if (Array.isArray(s.contactSlides)) {
        d.contactSlides = s.contactSlides.map(imageUrl).filter(Boolean);
      }
      const serviceKeys = [
        ['serviceIllustrationImage','serviceIllustrationDescription'],
        ['serviceLive2dImage','serviceLive2dDescription'],
        ['serviceCharacterImage','serviceCharacterDescription']
      ];
      serviceKeys.forEach(([imageKey, descKey], index) => {
        setImage(d.services[index], 'image', s[imageKey]);
        if (text(s[descKey])) d.services[index].description = text(s[descKey]);
      });
      // 任意: 繰り返しフィールド services を設定すると、サービス数をCMSで増減できます。
      // services が未登録なら上記の固定3枠を使い、デザインは共通のカードとして表示。
      if (Array.isArray(s.services) && s.services.length) {
        const fromCms = s.services.map(entry => ({
          title: text(entry.title || entry.serviceTitle),
          image: imageUrl(entry.image || entry.serviceImage) || 'assets/placeholder-landscape.svg',
          description: text(entry.description || entry.serviceDescription)
        })).filter(entry => entry.title);
        if (fromCms.length) d.services = fromCms;
      }
      d.movies.forEach((m, index) => {
        const no = index + 1;
        setImage(m, 'poster', s[`moviePoster${no}`]);
        if (text(s[`movieTitle${no}`])) m.title = text(s[`movieTitle${no}`]);
        if (text(s[`movieDescription${no}`])) m.description = text(s[`movieDescription${no}`]);
        if (/^https?:\/\//.test(text(s[`movieVideoUrl${no}`]))) m.video = text(s[`movieVideoUrl${no}`]);
      });
    } catch (error) { console.warn('CMSサイト設定を取得できません:', error); }
  }
  try {
    const a = await read('activities');
    if (Array.isArray(a.contents)) {
      d.topics = a.contents.map(item => ({
        title: text(item.title || item.name || item.heading),
        description: text(item.description || item.body || item.content),
        date: text(item.date || item.displayDate || item.publishedAt || '')
      })).filter(item => item.title).slice(0, 8);
    }
  } catch (error) { console.warn('Topicsの更新情報が未登録です:', error); }
})();
