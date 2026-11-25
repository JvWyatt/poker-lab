/* ============================================================================
   7. MÓDULO: PARTIDAS (MESA GEOMÉTRICA 2/6/9J, 10 PERFILES ROTATIVOS,
      EVALUADOR CHESS-EV Y TEMPORIZADOR DE 60s PARA EL HÉROE)
============================================================================ */
const BOT_PROFILES = [
  { id: 'gto', name: 'Solver GTO', style: 'GTO Solver', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40', vpip: 0.24, pfr: 0.19, agg: 0.65, foldToBet: 0.45, callLoose: 0.04, bluffFreq: 0.22 },
  { id: 'nit', name: 'Roca Sólida', style: 'Nit / Roca', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40', vpip: 0.13, pfr: 0.10, agg: 0.42, foldToBet: 0.65, callLoose: -0.09, bluffFreq: 0.06 },
  { id: 'tag', name: 'Reg Selectivo', style: 'TAG', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', vpip: 0.21, pfr: 0.18, agg: 0.72, foldToBet: 0.50, callLoose: 0.01, bluffFreq: 0.18 },
  { id: 'lag', name: 'Tiburón LAG', style: 'LAG', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40', vpip: 0.35, pfr: 0.28, agg: 0.82, foldToBet: 0.38, callLoose: 0.09, bluffFreq: 0.34 },
  { id: 'maniac', name: 'Hiper-Agresivo', style: 'Maníaco', badge: 'bg-rose-500/25 text-rose-300 border-rose-500/50', vpip: 0.52, pfr: 0.42, agg: 0.94, foldToBet: 0.26, callLoose: 0.18, bluffFreq: 0.52 },
  { id: 'station', name: 'Pagador Nato', style: 'Calling Station', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', vpip: 0.58, pfr: 0.09, agg: 0.22, foldToBet: 0.18, callLoose: 0.28, bluffFreq: 0.05 },
  { id: 'weaktight', name: 'Pasivo Cauto', style: 'Weak-Tight', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40', vpip: 0.32, pfr: 0.08, agg: 0.28, foldToBet: 0.68, callLoose: 0.05, bluffFreq: 0.07 },
  { id: 'shark', name: 'Explotativo Pro', style: 'Shark / Reg', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', vpip: 0.26, pfr: 0.21, agg: 0.76, foldToBet: 0.46, callLoose: 0.03, bluffFreq: 0.26 },
  { id: 'tricky', name: 'Trampa / Slow', style: 'Tricky', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', vpip: 0.29, pfr: 0.16, agg: 0.58, foldToBet: 0.42, callLoose: 0.11, bluffFreq: 0.28 },
  { id: 'rng', name: 'Caótico RNG', style: 'Caótico RNG', badge: 'bg-slate-600/35 text-slate-300 border-slate-500/40', vpip: 0.46, pfr: 0.25, agg: 0.55, foldToBet: 0.40, callLoose: 0.14, bluffFreq: 0.35 }
];

/**
 * Denominaciones reales: cada color equivale siempre a la misma cantidad.
 * Así, ver 2 fichas azules = 200 sin depender del tamaño del montón.
 */
const CHIP_DENOMINATIONS = [
  { value: 1000, color: 'yellow', name: 'amarillo' },
  { value: 500,  color: 'black',  name: 'negro' },
  { value: 100,  color: 'blue',   name: 'azul' },
  { value: 25,   color: 'green',  name: 'verde' },
  { value: 5,    color: 'red',    name: 'rojo' },
  { value: 1,    color: 'gray',   name: 'gris' }
];
const CHIP_STACK_STEP = 8;       // px visibles de cada ficha al apilar
const CHIP_STACK_MAX = 5;        // máximo de fichas por montón
const CHIP_STACKS_PLAYER = 3;    // montones permitidos en la apuesta de cada jugador
const CHIP_STACKS_POT = 3;       // montones permitidos en el bote

/**
 * Coordenadas exactas en sentido horario alrededor de la mesa ovalada
 * seat: posición del panel del jugador (% left, % top)
 * chip: posición de la ficha de apuesta y botón D hacia el interior del tapete (% left, % top)
 */
const SEAT_LAYOUTS = {
  2: [
    { seat: 'left: 50%; top: 87%;', chip: 'left: 50%; top: 72%;' }, // 0: Héroe abajo centro
    { seat: 'left: 50%; top: 20%;', chip: 'left: 50%; top: 32%;' }  // 1: Rival arriba centro (enfrente)
  ],
  6: [
    { seat: 'left: 50%; top: 87%;', chip: 'left: 50%; top: 72%;' }, // 0: Héroe abajo centro
    { seat: 'left: 11%; top: 69%;', chip: 'left: 26%; top: 63%;' }, // 1: Izquierda abajo
    { seat: 'left: 11%; top: 31%;', chip: 'left: 26%; top: 37%;' }, // 2: Izquierda arriba
    { seat: 'left: 50%; top: 20%;', chip: 'left: 50%; top: 32%;' }, // 3: Arriba centro (enfrente del héroe)
    { seat: 'left: 89%; top: 31%;', chip: 'left: 74%; top: 37%;' }, // 4: Derecha arriba
    { seat: 'left: 89%; top: 69%;', chip: 'left: 74%; top: 63%;' }  // 5: Derecha abajo
  ],
  9: [
    { seat: 'left: 50%; top: 87%;', chip: 'left: 50%; top: 72%;' }, // 0: Héroe abajo centro
    { seat: 'left: 13%; top: 76%;', chip: 'left: 27%; top: 68%;' }, // 1: Izquierda abajo
    { seat: 'left: 7%;  top: 50%;', chip: 'left: 22%; top: 50%;' }, // 2: Izquierda medio
    { seat: 'left: 13%; top: 24%;', chip: 'left: 27%; top: 32%;' }, // 3: Izquierda arriba
    { seat: 'left: 34%; top: 20%;', chip: 'left: 38%; top: 32%;' }, // 4: Arriba izquierda
    { seat: 'left: 66%; top: 20%;', chip: 'left: 62%; top: 32%;' }, // 5: Arriba derecha
    { seat: 'left: 87%; top: 24%;', chip: 'left: 73%; top: 32%;' }, // 6: Derecha arriba
    { seat: 'left: 93%; top: 50%;', chip: 'left: 78%; top: 50%;' }, // 7: Derecha medio
    { seat: 'left: 87%; top: 76%;', chip: 'left: 73%; top: 68%;' }  // 8: Derecha abajo
  ]
};

const game = {
  initialized: false,
  tableSize: 6,
  players: [],
  deck: [],
  board: [],
  pot: 0,
  street: 'preflop',
  dealerIdx: 0,
  turnIdx: 0,
  currentBet: 0,
  minRaise: 2,
  sb: 1,
  bb: 2,
  handInProgress: false,
  botTimer: null,
  heroTimerInterval: null,
  nextHandInterval: null,
  nextHandSeconds: 10,
  heroSecondsLeft: 60,
  heroStartingStack: 200,
  currentDecisionAnalysis: null,

  init() {
    this.initialized = true;
    this.tableSize = parseInt(appState.config.tableSize, 10) || 6;
    SoundFX.updateButtonUI();
    this.updateProfileButtonLabel();
    this.setupPlayers();
    this.updateTableSizeButtons();
    this.startNewHand(false);

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (this.initialized) this.renderTable();
      }, 120);
    });
  },

  changeTableSize(size) {
    SoundFX.playClick();
    this.stopAllTimers();
    this.tableSize = size;
    appState.config.tableSize = size;
    saveState();
    this.updateTableSizeButtons();
    this.setupPlayers();
    this.startNewHand(false);
    showToast(`Mesa configurada a ${size} jugadores`, 'info');
  },

  toggleProfileVisibility() {
    appState.config.showProfiles = !appState.config.showProfiles;
    SoundFX.playToggle(appState.config.showProfiles);
    saveState();
    this.updateProfileButtonLabel();
    this.renderTable();
  },

  updateProfileButtonLabel() {
    const btn = document.getElementById('btn-toggle-profiles');
    if (btn) {
      btn.textContent = appState.config.showProfiles ? 'Etiquetas IA: Visibles' : 'Etiquetas IA: Ocultas';
    }
  },

  rotateOpponents(notify = false) {
    this.stopAllTimers();
    const startChips = this.parseBlindsAndStack();
    const shuffledProfiles = PokerEngine.shuffle([...BOT_PROFILES]);

    for (let i = 1; i < this.tableSize; i++) {
      const prof = shuffledProfiles[(i - 1) % shuffledProfiles.length];
      this.players[i].profile = prof;
      this.players[i].name = `${prof.name}`;
      this.players[i].stack = startChips;
    }
    if (notify) SoundFX.playRotate();
    if (notify) showToast('Nuevos perfiles aleatorios asignados en la mesa', 'success');
    this.startNewHand(true);
  },

  updateTableSizeButtons() {
    document.querySelectorAll('.table-size-btn').forEach(btn => {
      const s = parseInt(btn.dataset.size, 10);
      if (s === this.tableSize) {
        btn.className = 'table-size-btn px-3 py-1.5 rounded-lg text-xs font-bold transition bg-emerald-600 text-white';
      } else {
        btn.className = 'table-size-btn px-3 py-1.5 rounded-lg text-xs font-bold transition bg-slate-800 text-slate-300 hover:bg-slate-700';
      }
    });
  },

  parseBlindsAndStack() {
    const [sbStr, bbStr] = (appState.config.blinds || '1-2').split('-');
    this.sb = parseInt(sbStr, 10) || 1;
    this.bb = parseInt(bbStr, 10) || 2;
    const startChips = this.bb * (parseInt(appState.config.stackBB, 10) || 100);
    document.getElementById('game-blinds-info').textContent = `Ciegas: ${this.sb} / ${this.bb} (${appState.config.stackBB} BB)`;
    if (typeof arena !== 'undefined') arena.updateInfo();
    return startChips;
  },

  setupPlayers() {
    const startChips = this.parseBlindsAndStack();
    const shuffledProfiles = PokerEngine.shuffle([...BOT_PROFILES]);

    this.players = [
      {
        seat: 0,
        name: 'TÚ (Hero)',
        isHuman: true,
        profile: null,
        stack: startChips,
        cards: [],
        bet: 0,
        folded: false,
        allIn: false,
        acted: false,
        lastAction: ''
      }
    ];

    for (let i = 1; i < this.tableSize; i++) {
      const prof = shuffledProfiles[(i - 1) % shuffledProfiles.length];
      this.players.push({
        seat: i,
        name: prof.name,
        isHuman: false,
        profile: prof,
        stack: startChips,
        cards: [],
        bet: 0,
        folded: false,
        allIn: false,
        acted: false,
        lastAction: ''
      });
    }
    this.dealerIdx = 0;
  },

  getPositionNames() {
    if (this.tableSize === 2) return ['BTN / SB', 'BB'];
    if (this.tableSize === 6) return ['BTN', 'SB', 'BB', 'UTG', 'MP', 'CO'];
    return ['BTN', 'SB', 'BB', 'UTG', 'UTG+1', 'MP', 'LJ', 'HJ', 'CO'];
  },

  getSeatPositionLabel(seatIdx) {
    const posNames = this.getPositionNames();
    const rel = (seatIdx - this.dealerIdx + this.tableSize) % this.tableSize;
    return posNames[rel] || '';
  },

  stopAllTimers() {
    if (this.botTimer) {
      clearTimeout(this.botTimer);
      this.botTimer = null;
    }
    if (this.heroTimerInterval) {
      clearInterval(this.heroTimerInterval);
      this.heroTimerInterval = null;
    }
    if (this.nextHandInterval) {
      clearInterval(this.nextHandInterval);
      this.nextHandInterval = null;
    }
  },

  scheduleNextHand(baseMessage) {
    if (this.nextHandInterval) clearInterval(this.nextHandInterval);
    this.nextHandSeconds = 10;

    const banner = document.getElementById('game-status-banner');
    const nextBtn = document.getElementById('btn-next-hand');
    if (nextBtn) nextBtn.classList.remove('hidden');

    const paint = () => {
      if (banner) banner.textContent = `${baseMessage} • Siguiente mano en ${this.nextHandSeconds}s...`;
    };
    paint();

    this.nextHandInterval = setInterval(() => {
      this.nextHandSeconds -= 1;
      if (this.nextHandSeconds <= 0) {
        clearInterval(this.nextHandInterval);
        this.nextHandInterval = null;
        this.startNewHand(true);
      } else {
        SoundFX.playCountdownTick(this.nextHandSeconds);
        paint();
      }
    }, 1000);
  },

  updateHeroTimerUI() {
    const bar = document.getElementById('hero-timer-bar');
    const label = document.getElementById('hero-timer-text');
    if (!bar || !label) return;

    const pct = Math.max(0, (this.heroSecondsLeft / 60) * 100);
    bar.style.width = `${pct}%`;
    label.textContent = `${this.heroSecondsLeft}s`;

    if (this.heroSecondsLeft > 20) {
      bar.className = 'h-full bg-emerald-500 transition-all duration-1000 linear';
      label.className = 'text-[10px] font-mono font-bold text-emerald-400';
    } else if (this.heroSecondsLeft > 10) {
      bar.className = 'h-full bg-amber-400 transition-all duration-1000 linear';
      label.className = 'text-[10px] font-mono font-bold text-amber-400';
    } else {
      bar.className = 'h-full bg-rose-500 animate-pulse-fast transition-all duration-1000 linear';
      label.className = 'text-[10px] font-mono font-bold text-rose-400 animate-pulse-fast';
    }
  },

  startHeroTimer() {
    this.heroSecondsLeft = 60;
    this.updateHeroTimerUI();
    if (this.heroTimerInterval) clearInterval(this.heroTimerInterval);

    this.heroTimerInterval = setInterval(() => {
      if (!this.handInProgress || this.turnIdx !== 0) {
        clearInterval(this.heroTimerInterval);
        this.heroTimerInterval = null;
        return;
      }

      this.heroSecondsLeft -= 1;
      this.updateHeroTimerUI();

      if (this.heroSecondsLeft === 10 || this.heroSecondsLeft === 5) {
        SoundFX.playTimerWarning(this.heroSecondsLeft);
      } else if (this.heroSecondsLeft > 0 && this.heroSecondsLeft < 10) {
        SoundFX.playTimerTick(this.heroSecondsLeft);
      }

      if (this.heroSecondsLeft <= 0) {
        clearInterval(this.heroTimerInterval);
        this.heroTimerInterval = null;
        this.humanAction('fold', true);
      }
    }, 1000);
  },

  startNewHand(advanceDealer = true) {
    this.stopAllTimers();
    const startChips = this.parseBlindsAndStack();

    this.players.forEach(p => {
      if (p.stack < this.bb * 2) p.stack = startChips;
      p.cards = [];
      p.bet = 0;
      p.folded = false;
      p.allIn = false;
      p.acted = false;
      p.lastAction = '';
    });

    this.heroStartingStack = this.players[0].stack;

    if (advanceDealer) {
      this.dealerIdx = (this.dealerIdx + 1) % this.tableSize;
    }

    this.deck = PokerEngine.shuffle(PokerEngine.createDeck());
    this.board = [];
    this.pot = 0;
    this.street = 'preflop';
    this.handInProgress = true;
    this.currentDecisionAnalysis = null;
    this.winnerIdx = null;
    const nextBtn = document.getElementById('btn-next-hand');
    if (nextBtn) nextBtn.classList.add('hidden');

    for (let r = 0; r < 2; r++) {
      for (let i = 0; i < this.tableSize; i++) {
        this.players[i].cards.push(this.deck.pop());
      }
    }

    // Regla oficial: En Heads-Up el Dealer es SB y habla primero preflop; en 6/9-Max SB=D+1, BB=D+2, UTG=D+3
    let sbIdx, bbIdx, firstActIdx;
    if (this.tableSize === 2) {
      sbIdx = this.dealerIdx;
      bbIdx = (this.dealerIdx + 1) % 2;
      firstActIdx = sbIdx;
    } else {
      sbIdx = (this.dealerIdx + 1) % this.tableSize;
      bbIdx = (this.dealerIdx + 2) % this.tableSize;
      firstActIdx = (this.dealerIdx + 3) % this.tableSize;
    }

    this.postChips(sbIdx, this.sb, 'SB');
    this.postChips(bbIdx, this.bb, 'BB');
    this.currentBet = this.bb;
    this.minRaise = this.bb * 2;
    this.turnIdx = firstActIdx;

    this.clearLog();
    this.log(`--- Nueva Mano (${this.tableSize}J) | Dealer: ${this.players[this.dealerIdx].name} ---`);
    this.log(`${this.players[sbIdx].name} (SB) pone ${this.sb} | ${this.players[bbIdx].name} (BB) pone ${this.bb}`);
    SoundFX.playNewHand();

    this.renderTable();
    this.processTurn();
  },

  postChips(seatIdx, amount, label = '') {
    const p = this.players[seatIdx];
    const actual = Math.min(p.stack, amount);
    p.stack -= actual;
    p.bet += actual;
    this.pot += actual;
    if (p.stack === 0) p.allIn = true;
    if (label) p.lastAction = `${label} ${actual}`;
  },

  processTurn() {
    if (!this.handInProgress) return;

    const activePlayers = this.players.filter(p => !p.folded);
    if (activePlayers.length === 1) {
      this.finishHandByFold(activePlayers[0]);
      return;
    }

    const canActPlayers = activePlayers.filter(p => !p.allIn);
    const allMatched = activePlayers.every(p => p.allIn || (p.acted && p.bet === this.currentBet));

    if (allMatched || canActPlayers.length === 0) {
      this.advanceStreet();
      return;
    }

    let safety = 0;
    while ((this.players[this.turnIdx].folded || this.players[this.turnIdx].allIn) && safety < 15) {
      this.turnIdx = (this.turnIdx + 1) % this.tableSize;
      safety++;
    }

    const currentPlayer = this.players[this.turnIdx];
    this.renderTable();

    if (currentPlayer.isHuman) {
      this.enableHumanControls();
      this.computeRealEVMatrix();
      this.startHeroTimer();
      SoundFX.playTurn();
    } else {
      this.disableHumanControls();
      const delay = parseInt(appState.config.botSpeed, 10) || 180;
      this.botTimer = setTimeout(() => this.executeBotTurn(currentPlayer), delay);
    }
  },

  enableHumanControls() {
    const hero = this.players[0];
    const toCall = Math.max(0, this.currentBet - hero.bet);

    const btnFold = document.getElementById('btn-fold');
    const btnCall = document.getElementById('btn-call');
    const btnRaise = document.getElementById('btn-raise');
    const slider = document.getElementById('raise-slider');

    btnFold.disabled = false;
    btnCall.disabled = false;

    if (toCall === 0) {
      btnCall.textContent = 'Pasar (Check)';
    } else if (toCall >= hero.stack) {
      btnCall.textContent = `Pagar All-In (${hero.stack})`;
    } else {
      btnCall.textContent = `Pagar ${toCall} (Call)`;
    }

    const maxTotalBet = hero.bet + hero.stack;
    if (maxTotalBet <= this.currentBet) {
      btnRaise.disabled = true;
    } else {
      btnRaise.disabled = false;
      const minTotal = Math.min(maxTotalBet, Math.max(this.minRaise, this.currentBet + this.bb));
      slider.min = minTotal;
      slider.max = maxTotalBet;
      slider.value = minTotal;
      this.updateRaiseLabel(minTotal);
    }

    document.getElementById('game-status-banner').textContent = toCall > 0
      ? `Tu turno — Enfrentas apuesta de ${toCall} fichas`
      : 'Tu turno — Puedes pasar o apostar';
  },

  disableHumanControls() {
    document.getElementById('btn-fold').disabled = true;
    document.getElementById('btn-call').disabled = true;
    document.getElementById('btn-raise').disabled = true;
  },

  updateRaiseLabel(val) {
    document.getElementById('raise-amount-label').textContent = val;
    const btnRaise = document.getElementById('btn-raise');
    btnRaise.textContent = this.currentBet === 0 ? `Apostar ${val}` : `Subir a ${val}`;
  },

  setBetFraction(frac) {
    if (frac >= 999) SoundFX.playAllIn();
    else SoundFX.playClick();
    const hero = this.players[0];
    const maxTotal = hero.bet + hero.stack;
    const minTotal = parseInt(document.getElementById('raise-slider').min, 10) || this.bb;
    let target;
    if (frac >= 999) {
      target = maxTotal;
    } else {
      const toCall = Math.max(0, this.currentBet - hero.bet);
      const effectivePot = this.pot + toCall;
      target = Math.round(this.currentBet + effectivePot * frac);
      target = Math.max(minTotal, Math.min(maxTotal, target));
    }
    document.getElementById('raise-slider').value = target;
    this.updateRaiseLabel(target);
  },

  /**
   * MOTOR MATEMÁTICO DE EVALUACIÓN REAL DE EV POR ACCIÓN (MONTE CARLO + FOLD EQUITY)
   */
  computeRealEVMatrix() {
    const hero = this.players[0];
    const pos = this.getSeatPositionLabel(0);
    const activeOpponents = this.players.filter(p => !p.isHuman && !p.folded);
    const toCall = Math.max(0, this.currentBet - hero.bet);
    const totalPotAfterCall = this.pot + toCall;
    const potOdds = totalPotAfterCall > 0 ? (toCall / totalPotAfterCall) : 0;
    const spr = this.pot > 0 ? (hero.stack / this.pot) : 99;

    // 1. Simulación Monte Carlo de 2,000 iteraciones contra rango ponderado
    const rangeType = this.street === 'preflop' ? 'range_top30' : 'range_top30';
    const mc = PokerEngine.runMonteCarlo(hero.cards, null, this.board, rangeType, 2000);
    // Ajuste multiway realista según número de rivales activos en la mano
    const multiwayPenalty = Math.pow(0.83, Math.max(0, activeOpponents.length - 1));
    const equity = Math.min(0.99, Math.max(0.01, (mc.equity / 100) * multiwayPenalty));

    const made = PokerEngine.evaluateHand([...hero.cards, ...this.board]);
    const draws = PokerEngine.analyzeDrawsAndOuts(hero.cards, this.board);
    const impliedBonus = (draws.outs >= 8 && this.street !== 'river') ? (draws.outs * 0.012 * Math.min(hero.stack, this.pot)) : 0;

    // 2. Calcular Fold Equity promedio según los perfiles reales de los rivales activos
    const avgFoldToBet = activeOpponents.length > 0
      ? activeOpponents.reduce((acc, opp) => acc + (opp.profile ? opp.profile.foldToBet : 0.42), 0) / activeOpponents.length
      : 0.40;
    const foldEquity = Math.min(0.75, Math.max(0.08, Math.pow(avgFoldToBet, activeOpponents.length)));

    // 3. Calcular EV exacto en Big Blinds (BB) para cada acción disponible
    // A) EV(Fold) = 0 BB (referencia base desde el punto de decisión actual)
    const evFoldBB = 0;

    // B) EV(Check / Call)
    let evCallBB;
    if (toCall === 0) {
      // Check realiza parte de la equity sin invertir fichas adicionales
      const realization = ['BTN', 'BTN / SB', 'CO'].includes(pos) ? 0.95 : 0.82;
      evCallBB = ((equity * this.pot * realization) + impliedBonus) / this.bb;
    } else {
      // EV(Call) = Equity * (Pot + Call + Implied) - (1 - Equity) * Call
      const rawEvCall = (equity * (this.pot + impliedBonus)) - ((1 - equity) * toCall);
      evCallBB = rawEvCall / this.bb;
    }

    // C) EV(Bet / Raise) con sizing estándar (~65% bote o subida 2.5x)
    const raiseSize = toCall === 0
      ? Math.min(hero.stack, Math.max(this.bb, Math.round(this.pot * 0.65)))
      : Math.min(hero.stack, Math.max(this.minRaise - hero.bet, toCall + Math.round(this.pot * 0.65)));

    // Cuando apostamos/subimos: ganamos el bote actual con prob = foldEquity,
    // y cuando nos pagan (1 - foldEquity), jugamos un bote más grande donde el rango rival es más fuerte
    const callerEquity = Math.max(0.05, equity * 0.86);
    const potWhenCalled = this.pot + raiseSize * 2;
    const rawEvRaise = (foldEquity * this.pot) + ((1 - foldEquity) * ((callerEquity * potWhenCalled) - raiseSize));
    const evRaiseBB = hero.stack > toCall ? (rawEvRaise / this.bb) : -999;

    // Determinar mejor acción y ordenar opciones
    const options = [
      { action: 'fold', label: 'Fold (Retirarse)', ev: evFoldBB },
      { action: 'call', label: toCall === 0 ? 'Check (Pasar)' : `Call (Pagar ${toCall})`, ev: evCallBB }
    ];
    if (evRaiseBB > -900) {
      options.push({ action: 'raise', label: toCall === 0 ? `Bet (~${raiseSize})` : `Raise (~${hero.bet + raiseSize})`, ev: evRaiseBB });
    }
    options.sort((a, b) => b.ev - a.ev);
    const bestOption = options[0];

    this.currentDecisionAnalysis = {
      pos,
      street: this.street.toUpperCase(),
      hand: hero.cards.map(c => PokerEngine.cardToObj(c).code).join(''),
      madeName: made.name,
      outs: draws.outs,
      equityPct: equity * 100,
      potOddsPct: potOdds * 100,
      toCall,
      pot: this.pot,
      spr,
      foldEquityPct: foldEquity * 100,
      rivalsSummary: activeOpponents.map(o => o.profile ? o.profile.style : 'Rival').join(', '),
      options,
      bestOption
    };

    // Actualizar métricas en el panel
    const coachPanel = document.getElementById('live-coach-panel');
    document.getElementById('coach-position-badge').textContent = `Pos: ${pos}`;
    document.getElementById('coach-equity').textContent = (equity * 100).toFixed(1) + '%';
    document.getElementById('coach-pot-odds').textContent = toCall > 0 ? (potOdds * 100).toFixed(1) + '%' : '0.0%';
    document.getElementById('coach-spr').textContent = spr < 50 ? spr.toFixed(1) : '∞';
    document.getElementById('coach-hand-strength').textContent = made.name + (draws.outs > 0 ? ` (+${draws.outs} outs)` : '');

    if (appState.config.showCoach) {
      coachPanel.classList.remove('opacity-75');
      document.getElementById('coach-advice-text').innerHTML =
        `Mejor línea proyectada: <strong class="text-emerald-400">${bestOption.label}</strong> (${bestOption.ev >= 0 ? '+' : ''}${bestOption.ev.toFixed(2)} BB) frente a ${activeOpponents.length} rival(es).`;
    } else {
      document.getElementById('coach-advice-text').textContent = 'Modo Examen activo: actúa y recibirás la calificación detallada al instante.';
    }

    this.refreshTableOverlays();
  },

  // Sincroniza arena + HUD flotante con el estado real de la mano.
  refreshTableOverlays() {
    if (typeof arena !== 'undefined') arena.updateInfo();
    if (typeof eyeballHUD !== 'undefined') eyeballHUD.render();
  },

  // Feedback visual breve sobre el botón pulsado: verde (buena), ámbar (normal), rojo (mala).
  flashActionButton(action, kind) {
    const btn = document.getElementById(`btn-${action}`);
    if (!btn || !kind) return;
    btn.classList.remove('action-flash-good', 'action-flash-normal', 'action-flash-bad');
    void btn.offsetWidth;
    btn.classList.add(`action-flash-${kind}`);
    setTimeout(() => btn.classList.remove(`action-flash-${kind}`), 650);
  },

  humanAction(type, isTimeout = false) {
    const hero = this.players[0];
    if (!this.handInProgress || this.turnIdx !== 0) return;

    if (this.heroTimerInterval) {
      clearInterval(this.heroTimerInterval);
      this.heroTimerInterval = null;
    }

    const toCall = Math.max(0, this.currentBet - hero.bet);
    let raiseTarget = parseInt(document.getElementById('raise-slider').value, 10) || 0;

    // Calificar la jugada al estilo Chess.com antes de ejecutarla
    const gradeKind = this.gradeHeroMove(type, toCall, raiseTarget, isTimeout);
    this.flashActionButton(type, gradeKind);

    this.disableHumanControls();

    if (type === 'fold') {
      hero.folded = true;
      hero.acted = true;
      hero.lastAction = isTimeout ? 'Fold (Tiempo)' : 'Fold';
      SoundFX.playFold();
      this.log(`TÚ te retiras (${hero.lastAction}).`);
    } else if (type === 'call') {
      if (toCall === 0) {
        hero.acted = true;
        hero.lastAction = isTimeout ? 'Check (Tiempo)' : 'Check';
        SoundFX.playCheck();
        this.log(`TÚ pasas (${hero.lastAction}).`);
      } else {
        this.postChips(0, toCall);
        hero.acted = true;
        hero.lastAction = hero.allIn ? 'All-In Call' : `Call ${toCall}`;
        if (hero.allIn) SoundFX.playAllIn();
        else SoundFX.playCall();
        this.log(`TÚ pagas ${toCall}.`);
      }
    } else if (type === 'raise') {
      const addChips = Math.max(1, raiseTarget - hero.bet);
      const raiseDiff = raiseTarget - this.currentBet;
      this.postChips(0, addChips);
      this.currentBet = hero.bet;
      this.minRaise = this.currentBet + Math.max(this.bb, raiseDiff);
      this.players.forEach(p => { if (!p.folded && !p.allIn) p.acted = false; });
      hero.acted = true;
      hero.lastAction = hero.allIn ? `All-In ${hero.bet}` : `Raise ${hero.bet}`;
      if (hero.allIn) SoundFX.playAllIn();
      else SoundFX.playRaise();
      this.log(`TÚ subes a ${hero.bet}.`);
    }

    this.turnIdx = (this.turnIdx + 1) % this.tableSize;
    this.processTurn();
  },

  /**
   * SISTEMA DE CALIFICACIÓN GRADUADA ESTILO CHESS.COM (!!, !, ✓, ?!, ?, ??)
   */
  gradeHeroMove(chosenAction, toCall, raiseTarget, isTimeout) {
    const analysis = this.currentDecisionAnalysis;
    if (!analysis) return;

    const chosenOpt = analysis.options.find(o => o.action === chosenAction) || analysis.options[0];
    const bestOpt = analysis.bestOption;
    const evLossBB = Math.max(0, bestOpt.ev - chosenOpt.ev);

    // Penalización extra si foldea pudiendo hacer check gratis
    const freeCheckBlunder = (chosenAction === 'fold' && toCall === 0);
    let effectiveLoss = freeCheckBlunder ? Math.max(1.5, evLossBB + 1.5) : evLossBB;
    // Agotar el reloj es una decisión forzada: nunca debe puntuarse como óptima.
    if (isTimeout) effectiveLoss = Math.max(1.5, effectiveLoss + 1.5);

    // Calcular porcentaje de acierto (0% a 100%) en función de la pérdida de EV en BB
    let accuracyPct;
    if (effectiveLoss <= 0.05) accuracyPct = 100;
    else if (effectiveLoss <= 0.35) accuracyPct = Math.round(95 - (effectiveLoss / 0.35) * 15); // 80-95%
    else if (effectiveLoss <= 0.90) accuracyPct = Math.round(79 - ((effectiveLoss - 0.35) / 0.55) * 19); // 60-79%
    else if (effectiveLoss <= 2.00) accuracyPct = Math.round(59 - ((effectiveLoss - 0.90) / 1.10) * 24); // 35-59%
    else if (effectiveLoss <= 4.00) accuracyPct = Math.round(34 - ((effectiveLoss - 2.00) / 2.00) * 19); // 15-34%
    else accuracyPct = Math.max(0, Math.round(14 - Math.min(14, (effectiveLoss - 4.0) * 2.5)));

    // Asignar categoría visual estilo Chess.com
    let grade;
    if (accuracyPct >= 95) {
      grade = {
        symbol: '!!',
        label: '!! BRILLANTE',
        title: 'Jugada Óptima',
        cardClass: 'bg-cyan-950/75 border-cyan-400/60 text-cyan-100',
        badgeClass: 'bg-cyan-500 text-slate-950',
        isGood: true
      };
    } else if (accuracyPct >= 80) {
      grade = {
        symbol: '!',
        label: '! EXCELENTE',
        title: 'Excelente Decisión',
        cardClass: 'bg-emerald-950/75 border-emerald-400/60 text-emerald-100',
        badgeClass: 'bg-emerald-500 text-slate-950',
        isGood: true
      };
    } else if (accuracyPct >= 60) {
      grade = {
        symbol: '✓',
        label: '✓ ÓPTIMA',
        title: 'Jugada Correcta',
        cardClass: 'bg-teal-950/70 border-teal-500/50 text-teal-100',
        badgeClass: 'bg-teal-500 text-slate-950',
        isGood: true
      };
    } else if (accuracyPct >= 35) {
      grade = {
        symbol: '?!',
        label: '?! IMPRECISA',
        title: 'Imprecisión',
        cardClass: 'bg-amber-950/75 border-amber-400/60 text-amber-100',
        badgeClass: 'bg-amber-400 text-slate-950',
        isGood: false
      };
    } else if (accuracyPct >= 15) {
      grade = {
        symbol: '?',
        label: '? ERROR',
        title: 'Error (-EV)',
        cardClass: 'bg-orange-950/80 border-orange-500/60 text-orange-100',
        badgeClass: 'bg-orange-500 text-slate-950',
        isGood: false
      };
    } else {
      grade = {
        symbol: '??',
        label: '?? PÉSIMA',
        title: 'Error Grave (Blunder)',
        cardClass: 'bg-rose-950/85 border-rose-500/70 text-rose-100',
        badgeClass: 'bg-rose-500 text-white',
        isGood: false
      };
    }

    // Feedback sonoro y pop-up unificado (la explicación detallada sigue en el Coach)
    SoundFX.playGrade(grade.symbol, isTimeout);
    if (typeof gradePopup !== 'undefined') gradePopup.show(accuracyPct, grade.symbol);
    const gradeKind = grade.isGood ? 'good' : (accuracyPct >= 35 ? 'normal' : 'bad');

    // Construir explicación detallada con números reales
    let explanation = '';
    if (isTimeout) {
      explanation = `Se agotaron los 60 segundos de reloj. `;
    }

    if (freeCheckBlunder) {
      explanation += `Hiciste Fold enfrentando 0 fichas de apuesta. Pasar (Check) era gratis y te permitía realizar tu ${analysis.equityPct.toFixed(1)}% de equity sin riesgo.`;
    } else if (grade.isGood) {
      explanation += `Con ${analysis.madeName} (${analysis.equityPct.toFixed(1)}% equity${analysis.outs > 0 ? `, ${analysis.outs} outs` : ''}) en ${analysis.pos}, tu elección (${chosenOpt.label}) captura prácticamente todo el valor disponible frente a Pot Odds del ${analysis.potOddsPct.toFixed(1)}% y rivales (${analysis.rivalsSummary}).`;
    } else {
      explanation += `Tu equity real es ${analysis.equityPct.toFixed(1)}%${analysis.outs > 0 ? ` (${analysis.outs} outs)` : ''} frente a Pot Odds del ${analysis.potOddsPct.toFixed(1)}% (Fold Equity rival est. ${analysis.foldEquityPct.toFixed(0)}%). La línea superior era ${bestOpt.label} (${bestOpt.ev >= 0 ? '+' : ''}${bestOpt.ev.toFixed(2)} BB), superando a tu jugada por +${effectiveLoss.toFixed(2)} BB a largo plazo.`;
    }

    // Guardar en estadísticas globales
    if (grade.isGood) {
      appState.stats.goodDecisions += 1;
    } else {
      appState.stats.badDecisions += 1;
      appState.stats.evLostBB += effectiveLoss;
    }

    appState.stats.history.unshift({
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      street: analysis.street,
      hand: analysis.hand,
      action: `${grade.symbol} ${chosenOpt.label} (${accuracyPct}%)`,
      optimal: grade.isGood,
      evLoss: effectiveLoss.toFixed(2),
      reason: explanation
    });
    if (appState.stats.history.length > 50) appState.stats.history.pop();
    saveState();

    // Renderizar tarjeta de calificación en el Coach
    const fb = document.getElementById('coach-last-feedback');
    fb.className = `rounded-xl border p-3.5 space-y-2.5 transition-all ${grade.cardClass}`;
    fb.classList.remove('hidden');

    const symEl = document.getElementById('grade-symbol');
    symEl.textContent = grade.symbol;
    symEl.className = `w-7 h-7 rounded-lg flex items-center justify-center font-mono font-extrabold text-sm shadow ${grade.badgeClass}`;

    document.getElementById('grade-title').textContent = grade.title;
    document.getElementById('grade-ev-diff').textContent = effectiveLoss <= 0.05
      ? `EV Máximo (${chosenOpt.ev >= 0 ? '+' : ''}${chosenOpt.ev.toFixed(2)} BB)`
      : `Diferencia: -${effectiveLoss.toFixed(2)} BB vs Óptimo`;
    document.getElementById('grade-accuracy').textContent = `${accuracyPct}%`;
    document.getElementById('grade-explanation').textContent = explanation;

    document.getElementById('grade-ev-breakdown').innerHTML = analysis.options.map((opt, i) => {
      const isChosen = opt.action === chosenAction;
      const isBest = i === 0;
      return `
        <div class="flex items-center justify-between ${isBest ? 'text-emerald-400 font-bold' : isChosen ? 'text-amber-300' : 'text-slate-400'}">
          <span>${isBest ? '★ ' : isChosen ? '▸ ' : '  '}${opt.label}</span>
          <span>${opt.ev >= 0 ? '+' : ''}${opt.ev.toFixed(2)} BB</span>
        </div>
      `;
    }).join('');

    return gradeKind;
  },

  executeBotTurn(bot) {
    if (!this.handInProgress) return;
    const prof = bot.profile;
    const toCall = Math.max(0, this.currentBet - bot.bet);

    let strength = PokerEngine.preflopHandPercentile(bot.cards[0], bot.cards[1]);
    if (this.board.length >= 3) {
      const mc = PokerEngine.runMonteCarlo(bot.cards, null, this.board, 'range_random', 300);
      strength = mc.equity / 100;
    }

    const rng = Math.random();
    if (prof.id === 'rng') {
      strength = strength * 0.45 + rng * 0.55;
    }

    const potOdds = toCall > 0 ? toCall / (this.pot + toCall) : 0;
    const effectiveStrength = strength + prof.callLoose;

    let chosen = 'fold';
    let targetBet = 0;

    if (toCall === 0) {
      const wantsValueBet = strength > (1 - prof.agg * 0.65);
      const wantsBluff = (this.street !== 'preflop' && rng < prof.bluffFreq);
      if (wantsValueBet || wantsBluff) {
        chosen = 'raise';
        const mult = prof.id === 'maniac' ? (0.85 + rng * 0.6) : (0.45 + rng * 0.35);
        const sizing = Math.max(this.bb, Math.round(this.pot * mult));
        targetBet = Math.min(bot.bet + bot.stack, this.currentBet + sizing);
      } else {
        chosen = 'call';
      }
    } else {
      if (this.street === 'preflop' && this.currentBet === this.bb && strength < (1 - prof.vpip) && rng > 0.12) {
        chosen = 'fold';
      } else if (effectiveStrength >= potOdds + 0.06 || (rng < prof.bluffFreq * 0.45 && this.street !== 'preflop')) {
        if ((strength > (1 - prof.pfr * 0.9) || rng < prof.bluffFreq * 0.5) && bot.stack > toCall * 2 && rng < prof.agg) {
          chosen = 'raise';
          const raiseAmt = Math.max(this.minRaise, Math.round(this.currentBet * 2.5 + this.pot * 0.35));
          targetBet = Math.min(bot.bet + bot.stack, raiseAmt);
        } else {
          chosen = 'call';
        }
      } else {
        chosen = 'fold';
      }
    }

    if (chosen === 'fold') {
      bot.folded = true;
      bot.acted = true;
      bot.lastAction = 'Fold';
      SoundFX.playFold();
      this.log(`${bot.name} se retira.`);
    } else if (chosen === 'call') {
      if (toCall === 0) {
        bot.acted = true;
        bot.lastAction = 'Check';
        SoundFX.playCheck();
        this.log(`${bot.name} pasa (Check).`);
      } else {
        this.postChips(bot.seat, toCall);
        bot.acted = true;
        bot.lastAction = bot.allIn ? 'All-In' : `Call ${toCall}`;
        if (bot.allIn) SoundFX.playAllIn();
        else SoundFX.playCall();
        this.log(`${bot.name} paga ${toCall}.`);
      }
    } else if (chosen === 'raise') {
      const add = Math.max(1, targetBet - bot.bet);
      const diff = targetBet - this.currentBet;
      this.postChips(bot.seat, add);
      this.currentBet = bot.bet;
      this.minRaise = this.currentBet + Math.max(this.bb, diff);
      this.players.forEach(p => { if (!p.folded && !p.allIn) p.acted = false; });
      bot.acted = true;
      bot.lastAction = bot.allIn ? `All-In ${bot.bet}` : `Raise ${bot.bet}`;
      if (bot.allIn) SoundFX.playAllIn();
      else SoundFX.playRaise();
      this.log(`${bot.name} sube a ${bot.bet}.`);
    }

    this.turnIdx = (this.turnIdx + 1) % this.tableSize;
    this.processTurn();
  },

  advanceStreet() {
    this.players.forEach(p => {
      p.bet = 0;
      p.acted = false;
      if (!p.folded && !p.allIn) p.lastAction = '';
    });
    this.currentBet = 0;
    this.minRaise = this.bb;
    this.currentDecisionAnalysis = null;

    if (this.street === 'preflop') {
      this.street = 'flop';
      this.board.push(this.deck.pop(), this.deck.pop(), this.deck.pop());
      SoundFX.playDeal();
      this.log(`=== FLOP: ${this.board.map(c => PokerEngine.cardToObj(c).code).join(' ')} ===`);
    } else if (this.street === 'flop') {
      this.street = 'turn';
      this.board.push(this.deck.pop());
      SoundFX.playDeal();
      this.log(`=== TURN: ${PokerEngine.cardToObj(this.board[3]).code} ===`);
    } else if (this.street === 'turn') {
      this.street = 'river';
      this.board.push(this.deck.pop());
      SoundFX.playDeal();
      this.log(`=== RIVER: ${PokerEngine.cardToObj(this.board[4]).code} ===`);
    } else {
      SoundFX.playShowdown();
      this.resolveShowdown();
      return;
    }

    // Postflop siempre comienza en el primer jugador activo a la izquierda del Dealer (SB en 6/9-Max, BB en Heads-Up)
    this.turnIdx = (this.dealerIdx + 1) % this.tableSize;
    this.processTurn();
  },

  finishHandByFold(winner) {
    this.stopAllTimers();
    this.handInProgress = false;
    this.street = 'showdown';
    const wonAmount = this.pot;
    winner.stack += wonAmount;
    this.winnerIdx = winner.seat;
    this.log(`🏆 ${winner.name} gana el bote de ${wonAmount} fichas.`);
    if (winner.isHuman) SoundFX.playWin();
    else SoundFX.playLose();
    this.pot = 0;
    this.disableHumanControls();
    this.recordHandOutcome();
    this.renderTable();
    this.scheduleNextHand(`🏆 ${winner.name} gana ${wonAmount} fichas`);
  },

  resolveShowdown() {
    this.stopAllTimers();
    this.handInProgress = false;
    this.street = 'showdown';
    this.disableHumanControls();

    const contenders = this.players.filter(p => !p.folded);
    let bestScore = -1;
    let winners = [];

    contenders.forEach(p => {
      const ev = PokerEngine.evaluateHand([...p.cards, ...this.board]);
      p.evalResult = ev;
      if (ev.score > bestScore) {
        bestScore = ev.score;
        winners = [p];
      } else if (ev.score === bestScore) {
        winners.push(p);
      }
    });

    if (winners.length === 0) return;

    const wonAmount = this.pot;
    const share = Math.floor(wonAmount / winners.length);
    winners.forEach(w => { w.stack += share; });

    if (winners.some(w => w.isHuman)) SoundFX.playWin();
    else SoundFX.playLose();

    const winNames = winners.map(w => `${w.name} (${w.evalResult.name})`).join(' y ');
    this.winnerIdx = winners[0].seat;
    this.log(`🏆 SHOWDOWN: ${winNames} gana ${wonAmount} fichas.`);
    this.pot = 0;
    this.recordHandOutcome();
    this.renderTable();
    this.scheduleNextHand(`🏆 ${winNames} gana ${wonAmount} fichas`);
  },

  recordHandOutcome() {
    const hero = this.players[0];
    const diffChips = hero.stack - this.heroStartingStack;
    const diffBB = diffChips / this.bb;
    appState.stats.handsPlayed += 1;
    appState.stats.netProfitBB += diffBB;
    saveState();
  },

  // Descomposición real: el color de cada ficha dice su valor (2 azules = 200).
  // Máximo 5 fichas por montón y varios montones en fila; si no caben, una tarjeta
  // con el importe. El all-in se marca con una tarjeta triangular.
  chipPileHTML(amount, maxStacks = CHIP_STACKS_PLAYER, allIn = false, showAmount = true) {
    const total = Math.max(0, Math.floor(amount || 0));
    if (total === 0 && !allIn) return '';

    const card = (triangle) => `
      <div class="chip-card ${triangle ? 'chip-card--allin' : ''}" title="${triangle ? 'All-in' : 'Importe'} de ${total} fichas">
        ${triangle ? '<span class="chip-card-unit">ALL-IN</span>' : ''}
        <span class="chip-card-value">${total}</span>
        ${triangle ? '' : '<span class="chip-card-unit">FICHAS</span>'}
      </div>`;

    if (allIn) return card(true);

    let remaining = total;
    const chips = [];
    for (const denom of CHIP_DENOMINATIONS) {
      const count = Math.floor(remaining / denom.value);
      if (count === 0) continue;
      remaining -= count * denom.value;
      for (let i = 0; i < count; i++) chips.push(denom);
    }

    if (chips.length === 0 || chips.length > maxStacks * CHIP_STACK_MAX) return card(false);

    const stacks = [];
    for (let i = 0; i < chips.length; i += CHIP_STACK_MAX) {
      const group = chips.slice(i, i + CHIP_STACK_MAX);
      const height = `calc(var(--chip-v, 36px) + ${group.length - 1} * var(--chip-step, 8px))`;
      const sprites = group.map((d, j) =>
        `<span class="chip-sprite chip-sprite--${d.color}" style="bottom:calc(${j} * var(--chip-step, 8px))"></span>`
      ).join('');
      const breakdown = group.map(d => d.value).join(' + ');
      stacks.push(`<span class="chip-pile" style="height:${height}" title="${group.length} fichas: ${breakdown}">${sprites}</span>`);
    }

    const label = showAmount ? `<span class="chip-amount">${total}</span>` : '';
    return `<div class="chip-stacks">${stacks.join('')}</div>${label}`;
  },

  renderTable() {
    document.getElementById('game-pot-display').textContent = this.pot;
    document.getElementById('game-street-badge').textContent = this.street.toUpperCase();

    const potChips = document.getElementById('pot-chip-stack');
    if (potChips) potChips.innerHTML = this.chipPileHTML(this.pot, CHIP_STACKS_POT, false, false);

    // Community Board
    const boardBox = document.getElementById('game-board-cards');
    let boardHTML = '';
    for (let i = 0; i < 5; i++) {
      if (this.board[i] !== undefined) {
        boardHTML += renderCardHTML(this.board[i], 'sm');
      } else {
        boardHTML += `<div class="w-10 h-14 rounded-lg border border-emerald-400/20 bg-black/25"></div>`;
      }
    }
    boardBox.innerHTML = boardHTML;

    const layout = SEAT_LAYOUTS[this.tableSize] || SEAT_LAYOUTS[6];
    const seatsLayer = document.getElementById('table-seats-layer');
    const betsLayer = document.getElementById('table-bets-layer');

    let seatsHTML = '';
    let betsHTML = '';

    this.players.forEach(p => {
      const coords = layout[p.seat];
      const isTurn = this.handInProgress && this.turnIdx === p.seat;
      const isDealer = this.dealerIdx === p.seat;
      const isWinner = !this.handInProgress && this.winnerIdx === p.seat;
      const winnerTag = isWinner ? '<span class="text-[10px] font-bold text-amber-300 whitespace-nowrap">🏆 GANADOR</span>' : '';
      const posLabel = this.getSeatPositionLabel(p.seat);

      // El botón de dealer va hacia el centro del tapete; las fichas viven dentro
      // del panel de cada jugador para que se sepa de quién son y no tapes texto.
      if (isDealer) {
        betsHTML += `
          <div style="${coords.chip}" class="absolute -translate-x-1/2 -translate-y-1/2">
            <span class="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[10px] flex items-center justify-center shadow-md border border-amber-200">D</span>
          </div>
        `;
      }

      const betHTML = (p.bet > 0 || p.allIn)
        ? `<div class="mt-1 flex flex-col items-center">${this.chipPileHTML(p.bet, CHIP_STACKS_PLAYER, p.allIn)}</div>`
        : '';

      if (p.isHuman) {
        // Héroe abajo centro + Barra de Tiempo de 60s
        const heroEval = p.cards.length === 2 ? PokerEngine.evaluateHand([...p.cards, ...this.board]).name : '';
        const showTimer = this.handInProgress && this.turnIdx === 0;

        seatsHTML += `
          <div style="${coords.seat}" class="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <div class="bg-slate-950/95 border-2 ${isWinner ? 'border-amber-400 ring-4 ring-amber-500/30' : isTurn ? 'border-emerald-400 ring-4 ring-emerald-500/25' : 'border-slate-700'} rounded-2xl px-3.5 py-2.5 shadow-2xl min-w-[200px] sm:min-w-[265px] hero-panel">
              <div class="flex items-center gap-3">
                <div class="flex gap-1">
                  ${p.cards.length === 2 ? renderCardHTML(p.cards[0], 'sm') + renderCardHTML(p.cards[1], 'sm') : ''}
                </div>
                <div class="text-left flex-1 min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">${posLabel}</span>
                    ${winnerTag}
                    <span class="text-xs sm:text-sm font-extrabold text-white truncate">${p.name}</span>
                  </div>
                  <div class="text-sm font-mono font-extrabold text-emerald-400">${p.stack}</div>
                  <div class="text-[10px] font-mono text-slate-300 truncate">${heroEval}</div>
                </div>
              </div>
              ${betHTML}
              <!-- Hero 60-Second Action Timer Bar -->
              <div class="mt-2 pt-1.5 border-t border-slate-800/90 ${showTimer ? '' : 'opacity-30'}">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-[9px] font-mono uppercase tracking-wider text-slate-400">${showTimer ? 'Tu reloj de decisión' : 'Esperando turno'}</span>
                  <span id="hero-timer-text" class="text-[10px] font-mono font-bold text-emerald-400">${showTimer ? `${this.heroSecondsLeft}s` : '60s'}</span>
                </div>
                <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div id="hero-timer-bar" class="h-full bg-emerald-500 transition-all duration-1000 linear" style="width: ${showTimer ? (this.heroSecondsLeft / 60) * 100 : 100}%"></div>
                </div>
              </div>
            </div>
          </div>
        `;
      } else {
        // Asiento Rival alrededor del óvalo
        const showCards = this.street === 'showdown' && !p.folded;
        const cardsHTML = p.cards.length === 2
          ? (p.folded
            ? `<div class="opacity-25 flex gap-0.5">${renderCardHTML(null, 'xs', true)}${renderCardHTML(null, 'xs', true)}</div>`
            : `<div class="flex gap-0.5">${renderCardHTML(p.cards[0], 'xs', !showCards)}${renderCardHTML(p.cards[1], 'xs', !showCards)}</div>`)
          : '';

        const showProfileTag = appState.config.showProfiles && p.profile;

        seatsHTML += `
          <div style="${coords.seat}" class="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <div class="bg-slate-950/95 border ${isWinner ? 'border-amber-400 ring-2 ring-amber-400/60' : isTurn ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-slate-700/90'} ${p.folded ? 'opacity-45' : ''} rounded-xl p-2 w-[114px] sm:w-[132px] text-center shadow-xl transition rival-panel">
              <div class="flex items-center justify-between text-[9px] font-mono mb-0.5">
                <span class="px-1.5 py-0.2 rounded bg-slate-800 text-slate-200 font-bold">${posLabel}</span>
                ${p.lastAction ? `<span class="last-action text-amber-300 font-bold truncate max-w-[65px]">${p.lastAction}</span>` : '<span class="last-action text-slate-500">--</span>'}
              </div>
              <div class="text-[11px] font-bold text-white truncate">${p.name} ${winnerTag}</div>
              ${showProfileTag ? `<div class="profile-tag mt-0.5"><span class="inline-block text-[9px] font-mono px-1.5 py-0.2 rounded border ${p.profile.badge}">${p.profile.style}</span></div>` : ''}
              <div class="text-[11px] font-mono text-emerald-400 font-bold mt-0.5">${p.stack}</div>
              <div class="flex justify-center mt-1">${cardsHTML}</div>
              ${betHTML}
            </div>
          </div>
        `;
      }
    });

    seatsLayer.innerHTML = seatsHTML;
    betsLayer.innerHTML = betsHTML;
    this.clampSeatsToWrap();
    this.refreshTableOverlays();
  },

  // Ajusta los paneles (con fichas incluidas) para que no se salgan del tapete
  // ni se pisen entre sí. Las coordenadas base se leen una sola vez del HTML
  // recién generado y los desplazamientos se acumulan aparte: así un resize o
  // un nuevo render no desplaza los paneles cada vez más hacia un borde.
  clampSeatsToWrap() {
    const wrap = document.getElementById('arena-table-wrap');
    const layer = document.getElementById('table-seats-layer');
    if (!wrap || !layer) return;

    const bounds = wrap.getBoundingClientRect();
    const items = [...layer.children]
      .map(child => ({
        child,
        panel: child.firstElementChild,
        baseLeft: parseFloat(child.style.left) || 0,
        baseTop: parseFloat(child.style.top) || 0,
        dx: 0,
        dy: 0
      }))
      .filter(item => item.panel);

    const apply = (item) => {
      item.child.style.left = `calc(${item.baseLeft}% + ${item.dx}px)`;
      item.child.style.top = `calc(${item.baseTop}% + ${item.dy}px)`;
    };
    const clampOne = (item) => {
      const r = item.panel.getBoundingClientRect();
      let dx = 0;
      let dy = 0;
      if (r.left < bounds.left + 3) dx = bounds.left + 3 - r.left;
      else if (r.right > bounds.right - 3) dx = bounds.right - 3 - r.right;
      if (r.top < bounds.top + 3) dy = bounds.top + 3 - r.top;
      else if (r.bottom > bounds.bottom - 3) dy = bounds.bottom - 3 - r.bottom;
      if (dx || dy) {
        item.dx += dx;
        item.dy += dy;
        apply(item);
      }
    };

    items.forEach(clampOne);

    for (let pass = 0; pass < 6; pass++) {
      let moved = false;
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i].panel.getBoundingClientRect();
          const b = items[j].panel.getBoundingClientRect();
          const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (overlapX <= 0 || overlapY <= 0) continue;

          const vertical = overlapY <= overlapX;
          const aCenter = vertical ? (a.top + a.bottom) : (a.left + a.right);
          const bCenter = vertical ? (b.top + b.bottom) : (b.left + b.right);
          const sign = aCenter <= bCenter ? 1 : -1;
          const distance = (vertical ? overlapY : overlapX) + 3;

          // Mueve el panel que tenga más hueco libre en esa dirección: si uno
          // está pegado al borde, el clamp lo devolvería y el solape seguiría.
          const room = (rect, dir) => vertical
            ? (dir > 0 ? bounds.bottom - 3 - rect.bottom : rect.top - bounds.top - 3)
            : (dir > 0 ? bounds.right - 3 - rect.right : rect.left - bounds.left - 3);
          const roomA = room(a, -sign);
          const roomB = room(b, sign);
          const target = roomB >= roomA ? items[j] : items[i];
          const dir = roomB >= roomA ? sign : -sign;
          if (vertical) target.dy += dir * distance;
          else target.dx += dir * distance;

          apply(target);
          clampOne(target);
          moved = true;
        }
      }
      if (!moved) break;
    }
  },

  log(msg) {
    const box = document.getElementById('game-log-box');
    const line = document.createElement('div');
    line.textContent = msg;
    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
  },

  clearLog() {
    document.getElementById('game-log-box').innerHTML = '';
  }
};
