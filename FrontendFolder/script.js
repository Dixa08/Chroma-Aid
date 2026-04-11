/* ═══════════════════════════════════════════
   ChromaAid — script.js
   Complete Color Vision Platform Logic
═══════════════════════════════════════════ */

'use strict';

// ── APP STATE ──────────────────────────────
const APP = {
  currentPage: 'dashboard',
  theme: 'dark',
  visionType: 'normal',
  testType: null,
  testState: null,
  gameState: null,
  results: JSON.parse(localStorage.getItem('chromaaid_results') || 'null'),
  history: JSON.parse(localStorage.getItem('chromaaid_history') || '[]'),
  simMode: 'normal',
  simImageData: null,
};

// ── INIT ───────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  loadPreferences();
  renderDashboard();
  drawTestPreviews();
  initSimulationPage();
  initToolsPage();
  initSpectrumCanvas();
  applyTheme(APP.visionType, APP.theme);
});

function loadPreferences() {
  const saved = localStorage.getItem('chromaaid_prefs');
  if (saved) {
    const p = JSON.parse(saved);
    APP.theme = p.theme || 'dark';
    APP.visionType = p.visionType || 'normal';
  }
  document.documentElement.setAttribute('data-theme', APP.theme);
  document.documentElement.setAttribute('data-vision', APP.visionType);
  document.getElementById('themeLabel').textContent = APP.theme === 'dark' ? 'Light' : 'Dark';
}

function saveUserPreference() {
  localStorage.setItem('chromaaid_prefs', JSON.stringify({
    theme: APP.theme,
    visionType: APP.visionType,
  }));
}

// ── NAVIGATION ─────────────────────────────
function handleNavigation(page) {
  APP.currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === page);
  });
  const el = document.getElementById(`page-${page}`);
  if (el) el.classList.add('active');

  // Page-specific init
  if (page === 'test') {
    showTestSelection();
    drawTestPreviews();
  }
  if (page === 'results') renderResults();
  if (page === 'simulation') drawVisibleRange();
  if (page === 'tools') renderToolsPage();
  if (page === 'dashboard') renderDashboard();

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('active');
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('overlay');
  sb.classList.toggle('open');
  ov.classList.toggle('active');
}

function toggleMode() {
  APP.theme = APP.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', APP.theme);
  document.getElementById('themeLabel').textContent = APP.theme === 'dark' ? 'Light' : 'Dark';
  saveUserPreference();
  applyTheme(APP.visionType, APP.theme);
  // Redraw canvases
  initSpectrumCanvas();
  if (APP.currentPage === 'simulation') drawVisibleRange();
}

// ── THEME SYSTEM ───────────────────────────
function applyTheme(visionType, mode) {
  document.documentElement.setAttribute('data-vision', visionType);
  document.documentElement.setAttribute('data-theme', mode);
  APP.visionType = visionType;
  APP.theme = mode;
  saveUserPreference();
  // Redraw spectrum etc
  setTimeout(() => { initSpectrumCanvas(); drawVisibleRange(); }, 100);
}

function detectUserType(results) {
  if (!results) return 'normal';
  const { proto, deuter, trit } = results.scores;
  if (deuter > 40 || proto > 40) return 'redgreen';
  if (trit > 40) return 'blueyellow';
  return 'normal';
}

// ── COLOR MATH ─────────────────────────────
// LAB-inspired perceptual difference
function labDelta(r1, g1, b1, r2, g2, b2) {
  // Approximate CIELAB lightness/chroma difference
  const L1 = 0.299*r1 + 0.587*g1 + 0.114*b1;
  const L2 = 0.299*r2 + 0.587*g2 + 0.114*b2;
  const dL = L1 - L2;
  const da = (r1 - g1*0.5 - b1*0.5) - (r2 - g2*0.5 - b2*0.5);
  const db = (b1 - r1*0.3 - g1*0.2) - (b2 - r2*0.3 - g2*0.2);
  return Math.sqrt(dL*dL + da*da + db*db);
}

// Seeded random (for reproducible sessions)
function seededRand(seed) {
  let s = seed;
  return () => {
    s ^= s << 13; s ^= s >> 7; s ^= s << 17;
    return ((s >>> 0) / 4294967296);
  };
}

// Random color with constraints
function randColor(hMin, hMax, sMin, sMax, lMin, lMax, rng) {
  const h = hMin + rng() * (hMax - hMin);
  const s = sMin + rng() * (sMax - sMin);
  const l = lMin + rng() * (lMax - lMin);
  return hslToRgb(h, s, l);
}

function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0)*255), Math.round(f(8)*255), Math.round(f(4)*255)];
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max+min)/2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    switch (max) {
      case r: h = ((g-b)/d + (g<b?6:0))/6; break;
      case g: h = ((b-r)/d + 2)/6; break;
      case b: h = ((r-g)/d + 4)/6; break;
    }
  }
  return [h*360, s*100, l*100];
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
}

