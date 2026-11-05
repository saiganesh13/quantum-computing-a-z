/* =====================================================================
   App shell: stages, navigation, routing, home, lessons, glossary
   ===================================================================== */
const STAGES = [
  { temp: '300 K', name: 'Room temperature', title: 'Foundations', w: '100%', blurb: 'What a qubit is, what measurement does to it, and how to picture a single qubit on the Bloch sphere.' },
  { temp: '4 K', name: '4 K plate', title: 'Building blocks', w: '86%', blurb: 'Gates as rotations, interference with a single photon, and the state space of several qubits.' },
  { temp: '800 mK', name: 'Still', title: 'Entanglement and communication', w: '73%', blurb: 'Bell pairs and Bell’s inequality, a full circuit simulator, teleportation and quantum key distribution.' },
  { temp: '100 mK', name: 'Cold plate', title: 'Algorithms', w: '61%', blurb: 'Phase kickback, Grover’s search, the quantum Fourier transform, Shor’s algorithm and variational methods.' },
  { temp: '10 mK', name: 'Mixing chamber', title: 'Real machines', w: '51%', blurb: 'Noise, error correction, the hardware itself, and an honest account of what quantum computers can and cannot do.' }
];
const TRACKS = [
  { code: 'QEC', title: 'Error correction and fault tolerance', featured: true, blurb: 'The largest track. Stabilizer codes and how to simulate them at scale, decoders, noise models and thresholds, fault-tolerant gadgets, magic states, qLDPC codes and resource estimation.' },
  { code: 'ALG', title: 'Algorithms and complexity', blurb: 'Query complexity and Simon’s algorithm, phase estimation and Hamiltonian simulation, complexity classes and tests of quantum advantage.' },
  { code: 'SIM', title: 'Simulation methods', blurb: 'Density matrices and noise channels, the main open-source frameworks, tensor networks and why entanglement sets the cost.' },
  { code: 'CMP', title: 'Compilers and architecture', blurb: 'Circuit optimization, qubit mapping and routing, scheduling, and the stack from program to pulses.' },
  { code: 'VQA', title: 'Chemistry and machine learning', blurb: 'Mapping electrons to qubits, a correlation model you can solve exactly, data re-uploading and barren plateaus.' },
  { code: 'QIT', title: 'Information theory and cryptography', blurb: 'Entropy, Holevo’s bound, superdense coding, entanglement versus nonlocality, and post-quantum cryptography.' }
];
const GROUPS = STAGES.map(s => Object.assign({ part: 1, code: s.temp }, s)).concat(TRACKS.map(t => Object.assign({ part: 2, temp: t.code }, t)));
window.GLOSSARY = window.GLOSSARY.concat(window.GLOSSARY_EXTRA || []).sort((a, b) => a[0].localeCompare(b[0]));
LESSONS.sort((a, b) => a.n - b.n);
const LAB_COUNT = LESSONS.reduce((s, l) => s + Object.keys(l.labs).length, 0);

const Prog = {
  key: 'into-the-cryostat-progress-v1', d: { seen: {}, done: {} },
  load() { try { const s = localStorage.getItem(this.key); if (s) { const o = JSON.parse(s); this.d = { seen: o.seen || {}, done: o.done || {} }; } } catch (e) { /* storage unavailable */ } },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.d)); } catch (e) { /* storage unavailable */ } },
  seen(id) { if (!this.d.seen[id]) { this.d.seen[id] = 1; this.save(); } },
  done(id) { this.d.done[id] = 1; this.save(); },
  state(id) { return this.d.done[id] ? 'done' : this.d.seen[id] ? 'seen' : ''; },
  count() { return LESSONS.filter(l => this.d.done[l.id]).length; }
};
const PD_LABEL = { done: 'Completed', seen: 'Started', '': 'Not started' };

