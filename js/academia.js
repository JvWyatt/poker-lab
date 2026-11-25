/* ============================================================================
   5. MÓDULO: ACADEMIA (RUTA 0 → PRO: IDEA CLARA → EJEMPLO → POR QUÉ → PRÁCTICA)
   ============================================================================ */
const LESSONS_DATA = [
  {
    id: 'pot_odds_101',
    level: 'Básico',
    title: 'Pot Odds: cuándo pagar sale rentable',
    summary: 'La cuenta mínima para decidir con números, no con corazonadas.',
    idea: 'Paga sólo si te cuesta menos de lo que puedes ganar.',
    example: [
      'El bote tiene 100 fichas y el rival apuesta 50.',
      'Si pagas 50, al final habrá 200 fichas en el centro.',
      'Tu parte es 50 de 200 = 25%. Eso es lo que necesitas ligar.',
      'Tu proyecto de color liga 35 de cada 100 veces (35%).',
      'Como 35% > 25%, pagar gana fichas a largo plazo.'
    ],
    why: [
      'El bote ya tiene fichas que no son tuyas: por eso pagar 50 puede salir barato.',
      'Si ligas, ganas 150 (las 100 del bote + las 50 del rival). Si fallas, pierdes 50.',
      'La cuenta completa: 35 × 150 − 65 × 50 = +2000 entre 100 manos = +20 fichas por mano.'
    ],
    atTable: 'Antes de pagar pregúntate: ¿cuánto pongo y cuánto hay ya en el centro?',
    challenge: {
      question: 'Bote de 100 fichas. El rival apuesta 50. Tienes proyecto de color con ~35% de equity en el flop. ¿Qué haces?',
      options: [
        { text: 'Retirarme: con 35% no llego.', correct: false, feedback: 'Te sobra margen. Pagas 50 para disputar 200 fichas: necesitas 50/200 = 25%. Como tienes 35%, el call es rentable.' },
        { text: 'Pagar: necesito 25% y tengo 35% (+EV).', correct: true, feedback: 'Exacto. 50 / (100 + 50 + 50) = 25%. Tus 35% superan esa barrera, así que ganas ~20 fichas por mano a largo plazo.' },
        { text: 'Sólo pagar si el rival apuesta menos de 25.', correct: false, feedback: 'No: pagando 50 ya necesitas sólo un 25%. El tamaño de la apuesta no cambia la regla, cambia el número a comparar.' }
      ]
    }
  },
  {
    id: 'rule_4_2',
    level: 'Básico',
    title: 'Regla del 4 y del 2: outs sin calculadora',
    summary: 'Convierte cartas buenas en porcentaje en un segundo.',
    idea: 'Cuenta tus cartas buenas: ×4 si faltan dos cartas, ×2 si falta una.',
    example: [
      'Tienes 8♠ 7♠ y el board es 9♦ 6♣ 2♥.',
      'Te sirven los 5 (4 cartas) y los 10 (4 cartas): 8 cartas buenas u «outs».',
      'Estás en el Turn: falta sólo el River → 8 × 2 = 16%.',
      'En el Flop habrían quedado dos cartas → 8 × 4 = 32%.'
    ],
    why: [
      'Quedan unas 46 cartas sin ver. Una carta concreta sale cerca del 2% de las veces (1 de 46).',
      'Por eso cada out vale ~2% con una carta por venir y casi ~4% con dos.',
      'Es un atajo: la cuenta exacta es 8/46 = 17,4%, muy cerca del 16%.'
    ],
    atTable: 'Flop → ×4. Turn → ×2. No necesitas sacar el móvil.',
    challenge: {
      question: '8♠ 7♠ en un board 9♦ 6♣ 2♥ (8 outs). Estás en el Turn. ¿Probabilidad aproximada de ligar en el River?',
      options: [
        { text: '32%', correct: false, feedback: '32% sería en el Flop (8 × 4). En el Turn sólo queda una carta por salir.' },
        { text: '16% (8 × 2)', correct: true, feedback: 'Correcto. Con una sola calle por venir, 8 × 2 = 16%. El valor exacto es 8/46 = 17,4%: el atajo sirve.' },
        { text: '24%', correct: false, feedback: 'No. En el Turn se multiplica por 2, no por 3. La respuesta correcta es ~16%.' }
      ]
    }
  },
  {
    id: 'position_power',
    level: 'Intermedio',
    title: 'Posición: actuar al último manda',
    summary: 'La misma mano gana más cuando decides después de ver a los demás.',
    idea: 'Actuar al último te deja ver qué hacen todos antes de soltar fichas.',
    example: [
      'Desde UTG (el primero) hablan 5 jugadores detrás: abre pocas manos.',
      'Desde BTN (el último) sólo quedan las ciegas antes que tú.',
      'Después del flop, desde BTN decides al final en Flop, Turn y River.'
    ],
    why: [
      'Ver más acciones significa tener más información y cometer menos errores.',
      'Si todos pasan, puedes robar el bote con una apuesta pequeña.',
      'Si alguien apuesta fuerte, te retiras sin haber gastado una ficha.'
    ],
    atTable: 'En BTN abre muchas manos; en UTG abre pocas y buenas.',
    challenge: {
      question: '¿Desde qué posición abres el rango más amplio en una mesa de 6?',
      options: [
        { text: 'UTG', correct: false, feedback: 'Es la peor posición: quedan 5 jugadores por hablar, así que hace falta un rango muy sólido (~15%).' },
        { text: 'BTN', correct: true, feedback: 'Correcto. Sólo las ciegas hablan antes y tienes posición en las tres calles posteriores (~44% de manos).' },
        { text: 'SB', correct: false, feedback: 'Aunque preflop queda poco, en SB juegas fuera de posición durante todo el postflop.' }
      ]
    }
  },
  {
    id: 'spr_commitment',
    level: 'Intermedio',
    title: 'SPR: cuándo un par ya vale todo el stack',
    summary: 'La relación entre tus fichas y el bote decide qué manos aguantan.',
    idea: 'Si te quedan pocas fichas respecto al bote, un par bueno ya vale para jugarlo todo.',
    example: [
      'Bote en el flop: 40 BB. Te quedan 80 BB.',
      'SPR = 80 / 40 = 2 (bajo).',
      'Tienes A♠ K♦ y el flop cae K♠ 8♣ 3♦: par de K con el mejor kicker.',
      'Apostando fuerte en dos calles dejas el all-in planteado sin forzar la primera.'
    ],
    why: [
      'Con SPR bajo el bote ya es grande comparado con tus fichas: no necesitas una mano enorme.',
      'Si haces all-in de 80, el rival pone 80 más: arriesgas 80 para ganar 120. Necesitas ~40% de equity; tu par de K la supera.',
      'Con SPR alto (>10) hay mucho camino por recorrer: ahí sí hacen falta tríos, dobles o proyectos nut.'
    ],
    atTable: 'SPR < 3 → par bueno, a por todas. SPR > 10 → manos muy fuertes.',
    challenge: {
      question: 'Bote de 40 BB en el flop, 80 BB detrás por jugador (SPR = 2). Tienes A♠ K♦ en K♠ 8♣ 3♦. ¿Plan óptimo?',
      options: [
        { text: 'Check-Fold por miedo a un trío.', correct: false, feedback: 'Error grave. Con SPR 2 y par de K con mejor kicker, retirarse tira una mano dominante.' },
        { text: 'Apostar por valor y comprometer el stack en dos calles.', correct: true, feedback: 'Correcto. Con SPR 2, tu par domina el rango de call y el bote ya te devuelve la apuesta: es +EV.' },
        { text: 'Mini-apuestas de 1 BB para no asustar.', correct: false, feedback: 'Regalas cartas gratis a los proyectos y nunca construyes el bote que ya tienes cerca.' }
      ]
    }
  },
  {
    id: 'cbet_texture',
    level: 'Avanzado',
    title: 'C-Bet: apuesta según el board, no por costumbre',
    summary: 'Cuándo seguir apostando tras el flop y con qué tamaño.',
    idea: 'Apuesta tras el flop cuando el board te favorece; no lo hagas siempre.',
    example: [
      'Abres en CO y la BB paga. Flop: K♠ 7♦ 2♣ (seco, sin proyectos).',
      'Tu rango tiene muchas K y pares altos; el de la BB tiene más cartas medias.',
      'Apuesta 1/3 del bote con alta frecuencia (~80%).',
      'En 8♥ 7♥ 6♦, en cambio, la BB conecta mucho más: apuesta menos seguido y más grande con manos fuertes.'
    ],
    why: [
      'En boards altos y secos, quien subió preflop tiene más manos máximas (AA, KK, AK).',
      'Una apuesta pequeña presiona barato: el rival foldea bastante y tú arriesgas poco.',
      'En boards bajos y coordinados el rival tiene más parejas y proyectos: la apuesta pequeña no lo mueve.'
    ],
    atTable: 'Seco y alto → pequeña y seguido. Coordinado y bajo → grande y selectiva.',
    challenge: {
      question: 'Abres en CO, paga la BB. Flop K♠ 7♦ 2♣, arcoíris y seco. ¿Estrategia de C-Bet?',
      options: [
        { text: 'Alta frecuencia (~80%) con 1/3 del bote.', correct: true, feedback: 'Correcto. Tienes ventaja de rango y de manos máximas; una apuesta pequeña presiona todo su rango débil a bajo coste.' },
        { text: 'Pasar siempre para «proteger» el check.', correct: false, feedback: 'Renuncias a valor inmediato y a los foldeos en un board que te favorece claramente.' },
        { text: 'Overbet del 150% con toda la baraja.', correct: false, feedback: 'Un tamaño tan grande sólo consigue que te paguen las mejores manos.' }
      ]
    }
  },
  {
    id: 'exploitative_adjustments',
    level: 'Avanzado',
    title: 'Ajustes: gana castigando el error del rival',
    summary: 'Salir del equilibrio GTO cuando enfrente hay un fallo claro.',
    idea: 'No hace falta jugar perfecto: gana más haciendo lo que el rival no sabe defender.',
    example: [
      'Rival «Calling Station»: paga con cualquier pareja y casi nunca foldea.',
      'Tienes A♥ 5♥ y no ligas nada en el river.',
      'Un farol all-in no sirve: no va a retirarse, sólo pierdes fichas.',
      'Mejor apostar cuando tienes algo y dejar de intentar robar ese bote.'
    ],
    why: [
      'Un farol gana fichas sólo si el rival foldea. Sin foldeos es dinero regalado.',
      'Contra quien foldea mucho, sube con aire; contra quien nunca foldea, sube con valor.',
      'GTO es el punto de partida; la ganancia extra está en adaptarse al jugador de enfrente.'
    ],
    atTable: 'Que no foldea → valor. Que foldea mucho → farol. Que apuesta fuerte → cuidado.',
    challenge: {
      question: 'Un «Calling Station» paga con cualquier pareja y casi nunca foldea. Tienes A♥ 5♥ sin ligar en el river. ¿Qué haces?',
      options: [
        { text: 'Farol gigante all-in para asustarlo.', correct: false, feedback: 'No tiene foldeos: no puedes asustarlo. Ese farol quema fichas.' },
        { text: 'Check / retirarme: no hay foldeos que paguen el farol.', correct: true, feedback: 'Correcto. Sin Fold Equity, farolear aire es -EV. Guarda las fichas y apuesta sólo con valor.' },
        { text: 'Apostar 1/3 como farol de bloqueo.', correct: false, feedback: 'Te pagará con cualquier pareja baja o incluso con rey alto.' }
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
      const next = LESSONS_DATA[LESSONS_DATA.indexOf(lesson) + 1];
      const nextBtn = next
        ? `<button onclick="academia.selectLesson('${next.id}')" class="mt-3 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition">Siguiente paso: ${next.title} →</button>`
        : '<p class="mt-3 font-bold text-emerald-300">🏆 ¡Ruta completa! De 0 a pro.</p>';
      feedbackEl.innerHTML = `<strong class="text-emerald-400 block mb-1">✓ ¡Correcto! Por esto es la mejor decisión:</strong>${opt.feedback}${nextBtn}`;
      if (!appState.academia.completedIds.includes(lessonId)) {
        appState.academia.completedIds.push(lessonId);
        saveState();
        this.renderList();
        showToast('Lección completada y guardada', 'success');
      }
    } else {
      feedbackEl.className = 'p-4 rounded-xl bg-rose-950/80 border border-rose-500/60 text-xs text-rose-200 leading-relaxed';
      feedbackEl.innerHTML = `<strong class="text-rose-400 block mb-1">✕ Revisa la cuenta:</strong>${opt.feedback}`;
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
      const step = LESSONS_DATA.indexOf(l) + 1;
      const levelColor = l.level === 'Básico'
        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
        : l.level === 'Intermedio'
          ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
          : 'text-purple-400 bg-purple-500/10 border-purple-500/30';

      return `
        <div onclick="academia.selectLesson('${l.id}')" class="cursor-pointer rounded-2xl p-4 border transition ${isActive ? 'bg-slate-850 border-emerald-500 shadow-lg' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${levelColor}">${l.level}</span>
            <span class="text-[10px] font-mono text-slate-500">Paso ${step}/${LESSONS_DATA.length} · ${done ? '✓ Hecho' : 'Pendiente'}</span>
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
    const step = LESSONS_DATA.indexOf(lesson) + 1;
    const doneCount = appState.academia.completedIds.length;
    const pct = Math.round((doneCount / LESSONS_DATA.length) * 100);

    ws.innerHTML = `
      <div class="space-y-5">
        <div class="border-b border-slate-800 pb-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs font-mono text-emerald-400 uppercase tracking-wider">${lesson.level}</span>
            <span class="text-[11px] font-mono text-slate-400">Paso ${step} de ${LESSONS_DATA.length} · Ruta 0 → Pro</span>
          </div>
          <h3 class="text-xl font-extrabold text-white mt-1">${lesson.title}</h3>
          <p class="text-xs text-slate-400 mt-1">${lesson.summary}</p>
          <div class="mt-3 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full transition-all" style="width:${pct}%"></div>
          </div>
        </div>

        <div class="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 backdrop-blur-sm p-4">
          <span class="text-[11px] font-mono font-bold text-emerald-300">💡 EN PALABRAS SIMPLES</span>
          <p class="text-sm text-emerald-100 mt-1 leading-relaxed">${lesson.idea}</p>
        </div>

        <div class="rounded-2xl border border-slate-700/60 bg-slate-950/70 backdrop-blur-sm p-4">
          <span class="text-[11px] font-mono font-bold text-amber-300">🔢 EJEMPLO PRÁCTICO</span>
          <ol class="list-decimal list-inside space-y-1.5 mt-2 text-sm text-slate-200 leading-relaxed">
            ${lesson.example.map(line => `<li>${line}</li>`).join('')}
          </ol>
        </div>

        <div class="rounded-2xl border border-slate-700/60 bg-slate-950/70 backdrop-blur-sm p-4">
          <span class="text-[11px] font-mono font-bold text-cyan-300">🧠 ¿POR QUÉ PASA?</span>
          <ul class="list-disc pl-5 space-y-1.5 mt-2 text-sm text-slate-300 leading-relaxed">
            ${lesson.why.map(line => `<li>${line}</li>`).join('')}
          </ul>
        </div>

        <div class="rounded-2xl border border-slate-700/60 bg-slate-950/70 backdrop-blur-sm p-4">
          <span class="text-[11px] font-mono font-bold text-purple-300">🎯 EN LA MESA</span>
          <p class="text-sm text-slate-200 mt-1 leading-relaxed">${lesson.atTable}</p>
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
