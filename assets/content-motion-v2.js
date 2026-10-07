// Clipped line entrances, measured once after fonts load. No scroll animation loop.
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || !('IntersectionObserver' in window)) return;
  const records = new Map();
  let observer, resizeFrame, viewportWidth = innerWidth;

  function restore(heading, record) {
    heading.classList.remove('line-reveal-ready', 'line-reveal-visible');
    heading.textContent = record.text;
  }

  function split(heading, record) {
    restore(heading, record);
    const node = heading.firstChild;
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const range = document.createRange();
    const lines = [];
    let top;
    // A DOM Range measures the browser's own balanced wrapping before any changes.
    for (const word of record.text.matchAll(/\S+/g)) {
      range.setStart(node, word.index);
      range.setEnd(node, word.index + word[0].length);
      const rect = range.getBoundingClientRect();
      if (!rect.width) return;
      if (top === undefined || Math.abs(rect.top - top) > 2) {
        lines.push([]);
        top = rect.top;
      }
      lines[lines.length - 1].push(word[0]);
    }
    const fragment = document.createDocumentFragment();
    lines.forEach((words, index) => {
      const line = document.createElement('span');
      const rise = document.createElement('span');
      line.className = 'line-reveal-mask';
      rise.className = 'line-reveal-rise';
      rise.style.setProperty('--line-order', index);
      rise.textContent = words.join(' ');
      line.append(rise);
      if (index) fragment.append(document.createTextNode(' '));
      fragment.append(line);
    });
    if (!lines.length) return;
    heading.replaceChildren(fragment);
    if (record.revealed) heading.classList.add('line-reveal-visible');
    heading.classList.add('line-reveal-ready');
  }

  function stop() {
    observer?.disconnect();
    cancelAnimationFrame(resizeFrame);
    records.forEach((record, heading) => restore(heading, record));
    records.clear();
  }

  function start() {
    if (preference.matches) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const record = records.get(entry.target);
        record.revealed = true;
        entry.target.classList.add('line-reveal-visible');
        observer.unobserve(entry.target);
      });
    }, {threshold:0.2, rootMargin:'0px 0px -5% 0px'});
    try {
      document.querySelectorAll('main > section:not(.journey) h2').forEach(heading => {
        // Leave rich or interactive headings and the existing seasonal hero intact.
        if (heading.children.length) return;
        const record = {text:heading.textContent, revealed:false};
        records.set(heading, record);
        split(heading, record);
        observer.observe(heading);
      });
    } catch {stop();}
  }

  // Re-measure only when width changes; mobile address-bar movement does no work.
  addEventListener('resize', () => {
    if (innerWidth === viewportWidth || preference.matches) return;
    viewportWidth = innerWidth;
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      try {records.forEach((record, heading) => split(heading, record));}
      catch {stop();}
    });
  }, {passive:true});
  preference.addEventListener('change', stop);
  function ready() {
    document.fonts.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(start)));
  }
  if (document.readyState === 'complete') ready();
  else addEventListener('load', ready, {once:true});
})();
