// client/src/components/nombot/AudioManager.js
// Complete Audio Manager with HTML5 Audio + Web Audio API synthesized fallback

class AudioManagerService {
  constructor() {
    this.audioCtx = null;
    this.bgmAudio = null;
    this.bgmGainNode = null;
    this.bgmInterval = null;
    this.isBgmPlaying = false;

    // Load preferences from localStorage
    const saved = localStorage.getItem("nombot_audio_settings");
    const settings = saved
      ? JSON.parse(saved)
      : {
          bgmEnabled: false,
          sfxEnabled: true,
          bgmVolume: 0.15,
          sfxVolume: 0.5,
          isMuted: false,
        };

    this.settings = settings;
    this.listeners = new Set();
  }

  saveSettings() {
    localStorage.setItem("nombot_audio_settings", JSON.stringify(this.settings));
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    for (const listener of this.listeners) {
      listener({ ...this.settings });
    }
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // --- Background Music System ---

  initBgm() {
    if (this.bgmAudio) return;
    this.bgmAudio = new Audio("/sounds/background.mp3");
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = this.settings.isMuted ? 0 : this.settings.bgmVolume;

    // If external file fails or doesn't exist, we synthesize a gentle ambient loop
    this.bgmAudio.onerror = () => {
      console.log("ℹ️ /sounds/background.mp3 not found. Falling back to ambient Web Audio synth.");
      this.bgmAudio = null;
      if (this.settings.bgmEnabled && !this.settings.isMuted) {
        this.startSynthBgm();
      }
    };
  }

  toggleBgm() {
    this.settings.bgmEnabled = !this.settings.bgmEnabled;
    this.saveSettings();

    if (this.settings.bgmEnabled) {
      this.playBgm();
    } else {
      this.stopBgm();
    }
  }

  setBgmVolume(volume) {
    this.settings.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.settings.isMuted ? 0 : this.settings.bgmVolume;
    }
    if (this.bgmGainNode && this.audioCtx) {
      this.bgmGainNode.gain.setValueAtTime(
        this.settings.isMuted ? 0 : this.settings.bgmVolume * 0.25,
        this.audioCtx.currentTime
      );
    }
    this.saveSettings();
  }

  setSfxVolume(volume) {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  toggleSfx() {
    this.settings.sfxEnabled = !this.settings.sfxEnabled;
    this.saveSettings();
  }

  toggleMute() {
    this.settings.isMuted = !this.settings.isMuted;
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.settings.isMuted ? 0 : this.settings.bgmVolume;
    }
    if (this.bgmGainNode && this.audioCtx) {
      this.bgmGainNode.gain.setValueAtTime(
        this.settings.isMuted ? 0 : this.settings.bgmVolume * 0.25,
        this.audioCtx.currentTime
      );
    }
    this.saveSettings();
  }

