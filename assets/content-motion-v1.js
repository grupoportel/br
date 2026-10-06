// One observer per heading, with no animation loop or extra dependencies.
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || !('IntersectionObserver' in window)) return;
  let observer;
  function restore() {
    observer?.disconnect();
    document.querySelectorAll('.text-reveal').forEach(heading => heading.classList.add('text-reveal-visible'));
  }
  function start() {
    if (preference.matches) return;
    const headings = document.querySelectorAll('.public-section h2');
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('text-reveal-visible');
        observer.unobserve(entry.target);
      });
    }, {threshold:0.25});
    try {
      headings.forEach(heading => {
        if (heading.children.length) return;
        const fragment = document.createDocumentFragment();
        let index = 0;
        heading.textContent.split(/(\s+)/).forEach(word => {
          if (!word.trim()) {fragment.append(document.createTextNode(word));return;}
          const span = document.createElement('span');
          span.className = 'text-reveal-word';
          span.style.setProperty('--word-order', index++);
          span.textContent = word;
          fragment.append(span);
        });
        heading.replaceChildren(fragment);
        heading.classList.add('text-reveal');
        observer.observe(heading);
      });
    } catch {restore();}
  }
  preference.addEventListener('change', restore);
  function ready() {document.fonts.ready.then(() => requestAnimationFrame(() => requestAnimationFrame(start)));}
  if (document.readyState === 'complete') ready();
  else addEventListener('load', ready, {once:true});
})();
