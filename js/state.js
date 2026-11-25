/* ============================================================================
   3. GESTIÓN DE ESTADO GLOBAL Y PERSISTENCIA EN LOCALSTORAGE
============================================================================ */
const STORAGE_KEY = 'poker_lab_state_v2';

const DEFAULT_STATE = {
  config: {
    tableSize: 6,
    stackBB: 100,
    blinds: '1-2',
    fourColor: true,
    botSpeed: 180,
    showCoach: true,
    showProfiles: true,
    soundEnabled: true
  },
  stats: {
    handsPlayed: 0,
    goodDecisions: 0,
    badDecisions: 0,
    evLostBB: 0,
    netProfitBB: 0,
    history: []
  },
  academia: {
    completedIds: []
  }
};

let appState = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
    const parsed = JSON.parse(raw);
    return {
      config: { ...DEFAULT_STATE.config, ...(parsed.config || {}) },
      stats: { ...DEFAULT_STATE.stats, ...(parsed.stats || {}) },
      academia: { ...DEFAULT_STATE.academia, ...(parsed.academia || {}) }
    };
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    updateGlobalBadges();
  } catch (e) {
    console.warn('Error guardando estado en localStorage:', e);
  }
}
