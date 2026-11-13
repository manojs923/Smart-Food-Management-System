// client/src/components/nombot/AudioManager.js
// Backward-compatible redirect to the central sound manager module
import sound from "../../utils/sound";

export const audioManager = {
  get settings() {
    return {
      bgmEnabled: sound.settings.musicEnabled,
      sfxEnabled: sound.settings.effectsEnabled,
      bgmVolume: sound.settings.musicVolume / 100,
      sfxVolume: sound.settings.effectsVolume / 100,
      isMuted: sound.settings.isMuted,
    };
  },
  subscribe: (listener) => sound.subscribe(listener),
  playSfx: (type) => sound.play(type),
  toggleBgm: () => sound.toggleMusic(),
  setBgmVolume: (vol) => sound.setMusicVolume(Math.round(vol * 100)),
  toggleSfx: () => sound.toggleEffects(),
  setSfxVolume: (vol) => sound.setEffectsVolume(Math.round(vol * 100)),
  toggleMute: () => sound.toggleMute(),
  playBgm: () => sound.startMusic(),
  stopBgm: () => sound.stopMusic(),
};

export default audioManager;
