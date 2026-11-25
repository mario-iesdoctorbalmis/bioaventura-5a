const STORAGE_KEY = 'bioaventura-progress-v1';
const LEADERBOARD_KEY = 'bioaventura-leaderboard-v1';
// Pega aquí la URL de tu Google Apps Script publicada como Aplicación web:
const SHEETS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbywzkiEmQpPj_jKsblRG3nzbr2bmht6Zn4avjSEIRQh0OEG5TuYp4J5XPW4TEJdap2XuQ/exec';
const ROUND_SIZE = 5;
const BADGES = [
  { id: 'first', name: 'Primer paso', detail: 'Completa tu primera misión', icon: 'flag', earned: state => state.games >= 1 },
  { id: 'correct', name: 'Mente curiosa', detail: 'Acierta 10 preguntas', icon: 'lightbulb', earned: state => state.correct >= 10 },
  { id: 'explorer', name: 'Explorador', detail: 'Completa 3 temas distintos', icon: 'compass', earned: state => state.topics.length >= 3 },
  { id: 'perfect', name: '¡Impecable!', detail: 'Completa una misión sin fallos', icon: 'medal', earned: state => state.perfect >= 1 },
  { id: 'expert', name: 'Gran experto', detail: 'Acierta 50 preguntas', icon: 'trophy', earned: state => state.correct >= 50 },
  { id: 'streak3', name: 'En racha', detail: 'Juega 3 días seguidos', icon: 'flame', earned: state => state.streak >= 3 },
  { id: 'streak7', name: 'Constancia total', detail: 'Juega 7 días seguidos', icon: 'calendar-check', earned: state => state.streak >= 7 },
  { id: 'anatomist', name: 'Anatomista', detail: 'Completa 3 dibujos interactivos', icon: 'move', earned: state => state.diagrams >= 3 },
  { id: 'master5', name: 'Maestro de los 5 temas', detail: 'Completa los 5 temas', icon: 'award', earned: state => state.topics.length >= 5 },
  { id: 'century', name: 'Centenario', detail: 'Acierta 100 preguntas', icon: 'crown', earned: state => state.correct >= 100 },
  { id: 'perfect3', name: 'Perfeccionista', detail: 'Completa 3 misiones sin fallos', icon: 'check-circle', earned: state => state.perfect >= 3 },
  { id: 'fast', name: 'Velocista', detail: 'Completa una misión en menos de 30 s', icon: 'zap', earned: state => state.fastGame },
  { id: 'early', name: 'Madrugador', detail: 'Juega antes de las 9:00', icon: 'sunrise', earned: state => state.earlyBird },
  { id: 'top3', name: 'Podio', detail: 'Entra en el Top 3 de la tabla', icon: 'star', earned: state => state.top3 }
];

const defaultState = () => ({ playerName: '', playerPass: '', score: 0, correct: 0, games: 0, perfect: 0, streak: 0, lastDay: '', diagrams: 0, fastGame: false, earlyBird: false, top3: false, topics: [], badges: [] });
let state = loadState();
let round = null;
let studyTopic = null;

