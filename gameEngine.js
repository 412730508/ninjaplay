class NinjaGame {
  constructor() {
    this.players = {
      player1: null,
      player2: null
    };
    // ????餅??頂蝯?
    this.cooldowns = {
      player1: { normal: 0, ultimate: 0, attack: 0, defend: 0, defendCooldown: 0 }, // ?儭??脩戌?瑕
      player2: { normal: 0, ultimate: 0, attack: 0, defend: 0, defendCooldown: 0 }  // ?儭??脩戌?瑕
    };
    this.gameState = {
      paused: false,
      winner: null,
      effects: [], 
      projectiles: [],
      damageNumbers: [],
      screenFlash: null,  // ???啣?嚗撟??賣???
      combatLog: [],  // ?? ?啣?嚗擛亥??航???
      victoryAnimation: null,  // ?? ?啣?嚗??拙??怎???
      comboCount: { player1: 0, player2: 0 },  // ? ???閮
      comboTimer: { player1: 0, player2: 0 },  // ? ???閮???
      lastHitTime: { player1: 0, player2: 0 },  // ? 銝活?餅???
      rockAttackCount: { player1: 0, player2: 0 },  // ? 撗拍敹?餅挾?貉???
      skillReadyFlash: { player1: { normal: false, ultimate: false }, player2: { normal: false, ultimate: false } },  // ????賢??賡???
      cameraShake: { active: false, intensity: 0, duration: 0, elapsed: 0 },  // ? ?⊿??
      shadowClones: { player1: [], player2: [] },  // ?? ?蔣?澈蝟餌絞
      shadowMimic: { player1: null, player2: null },   // ?? 暺?敶勗??澈
      traps: [],  // ? ???琿蝟餌絞
      minions: [],  // ?? ????蝟餌絞
      hazards: [],  // ?? ???剔??啣耦蝟餌絞
      chainOfPain: null,  // ?? ????琿????
      scorpionConsecutiveHits: { player1: 0, player2: 0 },  // ?? ???格閮
      adjudicatorDomain: null,  // ?? 鋆捱??蝯瘙粹???
      puppet: { player1: null, player2: null },  // ? ????∪葦??∠???
      puppetSmoke: [],  // ? 撟餃蔣鈭日??
      azureVoltage: { player1: 0, player2: 0 },   // ???潮銋??餃?
      azureStrikes: [],   // ???潮憭拍蔑/憭扳??賡?拐辣
      azureUlt: { player1: null, player2: null },  // ???潮憭扳????
      combatFlourishes: [], // 共用戰鬥演出：普攻斬擊、技能起手與命中爆發
      // ?儭??啣?嚗?折?蝳衣頂蝯?
      defending: {
        player1: { 
          active: false,        // ?臬甇??脩戌
          startTime: 0,         // ???脩戌??
          direction: 1,         // ?脩戌?孵? (1=?? -1=撌?
          cooldownUntil: 0      // ?瑕蝯???
        },
        player2: { 
          active: false, 
          startTime: 0, 
          direction: 1,
          cooldownUntil: 0
        }
      }
    };
    this.canvas = null;
    this.ctx = null;
    this.lastTime = 0;
    // ?湔?恍撠箏站
    this.canvasWidth = 1400;
    this.canvasHeight = 700;

    // 鋆捱??撟獢? (Hit-Stop)
    this.hitStopFrames = 0;
    
    // ???蕭頩?
    this.keys = {
      // ?拙振1
      'a': false,
      'd': false,
      'w': false,
      's': false,
      'j': false,      // ??賭?
      'k': false,      // 憭扳?
      'e': false,
      'r': false,
      // ?拙振2
      'arrowleft': false,
      'arrowright': false,
      'arrowup': false,
      'arrowdown': false,
      'numpad4': false, // ??賭?
      'numpad5': false, // 憭扳?
      '<': false,
      '>': false
    };

    // A 是原本鍵位；B 將雙方技能鍵改到更接近各自移動區的位置。
    this.controlMode = 'a';
    
    // ?脫迫??閫貊????
    this.skillPressed = {
      player1: { normal: false, ultimate: false, attack: false, defend: false },
      player2: { normal: false, ultimate: false, attack: false, defend: false }
    };

    this.aiController = null;

    this.gameLoop = this.gameLoop.bind(this); // 蝣箔? gameLoop ?寞?甇?Ⅱ蝬?
  }

  getControlBindings() {
    return this.controlMode === 'b'
      ? {
          player1: { normal: 'e', ultimate: 'r' },
          player2: { normal: '<', ultimate: '>' }
        }
      : {
          player1: { normal: 'j', ultimate: 'k' },
          player2: { normal: 'numpad4', ultimate: 'numpad5' }
        };
  }

  setControlMode(mode) {
    const nextMode = mode === 'b' ? 'b' : 'a';
    this.controlMode = nextMode;

    // 切換途中不保留按鍵狀態，避免上一套鍵位卡住或誤放技能。
    Object.keys(this.keys).forEach(key => { this.keys[key] = false; });
    Object.values(this.skillPressed).forEach(state => {
      state.normal = false;
      state.ultimate = false;
      state.attack = false;
      state.defend = false;
    });
    return this.controlMode;
  }

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.setupEventListeners();
    
    // 蝣箔? gameLoop ?寞?摮銝血???
    this.startGameLoop();
  }

  startGameLoop() {
    // ?????餈游?嚗甇ａ?銴銵?
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.lastTime = performance.now();
    this.gameLoop(); // 甇?Ⅱ蝬?敺矽??
  }

  gameLoop(currentTime = performance.now()) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // ??頛詨
    this.handleInput();
    
    // ?湔??摩
    this.update(deltaTime);
    
    // 皜脫??恍
    this.render();
    
    // 蝜潛?敺芰
    this.rafId = requestAnimationFrame(this.gameLoop); // 蝣箔? this ??甇?Ⅱ
  }

  update(deltaTime) {
    this.lastDeltaTime = deltaTime;
    if (this.gameState.paused || this.gameState.winner) return;

    // 鋆捱??Hit-Stop嚗?撟??頝喲??摩?湔
    if (this.hitStopFrames > 0) {
      this.hitStopFrames--;
      return;
    }

    if (this.aiController) {
      this.aiController.update(deltaTime);
    }
    
    // ?湔?????
    this.updateEffects();
    
    // ?湔????
    this.updateProjectiles();
    
    // 嚙??湔?琿
    this.updateTraps();
    
    // 嚙踢???湔?蔣?澈
    this.updateShadowClones(deltaTime);
    
    // ? ?湔蝎暸???蝟餌絞嚗?啣???+ ?蝘餃? + 霅瑞泵頛芾?嚗?
    this.updateRangerSystems();
    
    // ?弩 ?湔銵憟??頂蝯梧??賜? + 銵?橘?
    this.updateWarlockSystems();
    
    // ?? ?湔??蝟餌絞嚗?敺?+ ?啣耦 + ?琿?嚗?
    this.updateScorpionSystems(deltaTime);
    
    // ?? ?湔鋆捱?頂蝯梧?鋡怠?皜?+ ?? + ?蝒嚗?
    this.updateAdjudicatorSystems();
    
    // ?儭??湔?◢銋?蝟餌絞嚗?瘙箇???
    this.updateExileBladeSystems(deltaTime);
    
    // ? ?湔????∪葦蝟餌絞嚗??∟???+ ??嚗?
    this.updatePuppeteerSystems(deltaTime);
    
    // ???湔?潮銋?蝟餌絞嚗憯?+ ?賡 + 憭扳?嚗?
    this.updateAzureSystems(deltaTime);
    
    // *** Update Shamisen Deadly Canon system ***
    this.updateShamisenSystems(deltaTime);
    
    // ?儭??脩戌鋡急?嗥閫?炎?伐??摹?脩戌(>2蝘??◤?/摰澈/瘝? ??撘瑕閫??脩戌
    const now_defend = Date.now();
    ['player1', 'player2'].forEach(pid => {
      const ds = this.gameState.defending[pid];
      if (!ds.active) return;
      const p = this.players[pid];
      if (!p) return;
      const elapsed = now_defend - ds.startTime;
      if (elapsed > 2000) {
        // ?摹?挾嚗◤?批??賢銝剜??渲圾?脩戌
        if (p.effects.stunned > now_defend || p.effects.rooted > now_defend || p.effects.silenced > now_defend) {
          ds.active = false;
          ds.cooldownUntil = now_defend + 2000;
          this.playAnimation(p, 'idle');
          this.addCombatLog(`${p.name} 防禦被控制打斷！`, pid, 'status');
          this.addVisualEffect(p.position.x, p.position.y, 'defend_break', '💢');
        }
      }
    });
    
    // ?湔?瑕??UI
    this.updateCooldownUI();
    
    // ?湔銵璇?
    this.updateHealthBars();
    
    // ? ?湔???
    if (this.players.player1 && this.players.player1.hitFlash > 0) {
      this.players.player1.hitFlash -= deltaTime;
    }
    if (this.players.player2 && this.players.player2.hitFlash > 0) {
      this.players.player2.hitFlash -= deltaTime;
    }
    
    // ? ?湔?⊿??
    if (this.gameState.cameraShake.active) {
      this.gameState.cameraShake.elapsed += deltaTime;
      if (this.gameState.cameraShake.elapsed >= this.gameState.cameraShake.duration) {
        this.gameState.cameraShake.active = false;
        this.gameState.cameraShake.elapsed = 0;
      }
    }
    
    // ? ?萄遣?啣?蝎?
    if (typeof particleSystem !== 'undefined' && particleSystem) {
      particleSystem.createEnvironmentParticles(this.canvasWidth, this.canvasHeight);
    }
    
    // ?湔蝎?蝟餌絞
    if (typeof particleSystem !== 'undefined' && particleSystem && particleSystem.update) {
      particleSystem.update(deltaTime);
    }
  }

  render() {
    // 皜征?怠?
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // ? ?⊿????
    if (this.gameState.cameraShake.active) {
      this.ctx.save();
      const shake = this.gameState.cameraShake;
      const offsetX = (Math.random() - 0.5) * shake.intensity;
      const offsetY = (Math.random() - 0.5) * shake.intensity;
      this.ctx.translate(offsetX, offsetY);
    }
    
    // 皜脫??嚗??
    this.renderBackground();
    
    // 皜脫??拙振
    this.renderPlayers();

    // 共用戰鬥演出層：補足各流派普攻、技能與奧義的壓迫感。
    this.renderCombatFlourishes();

    // ?? 皜脫????剜??寞? (?函摰嗡?敺?
    ['player1', 'player2'].forEach(pid => {
      const p = this.players[pid];
      if (p && p.id === 'scorpion' && p._whipAnim) {
        const opp = this.players[pid === 'player1' ? 'player2' : 'player1'];
        this.renderScorpionWhipAttack(p, opp, pid);
      }
    });
    
    // ?? 皜脫??蔣?澈 (?函摰嗡?敺????拐???
    this.renderShadowClones();
    
    // 皜脫?????
    this.renderProjectiles();
    
    // ? 皜脫??琿
    this.renderTraps();
    
    // ? 皜脫??怎???
    this.renderFireZones();
    
    // ?弩 皜脫?銵憟蝺?
    this.renderTethers();
    
    // ?? 皜脫???蝟餌絞嚗?敺?+ ?啣耦 + ?琿?嚗?
    this.renderScorpionSystems();
    
    // ?儭?皜脫??◢銋??寞?嚗??脫?敶?+ ?捱?嚗?
    this.renderExileGaleDashEffect();
    this.renderExileBladeExecution();
    
    // 皜脫?蝎??寞?
    if (typeof particleSystem !== 'undefined' && particleSystem && particleSystem.render) {
      particleSystem.render(this.ctx);
    }
    
    // ? 皜脫???賜???蝷箏
    this.renderSkillIndicators();
    
    // 皜脫?UI??
    this.renderUI();
    
    // 皜脫??瑕拿?詨?
    this.renderDamageNumbers();
    
    // ? 皜脫????閮
    this.renderComboCounter();
    
    // ?? 皜脫???瘠D?脣漲璇?
    this.renderSkillCooldowns();
    
    // ?Ｗ儔?⊿??
    if (this.gameState.cameraShake.active) {
      this.ctx.restore();
    }
    
    // ??皜脫??Ｗ????嚗?敺葡??閬??冽??摰嫣?銝?
    this.renderScreenFlash();
    


  }

  getCombatPalette(characterId) {
    const palettes = {
      fujin: ['#7FEFFF', '#0099CC', '#E7FFFF'],
      katon: ['#FF7043', '#D84315', '#FFE0B2'],
      forgefire: ['#FFB000', '#FF4D00', '#FFE08A'],
      suijin: ['#7AD7FF', '#1976D2', '#E1F5FE'],
      raijin: ['#FFF176', '#8E24AA', '#FFFDE7'],
      doton: ['#C8A47A', '#6D4C41', '#F0DEC5'],
      kage: ['#9B7BFF', '#311B92', '#EDE7F6'],
      rei: ['#F48FB1', '#8E24AA', '#FCE4EC'],
      dokusei: ['#7DFF8B', '#00897B', '#E0FFE5'],
      taijutsu: ['#FF6B6B', '#B71C1C', '#FFE2E2'],
      ranger: ['#B8F58A', '#2E7D32', '#F1FFE6'],
      warlock: ['#FF4D67', '#6A0011', '#FFD5DC'],
      ronin: ['#E8F1F8', '#546E7A', '#FFFFFF'],
      beastmaster: ['#C6A77A', '#4E342E', '#F3E0C2'],
      scorpion: ['#FF5C5C', '#5D0011', '#FFD0D0'],
      adjudicator: ['#FFE082', '#9A6B00', '#FFF8D5'],
      exileblade: ['#66F5F3', '#006B75', '#E5FFFF'],
      puppeteer: ['#D6A2FF', '#4A148C', '#F3E5F5'],
      azure_disciple: ['#75D9FF', '#0047AB', '#E1F5FE'],
      shamisen: ['#FFD180', '#A74E2D', '#FFF0D6']
    };
    return palettes[characterId] || ['#FFFFFF', '#6B7280', '#FFFFFF'];
  }

  spawnCombatFlourish(kind, source, target = null, power = 1) {
    const attacker = typeof source === 'object' ? source : this.getAttackerFromSource(source);
    if (!attacker) return;

    const [color, shade, highlight] = this.getCombatPalette(attacker.id);
    const flourishes = this.gameState.combatFlourishes || (this.gameState.combatFlourishes = []);
    flourishes.push({
      kind,
      x: attacker.position.x,
      y: attacker.position.y - 32,
      targetX: target?.position?.x ?? attacker.position.x + attacker.facing * 110,
      targetY: (target?.position?.y ?? attacker.position.y) - 30,
      facing: attacker.facing || 1,
      color,
      shade,
      highlight,
      power,
      startTime: Date.now(),
      duration: kind === 'ultimate' ? 850 : kind === 'skill' ? 580 : 320
    });

    // Guard against unusually fast attacks building an unbounded visual queue.
    if (flourishes.length > 48) flourishes.splice(0, flourishes.length - 48);
  }

  renderCombatFlourishes() {
    const flourishes = this.gameState.combatFlourishes;
    if (!flourishes?.length) return;

    const now = Date.now();
    this.gameState.combatFlourishes = flourishes.filter(effect => {
      const progress = Math.min(1, (now - effect.startTime) / effect.duration);
      if (progress >= 1) return false;

      const fade = 1 - progress;
      const ctx = this.ctx;
      const baseRadius = 24 + effect.power * 16;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (effect.kind === 'swing') {
        const cx = effect.x + effect.facing * 18;
        const cy = effect.y - 4;
        const start = effect.facing > 0 ? -2.25 : -0.9;
        const sweep = (0.3 + progress * 1.35) * effect.facing;
        ctx.globalAlpha = fade * 0.62;
        ctx.strokeStyle = effect.color;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 12 * effect.power;
        ctx.lineWidth = 4 + effect.power * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius + progress * 20, start, start + sweep, effect.facing < 0);
        ctx.stroke();
      } else if (effect.kind === 'impact') {
        const radius = baseRadius + progress * 48 * effect.power;
        ctx.globalAlpha = fade * 0.72;
        ctx.strokeStyle = effect.highlight;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 14 * effect.power;
        ctx.lineWidth = 3 + effect.power * 2;
        ctx.beginPath();
        ctx.arc(effect.targetX, effect.targetY, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 2;
        for (let ray = 0; ray < 7; ray++) {
          const angle = (Math.PI * 2 / 7) * ray + progress * 0.7;
          const inner = radius * 0.34;
          const outer = radius * (0.78 + (ray % 2) * 0.18);
          ctx.beginPath();
          ctx.moveTo(effect.targetX + Math.cos(angle) * inner, effect.targetY + Math.sin(angle) * inner);
          ctx.lineTo(effect.targetX + Math.cos(angle) * outer, effect.targetY + Math.sin(angle) * outer);
          ctx.stroke();
        }
      } else {
        const isUltimate = effect.kind === 'ultimate';
        const radius = baseRadius + progress * (isUltimate ? 150 : 82) * effect.power;
        ctx.globalAlpha = fade * (isUltimate ? 0.5 : 0.36);
        ctx.fillStyle = effect.shade;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = fade * 0.9;
        ctx.strokeStyle = effect.color;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = isUltimate ? 26 : 14;
        ctx.lineWidth = isUltimate ? 5 : 3;
        ctx.setLineDash(isUltimate ? [12, 8] : [7, 6]);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius, progress * Math.PI * 2, progress * Math.PI * 2 + Math.PI * 1.65);
        ctx.stroke();
        ctx.setLineDash([]);

        const rayCount = isUltimate ? 10 : 5;
        for (let ray = 0; ray < rayCount; ray++) {
          const angle = (Math.PI * 2 / rayCount) * ray - progress * 2.4;
          const inner = 15 + progress * 12;
          const outer = radius * (0.68 + (ray % 3) * 0.09);
          ctx.globalAlpha = fade * (isUltimate ? 0.48 : 0.32);
          ctx.strokeStyle = ray % 2 ? effect.highlight : effect.color;
          ctx.lineWidth = isUltimate ? 2.5 : 1.5;
          ctx.beginPath();
          ctx.moveTo(effect.x + Math.cos(angle) * inner, effect.y + Math.sin(angle) * inner);
          ctx.lineTo(effect.x + Math.cos(angle) * outer, effect.y + Math.sin(angle) * outer);
          ctx.stroke();
        }

        if (isUltimate) {
          ctx.globalAlpha = fade * 0.24;
          ctx.fillStyle = effect.highlight;
          ctx.fillRect(effect.x - 22, effect.y - 170 * fade, 44, 170 * fade);
        }
      }

      ctx.restore();
      return true;
    });
  }

  renderBackground() {
    // ???潮憭扳????閬?
    const azUlt1 = this.gameState.azureUlt.player1;
    const azUlt2 = this.gameState.azureUlt.player2;
    const activeUlt = (azUlt1 && azUlt1.active) ? azUlt1 : (azUlt2 && azUlt2.active) ? azUlt2 : null;
    if (activeUlt) {
      activeUlt.frameCounter = (activeUlt.frameCounter || 0) + 1;
      if (activeUlt.frameCounter % 30 === 0) {
        this.ctx.fillStyle = '#FFFFFF';
      } else {
        this.ctx.fillStyle = '#000000';
      }
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      return;
    }

    // 雿輻?啣?蝟餌絞皜脫??
    if (typeof mapSystem !== 'undefined' && mapSystem && mapSystem.renderBackground) {
      mapSystem.renderBackground(this.ctx, this.canvasWidth, this.canvasHeight);
      
      // ? ?郊?啣??啁?摮頂蝯?
      if (typeof particleSystem !== 'undefined' && particleSystem && particleSystem.setCurrentMap) {
        particleSystem.setCurrentMap(mapSystem.currentMap);
      }
    } else {
      // ??
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#98FB98');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      
      // ?圈
      this.ctx.fillStyle = '#8FBC8F';
      this.ctx.fillRect(0, this.canvasHeight - 100, this.canvasWidth, 100);
    }
  }

  renderPlayers() {
    Object.values(this.players).forEach((player, index) => {
      if (!player) return;
      
      this.ctx.save();
      
      // ? ?????
      if (player.hitFlash && player.hitFlash > 0) {
        this.ctx.shadowColor = '#FF0000';
        this.ctx.shadowBlur = 20;
        // ????
        if (Math.floor(player.hitFlash / 50) % 2 === 0) {
          this.ctx.globalCompositeOperation = 'lighter';
          this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
          this.ctx.beginPath();
          this.ctx.arc(player.position.x, player.position.y, 40, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
      
      // ????賢??賢??????
      const playerId = index === 0 ? 'player1' : 'player2';
      const now = Date.now();
      
      // ?桅??賢??賢???
      if (this.cooldowns[playerId].normal <= 0 && this.gameState.skillReadyFlash[playerId].normal) {
        const pulseSize = 50 + Math.sin(now * 0.008) * 10;
        const gradient = this.ctx.createRadialGradient(
          player.position.x, player.position.y, 0,
          player.position.x, player.position.y, pulseSize
        );
        gradient.addColorStop(0, 'rgba(255, 255, 100, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(player.position.x, player.position.y, pulseSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // 蝯扔??賢??賢???
      if (this.cooldowns[playerId].ultimate <= 0 && this.gameState.skillReadyFlash[playerId].ultimate) {
        const pulseSize = 60 + Math.sin(now * 0.01) * 15;
        const gradient = this.ctx.createRadialGradient(
          player.position.x, player.position.y, 0,
          player.position.x, player.position.y, pulseSize
        );
        gradient.addColorStop(0, 'rgba(255, 100, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 100, 255, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(player.position.x, player.position.y, pulseSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // 雿輻?急鈭箏??怎頂蝯望葡??
      if (typeof stickmanAnimator !== 'undefined' && stickmanAnimator) {
        const animation = player.animation || { current: 'idle', frame: 0 };
        
        // ? ?梯澈????
        if (player.effects.stealthActive > Date.now()) {
          this.ctx.globalAlpha = 0.15;
        }
        
        // ?儭?憒??舫蝳血???雿輻閫撠惇?脩戌憪踹
        let animationFrames;
        if (animation.current === 'defend') {
          animationFrames = stickmanAnimator.getDefendAnimation(player.id);
        } else {
          animationFrames = stickmanAnimator.animations[animation.current] || stickmanAnimator.animations.idle;
        }
        
        const currentFrame = animationFrames[Math.floor(animation.frame) % animationFrames.length];
        
        const isBeastGolem = player.id === 'beastmaster' && player.isGolem;
        const isBeastTransforming = player.id === 'beastmaster' && player.golemTransforming;

        if (isBeastGolem || isBeastTransforming) {
          const scale = player.golemScale || 1;
          this.ctx.save();
          this.ctx.translate(player.position.x, player.position.y);
          this.ctx.scale(scale, scale);
          this.ctx.translate(-player.position.x, -player.position.y);

          if (isBeastTransforming) {
            const tf = player.golemTransforming;
            const progress = Math.min((Date.now() - tf.startTime) / tf.duration, 1);
            // 霈澈??嚗澈擃???銴?? + ?‵
            const shake = Math.sin(Date.now() * 0.06) * (3 - progress * 2.5);
            this.ctx.translate(shake, shake * 0.5);
            const glowAlpha = 0.3 + Math.sin(Date.now() * 0.015) * 0.2;
            this.ctx.shadowColor = `rgba(180, 120, 60, ${glowAlpha})`;
            this.ctx.shadowBlur = 20 + progress * 15;
            this.ctx.strokeStyle = `rgba(140, 100, 50, ${0.4 + progress * 0.4})`;
            this.ctx.lineWidth = 3 + progress * 2;
          } else {
            this.ctx.strokeStyle = '#6E6E6E';
            this.ctx.lineWidth = 4;
            this.ctx.shadowColor = 'rgba(120, 120, 120, 0.35)';
            this.ctx.shadowBlur = 12;
          }
        }

        // ?弩 銵銋風?暹憭扳???
        if (player.effects.bloodShield > 0) {
          this.ctx.save();
          this.ctx.translate(player.position.x, player.position.y);
          this.ctx.scale(1.05, 1.05);
          this.ctx.translate(-player.position.x, -player.position.y);
        }
        
        if ((isBeastGolem || isBeastTransforming) && typeof stickmanAnimator.drawColossalGolem === 'function') {
          stickmanAnimator.drawColossalGolem(
            this.ctx,
            player.position.x,
            player.position.y,
            player.facing,
            1,
            animation.frame,
            animation.current,
            player.golemAttackStart || 0
          );
          // 霈澈銝哨?蝜芾ˊ鈭箏?畾蔣?撓瘨
          if (isBeastTransforming) {
            const tf = player.golemTransforming;
            const progress = Math.min((Date.now() - tf.startTime) / tf.duration, 1);
            const humanAlpha = Math.max(0, 1 - progress * 1.5); // 鈭箏??典?2/3??瘛∪
            if (humanAlpha > 0) {
              this.ctx.save();
              this.ctx.globalAlpha = humanAlpha * 0.5;
              stickmanAnimator.drawStickman(
                this.ctx,
                player.position.x,
                player.position.y,
                currentFrame,
                player.id,
                player.facing
              );
              this.ctx.restore();
            }
          }
        } else {
          // ?? ???嚗??脖???
          let knockupOffsetY = 0;
          const now = Date.now();
          if (player._knockupAnim && now < player._knockupAnim.startTime + player._knockupAnim.duration) {
            const progress = (now - player._knockupAnim.startTime) / player._knockupAnim.duration;
            knockupOffsetY = -Math.sin(progress * Math.PI) * 60; // ?蝺???0px
          }
          stickmanAnimator.drawStickman(
            this.ctx, 
            player.position.x, 
            player.position.y + knockupOffsetY, 
            currentFrame, 
            player.id, 
            player.facing
          );
        }
        
        if (player.effects.bloodShield > 0) {
          this.ctx.restore();
        }

        if (isBeastGolem || isBeastTransforming) {
          this.ctx.restore();
        }

        // ?爸 霈澈銝剖?Ｚ??郭 + 撗拍蝣?
        if (isBeastTransforming) {
          const tf = player.golemTransforming;
          const progress = Math.min((Date.now() - tf.startTime) / tf.duration, 1);
          const px = player.position.x;
          const py = player.position.y;

          // ?圈?郭??
          this.ctx.save();
          const ringAlpha = 0.5 * (1 - progress * 0.6);
          this.ctx.strokeStyle = `rgba(160, 120, 70, ${ringAlpha})`;
          this.ctx.lineWidth = 3;
          const ringR = 20 + progress * 60;
          this.ctx.beginPath();
          this.ctx.ellipse(px, py + 30, ringR, ringR * 0.35, 0, 0, Math.PI * 2);
          this.ctx.stroke();

          // 銝??痔?喟???
          for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i + progress * 2;
            const dist = 15 + progress * 45;
            const riseY = progress * 40;
            const rx = px + Math.cos(angle) * dist;
            const ry = py + 10 - riseY + Math.sin(angle) * dist * 0.3;
            const rockAlpha = 0.7 * (1 - progress * 0.5);
            const rockSize = 3 + (i % 3) * 2;

            this.ctx.fillStyle = `rgba(${120 + i * 10}, ${90 + i * 5}, ${60}, ${rockAlpha})`;
            this.ctx.save();
            this.ctx.translate(rx, ry);
            this.ctx.rotate(angle + progress * 3);
            this.ctx.fillRect(-rockSize, -rockSize * 0.7, rockSize * 2, rockSize * 1.4);
            this.ctx.restore();
          }

          // ?賡??勗???
          const beamAlpha = 0.12 + Math.sin(Date.now() * 0.02) * 0.06;
          const beamGrad = this.ctx.createLinearGradient(px, py - 100, px, py + 20);
          beamGrad.addColorStop(0, `rgba(200, 160, 80, 0)`);
          beamGrad.addColorStop(0.3, `rgba(200, 160, 80, ${beamAlpha * progress})`);
          beamGrad.addColorStop(0.7, `rgba(180, 130, 60, ${beamAlpha * progress})`);
          beamGrad.addColorStop(1, `rgba(180, 130, 60, 0)`);
          this.ctx.fillStyle = beamGrad;
          const beamW = 20 + progress * 30;
          this.ctx.fillRect(px - beamW, py - 100, beamW * 2, 120);

          this.ctx.restore();
        }
        
        // ? 靽桀儔嚗炎?交??賢??急?血???摰?敺??啣?璈?
        if (stickmanAnimator.isAnimationComplete(player, animation.current)) {
          stickmanAnimator.resetToIdle(player);
        } else {
          // ?湔?撟
          player.animation.frame = (player.animation.frame + 0.2) % animationFrames.length;
        }
      } else {
        // ?皜脫? - 蝪∪?耦
        this.ctx.fillStyle = index === 0 ? '#FF6B6B' : '#4ECDC4';
        this.ctx.beginPath();
        this.ctx.arc(player.position.x, player.position.y, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // ?拙振?迂
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(player.name, player.position.x, player.position.y - 30);
      }
      
      this.ctx.restore();

      // === Shamisen ambient musical aura ===
      if (player.id === 'shamisen' && this.gameState.phase === 'fighting') {
        this.renderShamisenAmbient(player, playerId);
        this.renderShamisenPluck(player);
      }
      
      // ?儭?皜脫??脩戌?孵??內??
      this.renderDefendIndicator(player, playerId);
      
      // 皜脫??????
      this.renderPlayerEffects(player, player.position.x, player.position.y);
    });

    // ??? ? 皜脫????+ ?亙??? + ?? ???
    this.renderPuppeteerExtras();

    // ??? ??皜脫??潮銋??寞?嚗??+ ?餃? + 憭扳???嚗????
    this.renderAzureExtras();

    // *** Render Shamisen Deadly Canon expanding circles ***
    this.renderShamisenCanon(this.ctx);
  }

  renderPuppeteerExtras() {
    const ctx = this.ctx;
    const now = Date.now();

    // Draw puppets
    ['player1', 'player2'].forEach(pid => {
      const player = this.players[pid];
      if (!player || player.id !== 'puppeteer') return;
      const puppet = this.gameState.puppet[pid];
      if (!puppet || !puppet.active) return;

      // Chakra thread lines (from player hands to puppet)
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      const offset = Math.sin(now * 0.005) * 3;
      // Left thread
      ctx.beginPath();
      ctx.moveTo(player.position.x - 8 * player.facing, player.position.y - 35);
      ctx.quadraticCurveTo(
        (player.position.x + puppet.x) / 2, player.position.y - 50 + offset,
        puppet.x - 5 * puppet.facing, puppet.y - 30
      );
      ctx.stroke();
      // Right thread
      ctx.beginPath();
      ctx.moveTo(player.position.x + 8 * player.facing, player.position.y - 35);
      ctx.quadraticCurveTo(
        (player.position.x + puppet.x) / 2, player.position.y - 45 - offset,
        puppet.x + 5 * puppet.facing, puppet.y - 30
      );
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Draw puppet as a smaller, purplish stickman
      ctx.save();
      ctx.globalAlpha = 0.85;
      if (typeof stickmanAnimator !== 'undefined' && stickmanAnimator) {
        const animation = player.animation || { current: 'idle', frame: 0 };
        const animFrames = stickmanAnimator.animations[animation.current] || stickmanAnimator.animations.idle;
        const frame = animFrames[Math.floor(animation.frame) % animFrames.length];
        ctx.translate(puppet.x, puppet.y);
        ctx.scale(0.75, 0.75);
        ctx.translate(-puppet.x, -puppet.y);
        stickmanAnimator.drawStickman(ctx, puppet.x, puppet.y, frame, 'puppeteer', puppet.facing);
      } else {
        ctx.fillStyle = '#6A0DAD';
        ctx.beginPath();
        ctx.arc(puppet.x, puppet.y, 15, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Puppet HP bar
      const hpPct = puppet.hp / puppet.maxHp;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(puppet.x - 15, puppet.y - 50, 30, 4);
      ctx.fillStyle = hpPct > 0.5 ? '#6A0DAD' : '#FF4444';
      ctx.fillRect(puppet.x - 15, puppet.y - 50, 30 * hpPct, 4);
    });

    // Draw smoke zones
    this.gameState.puppetSmoke.forEach(smoke => {
      const elapsed = now - smoke.startTime;
      const total = smoke.expiresAt - smoke.startTime;
      const alpha = 0.35 * (1 - elapsed / total);
      ctx.save();
      const grad = ctx.createRadialGradient(smoke.x, smoke.y, 0, smoke.x, smoke.y, smoke.radius);
      grad.addColorStop(0, `rgba(100, 60, 160, ${alpha})`);
      grad.addColorStop(0.6, `rgba(80, 40, 140, ${alpha * 0.6})`);
      grad.addColorStop(1, `rgba(60, 20, 120, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(smoke.x, smoke.y, smoke.radius, 0, Math.PI * 2);
      ctx.fill();
      // Swirling particles inside
      for (let i = 0; i < 5; i++) {
        const a = (now * 0.003 + i * 1.2) % (Math.PI * 2);
        const r = smoke.radius * (0.3 + Math.sin(now * 0.002 + i) * 0.2);
        ctx.fillStyle = `rgba(180, 140, 220, ${alpha * 1.5})`;
        ctx.beginPath();
        ctx.arc(smoke.x + Math.cos(a) * r, smoke.y + Math.sin(a) * r, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }
  
  // ?儭?皜脫??脩戌?孵??內??
  renderDefendIndicator(player, playerId) {
    const defendState = this.gameState.defending[playerId];
    const now = Date.now();
    
    // 憿舐內?脩戌銝剔??內??
    if (defendState.active) {
      const x = player.position.x;
      const y = player.position.y;
      const direction = defendState.direction;
      const duration = now - defendState.startTime;
      const isPerfect = duration <= 2000;
      
      this.ctx.save();
      
      if (isPerfect) {
        // ??摰??脩戌?挾嚗???曄?
        const perfectAlpha = 0.5 + Math.sin(now * 0.006) * 0.15;
        this.ctx.fillStyle = `rgba(70, 130, 230, ${perfectAlpha})`;
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 12;
      } else {
        // ?? ?摹?脩戌?挾嚗?璈???曄?
        const weakPulse = 0.25 + Math.sin(now * 0.012) * 0.15;
        this.ctx.fillStyle = `rgba(255, 100, 50, ${weakPulse})`;
        this.ctx.strokeStyle = `rgba(255, 80, 80, ${0.6 + Math.sin(now * 0.01) * 0.3})`;
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#FF4444';
        this.ctx.shadowBlur = 8;
      }
      
      // ?寞??孵?蝜芾ˊ?曄?撘?
      this.ctx.beginPath();
      if (direction > 0) {
        this.ctx.arc(x, y, 35, -Math.PI/3, Math.PI/3);
      } else {
        this.ctx.arc(x, y, 35, Math.PI*2/3, Math.PI*4/3);
      }
      this.ctx.stroke();
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
      
      // ?脩戌?孵?蝞剝
      this.ctx.fillStyle = isPerfect ? '#FFD700' : '#FF6B6B';
      this.ctx.font = 'bold 24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(direction > 0 ? '►' : '◄', x + direction * 45, y + 8);
      
      // ??? ?拚?畾菔??? ???
      const barWidth = 60;
      const barHeight = 6;
      const barX = x - barWidth / 2;
      const barY = y + 45;
      const perfectThreshold = 2000;
      const maxDisplayTime = 5000;
      const dividerX = barX + barWidth * (perfectThreshold / maxDisplayTime); // 2s??蝺?= 40%??
      
      // ?璇?
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.roundRect(barX, barY, barWidth, barHeight, 3);
      this.ctx.fill();
      this.ctx.stroke();
      
      if (isPerfect) {
        // 摰??挾嚗??撓撅文‵??0~2s?畾蛛?
        const perfectProgress = duration / perfectThreshold; // 0~1
        const fillWidth = (barWidth * perfectThreshold / maxDisplayTime) * perfectProgress;
        const grad = this.ctx.createLinearGradient(barX, barY, barX + fillWidth, barY);
        grad.addColorStop(0, '#4FC3F7');   // 瘛箄?
        grad.addColorStop(1, '#FFD700');   // ?
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.roundRect(barX, barY, Math.max(fillWidth, 0), barHeight, 3);
        this.ctx.fill();
      } else {
        // ?摹?挾嚗?蝢?畾萄‵皛?+ ?摹?畾萇匱蝥‵??
        // ?‵皛踹?蝢?畾蛛??箏????莎?
        const perfectWidth = barWidth * perfectThreshold / maxDisplayTime;
        const grad1 = this.ctx.createLinearGradient(barX, barY, barX + perfectWidth, barY);
        grad1.addColorStop(0, '#4FC3F7');
        grad1.addColorStop(1, '#FFD700');
        this.ctx.fillStyle = grad1;
        this.ctx.beginPath();
        this.ctx.roundRect(barX, barY, perfectWidth, barHeight, 3);
        this.ctx.fill();
        
        // ?‵?摹?畾蛛?蝝瞍豢楛嚗?
        const weakDuration = duration - perfectThreshold;
        const weakMax = maxDisplayTime - perfectThreshold; // 3000ms
        const weakProgress = Math.min(weakDuration / weakMax, 1);
        const weakWidth = (barWidth - perfectWidth) * weakProgress;
        const grad2 = this.ctx.createLinearGradient(dividerX, barY, dividerX + weakWidth, barY);
        grad2.addColorStop(0, '#FFA726');  // 璈
        grad2.addColorStop(1, '#FF3D00');  // 瘛梁?
        this.ctx.fillStyle = grad2;
        this.ctx.fillRect(dividerX, barY, Math.max(weakWidth, 0), barHeight);
      }
      
      // 2蝘???璅?
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(dividerX, barY - 2);
      this.ctx.lineTo(dividerX, barY + barHeight + 2);
      this.ctx.stroke();
      
      // ?挾璅惜
      this.ctx.font = 'bold 10px Arial';
      this.ctx.textAlign = 'center';
      if (isPerfect) {
        this.ctx.fillStyle = '#FFD700';
        this.ctx.shadowColor = '#000';
        this.ctx.shadowBlur = 3;
        this.ctx.fillText('完美格擋', x, barY + barHeight + 12);
      } else {
        // ?摹?挾????
        const textAlpha = 0.5 + Math.sin(now * 0.008) * 0.5;
        this.ctx.fillStyle = `rgba(255, 80, 80, ${textAlpha})`;
        this.ctx.shadowColor = '#000';
        this.ctx.shadowBlur = 3;
        this.ctx.fillText('普通防禦', x, barY + barHeight + 12);
      }
      
      this.ctx.restore();
    }
    // 憿舐內?脩戌?瑕?內??
    else if (now < defendState.cooldownUntil) {
      const cooldownRemaining = defendState.cooldownUntil - now;
      const cooldownTotal = 2000;
      const cooldownProgress = cooldownRemaining / cooldownTotal;
      
      this.ctx.save();
      
      // ?瑕?
      this.ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(
        player.position.x, 
        player.position.y + 50, 
        15, 
        -Math.PI/2, 
        -Math.PI/2 + (Math.PI * 2 * cooldownProgress)
      );
      this.ctx.stroke();
      
      // ?瑕蝘
      this.ctx.fillStyle = '#FF6B6B';
      this.ctx.font = 'bold 11px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${(cooldownRemaining / 1000).toFixed(1)}s`, player.position.x, player.position.y + 54);
      
      this.ctx.restore();
    }
  }

  // ?? 皜脫??蔣?澈
  renderShadowClones() {
    const now = Date.now();
    
    ['player1', 'player2'].forEach(playerId => {
      const clones = this.gameState.shadowClones[playerId];
      const player = this.players[playerId];
      
      if (!player) return;
      
      // === 皜脫?敶勗?頨恬?憭扳?嚗?===
      if (clones.length > 0) {
        clones.forEach(clone => {
          this.ctx.save();
          
          if (!clone.spawned) {
            const spawnProgress = Math.min(1, (now - clone.spawnAt) / 300);
            if (now < clone.spawnAt) {
              this.ctx.restore();
              return;
            }
            clone.opacity = spawnProgress * 0.7;
            if (spawnProgress >= 1) {
              clone.spawned = true;
              clone.opacity = 0.7;
              if (typeof particleSystem !== 'undefined' && particleSystem) {
                particleSystem.createShadowCloneEffect(clone.x, clone.y);
              }
            }
          }
          
          this.ctx.globalAlpha = clone.opacity;
          
          const gradient = this.ctx.createRadialGradient(
            clone.x, clone.y, 0,
            clone.x, clone.y, 50
          );
          gradient.addColorStop(0, 'rgba(139, 0, 139, 0.3)');
          gradient.addColorStop(1, 'rgba(139, 0, 139, 0)');
          this.ctx.fillStyle = gradient;
          this.ctx.beginPath();
          this.ctx.arc(clone.x, clone.y, 50, 0, Math.PI * 2);
          this.ctx.fill();
          
          if (typeof stickmanAnimator !== 'undefined' && stickmanAnimator) {
            const idleFrames = stickmanAnimator.animations.idle;
            const frameIndex = Math.floor((now - clone.createdAt) / 100) % idleFrames.length;
            const frame = idleFrames[frameIndex];
            stickmanAnimator.drawStickman(this.ctx, clone.x, clone.y, frame, 'kage', clone.facing, 0.9);
          } else {
            this.ctx.fillStyle = 'rgba(139, 0, 139, 0.6)';
            this.ctx.beginPath();
            this.ctx.arc(clone.x, clone.y, 18, 0, Math.PI * 2);
            this.ctx.fill();
          }
          
          this.ctx.globalAlpha = 0.5;
          this.ctx.fillStyle = '#9D4EDD';
          this.ctx.font = 'bold 12px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.fillText(`#${clone.index + 1}`, clone.x, clone.y - 35);
          
          this.ctx.restore();
        });
      }
      
      // === 皜脫?暺?敶勗?嚗?嚗?===
      const mimic = this.gameState.shadowMimic[playerId];
      if (!mimic || now >= mimic.expiresAt) return;
      
      this.ctx.save();
      
      // 瘛∪
      const age = now - mimic.createdAt;
      const fadeIn = Math.min(1, age / 200);
      // ????.5蝘?憪楚??
      const remaining = mimic.expiresAt - now;
      const fadeOut = remaining < 500 ? remaining / 500 : 1;
      this.ctx.globalAlpha = mimic.opacity * fadeIn * fadeOut;
      
      // ?蔣??嚗?憭扳??澈?湔楛?換?莎?
      const mimicGrad = this.ctx.createRadialGradient(
        mimic.x, mimic.y, 0,
        mimic.x, mimic.y, 55
      );
      mimicGrad.addColorStop(0, 'rgba(75, 0, 130, 0.35)');
      mimicGrad.addColorStop(1, 'rgba(75, 0, 130, 0)');
      this.ctx.fillStyle = mimicGrad;
      this.ctx.beginPath();
      this.ctx.arc(mimic.x, mimic.y, 55, 0, Math.PI * 2);
      this.ctx.fill();
      
      // 蝜芾ˊ敶勗??急鈭綽?璅∩遛?拙振?嗅??嚗?
      if (typeof stickmanAnimator !== 'undefined' && stickmanAnimator) {
        const animName = player.animation?.current || 'idle';
        const animFrames = stickmanAnimator.animations[animName] || stickmanAnimator.animations.idle;
        const frameIdx = player.animation?.frame || 0;
        const frame = animFrames ? animFrames[Math.min(frameIdx, animFrames.length - 1)] : null;
        if (frame && frame.leftLeg) {
          stickmanAnimator.drawStickman(this.ctx, mimic.x, mimic.y, frame, 'kage', mimic.facing, 0.95);
        } else {
          // ???idle 蝚砌?撟
          const idleFrame = stickmanAnimator.animations.idle[0];
          stickmanAnimator.drawStickman(this.ctx, mimic.x, mimic.y, idleFrame, 'kage', mimic.facing, 0.95);
        }
      } else {
        this.ctx.fillStyle = 'rgba(75, 0, 130, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(mimic.x, mimic.y, 18, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // 敶勗?璅?
      this.ctx.globalAlpha = 0.6;
      this.ctx.fillStyle = '#7B2FBE';
      this.ctx.font = 'bold 11px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('幻影', mimic.x, mimic.y - 38);
      
      // ?拚????內??
      const totalDur = mimic.expiresAt - mimic.createdAt;
      const progress = remaining / totalDur;
      this.ctx.strokeStyle = `rgba(147, 51, 234, ${0.5 * fadeOut})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(mimic.x, mimic.y + 30, 16, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
      this.ctx.stroke();
      
      this.ctx.restore();
    });
  }

  renderPlayerEffects(player, x, y) {
    const now = Date.now();
    let effectY = y - 100;
    
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    
    // ?弩 ?啣?嚗??＊蝷箏?拙振?凋?
    this.ctx.save();
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    
    const healthText = `${player.hp}/${player.maxHp}`;
    this.ctx.strokeText(healthText, x, y - 120);
    this.ctx.fillText(healthText, x, y - 120);
    
    // 銵???
    const barWidth = 60;
    const barHeight = 6;
    const barX = x - barWidth / 2;
    const barY = y - 105;
    
    // ?璇?
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // 銵??
    const healthPercent = player.hp / player.maxHp;
    let healthColor = '#4CAF50'; // 蝬
    if (healthPercent < 0.6) healthColor = '#FF9800'; // 璈
    if (healthPercent < 0.3) healthColor = '#F44336'; // 蝝
    
    this.ctx.fillStyle = healthColor;
    this.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    
    // 銵????
    this.ctx.strokeStyle = '#FFD700';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    this.ctx.restore();

    // ?? ?予撖拙??璇???敹??剁?
    if (player.id === 'rei' && player.spiritChargeStart) {
      const skill = player.skills.ultimate;
      const minCharge = skill.minChargeTime || 1000;
      const maxCharge = skill.maxChargeTime || 2500;
      const elapsed = now - player.spiritChargeStart;
      const chargeProgress = Math.min(elapsed / maxCharge, 1);
      const isReady = elapsed >= minCharge;
      const extraTicks = Math.floor(Math.max(0, elapsed - minCharge) / (skill.tickInterval || 200));
      const currentDmg = (skill.baseDamage || 7) + extraTicks;
      
      const cbWidth = 70;
      const cbHeight = 8;
      const cbX = x - cbWidth / 2;
      const cbY = y - 140; // 銵璇???
      
      this.ctx.save();
      // ?
      this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
      this.ctx.fillRect(cbX - 1, cbY - 1, cbWidth + 2, cbHeight + 2);
      
      // ???函憿嚗頞單???曀嚗??雲=?嚗?皛??賡?
      let fillColor;
      if (!isReady) {
        const rProg = elapsed / minCharge;
        fillColor = `rgb(255, ${Math.floor(68 + rProg * 100)}, 68)`; // 瘛梁?頧?
      } else if (chargeProgress < 1) {
        fillColor = `hsl(${45 + chargeProgress * 15}, 100%, ${50 + chargeProgress * 10}%)`; // ????
      } else {
        fillColor = '#FFFFFF'; // 皛輯??賢?嚗撠??
      }
      this.ctx.fillStyle = fillColor;
      this.ctx.shadowColor = isReady ? '#FFD700' : '#FF4444';
      this.ctx.shadowBlur = isReady ? 10 : 4;
      this.ctx.fillRect(cbX, cbY, cbWidth * chargeProgress, cbHeight);
      
      // ??剛?????
      const minX = cbX + cbWidth * (minCharge / maxCharge);
      this.ctx.shadowBlur = 0;
      this.ctx.strokeStyle = isReady ? '#4CAF50' : 'rgba(255,255,255,0.5)';
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([2, 2]);
      this.ctx.beginPath();
      this.ctx.moveTo(minX, cbY - 1);
      this.ctx.lineTo(minX, cbY + cbHeight + 1);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
      
      // ?單??瑕拿?詨?
      this.ctx.font = `bold 13px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'bottom';
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 2;
      const dmgLabel = isReady ? `??{currentDmg}` : `${currentDmg}`;
      this.ctx.strokeText(dmgLabel, x, cbY - 2);
      this.ctx.fillStyle = isReady ? '#FFD700' : '#FF7777';
      this.ctx.fillText(dmgLabel, x, cbY - 2);
      this.ctx.textBaseline = 'alphabetic';
      
      this.ctx.restore();
    }

    if (player.id === 'beastmaster') {
      this.ctx.save();
      // ?惜?詨??湔?銵璇?
      const stackText = `${player.beastStacks || 0}`;
      this.ctx.font = 'bold 16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = '#000';
      this.ctx.strokeText(stackText, x, barY + barHeight / 2);
      this.ctx.fillStyle = '#C084FC';
      this.ctx.fillText(stackText, x, barY + barHeight / 2);
      this.ctx.textBaseline = 'alphabetic';

      if (player.isGolem) {
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillStyle = '#B0BEC5';
        this.ctx.fillText("岩甲護盾: ${{Math.max(0, Math.round(player.golemShield || 0))}}", x, y - 76);
      }
      this.ctx.restore();
    }

    // ? 蝎暸???敶憿舐內
    if (player.id === 'ranger') {
      const maxAmmo = player.ammoMax || 7;
      const ammo = player.rangerAmmo !== undefined ? player.rangerAmmo : maxAmmo;
      const reloading = !!(player.rangerReloadUntil && player.rangerReloadUntil > now);
      this.ctx.save();
      const pipW = 7, pipH = 10, pipGap = 2;
      const totalW = maxAmmo * (pipW + pipGap) - pipGap;
      const startPipX = x - totalW / 2;
      const pipY = barY - 16;
      for (let i = 0; i < maxAmmo; i++) {
        const px = startPipX + i * (pipW + pipGap);
        const filled = i < ammo;
        if (reloading) {
          this.ctx.fillStyle = (Math.floor(now / 300) % 2 === 0) ? '#FF9800' : 'rgba(255,152,0,0.3)';
        } else {
          this.ctx.fillStyle = filled ? '#76FF03' : 'rgba(40,40,40,0.7)';
        }
        this.ctx.fillRect(px, pipY, pipW, pipH);
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 0.5;
        this.ctx.strokeRect(px, pipY, pipW, pipH);
      }
      if (reloading) {
        this.ctx.font = 'bold 10px Arial';
        this.ctx.fillStyle = '#FF9800';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('裝填中', x, pipY - 2);
      }
      this.ctx.restore();
    }

    // ?儭??啣?嚗蝳西風?曉?????
    if (player.effects.defending > now) {
      this.renderDefendShield(player, x, y, now);
    }
    
    // ?嗡?????＊蝷箔?蝵桀?銝矽??
    effectY = y - 80;
    
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    
    // ? ??啗??????＊蝷?
    if (player.effects.flameMark > now) {
      this.ctx.fillStyle = '#FF6B00';
      this.ctx.fillText('火焰標記', x, effectY);
      effectY -= 15;
    }
    
    if (player.effects.burning > now) {
      this.ctx.fillStyle = '#FF4444';
      this.ctx.fillText('燃燒中', x, effectY);
      effectY -= 15;
    }
    
    if (player.effects.silenced > now) {
      this.ctx.fillStyle = '#FF5722';
      this.ctx.fillText('沉默', x, effectY);
      effectY -= 15;
    }

    // ?? ????閮憿舐內
    if (player.id === 'scorpion' && player.passive) {
      const playerId = player === this.players.player1 ? 'player1' : 'player2';
      const hits = (this.gameState.scorpionConsecutiveHits[playerId] || 0) % player.passive.hitsRequired;
      this.ctx.fillStyle = '#FF9800';
      this.ctx.font = 'bold 14px Arial';
      this.ctx.fillText(`${hits}/${player.passive.hitsRequired}`, x, effectY);
      effectY -= 15;
    }

    // ?? ??皜???憿舐內
    if (player.effects.healReduction > now) {
      this.ctx.fillStyle = '#9C27B0';
      this.ctx.fillText('治療-50%', x, effectY);
      effectY -= 15;
    }
    
    if (player.effects.defending > now) {
      // ? ?寞?閫雿輻撠惇?脩戌憿
      const defendColors = {
        fujin: '#87CEEB',    // ?儭?憸典蔣 - 憭抵???
        katon: '#FF5722',    // ? ?怎 - 璈???
        suijin: '#42A5F5',   // ?? 瘞游蔣 - ?
        raijin: '#FFEB3B',   // ???瑟? - ????
        doton: '#8D6E63',    // ? 撗拍 - ????
        kage: '#8A2BE2',     // ?? ?蔣 - 蝝怨
        rei: '#FFD700',      // ? ?? - ?
        ranger: '#4CAF50'    // ? 蝎暸??? - 蝧???
      };
      this.ctx.fillStyle = defendColors[player.id] || '#2196F3';
      this.ctx.fillText('防禦中', x, effectY);
      effectY -= 15;
    }
    
    if (player.effects.shielded > now) {
      this.ctx.fillStyle = '#4CAF50';
      this.ctx.fillText('護盾', x, effectY);
      effectY -= 15;
    }
    
    if (player.effects.stunned > now) {
      this.ctx.fillStyle = '#FFC107';
      this.ctx.fillText('暈眩', x, effectY);
      effectY -= 15;
    }
    
    // ? 蝎暸????寞?
    if (player.effects.feared > now) {
      this.ctx.fillStyle = '#FF1744';
      this.ctx.fillText('恐懼', x, effectY);
      effectY -= 15;
    }
    
    if (player.effects.lightningGuard > now) {
      this.ctx.fillStyle = '#B388FF';
      this.ctx.fillText('雷電護盾', x, effectY);
      effectY -= 15;
      // 蝝恍?啁???
      this.ctx.save();
      this.ctx.strokeStyle = `rgba(179, 136, 255, ${0.4 + Math.sin(now * 0.008) * 0.3})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(x, y - 30, 35 + Math.sin(now * 0.006) * 5, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }
    
    if (player.effects.snowballBuff > now && player.effects.snowballCharges > 0) {
      this.ctx.fillStyle = '#80DEEA';
      this.ctx.fillText(`雪球 x${player.effects.snowballCharges}`, x, effectY);
      effectY -= 15;
      // 蝜芾ˊ頠??芰?
      const sbCount = player.effects.snowballCharges;
      for (let i = 0; i < sbCount; i++) {
        const angle = (now * 0.003) + (i * (Math.PI * 2 / sbCount));
        const sbX = x + Math.cos(angle) * 30;
        const sbY = (y - 30) + Math.sin(angle) * 15;
        this.ctx.save();
        this.ctx.fillStyle = '#B3E5FC';
        this.ctx.shadowColor = '#80DEEA';
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.arc(sbX, sbY, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }
    
    if (player.effects.rangerSpeedBuff > now) {
      this.ctx.fillStyle = '#4CAF50';
      this.ctx.fillText('速度提升', x, effectY);
      effectY -= 15;
    }
    
    if (player.effects.empoweredShot > 0) {
      this.ctx.fillStyle = '#FFD700';
      this.ctx.fillText('強化射擊', x, effectY);
      effectY -= 15;
    }
    
    if (player.effects.stealthActive > now) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      this.ctx.fillText('隱身中', x, effectY);
      effectY -= 15;
    }
    
    // ?弩 銵憟蝺???
    if (player.effects.bloodTether) {
      this.ctx.fillStyle = '#E53935';
      this.ctx.fillText('血鎖連線', x, effectY);
      effectY -= 15;
    }
    if (player.effects.bloodCurseTether) {
      this.ctx.fillStyle = '#B71C1C';
      this.ctx.fillText('血咒詛縛', x, effectY);
      effectY -= 15;
    }

    // ?? 鋆捱?◤???之??
    if (player.effects.adjudicatorPassiveSlow > now) {
      this.ctx.save();
      const pulse = 0.7 + Math.sin(now * 0.008) * 0.3;
      this.ctx.globalAlpha = pulse;
      this.ctx.font = 'bold 36px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('靜', x, y - 95);
      this.ctx.globalAlpha = 0.9;
      this.ctx.font = 'bold 11px Arial';
      this.ctx.fillStyle = '#FFD700';
      this.ctx.shadowColor = '#000';
      this.ctx.shadowBlur = 4;
      this.ctx.fillText('肅靜', x, y - 70);
      this.ctx.restore();
      effectY -= 30;
    }

    // ?? ?蝯瘙粹??楨??璅?
    if (player.effects.verdictSlow > now) {
      this.ctx.save();
      const slowPulse = 0.6 + Math.sin(now * 0.006) * 0.3;
      this.ctx.globalAlpha = slowPulse;
      this.ctx.fillStyle = '#FFD700';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.textAlign = 'center';
      const remaining = Math.max(0, player.effects.verdictSlow - now);
      const totalDur = 3000;
      const currentSlow = Math.round((60 - (60 - 30) * (1 - remaining / totalDur)));
      this.ctx.fillText(`減速${currentSlow}%`, x, effectY);
      this.ctx.restore();
      effectY -= 15;
    }
    
    // 霅瑞泵?∠??豢???
    if (player.effects.talismanState && player.effects.talismanState.phase === 'cycling') {
      const talisman = player.effects.talismanState;
      const cardDefs = {
        red:    { bg: '#5C1100', border: '#FF5722', icon: '#FF8A50', glow: '#FF5722' },
        purple: { bg: '#1A0845', border: '#CE93D8', icon: '#CE93D8', glow: '#B388FF' },
        blue:   { bg: '#002244', border: '#40C4FF', icon: '#80D8FF', glow: '#40C4FF' }
      };
      const cw = 22, ch = 30, gap = 30;
      const totalW = (talisman.colors.length - 1) * gap;
      const startCardX = x - totalW / 2;

      this.ctx.save();
      for (let i = 0; i < talisman.colors.length; i++) {
        const c = talisman.colors[i];
        const def = cardDefs[c];
        const isSelected = i === talisman.currentIndex;
        const cx = startCardX + i * gap;
        const scale = isSelected ? 1.35 : 1;
        const w = cw * scale;
        const h = ch * scale;
        const cardX = cx - w / 2;
        const cardY = effectY - (isSelected ? h + 8 : h + 4);

        this.ctx.save();
        if (isSelected) {
          this.ctx.shadowColor = def.glow;
          this.ctx.shadowBlur = 20;
        }
        // Card background
        this.ctx.fillStyle = isSelected ? def.bg : 'rgba(15,15,25,0.8)';
        this.ctx.strokeStyle = isSelected ? def.border : 'rgba(100,100,120,0.5)';
        this.ctx.lineWidth = isSelected ? 2.5 : 1.5;
        // Rounded rect
        const r = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(cardX + r, cardY);
        this.ctx.lineTo(cardX + w - r, cardY);
        this.ctx.quadraticCurveTo(cardX + w, cardY, cardX + w, cardY + r);
        this.ctx.lineTo(cardX + w, cardY + h - r);
        this.ctx.quadraticCurveTo(cardX + w, cardY + h, cardX + w - r, cardY + h);
        this.ctx.lineTo(cardX + r, cardY + h);
        this.ctx.quadraticCurveTo(cardX, cardY + h, cardX, cardY + h - r);
        this.ctx.lineTo(cardX, cardY + r);
        this.ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.shadowBlur = 0;
        const iconAlpha = isSelected ? 1 : 0.4;
        this.ctx.globalAlpha = iconAlpha;

        if (c === 'red') {
          // ?怎銝?敶?
          this.ctx.fillStyle = def.icon;
          this.ctx.beginPath();
          this.ctx.moveTo(cx, cardY + h * 0.18);
          this.ctx.lineTo(cx + w * 0.32, cardY + h * 0.82);
          this.ctx.lineTo(cx - w * 0.32, cardY + h * 0.82);
          this.ctx.closePath();
          this.ctx.fill();
          if (isSelected) {
            this.ctx.fillStyle = '#FFD740';
            this.ctx.beginPath();
            this.ctx.moveTo(cx, cardY + h * 0.30);
            this.ctx.lineTo(cx + w * 0.15, cardY + h * 0.74);
            this.ctx.lineTo(cx - w * 0.15, cardY + h * 0.74);
            this.ctx.closePath();
            this.ctx.fill();
          }
        } else if (c === 'purple') {
          // ?
          this.ctx.fillStyle = def.icon;
          this.ctx.beginPath();
          this.ctx.moveTo(cx + w * 0.12, cardY + h * 0.13);
          this.ctx.lineTo(cx - w * 0.18, cardY + h * 0.52);
          this.ctx.lineTo(cx + w * 0.06, cardY + h * 0.52);
          this.ctx.lineTo(cx - w * 0.12, cardY + h * 0.87);
          this.ctx.lineTo(cx + w * 0.18, cardY + h * 0.48);
          this.ctx.lineTo(cx - w * 0.06, cardY + h * 0.48);
          this.ctx.closePath();
          this.ctx.fill();
        } else if (c === 'blue') {
          // ?唳?勗耦
          this.ctx.fillStyle = def.icon;
          this.ctx.beginPath();
          this.ctx.moveTo(cx, cardY + h * 0.13);
          this.ctx.lineTo(cx + w * 0.36, cardY + h * 0.5);
          this.ctx.lineTo(cx, cardY + h * 0.87);
          this.ctx.lineTo(cx - w * 0.36, cardY + h * 0.5);
          this.ctx.closePath();
          this.ctx.fill();
          if (isSelected) {
            this.ctx.fillStyle = 'rgba(255,255,255,0.35)';
            this.ctx.beginPath();
            this.ctx.moveTo(cx, cardY + h * 0.20);
            this.ctx.lineTo(cx + w * 0.18, cardY + h * 0.5);
            this.ctx.lineTo(cx, cardY + h * 0.80);
            this.ctx.lineTo(cx - w * 0.18, cardY + h * 0.5);
            this.ctx.closePath();
            this.ctx.fill();
          }
        }
        this.ctx.globalAlpha = 1;
        this.ctx.restore();
      }
      this.ctx.restore();
      effectY -= 44;
    }
  }

  // ?儭??啣?嚗葡?蝳西風?暹???
  renderDefendShield(player, x, y, now) {
    const ctx = this.ctx;
    const defendStartTime = player.effects.defendingStartTime || now;
    const elapsed = now - defendStartTime;
    
    // ? ???脣?撅祇蝳阡???
    const defendColors = {
      fujin: { r: 135, g: 206, b: 235 },    // ?儭?憸典蔣 - 憭抵???
      katon: { r: 255, g: 87, b: 34 },      // ? ?怎 - 璈???
      suijin: { r: 66, g: 165, b: 245 },    // ?? 瘞游蔣 - ?
      raijin: { r: 255, g: 235, b: 59 },    // ???瑟? - ????
      doton: { r: 141, g: 110, b: 99 },     // ? 撗拍 - ????
      kage: { r: 138, g: 43, b: 226 },      // ?? ?蔣 - 蝝怨
      rei: { r: 255, g: 215, b: 0 },          // ? ?? - ?
      warlock: { r: 183, g: 28, b: 28 }       // ?弩 銵憟?- ????
    };
    
    const color = defendColors[player.id] || { r: 100, g: 181, b: 246 };
    
    // 霅瑞????
    const pulseScale = 1 + Math.sin(elapsed * 0.005) * 0.1;
    const pulseAlpha = 0.3 + Math.sin(elapsed * 0.008) * 0.2;
    
    // ? 蝜芾ˊ?脩戌蝚行???(憭???)
    this.renderDefendRunes(player, x, y, elapsed, color, 'outer');
    
    // 蝜芾ˊ憭???
    ctx.save();
    ctx.globalAlpha = pulseAlpha;
    
    const gradient = ctx.createRadialGradient(x, y, 30, x, y, 55 * pulseScale);
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`);
    gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`);
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 55 * pulseScale, 0, Math.PI * 2);
    ctx.fill();
    
    // 蝜芾ˊ?批?霅瑞?楠
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.9)`;
    ctx.lineWidth = 2;
    ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x, y, 45 * pulseScale, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
    
    // 嚙?蝜芾ˊ?脩戌蝚行???(?批?????)
    this.renderDefendRunes(player, x, y, elapsed, color, 'inner');
    
    // 嚙踢??蝜芾ˊ?脩戌???啁?
    this.renderDefendText(player, x, y, elapsed);
  }

  // ? ?啣?:皜脫??脩戌蝚行???
  renderDefendRunes(player, x, y, elapsed, color, layer) {
    const ctx = this.ctx;
    
    // ??瘣曉?撅祉泵?泵??
    const runeSymbols = {
      fujin: ['憸?', '撋?', '蝧?', '??'],      // ?儭?憸典蔣'
      katon: ['??', '??', '??', '??'],      // ? ?怎
      suijin: ['瘞?', '瘚?', '瘜?', '瞏?'],     // ?? 瘞游蔣
      raijin: ['??', '??', '??', '??'],     // ???瑟?
      doton: ['撗?', '??', '憯?', '摰?'],      // ? 撗拍'
      kage: ['敶?', '??', '??', '撟?'],       // ?? ?蔣
      rei: ['??', '擳?', '蟡?', '??']         // ? ??
    };
    
    const runes = runeSymbols[player.id] || ['摰?', '霅?', '??', '??'];
    
    ctx.save();
    
    // 憭?:?????頧??批?:???翰??頧?
    const isOuter = layer === 'outer';
    const radius = isOuter ? 70 : 38;
    const rotationSpeed = isOuter ? 0.0008 : -0.0015;
    const rotation = elapsed * rotationSpeed;
    const alpha = isOuter ? 0.7 : 0.9;
    const fontSize = isOuter ? 14 : 12;
    
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 蝜芾ˊ蝚行?
    for (let i = 0; i < runes.length; i++) {
      const angle = rotation + (i / runes.length) * Math.PI * 2;
      const runeX = x + Math.cos(angle) * radius;
      const runeY = y + Math.sin(angle) * radius;
      
      // 蝚行??澆???
      ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`;
      ctx.shadowBlur = 8;
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
      
      // 蝜芾ˊ蝚行?
      ctx.fillText(runes[i], runeX, runeY);
      
      // 蝚行???? (????
      if (isOuter && i < runes.length) {
        const nextAngle = rotation + ((i + 1) / runes.length) * Math.PI * 2;
        const nextX = x + Math.cos(nextAngle) * radius;
        const nextY = y + Math.sin(nextAngle) * radius;
        
        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 3;
        ctx.beginPath();
        ctx.moveTo(runeX, runeY);
        ctx.lineTo(nextX, nextY);
        ctx.stroke();
      }
    }
    
    // 銝剖?蝚行???敹?(???
    if (!isOuter) {
      ctx.shadowBlur = 12;
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`;
      ctx.font = 'bold 16px Arial';
      ctx.fillText('格擋', x, y);
    }
    
    ctx.restore();
  }

  // ? ?啣?嚗葡?蝳行?摮蝜???
  renderDefendText(player, x, y, elapsed) {
    const ctx = this.ctx;
    
    // ??瘣曉?撅祆?摮?
    const defendTexts = {
      fujin: '疾風護身，如影無形',
      katon: '烈焰護盾，熾焰難侵',
      suijin: '水幕護體，以柔克剛',
      raijin: '雷電護甲，電光護盾',
      doton: '岩甲護身，堅如磐石',
      kage: '暗影藏形，虛實難辨',
      rei: '靈力護身，魂之屏障',
    };
    
    // ? ???脣?撅祇蝳阡??莎???脣嚗?
    const defendColors = {
      fujin: '#87CEEB',    // ?儭?憸典蔣 - 憭抵???
      katon: '#FF5722',    // ? ?怎 - 璈???
      suijin: '#42A5F5',   // ?? 瘞游蔣 - ?
      raijin: '#FFEB3B',   // ???瑟? - ????
      doton: '#8D6E63',    // ? 撗拍 - ????
      kage: '#8A2BE2',     // ?? ?蔣 - 蝝怨
      rei: '#FFD700'       // ? ?? - ?
    };
    
    const text = defendTexts[player.id] || '防禦護盾展開';
    const color = defendColors[player.id] || '#64b5f6';
    const chars = text.split('');
    const radius = 60; // ???啁???
    const angleStep = (Math.PI * 2) / chars.length;
    const rotationSpeed = 0.001; // ???漲
    const baseAngle = elapsed * rotationSpeed;
    
    ctx.save();
    ctx.font = 'bold 12px "Noto Sans TC", Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 8;
    
    chars.forEach((char, i) => {
      const angle = baseAngle + angleStep * i;
      const charX = x + Math.cos(angle) * radius;
      const charY = y + Math.sin(angle) * radius;
      
      // 雿輻閫撠惇憿
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      
      // ????摨阡閫漲霈?
      const alphaFactor = 0.7 + Math.sin(angle + elapsed * 0.002) * 0.3;
      ctx.globalAlpha = alphaFactor;
      
      // 蝜芾ˊ??
      ctx.fillText(char, charX, charY);
    });
    
    ctx.restore();
  }

  renderProjectiles() {
    this.gameState.projectiles.forEach(projectile => {
      if (projectile.type === 'venomdart') {
        // 瘥?寞?皜脫? - 撠憌敶Ｙ?
        this.ctx.save();
        this.ctx.translate(projectile.x, projectile.y);
        this.ctx.shadowColor = '#00b894';
        this.ctx.shadowBlur = 8;
        
        // 憌銝駁?
        const grad = this.ctx.createLinearGradient(-10 * projectile.direction, 0, 10 * projectile.direction, 0);
        grad.addColorStop(0, '#2d3436');
        grad.addColorStop(1, '#00b894');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.moveTo(12 * projectile.direction, 0);
        this.ctx.lineTo(-6 * projectile.direction, -4);
        this.ctx.lineTo(-6 * projectile.direction, 4);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        this.ctx.restore();
      } else if (projectile.type === 'rangerArrow') {
        // ? 蝎暸???蝞剔皜脫?
        this.ctx.save();
        this.ctx.translate(projectile.x, projectile.y);
        this.ctx.shadowColor = projectile.empowered ? '#FFD700' : '#4CAF50';
        this.ctx.shadowBlur = projectile.empowered ? 12 : 6;
        
        // Arrow shaft
        const grad = this.ctx.createLinearGradient(-10 * projectile.direction, 0, 10 * projectile.direction, 0);
        grad.addColorStop(0, '#8D6E63');
        grad.addColorStop(1, projectile.empowered ? '#FFD700' : '#4CAF50');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.moveTo(14 * projectile.direction, 0);
        this.ctx.lineTo(-8 * projectile.direction, -3);
        this.ctx.lineTo(-8 * projectile.direction, 3);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Arrow tip glow
        if (projectile.empowered) {
          this.ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
          this.ctx.beginPath();
          this.ctx.arc(8 * projectile.direction, 0, 5, 0, Math.PI * 2);
          this.ctx.fill();
        }
        
        this.ctx.shadowBlur = 0;
        this.ctx.restore();
      } else if (projectile.type === 'bloodBolt') {
        // ?弩 銵憟???敶葡??
        this.ctx.save();
        this.ctx.translate(projectile.x, projectile.y);
        this.ctx.shadowColor = '#FF1744';
        this.ctx.shadowBlur = 10;
        
        const grad = this.ctx.createRadialGradient(0, 0, 2, 0, 0, 8);
        grad.addColorStop(0, '#FF5252');
        grad.addColorStop(0.6, '#B71C1C');
        grad.addColorStop(1, 'rgba(183,28,28,0)');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Inner pulsing core
        const pulse = 0.5 + Math.sin(Date.now() * 0.01) * 0.3;
        this.ctx.globalAlpha = pulse;
        this.ctx.fillStyle = '#FF1744';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        this.ctx.restore();
      } else if (projectile.type === 'shamisenNote') {
        // Shamisen note projectile - hand-drawn music note with rich VFX
        this.ctx.save();
        this.ctx.translate(projectile.x, projectile.y);
        
        const elapsed = (Date.now() - (projectile.startTime || Date.now())) / 1000;
        const bob = Math.sin(elapsed * 6) * 3;
        const spin = Math.sin(elapsed * 4) * 0.15;
        this.ctx.translate(0, bob);
        this.ctx.rotate(spin);
        
        const perfect = projectile.isPerfectPitch;
        const scale = perfect ? 1.4 : 1.0;
        this.ctx.scale(scale, scale);
        
        const noteColor = perfect ? '#FFD700' : '#F5DEB3';
        const stemColor = perfect ? '#FFF8DC' : '#D2B48C';
        
        // Outer aura ring (pulsing)
        const auraPulse = 0.3 + Math.sin(elapsed * 10) * 0.15;
        this.ctx.strokeStyle = perfect
          ? `rgba(255, 215, 0, ${auraPulse})`
          : `rgba(245, 222, 179, ${auraPulse * 0.6})`;
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(0, -4, 20 + Math.sin(elapsed * 8) * 3, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Sound wave arcs trailing behind the note
        const dir = projectile.direction || 1;
        for (let w = 0; w < 3; w++) {
          const waveOffset = -dir * (10 + w * 8);
          const waveAlpha = 0.4 - w * 0.12;
          const wavePhase = elapsed * 12 + w * 1.2;
          this.ctx.strokeStyle = perfect
            ? `rgba(255, 215, 0, ${waveAlpha + Math.sin(wavePhase) * 0.1})`
            : `rgba(245, 222, 179, ${waveAlpha + Math.sin(wavePhase) * 0.08})`;
          this.ctx.lineWidth = 1.2 - w * 0.3;
          this.ctx.beginPath();
          this.ctx.arc(waveOffset, 0, 6 + w * 4, -Math.PI * 0.4, Math.PI * 0.4);
          this.ctx.stroke();
        }
        
        // Main glow
        this.ctx.shadowColor = perfect ? '#FFD700' : '#F5DEB3';
        this.ctx.shadowBlur = perfect ? 22 : 10;
        
        // Draw note head (filled ellipse)
        this.ctx.fillStyle = noteColor;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 6, 4.5, -0.3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw stem
        this.ctx.strokeStyle = stemColor;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(5.5, -1);
        this.ctx.lineTo(5.5, -18);
        this.ctx.stroke();
        
        // Draw flag (curved tail)
        this.ctx.strokeStyle = noteColor;
        this.ctx.lineWidth = 1.8;
        this.ctx.beginPath();
        this.ctx.moveTo(5.5, -18);
        this.ctx.bezierCurveTo(12, -14, 10, -8, 5.5, -7);
        this.ctx.stroke();
        
        if (perfect) {
          // Perfect pitch: add a second note connected by beam
          this.ctx.fillStyle = '#FFD700';
          this.ctx.beginPath();
          this.ctx.ellipse(-10, 2, 6, 4.5, -0.3, 0, Math.PI * 2);
          this.ctx.fill();
          
          // Second stem
          this.ctx.strokeStyle = '#FFF8DC';
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.moveTo(-4.5, 1);
          this.ctx.lineTo(-4.5, -16);
          this.ctx.stroke();
          
          // Beam connecting the two notes
          this.ctx.fillStyle = '#FFD700';
          this.ctx.beginPath();
          this.ctx.moveTo(-4.5, -16);
          this.ctx.lineTo(5.5, -18);
          this.ctx.lineTo(5.5, -15);
          this.ctx.lineTo(-4.5, -13);
          this.ctx.closePath();
          this.ctx.fill();
          
          // Golden sparkle ring (pulsing)
          this.ctx.strokeStyle = `rgba(255, 215, 0, ${0.4 + Math.sin(elapsed * 8) * 0.2})`;
          this.ctx.lineWidth = 1.5;
          this.ctx.beginPath();
          this.ctx.arc(-2, -6, 16 + Math.sin(elapsed * 8) * 3, 0, Math.PI * 2);
          this.ctx.stroke();
          
          // Rotating sparkle dots around perfect note
          for (let s = 0; s < 4; s++) {
            const sparkAngle = elapsed * 5 + (Math.PI * 2 / 4) * s;
            const sparkR = 22 + Math.sin(elapsed * 6 + s) * 3;
            const sx = -2 + Math.cos(sparkAngle) * sparkR;
            const sy = -6 + Math.sin(sparkAngle) * sparkR;
            const sparkAlpha = 0.6 + Math.sin(elapsed * 8 + s * 2) * 0.4;
            this.ctx.fillStyle = `rgba(255, 255, 200, ${sparkAlpha})`;
            this.ctx.shadowColor = '#FFD700';
            this.ctx.shadowBlur = 6;
            this.ctx.beginPath();
            this.ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
            this.ctx.fill();
          }
        }
        
        this.ctx.shadowBlur = 0;
        this.ctx.restore();
      } else if (projectile.type === 'bloodShackle') {
        // ?弩 銵??撠皜脫? - ??撘?
        this.ctx.save();
        this.ctx.translate(projectile.x, projectile.y);
        this.ctx.shadowColor = '#E53935';
        this.ctx.shadowBlur = 12;
        
        // Chain link appearance
        const time = Date.now() * 0.008;
        this.ctx.strokeStyle = '#E53935';
        this.ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
          const ox = (i - 1) * 8 * projectile.direction;
          this.ctx.beginPath();
          this.ctx.ellipse(ox, 0, 5, 3, time + i, 0, Math.PI * 2);
          this.ctx.stroke();
        }
        // Blood glow center
        this.ctx.fillStyle = '#FF1744';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        this.ctx.restore();
      } else if (projectile.type === 'shadowKunai') {
        // ?儭?Exile Blade shadow kunai ??dark-cyan/black slim kunai with smoke trail
        this.ctx.save();
        this.ctx.translate(projectile.x, projectile.y);
        this.ctx.shadowColor = 'rgba(0, 139, 139, 0.9)';
        this.ctx.shadowBlur = 12;

        // Slim kunai body
        const kunaiDir = projectile.direction;
        const kunaiGrad = this.ctx.createLinearGradient(-12 * kunaiDir, 0, 12 * kunaiDir, 0);
        kunaiGrad.addColorStop(0, '#000');
        kunaiGrad.addColorStop(0.5, '#008B8B');
        kunaiGrad.addColorStop(1, '#00CED1');
        this.ctx.fillStyle = kunaiGrad;
        this.ctx.beginPath();
        this.ctx.moveTo(14 * kunaiDir, 0);
        this.ctx.lineTo(-4 * kunaiDir, -3);
        this.ctx.lineTo(-8 * kunaiDir, 0);
        this.ctx.lineTo(-4 * kunaiDir, 3);
        this.ctx.closePath();
        this.ctx.fill();

        // Kunai ring at tail
        this.ctx.strokeStyle = '#008B8B';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(-10 * kunaiDir, 0, 3, 0, Math.PI * 2);
        this.ctx.stroke();

        // Smoke trail behind kunai
        const kunaiTime = Date.now() * 0.01;
        for (let i = 1; i <= 4; i++) {
          const trailAlpha = 0.5 - i * 0.1;
          const kox = -i * 10 * kunaiDir;
          const koy = Math.sin(kunaiTime + i) * 3;
          this.ctx.fillStyle = `rgba(0, 60, 60, ${trailAlpha})`;
          this.ctx.beginPath();
          this.ctx.arc(kox, koy, 3 + i * 0.8, 0, Math.PI * 2);
          this.ctx.fill();
        }

        this.ctx.shadowBlur = 0;
        this.ctx.restore();
      } else {
        this.ctx.fillStyle = projectile.type === 'fireball' ? '#FF4444' : 
                            projectile.type === 'waterdragon' ? '#4444FF' : '#FF44FF';
        this.ctx.beginPath();
        this.ctx.arc(projectile.x, projectile.y, 8, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
  }

  renderUI() {
    // 皜脫???閮
    if (this.gameState.winner) {
      const winner = this.players[this.gameState.winner];
      const loser = this.players[this.gameState.winner === 'player1' ? 'player2' : 'player1'];
      
      // ?????拙??恍?畾?
      if (!this.gameState.victoryAnimation) {
        const isFujinVsExile = (winner.id === 'fujin' && loser.id === 'exileblade');
        this.gameState.victoryAnimation = {
          startTime: Date.now(),
          particles: [],
          phase: 'execution',
          executionStartTime: Date.now(),
          fujinSpecialVideo: isFujinVsExile
        };
        if (isFujinVsExile && typeof window !== 'undefined' && window.showFujinVictoryVideo) {
          window.showFujinVictoryVideo();
        }
      }

      const elapsed = Date.now() - this.gameState.victoryAnimation.startTime;

      // 階段1：執行動畫（0-15秒）
      if (elapsed < 15000) {
        if (this.gameState.victoryAnimation.fujinSpecialVideo) {
          this.ctx.fillStyle = '#000';
          this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        } else {
          this.renderExecutionScene(winner, loser, elapsed);
        }
      }
      // ?? ?挾2嚗??拍??(15蝘?)
      else {
        // ???啣??拚?畾菜?????摮?
        if (this.gameState.victoryAnimation.phase === 'execution') {
          this.gameState.victoryAnimation.phase = 'victory';
          this.gameState.victoryAnimation.victoryStartTime = Date.now();
          this.createVictoryParticles(winner);
        }
        
        this.renderVictoryScreen(winner);
      }
      
      return;
    }
  }

  // ?? ?啣?嚗撱箏??拍?摮??
  createVictoryParticles(winner) {
    const particleCount = 80;
    const colors = this.getCharacterColors(winner.id);
    
    for (let i = 0; i < particleCount; i++) {
      this.gameState.victoryAnimation.particles.push({
        x: Math.random() * this.canvasWidth,
        y: this.canvasHeight + Math.random() * 200,
        vx: (Math.random() - 0.5) * 3,
        vy: -(Math.random() * 5 + 3),
        size: Math.random() * 8 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      });
    }
  }

  // ? ?啣?嚗???脣?撅祇???
  getCharacterColors(characterId) {
    const colorSchemes = {
      fujin: ['#87CEEB', '#00BFFF', '#1E90FF', '#FFFFFF'],      // 憸?- ?蝟?
      katon: ['#FF4500', '#FF6347', '#FFD700', '#FFA500'],     // ??- 璈??頂
      suijin: ['#00CED1', '#4682B4', '#87CEEB', '#E0FFFF'],    // 瘞?- ??蝟?
      raijin: ['#FFD700', '#FFFF00', '#FFA500', '#FFFFFF'],    // ??- ??蝟?
      doton: ['#8B4513', '#A0522D', '#D2691E', '#CD853F'],     // ??- 璉?蝟?
      kage: ['#8A2BE2', '#9370DB', '#DDA0DD', '#4B0082'],      // 敶?- 蝝怎頂
      rei: ['#FFD700', '#FFFFFF', '#F0E68C', '#FAFAD2'],        // ??- ?蝟?
      dokusei: ['#00b894', '#55efc4', '#2d3436', '#6c5ce7'],    // 瘥?- 蝬換蝟?
      taijutsu: ['#D32F2F', '#FF5252', '#212121', '#FF1744'],     // 擃? - 蝝?蝟?
      ranger: ['#4CAF50', '#FFD700', '#81C784', '#A5D6A7'],        // 蝎暸? - 蝬?蝟?
      warlock: ['#B71C1C', '#E53935', '#FF1744', '#4A0000'],         // 銵憟?- ??蝟?
      beastmaster: ['#616161', '#8D6E63', '#B0BEC5', '#263238'],      // 敺∠ - 撗拍蝟?
      exileblade: ['#008B8B', '#00CED1', '#000000', '#00FFFF']         // ?◢ - ??暺頂
    };
    
    return colorSchemes[characterId] || ['#FFD700', '#FFFFFF'];
  }

  // ? ?捱?湔頝舐??
  renderExecutionScene(winner, loser, elapsed) {
    const ctx = this.ctx;
    
    // ????瘨脩?摮頂蝯?
    if (!this.gameState.victoryAnimation.bloodParticles) {
      this.gameState.victoryAnimation.bloodParticles = [];
    }
    
    // ???擃??Ｙ頂蝯?
    if (!this.gameState.victoryAnimation.severedParts) {
      this.gameState.victoryAnimation.severedParts = [];
    }
    
    // ?寞?????脫葡?????捱?
    switch(winner.id) {
      case 'fujin':
        this.renderWindExecution(ctx, elapsed, winner, loser);
        break;
      case 'katon':
        this.renderFireExecution(ctx, elapsed, winner, loser);
        break;
      case 'suijin':
        this.renderWaterExecution(ctx, elapsed, winner, loser);
        break;
      case 'raijin':
        this.renderThunderExecution(ctx, elapsed, winner, loser);
        break;
      case 'doton':
        this.renderEarthExecution(ctx, elapsed, winner, loser);
        break;
      case 'kage':
        this.renderShadowExecution(ctx, elapsed, winner, loser);
        break;
      case 'rei':
        this.renderSpiritExecution(ctx, elapsed, winner, loser);
        break;
      case 'dokusei':
        this.renderPoisonExecution(ctx, elapsed, winner, loser);
        break;
      case 'taijutsu':
        this.renderTaijutsuExecution(ctx, elapsed, winner, loser);
        break;
      case 'ranger':
        this.renderRangerExecution(ctx, elapsed, winner, loser);
        break;
      case 'warlock':
        this.renderWarlockExecution(ctx, elapsed, winner, loser);
        break;
      case 'ronin':
        this.renderRoninExecution(ctx, elapsed, winner, loser);
        break;
      case 'beastmaster':
        this.renderBeastmasterExecution(ctx, elapsed, winner, loser);
        break;
      case 'scorpion':
        this.renderScorpionExecution(ctx, elapsed, winner, loser);
        break;
      case 'exileblade':
        this.renderExileBladeVictoryExecution(ctx, elapsed, winner, loser);
        break;
      default:
        this.renderDefaultExecution(ctx, elapsed, winner, loser);
    }
    
    // 皜脫?銝行?啗?瘨脩?摮?
    this.updateAndRenderBloodParticles(ctx);
    
    // 皜脫?銝行?唳??
    this.updateAndRenderSeveredParts(ctx, loser);
  }

  // ?? 銵瘨脩?摮頂蝯?- 蝎曄陛??(靽?閬?皜)
  createBloodSplatter(x, y, intensity = 1, direction = 0) {
    // 蝖祆找???頞?300??瘨脩?摮停銝???
    if (this.gameState.victoryAnimation.bloodParticles.length >= 300) return;
    const particleCount = Math.floor(8 * intensity); // 憭批?皜?
    
    for (let i = 0; i < particleCount; i++) {
      const angle = direction + (Math.random() - 0.5) * Math.PI;
      const speed = (3 + Math.random() * 5) * intensity;
      
      this.gameState.victoryAnimation.bloodParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 2,
        size: 3 + Math.random() * 4,
        life: 1,
        gravity: 0.5,
        color: '#8B0000',
        trail: []
      });
    }
    
    // 璆萄????折?蝬?
    if (intensity > 2) {
      for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        this.gameState.victoryAnimation.bloodParticles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * 1.5,
          vy: Math.sin(angle) * 1.5 - 1,
          size: 15 + Math.random() * 10,
          life: 0.4,
          gravity: 0.05,
          color: `rgba(139, 0, 0, 0.25)`,
          isMist: true
        });
      }
    }
  }

  // ?弩 ?萄遣?瑁嚗???蝑?- 璆萇陛銵瘨脩?
  createSeveredPart(x, y, partType, characterId, velocity = {vx: 0, vy: 0}) {
    this.gameState.victoryAnimation.severedParts.push({
      x: x,
      y: y,
      vx: velocity.vx || (Math.random() - 0.5) * 10,
      vy: velocity.vy || -(Math.random() * 10 + 6),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.4,
      partType: partType,
      characterId: characterId,
      life: 1,
      gravity: 0.5,
      bounced: false,
      bloodTimer: 0
    });
    
    // ?瑁???銵?喳
    this.createBloodSplatter(x, y, 1.5, Math.atan2(velocity.vy, velocity.vx));
    
    // 1-2??憛?蝬?
    for (let i = 0; i < 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      this.gameState.victoryAnimation.bloodParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 2,
        size: 2 + Math.random() * 3,
        life: 1,
        gravity: 0.6,
        color: '#4A0000',
        isFlesh: true
      });
    }
  }

  // ?湔銝行葡???- 皜?憌?銝剔??渲?
  updateAndRenderSeveredParts(ctx, loser) {
    const parts = this.gameState.victoryAnimation.severedParts;
    
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      
      // ?湔?拍?
      part.x += part.vx;
      part.y += part.vy;
      part.vy += part.gravity;
      part.vx *= 0.98;
      part.rotation += part.rotationSpeed;
      part.life -= 0.003;
      
      // ?? 皜?憌?銝剔??渲??餌?
      part.bloodTimer++;
      if (part.bloodTimer % 16 === 0 && part.life > 0.5 && this.gameState.victoryAnimation.bloodParticles.length < 300) {
        // 瘥?6撟?港?甈?銝?函??賢潮???
        const angle = Math.random() * Math.PI * 2;
        this.gameState.victoryAnimation.bloodParticles.push({
          x: part.x,
          y: part.y,
          vx: Math.cos(angle) * 1.5 - part.vx * 0.3,
          vy: Math.sin(angle) * 1.5 - part.vy * 0.3,
          size: 2 + Math.random() * 2,
          life: 0.6,
          gravity: 0.5,
          color: '#8B0000'
        });
      }
      
      // ?圈蝣唳? - 撠?瞈箄?
      if (part.y > this.canvasHeight - 100 && part.vy > 0) {
        if (!part.bounced) {
          // ?? ?賢撠?瞈箄?嚗?雿萇銝甈∴?
          this.createBloodSplatter(part.x, this.canvasHeight - 100, 1, Math.PI / 2);
          part.vy *= -0.4;
          part.vx *= 0.7;
          part.rotationSpeed *= 0.5;
          part.bounced = true;
        } else {
          part.vy = 0;
          part.vx *= 0.9;
          part.y = this.canvasHeight - 100;
        }
      }
      
      // 蝘駁瘨仃?擃?
      if (part.life <= 0) {
        parts.splice(i, 1);
        continue;
      }
      
      // 皜脫??瑁
      ctx.save();
      ctx.globalAlpha = Math.min(1, part.life);
      ctx.translate(part.x, part.y);
      ctx.rotate(part.rotation);
      ctx.scale(2, 2);
      
      const colors = stickmanAnimator.schoolColors[part.characterId] || stickmanAnimator.schoolColors.katon;
      
      // ?寞??其?蝜芾ˊ
      switch(part.partType) {
        case 'head':
          // ?剝
          ctx.strokeStyle = colors.primary;
          ctx.fillStyle = colors.accent;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // 銵瘛????
          ctx.fillStyle = '#8B0000';
          ctx.beginPath();
          ctx.arc(0, 15, 12, 0, Math.PI);
          ctx.fill();
          
          // ?潛?嚗香鈭∠???
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(-5, -3, 2, 0, Math.PI * 2);
          ctx.arc(5, -3, 2, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'leftArm':
        case 'rightArm':
          // ??
          ctx.strokeStyle = colors.primary;
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 40);
          ctx.stroke();
          
          // ?瑕瘚?
          ctx.fillStyle = '#8B0000';
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'leftLeg':
        case 'rightLeg':
          // ?輸
          ctx.strokeStyle = colors.primary;
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, 50);
          ctx.stroke();
          
          // ?瑕瘚?
          ctx.fillStyle = '#8B0000';
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();
          break;
      }
      
      ctx.restore();
      
      // 憌?銝剜?蝥輕銵嚗之撟?雿??
      if (Math.random() > 0.97 && part.vy < 5) {
        this.createBloodSplatter(part.x, part.y, 0.3, Math.PI / 2);
      }
    }
  }

  // ?湔銝行葡??瘨脩?摮?- 頞?銵?亙撥??
  updateAndRenderBloodParticles(ctx) {
    const particles = this.gameState.victoryAnimation.bloodParticles;
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      
      // ?湔雿蔭
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.life -= p.isMist ? 0.015 : 0.008; // 銵?扳???敹?
      
      // 蝘駁甇颱滿蝎?
      if (p.life <= 0 || p.y > this.canvasHeight + 50) {
        particles.splice(i, 1);
        continue;
      }
      
      // 皜脫?銵皛?銵??
      ctx.save();
      ctx.globalAlpha = p.life * 0.95;
      
      if (p.isMist) {
        // ?? 銵?扳???
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.isFlesh) {
        // ?? ??蝣?
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
      } else {
        // ?? 銵皛湛??渡?撖衣????嚗?
        ctx.fillStyle = p.color;
        
        const velocityMag = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const stretchY = Math.max(1, velocityMag * 0.8); // ?湔?憿舐??
        
        ctx.beginPath();
        ctx.ellipse(
          p.x, p.y, 
          p.size, p.size * stretchY, 
          Math.atan2(p.vy, p.vx) + Math.PI / 2, 
          0, Math.PI * 2
        );
        ctx.fill();
        
        // ?? 銵皛游偏頝?
        if (velocityMag > 3) {
          ctx.globalAlpha = p.life * 0.5;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
          ctx.stroke();
        }
      }
      
      // ?? ?圈銵瘙??游之?湔?憿荔?
      if (p.y > this.canvasHeight - 110 && p.vy > 0 && !p.isMist) {
        ctx.globalAlpha = Math.min(p.life * 0.6, 0.8);
        ctx.fillStyle = '#4A0000';
        ctx.beginPath();
        ctx.arc(p.x, this.canvasHeight - 50, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
  }

  // 嚙踝? 憸函??捱嚗??脤◢蝯捏
  renderWindExecution(ctx, elapsed, winner, loser) {
    // ?瞍豢?
    const bgAlpha = Math.min(0.85, elapsed / 1000);
    ctx.fillStyle = `rgba(10, 20, 40, ${bgAlpha})`;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // ???典椰??
    if (elapsed > 500) {
      ctx.save();
      ctx.translate(200, this.canvasHeight / 2);
      ctx.scale(3, 3);
      const winnerFrame = {
        head: { x: 0, y: 0, rotation: 0 },
        body: { rotation: 0 },
        leftArm: { upperRotation: -90, lowerRotation: -45 },
        rightArm: { upperRotation: 20, lowerRotation: 10 },
        leftLeg: { upperRotation: 0, lowerRotation: 0 },
        rightLeg: { upperRotation: 0, lowerRotation: 0 }
      };
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, winnerFrame, winner.id, 1, 1);
      }
      ctx.restore();
    }
    
    // 樴憸函???(2-10蝘? - 頞??撥??
    if (elapsed > 2000 && elapsed < 10000) {
      const tornadoProgress = (elapsed - 2000) / 8000;
      const tornadoX = this.canvasWidth - 300;
      const tornadoY = this.canvasHeight / 2;
      
      // ?儭?銝駁??脤◢?箸? - 憭惜蝯?
      // 憭惜憭扯??(25??摮?
      for (let i = 0; i < 25; i++) {
        const angle = (elapsed * 0.015 + i * 0.5) % (Math.PI * 2);
        const radius = (1 - i / 25) * 150 * tornadoProgress;
        const height = i * 20;
        const x = tornadoX + Math.cos(angle) * radius;
        const y = tornadoY - height + Math.sin(elapsed * 0.008 + i) * 20;
        
        ctx.fillStyle = `rgba(135, 206, 235, ${0.7 - i * 0.024})`;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // 銝剖惜?箸? (20??摮????頧?
      for (let i = 0; i < 20; i++) {
        const angle = (-elapsed * 0.02 + i * 0.6) % (Math.PI * 2);
        const radius = (1 - i / 20) * 100 * tornadoProgress;
        const height = i * 18;
        const x = tornadoX + Math.cos(angle) * radius;
        const y = tornadoY - height + Math.sin(elapsed * 0.006 + i) * 15;
        
        ctx.fillStyle = `rgba(173, 216, 230, ${0.8 - i * 0.03})`;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // ?批惜敹恍??(15??摮?
      for (let i = 0; i < 15; i++) {
        const angle = (elapsed * 0.025 + i * 0.8) % (Math.PI * 2);
        const radius = (1 - i / 15) * 60 * tornadoProgress;
        const height = i * 16;
        const x = tornadoX + Math.cos(angle) * radius;
        const y = tornadoY - height + Math.sin(elapsed * 0.01 + i) * 10;
        
        ctx.fillStyle = `rgba(224, 255, 255, ${0.9 - i * 0.04})`;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // ?? 憸其???摮?(???璇???
      for (let i = 0; i < 12; i++) {
        const angle = (elapsed * 0.03 + i * 1.0) % (Math.PI * 2);
        const radius = (1 - i / 12) * 120 * tornadoProgress;
        const height = i * 24;
        const x = tornadoX + Math.cos(angle) * radius;
        const y = tornadoY - height;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 - i * 0.04})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(10, 0);
        ctx.stroke();
        ctx.restore();
      }
      
      // ? 憭?皜行?瘞?? (?啁???)
      for (let i = 0; i < 25; i++) {
        const angle = (elapsed * 0.008 + i * 0.25) % (Math.PI * 2);
        const radius = 180 + Math.sin(elapsed * 0.005 + i) * 30;
        const x = tornadoX + Math.cos(angle) * radius;
        const y = tornadoY - (i % 10) * 30 + Math.sin(elapsed * 0.003 + i) * 25;
        
        ctx.fillStyle = `rgba(175, 238, 238, ${0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // ?儭?樴憸典??典△???
      if (tornadoProgress > 0.3) {
        for (let i = 0; i < 15; i++) {
          const angle = (elapsed * 0.005 + i * 0.4) % (Math.PI * 2);
          const radius = 80 + i * 8;
          const x = tornadoX + Math.cos(angle) * radius;
          const y = tornadoY + 10;
          
          ctx.fillStyle = `rgba(192, 192, 192, ${0.4 - i * 0.02})`;
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // ?? 鋡恍◢?鋆?璆萄??渲? (靽?閬?)
      if (elapsed > 4000 && Math.random() > 0.92) {
        this.createBloodSplatter(
          tornadoX + (Math.random() - 0.5) * 100, 
          tornadoY - Math.random() * 180, 
          0.8,
          Math.random() * Math.PI * 2
        );
      }
      
      // 銝＊蝷箄???(閬??格?)
      
      // ?弩 ?鋡恍◢??敹???
      const loserX = this.canvasWidth - 300;
      const loserY = this.canvasHeight / 2;
      
      if (!this.gameState.victoryAnimation.windDismembered) {
        this.gameState.victoryAnimation.windDismembered = {};
      }
      
      // ?? 撌西?鋡恍◢????
      if (elapsed > 5000 && elapsed < 5100 && !this.gameState.victoryAnimation.windDismembered.leftArm) {
        this.createSeveredPart(loserX - 30, loserY - 20, 'leftArm', loser.id, {vx: -10, vy: -12});
        this.createBloodSplatter(loserX - 30, loserY - 20, 1.5, Math.PI);
        this.gameState.victoryAnimation.windDismembered.leftArm = true;
      }
      
      // ?? ?唾?鋡恍◢??鋆?
      if (elapsed > 6000 && elapsed < 6100 && !this.gameState.victoryAnimation.windDismembered.rightArm) {
        this.createSeveredPart(loserX + 30, loserY - 20, 'rightArm', loser.id, {vx: 10, vy: -12});
        this.createBloodSplatter(loserX + 30, loserY - 20, 1.5, 0);
        this.gameState.victoryAnimation.windDismembered.rightArm = true;
      }
      
      // ?? 撌西鋡怠???
      if (elapsed > 7000 && elapsed < 7100 && !this.gameState.victoryAnimation.windDismembered.leftLeg) {
        this.createSeveredPart(loserX - 15, loserY + 40, 'leftLeg', loser.id, {vx: -8, vy: -10});
        this.createBloodSplatter(loserX - 15, loserY + 40, 1.5, Math.PI);
        this.gameState.victoryAnimation.windDismembered.leftLeg = true;
      }
      
      // ?? ?唾鋡急?鋆?
      if (elapsed > 8000 && elapsed < 8100 && !this.gameState.victoryAnimation.windDismembered.rightLeg) {
        this.createSeveredPart(loserX + 15, loserY + 40, 'rightLeg', loser.id, {vx: 8, vy: -10});
        this.createBloodSplatter(loserX + 15, loserY + 40, 1.5, 0);
        this.gameState.victoryAnimation.windDismembered.rightLeg = true;
      }
      
      // ???? ?剝§鋡恍◢?憌?(??????
      if (elapsed > 9000 && elapsed < 9100 && !this.gameState.victoryAnimation.windDismembered.head) {
        this.createSeveredPart(loserX, loserY - 80, 'head', loser.id, {vx: (Math.random() - 0.5) * 5, vy: -16});
        // ?賊?渲? (撠?)
        this.createBloodSplatter(loserX, loserY - 60, 2.5, Math.PI / 2);
        this.gameState.victoryAnimation.windDismembered.head = true;
      }
    }
    
    // ?◤?脣 (3-9蝘? - ?????!
    // 9蝘??芸頠撟對???撌脩?憌粥嚗?
    if (elapsed > 3000 && elapsed < 9000) {
      const pullProgress = Math.min(1, (elapsed - 3000) / 6000);
      const loserX = this.canvasWidth - 300 - (1 - pullProgress) * 500;
      const loserY = this.canvasHeight / 2 - pullProgress * 200 + Math.sin(elapsed * 0.02) * pullProgress * 50;
      const loserRotation = pullProgress * Math.PI * 8;
      const loserAlpha = 1 - pullProgress * 0.7;
      
      // ?? ????? - 頨恍????賣?!
      const struggleIntensity = (1 - pullProgress) * 25; // 頞餈香鈭⊥???撘?
      const struggleX = Math.sin(elapsed * 0.05) * struggleIntensity;
      const struggleY = Math.cos(elapsed * 0.07) * struggleIntensity * 0.5;
      
      ctx.save();
      ctx.globalAlpha = loserAlpha;
      ctx.translate(loserX + struggleX, loserY + struggleY);
      ctx.rotate(loserRotation);
      ctx.scale(3 * (1 - pullProgress * 0.4), 3 * (1 - pullProgress * 0.4));
      
      // ?寞???瘙箏?憿舐內?芯??ａ?
      const showLeftArm = elapsed < 5000;
      const showRightArm = elapsed < 6000;
      const showLeftLeg = elapsed < 7000;
      const showRightLeg = elapsed < 8000;
      const showHead = elapsed < 9000;
      
      // ??蝜芾ˊ頨恍??其?
      const colors = stickmanAnimator.schoolColors[loser.id];
      
      // 頠撟對?瘞賊?憿舐內嚗?
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(0, 30);
      ctx.stroke();
      
      // ?剝嚗?蝘?憿舐內嚗?
      if (showHead) {
        ctx.strokeStyle = colors.primary;
        ctx.fillStyle = colors.accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -50, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        // ?琿瘚?
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(0, -30, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // 撌西?嚗?蝘?憿舐內嚗?
      if (showLeftArm) {
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-10, -20);
        ctx.lineTo(-40, 10);
        ctx.stroke();
      } else {
        // ?瑁?瘚?
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(-10, -20, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // ?唾?嚗?蝘?憿舐內嚗?
      if (showRightArm) {
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(10, -20);
        ctx.lineTo(40, 10);
        ctx.stroke();
      } else {
        // ?瑁?瘚?
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(10, -20, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // 撌西嚗?蝘?憿舐內嚗?
      if (showLeftLeg) {
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-5, 30);
        ctx.lineTo(-15, 70);
        ctx.stroke();
      } else {
        // ?瑁瘚?
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(-5, 30, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // ?唾嚗?蝘?憿舐內嚗?
      if (showRightLeg) {
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(5, 30);
        ctx.lineTo(15, 70);
        ctx.stroke();
      } else {
        // ?瑁瘚?
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(5, 30, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
    
    // 9蝘??芷＊蝷箸?蝻箄?撟對??撓瘨仃嚗?
    if (elapsed >= 9000 && elapsed < 12000) {
      const fadeProgress = (elapsed - 9000) / 3000;
      const loserX = this.canvasWidth - 300;
      const loserY = this.canvasHeight / 2;
      
      ctx.save();
      ctx.globalAlpha = 1 - fadeProgress;
      ctx.translate(loserX, loserY);
      ctx.rotate(fadeProgress * Math.PI);
      ctx.scale(3, 3);
      
      const colors = stickmanAnimator.schoolColors[loser.id];
      
      // ?芸頠撟?
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(0, 30);
      ctx.stroke();
      
      // ?????銵
      ctx.fillStyle = '#8B0000';
      ctx.beginPath();
      ctx.arc(0, -30, 8, 0, Math.PI * 2);  // ?賊
      ctx.arc(-10, -20, 4, 0, Math.PI * 2); // 撌西
      ctx.arc(10, -20, 4, 0, Math.PI * 2);  // ?唾
      ctx.arc(-5, 30, 4, 0, Math.PI * 2);   // 撌西??
      ctx.arc(5, 30, 4, 0, Math.PI * 2);    // ?唾??
      ctx.fill();
      
      ctx.restore();
    }
    
    // ?捱摰??內 (12-15蝘?
    if (elapsed > 12000) {
      const textAlpha = Math.min(1, (elapsed - 12000) / 1000);
      ctx.save();
      ctx.globalAlpha = textAlpha;
      ctx.font = 'bold 50px "Noto Sans TC", Arial';
      ctx.fillStyle = '#87CEEB';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#00BFFF';
      ctx.shadowBlur = 30;
      ctx.fillText('疾風無痕...消逝', this.canvasWidth / 2, 150);
      ctx.restore();
    }
  }

  // ? ?怎?捱:璆剔?澈 - 頞??撥??
  renderFireExecution(ctx, elapsed, winner, loser) {
    // ?嚗?瘚?
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, '#1a0000');
    gradient.addColorStop(0.5, '#4a0000');
    gradient.addColorStop(1, '#8B0000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // ?瘜尿??
    if (elapsed > 500) {
      ctx.save();
      ctx.translate(200, this.canvasHeight / 2 + 50);
      ctx.scale(3, 3);
      
      const winnerFrame = {
        head: { x: 0, y: 0, rotation: -10 },
        body: { rotation: 0 },
        leftArm: { upperRotation: -120, lowerRotation: -60 },
        rightArm: { upperRotation: 120, lowerRotation: 60 },
        leftLeg: { upperRotation: 20, lowerRotation: -20 },
        rightLeg: { upperRotation: -20, lowerRotation: 20 }
      };
      
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, winnerFrame, winner.id, 1, 1);
      }
      ctx.restore();
    }
    
    // ? ?圈?怎?辣 (2-12蝘?
    if (elapsed > 2000) {
      const burnProgress = Math.min(1, (elapsed - 2000) / 10000);
      const loserX = this.canvasWidth - 300;
      const loserY = this.canvasHeight / 2 + 50;
      const groundY = this.canvasHeight - 100;
      
      // ? ?圈??? (敺?Ｗ?銝???
      for (let i = 0; i < 40; i++) {
        const x = loserX - 100 + (i % 20) * 10;
        const flameHeight = 80 + Math.sin(elapsed * 0.01 + i) * 30;
        const y = groundY - (Math.random() * flameHeight * burnProgress);
        
        // ?怎憿霈? (璈?暺???
        const colorIndex = Math.floor(Math.random() * 3);
        const flameColors = ['#FF4500', '#FFA500', '#FFD700'];
        ctx.fillStyle = flameColors[colorIndex];
        ctx.beginPath();
        ctx.arc(x, y, 6 + Math.random() * 8, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // ? ?????(?箸?銝?)
      for (let i = 0; i < 50; i++) {
        const angle = (i / 50) * Math.PI * 2 + elapsed * 0.008;
        const radius = 60 + Math.sin(elapsed * 0.01 + i) * 20;
        const height = (i % 25) * 8 * burnProgress;
        const x = loserX + Math.cos(angle) * radius;
        const y = loserY - height + Math.sin(angle + elapsed * 0.005) * 10;
        
        ctx.fillStyle = i % 3 === 0 ? '#FF4500' : i % 3 === 1 ? '#FFA500' : '#FFD700';
        ctx.beginPath();
        ctx.arc(x, y, 4 + Math.random() * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // ? ???急???
      for (let i = 0; i < 15; i++) {
        const angle = (elapsed * 0.02 + i * 0.2) % (Math.PI * 2);
        const speed = 2 + Math.random() * 3;
        const distance = (elapsed - 2000) * speed * 0.1;
        const x = loserX + Math.cos(angle) * distance;
        const y = loserY + Math.sin(angle) * distance - distance * 0.5;
        
        if (distance < 200) {
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // ? ?賜??唳敹?(?擃澈)
      if (burnProgress > 0.5) {
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 40;
        ctx.fillStyle = `rgba(255, 255, 255, ${(burnProgress - 0.5) * 0.8})`;
        ctx.beginPath();
        ctx.arc(loserX, loserY, 40, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // ??? ???扔撠銵 (靽?閬?皜)
      if (elapsed > 3000 && elapsed < 10000) {
        // ?嗥?渲??喳
        if (Math.random() > 0.85) {
          this.createBloodSplatter(
            loserX + (Math.random() - 0.5) * 60, 
            loserY + (Math.random() - 0.5) * 60, 
            0.8,
            Math.random() * Math.PI * 2
          );
        }
      }
      
      // ??? ???怨
      if (!this.gameState.victoryAnimation.fireBurned) {
        this.gameState.victoryAnimation.fireBurned = {};
      }
      
      // ?? 撌西??? (5蝘?
      if (elapsed > 5000 && elapsed < 5100 && !this.gameState.victoryAnimation.fireBurned.leftArm) {
        this.createSeveredPart(loserX - 30, loserY - 20, 'leftArm', loser.id, {vx: -8, vy: -10});
        this.createBloodSplatter(loserX - 30, loserY - 20, 1.5, Math.PI);
        this.gameState.victoryAnimation.fireBurned.leftArm = true;
      }
      
      // ?? ?唾?? (6蝘?
      if (elapsed > 6000 && elapsed < 6100 && !this.gameState.victoryAnimation.fireBurned.rightArm) {
        this.createSeveredPart(loserX + 30, loserY - 20, 'rightArm', loser.id, {vx: 8, vy: -10});
        this.createBloodSplatter(loserX + 30, loserY - 20, 1.5, 0);
        this.gameState.victoryAnimation.fireBurned.rightArm = true;
      }
      
      // ?? 撌西? (7蝘?
      if (elapsed > 7000 && elapsed < 7100 && !this.gameState.victoryAnimation.fireBurned.leftLeg) {
        this.createSeveredPart(loserX - 15, loserY + 40, 'leftLeg', loser.id, {vx: -6, vy: -8});
        this.createBloodSplatter(loserX - 15, loserY + 40, 1.5, Math.PI * 1.5);
        this.gameState.victoryAnimation.fireBurned.leftLeg = true;
      }
      
      // ?? ?唾? (8蝘?
      if (elapsed > 8000 && elapsed < 8100 && !this.gameState.victoryAnimation.fireBurned.rightLeg) {
        this.createSeveredPart(loserX + 15, loserY + 40, 'rightLeg', loser.id, {vx: 6, vy: -8});
        this.createBloodSplatter(loserX + 15, loserY + 40, 1.5, Math.PI * 0.5);
        this.gameState.victoryAnimation.fireBurned.rightLeg = true;
      }
      
      // ???? ?剝§?函??思葉??! (10蝘?
      if (elapsed > 10000 && elapsed < 10100 && !this.gameState.victoryAnimation.fireBurned.head) {
        this.createSeveredPart(loserX, loserY - 80, 'head', loser.id, {vx: (Math.random() - 0.5) * 8, vy: -18});
        // ?賊?渲? (撠?)
        this.createBloodSplatter(loserX, loserY - 60, 2.5, Math.PI / 2);
        this.gameState.victoryAnimation.fireBurned.head = true;
      }
      
      // ???行???(?撓???衣)
      if (burnProgress < 0.8) {
        ctx.save();
        ctx.globalAlpha = 1 - burnProgress * 0.9;
        ctx.translate(loserX, loserY);
        ctx.scale(3, 3);
        
        const shakingIntensity = burnProgress * 25;
        ctx.translate(
          (Math.random() - 0.5) * shakingIntensity,
          (Math.random() - 0.5) * shakingIntensity
        );
        
        // 頨恍??撓霈?
        const charLevel = Math.min(1, burnProgress * 1.5);
        
        const loserFrame = {
          head: { x: 0, y: 0, rotation: Math.sin(elapsed * 0.1) * 50 * burnProgress },
          body: { rotation: Math.sin(elapsed * 0.08) * 35 * burnProgress },
          leftArm: { upperRotation: -90 + Math.sin(elapsed * 0.15) * 100, lowerRotation: -130 },
          rightArm: { upperRotation: 90 - Math.sin(elapsed * 0.15) * 100, lowerRotation: 130 },
          leftLeg: { upperRotation: Math.sin(elapsed * 0.12) * 70, lowerRotation: -50 },
          rightLeg: { upperRotation: -Math.sin(elapsed * 0.12) * 70, lowerRotation: 50 }
        };
        
        if (typeof stickmanAnimator !== 'undefined') {
          // 頨恍??撓霈暺?
          ctx.save();
          if (charLevel > 0) {
            ctx.globalCompositeOperation = 'multiply';
            ctx.globalAlpha = charLevel;
          }
          stickmanAnimator.drawStickman(ctx, 0, 0, loserFrame, loser.id, -1, 1);
          ctx.restore();
        }
        ctx.restore();
      }
      
      // ? ?敺?拚撉?(8-12蝘?
      if (elapsed > 8000) {
        const skullProgress = (elapsed - 8000) / 4000;
        
        ctx.save();
        ctx.translate(loserX, loserY - 80 + skullProgress * 50);
        ctx.scale(3, 3);
        
        // ?阡??撉?
        ctx.fillStyle = `rgba(50, 50, 50, ${1 - skullProgress})`;
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // ?潛版
        ctx.fillStyle = `rgba(139, 0, 0, ${1 - skullProgress})`;
        ctx.beginPath();
        ctx.arc(-5, -2, 3, 0, Math.PI * 2);
        ctx.arc(5, -2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // ?剝爸?典?畾??怎
        for (let i = 0; i < 15; i++) {
          const angle = (i / 15) * Math.PI * 2 + elapsed * 0.005;
          const radius = 30 + Math.sin(elapsed * 0.01 + i) * 10;
          const x = loserX + Math.cos(angle) * radius;
          const y = loserY - 80 + skullProgress * 50 + Math.sin(angle) * radius * 0.5;
          
          ctx.fillStyle = `rgba(255, 69, 0, ${0.6 * (1 - skullProgress)})`;
          ctx.shadowColor = '#FF4500';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    
    // ?捱摰?
    if (elapsed > 12000) {
      const textAlpha = Math.min(1, (elapsed - 12000) / 1000);
      ctx.save();
      ctx.globalAlpha = textAlpha;
      ctx.font = 'bold 50px "Noto Sans TC", Arial';
      ctx.fillStyle = '#FFD700';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#FF4500';
      ctx.shadowBlur = 30;
      ctx.fillText('烈焰焚身！', this.canvasWidth / 2, 150);
      ctx.restore();
    }
  }

  // ?? 瘞游蔣?捱嚗偌樴?唳
  renderWaterExecution(ctx, elapsed, winner, loser) {
    // ?嚗楛瘚?
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    const waterAlpha = Math.min(1, elapsed / 2000);
    gradient.addColorStop(0, `rgba(0, 26, 51, ${waterAlpha})`);
    gradient.addColorStop(0.5, `rgba(0, 61, 92, ${waterAlpha})`);
    gradient.addColorStop(1, `rgba(0, 96, 128, ${waterAlpha})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // ?瘜?
    if (elapsed > 500) {
      ctx.save();
      ctx.translate(200, this.canvasHeight / 2);
      ctx.scale(3, 3);
      
      const winnerFrame = {
        head: { x: 0, y: 0, rotation: 0 },
        body: { rotation: 0 },
        leftArm: { upperRotation: -90, lowerRotation: -60 },
        rightArm: { upperRotation: -90, lowerRotation: -60 },
        leftLeg: { upperRotation: 0, lowerRotation: 0 },
        rightLeg: { upperRotation: 0, lowerRotation: 0 }
      };
      
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, winnerFrame, winner.id, 1, 1);
      }
      ctx.restore();
    }
    
    const loserX = this.canvasWidth - 300;
    const loserBaseY = this.canvasHeight / 2;
    
    // 瘞湧??脩???(2-10蝘?
    if (elapsed > 2000 && elapsed < 10000) {
      const tornadoProgress = Math.min(1, (elapsed - 2000) / 8000);
      const loserY = loserBaseY - tornadoProgress * 150;
      
      // 閮?銵瘨脫?蝝脣漲 (6蝘?憪?蝝?
      const bloodProgress = elapsed > 6000 ? Math.min(1, (elapsed - 6000) / 2000) : 0;
      
      // 瘞湧??脰??
      for (let i = 0; i < 30; i++) {
        const angle = (elapsed * 0.015 + i * 0.42) % (Math.PI * 2);
        const heightRatio = i / 30;
        const radius = (1 - heightRatio) * 100;
        const height = heightRatio * 400;
        const x = loserX + Math.cos(angle) * radius;
        const y = loserBaseY + 100 - height;
        
        // 瘞渡?憿敺??脫撓霈?銵蝝
        let waterColor;
        if (bloodProgress === 0) {
          waterColor = `rgba(100, 181, 246, ${0.7 - heightRatio * 0.3})`;
        } else {
          // 敺?敺銝?蝝?
          const redAmount = Math.max(0, bloodProgress - heightRatio);
          const r = 100 + redAmount * 139;
          const g = 181 - redAmount * 181;
          const b = 246 - redAmount * 246;
          waterColor = `rgba(${r}, ${g}, ${b}, ${0.7 - heightRatio * 0.3})`;
        }
        
        ctx.fillStyle = waterColor;
        ctx.beginPath();
        ctx.arc(x, y, 6 + Math.sin(elapsed * 0.01 + i) * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // 瘞港葉????(2-8蝘??湛?8蝘?鋡怨??
      const isBeforeCut = elapsed < 8000;
      
      ctx.save();
      ctx.translate(loserX, loserY);
      ctx.rotate(Math.sin(elapsed * 0.01) * 0.3);
      ctx.scale(3, 3);
      
      if (isBeforeCut) {
        // 摰頨恍??冽偌銝剜???
        const struggleIntensity = 30;
        const loserFrame = {
          head: { x: 0, y: 0, rotation: Math.sin(elapsed * 0.2) * struggleIntensity },
          body: { rotation: Math.sin(elapsed * 0.15) * 20 },
          leftArm: { upperRotation: -60 + Math.sin(elapsed * 0.25) * struggleIntensity, lowerRotation: -90 },
          rightArm: { upperRotation: 60 - Math.sin(elapsed * 0.25) * struggleIntensity, lowerRotation: 90 },
          leftLeg: { upperRotation: Math.sin(elapsed * 0.18) * struggleIntensity, lowerRotation: -30 },
          rightLeg: { upperRotation: -Math.sin(elapsed * 0.18) * struggleIntensity, lowerRotation: 30 }
        };
        
        if (typeof stickmanAnimator !== 'undefined') {
          stickmanAnimator.drawStickman(ctx, 0, 0, loserFrame, loser.id, -1, 1);
        }
      } else {
        // 鋡怨?砍??芷＊蝷箔??澈
        const colors = stickmanAnimator.schoolColors[loser.id];
        
        // 銝?頨?
        ctx.strokeStyle = colors.primary;
        ctx.fillStyle = colors.accent;
        ctx.lineWidth = 3;
        
        // ?剝
        ctx.beginPath();
        ctx.arc(0, -50, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // ?潛?嚗香鈭∴?
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-5, -53, 2, 0, Math.PI * 2);
        ctx.arc(5, -53, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 頠撟嫣??
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(0, 0);
        ctx.stroke();
        
        // ??
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-10, -20);
        ctx.lineTo(-40, 0);
        ctx.moveTo(10, -20);
        ctx.lineTo(40, 0);
        ctx.stroke();
        
        // ?圈?瑕憭折?瘚?
        ctx.fillStyle = '#8B0000';
        ctx.shadowColor = '#8B0000';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // ?扯?憭??
        ctx.fillStyle = '#A52A2A';
        ctx.beginPath();
        ctx.arc(-5, 0, 6, 0, Math.PI);
        ctx.arc(5, 0, 6, 0, Math.PI);
        ctx.fill();
      }
      
      ctx.restore();
      
      // ????瘞湧???
      if (elapsed > 6000 && Math.random() > 0.6) {
        this.createBloodSplatter(loserX + Math.random() * 80 - 40, loserY + Math.random() * 60 - 30, 1.2, Math.random() * Math.PI * 2);
      }
    }
    
    // ?弩 瘞湧??脣?鋆?(10-13蝘?
    if (elapsed > 10000 && elapsed < 13000) {
      const splitProgress = (elapsed - 10000) / 3000;
      const splitDistance = splitProgress * 200;
      
      // 銝??芣偌樴嚗?銝?
      const upperY = loserBaseY - 100 - splitDistance;
      this.renderWaterTornadoHalf(ctx, loserX, upperY, elapsed, true, splitProgress);
      
      // 銝??芣偌樴嚗?銝?
      const lowerY = loserBaseY + 100 + splitDistance;
      this.renderWaterTornadoHalf(ctx, loserX, lowerY, elapsed, false, splitProgress);
      
      // 銝?頨恍銝??芣偌銝?
      ctx.save();
      ctx.globalAlpha = 1 - splitProgress * 0.5;
      ctx.translate(loserX, upperY);
      ctx.rotate(splitProgress * Math.PI * 2);
      ctx.scale(3, 3);
      
      const colors = stickmanAnimator.schoolColors[loser.id];
      
      // 蝜芾ˊ銝?頨?
      ctx.strokeStyle = colors.primary;
      ctx.fillStyle = colors.accent;
      ctx.lineWidth = 3;
      
      // ??
      ctx.beginPath();
      ctx.arc(0, -50, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // 頠撟嫣???
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(0, 0);
      ctx.stroke();
      
      // ??
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-10, -20);
      ctx.lineTo(-40, 0);
      ctx.moveTo(10, -20);
      ctx.lineTo(40, 0);
      ctx.stroke();
      
      // ?瑕瘚?
      ctx.fillStyle = '#8B0000';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      
      // 銝?頨恍銝??芣偌銝?
      ctx.save();
      ctx.globalAlpha = 1 - splitProgress * 0.5;
      ctx.translate(loserX, lowerY);
      ctx.rotate(-splitProgress * Math.PI * 2);
      ctx.scale(3, 3);
      
      // 頠撟嫣???
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 30);
      ctx.stroke();
      
      // ??
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-5, 30);
      ctx.lineTo(-15, 70);
      ctx.moveTo(5, 30);
      ctx.lineTo(15, 70);
      ctx.stroke();
      
      // ?瑕瘚?
      ctx.fillStyle = '#8B0000';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      
      // ???祇?憭批銵
      if (elapsed > 10000 && elapsed < 10500 && Math.random() > 0.5) {
        this.createBloodSplatter(loserX, loserBaseY, 2.5, Math.random() * Math.PI * 2);
      }
    }
    
    // ?萄遣???銝?頨急??(10蝘?)
    if (elapsed > 10000 && elapsed < 10100 && !this.gameState.victoryAnimation.waterBisected) {
      // 銝蝙??createSeveredPart嚗??箄??寞???
      this.gameState.victoryAnimation.waterBisected = true;
    }
    
    // ?捱摰?
    if (elapsed > 13000) {
      const textAlpha = Math.min(1, (elapsed - 13000) / 1000);
      ctx.save();
      ctx.globalAlpha = textAlpha;
      ctx.font = 'bold 50px "Noto Sans TC", Arial';
      ctx.fillStyle = '#E0FFFF';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#8B0000';
      ctx.shadowBlur = 30;
      ctx.fillText('水火相煎..亡', this.canvasWidth / 2, 150);
      ctx.restore();
    }
  }

  // 皜脫?瘞湧??脩??
  renderWaterTornadoHalf(ctx, centerX, centerY, elapsed, isUpper, fadeProgress) {
    const bloodColor = `rgba(139, 0, 0, ${0.7 - fadeProgress * 0.4})`;
    const waterColor = `rgba(100, 181, 246, ${0.3 - fadeProgress * 0.2})`;
    
    for (let i = 0; i < 25; i++) {
      const angle = (elapsed * 0.015 + i * 0.3) % (Math.PI * 2);
      const radius = 60 - i * 2;
      const offset = (isUpper ? -1 : 1) * i * 4;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + offset;
      
      ctx.fillStyle = i % 2 === 0 ? bloodColor : waterColor;
      ctx.shadowColor = '#8B0000';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ???瑟??捱嚗?瑁???
  renderThunderExecution(ctx, elapsed, winner, loser) {
    // ?嚗?典予
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#2a2a3e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // ??憭?
    if (elapsed > 500) {
      ctx.save();
      ctx.translate(200, this.canvasHeight / 2);
      ctx.scale(3, 3);
      
      const winnerFrame = {
        head: { x: 0, y: 0, rotation: 20 },
        body: { rotation: 10 },
        leftArm: { upperRotation: -150, lowerRotation: -120 },
        rightArm: { upperRotation: 30, lowerRotation: 20 },
        leftLeg: { upperRotation: 0, lowerRotation: 0 },
        rightLeg: { upperRotation: 0, lowerRotation: 0 }
      };
      
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, winnerFrame, winner.id, 1, 1);
      }
      ctx.restore();
    }
    
    // ?????? (2-12蝘?
    if (elapsed > 2000) {
      const strikeProgress = (elapsed - 2000) / 10000;
      const loserX = this.canvasWidth - 300;
      const loserY = this.canvasHeight / 2;
      
      // ????? - ?游????
      if (Math.random() > 0.2 || elapsed % 300 < 80) {
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 8 + Math.random() * 4; // ?渡?????
        ctx.shadowColor = '#FFFF00';
        ctx.shadowBlur = 40;
        
        ctx.beginPath();
        ctx.moveTo(loserX, 0);
        let currentX = loserX;
        let currentY = 0;
        while (currentY < loserY + 100) {
          currentY += 25 + Math.random() * 25;
          currentX += (Math.random() - 0.5) * 50; // ?湔??
          ctx.lineTo(currentX, currentY);
        }
        ctx.stroke();
        
        // ?? ??葉?銵????
        if (Math.random() > 0.79) {
          this.createBloodSplatter(
            loserX + (Math.random() - 0.5) * 60, 
            loserY + (Math.random() - 0.5) * 60, 
            1, // 皜??渲???
            Math.random() * Math.PI * 2
          );
          
          // ?? ??????
          for (let i = 0; i < 1; i++) {
            const angle = Math.random() * Math.PI * 2;
            this.gameState.victoryAnimation.bloodParticles.push({
              x: loserX,
              y: loserY,
              vx: Math.cos(angle) * (2 + Math.random() * 4),
              vy: Math.sin(angle) * (2 + Math.random() * 4) - 2,
              size: 3 + Math.random() * 5,
              life: 1,
              gravity: 0.5,
              color: '#0a0a0a', // ?阡???
              isFlesh: true
            });
          }
        }
      }
      
      // ?♀? ?鋡恍?鋆???- 頞?畾???
      if (!this.gameState.victoryAnimation.thunderExploded) {
        this.gameState.victoryAnimation.thunderExploded = {
          leftArm: false,
          rightArm: false,
          leftLeg: false,
          rightLeg: false,
          head: false
        };
      }
      
      // ?? 撌西?鋡恍?餌鋆? (6蝘?
      if (elapsed > 6000 && elapsed < 6100 && !this.gameState.victoryAnimation.thunderExploded.leftArm) {
        this.createSeveredPart(loserX - 30, loserY - 20, 'leftArm', loser.id, {vx: -15, vy: -18});
        this.createBloodSplatter(loserX - 30, loserY - 20, 0.6, Math.PI);
        this.gameState.victoryAnimation.thunderExploded.leftArm = true;
      }
      
      // ?? ?唾?鋡怎憌? (7蝘?
      if (elapsed > 7000 && elapsed < 7100 && !this.gameState.victoryAnimation.thunderExploded.rightArm) {
        this.createSeveredPart(loserX + 30, loserY - 20, 'rightArm', loser.id, {vx: 15, vy: -18});
        this.createBloodSplatter(loserX + 30, loserY - 20, 0.6, 0);
        this.gameState.victoryAnimation.thunderExploded.rightArm = true;
      }
      
      // ?? 撌西鋡恍??? (8蝘?
      if (elapsed > 8000 && elapsed < 8100 && !this.gameState.victoryAnimation.thunderExploded.leftLeg) {
        this.createSeveredPart(loserX - 15, loserY + 40, 'leftLeg', loser.id, {vx: -12, vy: -15});
        this.createBloodSplatter(loserX - 15, loserY + 40, 0.6, Math.PI * 1.5);
        this.gameState.victoryAnimation.thunderExploded.leftLeg = true;
      }
      
      // ?? ?唾?賊?! (9蝘?
      if (elapsed > 9000 && elapsed < 9100 && !this.gameState.victoryAnimation.thunderExploded.rightLeg) {
        this.createSeveredPart(loserX + 15, loserY + 40, 'rightLeg', loser.id, {vx: 12, vy: -15});
        this.createBloodSplatter(loserX + 15, loserY + 40, 0.6, Math.PI * 0.5);
        this.gameState.victoryAnimation.thunderExploded.rightLeg = true;
      }
      
      // ?????? ?剝鋡怨?瑁??鋆? (10蝘?
      if (elapsed > 10000 && elapsed < 10100 && !this.gameState.victoryAnimation.thunderExploded.head) {
        this.createSeveredPart(loserX, loserY - 80, 'head', loser.id, {vx: (Math.random() - 0.5) * 8, vy: -25});
        // ?賊?渲?
        this.createBloodSplatter(loserX, loserY - 60, 0.9, Math.PI / 2);
        this.gameState.victoryAnimation.thunderExploded.head = true;
      }
      
      // ?餅?蝥???
      for (let i = 0; i < 20; i++) {
        const angle = (elapsed * 0.02 + i * 0.3) % (Math.PI * 2);
        const radius = 60 + Math.sin(elapsed * 0.01 + i) * 20;
        const x = loserX + Math.cos(angle) * radius;
        const y = loserY + Math.sin(angle) * radius;
        
        ctx.fillStyle = i % 2 === 0 ? '#FFFF00' : '#FFD700';
        ctx.shadowColor = '#FFFF00';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // ?◤?餅?? - ?? ??賣???撥!
      ctx.save();
      ctx.globalAlpha = 1 - strikeProgress * 0.5;
      
      // ?? ???餅?? - 頨恍?銝??批?唳??
      const shockIntensity = 20 * (1 - strikeProgress);
      const convulsionSpeed = 0.3; // ?游翰????
      const shockX = Math.sin(elapsed * convulsionSpeed) * shockIntensity;
      const shockY = Math.cos(elapsed * convulsionSpeed * 1.3) * shockIntensity * 0.7;
      
      // ?? 頨恍??剜 (?憪踵?)
      const twistAngle = Math.sin(elapsed * 0.2) * 0.5 * (1 - strikeProgress);
      
      ctx.translate(
        loserX + shockX,
        loserY + shockY
      );
      ctx.rotate(twistAngle);
      ctx.scale(3, 3);
      
      const showLeftArm = elapsed < 6000;
      const showRightArm = elapsed < 7000;
      const showLeftLeg = elapsed < 8000;
      const showRightLeg = elapsed < 9000;
      const showHead = elapsed < 10000;
      
      if (showHead || showLeftArm || showRightArm || showLeftLeg || showRightLeg) {
        // 頨恍?? - 憿舐內?拚??其?
        const convulseAngle = Math.sin(elapsed * 0.5) * 60;
        const colors = stickmanAnimator.schoolColors[loser.id];
        
        // 頠撟?瘞賊?憿舐內,雿?0蝘?霈暺?
        if (showHead) {
          ctx.strokeStyle = colors.primary;
        } else {
          ctx.strokeStyle = '#1a1a1a'; // ?阡?
        }
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(0, 30);
        ctx.stroke();
        
        // ?剝 (10蝘?憿舐內)
        if (showHead) {
          ctx.fillStyle = colors.primary;
          ctx.beginPath();
          ctx.arc(0, -50, 15, 0, Math.PI * 2);
          ctx.fill();
          
          // ?潛?
          ctx.fillStyle = colors.secondary;
          ctx.beginPath();
          ctx.arc(-5, -52, 3, 0, Math.PI * 2);
          ctx.arc(5, -52, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // ?琿璅?
          ctx.fillStyle = '#8B0000';
          ctx.beginPath();
          ctx.arc(0, -30, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // 撌西? (6蝘?憿舐內)
        if (showLeftArm) {
          ctx.strokeStyle = colors.primary;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(-10, -20);
          ctx.lineTo(-25, -10 + Math.sin(elapsed * 0.5) * convulseAngle * 0.3);
          ctx.lineTo(-35, 10 + Math.sin(elapsed * 0.6) * convulseAngle * 0.2);
          ctx.stroke();
        } else {
          // ?瑁?璅?
          ctx.fillStyle = '#8B0000';
          ctx.beginPath();
          ctx.arc(-10, -20, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // ?唾? (7蝘?憿舐內)
        if (showRightArm) {
          ctx.strokeStyle = colors.primary;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(10, -20);
          ctx.lineTo(25, -10 - Math.sin(elapsed * 0.5) * convulseAngle * 0.3);
          ctx.lineTo(35, 10 - Math.sin(elapsed * 0.6) * convulseAngle * 0.2);
          ctx.stroke();
        } else {
          // ?瑁?璅?
          ctx.fillStyle = '#8B0000';
          ctx.beginPath();
          ctx.arc(10, -20, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // 撌西 (8蝘?憿舐內)
        if (showLeftLeg) {
          ctx.strokeStyle = colors.primary;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(-5, 30);
          ctx.lineTo(-10 + Math.sin(elapsed * 0.4) * convulseAngle * 0.2, 50);
          ctx.lineTo(-15 + Math.sin(elapsed * 0.5) * convulseAngle * 0.3, 70);
          ctx.stroke();
        } else {
          // ?瑁璅?
          ctx.fillStyle = '#8B0000';
          ctx.beginPath();
          ctx.arc(-5, 30, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // ?唾 (9蝘?憿舐內)
        if (showRightLeg) {
          ctx.strokeStyle = colors.primary;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(5, 30);
          ctx.lineTo(10 - Math.sin(elapsed * 0.4) * convulseAngle * 0.2, 50);
          ctx.lineTo(15 - Math.sin(elapsed * 0.5) * convulseAngle * 0.3, 70);
          ctx.stroke();
        } else {
          // ?瑁璅?
          ctx.fillStyle = '#8B0000';
          ctx.beginPath();
          ctx.arc(5, 30, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // ?餅?畾???
        if (Math.random() > 0.5) {
          ctx.strokeStyle = '#FFFF00';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#FFFF00';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(Math.random() * 20 - 10, -30);
          ctx.lineTo(Math.random() * 20 - 10, 30);
          ctx.stroke();
        }
      } else {
        // 10蝘??芸?阡?頠撟?
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(0, 30);
        ctx.stroke();
        
        // ?瑕璅?嚗葬撠?
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(0, -30, 4, 0, Math.PI * 2);  // ?賊
        ctx.arc(-10, -20, 2, 0, Math.PI * 2); // 撌西
        ctx.arc(10, -20, 2, 0, Math.PI * 2);  // ?唾
        ctx.arc(-5, 30, 2, 0, Math.PI * 2);   // 撌西??
        ctx.arc(5, 30, 2, 0, Math.PI * 2);    // ?唾??
        ctx.fill();
      }
      
      ctx.restore();
    }
    
    // ?捱摰?
    if (elapsed > 12000) {
      const textAlpha = Math.min(1, (elapsed - 12000) / 1000);
      ctx.save();
      ctx.globalAlpha = textAlpha;
      ctx.font = 'bold 50px "Noto Sans TC", Arial';
      ctx.fillStyle = '#FFFF00';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 30;
      ctx.fillText('天雷制裁！', this.canvasWidth / 2, 150);
      ctx.restore();
    }
  }

  // ? 撗拍?捱嚗之?啣???
  renderEarthExecution(ctx, elapsed, winner, loser) {
    // ?嚗???
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, '#2a1810');
    gradient.addColorStop(0.5, '#3a2820');
    gradient.addColorStop(1, '#5a4030');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // ??頞喳尿??
    if (elapsed > 500) {
      const stompShake = elapsed > 2000 && elapsed < 3000 ? Math.sin(elapsed * 0.5) * 10 : 0;
      
      ctx.save();
      ctx.translate(200, this.canvasHeight / 2 + 50 + stompShake);
      ctx.scale(3, 3);
      
      const winnerFrame = {
        head: { x: 0, y: 0, rotation: 0 },
        body: { rotation: 0 },
        leftArm: { upperRotation: -90, lowerRotation: -45 },
        rightArm: { upperRotation: 90, lowerRotation: 45 },
        leftLeg: { upperRotation: elapsed > 2000 && elapsed < 2200 ? -60 : 0, lowerRotation: 0 },
        rightLeg: { upperRotation: 0, lowerRotation: 0 }
      };
      
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, winnerFrame, winner.id, 1, 1);
      }
      ctx.restore();
    }
    
    // ?圈鋆?? (3-10蝘?
    if (elapsed > 3000 && elapsed < 10000) {
      const swallowProgress = Math.min(1, (elapsed - 3000) / 7000);
      const loserX = this.canvasWidth - 300;
      const loserY = this.canvasHeight / 2 + 50 + swallowProgress * 150;
      
      // 鋡怠冗?銵
      if (elapsed > 4000 && Math.random() > 0.8) {
        this.createBloodSplatter(loserX - 80 + Math.random() * 160, loserY + Math.random() * 60 - 30, 1.0, Math.PI / 2);
      }
      
      // ?啗?
      ctx.strokeStyle = '#1a1410';
      ctx.lineWidth = 8;
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      ctx.moveTo(loserX - 100, this.canvasHeight / 2 + 100);
      ctx.lineTo(loserX - 80, loserY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(loserX + 100, this.canvasHeight / 2 + 100);
      ctx.lineTo(loserX + 80, loserY);
      ctx.stroke();
      
      // 撗拍蝣?憌
      for (let i = 0; i < 10; i++) {
        const rockAngle = (i / 10) * Math.PI + Math.PI;
        const rockDist = swallowProgress * 150 + Math.sin(elapsed * 0.01 + i) * 20;
        const rockX = loserX + Math.cos(rockAngle) * rockDist;
        const rockY = loserY + Math.sin(rockAngle) * rockDist - swallowProgress * 100;
        
        ctx.save();
        ctx.translate(rockX, rockY);
        ctx.rotate(elapsed * 0.01 + i);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-10, -10, 20, 20);
        ctx.restore();
      }
      
      // ??瘝???
      ctx.save();
      ctx.globalAlpha = 1 - swallowProgress * 0.7;
      ctx.translate(loserX, loserY);
      ctx.scale(3, 3);
      
      const loserFrame = {
        head: { x: 0, y: 0, rotation: Math.sin(elapsed * 0.15) * 40 },
        body: { rotation: swallowProgress * 20 },
        leftArm: { upperRotation: -150 + Math.sin(elapsed * 0.2) * 60, lowerRotation: -120 },
        rightArm: { upperRotation: 150 - Math.sin(elapsed * 0.2) * 60, lowerRotation: 120 },
        leftLeg: { upperRotation: 30, lowerRotation: -30 },
        rightLeg: { upperRotation: -30, lowerRotation: 30 }
      };
      
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, loserFrame, loser.id, -1, 1);
      }
      ctx.restore();
    }
    
    // ? 撌函敺予???貊?撠? (10-13蝘?
    if (elapsed > 10000) {
      const rockFallProgress = Math.min(1, (elapsed - 10000) / 3000);
      const loserX = this.canvasWidth - 300;
      const groundY = this.canvasHeight / 2 + 200;
      
      // 撌函?賭?
      const rockY = -200 + rockFallProgress * (groundY - 100);
      const rockSize = 150;
      const rockHit = rockFallProgress >= 0.8;
      
      if (!rockHit) {
        // 憿舐內?喳?鋡怎?鈭?(?憪踵?)
        ctx.save();
        ctx.translate(loserX, groundY - 100);
        ctx.scale(3, 3);
        
        const fearFrame = {
          head: { x: 0, y: 0, rotation: Math.sin(elapsed * 0.3) * 20 },
          body: { rotation: 0 },
          leftArm: { upperRotation: -150, lowerRotation: -120 },
          rightArm: { upperRotation: 150, lowerRotation: 120 },
          leftLeg: { upperRotation: -20, lowerRotation: 20 },
          rightLeg: { upperRotation: 20, lowerRotation: -20 }
        };
        
        if (typeof stickmanAnimator !== 'undefined') {
          stickmanAnimator.drawStickman(ctx, 0, 0, fearFrame, loser.id, -1, 1);
        }
        ctx.restore();
        
        // 撌函?啣蔣
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(loserX, groundY + 20, rockSize * 0.8, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 撌函?祇?
        ctx.save();
        ctx.translate(loserX, rockY);
        ctx.rotate(rockFallProgress * Math.PI * 2);
        
        // 撗拍蝝?
        const rockGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, rockSize / 2);
        rockGradient.addColorStop(0, '#A0826D');
        rockGradient.addColorStop(0.5, '#8B7355');
        rockGradient.addColorStop(1, '#654321');
        ctx.fillStyle = rockGradient;
        
        ctx.beginPath();
        ctx.arc(0, 0, rockSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 撗拍鋆?
        ctx.strokeStyle = '#5a4030';
        ctx.lineWidth = 4;
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * rockSize / 2, Math.sin(angle) * rockSize / 2);
          ctx.stroke();
        }
        
        ctx.restore();
        
        // 銝?漲蝺?
        if (rockFallProgress > 0.3) {
          for (let i = 0; i < 8; i++) {
            const lineX = loserX + (Math.random() - 0.5) * rockSize;
            const lineY = rockY - 30 - i * 15;
            ctx.strokeStyle = `rgba(192, 192, 192, ${0.5 - i * 0.06})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(lineX, lineY);
            ctx.lineTo(lineX, lineY - 20);
            ctx.stroke();
          }
        }
      } else {
        // ? ?訾葉嚗楊?喟?鋆?+ ?萎犖鋡怎????
        const impactProgress = (elapsed - 10000 - 2400) / 600;
        
        if (!this.gameState.victoryAnimation.earthCrushed) {
          // ?萄遣?萎犖頨恍?蝣?!
          this.createSeveredPart(loserX, groundY - 80, 'head', loser.id, {vx: -8, vy: -20});
          this.createSeveredPart(loserX - 25, groundY - 60, 'leftArm', loser.id, {vx: -15, vy: -18});
          this.createSeveredPart(loserX + 25, groundY - 60, 'rightArm', loser.id, {vx: 15, vy: -18});
          this.createSeveredPart(loserX - 15, groundY - 40, 'leftLeg', loser.id, {vx: -12, vy: -15});
          this.createSeveredPart(loserX + 15, groundY - 40, 'rightLeg', loser.id, {vx: 12, vy: -15});
          
          // ?萄遣憭折?銵瘨脣瞈?
          for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            this.createBloodSplatter(loserX, groundY - 50, 3.0, angle);
          }
          this.gameState.victoryAnimation.earthCrushed = true;
        }
        
        // 撌函蝣?憌
        for (let i = 0; i < 40; i++) {
          const angle = (i / 40) * Math.PI * 2;
          const distance = impactProgress * 280 + Math.random() * 60;
          const pieceX = loserX + Math.cos(angle) * distance;
          const pieceY = groundY - 80 + Math.sin(angle) * distance - distance * 0.4;
          
          if (pieceY < this.canvasHeight) {
            ctx.save();
            ctx.translate(pieceX, pieceY);
            ctx.rotate((elapsed * 0.03 + i) * impactProgress);
            
            const size = 15 + Math.random() * 35;
            ctx.fillStyle = i % 3 === 0 ? '#8B7355' : i % 3 === 1 ? '#654321' : '#A0826D';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 8;
            ctx.fillRect(-size / 2, -size / 2, size, size);
            ctx.restore();
          }
        }
        
        // ? 憭惜銵?瘜?
        const shockwaveRadius = impactProgress * 350;
        ctx.strokeStyle = `rgba(139, 115, 85, ${0.8 - impactProgress * 0.8})`;
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(loserX, groundY - 50, shockwaveRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.strokeStyle = `rgba(101, 67, 33, ${0.6 - impactProgress * 0.6})`;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(loserX, groundY - 50, shockwaveRadius + 40, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.strokeStyle = `rgba(160, 130, 109, ${0.4 - impactProgress * 0.4})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(loserX, groundY - 50, shockwaveRadius + 80, 0, Math.PI * 2);
        ctx.stroke();
        
        // ?? ?圈銵頝∪之?Ｙ??湔
        ctx.fillStyle = `rgba(139, 0, 0, ${0.8 - impactProgress * 0.4})`;
        ctx.beginPath();
        ctx.arc(loserX, groundY - 20, 100 + impactProgress * 80, 0, Math.PI * 2);
        ctx.fill();
        
        // 銵瘨脤?瞈箇?頝?
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2 + elapsed * 0.001;
          const splatterDist = 120 + Math.random() * 60;
          const splatterX = loserX + Math.cos(angle) * splatterDist;
          const splatterY = groundY - 20 + Math.sin(angle) * splatterDist * 0.3;
          
          ctx.fillStyle = `rgba(100, 0, 0, ${0.6 - impactProgress * 0.3})`;
          ctx.beginPath();
          ctx.ellipse(splatterX, splatterY, 15, 8, angle, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    
    // ?捱摰?
    if (elapsed > 13000) {
      const textAlpha = Math.min(1, (elapsed - 13000) / 1000);
      ctx.save();
      ctx.globalAlpha = textAlpha;
      ctx.font = 'bold 50px "Noto Sans TC", Arial';
      ctx.fillStyle = '#CD853F';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#8B4513';
      ctx.shadowBlur = 30;
      ctx.fillText('大地震怒！萬物歸土！', this.canvasWidth / 2, 150);
      ctx.restore();
    }
  }

  // ?? ?蔣?捱嚗?敶勗畾?
  renderShadowExecution(ctx, elapsed, winner, loser) {
    // ?嚗?暺?
    const bgAlpha = Math.min(1, elapsed / 1500);
    ctx.fillStyle = `rgba(0, 0, 0, ${bgAlpha})`;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // ?頨急???(1-3蝘?憭?
    if (elapsed > 500 && elapsed < 3000) {
      const fadeOut = (elapsed - 500) / 2500;
      ctx.save();
      ctx.globalAlpha = 1 - fadeOut;
      ctx.translate(200, this.canvasHeight / 2);
      ctx.scale(3, 3);
      
      const winnerFrame = {
        head: { x: 0, y: 0, rotation: 0 },
        body: { rotation: 0 },
        leftArm: { upperRotation: -45, lowerRotation: -30 },
        rightArm: { upperRotation: 45, lowerRotation: 30 },
        leftLeg: { upperRotation: 0, lowerRotation: 0 },
        rightLeg: { upperRotation: 0, lowerRotation: 0 }
      };
      
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, winnerFrame, winner.id, 1, 1);
      }
      ctx.restore();
    }
    
    // ???澆撐??(3-8蝘?
    if (elapsed > 3000 && elapsed < 8000) {
      const loserX = this.canvasWidth - 300;
      const loserY = this.canvasHeight / 2;
      
      ctx.save();
      ctx.translate(loserX, loserY);
      ctx.scale(3, 3);
      
      const lookAngle = Math.sin(elapsed * 0.008) * 60;
      const loserFrame = {
        head: { x: 0, y: 0, rotation: lookAngle },
        body: { rotation: lookAngle * 0.3 },
        leftArm: { upperRotation: -40 + Math.sin(elapsed * 0.01) * 20, lowerRotation: -30 },
        rightArm: { upperRotation: 40 - Math.sin(elapsed * 0.01) * 20, lowerRotation: 30 },
        leftLeg: { upperRotation: Math.sin(elapsed * 0.015) * 10, lowerRotation: 0 },
        rightLeg: { upperRotation: -Math.sin(elapsed * 0.015) * 10, lowerRotation: 0 }
      };
      
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, loserFrame, loser.id, -1, 1);
      }
      ctx.restore();
    }
    
    // ?蔣?箸捏 (8-10蝘?
    if (elapsed > 8000 && elapsed < 10000) {
      const attackProgress = (elapsed - 8000) / 2000;
      const loserX = this.canvasWidth - 300;
      const loserY = this.canvasHeight / 2;
      
      // ?弩 ?祇??祇?嚗?9蝘?
      if (elapsed > 9000 && elapsed < 9100 && !this.gameState.victoryAnimation.shadowBeheaded) {
        this.createSeveredPart(loserX, loserY - 80, 'head', loser.id, {vx: 3, vy: -12});
        this.gameState.victoryAnimation.shadowBeheaded = true;
        // ?祇?憭批銵
        this.createBloodSplatter(loserX, loserY - 60, 3.0, -Math.PI / 2);
      }
      
      // ?箔葉?祇?憭折??渲?
      if (elapsed > 8500 && elapsed < 9500) {
        if (Math.random() > 0.6) {
          this.createBloodSplatter(loserX - 30, loserY - 20, 1.5, Math.PI);
        }
      }
      
      // ?????箇
      const winnerX = loserX - 50 + attackProgress * 100;
      ctx.save();
      ctx.globalAlpha = Math.min(1, attackProgress * 2);
      ctx.translate(winnerX, loserY);
      ctx.scale(3, 3);
      
      const winnerFrame = {
        head: { x: 0, y: 0, rotation: 0 },
        body: { rotation: 10 },
        leftArm: { upperRotation: -90, lowerRotation: -120 },
        rightArm: { upperRotation: 60, lowerRotation: 90 },
        leftLeg: { upperRotation: 30, lowerRotation: -30 },
        rightLeg: { upperRotation: -20, lowerRotation: 20 }
      };
      
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, winnerFrame, winner.id, 1, 1);
      }
      ctx.restore();
      
      // 蝝怨????祇?頠楚嚗?
      if (elapsed > 8800 && elapsed < 9200) {
        ctx.strokeStyle = '#8A2BE2';
        ctx.lineWidth = 6;
        ctx.shadowColor = '#8A2BE2';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.moveTo(winnerX + 40, loserY - 100);
        ctx.lineTo(loserX + 40, loserY - 60);
        ctx.stroke();
      }
      
      // ?◤?箔葉嚗?蝘??⊿嚗?
      const showHead = elapsed < 9000;
      
      ctx.save();
      ctx.translate(loserX, loserY);
      ctx.scale(3, 3);
      
      const colors = stickmanAnimator.schoolColors[loser.id];
      
      // 頠撟?
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(0, 30);
      ctx.stroke();
      
      // ??
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-10, -20);
      ctx.lineTo(-40, 10);
      ctx.moveTo(10, -20);
      ctx.lineTo(40, 10);
      ctx.stroke();
      
      // ??
      ctx.beginPath();
      ctx.moveTo(-5, 30);
      ctx.lineTo(-15, 70);
      ctx.moveTo(5, 30);
      ctx.lineTo(15, 70);
      ctx.stroke();
      
      // ?剝???
      if (showHead) {
        ctx.strokeStyle = colors.primary;
        ctx.fillStyle = colors.accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -50, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        // ?琿?渲?
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(0, -30, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // 銵瘨脣瘜???
        if (Math.random() > 0.5) {
          for (let i = 0; i < 3; i++) {
            const spurtAngle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
            ctx.fillStyle = '#A52A2A';
            ctx.beginPath();
            ctx.arc(Math.cos(spurtAngle) * 5, -30 + Math.sin(spurtAngle) * 5, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      
      ctx.restore();
    }
    
    // ?? (10-14蝘? - ?⊿撅?
    if (elapsed > 10000) {
      const fallProgress = Math.min(1, (elapsed - 10000) / 4000);
      const loserX = this.canvasWidth - 300;
      const loserY = this.canvasHeight / 2 + fallProgress * 100;
      
      // ???瘚?
      if (Math.random() > 0.7) {
        this.createBloodSplatter(loserX - 20, loserY, 0.4, Math.PI / 2 + (Math.random() - 0.5) * 0.5);
      }
      
      ctx.save();
      ctx.globalAlpha = 1 - fallProgress * 0.6;
      ctx.translate(loserX, loserY);
      ctx.rotate(fallProgress * Math.PI / 2);
      ctx.scale(3, 3);
      
      const colors = stickmanAnimator.schoolColors[loser.id];
      
      // ?⊿撅?
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      
      // 頠撟?
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(0, 30);
      ctx.stroke();
      
      // ??
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-10, -20);
      ctx.lineTo(-40, 10);
      ctx.moveTo(10, -20);
      ctx.lineTo(40, 10);
      ctx.stroke();
      
      // ??
      ctx.beginPath();
      ctx.moveTo(-5, 30);
      ctx.lineTo(-15, 70);
      ctx.moveTo(5, 30);
      ctx.lineTo(15, 70);
      ctx.stroke();
      
      // ?琿??瘚?
      ctx.fillStyle = '#8B0000';
      ctx.beginPath();
      ctx.arc(0, -30, 10, 0, Math.PI * 2);
      ctx.fill();
      
      // ?圈銵瘙?
      ctx.globalAlpha = fallProgress * 0.5;
      ctx.fillStyle = '#4A0000';
      ctx.beginPath();
      ctx.ellipse(0, 100, 80, 40, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      
      // ??瑞?蝡?
      ctx.save();
      ctx.translate(loserX - 150, this.canvasHeight / 2);
      ctx.scale(3, 3);
      
      const winnerFrame = {
        head: { x: 0, y: 0, rotation: 0 },
        body: { rotation: 0 },
        leftArm: { upperRotation: -30, lowerRotation: -20 },
        rightArm: { upperRotation: 30, lowerRotation: 20 },
        leftLeg: { upperRotation: 0, lowerRotation: 0 },
        rightLeg: { upperRotation: 0, lowerRotation: 0 }
      };
      
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, winnerFrame, winner.id, 1, 1);
      }
      ctx.restore();
    }
    
    // ?捱摰?
    if (elapsed > 12000) {
      const textAlpha = Math.min(1, (elapsed - 12000) / 1000);
      ctx.save();
      ctx.globalAlpha = textAlpha;
      ctx.font = 'bold 50px "Noto Sans TC", Arial';
      ctx.fillStyle = '#E0AAFF';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#8A2BE2';
      ctx.shadowBlur = 30;
      ctx.fillText('黑暗吞噬一切..消逝', this.canvasWidth / 2, 150);
      ctx.restore();
    }
  }

  // ? ???捱嚗?擳祟??
  renderSpiritExecution(ctx, elapsed, winner, loser) {
    // ?嚗???
    const gradient = ctx.createRadialGradient(
      this.canvasWidth / 2, this.canvasHeight / 2, 0,
      this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth
    );
    const lightAlpha = Math.min(1, elapsed / 2000);
    gradient.addColorStop(0, `rgba(255, 248, 220, ${lightAlpha})`);
    gradient.addColorStop(0.5, `rgba(255, 215, 0, ${lightAlpha * 0.5})`);
    gradient.addColorStop(1, `rgba(218, 165, 32, ${lightAlpha * 0.3})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // ??蝳勗尿??
    if (elapsed > 500) {
      ctx.save();
      ctx.translate(200, this.canvasHeight / 2);
      ctx.scale(3, 3);
      
      const winnerFrame = {
        head: { x: 0, y: 0, rotation: -20 },
        body: { rotation: 0 },
        leftArm: { upperRotation: -90, lowerRotation: -90 },
        rightArm: { upperRotation: 90, lowerRotation: 90 },
        leftLeg: { upperRotation: 0, lowerRotation: 0 },
        rightLeg: { upperRotation: 0, lowerRotation: 0 }
      };
      
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, winnerFrame, winner.id, 1, 1);
      }
      ctx.restore();
    }
    
    // ??撖拙 (2-12蝘?
    if (elapsed > 2000) {
      const judgeProgress = Math.min(1, (elapsed - 2000) / 10000);
      const loserX = this.canvasWidth - 300;
      const loserY = this.canvasHeight / 2;
      
      // 瘛典???銝剜?銵
      if (elapsed > 4000 && elapsed < 10000 && Math.random() > 0.8) {
        this.createBloodSplatter(loserX + Math.random() * 40 - 20, loserY + Math.random() * 40 - 20, 0.7, -Math.PI / 2 + (Math.random() - 0.5));
      }
      
      // ???
      const beamWidth = 150;
      const beamGradient = ctx.createLinearGradient(loserX - beamWidth / 2, 0, loserX + beamWidth / 2, 0);
      beamGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      beamGradient.addColorStop(0.5, `rgba(255, 215, 0, ${0.8 * judgeProgress})`);
      beamGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = beamGradient;
      ctx.fillRect(loserX - beamWidth / 2, 0, beamWidth, this.canvasHeight);
      
      // 蟡?蝚行??啁?
      for (let i = 0; i < 8; i++) {
        const angle = (elapsed * 0.005 + i * Math.PI / 4) % (Math.PI * 2);
        const radius = 100 - judgeProgress * 30;
        const runeX = loserX + Math.cos(angle) * radius;
        const runeY = loserY + Math.sin(angle) * radius;
        
        ctx.save();
        ctx.translate(runeX, runeY);
        ctx.rotate(angle);
        ctx.globalAlpha = judgeProgress;
        ctx.font = '30px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
        ctx.fillText(['咒', '術', '血', '契', '魔', '法', '覺', '醒'][i], 0, 0);
        ctx.restore();
      }
      
      // ???行楊??
      ctx.save();
      ctx.globalAlpha = 1 - judgeProgress * 0.8;
      ctx.translate(loserX, loserY - judgeProgress * 50);
      ctx.scale(3, 3);
      
      const purifyShake = Math.sin(elapsed * 0.3) * 20 * judgeProgress;
      const loserFrame = {
        head: { x: 0, y: 0, rotation: Math.sin(elapsed * 0.2) * purifyShake },
        body: { rotation: Math.sin(elapsed * 0.15) * 15 },
        leftArm: { upperRotation: -120 + Math.sin(elapsed * 0.25) * purifyShake, lowerRotation: -90 },
        rightArm: { upperRotation: 120 - Math.sin(elapsed * 0.25) * purifyShake, lowerRotation: 90 },
        leftLeg: { upperRotation: Math.sin(elapsed * 0.18) * 20, lowerRotation: -20 },
        rightLeg: { upperRotation: -Math.sin(elapsed * 0.18) * 20, lowerRotation: 20 }
      };
      
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, loserFrame, loser.id, -1, 1);
      }
      ctx.restore();
      
      // ?蝎?銝?
      for (let i = 0; i < 30; i++) {
        const particleY = loserY + 50 - ((elapsed * 3 + i * 50) % 400) * judgeProgress;
        const particleX = loserX + Math.sin(elapsed * 0.01 + i) * 60;
        
        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(particleX, particleY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // ?捱摰?
    if (elapsed > 12000) {
      const textAlpha = Math.min(1, (elapsed - 12000) / 1000);
      ctx.save();
      ctx.globalAlpha = textAlpha;
      ctx.font = 'bold 50px "Noto Sans TC", Arial';
      ctx.fillStyle = '#FFD700';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#FFA500';
      ctx.shadowBlur = 30;
      ctx.fillText('神光裁決！', this.canvasWidth / 2, 150);
      ctx.restore();
    }
  }

  // ?? 瘥票敹?瘙箏???
  renderPoisonExecution(ctx, elapsed, winner, loser) {
    // ?嚗??抒唳憤?票瞉?
    const gradient = ctx.createRadialGradient(
      this.canvasWidth / 2, this.canvasHeight / 2, 0,
      this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth
    );
    const fogAlpha = Math.min(1, elapsed / 2000);
    gradient.addColorStop(0, `rgba(45, 52, 54, ${fogAlpha})`);
    gradient.addColorStop(0.5, `rgba(0, 184, 148, ${fogAlpha * 0.3})`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${fogAlpha})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // 瘥蝎?瞍筑
    for (let i = 0; i < 25; i++) {
      const px = (elapsed * 0.03 + i * 80) % (this.canvasWidth + 100) - 50;
      const py = this.canvasHeight * 0.7 + Math.sin(elapsed * 0.002 + i) * 40;
      const size = 15 + Math.sin(elapsed * 0.001 + i * 0.5) * 8;
      
      ctx.globalAlpha = 0.15 + Math.sin(elapsed * 0.003 + i) * 0.05;
      ctx.fillStyle = i % 2 === 0 ? '#00b894' : '#55efc4';
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    // ??銝瘥憪踵? (0.5s)
    if (elapsed > 500) {
      ctx.save();
      ctx.translate(200, this.canvasHeight / 2);
      ctx.scale(3, 3);
      
      const winnerFrame = {
        head: { x: 0, y: 0, rotation: -10 },
        body: { rotation: 5 },
        leftArm: { upperRotation: -30, lowerRotation: -20 },
        rightArm: { upperRotation: elapsed < 1500 ? -120 : -60, lowerRotation: elapsed < 1500 ? -90 : -30 },
        leftLeg: { upperRotation: 10, lowerRotation: -5 },
        rightLeg: { upperRotation: -10, lowerRotation: 5 }
      };
      
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, winnerFrame, winner.id, 1, 1);
      }
      ctx.restore();
    }
    
    const loserX = this.canvasWidth - 300;
    const loserY = this.canvasHeight / 2;
    
    // 瘥蝥???(2-12s)
    if (elapsed > 2000) {
      const vineProgress = Math.min(1, (elapsed - 2000) / 10000);
      
      // 銵瘨脫???
      if (elapsed > 4000 && elapsed < 10000 && Math.random() > 0.85) {
        this.createBloodSplatter(loserX + Math.random() * 40 - 20, loserY + Math.random() * 40 - 20, 0.5, Math.random() * Math.PI * 2);
      }
      
      // 瘥敺?Ｙ?蝜?
      const vineCount = Math.floor(vineProgress * 12);
      for (let i = 0; i < vineCount; i++) {
        const angle = (elapsed * 0.003 + i * Math.PI / 6) % (Math.PI * 2);
        const radius = 80 - vineProgress * 30;
        const vx = loserX + Math.cos(angle) * radius;
        const vy = loserY + Math.sin(angle) * (radius * 0.8);
        
        ctx.save();
        ctx.strokeStyle = i % 3 === 0 ? '#00b894' : i % 3 === 1 ? '#2d3436' : '#6c5ce7';
        ctx.lineWidth = 3 + vineProgress * 2;
        ctx.shadowColor = '#00b894';
        ctx.shadowBlur = 10;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(loserX, loserY + 60);
        ctx.quadraticCurveTo(vx, vy, loserX + Math.cos(angle) * 20, loserY + Math.sin(angle) * 20);
        ctx.stroke();
        ctx.restore();
      }
      
      // 瘥雯皛渲??
      for (let i = 0; i < 8; i++) {
        const drip = (elapsed * 2 + i * 200) % 1000;
        const dripY = loserY - 40 + drip * 0.08;
        const dripX = loserX + Math.sin(i * 2.5) * 30;
        
        ctx.globalAlpha = 0.6 * (1 - drip / 1000);
        ctx.fillStyle = '#00b894';
        ctx.beginPath();
        ctx.arc(dripX, dripY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      
      // ?擃熄閫?
      ctx.save();
      const dissolveAlpha = 1 - vineProgress * 0.9;
      ctx.globalAlpha = dissolveAlpha;
      ctx.translate(loserX, loserY);
      ctx.scale(3, 3);
      
      const shake = Math.sin(elapsed * 0.3) * 15 * vineProgress;
      const loserFrame = {
        head: { x: 0, y: 0, rotation: shake },
        body: { rotation: Math.sin(elapsed * 0.1) * 10 },
        leftArm: { upperRotation: elapsed > 6000 ? -180 : -120 + shake, lowerRotation: -90 },
        rightArm: { upperRotation: elapsed > 7000 ? 180 : 120 - shake, lowerRotation: 90 },
        leftLeg: { upperRotation: elapsed > 8000 ? 90 : Math.sin(elapsed * 0.2) * 20, lowerRotation: -20 },
        rightLeg: { upperRotation: elapsed > 9000 ? -90 : -Math.sin(elapsed * 0.2) * 20, lowerRotation: 20 }
      };
      
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, loserFrame, loser.id, -1, 1);
      }
      ctx.restore();
      
      // ?ａ????瘥雯?湔蕩
      const limbTimes = [6000, 7000, 8000, 9000, 10000];
      limbTimes.forEach(time => {
        if (elapsed > time && elapsed < time + 200) {
          for (let i = 0; i < 5; i++) {
            ctx.fillStyle = '#00b894';
            ctx.shadowColor = '#00b894';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(
              loserX + (Math.random() - 0.5) * 60,
              loserY + (Math.random() - 0.5) * 60,
              3 + Math.random() * 4,
              0, Math.PI * 2
            );
            ctx.fill();
          }
          ctx.shadowBlur = 0;
        }
      });
      
      // 瘥敺??飩??(10s+)
      if (elapsed > 10000) {
        const flowerProgress = Math.min(1, (elapsed - 10000) / 2000);
        ctx.save();
        ctx.translate(loserX, loserY - 10);
        
        // 瘥?梁
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI / 4) + elapsed * 0.001;
          const petalSize = 15 * flowerProgress;
          
          ctx.fillStyle = i % 2 === 0 ? '#6c5ce7' : '#00b894';
          ctx.shadowColor = '#00b894';
          ctx.shadowBlur = 15;
          ctx.globalAlpha = flowerProgress * 0.9;
          ctx.beginPath();
          ctx.ellipse(
            Math.cos(angle) * petalSize,
            Math.sin(angle) * petalSize,
            petalSize * 0.6, petalSize * 0.3,
            angle, 0, Math.PI * 2
          );
          ctx.fill();
        }
        
        // ?勗?
        ctx.fillStyle = '#fdcb6e';
        ctx.shadowColor = '#fdcb6e';
        ctx.shadowBlur = 12;
        ctx.globalAlpha = flowerProgress;
        ctx.beginPath();
        ctx.arc(0, 0, 6 * flowerProgress, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.restore();
      }
    }
    
    // ?捱摰???
    if (elapsed > 12000) {
      const textAlpha = Math.min(1, (elapsed - 12000) / 1000);
      ctx.save();
      ctx.globalAlpha = textAlpha;
      ctx.font = 'bold 50px "Noto Sans TC", Arial';
      ctx.fillStyle = '#00b894';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#00b894';
      ctx.shadowBlur = 30;
      ctx.fillText('毒霧彌漫！無路可逃！', this.canvasWidth / 2, 150);
      ctx.restore();
    }
  }

  // ?? 瘥票敹??拍??
  renderPoisonVictory(ctx, elapsed, winner) {
    // ?嚗?瘝潭黎
    const bgAlpha = Math.min(0.9, elapsed / 600);
    ctx.fillStyle = `rgba(20, 30, 20, ${bgAlpha})`;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // 瘥蝎?
    if (elapsed > 200) {
      for (let i = 0; i < 25; i++) {
        const angle = (elapsed * 0.002 + i * 0.25) % (Math.PI * 2);
        const radius = 80 + i * 12;
        const x = this.canvasWidth / 2 + Math.cos(angle) * radius;
        const y = this.canvasHeight / 2 + Math.sin(angle) * radius * 0.5;
        
        ctx.save();
        ctx.globalAlpha = 0.4 + Math.sin(elapsed * 0.003 + i) * 0.2;
        ctx.fillStyle = i % 3 === 0 ? '#00b894' : i % 3 === 1 ? '#55efc4' : '#6c5ce7';
        ctx.shadowColor = '#00b894';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    
    // 銝餉???
    if (elapsed > 400) {
      const floatY = Math.sin(elapsed * 0.002) * 10;
      ctx.save();
      ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2 - 50 + floatY);
      ctx.scale(4, 4);
      if (typeof stickmanAnimator !== 'undefined') {
        const victoryFrame = {
          head: { x: 0, y: 0, rotation: -5 },
          body: { rotation: 0 },
          leftArm: { upperRotation: -50, lowerRotation: -40 },
          rightArm: { upperRotation: 50, lowerRotation: 40 },
          leftLeg: { upperRotation: 5, lowerRotation: -5 },
          rightLeg: { upperRotation: -5, lowerRotation: 5 }
        };
        stickmanAnimator.drawStickman(ctx, 0, 0, victoryFrame, winner.id, 1, 1);
      }
      ctx.restore();
    }
    
    // 瘥票敹??迂
    if (elapsed > 600) {
      const nameAlpha = Math.min(1, (elapsed - 600) / 800);
      ctx.save();
      ctx.globalAlpha = nameAlpha;
      ctx.font = 'bold 60px "Noto Sans TC", Arial';
      ctx.fillStyle = '#00b894';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#00b894';
      ctx.shadowBlur = 25;
      ctx.fillText(winner.name, this.canvasWidth / 2, this.canvasHeight / 2 + 100);
      ctx.font = 'bold 30px "Noto Sans TC", Arial';
      ctx.fillStyle = '#55efc4';
      ctx.fillText('VICTORY', this.canvasWidth / 2, this.canvasHeight / 2 + 145);
      ctx.restore();
    }
  }

  // ? 擃?敹?瘙箏???- ??蝯??
  renderTaijutsuExecution(ctx, elapsed, winner, loser) {
    // ?嚗擛亙
    const bgAlpha = Math.min(0.95, elapsed / 400);
    const gradient = ctx.createRadialGradient(
      this.canvasWidth / 2, this.canvasHeight / 2, 0,
      this.canvasWidth / 2, this.canvasHeight / 2, 500
    );
    gradient.addColorStop(0, `rgba(40, 10, 10, ${bgAlpha})`);
    gradient.addColorStop(1, `rgba(10, 0, 0, ${bgAlpha})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    const cx = this.canvasWidth / 2;
    const cy = this.canvasHeight * 0.6;

    // 撣園????尿?Ｗ?
    const winnerFrame = {
      head: { x: 0, y: 0, rotation: 0 },
      body: { rotation: 0 },
      leftArm: { upperRotation: -30, lowerRotation: -20 },
      rightArm: { upperRotation: 30, lowerRotation: 20 },
      leftLeg: { upperRotation: -10, lowerRotation: 5 },
      rightLeg: { upperRotation: 10, lowerRotation: 5 }
    };
    const loserFrame = {
      head: { x: 0, y: 0, rotation: 15 },
      body: { rotation: 5 },
      leftArm: { upperRotation: -60, lowerRotation: -30 },
      rightArm: { upperRotation: 60, lowerRotation: 30 },
      leftLeg: { upperRotation: -5, lowerRotation: 10 },
      rightLeg: { upperRotation: 5, lowerRotation: 10 }
    };

    // 蝜芾ˊ閫頛?賣
    const drawChar = (x, y, frame, charId, facing, scale = 3) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, frame, charId, facing, 1);
      }
      ctx.restore();
    };

    // ?挾1嚗?甇仿?餈?(0-0.5s)
    if (elapsed < 500) {
      const slideProgress = elapsed / 500;
      const winnerX = cx - 100 + slideProgress * 70;
      const loserX = cx + 100 - slideProgress * 70;
      
      drawChar(winnerX, cy, winnerFrame, winner.id, 1);
      drawChar(loserX, cy, loserFrame, loser.id, -1);
    }
    // ?挾2嚗?韏瑚蒂蝧餉? (0.5-2s)
    else if (elapsed < 2000) {
      const liftProgress = (elapsed - 500) / 1500;
      const loserY = cy - liftProgress * 120;
      
      drawChar(cx - 30, cy, winnerFrame, winner.id, 1);
      
      ctx.save();
      ctx.translate(cx + 20, loserY);
      ctx.rotate(liftProgress * Math.PI / 2);
      ctx.scale(3, 3);
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, loserFrame, loser.id, -1, 1);
      }
      ctx.restore();
    }
    // ?挾3嚗?蝛箄?韏?(2-4s)
    else if (elapsed < 4000) {
      const jumpProgress = (elapsed - 2000) / 2000;
      const jumpHeight = Math.sin(jumpProgress * Math.PI) * 300;
      const winnerY = cy - jumpHeight;
      
      drawChar(cx, winnerY, winnerFrame, winner.id, 1);
      
      ctx.save();
      ctx.translate(cx + 10, winnerY - 30);
      ctx.rotate(Math.PI / 2 + jumpProgress * Math.PI * 2);
      ctx.scale(3, 3);
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, loserFrame, loser.id, -1, 1);
      }
      ctx.restore();
      
      // 擃征憸典?蝺?
      if (jumpProgress > 0.3) {
        ctx.strokeStyle = `rgba(255, 82, 82, ${(1 - jumpProgress) * 0.5})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(cx - 20 + i * 10, winnerY + 40);
          ctx.lineTo(cx - 20 + i * 10, winnerY + 40 + jumpProgress * 200);
          ctx.stroke();
        }
      }
    }
    // ?挾4嚗亙??? (4-6s)
    else if (elapsed < 6000) {
      const fallProgress = (elapsed - 4000) / 2000;
      const fallY = cy - 300 + fallProgress * 350;
      
      ctx.save();
      ctx.translate(cx, fallY);
      ctx.rotate(fallProgress * Math.PI * 4);
      ctx.scale(3, 3);
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, winnerFrame, winner.id, 1, 1);
        stickmanAnimator.drawStickman(ctx, 4, -7, loserFrame, loser.id, -1, 1);
      }
      ctx.restore();
      
      // 憓?漲蝺?
      ctx.strokeStyle = `rgba(211, 47, 47, ${fallProgress * 0.8})`;
      ctx.lineWidth = 3;
      for (let i = 0; i < 8; i++) {
        const x = cx - 40 + i * 10;
        ctx.beginPath();
        ctx.moveTo(x, fallY - 50 - fallProgress * 100);
        ctx.lineTo(x, fallY - 20);
        ctx.stroke();
      }
    }
    // ?挾5嚗?Ｘ???(6-7s)
    else if (elapsed < 7000) {
      const smashProgress = (elapsed - 6000) / 1000;
      const shakeX = Math.sin(smashProgress * 40) * (1 - smashProgress) * 15;
      const shakeY = Math.cos(smashProgress * 35) * (1 - smashProgress) * 10;
      
      ctx.save();
      ctx.translate(shakeX, shakeY);
      
      // ??蝡?
      drawChar(cx - 30, cy, winnerFrame, winner.id, 1);
      
      // ?圈鋆葦
      ctx.strokeStyle = `rgba(255, 23, 68, ${0.8 - smashProgress * 0.3})`;
      ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI;
        const len = 30 + smashProgress * 80;
        ctx.beginPath();
        ctx.moveTo(cx + 20, cy + 20);
        ctx.lineTo(cx + 20 + Math.cos(angle) * len, cy + 20 + Math.sin(angle) * len * 0.3);
        ctx.stroke();
      }
      
      // ??銵?瘜?
      const waveRadius = smashProgress * 150;
      ctx.strokeStyle = `rgba(211, 47, 47, ${(1 - smashProgress) * 0.6})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx + 20, cy + 10, waveRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.restore();
    }
    // ?挾6嚗澈擃?鋆?(7-8s)
    else if (elapsed < 8000) {
      const shatterProgress = (elapsed - 7000) / 1000;
      
      drawChar(cx - 30, cy, winnerFrame, winner.id, 1);
      
      // ???擃???
      const parts = 8;
      for (let i = 0; i < parts; i++) {
        const angle = (i / parts) * Math.PI * 2;
        const dist = shatterProgress * 80;
        const px = cx + 20 + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist * 0.6;
        const alpha = 1 - shatterProgress;
        
        ctx.fillStyle = `rgba(211, 47, 47, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 4 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // ?挾7嚗?蝯?摮?(8s+)
    else {
      drawChar(cx - 30, cy, winnerFrame, winner.id, 1);
      
      // 銵頝?
      ctx.fillStyle = 'rgba(183, 28, 28, 0.4)';
      ctx.beginPath();
      ctx.ellipse(cx + 20, cy + 25, 40, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // ?捱??
    if (elapsed > 8000) {
      const textAlpha = Math.min(1, (elapsed - 8000) / 1000);
      ctx.save();
      ctx.globalAlpha = textAlpha;
      ctx.font = 'bold 50px "Noto Sans TC", Arial';
      ctx.fillStyle = '#FF1744';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#FF1744';
      ctx.shadowBlur = 30;
      ctx.fillText('猛獸怒吼！力破寰宇！', this.canvasWidth / 2, 150);
      ctx.restore();
    }
  }

  // ? 擃?敹??拍??
  renderTaijutsuVictory(ctx, elapsed, winner) {
    // ?嚗楛蝝擛亙
    const bgAlpha = Math.min(0.9, elapsed / 600);
    ctx.fillStyle = `rgba(30, 5, 5, ${bgAlpha})`;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // ?賡?銵?瘜Ｙ
    if (elapsed > 200) {
      for (let i = 0; i < 3; i++) {
        const waveTime = (elapsed - 200 - i * 400);
        if (waveTime > 0) {
          const waveRadius = (waveTime * 0.15) % 200;
          const waveAlpha = Math.max(0, 0.5 - waveRadius / 200);
          ctx.strokeStyle = `rgba(211, 47, 47, ${waveAlpha})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(this.canvasWidth / 2, this.canvasHeight / 2, waveRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
    
    // ??憪?
    if (elapsed > 500) {
      const scaleProgress = Math.min(1, (elapsed - 500) / 800);
      const scale = 1.5 + scaleProgress * 0.5;
      
      const victoryFrame = {
        head: { x: 0, y: 0, rotation: 0 },
        body: { rotation: 0 },
        leftArm: { upperRotation: -90, lowerRotation: -45 },
        rightArm: { upperRotation: -90, lowerRotation: -45 },
        leftLeg: { upperRotation: -15, lowerRotation: 5 },
        rightLeg: { upperRotation: 15, lowerRotation: 5 }
      };
      
      ctx.save();
      ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2 + 20);
      ctx.scale(scale, scale);
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, victoryFrame, winner.id, 1, 1);
      }
      ctx.restore();
    }
    
    // ?????拇?摮?
    if (elapsed > 1500) {
      const nameAlpha = Math.min(1, (elapsed - 1500) / 800);
      ctx.save();
      ctx.globalAlpha = nameAlpha;
      ctx.font = 'bold 60px "Noto Sans TC", Arial';
      ctx.fillStyle = '#FF1744';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#FF1744';
      ctx.shadowBlur = 25;
      ctx.fillText(winner.name, this.canvasWidth / 2, this.canvasHeight / 2 + 100);
      ctx.font = 'bold 30px "Noto Sans TC", Arial';
      ctx.fillStyle = '#FF5252';
      ctx.fillText('VICTORY', this.canvasWidth / 2, this.canvasHeight / 2 + 145);
      ctx.restore();
    }
  }

  // ? 蝎暸?????恍 - 璉格?銋?
  renderRangerVictory(ctx, elapsed, winner) {
    // 瘛梁?璉格??
    const bgAlpha = Math.min(0.95, elapsed / 300);
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, `rgba(0, 40, 0, ${bgAlpha})`);
    gradient.addColorStop(0.5, `rgba(20, 80, 20, ${bgAlpha})`);
    gradient.addColorStop(1, `rgba(0, 30, 0, ${bgAlpha})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // ??蝛輸???
    if (elapsed > 300) {
      for (let i = 0; i < 5; i++) {
        ctx.save();
        const beamX = this.canvasWidth * (0.15 + i * 0.18);
        const beamGrad = ctx.createLinearGradient(beamX - 20, 0, beamX + 20, this.canvasHeight);
        beamGrad.addColorStop(0, 'rgba(255, 215, 0, 0.15)');
        beamGrad.addColorStop(0.5, 'rgba(76, 175, 80, 0.08)');
        beamGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(beamX - 15 + Math.sin(elapsed * 0.001 + i) * 5, 0, 30, this.canvasHeight);
        ctx.restore();
      }
    }
    
    // 憌璅寡?
    for (let i = 0; i < 20; i++) {
      const leafX = (i * 60 + elapsed * 0.04) % this.canvasWidth;
      const leafY = (elapsed * 0.03 + i * 35) % this.canvasHeight;
      ctx.save();
      ctx.fillStyle = ['#4CAF50', '#81C784', '#A5D6A7', '#FFD700'][i % 4];
      ctx.globalAlpha = 0.6;
      ctx.translate(leafX, leafY);
      ctx.rotate(elapsed * 0.002 + i * 0.5);
      ctx.beginPath();
      ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    // ????- 銝剖亢蝡?
    if (elapsed > 500) {
      const scale = Math.min(4, 2 + elapsed * 0.001);
      ctx.save();
      ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2 + 60);
      ctx.scale(scale, scale);
      const victoryFrame = {
        head: { x: 0, y: 0, rotation: -5 },
        body: { rotation: 0 },
        leftArm: { upperRotation: -50, lowerRotation: -20 },
        rightArm: { upperRotation: 50, lowerRotation: 20 },
        leftLeg: { upperRotation: 10, lowerRotation: -5 },
        rightLeg: { upperRotation: -10, lowerRotation: 5 }
      };
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, victoryFrame, winner.id, 1, 1);
      }
      ctx.restore();
    }
    
    // ?迂?迂??
    if (elapsed > 800) {
      const textAlpha = Math.min(1, (elapsed - 800) / 500);
      ctx.save();
      ctx.font = 'bold 52px "Noto Sans TC", Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(76, 175, 80, ${textAlpha})`;
      ctx.shadowColor = '#4CAF50';
      ctx.shadowBlur = 20;
      ctx.fillText(winner.name, this.canvasWidth / 2, this.canvasHeight / 2 - 80);
      
      ctx.font = 'bold 28px "Noto Sans TC", Arial';
      ctx.fillStyle = `rgba(255, 215, 0, ${textAlpha})`;
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 15;
      ctx.fillText('精靈守護・自然感謝', this.canvasWidth / 2, this.canvasHeight / 2 - 40);
      
      ctx.font = 'bold 30px "Noto Sans TC", Arial';
      ctx.fillStyle = `rgba(165, 214, 167, ${textAlpha})`;
      ctx.fillText('VICTORY', this.canvasWidth / 2, this.canvasHeight / 2 + 145);
      ctx.restore();
    }
  }

  // ? 蝎暸????捱? - ?芰撖拙嚗??脩悌?ａ?摰????
  renderRangerExecution(ctx, elapsed, winner, loser) {
    // ?嚗楛蝬ㄝ?撓??
    const bgAlpha = Math.min(0.95, elapsed / 400);
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, `rgba(0, 30, 0, ${bgAlpha})`);
    gradient.addColorStop(0.5, `rgba(10, 50, 10, ${bgAlpha})`);
    gradient.addColorStop(1, `rgba(0, 20, 0, ${bgAlpha})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    const cx = this.canvasWidth / 2;
    const cy = this.canvasHeight * 0.6;
    const loserX = cx + 120;
    const loserY = cy;
    
    // ????瘙箇???
    if (!this.gameState.victoryAnimation.rangerExec) {
      this.gameState.victoryAnimation.rangerExec = {
        arrows: [],
        phase: 'aim'
      };
    }
    const state = this.gameState.victoryAnimation.rangerExec;
    
    const drawChar = (x, y, frame, charId, facing, scale = 3) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, frame, charId, facing, 1);
      }
      ctx.restore();
    };
    
    const winnerFrame = {
      head: { x: 0, y: 0, rotation: -5 },
      body: { rotation: 0 },
      leftArm: { upperRotation: -130, lowerRotation: -40 },
      rightArm: { upperRotation: 50, lowerRotation: 30 },
      leftLeg: { upperRotation: 15, lowerRotation: -10 },
      rightLeg: { upperRotation: -15, lowerRotation: 10 }
    };
    const loserFrame = {
      head: { x: 0, y: 0, rotation: 20 },
      body: { rotation: 10 },
      leftArm: { upperRotation: -80, lowerRotation: -50 },
      rightArm: { upperRotation: 80, lowerRotation: 50 },
      leftLeg: { upperRotation: -5, lowerRotation: 10 },
      rightLeg: { upperRotation: 5, lowerRotation: 10 }
    };
    
    // ?挾0嚗?皞尿??(0-0.5s)
    if (elapsed < 500) {
      const aimProgress = elapsed / 500;
      drawChar(cx - 150, cy, winnerFrame, winner.id, 1, 3 * (0.8 + aimProgress * 0.2));
      drawChar(loserX, loserY, loserFrame, loser.id, -1);
      
      // ??蝺?
      ctx.save();
      ctx.strokeStyle = `rgba(76, 175, 80, ${aimProgress * 0.6})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(cx - 100, cy - 20);
      ctx.lineTo(loserX, loserY - 20);
      ctx.stroke();
      ctx.restore();
    }
    // ?挾1嚗??脩悌?Ｗ??箔蒂?? (0.5-2s)
    else if (elapsed < 2000) {
      drawChar(cx - 150, cy, winnerFrame, winner.id, 1);
      drawChar(loserX, loserY, loserFrame, loser.id, -1);
      
      const arrowColors = ['#FF5722', '#B388FF', '#40C4FF'];
      const arrowNames = ['fire', 'lightning', 'ice'];
      for (let i = 0; i < 3; i++) {
        const arrowStart = 500 + i * 400;
        if (elapsed > arrowStart) {
          const arrowProgress = Math.min(1, (elapsed - arrowStart) / 300);
          const ax = (cx - 100) + arrowProgress * (loserX - (cx - 100));
          const ay = (cy - 20) + (i - 1) * 15;
          
          ctx.save();
          ctx.strokeStyle = arrowColors[i];
          ctx.shadowColor = arrowColors[i];
          ctx.shadowBlur = 15;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(ax - 25, ay);
          ctx.lineTo(ax, ay);
          ctx.stroke();
          // 蝞剝
          ctx.fillStyle = arrowColors[i];
          ctx.beginPath();
          ctx.moveTo(ax + 8, ay);
          ctx.lineTo(ax - 3, ay - 5);
          ctx.lineTo(ax - 3, ay + 5);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          
          // ?賭葉??
          if (arrowProgress >= 1) {
            ctx.save();
            const flashAlpha = Math.max(0, 1 - (elapsed - arrowStart - 300) / 200);
            ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(loserX, loserY - 20 + (i - 1) * 15, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }
    }
    // ?挾2嚗?啁???(2-4s)
    else if (elapsed < 4000) {
      drawChar(cx - 150, cy, winnerFrame, winner.id, 1);
      
      const burnProgress = (elapsed - 2000) / 2000;
      // ?怎????
      for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2 + elapsed * 0.005;
        const radius = 40 + Math.sin(elapsed * 0.01 + i) * 15;
        const fx = loserX + Math.cos(angle) * radius;
        const fy = loserY + Math.sin(angle) * radius * 0.6;
        ctx.fillStyle = ['#FF5722', '#FFA726', '#FFD700'][i % 3];
        ctx.shadowColor = '#FF5722';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(fx, fy, 5 + Math.random() * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      
      drawChar(loserX, loserY, loserFrame, loser.id, -1);
      
      // ?怎銝剔???
      if (burnProgress > 0.5) {
        ctx.save();
        ctx.font = 'bold 28px "Noto Sans TC", Arial';
        ctx.fillStyle = '#FF5722';
        ctx.shadowColor = '#FF5722';
        ctx.shadowBlur = 20;
        ctx.textAlign = 'center';
        ctx.fillText('燒！', cx, cy - 100);
        ctx.restore();
      }
    }
    // ?挾3嚗?餌???(4-6s)
    else if (elapsed < 6000) {
      drawChar(cx - 150, cy, winnerFrame, winner.id, 1);
      drawChar(loserX, loserY, loserFrame, loser.id, -1);
      
      // ?蝺?
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.strokeStyle = `rgba(179, 136, 255, ${0.5 + Math.random() * 0.5})`;
        ctx.shadowColor = '#B388FF';
        ctx.shadowBlur = 20;
        ctx.lineWidth = 2 + Math.random() * 3;
        ctx.beginPath();
        let lx = loserX - 30 + Math.random() * 60;
        let ly = loserY - 80;
        ctx.moveTo(lx, ly);
        for (let j = 0; j < 5; j++) {
          lx += (Math.random() - 0.5) * 30;
          ly += 20 + Math.random() * 10;
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();
        ctx.restore();
      }
      
      // ?Ｗ??
      if (Math.random() > 0.7) {
        ctx.fillStyle = 'rgba(179, 136, 255, 0.1)';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      }
      
      // ?琿銝剔??瑁
      if (elapsed > 5000 && !state.leftArmSevered) {
        this.createSeveredPart(loserX - 25, loserY - 20, 'leftArm', loser.id, {vx: -6, vy: -12});
        this.createBloodSplatter(loserX - 25, loserY - 20, 1.2, Math.PI);
        state.leftArmSevered = true;
      }
    }
    // ?挾4嚗?嗅???(6-8s)
    else if (elapsed < 8000) {
      drawChar(cx - 150, cy, winnerFrame, winner.id, 1);
      
      const freezeProgress = (elapsed - 6000) / 2000;
      
      // ?唳閬?
      ctx.save();
      ctx.globalAlpha = freezeProgress * 0.8;
      const iceGrad = ctx.createRadialGradient(loserX, loserY, 0, loserX, loserY, 60);
      iceGrad.addColorStop(0, 'rgba(64, 196, 255, 0.6)');
      iceGrad.addColorStop(1, 'rgba(64, 196, 255, 0)');
      ctx.fillStyle = iceGrad;
      ctx.beginPath();
      ctx.arc(loserX, loserY, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      
      // ?唳蝣?
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const r = 30 + freezeProgress * 20;
        const ix = loserX + Math.cos(angle) * r;
        const iy = loserY + Math.sin(angle) * r;
        ctx.save();
        ctx.fillStyle = `rgba(64, 196, 255, ${0.6 - freezeProgress * 0.2})`;
        ctx.fillRect(ix - 3, iy - 3, 6, 6);
        ctx.restore();
      }
      
      drawChar(loserX, loserY, loserFrame, loser.id, -1);
      
      // ?唾??啁?
      if (elapsed > 7500 && !state.rightArmSevered) {
        this.createSeveredPart(loserX + 25, loserY - 20, 'rightArm', loser.id, {vx: 8, vy: -10});
        this.createBloodSplatter(loserX + 25, loserY - 20, 1.2, 0);
        state.rightArmSevered = true;
      }
    }
    // ?挾5嚗?????? + 蝣? (8-10s)
    else if (elapsed < 10000) {
      drawChar(cx - 150, cy, winnerFrame, winner.id, 1);
      
      const burstProgress = (elapsed - 8000) / 2000;
      
      // 銝???
      const burstRadius = 80 * burstProgress;
      ['#FF5722', '#B388FF', '#40C4FF'].forEach((color, i) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 25;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 1 - burstProgress;
        ctx.beginPath();
        ctx.arc(loserX, loserY, burstRadius + i * 15, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
      
      // ?Ｗ???
      ctx.save();
      ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
      
      if (burstProgress < 0.5) {
        drawChar(loserX, loserY, loserFrame, loser.id, -1);
      }
      ctx.restore();
      
      // ?剝憌
      if (elapsed > 9000 && !state.headSevered) {
        this.createSeveredPart(loserX, loserY - 40, 'head', loser.id, {vx: 3, vy: -15});
        this.createBloodSplatter(loserX, loserY - 40, 2, -Math.PI / 2);
        state.headSevered = true;
      }
    }
    // ?挾6嚗?蝯?撟?(10s+)
    else {
      drawChar(cx - 150, cy, winnerFrame, winner.id, 1);
      
      // 憌????
      for (let i = 0; i < 15; i++) {
        const leafX = (cx + (i * 80 + elapsed * 0.03) % this.canvasWidth) % this.canvasWidth;
        const leafY = ((elapsed - 10000) * 0.05 + i * 50) % this.canvasHeight;
        ctx.save();
        ctx.fillStyle = ['#4CAF50', '#81C784', '#A5D6A7'][i % 3];
        ctx.translate(leafX, leafY);
        ctx.rotate(elapsed * 0.002 + i);
        ctx.fillRect(-4, -2, 8, 4);
        ctx.restore();
      }
      
      // ??嗅祟?歹???摮?
      const textAlpha = Math.min(1, (elapsed - 10000) / 500);
      ctx.save();
      ctx.font = 'bold 64px "Noto Sans TC", Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(76, 175, 80, ${textAlpha})`;
      ctx.shadowColor = '#4CAF50';
      ctx.shadowBlur = 30;
      ctx.fillText('精靈獵人勝！', cx, cy - 60);
      
      ctx.font = 'bold 32px "Noto Sans TC", Arial';
      ctx.fillStyle = `rgba(255, 215, 0, ${textAlpha})`;
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 15;
      ctx.fillText(`${winner.name} 勝！`, cx, cy - 10);
      ctx.restore();
    }
  }

  // ?弩 銵憟???瘙箏???- 銵?菔???
  // ??瘚芯犖?恥?捱? - ????拇???辣?脫畾?
  renderRoninExecution(ctx, elapsed, winner, loser) {
    // Background: ink-wash gradient
    const bgAlpha = Math.min(0.95, elapsed / 600);
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, `rgba(15, 15, 25, ${bgAlpha})`);
    gradient.addColorStop(0.5, `rgba(30, 30, 45, ${bgAlpha})`);
    gradient.addColorStop(1, `rgba(10, 10, 15, ${bgAlpha})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    const cx = this.canvasWidth / 2;
    const cy = this.canvasHeight * 0.55;
    const loserX = cx + 80;
    const winnerX = cx - 80;

    // Phase 1 (0-500ms): Winner dashes past loser instantly
    if (elapsed < 500) {
      const dashProg = Math.min(1, elapsed / 200);
      const winX = winnerX - 100 + dashProg * 360;

      ctx.save();
      ctx.translate(winX, cy);
      ctx.scale(3, 3);
      const dashFrame = {
        head: { x: 0, y: 0, rotation: -10 },
        body: { rotation: -15 },
        leftArm: { upperRotation: -60, lowerRotation: -90 },
        rightArm: { upperRotation: 80, lowerRotation: 60 },
        leftLeg: { upperRotation: 40, lowerRotation: -40 },
        rightLeg: { upperRotation: -30, lowerRotation: 20 }
      };
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, dashFrame, winner.id, 1, 1);
      }
      ctx.restore();

      // Speed lines
      ctx.save();
      ctx.strokeStyle = `rgba(200, 200, 220, ${0.6 * (1 - dashProg)})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const ly = cy - 60 + i * 15;
        ctx.beginPath();
        ctx.moveTo(winX - 80, ly);
        ctx.lineTo(winX - 180, ly);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Phase 2 (500ms-4000ms): Both standing still, back-to-back
    if (elapsed >= 500 && elapsed < 6000) {
      // Winner standing, facing away from loser (facing left)
      ctx.save();
      ctx.translate(loserX + 100, cy);
      ctx.scale(3, 3);
      const stillWinner = {
        head: { x: 0, y: 0, rotation: 0 },
        body: { rotation: 0 },
        leftArm: { upperRotation: -20, lowerRotation: -10 },
        rightArm: { upperRotation: 20, lowerRotation: 10 },
        leftLeg: { upperRotation: 5, lowerRotation: 0 },
        rightLeg: { upperRotation: -5, lowerRotation: 0 }
      };
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, stillWinner, winner.id, -1, 1);
      }
      ctx.restore();

      // Loser standing, facing away from winner (facing left)
      ctx.save();
      ctx.translate(loserX - 40, cy);
      ctx.scale(3, 3);
      const stillLoser = {
        head: { x: 0, y: 0, rotation: 0 },
        body: { rotation: 0 },
        leftArm: { upperRotation: -15, lowerRotation: -5 },
        rightArm: { upperRotation: 15, lowerRotation: 5 },
        leftLeg: { upperRotation: 3, lowerRotation: 0 },
        rightLeg: { upperRotation: -3, lowerRotation: 0 }
      };
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, stillLoser, loser.id, -1, 1);
      }
      ctx.restore();

      // Dramatic wind particle
      if (elapsed > 2000) {
        for (let i = 0; i < 3; i++) {
          const leafX = ((elapsed * 0.04 + i * 200) % (this.canvasWidth + 100)) - 50;
          const leafY = cy - 80 + Math.sin(elapsed * 0.002 + i * 1.5) * 30;
          ctx.save();
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = '#90A4AE';
          ctx.beginPath();
          ctx.ellipse(leafX, leafY, 4, 2, elapsed * 0.005 + i, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }

    // Phase 3 (4000ms-4100ms): Glowing diagonal slash line across loser's torso
    if (elapsed >= 4000 && elapsed < 6000) {
      const slashAlpha = elapsed < 4500 ? Math.min(1, (elapsed - 4000) / 100) : Math.max(0, 1 - (elapsed - 4500) / 1500);
      const lx = loserX - 40;

      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${slashAlpha})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 20 * slashAlpha;
      ctx.beginPath();
      ctx.moveTo(lx - 50, cy - 90);
      ctx.lineTo(lx + 50, cy + 10);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Phase 4 (6000ms-8000ms): The Cut - upper body slides off
    if (elapsed >= 6000 && elapsed < 8000) {
      const cutProg = Math.min(1, (elapsed - 6000) / 1500);
      const slideX = cutProg * 60;
      const slideY = cutProg * 50;
      const slideRot = cutProg * 25 * Math.PI / 180;

      // Winner still standing
      ctx.save();
      ctx.translate(loserX + 100, cy);
      ctx.scale(3, 3);
      const winFrame = {
        head: { x: 0, y: 0, rotation: 0 },
        body: { rotation: 0 },
        leftArm: { upperRotation: -20, lowerRotation: -10 },
        rightArm: { upperRotation: 20, lowerRotation: 10 },
        leftLeg: { upperRotation: 5, lowerRotation: 0 },
        rightLeg: { upperRotation: -5, lowerRotation: 0 }
      };
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, winFrame, winner.id, -1, 1);
      }
      ctx.restore();

      // Loser lower body (legs + waist) stays in place
      ctx.save();
      ctx.translate(loserX - 40, cy);
      ctx.scale(3, 3);
      // Draw only legs
      ctx.strokeStyle = '#78909C';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-8, 25);
      ctx.lineTo(-6, 50);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(8, 25);
      ctx.lineTo(6, 50);
      ctx.stroke();
      ctx.restore();

      // Loser upper body sliding off with rotation
      ctx.save();
      ctx.translate(loserX - 40 + slideX, cy - slideY * 0.3);
      ctx.rotate(slideRot);
      ctx.scale(3, 3);
      // Draw head + body + arms (sliding part)
      ctx.strokeStyle = '#78909C';
      ctx.lineWidth = 4;
      // Body
      ctx.beginPath();
      ctx.moveTo(0, -50);
      ctx.lineTo(0, 0);
      ctx.stroke();
      // Head
      ctx.beginPath();
      ctx.arc(0, -62, 12, 0, Math.PI * 2);
      ctx.stroke();
      // Left arm
      ctx.beginPath();
      ctx.moveTo(-5, -40);
      ctx.lineTo(-20, -25);
      ctx.lineTo(-15, -10);
      ctx.stroke();
      // Right arm
      ctx.beginPath();
      ctx.moveTo(5, -40);
      ctx.lineTo(20, -25);
      ctx.lineTo(15, -10);
      ctx.stroke();
      ctx.restore();

      // Blood from waist
      if (elapsed > 6200 && !this.gameState.victoryAnimation.roninBloodSpurted) {
        this.createBloodSplatter(loserX - 40, cy, 2.5, Math.PI / 4);
        this.createBloodSplatter(loserX - 40, cy, 2.0, -Math.PI / 4);
        this.gameState.victoryAnimation.roninBloodSpurted = true;
      }

      // Continuous blood drip
      if (Math.random() > 0.7) {
        this.createBloodSplatter(loserX - 40 + slideX * 0.5, cy - 5, 0.5, Math.PI / 2);
      }
    }

    // Phase 5 (8000ms+): Both halves fall, then blood particles spurt
    if (elapsed >= 8000) {
      const fallProg = Math.min(1, (elapsed - 8000) / 1500);
      const groundY = this.canvasHeight * 0.85;

      // Winner still standing (sheaths sword)
      ctx.save();
      ctx.translate(loserX + 100, cy);
      ctx.scale(3, 3);
      const sheathFrame = {
        head: { x: 0, y: 0, rotation: -5 },
        body: { rotation: 0 },
        leftArm: { upperRotation: -30, lowerRotation: -40 },
        rightArm: { upperRotation: 10, lowerRotation: 20 },
        leftLeg: { upperRotation: 5, lowerRotation: 0 },
        rightLeg: { upperRotation: -5, lowerRotation: 0 }
      };
      if (typeof stickmanAnimator !== 'undefined') {
        stickmanAnimator.drawStickman(ctx, 0, 0, sheathFrame, winner.id, -1, 1);
      }
      ctx.restore();

      // Lower body topples
      const lowerFall = Math.min(groundY, cy + fallProg * 100);
      ctx.save();
      ctx.translate(loserX - 40, lowerFall);
      ctx.rotate(fallProg * 0.3);
      ctx.scale(3, 3);
      ctx.strokeStyle = '#546E7A';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-8, 25);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(8, 25);
      ctx.stroke();
      ctx.restore();

      // Upper body falls to ground
      const upperFallY = Math.min(groundY - 30, cy - 30 + fallProg * 150);
      ctx.save();
      ctx.translate(loserX + 20, upperFallY);
      ctx.rotate(fallProg * Math.PI * 0.4 + 25 * Math.PI / 180);
      ctx.scale(3, 3);
      ctx.strokeStyle = '#546E7A';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -50);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -62, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Blood spurting from waist
      if (elapsed < 10000 && Math.random() > 0.5) {
        this.createBloodSplatter(loserX - 40, cy + fallProg * 50, 1.5, Math.random() * Math.PI);
      }
    }

    // Phase 6 (12000ms+): Text fades in
    if (elapsed >= 12000) {
      const textAlpha = Math.min(1, (elapsed - 12000) / 800);
      ctx.save();
      ctx.font = 'bold 52px "Noto Sans TC", Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 25;
      ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
      ctx.fillText('浪人居合斬！', cx, cy - 100);

      // Sub-text
      ctx.font = 'bold 24px "Noto Sans TC", Arial';
      ctx.shadowBlur = 10;
      ctx.fillStyle = `rgba(176, 190, 197, ${textAlpha * 0.8})`;
      ctx.fillText(winner.name, cx, cy - 60);
      ctx.restore();
    }
  }

  renderBeastmasterExecution(ctx, elapsed, winner, loser) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, 'rgba(30, 30, 30, 0.96)');
    gradient.addColorStop(1, 'rgba(10, 10, 10, 0.96)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    const centerX = this.canvasWidth / 2;
    const groundY = this.canvasHeight * 0.72;

    const baseWinnerX = centerX - 180;
    const baseWinnerY = groundY;
    const baseLoserX = centerX + 150;
    let loserX = baseLoserX;
    let loserY = groundY;

    const golemScale = elapsed >= 500 ? 1.25 : 1 + (elapsed / 500) * 0.25;

    if (elapsed >= 2000) {
      loserX = baseWinnerX + 70;
      loserY = baseWinnerY - 120;
    }

    if (elapsed >= 5000 && elapsed < 8000) {
      const slamTime = (elapsed - 5000) / 220;
      loserY = baseWinnerY - 70 + Math.sin(slamTime * Math.PI * 2.5) * 95;
      loserX = baseWinnerX + 90;
    }

    const isFlattened = elapsed >= 8000;

    ctx.save();
    if (elapsed >= 10000) {
      const shakePower = 14;
      const shakeX = (Math.random() - 0.5) * shakePower;
      const shakeY = (Math.random() - 0.5) * shakePower;
      ctx.translate(shakeX, shakeY);
    }

    // Winner (golem)
    ctx.save();
    ctx.translate(baseWinnerX, baseWinnerY);
    ctx.scale(golemScale, golemScale);
    if (typeof stickmanAnimator !== 'undefined' && stickmanAnimator) {
      const frame = stickmanAnimator.animations.attack[0] || stickmanAnimator.animations.idle[0];
      stickmanAnimator.drawStickman(ctx, 0, 0, frame, winner.id, 1, 1);
    }
    ctx.restore();

    // Giant hand visual at 2s+
    if (elapsed >= 2000) {
      ctx.save();
      ctx.fillStyle = '#616161';
      ctx.strokeStyle = '#424242';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.rect(baseWinnerX + 40, baseWinnerY - 160, 90, 60);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Loser
    ctx.save();
    ctx.translate(loserX, loserY);
    if (isFlattened) {
      ctx.scale(2, 0.1);
    }
    if (typeof stickmanAnimator !== 'undefined' && stickmanAnimator) {
      const loserFrame = stickmanAnimator.animations.hit[0] || stickmanAnimator.animations.idle[0];
      stickmanAnimator.drawStickman(ctx, 0, 0, loserFrame, loser.id, -1, 1);
    }
    ctx.restore();

    // Ground slam dust
    if (elapsed >= 5000 && elapsed < 8000) {
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#8D6E63';
        ctx.beginPath();
        ctx.arc(baseWinnerX + 80 + (i * 14), groundY + 5, 6 + Math.random() * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Roar cue at 10s+
    if (elapsed >= 10000) {
      ctx.save();
      ctx.font = 'bold 48px "Noto Sans TC", Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('吼！', centerX - 120, 120);
      ctx.restore();
    }

    // 12s+ text
    if (elapsed >= 12000) {
      const textAlpha = Math.min(1, (elapsed - 12000) / 800);
      ctx.save();
      ctx.globalAlpha = textAlpha;
      ctx.font = 'bold 54px "Noto Sans TC", Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#B0BEC5';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#ECEFF1';
      ctx.fillText('巨獸壓制完成！', centerX, 110);
      ctx.restore();
    }

    ctx.restore();
  }

  // ====================================================================
  // ?? SCORPION EXECUTION SCENE - Whip strangling
  // ====================================================================
  renderScorpionExecution(ctx, elapsed, winner, loser) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, 'rgba(40, 0, 0, 0.96)');
    gradient.addColorStop(1, 'rgba(10, 0, 0, 0.96)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    const centerX = this.canvasWidth / 2;
    const groundY = this.canvasHeight * 0.72;
    const winnerX = centerX - 180;
    const loserX = centerX + 120;

    // Winner rendering
    ctx.save();
    if (typeof stickmanAnimator !== 'undefined' && stickmanAnimator) {
      const frame = stickmanAnimator.animations.attack[0] || stickmanAnimator.animations.idle[0];
      stickmanAnimator.drawStickman(ctx, winnerX, groundY, frame, winner.id, 1, 1);
    }
    ctx.restore();

    // Whip coiling around loser
    const coilProgress = Math.min(1, elapsed / 3000);
    ctx.save();
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 8;
    for (let i = 0; i < Math.floor(coilProgress * 8); i++) {
      const angle = i * 0.8 + elapsed * 0.002;
      const radius = 25 + i * 3;
      ctx.beginPath();
      ctx.arc(loserX, groundY - 30 + i * 5, radius, angle, angle + 1.2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // Loser being constricted
    ctx.save();
    const squeezeScale = elapsed >= 5000 ? Math.max(0.5, 1 - (elapsed - 5000) / 6000) : 1;
    ctx.translate(loserX, groundY);
    ctx.scale(squeezeScale, 1);
    if (typeof stickmanAnimator !== 'undefined' && stickmanAnimator) {
      const loserFrame = stickmanAnimator.animations.hit[0] || stickmanAnimator.animations.idle[0];
      stickmanAnimator.drawStickman(ctx, 0, 0, loserFrame, loser.id, -1, 1);
    }
    ctx.restore();

    // Blood spurts from constriction at 7s+
    if (elapsed >= 7000) {
      this.createBloodSplatter(loserX, groundY - 20, 2, Math.PI / 2);
    }

    // Finishing text at 12s+
    if (elapsed >= 12000) {
      const textAlpha = Math.min(1, (elapsed - 12000) / 800);
      ctx.save();
      ctx.globalAlpha = textAlpha;
      ctx.font = 'bold 54px "Noto Sans TC", Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#FF4444';
      ctx.fillText('名門連環殺完成！', centerX, 110);
      ctx.restore();
    }
  }

  // ??? Exile Blade Victory Execution Scene ???
  renderExileBladeVictoryExecution(ctx, elapsed, winner, loser) {
    // Dark cyan/black background
    const bg = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    bg.addColorStop(0, 'rgba(0, 30, 30, 0.96)');
    bg.addColorStop(1, 'rgba(0, 10, 10, 0.96)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    const centerX = this.canvasWidth / 2;
    const groundY = this.canvasHeight * 0.72;
    const winnerX = centerX - 150;
    const loserX = centerX + 100;

    // Phase 1 (0-3s): Rapid slash lines across screen
    if (elapsed < 3000) {
      const slashCount = Math.floor(elapsed / 300);
      for (let i = 0; i < Math.min(slashCount, 10); i++) {
        const angle = (Math.PI / 5) * i + i * 0.3;
        const slashAlpha = Math.max(0, 1 - (elapsed - i * 300) / 2000);
        ctx.save();
        ctx.translate(loserX, groundY - 30);
        ctx.rotate(angle);
        ctx.strokeStyle = `rgba(0, 139, 139, ${slashAlpha})`;
        ctx.lineWidth = 3 + Math.random() * 2;
        ctx.shadowColor = 'rgba(0, 200, 200, 0.8)';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(-100, 0);
        ctx.lineTo(100, 0);
        ctx.stroke();
        ctx.restore();
      }
    }

    // Winner standing
    ctx.save();
    if (typeof stickmanAnimator !== 'undefined' && stickmanAnimator) {
      const frame = stickmanAnimator.animations.attack[0] || stickmanAnimator.animations.idle[0];
      stickmanAnimator.drawStickman(ctx, winnerX, groundY, frame, winner.id, 1, 1);
    }
    ctx.restore();

    // Loser collapsing
    ctx.save();
    const collapse = elapsed >= 4000 ? Math.min(1, (elapsed - 4000) / 2000) : 0;
    ctx.translate(loserX, groundY);
    ctx.rotate(collapse * Math.PI / 2);
    if (typeof stickmanAnimator !== 'undefined' && stickmanAnimator) {
      const loserFrame = stickmanAnimator.animations.hit ? stickmanAnimator.animations.hit[0] : stickmanAnimator.animations.idle[0];
      stickmanAnimator.drawStickman(ctx, 0, 0, loserFrame, loser.id, -1, 1);
    }
    ctx.restore();

    // Blood from slashes
    if (elapsed >= 2000) {
      this.createBloodSplatter(loserX, groundY - 30, 2, Math.PI);
    }

    // Finishing text at 10s
    if (elapsed >= 10000) {
      const textAlpha = Math.min(1, (elapsed - 10000) / 800);
      ctx.save();
      ctx.globalAlpha = textAlpha;
      ctx.font = 'bold 54px "Noto Sans TC", Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#008B8B';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#00CED1';
      ctx.fillText('裂空斬完成！', centerX, 110);
      ctx.restore();
    }
  }

  // ====================================================================
  // ?? SCORPION SYSTEMS ??Update & Render for Minions, Hazards, Chain
  // ====================================================================
  // ?? Check if a melee attack hits any enemy minions in range
  checkMeleeHitMinions(attacker, attackerId, damage) {
    if (!this.gameState.minions || this.gameState.minions.length === 0) return;
    const meleeRange = this.getMeleeRange(attacker);

    this.gameState.minions.forEach(minion => {
      // Only hit enemy minions (not your own)
      if (minion.ownerSide === attackerId) return;
      const dist = Math.abs(attacker.position.x - minion.x);
      if (dist <= meleeRange) {
        minion.hp -= damage;
        this.addDamageNumber(minion.x, minion.y - 50, damage, 'normal');
        this.addVisualEffect(minion.x, minion.y - 30, 'hit', '💥');
        if (minion.hp <= 0) {
          this.addCombatLog(`僕人被擊殺！`, attackerId, 'damage');
        }
      }
    });
  }

  // ?? Check if a projectile hits any enemy minions
  checkProjectileHitMinions(projectile) {
    if (!this.gameState.minions || this.gameState.minions.length === 0) return false;
    const owner = projectile.owner;
    const ownerSide = owner === this.players.player1 ? 'player1' : 'player2';

    for (let i = 0; i < this.gameState.minions.length; i++) {
      const minion = this.gameState.minions[i];
      // Only hit enemy minions
      if (minion.ownerSide === ownerSide) continue;
      const dist = Math.abs(projectile.x - minion.x);
      if (dist < 40 && Math.abs(projectile.y - minion.y) < 50) {
        minion.hp -= projectile.damage;
        this.addDamageNumber(minion.x, minion.y - 50, projectile.damage, 'skill');
        this.addVisualEffect(minion.x, minion.y - 30, 'hit', '💥');
        if (minion.hp <= 0) {
          this.addCombatLog(`靈爆符命中敵人！`, ownerSide, 'damage');
        }
        return true; // Projectile consumed
      }
    }
    return false;
  }

  updateScorpionSystems(deltaTime) {
    const now = Date.now();

    // --- Update Minions ---
    if (this.gameState.minions && this.gameState.minions.length > 0) {
      this.gameState.minions = this.gameState.minions.filter(minion => {
        // Check lifespan and HP
        if (minion.hp <= 0 || now - minion.spawnTime >= minion.lifespan) return false;

        const target = minion.owner === this.players.player1 ? this.players.player2 : this.players.player1;
        if (!target || target.hp <= 0) return false;

        const distToTarget = Math.abs(minion.x - target.position.x);

        // Move towards enemy if out of melee range
        if (distToTarget > minion.meleeRange) {
          const dir = target.position.x > minion.x ? 1 : -1;
          minion.x += dir * minion.speed * (deltaTime / 1000);
          minion.facing = dir;
          // Bounds check
          minion.x = Math.max(80, Math.min(this.canvasWidth - 80, minion.x));
        } else {
          // In range ??attack if cooldown allows
          if (now - minion.lastAttackTime >= minion.attackSpeed) {
            minion.lastAttackTime = now;
            minion.isAttacking = true;
            minion.attackAnimStart = now;
            const result = this.dealDamage(target, minion.damage, minion.ownerSide);
            if (result.hit) {
              const side = minion.ownerSide;
              this.addCombatLog(`僕從命中敵人！造成${minion.damage}傷害`, side, 'damage');
            }
          }
        }
        return true;
      });
    }

    // --- Update Whip Hazards ---
    if (this.gameState.hazards && this.gameState.hazards.length > 0) {
      this.gameState.hazards = this.gameState.hazards.filter(hazard => {
        if (now - hazard.createdAt >= hazard.duration) return false;

        const target = hazard.targetRef;
        if (!target || target.hp <= 0) return false;

        // Check if enemy overlaps hazard X range
        const inRange = Math.abs(target.position.x - hazard.x) < hazard.width / 2;
        if (inRange && now - hazard.lastTickTime >= hazard.tickRate) {
          hazard.lastTickTime = now;
          target.hp = Math.max(0, target.hp - hazard.damagePerTick);
          this.addDamageNumber(target.position.x, target.position.y - 10, hazard.damagePerTick, 'skill');
          this.addVisualEffect(
            target.position.x,
            target.position.y,
            hazard.type === 'fire_trail' ? 'burning_trail' : 'poison',
            hazard.type === 'fire_trail' ? '🔥' : '☠️'
          );
          if (target.hp <= 0) {
            const winnerId = target === this.players.player1 ? 'player2' : 'player1';
            this.gameState.winner = winnerId;
            this.addVisualEffect(target.position.x, target.position.y, 'death', '💀');
          }
        }
        return true;
      });
    }

    // --- Update Chain of Pain ---
    if (this.gameState.chainOfPain) {
      const chain = this.gameState.chainOfPain;
      if (now >= chain.endTime) {
        // Release both players
        if (chain.scorpion && chain.scorpion.effects) {
          chain.scorpion.effects.rooted = 0;
        }
        if (chain.enemy && chain.enemy.effects) {
          chain.enemy.effects.rooted = 0;
        }
        this.gameState.chainOfPain = null;
      }
    }
  }

  updateAdjudicatorSystems() {
    const now = Date.now();

    const playerEntries = [
      ['player1', this.players.player1],
      ['player2', this.players.player2]
    ];

    playerEntries.forEach(([, player]) => {
      if (!player) return;
      if (typeof player._lastPositionX !== 'number') {
        player._lastPositionX = player.position.x;
      }
    });

    // ?? 鋡怠?嚗????萎犖?亥?鋆捱??皜?
    playerEntries.forEach(([playerId, player]) => {
      if (!player || player.id !== 'adjudicator' || player.hp <= 0) return;

      const opponentId = playerId === 'player1' ? 'player2' : 'player1';
      const opponent = this.players[opponentId];
      if (!opponent || opponent.hp <= 0) return;

      const distance = Math.abs(opponent.position.x - player.position.x);
      const moveDelta = opponent.position.x - (opponent._lastPositionX ?? opponent.position.x);
      const moveDirection = Math.sign(moveDelta);
      const directionToAdjudicator = Math.sign(player.position.x - opponent.position.x);
      const isApproaching = moveDirection !== 0 && moveDirection === directionToAdjudicator;

      if (distance <= (player.passive?.range || 300) && isApproaching) {
        opponent.effects.adjudicatorPassiveSlow = now + 120;
      }
    });

    // ?? 憭扳???蝞∠?
    if (this.gameState.adjudicatorDomain) {
      const domain = this.gameState.adjudicatorDomain;

      if (now >= domain.expiresAt) {
        // ?蔭??蝺拚?閮?
        ['player1', 'player2'].forEach(pid => {
          if (this.players[pid]) this.players[pid].effects.verdictSlowApplied = false;
        });
        this.gameState.adjudicatorDomain = null;
      } else {
        const owner = this.players[domain.ownerId];
        if (owner && owner.hp > 0) {
          domain.x = owner.position.x;
        }

        const opponentId = domain.ownerId === 'player1' ? 'player2' : 'player1';
        const opponent = this.players[opponentId];
        if (opponent && opponent.hp > 0) {
          const inDomain = Math.abs(opponent.position.x - domain.x) <= domain.radius;
          if (!domain.insideState) {
            domain.insideState = { player1: false, player2: false };
          }

          if (inDomain && !domain.insideState[opponentId]) {
            const entryDamage = domain.entryDamage || 5;
            this.dealDamageWithResult(opponent, entryDamage, domain.ownerId);
            this.addVisualEffect(opponent.position.x, opponent.position.y - 25, 'adjudicator_entry', '⚖️');
            // ?? ?脣?????甈⊥抒楨??60%??0%??嚗?蝘?
            if (!opponent.effects.verdictSlowApplied) {
              opponent.effects.verdictSlow = now + 3000;
              opponent.effects.verdictSlowApplied = true;
              this.addCombatLog('最終判決降低移速！', domain.ownerId, 'status');
            }
          }

          domain.insideState[opponentId] = inDomain;
        }
      }
    }

    playerEntries.forEach(([, player]) => {
      if (!player) return;
      player._lastPositionX = player.position.x;
    });
  }

  renderScorpionSystems() {
    const ctx = this.ctx;
    const now = Date.now();

    // --- Render Minions ---
    if (this.gameState.minions && this.gameState.minions.length > 0) {
      this.gameState.minions.forEach(minion => {
        ctx.save();

        // Draw a smaller, dark-gray stickman
        ctx.globalAlpha = 0.85;
        if (typeof stickmanAnimator !== 'undefined' && stickmanAnimator) {
          const isAtk = minion.isAttacking && (now - minion.attackAnimStart < 300);
          const animFrames = isAtk
            ? stickmanAnimator.animations.attack
            : stickmanAnimator.animations.idle;
          const frameIdx = Math.floor(((now - minion.spawnTime) / 100) % animFrames.length);
          const frame = animFrames[frameIdx] || animFrames[0];

          // Minion-specific dark gray tint overlay
          ctx.save();
          stickmanAnimator.drawStickman(ctx, minion.x, minion.y, frame, 'scorpion', minion.facing, 0.75);
          ctx.restore();
        } else {
          // Fallback: simple stick figure
          ctx.strokeStyle = '#555555';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(minion.x, minion.y - 50, 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(minion.x, minion.y - 42);
          ctx.lineTo(minion.x, minion.y - 15);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(minion.x - 12, minion.y - 35);
          ctx.lineTo(minion.x + 12, minion.y - 35);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(minion.x, minion.y - 15);
          ctx.lineTo(minion.x - 10, minion.y);
          ctx.moveTo(minion.x, minion.y - 15);
          ctx.lineTo(minion.x + 10, minion.y);
          ctx.stroke();
        }

        // Minion HP bar
        const barW = 30;
        const barH = 3;
        const hpRatio = Math.max(0, minion.hp / minion.maxHp);
        ctx.fillStyle = '#333';
        ctx.fillRect(minion.x - barW / 2, minion.y - 62, barW, barH);
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(minion.x - barW / 2, minion.y - 62, barW * hpRatio, barH);

        ctx.restore();
      });
    }

    // --- Render Whip Hazards (spiky dark-red vines on the ground) ---
    if (this.gameState.hazards && this.gameState.hazards.length > 0) {
      this.gameState.hazards.forEach(hazard => {
        const age = now - hazard.createdAt;
        const lifeRatio = 1 - age / hazard.duration;
        if (lifeRatio <= 0) return;

        ctx.save();
        ctx.globalAlpha = Math.min(0.8, lifeRatio);

        const baseX = hazard.x - hazard.width / 2;
        const groundY = hazard.y;

        if (hazard.type === 'fire_trail') {
          ctx.fillStyle = 'rgba(255, 86, 0, 0.36)';
          ctx.shadowColor = '#ff6d00';
          ctx.shadowBlur = 16;
          ctx.fillRect(baseX, groundY - 8, hazard.width, 14);
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffd166';
          const flameCount = Math.max(5, Math.floor(hazard.width / 38));
          for (let i = 0; i < flameCount; i++) {
            const flameX = baseX + (hazard.width / flameCount) * (i + 0.5);
            const flameH = 8 + Math.sin(age * 0.012 + i * 1.7) * 4;
            ctx.beginPath();
            ctx.moveTo(flameX - 5, groundY + 2);
            ctx.lineTo(flameX, groundY - flameH);
            ctx.lineTo(flameX + 5, groundY + 2);
            ctx.fill();
          }
          ctx.restore();
          return;
        }

        // Ground glow
        ctx.fillStyle = 'rgba(139, 0, 0, 0.25)';
        ctx.shadowColor = '#8B0000';
        ctx.shadowBlur = 12;
        ctx.fillRect(baseX, groundY - 5, hazard.width, 10);
        ctx.shadowBlur = 0;

        // Jagged spiked vines
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 2;
        const spikeCount = 8;
        for (let i = 0; i < spikeCount; i++) {
          const sx = baseX + (hazard.width / spikeCount) * i + 5;
          const spikeH = 10 + Math.sin(age * 0.005 + i) * 6;
          ctx.beginPath();
          ctx.moveTo(sx, groundY);
          ctx.lineTo(sx + 3, groundY - spikeH);
          ctx.lineTo(sx + 6, groundY - spikeH * 0.4);
          ctx.lineTo(sx + 9, groundY - spikeH * 0.8);
          ctx.lineTo(sx + 12, groundY);
          ctx.stroke();
        }

        // Vine tendrils
        ctx.strokeStyle = '#5B0000';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
          const vx = baseX + 10 + i * 18;
          ctx.beginPath();
          ctx.moveTo(vx, groundY);
          ctx.quadraticCurveTo(
            vx + Math.sin(age * 0.003 + i) * 8,
            groundY - 15 - Math.sin(age * 0.004 + i * 2) * 5,
            vx + 10,
            groundY - 5
          );
          ctx.stroke();
        }

        ctx.restore();
      });
    }

    // --- Render Chain of Pain ---
    if (this.gameState.chainOfPain) {
      const chain = this.gameState.chainOfPain;
      const elapsed = now - chain.startTime;
      const duration = chain.endTime - chain.startTime;
      const progress = Math.min(1, elapsed / duration);

      ctx.save();

      const enemyX = chain.enemy.position.x;
      const enemyY = chain.enemy.position.y;
      const scorpionX = chain.scorpion.position.x;
      const scorpionY = chain.scorpion.position.y;

      // Thick glowing red chains on enemy ??crisscross 'X' pattern
      const pulseAlpha = 0.6 + Math.sin(now * 0.008) * 0.3;
      ctx.globalAlpha = pulseAlpha * (1 - progress * 0.3);
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 15;

      // 'X' over enemy bounding box
      const boxW = 40;
      const boxH = 60;
      ctx.beginPath();
      ctx.moveTo(enemyX - boxW, enemyY - boxH);
      ctx.lineTo(enemyX + boxW, enemyY + boxH * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(enemyX + boxW, enemyY - boxH);
      ctx.lineTo(enemyX - boxW, enemyY + boxH * 0.3);
      ctx.stroke();

      // Chains erupting from ground to enemy
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const offset = (i - 1) * 25;
        ctx.beginPath();
        ctx.moveTo(enemyX + offset, enemyY + 30);
        ctx.lineTo(enemyX + offset + Math.sin(now * 0.005 + i) * 5, enemyY - 60);
        ctx.stroke();
      }

      // Thinner chain grounding the Scorpion (visual explanation for self-root)
      ctx.lineWidth = 2;
      ctx.globalAlpha = pulseAlpha * 0.5 * (1 - progress * 0.3);
      ctx.strokeStyle = '#CC0000';
      ctx.beginPath();
      ctx.moveTo(scorpionX - 10, scorpionY + 30);
      ctx.lineTo(scorpionX - 10, scorpionY - 20);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(scorpionX + 10, scorpionY + 30);
      ctx.lineTo(scorpionX + 10, scorpionY - 20);
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  // ====================================================================
  // ?? SCORPION BASIC ATTACK ??Whip with quadraticCurveTo animation
  // ====================================================================
  renderScorpionWhipAttack(player, opponent, playerId) {
    const now = Date.now();
    // Store whip animation state on the player
    if (!player._whipAnim) return;

    const anim = player._whipAnim;
    const elapsed = now - anim.startTime;
    const duration = 400; // 400ms whip animation

    if (elapsed >= duration) {
      player._whipAnim = null;
      return;
    }

    const ctx = this.ctx;
    const progress = elapsed / duration;

    // Use stored attack direction for consistent whip animation
    const dir = anim.direction || player.facing;

    // Shoulder position
    const shoulderX = player.position.x + (15 * dir);
    const shoulderY = player.position.y - 35;

    // End point: extends up to attack range in attack direction
    const range = player.attackRange || 240;
    const endX = player.position.x + (range * dir * Math.min(1, progress * 2));
    const endY = player.position.y - 20;

    // Control point ??animate for "whip snap" effect
    // Curve up then snap straight
    let controlY;
    if (progress < 0.4) {
      // Curving upward phase
      controlY = shoulderY - 60 * (progress / 0.4);
    } else {
      // Snapping straight phase
      controlY = shoulderY - 60 * (1 - (progress - 0.4) / 0.6);
    }
    const controlX = (shoulderX + endX) / 2;

    ctx.save();
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    ctx.stroke();

    // Whip tip spark
    if (progress > 0.3 && progress < 0.7) {
      ctx.fillStyle = '#FF4444';
      ctx.beginPath();
      ctx.arc(endX, endY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ====================================================================
  // ?? SCORPION executeSkill dispatch
  // ====================================================================
  executeScorpionSkill(playerId, skillCode) {
    const now = Date.now();
    const player = this.players[playerId];
    const opponentId = playerId === 'player1' ? 'player2' : 'player1';
    const opponent = this.players[opponentId];
    if (!player || !opponent) return;

    if (skillCode === SKILL_CODES.REBEL_MINION) {
      // --- Skill 1: Rebel Minion ---
      const skill = player.skills.normal;
      const groundY = player.position.y;

      // 2?餃??拙振?祇??箇? + 1?餃??菜???????
      const behindEnemyEdge = opponent.facing > 0 ? (this.canvasWidth - 80) : 80;

      if (!this.gameState.minions) this.gameState.minions = [];
      const spawnConfigs = [
        { x: player.position.x - 30, fromPlayer: true },
        { x: player.position.x + 30, fromPlayer: true },
        { x: behindEnemyEdge, fromPlayer: false }
      ];
      for (let i = 0; i < spawnConfigs.length; i++) {
        const spawnCfg = spawnConfigs[i];
        const offsetX = Math.max(80, Math.min(this.canvasWidth - 80, spawnCfg.x));
        const minion = {
          x: offsetX,
          y: groundY,
          facing: opponent.position.x > offsetX ? 1 : -1,
          hp: skill.minionHp,
          maxHp: skill.minionHp,
          speed: skill.minionSpeed,
          attackSpeed: skill.minionAttackSpeed,
          damage: skill.minionDamage,
          lifespan: skill.minionLifespan,
          meleeRange: skill.minionMeleeRange,
          spawnTime: now,
          lastAttackTime: 0,
          isAttacking: false,
          attackAnimStart: 0,
          owner: player,
          ownerSide: playerId
        };
        this.gameState.minions.push(minion);
        this.addVisualEffect(offsetX, groundY, 'summon', '👻');
      }

      this.addCombatLog(`暈眩結束了！`, playerId, 'status');

    } else if (skillCode === SKILL_CODES.CHAIN_OF_PAIN) {
      // --- Ultimate: Chain of Pain ---
      const skill = player.skills.ultimate;
      const distance = Math.abs(player.position.x - opponent.position.x);

      // Range check: must be within 200px
      if (distance > skill.range) {
        // Fail ??do NOT consume cooldown
        this.cooldowns[playerId].ultimate = 0;
        this.addCombatLog(`暈眩結束了！`, playerId, 'status');
        return;
      }

      // Deal direct damage
      this.dealDamage(opponent, skill.damage, playerId);
      this.addDamageNumber(opponent.position.x, opponent.position.y - 20, skill.damage, 'skill');

      // Root BOTH players
      player.effects.rooted = now + skill.rootDuration;
      player.effects.chainCasting = now + skill.rootDuration;
      opponent.effects.rooted = now + skill.rootDuration;
      opponent.effects.chainDisabled = now + skill.rootDuration;
      this.endDefend(opponentId);

      // ?? ??憭扳?5蝘撠???銵-50%
      const healRedDuration = skill.healReductionDuration || 5000;
      const healRedPercent = skill.healReductionPercent || 0.5;
      opponent.effects.healReduction = now + healRedDuration;
      opponent.effects.healReductionPercent = healRedPercent;

      // Store chain state for rendering
      this.gameState.chainOfPain = {
        scorpion: player,
        enemy: opponent,
        startTime: now,
        endTime: now + skill.rootDuration
      };

      this.addCombatLog(`痛苦枷鎖！雙方定身${skill.rootDuration / 1000}秒；施術中的蠍子無法普攻。`, playerId, 'damage');
      this.addVisualEffect(opponent.position.x, opponent.position.y, 'chain', '⛓️');
      this.triggerCameraShake(8, 400);
    }
  }

  renderWarlockExecution(ctx, elapsed, winner, loser) {
    // ?嚗楛蝝撓暺?
    const bgAlpha = Math.min(0.95, elapsed / 400);
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, `rgba(40, 0, 0, ${bgAlpha})`);
    gradient.addColorStop(0.5, `rgba(80, 0, 0, ${bgAlpha})`);
    gradient.addColorStop(1, `rgba(20, 0, 0, ${bgAlpha})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    const cx = this.canvasWidth / 2;
    const cy = this.canvasHeight * 0.55;
    const loserX = cx + 100;
    const loserY = cy;
    const winnerX = cx - 100;
    const winnerY = cy;
    
    // Phase 1 (0-500ms): ??
    if (elapsed > 0) {
      ctx.save();
      ctx.font = 'bold 28px "Noto Sans TC", Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(183, 28, 28, ${Math.min(1, elapsed / 500)})`;
      ctx.fillText(winner.name, winnerX, winnerY - 60);
      ctx.restore();
    }
    
    // Phase 2 (500-2000ms): 蝎?蝺??
    if (elapsed > 500) {
      const tetherProg = Math.min(1, (elapsed - 500) / 1500);
      const lineAlpha = 0.6 + Math.sin(elapsed * 0.008) * 0.2;
      const targetX = winnerX + (loserX - winnerX) * tetherProg;
      
      ctx.save();
      // Outer glow
      ctx.globalAlpha = lineAlpha * 0.5;
      ctx.strokeStyle = '#4A0000';
      ctx.lineWidth = 12;
      ctx.shadowColor = '#B71C1C';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(winnerX, winnerY - 20);
      ctx.lineTo(targetX, loserY - 20);
      ctx.stroke();
      // Inner
      ctx.globalAlpha = lineAlpha;
      ctx.strokeStyle = '#FF1744';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(winnerX, winnerY - 20);
      ctx.lineTo(targetX, loserY - 20);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    }
    
    // Phase 3 (2000-6000ms): ??葬撠?
    if (elapsed > 2000) {
      const shrinkProg = Math.min(1, (elapsed - 2000) / 4000);
      const scale = 1 - shrinkProg * 0.6;
      const grey = Math.floor(shrinkProg * 180);
      
      ctx.save();
      ctx.translate(loserX, loserY);
      ctx.scale(scale, scale);
      ctx.translate(-loserX, -loserY);
      ctx.fillStyle = `rgb(${grey}, ${grey}, ${grey})`;
      ctx.font = 'bold 24px "Noto Sans TC", Arial';
      ctx.textAlign = 'center';
      ctx.fillText(loser.name, loserX, loserY - 50);
      
      // Loser figure (shrinking stick figure)
      ctx.strokeStyle = `rgb(${150 - grey}, ${50}, ${50})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(loserX, loserY - 35, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(loserX, loserY - 23);
      ctx.lineTo(loserX, loserY + 5);
      ctx.stroke();
      ctx.restore();
    }
    
    // Phase 4 (6000-9000ms): ??嗉???曉之+?澆?
    if (elapsed > 6000) {
      const absorbProg = Math.min(1, (elapsed - 6000) / 3000);
      const winScale = 1 + absorbProg * 0.3;
      const glowIntensity = absorbProg * 25;
      
      ctx.save();
      ctx.translate(winnerX, winnerY);
      ctx.scale(winScale, winScale);
      ctx.translate(-winnerX, -winnerY);
      
      // Aura glow
      const auraGrad = ctx.createRadialGradient(winnerX, winnerY - 20, 10, winnerX, winnerY - 20, 50 + glowIntensity);
      auraGrad.addColorStop(0, `rgba(255, 23, 68, ${0.4 * absorbProg})`);
      auraGrad.addColorStop(1, 'rgba(183, 28, 28, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(winnerX, winnerY - 20, 50 + glowIntensity, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
    
    // Phase 5 (9000-10000ms): ?⊥ + 憛萄?
    if (elapsed > 9000) {
      const dustProg = Math.min(1, (elapsed - 9000) / 1000);
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i + elapsed * 0.001;
        const dist = 30 + dustProg * 40;
        const dx = winnerX + Math.cos(angle) * dist;
        const dy = winnerY - 20 + Math.sin(angle) * dist;
        ctx.save();
        ctx.globalAlpha = 0.6 * (1 - dustProg);
        ctx.fillStyle = '#4A0000';
        ctx.beginPath();
        ctx.arc(dx, dy, 3 + dustProg * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    
    // Phase 6 (10000ms+): ?啗?
    if (elapsed > 10000) {
      const textAlpha = Math.min(1, (elapsed - 10000) / 600);
      ctx.save();
      ctx.font = 'bold 44px "Noto Sans TC", Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#FF1744';
      ctx.shadowBlur = 20;
      ctx.fillStyle = `rgba(255, 23, 68, ${textAlpha})`;
      ctx.fillText('血契收割完成！', cx, cy - 80);
      ctx.restore();
    }
  }

  // ?弩 銵憟????拍??
  renderWarlockVictory(ctx, elapsed, winner) {
    // 銵蝝?
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, 'rgba(40, 0, 0, 0.95)');
    gradient.addColorStop(0.5, 'rgba(80, 0, 0, 0.9)');
    gradient.addColorStop(1, 'rgba(20, 0, 0, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    const cx = this.canvasWidth / 2;
    const cy = this.canvasHeight / 2;
    
    // 銵?脰?????
    const pulseSize = 80 + Math.sin(elapsed * 0.003) * 20;
    const auraGrad = ctx.createRadialGradient(cx, cy - 30, 10, cx, cy - 30, pulseSize);
    auraGrad.addColorStop(0, 'rgba(255, 23, 68, 0.4)');
    auraGrad.addColorStop(0.5, 'rgba(183, 28, 28, 0.2)');
    auraGrad.addColorStop(1, 'rgba(74, 0, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - 30, pulseSize, 0, Math.PI * 2);
    ctx.fill();
    
    // 銵皛湧??賜?摮?
    for (let i = 0; i < 6; i++) {
      const dropY = ((elapsed * 0.05 + i * 80) % this.canvasHeight);
      const dropX = cx - 150 + (i * 60) + Math.sin(elapsed * 0.002 + i) * 20;
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = i % 2 === 0 ? '#B71C1C' : '#E53935';
      ctx.beginPath();
      ctx.arc(dropX, dropY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    // 閫?迂
    if (elapsed > 500) {
      const nameAlpha = Math.min(1, (elapsed - 500) / 500);
      ctx.save();
      ctx.font = 'bold 54px "Noto Sans TC", Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#FF1744';
      ctx.shadowBlur = 20;
      ctx.fillStyle = `rgba(255, 23, 68, ${nameAlpha})`;
      ctx.fillText(winner.name, cx, cy - 40);
      ctx.restore();
    }
    
    // 蝔梯?
    if (elapsed > 1200) {
      const titleAlpha = Math.min(1, (elapsed - 1200) / 500);
      ctx.save();
      ctx.font = 'bold 28px "Noto Sans TC", Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(229, 57, 53, ${titleAlpha})`;
      ctx.fillText('血契忍者勝利！', cx, cy + 10);
      
      ctx.font = 'bold 30px "Noto Sans TC", Arial';
      ctx.fillStyle = `rgba(183, 28, 28, ${titleAlpha})`;
      ctx.fillText('VICTORY', cx, cy + 55);
      ctx.restore();
    }
  }

  // ??瘚芯犖?恥??恍
  renderRoninVictory(ctx, elapsed, winner) {
    // Ink-wash monochrome background
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, 'rgba(20, 20, 30, 0.95)');
    gradient.addColorStop(0.5, 'rgba(40, 44, 52, 0.9)');
    gradient.addColorStop(1, 'rgba(15, 15, 20, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    const cx = this.canvasWidth / 2;
    const cy = this.canvasHeight / 2;

    // Silver blade glint aura
    const glintSize = 70 + Math.sin(elapsed * 0.004) * 15;
    const auraGrad = ctx.createRadialGradient(cx, cy - 30, 10, cx, cy - 30, glintSize);
    auraGrad.addColorStop(0, 'rgba(207, 216, 220, 0.3)');
    auraGrad.addColorStop(0.5, 'rgba(120, 144, 156, 0.15)');
    auraGrad.addColorStop(1, 'rgba(55, 71, 79, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(cx, cy - 30, glintSize, 0, Math.PI * 2);
    ctx.fill();

    // Floating embers/dust
    for (let i = 0; i < 5; i++) {
      const dustY = this.canvasHeight - ((elapsed * 0.03 + i * 90) % this.canvasHeight);
      const dustX = cx - 120 + (i * 55) + Math.sin(elapsed * 0.0015 + i) * 25;
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = i % 2 === 0 ? '#90A4AE' : '#CFD8DC';
      ctx.beginPath();
      ctx.arc(dustX, dustY, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Character name
    if (elapsed > 500) {
      const nameAlpha = Math.min(1, (elapsed - 500) / 500);
      ctx.save();
      ctx.font = 'bold 54px "Noto Sans TC", Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#CFD8DC';
      ctx.shadowBlur = 20;
      ctx.fillStyle = `rgba(207, 216, 220, ${nameAlpha})`;
      ctx.fillText(winner.name, cx, cy - 40);
      ctx.restore();
    }

    // Title
    if (elapsed > 1200) {
      const titleAlpha = Math.min(1, (elapsed - 1200) / 500);
      ctx.save();
      ctx.font = 'bold 28px "Noto Sans TC", Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(120, 144, 156, ${titleAlpha})`;
      ctx.fillText('浪人劍客勝利！', cx, cy + 10);

      ctx.font = 'bold 30px "Noto Sans TC", Arial';
      ctx.fillStyle = `rgba(176, 190, 197, ${titleAlpha})`;
      ctx.fillText('VICTORY', cx, cy + 55);
      ctx.restore();
    }
  }

  // 暺??捱?
  renderDefaultExecution(ctx, elapsed, winner, loser) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    ctx.save();
    ctx.font = 'bold 60px "Noto Sans TC", Arial';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH HIM!', this.canvasWidth / 2, this.canvasHeight / 2);
    ctx.restore();
  }

  // 嚙踢???啣?嚗葡?暻??拍??
  renderVictoryScreen(winner) {
    const ctx = this.ctx;
    const elapsed = Date.now() - this.gameState.victoryAnimation.victoryStartTime;
    
    // ?寞?銝?閫皜脫?摰銝????拍??
    switch(winner.id) {
      case 'fujin':
        this.renderWindVictory(ctx, elapsed, winner);
        break;
      case 'katon':
        this.renderFireVictory(ctx, elapsed, winner);
        break;
      case 'suijin':
        this.renderWaterVictory(ctx, elapsed, winner);
        break;
      case 'raijin':
        this.renderThunderVictory(ctx, elapsed, winner);
        break;
      case 'doton':
        this.renderEarthVictory(ctx, elapsed, winner);
        break;
      case 'kage':
        this.renderShadowVictory(ctx, elapsed, winner);
        break;
      case 'rei':
        this.renderSpiritVictory(ctx, elapsed, winner);
        break;
      case 'dokusei':
        this.renderPoisonVictory(ctx, elapsed, winner);
        break;
      case 'taijutsu':
        this.renderTaijutsuVictory(ctx, elapsed, winner);
        break;
      case 'ranger':
        this.renderRangerVictory(ctx, elapsed, winner);
        break;
      case 'warlock':
        this.renderWarlockVictory(ctx, elapsed, winner);
        break;
      case 'ronin':
        this.renderRoninVictory(ctx, elapsed, winner);
        break;
      default:
        this.renderDefaultVictory(ctx, elapsed, winner);
    }
    
    // ?摨???內
    if (elapsed > 2000) {
      const blinkAlpha = Math.abs(Math.sin(elapsed * 0.003)) * 0.5 + 0.5;
      const cx = this.canvasWidth / 2;
      const btnY = this.canvasHeight - 60;

      ctx.save();

      // ???圈閫???
      const btnW = 200, btnH = 44;
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 12;
      ctx.fillStyle = 'rgba(20,20,40,0.85)';
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx - btnW - 20, btnY - btnH / 2, btnW, btnH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.globalAlpha = blinkAlpha;
      ctx.font = 'bold 20px "Noto Sans TC", Arial';
      ctx.fillStyle = '#FFD700';
      ctx.textAlign = 'center';
      ctx.fillText('再次對戰', cx - 20 - btnW / 2, btnY + 7);

      // ???唬??氬???
      ctx.globalAlpha = 1;
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 12;
      ctx.fillStyle = 'rgba(20,20,40,0.85)';
      ctx.strokeStyle = '#AAAAAA';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(cx + 20, btnY - btnH / 2, btnW, btnH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.globalAlpha = blinkAlpha;
      ctx.fillStyle = '#CCCCCC';
      ctx.fillText('返回選角', cx + 20 + btnW / 2, btnY + 7);

      ctx.restore();

      // ?脣???雿蔭靘??皜砌蝙??
      this._victoryBtnLeft  = { x: cx - btnW - 20, y: btnY - btnH / 2, w: btnW, h: btnH };
      this._victoryBtnRight = { x: cx + 20,         y: btnY - btnH / 2, w: btnW, h: btnH };
    }
  }

  // ?儭?憸典蔣敹??拍??- 樴憸冽???
  renderWindVictory(ctx, elapsed, winner) {
    // ?嚗?頧?憸冽
    const bgAlpha = Math.min(0.9, elapsed / 600);
    ctx.fillStyle = `rgba(15, 30, 60, ${bgAlpha})`;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // 樴憸刻??摮?
    if (elapsed > 200) {
      for (let i = 0; i < 30; i++) {
        const angle = (elapsed * 0.003 + i * 0.2) % (Math.PI * 2);
        const radius = 100 + i * 15;
        const height = this.canvasHeight / 2 - i * 8;
        const x = this.canvasWidth / 2 + Math.cos(angle) * radius;
        const y = height + Math.sin(elapsed * 0.005 + i) * 20;
        
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = i % 2 === 0 ? '#87CEEB' : '#E0FFFF';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    
    // 銝餉???- ?豢筑?券◢?港葉
    if (elapsed > 400) {
      const floatY = Math.sin(elapsed * 0.002) * 15;
      ctx.save();
      ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2 - 50 + floatY);
      ctx.scale(4, 4);
      if (typeof stickmanAnimator !== 'undefined') {
        const victoryFrame = {
          head: { x: 0, y: 0, rotation: 0 },
          body: { rotation: 0 },
          leftArm: { upperRotation: -70, lowerRotation: -60 },
          rightArm: { upperRotation: 70, lowerRotation: 60 },
          leftLeg: { upperRotation: 10, lowerRotation: -10 },
          rightLeg: { upperRotation: -10, lowerRotation: 10 }
        };
        stickmanAnimator.drawStickman(ctx, 0, 0, victoryFrame, winner.id, 1, 1);
      }
      ctx.restore();
      
      // 閫?典??◢??
      for (let i = 0; i < 3; i++) {
        const ringAngle = elapsed * 0.004 + i * Math.PI * 2 / 3;
        const ringRadius = 80 + Math.sin(elapsed * 0.005) * 10;
        ctx.strokeStyle = `rgba(135, 206, 235, ${0.6 - i * 0.2})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.canvasWidth / 2, this.canvasHeight / 2 - 50 + floatY, ringRadius, ringAngle, ringAngle + Math.PI);
        ctx.stroke();
      }
    }
    
    // 璅? - 敺??Ｗ?孵靘?
    if (elapsed > 800) {
      const textProgress = Math.min(1, (elapsed - 800) / 500);
      const slideDistance = 300 * (1 - textProgress);
      
      ctx.save();
      ctx.font = 'bold 80px "Noto Sans TC", Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#87CEEB';
      ctx.shadowBlur = 30;
      
      // "憸? 敺椰憌?
      ctx.fillStyle = '#E0FFFF';
      ctx.fillText('疾', this.canvasWidth / 2 - slideDistance, 100);
      
      // "蟡? 敺憌?
      ctx.fillText('風', this.canvasWidth / 2 + slideDistance, 100);
      
      // "?? 敺?憌?
      ctx.fillText('閃', this.canvasWidth / 2, 180 - slideDistance);
      
      // "?? 敺?憌?
      ctx.fillText('躍', this.canvasWidth / 2, 180 + slideDistance);
      
      ctx.restore();
    }
    
    // ?摰??
    if (elapsed > 1500) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, (elapsed - 1500) / 500);
      ctx.font = 'bold 32px "Noto Sans TC", Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#87CEEB';
      ctx.shadowBlur = 15;
      ctx.fillText('風影忍者，風之化身！', this.canvasWidth / 2, this.canvasHeight - 150);
      ctx.restore();
    }
  }

  // ? ?怎敹??拍??- ?????
  renderFireVictory(ctx, elapsed, winner) {
    // ?嚗???瞍貉?
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, '#1a0000');
    gradient.addColorStop(0.5, '#4a0000');
    gradient.addColorStop(1, '#8B0000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // ?怎敺??函???
    if (elapsed > 100) {
      for (let i = 0; i < 50; i++) {
        const x = (i * 30 + elapsed * 0.1) % this.canvasWidth;
        const baseY = this.canvasHeight;
        const height = 100 + Math.sin(elapsed * 0.005 + i) * 50;
        const flameHeight = Math.min(height, (elapsed - 100) / 10);
        
        const flameGradient = ctx.createLinearGradient(x, baseY, x, baseY - flameHeight);
        flameGradient.addColorStop(0, '#FF4500');
        flameGradient.addColorStop(0.5, '#FFA500');
        flameGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        ctx.fillStyle = flameGradient;
        ctx.beginPath();
        ctx.moveTo(x - 15, baseY);
        ctx.quadraticCurveTo(x, baseY - flameHeight, x + 15, baseY);
        ctx.fill();
      }
    }
    
    // ?怎蝎??
    if (elapsed > 300) {
      for (let i = 0; i < 50; i++) {
        const angle = (i / 50) * Math.PI * 2;
        const radius = (elapsed - 300) * 0.3 + i * 4;
        const x = this.canvasWidth / 2 + Math.cos(angle) * radius;
        const y = this.canvasHeight / 2 + Math.sin(angle) * radius;
        
        ctx.fillStyle = i % 3 === 0 ? '#FF4500' : i % 3 === 1 ? '#FFA500' : '#FFD700';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // 閫 - 蝡?怎銝?
    if (elapsed > 600) {
      ctx.save();
      ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2 + 50);
      ctx.scale(4, 4);
      
      // 閫????啣???
      const pulseSize = 100 + Math.sin(elapsed * 0.005) * 20;
      const auraGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize);
      auraGradient.addColorStop(0, 'rgba(255, 69, 0, 0.8)');
      auraGradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.4)');
      auraGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
      ctx.fill();
      
      if (typeof stickmanAnimator !== 'undefined') {
        const victoryFrame = {
          head: { x: 0, y: 0, rotation: -10 },
          body: { rotation: 0 },
          leftArm: { upperRotation: 45, lowerRotation: 30 },
          rightArm: { upperRotation: -45, lowerRotation: -30 },
          leftLeg: { upperRotation: 15, lowerRotation: -15 },
          rightLeg: { upperRotation: -15, lowerRotation: 15 }
        };
        stickmanAnimator.drawStickman(ctx, 0, 0, victoryFrame, winner.id, 1, 1);
      }
      ctx.restore();
    }
    
    // 璅? - ????
    if (elapsed > 900) {
      const chars = ['??', '??', '??', '憭?'];
      chars.forEach((char, i) => {
        const charElapsed = elapsed - 900 - i * 100;
        if (charElapsed > 0) {
          const scale = Math.min(1, charElapsed / 300);
          const wobble = Math.sin(elapsed * 0.01 + i) * 5;
          
          ctx.save();
          ctx.translate(this.canvasWidth / 2 - 150 + i * 100, 120 + wobble);
          ctx.scale(scale, scale);
          ctx.font = 'bold 70px "Noto Sans TC", Arial';
          ctx.textAlign = 'center';
          
          // 憭??
          ctx.shadowColor = '#FF4500';
          ctx.shadowBlur = 40;
          ctx.fillStyle = '#FFD700';
          ctx.fillText(char, 0, 0);
          
          // ?抒??
          ctx.shadowBlur = 20;
          ctx.fillStyle = '#FFF';
          ctx.fillText(char, 0, 0);
          
          ctx.restore();
        }
      });
    }
    
    // ?摰??
    if (elapsed > 1600) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, (elapsed - 1600) / 500);
      ctx.font = 'bold 32px "Noto Sans TC", Arial';
      ctx.fillStyle = '#FFD700';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#FF4500';
      ctx.shadowBlur = 20;
      ctx.fillText('火焰忍者，烈焰永燃！', this.canvasWidth / 2, this.canvasHeight - 150);
      ctx.restore();
    }
  }

  // ?? 瘞游蔣敹??拍??- 瘞游???
  renderWaterVictory(ctx, elapsed, winner) {
    // ?嚗楛瘚瑟撓霈?
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, '#001a33');
    gradient.addColorStop(0.5, '#003d5c');
    gradient.addColorStop(1, '#006080');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // 瘞湔郭蝝??
    if (elapsed > 200) {
      for (let i = 0; i < 5; i++) {
        const radius = ((elapsed - 200) * 0.5 + i * 80) % 500;
        const alpha = 1 - (radius / 500);
        
        ctx.strokeStyle = `rgba(100, 181, 246, ${alpha * 0.6})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#42A5F5';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.canvasWidth / 2, this.canvasHeight / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    
    // 瘞湔輕敺??賭?
    if (elapsed > 400) {
      for (let i = 0; i < 30; i++) {
        const x = (i * 40 + Math.sin(elapsed * 0.002 + i) * 20) % this.canvasWidth;
        const fallSpeed = 2 + i % 3;
        const y = ((elapsed - 400) * fallSpeed / 10 + i * 30) % this.canvasHeight;
        
        ctx.fillStyle = 'rgba(135, 206, 250, 0.8)';
        ctx.beginPath();
        ctx.ellipse(x, y, 4, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 瘞渲??
        if (y > this.canvasHeight - 100) {
          for (let j = 0; j < 3; j++) {
            const splashX = x + (j - 1) * 10;
            const splashY = this.canvasHeight - 100 + Math.sin(elapsed * 0.01 + j) * 5;
            ctx.fillStyle = `rgba(100, 181, 246, ${0.5})`;
            ctx.beginPath();
            ctx.arc(splashX, splashY, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
    
    // 閫 - 瘞港?蟡?憪踵?
    if (elapsed > 700) {
      ctx.save();
      const floatY = Math.sin(elapsed * 0.003) * 10;
      ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2 + floatY);
      ctx.scale(4, 4);
      
      // 瘞渡??啁?
      for (let i = 0; i < 8; i++) {
        const angle = (elapsed * 0.003 + i * Math.PI / 4) % (Math.PI * 2);
        const orbitRadius = 60;
        const orbX = Math.cos(angle) * orbitRadius;
        const orbY = Math.sin(angle) * orbitRadius;
        
        ctx.fillStyle = 'rgba(100, 181, 246, 0.7)';
        ctx.beginPath();
        ctx.arc(orbX, orbY, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      
      if (typeof stickmanAnimator !== 'undefined') {
        const victoryFrame = {
          head: { x: 0, y: 0, rotation: 0 },
          body: { rotation: 0 },
          leftArm: { upperRotation: -30, lowerRotation: -20 },
          rightArm: { upperRotation: -30, lowerRotation: -20 },
          leftLeg: { upperRotation: 0, lowerRotation: 0 },
          rightLeg: { upperRotation: 0, lowerRotation: 0 }
        };
        stickmanAnimator.drawStickman(ctx, 0, 0, victoryFrame, winner.id, 1, 1);
      }
      ctx.restore();
    }
    
    // 璅? - 瘞游◢??
    if (elapsed > 1000) {
      const textAlpha = Math.min(1, (elapsed - 1000) / 600);
      ctx.save();
      ctx.globalAlpha = textAlpha;
      ctx.font = 'bold 90px "Noto Sans TC", Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#42A5F5';
      ctx.shadowBlur = 30;
      
      const gradient = ctx.createLinearGradient(0, 80, 0, 140);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(0.5, '#42A5F5');
      gradient.addColorStop(1, '#1E90FF');
      ctx.fillStyle = gradient;
      
      ctx.fillText('水龍騰越！', this.canvasWidth / 2, 130);
      ctx.restore();
    }
    
    // ?摰??
    if (elapsed > 1700) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, (elapsed - 1700) / 500);
      ctx.font = 'bold 32px "Noto Sans TC", Arial';
      ctx.fillStyle = '#E0FFFF';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#42A5F5';
      ctx.shadowBlur = 15;
      ctx.fillText('水影忍者，流水無形！', this.canvasWidth / 2, this.canvasHeight - 150);
      ctx.restore();
    }
  }

  // ???瑟?敹??拍??- ?憸冽
  renderThunderVictory(ctx, elapsed, winner) {
    // ?嚗?典予
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#2a2a3e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // ???
    if (elapsed > 200 && Math.random() > 0.7) {
      const lightningX = Math.random() * this.canvasWidth;
      ctx.strokeStyle = '#FFFF00';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#FFFF00';
      ctx.shadowBlur = 20;
      
      ctx.beginPath();
      ctx.moveTo(lightningX, 0);
      let currentX = lightningX;
      let currentY = 0;
      while (currentY < this.canvasHeight) {
        currentY += 40 + Math.random() * 40;
        currentX += (Math.random() - 0.5) * 60;
        ctx.lineTo(currentX, currentY);
      }
      ctx.stroke();
    }
    
    // ?餅?蝎?
    if (elapsed > 300) {
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * this.canvasWidth;
        const y = Math.random() * this.canvasHeight;
        const size = 2 + Math.random() * 4;
        
        ctx.fillStyle = i % 2 === 0 ? '#FFFF00' : '#FFD700';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // 閫 - ?典???敺??
    if (elapsed > 600) {
      // ????
      if (elapsed > 600 && elapsed < 750) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 - (elapsed - 600) / 150})`;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      }
      
      if (elapsed > 750) {
        ctx.save();
        ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
        ctx.scale(4.5, 4.5);
        
        // ?餅??啁?
        for (let i = 0; i < 12; i++) {
          const angle = (elapsed * 0.01 + i * Math.PI / 6) % (Math.PI * 2);
          const radius = 50 + Math.sin(elapsed * 0.005 + i) * 10;
          const startAngle = angle;
          const endAngle = angle + Math.PI / 12;
          
          ctx.strokeStyle = `rgba(255, 255, 0, ${0.8})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, radius, startAngle, endAngle);
          ctx.stroke();
        }
        
        if (typeof stickmanAnimator !== 'undefined') {
          const victoryFrame = {
            head: { x: 0, y: 0, rotation: 0 },
            body: { rotation: 0 },
            leftArm: { upperRotation: 90, lowerRotation: 60 },
            rightArm: { upperRotation: 90, lowerRotation: 60 },
            leftLeg: { upperRotation: 10, lowerRotation: -10 },
            rightLeg: { upperRotation: -10, lowerRotation: 10 }
          };
          stickmanAnimator.drawStickman(ctx, 0, 0, victoryFrame, winner.id, 1, 1);
        }
        ctx.restore();
      }
    }
    
    // 璅? - ?餃???
    if (elapsed > 1100) {
      ctx.save();
      ctx.font = 'bold 100px "Noto Sans TC", Arial';
      ctx.textAlign = 'center';
      
      const textGradient = ctx.createLinearGradient(0, 80, 0, 150);
      textGradient.addColorStop(0, '#FFFF00');
      textGradient.addColorStop(0.5, '#FFD700');
      textGradient.addColorStop(1, '#FFA500');
      
      ctx.fillStyle = textGradient;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#FFFF00';
      ctx.shadowBlur = 40;
      
      // ?餅???
      const jitter = Math.sin(elapsed * 0.05) * 3;
      ctx.strokeText('雷霆萬鈞！', this.canvasWidth / 2 + jitter, 130);
      ctx.fillText('雷霆萬鈞！', this.canvasWidth / 2, 130);
      
      ctx.restore();
    }
    
    // ?摰??
    if (elapsed > 1800) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, (elapsed - 1800) / 500);
      ctx.font = 'bold 32px "Noto Sans TC", Arial';
      ctx.fillStyle = '#FFFF00';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 20;
      ctx.fillText('雷擊忍者，迅雷不及掩耳！', this.canvasWidth / 2, this.canvasHeight - 150);
      ctx.restore();
    }
  }

  // ? 撗拍敹??拍??- 憭批??
  renderEarthVictory(ctx, elapsed, winner) {
    // ?嚗??唳撓霈?
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, '#2a1810');
    gradient.addColorStop(0.5, '#3a2820');
    gradient.addColorStop(1, '#5a4030');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // ?圈?????
    if (elapsed > 200) {
      const shakeIntensity = Math.max(0, 10 - (elapsed - 200) / 100);
      ctx.save();
      ctx.translate(
        (Math.random() - 0.5) * shakeIntensity,
        (Math.random() - 0.5) * shakeIntensity
      );
    }
    
    // ?啗?蝝楝
    if (elapsed > 400) {
      ctx.strokeStyle = '#3a2820';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 5;
      
      for (let i = 0; i < 10; i++) {
        const startX = i * 120 + (elapsed * 0.05) % 120;
        ctx.beginPath();
        ctx.moveTo(startX, this.canvasHeight - 50);
        
        let currentX = startX;
        let currentY = this.canvasHeight - 50;
        for (let j = 0; j < 5; j++) {
          currentX += (Math.random() - 0.5) * 30;
          currentY -= 30;
          ctx.lineTo(currentX, currentY);
        }
        ctx.stroke();
      }
    }
    
    // 憌絲?痔??
    if (elapsed > 600) {
      for (let i = 0; i < 15; i++) {
        const rockTime = (elapsed - 600 - i * 50) / 1000;
        if (rockTime > 0) {
          const x = 100 + i * 80;
          const y = this.canvasHeight - 100 - rockTime * 200 + rockTime * rockTime * 500;
          const rotation = rockTime * 5;
          const size = 15 + i % 5 * 5;
          
          if (y < this.canvasHeight) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.fillStyle = '#8B4513';
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 10;
            
            ctx.beginPath();
            ctx.moveTo(-size, 0);
            ctx.lineTo(0, -size);
            ctx.lineTo(size, 0);
            ctx.lineTo(0, size);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }
    
    // 閫 - 撗拍撌其犖憪踵?
    if (elapsed > 900) {
      ctx.save();
      ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2 + 80);
      ctx.scale(5, 5);
      
      // 撗拍?
      const pulseSize = 80 + Math.sin(elapsed * 0.003) * 15;
      ctx.strokeStyle = 'rgba(139, 69, 19, 0.6)';
      ctx.lineWidth = 8;
      ctx.shadowColor = '#8B4513';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
      ctx.stroke();
      
      if (typeof stickmanAnimator !== 'undefined') {
        const victoryFrame = {
          head: { x: 0, y: 0, rotation: 0 },
          body: { rotation: 0 },
          leftArm: { upperRotation: -110, lowerRotation: -90 },
          rightArm: { upperRotation: 110, lowerRotation: 90 },
          leftLeg: { upperRotation: 40, lowerRotation: -40 },
          rightLeg: { upperRotation: -40, lowerRotation: 40 }
        };
        stickmanAnimator.drawStickman(ctx, 0, 0, victoryFrame, winner.id, 1, 1);
      }
      ctx.restore();
    }
    
    if (elapsed > 200) {
      ctx.restore();
    }
    
    // 璅? - 撗拍??
    if (elapsed > 1200) {
      ctx.save();
      ctx.font = 'bold 95px "Noto Sans TC", Arial';
      ctx.textAlign = 'center';
      
      const textGradient = ctx.createLinearGradient(0, 80, 0, 150);
      textGradient.addColorStop(0, '#D2691E');
      textGradient.addColorStop(0.5, '#8B4513');
      textGradient.addColorStop(1, '#654321');
      
      ctx.fillStyle = textGradient;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.shadowColor = '#8B4513';
      ctx.shadowBlur = 25;
      
      ctx.strokeText('山嶽崩裂！', this.canvasWidth / 2, 130);
      ctx.fillText('山嶽崩裂！', this.canvasWidth / 2, 130);
      
      ctx.restore();
    }
    
    // ?摰??
    if (elapsed > 1900) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, (elapsed - 1900) / 500);
      ctx.font = 'bold 32px "Noto Sans TC", Arial';
      ctx.fillStyle = '#CD853F';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#8B4513';
      ctx.shadowBlur = 15;
      ctx.fillText('岩甲忍者，屹立不搖！', this.canvasWidth / 2, this.canvasHeight - 150);
      ctx.restore();
    }
  }

  // ?? ?蔣敹??拍??- ???
  renderShadowVictory(ctx, elapsed, winner) {
    // ?嚗?暺撓憿?
    const bgAlpha = Math.min(1, elapsed / 800);
    ctx.fillStyle = `rgba(0, 0, 0, ${bgAlpha})`;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // 蝝怨鋆葦
    if (elapsed > 400) {
      ctx.strokeStyle = '#8A2BE2';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#8A2BE2';
      ctx.shadowBlur = 20;
      
      for (let i = 0; i < 8; i++) {
        const crackProgress = Math.min(1, (elapsed - 400 - i * 100) / 800);
        if (crackProgress > 0) {
          const startX = this.canvasWidth / 2;
          const startY = this.canvasHeight / 2;
          const angle = (i / 8) * Math.PI * 2;
          const length = 200 * crackProgress;
          
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          
          let currentX = startX;
          let currentY = startY;
          for (let j = 0; j < 5; j++) {
            currentX += Math.cos(angle + (Math.random() - 0.5) * 0.5) * (length / 5);
            currentY += Math.sin(angle + (Math.random() - 0.5) * 0.5) * (length / 5);
            ctx.lineTo(currentX, currentY);
          }
          ctx.stroke();
        }
      }
    }
    
    // ?蔣瞍拇蒂
    if (elapsed > 700) {
      for (let i = 0; i < 20; i++) {
        const angle = (elapsed * 0.005 + i * 0.3) % (Math.PI * 2);
        const radius = 150 - i * 7;
        const x = this.canvasWidth / 2 + Math.cos(angle) * radius;
        const y = this.canvasHeight / 2 + Math.sin(angle) * radius;
        
        ctx.fillStyle = `rgba(138, 43, 226, ${0.3 + i * 0.03})`;
        ctx.shadowColor = '#8A2BE2';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // 閫 - 敺?敶曹葉憿舐
    if (elapsed > 1000) {
      const appearAlpha = Math.min(1, (elapsed - 1000) / 500);
      
      ctx.save();
      ctx.globalAlpha = appearAlpha;
      ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2);
      ctx.scale(4, 4);
      
      // ?蔣瘞?
      for (let i = 0; i < 3; i++) {
        const auraSize = 60 + i * 20 + Math.sin(elapsed * 0.005 + i) * 10;
        ctx.strokeStyle = `rgba(138, 43, 226, ${0.4 - i * 0.1})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#8A2BE2';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      if (typeof stickmanAnimator !== 'undefined') {
        const victoryFrame = {
          head: { x: 0, y: 0, rotation: 10 },
          body: { rotation: 0 },
          leftArm: { upperRotation: -70, lowerRotation: -30 },
          rightArm: { upperRotation: 30, lowerRotation: 20 },
          leftLeg: { upperRotation: 15, lowerRotation: -15 },
          rightLeg: { upperRotation: -15, lowerRotation: 15 }
        };
        stickmanAnimator.drawStickman(ctx, 0, 0, victoryFrame, winner.id, 1, 1);
      }
      ctx.restore();
    }
    
    // 璅? - 蝝怨????
    if (elapsed > 1300) {
      const chars = ['??', '敶?', '銝?', '摰?'];
      chars.forEach((char, i) => {
        const charDelay = i * 150;
        if (elapsed > 1300 + charDelay) {
          const charAlpha = Math.min(1, (elapsed - 1300 - charDelay) / 300);
          const glowPulse = Math.sin(elapsed * 0.01 + i) * 0.3 + 0.7;
          
          ctx.save();
          ctx.globalAlpha = charAlpha;
          ctx.translate(this.canvasWidth / 2 - 180 + i * 120, 130);
          ctx.font = 'bold 80px "Noto Sans TC", Arial';
          ctx.textAlign = 'center';
          
          // 憭惜?澆?
          for (let layer = 3; layer > 0; layer--) {
            ctx.shadowColor = '#8A2BE2';
            ctx.shadowBlur = layer * 15 * glowPulse;
            ctx.fillStyle = layer === 1 ? '#E0AAFF' : '#8A2BE2';
            ctx.fillText(char, 0, 0);
          }
          
          ctx.restore();
        }
      });
    }
    
    // ?摰??
    if (elapsed > 2000) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, (elapsed - 2000) / 500);
      ctx.font = 'bold 32px "Noto Sans TC", Arial';
      ctx.fillStyle = '#E0AAFF';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#8A2BE2';
      ctx.shadowBlur = 20;
      ctx.fillText('暗影忍者，無影無蹤！', this.canvasWidth / 2, this.canvasHeight - 150);
      ctx.restore();
    }
  }

  // ? ?????拍??- 蟡?撖拙
  renderSpiritVictory(ctx, elapsed, winner) {
    // ?嚗?????
    const gradient = ctx.createRadialGradient(
      this.canvasWidth / 2, 0, 0,
      this.canvasWidth / 2, this.canvasHeight, this.canvasHeight
    );
    gradient.addColorStop(0, '#FFF8DC');
    gradient.addColorStop(0.5, '#FFD700');
    gradient.addColorStop(1, '#DAA520');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // 憭拚??
    if (elapsed > 200) {
      for (let i = 0; i < 12; i++) {
        const x = (i * 100 + elapsed * 0.05) % this.canvasWidth;
        const lightGradient = ctx.createLinearGradient(x, 0, x, this.canvasHeight);
        lightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        lightGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.4)');
        lightGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        ctx.fillStyle = lightGradient;
        ctx.fillRect(x - 20, 0, 40, this.canvasHeight);
      }
    }
    
    // 蟡?蝚行??啁?
    if (elapsed > 500) {
      const runes = ['??', '??', '??', '??', '??', '??', '??', '??'];
      for (let i = 0; i < runes.length; i++) {
        const angle = (elapsed * 0.002 + i * Math.PI / 4) % (Math.PI * 2);
        const radius = 250 + Math.sin(elapsed * 0.003 + i) * 30;
        const x = this.canvasWidth / 2 + Math.cos(angle) * radius;
        const y = this.canvasHeight / 2 + Math.sin(angle) * radius;
        const rotation = angle + Math.PI / 2;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFD700';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
        ctx.fillText(runes[i], 0, 0);
        ctx.restore();
      }
    }
    
    // ?蝎?銝?
    if (elapsed > 700) {
      for (let i = 0; i < 60; i++) {
        const x = (i * 20 + Math.sin(elapsed * 0.005 + i) * 30) % this.canvasWidth;
        const y = this.canvasHeight - ((elapsed - 700 + i * 30) * 0.3 % this.canvasHeight);
        
        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // 閫 - 蟡?憪踵?
    if (elapsed > 900) {
      ctx.save();
      const floatY = Math.sin(elapsed * 0.003) * 20;
      ctx.translate(this.canvasWidth / 2, this.canvasHeight / 2 - 30 + floatY);
      ctx.scale(4.5, 4.5);
      
      // ???
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const rayLength = 80 + Math.sin(elapsed * 0.005 + i) * 20;
        
        ctx.strokeStyle = `rgba(255, 215, 0, ${0.6})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
        ctx.stroke();
      }
      
      // ??
      const haloGradient = ctx.createRadialGradient(0, -30, 0, 0, -30, 40);
      haloGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      haloGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.6)');
      haloGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = haloGradient;
      ctx.beginPath();
      ctx.arc(0, -30, 40, 0, Math.PI * 2);
      ctx.fill();
      
      if (typeof stickmanAnimator !== 'undefined') {
        const victoryFrame = {
          head: { x: 0, y: 0, rotation: 0 },
          body: { rotation: 0 },
          leftArm: { upperRotation: -45, lowerRotation: -30 },
          rightArm: { upperRotation: 45, lowerRotation: 30 },
          leftLeg: { upperRotation: 0, lowerRotation: 0 },
          rightLeg: { upperRotation: 0, lowerRotation: 0 }
        };
        stickmanAnimator.drawStickman(ctx, 0, 0, victoryFrame, winner.id, 1, 1);
      }
      ctx.restore();
    }
    
    // 璅? - 蟡???
    if (elapsed > 1200) {
      ctx.save();
      ctx.font = 'bold 100px "Noto Sans TC", Arial';
      ctx.textAlign = 'center';
      
      const textGradient = ctx.createLinearGradient(0, 80, 0, 150);
      textGradient.addColorStop(0, '#FFFFFF');
      textGradient.addColorStop(0.5, '#FFD700');
      textGradient.addColorStop(1, '#FFA500');
      
      ctx.fillStyle = textGradient;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 40;
      
      ctx.strokeText('靈光普照！', this.canvasWidth / 2, 140);
      ctx.fillText('靈光普照！', this.canvasWidth / 2, 140);
      
      ctx.restore();
    }
    
    // ?摰??
    if (elapsed > 1900) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, (elapsed - 1900) / 500);
      ctx.font = 'bold 32px "Noto Sans TC", Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#DAA520';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 20;
      ctx.strokeText('靈忍者，天地皆消！', this.canvasWidth / 2, this.canvasHeight - 150);
      ctx.fillText('靈忍者，天地皆消！', this.canvasWidth / 2, this.canvasHeight - 150);
      ctx.restore();
    }
  }

  // ?? 暺???恍嚗??剁?
  renderDefaultVictory(ctx, elapsed, winner) {
    const now = Date.now();
    
    // 1儭 ?瞍貉??桃蔗
    const bgAlpha = Math.min(0.85, elapsed / 500);
    const gradient = ctx.createRadialGradient(
      this.canvasWidth / 2, this.canvasHeight / 2, 0,
      this.canvasWidth / 2, this.canvasHeight / 2, this.canvasWidth / 1.5
    );
    
    const colors = this.getCharacterColors(winner.id);
    gradient.addColorStop(0, `rgba(0, 0, 0, ${bgAlpha})`);
    gradient.addColorStop(0.5, `rgba(0, 0, 0, ${bgAlpha * 0.9})`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${bgAlpha * 0.7})`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // 2儭 ?湔?葡??摮?
    this.updateVictoryParticles();
    
    // 3儭 ????脣之??銝剖亢嚗?
    if (elapsed > 300) {
      const scale = Math.min(1, (elapsed - 300) / 500);
      const charY = this.canvasHeight / 2 - 50;
      
      ctx.save();
      ctx.globalAlpha = scale;
      
      // 蝜芾ˊ?澆??
      const auraGradient = ctx.createRadialGradient(
        this.canvasWidth / 2, charY, 0,
        this.canvasWidth / 2, charY, 150 * scale
      );
      auraGradient.addColorStop(0, `${colors[0]}80`);
      auraGradient.addColorStop(0.5, `${colors[1]}40`);
      auraGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(this.canvasWidth / 2, charY, 150 * scale, 0, Math.PI * 2);
      ctx.fill();
      
      // 蝜芾ˊ閫嚗蝙?典??怎頂蝯梧?
      if (typeof stickmanAnimator !== 'undefined' && stickmanAnimator) {
        ctx.translate(this.canvasWidth / 2, charY);
        ctx.scale(3 * scale, 3 * scale);
        stickmanAnimator.drawStickman(ctx, 0, 0, 
          { head: 0, body: 0, leftArm: -0.5, rightArm: 0.8, leftLeg: 0, rightLeg: 0 },
          winner.id, 1, 1
        );
      }
      
      ctx.restore();
    }
    
    // 4儭 ????
    if (elapsed > 800) {
      const textScale = Math.min(1, (elapsed - 800) / 400);
      const bounce = Math.sin(elapsed * 0.003) * 10;
      
      ctx.save();
      ctx.translate(this.canvasWidth / 2, 120 + bounce);
      ctx.scale(textScale, textScale);
      
      // ????啣蔣
      ctx.shadowColor = colors[0];
      ctx.shadowBlur = 30;
      
      // 銝餅?憿?
      ctx.font = 'bold 72px "Noto Sans TC", Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // 瞍貉???
      const textGradient = ctx.createLinearGradient(0, -40, 0, 40);
      textGradient.addColorStop(0, colors[0]);
      textGradient.addColorStop(0.5, colors[1]);
      textGradient.addColorStop(1, colors[2]);
      
      ctx.fillStyle = textGradient;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      
      ctx.strokeText('VICTORY', 0, 0);
      ctx.fillText('VICTORY', 0, 0);
      
      ctx.restore();
      
      // 閫?迂
      ctx.save();
      ctx.translate(this.canvasWidth / 2, 200);
      
      ctx.font = 'bold 48px "Noto Sans TC", Arial';
      ctx.fillStyle = '#FFD700';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 20;
      
      ctx.strokeText(winner.name, 0, 0);
      ctx.fillText(winner.name, 0, 0);
      
      ctx.restore();
      
      // 蝯??迂
      ctx.save();
      ctx.translate(this.canvasWidth / 2, 250);
      
      ctx.font = 'bold 28px "Noto Sans TC", Arial';
      ctx.fillStyle = colors[1];
      ctx.shadowColor = colors[0];
      ctx.shadowBlur = 15;
      
      ctx.fillText(winner.organization, 0, 0);
      
      ctx.restore();
    }
    
    // 5儭 閫撠惇?摰??
    if (elapsed > 1200) {
      const quoteAlpha = Math.min(1, (elapsed - 1200) / 600);
      const victoryQuotes = this.getVictoryQuote(winner.id);
      
      ctx.save();
      ctx.globalAlpha = quoteAlpha;
      ctx.font = 'bold 24px "Noto Sans TC", Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 10;
      
      ctx.fillText(victoryQuotes, this.canvasWidth / 2, this.canvasHeight - 180);
      
      ctx.restore();
    }
    
    // 6儭 摨鋆ˇ蝺?
    if (elapsed > 1000) {
      ctx.save();
      
      const lineWidth = Math.min(this.canvasWidth * 0.6, (elapsed - 1000) / 1000 * this.canvasWidth * 0.6);
      
      ctx.strokeStyle = colors[0];
      ctx.lineWidth = 3;
      ctx.shadowColor = colors[0];
      ctx.shadowBlur = 15;
      
      ctx.beginPath();
      ctx.moveTo(this.canvasWidth / 2 - lineWidth / 2, this.canvasHeight - 130);
      ctx.lineTo(this.canvasWidth / 2 + lineWidth / 2, this.canvasHeight - 130);
      ctx.stroke();
      
      ctx.restore();
    }
    
    // 7儭 ????內
    if (elapsed > 1500) {
      const blinkAlpha = Math.abs(Math.sin(elapsed * 0.003)) * 0.5 + 0.5;
      
      ctx.save();
      ctx.globalAlpha = blinkAlpha;
      ctx.font = 'bold 28px "Noto Sans TC", Arial';
      ctx.fillStyle = '#FFD700';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 8;
      
      ctx.fillText('按R鍵觀看勝利動畫', this.canvasWidth / 2, this.canvasHeight - 80);
      
      ctx.restore();
    }
    
    // 8儭 鋆ˇ?批?璅?
    if (elapsed > 1000) {
      const iconScale = Math.min(1, (elapsed - 1000) / 400);
      const iconBounce = Math.sin(elapsed * 0.004) * 5;
      
      ctx.save();
      ctx.font = `${64 * iconScale}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // 撌血?
      ctx.fillText('🥷', this.canvasWidth / 2 - 250, 120 + iconBounce);
      // ?喳?
      ctx.fillText('🥷', this.canvasWidth / 2 + 250, 120 + iconBounce);
      
      ctx.restore();
    }
  }

  // ?? 暺???恍嚗??剁?
  renderDefaultVictory(ctx, elapsed, winner) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    ctx.save();
    ctx.font = 'bold 72px "Noto Sans TC", Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 30;
    ctx.fillText(`${winner.name} 勝！`, this.canvasWidth / 2, this.canvasHeight / 2);
    ctx.restore();
  }

  // ? ?啣?嚗???脣?撅砍??拙恐閮
  getVictoryQuote(characterId) {
    const quotes = {
      fujin: '風無邊際，誰能束縛！',
      katon: '烈焰燃盡，灰飛煙滅！',
      suijin: '水之力量，柔能克剛！',
      raijin: '雷光閃電，快如光速！',
      doton: '大地不動，萬物歸一！',
      kage: '暗影無形，無處可逃！',
      rei: '靈光點點，業已裁決！',
    };
    
    return quotes[characterId] || '一決勝負，天下無敵！';
  }

  // ???啣?嚗?啣??拍?摮?
  updateVictoryParticles() {
    const ctx = this.ctx;
    const particles = this.gameState.victoryAnimation.particles;
    
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      
      // ?湔雿蔭
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      
      // ????
      p.vy += 0.1;
      
      // 瘛∪
      p.life -= 0.005;
      
      // 蝘駁甇颱滿蝎?
      if (p.life <= 0 || p.y < -50) {
        particles.splice(i, 1);
        
        // 鋆??啁?摮?
        if (particles.length < 100) {
          particles.push({
            x: Math.random() * this.canvasWidth,
            y: this.canvasHeight + 10,
            vx: (Math.random() - 0.5) * 3,
            vy: -(Math.random() * 5 + 3),
            size: Math.random() * 8 + 3,
            color: this.getCharacterColors(this.players[this.gameState.winner].id)[Math.floor(Math.random() * 4)],
            life: 1,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2
          });
        }
        continue;
      }
      
      // 蝜芾ˊ蝎?
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      
      // ?冽?敶Ｙ?
      if (Math.random() > 0.5) {
        // ?耦
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
          const angle = (j * 2 * Math.PI) / 5 - Math.PI / 2;
          const x = Math.cos(angle) * p.size;
          const y = Math.sin(angle) * p.size;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        // ?耦
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
  }

  updateHealthBars() {
    const now = Date.now();
    const lowHpPulse = Math.sin(now * 0.01) * 0.3 + 0.7; // 0.4-1.0??
    
    // ?湔?拙振1銵璇?
    const player1Health = document.getElementById('player1Health');
    if (player1Health && this.players.player1) {
      const healthPercent = (this.players.player1.hp / this.players.player1.maxHp) * 100;
      player1Health.style.width = `${healthPercent}%`;
      
      // ?寞?銵?霈???
      if (healthPercent > 60) {
        player1Health.style.background = 'linear-gradient(90deg, #4CAF50, #81C784)';
        player1Health.style.opacity = '1';
      } else if (healthPercent > 30) {
        player1Health.style.background = 'linear-gradient(90deg, #FF9800, #FFB74D)';
        player1Health.style.opacity = '1';
      } else {
        // ?? 雿??郎????蝝
        player1Health.style.background = 'linear-gradient(90deg, #F44336, #EF5350)';
        player1Health.style.opacity = lowHpPulse.toString();
        player1Health.style.boxShadow = `0 0 ${20 * lowHpPulse}px rgba(244, 67, 54, 0.8)`;
      }
    }
    
    // ?湔?拙振2銵璇?
    const player2Health = document.getElementById('player2Health');
    if (player2Health && this.players.player2) {
      const healthPercent = (this.players.player2.hp / this.players.player2.maxHp) * 100;
      player2Health.style.width = `${healthPercent}%`;
      
      // ?寞?銵?霈???
      if (healthPercent > 60) {
        player2Health.style.background = 'linear-gradient(90deg, #4CAF50, #81C784)';
        player2Health.style.opacity = '1';
      } else if (healthPercent > 30) {
        player2Health.style.background = 'linear-gradient(90deg, #FF9800, #FFB74D)';
        player2Health.style.opacity = '1';
      } else {
        // ?? 雿??郎????蝝
        player2Health.style.background = 'linear-gradient(90deg, #F44336, #EF5350)';
        player2Health.style.opacity = lowHpPulse.toString();
        player2Health.style.boxShadow = `0 0 ${20 * lowHpPulse}px rgba(244, 67, 54, 0.8)`;
      }
    }
  }

  updateCooldownUI() {
    const now = Date.now();
    
    // ??瑼Ｘ??瘠D摰?銝行?閮ready
    const checkAndMarkReady = (playerId, skillType, lastUsed, cooldown) => {
      const wasOnCd = this.gameState.skillReadyFlash[playerId][skillType] === false;
      const isReady = (lastUsed + cooldown) <= now;
      
      if (wasOnCd && isReady) {
        // ??賢??末?賡?
        this.markSkillReady(playerId, skillType);
      }
    };
    
    // 瑼Ｘ?拙振1???
    checkAndMarkReady('player1', 'normal', this.cooldowns.player1.normal, this.players.player1?.skills.normal.cooldown || 1000);
    checkAndMarkReady('player1', 'ultimate', this.cooldowns.player1.ultimate, this.players.player1?.skills.ultimate.cooldown || 1000);
    
    // 瑼Ｘ?拙振2???
    checkAndMarkReady('player2', 'normal', this.cooldowns.player2.normal, this.players.player2?.skills.normal.cooldown || 1000);
    checkAndMarkReady('player2', 'ultimate', this.cooldowns.player2.ultimate, this.players.player2?.skills.ultimate.cooldown || 1000);
    
    // ? 靽桀儔嚗溶?蝳血?餅??＊蝷?
    this.updateSkillCooldown('p1Attack', this.cooldowns.player1.attack, this.players.player1?.attackSpeed || 1000, now);
    this.updateSkillCooldown('p1Normal', this.cooldowns.player1.normal, this.players.player1?.skills.normal.cooldown || 1000, now);
    this.updateSkillCooldown('p1Ultimate', this.cooldowns.player1.ultimate, this.players.player1?.skills.ultimate.cooldown || 1000, now);
    this.updateSkillCooldown('p1Defend', this.cooldowns.player1.defend, 2000, now); // ?儭??脩戌2蝘D
    
    this.updateSkillCooldown('p2Attack', this.cooldowns.player2.attack, this.players.player2?.attackSpeed || 1000, now);
    this.updateSkillCooldown('p2Normal', this.cooldowns.player2.normal, this.players.player2?.skills.normal.cooldown || 1000, now);
    this.updateSkillCooldown('p2Ultimate', this.cooldowns.player2.ultimate, this.players.player2?.skills.ultimate.cooldown || 1000, now);
    this.updateSkillCooldown('p2Defend', this.cooldowns.player2.defend, 2000, now); // ?儭??脩戌2蝘D
  }

  updateSkillCooldown(elementId, lastUsed, cooldownTime, now) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const timeLeft = Math.max(0, (lastUsed + cooldownTime) - now);
    const progress = timeLeft > 0 ? timeLeft / cooldownTime : 0;
    
    // ? 靽桀儔嚗迤蝣箄?蝞脣漲閫漲
    const progressDegrees = progress * 360;
    
    if (timeLeft > 0) {
      element.classList.remove('ready');
      element.classList.add('on-cooldown');
      element.style.setProperty('--progress', `${progressDegrees}deg`);
      
      // ? 靽桀儔嚗Ⅱ靽??＊蝷箏?蝝??其蒂甇?Ⅱ?湔
      let timeDisplay = element.querySelector('.cooldown-time');
      if (!timeDisplay) {
        // 憒?銝??剁??萄遣銝??
        timeDisplay = document.createElement('div');
        timeDisplay.className = 'cooldown-time';
        element.appendChild(timeDisplay);
      }
      
      const secondsLeft = Math.ceil(timeLeft / 1000);
      timeDisplay.textContent = secondsLeft;
      timeDisplay.style.display = 'block';
      
      // ? ?日嚗Ⅱ隤摮迤?冽??
    } else {
      element.classList.add('ready');
      element.classList.remove('on-cooldown');
      element.style.setProperty('--progress', '0deg');
      
      // ?梯????詨?
      const timeDisplay = element.querySelector('.cooldown-time');
      if (timeDisplay) {
        timeDisplay.style.display = 'none';
      }
    }
  }

  // ? 靽桀儔嚗溶??曉??急瘜?
  playAnimation(player, animationName) {
    if (player && player.animation) {
      player.animation.current = animationName;
      player.animation.frame = 0;
    }
  }

  playSkillAnimation(player, skillCode) {
    const animationMap = {
      [SKILL_CODES.WIND_DASH]: 'windDash',
      [SKILL_CODES.WIND_SLASH]: 'windSlash',
      [SKILL_CODES.FIRE_RUSH]: 'fireRush',
      [SKILL_CODES.FIRE_BALL]: 'fireBall',
      [SKILL_CODES.FORGE_FIRE_SPIN]: 'forgefireSpin',
      [SKILL_CODES.FLAME_GOD_BLADE]: 'flameGodBlade',
      [SKILL_CODES.WATER_SHIELD]: 'waterShield',
      [SKILL_CODES.WATER_DRAGON]: 'waterDragon',
      [SKILL_CODES.THUNDER_STEP]: 'thunderStep',
      [SKILL_CODES.THUNDER_PUNCH]: 'thunderPunch',
      [SKILL_CODES.ROCK_GUARD]: 'rockGuard',
      [SKILL_CODES.EARTH_QUAKE]: 'earthQuake',
      [SKILL_CODES.SHADOW_STRIKE]: 'shadowStrike',
      [SKILL_CODES.SHADOW_CLONE]: 'shadowClone',
      [SKILL_CODES.SPIRIT_BOMB]: 'spiritBomb',
      [SKILL_CODES.SPIRIT_JUDGMENT]: 'spiritJudgment',
      [SKILL_CODES.VENOM_DART]: 'venomDart',
      [SKILL_CODES.THORN_TRAP]: 'thornTrap',
      [SKILL_CODES.SAVAGE_SUPLEX]: 'savageSuplex',
      [SKILL_CODES.ROYAL_EXECUTION]: 'royalExecution',
      [SKILL_CODES.ELF_TALISMAN]: 'elfTalisman',
      [SKILL_CODES.STEALTH_DASH]: 'stealthDash',
      [SKILL_CODES.BLOOD_SHACKLES]: 'bloodShackles',
      [SKILL_CODES.BLOOD_DEVOUR]: 'bloodDevour',
      [SKILL_CODES.FLASH_CUT]: 'flashCut',
      [SKILL_CODES.IAI_FLASH]: 'iaiFlash',
      [SKILL_CODES.ABYSS_TENTACLE]: 'shadowStrike',
      [SKILL_CODES.BEAST_LIBERATION]: 'rockGuard',
      [SKILL_CODES.BOULDER_TOSS]: 'earthQuake',
      [SKILL_CODES.BEAST_REVERT]: 'idle',
      [SKILL_CODES.REBEL_MINION]: 'rebelMinion',
      [SKILL_CODES.CHAIN_OF_PAIN]: 'chainOfPain'
    };
    
    const animation = animationMap[skillCode] || 'idle';
    this.playAnimation(player, animation);
  }

  // ? 靽桀儔嚗Ⅱ靽?dealDamage ?寞?摮
  dealDamage(target, damage, source) {
    return this.dealDamageWithResult(target, damage, source);
  }

  // ? 靽桀儔嚗Ⅱ靽ddDamageNumber?寞?摮 - ?舀憭車憿?
  addDamageNumber(x, y, damage, type = 'normal') {
    // type: 'normal'(?格), 'skill'(???, 'critical'(?湔?), 'heal'(瘝餌?)
    const damageEffect = {
      x: x + (Math.random() - 0.5) * 40,
      y: y - 30,
      damage: damage,
      type: type,
      startTime: Date.now(),
      duration: type === 'critical' ? 2000 : 1500
    };
    
    this.gameState.damageNumbers = this.gameState.damageNumbers || [];
    this.gameState.damageNumbers.push(damageEffect);
  }

  renderDamageNumbers() {
    if (!this.gameState.damageNumbers) return;
    
    const now = Date.now();
    
    this.gameState.damageNumbers = this.gameState.damageNumbers.filter(dmg => {
      const progress = (now - dmg.startTime) / dmg.duration;
      if (progress >= 1) return false;
      
      const alpha = 1 - progress;
      const y = dmg.y - progress * 60;
      
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      
      // ?寞?憿?閮剔蔭憿?之撠?
      let color, strokeColor, fontSize, text;
      
      switch(dmg.type) {
        case 'heal':
          color = '#4CAF50';
          strokeColor = '#1B5E20';
          fontSize = 22;
          text = `+${dmg.damage}`;
          break;
        case 'critical':
          color = '#FF1744';
          strokeColor = '#8B0000';
          fontSize = 28;
          text = `${dmg.damage}!`;
          // ?湔??憭扳???
          const scale = 1 + Math.sin(progress * Math.PI) * 0.3;
          this.ctx.scale(scale, scale);
          break;
        case 'skill':
          color = '#FFD700';
          strokeColor = '#FF8F00';
          fontSize = 24;
          text = `${dmg.damage}`;
          break;
        default: // normal
          color = '#FFFFFF';
          strokeColor = '#333333';
          fontSize = 20;
          text = `${dmg.damage}`;
      }
      
      this.ctx.font = `bold ${fontSize}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      this.ctx.shadowBlur = 4;
      
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = 3;
      this.ctx.strokeText(text, dmg.x, y);
      
      this.ctx.fillStyle = color;
      this.ctx.fillText(text, dmg.x, y);
      
      this.ctx.restore();
      
      return true;
    });
  }

  // ???啣?嚗葡?撟??賣???
  renderScreenFlash() {
    if (!this.gameState.screenFlash) return;
    
    const now = Date.now();
    const flash = this.gameState.screenFlash;
    const elapsed = now - flash.startTime;
    
    if (elapsed >= flash.duration) {
      // ???蝯?
      this.gameState.screenFlash = null;
      return;
    }
    
    // 閮?瘛∪??
    const progress = elapsed / flash.duration;
    const alpha = flash.maxAlpha * (1 - progress);
    
    // 蝜芾ˊ?典??質?桃蔗
    this.ctx.save();
    this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.ctx.restore();
  }

  // 嚙??啣?嚗溶?擛亥???
  addCombatLog(message, playerSide = 'center', type = 'normal') {
    const now = Date.now();
    this.gameState.combatLog = this.gameState.combatLog || [];
    
    this.gameState.combatLog.push({
      message: message,
      playerSide: playerSide,  // 'player1', 'player2', 'center'
      type: type,  // 'normal', 'damage', 'skill', 'heal', 'status'
      timestamp: now,
      duration: 3000  // 憿舐內3蝘?
    });
    
    // ?閮?賊?嚗???憭???璇?
    if (this.gameState.combatLog.length > 10) {
      this.gameState.combatLog.shift();
    }
  }

  // ?? ?啣?嚗葡?擛亥???



























































  // ? 皜脫????閮
  renderComboCounter() {
    const now = Date.now();
    const ctx = this.ctx;
    
    // ?拙振1???
    if (this.gameState.comboCount.player1 >= 2 && now - this.gameState.lastHitTime.player1 < 2000) {
      const combo = this.gameState.comboCount.player1;
      const x = 200;
      const y = 100;
      const elapsed = now - this.gameState.lastHitTime.player1;
      const alpha = Math.max(0, 1 - elapsed / 2000);
      
      ctx.save();
      ctx.globalAlpha = alpha;
      
      // ????詨?
      ctx.font = 'bold 60px Arial';
      ctx.fillStyle = '#FFD700';
      ctx.strokeStyle = '#FF4500';
      ctx.lineWidth = 4;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(255, 69, 0, 0.8)';
      ctx.shadowBlur = 20;
      
      const scale = 1 + Math.sin(elapsed * 0.01) * 0.1;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.strokeText(combo, 0, 0);
      ctx.fillText(combo, 0, 0);
      ctx.restore();
      
      // HIT ??
      ctx.font = 'bold 30px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeText('HIT!', x, y + 40);
      ctx.fillText('HIT!', x, y + 40);
      
      ctx.restore();
    }
    
    // ?拙振2???
    if (this.gameState.comboCount.player2 >= 2 && now - this.gameState.lastHitTime.player2 < 2000) {
      const combo = this.gameState.comboCount.player2;
      const x = this.canvasWidth - 200;
      const y = 100;
      const elapsed = now - this.gameState.lastHitTime.player2;
      const alpha = Math.max(0, 1 - elapsed / 2000);
      
      ctx.save();
      ctx.globalAlpha = alpha;
      
      // ????詨?
      ctx.font = 'bold 60px Arial';
      ctx.fillStyle = '#FFD700';
      ctx.strokeStyle = '#FF4500';
      ctx.lineWidth = 4;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(255, 69, 0, 0.8)';
      ctx.shadowBlur = 20;
      
      const scale = 1 + Math.sin(elapsed * 0.01) * 0.1;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.strokeText(combo, 0, 0);
      ctx.fillText(combo, 0, 0);
      ctx.restore();
      
      // HIT ??
      ctx.font = 'bold 30px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeText('HIT!', x, y + 40);
      ctx.fillText('HIT!', x, y + 40);
      
      ctx.restore();
    }
  }

  // ?? 皜脫???瘠D?脣漲璇?
  renderSkillCooldowns() {
    const ctx = this.ctx;
    const bindings = this.getControlBindings();
    const barWidth = 120;
    const barHeight = 12;
    const spacing = 10;
    
    // ?拙振1??瘠D (撌虫?閫?
    const p1X = 20;
    const p1Y = this.canvasHeight - 80;
    
    ctx.save();
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'left';
    
    // ?桅???
    const p1NormalProgress = Math.max(0, 1 - this.cooldowns.player1.normal / this.players.player1.skills.normal.cooldown);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(p1X, p1Y, barWidth, barHeight);
    ctx.fillStyle = p1NormalProgress >= 1 ? '#4CAF50' : '#FFD700';
    ctx.fillRect(p1X, p1Y, barWidth * p1NormalProgress, barHeight);
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(p1X, p1Y, barWidth, barHeight);
    ctx.fillStyle = '#FFF';
    ctx.fillText(bindings.player1.normal.toUpperCase() + ' - ' + this.players.player1.skills.normal.name, p1X, p1Y - 5);
    
    // 蝯扔???
    const p1UltProgress = Math.max(0, 1 - this.cooldowns.player1.ultimate / this.players.player1.skills.ultimate.cooldown);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(p1X, p1Y + barHeight + spacing, barWidth, barHeight);
    ctx.fillStyle = p1UltProgress >= 1 ? '#FF4500' : '#9C27B0';
    ctx.fillRect(p1X, p1Y + barHeight + spacing, barWidth * p1UltProgress, barHeight);
    ctx.strokeStyle = '#FFF';
    ctx.strokeRect(p1X, p1Y + barHeight + spacing, barWidth, barHeight);
    ctx.fillStyle = '#FFF';
    ctx.fillText(bindings.player1.ultimate.toUpperCase() + ' - ' + this.players.player1.skills.ultimate.name, p1X, p1Y + barHeight + spacing - 5);
    
    // ?拙振2??瘠D (?喃?閫?
    const p2X = this.canvasWidth - barWidth - 20;
    const p2Y = this.canvasHeight - 80;
    
    ctx.textAlign = 'right';
    
    // ?桅???
    const p2NormalProgress = Math.max(0, 1 - this.cooldowns.player2.normal / this.players.player2.skills.normal.cooldown);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(p2X, p2Y, barWidth, barHeight);
    ctx.fillStyle = p2NormalProgress >= 1 ? '#4CAF50' : '#FFD700';
    ctx.fillRect(p2X, p2Y, barWidth * p2NormalProgress, barHeight);
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(p2X, p2Y, barWidth, barHeight);
    ctx.fillStyle = '#FFF';
    ctx.fillText(this.players.player2.skills.normal.name + ' - ' + bindings.player2.normal.toUpperCase(), p2X + barWidth, p2Y - 5);
    
    // 蝯扔???
    const p2UltProgress = Math.max(0, 1 - this.cooldowns.player2.ultimate / this.players.player2.skills.ultimate.cooldown);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(p2X, p2Y + barHeight + spacing, barWidth, barHeight);
    ctx.fillStyle = p2UltProgress >= 1 ? '#FF4500' : '#9C27B0';
    ctx.fillRect(p2X, p2Y + barHeight + spacing, barWidth * p2UltProgress, barHeight);
    ctx.strokeStyle = '#FFF';
    ctx.strokeRect(p2X, p2Y + barHeight + spacing, barWidth, barHeight);
    ctx.fillStyle = '#FFF';
    ctx.fillText(this.players.player2.skills.ultimate.name + ' - ' + bindings.player2.ultimate.toUpperCase(), p2X + barWidth, p2Y + barHeight + spacing - 5);
    
    ctx.restore();
  }

  // ? ?⊿??
  triggerCameraShake(intensity = 10, duration = 300) {
    this.gameState.cameraShake = {
      active: true,
      intensity: intensity,
      duration: duration,
      elapsed: 0
    };
  }

  // ?爸 easeOutBack 蝺拙??賣嚗?頨怎嚗?
  easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  // ? ???
  triggerHitFlash(player) {
    if (!player) return;
    player.hitFlash = 300; // ??300ms
  }

  // ????賢??賣?蝷?
  markSkillReady(playerId, skillType) {
    if (this.gameState.skillReadyFlash[playerId]) {
      this.gameState.skillReadyFlash[playerId][skillType] = true;
    }
  }

  clearSkillReady(playerId, skillType) {
    if (this.gameState.skillReadyFlash[playerId]) {
      this.gameState.skillReadyFlash[playerId][skillType] = false;
    }
  }

  // ? 蝣箔????閬??寞??賢???
  checkFlameMarkBurn(target, attacker, damage) {
    const now = Date.now();
    
    if (!target || !attacker || target === attacker) return;
    
    // 瑼Ｘ?格??臬???啣閮?撠??
    if (target.effects.flameMark > now && target.effects.burning <= now) {
      // ????
      const passive = this.getPlayerPassive(attacker);
      if (passive && passive.name === '??啗?') {
        target.effects.burning = now + passive.burnDuration;
        target.effects.burnTickTime = now + passive.burnInterval;
        target.effects.flameMark = 0; // 瘨閮?
        
        this.addVisualEffect(target.position.x, target.position.y, 'ignite', '🔥');
        
        // ?萄遣???寞?
        this.createBurningEffect(target.position.x, target.position.y);
      }
    }
  }

  getPlayerPassive(attacker) {
    if (typeof attacker === 'string') {
      return null;
    }
    
    if (attacker === this.players.player1) {
      return this.players.player1.passive || null;
    } else if (attacker === this.players.player2) {
      return this.players.player2.passive || null;
    }
    return null;
  }

  createBurningEffect(x, y) {
    if (typeof particleSystem !== 'undefined' && particleSystem) {
      for (let i = 0; i < 8; i++) {
        particleSystem.particles.push({
          x: x + (Math.random() - 0.5) * 30,
          y: y + Math.random() * 20,
          vx: (Math.random() - 0.5) * 50,
          vy: -30 - Math.random() * 50,
          size: 2 + Math.random() * 3,
          color: Math.random() > 0.5 ? '#FF4444' : '#FF8800',
          life: 1000,
          maxLife: 1000,
          alpha: 1,
          type: 'burn_flame'
        });
      }
    }
  }

  getAttackerFromSource(source) {
    if (typeof source === 'string') {
      if (source.includes('player1') || source === 'player1') {
        return this.players.player1;
      } else if (source.includes('player2') || source === 'player2') {
        return this.players.player2;
      }
      return null;
    }
    return source;
  }

  createJudgmentEffect(x, y, range) {
    if (typeof particleSystem !== 'undefined' && particleSystem) {
      // 憭拚?????
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 / 20) * i;
        const lightX = x + Math.cos(angle) * (range * 0.3);
        const lightY = y + Math.sin(angle) * (range * 0.3);
        
        particleSystem.particles.push({
          x: lightX,
          y: lightY - 200,
          endX: lightX,
          endY: lightY,
          currentY: lightY - 200,
          color: '#FFD700',
          life: 1000,
          maxLife: 1000,
          width: 3,
          type: 'judgment_beam'
        });
      }
      
      particleSystem.createExplosionEffect(x, y, {
        color: '#FFD700',
        maxRadius: range,
        duration: 800
      });
      
      for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * range;
        const particleX = x + Math.cos(angle) * distance;
        const particleY = y + Math.sin(angle) * distance;
        
        particleSystem.particles.push({
          x: particleX,
          y: particleY,
          vx: (Math.random() - 0.5) * 100,
          vy: -50 - Math.random() * 100,
          size: 2 + Math.random() * 3,
          color: '#FFFF88',
          life: 1500,
          maxLife: 1500,
          alpha: 1,
          type: 'holy_particle'
        });
      }
      
      particleSystem.createScreenShake(10, 500);
    }
  }

  // ? 靽桀儔嚗溶?撩憭梁? selectCharacters ?寞?
  selectCharacters(char1Id, char2Id) {
    this.players.player1 = JSON.parse(JSON.stringify(characters[char1Id]));
    this.players.player2 = JSON.parse(JSON.stringify(characters[char2Id]));
    
    // ?湔??雿蔭?拇??游之?恍
    this.players.player1.position = { x: 150, y: 550 };
    this.players.player2.position = { x: 1250, y: 550 };
    this.players.player1.facing = 1;
    this.players.player2.facing = -1;
    
    // 瘛餃?????
    this.players.player1.animation = {
      current: 'idle',
      frame: 0,
      frameTimer: 0
    };
    this.players.player2.animation = {
      current: 'idle',
      frame: 0,
      frameTimer: 0
    };
    
    // 瘛餃??????
    this.players.player1.effects = {
      invulnerable: 0,
      stunned: 0,
      slowed: 0,
      shielded: 0,
      blocking: 0,
      casting: 0,
      counterWindow: 0,
      defending: 0,
      wallSlowed: 0,
      speedBoost: 0,
      counterAttack: 0,
      guaranteedCrit: 0,
      silenced: 0,
      flameMark: 0,
      burning: 0,
      burnTickTime: 0,
      poisonStacks: 0,
      poisonDotEnd: 0,
      poisonTickTime: 0,
      rooted: 0,
      chainCasting: 0,
      buffedDart: 0,
      superArmor: 0,
      thornTrapSpeedBuff: 0,
      feared: 0,
      fearDirection: 0,
      fearStartX: 0,
      lightningGuard: 0,
      lightningGuardFlatDR: 0,
      snowballBuff: 0,
      snowballCharges: 0,
      rangerPassiveCount: 0,
      rangerSpeedBuff: 0,
      empoweredShot: 0,
      stealthAttackSpeedBuff: 0,
      talismanState: null,
      bloodShield: 0,
      bloodTether: null,
      bloodCurseTether: null,
      // 鋆捱????
      parryActive: 0,
      adjudicatorPassiveSlow: 0,
      verdictSlow: 0,
      verdictSlowApplied: false,
      // ?弛 ??憭扳???皜?
      healReduction: 0,
      healReductionPercent: 0
    };

    // ?儭?Exile Blade execution state
    this.players.player1.isExecuting = false;
    this.players.player1.executionState = null;

    this.players.player2.effects = {
      invulnerable: 0,
      stunned: 0,
      slowed: 0,
      shielded: 0,
      blocking: 0,
      casting: 0,
      counterWindow: 0,
      defending: 0,
      wallSlowed: 0,
      speedBoost: 0,
      counterAttack: 0,
      guaranteedCrit: 0,
      silenced: 0,
      flameMark: 0,
      burning: 0,
      burnTickTime: 0,
      poisonStacks: 0,
      poisonDotEnd: 0,
      poisonTickTime: 0,
      rooted: 0,
      chainCasting: 0,
      buffedDart: 0,
      superArmor: 0,
      thornTrapSpeedBuff: 0,
      feared: 0,
      fearDirection: 0,
      fearStartX: 0,
      lightningGuard: 0,
      lightningGuardFlatDR: 0,
      snowballBuff: 0,
      snowballCharges: 0,
      rangerPassiveCount: 0,
      rangerSpeedBuff: 0,
      empoweredShot: 0,
      stealthAttackSpeedBuff: 0,
      talismanState: null,
      bloodShield: 0,
      bloodTether: null,
      bloodCurseTether: null,
      // 鋆捱????
      parryActive: 0,
      adjudicatorPassiveSlow: 0,
      verdictSlow: 0,
      verdictSlowApplied: false,
      // ?弛 ??憭扳???皜?
      healReduction: 0,
      healReductionPercent: 0
    };

    // ?儭?Exile Blade execution state
    this.players.player2.isExecuting = false;
    this.players.player2.executionState = null;
    
    // ? ????閬箸??惇??
    this.players.player1.hitFlash = 0;
    this.players.player2.hitFlash = 0;
    this.players.player1.windSlashRecastUntil = 0;
    this.players.player2.windSlashRecastUntil = 0;

    this.initializeBeastmasterState(this.players.player1);
    this.initializeBeastmasterState(this.players.player2);
  }

  initializeBeastmasterState(player) {
    if (!player || player.id !== 'beastmaster') return;

    player.baseFormStats = {
      attackDamage: 7,
      attackSpeed: 750,
      moveSpeed: 280,
      normalSkill: {
        code: SKILL_CODES.ABYSS_TENTACLE,
        name: '深淵觸手',
        type: '控制/抓取',
        cooldown: 4000
      },
      ultimateSkill: {
        code: SKILL_CODES.BEAST_LIBERATION,
        name: '巨獸解放',
        type: '變身/定身',
        cooldown: 1000
      }
    };

    player.isGolem = false;
    player.golemTransforming = null;
    player.beastStacks = player.passive?.initialStacks || 0;
    player.golemShield = 0;
    player.golemScale = 1;
    player.golemDrainInterval = 0;
    player.nextBeastDrainTime = 0;
    player.attackDamage = player.baseFormStats.attackDamage;
    player.attackSpeed = player.baseFormStats.attackSpeed;
    player.moveSpeed = player.baseFormStats.moveSpeed;
  }

  enterGolemForm(player, playerId) {
    if (!player || player.id !== 'beastmaster') return;

    const now = Date.now();
    // ?? 1 蝘?頨恍?蝔???皜 50%???航???
    player.golemTransforming = {
      startTime: now,
      duration: 1000,
      targetScale: player.skills.ultimate.golemScale || 1.25
    };
    player.effects.stunned = now + 1000; // 霈澈???芾澈銝銵?
    player.effects.superArmor = now + 1000; // 雿??青C
    player.golemScale = 1; // 敺犖??憪?

    this.addCombatLog('巨獸變身！定身敵人50%！', playerId, 'status');
    this.triggerCameraShake(3, 800);
  }

  completeGolemForm(player, playerId) {
    if (!player || player.id !== 'beastmaster') return;

    const ultimate = player.skills.ultimate;
    player.golemTransforming = null;

    player.isGolem = true;
    player.golemScale = ultimate.golemScale || 1.25;
    player.golemShield = ultimate.golemShield || 100;
    player.golemDrainInterval = ultimate.stackDrainInterval || 5000;
    player.nextBeastDrainTime = Date.now() + player.golemDrainInterval;

    player.attackDamage = ultimate.golemAttackDamage || 9;
    player.attackSpeed = ultimate.golemAttackSpeed || 1000;
    player.moveSpeed = ultimate.golemMoveSpeed || 180;

    player.skills.normal.code = SKILL_CODES.BOULDER_TOSS;
    player.skills.normal.name = '投擲巨石';
    player.skills.normal.type = '投擲/範圍';
    player.skills.normal.cooldown = ultimate.golemSkillCooldown || 5000;

    player.skills.ultimate.code = SKILL_CODES.BEAST_REVERT;
    player.skills.ultimate.name = '恢復人型';
    player.skills.ultimate.type = '恢復/變身';
    player.skills.ultimate.cooldown = 1000;

    this.triggerCameraShake(8, 300);
    this.addCombatLog('巨獸變身完成！', playerId, 'status');
  }

  revertBeastForm(player, playerId, removeShield = true) {
    if (!player || player.id !== 'beastmaster' || !player.isGolem) return;

    player.isGolem = false;
    player.golemTransforming = null;
    player.golemScale = 1;
    player.golemDrainInterval = 0;
    player.nextBeastDrainTime = 0;
    if (removeShield) {
      player.golemShield = 0;
    }

    player.attackDamage = player.baseFormStats?.attackDamage || 7;
    player.attackSpeed = player.baseFormStats?.attackSpeed || 750;
    player.moveSpeed = player.baseFormStats?.moveSpeed || 280;

    player.skills.normal.code = SKILL_CODES.ABYSS_TENTACLE;
    player.skills.normal.name = '深淵觸手';
    player.skills.normal.type = '控制/抓取';
    player.skills.normal.cooldown = 3000;

    player.skills.ultimate.code = SKILL_CODES.BEAST_LIBERATION;
    player.skills.ultimate.name = '巨獸解放';
    player.skills.ultimate.type = '變身/定身';
    player.skills.ultimate.cooldown = 1000;

    // 霈?鈭箏?憭扳??脣6蝘??
    this.cooldowns[playerId].ultimate = Date.now() - player.skills.ultimate.cooldown + 6000;

    this.addCombatLog('恢復人型！冷卻6秒！', playerId, 'status');
  }

  updateBeastmasterState(player, playerId, now) {
    if (!player || player.id !== 'beastmaster') return;

    // 霈澈??脰?銝哨?瑼Ｘ?臬摰?
    if (player.golemTransforming) {
      const tf = player.golemTransforming;
      const elapsed = now - tf.startTime;
      if (elapsed >= tf.duration) {
        this.completeGolemForm(player, playerId);
      } else {
        // 瞍貉?蝮格
        const progress = elapsed / tf.duration;
        player.golemScale = 1 + (tf.targetScale - 1) * this.easeOutBack(progress);
      }
      return;
    }

    if (!player.isGolem) return;

    // ?爸 撌函???嚗?蝥uperArmor嚗?
    player.effects.superArmor = now + 500;

    if (player.beastStacks <= 0) {
      this.revertBeastForm(player, playerId, true);
      return;
    }

    if (player.golemShield <= 0) {
      this.revertBeastForm(player, playerId, true);
      return;
    }

    if (now >= player.nextBeastDrainTime) {
      player.beastStacks = Math.max(0, player.beastStacks - 1);
      player.nextBeastDrainTime = now + (player.golemDrainInterval || 5000);

      if (player.beastStacks <= 0) {
        this.revertBeastForm(player, playerId, true);
        return;
      }
    }

  }

  getCollisionScale(player) {
    if (!player) return 1;
    if (player.id === 'beastmaster' && player.isGolem) {
      return player.golemScale || 2.5;
    }
    return 1;
  }

  getCollisionRadius(player, baseRadius = 40) {
    return baseRadius * this.getCollisionScale(player);
  }

  getMeleeRange(player) {
    let range = 75;
    if (player && player.id === 'beastmaster' && player.isGolem) {
      range += player.skills?.ultimate?.golemRangeBonus || 50;
    }
    // Scorpion has extended whip range
    if (player && player.id === 'scorpion') {
      range = player.attackRange || 240;
    }
    // ? ??∪葦嚗??⊥??餅?頝+30
    if (player && player.id === 'puppeteer') {
      const pid = this.getPlayerSide(player);
      const puppet = pid ? this.gameState.puppet[pid] : null;
      if (!puppet || !puppet.active) {
        range = (player.attackRange || 60) + (player.passive?.soloRangeBonus || 30);
      } else {
        range = player.attackRange || 60;
      }
    }
    return range;
  }

  getGolemHandPosition(player) {
    const scale = player?.golemScale || 1.25;
    return {
      x: player.position.x + (player.facing * 92 * scale),
      y: player.position.y - (18 * scale)
    };
  }

  getPlayerSide(player) {
    if (this.players.player1 === player) return 'player1';
    if (this.players.player2 === player) return 'player2';
    return null;
  }

  startAbyssTentaclePull(target, fromX, toX, pullDuration = 400, microStun = 300) {
    if (!target) return;

    const startTime = Date.now();
    const endTime = startTime + pullDuration;
    target.effects.rooted = Math.max(target.effects.rooted || 0, endTime);
    target.effects.stunned = Math.max(target.effects.stunned || 0, endTime);

    const animatePull = () => {
      if (!target || target.hp <= 0 || this.gameState.winner) return;

      const now = Date.now();
      const t = Math.min(1, (now - startTime) / pullDuration);
      const easedT = 1 - Math.pow(1 - t, 3);

      target.position.x = fromX + (toX - fromX) * easedT;
      target.position.x = Math.max(80, Math.min(this.canvasWidth - 80, target.position.x));

      if (t < 1) {
        requestAnimationFrame(animatePull);
      } else {
        target.position.x = toX;
        target.position.x = Math.max(80, Math.min(this.canvasWidth - 80, target.position.x));
        target.effects.stunned = Math.max(target.effects.stunned || 0, Date.now() + microStun);
      }
    };

    requestAnimationFrame(animatePull);
  }

  executeWindSlashRecast(playerId) {
    const now = Date.now();
    const player = this.players[playerId];
    const opponent = this.players[playerId === 'player1' ? 'player2' : 'player1'];
    if (!player || !opponent || opponent.hp <= 0) return;

    const skill = player.skills.ultimate;
    const playerSide = playerId === 'player1' ? 'player1' : 'player2';
    player.windSlashRecastUntil = 0;

    this.startAbyssTentaclePull(
      opponent,
      opponent.position.x,
      player.position.x,
      skill.recastPullDuration || 300,
      0
    );

    this.gameState.effects.push({
      type: 'wind_recast_pull',
      startX: opponent.position.x,
      startY: opponent.position.y - 20,
      endX: player.position.x,
      endY: player.position.y - 20,
      startTime: now,
      duration: skill.recastPullDuration || 300
    });

    this.dealDamage(opponent, skill.recastDamage || 8, playerId);
    this.addCombatLog(`風追擊命中！額外造成${skill.recastDamage || 8}傷害`, playerSide, 'skill');
    this.addVisualEffect(opponent.position.x, opponent.position.y, 'wind_recast', '🌀');
  }

  // ?? ?蔭?
  resetGame() {
    // ?蔭????
    this.gameState.winner = null;
    this.gameState.victoryAnimation = null;
    this.gameState.paused = false;
    this.gameState.combatLog = [];
    
    // 皜蝎?蝟餌絞畾?
    if (typeof particleSystem !== 'undefined' && particleSystem.particles) {
      particleSystem.particles.length = 0;
    }
    this.gameState.comboCount = { player1: 0, player2: 0 };
    this.gameState.lastHitTime = { player1: 0, player2: 0 };
    this.gameState.rockAttackCount = { player1: 0, player2: 0 };
    this.gameState.skillReadyFlash = {
      player1: { normal: false, ultimate: false },
      player2: { normal: false, ultimate: false }
    };
    this.gameState.cameraShake = {
      active: false,
      intensity: 0,
      duration: 0,
      elapsed: 0
    };
    this.gameState.shadowClones = { player1: [], player2: [] }; // ?? 皜?澈
    this.gameState.traps = []; // ? 皜?琿
    this.gameState.minions = []; // ?? 皜??
    this.gameState.hazards = []; // ?? 皜?啣耦?勗拿
    this.gameState.chainOfPain = null; // ?? 皜?琿?
    this.gameState.scorpionConsecutiveHits = { player1: 0, player2: 0 }; // ?? 皜??閮
    this.gameState.adjudicatorDomain = null; // ?? 皜鋆捱????
    this.gameState.puppet = { player1: null, player2: null }; // ? 皜???
    this.gameState.puppetSmoke = []; // ? 皜?
    this.hitStopFrames = 0; // ?? 皜 Hit-Stop
    
    // ?儭??蔭?脩戌???
    this.gameState.defending = {
      player1: { active: false, startTime: 0, direction: 1, cooldownUntil: 0 },
      player2: { active: false, startTime: 0, direction: 1, cooldownUntil: 0 }
    };
    
    // ?蔭?拙振???
    if (this.players.player1) {
      this.players.player1.hp = this.players.player1.maxHp;
      this.players.player1.position = { x: 150, y: 550 };
      this.players.player1.facing = 1;
      this.players.player1.hitFlash = 0;
      this.players.player1.waterShieldStoredDamage = 0; // ?? 皜瘞游??曉摮?
      this.players.player1.animation = { current: 'idle', frame: 0, frameTimer: 0 };
      
      // ?蔭??
      Object.keys(this.players.player1.effects).forEach(key => {
        this.players.player1.effects[key] = 0;
      });
      this.players.player1.windSlashRecastUntil = 0;
      if (this.players.player1.spiritChargeTimer) { clearTimeout(this.players.player1.spiritChargeTimer); this.players.player1.spiritChargeTimer = null; }
      this.players.player1.spiritChargeStart = null;
      if (this.players.player1.id === 'ranger') { this.players.player1.rangerAmmo = this.players.player1.ammoMax || 7; this.players.player1.rangerReloadUntil = 0; this.players.player1.rangerLastShotTime = 0; }

      this.initializeBeastmasterState(this.players.player1);
    }
    
    if (this.players.player2) {
      this.players.player2.hp = this.players.player2.maxHp;
      this.players.player2.position = { x: 1250, y: 550 };
      this.players.player2.facing = -1;
      this.players.player2.hitFlash = 0;
      this.players.player2.waterShieldStoredDamage = 0; // ?? 皜瘞游??曉摮?
      this.players.player2.animation = { current: 'idle', frame: 0, frameTimer: 0 };
      
      // ?蔭??
      Object.keys(this.players.player2.effects).forEach(key => {
        this.players.player2.effects[key] = 0;
      });
      this.players.player2.windSlashRecastUntil = 0;
      if (this.players.player2.spiritChargeTimer) { clearTimeout(this.players.player2.spiritChargeTimer); this.players.player2.spiritChargeTimer = null; }
      this.players.player2.spiritChargeStart = null;
      if (this.players.player2.id === 'ranger') { this.players.player2.rangerAmmo = this.players.player2.ammoMax || 7; this.players.player2.rangerReloadUntil = 0; this.players.player2.rangerLastShotTime = 0; }

      this.initializeBeastmasterState(this.players.player2);
    }
    
    // ?蔭?瑕??
    const now = Date.now();
    this.cooldowns = {
      player1: { attack: 0, normal: 0, ultimate: 0, defend: 0 },
      player2: { attack: 0, normal: 0, ultimate: 0, defend: 0 }
    };
    
    // ?蔭????
    this.projectiles = [];
    
    // ?蔭?瑕拿?詨?
    this.damageNumbers = [];
    
    // ?蔭閬死??
    this.visualEffects = [];
    
    // 皜征蝎?蝟餌絞
    if (typeof particleSystem !== 'undefined' && particleSystem) {
      particleSystem.particles = [];
    }
    
    // ?蔭銵璇I
    this.updateHealthBars();
    
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      let key = e.key.toLowerCase();
      if (e.code === 'Numpad4') key = 'numpad4';
      if (e.code === 'Numpad5') key = 'numpad5';
      // < 與 > 在多數鍵盤上是 ,／. 鍵；以實體按鍵辨識，不強迫按 Shift。
      if (e.code === 'Comma') key = '<';
      if (e.code === 'Period') key = '>';
      const bindings = this.getControlBindings();
      const player2Keys = ['arrowleft', 'arrowright', 'arrowup', 'arrowdown', bindings.player2.normal, bindings.player2.ultimate];
      
      // ?? ?蝯?敺?斗?雿?
      if (this.gameState.winner) {
        if (key === ' ') {
          // 蝛箇?蛛?隞颱??挾?賢??貉??恍
          this.resetGame();
          if (typeof showScreen === 'function') showScreen('characterSelect');
        } else if (this.gameState.victoryAnimation &&
                   this.gameState.victoryAnimation.phase === 'victory') {
          // ?嗡?隞餅??蛛??芸??恍?挾嚗? ?銝??
          this.resetGame();
        }
        e.preventDefault();
        return;
      }

      if (this.isCpuControlled('player2') && player2Keys.includes(key)) {
        e.preventDefault();
        return;
      }
      
      if (this.keys.hasOwnProperty(key)) {
        this.keys[key] = true;
        e.preventDefault();
      }
    });
    
    document.addEventListener('keyup', (e) => {
      let key = e.key.toLowerCase();
      if (e.code === 'Numpad4') key = 'numpad4';
      if (e.code === 'Numpad5') key = 'numpad5';
      if (e.code === 'Comma') key = '<';
      if (e.code === 'Period') key = '>';
      const bindings = this.getControlBindings();
      const player2Keys = ['arrowleft', 'arrowright', 'arrowup', 'arrowdown', bindings.player2.normal, bindings.player2.ultimate];

      if (this.isCpuControlled('player2') && player2Keys.includes(key)) {
        e.preventDefault();
        return;
      }

      if (this.keys.hasOwnProperty(key)) {
        this.keys[key] = false;
        
        // ?蔭??賣??萇????迂?活閫貊
        if (key === 'w') this.skillPressed.player1.attack = false;
        if (key === bindings.player1.normal) this.skillPressed.player1.normal = false;
        if (key === bindings.player1.ultimate) { this.skillPressed.player1.ultimate = false; this._tryReleaseJudgment('player1'); }
        if (key === 's') this.skillPressed.player1.defend = false;
        if (key === 'arrowup') this.skillPressed.player2.attack = false;
        if (key === bindings.player2.normal) this.skillPressed.player2.normal = false;
        if (key === bindings.player2.ultimate) { this.skillPressed.player2.ultimate = false; this._tryReleaseJudgment('player2'); }
        if (key === 'arrowdown') this.skillPressed.player2.defend = false;
        
        e.preventDefault();
      }
    });

    // ?儭?Canvas 暺?嚗??拍?Ｘ???
    this.canvas.addEventListener('click', (e) => {
      if (!this.gameState.winner) return;
      if (!this.gameState.victoryAnimation || this.gameState.victoryAnimation.phase !== 'victory') return;

      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvasWidth / rect.width;
      const scaleY = this.canvasHeight / rect.height;
      const cx = (e.clientX - rect.left) * scaleX;
      const cy = (e.clientY - rect.top) * scaleY;

      const inBtn = (btn) => btn && cx >= btn.x && cx <= btn.x + btn.w && cy >= btn.y && cy <= btn.y + btn.h;

      if (inBtn(this._victoryBtnLeft)) {
        // ??貉??恍
        this.resetGame();
        if (typeof showScreen === 'function') showScreen('characterSelect');
      } else if (inBtn(this._victoryBtnRight)) {
        // ?銝??
        this.resetGame();
      }
    });
  }

  handleInput() {
    const player2CpuControlled = this.isCpuControlled('player2');
    const bindings = this.getControlBindings();

    // ??蝘餃??? - ?脩戌???賜宏??
    if (this.keys['a'] && !this.isPlayerDefending('player1')) this.movePlayer('player1', -1);
    if (this.keys['d'] && !this.isPlayerDefending('player1')) this.movePlayer('player1', 1);
    if (!player2CpuControlled && this.keys['arrowleft'] && !this.isPlayerDefending('player2')) this.movePlayer('player2', -1);
    if (!player2CpuControlled && this.keys['arrowright'] && !this.isPlayerDefending('player2')) this.movePlayer('player2', 1);
    
    // ?餅?????- ?芸擐活???孛?潘??脩戌???賭蝙??
    if (this.keys['w'] && !this.skillPressed.player1.attack && !this.isPlayerDefending('player1')) {
      this.attack('player1');
      this.skillPressed.player1.attack = true;
    }
    if (this.keys[bindings.player1.normal] && !this.skillPressed.player1.normal && !this.isPlayerDefending('player1')) {
      this.useSkill('player1', 'normal');
      this.skillPressed.player1.normal = true;
    }
    if (this.keys[bindings.player1.ultimate] && !this.skillPressed.player1.ultimate && !this.isPlayerDefending('player1')) {
      this.useSkill('player1', 'ultimate');
      this.skillPressed.player1.ultimate = true;
    }
    
    if (!player2CpuControlled && this.keys['arrowup'] && !this.skillPressed.player2.attack && !this.isPlayerDefending('player2')) {
      this.attack('player2');
      this.skillPressed.player2.attack = true;
    }
    if (!player2CpuControlled && this.keys[bindings.player2.normal] && !this.skillPressed.player2.normal && !this.isPlayerDefending('player2')) {
      this.useSkill('player2', 'normal');
      this.skillPressed.player2.normal = true;
    }
    if (!player2CpuControlled && this.keys[bindings.player2.ultimate] && !this.skillPressed.player2.ultimate && !this.isPlayerDefending('player2')) {
      this.useSkill('player2', 'ultimate');
      this.skillPressed.player2.ultimate = true;
    }
    
    // ?儭??脩戌?? - ?瑟?璈
    // ?拙振1 (S??
    if (this.keys['s']) {
      if (!this.gameState.defending.player1.active) {
        // ???脩戌
        this.startDefend('player1');
      }
      // ???脩戌銝??湔?脩戌?孵?
      this.updateDefendDirection('player1');
    } else {
      // 擛??,蝯??脩戌
      if (this.gameState.defending.player1.active) {
        this.endDefend('player1');
      }
    }
    
    // ?拙振2 (?)
    if (!player2CpuControlled && this.keys['arrowdown']) {
      if (!this.gameState.defending.player2.active) {
        // ???脩戌
        this.startDefend('player2');
      }
      // ???脩戌銝??湔?脩戌?孵?
      this.updateDefendDirection('player2');
    } else {
      // 擛??,蝯??脩戌
      if (this.gameState.defending.player2.active) {
        this.endDefend('player2');
      }
    }
  }

  movePlayer(playerId, direction) {
    const player = this.players[playerId];
    if (!player || player.effects.stunned > Date.now() || player.effects.casting > Date.now() || player.effects.rooted > Date.now() || this.isPlayerDefending(playerId)) return;
    
    // ?儭?Exile Blade: block movement during execution
    if (player.isExecuting) return;
    
    let speed = player.moveSpeed;
    
    // ?蝺拚???
    if (player.effects.slowed > Date.now()) {
      speed *= 0.7;
    }
    
    // ???皜???(70%皜?
    if (player.effects.wallSlowed > Date.now()) {
      speed *= 0.3;
    }
    
    // ?蝘駁?????
    if (player.effects.speedBoost > Date.now()) {
      speed *= 1.2;
    }
    
    // ? 蝎暸???鋡怠?蝘駁???
    if (player.effects.rangerSpeedBuff > Date.now()) {
      speed *= 1.2;
    }
    
    // ? ???琿??嚗?瘝澆??宏???350嚗?蝥?蝘?
    if (player.effects.thornTrapSpeedBuff > Date.now()) {
      speed = 350;
    }
    
    // ?弩 銵銋風?曄宏????
    if (player.effects.bloodShield > 0) {
      speed *= (1 + (player.passive?.speedBonus || 0.05));
    }
    
    // ?弩 銵???祈頨急???
    if (player.effects.bloodCurseTether) {
      speed *= (1 - (player.skills?.ultimate?.selfSlowPercent || 0.25));
    }

    // ?? 鋆捱?◤????嚗?5% 皜?
    if (player.effects.adjudicatorPassiveSlow > Date.now()) {
      speed *= 0.85;
    }

    // ?? ?蝯瘙粹??楨??60%??0%嚗?蝘?皜?
    if (player.effects.verdictSlow > Date.now()) {
      const remaining = player.effects.verdictSlow - Date.now();
      const ratio = remaining / 3000; // 1.0 ??0.0
      const slowPercent = 0.30 + 0.30 * ratio; // 60% ??30%
      speed *= (1 - slowPercent);
    }
    
    player.position.x += direction * speed * 0.016;
    player.facing = direction;
    
    // ?湔??瑼Ｘ?拇??啁??
    player.position.x = Math.max(80, Math.min(this.canvasWidth - 80, player.position.x));
  }

  attack(playerId) {
    const now = Date.now();
    const player = this.players[playerId];
    const opponent = this.players[playerId === 'player1' ? 'player2' : 'player1'];
    
    if (!player || player.effects.stunned > now || player.effects.casting > now || player.effects.chainDisabled > now || player.effects.chainCasting > now || this.isPlayerDefending(playerId)) return;
    
    // ?儭?Exile Blade: block attacks during execution
    if (player.isExecuting) return;
    
    // ? 蝎暸????恍銵????
    let effectiveAttackSpeed = player.attackSpeed;
    if (player.effects.stealthAttackSpeedBuff > now && player.id === 'ranger') {
      effectiveAttackSpeed = player.skills.ultimate.boostedAttackSpeed;
    }
    if (now - this.cooldowns[playerId].attack < effectiveAttackSpeed) return;
    
    this.cooldowns[playerId].attack = now;
    
    // ?剜?餅??嚗?瘙箄蝙?典?撅祆?瑽????恬?
    this.playAnimation(
      player,
      player.id === 'adjudicator'
        ? 'gavelSmash'
        : player.id === 'forgefire'
          ? 'forgefireSlash'
          : 'attack'
    );
    this.spawnCombatFlourish('swing', player, opponent, player.id === 'forgefire' || player.id === 'adjudicator' ? 1.35 : 1);

    // ? ???餅?嚗撠?撠
    if (player.isRanged) {
      // ?弩 銵憟???銵敶?撠
      if (player.id === 'warlock') {
        const spawnX = player.position.x + (30 * player.facing);
        const bolt = {
          x: spawnX,
          y: player.position.y - 20,
          startX: spawnX,
          maxRange: 300,
          direction: player.facing,
          speed: player.projectileSpeed || 400,
          damage: player.attackDamage,
          type: 'bloodBolt',
          skill: { knockback: 0 },
          owner: player,
          startTime: now
        };
        this.gameState.projectiles.push(bolt);
        return;
      }

      // ? 蝎暸???嚗悌?Ｘ?撠
      // ?? 敶蝟餌絞 - ????/ ?蔭?? / 鋆‵銝剜???
      if (player.rangerAmmo === undefined) player.rangerAmmo = player.ammoMax || 7;
      if (player.rangerLastShotTime && (now - player.rangerLastShotTime) >= (player.ammoIdleRefill || 2100)) {
        player.rangerAmmo = player.ammoMax || 7;
        player.rangerReloadUntil = 0;
      }
      if (player.rangerReloadUntil && player.rangerReloadUntil > now) return;
      let arrowDamage = player.attackDamage;
      let isEmpowered = false;
      
      // ?恍撘瑕??格
      if (player.effects.empoweredShot > now) {
        arrowDamage = player.skills.ultimate.empoweredDamage;
        isEmpowered = true;
        player.effects.empoweredShot = 0;
      }
      
      const arrow = {
        x: player.position.x + (30 * player.facing),
        y: player.position.y - 20,
        direction: player.facing,
        speed: player.projectileSpeed || 500,
        damage: arrowDamage,
        type: 'rangerArrow',
        skill: { knockback: 0 },
        owner: player,
        startTime: now,
        empowered: isEmpowered,
        slowPercent: isEmpowered ? player.skills.ultimate.slowPercent : 0,
        slowDuration: isEmpowered ? player.skills.ultimate.slowDuration : 0
      };
      this.gameState.projectiles.push(arrow);
      
      // ?? 敶瘨?
      player.rangerAmmo = (player.rangerAmmo || 1) - 1;
      player.rangerLastShotTime = now;
      if (player.rangerAmmo <= 0) {
        player.rangerAmmo = 0;
        player.rangerReloadUntil = now + (player.ammoReloadTime || 2000);
        this.addCombatLog(`暈眩結束了！`, playerId, 'status');
      }
      
      // ? 鋡怠?閮嚗?嗅???
      if (player.passive && player.passive.attacksNeeded) {
        player.effects.rangerPassiveCount = (player.effects.rangerPassiveCount || 0) + 1;
        if (player.effects.rangerPassiveCount >= player.passive.attacksNeeded) {
          player.effects.rangerPassiveCount = 0;
          player.effects.rangerSpeedBuff = now + player.passive.speedDuration;
          const playerSide = playerId;
          this.addCombatLog(`自然律動！移速+20%`, playerSide, 'status');
          this.addVisualEffect(player.position.x, player.position.y, 'speed_buff', '💨');
        }
      }
      return;
    }


    // Shamisen: Rhythm-based ranged note projectile
    if (player.id === 'shamisen') {
      const lastAttackTime = player.effects.shamisenLastAttackTime || 0;
      const timeDiff = now - lastAttackTime;
      const passive = player.passive;
      let isPerfectPitch = false;
      let isFourthBeat = false;
      let noteDamage = player.attackDamage;

      if (lastAttackTime > 0 && passive &&
          timeDiff >= passive.perfectWindow[0] && timeDiff <= passive.perfectWindow[1]) {
        isPerfectPitch = true;
        noteDamage = passive.perfectDamage;
        this.addVisualEffect(player.position.x, player.position.y - 50, 'perfect_pitch', '🎶');
        this.addCombatLog(player.name + ' 觸發完美絕對音律！', playerId, 'status');
        // Perfect pitch golden burst VFX
        if (typeof particleSystem !== 'undefined' && particleSystem) {
          // Golden flash ring expanding from player
          particleSystem.particles.push({
            x: player.position.x, y: player.position.y - 20,
            radius: 5,
            maxRadius: 50,
            expandSpeed: 100,
            color: '#FFD700',
            life: 400,
            maxLife: 400,
            alpha: 0.7,
            type: 'shamisen_wave_ring'
          });
          // Musical staff lines flash (5 horizontal lines)
          for (let l = 0; l < 5; l++) {
            particleSystem.particles.push({
              x: player.position.x - 30,
              y: player.position.y - 55 + l * 5,
              width: 60,
              color: '#FFD700',
              life: 500,
              maxLife: 500,
              alpha: 0.6,
              type: 'shamisen_staff_line'
            });
          }
          // Rising sparkle notes
          for (let i = 0; i < 6; i++) {
            particleSystem.particles.push({
              x: player.position.x + (Math.random() - 0.5) * 40,
              y: player.position.y - 10,
              vx: (Math.random() - 0.5) * 30,
              vy: -60 - Math.random() * 40,
              size: 14 + Math.random() * 8,
              color: '#FFD700',
              text: ['🎵', '🎶', '♪'][Math.floor(Math.random() * 3)],
              life: 600 + Math.random() * 300,
              maxLife: 900,
              alpha: 1,
              type: 'shamisen_note_trail'
            });
          }
        }
      }

      // Every fourth pluck is an accent beat. It intentionally uses a fixed
      // damage value instead of stacking with the timing-perfect multiplier.
      if (passive) {
        const attackCount = (player.effects.shamisenAttackCount || 0) + 1;
        player.effects.shamisenAttackCount = attackCount;
        if (attackCount % (passive.attacksNeeded || 4) === 0) {
          isFourthBeat = true;
          noteDamage = passive.fourthHitDamage || 5;
          this.addVisualEffect(player.position.x, player.position.y - 52, 'accent_beat', '♪');
          this.addCombatLog(`${player.name} 第四拍・重音！`, playerId, 'status');
        }
      }

      player.effects.shamisenLastAttackTime = now;

      // AoE: 200px 範圍音波傷害
      const dist = Math.abs(player.position.x - opponent.position.x);
      if (dist <= (player.attackRange || 200)) {
        const damageResult = this.dealDamage(opponent, noteDamage, playerId);
        if (damageResult && damageResult.hit) {
          if (isPerfectPitch && passive) {
            const kbDir = opponent.position.x > player.position.x ? 1 : -1;
            opponent.position.x += kbDir * (passive.perfectKnockback || 10);
            opponent.position.x = Math.max(80, Math.min(this.canvasWidth - 80, opponent.position.x));
          }
          if (isFourthBeat && passive) {
            opponent.effects.slowed = Math.max(
              opponent.effects.slowed || 0,
              now + (passive.fourthHitSlowDuration || 1000)
            );
            this.addVisualEffect(opponent.position.x, opponent.position.y - 40, 'slow', '♩');
            this.addCombatLog('重音命中：緩速30%（1秒）！', playerId, 'status');
          }
        }
      }

      // 音波擴散視覺效果
      if (typeof particleSystem !== 'undefined' && particleSystem) {
        particleSystem.particles.push({
          x: player.position.x, y: player.position.y - 20,
          radius: 5,
          maxRadius: 200,
          expandSpeed: 400,
          color: isPerfectPitch ? '#FFD700' : isFourthBeat ? '#FF7EB6' : 'rgba(200,200,255,1)',
          life: 300, maxLife: 300,
          alpha: 0.45,
          type: 'shamisen_wave_ring'
        });
      }
      return;
    }
    // ?? Check melee attack vs enemy minions (independent of opponent distance)
    this.checkMeleeHitMinions(player, playerId, player.attackDamage);
    
    // ???潮銋?嚗遛?餃??暸?餅?嚗?00px撠?嚗???鳴?
    if (player.id === 'azure_disciple') {
      const voltage = this.gameState.azureVoltage[playerId] || 0;
      if (voltage >= (player.passive?.maxVoltage || 100)) {
        const dischargeRange = player.passive?.dischargeRange || 200;
        const dist = Math.abs(player.position.x - opponent.position.x);
        if (dist <= dischargeRange && opponent.hp > 0) {
          // Consume voltage
          this.gameState.azureVoltage[playerId] = 0;
          const dmg = player.passive?.dischargeDamage || 10;
          const stunMs = player.passive?.dischargeStun || 800;
          const result = this.dealDamage(opponent, dmg, playerId);
          if (result.hit) {
            opponent.effects.stunned = Math.max(opponent.effects.stunned || 0, now + stunMs);
            this.addVisualEffect(opponent.position.x, opponent.position.y, 'stun', '💫');
            this.triggerCameraShake(5, 200);
            // Store discharge visual data for renderAzureExtras
            this.gameState.azureDischarge = {
              fromX: player.position.x, fromY: player.position.y - 25,
              toX: opponent.position.x, toY: opponent.position.y,
              startTime: now, duration: 300
            };
          }
          this.addCombatLog(`${player.name} 電壓釋放命中！`, playerId, 'damage');
          return; // Override normal attack entirely
        }
      }
    }
    
    // ? ??∪葦嚗??∠蝡??銝?閬擃蝭??改?
    let puppetAttacked = false;
    if (player.id === 'puppeteer') {
      const puppet = this.gameState.puppet[playerId];
      if (puppet && puppet.active) {
        const puppetDist = Math.abs(puppet.x - opponent.position.x);
        const puppetRange = (player.attackRange || 60) + 20;
        if (puppetDist <= puppetRange && opponent.hp > 0) {
          const puppetDmg = player.passive?.puppetAttackDamage || 3;
          const puppetHit = this.dealDamage(opponent, puppetDmg, playerId);
          if (puppetHit.hit) {
            puppet.storedDamage = (puppet.storedDamage || 0) + puppetDmg * (2 / 3);
          }
          this.addVisualEffect(puppet.x, puppet.y - 30, 'puppet_hit', '💥');
          this.addCombatLog('傀儡攻擊！', playerId, 'damage');
          puppetAttacked = true;
        }
      }
    }
    
    let isForgeFireThirdStrike = false;
    if (player.id === 'forgefire') {
      const attackCount = (player.effects.forgefireAttackCount || 0) + 1;
      player.effects.forgefireAttackCount = attackCount;
      isForgeFireThirdStrike = attackCount % (player.passive?.attacksNeeded || 3) === 0;
    }

    const distance = Math.abs(player.position.x - opponent.position.x);
    const meleeRange = this.getMeleeRange(player) + (isForgeFireThirdStrike ? (player.passive?.thirdStrikeRangeBonus || 80) : 0);
    const targetBonusRadius = Math.max(0, this.getCollisionRadius(opponent, 40) - 40);
    if (distance > meleeRange + targetBonusRadius) return;
    
    // ?爸 撌函??嚗?喳?????0.3蝘?蝯??瑕拿
    if (player.id === 'beastmaster' && player.isGolem) {
      const handPos = this.getGolemHandPosition(player);
      
      // 閮??格韏瑕???靘芋???思蝙??
      player.golemAttackStart = now;
      
      // ?格撘抒?閬死??
      this.gameState.effects.push({
        type: 'golem_swing',
        x: player.position.x,
        y: player.position.y,
        facing: player.facing,
        startTime: now,
        duration: 350
      });
      
      // ?⊿敺桅?
      this.triggerCameraShake(4, 150);
      
      // 0.3蝘?蝯??瑕拿
      const gameRef = this;
      const opponentRef = opponent;
      const attackerRef = player;
      const pid = playerId;
      setTimeout(() => {
        if (gameRef.gameState.winner || attackerRef.hp <= 0 || opponentRef.hp <= 0) return;
        const hitDist = Math.abs(attackerRef.position.x - opponentRef.position.x);
        const hitRange = gameRef.getMeleeRange(attackerRef);
        const hitBonus = Math.max(0, gameRef.getCollisionRadius(opponentRef, 40) - 40);
        if (hitDist > hitRange + hitBonus + 20) return; // 撠?撖砍捆
        
        let dmg = attackerRef.attackDamage;
        if (attackerRef.effects.counterAttack > Date.now()) {
          dmg += 5;
          gameRef.addVisualEffect(attackerRef.position.x, attackerRef.position.y, 'counter', '⚡');
          attackerRef.effects.counterAttack = 0;
        }
        
        const result = gameRef.dealDamage(opponentRef, dmg, pid);
        if (result.hit) {
          const side = pid === 'player1' ? 'player1' : 'player2';
          gameRef.addCombatLog(`${attackerRef.name} 被反擊命中！`, side, 'damage');
          gameRef.triggerCameraShake(6, 200);
          
          if (attackerRef.passive && attackerRef.passive.attackStun) {
            opponentRef.effects.stunned = Date.now() + attackerRef.passive.attackStun;
            gameRef.addVisualEffect(opponentRef.position.x, opponentRef.position.y, 'stun', '💫');
          }
        }
      }, 300);
      return;
    }
    
    let damage = player.attackDamage;

    if (isForgeFireThirdStrike) {
      damage = player.passive?.thirdStrikeDamage || 9;
      this.addVisualEffect(player.position.x + player.facing * 55, player.position.y - 25, 'fire_sword_wave', '🔥');
      this.addCombatLog(`${player.name} 第三擊火焰劍氣！`, playerId, 'skill');
    }
    
    // ??瘚芯犖?恥鋡怠?嚗??銵?- 2蝘?餅??脣蝝????銝活?格蝒??
    if (player.id === 'ronin' && player.passive) {
      const lastAttackTime = player.effects.roninLastAttackTime || 0;
      if (now - lastAttackTime >= player.passive.idleThreshold) {
        // Sheathed state triggered: mini-dash + bonus damage
        player.position.x += player.passive.dashDistance * player.facing;
        player.position.x = Math.max(80, Math.min(this.canvasWidth - 80, player.position.x));
        damage += player.passive.bonusDamage;
        this.addCombatLog(`${player.name} 納刀術觸發！追加${player.passive.bonusDamage}傷害！`, playerId === 'player1' ? 'player1' : 'player2', 'status');
        this.addVisualEffect(player.position.x, player.position.y, 'iaijutsu', '⚔️');

        if (typeof particleSystem !== 'undefined' && particleSystem && particleSystem.createFlashCutEffect) {
          particleSystem.createFlashCutEffect(player.position.x, player.position.y, player.facing);
        }
      }
      player.effects.roninLastAttackTime = now;
    }
    
    // 撗拍敹????撘瑕?
    if (player.effects.counterAttack > now) {
      damage += 5;
      this.addVisualEffect(player.position.x, player.position.y, 'counter', '⚡');
      player.effects.counterAttack = 0;
    }
    
    // ? 撗拍敹?餌????
    const damageResult = this.dealDamage(opponent, damage, playerId);

    // 蒼雷之徒：普攻命中才疊電壓層
    if (damageResult.hit && player.id === 'azure_disciple') {
      this.gameState.azureVoltage[playerId] = Math.min(
        (this.gameState.azureVoltage[playerId] || 0) + (player.passive?.voltagePerHit || 20),
        player.passive?.maxVoltage || 100
      );
    }
    
    // ?? 鋆捱????格???萎犖
    if (damageResult.hit && player.id === 'adjudicator') {
      const domain = this.gameState.adjudicatorDomain;
      if (domain && domain.ownerId === playerId) {
        const inDomain = Math.abs(opponent.position.x - domain.x) <= domain.radius;
        if (inDomain) {
          const knockupDuration = player.skills?.ultimate?.domainNormalKnockup || 400;
          opponent.effects.stunned = Math.max(opponent.effects.stunned || 0, now + knockupDuration);
          // ??閬死嚗?思???+ ?
          const knockDir = opponent.position.x >= player.position.x ? 1 : -1;
          opponent.position.x += knockDir * 60;
          opponent.position.x = Math.max(80, Math.min(this.canvasWidth - 80, opponent.position.x));
          opponent._knockupAnim = { startTime: now, duration: knockupDuration };
          this.addVisualEffect(opponent.position.x, opponent.position.y - 40, 'adjudicator_knockup', '⬆️');
          this.triggerCameraShake(5, 200);
          this.addCombatLog('最終判決擊飛！', playerId, 'damage');
        }
      }
    }
    
    // ?? Scorpion whip attack visual + passive tracking
    if (player.id === 'scorpion') {
      // ?餅??????
      const whipDir = Math.sign(opponent.position.x - player.position.x) || player.facing;
      player.facing = whipDir;
      player._whipAnim = { startTime: now, direction: whipDir };
    }
    
    if (damageResult.hit) {
      // ?? 瘛餃??桅????
      const playerSide = playerId === 'player1' ? 'player1' : 'player2';
      this.addCombatLog(`${player.name} 普攻命中！`, playerSide, 'damage');

      // ?? Scorpion passive: consecutiveHits counter
      if (player.id === 'scorpion' && player.passive) {
        this.gameState.scorpionConsecutiveHits[playerId] = (this.gameState.scorpionConsecutiveHits[playerId] || 0) + 1;
        const hits = this.gameState.scorpionConsecutiveHits[playerId];

        if (hits % player.passive.hitsRequired === 0) {
          // 4th hit ??Knockback + Slow + WhipHazard
          const kb = player.passive.knockbackDistance * player.facing * -1;
          opponent.position.x += kb;
          opponent.position.x = Math.max(80, Math.min(this.canvasWidth - 80, opponent.position.x));

          opponent.effects.slowed = now + player.passive.slowDuration;
          opponent.effects.slowPercent = player.passive.slowMultiplier;

          // Spawn WhipHazard at enemy position
          if (!this.gameState.hazards) this.gameState.hazards = [];
          this.gameState.hazards.push({
            x: opponent.position.x,
            y: opponent.position.y + 25,
            width: player.passive.hazardWidth,
            duration: player.passive.hazardDuration,
            damagePerTick: player.passive.hazardDamagePerTick,
            tickRate: player.passive.hazardTickRate,
            lastTickTime: now,
            createdAt: now,
            targetRef: opponent
          });

          this.addCombatLog(`毒蠍連鞭！擊退+減速+毒棘荊地！`, playerId, 'damage');
          this.addVisualEffect(opponent.position.x, opponent.position.y, 'scorpion_flurry', '🦂');
          this.triggerCameraShake(6, 250);
        }
      }
      
      if (player.passive && player.passive.attackStun) {
        // ? 撗拍敹?餅挾?貉??賂?蝚砌?銝?撣?蝘???
        this.gameState.rockAttackCount[playerId] = (this.gameState.rockAttackCount[playerId] || 0) + 1;
        const hitCount = this.gameState.rockAttackCount[playerId];
        const stunDuration = (hitCount >= 3) ? player.passive.attackStun3rd : player.passive.attackStun;
        if (hitCount >= 3) {
          this.gameState.rockAttackCount[playerId] = 0; // ?蔭畾菜
        }
        opponent.effects.stunned = now + stunDuration;
        const stunLabel = (hitCount >= 3) ? '??' : '?';
        this.addVisualEffect(opponent.position.x, opponent.position.y, 'stun', stunLabel);
        if (hitCount >= 3) {
          this.addCombatLog(`${player.name} 進入納刀狀態！下次攻擊附帶1秒暈眩！`, playerSide, 'status');
        } else {
          this.addCombatLog(`${player.name} 進入納刀狀態！`, playerSide, 'status');
        }
        
        // ? ?萄遣撗拇?拇??寞?
        if (typeof particleSystem !== 'undefined' && particleSystem && particleSystem.createRockStunEffect) {
          particleSystem.createRockStunEffect(opponent.position.x, opponent.position.y);
        }
        
      }
    }
  }

  // ?儭????脩戌 - ?啁??孵??折?蝳?
  startDefend(playerId) {
    const now = Date.now();
    const player = this.players[playerId];
    const defendState = this.gameState.defending[playerId];
    
    if (!player) return;
    
    // 瑼Ｘ?臬鋡怎???賣?銝?
    if (player.effects.stunned > now || player.effects.casting > now || player.effects.chainDisabled > now) return;
    
    // ?儭?瑼Ｘ?脩戌?瑕 (?脩戌蝯?敺?蝘?⊥??活?脩戌)
    if (now < defendState.cooldownUntil) {
      return;
    }
    
    // ?儭?雿輻閫?嗅???雿?脩戌?孵?
    const defendDirection = player.facing;
    
    // ???脩戌
    defendState.active = true;
    defendState.startTime = now;
    defendState.direction = defendDirection;
    
    // ?儭??剜?脩戌?
    this.playAnimation(player, 'defend');
    
    this.addVisualEffect(player.position.x, player.position.y, 'defend', '?儭?');
    
    // ?儭??萄遣?脩戌霅瑞蝎??寞?
    if (typeof particleSystem !== 'undefined' && particleSystem && particleSystem.createDefendShieldEffect) {
      particleSystem.createDefendShieldEffect(player.position.x, player.position.y, player.id);
    }
    
  }
  
  // ?儭??湔?脩戌?孵? (???脩戌???脣?質???
  updateDefendDirection(playerId) {
    const player = this.players[playerId];
    const defendState = this.gameState.defending[playerId];
    
    if (!defendState.active || !player) return;
    
    // ?儭??脩戌?孵?頝閫??霈?
    defendState.direction = player.facing;
  }
  
  // ?儭?蝯??脩戌
  endDefend(playerId) {
    const now = Date.now();
    const player = this.players[playerId];
    const defendState = this.gameState.defending[playerId];
    
    if (!defendState.active || !player) return;
    
    const defendDuration = now - defendState.startTime;
    
    // 蝯??脩戌
    defendState.active = false;
    
    // ?儭?閮剔蔭2蝘??
    defendState.cooldownUntil = now + 2000;
    
    // ?儭??敺??
    this.playAnimation(player, 'idle');
    
  }

  // ?儭?瑼Ｘ?拙振?臬甇??脩戌
  isPlayerDefending(playerId) {
    return this.gameState.defending[playerId].active;
  }

  setAIController(controller) {
    if (this.aiController && this.aiController !== controller && typeof this.aiController.destroy === 'function') {
      this.aiController.destroy();
    }

    this.aiController = controller || null;
  }

  isCpuControlled(playerId) {
    return Boolean(
      this.aiController &&
      this.aiController.enabled &&
      this.aiController.aiPlayerId === playerId
    );
  }
  
  // ?儭?瑼Ｘ?餅??臬鋡恍蝳行??(?孵??扳炎??
  isAttackBlocked(attackerId, targetId) {
    const defendState = this.gameState.defending[targetId];
    
    // ?格?瘝??券蝳?
    if (!defendState.active) return 'none';
    
    const attacker = this.players[attackerId];
    const target = this.players[targetId];
    
    if (!attacker || !target) return 'none';
    
    // 閮??餅?靘?
    const attackFromX = attacker.position.x - target.position.x;
    const attackDirection = attackFromX > 0 ? 1 : -1;
    
    // 瑼Ｘ?脩戌?孵??臬?????
    const blocked = defendState.direction === attackDirection;
    
    if (!blocked) {
      return 'none';
    }
    
    // ??蝘?蝢蝳佗??⊥+?嚗?銋??脣?摹?脩戌嚗摰單???嚗鋡急?嗥閫??
    const defendDuration = Date.now() - defendState.startTime;
    if (defendDuration <= 2000) {
      return 'perfect';
    } else {
      return 'weakened';
    }
  }

  useSkill(playerId, skillType) {
    const now = Date.now();
    const player = this.players[playerId];
    
    // 瑼Ｘ??賣?暺???
    if (!player || player.effects.stunned > now || player.effects.silenced > now || player.effects.chainDisabled > now || this.isPlayerDefending(playerId)) return;

    // ?儭?Exile Blade: block skill usage during execution
    if (player.isExecuting) return;

    // ? 擃?敹?撠???蝛箔葉??銝?交?
    const opponentId = playerId === 'player1' ? 'player2' : 'player1';
    const opponentPlayer = this.players[opponentId];
    if (player.id === 'taijutsu' && opponentPlayer && opponentPlayer._throwInterval) return;

    const selectedSkill = player.skills?.[skillType];
    if (!selectedSkill) return;

    // ?? 鋆捱????撠??菜雿宏/?祉宏???
    const domain = this.gameState.adjudicatorDomain;
    if (domain && playerId !== domain.ownerId) {
      const inDomain = Math.abs(player.position.x - domain.x) <= domain.radius;
      const mobilitySkills = [
        SKILL_CODES.WIND_DASH,
        SKILL_CODES.FIRE_RUSH,
        SKILL_CODES.THUNDER_STEP,
        SKILL_CODES.SHADOW_STRIKE,
        SKILL_CODES.STEALTH_DASH,
        SKILL_CODES.FLASH_CUT,
        SKILL_CODES.IAI_FLASH,
        SKILL_CODES.EXILE_GALE_DASH,
        SKILL_CODES.PHANTOM_SWAP
      ];

      if (inDomain && mobilitySkills.includes(selectedSkill.code)) {
        this.addCombatLog(`暈眩結束了！`, playerId, 'status');
        this.addVisualEffect(player.position.x, player.position.y - 30, 'adjudicator_lock', '⚖️');
        return;
      }
    }
    
    // 嚙?暺?蝒必鈭挾?嚗蔣摮??冽????敶勗?雿蔭
    if (
      skillType === 'normal' &&
      selectedSkill.code === SKILL_CODES.SHADOW_STRIKE &&
      this.gameState.shadowMimic[playerId]
    ) {
      const mimic = this.gameState.shadowMimic[playerId];
      if (now < mimic.expiresAt) {
        // ??啣蔣摮?蝵?
        const returnX = mimic.x;
        const returnY = mimic.y;
        player.position.x = returnX;
        player.position.y = returnY;
        this.addVisualEffect(player.position.x, player.position.y, 'shadow', '👤');
        this.addCombatLog(`${player.name} 影子回傳！`, playerId, 'skill');
        if (typeof particleSystem !== 'undefined' && particleSystem) {
          particleSystem.createShadowCloneEffect(player.position.x, player.position.y);
        }
        // 皜敶勗?
        this.gameState.shadowMimic[playerId] = null;
        // ???瑕
        this.cooldowns[playerId].normal = now;
        this.clearSkillReady(playerId, skillType);
        return;
      }
    }

    // 嚙踢?迎? ?◢?砌?畾菔蕭??蝒?批?甈⊥?銝?亥孛??
    if (
      skillType === 'ultimate' &&
      selectedSkill.code === SKILL_CODES.WIND_SLASH &&
      player.windSlashRecastUntil > now
    ) {
      this.executeWindSlashRecast(playerId);
      return;
    }

    // ?弩 擙株??琿? HP瘨炎??
    if (skillType === 'normal' && selectedSkill.code === SKILL_CODES.BLOOD_SHACKLES) {
      if (player.hp <= (selectedSkill.hpCost || 10)) {
        this.addCombatLog(`暈眩結束了！`, playerId, 'status');
        return;
      }
    }

    if (player.id === 'beastmaster') {
      if (skillType === 'ultimate' && !player.isGolem) {
        const needStacks = player.skills.ultimate.minStacksToCast || 4;
        if (player.beastStacks < needStacks) {
          this.addCombatLog(`巨獸解放：疊層不足！需要${needStacks}層！`, playerId, 'status');
          return;
        }
      }

      if (skillType === 'normal' && player.isGolem) {
        const needStacks = player.skills.ultimate.golemSkillCost || 1;
        if (player.beastStacks < needStacks) {
          this.addCombatLog('疊層不足！無法使用巨獸技能！', playerId, 'status');
          return;
        }
      }
    }
    
    // ? 蝎暸?摰風蝚虫?畾菜?憯頂蝯梧?頛芾?銝剔洵鈭活???湔蝣箄?嚗?瑼Ｘ?瑕
    if (skillType === 'normal' && player.effects.talismanState && player.effects.talismanState.phase === 'cycling') {
      this.executeSkill(playerId, selectedSkill);
      this.cooldowns[playerId][skillType] = now; // apply cooldown on confirm
      this.clearSkillReady(playerId, skillType);
      return;
    }
    
    if (now - this.cooldowns[playerId][skillType] < selectedSkill.cooldown) return;
    
    // ? 蝎暸?摰風蝚衣洵銝甈⊥?銝?銝???鳴???頛芾?
    if (skillType === 'normal' && selectedSkill.code === SKILL_CODES.ELF_TALISMAN) {
      this.clearSkillReady(playerId, skillType);
      this.executeSkill(playerId, selectedSkill);
      return;
    }
    
    this.cooldowns[playerId][skillType] = now;
    
    // ??皜??緝eady???
    this.clearSkillReady(playerId, skillType);
    
    this.executeSkill(playerId, selectedSkill);
  }

  // ? 靽桀儔嚗溶???渡? executeSkill ?寞?
  executeSkill(playerId, skill) {
    const player = this.players[playerId];
    const opponent = this.players[playerId === 'player1' ? 'player2' : 'player1'];
    const now = Date.now();
    
    
    // ?剜撠???賢???
    this.playSkillAnimation(player, skill.code);
    
    // ?萄遣??賜??
    if (typeof particleSystem !== 'undefined' && particleSystem) {
      particleSystem.createSkillEffect(skill.code, player.position.x, player.position.y, player.facing);
    }

    const isUltimateSkill = skill === player.skills?.ultimate;
    this.spawnCombatFlourish(isUltimateSkill ? 'ultimate' : 'skill', player, opponent, isUltimateSkill ? 1.45 : 1);

    const playerSide = playerId === 'player1' ? 'player1' : 'player2';  // ?? 蝣箏??拙振雿蔭
    
    // ? 銝??賊?鋡怠?嚗?銵??蝙?冽??賢??脣??賊?
    if (player.id === 'taijutsu' && player.passive) {
      player.effects.superArmor = now + player.passive.duration;
      this.addVisualEffect(player.position.x, player.position.y, 'super_armor', '?儭?');
      this.addCombatLog(`${player.name} 霸體激活！`, playerSide, 'status');
    }
    
    switch (skill.code) {
      case SKILL_CODES.ABYSS_TENTACLE: {
        this.addCombatLog(`${player.name} 使用 深淵觸手！`, playerSide, 'skill');

        const startX = player.position.x;
        const startY = player.position.y - 20;
        const targetXBeforePull = opponent.position.x;
        const targetY = opponent.position.y - 20;
        const pullDuration = skill.pullDuration || 400;

        const dx = opponent.position.x - player.position.x;
        const inFront = (dx === 0) || (Math.sign(dx) === player.facing);
        const inRange = Math.abs(dx) <= (skill.range || 300);

        this.gameState.effects.push({
          type: 'abyss_tentacle',
          startX,
          startY,
          endX: inRange ? targetXBeforePull : player.position.x + player.facing * (skill.range || 300),
          endY: targetY,
          startTime: now,
          duration: pullDuration
        });

        if (inFront && inRange) {
          const damageResult = this.dealDamageWithResult(opponent, skill.damage || 4, playerId);

          if (damageResult.hit) {
            this.startAbyssTentaclePull(
              opponent,
              targetXBeforePull,
              player.position.x,
              pullDuration,
              skill.pullStun || 300
            );

            const stackGain = skill.stackGain || 2;
            const maxStacks = player.passive?.maxStacks || 99;
            player.beastStacks = Math.min(maxStacks, (player.beastStacks || 0) + stackGain);

            this.addVisualEffect(opponent.position.x, opponent.position.y, 'stun', '💫');
            this.addCombatLog(`觸手命中敵人！獲得${stackGain}層御獸疊層！`, playerSide, 'status');
          }
        } else {
          this.addCombatLog('瘛望殿閫豢??芸銝?', playerSide, 'status');
        }
        break;
      }

      case SKILL_CODES.BOULDER_TOSS: {
        const stackCost = player.skills.ultimate.golemSkillCost || 1;
        if (player.beastStacks < stackCost) {
          this.addCombatLog('疊層不足！無法使用巨獸技能！', playerSide, 'status');
          this.cooldowns[playerId].normal = 0;
          break;
        }

        player.beastStacks = Math.max(0, player.beastStacks - stackCost);
        this.addCombatLog(`${player.name} 使用 投擲巨石！`, playerSide, 'skill');

        const targetX = opponent.position.x;
        const targetY = opponent.position.y + 30;
        const delay = player.skills.ultimate.golemSkillDelay || 700;
        const handPosition = this.getGolemHandPosition(player);

        this.gameState.effects.push({
          type: 'boulder_warning',
          x: targetX,
          y: targetY,
          radiusX: 60,
          radiusY: 18,
          startTime: now,
          duration: delay
        });

        this.gameState.effects.push({
          type: 'flying_boulder',
          startX: handPosition.x,
          startY: handPosition.y,
          endX: targetX,
          endY: targetY - 12,
          startTime: now,
          duration: delay,
          size: 18
        });

        setTimeout(() => {
          if (this.gameState.winner || player.hp <= 0 || opponent.hp <= 0) return;

          const aoe = player.skills.ultimate.golemSkillAoE || 120;
          const damage = player.skills.ultimate.golemSkillDamage || 13;
          const distanceToCenter = Math.abs(opponent.position.x - targetX);

          this.gameState.effects.push({
            type: 'boulder_impact',
            x: targetX,
            y: targetY,
            radius: aoe,
            startTime: Date.now(),
            duration: 350
          });

          if (distanceToCenter <= aoe) {
            this.dealDamage(opponent, damage, playerId);
            this.addCombatLog(`巨石命中！造成${damage}點傷害`, playerSide, 'damage');
          }

          this.triggerCameraShake(8, 220);
        }, delay);

        if (player.beastStacks <= 0) {
          this.revertBeastForm(player, playerId, true);
        }
        break;
      }

      case SKILL_CODES.BEAST_REVERT:
        this.revertBeastForm(player, playerId, true);
        break;

      case SKILL_CODES.BEAST_LIBERATION: {
        if (player.isGolem) {
          this.revertBeastForm(player, playerId, true);
          break;
        }

        const minStacks = skill.minStacksToCast || 4;
        const stackCost = skill.stacksCost || 2;
        if (player.beastStacks < minStacks) {
          this.addCombatLog(`御獸疊層不足！需要${minStacks}層！`, playerSide, 'status');
          this.cooldowns[playerId].ultimate = 0;
          break;
        }

        player.beastStacks = Math.max(0, player.beastStacks - stackCost);

        const ccDuration = skill.rootDuration || 2000;
        opponent.effects.rooted = now + ccDuration;
        opponent.effects.stunned = now + ccDuration;

        this.enterGolemForm(player, playerId);
        this.gameState.effects.push({
          type: 'golem_transform_rocks',
          x: player.position.x,
          y: player.position.y,
          startTime: now,
          duration: 1000
        });
        this.addVisualEffect(player.position.x, player.position.y, 'golem_transform', '🐉');
        this.addCombatLog('巨獸解放！定身敵人2秒！', playerSide, 'skill');
        break;
      }

      case SKILL_CODES.WIND_DASH:
        // ?暸◢??- 敹恍??輻宏??+ ?⊥
        this.addCombatLog(`${player.name} 雿輻 ?暸◢??`, playerSide, 'skill');
        const oldWindX = player.position.x;
        player.position.x += skill.distance * player.facing;
        player.position.x = Math.max(80, Math.min(this.canvasWidth - 80, player.position.x));
        player.effects.invulnerable = now + skill.invulnerable;
        player.effects.dashImmune = now + skill.invulnerable; // ?儭??暸◢?????∟???怎??璉??
        player.effects.feared = 0; // 皜?賡??
        
        // ? 靽桀儔嚗炎?亦忽?箏摰?
        const windDistance = Math.abs(player.position.x - opponent.position.x);
        const windPath = Math.abs(player.position.x - oldWindX);
        if (windDistance <= 60 && windPath > 60) {
          // ?急???雿蔭嚗蝙?孵??折蝳血摰迤蝣?
          const postWindX = player.position.x;
          player.position.x = oldWindX;
          this.dealDamage(opponent, skill.damage, playerId);
          player.position.x = postWindX;
          this.addVisualEffect(opponent.position.x, opponent.position.y, 'wind_pierce', '🌀');
          this.addCombatLog(`命中敵人！`, playerSide, 'damage');
        }
        
        this.addVisualEffect(player.position.x, player.position.y, 'wind', '💨');
        break;
        
      case SKILL_CODES.WIND_SLASH:
        // ? 靽桀儔嚗?憸冽摰?餅??文?
        this.addCombatLog(`${player.name} 雿輻 ?◢?穿?`, playerSide, 'skill');
        
        const slashDistance = Math.abs(player.position.x - opponent.position.x);
        
        if (slashDistance <= skill.range) {
          
          // ? ???瑕拿
          const damageResult = this.dealDamage(opponent, skill.damage, playerId);
          
          if (damageResult.hit) {
            // ? 閮????孵?
            const knockbackDirection = opponent.position.x > player.position.x ? 1 : -1;
            const targetX = opponent.position.x + (300 * knockbackDirection);
            
            
            // ? 瑼Ｘ葫?臬????
            if (targetX < 80 || targetX > this.canvasWidth - 80) {
              // ????
              const wallX = targetX < 80 ? 80 : this.canvasWidth - 80;
              opponent.position.x = wallX;
              opponent.effects.wallSlowed = now + 2000; // 皜?0%??2蝘?
              
              
              // ?萄遣??鋆??寞?
              if (typeof particleSystem !== 'undefined' && particleSystem) {
                particleSystem.createEarthquakeWallImpactEffect(wallX, opponent.position.y, knockbackDirection);
              }
              
              this.addVisualEffect(opponent.position.x, opponent.position.y, 'wallimpact', '💥');
            } else {
              // 甇?虜??
              opponent.position.x = targetX;
            }
            
            // 閬死?寞?
            this.addVisualEffect(player.position.x, player.position.y, 'windslash', '🌪️');
            this.addVisualEffect(opponent.position.x, opponent.position.y, 'knockback', '💥');
            
            // ????
            if (typeof particleSystem !== 'undefined' && particleSystem) {
              particleSystem.createScreenShake(8, 300);
            }
            
            // ?儭??鈭挾餈賣?蝒
            player.windSlashRecastUntil = now + (skill.recastWindow || 3000);
          }
        } else {
        }
        break;
        
      case SKILL_CODES.FIRE_RUSH:
        // ??銵
        this.addCombatLog(`${player.name} 使用 爆炎衝刺！`, playerSide, 'skill');
        const oldX = player.position.x;
        let hitTarget = false;
        
        player.position.x += skill.distance * player.facing;
        player.position.x = Math.max(80, Math.min(this.canvasWidth - 80, player.position.x));
        
        // ? 靽桀儔嚗炎?交璇??箄楝敺???暺?
        // ?亙??韏琿???暺????怠捆撌殷?嚗??函?暺?餈??賜??賭葉
        const rushMinX = Math.min(oldX, player.position.x) - 40;
        const rushMaxX = Math.max(oldX, player.position.x) + 40;
        const opX = opponent.position.x;
        const inPath = opX >= rushMinX && opX <= rushMaxX;
        const yClose = Math.abs(player.position.y - opponent.position.y) <= 80;
        
        if (inPath && yClose) {
          // ?急???雿蔭嚗蝙?孵??折蝳血摰迤蝣?
          const postRushX = player.position.x;
          player.position.x = oldX;
          const damageResult = this.dealDamageWithResult(opponent, skill.damage, playerId);
          player.position.x = postRushX;
          
          if (damageResult.hit) {
            this.addCombatLog(`?賭葉銝衣??`, playerSide, 'status');
            opponent.effects.stunned = now + skill.stun;
            
            // ? ?拇??寞?
            if (typeof particleSystem !== 'undefined' && particleSystem) {
              particleSystem.createStunEffect(opponent.position.x, opponent.position.y);
            }
            
            this.addVisualEffect(opponent.position.x, opponent.position.y, 'fire', '🔥');
            this.addVisualEffect(opponent.position.x, opponent.position.y, 'stun', '💫');
            
            if (skill.applyMark && player.passive) {
              opponent.effects.flameMark = now + player.passive.markDuration;
              this.addVisualEffect(opponent.position.x, opponent.position.y, 'flame_mark', '🔥');
            }
            
            this.cooldowns[playerId].normal = now - skill.cooldown + 3000;
            hitTarget = true;
          }
        }
        
        if (!hitTarget) {
          // ? ?芸銝剜???唳????
          if (typeof particleSystem !== 'undefined' && particleSystem) {
            // 畾??怎
            for (let i = 0; i < 12; i++) {
              particleSystem.particles.push({
                x: player.position.x + (Math.random() - 0.5) * 40,
                y: player.position.y + (Math.random() - 0.5) * 30,
                vx: (Math.random() - 0.5) * 60,
                vy: -40 - Math.random() * 60,
                size: 3 + Math.random() * 4,
                color: '#FF6347',
                life: 1000,
                maxLife: 1000,
                alpha: 0.7,
                type: 'lingering_fire'
              });
            }
            
            // ???
            for (let i = 0; i < 8; i++) {
              particleSystem.particles.push({
                x: player.position.x,
                y: player.position.y,
                vx: (Math.random() - 0.5) * 40,
                vy: -30 - Math.random() * 40,
                size: 10 + Math.random() * 10,
                color: `rgba(80, 80, 80, 0.5)`,
                life: 1500,
                maxLife: 1500,
                alpha: 0.6,
                type: 'smoke_miss'
              });
            }
          }
          
          this.cooldowns[playerId].normal = now - skill.cooldown + 10000;
        }
        break;
        
      case SKILL_CODES.FIRE_BALL:
        this.createProjectile(player, skill, 'fireball');
        break;

      case SKILL_CODES.FORGE_FIRE_SPIN: {
        this.addCombatLog(`${player.name} 使用 烈火旋斬！`, playerSide, 'skill');
        player.position.x += (skill.distance || 60) * player.facing;
        player.position.x = Math.max(80, Math.min(this.canvasWidth - 80, player.position.x));

        const distance = Math.abs(player.position.x - opponent.position.x);
        if (distance <= (skill.range || 130)) {
          const hit = this.dealDamage(opponent, skill.damage || 11, playerId);
          if (hit.hit) {
            const knockDirection = Math.sign(opponent.position.x - player.position.x) || player.facing;
            opponent.position.x += knockDirection * (skill.knockback || 80);
            opponent.position.x = Math.max(80, Math.min(this.canvasWidth - 80, opponent.position.x));
            this.addCombatLog(`烈火旋斬命中！擊退 ${skill.knockback || 80}px`, playerSide, 'damage');
          }
        }
        this.addVisualEffect(player.position.x, player.position.y - 18, 'fire_spin', '🔥');
        this.triggerCameraShake(5, 180);
        break;
      }

      case SKILL_CODES.FLAME_GOD_BLADE: {
        const chargeTime = skill.chargeTime || 700;
        player.effects.casting = now + chargeTime;
        this.addCombatLog(`${player.name} 正在蓄力 炎神巨刃！`, playerSide, 'status');
        this.addVisualEffect(player.position.x, player.position.y - 42, 'fire_charge', '🔥');

        setTimeout(() => {
          if (this.gameState.winner || player.hp <= 0 || opponent.hp <= 0 || player.effects.stunned > Date.now()) return;

          player.effects.casting = 0;
          const strikeRange = skill.range || 400;
          const forwardDistance = (opponent.position.x - player.position.x) * player.facing;
          if (forwardDistance >= -20 && forwardDistance <= strikeRange) {
            const hit = this.dealDamage(opponent, skill.damage || 22, playerId);
            if (hit.hit) {
              opponent.position.x += player.facing * (skill.knockback || 150);
              opponent.position.x = Math.max(80, Math.min(this.canvasWidth - 80, opponent.position.x));
              this.addCombatLog(`炎神巨刃命中！造成 ${skill.damage || 22} 傷害`, playerSide, 'damage');
            }
          }

          this.gameState.hazards.push({
            type: 'fire_trail',
            x: player.position.x + player.facing * (strikeRange / 2),
            y: player.position.y + 27,
            width: strikeRange,
            duration: skill.trailDuration || 3000,
            damagePerTick: skill.trailDamage || 2,
            tickRate: skill.trailTickRate || 1000,
            lastTickTime: Date.now(),
            createdAt: Date.now(),
            targetRef: opponent
          });
          this.addVisualEffect(player.position.x + player.facing * 100, player.position.y - 30, 'flame_god_blade', '🗡️');
          this.triggerCameraShake(10, 320);
        }, chargeTime);
        break;
      }

      case SKILL_CODES.WATER_SHIELD:
        // ?? 瘞游???- ?ˊ??
        this.addCombatLog(`${player.name} 雿輻 瘞游??橘?`, playerSide, 'skill');
        player.effects.shielded = now + skill.duration;
        player.effects.speedBoost = now + skill.duration;
        player.effects.waterShieldActive = now + skill.duration;
        
        // 嚙????摰喳摮?
        player.waterShieldStoredDamage = 0;
        
        this.addVisualEffect(player.position.x, player.position.y, 'water', '?儭?');
        
        // ?? 瘞游??曄???????+ ?儔
        setTimeout(() => {
          // 閮??儔??(60%?脣??瑕拿)
          const healAmount = Math.floor((player.waterShieldStoredDamage || 0) * skill.healPercent);
          const now2 = Date.now();
          const effectiveHeal = (player.effects.healReduction > now2) ? Math.floor(healAmount * (1 - (player.effects.healReductionPercent || 0))) : healAmount;
          
          if (effectiveHeal > 0 && player.hp > 0) {
            player.hp = Math.min(player.maxHp, player.hp + effectiveHeal);
            this.addDamageNumber(player.position.x, player.position.y, effectiveHeal, 'heal');
            this.addCombatLog(`水幕盾吸收結算！回復 ${effectiveHeal} HP`, playerSide, 'heal');
          }
          
          // 瘞渡????寞?
          if (typeof particleSystem !== 'undefined' && particleSystem) {
            particleSystem.createWaterShieldEndEffect(player.position.x, player.position.y);
          }
          
          // 皜?脣??瑕拿
          player.waterShieldStoredDamage = 0;
        }, skill.duration);
        break;
        
      case SKILL_CODES.WATER_DRAGON:
        // 瘞湧?敶?
        this.addCombatLog(`${player.name} 雿輻 瘞湧?敶?`, playerSide, 'skill');
        this.createProjectile(player, skill, 'waterdragon');
        break;
        
      case SKILL_CODES.THUNDER_STEP:
        // ???甇?
        this.addCombatLog(`${player.name} 雿輻 ?甇伐?`, playerSide, 'skill');
        const oldThunderX = player.position.x;
        const targetX = opponent.position.x + (60 * -opponent.facing);
        player.position.x = Math.max(80, Math.min(this.canvasWidth - 80, targetX));
        player.effects.invulnerable = now + skill.invulnerable;
        
        // ???Ｗ????
        this.gameState.screenFlash = {
          startTime: now,
          duration: 150,  // ???150瘥怎?
          maxAlpha: 0.9   // ?憭找???摨?
        };
        
        // ???萄遣?畾蔣
        if (typeof particleSystem !== 'undefined' && particleSystem) {
          particleSystem.createThunderAfterimagEffect(oldThunderX, player.position.y, player.position.x, player.position.y);
          particleSystem.createThunderGroundMarkEffect(player.position.x, player.position.y);
        }
        
        this.addVisualEffect(player.position.x, player.position.y, 'thunder', '⚡');
        break;
        
      case SKILL_CODES.THUNDER_PUNCH:
        // ???琿??
        this.addCombatLog(`${player.name} 雿輻 ?琿?喉?`, playerSide, 'skill');
        // 憿舐內蝭??內??
        this.gameState.effects.push({
          x: player.position.x,
          y: player.position.y,
          maxRadius: 150,
          color: '#FFEB3B',
          duration: 600,
          type: 'range_indicator',
          startTime: Date.now()
        });
        this.executeThunderPunch(player, opponent, skill, playerSide, playerId);
        break;
        
      case SKILL_CODES.ROCK_GUARD:
        // ? 撗拙?霅琿?
        this.addCombatLog(`${player.name} 使用 岩壁護體！`, playerSide, 'skill');
        player.effects.blocking = now + skill.duration;
        this.addVisualEffect(player.position.x, player.position.y, 'earth', '?');
        
        // ? ??賜????剜撗拍蝣??寞?
        setTimeout(() => {
          if (typeof particleSystem !== 'undefined' && particleSystem && particleSystem.createRockShatterEffect) {
            particleSystem.createRockShatterEffect(player.position.x, player.position.y);
          }
          this.addVisualEffect(player.position.x, player.position.y, 'rock_shatter', '💥');
        }, skill.duration);
        break;
        
      case SKILL_CODES.EARTH_QUAKE:
        // ? ?啗???- 摰撖衣
        
        const quakeDistance = Math.abs(player.position.x - opponent.position.x);
        const innerRange = skill.innerRange || 100;
        const outerRange = skill.outerRange || 200;
        
        // 蝡?萄遣摰?寞?
        if (typeof particleSystem !== 'undefined' && particleSystem) {
          particleSystem.createGroundCrackEffect(player.position.x, player.position.y);
        }
        
        // ?文??瑕拿????
        if (quakeDistance <= outerRange) {
          let damage = 0;
          let stunDuration = skill.outerStun || 1000;
          
          if (quakeDistance <= innerRange) {
            // ?批???
            damage = skill.innerDamage || 15;
            stunDuration = skill.innerStun || 1500;
            this.addVisualEffect(opponent.position.x, opponent.position.y, 'inner_quake', '💥');
          } else {
            // 憭??? - 瘝?
            opponent.effects.silenced = now + (skill.silenceDuration || 2000);
            this.addVisualEffect(opponent.position.x, opponent.position.y, 'silenced', '🤐');
          }
          
          // ???瑕拿
          if (damage > 0) {
            const damageResult = this.dealDamage(opponent, damage, playerId);
          }
          
          // ?拇???
          opponent.effects.stunned = now + stunDuration;
          this.addVisualEffect(opponent.position.x, opponent.position.y, 'stun', '💫');
          
          // ???
          const knockbackDirection = opponent.position.x > player.position.x ? 1 : -1;
          const targetX = opponent.position.x + (skill.knockback || 50) * knockbackDirection;
          
          // 瑼Ｘ葫??
          if (targetX < 80 || targetX > this.canvasWidth - 80) {
            const wallX = targetX < 80 ? 80 : this.canvasWidth - 80;
            opponent.position.x = wallX;
            
            // ? ?萄遣??蝣?寞?
            if (typeof particleSystem !== 'undefined' && particleSystem && particleSystem.createEarthquakeWallImpactEffect) {
              particleSystem.createEarthquakeWallImpactEffect(wallX, opponent.position.y, knockbackDirection);
            }
            
            this.addVisualEffect(wallX, opponent.position.y, 'wall_impact', '💥');
          } else {
            opponent.position.x = targetX;
          }
          
        }
        
        this.addVisualEffect(player.position.x, player.position.y, 'earthquake', '💥');
        break;
        
      case SKILL_CODES.SHADOW_STRIKE: {
        // ?? 暺?蝒必 ???典??啁?銝蔣摮?頨恬??拙振敺?蝘?00px嚗蔣摮芋隞輻摰嗅?雿?
        this.addCombatLog(`${player.name} 使用 黑刃突襲！`, playerSide, 'skill');
        
        const shadowDuration = skill.shadowDuration || 3000;
        const dmgRatio = skill.shadowDmgRatio || (2 / 3);
        
        // ?????蝵桐??箏蔣摮暺?
        const shadowX = player.position.x;
        const shadowY = player.position.y;
        
        // ?典??啁?銝蔣摮?頨?
        this.gameState.shadowMimic[playerId] = {
          x: shadowX,
          y: shadowY,
          facing: player.facing,
          createdAt: now,
          expiresAt: now + shadowDuration,
          dmgRatio: dmgRatio,
          attackCooldown: 0,
          opacity: 0.7,
          lastSkillCode: null
        };
        
        this.addVisualEffect(shadowX, shadowY, 'shadow', '👤');
        if (typeof particleSystem !== 'undefined' && particleSystem) {
          particleSystem.createShadowCloneEffect(shadowX, shadowY);
        }
        
        // ?拙振敺?蝘?00px嚗????嚗?
        const dashDist = skill.dashDistance || 300;
        const newX = Math.max(80, Math.min(this.canvasWidth - 80, player.position.x + player.facing * dashDist));
        player.position.x = newX;

        // The dash itself is an attack. A successful counter arms one guaranteed
        // critical Black Blade Strike, otherwise the configured crit chance applies.
        const pathStart = Math.min(shadowX, newX);
        const pathEnd = Math.max(shadowX, newX);
        const hitRadius = this.getCollisionRadius ? this.getCollisionRadius(opponent, 30) : 30;
        const hitsOpponent = opponent.hp > 0 &&
          opponent.position.x + hitRadius >= pathStart &&
          opponent.position.x - hitRadius <= pathEnd &&
          Math.abs(player.position.y - opponent.position.y) <= 60;
        if (hitsOpponent) {
          const guaranteedCrit = player.effects.guaranteedCrit > now;
          const isCritical = guaranteedCrit || Math.random() < (skill.critChance || 0);
          const damage = (skill.damage || 0) + (isCritical ? (skill.critDamage || 0) : 0);
          if (guaranteedCrit) player.effects.guaranteedCrit = 0;
          const result = this.dealDamageWithResult(opponent, damage, playerId);
          if (result.hit) {
            this.addDamageNumber(opponent.position.x, opponent.position.y - 35, damage, isCritical ? 'critical' : 'skill');
            this.addCombatLog(isCritical ? '黑刃突襲暴擊！' : '黑刃突襲命中！', playerSide, 'damage');
          }
        }
        
        this.addVisualEffect(player.position.x, player.position.y, 'shadow_dash', '💨');
        if (typeof particleSystem !== 'undefined' && particleSystem) {
          particleSystem.createWindDashEffect(player.position.x, player.position.y, player.facing);
        }
        
        this.addCombatLog(`?祉宏?喳??對?3蝘??F?敶勗?雿蔭`, playerSide, 'status');
        break;
      }
        
      case SKILL_CODES.SHADOW_CLONE:
        // ?? 敶勗?頨?- ?ˊ???砍?5??頨?
        this.addCombatLog(`${player.name} 雿輻 敶勗?頨恬?`, playerSide, 'skill');
        
        // 皜??頨?
        this.gameState.shadowClones[playerId] = [];
        
        // ?萄遣5??頨恬?瘥??0.14蝘郊?箇
        const cloneCount = skill.cloneCount || 5;
        const spawnDelay = skill.spawnDelay || 100;
        
        for (let i = 0; i < cloneCount; i++) {
          const angle = (Math.PI * 2 / cloneCount) * i;
          const radius = 80;
          
          const clone = {
            x: opponent.position.x + Math.cos(angle) * radius,
            y: opponent.position.y + Math.sin(angle) * radius - 50,
            facing: opponent.position.x >= player.position.x ? 1 : -1,
            opacity: 0,
            spawnAt: now + spawnDelay,
            spawned: false,
            createdAt: now,
            expiresAt: now + spawnDelay + skill.duration,
            attackCooldown: now + spawnDelay,
            index: i
          };
          
          this.gameState.shadowClones[playerId].push(clone);
        }
        
        // ?儭??之敺??喳隞交?鳴??蔭?餅??瑕
        this.cooldowns[playerId].attack = 0;
        
        // ?萄遣?砍??寞?
        this.addVisualEffect(player.position.x, player.position.y, 'shadowclone', '👥');
        if (typeof particleSystem !== 'undefined' && particleSystem) {
          particleSystem.createShadowCloneEffect(player.position.x, player.position.y);
        }
        
        this.addCombatLog(`召喚${cloneCount}個影分身！`, playerSide, 'skill');
        break;
        
      case SKILL_CODES.SPIRIT_BOMB:
        // ??蝚?
        this.createProjectile(player, skill, 'spiritbomb');
        break;
        
      case SKILL_CODES.SPIRIT_JUDGMENT: {
        // ?予撖拙 - ?芰??嚗?雿??嚗??澆?嚗?蝘2.5蝘?
        const maxCharge = skill.maxChargeTime || 2500;
        player.effects.casting = now + maxCharge;
        player.spiritChargeStart = now;
        
        this.addVisualEffect(player.position.x, player.position.y, 'judgment_cast', '👁️');
        this.addCombatLog(`正在蓄力..`, playerSide, 'status');
        
        this.gameState.effects.push({
          x: player.position.x,
          y: player.position.y,
          radius: 0,
          maxRadius: skill.range,
          color: '#FFD700',
          duration: maxCharge,
          type: 'judgment_indicator',
          startTime: now,
          casterKey: playerSide
        });
        
        // 2.5蝘撘瑕?澆?
        player.spiritChargeTimer = setTimeout(() => {
          if (player.spiritChargeStart) {
            this.fireJudgment(playerId);
          }
        }, maxCharge);
        break;
      }
        
      case SKILL_CODES.VENOM_DART:
        // ?? 瘥 - ??????
        this.addCombatLog(`${player.name} 使用 毒鏢！`, playerSide, 'skill');
        this.createProjectile(player, skill, 'venomdart');
        break;
        
      case SKILL_CODES.THORN_TRAP:
        // ? ???琿 - ?刻銝?蝵桅敶ａ??
        this.addCombatLog(`${player.name} 佈置 荊棘陷阱！`, playerSide, 'skill');
        
        // ????梢??
        if (!this.gameState.traps) this.gameState.traps = [];
        
        const trap = {
          x: player.position.x,
          y: player.position.y,
          owner: player,
          ownerId: playerId,
          rootDuration: skill.rootDuration,
          buffedDartDamage: skill.buffedDartDamage,
          createdAt: now,
          expiresAt: now + 30000, // 30蝘???
          triggered: false,
          triggerRadius: 50
        };
        this.gameState.traps.push(trap);
        
        // ?撘瑕?瘥???
        player.effects.buffedDart = now + 30000;
        
        this.addVisualEffect(player.position.x, player.position.y, 'trap', '💥');
        break;
        
      case SKILL_CODES.SAVAGE_SUPLEX:
        // ? ??誘??- 銵???
        this.addCombatLog(`${player.name} 雿輻 ??誘??`, playerSide, 'skill');
        this.executeSavageSuplex(player, opponent, skill, playerSide);
        // 擃?敹??賢?瘝?0.3蝘?
        player.effects.silenced = now + 300;
        break;
        
      case SKILL_CODES.ROYAL_EXECUTION:
        // ?? ????畾?- 餈?捱
        this.addCombatLog(`${player.name} 雿輻 ????畾綽?`, playerSide, 'skill');
        this.executeRoyalExecution(player, opponent, skill, playerSide);
        // 擃?敹??賢?瘝?0.3蝘?
        player.effects.silenced = now + 300;
        break;

      case SKILL_CODES.ELF_TALISMAN:
        // ? 蝎暸?摰風蝚?- ?寞??嗅??詨?憿瞈瘣餃?????
        this.executeElfTalisman(player, opponent, skill, playerSide, playerId);
        break;

      case SKILL_CODES.STEALTH_DASH:
        // ? ?恍銵?- ?梯澈蝒?+ ?蔭??? + 撘瑕?銝???+ ?駁???
        this.executeStealthDash(player, opponent, skill, playerSide, playerId);
        break;

      case SKILL_CODES.BLOOD_SHACKLES:
        // ?弩 擙株??琿? - 瘨P?澆?銵??撠
        this.executeBloodShackles(player, opponent, skill, playerSide, playerId);
        break;

      case SKILL_CODES.BLOOD_DEVOUR:
        // ?? 銵????- 撘瑕??詨???
        this.executeBloodDevour(player, opponent, skill, playerSide, playerId);
        break;

      case SKILL_CODES.FLASH_CUT:
        // ???砍蔣??- 蝛輸???00px + 皜?
        this.addCombatLog(`${player.name} 雿輻 ?砍蔣?穿?`, playerSide, 'skill');
        this.executeFlashCut(player, opponent, skill, playerSide, playerId);
        break;

      case SKILL_CODES.IAI_FLASH:
        // ?? 撅?繚銝??- ?祉宏?唾?敺?+ 撌券??瑕拿
        this.addCombatLog(`${player.name} 雿輻 撅?繚銝??`, playerSide, 'skill');
        this.executeIaiFlash(player, opponent, skill, playerSide, playerId);
        break;

      // ?? Scorpion skills
      case SKILL_CODES.REBEL_MINION:
      case SKILL_CODES.CHAIN_OF_PAIN:
        this.executeScorpionSkill(playerId, skill.code);
        break;

      // ?? Adjudicator skills
      case SKILL_CODES.OBJECTION_PARRY:
        this.addCombatLog(`${player.name} 使用 異議駁回！`, playerSide, 'skill');
        this.executeObjectionParry(player, opponent, skill, playerSide, playerId);
        break;

      case SKILL_CODES.FINAL_VERDICT:
        this.addCombatLog(`${player.name} ???蝯瘙綽?`, playerSide, 'skill');
        this.executeFinalVerdict(player, opponent, skill, playerSide, playerId);
        break;

      // ??? Exile Blade Skills ???
      case SKILL_CODES.EXILE_GALE_DASH:
        this.addCombatLog(`${player.name} 使用 絕風裂空突！`, playerSide, 'skill');
        this.executeExileGaleDash(player, opponent, skill, playerSide, playerId);
        break;

      case SKILL_CODES.STORM_EXECUTION:
        this.addCombatLog(`${player.name} 使用 狂風百裂！`, playerSide, 'skill');
        this.executeStormExecution(player, opponent, skill, playerSide, playerId);
        break;

      // ??? Puppeteer Skills ???
      case SKILL_CODES.PUPPET_DEPLOY:
        this.executePuppetDeploy(player, opponent, skill, playerSide, playerId);
        break;

      case SKILL_CODES.PHANTOM_SWAP:
        this.addCombatLog(`${player.name} 使用 幻影交錯！`, playerSide, 'skill');
        this.executePhantomSwap(player, opponent, skill, playerSide, playerId);
        break;

      // ??? Azure Disciple Skills ???
      case SKILL_CODES.DIVINE_SMITE:
        this.addCombatLog(`${player.name} 雿輻 ?琿??餃予蝵堆?`, playerSide, 'skill');
        this.executeDivineSmite(player, opponent, skill, playerSide, playerId);
        break;

      case SKILL_CODES.GRAND_THUNDER_SLASH:
        this.addCombatLog(`${player.name} 雿輻 蝘尼蝢押?祇?潛往?穿?`, playerSide, 'skill');
        this.executeGrandThunderSlash(player, opponent, skill, playerSide, playerId);
        break;
        
            // *** Shamisen Skills ***
      case SKILL_CODES.STACCATO_STRIKE:
        this.addCombatLog(player.name + ' 使用 撥弦・破音！', playerSide, 'skill');
        this.executeStaccatoStrike(player, opponent, skill, playerSide, playerId);
        break;

      case SKILL_CODES.DEADLY_CANON:
        this.addCombatLog(player.name + ' 使用 秘曲・輪唱殺陣！', playerSide, 'skill');
        this.executeDeadlyCanon(player, opponent, skill, playerSide, playerId);
        break;

      default:
        console.warn(`?芸祕?曄???賭誨蝣? ${skill.code}`);
    }
    
  }

  executeObjectionParry(player, opponent, skill, playerSide, playerId) {
    const now = Date.now();
    const duration = skill.parryDuration || 800;

    player.effects.parryActive = now + duration;
    player.effects.casting = now + duration;

    this.addVisualEffect(player.position.x, player.position.y - 30, 'adjudicator_parry', '🛡️');
    this.addCombatLog(`${player.name} 進入招架狀態！`, playerSide, 'status');

    if (typeof particleSystem !== 'undefined' && particleSystem && particleSystem.createShieldEffect) {
      particleSystem.createShieldEffect(player.position.x, player.position.y);
    }
  }

  executeFinalVerdict(player, opponent, skill, playerSide, playerId) {
    const now = Date.now();
    const radius = skill.domainRadius || 250;
    const duration = skill.domainDuration || 6000;
    const entryDamage = skill.domainEntryDamage || 5;
    const opponentId = playerId === 'player1' ? 'player2' : 'player1';

    this.gameState.adjudicatorDomain = {
      ownerId: playerId,
      x: player.position.x,
      radius,
      duration,
      expiresAt: now + duration,
      entryDamage,
      insideState: {
        player1: false,
        player2: false
      }
    };

    this.addCombatLog(`${player.name} 撅??蝯瘙粹???`, playerSide, 'skill');
    this.addVisualEffect(player.position.x, player.position.y - 45, 'adjudicator_domain', '⚖️');

    // ??蟡??蝎??寞?
    if (typeof particleSystem !== 'undefined' && particleSystem) {
      // ???摮???
      for (let i = 0; i < 40; i++) {
        const angle = (Math.PI * 2 / 40) * i;
        const speed = 80 + Math.random() * 120;
        particleSystem.particles.push({
          x: player.position.x,
          y: player.position.y - 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed * 0.5 - 30,
          size: 3 + Math.random() * 4,
          color: Math.random() > 0.3 ? '#FFD700' : '#FFFDE7',
          life: 1200 + Math.random() * 600,
          maxLife: 1800,
          alpha: 1,
          type: 'spark'
        });
      }
      // 銝????梁?摮?
      for (let i = 0; i < 15; i++) {
        particleSystem.particles.push({
          x: player.position.x + (Math.random() - 0.5) * 60,
          y: player.position.y + 20,
          vx: (Math.random() - 0.5) * 10,
          vy: -100 - Math.random() * 80,
          size: 2 + Math.random() * 3,
          color: '#FFFDE7',
          life: 800 + Math.random() * 500,
          maxLife: 1300,
          alpha: 1,
          type: 'spark'
        });
      }
    }

    if (opponent && opponent.hp > 0 && Math.abs(opponent.position.x - player.position.x) <= radius) {
      this.dealDamageWithResult(opponent, entryDamage, playerId);
      this.gameState.adjudicatorDomain.insideState[opponentId] = true;
      // ?? ?之?祇??湔?鋆捱?澈銝?
      opponent.position.x = player.position.x;
      opponent.position.x = Math.max(80, Math.min(this.canvasWidth - 80, opponent.position.x));
      this.addCombatLog('最終判決命中！', playerId, 'damage');
    }
  }

  // ??? Exile Blade: Severing Gale Dash (蝯◢?餉?蝛箇?) ???
  executeExileGaleDash(player, opponent, skill, playerSide, playerId) {
    const now = Date.now();
    const startX = player.position.x;
    const dashDist = skill.dashDistance || 180;

    // Instant horizontal dash
    player.position.x += player.facing * dashDist;
    player.position.x = Math.max(80, Math.min(this.canvasWidth - 80, player.position.x));

    const endX = player.position.x;
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);

    // Collision: check if enemy hitbox intersects the dash path line
    const enemyX = opponent.position.x;
    const hitboxRadius = this.getCollisionRadius ? this.getCollisionRadius(opponent, 30) : 30;
    const enemyLeft = enemyX - hitboxRadius;
    const enemyRight = enemyX + hitboxRadius;
    const verticalDist = Math.abs(player.position.y - opponent.position.y);
    const pathIntersects = enemyRight >= minX && enemyLeft <= maxX && verticalDist < 60;

    if (pathIntersects && opponent.hp > 0) {
      // ?急????啗??箏?雿蔭嚗蝙?孵??折蝳血摰迤蝣綽??血?蝛輯?敺???頧?
      const postDashX = player.position.x;
      player.position.x = startX;
      const dmgResult = this.dealDamageWithResult(opponent, skill.damage || 12, playerId);
      player.position.x = postDashX;
      if (dmgResult.hit) {
        // Apply 500ms stun
        opponent.effects.stunned = Math.max(opponent.effects.stunned || 0, now + (skill.stunDuration || 500));
        this.addVisualEffect(opponent.position.x, opponent.position.y, 'stun', '💫');
        this.addCombatLog(`命中敵人！`, playerSide, 'damage');
        this.triggerCameraShake(6, 200);
      }
    } else {
      this.addCombatLog('鋆征蝒?賭葉', playerSide, 'status');
    }

    // Visual: dark-cyan horizontal motion blur slash effect
    this.gameState.effects.push({
      type: 'exile_gale_dash',
      startX: startX,
      endX: endX,
      y: player.position.y - 20,
      startTime: now,
      duration: 350,
      facing: player.facing
    });

    // Particle trail along dash path
    if (typeof particleSystem !== 'undefined' && particleSystem) {
      const steps = 12;
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const px = startX + (endX - startX) * t;
        particleSystem.particles.push({
          x: px,
          y: player.position.y - 20 + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 40,
          vy: -30 - Math.random() * 50,
          size: 3 + Math.random() * 4,
          color: Math.random() > 0.4 ? 'rgba(0, 139, 139, 0.9)' : 'rgba(0, 0, 0, 0.6)',
          life: 300 + Math.random() * 300,
          maxLife: 600,
          alpha: 1,
          type: 'spark'
        });
      }
    }
  }

  // ??? Exile Blade: Storm Execution (蝘尼蝢押?◢?曇?) Phase 1 ??Kunai Launch ???
  executeStormExecution(player, opponent, skill, playerSide, playerId) {
    const now = Date.now();

    // Prevent casting while already in execution state
    if (player.isExecuting) {
      this.addCombatLog('已在執行狀態！技能無法再次使用！', playerSide, 'status');
      // Refund cooldown
      this.cooldowns[playerSide].ultimate = now - skill.cooldown;
      return;
    }

    // Spawn ShadowKunai projectile
    const spawnX = player.position.x + (30 * player.facing);
    const kunai = {
      x: spawnX,
      y: player.position.y - 20,
      startX: spawnX,
      maxRange: skill.kunaiMaxRange || 400,
      direction: player.facing,
      speed: (skill.kunaiSpeed || 25) / 0.016, // Convert per-frame to per-second speed
      damage: skill.kunaiDamage || 2,
      type: 'shadowKunai',
      skill: skill,
      owner: player,
      ownerSide: playerSide,
      startTime: now
    };
    this.gameState.projectiles.push(kunai);

    this.addCombatLog(`${player.name} ?敶梯?∴?`, playerSide, 'skill');
    this.addVisualEffect(player.position.x, player.position.y, 'exile_kunai_cast', '🌀');
  }

  // ??? Exile Blade: Storm Execution Phase 2 ??On Kunai Hit (Execution Trigger) ???
  triggerStormExecution(player, opponent, skill, playerSide, playerId) {
    const now = Date.now();
    const opponentSide = playerSide === 'player1' ? 'player2' : 'player1';
    const execDuration = skill.executionDuration || 2000;

    // Deal initial kunai hit damage
    this.dealDamageWithResult(opponent, skill.kunaiDamage || 2, playerSide);
    this.addCombatLog(`命中敵人！`, playerSide, 'damage');

    // Set Exile Blade isExecuting + invincible
    player.isExecuting = true;
    player.effects.invulnerable = now + execDuration;

    // Teleport to enemy position
    player.position.x = opponent.position.x - player.facing * (skill.teleportOffset || 20);
    player.position.x = Math.max(80, Math.min(this.canvasWidth - 80, player.position.x));

    // Lock the enemy (stunned for execution duration)
    opponent.effects.stunned = Math.max(opponent.effects.stunned || 0, now + execDuration);

    // Store execution state for tick-based damage during update loop
    // 蝐?pattern: 4 crossing wind blades (?? /, |, \) + final sheathe hit
    // Angles that form the 蝐?character: 0簞, 45簞, 90簞, 135簞
    player.executionState = {
      startTime: now,
      duration: execDuration,
      totalTicks: skill.executionTicks || 5,
      tickDamage: skill.tickDamage || 5,
      finalTickDamage: skill.finalTickDamage || 10,
      finalKnockback: skill.finalKnockback || 150,
      ticksDealt: 0,
      targetSide: opponentSide,
      ownerSide: playerSide,
      targetRef: opponent,
      // Fixed angles for 蝐?pattern: horizontal, 45deg, vertical, 135deg
      miAngles: [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4],
      slashEffects: [],
      sheatheTime: 0
    };

    // Screen flash effect
    this.gameState.screenFlash = {
      color: 'rgba(0, 139, 139, 0.4)',
      startTime: now,
      duration: 300
    };

    this.triggerCameraShake(12, 400);
  }

  // ??? Exile Blade: Update Execution System (runs every frame) ???
  updateExileBladeSystems(deltaTime) {
    const now = Date.now();

    ['player1', 'player2'].forEach(pid => {
      const player = this.players[pid];
      if (!player || !player.isExecuting || !player.executionState) return;

      const es = player.executionState;
      const elapsed = now - es.startTime;
      const tickInterval = es.duration / es.totalTicks;
      const expectedTicks = Math.min(es.totalTicks, Math.floor(elapsed / tickInterval) + 1);
      const opponent = this.players[es.targetSide];

      if (!opponent) {
        // Target gone, abort execution
        player.isExecuting = false;
        player.executionState = null;
        return;
      }

      // Keep the player locked to the target during execution
      player.position.x = opponent.position.x - player.facing * 20;
      player.position.x = Math.max(80, Math.min(this.canvasWidth - 80, player.position.x));

      // Process pending ticks
      while (es.ticksDealt < expectedTicks && es.ticksDealt < es.totalTicks) {
        const tickNum = es.ticksDealt + 1;
        const isFinalTick = tickNum === es.totalTicks;

        if (isFinalTick) {
          // Tick 5 (Final): Character appears, sheathes sword ??big damage + knockback
          this.dealDamageWithResult(opponent, es.finalTickDamage, es.ownerSide);
          this.addDamageNumber(opponent.position.x, opponent.position.y - 50, es.finalTickDamage, 'critical');

          // Knockback 150px
          const knockDir = opponent.position.x >= player.position.x ? 1 : -1;
          opponent.position.x += knockDir * es.finalKnockback;
          opponent.position.x = Math.max(80, Math.min(this.canvasWidth - 80, opponent.position.x));

          // Record sheathe time for render, then end execution
          es.sheatheTime = now;

          // Push a persistent effect so the 蝐?pattern + sheathe animation plays out
          this.gameState.effects.push({
            type: 'exile_execution_sheathe',
            x: player.position.x,
            y: player.position.y,
            startTime: now,
            duration: 800,
            facing: player.facing
          });

          // End execution state
          player.isExecuting = false;
          player.executionState = null;

          this.addCombatLog(`靈爆符命中敵人！`, es.ownerSide, 'damage');
          this.triggerCameraShake(18, 600);
          this.gameState.screenFlash = {
            color: 'rgba(0, 139, 139, 0.7)',
            startTime: now,
            duration: 500
          };

          // Burst particles on final hit
          if (typeof particleSystem !== 'undefined' && particleSystem) {
            for (let i = 0; i < 40; i++) {
              const burstAngle = (Math.PI * 2 / 40) * i;
              particleSystem.particles.push({
                x: opponent.position.x,
                y: opponent.position.y - 20,
                vx: Math.cos(burstAngle) * (100 + Math.random() * 120),
                vy: Math.sin(burstAngle) * (100 + Math.random() * 120),
                size: 3 + Math.random() * 6,
                color: Math.random() > 0.3 ? 'rgba(0, 139, 139, 1)' : '#111',
                life: 600 + Math.random() * 600,
                maxLife: 1200,
                alpha: 1,
                type: 'spark'
              });
            }
          }

          return; // Execution complete
        } else {
          // Ticks 1-4: Each tick is one wind blade of the 蝐?pattern
          this.dealDamageWithResult(opponent, es.tickDamage, es.ownerSide);
          this.addDamageNumber(opponent.position.x, opponent.position.y - 40 - tickNum * 10, es.tickDamage, 'damage');

          // Use the fixed 蝐?angle for this tick (index 0-3)
          const bladeAngle = es.miAngles[tickNum - 1];
          es.slashEffects.push({
            angle: bladeAngle,
            x: opponent.position.x,
            y: opponent.position.y - 20,
            time: now,
            duration: es.duration  // Persist for the full execution so all 4 blades remain visible
          });

          this.triggerCameraShake(10, 200);

          // Screen flash per slash
          this.gameState.screenFlash = {
            color: 'rgba(0, 139, 139, 0.25)',
            startTime: now,
            duration: 150
          };
        }

        es.ticksDealt++;
      }

      // Timeout safety: if elapsed exceeds duration, force end
      if (elapsed >= es.duration + 200) {
        player.isExecuting = false;
        player.executionState = null;
      }
    });
  }

  // ??? Exile Blade: Render Execution Overlay (called from render loop) ???
  renderExileBladeExecution() {
    const now = Date.now();
    const ctx = this.ctx;

    ['player1', 'player2'].forEach(pid => {
      const player = this.players[pid];
      if (!player || !player.isExecuting || !player.executionState) return;

      const es = player.executionState;
      const opponent = this.players[es.targetSide];
      if (!opponent) return;

      const progress = (now - es.startTime) / es.duration;

      // === Dark overlay that intensifies as slashes accumulate ===
      const overlayAlpha = 0.2 + progress * 0.15;
      ctx.save();
      ctx.fillStyle = `rgba(0, 15, 15, ${overlayAlpha})`;
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      ctx.restore();

      // === Draw accumulated 蝐?pattern wind blades ===
      const bladeLength = 180; // Giant blades spanning across the target

      es.slashEffects.forEach((slash, idx) => {
        const slashElapsed = now - slash.time;
        if (slashElapsed > slash.duration) return;

        // Blade appears instantly bright then holds, fading only near the end
        const fadeStart = slash.duration * 0.7;
        const slashAlpha = slashElapsed < fadeStart ? 1.0 :
          1.0 - ((slashElapsed - fadeStart) / (slash.duration - fadeStart));

        // Blade extends rapidly on arrival
        const extendProgress = Math.min(1, slashElapsed / 120);
        const currentLen = bladeLength * extendProgress;

        ctx.save();
        ctx.translate(slash.x, slash.y);
        ctx.rotate(slash.angle);

        // Outer glow layer (wide, dim)
        ctx.strokeStyle = `rgba(0, 80, 80, ${slashAlpha * 0.4})`;
        ctx.lineWidth = 14;
        ctx.shadowColor = 'rgba(0, 139, 139, 0.6)';
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.moveTo(-currentLen / 2, 0);
        ctx.lineTo(currentLen / 2, 0);
        ctx.stroke();

        // Core blade (bright dark-cyan)
        ctx.strokeStyle = `rgba(0, 200, 200, ${slashAlpha * 0.95})`;
        ctx.lineWidth = 5;
        ctx.shadowColor = 'rgba(0, 255, 255, 0.9)';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(-currentLen / 2, 0);
        ctx.lineTo(currentLen / 2, 0);
        ctx.stroke();

        // Inner white-hot center line
        ctx.strokeStyle = `rgba(180, 255, 255, ${slashAlpha * 0.7})`;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(-currentLen / 2 + 5, 0);
        ctx.lineTo(currentLen / 2 - 5, 0);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.restore();
      });

      // === Chaotic wind particles swirling around the target ===
      if (typeof particleSystem !== 'undefined' && particleSystem && Math.random() < 0.5) {
        const windAngle = now * 0.008 + Math.random() * Math.PI * 2;
        const windR = 30 + Math.random() * 50;
        particleSystem.particles.push({
          x: opponent.position.x + Math.cos(windAngle) * windR,
          y: opponent.position.y - 20 + Math.sin(windAngle) * windR,
          vx: Math.cos(windAngle + Math.PI / 2) * 60,
          vy: Math.sin(windAngle + Math.PI / 2) * 60 - 20,
          size: 2 + Math.random() * 3,
          color: Math.random() > 0.5 ? 'rgba(0, 139, 139, 0.8)' : 'rgba(0, 0, 0, 0.6)',
          life: 250 + Math.random() * 250,
          maxLife: 500,
          alpha: 0.9,
          type: 'spark'
        });
      }

      // === Dark-cyan energy vortex on the target ===
      const vortexSize = 50 + Math.sin(now * 0.025) * 12;
      const vortexGrad = ctx.createRadialGradient(
        opponent.position.x, opponent.position.y - 20, 0,
        opponent.position.x, opponent.position.y - 20, vortexSize
      );
      vortexGrad.addColorStop(0, `rgba(0, 139, 139, ${0.35 + Math.sin(now * 0.02) * 0.15})`);
      vortexGrad.addColorStop(0.6, `rgba(0, 80, 80, 0.15)`);
      vortexGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = vortexGrad;
      ctx.beginPath();
      ctx.arc(opponent.position.x, opponent.position.y - 20, vortexSize, 0, Math.PI * 2);
      ctx.fill();
    });

    // === Render the sheathe effect (from effects queue, persists after execution ends) ===
    this.gameState.effects = this.gameState.effects.filter(effect => {
      if (effect.type !== 'exile_execution_sheathe') return true;
      const elapsed = now - effect.startTime;
      if (elapsed > effect.duration) return false;

      const alpha = 1 - (elapsed / effect.duration);
      // Sheathe flash: a bright horizontal line that contracts
      ctx.save();
      ctx.translate(effect.x, effect.y - 20);
      const flashWidth = 200 * (1 - elapsed / effect.duration);
      const grad = ctx.createLinearGradient(-flashWidth / 2, 0, flashWidth / 2, 0);
      grad.addColorStop(0, `rgba(0, 139, 139, 0)`);
      grad.addColorStop(0.3, `rgba(180, 255, 255, ${alpha * 0.9})`);
      grad.addColorStop(0.7, `rgba(180, 255, 255, ${alpha * 0.9})`);
      grad.addColorStop(1, `rgba(0, 139, 139, 0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(-flashWidth / 2, 0);
      ctx.lineTo(flashWidth / 2, 0);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      return true;
    });
  }

  // ??? Exile Blade: Render Dash Effect ???
  renderExileGaleDashEffect() {
    const now = Date.now();
    const ctx = this.ctx;

    this.gameState.effects = this.gameState.effects.filter(effect => {
      if (effect.type !== 'exile_gale_dash') return true;

      const elapsed = now - effect.startTime;
      if (elapsed > effect.duration) return false;

      const alpha = 1 - (elapsed / effect.duration);
      const y = effect.y;

      ctx.save();

      // Thick dark-cyan motion blur along the dash path
      const grad = ctx.createLinearGradient(effect.startX, y, effect.endX, y);
      grad.addColorStop(0, `rgba(0, 139, 139, ${alpha * 0.1})`);
      grad.addColorStop(0.3, `rgba(0, 139, 139, ${alpha * 0.8})`);
      grad.addColorStop(0.7, `rgba(0, 139, 139, ${alpha * 0.8})`);
      grad.addColorStop(1, `rgba(0, 139, 139, ${alpha * 0.1})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 8 + (1 - alpha) * 6;
      ctx.shadowColor = 'rgba(0, 139, 139, 0.8)';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.moveTo(effect.startX, y);
      ctx.lineTo(effect.endX, y);
      ctx.stroke();

      // Secondary thinner trailing lines
      for (let i = 0; i < 3; i++) {
        const offsetY = (i - 1) * 6;
        ctx.strokeStyle = `rgba(0, 200, 200, ${alpha * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(effect.startX, y + offsetY);
        ctx.lineTo(effect.endX, y + offsetY);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.restore();

      return true;
    });
  }

  // 嚙?蝎暸?摰風蝚?- 銝頛芾???賜頂蝯?
  executeElfTalisman(player, opponent, skill, playerSide, playerId) {
    const now = Date.now();
    const talisman = player.effects.talismanState;
    
    // 蝚砌?甈⊥?銝? ??頛芾?敺芰
    if (!talisman || talisman.phase !== 'cycling') {
      player.effects.talismanState = {
        phase: 'cycling',
        currentIndex: 0,
        startTime: now,
        lastCycleTime: now,
        colors: skill.talismanColors
      };
      this.addCombatLog(`${player.name} ?? 蝎暸?摰風蝚佗?`, playerSide, 'skill');
      this.addVisualEffect(player.position.x, player.position.y, 'talisman_start', '💫');
      // Don't consume cooldown on first press - handled by useSkill override
      return;
    }
    
    // 蝚砌?甈⊥?銝? 蝣箏??嗅?憿銝行?瘣餅???
    const selectedColor = talisman.colors[talisman.currentIndex];
    player.effects.talismanState = null; // clear cycling state
    
    // ?? ??賭蝙?刻?????
    player.rangerAmmo = Math.min(player.ammoMax || 7, (player.rangerAmmo === undefined ? (player.ammoMax || 7) : player.rangerAmmo) + (player.ammoPerSkill || 3));
    
    switch (selectedColor) {
      case 'red': {
        // ? ??怎 - ?刻銝撱箇?啣???
        const red = skill.red;
        const zoneX = player.position.x + player.facing * 60;
        if (!this.gameState.fireZones) this.gameState.fireZones = [];
        this.gameState.fireZones.push({
          ownerId: playerId,
          x: zoneX,
          y: player.position.y,
          radius: red.zoneRadius,
          expiresAt: now + red.zoneDuration,
          damage: red.damage,
          damageDuration: red.damageDuration,
          fearDistance: red.fearDistance,
          lastTick: now
        });
        this.addCombatLog(`命中敵人！`, playerSide, 'damage');
        this.addVisualEffect(zoneX, player.position.y, 'fire_zone', '🔥');
        if (typeof particleSystem !== 'undefined' && particleSystem) {
          particleSystem.createFearFireZoneEffect(zoneX, player.position.y);
        }
        break;
      }
      case 'purple': {
        // ???琿摰風 - ?芾澈霅瑞嚗??????拇?+皜
        const purple = skill.purple;
        player.effects.lightningGuard = now + purple.duration;
        player.effects.lightningGuardFlatDR = purple.flatReduction;
        this.addCombatLog(`雷電守護激活！`, playerSide, 'status');
        this.addVisualEffect(player.position.x, player.position.y, 'lightning_guard', '⚡');
        if (typeof particleSystem !== 'undefined' && particleSystem) {
          particleSystem.createLightningGuardEffect(player.position.x, player.position.y);
        }
        break;
      }
      case 'blue': {
        // ?? ?芰??? - ?餅??賭葉?蕭??摰?
        const blue = skill.blue;
        player.effects.snowballBuff = now + blue.duration;
        player.effects.snowballCharges = blue.snowballCharges;
        this.addCombatLog(`雪球附魔激活！下次攻擊發射雪球！`, playerSide, 'status');
        this.addVisualEffect(player.position.x, player.position.y, 'snowball_buff', '❄️');
        if (typeof particleSystem !== 'undefined' && particleSystem) {
          particleSystem.createEnchantOrbEffect(player.position.x, player.position.y);
        }
        break;
      }
    }
  }

  // ? ?恍銵?- ?梯澈蝒?+ 撘瑕?撠? + ?駁???+ ?蔭????瑕
  executeStealthDash(player, opponent, skill, playerSide, playerId) {
    const now = Date.now();
    
    // 閮剖??梯澈 (??摨衣0)
    player.effects.invulnerable = now + 500; // brief invuln during dash
    player.effects.stealthActive = now + 800; // visual stealth duration
    
    // 蝒?00px
    const dashDir = player.facing;
    player.position.x += skill.dashDistance * dashDir;
    player.position.x = Math.max(80, Math.min(this.canvasWidth - 80, player.position.x));
    
    // ?蔭????瑕
    this.cooldowns[playerId].normal = 0;
    
    // 閮剖?撘瑕?銝???
    player.effects.empoweredShot = now + skill.buffDuration;
    
    // ?駁???
    player.effects.stealthAttackSpeedBuff = now + skill.buffDuration;
    
    this.addCombatLog(`${player.name} 雿輻 ?恍銵?`, playerSide, 'skill');
    this.addVisualEffect(player.position.x, player.position.y, 'stealth_dash', '💨');
    
    if (typeof particleSystem !== 'undefined' && particleSystem) {
      particleSystem.createStealthDashEffect(player.position.x - skill.dashDistance * dashDir, player.position.y);
    }
  }

  // 嚙踢??靽桀儔嚗溶??executeThunderPunch ?寞?
  executeThunderPunch(player, opponent, skill, playerSide, playerId) {
    const distance = Math.abs(player.position.x - opponent.position.x);
    if (distance > 150) return;  // ??蝭?150px
    
    let hitCount = 0;
    const punchInterval = setInterval(() => {
      if (opponent.hp <= 0 || player.hp <= 0) {
        clearInterval(punchInterval);
        return;
      }
      
      const currentDistance = Math.abs(player.position.x - opponent.position.x);
      if (currentDistance > 150) {  // ??蝭?150px
        clearInterval(punchInterval);
        return;
      }
      
      hitCount++;
      
      // ?????瑕拿
      this.dealDamage(opponent, skill.damage, playerId);
      
      // ?? 憓撥???: 0.2蝘???1蝘?
      opponent.effects.stunned = Date.now() + skill.stun;
      
      // ???萄遣?格銵??寞?
      if (typeof particleSystem !== 'undefined' && particleSystem) {
        particleSystem.createThunderPunchImpactEffect(opponent.position.x, opponent.position.y, hitCount);
        
        // 蝚砌??喳??萄遣?拇??餅?
        if (hitCount === 1) {
          particleSystem.createThunderStunEffect(opponent.position.x, opponent.position.y);
        }
      }
      
      this.addVisualEffect(opponent.position.x, opponent.position.y, 'thunderpunch', '⚡');
      
      if (hitCount >= skill.hits) {
        clearInterval(punchInterval);
        
        // ?? ?敺??喳??賢?蝺拚???
        setTimeout(() => {
          opponent.effects.slowed = Date.now() + skill.slowDuration;
          this.addVisualEffect(opponent.position.x, opponent.position.y, 'slowed', '🐌');
          this.addCombatLog(`?琿?喳??綽?蝺拚?${skill.slowPercent * 100}%`, playerSide === 'player1' ? 'player2' : 'player1', 'status');
        }, skill.stun); // ?蝯?敺???蝺拚?
      }
    }, 300);
  }

  // ? ??誘??- 銵???
  executeSavageSuplex(player, opponent, skill, playerSide) {
    const now = Date.now();
    
    // 銵?孵?憪???撠?
    const dashDirection = opponent.position.x > player.position.x ? 1 : -1;
    player.facing = dashDirection;
    let dashTarget = player.position.x + dashDirection * skill.dashDistance;
    
    // ?亥??箸?頞?撠?嚗??典?????
    if ((dashDirection > 0 && dashTarget > opponent.position.x - 30) ||
        (dashDirection < 0 && dashTarget < opponent.position.x + 30)) {
      dashTarget = opponent.position.x - dashDirection * 30;
    }
    player.position.x = Math.max(80, Math.min(this.canvasWidth - 80, dashTarget));
    
    // 銵敺炎皜祆?衣１????
    const newDistance = Math.abs(player.position.x - opponent.position.x);
    if (newDistance <= 60) {
      // 撠??函征銝哨??銝哨??瘜?甈⊥???
      if (opponent._throwInterval) {
        this.addCombatLog(`敵人已被拋出！無法再次投擲！`, playerSide, 'status');
        return;
      }
      // ????嚗??瑕拿 ???急???雿蔭嚗蝙?孵??折蝳血摰迤蝣?
      const postSuplexX = player.position.x;
      player.position.x = player.position.x - dashDirection * skill.dashDistance;
      this.dealDamage(opponent, skill.damage, playerSide);
      player.position.x = postSuplexX;
      this.addCombatLog(`命中敵人！`, playerSide, 'damage');
      
      // ?撠? + ?質???蛛????嚗?
      opponent.effects.stunned = now + 600;

      
      // ?亙??迤?刻◤?銝哨???瘨蒂?賢
      if (opponent._throwInterval) {
        clearInterval(opponent._throwInterval);
        opponent._throwInterval = null;
      }
      const savedY = opponent._groundY || opponent.position.y;
      opponent._groundY = savedY;
      opponent.position.y = savedY;
      const throwDir = -player.facing;
      const startX = opponent.position.x;
      const landX = Math.max(80, Math.min(this.canvasWidth - 80, startX + throwDir * skill.throwDistance));
      const animDuration = 500;
      const startTime = now;
      
      // ?蝺???
      opponent._throwInterval = setInterval(() => {
        const t = (Date.now() - startTime) / animDuration;
        if (t >= 1) {
          clearInterval(opponent._throwInterval);
          opponent._throwInterval = null;
          opponent._groundY = null;
          opponent.position.x = landX;
          opponent.position.y = savedY;
          
          // ?賢敺?怎?蛛??脫迫鋡怎??喳?甈⊥????

          
          // ?賢?寞?
          if (typeof particleSystem !== 'undefined' && particleSystem) {
            particleSystem.createSuplexSlamEffect(opponent.position.x, opponent.position.y);
          }
          this.addVisualEffect(opponent.position.x, opponent.position.y, 'suplex_slam', '💥');
          
          // ??瑼Ｘ葫
          if (opponent.position.x <= 80 || opponent.position.x >= this.canvasWidth - 80) {
            this.dealDamage(opponent, skill.wallSlamDamage, playerSide);
            opponent.effects.stunned = Date.now() + skill.wallSlamStun;
            this.addCombatLog(`摔到牆壁！額外${skill.wallSlamDamage}傷害 + 暈眩！`, playerSide, 'damage');
            this.addVisualEffect(opponent.position.x, opponent.position.y, 'wall_slam', '💥');
            
            if (typeof particleSystem !== 'undefined' && particleSystem) {
              particleSystem.createScreenShake(12, 600);
            }
          }
          return;
        }
        
        // ?蝺?X蝺改?Y撘抒???100px
        opponent.position.x = startX + (landX - startX) * t;
        opponent.position.y = savedY - Math.sin(t * Math.PI) * 100;
      }, 16);
    } else {
      this.addCombatLog(`??誘??賭葉`, playerSide, 'status');
    }
  }

  // ?? ????畾?- 餈?捱
  executeRoyalExecution(player, opponent, skill, playerSide) {
    const now = Date.now();
    const distance = Math.abs(player.position.x - opponent.position.x);
    
    if (distance > skill.range) {
      this.addCombatLog(`距離太遠！名門連環殺未命中`, playerSide, 'status');
      return;
    }
    
    // ???格?嚗??拙?????急???
    this.addVisualEffect(opponent.position.x, opponent.position.y, 'execute_lock', '💥');
    opponent.effects.stunned = now + 800;

    
    // ?亙??迤?刻◤?銝哨???瘨蒂?賢
    if (opponent._throwInterval) {
      clearInterval(opponent._throwInterval);
      opponent._throwInterval = null;
    }
    const savedY = opponent._groundY || opponent.position.y;
    opponent._groundY = savedY;
    opponent.position.y = savedY;
    const throwDirection = player.facing;
    const startX = opponent.position.x;
    const landX = Math.max(80, Math.min(this.canvasWidth - 80, startX + throwDirection * 120));
    const animDuration = 700; // 0.7蝘?
    const startTime = now;
    
    // ?蝺??恬?瘥??湔撠?雿蔭
    opponent._throwInterval = setInterval(() => {
      const t = (Date.now() - startTime) / animDuration;
      if (t >= 1) {
        clearInterval(opponent._throwInterval);
        opponent._throwInterval = null;
        opponent._groundY = null;
        // ?賢嚗敺坡嚗身摰?蝯
        opponent.position.x = landX;
        opponent.position.y = savedY;
        
        // ?賢敺?怎?蛛??脫迫鋡怎??喳?甈⊥????

        
        // ???瑕拿
        this.dealDamage(opponent, skill.damage, playerSide);
        this.addCombatLog(`????畾箏銝哨?${skill.damage}?瑕拿`, playerSide, 'damage');
        
        // ?賢?寞?
        if (typeof particleSystem !== 'undefined' && particleSystem) {
          particleSystem.createSuplexSlamEffect(opponent.position.x, opponent.position.y);
        }
        this.addVisualEffect(opponent.position.x, opponent.position.y, 'suplex_slam', '💥');
        
        // ?捱?文?嚗鈭慵P雿15%?畾?
        if (opponent.hp > 0 && opponent.hp <= opponent.maxHp * skill.executeThreshold) {
          opponent.hp = 0;
          this.addVisualEffect(opponent.position.x, opponent.position.y, 'execute_kill', '💀');
          this.addCombatLog(`命中敵人！`, playerSide, 'damage');
          
          if (typeof particleSystem !== 'undefined' && particleSystem) {
            particleSystem.createExecuteFinisherEffect(opponent.position.x, opponent.position.y);
          }
          
          this.gameState.winner = playerSide;
        }
        return;
      }
      
      // ?蝺?X蝺抒宏??Y?蝺?(???系=0.4??擃?50px)
      opponent.position.x = startX + (landX - startX) * t;
      opponent.position.y = savedY - Math.sin(t * Math.PI) * 150;
    }, 16);
  }

  // ?? ?賢?瘥?鋡怠?
  applyPoisonPassive(target, attacker, attackerSide) {
    const now = Date.now();
    const passive = attacker.passive || characters[attacker.id]?.passive;
    if (!passive) return;
    
    // 撠?甇??脩戌銝剖?銝?撅?
    const targetId = target === this.players.player1 ? 'player1' : 'player2';
    if (this.isPlayerDefending(targetId)) return;
    
    // 憓?瘥?撅斗
    if (!target.effects.poisonStacks) target.effects.poisonStacks = 0;
    target.effects.poisonStacks++;
    
    // ?瑟瘥?????
    target.effects.poisonDotEnd = now + passive.dotDuration;
    if (!target.effects.poisonTickTime || target.effects.poisonTickTime < now) {
      target.effects.poisonTickTime = now + passive.dotInterval;
    }
    
    this.addCombatLog(`毒素疊加 x${target.effects.poisonStacks}`, attackerSide, 'status');
    
    // 瑼Ｘ?臬?撘?撅斗
    if (target.effects.poisonStacks >= passive.detonateStack) {
      // 撘?嚗?
      target.effects.poisonStacks = 0;
      target.effects.poisonDotEnd = 0;
      
      this.dealDamage(target, passive.detonateDamage, attackerSide);
      this.addCombatLog(`毒素引爆！造成${passive.detonateDamage}爆裂傷害！`, attackerSide, 'damage');
      this.addVisualEffect(target.position.x, target.position.y, 'poison_detonate', '☠️');
      
      // ?賢??敺宏????
      attacker.effects.speedBoost = now + passive.speedBuffDuration;
      this.addCombatLog(`瘥???+30%蝘駁`, attackerSide, 'status');
      
      // 撘??寞?
      if (typeof particleSystem !== 'undefined' && particleSystem) {
        particleSystem.createPoisonDetonateEffect(target.position.x, target.position.y);
      }
    }
  }

  // ? ?湔?琿蝟餌絞
  updateTraps() {
    if (!this.gameState.traps) return;
    const now = Date.now();
    
    this.gameState.traps = this.gameState.traps.filter(trap => {
      // ??皜
      if (now > trap.expiresAt || trap.triggered) return false;
      
      // 瑼Ｘ?菜?臬頦拙?琿
      const target = trap.owner === this.players.player1 ? this.players.player2 : this.players.player1;
      const distance = Math.abs(trap.x - target.position.x);
      
      if (distance < trap.triggerRadius && Math.abs(trap.y - target.position.y) < 40 && !(target.effects.dashImmune > now)) {
        // 閫貊?琿嚗?
        trap.triggered = true;
        target.effects.rooted = now + trap.rootDuration;
        target.effects.stunned = now + trap.rootDuration;
        
        const trapOwnerSide = trap.ownerId;
        this.addCombatLog(`荊棘陷阱觸發！定身${trap.rootDuration/1000}秒！`, trapOwnerSide, 'damage');
        this.addVisualEffect(target.position.x, target.position.y, 'root', '🌿');
        
        // ?賢?瘥?鋡怠?
        this.applyPoisonPassive(target, trap.owner, trapOwnerSide);
        
        // ? ???琿??嚗?瘝澆??敺宏??50??2蝘?
        if (trap.owner) {
          trap.owner.effects.thornTrapSpeedBuff = now + 2000;
          this.addCombatLog(`荊棘陷阱觸發！移速提升3秒！`, trapOwnerSide, 'status');
          this.addVisualEffect(trap.owner.position.x, trap.owner.position.y, 'speed', '💨');
        }
        
        // ?琿閫貊?寞?
        if (typeof particleSystem !== 'undefined' && particleSystem) {
          particleSystem.createThornTrapTriggerEffect(target.position.x, target.position.y);
        }
        
        return false;
      }
      
      return true;
    });
  }

  // ? 皜脫??琿
  renderTraps() {
    if (!this.gameState.traps) return;
    const ctx = this.ctx;
    const now = Date.now();
    
    this.gameState.traps.forEach(trap => {
      if (trap.triggered) return;
      
      const age = now - trap.createdAt;
      const pulseAlpha = 0.15 + Math.sin(age * 0.003) * 0.08;
      
      ctx.save();
      
      // ?勗耦?琿 - 敺桀摹?圈璅?
      ctx.globalAlpha = pulseAlpha;
      ctx.fillStyle = '#00b894';
      ctx.shadowColor = '#00b894';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(trap.x, trap.y + 25, 20, 0, Math.PI * 2);
      ctx.fill();
      
      // ??蝝楝
      ctx.strokeStyle = '#2d3436';
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 / 6) * i + age * 0.001;
        ctx.beginPath();
        ctx.moveTo(trap.x, trap.y + 25);
        ctx.lineTo(trap.x + Math.cos(angle) * 15, trap.y + 25 + Math.sin(angle) * 15);
        ctx.stroke();
      }
      
      ctx.shadowBlur = 0;
      ctx.restore();
    });
  }

  // 嚙?皜脫??怎???
  renderFireZones() {
    if (!this.gameState.fireZones || this.gameState.fireZones.length === 0) return;
    const ctx = this.ctx;
    const now = Date.now();
    
    this.gameState.fireZones.forEach(zone => {
      const remaining = zone.expiresAt - now;
      const alpha = Math.min(1, remaining / 1000); // fade out in last second
      
      ctx.save();
      ctx.globalAlpha = alpha * 0.6;
      
      // ?怎摨漣??
      const gradient = ctx.createRadialGradient(zone.x, zone.y + 20, 0, zone.x, zone.y + 20, zone.radius + 40);
      gradient.addColorStop(0, 'rgba(255, 87, 34, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 152, 0, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 87, 34, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(zone.x, zone.y + 20, zone.radius + 40, 0, Math.PI * 2);
      ctx.fill();
      
      // ?怎蝎??
      for (let i = 0; i < 8; i++) {
        const fx = zone.x + (Math.sin(now * 0.005 + i * 1.2) * zone.radius);
        const fy = zone.y + 15 - Math.abs(Math.sin(now * 0.008 + i)) * 30;
        const size = 4 + Math.sin(now * 0.01 + i) * 2;
        ctx.fillStyle = i % 2 === 0 ? '#FF5722' : '#FFC107';
        ctx.shadowColor = '#FF5722';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(fx, fy, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.shadowBlur = 0;
      ctx.restore();
    });
  }

  // 嚙踢??靽桀儔嚗溶??createProjectile ?寞?
  createProjectile(player, skill, type) {
    const projectile = {
      x: player.position.x + (30 * player.facing),
      y: player.position.y - 20,
      direction: player.facing,
      speed: skill.speed || 200,
      damage: skill.damage,
      type: type,
      skill: skill,
      owner: player,
      startTime: Date.now()
    };
    
    this.gameState.projectiles.push(projectile);
    
    if (typeof particleSystem !== 'undefined' && particleSystem) {
      const effectCode = type === 'fireball' ? 'FIR_002' : 
                        type === 'waterdragon' ? 'WAT_002' : 
                        type === 'venomdart' ? 'PSN_001' : 'SPI_001';
      particleSystem.createSkillEffect(effectCode, projectile.x, projectile.y, player.facing);
    }
    
    this.addVisualEffect(projectile.x, projectile.y, 'projectile_start', this.getProjectileIcon(type));
  }

  // ? 靽桀儔嚗溶??getProjectileIcon ?寞?
  getProjectileIcon(type) {
    const icons = {
      'fireball': '?',
      'waterdragon': '??',
      'spiritbomb': '?',
      'venomdart': '??'
    };
    return icons[type] || '?';
  }

  // ? 靽桀儔嚗溶?撩憭梁? addVisualEffect ?寞?
  addVisualEffect(x, y, type, icon) {
    const effect = {
      x: x,
      y: y,
      type: type,
      icon: icon,
      startTime: Date.now(),
      duration: 1000
    };
    
    this.gameState.effects.push(effect);
  }

  updateProjectiles() {
    const now = Date.now();
    
    this.gameState.projectiles = this.gameState.projectiles.filter(projectile => {
      projectile.x += projectile.direction * projectile.speed * 0.016;
      
      // ? ?怎?憌??寞?
      if (projectile.type === 'fireball' && typeof particleSystem !== 'undefined' && particleSystem) {
        if (Math.random() < 0.5) {
          particleSystem.createFireballTrailEffect(projectile.x, projectile.y);
        }
      }
      
      // ?? 瘞湧?憌??寞?
      if (projectile.type === 'waterdragon' && typeof particleSystem !== 'undefined' && particleSystem) {
        if (Math.random() < 0.6) {
          particleSystem.createWaterDragonTrailEffect(projectile.x, projectile.y);
        }
      }
      
      // ?? 瘥憌??寞?
      if (projectile.type === 'venomdart' && typeof particleSystem !== 'undefined' && particleSystem) {
        if (Math.random() < 0.5) {
          particleSystem.createVenomDartTrailEffect(projectile.x, projectile.y);
        }
      }
      
      // ? 蝎暸???蝞剔憌??寞?
      if (projectile.type === 'rangerArrow' && typeof particleSystem !== 'undefined' && particleSystem) {
        if (Math.random() < 0.5) {
          particleSystem.createRangerArrowTrailEffect(projectile.x, projectile.y);
        }
      }
      
      // ?弩 銵憟???敶?銵??
      if (projectile.type === 'bloodBolt' && typeof particleSystem !== 'undefined' && particleSystem) {
        if (Math.random() < 0.5) {
          particleSystem.createBloodBoltTrailEffect(projectile.x, projectile.y);
        }
      }
      
      // ?弩 銵??撠憌??寞?
      if (projectile.type === 'bloodShackle' && typeof particleSystem !== 'undefined' && particleSystem) {
        if (Math.random() < 0.5) {
          particleSystem.createBloodBoltTrailEffect(projectile.x, projectile.y);
        }
      }
      
      // ?儭?ShadowKunai smoke trail particles
      if (projectile.type === 'shadowKunai' && typeof particleSystem !== 'undefined' && particleSystem) {
        if (Math.random() < 0.6) {
          particleSystem.particles.push({
            x: projectile.x - projectile.direction * 8,
            y: projectile.y + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 20,
            vy: -15 - Math.random() * 20,
            size: 2 + Math.random() * 3,
            color: Math.random() > 0.5 ? 'rgba(0, 80, 80, 0.7)' : 'rgba(0, 139, 139, 0.5)',
            life: 200 + Math.random() * 200,
            maxLife: 400,
            alpha: 0.8,
            type: 'spark'
          });
        }
      }

      // Shamisen note trail: floating particles + sound wave ripples behind the note
      if (projectile.type === 'shamisenNote' && typeof particleSystem !== 'undefined' && particleSystem) {
        // Emoji trail particles (50% chance per frame)
        if (Math.random() < 0.5) {
          particleSystem.particles.push({
            x: projectile.x - projectile.direction * 8,
            y: projectile.y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 15,
            vy: -20 - Math.random() * 15,
            size: projectile.isPerfectPitch ? 20 : 16,
            color: projectile.isPerfectPitch ? '#FFD700' : 'rgba(255,255,255,0.7)',
            life: 400 + Math.random() * 200,
            maxLife: 600,
            alpha: 0.8,
            type: 'shamisen_note_trail',
            emoji: projectile.isPerfectPitch ? '\u{1F3B6}' : '\u{1F3B5}'
          });
        }
        // Sound wave ripple rings expanding outward from note path
        if (Math.random() < 0.25) {
          particleSystem.particles.push({
            x: projectile.x - projectile.direction * 12,
            y: projectile.y,
            radius: 3,
            maxRadius: 18 + Math.random() * 8,
            expandSpeed: 40 + Math.random() * 20,
            color: projectile.isPerfectPitch ? '#FFD700' : '#F5DEB3',
            life: 350,
            maxLife: 350,
            alpha: 0.5,
            type: 'shamisen_wave_ring'
          });
        }
        // Sparkle dust (tiny glowing dots)
        if (Math.random() < 0.6) {
          particleSystem.particles.push({
            x: projectile.x - projectile.direction * (5 + Math.random() * 15),
            y: projectile.y + (Math.random() - 0.5) * 12,
            vx: -projectile.direction * (10 + Math.random() * 20),
            vy: (Math.random() - 0.5) * 30,
            size: 1 + Math.random() * 2,
            color: projectile.isPerfectPitch ? '#FFD700' : '#FFF8DC',
            life: 200 + Math.random() * 200,
            maxLife: 400,
            alpha: 0.9,
            type: 'spark'
          });
        }
      }
      
      // ?? ?嗡????拚?銵??- ? 靽格迤?
      if (typeof particleSystem !== 'undefined' && particleSystem && 
          typeof particleSystem.createParticles === 'function' && 
          Math.random() < 0.3) {
        const trailConfig = {
          count: 3,
          color: projectile.type === 'fireball' ? '#FF9800' : 
                 projectile.type === 'waterdragon' ? '#03A9F4' : '#E91E63',
          speed: 50,
          life: 200,
          size: 2
        };
        // ? 靽格迤嚗Ⅱ靽迤蝣箏??createParticles
        try {
          particleSystem.createParticles(projectile.x, projectile.y, trailConfig, Math.PI);
        } catch (error) {
          console.warn('?萄遣蝎??寞?憭望?:', error);
        }
      }
      
      // ?? Check projectile collision with enemy minions
      if (this.checkProjectileHitMinions(projectile)) {
        return false; // Projectile consumed by minion hit
      }
      
      // 瑼Ｘ蝣唳?
      const target = projectile.owner === this.players.player1 ? this.players.player2 : this.players.player1;
      const distance = Math.abs(projectile.x - target.position.x);
      const collisionRadius = this.getCollisionRadius(target, 40);

      if (distance < collisionRadius && Math.abs(projectile.y - target.position.y) < collisionRadius) {
        // 嚙?蝣箏????拇?撅祉摰?
        const ownerSide = projectile.owner === this.players.player1 ? 'player1' : 'player2';
        
        // 嚙踢???怎???寞?
        if (projectile.type === 'fireball' && typeof particleSystem !== 'undefined' && particleSystem) {
          particleSystem.createFireballExplosionEffect(projectile.x, projectile.y);
          this.addCombatLog(`靈爆符命中敵人！`, ownerSide, 'damage');
        }
        
        // ?? 瘞湧????寞?
        if (projectile.type === 'waterdragon' && typeof particleSystem !== 'undefined' && particleSystem) {
          particleSystem.createWaterDragonExplosionEffect(projectile.x, projectile.y);
          this.addCombatLog(`靈爆符命中敵人！`, ownerSide, 'damage');
        }
        
        // ? ??蝚血銝?
        if (projectile.type === 'spiritbomb') {
          this.addCombatLog(`靈爆符命中敵人！`, ownerSide, 'damage');
        }
        
        // ? 蝎暸???蝞剔?賭葉
        if (projectile.type === 'rangerArrow') {
          this.addCombatLog(`靈爆符命中敵人！`, ownerSide, 'damage');
          if (typeof particleSystem !== 'undefined' && particleSystem) {
            particleSystem.createRangerArrowHitEffect(projectile.x, projectile.y);
          }
          // Empowered shot - slow enemy
          if (projectile.empowered && projectile.slowDuration > 0) {
            target.effects.slowed = Date.now() + projectile.slowDuration;
            this.addCombatLog(`強化箭矢命中！緩速30%`, ownerSide, 'status');
            this.addVisualEffect(target.position.x, target.position.y, 'slow', '🐌');
          }
          this.dealDamage(target, projectile.damage, ownerSide);
          this.addVisualEffect(projectile.x, projectile.y, 'hit', '💥');
          return false;
        }
        
        // ?弩 銵憟???敶銝?- ?貉???
        if (projectile.type === 'bloodBolt') {
          this.addCombatLog(`靈爆符命中敵人！`, ownerSide, 'damage');
          if (typeof particleSystem !== 'undefined' && particleSystem) {
            particleSystem.createBloodBoltHitEffect(projectile.x, projectile.y);
          }
          this.dealDamage(target, projectile.damage, ownerSide);
          // 鋡怠??貉?嚗?餃銝剖?敺?HP
          this.applyBloodHeal(projectile.owner, 2, ownerSide);
          this.addVisualEffect(projectile.x, projectile.y, 'hit', '💥');
          return false;
        }
        

        // Shamisen Note hit - deal damage, knockback on perfect pitch
        if (projectile.type === 'shamisenNote') {
          this.addCombatLog('音符命中！', ownerSide, 'damage');
          this.dealDamage(target, projectile.damage, ownerSide);
          if (projectile.isPerfectPitch) {
            // Perfect pitch => extra knockback + stun
            const kb = projectile.skill ? projectile.skill.perfectKnockback || 10 : 10;
            const dir = projectile.facing === 'right' ? 1 : -1;
            target.position.x += dir * kb;
            target.effects.stunned = Date.now() + 200;
            this.addVisualEffect(projectile.x, projectile.y, 'hit', '🎶');
            this.addCombatLog('完美音律！擊退！', ownerSide, 'status');
            if (typeof particleSystem !== 'undefined' && particleSystem) {
              // Golden spark burst (12 particles)
              for (let i = 0; i < 12; i++) {
                const angle = (Math.PI * 2 / 12) * i;
                const speed = 80 + Math.random() * 60;
                particleSystem.particles.push({
                  x: projectile.x, y: projectile.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  size: 3 + Math.random() * 4,
                  color: '#FFD700',
                  life: 500 + Math.random() * 300,
                  maxLife: 800,
                  alpha: 1,
                  type: 'spark'
                });
              }
              // Sound wave shockwave rings (3 expanding rings)
              for (let r = 0; r < 3; r++) {
                particleSystem.particles.push({
                  x: projectile.x, y: projectile.y,
                  radius: 5,
                  maxRadius: 40 + r * 20,
                  expandSpeed: 80 + r * 15,
                  color: '#FFD700',
                  life: 400 + r * 100,
                  maxLife: 400 + r * 100,
                  alpha: 0.6 - r * 0.15,
                  type: 'shamisen_wave_ring',
                  delay: r * 80
                });
              }
              // Musical note explosion (4 notes flying outward)
              const emojis = ['🎵', '🎶', '🎼', '♪'];
              for (let i = 0; i < 4; i++) {
                const a = (Math.PI * 2 / 4) * i + Math.random() * 0.5;
                particleSystem.particles.push({
                  x: projectile.x, y: projectile.y,
                  vx: Math.cos(a) * 50,
                  vy: Math.sin(a) * 50 - 30,
                  size: 18 + Math.random() * 8,
                  color: '#FFD700',
                  text: emojis[i],
                  life: 800 + Math.random() * 300,
                  maxLife: 1100,
                  alpha: 1,
                  type: 'shamisen_note_trail'
                });
              }
            }
          } else {
            // Normal hit: sound wave ripple + small sparks
            this.addVisualEffect(projectile.x, projectile.y, 'hit', '🎵');
            if (typeof particleSystem !== 'undefined' && particleSystem) {
              // Expanding sound ring
              particleSystem.particles.push({
                x: projectile.x, y: projectile.y,
                radius: 3,
                maxRadius: 30,
                expandSpeed: 60,
                color: '#F5DEB3',
                life: 350,
                maxLife: 350,
                alpha: 0.5,
                type: 'shamisen_wave_ring'
              });
              // Small sparks
              for (let i = 0; i < 5; i++) {
                particleSystem.particles.push({
                  x: projectile.x, y: projectile.y,
                  vx: (Math.random() - 0.5) * 80,
                  vy: (Math.random() - 0.5) * 80,
                  size: 1.5 + Math.random() * 2,
                  color: '#F5DEB3',
                  life: 300 + Math.random() * 150,
                  maxLife: 450,
                  alpha: 0.8,
                  type: 'spark'
                });
              }
            }
          }
          return false;
        }
        // ?弩 銵??撠?賭葉 - ???瑕拿銝血遣蝡蝺?
        if (projectile.type === 'bloodShackle') {
          this.addCombatLog(`靈爆符命中敵人！`, ownerSide, 'damage');
          if (typeof particleSystem !== 'undefined' && particleSystem) {
            particleSystem.createBloodBoltHitEffect(projectile.x, projectile.y);
          }
          this.dealDamage(target, projectile.damage, ownerSide);
          // 撱箇??賜?
          projectile.owner.effects.bloodTether = {
            target: target,
            owner: projectile.owner,
            startTime: Date.now(),
            duration: projectile.tetherDuration,
            drainPerSecond: projectile.drainPerSecond,
            healPerSecond: projectile.healPerSecond,
            breakDistance: projectile.breakDistance,
            lastTickTime: Date.now()
          };
          this.addVisualEffect(projectile.x, projectile.y, 'tether', '🩸');
          return false;
        }
        
        // ?儭?ShadowKunai hit ??trigger Storm Execution Phase 2
        if (projectile.type === 'shadowKunai') {
          const ownerPlayer = projectile.owner;
          const opponentPlayer = target;
          if (ownerPlayer && !ownerPlayer.isExecuting) {
            this.triggerStormExecution(ownerPlayer, opponentPlayer, projectile.skill, projectile.ownerSide, projectile.ownerSide);
          }
          // Kunai visual hit burst
          if (typeof particleSystem !== 'undefined' && particleSystem) {
            for (let i = 0; i < 10; i++) {
              particleSystem.particles.push({
                x: projectile.x,
                y: projectile.y,
                vx: (Math.random() - 0.5) * 100,
                vy: (Math.random() - 0.5) * 100,
                size: 2 + Math.random() * 3,
                color: Math.random() > 0.5 ? 'rgba(0, 139, 139, 1)' : '#000',
                life: 300 + Math.random() * 200,
                maxLife: 500,
                alpha: 1,
                type: 'spark'
              });
            }
          }
          return false;
        }
        
        // ?? 瘥?賭葉 - ?賢?瘥?鋡怠? + 皜??琿CD
        if (projectile.type === 'venomdart') {
          // ?寞??臬?撥???捱摰摰?
          const dartDamage = (projectile.owner.effects.buffedDart > Date.now()) ? 
            (projectile.owner.skills?.ultimate?.buffedDartDamage || 7) : projectile.damage;
          
          if (projectile.owner.effects.buffedDart > Date.now()) {
            this.addCombatLog(`靈爆符命中敵人！`, ownerSide, 'damage');
          } else {
            this.addCombatLog(`靈爆符命中敵人！`, ownerSide, 'damage');
          }
          
          // ?賢?瘥?鋡怠?
          this.applyPoisonPassive(target, projectile.owner, ownerSide);
          
          // 皜????琿?瑕
          if (projectile.skill.trapCooldownReduction && this.cooldowns[ownerSide]) {
            if (this.cooldowns[ownerSide].ultimate) {
              this.cooldowns[ownerSide].ultimate -= projectile.skill.trapCooldownReduction;
            }
          }
          
          // 瘥?賭葉?寞?
          if (typeof particleSystem !== 'undefined' && particleSystem) {
            particleSystem.createPoisonDotEffect(target.position.x, target.position.y);
          }
          
          // 閬神?瑕拿?箏撥??
          if (projectile.owner.effects.buffedDart > Date.now()) {
            this.dealDamage(target, dartDamage, ownerSide);
            this.addVisualEffect(projectile.x, projectile.y, 'hit', '💥');
            return false;
          }
        }
        
        this.dealDamage(target, projectile.damage, ownerSide);
        
        // ?怎?銵??貊??摰?
        if (projectile.type === 'fireball' && projectile.skill.explosionRange) {
          const explosionTargets = [this.players.player1, this.players.player2];
          explosionTargets.forEach(explosionTarget => {
            if (explosionTarget && explosionTarget !== target) {
              const explosionDistance = Math.abs(projectile.x - explosionTarget.position.x);
              if (explosionDistance <= projectile.skill.explosionRange) {
                this.dealDamage(explosionTarget, projectile.skill.explosionDamage, ownerSide);
                this.addVisualEffect(explosionTarget.position.x, explosionTarget.position.y, 'explosion', '💥');
              }
            }
          });
        }
        
        // ?? 瘞湧?敶畾???
        if (projectile.type === 'waterdragon') {
          target.effects.slowed = Date.now() + projectile.skill.slowDuration;
          
          // ?? ?萄遣瘞湔?蝺拚??
          if (typeof particleSystem !== 'undefined' && particleSystem) {
            particleSystem.createWaterSlowEffect(target.position.x, target.position.y);
          }
          
          this.addVisualEffect(target.position.x, target.position.y, 'slow', '🐌');
        }
        
        if (projectile.type === 'spiritbomb') {
          let spiritHeal = projectile.skill.heal;
          // ?? ??憭扳???皜?
          const now2 = Date.now();
          if (projectile.owner.effects.healReduction > now2) {
            spiritHeal = Math.floor(spiritHeal * (1 - (projectile.owner.effects.healReductionPercent || 0)));
          }
          projectile.owner.hp = Math.min(projectile.owner.maxHp, projectile.owner.hp + spiritHeal);
          this.addVisualEffect(projectile.owner.position.x, projectile.owner.position.y, 'heal', '💚');
        }
        
        if (projectile.skill.knockback) {
          const knockbackDirection = target.position.x > projectile.owner.position.x ? 1 : -1;
          target.position.x += projectile.skill.knockback * knockbackDirection;
          target.position.x = Math.max(80, Math.min(this.canvasWidth - 80, target.position.x));
        }
        
        this.addVisualEffect(projectile.x, projectile.y, 'hit', '💥');
        return false;
      }
      
      // 撠??瑼Ｘ
      if (projectile.maxRange && projectile.startX !== undefined) {
        if (Math.abs(projectile.x - projectile.startX) > projectile.maxRange) return false;
      }

      // ??瑼Ｘ嚗???嚗??圈???瘨仃嚗?
      return projectile.x > 0 && projectile.x < this.canvasWidth;
    });
  }

  // ? 靽桀儔嚗??渡? dealDamageWithResult ?寞?
  dealDamageWithResult(target, damage, source) {
    const now = Date.now();
    let result = { hit: false, blocked: false, immune: false };
    
    if (!target || target.hp <= 0) {
      return result;
    }

    // ?? 鋆捱???塚?蝒?扳????芸??
    const parryAttacker = this.getAttackerFromSource(source);
    if (target.effects.parryActive > now && parryAttacker && parryAttacker !== target) {
      target.effects.parryActive = 0;
      if (target.effects.casting > now) {
        target.effects.casting = 0;
      }

      const counterDamage = target.skills?.normal?.counterDamage || 18;
      const counterKnockback = target.skills?.normal?.counterKnockback || 150;
      const silenceDuration = target.skills?.normal?.counterSilenceDuration || 1500;

      const knockDirection = parryAttacker.position.x >= target.position.x ? 1 : -1;
      parryAttacker.position.x += knockDirection * counterKnockback;
      parryAttacker.position.x = Math.max(80, Math.min(this.canvasWidth - 80, parryAttacker.position.x));
      parryAttacker.effects.silenced = Math.max(parryAttacker.effects.silenced || 0, now + silenceDuration);

      parryAttacker.hp = Math.max(0, parryAttacker.hp - counterDamage);
      this.addDamageNumber(parryAttacker.position.x, parryAttacker.position.y - 20, counterDamage, 'skill');
      this.addVisualEffect(parryAttacker.position.x, parryAttacker.position.y - 25, 'adjudicator_counter', '⚖️');
      this.gameState.effects.push({
        type: 'adjudicator_parry_text',
        x: target.position.x,
        y: target.position.y - 70,
        text: '招架！',
        startTime: now,
        duration: 450
      });

      this.hitStopFrames = Math.max(this.hitStopFrames || 0, 12);
      this.triggerCameraShake(10, 300);

      const targetId = target === this.players.player1 ? 'player1' : 'player2';
      this.addCombatLog(`招架反擊成功！造成${counterDamage} 傷害+沉默！`, targetId, 'damage');

      if (parryAttacker.hp <= 0) {
        this.gameState.winner = parryAttacker === this.players.player1 ? 'player2' : 'player1';
        this.addVisualEffect(parryAttacker.position.x, parryAttacker.position.y, 'death', '💀');
      }

      result.blocked = true;
      return result;
    }
    
    // ?儭??啁??孵??折蝳行炎??
    const targetId = target === this.players.player1 ? 'player1' : 'player2';
    const attackerId = target === this.players.player1 ? 'player2' : 'player1';
    
    const blockResult = this.isAttackBlocked(attackerId, targetId);
    
    if (blockResult === 'perfect') {
      // ??蝘?摰??脩戌嚗??典??怠摰喳??批
      this.addVisualEffect(target.position.x, target.position.y, 'defend_block', '🛡️');
      
      if (typeof particleSystem !== 'undefined' && particleSystem && particleSystem.createDefendBlockEffect) {
        particleSystem.createDefendBlockEffect(target.position.x, target.position.y);
      }
      
      const playerSide = targetId;
      this.addCombatLog(`${target.name} 完美格擋！`, playerSide, 'status');
      
      result.blocked = true;
      return result;
    }
    
    if (blockResult === 'weakened') {
      // 2蝘?嚗?撘梢蝳佗??瑕拿皜1嚗???批
      this.addVisualEffect(target.position.x, target.position.y, 'defend_block', '🛡️');
      
      // 撠摰唾??1
      damage = 1;
      
      const playerSide = targetId;
      this.addCombatLog(`${target.name} 弱化格擋！僅受1HP！`, playerSide, 'status');
      
      // 銝?return ??蝜潛?敺銝粥嚗??瑕拿=1憟?蚜P
      // ?批??銋?甇?虜??嚗??賡?頛臬 dealDamageWithResult 銋??賢?嚗?
    }
    
    // ?⊥??炎??
    if (target.effects.invulnerable > now) {
      this.addVisualEffect(target.position.x, target.position.y, 'immune', '🛡️');
      result.immune = true;
      return result;
    }
    
    // ?潭?瑼Ｘ (撗拙?霅琿?)
    if (target.effects.blocking > now) {
      target.effects.blocking = 0;
      target.effects.counterAttack = now + 10000;
      
      // 撗拙?霅琿??潭???
      if (target.id === 'doton' && target.skills?.normal?.healOnBlock) {
        let healAmount = target.skills.normal.healOnBlock;
        // ?? ??憭扳???皜?
        if (target.effects.healReduction > now) {
          healAmount = Math.floor(healAmount * (1 - (target.effects.healReductionPercent || 0)));
        }
        target.hp = Math.min(target.maxHp, target.hp + healAmount);
        this.addVisualEffect(target.position.x, target.position.y, 'heal_block', '💚');
        this.addDamageNumber(target.position.x, target.position.y - 30, healAmount, 'heal');
      }
      
      this.addVisualEffect(target.position.x, target.position.y, 'blocked', '??');
      result.blocked = true;
      return result;
    }
    
    // ??瑼Ｘ嚗蔣?澈嚗?
    if (target.effects.counterWindow > now) {
      target.effects.counterWindow = 0;
      const attacker = this.getAttackerFromSource(source);
      if (attacker && attacker !== target) {
        this.dealDamage(attacker, 15, 'counter');
        this.addVisualEffect(attacker.position.x, attacker.position.y, 'counter', '⚡');
        target.effects.guaranteedCrit = now + 30000;
        this.addVisualEffect(target.position.x, target.position.y, 'crit_ready', '🔥');
      }
      result.blocked = true;
      return result;
    }

    // ?爸 敺∠敹?霈澈銝剜???50%
    if (target.id === 'beastmaster' && target.golemTransforming) {
      damage = Math.round(damage * 0.5);
    }

    // ?爸 敺∠敹楊?貉??莎???摰喳?????
    if (target.id === 'beastmaster' && target.isGolem && target.golemShield > 0) {
      const absorbed = Math.min(target.golemShield, damage);
      target.golemShield -= absorbed;
      damage -= absorbed;

      if (absorbed > 0) {
        this.addVisualEffect(target.position.x, target.position.y, 'golem_armor_hit', '🐉');
      }

      if (target.golemShield <= 0) {
        const targetSide = target === this.players.player1 ? 'player1' : 'player2';
        this.revertBeastForm(target, targetSide, true);
      }

      if (damage <= 0) {
        result.hit = true;
        return result;
      }
    }
    
    // 霅瑞皜
    if (target.effects.shielded > now) {
      // ?? ?脣??芣??瑞????瑕拿 (?冽瘞游??曉?敺?
      const originalDamage = damage;
      
      damage = Math.floor(damage * 0.5);
      this.addVisualEffect(target.position.x, target.position.y, 'shielded', '🛡️');
      
      // ?? 瘞游??曉摰喳摮?
      if (target.effects.waterShieldActive > now) {
        // ?脣??芣??瑞????瑕拿
        target.waterShieldStoredDamage = (target.waterShieldStoredDamage || 0) + damage;
        
        // 瘞游??曇◤?餅??寞?
        if (typeof particleSystem !== 'undefined' && particleSystem) {
          particleSystem.createWaterShieldImpactEffect(target.position.x, target.position.y);
        }
      }
    }
    
    // ? 撗拍敹◤????
    if (target.passive && target.passive.damageReduction) {
      const originalDamage = damage;
      damage = Math.max(1, damage - target.passive.damageReduction);
      
      if (damage < originalDamage) {
        this.addVisualEffect(target.position.x, target.position.y, 'rock_armor', '🪨');
        
        // ? ?萄遣鋡怠?皜??寞?
        if (typeof particleSystem !== 'undefined' && particleSystem && particleSystem.createRockArmorFlashEffect) {
          particleSystem.createRockArmorFlashEffect(target.position.x, target.position.y);
        }
        
      }
    }
    
    // ? 擃?敹擃???(20%)
    if (target.effects.superArmor > now) {
      const originalDamage = damage;
      damage = Math.max(1, damage - Math.round(damage * 0.2));
      if (damage < originalDamage) {
        this.addVisualEffect(target.position.x, target.position.y, 'super_armor_hit', '💪');
      }
    }
    
    // ???琿摰風? + ?箏?皜
    if (target.effects.lightningGuard > now) {
      // ?箏?皜
      const dr = target.effects.lightningGuardFlatDR || 0;
      damage = Math.max(1, damage - dr);
      
      // ?蝯行??
      const reflectAttacker = this.getAttackerFromSource(source);
      if (reflectAttacker && reflectAttacker !== target) {
        const targetSkill = target.skills?.normal;
        const reflectDmg = targetSkill?.purple?.reflectDamage || 3;
        const reflectStun = targetSkill?.purple?.reflectStun || 400;
        
        reflectAttacker.hp = Math.max(0, reflectAttacker.hp - reflectDmg);
        this.addDamageNumber(reflectAttacker.position.x, reflectAttacker.position.y, reflectDmg, 'skill');
        this.addVisualEffect(reflectAttacker.position.x, reflectAttacker.position.y, 'lightning_reflect', '⚡');
        
        // ?拇??餅???
        reflectAttacker.effects.stunned = now + reflectStun;
        
        if (typeof particleSystem !== 'undefined' && particleSystem) {
          particleSystem.createLightningGuardEffect(target.position.x, target.position.y);
        }
        
        // 瑼Ｘ??捏
        if (reflectAttacker.hp <= 0) {
          this.gameState.winner = reflectAttacker === this.players.player1 ? 'player2' : 'player1';
          this.addVisualEffect(reflectAttacker.position.x, reflectAttacker.position.y, 'death', '💀');
        }
      }
    }
    
    // 瑼Ｘ??啗???
    const attacker = this.getAttackerFromSource(source);
    if (attacker && attacker !== target) {
      this.checkFlameMarkBurn(target, attacker, damage);
    }
    
    // 蝣箔??瑕拿?箸??
    damage = Math.round(damage);
    
    // ?弩 銵銋風?曉?嗅摰?
    if (target.effects.bloodShield > 0) {
      const absorbed = Math.min(target.effects.bloodShield, damage);
      target.effects.bloodShield -= absorbed;
      damage -= absorbed;
      if (absorbed > 0) {
        this.addVisualEffect(target.position.x, target.position.y, 'shield_absorb', '🛡️');
      }
    }
    
    target.hp = Math.max(0, target.hp - damage);
    
    // ? ???蝟餌絞
    const comboAttackerId = target === this.players.player1 ? 'player2' : 'player1';
    
    if (this.gameState.lastHitTime[comboAttackerId] && now - this.gameState.lastHitTime[comboAttackerId] < 2000) {
      // 2蝘????餅?蝞??
      this.gameState.comboCount[comboAttackerId] = (this.gameState.comboCount[comboAttackerId] || 0) + 1;
    } else {
      // ?蔭???
      this.gameState.comboCount[comboAttackerId] = 1;
    }
    this.gameState.lastHitTime[comboAttackerId] = now;
    
    // ?? ?芰??? - ?餅??銝剜?撠?芰?憌??萎犖嚗?.2蝘????瑕拿
    if (source !== 'snowball') {
      const attacker2 = this.getAttackerFromSource(source);
      if (attacker2 && attacker2 !== target && attacker2.effects.snowballBuff > now && attacker2.effects.snowballCharges > 0) {
        const atkSkill = attacker2.skills?.normal;
        const snowDmg = atkSkill?.blue?.snowballDamage || 5;
        attacker2.effects.snowballCharges--;
        const atkSide = attacker2 === this.players.player1 ? 'player1' : 'player2';
        
        // 撱箇?憌??芰?閬死??
        this.gameState.effects.push({
          type: 'snowball_fly',
          startX: attacker2.position.x,
          startY: attacker2.position.y - 30,
          targetRef: target,
          startTime: now,
          duration: 200
        });
        
        // 0.2蝘????瑕拿
        const gameRef = this;
        const targetRef = target;
        setTimeout(() => {
          if (gameRef.gameState.winner) return;
          targetRef.hp = Math.max(0, targetRef.hp - snowDmg);
          gameRef.addDamageNumber(targetRef.position.x, targetRef.position.y, snowDmg, 'skill');
          gameRef.addVisualEffect(targetRef.position.x, targetRef.position.y, 'snowball_hit', '❄️');
          gameRef.addCombatLog(`冰雪擊中敵人！造成${snowDmg}傷害！`, atkSide, 'damage');
          
          if (typeof particleSystem !== 'undefined' && particleSystem) {
            particleSystem.createEnchantOrbEffect(targetRef.position.x, targetRef.position.y);
          }
          
          // ?芰??捏瑼Ｘ
          if (targetRef.hp <= 0) {
            gameRef.gameState.winner = targetRef === gameRef.players.player1 ? 'player2' : 'player1';
            gameRef.addVisualEffect(targetRef.position.x, targetRef.position.y, 'death', '💀');
          }
        }, 200);
        
        if (attacker2.effects.snowballCharges <= 0) {
          attacker2.effects.snowballBuff = 0;
          this.addCombatLog(`?芰??冽瘨??瓩`, atkSide, 'status');
        }
      }
    }
    
    // 嚙踢??閫貊???
    this.triggerHitFlash(target);
    
    // ? ?萄遣憓撥?賭葉?寞?
    const isCritical = damage >= 15;
    if (typeof particleSystem !== 'undefined' && particleSystem && particleSystem.createEnhancedHitEffect) {
      particleSystem.createEnhancedHitEffect(target.position.x, target.position.y, damage, isCritical);
    }
    
    // ? ?萄遣???頠楚?寞?
    const comboCount = this.gameState.comboCount[comboAttackerId] || 1;
    if (comboCount >= 3 && typeof particleSystem !== 'undefined' && particleSystem && particleSystem.createComboTrail) {
      particleSystem.createComboTrail(target.position.x, target.position.y, comboCount);
    }
    
    // ?寞??瑕拿憿?憿舐內?詨?
    let damageType = 'normal';
    if (damage >= 15) damageType = 'critical'; // 憭批摰喟??湔?
    if (source && source.type === 'skill') damageType = 'skill';
    
    this.addDamageNumber(target.position.x, target.position.y, damage, damageType);
    if (attacker && attacker !== target) {
      this.spawnCombatFlourish('impact', attacker, target, damage >= 15 ? 1.45 : damage >= 10 ? 1.15 : 0.9);
    }
    result.hit = true;
    
    // 瑼Ｘ?蝯?
    if (target.hp <= 0) {
      this.gameState.winner = target === this.players.player1 ? 'player2' : 'player1';
      
      // ? KO?⊿??
      this.triggerCameraShake(20, 500);
      
      this.addVisualEffect(target.position.x, target.position.y, 'death', '💀');
    }
    
    return result;
  }

  // ?? ?湔?蔣?澈蝟餌絞
  updateShadowClones(deltaTime) {
    const now = Date.now();
    
    ['player1', 'player2'].forEach(playerId => {
      const clones = this.gameState.shadowClones[playerId];
      const player = this.players[playerId];
      const opponent = this.players[playerId === 'player1' ? 'player2' : 'player1'];
      
      // === 敶勗?頨恬?憭扳?嚗??===
      if (player && opponent && clones.length > 0) {
        // 蝘駁???澈
        this.gameState.shadowClones[playerId] = clones.filter(clone => {
          if (now >= clone.expiresAt) {
            if (typeof particleSystem !== 'undefined' && particleSystem) {
              particleSystem.createShadowCloneEffect(clone.x, clone.y);
            }
            return false;
          }
          return true;
        });
        
        // ?湔銝行??
        this.gameState.shadowClones[playerId].forEach(clone => {
          if (now >= clone.attackCooldown) {
            const distance = Math.abs(clone.x - opponent.position.x);
            if (distance <= 75) {
              const skill = player.skills.ultimate;
              this.dealDamage(opponent, skill.cloneDamage, 'shadow_clone');
              clone.attackCooldown = now + player.attackSpeed;
              this.addVisualEffect(clone.x, clone.y, 'clone_attack', '🌀');
              if (typeof particleSystem !== 'undefined' && particleSystem) {
                particleSystem.createShadowStrikeEffect(clone.x, clone.y, clone.facing);
              }
            }
          }
        });
      }
      
      // === 暺?敶勗?嚗?嚗?堆???皜 + ?芯蜓?餅? ===
      const mimic = this.gameState.shadowMimic[playerId];
      if (!mimic || !player) return;
      
      // ??皜
      if (now >= mimic.expiresAt) {
        if (typeof particleSystem !== 'undefined' && particleSystem) {
          particleSystem.createShadowCloneEffect(mimic.x, mimic.y);
        }
        this.gameState.shadowMimic[playerId] = null;
        return;
      }
      
      // 敶勗???嚗?敶勗?雿蔭????蝵格捱摰?
      if (opponent) {
        mimic.facing = opponent.position.x >= mimic.x ? 1 : -1;
      }
      
      // ?? 敶勗??芯蜓?餅?嚗?? 75px ?找??餅??瑕憟賭?撠望?
      if (opponent && now >= (mimic.attackCooldown || 0)) {
        const dist = Math.abs(mimic.x - opponent.position.x);
        const yDist = Math.abs(mimic.y - opponent.position.y);
        if (dist <= 75 && yDist <= 80) {
          const shadowDmg = Math.round(player.attackDamage * (mimic.dmgRatio || (2 / 3)));
          if (shadowDmg > 0) {
            this.dealDamage(opponent, shadowDmg, 'shadow_mimic');
            mimic.attackCooldown = now + (player.attackSpeed || 700);
            this.addVisualEffect(mimic.x, mimic.y, 'clone_attack', '🌀');
            if (typeof particleSystem !== 'undefined' && particleSystem) {
              particleSystem.createShadowStrikeEffect(mimic.x, mimic.y, mimic.facing);
            }
          }
        }
      }
    });
  }

  // ? 蝎暸???蝟餌絞?湔嚗?啣???+ ?蝘餃? + 霅瑞泵頛芾?嚗?
  updateRangerSystems() {
    const now = Date.now();

    // === ?? 敶?蔭?? / 鋆‵摰? ===
    ['player1', 'player2'].forEach(playerId => {
      const player = this.players[playerId];
      if (!player || player.id !== 'ranger') return;
      if (player.rangerAmmo === undefined) player.rangerAmmo = player.ammoMax || 7;
      // ?蔭 2.1s ?芸?憛急遛
      if (player.rangerLastShotTime && (now - player.rangerLastShotTime) >= (player.ammoIdleRefill || 2100)) {
        player.rangerAmmo = player.ammoMax || 7;
        player.rangerReloadUntil = 0;
        player.rangerLastShotTime = 0;
      }
      // 鋆‵??唳?敺?憛急遛
      if (player.rangerReloadUntil && player.rangerReloadUntil <= now) {
        player.rangerAmmo = player.ammoMax || 7;
        player.rangerReloadUntil = 0;
      }
    });

    // === 霅瑞泵頛芾??湔 ===
    ['player1', 'player2'].forEach(playerId => {
      const player = this.players[playerId];
      if (!player) return;
      
      const talisman = player.effects.talismanState;
      if (talisman && talisman.phase === 'cycling') {
        const skill = player.skills.normal;
        if (now - talisman.lastCycleTime >= skill.cycleInterval) {
          talisman.currentIndex = (talisman.currentIndex + 1) % talisman.colors.length;
          talisman.lastCycleTime = now;
        }
        // ?芸?頞??? (5蝘蝣箄?)
        if (now - talisman.startTime > 5000) {
          player.effects.talismanState = null;
          this.addCombatLog(`暈眩結束了！`, playerId, 'status');
        }
      }
    });
    
    // === ?怎????===
    if (!this.gameState.fireZones) this.gameState.fireZones = [];
    this.gameState.fireZones = this.gameState.fireZones.filter(zone => {
      if (now >= zone.expiresAt) return false;
      
      // 瑼Ｘ?菜?拙振?臬?典??
      const opponentId = zone.ownerId === 'player1' ? 'player2' : 'player1';
      const opponent = this.players[opponentId];
      if (!opponent || opponent.hp <= 0) return true;
      
      const dist = Math.abs(opponent.position.x - zone.x);
      if (dist <= zone.radius + 40) {
        // 瘥??瑕拿?文?
        if (now - zone.lastTick >= 1000) {
          this.dealDamage(opponent, 2, zone.ownerId);
          this.addVisualEffect(opponent.position.x, opponent.position.y, 'fire_burn', '🔥');
          zone.lastTick = now;
          
          // ?怎蝎?
          if (typeof particleSystem !== 'undefined' && particleSystem) {
            particleSystem.createFearFireZoneEffect(zone.x, zone.y);
          }
        }
        
        // ???? - 撘瑕雿宏100px???孵?
        if (opponent.effects.feared <= now && !(opponent.effects.dashImmune > now)) {
          const fearDir = opponent.position.x > zone.x ? 1 : -1;
          opponent.effects.feared = now + 800;
          opponent.effects.fearDirection = fearDir;
          opponent.effects.fearStartX = opponent.position.x;
          this.addVisualEffect(opponent.position.x, opponent.position.y, 'fear', '😱');
          this.addCombatLog(`${opponent.name} 鋡急??潘?`, opponentId, 'damage');
        }
      }
      
      return true;
    });
    
    // === ?撘瑕雿宏?湔 ===
    ['player1', 'player2'].forEach(playerId => {
      const player = this.players[playerId];
      if (!player) return;
      
      if (player.effects.feared > now) {
        const movedDist = Math.abs(player.position.x - player.effects.fearStartX);
        if (movedDist < 100) {
          // 撘瑕???潭?宏??
          player.position.x += player.effects.fearDirection * 5; // 5px per frame
          player.position.x = Math.max(80, Math.min(this.canvasWidth - 80, player.position.x));
        } else {
          // 撌脣????潔?蝘?
          player.effects.feared = 0;
        }
      }
    });
  }

  // ========== ?弩 銵憟??頂蝯?==========

  // ?弩 ?貉??儔 + 銵銋風?暹滯??
  applyBloodHeal(player, healAmount, playerSide) {
    const maxHp = player.maxHp;
    const currentHp = player.hp;
    const now = Date.now();
    // ?? ??憭扳???皜?
    if (player.effects.healReduction > now) {
      healAmount = Math.floor(healAmount * (1 - (player.effects.healReductionPercent || 0)));
    }
    const actualHeal = Math.min(healAmount, maxHp - currentHp);
    const overflow = healAmount - actualHeal;
    
    player.hp = Math.min(maxHp, currentHp + actualHeal);
    
    if (actualHeal > 0) {
      this.addDamageNumber(player.position.x, player.position.y, actualHeal, 'heal');
    }
    
    // 皞Ｗ頧??箄?銋風??
    if (overflow > 0 && player.id === 'warlock') {
      const cap = player.passive?.shieldCap || 15;
      const oldShield = player.effects.bloodShield || 0;
      player.effects.bloodShield = Math.min(cap, oldShield + overflow);
      if (player.effects.bloodShield > oldShield) {
        this.addVisualEffect(player.position.x, player.position.y, 'blood_shield', '🛡️');
      }
    }
  }

  // ?弩 擙株??琿??瑁?
  executeBloodShackles(player, opponent, skill, playerSide, playerId) {
    const now = Date.now();
    
    // 瘨????0%嚗?雿?暺?
    const hpCost = Math.max(2, Math.floor(player.hp * 0.1));
    player.hp -= hpCost;
    this.addDamageNumber(player.position.x, player.position.y, hpCost, 'skill');
    this.addCombatLog(`${player.name} 消耗${hpCost} HP 使用鮮血枷鎖！`, playerSide, 'skill');
    
    // ?⊥?改????抵??????
    const boltDir = opponent.position.x >= player.position.x ? 1 : -1;
    
    // ?澆?銵??撠
    const bolt = {
      x: player.position.x + (30 * boltDir),
      y: player.position.y - 20,
      direction: boltDir,
      speed: player.projectileSpeed || 400,
      damage: skill.burstDamage,
      type: 'bloodShackle',
      skill: { knockback: 0 },
      owner: player,
      startTime: now,
      tetherDuration: skill.tetherDuration,
      drainPerSecond: skill.drainPerSecond,
      healPerSecond: skill.healPerSecond,
      breakDistance: skill.breakDistance
    };
    this.gameState.projectiles.push(bolt);
  }

  // ?? 銵???砍銵?
  executeBloodDevour(player, opponent, skill, playerSide, playerId) {
    const now = Date.now();
    const distance = Math.abs(player.position.x - opponent.position.x);
    
    // ?閬銝摰????賣
    if (distance > 200) {
      this.addCombatLog(`距離太遠！`, playerSide, 'status');
      // ????
      this.cooldowns[playerId].ultimate = 0;
      return;
    }
    
    this.addCombatLog(`${player.name} 雿輻銵???穿?`, playerSide, 'skill');
    
    // 撱箇??蝺?
    player.effects.bloodCurseTether = {
      target: opponent,
      owner: player,
      startTime: now,
      duration: skill.duration,
      damagePerTick: skill.damagePerTick,
      healPerTick: skill.healPerTick,
      tickInterval: skill.tickInterval,
      lastTickTime: now,
      tickCount: 0
    };
    
    this.addVisualEffect(player.position.x, player.position.y, 'blood_curse', '🩸');
  }

  // ???砍蔣??- 蝛輸???00px + 皜?
  executeFlashCut(player, opponent, skill, playerSide, playerId) {
    const now = Date.now();
    const startX = player.position.x;

    // ?? ?祉宏?啣???敺?撠??Ｗ??????箇?典椰????鈭衣嚗?
    const behindOffset = 60 * (-opponent.facing);
    player.position.x = Math.max(80, Math.min(this.canvasWidth - 80,
      opponent.position.x + behindOffset
    ));
    // ?Ｗ?撠?嚗?????
    player.facing = opponent.facing > 0 ? -1 : 1;

    // ???瑕拿 ???急????啗??箏?雿蔭嚗蝙?孵??折蝳血摰迤蝣?
    const postDashX = player.position.x;
    const postFacing = player.facing;
    player.position.x = startX;
    player.facing = startX < opponent.position.x ? 1 : -1;
    const damageResult = this.dealDamageWithResult(opponent, skill.damage, playerId);
    player.position.x = postDashX;
    player.facing = postFacing;
    if (damageResult.hit) {
      this.addCombatLog(`?砍蔣?砍銝哨??? ${skill.damage} ?瑕拿銝衣楨??`, playerSide, 'damage');
      opponent.effects.slowed = now + skill.slowDuration;
      opponent.effects.slowPercent = Math.max(opponent.effects.slowPercent || 0, skill.slowPercent);
      this.addVisualEffect(opponent.position.x, opponent.position.y, 'slow', '??');
      if (typeof particleSystem !== 'undefined' && particleSystem) {
        particleSystem.createSkillEffect(skill.code, player.position.x, player.position.y, player.facing);
      }
    } else {
      this.addCombatLog(`?砍蔣?穿?`, playerSide, 'status');
    }

    // 畾蔣?寞?
    this.gameState.effects.push({
      type: 'flashCutTrail',
      startX: startX,
      endX: player.position.x,
      y: player.position.y - 30,
      startTime: now,
      duration: 400
    });
  }

  // ?? 撅?繚銝??- 0.5蝘????祉宏?唾?敺?+ 撌券??瑕拿 + ?刻撟?頧?
  executeIaiFlash(player, opponent, skill, playerSide, playerId) {
    const now = Date.now();

    // ?脣?????0.5蝘?
    player.effects.casting = now + skill.channelTime;
    this.addCombatLog(`正在蓄力..`, playerSide, 'status');
    this.addVisualEffect(player.position.x, player.position.y, 'channel', '⚔️');

    setTimeout(() => {
      if (!this.players[playerId] || this.gameState.winner) return;

      // ??蝯?嚗蝘餃撠?甇?餈???
      const preIaiX = player.position.x;
      const preIaiFacing = player.facing;
      const frontOffset = 60 * (-opponent.facing);
      player.position.x = Math.max(80, Math.min(this.canvasWidth - 80,
        opponent.position.x - frontOffset
      ));
      player.facing = opponent.position.x > player.position.x ? 1 : -1;

      // ??撌券??瑕拿嚗鋡恍蝳行?雿????急???雿蔭嚗蝙?孵??折蝳血摰迤蝣?
      const postIaiX = player.position.x;
      const postIaiFacing = player.facing;
      player.position.x = preIaiX;
      player.facing = preIaiFacing;
      const damageResult = this.dealDamageWithResult(opponent, skill.damage, playerId);
      player.position.x = postIaiX;
      player.facing = postIaiFacing;
      if (damageResult.hit) {
        this.addCombatLog(`居合一閃！造成 ${skill.damage} 點瞬殺傷害！`, playerSide, 'damage');
        this.triggerCameraShake(15, 500);
      }

      // ?寞?
      if (typeof particleSystem !== 'undefined' && particleSystem) {
        particleSystem.createSkillEffect(skill.code, opponent.position.x, opponent.position.y, player.facing);
      }

      this.triggerScreenInvert(skill.invertDuration || 300);

      this.gameState.effects.push({
        type: 'iaiSlashLine',
        startTime: Date.now(),
        duration: skill.slashLineDuration || 600
      });
    }, skill.channelTime);
  }

  // ??Screen invert effect for Iai Flash
  triggerScreenInvert(duration) {
    const wrapper = document.getElementById('gameCanvas');
    if (wrapper) {
      wrapper.style.filter = 'invert(1)';
      setTimeout(() => {
        wrapper.style.filter = '';
      }, duration);
    }
  }

  // ?? ?予撖拙?澆?嚗???菜?2.5蝘?孛?潘?
  fireJudgment(playerId) {
    const player = this.players[playerId];
    const opponent = this.players[playerId === 'player1' ? 'player2' : 'player1'];
    const now = Date.now();
    const playerSide = playerId;
    
    if (!player || !player.spiritChargeStart) return;
    
    const skill = player.skills.ultimate;
    const minCharge = skill.minChargeTime || 1000;
    const maxCharge = skill.maxChargeTime || 2500;
    const chargeTime = Math.max(minCharge, Math.min(maxCharge, now - player.spiritChargeStart));
    
    // ?瑕拿嚗?雿???7暺?瘥?0.2蝘?1暺??擃?4暺?
    const extraTicks = Math.floor((chargeTime - minCharge) / (skill.tickInterval || 200));
    const judgmentDamage = (skill.baseDamage || 7) + extraTicks;
    
    // 皜?????
    if (player.spiritChargeTimer) {
      clearTimeout(player.spiritChargeTimer);
      player.spiritChargeTimer = null;
    }
    player.spiritChargeStart = null;
    player.effects.casting = 0;
    
    const distance = Math.abs(player.position.x - opponent.position.x);
    
    if (distance <= skill.range) {
      opponent.hp = Math.max(1, opponent.hp - judgmentDamage);
      this.addDamageNumber(opponent.position.x, opponent.position.y, judgmentDamage, 'skill');
      
      let healAmount = skill.baseHeal + Math.floor(judgmentDamage * skill.healPercent);
      // ?? ??憭扳???皜?
      if (player.effects.healReduction > now) {
        healAmount = Math.floor(healAmount * (1 - (player.effects.healReductionPercent || 0)));
      }
      player.hp = Math.min(player.maxHp, player.hp + healAmount);
      
      this.addVisualEffect(opponent.position.x, opponent.position.y, 'judgment_hit', '👁️');
      this.addVisualEffect(player.position.x, player.position.y, 'heal_judgment', '💚');
      this.addDamageNumber(player.position.x, player.position.y - 30, healAmount, 'heal');
      this.addCombatLog(
        `靈天審判！蓄力${(chargeTime / 1000).toFixed(1)}s，造成 ${judgmentDamage} 點傷害！`,
        playerSide, 'skill'
      );
      
      if (typeof particleSystem !== 'undefined' && particleSystem) {
        this.createJudgmentEffect(player.position.x, player.position.y, skill.range);
      }
      
      if (opponent.hp <= 0) {
        this.gameState.winner = opponent === this.players.player1 ? 'player2' : 'player1';
        this.addVisualEffect(opponent.position.x, opponent.position.y, 'death', '💀');
      }
    } else {
      this.addCombatLog(`靈天審判：距離太遠未命中`, playerSide, 'status');
    }
    
    this.updateHealthBars();
  }

  // ?? ?菜葫?予撖拙?暸??
  _tryReleaseJudgment(playerId) {
    const player = this.players[playerId];
    if (!player || !player.spiritChargeStart) return;
    const skill = player.skills.ultimate;
    const chargeTime = Date.now() - player.spiritChargeStart;
    if (chargeTime >= (skill.minChargeTime || 1000)) {
      this.fireJudgment(playerId);
    } else {
      // ??銝雲嚗?瘨蒂????
      clearTimeout(player.spiritChargeTimer);
      player.spiritChargeStart = null;
      player.spiritChargeTimer = null;
      player.effects.casting = 0;
      this.cooldowns[playerId].ultimate = 0;
      this.addCombatLog(`暈眩結束了！`, playerId, 'status');
    }
  }

  // ?弩 ?湔銵憟??頂蝯?
  updateWarlockSystems() {
    const now = Date.now();
    
    Object.entries(this.players).forEach(([playerId, player]) => {
      if (!player) return;
      
      // --- 擙株??琿??賜? tick ---
      if (player.effects.bloodTether) {
        const tether = player.effects.bloodTether;
        const target = tether.target;
        const dist = Math.abs(player.position.x - target.position.x);
        
        // 頝?瑁?瑼Ｘ
        if (dist > tether.breakDistance) {
          this.addCombatLog(`暈眩結束了！`, playerId, 'status');
          player.effects.bloodTether = null;
          return;
        }
        
        // ????瑼Ｘ
        if (now - tether.startTime > tether.duration) {
          player.effects.bloodTether = null;
          return;
        }
        
        // 瘥??貉?tick
        if (now - tether.lastTickTime >= 1000) {
          tether.lastTickTime = now;
          this.dealDamage(target, tether.drainPerSecond, playerId);
          this.applyBloodHeal(player, tether.healPerSecond, playerId);
          this.addCombatLog(`鮮血牽線吸取 ${tether.drainPerSecond}`, playerId, 'damage');
        }
      }
      
      // --- 銵???祉蝺?tick ---
      if (player.effects.bloodCurseTether) {
        const curse = player.effects.bloodCurseTether;
        const target = curse.target;
        
        // ????瑼Ｘ
        if (now - curse.startTime > curse.duration) {
          player.effects.bloodCurseTether = null;
          return;
        }
        
        // ??蝣啗孛?瑁?嚗鈭箄孛蝣啣????
        if (target.position.x <= 85 || target.position.x >= this.canvasWidth - 85) {
          this.addCombatLog(`暈眩結束了！`, playerId, 'status');
          player.effects.bloodCurseTether = null;
          return;
        }
        
        // 瘥?tick
        if (now - curse.lastTickTime >= curse.tickInterval) {
          curse.lastTickTime = now;
          curse.tickCount++;
          this.dealDamage(target, curse.damagePerTick, playerId);
          this.applyBloodHeal(player, curse.healPerTick, playerId);
          this.addCombatLog(`血咒持續！造成${curse.damagePerTick}傷害+回復${curse.healPerTick}`, playerId, 'damage');
        }
      }
    });
  }

  // ?弩 皜脫??賜???
  renderTethers() {
    const ctx = this.ctx;
    const now = Date.now();
    
    Object.values(this.players).forEach(player => {
      if (!player) return;
      
      // 擙株??琿? - 蝝啁蝺?
      if (player.effects.bloodTether) {
        const target = player.effects.bloodTether.target;
        const elapsed = now - player.effects.bloodTether.startTime;
        const alpha = 0.6 + Math.sin(elapsed * 0.005) * 0.2;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#E53935';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.shadowColor = '#FF1744';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(player.position.x, player.position.y - 20);
        ctx.lineTo(target.position.x, target.position.y - 20);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
        ctx.restore();
      }
      
      // 銵????- 蝎蝺?
      if (player.effects.bloodCurseTether) {
        const target = player.effects.bloodCurseTether.target;
        const elapsed = now - player.effects.bloodCurseTether.startTime;
        const pulse = 0.5 + Math.sin(elapsed * 0.008) * 0.3;
        
        ctx.save();
        // Outer glow
        ctx.globalAlpha = pulse * 0.4;
        ctx.strokeStyle = '#4A0000';
        ctx.lineWidth = 10;
        ctx.shadowColor = '#B71C1C';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(player.position.x, player.position.y - 20);
        ctx.lineTo(target.position.x, target.position.y - 20);
        ctx.stroke();
        
        // Inner line
        ctx.globalAlpha = pulse;
        ctx.strokeStyle = '#FF1744';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(player.position.x, player.position.y - 20);
        ctx.lineTo(target.position.x, target.position.y - 20);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        ctx.restore();
      }
    });
  }

  updateEffects() {
    const now = Date.now();

    // ?湔?拙振?????
    Object.values(this.players).forEach(player => {
      if (!player) return;

      const playerId = player === this.players.player1 ? 'player1' : 'player2';
      this.updateBeastmasterState(player, playerId, now);

      // ? ?賊??CC嚗??單??斗?嗆???
      if (player.effects.superArmor > now) {
        if (player.effects.stunned > now) player.effects.stunned = 0;
        if (player.effects.slowed > now) player.effects.slowed = 0;
        if (player.effects.rooted > now) player.effects.rooted = 0;
      }

      // ?????瑕拿
      if (player.effects.burning > now && player.effects.burnTickTime <= now) {
        const burnDamage = 1;
        if (player.id === 'beastmaster' && player.isGolem && player.golemShield > 0) {
          player.golemShield = Math.max(0, player.golemShield - burnDamage);
          if (player.golemShield <= 0) {
            this.revertBeastForm(player, playerId, true);
          }
        } else {
          player.hp = Math.max(0, player.hp - burnDamage);
        }
        player.effects.burnTickTime = now + 1000;

        this.addDamageNumber(player.position.x, player.position.y, burnDamage);
        this.addVisualEffect(player.position.x, player.position.y, 'burn_tick', '🔥');

        this.createBurningEffect(player.position.x, player.position.y);

        if (player.hp <= 0) {
          this.gameState.winner = player === this.players.player1 ? 'player2' : 'player1';
          this.addVisualEffect(player.position.x, player.position.y, 'death', '💀');
        }
      }

      // ?? ??瘥?DoT?瑕拿
      if (player.effects.poisonStacks > 0 && player.effects.poisonDotEnd > now && player.effects.poisonTickTime <= now) {
        const poisonDmg = player.effects.poisonStacks; // 瘥惜1暺?蝘?
        if (player.id === 'beastmaster' && player.isGolem && player.golemShield > 0) {
          player.golemShield = Math.max(0, player.golemShield - poisonDmg);
          if (player.golemShield <= 0) {
            this.revertBeastForm(player, playerId, true);
          }
        } else {
          player.hp = Math.max(0, player.hp - poisonDmg);
        }
        player.effects.poisonTickTime = now + 1000;

        this.addDamageNumber(player.position.x, player.position.y, poisonDmg);
        this.addVisualEffect(player.position.x, player.position.y, 'poison_tick', '☠️');

        if (typeof particleSystem !== 'undefined' && particleSystem) {
          particleSystem.createPoisonDotEffect(player.position.x, player.position.y);
        }

        if (player.hp <= 0) {
          this.gameState.winner = player === this.players.player1 ? 'player2' : 'player1';
          this.addVisualEffect(player.position.x, player.position.y, 'death', '💀');
        }
      }

      // ?? 瘥??唳?皜
      if (player.effects.poisonDotEnd > 0 && player.effects.poisonDotEnd <= now) {
        player.effects.poisonStacks = 0;
        player.effects.poisonDotEnd = 0;
      }

      // ? 摰澈????嚗??賜宏??
      if (player.effects.rooted > now) {
        // 摰澈?蝘餃????摩銝剜炎?伐??ㄐ蝣箔?閬死?內
      }

      // 皜????
      const nonTimestampEffects = ['poisonStacks', 'rangerPassiveCount', 'snowballCharges', 'fearDirection', 'fearStartX', 'lightningGuardFlatDR', 'talismanState', 'bloodShield', 'bloodTether', 'bloodCurseTether']; // ??甈?銝???喉?銝?冽???頛???
      Object.keys(player.effects).forEach(effect => {
        if (nonTimestampEffects.includes(effect)) return;
        if (player.effects[effect] < now && player.effects[effect] > 0) {
          if (effect === 'defending') {
          }
          if (effect === 'burning') {
            this.addVisualEffect(player.position.x, player.position.y, 'burn_end', '🔥');
          }
          player.effects[effect] = 0;
        }
      });
    });

    // ?湔??寞?
    this.gameState.effects = this.gameState.effects.filter(effect => {
      // ?予撖拙?內?剁??芾??賣????刻??停??摮
      if (effect.type === 'judgment_indicator') {
        const caster = effect.casterKey ? this.players[effect.casterKey] : null;
        return !!(caster && caster.spiritChargeStart);
      }
      const elapsed = now - effect.startTime;
      return elapsed < effect.duration;
    });
  }

  // ??? ? Puppeteer: Update System ???
  updatePuppeteerSystems(deltaTime) {
    const now = Date.now();

    ['player1', 'player2'].forEach(pid => {
      const player = this.players[pid];
      if (!player || player.id !== 'puppeteer') return;

      const puppet = this.gameState.puppet[pid];
      if (!puppet || !puppet.active) return;

      // 傀儡不再跟隨本體：只會朝敵人前進，但永遠不超過本體 150px。
      const opponent = this.players[pid === 'player1' ? 'player2' : 'player1'];
      const advanceLimit = player.skills.normal.puppetAdvanceLimit || 150;
      const rawSpeed = player.skills.normal.puppetSpeed || 240;
      const frameScale = Math.min((deltaTime || 16.6667) / 16.6667, 3);
      const moveStep = rawSpeed * 0.016 * frameScale;
      const targetX = opponent?.position?.x ?? puppet.x;
      const dx = targetX - puppet.x;

      if (Math.abs(dx) > 2) {
        const dir = Math.sign(dx);
        puppet.facing = dir;
        const nextX = puppet.x + dir * Math.min(Math.abs(dx), moveStep);
        const leashMin = player.position.x - advanceLimit;
        const leashMax = player.position.x + advanceLimit;
        puppet.x = Math.max(leashMin, Math.min(leashMax, nextX));
      }

      // 本體移動也不能讓傀儡超過 150px；維持在繃緊的絲線邊界，而不是自動消失。
      puppet.x = Math.max(player.position.x - advanceLimit, Math.min(player.position.x + advanceLimit, puppet.x));
      puppet.x = Math.max(80, Math.min(this.canvasWidth - 80, puppet.x));
      if (opponent) puppet.facing = opponent.position.x >= puppet.x ? 1 : -1;
    });

    // Update smoke zones
    this.gameState.puppetSmoke = this.gameState.puppetSmoke.filter(smoke => {
      if (now >= smoke.expiresAt) return false;

      // Tick damage
      if (now - smoke.lastTick >= smoke.tickInterval) {
        smoke.lastTick = now;
        // Damage enemies inside
        ['player1', 'player2'].forEach(pid => {
          if (pid === smoke.ownerSide) return;
          const target = this.players[pid];
          if (!target || target.hp <= 0) return;
          const dist = Math.abs(target.position.x - smoke.x);
          if (dist <= smoke.radius) {
            this.dealDamage(target, smoke.damagePerTick, smoke.ownerSide);
            // Apply slow
            target.effects.slowed = now + smoke.tickInterval + 100;
            target.effects.slowPercent = smoke.slow;
          }
        });
      }
      return true;
    });
  }

  // ??? ? Puppeteer: Deploy / Recall Puppet ???
  executePuppetDeploy(player, opponent, skill, playerSide, playerId) {
    const now = Date.now();
    const puppet = this.gameState.puppet[playerId];

    if (puppet && puppet.active) {
      // Recall puppet
      puppet.active = false;
      this.addCombatLog(`${player.name} ?嗅???∴?`, playerSide, 'status');
      this.addVisualEffect(puppet.x, puppet.y - 20, 'puppet_recall', '💨');

      const storedDamage = Math.floor(puppet.storedDamage || 0);
      if (storedDamage > 0 && opponent?.hp > 0) {
        this.dealDamageWithResult(opponent, storedDamage, playerId);
        this.addDamageNumber(opponent.position.x, opponent.position.y - 35, storedDamage, 'skill');
        this.addCombatLog(`傀儡收回！釋放儲存的${storedDamage}點傷害！`, playerSide, 'damage');
      }

      if (typeof particleSystem !== 'undefined' && particleSystem) {
        for (let i = 0; i < 8; i++) {
          particleSystem.particles.push({
            x: puppet.x, y: puppet.y - 20,
            vx: (Math.random() - 0.5) * 80,
            vy: -40 - Math.random() * 40,
            size: 3 + Math.random() * 3,
            color: '#D8B4FE',
            life: 400 + Math.random() * 300,
            maxLife: 700, alpha: 1, type: 'spark'
          });
        }
      }
    } else {
      // 從敵人的反方向 150px 召出，再讓傀儡一路朝敵人推進。
      const spawnDistance = skill.puppetSpawnDistance || 150;
      const enemyDirection = opponent && opponent.position.x < player.position.x ? -1 : 1;
      const spawnX = player.position.x - enemyDirection * spawnDistance;
      this.gameState.puppet[playerId] = {
        active: true,
        x: Math.max(80, Math.min(this.canvasWidth - 80, spawnX)),
        y: player.position.y,
        facing: enemyDirection,
        hp: skill.puppetHp || 30,
        maxHp: skill.puppetHp || 30,
        storedDamage: 0,
        spawnTime: now
      };
      this.addCombatLog(`${player.name} ?砍???∴?`, playerSide, 'skill');
      this.addVisualEffect(spawnX, player.position.y - 20, 'puppet_deploy', '🎭');

      if (typeof particleSystem !== 'undefined' && particleSystem) {
        for (let i = 0; i < 15; i++) {
          const angle = (Math.PI * 2 / 15) * i;
          particleSystem.particles.push({
            x: spawnX, y: player.position.y - 20,
            vx: Math.cos(angle) * 60,
            vy: Math.sin(angle) * 60 - 20,
            size: 3 + Math.random() * 4,
            color: Math.random() > 0.5 ? '#6A0DAD' : '#FFD700',
            life: 500 + Math.random() * 400,
            maxLife: 900, alpha: 1, type: 'spark'
          });
        }
      }
    }
  }

  // ??? ? Puppeteer: Phantom Swap Ultimate ???
  executePhantomSwap(player, opponent, skill, playerSide, playerId) {
    const now = Date.now();
    const puppet = this.gameState.puppet[playerId];

    if (!puppet || !puppet.active) {
      // No puppet: refund cooldown and warn
      this.cooldowns[playerId].ultimate = now - skill.cooldown;
      this.addCombatLog('?閬??⊥??賭蝙?典劂敶曹漱?荔?', playerSide, 'status');
      return;
    }

    // Save positions
    const playerX = player.position.x;
    const puppetX = puppet.x;

    // Swap positions
    player.position.x = puppetX;
    player.position.x = Math.max(80, Math.min(this.canvasWidth - 80, player.position.x));
    puppet.x = playerX;
    puppet.x = Math.max(80, Math.min(this.canvasWidth - 80, puppet.x));

    // Smoke zone at puppet's NEW position (where player WAS)
    this.gameState.puppetSmoke.push({
      x: puppet.x,
      y: puppet.y,
      radius: skill.smokeRadius || 100,
      ownerSide: playerId,
      expiresAt: now + (skill.swapSmokeDuration || 2000),
      damagePerTick: skill.smokeDamagePerTick || 2,
      tickInterval: skill.smokeTickInterval || 500,
      slow: skill.smokeSlow || 0.4,
      lastTick: now,
      startTime: now
    });

    // Needle burst at player's NEW position (where puppet WAS)
    const burstRadius = skill.needleBurstRadius || 120;
    const needleDmg = skill.needleBurstDamage || 8;
    const dist = Math.abs(player.position.x - opponent.position.x);
    if (dist <= burstRadius && opponent.hp > 0) {
      this.dealDamageWithResult(opponent, needleDmg, playerId);
      this.addCombatLog('????澆銝哨?', playerSide, 'damage');
      this.triggerCameraShake(6, 200);
    }

    // Visual effects
    this.addVisualEffect(playerX, player.position.y - 20, 'phantom_smoke', '💨');
    this.addVisualEffect(player.position.x, player.position.y - 30, 'phantom_needles', '💥');

    // Needle burst particles
    if (typeof particleSystem !== 'undefined' && particleSystem) {
      const needleCount = skill.needleCount || 12;
      for (let i = 0; i < needleCount; i++) {
        const angle = (Math.PI * 2 / needleCount) * i;
        particleSystem.particles.push({
          x: player.position.x, y: player.position.y - 20,
          vx: Math.cos(angle) * (120 + Math.random() * 80),
          vy: Math.sin(angle) * (120 + Math.random() * 80),
          size: 2 + Math.random() * 3,
          color: Math.random() > 0.3 ? '#FFD700' : '#6A0DAD',
          life: 500 + Math.random() * 400,
          maxLife: 900, alpha: 1, type: 'spark'
        });
      }
      // Smoke particles at old position
      for (let i = 0; i < 20; i++) {
        particleSystem.particles.push({
          x: puppet.x + (Math.random() - 0.5) * 60,
          y: puppet.y - 10 - Math.random() * 30,
          vx: (Math.random() - 0.5) * 30,
          vy: -20 - Math.random() * 30,
          size: 5 + Math.random() * 6,
          color: `rgba(100, 60, 160, ${0.4 + Math.random() * 0.3})`,
          life: 800 + Math.random() * 600,
          maxLife: 1400, alpha: 1, type: 'spark'
        });
      }
    }

    this.addCombatLog(`${player.name} ???∩漱??蝵殷?`, playerSide, 'skill');
  }

  // ? 皜脫???賜???蝷箏
  renderSkillIndicators() {
    const ctx = this.ctx;
    const now = Date.now();

    // ?? 鋆捱??蝯瘙粹??葡??
    if (this.gameState.adjudicatorDomain) {
      const domain = this.gameState.adjudicatorDomain;
      const owner = this.players[domain.ownerId];
      const centerY = owner ? owner.position.y : 550;
      const pulse = 0.65 + Math.sin(now * 0.01) * 0.2;
      const elapsed = now - (domain.expiresAt - (domain.duration || 6000));
      const domainLife = 1 - Math.max(0, elapsed) / (domain.duration || 6000);

      ctx.save();

      // ???蟡???嚗?1蝘撓瘨?
      if (elapsed < 1000) {
        const burstProgress = elapsed / 1000;
        const burstAlpha = (1 - burstProgress) * 0.55;
        // ??
        const colGrad = ctx.createLinearGradient(domain.x, centerY - 400, domain.x, centerY + 100);
        colGrad.addColorStop(0, `rgba(255, 255, 255, 0)`);
        colGrad.addColorStop(0.3, `rgba(255, 245, 200, ${burstAlpha * 0.6})`);
        colGrad.addColorStop(0.5, `rgba(255, 215, 0, ${burstAlpha})`);
        colGrad.addColorStop(0.7, `rgba(255, 245, 200, ${burstAlpha * 0.6})`);
        colGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);
        const colWidth = 60 + (1 - burstProgress) * 140;
        ctx.fillStyle = colGrad;
        ctx.fillRect(domain.x - colWidth / 2, centerY - 400, colWidth, 500);
        // ?湔?
        ctx.globalAlpha = burstAlpha * 0.7;
        ctx.strokeStyle = '#FFFDE7';
        ctx.lineWidth = 4 - burstProgress * 3;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 30;
        const ringR = domain.radius * burstProgress * 1.2;
        ctx.beginPath();
        ctx.arc(domain.x, centerY, ringR, 0, Math.PI * 2);
        ctx.stroke();
        // ????
        ctx.globalAlpha = burstAlpha * 0.5;
        ctx.strokeStyle = '#FFFDE7';
        ctx.lineWidth = 3 - burstProgress * 2;
        const crossLen = 200 * (1 - burstProgress);
        ctx.beginPath();
        ctx.moveTo(domain.x - crossLen, centerY);
        ctx.lineTo(domain.x + crossLen, centerY);
        ctx.moveTo(domain.x, centerY - crossLen);
        ctx.lineTo(domain.x, centerY + crossLen);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // ??摨
      ctx.globalAlpha = 0.14 * pulse;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(domain.x, centerY, domain.radius, 0, Math.PI * 2);
      ctx.fill();

      // ????
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 14;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.arc(domain.x, centerY, domain.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // ?? 7??瘚桀予蝘叉moji
      const scaleCount = 7;
      for (let i = 0; i < scaleCount; i++) {
        const baseAngle = (Math.PI * 2 / scaleCount) * i;
        const orbitSpeed = 0.0008 + (i % 3) * 0.0002;
        const angle = baseAngle + now * orbitSpeed;
        const orbitR = domain.radius * (0.35 + (i % 3) * 0.18);
        const floatY = Math.sin(now * 0.002 + i * 1.3) * 15;
        const sx = domain.x + Math.cos(angle) * orbitR;
        const sy = centerY + Math.sin(angle) * orbitR * 0.4 + floatY;
        const emojiAlpha = 0.5 + Math.sin(now * 0.003 + i * 0.9) * 0.3;
        ctx.globalAlpha = emojiAlpha * domainLife;
        ctx.font = `${18 + (i % 3) * 4}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚖', sx, sy);
      }

      // 璅?
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('裁決領域', domain.x, centerY - domain.radius - 14);
      ctx.restore();
    }

    // ?? 鋆捱???嗅???
    ['player1', 'player2'].forEach(pid => {
      const player = this.players[pid];
      if (!player || player.effects.parryActive <= now) return;

      const alpha = 0.35 + Math.sin(now * 0.03) * 0.25;
      const radius = 45 + Math.sin(now * 0.02) * 6;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(player.position.x, player.position.y - 30, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 0.95;
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('格擋中', player.position.x, player.position.y - 75);
      ctx.restore();
    });

    const effects = this.gameState.effects || [];

    effects.forEach(effect => {
      if (effect.type === 'judgment_indicator') {
        // 頝?賣???蝵殷????典祕???脣漲?游撐
        const caster = effect.casterKey ? this.players[effect.casterKey] : null;
        if (!caster || !caster.spiritChargeStart) return; // ??撌脩???銝?憿舐內
        const cx = caster.position.x;
        const cy = caster.position.y;

        const skill = caster.skills.ultimate;
        const minCharge = skill.minChargeTime || 1000;
        const maxCharge = skill.maxChargeTime || 2500;
        const elapsed = now - caster.spiritChargeStart;
        const chargeProgress = Math.min(elapsed / maxCharge, 1);
        const isReady = elapsed >= minCharge;
        const ringColor = isReady ? '#FFD700' : '#FF4444';
        const currentRadius = effect.maxRadius * chargeProgress;

        ctx.save();
        // ?游撐銝剔???嚗???撖西????撘蛛?
        ctx.globalAlpha = 0.3 + Math.sin(elapsed * 0.01) * 0.1;
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = isReady ? 2.5 : 1.5;
        ctx.shadowColor = ringColor;
        ctx.shadowBlur = isReady ? 18 : 8;
        ctx.setLineDash(isReady ? [8, 6] : [4, 8]);
        ctx.beginPath();
        ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
        ctx.stroke();

        // ?憭抒???蝺?嚗?刻??雲憭?憿舐內嚗?
        if (isReady) {
          ctx.globalAlpha = 0.15;
          ctx.setLineDash([4, 8]);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, effect.maxRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 憛怠????
        ctx.globalAlpha = isReady ? 0.08 : 0.04;
        ctx.setLineDash([]);
        ctx.fillStyle = ringColor;
        ctx.beginPath();
        ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        return;
      }

      if (effect.type === 'adjudicator_parry_text') {
        const elapsed = now - effect.startTime;
        const progress = Math.min(1, elapsed / effect.duration);
        const rise = progress * 28;

        ctx.save();
        ctx.globalAlpha = 1 - progress;
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#5A3E00';
        ctx.lineWidth = 2;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.strokeText(effect.text || '招架！', effect.x, effect.y - rise);
        ctx.fillText(effect.text || '招架！', effect.x, effect.y - rise);
        ctx.restore();
        return;
      }
      
      if (effect.type === 'range_indicator') {
        const elapsed = now - effect.startTime;
        const fadeProgress = elapsed / effect.duration;
        const cx = effect.x;
        const cy = effect.y;
        
        ctx.save();
        ctx.globalAlpha = 0.35 * (1 - fadeProgress);
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = effect.color;
        ctx.shadowBlur = 12;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, effect.maxRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // 憛怠????
        ctx.globalAlpha = 0.06 * (1 - fadeProgress);
        ctx.fillStyle = effect.color;
        ctx.beginPath();
        ctx.arc(cx, cy, effect.maxRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }

      if (effect.type === 'abyss_tentacle' || effect.type === 'wind_recast_pull') {
        const elapsed = now - effect.startTime;
        const progress = Math.min(elapsed / effect.duration, 1);
        const alpha = 1 - progress;

        const extendPhase = effect.type === 'wind_recast_pull' ? 0.22 : 0.38;
        let travel;
        if (progress <= extendPhase) {
          const t = progress / extendPhase;
          travel = 1 - Math.pow(1 - t, 3);
        } else {
          const t = (progress - extendPhase) / (1 - extendPhase);
          travel = Math.pow(1 - t, 1.4);
        }

        const headX = effect.startX + (effect.endX - effect.startX) * travel;
        const headY = effect.startY + (effect.endY - effect.startY) * travel;

        const tentacleOffsets = effect.type === 'wind_recast_pull'
          ? [{ sx: 0, sy: 0, wave: 1 }]
          : [
              { sx: 0, sy: 0, wave: 1 },
              { sx: -12, sy: -8, wave: -1 },
              { sx: 12, sy: 8, wave: 1 }
            ];

        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.lineCap = 'round';
        ctx.shadowColor = effect.type === 'wind_recast_pull' ? '#B3E5FC' : '#4A148C';
        ctx.shadowBlur = 12;

        tentacleOffsets.forEach((offset, index) => {
          const wiggle = Math.sin((elapsed * 0.03) + index * 1.7) * 18 * offset.wave;
          const startX = effect.startX + offset.sx;
          const startY = effect.startY + offset.sy;
          const endX = headX + offset.sx * 0.4;
          const endY = headY + offset.sy * 0.4;
          const midX = (startX + endX) * 0.5;
          const midY = (startY + endY) * 0.5;

          ctx.strokeStyle = effect.type === 'wind_recast_pull'
            ? (index === 0 ? '#B3E5FC' : '#81D4FA')
            : (index === 0 ? '#2E0F5D' : '#3A1A70');
          ctx.lineWidth = effect.type === 'wind_recast_pull'
            ? (index === 0 ? 6 : 4)
            : (index === 0 ? 7 : 5);
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.bezierCurveTo(
            midX - 40,
            midY - 55 + wiggle,
            midX + 40,
            midY + 35 - wiggle,
            endX,
            endY
          );
          ctx.stroke();
        });

        ctx.restore();
      }

      if (effect.type === 'boulder_warning') {
        const elapsed = now - effect.startTime;
        const progress = Math.min(elapsed / effect.duration, 1);
        const pulse = 0.55 + Math.sin(now * 0.02) * 0.25;

        ctx.save();
        ctx.globalAlpha = Math.max(0.2, 1 - progress) * pulse;
        ctx.strokeStyle = '#FF2D2D';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.ellipse(effect.x, effect.y, effect.radiusX || 60, effect.radiusY || 18, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (effect.type === 'flying_boulder') {
        const elapsed = now - effect.startTime;
        const progress = Math.min(elapsed / effect.duration, 1);
        const eased = 1 - Math.pow(1 - progress, 2);
        const x = effect.startX + (effect.endX - effect.startX) * eased;
        const arcHeight = 90;
        const y = effect.startY + (effect.endY - effect.startY) * eased - Math.sin(progress * Math.PI) * arcHeight;
        const rotation = elapsed * 0.02;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.fillStyle = '#5D5348';
        ctx.strokeStyle = '#2F2A25';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(80, 255, 140, 0.35)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(-effect.size, -effect.size * 0.3);
        ctx.lineTo(-effect.size * 0.3, -effect.size);
        ctx.lineTo(effect.size * 0.8, -effect.size * 0.6);
        ctx.lineTo(effect.size, effect.size * 0.2);
        ctx.lineTo(effect.size * 0.3, effect.size);
        ctx.lineTo(-effect.size * 0.8, effect.size * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#72FFB4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-4, -10);
        ctx.lineTo(2, -2);
        ctx.lineTo(-2, 8);
        ctx.stroke();
        ctx.restore();
      }

      if (effect.type === 'boulder_impact') {
        const elapsed = now - effect.startTime;
        const progress = Math.min(elapsed / effect.duration, 1);
        const radius = (effect.radius || 120) * progress;

        ctx.save();
        ctx.globalAlpha = 1 - progress;
        ctx.fillStyle = 'rgba(255, 87, 34, 0.22)';
        ctx.strokeStyle = '#FF7043';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      if (effect.type === 'golem_transform_rocks') {
        const elapsed = now - effect.startTime;
        const progress = Math.min(elapsed / effect.duration, 1);
        const fade = 1 - progress;

        const cx = effect.x;
        const cy = effect.y;
        const ringRadius = 25 + progress * 90;

        ctx.save();
        ctx.globalAlpha = fade;

        // Ground shock ring
        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 26, 40 + progress * 60, 12 + progress * 14, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Orbiting rocks
        for (let i = 0; i < 10; i++) {
          const angle = (Math.PI * 2 / 10) * i + elapsed * 0.01;
          const rx = cx + Math.cos(angle) * ringRadius;
          const ry = cy - 20 + Math.sin(angle) * (ringRadius * 0.45) - progress * 35;
          const size = 6 + (i % 3);

          ctx.save();
          ctx.translate(rx, ry);
          ctx.rotate(angle + i);
          ctx.fillStyle = i % 2 === 0 ? '#616161' : '#8D6E63';
          ctx.strokeStyle = '#424242';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.rect(-size, -size * 0.75, size * 2, size * 1.5);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        // Dust particles
        for (let i = 0; i < 14; i++) {
          const angle = (Math.PI * 2 / 14) * i;
          const dx = cx + Math.cos(angle) * (20 + progress * 80);
          const dy = cy + 30 + Math.sin(angle) * (8 + progress * 18);
          ctx.fillStyle = 'rgba(176, 158, 142, 0.45)';
          ctx.beginPath();
          ctx.arc(dx, dy, 2 + (i % 3), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // ???砍蔣?祈?頝⊥???
      if (effect.type === 'flashCutTrail') {
        const elapsed = now - effect.startTime;
        const fadeProgress = elapsed / effect.duration;
        if (fadeProgress < 1) {
          ctx.save();
          ctx.globalAlpha = 0.7 * (1 - fadeProgress);
          ctx.strokeStyle = '#CFD8DC';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#FFFFFF';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.moveTo(effect.startX, effect.y);
          ctx.lineTo(effect.endX, effect.y);
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      }

      // ?? ?芰?憌??寞?
      if (effect.type === 'snowball_fly') {
        const elapsed = now - effect.startTime;
        const progress = Math.min(elapsed / effect.duration, 1);
        const eased = 1 - Math.pow(1 - progress, 2); // ease-out
        // ?格?雿蔭?單?餈質馱
        const endX = effect.targetRef ? effect.targetRef.position.x : effect.startX;
        const endY = effect.targetRef ? effect.targetRef.position.y - 20 : effect.startY;
        const curX = effect.startX + (endX - effect.startX) * eased;
        const curY = effect.startY + (endY - effect.startY) * eased - Math.sin(progress * Math.PI) * 25;
        
        ctx.save();
        // 撠曇楚
        ctx.globalAlpha = 0.3 * (1 - progress);
        ctx.strokeStyle = '#B3E5FC';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(effect.startX, effect.startY);
        ctx.lineTo(curX, curY);
        ctx.stroke();
        
        // ?芰??祇?
        ctx.globalAlpha = 1 - progress * 0.3;
        ctx.fillStyle = '#E1F5FE';
        ctx.shadowColor = '#80DEEA';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(curX, curY, 7, 0, Math.PI * 2);
        ctx.fill();
        
        // ?芰??批?
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(curX - 2, curY - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 撠?梁?摮?
        for (let i = 0; i < 3; i++) {
          const trailProgress = Math.max(0, eased - 0.1 * (i + 1));
          const tx = effect.startX + (endX - effect.startX) * trailProgress;
          const ty = effect.startY + (endY - effect.startY) * trailProgress - Math.sin(trailProgress * Math.PI) * 25;
          ctx.globalAlpha = 0.5 * (1 - progress) * (1 - i * 0.3);
          ctx.fillStyle = '#B3E5FC';
          ctx.beginPath();
          ctx.arc(tx + (Math.random() - 0.5) * 6, ty + (Math.random() - 0.5) * 6, 2 + Math.random(), 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      }

      // ?爸 撌函?格撘抒??寞?
      if (effect.type === 'golem_swing') {
        const elapsed = now - effect.startTime;
        const progress = Math.min(elapsed / effect.duration, 1);
        const facing = effect.facing;
        const cx = effect.x + facing * 30;
        const cy = effect.y - 40;
        
        ctx.save();
        
        // ?格撘抒?嚗?銝?銝?嚗?
        const swingAngle = -Math.PI * 0.6 + progress * Math.PI * 1.0;
        const armLength = 70;
        const fistX = cx + Math.cos(swingAngle * facing) * armLength * facing;
        const fistY = cy + Math.sin(swingAngle) * armLength;
        
        // ?格頠楚撘?
        if (progress < 0.8) {
          ctx.globalAlpha = 0.5 * (1 - progress);
          ctx.strokeStyle = '#FF8A65';
          ctx.lineWidth = 8 * (1 - progress);
          ctx.shadowColor = '#FF5722';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          const startAngle = -Math.PI * 0.6;
          const endAngle = startAngle + progress * Math.PI * 1.0;
          if (facing > 0) {
            ctx.arc(cx, cy, armLength, startAngle, endAngle);
          } else {
            ctx.arc(cx, cy, armLength, Math.PI - endAngle, Math.PI - startAngle);
          }
          ctx.stroke();
        }
        
        // ?喲
        ctx.globalAlpha = 1 - progress * 0.5;
        ctx.fillStyle = '#5D4037';
        ctx.shadowColor = '#FF6E40';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(fistX, fistY, 10 + (1 - progress) * 4, 0, Math.PI * 2);
        ctx.fill();
        
        // 銵?瘜ｇ??桀摨??
        if (progress > 0.6) {
          const impactProgress = (progress - 0.6) / 0.4;
          const impactRadius = 30 + impactProgress * 40;
          ctx.globalAlpha = 0.4 * (1 - impactProgress);
          ctx.strokeStyle = '#FFAB91';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(fistX, fistY, impactRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // ?格憸典?蝺?
        for (let i = 0; i < 4; i++) {
          const lineProgress = Math.max(0, progress - i * 0.06);
          if (lineProgress <= 0 || lineProgress >= 0.9) continue;
          const lineAngle = -Math.PI * 0.6 + lineProgress * Math.PI * 1.0;
          const lx = cx + Math.cos(lineAngle * facing) * (armLength + 10 + i * 8) * facing;
          const ly = cy + Math.sin(lineAngle) * (armLength + 10 + i * 8);
          ctx.globalAlpha = 0.3 * (1 - lineProgress);
          ctx.fillStyle = '#BCAAA4';
          ctx.beginPath();
          ctx.arc(lx, ly, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      }

      // ?? 撅?繚銝??蝺??
      if (effect.type === 'iaiSlashLine') {
        const elapsed = now - effect.startTime;
        const fadeProgress = elapsed / effect.duration;
        if (fadeProgress < 1) {
          ctx.save();
          ctx.globalAlpha = (1 - fadeProgress);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 4 * (1 - fadeProgress * 0.5);
          ctx.shadowColor = '#FFFFFF';
          ctx.shadowBlur = 30 * (1 - fadeProgress);
          ctx.beginPath();
          ctx.moveTo(0, this.canvasHeight);
          ctx.lineTo(this.canvasWidth, 0);
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      }

      if (effect.type === 'perfect_pitch') {
        const elapsed = now - effect.startTime;
        const progress = Math.min(1, elapsed / effect.duration);
        const rise = progress * 60;
        const alpha = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
        const scale = 1.0 + Math.sin(progress * Math.PI) * 0.25;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(effect.x, effect.y - rise);
        ctx.scale(scale, scale);
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 22;
        ctx.font = 'bold 22px "Noto Sans TC", Arial';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#5A3A00';
        ctx.lineWidth = 3;
        ctx.strokeText('\u5b8c\u7f8e\u7d55\u5c0d\u97f3\u5f8b\uff01', 0, 0);
        ctx.fillStyle = '#FFD700';
        ctx.fillText('\u5b8c\u7f8e\u7d55\u5c0d\u97f3\u5f8b\uff01', 0, 0);
        ctx.shadowBlur = 0;
        ctx.restore();
      }
    });
  }

  // ????????????????????????????????????????????????????????????
  // ??Azure Disciple ??drawLightning helper
  // ????????????????????????????????????????????????????????????
  drawLightning(ctx, x1, y1, x2, y2, segments, offset, lineWidth, color) {
    ctx.save();
    ctx.strokeStyle = color || '#00FFFF';
    ctx.lineWidth = lineWidth || 2;
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(x1, y1);

    const dx = x2 - x1;
    const dy = y2 - y1;
    const segs = segments || 8;
    const off = offset || 15;

    for (let i = 1; i < segs; i++) {
      const t = i / segs;
      const px = x1 + dx * t + (Math.random() * off - off / 2);
      const py = y1 + dy * t + (Math.random() * off - off / 2);
      ctx.lineTo(px, py);
    }
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }

  // ????????????????????????????????????????????????????????????
  // ??Azure Disciple ??Skill 1: Divine Smite (?琿??餃予蝵?
  // ????????????????????????????????????????????????????????????
  executeDivineSmite(player, opponent, skill, playerSide, playerId) {
    const now = Date.now();
    const targetX = opponent.position.x;

    this.gameState.azureStrikes.push({
      type: 'divine_smite',
      x: targetX,
      ownerSide: playerId,
      phase: 'warning',
      startTime: now,
      warningDuration: skill.warningDuration || 400,
      strikeDuration: skill.strikeDuration || 200,
      strikeWidth: skill.strikeWidth || 40,
      damage: skill.damage || 12,
      damageDealt: false
    });
  }

  // ????????????????????????????????????????????????????????????
  // ??Azure Disciple ??Ultimate: Grand Thunder Slash (?祇?潛往??
  // ????????????????????????????????????????????????????????????
  executeGrandThunderSlash(player, opponent, skill, playerSide, playerId) {
    const now = Date.now();
    const duration = skill.duration || 3000;
    const strikeCount = skill.strikeCount || 5;

    // Save original position
    const origX = player.position.x;
    const origY = player.position.y;

    // Teleport to top-center
    player.position.x = this.canvasWidth / 2;
    player.position.y = 50;

    // Invincible for the whole duration
    player.effects.invulnerable = Math.max(player.effects.invulnerable || 0, now + duration);
    player.effects.casting = now + duration;
    player.effects.stunned = 0; // Clear any existing stun

    // Store ult state
    this.gameState.azureUlt[playerId] = {
      active: true,
      startTime: now,
      duration: duration,
      origX: origX,
      origY: origY,
      strikeCount: strikeCount,
      strikesSpawned: 0,
      strikeInterval: duration / (strikeCount + 1),
      nextStrikeTime: now + duration / (strikeCount + 1),
      strikeDamage: skill.strikeDamage || 15,
      frameCounter: 0
    };

    this.triggerCameraShake(8, duration);

    // Particles burst at teleport origin
    if (typeof particleSystem !== 'undefined' && particleSystem) {
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 / 20) * i;
        particleSystem.particles.push({
          x: origX, y: origY,
          vx: Math.cos(angle) * 100,
          vy: Math.sin(angle) * 100,
          size: 3 + Math.random() * 3,
          color: Math.random() > 0.5 ? '#00FFFF' : '#0044AA',
          life: 500 + Math.random() * 400,
          maxLife: 900, alpha: 1, type: 'spark'
        });
      }
    }
  }

  // ????????????????????????????????????????????????????????????
  // ??Azure Disciple ??Per-frame update system
  // ????????????????????????????????????????????????????????????
  updateAzureSystems(deltaTime) {
    const now = Date.now();

    // --- Voltage accumulation while moving ---
    ['player1', 'player2'].forEach(pid => {
      const player = this.players[pid];
      if (!player || player.id !== 'azure_disciple' || player.hp <= 0) return;

      // Gain voltage while moving (check if position changed)
      const lastX = player._azureLastX || player.position.x;
      if (Math.abs(player.position.x - lastX) > 1) {
        const gain = player.passive?.voltagePerFrame || 0.15;
        this.gameState.azureVoltage[pid] = Math.min(
          (this.gameState.azureVoltage[pid] || 0) + gain,
          player.passive?.maxVoltage || 100
        );
      }
      player._azureLastX = player.position.x;
    });

    // --- Update vertical strikes (divine smite + ult strikes) ---
    this.gameState.azureStrikes = this.gameState.azureStrikes.filter(strike => {
      const elapsed = now - strike.startTime;

      if (strike.phase === 'warning') {
        if (elapsed >= strike.warningDuration) {
          strike.phase = 'strike';
          strike.strikeStartTime = now;
        }
        return true;
      }

      if (strike.phase === 'strike') {
        const strikeElapsed = now - strike.strikeStartTime;
        // Deal damage once during strike phase
        if (!strike.damageDealt) {
          strike.damageDealt = true;
          const halfW = (strike.strikeWidth || 40) / 2;
          ['player1', 'player2'].forEach(pid => {
            if (pid === strike.ownerSide) return;
            const target = this.players[pid];
            if (!target || target.hp <= 0) return;
            if (Math.abs(target.position.x - strike.x) <= halfW + 20) {
              this.dealDamage(target, strike.damage, strike.ownerSide);
              // Ult strikes knock up
              if (strike.isUltStrike) {
                target.effects.stunned = Math.max(target.effects.stunned || 0, now + 500);
                target._knockupAnim = { startTime: now, duration: 500 };
                this.addVisualEffect(target.position.x, target.position.y - 40, 'azure_knockup', '⬆️');
              }
            }
          });
        }
        if (strikeElapsed >= (strike.strikeDuration || 200)) {
          return false; // Remove strike
        }
        return true;
      }
      return false;
    });

    // --- Update ultimate state ---
    ['player1', 'player2'].forEach(pid => {
      const ult = this.gameState.azureUlt[pid];
      if (!ult || !ult.active) return;
      const player = this.players[pid];
      const opponent = this.players[pid === 'player1' ? 'player2' : 'player1'];
      if (!player || !opponent) return;

      const elapsed = now - ult.startTime;

      // Spawn strikes at intervals near the opponent
      if (ult.strikesSpawned < ult.strikeCount && now >= ult.nextStrikeTime) {
        const spreadX = (Math.random() - 0.5) * 160;
        const strikeX = Math.max(40, Math.min(this.canvasWidth - 40, opponent.position.x + spreadX));

        this.gameState.azureStrikes.push({
          type: 'ult_smite',
          x: strikeX,
          ownerSide: pid,
          phase: 'warning',
          startTime: now,
          warningDuration: 300,
          strikeDuration: 250,
          strikeWidth: 50,
          damage: ult.strikeDamage,
          damageDealt: false,
          isUltStrike: true
        });

        ult.strikesSpawned++;
        ult.nextStrikeTime = now + ult.strikeInterval;
      }

      // End ultimate
      if (elapsed >= ult.duration) {
        ult.active = false;
        player.position.x = Math.max(80, Math.min(this.canvasWidth - 80, ult.origX));
        player.position.y = ult.origY;
        this.addCombatLog(`${player.name} 幻影互換結束！`, pid, 'status');
      }
    });
  }

  // ????????????????????????????????????????????????????????????
  // ??Azure Disciple ??Rendering (strikes, voltage bar, discharge bolt)
  // ????????????????????????????????????????????????????????????
  renderAzureExtras() {
    const ctx = this.ctx;
    const now = Date.now();

    // --- Render vertical strike objects ---
    this.gameState.azureStrikes.forEach(strike => {
      const x = strike.x;
      const halfW = (strike.strikeWidth || 40) / 2;

      if (strike.phase === 'warning') {
        // Pulsing yellow/blue ellipse on ground
        const elapsed = now - strike.startTime;
        const pulse = 0.4 + Math.sin(elapsed * 0.02) * 0.3;
        const groundY = this.canvasHeight - 60;
        ctx.save();
        ctx.globalAlpha = pulse;
        const grad = ctx.createRadialGradient(x, groundY, 0, x, groundY, halfW + 15);
        grad.addColorStop(0, 'rgba(0, 255, 255, 0.7)');
        grad.addColorStop(0.5, 'rgba(0, 100, 200, 0.4)');
        grad.addColorStop(1, 'rgba(255, 255, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(x, groundY, halfW + 15, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (strike.phase === 'strike') {
        // Massive dark-blue lightning from top to bottom
        const strikeElapsed = now - strike.strikeStartTime;
        const strikeDuration = strike.strikeDuration || 200;
        const alpha = 1 - (strikeElapsed / strikeDuration) * 0.5;
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);

        // Draw 3 overlapping lightning bolts for thickness
        for (let i = 0; i < 3; i++) {
          const lw = (i === 0) ? 4 : (i === 1) ? 2 : 1;
          const col = (i === 0) ? '#00BFFF' : (i === 1) ? '#00FFFF' : '#FFFFFF';
          this.drawLightning(ctx, x + (Math.random() - 0.5) * 6, 0,
            x + (Math.random() - 0.5) * 6, this.canvasHeight,
            12, 20 - i * 5, lw, col);
        }

        // Bright flash at ground impact
        const groundY = this.canvasHeight - 60;
        ctx.fillStyle = 'rgba(0, 255, 255, 0.4)';
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.ellipse(x, groundY, halfW + 20, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }
    });

    // --- Render voltage discharge bolt ---
    const discharge = this.gameState.azureDischarge;
    if (discharge) {
      const elapsed = now - discharge.startTime;
      if (elapsed < discharge.duration) {
        const alpha = 1 - elapsed / discharge.duration;
        ctx.save();
        ctx.globalAlpha = alpha;
        for (let i = 0; i < 3; i++) {
          this.drawLightning(ctx, discharge.fromX, discharge.fromY,
            discharge.toX, discharge.toY,
            6, 12, 3 - i, i === 0 ? '#00BFFF' : '#00FFFF');
        }
        ctx.restore();
      } else {
        this.gameState.azureDischarge = null;
      }
    }

    // --- Render voltage bar below azure_disciple players (at feet) ---
    ['player1', 'player2'].forEach(pid => {
      const player = this.players[pid];
      if (!player || player.id !== 'azure_disciple' || player.hp <= 0) return;

      const voltage = this.gameState.azureVoltage[pid] || 0;
      const maxV = player.passive?.maxVoltage || 100;
      const pct = voltage / maxV;
      const x = player.position.x;
      const footY = player.position.y + 28;
      const barW = 64;
      const barH = 8;

      // Outer glow when charging
      if (pct > 0.5) {
        ctx.save();
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 10 * pct;
        ctx.strokeStyle = `rgba(0, 255, 255, ${pct * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x - barW / 2 - 2, footY - 2, barW + 4, barH + 4, 5);
        ctx.stroke();
        ctx.restore();
      }

      // Background
      ctx.fillStyle = 'rgba(0, 0, 20, 0.7)';
      ctx.beginPath();
      ctx.roundRect(x - barW / 2, footY, barW, barH, 4);
      ctx.fill();

      // Fill gradient: dark blue ??cyan, with electric crackle at edge
      if (pct > 0) {
        const fillW = barW * pct;
        const grad = ctx.createLinearGradient(x - barW / 2, footY, x - barW / 2 + fillW, footY);
        grad.addColorStop(0, '#001a4d');
        grad.addColorStop(0.6, '#0066CC');
        grad.addColorStop(1, '#00FFFF');
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x - barW / 2, footY, fillW, barH, 4);
        ctx.clip();
        ctx.fillStyle = grad;
        ctx.fillRect(x - barW / 2, footY, fillW, barH);
        // Animated shimmer line
        const shimmerX = x - barW / 2 + ((now * 0.08) % fillW);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(shimmerX, footY, 3, barH);
        ctx.restore();
      }

      // Border
      ctx.strokeStyle = pct >= 1 ? '#00FFFF' : 'rgba(100, 180, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x - barW / 2, footY, barW, barH, 4);
      ctx.stroke();

      // Voltage percentage text below bar
      ctx.fillStyle = pct >= 1 ? '#00FFFF' : '#88BBFF';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.floor(voltage)}V`, x, footY + barH + 12);

      // Full charge effects
      if (pct >= 1) {
        const pulse = 0.6 + Math.sin(now * 0.008) * 0.4;

        // ??icon above bar, pulsing
        ctx.save();
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 18 * pulse;
        ctx.fillStyle = `rgba(0, 255, 255, ${pulse})`;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', x, footY - 5);
        ctx.restore();

        // Crackling sparks at bar edges
        for (let i = 0; i < 2; i++) {
          const sparkX = x - barW / 2 + Math.random() * barW;
          const sparkY = footY + Math.random() * barH;
          ctx.save();
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#00FFFF';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Body glow ring
        ctx.save();
        ctx.globalAlpha = 0.15 + 0.1 * Math.sin(now * 0.01);
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(player.position.x, player.position.y, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    });

    // --- Render ult player glow at top ---
    ['player1', 'player2'].forEach(pid => {
      const ult = this.gameState.azureUlt[pid];
      if (!ult || !ult.active) return;
      const player = this.players[pid];
      if (!player) return;

      // Crackling arcs around player at top position
      ctx.save();
      ctx.globalAlpha = 0.7;
      for (let i = 0; i < 4; i++) {
        const angle = (now * 0.005 + i * Math.PI / 2);
        const arcX = player.position.x + Math.cos(angle) * 40;
        const arcY = player.position.y + Math.sin(angle) * 30;
        this.drawLightning(ctx, player.position.x, player.position.y,
          arcX, arcY, 4, 8, 2, '#00FFFF');
      }
      ctx.restore();
    });
  }

  // *** Shamisen: Staccato Strike (Skill 1) ***
  executeStaccatoStrike(player, opponent, skill, playerSide, playerId) {
    const now = Date.now();
    const range = skill.range || 150;
    const hitX = player.position.x + player.facing * range;
    const hitY = player.position.y - 20;

    // Create visual effect at impact location
    if (typeof particleSystem !== 'undefined' && particleSystem) {
      particleSystem.createSkillEffect(skill.code, hitX, hitY, player.facing);
    }

    // Hit detection: directional range check (like other instant skills)
    const dx = opponent.position.x - player.position.x;
    const inFront = (dx === 0) || (Math.sign(dx) === player.facing);
    const inRange = Math.abs(dx) <= range;
    const yClose = Math.abs(player.position.y - opponent.position.y) <= 60;

    if (inFront && inRange && yClose && opponent.hp > 0) {
      const damageResult = this.dealDamageWithResult(opponent, skill.damage || 10, playerId);
      if (damageResult.hit) {
        // Apply stun (interrupt)
        const stunDuration = skill.stunDuration || 500;
        opponent.effects.stunned = Math.max(opponent.effects.stunned || 0, now + stunDuration);
        this.addVisualEffect(opponent.position.x, opponent.position.y, 'stun', '💫');
        this.addCombatLog(player.name + ' 撥弦・破音命中！敵人被打斷！', playerSide, 'damage');
        this.triggerCameraShake(5, 200);
      }
    } else {
      this.addCombatLog('撥弦・破音未命中', playerSide, 'status');
    }
  }

  // *** Shamisen: Deadly Canon (Ultimate) ***
  executeDeadlyCanon(player, opponent, skill, playerSide, playerId) {
    const now = Date.now();
    const channelingDuration = skill.channelingDuration || 3000;

    // Enter channeling state — player cannot move or attack
    player.effects.casting = now + channelingDuration;
    player.effects.invulnerable = 0; // NOT invulnerable while channeling

    // Store the canon state for per-frame updates
    if (!this.gameState.shamisenCanon) {
      this.gameState.shamisenCanon = {};
    }
    this.gameState.shamisenCanon[playerId] = {
      active: true,
      startTime: now,
      duration: channelingDuration,
      centerX: player.position.x,
      centerY: player.position.y,
      wave1Hit: false,
      wave2Hit: false,
      wave3Hit: false,
      lastVfxAt: now,
      skill: skill
    };

    this.addCombatLog(player.name + ' 開始引導秘曲・輪唱殺陣！', playerSide, 'skill');
    // 不讓整段引導都震動；3 秒連續抖動會讓音忍的施放顯得掉幀。
    this.triggerCameraShake(3, 280);
  }

  // *** Shamisen: Per-frame update for Deadly Canon expanding waves ***
  updateShamisenSystems(deltaTime) {
    const now = Date.now();

    if (!this.gameState.shamisenCanon) return;

    ['player1', 'player2'].forEach(pid => {
      const canon = this.gameState.shamisenCanon[pid];
      if (!canon || !canon.active) return;

      const player = this.players[pid];
      const opponentId = pid === 'player1' ? 'player2' : 'player1';
      const opponent = this.players[opponentId];
      if (!player || !opponent) return;

      const elapsed = now - canon.startTime;
      const skill = canon.skill;

      // Check if channeling expired
      if (elapsed >= canon.duration) {
        canon.active = false;
        return;
      }

      // Check if player was interrupted (stunned during channel)
      if (player.effects.stunned > now) {
        canon.active = false;
        this.addCombatLog(player.name + ' 的輪唱殺陣被打斷！', pid, 'status');
        return;
      }

      // Lock player position during channeling
      player.position.x = canon.centerX;
      player.position.y = canon.centerY;

      const dist = Math.abs(opponent.position.x - canon.centerX);

      // Wave 1: 0-1000ms, radius grows to 100px
      if (elapsed < 1000) {
        const currentRadius = (elapsed / 1000) * (skill.wave1?.maxRadius || 100);
        if (!canon.wave1Hit && dist <= currentRadius && opponent.hp > 0) {
          canon.wave1Hit = true;
          const dmg = skill.wave1?.damage || 5;
          this.dealDamageWithResult(opponent, dmg, pid);
          opponent.effects.slowed = now + 1000;
          opponent.effects.slowPercent = skill.wave1?.slowMultiplier || 0.7;
          this.addVisualEffect(opponent.position.x, opponent.position.y, 'slow', '🎵');
          this.addCombatLog('輪唱第一波命中！減速70%', pid, 'damage');
        }
      }
      // Wave 2: 1000-2000ms, radius 100->200px
      else if (elapsed < 2000) {
        const progress = (elapsed - 1000) / 1000;
        const minR = skill.wave1?.maxRadius || 100;
        const maxR = skill.wave2?.maxRadius || 200;
        const currentRadius = minR + progress * (maxR - minR);
        if (!canon.wave2Hit && dist <= currentRadius && opponent.hp > 0) {
          canon.wave2Hit = true;
          const dmg = skill.wave2?.damage || 10;
          this.dealDamageWithResult(opponent, dmg, pid);
          this.endDefend(opponentId);
          opponent.effects.slowed = now + 1500;
          opponent.effects.slowPercent = skill.wave2?.slowMultiplier || 0.4;
          this.addVisualEffect(opponent.position.x, opponent.position.y, 'slow', '🎶');
          this.addCombatLog('輪唱第二波命中！強減速並強制解除防禦！', pid, 'damage');
        }
      }
      // Wave 3: 2000-3000ms, radius 200->800px (full screen)
      else if (elapsed < 3000) {
        const progress = (elapsed - 2000) / 1000;
        const minR = skill.wave2?.maxRadius || 200;
        const maxR = skill.wave3?.maxRadius || 800;
        const currentRadius = minR + progress * (maxR - minR);
        if (!canon.wave3Hit && dist <= currentRadius && opponent.hp > 0) {
          canon.wave3Hit = true;
          const dmg = skill.wave3?.damage || 15;
          this.dealDamageWithResult(opponent, dmg, pid);
          // Massive vertical knock-up
          const knockupDuration = 800;
          opponent.effects.stunned = Math.max(opponent.effects.stunned || 0, now + knockupDuration);
          opponent._knockupAnim = { startTime: now, duration: knockupDuration };
          this.addVisualEffect(opponent.position.x, opponent.position.y - 40, 'shamisen_knockup', '🎼');
          this.addCombatLog('輪唱終章命中！敵人被擊飛！', pid, 'damage');
          this.triggerCameraShake(10, 500);
        }
      }

      // 音波特效以固定節奏產生，而非每一幀都塞新粒子。
      // 保留壓迫感，同時避免 3 秒引導累積過量 Canvas 粒子造成卡頓。
      const vfxInterval = 80;
      if (typeof particleSystem !== 'undefined' && particleSystem && now - (canon.lastVfxAt || 0) >= vfxInterval) {
        canon.lastVfxAt = now;
        let currentRadius = 0;
        if (elapsed < 1000) {
          currentRadius = (elapsed / 1000) * (skill.wave1?.maxRadius || 100);
        } else if (elapsed < 2000) {
          const minR = skill.wave1?.maxRadius || 100;
          const maxR = skill.wave2?.maxRadius || 200;
          currentRadius = minR + ((elapsed - 1000) / 1000) * (maxR - minR);
        } else {
          const minR = skill.wave2?.maxRadius || 200;
          const maxR = skill.wave3?.maxRadius || 800;
          currentRadius = minR + ((elapsed - 2000) / 1000) * (maxR - minR);
        }

        // Spawn floating note emojis at the border (2-3 per frame)
        if (Math.random() < 0.4) {
          const angle = Math.random() * Math.PI * 2;
          const borderX = canon.centerX + Math.cos(angle) * currentRadius;
          const borderY = canon.centerY + Math.sin(angle) * currentRadius;
          const noteEmojis = ['\u{1F3B5}', '\u{1F3B6}', '\u266A', '\u266B', '\u266C', '\u2669'];
          particleSystem.particles.push({
            x: borderX,
            y: borderY,
            vx: Math.cos(angle) * 20 + (Math.random() - 0.5) * 30,
            vy: -30 - Math.random() * 40,
            size: 18 + Math.random() * 10,
            color: '#C8C8FF',
            life: 800 + Math.random() * 400,
            maxLife: 1200,
            alpha: 0.8,
            type: 'shamisen_canon_note',
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            emoji: noteEmojis[Math.floor(Math.random() * noteEmojis.length)]
          });
        }

        // Spawn staff line segments at wave border
        if (Math.random() < 0.2) {
          const angle = Math.random() * Math.PI * 2;
          particleSystem.particles.push({
            x: canon.centerX + Math.cos(angle) * currentRadius,
            y: canon.centerY + Math.sin(angle) * currentRadius,
            vx: Math.cos(angle) * 15,
            vy: (Math.random() - 0.5) * 10,
            size: 30 + Math.random() * 20,
            color: '#FFD700',
            life: 600 + Math.random() * 300,
            maxLife: 900,
            alpha: 0.5,
            type: 'shamisen_staff_line',
            rotation: angle
          });
        }

        // Spawn waveform fragment particles along wave border
        if (Math.random() < 0.25) {
          const angle = Math.random() * Math.PI * 2;
          particleSystem.particles.push({
            x: canon.centerX + Math.cos(angle) * currentRadius,
            y: canon.centerY + Math.sin(angle) * currentRadius,
            vx: Math.cos(angle) * 25 + (Math.random() - 0.5) * 15,
            vy: Math.sin(angle) * 25 + (Math.random() - 0.5) * 15,
            size: 20 + Math.random() * 15,
            color: '#B0C4FF',
            life: 500 + Math.random() * 300,
            maxLife: 800,
            alpha: 0.6,
            type: 'shamisen_wave_ring',
            rotation: angle
          });
        }

        // Spawn flash sparkles at border (twinkling)
        if (Math.random() < 0.3) {
          const angle = Math.random() * Math.PI * 2;
          particleSystem.particles.push({
            x: canon.centerX + Math.cos(angle) * currentRadius + (Math.random() - 0.5) * 10,
            y: canon.centerY + Math.sin(angle) * currentRadius + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 40,
            vy: -20 - Math.random() * 30,
            size: 4 + Math.random() * 6,
            color: '#FFFFFF',
            life: 300 + Math.random() * 200,
            maxLife: 500,
            alpha: 0.9,
            type: 'shamisen_flash',
            rotation: 0
          });
        }
      }
    });
  }

  // *** Shamisen: Ambient musical aura around character ***
  renderShamisenAmbient(player, playerId) {
    const ctx = this.ctx;
    const now = Date.now();
    const px = player.position.x;
    const py = player.position.y;

    ctx.save();

    // --- 1. Floating music notes orbiting the character ---
    const noteSymbols = ['♪', '♫', '♩', '♬', '🎵', '🎶'];
    for (let i = 0; i < 4; i++) {
      const orbitSpeed = 0.0015 + i * 0.0003;
      const orbitAngle = now * orbitSpeed + (Math.PI * 2 / 4) * i;
      const orbitR = 30 + Math.sin(now * 0.002 + i) * 5;
      const noteX = px + Math.cos(orbitAngle) * orbitR;
      const noteY = py - 15 + Math.sin(orbitAngle * 1.3 + i) * 8;
      const noteAlpha = 0.25 + Math.sin(now * 0.004 + i * 1.5) * 0.15;
      ctx.font = '10px Arial';
      ctx.fillStyle = `rgba(255, 215, 0, ${noteAlpha})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(noteSymbols[i], noteX, noteY);
    }

    // --- 2. Equalizer bars at the character's feet ---
    const barCount = 7;
    const barWidth = 3;
    const barGap = 1.5;
    const totalW = barCount * (barWidth + barGap) - barGap;
    const barStartX = px - totalW / 2;
    const barBaseY = py + 32;
    for (let b = 0; b < barCount; b++) {
      const freq = Math.sin(now * (0.006 + b * 0.002) + b * 0.8);
      const barH = 4 + Math.abs(freq) * 10;
      const alpha = 0.2 + Math.abs(freq) * 0.15;
      const bx = barStartX + b * (barWidth + barGap);
      ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      ctx.fillRect(bx, barBaseY - barH, barWidth, barH);
    }

    // --- 3. Sound wave pulse rings (subtle, periodic) ---
    const pulseInterval = 1500;
    const pulseAge = (now % pulseInterval) / pulseInterval;
    if (pulseAge < 0.6) {
      const pulseR = 10 + pulseAge * 50;
      const pulseAlpha = 0.15 * (1 - pulseAge / 0.6);
      ctx.strokeStyle = `rgba(245, 222, 179, ${pulseAlpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(px, py, pulseR, 0, Math.PI * 2);
      ctx.stroke();
    }

    // --- 4. Faint five-line staff under feet ---
    const staffAlpha = 0.08 + Math.sin(now * 0.003) * 0.03;
    ctx.strokeStyle = `rgba(245, 222, 179, ${staffAlpha})`;
    ctx.lineWidth = 0.5;
    for (let l = 0; l < 5; l++) {
      const ly = barBaseY + 4 + l * 3;
      ctx.beginPath();
      ctx.moveTo(px - 25, ly);
      ctx.lineTo(px + 25, ly);
      ctx.stroke();
    }

    // --- 5. 節拍器 UI（橫條式，常駐顯示）---
    const lastAttack = player.effects.shamisenLastAttackTime || 0;
    const passiveData = player.passive;
    const CYCLE = 800;
    const barW = 64;
    const barH = 7;
    const barX = px - barW / 2;
    const barY = py - 74;
    const winStart = passiveData ? passiveData.perfectWindow[0] : 480;
    const winEnd   = passiveData ? passiveData.perfectWindow[1] : 520;

    let timeSince = 0;
    let showCursor = false;
    if (lastAttack > 0) {
      timeSince = now - lastAttack;
      if (timeSince <= CYCLE) showCursor = true;
    }

    // 背景框
    ctx.fillStyle = 'rgba(0,0,0,0.40)';
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(barX, barY, barW, barH);

    // 完美窗口高亮帶
    const winPxX = barX + (winStart / CYCLE) * barW;
    const winPxW = ((winEnd - winStart) / CYCLE) * barW;
    const inWindow = showCursor && timeSince >= winStart && timeSince <= winEnd;
    const winAlpha = inWindow ? (0.65 + Math.sin(now * 0.025) * 0.35) : 0.40;
    ctx.fillStyle = `rgba(255, 215, 0, ${winAlpha})`;
    ctx.fillRect(winPxX, barY, winPxW, barH);

    // 移動光標（垂直細線）
    if (showCursor) {
      const cursorX = barX + (Math.min(timeSince, CYCLE) / CYCLE) * barW;
      ctx.shadowColor = inWindow ? '#FFD700' : 'transparent';
      ctx.shadowBlur  = inWindow ? 10 : 0;
      ctx.fillStyle   = inWindow ? '#FFD700' : 'rgba(255,255,255,0.85)';
      ctx.fillRect(cursorX - 1, barY - 2, 2, barH + 4);
      ctx.shadowBlur = 0;
    }

    // 外框
    ctx.strokeStyle = 'rgba(255,215,0,0.35)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(barX, barY, barW, barH);

    // 文字提示
    ctx.font = 'bold 7px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (inWindow) {
      const flash = 0.7 + Math.sin(now * 0.03) * 0.3;
      ctx.fillStyle = `rgba(255, 215, 0, ${flash})`;
      ctx.fillText('♪ 按攻擊！ ♪', px, barY - 7);
    } else if (showCursor) {
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillText('節拍律動', px, barY - 6);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.30)';
      ctx.fillText('480~520ms', px, barY - 6);
    }

    ctx.restore();
  }

  // *** Shamisen: String pluck VFX when note spawns ***
  renderShamisenPluck(player) {
    const ctx = this.ctx;
    const now = Date.now();
    const lastAttack = player.effects.shamisenLastAttackTime || 0;
    const timeSince = now - lastAttack;

    // Show pluck vibration for 200ms after attack
    if (timeSince > 200) return;

    const px = player.position.x;
    const py = player.position.y;
    const facing = player.facing || 1;
    const progress = timeSince / 200;
    const amplitude = (1 - progress) * 6;
    const freq = 30;

    ctx.save();
    ctx.translate(px + facing * 15, py - 10);

    // Three vibrating strings
    ctx.lineWidth = 1;
    for (let s = -1; s <= 1; s++) {
      const stringAlpha = 0.6 * (1 - progress);
      ctx.strokeStyle = `rgba(255, 215, 0, ${stringAlpha})`;
      ctx.beginPath();
      for (let t = 0; t < 20; t++) {
        const sx = t - 10;
        const sy = s * 4 + Math.sin(t * freq * 0.1 + now * 0.05) * amplitude * (1 - Math.abs(t - 10) / 10);
        if (t === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    // Pluck spark at string center
    const sparkAlpha = 0.8 * (1 - progress);
    ctx.fillStyle = `rgba(255, 255, 200, ${sparkAlpha})`;
    ctx.beginPath();
    ctx.arc(0, 0, 3 * (1 - progress), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // *** Shamisen: Render Deadly Canon expanding circles - Enhanced ***
  renderShamisenCanon(ctx) {
    const now = Date.now();
    if (!this.gameState.shamisenCanon) return;

    ['player1', 'player2'].forEach(pid => {
      const canon = this.gameState.shamisenCanon[pid];
      if (!canon || !canon.active) return;

      const elapsed = now - canon.startTime;
      const skill = canon.skill;
      const cx = canon.centerX;
      const cy = canon.centerY;

      // Calculate current wave radius
      let currentRadius = 0;
      let waveIndex = 0;
      if (elapsed < 1000) {
        currentRadius = (elapsed / 1000) * (skill.wave1?.maxRadius || 100);
        waveIndex = 1;
      } else if (elapsed < 2000) {
        const minR = skill.wave1?.maxRadius || 100;
        const maxR = skill.wave2?.maxRadius || 200;
        currentRadius = minR + ((elapsed - 1000) / 1000) * (maxR - minR);
        waveIndex = 2;
      } else if (elapsed < 3000) {
        const minR = skill.wave2?.maxRadius || 200;
        const maxR = skill.wave3?.maxRadius || 800;
        currentRadius = minR + ((elapsed - 2000) / 1000) * (maxR - minR);
        waveIndex = 3;
      }

      ctx.save();

      // Wave-specific color scheme
      const waveColors = [
        null,
        { r: 200, g: 200, b: 255 },  // Wave 1: soft blue-white
        { r: 180, g: 150, b: 255 },  // Wave 2: violet
        { r: 255, g: 215, b: 0 }     // Wave 3: golden
      ];
      const wc = waveColors[waveIndex] || waveColors[1];

      // Filled radial gradient area (subtle)
      const areaGrad = ctx.createRadialGradient(cx, cy, currentRadius * 0.3, cx, cy, currentRadius);
      const fillAlpha = 0.06 + Math.sin(now * 0.005) * 0.02;
      areaGrad.addColorStop(0, `rgba(${wc.r}, ${wc.g}, ${wc.b}, ${fillAlpha * 1.5})`);
      areaGrad.addColorStop(0.7, `rgba(${wc.r}, ${wc.g}, ${wc.b}, ${fillAlpha})`);
      areaGrad.addColorStop(1, `rgba(${wc.r}, ${wc.g}, ${wc.b}, 0)`);
      ctx.fillStyle = areaGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2);
      ctx.fill();

      // Main concentric expanding rings (5 rings with varying thickness)
      for (let ring = 0; ring < 5; ring++) {
        const ringRadius = currentRadius - ring * 12;
        if (ringRadius <= 0) continue;

        const alphaBase = 0.55 - ring * 0.1;
        const pulse = 0.85 + Math.sin(now * 0.008 + ring * 0.8) * 0.15;
        ctx.strokeStyle = `rgba(${wc.r}, ${wc.g}, ${wc.b}, ${alphaBase * pulse})`;
        ctx.lineWidth = (4 - ring * 0.6) * pulse;
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Rotating dashed wave front at the outer edge
      const dashCount = 24;
      for (let d = 0; d < dashCount; d++) {
        const a = (Math.PI * 2 / dashCount) * d + now * 0.003;
        const dashLen = 0.08;
        const dashAlpha = 0.4 + Math.sin(now * 0.01 + d) * 0.2;
        ctx.strokeStyle = `rgba(${wc.r}, ${wc.g}, ${wc.b}, ${dashAlpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, currentRadius + 3, a, a + dashLen);
        ctx.stroke();
      }

      // Musical staff lines inside the circle (5 faint horizontal lines)
      const staffAlpha = 0.12 + Math.sin(now * 0.004) * 0.05;
      ctx.strokeStyle = `rgba(${wc.r}, ${wc.g}, ${wc.b}, ${staffAlpha})`;
      ctx.lineWidth = 1;
      for (let l = 0; l < 5; l++) {
        const ly = cy - 16 + l * 8;
        const halfW = Math.min(currentRadius * 0.6, 200);
        ctx.beginPath();
        ctx.moveTo(cx - halfW, ly);
        ctx.lineTo(cx + halfW, ly);
        ctx.stroke();
      }

      // Inner glow at center (pulsing, color-matched)
      const glowPulse = 0.6 + Math.sin(now * 0.01) * 0.3;
      const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 50);
      grad.addColorStop(0, `rgba(${wc.r}, ${wc.g}, ${wc.b}, ${glowPulse})`);
      grad.addColorStop(0.5, `rgba(${wc.r}, ${wc.g}, ${wc.b}, ${glowPulse * 0.3})`);
      grad.addColorStop(1, `rgba(${wc.r}, ${wc.g}, ${wc.b}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 50, 0, Math.PI * 2);
      ctx.fill();

      // --- Hand-drawn treble clef at canon center ---
      const clefAlpha = 0.5 + Math.sin(now * 0.005) * 0.2;
      const clefScale = 0.55 + Math.sin(now * 0.003) * 0.05;
      const clefRotation = Math.sin(now * 0.001) * 0.1;
      ctx.save();
      ctx.translate(cx, cy - 5);
      ctx.rotate(clefRotation);
      ctx.scale(clefScale, clefScale);
      ctx.strokeStyle = `rgba(${wc.r}, ${wc.g}, ${wc.b}, ${clefAlpha})`;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      // Treble clef drawn with bezier curves (stylized G-clef shape)
      ctx.moveTo(4, 30);
      ctx.bezierCurveTo(4, 22, -10, 18, -10, 8);
      ctx.bezierCurveTo(-10, -2, -2, -8, 4, -14);
      ctx.bezierCurveTo(10, -20, 14, -28, 10, -36);
      ctx.bezierCurveTo(6, -44, -6, -44, -10, -36);
      ctx.bezierCurveTo(-14, -28, -8, -18, 0, -14);
      ctx.bezierCurveTo(8, -10, 14, -4, 14, 6);
      ctx.bezierCurveTo(14, 16, 8, 22, 0, 24);
      ctx.bezierCurveTo(-8, 26, -14, 20, -14, 14);
      ctx.bezierCurveTo(-14, 8, -8, 4, -2, 4);
      ctx.bezierCurveTo(4, 4, 8, 8, 6, 14);
      ctx.stroke();
      // Vertical stem of treble clef
      ctx.beginPath();
      ctx.moveTo(4, -36);
      ctx.lineTo(4, 38);
      ctx.stroke();
      // Small curl at bottom
      ctx.beginPath();
      ctx.arc(2, 38, 4, 0, Math.PI * 1.5, true);
      ctx.stroke();
      ctx.restore();

      // --- Waveform visualization ring around center ---
      const waveformR = 42;
      const wfAmplitude = 6 + Math.sin(now * 0.006) * 3;
      const wfFreq = 8 + waveIndex * 4;
      const wfAlpha = 0.4 + Math.sin(now * 0.007) * 0.15;
      ctx.strokeStyle = `rgba(${wc.r}, ${wc.g}, ${wc.b}, ${wfAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2; a += 0.05) {
        const offset = Math.sin(a * wfFreq + now * 0.008) * wfAmplitude;
        const r = waveformR + offset;
        const wx = cx + Math.cos(a) * r;
        const wy = cy + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.closePath();
      ctx.stroke();

      // Second waveform ring (counter-phase, slightly larger)
      const waveformR2 = 48;
      ctx.strokeStyle = `rgba(${wc.r}, ${wc.g}, ${wc.b}, ${wfAlpha * 0.5})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2; a += 0.05) {
        const offset = Math.sin(a * (wfFreq + 2) - now * 0.006) * (wfAmplitude * 0.7);
        const r = waveformR2 + offset;
        const wx = cx + Math.cos(a) * r;
        const wy = cy + Math.sin(a) * r;
        if (a === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.closePath();
      ctx.stroke();

      // Orbiting note symbols around caster
      const orbitR = 35;
      const noteSymbols = ['\u266A', '\u266B', '\u266C', '\u2669'];
      for (let n = 0; n < 4; n++) {
        const orbitAngle = now * 0.004 + (Math.PI * 2 / 4) * n;
        const nx = cx + Math.cos(orbitAngle) * orbitR;
        const ny = cy + Math.sin(orbitAngle) * orbitR - 10;
        const noteAlpha = 0.6 + Math.sin(now * 0.008 + n * 2) * 0.3;
        ctx.font = '14px Arial';
        ctx.fillStyle = `rgba(${wc.r}, ${wc.g}, ${wc.b}, ${noteAlpha})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(noteSymbols[n], nx, ny);
      }

      // Orbiting frequency bars (mini equalizer dots along orbit)
      const eqOrbitR = 55;
      for (let b = 0; b < 12; b++) {
        const eqAngle = (Math.PI * 2 / 12) * b - now * 0.002;
        const eqH = 3 + Math.abs(Math.sin(now * 0.012 + b * 0.8)) * 8;
        const ex = cx + Math.cos(eqAngle) * eqOrbitR;
        const ey = cy + Math.sin(eqAngle) * eqOrbitR;
        const eqAlpha = 0.3 + Math.sin(now * 0.01 + b) * 0.15;
        ctx.fillStyle = `rgba(${wc.r}, ${wc.g}, ${wc.b}, ${eqAlpha})`;
        // Draw bar perpendicular to the orbit circle
        ctx.save();
        ctx.translate(ex, ey);
        ctx.rotate(eqAngle + Math.PI / 2);
        ctx.fillRect(-1.5, -eqH / 2, 3, eqH);
        ctx.restore();
      }

      // Wave label with progress bar
      const waveLabels = ['', '第一波 ♪', '第二波 ♫', '終章 ♬'];
      const waveProgress = elapsed < 1000 ? elapsed / 1000 :
                           elapsed < 2000 ? (elapsed - 1000) / 1000 :
                           (elapsed - 2000) / 1000;
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = `rgba(${wc.r}, ${wc.g}, ${wc.b}, 0.8)`;
      ctx.textAlign = 'center';
      ctx.fillText(waveLabels[waveIndex], cx, cy - 55);

      // Progress bar under label
      const barW = 50;
      const barH = 3;
      const barX = cx - barW / 2;
      const barY = cy - 47;
      ctx.fillStyle = `rgba(${wc.r}, ${wc.g}, ${wc.b}, 0.2)`;
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = `rgba(${wc.r}, ${wc.g}, ${wc.b}, 0.7)`;
      ctx.fillRect(barX, barY, barW * waveProgress, barH);

      ctx.restore();
    });
  }

}
