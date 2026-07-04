// Inicializa os Ícones
lucide.createIcons();

// ----- TEMA CLARO / ESCURO -----
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

const currentHour = new Date().getHours();
let isDark = (currentHour >= 18 || currentHour < 6);

if (isDark) {
  htmlElement.setAttribute('data-theme', 'dark');
} else {
  htmlElement.removeAttribute('data-theme');
}

function updateThemeIcon() {
  if (isDark) {
    themeToggle.innerHTML = '<i data-lucide="sun" class="w-5 h-5 text-yellow-400"></i>';
  } else {
    themeToggle.innerHTML = '<i data-lucide="moon" class="w-5 h-5 text-gray-700"></i>';
  }
  lucide.createIcons();
}

themeToggle.addEventListener('click', () => {
  isDark = !isDark;
  if (isDark) {
    htmlElement.setAttribute('data-theme', 'dark');
  } else {
    htmlElement.removeAttribute('data-theme');
  }
  updateThemeIcon();
});
updateThemeIcon();

// ----- HERO SLIDER LOGIC -----
const track = document.getElementById('heroTrack');
const slides = document.querySelectorAll('.hero-slide');
const nextBtn = document.getElementById('heroNext');
  const prevBtn = document.getElementById('heroPrev');
  const dots = document.querySelectorAll('.hero-dot');
  
  let currentSlide = 0;
  const totalSlides = slides.length;
  let autoSlideInterval;

  function updateSlide() {
    track.style.transition = 'transform .6s cubic-bezier(.4,0,.2,1)';
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlide();
    resetInterval();
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlide();
    resetInterval();
  }

  nextBtn.addEventListener('click', nextSlide);
  prevBtn.addEventListener('click', prevSlide);

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      currentSlide = parseInt(e.target.getAttribute('data-idx'));
      updateSlide();
      resetInterval();
    });
  });

  function startInterval() {
    autoSlideInterval = setInterval(nextSlide, 5000);
  }

  function resetInterval() {
    clearInterval(autoSlideInterval);
    startInterval();
  }
  startInterval(); // Inicia o carrossel automático

  // --- NOVA LÓGICA DE ARRASTAR E SOLTAR (SWIPE) ---
  let startX = 0;
  let isSwiping = false;
  let movementX = 0;

  function touchStart(e) {
    isSwiping = true;
    // Captura o X do mouse ou do dedo
    startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    track.style.transition = 'none'; // Remove animação suave para grudar no movimento
    clearInterval(autoSlideInterval); // Pausa a rotação automática
  }

  function touchMove(e) {
    if (!isSwiping) return;
    const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    movementX = currentX - startX;
    
    // Move o banner em tempo real somado à posição atual da tela
    const baseTranslate = currentSlide * -100;
    track.style.transform = `translateX(calc(${baseTranslate}% + ${movementX}px))`;
  }

  function touchEnd() {
    if (!isSwiping) return;
    isSwiping = false;
    
    // Se o usuário arrastou mais de 70 pixels para a esquerda (Avançar)
    if (movementX < -70) {
      currentSlide = (currentSlide + 1) % totalSlides;
    } 
    // Se o usuário arrastou mais de 70 pixels para a direita (Voltar)
    else if (movementX > 70) {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    }
    
    movementX = 0;
    updateSlide();
    resetInterval();
  }

  // Eventos para Mouse (Computador)
  track.addEventListener('mousedown', touchStart);
  track.addEventListener('mousemove', touchMove);
  track.addEventListener('mouseup', touchEnd);
  track.addEventListener('mouseleave', () => { if(isSwiping) touchEnd(); });

  // Eventos para Touch (Celular)
  track.addEventListener('touchstart', touchStart, {passive: true});
  track.addEventListener('touchmove', touchMove, {passive: true});
  track.addEventListener('touchend', touchEnd);

  // ----- FAQ ACCORDION -----
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      faqItems.forEach(otherItem => {
        if(otherItem !== item) otherItem.classList.remove('open');
      });
      item.classList.toggle('open');
    });
  });

  // ----- MOBILE MENU -----
  const menuBtn = document.getElementById('menuBtn');
  const navMenu = document.querySelector('.nav-menu');
  const navCtas = document.querySelector('.nav-ctas');

  menuBtn.addEventListener('click', () => {
      const isVisible = navMenu.style.display === 'flex';
      
      if(isVisible){
          navMenu.style.display = 'none';
          navCtas.style.display = 'none';
      } else {
          navMenu.style.display = 'flex';
          navMenu.style.flexDirection = 'column';
          navMenu.style.position = 'absolute';
          navMenu.style.top = '72px';
          navMenu.style.left = '0';
          navMenu.style.width = '100%';
          navMenu.style.background = 'var(--dark)';
          navMenu.style.padding = '20px 0';
          navMenu.style.borderBottom = '1px solid var(--border-light)';
          
          navCtas.style.display = 'flex';
          navCtas.style.position = 'absolute';
          navCtas.style.top = '300px';
          navCtas.style.left = '50%';
          navCtas.style.transform = 'translateX(-50%)';
      }
  });

  // ----- COOKIE CONSENT & GOOGLE TAGS LOGIC -----
  const cookieBanner = document.getElementById('cookieBanner');
  const acceptBtn = document.getElementById('acceptCookies');
  const declineBtn = document.getElementById('declineCookies');

  // Verifica no navegador do usuário se ele já tomou uma decisão antes
  const cookieChoice = localStorage.getItem('portel_cookie_consent');

  if (!cookieChoice) {
    // Se ele nunca respondeu, mostra o banner depois de 1 segundo
    setTimeout(() => {
      if(cookieBanner) cookieBanner.classList.add('show');
    }, 1000);
  } else if (cookieChoice === 'accepted') {
    // Se ele já aceitou em uma visita anterior, carrega as tags direto
    loadGoogleTags();
  }

  // Quando clica em Aceitar
  if(acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('portel_cookie_consent', 'accepted');
      cookieBanner.classList.remove('show');
      loadGoogleTags();
    });
  }

  // Quando clica em Recusar
  if(declineBtn) {
    declineBtn.addEventListener('click', () => {
      localStorage.setItem('portel_cookie_consent', 'declined');
      cookieBanner.classList.remove('show');
    });
  }

  // ===== LÓGICA DO FUNIL EDUCACIONAL =====
