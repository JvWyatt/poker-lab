/* ============================================================================
   5. MÓDULO: ACADEMIA 2.0 — PROTOTIPO DE RUTA POR PANTALLAS
   Mapa (12 clases / 5 módulos) → vista de clase a pantalla completa →
   5 pasos fijos por clase. Tres formatos:
     exhibit = mostrar con revelación guiada, sin preguntas
     duel    = enfrentar 5 cartas contra 5 cartas
     case    = caso fijo con decisión real y 5 ejemplos
   Prototipo jugable: clases 1, 3 y 6. El resto aparece "En preparación".
============================================================================ */
const SUIT_SYMBOL = { s: '♠', h: '♥', d: '♦', c: '♣' };
const RED_SUITS = new Set(['h', 'd']);

const MODULES = [
  { id: 0, name: 'Cero absoluto', subtitle: 'Sin saber nada', tone: 'sky' },
  { id: 1, name: 'Mecánica de la mesa', subtitle: 'Ciegas, orden y acciones', tone: 'emerald' },
  { id: 2, name: 'Números', subtitle: 'Probabilidades y equity', tone: 'amber' },
  { id: 3, name: 'Táctica', subtitle: 'Posición, boards y tamaños', tone: 'orange' },
  { id: 4, name: 'Estrategia', subtitle: 'Faroles, GTO y explotación', tone: 'purple' }
];

const FORMAT_LABEL = { exhibit: 'Mostrar', duel: 'Duelo', case: '5 casos' };
const FORMAT_ICON = { exhibit: '👀', duel: '⚔️', case: '🎯' };

const E = (title, table, lines, revealCount, showdown = null) => ({ kind: 'exhibit', title, table, lines, revealCount, showdown });
const D = (title, board, hands, winner, why) => ({ kind: 'duel', title, board, hands, winner, why });
const O = (key, label, correct, feedback) => ({ key, label, correct, feedback });
const K = (prompt, table, options) => ({ kind: 'case', prompt, table, options });

const flopTable = (over = {}) => ({
  street: 'FLOP',
  board: [],
  pot: 100,
  bet: 0,
  heroPos: 'BTN',
  villainPos: 'BB',
  villainAction: 'Pasa (Check)',
  ...over
});
const turnTable = over => flopTable({ street: 'TURN', ...over });
const riverTable = over => flopTable({ street: 'RIVER', ...over });

const HEART_OUTS = ['2h', '3h', '4h', '6h', '7h', 'Th', 'Jh', 'Qh', 'Kh'];
const STRAIGHT_8_OUTS = ['5s', '5h', '5d', '5c', 'Ts', 'Th', 'Td', 'Tc'];
const GUTSHOT_4_OUTS = ['5s', '5h', '5d', '5c'];

const BASE_BOARD = ['Ks', 'Qd', '7s', '2c', '9h'];

