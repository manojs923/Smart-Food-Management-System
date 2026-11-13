// client/src/components/nombot/useSound.js
import { useState, useEffect, useCallback } from "react";
import sound from "../../utils/sound";

export function useSound() {
  const [settings, setSettings] = useState(() => ({ ...sound.settings }));

  useEffect(() => {
    const unsubscribe = sound.subscribe((updated) => {
      setSettings(updated);
    });
    return unsubscribe;
  }, []);

  const play = useCallback((name) => {
    sound.play(name);
  }, []);

  const startLoop = useCallback((name) => {
    sound.startLoop(name);
  }, []);

  const stopLoop = useCallback((name) => {
    sound.stopLoop(name);
  }, []);

  const setMusicVolume = useCallback((vol) => {
    sound.setMusicVolume(vol);
  }, []);

  const setEffectsVolume = useCallback((vol) => {
    sound.setEffectsVolume(vol);
  }, []);

  const setMusicEnabled = useCallback((enabled) => {
    sound.setMusicEnabled(enabled);
  }, []);

  const setEffectsEnabled = useCallback((enabled) => {
    sound.setEffectsEnabled(enabled);
  }, []);

  const toggleMusic = useCallback(() => {
    sound.toggleMusic();
  }, []);

  const toggleEffects = useCallback(() => {
    sound.toggleEffects();
  }, []);

  const toggleMute = useCallback(() => {
    sound.toggleMute();
  }, []);

  const setMuted = useCallback((muted) => {
    sound.setMuted(muted);
  }, []);

  return {
    ...settings,
    play,
    startLoop,
    stopLoop,
    setMusicVolume,
    setEffectsVolume,
    setMusicEnabled,
    setEffectsEnabled,
    toggleMusic,
    toggleEffects,
    toggleMute,
    setMuted,
  };
}

export default useSound;
