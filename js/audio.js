/* ============================================
   AUDIO.JS — Web Audio API Sound Synthesizer
   ============================================ */

const SoundEngine = (function () {
  let audioCtx = null;
  let muted = localStorage.getItem("quiz_sound_muted") === "true";

  function getContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function isMuted() {
    return muted;
  }

  function toggleMute() {
    muted = !muted;
    localStorage.setItem("quiz_sound_muted", muted);
    return muted;
  }

  function playTone(freq, type = "sine", duration = 0.1, gainVal = 0.15, delay = 0) {
    if (muted) return;
    try {
      const ctx = getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    } catch (e) {
      console.warn("Audio play error:", e);
    }
  }

  return {
    isMuted,
    toggleMute,
    click: function () {
      playTone(600, "sine", 0.05, 0.08);
    },
    correct: function () {
      // Pleasant two-tone melody
      playTone(523.25, "sine", 0.12, 0.18, 0); // C5
      playTone(659.25, "sine", 0.18, 0.18, 0.1); // E5
      playTone(783.99, "sine", 0.25, 0.2, 0.2); // G5
    },
    incorrect: function () {
      // Gentle warning chord
      playTone(311.13, "triangle", 0.15, 0.15, 0); // Eb4
      playTone(293.66, "sawtooth", 0.25, 0.12, 0.08); // D4
    },
    streak: function () {
      // Upward arpeggio for combo streak
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        playTone(freq, "sine", 0.15, 0.15, idx * 0.06);
      });
    },
    finish: function () {
      // Fanfare chords
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, idx) => {
        playTone(freq, "sine", 0.35, 0.15, idx * 0.08);
      });
    },
    timerTick: function () {
      playTone(880, "square", 0.03, 0.04);
    },
    lifeline: function () {
      playTone(440, "sine", 0.1, 0.15, 0);
      playTone(880, "sine", 0.15, 0.15, 0.08);
    }
  };
})();
