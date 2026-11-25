/* ============================================================================
   2. RENDERIZADO VISUAL DE CARTAS
============================================================================ */
function renderCardHTML(cardInt, size = 'md', isHidden = false) {
  const dims = {
    xs: 'w-8 h-11 text-xs',
    sm: 'w-10 h-14 text-sm',
    md: 'w-12 h-16 sm:w-14 sm:h-20 text-base sm:text-lg',
    lg: 'w-14 h-20 sm:w-16 sm:h-24 text-lg sm:text-xl'
  }[size] || 'w-12 h-16 text-base';

  if (isHidden) {
    return `<div class="${dims} playing-card-back flex items-center justify-center"><span class="text-slate-600 text-xs">♠</span></div>`;
  }

  if (cardInt === null || cardInt === undefined || cardInt < 0) {
    return `<div class="${dims} rounded-lg border-2 border-dashed border-slate-700 bg-slate-900/60 flex items-center justify-center text-slate-600 hover:border-emerald-500/60 hover:text-emerald-400 transition">+</div>`;
  }

  const card = PokerEngine.cardToObj(cardInt);
  const fourColor = appState.config.fourColor;
  let colorClass = 'text-slate-900';
  if (card.suit === 'h') colorClass = 'text-rose-600';
  else if (card.suit === 'd') colorClass = fourColor ? 'text-blue-600' : 'text-rose-600';
  else if (card.suit === 'c') colorClass = fourColor ? 'text-emerald-700' : 'text-slate-900';

  return `
    <div class="${dims} playing-card ${colorClass} flex flex-col justify-between p-1.5 font-mono font-bold leading-none">
      <div class="text-left">
        <div>${card.rank}</div>
        <div class="text-[0.8em]">${SUIT_SYMBOLS[card.suit]}</div>
      </div>
      <div class="text-right text-[1.15em] opacity-90">${SUIT_SYMBOLS[card.suit]}</div>
    </div>
  `;
}

function showToast(msg, type = 'info') {
  SoundFX.playToast(type);
  const container = document.getElementById('toast-container');
  if (!container) return;
  const colors = {
    info: 'bg-slate-900 border-slate-700 text-slate-100',
    success: 'bg-emerald-950/95 border-emerald-500/60 text-emerald-200',
    error: 'bg-rose-950/95 border-rose-500/60 text-rose-200'
  };
  const el = document.createElement('div');
  el.className = `px-4 py-2.5 rounded-xl border shadow-xl text-xs font-semibold backdrop-blur-md transition-all ${colors[type] || colors.info}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, 2800);
}

function updateGlobalBadges() {
  const s = appState.stats;
  const totalDec = s.goodDecisions + s.badDecisions;
  const acc = totalDec > 0 ? ((s.goodDecisions / totalDec) * 100).toFixed(0) + '%' : '--%';

  const mobileEv = document.getElementById('mobile-ev-badge');
  if (mobileEv) mobileEv.textContent = `EV: ${s.netProfitBB >= 0 ? '+' : ''}${s.netProfitBB.toFixed(1)} BB`;

  const acadBadge = document.getElementById('dash-academia-badge');
  if (acadBadge) acadBadge.textContent = `${appState.academia.completedIds.length}/${LESSONS_DATA.length} Desafíos`;

  const tableBadge = document.getElementById('dash-table-badge');
  if (tableBadge) {
    const names = { 2: 'Heads-Up Activo', 6: '6-Max Activo', 9: 'Full Ring Activo' };
    tableBadge.textContent = names[appState.config.tableSize] || '6-Max Activo';
  }

  const accBadge = document.getElementById('dash-accuracy-badge');
  if (accBadge) accBadge.textContent = `Precisión: ${acc}`;
}

/* ============================================================================
   4. CONTROLADOR DE NAVEGACIÓN PRINCIPAL (APP)
============================================================================ */
const app = {
  currentTab: 'dashboard',

  navigate(tabId) {
    if (tabId !== 'partidas' && typeof arena !== 'undefined' && arena.isActive) arena.exit();
    if (this.currentTab !== tabId) SoundFX.playNavigate();
    this.currentTab = tabId;
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
    const target = document.getElementById(`view-${tabId}`);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.className = 'nav-btn px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 whitespace-nowrap bg-emerald-600 text-white shadow';
      } else {
        btn.className = 'nav-btn px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 whitespace-nowrap text-slate-300 hover:bg-slate-800';
      }
    });

    if (tabId === 'partidas' && !game.initialized) {
      game.init();
    } else if (tabId === 'estadisticas') {
      stats.render();
    } else if (tabId === 'gto') {
      gtoView.render();
    } else if (tabId === 'academia') {
      academia.render();
    }
  }
};
