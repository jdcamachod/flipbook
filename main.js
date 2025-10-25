const bookEl   = document.getElementById('book');
const viewport = document.getElementById('flip-viewport');
const btnPrev  = document.getElementById('prev');
const btnNext  = document.getElementById('next');

const isMobile = () => window.matchMedia('(max-width: 640px)').matches;

// Dimensiones base para el modo móvil (una página)
const BASE_W = 420;
const BASE_H = 640;

// Dimensiones del contenedor para desktop/tablet (dos páginas)
function getContainerDims(){
  const r = bookEl.getBoundingClientRect();
  return { width: Math.floor(r.width), height: Math.floor(r.height) };
}

let pageFlip; // instancia

function initFlip(){
  if (pageFlip) {
    pageFlip.destroy(); // limpia listeners/canvas
  }

  if (isMobile()) {
    // MÓVIL: una página fija centrada; el motor no se “mueve”, solo se escala
    pageFlip = new St.PageFlip(viewport, {
      width: BASE_W,
      height: BASE_H,
      size: 'fixed',
      autoSize: false,
      usePortrait: true,     // single page
      drawShadow: true,
      flippingTime: 900,
      maxShadowOpacity: 0.28,
      showCover: false,
      mobileScrollSupport: true
    });

    pageFlip.loadFromHTML(viewport.querySelectorAll('.page'));
    scaleMobile(); // primera escala
  } else {
    // DESKTOP/TABLET: dos páginas, estirado al contenedor
    const dims = getContainerDims();
    pageFlip = new St.PageFlip(bookEl, {
      width: dims.width,
      height: dims.height,
      size: 'stretch',
      autoSize: true,
      usePortrait: true,     // la lib cambia a single-page si hace falta
      drawShadow: true,
      flippingTime: 900,
      maxShadowOpacity: 0.32,
      showCover: false,
      mobileScrollSupport: true
    });

    pageFlip.loadFromHTML(bookEl.querySelectorAll('.page'));
  }

  // Controles
  btnPrev.onclick = () => pageFlip.flipPrev();
  btnNext.onclick = () => pageFlip.flipNext();

  pageFlip.on('flip', updateButtons);
  pageFlip.on('init', updateButtons);
}

function updateButtons(){
  const i = pageFlip.getCurrentPageIndex();
  const total = pageFlip.getPageCount();
  btnPrev.disabled = i === 0;
  btnNext.disabled = i === total - 1;
}

/* Escalado solo para móvil: centra y encaja el lienzo fijo en el contenedor */
function scaleMobile(){
  if (!isMobile()) return;
  const br = bookEl.getBoundingClientRect();
  const scale = Math.min(br.width / BASE_W, br.height / BASE_H);
  viewport.style.transform = `scale(${scale})`;
}

/* Observa cambios de tamaño/rotación */
const ro = new ResizeObserver(() => {
  if (isMobile()) {
    scaleMobile();
  } else if (pageFlip) {
    const dims = getContainerDims();
    pageFlip.update(dims);
  }
});
ro.observe(bookEl);

/* Re-inicializa al cruzar el breakpoint (para que cambie de modo) */
let lastMobile = isMobile();
window.addEventListener('resize', () => {
  const nowMobile = isMobile();
  if (nowMobile !== lastMobile) {
    lastMobile = nowMobile;
    initFlip(); // recrea con el modo correcto
  }
});

initFlip();
