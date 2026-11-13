// client/src/utils/sound.js
// Central Sound Manager for Nom-Bot Food Guardian
// Supports Web Audio API, preloaded audio files, 500ms music fading,
// duplicate throttling/restart, loop management, page visibility handling,
// prefers-reduced-motion detection, and zero-console-error silent fallbacks.

const SOUND_FILES = {
  click: ["/sounds/click.mp3", "/sounds/click.ogg"],
  upload: ["/sounds/upload.mp3", "/sounds/upload.ogg"],
  scanStart: ["/sounds/scanStart.mp3", "/sounds/scanStart.ogg"],
  resultFresh: ["/sounds/resultFresh.mp3", "/sounds/resultFresh.ogg"],
  resultUseSoon: ["/sounds/resultUseSoon.mp3", "/sounds/resultUseSoon.ogg"],
  resultExpired: ["/sounds/resultExpired.mp3", "/sounds/resultExpired.ogg"],
  save: ["/sounds/save.mp3", "/sounds/save.ogg"],
  feed: ["/sounds/feed.mp3", "/sounds/feed.ogg"],
  error: ["/sounds/error.mp3", "/sounds/error.ogg"],
  music: ["/sounds/music.mp3", "/sounds/music.ogg", "/sounds/background.mp3"],
};

// Relative volume normalization to avoid harsh peaks
const NORMALIZED_LEVELS = {
  click: 0.35,
  upload: 0.5,
  scanStart: 0.3,
  resultFresh: 0.55,
  resultUseSoon: 0.5,
  resultExpired: 0.45,
  save: 0.55,
  feed: 0.5,
  error: 0.4,
  music: 0.3,
};

