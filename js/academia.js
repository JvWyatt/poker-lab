/* ============================================================================
   5. MÓDULO: ACADEMIA — RUTA POR PANTALLAS
   Mapa (12 clases / 5 niveles) → vista de clase a pantalla completa →
   pasos fijos por clase (10 en «Las Manos», 5 en el resto). Los formatos
   internos (hand, exhibit, duel, case) sólo organizan el contenido.
   Ruta completa: 12 clases jugables, de cero a estrategia avanzada.
============================================================================ */
const SUIT_SYMBOL = { s: '♠', h: '♥', d: '♦', c: '♣' };
const RED_SUITS = new Set(['h', 'd']);

const MODULES = [
  { id: 0, name: 'Fundamentos', subtitle: 'Las Manos, Board y Showdown', tone: 'sky' },
  { id: 1, name: 'Mesa', subtitle: 'Acciones, posiciones y ciegas', tone: 'emerald' },
  { id: 2, name: 'Números', subtitle: 'Probabilidades y equity', tone: 'amber' },
  { id: 3, name: 'Táctica', subtitle: 'Posición, boards y tamaños', tone: 'orange' },
  { id: 4, name: 'Estrategia', subtitle: 'Faroles, GTO y cierre avanzado', tone: 'purple' }
];

const E = (title, table, lines, revealCount, showdown = null, extra = {}) => ({ kind: 'exhibit', title, table, lines, revealCount, showdown, ...extra });
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

/* Las 10 jugadas oficiales de Texas Hold'em, de menor a mayor fuerza.
   Cada pantalla muestra 5 espacios: sólo las cartas que forman la jugada
   se resaltan y el resto quedan como siluetas vacías. Aquí todavía no hay
   cartas comunitarias: el alumno aprende primero las combinaciones de 5. */
const H = (name, english, cards, desc, prev = null, extra = {}) => ({
  kind: 'hand',
  title: english && english.toLowerCase() !== name.toLowerCase() ? `${name} (${english})` : name,
  name, english, cards, desc, prev, ...extra
});
const HANDS = [
  H('Carta alta', 'High Card', ['As', null, null, null, null],
    'Si ningún jugador forma una combinación, gana quien tiene la carta individual de mayor valor. Si empatan, se comparan los kickers uno por uno.', null),
  H('Par', 'One Pair', ['Js', 'Jh', null, null, null],
    'Dos cartas del mismo valor y tres kickers. Se decide por el valor del par y, si hay empate, por los kickers en orden descendente.', 'Carta alta'),
  H('Doble par', 'Two Pair', ['As', 'Ah', '9d', '9c', null],
    'Dos pares de valores distintos y un kicker. Se comparan el par más alto, luego el segundo par y al final el kicker.', 'Par'),
  H('Trío', 'Three of a Kind / Set', ['Qs', 'Qh', 'Qd', null, null],
    'Tres cartas del mismo valor y dos kickers. Cuando el trío se forma con una carta de la mesa y un par privado se llama set.', 'Doble par'),
  H('Escalera', 'Straight', ['5c', '6d', '7h', '8s', '9c'],
    'Cinco valores consecutivos de palos distintos. El As puede jugar como alta (T-J-Q-K-A) o como baja (A-2-3-4-5).', 'Trío'),
  H('Color', 'Flush', ['Ah', 'Jh', '9h', '6h', '3h'],
    'Cinco cartas del mismo palo sin que tengan que ser consecutivas. Entre dos colores gana el que tenga la carta más alta.', 'Escalera'),
  H('Full House', 'Full House', ['8s', '8h', '8d', 'Kc', 'Ks'],
    'Un trío y un par en la misma mano de cinco cartas. Se decide primero por el valor del trío y después por el del par.', 'Color'),
  H('Póker', 'Four of a Kind', ['7s', '7h', '7d', '7c', null],
    'Cuatro cartas del mismo valor y un kicker. Se decide por el valor de las cuatro cartas; el kicker sólo importa entre pókers iguales.', 'Full House'),
  H('Escalera de color', 'Straight Flush', ['9h', '8h', '7h', '6h', '5h'],
    'Cinco cartas consecutivas del mismo palo. Se decide por la carta más alta de la escalera y sólo la escalera real la supera.', 'Póker'),
  H('Escalera real', 'Royal Flush', ['As', 'Ks', 'Qs', 'Js', 'Ts'],
    'T, J, Q, K y A del mismo palo: la jugada máxima. No puede ser superada; sólo empata contra otra escalera real.', 'Escalera de color', { top: true })
];

