'use strict';
(() => {
  const $ = (id) => document.getElementById(id);
  const asset = (name) => `/beat-the-patriarchy/assets/characters/${name}.svg`;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const demo = $('demo');
  const hero = $('demo-hero');
  const opponent = $('demo-opponent');
  const tapButton = $('demo-tap');
  const tabs = Array.from(document.querySelectorAll('[data-mode].mode-tab'));
  const pips = Array.from(document.querySelectorAll('.combo-pips i'));
  const modes = {
    clapback: { heading: 'A sharp tongue. A satisfying win.', description: 'Give the nonsense the response it deserves. Expressive gestures, a little attitude, and the glorious feeling of having the last word.', cta: 'TAP TO CLAP BACK', resting: 'Go on. Have the last word.' },
    brawl: { heading: 'Less explaining. More cartoon chaos.', description: 'Take it to the fictional arena. Build your combo, bring the big cartoon energy, and let the finish do the talking.', cta: 'TAP TO BRAWL', resting: 'Tiny taps. Ridiculously satisfying.' },
  };
  const comebacks = ['My face. My choice.', 'That was not a request.', 'No, I’m good.', 'Try listening instead.', 'Let me finish.', 'Point. Made.'];
  let mode = 'clapback';
  let taps = 0;
  let returnTimer = 0;
  let impactTimer = 0;
  let speechTimer = 0;

  // Load only the small, authentic character poses required for the interaction.
  ['hero-speak','hero-speak-alt','hero-speak-third','hero-speak-power','hero-speak-mega','hero-strike','hero-strike-alt','hero-celebrate','opponent-hit','opponent-brawl-hit','opponent-defeat'].forEach(name => { const img = new Image(); img.src = asset(name); });

  function resetDemo() {
    clearTimeout(returnTimer); clearTimeout(impactTimer); clearTimeout(speechTimer);
    taps = 0;
    demo.classList.remove('victory','mega','shake');
    $('demo-impact').classList.remove('pop');
    $('demo-word').classList.remove('visible');
    hero.src = asset('hero-idle');
    opponent.src = asset('opponent-idle');
    $('opponent-quote').textContent = '“You’d look prettier if you smiled.”';
    $('demo-feedback').textContent = modes[mode].resting;
    tapButton.replaceChildren(document.createTextNode(`${modes[mode].cta} `), makeSpark());
    updateMeter();
  }

  function makeSpark() { const span = document.createElement('span'); span.setAttribute('aria-hidden','true'); span.textContent = '✦'; return span; }

  function updateMeter() {
    const ego = Math.max(0, Math.round(100 * (1 - taps / 24)));
    $('ego-value').textContent = `EGO: ${ego}%`;
    $('ego-fill').style.width = `${ego}%`;
    document.querySelector('.ego-track').setAttribute('aria-valuenow', String(ego));
    $('combo-number').textContent = `${taps} / 24`;
    $('combo-label').textContent = taps === 24 ? (mode === 'clapback' ? 'FINAL WORD.' : 'BIG FINISH.') : taps === 0 ? 'YOUR TURN.' : taps % 8 === 0 ? 'POWER MOVE!' : 'KEEP IT GOING.';
    const charged = taps > 0 && taps % 8 === 0 ? 8 : taps % 8;
    pips.forEach((pip,i) => { pip.classList.toggle('filled',i<charged); pip.classList.toggle('power',i<charged&&taps%8===0); });
  }

  function changeMode(next, focus = false) {
    mode = next;
    demo.dataset.mode = mode;
    tabs.forEach(tab => { const selected = tab.dataset.mode === mode; tab.classList.toggle('active',selected); tab.setAttribute('aria-selected',String(selected)); tab.tabIndex = selected ? 0 : -1; if(selected && focus) tab.focus(); });
    $('mode-panel').setAttribute('aria-labelledby',`tab-${mode}`);
    $('mode-heading').textContent = modes[mode].heading;
    $('mode-description').textContent = modes[mode].description;
    resetDemo();
  }
  tabs.forEach(tab => {
    tab.addEventListener('click',() => changeMode(tab.dataset.mode));
    tab.addEventListener('keydown',event => {
      if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
        event.preventDefault();
        const next = event.key === 'Home' ? 'clapback' : event.key === 'End' ? 'brawl' : mode === 'clapback' ? 'brawl' : 'clapback';
        changeMode(next,true);
      }
    });
  });

  tapButton.addEventListener('click',() => {
    if(taps >= 24) { resetDemo(); return; }
    clearTimeout(returnTimer); clearTimeout(impactTimer); clearTimeout(speechTimer);
    taps += 1;
    const power = taps % 8 === 0;
    const finish = taps === 24;
    const speakPose = finish ? 'hero-speak-mega' : power ? 'hero-speak-power' : ['hero-speak','hero-speak-alt','hero-speak-third'][(taps - 1) % 3];
    hero.src = asset(mode === 'clapback' ? speakPose : taps % 2 ? 'hero-strike' : 'hero-strike-alt');
    opponent.src = asset(finish ? 'opponent-defeat' : mode === 'brawl' ? 'opponent-brawl-hit' : 'opponent-hit');
    const word = $('demo-word');
    word.textContent = mode === 'clapback' ? (finish ? 'Conversation. Over.' : comebacks[Math.floor((taps-1)/4)%comebacks.length]) : (finish ? 'BIG FINISH.' : power ? 'POWER BONK!' : 'BONK!');
    word.classList.add('visible');
    const impact = $('demo-impact');
    impact.textContent = finish ? '✦ ✦' : power ? '✳' : mode === 'brawl' ? '✦' : '…!';
    impact.classList.remove('pop');
    void impact.offsetWidth;
    impact.classList.add('pop');
    demo.classList.remove('shake');
    if(power && !reducedMotion.matches) { void demo.offsetWidth; demo.classList.add('shake'); }
    updateMeter();
    if(finish) {
      demo.classList.add('victory','mega');
      $('opponent-quote').textContent = 'Funny. Suddenly he has nothing to say.';
      $('demo-feedback').textContent = 'That felt good. There’s a whole game waiting below.';
      tapButton.replaceChildren(document.createTextNode('ONE MORE ROUND? '),makeSpark());
      returnTimer = window.setTimeout(() => { hero.src = asset('hero-celebrate'); },reducedMotion.matches?0:430);
    } else {
      if(power) $('demo-feedback').textContent = mode === 'clapback' ? 'POINT. MADE. Keep going for the final word.' : 'POWER BONK. Keep going for the big finish.';
      returnTimer = window.setTimeout(() => { hero.src = asset('hero-idle'); opponent.src = asset('opponent-idle'); demo.classList.remove('shake'); },power?400:250);
      speechTimer = window.setTimeout(() => { word.classList.remove('visible'); },1200);
    }
    impactTimer = window.setTimeout(() => impact.classList.remove('pop'),finish?900:450);
  });

  const choices = {
    fun: { title: 'All the fun.\nNone of the ads.', description: 'Play free, ad-free, just because it feels good. You don’t owe anyone more than that.', symbol: '♡', tag: 'NO ADS. NO CHARGE. YOUR CHOICE.' },
    cause: { title: 'Make the ads\nwork for women.', description: 'Choose optional ads and help put their profits toward women’s causes. Your choice. A bigger purpose.', symbol: '↗', tag: 'ALWAYS FREE. ALWAYS YOUR CHOICE.' },
  };
  document.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click',() => {
    const key = button.dataset.choice;
    document.querySelectorAll('[data-choice]').forEach(b => { const active = b.dataset.choice===key; b.classList.toggle('active',active); b.setAttribute('aria-pressed',String(active)); });
    const title = $('choice-title'); title.replaceChildren();
    choices[key].title.split('\n').forEach((part,i) => { if(i) title.appendChild(document.createElement('br')); title.appendChild(document.createTextNode(part)); });
    $('choice-description').textContent = choices[key].description;
    $('choice-symbol').textContent = choices[key].symbol;
    $('choice-tag').textContent = choices[key].tag;
  }));

  function openDialog(id) {
    const dialog = $(id);
    if(typeof dialog.showModal === 'function') { dialog.showModal(); document.body.classList.add('dialog-open'); }
  }
  document.querySelectorAll('[data-open-install]').forEach(button => button.addEventListener('click',() => openDialog('install-dialog')));
  document.querySelectorAll('[data-open-privacy]').forEach(button => button.addEventListener('click',() => openDialog('privacy-dialog')));
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close-dialog]').addEventListener('click',() => dialog.close());
    dialog.addEventListener('close',() => document.body.classList.remove('dialog-open'));
    dialog.addEventListener('click',event => { const rect=dialog.getBoundingClientRect(); if(event.target===dialog && (event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)) dialog.close(); });
  });

  // Open the transparency disclosure when it is the destination of an in-page link.
  document.querySelectorAll('a[href="#impact-details"]').forEach(link => link.addEventListener('click',() => { $('impact-details').open=true; }));
  if(location.hash==='#impact-details') $('impact-details').open=true;

  $('share-button').addEventListener('click',async () => {
    const shareUrl = new URL(location.href); shareUrl.hash=''; shareUrl.search='';
    const data = {title:'Beat the Patriarchy',text:'They said “calm down.” We made a game. Play free. Ad-free is free too.',url:shareUrl.href};
    const status = $('share-status'); status.textContent='';
    try {
      if(navigator.share && (!navigator.canShare || navigator.canShare(data))) { await navigator.share(data); return; }
      if(navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(shareUrl.href); status.textContent='Link copied. Your group chat awaits.'; }
      else { status.textContent=`Copy this link: ${shareUrl.href}`; }
    } catch(error) {
      if(error.name!=='AbortError') status.textContent=`Copy this link: ${shareUrl.href}`;
    }
  });

  if('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { const entry=entries[0]; const sticky=$('mobile-cta'); const visible=!entry.isIntersecting && entry.boundingClientRect.top<0; sticky.classList.toggle('visible',visible); sticky.inert=!visible; },{threshold:0});
    observer.observe(document.querySelector('.hero-copy'));
  }
  document.addEventListener('visibilitychange',() => { if(document.hidden) { clearTimeout(impactTimer); $('demo-impact').classList.remove('pop'); demo.classList.remove('shake'); } });
})();