function buildNav(cur) {
  const nav = h('div', { class: 'nav' });
  nav.append(h('a', { class: 'nav-home', href: '#home', 'aria-current': cur === 'home' ? 'page' : false }, 'Overview and map'));
  GROUPS.forEach((s, i) => {
    const ls = LESSONS.filter(l => l.stage === i);
    if (i === 0) nav.append(h('div', { class: 'part-label' }, 'Part I · The descent'));
    if (i === STAGES.length) nav.append(h('div', { class: 'part-label' }, 'Part II · Research tracks'));
    nav.append(h('div', { class: 'stage' + (s.part === 2 ? ' trk' : '') }, h('div', { class: 'stage-temp' }, s.temp),
      h('div', { class: 'stage-body' }, h('div', { class: 'stage-name' }, s.title),
        ...ls.map(l => h('a', { class: 'nav-l', href: '#' + l.id, 'aria-current': cur === l.id ? 'page' : false },
          h('span', { class: 'nav-n' }, String(l.n).padStart(2, '0')), h('span', null, l.title),
          h('span', { class: 'pd', 'data-s': Prog.state(l.id), title: PD_LABEL[Prog.state(l.id)], 'aria-label': PD_LABEL[Prog.state(l.id)] }))))));
  });
  nav.append(h('div', { class: 'nav-extra' }, h('a', { class: 'nav-home', href: '#glossary', 'aria-current': cur === 'glossary' ? 'page' : false }, 'Glossary')));
  return nav;
}
function renderNav(cur) {
  for (const sel of ['#nav-side', '#nav-drawer']) { const el = document.querySelector(sel); el.innerHTML = ''; el.append(buildNav(cur)); }
}

/* ---------- drawer ---------- */
const drawer = document.getElementById('drawer'), menuBtn = document.getElementById('menu-btn');
function openDrawer() { drawer.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); const a = drawer.querySelector('[aria-current="page"]') || drawer.querySelector('a'); a && a.focus(); }
function closeDrawer() { if (drawer.hidden) return; drawer.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }
menuBtn.addEventListener('click', () => drawer.hidden ? openDrawer() : closeDrawer());
drawer.addEventListener('click', e => { if (e.target.closest('[data-close]')) { closeDrawer(); menuBtn.focus(); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !drawer.hidden) { closeDrawer(); menuBtn.focus(); } });