const quizDialog = document.querySelector('#quiz-dialog');
const quizContent = document.querySelector('#quiz-content');
const diagramDialog = document.querySelector('#diagram-dialog');
const diagramContent = document.querySelector('#diagram-content');
const studyDialog = document.querySelector('#study-dialog');
const resetDialog = document.querySelector('#reset-dialog');
const playerDialog = document.querySelector('#player-dialog');
const loadingDialog = document.querySelector('#loading-dialog');
let diagramState = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== 'object') return defaultState();
    const number = value => Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
    return { playerName: typeof saved.playerName === 'string' ? saved.playerName : '', playerPass: typeof saved.playerPass === 'string' ? saved.playerPass : '', score: number(saved.score), correct: number(saved.correct), games: number(saved.games), perfect: number(saved.perfect), streak: number(saved.streak), lastDay: typeof saved.lastDay === 'string' ? saved.lastDay : '', diagrams: number(saved.diagrams), fastGame: Boolean(saved.fastGame), earlyBird: Boolean(saved.earlyBird), top3: Boolean(saved.top3), topics: Array.isArray(saved.topics) ? saved.topics.filter(id => TOPICS.some(topic => topic.id === id)) : [], badges: Array.isArray(saved.badges) ? saved.badges.filter(id => BADGES.some(badge => badge.id === id)) : [] };
  } catch {
    return defaultState();
  }
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function icons() {
  if (window.lucide) window.lucide.createIcons();
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function updateStreak() {
  const now = new Date();
  if (now.getHours() < 9) state.earlyBird = true;
  const today = now.toISOString().slice(0, 10);
  if (state.lastDay === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  state.streak = state.lastDay === yesterday ? (state.streak || 0) + 1 : 1;
  state.lastDay = today;
}

function updateBadges() {
  updateStreak();
  for (const badge of BADGES) {
    if (!state.badges.includes(badge.id) && badge.earned(state)) state.badges.push(badge.id);
  }
}

function getLevelInfo(score) {
  let level = 1;
  let needed = 100;
  let remaining = score;
  while (remaining >= needed) {
    remaining -= needed;
    level++;
    needed = Math.round(needed * 1.3);
  }
  return { level, current: remaining, needed, percent: Math.min(100, Math.round((remaining / needed) * 100)) };
}

function renderDashboard() {
  document.querySelectorAll('[data-player-name]').forEach(el => el.textContent = state.playerName || 'Jugador');
  document.querySelectorAll('[data-score]').forEach(element => element.textContent = state.score);
  const { level, current, needed, percent } = getLevelInfo(state.score);
  document.querySelectorAll('[data-level]').forEach(element => element.textContent = level);
  document.querySelector('[data-correct]').textContent = state.correct;
  document.querySelector('[data-next-level]').textContent = `${current} / ${needed} puntos`;
  document.querySelector('#level-progress').style.width = `${percent}%`;
  document.querySelector('#badge-count').textContent = state.badges.length;
  document.querySelector('#badge-grid').innerHTML = BADGES.map(badge => `<div class="badge-card ${state.badges.includes(badge.id) ? 'unlocked' : ''}"><span class="badge-symbol"><i data-lucide="${badge.icon}"></i></span><div><strong>${badge.name}</strong><small>${state.badges.includes(badge.id) ? '¡Conseguido!' : badge.detail}</small></div></div>`).join('');
  icons();
}

function renderTopics() {
  document.querySelector('#topic-grid').innerHTML = TOPICS.map((topic, index) => `<article class="topic-card"><div class="topic-visual ${topic.color}"><span class="topic-number">0${index + 1}</span><i data-lucide="${topic.icon}"></i></div><h3>${topic.name}</h3><p>${topic.description}</p><div class="topic-actions"><button class="button topic-play" data-play="${topic.id}"><i data-lucide="play" fill="currentColor"></i> Jugar</button><button class="icon-button" data-diagram="${topic.id}" aria-label="Etiquetar dibujo de ${topic.name}" title="Etiquetar dibujo"><i data-lucide="move"></i></button><button class="icon-button" data-study="${topic.id}" aria-label="Ver lámina de ${topic.name}" title="Ver lámina"><i data-lucide="book-open"></i></button></div></article>`).join('');
  icons();
}

let quizTimer = null;
let diagramTimer = null;

function formatElapsed(ms) {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function startRound(topicId) {
  const pool = topicId ? QUESTIONS.filter(question => question.topic === topicId) : QUESTIONS;
  const questions = shuffle(pool).slice(0, ROUND_SIZE).map(question => ({ ...question, shuffledOptions: shuffle(question.options.map((text, index) => ({ text, correct: index === question.answer }))) }));
  round = { topicId, questions, index: 0, correct: 0, points: 0, answered: false, startedAt: Date.now() };
  clearInterval(quizTimer);
  renderQuestion();
  quizTimer = setInterval(() => {
    const el = quizContent.querySelector('#quiz-timer');
    if (el && round) el.textContent = `⏱ ${formatElapsed(Date.now() - round.startedAt)}`;
  }, 500);
  if (!quizDialog.open) quizDialog.showModal();
}

function renderQuestion() {
  const question = round.questions[round.index];
  const topic = TOPICS.find(item => item.id === question.topic);
  round.answered = false;
  const elapsed = formatElapsed(Date.now() - round.startedAt);
  quizContent.innerHTML = `<div class="quiz-top"><div class="quiz-topic"><span class="quiz-topic-icon ${topic.color}"><i data-lucide="${topic.icon}"></i></span><span>${topic.name}</span></div><div class="quiz-meta"><span class="timer-pill" id="quiz-timer">⏱ ${elapsed}</span><span>${round.index + 1} / ${round.questions.length}</span><button class="icon-button" data-close-quiz aria-label="Salir de la misión" title="Salir"><i data-lucide="x"></i></button></div></div><div class="quiz-progress"><span style="width:${round.index / round.questions.length * 100}%"></span></div><span class="quiz-kicker">PREGUNTA ${round.index + 1}</span><h2 class="quiz-question" id="quiz-title">${question.q}</h2><div class="answers">${question.shuffledOptions.map((option, index) => `<button class="answer" data-answer="${index}"><span class="answer-letter">${String.fromCharCode(65 + index)}</span>${option.text}</button>`).join('')}</div><div id="feedback" aria-live="polite"></div><div class="quiz-bottom"><span>+10 por acierto · −5 por fallo</span><span>¡Tú puedes!</span></div>`;
  icons();
}

function answerQuestion(index) {
  if (!round || round.answered) return;
  const question = round.questions[round.index];
  const selected = question.shuffledOptions[index];
  if (!selected) return;
  round.answered = true;
  const previousScore = state.score;
  state.score = Math.max(0, state.score + (selected.correct ? 10 : -5));
  round.points += state.score - previousScore;
  if (selected.correct) { state.correct++; round.correct++; }
  updateBadges();
  saveState();
  renderDashboard();
  quizContent.querySelectorAll('[data-answer]').forEach((button, optionIndex) => {
    button.disabled = true;
    if (question.shuffledOptions[optionIndex].correct) button.classList.add('correct');
    else if (optionIndex === index) button.classList.add('wrong');
  });
  const feedback = quizContent.querySelector('#feedback');
  feedback.className = `feedback ${selected.correct ? '' : 'wrong-feedback'}`;
  feedback.innerHTML = `<strong>${selected.correct ? '¡Muy bien! +10 puntos' : '¡Casi! Sigue aprendiendo.'}</strong>${question.explanation}`;
  quizContent.querySelector('.quiz-bottom').innerHTML = `<span>${selected.correct ? '¡Un paso más!' : previousScore === 0 ? 'Tus puntos no bajan de cero.' : '−' + (previousScore - state.score) + ' puntos'}</span><button class="button primary" data-next>${round.index === round.questions.length - 1 ? 'Ver resultado' : 'Siguiente'} <i data-lucide="arrow-right"></i></button>`;
  icons();
  quizContent.querySelector('[data-next]').focus();
}

function finishRound() {
  clearInterval(quizTimer);
  const elapsedMs = round.startedAt ? Date.now() - round.startedAt : 0;
  state.games++;
  if (round.startedAt && elapsedMs < 30000) state.fastGame = true;
  if (round.correct === round.questions.length) state.perfect++;
  if (round.topicId && !state.topics.includes(round.topicId)) state.topics.push(round.topicId);
  const previousBadges = [...state.badges];
  updateBadges();
  const newBadges = BADGES.filter(badge => state.badges.includes(badge.id) && !previousBadges.includes(badge.id));
  saveState();
  renderDashboard();
  syncScoreToSheet();
  quizContent.innerHTML = `<div class="result"><div class="result-icon"><i data-lucide="trophy"></i></div><span class="quiz-kicker">MISIÓN COMPLETADA</span><h2 id="quiz-title">¡Buen trabajo!</h2><p>${round.correct === round.questions.length ? '¡Has acertado todas! Sigue explorando.' : 'Cada intento te ayuda a aprender algo nuevo.'}</p><div class="result-stats"><div class="result-stat"><strong>${round.correct} / ${round.questions.length}</strong><span>ACIERTOS</span></div><div class="result-stat"><strong>${round.points > 0 ? '+' : ''}${round.points}</strong><span>PUNTOS</span></div><div class="result-stat"><strong>${formatElapsed(elapsedMs)}</strong><span>TIEMPO</span></div></div>${newBadges.length ? `<p>¡Nuevo emblema: ${newBadges.map(badge => badge.name).join(', ')}!</p>` : ''}<div class="result-actions"><button class="button secondary" data-close-quiz>Volver a misiones</button><button class="button primary" data-replay><i data-lucide="rotate-ccw"></i> Jugar otra vez</button></div></div>`;
  icons();
}

document.querySelector('#topic-grid').addEventListener('click', event => {
  const play = event.target.closest('[data-play]');
  const diagram = event.target.closest('[data-diagram]');
  const study = event.target.closest('[data-study]');
  if (play) startRound(play.dataset.play);
  if (diagram) startDiagram(diagram.dataset.diagram);
  if (study) {
    studyTopic = TOPICS.find(topic => topic.id === study.dataset.study);
    const data = DIAGRAMS[studyTopic.id];
    document.querySelector('#study-title').textContent = studyTopic.name;
    const stage = document.querySelector('#study-stage');
    stage.style.setProperty('--zoom', '1');
    const studyZoomLabel = studyDialog.querySelector('[data-zoom-label]');
    if (studyZoomLabel) studyZoomLabel.textContent = '100%';
    if (data && data.image) {
      const { html, hasLeaders } = renderDiagramCanvas(data, 'study', `Lámina de ${studyTopic.name}`);
      stage.classList.toggle('has-leaders', hasLeaders);
      stage.innerHTML = html;
    } else {
      stage.classList.remove('has-leaders');
      stage.innerHTML = `<img src="${studyTopic.image}" alt="Lámina de ${studyTopic.name}">`;
    }
    studyDialog.showModal();
  }
});

quizContent.addEventListener('click', event => {
  const answer = event.target.closest('[data-answer]');
  if (answer) answerQuestion(Number(answer.dataset.answer));
  if (event.target.closest('[data-close-quiz]')) quizDialog.close();
  if (event.target.closest('[data-next]')) {
    round.index++;
    if (round.index < round.questions.length) renderQuestion();
    else finishRound();
  }
  if (event.target.closest('[data-replay]')) startRound(round.topicId);
});

document.querySelector('#start-random')?.addEventListener('click', () => startRound(null));
document.querySelector('[data-close-study]').addEventListener('click', () => studyDialog.close());
document.querySelector('#study-play').addEventListener('click', () => { studyDialog.close(); startRound(studyTopic.id); });
document.querySelector('#reset-progress').addEventListener('click', () => resetDialog.showModal());
document.querySelectorAll('[data-cancel-reset]').forEach(button => button.addEventListener('click', () => resetDialog.close()));
document.querySelector('#confirm-reset').addEventListener('click', () => { state = defaultState(); saveState(); renderDashboard(); resetDialog.close(); });

renderTopics();
renderDashboard();

function renderDiagramCanvas(data, mode, altText) {
  const hasLeaders = data.zones.some(z => (z.lx ?? z.x) !== z.x || (z.ly ?? z.y) !== z.y);
  const lines = data.zones.map(z => {
    const lx = z.lx ?? z.x, ly = z.ly ?? z.y;
    return (lx !== z.x || ly !== z.y) ? `<line x1="${lx}" y1="${ly}" x2="${z.x}" y2="${z.y}" vector-effect="non-scaling-stroke"/>` : '';
  }).join('');
  const dots = data.zones.map(z => {
    const lx = z.lx ?? z.x, ly = z.ly ?? z.y;
    return (lx !== z.x || ly !== z.y) ? `<span class="target-dot" style="left:${z.x}%;top:${z.y}%"></span>` : '';
  }).join('');
  const items = data.zones.map((zone, i) => {
    const lx = zone.lx ?? zone.x, ly = zone.ly ?? zone.y;
    const alignClass = zone.align === 'left' ? 'align-left' : zone.align === 'right' ? 'align-right' : '';
    if (mode === 'study') {
      return `<span class="drop-zone filled study-label ${alignClass}" style="left:${lx}%;top:${ly}%">${zone.label}</span>`;
    }
    return `<button type="button" class="drop-zone ${alignClass}" data-zone="${zone.id}" style="left:${lx}%;top:${ly}%" aria-label="Zona ${i + 1}">${i + 1}</button>`;
  }).join('');
  const media = data.image
    ? `<img src="${data.image}" alt="${altText || data.title}" onload="this.parentElement.style.setProperty('--ratio', this.naturalWidth / this.naturalHeight)">`
    : `<svg class="diagram-svg" viewBox="${data.viewBox}" role="img" aria-label="${data.title}">${data.svg}</svg>`;
  return {
    hasLeaders,
    html: `<div class="diagram-canvas" style="--ratio:${data.ratio || 1}">${media}<svg class="leader-lines" viewBox="0 0 100 100" preserveAspectRatio="none">${lines}</svg>${dots}${items}</div>`
  };
}

function startDiagram(topicId) {
  const data = DIAGRAMS[topicId];
  const topic = TOPICS.find(item => item.id === topicId);
  if (!data || !topic) return;
  diagramState = { topicId, placed: new Set(), selectedLabel: null, total: data.zones.length, startedAt: Date.now() };
  clearInterval(diagramTimer);
  const shuffledLabels = shuffle(data.zones);
  const { html, hasLeaders } = renderDiagramCanvas(data, 'play', data.title);
  diagramContent.innerHTML = `
    <div class="quiz-top">
      <div class="quiz-topic"><span class="quiz-topic-icon ${topic.color}"><i data-lucide="${topic.icon}"></i></span><span>${data.title}</span></div>
      <div class="quiz-meta"><span class="timer-pill" id="diagram-timer">⏱ 0:00</span><span id="diagram-count">0 / ${data.zones.length}</span><button class="icon-button" data-close-diagram aria-label="Cerrar" title="Cerrar"><i data-lucide="x"></i></button></div>
    </div>
    <p class="diagram-instruction"><strong>Arrastra (PC)</strong> o <strong>selecciona y apunta (Tablet/móvil)</strong> cada elemento a su lugar en el dibujo.</p>
    <div class="zoom-bar" data-zoom-target="#diagram-stage-box"><button type="button" class="icon-button" data-zoom="-0.25" aria-label="Alejar"><i data-lucide="zoom-out"></i></button><span data-zoom-label>100%</span><button type="button" class="icon-button" data-zoom="0.25" aria-label="Acercar"><i data-lucide="zoom-in"></i></button><button type="button" class="icon-button" data-zoom="reset" aria-label="Restablecer zoom"><i data-lucide="rotate-ccw"></i></button></div>
    <div class="diagram-layout">
      <div id="diagram-stage-box" class="diagram-stage ${hasLeaders ? 'has-leaders' : ''}">
        ${html}
      </div>
      <div class="label-bank" id="label-bank">
        ${shuffledLabels.map(zone => `<button type="button" class="drag-label" draggable="true" data-label="${zone.id}">${zone.label}</button>`).join('')}
      </div>
    </div>
    <div id="diagram-feedback" class="diagram-feedback" aria-live="polite"></div>
  `;
  icons();
  diagramTimer = setInterval(() => {
    const el = diagramContent.querySelector('#diagram-timer');
    if (el && diagramState) el.textContent = `⏱ ${formatElapsed(Date.now() - diagramState.startedAt)}`;
  }, 500);
  if (!diagramDialog.open) diagramDialog.showModal();
}

function tryPlaceLabel(zoneId, labelId) {
  if (!diagramState || diagramState.placed.has(zoneId)) return;
  const zoneEl = diagramContent.querySelector(`[data-zone="${zoneId}"]`);
  const labelEl = diagramContent.querySelector(`[data-label="${labelId}"]`);
  const feedback = diagramContent.querySelector('#diagram-feedback');
  if (!zoneEl || !labelEl) return;

  if (zoneId === labelId) {
    diagramState.placed.add(zoneId);
    zoneEl.classList.add('filled');
    zoneEl.textContent = labelEl.textContent;
    labelEl.disabled = true;
    labelEl.classList.add('used');
    diagramState.selectedLabel = null;
    diagramContent.querySelectorAll('.drag-label.selected').forEach(el => el.classList.remove('selected'));
    state.score += 5;
    updateBadges();
    saveState();
    renderDashboard();
    syncScoreToSheet();
    diagramContent.querySelector('#diagram-count').textContent = `${diagramState.placed.size} / ${diagramState.total}`;
    if (diagramState.placed.size === diagramState.total) {
      clearInterval(diagramTimer);
      const elapsed = formatElapsed(Date.now() - diagramState.startedAt);
      state.diagrams = (state.diagrams || 0) + 1;
      updateBadges();
      saveState();
      renderDashboard();
      feedback.className = 'diagram-feedback ok';
      feedback.textContent = `¡Genial! Has colocado todas las etiquetas en ${elapsed} (+5 pts por cada una).`;
    } else {
      feedback.className = 'diagram-feedback ok';
      feedback.textContent = '¡Correcto! +5 puntos.';
    }
  } else {
    zoneEl.classList.add('wrong-drop');
    setTimeout(() => zoneEl.classList.remove('wrong-drop'), 500);
    feedback.className = 'diagram-feedback err';
    feedback.textContent = 'Ese no es su sitio. ¡Prueba en otro punto del dibujo!';
  }
}

diagramContent.addEventListener('click', event => {
  if (event.target.closest('[data-close-diagram]')) {
    diagramDialog.close();
    return;
  }
  const labelBtn = event.target.closest('[data-label]');
  if (labelBtn && !labelBtn.disabled) {
    diagramContent.querySelectorAll('.drag-label.selected').forEach(el => el.classList.remove('selected'));
    if (diagramState.selectedLabel === labelBtn.dataset.label) {
      diagramState.selectedLabel = null;
    } else {
      diagramState.selectedLabel = labelBtn.dataset.label;
      labelBtn.classList.add('selected');
    }
    return;
  }
  const zoneBtn = event.target.closest('[data-zone]');
  if (zoneBtn && diagramState?.selectedLabel) {
    tryPlaceLabel(zoneBtn.dataset.zone, diagramState.selectedLabel);
  }
});

diagramContent.addEventListener('dragstart', event => {
  const labelBtn = event.target.closest('[data-label]');
  if (!labelBtn || labelBtn.disabled) return;
  event.dataTransfer.setData('text/plain', labelBtn.dataset.label);
  diagramState.selectedLabel = labelBtn.dataset.label;
});

diagramContent.addEventListener('dragover', event => {
  const zoneBtn = event.target.closest('[data-zone]');
  if (zoneBtn && !zoneBtn.classList.contains('filled')) {
    event.preventDefault();
    zoneBtn.classList.add('drag-over');
  }
});

diagramContent.addEventListener('dragleave', event => {
  const zoneBtn = event.target.closest('[data-zone]');
  if (zoneBtn) zoneBtn.classList.remove('drag-over');
});

diagramContent.addEventListener('drop', event => {
  const zoneBtn = event.target.closest('[data-zone]');
  if (!zoneBtn) return;
  event.preventDefault();
  zoneBtn.classList.remove('drag-over');
  const labelId = event.dataTransfer.getData('text/plain') || diagramState?.selectedLabel;
  if (labelId) tryPlaceLabel(zoneBtn.dataset.zone, labelId);
});

quizDialog.addEventListener('close', () => clearInterval(quizTimer));
diagramDialog.addEventListener('close', () => clearInterval(diagramTimer));

document.addEventListener('click', event => {
  const btn = event.target.closest('[data-zoom]');
  if (!btn) return;
  const bar = btn.closest('[data-zoom-target]');
  const stage = bar && document.querySelector(bar.dataset.zoomTarget);
  if (!stage) return;
  const current = parseFloat(stage.style.getPropertyValue('--zoom') || '1') || 1;
  const action = btn.dataset.zoom;
  const next = action === 'reset' ? 1 : Math.min(2.25, Math.max(0.75, +(current + parseFloat(action)).toFixed(2)));
  stage.style.setProperty('--zoom', String(next));
  const label = bar.querySelector('[data-zoom-label]');
  if (label) label.textContent = `${Math.round(next * 100)}%`;
});

document.addEventListener('keydown', event => {
  if (!quizDialog.open || !round || round.answered) return;
  const keyMap = { a: 0, b: 1, c: 2, d: 3 };
  const index = keyMap[event.key.toLowerCase()];
  if (index !== undefined) {
    event.preventDefault();
    answerQuestion(index);
  }
});

function getLocalLeaderboard() {
  try {
    const list = JSON.parse(localStorage.getItem(LEADERBOARD_KEY));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveLocalLeaderboard(entry) {
  const list = getLocalLeaderboard();
  const idx = list.findIndex(item => item.nombre.toLowerCase() === entry.nombre.toLowerCase());
  if (idx >= 0) {
    list[idx] = {
      nombre: entry.nombre,
      puntos: Math.max(list[idx].puntos, entry.puntos),
      aciertos: Math.max(list[idx].aciertos, entry.aciertos),
      partidas: Math.max(list[idx].partidas, entry.partidas),
      fecha: entry.fecha
    };
  } else {
    list.push(entry);
  }
  list.sort((a, b) => b.puntos - a.puntos);
  try { localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list.slice(0, 20))); } catch {}
}

async function syncScoreToSheet() {
  if (!state.playerName) return;
  const entry = {
    nombre: state.playerName,
    clave: state.playerPass || '',
    puntos: state.score,
    aciertos: state.correct,
    partidas: state.games,
    progreso: JSON.stringify({
      perfect: state.perfect,
      streak: state.streak,
      lastDay: state.lastDay,
      diagrams: state.diagrams,
      fastGame: state.fastGame,
      earlyBird: state.earlyBird,
      top3: state.top3,
      topics: state.topics,
      badges: state.badges
    }),
    fecha: new Date().toLocaleDateString('es-ES')
  };
  saveLocalLeaderboard(entry);
  renderLeaderboard(getLocalLeaderboard());
  if (!SHEETS_WEBAPP_URL) return;
  try {
    await fetch(SHEETS_WEBAPP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
  } catch {}
}

async function loadLeaderboard() {
  const local = getLocalLeaderboard();
  renderLeaderboard(local);
  if (!SHEETS_WEBAPP_URL) return;
  if (!loadingDialog.open) loadingDialog.showModal();
  try {
    const res = await fetch(SHEETS_WEBAPP_URL);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        renderLeaderboard(data);
      }
    }
  } catch {} finally {
    if (loadingDialog.open) loadingDialog.close();
  }
}

function renderLeaderboard(rows) {
  const container = document.querySelector('#leaderboard-list');
  if (!container) return;
  if (state.playerName && rows.slice(0, 3).some(r => String(r.nombre || '').toLowerCase() === state.playerName.toLowerCase())) {
    if (!state.top3) { state.top3 = true; updateBadges(); saveState(); renderDashboard(); }
  }
  if (!rows.length) {
    container.innerHTML = '<p class="leaderboard-empty">Todavía no hay puntuaciones guardadas. ¡Completa una misión para aparecer aquí!</p>';
    return;
  }
  container.innerHTML = `<table class="leaderboard-table"><thead><tr><th>#</th><th>Explorador</th><th>Puntos</th><th>Aciertos</th></tr></thead><tbody>${rows.map((r, i) => `<tr class="${r.nombre.toLowerCase() === (state.playerName || '').toLowerCase() ? 'me' : ''}"><td>${i + 1}</td><td>${r.nombre}</td><td><strong>${r.puntos}</strong></td><td>${r.aciertos}</td></tr>`).join('')}</tbody></table>`;
}

document.querySelector('#change-player').addEventListener('click', () => {
  document.querySelector('#player-input').value = state.playerName || '';
  document.querySelector('#player-pass').value = state.playerPass || '';
  document.querySelector('#player-error').textContent = '';
  playerDialog.showModal();
});
document.querySelector('[data-close-player]').addEventListener('click', () => playerDialog.close());
document.querySelector('#player-form').addEventListener('submit', async event => {
  event.preventDefault();
  const name = document.querySelector('#player-input').value.trim();
  const pass = document.querySelector('#player-pass').value;
  const errorEl = document.querySelector('#player-error');
  if (!name || !pass) return;
  errorEl.textContent = '';

  if (SHEETS_WEBAPP_URL) {
    if (!loadingDialog.open) loadingDialog.showModal();
    try {
      const url = `${SHEETS_WEBAPP_URL}?nombre=${encodeURIComponent(name)}&clave=${encodeURIComponent(pass)}`;
      const res = await fetch(url);
      if (res.ok) {
        const check = await res.json();
        if (check.status === 'wrong_password') {
          errorEl.textContent = 'Ese usuario ya está reservado. Elige otro nombre o prueba otra contraseña por si te has equivocado.';
          return;
        }
        if (check.status === 'ok') {
          let extra = {};
          try { if (check.progreso) extra = JSON.parse(check.progreso) || {}; } catch {}
          state = {
            ...defaultState(),
            playerName: name,
            playerPass: pass,
            score: check.puntos || 0,
            correct: check.aciertos || 0,
            games: check.partidas || 0,
            perfect: Number(extra.perfect) || 0,
            streak: Number(extra.streak) || 0,
            lastDay: typeof extra.lastDay === 'string' ? extra.lastDay : '',
            diagrams: Number(extra.diagrams) || 0,
            fastGame: Boolean(extra.fastGame),
            earlyBird: Boolean(extra.earlyBird),
            top3: Boolean(extra.top3),
            topics: Array.isArray(extra.topics) ? extra.topics : [],
            badges: Array.isArray(extra.badges) ? extra.badges : []
          };
          updateBadges();
          saveState();
          renderDashboard();
          const whatsNew = document.querySelector('#whats-new');
if (whatsNew) {
  try {
    if (localStorage.getItem('bioaventura-whats-new-v2') === '1') whatsNew.hidden = true;
  } catch {}
  document.querySelector('#dismiss-whats-new')?.addEventListener('click', () => {
    whatsNew.hidden = true;
    try { localStorage.setItem('bioaventura-whats-new-v2', '1'); } catch {}
  });
}

loadLeaderboard();
          playerDialog.close();
          return;
        }
      }
    } catch {} finally {
      if (loadingDialog.open) loadingDialog.close();
    }
  }

  if (name.toLowerCase() !== (state.playerName || '').toLowerCase()) {
    state = { ...defaultState(), playerName: name, playerPass: pass };
  } else {
    state.playerName = name;
    state.playerPass = pass;
  }
  saveState();
  renderDashboard();
  const whatsNew = document.querySelector('#whats-new');
if (whatsNew) {
  try {
    if (localStorage.getItem('bioaventura-whats-new-v2') === '1') whatsNew.hidden = true;
  } catch {}
  document.querySelector('#dismiss-whats-new')?.addEventListener('click', () => {
    whatsNew.hidden = true;
    try { localStorage.setItem('bioaventura-whats-new-v2', '1'); } catch {}
  });
}

loadLeaderboard();
  playerDialog.close();
});
document.querySelector('#refresh-leaderboard').addEventListener('click', loadLeaderboard);

const whatsNew = document.querySelector('#whats-new');
if (whatsNew) {
  try {
    if (localStorage.getItem('bioaventura-whats-new-v2') === '1') whatsNew.hidden = true;
  } catch {}
  document.querySelector('#dismiss-whats-new')?.addEventListener('click', () => {
    whatsNew.hidden = true;
    try { localStorage.setItem('bioaventura-whats-new-v2', '1'); } catch {}
  });
}

loadLeaderboard();
if (!state.playerName) playerDialog.showModal();

const TRACKS = [
  {
    title: 'Esqueleto Urbano',
    subtitle: 'Rap de los huesos',
    icon: 'bone',
    src: 'resources/Esqueleto_Urbano.mp3',
    lyrics: [
      { t: 0, text: '🎵 Ritmo inicial...' },
      { t: 7.5, text: 'Empezamos arriba en el cráneo genial:' },
      { t: 10.5, text: 'en la frente tienes el frontal,' },
      { t: 13.5, text: 'a los lados el parietal,' },
      { t: 16.0, text: 'y cerca de las sienes está el temporal.' },
      { t: 19.0, text: 'En la cara, arriba, el maxilar,' },
      { t: 21.5, text: 'para poder morder y masticar.' },
      { t: 24.5, text: 'Bajamos al pecho con mucha atención:' },
      { t: 27.0, text: 'en el centro delantero está el esternón.' },
      { t: 30.0, text: 'De ahí sale al hombro la clavícula fina,' },
      { t: 33.0, text: 'y detrás, en la espalda, el omoplato domina.' },
      { t: 36.0, text: 'Las costillas rodean como una prisión' },
      { t: 39.0, text: 'para proteger pulmones y corazón.' },
      { t: 42.0, text: 'Y por detrás, en fila, bien puestas en línea,' },
      { t: 44.5, text: 'las vértebras forman toda la columna.' },
      { t: 48.0, text: '¡Ey! De la cabeza hasta los pies,' },
      { t: 50.5, text: 'aprende los huesos de una vez.' },
      { t: 53.5, text: 'Cada pieza tiene su lugar,' },
      { t: 56.0, text: '¡vamos, que el esqueleto va a sonar!' },
      { t: 59.0, text: '¡Ey! De la cabeza hasta los pies,' },
      { t: 62.0, text: 'aprende los huesos de una vez.' },
      { t: 65.0, text: 'Cada pieza tiene su lugar,' },
      { t: 67.5, text: '¡vamos, que el esqueleto va a sonar!' },
      { t: 71.0, text: 'Desde el hombro hasta el codo va el húmero fuerte,' },
      { t: 74.0, text: 'y en el antebrazo tienes dos de suerte:' },
      { t: 77.0, text: 'radio y cúbito juntos van,' },
      { t: 82.5, text: 'hasta llegar a la muñeca, donde el carpo está.' },
      { t: 85.5, text: 'En la palma de la mano el metacarpo ves,' },
      { t: 88.5, text: 'y en los dedos las falanges… ¡como en los pies!' },
      { t: 93.0, text: '🎵 Pausa instrumental...' },
      { t: 122.0, text: 'En la cadera manda la pelvis entera,' },
      { t: 125.0, text: 'y en el muslo el fémur, ¡el más largo que hubiera!' },
      { t: 128.0, text: 'Delante de la rodilla, como un escudo,' },
      { t: 131.0, text: 'está la rótula, ¡te lo aseguro!' },
      { t: 134.0, text: 'Debajo de la rodilla, hasta el tobillo van,' },
      { t: 136.5, text: 'tibia y peroné que te hacen caminar.' },
      { t: 139.0, text: 'En el tobillo el tarso, en el pie el metatarso,' },
      { t: 142.0, text: 'y en los dedos las falanges… ¡ya hemos terminado el paso!' },
      { t: 145.5, text: '¡Ey! De la cabeza hasta los pies,' },
      { t: 148.0, text: 'aprende los huesos de una vez.' },
      { t: 151.0, text: 'Cada pieza tiene su lugar,' },
      { t: 153.5, text: '¡vamos, que el esqueleto va a sonar!' },
      { t: 156.5, text: '¡Ey! De la cabeza hasta los pies,' },
      { t: 159.5, text: 'aprende los huesos de una vez.' },
      { t: 162.0, text: 'Cada pieza tiene su lugar,' },
      { t: 165.0, text: '¡vamos, que el esqueleto va a sonar!' },
      { t: 171.5, text: 'Cráneo, tronco, brazos y pies, ¡ya te sabes los huesos al derecho y al revés!' }
    ]
  },
  {
    title: 'Ritmo Anatómico',
    subtitle: 'Rap de los músculos',
    icon: 'biceps-flexed',
    src: 'resources/Ritmo_anatómico.mp3',
    lyrics: [
      { t: 0, text: 'Escucha el ritmo, siente el movimiento,' },
      { t: 5.5, text: 'vamos a conocer nuestro cuerpo por dentro.' },
      { t: 11.0, text: '¡Ey! Si te mueves, si corres o si saltas,' },
      { t: 14.5, text: 'los músculos trabajan, nunca te hacen falta.' },
      { t: 18.0, text: 'De la cara hasta los pies, escúchalo bien,' },
      { t: 21.5, text: 'vamos a ubicarlos todos de una vez.' },
      { t: 26.5, text: 'Empezamos por la cara, ¡mira qué nivel!:' },
      { t: 28.5, text: 'orbicular de los párpados rodea el ojo bien,' },
      { t: 31.5, text: 'orbicular de los labios rodea la boca entera,' },
      { t: 34.5, text: 'y el masetero en la mandíbula mastica lo que quiera.' },
      { t: 37.5, text: 'A los lados del cuello, con nombre bien largo,' },
      { t: 40.5, text: 'el esternocleidomastoideo gira la cabeza a tu cargo.' },
      { t: 45.5, text: 'En lo alto de la espalda y el cuello está el trapecio,' },
      { t: 48.5, text: 'cubriendo cada hombro el deltoides hace su precio.' },
      { t: 51.5, text: 'En el pecho adelante manda el pectoral,' },
      { t: 54.5, text: 'y en la espalda ancha tienes el dorsal.' },
      { t: 57.0, text: 'En la zona del vientre, firmes y geniales,' },
      { t: 60.0, text: 'para doblar el tronco van los abdominales.' },
      { t: 64.5, text: '¡Ey! Si te mueves, si corres o si saltas,' },
      { t: 68.0, text: 'los músculos trabajan, nunca te hacen falta.' },
      { t: 71.5, text: 'De la cara hasta los pies, escúchalo bien,' },
      { t: 75.0, text: 'vamos a ubicarlos todos de una vez.' },
      { t: 81.0, text: 'En el brazo, por delante, el bíceps se contrae,' },
      { t: 85.0, text: 'doblando el codo cuando algo se trae.' },
      { t: 89.0, text: 'Y por detrás del brazo, haciendo su papel,' },
      { t: 93.5, text: 'el tríceps lo estira… ¡apréndetelo bien!' },
      { t: 98.5, text: 'En las nalgas tenemos el glúteo potente,' },
      { t: 102.0, text: 'y en el muslo, por delante, el cuádriceps valiente.' },
      { t: 105.5, text: 'Detrás del muslo, atento, está el bíceps femoral,' },
      { t: 109.0, text: '¡no lo confundas con el del brazo, que no es igual!' },
      { t: 113.0, text: 'Bajando a la pierna, delante junto al hueso,' },
      { t: 116.5, text: 'el tibial anterior hace su proceso.' },
      { t: 120.0, text: 'Y atrás, en la pantorrilla, para saltar al cielo,' },
      { t: 123.5, text: 'tienes bien fuerte el músculo gemelo.' },
      { t: 129.0, text: '¡Cara, tronco, brazos y pies,' },
      { t: 135.0, text: 'ya te sabes los músculos al derecho y al revés!' }
    ]
  },
  {
    title: 'Gusto, Oído y Ojo',
    subtitle: 'Rap de los sentidos',
    icon: 'eye',
    src: 'resources/gusto-oído-ojo.mp3',
    lyrics: [
      { t: 0, text: 'Oye, prepárate para el viaje corporal,' },
      { t: 4.5, text: 'gusto, oído y vista en este rap total.' },
      { t: 7.5, text: 'La ciencia tiene flow, aprende de una vez,' },
      { t: 10.5, text: 'anatomía con paz de la cabeza a los pies.' },
      { t: 13.5, text: 'Empezamos por la boca, mira qué nivel:' },
      { t: 16.5, text: 'el dulce es el azúcar de un rico pastel,' },
      { t: 19.5, text: 'el salado en las patatas que te gusta probar,' },
      { t: 22.5, text: 'y el ácido en el limón que te hace gesticular.' },
      { t: 25.5, text: 'El amargo en el café que te va a despertar,' },
      { t: 28.5, text: 'y el umami en el queso que te hace disfrutar.' },
      { t: 31.5, text: 'Cinco sabores claros en tu lengua al comer,' },
      { t: 34.5, text: 'son las papilas gustativas que te hacen saber.' },
      { t: 37.5, text: 'Siente el ritmo en tu piel, es la anatomía,' },
      { t: 40.5, text: 'tres sentidos potentes brillando de día.' },
      { t: 43.5, text: 'Gusto, oído y vista, todo un gran motor,' },
      { t: 46.5, text: 'aprende con este rap de puro color.' },
      { t: 49.5, text: 'Siente el ritmo en tu piel, es la anatomía,' },
      { t: 52.5, text: 'tres sentidos potentes brillando de día.' },
      { t: 55.5, text: 'Gusto, oído y vista, todo un gran motor,' },
      { t: 58.5, text: 'aprende con este rap de puro color.' },
      { t: 62.0, text: 'Entramos en la oreja con este flow de autor:' },
      { t: 65.0, text: 'el conducto auditivo es el gran receptor.' },
      { t: 68.0, text: 'Choca en el tímpano, la membrana que va a vibrar,' },
      { t: 71.0, text: 'y tres huesecillos la señal van a amplificar.' },
      { t: 74.0, text: 'El martillo, el yunque y el estribo en unión' },
      { t: 77.0, text: 'llevan al caracol toda esa gran vibración.' },
      { t: 80.0, text: 'El nervio auditivo al cerebro se la va a mandar,' },
      { t: 83.0, text: 'y así cada sonido tú lo puedes procesar.' },
      { t: 86.0, text: 'Siente el ritmo en tu piel, es la anatomía,' },
      { t: 89.0, text: 'tres sentidos potentes brillando de día.' },
      { t: 92.0, text: 'Gusto, oído y vista, todo un gran motor,' },
      { t: 95.0, text: 'aprende con este rap de puro color.' },
      { t: 98.0, text: 'Siente el ritmo en tu piel, es la anatomía,' },
      { t: 101.0, text: 'tres sentidos potentes brillando de día.' },
      { t: 104.0, text: 'Gusto, oído y vista, todo un gran motor,' },
      { t: 107.0, text: 'aprende con este rap de puro color.' },
      { t: 111.5, text: 'Pasamos a la vista, el mundo en tu pantalla:' },
      { t: 114.5, text: 'los párpados son el escudo, lo que nunca falla.' },
      { t: 117.5, text: 'Limpian y protegen de todo lo exterior,' },
      { t: 120.5, text: 'y el globo ocular recibe todo ese resplandor.' },
      { t: 123.5, text: 'La esclerótica es la capa, el casco protector,' },
      { t: 126.5, text: 'y el iris es el músculo que le da el color.' },
      { t: 129.5, text: 'La pupila es la ventana que regula la luz,' },
      { t: 132.5, text: 'y pestañas y cejas, ¡vaya gran multitud!' },
      { t: 135.5, text: 'Las pestañas son filtros que evitan el polvo entrar,' },
      { t: 138.5, text: 'y las cejas desvían el sudor al caminar.' },
      { t: 141.5, text: 'Todo este gran sistema te permite observar,' },
      { t: 144.5, text: 'y este mundo tan bello tú puedas admirar.' },
      { t: 147.5, text: 'Siente el ritmo en tu piel, es la anatomía,' },
      { t: 150.5, text: 'tres sentidos potentes brillando de día.' },
      { t: 153.5, text: 'Gusto, oído y vista, todo un gran motor,' },
      { t: 156.5, text: 'aprende con este rap de puro color.' },
      { t: 159.5, text: 'Siente el ritmo en tu piel, es la anatomía,' },
      { t: 162.5, text: 'tres sentidos potentes brillando de día.' },
      { t: 165.5, text: 'Gusto, oído y vista, todo un gran motor,' },
      { t: 168.5, text: 'aprende con este rap de puro color.' },
      { t: 171.5, text: 'Siente el ritmo en tu piel, es la anatomía,' },
      { t: 174.5, text: 'tres sentidos potentes brillando de día.' },
      { t: 177.5, text: 'Gusto, oído y vista, todo un gran motor,' },
      { t: 180.5, text: 'aprende con este rap de puro color.' },
      { t: 183.5, text: 'Ya te sabes los tres sentidos con este flow genial,' },
      { t: 187.0, text: 'gusto, oído y vista, un equipo sin igual.' },
      { t: 190.0, text: 'La ciencia en tus auriculares, nunca lo olvides ya,' },
      { t: 193.0, text: '¡paz y rap para todos, nos vemos allá!' }
    ]
  }
];
const audio = document.querySelector('#music-audio');
const trackList = document.querySelector('#music-tracks');
const toggleBtn = document.querySelector('#music-toggle');
const seekInput = document.querySelector('#music-seek');
const karaokeBox = document.querySelector('#karaoke-box');
const lyricsDropdown = document.querySelector('#lyrics-dropdown');
let currentTrack = 0;
let karaokeRaf = null;
let manualOffset = 0;
let lastSetScroll = 0;

function renderLyrics() {
  if (!karaokeBox) return;
  const lines = TRACKS[currentTrack].lyrics || [];
  karaokeBox.innerHTML = lines.map((line, i) => `<p class="karaoke-line" data-lyric="${i}" data-time="${line.t}">${line.text}</p>`).join('');
  karaokeBox.scrollTop = 0;
  manualOffset = 0;
  lastSetScroll = 0;
}

function getAutoScroll(time) {
  const maxScroll = karaokeBox.scrollHeight - karaokeBox.clientHeight;
  if (maxScroll <= 0 || !audio?.duration) return 0;
  const start = 5;
  const span = Math.max(1, audio.duration - start - 10);
  const ratio = Math.min(1, Math.max(0, (time - start) / span));
  return ratio * maxScroll;
}

function updateKaraoke(time) {
  if (!karaokeBox || !audio?.duration || (lyricsDropdown && !lyricsDropdown.open)) return;
  const maxScroll = karaokeBox.scrollHeight - karaokeBox.clientHeight;
  if (maxScroll <= 0) return;
  const autoTarget = getAutoScroll(time);
  const next = Math.min(maxScroll, Math.max(0, autoTarget + manualOffset));
  lastSetScroll = next;
  karaokeBox.scrollTop = next;
}

function tickKaraoke() {
  if (!audio || audio.paused) {
    karaokeRaf = null;
    return;
  }
  updateKaraoke(audio.currentTime);
  karaokeRaf = requestAnimationFrame(tickKaraoke);
}

function formatTime(sec) {
  if (!Number.isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function renderTracks() {
  if (!trackList) return;
  trackList.innerHTML = TRACKS.map((t, i) => `<div class="music-track-item"><button type="button" class="music-track ${i === currentTrack ? 'active' : ''}" data-track="${i}"><span class="music-track-icon"><i data-lucide="${t.icon || 'music'}"></i></span><span><strong>${t.title}</strong><small>${t.subtitle}</small></span></button><a class="icon-button music-download" href="${encodeURI(t.src)}" download aria-label="Descargar ${t.title}" title="Descargar ${t.title}"><i data-lucide="download"></i></a></div>`).join('');
  icons();
}

function updatePlayButton() {
  if (!toggleBtn || !audio) return;
  const playing = !audio.paused;
  toggleBtn.innerHTML = `<i data-lucide="${playing ? 'pause' : 'play'}" fill="currentColor"></i> <span>${playing ? 'Pausar' : 'Reproducir'}</span>`;
  icons();
}

function selectTrack(index, autoplay = false) {
  currentTrack = (index + TRACKS.length) % TRACKS.length;
  audio.src = encodeURI(TRACKS[currentTrack].src);
  seekInput.value = 0;
  document.querySelector('#music-time').textContent = '0:00';
  document.querySelector('#music-duration').textContent = '0:00';
  renderTracks();
  renderLyrics();
  if (autoplay) audio.play().catch(() => {});
  updatePlayButton();
}

if (audio && trackList) {
  selectTrack(0, false);
  trackList.addEventListener('click', event => {
    const btn = event.target.closest('[data-track]');
    if (!btn) return;
    const idx = Number(btn.dataset.track);
    if (idx === currentTrack) {
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
      updatePlayButton();
    } else {
      selectTrack(idx, true);
    }
  });
  toggleBtn.addEventListener('click', () => {
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
    updatePlayButton();
  });
  document.querySelector('#music-prev').addEventListener('click', () => selectTrack(currentTrack - 1, !audio.paused));
  document.querySelector('#music-next').addEventListener('click', () => selectTrack(currentTrack + 1, true));
  audio.addEventListener('loadedmetadata', () => {
    document.querySelector('#music-duration').textContent = formatTime(audio.duration);
  });
  audio.addEventListener('timeupdate', () => {
    document.querySelector('#music-time').textContent = formatTime(audio.currentTime);
    if (audio.duration) seekInput.value = Math.round((audio.currentTime / audio.duration) * 100);
    updateKaraoke(audio.currentTime);
  });
  karaokeBox?.addEventListener('click', event => {
    const line = event.target.closest('[data-lyric]');
    if (!line) return;
    audio.currentTime = Number(line.dataset.time) || 0;
    audio.play().catch(() => {});
  });
  audio.addEventListener('ended', () => selectTrack(currentTrack + 1, true));
  audio.addEventListener('play', () => {
    updatePlayButton();
    if (!karaokeRaf) karaokeRaf = requestAnimationFrame(tickKaraoke);
  });
  audio.addEventListener('pause', () => {
    updatePlayButton();
    if (karaokeRaf) { cancelAnimationFrame(karaokeRaf); karaokeRaf = null; }
  });
  lyricsDropdown?.addEventListener('toggle', () => {
    if (lyricsDropdown.open) updateKaraoke(audio.currentTime);
  });
  karaokeBox?.addEventListener('scroll', () => {
    if (Math.abs(karaokeBox.scrollTop - lastSetScroll) > 2) {
      manualOffset = karaokeBox.scrollTop - getAutoScroll(audio.currentTime);
      lastSetScroll = karaokeBox.scrollTop;
    }
  });
  seekInput.addEventListener('input', () => {
    if (audio.duration) {
      audio.currentTime = (Number(seekInput.value) / 100) * audio.duration;
      manualOffset = 0;
      updateKaraoke(audio.currentTime);
    }
  });
}