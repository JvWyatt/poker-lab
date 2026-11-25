/* ============================================================================
   11. INICIALIZACIÓN AL CARGAR LA PÁGINA
============================================================================ */

// Habilita el audio en la primera interacción real (requisito de los navegadores).
function activateAudioOnFirstInput() {
  SoundFX.activate();
  window.removeEventListener('pointerdown', activateAudioOnFirstInput);
  window.removeEventListener('keydown', activateAudioOnFirstInput);
}
window.addEventListener('pointerdown', activateAudioOnFirstInput);
window.addEventListener('keydown', activateAudioOnFirstInput);

window.addEventListener('DOMContentLoaded', () => {
  config.loadToUI();
  arena.updateInfo();
  updateGlobalBadges();
  academia.init();
  academia.render();
  lab.init();
  gtoView.render();
  app.navigate('dashboard');
});