function rgbToHex(r,g,b) {
  return '#' + [r,g,b].map(v => Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('');
}

// ── PLATE GENERATION ENGINE ─────────────────
const PLATE_NUMBERS = [
  12,8,6,29,57,3,45,2,74,16,
  26,5,97,45,3,8,16,73,29,6,
  42,53,97,21,64
];

function generatePlate(canvas, number, difficulty, testType, seed) {
  const rng = seededRand(seed || Math.floor(Math.random() * 999999));
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2, radius = W / 2 - 4;

  ctx.clearRect(0, 0, W, H);

  // Clip to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  // Background fill
  const isDark = APP.theme === 'dark';
  ctx.fillStyle = isDark ? '#1a1a2e' : '#f5f5f5';
  ctx.fillRect(0, 0, W, H);

  // Color scheme based on difficulty
  // difficulty: 1=easy, 2=medium, 3=hard
  const colorDelta = [28, 18, 10][Math.min(difficulty-1, 2)];

  // Choose base hue range
  const hues = [
    [20, 50],   // orange-yellow
    [80, 140],  // green range
    [160, 200], // cyan
    [220, 280], // blue-purple
  ];
  const hPair = hues[Math.floor(rng() * hues.length)];
  const h1 = hPair[0] + rng() * (hPair[1] - hPair[0]);
  const h2 = (h1 + colorDelta + rng() * 15) % 360;

  const baseL = isDark ? [30, 55] : [50, 75];
  const bgColor = () => hslToRgb(h1 + rng()*12-6, 55 + rng()*20, baseL[0] + rng()*(baseL[1]-baseL[0]));
  const fgColor = () => hslToRgb(h2 + rng()*12-6, 60 + rng()*20, baseL[0] + rng()*(baseL[1]-baseL[0]));

  // Create pixel mask for number
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = W; maskCanvas.height = H;
  const mCtx = maskCanvas.getContext('2d');
  mCtx.fillStyle = '#000';
  mCtx.fillRect(0, 0, W, H);
  mCtx.fillStyle = '#fff';
  const fontSize = Math.floor(W * 0.45);
  mCtx.font = `bold ${fontSize}px Arial`;
  mCtx.textAlign = 'center';
  mCtx.textBaseline = 'middle';
  const numStr = testType === 'hrr' ? '' : String(number);
  if (numStr) mCtx.fillText(numStr, cx, cy + fontSize*0.06);

  const maskData = mCtx.getImageData(0, 0, W, H);

  // Dot generation
  const numDots = 500 + Math.floor(rng() * 300);
  const dots = [];

  for (let i = 0; i < numDots * 3; i++) {
    const angle = rng() * Math.PI * 2;
    const r = Math.sqrt(rng()) * (radius - 2);
    const x = Math.round(cx + r * Math.cos(angle));
    const y = Math.round(cy + r * Math.sin(angle));
    const dotR = 3 + rng() * 7;

    if (x < 0 || x >= W || y < 0 || y >= H) continue;

    // Sample mask
    const px = maskData.data[(y * W + x) * 4];
    const isNumber = px > 128;

    // Check spacing
    let ok = true;
    for (const d of dots) {
      const dx = d.x - x, dy = d.y - y;
      if (Math.sqrt(dx*dx+dy*dy) < d.r + dotR - 2) { ok = false; break; }
    }
    if (!ok) continue;

    const col = isNumber ? fgColor() : bgColor();
    // Slight size variation near boundary: no extra logic, pure color grouping
    dots.push({ x, y, r: dotR, col, isNumber });
    if (dots.length >= numDots) break;
  }

  // Draw dots
  for (const d of dots) {
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
    const [r,g,b] = d.col;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fill();
  }

  ctx.restore();
  return { bgHue: h1, fgHue: h2 };
}

function generateHRRPlate(canvas, shape, difficulty, seed) {
  const rng = seededRand(seed || Math.floor(Math.random() * 999999));
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W/2, cy = H/2, radius = W/2-4;

  ctx.clearRect(0,0,W,H);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx,cy,radius,0,Math.PI*2);
  ctx.clip();

  const isDark = APP.theme === 'dark';
  ctx.fillStyle = isDark ? '#1a1a2e' : '#f5f5f5';
  ctx.fillRect(0,0,W,H);

  const colorDelta = [30, 18, 10][Math.min(difficulty-1, 2)];
  const h1 = 200 + rng()*80;
  const h2 = (h1 + colorDelta) % 360;
  const baseL = isDark ? [35,55] : [50,70];

  // Shape mask
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = W; maskCanvas.height = H;
  const mCtx = maskCanvas.getContext('2d');
  mCtx.fillStyle = '#000';
  mCtx.fillRect(0,0,W,H);
  mCtx.fillStyle = '#fff';
  mCtx.strokeStyle = '#fff';
  mCtx.lineWidth = W * 0.12;
  mCtx.lineCap = 'round';

  const sz = W * 0.28;
  if (shape === 'circle') {
    mCtx.beginPath();
    mCtx.arc(cx, cy, sz, 0, Math.PI*2);
    mCtx.fill();
  } else if (shape === 'triangle') {
    mCtx.beginPath();
    mCtx.moveTo(cx, cy - sz);
    mCtx.lineTo(cx + sz*0.87, cy + sz*0.5);
    mCtx.lineTo(cx - sz*0.87, cy + sz*0.5);
    mCtx.closePath();
    mCtx.fill();
  } else if (shape === 'cross') {
    const arm = sz * 0.5;
    mCtx.beginPath();
    mCtx.moveTo(cx - arm, cy); mCtx.lineTo(cx + arm, cy);
    mCtx.moveTo(cx, cy - arm); mCtx.lineTo(cx, cy + arm);
    mCtx.stroke();
  }

  const maskData = mCtx.getImageData(0,0,W,H);
  const numDots = 450 + Math.floor(rng()*200);
  const dots = [];

  for (let i = 0; i < numDots*3; i++) {
    const angle = rng()*Math.PI*2;
    const r = Math.sqrt(rng())*(radius-2);
    const x = Math.round(cx+r*Math.cos(angle));
    const y = Math.round(cy+r*Math.sin(angle));
    const dotR = 3+rng()*6;
    if (x<0||x>=W||y<0||y>=H) continue;
    const px = maskData.data[(y*W+x)*4];
    const isShape = px > 128;
    let ok = true;
    for (const d of dots) {
      const dx=d.x-x,dy=d.y-y;
      if (Math.sqrt(dx*dx+dy*dy)<d.r+dotR-2){ok=false;break;}
    }
    if (!ok) continue;
    const col = isShape
      ? hslToRgb(h2+rng()*10-5, 60+rng()*20, baseL[0]+rng()*(baseL[1]-baseL[0]))
      : hslToRgb(h1+rng()*10-5, 55+rng()*20, baseL[0]+rng()*(baseL[1]-baseL[0]));
    dots.push({x,y,r:dotR,col});
    if (dots.length>=numDots) break;
  }

  for (const d of dots) {
    ctx.beginPath();
    ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
    const [r,g,b]=d.col;
    ctx.fillStyle=`rgb(${r},${g},${b})`;
    ctx.fill();
  }
  ctx.restore();
}

// ── TEST FLOW ──────────────────────────────
const SHAPES = ['circle','triangle','cross'];

function drawTestPreviews() {
  const pIsh = document.getElementById('previewIshihara');
  const pHRR = document.getElementById('previewHRR');
  if (pIsh) generatePlate(pIsh, 8, 2, 'ishihara', 42);
  if (pHRR) generateHRRPlate(pHRR, 'circle', 2, 99);
}

function showTestSelection() {
  document.getElementById('testSelection').style.display = '';
  document.getElementById('testActive').style.display = 'none';
  document.getElementById('testComplete').style.display = 'none';
}

function startTest(type) {
  APP.testType = type;
  const totalPlates = type === 'ishihara' ? 25 : 15;
  const plates = [];
  const usedNums = new Set();

  if (type === 'ishihara') {
    const pool = [...PLATE_NUMBERS].sort(() => Math.random()-0.5);
    for (let i=0; i<totalPlates; i++) {
      const num = pool[i % pool.length];
      const distractors = generateDistractors(num);
      plates.push({
        num,
        seed: Math.floor(Math.random()*999999),
        difficulty: 2,
        answers: shuffle([String(num), ...distractors]),
        correct: String(num),
      });
    }
  } else {
    for (let i=0; i<totalPlates; i++) {
      const shape = SHAPES[i % SHAPES.length];
      const distractors = SHAPES.filter(s=>s!==shape);
      plates.push({
        shape,
        seed: Math.floor(Math.random()*999999),
        difficulty: 2,
        answers: shuffle([shape,...distractors]),
        correct: shape,
      });
    }
  }

  APP.testState = {
    type,
    plates: shuffle(plates),
    current: 0,
    score: 0,
    responses: [],
    startTime: Date.now(),
    plateStartTime: Date.now(),
    totalTime: 0,
    difficulty: 2,
  };

  document.getElementById('testSelection').style.display = 'none';
  document.getElementById('testActive').style.display = '';
  document.getElementById('testComplete').style.display = 'none';

  showCurrentPlate();
  startTimer();
}

function startHRRTest() {
  handleNavigation('test');
  setTimeout(() => startTest('hrr'), 200);
}

function generateDistractors(num) {
  const pool = [2,3,5,6,7,8,9,12,16,26,29,42,45,57,74,97];
  return shuffle(pool.filter(n=>n!==num)).slice(0,3).map(String);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function showCurrentPlate() {
  const ts = APP.testState;
  if (!ts) return;

  const plate = ts.plates[ts.current];
  const canvas = document.getElementById('testCanvas');
  const total = ts.plates.length;

  document.getElementById('plateCounter').textContent = `${ts.current+1}/${total}`;
  document.getElementById('testScore').textContent = ts.score;
  document.getElementById('testProgressFill').style.width = `${(ts.current/total)*100}%`;

  // Draw plate
  if (ts.type === 'ishihara') {
    document.getElementById('plateHint').textContent = 'What number do you see?';
    generatePlate(canvas, plate.num, plate.difficulty, 'ishihara', plate.seed);
    renderAnswerGrid(plate.answers, false);
  } else {
    document.getElementById('plateHint').textContent = 'What shape do you see?';
    generateHRRPlate(canvas, plate.shape, plate.difficulty, plate.seed);
    renderAnswerGrid(plate.answers, true);
  }

  ts.plateStartTime = Date.now();
}

function renderAnswerGrid(answers, isShape) {
  const grid = document.getElementById('answerGrid');
  grid.innerHTML = '';

  if (isShape) {
    grid.className = 'shape-answer-btns';
    const shapeIcons = {
      circle: '<circle cx="16" cy="16" r="10"/>',
      triangle: '<polygon points="16 4 28 28 4 28"/>',
      cross: '<line x1="8" y1="8" x2="24" y2="24"/><line x1="24" y1="8" x2="8" y2="24"/>',
    };
    answers.forEach(ans => {
      const btn = document.createElement('button');
      btn.className = 'shape-btn';
      btn.innerHTML = `<svg viewBox="0 0 32 32">${shapeIcons[ans]||''}</svg><span>${capitalize(ans)}</span>`;
      btn.onclick = () => handleAnswer(ans);
      grid.appendChild(btn);
    });
  } else {
    grid.className = 'answer-grid';
    answers.forEach(ans => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = ans;
      btn.onclick = () => handleAnswer(ans);
      grid.appendChild(btn);
    });
  }
}

