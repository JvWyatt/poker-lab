/* ============================================================================
   0. MOTOR DE EFECTOS DE SONIDO SINTETIZADOS (WEB AUDIO API SIN ARCHIVOS)
   Sonidos de UI, cartas, fichas, calificacion de jugadas y reloj.
============================================================================ */
const SoundFX = {
  ctx: null,
  master: null,
  lastUiClick: 0,
  userInteracted: false,

  // El navegador bloquea el audio hasta la primera interacción del usuario.
  activate() {
    this.userInteracted = true;
    this.init();
  },

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.85;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  get enabled() {
    return typeof appState === 'undefined' || appState.config.soundEnabled !== false;
  },

  toggle() {
    const wasEnabled = appState.config.soundEnabled !== false;
    if (wasEnabled) this.playToggle(false); // se escucha antes de silenciar
    appState.config.soundEnabled = !wasEnabled;
    saveState();
    this.updateButtonUI();
    if (!wasEnabled) {
      this.init();
      this.playToggle(true);
    }
  },

  updateButtonUI() {
    const btn = document.getElementById('btn-toggle-sound');
    if (!btn) return;
    const on = appState.config.soundEnabled !== false;
    btn.textContent = on ? '🔊 Sonido: ON' : '🔇 Sonido: OFF';
    btn.className = on
      ? 'px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 transition'
      : 'px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-400 border border-slate-700 transition';

    if (typeof arena !== 'undefined') arena.updateAudioButton();
  },

  /* ---------- PRIMITIVAS ---------- */

  playTone(freq, duration, type = 'sine', vol = 0.08, delay = 0) {
    if (!this.enabled || !this.userInteracted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(vol, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.master || this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  },

  // Barrido de frecuencia: útil para whoosh, timbres y sonidos de reloj.
  playSweep(from, to, duration, type = 'sine', vol = 0.06, delay = 0) {
    if (!this.enabled || !this.userInteracted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(vol, now + Math.min(0.02, duration * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.master || this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  },

  // Ruido filtrado: texture de cartas, fichas y clics.
  playNoise(duration = 0.05, vol = 0.04, delay = 0, filterFreq = 2400, filterType = 'bandpass') {
    if (!this.enabled || !this.userInteracted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + delay;
    const frameCount = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, frameCount, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) data[i] = Math.random() * 2 - 1;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master || this.ctx.destination);
    source.start(now);
    source.stop(now + duration + 0.01);
  },

  // Evita sonidos de clic duplicados al pulsar muy rápido.
  uiThrottle(minGap = 0.045) {
    if (!this.ctx) return false;
    const now = this.ctx.currentTime;
    if (now - this.lastUiClick < minGap) return true;
    this.lastUiClick = now;
    return false;
  },

  /* ---------- SONIDOS DE JUEGO (originales, enriquecidos) ---------- */

  playDeal() {
    // Sonido seco de reparto de carta
    this.playNoise(0.03, 0.025, 0, 3200, 'highpass');
    this.playTone(420, 0.055, 'triangle', 0.07, 0);
    this.playTone(620, 0.045, 'triangle', 0.05, 0.05);
  },

  playChip() {
    // Tintineo agudo de fichas de póker
    this.playNoise(0.045, 0.035, 0, 4200, 'bandpass');
    this.playTone(1850, 0.06, 'sine', 0.06, 0);
    this.playTone(2450, 0.08, 'sine', 0.05, 0.035);
  },

  playCheck() {
    // Golpe suave en la mesa (Check)
    this.playNoise(0.025, 0.03, 0, 900, 'lowpass');
    this.playTone(170, 0.07, 'sine', 0.11, 0);
    this.playTone(130, 0.06, 'sine', 0.08, 0.06);
  },

  playFold() {
    // Deslizamiento descendente suave
    this.playNoise(0.06, 0.02, 0, 1400, 'lowpass');
    this.playSweep(300, 190, 0.13, 'sine', 0.05, 0);
    this.playTone(210, 0.09, 'sine', 0.04, 0.06);
  },

  playTurn() {
    // Notificación limpia de tu turno
    this.playTone(587.33, 0.12, 'sine', 0.07, 0);
    this.playTone(880, 0.16, 'sine', 0.07, 0.09);
  },

  playWin() {
    // Acorde ascendente de victoria
    this.playTone(523.25, 0.14, 'triangle', 0.08, 0);
    this.playTone(659.25, 0.14, 'triangle', 0.08, 0.09);
    this.playTone(783.99, 0.22, 'triangle', 0.09, 0.18);
    this.playTone(1046.5, 0.3, 'sine', 0.05, 0.28);
  },

  /* ---------- NUEVOS SONIDOS DE INTERFAZ ---------- */

  playClick() {
    if (this.uiThrottle()) return;
    this.playNoise(0.018, 0.03, 0, 3000, 'bandpass');
    this.playTone(920, 0.025, 'square', 0.02, 0);
  },

  playNavigate() {
    if (this.uiThrottle(0.08)) return;
    this.playTone(440, 0.06, 'sine', 0.045, 0);
    this.playTone(660, 0.08, 'sine', 0.04, 0.06);
  },

  playSelect() {
    if (this.uiThrottle()) return;
    this.playTone(1200, 0.04, 'triangle', 0.045, 0);
    this.playTone(1600, 0.045, 'triangle', 0.035, 0.035);
  },

  playCall() {
    this.playNoise(0.04, 0.03, 0, 3800, 'bandpass');
    this.playTone(700, 0.07, 'triangle', 0.06, 0);
    this.playTone(1050, 0.06, 'sine', 0.035, 0.05);
  },

  playRaise() {
    this.playChip();
    this.playSweep(330, 520, 0.14, 'triangle', 0.05, 0.02);
  },

  playAllIn() {
    this.playNoise(0.12, 0.055, 0, 2600, 'bandpass');
    this.playSweep(220, 90, 0.28, 'sawtooth', 0.055, 0);
    this.playTone(1318.5, 0.09, 'sine', 0.055, 0.06);
    this.playTone(1760, 0.14, 'sine', 0.05, 0.12);
  },

  playNewHand() {
    this.playTone(110, 0.13, 'sine', 0.09, 0);
    this.playNoise(0.03, 0.025, 0.09, 3200, 'highpass');
    this.playTone(420, 0.055, 'triangle', 0.07, 0.09);
    this.playTone(620, 0.045, 'triangle', 0.05, 0.14);
  },

  playShowdown() {
    this.playSweep(300, 900, 0.24, 'triangle', 0.055, 0);
    this.playNoise(0.05, 0.025, 0.16, 3600, 'highpass');
    this.playTone(1174.7, 0.12, 'sine', 0.045, 0.2);
  },

  playLose() {
    this.playTone(392, 0.11, 'triangle', 0.055, 0);
    this.playTone(330, 0.11, 'triangle', 0.055, 0.1);
    this.playTone(262, 0.18, 'triangle', 0.05, 0.2);
  },

  playRotate() {
    this.playSweep(180, 760, 0.2, 'triangle', 0.045, 0);
    this.playNoise(0.12, 0.018, 0.05, 1800, 'bandpass');
  },

  playToggle(on) {
    if (on) {
      this.playTone(660, 0.08, 'sine', 0.05, 0);
      this.playTone(990, 0.1, 'sine', 0.045, 0.07);
    } else {
      this.playTone(520, 0.08, 'sine', 0.045, 0);
      this.playTone(330, 0.11, 'sine', 0.04, 0.07);
    }
  },

  playSave() {
    this.playTone(740, 0.06, 'sine', 0.045, 0);
    this.playTone(988, 0.09, 'sine', 0.04, 0.065);
  },

  playToast(type = 'info') {
    if (type === 'success') {
      this.playTone(784, 0.06, 'sine', 0.035, 0);
      this.playTone(1047, 0.08, 'sine', 0.03, 0.055);
    } else if (type === 'error') {
      this.playTone(220, 0.1, 'square', 0.035, 0);
    } else {
      this.playTone(620, 0.05, 'sine', 0.025, 0);
    }
  },

  /* ---------- FEEDBACK DE CALIFICACION DE JUGADAS ---------- */

  // symbol: '!!' | '!' | '✓' | '?!' | '?' | '??'
  playGrade(symbol, isTimeout = false) {
    if (isTimeout) this.playTimeout();
    switch (symbol) {
      case '!!': // Jugada óptima: arpeggio brillante
        this.playTone(523.25, 0.13, 'triangle', 0.075, 0);
        this.playTone(659.25, 0.13, 'triangle', 0.075, 0.07);
        this.playTone(783.99, 0.14, 'triangle', 0.075, 0.14);
        this.playTone(1046.5, 0.28, 'triangle', 0.08, 0.21);
        this.playTone(1567.98, 0.22, 'sine', 0.03, 0.25);
        break;
      case '!': // Excelente: intervalo ascendente
        this.playTone(523.25, 0.12, 'triangle', 0.07, 0);
        this.playTone(783.99, 0.18, 'triangle', 0.07, 0.08);
        break;
      case '✓': // Correcta: confirmación agradable pero sobria
        this.playTone(587.33, 0.1, 'sine', 0.06, 0);
        this.playTone(783.99, 0.13, 'sine', 0.055, 0.075);
        break;
      case '?!': // Imprecisión: dos notas descendentes suaves
        this.playTone(440, 0.1, 'sine', 0.055, 0);
        this.playTone(392, 0.14, 'sine', 0.05, 0.09);
        break;
      case '?': // Error: disonancia
        this.playTone(330, 0.14, 'square', 0.045, 0);
        this.playTone(311, 0.14, 'square', 0.04, 0.015);
        break;
      case '??': // Blunder: buz descendente
        this.playSweep(240, 85, 0.32, 'sawtooth', 0.065, 0);
        this.playNoise(0.1, 0.02, 0, 700, 'lowpass');
        break;
      default:
        this.playTone(659.25, 0.11, 'sine', 0.06, 0);
    }
  },

  playLessonCorrect() {
    this.playTone(523.25, 0.1, 'triangle', 0.06, 0);
    this.playTone(659.25, 0.1, 'triangle', 0.06, 0.07);
    this.playTone(1046.5, 0.2, 'triangle', 0.06, 0.14);
  },

  playLessonWrong() {
    this.playTone(311, 0.12, 'square', 0.04, 0);
    this.playSweep(260, 150, 0.18, 'sine', 0.045, 0.08);
  },

  playSimDone() {
    this.playTone(523.25, 0.09, 'sine', 0.05, 0);
    this.playTone(659.25, 0.09, 'sine', 0.05, 0.07);
    this.playTone(783.99, 0.09, 'sine', 0.05, 0.14);
    this.playTone(1046.5, 0.2, 'sine', 0.05, 0.21);
  },

  /* ---------- RELOJ / TEMPORIZADORES ---------- */

  playTimerTick(secondsLeft) {
    const urgent = secondsLeft <= 5;
    this.playTone(urgent ? 1320 : 1000, 0.025, 'square', urgent ? 0.045 : 0.03, 0);
  },

  playTimerWarning(secondsLeft) {
    const beeps = secondsLeft <= 5 ? 3 : 2;
    const freq = secondsLeft <= 5 ? 1174.7 : 880;
    for (let i = 0; i < beeps; i++) {
      this.playTone(freq, 0.075, 'square', 0.05, i * 0.14);
    }
  },

  playTimeout() {
    this.playSweep(300, 120, 0.35, 'sawtooth', 0.055, 0);
    this.playTone(150, 0.34, 'square', 0.035, 0.02);
    this.playNoise(0.1, 0.02, 0, 500, 'lowpass');
  },

  playCountdownTick(secondsLeft) {
    this.playTone(secondsLeft <= 2 ? 880 : 600, 0.04, 'sine', 0.03, 0);
  }
};
