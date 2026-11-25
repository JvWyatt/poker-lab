/* ============================================================================
   5. MÓDULO: ACADEMIA (12 MICRO-CLASES EN MINI-MESA, DE CERO A PRO)
   Escenarios fijos: cartas, bote y acción del rival deterministas. El alumno
   decide con botones reales de póker y recibe feedback sobre el propio tapete.
============================================================================ */
const SUIT_SYMBOL = { s: '♠', h: '♥', d: '♦', c: '♣' };
const RED_SUITS = new Set(['h', 'd']);

const LESSONS_DATA = [
  {
    id: 'hand_hierarchy',
    level: 'Iniciación',
    title: 'Cómo se gana: jerarquía de manos',
    summary: 'Compara dos manos completas y elige cuál gana y por qué.',
    guide: [
      'Mira las dos manos sobre el mismo board: ambas usan las cinco mejores cartas.',
      'La pareja de Ases gana a la pareja de Reyes. El kicker no entra cuando el par ya es mayor.',
      'Pulsa la mano ganadora para comprobarlo en el tapete.'
    ],
    table: {
      compare: true,
      street: 'SHOWDOWN',
      board: ['Kc', 'Qd', '7s', '2c', '9h'],
      pot: 120,
      hands: [
        { label: 'MANO A', cards: ['As', 'Ad'] },
        { label: 'MANO B', cards: ['Ks', 'Kd'] }
      ]
    },
    options: [
      { key: 'handA', label: 'Gana la Mano A (A♠ A♦)', correct: true, feedback: 'Correcto: par de Ases vs par de Reyes. En póker se compara primero el tipo de mano y después el ranking del par.' },
      { key: 'handB', label: 'Gana la Mano B (K♠ K♦)', correct: false, feedback: 'No: dos Reyes no superan dos Ases. El board tiene un K, pero el par de A♠ A♦ sigue siendo más fuerte.' }
    ],
    principle: 'Orden: carta alta → pareja → doble pareja → trío → escalera → color → full → póker → escalera de color → escalera real.'
  },
  {
    id: 'table_positions',
    level: 'Iniciación',
    title: 'Mesa, posiciones y ciegas',
    summary: 'Button, SB, BB y UTG: quién pone ciegas y quién habla primero.',
    guide: [
      'El botón (BTN) se mueve un asiento cada mano y marca la posición más favorable.',
      'En 6 jugadores, SB y BB están a la izquierda del BTN; UTG habla justo después de la BB.',
      'Elige quién recibe la primera decisión preflop en esta mesa.'
    ],
    table: {
      street: 'PREFLOP',
      board: [],
      pot: 3,
      seats: ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'],
      heroPos: 'BTN',
      hero: ['7h', '2c'],
      villain: ['Ah', 'Kd'],
      villainPos: 'BB',
      villainAction: 'BB pone 2',
      note: 'BTN es el botón de esta mano.'
    },
    options: [
      { key: 'utg', label: 'UTG habla primero', correct: true, feedback: 'Sí. Después de que SB y BB pongan sus ciegas, el primer jugador a la izquierda de la BB es UTG.' },
      { key: 'btn', label: 'BTN habla primero', correct: false, feedback: 'El BTN habla al final preflop. Por eso puede abrir muchos más manos que UTG.' },
      { key: 'sb', label: 'SB habla primero', correct: false, feedback: 'La SB pone la mitad de la ciega, pero preflop habla después de UTG/MP/CO en 6-max.' }
    ],
    principle: 'Ciegas: SB = 1, BB = 2. Orden preflop: UTG → MP → CO → BTN → SB → BB.'
  },
  {
    id: 'basic_actions',
    level: 'Iniciación',
    title: 'Acciones básicas en tu turno',
    summary: 'Check, Call, Bet, Raise o Fold con una decisión sencilla.',
    guide: [
      'Nadie ha apostado en tu turno: pagar no te cuesta nada, así que se llama Check.',
      'Con 7♥ 2♣ en el botón no hay valor para apostar: conserva tus fichas.',
      'Pulsa la acción correcta en la mini-mesa.'
    ],
    table: {
      street: 'PREFLOP',
      board: [],
      pot: 3,
      bet: 0,
      hero: ['7h', '2c'],
      villain: ['Ah', 'Kd'],
      heroPos: 'BTN',
      villainPos: 'BB',
      villainAction: 'BB pone 2',
      seats: ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'],
      note: 'Turno del héroe · nadie ha subido todavía.'
    },
    options: [
      { key: 'check', label: 'Check (Pasar)', correct: true, feedback: 'Correcto. Con 0 fichas que pagar, Check es gratis: ves el flop sin arriesgar nada.' },
      { key: 'bet', label: 'Bet (Apostar)', correct: false, feedback: 'Podrías apostar como robo, pero con 72o en BTN no es la acción básica segura. Aquí Check es la decisión limpia.' },
      { key: 'fold', label: 'Fold (Retirarte)', correct: false, feedback: 'Retirarte cuando pagar es gratis tira tu oportunidad de ver el flop. Nunca hagas Fold frente a 0 fichas.' }
    ],
    principle: 'Si la apuesta a pagar es 0 → Check. Si alguien apostó → Call, Raise o Fold.'
  },
  {
    id: 'position_range',
    level: 'Básico',
    title: 'Manos iniciales según posición',
    summary: 'K9o es una pérdida en UTG y una apertura razonable en BTN.',
    guide: [
      'En UTG quedan cinco jugadores por hablar: necesitas un rango muy fuerte.',
      'En BTN sólo quedan las ciegas: puedes abrir K9o porque tienes posición después del flop.',
      'Elige dónde abrirías esta mano.'
    ],
    table: {
      street: 'PREFLOP',
      board: [],
      pot: 3,
      bet: 0,
      hero: ['Ks', '9d'],
      villain: ['Qh', 'Jc'],
      heroPos: 'BTN',
      villainPos: 'BB',
      seats: ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'],
      note: 'Mismo K♠ 9♦, dos posiciones distintas.'
    },
    options: [
      { key: 'btn', label: 'Abrir desde BTN', correct: true, feedback: 'Correcto. Desde BTN puedes abrir ~40-50% de manos: K9o entra y además actúas al último postflop.' },
      { key: 'utg', label: 'Abrir desde UTG', correct: false, feedback: 'Desde UTG K9o pierde dinero: cinco jugadores pueden tener rangos más fuertes y tú juegas fuera de posición.' },
      { key: 'limp', label: 'Pagar (limp) desde UTG', correct: false, feedback: 'El limp pasivo desde UTG regala iniciativa: pagas poco, pero juegas fuera de posición y sin controlar el bote.' }
    ],
    principle: 'Cuantos más jugadores hablen detrás, más estrecho debe ser tu rango de apertura.'
  },
  {
    id: 'pot_odds_call',
    level: 'Básico',
    title: 'Pot Odds en acción',
    summary: 'Bote 100, apuesta 50, proyecto de color: ¿pagar o retirarse?',
    guide: [
      'Pagas 50 para disputar un bote final de 200 fichas.',
      'Necesitas 50/200 = 25% de equity. Tu proyecto de color tiene unas 9 outs (~35%).',
      'Pulsa el botón real de Pagar o Retirarte.'
    ],
    table: {
      street: 'FLOP',
      board: ['9h', '8h', '2c'],
      pot: 100,
      bet: 50,
      hero: ['Ah', '5h'],
      villain: ['Kd', 'Qd'],
      heroPos: 'BTN',
      villainPos: 'BB',
      villainProfile: 'TAG',
      villainAction: 'Apuesta 50',
      outCards: ['2h', '3h', '4h', '6h', '7h', 'Th', 'Jh', 'Qh', 'Kh'],
      note: '9 outs de color · bote 100 · apuesta 50.'
    },
    options: [
      { key: 'call', label: 'Pagar 50', correct: true, feedback: 'Correcto. 50 / (100 + 50 + 50) = 25%. Como tu color liga ~35%, el call gana fichas a largo plazo.' },
      { key: 'fold', label: 'Retirarse', correct: false, feedback: 'Te sobra margen: 35% de equity frente a 25% de pot odds. Foldear aquí tira una decisión +EV.' },
      { key: 'raise', label: 'Subir con el proyecto', correct: false, feedback: 'Podría ser una semi-amenaza, pero con sólo limpieza parcial de outs la decisión básica y segura es Pagar.' }
    ],
    principle: 'Pot odds = apuesta a pagar / bote final. Paga cuando tu equity sea mayor.'
  },
  {
    id: 'outs_rule',
    level: 'Básico',
    title: 'Contar outs: regla del 4 y del 2',
    summary: 'Las cartas marcadas completan tu escalera: conviértelas en porcentaje.',
    guide: [
      'Tienes 8♠ 7♠ y el board 9♦ 6♣ 2♥: te sirven los 5 y los 10 (8 cartas).',
      'En el Turn sólo queda una carta: 8 × 2 = 16% (el valor exacto es 8/46 ≈ 17%).',
      'Elige la estimación correcta para el Turn.'
    ],
    table: {
      street: 'TURN',
      board: ['9d', '6c', '2h', '3s'],
      pot: 60,
      bet: 0,
      hero: ['8s', '7s'],
      villain: ['Ah', 'Kd'],
      heroPos: 'CO',
      villainPos: 'BB',
      villainAction: 'Pasa (Check)',
      outCards: ['5s', '5h', '5d', '5c', 'Ts', 'Th', 'Td', 'Tc'],
      note: '8 cartas marcadas completan tu escalera.'
    },
    options: [
      { key: 'turn16', label: 'Turn: 8 × 2 = 16%', correct: true, feedback: 'Correcto. Con una carta por venir, cada out vale cerca del 2%. La cuenta exacta es 8/46 = 17,4%.' },
      { key: 'flop32', label: 'Flop: 8 × 4 = 32%', correct: false, feedback: 'El ×4 se usa en el Flop, cuando faltan dos cartas. Aquí ya estamos en el Turn.' },
      { key: 'turn24', label: 'Turn: 8 × 3 = 24%', correct: false, feedback: 'No existe el ×3. En el Turn se multiplica por 2 porque queda una sola carta.' }
    ],
    principle: 'Flop → outs × 4. Turn → outs × 2. River → ya no hay outs: la mano está hecha.'
  },
  {
    id: 'position_ip',
    level: 'Intermedio',
    title: 'Ventaja de posición (IP vs OOP)',
    summary: 'Desde BTN controlas el bote porque decides al final en cada calle.',
    guide: [
      'La BB pasa en un board alto y seco: K♠ 7♦ 2♣.',
      'Desde BTN puedes apostar pequeño: tu rango tiene más K y la BB foldea mucho.',
      'Elige cómo usar la posición.'
    ],
    table: {
      street: 'FLOP',
      board: ['Ks', '7d', '2c'],
      pot: 40,
      bet: 0,
      hero: ['As', '9s'],
      villain: ['6h', '5h'],
      heroPos: 'BTN',
      villainPos: 'BB',
      villainProfile: 'Nit',
      villainAction: 'Pasa (Check)',
      seats: ['BTN', 'SB', 'BB'],
      note: 'BTN es IP: actúa al último en Flop, Turn y River.'
    },
    options: [
      { key: 'bet_small', label: 'Apostar 1/3 del bote', correct: true, feedback: 'Correcto. Con posición y ventaja de rango, una apuesta pequeña presiona el rango débil de la BB a bajo coste.' },
      { key: 'check', label: 'Pasar siempre', correct: false, feedback: 'Pasas la iniciativa y regalas cartas gratis. En posición quieres construir el bote con tu ventaja.' },
      { key: 'fold', label: 'Retirarse', correct: false, feedback: 'Con A♠ 9♠ en BTN tienes equidad y posición: retirarte frente a un Check es un error grave.' }
    ],
    principle: 'IP = Information + Control. Actuar al último permite robar barato y evitar botes grandes sin mano.'
  },
  {
    id: 'spr_commitment',
    level: 'Intermedio',
    title: 'SPR y compromiso con Top Pair',
    summary: 'Con SPR 2, un par superior ya vale para jugar el stack.',
    guide: [
      'Bote 40 BB y te quedan 80 BB: SPR = 80/40 = 2 (bajo).',
      'Tienes A♠ K♦ en K♠ 8♣ 3♦: par de K con el mejor kicker.',
      'Elige el plan que maximiza valor sin miedo infundado.'
    ],
    table: {
      street: 'FLOP',
      board: ['Ks', '8c', '3d'],
      pot: 40,
      bet: 0,
      hero: ['As', 'Kd'],
      villain: ['Qh', 'Qc'],
      heroPos: 'CO',
      villainPos: 'BB',
      villainProfile: 'TAG',
      villainAction: 'Pasa (Check)',
      note: 'SPR = 2 · Top Pair con mejor kicker.'
    },
    options: [
      { key: 'value', label: 'Apostar por valor y comprometer', correct: true, feedback: 'Correcto. Con SPR 2 necesitas ~40% de equity para jugarlo todo; tu par de K supera ese umbral.' },
      { key: 'fold', label: 'Check-Fold por miedo al trío', correct: false, feedback: 'Con SPR bajo y mejor kicker, retirarse tira una mano dominante. El miedo no es una cuenta.' },
      { key: 'minbet', label: 'Apostar 1 BB', correct: false, feedback: 'Una mini-apuesta da cartas gratis y nunca construye el bote que tu SPR ya permite.' }
    ],
    principle: 'SPR bajo → manos hechas valen más. SPR alto → hacen falta manos aún más fuertes.'
  },
  {
    id: 'semi_bluff',
    level: 'Intermedio',
    title: 'Semi-faroles con proyectos fuertes',
    summary: 'Apuesta agresiva con color + escalera: dos formas de ganar.',
    guide: [
      'Tienes A♥ 5♥ en 9♥ 8♥ 2♣: proyecto de color y tie-out a escalera.',
      'Si el rival foldea ganas el bote; si paga, todavía tienes outs para ligar.',
      'Elige la acción que usa ambas vías de ganar.'
    ],
    table: {
      street: 'FLOP',
      board: ['9h', '8h', '2c'],
      pot: 60,
      bet: 0,
      hero: ['Ah', '5h'],
      villain: ['Kd', 'Qd'],
      heroPos: 'BTN',
      villainPos: 'BB',
      villainProfile: 'Nit',
      villainAction: 'Pasa (Check)',
      outCards: ['2h', '3h', '4h', '6h', '7h', 'Th', 'Jh', 'Qh', 'Kh'],
      note: 'Proyecto de color + posibilidad de escalera.'
    },
    options: [
      { key: 'bet_big', label: 'Apostar ~3/4 del bote', correct: true, feedback: 'Correcto. Presionas con fold equity y conservas ~35% de equity si te pagan: es un semi-farol rentable.' },
      { key: 'check', label: 'Pasar esperando ligar', correct: false, feedback: 'Pasar renuncia a los foldeos. Aquí tienes una mano perfecta para presionar, no para jugar pasivo.' },
      { key: 'fold', label: 'Retirarse', correct: false, feedback: 'Retirarte con 9 outs y posición tira una situación con dos formas de ganar.' }
    ],
    principle: 'Semi-farol = Fold Equity + Equity real. Funciona mejor contra rivales que foldean.'
  },
  {
    id: 'cbet_texture',
    level: 'Avanzado',
    title: 'C-Bet según textura del board',
    summary: 'K72 arcoíris no es lo mismo que 876 con dos palos.',
    guide: [
      'Abres en CO y la BB paga. El board seco K♠ 7♦ 2♣ favorece mucho tu rango.',
      'En boards secos y altos basta 1/3 del bote con alta frecuencia.',
      'Elige la C-Bet coherente con esta textura.'
    ],
    table: {
      street: 'FLOP',
      board: ['Ks', '7d', '2c'],
      pot: 48,
      bet: 0,
      hero: ['As', 'Qs'],
      villain: ['6h', '5h'],
      heroPos: 'CO',
      villainPos: 'BB',
      villainProfile: 'TAG',
      villainAction: 'Pasa (Check)',
      note: 'Board seco y alto: ventaja de rango para quien abrió.'
    },
    options: [
      { key: 'bet_third', label: 'C-Bet de 1/3 (~16)', correct: true, feedback: 'Correcto. Tu rango tiene muchas manos máximas; una apuesta pequeña consigue foldeos baratos.' },
      { key: 'check_always', label: 'Pasar siempre', correct: false, feedback: 'Renuncias a valor inmediato en un board que te favorece claramente.' },
      { key: 'overbet', label: 'Overbet del 150%', correct: false, feedback: 'Un tamaño gigante sólo consigue que te paguen las mejores manos. Aquí lo barato es lo óptimo.' }
    ],
    principle: 'Seco + alto → pequeña y seguida. Coordinado + bajo → grande y selectiva.'
  },
  {
    id: 'river_blocker',
    level: 'Avanzado',
    title: 'Farol en River con bloqueador',
    summary: 'Cuando se completa el proyecto, tu As quita manos nut al rival.',
    guide: [
      'El board 9♠ 8♠ 2♣ 7♠ T♦ completó muchas escaleras y proyectos de color.',
      'Tienes A♠ 5♥: no ligaste color, pero tu A♠ quita la mejor carta de color al rival.',
      'Elige la línea que representa fuerza con el menor costo.'
    ],
    table: {
      street: 'RIVER',
      board: ['9s', '8s', '2c', '7s', 'Td'],
      pot: 100,
      bet: 0,
      hero: ['As', '5h'],
      villain: ['Kd', 'Qd'],
      heroPos: 'BTN',
      villainPos: 'BB',
      villainProfile: 'Nit',
      villainAction: 'Pasa (Check)',
      note: 'A♠ bloqueador · farol en River.'
    },
    options: [
      { key: 'bet_blocker', label: 'Apostar ~2/3 del bote', correct: true, feedback: 'Correcto. Tu mano carece de showdown value y tu A♠ bloquea el mejor color del rival: contra un Nit hay foldeos reales.' },
      { key: 'check_fold', label: 'Pasar y perder el bote', correct: false, feedback: 'Con un rival que foldea, pasar renuncia a la única forma de ganar este bote.' },
      { key: 'call_allin', label: 'Pagar un all-in', correct: false, feedback: 'Pagar con A♠ 5♥ frente a un rango fuerte es dinero regalado: no tienes showdown value.' }
    ],
    principle: 'Farol en River = poca showdown value + bloqueador + rival con foldeos.'
  },
  {
    id: 'exploit_profiles',
    level: 'Avanzado',
    title: 'Ajustes explotativos por perfil',
    summary: 'Castiga al que foldea; no intentes asustar al Calling Station.',
    guide: [
      'La BB es un Calling Station: paga con cualquier pareja y casi nunca foldea.',
      'Tu A♥ 5♥ no ligó nada en el River: un farol no tiene foldeos que lo paguen.',
      'Elige el ajuste correcto contra este rival.'
    ],
    table: {
      street: 'RIVER',
      board: ['Ks', '9d', '4c', '7h', '2s'],
      pot: 80,
      bet: 0,
      hero: ['Ah', '5h'],
      villain: ['Kc', '3d'],
      heroPos: 'BTN',
      villainPos: 'BB',
      villainProfile: 'Calling Station',
      villainAction: 'Pasa (Check)',
      note: 'Rival: Calling Station · foldeos casi nulos.'
    },
    options: [
      { key: 'check_fold', label: 'Pasar / no farolear', correct: true, feedback: 'Correcto. Sin Fold Equity, farolear aire es -EV. Guarda las fichas y apuesta sólo cuando tengas valor.' },
      { key: 'bluff_allin', label: 'Farol all-in', correct: false, feedback: 'El Station no foldea: ese all-in sólo consigue que te paguen con cualquier par.' },
      { key: 'min_bet', label: 'Farol de 1/3', correct: false, feedback: 'Tampoco funciona: te pagará con rey alto o pareja baja. El error es intentar el farol, no su tamaño.' }
    ],
    principle: 'GTO es la base; la ganancia extra está en ajustar al error concreto del rival.'
  }
];