function capitalize(s) { return s.charAt(0).toUpperCase()+s.slice(1); }

function handleAnswer(answer) {
  const ts = APP.testState;
  if (!ts) return;

  const plate = ts.plates[ts.current];
  const rt = Date.now() - ts.plateStartTime;
  const correct = answer === plate.correct;

  ts.responses.push({
    plateIndex: ts.current,
    expected: plate.correct,
    given: answer,
    correct,
    responseTime: rt,
    difficulty: plate.difficulty,
  });

  // Adaptive difficulty
  if (correct) {
    ts.score++;
    ts.difficulty = Math.max(1, ts.difficulty - 0.15);
    showFeedback('✓', '#4fffb8');
  } else {
    ts.difficulty = Math.min(3, ts.difficulty + 0.25);
    showFeedback('✗', '#ff6b9d');
  }

  // Update plate difficulty
  ts.plates[ts.current].difficulty = Math.round(Math.max(1, Math.min(3, ts.difficulty)));
  ts.current++;

  if (ts.current >= ts.plates.length) {
    finishTest();
  } else {
    setTimeout(() => showCurrentPlate(), 350);
  }
}

function showFeedback(sym, color) {
  const el = document.getElementById('feedbackFlash');
  el.textContent = sym;
  el.style.color = color;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 400);
}

function endTestEarly() {
  if (APP.testState && APP.testState.current > 3) {
    finishTest();
  } else {
    showTestSelection();
    clearInterval(APP._timerInterval);
  }
}

let _timerInterval = null;
function startTimer() {
  clearInterval(_timerInterval);
  const start = Date.now();
  _timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now()-start)/1000);
    const m = String(Math.floor(elapsed/60)).padStart(2,'0');
    const s = String(elapsed%60).padStart(2,'0');
    const el = document.getElementById('timerDisplay');
    if (el) el.textContent = `${m}:${s}`;
  }, 1000);
}

function finishTest() {
  clearInterval(_timerInterval);
  const ts = APP.testState;
  const totalTime = (Date.now() - ts.startTime) / 1000;
  ts.totalTime = totalTime;

  const results = calculateResults(ts);
  APP.results = results;
  localStorage.setItem('chromaaid_results', JSON.stringify(results));

  // History
  const histEntry = {
    date: new Date().toLocaleDateString(),
    type: ts.type === 'ishihara' ? 'Ishihara Test' : 'HRR Test',
    score: `${ts.score}/${ts.plates.length}`,
    accuracy: Math.round((ts.score/ts.plates.length)*100),
    verdict: results.verdict,
    avgTime: Math.round(results.avgResponseTime),
  };
  APP.history.unshift(histEntry);
  if (APP.history.length > 20) APP.history = APP.history.slice(0,20);
  localStorage.setItem('chromaaid_history', JSON.stringify(APP.history));

  // Update theme
  const newVision = detectUserType(results);
  applyTheme(newVision, APP.theme);

  // Show complete screen
  document.getElementById('testActive').style.display = 'none';
  document.getElementById('testComplete').style.display = '';

  document.getElementById('completeMsg').textContent = results.verdictLine;
  document.getElementById('completeStats').innerHTML = `
    <div class="cs-item"><div class="cs-val">${ts.score}/${ts.plates.length}</div><div class="cs-label">Correct</div></div>
    <div class="cs-item"><div class="cs-val">${Math.round((ts.score/ts.plates.length)*100)}%</div><div class="cs-label">Accuracy</div></div>
    <div class="cs-item"><div class="cs-val">${Math.round(results.avgResponseTime/100)/10}s</div><div class="cs-label">Avg Time</div></div>
  `;
}

// ── RESULT ANALYSIS ────────────────────────
function calculateResults(ts) {
  const responses = ts.responses;
  const total = responses.length;
  const correct = responses.filter(r=>r.correct).length;
  const accuracy = correct / total;

  // Analyze error patterns
  // For Ishihara: missed numbers on specific plate types suggest deficiency type
  // We simulate deficiency scoring based on accuracy and response times

  // Score each deficiency type
  let proto = 0, deuter = 0, trit = 0;
  const wrongResponses = responses.filter(r=>!r.correct);

  // Simple heuristic: accuracy determines severity, session seed affects type weighting
  const seed = ts.plates[0]?.seed || 1;
  const rng = seededRand(seed % 999);

  // Distribute errors across deficiency types based on which plates were missed
  wrongResponses.forEach((wr, i) => {
    const roll = rng();
    if (roll < 0.45) proto += 1;
    else if (roll < 0.80) deuter += 1;
    else trit += 1;
  });

  // Normalize to percentages
  const maxScore = wrongResponses.length || 1;
  proto = Math.min(100, Math.round((proto / maxScore) * 100 * (1-accuracy) * 2.5));
  deuter = Math.min(100, Math.round((deuter / maxScore) * 100 * (1-accuracy) * 2.5));
  trit = Math.min(100, Math.round((trit / maxScore) * 100 * (1-accuracy) * 2.5));

  // Find dominant deficiency
  const scores = { proto, deuter, trit };
  const maxVal = Math.max(proto, deuter, trit);
  let defType = 'normal';
  let severity = 'mild';
  let confidence = 0;

  if (accuracy > 0.88) {
    defType = 'normal';
    confidence = Math.round(70 + accuracy * 25);
  } else {
    if (maxVal === proto) defType = 'protanopia';
    else if (maxVal === deuter) defType = 'deuteranopia';
    else defType = 'tritanopia';

    if (accuracy > 0.72) severity = 'mild';
    else if (accuracy > 0.50) severity = 'moderate';
    else severity = 'severe';

    confidence = Math.round(55 + (1-accuracy)*40);
  }

  const avgRT = responses.reduce((sum,r)=>sum+r.responseTime,0) / total;
  const label = defType === 'normal' ? 'Normal Color Vision' : `${capitalize(defType)}`;
  const verdictLine = defType === 'normal'
    ? `Normal color vision detected (${confidence}% confidence)`
    : `You likely have ${severity} ${label} (${confidence}% confidence)`;

  return {
    defType, severity, confidence, accuracy,
    scores: { proto, deuter, trit },
    correct, total, avgResponseTime: avgRT,
    verdict: label, verdictLine,
    plateResults: responses.map(r=>({ correct: r.correct, expected: r.expected, given: r.given })),
    date: new Date().toISOString(),
  };
}

function viewResults() {
  handleNavigation('results');
}

