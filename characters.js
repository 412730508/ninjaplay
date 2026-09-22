// 技能代碼系統 - 每個技能都有唯一標識符
const SKILL_CODES = {
  // 風影忍者技能代碼
  WIND_DASH: 'WND_001',      // 疾風閃 💨
  WIND_SLASH: 'WND_002',     // 旋風斬 🌀
  
  // 火焰忍者技能代碼
  FIRE_RUSH: 'FIR_001',      // 爆炎衝刺 🔥
  FIRE_BALL: 'FIR_002',      // 火球術 💥

  // 鍛炎忍者技能代碼
  FORGE_FIRE_SPIN: 'FRG_001', // 烈火旋斬 🔥
  FLAME_GOD_BLADE: 'FRG_002', // 奧義・炎神巨刃 🗡️
  
  // 水影忍者技能代碼
  WATER_SHIELD: 'WAT_001',   // 水幕盾 🛡️
  WATER_DRAGON: 'WAT_002',   // 水龍彈 🐉
  
  // 雷擊忍者技能代碼
  THUNDER_STEP: 'THU_001',   // 閃電步 ⚡
  THUNDER_PUNCH: 'THU_002',  // 雷電拳 👊
  
  // 岩甲忍者技能代碼
  ROCK_GUARD: 'ROC_001',     // 岩壁護體 🗿
  EARTH_QUAKE: 'ROC_002',    // 地裂震 💥
  
  // 暗影忍者技能代碼
  SHADOW_STRIKE: 'SHA_001',  // 黑刃突襲 🗡️
  SHADOW_CLONE: 'SHA_002',   // 影分身 👥
  
  // 靈忍者技能代碼
  SPIRIT_BOMB: 'SPI_001',    // 靈爆符 💣
  SPIRIT_JUDGMENT: 'SPI_002', // 靈天審判 ✨

  // 毒沼忍者技能代碼
  VENOM_DART: 'PSN_001',     // 毒鏢 💉
  THORN_TRAP: 'PSN_002',     // 荊棘陷阱 🌿

  // 體術忍者技能代碼
  SAVAGE_SUPLEX: 'TAI_001',  // 野蠻指令投 💪
  ROYAL_EXECUTION: 'TAI_002', // 名門連環殺 💀

  // 精靈遊俠技能代碼
  ELF_TALISMAN: 'ELF_001',   // 精靈守護符 🔮
  STEALTH_DASH: 'ELF_002',   // 脫隱術 👻

  // 血契忍者技能代碼
  BLOOD_SHACKLES: 'BLD_001', // 鮮血枷鎖 🩸
  BLOOD_DEVOUR: 'BLD_002',   // 血咒吞噬 💀

  // 浪人劍客技能代碼
  FLASH_CUT: 'RNN_001',      // 瞬影斬 ⚔️
  IAI_FLASH: 'RNN_002',      // 居合·一閃 🌀

  // 御獸忍者技能代碼
  ABYSS_TENTACLE: 'BST_001', // 深淵觸手 🐙
  BEAST_LIBERATION: 'BST_002', // 巨獸解放 🪨
  BOULDER_TOSS: 'BST_003',   // 巨岩投擲 🪨
  BEAST_REVERT: 'BST_004',    // 解除御獸 🔄

  // 蠍子技能代碼
  REBEL_MINION: 'SCP_001',    // 叛軍 🦂
  CHAIN_OF_PAIN: 'SCP_002',   // 痛苦枷鎖 ⛓️

  // 裁決者技能代碼
  OBJECTION_PARRY: 'ADJ_001', // 異議駁回 🛡️
  FINAL_VERDICT: 'ADJ_002',   // 最終判決 ⚖️

  // 叛風之刃技能代碼
  EXILE_GALE_DASH: 'EXL_001',   // 絕風・裂空突 🌬️
  STORM_EXECUTION: 'EXL_002',   // 秘奧義・狂風百裂 💀

  // 千機傀儡師技能代碼
  PUPPET_DEPLOY: 'PUP_001',     // 傀儡・召喚/收回 🎭
  PHANTOM_SWAP: 'PUP_002',      // 秘奧義・幻影交錯 💨

  // 蒼雷之徒技能代碼
  DIVINE_SMITE: 'AZR_001',      // 雷遁・天罰 ⚡
  GRAND_THUNDER_SLASH: 'AZR_002', // 秘奧義・萬雷蒼穹斬 🌩️

  // 雅音忍・弦鳴技能代碼
  STACCATO_STRIKE: 'SHM_001',   // 撥弦・破音 🎼
  DEADLY_CANON: 'SHM_002'       // 秘曲・輪唱殺陣 🎵
};