document.addEventListener('DOMContentLoaded', () => {
  
  // Dados de cada etapa do funil para explicar a operação
  const funnelData = {
    'descoberta': {
      title: 'Fase 1: Descoberta',
      oque: 'O público-alvo ainda não conhece sua empresa. Eles estão navegando nas redes ou pesquisando soluções iniciais de forma passiva.',
      como: 'Criamos campanhas de anúncios (Ads) ultra segmentadas para colocar a sua marca de frente com quem realmente tem poder de compra, gerando volume e atenção.'
    },
    'interesse': {
      title: 'Fase 2: Interesse',
      oque: 'O consumidor percebe que tem um problema ou desejo e entende que a sua empresa atua nessa área.',
      como: 'Implementamos iscas digitais, conteúdos estratégicos e páginas de alta conversão (Landing Pages) para capturar o contato desse visitante e transformá-lo em um Lead.'
    },
    'desejo': {
      title: 'Fase 3: Desejo',
      oque: 'O lead está comparando opções. Ele precisa entender por que a sua solução é a melhor escolha técnica e financeira do mercado.',
      como: 'Atuamos com fluxos de automação de e-mail e estruturamos o setor de Pré-vendas (SDR) para qualificar o lead, quebrando objeções antes mesmo da reunião.'
    },
    'venda': {
      title: 'Fase 4: Venda',
      oque: 'O momento da decisão. O prospect está na mesa de negociação com o seu time comercial.',
      como: 'Desenhamos scripts de vendas, estruturamos o seu CRM e treinamos a sua equipe comercial com técnicas de fechamento para aumentar a taxa de conversão (Win-rate).'
    },
    'pos-venda': {
      title: 'Fase 5: Pós-Venda (Fidelização)',
      oque: 'O contrato foi fechado. O cliente espera receber o que foi prometido e ter um bom suporte.',
      como: 'Estruturamos processos de retenção (Customer Success) e campanhas de Remarketing para gerar Up-sell (vender mais para o mesmo cliente) e aumentar o LTV.'
    }
  };

  const layers = document.querySelectorAll('.funnel-layer');
  const contentBox = document.getElementById('funnel-content');

  // Função para atualizar o texto na tela
  function updateFunnelContent(stageKey) {
    const data = funnelData[stageKey];
    contentBox.innerHTML = `
      <h3 style="font-family: 'Montserrat', sans-serif; font-size: 24px; color: var(--gold); margin-bottom: 24px;">${data.title}</h3>
      
      <div style="margin-bottom: 20px;">
        <span style="display: block; font-size: 13px; color: var(--muted); font-weight: 800; text-transform: uppercase; margin-bottom: 8px;"><i data-lucide="eye" style="width: 14px; display: inline-block; vertical-align: middle;"></i> O que acontece?</span>
        <p style="color: var(--text); font-size: 15px; line-height: 1.6; font-weight: 500;">${data.oque}</p>
      </div>

      <div>
        <span style="display: block; font-size: 13px; color: var(--gold); font-weight: 800; text-transform: uppercase; margin-bottom: 8px;"><i data-lucide="crosshair" style="width: 14px; display: inline-block; vertical-align: middle;"></i> Nosso Papel</span>
        <p style="color: var(--text); font-size: 15px; line-height: 1.6; font-weight: 500;">${data.como}</p>
      </div>
    `;
    lucide.createIcons(); // Recarrega os ícones novos injetados
  }

  // Evento de passar o mouse em cada camada do funil
  layers.forEach(layer => {
    layer.addEventListener('mouseenter', function() {
      // Remove classe active de todos
      layers.forEach(l => l.classList.remove('active'));
      // Adiciona no clicado
      this.classList.add('active');
      // Atualiza o texto
      updateFunnelContent(this.getAttribute('data-stage'));
    });
  });

  // Carrega a primeira fase por padrão ao abrir o site
  updateFunnelContent('descoberta');

}); // <-- Fechamento do DOMContentLoaded

  // Função que realmente injeta o Google Tag Manager
  function loadGoogleTags() {
    console.log("Cookies aceitos. Carregando scripts de rastreamento...");
    // Suas tags entram aqui no futuro
  }

