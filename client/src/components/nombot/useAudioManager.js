// client/src/components/nombot/useAudioManager.js
import { useState, useEffect } from "react";
import { audioManager } from "./AudioManager";

export function useAudioManager() {
  const [settings, setSettings] = useState(audioManager.settings);

  useEffect(() => {
    const unsubscribe = audioManager.subscribe((newSettings) => {
      setSettings(newSettings);
    });
    return unsubscribe;
  }, []);

  return {
    ...settings,
    playSfx: (type) => audioManager.playSfx(type),
    toggleBgm: () => audioManager.toggleBgm(),
    setBgmVolume: (vol) => audioManager.setBgmVolume(vol),
    toggleSfx: () => audioManager.toggleSfx(),
    setSfxVolume: (vol) => audioManager.setSfxVolume(vol),
    toggleMute: () => audioManager.toggleMute(),
  };
}
