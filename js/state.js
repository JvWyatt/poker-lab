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
    completedIds: [],
    caseProgress: {},
    activeLessonId: null,
    activeCaseIndex: 0,
    v2: {
      stepProgress: {},
      activeLessonId: null,
      activeStepIndex: 0,
      view: 'map'
    }
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
      academia: {
        completedIds: Array.isArray(parsed.academia?.completedIds) ? parsed.academia.completedIds : [],
        caseProgress: {
          ...DEFAULT_STATE.academia.caseProgress,
          ...(parsed.academia?.caseProgress && typeof parsed.academia.caseProgress === 'object'
            ? parsed.academia.caseProgress
            : {})
        },
        activeLessonId: typeof parsed.academia?.activeLessonId === 'string' ? parsed.academia.activeLessonId : null,
        activeCaseIndex: Number.isInteger(parsed.academia?.activeCaseIndex) ? parsed.academia.activeCaseIndex : 0,
        v2: {
          stepProgress: {
            ...DEFAULT_STATE.academia.v2.stepProgress,
            ...(parsed.academia?.v2?.stepProgress && typeof parsed.academia.v2.stepProgress === 'object'
              ? parsed.academia.v2.stepProgress
              : {})
          },
          activeLessonId: typeof parsed.academia?.v2?.activeLessonId === 'string' ? parsed.academia.v2.activeLessonId : null,
          activeStepIndex: Number.isInteger(parsed.academia?.v2?.activeStepIndex) ? parsed.academia.v2.activeStepIndex : 0,
          view: parsed.academia?.v2?.view === 'lesson' ? 'lesson' : 'map'
        }
      }
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
