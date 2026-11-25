/* ============================================================================
   12. MODO ARENA: MESA A PANTALLA COMPLETA (NATIVE FULLSCREEN + FALLBACK CSS)
============================================================================ */
const arena = {
  nativeActive: false,
  savedOverflow: '',

  element() {
    return document.getElementById('game-arena');
  },

  get isActive() {
    const el = this.element();
    return !!el && el.classList.contains('is-arena');
  },

  enter() {
    const el = this.element();
    if (!el) return;

    this.savedOverflow = document.body.style.overflow;
    el.classList.add('is-arena');
    document.body.style.overflow = 'hidden';

    // Fullscreen nativo; si el navegador lo rechaza, la clase CSS mantiene la arena.
    if (el.requestFullscreen && document.fullscreenElement !== el) {
      try {
        const request = el.requestFullscreen();
        if (request && typeof request.catch === 'function') request.catch(() => {});
      } catch (e) {
        /* fallback: modo arena por CSS */
      }
    }

    SoundFX.playClick();
    this.updateInfo();
    this.refreshOverlays();
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
    el.classList.remove('is-arena');
    document.body.style.overflow = this.savedOverflow || '';
    SoundFX.playToggle(false);
    this.updateInfo();
    this.refreshOverlays();
  },

  toggle() {
    if (this.isActive) this.exit();
    else this.enter();
  },

  updateInfo() {
    const source = document.getElementById('game-blinds-info');
    const target = document.getElementById('arena-blinds');
    if (source && target) target.textContent = source.textContent;

    const btn = document.getElementById('btn-arena');
    if (btn) {
      btn.textContent = this.isActive ? '✕' : '⛶ Pantalla Completa';
      btn.title = this.isActive ? 'Salir de pantalla completa' : 'Entrar en pantalla completa';
      btn.setAttribute('aria-label', btn.title);
    }

    this.updateAudioButton();
  },

  updateAudioButton() {
    const btn = document.getElementById('arena-sound-btn');
    if (!btn) return;
    const on = typeof appState === 'undefined' || appState.config.soundEnabled !== false;
    btn.textContent = on ? '🔊' : '🔇';
    btn.setAttribute('aria-label', on ? 'Silenciar audio' : 'Activar audio');
    btn.className = `px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs transition ${
      on ? 'text-emerald-300' : 'text-slate-500'
    }`;
  },

  refreshOverlays() {
    if (typeof eyeballHUD !== 'undefined') eyeballHUD.render();
  },

  onFullscreenChange() {
    const el = this.element();
    if (!el) return;

    if (document.fullscreenElement === el) {
      this.nativeActive = true;
      el.classList.add('is-arena');
      document.body.style.overflow = 'hidden';
      this.updateInfo();
    } else if (this.nativeActive) {
      // El usuario pulsó Esc: sincronizamos el estado con el navegador.
      this.nativeActive = false;
      el.classList.remove('is-arena');
      document.body.style.overflow = this.savedOverflow || '';
      this.updateInfo();
    }
    this.refreshOverlays();
  }
};

document.addEventListener('fullscreenchange', () => arena.onFullscreenChange());
document.addEventListener('fullscreenerror', () => arena.onFullscreenChange());
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && arena.isActive && !document.fullscreenElement) {
    arena.exit();
  }
});
