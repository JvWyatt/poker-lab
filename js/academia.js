/* ============================================================================
   5. MÓDULO: ACADEMIA (LECCIONES TEÓRICAS + DESAFÍOS PRÁCTICOS)
============================================================================ */
const LESSONS_DATA = [
  {
    id: 'pot_odds_101',
    level: 'Básico',
    title: 'Pot Odds y Equidad Mínima Requerida',
    summary: 'Aprende a calcular cuándo pagar una apuesta es matemáticamente rentable a largo plazo.',
    theory: `
      <p>Las <strong>Pot Odds</strong> expresan la relación entre el tamaño de la apuesta que debes pagar y el tamaño total del bote tras tu pago:</p>
      <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 my-2">
        Equidad Requerida (%) = Call / (Bote Actual + Apuesta Rival + Tu Call)
      </div>
      <p>Si tu probabilidad real de ganar la mano (<strong>Equity</strong>) supera ese porcentaje, pagar es una decisión <strong>+EV</strong> (Valor Esperado positivo).</p>
    `,
    challenge: {
      question: 'El bote es de 100 fichas. El rival apuesta 50 fichas (bote total = 150). Tienes proyecto de color con ~35% de equity en el flop. ¿Cuál es la acción óptima?',
      options: [
        { text: 'Retirarse (Fold): 35% no es suficiente para pagar 50.', correct: false, feedback: 'Incorrecto. Necesitas pagar 50 para ganar un bote final de 200 (50 / 200 = 25% de equidad requerida). Como tienes 35% > 25%, el call es muy rentable.' },
        { text: 'Pagar (Call): Necesitas 25% de equity y tienes 35% (+EV).', correct: true, feedback: '¡Exacto! 50 / (100 + 50 + 50) = 25%. Al tener 35% de equidad, obtienes un margen neto de +10% EV.' },
        { text: 'Solo es rentable si el rival apuesta menos de 25 fichas.', correct: false, feedback: 'Incorrecto. Incluso pagando 50 fichas solo requieres un 25% de equidad.' }
      ]
    }
  },
  {
    id: 'rule_4_2',
    level: 'Básico',
    title: 'Regla del 4 y del 2 (Cálculo Rápido de Outs)',
    summary: 'Estima tu probabilidad de completar un proyecto en mesa sin necesidad de calculadora.',
    theory: `
      <p>Cuenta tus <strong>Outs</strong> (cartas limpias que completan tu jugada) y aplica la regla rápida:</p>
      <ul class="list-disc pl-5 space-y-1 my-2 text-slate-300">
        <li><strong>En el Flop (faltan Turn y River):</strong> Multiplica tus outs × 4.</li>
        <li><strong>En el Turn (solo falta el River):</strong> Multiplica tus outs × 2.</li>
      </ul>
      <p>Por ejemplo, un proyecto de color tiene 9 outs: ~36% desde el flop y ~18% en el turn.</p>
    `,
    challenge: {
      question: 'Tienes 8♠ 7♠ en un board 9♦ 6♣ 2♥ (Escalera abierta / OESD = 8 outs). Estás en el Turn. ¿Cuál es tu probabilidad aproximada de ligar en el River?',
      options: [
        { text: '32% aproximadamente', correct: false, feedback: '32% sería en el Flop (8 × 4). En el Turn solo queda una carta por salir.' },
        { text: '16% aproximadamente (8 outs × 2)', correct: true, feedback: '¡Correcto! Con 8 outs y una sola calle por venir, 8 × 2 = 16% (valor exacto: 8/46 = 17.4%).' },
        { text: '24% aproximadamente', correct: false, feedback: 'Incorrecto. Multiplica 8 outs por 2 al estar en el Turn.' }
      ]
    }
  },
  {
    id: 'position_power',
    level: 'Intermedio',
    title: 'Ventaja Posicional y Realización de Equity',
    summary: 'Por qué actuar último en cada calle multiplica tus ganancias con el mismo rango.',
    theory: `
      <p>Jugar <strong>In Position (IP)</strong> —especialmente desde el <strong>Button (BTN)</strong>— te permite observar las acciones de todos los rivales antes de comprometer fichas.</p>
      <p class="mt-2">Esto genera tres ventajas clave: control del tamaño del bote, robos efectivos cuando los rivales muestran debilidad y mayor realización de equidad postflop.</p>
    `,
    challenge: {
      question: '¿Desde qué posición debes abrir (Raise First In) el rango más amplio en una mesa 6-Max?',
      options: [
        { text: 'UTG (Under the Gun)', correct: false, feedback: 'UTG es la posición más temprana; quedan 5 jugadores por hablar detrás, por lo que requiere un rango muy sólido (~15%).' },
        { text: 'BTN (Button / Dealer)', correct: true, feedback: '¡Correcto! En BTN solo quedan las ciegas por hablar preflop y tendrás posición absoluta en Flop, Turn y River (~44% de apertura).' },
        { text: 'SB (Small Blind)', correct: false, feedback: 'Aunque solo queda BB preflop, en SB jugarás fuera de posición (OOP) durante todo el postflop.' }
      ]
    }
  },
  {
    id: 'spr_commitment',
    level: 'Intermedio',
    title: 'SPR (Stack-to-Pot Ratio) y Compromiso con el Bote',
    summary: 'Cómo el tamaño de tu stack efectivo respecto al bote determina el valor de tus manos.',
    theory: `
      <p>El <strong>SPR</strong> se calcula dividiendo el stack efectivo restante entre el tamaño del bote en el flop:</p>
      <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-400 my-2">
        SPR = Stack Efectivo / Bote en el Flop
      </div>
      <p>Con <strong>SPR bajo (&lt; 3)</strong>, parejas altas (Top Pair / Overpair) tienen suficiente fuerza para ir All-In. Con <strong>SPR alto (&gt; 10)</strong>, se necesitan manos muy fuertes (Dobles+, Sets, Proyectos nut) para jugar por todo el stack.</p>
    `,
    challenge: {
      question: 'El bote en el flop es de 40 BB y tanto tú como tu rival tenéis 80 BB detrás (SPR = 2). Tienes A♠ K♦ en flop K♠ 8♣ 3♦. ¿Cuál es el plan óptimo?',
      options: [
        { text: 'Jugar pasivo (Check-Fold) por miedo a que tenga trío.', correct: false, feedback: 'Con SPR = 2 y Top Pair Top Kicker (TPTK), retirarse sería un error grave -EV.' },
        { text: 'Apostar por valor buscando comprometer el stack (All-In en 2 calles).', correct: true, feedback: '¡Excelente! Con SPR = 2, TPTK domina el rango del rival y tiene compromiso total con el bote.' },
        { text: 'Hacer mini-apuestas de 1 BB para no asustar.', correct: false, feedback: 'Las mini-apuestas regalan cartas gratis a proyectos y no construyen el bote.' }
      ]
    }
  },
  {
    id: 'cbet_texture',
    level: 'Avanzado',
    title: 'Apuesta de Continuación (C-Bet) según Textura del Board',
    summary: 'Adapta la frecuencia y el tamaño de tu C-Bet según la ventaja de rango y de nuts.',
    theory: `
      <p>Como agresor preflop (PFR), no debes hacer C-Bet el 100% de las veces:</p>
      <ul class="list-disc pl-5 space-y-1 my-2 text-slate-300">
        <li><strong>Boards secos y altos (ej. A♠ K♦ 4♣, K♣ 7♦ 2♠):</strong> Favorecen fuertemente al agresor preflop. Alta frecuencia de C-Bet con tamaño pequeño (25%–33% del bote).</li>
        <li><strong>Boards coordinados bajos/medios (ej. 8♥ 7♥ 6♦, 9♠ 8♠ 5♣):</strong> Conectan mucho con el rango de defensa del caller. Reduce frecuencia y usa tamaños grandes (66%–75%) con tus manos fuertes y semi-faroles.</li>
      </ul>
    `,
    challenge: {
      question: 'Abres en CO, paga BB. El flop cae K♠ 7♦ 2♣ (arcoíris y seco). ¿Qué estrategia de C-Bet recomienda la teoría GTO?',
      options: [
        { text: 'Alta frecuencia (~80-90%) con tamaño pequeño (1/3 del bote).', correct: true, feedback: '¡Exacto! Tienes gran ventaja de rango y de manos máximas (AA, KK, AK); una apuesta pequeña presiona todo el rango débil del rival a bajo coste.' },
        { text: 'Pasar el 100% de tu rango para proteger tu check.', correct: false, feedback: 'Pasar todo tu rango en un board tan favorable renuncia a valor inmediato y fold equity.' },
        { text: 'Overbet de 150% del bote con toda tu baraja.', correct: false, feedback: 'Un tamaño tan grande aísla únicamente contra las mejores manos del rival.' }
      ]
    }
  },
  {
    id: 'exploitative_adjustments',
    level: 'Avanzado',
    title: 'Ajustes Explotativos contra Perfiles de Rivales',
    summary: 'Desvíate del equilibrio GTO para maximizar ganancias contra errores específicos de tus oponentes.',
    theory: `
      <p>Mientras que el juego GTO te hace inexplotable, el póker <strong>explotativo</strong> castiga los desequilibrios del rival:</p>
      <ul class="list-disc pl-5 space-y-1 my-2 text-slate-300">
        <li><strong>Contra Calling Stations:</strong> Elimina los faroles puros y apuesta por valor más fino (Thin Value) con tamaños grandes.</li>
        <li><strong>Contra Nits / Weak-Tight:</strong> Roba botes con alta frecuencia y foldea tus manos medias cuando muestren agresión fuerte.</li>
        <li><strong>Contra Maníacos (LAG extremos):</strong> Amplía tu rango de Call-Down (Bluff Catchers) y deja que se faroleen solos.</li>
      </ul>
    `,
    challenge: {
      question: 'Te enfrentas a un perfil "Calling Station" que paga con cualquier pareja o proyecto débil y casi nunca foldea. Tienes A♥ 5♥ sin ligar en el river. ¿Qué debes hacer?',
      options: [
        { text: 'Hacer un farol gigante All-In para tirarlo.', correct: false, feedback: 'Nunca farolees a un jugador que no sabe retirarse; no tienes Fold Equity.' },
        { text: 'Rendirse (Check / Fold): No hay Fold Equity suficiente para que el farol sea +EV.', correct: true, feedback: '¡Correcto! Sin Fold Equity contra un Calling Station, farolear aire puro quema fichas.' },
        { text: 'Apostar 1/3 del bote como farol de bloqueo.', correct: false, feedback: 'Te pagará con cualquier pareja baja o incluso Rey alto.' }
      ]
    }
  }
];