/* ---------- lesson page ---------- */
function renderLesson(L, main) {
  const st = GROUPS[L.stage], nl = Object.keys(L.labs).length, inTrack = LESSONS.filter(l => l.stage === L.stage), pos = inTrack.indexOf(L) + 1;
  main.append(h('header', { class: 'ph' },
    h('div', { class: 'ph-eyebrow' }, h('span', null, `Lesson ${L.n} of ${LESSONS.length}`),
      h('span', null, st.part === 1 ? `Stage ${L.stage + 1} · ${st.temp} · ${st.title}` : `Research track · ${st.title} · ${pos} of ${inTrack.length}`)),
    h('h1', null, L.title), h('p', { class: 'lede' }, L.lede),
    h('div', { class: 'ph-meta' }, h('span', null, 'Written by ', h('b', null, 'Sai Ganesh Chidambaram')), h('span', null, `${L.minutes} min`), h('span', null, `${nl} interactive lab${nl > 1 ? 's' : ''}`))));
  const prose = h('article', { class: 'prose', html: L.html });
  main.append(prose);
  prose.querySelectorAll('[data-lab]').forEach((el, i) => {
    const key = el.dataset.lab, def = L.labs[key]; if (!def) { el.remove(); return; }
    const body = h('div', { class: 'lab-body' });
    const fig = h('figure', { class: 'lab' }, h('div', { class: 'lab-head' }, h('span', { class: 'lab-tag' }, `Lab ${L.n}.${i + 1}`), h('span', { class: 'lab-title' }, def.title)), body, h('figcaption', { class: 'lab-cap' }, def.cap));
    el.replaceWith(fig);
    try { def.build(body, n => `${L.id}-${key}-${n}`); } catch (e) { console.error(e); body.innerHTML = ''; body.append(h('p', { class: 'hint' }, 'This lab could not start. Reload the page to try again.')); }
  });
  if (L.mount) try { L.mount(prose); } catch (e) { console.error(e); }
  prose.append(h('section', { class: 'take' }, h('h2', null, 'Key ideas'), h('ul', null, ...L.take.map(t => h('li', null, t)))));
  prose.append(renderQuiz(L));
  const i = LESSONS.indexOf(L), prev = LESSONS[i - 1], next = LESSONS[i + 1];
  prose.append(h('nav', { class: 'pn', 'aria-label': 'Previous and next lesson' },
    prev ? h('a', { href: '#' + prev.id }, h('small', null, '← Previous'), h('span', null, prev.title)) : h('a', { href: '#home' }, h('small', null, '← Back to'), h('span', null, 'The overview')),
    next ? h('a', { class: 'next', href: '#' + next.id }, h('small', null, next.stage !== L.stage ? (GROUPS[next.stage].part === 2 ? `Next · track: ${GROUPS[next.stage].title}` : `Next · down to ${GROUPS[next.stage].temp}`) : 'Next →'), h('span', null, next.title)) : h('a', { class: 'next', href: '#glossary' }, h('small', null, 'Next →'), h('span', null, 'Glossary'))));
}
function renderQuiz(L) {
  const n = L.quiz.length, need = Math.ceil(n * .7), st = L.quiz.map(() => ({ first: null, done: false }));
  const sec = h('section', { class: 'quiz' }), scoreEl = h('div', { class: 'quiz-score', 'aria-live': 'polite' }), summary = h('div', { class: 'status', hidden: true });
  const upd = () => {
    const answered = st.filter(s => s.done).length, right = st.filter(s => s.first === true).length;
    scoreEl.innerHTML = `<span><b>${right}</b> correct on the first try</span><span><b>${answered}</b> of ${n} answered</span>`;
    if (answered < n) return;
    const pass = right >= need; if (pass) { Prog.done(L.id); renderNav(L.id); }
    summary.hidden = false; summary.className = 'status quiz-sum ' + (pass ? 'good' : 'bad'); summary.innerHTML = '';
    summary.append(h('span', null, pass ? `You scored ${right} of ${n}. Lesson complete: its marker in the lesson list is filled in.` : `You scored ${right} of ${n}. Get ${need} or more right on the first try to mark this lesson complete.`),
      btn('Retake with shuffled options', () => { const fresh = renderQuiz(L); sec.replaceWith(fresh); fresh.scrollIntoView({ block: 'start', behavior: reduced() ? 'auto' : 'smooth' }); }, 'sm'));
  };
  sec.append(h('div', { class: 'quiz-head' }, h('h2', null, 'Check yourself'), h('span', { class: 'quiz-meta' }, `${n} questions · score ${need} to complete`)), scoreEl);
  if (Prog.d.done[L.id]) sec.append(h('p', { class: 'hint', style: 'margin:0 0 18px' }, 'You have completed this lesson already. Retaking the check will not undo that.'));
  L.quiz.forEach((q, qi) => {
    const order = q.o.map((_, i) => i); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const why = h('div', { class: 'q-why', hidden: true, 'aria-live': 'polite' }), opts = h('div', { class: 'q-opts' }), btns = [];
    const reveal = prefix => {
      btns.forEach(([oi, b]) => { b.disabled = true; if (oi === q.a && b.dataset.r !== 'right') b.dataset.r = 'shown'; });
      why.innerHTML = `<b>${prefix}</b> ${q.why}`; why.hidden = false; st[qi].done = true; upd();
    };
    order.forEach((oi, k) => {
      const b = h('button', { type: 'button', class: 'q-opt' }, h('span', { class: 'q-letter' }, 'ABCDEF'[k]), h('span', null, q.o[oi]));
      b.addEventListener('click', () => {
        if (st[qi].done) return;
        if (oi === q.a) { b.dataset.r = 'right'; if (st[qi].first === null) st[qi].first = true; reveal(st[qi].first ? 'Correct.' : 'Correct on a later try.'); }
        else {
          b.dataset.r = 'wrong'; b.disabled = true; if (st[qi].first === null) st[qi].first = false;
          why.hidden = false; why.innerHTML = '';
          why.append(h('b', null, 'Not quite. '), 'Try another option, or ', h('button', { type: 'button', class: 'linkbtn', onclick: () => reveal('Answer and reasoning:') }, 'show the answer and reasoning'), '.');
        }
      });
      btns.push([oi, b]); opts.append(b);
    });
    sec.append(h('div', { class: 'q' }, h('p', { class: 'q-q' }, `${qi + 1}. ${q.q}`), opts, why));
  });
  sec.append(summary); upd();
  return sec;
}