/* ---------------------------------------------------------------------------
   CURRÍCULUM: 12 clases, 5 niveles. Clase 1 = 10 jugadas oficiales de menor
   a mayor; clase 2 = Hole Cards y Board; clase 3 = Showdown; después casos
   fijos de acciones, pot odds, outs, equity y GTO.
--------------------------------------------------------------------------- */
const LESSONS_DATA = [
  {
    id: 'ranking', number: 1, module: 0, format: 'hand',
    title: 'Las Manos', subtitle: 'Las 10 jugadas oficiales, una por pantalla, de menor a mayor fuerza',
    steps: HANDS
  },
  {
    id: 'fundamentos', number: 2, module: 0, format: 'exhibit',
    title: 'Cómo se juega una mano',
    subtitle: 'Hole Cards, Board (Flop / Turn / River) y mejor jugada de 5 entre 7',
    steps: [
      E('Hole Cards: 2 cartas privadas',
        { street: 'PREFLOP', board: [], pot: 3, hero: ['As', '7d'], villain: null, villainHidden: true, heroPos: 'BTN', villainPos: 'BB', villainAction: 'Small Blind 1 / Big Blind 2', note: 'Sólo tú ves A♠ 7♦' },
        [
          'En Texas Hold’em cada jugador recibe 2 Hole Cards (cartas privadas) boca abajo: sólo su dueño las ve.',
          'Con A♠ 7♦ tienes una carta alta y un proyecto, pero todavía no puedes formar una jugada de 5 cartas.',
          'Las Hole Cards se combinarán con las 5 cartas comunitarias (Board) que se revelarán sobre la mesa.'
        ], 0),
      E('Flop: 3 cartas comunitarias',
        { street: 'FLOP', board: BASE_BOARD, pot: 40, hero: ['As', '7d'], villain: ['Kh', 'Qc'], villainProfile: 'TAG', villainAction: 'Check', note: 'Board: K♠ Q♦ 7♠ · bote 40' },
        [
          'Tras la ronda de Preflop se revelan las 3 primeras comunitarias: el Flop (K♠ Q♦ 7♠).',
          'El Board es common card: todos los jugadores pueden usarlo para armar su mejor jugada.',
          'Con 2 Hole Cards y 3 cartas del Flop ya hay 5 cartas visibles, pero aún faltan dos comunitarias.'
        ], 3),
      E('Turn: 4ª carta comunitaria',
        { street: 'TURN', board: BASE_BOARD, pot: 80, hero: ['As', '7d'], villain: ['Kh', 'Qc'], villainProfile: 'TAG', villainAction: 'Check', note: 'Turn = 2♣ · 4 cartas en el Board' },
        [
          'La cuarta carta comunitaria es el Turn (2♣) y abre una nueva ronda de apuestas.',
          'La fuerza de tu mano cambia: A♠ 7♦ con el 7♠ del Flop forman un Par de Sietes.',
          'Después del Turn queda una sola carta comunitaria por revelar.'
        ], 4),
      E('River: 5ª comunitaria y mejor mano de 5',
        { street: 'RIVER', board: BASE_BOARD, pot: 140, hero: ['As', '7d'], villain: ['Kh', 'Qc'], villainProfile: 'TAG', villainAction: 'Check', note: 'River = 9♥ · Board completo' },
        [
          'La quinta carta comunitaria es el River (9♥). Ya no se reparten más cartas.',
          'Cada jugador dispone de 7 cartas (2 Hole Cards + 5 del Board), pero debe elegir la mejor jugada posible de 5.',
          'Puedes usar 2 privadas y 3 del Board, 1 privada y 4 del Board, o incluso las 5 del Board si esa es la mejor combinación.'
        ], 5),
      E('Dealer button, ciegas y rondas de apuestas',
        { street: 'PREFLOP', board: [], pot: 3, hero: ['As', '7d'], villain: ['Kh', 'Qc'], villainHidden: true, heroPos: 'BTN', villainPos: 'BB', villainAction: 'Small Blind 1 / Big Blind 2', note: 'Dealer en BTN · SB y BB a la izquierda' },
        [
          'El Dealer button (botón del crupier) gira entre los jugadores: marca quién habla al final en las rondas post-flop.',
          'A su izquierda están la Small Blind (SB, ciega pequeña) y la Big Blind (BB, ciega grande): apuestas forzadas antes del Preflop.',
          'La mano tiene cuatro rondas de apuestas: Preflop, Flop, Turn y River. Si quedan dos jugadores, termina en el Showdown.'
        ], 0)
    ]
  },
  {
    id: 'duelos', number: 3, module: 0, format: 'duel',
    title: 'Showdown: lectura de mesa y comparación',
    subtitle: 'Hero vs Villain · mejor jugada de 5 entre 7 con el mismo Board',
    steps: [
      D('Par de Ases contra par de Reyes', ['Qc', 'Jd', '7s', '2c', '9h'],
        [{ label: 'HERO · BTN', cards: ['As', 'Ad'] }, { label: 'VILLAIN · BB', cards: ['Ks', 'Kd'] }], 'A',
        'El Board no mejora a ninguno: ambos juegan un Par con tres kickers. Gana el par más alto, Ases sobre Reyes; los kickers no se miran cuando el par ya es distinto.'),
      D('El segundo par decide entre dos dobles parejas', ['Ac', 'Ad', '7h', '2c', '9s'],
        [{ label: 'HERO · BTN', cards: ['Qs', 'Qd'] }, { label: 'VILLAIN · BB', cards: ['Ks', 'Kd'] }], 'B',
        'Los dos usan los Ases del Board y forman Doble par. Se comparan el par más alto (Ases, empatado), luego el segundo par: Reyes superan Reinas.'),
      D('Trío (set) contra doble par', ['Ac', 'Ad', '7s', '2c', '9h'],
        [{ label: 'HERO · BTN', cards: ['As', '5d'] }, { label: 'VILLAIN · BB', cards: ['Ks', 'Kd'] }], 'A',
        'El Board trae A♣ A♦. Hero convierte su A♠ en un set (trío de Ases); Villain juega doble par de Ases y Reyes. El trío gana siempre al doble par.'),
      D('Escalera contra trío', ['5c', '6d', '7h', '2c', '9s'],
        [{ label: 'HERO · BTN', cards: ['7s', '7d'] }, { label: 'VILLAIN · BB', cards: ['8s', '4d'] }], 'B',
        'Hero tiene un trío de Sietes. Villain usa 5-6-7 del Board con su 8♠ y 9♠ del Board para formar una Escalera; la escalera supera al trío.'),
      D('Color contra escalera', ['9s', '8s', '2c', '7s', 'Kd'],
        [{ label: 'HERO · BTN', cards: ['As', '3s'] }, { label: 'VILLAIN · BB', cards: ['Tc', 'Jd'] }], 'A',
        'Hero juega A♠ 3♠ con 9♠ 8♠ 7♠ del Board: Color. Villain forma la escalera 7-8-9-T-J. El color está por encima de la escalera en la jerarquía de jugadas.')
    ]
  },
  {
    id: 'acciones', number: 4, module: 1, format: 'case',
    title: 'Acciones y posiciones', subtitle: 'Fold, Check, Call, Bet, Raise, All-in · UTG, MP, CO, BTN, SB, BB',
    steps: [
      K('Fold: par mínimo ante una apuesta grande', flopTable({ board: ['Ks', 'Qd', '7c'], pot: 100, bet: 80, hero: ['3s', '3c'], villain: ['Ah', 'Kd'], heroPos: 'UTG', villainPos: 'BB', villainAction: 'Bet 80', note: 'UTG · Par de 3s · 2 outs · precio 31%' }), [
        O('fold', 'Fold (retirarse)', true, 'Correcto. Desde UTG pagas 80 para un bote final de 260 (31%). Un par de 3s con 2 outs no alcanza ese equity: fold es la acción correcta.'),
        O('call', 'Call (pagar)', false, 'Pagar con el par mínimo y pocos outs contra un rango fuerte es perder fichas de forma repetida.'),
        O('raise', 'Raise (subir)', false, 'Subir con la peor pareja y fuera de posición contra la BB sólo añade pérdidas.')
      ]),
      K('Check: sin apuesta viva en el Flop', flopTable({ board: ['9d', '6c', '2h'], pot: 80, bet: 0, hero: ['Ah', 'Kd'], villain: ['7s', '8s'], heroPos: 'MP', villainPos: 'CO', villainAction: 'Check', note: 'MP · sin apuesta: check es gratis' }), [
        O('check', 'Check (pasar)', true, 'Correcto. Desde MP, si nadie ha apostado no hay nada que pagar: puedes hacer check sin coste y ver el Turn.'),
        O('bet', 'Bet (apostar)', false, 'Podrías farolear, pero con dos sobrecartas sin proyecto claro y actuando antes que CO, check es la acción básica.'),
        O('fold', 'Fold (retirarse)', false, 'Nunca hagas fold cuando no hay apuesta en contra: continuar es gratis.')
      ]),
      K('Call: color projectado con buen precio', flopTable({ board: ['Th', '7h', '3c'], pot: 80, bet: 40, hero: ['Ah', 'Kh'], villain: ['Qd', '9s'], heroPos: 'CO', villainPos: 'BTN', villainAction: 'Bet 40', note: 'CO · 9 outs de color · call 40 para 160' }), [
        O('call', 'Call (pagar)', true, 'Correcto. 40 / (80 + 40 + 40) = 25%. Con 9 outs de color tienes ~35% en el Flop: el call es rentable y juegas con posición sobre BTN.'),
        O('raise', 'Raise (subir)', false, 'Subir con sobrecartas sin completar no mejora tu precio y te deja sin posición frente al BTN.'),
        O('fold', 'Fold (retirarse)', false, 'Tienes equity suficiente y buen precio: foldear es descartar una decisión +EV.')
      ]),
      K('Bet / Raise por valor con top pair', flopTable({ board: ['Ks', '7d', '2c'], pot: 60, bet: 0, hero: ['Kh', 'Qd'], villain: ['9h', '8h'], heroPos: 'BTN', villainPos: 'BB', villainAction: 'Check', note: 'BTN · top pair · board seco · bote 60' }), [
        O('bet', 'Bet / Raise (apostar o subir)', true, 'Correcto. Desde BTN, apostar por valor cobra de manos peores y de proyectos. Si la BB sube, puedes raise de nuevo con tu top pair.'),
        O('check', 'Check (pasar)', false, 'Pasar en posición con top pair es demasiado pasivo: renuncias a valor con una mano que probablemente va por delante.'),
        O('fold', 'Fold (retirarse)', false, 'No hay apuesta en contra y tienes una mano fuerte: foldear sería regalar el bote.')
      ]),
      K('All-in con set y SPR bajo', flopTable({ board: ['8c', '4d', 'Js'], pot: 100, bet: 60, hero: ['8h', '8d'], villain: ['Kh', 'Qh'], heroPos: 'SB', villainPos: 'BB', villainAction: 'Bet 60', note: 'SB · set de 8s · SPR 0,5 · pila 60' }), [
        O('allin', 'All-in (toda la pila)', true, 'Correcto. Desde SB tu set es muy fuerte y el SPR es 0,5: mover toda la pila cobra valor máximo y niega precios a los proyectos.'),
        O('call', 'Call (pagar)', false, 'Pagar deja valor sobre la mesa: con SPR tan bajo, el all-in es mejor que llamar.'),
        O('fold', 'Fold (retirarse)', false, 'Un set en el Flop nunca se foldea a una apuesta de este tamaño.')
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
    title: 'Semi-bluff con bloqueadores', subtitle: 'Equity real, Fold equity y bloqueos',
    steps: [
      K('Color projectado: dos formas de ganar', flopTable({ board: ['9h', '8h', '2c'], pot: 100, bet: 0, hero: ['Ah', '5h'], villain: ['7s', '6s'], villainAction: 'Pasa (Check)', outCards: HEART_OUTS, note: '9 outs + fold equity · bote 100' }), [
        O('bet', 'Apostar / Subir', true, 'Correcto. Es un Semi-bluff: puedes ganar ahora si el rival hace Fold, o completar tu color en el Turn. Con 9 outs tienes equity real aunque te paguen.'),
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
    id: 'cierre', number: 12, module: 4, format: 'case',
    title: 'Value Bet, Bluff y equilibrio GTO',
    subtitle: 'Cierre avanzado: equity, apuestas por valor, faroles y rangos equilibrados',
    steps: [
      K('Value Bet fina en el River', riverTable({ board: ['Ks', '7d', '2c', '4h', '9s'], pot: 100, bet: 0, hero: ['Kh', '9d'], villain: ['Qd', 'Qc'], villainProfile: 'Calling Station', villainAction: 'Check', note: 'Doble par K-9 · Station paga con pares menores' }), [
        O('bet', 'Bet (apostar por valor)', true, 'Correcto. Es un Value Bet: tu doble par gana de Reinas y de otros pares menores. Apuesta un tamaño que esas manos puedan pagar.'),
        O('check', 'Check (pasar)', false, 'Hacer check con una mano que gana de tantas peores renuncia a valor. El Value Bet existe para cobrar.'),
        O('allin', 'All-in (toda la pila)', false, 'El all-in sólo expulsa a las manos peores y recibe pago de las que te superan: destruye el valor de tu apuesta.')
      ]),
      K('Bluff con bloqueador de As en el River', riverTable({ board: ['9h', '8h', '2c', '4d', 'Kd'], pot: 100, bet: 0, hero: ['Ah', '5s'], villain: ['7s', '6s'], villainProfile: 'Weak-Tight', villainAction: 'Check', note: 'Color fallido · A♠ bloquea combinaciones de color' }), [
        O('bet', 'Bet (farol con bloqueador)', true, 'Correcto. Es un Bluff (farol): tu A♠ quita combinaciones fuertes del rango rival y el Weak-Tight foldea pares medianos. Tu mano no tiene valor de showdown, pero tiene foldeos.'),
        O('check', 'Check (pasar)', false, 'Con un farol bien bloqueado y un rival que foldea, pasar deja escapar la oportunidad de ganar el bote sin showdown.'),
        O('fold', 'Fold (retirarse)', false, 'No hay apuesta en contra: foldear sería regalar el bote cuando puedes presionar.')
      ]),
      K('Semi-bluff con color projectado', flopTable({ board: ['Th', '7h', '3c'], pot: 80, bet: 0, hero: ['Ah', 'Kh'], villain: ['Qd', '9s'], villainProfile: 'TAG', villainAction: 'Check', note: '9 outs de color + fold equity · semi-bluff' }), [
        O('raise', 'Raise (semi-bluff)', true, 'Correcto. Es un Semi-bluff: ganas ahora si el rival hace fold o completas tu color con 9 outs. Tienes equity real aunque te paguen.'),
        O('call', 'Call (pagar)', false, 'No hay apuesta que pagar: pasar renuncia a la fold equity que hace rentable el semi-bluff.'),
        O('fold', 'Fold (retirarse)', false, 'Con sobrecartas, 9 outs y buen precio, foldear es desperdiciar dos formas de ganar.')
      ]),
      K('GTO: mano de showdown media en el River', riverTable({ board: ['As', '7d', '2c', '4h', '9s'], pot: 100, bet: 0, hero: ['Ad', 'Td'], villain: ['Kd', 'Qd'], villainProfile: 'TAG', villainAction: 'Check', note: 'Par de Ases con kicker débil · rango polarizado del rival' }), [
        O('check', 'Check (pasar)', true, 'Correcto. En una aproximación GTO, las manos medias de showdown hacen check: apostar sólo recibe pago de manos mejores. El equilibrio apuesta con manos polarizadas (muy fuertes y faroles con bloqueadores).'),
        O('bet', 'Bet (apostar)', false, 'Apostar una mano media con kicker débil no es equilibrado: te pagan las manos que te ganan y foldean las peores.'),
        O('fold', 'Fold (retirarse)', false, 'No hay apuesta en contra: con par de Ases, foldear no tiene sentido.')
      ]),
      K('Integración final: Pot Odds y Outs en el Turn', turnTable({ board: ['9h', '8h', '2c', '4d'], pot: 100, bet: 80, hero: ['Ah', '5h'], villain: ['Kd', 'Qd'], villainAction: 'Bet 80', outCards: HEART_OUTS, note: '9 outs ≈ 18% · pagas 80 para 260 (31%)' }), [
        O('fold', 'Fold (retirarse)', true, 'Correcto. Pot odds: 80 / (100 + 80 + 80) = 31%. Con una carta por venir, 9 outs de color valen ~18% de equity, muy por debajo del precio: la decisión correcta es fold.'),
        O('call', 'Call (pagar)', false, 'El proyecto es atractivo, pero el precio no: 18% de equity no cubre 31% de pot odds.'),
        O('allin', 'All-in (toda la pila)', false, 'Mover toda la pila con un color sin completar y pocas cartas muertas no aporta fold equity suficiente.')
      ])
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
    const lesson = stored && this.isPlayable(stored) ? stored : LESSONS_DATA[0];
    this.activeLessonId = lesson.id;
    this.activeStepIndex = Math.max(0, Math.min(this.stepCount(lesson), Number(v2.activeStepIndex) || 0));
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
    academiaFullscreen.registerListeners();
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

  stepCount(lesson) {
    return Array.isArray(lesson?.steps) ? lesson.steps.length : 0;
  },

  isPlayable(lesson) {
    return this.stepCount(lesson) > 0;
  },

  progressOf(lessonId) {
    const lesson = LESSONS_DATA.find(l => l.id === lessonId);
    if (!lesson) return 0;
    const count = this.stepCount(lesson);
    if (appState.academia.completedIds.includes(lessonId)) return count;
    const value = Number(appState.academia.v2.stepProgress[lessonId]) || 0;
    return Math.max(0, Math.min(count, Math.floor(value)));
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
    academiaFullscreen.updateInfo();
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
        <span class="px-2.5 py-1 rounded-full border border-slate-700 bg-slate-900">10 pasos en Las Manos · 5 en el resto</span>
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
                const count = this.stepCount(l);
                const done = this.progressOf(l.id);
                const dots = Array.from({ length: count }, (_, i) => `<i class="acad-map-dot ${i < done ? 'is-done' : ''}"></i>`).join('');
                const status = !ready ? 'EN PREPARACIÓN' : done === count ? 'COMPLETA' : done ? `${done}/${count}` : 'EMPEZAR';
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
    this.activeStepIndex = Math.min(this.progressOf(id), this.stepCount(lesson));
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
    if (!Number.isInteger(target) || target < 0 || target > this.stepCount(lesson)) return;
    if (target > this.progressOf(lesson.id)) return;
    SoundFX.playClick();
    this.activeStepIndex = target;
    this.lastAnswer = null;
    this.persist();
    this.renderLesson();
  },

  next() {
    const lesson = this.currentLesson();
    if (this.activeStepIndex < this.stepCount(lesson)) this.goStep(this.activeStepIndex + 1);
    else this.closeLesson();
  },

  prev() {
    if (this.activeStepIndex > 0) this.goStep(this.activeStepIndex - 1);
  },

  acknowledge() {
    const lesson = this.currentLesson();
    const step = this.currentStep();
    if (!step || (step.kind !== 'exhibit' && step.kind !== 'hand')) return;
    const progress = this.progressOf(lesson.id);
    if (progress < this.stepCount(lesson) && this.activeStepIndex === progress) this.completeStep(lesson, true);
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
      label: key === 'A' ? 'Hero' : 'Villain',
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
    const count = this.stepCount(lesson);
    if (progress < count && this.activeStepIndex >= progress) {
      appState.academia.v2.stepProgress[lesson.id] = Math.min(count, this.activeStepIndex + 1);
      if (this.activeStepIndex + 1 >= count && !appState.academia.completedIds.includes(lesson.id)) {
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
    const count = this.stepCount(lesson);
    const progress = this.progressOf(lesson.id);
    const solved = index < progress;

    const dots = Array.from({ length: count }, (_, i) => {
      const state = i < progress ? 'done' : i === index ? 'active' : 'todo';
      const click = i <= progress ? `onclick="academia.goStep(${i})"` : 'disabled';
      return `<button ${click} class="acad-step-dot" data-state="${state}" title="Paso ${i + 1}">${i + 1}</button>`;
    }).join('');

    const head = `
      <div class="acad-shell-head">
        <div class="flex items-center gap-1">
          <button onclick="academia.closeLesson()" class="acad-back">← Ruta</button>
          <button class="acad-fs-btn js-acad-fullscreen-btn" data-compact="true" onclick="academiaFullscreen.toggle()" title="Entrar en pantalla completa" aria-label="Entrar en pantalla completa">⛶</button>
        </div>
        <div class="min-w-0 flex-1 text-center">
          <div class="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Nivel 0${mod.id} · ${mod.name}</div>
          <div class="text-sm sm:text-base font-extrabold text-white truncate">Clase ${lesson.number} · ${lesson.title}</div>
        </div>
        <div class="flex flex-col items-end gap-1">
          <span class="text-[10px] font-mono text-slate-400">${index === count ? 'RESUMEN' : `PASO ${index + 1} / ${count}`}</span>
          <div class="acad-step-dots ${count > 5 ? 'is-long' : ''}">${dots}</div>
        </div>
      </div>
    `;

    let body;
    let footNext = '';
    if (index === count) {
      body = this.renderSummary(lesson);
      footNext = `<button onclick="academia.closeLesson()" class="acad-next">Volver a la ruta →</button>`;
    } else {
      const step = lesson.steps[index];
      body = `
        <div class="acad-step-title">${step.title || step.prompt}</div>
        ${step.kind === 'hand' ? this.renderHand(step) : ''}
        ${step.kind === 'exhibit' ? this.renderExhibit(step, solved) : ''}
        ${step.kind === 'duel' ? this.renderDuel(step, solved) : ''}
        ${step.kind === 'case' ? this.renderCase(step, solved) : ''}
      `;
      if (solved) {
        footNext = `<button onclick="academia.next()" class="acad-next">${index === count - 1 ? 'Ver resumen →' : 'Siguiente paso →'}</button>`;
      } else if (step.kind === 'exhibit' || step.kind === 'hand') {
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
    academiaFullscreen.updateInfo();
  },

  /* Cada jugada se muestra con sus 5 espacios: sólo las cartas que forman la
     jugada aparecen resaltadas, el resto son siluetas vacías. */
  renderHand(step) {
    const slots = step.cards.map((code, i) => `
      <div class="acad-hand-slot">
        <span class="acad-hand-slot-label">${i + 1}</span>
        ${code ? this.cardHTML(code, 'acad-card--spotlight') : '<div class="acad-empty acad-empty--slot" aria-hidden="true"></div>'}
      </div>
    `).join('');
    const gain = step.top
      ? 'Es la jugada máxima: le gana a todas las demás; sólo empata contra otra Escalera real.'
      : step.prev
        ? `Le gana a <strong>${step.prev}</strong>: está un escalón por encima en la jerarquía oficial.`
        : 'Es el escalón más bajo de la jerarquía: cualquier combinación la supera.';
    return `
      <div class="acad-hand">
        <div class="acad-board-wrap">
          <div class="text-center text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400 mb-2">5 ESPACIOS · SÓLO CARTAS RELEVANTES</div>
          <div class="acad-hand-slots">${slots}</div>
          <div class="acad-hand-legend">
            <span><i class="acad-hand-key acad-hand-key--card"></i> Carta que forma la jugada</span>
            <span><i class="acad-hand-key"></i> Espacio vacío (sin valor)</span>
          </div>
        </div>
        <div class="acad-lines acad-lines--compact">
          <p class="acad-line"><span>01</span>${step.desc}</p>
          <p class="acad-line acad-line--gain"><span>02</span>${gain}</p>
          <p class="acad-line"><span>03</span>Aquí no hay cartas comunitarias: son 5 cartas sueltas, sin Board. El Board llega en la clase 2.</p>
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
      ${revealed ? `<div class="acad-why">${spec.why}<br><strong>El bote (Pot) se lo lleva ${spec.hands[winnerIndex].label}.</strong></div>` : ''}
      ${!embedded && !revealed ? `
        <div class="acad-actions">
          <button onclick="academia.answer('A')" class="acad-action">Elegir Hero</button>
          <button onclick="academia.answer('B')" class="acad-action">Elegir Villain</button>
        </div>
      ` : ''}
      ${!embedded && answer ? this.renderFeedback(answer, !!answer.correct) : ''}
    `;
  },

  renderCase(step, solved) {
    const answer = this.lastAnswer && this.lastAnswer.stepIndex === this.activeStepIndex ? this.lastAnswer.option : null;
    const label = {
      bet: 'Bet (apostar)', raise: 'Raise (subir)', call: 'Call (pagar)',
      check: 'Check (pasar)', fold: 'Fold (retirarse)', allin: 'All-in (toda la pila)'
    };
    const order = { bet: 0, raise: 0, call: 1, check: 1, fold: 2, allin: 3 };
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
    const count = this.stepCount(lesson);
    return `
      <div class="acad-summary">
        <div class="text-4xl">🏆</div>
        <h3 class="text-xl font-extrabold text-white">Clase completada</h3>
        <p class="text-sm text-slate-300 max-w-md">${lesson.title} · ${count} de ${count} pasos resueltos.</p>
        <div class="flex flex-wrap justify-center gap-2 mt-2">
          <button onclick="academia.goStep(0)" class="acad-action">Repasar los ${count} pasos</button>
          ${this.nextPlayableLesson() ? `<button onclick="academia.openLesson('${this.nextPlayableLesson().id}')" class="acad-action acad-action--primary">Siguiente clase →</button>` : ''}
        </div>
      </div>
    `;
  }
};

/* ============================================================================
   ACADEMIA A PANTALLA COMPLETA (NATIVE FULLSCREEN + FALLBACK CSS)
   Igual patrón que Arena, pero sobre #view-academia: sirve en el mapa y en
   la clase. El pie con «Siguiente» queda siempre por encima de las capas.
============================================================================ */
const academiaFullscreen = {
  nativeActive: false,
  savedOverflow: '',

  element() {
    return document.getElementById('view-academia');
  },

  get isActive() {
    const el = this.element();
    return !!el && el.classList.contains('is-acad-full');
  },

  registerListeners() {
    document.addEventListener?.('fullscreenchange', () => academiaFullscreen.onFullscreenChange());
    document.addEventListener?.('fullscreenerror', () => academiaFullscreen.onFullscreenChange());
    document.addEventListener?.('keydown', event => {
      if (event.key === 'Escape' && academiaFullscreen.isActive && !document.fullscreenElement) {
        academiaFullscreen.exit();
      }
    });
  },

  enter() {
    const el = this.element();
    if (!el) return;

    this.savedOverflow = document.body.style.overflow;
    el.classList.add('is-acad-full');
    document.body.style.overflow = 'hidden';

    if (el.requestFullscreen && document.fullscreenElement !== el) {
      try {
        const request = el.requestFullscreen();
        if (request && typeof request.catch === 'function') request.catch(() => {});
      } catch (e) {
        /* fallback: la clase is-acad-full mantiene la academia a pantalla completa */
      }
    }

    SoundFX.playClick();
    this.updateInfo();
  },

  exit() {
    const el = this.element();
    if (!el) return;

    if (document.fullscreenElement === el) {
      try {
        const request = document.exitFullscreen();
        if (request && typeof request.catch === 'function') request.catch(() => {});
      } catch (e) {
        /* nothing else to do */
      }
    }

    this.nativeActive = false;
    el.classList.remove('is-acad-full');
    document.body.style.overflow = this.savedOverflow || '';
    SoundFX.playToggle(false);
    this.updateInfo();
  },

  toggle() {
    if (this.isActive) this.exit();
    else this.enter();
  },

  updateInfo() {
    const active = this.isActive;
    document.querySelectorAll('.js-acad-fullscreen-btn').forEach(btn => {
      const compact = btn.dataset.compact === 'true';
      btn.classList.toggle('is-active', active);
      btn.textContent = active ? '✕' : (compact ? '⛶' : '⛶ Pantalla Completa');
      const title = active ? 'Salir de pantalla completa' : 'Entrar en pantalla completa';
      btn.title = title;
      btn.setAttribute('aria-label', title);
    });
    if (document.body?.classList) document.body.classList.toggle('is-acad-full-open', active);
  },

  onFullscreenChange() {
    const el = this.element();
    if (!el) return;

    if (document.fullscreenElement === el) {
      this.nativeActive = true;
      el.classList.add('is-acad-full');
      document.body.style.overflow = 'hidden';
      this.updateInfo();
    } else if (this.nativeActive) {
      // El usuario pulsó Esc: sincronizamos el estado con el navegador.
      this.nativeActive = false;
      el.classList.remove('is-acad-full');
      document.body.style.overflow = this.savedOverflow || '';
      this.updateInfo();
    }
  }
};
