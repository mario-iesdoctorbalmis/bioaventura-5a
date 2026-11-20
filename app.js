const STORAGE_KEY = 'bioaventura-progress-v1';
const LEADERBOARD_KEY = 'bioaventura-leaderboard-v1';
// Pega aquí la URL de tu Google Apps Script publicada como Aplicación web:
const SHEETS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbx7h_xT0fHbnq6Von21MfYG6pYEO8g_2dTkDDYsK-d5DqIwDjJ74IgI2_dx6Ll4jbZFzA/exec';
const ROUND_SIZE = 5;
const BADGES = [
  { id: 'first', name: 'Primer paso', detail: 'Completa tu primera misión', icon: 'flag', earned: state => state.games >= 1 },
  { id: 'correct', name: 'Mente curiosa', detail: 'Acierta 10 preguntas', icon: 'lightbulb', earned: state => state.correct >= 10 },
  { id: 'explorer', name: 'Explorador', detail: 'Completa 3 temas distintos', icon: 'compass', earned: state => state.topics.length >= 3 },
  { id: 'perfect', name: '¡Impecable!', detail: 'Completa una misión sin fallos', icon: 'medal', earned: state => state.perfect >= 1 },
  { id: 'expert', name: 'Gran experto', detail: 'Acierta 50 preguntas', icon: 'trophy', earned: state => state.correct >= 50 }
];

const defaultState = () => ({ playerName: '', playerPass: '', score: 0, correct: 0, games: 0, perfect: 0, topics: [], badges: [] });
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
    return { playerName: typeof saved.playerName === 'string' ? saved.playerName : '', playerPass: typeof saved.playerPass === 'string' ? saved.playerPass : '', score: number(saved.score), correct: number(saved.correct), games: number(saved.games), perfect: number(saved.perfect), topics: Array.isArray(saved.topics) ? saved.topics.filter(id => TOPICS.some(topic => topic.id === id)) : [], badges: Array.isArray(saved.badges) ? saved.badges.filter(id => BADGES.some(badge => badge.id === id)) : [] };
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

function updateBadges() {
  for (const badge of BADGES) {
    if (!state.badges.includes(badge.id) && badge.earned(state)) state.badges.push(badge.id);
  }
}

function renderDashboard() {
  document.querySelectorAll('[data-player-name]').forEach(el => el.textContent = state.playerName || 'Jugador');
  document.querySelectorAll('[data-score]').forEach(element => element.textContent = state.score);
  const level = Math.floor(state.score / 100) + 1;
  document.querySelectorAll('[data-level]').forEach(element => element.textContent = level);
  document.querySelector('[data-correct]').textContent = state.correct;
  document.querySelector('[data-next-level]').textContent = `${state.score % 100} / 100 puntos`;
  document.querySelector('#level-progress').style.width = `${state.score % 100}%`;
  document.querySelector('#badge-count').textContent = state.badges.length;
  document.querySelector('#badge-grid').innerHTML = BADGES.map(badge => `<div class="badge-card ${state.badges.includes(badge.id) ? 'unlocked' : ''}"><span class="badge-symbol"><i data-lucide="${badge.icon}"></i></span><div><strong>${badge.name}</strong><small>${state.badges.includes(badge.id) ? '¡Conseguido!' : badge.detail}</small></div></div>`).join('');
  icons();
}

function renderTopics() {
  document.querySelector('#topic-grid').innerHTML = TOPICS.map((topic, index) => `<article class="topic-card"><div class="topic-visual ${topic.color}"><span class="topic-number">0${index + 1}</span><i data-lucide="${topic.icon}"></i></div><h3>${topic.name}</h3><p>${topic.description}</p><div class="topic-actions"><button class="button topic-play" data-play="${topic.id}"><i data-lucide="play" fill="currentColor"></i> Jugar</button><button class="icon-button" data-diagram="${topic.id}" aria-label="Etiquetar dibujo de ${topic.name}" title="Etiquetar dibujo"><i data-lucide="move"></i></button><button class="icon-button" data-study="${topic.id}" aria-label="Ver lámina de ${topic.name}" title="Ver lámina"><i data-lucide="book-open"></i></button></div></article>`).join('');
  icons();
}

function startRound(topicId) {
  const pool = topicId ? QUESTIONS.filter(question => question.topic === topicId) : QUESTIONS;
  const questions = shuffle(pool).slice(0, ROUND_SIZE).map(question => ({ ...question, shuffledOptions: shuffle(question.options.map((text, index) => ({ text, correct: index === question.answer }))) }));
  round = { topicId, questions, index: 0, correct: 0, points: 0, answered: false };
  renderQuestion();
  if (!quizDialog.open) quizDialog.showModal();
}

