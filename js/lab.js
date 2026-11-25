/* ============================================================================
   6. MÓDULO: LABORATORIO (SIMULADOR MONTE CARLO, OUTS Y EV)
============================================================================ */
const lab = {
  hero: [null, null],
  villain: [null, null],
  board: [null, null, null, null, null],
  pickerTarget: null,
  lastEquity: null,

  init() {
    this.loadPreset('flushDraw');
  },

  loadPreset(presetName) {
    SoundFX.playSelect();
    if (presetName === 'flushDraw') {
      this.hero = [PokerEngine.codeToCard('As'), PokerEngine.codeToCard('Ks')];
      this.villain = [PokerEngine.codeToCard('Qd'), PokerEngine.codeToCard('Qc')];
      this.board = [PokerEngine.codeToCard('Ts'), PokerEngine.codeToCard('7s'), PokerEngine.codeToCard('2h'), null, null];
      document.getElementById('lab-villain-mode').value = 'cards';
      document.getElementById('lab-pot-input').value = 100;
      document.getElementById('lab-bet-input').value = 50;
    } else if (presetName === 'coinflip') {
      this.hero = [PokerEngine.codeToCard('Ah'), PokerEngine.codeToCard('Kh')];
      this.villain = [PokerEngine.codeToCard('Qs'), PokerEngine.codeToCard('Qc')];
      this.board = [null, null, null, null, null];
      document.getElementById('lab-villain-mode').value = 'cards';
      document.getElementById('lab-pot-input').value = 200;
      document.getElementById('lab-bet-input').value = 100;
    } else if (presetName === 'oesd') {
      this.hero = [PokerEngine.codeToCard('9h'), PokerEngine.codeToCard('8h')];
      this.villain = [PokerEngine.codeToCard('Ac'), PokerEngine.codeToCard('Kd')];
      this.board = [PokerEngine.codeToCard('Ts'), PokerEngine.codeToCard('7d'), PokerEngine.codeToCard('2c'), PokerEngine.codeToCard('Ks'), null];
      document.getElementById('lab-villain-mode').value = 'cards';
      document.getElementById('lab-pot-input').value = 120;
      document.getElementById('lab-bet-input').value = 40;
    }
    this.toggleVillainMode();
    this.renderSlots();
    this.runSimulation();
  },

  clearAll() {
    SoundFX.playClick();
    this.hero = [null, null];
    this.villain = [null, null];
    this.board = [null, null, null, null, null];
    this.lastEquity = null;
    this.renderSlots();
    document.getElementById('lab-win-pct').textContent = '--%';
    document.getElementById('lab-tie-pct').textContent = '--%';
    document.getElementById('lab-lose-pct').textContent = '--%';
    document.getElementById('lab-total-equity').textContent = '--%';
    document.getElementById('lab-hero-made-hand').textContent = '--';
    document.getElementById('lab-outs-count').textContent = '--';
    document.getElementById('lab-draws-tags').innerHTML = '';
    this.recalcEVOnly();
  },

  toggleVillainMode() {
    const mode = document.getElementById('lab-villain-mode').value;
    const cardsBox = document.getElementById('lab-villain-cards-box');
    const descBox = document.getElementById('lab-villain-range-desc');
    if (mode === 'cards') {
      cardsBox.classList.remove('hidden');
      descBox.classList.add('hidden');
    } else {
      cardsBox.classList.add('hidden');
      descBox.classList.remove('hidden');
    }
  },

  renderSlots() {
    for (let i = 0; i < 2; i++) {
      const hEl = document.getElementById(`lab-hero-${i}`);
      if (hEl) hEl.innerHTML = renderCardHTML(this.hero[i], 'md');
      const vEl = document.getElementById(`lab-villain-${i}`);
      if (vEl) vEl.innerHTML = renderCardHTML(this.villain[i], 'md');
    }
    for (let i = 0; i < 5; i++) {
      const bEl = document.getElementById(`lab-board-${i}`);
      if (bEl) bEl.innerHTML = renderCardHTML(this.board[i], 'md');
    }
    const activeBoardCount = this.board.filter(c => c !== null).length;
    const streetNames = { 0: 'Preflop', 3: 'Flop', 4: 'Turn', 5: 'River' };
    const stLabel = document.getElementById('lab-street-label');
    if (stLabel) stLabel.textContent = streetNames[activeBoardCount] || `Board (${activeBoardCount} cartas)`;
  },

  getUsedCardsSet() {
    const used = new Set();
    [...this.hero, ...this.villain, ...this.board].forEach(c => {
      if (c !== null && c !== undefined) used.add(c);
    });
    return used;
  },

  openPicker(group, index) {
    this.pickerTarget = { group, index };
    const used = this.getUsedCardsSet();
    const grid = document.getElementById('card-picker-grid');

    let html = '';
    for (let s = 0; s < 4; s++) {
      const suitChar = SUITS[s];
      html += `<div class="grid grid-cols-13 gap-1" style="grid-template-columns: repeat(13, minmax(0, 1fr));">`;
      for (let r = 12; r >= 0; r--) {
        const cardInt = r * 4 + s;
        const isUsed = used.has(cardInt);
        const color = suitChar === 'h' ? 'text-rose-500'
          : suitChar === 'd' ? (appState.config.fourColor ? 'text-blue-400' : 'text-rose-500')
          : suitChar === 'c' ? (appState.config.fourColor ? 'text-emerald-400' : 'text-slate-200')
          : 'text-slate-200';

        html += `
          <button ${isUsed ? 'disabled' : ''} onclick="lab.selectPickerCard(${cardInt})"
            class="py-2 rounded-lg font-mono text-xs font-bold border transition ${isUsed ? 'opacity-20 bg-slate-950 border-slate-800 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 ' + color}">
            ${RANKS[r]}${SUIT_SYMBOLS[suitChar]}
          </button>
        `;
      }
      html += `</div>`;
    }
    grid.innerHTML = html;
    document.getElementById('card-picker-modal').classList.remove('hidden');
  },

  selectPickerCard(cardInt) {
    if (!this.pickerTarget) return;
    const { group, index } = this.pickerTarget;
    this[group][index] = cardInt;
    SoundFX.playDeal();
    this.closePicker();
    this.renderSlots();
  },

  clearSlotCard() {
    if (!this.pickerTarget) return;
    const { group, index } = this.pickerTarget;
    this[group][index] = null;
    SoundFX.playClick();
    this.closePicker();
    this.renderSlots();
  },

  closePicker() {
    document.getElementById('card-picker-modal').classList.add('hidden');
    this.pickerTarget = null;
  },

  runSimulation() {
    if (this.hero[0] === null || this.hero[1] === null) {
      showToast('Selecciona tus 2 cartas (Hero) para simular.', 'error');
      return;
    }
    const mode = document.getElementById('lab-villain-mode').value;
    if (mode === 'cards' && (this.villain[0] === null || this.villain[1] === null)) {
      showToast('Selecciona las 2 cartas del Rival o cambia a un Rango.', 'error');
      return;
    }

    const activeBoard = this.board.filter(c => c !== null);
    if (activeBoard.length === 1 || activeBoard.length === 2) {
      showToast('Completa las 3 cartas del Flop para simular postflop.', 'error');
      return;
    }

    const iters = parseInt(document.getElementById('lab-iters-input').value, 10) || 5000;
    const t0 = performance.now();
    const res = PokerEngine.runMonteCarlo(this.hero, this.villain, activeBoard, mode, iters);
    const dt = (performance.now() - t0).toFixed(1);

    this.lastEquity = res.equity;
    document.getElementById('lab-sim-time').textContent = `${iters.toLocaleString()} iteraciones (${dt} ms)`;
    document.getElementById('lab-win-pct').textContent = res.winPct.toFixed(1) + '%';
    document.getElementById('lab-tie-pct').textContent = res.tiePct.toFixed(1) + '%';
    document.getElementById('lab-lose-pct').textContent = res.losePct.toFixed(1) + '%';
    document.getElementById('lab-total-equity').textContent = res.equity.toFixed(1) + '%';

    document.getElementById('lab-bar-win').style.width = `${res.winPct}%`;
    document.getElementById('lab-bar-tie').style.width = `${res.tiePct}%`;
    document.getElementById('lab-bar-lose').style.width = `${res.losePct}%`;

    const made = PokerEngine.evaluateHand([...this.hero, ...activeBoard]);
    document.getElementById('lab-hero-made-hand').textContent = made.name;

    const drawsInfo = PokerEngine.analyzeDrawsAndOuts(this.hero, activeBoard);
    document.getElementById('lab-outs-count').textContent = drawsInfo.outs > 0 ? `${drawsInfo.outs} outs` : '0 outs';
    document.getElementById('lab-draws-tags').innerHTML = drawsInfo.draws.map(d =>
      `<span class="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">${d}</span>`
    ).join('');

    this.recalcEVOnly();
    SoundFX.playSimDone();
  },

  recalcEVOnly() {
    const pot = parseFloat(document.getElementById('lab-pot-input').value) || 0;
    const bet = parseFloat(document.getElementById('lab-bet-input').value) || 0;
    const totalPot = pot + bet;
    const potOddsPct = totalPot > 0 ? (bet / totalPot) * 100 : 0;
    const ratio = bet > 0 ? (pot / bet).toFixed(2) : '∞';

    document.getElementById('lab-pot-odds').textContent = potOddsPct.toFixed(1) + '%';
    document.getElementById('lab-pot-ratio').textContent = `Ratio ${ratio} : 1`;

    if (this.lastEquity === null) return;

    const eq = this.lastEquity / 100;
    // EV(Call) = Equity * Pot_Antes_Call - (1 - Equity) * Call
    const ev = (eq * pot) - ((1 - eq) * bet);
    const edge = this.lastEquity - potOddsPct;

    const evEl = document.getElementById('lab-ev-value');
    evEl.textContent = `${ev >= 0 ? '+' : ''}${ev.toFixed(2)}`;
    evEl.className = `text-lg font-extrabold font-mono ${ev >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;
    document.getElementById('lab-ev-edge').textContent = `Margen: ${edge >= 0 ? '+' : ''}${edge.toFixed(1)}%`;

    const verdictBox = document.getElementById('lab-verdict-box');
    if (bet === 0) {
      verdictBox.className = 'p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs leading-relaxed text-emerald-100';
      verdictBox.innerHTML = `<strong class="text-emerald-400">✓ Check / Apuesta por valor:</strong> No enfrentas apuesta. Con un <strong>${this.lastEquity.toFixed(1)}%</strong> de equidad, ${this.lastEquity >= 55 ? 'tienes ventaja clara para apostar por valor' : 'puedes realizar tu equidad gratis pasando'}.`;
    } else if (ev >= 0) {
      verdictBox.className = 'p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs leading-relaxed text-emerald-100';
      verdictBox.innerHTML = `<strong class="text-emerald-400">✓ CALL RENTABLE (+${ev.toFixed(2)} EV):</strong> Tu equidad real (<strong>${this.lastEquity.toFixed(1)}%</strong>) supera el umbral mínimo de Pot Odds (<strong>${potOddsPct.toFixed(1)}%</strong>). A largo plazo ganas fichas pagando esta apuesta.`;
    } else {
      verdictBox.className = 'p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-xs leading-relaxed text-rose-100';
      verdictBox.innerHTML = `<strong class="text-rose-400">✕ FOLD RECOMENDADO (${ev.toFixed(2)} EV):</strong> Necesitas al menos <strong>${potOddsPct.toFixed(1)}%</strong> de equidad para igualar, pero tu mano solo alcanza un <strong>${this.lastEquity.toFixed(1)}%</strong>.`;
    }
  }
};
