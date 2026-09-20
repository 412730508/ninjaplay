class StickmanAnimator {
  constructor() {
    this.frameRate = 60; // 60 FPS
    this.animationSpeed = 5; // 瘥?撟??銝甈∪??怠?
    
    // ?急鈭粹爸撉潛?瑽?(?箇???
    this.skeleton = {
      head: { radius: 15 },
      body: { length: 50 },
      leftArm: { upper: 25, lower: 20 },
      rightArm: { upper: 25, lower: 20 },
      leftLeg: { upper: 30, lower: 25 },
      rightLeg: { upper: 30, lower: 25 }
    };
    
    // ? 憓撥?爸撉潛?瑽?(?怎敹???
    this.enhancedSkeleton = {
      head: { radius: 15 },
      neck: { length: 8 },           // ?啣?:?賊
      torso: { length: 35 },         // 頠撟??賊?啗??
      waist: { length: 10 },         // ?圈
      leftShoulder: { offset: 8 },   // ?啣?:撌西??宏
      rightShoulder: { offset: 8 },  // ?啣?:?唾??宏
      leftArm: { 
        upper: 22,                   // 銝?
        lower: 18,                   // ??
        hand: 6                      // ?啣?:??
      },
      rightArm: { 
        upper: 22, 
        lower: 18,
        hand: 6
      },
      leftLeg: { 
        upper: 28,                   // 憭扯
        lower: 24,                   // 撠
        foot: 8                      // ?啣?:?單?
      },
      rightLeg: { 
        upper: 28, 
        lower: 24,
        foot: 8
      }
    };
    
    // 瘚晷憿銝駁?
    this.schoolColors = {
      fujin: { // 憸典?瘚?- ???脩頂
        primary: '#00BCD4',   // ?
        secondary: '#4FC3F7', // 瘛箄?
        accent: '#B2EBF2'     // 璆菜滓??
      },
      katon: { // ?怠?摰?- 蝝??脩頂
        primary: '#F44336',   // 蝝
        secondary: '#FF9800', // 璈
        accent: '#FFCDD2'     // 瘛箇?
      },
      forgefire: { // 鍛炎忍者 - 煤黑鍛甲與熔金火焰
        primary: '#4A1712',
        secondary: '#FF5A1F',
        accent: '#FFD166'
      },
      suijin: { // 瘞游?? - ?蝟?
        primary: '#2196F3',   // ?
        secondary: '#03A9F4', // 瘛箄?
        accent: '#BBDEFB'     // 璆菜滓??
      },
      raijin: { // ?瑕???- 暺換?脩頂
        primary: '#FFEB3B',   // 暺
        secondary: '#9C27B0', // 蝝怨
        accent: '#FFF9C4'     // 瘛粹?
      },
      doton: { // ??瘣?- 璉蝟?
        primary: '#8D6E63',   // 璉
        secondary: '#A1887F', // 瘛箸?
        accent: '#D7CCC8'     // 璆菜滓璉?
      },
      kage: { // 敶勗???- 暺?脩頂
        primary: '#424242',   // 瘛梁
        secondary: '#757575', // 銝剔
        accent: '#BDBDBD'     // 瘛箇
      },
      rei: { // ??蝷?- 蝝怨蝟?
        primary: '#9C27B0',   // 蝝怨
        secondary: '#E91E63', // 蝎?
        accent: '#F3E5F5'     // 瘛箇換
      },
      dokusei: { // ?唳?蝘飛摰?- 蝬??脩頂
        primary: '#00b894',   // 瘥?
        secondary: '#2d3436', // ?
        accent: '#55efc4'     // 瘛箸?蝬?
      },
      taijutsu: { // ?瘣?- 蝝??脩頂
        primary: '#D32F2F',   // 瘛梁?
        secondary: '#212121', // 瘛梢?
        accent: '#FF5252'     // 鈭桃?
      },
      ranger: { // 蟡??- 蝧??蝟?
        primary: '#4CAF50',   // 蝧?
        secondary: '#FFD700', // ?
        accent: '#A5D6A7'     // 瘛箇?
      },
      warlock: { // ????- ??暺蝟?
        primary: '#B71C1C',   // ??
        secondary: '#212121', // 瘛梢?
        accent: '#E53935'     // 擙桃?
      },
      ronin: { // ?∩蜓銋? - ?潛??脩頂
        primary: '#78909C',   // ?潛
        secondary: '#CFD8DC', // ???
        accent: '#37474F'     // 瘛梢
      },
      beastmaster: { // 敺∠瘚?- 撗拍蝝怎頂
        primary: '#616161',
        secondary: '#8D6E63',
        accent: '#B0BEC5'
      },
      scorpion: { // ?剛?? - ??暺蝟?
        primary: '#8B0000',
        secondary: '#2B0000',
        accent: '#FF4444'
      },
      adjudicator: { // ?嗉?撱?- ?惇?蝟?
        primary: '#4A4A4A',
        secondary: '#FFD700',
        accent: '#B0BEC5'
      },
      exileblade: { // ?◢銋? - ??暺蝟?
        primary: '#008B8B',
        secondary: '#000000',
        accent: '#00CED1'
      },
      puppeteer: { // ????∪葦 - ?換?蝟?
        primary: '#6A0DAD',
        secondary: '#FFD700',
        accent: '#D8B4FE'
      },
      azure_disciple: { // ?潮銋? - ???蝟?
        primary: '#0044AA',
        secondary: '#00FFFF',
        accent: '#003366'
      },
      shamisen: {
        primary: '#8B4513',
        secondary: '#FFD700',
        accent: '#F5DEB3'
      }
    };
    
    // ?扑 ?啣?嚗??????函鋆??敺?
    this.ninjaEquipment = {
      fujin: { // 憸典蔣敹?
        headband: { color: '#00BCD4', pattern: '?儭?' },
        cape: { color: '#4FC3F7', length: 40 },
        weapon: { type: 'dual_blades', color: '#B2EBF2' },
        eyeColor: '#00FFFF',
        bodyPattern: 'light_armor',
        specialEffect: 'wind_trail'
      },
      katon: { // ?怎敹?
        headband: { color: '#F44336', pattern: '?' },
        shoulderPads: { color: '#FF9800', size: 8 },
        weapon: { type: 'flame_katana', color: '#FFCDD2' },
        eyeColor: '#FF4444',
        bodyPattern: 'scale_armor',
        specialEffect: 'ember_particles'
      },
      forgefire: { // 鍛炎忍者：雙手重刃、鍛甲與持續飛散的火星
        headband: { color: '#5A1F17', pattern: '鍛' },
        shoulderPads: { color: '#9B321A', size: 11 },
        armor: { color: '#2A1A17', thickness: 12 },
        cloak: { color: '#1A1010', transparency: 0.88 },
        weapon: { type: 'forgefire_greatblade', color: '#FFD166' },
        eyeColor: '#FFB000',
        bodyPattern: 'forge_armor',
        specialEffect: 'forge_sparks'
      },
      suijin: { // 瘞游蔣敹?
        headband: { color: '#2196F3', pattern: '??' },
        robe: { color: '#03A9F4', flow: true },
        weapon: { type: 'water_staff', color: '#BBDEFB' },
        eyeColor: '#00BFFF',
        bodyPattern: 'flowing_robe',
        specialEffect: 'water_drops'
      },
      raijin: { // ?瑟?敹?
        headband: { color: '#FFEB3B', pattern: '??' },
        gauntlets: { color: '#9C27B0', size: 6 },
        weapon: { type: 'thunder_fists', color: '#FFF9C4' },
        eyeColor: '#FFFF00',
        bodyPattern: 'lightning_marks',
        specialEffect: 'electric_sparks'
      },
      doton: { // 撗拍敹?
        headband: { color: '#8D6E63', pattern: '?' },
        armor: { color: '#A1887F', thickness: 10 },
        weapon: { type: 'rock_hammer', color: '#D7CCC8' },
        eyeColor: '#8B4513',
        bodyPattern: 'rock_plates',
        specialEffect: 'stone_particles'
      },
      kage: { // ?蔣敹?
        headband: { color: '#424242', pattern: '??' },
        cloak: { color: '#757575', transparency: 0.5 },
        weapon: { type: 'shadow_daggers', color: '#BDBDBD' },
        eyeColor: '#FF0000',
        bodyPattern: 'shadow_marks',
        specialEffect: 'dark_aura'
      },
      rei: { // ????
        headband: { color: '#9C27B0', pattern: '?' },
        aura: { color: '#E91E63', glow: 15 },
        weapon: { type: 'spirit_orb', color: '#F3E5F5' },
        eyeColor: '#FF1493',
        bodyPattern: 'spirit_marks',
        specialEffect: 'holy_light'
      },
      dokusei: { // 瘥票敹?
        headband: { color: '#00b894', pattern: '??' },
        cloak: { color: '#2d3436', transparency: 0.6 },
        weapon: { type: 'poison_blowpipe', color: '#55efc4' },
        eyeColor: '#00FF88',
        bodyPattern: 'toxic_veins',
        specialEffect: 'poison_drip'
      },
      taijutsu: { // 擃?敹?
        headband: { color: '#D32F2F', pattern: '?' },
        armor: { color: '#212121', thickness: 12 },
        weapon: { type: 'bare_fists', color: '#FF5252' },
        eyeColor: '#FF1744',
        bodyPattern: 'bulky_build',
        specialEffect: 'impact_dust'
      },
      ranger: { // 蝎暸???
        headband: { color: '#4CAF50', pattern: '?' },
        cape: { color: '#2E7D32', length: 35 },
        weapon: { type: 'elf_bow', color: '#FFD700' },
        eyeColor: '#00E676',
        bodyPattern: 'light_armor',
        specialEffect: 'leaf_trail'
      },
      warlock: { // 銵憟???
        headband: { color: '#B71C1C', pattern: '?弩' },
        cape: { color: '#4A0000', length: 38 },
        weapon: { type: 'blood_orb', color: '#E53935' },
        eyeColor: '#FF1744',
        bodyPattern: 'dark_robes',
        specialEffect: 'blood_drip'
      },
      ronin: { // 瘚芯犖?恥
        headband: { color: '#78909C', pattern: '??' },
        cape: { color: '#37474F', length: 30 },
        weapon: { type: 'katana', color: '#CFD8DC' },
        eyeColor: '#B0BEC5',
        bodyPattern: 'ronin_haori',
        specialEffect: 'blade_glint'
      },
      beastmaster: { // 敺∠敹?
        headband: { color: '#616161', pattern: '?爸' },
        armor: { color: '#8D6E63', thickness: 10 },
        weapon: { type: 'bare_fists', color: '#B0BEC5' },
        eyeColor: '#CE93D8',
        bodyPattern: 'rock_plates',
        specialEffect: 'stone_particles'
      },
      scorpion: { // ??
        headband: { color: '#8B0000', pattern: '??' },
        armor: { color: '#2B0000', thickness: 8 },
        weapon: { type: 'whip', color: '#FF4444' },
        eyeColor: '#FF0000',
        bodyPattern: 'dark_armor',
        specialEffect: 'dark_red_aura'
      },
      adjudicator: { // 鋆捱??
        headband: { color: '#B8860B', pattern: '??' },
        armor: { color: '#4A4A4A', thickness: 12 },
        weapon: { type: 'gavel', color: '#8B4513' },
        eyeColor: '#FFD700',
        bodyPattern: 'heavy_armor',
        specialEffect: 'gold_pulse'
      },
      exileblade: { // ?◢銋?
        headband: { color: '#008B8B', pattern: '?儭?' },
        cloak: { color: '#001A1A', transparency: 0.4 },
        weapon: { type: 'dual_blades', color: '#00CED1' },
        eyeColor: '#00FFFF',
        bodyPattern: 'shadow_marks',
        specialEffect: 'dark_wind_trail'
      },
      puppeteer: { // ????∪葦
        headband: { color: '#6A0DAD', pattern: '?' },
        cloak: { color: '#2D1B4E', transparency: 0.3 },
        weapon: { type: 'puppet_strings', color: '#FFD700' },
        eyeColor: '#DA70D6',
        bodyPattern: 'light_armor',
        specialEffect: 'string_glint'
      },
      azure_disciple: { // ?潮銋?
        headband: { color: '#0044AA', pattern: '??' },
        cloak: { color: '#001133', transparency: 0.3 },
        weapon: { type: 'lightning_fist', color: '#00FFFF' },
        eyeColor: '#00FFFF',
        bodyPattern: 'light_armor',
        specialEffect: 'lightning_crackle'
      },
      shamisen: {
        headband: { color: '#8B4513', pattern: '♪' },
        haori: { color: '#F5DEB3', trim: '#FFD700' },
        weapon: { type: 'shamisen_lute', color: '#D2691E' },
        eyeColor: '#FFD700',
        bodyPattern: 'light_armor',
        specialEffect: 'note_trail'
      }
    };
    
    this.animations = this.initializeAnimations();
  }
  
  initializeAnimations() {
    return {
      idle: this.createIdleAnimation(),
      walk: this.createWalkAnimation(),
      attack: this.createAttackAnimation(),
      defend: this.createDefendAnimation(),
      
      // 憸函頂??賢???
      windDash: this.createWindDashAnimation(),
      windSlash: this.createWindSlashAnimation(),
      
      // ?怎頂??賢???
      fireRush: this.createFireRushAnimation(),
      fireBall: this.createFireBallAnimation(),

      // 鍛炎忍者：雙手蓄力重斬、旋斬與巨刃落斬
      forgefireSlash: this.createForgefireSlashAnimation(),
      forgefireSpin: this.createForgefireSpinAnimation(),
      flameGodBlade: this.createFlameGodBladeAnimation(),
      
      // 瘞渡頂??賢???
      waterShield: this.createWaterShieldAnimation(),
      waterDragon: this.createWaterDragonAnimation(),
      
      // ?瑞頂??賢???
      thunderStep: this.createThunderStepAnimation(),
      thunderPunch: this.createThunderPunchAnimation(),
      
      // ?頂??賢???
      rockGuard: this.createRockGuardAnimation(),
      earthQuake: this.createEarthQuakeAnimation(),
      
      // 敶梁頂??賢???
      shadowStrike: this.createShadowStrikeAnimation(),
      shadowClone: this.createShadowCloneAnimation(),
      
      // ?頂??賢???
      spiritBomb: this.createSpiritBombAnimation(),
      spiritJudgment: this.createSpiritJudgmentAnimation(),
      
      // 瘥頂??賢???
      venomDart: this.createVenomDartAnimation(),
      thornTrap: this.createThornTrapAnimation(),
      
      // 擃?蝟餅??賢???
      savageSuplex: this.createSavageSuplexAnimation(),
      royalExecution: this.createRoyalExecutionAnimation(),
      
      // 蝎暸?????賢???
      elfTalisman: this.createElfTalismanAnimation(),
      stealthDash: this.createStealthDashAnimation(),
      
      // 銵憟????賢???
      bloodShackles: this.createBloodShacklesAnimation(),
      bloodDevour: this.createBloodDevourAnimation(),
      
      // 瘚芯犖?恥??賢???
      flashCut: this.createFlashCutAnimation(),
      iaiFlash: this.createIaiFlashAnimation(),
      
      // ????賢???
      scorpionWhip: this.createScorpionWhipAnimation(),
      rebelMinion: this.createRebelMinionAnimation(),
      chainOfPain: this.createChainOfPainAnimation(),
      
      // ?? 鋆捱???冽????- 瘜???
      gavelSmash: this.createGavelSmashAnimation(),

      // ?????
      hit: this.createHitAnimation(),
      victory: this.createVictoryAnimation(),
      defeat: this.createDefeatAnimation()
    };
  }
  
  // ?箇?憪踵? - 蝡?
  createIdleAnimation() {
    return Array(12).fill().map((_, frame) => ({
      head: { x: 0, y: 0, rotation: Math.sin(frame * 0.1) * 2 },
      body: { rotation: 0 },
      leftArm: { 
        upperRotation: -10 + Math.sin(frame * 0.15) * 5,
        lowerRotation: -5 + Math.sin(frame * 0.12) * 3
      },
      rightArm: { 
        upperRotation: 10 - Math.sin(frame * 0.15) * 5,
        lowerRotation: 5 - Math.sin(frame * 0.12) * 3
      },
      leftLeg: { upperRotation: 0, lowerRotation: 5 },
      rightLeg: { upperRotation: 0, lowerRotation: 5 }
    }));
  }
  
  // 銵粥?
  createWalkAnimation() {
    return Array(12).fill().map((_, frame) => {
      const cycle = frame / 6; // ?望?
      const legSwing = Math.sin(cycle * Math.PI) * 30;
      const armSwing = Math.sin(cycle * Math.PI) * 20;
      
      return {
        head: { x: 0, y: Math.sin(cycle * Math.PI * 2) * 2, rotation: 0 },
        body: { rotation: legSwing * 0.1 },
        leftArm: { 
          upperRotation: -armSwing,
          lowerRotation: Math.max(0, armSwing * 0.5)
        },
        rightArm: { 
          upperRotation: armSwing,
          lowerRotation: Math.max(0, -armSwing * 0.5)
        },
        leftLeg: { 
          upperRotation: legSwing,
          lowerRotation: Math.max(0, -legSwing * 0.8)
        },
        rightLeg: { 
          upperRotation: -legSwing,
          lowerRotation: Math.max(0, legSwing * 0.8)
        }
      };
    });
  }
  
  // ?餅??
  createAttackAnimation() {
    return [
      // 皞??挾 (0-3撟)
      { head: {x:0,y:0,rotation:0}, body: {rotation:0}, leftArm: {upperRotation:-20,lowerRotation:0}, rightArm: {upperRotation:-45,lowerRotation:-30}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:10,lowerRotation:5} },
      { head: {x:0,y:0,rotation:-5}, body: {rotation:-5}, leftArm: {upperRotation:-30,lowerRotation:0}, rightArm: {upperRotation:-60,lowerRotation:-45}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:15,lowerRotation:5} },
      { head: {x:0,y:0,rotation:-10}, body: {rotation:-10}, leftArm: {upperRotation:-40,lowerRotation:0}, rightArm: {upperRotation:-80,lowerRotation:-60}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:20,lowerRotation:10} },
      { head: {x:0,y:0,rotation:-15}, body: {rotation:-15}, leftArm: {upperRotation:-50,lowerRotation:0}, rightArm: {upperRotation:-90,lowerRotation:-80}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:25,lowerRotation:15} },
      
      // ?餅??挾 (4-7撟)
      { head: {x:0,y:0,rotation:10}, body: {rotation:15}, leftArm: {upperRotation:-20,lowerRotation:0}, rightArm: {upperRotation:45,lowerRotation:20}, leftLeg: {upperRotation:-10,lowerRotation:5}, rightLeg: {upperRotation:-5,lowerRotation:5} },
      { head: {x:0,y:0,rotation:15}, body: {rotation:20}, leftArm: {upperRotation:-10,lowerRotation:0}, rightArm: {upperRotation:60,lowerRotation:30}, leftLeg: {upperRotation:-15,lowerRotation:5}, rightLeg: {upperRotation:-10,lowerRotation:5} },
      { head: {x:0,y:0,rotation:20}, body: {rotation:25}, leftArm: {upperRotation:0,lowerRotation:0}, rightArm: {upperRotation:80,lowerRotation:45}, leftLeg: {upperRotation:-20,lowerRotation:10}, rightLeg: {upperRotation:-15,lowerRotation:5} },
      { head: {x:0,y:0,rotation:25}, body: {rotation:30}, leftArm: {upperRotation:10,lowerRotation:0}, rightArm: {upperRotation:90,lowerRotation:60}, leftLeg: {upperRotation:-25,lowerRotation:15}, rightLeg: {upperRotation:-20,lowerRotation:10} },
      
      // ?Ｗ儔?挾 (8-11撟)
      { head: {x:0,y:0,rotation:15}, body: {rotation:20}, leftArm: {upperRotation:0,lowerRotation:0}, rightArm: {upperRotation:60,lowerRotation:30}, leftLeg: {upperRotation:-15,lowerRotation:10}, rightLeg: {upperRotation:-10,lowerRotation:5} },
      { head: {x:0,y:0,rotation:5}, body: {rotation:10}, leftArm: {upperRotation:-10,lowerRotation:0}, rightArm: {upperRotation:30,lowerRotation:10}, leftLeg: {upperRotation:-5,lowerRotation:5}, rightLeg: {upperRotation:0,lowerRotation:5} },
      { head: {x:0,y:0,rotation:0}, body: {rotation:5}, leftArm: {upperRotation:-15,lowerRotation:0}, rightArm: {upperRotation:15,lowerRotation:5}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:5,lowerRotation:5} },
      { head: {x:0,y:0,rotation:0}, body: {rotation:0}, leftArm: {upperRotation:-10,lowerRotation:0}, rightArm: {upperRotation:10,lowerRotation:0}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:0,lowerRotation:5} }
    ];
  }
  
  // 鍛炎忍者：雙手將重刃拉至背後，再以全身重量向前劈下。
  createForgefireSlashAnimation() {
    const bladeRotation = [-138, -150, -164, -176, -92, -24, 26, 48, 34, 18, 6, 0];
    const base = this.createAttackAnimation();
    return base.map((pose, frame) => ({
      ...pose,
      head: { ...pose.head, y: frame < 4 ? -2 : frame < 8 ? 3 : 0 },
      body: { ...pose.body, rotation: pose.body.rotation + (frame < 4 ? -12 : frame < 8 ? 10 : 0) },
      leftArm: {
        upperRotation: frame < 4 ? -95 - frame * 8 : 38 + Math.max(0, 7 - frame) * 4,
        lowerRotation: frame < 4 ? -48 : 30
      },
      rightArm: {
        upperRotation: frame < 4 ? -105 - frame * 7 : 58 + Math.max(0, 7 - frame) * 5,
        lowerRotation: frame < 4 ? -58 : 42
      },
      weaponRotation: bladeRotation[frame],
      weaponScale: 1
    }));
  }

  // 鍛炎忍者：低身壓住重心，火焰重刃環繞身體完成一整圈。
  createForgefireSpinAnimation() {
    return Array(12).fill().map((_, frame) => {
      const turn = frame * 32;
      return {
        head: { x: Math.sin(frame * 0.7) * 2, y: 3, rotation: turn * 0.16 },
        body: { rotation: -18 + Math.sin(frame * 0.7) * 7 },
        leftArm: { upperRotation: -62 + turn, lowerRotation: -36 },
        rightArm: { upperRotation: -52 + turn, lowerRotation: -48 },
        leftLeg: { upperRotation: -22, lowerRotation: 28 },
        rightLeg: { upperRotation: 22, lowerRotation: 28 },
        weaponRotation: -145 + turn,
        weaponScale: 1.08
      };
    });
  }

  // 鍛炎忍者：先把巨刃高舉蓄熱，落下時放大成炎神巨刃。
  createFlameGodBladeAnimation() {
    const rotations = [-72, -86, -101, -118, -136, -154, -168, -42, -8, 14, 4, 0];
    return Array(12).fill().map((_, frame) => ({
      head: { x: 0, y: frame < 7 ? -3 : 4, rotation: frame < 7 ? -8 : 18 },
      body: { rotation: frame < 7 ? -14 : 26 },
      leftArm: {
        upperRotation: frame < 7 ? -118 : 38 + Math.max(0, 10 - frame) * 5,
        lowerRotation: frame < 7 ? -62 : 35
      },
      rightArm: {
        upperRotation: frame < 7 ? -128 : 55 + Math.max(0, 10 - frame) * 5,
        lowerRotation: frame < 7 ? -68 : 45
      },
      leftLeg: { upperRotation: frame < 7 ? 12 : -25, lowerRotation: 18 },
      rightLeg: { upperRotation: frame < 7 ? 20 : -18, lowerRotation: 18 },
      weaponRotation: rotations[frame],
      weaponScale: frame < 7 ? 1.35 + frame * 0.11 : 2.12 - (frame - 7) * 0.12
    }));
  }

  // ?? 鋆捱???冽????- 瘜?擃???
  createGavelSmashAnimation() {
    return [
      // 皞??挾 (0-3撟) - ??擃?瘜?
      { head: {x:0,y:-2,rotation:0}, body: {rotation:-5}, leftArm: {upperRotation:-70,lowerRotation:-40}, rightArm: {upperRotation:-80,lowerRotation:-50}, leftLeg: {upperRotation:5,lowerRotation:5}, rightLeg: {upperRotation:10,lowerRotation:5} },
      { head: {x:0,y:-4,rotation:-5}, body: {rotation:-10}, leftArm: {upperRotation:-100,lowerRotation:-50}, rightArm: {upperRotation:-110,lowerRotation:-60}, leftLeg: {upperRotation:5,lowerRotation:5}, rightLeg: {upperRotation:15,lowerRotation:5} },
      { head: {x:0,y:-5,rotation:-10}, body: {rotation:-15}, leftArm: {upperRotation:-120,lowerRotation:-40}, rightArm: {upperRotation:-130,lowerRotation:-50}, leftLeg: {upperRotation:5,lowerRotation:10}, rightLeg: {upperRotation:20,lowerRotation:10} },
      { head: {x:0,y:-6,rotation:-12}, body: {rotation:-18}, leftArm: {upperRotation:-130,lowerRotation:-30}, rightArm: {upperRotation:-140,lowerRotation:-40}, leftLeg: {upperRotation:10,lowerRotation:10}, rightLeg: {upperRotation:25,lowerRotation:15} },
      
      // ???挾 (4-7撟) - ????
      { head: {x:0,y:2,rotation:15}, body: {rotation:20}, leftArm: {upperRotation:-30,lowerRotation:10}, rightArm: {upperRotation:30,lowerRotation:20}, leftLeg: {upperRotation:-10,lowerRotation:5}, rightLeg: {upperRotation:-5,lowerRotation:5} },
      { head: {x:0,y:4,rotation:25}, body: {rotation:35}, leftArm: {upperRotation:10,lowerRotation:20}, rightArm: {upperRotation:70,lowerRotation:40}, leftLeg: {upperRotation:-20,lowerRotation:10}, rightLeg: {upperRotation:-15,lowerRotation:5} },
      { head: {x:0,y:3,rotation:30}, body: {rotation:40}, leftArm: {upperRotation:20,lowerRotation:30}, rightArm: {upperRotation:90,lowerRotation:50}, leftLeg: {upperRotation:-25,lowerRotation:15}, rightLeg: {upperRotation:-20,lowerRotation:10} },
      { head: {x:0,y:2,rotation:25}, body: {rotation:35}, leftArm: {upperRotation:15,lowerRotation:25}, rightArm: {upperRotation:85,lowerRotation:45}, leftLeg: {upperRotation:-20,lowerRotation:10}, rightLeg: {upperRotation:-15,lowerRotation:10} },
      
      // ?Ｗ儔?挾 (8-11撟) - ?絲瘜?
      { head: {x:0,y:1,rotation:15}, body: {rotation:20}, leftArm: {upperRotation:0,lowerRotation:10}, rightArm: {upperRotation:50,lowerRotation:25}, leftLeg: {upperRotation:-10,lowerRotation:5}, rightLeg: {upperRotation:-5,lowerRotation:5} },
      { head: {x:0,y:0,rotation:5}, body: {rotation:10}, leftArm: {upperRotation:-20,lowerRotation:0}, rightArm: {upperRotation:20,lowerRotation:10}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:0,lowerRotation:5} },
      { head: {x:0,y:0,rotation:2}, body: {rotation:5}, leftArm: {upperRotation:-15,lowerRotation:0}, rightArm: {upperRotation:10,lowerRotation:5}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:5,lowerRotation:5} },
      { head: {x:0,y:0,rotation:0}, body: {rotation:0}, leftArm: {upperRotation:-10,lowerRotation:0}, rightArm: {upperRotation:10,lowerRotation:0}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:0,lowerRotation:5} }
    ];
  }

  // ?脩戌?
  // ?儭??脩戌? - ?寞?閫ID餈?銝?憪踹
  createDefendAnimation(characterId) {
    const defenseStyles = {
      // 憸典蔣敹?- ??憪踵? (?格?霅琿,敺)
      fujin: Array(12).fill().map((_, frame) => {
        const bob = Math.sin(frame * 0.3) * 2;
        return {
          head: { x: -3, y: -3 + bob, rotation: -15 },
          body: { rotation: -20 },
          leftArm: { upperRotation: -100, lowerRotation: -60 }, // 撌行?霅琿
          rightArm: { upperRotation: 20, lowerRotation: 30 },   // ?單?隡詨
          leftLeg: { upperRotation: 15, lowerRotation: 20 },    // 敺?舀?
          rightLeg: { upperRotation: -30, lowerRotation: 40 }   // ?敶
        };
      }),
      
      // ?怎敹?- ?豢除?潭?憪踵? (??鈭文?霅瑁)
      katon: Array(12).fill().map((_, frame) => {
        const intensity = Math.sin(frame * 0.4) * 3;
        return {
          head: { x: 0, y: intensity, rotation: 0 },
          body: { rotation: 0 },
          leftArm: { upperRotation: -40, lowerRotation: -80 },  // 撌西?璈急?
          rightArm: { upperRotation: 40, lowerRotation: 80 },   // ?唾?璈急?
          leftLeg: { upperRotation: -10, lowerRotation: 15 },   // 蝛拙蝡尿
          rightLeg: { upperRotation: 10, lowerRotation: 15 }
        };
      }),
      
      // 瘞游蔣敹?- 瘚偌?啁?憪踵? (???怠?,頨恍???)
      suijin: Array(12).fill().map((_, frame) => {
        const flow = Math.sin(frame * 0.5) * 15;
        const wave = Math.cos(frame * 0.5) * 10;
        return {
          head: { x: wave * 0.3, y: 0, rotation: flow * 0.5 },
          body: { rotation: flow * 0.8 },
          leftArm: { upperRotation: -60 + flow, lowerRotation: -40 + wave },  // 瘚??
          rightArm: { upperRotation: 60 - flow, lowerRotation: 40 - wave },
          leftLeg: { upperRotation: 0, lowerRotation: 10 },
          rightLeg: { upperRotation: 0, lowerRotation: 10 }
        };
      }),
      
      // ?瑟?敹?- ?餃??澈憪踵? (?僕??)
      raijin: Array(12).fill().map((_, frame) => {
        const spark = Math.random() * 4 - 2;
        return {
          head: { x: spark, y: 5, rotation: spark * 2 },
          body: { rotation: -30 },
          leftArm: { upperRotation: -70 + spark, lowerRotation: -50 },
          rightArm: { upperRotation: 70 + spark, lowerRotation: 50 },
          leftLeg: { upperRotation: 40, lowerRotation: 50 },    // 瘛梯僕
          rightLeg: { upperRotation: -20, lowerRotation: 60 }
        };
      }),
      
      // 撗拍敹?- 撗拙?霅瑞憪踵? (?刻澈樴葬,璆萄漲?脩戌)
      doton: Array(12).fill().map(() => ({
        head: { x: 0, y: 8, rotation: -25 },                    // 雿
        body: { rotation: -40 },                                 // ?
        leftArm: { upperRotation: -90, lowerRotation: -90 },    // ??摰霅瑚?
        rightArm: { upperRotation: -90, lowerRotation: -90 },
        leftLeg: { upperRotation: 50, lowerRotation: 70 },      // 璆萄漲頩脖?
        rightLeg: { upperRotation: 50, lowerRotation: 70 }
      })),
      
      // ?蔣敹?- ?蔣?憪踵? (?渲澈餈湔?)
      kage: Array(12).fill().map((_, frame) => {
        const spin = (frame / 12) * 360 * 0.3;
        const dodge = Math.sin(frame * 0.6) * 20;
        return {
          head: { x: dodge * 0.4, y: -2, rotation: dodge },
          body: { rotation: dodge },
          leftArm: { upperRotation: -120 + dodge, lowerRotation: -80 },
          rightArm: { upperRotation: 40 + dodge, lowerRotation: 50 },
          leftLeg: { upperRotation: 30, lowerRotation: 40 },
          rightLeg: { upperRotation: -40, lowerRotation: 50 }
        };
      }),
      
      // ????- ?霅瑞憪踵? (??蝯)
      rei: Array(12).fill().map((_, frame) => {
        const glow = Math.sin(frame * 0.5) * 5;
        return {
          head: { x: 0, y: glow * 0.5, rotation: 0 },
          body: { rotation: 0 },
          leftArm: { upperRotation: -50, lowerRotation: -70 },   // 蝯?
          rightArm: { upperRotation: 50, lowerRotation: 70 },
          leftLeg: { upperRotation: 0, lowerRotation: 5 },       // 撟喟帘蝡?
          rightLeg: { upperRotation: 0, lowerRotation: 5 }
        };
      })
    };
    
    // 餈?撠?閫?蝳血????亦????脩戌
    return defenseStyles[characterId] || Array(12).fill().map((_, frame) => ({
      head: { x: 0, y: -2, rotation: -10 },
      body: { rotation: -5 },
      leftArm: { upperRotation: -80, lowerRotation: -45 },
      rightArm: { upperRotation: -80, lowerRotation: -45 },
      leftLeg: { upperRotation: -5, lowerRotation: 10 },
      rightLeg: { upperRotation: 5, lowerRotation: 15 }
    }));
  }
  
  // ??銵? (?怎頂) - 憓撥銵??
  createFireRushAnimation() {
    return [
      // ???挾 (0-2撟) - ????
      { head: {x:-2,y:2,rotation:-20}, body: {rotation:-45}, leftArm: {upperRotation:-120,lowerRotation:-90}, rightArm: {upperRotation:-120,lowerRotation:-90}, leftLeg: {upperRotation:60,lowerRotation:60}, rightLeg: {upperRotation:-30,lowerRotation:45} },
      { head: {x:-4,y:4,rotation:-30}, body: {rotation:-60}, leftArm: {upperRotation:-140,lowerRotation:-110}, rightArm: {upperRotation:-140,lowerRotation:-110}, leftLeg: {upperRotation:80,lowerRotation:80}, rightLeg: {upperRotation:-45,lowerRotation:60} },
      { head: {x:-6,y:6,rotation:-40}, body: {rotation:-75}, leftArm: {upperRotation:-160,lowerRotation:-130}, rightArm: {upperRotation:-160,lowerRotation:-130}, leftLeg: {upperRotation:100,lowerRotation:100}, rightLeg: {upperRotation:-60,lowerRotation:75} },
      
      // ?銵?挾 (3-8撟) - 璆萄漲?嚗??Ｗ?敺?
      { head: {x:8,y:-4,rotation:60}, body: {rotation:75}, leftArm: {upperRotation:160,lowerRotation:130}, rightArm: {upperRotation:160,lowerRotation:130}, leftLeg: {upperRotation:-120,lowerRotation:120}, rightLeg: {upperRotation:60,lowerRotation:60} },
      { head: {x:12,y:-6,rotation:75}, body: {rotation:90}, leftArm: {upperRotation:180,lowerRotation:150}, rightArm: {upperRotation:180,lowerRotation:150}, leftLeg: {upperRotation:-140,lowerRotation:140}, rightLeg: {upperRotation:80,lowerRotation:80} },
      { head: {x:16,y:-8,rotation:90}, body: {rotation:105}, leftArm: {upperRotation:200,lowerRotation:170}, rightArm: {upperRotation:200,lowerRotation:170}, leftLeg: {upperRotation:-160,lowerRotation:160}, rightLeg: {upperRotation:100,lowerRotation:100} },
      { head: {x:14,y:-6,rotation:75}, body: {rotation:90}, leftArm: {upperRotation:180,lowerRotation:150}, rightArm: {upperRotation:180,lowerRotation:150}, leftLeg: {upperRotation:-140,lowerRotation:140}, rightLeg: {upperRotation:80,lowerRotation:80} },
      { head: {x:12,y:-4,rotation:60}, body: {rotation:75}, leftArm: {upperRotation:160,lowerRotation:130}, rightArm: {upperRotation:160,lowerRotation:130}, leftLeg: {upperRotation:-120,lowerRotation:120}, rightLeg: {upperRotation:60,lowerRotation:60} },
      { head: {x:10,y:-2,rotation:45}, body: {rotation:60}, leftArm: {upperRotation:140,lowerRotation:110}, rightArm: {upperRotation:140,lowerRotation:110}, leftLeg: {upperRotation:-100,lowerRotation:100}, rightLeg: {upperRotation:40,lowerRotation:40} },
      
      // ?Ｗ儔?挾 (9-11撟)
      { head: {x:6,y:0,rotation:30}, body: {rotation:30}, leftArm: {upperRotation:90,lowerRotation:60}, rightArm: {upperRotation:90,lowerRotation:60}, leftLeg: {upperRotation:-60,lowerRotation:60}, rightLeg: {upperRotation:20,lowerRotation:20} },
      { head: {x:2,y:0,rotation:10}, body: {rotation:10}, leftArm: {upperRotation:30,lowerRotation:15}, rightArm: {upperRotation:30,lowerRotation:15}, leftLeg: {upperRotation:-20,lowerRotation:20}, rightLeg: {upperRotation:5,lowerRotation:5} },
      { head: {x:0,y:0,rotation:0}, body: {rotation:0}, leftArm: {upperRotation:-10,lowerRotation:0}, rightArm: {upperRotation:10,lowerRotation:0}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:0,lowerRotation:5} }
    ];
  }
  
  // ?暸◢????(憸函頂) - 憓撥憸其??暸?
  createWindDashAnimation() {
    return [
      // 憸其??? (0-2撟) - 敺桀凝敺
      { head: {x:-1,y:0,rotation:-5}, body: {rotation:-5}, leftArm: {upperRotation:-45,lowerRotation:-20}, rightArm: {upperRotation:-45,lowerRotation:-20}, leftLeg: {upperRotation:15,lowerRotation:20}, rightLeg: {upperRotation:15,lowerRotation:20} },
      { head: {x:-2,y:0,rotation:-10}, body: {rotation:-10}, leftArm: {upperRotation:-60,lowerRotation:-30}, rightArm: {upperRotation:-60,lowerRotation:-30}, leftLeg: {upperRotation:25,lowerRotation:35}, rightLeg: {upperRotation:25,lowerRotation:35} },
      { head: {x:-3,y:0,rotation:-15}, body: {rotation:-15}, leftArm: {upperRotation:-75,lowerRotation:-45}, rightArm: {upperRotation:-75,lowerRotation:-45}, leftLeg: {upperRotation:35,lowerRotation:50}, rightLeg: {upperRotation:35,lowerRotation:50} },
      
      // ?暸◢? (3-7撟) - 璆菟?瘝選?頨恍????
      { head: {x:10,y:-8,rotation:45}, body: {rotation:60}, leftArm: {upperRotation:135,lowerRotation:90}, rightArm: {upperRotation:135,lowerRotation:90}, leftLeg: {upperRotation:-60,lowerRotation:120}, rightLeg: {upperRotation:-60,lowerRotation:120} },
      { head: {x:15,y:-12,rotation:60}, body: {rotation:75}, leftArm: {upperRotation:150,lowerRotation:105}, rightArm: {upperRotation:150,lowerRotation:105}, leftLeg: {upperRotation:-90,lowerRotation:180}, rightLeg: {upperRotation:-90,lowerRotation:180} },
      { head: {x:20,y:-16,rotation:75}, body: {rotation:90}, leftArm: {upperRotation:165,lowerRotation:120}, rightArm: {upperRotation:165,lowerRotation:120}, leftLeg: {upperRotation:-120,lowerRotation:210}, rightLeg: {upperRotation:-120,lowerRotation:210} },
      { head: {x:18,y:-14,rotation:60}, body: {rotation:75}, leftArm: {upperRotation:150,lowerRotation:105}, rightArm: {upperRotation:150,lowerRotation:105}, leftLeg: {upperRotation:-90,lowerRotation:180}, rightLeg: {upperRotation:-90,lowerRotation:180} },
      { head: {x:12,y:-10,rotation:45}, body: {rotation:60}, leftArm: {upperRotation:135,lowerRotation:90}, rightArm: {upperRotation:135,lowerRotation:90}, leftLeg: {upperRotation:-60,lowerRotation:120}, rightLeg: {upperRotation:-60,lowerRotation:120} },
      
      // 憸其??嗆? (8-11撟)
      { head: {x:6,y:-6,rotation:30}, body: {rotation:45}, leftArm: {upperRotation:105,lowerRotation:60}, rightArm: {upperRotation:105,lowerRotation:60}, leftLeg: {upperRotation:-30,lowerRotation:60}, rightLeg: {upperRotation:-30,lowerRotation:60} },
      { head: {x:3,y:-3,rotation:15}, body: {rotation:25}, leftArm: {upperRotation:75,lowerRotation:40}, rightArm: {upperRotation:75,lowerRotation:40}, leftLeg: {upperRotation:-10,lowerRotation:30}, rightLeg: {upperRotation:-10,lowerRotation:30} },
      { head: {x:1,y:-1,rotation:5}, body: {rotation:10}, leftArm: {upperRotation:45,lowerRotation:20}, rightArm: {upperRotation:45,lowerRotation:20}, leftLeg: {upperRotation:5,lowerRotation:15}, rightLeg: {upperRotation:5,lowerRotation:15} },
      { head: {x:0,y:0,rotation:0}, body: {rotation:0}, leftArm: {upperRotation:-10,lowerRotation:0}, rightArm: {upperRotation:10,lowerRotation:0}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:0,lowerRotation:5} }
    ];
  }
  
  // ?◢?砍???(憸函頂)
  createWindSlashAnimation() {
    return [
      { head: {x:0,y:0,rotation:0}, body: {rotation:0}, leftArm: {upperRotation:-90,lowerRotation:-45}, rightArm: {upperRotation:90,lowerRotation:45}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:0,lowerRotation:5} },
      { head: {x:0,y:0,rotation:30}, body: {rotation:30}, leftArm: {upperRotation:-60,lowerRotation:-30}, rightArm: {upperRotation:120,lowerRotation:60}, leftLeg: {upperRotation:-15,lowerRotation:15}, rightLeg: {upperRotation:15,lowerRotation:5} },
      { head: {x:0,y:0,rotation:60}, body: {rotation:60}, leftArm: {upperRotation:-30,lowerRotation:-15}, rightArm: {upperRotation:150,lowerRotation:75}, leftLeg: {upperRotation:-30,lowerRotation:30}, rightLeg: {upperRotation:30,lowerRotation:15} },
      { head: {x:0,y:0,rotation:90}, body: {rotation:90}, leftArm: {upperRotation:0,lowerRotation:0}, rightArm: {upperRotation:180,lowerRotation:90}, leftLeg: {upperRotation:-45,lowerRotation:45}, rightLeg: {upperRotation:45,lowerRotation:25} },
      { head: {x:0,y:0,rotation:120}, body: {rotation:120}, leftArm: {upperRotation:30,lowerRotation:15}, rightArm: {upperRotation:210,lowerRotation:105}, leftLeg: {upperRotation:-60,lowerRotation:60}, rightLeg: {upperRotation:60,lowerRotation:35} },
      { head: {x:0,y:0,rotation:150}, body: {rotation:150}, leftArm: {upperRotation:60,lowerRotation:30}, rightArm: {upperRotation:240,lowerRotation:120}, leftLeg: {upperRotation:-75,lowerRotation:75}, rightLeg: {upperRotation:75,lowerRotation:45} },
      { head: {x:0,y:0,rotation:180}, body: {rotation:180}, leftArm: {upperRotation:90,lowerRotation:45}, rightArm: {upperRotation:270,lowerRotation:135}, leftLeg: {upperRotation:-90,lowerRotation:90}, rightLeg: {upperRotation:90,lowerRotation:55} },
      { head: {x:0,y:0,rotation:210}, body: {rotation:210}, leftArm: {upperRotation:120,lowerRotation:60}, rightArm: {upperRotation:300,lowerRotation:150}, leftLeg: {upperRotation:-105,lowerRotation:105}, rightLeg: {upperRotation:105,lowerRotation:65} },
      { head: {x:0,y:0,rotation:240}, body: {rotation:240}, leftArm: {upperRotation:150,lowerRotation:75}, rightArm: {upperRotation:330,lowerRotation:165}, leftLeg: {upperRotation:-120,lowerRotation:120}, rightLeg: {upperRotation:120,lowerRotation:75} },
      { head: {x:0,y:0,rotation:270}, body: {rotation:270}, leftArm: {upperRotation:180,lowerRotation:90}, rightArm: {upperRotation:0,lowerRotation:0}, leftLeg: {upperRotation:-135,lowerRotation:135}, rightLeg: {upperRotation:135,lowerRotation:85} },
      { head: {x:0,y:0,rotation:300}, body: {rotation:300}, leftArm: {upperRotation:210,lowerRotation:105}, rightArm: {upperRotation:30,lowerRotation:15}, leftLeg: {upperRotation:-150,lowerRotation:150}, rightLeg: {upperRotation:150,lowerRotation:95} },
      { head: {x:0,y:0,rotation:0}, body: {rotation:0}, leftArm: {upperRotation:-10,lowerRotation:0}, rightArm: {upperRotation:10,lowerRotation:0}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:0,lowerRotation:5} }
    ];
  }
  
  // ?甇亙???(?瑞頂) - ?祇?瘨仃??曄??死
  createThunderStepAnimation() {
    return [
      // ?琿?? (0-3撟) - 頨恍?敺桀凝憿怠?
      { head: {x:1,y:0,rotation:2}, body: {rotation:1}, leftArm: {upperRotation:-15,lowerRotation:0}, rightArm: {upperRotation:15,lowerRotation:0}, leftLeg: {upperRotation:2,lowerRotation:5}, rightLeg: {upperRotation:-2,lowerRotation:5} },
      { head: {x:-1,y:0,rotation:-2}, body: {rotation:-1}, leftArm: {upperRotation:-20,lowerRotation:-5}, rightArm: {upperRotation:20,lowerRotation:5}, leftLeg: {upperRotation:-2,lowerRotation:5}, rightLeg: {upperRotation:2,lowerRotation:5} },
      { head: {x:2,y:-1,rotation:3}, body: {rotation:2}, leftArm: {upperRotation:-25,lowerRotation:-10}, rightArm: {upperRotation:25,lowerRotation:10}, leftLeg: {upperRotation:3,lowerRotation:8}, rightLeg: {upperRotation:-3,lowerRotation:8} },
      { head: {x:-2,y:-1,rotation:-3}, body: {rotation:-2}, leftArm: {upperRotation:-30,lowerRotation:-15}, rightArm: {upperRotation:30,lowerRotation:15}, leftLeg: {upperRotation:-3,lowerRotation:8}, rightLeg: {upperRotation:3,lowerRotation:8} },
      
      // ???祉宏 (4-7撟) - 璆萄漲?剜?嗅??Ｗ儔
      { head: {x:20,y:-20,rotation:90}, body: {rotation:180}, leftArm: {upperRotation:180,lowerRotation:180}, rightArm: {upperRotation:-180,lowerRotation:-180}, leftLeg: {upperRotation:90,lowerRotation:180}, rightLeg: {upperRotation:-90,lowerRotation:-180} },
      { head: {x:-20,y:20,rotation:-90}, body: {rotation:-180}, leftArm: {upperRotation:-180,lowerRotation:-180}, rightArm: {upperRotation:180,lowerRotation:180}, leftLeg: {upperRotation:-90,lowerRotation:-180}, rightLeg: {upperRotation:90,lowerRotation:180} },
      { head: {x:15,y:-15,rotation:45}, body: {rotation:90}, leftArm: {upperRotation:135,lowerRotation:90}, rightArm: {upperRotation:-135,lowerRotation:-90}, leftLeg: {upperRotation:45,lowerRotation:90}, rightLeg: {upperRotation:-45,lowerRotation:-90} },
      { head: {x:-10,y:10,rotation:-30}, body: {rotation:-60}, leftArm: {upperRotation:-90,lowerRotation:-60}, rightArm: {upperRotation:90,lowerRotation:60}, leftLeg: {upperRotation:-30,lowerRotation:-60}, rightLeg: {upperRotation:30,lowerRotation:60} },
      
      // ?琿蝛拙? (8-11撟)
      { head: {x:-3,y:3,rotation:-10}, body: {rotation:-20}, leftArm: {upperRotation:-45,lowerRotation:-20}, rightArm: {upperRotation:45,lowerRotation:20}, leftLeg: {upperRotation:-10,lowerRotation:-20}, rightLeg: {upperRotation:10,lowerRotation:20} },
      { head: {x:-1,y:1,rotation:-3}, body: {rotation:-6}, leftArm: {upperRotation:-20,lowerRotation:-8}, rightArm: {upperRotation:20,lowerRotation:8}, leftLeg: {upperRotation:-3,lowerRotation:-6}, rightLeg: {upperRotation:3,lowerRotation:6} },
      { head: {x:0,y:0,rotation:-1}, body: {rotation:-2}, leftArm: {upperRotation:-12,lowerRotation:-2}, rightArm: {upperRotation:12,lowerRotation:2}, leftLeg: {upperRotation:-1,lowerRotation:2}, rightLeg: {upperRotation:1,lowerRotation:2} },
      { head: {x:0,y:0,rotation:0}, body: {rotation:0}, leftArm: {upperRotation:-10,lowerRotation:0}, rightArm: {upperRotation:10,lowerRotation:0}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:0,lowerRotation:5} }
    ];
  }
  
  // 暺?蝒必? (敶梁頂) - ?湔??箏恥??銵
  createShadowStrikeAnimation() {
    return [
      // 瞏?皞? (0-2撟) - 雿尿??
      { head: {x:0,y:8,rotation:0}, body: {rotation:0}, leftArm: {upperRotation:-30,lowerRotation:-15}, rightArm: {upperRotation:-90,lowerRotation:-45}, leftLeg: {upperRotation:45,lowerRotation:90}, rightLeg: {upperRotation:30,lowerRotation:60} },
      { head: {x:0,y:12,rotation:-10}, body: {rotation:-15}, leftArm: {upperRotation:-45,lowerRotation:-30}, rightArm: {upperRotation:-120,lowerRotation:-75}, leftLeg: {upperRotation:60,lowerRotation:120}, rightLeg: {upperRotation:45,lowerRotation:90} },
      { head: {x:0,y:16,rotation:-20}, body: {rotation:-30}, leftArm: {upperRotation:-60,lowerRotation:-45}, rightArm: {upperRotation:-150,lowerRotation:-105}, leftLeg: {upperRotation:75,lowerRotation:150}, rightLeg: {upperRotation:60,lowerRotation:120} },
      
      // 敶勗?蝒? (3-7撟) - 璆菟?銵?甇血?
      { head: {x:8,y:4,rotation:30}, body: {rotation:45}, leftArm: {upperRotation:-120,lowerRotation:-60}, rightArm: {upperRotation:45,lowerRotation:90}, leftLeg: {upperRotation:-45,lowerRotation:90}, rightLeg: {upperRotation:75,lowerRotation:45} },
      { head: {x:12,y:0,rotation:45}, body: {rotation:60}, leftArm: {upperRotation:-150,lowerRotation:-90}, rightArm: {upperRotation:90,lowerRotation:135}, leftLeg: {upperRotation:-75,lowerRotation:150}, rightLeg: {upperRotation:105,lowerRotation:60} },
      { head: {x:16,y:-4,rotation:60}, body: {rotation:75}, leftArm: {upperRotation:-180,lowerRotation:-120}, rightArm: {upperRotation:135,lowerRotation:180}, leftLeg: {upperRotation:-105,lowerRotation:180}, rightLeg: {upperRotation:135,lowerRotation:75} },
      { head: {x:14,y:-2,rotation:45}, body: {rotation:60}, leftArm: {upperRotation:-150,lowerRotation:-90}, rightArm: {upperRotation:90,lowerRotation:135}, leftLeg: {upperRotation:-75,lowerRotation:150}, rightLeg: {upperRotation:105,lowerRotation:60} },
      { head: {x:10,y:2,rotation:30}, body: {rotation:45}, leftArm: {upperRotation:-120,lowerRotation:-60}, rightArm: {upperRotation:45,lowerRotation:90}, leftLeg: {upperRotation:-45,lowerRotation:90}, rightLeg: {upperRotation:75,lowerRotation:45} },
      
      // ????(8-11撟)
      { head: {x:6,y:4,rotation:15}, body: {rotation:30}, leftArm: {upperRotation:-90,lowerRotation:-45}, rightArm: {upperRotation:0,lowerRotation:45}, leftLeg: {upperRotation:-15,lowerRotation:45}, rightLeg: {upperRotation:45,lowerRotation:30} },
      { head: {x:3,y:2,rotation:5}, body: {rotation:15}, leftArm: {upperRotation:-60,lowerRotation:-30}, rightArm: {upperRotation:-45,lowerRotation:0}, leftLeg: {upperRotation:0,lowerRotation:15}, rightLeg: {upperRotation:15,lowerRotation:15} },
      { head: {x:1,y:1,rotation:0}, body: {rotation:5}, leftArm: {upperRotation:-30,lowerRotation:-15}, rightArm: {upperRotation:-15,lowerRotation:-5}, leftLeg: {upperRotation:5,lowerRotation:10}, rightLeg: {upperRotation:5,lowerRotation:10} },
      { head: {x:0,y:0,rotation:0}, body: {rotation:0}, leftArm: {upperRotation:-10,lowerRotation:0}, rightArm: {upperRotation:10,lowerRotation:0}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:0,lowerRotation:5} }
    ];
  }
  
  // ?啗?????(?頂) - ?憭批??閬?
  createEarthQuakeAnimation() {
    return [
      // ??皞? (0-3撟) - ??擃?
      { head: {x:0,y:0,rotation:0}, body: {rotation:0}, leftArm: {upperRotation:-90,lowerRotation:-45}, rightArm: {upperRotation:-90,lowerRotation:-45}, leftLeg: {upperRotation:10,lowerRotation:20}, rightLeg: {upperRotation:10,lowerRotation:20} },
      { head: {x:0,y:-2,rotation:-5}, body: {rotation:-5}, leftArm: {upperRotation:-110,lowerRotation:-70}, rightArm: {upperRotation:-110,lowerRotation:-70}, leftLeg: {upperRotation:15,lowerRotation:30}, rightLeg: {upperRotation:15,lowerRotation:30} },
      { head: {x:0,y:-4,rotation:-10}, body: {rotation:-10}, leftArm: {upperRotation:-130,lowerRotation:-90}, rightArm: {upperRotation:-130,lowerRotation:-90}, leftLeg: {upperRotation:20,lowerRotation:40}, rightLeg: {upperRotation:20,lowerRotation:40} },
      { head: {x:0,y:-6,rotation:-15}, body: {rotation:-15}, leftArm: {upperRotation:-150,lowerRotation:-120}, rightArm: {upperRotation:-150,lowerRotation:-120}, leftLeg: {upperRotation:25,lowerRotation:50}, rightLeg: {upperRotation:25,lowerRotation:50} },
      
      // ???? (4-6撟) - ?擃???
      { head: {x:0,y:-8,rotation:-20}, body: {rotation:-20}, leftArm: {upperRotation:-170,lowerRotation:-140}, rightArm: {upperRotation:-170,lowerRotation:-140}, leftLeg: {upperRotation:30,lowerRotation:60}, rightLeg: {upperRotation:30,lowerRotation:60} },
      { head: {x:0,y:-10,rotation:-25}, body: {rotation:-25}, leftArm: {upperRotation:-180,lowerRotation:-150}, rightArm: {upperRotation:-180,lowerRotation:-150}, leftLeg: {upperRotation:35,lowerRotation:70}, rightLeg: {upperRotation:35,lowerRotation:70} },
      { head: {x:0,y:-8,rotation:-20}, body: {rotation:-20}, leftArm: {upperRotation:-170,lowerRotation:-140}, rightArm: {upperRotation:-170,lowerRotation:-140}, leftLeg: {upperRotation:30,lowerRotation:60}, rightLeg: {upperRotation:30,lowerRotation:60} },
      
      // ???詨 (7-9撟) - ??詨??圈
      { head: {x:0,y:4,rotation:30}, body: {rotation:40}, leftArm: {upperRotation:45,lowerRotation:90}, rightArm: {upperRotation:45,lowerRotation:90}, leftLeg: {upperRotation:-20,lowerRotation:0}, rightLeg: {upperRotation:-20,lowerRotation:0} },
      { head: {x:0,y:8,rotation:45}, body: {rotation:60}, leftArm: {upperRotation:90,lowerRotation:135}, rightArm: {upperRotation:90,lowerRotation:135}, leftLeg: {upperRotation:-40,lowerRotation:20}, rightLeg: {upperRotation:-40,lowerRotation:20} },
      { head: {x:0,y:12,rotation:60}, body: {rotation:80}, leftArm: {upperRotation:120,lowerRotation:160}, rightArm: {upperRotation:120,lowerRotation:160}, leftLeg: {upperRotation:-60,lowerRotation:60}, rightLeg: {upperRotation:-60,lowerRotation:60} },
      
      // ?圈?擗? (10-11撟) - 頨恍???
      { head: {x:2,y:8,rotation:50}, body: {rotation:65}, leftArm: {upperRotation:100,lowerRotation:140}, rightArm: {upperRotation:100,lowerRotation:140}, leftLeg: {upperRotation:-45,lowerRotation:45}, rightLeg: {upperRotation:-45,lowerRotation:45} },
      { head: {x:0,y:0,rotation:0}, body: {rotation:0}, leftArm: {upperRotation:-10,lowerRotation:0}, rightArm: {upperRotation:10,lowerRotation:0}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:0,lowerRotation:5} }
    ];
  }

  // ?? ?啣?嚗?憭拙祟?文???- ??擃??砍?憭拚
  createSpiritJudgmentAnimation() {
    return [
      // ?葉蝎曄? (0-3撟)
      { head: {x:0,y:0,rotation:0}, body: {rotation:0}, leftArm: {upperRotation:-45,lowerRotation:-20}, rightArm: {upperRotation:-45,lowerRotation:-20}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:0,lowerRotation:5} },
      { head: {x:0,y:-2,rotation:-5}, body: {rotation:-5}, leftArm: {upperRotation:-60,lowerRotation:-30}, rightArm: {upperRotation:-60,lowerRotation:-30}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:0,lowerRotation:5} },
      { head: {x:0,y:-4,rotation:-10}, body: {rotation:-10}, leftArm: {upperRotation:-75,lowerRotation:-45}, rightArm: {upperRotation:-75,lowerRotation:-45}, leftLeg: {upperRotation:5,lowerRotation:10}, rightLeg: {upperRotation:5,lowerRotation:10} },
      { head: {x:0,y:-6,rotation:-15}, body: {rotation:-15}, leftArm: {upperRotation:-90,lowerRotation:-60}, rightArm: {upperRotation:-90,lowerRotation:-60}, leftLeg: {upperRotation:10,lowerRotation:15}, rightLeg: {upperRotation:10,lowerRotation:15} },
      
      // ?砍?憭拚 (4-7撟) - ??擃??予
      { head: {x:0,y:-8,rotation:-20}, body: {rotation:-20}, leftArm: {upperRotation:-150,lowerRotation:-120}, rightArm: {upperRotation:-150,lowerRotation:-120}, leftLeg: {upperRotation:15,lowerRotation:25}, rightLeg: {upperRotation:15,lowerRotation:25} },
      { head: {x:0,y:-10,rotation:-25}, body: {rotation:-25}, leftArm: {upperRotation:-170,lowerRotation:-140}, rightArm: {upperRotation:-170,lowerRotation:-140}, leftLeg: {upperRotation:20,lowerRotation:35}, rightLeg: {upperRotation:20,lowerRotation:35} },
      { head: {x:0,y:-12,rotation:-30}, body: {rotation:-30}, leftArm: {upperRotation:-180,lowerRotation:-150}, rightArm: {upperRotation:-180,lowerRotation:-150}, leftLeg: {upperRotation:25,lowerRotation:45}, rightLeg: {upperRotation:25,lowerRotation:45} },
      { head: {x:0,y:-10,rotation:-25}, body: {rotation:-25}, leftArm: {upperRotation:-170,lowerRotation:-140}, rightArm: {upperRotation:-170,lowerRotation:-140}, leftLeg: {upperRotation:20,lowerRotation:35}, rightLeg: {upperRotation:20,lowerRotation:35} },
      
      // 撖拙? (8-11撟) - ????
      { head: {x:0,y:-6,rotation:-15}, body: {rotation:-15}, leftArm: {upperRotation:-135,lowerRotation:-90}, rightArm: {upperRotation:-135,lowerRotation:-90}, leftLeg: {upperRotation:15,lowerRotation:25}, rightLeg: {upperRotation:15,lowerRotation:25} },
      { head: {x:0,y:-3,rotation:-8}, body: {rotation:-8}, leftArm: {upperRotation:-90,lowerRotation:-45}, rightArm: {upperRotation:-90,lowerRotation:-45}, leftLeg: {upperRotation:8,lowerRotation:15}, rightLeg: {upperRotation:8,lowerRotation:15} },
      { head: {x:0,y:-1,rotation:-3}, body: {rotation:-3}, leftArm: {upperRotation:-60,lowerRotation:-25}, rightArm: {upperRotation:-60,lowerRotation:-25}, leftLeg: {upperRotation:3,lowerRotation:8}, rightLeg: {upperRotation:3,lowerRotation:8} },
      { head: {x:0,y:0,rotation:0}, body: {rotation:0}, leftArm: {upperRotation:-10,lowerRotation:0}, rightArm: {upperRotation:10,lowerRotation:0}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:0,lowerRotation:5} }
    ];
  }

  // ?嗡???賢??思蝙?券????
  createFireBallAnimation() { return this.createGenericSkillAnimation('throw'); }
  createWaterShieldAnimation() { return this.createGenericSkillAnimation('shield'); }
  createWaterDragonAnimation() { return this.createGenericSkillAnimation('cast'); }
  createThunderPunchAnimation() { return this.createGenericSkillAnimation('punch'); }
  createRockGuardAnimation() { return this.createGenericSkillAnimation('guard'); }
  createShadowCloneAnimation() { return this.createGenericSkillAnimation('clone'); }
  createSpiritBombAnimation() { return this.createGenericSkillAnimation('throw'); }
  createVenomDartAnimation() { return this.createGenericSkillAnimation('throw'); }
  createThornTrapAnimation() { return this.createGenericSkillAnimation('cast'); }
  createSavageSuplexAnimation() { return this.createGenericSkillAnimation('dash'); }
  createRoyalExecutionAnimation() { return this.createGenericSkillAnimation('punch'); }
  createElfTalismanAnimation() { return this.createGenericSkillAnimation('cast'); }
  createStealthDashAnimation() { return this.createGenericSkillAnimation('dash'); }
  createBloodShacklesAnimation() { return this.createGenericSkillAnimation('throw'); }
  createBloodDevourAnimation() { return this.createGenericSkillAnimation('cast'); }
  createFlashCutAnimation() { return this.createGenericSkillAnimation('dash'); }
  createIaiFlashAnimation() { return this.createGenericSkillAnimation('cast'); }

  // Scorpion whip attack animation - wide sweeping arm motion
  createScorpionWhipAnimation() {
    return Array(12).fill().map((_, frame) => {
      const t = frame / 11;
      // Wind-up (0-0.3), snap forward (0.3-0.6), follow through (0.6-1.0)
      let armAngle, bodyAngle;
      if (t < 0.3) {
        const p = t / 0.3;
        armAngle = -30 + p * (-90);
        bodyAngle = p * (-15);
      } else if (t < 0.6) {
        const p = (t - 0.3) / 0.3;
        armAngle = -120 + p * 210;
        bodyAngle = -15 + p * 30;
      } else {
        const p = (t - 0.6) / 0.4;
        armAngle = 90 - p * 80;
        bodyAngle = 15 - p * 15;
      }
      return {
        head: { x: 0, y: 0, rotation: bodyAngle * 0.3 },
        body: { rotation: bodyAngle },
        leftArm: { upperRotation: -20, lowerRotation: -10 },
        rightArm: { upperRotation: armAngle, lowerRotation: Math.max(0, armAngle * 0.3) },
        leftLeg: { upperRotation: bodyAngle * 0.2, lowerRotation: 5 },
        rightLeg: { upperRotation: -bodyAngle * 0.2, lowerRotation: 5 }
      };
    });
  }

  // Rebel Minion summoning animation - raising hand to sky
  createRebelMinionAnimation() {
    return Array(12).fill().map((_, frame) => {
      const t = frame / 11;
      const raiseArm = t < 0.5 ? (t / 0.5) * -160 : -160 + ((t - 0.5) / 0.5) * 150;
      return {
        head: { x: 0, y: t < 0.5 ? -t * 4 : 0, rotation: t < 0.5 ? -5 : 0 },
        body: { rotation: t < 0.5 ? -5 : 0 },
        leftArm: { upperRotation: -10, lowerRotation: 0 },
        rightArm: { upperRotation: raiseArm, lowerRotation: -20 },
        leftLeg: { upperRotation: 0, lowerRotation: 5 },
        rightLeg: { upperRotation: 0, lowerRotation: 5 }
      };
    });
  }

  // Chain of Pain animation - both arms forward, channeling
  createChainOfPainAnimation() {
    return Array(12).fill().map((_, frame) => {
      const t = frame / 11;
      const shakeX = Math.sin(frame * 2.5) * 2;
      const armExtend = t < 0.3 ? (t / 0.3) * 60 : 60;
      return {
        head: { x: shakeX, y: 0, rotation: shakeX * 0.5 },
        body: { rotation: 5 },
        leftArm: { upperRotation: armExtend, lowerRotation: 10 },
        rightArm: { upperRotation: armExtend, lowerRotation: 10 },
        leftLeg: { upperRotation: 5, lowerRotation: 10 },
        rightLeg: { upperRotation: -5, lowerRotation: 10 }
      };
    });
  }

  createHitAnimation() { return this.createGenericSkillAnimation('hit'); }
  createVictoryAnimation() { return this.createGenericSkillAnimation('victory'); }
  createDefeatAnimation() { return this.createGenericSkillAnimation('defeat'); }

  // ???賢??怎??
  createGenericSkillAnimation(type) {
    const baseFrame = { head: {x:0,y:0,rotation:0}, body: {rotation:0}, leftArm: {upperRotation:-10,lowerRotation:0}, rightArm: {upperRotation:10,lowerRotation:0}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:0,lowerRotation:5} };
    
    switch(type) {
      case 'throw':
        return Array(12).fill().map((_, i) => ({
          ...baseFrame,
          rightArm: { upperRotation: -90 + (i/11) * 180, lowerRotation: -45 + (i/11) * 90 }
        }));
      case 'shield':
        return Array(12).fill().map(() => ({
          ...baseFrame,
          leftArm: { upperRotation: -80, lowerRotation: -40 },
          rightArm: { upperRotation: -80, lowerRotation: -40 }
        }));
      case 'cast':
        return Array(12).fill().map((_, i) => ({
          ...baseFrame,
          leftArm: { upperRotation: -60, lowerRotation: -30 },
          rightArm: { upperRotation: -60, lowerRotation: -30 },
          head: { x:0, y: Math.sin(i*0.5)*2, rotation: 0 }
        }));
      case 'punch':
        return Array(12).fill().map((_, i) => {
          const punchPhase = (i % 4) / 4;
          return {
            ...baseFrame,
            rightArm: { 
              upperRotation: Math.sin(punchPhase * Math.PI) * 90, 
              lowerRotation: Math.sin(punchPhase * Math.PI) * 45 
            }
          };
        });
      case 'guard':
        return Array(12).fill().map(() => ({
          ...baseFrame,
          body: { rotation: -10 },
          leftArm: { upperRotation: -70, lowerRotation: -40 },
          rightArm: { upperRotation: -70, lowerRotation: -40 }
        }));
      case 'slam':
        // ?? 靽格迤嚗?亥??鋆??嚗??甇貉矽??
        return [
          // ??皞? (0-3撟) - ??擃?
          { head: {x:0,y:0,rotation:0}, body: {rotation:0}, leftArm: {upperRotation:-90,lowerRotation:-45}, rightArm: {upperRotation:-90,lowerRotation:-45}, leftLeg: {upperRotation:10,lowerRotation:20}, rightLeg: {upperRotation:10,lowerRotation:20} },
          { head: {x:0,y:-2,rotation:-5}, body: {rotation:-5}, leftArm: {upperRotation:-110,lowerRotation:-70}, rightArm: {upperRotation:-110,lowerRotation:-70}, leftLeg: {upperRotation:15,lowerRotation:30}, rightLeg: {upperRotation:15,lowerRotation:30} },
          { head: {x:0,y:-4,rotation:-10}, body: {rotation:-10}, leftArm: {upperRotation:-130,lowerRotation:-90}, rightArm: {upperRotation:-130,lowerRotation:-90}, leftLeg: {upperRotation:20,lowerRotation:40}, rightLeg: {upperRotation:20,lowerRotation:40} },
          { head: {x:0,y:-6,rotation:-15}, body: {rotation:-15}, leftArm: {upperRotation:-150,lowerRotation:-120}, rightArm: {upperRotation:-150,lowerRotation:-120}, leftLeg: {upperRotation:25,lowerRotation:50}, rightLeg: {upperRotation:25,lowerRotation:50} },
          
          // ???? (4-6撟) - ?擃???
          { head: {x:0,y:-8,rotation:-20}, body: {rotation:-20}, leftArm: {upperRotation:-170,lowerRotation:-140}, rightArm: {upperRotation:-170,lowerRotation:-140}, leftLeg: {upperRotation:30,lowerRotation:60}, rightLeg: {upperRotation:30,lowerRotation:60} },
          { head: {x:0,y:-10,rotation:-25}, body: {rotation:-25}, leftArm: {upperRotation:-180,lowerRotation:-150}, rightArm: {upperRotation:-180,lowerRotation:-150}, leftLeg: {upperRotation:35,lowerRotation:70}, rightLeg: {upperRotation:35,lowerRotation:70} },
          { head: {x:0,y:-8,rotation:-20}, body: {rotation:-20}, leftArm: {upperRotation:-170,lowerRotation:-140}, rightArm: {upperRotation:-170,lowerRotation:-140}, leftLeg: {upperRotation:30,lowerRotation:60}, rightLeg: {upperRotation:30,lowerRotation:60} },
          
          // ???詨 (7-9撟) - ??詨??圈
          { head: {x:0,y:4,rotation:30}, body: {rotation:40}, leftArm: {upperRotation:45,lowerRotation:90}, rightArm: {upperRotation:45,lowerRotation:90}, leftLeg: {upperRotation:-20,lowerRotation:0}, rightLeg: {upperRotation:-20,lowerRotation:0} },
          { head: {x:0,y:8,rotation:45}, body: {rotation:60}, leftArm: {upperRotation:90,lowerRotation:135}, rightArm: {upperRotation:90,lowerRotation:135}, leftLeg: {upperRotation:-40,lowerRotation:20}, rightLeg: {upperRotation:-40,lowerRotation:20} },
          { head: {x:0,y:12,rotation:60}, body: {rotation:80}, leftArm: {upperRotation:120,lowerRotation:160}, rightArm: {upperRotation:120,lowerRotation:160}, leftLeg: {upperRotation:-60,lowerRotation:60}, rightLeg: {upperRotation:-60,lowerRotation:60} },
          
          // ?圈?擗? (10-11撟) - 頨恍???
          { head: {x:2,y:8,rotation:50}, body: {rotation:65}, leftArm: {upperRotation:100,lowerRotation:140}, rightArm: {upperRotation:100,lowerRotation:140}, leftLeg: {upperRotation:-45,lowerRotation:45}, rightLeg: {upperRotation:-45,lowerRotation:45} },
          { head: {x:0,y:0,rotation:0}, body: {rotation:0}, leftArm: {upperRotation:-10,lowerRotation:0}, rightArm: {upperRotation:10,lowerRotation:0}, leftLeg: {upperRotation:0,lowerRotation:5}, rightLeg: {upperRotation:0,lowerRotation:5} }
        ];
      case 'clone':
        return Array(12).fill().map((_, i) => ({
          ...baseFrame,
          head: { x: Math.sin(i * 0.8) * 2, y: 0, rotation: Math.sin(i * 0.8) * 10 }
        }));
      case 'heal':
        return Array(12).fill().map((_, i) => ({
          ...baseFrame,
          leftArm: { upperRotation: -45, lowerRotation: -20 },
          rightArm: { upperRotation: -45, lowerRotation: -20 },
          head: { x: 0, y: Math.sin(i * 0.3) * 3, rotation: 0 }
        }));
      case 'hit':
        return Array(12).fill().map((_, i) => ({
          ...baseFrame,
          head: { x: Math.sin(i * 2) * 5, y: 0, rotation: Math.sin(i * 2) * 15 },
          body: { rotation: Math.sin(i * 2) * 20 }
        }));
      case 'victory':
        return Array(12).fill().map((_, i) => ({
          ...baseFrame,
          leftArm: { upperRotation: -45 + Math.sin(i * 0.5) * 30, lowerRotation: -20 },
          rightArm: { upperRotation: -45 + Math.sin(i * 0.5) * 30, lowerRotation: -20 }
        }));
      case 'defeat':
        return Array(12).fill().map(() => ({
          head: { x: 0, y: 15, rotation: 0 },
          body: { rotation: 90 },
          leftArm: { upperRotation: 45, lowerRotation: 90 },
          rightArm: { upperRotation: 45, lowerRotation: 90 },
          leftLeg: { upperRotation: 0, lowerRotation: 0 },
          rightLeg: { upperRotation: 0, lowerRotation: 0 }
        }));
      default:
        return Array(12).fill(baseFrame);
    }
  }
  
  // 蝜芾ˊ?急鈭?
  drawStickman(ctx, x, y, frame, schoolId, facing = 1, scale = 1) {
    const colors = this.schoolColors[schoolId] || this.schoolColors.katon;
    const equipment = this.ninjaEquipment[schoolId] || this.ninjaEquipment.katon;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing * scale, scale);
    
    // ?? 蝜芾ˊ?寞????
    this.drawSpecialAura(ctx, frame, equipment);
    
    // ? 蝜芾ˊ?恍◢/?窈嚗頨恍?敺嚗?
    if (equipment.cape) {
      this.drawCape(ctx, frame, equipment.cape, colors);
    }
    if (equipment.cloak) {
      this.drawCloak(ctx, frame, equipment.cloak, colors);
    }
    if (equipment.robe) {
      this.drawRobe(ctx, frame, equipment.robe, colors);
    }
    
    // ?朴 蝜芾ˊ?輸
    this.drawLegs(ctx, frame, colors, equipment);
    
    // ? 蝜芾ˊ頨恍?嚗葆霅瑞/鋆?嚗?
    this.drawBody(ctx, frame, colors, equipment);
    
    // ? 蝜芾ˊ???郎??
    this.drawArms(ctx, frame, colors, equipment);
    
    // ?儭?蝜芾ˊ甇血
    this.drawWeapon(ctx, frame, equipment.weapon, colors, facing);
    
    // ?? 蝜芾ˊ?剝
    this.drawHead(ctx, frame, colors, equipment);
    
    // ?? 蝜芾ˊ?剖葆
    this.drawHeadband(ctx, frame, equipment.headband);
    
    // ??蝜芾ˊ?寞???蝎?
    this.drawSpecialEffects(ctx, frame, equipment, x, y);
    
    ctx.restore();
  }

  drawColossalGolem(ctx, x, y, facing = 1, scale = 1, animationPhase = 0, animationName = 'idle', attackStartTime = 0) {
    const t = Date.now() * 0.003 + animationPhase;
    const auraPulse = 0.7 + Math.sin(t * 1.7) * 0.18;
    const rubbleLift = Math.abs(Math.sin(t * 2.2)) * 2.5;
    const attackPose = animationName === 'attack';
    const throwPose = animationName === 'earthQuake' || animationName === 'rockGuard';

    // 撌函?格嚗蝙?典?畾萄??怠?隞???祉??舐
    let leftElbowY, leftFistY, leftFistX;
    if (attackPose && attackStartTime) {
      const elapsed = Date.now() - attackStartTime;
      const sp = Math.min(elapsed / 350, 1);
      if (sp < 0.25) {
        // ??嚗?????
        const e = (sp / 0.25);
        const eased = e * e;
        leftElbowY = -40 + (-82 - (-40)) * eased;
        leftFistY = 0 + (-55 - 0) * eased;
        leftFistX = -78 + (-62 - (-78)) * eased;
      } else {
        // ?桐?嚗翰???
        const e = (sp - 0.25) / 0.75;
        const eased = 1 - (1 - e) * (1 - e);
        leftElbowY = -82 + (-22 - (-82)) * eased;
        leftFistY = -55 + (18 - (-55)) * eased;
        leftFistX = -62 + (-115 - (-62)) * eased;
      }
    } else if (attackPose) {
      // 瘝????單?????
      const slamProgress = 0.5 + Math.sin(t * 3.6) * 0.5;
      leftElbowY = -52 + slamProgress * 14;
      leftFistY = -28 + slamProgress * 18;
      leftFistX = -92 - slamProgress * 8;
    } else {
      leftElbowY = -40 + Math.sin(t) * 4;
      leftFistY = 0;
      leftFistX = -78;
    }

    const rightElbowY = throwPose ? -92 : (-42 - Math.sin(t) * 4);
    const rightFistY = throwPose ? -118 : -2;
    const rightFistX = throwPose ? 106 : 78;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing * scale, scale);

    // Emerald energy aura
    const aura = ctx.createRadialGradient(0, -70, 18, 0, -70, 95);
    aura.addColorStop(0, `rgba(80, 255, 160, ${0.24 * auraPulse})`);
    aura.addColorStop(0.55, `rgba(40, 210, 120, ${0.14 * auraPulse})`);
    aura.addColorStop(1, 'rgba(20, 90, 50, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(0, -70, 95, 0, Math.PI * 2);
    ctx.fill();

    // Dust and debris at feet
    for (let i = 0; i < 12; i++) {
      const dx = -58 + i * 10;
      const dy = 14 + Math.sin(t * 2.4 + i) * 3 - rubbleLift;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(120, 104, 88, 0.45)' : 'rgba(88, 76, 64, 0.38)';
      ctx.beginPath();
      ctx.arc(dx, dy, 3 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }

    // Wide stance feet
    ctx.fillStyle = '#4E443B';
    ctx.strokeStyle = '#2A2521';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-55, 4, 34, 18, 6);
    ctx.roundRect(21, 4, 34, 18, 6);
    ctx.fill();
    ctx.stroke();

    // Short stubby legs
    ctx.fillStyle = '#5B5248';
    ctx.beginPath();
    ctx.roundRect(-38, -28, 20, 36, 6);
    ctx.roundRect(18, -28, 20, 36, 6);
    ctx.fill();
    ctx.stroke();

    // Gorilla-like torso base
    ctx.fillStyle = '#55504A';
    ctx.beginPath();
    ctx.moveTo(-52, -20);
    ctx.lineTo(-64, -102);
    ctx.lineTo(-28, -148);
    ctx.lineTo(28, -148);
    ctx.lineTo(64, -102);
    ctx.lineTo(52, -20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Overlapping jagged rock armor plates
    const plates = [
      { x: -42, y: -112, w: 30, h: 26 },
      { x: -10, y: -126, w: 20, h: 24 },
      { x: 14, y: -114, w: 32, h: 26 },
      { x: -34, y: -78, w: 26, h: 24 },
      { x: -4, y: -88, w: 26, h: 28 },
      { x: 24, y: -76, w: 24, h: 22 },
      { x: -28, y: -48, w: 24, h: 22 },
      { x: 2, y: -54, w: 28, h: 24 }
    ];

    plates.forEach((plate, index) => {
      ctx.save();
      ctx.translate(plate.x + plate.w / 2, plate.y + plate.h / 2);
      ctx.rotate(((index % 3) - 1) * 0.08);
      ctx.fillStyle = index % 2 === 0 ? '#6A6258' : '#4F4841';
      ctx.beginPath();
      ctx.moveTo(-plate.w / 2, -plate.h / 2 + 4);
      ctx.lineTo(-plate.w / 2 + 6, -plate.h / 2);
      ctx.lineTo(plate.w / 2 - 5, -plate.h / 2 + 2);
      ctx.lineTo(plate.w / 2, plate.h / 2 - 6);
      ctx.lineTo(plate.w / 2 - 7, plate.h / 2);
      ctx.lineTo(-plate.w / 2 + 4, plate.h / 2 - 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // Deep glowing fissures
    ctx.save();
    ctx.strokeStyle = '#6DFFB3';
    ctx.shadowColor = '#50FF9A';
    ctx.shadowBlur = 16;
    ctx.lineWidth = 3;
    const fissures = [
      [[-18, -138], [-10, -114], [-16, -86], [-8, -58]],
      [[12, -132], [4, -108], [10, -82], [2, -42]],
      [[-40, -92], [-28, -72], [-34, -42]],
      [[36, -98], [24, -72], [30, -46]]
    ];
    fissures.forEach(points => {
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
      }
      ctx.stroke();
    });
    ctx.restore();

    // Long arms reaching low to the ground
    ctx.strokeStyle = '#3C3732';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-44, -118);
    ctx.lineTo(-68, leftElbowY);
    ctx.lineTo(leftFistX, leftFistY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(44, -118);
    ctx.lineTo(68, rightElbowY);
    ctx.lineTo(rightFistX, rightFistY);
    ctx.stroke();

    // Massive stone fists
    ctx.fillStyle = '#4A443E';
    ctx.beginPath();
    ctx.roundRect(leftFistX - 17, leftFistY - 10, 28, 24, 7);
    ctx.roundRect(rightFistX - 11, rightFistY - 10, 28, 24, 7);
    ctx.fill();
    ctx.stroke();

    // Small blocky head with dominating green eyes
    ctx.fillStyle = '#47423C';
    ctx.beginPath();
    ctx.roundRect(-22, -174, 44, 32, 6);
    ctx.fill();
    ctx.stroke();

    // Brow ridge
    ctx.fillStyle = '#3B3530';
    ctx.fillRect(-20, -172, 40, 8);

    // Eyes and face glow
    ctx.save();
    ctx.fillStyle = '#7DFFC6';
    ctx.shadowColor = '#4DFF9E';
    ctx.shadowBlur = 16;
    ctx.fillRect(-13, -161, 8, 5);
    ctx.fillRect(5, -161, 8, 5);
    ctx.restore();

    // Head crack glow
    ctx.save();
    ctx.strokeStyle = '#62FFB2';
    ctx.shadowColor = '#62FFB2';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -174);
    ctx.lineTo(-4, -160);
    ctx.lineTo(2, -146);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // ?? 蝜芾ˊ?寞????
  drawSpecialAura(ctx, frame, equipment) {
    if (equipment.aura) {
      const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
      
      ctx.save();
      ctx.globalAlpha = 0.2 * pulse;
      ctx.fillStyle = equipment.aura.color;
      ctx.beginPath();
      ctx.arc(0, -25, equipment.aura.glow + pulse * 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (equipment.specialEffect === 'forge_sparks') {
      const time = Date.now() * 0.006;
      ctx.save();
      ctx.shadowColor = '#FF5A1F';
      ctx.shadowBlur = 7;
      for (let spark = 0; spark < 7; spark++) {
        const phase = time + spark * 1.6;
        const radius = 20 + (spark % 3) * 7;
        const x = Math.cos(phase * 0.72) * radius;
        const y = -30 + Math.sin(phase) * 18 - (spark % 2) * 9;
        ctx.globalAlpha = 0.35 + (spark % 3) * 0.16;
        ctx.fillStyle = spark % 2 ? '#FF6D00' : '#FFD166';
        ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
      }
      ctx.restore();
    }
  }

  // ? 蝜芾ˊ?恍◢嚗◢敶勗???
  drawCape(ctx, frame, cape, colors) {
    const capeFlow = Math.sin(Date.now() * 0.005) * 10;
    
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = cape.color;
    
    // ?恍◢銝駁?
    ctx.beginPath();
    ctx.moveTo(-8, -45);
    ctx.quadraticCurveTo(-15 + capeFlow, -20, -12 + capeFlow, 0);
    ctx.lineTo(-8, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(8, -45);
    ctx.quadraticCurveTo(15 - capeFlow, -20, 12 - capeFlow, 0);
    ctx.lineTo(8, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  // ?? 蝜芾ˊ?窈嚗?敶勗???
  drawCloak(ctx, frame, cloak, colors) {
    ctx.save();
    ctx.globalAlpha = cloak.transparency;
    ctx.fillStyle = cloak.color;
    
    // ?窈頛芸?
    ctx.beginPath();
    ctx.moveTo(-10, -50);
    ctx.lineTo(-20, -30);
    ctx.lineTo(-18, 5);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(10, -50);
    ctx.lineTo(20, -30);
    ctx.lineTo(18, 5);
    ctx.lineTo(5, 5);
    ctx.closePath();
    ctx.fill();
    
    // ?窈?啣蔣??
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(0, -25, 12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  // ?? 蝜芾ˊ?瑁?嚗偌敶勗???
  drawRobe(ctx, frame, robe, colors) {
    const flow = Math.sin(Date.now() * 0.004) * 5;
    
    ctx.save();
    ctx.fillStyle = robe.color;
    
    // 鋡?銝駁?
    ctx.beginPath();
    ctx.moveTo(-12, -40);
    ctx.quadraticCurveTo(-15 + flow, -10, -13 + flow, 5);
    ctx.lineTo(13 - flow, 5);
    ctx.quadraticCurveTo(15 - flow, -10, 12, -40);
    ctx.closePath();
    ctx.fill();
    
    // 鋡?蝝楝
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-8, -35);
    ctx.quadraticCurveTo(-10 + flow, -20, -9 + flow, 0);
    ctx.stroke();
    
    ctx.restore();
  }

  // ? 蝜芾ˊ頨恍?嚗?撘瑞?嚗?
  drawBody(ctx, frame, colors, equipment) {
    ctx.save();
    ctx.rotate(frame.body.rotation * Math.PI / 180);
    
    // 銝駁?蝺?
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, -50);
    ctx.lineTo(0, 0);
    ctx.stroke();
    
    // ? 撗拍霅瑞
    if (equipment.armor) {
      ctx.save();
      ctx.fillStyle = equipment.armor.color;
      ctx.globalAlpha = 0.7;
      
      // ?貊?踹?
      const armorPlates = [
        {x: -6, y: -45, w: 12, h: 10},
        {x: -7, y: -33, w: 14, h: 12},
        {x: -6, y: -19, w: 12, h: 10}
      ];
      
      armorPlates.forEach(plate => {
        ctx.fillRect(plate.x, plate.y, plate.w, plate.h);
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1;
        ctx.strokeRect(plate.x, plate.y, plate.w, plate.h);
      });
      
      ctx.restore();
    }
    
    // ? ?怎蝝楝
    if (equipment.bodyPattern === 'scale_armor') {
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(-3, -40 + i * 8, 3, 0, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(3, -40 + i * 8, 3, 0, Math.PI);
        ctx.stroke();
      }
    }
    
    // ???琿蝝楝
    if (equipment.bodyPattern === 'lightning_marks') {
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-4, -40);
      ctx.lineTo(-6, -30);
      ctx.lineTo(-3, -30);
      ctx.lineTo(-5, -20);
      ctx.stroke();
    }
    
    // ?? ?蔣蝝楝
    if (equipment.bodyPattern === 'shadow_marks') {
      ctx.fillStyle = colors.secondary;
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(-2, -45 + i * 15, 4, 8);
      }
    }
    
    // ? ??蝝楝
    if (equipment.bodyPattern === 'spirit_marks') {
      ctx.strokeStyle = colors.secondary;
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(0, -30, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ??瘚芯犖蝢賜? (ronin haori vest)
    if (equipment.bodyPattern === 'ronin_haori') {
      ctx.save();
      ctx.fillStyle = colors.secondary;
      ctx.globalAlpha = 0.5;
      // Left lapel
      ctx.beginPath();
      ctx.moveTo(-2, -48);
      ctx.lineTo(-8, -48);
      ctx.lineTo(-10, -10);
      ctx.lineTo(-2, -10);
      ctx.closePath();
      ctx.fill();
      // Right lapel
      ctx.beginPath();
      ctx.moveTo(2, -48);
      ctx.lineTo(8, -48);
      ctx.lineTo(10, -10);
      ctx.lineTo(2, -10);
      ctx.closePath();
      ctx.fill();
      // Obi (belt sash) at waist
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = colors.accent;
      ctx.fillRect(-9, -12, 18, 5);
      ctx.restore();
    }
    
    // ??霅瑟?嚗????
    if (equipment.gauntlets) {
      ctx.fillStyle = equipment.gauntlets.color;
      ctx.fillRect(-8, -15, equipment.gauntlets.size, 10);
      ctx.fillRect(2, -15, equipment.gauntlets.size, 10);
    }
    
    // ? 霅瑁
    if (equipment.shoulderPads) {
      ctx.fillStyle = equipment.shoulderPads.color;
      ctx.beginPath();
      ctx.arc(-8, -45, equipment.shoulderPads.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(8, -45, equipment.shoulderPads.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  // ?? 蝜芾ˊ?剝嚗?撘瑞?嚗?
  drawHead(ctx, frame, colors, equipment) {
    ctx.save();
    ctx.translate(frame.head.x, frame.head.y - 65);
    ctx.rotate(frame.head.rotation * Math.PI / 180);
    
    // ?剝頛芸?
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, this.skeleton.head.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // ?剝憛怠?嚗?敺格撓撅歹?
    const headGradient = ctx.createRadialGradient(0, -3, 0, 0, 0, this.skeleton.head.radius);
    headGradient.addColorStop(0, colors.accent);
    headGradient.addColorStop(1, colors.primary);
    ctx.fillStyle = headGradient;
    ctx.fill();
    
    // ? ?函?潛?憿
    ctx.fillStyle = equipment.eyeColor;
    ctx.shadowColor = equipment.eyeColor;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(-5, -3, 3, 0, Math.PI * 2);
    ctx.arc(5, -3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // ?? ??嚗??”??
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.lineTo(-3, -6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, -8);
    ctx.lineTo(3, -6);
    ctx.stroke();
    
    // ? 曌餃??撌?
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-1, 2);
    ctx.stroke();
    
    // ?? ?Ｙ蔗嚗?敶勗???
    if (equipment.bodyPattern === 'shadow_marks') {
      ctx.fillStyle = '#000000';
      ctx.globalAlpha = 0.6;
      ctx.fillRect(-10, -2, 20, 8);
      ctx.globalAlpha = 1;
    }
    
    ctx.restore();
  }

  // ?? 蝜芾ˊ?剖葆
  drawHeadband(ctx, frame, headband) {
    if (!headband) return;
    
    ctx.save();
    ctx.translate(frame.head.x, frame.head.y - 65);
    ctx.rotate(frame.head.rotation * Math.PI / 180);
    
    // ?剖葆撣?
    ctx.fillStyle = headband.color;
    ctx.fillRect(-this.skeleton.head.radius - 2, -this.skeleton.head.radius - 3, 
                 this.skeleton.head.radius * 2 + 4, 6);
    
    // ?剖葆?惇??
    const metalGradient = ctx.createLinearGradient(-8, -this.skeleton.head.radius, 
                                                    8, -this.skeleton.head.radius);
    metalGradient.addColorStop(0, '#C0C0C0');
    metalGradient.addColorStop(0.5, '#FFFFFF');
    metalGradient.addColorStop(1, '#A0A0A0');
    ctx.fillStyle = metalGradient;
    ctx.fillRect(-8, -this.skeleton.head.radius - 2, 16, 4);
    
    // ?剖葆蝚西?
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(headband.pattern, 0, -this.skeleton.head.radius);
    
    // ?剖葆憌葆
    const ribbonFlow = Math.sin(Date.now() * 0.005) * 5;
    ctx.fillStyle = headband.color;
    ctx.save();
    ctx.translate(this.skeleton.head.radius + 2, -this.skeleton.head.radius);
    ctx.rotate((15 + ribbonFlow) * Math.PI / 180);
    ctx.fillRect(0, -2, 15, 4);
    ctx.restore();
    
    ctx.restore();
  }

  // ?儭?蝜芾ˊ甇血嚗?蝝?撘瑞?嚗?
  drawWeapon(ctx, frame, weapon, colors, facing) {
    if (!weapon) return;
    
    ctx.save();
    
    // ?寞??隤踵甇血雿蔭
    const weaponX = facing * 15;
    const weaponY = -20;
    
    ctx.translate(weaponX, weaponY);
    
    switch(weapon.type) {
      case 'dual_blades': // 憸典蔣敹?- ??
        this.drawDualBlades(ctx, weapon.color, colors);
        break;
      case 'flame_katana': // ?怎敹?- ??
        this.drawFlameKatana(ctx, weapon.color, colors);
        break;
      case 'forgefire_greatblade':
        this.drawForgefireGreatblade(ctx, weapon.color, frame.weaponRotation || 0, frame.weaponScale || 1);
        break;
      case 'water_staff': // 瘞游蔣敹?- 瘞湔?
        this.drawWaterStaff(ctx, weapon.color, colors);
        break;
      case 'thunder_fists': // ?瑟?敹?- ?瑟
        this.drawThunderFists(ctx, weapon.color, colors);
        break;
      case 'rock_hammer': // 撗拍敹?- 撗拚?
        this.drawRockHammer(ctx, weapon.color, colors);
        break;
      case 'shadow_daggers': // ?蔣敹?- 敶勗?
        this.drawShadowDaggers(ctx, weapon.color, colors);
        break;
      case 'spirit_orb': // ????- ??
        this.drawSpiritOrb(ctx, weapon.color, colors);
        break;
      case 'elf_bow': // 蝎暸??? - 蝎暸?撘?
        this.drawElfBow(ctx, weapon.color, colors);
        break;
      case 'blood_orb': // 銵憟???- 銵??
        this.drawBloodOrb(ctx, weapon.color, colors);
        break;
      case 'katana': // 瘚芯犖?恥 - 憭芸?
        this.drawKatana(ctx, weapon.color, colors);
        break;
      case 'gavel': // 鋆捱??- 瘜?
        this.drawGavel(ctx, weapon.color, colors);
        break;

      case 'shamisen_lute':
        this.drawShamisenLute(ctx, weapon.color, colors);
        break;    }
    
    ctx.restore();
  }

  // ?儭?????
  drawDualBlades(ctx, color, colors) {
    // 銝餃?
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -25);
    ctx.stroke();
    
    // ?臬?
    ctx.beginPath();
    ctx.moveTo(5, 5);
    ctx.lineTo(5, -20);
    ctx.stroke();
    
    // ???黎
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-1, -5);
    ctx.lineTo(-1, -20);
    ctx.stroke();
  }

  // ? ??
  drawFlameKatana(ctx, color, colors) {
    // ?頨?
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.lineTo(0, -30);
    ctx.stroke();
    
    // ?怎??
    const flameTime = Date.now() * 0.01;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const flameY = -30 + i * 7;
      const flameOffset = Math.sin(flameTime + i) * 3;
      ctx.beginPath();
      ctx.moveTo(flameOffset, flameY);
      ctx.lineTo(flameOffset + 3, flameY - 5);
      ctx.stroke();
    }
    
    // ???
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(-3, 3, 6, 8);
  }

  // 鍛炎忍者專屬：厚重的鍛鋼火焰大刃，不與火忍宗的細太刀共用。
  drawForgefireGreatblade(ctx, color, rotation, scale) {
    const flameTime = Date.now() * 0.009;
    ctx.save();
    ctx.rotate(rotation * Math.PI / 180);
    ctx.scale(scale, scale);

    // 加長握柄與護手
    ctx.fillStyle = '#28140F';
    ctx.fillRect(-4, 4, 8, 18);
    ctx.fillStyle = color;
    ctx.fillRect(-9, 2, 18, 4);
    ctx.fillStyle = '#7A2D16';
    ctx.fillRect(-2, 6, 4, 14);

    // 寬刃：煤黑鍛鋼外緣，中央仍有熔岩般的刃紋。
    ctx.shadowColor = '#FF5A1F';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#211615';
    ctx.strokeStyle = '#FF6D00';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-8, 3);
    ctx.lineTo(-14, -43);
    ctx.lineTo(-5, -66);
    ctx.lineTo(5, -66);
    ctx.lineTo(14, -43);
    ctx.lineTo(8, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 5;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(0, -55);
    ctx.moveTo(-5, -14);
    ctx.lineTo(4, -25);
    ctx.moveTo(4, -34);
    ctx.lineTo(-3, -44);
    ctx.stroke();

    // 火舌貼著刀背跳動；這是重刃本身的特效而非通用火刀。
    ctx.strokeStyle = '#FFB000';
    ctx.lineWidth = 2;
    for (let flame = 0; flame < 4; flame++) {
      const bladeY = -18 - flame * 11;
      const side = flame % 2 ? -1 : 1;
      const flicker = Math.sin(flameTime + flame * 1.8) * 4;
      ctx.beginPath();
      ctx.moveTo(side * 8, bladeY);
      ctx.quadraticCurveTo(side * (15 + flicker), bladeY - 5, side * 10, bladeY - 12);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ?? 瘞湔?
  drawWaterStaff(ctx, color, colors) {
    // ?澈
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(0, -35);
    ctx.stroke();
    
    // 瘞渡???
    const waterTime = Date.now() * 0.005;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 3; i++) {
      const dropY = -35 + Math.sin(waterTime + i * 2) * 15;
      ctx.beginPath();
      ctx.arc(Math.sin(waterTime + i) * 3, dropY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    // ?撖嗥
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.arc(0, -35, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ???琿?喳?
  drawThunderFists(ctx, color, colors) {
    // ?喳?銝駁?
    ctx.fillStyle = colors.primary;
    ctx.fillRect(-5, 0, 10, 12);
    
    // ?餃???
    const sparkTime = Date.now() * 0.02;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const sparkAngle = (sparkTime + i * 120) % 360;
      const sparkX = Math.cos(sparkAngle * Math.PI / 180) * 8;
      const sparkY = Math.sin(sparkAngle * Math.PI / 180) * 8 + 6;
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.lineTo(sparkX, sparkY);
      ctx.stroke();
    }
  }

  // ? 撗拍撌券?
  drawRockHammer(ctx, color, colors) {
    // ??
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(0, -20);
    ctx.stroke();
    
    // ?
    ctx.fillStyle = colors.primary;
    ctx.fillRect(-10, -30, 20, 12);
    
    // 撗拍蝝?
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(-8 + i * 4, -28);
      ctx.lineTo(-6 + i * 4, -20);
      ctx.stroke();
    }
  }

  // ?? ?蔣??
  drawShadowDaggers(ctx, color, colors) {
    // 銝餃?擐?
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(-3, -18);
    ctx.stroke();
    
    // ?臬?擐?
    ctx.beginPath();
    ctx.moveTo(3, 2);
    ctx.lineTo(3, -16);
    ctx.stroke();
    
    // ?蔣??
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-3, -5);
    ctx.lineTo(-3, -18);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ? ??撖嗥?
  drawSpiritOrb(ctx, color, colors) {
    const orbTime = Date.now() * 0.003;
    const orbPulse = Math.sin(orbTime) * 0.3 + 0.7;
    
    // 憭??
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = colors.secondary;
    ctx.beginPath();
    ctx.arc(0, -15, 10 * orbPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // 撖嗥?銝駁?
    const orbGradient = ctx.createRadialGradient(0, -15, 0, 0, -15, 6);
    orbGradient.addColorStop(0, colors.accent);
    orbGradient.addColorStop(1, colors.primary);
    ctx.fillStyle = orbGradient;
    ctx.beginPath();
    ctx.arc(0, -15, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // ?賡?瘜Ｙ?
    for (let i = 0; i < 3; i++) {
      const waveRadius = 8 + Math.sin(orbTime + i * 2) * 3;
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -15, waveRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ? 蝎暸?撘?
  drawElfBow(ctx, color, colors) {
    const time = Date.now() * 0.003;
    
    // Bow body (curved arc)
    ctx.save();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(5, -10, 18, -Math.PI * 0.7, Math.PI * 0.7);
    ctx.stroke();
    
    // Bowstring
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const topY = -10 + Math.sin(-Math.PI * 0.7) * 18;
    const topX = 5 + Math.cos(-Math.PI * 0.7) * 18;
    const botY = -10 + Math.sin(Math.PI * 0.7) * 18;
    const botX = 5 + Math.cos(Math.PI * 0.7) * 18;
    ctx.moveTo(topX, topY);
    ctx.lineTo(botX, botY);
    ctx.stroke();
    
    // Glow arrow nocked
    ctx.globalAlpha = 0.6 + Math.sin(time) * 0.3;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(topX + 4, -10);
    ctx.lineTo(topX - 8, -12);
    ctx.lineTo(topX - 8, -8);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ?弩 銵?郎??
  drawBloodOrb(ctx, color, colors) {
    const time = Date.now() * 0.004;
    ctx.save();
    // Core orb
    const gradient = ctx.createRadialGradient(0, -15, 2, 0, -15, 10);
    gradient.addColorStop(0, '#FF1744');
    gradient.addColorStop(0.6, colors.primary);
    gradient.addColorStop(1, 'rgba(183,28,28,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, -15, 10, 0, Math.PI * 2);
    ctx.fill();
    // Pulsing inner glow
    ctx.globalAlpha = 0.5 + Math.sin(time) * 0.3;
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.arc(0, -15, 5, 0, Math.PI * 2);
    ctx.fill();
    // Orbiting blood droplets
    for (let i = 0; i < 3; i++) {
      const angle = time + i * (Math.PI * 2 / 3);
      const dx = Math.cos(angle) * 13;
      const dy = -15 + Math.sin(angle) * 13;
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ??瘚芯犖?恥 - 憭芸?蝜芾ˊ
  drawKatana(ctx, color, colors) {
    ctx.save();
    // Translate to right shoulder, then follow arm joints
    // Shoulder ??upper arm rotate ??translate(0,25) ??lower arm rotate ??translate(0,20) ??offset rotate
    ctx.translate(5, -40); // right shoulder
    ctx.rotate(10 * Math.PI / 180); // approximate upper arm angle
    ctx.translate(0, 25); // upper arm length
    ctx.rotate(0); // lower arm angle (idle)
    ctx.translate(0, 20); // lower arm length (at hand)
    ctx.rotate(Math.PI / 4); // katana offset angle

    // Tsuba (crossguard)
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(5, 0);
    ctx.stroke();

    // Blade - curved silver
    ctx.strokeStyle = color || '#CFD8DC';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ECEFF1';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(3, -22, 1, -45);
    ctx.stroke();

    // Blade edge highlight
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0.5, -2);
    ctx.quadraticCurveTo(3.5, -22, 1.5, -43);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ?? 鋆捱??- 瘜?蝜芾ˊ
  drawGavel(ctx, color, colors) {
    ctx.save();
    ctx.translate(4, -38);
    ctx.rotate(28 * Math.PI / 180);

    // 瑽?
    ctx.fillStyle = color || '#8B4513';
    ctx.fillRect(-2, -6, 4, 34);

    // 瑽
    ctx.fillStyle = '#4A4A4A';
    ctx.fillRect(-10, -14, 20, 10);

    // 瑽?惇憌暹?
    ctx.fillStyle = colors.secondary || '#FFD700';
    ctx.fillRect(-10, -14, 20, 2);
    ctx.fillRect(-10, -6, 20, 2);

    ctx.restore();
  }

  // ??蝜芾ˊ?寞???蝎?
  drawSpecialEffects(ctx, frame, equipment, x, y) {
    const time = Date.now() * 0.001;
    
    switch(equipment.specialEffect) {
      case 'wind_trail':
        // 憸其?頠楚
        for (let i = 0; i < 3; i++) {
          ctx.save();
          ctx.globalAlpha = 0.2 - i * 0.06;
          ctx.strokeStyle = '#00BCD4';
          ctx.lineWidth = 2;
          const offsetX = Math.sin(time + i) * 5;
          ctx.beginPath();
          ctx.moveTo(offsetX, -50);
          ctx.lineTo(offsetX, 0);
          ctx.stroke();
          ctx.restore();
        }
        break;
        
      case 'ember_particles':
        // ?怎蝎?
        for (let i = 0; i < 4; i++) {
          const emberY = -30 + Math.sin(time * 2 + i) * 20;
          const emberX = Math.cos(time + i * 1.5) * 8;
          ctx.save();
          ctx.globalAlpha = 0.6;
          ctx.fillStyle = i % 2 === 0 ? '#FF9800' : '#F44336';
          ctx.beginPath();
          ctx.arc(emberX, emberY, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        break;
        
      case 'electric_sparks':
        // ?餌??
        for (let i = 0; i < 3; i++) {
          const sparkX = Math.cos(time * 3 + i * 2) * 10;
          const sparkY = -25 + Math.sin(time * 2 + i) * 15;
          ctx.save();
          ctx.strokeStyle = '#FFEB3B';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(sparkX, sparkY);
          ctx.lineTo(sparkX + 3, sparkY - 3);
          ctx.stroke();
          ctx.restore();
        }
        break;
        
      case 'dark_aura':
        // ?蔣?
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#424242';
        ctx.beginPath();
        ctx.arc(0, -25, 20 + Math.sin(time) * 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
        
      case 'holy_light':
        // ??
        for (let i = 0; i < 4; i++) {
          const angle = (time + i * Math.PI / 2) % (Math.PI * 2);
          const lightX = Math.cos(angle) * 15;
          const lightY = -25 + Math.sin(angle) * 15;
          ctx.save();
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = '#F3E5F5';
          ctx.beginPath();
          ctx.arc(lightX, lightY, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        break;
      case 'leaf_trail':
        // 璅寡?頠楚
        for (let i = 0; i < 4; i++) {
          const leafAngle = time * 1.5 + i * Math.PI / 2;
          const leafX = Math.cos(leafAngle) * 12;
          const leafY = -30 + Math.sin(leafAngle * 0.7 + i) * 15;
          ctx.save();
          ctx.globalAlpha = 0.5 - i * 0.1;
          ctx.translate(leafX, leafY);
          ctx.rotate(leafAngle);
          ctx.fillStyle = i % 2 === 0 ? '#4CAF50' : '#81C784';
          ctx.beginPath();
          ctx.ellipse(0, 0, 4, 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        break;
      case 'blood_drip':
        // 銵皛湔???
        for (let i = 0; i < 4; i++) {
          const dripY = -20 + ((time * 30 + i * 15) % 40);
          const dripX = Math.sin(time + i * 2.3) * 8;
          ctx.save();
          ctx.globalAlpha = 0.6 - (dripY + 20) / 60;
          ctx.fillStyle = i % 2 === 0 ? '#B71C1C' : '#E53935';
          ctx.beginPath();
          ctx.arc(dripX, dripY, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        break;
      case 'blade_glint':
        // ???????
        const glintAlpha = 0.3 + Math.sin(time * 3) * 0.3;
        ctx.save();
        ctx.globalAlpha = glintAlpha;
        ctx.strokeStyle = '#ECEFF1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, -55);
        ctx.lineTo(12, -60);
        ctx.moveTo(10, -50);
        ctx.lineTo(14, -55);
        ctx.stroke();
        ctx.restore();
        break;
      case 'gold_pulse':
        // ????
        ctx.save();
        ctx.globalAlpha = 0.2 + Math.sin(time * 4) * 0.08;
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -28, 18 + Math.sin(time * 2) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        break;
    }
  }

  // ? 靽桀儔嚗炎?亙??急?血???
  isAnimationComplete(player, animationName) {
    if (!player || !player.animation) return false;
    
    const animation = this.animations[animationName];
    if (!animation) return false;
    
    // 憒??舀??賢??思??剜摰?嚗???true
    const skillAnimations = [
      'fireRush', 'fireBall', 'windDash', 'windSlash', 
      'waterShield', 'waterDragon', 'thunderStep', 'thunderPunch',
      'rockGuard', 'earthQuake', 'shadowStrike', 'shadowClone',  // ? 蝣箔??啗???”銝?
      'spiritBomb', 'spiritJudgment', 'attack', 'gavelSmash',
      'forgefireSlash', 'forgefireSpin', 'flameGodBlade',
      'elfTalisman', 'stealthDash',
      'bloodShackles', 'bloodDevour',
      'flashCut', 'iaiFlash'
    ];
    
    if (skillAnimations.includes(animationName)) {
      // ? 靽桀儔嚗Ⅱ靽??怠??豢炎?交迤蝣?
      const currentFrame = Math.floor(player.animation.frame);
      const animationLength = animation.length;
      const isComplete = currentFrame >= animationLength - 1;
      
      // ? ?日?亥?
      if (animationName === 'earthQuake') {
      }
      
      return isComplete;
    }
    
    return false;
  }

  // ? ?啣?嚗?蝵桀敺??
  resetToIdle(player) {
    if (player && player.animation) {
      player.animation.current = 'idle';
      player.animation.frame = 0;
    }
  }

  drawHead(ctx, frame, colors, equipment) {
    ctx.save();
    ctx.translate(frame.head.x, frame.head.y - 65);
    ctx.rotate(frame.head.rotation * Math.PI / 180);
    
    // ?剝頛芸?
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, this.skeleton.head.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // ?剝憛怠?嚗?敺格撓撅歹?
    const headGradient = ctx.createRadialGradient(0, -3, 0, 0, 0, this.skeleton.head.radius);
    headGradient.addColorStop(0, colors.accent);
    headGradient.addColorStop(1, colors.primary);
    ctx.fillStyle = headGradient;
    ctx.fill();
    
    // ? ?函?潛?憿
    ctx.fillStyle = equipment.eyeColor;
    ctx.shadowColor = equipment.eyeColor;
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(-5, -3, 3, 0, Math.PI * 2);
    ctx.arc(5, -3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // ?? ??嚗??”??
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.lineTo(-3, -6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, -8);
    ctx.lineTo(3, -6);
    ctx.stroke();
    
    // ? 曌餃??撌?
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-1, 2);
    ctx.stroke();
    
    // ?? ?Ｙ蔗嚗?敶勗???
    if (equipment.bodyPattern === 'shadow_marks') {
      ctx.fillStyle = '#000000';
      ctx.globalAlpha = 0.6;
      ctx.fillRect(-10, -2, 20, 8);
      ctx.globalAlpha = 1;
    }
    
    ctx.restore();
  }
  
  drawBody(ctx, frame, colors) {
    ctx.save();
    ctx.rotate(frame.body.rotation * Math.PI / 180);
    
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -50);
    ctx.lineTo(0, 0);
    ctx.stroke();
    
    ctx.restore();
  }
  
  drawArms(ctx, frame, colors) {
    // 撌西?
    this.drawLimb(ctx, frame.leftArm, colors, -1, -40);
    // ?唾?
    this.drawLimb(ctx, frame.rightArm, colors, 1, -40);
  }
  
  drawLegs(ctx, frame, colors, equipment) {
    // 撌西
    this.drawLimb(ctx, frame.leftLeg, colors, -1, 0, true);
    // ?唾
    this.drawLimb(ctx, frame.rightLeg, colors, 1, 0, true);
  }
  
  drawLimb(ctx, limb, colors, side, startY, isLeg = false) {
    ctx.save();
    ctx.translate(side * 5, startY);
    
    // 銝?/憭扯
    ctx.save();
    ctx.rotate(limb.upperRotation * Math.PI / 180);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const upperLength = isLeg ? this.skeleton.leftLeg.upper : this.skeleton.leftArm.upper;
    ctx.lineTo(0, upperLength);
    ctx.stroke();
    
    // 銝?/撠
    ctx.translate(0, upperLength);
    ctx.rotate(limb.lowerRotation * Math.PI / 180);
    ctx.strokeStyle = colors.secondary;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const lowerLength = isLeg ? this.skeleton.leftLeg.lower : this.skeleton.leftArm.lower;
    ctx.lineTo(0, lowerLength);
    ctx.stroke();
    
    // ????
    if (isLeg) {
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-3, lowerLength);
      ctx.lineTo(8, lowerLength);
      ctx.stroke();
    } else {
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(0, lowerLength, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
    ctx.restore();
  }
  
  // ?儭??脣?閫撠惇?脩戌?撟
  getDefendAnimation(characterId) {
    const defenseStyles = {
      // 憸典蔣敹?- ??憪踵?
      fujin: Array(12).fill().map((_, frame) => {
        const bob = Math.sin(frame * 0.3) * 2;
        return {
          head: { x: -3, y: -3 + bob, rotation: -15 },
          body: { rotation: -20 },
          leftArm: { upperRotation: -100, lowerRotation: -60 },
          rightArm: { upperRotation: 20, lowerRotation: 30 },
          leftLeg: { upperRotation: 15, lowerRotation: 20 },
          rightLeg: { upperRotation: -30, lowerRotation: 40 }
        };
      }),
      
      // ?怎敹?- ?豢除?潭?憪踵?
      katon: Array(12).fill().map((_, frame) => {
        const intensity = Math.sin(frame * 0.4) * 3;
        return {
          head: { x: 0, y: intensity, rotation: 0 },
          body: { rotation: 0 },
          leftArm: { upperRotation: -40, lowerRotation: -80 },
          rightArm: { upperRotation: 40, lowerRotation: 80 },
          leftLeg: { upperRotation: -10, lowerRotation: 15 },
          rightLeg: { upperRotation: 10, lowerRotation: 15 }
        };
      }),
      
      // 瘞游蔣敹?- 瘚偌?啁?憪踵?
      suijin: Array(12).fill().map((_, frame) => {
        const flow = Math.sin(frame * 0.5) * 15;
        const wave = Math.cos(frame * 0.5) * 10;
        return {
          head: { x: wave * 0.3, y: 0, rotation: flow * 0.5 },
          body: { rotation: flow * 0.8 },
          leftArm: { upperRotation: -60 + flow, lowerRotation: -40 + wave },
          rightArm: { upperRotation: 60 - flow, lowerRotation: 40 - wave },
          leftLeg: { upperRotation: 0, lowerRotation: 10 },
          rightLeg: { upperRotation: 0, lowerRotation: 10 }
        };
      }),
      
      // ?瑟?敹?- ?餃??澈憪踵?
      raijin: Array(12).fill().map((_, frame) => {
        const spark = Math.random() * 4 - 2;
        return {
          head: { x: spark, y: 5, rotation: spark * 2 },
          body: { rotation: -30 },
          leftArm: { upperRotation: -70 + spark, lowerRotation: -50 },
          rightArm: { upperRotation: 70 + spark, lowerRotation: 50 },
          leftLeg: { upperRotation: 40, lowerRotation: 50 },
          rightLeg: { upperRotation: -20, lowerRotation: 60 }
        };
      }),
      
      // 撗拍敹?- 撗拙?霅瑞憪踵?
      doton: Array(12).fill().map(() => ({
        head: { x: 0, y: 8, rotation: -25 },
        body: { rotation: -40 },
        leftArm: { upperRotation: -90, lowerRotation: -90 },
        rightArm: { upperRotation: -90, lowerRotation: -90 },
        leftLeg: { upperRotation: 50, lowerRotation: 70 },
        rightLeg: { upperRotation: 50, lowerRotation: 70 }
      })),
      
      // ?蔣敹?- ?蔣?憪踵?
      kage: Array(12).fill().map((_, frame) => {
        const dodge = Math.sin(frame * 0.6) * 20;
        return {
          head: { x: dodge * 0.4, y: -2, rotation: dodge },
          body: { rotation: dodge },
          leftArm: { upperRotation: -120 + dodge, lowerRotation: -80 },
          rightArm: { upperRotation: 40 + dodge, lowerRotation: 50 },
          leftLeg: { upperRotation: 30, lowerRotation: 40 },
          rightLeg: { upperRotation: -40, lowerRotation: 50 }
        };
      }),
      
      // ????- ?霅瑞憪踵?
      rei: Array(12).fill().map((_, frame) => {
        const glow = Math.sin(frame * 0.5) * 5;
        return {
          head: { x: 0, y: glow * 0.5, rotation: 0 },
          body: { rotation: 0 },
          leftArm: { upperRotation: -50, lowerRotation: -70 },
          rightArm: { upperRotation: 50, lowerRotation: 70 },
          leftLeg: { upperRotation: 0, lowerRotation: 5 },
          rightLeg: { upperRotation: 0, lowerRotation: 5 }
        };
      })
    };
    
    return defenseStyles[characterId] || this.animations.defend;
  }
  
  // ? ?怎敹?撘瑞?? - 雿輻?游?撉券盲
  createKatonEnhancedAnimations() {
    return {
      idle: this.createKatonIdleEnhanced(),
      attack: this.createKatonAttackEnhanced(),
      defend: this.createKatonDefendEnhanced(),
      fireRush: this.createKatonFireRushEnhanced(),
      fireBall: this.createKatonFireBallEnhanced()
    };
  }
  
  // ? ?怎敹?- 憓撥??璈???
  createKatonIdleEnhanced() {
    return Array(24).fill().map((_, frame) => {
      const breathe = Math.sin(frame * 0.15) * 3;
      const sway = Math.sin(frame * 0.1) * 2;
      return {
        head: { x: 0, y: breathe * 0.3, rotation: sway * 0.5 },
        neck: { rotation: -sway * 0.3 },
        torso: { rotation: 0 },
        waist: { rotation: sway * 0.5 },
        leftShoulder: { rotation: 0 },
        rightShoulder: { rotation: 0 },
        leftArm: { 
          upperRotation: -15 + breathe,
          lowerRotation: 10 + breathe * 0.5,
          handRotation: 5
        },
        rightArm: { 
          upperRotation: 15 - breathe,
          lowerRotation: -10 - breathe * 0.5,
          handRotation: -5
        },
        leftLeg: { 
          upperRotation: 0,
          lowerRotation: 5,
          footRotation: 0
        },
        rightLeg: { 
          upperRotation: 0,
          lowerRotation: 5,
          footRotation: 0
        }
      };
    });
  }
  
  // ? ?怎敹?- 憓撥??餃???
  createKatonAttackEnhanced() {
    return [
      // ?? (0-4撟)
      { head: {x:-2,y:0,rotation:-15}, neck: {rotation:10}, torso: {rotation:-20}, waist: {rotation:-15}, leftShoulder: {rotation:-10}, rightShoulder: {rotation:20}, leftArm: {upperRotation:-30,lowerRotation:20,handRotation:0}, rightArm: {upperRotation:-80,lowerRotation:-60,handRotation:-30}, leftLeg: {upperRotation:10,lowerRotation:15,footRotation:5}, rightLeg: {upperRotation:-5,lowerRotation:20,footRotation:10} },
      { head: {x:-3,y:-1,rotation:-20}, neck: {rotation:15}, torso: {rotation:-30}, waist: {rotation:-20}, leftShoulder: {rotation:-15}, rightShoulder: {rotation:30}, leftArm: {upperRotation:-40,lowerRotation:30,handRotation:0}, rightArm: {upperRotation:-100,lowerRotation:-80,handRotation:-45}, leftLeg: {upperRotation:15,lowerRotation:20,footRotation:8}, rightLeg: {upperRotation:-8,lowerRotation:25,footRotation:15} },
      { head: {x:-4,y:-2,rotation:-25}, neck: {rotation:20}, torso: {rotation:-40}, waist: {rotation:-25}, leftShoulder: {rotation:-20}, rightShoulder: {rotation:40}, leftArm: {upperRotation:-50,lowerRotation:40,handRotation:0}, rightArm: {upperRotation:-120,lowerRotation:-100,handRotation:-60}, leftLeg: {upperRotation:20,lowerRotation:25,footRotation:10}, rightLeg: {upperRotation:-10,lowerRotation:30,footRotation:20} },
      
      // ?箸? (5-9撟)
      { head: {x:6,y:1,rotation:30}, neck: {rotation:-25}, torso: {rotation:50}, waist: {rotation:35}, leftShoulder: {rotation:15}, rightShoulder: {rotation:-50}, leftArm: {upperRotation:-60,lowerRotation:50,handRotation:10}, rightArm: {upperRotation:80,lowerRotation:120,handRotation:60}, leftLeg: {upperRotation:-15,lowerRotation:10,footRotation:-10}, rightLeg: {upperRotation:25,lowerRotation:35,footRotation:-5} },
      { head: {x:8,y:2,rotation:40}, neck: {rotation:-35}, torso: {rotation:65}, waist: {rotation:45}, leftShoulder: {rotation:20}, rightShoulder: {rotation:-65}, leftArm: {upperRotation:-70,lowerRotation:60,handRotation:15}, rightArm: {upperRotation:100,lowerRotation:140,handRotation:80}, leftLeg: {upperRotation:-20,lowerRotation:5,footRotation:-15}, rightLeg: {upperRotation:30,lowerRotation:40,footRotation:-10} },
      { head: {x:10,y:3,rotation:45}, neck: {rotation:-40}, torso: {rotation:75}, waist: {rotation:50}, leftShoulder: {rotation:25}, rightShoulder: {rotation:-75}, leftArm: {upperRotation:-80,lowerRotation:70,handRotation:20}, rightArm: {upperRotation:110,lowerRotation:155,handRotation:90}, leftLeg: {upperRotation:-25,lowerRotation:0,footRotation:-20}, rightLeg: {upperRotation:35,lowerRotation:45,footRotation:-15} },
      
      // ?嗅? (10-13撟)
      { head: {x:6,y:1,rotation:25}, neck: {rotation:-20}, torso: {rotation:40}, waist: {rotation:25}, leftShoulder: {rotation:10}, rightShoulder: {rotation:-40}, leftArm: {upperRotation:-50,lowerRotation:40,handRotation:10}, rightArm: {upperRotation:60,lowerRotation:90,handRotation:40}, leftLeg: {upperRotation:-10,lowerRotation:10,footRotation:-8}, rightLeg: {upperRotation:20,lowerRotation:30,footRotation:-5} },
      { head: {x:2,y:0,rotation:10}, neck: {rotation:-10}, torso: {rotation:15}, waist: {rotation:10}, leftShoulder: {rotation:5}, rightShoulder: {rotation:-15}, leftArm: {upperRotation:-25,lowerRotation:20,handRotation:5}, rightArm: {upperRotation:30,lowerRotation:45,handRotation:15}, leftLeg: {upperRotation:-5,lowerRotation:8,footRotation:-3}, rightLeg: {upperRotation:10,lowerRotation:15,footRotation:0} },
      { head: {x:0,y:0,rotation:0}, neck: {rotation:0}, torso: {rotation:0}, waist: {rotation:0}, leftShoulder: {rotation:0}, rightShoulder: {rotation:0}, leftArm: {upperRotation:-15,lowerRotation:10,handRotation:5}, rightArm: {upperRotation:15,lowerRotation:-10,handRotation:-5}, leftLeg: {upperRotation:0,lowerRotation:5,footRotation:0}, rightLeg: {upperRotation:0,lowerRotation:5,footRotation:0} }
    ];
  }
  
  // ? ?怎敹?- 憓撥?蝳血???
  createKatonDefendEnhanced() {
    return Array(18).fill().map((_, frame) => {
      const pulse = Math.sin(frame * 0.4) * 4;
      return {
        head: { x: 0, y: pulse * 0.5, rotation: 0 },
        neck: { rotation: -5 },
        torso: { rotation: -10 },
        waist: { rotation: 5 },
        leftShoulder: { rotation: -20 },
        rightShoulder: { rotation: 20 },
        leftArm: { 
          upperRotation: -50 + pulse,
          lowerRotation: -85,
          handRotation: -45
        },
        rightArm: { 
          upperRotation: 50 - pulse,
          lowerRotation: 85,
          handRotation: 45
        },
        leftLeg: { 
          upperRotation: -12,
          lowerRotation: 18,
          footRotation: 8
        },
        rightLeg: { 
          upperRotation: 12,
          lowerRotation: 18,
          footRotation: 8
        }
      };
    });
  }
  
  // ? ?怎敹?- 憓撥??????
  createKatonFireRushEnhanced() {
    return [
      // 瘛梯僕?? (0-5撟)
      { head: {x:-3,y:8,rotation:-30}, neck: {rotation:15}, torso: {rotation:-50}, waist: {rotation:-30}, leftShoulder: {rotation:-25}, rightShoulder: {rotation:-25}, leftArm: {upperRotation:-140,lowerRotation:-100,handRotation:-60}, rightArm: {upperRotation:-140,lowerRotation:-100,handRotation:-60}, leftLeg: {upperRotation:70,lowerRotation:80,footRotation:30}, rightLeg: {upperRotation:70,lowerRotation:80,footRotation:30} },
      { head: {x:-5,y:12,rotation:-40}, neck: {rotation:20}, torso: {rotation:-65}, waist: {rotation:-40}, leftShoulder: {rotation:-30}, rightShoulder: {rotation:-30}, leftArm: {upperRotation:-160,lowerRotation:-125,handRotation:-75}, rightArm: {upperRotation:-160,lowerRotation:-125,handRotation:-75}, leftLeg: {upperRotation:90,lowerRotation:100,footRotation:40}, rightLeg: {upperRotation:90,lowerRotation:100,footRotation:40} },
      { head: {x:-7,y:15,rotation:-50}, neck: {rotation:25}, torso: {rotation:-80}, waist: {rotation:-50}, leftShoulder: {rotation:-35}, rightShoulder: {rotation:-35}, leftArm: {upperRotation:-180,lowerRotation:-145,handRotation:-90}, rightArm: {upperRotation:-180,lowerRotation:-145,handRotation:-90}, leftLeg: {upperRotation:105,lowerRotation:115,footRotation:50}, rightLeg: {upperRotation:105,lowerRotation:115,footRotation:50} },
      
      // ?銵 (6-12撟) - 璆萄漲?
      { head: {x:12,y:-8,rotation:85}, neck: {rotation:-15}, torso: {rotation:100}, waist: {rotation:25}, leftShoulder: {rotation:40}, rightShoulder: {rotation:40}, leftArm: {upperRotation:175,lowerRotation:160,handRotation:80}, rightArm: {upperRotation:175,lowerRotation:160,handRotation:80}, leftLeg: {upperRotation:-150,lowerRotation:145,footRotation:-30}, rightLeg: {upperRotation:95,lowerRotation:90,footRotation:20} },
      { head: {x:18,y:-12,rotation:100}, neck: {rotation:-25}, torso: {rotation:115}, waist: {rotation:35}, leftShoulder: {rotation:50}, rightShoulder: {rotation:50}, leftArm: {upperRotation:195,lowerRotation:175,handRotation:95}, rightArm: {upperRotation:195,lowerRotation:175,handRotation:95}, leftLeg: {upperRotation:-170,lowerRotation:165,footRotation:-40}, rightLeg: {upperRotation:110,lowerRotation:105,footRotation:30} },
      { head: {x:20,y:-14,rotation:110}, neck: {rotation:-30}, torso: {rotation:125}, waist: {rotation:40}, leftShoulder: {rotation:55}, rightShoulder: {rotation:55}, leftArm: {upperRotation:205,lowerRotation:185,handRotation:105}, rightArm: {upperRotation:205,lowerRotation:185,handRotation:105}, leftLeg: {upperRotation:-180,lowerRotation:175,footRotation:-45}, rightLeg: {upperRotation:120,lowerRotation:115,footRotation:35} },
      
      // 皜???(13-17撟)
      { head: {x:14,y:-6,rotation:70}, neck: {rotation:-20}, torso: {rotation:85}, waist: {rotation:30}, leftShoulder: {rotation:35}, rightShoulder: {rotation:35}, leftArm: {upperRotation:150,lowerRotation:135,handRotation:65}, rightArm: {upperRotation:150,lowerRotation:135,handRotation:65}, leftLeg: {upperRotation:-110,lowerRotation:110,footRotation:-20}, rightLeg: {upperRotation:75,lowerRotation:70,footRotation:15} },
      { head: {x:8,y:0,rotation:40}, neck: {rotation:-10}, torso: {rotation:50}, waist: {rotation:20}, leftShoulder: {rotation:20}, rightShoulder: {rotation:20}, leftArm: {upperRotation:90,lowerRotation:80,handRotation:40}, rightArm: {upperRotation:90,lowerRotation:80,handRotation:40}, leftLeg: {upperRotation:-60,lowerRotation:65,footRotation:-10}, rightLeg: {upperRotation:40,lowerRotation:45,footRotation:8} },
      { head: {x:0,y:0,rotation:0}, neck: {rotation:0}, torso: {rotation:0}, waist: {rotation:0}, leftShoulder: {rotation:0}, rightShoulder: {rotation:0}, leftArm: {upperRotation:-15,lowerRotation:10,handRotation:5}, rightArm: {upperRotation:15,lowerRotation:-10,handRotation:-5}, leftLeg: {upperRotation:0,lowerRotation:5,footRotation:0}, rightLeg: {upperRotation:0,lowerRotation:5,footRotation:0} }
    ];
  }
  
  // ? ?怎敹?- 憓撥???
  createKatonFireBallEnhanced() {
    return [
      // ???除 (0-6撟)
      { head: {x:0,y:-2,rotation:-10}, neck: {rotation:5}, torso: {rotation:-15}, waist: {rotation:-10}, leftShoulder: {rotation:-15}, rightShoulder: {rotation:15}, leftArm: {upperRotation:-70,lowerRotation:-80,handRotation:-50}, rightArm: {upperRotation:70,lowerRotation:80,handRotation:50}, leftLeg: {upperRotation:20,lowerRotation:30,footRotation:10}, rightLeg: {upperRotation:20,lowerRotation:30,footRotation:10} },
      { head: {x:0,y:-4,rotation:-15}, neck: {rotation:8}, torso: {rotation:-22}, waist: {rotation:-15}, leftShoulder: {rotation:-22}, rightShoulder: {rotation:22}, leftArm: {upperRotation:-85,lowerRotation:-95,handRotation:-65}, rightArm: {upperRotation:85,lowerRotation:95,handRotation:65}, leftLeg: {upperRotation:28,lowerRotation:40,footRotation:15}, rightLeg: {upperRotation:28,lowerRotation:40,footRotation:15} },
      { head: {x:0,y:-6,rotation:-20}, neck: {rotation:10}, torso: {rotation:-30}, waist: {rotation:-20}, leftShoulder: {rotation:-30}, rightShoulder: {rotation:30}, leftArm: {upperRotation:-100,lowerRotation:-110,handRotation:-80}, rightArm: {upperRotation:100,lowerRotation:110,handRotation:80}, leftLeg: {upperRotation:35,lowerRotation:50,footRotation:20}, rightLeg: {upperRotation:35,lowerRotation:50,footRotation:20} },
      
      // ?典?怎? (7-11撟)
      { head: {x:4,y:0,rotation:15}, neck: {rotation:-8}, torso: {rotation:25}, waist: {rotation:15}, leftShoulder: {rotation:10}, rightShoulder: {rotation:-10}, leftArm: {upperRotation:50,lowerRotation:90,handRotation:60}, rightArm: {upperRotation:-50,lowerRotation:-90,handRotation:-60}, leftLeg: {upperRotation:-10,lowerRotation:10,footRotation:-5}, rightLeg: {upperRotation:15,lowerRotation:20,footRotation:5} },
      { head: {x:8,y:2,rotation:25}, neck: {rotation:-15}, torso: {rotation:40}, waist: {rotation:25}, leftShoulder: {rotation:20}, rightShoulder: {rotation:-20}, leftArm: {upperRotation:75,lowerRotation:115,handRotation:80}, rightArm: {upperRotation:-75,lowerRotation:-115,handRotation:-80}, leftLeg: {upperRotation:-18,lowerRotation:5,footRotation:-10}, rightLeg: {upperRotation:25,lowerRotation:30,footRotation:10} },
      { head: {x:10,y:3,rotation:30}, neck: {rotation:-20}, torso: {rotation:50}, waist: {rotation:30}, leftShoulder: {rotation:25}, rightShoulder: {rotation:-25}, leftArm: {upperRotation:90,lowerRotation:130,handRotation:90}, rightArm: {upperRotation:-90,lowerRotation:-130,handRotation:-90}, leftLeg: {upperRotation:-22,lowerRotation:0,footRotation:-12}, rightLeg: {upperRotation:30,lowerRotation:35,footRotation:12} },
      
      // ?嗆??Ｗ儔 (12-17撟)
      { head: {x:6,y:1,rotation:18}, neck: {rotation:-12}, torso: {rotation:30}, waist: {rotation:18}, leftShoulder: {rotation:15}, rightShoulder: {rotation:-15}, leftArm: {upperRotation:55,lowerRotation:80,handRotation:55}, rightArm: {upperRotation:-55,lowerRotation:-80,handRotation:-55}, leftLeg: {upperRotation:-12,lowerRotation:8,footRotation:-6}, rightLeg: {upperRotation:18,lowerRotation:22,footRotation:6} },
      { head: {x:2,y:0,rotation:5}, neck: {rotation:-5}, torso: {rotation:10}, waist: {rotation:5}, leftShoulder: {rotation:5}, rightShoulder: {rotation:-5}, leftArm: {upperRotation:20,lowerRotation:30,handRotation:20}, rightArm: {upperRotation:-20,lowerRotation:-30,handRotation:-20}, leftLeg: {upperRotation:-5,lowerRotation:8,footRotation:-2}, rightLeg: {upperRotation:8,lowerRotation:10,footRotation:2} },
      { head: {x:0,y:0,rotation:0}, neck: {rotation:0}, torso: {rotation:0}, waist: {rotation:0}, leftShoulder: {rotation:0}, rightShoulder: {rotation:0}, leftArm: {upperRotation:-15,lowerRotation:10,handRotation:5}, rightArm: {upperRotation:15,lowerRotation:-10,handRotation:-5}, leftLeg: {upperRotation:0,lowerRotation:5,footRotation:0}, rightLeg: {upperRotation:0,lowerRotation:5,footRotation:0} }
    ];
  }
  
  // ? 蝜芾ˊ憓撥??啣???(雿輻?游?撉券盲)
  drawKatonEnhanced(ctx, x, y, frame, facing = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing, 1);
    
    const colors = this.schoolColors.katon;
    const skel = this.enhancedSkeleton;
    
    // 蝜芾ˊ??:????????頠撟????? ???賊 ????
    
    // 1. 蝜芾ˊ?
    this.drawEnhancedLeg(ctx, frame.leftLeg, colors, -skel.waist.length/2, skel.leftLeg);
    this.drawEnhancedLeg(ctx, frame.rightLeg, colors, skel.waist.length/2, skel.rightLeg);
    
    // 2. 蝜芾ˊ?圈
    ctx.save();
    ctx.rotate(frame.waist.rotation * Math.PI / 180);
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -skel.waist.length);
    ctx.stroke();
    
    // 3. 蝜芾ˊ頠撟?
    ctx.translate(0, -skel.waist.length);
    ctx.rotate(frame.torso.rotation * Math.PI / 180);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -skel.torso.length);
    ctx.stroke();
    
    // 4. 蝜芾ˊ?? (敺?雿蔭)
    const shoulderY = -skel.torso.length + 5;
    this.drawEnhancedArm(ctx, frame.leftArm, frame.leftShoulder, colors, -skel.leftShoulder.offset, shoulderY, skel.leftArm);
    this.drawEnhancedArm(ctx, frame.rightArm, frame.rightShoulder, colors, skel.rightShoulder.offset, shoulderY, skel.rightArm);
    
    // 5. 蝜芾ˊ?賊
    ctx.translate(0, -skel.torso.length);
    ctx.rotate(frame.neck.rotation * Math.PI / 180);
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -skel.neck.length);
    ctx.stroke();
    
    // 6. 蝜芾ˊ?剝
    ctx.translate(frame.head.x, -skel.neck.length + frame.head.y);
    ctx.rotate(frame.head.rotation * Math.PI / 180);
    
    // ?剝?耦
    ctx.fillStyle = colors.primary;
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, skel.head.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // ?潛? (?怎敹??曄?潛?)
    ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.arc(-5, -3, 3, 0, Math.PI * 2);
    ctx.arc(5, -3, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // ?剖葆
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(-skel.head.radius, -8, skel.head.radius * 2, 5);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('?', 0, -4);
    
    ctx.restore();
    ctx.restore();
  }
  
  // ? 蝜芾ˊ憓撥????
  drawEnhancedArm(ctx, arm, shoulder, colors, xOffset, yOffset, skelArm) {
    ctx.save();
    ctx.translate(xOffset, yOffset);
    ctx.rotate(shoulder.rotation * Math.PI / 180);
    
    // 銝?
    ctx.rotate(arm.upperRotation * Math.PI / 180);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, skelArm.upper);
    ctx.stroke();
    
    // ??
    ctx.translate(0, skelArm.upper);
    ctx.rotate(arm.lowerRotation * Math.PI / 180);
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, skelArm.lower);
    ctx.stroke();
    
    // ??
    ctx.translate(0, skelArm.lower);
    ctx.rotate(arm.handRotation * Math.PI / 180);
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.ellipse(0, skelArm.hand/2, 4, skelArm.hand, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // ? 蝜芾ˊ憓撥???
  drawEnhancedLeg(ctx, leg, colors, xOffset, skelLeg) {
    ctx.save();
    ctx.translate(xOffset, 0);
    
    // 憭扯
    ctx.rotate(leg.upperRotation * Math.PI / 180);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, skelLeg.upper);
    ctx.stroke();
    
    // 撠
    ctx.translate(0, skelLeg.upper);
    ctx.rotate(leg.lowerRotation * Math.PI / 180);
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, skelLeg.lower);
    ctx.stroke();
    
    // ?單?
    ctx.translate(0, skelLeg.lower);
    ctx.rotate(leg.footRotation * Math.PI / 180);
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.ellipse(skelLeg.foot/2, 0, skelLeg.foot, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  // Shamisen Lute weapon drawing
  drawShamisenLute(ctx, color, colors) {
    // Neck (long thin rod)
    ctx.strokeStyle = color || '#D2691E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.lineTo(0, -28);
    ctx.stroke();

    // Body (rounded rectangular shape at bottom)
    ctx.fillStyle = colors.primary || '#8B4513';
    ctx.beginPath();
    ctx.ellipse(0, 8, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.secondary || '#FFD700';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Strings (3 lines along the neck)
    ctx.strokeStyle = colors.accent || '#F5DEB3';
    ctx.lineWidth = 0.5;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 2, 5);
      ctx.lineTo(i * 1.5, -25);
      ctx.stroke();
    }

    // Tuning pegs at top
    ctx.fillStyle = colors.secondary || '#FFD700';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(i * 3, -28, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// 蝑?DOM??摰?敺??萄遣?典?撖虫?
let stickmanAnimator;
document.addEventListener('DOMContentLoaded', () => {
  stickmanAnimator = new StickmanAnimator();
});
