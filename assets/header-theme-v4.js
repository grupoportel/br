// Only adapt label contrast. No assets, animation loop, or animation library.
let queued = false;
let lastHeader;
let lastTheme;
let lastSurface;
function updateHeader() {
  queued = false;
  const header = document.querySelector('.site-header');
  if (!header) return;
  const line = header.getBoundingClientRect().height / 2;
  const section = [...document.querySelectorAll('main>section,main>footer')].find(section => {
    const bounds = section.getBoundingClientRect();
    return bounds.top <= line && bounds.bottom > line;
  });
  const theme = !section?.matches('.journey,.services-section,#sobre,#entregas,footer');
  const surface = section?.matches('.journey') ? '#031320b8' : section ? getComputedStyle(section).backgroundColor : '#f3f7f7';
  if (header !== lastHeader || theme !== lastTheme || surface !== lastSurface) {
    header.classList.toggle('header-content', theme);
    header.style.setProperty('--header-surface',surface);
    lastHeader = header;
    lastTheme = theme;
    lastSurface = surface;
  }
}
function scheduleHeader() {
  if (!queued) { queued = true; requestAnimationFrame(updateHeader); }
}
addEventListener('scroll', scheduleHeader, {passive:true});
addEventListener('resize', scheduleHeader, {passive:true});
addEventListener('pageshow', scheduleHeader);
addEventListener('load', () => {
  scheduleHeader();
  // Font and responsive layout changes must not displace an initial deep link.
  if (location.hash) document.fonts.ready.then(() => requestAnimationFrame(() => {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    document.getElementById(id)?.scrollIntoView({behavior:'instant',block:'start'});
    scheduleHeader();
  }));
}, {once:true});
scheduleHeader();
