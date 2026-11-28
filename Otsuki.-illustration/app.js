(async()=>{'use strict';await (window.OTUKI_CMS_READY || Promise.resolve());const d=window.OTUKI_DATA;if(!d)return;const $=s=>document.querySelector(s);const el=(tag,cls)=>{const e=document.createElement(tag);if(cls)e.className=cls;return e};const year=$('#year');if(year)year.textContent=new Date().getFullYear();
// CSSで描く光。画像は使いません。
const lights=$('#fireflies');
if(lights){
  // ドキュメント全体に散らし、スクロール時は星も一緒に流れます。
  // 調整: 密度は 110、明滅速度は --duration を変更してください。
  const count=110;
  const rand=(seed)=>{const x=Math.sin(seed*127.1+41.7)*43758.5453;return x-Math.floor(x)};
  const paintStars=()=>{
    lights.replaceChildren();
    const h=Math.max(document.documentElement.scrollHeight,document.body.scrollHeight);
    lights.style.height=h+'px';
    for(let i=0;i<count;i++){
      const f=el('span','firefly');
      f.style.left=(2+rand(i+5)*96)+'%';
      f.style.top=Math.round(100+rand(i+79)*Math.max(1,h-170))+'px';
      const size=(i%13===0?5:i%4===0?3:2);
      f.style.width=size+'px';f.style.height=size+'px';
      f.style.setProperty('--duration',(2.4+rand(i+13)*5).toFixed(2)+'s');
      f.style.setProperty('--drift',(7+rand(i+51)*9).toFixed(2)+'s');
      f.style.setProperty('--delay',(-rand(i+31)*8).toFixed(2)+'s');
      f.style.setProperty('--dx',((rand(i+41)-.5)*35).toFixed(1)+'px');
      f.style.setProperty('--dy',(-8-rand(i+81)*34).toFixed(1)+'px');
      lights.append(f);
    }
  };
  paintStars();
  window.addEventListener('load',paintStars,{once:true});
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(paintStars,220)});
}
const toggle=$('.nav-toggle');if(toggle){toggle.addEventListener('click',()=>{const nav=$('.nav');const opened=nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(opened));toggle.textContent=opened?'×':'☰'});document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',()=>{$('.nav').classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='☰'}))}
const setImg=(selector,src)=>{const n=$(selector);if(n&&src)n.src=src};
// KV：透過PNG/WebPを同じ位置に重ね、下にあるサイト共通背景を透かして表示する。
const heroLayers=$('#hero-layers');
if(heroLayers){
  [['back','KV後景'],['main','KVメイン'],['front','KV前景']].forEach(([name,label])=>{
    const src=d.heroLayers && d.heroLayers[name];
    if(!src)return;
    const img=el('img','hero-layer hero-layer--'+name);
    img.src=src;img.alt=label;img.decoding='async';
    if(name==='main')img.fetchPriority='high';
    heroLayers.append(img);
  });
}
const avail=$('#availability');if(avail)avail.textContent='✦ '+d.status;
// 共通フッターのSNS。URL未設定時はダミーリンクを作らず、名称だけ表示します。
const social=$('#social-links');
if(social){
  const services=[['x','X'],['instagram','Instagram'],['youtube','YouTube'],['skeb','Skeb'],['pixiv','pixiv']];
  services.forEach(([key,label])=>{
    const raw=(d.social||{})[key];
    const value=typeof raw==='string'?raw.trim():'';
    let isValid=false;
    if(value){try{const url=new URL(value);isValid=['https:','http:'].includes(url.protocol)}catch(_){}}
    const item=el(isValid?'a':'span','social-link'+(isValid?'':' is-unset'));
    item.textContent=label+(isValid?' ↗':'');
    if(isValid){item.href=value;item.target='_blank';item.rel='noopener noreferrer';item.setAttribute('aria-label',label+'を開く（新しいタブ）')}
    else{item.title=label+' のリンクは未設定';}
    social.append(item);
  });
}

