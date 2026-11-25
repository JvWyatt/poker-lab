/* ============================================================================
   8. MÓDULO: GTO (FUENTE ÚNICA DE FRECUENCIAS + MATRIZ INTERACTIVA 13x13)

   Modelo inspirado en la filosofía de Preflop Vision (ZerosPoker): tablas por
   posición + secuencia + tamaño + stack, con frecuencias mixtas por combo.
   NO son las tablas propietarias del solver de Zeros: son una aproximación
   determinista, auditable y compartida por matriz, ojito y calificador EV.
============================================================================ */

const GTO_RANGES = {
  UTG: { openThreshold: 0.70, threeBetThreshold: 0.90, callThreshold: 0.62 },
  MP:  { openThreshold: 0.66, threeBetThreshold: 0.88, callThreshold: 0.60 },
  CO:  { openThreshold: 0.60, threeBetThreshold: 0.85, callThreshold: 0.56 },
  BTN: { openThreshold: 0.50, threeBetThreshold: 0.80, callThreshold: 0.50 },
  SB:  { openThreshold: 0.56, threeBetThreshold: 0.84, callThreshold: 0.54 },
  BB:  { openThreshold: 0.45, threeBetThreshold: 0.78, callThreshold: 0.45 }
};

const GTO_POSITIONS = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
const GTO_SITUATION_LABEL = {
  rfi: 'RFI / Apertura',
  vs_open: 'Vs apertura',
  vs_3bet: 'Vs 3-Bet',
  blind_defense: 'Defensa BB'
};

/**
 * Motor de frecuencias mixtas. Una sola función para:
 *  - matriz 13x13 (gtoView)
 *  - HUD «ojito» preflop (eyeballHUD)
 *  - calificación EV (game.computeRealEVMatrix / gradeHeroMove)
 */
