/* ============================================================================
   5. MÓDULO: ACADEMIA (12 CLASES × 5 CASOS PRECONFIGURADOS)
   Cada caso es una mini-mesa determinista: cartas, board, bote y acción del
   rival fijos. El alumno decide con botones reales de póker, recibe feedback
   inmediato sobre el tapete y avanza sólo al acertar. El avance por caso se
   guarda en appState.academia.caseProgress.
============================================================================ */
const SUIT_SYMBOL = { s: '♠', h: '♥', d: '♦', c: '♣' };
const RED_SUITS = new Set(['h', 'd']);

const O = (key, label, correct, feedback) => ({ key, label, correct, feedback });
const C = (prompt, table, options) => ({ prompt, table, options });

const preflopTable = (over = {}) => ({
  street: 'PREFLOP',
  board: [],
  pot: 3,
  bet: 0,
  seats: ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'],
  heroPos: 'BTN',
  villainPos: 'BB',
  villainAction: 'BB pone 2',
  ...over
});

const flopTable = (over = {}) => ({
  street: 'FLOP',
  pot: 100,
  bet: 0,
  heroPos: 'BTN',
  villainPos: 'BB',
  villainAction: 'Pasa (Check)',
  ...over
});

const turnTable = (over = {}) => flopTable({ street: 'TURN', ...over });
const riverTable = (over = {}) => flopTable({ street: 'RIVER', ...over });

const compareTable = (board, hands, pot = 120) => ({
  compare: true,
  street: 'SHOWDOWN',
  board,
  pot,
  hands
});

const HEART_OUTS = ['2h', '3h', '4h', '6h', '7h', 'Th', 'Jh', 'Qh', 'Kh'];
const STRAIGHT_8_OUTS = ['5s', '5h', '5d', '5c', 'Ts', 'Th', 'Td', 'Tc'];
const GUTSHOT_4_OUTS = ['5s', '5h', '5d', '5c'];
const MISSING_FLUSH_BOARD = ['9s', '8s', '2c', '7s', 'Td'];

