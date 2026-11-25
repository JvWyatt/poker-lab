/* ============================================================================
   5. MÓDULO: ACADEMIA — RUTA POR PANTALLAS
   Mapa (12 clases / 5 niveles) → vista de clase a pantalla completa →
   5 pasos fijos por clase. Los formatos internos (exhibit, duel, case)
   sólo organizan el contenido; no se exponen como etiquetas.
   Ruta completa: las 12 clases tienen 5 pasos fijos y son jugables.
============================================================================ */
const SUIT_SYMBOL = { s: '♠', h: '♥', d: '♦', c: '♣' };
const RED_SUITS = new Set(['h', 'd']);

const MODULES = [
  { id: 0, name: 'Fundamentos', subtitle: 'Jerarquía y showdown', tone: 'sky' },
  { id: 1, name: 'Mesa', subtitle: 'Ciegas, orden y acciones', tone: 'emerald' },
  { id: 2, name: 'Números', subtitle: 'Probabilidades y equity', tone: 'amber' },
  { id: 3, name: 'Táctica', subtitle: 'Posición, boards y tamaños', tone: 'orange' },
  { id: 4, name: 'Estrategia', subtitle: 'Cierre, GTO y explotación', tone: 'purple' }
];

const E = (title, table, lines, revealCount, showdown = null) => ({ kind: 'exhibit', title, table, lines, revealCount, showdown });
const D = (title, board, hands, winner, why) => ({ kind: 'duel', title, board, hands, winner, why });
const O = (key, label, correct, feedback) => ({ key, label, correct, feedback });
const K = (prompt, table, options) => ({ kind: 'case', prompt, table, options });

const flopTable = (over = {}) => ({
  street: 'FLOP',
  board: [],
  pot: 100,
  bet: 0,
  heroPos: 'BTN',
  villainPos: 'BB',
  villainAction: 'Pasa (Check)',
  ...over
});
const turnTable = over => flopTable({ street: 'TURN', ...over });
const riverTable = over => flopTable({ street: 'RIVER', ...over });

const HEART_OUTS = ['2h', '3h', '4h', '6h', '7h', 'Th', 'Jh', 'Qh', 'Kh'];
const STRAIGHT_8_OUTS = ['5s', '5h', '5d', '5c', 'Ts', 'Th', 'Td', 'Tc'];
const GUTSHOT_4_OUTS = ['5s', '5h', '5d', '5c'];

const BASE_BOARD = ['Ks', 'Qd', '7s', '2c', '9h'];