// TOP: 作品本来の縦横比に沿って額縁を自動伸縮させる、左右チラ見せカルーセル。
// 3セット複製し、端に到達したら中央セットへ瞬時に戻すことで無限ループにしています。
const featuredWorks=d.works.filter(w=>w.showOnTop!==false);
const track=$('#exhibition-track');
if(track&&!featuredWorks.length){
  const stage=$('#exhibition-stage');
  if(stage){stage.textContent='作品は準備中です。';stage.classList.add('is-empty');}
  const counter=$('#exhibition-count');if(counter)counter.textContent='00 / 00';
  const arrows=document.querySelectorAll('.exhibition-arrow');arrows.forEach(a=>a.hidden=true);
}
if(track&&featuredWorks.length){
  const stage=$('#exhibition-stage'),counter=$('#exhibition-count'),dots=$('#exhibition-dots');
  const total=featuredWorks.length;
  let position=total,animating=false,resizeTimer=null,touchX=null;
  const pad=n=>String(n).padStart(2,'0');
  const slides=[];
  for(let copy=0;copy<3;copy++){
    featuredWorks.forEach((w,i)=>{
      const slide=el('div','gallery-slide');slide.dataset.work=String(i);
      const frame=el('div','simple-art-frame');
      const img=el('img');img.src=w.image;img.alt=w.title;img.loading=copy===1?'eager':'lazy';img.decoding='async';
      img.addEventListener('load',()=>{if(!animating)center(false)});
      frame.append(img);slide.append(frame);track.append(slide);slides.push(slide);
    });
  }
  featuredWorks.forEach((w,i)=>{
    const dot=el('button','exhibition-dot');dot.type='button';dot.setAttribute('aria-label',`${i+1}番目の作品を表示`);
    dot.addEventListener('click',()=>go(total+i));dots.append(dot);
  });
  function current(){return ((position%total)+total)%total}
  function update(){
    counter.textContent=`${pad(current()+1)} / ${pad(total)}`;
    slides.forEach((slide,i)=>{const on=i===position;slide.classList.toggle('is-current',on);slide.setAttribute('aria-hidden',String(!on))});
    [...dots.children].forEach((dot,i)=>{dot.classList.toggle('is-active',i===current());dot.setAttribute('aria-pressed',String(i===current()))});
  }
  function center(animate){
    const slide=slides[position];if(!slide)return;
    const offset=stage.clientWidth/2-(slide.offsetLeft+slide.offsetWidth/2);
    track.style.transition=animate?'transform .62s cubic-bezier(.22,.75,.22,1)':'none';
    track.style.transform=`translate3d(${offset}px,0,0)`;
    update();
  }
  function go(next){
    if(animating)return;
    animating=true;position=next;center(true);
  }
  track.addEventListener('transitionend',e=>{
    if(e.target!==track||e.propertyName!=='transform')return;
    animating=false;
    if(position<total||position>=total*2){position=total+current();center(false)}
  });
  $('.exhibition-prev').addEventListener('click',()=>go(position-1));
  $('.exhibition-next').addEventListener('click',()=>go(position+1));
  stage.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();go(position-1)}if(e.key==='ArrowRight'){e.preventDefault();go(position+1)}});
  stage.addEventListener('touchstart',e=>{touchX=e.changedTouches[0].screenX},{passive:true});
  stage.addEventListener('touchend',e=>{if(touchX===null)return;const delta=e.changedTouches[0].screenX-touchX;if(Math.abs(delta)>45)go(position+(delta<0?1:-1));touchX=null},{passive:true});
  window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>center(false),120)});
  window.addEventListener('load',()=>center(false),{once:true});
  requestAnimationFrame(()=>center(false));
}

// CONTACT画像：将来microCMSで取得したcontactSlides配列を使用できます。
// 画像0件なら既存の仮画像、1件なら固定表示、複数なら6秒ごとにフェード切り替え。
const slidesBox=$('#contact-slides');
if(slidesBox){
  const normalizeImage=x=>typeof x==='string'?x:(x&&typeof x.url==='string'?x.url:'');
  const provided=Array.isArray(d.contactSlides)?d.contactSlides.map(normalizeImage).filter(Boolean):[];
  const urls=provided.length?provided:[d.contactImage || 'assets/placeholder-contact.svg'];
  slidesBox.replaceChildren();
  const slideNodes=urls.map((url,i)=>{
    const img=el('img','split-slide'+(i===0?' is-visible':''));
    img.src=url;img.alt='お問い合わせページのイラスト '+(i+1);img.decoding='async';
    if(i>0)img.loading='lazy';
    slidesBox.append(img);return img;
  });
  if(slideNodes.length>1&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    let active=0;
    window.setInterval(()=>{
      slideNodes[active].classList.remove('is-visible');
      active=(active+1)%slideNodes.length;
      slideNodes[active].classList.add('is-visible');
    },6000);
  }
}
setImg('#profile-cover-image',d.profileCoverImage||d.profileImage);
setImg('#profile-avatar-image',d.profileImage);
const profileText=$('#profile-about-text');if(profileText)profileText.textContent=d.profileDescription;
// PROFILE：サービスの件数はCMSから自由に増減可能。各カードの枠組み・画像欄・説明欄は共通。
const servicesBox=$('#profile-services');
if(servicesBox){
  servicesBox.replaceChildren();
  (d.services||[]).forEach((service,i)=>{
    const card=el('article','profile-service');
    const picture=el('div','profile-service-image');
    const img=el('img');img.src=service.image||'assets/placeholder-landscape.svg';img.alt=(service.title||'サービス')+'の紹介画像';img.loading='lazy';
    picture.append(img);
    const copy=el('div','profile-service-copy');
    const number=el('span','service-index');number.textContent=String(i+1).padStart(2,'0')+' / SERVICE';
    const title=el('h3');title.textContent=service.title||'Service';
    const desc=el('p');desc.textContent=service.description||'';
    copy.append(number,title,desc);card.append(picture,copy);servicesBox.append(card);
  });
}
const topicBox=$('#profile-topics');
if(topicBox){
  topicBox.replaceChildren();
  if(!d.topics.length){const p=el('p','empty-topics');p.textContent='お知らせは準備中です。';topicBox.append(p);}
  d.topics.forEach(t=>{
    const row=el('article','profile-topic');
    const time=el('span','topic-date');time.textContent=t.date?t.date.slice(0,10):'TOPIC';
    const heading=el('h3','topic-title');heading.textContent=t.title;
    row.append(time,heading);
    if(t.description){const body=el('p');body.textContent=t.description;row.append(body)}
    topicBox.append(row);
  });
}


