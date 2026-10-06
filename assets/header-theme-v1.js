// Only adapt label contrast. No assets, animation loop, or animation library.
let queued = false;
let lastHeader;
let lastTheme;
function updateHeader() {
  queued = false;
  const header = document.querySelector('.site-header');
  if (!header) return;
  const line = header.getBoundingClientRect().height / 2;
  const dark = [...document.querySelectorAll('.journey,.services-section,.contact-section')].some(section => {
    const bounds = section.getBoundingClientRect();
    return bounds.top <= line && bounds.bottom > line;
  });
  const theme = !dark;
  if (header !== lastHeader || theme !== lastTheme) {
    header.classList.toggle('header-content', theme);
    lastHeader = header;
    lastTheme = theme;
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
