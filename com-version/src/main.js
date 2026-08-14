import '@fontsource-variable/manrope';
import '@fontsource-variable/wix-madefor-display';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const bindRussianTypography = () => {
  const selector = 'h1,h2,h3,p,li,a,button,span,label';
  const nodes = document.querySelectorAll(selector);
  const shortWords = /(^|\s)(а|без|бы|в|во|да|для|до|же|за|и|из|их|к|ко|ли|на|над|не|ни|но|о|об|от|по|под|при|про|с|со|у)\s+(?=[А-Яа-яЁёA-Za-z0-9«])/gi;
  const numberUnits = /(\d)\s+(?=(?:Р|%|дн|день|дня|дней|год|года|лет|января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)\b)/gi;
  nodes.forEach((node) => {
    [...node.childNodes].filter((child) => child.nodeType === Node.TEXT_NODE).forEach((child) => {
      child.textContent = child.textContent.replace(shortWords, '$1$2\u00a0').replace(numberUnits, '$1\u00a0');
    });
  });
};

const glueSplitHeadingWords = (heading, words) => {
  const glueWords = new Set(['а', 'без', 'бы', 'в', 'во', 'да', 'для', 'до', 'же', 'за', 'и', 'из', 'их', 'к', 'ко', 'ли', 'на', 'над', 'не', 'ни', 'но', 'о', 'об', 'от', 'по', 'под', 'при', 'про', 'с', 'со', 'у']);
  for (let index = 0; index < words.length - 1; index += 1) {
    const value = words[index].textContent.trim().toLowerCase();
    if (!glueWords.has(value) || words[index].closest('.no-break')) continue;
    let end = index + 1;
    while (end < words.length - 1 && glueWords.has(words[end].textContent.trim().toLowerCase())) end += 1;
    const group = document.createElement('span');
    group.className = 'no-break';
    words[index].before(group);
    for (let cursor = index; cursor <= end; cursor += 1) {
      if (cursor > index) group.append(document.createTextNode('\u00a0'));
      group.append(words[cursor]);
    }
    index = end;
  }
};

const initSmoothScroll = () => {
  if (reduceMotion) return;
  const lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: .9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
};

const initHeader = () => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const menuToggle = header.querySelector('.mobile-menu-toggle');
  const menuPanel = header.querySelector('.mobile-menu-panel');
  const closeMenu = ({ returnFocus = false } = {}) => {
    header.classList.remove('menu-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    if (returnFocus) menuToggle?.focus();
  };
  menuToggle?.addEventListener('click', () => {
    const willOpen = !header.classList.contains('menu-open');
    header.classList.toggle('menu-open', willOpen);
    menuToggle.setAttribute('aria-expanded', String(willOpen));
  });
  menuPanel?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('pointerdown', (event) => {
    if (!header.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('menu-open')) closeMenu({ returnFocus: true });
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 600) closeMenu();
  });
  ScrollTrigger.create({
    start: 120,
    onUpdate: (self) => header.classList.toggle('is-visible', self.scroll() > 120),
  });
  document.querySelectorAll('[data-nav]').forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 48%',
      end: 'bottom 48%',
      onToggle: ({ isActive }) => {
        if (!isActive) return;
        document.querySelectorAll('.nav-links a, .mobile-menu-panel nav a').forEach((link) => {
          const active = link.getAttribute('href') === `#${section.id}`;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      },
    });
  });
};

const initRevealMotion = () => {
  if (reduceMotion) return;
  const compact = window.innerWidth < 681;
  document.querySelectorAll('.split-heading').forEach((heading, index) => {
    const split = new SplitType(heading, { types: 'words' });
    glueSplitHeadingWords(heading, split.words);
    const wordCount = split.words.length;
    const mode = heading.classList.contains('hero-title') ? 'hero' : index % 3;
    const variants = {
      0: { y: compact ? 16 : 26, opacity: 0, filter: 'blur(7px)', rotateX: 0 },
      1: { x: compact ? 8 : 14, opacity: 0, clipPath: 'inset(0 100% 0 0)', filter: 'blur(2px)' },
      2: { y: compact ? 14 : 22, opacity: 0, rotateX: -38, transformOrigin: '50% 100%', filter: 'blur(4px)' },
      hero: { y: compact ? 15 : 24, opacity: 0, clipPath: 'inset(0 0 100% 0)', filter: 'blur(5px)' },
    };
    gsap.from(split.words, {
      ...variants[mode],
      duration: compact ? .58 : mode === 1 ? .72 : .78,
      stagger: wordCount > 18 ? .014 : compact ? .022 : .032,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: heading,
        start: heading.classList.contains('hero-title') ? 'top 98%' : 'top 86%',
        once: true,
        onLeave: () => split.words.forEach((word) => {
          word.style.willChange = 'auto';
          word.style.clipPath = 'none';
        }),
      },
    });
  });
  gsap.utils.toArray('.reveal').forEach((element, index) => {
    if (element.closest('.hero')) return;
    gsap.from(element, {
      y: index % 2 ? 12 : 18,
      opacity: 0,
      filter: index % 3 === 0 ? 'blur(5px)' : 'blur(2px)',
      duration: compact ? .48 : .62,
      ease: 'power4.out',
      scrollTrigger: { trigger: element, start: 'top 88%', once: true },
    });
  });
  const heroTimeline = gsap.timeline({ defaults: { ease: 'power4.out' } });
  heroTimeline
    .from('.hero .tag', { opacity: 0, y: 10, duration: .42 }, .08)
    .from('.hero-benefit', { opacity: 0, y: 14, duration: .52 }, .34)
    .from('.hero-calculator-link', { opacity: 0, y: 10, duration: .44 }, .43)
    .from('.hero-copy .button', { opacity: 0, y: 14, clipPath: 'inset(0 100% 0 0)', duration: .62 }, .48)
    .from('.hero-date, .hero-audience', { opacity: 0, y: 9, stagger: .1, duration: .42 }, .68)
    .from('.hero-portrait', { opacity: 0, clipPath: 'inset(0 0 100% 0)', duration: compact ? .72 : .95 }, compact ? .18 : .28)
    .fromTo('.hero-portrait img', { y: compact ? 22 : 34, scale: 1.025 }, { y: 0, scale: 1, duration: compact ? .7 : 1.02 }, compact ? .34 : .44);
  if (!compact) gsap.to('.hero-orbit', { rotate: 44, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .8 } });
  gsap.utils.toArray('.reveal-media:not(.hero-portrait)').forEach((media, index) => {
    const from = index % 2 === 0
      ? { clipPath: 'inset(0 100% 0 0)', opacity: .35 }
      : { clipPath: 'inset(8% 8% 8% 8%)', opacity: 0 };
    gsap.from(media, {
      ...from,
      duration: compact ? .68 : .95,
      ease: 'power4.out',
      scrollTrigger: { trigger: media, start: 'top 82%', once: true },
    });
    gsap.from(media.querySelector('img'), {
      scale: index % 2 === 0 ? 1.06 : 1.1,
      filter: 'blur(6px)',
      duration: compact ? .72 : 1.08,
      ease: 'power4.out',
      scrollTrigger: { trigger: media, start: 'top 82%', once: true },
    });
  });
};