const LESSONS_DATA = [
  {
    id: 'hand_hierarchy',
    level: 'Iniciación',
    title: 'Cómo se gana: jerarquía de manos',
    summary: 'Cinco comparaciones: par, dos pares, trío, escalera y color.',
    guide: [
      'Compara primero el tipo de mano y sólo después el ranking del par o de la carta alta.',
      'Los cinco casos suben un escalón: pareja → doble pareja → trío → escalera → color.',
      'Pulsa la mano ganadora: el tapete muestra el nombre exacto que devuelve el evaluador.'
    ],
    cases: [
      C('Caso 1 · ¿Quién gana con par de Ases frente a par de Reyes?',
        compareTable(['Qc', 'Jd', '7s', '2c', '9h'], [
          { label: 'MANO A', cards: ['As', 'Ad'] },
          { label: 'MANO B', cards: ['Ks', 'Kd'] }
        ]),
        [
          O('A', 'Gana la Mano A (A♠ A♦)', true, 'Correcto: par de Ases vs par de Reyes. El tipo de mano manda; el par más alto gana antes de mirar kickers.'),
          O('B', 'Gana la Mano B (K♠ K♦)', false, 'No: dos Reyes no superan dos Ases. El tipo de mano manda y el par más alto gana antes de mirar los kickers.')
        ]),
      C('Caso 2 · Doble pareja contra pareja simple',
        compareTable(['Ac', 'Ad', '7h', '2c', '9s'], [
          { label: 'MANO A', cards: ['Ks', 'Kd'] },
          { label: 'MANO B', cards: ['Qs', 'Qd'] }
        ]),
        [
          O('A', 'Gana la Mano A (A♠ A♦ en el board + K♠ K♦)', true, 'Correcto: el board trae dos Ases. La Mano A forma Aces y Reyes; la B sólo Aces y Reinas.'),
          O('B', 'Gana la Mano B (A♠ A♦ en el board + Q♠ Q♦)', false, 'Las dos manos usan el par de Ases del board: gana el segundo par, que es K♠ K♦.')
        ]),
      C('Caso 3 · Trío contra doble pareja',
        compareTable(['Ac', '5d', '2h', '9c', '3s'], [
          { label: 'MANO A', cards: ['As', 'Ad'] },
          { label: 'MANO B', cards: ['7s', '7d'] }
        ]),
        [
          O('A', 'Gana la Mano A (trío de Ases)', true, 'Correcto: Ases en la mano + el As del board = trío. El trío supera siempre a dos pares.'),
          O('B', 'Gana la Mano B (Aces y 7s)', false, 'La Mano B tiene dos pares (Ases del board y 7s), pero tres cartas iguales valen más que dos pares.')
        ]),
      C('Caso 4 · Escalera contra trío',
        compareTable(['5c', '6d', '7h', '2c', '9s'], [
          { label: 'MANO A', cards: ['8s', '4d'] },
          { label: 'MANO B', cards: ['7s', '7d'] }
        ]),
        [
          O('A', 'Gana la Mano A (escalera 4-5-6-7-8)', true, 'Correcto: 4-5-6-7-8 es escalera. Una escalera supera al trío, aunque el trío sean Reyes.'),
          O('B', 'Gana la Mano B (trío de 7s)', false, 'Tienes tres 7s, pero el evaluador coloca la escalera por encima del trío en la jerarquía.')
        ]),
      C('Caso 5 · Color contra escalera',
        compareTable(['9s', '8s', '2c', '7s', 'Kd'], [
          { label: 'MANO A', cards: ['As', '3s'] },
          { label: 'MANO B', cards: ['Tc', 'Jd'] }
        ]),
        [
          O('A', 'Gana la Mano A (color de espadas)', true, 'Correcto: A♠ 3♠ + 9♠ 8♠ 7♠ forman color. El color gana a cualquier escalera.'),
          O('B', 'Gana la Mano B (escalera 7-8-9-T-J)', false, 'La Mano B liga escalera, pero el color de espadas está un escalón por encima.')
        ])
    ],
    principle: 'Orden: carta alta → pareja → doble pareja → trío → escalera → color → full → póker → escalera de color → escalera real.'
  },

  {
    id: 'table_positions',
    level: 'Iniciación',
    title: 'Mesa, posiciones y ciegas',
    summary: 'BTN, SB, BB y UTG: quién pone ciegas y quién habla primero en cada calle.',
    guide: [
      'El botón marca la posición más favorable y se mueve un asiento cada mano.',
      'Preflop habla primero UTG y último BB; postflop habla primero SB y último BTN.',
      'Los cinco casos fijan esos órdenes para que no haya duda.'
    ],
    cases: [
      C('Caso 1 · ¿Quién habla primero preflop?',
        preflopTable({ heroPos: 'UTG', villainPos: 'BB', hero: ['7h', '2c'], villain: ['Ah', 'Kd'], note: '6 jugadores · turno preflop' }),
        [
          O('utg', 'UTG habla primero', true, 'Sí. Después de que SB y BB pongan sus ciegas, UTG es el primer jugador a la izquierda de la BB.'),
          O('btn', 'BTN habla primero', false, 'El BTN habla tarde preflop, no primero. Preflop el orden empieza en UTG.'),
          O('sb', 'SB habla primero', false, 'La SB pone 1, pero preflop habla después de UTG, MP, CO y BTN.')
        ]),
      C('Caso 2 · ¿Quién habla último preflop?',
        preflopTable({ heroPos: 'UTG', villainPos: 'BB', hero: ['7h', '2c'], villain: ['Ah', 'Kd'], note: '6 jugadores · turno preflop' }),
        [
          O('bb', 'La BB habla último', true, 'Correcto. La BB tiene la opción al final preflop: puede subir si nadie lo hizo o pagar si alguien abrió.'),
          O('btn', 'El BTN habla último', false, 'El BTN habla último POSTFLOP. Preflop lo hace antes que SB y BB.'),
          O('sb', 'La SB habla último', false, 'La SB habla justo antes de la BB, no al final.')
        ]),
      C('Caso 3 · ¿Quiénes ponen las ciegas?',
        preflopTable({ heroPos: 'SB', villainPos: 'BB', hero: ['7h', '2c'], villain: ['Ah', 'Kd'], note: 'BTN a la derecha de SB y BB' }),
        [
          O('sb_bb', 'SB pone 1 y BB pone 2', true, 'Correcto. SB y BB están a la izquierda del BTN y ponen 1 y 2 fichas respectivamente.'),
          O('btn_sb', 'BTN pone 1 y SB pone 2', false, 'El BTN no pone ciega. Las ciegas son SB y BB.'),
          O('utg_bb', 'UTG pone 1 y BB pone 2', false, 'UTG no pone ciega: es el primero que habla después de las ciegas.')
        ]),
      C('Caso 4 · ¿Quién habla primero postflop?',
        flopTable({ board: ['Ks', '7d', '2c'], pot: 40, heroPos: 'BTN', villainPos: 'SB', seats: ['SB', 'BB', 'UTG', 'MP', 'CO', 'BTN'], hero: ['As', '9s'], villain: ['6h', '5h'], villainAction: 'Pasa (Check)', note: 'Postflop: SB empieza y BTN cierra' }),
        [
          O('sb', 'La SB habla primero', true, 'Correcto. Postflop el orden se invierte: SB → BB → UTG → MP → CO → BTN.'),
          O('utg', 'UTG habla primero', false, 'UTG habla primero preflop, pero postflop lo hace después de SB y BB.'),
          O('bb', 'La BB habla primero', false, 'La BB habla después de la SB en las calles posteriores.')
        ]),
      C('Caso 5 · Rotación del botón',
        preflopTable({ heroPos: 'SB', villainPos: 'BB', hero: ['7h', '2c'], villain: ['Ah', 'Kd'], note: 'El botón se movió un asiento a la izquierda' }),
        [
          O('sb', 'El ex-BTN ahora es SB', true, 'Correcto. Al rotar el botón una posición a la izquierda, quien era BTN pasa a SB y quien era SB pasa a BB.'),
          O('bb', 'El ex-BTN ahora es BB', false, 'El ex-BTN pasa a SB. La BB es quien antes era SB.'),
          O('utg', 'El ex-BTN ahora es UTG', false, 'UTG es el jugador dos asientos a la izquierda del BTN nuevo, no el que era BTN.')
        ])
    ],
    principle: 'Ciegas: SB = 1, BB = 2. Preflop: UTG → MP → CO → BTN → SB → BB. Postflop: SB → BB → UTG → MP → CO → BTN.'
  },

  {
    id: 'basic_actions',
    level: 'Iniciación',
    title: 'Acciones básicas en tu turno',
    summary: 'Check, Call, Bet, Raise y Fold con cinco decisiones legales.',
    guide: [
      'Si nadie ha apostado, Check es gratis; si alguien apostó, ya no puedes hacer Check.',
      'Con valor apuesta o sube; sin valor ni proyecto, retírate.',
      'Los cinco casos cubren las cinco acciones básicas.'
    ],
    cases: [
      C('Caso 1 · Nadie ha apostado',
        preflopTable({ heroPos: 'BTN', hero: ['7h', '2c'], villain: ['Ah', 'Kd'], bet: 0, note: 'Turno del héroe · pagar cuesta 0' }),
        [
          O('check', 'Check (Pasar)', true, 'Correcto. Con 0 fichas que pagar, Check es gratis: ves el flop sin arriesgar nada.'),
          O('bet', 'Bet (Apostar)', false, 'Podrías robar, pero con 72o en BTN no es la acción básica segura. Aquí Check es la decisión limpia.'),
          O('fold', 'Fold (Retirarte)', false, 'Nunca foldees frente a 0 fichas: regalas la oportunidad de ver el flop gratis.')
        ]),
      C('Caso 2 · El rival apostó y tú tienes basura',
        flopTable({ board: ['9h', '8h', '3c'], pot: 100, bet: 50, hero: ['7h', '2c'], villain: ['Kd', 'Qd'], villainProfile: 'TAG', villainAction: 'Apuesta 50', note: '72o sin proyecto · hay apuesta viva' }),
        [
          O('fold', 'Fold (Retirarte)', true, 'Correcto. Con apuesta viva ya no puedes hacer Check y 72o sin proyecto no justifica pagar 50.'),
          O('call', 'Call (Pagar 50)', false, 'Pagar con basura y sin outs es perder fichas: no tienes equity suficiente.'),
          O('raise', 'Raise (Subir)', false, 'Subir con aire contra un TAG es quemar dinero: no hay foldeos garantizados.')
        ]),
      C('Caso 3 · Proyecto de color frente a apuesta',
        flopTable({ board: ['9h', '8h', '2c'], pot: 100, bet: 50, hero: ['Ah', '5h'], villain: ['Kd', 'Qd'], villainProfile: 'TAG', villainAction: 'Apuesta 50', outCards: HEART_OUTS, note: '9 outs de color · pot odds 25%' }),
        [
          O('call', 'Call (Pagar 50)', true, 'Correcto. Pagas 50 para un bote final de 200: necesitas 25%. Tu color liga ~35%. Aquí Call es +EV.'),
          O('fold', 'Fold (Retirarte)', false, 'Te sobra margen: 35% de equity contra 25% de pot odds. Foldear tira una decisión rentable.'),
          O('raise', 'Raise (Subir)', false, 'La decisión básica es pagar; con sólo limpieza parcial de outs, subir no es la línea segura.')
        ]),
      C('Caso 4 · Tienes valor y nadie ha apostado',
        flopTable({ board: ['Ks', '8c', '3d'], pot: 40, bet: 0, hero: ['As', 'Kd'], villain: ['Qh', 'Qc'], villainAction: 'Pasa (Check)', note: 'Top pair con mejor kicker · sin apuesta' }),
        [
          O('bet', 'Bet (Apostar por valor)', true, 'Correcto. Check es legal, pero con par de K y mejor kicker apuestas para que te paguen peores manos.'),
          O('check', 'Check (Pasar)', false, 'Pasar es legal, pero renuncias a valor con una mano que está por delante de casi todo.'),
          O('fold', 'Fold (Retirarte)', false, 'Retirarte con top pair y mejor kicker frente a un Check es un error grave.')
        ]),
      C('Caso 5 · All-in y mano hecha',
        riverTable({ board: ['Ks', '9d', '4c', '7h', '2s'], pot: 80, bet: 80, hero: ['As', 'Ad'], villain: ['Kc', '3d'], villainAction: 'All-in 80', note: 'Par de Ases · no quedan cartas' }),
        [
          O('call', 'Call (Pagar el all-in)', true, 'Correcto. Con par de Ases no quedan cartas por venir: es tu mejor mano posible y pagar es obligatorio.'),
          O('fold', 'Fold (Retirarte)', false, 'Foldear los Ases en River contra un rango que puede tener peores pares es regalar el bote.'),
          O('raise', 'Raise (Subir)', false, 'El rival ya está all-in: no hay fichas detrás para subir. La única opción de valor es Call.')
        ])
    ],
    principle: 'Apuesta 0 → Check. Con apuesta → Call / Raise / Fold. Sin valor ni outs → Fold. Con valor → Bet o Raise.'
  },

  {
    id: 'position_range',
    level: 'Básico',
    title: 'Manos iniciales según posición',
    summary: 'La misma mano vale distinto en UTG, CO o BTN.',
    guide: [
      'Cuantos más jugadores hablen detrás, más estrecho debe ser tu rango.',
      'En BTN quedan sólo las ciegas: puedes abrir manos especulativas y jugar en posición.',
      'Los cinco casos van de premium a basura y de UTG a BTN.'
    ],
    cases: [
      C('Caso 1 · K♠ 9♦: BTN o UTG',
        preflopTable({ heroPos: 'BTN', hero: ['Ks', '9d'], villain: ['Qh', 'Jc'], note: 'K♠ 9♦ · dos posiciones posibles' }),
        [
          O('btn', 'Abrir desde BTN', true, 'Correcto. Desde BTN puedes abrir ~40-50% de manos: K9o entra y además actúas al último postflop.'),
          O('utg', 'Abrir desde UTG', false, 'Desde UTG K9o pierde dinero: cinco jugadores pueden tener rangos más fuertes.'),
          O('limp', 'Pagar desde UTG', false, 'El limp desde UTG regala iniciativa y juegas fuera de posición sin controlar el bote.')
        ]),
      C('Caso 2 · AA desde UTG',
        preflopTable({ heroPos: 'UTG', villainPos: 'MP', hero: ['As', 'Ad'], villain: ['Kd', 'Qd'], villainAction: 'MP aún no ha hablado', note: 'AA desde la peor posición' }),
        [
          O('raise', 'Subir (cualquier posición)', true, 'Correcto. AA es premium: se sube incluso desde UTG. La posición no convierte una mano premium en foldeable.'),
          O('limp', 'Pagar (limp)', false, 'El limp con AA invita a ver barato el flop y renuncia a construir el bote con la mejor mano.'),
          O('fold', 'Retirarte', false, 'Nunca foldees AA preflop: es la mano inicial más fuerte.')
        ]),
      C('Caso 3 · 72o desde UTG',
        preflopTable({ heroPos: 'UTG', villainPos: 'MP', hero: ['7h', '2c'], villain: ['Ah', 'Kd'], villainAction: 'MP aún no ha hablado', note: '72o · sin jugabilidad' }),
        [
          O('fold', 'Retirarte', true, 'Correcto. 72o es la peor mano: desde UTG, con cinco jugadores detrás, foldear es gratis.'),
          O('raise', 'Subir', false, 'Subir 72o desde UTG sólo consigue que te paguen o te 3-beteen con rangos mucho mejores.'),
          O('limp', 'Pagar (limp)', false, 'Pagar para ver un flop fuera de posición con la peor mano es una forma segura de perder fichas.')
        ]),
      C('Caso 4 · A♠ 5♠ desde BTN',
        preflopTable({ heroPos: 'BTN', hero: ['As', '5s'], villain: ['Kd', 'Qd'], note: 'A5s · comodín para robar y semi-farol' }),
        [
          O('raise', 'Abrir desde BTN', true, 'Correcto. A5s tiene bloqueador de As, posibilidad de color y escalera: es una mano ideal para abrir en BTN.'),
          O('fold', 'Retirarte', false, 'Foldear A5s en BTN es demasiado ajustado: tienes posición y muchas formas de ganar.'),
          O('limp', 'Pagar (limp)', false, 'El limp desaprovecha la posición y deja que las ciegas vean el flop gratis.')
        ]),
      C('Caso 5 · K♠ J♦ en CO frente a UTG',
        preflopTable({ heroPos: 'CO', villainPos: 'UTG', hero: ['Ks', 'Jd'], villain: ['Ah', 'Qd'], bet: 6, villainAction: 'UTG sube a 6', note: 'K♠ J♦ frente a apertura temprana' }),
        [
          O('fold', 'Retirarte', true, 'Correcto. Frente a un rango de UTG, KJo va por detrás de sus manos dominantes. Foldear es barato.'),
          O('call', 'Pagar 6', false, 'Pagar con KJo contra UTG suele ser -EV: tu mano no domina y juegas con iniciativa en contra.'),
          O('threebet', '3-Bet', false, 'Un 3-Bet con KJo contra UTG te expone a 4-Bets con manos que te dominan.')
        ])
    ],
    principle: 'Premium se suben siempre; manos especulativas necesitan posición; frente a rangos tempranos se foldea más.'
  },

  {
    id: 'pot_odds_call',
    level: 'Básico',
    title: 'Pot Odds en acción',
    summary: 'Cinco apuestas distintas: cuándo pagar y cuándo retirarse con un proyecto.',
    guide: [
      'Pot odds = apuesta a pagar / bote final, incluyendo la apuesta del rival y la tuya.',
      'Paga sólo si tu equity estimado es mayor que ese porcentaje.',
      'Los casos muestran botes grandes, pequeños y apuestas a media y última carta.'
    ],
    cases: [
      C('Caso 1 · Bote 100, apuesta 50, 9 outs',
        flopTable({ board: ['9h', '8h', '2c'], pot: 100, bet: 50, hero: ['Ah', '5h'], villain: ['Kd', 'Qd'], villainProfile: 'TAG', villainAction: 'Apuesta 50', outCards: HEART_OUTS, note: '9 outs · necesitas 25%, tienes ~35%' }),
        [
          O('call', 'Pagar 50', true, 'Correcto. 50 / (100 + 50 + 50) = 25%. Tu color liga ~35%, así que el call gana fichas a largo plazo.'),
          O('fold', 'Retirarte', false, 'Te sobra margen: 35% de equity contra 25% de pot odds. Foldear aquí tira una decisión +EV.'),
          O('raise', 'Subir con el proyecto', false, 'Podría ser semi-farol, pero la decisión básica y segura con esos outs es pagar.')
        ]),
      C('Caso 2 · Gutshot en Turn, apuesta 100',
        turnTable({ board: ['9d', '6c', '2h', '3s'], pot: 100, bet: 100, hero: ['8s', '7s'], villain: ['Ah', 'Kd'], villainAction: 'Apuesta 100', outCards: GUTSHOT_4_OUTS, note: '4 outs · necesitas 33%, tienes ~9%' }),
        [
          O('fold', 'Retirarte', true, 'Correcto. 100 / (100 + 100 + 100) = 33%. Con una carta por venir y 4 outs tienes ~9%.'),
          O('call', 'Pagar 100', false, 'Pagar 100 con 9% de equity contra 33% de pot odds es perder fichas cada vez.'),
          O('raise', 'Subir', false, 'No hay fold equity suficiente para compensar: te costaría caro y tus outs son pocos.')
        ]),
      C('Caso 3 · Gutshot en Flop, apuesta pequeña',
        flopTable({ board: ['9d', '6c', '2h'], pot: 100, bet: 20, hero: ['8s', '7s'], villain: ['Ah', 'Kd'], villainAction: 'Apuesta 20', outCards: GUTSHOT_4_OUTS, note: '4 outs · necesitas 14%, tienes ~16%' }),
        [
          O('call', 'Pagar 20', true, 'Correcto. 20 / (100 + 20 + 20) = 14,3%. Con dos cartas por venir, 4 outs valen ~16%: el call es rentable.'),
          O('fold', 'Retirarte', false, 'El precio es barato: 16% de equity supera el 14,3% exigido.'),
          O('raise', 'Subir', false, 'Con un gutshot débil, subir no mejora tu decisión: paga barato y espera el flop/turn.')
        ]),
      C('Caso 4 · Color en Turn, apuesta 100',
        turnTable({ board: ['9h', '8h', '2c', '4d'], pot: 100, bet: 100, hero: ['Ah', '5h'], villain: ['Kd', 'Qd'], villainAction: 'Apuesta 100', outCards: HEART_OUTS, note: '9 outs · necesitas 33%, tienes ~20%' }),
        [
          O('fold', 'Retirarte', true, 'Correcto. En Turn sólo queda una carta: 9 outs valen ~20%, pero debes pagar 100 para un bote de 300 (33%).'),
          O('call', 'Pagar 100', false, 'El color es buen proyecto, pero el precio es malo: 20% de equity no cubre 33% de pot odds.'),
          O('raise', 'Subir', false, 'Sin fold equity suficiente, subir con un proyecto que no liga casi nunca es -EV.')
        ]),
      C('Caso 5 · Ocho outs de escalera, apuesta 40',
        flopTable({ board: ['9d', '6c', '2h'], pot: 100, bet: 40, hero: ['8s', '7s'], villain: ['Ah', 'Kd'], villainAction: 'Apuesta 40', outCards: STRAIGHT_8_OUTS, note: '8 outs · necesitas 22%, tienes ~32%' }),
        [
          O('call', 'Pagar 40', true, 'Correcto. 40 / (100 + 40 + 40) = 22%. Con 8 outs y dos cartas por venir tienes ~32%: sobra margen.'),
          O('fold', 'Retirarte', false, 'Tienes casi 10 puntos porcentuales de ventaja sobre las pot odds: pagar es claro.'),
          O('raise', 'Subir', false, 'La decisión correcta es pagar; subir con un proyecto aún sin completar añade riesgo innecesario.')
        ])
    ],
    principle: 'Pot odds = apuesta a pagar / bote final. Paga cuando tu equity sea mayor; foldea cuando sea menor.'
  },

  {
    id: 'outs_rule',
    level: 'Básico',
    title: 'Contar outs: regla del 4 y del 2',
    summary: 'Cinco estimaciones rápidas para Flop, Turn y River.',
    guide: [
      'Cada out vale cerca del 2% con una carta por venir y cerca del 4% con dos.',
      'Cuenta primero las cartas marcadas y después elige el multiplicador según la calle.',
      'En River ya no hay multiplicador: la mano está hecha.'
    ],
    cases: [
      C('Caso 1 · 8 outs en Turn',
        turnTable({ board: ['9d', '6c', '2h', '3s'], pot: 60, bet: 0, hero: ['8s', '7s'], villain: ['Ah', 'Kd'], villainAction: 'Pasa (Check)', outCards: STRAIGHT_8_OUTS, note: '8 cartas marcadas · una carta por venir' }),
        [
          O('turn16', '8 × 2 = 16%', true, 'Correcto. En Turn queda una carta: 8 × 2 = 16%. El valor exacto es 8/46 ≈ 17,4%.'),
          O('flop32', '8 × 4 = 32%', false, 'El ×4 es sólo para el Flop, cuando faltan dos cartas. Aquí ya estamos en Turn.'),
          O('turn24', '8 × 3 = 24%', false, 'No existe el ×3. En Turn se multiplica por 2 porque queda una sola carta.')
        ]),
      C('Caso 2 · 8 outs en Flop',
        flopTable({ board: ['9d', '6c', '2h'], pot: 60, bet: 0, hero: ['8s', '7s'], villain: ['Ah', 'Kd'], villainAction: 'Pasa (Check)', outCards: STRAIGHT_8_OUTS, note: '8 cartas marcadas · dos cartas por venir' }),
        [
          O('flop32', '8 × 4 = 32%', true, 'Correcto. En Flop quedan Turn y River: 8 × 4 = 32% es la estimación estándar.'),
          O('turn16', '8 × 2 = 16%', false, 'El ×2 se usa en Turn, con una sola carta por venir.'),
          O('flop8', '8 × 1 = 8%', false, 'Ocho cartas no valen 8% con dos cartas por venir: cada out vale cerca del 4%.')
        ]),
      C('Caso 3 · River: ya no hay outs',
        riverTable({ board: ['9d', '6c', '2h', '3s', 'Jc'], pot: 60, bet: 0, hero: ['8s', '7s'], villain: ['Ah', 'Kd'], villainAction: 'Pasa (Check)', note: 'River · no queda ninguna carta' }),
        [
          O('zero', '0% de outs', true, 'Correcto. En River la mano está hecha: no hay cartas por venir y los outs valen 0%.'),
          O('turn16', '8 × 2 = 16%', false, 'En Turn se podía usar ×2, pero ya llegamos al River: no queda carta que te salve.'),
          O('flop32', '8 × 4 = 32%', false, 'El ×4 era válido en el Flop. Aquí sólo puedes comparar manos hechas.')
        ]),
      C('Caso 4 · Proyecto de color en Flop',
        flopTable({ board: ['9h', '8h', '2c'], pot: 60, bet: 0, hero: ['Ah', '5h'], villain: ['Kd', 'Qd'], villainAction: 'Pasa (Check)', outCards: HEART_OUTS, note: '9 cartas de color · dos cartas por venir' }),
        [
          O('flop36', '9 × 4 = 36%', true, 'Correcto. Nueve outs en Flop: 9 × 4 = 36%, muy cerca del valor real (~35%).'),
          O('flop18', '9 × 2 = 18%', false, 'El ×2 se usa en Turn. En Flop tienes dos cartas para ligar.'),
          O('flop45', '9 × 5 = 45%', false, 'No existe el ×5: con dos cartas por venir, cada out vale cerca del 4%.')
        ]),
      C('Caso 5 · Gutshot en Turn',
        turnTable({ board: ['9d', '6c', '2h', '3s'], pot: 60, bet: 0, hero: ['8s', '7s'], villain: ['Ah', 'Kd'], villainAction: 'Pasa (Check)', outCards: GUTSHOT_4_OUTS, note: '4 cartas marcadas · una carta por venir' }),
        [
          O('turn8', '4 × 2 = 8%', true, 'Correcto. En Turn, 4 × 2 = 8%. El cálculo exacto es 4/46 ≈ 8,7%.'),
          O('turn16', '4 × 4 = 16%', false, 'El ×4 sería para Flop. Aquí queda una sola carta.'),
          O('turn12', '4 × 3 = 12%', false, 'El multiplicador de Turn es ×2, no ×3.')
        ])
    ],
    principle: 'Flop → outs × 4. Turn → outs × 2. River → 0 outs: la mano está hecha.'
  },

  {
    id: 'position_ip',
    level: 'Intermedio',
    title: 'Ventaja de posición (IP vs OOP)',
    summary: 'Actuar al último permite robar barato y controlar el bote.',
    guide: [
      'IP significa actuar al último en Flop, Turn y River; OOP es actuar primero.',
      'En posición puedes apostar pequeño con aire y check-call con manos medianas.',
      'Los cinco casos alternan BTN (IP) y BB (OOP).'
    ],
    cases: [
      C('Caso 1 · BTN en posición, board seco',
        flopTable({ board: ['Ks', '7d', '2c'], pot: 40, bet: 0, hero: ['As', '9s'], villain: ['6h', '5h'], villainProfile: 'Nit', villainAction: 'Pasa (Check)', seats: ['BTN', 'SB', 'BB'], note: 'BTN es IP: decide al final' }),
        [
          O('bet_small', 'Apostar 1/3 del bote', true, 'Correcto. Con posición y ventaja de rango, una apuesta pequeña presiona el rango débil de la BB a bajo coste.'),
          O('check', 'Pasar siempre', false, 'Pasas la iniciativa y regalas cartas gratis. En posición quieres construir el bote con tu ventaja.'),
          O('fold', 'Retirarte', false, 'Con A♠ 9♠ en BTN tienes equidad y posición: retirarte frente a un Check es un error.')
        ]),
      C('Caso 2 · BB fuera de posición con aire',
        flopTable({ board: ['Ks', '7d', '2c'], pot: 40, bet: 12, heroPos: 'BB', villainPos: 'BTN', seats: ['SB', 'BB', 'UTG', 'MP', 'CO', 'BTN'], hero: ['6h', '5h'], villain: ['As', '9s'], villainAction: 'BTN apuesta 12', note: 'BB OOP · 6♥5♥ sin nada' }),
        [
          O('fold', 'Retirarte', true, 'Correcto. Fuera de posición y sin proyecto, pagar contra un rango de BTN suele perder dinero.'),
          O('call', 'Pagar 12', false, 'Con 6♥5♥ en K72 no tienes ni par ni proyecto limpio: el call OOP es -EV.'),
          O('raise', 'Subir', false, 'Subir fuera de posición con aire contra un BTN con ventaja de rango es agravar el error.')
        ]),
      C('Caso 3 · BTN con top pair en board mojado',
        flopTable({ board: ['Ks', '8h', '7h'], pot: 50, bet: 0, hero: ['As', 'Kd'], villain: ['6h', '5h'], villainProfile: 'TAG', villainAction: 'Pasa (Check)', note: 'BTN IP · par de K en board con draws' }),
        [
          O('bet_big', 'Apostar ~2/3 del bote', true, 'Correcto. En posición con top pair y board mojado, apostar grande cobra a los draws y obtiene valor.'),
          O('check', 'Pasar', false, 'Pasar da cartas gratis a color y escaleras que te pueden ganar.'),
          O('fold', 'Retirarte', false, 'Tienes una de las mejores manos posibles: retirarte es descartar valor.')
        ]),
      C('Caso 4 · BB con mano fuerte, dejando farolear',
        flopTable({ board: ['Ks', '7d', '2c'], pot: 40, bet: 0, heroPos: 'BB', villainPos: 'BTN', seats: ['SB', 'BB', 'UTG', 'MP', 'CO', 'BTN'], hero: ['Kd', 'Qc'], villain: ['As', '9s'], villainAction: 'Pasa (Check)', note: 'BB OOP con top pair · BTN farolea' }),
        [
          O('check_call', 'Check-Call', true, 'Correcto. Fuera de posición con una mano buena, deja que el BTN farolee y paga sus apuestas.'),
          O('fold', 'Fold al Check', false, 'No hay apuesta que pagar: foldear frente a un Check es regalar el bote.'),
          O('shove', 'Apostar todo el stack', false, 'Un all-in mata la acción y sólo te pagan manos que te ganan.')
        ]),
      C('Caso 5 · BTN con aire y posición',
        flopTable({ board: ['Ks', '7d', '2c'], pot: 40, bet: 0, hero: ['Qh', 'Jh'], villain: ['6h', '5h'], villainProfile: 'Nit', villainAction: 'Pasa (Check)', note: 'BTN IP · aire con posición' }),
        [
          O('bet_small', 'Apostar 1/3 del bote', true, 'Correcto. En BTN, con aire y ventaja de rango, una apuesta pequeña roba el bote barato.'),
          O('check', 'Pasar', false, 'Pasar esperando ligar renuncia a la principal ventaja de actuar al último.'),
          O('fold', 'Retirarte', false, 'Con 0 fichas que pagar, foldear es tirar una oportunidad gratis de presionar.')
        ])
    ],
    principle: 'IP = Information + Control. Actuar al último permite robar barato, dar cartas gratis y pagar con manos medianas.'
  },

  {
    id: 'spr_commitment',
    level: 'Intermedio',
    title: 'SPR y compromiso con Top Pair',
    summary: 'SPR bajo y alto cambian cuánto vale una pareja.',
    guide: [
      'SPR = stack restante / bote. Cuanto más bajo, menos fuerte debe ser tu mano para jugarlo todo.',
      'Con SPR 2, un top pair con buen kicker cubre el ~40% de equity que exige el stack.',
      'Los casos contrastan SPR 0,5 / 1 / 2 / 8.'
    ],
    cases: [
      C('Caso 1 · SPR 2 con mejor kicker',
        flopTable({ board: ['Ks', '8c', '3d'], pot: 40, bet: 0, hero: ['As', 'Kd'], villain: ['Qh', 'Qc'], villainProfile: 'TAG', villainAction: 'Pasa (Check)', note: 'SPR = 2 · Top Pair con mejor kicker' }),
        [
          O('value', 'Apostar por valor y comprometer', true, 'Correcto. Con SPR 2 necesitas ~40% de equity para jugar el stack; tu par de K supera ese umbral.'),
          O('fold', 'Check-Fold por miedo al trío', false, 'Con SPR bajo y mejor kicker, retirarse tira una mano dominante. El miedo no es una cuenta.'),
          O('minbet', 'Apostar 1 ficha', false, 'Una mini-apuesta da cartas gratis y nunca construye el bote que tu SPR ya permite.')
        ]),
      C('Caso 2 · SPR 2 con kicker débil contra Nit',
        flopTable({ board: ['Ks', '8c', '3d'], pot: 40, bet: 40, hero: ['As', '8d'], villain: ['Kc', 'Qc'], villainProfile: 'Nit', villainAction: 'Apuesta 40', note: 'SPR = 2 · par de K con kicker 8' }),
        [
          O('fold', 'Retirarte', true, 'Correcto. Un Nit no farolea con aire: con kicker 8 estás dominado por sus top pairs fuertes.'),
          O('call', 'Pagar 40', false, 'El SPR bajo invita a pagar, pero el kicker débil frente a un Nit convierte el call en una pérdida.'),
          O('raise', 'Subir', false, 'Subir agrava el error: te pagarán o te izarán sólo con mejores kickers.')
        ]),
      C('Caso 3 · SPR 8 con top pair',
        flopTable({ board: ['Ks', '8c', '3d'], pot: 20, bet: 160, hero: ['As', 'Kd'], villain: ['Qh', 'Qc'], villainAction: 'All-in 160', note: 'SPR = 8 · stack profundo' }),
        [
          O('fold', 'Retirarte al all-in', true, 'Correcto. Con SPR 8 se necesita una mano mucho más fuerte que top pair para pagar 160 fichas.'),
          O('call', 'Pagar el all-in', false, 'Un top pair rara vez cubre el equity exigido con un stack profundo: es una llamada perdedora.'),
          O('raise', 'Subir', false, 'El rival ya está all-in; además, tu mano no tiene valor para comprometer 8 veces el bote.')
        ]),
      C('Caso 4 · SPR 0,5 con top pair',
        flopTable({ board: ['Ks', '8c', '3d'], pot: 80, bet: 80, hero: ['As', 'Kd'], villain: ['Qh', 'Qc'], villainAction: 'All-in 80', note: 'SPR = 0,5 · par de K' }),
        [
          O('call', 'Pagar el all-in', true, 'Correcto. Con SPR 0,5, un top pair ya es una mano suficiente: pagar es obligatorio.'),
          O('fold', 'Retirarte', false, 'Foldear una pareja cuando te piden menos que el bote es demasiado ajustado.'),
          O('raise', 'Subir', false, 'No hay fichas detrás del all-in: la única decisión posible es Call o Fold.')
        ]),
      C('Caso 5 · SPR 1 con overpair',
        flopTable({ board: ['8c', '3d', '2h'], pot: 60, bet: 60, hero: ['As', 'Ad'], villain: ['Kc', 'Qc'], villainAction: 'All-in 60', note: 'SPR = 1 · overpair AA' }),
        [
          O('call', 'Pagar el all-in', true, 'Correcto. Con SPR 1 y AA sobre un board bajo, tienes una mano dominante: Call sin dudar.'),
          O('fold', 'Retirarte', false, 'Los Ases son la mejor mano posible aquí: foldear sería un error enorme.'),
          O('raise', 'Subir', false, 'El all-in ya cubre tu stack: no existe una subida adicional.')
        ])
    ],
    principle: 'SPR bajo → las manos hechas valen más. SPR alto → hacen falta manos aún más fuertes para jugar el stack.'
  },

  {
    id: 'semi_bluff',
    level: 'Intermedio',
    title: 'Semi-faroles con proyectos fuertes',
    summary: 'Dos formas de ganar: que foldeen o que ligues tu proyecto.',
    guide: [
      'Semi-farol = apostar con una mano que no es buena aún, pero que tiene outs.',
      'Necesitas Fold Equity (el rival puede foldear) y Equity real (puedes ligar).',
      'Los casos muestran cuándo funciona y cuándo el rival lo neutraliza.'
    ],
    cases: [
      C('Caso 1 · Color + escalera contra Nit',
        flopTable({ board: ['9h', '8h', '2c'], pot: 60, bet: 0, hero: ['Ah', '5h'], villain: ['Kd', 'Qd'], villainProfile: 'Nit', villainAction: 'Pasa (Check)', outCards: HEART_OUTS, note: 'Proyecto de color + posibilidad de escalera' }),
        [
          O('bet_big', 'Apostar ~3/4 del bote', true, 'Correcto. Presionas con fold equity y conservas ~35% de equity si te pagan: semi-farol rentable.'),
          O('check', 'Pasar esperando ligar', false, 'Pasar renuncia a los foldeos. Aquí tienes una mano perfecta para presionar.'),
          O('fold', 'Retirarte', false, 'Con 9 outs y posición tira una situación con dos formas de ganar.')
        ]),
      C('Caso 2 · Color puro contra Nit',
        flopTable({ board: ['9h', '8h', '2c'], pot: 60, bet: 0, hero: ['Ah', '5h'], villain: ['Kd', 'Qd'], villainProfile: 'Nit', villainAction: 'Pasa (Check)', outCards: HEART_OUTS, note: '9 outs de color · Nit foldea mucho' }),
        [
          O('bet_two_thirds', 'Apostar ~2/3 del bote', true, 'Correcto. El Nit foldea muchas manos sin par y tú conservas 9 outs si paga: equilibrio ideal.'),
          O('check', 'Pasar', false, 'Pasar le da una carta gratis para alcanzarte o mejorar.'),
          O('overbet', 'Overbet del 150%', false, 'Un tamaño Gigante consigue pocos foldeos extra y hace caro ligar tu color.')
        ]),
      C('Caso 3 · Gutshot contra Calling Station',
        flopTable({ board: ['9d', '6c', '2h'], pot: 60, bet: 0, hero: ['8s', '7s'], villain: ['Kc', '3d'], villainProfile: 'Calling Station', villainAction: 'Pasa (Check)', outCards: GUTSHOT_4_OUTS, note: '4 outs · Station casi nunca foldea' }),
        [
          O('check', 'Pasar (no farolear)', true, 'Correcto. Sin Fold Equity, apostar con 4 outs es -EV: te pagarán y rara vez ligas.'),
          O('bet', 'Apostar 2/3', false, 'El Station no foldea: apostar sólo construye un bote que probablemente pierdes.'),
          O('bluff', 'Farol all-in', false, 'Peor aún: el all-in garantiza que te paguen con cualquier par.')
        ]),
      C('Caso 4 · Color + As contra TAG',
        flopTable({ board: ['9h', '8h', '2c'], pot: 60, bet: 0, hero: ['Ah', '5h'], villain: ['Kd', 'Qd'], villainProfile: 'TAG', villainAction: 'Pasa (Check)', outCards: [...HEART_OUTS, 'As', 'Ad', 'Ac'], note: '12 outs (color + Ases) · TAG' }),
        [
          O('bet_big', 'Apostar ~3/4 del bote', true, 'Correcto. Doce outs y un rival TAG que puede foldear: tienes suficiente equity y foldeos para presionar.'),
          O('check', 'Pasar', false, 'Doce outs merecen presión; pasar desaprovecha tu ventaja.'),
          O('fold', 'Retirarte', false, 'Con 12 outs y posición, foldear es tirar una mano con muchas salidas.')
        ]),
      C('Caso 5 · Color fuera de posición contra Station',
        flopTable({ board: ['9h', '8h', '2c'], pot: 60, bet: 0, heroPos: 'BB', villainPos: 'BTN', seats: ['SB', 'BB', 'UTG', 'MP', 'CO', 'BTN'], hero: ['Ah', '5h'], villain: ['Kd', 'Qd'], villainProfile: 'Calling Station', villainAction: 'Pasa (Check)', outCards: HEART_OUTS, note: 'BB OOP · Station no foldea' }),
        [
          O('check', 'Pasar y ver carta barata', true, 'Correcto. Sin foldeos y fuera de posición, conviene pasar y ligar barato en lugar de farolear.'),
          O('bet', 'Apostar 1/2', false, 'El Station paga: apostar con aire convierte tu proyecto en una apuesta perdedora.'),
          O('fold', 'Retirarte', false, 'Tienes 9 outs: retirarte frente a un Check es demasiado pesimista.')
        ])
    ],
    principle: 'Semi-farol = Fold Equity + Equity real. Funciona mejor contra rivales que foldean; muere contra Calling Stations.'
  },

  {
    id: 'cbet_texture',
    level: 'Avanzado',
    title: 'C-Bet según textura del board',
    summary: 'Seco y alto no se apuesta igual que mojado y coordinado.',
    guide: [
      'En boards secos y altos, quien abrió tiene ventaja de rango: basta 1/3 del bote.',
      'En boards coordinados o con dos palos, apuesta grande con manos hechas y check con aire.',
      'Los cinco casos contrastan K72, 876, A22, 742 y KQ7.'
    ],
    cases: [
      C('Caso 1 · K♠ 7♦ 2♣ arcoíris',
        flopTable({ board: ['Ks', '7d', '2c'], pot: 48, bet: 0, hero: ['As', 'Qs'], villain: ['6h', '5h'], villainProfile: 'TAG', villainAction: 'Pasa (Check)', note: 'Board seco y alto · ventaja de quien abrió' }),
        [
          O('bet_third', 'C-Bet de 1/3 (~16)', true, 'Correcto. Tu rango tiene muchas manos máximas; una apuesta pequeña consigue foldeos baratos.'),
          O('check_always', 'Pasar siempre', false, 'Renuncias a valor inmediato en un board que te favorece claramente.'),
          O('overbet', 'Overbet del 150%', false, 'Un tamaño gigante sólo consigue que te paguen las mejores manos. Aquí lo barato es lo óptimo.')
        ]),
      C('Caso 2 · 8♥ 7♥ 6♣ muy coordinado',
        flopTable({ board: ['8h', '7h', '6c'], pot: 48, bet: 0, hero: ['As', '8d'], villain: ['Kh', 'Qh'], villainProfile: 'TAG', villainAction: 'Pasa (Check)', note: 'Board bajo, coordinado y con dos palos' }),
        [
          O('bet_big', 'Apostar ~2/3 con top pair', true, 'Correcto. Con top pair en un board lleno de draws, apuesta grande para cobrar a color y escaleras.'),
          O('bet_third_air', 'Apostar 1/3 con aire', false, 'Con aire en este board, la BB tiene demasiadas manos que conectan: pequeño no consigue foldeos.'),
          O('check_always', 'Pasar siempre', false, 'Pasar siempre regala cartas gratis a manos con muchas salidas.')
        ]),
      C('Caso 3 · A♣ 2♦ 2♥ pareado',
        flopTable({ board: ['Ac', '2d', '2h'], pot: 48, bet: 0, hero: ['Ks', 'Qd'], villain: ['7h', '6h'], villainProfile: 'TAG', villainAction: 'Pasa (Check)', note: 'Board pareado y alto · BB tiene más tríos' }),
        [
          O('check', 'Pasar con aire', true, 'Correcto. En A22 la BB defiende muchas manos con 2x: con aire, check es la línea sólida.'),
          O('cbet', 'C-Bet de 1/3', false, 'Tu rango de apertura no conecta tan bien como el de la BB en un board pareado: la C-Bet con aire es -EV.'),
          O('overbet', 'Overbet', false, 'Apostar enorme con aire contra un rango con tríos es regalar fichas.')
        ]),
      C('Caso 4 · 7♦ 4♣ 2♠ bajo y seco',
        flopTable({ board: ['7d', '4c', '2s'], pot: 48, bet: 0, hero: ['As', 'Kd'], villain: ['8h', '9h'], villainProfile: 'TAG', villainAction: 'Pasa (Check)', note: 'Board bajo y seco · ventaja de la BB' }),
        [
          O('check', 'Pasar con overcards', true, 'Correcto. A♠K♦ no conecta con este board y la BB tiene muchos más pares: check y conserva fichas.'),
          O('bet_small', 'C-Bet de 1/3', false, 'En boards bajos, la BB tiene ventaja de rango: apostar pequeño con overcards no suele comprar foldeos.'),
          O('bet_big', 'C-Bet grande', false, 'Grande con aire es aún peor: cuando te paguen, tus overcards no ganan.')
        ]),
      C('Caso 5 · K♠ Q♥ 7♥ con draws',
        flopTable({ board: ['Ks', 'Qh', '7h'], pot: 48, bet: 0, hero: ['As', 'Kd'], villain: ['6h', '5h'], villainProfile: 'TAG', villainAction: 'Pasa (Check)', note: 'Top pair en board con muchos draws' }),
        [
          O('bet_twothirds', 'Apostar ~2/3', true, 'Correcto. Con top pair en un board con color y escaleras, necesitas cargar el precio a los draws.'),
          O('check_always', 'Pasar siempre', false, 'Pasar deja gratis las cartas que pueden girar el bote en tu contra.'),
          O('minbet', 'Apostar 2 fichas', false, 'Un minibet no protege tu mano ni cobra a ningún proyecto.')
        ])
    ],
    principle: 'Seco + alto → pequeña y seguida. Coordinado + bajo o con dos palos → grande y selectiva; con aire, check.'
  },

  {
    id: 'river_blocker',
    level: 'Avanzado',
    title: 'Farol en River con bloqueador',
    summary: 'Tu carta puede quitarle al rival la mejor mano posible.',
    guide: [
      'En River ya no mejoras: sólo puedes ganar si el rival foldea o si tienes la mejor mano.',
      'Un bloqueador relevante reduce las combinaciones fuertes del rival y hace creíble tu farol.',
      'Los casos separan bloqueador, sin bloqueador, tamaño y perfil del rival.'
    ],
    cases: [
      C('Caso 1 · A♠ bloquea el mejor color',
        riverTable({ board: MISSING_FLUSH_BOARD, pot: 100, bet: 0, hero: ['As', '5h'], villain: ['Kd', 'Qd'], villainProfile: 'Nit', villainAction: 'Pasa (Check)', note: 'A♠ bloqueador · farol en River' }),
        [
          O('bet_blocker', 'Apostar ~2/3 del bote', true, 'Correcto. No tienes showdown value y tu A♠ quita la mejor carta de color del rival: contra un Nit hay foldeos reales.'),
          O('check_fold', 'Pasar y perder el bote', false, 'Con un rival que foldea, pasar renuncia a la única forma de ganar.'),
          O('call_allin', 'Pagar un all-in', false, 'Pagar con A♠ 5♥ frente a un rango fuerte es regalar fichas: no tienes showdown value.')
        ]),
      C('Caso 2 · Sin bloqueador',
        riverTable({ board: MISSING_FLUSH_BOARD, pot: 100, bet: 0, hero: ['Kd', '5h'], villain: ['As', 'Qd'], villainProfile: 'Nit', villainAction: 'Pasa (Check)', note: 'Sin A♠ · no bloqueas el color nut' }),
        [
          O('check', 'Pasar y rendirse', true, 'Correcto. Sin bloqueador, tu farol no elimina las mejores manos del Nit: apostar es quemar fichas.'),
          O('bet_two_thirds', 'Apostar 2/3', false, 'El Nit puede tener fácilmente el As de espadas: tu farol no tiene suficiente credibilidad.'),
          O('allin', 'Farol all-in', false, 'Sin bloqueador, un all-in sólo consigue que te paguen las manos que te ganan.')
        ]),
      C('Caso 3 · Elegir el tamaño',
        riverTable({ board: MISSING_FLUSH_BOARD, pot: 100, bet: 0, hero: ['As', '5h'], villain: ['Kd', 'Qd'], villainProfile: 'Nit', villainAction: 'Pasa (Check)', note: 'A♠ bloqueador · ¿cuánto apostar?' }),
        [
          O('two_thirds', '2/3 del bote (~67)', true, 'Correcto. Es suficiente para presionar las parejas débiles del Nit sin arriesgar de más.'),
          O('tiny', '1/10 del bote (~10)', false, 'Una apuesta minúscula no genera suficientes foldeos: el Nit te pagará por curiosity con casi todo.'),
          O('shove', 'All-in de 3x el bote', false, 'Demasiado riesgo para el mismo foldeo: sobreapuestas sólo consiguen pagos de manos muy fuertes.')
        ]),
      C('Caso 4 · Bloqueador contra Calling Station',
        riverTable({ board: MISSING_FLUSH_BOARD, pot: 100, bet: 0, hero: ['As', '5h'], villain: ['Kd', 'Qd'], villainProfile: 'Calling Station', villainAction: 'Pasa (Check)', note: 'A♠ bloquea, pero el Station no foldea' }),
        [
          O('check', 'Pasar', true, 'Correcto. El bloqueador es inútil si el rival no puede foldear: guarda las fichas y ve el showdown.'),
          O('bet_two_thirds', 'Apostar 2/3', false, 'El Station paga con cualquier par: el bloqueador no crea foldeos que compensen.'),
          O('bluff', 'Farol all-in', false, 'Es el peor tamaño contra un rival que literalmente no foldea.')
        ]),
      C('Caso 5 · El bloqueador se volvió nuts',
        riverTable({ board: MISSING_FLUSH_BOARD, pot: 100, bet: 0, hero: ['As', '5s'], villain: ['Kd', 'Qd'], villainProfile: 'TAG', villainAction: 'Pasa (Check)', note: 'A♠5♠ completa el color nut' }),
        [
          O('value_bet', 'Apostar por valor', true, 'Correcto. Ya no es un farol: tienes el mejor color posible. Apuesta para que te paguen colores más débiles.'),
          O('check', 'Pasar por miedo', false, 'Pasar con el nuts renuncia a valor contra todos los colores secundarios del rival.'),
          O('bluff_label', 'Tratarlo como farol', false, 'Cuando tu bloqueador se convierte en la mano nut, la línea cambia: apostar es por valor, no por foldeos.')
        ])
    ],
    principle: 'Farol en River = poca showdown value + bloqueador + rival que foldea. Si el rival no foldea o ya tienes el nuts, cambia el plan.'
  },

  {
    id: 'exploit_profiles',
    level: 'Avanzado',
    title: 'Ajustes explotativos por perfil',
    summary: 'GTO es la base; el beneficio extra está en castigar el error del rival.',
    guide: [
      'Antes de apostar, pregunta: ¿este rival foldea, paga o ataca demasiado?',
      'Contra Station no farolees; contra Nit y Weak-Tight, presiona; contra Maníaco, paying con manos medianas.',
      'Los cinco casos enfrentan los cinco perfiles más distintos.'
    ],
    cases: [
      C('Caso 1 · Calling Station con aire',
        riverTable({ board: ['Ks', '9d', '4c', '7h', '2s'], pot: 80, bet: 0, hero: ['Ah', '5h'], villain: ['Kc', '3d'], villainProfile: 'Calling Station', villainAction: 'Pasa (Check)', note: 'Station · foldeos casi nulos' }),
        [
          O('check_fold', 'Pasar / no farolear', true, 'Correcto. Sin Fold Equity, farolear aire es -EV. Guarda las fichas y apuesta sólo cuando tengas valor.'),
          O('bluff_allin', 'Farol all-in', false, 'El Station no foldea: ese all-in sólo consigue que te paguen con cualquier pareja.'),
          O('min_bet', 'Farol de 1/3', false, 'El error es intentar el farol, no el tamaño: te pagará con rey alto o pareja baja.')
        ]),
      C('Caso 2 · Nit con bloqueador',
        riverTable({ board: MISSING_FLUSH_BOARD, pot: 100, bet: 0, hero: ['As', '5h'], villain: ['Kd', 'Qd'], villainProfile: 'Nit', villainAction: 'Pasa (Check)', note: 'Nit · foldea mucho · A♠ bloquea' }),
        [
          O('bet', 'Apostar ~2/3', true, 'Correcto. Aquí sí hay Fold Equity y bloqueador: el Nit suelta manos sin color y tú no tienes showdown value.'),
          O('check', 'Pasar', false, 'Contra un rival que foldea tanto, pasar desaprovecha tu bloqueador.'),
          O('allin', 'All-in', false, 'Excesivo: el Nit foldea con 2/3, no necesitas arriesgar tres veces el bote.')
        ]),
      C('Caso 3 · Maníaco y top pair débil',
        riverTable({ board: ['Ks', '9d', '4c', '7h', '2s'], pot: 100, bet: 50, hero: ['Kc', '8d'], villain: ['Ah', '5h'], villainProfile: 'Maníaco', villainAction: 'Apuesta 50', note: 'Maníaco farolea mucho · top pair débil' }),
        [
          O('call', 'Pagar 50', true, 'Correcto. El Maníaco tiene demasiados faroles en su rango: tu par de K con 8 de kicker es suficiente para pagar.'),
          O('fold', 'Retirarte', false, 'Foldear aquí dejas que su exceso de faroles gane gratis: es el ajuste opuesto al correcto.'),
          O('raise', 'Subir', false, 'Subir con top pair débil abre un bote grande contra un rango que también tiene manos fuertes.')
        ]),
      C('Caso 4 · TAG en board seco',
        flopTable({ board: ['Ks', '7d', '2c'], pot: 48, bet: 0, hero: ['As', 'Qs'], villain: ['6h', '5h'], villainProfile: 'TAG', villainAction: 'Pasa (Check)', note: 'TAG equilibrado · board seco' }),
        [
          O('cbet_third', 'C-Bet de 1/3', true, 'Correcto. Contra un TAG, mantén una C-Bet equilibrada y barata en un board que favorece tu rango.'),
          O('overbet', 'Overbet del 150%', false, 'Un TAG no foldea lo suficiente para pagar una sobreapuesta con aire.'),
          O('check_always', 'Pasar siempre', false, 'Pasar siempre contra un TAG es volverte predecible y regalar iniciativa.')
        ]),
      C('Caso 5 · Weak-Tight en board de color',
        riverTable({ board: MISSING_FLUSH_BOARD, pot: 100, bet: 100, hero: ['Kd', 'Qd'], villain: ['As', '5h'], villainProfile: 'Weak-Tight', villainAction: 'Apuesta 100', note: 'Color completado · Weak-Tight' }),
        [
          O('fold', 'Retirarte', true, 'Correcto. El Weak-Tight casi no farolea en un board tan mojado: su apuesta es color nut o muy fuerte.'),
          O('call', 'Pagar 100', false, 'Con K♦ Q♦ sin color estás pagando contra un rango que te domina casi siempre.'),
          O('raise', 'Subir', false, 'Subir sería castigarte tú mismo: no tienes bluff-catcher ni manos suficientes.')
        ])
    ],
    principle: 'GTO es la base; la ganancia extra está en ajustar al error concreto: Station → no faroles, Nit/Weak-Tight → presiona, Maníaco → paga más.'
  }
];

