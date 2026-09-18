class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
  }

  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.enabled = false;
    }
  }

  playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.enabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playEat() {
    this.playTone(523, 0.1, 'sine', 0.4);
    setTimeout(() => this.playTone(784, 0.1, 'sine', 0.3), 50);
  }

  playGameOver() {
    this.playTone(300, 0.3, 'sawtooth', 0.3);
    setTimeout(() => this.playTone(200, 0.4, 'sawtooth', 0.2), 150);
  }

  playMove() {
    this.playTone(440, 0.05, 'sine', 0.1);
  }

  playLevelUp() {
    this.playTone(523, 0.1, 'sine', 0.3);
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.3), 100);
    setTimeout(() => this.playTone(784, 0.2, 'sine', 0.4), 200);
  }

  playButton() {
    this.playTone(440, 0.1, 'square', 0.2);
  }
}

const audio = new AudioSystem();
