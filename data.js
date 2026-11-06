/* ============================================
   作品・動画・プロフィールはここを編集してください。
   画像を差し替える場合は assets/ に保存してパスを変更。
   ※現在の画像はすべて仮素材。公開前に本人作品に差し替え。
============================================ */
window.OTUKI_DATA = {
  artist: 'Otuki.',
  // 新しい作品をmicroCMSへ登録後に true に変更（旧CMSのテスト作品を表示しないため）
  cmsWorksEnabled: false,
  // 旧サイトの説明文や受付状況を引き継がないため、初期状態では無効
  cmsSettingsEnabled: false,
  heroImage: 'img/KV/KV_01.png',
  contactImage: 'assets/placeholder-contact.svg',
  status: 'ご依頼受付中',
  email: '', // 例: 'otuki.santa.01@gmail.com' ※設定するまで送信できません
  social: { x: '', skeb: '' },
  
works: [
  {title:'尾長真昼様',category:'illustration',categoryLabel:'ILLUSTRATION',image:'img/MVイラスト/2026尾長真昼様.png',description:'尾長真昼様のMVイラスト'},
  {title:'未設定',category:'illustration',categoryLabel:'ILLUSTRATION',image:'img/MVイラスト/2026綿羽様skeb.png',description:'未設定'},
  {title:'未設定',category:'illustration',categoryLabel:'ILLUSTRATION',image:'img/MVイラスト/2026砂糖しゅか様skeb.png',description:'未設定'},
  {title:'未設定',category:'illustration',categoryLabel:'ILLUSTRATION',image:'img/MVイラスト/2026殿耀月乃様skeb.png',description:'未設定'},
  {title:'未設定',category:'character',categoryLabel:'CHARACTER DESIGN',image:'img/MVイラスト/2026尾長真昼様skeb2.png',description:'未設定'},
  {title:'未設定',category:'illustration',categoryLabel:'ILLUSTRATION',image:'img/MVイラスト/2026お塩だよ様skeb.png',description:'未設定'},
  {title:'未設定',category:'illustration',categoryLabel:'ILLUSTRATION',image:'img/MVイラスト/2026Juby様skeb.png',description:'未設定'},
  {title:'未設定',category:'illustration',categoryLabel:'ILLUSTRATION',image:'img/創作/2026新年絵.png',description:'未設定'}
],

  movies: [
    {title:'Live2D Showcase 01',poster:'assets/placeholder-movie.svg',video:'',description:'Live2Dモデリング・モーション作品の掲載枠です。'},
    {title:'Live2D Showcase 02',poster:'assets/placeholder-movie.svg',video:'',description:'動画ファイルを設定するとこの場所で再生できます。'}
  ]
};