const initRouteMotion = () => {
  if (reduceMotion || window.innerWidth < 681) return;
  gsap.to('.route-line span', {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: { trigger: '.route-shell', start: 'top 70%', end: 'bottom 68%', scrub: .8 },
  });
  gsap.utils.toArray('.route-item').forEach((item, index) => {
    const isFinal = item.classList.contains('route-item--final');
    gsap.from(item, {
      x: isFinal ? 0 : index % 2 === 0 ? -44 : 44,
      y: isFinal ? 28 : 0,
      opacity: 0,
      filter: 'blur(7px)',
      duration: .78,
      ease: 'power4.out',
      scrollTrigger: { trigger: item, start: 'top 82%', once: true },
    });
  });
};

const initCalculator = () => {
  const form = document.querySelector('#gap-calculator');
  if (!form) return;
  const format = new Intl.NumberFormat('ru-RU');
  const clean = (value) => Number(String(value).replace(/\D/g, '')) || 0;
  const paintRange = (range) => {
    const min = Number(range.min);
    const max = Number(range.max);
    const percent = ((Number(range.value) - min) / (max - min)) * 100;
    range.style.setProperty('--range-progress', `${percent}%`);
  };
  const update = () => {
    const data = new FormData(form);
    const goal = clean(data.get('goal'));
    const earned = clean(data.get('earned'));
    const expected = clean(data.get('expected'));
    const price = Math.max(clean(data.get('price')), 1);
    const gap = Math.max(goal - earned - expected, 0);
    const sales = gap ? Math.ceil(gap / price) : 0;
    document.querySelector('#gap-value').textContent = `${format.format(gap)} Р`;
    document.querySelector('#sales-value').textContent = gap
      ? `Это ${format.format(sales)} продаж продукта со средним чеком ${format.format(price)} Р.`
      : 'При текущем сценарии разрыва до цели нет. Можно планировать рост без аврального режима.';
    if (!reduceMotion) gsap.fromTo('.calc-result', { scale: .985, filter: 'brightness(1.08)' }, { scale: 1, filter: 'brightness(1)', duration: .28, ease: 'power3.out', overwrite: true });
  };
  form.querySelectorAll('.input-wrap input').forEach((input) => {
    input.addEventListener('focus', () => input.select());
    input.addEventListener('input', update);
    input.addEventListener('blur', () => { input.value = clean(input.value); update(); });
  });
  form.querySelectorAll('.calc-range').forEach((range) => {
    const numberInput = form.elements[range.dataset.for];
    paintRange(range);
    range.addEventListener('input', () => {
      numberInput.value = range.value;
      paintRange(range);
      update();
    });
    numberInput.addEventListener('input', () => {
      range.value = Math.min(Math.max(clean(numberInput.value), Number(range.min)), Number(range.max));
      paintRange(range);
    });
  });
  update();
};

const initMicroInteractions = () => {
  if (reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('.magnetic').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * .1;
      const y = (event.clientY - rect.top - rect.height / 2) * .14;
      gsap.to(element, { x, y, duration: .24, ease: 'power3.out', overwrite: true });
    });
    element.addEventListener('pointerleave', () => gsap.to(element, { x: 0, y: 0, duration: .42, ease: 'elastic.out(1, .42)', overwrite: true }));
  });
  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const rx = ((event.clientY - rect.top) / rect.height - .5) * -2.4;
      const ry = ((event.clientX - rect.left) / rect.width - .5) * 3.2;
      gsap.to(card, { rotateX: rx, rotateY: ry, y: -3, duration: .25, ease: 'power2.out', overwrite: true });
    });
    card.addEventListener('pointerleave', () => gsap.to(card, { rotateX: 0, rotateY: 0, y: 0, duration: .42, ease: 'power3.out', overwrite: true }));
  });
};

bindRussianTypography();
initSmoothScroll();
initHeader();
initRevealMotion();
initRouteMotion();
initCalculator();
initMicroInteractions();

window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
