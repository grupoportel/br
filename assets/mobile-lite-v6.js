// Small-screen controller for the published static HTML. Desktop keeps its runtime.
const journey = document.querySelector('.journey');
const sticky = journey.querySelector('.journey-sticky');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const chapters = [...journey.querySelectorAll('.story-chapter')];
const seasons = ['winter', 'spring', 'summer', 'autumn'];
const phases = ['Exploração', 'Lapidação', 'Escala', 'Extração'];
const capy = journey.querySelector('.rough-capybara');
const track = journey.querySelector('.timeline-track i');
const prompt = journey.querySelector('.scroll-prompt span');
const accessibleStory = journey.querySelector('.sr-only');
journey.querySelectorAll('.sky-glow,.sun,.cloud,.mountain,.distant-forest,.snowfall,.rainfall,.grove,.flowers,.falling-leaves,.foreground-grove,.foreground-meadow,.rough-transition,.far-hill-two').forEach(node => node.remove());
journey.querySelector('.journey-story').removeAttribute('aria-hidden');
// Two static silhouettes; colors come from the existing season variables.
const trees = document.createDocumentFragment();
for (const side of ['left', 'right']) {
  const tree = document.createElement('span');
  tree.className = `mobile-tree mobile-tree-${side}`;
  trees.append(tree);
}
journey.querySelector('.scene').append(trees);
const celestial = document.createElement('span');
celestial.className = 'mobile-celestial';
journey.querySelector('.scene').append(celestial);
// Small fixed particle budgets. CSS animates transforms, without per-frame JS.
for (const [weather, count] of [['snow', 6], ['rain', 7]]) {
  const layer = document.createElement('div');
  layer.className = `mobile-weather mobile-${weather}`;
  for (let index = 0; index < count; index++) {
    const particle = document.createElement('span');
    particle.style.left = `${8 + index * 84 / count}%`;
    particle.style.setProperty('--weather-delay', `${-index * (weather === 'snow' ? 1.3 : .17)}s`);
    layer.append(particle);
  }
  journey.querySelector('.scene').append(layer);
}
let active = -1;
let frame = 0;
let endTimer = 0;
let inView = false;
let distance = 1;
let start = 0;
let travel = 1;
let entryX = 0;
function measure() {
  start = journey.getBoundingClientRect().top + scrollY;
  distance = Math.max(1, journey.offsetHeight - sticky.offsetHeight);
  entryX = -capy.offsetWidth;
  travel = sticky.clientWidth + capy.offsetWidth;
}
function render() {
  frame = 0;
  const progress = Math.min(1, Math.max(0, (scrollY - start) / distance));
  const chapter = Math.min(3, Math.floor(progress * 4));
  if (chapter !== active) {
    active = chapter;
    sticky.dataset.season = seasons[chapter];
    chapters.forEach((node, index) => {
      node.hidden = index !== chapter;
      node.setAttribute('aria-hidden', String(index !== chapter));
    });
    accessibleStory.textContent = ''; // Visible headings provide the accessible text.
    journey.querySelector('.chapter-meta > span').textContent = `0${chapter + 1}`;
    journey.querySelector('.chapter-meta strong').textContent = phases[chapter];
    journey.querySelectorAll('.season-rail > span').forEach((node, index) => node.classList.toggle('active', index === chapter));
  }
  capy.style.transform = `translate3d(${entryX + progress * travel}px,0,0)`;
  track.style.transform = `scaleX(${progress})`;
  prompt.textContent = progress >= .999 ? 'Jornada concluída · continue rolando' : 'Role para avançar pelas quatro fases';
}
function schedule() {
  if (!frame) frame = requestAnimationFrame(render);
}
function onScroll() {
  if (!inView || document.hidden) return;
  schedule();
  if (!reducedMotion.matches) {
    capy.classList.add('mobile-walking');
    clearTimeout(endTimer);
    endTimer = setTimeout(() => capy.classList.remove('mobile-walking'), 120);
  }
}
measure();
render();
const observer = new IntersectionObserver(([entry]) => {
  inView = entry.isIntersecting;
  sticky.classList.toggle('mobile-scene-visible', inView && !document.hidden);
  if (inView) schedule();
  else capy.classList.remove('mobile-walking');
});
observer.observe(journey);
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', () => { measure(); schedule(); });
document.addEventListener('visibilitychange', () => {
  sticky.classList.toggle('mobile-scene-visible', inView && !document.hidden);
  if (document.hidden) capy.classList.remove('mobile-walking');
  else schedule();
});

// Keep the same submission destinations and messages as the desktop form.
const form = document.querySelector('.diagnosis-form');
const button = form.querySelector('button[type="submit"]');
const feedback = document.createElement('p');
feedback.className = 'form-feedback';
feedback.setAttribute('role', 'status');
feedback.hidden = true;
button.after(feedback);
let submitting = false;
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (submitting) return;
  submitting = true;
  button.disabled = true;
  button.textContent = 'Enviando solicitação...';
  feedback.hidden = true;
  const values = new FormData(form);
  const read = name => String(values.get(name) ?? '');
  const nome = read('Nome'), email = read('Email'), telefone = read('Telefone');
  const empresa = read('Empresa'), setor = read('Setor');
  const faturamento = read('Faturamento'), gargalo = read('Gargalo');
  const id = Date.now(), createdAt = new Date().toISOString();
  const payload = new FormData();
  Object.entries({Nome: nome, email, WhatsApp: telefone, Empresa: empresa, Setor: setor, Faturamento: faturamento, Gargalo: gargalo, _subject: `Nova solicitação de diagnóstico — ${empresa}`}).forEach(([key, value]) => payload.append(key, value));
  try {
    const primary = fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: payload }).then(response => {
      if (!response.ok) throw new Error('Falha no envio');
      return response;
    });
    const crm = fetch(`https://crm---grupo-portel-default-rtdb.firebaseio.com/crm_data/leads/${id}.json`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({id, nome: `${nome} (${empresa})`, email, telefone, whatsapp: telefone, nicho: setor, origem: 'site', status: 'nenhuma', obs: `Faturamento estimado: ${faturamento} | Gargalo percebido: ${gargalo}`, data_entrada: createdAt.slice(0,10), createdAt, updatedAt: createdAt}),
    });
    const confirmation = fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({service_id: 'service_34pa4so', template_id: 'template_xzrnokg', user_id: '2ywUNfa0aE9SElHK1', template_params: {to_name: nome, to_email: email, empresa}}),
    });
    const [result] = await Promise.allSettled([primary, crm, confirmation]);
    if (result.status === 'rejected') throw result.reason;
    form.reset();
    feedback.className = 'form-feedback is-success';
    feedback.textContent = 'Solicitação recebida. Nossa equipe entrará em contato pelos dados informados.';
  } catch {
    feedback.className = 'form-feedback is-error';
    feedback.textContent = 'Não foi possível enviar agora. Tente novamente ou fale conosco pelo WhatsApp.';
  } finally {
    feedback.hidden = false;
    button.disabled = false;
    button.textContent = 'Quero meu diagnóstico inicial';
    submitting = false;
  }
});