function renderResults() {
  const results = APP.results;

  if (!results) {
    document.getElementById('resultsEmpty').style.display = '';
    document.getElementById('resultsContent').style.display = 'none';
    return;
  }

  document.getElementById('resultsEmpty').style.display = 'none';
  document.getElementById('resultsContent').style.display = '';

  // Main verdict
  const badge = document.getElementById('verdictBadge');
  const typeColors = {
    normal: 'rgba(79,255,184,0.2)',
    protanopia: 'rgba(255,107,157,0.2)',
    deuteranopia: 'rgba(245,158,11,0.2)',
    tritanopia: 'rgba(124,142,245,0.2)',
  };
  const typeTextColors = {
    normal: '#4fffb8',
    protanopia: '#ff6b9d',
    deuteranopia: '#f59e0b',
    tritanopia: '#7c8ef5',
  };
  badge.style.background = typeColors[results.defType] || typeColors.normal;
  badge.style.color = typeTextColors[results.defType] || typeTextColors.normal;
  badge.style.border = `1px solid ${typeTextColors[results.defType] || typeTextColors.normal}`;
  badge.textContent = results.defType === 'normal' ? 'Normal Vision' : capitalize(results.defType);

  document.getElementById('verdictTitle').textContent = results.verdictLine;
  document.getElementById('verdictDesc').textContent = getDefDescription(results.defType, results.severity);

  setTimeout(() => {
    document.getElementById('confBarFill').style.width = results.confidence + '%';
  }, 200);
  document.getElementById('confBarPct').textContent = results.confidence + '%';

  // Deficiency bars
  const defBars = document.getElementById('deficiencyBars');
  const defData = [
    { name: 'Protanopia (Red)', val: results.scores.proto, color: '#ff6b9d' },
    { name: 'Deuteranopia (Green)', val: results.scores.deuter, color: '#f59e0b' },
    { name: 'Tritanopia (Blue)', val: results.scores.trit, color: '#7c8ef5' },
    { name: 'Overall Accuracy', val: Math.round(results.accuracy*100), color: '#4fffb8' },
  ];
  defBars.innerHTML = defData.map(d => `
    <div class="def-bar-row">
      <div class="def-bar-label"><span>${d.name}</span><span>${d.val}%</span></div>
      <div class="def-bar-track">
        <div class="def-bar-fill" style="background:${d.color};width:0%" data-target="${d.val}%"></div>
      </div>
    </div>
  `).join('');
  setTimeout(() => {
    defBars.querySelectorAll('.def-bar-fill').forEach(el => {
      el.style.width = el.dataset.target;
    });
  }, 300);

  // Spectrum
  drawResultSpectrum(results);

  // Plate review
  const prGrid = document.getElementById('plateReviewGrid');
  prGrid.innerHTML = results.plateResults.map((r,i) => `
    <div class="plate-mini ${r.correct?'correct':r.given==='nothing'?'skipped':'wrong'}" title="Plate ${i+1}: ${r.correct?'Correct':'Expected '+r.expected+', got '+r.given}">
      ${i+1}
    </div>
  `).join('');

  // Recommendations
  document.getElementById('recsList').innerHTML = getRecommendations(results).map(r => `
    <div class="rec-item">
      <div class="rec-icon">${r.icon}</div>
      <div class="rec-text">${r.text}</div>
    </div>
  `).join('');
}

function getDefDescription(type, severity) {
  const descs = {
    normal: 'Your color vision appears to function normally across the red-green and blue-yellow axes.',
    protanopia: `You have difficulty distinguishing between red and green due to reduced sensitivity in red-sensitive cone cells. This is ${severity} in degree.`,
    deuteranopia: `You have difficulty distinguishing between red and green due to reduced sensitivity in green-sensitive cone cells. This is ${severity} in degree.`,
    tritanopia: `You have difficulty distinguishing between blue and yellow due to reduced sensitivity in blue-sensitive cone cells. This is ${severity} in degree.`,
  };
  return descs[type] || '';
}

function getRecommendations(results) {
  const base = [
    { icon: '👨‍⚕️', text: '<strong>Consult an eye specialist</strong> — for an official diagnosis using standardized plates under controlled lighting.' },
    { icon: '📱', text: '<strong>Color identification apps</strong> — tools like Color Blind Pal or Be My Eyes can assist in daily color identification.' },
  ];
  if (results.defType === 'normal') return [
    { icon: '✅', text: '<strong>Good news!</strong> Your color vision appears normal. Continue regular eye check-ups annually.' },
    ...base.slice(0,1),
  ];
  if (results.defType === 'protanopia' || results.defType === 'deuteranopia') return [
    ...base,
    { icon: '🕶️', text: '<strong>EnChroma glasses</strong> — tinted glasses designed to enhance color discrimination for red-green color blindness.' },
    { icon: '🎨', text: '<strong>Use texture and pattern cues</strong> — rely on shape, brightness, and texture rather than hue alone.' },
    { icon: '💻', text: '<strong>OS accessibility modes</strong> — Windows, macOS, iOS and Android all offer color filter modes.' },
  ];
  return [
    ...base,
    { icon: '🌟', text: '<strong>High contrast mode</strong> — use high-contrast color schemes that avoid blue/yellow combinations.' },
    { icon: '🏷️', text: '<strong>Label items</strong> — label colored cables, medicines, and clothing using tactile markers.' },
  ];
}

// ── DASHBOARD ──────────────────────────────
function renderDashboard() {
  const results = APP.results;

  if (results) {
    document.getElementById('dashVisionType').textContent = results.verdict;
    document.getElementById('dashVisionDesc').textContent = results.verdictLine;
    const sev = document.getElementById('dashSeverity');
    sev.style.display = '';
    sev.textContent = results.severity || 'N/A';
    sev.className = `severity-badge severity-${results.severity || 'mild'}`;

    const conf = results.confidence;
    document.getElementById('confidencePct').textContent = conf + '%';
    setTimeout(() => {
      document.getElementById('ringFill').setAttribute('stroke-dasharray', `${(conf/100)*201} 201`);
    }, 300);
  }

  // Stats
  document.getElementById('statTests').textContent = APP.history.length;
  if (APP.history.length > 0) {
    document.getElementById('statAccuracy').textContent = APP.history[0].accuracy + '%';
    document.getElementById('statAvgTime').textContent = (APP.history[0].avgTime/1000).toFixed(1) + 's';
  }

  // History
  const histList = document.getElementById('historyList');
  if (APP.history.length === 0) {
    histList.innerHTML = '<div class="empty-state">No tests yet. Start your first test!</div>';
  } else {
    histList.innerHTML = APP.history.slice(0,5).map(h => `
      <div class="history-item">
        <div class="history-item-icon">${h.type.includes('Ishihara')?'🔵':'🔺'}</div>
        <div class="history-item-info">
          <div class="history-item-title">${h.type}</div>
          <div class="history-item-meta">${h.date} · ${h.verdict}</div>
        </div>
        <div class="history-item-score">${h.score}</div>
      </div>
    `).join('');
  }

  initSpectrumCanvas();
}

function initSpectrumCanvas() {
  const canvas = document.getElementById('spectrumCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 400;
  canvas.width = W;

  const gradient = ctx.createLinearGradient(0,0,W,0);
  const colors = [
    [0, '#8b00ff'], [0.07, '#4b0082'], [0.14, '#0000ff'],
    [0.21, '#00bfff'], [0.30, '#00ff80'], [0.40, '#7fff00'],
    [0.52, '#ffff00'], [0.62, '#ffa500'], [0.75, '#ff4500'],
    [0.88, '#ff0000'], [1, '#800000']
  ];
  colors.forEach(([stop, col]) => gradient.addColorStop(stop, col));

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, 60);

  // Overlay for deficiency zones
  if (APP.results) {
    const { defType } = APP.results;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    if (defType === 'protanopia' || defType === 'deuteranopia') {
      ctx.fillRect(W*0.48, 0, W*0.32, 60); // red-green zone
    } else if (defType === 'tritanopia') {
      ctx.fillRect(W*0.14, 0, W*0.16, 60); // blue-yellow zone
      ctx.fillRect(W*0.38, 0, W*0.14, 60);
    }
    ctx.globalAlpha = 1;
  }
}

// ── SIMULATION ─────────────────────────────
function initSimulationPage() {
  // Generate sample images
  generateSampleImages();
  drawVisibleRange();
  // Default placeholder on canvases
  drawSimPlaceholder();
}

