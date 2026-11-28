/*
 * Otuki. サイトの標準表示データ。
 * 作品画像・KV・PROFILE・CONTACT・SNS等は microCMS から取得します。
 * このファイルに画像パスを手入力する必要はありません。
 * CMS未設定・通信失敗時は背景と仮画像・案内文を表示します。
 */
window.OTUKI_DATA = {
  artist: 'Otuki.',
  cmsWorksEnabled: true,
  cmsSettingsEnabled: true,
  status: 'ご依頼受付についてはお問い合わせください',
  email: '',
  social: { x: '', instagram: '', youtube: '', skeb: '', pixiv: '' },
  heroLayers: { back: '', main: '', front: '' },
  profileCoverImage: 'assets/placeholder-portrait.svg',
  profileImage: 'assets/placeholder-portrait.svg',
  profileDescription: 'ここに自己紹介文が入ります。',
  contactImage: 'assets/placeholder-contact.svg',
  contactSlides: [],
  services: [
    { title: 'Illustration', image: 'assets/placeholder-landscape.svg', description: 'イラスト制作についてのご案内を掲載します。' },
    { title: 'Live2D', image: 'assets/placeholder-landscape.svg', description: 'Live2D制作・モデリングについてのご案内を掲載します。' },
    { title: 'Character Design', image: 'assets/placeholder-landscape.svg', description: 'キャラクターデザインについてのご案内を掲載します。' }
  ],
  topics: [],
  works: [],
  movies: [
    {title:'Live2D Showcase 01',poster:'assets/placeholder-movie.svg',video:'',description:''},
    {title:'Live2D Showcase 02',poster:'assets/placeholder-movie.svg',video:'',description:''}
  ]
};
