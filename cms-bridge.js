/* microCMSの公開JSONを新サイト用に変換する。APIキー不要。 */
window.OTUKI_CMS_READY = (async () => {
  const d = window.OTUKI_DATA;
  if (!d) return;
  async function read(name) {
    const response = await fetch(`./data/${name}.json`, {cache: 'no-cache'});
    if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
    return response.json();
  }
  const cleanText = value => typeof value === 'string' ? value.replace(/\[sp\]|\[pc\]/g, '\n').trim() : '';
  if (d.cmsWorksEnabled) {
    try {
      const result = await read('works');
      if (!Array.isArray(result.contents)) throw new Error('works.contentsが配列ではありません');
      // CMS側で作品を削除したらサイト側からも削除。旧作品は混ぜない。
      d.works = result.contents.filter(item => item.image && item.image.url).map(item => {
        const category = item.category === 'character' ? 'character' : 'illustration';
        return {
          title: item.title || '無題',
          image: item.image.url,
          description: item.description || '',
          category,
          categoryLabel: category === 'character' ? 'CHARACTER DESIGN' : 'ILLUSTRATION'
        };
      });
    } catch (error) {
      console.warn('CMS作品を読み込めなかったため、ローカル作品を表示します:', error);
    }
  }
  if (d.cmsSettingsEnabled) {
    try {
      const settings = await read('site-settings');
      const status = Array.isArray(settings.requestStatus) ? settings.requestStatus[0] : settings.requestStatus;
      if (typeof status === 'string' && status.trim()) d.status = status.replace(/^●\s*/, '');
      // 旧サイトのheroDescription/profileTextは新デザインに挿入しない。
      // SNS URL は必要な場合のみ明示的に利用する。
      if (settings.xUrl) d.social.x = settings.xUrl;
      if (settings.skebUrl) d.social.skeb = settings.skebUrl;
    } catch (error) { console.warn('CMS設定を読み込めません:', error); }
  }
})();
