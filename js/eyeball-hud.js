/* ============================================================================
   14. HUD FLOTANTE "OJITO" (BOTTOM-RIGHT, DESPLIEGUE HACIA ARRIBA)
   Sólo datos en cuadritos independientes. Las explicaciones viven en el Coach.
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
    if (!this.visible) return;

    const cards = document.getElementById('eyeball-cards');
    if (!cards) return;

    const hasGame = typeof game !== 'undefined' && game.handInProgress && game.players[0].cards.length === 2;
    const street = hasGame ? game.street : '';

    if (!hasGame || !['preflop', 'flop', 'turn', 'river'].includes(street)) {
      this.paint(cards, []);
      return;
    }

    if (street === 'preflop') this.renderPreflop(cards);
    else this.renderPostflop(cards);
  },

  normalizePosition(rawPos) {
    if (this.POSITION_ALIASES[rawPos]) return this.POSITION_ALIASES[rawPos];
    if (['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'].includes(rawPos)) return rawPos;
    return 'MP';
  },

  renderPreflop(cards) {
    const [c1, c2] = game.players[0].cards;
    const r1 = Math.max(c1 >> 2, c2 >> 2);
    const r2 = Math.min(c1 >> 2, c2 >> 2);
    const suited = (c1 & 3) === (c2 & 3);
    const ctx = game.getPreflopGTOContext();
    const pos = this.normalizePosition(ctx.pos);

    // Misma matriz y mismo contexto que usan la vista GTO y el calificador EV.
    const freqs = GTOEngine.getHandFreqs(pos, r1, r2, suited, {
      situation: ctx.situation,
      facingRaise: ctx.facingRaise,
      mdf: ctx.mdf,
      openSizeBb: ctx.openSizeBb,
      stackBb: ctx.stackBb
    });

    // Regla estricta: sólo acciones con frecuencia > 0%.
    const items = [
      { key: 'RAISE', value: `${freqs.raiseFreq}%`, tone: 'border-emerald-400/55 text-emerald-300' },
      { key: 'CALL',  value: `${freqs.callFreq}%`,  tone: 'border-sky-400/55 text-sky-300' },
      { key: 'FOLD',  value: `${freqs.foldFreq}%`,  tone: 'border-rose-400/55 text-rose-300' }
    ].filter(item => parseInt(item.value, 10) > 0);

    this.paint(cards, items);
  },

  renderPostflop(cards) {
    // Sólo datos del turno del Héroe para no mostrar cifras obsoletas.
    if (game.turnIdx !== 0 || !game.currentDecisionAnalysis) {
      if (game.turnIdx === 0) game.computeRealEVMatrix();
      else {
        this.paint(cards, []);
        return;
      }
    }
    const analysis = game.currentDecisionAnalysis;
    if (!analysis) {
      this.paint(cards, []);
      return;
    }

    const isRiver = game.street === 'river';
    const evBest = analysis.bestOption ? analysis.bestOption.ev : 0;
    const items = [
      { key: 'EQUITY',   value: `${analysis.equityPct.toFixed(1)}%`, tone: 'border-emerald-400/55 text-emerald-300' },
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
  },

  paint(container, items) {
    // Tarjetas horizontales dentro de la barra de acciones: nunca sobre el tapete.
    const cardsClass = 'flex items-center gap-1.5 h-full';
    if (items.length === 0) {
      container.className = cardsClass;
      container.innerHTML = '';
      return;
    }
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