/* ---------------------------------------------------------------------------
   CURRÍCULUM: 12 clases. Sólo las marcadas con `steps` son jugables en este
   prototipo. Las demás son tarjetas visuales del mapa ("En preparación").
--------------------------------------------------------------------------- */
const LESSONS_DATA = [
  {
    id: 'ranking', number: 1, module: 0, format: 'exhibit',
    title: 'Jerarquía de manos', subtitle: 'Orden de fuerza, de carta alta a escalera real',
    steps: [
      E('Carta alta contra pareja',
        { street: 'SHOWDOWN', board: ['Ks', '6d', '9c', '2h', '4s'], pot: 100, hero: ['As', '5c'], villain: ['7s', '7h'], note: 'Carta alta A vs par de 7s' },
        [
          'Si no tienes ninguna combinación, tu mano es “carta alta”: se decide por la carta más alta y luego por los kickers.',
          'Una sola pareja ya supera a cualquier carta alta, aunque tu carta suelta sea un As.',
          'Aquí el rival tiene un par de 7s y gana; tus A♠ 5♣ no forman pareja ni proyecto completado.'
        ], 5, {
          board: ['Ks', '6d', '9c', '2h', '4s'],
          hands: [{ label: 'MANO A', cards: ['As', '5c'] }, { label: 'MANO B', cards: ['7s', '7h'] }],
          winner: 'B',
          why: 'Carta alta As contra pareja de 7s. Cualquier pareja supera a carta alta: gana la Mano B.'
        }),
      E('Doble pareja contra trío',
        { street: 'SHOWDOWN', board: ['Kc', 'Kd', '7c', '2h', '9s'], pot: 140, hero: ['As', '7s'], villain: ['Kh', 'Qd'], note: 'Doble pareja vs trío de Reyes' },
        [
          'La doble pareja usa dos pares distintos y un kicker: aquí Reyes y Sietes con As de kicker.',
          'El trío son tres cartas del mismo valor. Tres Reyes superan siempre a dos pares.',
          'Para comparar dos tríos se mira primero el valor del trío y después los kickers.'
        ], 5, {
          board: ['Kc', 'Kd', '7c', '2h', '9s'],
          hands: [{ label: 'MANO A', cards: ['As', '7s'] }, { label: 'MANO B', cards: ['Kh', 'Qd'] }],
          winner: 'B',
          why: 'La Mano A tiene doble pareja (Reyes y Sietes). La Mano B tiene trío de Reyes. El trío gana.'
        }),
      E('Escalera contra trío',
        { street: 'SHOWDOWN', board: ['5c', '6d', '7h', '2s', 'Kc'], pot: 160, hero: ['8s', '9d'], villain: ['5s', '5h'], note: 'Escalera 5-9 vs trío de 5s' },
        [
          'La escalera son cinco cartas consecutivas. Aquí 5-6-7-8-9, sin importar los palos.',
          'El trío de 5s es fuerte, pero una escalera está un escalón por encima en el ranking.',
          'Cuando dos escaleras empatan, gana la de mayor carta alta.'
        ], 5, {
          board: ['5c', '6d', '7h', '2s', 'Kc'],
          hands: [{ label: 'MANO A', cards: ['8s', '9d'] }, { label: 'MANO B', cards: ['5s', '5h'] }],
          winner: 'A',
          why: 'La Mano A completa 5-6-7-8-9. La Mano B tiene trío de 5s. La escalera gana.'
        }),
      E('Full house contra póker',
        { street: 'SHOWDOWN', board: ['As', 'Ad', '7c', '7d', '2h'], pot: 200, hero: ['7s', 'Kc'], villain: ['Ah', 'Ac'], note: 'Full house de 7s vs cuatro Ases' },
        [
          'El full house combina trío y pareja: tres 7s y dos Ases en la Mano A.',
          'El póker (cuatro cartas iguales) es superior al full house: la Mano B tiene cuatro Ases.',
          'Sólo la escalera real supera al póker en el ranking completo.'
        ], 5, {
          board: ['As', 'Ad', '7c', '7d', '2h'],
          hands: [{ label: 'MANO A', cards: ['7s', 'Kc'] }, { label: 'MANO B', cards: ['Ah', 'Ac'] }],
          winner: 'B',
          why: 'La Mano A tiene full house (7s lleno de Ases). La Mano B tiene cuatro Ases: el póker gana.'
        }),
      E('La mano máxima: escalera real',
        { street: 'SHOWDOWN', board: ['Ts', 'Js', 'Qs', '2c', '7d'], pot: 220, hero: ['Ks', 'As'], villain: ['9h', '9d'], note: 'Escalera real de espadas' },
        [
          'La escalera real es A-K-Q-J-T del mismo palo. Es la mano más alta y no puede ser superada.',
          'Orden completo, de menor a mayor: carta alta, pareja, doble pareja, trío, escalera, color, full house, póker, escalera real.',
          'Reconocer este orden es todo lo que necesitas antes de comparar manos en un duelo.'
        ], 5, {
          board: ['Ts', 'Js', 'Qs', '2c', '7d'],
          hands: [{ label: 'MANO A', cards: ['Ks', 'As'] }, { label: 'MANO B', cards: ['9h', '9d'] }],
          winner: 'A',
          why: 'La Mano A tiene escalera real de espadas. Es la mano máxima: gana a cualquier otra, incluida una pareja de 9s.'
        })
    ]
  },
  {
    id: 'duelos', number: 2, module: 0, format: 'duel',
    title: 'Comparación de manos', subtitle: 'Cómo decidir un showdown',
    steps: [
      D('Par de Ases contra par de Reyes', ['Qc', 'Jd', '7s', '2c', '9h'],
        [{ label: 'MANO A', cards: ['As', 'Ad'] }, { label: 'MANO B', cards: ['Ks', 'Kd'] }], 'A',
        'Ambas son una pareja. Gana la del par más alto: Ases por encima de Reyes. Los kickers no se miran cuando el par ya es distinto.'),
      D('El segundo par decide entre dos dobles parejas', ['Ac', 'Ad', '7h', '2c', '9s'],
        [{ label: 'MANO A', cards: ['Qs', 'Qd'] }, { label: 'MANO B', cards: ['Ks', 'Kd'] }], 'B',
        'Las dos forman doble pareja con los Ases del board. Se decide por el segundo par: Reyes superan Reinas.'),
      D('Trío contra doble pareja', ['Ac', 'Ad', '7s', '2c', '9h'],
        [{ label: 'MANO A', cards: ['As', '5d'] }, { label: 'MANO B', cards: ['Ks', 'Kd'] }], 'A',
        'El board trae A♣ A♦. La Mano A completa trío de Ases; la Mano B completa doble pareja de Ases y Reyes. Tres cartas iguales valen más que dos pares: gana el trío.'),
      D('Escalera contra trío', ['5c', '6d', '7h', '2c', '9s'],
        [{ label: 'MANO A', cards: ['7s', '7d'] }, { label: 'MANO B', cards: ['8s', '4d'] }], 'B',
        '5-6-7-8-9 es escalera y una escalera supera siempre al trío, aunque el trío sean Sietes.'),
      D('Color contra escalera', ['9s', '8s', '2c', '7s', 'Kd'],
        [{ label: 'MANO A', cards: ['As', '3s'] }, { label: 'MANO B', cards: ['Tc', 'Jd'] }], 'A',
        'A♠ 3♠ con 9♠ 8♠ 7♠ forma color. El color está un escalón por encima de la escalera 7-8-9-T-J.')
    ]
  },
  {
    id: 'posiciones', number: 3, module: 1, format: 'exhibit',
    title: 'Estructura de la mesa', subtitle: 'Ciegas, orden de acción y rondas',
    steps: [
      E('El botón y las ciegas',
        { street: 'PREFLOP', board: [], pot: 3, hero: ['As', '7d'], villain: ['Kh', 'Qc'], villainHidden: true, heroPos: 'BTN', villainPos: 'BB', villainAction: 'Ciegas 1 / 2', note: 'Botón en BTN · ciegas 1 y 2' },
        [
          'Un botón giratorio (dealer button) marca quién es el BTN: es la mejor posición porque habla al final en las rondas post-flop.',
          'A la izquierda del botón están SB (ciega pequeña, 1) y BB (ciega grande, 2). Son apuestas forzadas antes de repartir.',
          'Las ciegas existen para que siempre haya fichas en el bote y no se pueda esperar gratis.'
        ], 0),
      E('Orden de la primera ronda',
        { street: 'PREFLOP', board: [], pot: 3, hero: ['As', '7d'], villain: ['Kh', 'Qc'], heroPos: 'UTG', villainPos: 'BB', villainAction: 'Ciegas 1 / 2', note: 'Preflop: UTG habla primero, BB al final' },
        [
          'En preflop la acción empieza a la izquierda de la BB (UTG) y sigue en sentido horario.',
          'La BB habla al final de la primera ronda: puede subir (raise), pasar (check) si nadie subió, o retirarse.',
          'Después del flop el orden cambia: empieza SB y termina el BTN, que siempre cierra la acción.'
        ], 0),
      E('Flop: primera ronda post-flop',
        { street: 'FLOP', board: BASE_BOARD, pot: 40, hero: ['As', '7d'], villain: ['Kh', 'Qc'], heroPos: 'BTN', villainPos: 'BB', villainAction: 'Pasa (Check)', note: '3 comunitarias · bote 40' },
        [
          'Tras preflop llegan las tres comunitarias del flop: K♠ Q♦ 7♠.',
          'La ronda empieza en SB. Sin apuesta viva puedes pasar (check); si hay apuesta, debes pagar, subir o retirarte.',
          'Ahora ya puedes formar 5 cartas con tus 2 privadas y las 3 de la mesa.'
        ], 3),
      E('Turn y River: las últimas rondas',
        { street: 'RIVER', board: BASE_BOARD, pot: 140, hero: ['As', '7d'], villain: ['Kh', 'Qc'], heroPos: 'BTN', villainPos: 'BB', villainAction: 'Pasa (Check)', note: '5 comunitarias · ya no quedan cartas' },
        [
          'El Turn es la cuarta comunitaria (2♣) y el River la quinta (9♥). Cada una abre una ronda nueva de apuestas.',
          'Las cartas salen flop → turn → river, con una ronda de apuestas entre cada revelación.',
          'Tras el River no viene nada más: si quedan dos jugadores, se comparan las manos en el showdown.'
        ], 5),
      E('Showdown: quién gana y por qué',
        { street: 'SHOWDOWN', board: BASE_BOARD, pot: 140, hero: ['As', '7d'], villain: ['Kh', 'Qc'], note: 'Comparación final de 5 cartas' },
        [
          'En el showdown cada jugador muestra su mejor mano de 5 cartas entre las 7 disponibles.',
          'Gana el mejor tipo de mano; si empatan, se comparan los kickers uno a uno.',
          'La posición no decide el ganador: decide quién habla al final y, por tanto, quién controla el bote.'
        ], 5, {
          board: BASE_BOARD,
          hands: [{ label: 'TÚ · BTN', cards: ['As', '7d'] }, { label: 'RIVAL · BB', cards: ['Kh', 'Qc'] }],
          winner: 'B',
          why: 'Tienes pareja de 7s. El rival tiene doble pareja de Reyes y Reinas con kicker 9. El doble pareja gana.'
        })
    ]
  },
  {
    id: 'acciones', number: 4, module: 1, format: 'case',
    title: 'Acciones en una mano', subtitle: 'Pasar, pagar, apostar, subir y retirarse',
    steps: [
      K('Top pair en board seco: ¿apostar o pasar?', flopTable({ board: ['Ks', '7d', '2c'], pot: 60, bet: 0, hero: ['Kh', 'Qd'], villain: ['9h', '8h'], villainProfile: 'TAG', villainAction: 'Pasa (Check)', note: 'Par de Reyes, buen kicker, board seco' }), [
        O('bet', 'Apostar / Subir por valor', true, 'Correcto. Apostar cobra valor de manos peores y de proyectos como el color del rival. Pasar dejaría de ganar fichas con tu mejor mano.'),
        O('call', 'Pasar / Pagar', false, 'Pasar es legal, pero aquí es demasiado pasivo: tu par de Reyes debe apostar en un board seco.'),
        O('fold', 'Retirarte', false, 'No hay apuesta viva y tienes una mano fuerte: retirarte sería regalar el bote.')
      ]),
      K('Dos sobrecartas con color projectado', flopTable({ board: ['Th', '7h', '3c'], pot: 80, bet: 40, hero: ['Ah', 'Kh'], villain: ['Qd', '9s'], villainAction: 'Apuesta 40', note: '9 outs de color · pagas 40 para 160' }), [
        O('call', 'Pasar / Pagar', true, 'Correcto. 40 / (80 + 40 + 40) = 25%. Con 9 outs de color tienes ~35% en el flop: pagar es rentable.'),
        O('bet', 'Apostar / Subir', false, 'Subir con sobrecartas sin completar no mejora tu precio y puede dejarte sin posición.'),
        O('fold', 'Retirarte', false, 'Tienes equity suficiente y buen precio: foldear es perder una decisión +EV.')
      ]),
      K('Par mínimo contra apuesta grande', flopTable({ board: ['Ks', 'Qd', '7c'], pot: 100, bet: 80, hero: ['3s', '3c'], villain: ['Ah', 'Kd'], villainAction: 'Apuesta 80', note: 'Par de 3s · 2 outs · precio 31%' }), [
        O('fold', 'Retirarte', true, 'Correcto. Debes pagar 80 para un bote final de 260 (31%). Un par de 3s con 2 outs no llega a ese equity.'),
        O('call', 'Pasar / Pagar', false, 'Pagar 80 con un par mínimo y pocos outs es perder fichas de forma repetida.'),
        O('bet', 'Apostar / Subir', false, 'Subir con la peor pareja contra un rango fuerte sólo añade pérdidas.')
      ]),
      K('Sin pareja y sin apuesta viva', flopTable({ board: ['9d', '6c', '2h'], pot: 80, bet: 0, hero: ['Ah', 'Kd'], villain: ['7s', '8s'], villainAction: 'Pasa (Check)', note: 'No hay apuesta: puedes pasar gratis' }), [
        O('check', 'Pasar / Pagar (Check)', true, 'Correcto. Si nadie apostó, no hay nada que pagar: puedes pasar sin coste y ver el turn.'),
        O('bet', 'Apostar / Subir', false, 'Podrías farolear, pero con dos sobrecartas sin proyecto claro y fuera de plan, pasar es la acción básica correcta.'),
        O('fold', 'Retirarte', false, 'Nunca te retires cuando no hay apuesta: es gratis continuar.')
      ]),
      K('Trío en el flop: ¿pagar o subir?', flopTable({ board: ['8c', '4d', 'Js'], pot: 100, bet: 60, hero: ['8h', '8d'], villain: ['Kh', 'Qh'], villainAction: 'Apuesta 60', note: 'Trío de 8s · sube por valor' }), [
        O('bet', 'Apostar / Subir', true, 'Correcto. Con trío, subir exige más fichas a manos peores y a proyectos. Pagar sólo es suficiente con manos más débiles.'),
        O('call', 'Pasar / Pagar', false, 'Pagar es rentable, pero deja valor sobre la mesa: tu trío tiene ventaja clara.'),
        O('fold', 'Retirarte', false, 'Un trío nunca se foldea a una apuesta de este tamaño en el flop.')
      ])
    ]
  },
  {
    id: 'pot_odds', number: 5, module: 2, format: 'case',
    title: 'Pot odds y precio de decisión', subtitle: 'Cuándo pagar según el bote',
    steps: [
      K('Bote 100, apuesta 50 y 9 outs de color', flopTable({ board: ['9h', '8h', '2c'], pot: 100, bet: 50, hero: ['Ah', '5h'], villain: ['Kd', 'Qd'], villainProfile: 'TAG', villainAction: 'Apuesta 50', outCards: HEART_OUTS, note: '9 outs · necesitas 25%, tienes ~35%' }), [
        O('call', 'Pagar 50', true, 'Correcto. 50 / (100 + 50 + 50) = 25%. Tu color liga ~35%, así que el call gana fichas a largo plazo.'),
        O('fold', 'Retirarte', false, 'Te sobra margen: 35% de equity contra 25% de pot odds. Foldear aquí tira una decisión rentable.'),
        O('raise', 'Subir con el proyecto', false, 'La decisión básica y segura con esos outs es pagar. Subir añade riesgo sin mejorar el precio.')
      ]),
      K('Gutshot en Turn, apuesta 100', turnTable({ board: ['9d', '6c', '2h', '3s'], pot: 100, bet: 100, hero: ['8s', '7s'], villain: ['Ah', 'Kd'], villainAction: 'Apuesta 100', outCards: GUTSHOT_4_OUTS, note: '4 outs · necesitas 33%, tienes ~9%' }), [
        O('fold', 'Retirarte', true, 'Correcto. 100 / (100 + 100 + 100) = 33%. Con una carta por venir y 4 outs tienes ~9%.'),
        O('call', 'Pagar 100', false, 'Pagar 100 con 9% de equity contra 33% de pot odds es perder fichas cada vez.'),
        O('raise', 'Subir', false, 'No hay fold equity suficiente para compensar: te costaría caro y tus outs son pocos.')
      ]),
      K('Gutshot en Flop, apuesta pequeña', flopTable({ board: ['9d', '6c', '2h'], pot: 100, bet: 20, hero: ['8s', '7s'], villain: ['Ah', 'Kd'], villainAction: 'Apuesta 20', outCards: GUTSHOT_4_OUTS, note: '4 outs · necesitas 14%, tienes ~16%' }), [
        O('call', 'Pagar 20', true, 'Correcto. 20 / (100 + 20 + 20) = 14,3%. Con dos cartas por venir, 4 outs valen ~16%: el call es rentable.'),
        O('fold', 'Retirarte', false, 'El precio es barato: 16% de equity supera el 14,3% exigido.'),
        O('raise', 'Subir', false, 'Con un gutshot débil, subir no mejora tu decisión: paga barato y espera el Turn.')
      ]),
      K('Color en Turn, apuesta 100', turnTable({ board: ['9h', '8h', '2c', '4d'], pot: 100, bet: 100, hero: ['Ah', '5h'], villain: ['Kd', 'Qd'], villainAction: 'Apuesta 100', outCards: HEART_OUTS, note: '9 outs · necesitas 33%, tienes ~20%' }), [
        O('fold', 'Retirarte', true, 'Correcto. En Turn sólo queda una carta: 9 outs valen ~20%, pero debes pagar 100 para un bote de 300 (33%).'),
        O('call', 'Pagar 100', false, 'El color es buen proyecto, pero el precio es malo: 20% de equity no cubre 33% de pot odds.'),
        O('raise', 'Subir', false, 'Sin fold equity suficiente, subir con un proyecto que liga pocas veces es -EV.')
      ]),
      K('Ocho outs de escalera, apuesta 40', flopTable({ board: ['9d', '6c', '2h'], pot: 100, bet: 40, hero: ['8s', '7s'], villain: ['Ah', 'Kd'], villainAction: 'Apuesta 40', outCards: STRAIGHT_8_OUTS, note: '8 outs · necesitas 22%, tienes ~32%' }), [
        O('call', 'Pagar 40', true, 'Correcto. 40 / (100 + 40 + 40) = 22%. Con 8 outs y dos cartas por venir tienes ~32%: sobra margen.'),
        O('fold', 'Retirarte', false, 'Tienes casi 10 puntos porcentuales de ventaja sobre las pot odds: pagar es claro.'),
        O('raise', 'Subir', false, 'La decisión correcta es pagar; subir con un proyecto sin completar añade riesgo innecesario.')
      ])
    ]
  },
  {
    id: 'outs', number: 6, module: 2, format: 'case',
    title: 'Outs y equity estimada', subtitle: 'Reglas del 4 y del 2',
    steps: [
      K('Color en flop, apuesta pequeña', flopTable({ board: ['9h', '8h', '2c'], pot: 100, bet: 25, hero: ['Ah', '5h'], villain: ['Kd', 'Qd'], villainAction: 'Apuesta 25', outCards: HEART_OUTS, note: '9 outs × 4 ≈ 36% · necesitas 16,7%' }), [
        O('call', 'Pasar / Pagar', true, 'Correcto. En flop, 9 outs × 4 ≈ 36%. Pagas 25 para 150 (16,7%): hay mucha margen.'),
        O('fold', 'Retirarte', false, 'Tu color liga casi el doble de lo que exige el precio: foldear es un error.'),
        O('bet', 'Apostar / Subir', false, 'Con un proyecto todavía sin completar, la decisión limpia es pagar este precio tan bajo.')
      ]),
      K('Color en turn, apuesta de bote', turnTable({ board: ['9h', '8h', '2c', '4d'], pot: 100, bet: 100, hero: ['Ah', '5h'], villain: ['Kd', 'Qd'], villainAction: 'Apuesta 100', outCards: HEART_OUTS, note: '9 outs × 2 ≈ 18% · necesitas 33%' }), [
        O('fold', 'Retirarte', true, 'Correcto. En turn se usa la regla del 2: 9 × 2 ≈ 18%. Necesitas 100 / 300 = 33%: el precio es malo.'),
        O('call', 'Pasar / Pagar', false, 'El mismo color que era rentable en el flop ya no lo es en el turn con una apuesta de bote.'),
        O('bet', 'Apostar / Subir', false, 'Subir sin haber completado el color y con pocos outs realizables empeora la decisión.')
      ]),
      K('Escalera abierta en flop', flopTable({ board: ['9d', '6c', '2h'], pot: 100, bet: 60, hero: ['8s', '7s'], villain: ['Ah', 'Kd'], villainAction: 'Apuesta 60', outCards: STRAIGHT_8_OUTS, note: '8 outs × 4 ≈ 32% · necesitas 27%' }), [
        O('call', 'Pasar / Pagar', true, 'Correcto. Ocho outs en flop valen ~32% (8 × 4). Pagas 60 para 220 (27%): rentable.'),
        O('fold', 'Retirarte', false, 'Tienes margen suficiente sobre las pot odds: foldear desperdicia una buena escalera projectada.'),
        O('bet', 'Apostar / Subir', false, 'Tu proyecto es bueno, pero subir no mejora el precio que te están dando.')
      ]),
      K('Gutshot en turn con buen precio', turnTable({ board: ['9d', '6c', '2h', '3s'], pot: 200, bet: 50, hero: ['8s', '7s'], villain: ['Ah', 'Kd'], villainAction: 'Apuesta 50', outCards: GUTSHOT_4_OUTS, note: '4 outs × 2 ≈ 9% · necesitas 16,7%' }), [
        O('fold', 'Retirarte', true, 'Correcto. En turn, 4 outs × 2 ≈ 9%. Aunque el precio parezca barato, necesitas 16,7%.'),
        O('call', 'Pasar / Pagar', false, 'Un gutshot en turn sólo tiene una carta para ligar: 9% no cubre el 16,7% exigido.'),
        O('bet', 'Apostar / Subir', false, 'Con 4 outs no hay ni equity ni fold equity suficiente para subir.')
      ]),
      K('Color en turn con precio bajo', turnTable({ board: ['9h', '8h', '2c', '4d'], pot: 300, bet: 60, hero: ['Ah', '5h'], villain: ['Kd', 'Qd'], villainAction: 'Apuesta 60', outCards: HEART_OUTS, note: '9 outs × 2 ≈ 18% · necesitas 14,3%' }), [
        O('call', 'Pasar / Pagar', true, 'Correcto. En turn, 9 × 2 ≈ 18% y pagas 60 para 420 (14,3%). La regla del 2 justifica el call.'),
        O('fold', 'Retirarte', false, 'El bote es grande y el precio bajo: tu equity supera lo exigido.'),
        O('bet', 'Apostar / Subir', false, 'No necesitas subir: con este precio, pagar ya es una decisión rentable.')
      ])
    ]
  },
  {
    id: 'posicion', number: 7, module: 3, format: 'case',
    title: 'Ventaja posicional', subtitle: 'Jugar dentro y fuera de posición',
    steps: [
      K('BTN con top pair, rival pasa', flopTable({ board: ['Ks', '7d', '2c'], pot: 80, bet: 0, hero: ['Kd', 'Qd'], villain: ['9h', '8h'], heroPos: 'BTN', villainPos: 'BB', villainAction: 'Pasa (Check)', note: 'IP · par de Reyes · bote 80' }), [
        O('bet', 'Apostar / Subir', true, 'Correcto. En posición puedes apostar por valor y, si el rival sube, ver su acción antes de decidir. El BTN controla la ronda.'),
        O('call', 'Pasar / Pagar', false, 'Pasar en posición con top pair cede el control del bote a una mano que actuará en peor posición.'),
        O('fold', 'Retirarte', false, 'Tienes una mano fuerte y no hay apuesta: retirarte es imposible de justificar.')
      ]),
      K('BB con par débil, rival pasa', flopTable({ board: ['Ks', '7d', '2c'], pot: 80, bet: 0, hero: ['7s', '6s'], villain: ['Ah', 'Kc'], heroPos: 'BB', villainPos: 'BTN', villainAction: 'Pasa (Check)', note: 'OOP · par de 7s · bote 80' }), [
        O('check', 'Pasar / Pagar (Check)', true, 'Correcto. Fuera de posición, pasar controla el bote y evita quedar atrapado por un raise del BTN. Tu par de 7s no quiere inflar el pozo.'),
        O('bet', 'Apostar / Subir', false, 'Apostar OOP con un par débil te enfrenta a un raise con posición: pierdes el control.'),
        O('fold', 'Retirarte', false, 'Sin apuesta viva no hay que foldear: ver el turn es gratis.')
      ]),
      K('IP con par medio en river', riverTable({ board: ['9c', '6d', '2h', '4s', 'Kc'], pot: 120, bet: 40, hero: ['9s', '8s'], villain: ['Ah', 'Kd'], heroPos: 'BTN', villainPos: 'BB', villainAction: 'Apuesta 40', note: 'IP · par de 9s · paga 40 para 200' }), [
        O('call', 'Pasar / Pagar', true, 'Correcto. Con posición realizas mejor tu equity: pagas 40 para 200 (20%) y tu par medio puede ganar en el showdown.'),
        O('bet', 'Apostar / Subir', false, 'Subir con par medio convierte una mano de showdown en un farol caro sin adaptación de rango.'),
        O('fold', 'Retirarte', false, 'El precio es razonable y estás en posición: foldear es demasiado ajustado.')
      ]),
      K('OOP con la misma mano y más precio', riverTable({ board: ['9c', '6d', '2h', '4s', 'Kc'], pot: 120, bet: 80, hero: ['9s', '8s'], villain: ['Ah', 'Kd'], heroPos: 'BB', villainPos: 'BTN', villainAction: 'Apuesta 80', note: 'OOP · par de 9s · paga 80 para 280' }), [
        O('fold', 'Retirarte', true, 'Correcto. Misma mano, pero fuera de posición y con precio mayor (80 para 280 = 28,6%). El par medio no realiza suficiente equity OOP.'),
        O('call', 'Pasar / Pagar', false, 'El mismo par que podías pagar en posición se vuelve perdedor OOP y con peor precio.'),
        O('bet', 'Apostar / Subir', false, 'No hay valor en subir con par medio contra un rango que te tiene en desventaja posicional.')
      ]),
      K('BTN con top pair tras check del rival', flopTable({ board: ['As', '7d', '2c'], pot: 80, bet: 0, hero: ['Ah', 'Kd'], villain: ['9h', '8h'], heroPos: 'BTN', villainPos: 'BB', villainAction: 'Pasa (Check)', note: 'IP · top pair · bote 80' }), [
        O('bet', 'Apostar / Subir', true, 'Correcto. En posición, apostar pequeño con top pair cobra valor y obtiene información antes de la siguiente ronda.'),
        O('check', 'Pasar / Pagar (Check)', false, 'Pasar en el BTN con top pair renuncia al valor de tu mejor posición.'),
        O('fold', 'Retirarte', false, 'No tienes apuesta en contra y tu mano es fuerte: nunca foldees.')
      ])
    ]
  },
  {
    id: 'cbet', number: 8, module: 3, format: 'case',
    title: 'Apuesta de continuación', subtitle: 'Cuándo seguir apostando tras el flop',
    steps: [
      K('Board seco y alto: A-7-2', flopTable({ board: ['As', '7d', '2c'], pot: 100, bet: 0, hero: ['Ah', 'Kd'], villain: ['9h', '8h'], villainAction: 'Pasa (Check)', note: 'Fuiste el agresor preflop · top pair' }), [
        O('bet', 'Apostar / Subir pequeño', true, 'Correcto. En A-7-2 sin draws claros, tu rango de preflop tiene mucha ventaja. Una C-Bet pequeña cobra valor y gana al instante.'),
        O('check', 'Pasar / Pagar (Check)', false, 'Pasar aquí desaprovecha la ventaja de rango que tienes como agresor preflop en un board seco.'),
        O('fold', 'Retirarte', false, 'No hay apuesta en contra y tienes top pair: retirarte es un error grave.')
      ]),
      K('Board mojado: 9♥-8♥-2♣', flopTable({ board: ['9h', '8h', '2c'], pot: 100, bet: 0, hero: ['As', 'Ks'], villain: ['7d', '6d'], villainAction: 'Pasa (Check)', note: 'Sobrecartas sin pareja · board coordinado' }), [
        O('check', 'Pasar / Pagar (Check)', true, 'Correcto. En un board mojado con muchos draws y manos que ligaron, A♠ K♠ no tiene suficiente equity para farolear. Pasar controla el bote.'),
        O('bet', 'Apostar / Subir', false, 'La C-Bet automática falla aquí: este board golpea los rangos de defensa y tendrás que jugar turn OOP.'),
        O('fold', 'Retirarte', false, 'Sin apuesta viva puedes pasar gratis y conservar tus sobrecartas.')
      ]),
      K('Par inferior en board seco K-7-2', flopTable({ board: ['Ks', '7d', '2c'], pot: 100, bet: 0, hero: ['6s', '6h'], villain: ['Ah', 'Kd'], villainAction: 'Pasa (Check)', note: 'Par de 6s · no supera la carta alta de la mesa' }), [
        O('check', 'Pasar / Pagar (Check)', true, 'Correcto. Tu par de 6s es inferior a la K de la mesa y no tiene valor contra manos peores que paguen. Pasar y ver el turn.'),
        O('bet', 'Apostar / Subir', false, 'Apostar aquí sólo consigue que te suban con manos mejores: es un farol sin equity.'),
        O('fold', 'Retirarte', false, 'No hay apuesta viva: pasar es gratis.')
      ]),
      K('Board pareado K-K-7 con trío', flopTable({ board: ['Kc', 'Kd', '7c'], pot: 100, bet: 0, hero: ['Kh', 'Qd'], villain: ['9s', '8s'], villainAction: 'Pasa (Check)', note: 'Trío de Reyes · board pareado' }), [
        O('bet', 'Apostar / Subir', true, 'Correcto. Con trío apuestas por valor sí o sí: las manos con 7s, pares menores y draws te pagarán.'),
        O('check', 'Pasar / Pagar (Check)', false, 'Pasar un trío es perder valor. Aunque el board esté pareado, tu mano está muy por encima del rango del rival.'),
        O('fold', 'Retirarte', false, 'No hay apuesta en contra y tu mano es enorme: foldear es impensable.')
      ]),
      K('Sobrepar en board semimojado', flopTable({ board: ['Jc', '8d', '3s'], pot: 120, bet: 0, hero: ['Qh', 'Qd'], villain: ['As', 'Kh'], villainAction: 'Pasa (Check)', note: 'Sobrepar de Reinas · board con draws' }), [
        O('bet', 'Apostar / Subir grande', true, 'Correcto. Con sobrepar apuestas tamaño grande en un board que permite draws: cobras valor y niegas precios baratos a proyectos.'),
        O('check', 'Pasar / Pagar (Check)', false, 'Dar check gratis a manos con draws en J-8-3 permite que liguen barato. Tu sobrepar necesita protección.'),
        O('fold', 'Retirarte', false, 'No hay apuesta viva y tienes una mano fuerte.')
      ])
    ]
  },
  {
    id: 'spr', number: 9, module: 3, format: 'case',
    title: 'SPR y compromiso de pila', subtitle: 'Cuánto vale una mano según la pila',
    steps: [
      K('SPR 0,5: ya estás comprometido', riverTable({ board: ['Ks', '7d', '2c', '4h', '9s'], pot: 200, bet: 40, hero: ['Kh', 'Qd'], villain: ['Qh', 'Jd'], villainAction: 'Apuesta 40', note: 'SPR 0,5 · top pair · pagas 40 para 280' }), [
        O('call', 'Pasar / Pagar', true, 'Correcto. Con SPR 0,5 tu pila es corta respecto al bote: 40 / 280 ≈ 14%. Tu top pair gana muy a menudo y foldear sería terrible.'),
        O('bet', 'Apostar / Subir', false, 'Subir con SPR tan bajo no añade presión: estás casi all-in y el rival no va a foldear mejor.'),
        O('fold', 'Retirarte', false, 'Foldear top pair por 40 en un bote de 200 es regalar fichas.')
      ]),
      K('SPR 8: bote profundo, kicker débil', flopTable({ board: ['Ks', '7d', '2c'], pot: 40, bet: 0, hero: ['Kh', '9d'], villain: ['Ah', 'Kd'], heroPos: 'BB', villainPos: 'BTN', villainAction: 'Pasa (Check)', note: 'SPR 8 · par de Reyes con kicker 9' }), [
        O('check', 'Pasar / Pagar (Check)', true, 'Correcto. Con SPR alto no quieres inflar el bote con par de Reyes y kicker débil. Pasar mantiene el pozo pequeño y limita tu riesgo.'),
        O('bet', 'Apostar / Subir', false, 'En un bote profundo, apostar grande con kicker débil construye un bote que no puedes ganar cómodamente.'),
        O('fold', 'Retirarte', false, 'Sin apuesta viva no hay que foldear tu par.')
      ]),
      K('SPR 2: sobrepar con espacio', flopTable({ board: ['9d', '4c', 'Js'], pot: 60, bet: 30, hero: ['Ah', 'Ad'], villain: ['Kd', 'Qd'], villainAction: 'Apuesta 30', note: 'SPR 2 · sobrepar de Ases' }), [
        O('bet', 'Apostar / Subir', true, 'Correcto. Con SPR 2 hay espacio para construir el bote y tu sobrepar está muy por encima del rango del rival. Subir por valor.'),
        O('call', 'Pasar / Pagar', false, 'Pagar es rentable, pero con SPR 2 dejas valor: subir tiene mejor EV.'),
        O('fold', 'Retirarte', false, 'Un sobrepar nunca se foldea a una apuesta de medio bote.')
      ]),
      K('SPR 1: color projectado con buen precio', turnTable({ board: ['9h', '8h', '2c', '4d'], pot: 100, bet: 20, hero: ['Ah', '5h'], villain: ['Kd', 'Qd'], villainAction: 'Apuesta 20', outCards: HEART_OUTS, note: 'SPR 1 · 9 outs · paga 20 para 140' }), [
        O('call', 'Pasar / Pagar', true, 'Correcto. Con SPR 1, si ligas podrás cobrar el resto de la pila. Pagas 20 para 140 (14,3%) y tus 9 outs valen ~18-20%: el precio es suficiente.'),
        O('fold', 'Retirarte', false, 'El bajo SPR mejora tus implied odds: no foldees un color projectado con este precio.'),
        O('bet', 'Apostar / Subir', false, 'Subir con un proyecto sin completar contra un rango fuerte no aporta fold equity suficiente.')
      ]),
      K('SPR 10: par mínimo ante apuesta de bote', flopTable({ board: ['Ks', 'Qd', '7c'], pot: 50, bet: 50, hero: ['3s', '3c'], villain: ['Ah', 'Kd'], villainAction: 'Apuesta 50', note: 'SPR 10 · paga 50 para 150 (33%)' }), [
        O('fold', 'Retirarte', true, 'Correcto. Con SPR 10 hay mucha pila por detrás y un par de 3s tiene pocos outs. Pagar 50 para 150 exige 33% que no tienes.'),
        O('call', 'Pasar / Pagar', false, 'El bote profundo castiga a las manos débiles: pagar par mínimo aquí es -EV.'),
        O('bet', 'Apostar / Subir', false, 'Subir con la peor pareja y mucha pila pendiente es la peor opción.')
      ])
    ]
  },
  {
    id: 'semibluff', number: 10, module: 4, format: 'case',
    title: 'Semi-farol con bloqueadores', subtitle: 'Equity real, folds y bloqueos',
    steps: [
      K('Color projectado: dos formas de ganar', flopTable({ board: ['9h', '8h', '2c'], pot: 100, bet: 0, hero: ['Ah', '5h'], villain: ['7s', '6s'], villainAction: 'Pasa (Check)', outCards: HEART_OUTS, note: '9 outs + fold equity · bote 100' }), [
        O('bet', 'Apostar / Subir', true, 'Correcto. Es un semi-farol: puedes ganar ahora si el rival foldea, o completar tu color en el turn. Con 9 outs tienes equity real aunque te llamen.'),
        O('check', 'Pasar / Pagar (Check)', false, 'Pasar pierde la oportunidad de fold equity: tu mano gana de dos formas y debes aprovecharlas.'),
        O('fold', 'Retirarte', false, 'Tienes una de las mejores manos de proyecto del flop: foldear sería desperdiciar equity.')
      ]),
      K('Gutshot contra un Nit', flopTable({ board: ['9d', '6c', '2h'], pot: 100, bet: 0, hero: ['8s', '7s'], villain: ['Ah', 'Kd'], villainProfile: 'Nit', villainAction: 'Pasa (Check)', outCards: GUTSHOT_4_OUTS, note: '4 outs · Nit casi no foldea' }), [
        O('check', 'Pasar / Pagar (Check)', true, 'Correcto. Un semi-farol necesita folds. Contra un Nit que no abandona manos, 4 outs no bastan: pasa y busca precio barato.'),
        O('bet', 'Apostar / Subir', false, 'Farolear contra quien no foldea es perder fichas: aquí no hay fold equity suficiente.'),
        O('fold', 'Retirarte', false, 'Tu gutshot tiene algo de equity y no hay apuesta: pasar es gratis.')
      ]),
      K('Farol en River con bloqueador A♥', riverTable({ board: ['9h', '8h', '2c', '4d', 'Kd'], pot: 100, bet: 0, hero: ['Ah', 'Qs'], villain: ['7s', '6s'], villainAction: 'Pasa (Check)', note: 'A♥ bloquea combinaciones de color' }), [
        O('bet', 'Apostar / Subir', true, 'Correcto. Tu A♥ bloquea las manos de color fuerte que el rival podría tener y tu farol puede hacer foldear pares medianos. Aquí el bloqueador importa.'),
        O('check', 'Pasar / Pagar (Check)', false, 'Con toda tu gama de faroles bloqueada y el rival capacitado para foldear, pasar deja escapar el farol.'),
        O('fold', 'Retirarte', false, 'No hay apuesta viva: foldear no tiene sentido cuando puedes farolear.')
      ]),
      K('Farol sin bloqueador contra Station', riverTable({ board: ['9h', '8h', '2c', '4d', 'Kd'], pot: 100, bet: 0, hero: ['As', 'Qs'], villain: ['7h', '6h'], villainProfile: 'Calling Station', villainAction: 'Pasa (Check)', note: 'Sin bloqueador · Station no foldea' }), [
        O('check', 'Pasar / Pagar (Check)', true, 'Correcto. El farol necesita que el rival foldee y una Calling Station no lo hace. Sin bloqueador, apostar es regalar fichas.'),
        O('bet', 'Apostar / Subir', false, 'Contra un jugador que paga demasiado, farolear es -EV: apuesta sólo con valor.'),
        O('fold', 'Retirarte', false, 'Sin apuesta en contra, pasar gratis es mejor que foldear.')
      ]),
      K('Turn: semi-farol contra apuesta', turnTable({ board: ['9h', '8h', '2c', '4d'], pot: 100, bet: 40, hero: ['Ah', '5h'], villain: ['Kd', 'Qd'], villainAction: 'Apuesta 40', outCards: HEART_OUTS, note: '9 outs + posibilidad de fold' }), [
        O('bet', 'Apostar / Subir', true, 'Correcto. Subir con tu color projectado combina equity real con fold equity: puedes ganar ya o ligar en el river.'),
        O('call', 'Pasar / Pagar', false, 'Pagar es válido, pero aquí la subida es mejor: el rival puede foldear manos que te superan.'),
        O('fold', 'Retirarte', false, 'Con 9 outs y algo de fold equity, retirarte es demasiado débil.')
      ])
    ]
  },
  {
    id: 'gto', number: 11, module: 4, format: 'case',
    title: 'Equilibrio GTO y explotación', subtitle: 'Frecuencias, rangos y perfiles',
    steps: [
      K('Frecuencia mixta aproximada en BTN', flopTable({ board: ['Ks', '7d', '2c'], pot: 100, bet: 30, hero: ['Ah', 'Jh'], villain: ['Qd', '9d'], heroPos: 'BTN', villainPos: 'BB', villainProfile: 'TAG', villainAction: 'Apuesta 30', note: 'Aproximación GTO · sobrecartas + cola de color' }), [
        O('call', 'Pasar / Pagar', true, 'Correcto según nuestra aproximación GTO determinista: con dos sobrecartas y cola de color, pagar entra en la frecuencia mixta. 30 para 160 es 18,75%.'),
        O('fold', 'Retirarte', false, 'Foldear sobrecartas con cola de color a ese precio es excesivo en una estrategia equilibrada.'),
        O('bet', 'Apostar / Subir', false, 'Subir sin pareja ni draw completo añade riesgo; la frecuencia mixta prefiere pagar aquí.')
      ]),
      K('Calling Station: apuesta por valor', riverTable({ board: ['Ks', '7d', '2c', '4h', '9s'], pot: 100, bet: 0, hero: ['Kh', 'Ad'], villain: ['Qd', 'Qc'], villainProfile: 'Calling Station', villainAction: 'Pasa (Check)', note: 'Station paga demasiado · top pair' }), [
        O('bet', 'Apostar / Subir', true, 'Correcto. Explotación: contra quien paga demasiado, apuesta por valor con top pair y no intentes faroles. Aquí tu ventaja está en cobrar.'),
        O('check', 'Pasar / Pagar (Check)', false, 'Pasar con una mano fuerte contra un Station es perder valor: va a pagar con manos peores.'),
        O('fold', 'Retirarte', false, 'No hay apuesta viva y tienes top pair.')
      ]),
      K('Nit sube en River', riverTable({ board: ['As', '9d', '4c', '6h', '2s'], pot: 100, bet: 80, hero: ['Kd', 'Qd'], villain: ['Ah', 'Kc'], villainProfile: 'Nit', villainAction: 'Apuesta 80', note: 'Rango muy fuerte · paga 80 para 260' }), [
        O('fold', 'Retirarte', true, 'Correcto. Explotación: un Nit que apuesta fuerte en el river tiene casi siempre una mano superior. Tu K♦ Q♦ no gana lo suficiente.'),
        O('call', 'Pasar / Pagar', false, 'Pagar 80 para 260 exige 30,7% de equity; contra el rango real de un Nit no lo tienes.'),
        O('bet', 'Apostar / Subir', false, 'Subir contra un rango que te domina sólo aumenta la pérdida.')
      ]),
      K('Maníaco sobreapuesta el flop', flopTable({ board: ['7h', '6c', '2d'], pot: 100, bet: 80, hero: ['Ah', 'Kd'], villain: ['9s', '8s'], villainProfile: 'Maníaco', villainAction: 'Apuesta 80 (overbet)', note: 'Rango débil · paga 80 para 260' }), [
        O('call', 'Pasar / Pagar', true, 'Correcto. Explotación: un Maníaco sobreapuesta con muchas manos débiles. Tus dos sobrecartas tienen suficiente equity contra ese rango para pagar.'),
        O('fold', 'Retirarte', false, 'Foldear aquí es dejarse explotar por un rival que apuesta demasiado con aire.'),
        O('bet', 'Apostar / Subir', false, 'Con sobrecartas sin completar, subir no es necesario: llama y decide con posición en turn.')
      ]),
      K('Weak-Tight tras tu C-Bet', turnTable({ board: ['Js', '8d', '3c', '2h'], pot: 100, bet: 0, hero: ['As', 'Ks'], villain: ['Qh', 'Qd'], villainProfile: 'Weak-Tight', villainAction: 'Pasa (Check)', note: 'Foldea demasiado tras C-Bet' }), [
        O('bet', 'Apostar / Subir', true, 'Correcto. Explotación: un Weak-Tight abandona manos medianas cuando sigues presionando. Tu farol con sobrecartas tiene fold equity real.'),
        O('check', 'Pasar / Pagar (Check)', false, 'Pasar le permite ver el river gratis con una mano que habría foldeado.'),
        O('fold', 'Retirarte', false, 'No hay apuesta en contra y tienes una oportunidad clara de farol.')
      ])
    ]
  },
  {
    id: 'fundamentos', number: 12, module: 4, format: 'exhibit',
    title: 'Cómo se juega una mano',
    subtitle: '2 privadas + 5 comunitarias = mejor mano de 5',
    steps: [
      E('Tus 2 cartas privadas',
        { street: 'PREFLOP', board: [], pot: 3, hero: ['As', '7d'], villain: null, villainHidden: true, heroPos: 'BTN', villainPos: 'BB', villainAction: 'Ciegas 1 / 2', note: 'Sólo tú ves A♠ 7♦' },
        [
          'En Texas Hold’em cada jugador recibe 2 cartas privadas: son tuyas, nadie más las ve.',
          'Con A♠ 7♦ ya tienes una carta alta y un posible proyecto, pero todavía no puedes ganar.',
          'Faltan las cartas comunitarias, que se pondrán boca arriba sobre la mesa.'
        ], 0),
      E('El Flop: 3 cartas comunitarias',
        { street: 'FLOP', board: BASE_BOARD, pot: 40, hero: ['As', '7d'], villain: ['Kh', 'Qc'], villainProfile: 'TAG', villainAction: 'Pasa (Check)', note: 'Ahora hay 5 cartas visibles' },
        [
          'Tras la primera ronda de apuestas se revelan 3 cartas comunitarias: K♠ Q♦ 7♠.',
          'Éstas son de todos: el rival puede usarlas igual que tú.',
          'Con tus 2 cartas y 3 comunitarias ya puedes elegir 5 cartas, pero aún faltan 2.'
        ], 3),
      E('El Turn: 4ª comunitaria',
        { street: 'TURN', board: BASE_BOARD, pot: 80, hero: ['As', '7d'], villain: ['Kh', 'Qc'], villainProfile: 'TAG', villainAction: 'Pasa (Check)', note: '4 cartas sobre la mesa' },
        [
          'La cuarta carta comunitaria es el Turn: 2♣.',
          'La mesa crece y también cambia la fuerza de tu mano: ahora tienes un par de 7s.',
          'Después de esta ronda vendrá una última carta.'
        ], 4),
      E('El River: 5ª y última comunitaria',
        { street: 'RIVER', board: BASE_BOARD, pot: 140, hero: ['As', '7d'], villain: ['Kh', 'Qc'], villainProfile: 'TAG', villainAction: 'Pasa (Check)', note: 'Ya no quedan cartas por venir' },
        [
          'La quinta carta comunitaria es el River: 9♥. Ya no viene ninguna carta más.',
          'Cada jugador tiene 7 cartas disponibles, pero debe formar la mejor mano posible de 5.',
          'Esa es la regla central: 2 propias + 5 comunitarias → mejor combinación de 5.'
        ], 5),
      E('Así se decide el ganador',
        { street: 'SHOWDOWN', board: BASE_BOARD, pot: 140, hero: ['As', '7d'], villain: ['Kh', 'Qc'], note: 'Compara las mejores 5 cartas' },
        [
          'En el showdown se comparan las mejores 5 cartas de cada jugador.',
          'El evaluador elige automáticamente la mejor combinación de 5 entre las 7 disponibles.',
          'Gana el tipo de mano más alto; si hay empate, se comparan los kickers.'
        ], 5, {
          board: BASE_BOARD,
          hands: [{ label: 'TÚ', cards: ['As', '7d'] }, { label: 'RIVAL', cards: ['Kh', 'Qc'] }],
          winner: 'B',
          why: 'Tú tienes una pareja de 7s. El rival tiene doble pareja: Reyes y Reinas, con 9 de kicker. El doble pareja supera siempre a una sola pareja. Esta comparación directa es el tema de la clase 2.'
        })
    ]
  },
];

