/* ============================================================================
   9. MÓDULO: ESTADÍSTICAS Y AUDITORÍA DE DECISIONES
============================================================================ */
const stats = {
  render() {
    const s = appState.stats;
    const totalDec = s.goodDecisions + s.badDecisions;
    const acc = totalDec > 0 ? ((s.goodDecisions / totalDec) * 100).toFixed(1) : '0.0';

    document.getElementById('stat-hands-played').textContent = s.handsPlayed;
    document.getElementById('stat-accuracy').textContent = `${acc}%`;
    document.getElementById('stat-decisions-ratio').textContent = `${s.goodDecisions} aciertos / ${s.badDecisions} errores`;
    document.getElementById('stat-ev-lost').textContent = `${s.evLostBB.toFixed(1)} BB`;

    const netEl = document.getElementById('stat-net-bb');
    netEl.textContent = `${s.netProfitBB >= 0 ? '+' : ''}${s.netProfitBB.toFixed(1)} BB`;
    netEl.className = `text-2xl sm:text-3xl font-extrabold font-mono mt-1 block ${s.netProfitBB >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;

    const list = document.getElementById('stat-history-list');
    if (!s.history || s.history.length === 0) {
      list.innerHTML = '<p class="text-xs text-slate-500">Aún no hay decisiones registradas. Juega algunas manos en la sección Partidas.</p>';
      return;
    }

    list.innerHTML = s.history.map(item => `
      <div class="p-3 rounded-xl border ${item.optimal ? 'bg-slate-950/80 border-slate-800' : 'bg-rose-950/30 border-rose-800/50'} flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div class="flex items-center gap-2 text-xs font-mono">
            <span class="text-slate-500">${item.time}</span>
            <span class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">${item.street}</span>
            <span class="font-bold text-white">${item.hand}</span>
            <span class="font-bold ${item.optimal ? 'text-emerald-400' : 'text-rose-400'}">→ ${item.action}</span>
          </div>
          <p class="text-xs text-slate-300 mt-1">${item.reason}</p>
        </div>
        <div class="text-right font-mono text-xs font-bold ${item.optimal ? 'text-emerald-400' : 'text-rose-400'}">
          ${item.optimal ? '+EV Óptimo' : `-${item.evLoss} BB`}
        </div>
      </div>
    `).join('');
  },

  resetStats() {
    appState.stats = JSON.parse(JSON.stringify(DEFAULT_STATE.stats));
    saveState();
    this.render();
    showToast('Estadísticas reiniciadas correctamente.', 'info');
  }
};
