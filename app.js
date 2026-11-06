/* =========================================================
   第6题 & 第7题 · 互动复盘
   ========================================================= */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------------- 音效 ---------------- */
  const Sound = (() => {
    let ctx = null, master = null;
    let on = localStorage.getItem('math-sound') !== 'off';
    const ensure = () => {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain(); master.gain.value = .18; master.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    };
    const env = (g, t, a, d, peak) => {
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + a);
      g.gain.exponentialRampToValueAtTime(.0001, t + a + d);
    };
    const tone = ({ f = 440, dur = .15, type = 'sine', v = .2, w = 0, end = null }) => {
      if (!on) return; const c = ensure(); if (!c) return;
      const t = c.currentTime + w, o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (end) o.frequency.exponentialRampToValueAtTime(end, t + dur);
      env(g, t, .01, dur, v); o.connect(g).connect(master); o.start(t); o.stop(t + dur + .05);
    };
    return {
      get on() { return on; },
      set on(v) { on = v; localStorage.setItem('math-sound', v ? 'on' : 'off'); if (v) ensure(); },
      unlock() { if (on) ensure(); },
      click() { tone({ f: 640, type: 'triangle', dur: .05, v: .08 }); },
      snap() { tone({ f: 520, type: 'sine', dur: .09, v: .12 }); tone({ f: 780, type: 'sine', dur: .12, v: .1, w: .05 }); },
      good() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone({ f, type: 'triangle', dur: .25, v: .12, w: i * .07 })); },
      wrong() { tone({ f: 220, type: 'sawtooth', dur: .3, v: .09, end: 110 }); },
      win() { [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone({ f, type: 'triangle', dur: .3, v: .11, w: i * .08 })); }
    };
  })();

  const soundBtn = $('#soundBtn');
  const syncSound = () => {
    soundBtn.setAttribute('aria-pressed', String(Sound.on));
    soundBtn.title = Sound.on ? '音效已开启，点击关闭' : '音效已关闭，点击开启';
  };
  syncSound();
  soundBtn.addEventListener('click', () => {
    Sound.on = !Sound.on; syncSound();
    toast(Sound.on ? '音效已开启' : '音效已关闭');
    if (Sound.on) Sound.click();
  });
  window.addEventListener('pointerdown', () => Sound.unlock(), { once: true });

  /* ---------------- 工具 ---------------- */
  let toastTimer = null;
  function toast(msg) {
    const el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
  }
  const el = (tag, attrs = {}, parent = null) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------------- 数字滚动 ---------------- */
  $$('.count').forEach(node => {
    const to = Number(node.dataset.to || 0);
    if (reduce) { node.textContent = to; return; }
    const start = performance.now(), dur = 900;
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      node.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  /* ========================================================
     第 6 题：互动图象
     ======================================================== */
  const q6svg = $('#q6svg');
  if (q6svg) {
    const W = 560, H = 470;
    const cx = 280, cy = 250, ux = 38, uy = 40;
    const xMin = -6, xMax = 6, yMin = -2.5, yMax = 5.5;
    const px = x => cx + x * ux;
    const py = y => cy - y * uy;

    const defs = el('defs', {}, q6svg);
    const clip = el('clipPath', { id: 'q6clip' }, defs);
    el('rect', { x: px(xMin), y: py(yMax), width: (xMax - xMin) * ux, height: (yMax - yMin) * uy }, clip);
    const marker = el('marker', { id: 'arrQ6', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0 0L10 5L0 10z', fill: '#2f5d8a' }, marker);

    // grid
    const gGrid = el('g', { stroke: '#e8dfcb', 'stroke-width': 1 }, q6svg);
    for (let x = xMin; x <= xMax; x++) {
      if (x === 0) continue;
      el('line', { x1: px(x), y1: py(yMax), x2: px(x), y2: py(yMin) }, gGrid);
    }
    for (let y = Math.ceil(yMin); y <= yMax; y++) {
      if (y === 0) continue;
      el('line', { x1: px(xMin), y1: py(y), x2: px(xMax), y2: py(y) }, gGrid);
    }
    // axes
    const gAxis = el('g', { stroke: '#5a5142', 'stroke-width': 1.6 }, q6svg);
    el('line', { x1: px(xMin), y1: py(0), x2: px(xMax) + 10, y2: py(0), 'marker-end': 'url(#arrQ6)' }, gAxis);
    el('line', { x1: px(0), y1: py(yMin), x2: px(0), y2: py(yMax) - 12, 'marker-end': 'url(#arrQ6)' }, gAxis);
    // labels
    const gLabels = el('g', { 'font-size': 12, fill: '#7d8a99', 'text-anchor': 'middle', 'font-family': 'inherit' }, q6svg);
    for (let x = xMin; x <= xMax; x++) {
      if (x === 0) continue;
      el('text', { x: px(x), y: py(0) + 18 }, gLabels).textContent = x;
    }
    for (let y = Math.ceil(yMin); y <= yMax; y++) {
      if (y === 0) continue;
      el('text', { x: px(0) - 12, y: py(y) + 4, 'text-anchor': 'end' }, gLabels).textContent = y;
    }
    el('text', { x: px(0) - 12, y: py(0) + 18, 'text-anchor': 'end', fill: '#5a5142' }, gLabels).textContent = 'O';
    el('text', { x: px(xMax) + 18, y: py(0) + 4, style: 'font-style:italic;font-size:15px', fill: '#5a5142' }, gLabels).textContent = 'x';
    el('text', { x: px(0) + 12, y: py(yMax) - 14, style: 'font-style:italic;font-size:15px', fill: '#5a5142' }, gLabels).textContent = 'y';

    // student's segment (hidden)
    const studentG = el('g', { opacity: 0 }, q6svg);
    el('line', { x1: px(0), y1: py(4), x2: px(3.7), y2: py(-2.3), stroke: '#d6452f', 'stroke-width': 3, 'stroke-dasharray': '7 5', 'stroke-linecap': 'round' }, studentG);
    el('text', { x: px(2.0), y: py(-1.6), fill: '#d6452f', 'font-size': 12, 'text-anchor': 'middle' }, studentG).textContent = '你卷面上的线（一小段）';
    el('path', { d: `M${px(3.7)} ${py(-2.3)} L${px(4.6)} ${py(-3.0)}`, stroke: '#d6452f', 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }, studentG);

    // main line
    const lineG = el('g', { 'clip-path': 'url(#q6clip)' }, q6svg);
    const mainLine = el('line', { stroke: '#2f5d8a', 'stroke-width': 3, 'stroke-linecap': 'round', 'marker-start': 'url(#arrQ6)', 'marker-end': 'url(#arrQ6)' }, lineG);

    // points
    const pts = el('g', {}, q6svg);
    el('circle', { cx: px(3), cy: py(0), r: 5, fill: '#d6452f' }, pts);
    el('text', { x: px(3), y: py(0) - 18, fill: '#d6452f', 'font-size': 13, 'font-family': 'serif', 'text-anchor': 'middle' }, pts).textContent = 'A(3,0)';
    el('circle', { cx: px(0), cy: py(4), r: 5, fill: '#2f7d5b' }, pts);
    el('text', { x: px(0) + 10, y: py(4) - 8, fill: '#2f7d5b', 'font-size': 14, 'font-family': 'serif' }, pts).textContent = 'B(0,4)';
    const intDot = el('circle', { r: 4.5, fill: '#d6452f', opacity: 0 }, pts);

    // clip a line to the chart rect
    function clipLine(x1, y1, x2, y2, r) {
      let t0 = 0, t1 = 1;
      const dx = x2 - x1, dy = y2 - y1;
      const p = [-dx, dx, -dy, dy];
      const q = [x1 - r.x1, r.x2 - x1, y1 - r.y1, r.y2 - y1];
      for (let i = 0; i < 4; i++) {
        if (Math.abs(p[i]) < 1e-9) { if (q[i] < 0) return null; continue; }
        const t = q[i] / p[i];
        if (p[i] < 0) { if (t > t1) return null; if (t > t0) t0 = t; }
        else { if (t < t0) return null; if (t < t1) t1 = t; }
      }
      return [x1 + t0 * dx, y1 + t0 * dy, x1 + t1 * dx, y1 + t1 * dy];
    }
    const rect = { x1: px(xMin), x2: px(xMax), y1: py(yMax), y2: py(yMin) };

    const slider = $('#kSlider'), kOut = $('#kOut'), xIntEl = $('#xInt');
    const passA = $('#passA'), q6msg = $('#q6msg');
    let k = -0.9, animId = null, snapped = false;

    function render(kk, fromUser) {
      k = kk;
      const xInt = k === 0 ? Infinity : -4 / k;
      // draw from far ends, then clip
      const seg = clipLine(px(-30), py(-30 * k + 4), px(30), py(30 * k + 4), rect);
      if (seg) {
        mainLine.setAttribute('x1', seg[0]); mainLine.setAttribute('y1', seg[1]);
        mainLine.setAttribute('x2', seg[2]); mainLine.setAttribute('y2', seg[3]);
      }
      const inRange = xInt >= xMin && xInt <= xMax && Math.abs(k) > .01;
      intDot.setAttribute('opacity', inRange ? 1 : 0);
      if (inRange) { intDot.setAttribute('cx', px(xInt)); intDot.setAttribute('cy', py(0)); }

      const near = Math.abs(xInt - 3) < 0.07;
      snapped = near;
      if (near) {
        passA.textContent = '✓ 正好经过 A(3,0)';
        passA.classList.add('ok'); passA.classList.remove('bad');
        q6msg.textContent = '对！k = −4/3，直线正好经过 A，解析式就是 y = −4/3·x + 4。';
        q6msg.classList.add('win');
      } else {
        passA.textContent = xInt > 3 ? '交点偏右（还没到 A）' : '交点偏左（已经越过 A）';
        passA.classList.remove('ok');
        q6msg.textContent = xInt > 3 ? '把 k 再调小一点，让交点向左移到 3。' : '调过头了，把 k 调大一点，让交点向右回到 3。';
        q6msg.classList.remove('win');
      }
      kOut.textContent = (k < 0 ? '−' : '') + Math.abs(k).toFixed(2);
      xIntEl.textContent = inRange ? xInt.toFixed(2) : '—';
      if (fromUser) slider.value = k;
    }

    slider.addEventListener('input', () => {
      render(Number(slider.value), false);
      Sound.click();
    });

    function animateTo(target, ms = 650) {
      cancelAnimationFrame(animId);
      const from = k, t0 = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - t0) / ms);
        const e = 1 - Math.pow(1 - p, 3);
        render(from + (target - from) * e, false);
        slider.value = k;
        if (p < 1) animId = requestAnimationFrame(step);
        else { render(target, false); Sound.good(); }
      };
      animId = requestAnimationFrame(step);
    }

    $('#snapBtn').addEventListener('click', () => { animateTo(-4 / 3); });
    $('#studentBtn').addEventListener('click', () => {
      const show = studentG.getAttribute('opacity') !== '1';
      studentG.setAttribute('opacity', show ? 1 : 0);
      q6msg.textContent = show ? '红色虚线就是卷面上的画法：只画了 B 到 A 下方的一小段，没有向两端延长。' : '把 k 调到 −4/3，直线就会正好经过 A。';
      Sound.click();
    });

    render(-0.9, false);
  }

  /* ========================================================
     第 7 题：等腰三角形探雷器
     ======================================================== */
  const q7svg = $('#q7svg');
  if (q7svg) {
    const W = 760, H = 430;
    const cx = 410, cy = 260, ux = 38, uy = 42;
    const xMin = -10, xMax = 7, yMin = -1, yMax = 5.5;
    const px = x => cx + x * ux;
    const py = y => cy - y * uy;
    const A = { x: -3, y: 0 }, B = { x: 0, y: 4 };
    const AB = 5;
    const SOLS = [
      { m: 2, case: 1, tag: 'M3', up: true },
      { m: 3, case: 2, tag: 'M4', up: false },
      { m: -8, case: 1, tag: 'M1', up: true },
      { m: 7 / 6, case: 3, tag: 'M2', up: false }
    ];

    const defs = el('defs', {}, q7svg);
    const marker = el('marker', { id: 'arrQ7', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0 0L10 5L0 10z', fill: '#5a5142' }, marker);

    const gGrid = el('g', { stroke: '#eee5d2', 'stroke-width': 1 }, q7svg);
    for (let x = xMin; x <= xMax; x++) {
      if (x === 0) continue;
      el('line', { x1: px(x), y1: py(5.2), x2: px(x), y2: py(-0.8) }, gGrid);
    }
    for (let y = -0; y <= 5; y++) {
      if (y === 0) continue;
      el('line', { x1: px(xMin), y1: py(y), x2: px(xMax), y2: py(y) }, gGrid);
    }
    // axes
    el('line', { x1: px(xMin), y1: py(0), x2: px(xMax) + 8, y2: py(0), stroke: '#5a5142', 'stroke-width': 1.6, 'marker-end': 'url(#arrQ7)' }, q7svg);
    el('line', { x1: px(0), y1: py(-0.8), x2: px(0), y2: py(5.2) - 10, stroke: '#5a5142', 'stroke-width': 1.6, 'marker-end': 'url(#arrQ7)' }, q7svg);
    const gLab = el('g', { 'font-size': 12, fill: '#8b7d63', 'text-anchor': 'middle', 'font-family': 'inherit' }, q7svg);
    for (let x = xMin; x <= xMax; x++) {
      if (x === 0) continue;
      if (x % 2 === 0 || Math.abs(x) <= 4) el('text', { x: px(x), y: py(0) + 16 }, gLab).textContent = x;
    }
    for (let y = 1; y <= 5; y++) el('text', { x: px(0) - 10, y: py(y) + 4, 'text-anchor': 'end' }, gLab).textContent = y;
    el('text', { x: px(xMax) + 16, y: py(0) + 4, 'font-size': 14, 'font-style': 'italic' }, gLab).textContent = 'x';
    el('text', { x: px(0) + 14, y: py(5.2) - 12, 'font-size': 14, 'font-style': 'italic' }, gLab).textContent = 'y';

    // solution markers
    const gSols = el('g', {}, q7svg);
    // triangle
    const gTri = el('g', {}, q7svg);
    const lineAB = el('line', { x1: px(A.x), y1: py(A.y), x2: px(B.x), y2: py(B.y), stroke: '#2f5d8a', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, gTri);
    const lineAM = el('line', { stroke: '#2f7d5b', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, gTri);
    const lineBM = el('line', { stroke: '#c98a2b', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, gTri);
    const labAM = el('text', { 'font-size': 13, fill: '#2f7d5b', 'font-family': 'monospace', 'text-anchor': 'middle' }, gTri);
    const labBM = el('text', { 'font-size': 13, fill: '#c98a2b', 'font-family': 'monospace', 'text-anchor': 'middle' }, gTri);
    const labAB = el('text', { 'font-size': 13, fill: '#2f5d8a', 'font-family': 'monospace', 'text-anchor': 'middle' }, gTri);
    labAB.textContent = '5';

    // fixed points
    const gPts = el('g', {}, q7svg);
    el('circle', { cx: px(A.x), cy: py(A.y), r: 4.5, fill: '#1e2a3a' }, gPts);
    el('text', { x: px(A.x) - 6, y: py(A.y) - 10, 'font-size': 15, fill: '#1e2a3a', 'text-anchor': 'end', 'font-family': 'serif' }, gPts).textContent = 'A';
    el('circle', { cx: px(B.x), cy: py(B.y), r: 4.5, fill: '#1e2a3a' }, gPts);
    el('text', { x: px(B.x) + 10, y: py(B.y) - 4, 'font-size': 15, fill: '#1e2a3a', 'font-family': 'serif' }, gPts).textContent = 'B';

    // M handle
    const gM = el('g', { style: 'cursor:grab' }, q7svg);
    const mDot = el('circle', { r: 9, fill: '#d6452f', opacity: .18 }, gM);
    const mCore = el('circle', { r: 5.5, fill: '#d6452f' }, gM);
    const mLabel = el('text', { 'font-size': 13, fill: '#d6452f', 'font-family': 'serif', 'text-anchor': 'start', 'pointer-events': 'none' }, gM);

    const amVal = $('#amVal'), bmVal = $('#bmVal'), abVal = $('#abVal');
    const cond1 = $('#cond1'), cond2 = $('#cond2'), cond3 = $('#cond3');
    const foundEl = $('#foundCount'), q7msg = $('#q7msg');
    const foundList = $('#foundList'), mCoord = $('#mCoord');
    const found = new Set();
    let m = 0.8, dragging = false, autoToken = 0;

    const dist = (x1, y1, x2, y2) => Math.hypot(x1 - x2, y1 - y2);

    function addSolution(sol) {
      if (found.has(sol.m)) return false;
      found.add(sol.m);
      const g = el('g', {}, gSols);
      el('line', { x1: px(sol.m), y1: py(0) - 10, x2: px(sol.m), y2: py(0) + 10, stroke: '#d6452f', 'stroke-width': 1.5, 'stroke-dasharray': '3 3' }, g);
      el('circle', { cx: px(sol.m), cy: py(0), r: 5.5, fill: '#fff', stroke: '#d6452f', 'stroke-width': 2.5 }, g);
      el('text', {
        x: px(sol.m), y: py(0) + (sol.up ? -20 : -38), 'text-anchor': 'middle', 'font-size': 12,
        fill: '#d6452f', 'font-family': 'monospace', 'font-weight': 700
      }, g).textContent = sol.tag;
      const chip = document.createElement('span');
      chip.textContent = `${sol.tag} (${sol.m === 7 / 6 ? '7/6' : sol.m}, 0)`;
      foundList.appendChild(chip);
      foundEl.textContent = found.size;
      Sound.snap();
      if (found.size === 4) {
        q7msg.textContent = '四个解都找到了：M(2,0)、(3,0)、(−8,0)、(7/6,0)。这就是你卷面上漏掉的那个“右边”的解。';
        q7msg.classList.add('win');
        Sound.win();
        fireConfetti();
      }
      return true;
    }

    function update() {
      const mx = px(m), my = py(0);
      mDot.setAttribute('cx', mx); mDot.setAttribute('cy', my);
      mCore.setAttribute('cx', mx); mCore.setAttribute('cy', my);
      mLabel.setAttribute('x', mx + 11); mLabel.setAttribute('y', my - 10);
      mLabel.textContent = 'M';
      mCoord.textContent = `M(${Math.abs(m) < .02 ? 0 : m.toFixed(1)}, 0)`;

      lineAM.setAttribute('x1', px(A.x)); lineAM.setAttribute('y1', py(A.y));
      lineAM.setAttribute('x2', mx); lineAM.setAttribute('y2', my);
      lineBM.setAttribute('x1', px(B.x)); lineBM.setAttribute('y1', py(B.y));
      lineBM.setAttribute('x2', mx); lineBM.setAttribute('y2', my);

      const AM = Math.abs(m - A.x), BM = Math.hypot(m - B.x, B.y);
      amVal.textContent = AM.toFixed(2);
      bmVal.textContent = BM.toFixed(2);
      abVal.textContent = AB.toFixed(2);

      labAM.setAttribute('x', (px(A.x) + mx) / 2);
      labAM.setAttribute('y', my - 8);
      labAM.textContent = AM.toFixed(1);
      labBM.setAttribute('x', (px(B.x) + mx) / 2);
      labBM.setAttribute('y', (py(B.y) + my) / 2 - 6);
      labBM.textContent = BM.toFixed(1);
      labAB.setAttribute('x', (px(A.x) + px(B.x)) / 2 - 6);
      labAB.setAttribute('y', (py(A.y) + py(B.y)) / 2);

      const c1 = Math.abs(AB - AM) < .02, c2 = Math.abs(AB - BM) < .02, c3 = Math.abs(AM - BM) < .02;
      cond1.classList.toggle('hit', c1);
      cond2.classList.toggle('hit', c2);
      cond3.classList.toggle('hit', c3);
    }

    function setM(nm, snap = true) {
      m = clamp(nm, -9.5, 6.5);
      if (snap) {
        for (const s of SOLS) {
          if (Math.abs(m - s.m) < 0.16) {
            m = s.m;
            if (!found.has(s.m)) addSolution(s);
            break;
          }
        }
      }
      update();
    }

    function svgX(clientX) {
      const r = q7svg.getBoundingClientRect();
      const vb = q7svg.viewBox.baseVal;
      return vb.x + (clientX - r.left) / r.width * vb.width;
    }
    function fitViewBox() {
      const small = innerWidth < 620;
      q7svg.setAttribute('viewBox', small ? '18 22 600 304' : '0 0 760 320');
    }
    fitViewBox();
    addEventListener('resize', fitViewBox);

    function onMove(e) {
      if (!dragging) return;
      const sx = svgX(e.clientX);
      setM((sx - cx) / ux);
      e.preventDefault();
    }
    q7svg.addEventListener('pointerdown', (e) => {
      if (e.target.closest('g') && e.target.closest('g').contains(mDot)) { /* noop */ }
      dragging = true; autoToken++;
      q7svg.setPointerCapture?.(e.pointerId);
      const sx = svgX(e.clientX);
      setM((sx - cx) / ux);
      Sound.click();
    });
    q7svg.addEventListener('pointermove', onMove);
    q7svg.addEventListener('pointerup', () => { dragging = false; });
    q7svg.addEventListener('pointercancel', () => { dragging = false; });

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    $('#autoBtn').addEventListener('click', async () => {
      const token = ++autoToken;
      Sound.click();
      for (let t = -9.5; t <= 6.5; t += 0.08) {
        if (token !== autoToken) return;
        setM(t, false);
        let pause = 16;
        for (const s of SOLS) {
          if (Math.abs(t - s.m) < 0.06) {
            setM(s.m, true);
            pause = 420;
            break;
          }
        }
        await sleep(pause);
      }
      if (token === autoToken) { setM(0.8, false); }
    });
    $('#resetBtn').addEventListener('click', () => {
      autoToken++;
      found.clear();
      gSols.innerHTML = '';
      foundList.innerHTML = '';
      foundEl.textContent = '0';
      q7msg.classList.remove('win');
      q7msg.textContent = '先拖动 M 试试。提示：答案分布在 A 的左右两边。';
      setM(0.8, false);
      Sound.click();
    });

    setM(0.8, false);
  }

  /* ========================================================
     练习
     ======================================================== */
  const ANSWERS = { '1': 'C', '2': 'B', '3': 'C' };
  $$('.pq').forEach(card => {
    const id = card.dataset.pq;
    card.addEventListener('click', (e) => {
      const btn = e.target.closest('.pq-options button');
      if (!btn || card.dataset.done) return;
      card.dataset.done = '1';
      const ok = btn.dataset.k === ANSWERS[id];
      $$('.pq-options button', card).forEach(b => {
        b.disabled = true;
        if (b.dataset.k === ANSWERS[id]) b.classList.add('ok');
        else if (b === btn) b.classList.add('bad');
      });
      const exp = $('.pq-exp', card);
      exp.classList.add('show');
      exp.innerHTML = (ok ? '✓ 对了。' : '✗ 再看一遍。') + exp.innerHTML;
      ok ? Sound.good() : Sound.wrong();
      if (ok) fireConfetti(true);
    });
  });

  /* ========================================================
     复制 / 彩带 / 进度
     ======================================================== */
  const copyBtn = $('#copyBtn');
  copyBtn?.addEventListener('click', async () => {
    const text = [
      '第6题（15/16）：A(3,0)、B(0,4)，面积 6，y=2/3x−2 全对。扣 1 分在作图：一次函数图象是直线，要过两点、用直尺、两端延长、标交点。',
      '第7题（24/25）：A(−3,0)、B(0,4)；P(6,0) 或 (−6,0)，面积 18 或 6。等腰三角形漏了 M(2,0)——AB=AM 时 |m+3|=5 有两解：m=2 或 −8。',
      '四个 M：M(2,0)、(3,0)、(−8,0)、(7/6,0)。'
    ].join('\n');
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; }
    catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', '');
        ta.style.position = 'fixed'; ta.style.top = '-1000px';
        document.body.appendChild(ta); ta.select();
        ok = document.execCommand('copy'); ta.remove();
      } catch { ok = false; }
    }
    if (ok) { toast('已复制，可以贴到错题本'); Sound.good(); }
    else toast('复制失败，请手动选中');
  });

  const canvas = $('#confetti');
  let cctx = null;
  function fireConfetti(small = false) {
    if (reduce || !canvas) return;
    cctx = cctx || canvas.getContext('2d');
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const colors = ['#d6452f', '#2f5d8a', '#2f7d5b', '#f2c14e', '#8b7d63'];
    const n = small ? 40 : 90;
    const parts = Array.from({ length: n }, (_, i) => ({
      x: innerWidth * (small ? .5 : .5), y: small ? innerHeight * .45 : innerHeight * .35,
      vx: (Math.random() - .5) * 12, vy: -Math.random() * 9 - 2, g: .25,
      w: 4 + Math.random() * 6, h: 3 + Math.random() * 4,
      rot: Math.random() * 6, vr: (Math.random() - .5) * .3,
      c: colors[i % colors.length], life: 1
    }));
    const t0 = performance.now();
    const tick = (t) => {
      cctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach(p => {
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.vx *= .995; p.rot += p.vr; p.life -= .008;
        if (p.life <= 0) return;
        cctx.save(); cctx.globalAlpha = Math.max(0, p.life);
        cctx.translate(p.x, p.y); cctx.rotate(p.rot);
        cctx.fillStyle = p.c; cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cctx.restore();
      });
      if (t - t0 < 2400) requestAnimationFrame(tick);
      else cctx.clearRect(0, 0, innerWidth, innerHeight);
    };
    requestAnimationFrame(tick);
  }

  const progress = $('#progress');
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