/* ---------------------------------------------------------------------------
   CURRÍCULUM: 12 clases. Sólo las marcadas con `steps` son jugables en este
   prototipo. Las demás son tarjetas visuales del mapa ("En preparación").
--------------------------------------------------------------------------- */
const LESSONS_DATA = [
  {
    id: 'fundamentos', number: 1, module: 0, format: 'exhibit',
    title: '2 cartas + 5 comunitarias',
    subtitle: 'Cómo se forma una mano de 5',
    steps: [
      E('Tus 2 cartas privadas',
        { street: 'PREFLOP', board: [], pot: 3, hero: ['As', '7d'], villain: null, villainHidden: true, heroPos: 'BTN', villainPos: 'BB', villainAction: 'Ciegas 1 / 2', note: 'Sólo tú ves A♠ 7♦' },
        [
          'En Texas Hold’em cada jugador recibe 2 cartas privadas: son tuyas, nadie más las ve.',
          'Con A♠ 7♦ ya tienes una carta alta y un posible proyecto, pero todavía no puedes ganar.',
          'Faltan las cartas comunitarias, que se pondrán boca arriba sobre la mesa.'
        ], 0),
      E('El Flop: 3 cartas comunitarias',
        { street: 'FLOP', board: BASE_BOARD, pot: 40, hero: ['As', '7d'], villain: ['Kh', 'Qc'], villainProfile: 'TAG', villainAction: 'Pasa (Check)', note: 'Ahora hay 5 cartas visibles' },
        [
          'Tras la primera ronda de apuestas se revelan 3 cartas comunitarias: K♠ Q♦ 7♠.',
          'Éstas son de todos: el rival puede usarlas igual que tú.',
          'Con tus 2 cartas y 3 comunitarias ya puedes elegir 5 cartas, pero aún faltan 2.'
        ], 3),
      E('El Turn: 4ª comunitaria',
        { street: 'TURN', board: BASE_BOARD, pot: 80, hero: ['As', '7d'], villain: ['Kh', 'Qc'], villainProfile: 'TAG', villainAction: 'Pasa (Check)', note: '4 cartas sobre la mesa' },
        [
          'La cuarta carta comunitaria es el Turn: 2♣.',
          'La mesa crece y también cambia la fuerza de tu mano: ahora tienes un par de 7s.',
          'Después de esta ronda vendrá una última carta.'
        ], 4),
      E('El River: 5ª y última comunitaria',
        { street: 'RIVER', board: BASE_BOARD, pot: 140, hero: ['As', '7d'], villain: ['Kh', 'Qc'], villainProfile: 'TAG', villainAction: 'Pasa (Check)', note: 'Ya no quedan cartas por venir' },
        [
          'La quinta carta comunitaria es el River: 9♥. Ya no viene ninguna carta más.',
          'Cada jugador tiene 7 cartas disponibles, pero debe formar la mejor mano posible de 5.',
          'Esa es la regla central: 2 propias + 5 comunitarias → mejor combinación de 5.'
        ], 5),
      E('Así se decide el ganador',
        { street: 'SHOWDOWN', board: BASE_BOARD, pot: 140, hero: ['As', '7d'], villain: ['Kh', 'Qc'], note: 'Compara las mejores 5 cartas' },
        [
          'En el showdown se comparan las mejores 5 cartas de cada jugador.',
          'El evaluador elige automáticamente la mejor combinación de 5 entre las 7 disponibles.',
          'Gana el tipo de mano más alto; si hay empate, se comparan los kickers.'
        ], 5, {
          board: BASE_BOARD,
          hands: [{ label: 'TÚ', cards: ['As', '7d'] }, { label: 'RIVAL', cards: ['Kh', 'Qc'] }],
          winner: 'B',
          why: 'Tú tienes una pareja de 7s. El rival tiene doble pareja: Reyes y Reinas, con 9 de kicker. El doble pareja supera siempre a una sola pareja. Esta comparación directa es el tema de la clase 3.'
        })
    ]
  },
  { id: 'ranking', number: 2, module: 0, format: 'exhibit', title: 'Ranking de manos', subtitle: 'De carta alta a escalera real', steps: null },
  {
    id: 'duelos', number: 3, module: 0, format: 'duel',
    title: 'Duelos de 5 cartas', subtitle: 'Cuál gana y por qué',
    steps: [
      D('Duelo 1 · Par de Ases contra par de Reyes', ['Qc', 'Jd', '7s', '2c', '9h'],
        [{ label: 'MANO A', cards: ['As', 'Ad'] }, { label: 'MANO B', cards: ['Ks', 'Kd'] }], 'A',
        'Ambas son una pareja. Gana la del par más alto: Ases por encima de Reyes. Los kickers no se miran cuando el par ya es distinto.'),
      D('Duelo 2 · El segundo par decide', ['Ac', 'Ad', '7h', '2c', '9s'],
        [{ label: 'MANO A', cards: ['Qs', 'Qd'] }, { label: 'MANO B', cards: ['Ks', 'Kd'] }], 'B',
        'Las dos forman doble pareja con los Ases del board. Se decide por el segundo par: Reyes superan Reinas.'),
      D('Duelo 3 · Trío contra doble pareja', ['Ac', 'Ad', '7s', '2c', '9h'],
        [{ label: 'MANO A', cards: ['As', '5d'] }, { label: 'MANO B', cards: ['Ks', 'Kd'] }], 'A',
        'El board trae A♣ A♦. La Mano A completa trío de Ases; la Mano B completa doble pareja de Ases y Reyes. Tres cartas iguales valen más que dos pares: gana el trío.'),
      D('Duelo 4 · Escalera contra trío', ['5c', '6d', '7h', '2c', '9s'],
        [{ label: 'MANO A', cards: ['7s', '7d'] }, { label: 'MANO B', cards: ['8s', '4d'] }], 'B',
        '5-6-7-8-9 es escalera y una escalera supera siempre al trío, aunque el trío sean Sietes.'),
      D('Duelo 5 · Color contra escalera', ['9s', '8s', '2c', '7s', 'Kd'],
        [{ label: 'MANO A', cards: ['As', '3s'] }, { label: 'MANO B', cards: ['Tc', 'Jd'] }], 'A',
        'A♠ 3♠ con 9♠ 8♠ 7♠ forma color. El color está un escalón por encima de la escalera 7-8-9-T-J.')
    ]
  },
  { id: 'posiciones', number: 4, module: 1, format: 'exhibit', title: 'Posiciones, ciegas y rondas', subtitle: 'Quién habla y cuándo', steps: null },
  { id: 'acciones', number: 5, module: 1, format: 'case', title: 'Acciones básicas', subtitle: 'Check, Call, Bet, Raise, Fold', steps: null },
  {
    id: 'pot_odds', number: 6, module: 2, format: 'case',
    title: 'Pot Odds', subtitle: 'Cuándo pagar según el precio',
    steps: [
      K('Bote 100, apuesta 50 y 9 outs de color', flopTable({ board: ['9h', '8h', '2c'], pot: 100, bet: 50, hero: ['Ah', '5h'], villain: ['Kd', 'Qd'], villainProfile: 'TAG', villainAction: 'Apuesta 50', outCards: HEART_OUTS, note: '9 outs · necesitas 25%, tienes ~35%' }), [
        O('call', 'Pagar 50', true, 'Correcto. 50 / (100 + 50 + 50) = 25%. Tu color liga ~35%, así que el call gana fichas a largo plazo.'),
        O('fold', 'Retirarte', false, 'Te sobra margen: 35% de equity contra 25% de pot odds. Foldear aquí tira una decisión rentable.'),
        O('raise', 'Subir con el proyecto', false, 'La decisión básica y segura con esos outs es pagar. Subir añade riesgo sin mejorar el precio.')
      ]),
      K('Gutshot en Turn, apuesta 100', turnTable({ board: ['9d', '6c', '2h', '3s'], pot: 100, bet: 100, hero: ['8s', '7s'], villain: ['Ah', 'Kd'], villainAction: 'Apuesta 100', outCards: GUTSHOT_4_OUTS, note: '4 outs · necesitas 33%, tienes ~9%' }), [
        O('fold', 'Retirarte', true, 'Correcto. 100 / (100 + 100 + 100) = 33%. Con una carta por venir y 4 outs tienes ~9%.'),
        O('call', 'Pagar 100', false, 'Pagar 100 con 9% de equity contra 33% de pot odds es perder fichas cada vez.'),
        O('raise', 'Subir', false, 'No hay fold equity suficiente para compensar: te costaría caro y tus outs son pocos.')
      ]),
      K('Gutshot en Flop, apuesta pequeña', flopTable({ board: ['9d', '6c', '2h'], pot: 100, bet: 20, hero: ['8s', '7s'], villain: ['Ah', 'Kd'], villainAction: 'Apuesta 20', outCards: GUTSHOT_4_OUTS, note: '4 outs · necesitas 14%, tienes ~16%' }), [
        O('call', 'Pagar 20', true, 'Correcto. 20 / (100 + 20 + 20) = 14,3%. Con dos cartas por venir, 4 outs valen ~16%: el call es rentable.'),
        O('fold', 'Retirarte', false, 'El precio es barato: 16% de equity supera el 14,3% exigido.'),
        O('raise', 'Subir', false, 'Con un gutshot débil, subir no mejora tu decisión: paga barato y espera el Turn.')
      ]),
      K('Color en Turn, apuesta 100', turnTable({ board: ['9h', '8h', '2c', '4d'], pot: 100, bet: 100, hero: ['Ah', '5h'], villain: ['Kd', 'Qd'], villainAction: 'Apuesta 100', outCards: HEART_OUTS, note: '9 outs · necesitas 33%, tienes ~20%' }), [
        O('fold', 'Retirarte', true, 'Correcto. En Turn sólo queda una carta: 9 outs valen ~20%, pero debes pagar 100 para un bote de 300 (33%).'),
        O('call', 'Pagar 100', false, 'El color es buen proyecto, pero el precio es malo: 20% de equity no cubre 33% de pot odds.'),
        O('raise', 'Subir', false, 'Sin fold equity suficiente, subir con un proyecto que liga pocas veces es -EV.')
      ]),
      K('Ocho outs de escalera, apuesta 40', flopTable({ board: ['9d', '6c', '2h'], pot: 100, bet: 40, hero: ['8s', '7s'], villain: ['Ah', 'Kd'], villainAction: 'Apuesta 40', outCards: STRAIGHT_8_OUTS, note: '8 outs · necesitas 22%, tienes ~32%' }), [
        O('call', 'Pagar 40', true, 'Correcto. 40 / (100 + 40 + 40) = 22%. Con 8 outs y dos cartas por venir tienes ~32%: sobra margen.'),
        O('fold', 'Retirarte', false, 'Tienes casi 10 puntos porcentuales de ventaja sobre las pot odds: pagar es claro.'),
        O('raise', 'Subir', false, 'La decisión correcta es pagar; subir con un proyecto sin completar añade riesgo innecesario.')
      ])
    ]
  },
  { id: 'outs', number: 7, module: 2, format: 'case', title: 'Outs y regla del 4 y del 2', subtitle: 'Estima tu equity en segundos', steps: null },
  { id: 'posicion', number: 8, module: 3, format: 'case', title: 'Ventaja de posición', subtitle: 'IP vs OOP', steps: null },
  { id: 'cbet', number: 9, module: 3, format: 'case', title: 'C-Bet según textura', subtitle: 'Boards secos y mojados', steps: null },
  { id: 'spr', number: 10, module: 3, format: 'case', title: 'SPR y compromiso', subtitle: 'Cuánto vale una pareja', steps: null },
  { id: 'semibluff', number: 11, module: 4, format: 'case', title: 'Semi-farol y bloqueadores', subtitle: 'Dos formas de ganar', steps: null },
  { id: 'gto', number: 12, module: 4, format: 'case', title: 'GTO y explotación', subtitle: 'Frecuencias y perfiles', steps: null }
];