// ===== SCROLL ANIMATIONS =====
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Trigger counter if it's a number
                if (entry.target.classList.contains('num-value') && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    startCounter(entry.target);
                }
                
                // observer.unobserve(entry.target); // keep observing if we want it to hide/show, but usually we just unobserve
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-up, .reveal-fade, .num-value, .r-img').forEach(el => {
        observer.observe(el);
    });

    function startCounter(el) {
        const text = el.innerText;
        const match = text.match(/([+]*)([0-9]+)(.*)/);
        if (match) {
            const prefix = match[1];
            const target = parseInt(match[2]);
            const suffix = match[3];
            let current = 0;
            const duration = 2000;
            const stepTime = Math.abs(Math.floor(duration / target));
            
            const timer = setInterval(() => {
                current += Math.ceil(target / 50); // fast increment
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                el.innerText = prefix + current + suffix;
            }, stepTime > 10 ? stepTime : 10);
        }
    }
});

// ===== INTRO / PRELOADER =====
document.addEventListener("DOMContentLoaded", () => {
    const intro = document.getElementById("intro");
    if (!intro) return;

    const slides = intro.querySelectorAll(".intro-s");
    if (slides.length > 0) {
        // Show first slide
        slides[0].classList.add("in");
        
        // Hide after 1.5s
        setTimeout(() => {
            slides[0].classList.remove("in");
            slides[0].classList.add("out");
            
            // Slide up the intro wrapper
            setTimeout(() => {
                intro.classList.add("intro-out");
                // Allow scrolling (if we disabled it)
                document.body.style.overflow = "";
            }, 400);
        }, 1500);
    }
});

// ===== MAGNETIC CURSOR =====
const cDot = document.querySelector('.c-dot');
const cRing = document.querySelector('.c-ring');

if (cDot && cRing && window.innerWidth >= 900) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const animateCursor = () => {
        // Dot follows fast
        dotX += (mouseX - dotX) * 0.5;
        dotY += (mouseY - dotY) * 0.5;
        cDot.style.left = dotX + 'px';
        cDot.style.top = dotY + 'px';

        // Ring follows slower (lag effect)
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        cRing.style.left = ringX + 'px';
        cRing.style.top = ringY + 'px';

        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Hover effect on interactable elements
    const hoverElements = document.querySelectorAll('a, button, input, select, .funnel-layer');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cDot.classList.add('big');
            cRing.classList.add('big');
        });
        el.addEventListener('mouseleave', () => {
            cDot.classList.remove('big');
            cRing.classList.remove('big');
        });
    });
}