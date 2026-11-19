const STORAGE_KEY = 'bioaventura-progress-v1';
const ROUND_SIZE = 5;
const BADGES = [
  { id: 'first', name: 'Primer paso', detail: 'Completa tu primera misión', icon: 'flag', earned: state => state.games >= 1 },
  { id: 'correct', name: 'Mente curiosa', detail: 'Acierta 10 preguntas', icon: 'lightbulb', earned: state => state.correct >= 10 },
  { id: 'explorer', name: 'Explorador', detail: 'Completa 3 temas distintos', icon: 'compass', earned: state => state.topics.length >= 3 },
  { id: 'perfect', name: '¡Impecable!', detail: 'Completa una misión sin fallos', icon: 'medal', earned: state => state.perfect >= 1 },
  { id: 'expert', name: 'Gran experto', detail: 'Acierta 50 preguntas', icon: 'trophy', earned: state => state.correct >= 50 }
];

const defaultState = () => ({ score: 0, correct: 0, games: 0, perfect: 0, topics: [], badges: [] });
let state = loadState();
let round = null;
let studyTopic = null;

const quizDialog = document.querySelector('#quiz-dialog');
const quizContent = document.querySelector('#quiz-content');
const studyDialog = document.querySelector('#study-dialog');
const resetDialog = document.querySelector('#reset-dialog');

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== 'object') return defaultState();
    const number = value => Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
    return { score: number(saved.score), correct: number(saved.correct), games: number(saved.games), perfect: number(saved.perfect), topics: Array.isArray(saved.topics) ? saved.topics.filter(id => TOPICS.some(topic => topic.id === id)) : [], badges: Array.isArray(saved.badges) ? saved.badges.filter(id => BADGES.some(badge => badge.id === id)) : [] };
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
  document.querySelector('#topic-grid').innerHTML = TOPICS.map((topic, index) => `<article class="topic-card"><div class="topic-visual ${topic.color}"><span class="topic-number">0${index + 1}</span><i data-lucide="${topic.icon}"></i></div><h3>${topic.name}</h3><p>${topic.description}</p><div class="topic-actions"><button class="button topic-play" data-play="${topic.id}"><i data-lucide="play" fill="currentColor"></i> Jugar</button><button class="icon-button" data-study="${topic.id}" aria-label="Ver lámina de ${topic.name}" title="Ver lámina"><i data-lucide="book-open"></i></button></div></article>`).join('');
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
  quizContent.innerHTML = `<div class="result"><div class="result-icon"><i data-lucide="trophy"></i></div><span class="quiz-kicker">MISIÓN COMPLETADA</span><h2 id="quiz-title">¡Buen trabajo!</h2><p>${round.correct === round.questions.length ? '¡Has acertado todas! Sigue explorando.' : 'Cada intento te ayuda a aprender algo nuevo.'}</p><div class="result-stats"><div class="result-stat"><strong>${round.correct} / ${round.questions.length}</strong><span>ACIERTOS</span></div><div class="result-stat"><strong>${round.points > 0 ? '+' : ''}${round.points}</strong><span>PUNTOS</span></div></div>${newBadges.length ? `<p>¡Nuevo emblema: ${newBadges.map(badge => badge.name).join(', ')}!</p>` : ''}<div class="result-actions"><button class="button secondary" data-close-quiz>Volver a misiones</button><button class="button primary" data-replay><i data-lucide="rotate-ccw"></i> Jugar otra vez</button></div></div>`;
  icons();
}

document.querySelector('#topic-grid').addEventListener('click', event => {
  const play = event.target.closest('[data-play]');
  const study = event.target.closest('[data-study]');
  if (play) startRound(play.dataset.play);
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