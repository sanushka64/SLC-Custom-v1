/** Screenshot-based Sri Lanka Customs dashboard presentation viewer.
 * Screenshots are deliberately static: this site does not claim to provide Power BI filters or live data.
 */
(() => {
  'use strict';
  const catalog = window.DASHBOARD_CATALOG || [];
  const byId = id => document.getElementById(id);
  const ui = {
    title: byId('dashboardTitle'), switcher: byId('dashboardSwitch'), sections: byId('sectionNav'),
    sectionBar: byId('sectionBar'), nav: byId('navPillsContainer'), stage: byId('stageWrapper'),
    card: byId('dashboardCard'), image: byId('dashImageMain'), loader: byId('imageLoader'),
    prev: byId('prevBtn'), next: byId('nextBtn'), pageName: byId('currentPageName'),
    pageNumber: byId('pageNumber'), gallery: byId('pagesPanel'), galleryButton: byId('pagesBtn'),
    galleryClose: byId('closePagesBtn'), thumbs: byId('thumbGrid'), zoomButton: byId('zoomBtn'),
    fullButton: byId('fullscreenBtn'), copy: byId('copyLinkBtn'), lightbox: byId('lightbox'),
    lightboxImage: byId('lightboxImg'), lightboxTitle: byId('lightboxTitle'),
    lightboxCanvas: byId('lightboxCanvas'), closeZoom: byId('closeLightboxBtn'),
    zoomIn: byId('zoomInBtn'), zoomOut: byId('zoomOutBtn'), zoomReset: byId('zoomResetBtn'),
    zoomLevel: byId('zoomLevel'), toast: byId('toast')
  };
  if (!catalog.length || !ui.stage) return;

  const params = new URLSearchParams(location.search);
  const requestedId = params.get('id') || 'accounting-revenue';
  const db = catalog.find(entry => entry.id === requestedId) || catalog[0];
  const pages = db.sections.flatMap(section => section.pages.map(page => ({ ...page, section:section.title, sectionId:section.id })));
  let current = Math.max(0, pages.findIndex(p => p.id === params.get('page')));
  let activeSectionId = null;
  let zoomScale = 1;
  let toastTimeout = null;
  let thumbsBuilt = false;

  const prevSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v10H7z"/><path d="M10 3v4M14 17v4"/></svg>';
  function showToast(message) {
    ui.toast.textContent = message;
    ui.toast.hidden = false;
    if (toastTimeout) window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => ui.toast.hidden = true, 2400);
  }
  function pageUrl(index) {
    const url = new URL(location.href);
    url.searchParams.set('id',db.id);
    url.searchParams.set('page',pages[index].id);
    return url;
  }
  function fitScreenshot() {
    if (!ui.card || !ui.stage) return;
    const w = Math.max(1,ui.stage.clientWidth-14);
    const h = Math.max(1,ui.stage.clientHeight-8);
    const ratio = (ui.image.naturalWidth && ui.image.naturalHeight) ? ui.image.naturalWidth/ui.image.naturalHeight : 16/9;
    const targetW = Math.max(1,Math.min(w,h*ratio));
    const targetH = targetW/ratio;
    ui.card.style.width = Math.floor(targetW)+'px';
    ui.card.style.height = Math.floor(targetH)+'px';
    ui.card.style.aspectRatio = String(ratio);
  }
  function buildSwitcher() {
    for (const item of catalog) {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = item.title;
      ui.switcher.appendChild(option);
    }
    ui.switcher.value = db.id;
    ui.switcher.addEventListener('change', () => {
      const id = ui.switcher.value;
      location.href = id === 'accounting-revenue' ? 'revenue.html' : `dashboard.html?id=${encodeURIComponent(id)}`;
    });
  }
  function buildSectionTabs() {
    ui.sectionBar.hidden = db.sections.length < 2;
    ui.sections.replaceChildren();
    if (ui.sectionBar.hidden) return;
    for (const section of db.sections) {
      const button = document.createElement('button');
      button.type='button'; button.className='section-tab-btn'; button.textContent=section.title;
      button.dataset.section = section.id;
      button.setAttribute('aria-label',`View ${section.title} pages`);
      button.addEventListener('click', () => {
        const pageIndex = pages.findIndex(p => p.sectionId === section.id);
        setPage(pageIndex);
      });
      ui.sections.appendChild(button);
    }
  }
  function rebuildPageTabs(sectionId) {
    ui.nav.replaceChildren();
    const visiblePages = pages.map((p,i)=>({...p,index:i})).filter(p=>p.sectionId === sectionId);
    for (const page of visiblePages) {
      const button = document.createElement('button');
      button.type='button';button.className='nav-tab-btn';button.dataset.pageIndex=String(page.index);
      button.setAttribute('aria-label',`View ${page.title} page`);
      const icon = document.createElement('span');icon.innerHTML=prevSvg;icon.setAttribute('aria-hidden','true');
      const label = document.createElement('span');label.textContent=page.title;
      button.append(icon,label);
      button.addEventListener('click',()=>setPage(page.index));
      ui.nav.appendChild(button);
    }
  }
  function updateActiveControls() {
    const page=pages[current];
    if (activeSectionId !== page.sectionId) {
      activeSectionId=page.sectionId;
      rebuildPageTabs(activeSectionId);
    }
    ui.sections.querySelectorAll('button').forEach(b=>{
      const active = b.dataset.section === activeSectionId;
      b.classList.toggle('active',active);
      b.setAttribute('aria-pressed',String(active));
    });
    ui.nav.querySelectorAll('button').forEach(b=>{
      const active = Number(b.dataset.pageIndex) === current;
      b.classList.toggle('active',active);
      b.setAttribute('aria-current',active?'page':'false');
      if(active) b.scrollIntoView({behavior:'instant',block:'nearest',inline:'nearest'});
    });
    ui.pageName.textContent=page.title;
    ui.pageNumber.textContent=`${current+1} / ${pages.length}`;
    ui.prev.hidden=pages.length<2;
    ui.next.hidden=pages.length<2;
    document.title=`${page.title} | ${db.title} | Sri Lanka Customs`;
    if(thumbsBuilt) {
      ui.thumbs.querySelectorAll('button').forEach(b=>b.classList.toggle('active',Number(b.dataset.index)===current));
    }
  }
  function setPage(index,{historyMode='push'}={}) {
    current=(index+pages.length)%pages.length;
    const page=pages[current];
    updateActiveControls();
    ui.loader.textContent='Loading preview…';
    ui.loader.hidden=false;
    ui.image.classList.add('loading');
    ui.image.alt=`${db.title} — ${page.title}. Static dashboard screenshot.`;
    ui.image.src=page.image;
    fitScreenshot();
    const newUrl=pageUrl(current);
    if(historyMode==='replace') history.replaceState({page:page.id},'',newUrl);
    else if(historyMode==='push') history.pushState({page:page.id},'',newUrl);
    if(!ui.lightbox.hidden) {
      ui.lightboxImage.src=page.image;
      ui.lightboxImage.alt=ui.image.alt;
      ui.lightboxTitle.textContent=`${db.title} — ${page.title}`;
    }
  }
  function move(delta) { setPage(current+delta); }
  function buildThumbs() {
    if(thumbsBuilt)return;
    const fragment=document.createDocumentFragment();
    pages.forEach((page,index)=>{
      const btn=document.createElement('button');btn.type='button';btn.className='thumb-card';
      btn.dataset.index=String(index);
      const img=document.createElement('img');img.loading='lazy';img.src=page.image;img.alt='';
      const label=document.createElement('span');label.className='thumb-title';label.textContent=page.title;
      btn.append(img,label);
      if(db.sections.length>1) { const sub=document.createElement('span');sub.className='thumb-section';sub.textContent=page.section;btn.appendChild(sub);}
      btn.addEventListener('click',()=>{setPage(index);togglePages(false)});
      fragment.appendChild(btn);
    });
    ui.thumbs.appendChild(fragment);
    thumbsBuilt=true;
  }
  function togglePages(open=!ui.gallery.hidden) {
    // Explicit false closes, true opens; omitted toggles.
    ui.gallery.hidden=!open;
    ui.galleryButton.setAttribute('aria-expanded',String(open));
    if(open){
      buildThumbs();
      ui.thumbs.querySelectorAll('button').forEach(b=>b.classList.toggle('active',Number(b.dataset.index)===current));
      const selected=ui.thumbs.querySelector('.thumb-card.active');
      if(selected)selected.scrollIntoView({block:'nearest'});
      ui.galleryClose.focus();
    } else {ui.galleryButton.focus();}
  }
  function renderZoom() {
    const percentage=Math.round(zoomScale*100);
    ui.zoomLevel.textContent=percentage+'%';
    ui.lightboxImage.style.width=percentage+'%';
  }
  function openZoom() {
    togglePages(false);
    ui.lightbox.hidden=false;
    document.body.style.overflow='hidden';
    ui.lightboxImage.src=pages[current].image;
    ui.lightboxImage.alt=ui.image.alt;
    ui.lightboxTitle.textContent=`${db.title} — ${pages[current].title}`;
    zoomScale=1;
    renderZoom();
    ui.closeZoom.focus();
  }
  function closeZoom() {
    ui.lightbox.hidden=true;
    document.body.style.overflow='';
    ui.lightboxImage.removeAttribute('src');
    ui.zoomButton.focus();
  }
  function changeZoom(delta) {
    zoomScale=Math.min(4,Math.max(.6,Math.round((zoomScale+delta)*100)/100));
    renderZoom();
  }
  async function copyPageLink() {
    const text=pageUrl(current).href;
    try {
      if(navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const input=document.createElement('textarea');input.value=text;
        input.style.position='fixed';input.style.opacity='0';document.body.appendChild(input);
        input.select();const ok=document.execCommand('copy');input.remove();if(!ok)throw new Error('Clipboard unavailable');
      }
      showToast('Page link copied');
    } catch(err) { showToast('Select the address bar to copy this page link'); }
  }
  async function toggleFullscreen() {
    try {
      if(document.fullscreenElement) await document.exitFullscreen();
      else if(byId('viewerApp').requestFullscreen) await byId('viewerApp').requestFullscreen();
      else showToast('Fullscreen is not supported in this browser');
    } catch(e) {showToast('Fullscreen was blocked by the browser');}
  }
  ui.image.addEventListener('load',()=>{
    ui.loader.hidden=true;ui.image.classList.remove('loading');fitScreenshot();
  });
  ui.image.addEventListener('error',()=>{
    ui.loader.hidden=false;ui.loader.textContent='This screenshot could not be loaded. Check the assets/screenshots directory.';
    ui.image.classList.remove('loading');
  });
  ui.image.addEventListener('click',openZoom);
  ui.image.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openZoom();}});
  ui.prev.addEventListener('click',()=>move(-1));
  ui.next.addEventListener('click',()=>move(1));
  ui.galleryButton.addEventListener('click',()=>togglePages(ui.gallery.hidden));
  ui.galleryClose.addEventListener('click',()=>togglePages(false));
  ui.zoomButton.addEventListener('click',openZoom);
  ui.closeZoom.addEventListener('click',closeZoom);
  ui.lightbox.addEventListener('click',e=>{if(e.target===ui.lightbox) closeZoom();});
  ui.zoomIn.addEventListener('click',()=>changeZoom(.25));
  ui.zoomOut.addEventListener('click',()=>changeZoom(-.25));
  ui.zoomReset.addEventListener('click',()=>{zoomScale=1;renderZoom();});
  ui.fullButton.addEventListener('click',toggleFullscreen);
  ui.copy.addEventListener('click',copyPageLink);
  document.addEventListener('fullscreenchange',()=>{
    const on=Boolean(document.fullscreenElement);
    ui.fullButton.title=on?'Exit fullscreen (F)':'Fullscreen (F)';
    ui.fullButton.setAttribute('aria-label',on?'Exit fullscreen':'Enter fullscreen');
    fitScreenshot();
  });
  document.addEventListener('keydown',e=>{
    const editing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);
    if(editing)return;
    if(e.key==='Escape') {
      if(!ui.lightbox.hidden){e.preventDefault();closeZoom();}
      else if(!ui.gallery.hidden){e.preventDefault();togglePages(false);}
      return;
    }
    if(!ui.lightbox.hidden) {
      if(e.key==='+' || e.key==='='){e.preventDefault();changeZoom(.25)}
      if(e.key==='-'){e.preventDefault();changeZoom(-.25)}
      return;
    }
    if(e.key==='ArrowRight'){e.preventDefault();move(1)}
    else if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}
    else if(e.key.toLowerCase()==='p'){e.preventDefault();togglePages(ui.gallery.hidden)}
    else if(e.key.toLowerCase()==='z'){e.preventDefault();openZoom()}
    else if(e.key.toLowerCase()==='f'){e.preventDefault();toggleFullscreen()}
  });
  window.addEventListener('popstate',()=>{
    const next=new URLSearchParams(location.search).get('page');
    const idx=pages.findIndex(p=>p.id===next);
    if(idx>=0)setPage(idx,{historyMode:'none'});
  });
  window.addEventListener('resize',fitScreenshot);
  if(window.ResizeObserver) new ResizeObserver(fitScreenshot).observe(ui.stage);
  buildSwitcher();buildSectionTabs();
  ui.title.textContent=db.title+' Dashboard';
  setPage(current,{historyMode:'replace'});
})();