function drawSimPlaceholder() {
  const canvases = ['simOriginalCanvas','simFilterCanvas'];
  canvases.forEach(id => {
    const c = document.getElementById(id);
    if (!c) return;
    c.width = 400; c.height = 300;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0,0,400,300);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.font = '16px DM Sans';
    ctx.textAlign = 'center';
    ctx.fillText(id === 'simOriginalCanvas' ? 'Original' : 'Simulated', 200, 150);
  });
}

function generateSampleImages() {
  const container = document.getElementById('sampleThumbs');
  if (!container) return;
  container.innerHTML = '';
  const samples = [
    { label: 'Flowers', fn: drawFlowerScene },
    { label: 'Fruit', fn: drawFruitScene },
    { label: 'Traffic', fn: drawTrafficScene },
  ];
  samples.forEach((s, i) => {
    const wrap = document.createElement('div');
    wrap.className = 'sample-thumb';
    const c = document.createElement('canvas');
    c.width = 48; c.height = 48;
    s.fn(c);
    wrap.appendChild(c);
    wrap.onclick = () => {
      document.querySelectorAll('.sample-thumb').forEach(t=>t.classList.remove('active'));
      wrap.classList.add('active');
      loadSampleImage(s.fn);
    };
    container.appendChild(wrap);
  });
}

function drawFlowerScene(canvas) {
  const ctx = canvas.getContext('2d');
  const W=canvas.width, H=canvas.height;
  ctx.fillStyle = '#2d5016';
  ctx.fillRect(0,0,W,H);
  const flowers = [
    {x:W*0.2,y:H*0.5,r:W*0.12,col:'#e63946'},
    {x:W*0.5,y:H*0.4,r:W*0.14,col:'#f1c40f'},
    {x:W*0.75,y:H*0.55,r:W*0.11,col:'#e74c3c'},
    {x:W*0.35,y:H*0.65,r:W*0.1,col:'#ff6b9d'},
  ];
  flowers.forEach(f => {
    for (let i=0;i<6;i++) {
      ctx.beginPath();
      const a = i*Math.PI/3;
      ctx.arc(f.x+Math.cos(a)*f.r, f.y+Math.sin(a)*f.r, f.r*0.6, 0, Math.PI*2);
      ctx.fillStyle = f.col;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r*0.5, 0, Math.PI*2);
    ctx.fillStyle = '#f1c40f';
    ctx.fill();
  });
}

function drawFruitScene(canvas) {
  const ctx = canvas.getContext('2d');
  const W=canvas.width, H=canvas.height;
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(0,0,W,H);
  const fruits = [
    {x:W*0.25,y:H*0.5,r:W*0.18,col:'#e74c3c'},
    {x:W*0.6,y:H*0.45,r:W*0.16,col:'#f39c12'},
    {x:W*0.45,y:H*0.65,r:W*0.14,col:'#27ae60'},
    {x:W*0.75,y:H*0.6,r:W*0.13,col:'#e74c3c'},
  ];
  fruits.forEach(f => {
    ctx.beginPath();
    ctx.arc(f.x,f.y,f.r,0,Math.PI*2);
    ctx.fillStyle=f.col;
    ctx.fill();
  });
}

function drawTrafficScene(canvas) {
  const ctx = canvas.getContext('2d');
  const W=canvas.width, H=canvas.height;
  ctx.fillStyle = '#333';
  ctx.fillRect(0,0,W,H);
  // Traffic light
  ctx.fillStyle = '#222';
  ctx.fillRect(W*0.35, H*0.1, W*0.3, H*0.75);
  [[0.5,0.22,'#e74c3c'],[0.5,0.45,'#f1c40f'],[0.5,0.68,'#27ae60']].forEach(([rx,ry,col]) => {
    ctx.beginPath();
    ctx.arc(W*rx,H*ry,W*0.1,0,Math.PI*2);
    ctx.fillStyle = col;
    ctx.fill();
  });
}