const academia = {
  currentFilter: 'all',
  activeLessonId: LESSONS_DATA[0].id,

  cardHTML(code, extraClass = '') {
    const cardId = PokerEngine.codeToCard(code);
    if (cardId === null || cardId === undefined) return '';
    const card = PokerEngine.cardToObj(cardId);
    if (!card) return '';
    const symbol = SUIT_SYMBOL[card.suit] || card.suit;
    const rank = card.rank === 'T' ? '10' : card.rank;
    const tone = RED_SUITS.has(card.suit) ? 'text-rose-400' : 'text-slate-100';
    return `
      <div class="acad-card ${tone} ${extraClass}" title="${rank}${symbol}">
        <span class="acad-card-rank">${rank}</span>
        <span class="acad-card-suit">${symbol}</span>
      </div>
    `;
  },

  isUnlocked(id) {
    const idx = LESSONS_DATA.findIndex(l => l.id === id);
    if (idx <= 0) return true;
    return appState.academia.completedIds.includes(LESSONS_DATA[idx - 1].id);
  },

  filterLevel(level) {
    SoundFX.playClick();
    this.currentFilter = level;
    document.querySelectorAll('.acad-filter-btn').forEach(btn => {
      const active = btn.dataset.level === level;
      btn.className = `acad-filter-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
        active ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`;
    });
    this.render();
  },

  selectLesson(id) {
    if (!this.isUnlocked(id)) {
      showToast('Completa la clase anterior para desbloquear ésta', 'info');
      return;
    }
    SoundFX.playSelect();
    this.activeLessonId = id;
    this.render();
  },

  renderList() {
    const listEl = document.getElementById('academia-list');
    if (!listEl) return;
    const filtered = this.currentFilter === 'all'
      ? LESSONS_DATA
      : LESSONS_DATA.filter(l => l.level === this.currentFilter);

    const levelColors = {
      'Iniciación': 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      'Básico': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      'Intermedio': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      'Avanzado': 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    };

    listEl.innerHTML = filtered.map(l => {
      const idx = LESSONS_DATA.indexOf(l);
      const done = appState.academia.completedIds.includes(l.id);
      const locked = !this.isUnlocked(l.id);
      const active = l.id === this.activeLessonId;
      const click = locked ? '' : `onclick="academia.selectLesson('${l.id}')"`;
      const cursor = locked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer';

      return `
        <div ${click} class="${cursor} rounded-2xl p-3.5 border transition ${
          active ? 'bg-slate-850 border-emerald-500 shadow-lg' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${levelColors[l.level]}">${l.level}</span>
            <span class="text-[10px] font-mono text-slate-500">${locked ? '🔒' : done ? '✓' : '·'} ${idx + 1}/${LESSONS_DATA.length}</span>
          </div>
          <h3 class="text-sm font-bold text-white">${l.title}</h3>
          <p class="text-xs text-slate-400 mt-1">${l.summary}</p>
        </div>
      `;
    }).join('');
  },

  renderCompare(table) {
    return table.hands.map(hand => {
      const ev = PokerEngine.evaluateHand([...hand.cards, ...table.board]);
      return `
        <div class="rounded-xl border border-slate-700/60 bg-slate-950/70 p-2.5 text-center">
          <div class="text-[10px] font-mono text-slate-400 mb-1.5">${hand.label}</div>
          <div class="flex justify-center gap-1 mb-1.5">${hand.cards.map(c => this.cardHTML(c)).join('')}</div>
          <div class="text-[11px] font-bold text-emerald-300">${ev.name}</div>
        </div>
      `;
    }).join('');
  },

  renderScenario(table) {
    const outCards = table.outCards || [];
    const seats = table.seats || [];
    return `
      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-xl border border-slate-700/60 bg-slate-950/70 p-2.5">
          <div class="text-[10px] font-mono text-slate-400 mb-1">RIVAL ${table.villainProfile ? `· ${table.villainProfile}` : ''}</div>
          <div class="flex gap-1 mb-1.5">${(table.villain || []).map(c => this.cardHTML(c)).join('')}</div>
          <div class="text-[11px] text-amber-300 font-semibold">${table.villainAction || '—'}</div>
        </div>
        <div class="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5">
          <div class="text-[10px] font-mono text-emerald-300 mb-1">TÚ · ${table.heroPos || 'HERO'}</div>
          <div class="flex gap-1 mb-1.5">${(table.heroCards || table.hero || []).map(c => this.cardHTML(c)).join('')}</div>
          <div class="text-[11px] text-emerald-300 font-semibold">${table.note || 'Tu turno'}</div>
        </div>
      </div>

      <div class="mt-3">
        <div class="text-[10px] font-mono text-slate-400 mb-1.5 text-center">BOARD · ${table.street}</div>
        <div class="flex flex-wrap justify-center gap-1">
          ${table.board.map(c => this.cardHTML(c)).join('') || '<span class="text-[11px] text-slate-500">Sin board todavía</span>'}
        </div>
      </div>

      ${outCards.length ? `
        <div class="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2">
          <div class="text-[10px] font-mono text-amber-300 text-center mb-1.5">OUTS MARCADOS</div>
          <div class="flex flex-wrap justify-center gap-1">${outCards.map(c => this.cardHTML(c, 'acad-card--out')).join('')}</div>
        </div>
      ` : ''}

      <div class="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono">
        <span class="px-2 py-1 rounded-lg bg-slate-950/70 border border-slate-700">BOTE <strong class="text-amber-300 ml-1">${table.pot}</strong></span>
        ${table.bet ? `<span class="px-2 py-1 rounded-lg bg-rose-950/40 border border-rose-500/40">APUESTA <strong class="text-rose-300 ml-1">${table.bet}</strong></span>` : ''}
      </div>

      ${seats.length ? `
        <div class="mt-3 flex flex-wrap justify-center gap-1">
          ${seats.map(s => `<span class="px-2 py-0.5 rounded-full border text-[10px] font-mono ${
            s === table.heroPos
              ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
              : 'border-slate-700 bg-slate-900 text-slate-400'
          }">${s}</span>`).join('')}
        </div>
      ` : ''}
    `;
  },

  render() {
    this.renderList();
    const ws = document.getElementById('academia-workspace');
    if (!ws) return;
    const lesson = LESSONS_DATA.find(l => l.id === this.activeLessonId) || LESSONS_DATA[0];
    const idx = LESSONS_DATA.indexOf(lesson);
    const doneCount = appState.academia.completedIds.length;
    const pct = Math.round((doneCount / LESSONS_DATA.length) * 100);
    const table = lesson.table;

    ws.innerHTML = `
      <div class="space-y-4">
        <div class="border-b border-slate-800 pb-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs font-mono text-emerald-400 uppercase tracking-wider">${lesson.level}</span>
            <span class="text-[11px] font-mono text-slate-400">Clase ${idx + 1} de ${LESSONS_DATA.length} · 0 → Pro</span>
          </div>
          <h3 class="text-xl font-extrabold text-white mt-1">${lesson.title}</h3>
          <div class="mt-3 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full transition-all" style="width:${pct}%"></div>
          </div>
        </div>

        <div class="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-3.5">
          <span class="text-[11px] font-mono font-bold text-emerald-300">GUÍA EN 3 LÍNEAS</span>
          ${lesson.guide.map(line => `<p class="text-xs sm:text-sm text-emerald-100 mt-1 leading-snug">${line}</p>`).join('')}
        </div>

        <div id="acad-table" class="acad-table relative rounded-2xl border border-emerald-500/25 p-3.5 sm:p-5">
          ${table.compare ? this.renderCompare(table) : this.renderScenario(table)}
          <div class="mt-4 flex flex-wrap justify-center gap-2">
            ${lesson.options.map(opt => `
              <button onclick="academia.answerScenario('${lesson.id}', '${opt.key}')"
                class="acad-action px-3 py-2 rounded-xl border border-slate-700 bg-slate-900/90 text-xs font-bold text-slate-100 hover:border-emerald-400/70 transition">
                ${opt.label}
              </button>
            `).join('')}
          </div>
          <div id="acad-feedback" class="hidden mt-4"></div>
        </div>

        <div class="rounded-xl border border-slate-700/60 bg-slate-950/70 p-3">
          <span class="text-[11px] font-mono font-bold text-cyan-300">REGLA CLAVE</span>
          <p class="text-xs text-slate-300 mt-1 leading-snug">${lesson.principle}</p>
        </div>
      </div>
    `;
  },

  answerScenario(lessonId, key) {
    const idx = LESSONS_DATA.findIndex(l => l.id === lessonId);
    if (idx < 0) return;
    const lesson = LESSONS_DATA[idx];
    const opt = lesson.options.find(o => o.key === key);
    if (!opt) return;

    const tableEl = document.getElementById('acad-table');
    const fb = document.getElementById('acad-feedback');
    if (!tableEl || !fb) return;

    tableEl.dataset.result = opt.correct ? 'correct' : 'wrong';
    if (opt.correct) SoundFX.playLessonCorrect();
    else SoundFX.playLessonWrong();

    const next = LESSONS_DATA[idx + 1];
    const nextBtn = opt.correct && next
      ? `<button onclick="academia.selectLesson('${next.id}')" class="mt-3 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition">Siguiente clase: ${next.title} →</button>`
      : opt.correct
        ? '<p class="mt-3 font-bold text-emerald-300">🏆 ¡Ruta completa! De 0 a pro.</p>'
        : '<p class="mt-3 text-xs text-slate-400">Inténtalo de nuevo: las decisiones incorrectas no bloquean la lección.</p>';

    fb.className = `rounded-xl border p-3.5 ${
      opt.correct
        ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-100'
        : 'bg-rose-950/80 border-rose-500/60 text-rose-100'
    }`;
    fb.innerHTML = `
      <strong class="block mb-1 text-sm">${opt.correct ? '✓ Decisión correcta' : '✕ Revisa la decisión'}</strong>
      <p class="text-xs leading-snug">${opt.feedback}</p>
      ${nextBtn}
    `;

    if (opt.correct && !appState.academia.completedIds.includes(lessonId)) {
      appState.academia.completedIds.push(lessonId);
      saveState();
      this.renderList();
      showToast('Clase completada y desbloqueada la siguiente', 'success');
    }
  }
};