/* ---------- home ---------- */
function renderHome(main) {
  const done = Prog.count(), firstOpen = LESSONS.find(l => !Prog.d.done[l.id]);
  const started = Object.keys(Prog.d.seen).length > 0;
  const cv = canvas('sq'), bv = new BlochView(cv, { aria: 'Interactive Bloch sphere' }); let st = [0, 0, 1];
  const ketEl = h('div', { class: 'ketline', style: 'text-align:center' });
  const show = () => { ketEl.textContent = '|ψ⟩ = ' + ketOfBloch(st); };
  const gate = g => { st = V.rot(st, ROT[g].axis, ROT[g].ang); bv.rotate(ROT[g].axis, ROT[g].ang, 700); show(); };
  const heroLab = h('div', { class: 'hero-lab' }, cv,
    h('div', { class: 'btns', style: 'justify-content:center' }, ...['H', 'X', 'Y', 'Z', 'S', 'T'].map(g => gateBtn(g, () => gate(g), 'Apply ' + g)),
      btn('Reset', () => { st = [0, 0, 1]; bv.cancel(); bv.moveTo(st, 500).then(() => bv.clearTrail()); show(); }, 'sm')),
    ketEl, h('p', { class: 'hint', style: 'text-align:center;margin:0' }, 'Tap a gate to rotate the qubit. Drag the sphere to look around.'));
  bv.set(st); show();
  main.append(h('section', { class: 'hero' },
    h('div', null,
      h('div', { class: 'eyebrow' }, 'An interactive guide to quantum computing'),
      h('h1', null, 'Into the Cryostat'),
      h('p', { class: 'hero-lede' }, 'Quantum processors run at the bottom of a dilution refrigerator, a hundredth of a degree above absolute zero. This guide takes the same route down. Each stage is colder than the last, and each lesson goes a little deeper, from a single qubit to error-corrected machines. Below the mixing chamber, six research tracks take you to where the field is working now, with the most room given to error correction and fault tolerance.'),
      h('p', { class: 'byline' }, 'Written by ', h('b', null, 'Sai Ganesh Chidambaram')),
      h('div', { class: 'hero-cta' },
        started && firstOpen && firstOpen.n > 1 ? h('a', { class: 'btn pri', href: '#' + firstOpen.id }, `Continue: ${firstOpen.title}`) : h('a', { class: 'btn pri', href: '#qubits' }, 'Start at 300 K'),
        h('a', { class: 'btn', href: '#circuits' }, 'Open the circuit lab'), h('a', { class: 'btn', href: '#glossary' }, 'Glossary')),
      h('div', { class: 'hero-stats' }, h('span', null, h('b', null, String(LESSONS.length)), ' lessons'), h('span', null, h('b', null, '5'), ' stages'), h('span', null, h('b', null, String(TRACKS.length)), ' research tracks'),
        h('span', null, h('b', null, String(LAB_COUNT)), ' interactive labs'), h('span', null, h('b', null, `${done} of ${LESSONS.length}`), ' complete'))),
    heroLab));

  const descent = h('div', { class: 'descent' });
  STAGES.forEach((s, i) => {
    const ls = LESSONS.filter(l => l.stage === i), last = i === STAGES.length - 1;
    descent.append(h('div', { class: 'dz' },
      h('div', { class: 'dz-temp' }, s.temp, h('small', null, s.name)),
      h('div', { class: 'dz-ch', 'aria-hidden': 'true' }, h('div', { class: 'dz-coax' }), h('div', { class: 'dz-plate', style: `--w:${s.w}` }), last ? h('div', { class: 'dz-chip' }) : null),
      h('div', { class: 'dz-body' }, h('div', { class: 'dz-kicker' }, `Stage ${i + 1}`), h('h3', null, s.title), h('p', null, s.blurb),
        h('ul', { class: 'dz-list' }, ...ls.map(l => h('li', null, h('a', { href: '#' + l.id },
          h('span', { class: 'n' }, String(l.n).padStart(2, '0')), h('span', null, l.title), h('span', { class: 'min' }, l.minutes + ' min'),
          h('span', { class: 'pd', 'data-s': Prog.state(l.id), title: PD_LABEL[Prog.state(l.id)] }))))))));
  });
  main.append(h('section', { class: 'sec' }, h('div', { class: 'eyebrow' }, 'The descent'), h('h2', null, 'Five stages, from room temperature to ten millikelvin'),
    h('p', null, 'The lessons are meant to be read in order, but each one stands on its own. Every lesson has at least one lab you can play with, a short list of key ideas and a ten-question check with the reasoning behind every answer. Get seven or more right on the first try and the lesson is marked complete in this browser.'), descent));

  const tracks = h('div', { class: 'tracks' });
  TRACKS.forEach((t, k) => {
    const gi = STAGES.length + k, ls = LESSONS.filter(l => l.stage === gi);
    tracks.append(h('article', { class: 'trk-card' + (t.featured ? ' feat' : '') },
      h('div', { class: 'trk-top' }, h('span', { class: 'trk-code' }, t.code), h('span', { class: 'dz-kicker' }, `${ls.length} lessons · ${ls.reduce((s, l) => s + Object.keys(l.labs).length, 0)} labs`)),
      h('h3', null, t.title), h('p', null, t.blurb),
      h('ul', { class: 'dz-list' }, ...ls.map(l => h('li', null, h('a', { href: '#' + l.id },
        h('span', { class: 'n' }, String(l.n).padStart(2, '0')), h('span', null, l.title), h('span', { class: 'min' }, l.minutes + ' min'),
        h('span', { class: 'pd', 'data-s': Prog.state(l.id), title: PD_LABEL[Prog.state(l.id)] })))))));
  });
  main.append(h('section', { class: 'sec' }, h('div', { class: 'eyebrow' }, 'Part II · Research tracks'), h('h2', null, 'Six tracks into current research'),
    h('p', null, 'Most quantum computing research does not need a quantum computer. Algorithms and complexity are mathematics; codes, decoders and thresholds are theory plus classical simulation; compilers are classical software about quantum programs. These tracks assume Part I and go into the methods researchers use, with the same live labs.'), tracks));

  const legBloch = canvas('sq', 'max-width:150px'), lb = new BlochView(legBloch, { labels: 'min', drag: false, trail: false }); lb.set([S2 * .9, S2 * .9 * .3, .55]);
  const circ = h('div', { class: 'circ-wrap', style: 'background:var(--surface)' }); circ.append(drawCircuit(2, [[{ g: 'H', q: 0 }], [{ g: 'CX', c: 0, t: 1 }]], { cw: 60, aria: 'Example circuit' }).svg);
  const wheel = h('div', { class: 'wheel', style: wheelStyle() }); Scope.theme(() => { wheel.style.cssText = wheelStyle(); });
  main.append(h('section', { class: 'sec' }, h('div', { class: 'eyebrow' }, 'Reading the pictures'), h('h2', null, 'Three conventions used everywhere'),
    h('div', { class: 'legend-grid' },
      h('div', { class: 'legend-item' }, h('div', { style: 'display:flex;gap:12px;align-items:center' }, wheel, h('h3', null, 'Colour is phase')),
        h('p', null, 'Bar heights show probability. Colour shows the phase of the amplitude: blue for positive real numbers, orange-red for negative ones, other hues for complex phases.')),
      h('div', { class: 'legend-item' }, legBloch, h('h3', null, 'The copper arrow is the state'),
        h('p', null, 'On every Bloch sphere the north pole is |0⟩ and the south pole is |1⟩. An arrow shorter than the radius means the qubit is noisy or entangled.')),
      h('div', { class: 'legend-item' }, circ, h('h3', null, 'Circuits read left to right'),
        h('p', null, 'Each wire is a qubit starting in |0⟩. The top wire, q0, is the leftmost digit of every ket, so |10⟩ means q0 = 1 and q1 = 0.')))));
  main.append(h('section', { class: 'sec about' }, h('div', { class: 'eyebrow' }, 'About this guide'), h('h2', null, 'Written by Sai Ganesh Chidambaram'),
    h('p', null, 'Into the Cryostat assumes high-school algebra and a little comfort with complex numbers. Everything else is built up from the first lesson. Every simulation runs live in your browser on the same small state-vector engine, so the numbers you see are computed, not drawn by hand.'),
    h('p', null, 'Your progress is stored only in this browser. Nothing you do here is sent anywhere.')));
}