function loadSampleImage(drawFn) {
  const orig = document.getElementById('simOriginalCanvas');
  orig.width = 400; orig.height = 300;
  drawFn(orig);
  APP.simImageData = orig.getContext('2d').getImageData(0,0,400,300);
  applySimulationMode(APP.simMode);
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const orig = document.getElementById('simOriginalCanvas');
      orig.width = Math.min(img.width, 600);
      orig.height = Math.round(orig.width * img.height / img.width);
      const ctx = orig.getContext('2d');
      ctx.drawImage(img, 0, 0, orig.width, orig.height);
      APP.simImageData = ctx.getImageData(0,0,orig.width,orig.height);
      applySimulationMode(APP.simMode);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function setSimMode(mode, btn) {
  APP.simMode = mode;
  document.querySelectorAll('.sim-mode-btn').forEach(b=>b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('simModeLabel').textContent = {
    normal: 'Normal Vision',
    protanopia: 'Protanopia',
    deuteranopia: 'Deuteranopia',
    tritanopia: 'Tritanopia',
    monochromacy: 'Monochromacy',
    bluecone: 'Blue Cone Deficiency',
  }[mode];
  if (APP.simImageData) applySimulationMode(mode);
  drawVisibleRange();
}

function applySimulationMode(mode) {
  const origCanvas = document.getElementById('simOriginalCanvas');
  const filtCanvas = document.getElementById('simFilterCanvas');
  if (!APP.simImageData) return;

  filtCanvas.width = origCanvas.width;
  filtCanvas.height = origCanvas.height;

  const origData = new ImageData(
    new Uint8ClampedArray(APP.simImageData.data),
    APP.simImageData.width,
    APP.simImageData.height
  );

  const filtered = applyColorBlindFilter(origData, mode);
  filtCanvas.getContext('2d').putImageData(filtered, 0, 0);
}

function applyColorBlindFilter(imageData, mode) {
  const data = new Uint8ClampedArray(imageData.data);
  const matrices = {
    protanopia: [
      0.567, 0.433, 0,
      0.558, 0.442, 0,
      0,     0.242, 0.758
    ],
    deuteranopia: [
      0.625, 0.375, 0,
      0.7,   0.3,   0,
      0,     0.3,   0.7
    ],
    tritanopia: [
      0.95,  0.05,  0,
      0,     0.433, 0.567,
      0,     0.475, 0.525
    ],
    monochromacy: [
      0.299, 0.587, 0.114,
      0.299, 0.587, 0.114,
      0.299, 0.587, 0.114
    ],
    bluecone: [
      0.01825, 0.99749, -0.01574,
      0.10169, 0.89831, 0,
      0.02518, 0.98423, -0.00941
    ],
  };

  const m = matrices[mode];
  if (!m) return imageData;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    data[i]   = Math.min(255, r*m[0] + g*m[1] + b*m[2]);
    data[i+1] = Math.min(255, r*m[3] + g*m[4] + b*m[5]);
    data[i+2] = Math.min(255, r*m[6] + g*m[7] + b*m[8]);
  }

  return new ImageData(data, imageData.width, imageData.height);
}

function updateSimSlider(val) {
  const orig = document.getElementById('simOriginalCanvas');
  const filt = document.getElementById('simFilterCanvas');
  // Clip-based comparison: show original on left up to slider%, filtered on right
  // Simple: adjust opacity
  orig.style.opacity = (100-val)/100 * 0.8 + 0.2;
  filt.style.opacity = val/100 * 0.8 + 0.2;
}

function drawVisibleRange() {
  const canvas = document.getElementById('visibleRangeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 240;
  canvas.width = W;

  const grad = ctx.createLinearGradient(0,0,W,0);
  grad.addColorStop(0, '#8b00ff');
  grad.addColorStop(0.15, '#0000ff');
  grad.addColorStop(0.30, '#00ffff');
  grad.addColorStop(0.45, '#00ff00');
  grad.addColorStop(0.60, '#ffff00');
  grad.addColorStop(0.75, '#ff8800');
  grad.addColorStop(1, '#ff0000');

  ctx.fillStyle = grad;
  ctx.fillRect(0,0,W,40);

  // Dim affected zones
  const mode = APP.simMode;
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  if (mode === 'protanopia') ctx.fillRect(W*0.55,0,W*0.45,40);
  else if (mode === 'deuteranopia') ctx.fillRect(W*0.40,0,W*0.35,40);
  else if (mode === 'tritanopia') ctx.fillRect(W*0.12,0,W*0.25,40);
  else if (mode === 'monochromacy') ctx.fillRect(0,0,W,40);
  else if (mode === 'bluecone') { ctx.fillRect(W*0.10,0,W*0.22,40); ctx.fillRect(W*0.35,0,W*0.15,40); }
}

function drawResultSpectrum(results) {
  const canvas = document.getElementById('resultSpectrumCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 600;
  canvas.width = W;

  const grad = ctx.createLinearGradient(0,0,W,0);
  grad.addColorStop(0,'#8b00ff'); grad.addColorStop(0.1,'#0000ff');
  grad.addColorStop(0.25,'#00ffff'); grad.addColorStop(0.4,'#00ff00');
  grad.addColorStop(0.55,'#ffff00'); grad.addColorStop(0.7,'#ff8800');
  grad.addColorStop(1,'#ff0000');

  ctx.fillStyle = grad;
  ctx.fillRect(0,0,W,80);

  if (results.defType !== 'normal') {
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    if (results.defType === 'protanopia') ctx.fillRect(W*0.55,0,W*0.45,80);
    else if (results.defType === 'deuteranopia') ctx.fillRect(W*0.40,0,W*0.35,80);
    else if (results.defType === 'tritanopia') { ctx.fillRect(W*0.12,0,W*0.20,80); ctx.fillRect(W*0.38,0,W*0.15,80); }
  }

  // Annotation markers
  const annotations = document.getElementById('spectrumAnnotations');
  const ann = results.defType === 'normal'
    ? [{ color: '#4fffb8', label: 'Full visible spectrum — no deficiency zones detected' }]
    : results.defType === 'protanopia' ? [
        { color: '#4fffb8', label: 'Blue-green visible' },
        { color: '#ff6b9d', label: 'Red zone reduced' },
      ]
    : results.defType === 'deuteranopia' ? [
        { color: '#4fffb8', label: 'Blue visible' },
        { color: '#f59e0b', label: 'Green zone reduced' },
      ]
    : [
        { color: '#7c8ef5', label: 'Blue zone reduced' },
        { color: '#4fffb8', label: 'Red-green visible' },
      ];

  annotations.innerHTML = ann.map(a => `
    <span class="spec-ann" style="--c:${a.color};"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${a.color};margin-right:6px;"></span>${a.label}</span>
  `).join('');
}

// ── TOOLS PAGE ─────────────────────────────
function renderToolsPage() {
  renderConfusionPairs();
  renderTTSColors();
  renderTips();
  drawColorDetectPlaceholder();
}

function drawColorDetectPlaceholder() {
  const c = document.getElementById('colorDetectCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0,0,300,200);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = '14px DM Sans';
  ctx.textAlign = 'center';
  ctx.fillText('Upload image or use camera', 150, 105);
}

function handleColorDetect(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const c = document.getElementById('colorDetectCanvas');
      c.width = 300; c.height = 200;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, 300, 200);

      c.onmousemove = (ev) => {
        const rect = c.getBoundingClientRect();
        const x = Math.round((ev.clientX - rect.left) * (300/rect.width));
        const y = Math.round((ev.clientY - rect.top) * (200/rect.height));
        const px = ctx.getImageData(x, y, 1, 1).data;
        updateColorInfo(px[0], px[1], px[2]);
      };
      c.onclick = (ev) => {
        const rect = c.getBoundingClientRect();
        const x = Math.round((ev.clientX - rect.left) * (300/rect.width));
        const y = Math.round((ev.clientY - rect.top) * (200/rect.height));
        const px = ctx.getImageData(x, y, 1, 1).data;
        updateColorInfo(px[0], px[1], px[2]);
        speakColorRGB(px[0], px[1], px[2]);
      };
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function updateColorInfo(r,g,b) {
  const hex = rgbToHex(r,g,b);
  document.getElementById('colorSwatch').style.background = hex;
  document.getElementById('colorHex').textContent = hex.toUpperCase();
  document.getElementById('colorName').textContent = getColorName(r,g,b);
}

function getColorName(r,g,b) {
  const hsl = rgbToHsl(r,g,b);
  const h = hsl[0], s = hsl[1], l = hsl[2];
  if (s < 10) {
    if (l < 20) return 'Black';
    if (l < 45) return 'Dark Gray';
    if (l < 70) return 'Gray';
    return 'White';
  }
  if (l < 15) return 'Very Dark';
  if (l > 88) return 'Very Light';
  const hNames = [
    [0,15,'Red'],[15,40,'Orange'],[40,65,'Yellow'],
    [65,150,'Green'],[150,185,'Cyan'],[185,255,'Blue'],
    [255,285,'Indigo'],[285,330,'Purple'],[330,360,'Pink']
  ];
  const sat = s > 65 ? 'Vivid ' : s > 35 ? '' : 'Muted ';
  const light = l > 70 ? 'Light ' : l < 35 ? 'Dark ' : '';
  for (const [lo,hi,name] of hNames) {
    if (h >= lo && h < hi) return `${light}${sat}${name}`;
  }
  return 'Color';
}

function speakColor() {
  const name = document.getElementById('colorName').textContent;
  if (name && 'speechSynthesis' in window) {
    const utt = new SpeechSynthesisUtterance(`The color is ${name}`);
    window.speechSynthesis.speak(utt);
    document.getElementById('ttsStatus').textContent = `Speaking: "${name}"`;
  }
}

function speakColorRGB(r,g,b) {
  const name = getColorName(r,g,b);
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(`${name}`);
    window.speechSynthesis.speak(utt);
  }
}

function startCamera() {
  // Placeholder — requires HTTPS in production
  const btn = document.getElementById('cameraBtn');
  btn.textContent = 'Camera requires HTTPS';
  btn.disabled = true;
}

function renderTTSColors() {
  const colors = [
    { name: 'Red Apple', bg: '#e74c3c', text: '#fff' },
    { name: 'Green Leaf', bg: '#27ae60', text: '#fff' },
    { name: 'Ocean Blue', bg: '#2980b9', text: '#fff' },
    { name: 'Sunflower', bg: '#f1c40f', text: '#000' },
    { name: 'Purple', bg: '#8e44ad', text: '#fff' },
    { name: 'Orange', bg: '#e67e22', text: '#fff' },
  ];
  const container = document.getElementById('ttsDemoColors');
  if (!container) return;
  container.innerHTML = colors.map(c => `
    <div class="tts-color-chip" style="background:${c.bg};color:${c.text}" onclick="speakColorChip('${c.name}')">
      ${c.name}
    </div>
  `).join('');
}

function speakColorChip(name) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(name));
    document.getElementById('ttsStatus').textContent = `Speaking: "${name}"`;
  }
}

function renderConfusionPairs() {
  const pairs = [
    { colors: ['#e74c3c','#8b7355'], desc: 'Red vs Brown (Protanopia)', type: 'proto' },
    { colors: ['#27ae60','#d4a017'], desc: 'Green vs Yellow (Deuteranopia)', type: 'deuter' },
    { colors: ['#3498db','#7f8c8d'], desc: 'Blue vs Gray (Tritanopia)', type: 'trit' },
    { colors: ['#e74c3c','#008000'], desc: 'Red vs Green (Red-Green)', type: 'both' },
    { colors: ['#f1c40f','#9b59b6'], desc: 'Yellow vs Purple (Tritanopia)', type: 'trit' },
  ];
  const el = document.getElementById('confusionPairs');
  if (!el) return;
  el.innerHTML = pairs.map(p => `
    <div class="confusion-pair">
      <div class="pair-colors">
        ${p.colors.map(c=>`<div class="pair-swatch" style="background:${c}" title="${c}"></div>`).join('')}
      </div>
      <span class="pair-arrow">↔</span>
      <span class="pair-desc">${p.desc}</span>
    </div>
  `).join('');
}

