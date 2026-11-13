// client/src/components/nombot/useAudioManager.js
// Backward-compatible wrapper mapping to the central sound manager
import { useSound } from "./useSound";

export function useAudioManager() {
  const soundControls = useSound();

  return {
    ...soundControls,
    bgmEnabled: soundControls.musicEnabled,
    sfxEnabled: soundControls.effectsEnabled,
    bgmVolume: soundControls.musicVolume / 100,
    sfxVolume: soundControls.effectsVolume / 100,
    playSfx: (type) => soundControls.play(type),
    toggleBgm: () => soundControls.toggleMusic(),
    setBgmVolume: (vol) => soundControls.setMusicVolume(Math.round(vol * 100)),
    toggleSfx: () => soundControls.toggleEffects(),
    setSfxVolume: (vol) => soundControls.setEffectsVolume(Math.round(vol * 100)),
    toggleMute: () => soundControls.toggleMute(),
  };
}

export default useAudioManager;