/* ---------- glossary ---------- */
function renderGlossary(main) {
  const q = h('input', { type: 'search', id: 'glossary-search', class: 'gl-search', placeholder: 'Filter terms, for example “phase”', 'aria-label': 'Filter glossary terms' });
  const list = h('dl', { class: 'gl' }), count = h('p', { class: 'hint' });
  const items = window.GLOSSARY.map(([t, d, link]) => {
    const L = LESSONS.find(l => l.id === link);
    const el = h('div', { class: 'gl-item' }, h('dt', null, t), h('dd', null, d + ' ', L ? h('a', { href: '#' + L.id }, `Lesson ${L.n} →`) : null));
    list.append(el); return { el, s: (t + ' ' + d).toLowerCase() };
  });
  const filt = () => { const v = q.value.trim().toLowerCase(); let n = 0; items.forEach(it => { const on = !v || it.s.includes(v); it.el.hidden = !on; if (on) n++; }); count.textContent = `${n} of ${items.length} terms`; };
  q.addEventListener('input', filt);
  main.append(h('header', { class: 'ph' }, h('div', { class: 'ph-eyebrow' }, h('span', null, 'Reference')), h('h1', null, 'Glossary'),
    h('p', { class: 'lede' }, 'Short definitions of the terms used in this guide, each linked to the lesson that explains it properly.')), q, count, list);
  filt();
}

/* ---------- router ---------- */
let firstRoute = true;
function route() {
  const id = (location.hash || '').replace(/^#/, '') || 'home';
  const L = LESSONS.find(l => l.id === id), main = document.getElementById('main');
  Scope.reset(); main.innerHTML = '';
  if (L) Prog.seen(L.id);
  if (L) renderLesson(L, main); else if (id === 'glossary') renderGlossary(main); else renderHome(main);
  renderNav(L ? L.id : id === 'glossary' ? 'glossary' : 'home');
  document.title = L ? `${L.title} · Into the Cryostat` : id === 'glossary' ? 'Glossary · Into the Cryostat' : 'Into the Cryostat';
  closeDrawer();
  if (!firstRoute) { window.scrollTo(0, 0); main.focus({ preventScroll: true }); }
  firstRoute = false;
}
Prog.load();
window.addEventListener('hashchange', route);
route();