  playBgm() {
    if (!this.settings.bgmEnabled || this.settings.isMuted || this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.initBgm();

    if (this.bgmAudio) {
      // Fade in HTML5 audio
      this.bgmAudio.volume = 0;
      this.bgmAudio
        .play()
        .then(() => {
          let vol = 0;
          const target = this.settings.bgmVolume;
          const step = target / 20;
          const fade = setInterval(() => {
            vol += step;
            if (vol >= target) {
              if (this.bgmAudio) this.bgmAudio.volume = target;
              clearInterval(fade);
            } else if (this.bgmAudio) {
              this.bgmAudio.volume = vol;
            }
          }, 50);
        })
        .catch(() => {
          this.startSynthBgm();
        });
    } else {
      this.startSynthBgm();
    }
  }

  stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmAudio) {
      let vol = this.bgmAudio.volume;
      const step = vol / 15;
      const fade = setInterval(() => {
        vol -= step;
        if (vol <= 0.01) {
          if (this.bgmAudio) {
            this.bgmAudio.pause();
            this.bgmAudio.currentTime = 0;
          }
          clearInterval(fade);
        } else if (this.bgmAudio) {
          this.bgmAudio.volume = vol;
        }
      }, 40);
    }
    this.stopSynthBgm();
  }

  // Fallback procedural cooking-game ambient melody using Web Audio API
  startSynthBgm() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    this.stopSynthBgm();

    this.bgmGainNode = ctx.createGain();
    const effectiveVol = this.settings.isMuted ? 0 : this.settings.bgmVolume * 0.15;
    this.bgmGainNode.gain.setValueAtTime(effectiveVol, ctx.currentTime);
    this.bgmGainNode.connect(ctx.destination);

    // Warm pentatonic arpeggio (C Major: C, D, E, G, A)
    const notes = [261.63, 329.63, 392.0, 523.25, 440.0, 392.0, 329.63, 293.66];
    let step = 0;

    this.bgmInterval = setInterval(() => {
      if (!this.isBgmPlaying || this.settings.isMuted) return;
      try {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(notes[step % notes.length], ctx.currentTime);

        noteGain.gain.setValueAtTime(0.001, ctx.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

        osc.connect(noteGain);
        noteGain.connect(this.bgmGainNode);

        osc.start();
        osc.stop(ctx.currentTime + 0.4);

        step++;
      } catch (e) {
        // audio context handling
      }
    }, 450);
  }

  stopSynthBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  // --- Sound Effects System ---

  playSfx(type) {
    if (!this.settings.sfxEnabled || this.settings.isMuted) return;

    // Try HTML5 Audio file first, fallback to Web Audio synthesizer
    const audioPath = `/sounds/${type}.mp3`;
    const audio = new Audio(audioPath);
    audio.volume = this.settings.sfxVolume;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback to pure Web Audio API synthesizer
        this.playSynthesizedSfx(type);
      });
    }
  }

  playSynthesizedSfx(type) {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const vol = this.settings.sfxVolume;

    switch (type) {
      case "welcome": {
        // Bright 3-note greeting chime (F5 -> A5 -> C6)
        const notes = [698.46, 880.0, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "sine";
          const t = ctx.currentTime + idx * 0.12;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(vol * 0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
          osc.start(t);
          osc.stop(t + 0.35);
        });
        break;
      }

      case "upload-pop": {
        // Soft bubble pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(vol * 0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
        break;
      }

      case "upload-success": {
        // Upbeat double chime
        const notes = [587.33, 880.0];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "sine";
          const t = ctx.currentTime + idx * 0.08;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(vol * 0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
          osc.start(t);
          osc.stop(t + 0.25);
        });
        break;
      }

      case "scanning": {
        // Electronic scanning pulse
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(750, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(vol * 0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
        break;
      }

      case "processing": {
        // Sci-fi data crunching chirp
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(vol * 0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
        break;
      }

      case "success": {
        // Major fanfare victory arpeggio: C5 - E5 - G5 - C6
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "sine";
          const t = ctx.currentTime + idx * 0.1;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(vol * 0.35, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
          osc.start(t);
          osc.stop(t + 0.35);
        });
        break;
      }

      case "warning": {
        // Gentle two-tone warning
        const notes = [440.0, 370.0];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "sine";
          const t = ctx.currentTime + idx * 0.18;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(vol * 0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
          osc.start(t);
          osc.stop(t + 0.25);
        });
        break;
      }

      case "spoiled": {
        // Funny cartoon wobble descending slide ("womp womp")
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(260, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.45);
        gain.gain.setValueAtTime(vol * 0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
        break;
      }

      case "inventory-added": {
        // High sparkling coin/reward sound
        const notes = [987.77, 1318.51];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = "sine";
          const t = ctx.currentTime + idx * 0.1;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(vol * 0.35, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
          osc.start(t);
          osc.stop(t + 0.4);
        });
        break;
      }

      case "error": {
        // Low soft error buzz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "square";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(130, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(vol * 0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
        break;
      }

      default:
        break;
    }
  }
}

export const audioManager = new AudioManagerService();