const GTOEngine = {
  PURE_FOLD: new Set([
    '72o', '83o', '94o', '82o', '73o', '92o', '62o', '52o', '42o', '32o',
    '93o', '74o', '84o', '95o', '64o', '53o', '43o', '63o', '75o', '85o'
  ]),

  PREMIUM: new Set(['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AQs']),
  STRONG: new Set(['AJs', 'ATs', 'KQs', 'KJs', 'QJs', 'AQo', '99', '88', '77']),
  MEDIUM: new Set([
    'AJo', 'ATo', 'KQo', 'KTs', 'QTs', 'JTs', 'T9s', '98s', '87s', '76s',
    'A5s', 'A4s', 'A3s', 'A2s', 'K9s', 'Q9s', 'J9s', '66', '55', '44', '33', '22'
  ]),

  // RFI: [UTG, MP, CO, BTN, SB, BB]
  RFI_RAISE: {
    premium: [100, 100, 100, 100, 100, 100],
    strong:  [55, 62, 70, 80, 74, 86],
    medium:  [8, 14, 26, 44, 34, 50],
    marginal:[2, 4, 10, 20, 14, 24],
    trash:   [0, 0, 0, 0, 0, 0]
  },
  RFI_CALL: {
    premium: [0, 0, 0, 0, 0, 0],
    strong:  [10, 10, 8, 6, 8, 5],
    medium:  [14, 18, 22, 24, 24, 26],
    marginal:[10, 14, 18, 22, 20, 24],
    trash:   [0, 0, 0, 0, 0, 0]
  },

  VS_OPEN_RAISE: {
    premium: [100, 100, 85, 85, 90, 95],
    strong:  [18, 22, 28, 32, 30, 34],
    medium:  [4, 6, 8, 10, 9, 12],
    marginal:[0, 1, 2, 3, 2, 4],
    trash:   [0, 0, 0, 0, 0, 0]
  },
  VS_3BET_RAISE: {
    premium: [100, 100, 65, 65, 75, 80],
    strong:  [6, 8, 10, 12, 11, 14],
    medium:  [0, 1, 2, 3, 2, 4],
    marginal:[0, 0, 1, 1, 1, 2],
    trash:   [0, 0, 0, 0, 0, 0]
  },

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  },

  label(r1, r2, suited) {
    if (r1 === r2) return RANKS[r1] + RANKS[r2];
    return RANKS[r1] + RANKS[r2] + (suited ? 's' : 'o');
  },

  positionIndex(pos) {
    const idx = GTO_POSITIONS.indexOf(pos);
    return idx < 0 ? 3 : idx; // BTN por defecto
  },

  /** Clasificación estable de la mano (sin aleatoriedad). */
  tierOf(label, r1, r2, suited) {
    if (this.PURE_FOLD.has(label)) return 'trash';
    if (this.PREMIUM.has(label)) return 'premium';
    if (this.STRONG.has(label)) return 'strong';
    if (this.MEDIUM.has(label)) return 'medium';

    if (r1 === r2) return r1 >= 7 ? 'strong' : 'medium';       // 77-99 / 22-66
    if (suited) {
      if (r1 >= 11 && r2 >= 9) return 'strong';
      if (r1 >= 10 && r2 >= 7) return 'medium';
      if (r1 - r2 <= 2 && r1 >= 6) return 'medium';
      return 'marginal';
    }
    if (r1 === 12 && r2 >= 8) return 'medium';                 // A8o-ATo aprox.
    if (r1 === 11 && r2 === 10) return 'medium';               // KQo
    if (r1 - r2 <= 1 && r1 >= 9) return 'medium';              // JTs, T9o...
    return 'marginal';
  },

  normalizeOpts(opts) {
    if (typeof opts === 'boolean') return { facingRaise: opts };
    const o = opts || {};
    let situation = o.situation;
    if (!situation) {
      if (o.facingRaise) situation = o.inBlind ? 'blind_defense' : 'vs_open';
      else situation = 'rfi';
    }
    return {
      situation,
      facingRaise: situation !== 'rfi',
      mdf: this.clamp(Number(o.mdf) || 0.5, 0.15, 0.85),
      openSizeBb: this.clamp(Number(o.openSizeBb) || 2.5, 1.5, 6),
      stackBb: this.clamp(Number(o.stackBb) || 100, 8, 300),
      vsThreeBet: situation === 'vs_3bet'
    };
  },

  /** Ajuste premium: AA/KK puros; QQ/AK y JJ/TT/AQs muy mezclados. */
  premiumFreqs(label, situation, baseRaise, baseCall) {
    if (label === 'AA' || label === 'KK') return { raise: 100, call: 0 };
    const table = {
      'QQ': { rfi: 100, vs_open: 78, vs_3bet: 62, blind_defense: 84 },
      'AKs':{ rfi: 100, vs_open: 72, vs_3bet: 58, blind_defense: 78 },
      'AKo':{ rfi: 100, vs_open: 65, vs_3bet: 48, blind_defense: 72 },
      'AQs':{ rfi: 100, vs_open: 52, vs_3bet: 38, blind_defense: 60 },
      'JJ': { rfi: 100, vs_open: 48, vs_3bet: 34, blind_defense: 55 },
      'TT': { rfi: 100, vs_open: 42, vs_3bet: 30, blind_defense: 50 }
    };
    const custom = table[label];
    if (!custom) return { raise: baseRaise, call: baseCall };
    const raise = custom[situation] ?? baseRaise;
    return { raise, call: Math.round((100 - raise) * 0.22) };
  },

  /**
   * @param {string} pos UTG/MP/CO/BTN/SB/BB
   * @param {number} r1 rango alto (0..12)
   * @param {number} r2 rango bajo (0..12)
   * @param {boolean} suited
   * @param {boolean|object} opts facingRaise o { situation, mdf, openSizeBb, stackBb }
   */
  getHandFreqs(pos, r1, r2, suited, opts = false) {
    const o = this.normalizeOpts(opts);
    const idx = this.positionIndex(pos);
    const label = this.label(r1, r2, suited);
    const rawStrength = PokerEngine.preflopHandPercentile(r1 * 4, r2 * 4 + (suited ? 0 : 1));
    const tier = this.tierOf(label, r1, r2, suited);

    if (tier === 'trash') {
      return {
        raiseFreq: 0, callFreq: 0, foldFreq: 100,
        strength: rawStrength, mixed: false, tier, facingRaise: o.facingRaise,
        situation: o.situation
      };
    }

    let raiseFreq;
    let callFreq;

    if (o.situation === 'rfi') {
      raiseFreq = this.RFI_RAISE[tier][idx];
      callFreq = this.RFI_CALL[tier][idx];
    } else {
      const raiseTable = o.situation === 'vs_3bet' ? this.VS_3BET_RAISE : this.VS_OPEN_RAISE;
      raiseFreq = raiseTable[tier][idx];
      if (o.situation === 'blind_defense') raiseFreq = Math.round(raiseFreq * 0.8);

      // Defensa ligada al MDF: quien más debe defender es quien recibe mejor precio.
      let defenseTarget = this.clamp(o.mdf - 0.06, 0.18, 0.62);
      if (o.situation === 'vs_3bet') defenseTarget = this.clamp(o.mdf - 0.02, 0.22, 0.60);
      if (o.situation === 'blind_defense') defenseTarget = this.clamp(defenseTarget + 0.08, 0.20, 0.70);
      const tierDefense = tier === 'strong' ? 1 : tier === 'medium' ? 0.88 : tier === 'marginal' ? 0.62 : 0.20;
      callFreq = Math.round((100 - raiseFreq) * defenseTarget * tierDefense);
    }

    if (tier === 'premium') {
      const p = this.premiumFreqs(label, o.situation, raiseFreq, callFreq);
      raiseFreq = p.raise;
      callFreq = p.call;
    }

    // Adaptación por tamaño de la apertura y por stack efectivo (estilo PV).
    if (o.situation !== 'rfi') {
      if (o.openSizeBb >= 3) callFreq -= tier === 'marginal' ? 4 : 7;
      else if (o.openSizeBb <= 2) callFreq += 5;
    }
    if (o.stackBb < 40) {
      raiseFreq += tier === 'marginal' ? -2 : 5;
      callFreq -= 9;
    } else if (o.stackBb < 70) {
      raiseFreq += 2;
      callFreq -= 4;
    } else if (o.stackBb > 150) {
      raiseFreq -= 2;
      callFreq += 5;
    }

    raiseFreq = Math.round(this.clamp(raiseFreq, 0, 100));
    callFreq = Math.round(this.clamp(callFreq, 0, 100 - raiseFreq));
    const foldFreq = 100 - raiseFreq - callFreq;

    return {
      raiseFreq,
      callFreq,
      foldFreq,
      strength: rawStrength,
      mixed: !(raiseFreq === 100 || callFreq === 100 || foldFreq === 100),
      tier,
      facingRaise: o.facingRaise,
      situation: o.situation,
      openSizeBb: o.openSizeBb,
      stackBb: o.stackBb
    };
  }
};