const grid=$('#works-grid');if(grid){let current='all';function render(){grid.replaceChildren();const shown=d.works.filter(w=>current==='all'||w.category===current);if(!shown.length){const empty=el('p','empty-works');empty.textContent='作品は準備中です。';grid.append(empty);}shown.forEach(w=>{const card=el('button','work-card');card.type='button';card.setAttribute('aria-label',w.title+'の詳細を表示');const frame=el('div','work-image-wrap');const img=el('img');img.src=w.image;img.alt=w.title;img.loading='lazy';frame.append(img);const meta=el('div','work-meta');const title=el('span','work-title');title.textContent=w.title;const cat=el('span','work-category');cat.textContent=w.categoryLabel;meta.append(title,cat);card.append(frame);card.addEventListener('click',()=>openWork(w));grid.append(card)})}document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{current=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('is-active',x===b));render()}));render()}
const modal=$('#art-modal');function openWork(w){if(!modal)return;setImg('#modal-image',w.image);$('#modal-image').alt=w.title;$('#modal-title').textContent=w.title;$('#modal-category').textContent=w.categoryLabel;$('#modal-description').textContent=w.description;modal.showModal()}if(modal){$('#close-modal').addEventListener('click',()=>modal.close());modal.addEventListener('click',e=>{if(e.target===modal)modal.close()})}
const movieGrid=$('#movie-grid');if(movieGrid){d.movies.forEach(m=>{const card=el('article','movie-card');const media=el('div','movie-media');const poster=el('img');poster.src=m.poster;poster.alt=m.title+'のサムネイル';poster.loading='lazy';media.append(poster);const play=el('button','movie-play');play.type='button';play.textContent='▶';play.setAttribute('aria-label',m.title+'を再生');play.addEventListener('click',()=>{if(!m.video){alert('動画はまだ登録されていません。microCMSのサイト設定から動画URLを登録してください。');return}if(/(?:youtube\.com|youtu\.be|vimeo\.com)/i.test(m.video)){window.open(m.video,'_blank','noopener,noreferrer');return}const video=el('video');video.controls=true;video.autoplay=true;video.playsInline=true;video.poster=m.poster;video.src=m.video;media.replaceChildren(video);video.play().catch(()=>{})});media.append(play);const title=el('h3');title.textContent=m.title;const desc=el('p');desc.textContent=m.description;card.append(media);movieGrid.append(card)})}
const form=$('#contact-form');if(form){form.addEventListener('submit',e=>{e.preventDefault();const status=$('#form-status');if(!d.email){status.textContent='送信先メールアドレスがまだ設定されていません。サイト管理者へお問い合わせください。';return}const data=new FormData(form);const subject='【Otuki. お問い合わせ】'+data.get('category')+' / '+data.get('name');const body=['お名前・ご活動名：'+data.get('name'),'メールアドレス：'+data.get('email'),'ご依頼の種類：'+data.get('category'),'ご予算：'+(data.get('budget')||'未定'),'希望納期：'+(data.get('deadline')||'未定'),'','ご依頼内容：',data.get('message')].join('\n');const link='mailto:'+encodeURIComponent(d.email)+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);status.textContent='メールアプリを開きます。送信ボタンを押して送信を完了してください。';window.location.href=link})}
})();
