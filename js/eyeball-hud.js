/* ============================================================================
   14. HUD FLOTANTE "OJITO" (DERECHA DEL HUB INFERIOR)
   Panel compacto y horizontal: nunca aumenta la altura de la barra de acciones.
   La sugerencia vive debajo de los botones: GTO en preflop, EV estimado después.
============================================================================ */
const eyeballHUD = {
  visible: false,

  POSITION_ALIASES: {
    'UTG+1': 'MP',
    'LJ': 'MP',
    'HJ': 'CO',
    'BTN / SB': 'BTN'
  },

  toggle() {
    this.visible = !this.visible;
    const panel = document.getElementById('eyeball-panel');
    const btn = document.getElementById('btn-eyeball');

    if (panel) panel.classList.toggle('hidden', !this.visible);
    if (!this.visible) this.clearSuggestion();
    if (btn) {
      btn.textContent = this.visible ? '🙈' : '👁️';
      btn.setAttribute('aria-expanded', String(this.visible));
      btn.className = `pointer-events-auto w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-lg shadow-xl border backdrop-blur-md transition hover:scale-105 ${
        this.visible
          ? 'bg-slate-950/90 border-emerald-400/60 text-emerald-300'
          : 'bg-slate-950/85 border-slate-600/70 text-slate-200'
      }`;
    }

    SoundFX.playToggle(this.visible);
    this.render();
  },

  render() {
    const cards = document.getElementById('eyeball-cards');
    const hasGame = typeof game !== 'undefined' && game.handInProgress
      && game.players[0].cards.length === 2;

    if (!this.visible || !cards || !hasGame || game.turnIdx !== 0
      || game.players[0].folded || game.players[0].allIn
      || !['preflop', 'flop', 'turn', 'river'].includes(game.street)) {
      if (cards) this.paint(cards, []);
      this.clearSuggestion();
      return;
    }

    if (game.street === 'preflop') this.renderPreflop(cards);
    else this.renderPostflop(cards);
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

    // Misma matriz y mismo contexto que usan la vista GTO y el calificador EV.
    return GTOEngine.getHandFreqs(this.normalizePosition(ctx.pos), r1, r2, suited, {
      situation: ctx.situation,
      facingRaise: ctx.facingRaise,
      mdf: ctx.mdf,
      openSizeBb: ctx.openSizeBb,
      stackBb: ctx.stackBb
    });
  },

  renderPreflop(cards) {
    const freqs = this.preflopFreqs();

    // Regla estricta: sólo acciones con frecuencia > 0%.
    const items = [
      { key: 'RAISE', value: `${freqs.raiseFreq}%`, tone: 'border-emerald-400/55 text-emerald-300' },
      { key: 'CALL', value: `${freqs.callFreq}%`, tone: 'border-sky-400/55 text-sky-300' },
      { key: 'FOLD', value: `${freqs.foldFreq}%`, tone: 'border-rose-400/55 text-rose-300' }
    ].filter(item => parseInt(item.value, 10) > 0);

    this.paint(cards, items);
    this.renderSuggestion('GTO', [
      { action: 'raise', label: 'Subir', pct: freqs.raiseFreq },
      { action: 'call', label: this.callLabel(), pct: freqs.callFreq },
      { action: 'fold', label: 'Retirarse', pct: freqs.foldFreq }
    ]);
  },

  renderPostflop(cards) {
    // Sólo datos del turno del Héroe para no mostrar cifras obsoletas.
    if (!game.currentDecisionAnalysis && typeof game.computeRealEVMatrix === 'function') {
      game.computeRealEVMatrix();
    }
    const analysis = game.currentDecisionAnalysis;
    if (!analysis) {
      this.paint(cards, []);
      this.clearSuggestion();
      return;
    }

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

    this.paint(cards, items);

    // Porcentaje derivado del EV de cada línea disponible; se etiqueta como
    // estimado para no presentarlo como una tabla GTO exacta.
    const pcts = this.estimateEVPercentages(analysis.options);
    const rows = analysis.options.map((option, i) => ({
      action: option.action,
      label: this.actionLabel(option.action),
      pct: pcts[i]
    }));
    this.renderSuggestion('EV ESTIMADO', rows);
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

  renderSuggestion(source, rows) {
    const el = document.getElementById('action-suggestion');
    if (!el) return;
    const available = rows.filter(row => row.pct > 0 && this.isActionEnabled(row.action));
    if (!available.length) {
      this.clearSuggestion();
      return;
    }
    const sorted = [...available].sort((a, b) => b.pct - a.pct);
    const best = sorted[0];
    const chips = sorted.map(row => `
      <span class="${row === best ? 'font-extrabold text-emerald-300' : 'font-semibold text-slate-300'}">${row.label} <span class="font-mono">${row.pct}%</span></span>
    `).join('<span class="text-slate-600">·</span>');

    el.innerHTML = `
      <span class="font-mono uppercase tracking-wide text-emerald-400">SUGERENCIA ${source}</span>
      <span class="text-slate-600">→</span>
      <strong class="font-bold text-white">${best.label}</strong>
      <span class="flex flex-nowrap items-center gap-1.5">${chips}</span>
    `;
    el.classList.remove('hidden');
    el.classList.add('flex');
  },

  clearSuggestion() {
    const el = document.getElementById('action-suggestion');
    if (!el) return;
    el.innerHTML = '';
    el.classList.add('hidden');
    el.classList.remove('flex');
  },

  paint(container, items) {
    // Tarjetas horizontales dentro de la barra de acciones: nunca sobre el tapete.
    const cardsClass = 'flex items-center gap-1.5 h-full';
    container.className = cardsClass;
    container.innerHTML = items.map((item, i) => `
      <div class="hud-card h-9 min-w-[58px] px-1.5 rounded-lg border bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center ${item.tone}"
           style="animation-delay: ${i * 45}ms">
        <span class="text-[7px] font-bold uppercase tracking-wide text-slate-400 whitespace-nowrap">${item.key}</span>
        <span class="text-[9px] font-extrabold font-mono leading-none tracking-tight whitespace-nowrap">${item.value}</span>
      </div>
    `).join('');
  }
};