class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.effectsGain = null;
    this.compressor = null;

    // Loaded AudioBuffers { [name]: AudioBuffer }
    this.audioBuffers = new Map();
    // Failed sound files that shouldn't be retried
    this.unavailableSounds = new Set();
    // Active loops { [name]: { source, gainNode, isSynth, stopFn } }
    this.activeLoops = new Map();
    // Currently playing one-shot sources for restart / throttle
    this.activeSources = new Map();
    this.lastPlayTime = new Map();

    // Background music reference
    this.bgmAudioElement = null;
    this.bgmSourceNode = null;
    this.bgmSynthInterval = null;
    this.isMusicPlaying = false;
    this.isFading = false;

    // Listeners for React state sync
    this.listeners = new Set();

    // Load initial settings with prompt defaults
    // Default music volume 20%, effects volume 50%
    const saved = this.loadStoredSettings();
    this.settings = {
      musicEnabled: saved.musicEnabled ?? false,
      effectsEnabled: saved.effectsEnabled ?? true,
      musicVolume: saved.musicVolume ?? 20, // 0 - 100
      effectsVolume: saved.effectsVolume ?? 50, // 0 - 100
      isMuted: saved.isMuted ?? false,
    };

    // Autoplay & Accessibility tracking
    this.hasUserInteracted = false;
    this.prefersReducedMotion = false;
    this.isTabHidden = false;

    if (typeof window !== "undefined") {
      this.initAccessibility();
      this.initAutoplayUnlock();
      this.initVisibilityListener();
      // Preload in background
      this.preloadAll();
    }
  }

  // --- Settings & Persistence ---

  loadStoredSettings() {
    try {
      const raw =
        localStorage.getItem("nombot_sound_settings") ||
        localStorage.getItem("nombot_audio_settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          musicEnabled: parsed.musicEnabled ?? parsed.bgmEnabled,
          effectsEnabled: parsed.effectsEnabled ?? parsed.sfxEnabled,
          musicVolume:
            typeof parsed.musicVolume === "number"
              ? parsed.musicVolume
              : typeof parsed.bgmVolume === "number"
              ? Math.round(parsed.bgmVolume * 100)
              : 20,
          effectsVolume:
            typeof parsed.effectsVolume === "number"
              ? parsed.effectsVolume
              : typeof parsed.sfxVolume === "number"
              ? Math.round(parsed.sfxVolume * 100)
              : 50,
          isMuted: parsed.isMuted,
        };
      }
    } catch (_) {}
    return {};
  }

  saveSettings() {
    try {
      localStorage.setItem("nombot_sound_settings", JSON.stringify(this.settings));
      // Keep legacy format updated for backwards compatibility
      localStorage.setItem(
        "nombot_audio_settings",
        JSON.stringify({
          bgmEnabled: this.settings.musicEnabled,
          sfxEnabled: this.settings.effectsEnabled,
          bgmVolume: this.settings.musicVolume / 100,
          sfxVolume: this.settings.effectsVolume / 100,
          isMuted: this.settings.isMuted,
        })
      );
    } catch (_) {}
    this.applyVolumes();
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const snapshot = { ...this.settings };
    this.listeners.forEach((fn) => {
      try {
        fn(snapshot);
      } catch (_) {}
    });
  }

  // --- Web Audio Initialization ---

  getAudioContext() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();

        // Dynamics compressor to prevent clipping and normalize harsh peaks
        this.compressor = this.audioCtx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-18, this.audioCtx.currentTime);
        this.compressor.knee.setValueAtTime(12, this.audioCtx.currentTime);
        this.compressor.ratio.setValueAtTime(8, this.audioCtx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.audioCtx.currentTime);
        this.compressor.release.setValueAtTime(0.2, this.audioCtx.currentTime);

        this.masterGain = this.audioCtx.createGain();
        this.musicGain = this.audioCtx.createGain();
        this.effectsGain = this.audioCtx.createGain();

        // Chain: effects -> effectsGain -> masterGain -> compressor -> destination
        this.effectsGain.connect(this.masterGain);
        // Chain: music -> musicGain -> masterGain -> compressor -> destination
        this.musicGain.connect(this.masterGain);

        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.audioCtx.destination);

        this.applyVolumes();
      }
    }

    if (this.audioCtx && this.audioCtx.state === "suspended" && this.hasUserInteracted) {
      this.audioCtx.resume().catch(() => {});
    }

    return this.audioCtx;
  }

  applyVolumes() {
    const ctx = this.audioCtx;
    if (!ctx) return;

    const isMuted = this.settings.isMuted || this.prefersReducedMotion;
    const now = ctx.currentTime;

    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(isMuted ? 0 : 1, now);
    }

    if (this.musicGain && !this.isFading) {
      const targetMusic = (this.settings.musicVolume / 100) * NORMALIZED_LEVELS.music;
      this.musicGain.gain.setValueAtTime(isMuted ? 0 : targetMusic, now);
    }

    if (this.effectsGain) {
      const targetSfx = this.settings.effectsVolume / 100;
      this.effectsGain.gain.setValueAtTime(isMuted ? 0 : targetSfx, now);
    }

    if (this.bgmAudioElement && !this.isFading) {
      this.bgmAudioElement.volume = isMuted
        ? 0
        : Math.max(0, Math.min(1, (this.settings.musicVolume / 100) * NORMALIZED_LEVELS.music));
    }
  }

  // --- Browser Autoplay & Accessibility ---

  initAutoplayUnlock() {
    const unlock = () => {
      if (this.hasUserInteracted) return;
      this.hasUserInteracted = true;

      const ctx = this.getAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      // If background music is enabled in settings, start it now on first user interaction
      if (this.settings.musicEnabled && !this.settings.isMuted && !this.prefersReducedMotion) {
        this.startMusic();
      }

      // Remove listeners once unlocked
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("click", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      window.removeEventListener("touchstart", unlock, true);
    };

    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("click", unlock, true);
    window.addEventListener("keydown", unlock, true);
    window.addEventListener("touchstart", unlock, true);
  }

  initAccessibility() {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.prefersReducedMotion = query.matches;

    const handleChange = (e) => {
      this.prefersReducedMotion = e.matches;
      if (this.prefersReducedMotion) {
        this.stopMusic(true);
        this.stopAllLoops();
      } else if (this.settings.musicEnabled && !this.settings.isMuted && this.hasUserInteracted) {
        this.startMusic();
      }
      this.applyVolumes();
    };

    if (query.addEventListener) {
      query.addEventListener("change", handleChange);
    } else if (query.addListener) {
      query.addListener(handleChange);
    }
  }

  initVisibilityListener() {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.isTabHidden = true;
        // Pause music while tab is hidden
        if (this.isMusicPlaying) {
          this.pauseMusicForTab();
        }
      } else {
        this.isTabHidden = false;
        // Resume music if enabled and user has interacted
        if (
          this.settings.musicEnabled &&
          !this.settings.isMuted &&
          !this.prefersReducedMotion &&
          this.hasUserInteracted
        ) {
          this.startMusic();
        }
      }
    });
  }

  // --- Sound Preloading (Silent on 404) ---

  async preloadAll() {
    if (typeof window === "undefined") return;

    for (const [name, urls] of Object.entries(SOUND_FILES)) {
      if (name === "music") continue; // Music handled separately for streaming
      this.preloadSound(name, urls).catch(() => {});
    }
  }

  async preloadSound(name, urls) {
    if (this.audioBuffers.has(name) || this.unavailableSounds.has(name)) return;

    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const arrayBuffer = await res.arrayBuffer();
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        this.audioBuffers.set(name, audioBuffer);
        return;
      } catch (_) {
        // Silently skip without logging console errors
      }
    }
    // If none of the URLs resolved, mark as unavailable so fallbacks are used immediately
    this.unavailableSounds.add(name);
  }

  // --- Playback API ---

  // play(name) - plays effect, handles throttling & restarts overlapping duplicates
  play(name) {
    if (
      !this.settings.effectsEnabled ||
      this.settings.isMuted ||
      this.prefersReducedMotion
    ) {
      return;
    }

    const now = Date.now();
    const last = this.lastPlayTime.get(name) || 0;
    // Throttle clicks or identical rapid triggers (under 40ms)
    if (now - last < 40) return;
    this.lastPlayTime.set(name, now);

    const ctx = this.getAudioContext();
    if (!ctx) return;

    // Prevent overlapping duplicates: restart active instance of this sound
    const active = this.activeSources.get(name);
    if (active) {
      try {
        active.stop();
        active.disconnect();
      } catch (_) {}
      this.activeSources.delete(name);
    }

    // 1. Try playing preloaded AudioBuffer
    const buffer = this.audioBuffers.get(name);
    if (buffer) {
      try {
        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const gainNode = ctx.createGain();
        const scale = NORMALIZED_LEVELS[name] || 0.5;
        gainNode.gain.setValueAtTime(scale, ctx.currentTime);

        source.connect(gainNode);
        gainNode.connect(this.effectsGain);

        source.onended = () => {
          if (this.activeSources.get(name) === source) {
            this.activeSources.delete(name);
          }
        };

        source.start();
        this.activeSources.set(name, source);
        return;
      } catch (_) {}
    }

    // 2. If no buffer yet, play pure synthesized sound effect (fails silently with high fidelity)
    this.playSynthesizedSfx(name);
  }

  // startLoop(name) - scanning hum or background loop
  startLoop(name) {
    if (
      !this.settings.effectsEnabled ||
      this.settings.isMuted ||
      this.prefersReducedMotion
    ) {
      return;
    }

    if (this.activeLoops.has(name)) return; // already looping

    const ctx = this.getAudioContext();
    if (!ctx) return;

    const buffer = this.audioBuffers.get(name);
    if (buffer) {
      try {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const gainNode = ctx.createGain();
        const targetVol = NORMALIZED_LEVELS[name] || 0.4;
        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 0.15);

        source.connect(gainNode);
        gainNode.connect(this.effectsGain);

        source.start();
        this.activeLoops.set(name, {
          source,
          gainNode,
          isSynth: false,
        });
        return;
      } catch (_) {}
    }

    // Fallback synthesized loop (e.g. scanning hum)
    if (name === "scanStart") {
      this.startSynthScanLoop();
    }
  }

  // stopLoop(name) - stops and fades out active loop
  stopLoop(name) {
    const loop = this.activeLoops.get(name);
    if (!loop) return;

    this.activeLoops.delete(name);

    if (loop.isSynth && loop.stopFn) {
      loop.stopFn();
      return;
    }

    try {
      const ctx = this.audioCtx;
      if (ctx && loop.gainNode) {
        loop.gainNode.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
        setTimeout(() => {
          try {
            loop.source.stop();
            loop.source.disconnect();
          } catch (_) {}
        }, 120);
      } else {
        loop.source.stop();
      }
    } catch (_) {}
  }

  stopAllLoops() {
    const names = Array.from(this.activeLoops.keys());
    names.forEach((name) => this.stopLoop(name));
  }

  // --- Background Music System (500ms Fade In / Fade Out) ---

  startMusic() {
    if (
      !this.settings.musicEnabled ||
      this.settings.isMuted ||
      this.prefersReducedMotion ||
      this.isTabHidden ||
      this.isMusicPlaying
    ) {
      return;
    }

    this.isMusicPlaying = true;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    // Target volume computed from settings (0-100)
    const targetGain = (this.settings.musicVolume / 100) * NORMALIZED_LEVELS.music;

    // Try HTML5 Audio element for streaming music file
    if (!this.bgmAudioElement) {
      const audio = new Audio();
      audio.loop = true;
      audio.preload = "auto";
      audio.crossOrigin = "anonymous";
      this.bgmAudioElement = audio;

      // Fail silently without console error if file doesn't exist
      audio.onerror = () => {
        this.bgmAudioElement = null;
        if (this.isMusicPlaying && !this.bgmSynthInterval) {
          this.startSynthBgm();
        }
      };

      // Try music URLs
      const urls = SOUND_FILES.music;
      audio.src = urls[0];
    }

    if (this.bgmAudioElement) {
      this.isFading = true;
      this.bgmAudioElement.volume = 0;

      const playPromise = this.bgmAudioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Fade in over 500ms
            let startTime = null;
            const duration = 500;
            const animateFadeIn = (timestamp) => {
              if (!startTime) startTime = timestamp;
              const elapsed = timestamp - startTime;
              const progress = Math.min(1, elapsed / duration);
              if (this.bgmAudioElement) {
                this.bgmAudioElement.volume = targetGain * progress;
              }
              if (progress < 1 && this.isMusicPlaying) {
                requestAnimationFrame(animateFadeIn);
              } else {
                this.isFading = false;
                this.applyVolumes();
              }
            };
            requestAnimationFrame(animateFadeIn);
          })
          .catch(() => {
            // Autoplay blocked or file missing -> fall back to ambient Web Audio synth
            this.startSynthBgm();
          });
      } else {
        this.startSynthBgm();
      }
    } else {
      this.startSynthBgm();
    }
  }

  stopMusic(immediate = false) {
    if (!this.isMusicPlaying && !this.bgmSynthInterval) return;
    this.isMusicPlaying = false;

    if (this.bgmAudioElement) {
      if (immediate) {
        this.bgmAudioElement.pause();
        this.bgmAudioElement.currentTime = 0;
        this.isFading = false;
      } else {
        // Fade out over ~500ms instead of cutting it
        this.isFading = true;
        const initialVol = this.bgmAudioElement.volume;
        let startTime = null;
        const duration = 500;

        const animateFadeOut = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(1, elapsed / duration);
          if (this.bgmAudioElement) {
            this.bgmAudioElement.volume = Math.max(0, initialVol * (1 - progress));
          }
          if (progress < 1) {
            requestAnimationFrame(animateFadeOut);
          } else {
            if (this.bgmAudioElement) {
              this.bgmAudioElement.pause();
              this.bgmAudioElement.currentTime = 0;
            }
            this.isFading = false;
          }
        };
        requestAnimationFrame(animateFadeOut);
      }
    }

    this.stopSynthBgm(immediate);
  }

  pauseMusicForTab() {
    if (this.bgmAudioElement) {
      this.bgmAudioElement.pause();
    }
    this.stopSynthBgm(true);
  }

  // Gentle ambient cooking game chord arpeggio via Web Audio API (zero audio file required)
  startSynthBgm() {
    const ctx = this.getAudioContext();
    if (!ctx || this.bgmSynthInterval) return;

    this.isMusicPlaying = true;
    const chords = [
      [261.63, 329.63, 392.0], // C
      [293.66, 349.23, 440.0], // Dm
      [329.63, 392.0, 493.88], // Em
      [261.63, 349.23, 440.0], // F
    ];

    let chordIdx = 0;
    let noteIdx = 0;

    this.bgmSynthInterval = setInterval(() => {
      if (
        !this.isMusicPlaying ||
        this.settings.isMuted ||
        !this.settings.musicEnabled ||
        this.prefersReducedMotion ||
        this.isTabHidden
      ) {
        return;
      }

      try {
        const chord = chords[chordIdx % chords.length];
        const freq = chord[noteIdx % chord.length];

        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const vol = (this.settings.musicVolume / 100) * 0.12;
        noteGain.gain.setValueAtTime(0.0001, ctx.currentTime);
        noteGain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.08);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.42);

        osc.connect(noteGain);
        noteGain.connect(this.musicGain);

        osc.start();
        osc.stop(ctx.currentTime + 0.45);

        noteIdx++;
        if (noteIdx >= 4) {
          noteIdx = 0;
          chordIdx++;
        }
      } catch (_) {}
    }, 450);
  }

  stopSynthBgm(immediate = false) {
    if (this.bgmSynthInterval) {
      clearInterval(this.bgmSynthInterval);
      this.bgmSynthInterval = null;
    }
  }

  // --- External Controls API ---

  setMusicVolume(volume) {
    // Volume: 0 - 100
    const clamped = Math.max(0, Math.min(100, Math.round(volume)));
    this.settings.musicVolume = clamped;
    this.saveSettings();
  }

  setEffectsVolume(volume) {
    // Volume: 0 - 100
    const clamped = Math.max(0, Math.min(100, Math.round(volume)));
    this.settings.effectsVolume = clamped;
    this.saveSettings();
  }

  setMusicEnabled(enabled) {
    this.settings.musicEnabled = Boolean(enabled);
    this.saveSettings();
    if (this.settings.musicEnabled && !this.settings.isMuted && this.hasUserInteracted) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  setEffectsEnabled(enabled) {
    this.settings.effectsEnabled = Boolean(enabled);
    this.saveSettings();
    if (!this.settings.effectsEnabled) {
      this.stopAllLoops();
    }
  }

  toggleMusic() {
    this.setMusicEnabled(!this.settings.musicEnabled);
  }

  toggleEffects() {
    this.setEffectsEnabled(!this.settings.effectsEnabled);
  }

  toggleMute() {
    this.setMuted(!this.settings.isMuted);
  }

  setMuted(muted) {
    this.settings.isMuted = Boolean(muted);
    this.saveSettings();
    if (this.settings.isMuted) {
      this.stopMusic(true);
      this.stopAllLoops();
    } else if (this.settings.musicEnabled && this.hasUserInteracted) {
      this.startMusic();
    }
  }

  // --- Synthesized Audio Fallbacks (Quiet, Pleasant, No Harsh Peaks) ---

  playSynthesizedSfx(type) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const baseVol = (this.settings.effectsVolume / 100) * (NORMALIZED_LEVELS[type] || 0.4);

    switch (type) {
      case "click": {
        // Soft wooden / mechanical tick (clean, non-fatiguing)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(this.effectsGain);

        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.025);

        gain.gain.setValueAtTime(baseVol * 0.45, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.025);

        osc.start();
        osc.stop(ctx.currentTime + 0.025);
        break;
      }

      case "upload":
      case "upload-pop": {
        // Soft bubble pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(this.effectsGain);

        osc.type = "sine";
        osc.frequency.setValueAtTime(360, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(820, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(baseVol * 0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

        osc.start();
        osc.stop(ctx.currentTime + 0.08);
        break;
      }

      case "resultFresh":
      case "success": {
        // Upbeat gentle 3-note major chime: C5 (523Hz), E5 (659Hz), G5 (784Hz)
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(this.effectsGain);

          osc.type = "sine";
          const t = ctx.currentTime + idx * 0.09;
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(baseVol * 0.4, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);

          osc.start(t);
          osc.stop(t + 0.35);
        });
        break;
      }

      case "resultUseSoon":
      case "warning": {
        // Gentle neutral two-tone bell (E5 -> B4)
        const notes = [659.25, 493.88];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(this.effectsGain);

          osc.type = "sine";
          const t = ctx.currentTime + idx * 0.12;
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(baseVol * 0.4, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);

          osc.start(t);
          osc.stop(t + 0.3);
        });
        break;
      }

      case "resultExpired":
      case "spoiled": {
        // Soft low descending warm tone (no harsh screech)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(this.effectsGain);

        osc.type = "sine";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(146.83, ctx.currentTime + 0.28);

        gain.gain.setValueAtTime(baseVol * 0.45, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);

        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        break;
      }

      case "save":
      case "inventory-added": {
        // Sparkling reward chime: G5 -> C6 -> E6
        const notes = [783.99, 1046.5, 1318.51];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(this.effectsGain);

          osc.type = "sine";
          const t = ctx.currentTime + idx * 0.08;
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(baseVol * 0.4, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

          osc.start(t);
          osc.stop(t + 0.35);
        });
        break;
      }

      case "feed": {
        // Short cartoon chomp / chew
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        filter.type = "bandpass";
        filter.frequency.setValueAtTime(600, ctx.currentTime);
        filter.Q.setValueAtTime(3, ctx.currentTime);

        osc.type = "triangle";
        osc.frequency.setValueAtTime(240, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(baseVol * 0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.effectsGain);

        osc.start();
        osc.stop(ctx.currentTime + 0.12);
        break;
      }

      case "error": {
        // Soft low tone (140Hz -> 110Hz, warm and gentle)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(this.effectsGain);

        osc.type = "sine";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.22);

        gain.gain.setValueAtTime(baseVol * 0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);

        osc.start();
        osc.stop(ctx.currentTime + 0.22);
        break;
      }

      default:
        break;
    }
  }

  // Scanning loop procedural hum
  startSynthScanLoop() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(160, ctx.currentTime);

      // Subtle LFO modulation (2Hz warble)
      lfo.frequency.setValueAtTime(2.5, ctx.currentTime);
      lfoGain.gain.setValueAtTime(15, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const targetVol = (this.settings.effectsVolume / 100) * NORMALIZED_LEVELS.scanStart;
      gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 0.2);

      osc.connect(gainNode);
      gainNode.connect(this.effectsGain);

      osc.start();
      lfo.start();

      const stopFn = () => {
        try {
          gainNode.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
          setTimeout(() => {
            try {
              osc.stop();
              lfo.stop();
              osc.disconnect();
              lfo.disconnect();
            } catch (_) {}
          }, 120);
        } catch (_) {}
      };

      this.activeLoops.set("scanStart", {
        source: osc,
        gainNode,
        isSynth: true,
        stopFn,
      });
    } catch (_) {}
  }
}

// Singleton Sound Manager Instance
export const sound = new SoundManager();

export default sound;
