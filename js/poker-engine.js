/* ============================================================================
   1. CONSTANTES Y MOTOR DE CARTAS / EVALUADOR EXACTO DE PÓKER (5 A 7 CARTAS)
============================================================================ */
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const RANK_NAMES_ES = {
  '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8',
  '9': '9', 'T': '10', 'J': 'J', 'Q': 'Q', 'K': 'K', 'A': 'A'
};
const SUITS = ['s', 'h', 'd', 'c'];
const SUIT_SYMBOLS = { s: '♠', h: '♥', d: '♦', c: '♣' };
const HAND_CATEGORY_NAMES = [
  'Carta Alta',
  'Pareja',
  'Doble Pareja',
  'Trío',
  'Escalera',
  'Color',
  'Full House',
  'Póker',
  'Escalera de Color',
  'Escalera Real'
];

class PokerEngine {
  static createDeck() {
    const deck = [];
    for (let r = 0; r < 13; r++) {
      for (let s = 0; s < 4; s++) {
        deck.push(r * 4 + s); // 0..51 integer representation
      }
    }
    return deck;
  }

  static shuffle(deck) {
    const arr = [...deck];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  static cardToObj(cardInt) {
    if (cardInt === null || cardInt === undefined || cardInt < 0) return null;
    const rankIdx = Math.floor(cardInt / 4);
    const suitIdx = cardInt % 4;
    return {
      id: cardInt,
      rankIdx,
      suitIdx,
      rank: RANKS[rankIdx],
      suit: SUITS[suitIdx],
      code: RANKS[rankIdx] + SUITS[suitIdx]
    };
  }

  static codeToCard(code) {
    if (!code || code.length < 2) return null;
    const r = RANKS.indexOf(code[0].toUpperCase());
    const s = SUITS.indexOf(code[1].toLowerCase());
    if (r === -1 || s === -1) return null;
    return r * 4 + s;
  }

  /**
   * Evaluador rápido y exacto de 5 a 7 cartas.
   * Devuelve { score: Number, category: Number (0..9), name: String }
   */
  static evaluateHand(cards) {
    const n = cards.length;
    if (n < 5) {
      // Evaluación básica preflop / incompleta
      const ranks = cards.map(c => Math.floor(c / 4)).sort((a, b) => b - a);
      if (n === 2 && ranks[0] === ranks[1]) {
        return { score: 1000000 + ranks[0] * 100, category: 1, name: `Pareja de ${RANK_NAMES_ES[RANKS[ranks[0]]]}` };
      }
      return { score: ranks[0] * 100 + (ranks[1] || 0), category: 0, name: `Carta Alta ${RANK_NAMES_ES[RANKS[ranks[0]]]}` };
    }

    const rankCounts = new Int8Array(13);
    const suitCounts = new Int8Array(4);
    const suitRanks = [[], [], [], []];

    for (let i = 0; i < n; i++) {
      const c = cards[i];
      const r = (c >> 2);
      const s = (c & 3);
      rankCounts[r]++;
      suitCounts[s]++;
      suitRanks[s].push(r);
    }

    // 1. Verificar Color (Flush) y Escalera de Color (Straight Flush)
    let flushSuit = -1;
    for (let s = 0; s < 4; s++) {
      if (suitCounts[s] >= 5) {
        flushSuit = s;
        break;
      }
    }

    if (flushSuit !== -1) {
      const fRanks = suitRanks[flushSuit].sort((a, b) => b - a);
      const sfHigh = this.findStraightHigh(fRanks);
      if (sfHigh !== -1) {
        const isRoyal = sfHigh === 12;
        return {
          score: (isRoyal ? 9 : 8) * 10000000 + sfHigh,
          category: isRoyal ? 9 : 8,
          name: isRoyal ? 'Escalera Real' : `Escalera de Color al ${RANK_NAMES_ES[RANKS[sfHigh]]}`
        };
      }
    }

    // 2. Agrupar frecuencias de rangos (Póker, Full, Trío, Doble Pareja, Pareja)
    let quads = -1;
    const trips = [];
    const pairs = [];
    const singles = [];

    for (let r = 12; r >= 0; r--) {
      const cnt = rankCounts[r];
      if (cnt === 4) quads = r;
      else if (cnt === 3) trips.push(r);
      else if (cnt === 2) pairs.push(r);
      else if (cnt === 1) singles.push(r);
    }

    // Póker (Four of a Kind)
    if (quads !== -1) {
      let kicker = -1;
      for (let r = 12; r >= 0; r--) {
        if (r !== quads && rankCounts[r] > 0) { kicker = r; break; }
      }
      return {
        score: 7 * 10000000 + quads * 100 + kicker,
        category: 7,
        name: `Póker de ${RANK_NAMES_ES[RANKS[quads]]}`
      };
    }

    // Full House
    if (trips.length >= 2 || (trips.length === 1 && pairs.length >= 1)) {
      const t = trips[0];
      const p = trips.length >= 2 ? trips[1] : pairs[0];
      return {
        score: 6 * 10000000 + t * 100 + p,
        category: 6,
        name: `Full House de ${RANK_NAMES_ES[RANKS[t]]} y ${RANK_NAMES_ES[RANKS[p]]}`
      };
    }

    // Color (Flush)
    if (flushSuit !== -1) {
      const fRanks = suitRanks[flushSuit].sort((a, b) => b - a);
      const kickerScore = fRanks[0] * 50625 + fRanks[1] * 3375 + fRanks[2] * 225 + fRanks[3] * 15 + fRanks[4];
      return {
        score: 5 * 10000000 + kickerScore,
        category: 5,
        name: `Color al ${RANK_NAMES_ES[RANKS[fRanks[0]]]}`
      };
    }

    // Escalera (Straight)
    const allRanks = [];
    for (let r = 12; r >= 0; r--) {
      if (rankCounts[r] > 0) allRanks.push(r);
    }
    const stHigh = this.findStraightHigh(allRanks);
    if (stHigh !== -1) {
      return {
        score: 4 * 10000000 + stHigh,
        category: 4,
        name: `Escalera al ${RANK_NAMES_ES[RANKS[stHigh]]}`
      };
    }

    // Trío (Three of a Kind)
    if (trips.length === 1) {
      const t = trips[0];
      const k1 = singles[0] || 0;
      const k2 = singles[1] || 0;
      return {
        score: 3 * 10000000 + t * 1000 + k1 * 20 + k2,
        category: 3,
        name: `Trío de ${RANK_NAMES_ES[RANKS[t]]}`
      };
    }

    // Doble Pareja (Two Pair)
    if (pairs.length >= 2) {
      const p1 = pairs[0];
      const p2 = pairs[1];
      let kicker = singles[0] !== undefined ? singles[0] : -1;
      if (pairs.length >= 3 && pairs[2] > kicker) kicker = pairs[2];
      return {
        score: 2 * 10000000 + p1 * 1000 + p2 * 20 + kicker,
        category: 2,
        name: `Doble Pareja de ${RANK_NAMES_ES[RANKS[p1]]} y ${RANK_NAMES_ES[RANKS[p2]]}`
      };
    }

    // Pareja (One Pair)
    if (pairs.length === 1) {
      const p = pairs[0];
      const k1 = singles[0] || 0;
      const k2 = singles[1] || 0;
      const k3 = singles[2] || 0;
      return {
        score: 1 * 10000000 + p * 10000 + k1 * 400 + k2 * 20 + k3,
        category: 1,
        name: `Pareja de ${RANK_NAMES_ES[RANKS[p]]}`
      };
    }

    // Carta Alta (High Card)
    const hcScore = (singles[0] || 0) * 50625 + (singles[1] || 0) * 3375 + (singles[2] || 0) * 225 + (singles[3] || 0) * 15 + (singles[4] || 0);
    return {
      score: hcScore,
      category: 0,
      name: `Carta Alta ${RANK_NAMES_ES[RANKS[singles[0] || 0]]}`
    };
  }

  /**
   * Devuelve las cartas que forman la mejor jugada de 5 (o la carta/rango
   * dominante antes del flop). No altera evaluateHand: sólo reutiliza su score.
   * preferCards desempata a favor de las cartas del héroe cuando el tapete
   * permite varias combinaciones equivalentes.
   */
  static bestFiveCards(cards, preferCards = []) {
    const list = cards || [];
    if (!list.length) return [];
    if (list.length < 5) {
      const topRank = Math.max(...list.map(c => c >> 2));
      return list.filter(c => (c >> 2) === topRank);
    }
    if (list.length === 5) return [...list];

    const prefer = new Set(preferCards || []);
    let best = null;

    for (let a = 0; a < list.length - 4; a++) {
      for (let b = a + 1; b < list.length - 3; b++) {
        for (let c = b + 1; c < list.length - 2; c++) {
          for (let d = c + 1; d < list.length - 1; d++) {
            for (let e = d + 1; e < list.length; e++) {
              const five = [list[a], list[b], list[c], list[d], list[e]];
              const ev = this.evaluateHand(five);
              const preferred = five.filter(card => prefer.has(card)).length;
              if (!best || ev.score > best.ev.score
                || (ev.score === best.ev.score && preferred > best.preferred)) {
                best = { five, ev, preferred };
              }
            }
          }
        }
      }
    }

    return best ? best.five : [...list];
  }

  /**
   * Cartas que DEFINEN la jugada actual (sin kickers), para resaltarlas en la
   * mesa. Carta alta -> 1, par -> 2, dobles parejas -> 4, trío -> 3,
   * escalera/color/escalera de color -> las 5, full -> 5, póker -> 4.
   */
  static madeHandCards(cards, preferCards = []) {
    const list = cards || [];
    if (!list.length) return [];
    const five = this.bestFiveCards(list, preferCards);
    if (!five.length) return [];
    const category = this.evaluateHand(list).category;

    if (category === 0) {
      return [five.reduce((top, c) => ((c >> 2) > (top >> 2) ? c : top), five[0])];
    }
    if (category === 4 || category === 5 || category === 8 || category === 9) {
      return five;
    }

    const counts = new Map();
    for (const c of five) {
      const r = c >> 2;
      counts.set(r, (counts.get(r) || 0) + 1);
    }
    const ranksWith = n => [...counts.entries()]
      .filter(([, count]) => count === n)
      .map(([r]) => r)
      .sort((a, b) => b - a);

    let definingRanks;
    if (category === 1) definingRanks = ranksWith(2).slice(0, 1);
    else if (category === 2) definingRanks = ranksWith(2);
    else if (category === 3) definingRanks = ranksWith(3).slice(0, 1);
    else if (category === 6) definingRanks = [...ranksWith(3).slice(0, 1), ...ranksWith(2).slice(0, 1)];
    else if (category === 7) definingRanks = ranksWith(4).slice(0, 1);
    else definingRanks = [];

    const wanted = new Set(definingRanks);
    return five.filter(c => wanted.has(c >> 2));
  }

  static findStraightHigh(sortedUniqueRanksDesc) {
    if (sortedUniqueRanksDesc.length < 5) return -1;
    let streak = 1;
    for (let i = 0; i < sortedUniqueRanksDesc.length - 1; i++) {
      if (sortedUniqueRanksDesc[i] - 1 === sortedUniqueRanksDesc[i + 1]) {
        streak++;
        if (streak >= 5) return sortedUniqueRanksDesc[i - 3];
      } else {
        streak = 1;
      }
    }
    // Wheel check: A-2-3-4-5 (12, 3, 2, 1, 0)
    if (
      sortedUniqueRanksDesc.includes(12) &&
      sortedUniqueRanksDesc.includes(3) &&
      sortedUniqueRanksDesc.includes(2) &&
      sortedUniqueRanksDesc.includes(1) &&
      sortedUniqueRanksDesc.includes(0)
    ) {
      return 3; // 5-high straight
    }
    return -1;
  }

  /**
   * Detecta proyectos (Draws) y Outs reales en Flop o Turn
   */
  static analyzeDrawsAndOuts(heroCards, boardCards) {
    const all = [...heroCards, ...boardCards];
    if (boardCards.length < 3 || boardCards.length >= 5) {
      return { outs: 0, draws: [], outCards: [] };
    }

    const currentEval = this.evaluateHand(all);
    const used = new Set(all);
    const draws = [];
    const outCards = [];

    // Contar palos para Flush Draw
    const suitCounts = [0, 0, 0, 0];
    all.forEach(c => suitCounts[c & 3]++);
    const hasFlushDraw = suitCounts.some(cnt => cnt === 4);
    if (hasFlushDraw) draws.push('Proyecto de Color (9 outs)');

    // Comprobar cada carta restante del mazo para ver qué mejora sustancialmente la mano
    const boardMaxRank = Math.max(...boardCards.map(c => c >> 2));
    let overcardsCount = 0;
    heroCards.forEach(c => {
      if ((c >> 2) > boardMaxRank && currentEval.category === 0) overcardsCount++;
    });
    if (overcardsCount === 2) draws.push('2 Overcards (6 outs)');
    else if (overcardsCount === 1) draws.push('1 Overcard (3 outs)');

    let straightOuts = 0;
    for (let c = 0; c < 52; c++) {
      if (used.has(c)) continue;
      const nextEval = this.evaluateHand([...all, c]);
      // Mejora a Color, Escalera, Trío, Full o Doble Pareja top
      if (nextEval.category > currentEval.category) {
        if (nextEval.category === 4 && currentEval.category < 4) straightOuts++;
        outCards.push(c);
      }
    }

    if (straightOuts >= 8) draws.push('Escalera Abierta / OESD (8 outs)');
    else if (straightOuts >= 4) draws.push('Escalera Interna / Gutshot (4 outs)');

    return {
      outs: outCards.length,
      draws,
      outCards
    };
  }

  /**
   * Simulación Monte Carlo Real
   */
  static runMonteCarlo(heroCards, villainCards, boardCards, villainRangeMode = 'cards', iterations = 5000) {
    const known = new Set([...heroCards, ...boardCards]);
    if (villainRangeMode === 'cards' && villainCards && villainCards.length === 2) {
      villainCards.forEach(c => known.add(c));
    }

    const baseDeck = [];
    for (let c = 0; c < 52; c++) {
      if (!known.has(c)) baseDeck.push(c);
    }

    let wins = 0;
    let ties = 0;
    let losses = 0;
    const cardsNeededBoard = 5 - boardCards.length;

    for (let iter = 0; iter < iterations; iter++) {
      // Partial Fisher-Yates for needed random cards
      const deck = [...baseDeck];
      const neededTotal = cardsNeededBoard + (villainRangeMode === 'cards' ? 0 : 2);
      for (let i = 0; i < neededTotal; i++) {
        const j = i + Math.floor(Math.random() * (deck.length - i));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }

      let idx = 0;
      let vHand = villainCards;
      if (villainRangeMode !== 'cards') {
        // Filtrar según rango solicitado
        let accepted = false;
        let tries = 0;
        while (!accepted && tries < 25) {
          const r1 = Math.floor(Math.random() * deck.length);
          let r2 = Math.floor(Math.random() * (deck.length - 1));
          if (r2 >= r1) r2++;
          const c1 = deck[r1];
          const c2 = deck[r2];
          const strength = this.preflopHandPercentile(c1, c2);
          if (
            villainRangeMode === 'range_random' ||
            (villainRangeMode === 'range_top15' && strength >= 0.85) ||
            (villainRangeMode === 'range_top30' && strength >= 0.70)
          ) {
            vHand = [c1, c2];
            // Swap them to front so board cards don't collide
            [deck[0], deck[r1]] = [deck[r1], deck[0]];
            const pos2 = deck.indexOf(c2, 1);
            if (pos2 !== -1) [deck[1], deck[pos2]] = [deck[pos2], deck[1]];
            idx = 2;
            accepted = true;
          }
          tries++;
        }
        if (!accepted) {
          vHand = [deck[0], deck[1]];
          idx = 2;
        }
      }

      const simBoard = [...boardCards];
      for (let b = 0; b < cardsNeededBoard; b++) {
        simBoard.push(deck[idx++]);
      }

      const heroScore = this.evaluateHand([...heroCards, ...simBoard]).score;
      const villainScore = this.evaluateHand([...vHand, ...simBoard]).score;

      if (heroScore > villainScore) wins++;
      else if (heroScore === villainScore) ties++;
      else losses++;
    }

    const winPct = (wins / iterations) * 100;
    const tiePct = (ties / iterations) * 100;
    const losePct = (losses / iterations) * 100;
    const equity = winPct + tiePct / 2;

    return { winPct, tiePct, losePct, equity, iterations };
  }

  /**
   * Fuerza preflop normalizada 0.0 (72o) a 1.0 (AA)
   */
  static preflopHandPercentile(c1, c2) {
    const r1 = Math.max(c1 >> 2, c2 >> 2);
    const r2 = Math.min(c1 >> 2, c2 >> 2);
    const suited = (c1 & 3) === (c2 & 3);
    const pair = r1 === r2;
    const gap = r1 - r2;

    let score = (r1 + 1) * 2.2 + (r2 + 1) * 1.1;
    if (pair) score += 16 + r1 * 1.2;
    if (suited) score += 4.5;
    if (gap === 1) score += 2.5;
    else if (gap === 2) score += 1.0;
    else if (gap >= 4 && !pair) score -= 3.5;

    // Normalize roughly between 0 and 1
    return Math.max(0.02, Math.min(0.999, (score - 6) / 52));
  }
}