function renderQuestion() {
  const question = round.questions[round.index];
  const topic = TOPICS.find(item => item.id === question.topic);
  round.answered = false;
  quizContent.innerHTML = `<div class="quiz-top"><div class="quiz-topic"><span class="quiz-topic-icon ${topic.color}"><i data-lucide="${topic.icon}"></i></span><span>${topic.name}</span></div><div class="quiz-meta"><span>${round.index + 1} / ${round.questions.length}</span><button class="icon-button" data-close-quiz aria-label="Salir de la misión" title="Salir"><i data-lucide="x"></i></button></div></div><div class="quiz-progress"><span style="width:${round.index / round.questions.length * 100}%"></span></div><span class="quiz-kicker">PREGUNTA ${round.index + 1}</span><h2 class="quiz-question" id="quiz-title">${question.q}</h2><div class="answers">${question.shuffledOptions.map((option, index) => `<button class="answer" data-answer="${index}"><span class="answer-letter">${String.fromCharCode(65 + index)}</span>${option.text}</button>`).join('')}</div><div id="feedback" aria-live="polite"></div><div class="quiz-bottom"><span>+10 por acierto · −5 por fallo</span><span>¡Tú puedes!</span></div>`;
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
  state.games++;
  if (round.correct === round.questions.length) state.perfect++;
  if (round.topicId && !state.topics.includes(round.topicId)) state.topics.push(round.topicId);
  const previousBadges = [...state.badges];
  updateBadges();
  const newBadges = BADGES.filter(badge => state.badges.includes(badge.id) && !previousBadges.includes(badge.id));
  saveState();
  renderDashboard();
  syncScoreToSheet();
  quizContent.innerHTML = `<div class="result"><div class="result-icon"><i data-lucide="trophy"></i></div><span class="quiz-kicker">MISIÓN COMPLETADA</span><h2 id="quiz-title">¡Buen trabajo!</h2><p>${round.correct === round.questions.length ? '¡Has acertado todas! Sigue explorando.' : 'Cada intento te ayuda a aprender algo nuevo.'}</p><div class="result-stats"><div class="result-stat"><strong>${round.correct} / ${round.questions.length}</strong><span>ACIERTOS</span></div><div class="result-stat"><strong>${round.points > 0 ? '+' : ''}${round.points}</strong><span>PUNTOS</span></div></div>${newBadges.length ? `<p>¡Nuevo emblema: ${newBadges.map(badge => badge.name).join(', ')}!</p>` : ''}<div class="result-actions"><button class="button secondary" data-close-quiz>Volver a misiones</button><button class="button primary" data-replay><i data-lucide="rotate-ccw"></i> Jugar otra vez</button></div></div>`;
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
    document.querySelector('#study-title').textContent = studyTopic.name;
    const image = document.querySelector('#study-image');
    image.src = studyTopic.image;
    image.alt = `Lámina original de ${studyTopic.name}`;
    document.querySelector('#study-image-link').href = studyTopic.image;
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

document.querySelector('#start-random').addEventListener('click', () => startRound(null));
document.querySelector('[data-close-study]').addEventListener('click', () => studyDialog.close());
document.querySelector('#study-play').addEventListener('click', () => { studyDialog.close(); startRound(studyTopic.id); });
document.querySelector('#reset-progress').addEventListener('click', () => resetDialog.showModal());
document.querySelectorAll('[data-cancel-reset]').forEach(button => button.addEventListener('click', () => resetDialog.close()));
document.querySelector('#confirm-reset').addEventListener('click', () => { state = defaultState(); saveState(); renderDashboard(); resetDialog.close(); });

renderTopics();
renderDashboard();

function startDiagram(topicId) {
  const data = DIAGRAMS[topicId];
  const topic = TOPICS.find(item => item.id === topicId);
  if (!data || !topic) return;
  diagramState = { topicId, placed: new Set(), selectedLabel: null, total: data.zones.length };
  const shuffledLabels = shuffle(data.zones);
  diagramContent.innerHTML = `
    <div class="quiz-top">
      <div class="quiz-topic"><span class="quiz-topic-icon ${topic.color}"><i data-lucide="${topic.icon}"></i></span><span>${data.title}</span></div>
      <div class="quiz-meta"><span id="diagram-count">0 / ${data.zones.length}</span><button class="icon-button" data-close-diagram aria-label="Cerrar" title="Cerrar"><i data-lucide="x"></i></button></div>
    </div>
    <p class="diagram-instruction">${data.instruction} <small>(También puedes pulsar una etiqueta y luego su círculo).</small></p>
    <div class="diagram-layout">
      <div class="diagram-stage">
        ${data.image ? `<img src="${data.image}" alt="${data.title}">` : `<svg viewBox="${data.viewBox}" role="img" aria-label="${data.title}">${data.svg}</svg>`}
        ${data.zones.map((zone, i) => `<button type="button" class="drop-zone" data-zone="${zone.id}" style="left:${zone.x}%;top:${zone.y}%" aria-label="Zona ${i + 1}">${i + 1}</button>`).join('')}
      </div>
      <div class="label-bank" id="label-bank">
        ${shuffledLabels.map(zone => `<button type="button" class="drag-label" draggable="true" data-label="${zone.id}">${zone.label}</button>`).join('')}
      </div>
    </div>
    <div id="diagram-feedback" class="diagram-feedback" aria-live="polite"></div>
  `;
  icons();
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
      feedback.className = 'diagram-feedback ok';
      feedback.textContent = '¡Genial! Has colocado todas las etiquetas en su sitio (+5 pts por cada una).';
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
        if (state.playerName) {
          const match = data.find(r => String(r.nombre || '').toLowerCase() === state.playerName.toLowerCase());
          if (match && Number(match.puntos) > state.score) {
            state.score = Number(match.puntos);
            state.correct = Math.max(state.correct, Number(match.aciertos) || 0);
            state.games = Math.max(state.games, Number(match.partidas) || 0);
            updateBadges();
            saveState();
            renderDashboard();
          }
        }
      }
    }
  } catch {} finally {
    if (loadingDialog.open) loadingDialog.close();
  }
}

function renderLeaderboard(rows) {
  const container = document.querySelector('#leaderboard-list');
  if (!container) return;
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
          errorEl.textContent = 'Contraseña incorrecta para este usuario.';
          return;
        }
        if (check.status === 'ok') {
          state = { ...defaultState(), playerName: name, playerPass: pass, score: check.puntos || 0, correct: check.aciertos || 0, games: check.partidas || 0 };
          updateBadges();
          saveState();
          renderDashboard();
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
  loadLeaderboard();
  playerDialog.close();
});
document.querySelector('#refresh-leaderboard').addEventListener('click', loadLeaderboard);

loadLeaderboard();
if (!state.playerName) playerDialog.showModal();