/* ---------------------------------------------------------------------------
   ACADEMIA — controlador de mapa, clases y pasos
--------------------------------------------------------------------------- */
const academia = {
  activeLessonId: null,
  activeStepIndex: 0,
  lastAnswer: null,

  init() {
    const v2 = appState.academia.v2;
    const stored = LESSONS_DATA.find(l => l.id === v2.activeLessonId);
    this.activeLessonId = stored && this.isPlayable(stored) ? stored.id : LESSONS_DATA[0].id;
    this.activeStepIndex = Math.max(0, Math.min(5, Number(v2.activeStepIndex) || 0));
    this.persist();
    window.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const academiaVisible = !document.getElementById('view-academia')?.classList.contains('hidden');
      if (academiaVisible && appState.academia.v2.view === 'lesson') {
        event.preventDefault();
        this.closeLesson();
      }
    });

    // Tras girar el móvil (o mostrar/ocultar la barra del navegador) se
    // re-sincroniza el modo clase; antes podía quedar un body bloqueado sin
    // scroll ni botón «← Ruta» alcanzable hasta cambiar de pestaña.
    const syncLessonViewport = () => {
      const view = document.getElementById('view-academia');
      const inLesson = !!view && !view.classList.contains('hidden')
        && appState.academia.v2.view === 'lesson';
      document.body.classList.toggle('is-acad-lesson', inLesson);
      if (!inLesson) return;
      const body = document.querySelector('.acad-shell-body');
      if (body) body.scrollTop = Math.min(body.scrollTop, body.scrollHeight);
    };
    window.addEventListener('resize', syncLessonViewport, { passive: true });
    window.addEventListener('orientationchange', () => {
      syncLessonViewport();
      setTimeout(syncLessonViewport, 150);
    }, { passive: true });
    window.visualViewport?.addEventListener('resize', syncLessonViewport, { passive: true });
  },

  persist() {
    const v2 = appState.academia.v2;
    v2.activeLessonId = this.activeLessonId;
    v2.activeStepIndex = this.activeStepIndex;
    saveState();
  },

  currentLesson() {
    return LESSONS_DATA.find(l => l.id === this.activeLessonId) || LESSONS_DATA[0];
  },

  isPlayable(lesson) {
    return Array.isArray(lesson.steps) && lesson.steps.length === 5;
  },

  progressOf(lessonId) {
    const lesson = LESSONS_DATA.find(l => l.id === lessonId);
    if (!lesson || !this.isPlayable(lesson)) return 0;
    if (appState.academia.completedIds.includes(lessonId)) return 5;
    const value = Number(appState.academia.v2.stepProgress[lessonId]) || 0;
    return Math.max(0, Math.min(5, Math.floor(value)));
  },

  currentStep() {
    const lesson = this.currentLesson();
    return lesson.steps ? lesson.steps[this.activeStepIndex] : null;
  },

  cardHTML(code, extraClass = '') {
    const cardId = PokerEngine.codeToCard(code);
    if (cardId === null || cardId === undefined) return '';
    const card = PokerEngine.cardToObj(cardId);
    if (!card) return '';
    const symbol = SUIT_SYMBOL[card.suit] || card.suit;
    const rank = card.rank === 'T' ? '10' : card.rank;
    const tone = RED_SUITS.has(card.suit) ? 'text-rose-500' : 'text-slate-900';
    return `<div class="acad-card ${tone} ${extraClass}" title="${rank}${symbol}"><span class="acad-card-rank">${rank}</span><span class="acad-card-suit">${symbol}</span></div>`;
  },

  bestFive(codes) {
    const cards = codes.map(c => PokerEngine.codeToCard(c));
    let best = null;
    for (let a = 0; a < 3; a++) for (let b = a + 1; b < 4; b++) for (let c = b + 1; c < 5; c++)
      for (let d = c + 1; d < 6; d++) for (let e = d + 1; e < 7; e++) {
        const idx = [a, b, c, d, e];
        const ev = PokerEngine.evaluateHand(idx.map(i => cards[i]));
        if (!best || ev.score > best.ev.score) best = { cards: idx.map(i => codes[i]), ev };
      }
    return best;
  },

  /* ---------------- Mapa ---------------- */
  render() {
    const map = document.getElementById('academia-list');
    const shell = document.getElementById('academia-workspace');
    if (!map || !shell) return;
    const inLesson = appState.academia.v2.view === 'lesson' && this.isPlayable(this.currentLesson());
    document.body.classList.toggle('is-acad-lesson', inLesson);
    map.classList.toggle('hidden', inLesson);
    shell.classList.toggle('hidden', !inLesson);
    document.getElementById('academia-map-header')?.classList.toggle('hidden', inLesson);
    if (inLesson) this.renderLesson();
    else this.renderMap();
  },

  renderMap() {
    const map = document.getElementById('academia-list');
    if (!map) return;
    const resume = document.getElementById('acad-resume');
    const last = LESSONS_DATA.find(l => l.id === appState.academia.v2.activeLessonId);
    if (resume) {
      const hasProgress = last && this.isPlayable(last) && this.progressOf(last.id) > 0;
      resume.classList.toggle('hidden', !hasProgress);
      if (hasProgress) resume.textContent = `Continuar · Clase ${last.number}: ${last.title} →`;
    }

    const playable = LESSONS_DATA.filter(l => this.isPlayable(l)).length;
    map.innerHTML = `
      <div class="mb-5 flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
        <span class="px-2.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-300">Ruta completa · ${playable} clases</span>
        <span class="px-2.5 py-1 rounded-full border border-slate-700 bg-slate-900">12 clases · 5 niveles</span>
        <span class="px-2.5 py-1 rounded-full border border-slate-700 bg-slate-900">5 pasos por clase · avance guiado</span>
      </div>
      ${MODULES.map(mod => {
        const lessons = LESSONS_DATA.filter(l => l.module === mod.id);
        return `
          <section class="acad-module mb-4">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div class="flex items-center gap-2">
                <span class="acad-module-num">0${mod.id}</span>
                <h3 class="text-sm font-extrabold text-white">${mod.name}</h3>
                <span class="text-[11px] text-slate-500 hidden sm:inline">${mod.subtitle}</span>
              </div>
              <span class="text-[10px] font-mono text-slate-500">${lessons.length} CLASES</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
              ${lessons.map(l => {
                const ready = this.isPlayable(l);
                const done = this.progressOf(l.id);
                const dots = [0, 1, 2, 3, 4].map(i => `<i class="acad-map-dot ${i < done ? 'is-done' : ''}"></i>`).join('');
                const status = !ready ? 'EN PREPARACIÓN' : done === 5 ? 'COMPLETA' : done ? `${done}/5` : 'EMPEZAR';
                const click = ready ? `onclick="academia.openLesson('${l.id}')"` : '';
                return `
                  <button ${click} ${ready ? '' : 'disabled'} class="acad-lesson-card ${ready ? '' : 'is-locked'}">
                    <div class="mb-2">
                      <span class="acad-lesson-num">CLASE ${String(l.number).padStart(2, '0')}</span>
                    </div>
                    <h4 class="text-left text-sm font-bold text-white leading-snug">${l.title}</h4>
                    <p class="text-left text-[11px] text-slate-400 mt-1 leading-snug">${l.subtitle}</p>
                    <div class="flex items-center justify-between gap-2 mt-3">
                      <div class="flex gap-1">${dots}</div>
                      <span class="text-[10px] font-mono ${ready ? 'text-emerald-300' : 'text-slate-600'}">${status}</span>
                    </div>
                  </button>
                `;
              }).join('')}
            </div>
          </section>
        `;
      }).join('')}
    `;
  },

  /* ---------------- Navegación de clase ---------------- */
  openLesson(id) {
    const lesson = LESSONS_DATA.find(l => l.id === id);
    if (!lesson || !this.isPlayable(lesson)) return;
    SoundFX.playSelect();
    this.activeLessonId = id;
    this.activeStepIndex = Math.min(this.progressOf(id), 5);
    this.lastAnswer = null;
    appState.academia.v2.view = 'lesson';
    this.persist();
    this.render();
  },

  closeLesson() {
    SoundFX.playClick();
    appState.academia.v2.view = 'map';
    this.persist();
    this.render();
  },

  resume() {
    const lesson = LESSONS_DATA.find(l => l.id === appState.academia.v2.activeLessonId);
    this.openLesson(lesson && this.isPlayable(lesson) ? lesson.id : 'ranking');
  },

  goStep(index) {
    const lesson = this.currentLesson();
    const target = Number(index);
    if (!Number.isInteger(target) || target < 0 || target > 5) return;
    if (target > this.progressOf(lesson.id)) return;
    SoundFX.playClick();
    this.activeStepIndex = target;
    this.lastAnswer = null;
    this.persist();
    this.renderLesson();
  },

  next() {
    const lesson = this.currentLesson();
    if (this.activeStepIndex < 5) this.goStep(this.activeStepIndex + 1);
    else this.closeLesson();
  },

  prev() {
    if (this.activeStepIndex > 0) this.goStep(this.activeStepIndex - 1);
  },

  acknowledge() {
    const lesson = this.currentLesson();
    const step = this.currentStep();
    if (!step || step.kind !== 'exhibit') return;
    const progress = this.progressOf(lesson.id);
    if (progress < 5 && this.activeStepIndex === progress) this.completeStep(lesson, true);
    this.next();
  },

  answer(key) {
    const lesson = this.currentLesson();
    const step = this.currentStep();
    if (!step) return;
    if (step.kind === 'duel') return this.answerDuel(key);
    if (!step.options) return;
    const opt = step.options.find(o => o.key === key);
    if (!opt) return;
    this.lastAnswer = { lessonId: lesson.id, stepIndex: this.activeStepIndex, option: opt };
    if (opt.correct) this.completeStep(lesson, false);
    else SoundFX.playLessonWrong();
    this.renderLesson();
  },

  answerDuel(key) {
    const lesson = this.currentLesson();
    const step = this.currentStep();
    if (!step || step.kind !== 'duel' || (key !== 'A' && key !== 'B')) return;
    const opt = {
      key,
      label: key === 'A' ? 'Mano A' : 'Mano B',
      correct: key === step.winner,
      feedback: step.why
    };
    this.lastAnswer = { lessonId: lesson.id, stepIndex: this.activeStepIndex, option: opt };
    if (opt.correct) this.completeStep(lesson, false);
    else SoundFX.playLessonWrong();
    this.renderLesson();
  },

  completeStep(lesson, silent) {
    const progress = this.progressOf(lesson.id);
    if (progress < 5 && this.activeStepIndex >= progress) {
      appState.academia.v2.stepProgress[lesson.id] = Math.min(5, this.activeStepIndex + 1);
      if (this.activeStepIndex + 1 >= 5 && !appState.academia.completedIds.includes(lesson.id)) {
        appState.academia.completedIds.push(lesson.id);
        showToast('Clase completada · ruta desbloqueada', 'success');
      }
      saveState();
    }
    if (!silent) SoundFX.playLessonCorrect();
    else SoundFX.playClick();
  },

  nextPlayableLesson() {
    const idx = LESSONS_DATA.findIndex(l => l.id === this.activeLessonId);
    for (let i = idx + 1; i < LESSONS_DATA.length; i++) {
      if (this.isPlayable(LESSONS_DATA[i])) return LESSONS_DATA[i];
    }
    return null;
  },

  /* ---------------- Render de la clase ---------------- */
  renderLesson() {
    const shell = document.getElementById('academia-workspace');
    if (!shell) return;
    const lesson = this.currentLesson();
    const mod = MODULES[lesson.module];
    const index = this.activeStepIndex;
    const progress = this.progressOf(lesson.id);
    const solved = index < progress;

    const dots = [0, 1, 2, 3, 4].map(i => {
      const state = i < progress ? 'done' : i === index ? 'active' : 'todo';
      const click = i <= progress ? `onclick="academia.goStep(${i})"` : 'disabled';
      return `<button ${click} class="acad-step-dot" data-state="${state}" title="Paso ${i + 1}">${i + 1}</button>`;
    }).join('');

    const head = `
      <div class="acad-shell-head">
        <button onclick="academia.closeLesson()" class="acad-back">← Ruta</button>
        <div class="min-w-0 flex-1 text-center">
          <div class="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Nivel 0${mod.id} · ${mod.name}</div>
          <div class="text-sm sm:text-base font-extrabold text-white truncate">Clase ${lesson.number} · ${lesson.title}</div>
        </div>
        <div class="flex flex-col items-end gap-1">
          <span class="text-[10px] font-mono text-slate-400">${index === 5 ? 'RESUMEN' : `PASO ${index + 1} / 5`}</span>
          <div class="flex gap-1">${dots}</div>
        </div>
      </div>
    `;

    let body;
    let footNext = '';
    if (index === 5) {
      body = this.renderSummary(lesson);
      footNext = `<button onclick="academia.closeLesson()" class="acad-next">Volver a la ruta →</button>`;
    } else {
      const step = lesson.steps[index];
      body = `
        <div class="acad-step-title">${step.title || step.prompt}</div>
        ${step.kind === 'exhibit' ? this.renderExhibit(step, solved) : ''}
        ${step.kind === 'duel' ? this.renderDuel(step, solved) : ''}
        ${step.kind === 'case' ? this.renderCase(step, solved) : ''}
      `;
      if (solved) {
        footNext = `<button onclick="academia.next()" class="acad-next">${index === 4 ? 'Ver resumen →' : 'Siguiente paso →'}</button>`;
      } else if (step.kind === 'exhibit') {
        footNext = `<button onclick="academia.acknowledge()" class="acad-next">Entendido →</button>`;
      } else {
        footNext = `<span class="text-[11px] font-mono text-slate-500">Elige una opción ↑</span>`;
      }
    }

    shell.innerHTML = `
      <div class="acad-shell">
        ${head}
        <div class="acad-shell-body">${body}</div>
        <div class="acad-shell-foot">
          <button onclick="academia.prev()" ${index === 0 ? 'disabled' : ''} class="acad-prev">← Anterior</button>
          ${footNext}
        </div>
      </div>
    `;
  },

  renderExhibit(step, solved) {
    const cards = step.showdown
      ? this.renderDuel(step.showdown, solved, true)
      : this.renderFelt(step.table, { revealCount: step.revealCount, showVillain: !step.table.villainHidden });
    return `
      ${cards}
      <div class="acad-lines ${step.showdown ? 'acad-lines--compact' : ''}">
        ${step.lines.map((line, i) => `<p class="acad-line"><span>${i + 1}</span>${line}</p>`).join('')}
      </div>
    `;
  },

  renderDuel(spec, solved = false, embedded = false) {
    const evals = spec.hands.map(h => this.bestFive([...h.cards, ...spec.board]));
    const winnerIndex = spec.winner === 'A' ? 0 : 1;
    const revealed = solved || !!embedded;
    const handHTML = (h, i) => {
      const win = i === winnerIndex;
      return `
        <div class="acad-duel-hand ${revealed && win ? 'is-winner' : ''} ${revealed && !win ? 'is-loser' : ''}">
          <div class="text-[10px] font-mono uppercase tracking-widest ${i === 0 ? 'text-emerald-300' : 'text-amber-300'} mb-1.5">${h.label}</div>
          <div class="acad-duel-cards">${revealed ? evals[i].cards.map(c => this.cardHTML(c)).join('') : h.cards.map(c => this.cardHTML(c)).join('') + '<span class="text-slate-500 text-xs self-center ml-1">+ board</span>'}</div>
          <div class="text-[11px] font-bold mt-2 ${revealed && win ? 'text-emerald-300' : 'text-slate-300'}">${revealed ? evals[i].ev.name : '2 cartas + board'}</div>
          ${revealed && win ? '<div class="text-[10px] font-mono text-emerald-400 mt-1">✓ GANADOR</div>' : ''}
        </div>
      `;
    };
    const answer = this.lastAnswer && this.lastAnswer.stepIndex === this.activeStepIndex ? this.lastAnswer.option : null;
    return `
      <div class="acad-duel ${embedded ? 'acad-duel--embed' : ''}">
        <div class="acad-duel-board">
          <span class="acad-duel-board-label">BOARD · 5 COMUNITARIAS</span>
          <div class="flex flex-wrap justify-center gap-1">${spec.board.map(c => this.cardHTML(c)).join('')}</div>
        </div>
        ${handHTML(spec.hands[0], 0)}
        <div class="acad-duel-vs">VS</div>
        ${handHTML(spec.hands[1], 1)}
      </div>
      ${revealed ? `<div class="acad-why">${spec.why}</div>` : ''}
      ${!embedded && !revealed ? `
        <div class="acad-actions">
          <button onclick="academia.answer('A')" class="acad-action">Elegir Mano A</button>
          <button onclick="academia.answer('B')" class="acad-action">Elegir Mano B</button>
        </div>
      ` : ''}
      ${!embedded && answer ? this.renderFeedback(answer, !!answer.correct) : ''}
    `;
  },

  renderCase(step, solved) {
    const answer = this.lastAnswer && this.lastAnswer.stepIndex === this.activeStepIndex ? this.lastAnswer.option : null;
    const label = { bet: 'Apostar / Subir', raise: 'Apostar / Subir', call: 'Pasar / Pagar', check: 'Pasar / Pagar', fold: 'Retirarse' };
    const order = { bet: 0, raise: 0, call: 1, check: 1, fold: 2 };
    const options = [...step.options].sort((a, b) => (order[a.key] ?? 9) - (order[b.key] ?? 9));
    return `
      ${this.renderFelt(step.table)}
      ${!solved ? `
        <div class="acad-actions">
          ${options.map(opt => `
            <button onclick="academia.answer('${opt.key}')" class="acad-action ${opt.key === 'fold' ? 'acad-action--danger' : opt.key === 'call' ? '' : 'acad-action--primary'}">
              ${label[opt.key] || opt.label}
            </button>
          `).join('')}
        </div>
      ` : ''}
      ${answer ? this.renderFeedback(answer, solved) : ''}
    `;
  },

  renderFelt(table, opts = {}) {
    const reveal = opts.revealCount === undefined ? table.board.length : opts.revealCount;
    const board = table.board || [];
    const slots = [0, 1, 2, 3, 4].map(i => {
      if (i < reveal && board[i]) {
        const street = i < 3 ? 'FLOP' : i === 3 ? 'TURN' : 'RIVER';
        return `<div class="acad-slot"><div class="acad-slot-label">${street}</div>${this.cardHTML(board[i], 'acad-card--reveal')}</div>`;
      }
      return `<div class="acad-slot"><div class="acad-slot-label">${i < 3 ? 'FLOP' : i === 3 ? 'TURN' : 'RIVER'}</div><div class="acad-empty"></div></div>`;
    }).join('');
    const hero = table.hero || [];
    const villain = table.villain || [];
    return `
      <div class="acad-felt">
        <div class="acad-seat acad-seat--villain">
          <div>
            <div class="text-[10px] font-mono uppercase tracking-widest text-slate-400">RIVAL ${table.villainProfile ? `· ${table.villainProfile}` : ''} ${table.villainPos ? `· ${table.villainPos}` : ''}</div>
            <div class="text-[11px] text-amber-300 font-semibold mt-0.5">${table.villainAction || '—'}</div>
          </div>
          <div class="flex gap-1">${opts.showVillain === false || table.villainHidden ? '<div class="acad-card-back"></div><div class="acad-card-back"></div>' : villain.map(c => this.cardHTML(c)).join('')}</div>
        </div>

        <div class="acad-board-wrap">
          <div class="text-center text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 mb-1.5">CARTAS COMUNITARIAS · ${table.street}</div>
          <div class="acad-board">${slots}</div>
          <div class="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span class="acad-chip">BOTE <strong>${table.pot}</strong></span>
            ${table.bet ? `<span class="acad-chip acad-chip--bet">APUESTA <strong>${table.bet}</strong></span>` : ''}
            ${table.outCards ? `<span class="acad-chip acad-chip--out">OUTS <strong>${table.outCards.length}</strong></span>` : ''}
          </div>
        </div>

        <div class="acad-seat acad-seat--hero">
          <div class="flex gap-1">${hero.map(c => this.cardHTML(c)).join('')}</div>
          <div class="text-left">
            <div class="text-[10px] font-mono uppercase tracking-widest text-emerald-300">TÚ ${table.heroPos ? `· ${table.heroPos}` : ''}</div>
            <div class="text-[11px] text-slate-300 mt-0.5">${table.note || 'Tu turno'}</div>
          </div>
        </div>

        ${table.outCards ? `<div class="acad-outs"><span>OUTS MARCADAS · ${table.outCards.length}</span><div class="flex flex-wrap justify-center gap-1">${table.outCards.map(c => this.cardHTML(c, 'acad-card--out')).join('')}</div></div>` : ''}
      </div>
    `;
  },

  renderFeedback(opt, correct) {
    return `
      <div class="acad-feedback ${correct ? 'is-correct' : 'is-wrong'}">
        <strong>${correct ? '✓ Decisión correcta' : '✕ Revisa la decisión'}</strong>
        <p>${opt.feedback}</p>
      </div>
    `;
  },

  renderSummary(lesson) {
    return `
      <div class="acad-summary">
        <div class="text-4xl">🏆</div>
        <h3 class="text-xl font-extrabold text-white">Clase completada</h3>
        <p class="text-sm text-slate-300 max-w-md">${lesson.title} · 5 de 5 pasos resueltos.</p>
        <div class="flex flex-wrap justify-center gap-2 mt-2">
          <button onclick="academia.goStep(0)" class="acad-action">Repasar los 5 pasos</button>
          ${this.nextPlayableLesson() ? `<button onclick="academia.openLesson('${this.nextPlayableLesson().id}')" class="acad-action acad-action--primary">Siguiente clase →</button>` : ''}
        </div>
      </div>
    `;
  }
};
