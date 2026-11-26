/* ============================================================================
   14. HUD UNIFICADO "OJITO" (INFERIOR DERECHA DE LA MESA)
   El ojito abre la información hacia arriba dentro del mismo panel: viñetas
   sobre cada acción y métricas horizontales debajo de la zona de apuestas.
   Preflop usa frecuencias GTO; después del flop, porcentajes estimados del EV.
============================================================================ */
const eyeballHUD = {
  visible: false,
  previousRaiseValue: null,
  suggestionApplied: false,
  lastAppliedAnalysis: null,
  lastAnalysis: null,
  lastHintRows: [],
  lastSuggestedTotal: null,
  restoringRaise: false,

  POSITION_ALIASES: {
    'UTG+1': 'MP',
    'LJ': 'MP',
    'HJ': 'CO',
    'BTN / SB': 'BTN'
  },

  toggle() {
    this.visible = !this.visible;
    const panel = document.getElementById('game-controls-panel');
    const extra = document.getElementById('game-hud-extra');
    const btn = document.getElementById('btn-eyeball');

    if (panel) panel.classList.toggle('eyeball-open', this.visible);
    if (extra) extra.classList.toggle('hidden', !this.visible);
    if (!this.visible) this.restoreRaiseSuggestion();
    if (btn) {
      btn.textContent = this.visible ? '🙈' : '👁️';
      btn.setAttribute('aria-expanded', String(this.visible));
      btn.setAttribute('aria-label', this.visible ? 'Ocultar ayuda táctica' : 'Mostrar ayuda táctica');
      btn.className = `eyeball-btn${this.visible ? ' is-open' : ''}`;
    }

    SoundFX.playToggle(this.visible);
    this.render();
  },

  render() {
    const cards = document.getElementById('eyeball-cards');
    const extra = document.getElementById('game-hud-extra');
    const hasGame = typeof game !== 'undefined' && game.handInProgress
      && game.players[0].cards.length === 2;
    const isHeroTurn = hasGame && game.turnIdx === 0
      && !game.players[0].folded && !game.players[0].allIn
      && ['preflop', 'flop', 'turn', 'river'].includes(game.street);

    if (!this.visible || !isHeroTurn) {
      this.clearActionHints();
      this.paint(cards, []);
      if (extra) extra.classList.add('hidden');
      this.restoreRaiseSuggestion();
      this.lastAppliedAnalysis = null;
      return;
    }

    if (extra) extra.classList.remove('hidden');

    const analysis = this.ensureAnalysis();
    if (!analysis) {
      this.clearActionHints();
      this.paint(cards, []);
      this.lastAppliedAnalysis = null;
      return;
    }

    this.lastAnalysis = analysis;
    const rows = this.actionRows(analysis);
    this.renderActionHints(rows);
    this.paint(cards, this.metricItems(analysis));

    if (this.lastAppliedAnalysis !== analysis) {
      this.restoreRaiseSuggestion();
      this.lastAppliedAnalysis = analysis;
      this.clearRaiseHighlight();

      if (this.shouldSuggestRaise(rows, analysis)) {
        this.applyRaiseSuggestion(analysis);
      }
    }
  },

  ensureAnalysis() {
    if (game.currentDecisionAnalysis) return game.currentDecisionAnalysis;
    if (typeof game.computeRealEVMatrix === 'function') game.computeRealEVMatrix();
    return game.currentDecisionAnalysis || null;
  },

  normalizePosition(rawPos) {
    if (this.POSITION_ALIASES[rawPos]) return this.POSITION_ALIASES[rawPos];
    if (['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'].includes(rawPos)) return rawPos;
    return 'MP';
  },

  preflopFreqs() {
    const [c1, c2] = game.players[0].cards;
    const r1 = Math.max(c1 >> 2, c2 >> 2);
    const r2 = Math.min(c1 >> 2, c2 >> 2);
    const suited = (c1 & 3) === (c2 & 3);
    const ctx = game.getPreflopGTOContext();

    return GTOEngine.getHandFreqs(this.normalizePosition(ctx.pos), r1, r2, suited, {
      situation: ctx.situation,
      facingRaise: ctx.facingRaise,
      mdf: ctx.mdf,
      openSizeBb: ctx.openSizeBb,
      stackBb: ctx.stackBb
    });
  },

  actionRows(analysis) {
    const order = { fold: 0, call: 1, raise: 2 };
    let rows;

    if (game.street === 'preflop') {
      const freqs = this.preflopFreqs();
      rows = [
        { action: 'fold', label: 'Retirarse', pct: freqs.foldFreq },
        { action: 'call', label: this.callLabel(), pct: freqs.callFreq },
        { action: 'raise', label: 'Subir', pct: freqs.raiseFreq }
      ];
    } else {
      const pcts = this.estimateEVPercentages(analysis.options || []);
      rows = (analysis.options || []).map((option, i) => ({
        action: option.action,
        label: this.actionLabel(option.action),
        pct: pcts[i]
      }));
    }

    return rows
      .filter(row => row.pct > 0 && this.isActionEnabled(row.action))
      .sort((a, b) => order[a.action] - order[b.action]);
  },

  metricItems(analysis) {
    const isRiver = game.street === 'river';
    const evBest = analysis.bestOption ? analysis.bestOption.ev : 0;
    const items = [
      { key: 'EQUITY', value: `${analysis.equityPct.toFixed(1)}%`, tone: 'border-emerald-400/55 text-emerald-300' },
      { key: 'POT ODDS', value: analysis.toCall > 0 ? `${analysis.potOddsPct.toFixed(1)}%` : '0%', tone: 'border-amber-400/55 text-amber-300' }
    ];

    if (!isRiver) {
      items.push({ key: 'OUTS', value: String(analysis.outs || 0), tone: 'border-sky-400/55 text-sky-300' });
    }

    items.push({
      key: 'EV MAX',
      value: `${evBest >= 0 ? '+' : ''}${evBest.toFixed(2)} BB`,
      tone: 'border-cyan-400/55 text-cyan-300'
    });

    return items;
  },

  callLabel() {
    return game.currentBet > game.players[0].bet ? 'Pagar' : 'Pasar';
  },

  actionLabel(action) {
    if (action === 'raise') return 'Subir';
    if (action === 'call') return this.callLabel();
    return 'Retirarse';
  },

  isActionEnabled(action) {
    const id = action === 'raise' ? 'btn-raise' : action === 'call' ? 'btn-call' : 'btn-fold';
    const btn = document.getElementById(id);
    return !btn || !btn.disabled;
  },

  estimateEVPercentages(options) {
    if (!options.length) return [];
    const evs = options.map(o => Number(o.ev) || 0);
    const max = Math.max(...evs);
    const spread = Math.max(0.75, max - Math.min(...evs));
    const scale = Math.max(0.6, spread * 0.55);
    const weights = evs.map(ev => Math.exp((ev - max) / scale));
    const total = weights.reduce((sum, w) => sum + w, 0) || 1;
    const pcts = weights.map(w => Math.round((w / total) * 100));
    const drift = 100 - pcts.reduce((sum, p) => sum + p, 0);
    const last = pcts.length - 1;
    pcts[last] = Math.max(0, pcts[last] + drift);
    return pcts;
  },

  renderActionHints(rows) {
    this.lastHintRows = rows;
    const raiseRow = rows.find(row => row.action === 'raise');
    const size = this.suggestionApplied && this.lastAnalysis
      ? this.lastAnalysis.suggestedRaise
      : null;

    for (const action of ['fold', 'call', 'raise']) {
      const el = document.getElementById(`hint-${action}`);
      if (!el) continue;
      const row = rows.find(item => item.action === action);
      if (!row) {
        el.textContent = '';
        continue;
      }
      const suffix = action === 'raise' && size ? ` · ${size.presetLabel}` : '';
      el.textContent = `${row.label} ${row.pct}%${suffix}`;
    }

    if (!raiseRow && size) this.clearRaiseHighlight();
  },

  clearActionHints() {
    for (const action of ['fold', 'call', 'raise']) {
      const el = document.getElementById(`hint-${action}`);
      if (el) el.textContent = '';
    }
    this.lastHintRows = [];
    this.lastAnalysis = null;
  },

  shouldSuggestRaise(rows, analysis) {
    const raise = rows.find(row => row.action === 'raise');
    if (!raise || !analysis.suggestedRaise) return false;
    const bestPct = Math.max(...rows.map(row => row.pct));
    return analysis.bestOption?.action === 'raise' || raise.pct === bestPct;
  },

  applyRaiseSuggestion(analysis) {
    const slider = document.getElementById('raise-slider');
    const size = analysis.suggestedRaise;
    if (!slider || !size) return;

    if (!this.suggestionApplied) {
      this.previousRaiseValue = slider.value;
      this.suggestionApplied = true;
    }

    const min = Number(slider.min) || 0;
    const max = Number(slider.max) || Number.MAX_SAFE_INTEGER;
    const target = Math.max(min, Math.min(max, Math.round(size.total)));
    slider.value = target;
    this.lastSuggestedTotal = target;

    this.restoringRaise = true;
    try {
      if (typeof game !== 'undefined' && typeof game.updateRaiseLabel === 'function') {
        game.updateRaiseLabel(target);
      }
    } finally {
      this.restoringRaise = false;
    }

    this.highlightRaiseSuggestion(size);
    this.renderActionHints(this.lastHintRows);
  },

  highlightRaiseSuggestion(size) {
    this.clearRaiseHighlight();
    const sliderGroup = document.getElementById('bet-slider-group');
    if (sliderGroup) sliderGroup.classList.add('is-suggested');

    if (size.kind === 'allin') {
      const allin = document.querySelector('.bet-allin');
      if (allin) allin.classList.add('is-suggested');
      return;
    }

    const preset = document.querySelector(`#bet-sizing-presets button[data-fraction="${size.presetValue}"]`);
    if (preset) preset.classList.add('is-suggested');
  },

  clearRaiseHighlight() {
    document.querySelectorAll('.bet-slider-group.is-suggested, .bet-allin.is-suggested, #bet-sizing-presets button.is-suggested')
      .forEach(el => el.classList.remove('is-suggested'));
  },

  restoreRaiseSuggestion() {
    if (!this.suggestionApplied) return;

    const slider = document.getElementById('raise-slider');
    if (slider && this.previousRaiseValue !== null) {
      const min = Number(slider.min) || 0;
      const max = Number(slider.max) || Number.MAX_SAFE_INTEGER;
      const previous = Math.max(min, Math.min(max, Number(this.previousRaiseValue)));
      slider.value = previous;
      this.restoringRaise = true;
      try {
        if (typeof game !== 'undefined' && typeof game.updateRaiseLabel === 'function') {
          game.updateRaiseLabel(previous);
        }
      } finally {
        this.restoringRaise = false;
      }
    }

    this.suggestionApplied = false;
    this.previousRaiseValue = null;
    this.lastSuggestedTotal = null;
    this.clearRaiseHighlight();
    this.renderActionHints(this.lastHintRows);
  },

  onBetValueChanged(val) {
    if (this.restoringRaise || !this.suggestionApplied) return;
    if (this.lastSuggestedTotal === null || Math.abs(Number(val) - this.lastSuggestedTotal) <= 1) return;

    this.suggestionApplied = false;
    this.previousRaiseValue = null;
    this.lastSuggestedTotal = null;
    this.clearRaiseHighlight();
    this.renderActionHints(this.lastHintRows);
  },

  paint(container, items) {
    if (!container) return;
    container.className = 'hud-metrics';
    container.innerHTML = items.map((item, i) => `
      <div class="hud-card border ${item.tone}" style="animation-delay: ${i * 35}ms">
        <span>${item.key}</span>
        <span>${item.value}</span>
      </div>
    `).join('');
  }
};