const academia = {
  currentFilter: 'all',
  activeLessonId: LESSONS_DATA[0].id,
  activeCaseIndex: 0,

  init() {
    const storedLesson = LESSONS_DATA.find(l => l.id === appState.academia.activeLessonId);
    const lesson = storedLesson && this.isUnlocked(storedLesson.id) ? storedLesson : LESSONS_DATA[0];
    this.activeLessonId = lesson.id;
    const storedIndex = Number(appState.academia.activeCaseIndex) || 0;
    this.activeCaseIndex = Math.max(0, Math.min(lesson.cases.length - 1, storedIndex, this.progressOf(lesson.id)));
    this.persistPosition();
  },

  persistPosition() {
    appState.academia.activeLessonId = this.activeLessonId;
    appState.academia.activeCaseIndex = this.activeCaseIndex;
    saveState();
  },

  currentLesson() {
    return LESSONS_DATA.find(l => l.id === this.activeLessonId) || LESSONS_DATA[0];
  },

  currentCase() {
    const lesson = this.currentLesson();
    return lesson.cases[this.activeCaseIndex] || lesson.cases[0];
  },

  progressOf(lessonId) {
    const lesson = LESSONS_DATA.find(l => l.id === lessonId) || LESSONS_DATA[0];
    if (appState.academia.completedIds.includes(lesson.id)) return lesson.cases.length;
    const progress = appState.academia.caseProgress || {};
    const value = Number(progress[lessonId]) || 0;
    return Math.max(0, Math.min(lesson.cases.length, Math.floor(value)));
  },

  cardHTML(code, extraClass = '') {
    const cardId = PokerEngine.codeToCard(code);
    if (cardId === null || cardId === undefined) return '';
    const card = PokerEngine.cardToObj(cardId);
    if (!card) return '';
    const symbol = SUIT_SYMBOL[card.suit] || card.suit;
    const rank = card.rank === 'T' ? '10' : card.rank;
    const tone = RED_SUITS.has(card.suit) ? 'text-rose-400' : 'text-slate-100';
    return `
      <div class="acad-card ${tone} ${extraClass}" title="${rank}${symbol}">
        <span class="acad-card-rank">${rank}</span>
        <span class="acad-card-suit">${symbol}</span>
      </div>
    `;
  },

  isUnlocked(id) {
    const idx = LESSONS_DATA.findIndex(l => l.id === id);
    if (idx <= 0) return true;
    return appState.academia.completedIds.includes(LESSONS_DATA[idx - 1].id);
  },

  filterLevel(level) {
    SoundFX.playClick();
    this.currentFilter = level;
    document.querySelectorAll('.acad-filter-btn').forEach(btn => {
      const active = btn.dataset.level === level;
      btn.className = `acad-filter-btn px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
        active ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`;
    });
    this.render();
  },

  selectLesson(id) {
    if (!this.isUnlocked(id)) {
      showToast('Completa la clase anterior para desbloquear ésta', 'info');
      return;
    }
    SoundFX.playSelect();
    this.activeLessonId = id;
    const lesson = LESSONS_DATA.find(l => l.id === id) || LESSONS_DATA[0];
    this.activeCaseIndex = Math.min(this.progressOf(id), lesson.cases.length - 1);
    this.persistPosition();
    this.render();
  },

  goToCase(index) {
    const lesson = this.currentLesson();
    const target = Number(index);
    if (!Number.isInteger(target) || target < 0 || target >= lesson.cases.length) return;
    if (target > this.progressOf(lesson.id)) {
      showToast('Resuelve el caso anterior para llegar a éste', 'info');
      return;
    }
    SoundFX.playClick();
    this.activeCaseIndex = target;
    this.persistPosition();
    this.render();
  },

  nextCase() {
    const lesson = this.currentLesson();
    if (this.activeCaseIndex + 1 < lesson.cases.length) {
      this.activeCaseIndex += 1;
      this.persistPosition();
      this.render();
      return;
    }
    const idx = LESSONS_DATA.indexOf(lesson);
    const next = LESSONS_DATA[idx + 1];
    if (next) this.selectLesson(next.id);
    else {
      this.persistPosition();
      this.render();
    }
  },

  restartLesson() {
    SoundFX.playClick();
    this.activeCaseIndex = 0;
    this.persistPosition();
    this.render();
  },

  renderList() {
    const listEl = document.getElementById('academia-list');
    if (!listEl) return;
    const filtered = this.currentFilter === 'all'
      ? LESSONS_DATA
      : LESSONS_DATA.filter(l => l.level === this.currentFilter);

    const levelColors = {
      'Iniciación': 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      'Básico': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      'Intermedio': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      'Avanzado': 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    };

    listEl.innerHTML = filtered.map(l => {
      const idx = LESSONS_DATA.indexOf(l);
      const done = appState.academia.completedIds.includes(l.id);
      const progress = this.progressOf(l.id);
      const locked = !this.isUnlocked(l.id);
      const active = l.id === this.activeLessonId;
      const click = locked ? '' : `onclick="academia.selectLesson('${l.id}')"`;
      const cursor = locked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer';
      const mark = locked ? '🔒' : done ? '✓' : progress ? `${progress}/${l.cases.length}` : '·';

      return `
        <div ${click} class="${cursor} rounded-2xl p-3.5 border transition ${
          active ? 'bg-slate-850 border-emerald-500 shadow-lg' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${levelColors[l.level]}">${l.level}</span>
            <span class="text-[10px] font-mono text-slate-500">${mark} ${idx + 1}/${LESSONS_DATA.length}</span>
          </div>
          <h3 class="text-sm font-bold text-white">${l.title}</h3>
          <p class="text-xs text-slate-400 mt-1">${l.summary}</p>
        </div>
      `;
    }).join('');
  },

  renderCompare(table) {
    return table.hands.map(hand => {
      const ev = PokerEngine.evaluateHand([...hand.cards, ...table.board].map(c => PokerEngine.codeToCard(c)));
      return `
        <div class="rounded-xl border border-slate-700/60 bg-slate-950/70 p-2.5 text-center">
          <div class="text-[10px] font-mono text-slate-400 mb-1.5">${hand.label}</div>
          <div class="flex justify-center gap-1 mb-1.5">${hand.cards.map(c => this.cardHTML(c)).join('')}</div>
          <div class="text-[11px] font-bold text-emerald-300">${ev.name}</div>
        </div>
      `;
    }).join('');
  },

  renderScenario(table) {
    const outCards = table.outCards || [];
    const seats = table.seats || [];
    return `
      <div class="grid grid-cols-2 gap-2">
        <div class="rounded-xl border border-slate-700/60 bg-slate-950/70 p-2.5">
          <div class="text-[10px] font-mono text-slate-400 mb-1">RIVAL ${table.villainProfile ? `· ${table.villainProfile}` : ''}</div>
          <div class="flex gap-1 mb-1.5">${(table.villain || []).map(c => this.cardHTML(c)).join('')}</div>
          <div class="text-[11px] text-amber-300 font-semibold">${table.villainAction || '—'}</div>
        </div>
        <div class="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5">
          <div class="text-[10px] font-mono text-emerald-300 mb-1">TÚ · ${table.heroPos || 'HERO'}</div>
          <div class="flex gap-1 mb-1.5">${(table.heroCards || table.hero || []).map(c => this.cardHTML(c)).join('')}</div>
          <div class="text-[11px] text-emerald-300 font-semibold">${table.note || 'Tu turno'}</div>
        </div>
      </div>

      <div class="mt-3">
        <div class="text-[10px] font-mono text-slate-400 mb-1.5 text-center">BOARD · ${table.street}</div>
        <div class="flex flex-wrap justify-center gap-1">
          ${table.board.map(c => this.cardHTML(c)).join('') || '<span class="text-[11px] text-slate-500">Sin board todavía</span>'}
        </div>
      </div>

      ${outCards.length ? `
        <div class="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2">
          <div class="text-[10px] font-mono text-amber-300 text-center mb-1.5">OUTS MARCADOS · ${outCards.length}</div>
          <div class="flex flex-wrap justify-center gap-1">${outCards.map(c => this.cardHTML(c, 'acad-card--out')).join('')}</div>
        </div>
      ` : ''}

      <div class="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono">
        <span class="px-2 py-1 rounded-lg bg-slate-950/70 border border-slate-700">BOTE <strong class="text-amber-300 ml-1">${table.pot}</strong></span>
        ${table.bet ? `<span class="px-2 py-1 rounded-lg bg-rose-950/40 border border-rose-500/40">APUESTA <strong class="text-rose-300 ml-1">${table.bet}</strong></span>` : ''}
      </div>

      ${seats.length ? `
        <div class="mt-3 flex flex-wrap justify-center gap-1">
          ${seats.map(s => `<span class="px-2 py-0.5 rounded-full border text-[10px] font-mono ${
            s === table.heroPos
              ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
              : 'border-slate-700 bg-slate-900 text-slate-400'
          }">${s}</span>`).join('')}
        </div>
      ` : ''}
    `;
  },

  render() {
    this.renderList();
    const ws = document.getElementById('academia-workspace');
    if (!ws) return;

    const lesson = this.currentLesson();
    const lessonIndex = LESSONS_DATA.indexOf(lesson);
    const caseIndex = Math.min(this.activeCaseIndex, lesson.cases.length - 1);
    this.activeCaseIndex = caseIndex;
    const currentCase = lesson.cases[caseIndex];
    const progress = this.progressOf(lesson.id);
    const solved = caseIndex < progress;
    const doneCount = appState.academia.completedIds.length;
    const pct = Math.round((doneCount / LESSONS_DATA.length) * 100);
    const nextLesson = LESSONS_DATA[lessonIndex + 1];

    const dots = lesson.cases.map((_, i) => {
      const done = i < progress;
      const active = i === caseIndex;
      const clickable = i <= progress;
      const cls = active
        ? 'bg-emerald-500 text-white border-emerald-400'
        : done
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
          : 'bg-slate-900 text-slate-600 border-slate-700';
      const attrs = clickable
        ? `onclick="academia.goToCase(${i})" class="w-7 h-7 rounded-lg border text-[10px] font-mono font-bold ${cls} cursor-pointer"`
        : `disabled class="w-7 h-7 rounded-lg border text-[10px] font-mono font-bold ${cls} cursor-not-allowed opacity-50"`;
      return `<button ${attrs} title="Caso ${i + 1}${done ? ' · completado' : ''}">${i + 1}</button>`;
    }).join('');

    let nav = '';
    if (solved) {
      if (caseIndex + 1 < lesson.cases.length) {
        nav = `<button onclick="academia.nextCase()" class="mt-3 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition">Siguiente caso ${caseIndex + 2}/${lesson.cases.length} →</button>`;
      } else if (nextLesson) {
        nav = `<button onclick="academia.selectLesson('${nextLesson.id}')" class="mt-3 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition">Siguiente clase: ${nextLesson.title} →</button>`;
      } else {
        nav = '<p class="mt-3 text-center font-bold text-emerald-300">🏆 ¡Ruta completa! De 0 a pro.</p>';
      }
      if (progress >= lesson.cases.length) {
        nav += `<button onclick="academia.restartLesson()" class="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition">Repasar los 5 casos</button>`;
      }
    }

    ws.innerHTML = `
      <div class="space-y-4">
        <div class="border-b border-slate-800 pb-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-xs font-mono text-emerald-400 uppercase tracking-wider">${lesson.level}</span>
            <span class="text-[11px] font-mono text-slate-400">Clase ${lessonIndex + 1} de ${LESSONS_DATA.length} · 0 → Pro</span>
          </div>
          <h3 class="text-xl font-extrabold text-white mt-1">${lesson.title}</h3>
          <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span class="text-[11px] font-mono text-slate-400">CASO ${caseIndex + 1} DE ${lesson.cases.length} · ${progress}/${lesson.cases.length} resueltos</span>
            <div class="flex flex-wrap gap-1">${dots}</div>
          </div>
          <div class="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
            <div class="h-full bg-emerald-500 rounded-full transition-all" style="width:${pct}%"></div>
          </div>
        </div>

        <div class="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-3.5">
          <span class="text-[11px] font-mono font-bold text-emerald-300">GUÍA EN 3 LÍNEAS</span>
          ${lesson.guide.map(line => `<p class="text-xs sm:text-sm text-emerald-100 mt-1 leading-snug">${line}</p>`).join('')}
        </div>

        <div id="acad-table" class="acad-table relative rounded-2xl border border-emerald-500/25 p-3.5 sm:p-5" ${solved ? 'data-result="correct"' : ''}>
          <p class="mb-3 text-center text-xs sm:text-sm font-bold text-white">${currentCase.prompt}</p>
          ${currentCase.table.compare ? this.renderCompare(currentCase.table) : this.renderScenario(currentCase.table)}
          <div class="mt-4 flex flex-wrap justify-center gap-2">
            ${currentCase.options.map(opt => `
              <button onclick="academia.answerScenario('${lesson.id}', '${opt.key}')"
                class="acad-action px-3 py-2 rounded-xl border border-slate-700 bg-slate-900/90 text-xs font-bold text-slate-100 hover:border-emerald-400/70 transition">
                ${opt.label}
              </button>
            `).join('')}
          </div>
          <div id="acad-feedback" class="hidden mt-4"></div>
          <div id="acad-nav">${nav}</div>
        </div>

        <div class="rounded-xl border border-slate-700/60 bg-slate-950/70 p-3">
          <span class="text-[11px] font-mono font-bold text-cyan-300">REGLA CLAVE</span>
          <p class="text-xs text-slate-300 mt-1 leading-snug">${lesson.principle}</p>
        </div>
      </div>
    `;
  },

  answerScenario(lessonId, key) {
    const idx = LESSONS_DATA.findIndex(l => l.id === lessonId);
    if (idx < 0) return;
    const lesson = LESSONS_DATA[idx];
    const currentCase = lesson.cases[this.activeCaseIndex];
    if (!currentCase) return;
    const opt = currentCase.options.find(o => o.key === key);
    if (!opt) return;

    const tableEl = document.getElementById('acad-table');
    const fb = document.getElementById('acad-feedback');
    const navEl = document.getElementById('acad-nav');
    if (!tableEl || !fb) return;

    tableEl.dataset.result = opt.correct ? 'correct' : 'wrong';
    if (opt.correct) SoundFX.playLessonCorrect();
    else SoundFX.playLessonWrong();

    const previousProgress = this.progressOf(lesson.id);
    let newProgress = previousProgress;

    if (opt.correct) {
      if (!appState.academia.caseProgress) appState.academia.caseProgress = {};
      if (this.activeCaseIndex >= previousProgress) {
        appState.academia.caseProgress[lesson.id] = this.activeCaseIndex + 1;
        saveState();
      }
      newProgress = this.progressOf(lesson.id);

      if (newProgress >= lesson.cases.length && !appState.academia.completedIds.includes(lesson.id)) {
        appState.academia.completedIds.push(lesson.id);
        saveState();
        showToast('Clase completada y desbloqueada la siguiente', 'success');
      }
      this.renderList();
    }

    const nextLesson = LESSONS_DATA[idx + 1];
    let nextBtn = '';
    if (!opt.correct) {
      nextBtn = '<p class="mt-3 text-xs text-slate-400">Inténtalo de nuevo: las decisiones incorrectas no bloquean el caso.</p>';
    } else if (this.activeCaseIndex + 1 < lesson.cases.length) {
      nextBtn = `<button onclick="academia.nextCase()" class="mt-3 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition">Siguiente caso ${this.activeCaseIndex + 2}/${lesson.cases.length} →</button>`;
    } else if (nextLesson) {
      nextBtn = `<button onclick="academia.selectLesson('${nextLesson.id}')" class="mt-3 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition">Siguiente clase: ${nextLesson.title} →</button>`;
    } else {
      nextBtn = '<p class="mt-3 text-center font-bold text-emerald-300">🏆 ¡Ruta completa! De 0 a pro.</p>';
    }
    if (opt.correct && newProgress >= lesson.cases.length) {
      nextBtn += `<button onclick="academia.restartLesson()" class="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition">Repasar los 5 casos</button>`;
    }

    fb.className = `rounded-xl border p-3.5 ${
      opt.correct
        ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-100'
        : 'bg-rose-950/80 border-rose-500/60 text-rose-100'
    }`;
    fb.innerHTML = `
      <strong class="block mb-1 text-sm">${opt.correct ? '✓ Decisión correcta' : '✕ Revisa la decisión'}</strong>
      <p class="text-xs leading-snug">${opt.feedback}</p>
      ${nextBtn}
    `;
    fb.classList.remove('hidden');
    if (navEl) navEl.innerHTML = '';
  }
};
