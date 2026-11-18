/* =========================================================
   Henri Mouraire — interactions
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;
  const body = document.body;

  const CDN = 'https://cdn.shopify.com/s/files/1/0790/4778/6826/files/';
  const img = (file, w = 800) => `${CDN}${file}&width=${w}`;
  const STORE = 'https://henrimouraire.com';
  const LANGS = ['fr', 'en', 'es'];
  let lang = 'fr';
  try {
    const saved = localStorage.getItem('hm-lang');
    if (LANGS.includes(saved)) lang = saved;
    else {
      const nav = (navigator.languages || [navigator.language || 'fr']).map((l) => l.slice(0, 2).toLowerCase());
      lang = nav.find((l) => LANGS.includes(l)) || 'fr';
    }
  } catch (e) { /* stockage indisponible */ }
  const t = (key, vars) => {
    const dict = (window.I18N && window.I18N[lang]) || {};
    let str = dict[key] ?? (window.I18N && window.I18N.fr[key]) ?? key;
    if (vars) for (const k in vars) str = str.split(`{${k}}`).join(vars[k]);
    return str;
  };
  // la boutique Shopify existe en français et en anglais (/en) ; l'espagnol renvoie vers l'anglais
  const storeBase = () => (lang === 'fr' ? STORE : `${STORE}/en`);
  const famName = (f) => t('fam.' + f);

  /* ---------------------------------------------------------
     Données — familles de teintes, nuancier, collection
     --------------------------------------------------------- */
  const FAM = {
    cristal: { c: '#C9D4DC' },
    bleu: { c: '#1C3FD8' },
    orange: { c: '#FF6A00' },
    rouge: { c: '#D50F1F' },
    vert: { c: '#10A84C' },
    profond: { c: '#0E6A55' },
    acide: { c: '#B4DC00' },
    rose: { c: '#FF2E8C' },
    fuchsia: { c: '#C3127A' },
    violet: { c: '#9C88E2' },
    ambre: { c: '#B98B5E' },
    gris: { c: '#7F8991' },
    noir: { c: '#151515' },
    blanc: { c: '#F4F3EF' },
  };


  // ordre d'affichage du filtre couleur
  const FAM_ORDER = ['bleu', 'orange', 'rouge', 'rose', 'fuchsia', 'violet', 'vert', 'acide', 'profond', 'ambre', 'gris', 'noir', 'blanc', 'cristal'];

  const PRODUCTS = [
    { h: 'bague-oxyde', name: 'Oxide Ring', type: 'bague', price: '85 €', hue: '#1C3FD8',
      a: 'VARIATION-AI-19-AI.png?v=1774860893', b: 'VARIATION-AI-8-AI_1.png?v=1774860893',
      fam: ['cristal', 'bleu', 'orange', 'vert', 'profond', 'rouge', 'gris', 'noir', 'blanc'] },
    { h: 'bague-torsade', name: 'ZED Torsade Ring', type: 'bague', price: '59 €', hue: '#1C3FD8',
      a: 'VARIATION-AI-1-AI_2.png?v=1772373093', b: 'VARIATION-AI-3-AI.png?v=1772371065',
      fam: ['bleu', 'rouge', 'orange', 'vert', 'ambre', 'gris', 'noir', 'blanc'] },
    { h: 'bague-plateforme', name: 'Bague Plateforme', type: 'bague', price: '84 €', hue: '#D50F1F',
      a: 'pomelli_photoshoot_image_4_5_1023_11.png?v=1792758962', b: 'pomelli_photoshoot_image_4_5_1023_10.png?v=1792758678',
      fam: ['rouge', 'orange', 'gris'] },
    { h: 'bague-carree', name: 'Bague Carrée', type: 'bague', price: '44 €', from: true, hue: '#10A84C',
      a: 'pomelli_photoshoot_image_4_5_1021_8.png?v=1792676521', b: 'pomelli_photoshoot_image_4_5_1021_5.png?v=1792676521',
      fam: ['vert', 'orange', 'rouge'] },
    { h: 'bracelets-froisses', name: 'Bracelet Froissé', type: 'bracelet', price: '49 €', hue: '#FF2E8C',
      a: 'pomelli_photoshoot_image_4_5_1022_15.png?v=1792677219', b: 'pomelli_photoshoot_image_4_5_1022_11.png?v=1792677218',
      fam: ['rose', 'orange', 'rouge', 'fuchsia', 'acide', 'ambre', 'gris', 'noir', 'blanc', 'cristal'] },
    { h: 'bracelet-vrille', name: 'Bracelet Vrillé', type: 'bracelet', price: '39 €', hue: '#1C3FD8',
      a: 'VARIATION-AI-10-AI_1.png?v=1774820923', b: 'VARIATION-AI-8-AI_2.png?v=1774820238',
      fam: ['bleu', 'rouge', 'rose', 'orange', 'profond', 'acide', 'noir', 'blanc'] },
    { h: 'bracelet-plat', name: 'Bracelet Plat', type: 'bracelet', price: '49 €', hue: '#FF6A00',
      a: 'pomelli_photoshoot_image_4_5_1021_2_a4acf9db-5fd9-4fb4-8c2c-16493ba0f6e7.png?v=1792756806', b: 'pomelli_photoshoot_image_4_5_1021_06478a05-3db5-424b-b890-8b9cb6fb9f08.png?v=1792756807',
      fam: ['bleu', 'orange'] },
    { h: 'bague-damier', name: 'Bague Damier', type: 'bague', price: '120 €', hue: '#151515',
      a: 'VARIATION-AI-2-AI.png?v=1774799826', b: null,
      fam: ['noir', 'blanc'] },
    { h: 'collier-torsade', name: 'Collier Torsade', type: 'collier', price: '49 €', hue: '#D50F1F',
      a: 'IMG_5529.jpg?v=1716392854', b: 'IMG_5523.jpg?v=1716392781',
      fam: ['rouge', 'bleu', 'orange', 'vert', 'gris', 'noir', 'blanc'] },
    { h: 'boucles-d-oreilles-feuille', name: 'Boucles Feuille', type: 'boucles', price: '39 €', hue: '#1C3FD8',
      a: 'VARIATION-AI-13-AI.png?v=1774993826', b: 'VARIATION-AI-5-AI.png?v=1774993826',
      fam: ['bleu', 'orange', 'rouge', 'vert', 'profond', 'acide', 'rose', 'fuchsia', 'violet', 'ambre', 'gris', 'noir', 'blanc', 'cristal'] },
    { h: 'boucles-asymetriques', name: 'Boucles Asymétriques', type: 'boucles', price: '39 €', hue: '#FF2E8C',
      a: 'pomelli_photoshoot_image_4_5_1022_8.png?v=1792676521', b: 'pomelli_photoshoot_image_4_5_1022.png?v=1792676520',
      fam: ['rose', 'bleu', 'rouge', 'fuchsia', 'gris'] },
    { h: 'creoles-et-disques', name: 'Créoles & Disques', type: 'boucles', price: '49 €', hue: '#1C3FD8', contain: true,
      a: '64C7EAD5-59CE-44A0-A39A-CB5128626322.jpg?v=1774625874', b: '5382E94C-232C-4367-B205-45D10AC4880E.jpg?v=1774625875',
      fam: ['bleu', 'orange', 'rouge', 'vert', 'profond', 'acide', 'rose', 'fuchsia', 'ambre', 'gris', 'noir', 'blanc'] },
  ];

  // photos réelles de chaque pièce dans une famille de teinte (galeries de la boutique)
  const COLOR_IMG = {
    'bague-oxyde': {
      orange: 'VARIATION-AI-18-AI.png?v=1774860893',
      bleu: 'VARIATION-AI-19-AI.png?v=1774860893',
      vert: 'VARIATION-AI-9-AI.png?v=1774860893',
      noir: 'VARIATION-AI-17-AI.png?v=1774860893',
      cristal: 'VARIATION-AI-4-AI_1.png?v=1774860893',
      blanc: 'VARIATION-AI-12-AI.png?v=1774860893',
      rouge: 'VARIATION-AI-8-AI_1.png?v=1774860893',
    },
    'bague-torsade': {
      rouge: 'VARIATION-AI-3-AI.png?v=1772371065',
      vert: 'VARIATION-AI-20-AI.png?v=1774646894',
      noir: 'VARIATION-AI-7-AI.png?v=1772371065',
      blanc: 'VARIATION-AI-8-AI.png?v=1772371065',
      orange: 'VARIATION-AI-1-AI_1.png?v=1772373093',
      bleu: 'VARIATION-AI-1-AI_2.png?v=1772373093',
    },
    'bague-plateforme': {
      gris: 'pomelli_business_profile_image_1022.png?v=1792681255',
      rouge: 'pomelli_photoshoot_image_4_5_1023_11.png?v=1792758962',
      orange: 'pomelli_photoshoot_image_4_5_1023_10.png?v=1792758678',
    },
    'bague-carree': {
      vert: 'pomelli_photoshoot_image_4_5_1021_8.png?v=1792676521',
      orange: 'pomelli_photoshoot_image_4_5_1021_5.png?v=1792676521',
      rouge: 'pomelli_photoshoot_image_4_5_1021_4.png?v=1792676521',
    },
    'bracelets-froisses': {
      rouge: 'pomelli_photoshoot_image_4_5_1022_13.png?v=1792677219',
      orange: 'pomelli_photoshoot_image_4_5_1022_11.png?v=1792677218',
      gris: 'pomelli_photoshoot_image_4_5_1022_16.png?v=1792677218',
      noir: 'pomelli_photoshoot_image_4_5_1022_19.png?v=1792677218',
      rose: 'pomelli_photoshoot_image_4_5_1022_15.png?v=1792677219',
      acide: 'pomelli_business_profile_image_1023.png?v=1792751985',
      fuchsia: 'pomelli_photoshoot_image_4_5_1023_2.png?v=1792756357',
      blanc: 'pomelli_photoshoot_image_4_5_1023_4.png?v=1792756350',
      cristal: 'pomelli_photoshoot_image_4_5_1023_5.png?v=1792756357',
    },
    'bracelet-vrille': {
      orange: 'VARIATION-AI-8-AI_2.png?v=1774820238',
      rose: 'VARIATION-AI-3-AI_4.png?v=1774820238',
      profond: 'IMG_4733.jpg?v=1774820238',
      acide: 'VARIATION-AI-2-AI_1.png?v=1774820238',
      rouge: 'VARIATION-AI-1-AI_6.png?v=1774820410',
      noir: 'VARIATION-AI-3-AI_5.png?v=1774820585',
      blanc: 'VARIATION-AI-6-AI.png?v=1774820787',
      bleu: 'VARIATION-AI-10-AI_1.png?v=1774820923',
    },
    'bracelet-plat': {
      bleu: 'pomelli_photoshoot_image_4_5_1021_2_a4acf9db-5fd9-4fb4-8c2c-16493ba0f6e7.png?v=1792756806',
      orange: 'pomelli_photoshoot_image_4_5_1021_06478a05-3db5-424b-b890-8b9cb6fb9f08.png?v=1792756807',
    },
    'collier-torsade': {
      bleu: 'IMG_5523.jpg?v=1716392781',
      noir: 'IMG_5527.jpg?v=1716392836',
      rouge: 'IMG_5529.jpg?v=1716392854',
      orange: 'IMG_5528.jpg?v=1716392874',
      gris: 'IMG_5522.jpg?v=1716392892',
      blanc: 'IMG_5530_8fc814f7-4224-485e-9db5-5c59e69f3799.jpg?v=1716392913',
    },
    'boucles-d-oreilles-feuille': {
      bleu: 'VARIATION-AI-13-AI.png?v=1774993826',
      orange: 'VARIATION-AI-5-AI.png?v=1774993826',
      vert: 'VARIATION-AI-12-AI_1_49b3fd2e-8783-427f-920d-c99d69f8a818.png?v=1774993826',
      rouge: 'VARIATION-AI-1-AI.png?v=1774993826',
      noir: 'VARIATION-AI-2-AI_373839df-3da8-4f4d-bae3-13050f64b690.png?v=1774993826',
      rose: 'VARIATION-AI-5-AI_1.png?v=1774993827',
      violet: 'VARIATION-AI-12-AI_0f9e26bf-8992-4b1b-9cc6-b1c257e40255.png?v=1774993827',
      fuchsia: 'VARIATION-AI-14-AI.png?v=1774993826',
      ambre: 'VARIATION-AI-11-AI_1.png?v=1774993826',
      gris: 'VARIATION-AI-9-AI_fe38d07d-be65-4ae0-bb9b-7e078242908a.png?v=1774993826',
      blanc: 'VARIATION-AI-2-AI_1_552770f2-09b4-4dd1-a035-7e87b2012338.png?v=1774993826',
      acide: 'VARIATION-AI-10-AI_567206fd-d399-4922-8bcc-0e6f7a0664ce.png?v=1774993826',
      cristal: 'VARIATION-AI-7-AI_1.png?v=1774993826',
    },
    'boucles-asymetriques': {
      bleu: 'pomelli_photoshoot_image_4_5_1022.png?v=1792676520',
      rouge: 'pomelli_photoshoot_image_4_5_1022_5.png?v=1792676521',
      gris: 'pomelli_photoshoot_image_4_5_1022_3.png?v=1792676521',
      rose: 'pomelli_photoshoot_image_4_5_1022_8.png?v=1792676521',
      fuchsia: 'pomelli_photoshoot_image_4_5_1022_6.png?v=1792676521',
    },
    'creoles-et-disques': {
      fuchsia: '1F9EEE57-6DAF-43F4-92F8-C08239DD9150.jpg?v=1774625874',
      bleu: '64C7EAD5-59CE-44A0-A39A-CB5128626322.jpg?v=1774625874',
      orange: '50EF21FA-C16B-475D-A058-22E3907020FC.jpg?v=1774625875',
      rose: '5382E94C-232C-4367-B205-45D10AC4880E.jpg?v=1774625875',
      profond: 'C81CE582-C8B5-420B-B184-AB1FEA11CCB1.jpg?v=1774625874',
      gris: 'F68F27B9-2469-4AE4-BC19-69495CA3088E.jpg?v=1774625874',
      rouge: 'D5E5CEF4-4920-4F77-BC88-B721E5C05B73.jpg?v=1774625874',
      ambre: '02CBD31B-5221-4C22-A3C8-B477021675FA.jpg?v=1774625875',
      vert: '98EECA88-4A4C-4668-B17D-B374FF60B240.jpg?v=1774625874',
      acide: '2F4CB15B-8738-4555-992D-310954C0FC5C.jpg?v=1774625877',
      noir: '49CE140E-F2A4-4948-97CB-144155A05DF8.jpg?v=1775129355',
    },
  };

  /* ---------------------------------------------------------
     Couleur — le "gel" courant
     --------------------------------------------------------- */
  const hexToRgb = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const rgbToHex = (r) => '#' + r.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
  const shade = (h, k) => rgbToHex(hexToRgb(h).map((v) => v * (1 - k)));
  const lum = (h) => {
    const [r, g, b] = hexToRgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  function setGel(hex) {
    const L = lum(hex);
    // forme sur papier (multiply) : jamais trop pâle, sinon elle disparaît
    const shape = L > 0.7 ? shade(hex, 0.22) : hex;
    // texte sur papier : assez sombre pour rester lisible
    let ink = hex;
    if (L > 0.45) ink = shade(hex, 0.62);
    else if (L > 0.22) ink = shade(hex, 0.38);
    // accent sur fond nuit : jamais trop sombre
    const dark = L < 0.03 ? '#F4EFE6' : hex;
    root.style.setProperty('--gel', shape);
    root.style.setProperty('--gel-ink', ink);
    root.style.setProperty('--gel-dark', dark);
  }

  /* ---------------------------------------------------------
     Smooth scroll (Lenis si disponible)
     --------------------------------------------------------- */
  let lenis = null;
  function initLenis() {
    if (reduce || !window.Lenis) return;
    try {
      lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
      if (body.classList.contains('is-loading')) lenis.stop();
    } catch (e) { lenis = null; }
  }
  function scrollToTarget(target) {
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ---------------------------------------------------------
     Préloader
     --------------------------------------------------------- */
  function initLoader() {
    const countEl = $('#loaderCount');
    const heroImg = $('#heroImg');
    let seen = false;
    try { seen = sessionStorage.getItem('hm-seen') === '1'; sessionStorage.setItem('hm-seen', '1'); } catch (e) { /* stockage indisponible */ }

    const duration = reduce ? 0 : seen ? 700 : 1700;
    const imgReady = new Promise((res) => {
      if (!heroImg || heroImg.complete) return res();
      heroImg.addEventListener('load', res, { once: true });
      heroImg.addEventListener('error', res, { once: true });
      setTimeout(res, 3500);
    });

    const t0 = performance.now();
    let gathered = false;
    const tick = (now) => {
      const p = duration ? clamp((now - t0) / duration) : 1;
      const eased = 1 - (1 - p) ** 3;
      countEl.textContent = Math.round(eased * 100);
      if (p > 0.55 && !gathered) { gathered = true; body.classList.add('is-gathering'); }
      if (p < 1) requestAnimationFrame(tick);
      else imgReady.then(() => setTimeout(reveal, reduce ? 0 : 380));
    };
    requestAnimationFrame(tick);

    function reveal() {
      body.classList.add('is-ready');
      body.classList.remove('is-loading');
      if (lenis) lenis.start();
      setTimeout(() => { const l = $('.loader'); if (l) l.remove(); }, 1400);
    }
  }

  /* ---------------------------------------------------------
     Navigation & menu
     --------------------------------------------------------- */
  function initNav() {
    const nav = $('#nav');
    const btn = $('.nav__menu');
    const menu = $('#menu');

    const setMenu = (open) => {
      body.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-hidden', String(!open));
      if (lenis) open ? lenis.stop() : lenis.start();
    };
    btn.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      const target = id === '#top' ? $('#top') : $(id);
      if (!target) return;
      e.preventDefault();
      if (body.classList.contains('menu-open')) setMenu(false);
      scrollToTarget(target);
    });

    let last = 0;
    return (y) => {
      if (body.classList.contains('menu-open')) return;
      const d = y - last;
      if (Math.abs(d) > 6) {
        nav.classList.toggle('is-hidden', d > 0 && y > 240);
        last = y;
      }
    };
  }

  /* ---------------------------------------------------------
     Reveal générique
     --------------------------------------------------------- */
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('[data-reveal]').forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------
     Hero — gels en parallaxe, anneau de texte qui tourne
     --------------------------------------------------------- */
  function initHero() {
    const gels = $$('.gel').map((el) => ({ el, d: parseFloat(el.dataset.depth) || 1 }));
    const ring = $('.hero__ring');
    const piece = $('.hero__piece');
    const l1 = $('.hero__line:not(.hero__line--2)');
    const l2 = $('.hero__line--2');
    const hero = $('.hero');
    let mx = 0, my = 0, cx = 0, cy = 0;
    if (finePointer) {
      addEventListener('pointermove', (e) => {
        mx = (e.clientX / innerWidth - 0.5) * 2;
        my = (e.clientY / innerHeight - 0.5) * 2;
      }, { passive: true });
    }
    return (y, t) => {
      if (y > hero.offsetHeight * 1.2) return;
      cx = lerp(cx, mx, 0.06);
      cy = lerp(cy, my, 0.06);
      gels.forEach(({ el, d }, i) => {
        const rot = i === 1 ? y * 0.06 + t * 0.004 : 0;
        el.style.transform = `translate3d(${cx * d * 26}px, ${cy * d * 26 - y * d * 0.18}px, 0) rotate(${rot}deg)`;
      });
      if (!reduce) ring.style.transform = `rotate(${t * 0.006 + y * 0.08}deg)`;
      piece.style.transform = `translate3d(${cx * -10}px, ${y * 0.12 + cy * -10}px, 0)`;
      l1.style.transform = `translate3d(${-y * 0.12}px,0,0)`;
      l2.style.transform = `translate3d(${y * 0.12}px,0,0)`;
    };
  }

  /* ---------------------------------------------------------
     Rubans courbes — texte qui glisse sur la courbe
     --------------------------------------------------------- */
  let relabelRibbons = () => {};
  function initRibbons() {
    const items = [
      { tp: $('#tp1'), key: 'ribbon.1', dir: 1, seg: 0 },
      { tp: $('#tp2'), key: 'ribbon.2', dir: -1, seg: 0 },
    ];
    const measure = () => items.forEach((it) => {
      try { it.seg = it.tp.getComputedTextLength() / 6; } catch (e) { it.seg = 1200; }
    });
    relabelRibbons = () => {
      items.forEach((it) => { it.tp.textContent = t(it.key).repeat(6); });
      measure();
    };
    relabelRibbons();
    document.fonts && document.fonts.ready.then(measure);
    let off = 0, lastY = scrollY;
    return (y, t, dt) => {
      const v = y - lastY; lastY = y;
      off += (reduce ? 0 : dt * 0.045) + Math.abs(v) * 0.6;
      items.forEach((it) => {
        if (!it.seg) return;
        const o = off % it.seg;
        it.tp.setAttribute('startOffset', it.dir > 0 ? -o : -it.seg + o);
      });
    };
  }

  /* ---------------------------------------------------------
     Manifeste — mot à mot au scroll
     --------------------------------------------------------- */
  const PILLS = {
    p1: `<span class="pill"><img src="${img('VARIATION-AI-1-AI_2.png?v=1772373093', 240)}" alt="" loading="lazy"></span>`,
    p2: `<span class="pill"><img src="${img('pomelli_photoshoot_image_4_5_1021_6.png?v=1792676521', 240)}" alt="" loading="lazy"></span>`,
    pg: '<span class="pill pill--gel"></span>',
  };
  let manifestoParts = [];
  let manifestoLast = -1;
  function buildManifesto() {
    const el = $('#manifesto');
    el.innerHTML = t('manifesto.text', PILLS);
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((p) => {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
        const s = document.createElement('span');
        s.className = 'w';
        s.textContent = p;
        frag.appendChild(s);
      });
      n.replaceWith(frag);
    });
    manifestoParts = $$('.w, .pill', el);
    manifestoLast = -1;
  }
  function initManifesto() {
    const el = $('#manifesto');
    buildManifesto();
    return () => {
      const parts = manifestoParts;
      const r = el.getBoundingClientRect();
      const vh = innerHeight;
      const p = clamp((vh * 0.88 - r.top) / (r.height + vh * 0.3));
      const n = Math.round(p * parts.length * 1.08);
      if (n === manifestoLast) return;
      manifestoLast = n;
      parts.forEach((w, i) => w.classList.toggle('is-on', i < n));
    };
  }

  /* ---------------------------------------------------------
     Savoir-faire — chapitres & fil courbe
     --------------------------------------------------------- */
  function initCraft() {
    const section = $('.craft');
    const imgs = $$('.craft__frame img');
    const steps = $$('.step');
    const num = $('#craftNum');
    const thread = $('#thread');
    let current = 0;

    const setStep = (i) => {
      if (i === current) return;
      imgs.forEach((im, k) => {
        im.classList.toggle('was-active', k === current);
        im.classList.toggle('is-active', k === i);
      });
      steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
      num.textContent = String(i + 1).padStart(2, '0');
      current = i;
    };
    steps[0].classList.add('is-active');

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setStep(+en.target.dataset.step); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => io.observe(s));

    thread.setAttribute('pathLength', '1');
    thread.style.strokeDasharray = '1';
    thread.style.strokeDashoffset = '1';
    return () => {
      const r = section.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = clamp((innerHeight * 0.7 - r.top) / r.height);
      thread.style.strokeDashoffset = String(1 - p);
    };
  }

  /* ---------------------------------------------------------
     Collection — rendu & filtres
     --------------------------------------------------------- */
  const state = { type: 'all', fam: null };

  function cardHTML(p, i) {
    // avec un filtre couleur, on montre la pièce dans cette teinte quand la photo existe
    const tinted = state.fam && COLOR_IMG[p.h] && COLOR_IMG[p.h][state.fam];
    const a = tinted || p.a;
    const b = tinted ? (p.a !== tinted ? p.a : p.b) : p.b;
    const fams = p.fam.slice(0, 5).map((f) => {
      const c = FAM[f].c;
      return `<i style="--c:${c}" class="${lum(c) > 0.7 ? 'light' : ''}" title="${famName(f)}"></i>`;
    }).join('');
    const more = p.fam.length > 5 ? `<b>+${p.fam.length - 5}</b>` : '';
    const fit = p.contain ? ' contain' : '';
    return `
      <a class="card" href="${storeBase()}/products/${p.h}" style="--hue:${state.fam ? FAM[state.fam].c : p.hue};animation-delay:${i * 70}ms" data-cursor="${t('card.cursor')}">
        <div class="card__media">
          <img class="a${b ? ' has-b' : ''}${fit}" src="${img(a, 700)}" alt="${p.name}" loading="lazy" width="700" height="875">
          ${b ? `<img class="b${fit}" src="${img(b, 700)}" alt="" loading="lazy" width="700" height="875">` : ''}
          <span class="card__cta">${t('card.cta')} <span class="arrow">→</span></span>
        </div>
        <div class="card__info"><h3>${p.name}</h3><span class="card__price">${p.from ? t('price.from', { p: p.price }) : p.price}</span></div>
        <div class="card__meta"><span class="card__type">${t('prod.' + p.h)}</span><span class="dots" aria-label="${t('card.fams', { n: p.fam.length })}">${fams}${more}</span></div>
      </a>`;
  }

  const matchType = (p) => state.type === 'all' || p.type === state.type;

  const dotHTML = (fam) => {
    if (!fam) return '<span class="chip__dot is-all"></span>';
    const c = FAM[fam].c;
    return `<span class="chip__dot${lum(c) > 0.6 || fam === 'cristal' ? ' is-light' : ''}${fam === 'cristal' ? ' is-clear' : ''}" style="--c:${c}"></span>`;
  };
  const CHECK = '<svg class="check" viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 7.5 5.5 10.5 11.5 3.5"/></svg>';

  // le bouton "Couleur" montre la teinte choisie ; le menu liste toutes les familles
  function renderColorMenu() {
    const btn = $('#colorBtn');
    const menu = $('#colorMenu');
    const inType = PRODUCTS.filter(matchType);
    $('#colorBtnDot').outerHTML = dotHTML(state.fam).replace('<span class="chip__dot', '<span id="colorBtnDot" class="chip__dot');
    $('#colorBtnValue').textContent = state.fam ? famName(state.fam) : '';
    btn.classList.toggle('has-value', !!state.fam);
    if (state.fam) btn.style.setProperty('--chip', FAM[state.fam].c); else btn.style.removeProperty('--chip');
    const opt = (fam, label, count, extra = '') => {
      const sel = (state.fam || null) === fam;
      return `<li role="option" id="opt-${fam || 'all'}" data-fam="${fam || ''}" aria-selected="${sel}"${count === 0 ? ' aria-disabled="true"' : ''}${extra}>
        ${dotHTML(fam)}<span class="label">${label}</span>${count != null ? `<span class="count">${count}</span>` : ''}${CHECK}</li>`;
    };
    menu.innerHTML = opt(null, t('col.allColors'), null, ' class="sep"') +
      FAM_ORDER.map((f) => opt(f, famName(f), inType.filter((p) => p.fam.includes(f)).length)).join('');
  }

  function renderGrid() {
    const grid = $('#grid');
    const list = PRODUCTS.filter((p) => matchType(p) && (!state.fam || p.fam.includes(state.fam)));
    grid.innerHTML = list.map(cardHTML).join('');
    $('#gridEmpty').hidden = list.length > 0;
    $$('.filters .chip[data-type]').forEach((c) => {
      const on = c.dataset.type === state.type;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-pressed', String(on));
    });
    renderColorMenu();
  }

  function initColorPick() {
    const pick = $('#colorPick');
    const btn = $('#colorBtn');
    const menu = $('#colorMenu');
    let focus = -1;
    const items = () => $$('li', menu);
    const setFocus = (i) => {
      const list = items();
      if (!list.length) return;
      focus = (i + list.length) % list.length;
      list.forEach((li, k) => li.classList.toggle('is-focus', k === focus));
      menu.setAttribute('aria-activedescendant', list[focus].id);
      list[focus].scrollIntoView({ block: 'nearest' });
    };
    const open = () => {
      menu.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      const sel = items().findIndex((li) => li.getAttribute('aria-selected') === 'true');
      setFocus(Math.max(0, sel));
      menu.focus({ preventScroll: true });
    };
    const close = (refocus) => {
      if (menu.hidden) return;
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      if (refocus) btn.focus({ preventScroll: true });
    };
    const choose = (li) => {
      if (!li || li.getAttribute('aria-disabled') === 'true') return;
      state.fam = li.dataset.fam || null;
      renderGrid();
      close(true);
    };
    btn.addEventListener('click', () => (menu.hidden ? open() : close(true)));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); }
    });
    menu.addEventListener('click', (e) => choose(e.target.closest('li')));
    menu.addEventListener('mousemove', (e) => {
      const li = e.target.closest('li');
      if (li) setFocus(items().indexOf(li));
    });
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setFocus(focus + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setFocus(focus - 1); }
      else if (e.key === 'Home') { e.preventDefault(); setFocus(0); }
      else if (e.key === 'End') { e.preventDefault(); setFocus(items().length - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(items()[focus]); }
      else if (e.key === 'Escape' || e.key === 'Tab') close(e.key === 'Escape');
    });
    document.addEventListener('pointerdown', (e) => { if (!pick.contains(e.target)) close(false); });
  }

  function initCollection() {
    renderGrid();
    $$('.filters .chip[data-type]').forEach((c) => c.addEventListener('click', () => { state.type = c.dataset.type; renderGrid(); }));
    initColorPick();
    $('#resetFilters').addEventListener('click', () => { state.fam = null; state.type = 'all'; renderGrid(); });
  }

  /* ---------------------------------------------------------
     Anatomie — trois points
     --------------------------------------------------------- */
  function initAnatomy() {
    const items = $$('#anatomyList li');
    const spots = $$('.spot');
    let cur = -1, touched = false, timer = null;
    const set = (i) => {
      cur = i;
      items.forEach((li, k) => li.classList.toggle('is-active', k === i));
      spots.forEach((s, k) => s.classList.toggle('is-active', k === i));
    };
    const user = (i) => { touched = true; clearInterval(timer); set(i); };
    items.forEach((li, k) => $('button', li).addEventListener('click', () => user(k)));
    spots.forEach((s, k) => {
      s.addEventListener('click', () => user(k));
      s.addEventListener('mouseenter', () => user(k));
    });
    set(0);
    if (reduce) return;
    const io = new IntersectionObserver(([en]) => {
      clearInterval(timer);
      if (en.isIntersecting && !touched) timer = setInterval(() => set((cur + 1) % 3), 3800);
    }, { threshold: 0.4 });
    io.observe($('.anatomy'));
  }

  /* ---------------------------------------------------------
     Parallaxe douce (section "Portés")
     --------------------------------------------------------- */
  function initParallax() {
    const els = $$('[data-speed]').map((el) => ({ el, s: parseFloat(el.dataset.speed) }));
    return () => {
      if (reduce) return;
      els.forEach(({ el, s }) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const c = r.top + r.height / 2 - innerHeight / 2;
        el.style.transform = `translate3d(0, ${c * s}px, 0)`;
      });
    };
  }

  /* ---------------------------------------------------------
     Footer — lettres qui montent
     --------------------------------------------------------- */
  function initFooter() {
    const w = $('#footerWord');
    w.innerHTML = [...w.textContent].map((ch, i) => `<span class="ch" style="transition-delay:${i * 35}ms">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('');
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { w.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(w);
  }

  /* ---------------------------------------------------------
     Curseur
     --------------------------------------------------------- */
  function initCursor() {
    if (!finePointer) return () => {};
    const c = $('.cursor');
    const label = $('.cursor__label');
    let x = -100, y = -100, tx = -100, ty = -100;
    addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; c.classList.add('is-visible'); }, { passive: true });
    document.addEventListener('pointerleave', () => c.classList.remove('is-visible'));
    document.addEventListener('pointerover', (e) => {
      const big = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, summary');
      c.classList.toggle('is-big', !!big);
      c.classList.toggle('is-link', !big && !!link);
      label.textContent = big ? big.dataset.cursor : '';
      c.classList.toggle('on-dark', !!e.target.closest('.footer, .menu'));
    });
    return () => {
      x = lerp(x, tx, 0.22);
      y = lerp(y, ty, 0.22);
      c.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
  }

  /* ---------------------------------------------------------
     Langue — FR / EN / ES
     --------------------------------------------------------- */
  function applyLang(next, first) {
    if (!LANGS.includes(next)) return;
    lang = next;
    try { localStorage.setItem('hm-lang', lang); } catch (e) { /* stockage indisponible */ }
    root.lang = lang;
    document.title = t('meta.title');
    const desc = $('meta[name="description"]');
    if (desc) desc.setAttribute('content', t('meta.desc'));
    $$('[data-i18n]').forEach((el) => { el.innerHTML = t(el.dataset.i18n); });
    $$('[data-i18n-alt]').forEach((el) => { el.alt = t(el.dataset.i18nAlt); });
    $$('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
    $$('[data-shop]').forEach((el) => { el.href = storeBase() + el.dataset.shop; });
    $$('.spot').forEach((el, k) => el.setAttribute('aria-label', t('an.spot', { n: k + 1, name: t(`an.${k + 1}h`) })));
    $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    if (first) return;
    buildManifesto();
    relabelRibbons();
    renderGrid();
  }

  function initLang() {
    $$('.lang button').forEach((b) => b.addEventListener('click', () => applyLang(b.dataset.lang)));
  }

  /* ---------------------------------------------------------
     Boucle principale
     --------------------------------------------------------- */
  function start() {
    setGel('#1C3FD8');
    applyLang(lang, true);
    initLang();
    initLenis();
    initLoader();
    const navTick = initNav();
    initReveal();
    const heroTick = initHero();
    const ribbonTick = initRibbons();
    const manifestoTick = initManifesto();
    const craftTick = initCraft();
    initCollection();
    initAnatomy();
    const parallaxTick = initParallax();
    initFooter();
    const cursorTick = initCursor();

    let prev = performance.now();
    const loop = (t) => {
      const dt = Math.min(64, t - prev);
      prev = t;
      if (lenis) lenis.raf(t);
      const y = scrollY;
      navTick(y);
      heroTick(y, t);
      ribbonTick(y, t, dt);
      manifestoTick();
      craftTick();
      parallaxTick();
      cursorTick();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
