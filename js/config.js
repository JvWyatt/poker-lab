/* ============================================================================
   10. MÓDULO: CONFIGURACIÓN
============================================================================ */
const config = {
  loadToUI() {
    document.getElementById('cfg-table-size').value = String(appState.config.tableSize);
    document.getElementById('cfg-stack-bb').value = String(appState.config.stackBB);
    document.getElementById('cfg-blinds').value = appState.config.blinds;
    document.getElementById('cfg-four-color').value = String(appState.config.fourColor);
    document.getElementById('cfg-bot-speed').value = String(appState.config.botSpeed);
    document.getElementById('cfg-show-coach').value = String(appState.config.showCoach);
    document.getElementById('cfg-show-profiles').value = String(appState.config.showProfiles);
    document.getElementById('cfg-sound-enabled').value = String(appState.config.soundEnabled !== false);
  },

  saveFromUI() {
    SoundFX.playSave();
    appState.config.tableSize = parseInt(document.getElementById('cfg-table-size').value, 10);
    appState.config.stackBB = parseInt(document.getElementById('cfg-stack-bb').value, 10);
    appState.config.blinds = document.getElementById('cfg-blinds').value;
    appState.config.fourColor = document.getElementById('cfg-four-color').value === 'true';
    appState.config.botSpeed = parseInt(document.getElementById('cfg-bot-speed').value, 10);
    appState.config.showCoach = document.getElementById('cfg-show-coach').value === 'true';
    appState.config.showProfiles = document.getElementById('cfg-show-profiles').value === 'true';
    appState.config.soundEnabled = document.getElementById('cfg-sound-enabled').value === 'true';
    saveState();
    SoundFX.updateButtonUI();
    lab.renderSlots();
    if (game.initialized) {
      game.updateProfileButtonLabel();
      game.changeTableSize(appState.config.tableSize);
    }
    showToast('Configuración guardada.', 'success');
  },

  resetAllData() {
    SoundFX.playToggle(false);
    localStorage.removeItem(STORAGE_KEY);
    appState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    saveState();
    SoundFX.updateButtonUI();
    this.loadToUI();
    academia.render();
    stats.render();
    if (game.initialized) {
      game.updateProfileButtonLabel();
      game.changeTableSize(appState.config.tableSize);
    }
    showToast('Todos los datos locales han sido restablecidos.', 'info');
  }
};