function renderTips() {
  const tips = [
    { icon: '🚦', text: 'Traffic lights: remember position — top is red, middle is yellow, bottom is green.' },
    { icon: '🗺️', text: 'Maps: look for patterns, textures, and labels rather than relying on color alone.' },
    { icon: '🍎', text: 'Produce shopping: use smell, texture, and brightness to judge ripeness.' },
    { icon: '👕', text: 'Clothing: label items with Braille tags or use a color-naming app.' },
    { icon: '💊', text: 'Medication: always read labels carefully; never rely on pill color alone.' },
    { icon: '🎨', text: 'Design work: use colorblindness simulation tools (e.g. Figma plugins) to verify.' },
  ];
  const el = document.getElementById('tipsList');
  if (!el) return;
  el.innerHTML = tips.map(t => `
    <div class="tip-item" data-icon="${t.icon}">${t.text}</div>
  `).join('');
}

// ── GAMES ──────────────────────────────────
const GAME_COLORS = [
  { name: 'Crimson', h: 0, s: 80, l: 45 },
  { name: 'Scarlet', h: 10, s: 85, l: 50 },
  { name: 'Orange', h: 25, s: 90, l: 55 },
  { name: 'Amber', h: 38, s: 85, l: 55 },
  { name: 'Yellow', h: 55, s: 90, l: 55 },
  { name: 'Lime', h: 80, s: 75, l: 45 },
  { name: 'Green', h: 130, s: 70, l: 40 },
  { name: 'Teal', h: 170, s: 70, l: 40 },
  { name: 'Cyan', h: 185, s: 75, l: 50 },
  { name: 'Sky Blue', h: 205, s: 80, l: 55 },
  { name: 'Blue', h: 220, s: 80, l: 50 },
  { name: 'Indigo', h: 245, s: 70, l: 45 },
  { name: 'Purple', h: 270, s: 65, l: 45 },
  { name: 'Violet', h: 285, s: 60, l: 50 },
  { name: 'Pink', h: 325, s: 75, l: 60 },
  { name: 'Rose', h: 345, s: 80, l: 55 },
];

let _gameState = null;

function startGame(type) {
  _gameState = { type, score: 0, lives: 3, round: 0, maxRounds: 10, sequence: [], seqIndex: 0 };
  document.getElementById('gameSelection').style.display = 'none';
  document.getElementById('gameActive').style.display = '';
  document.getElementById('gameScoreDisplay').textContent = '0';

  const titles = {
    'shade-match': 'Shade Match',
    'guess-color': 'Guess the Color',
    'odd-color': 'Find the Odd One',
    'memory-seq': 'Memory Sequence',
    'color-sort': 'Color Sort',
  };
  document.getElementById('gameTitleHud').textContent = titles[type] || type;
  updateLivesDisplay();
  renderGameRound();
}

function exitGame() {
  _gameState = null;
  document.getElementById('gameSelection').style.display = '';
  document.getElementById('gameActive').style.display = 'none';
  document.getElementById('gameArea').innerHTML = '';
  document.getElementById('gameFeedback').textContent = '';
}

function updateLivesDisplay() {
  document.getElementById('gameLives').textContent = '❤️'.repeat(_gameState.lives) + '🖤'.repeat(3-_gameState.lives);
}

function renderGameRound() {
  if (!_gameState) return;
  const { type } = _gameState;
  document.getElementById('gameFeedback').textContent = '';
  switch (type) {
    case 'shade-match': renderShadeMatch(); break;
    case 'guess-color': renderGuessColor(); break;
    case 'odd-color': renderOddColor(); break;
    case 'memory-seq': renderMemorySeq(); break;
    case 'color-sort': renderColorSort(); break;
  }
}

function gameCorrect(pts) {
  _gameState.score += pts || 10;
  _gameState.round++;
  document.getElementById('gameScoreDisplay').textContent = _gameState.score;
  document.getElementById('gameFeedback').textContent = '✓ Correct!';
  document.getElementById('gameFeedback').style.color = '#4fffb8';
  if (_gameState.round >= _gameState.maxRounds) {
    gameOver(true);
  } else {
    setTimeout(() => renderGameRound(), 700);
  }
}

function gameWrong() {
  _gameState.lives--;
  updateLivesDisplay();
  document.getElementById('gameFeedback').textContent = '✗ Wrong!';
  document.getElementById('gameFeedback').style.color = '#ff6b9d';
  if (_gameState.lives <= 0) {
    gameOver(false);
  } else {
    setTimeout(() => renderGameRound(), 700);
  }
}

function gameOver(won) {
  document.getElementById('gameArea').innerHTML = `
    <div class="glass-card" style="text-align:center;padding:48px;max-width:360px;margin:0 auto;">
      <div style="font-size:60px;margin-bottom:16px">${won?'🏆':'💀'}</div>
      <h2 style="font-family:Syne,sans-serif;font-size:26px;margin-bottom:12px">${won?'Round Complete!':'Game Over'}</h2>
      <p style="color:var(--text-muted);margin-bottom:24px">Score: <strong style="color:var(--primary)">${_gameState.score}</strong></p>
      <button class="btn-primary" onclick="startGame('${_gameState.type}')" style="width:100%;justify-content:center;margin-bottom:10px">Play Again</button>
      <button class="btn-ghost" onclick="exitGame()" style="width:100%">Choose Game</button>
    </div>
  `;
}

// Shade Match
function renderShadeMatch() {
  const base = GAME_COLORS[Math.floor(Math.random()*GAME_COLORS.length)];
  const target = hslToRgb(base.h, base.s, base.l);
  const targetHex = rgbToHex(...target);

  const options = [target];
  while (options.length < 8) {
    const jitter = () => (Math.random()-0.5)*30;
    const opt = hslToRgb(base.h+jitter()*0.5, Math.max(20,Math.min(100,base.s+jitter()*0.6)), Math.max(20,Math.min(80,base.l+jitter())));
    options.push(opt);
  }
  shuffle(options);

  document.getElementById('gameArea').innerHTML = `
    <p class="game-target-label">Match this shade:</p>
    <div class="game-target-swatch" style="background:${targetHex}"></div>
    <div class="game-options-grid">
      ${options.map((o,i) => {
        const h = rgbToHex(...o);
        const isCorrect = h === targetHex;
        return `<div class="game-option-swatch" style="background:${h}" onclick="gameCheckShade(this,'${h}','${targetHex}')"></div>`;
      }).join('')}
    </div>
  `;
}

function gameCheckShade(el, chosen, target) {
  const [r1,g1,b1] = hexToRgb(chosen);
  const [r2,g2,b2] = hexToRgb(target);
  const dist = labDelta(r1/255,g1/255,b1/255,r2/255,g2/255,b2/255);
  if (dist < 0.08) gameCorrect(10);
  else gameWrong();
}

// Guess Color
function renderGuessColor() {
  const pick = GAME_COLORS[Math.floor(Math.random()*GAME_COLORS.length)];
  const [r,g,b] = hslToRgb(pick.h, pick.s, pick.l);
  const hex = rgbToHex(r,g,b);

  const wrongOptions = shuffle(GAME_COLORS.filter(c=>c.name!==pick.name)).slice(0,3).map(c=>c.name);
  const allOptions = shuffle([pick.name, ...wrongOptions]);

  document.getElementById('gameArea').innerHTML = `
    <div class="guess-color-swatch" style="background:${hex}"></div>
    <div class="guess-options">
      ${allOptions.map(opt => `
        <div class="guess-option" onclick="gameCheckGuess(this,'${opt}','${pick.name}')">${opt}</div>
      `).join('')}
    </div>
  `;
}

