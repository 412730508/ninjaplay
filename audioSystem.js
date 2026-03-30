class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.volume = 0.7;
    this.enabled = true;
    
    // 初始化音效系統
    this.initAudioContext();
    this.createSounds();
  }
  
  initAudioContext() {
    try {
      // 創建音效上下文
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // 創建主音量控制
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.volume;
    } catch (error) {
      console.warn('音效系統初始化失敗:', error);
      this.enabled = false;
    }
  }
  
  // 🔊 創建程序化音效
  createSounds() {
    // 敲擊聲音效
    this.sounds.impact = this.createImpactSound.bind(this);
    this.sounds.whoosh = this.createWhooshSound.bind(this);
    this.sounds.success = this.createSuccessSound.bind(this);
    this.sounds.click = this.createClickSound.bind(this);

    this.sounds.shamisenPluck = this.createShamisenPluckSound.bind(this);
    this.sounds.shamisenCanon = this.createShamisenCanonSound.bind(this);  }
  
  // 🥁 創建敲擊聲（背景合併音效）
  createImpactSound() {
    if (!this.enabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    // 配置振盪器 - 低頻敲擊聲
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(60, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 0.3);
    
    // 配置濾波器 - 增加敲擊感
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
    filter.Q.setValueAtTime(1, this.audioContext.currentTime);
    
    // 配置音量包絡 - 快速攻擊，慢速衰減
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.8, this.audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
    
    // 連接音效鏈
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    // 播放音效
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.8);
    
    // 添加第二層音效 - 更深的重擊聲
    setTimeout(() => {
      this.createDeepImpact();
    }, 100);
  }
  
  // 🔨 創建深層敲擊聲
  createDeepImpact() {
    if (!this.enabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(40, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(15, this.audioContext.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.6, this.audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.6);
  }
  
  // 💨 創建風聲音效
  createWhooshSound() {
    if (!this.enabled || !this.audioContext) return;
    
    const noiseBuffer = this.createNoiseBuffer(0.5);
    const source = this.audioContext.createBufferSource();
    const filter = this.audioContext.createBiquadFilter();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = noiseBuffer;
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.5);
    filter.Q.setValueAtTime(5, this.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    source.start();
    source.stop(this.audioContext.currentTime + 0.5);
  }
  
  // ✅ 創建成功音效
  createSuccessSound() {
    if (!this.enabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.4);
  }
  
  // 🖱️ 創建點擊音效
  createClickSound() {
    if (!this.enabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }
  
  
  // Shamisen pluck sound (twangy string attack)
  createShamisenPluckSound() {
    if (!this.enabled || !this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    // Plucked string: high attack, quick decay, pentatonic-ish pitch
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + 0.15);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.audioContext.currentTime);
    filter.Q.setValueAtTime(8, this.audioContext.currentTime);

    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  // Shamisen canon sound (resonant chord burst for ultimate)
  createShamisenCanonSound() {
    if (!this.enabled || !this.audioContext) return;

    const frequencies = [220, 330, 440]; // A3, E4, A4 open strings
    frequencies.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.8, this.audioContext.currentTime + 0.8);

      gain.gain.setValueAtTime(0, this.audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.02 + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.0);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.audioContext.currentTime + i * 0.05);
      osc.stop(this.audioContext.currentTime + 1.0);
    });
  }
// 🎵 創建噪音緩衝區
  createNoiseBuffer(duration) {
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  }
  
  // 🔊 播放音效
  playSound(soundName) {
    if (this.enabled && this.sounds[soundName]) {
      try {
        // 恢復音效上下文（用戶交互後）
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
        this.sounds[soundName]();
      } catch (error) {
        console.warn(`播放音效失敗 (${soundName}):`, error);
      }
    }
  }
  
  // 🔇 設置音量
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }
  
  // 🔇 靜音切換
  toggleMute() {
    this.enabled = !this.enabled;
    if (this.masterGain) {
      this.masterGain.gain.value = this.enabled ? this.volume : 0;
    }
  }
}

// 創建全局音效系統實例
let audioSystem;
document.addEventListener('DOMContentLoaded', () => {
  audioSystem = new AudioSystem();
});