const characters = {
  fujin: {
    id: 'fujin',
    name: '風影忍者',
    organization: '風忍流',
    maxHp: 100,
    hp: 100,
    attackDamage: 6,
    attackSpeed: 800,
    moveSpeed: 280,
    position: { x: 100, y: 300 },
    facing: 1,
    skills: {
      normal: {
        code: SKILL_CODES.WIND_DASH,
        name: '疾風閃',
        type: '閃避+位移',
        cooldown: 3000,
        damage: 3,
        invulnerable: 500,
        distance: 120
      },
      ultimate: {
        code: SKILL_CODES.WIND_SLASH,
        name: '旋風斬',
        type: '範圍近戰',
        cooldown: 12000,
        damage: 15,        // ✅ 確認傷害值
        range: 150,        // 🌪️ 增強：60px → 150px (2.5倍範圍)
        knockback: 300,    // 🔧 新增：明確擊飛距離
        recastWindow: 3000,
        recastDamage: 8,
        recastPullDuration: 300
      }
    }
  },
  
  katon: {
    id: 'katon',
    name: '火焰忍者',
    organization: '火忍宗',
    maxHp: 95,
    hp: 95,
    attackDamage: 7,
    attackSpeed: 700,
    moveSpeed: 260,
    position: { x: 600, y: 300 },
    facing: -1,
    // 🔥 新增：火焰忍者被動技能
    passive: {
      name: '烈焰印記',
      description: '爆炎衝刺命中目標時，在目標身上留下烈焰印記6秒。帶有印記的目標被任何攻擊命中時，會開始燃燒，每秒扣1血，持續3秒。',
      markDuration: 6000,    // 印記持續6秒
      burnDuration: 3000,    // 燃燒持續3秒
      burnDamage: 1,         // 每秒1點燃燒傷害
      burnInterval: 1000     // 每1秒觸發一次燃燒
    },
    skills: {
      normal: {
        code: SKILL_CODES.FIRE_RUSH,
        name: '爆炎衝刺',
        type: '位移+傷害',
        cooldown: 10000, // 修正：調整為未命中CD 10秒
        damage: 10,
        distance: 250, // 增加衝刺距離
        stun: 300,
        // 🔥 新增：爆炎衝刺會施加烈焰印記
        applyMark: true
      },
      ultimate: {
        code: SKILL_CODES.FIRE_BALL,
        name: '火球術',
        type: '遠程爆破',
        cooldown: 13000,
        damage: 18,
        knockback: 50,
        speed: 500,
        explosionRange: 40, // 新增：爆炸範圍
        explosionDamage: 5   // 新增：爆炸額外傷害
      }
    }
  },

  forgefire: {
    id: 'forgefire',
    name: '鍛炎忍者',
    organization: '火忍宗',
    maxHp: 105,
    hp: 105,
    attackDamage: 7,
    attackSpeed: 800,
    attackRange: 60,
    moveSpeed: 260,
    position: { x: 100, y: 300 },
    facing: 1,
    passive: {
      name: '火焰刀・三式',
      description: '火焰刀普攻每第三擊會釋出火焰劍氣：傷害提升至9，並多延伸80px。',
      attacksNeeded: 3,
      thirdStrikeDamage: 9,
      thirdStrikeRangeBonus: 80
    },
    skills: {
      normal: {
        code: SKILL_CODES.FORGE_FIRE_SPIN,
        name: '烈火旋斬',
        type: '範圍/擊退',
        cooldown: 7000,
        range: 130,
        damage: 11,
        knockback: 80,
        distance: 60
      },
      ultimate: {
        code: SKILL_CODES.FLAME_GOD_BLADE,
        name: '奧義・炎神巨刃',
        type: '蓄力/貫穿',
        cooldown: 18000,
        range: 400,
        damage: 22,
        knockback: 150,
        chargeTime: 700,
        trailDuration: 3000,
        trailDamage: 2,
        trailTickRate: 1000
      }
    }
  },

  suijin: {
    id: 'suijin',
    name: '水影忍者',
    organization: '水忍門',
    maxHp: 105,
    hp: 105,
    attackDamage: 5,
    attackSpeed: 900,
    moveSpeed: 250, // 240 → 250 (小幅提升)
    position: { x: 100, y: 300 },
    facing: 1,
    skills: {
      normal: {
        code: SKILL_CODES.WATER_SHIELD,
        name: '水幕盾',
        type: '防禦+吸收回復',
        cooldown: 8000,
        duration: 3000,
        damageReduction: 0.5, // 減傷50%
        speedBoost: 25, // 護盾期間移速加成
        healPercent: 0.8 // 結束後回復80%實際承受傷害
      },
      ultimate: {
        code: SKILL_CODES.WATER_DRAGON,
        name: '水龍彈',
        type: '遠程控制',
        cooldown: 12000,
        damage: 16, // 14 → 16 (提升傷害)
        slow: 0.3,
        slowDuration: 2000,
        speed: 500,
        knockback: 50, // 新增：擊退效果
        freezeDuration: 1000, // 新增：1秒冰凍效果
      }
    }
  },
  
  raijin: {
    id: 'raijin',
    name: '雷擊忍者',
    organization: '雷忍堂',
    maxHp: 100,
    hp: 100,
    attackDamage: 6,
    attackSpeed: 750,
    moveSpeed: 300, // 雷忍者最快
    position: { x: 600, y: 300 },
    facing: -1,
    skills: {
      normal: {
        code: SKILL_CODES.THUNDER_STEP,
        name: '閃電步',
        type: '位移',
        cooldown: 6000,
        invulnerable: 300
      },
      ultimate: {
        code: SKILL_CODES.THUNDER_PUNCH,
        name: '雷電拳',
        type: '連擊近戰',
        cooldown: 8000,
        damage: 9,
        hits: 2,
        stun: 1000, // 🆕 0.2秒 → 1秒暈眩
        slowPercent: 0.3, // 🆕 暈眩後緩速30%
        slowDuration: 1000 // 🆕 緩速持續1秒
      }
    }
  },
  
  doton: {
    id: 'doton',
    name: '岩甲忍者',
    organization: '土忍派',
    maxHp: 120,
    hp: 120,
    attackDamage: 5,
    attackSpeed: 950,
    moveSpeed: 240,
    position: { x: 100, y: 300 },
    facing: 1,
    // 🗿 新增：岩甲忍者被動技能
    passive: {
      name: '岩甲護體',
      description: '堅硬的岩石護甲，減少所有來源的傷害1點（最低減至1點），普通攻擊附帶0.3秒眩暈效果，第三下普攻附帶1秒眩暈。',
      damageReduction: 1,     // 減少1點傷害
      attackStun: 300,        // 普攻眩暈0.3秒
      attackStun3rd: 1000     // 第三下普攻眩暈1秒
    },
    skills: {
      normal: {
        code: SKILL_CODES.ROCK_GUARD,
        name: '岩壁護體',
        type: '格擋',
        cooldown: 9000,
        duration: 2000,
        blockNext: true,
        counterDamage: 5,
        healOnBlock: 4 // 格擋成功回復4HP
      },
      ultimate: {
        name: '地裂震',
        code: SKILL_CODES.EARTH_QUAKE,
        description: '震撼大地，內圈造成傷害，外圈造成沉默',
        cooldown: 15000,
        innerRange: 150,
        outerRange: 250,
        innerDamage: 15,
        innerStun: 1500,
        outerStun: 1000,
        silenceDuration: 2000,
        knockback: 50,
        castTime: 0
      }
    }
  },
  
  kage: {
    id: 'kage',
    name: '暗影忍者',
    organization: '影忍盟',
    maxHp: 90,
    hp: 90,
    attackDamage: 7,
    attackSpeed: 700,
    moveSpeed: 290, // 暗影忍者很快
    position: { x: 600, y: 300 },
    facing: -1,
    skills: {
      normal: {
        code: SKILL_CODES.SHADOW_STRIKE,
        name: '黑刃突襲',
        type: '影子+位移+回傳',
        cooldown: 10000,
        damage: 12,
        critChance: 0.3,
        critDamage: 6,
        dashDistance: 300,     // 第一段瞬移距離
        shadowDuration: 3000,  // 影子存活3秒
        shadowDmgRatio: 2 / 3  // 影子傷害為玩家的2/3
      },
      ultimate: {
        code: SKILL_CODES.SHADOW_CLONE,
        name: '影分身',
        type: '召喚分身',
        cooldown: 12000,
        cloneCount: 5, // 🆕 召喚5個分身
        duration: 3000,
        spawnDelay: 100,
        cloneDamage: 3
      }
    }
  },
  
  rei: {
    id: 'rei',
    name: '靈忍者',
    organization: '靈忍社',
    maxHp: 100,
    hp: 100,
    attackDamage: 5,
    attackSpeed: 850,
    moveSpeed: 260,
    position: { x: 100, y: 300 },
    facing: 1,
    skills: {
      normal: {
        code: SKILL_CODES.SPIRIT_BOMB,
        name: '靈爆符',
        type: '遠程爆破',
        cooldown: 8000,
        damage: 15, // 13 → 15 (提升傷害)
        knockback: 40,
        speed: 500,
        heal: 4 // 3 → 4 (提升自癒效果)
      },
      ultimate: {
        code: SKILL_CODES.SPIRIT_JUDGMENT,
        name: '靈天審判',
        type: '範圍審判',
        cooldown: 16000,
        castTime: 2000,        // 指示器持續時間（最大蓄力）
        minChargeTime: 800,   // 最短蓄力0.8秒才能發動
        maxChargeTime: 2000,   // 最長蓄力2.0秒自動發動
        baseDamage: 7,         // 最低蓄力傷害
        tickInterval: 200,     // 每0.2秒+1傷害
        range: 320,
        baseHeal: 10,
        healPercent: 0.45
      }
    }
  },

  dokusei: {
    id: 'dokusei',
    name: '毒沼忍者',
    organization: '陰溝科學家',
    maxHp: 100,
    hp: 100,
    attackDamage: 6,
    attackSpeed: 800,
    moveSpeed: 280,
    position: { x: 600, y: 300 },
    facing: -1,
    passive: {
      name: '無限痛苦',
      description: '技能傷害會施加毒素，每秒1點傷害持續5秒，最多疊加3層。第4層引爆遞送7點爆裂傷害，并獲得+30%移速3秒。',
      maxStacks: 3,
      detonateStack: 4,
      detonateDamage: 9,
      dotDamage: 1,
      dotDuration: 5000,
      dotInterval: 1000,
      speedBuff: 0.3,
      speedBuffDuration: 3000
    },
    skills: {
      normal: {
        code: SKILL_CODES.VENOM_DART,
        name: '毒鏢',
        type: '遠程攻擊',
        cooldown: 3000,
        damage: 4,
        speed: 500,
        trapCooldownReduction: 500
      },
      ultimate: {
        code: SKILL_CODES.THORN_TRAP,
        name: '荊棘陷阱',
        type: '陷阱/控制',
        cooldown: 17000,
        rootDuration: 2000,
        buffedDartDamage: 7
      }
    }
  },

  taijutsu: {
    id: 'taijutsu',
    name: '體術忍者',
    organization: '猛獸派',
    maxHp: 115,
    hp: 115,
    attackDamage: 9,
    attackSpeed: 1200,
    moveSpeed: 250,
    position: { x: 600, y: 300 },
    facing: -1,
    passive: {
      name: '不屈霸體',
      description: '使用技能後獲得1.5秒霸體狀態，減少20%傷害並免疫控制效果。',
      duration: 1500,
      damageReduction: 0.2
    },
    skills: {
      normal: {
        code: SKILL_CODES.SAVAGE_SUPLEX,
        name: '野蠻指令投',
        type: '突進/投擲',
        cooldown: 6000,
        dashDistance: 150,
        damage: 6,
        throwDistance: 100,
        wallSlamDamage: 5,
        wallSlamStun: 1000
      },
      ultimate: {
        code: SKILL_CODES.ROYAL_EXECUTION,
        name: '名門連環殺',
        type: '近戰處決',
        cooldown: 18000,
        range: 200,
        damage: 15,
        executeThreshold: 0.15
      }
    }
  },

  ranger: {
    id: 'ranger',
    name: '精靈遊俠',
    organization: '神木族',
    maxHp: 80,
    hp: 80,
    attackDamage: 3,
    attackSpeed: 400,
    moveSpeed: 280,
    isRanged: true,
    projectileSpeed: 500,
    ammoMax: 7,
    ammoReloadTime: 2000,
    ammoIdleRefill: 2100,
    ammoPerSkill: 3,
    position: { x: 100, y: 300 },
    facing: 1,
    passive: {
      name: '自然律動',
      description: '每第3次普攻獲得20%移速加成1.5秒。',
      attacksNeeded: 3,
      speedBonus: 0.2,
      speedDuration: 1500
    },
    skills: {
      normal: {
        code: SKILL_CODES.ELF_TALISMAN,
        name: '精靈守護符',
        type: '三色輪轉',
        cooldown: 12000,
        cycleInterval: 400,
        talismanColors: ['red', 'purple', 'blue'],
        red: {
          name: '恐懼火焰',
          zoneRadius: 30,
          zoneDuration: 5000,
          fearDistance: 100,
          damage: 7,
          damageDuration: 3000
        },
        purple: {
          name: '雷電守護',
          duration: 4000,
          reflectDamage: 3,
          reflectStun: 400,
          flatReduction: 2
        },
        blue: {
          name: '雪球附魔',
          duration: 4000,
          snowballCharges: 3,
          snowballDamage: 5
        }
      },
      ultimate: {
        code: SKILL_CODES.STEALTH_DASH,
        name: '脫隱術',
        type: '隱身突進',
        cooldown: 9000,
        dashDistance: 300,
        empoweredDamage: 8,
        slowPercent: 0.3,
        slowDuration: 2000,
        defenseLockDuration: 2000,
        buffDuration: 2000,
        boostedAttackSpeed: 250
      }
    }
  },
  warlock: {
    id: 'warlock',
    name: '血契忍者',
    organization: '咒術會',
    maxHp: 105,
    hp: 105,
    attackDamage: 3,
    attackSpeed: 900,
    moveSpeed: 240,
    isRanged: true,
    projectileSpeed: 800,
    position: { x: 100, y: 300 },
    facing: 1,
    passive: {
      name: '血之護盾',
      description: '溢出治療轉化為護盾，上限15。護盾存在時+5%移速。',
      shieldCap: 15,
      speedBonus: 0.05
    },
    skills: {
      normal: {
        code: SKILL_CODES.BLOOD_SHACKLES,
        name: '鮮血枷鎖',
        type: '投射&牽線',
        cooldown: 8000,
        hpCost: 10,
        burstDamage: 5,
        tetherDuration: 4000,
        drainPerSecond: 3,
        healPerSecond: 3,
        breakDistance: 250
      },
      ultimate: {
        code: SKILL_CODES.BLOOD_DEVOUR,
        name: '血咒吞噬',
        type: '強力吸取',
        cooldown: 24000,
        duration: 3000,
        damagePerTick: 15,
        healPerTick: 10,
        tickInterval: 1000,
        selfSlowPercent: 0.25
      }
    }
  },
  ronin: {
    id: 'ronin',
    name: '浪人劍客',
    organization: '劍心流',
    maxHp: 90,
    hp: 90,
    attackDamage: 4,
    attackSpeed: 600,
    moveSpeed: 320,
    isRanged: false,
    position: { x: 100, y: 300 },
    facing: 1,
    passive: {
      name: '拔刀術',
      description: '2秒未攻擊進入納刀狀態，下次普攻突進50px並額外造成3點傷害。',
      idleThreshold: 2000,
      dashDistance: 50,
      bonusDamage: 3
    },
    skills: {
      normal: {
        code: SKILL_CODES.FLASH_CUT,
        name: '瞬影斬',
        type: '貫穿突進',
        cooldown: 6000,
        damage: 10,
        dashDistance: 200,
        slowPercent: 0.5,
        slowDuration: 1000
      },
      ultimate: {
        code: SKILL_CODES.IAI_FLASH,
        name: '居合·一閃',
        type: '瞬殺居合',
        cooldown: 16000,
        channelTime: 500,
        damage: 20,
        invertDuration: 300,
        slashLineDuration: 600
      }
    }
  },
  beastmaster: {
    id: 'beastmaster',
    name: '御獸忍者',
    organization: '御獸流',
    maxHp: 100,
    hp: 100,
    attackDamage: 7,
    attackSpeed: 750,
    moveSpeed: 280,
    position: { x: 100, y: 300 },
    facing: 1,
    passive: {
      name: '御獸疊層',
      description: '初始0層。人型態技能命中可獲得疊層，巨獸型態每秒自動消耗1層。',
      initialStacks: 0,
      maxStacks: 99
    },
    skills: {
      normal: {
        code: SKILL_CODES.ABYSS_TENTACLE,
        name: '深淵觸手',
        type: '抓取/控制',
        cooldown: 3000,
        range: 300,
        damage: 2,
        pullDuration: 400,
        pullStun: 300,
        stackGain: 3,
        tagText: '觸手抓取300px 拉回並暈眩0.3秒 命中獲3疊層 冷卻3秒'
      },
      ultimate: {
        code: SKILL_CODES.BEAST_LIBERATION,
        name: '巨獸解放',
        type: '變身/定身',
        cooldown: 1000,
        minStacksToCast: 4,
        stacksCost: 2,
        rootDuration: 2000,
        golemShield: 30,
        golemScale: 1.25,
        golemAttackDamage: 9,
        golemAttackSpeed: 1000,
        golemMoveSpeed: 180,
        golemRangeBonus: 50,
        golemSkillCooldown: 3000,
        golemSkillCost: 1,
        golemSkillDelay: 700,
        golemSkillAoE: 120,
        golemSkillDamage: 13,
        stackDrainInterval: 5000,
        tagText: '需4層疊層 耗2層變身巨獸 定身敵人2秒'
      }
    }
  },
  scorpion: {
    id: 'scorpion',
    name: '蠍子',
    organization: '鞭蠍門',
    maxHp: 85,
    hp: 85,
    attackDamage: 3,
    attackSpeed: 800,
    moveSpeed: 290,
    attackRange: 240,
    position: { x: 600, y: 300 },
    facing: -1,
    passive: {
      name: '毒蠍連鞭',
      description: '每第3次普攻命中會觸發強力一擊：擊退敵人100px、施加30%緩速2秒、並在敵人腳下生成毒棘荊地，每秒造成2點傷害持續4秒。',
      hitsRequired: 3,
      knockbackDistance: 100,
      slowMultiplier: 0.7,
      slowDuration: 2000,
      hazardWidth: 80,
      hazardDuration: 4000,
      hazardDamagePerTick: 2,
      hazardTickRate: 1000
    },
    skills: {
      normal: {
        code: SKILL_CODES.REBEL_MINION,
        name: '叛軍',
        type: '召喚僕從',
        cooldown: 10000,
        minionHp: 1,
        minionSpeed: 290,
        minionAttackSpeed: 700,
        minionDamage: 2,
        minionCount: 3,
        minionLifespan: 15000,
        minionMeleeRange: 75
      },
      ultimate: {
        code: SKILL_CODES.CHAIN_OF_PAIN,
        name: '痛苦枷鎖',
        type: '控制+傷害',
        cooldown: 20000,
        range: 200,
        damage: 4,
        rootDuration: 3000,
        healReductionPercent: 0.5,
        healReductionDuration: 5000
      }
    }
  },

  // ─────────────────────────────────────────────
  adjudicator: {
    id: 'adjudicator',
    name: '裁決者',
    organization: '制裁廳',
    maxHp: 110,
    hp: 110,
    attackDamage: 12,
    attackSpeed: 1100,
    attackRange: 120,
    moveSpeed: 220,
    position: { x: 100, y: 300 },
    facing: 1,
    passive: {
      name: '肅靜',
      description: '當敵人在300px範圍內朝裁決者移動時，敵人移速降低15%。',
      range: 300,
      slowMultiplier: 0.85
    },
    skills: {
      normal: {
        code: SKILL_CODES.OBJECTION_PARRY,
        name: '異議駁回',
        type: '招架/反擊',
        cooldown: 10000,
        parryDuration: 2000,
        counterDamage: 18,
        counterKnockback: 150,
        counterSilenceDuration: 3000
      },
      ultimate: {
        code: SKILL_CODES.FINAL_VERDICT,
        name: '最終判決',
        type: '領域/控制',
        cooldown: 22000,
        domainRadius: 250,
        domainDuration: 6000,
        domainEntryDamage: 5,
        pullSpeed: 10,
        domainNormalKnockup: 400
      }
    }
  },

  // ─────────────────────────────────────────────
  exileblade: {
    id: 'exileblade',
    name: '叛風之刃',
    organization: '風忍流（叛逃者）',
    maxHp: 80,
    hp: 80,
    attackDamage: 6,
    attackSpeed: 400,
    attackRange: 50,
    moveSpeed: 340,
    position: { x: 100, y: 300 },
    facing: 1,
    // No passive - all power budget in Active and Ultimate
    skills: {
      normal: {
        code: SKILL_CODES.EXILE_GALE_DASH,
        name: '絕風・裂空突',
        type: '突進+暈眩',
        cooldown: 5000,
        damage: 5,
        dashDistance: 180,
        stunDuration: 500
      },
      ultimate: {
        code: SKILL_CODES.STORM_EXECUTION,
        name: '秘奧義・狂風百裂',
        type: '投射物+處決',
        cooldown: 18000,
        kunaiSpeed: 25,
        kunaiMaxRange: 400,
        kunaiDamage: 2,
        executionDuration: 2000,
        executionTicks: 5,
        tickDamage: 5,
        finalTickDamage: 10,
        finalKnockback: 150,
        teleportOffset: 20
      }
    }
  },

  // ─────────────────────────────────────────────
  puppeteer: {
    id: 'puppeteer',
    name: '千機傀儡師',
    organization: '傀儡座',
    maxHp: 75,
    hp: 75,
    attackDamage: 4,
    attackSpeed: 500,
    attackRange: 60,
    moveSpeed: 260,
    position: { x: 100, y: 300 },
    facing: 1,
    passive: {
      name: '絲線操控',
      description: '傀儡存在時，本體與傀儡同時發動普攻；傀儡每次命中會儲存2/3傷害，收回時一口氣釋放。傀儡不存在時普攻距離+30px。',
      puppetAttackDamage: 3,
      soloRangeBonus: 30
    },
    skills: {
      normal: {
        code: SKILL_CODES.PUPPET_DEPLOY,
        name: '傀儡・召喚/收回',
        type: '切換/召喚',
        cooldown: 4000,
        puppetHp: 30,
        // 顯示速度 24（引擎內速度單位為 240）。傀儡只會朝敵人推進。
        puppetSpeed: 240,
        puppetSpawnDistance: 150,
        puppetAdvanceLimit: 150
      },
      ultimate: {
        code: SKILL_CODES.PHANTOM_SWAP,
        name: '秘奧義・幻影交錯',
        type: '瞬移/範圍',
        cooldown: 14000,
        swapSmokeDuration: 2000,
        smokeRadius: 200,
        smokeDamagePerTick: 2,
        smokeTickInterval: 500,
        smokeSlow: 0.4,
        needleBurstDamage: 8,
        needleBurstRadius: 120,
        needleCount: 12
      }
    }
  },

  azure_disciple: {
    id: 'azure_disciple',
    name: '蒼雷之徒',
    organization: '禁雷殿',
    maxHp: 85,
    hp: 85,
    attackDamage: 5,
    attackSpeed: 400,
    attackRange: 50,
    moveSpeed: 340,
    position: { x: 100, y: 300 },
    facing: 1,
    passive: {
      name: '禁術・電壓釋放',
      description: '移動時緩慢累積電壓，普攻命中大幅充能。滿100電壓時下一次普攻自動鎖定200px內敵人，造成10傷害+0.8秒暈眩的雷擊。',
      voltagePerFrame: 0.15,
      voltagePerHit: 20,
      maxVoltage: 100,
      dischargeRange: 200,
      dischargeDamage: 10,
      dischargeStun: 800
    },
    skills: {
      normal: {
        code: SKILL_CODES.DIVINE_SMITE,
        name: '雷遁・天罰',
        type: '遠程/落雷',
        cooldown: 6000,
        warningDuration: 400,
        strikeDuration: 200,
        strikeWidth: 40,
        damage: 12
      },
      ultimate: {
        code: SKILL_CODES.GRAND_THUNDER_SLASH,
        name: '秘奧義・萬雷蒼穹斬',
        type: '全場/落雷',
        cooldown: 19000,
        duration: 3000,
        strikeCount: 5,
        strikeDamage: 10
      }
    }
  },

  shamisen: {
    id: 'shamisen',
    name: '雅音忍・弦鳴',
    organization: '音隱衆',
    maxHp: 80,
    hp: 80,
    attackDamage: 3,
    attackSpeed: 600,
    attackRange: 200,
    moveSpeed: 280,
    position: { x: 100, y: 300 },
    facing: 1,
    passive: {
      name: '完美絕對音律',
      description: '普攻節奏精準（480~520ms間隔）觸發完美音律，傷害翻倍為6、附帶10px擊退。每第4下普攻則固定造成5傷害，並使敵人緩速30%、持續1秒。',
      perfectWindow: [480, 520],
      perfectDamage: 6,
      perfectKnockback: 10,
      attacksNeeded: 4,
      fourthHitDamage: 5,
      fourthHitSlowMultiplier: 0.7,
      fourthHitSlowDuration: 1000
    },
    skills: {
      normal: {
        code: SKILL_CODES.STACCATO_STRIKE,
        name: '撥弦・破音',
        type: '瞬發/打斷',
        cooldown: 7000,
        damage: 10,
        range: 150,
        hitboxRadius: 40,
        stunDuration: 500
      },
      ultimate: {
        code: SKILL_CODES.DEADLY_CANON,
        name: '秘曲・輪唱殺陣',
        type: '引導/範圍',
        cooldown: 18000,
        channelingDuration: 3000,
        wave1: { maxRadius: 100, slowMultiplier: 0.7, damage: 5 },
        wave2: { maxRadius: 200, slowMultiplier: 0.4, damage: 10 },
        wave3: { maxRadius: 800, damage: 15, knockupVy: -15 }
      }
    }
  }
};

  // 獲取技能信息的輔助函數
function getSkillByCode(code) {
  for (const char of Object.values(characters)) {
    if (char.skills.normal.code === code) {
      return { character: char, skill: char.skills.normal, type: 'normal' };
    }
    if (char.skills.ultimate.code === code) {
      return { character: char, skill: char.skills.ultimate, type: 'ultimate' };
    }
  }
  return null;
}

// 導出供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { characters, SKILL_CODES, getSkillByCode };
}