const gtoView = {
  pos: 'BTN',
  situation: 'rfi',
  openSizeBb: 2.5,
  stackBb: 100,
  selectedHand: 'AKs',

  context() {
    const betBb = Math.max(0.5, this.openSizeBb - 1);
    return {
      situation: this.situation,
      openSizeBb: this.openSizeBb,
      stackBb: this.stackBb,
      mdf: this.situation === 'rfi' ? 0.5 : 1.5 / (1.5 + betBb)
    };
  },

  updateFilterButtons(selector, dataKey, activeValue, baseClass) {
    document.querySelectorAll(selector).forEach(btn => {
      const active = btn.dataset[dataKey] === activeValue;
      btn.className = `${baseClass} ${
        active ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
      }`;
    });
  },

  setPos(pos) {
    SoundFX.playClick();
    this.pos = pos;
    this.updateFilterButtons('.gto-pos-btn', 'pos', pos,
      'gto-pos-btn px-2.5 py-1 rounded-lg text-xs font-bold');
    this.render();
  },

  setSituation(situation) {
    SoundFX.playClick();
    this.situation = situation;
    this.updateFilterButtons('.gto-sit-btn', 'situation', situation,
      'gto-sit-btn px-2.5 py-1 rounded-lg text-xs font-semibold');
    this.render();
  },

  setOpenSize(size) {
    SoundFX.playClick();
    this.openSizeBb = Number(size);
    this.updateFilterButtons('.gto-open-btn', 'size', String(this.openSizeBb),
      'gto-open-btn px-2 py-1 rounded-lg text-xs font-mono');
    this.render();
  },

  setStack(stack) {
    SoundFX.playClick();
    this.stackBb = Number(stack);
    this.updateFilterButtons('.gto-stack-btn', 'stack', String(this.stackBb),
      'gto-stack-btn px-2 py-1 rounded-lg text-xs font-mono');
    this.render();
  },

  getHandFreqs(r1Idx, r2Idx, isSuited, opts = false) {
    if (opts === false) return GTOEngine.getHandFreqs(this.pos, r1Idx, r2Idx, isSuited, this.context());
    return GTOEngine.getHandFreqs(this.pos, r1Idx, r2Idx, isSuited, opts);
  },

  selectHand(label, r1, r2, suited, combos) {
    SoundFX.playSelect();
    this.selectedHand = label;
    const freqs = this.getHandFreqs(r1, r2, suited);
    const { raiseFreq, callFreq, foldFreq, strength, mixed, tier } = freqs;

    document.getElementById('gto-selected-hand').textContent = label;
    document.getElementById('gto-hand-type').textContent =
      `${combos} combinaciones • ${tier.toUpperCase()} • Percentil ${(strength * 100).toFixed(0)}%`;

    document.getElementById('gto-freq-raise').textContent = `${raiseFreq}%`;
    document.getElementById('gto-bar-raise').style.width = `${raiseFreq}%`;
    document.getElementById('gto-freq-call').textContent = `${callFreq}%`;
    document.getElementById('gto-bar-call').style.width = `${callFreq}%`;
    document.getElementById('gto-freq-fold').textContent = `${foldFreq}%`;
    document.getElementById('gto-bar-fold').style.width = `${foldFreq}%`;

    const sitLabel = GTO_SITUATION_LABEL[this.situation];
    let rationale;
    if (!mixed && raiseFreq === 100) {
      rationale = `Subida pura (100%) desde ${this.pos} en ${sitLabel}: mano premium con suficiente equidad para construir bote con iniciativa.`;
    } else if (!mixed && foldFreq === 100) {
      rationale = `Fold puro (100%) desde ${this.pos} en ${sitLabel}: basura absoluta sin jugabilidad frente a los rangos activos.`;
    } else {
      rationale = `Estrategia mixta en ${sitLabel} desde ${this.pos} (${this.stackBb}BB, apertura ${this.openSizeBb}BB): ${raiseFreq}% raise / ${callFreq}% call / ${foldFreq}% fold. Alternar acciones equilibra el rango y evita que te lean.`;
    }
    document.getElementById('gto-hand-rationale').textContent = rationale;
  },

  render() {
    const grid = document.getElementById('gto-matrix-grid');
    if (!grid) return;
    document.getElementById('gto-summary-pos').textContent =
      `${this.pos} · ${GTO_SITUATION_LABEL[this.situation]}`;

    let playableCombos = 0;
    let raiseCombos = 0;
    let html = '';

    // Fila 0 = A (12) hasta Fila 12 = 2 (0)
    for (let row = 0; row < 13; row++) {
      const r1 = 12 - row;
      for (let col = 0; col < 13; col++) {
        const r2 = 12 - col;
        let label, suited, combos;
        if (row === col) {
          label = RANKS[r1] + RANKS[r2];
          suited = false;
          combos = 6;
        } else if (col > row) {
          label = RANKS[r1] + RANKS[r2] + 's';
          suited = true;
          combos = 4;
        } else {
          label = RANKS[r2] + RANKS[r1] + 'o';
          suited = false;
          combos = 12;
        }

        const highR = Math.max(r1, r2);
        const lowR = Math.min(r1, r2);
        const { raiseFreq, callFreq } = this.getHandFreqs(highR, lowR, suited);

        playableCombos += combos * ((raiseFreq + callFreq) / 100);
        raiseCombos += combos * (raiseFreq / 100);

        let bgStyle = 'bg-slate-900 text-slate-500 border-slate-800';
        if (raiseFreq === 100) bgStyle = 'bg-rose-600/90 text-white border-rose-500';
        else if (callFreq === 100) bgStyle = 'bg-emerald-600/90 text-white border-emerald-500';
        else if (raiseFreq > 0 && callFreq > 0) bgStyle = 'bg-gradient-to-r from-rose-600 to-emerald-600 text-white border-amber-400/50';
        else if (raiseFreq > 0) bgStyle = 'bg-rose-950/90 text-rose-200 border-rose-600/60';
        else if (callFreq > 0) bgStyle = 'bg-emerald-950/90 text-emerald-200 border-emerald-600/60';

        html += `
          <button onclick="gtoView.selectHand('${label}', ${highR}, ${lowR}, ${suited}, ${combos})"
            title="${label}: ${raiseFreq}% raise / ${callFreq}% call / ${100 - raiseFreq - callFreq}% fold"
            class="aspect-square rounded text-[10px] sm:text-xs font-mono font-bold border flex items-center justify-center hover:scale-105 transition ${bgStyle}">
            ${label}
          </button>
        `;
      }
    }

    grid.innerHTML = html;
    document.getElementById('gto-total-combos').textContent = Math.round(playableCombos);
    document.getElementById('gto-range-pct').textContent = ((playableCombos / 1326) * 100).toFixed(1) + '%';
    document.getElementById('gto-raise-pct').textContent = ((raiseCombos / 1326) * 100).toFixed(1) + '%';
    this.selectHand('AKs', 12, 11, true, 4);
  }
};
