/* ============================================================================
   8. MÓDULO: GTO (MATRIZ INTERACTIVA 13x13 DE RANGOS POSICIONALES)
============================================================================ */
const GTO_RANGES = {
  UTG: { openThreshold: 0.85, threeBetThreshold: 0.96, callThreshold: 0.85 },
  MP:  { openThreshold: 0.80, threeBetThreshold: 0.95, callThreshold: 0.80 },
  CO:  { openThreshold: 0.72, threeBetThreshold: 0.93, callThreshold: 0.72 },
  BTN: { openThreshold: 0.56, threeBetThreshold: 0.90, callThreshold: 0.56 },
  SB:  { openThreshold: 0.62, threeBetThreshold: 0.91, callThreshold: 0.62 },
  BB:  { openThreshold: 0.45, threeBetThreshold: 0.89, callThreshold: 0.42 }
};

const gtoView = {
  pos: 'BTN',
  selectedHand: 'AKs',

  setPos(pos) {
    SoundFX.playClick();
    this.pos = pos;
    document.querySelectorAll('.gto-pos-btn').forEach(btn => {
      if (btn.dataset.pos === pos) {
        btn.className = 'gto-pos-btn px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white';
      } else {
        btn.className = 'gto-pos-btn px-2.5 py-1 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-800';
      }
    });
    this.render();
  },

  getHandFreqs(r1Idx, r2Idx, isSuited) {
    // r1Idx, r2Idx in 0..12 (12 is A, 0 is 2)
    const c1 = r1Idx * 4;
    const c2 = r2Idx * 4 + (isSuited ? 0 : 1);
    const strength = PokerEngine.preflopHandPercentile(c1, c2);
    const cfg = GTO_RANGES[this.pos];

    let raiseFreq = 0;
    let callFreq = 0;

    if (this.pos === 'BB') {
      // BB defensa vs BTN Open
      if (strength >= cfg.threeBetThreshold) {
        raiseFreq = 100;
      } else if (strength >= cfg.threeBetThreshold - 0.05) {
        raiseFreq = 50;
        callFreq = 50;
      } else if (strength >= cfg.callThreshold) {
        callFreq = 100;
      } else if (strength >= cfg.callThreshold - 0.05) {
        callFreq = 50;
      }
    } else {
      // Open Raise RFI
      if (strength >= cfg.openThreshold + 0.03) {
        raiseFreq = 100;
      } else if (strength >= cfg.openThreshold - 0.03) {
        raiseFreq = 50;
      }
    }

    const foldFreq = Math.max(0, 100 - raiseFreq - callFreq);
    return { raiseFreq, callFreq, foldFreq, strength };
  },

  selectHand(label, r1, r2, suited, combos) {
    SoundFX.playSelect();
    this.selectedHand = label;
    const { raiseFreq, callFreq, foldFreq, strength } = this.getHandFreqs(r1, r2, suited);

    document.getElementById('gto-selected-hand').textContent = label;
    document.getElementById('gto-hand-type').textContent = `${combos} combinaciones • Percentil ${(strength * 100).toFixed(0)}%`;

    document.getElementById('gto-freq-raise').textContent = `${raiseFreq}%`;
    document.getElementById('gto-bar-raise').style.width = `${raiseFreq}%`;

    document.getElementById('gto-freq-call').textContent = `${callFreq}%`;
    document.getElementById('gto-bar-call').style.width = `${callFreq}%`;

    document.getElementById('gto-freq-fold').textContent = `${foldFreq}%`;
    document.getElementById('gto-bar-fold').style.width = `${foldFreq}%`;

    let rationale = '';
    if (raiseFreq === 100) {
      rationale = `Apertura / 3-Bet puro (100%) desde ${this.pos}. Tiene suficiente equidad y jugabilidad para construir bote con iniciativa.`;
    } else if (raiseFreq > 0 || callFreq > 0) {
      rationale = `Estrategia mixta en el umbral del rango de ${this.pos}. Mezclar frecuencias mantiene tu rango impredecible ante rivales observadores.`;
    } else {
      rationale = `Fold estándar (100%) desde ${this.pos}. Su realización de equity postflop es insuficiente frente a los rangos activos.`;
    }
    document.getElementById('gto-hand-rationale').textContent = rationale;
  },

  render() {
    const grid = document.getElementById('gto-matrix-grid');
    document.getElementById('gto-summary-pos').textContent = this.pos;

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