const academia = {
  currentFilter: 'all',
  activeLessonId: LESSONS_DATA[0].id,

  filterLevel(level) {
    SoundFX.playClick();
    this.currentFilter = level;
    document.querySelectorAll('.acad-filter-btn').forEach(btn => {
      if (btn.dataset.level === level) {
        btn.className = 'acad-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white';
      } else {
        btn.className = 'acad-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700';
      }
    });
    this.render();
  },

  selectLesson(id) {
    SoundFX.playSelect();
    this.activeLessonId = id;
    this.render();
  },

  answerChallenge(lessonId, optIdx) {
    const lesson = LESSONS_DATA.find(l => l.id === lessonId);
    if (!lesson) return;
    const opt = lesson.challenge.options[optIdx];
    const feedbackEl = document.getElementById('acad-challenge-feedback');
    if (!feedbackEl) return;

    feedbackEl.classList.remove('hidden');
    if (opt.correct) SoundFX.playLessonCorrect();
    else SoundFX.playLessonWrong();
    if (opt.correct) {
      feedbackEl.className = 'p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-xs text-emerald-200 leading-relaxed';
      feedbackEl.innerHTML = `<strong class="text-emerald-400 block mb-1">✓ ¡Desafío Superado!</strong>${opt.feedback}`;
      if (!appState.academia.completedIds.includes(lessonId)) {
        appState.academia.completedIds.push(lessonId);
        saveState();
        this.renderList();
        showToast('Lección completada y guardada', 'success');
      }
    } else {
      feedbackEl.className = 'p-4 rounded-xl bg-rose-950/80 border border-rose-500/60 text-xs text-rose-200 leading-relaxed';
      feedbackEl.innerHTML = `<strong class="text-rose-400 block mb-1">✕ Revisa el cálculo:</strong>${opt.feedback}`;
    }
  },

  renderList() {
    const listEl = document.getElementById('academia-list');
    if (!listEl) return;
    const filtered = this.currentFilter === 'all'
      ? LESSONS_DATA
      : LESSONS_DATA.filter(l => l.level === this.currentFilter);

    listEl.innerHTML = filtered.map(l => {
      const done = appState.academia.completedIds.includes(l.id);
      const isActive = l.id === this.activeLessonId;
      const levelColor = l.level === 'Básico'
        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
        : l.level === 'Intermedio'
          ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
          : 'text-purple-400 bg-purple-500/10 border-purple-500/30';

      return `
        <div onclick="academia.selectLesson('${l.id}')" class="cursor-pointer rounded-2xl p-4 border transition ${isActive ? 'bg-slate-850 border-emerald-500 shadow-lg' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${levelColor}">${l.level}</span>
            ${done ? '<span class="text-[11px] font-mono text-emerald-400 font-bold">✓ Completado</span>' : '<span class="text-[11px] font-mono text-slate-500">Pendiente</span>'}
          </div>
          <h3 class="text-sm font-bold text-white">${l.title}</h3>
          <p class="text-xs text-slate-400 mt-1">${l.summary}</p>
        </div>
      `;
    }).join('');
  },

  render() {
    this.renderList();
    const ws = document.getElementById('academia-workspace');
    if (!ws) return;
    const lesson = LESSONS_DATA.find(l => l.id === this.activeLessonId) || LESSONS_DATA[0];

    ws.innerHTML = `
      <div class="space-y-5">
        <div class="border-b border-slate-800 pb-4">
          <span class="text-xs font-mono text-emerald-400 uppercase tracking-wider">${lesson.level}</span>
          <h3 class="text-xl font-extrabold text-white mt-1">${lesson.title}</h3>
        </div>
        <div class="text-sm text-slate-300 leading-relaxed space-y-2">
          ${lesson.theory}
        </div>
        <div class="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-mono font-bold">DESAFÍO PRÁCTICO</span>
          </div>
          <p class="text-sm font-semibold text-white leading-relaxed">${lesson.challenge.question}</p>
          <div class="space-y-2">
            ${lesson.challenge.options.map((opt, idx) => `
              <button onclick="academia.answerChallenge('${lesson.id}', ${idx})" class="w-full text-left p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/60 text-xs sm:text-sm text-slate-200 transition">
                ${opt.text}
              </button>
            `).join('')}
          </div>
          <div id="acad-challenge-feedback" class="hidden"></div>
        </div>
      </div>
    `;
  }
};