/* ---------------------------------------------------------------------------
   ACADEMIA — controlador de mapa, clases y pasos
--------------------------------------------------------------------------- */
const academia = {
  activeLessonId: null,
  activeStepIndex: 0,
  lastAnswer: null,

  init() {
    const v2 = appState.academia.v2;
    const stored = LESSONS_DATA.find(l => l.id === v2.activeLessonId);
    this.activeLessonId = stored && this.isPlayable(stored) ? stored.id : LESSONS_DATA[0].id;
    this.activeStepIndex = Math.max(0, Math.min(5, Number(v2.activeStepIndex) || 0));
    this.persist();
    window.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const academiaVisible = !document.getElementById('view-academia')?.classList.contains('hidden');
      if (academiaVisible && appState.academia.v2.view === 'lesson') {
        event.preventDefault();
        this.closeLesson();
      }
    });
  },

  persist() {
    const v2 = appState.academia.v2;
    v2.activeLessonId = this.activeLessonId;
    v2.activeStepIndex = this.activeStepIndex;
    saveState();
  },

  currentLesson() {
    return LESSONS_DATA.find(l => l.id === this.activeLessonId) || LESSONS_DATA[0];
  },

  isPlayable(lesson) {
    return Array.isArray(lesson.steps) && lesson.steps.length === 5;
  },

  progressOf(lessonId) {
    const lesson = LESSONS_DATA.find(l => l.id === lessonId);
    if (!lesson || !this.isPlayable(lesson)) return 0;
    if (appState.academia.completedIds.includes(lessonId)) return 5;
    const value = Number(appState.academia.v2.stepProgress[lessonId]) || 0;
    return Math.max(0, Math.min(5, Math.floor(value)));
  },

  currentStep() {
    const lesson = this.currentLesson();
    return lesson.steps ? lesson.steps[this.activeStepIndex] : null;
  },

  cardHTML(code, extraClass = '') {
    const cardId = PokerEngine.codeToCard(code);
    if (cardId === null || cardId === undefined) return '';
    const card = PokerEngine.cardToObj(cardId);
    if (!card) return '';
    const symbol = SUIT_SYMBOL[card.suit] || card.suit;
    const rank = card.rank === 'T' ? '10' : card.rank;
    const tone = RED_SUITS.has(card.suit) ? 'text-rose-500' : 'text-slate-900';
    return `<div class="acad-card ${tone} ${extraClass}" title="${rank}${symbol}"><span class="acad-card-rank">${rank}</span><span class="acad-card-suit">${symbol}</span></div>`;
  },

  bestFive(codes) {
    const cards = codes.map(c => PokerEngine.codeToCard(c));
    let best = null;
    for (let a = 0; a < 3; a++) for (let b = a + 1; b < 4; b++) for (let c = b + 1; c < 5; c++)
      for (let d = c + 1; d < 6; d++) for (let e = d + 1; e < 7; e++) {
        const idx = [a, b, c, d, e];
        const ev = PokerEngine.evaluateHand(idx.map(i => cards[i]));
        if (!best || ev.score > best.ev.score) best = { cards: idx.map(i => codes[i]), ev };
      }
    return best;
  },

  /* ---------------- Mapa ---------------- */
  render() {
    const map = document.getElementById('academia-list');
    const shell = document.getElementById('academia-workspace');
    if (!map || !shell) return;
    const inLesson = appState.academia.v2.view === 'lesson' && this.isPlayable(this.currentLesson());
    document.body.classList.toggle('is-acad-lesson', inLesson);
    map.classList.toggle('hidden', inLesson);
    shell.classList.toggle('hidden', !inLesson);
    document.getElementById('academia-map-header')?.classList.toggle('hidden', inLesson);
    if (inLesson) this.renderLesson();
    else this.renderMap();
  },

  renderMap() {
    const map = document.getElementById('academia-list');
    if (!map) return;
    const resume = document.getElementById('acad-resume');
    const last = LESSONS_DATA.find(l => l.id === appState.academia.v2.activeLessonId);
    if (resume) {
      const hasProgress = last && this.isPlayable(last) && this.progressOf(last.id) > 0;
      resume.classList.toggle('hidden', !hasProgress);
      if (hasProgress) resume.textContent = `Continuar · Clase ${last.number}: ${last.title} →`;
    }

    const playable = LESSONS_DATA.filter(l => this.isPlayable(l)).length;
    map.innerHTML = `
      <div class="mb-5 flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
        <span class="px-2.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">Prototipo · ${playable} clases jugables</span>
        <span class="px-2.5 py-1 rounded-full border border-slate-700 bg-slate-900">12 clases · 5 módulos</span>
        <span class="px-2.5 py-1 rounded-full border border-slate-700 bg-slate-900">5 pasos por clase · sin scroll infinito</span>
      </div>
      ${MODULES.map(mod => {
        const lessons = LESSONS_DATA.filter(l => l.module === mod.id);
        return `
          <section class="acad-module mb-4">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div class="flex items-center gap-2">
                <span class="acad-module-num">0${mod.id}</span>
                <h3 class="text-sm font-extrabold text-white">${mod.name}</h3>
                <span class="text-[11px] text-slate-500 hidden sm:inline">${mod.subtitle}</span>
              </div>
              <span class="text-[10px] font-mono text-slate-500">${lessons.length} CLASES</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
              ${lessons.map(l => {
                const ready = this.isPlayable(l);
                const done = this.progressOf(l.id);
                const dots = [0, 1, 2, 3, 4].map(i => `<i class="acad-map-dot ${i < done ? 'is-done' : ''}"></i>`).join('');
                const status = !ready ? 'EN PREPARACIÓN' : done === 5 ? 'COMPLETA' : done ? `${done}/5` : 'EMPEZAR';
                const click = ready ? `onclick="academia.openLesson('${l.id}')"` : '';
                return `
                  <button ${click} ${ready ? '' : 'disabled'} class="acad-lesson-card ${ready ? '' : 'is-locked'}">
                    <div class="flex items-center justify-between gap-2 mb-2">
                      <span class="acad-lesson-num">${String(l.number).padStart(2, '0')}</span>
                      <span class="acad-format-pill">${FORMAT_ICON[l.format]} ${FORMAT_LABEL[l.format]}</span>
                    </div>
                    <h4 class="text-left text-sm font-bold text-white leading-snug">${l.title}</h4>
                    <p class="text-left text-[11px] text-slate-400 mt-1 leading-snug">${l.subtitle}</p>
                    <div class="flex items-center justify-between gap-2 mt-3">
                      <div class="flex gap-1">${dots}</div>
                      <span class="text-[10px] font-mono ${ready ? 'text-emerald-300' : 'text-slate-600'}">${status}</span>
                    </div>
                  </button>
                `;
              }).join('')}
            </div>
          </section>
        `;
      }).join('')}
    `;
  },

  /* ---------------- Navegación de clase ---------------- */
  openLesson(id) {
    const lesson = LESSONS_DATA.find(l => l.id === id);
    if (!lesson || !this.isPlayable(lesson)) return;
    SoundFX.playSelect();
    this.activeLessonId = id;
    this.activeStepIndex = Math.min(this.progressOf(id), 5);
    this.lastAnswer = null;
    appState.academia.v2.view = 'lesson';
    this.persist();
    this.render();
  },

  closeLesson() {
    SoundFX.playClick();
    appState.academia.v2.view = 'map';
    this.persist();
    this.render();
  },

  resume() {
    const lesson = LESSONS_DATA.find(l => l.id === appState.academia.v2.activeLessonId);
    this.openLesson(lesson && this.isPlayable(lesson) ? lesson.id : 'fundamentos');
  },

  goStep(index) {
    const lesson = this.currentLesson();
    const target = Number(index);
    if (!Number.isInteger(target) || target < 0 || target > 5) return;
    if (target > this.progressOf(lesson.id)) return;
    SoundFX.playClick();
    this.activeStepIndex = target;
    this.lastAnswer = null;
    this.persist();
    this.renderLesson();
  },

  next() {
    const lesson = this.currentLesson();
    if (this.activeStepIndex < 5) this.goStep(this.activeStepIndex + 1);
    else this.closeLesson();
  },

  prev() {
    if (this.activeStepIndex > 0) this.goStep(this.activeStepIndex - 1);
  },

  acknowledge() {
    const lesson = this.currentLesson();
    this.completeStep(lesson, true);
    this.next();
  },

  answer(key) {
    const lesson = this.currentLesson();
    const step = this.currentStep();
    if (!step) return;
    if (step.kind === 'duel') return this.answerDuel(key);
    if (!step.options) return;
    const opt = step.options.find(o => o.key === key);
    if (!opt) return;
    this.lastAnswer = { lessonId: lesson.id, stepIndex: this.activeStepIndex, option: opt };
    if (opt.correct) this.completeStep(lesson, false);
    else SoundFX.playLessonWrong();
    this.renderLesson();
  },

  answerDuel(key) {
    const lesson = this.currentLesson();
    const step = this.currentStep();
    if (!step || step.kind !== 'duel' || (key !== 'A' && key !== 'B')) return;
    const opt = {
      key,
      label: key === 'A' ? 'Mano A' : 'Mano B',
      correct: key === step.winner,
      feedback: step.why
    };
    this.lastAnswer = { lessonId: lesson.id, stepIndex: this.activeStepIndex, option: opt };
    if (opt.correct) this.completeStep(lesson, false);
    else SoundFX.playLessonWrong();
    this.renderLesson();
  },

  completeStep(lesson, silent) {
    if (this.activeStepIndex >= this.progressOf(lesson.id)) {
      appState.academia.v2.stepProgress[lesson.id] = this.activeStepIndex + 1;
      if (this.activeStepIndex + 1 >= 5 && !appState.academia.completedIds.includes(lesson.id)) {
        appState.academia.completedIds.push(lesson.id);
        showToast('Clase completada · ruta desbloqueada', 'success');
      }
      saveState();
    }
    if (!silent) SoundFX.playLessonCorrect();
    else SoundFX.playClick();
  },

  nextPlayableLesson() {
    const idx = LESSONS_DATA.findIndex(l => l.id === this.activeLessonId);
    for (let i = idx + 1; i < LESSONS_DATA.length; i++) {
      if (this.isPlayable(LESSONS_DATA[i])) return LESSONS_DATA[i];
    }
    return null;
  },

  /* ---------------- Render de la clase ---------------- */
  renderLesson() {
    const shell = document.getElementById('academia-workspace');
    if (!shell) return;
    const lesson = this.currentLesson();
    const mod = MODULES[lesson.module];
    const index = this.activeStepIndex;
    const progress = this.progressOf(lesson.id);
    const solved = index < progress;

    const dots = [0, 1, 2, 3, 4].map(i => {
      const state = i < progress ? 'done' : i === index ? 'active' : 'todo';
      const click = i <= progress ? `onclick="academia.goStep(${i})"` : 'disabled';
      return `<button ${click} class="acad-step-dot" data-state="${state}" title="Paso ${i + 1}">${i + 1}</button>`;
    }).join('');

    const head = `
      <div class="acad-shell-head">
        <button onclick="academia.closeLesson()" class="acad-back">← Ruta</button>
        <div class="min-w-0 flex-1 text-center">
          <div class="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Módulo 0${mod.id} · ${mod.name}</div>
          <div class="text-sm sm:text-base font-extrabold text-white truncate">Clase ${lesson.number} · ${lesson.title}</div>
        </div>
        <div class="flex flex-col items-end gap-1">
          <span class="text-[10px] font-mono text-slate-400">${index === 5 ? 'RESUMEN' : `PASO ${index + 1} / 5`}</span>
          <div class="flex gap-1">${dots}</div>
        </div>
      </div>
    `;

    let body;
    let footNext = '';
    if (index === 5) {
      body = this.renderSummary(lesson);
      footNext = `<button onclick="academia.closeLesson()" class="acad-next">Volver a la ruta →</button>`;
    } else {
      const step = lesson.steps[index];
      body = `
        <div class="acad-step-title">${step.title || step.prompt}</div>
        ${step.kind === 'exhibit' ? this.renderExhibit(step, solved) : ''}
        ${step.kind === 'duel' ? this.renderDuel(step, solved) : ''}
        ${step.kind === 'case' ? this.renderCase(step, solved) : ''}
      `;
      if (solved) {
        footNext = `<button onclick="academia.next()" class="acad-next">${index === 4 ? 'Ver resumen →' : 'Siguiente paso →'}</button>`;
      } else if (step.kind === 'exhibit') {
        footNext = `<button onclick="academia.acknowledge()" class="acad-next">Entendido →</button>`;
      } else {
        footNext = `<span class="text-[11px] font-mono text-slate-500">Elige una opción ↑</span>`;
      }
    }

    shell.innerHTML = `
      <div class="acad-shell">
        ${head}
        <div class="acad-shell-body">${body}</div>
        <div class="acad-shell-foot">
          <button onclick="academia.prev()" ${index === 0 ? 'disabled' : ''} class="acad-prev">← Anterior</button>
          <span class="text-[10px] font-mono text-slate-500 hidden sm:inline">${FORMAT_ICON[lesson.format]} ${FORMAT_LABEL[lesson.format]}</span>
          ${footNext}
        </div>
      </div>
    `;
  },

  renderExhibit(step, solved) {
    const cards = step.showdown
      ? this.renderDuel(step.showdown, solved, true)
      : this.renderFelt(step.table, { revealCount: step.revealCount, showVillain: !step.table.villainHidden });
    return `
      ${cards}
      <div class="acad-lines">
        ${step.lines.map((line, i) => `<p class="acad-line"><span>${i + 1}</span>${line}</p>`).join('')}
      </div>
    `;
  },

  renderDuel(spec, solved = false, embedded = false) {
    const evals = spec.hands.map(h => this.bestFive([...h.cards, ...spec.board]));
    const winnerIndex = spec.winner === 'A' ? 0 : 1;
    const revealed = solved || !!embedded;
    const handHTML = (h, i) => {
      const win = i === winnerIndex;
      return `
        <div class="acad-duel-hand ${revealed && win ? 'is-winner' : ''} ${revealed && !win ? 'is-loser' : ''}">
          <div class="text-[10px] font-mono uppercase tracking-widest ${i === 0 ? 'text-emerald-300' : 'text-amber-300'} mb-1.5">${h.label}</div>
          <div class="acad-duel-cards">${revealed ? evals[i].cards.map(c => this.cardHTML(c)).join('') : h.cards.map(c => this.cardHTML(c)).join('') + '<span class="text-slate-500 text-xs self-center ml-1">+ board</span>'}</div>
          <div class="text-[11px] font-bold mt-2 ${revealed && win ? 'text-emerald-300' : 'text-slate-300'}">${revealed ? evals[i].ev.name : '2 cartas + board'}</div>
          ${revealed && win ? '<div class="text-[10px] font-mono text-emerald-400 mt-1">✓ GANADOR</div>' : ''}
        </div>
      `;
    };
    const answer = this.lastAnswer && this.lastAnswer.stepIndex === this.activeStepIndex ? this.lastAnswer.option : null;
    return `
      <div class="acad-duel ${embedded ? 'acad-duel--embed' : ''}">
        <div class="acad-duel-board">
          <span class="acad-duel-board-label">BOARD · 5 COMUNITARIAS</span>
          <div class="flex flex-wrap justify-center gap-1">${spec.board.map(c => this.cardHTML(c)).join('')}</div>
        </div>
        ${handHTML(spec.hands[0], 0)}
        <div class="acad-duel-vs">VS</div>
        ${handHTML(spec.hands[1], 1)}
      </div>
      ${revealed ? `<div class="acad-why">${spec.why}</div>` : ''}
      ${!embedded && !revealed ? `
        <div class="acad-actions">
          <button onclick="academia.answer('A')" class="acad-action">Elegir Mano A</button>
          <button onclick="academia.answer('B')" class="acad-action">Elegir Mano B</button>
        </div>
      ` : ''}
      ${!embedded && answer ? this.renderFeedback(answer, !!answer.correct) : ''}
    `;
  },

  renderCase(step, solved) {
    const answer = this.lastAnswer && this.lastAnswer.stepIndex === this.activeStepIndex ? this.lastAnswer.option : null;
    const label = { bet: 'Apostar / Subir', raise: 'Apostar / Subir', call: 'Pasar / Pagar', check: 'Pasar / Pagar', fold: 'Retirarse' };
    const order = { bet: 0, raise: 0, call: 1, check: 1, fold: 2 };
    const options = [...step.options].sort((a, b) => (order[a.key] ?? 9) - (order[b.key] ?? 9));
    return `
      ${this.renderFelt(step.table)}
      ${!solved ? `
        <div class="acad-actions">
          ${options.map(opt => `
            <button onclick="academia.answer('${opt.key}')" class="acad-action ${opt.key === 'fold' ? 'acad-action--danger' : opt.key === 'call' ? '' : 'acad-action--primary'}">
              ${label[opt.key] || opt.label}
            </button>
          `).join('')}
        </div>
      ` : ''}
      ${answer ? this.renderFeedback(answer, solved) : ''}
    `;
  },

  renderFelt(table, opts = {}) {
    const reveal = opts.revealCount === undefined ? table.board.length : opts.revealCount;
    const board = table.board || [];
    const slots = [0, 1, 2, 3, 4].map(i => {
      if (i < reveal && board[i]) {
        const street = i < 3 ? 'FLOP' : i === 3 ? 'TURN' : 'RIVER';
        return `<div class="acad-slot"><div class="acad-slot-label">${street}</div>${this.cardHTML(board[i], 'acad-card--reveal')}</div>`;
      }
      return `<div class="acad-slot"><div class="acad-slot-label">${i < 3 ? 'FLOP' : i === 3 ? 'TURN' : 'RIVER'}</div><div class="acad-empty"></div></div>`;
    }).join('');
    const hero = table.hero || [];
    const villain = table.villain || [];
    return `
      <div class="acad-felt">
        <div class="acad-seat acad-seat--villain">
          <div>
            <div class="text-[10px] font-mono uppercase tracking-widest text-slate-400">RIVAL ${table.villainProfile ? `· ${table.villainProfile}` : ''} ${table.villainPos ? `· ${table.villainPos}` : ''}</div>
            <div class="text-[11px] text-amber-300 font-semibold mt-0.5">${table.villainAction || '—'}</div>
          </div>
          <div class="flex gap-1">${opts.showVillain === false || table.villainHidden ? '<div class="acad-card-back"></div><div class="acad-card-back"></div>' : villain.map(c => this.cardHTML(c)).join('')}</div>
        </div>

        <div class="acad-board-wrap">
          <div class="text-center text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 mb-1.5">CARTAS COMUNITARIAS · ${table.street}</div>
          <div class="acad-board">${slots}</div>
          <div class="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span class="acad-chip">BOTE <strong>${table.pot}</strong></span>
            ${table.bet ? `<span class="acad-chip acad-chip--bet">APUESTA <strong>${table.bet}</strong></span>` : ''}
            ${table.outCards ? `<span class="acad-chip acad-chip--out">OUTS <strong>${table.outCards.length}</strong></span>` : ''}
          </div>
        </div>

        <div class="acad-seat acad-seat--hero">
          <div class="flex gap-1">${hero.map(c => this.cardHTML(c)).join('')}</div>
          <div class="text-left">
            <div class="text-[10px] font-mono uppercase tracking-widest text-emerald-300">TÚ ${table.heroPos ? `· ${table.heroPos}` : ''}</div>
            <div class="text-[11px] text-slate-300 mt-0.5">${table.note || 'Tu turno'}</div>
          </div>
        </div>

        ${table.outCards ? `<div class="acad-outs"><span>OUTS MARCADAS · ${table.outCards.length}</span><div class="flex flex-wrap justify-center gap-1">${table.outCards.map(c => this.cardHTML(c, 'acad-card--out')).join('')}</div></div>` : ''}
      </div>
    `;
  },

  renderFeedback(opt, correct) {
    return `
      <div class="acad-feedback ${correct ? 'is-correct' : 'is-wrong'}">
        <strong>${correct ? '✓ Decisión correcta' : '✕ Revisa la decisión'}</strong>
        <p>${opt.feedback}</p>
      </div>
    `;
  },

  renderSummary(lesson) {
    return `
      <div class="acad-summary">
        <div class="text-4xl">🏆</div>
        <h3 class="text-xl font-extrabold text-white">Clase completada</h3>
        <p class="text-sm text-slate-300 max-w-md">${lesson.title} · 5 de 5 pasos resueltos.</p>
        <div class="flex flex-wrap justify-center gap-2 mt-2">
          <button onclick="academia.goStep(0)" class="acad-action">Repasar los 5 pasos</button>
          ${this.nextPlayableLesson() ? `<button onclick="academia.openLesson('${this.nextPlayableLesson().id}')" class="acad-action acad-action--primary">Siguiente clase →</button>` : ''}
        </div>
      </div>
    `;
  }
};