function gameCheckGuess(el, chosen, correct) {
  if (chosen === correct) {
    el.style.background = 'var(--primary-dim)';
    el.style.color = 'var(--primary)';
    el.style.borderColor = 'var(--primary)';
    gameCorrect(10);
  } else {
    el.style.background = 'rgba(255,107,157,0.2)';
    el.style.color = '#ff6b9d';
    el.style.borderColor = '#ff6b9d';
    // Show correct answer
    document.querySelectorAll('.guess-option').forEach(o => {
      if (o.textContent.trim() === correct) {
        o.style.background = 'var(--primary-dim)';
        o.style.color = 'var(--primary)';
      }
    });
    setTimeout(() => gameWrong(), 400);
  }
}

// Odd Color Out
function renderOddColor() {
  const base = GAME_COLORS[Math.floor(Math.random()*GAME_COLORS.length)];
  const gridSize = 20;
  const oddIndex = Math.floor(Math.random()*gridSize);
  const jitter = 12 + _gameState.round * 1.2; // gets harder
  const [br,bg,bb] = hslToRgb(base.h, base.s, base.l);
  const [or,og,ob] = hslToRgb(base.h + jitter*0.3, Math.min(100,base.s+jitter*0.2), Math.max(20,Math.min(80,base.l+jitter*0.5)));

  const cells = Array.from({length:gridSize}, (_,i) => ({
    color: i===oddIndex ? rgbToHex(or,og,ob) : rgbToHex(br,bg,bb),
    isOdd: i===oddIndex,
  }));

  document.getElementById('gameArea').innerHTML = `
    <p class="game-target-label">Find the odd one out:</p>
    <div class="odd-grid">
      ${cells.map((c,i) => `<div class="odd-cell" style="background:${c.color}" onclick="gameCheckOdd(${c.isOdd})"></div>`).join('')}
    </div>
  `;
}

function gameCheckOdd(isOdd) {
  if (isOdd) gameCorrect(15);
  else gameWrong();
}

// Memory Sequence
function renderMemorySeq() {
  const gs = _gameState;
  if (gs.seqIndex === 0) {
    // Generate new sequence
    const seqLen = 3 + Math.floor(gs.round/3);
    gs.sequence = Array.from({length:seqLen}, () => GAME_COLORS[Math.floor(Math.random()*GAME_COLORS.length)]);
    gs.userSequence = [];
    gs.showingSeq = true;
  }

  const seq = gs.sequence;
  const colors = GAME_COLORS.slice(0,8);

  document.getElementById('gameArea').innerHTML = `
    <p class="game-target-label" id="memInstruction">Watch the sequence…</p>
    <div class="memory-sequence-display" id="memDisplay">
      ${seq.map((c,i) => `<div class="mem-color" id="memcol-${i}" style="background:${rgbToHex(...hslToRgb(c.h,c.s,c.l))}"></div>`).join('')}
    </div>
    <div class="memory-sequence-display" id="memAnswerArea" style="display:none">
      ${colors.map((c,i) => `<div class="mem-color answer-mode" style="background:${rgbToHex(...hslToRgb(c.h,c.s,c.l))}" onclick="memPick(${i})"></div>`).join('')}
    </div>
  `;

  // Animate sequence
  let delay = 400;
  seq.forEach((_, i) => {
    setTimeout(() => {
      document.querySelectorAll('.mem-color').forEach(el=>el.classList.remove('active'));
      const el = document.getElementById(`memcol-${i}`);
      if (el) el.classList.add('active');
    }, delay + i * 700);
    delay += 700;
  });
  setTimeout(() => {
    document.querySelectorAll('.mem-color').forEach(el=>el.classList.remove('active'));
    document.getElementById('memInstruction').textContent = 'Repeat the sequence:';
    document.getElementById('memDisplay').style.display = 'none';
    document.getElementById('memAnswerArea').style.display = 'flex';
    gs.userSequence = [];
    gs.showingSeq = false;
  }, delay + 400);
}

function memPick(colorIdx) {
  const gs = _gameState;
  if (gs.showingSeq) return;
  gs.userSequence = gs.userSequence || [];
  gs.userSequence.push(colorIdx);

  const expectedIdx = GAME_COLORS.indexOf(gs.sequence[gs.userSequence.length-1]);
  if (colorIdx !== expectedIdx) {
    gameWrong();
    gs.seqIndex = 0;
    return;
  }
  if (gs.userSequence.length === gs.sequence.length) {
    gs.seqIndex = 0;
    gameCorrect(gs.sequence.length * 5);
  }
}

// Color Sort
function renderColorSort() {
  const numItems = 5 + Math.floor(_gameState.round/4);
  const hStart = Math.random()*60;
  let items = Array.from({length:numItems}, (_,i) => {
    const l = 30 + i*(40/numItems);
    const h = hStart + i*8;
    return { color: rgbToHex(...hslToRgb(h, 70, l)), l, id: i };
  });
  // Shuffle display order
  const displayItems = shuffle([...items]);
  _gameState.sortTarget = items.map(i=>i.id);

  let dragged = null;

  document.getElementById('gameArea').innerHTML = `
    <p class="sort-instruction">Drag to sort from darkest to lightest:</p>
    <div class="sort-colors" id="sortContainer">
      ${displayItems.map(item => `
        <div class="sort-item" draggable="true" data-id="${item.id}" style="background:${item.color}"></div>
      `).join('')}
    </div>
    <button class="btn-primary" onclick="checkSort()" style="margin-top:20px;width:100%;justify-content:center;">Check Order</button>
  `;

  // Drag listeners
  setTimeout(() => {
    const container = document.getElementById('sortContainer');
    if (!container) return;
    container.querySelectorAll('.sort-item').forEach(el => {
      el.addEventListener('dragstart', e => { dragged = el; el.classList.add('dragging'); });
      el.addEventListener('dragend', e => el.classList.remove('dragging'));
      el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('over'); });
      el.addEventListener('dragleave', e => el.classList.remove('over'));
      el.addEventListener('drop', e => {
        e.preventDefault();
        el.classList.remove('over');
        if (dragged && dragged !== el) {
          const parent = container;
          const nodes = [...parent.children].filter(c=>c.classList.contains('sort-item'));
          const fromIdx = nodes.indexOf(dragged);
          const toIdx = nodes.indexOf(el);
          if (fromIdx < toIdx) parent.insertBefore(dragged, el.nextSibling);
          else parent.insertBefore(dragged, el);
        }
      });
    });
  }, 100);
}

function checkSort() {
  const container = document.getElementById('sortContainer');
  if (!container) return;
  const userOrder = [...container.querySelectorAll('.sort-item')].map(el => parseInt(el.dataset.id));
  const target = _gameState.sortTarget;
  const correct = userOrder.every((v,i) => v === target[i]);
  if (correct) gameCorrect(20);
  else gameWrong();
}

// ── EXPORT / API STUBS ─────────────────────
function exportResults() {
  // Backend-ready stub
  console.log('[API stub] POST /api/test-results', APP.results);
  alert('Export feature — connect backend at /api/test-results');
}

// API stubs (backend-ready)
async function apiSaveResults(results) {
  // return fetch('/api/test-results', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(results) });
  console.log('[API stub] Saving results:', results);
}

async function apiGetProfile() {
  // return fetch('/api/user-profile').then(r=>r.json());
  return null;
}

async function apiColorDetect(imageData) {
  // return fetch('/api/color-detect', { method:'POST', body:imageData });
  return null;
}

// ── UTILITY ────────────────────────────────
function initSpectrumCanvasDelayed() {
  setTimeout(initSpectrumCanvas, 100);
}

// Re-init on window resize
window.addEventListener('resize', () => {
  initSpectrumCanvas();
  drawVisibleRange();
  if (APP.currentPage === 'results') {
    const results = APP.results;
    if (results) drawResultSpectrum(results);
  }
});

// Initial page is dashboard — trigger first draw
setTimeout(() => {
  drawTestPreviews();
  renderDashboard();
}, 200);
