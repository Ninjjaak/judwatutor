/* Judwa interactions:
   - Mobile nav toggle
   - Reveal-on-scroll
   - Subtle motion blur tied to scroll velocity (fancy, but safe)
*/

(function(){
  const root = document.documentElement;
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile nav (simple overlay via toggling a class + cloning links)
  const navBtn = document.querySelector('[data-navbtn]');
  const nav = document.querySelector('.nav');
  let sheet;

  function buildSheet(){
    if (sheet) return;
    sheet = document.createElement('div');
    sheet.className = 'sheet';
    sheet.innerHTML = `
      <div class="sheet__backdrop" data-sheet-close></div>
      <div class="sheet__panel" role="dialog" aria-modal="true" aria-label="Menu">
        <div class="sheet__head">
          <div class="brand brand--mini"><span class="brand__mark"></span><span class="brand__text">Judwa</span></div>
          <button class="sheet__close" data-sheet-close aria-label="Close menu">✕</button>
        </div>
        <div class="sheet__links"></div>
      </div>
    `;
    document.body.appendChild(sheet);

    const links = sheet.querySelector('.sheet__links');
    if (nav) {
      nav.querySelectorAll('a').forEach(a => {
        const c = a.cloneNode(true);
        c.classList.add('sheet__link');
        links.appendChild(c);
      });
    }

    sheet.querySelectorAll('[data-sheet-close]').forEach(el=>{
      el.addEventListener('click', closeSheet);
    });
  }

  function openSheet(){
    buildSheet();
    sheet.classList.add('is-open');
    navBtn && navBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeSheet(){
    if (!sheet) return;
    sheet.classList.remove('is-open');
    navBtn && navBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (navBtn){
    navBtn.addEventListener('click', ()=>{
      const expanded = navBtn.getAttribute('aria-expanded') === 'true';
      expanded ? closeSheet() : openSheet();
    });
  }

  // Reveal
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (e.isIntersecting) e.target.classList.add('is-in');
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el=> io.observe(el));

  // Motion blur based on scroll velocity
  if (!prefersReduced){
    let lastY = window.scrollY;
    let lastT = performance.now();
    let raf = 0;

    function tick(){
      raf = 0;
      const y = window.scrollY;
      const t = performance.now();
      const dy = Math.abs(y - lastY);
      const dt = Math.max(16, t - lastT);
      const v = dy / dt; // px per ms
      // Convert to blur px (subtle). Clamp for readability.
      const blur = Math.min(6, Math.max(0, v * 22));
      root.style.setProperty('--motion', blur.toFixed(2) + 'px');

      lastY = y;
      lastT = t;
    }

    window.addEventListener('scroll', ()=>{
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
  } else {
    root.style.setProperty('--motion', '0px');
  }

  // Signup demo handler
  window.JUDWA = window.JUDWA || {};
  window.JUDWA.handleSignup = function(ev){
    ev.preventDefault();
    const form = ev.target;
    const status = document.getElementById('formStatus');
    const email = (form.email?.value || '').trim();
    if (!email){
      status && (status.textContent = 'Please enter your email.');
      return false;
    }
    status && (status.textContent = 'Thanks — you\'re on the list (demo). Hook this up to your backend.');
    form.reset();
    return false;
  };

  // Inject sheet styles (kept in JS to keep CSS file clean)
  const sheetCSS = document.createElement('style');
  sheetCSS.textContent = `
    .sheet{ position:fixed; inset:0; z-index:80; display:none; }
    .sheet.is-open{ display:block; }
    .sheet__backdrop{ position:absolute; inset:0; background: rgba(0,0,0,.55); backdrop-filter: blur(10px); }
    .sheet__panel{
      position:absolute; right: 12px; left: 12px; top: 74px;
      border-radius: 22px;
      border: 1px solid rgba(255,255,255,.14);
      background: rgba(10,14,24,.78);
      backdrop-filter: blur(16px);
      box-shadow: 0 30px 90px rgba(0,0,0,.55);
      overflow:hidden;
      transform: translateY(-8px);
      animation: sheetIn .25s cubic-bezier(.2,.9,.2,1) forwards;
    }
    @keyframes sheetIn{ to { transform: translateY(0); } }
    .sheet__head{
      display:flex; align-items:center; justify-content:space-between;
      padding: 14px 14px 10px;
      border-bottom: 1px solid rgba(255,255,255,.08);
    }
    .sheet__close{
      width: 38px; height: 38px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,.14);
      background: rgba(255,255,255,.06);
      color: rgba(255,255,255,.9);
      cursor:pointer;
    }
    .sheet__links{ padding: 10px; display:grid; gap: 8px; }
    .sheet__link{
      display:flex;
      padding: 12px 12px;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,.12);
      background: rgba(255,255,255,.05);
      color: rgba(255,255,255,.86);
      font-weight: 750;
    }
    .sheet__link:hover{ background: rgba(255,255,255,.07); }
  `;
  document.head.appendChild(sheetCSS);
})();
