/* ============================================================================
   13. POP-UP DE CALIFICACIÓN ESTILO VIDEOJUEGO (MONOCROMÁTICO, 3.5s)
   La explicación matemática sigue viviendo en el panel del Coach.
============================================================================ */
const gradePopup = {
  hideTimer: null,

  GRADES: [
    { min: 95, sign: '!!', word: 'BRILLANTE', tone: 'bg-cyan-950/80 border-cyan-300/70 text-cyan-300 shadow-cyan-500/20' },
    { min: 80, sign: '!',  word: 'EXCELENTE', tone: 'bg-emerald-950/80 border-emerald-300/70 text-emerald-300 shadow-emerald-500/20' },
    { min: 60, sign: '✓', word: 'ÓPTIMA',    tone: 'bg-teal-950/80 border-teal-300/70 text-teal-300 shadow-teal-500/20' },
    { min: 35, sign: '?!', word: 'IMPRECISA', tone: 'bg-amber-950/80 border-amber-300/70 text-amber-300 shadow-amber-500/20' },
    { min: 15, sign: '?',  word: 'ERROR',     tone: 'bg-orange-950/80 border-orange-300/70 text-orange-300 shadow-orange-500/20' },
    { min: 0,  sign: '??', word: 'PÉSIMA',    tone: 'bg-rose-950/80 border-rose-300/70 text-rose-300 shadow-rose-500/20' }
  ],

  resolve(accuracyPct) {
    const pct = Math.max(0, Math.min(100, Number(accuracyPct) || 0));
    return this.GRADES.find(g => pct >= g.min) || this.GRADES[this.GRADES.length - 1];
  },

  show(accuracyPct, symbol = '') {
    const layer = document.getElementById('grade-popup-layer');
    if (!layer) return;

    const score = Math.max(0, Math.min(100, Math.round(Number(accuracyPct) || 0)));
    const grade = this.resolve(score);
    const sign = symbol === grade.sign ? symbol : grade.sign;

    clearTimeout(this.hideTimer);
    layer.innerHTML = `
      <div class="grade-pop inline-flex items-center justify-center rounded-full border px-4 py-2 backdrop-blur-md shadow-xl ${grade.tone}">
        <span class="grade-pop-label text-sm sm:text-base font-extrabold tracking-wide whitespace-nowrap">${sign} ${grade.word}</span>
      </div>
    `;

    this.hideTimer = setTimeout(() => this.hide(), 3500);
  },

  hide() {
    clearTimeout(this.hideTimer);
    const layer = document.getElementById('grade-popup-layer');
    const pop = layer && layer.firstElementChild;
    if (!pop) return;
    pop.classList.add('is-leaving');
    setTimeout(() => {
      if (pop.parentNode === layer) pop.remove();
    }, 320);
  }
};
