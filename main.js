const bookEl = document.getElementById('book');
const btnPrev = document.getElementById('prev');
const btnNext = document.getElementById('next');

// StPageFlip con tamaño basado en contenedor
// Truco: tomamos bounding rect y ajustamos una relación agradable (2:~1.35)
function getDims(){
  const rect = bookEl.getBoundingClientRect();
  // Mantén márgenes: motor necesita valores enteros decentes
  const width  = Math.floor(rect.width);
  const height = Math.floor(rect.height);
  return { width, height };
}

let { width, height } = getDims();

const pageFlip = new St.PageFlip(bookEl, {
  width,
  height,
  size: 'stretch',
  minWidth: 600,    // antes 480
  minHeight: 450,   // antes 360
  maxWidth: 2600,   // antes 2400
  maxHeight: 1900,  // antes 1800
  drawShadow: true,
  flippingTime: 900,
  usePortrait: true,
  autoSize: true,
  showCover: false,
  mobileScrollSupport: true,
  maxShadowOpacity: 0.32,
});

// Carga desde el HTML
pageFlip.loadFromHTML(bookEl.querySelectorAll('.page'));

function updateButtons(){
  const i = pageFlip.getCurrentPageIndex();
  const total = pageFlip.getPageCount();
  btnPrev.disabled = i === 0;
  btnNext.disabled = i === total - 1;
}

pageFlip.on('init', updateButtons);
pageFlip.on('flip', updateButtons);

btnPrev.addEventListener('click', () => pageFlip.flipPrev());
btnNext.addEventListener('click', () => pageFlip.flipNext());

// Teclado
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') pageFlip.flipPrev();
  if (e.key === 'ArrowRight') pageFlip.flipNext();
});

// Si cambia el tamaño del contenedor, actualizamos dimensiones del motor
const ro = new ResizeObserver(() => {
  const dims = getDims();
  pageFlip.update(dims);
});
ro.observe(bookEl);
