(function () {
  var doc = document, root = doc.documentElement, body = doc.body;

  /* ---------- Reading progress + sticky states ---------- */
  var bar = doc.getElementById('bar'), totop = doc.getElementById('totop');
  var ticking = false;
  function onScroll(){
    var st = window.pageYOffset || root.scrollTop;
    var h = doc.documentElement.scrollHeight - window.innerHeight;
    var pct = h > 0 ? (st / h) * 100 : 0;
    bar.style.width = pct.toFixed(2) + '%';
    body.classList.toggle('scrolled', st > window.innerHeight * 0.62);
    totop.classList.toggle('show', st > window.innerHeight * 1.1);
    ticking = false;
  }
  window.addEventListener('scroll', function(){ if(!ticking){ requestAnimationFrame(onScroll); ticking = true; } }, {passive:true});
  onScroll();

  totop.addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    doc.getElementById('main').focus({ preventScroll: true });
  });

  /* ---------- Theme toggle ---------- */
  var themeToggle = doc.getElementById('themeToggle'),
      themeIcon = doc.getElementById('themeIcon'),
      metaTheme = doc.getElementById('meta-theme');
  var sunPath = '<circle cx="12" cy="12" r="4.2"/><path d="M12 3v2M12 19v2M5 12H3M21 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4"/>';
  var moonPath = '<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z"/>';
  function applyThemeUI(){
    var dark = root.getAttribute('data-theme') === 'dark';
    themeIcon.innerHTML = dark ? moonPath : sunPath;
    themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    metaTheme.setAttribute('content', dark ? '#141714' : '#FAF7F1');
  }
  applyThemeUI();
  themeToggle.addEventListener('click', function(){
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('evelyn-theme', next); } catch (e) {}
    applyThemeUI();
  });
  try {
    var scheme = matchMedia('(prefers-color-scheme: dark)');
    if (!localStorage.getItem('evelyn-theme') && scheme.addEventListener) {
      scheme.addEventListener('change', function(e){ root.setAttribute('data-theme', e.matches ? 'dark' : 'light'); applyThemeUI(); });
    }
  } catch (e) {}

  /* ---------- Contents drawer ---------- */
  var drawer = doc.getElementById('drawer'),
      backdrop = doc.getElementById('backdrop'),
      openBtn = doc.getElementById('openContents'),
      closeBtn = doc.getElementById('closeContents');
  function openDrawer(){
    drawer.classList.add('open'); backdrop.classList.add('open');
    drawer.removeAttribute('inert');
    drawer.setAttribute('aria-hidden','false'); openBtn.setAttribute('aria-expanded','true');
    body.classList.add('no-scroll');
    closeBtn.focus();
  }
  function closeDrawer(restoreFocus){
    if(!drawer.classList.contains('open')) return;
    drawer.classList.remove('open'); backdrop.classList.remove('open');
    drawer.setAttribute('inert','');
    drawer.setAttribute('aria-hidden','true'); openBtn.setAttribute('aria-expanded','false');
    body.classList.remove('no-scroll');
    if(restoreFocus !== false) openBtn.focus();
  }
  openBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);
  doc.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeDrawer();
    if(e.key === 'Tab' && drawer.classList.contains('open')){
      var focusable = drawer.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])');
      if(!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if(e.shiftKey && doc.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && doc.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });
  Array.prototype.forEach.call(doc.querySelectorAll('#toc a'), function(a){
    a.addEventListener('click', function(){
      var target = doc.getElementById(a.getAttribute('href').slice(1));
      closeDrawer(false);
      if (!target) return;
      setTimeout(function(){
        var focusTarget = target.querySelector('h2') || target;
        focusTarget.setAttribute('tabindex', '-1');
        focusTarget.focus({ preventScroll: true });
        focusTarget.addEventListener('blur', function removeTemporaryTabindex(){
          focusTarget.removeAttribute('tabindex');
        }, { once: true });
      }, 0);
    });
  });

  /* ---------- Scroll-spy + live section label in the header ---------- */
  var tocLinks = {}, spyTargets = [], secTitles = {};
  Array.prototype.forEach.call(doc.querySelectorAll('#toc a'), function(a){
    var id = a.getAttribute('href').slice(1);
    tocLinks[id] = a; var t = doc.getElementById(id); if(t) spyTargets.push(t);
    var nEl = a.querySelector('.n'); var clone = a.cloneNode(true);
    if(nEl){ var c = clone.querySelector('.n'); if(c) c.remove(); }
    secTitles[id] = (clone.textContent || '').trim();
  });
  var nowSection = doc.getElementById('nowSection'), curId = null;
  function setSection(id){
    if(id === curId) return; curId = id;
    var title = secTitles[id]; if(!title) return;
    nowSection.style.opacity = '0';
    clearTimeout(setSection._timer);
    setSection._timer = setTimeout(function(){ nowSection.textContent = title; nowSection.style.opacity = '1'; }, 180);
  }
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          Object.keys(tocLinks).forEach(function(k){ tocLinks[k].classList.remove('active'); tocLinks[k].removeAttribute('aria-current'); });
          var link = tocLinks[en.target.id]; if(link){ link.classList.add('active'); link.setAttribute('aria-current','location'); }
          setSection(en.target.id);
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    spyTargets.forEach(function(t){ spy.observe(t); });
  }

  /* ---------- Reveal on scroll ---------- */
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = doc.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(reveals, function(el){ el.classList.add('in'); });
  } else {
    Array.prototype.forEach.call(reveals, function(el){
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add('in');
    });
    root.classList.add('reveal-ready');
    var ro = new IntersectionObserver(function(entries, obs){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); obs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(reveals, function(el){ if(!el.classList.contains('in')) ro.observe(el); });
  }

  /* ---------- Copy coordinates ---------- */
  var copyBtn = doc.getElementById('copyCoords'), toast = doc.getElementById('toast');
  var COORDS = '40.9859389, -75.7467333';
  function showToast(msg){
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(showToast._t); showToast._t = setTimeout(function(){ toast.classList.remove('show'); }, 2200);
  }
  copyBtn.addEventListener('click', function(){
    function ok(){ showToast('Coordinates copied'); }
    function fallback(){
      var ta = doc.createElement('textarea'); ta.value = COORDS; ta.setAttribute('readonly','');
      ta.style.position='absolute'; ta.style.left='-9999px'; doc.body.appendChild(ta);
      ta.select();
      try {
        if (doc.execCommand('copy')) ok();
        else showToast('Copy failed — long-press to copy');
      } catch(e){ showToast('Copy failed — long-press to copy'); }
      doc.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(COORDS).then(ok).catch(fallback);
    } else { fallback(); }
  });
})();
