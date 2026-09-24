class ParticleSystem {
  constructor() {
    this.particles = [];
    this.explosions = [];
    this.screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
    
    // ? ?啣?嚗憓?摮頂蝯?
    this.environmentParticles = [];
    this.comboTrail = []; // ???頠楚
    this.impactRings = []; // 銵?瘜Ｙ
    this.currentMap = 'grassland'; // ?嗅??啣?
  }
  
  // ?萄遣??賜??
  createSkillEffect(skillCode, x, y, facing) {
    
    switch(skillCode) {
      case 'WND_001': // ? 靽格迤嚗憸券?
        this.createWindDashEffect(x, y, facing);
        break;
      case 'WND_002': // ? 靽格迤嚗?憸冽
        this.createWindSlashEffect(x, y);
        break;
      case 'FIR_001': // ??銵
        this.createFireRushEffect(x, y, facing);
        break;
      case 'FIR_002': // ?怎?銵?
        this.createFireBallEffect(x, y, facing);
        break;
      case 'FRG_001': // 鍛炎忍者・烈火旋斬
        this.createFireRushEffect(x, y, facing);
        break;
      case 'FRG_002': // 鍛炎忍者・炎神巨刃
        this.createFireBallEffect(x, y, facing);
        break;
      case 'WAT_001': // 瘞游???
        this.createWaterShieldEffect(x, y);
        break;
      case 'WAT_002': // 瘞湧?敶?
        this.createWaterDragonEffect(x, y, facing);
        break;
      case 'THU_001': // ?甇?
        this.createThunderStepEffect(x, y);
        break;
      case 'THU_002': // ?琿??
        this.createThunderPunchEffect(x, y);
        break;
      case 'ROC_001': // 撗拙?霅琿?
        this.createRockGuardEffect(x, y);
        break;
      case 'ROC_002': // ?啗???
        this.createGroundCrackEffect(x, y);
        break;
      case 'SHA_001': // 暺?蝒必
        this.createShadowStrikeEffect(x, y, facing);
        break;
      case 'SHA_002': // 敶勗?頨?
        this.createShadowCloneEffect(x, y);
        break;
      case 'SPI_001': // ??蝚?
        this.createSpiritBombEffect(x, y, facing);
        break;
      case 'SPI_002': // ?予撖拙
        this.createSpiritJudgmentEffect(x, y);
        break;
      case 'PSN_001': // 瘥
        this.createVenomDartEffect(x, y, facing);
        break;
      case 'PSN_002': // ???琿
        this.createThornTrapEffect(x, y);
        break;
      case 'TAI_001': // ??誘??
        this.createSuplexEffect(x, y, facing);
        break;
      case 'TAI_002': // ????畾?
        this.createRoyalExecutionEffect(x, y);
        break;
      case 'ELF_001': // 蝎暸?摰風蝚?
        this.createElfTalismanEffect(x, y);
        break;
      case 'ELF_002': // ?恍銵?
        this.createStealthDashEffect(x, y, facing);
        break;
      case 'BLD_001': // 擙株??琿?
        this.createBloodShacklesEffect(x, y, facing);
        break;
      case 'BLD_002': // 銵????
        this.createBloodDevourEffect(x, y);
        break;
      case 'RNN_001': // ?砍蔣??
        this.createFlashCutEffect(x, y, facing);
        break;
      case 'RNN_002': // 撅?繚銝??
        this.createIaiFlashEffect(x, y);
        break;
      case 'BST_001': // 御獸忍者・深淵觸手
        this.createShadowStrikeEffect(x, y, facing);
        break;
      case 'BST_002': // 御獸忍者・巨獸解放
        this.createRockGuardEffect(x, y);
        break;
      case 'BST_003': // 御獸忍者・巨岩投擲
        this.createGroundCrackEffect(x, y);
        break;
      case 'BST_004': // 御獸忍者・解除御獸
        this.createRockGuardEffect(x, y);
        break;
      case 'SCP_001': // 蠍子・叛軍
        this.createThornTrapEffect(x, y);
        break;
      case 'SCP_002': // 蠍子・痛苦枷鎖
        this.createVenomDartEffect(x, y, facing);
        break;
      case 'ADJ_001': // 裁決者・異議駁回
        this.createRockGuardEffect(x, y);
        break;
      case 'ADJ_002': // 裁決者・最終判決
        this.createGroundCrackEffect(x, y);
        break;
      case 'EXL_001': // 叛風之刃・裂空突
        this.createWindDashEffect(x, y, facing);
        break;
      case 'EXL_002': // 叛風之刃・狂風百裂
        this.createWindSlashEffect(x, y);
        break;
      case 'PUP_001': // 千機傀儡師・召喚/收回
        this.createShadowCloneEffect(x, y);
        break;
      case 'PUP_002': // 千機傀儡師・幻影交錯
        this.createShadowStrikeEffect(x, y, facing);
        break;
      case 'AZR_001': // 蒼雷之徒・天罰
        this.createThunderPunchEffect(x, y);
        break;
      case 'AZR_002': // 蒼雷之徒・萬雷蒼穹斬
        this.createThunderStepEffect(x, y);
        break;

      case 'SHM_001': // Staccato Strike
        this.createStaccatoStrikeEffect(x, y, facing);
        break;
      case 'SHM_002': // Deadly Canon
        this.createDeadlyCanonEffect(x, y);
        break;      default:
        console.warn('?芰??賭誨蝣?', skillCode);
    }
    
  }

  // ?儭?憸函頂?寞?
  createWindDashEffect(x, y, facing) {
    
    // 瘛∟??脤◢瘚???
    for (let layer = 0; layer < 3; layer++) {
      const radius = 40 + layer * 15;
      const particleCount = 12 + layer * 4;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i;
        this.particles.push({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
          vx: Math.cos(angle) * (50 + layer * 20),
          vy: Math.sin(angle) * (50 + layer * 20),
          size: 2 + Math.random() * 2,
          color: layer === 0 ? '#E0F7FF' : layer === 1 ? '#B3E5FC' : '#81D4FA',
          life: 800 - layer * 150,
          maxLife: 800,
          alpha: 0.7 - layer * 0.15,
          type: 'wind_aura'
        });
      }
    }
    
    // 憸函?頠楚
    for (let i = 0; i < 10; i++) {
      const offset = i * 12 * facing;
      this.particles.push({
        x: x - offset,
        y: y + Math.sin(i * 0.5) * 3,
        vx: -facing * 30,
        vy: 0,
        size: 15 - i,
        color: i % 2 === 0 ? '#B3E5FC' : '#81D4FA',
        life: 600 - i * 40,
        maxLife: 600,
        alpha: 0.4 - i * 0.03,
        type: 'wind_ground_trail'
      });
    }
    
    // 憸其?畾蔣
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: x - i * 10 * facing,
        y: y + (Math.random() - 0.5) * 50,
        vx: -facing * 80,
        vy: 0,
        size: 15 + Math.random() * 10,
        color: i < 4 ? '#FFFFFF' : i < 8 ? '#B3E5FC' : '#81D4FA',
        life: 500 - i * 35,
        maxLife: 500,
        alpha: 0.5 - i * 0.035,
        type: 'wind_afterimage',
        blur: 5 + i * 0.5
      });
    }
    
  }

  createWindSlashEffect(x, y) {
    
    // 擃?頧◢?湔敹?
    for (let spin = 0; spin < 8; spin++) {
      setTimeout(() => {
        for (let i = 0; i < 16; i++) {
          const angle = (Math.PI * 2 / 16) * i + spin * 0.4;
          this.particles.push({
            x: x + Math.cos(angle) * 30,
            y: y + Math.sin(angle) * 30,
            vx: Math.cos(angle) * 150,
            vy: Math.sin(angle) * 150,
            size: 3 + Math.random() * 2,
            color: '#FFFFFF',
            life: 400,
            maxLife: 400,
            alpha: 0.9,
            type: 'wind_spin_core'
          });
        }
      }, spin * 50);
    }
    
    // 憸典?銝駁?
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      for (let j = 0; j < 8; j++) {
        const distance = (j / 8) * 60;
        this.particles.push({
          x: x + Math.cos(angle) * distance,
          y: y + Math.sin(angle) * distance,
          vx: Math.cos(angle) * (120 + distance * 2),
          vy: Math.sin(angle) * (120 + distance * 2),
          size: 4 + Math.random() * 3,
          color: j % 2 === 0 ? '#4FC3F7' : '#00BCD4',
          life: 800,
          maxLife: 800,
          alpha: 1,
          rotation: angle,
          type: 'wind_blade'
        });
      }
    }
    
  }

  // ? ?怎頂?寞?
  createFireRushEffect(x, y, facing) {
    
    // ? ???祇?嚗??脰澈銝?韏瑞??
    for (let layer = 0; layer < 3; layer++) {
      const radius = 35 + layer * 12;
      const particleCount = 12 + layer * 4;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i;
        this.particles.push({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
          vx: Math.cos(angle) * (40 + layer * 15),
          vy: Math.sin(angle) * (40 + layer * 15) - 20,
          size: 3 + Math.random() * 3,
          color: layer === 0 ? '#FF4500' : layer === 1 ? '#FF6347' : '#FF8C00',
          life: 800 - layer * 100,
          maxLife: 800,
          alpha: 0.9 - layer * 0.2,
          type: 'fire_aura'
        });
      }
    }
    
    // ? ?喃???怎?券脩??
    for (let i = 0; i < 20; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * Math.PI * 0.6;
      const speed = 80 + Math.random() * 60;
      
      this.particles.push({
        x: x,
        y: y + 20,
        vx: Math.cos(angle) * speed * -facing,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: Math.random() > 0.5 ? '#FF4500' : '#FF8C00',
        life: 600,
        maxLife: 600,
        alpha: 1,
        type: 'fire_thrust'
      });
    }
    
    // ? 銵??銝剔??怎頠楚
    for (let i = 0; i < 15; i++) {
      const offset = i * 10 * facing;
      
      this.particles.push({
        x: x - offset,
        y: y + (Math.random() - 0.5) * 40,
        vx: -facing * 60,
        vy: (Math.random() - 0.5) * 40,
        size: 4 + Math.random() * 5,
        color: i % 2 === 0 ? '#FF4500' : '#FF6347',
        life: 1000 - i * 40,
        maxLife: 1000,
        alpha: 0.8 - i * 0.04,
        type: 'fire_trail'
      });
    }
    
    // ? ?圈?衣????
    for (let i = 0; i < 12; i++) {
      const offset = i * 12 * facing;
      
      // ?衣?蝎?
      this.particles.push({
        x: x - offset,
        y: y + 25,
        vx: 0,
        vy: 0,
        size: 8 + Math.random() * 6,
        color: '#2F1F1F',
        life: 1500,
        maxLife: 1500,
        alpha: 0.6,
        type: 'scorch_mark'
      });
      
      // ?急?憌蕩
      if (Math.random() > 0.5) {
        this.particles.push({
          x: x - offset,
          y: y + 20,
          vx: (Math.random() - 0.5) * 100,
          vy: -80 - Math.random() * 60,
          size: 1 + Math.random() * 2,
          color: '#FFAA00',
          life: 800,
          maxLife: 800,
          alpha: 1,
          type: 'fire_spark'
        });
      }
    }
    
    // ? ?怎畾蔣??
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: x - i * 15 * facing,
        y: y + (Math.random() - 0.5) * 50,
        vx: -facing * 100,
        vy: -20 - Math.random() * 30,
        size: 12 + Math.random() * 8,
        color: i < 4 ? '#FF4500' : i < 7 ? '#FF6347' : '#FF8C00',
        life: 600 - i * 40,
        maxLife: 600,
        alpha: 0.7 - i * 0.05,
        type: 'fire_afterimage'
      });
    }
    
    // ? 蝛箸除?剜??嚗瘚迎?
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x - i * 18 * facing,
        y: y - 10 + Math.random() * 20,
        vx: -facing * 40,
        vy: -10,
        size: 15 + Math.random() * 10,
        color: 'rgba(255, 100, 0, 0.2)',
        life: 500,
        maxLife: 500,
        alpha: 0.3,
        type: 'heat_wave'
      });
    }
    
  }

  createFireBallEffect(x, y, facing) {
    
    // 嚙?Phase 1: ?圈?怠??辣 ???喃??怎??
    for (let ring = 0; ring < 3; ring++) {
      setTimeout(() => {
        for (let i = 0; i < 20; i++) {
          const angle = (Math.PI * 2 / 20) * i;
          const r = 30 + ring * 18;
          this.particles.push({
            x: x + Math.cos(angle) * r,
            y: y + 25 + Math.sin(angle) * (r * 0.25),
            vx: Math.cos(angle) * 15,
            vy: -5 - Math.random() * 10,
            size: 2 + Math.random() * 3,
            color: ring === 0 ? '#FF4500' : ring === 1 ? '#FF6347' : '#FFAA00',
            life: 600,
            maxLife: 600,
            alpha: 0.8,
            type: 'fire_gather'
          });
        }
      }, ring * 80);
    }
    
    // ? Phase 2: ?箸?? ???怎?◢??敹??
    for (let wave = 0; wave < 10; wave++) {
      setTimeout(() => {
        for (let i = 0; i < 14; i++) {
          const angle = (Math.PI * 2 / 14) * i + wave * 0.5;
          const radius = 60 - wave * 5;
          this.particles.push({
            x: x + Math.cos(angle) * radius,
            y: y + Math.sin(angle) * radius,
            vx: -Math.cos(angle) * (100 + wave * 10),
            vy: -Math.sin(angle) * (100 + wave * 10),
            size: 2 + Math.random() * 3,
            color: wave > 6 ? '#FFFFFF' : wave > 3 ? '#FFFF00' : '#FF4500',
            life: 350,
            maxLife: 350,
            alpha: 0.95,
            type: 'fire_gather'
          });
        }
        // ?詨????撓霈之
        this.particles.push({
          x: x, y: y, vx: 0, vy: 0,
          size: 6 + wave * 3,
          color: wave > 6 ? '#FFFFFF' : '#FF8C00',
          life: 250, maxLife: 250, alpha: 0.9,
          type: 'fireball_core'
        });
      }, wave * 70);
    }
    
    // ? 蝛箸除?潛?剜
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 / 16) * i;
      const r = 35 + Math.random() * 25;
      this.particles.push({
        x: x + Math.cos(angle) * r,
        y: y + Math.sin(angle) * r,
        vx: Math.cos(angle) * 25,
        vy: Math.sin(angle) * 25 - 15,
        size: 10 + Math.random() * 8,
        color: 'rgba(255, 150, 0, 0.3)',
        life: 900,
        maxLife: 900,
        alpha: 0.45,
        type: 'air_distortion'
      });
    }
    
    // ? Phase 3: ???祇? ????銵?瘜?+ ?怨??游?
    setTimeout(() => {
      // ???怨嚗之??
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 80 + Math.random() * 120;
        this.particles.push({
          x: x, y: y,
          vx: Math.cos(angle) * speed * facing,
          vy: Math.sin(angle) * speed - 40,
          size: 2 + Math.random() * 4,
          color: i < 10 ? '#FFFFFF' : Math.random() > 0.5 ? '#FFAA00' : '#FF4500',
          life: 600, maxLife: 600, alpha: 1,
          type: 'launch_spark'
        });
      }
      // 憭惜?澆??
      for (let ring = 0; ring < 5; ring++) {
        setTimeout(() => {
          this.particles.push({
            x: x, y: y,
            radius: 5,
            maxRadius: 50 + ring * 20,
            color: ring < 2 ? '#FFFFFF' : '#FF6347',
            life: 450, maxLife: 450,
            alpha: 0.8 - ring * 0.13,
            type: 'launch_ring'
          });
        }, ring * 50);
      }
      // ?圈?怨?
      for (let i = 0; i < 12; i++) {
        this.particles.push({
          x: x + (Math.random() - 0.5) * 40,
          y: y + 25,
          vx: facing * (30 + Math.random() * 40),
          vy: -60 - Math.random() * 80,
          size: 3 + Math.random() * 3,
          color: '#FF8C00',
          life: 500, maxLife: 500, alpha: 0.9,
          type: 'fire_trail'
        });
      }
      this.createScreenShake(6, 200);
    }, 700);
    
  }

  // ? ?啣?嚗撱箇??銵??
  createFireballTrailEffect(x, y) {
    // ?怎撠曄嚗?撅歹?
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 18,
        y: y + (Math.random() - 0.5) * 18,
        vx: (Math.random() - 0.5) * 50,
        vy: (Math.random() - 0.5) * 50,
        size: 3 + Math.random() * 5,
        color: i < 2 ? '#FFFFFF' : i < 5 ? '#FFAA00' : '#FF4500',
        life: 450,
        maxLife: 450,
        alpha: 0.9,
        type: 'fireball_trail'
      });
    }
    // ?望答畾蔣
    this.particles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.5) * 15,
      size: 14 + Math.random() * 10,
      color: 'rgba(255, 100, 0, 0.25)',
      life: 350, maxLife: 350, alpha: 0.35,
      type: 'air_distortion'
    });
    // 撠??
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 80,
        vy: -30 - Math.random() * 50,
        size: 1 + Math.random() * 2,
        color: '#FFAA00',
        life: 500, maxLife: 500, alpha: 1,
        type: 'ember'
      });
    }
  }

  // ? ?啣?嚗撱箇???貊??
  createFireballExplosionEffect(x, y) {
    
    // ? Phase 1: ?賜銝剖???
    this.particles.push({
      x: x, y: y,
      radius: 5, maxRadius: 80,
      color: '#FFFFFF',
      life: 250, maxLife: 250, alpha: 1,
      type: 'explosion_flash'
    });
    this.particles.push({
      x: x, y: y,
      radius: 5, maxRadius: 50,
      color: '#FFFF00',
      life: 200, maxLife: 200, alpha: 0.9,
      type: 'launch_ring'
    });
    
    // ? Phase 2: 銝餌??貊?啣????憭憭惜嚗?
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 160;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        size: 4 + Math.random() * 7,
        color: i < 10 ? '#FFFFFF' : i < 25 ? '#FFAA00' : i < 35 ? '#FF6347' : '#FF4500',
        life: 900, maxLife: 900, alpha: 1,
        type: 'explosion_fire'
      });
    }
    
    // ? Phase 3: ?怎瞍拇蒂?堆?6撅斗?頧?
    for (let ring = 0; ring < 6; ring++) {
      setTimeout(() => {
        const ringAngle = ring * Math.PI * 0.35;
        for (let i = 0; i < 14; i++) {
          const angle = (Math.PI * 2 / 14) * i + ringAngle;
          const radius = 25 + ring * 12;
          this.particles.push({
            x: x + Math.cos(angle) * radius,
            y: y + Math.sin(angle) * radius,
            vx: Math.cos(angle) * 120,
            vy: Math.sin(angle) * 120 - 35,
            size: 3 + Math.random() * 4,
            color: ring % 3 === 0 ? '#FF4500' : ring % 3 === 1 ? '#FFAA00' : '#FFFF00',
            life: 650, maxLife: 650, alpha: 0.85,
            type: 'vortex_fire'
          });
        }
      }, ring * 70);
    }
    
    // ? 銵?瘜Ｗ???
    for (let ring = 0; ring < 4; ring++) {
      setTimeout(() => {
        this.particles.push({
          x: x, y: y,
          radius: 5, maxRadius: 80 + ring * 25,
          color: ring < 2 ? '#FF6347' : '#FF8C00',
          life: 500, maxLife: 500,
          alpha: 0.7 - ring * 0.14,
          type: 'launch_ring'
        });
      }, ring * 80);
    }
    
    // ? ?圈?阡???
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 / 24) * i;
      const distance = 12 + Math.random() * 35;
      this.particles.push({
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        vx: 0, vy: 0,
        size: 7 + Math.random() * 10,
        color: '#1A1A1A',
        life: 2500, maxLife: 2500, alpha: 0.75,
        type: 'scorch_ground'
      });
    }
    
    // ? 畾??急?嚗??????
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 60;
      this.particles.push({
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * 80,
        vy: -60 - Math.random() * 100,
        size: 1 + Math.random() * 2.5,
        color: i < 10 ? '#FFFFFF' : '#FFAA00',
        life: 1400, maxLife: 1400, alpha: 1,
        type: 'ember'
      });
    }
    
    // ? 瞈???嚗?撅歹?
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 25 + Math.random() * 50;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 70,
        size: 10 + Math.random() * 16,
        color: `rgba(50, 50, 50, ${0.6 - i * 0.025})`,
        life: 1800, maxLife: 1800, alpha: 0.55,
        type: 'smoke'
      });
    }
    
    // ? ?急瘝予
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        this.particles.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y,
          vx: (Math.random() - 0.5) * 20,
          vy: -180 - Math.random() * 120,
          size: 4 + Math.random() * 4,
          color: i < 4 ? '#FFFF00' : '#FF4500',
          life: 700, maxLife: 700, alpha: 0.9,
          type: 'fire_trail'
        });
      }, i * 30);
    }
    
    // ????嚗?撘瘀?
    this.createScreenShake(18, 500);
    
  }

  // ? ?啣?嚗撱箇???
  createStunEffect(x, y) {
    // ?拇????啁?
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const radius = 35;
      
      this.particles.push({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius - 40,
        baseX: x,
        baseY: y - 40,
        angle: angle,
        radius: radius,
        size: 3,
        color: '#FFEB3B',
        life: 1500,
        maxLife: 1500,
        alpha: 1,
        type: 'stun_star'
      });
    }
  }

  // ?? 瘞渡頂?寞?
  createWaterShieldEffect(x, y) {
    
    // ?? ???祇?嚗偌撟?韏?
    for (let layer = 0; layer < 4; layer++) {
      const radius = 40 + layer * 8;
      const particleCount = 16 + layer * 4;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i;
        this.particles.push({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
          baseX: x,
          baseY: y,
          angle: angle,
          radius: radius,
          size: 2 + Math.random() * 2,
          color: layer % 2 === 0 ? '#2196F3' : '#00BCD4',
          life: 3000,
          maxLife: 3000,
          alpha: 0.7 - layer * 0.1,
          rotationSpeed: 0.01 + layer * 0.005,
          type: 'water_shield_orbit'
        });
      }
    }
    
    // ?? 瘞湔郭?啁???
    for (let wave = 0; wave < 6; wave++) {
      setTimeout(() => {
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 / 12) * i;
          const radius = 35 + wave * 5;
          
          this.particles.push({
            x: x + Math.cos(angle) * radius,
            y: y + Math.sin(angle) * radius,
            vx: Math.cos(angle) * 30,
            vy: Math.sin(angle) * 30,
            size: 2 + Math.random() * 1,
            color: '#81D4FA',
            life: 600,
            maxLife: 600,
            alpha: 0.8,
            type: 'water_ripple'
          });
        }
      }, wave * 150);
    }
    
    // ?? ???脣???
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 20 + Math.random() * 30;
      
      this.particles.push({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        size: 3 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#4DD0E1' : '#26C6DA',
        life: 3000,
        maxLife: 3000,
        alpha: 0.6,
        type: 'water_glow'
      });
    }
    
    // ?? 瘞渡???
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 45 + Math.random() * 10;
      
      this.particles.push({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        baseX: x,
        baseY: y,
        angle: angle,
        radius: radius,
        size: 2,
        color: '#B3E5FC',
        life: 3000,
        maxLife: 3000,
        alpha: 0.9,
        rotationSpeed: 0.015,
        type: 'water_droplet'
        });
    }
    
  }

  // ?? ?啣?嚗撱箸偌撟◤?餅???瞍?憚?寞?
  createWaterShieldImpactEffect(x, y) {
    
    // 瞍?憚?湔
    for (let ring = 0; ring < 4; ring++) {
      setTimeout(() => {
        this.particles.push({
          x: x,
          y: y,
          radius: 5,
          maxRadius: 50 + ring * 10,
          color: '#00BCD4',
          life: 400,
          maxLife: 400,
          alpha: 0.8 - ring * 0.15,
          type: 'water_ripple_ring'
        });
      }, ring * 80);
    }
    
    // ????
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * 60,
        vy: Math.sin(angle) * 60,
        size: 2 + Math.random() * 2,
        color: '#E1F5FE',
        life: 400,
        maxLife: 400,
        alpha: 1,
        type: 'water_flash'
      });
    }
    
    // 瘞渡?憌蕩
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 60;
      
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        size: 1 + Math.random() * 2,
        color: '#4DD0E1',
        life: 600,
        maxLife: 600,
        alpha: 0.9,
        type: 'water_splash'
      });
    }
    
  }

  // ?? ?啣?嚗撱箸偌撟????偌??賣???
  createWaterShieldEndEffect(x, y) {
    
    // 瘞渡???
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 50;
      
      this.particles.push({
        x: x + Math.cos(angle) * 40,
        y: y + Math.sin(angle) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        size: 2 + Math.random() * 3,
        color: '#81D4FA',
        life: 1200,
        maxLife: 1200,
        alpha: 0.8,
        type: 'water_drop'
      });
    }
    
    // 瘞湧??
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 50;
      
      this.particles.push({
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * 20,
        vy: -20 - Math.random() * 30,
        size: 8 + Math.random() * 10,
        color: 'rgba(129, 212, 250, 0.3)',
        life: 1000,
        maxLife: 1000,
        alpha: 0.5,
        type: 'water_mist'
      });
    }
    
  }

  createWaterDragonEffect(x, y, facing) {
    const dropColors = ['#00BCD4', '#0288D1', '#4FC3F7'];
    const pillarColors = ['#0277BD', '#03A9F4', '#81D4FA'];
    const bodyColors = ['#0288D1', '#29B6F6', '#81D4FA'];
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // ????????????????????????????????????????????????????????
    // ?? Phase 1: ?圈瘞渡?瞍?憚 ??6 撅文?敹?? + ?唬?瘞渡?
    // ????????????????????????????????????????????????????????
    for (let ripple = 0; ripple < 6; ripple++) {
      setTimeout(() => {
        // 憭惜?湔??
        this.particles.push({
          x: x, y: y + 25,
          radius: 5, maxRadius: 35 + ripple * 22,
          color: ripple < 3 ? '#00BCD4' : '#29B6F6',
          life: 750, maxLife: 750,
          alpha: 0.65 - ripple * 0.07,
          type: 'water_explosion_ring'
        });
        // ?批惜敺桀??堆?頛?嚗????啣?摨佗?
        if (ripple % 2 === 0) {
          this.particles.push({
            x: x, y: y + 25,
            radius: 3, maxRadius: 22 + ripple * 14,
            color: '#E1F5FE',
            life: 500, maxLife: 500,
            alpha: 0.35,
            type: 'water_explosion_ring'
          });
        }
        // ?唬?瘞渡? ??18 憿撠????
        for (let i = 0; i < 18; i++) {
          const angle = (Math.PI * 2 / 18) * i + (ripple * 0.15);
          const burstR = 18 + ripple * 14;
          const speed = 20 + ripple * 4;
          this.particles.push({
            x: x + Math.cos(angle) * burstR,
            y: y + 22 + Math.sin(angle) * (burstR * 0.25),
            vx: Math.cos(angle) * speed,
            vy: -10 - Math.random() * 10,
            size: 1.8 + Math.random() * 2.2,
            color: pick(dropColors),
            life: 850, maxLife: 850,
            alpha: 0.8,
            type: 'water_drop'
          });
        }
      }, ripple * 90);
    }

    // ????????????????????????????????????????????????????????
    // ?? Phase 2: 瘞湔?湔鳩 ??撱園 450ms
    // ????????????????????????????????????????????????????????
    setTimeout(() => {
      // ?詨?瘞湔 ??45 憿???瘝?摮?
      for (let i = 0; i < 45; i++) {
        const scatter = Math.random() * Math.PI * 2;
        const coreR = Math.random() * 20;
        this.particles.push({
          x: x + Math.cos(scatter) * coreR,
          y: y + 20,
          vx: Math.cos(scatter) * 20 + (Math.random() - 0.5) * 12,
          vy: -120 - Math.random() * 100,
          size: 3 + Math.random() * 5,
          color: pick(pillarColors),
          life: 1000, maxLife: 1000,
          alpha: 0.88,
          type: 'water_pillar'
        });
      }
      // ?梢?敺桀?嚗?撠?鈭柴?脫敹?
      for (let i = 0; i < 10; i++) {
        this.particles.push({
          x: x + (Math.random() - 0.5) * 14,
          y: y + 18,
          vx: (Math.random() - 0.5) * 8,
          vy: -180 - Math.random() * 60,
          size: 2 + Math.random() * 2,
          color: '#E1F5FE',
          life: 800, maxLife: 800,
          alpha: 0.95,
          type: 'water_pillar'
        });
      }
      // 瘞渲憌蕩 ??20 憿???
      for (let i = 0; i < 20; i++) {
        this.particles.push({
          x: x + (Math.random() - 0.5) * 30,
          y: y + 20,
          vx: (Math.random() - 0.5) * 85,
          vy: -55 - Math.random() * 80,
          size: 2 + Math.random() * 3,
          color: '#B3E5FC',
          life: 900, maxLife: 900,
          alpha: 0.9,
          type: 'water_splash'
        });
      }
    }, 450);

    // ????????????????????????????????????????????????????????
    // ?? Phase 3: 瘞湧????? ??撱園 750ms
    // ????????????????????????????????????????????????????????
    setTimeout(() => {
      const headX = x + facing * 18;
      const headY = y - 42;
      const totalSegments = 30;
      const segSpacing = 5;
      const waveAmp = 16;

      // ?? 樴澈 S ??銵楝敺???
      for (let i = 0; i < totalSegments; i++) {
        const t = i / totalSegments;
        // S ?脩?嚗in(i*0.32) ??1.5 ???湔郭敶?????
        const bx = headX - facing * i * segSpacing;
        const by = headY + Math.sin(i * 0.32) * waveAmp;
        // ?梁??啁敦嚗??7.5px ??撠曄垢 1.5px
        const segR = 7.5 * (1 - t * 0.8);
        // ?剝撖?嚗偏?函???
        const density = i < 5 ? 5 : (i < 15 ? 3 : 2);
        for (let j = 0; j < density; j++) {
          const jitter = segR * 0.55;
          this.particles.push({
            x: bx + (Math.random() - 0.5) * jitter,
            y: by + (Math.random() - 0.5) * jitter,
            vx: facing * (10 - t * 4),
            vy: (Math.random() - 0.5) * 2,
            size: segR + (Math.random() - 0.5) * 1.2,
            color: t < 0.15 ? '#0277BD' : pick(bodyColors),
            life: 1100, maxLife: 1100,
            alpha: 0.9 - t * 0.3,
            wavePhase: i * 0.4,
            waveAmp: (1 - t) * 0.4,
            type: 'dragon_body'
          });
        }
        // ??鈭桃?嚗? 2 ??暺?憿?脩?摮?
        if (i % 2 === 0 && i < totalSegments - 3) {
          this.particles.push({
            x: bx, y: by - segR * 0.7,
            vx: facing * 10, vy: -0.8,
            size: segR * 0.4 + 0.5,
            color: '#E1F5FE',
            life: 900, maxLife: 900,
            alpha: 0.75,
            wavePhase: i * 0.4,
            waveAmp: (1 - t) * 0.3,
            type: 'dragon_body'
          });
        }
      }

      // ?? 樴嚗??寞岷???? ??
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const rx = 14 * (0.3 + 0.7 * Math.abs(Math.cos(angle)));
        const ry = 10 * (0.3 + 0.7 * Math.abs(Math.sin(angle)));
        const dist = Math.random();
        const isCore = dist < 0.35;
        this.particles.push({
          x: headX + Math.cos(angle) * rx * dist,
          y: headY + Math.sin(angle) * ry * dist,
          vx: facing * (11 + Math.random() * 5),
          vy: (Math.random() - 0.5) * 4,
          size: isCore ? (5.5 + Math.random() * 2.5) : (4 + Math.random() * 3),
          color: isCore ? '#E1F5FE' : '#0277BD',
          life: 1100, maxLife: 1100,
          alpha: isCore ? 0.95 : 0.9,
          type: 'dragon_head'
        });
      }

      // ?? 樴嚗椰?喳?銝憿暺?+ ??嚗???
      for (let side = -1; side <= 1; side += 2) {
        this.particles.push({
          x: headX + facing * 9, y: headY + side * 4.5,
          vx: facing * 11, vy: 0,
          size: 2.2, color: '#FFFFFF',
          life: 1100, maxLife: 1100, alpha: 1,
          type: 'dragon_eye'
        });
        this.particles.push({
          x: headX + facing * 9, y: headY + side * 4.5,
          vx: facing * 11, vy: 0,
          size: 5, color: '#B3E5FC',
          life: 1100, maxLife: 1100, alpha: 0.45,
          type: 'dragon_eye'
        });
      }

      // ?? 樴?嚗椰?喳? 5 憿?????嚗???
      for (let side = -1; side <= 1; side += 2) {
        for (let w = 0; w < 5; w++) {
          this.particles.push({
            x: headX + facing * (10 + w * 5),
            y: headY + side * (3 + w * 3.5),
            vx: facing * (15 + w * 3),
            vy: side * (6 + w * 4),
            size: 2.2 - w * 0.3,
            color: w < 2 ? '#4FC3F7' : '#B3E5FC',
            life: 700 - w * 80, maxLife: 700 - w * 80,
            alpha: 0.8 - w * 0.12,
            type: 'water_drop'
          });
        }
      }

      // ?? 樴澈敿剔?嚗窒頨恍??拙隡詨嚗???
      for (let i = 3; i < 20; i += 3) {
        const t = i / totalSegments;
        const bx = headX - facing * i * segSpacing;
        const by = headY + Math.sin(i * 0.32) * waveAmp;
        const finSize = 4 * (1 - t * 0.6);
        for (let side = -1; side <= 1; side += 2) {
          this.particles.push({
            x: bx + (Math.random() - 0.5) * 3,
            y: by + side * (8 * (1 - t * 0.5)),
            vx: facing * 2,
            vy: side * (8 + Math.random() * 6),
            size: finSize, color: '#4FC3F7',
            life: 650, maxLife: 650, alpha: 0.55,
            type: 'water_splash'
          });
        }
      }

      // ?? 樴偏?脫?箸? ??
      const tailX = headX - facing * totalSegments * segSpacing;
      const tailY = headY + Math.sin(totalSegments * 0.32) * waveAmp;
      for (let i = 0; i < 8; i++) {
        const angle = -facing * (0.5 + i * 0.35) + Math.PI;
        const dist = 3 + i * 2.5;
        this.particles.push({
          x: tailX + Math.cos(angle) * dist,
          y: tailY + Math.sin(angle) * dist,
          vx: Math.cos(angle) * 8, vy: Math.sin(angle) * 8,
          size: 2 - i * 0.15,
          color: i < 3 ? '#29B6F6' : '#B3E5FC',
          life: 600, maxLife: 600, alpha: 0.7 - i * 0.07,
          type: 'water_drop'
        });
      }

      // ?? ?啁?瘞?部嚗窒樴澈?冽????嚗???
      for (let i = 0; i < 15; i++) {
        const t = Math.random();
        const bx = headX - facing * t * totalSegments * segSpacing;
        const by = headY + Math.sin(t * totalSegments * 0.32) * waveAmp;
        this.particles.push({
          x: bx + (Math.random() - 0.5) * 25,
          y: by + (Math.random() - 0.5) * 25,
          vx: (Math.random() - 0.5) * 10,
          vy: -15 - Math.random() * 25,
          size: 1.5 + Math.random() * 2.5,
          color: '#B3E5FC',
          life: 850, maxLife: 850, alpha: 0.75,
          type: 'water_bubble'
        });
      }

      // ?? ??? ??
      this.particles.push({
        x: headX, y: headY,
        radius: 5, maxRadius: 55,
        color: '#29B6F6',
        life: 450, maxLife: 450, alpha: 0.6,
        type: 'water_explosion_ring'
      });
    }, 750);

  }

  // ?? ?啣?嚗撱箸偌樴?銵?頝∠??
  createWaterDragonTrailEffect(x, y) {
    // 瘞渡?嚗??脫撓撅歹?
    for (let i = 0; i < 7; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 22,
        y: y + (Math.random() - 0.5) * 22,
        vx: (Math.random() - 0.5) * 40,
        vy: (Math.random() - 0.5) * 40,
        size: 4 + Math.random() * 5,
        color: i < 2 ? '#E1F5FE' : i < 5 ? '#4FC3F7' : '#0288D1',
        life: 650, maxLife: 650, alpha: 0.75,
        type: 'water_trail'
      });
    }
    // 瘞?部銝?
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 28,
        y: y + (Math.random() - 0.5) * 28,
        vx: (Math.random() - 0.5) * 22,
        vy: -35 - Math.random() * 50,
        size: 2 + Math.random() * 3,
        color: '#B3E5FC',
        life: 900, maxLife: 900, alpha: 0.85,
        type: 'water_bubble'
      });
    }
    // 瘞湧
    this.particles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * 25,
      vy: (Math.random() - 0.5) * 25,
      size: 15 + Math.random() * 10,
      color: 'rgba(79, 195, 247, 0.35)',
      life: 500, maxLife: 500, alpha: 0.5,
      type: 'water_mist'
    });
    // 撠偌皛湧?瞈?
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 15,
        y: y + (Math.random() - 0.5) * 15,
        vx: (Math.random() - 0.5) * 60,
        vy: -20 - Math.random() * 40,
        size: 1 + Math.random() * 2,
        color: '#81D4FA',
        life: 600, maxLife: 600, alpha: 0.9,
        type: 'water_splash'
      });
    }
  }

  // ?? ?啣?嚗撱箸偌樴?鋆??
  createWaterDragonExplosionEffect(x, y) {
    
    // ? Phase 1: 樴?賢???
    this.particles.push({
      x: x, y: y,
      radius: 5, maxRadius: 70,
      color: '#E1F5FE',
      life: 250, maxLife: 250, alpha: 1,
      type: 'explosion_flash'
    });
    
    // ? Phase 2: 瘞湧???嚗偌瘚????憭折?憭嚗?
    for (let i = 0; i < 55; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 130;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        size: 3 + Math.random() * 6,
        color: i < 12 ? '#E1F5FE' : i < 30 ? '#4FC3F7' : i < 45 ? '#03A9F4' : '#0288D1',
        life: 1100, maxLife: 1100, alpha: 0.9,
        type: 'water_burst'
      });
    }
    
    // ? 銝剖??瘜ｇ?憭惜嚗?
    for (let ring = 0; ring < 5; ring++) {
      setTimeout(() => {
        this.particles.push({
          x: x, y: y,
          radius: 5, maxRadius: 60 + ring * 22,
          color: ring < 2 ? '#E1F5FE' : '#00BCD4',
          life: 550, maxLife: 550,
          alpha: 0.75 - ring * 0.12,
          type: 'water_explosion_ring'
        });
      }, ring * 80);
    }
    
    // ? 瘞渲憌蕩嚗??嚗?
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 70;
      this.particles.push({
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * 100,
        vy: -70 - Math.random() * 130,
        size: 2 + Math.random() * 3,
        color: '#81D4FA',
        life: 1300, maxLife: 1300, alpha: 1,
        type: 'water_splash_large'
      });
    }
    
    // ? 樴耦瘞湧畾蔣
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 22 + Math.random() * 45;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 55,
        size: 12 + Math.random() * 18,
        color: `rgba(129, 212, 250, ${0.5 - i * 0.015})`,
        life: 1600, maxLife: 1600, alpha: 0.6,
        type: 'water_fog'
      });
    }
    
    // ? 瘞?部銝?
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 80,
        y: y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 20,
        vy: -40 - Math.random() * 60,
        size: 2 + Math.random() * 4,
        color: '#B3E5FC',
        life: 1000, maxLife: 1000, alpha: 0.8,
        type: 'water_bubble'
      });
    }
    
    // ? ?圈瞈??
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 / 16) * i;
      const dist = 20 + Math.random() * 40;
      this.particles.push({
        x: x + Math.cos(angle) * dist,
        y: y + 20 + Math.sin(angle) * (dist * 0.2),
        vx: 0, vy: 0,
        size: 8 + Math.random() * 10,
        color: 'rgba(3, 169, 244, 0.3)',
        life: 2500, maxLife: 2500, alpha: 0.4,
        type: 'water_glow'
      });
    }
    
    // ????嚗?撘瘀?
    this.createScreenShake(14, 450);
    
  }

  // ?? ?啣?嚗撱箸偌瘚?鋆寡?蝺拚泵????
  createWaterSlowEffect(x, y) {
    
    // ? 瘞湔??ㄨ頨恍?
    for (let layer = 0; layer < 3; layer++) {
      const radius = 30 + layer * 10;
      const particleCount = 12 + layer * 4;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i;
        this.particles.push({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
          baseX: x,
          baseY: y,
          angle: angle,
          radius: radius,
          size: 2 + Math.random() * 2,
          color: layer === 0 ? '#4DD0E1' : layer === 1 ? '#26C6DA' : '#00ACC1',
          life: 2000,
          maxLife: 2000,
          alpha: 0.6 - layer * 0.15,
          rotationSpeed: -0.02,
          type: 'water_wrap'
        });
      }
    }
    
    // ? 瘞渡?蝚行?嚗銝?
    for (let rune = 0; rune < 6; rune++) {
      const angle = (Math.PI * 2 / 6) * rune;
      const radius = 35;
      
      setTimeout(() => {
        // 蝚行?蝺?
        for (let i = 0; i < 8; i++) {
          const lineAngle = angle + (i / 8) * (Math.PI / 3);
          const startRadius = 15;
          const endRadius = 45;
          
          this.particles.push({
            x: x + Math.cos(lineAngle) * startRadius,
            y: y + 25 + Math.sin(lineAngle) * (startRadius * 0.3),
            endX: x + Math.cos(lineAngle) * endRadius,
            endY: y + 25 + Math.sin(lineAngle) * (endRadius * 0.3),
            color: '#0288D1',
            life: 2000,
            maxLife: 2000,
            width: 2,
            alpha: 0.7,
            type: 'water_rune_line'
          });
        }
        
        // 蝚行?暺?
        this.particles.push({
          x: x + Math.cos(angle) * radius,
          y: y + 25 + Math.sin(angle) * (radius * 0.3),
          size: 4,
          color: '#00BCD4',
          life: 2000,
          maxLife: 2000,
          alpha: 0.9,
          type: 'water_rune_dot'
        });
      }, rune * 100);
    }
    
    // ? 瘞渡???皛渲
    const dropInterval = setInterval(() => {
      if (this.particles.some(p => p.type === 'water_wrap' && p.life > 0)) {
        for (let i = 0; i < 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 20 + Math.random() * 20;
          
          this.particles.push({
            x: x + Math.cos(angle) * radius,
            y: y + Math.sin(angle) * radius,
            vx: 0,
            vy: 40 + Math.random() * 30,
            size: 2 + Math.random() * 2,
            color: '#81D4FA',
            life: 800,
            maxLife: 800,
            alpha: 0.8,
            type: 'water_drip'
          });
        }
      } else {
        clearInterval(dropInterval);
      }
    }, 300);
    
  }

  // ???瑞頂?寞?
  createThunderStepEffect(x, y) {
    
    // ?????祇?嚗銝蝝???
    for (let ring = 0; ring < 5; ring++) {
      setTimeout(() => {
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 / 12) * i + ring * 0.2;
          const radius = 15 + ring * 12;
          
          this.particles.push({
            x: x + Math.cos(angle) * radius,
            y: y + 25 + Math.sin(angle) * (radius * 0.3),
            vx: Math.cos(angle) * 40,
            vy: 0,
            size: 2 + Math.random() * 2,
            color: '#FFEB3B',
            life: 600,
            maxLife: 600,
            alpha: 0.9 - ring * 0.15,
            type: 'thunder_ground_rune'
          });
        }
      }, ring * 60);
    }
    
    // ??頨思??餃??
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 100;
      
      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        size: 1 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#FFEB3B' : '#FFF176',
        life: 500,
        maxLife: 500,
        alpha: 1,
        type: 'thunder_spark'
      });
    }
    
    // ????? - ????
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 20 + Math.random() * 40;
      
      this.particles.push({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 60,
        vy: (Math.random() - 0.5) * 60,
        size: 2 + Math.random() * 2,
        color: '#E1F5FE',
        life: 400,
        maxLife: 400,
        alpha: 0.8,
        type: 'static_spark'
      });
    }
    
    // ???琿??湔
    for (let ring = 0; ring < 3; ring++) {
      setTimeout(() => {
        this.particles.push({
          x: x,
          y: y,
          radius: 5,
          maxRadius: 60 + ring * 20,
          color: '#FFEB3B',
          life: 400,
          maxLife: 400,
          alpha: 0.7 - ring * 0.2,
          type: 'thunder_ring'
        });
      }, ring * 80);
    }
    
    // ????
    this.createScreenShake(12, 300);
    
  }

  // ???啣?嚗撱粹??餉?頝⊥???
  createThunderTrailEffect(x, y) {
    // ?瑕?頠楚
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 25,
        y: y + (Math.random() - 0.5) * 35,
        vx: (Math.random() - 0.5) * 40,
        vy: (Math.random() - 0.5) * 40,
        size: 2 + Math.random() * 3,
        color: '#FFEB3B',
        life: 300,
        maxLife: 300,
        alpha: 0.9,
        type: 'thunder_trail'
      });
    }
    
    // ?餅???
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 30,
        size: 1 + Math.random() * 2,
        color: '#FFF176',
        life: 200,
        maxLife: 200,
        alpha: 1,
        type: 'thunder_flicker'
      });
    }
  }

  // ???啣?嚗撱粹??暹?敶望???
  createThunderAfterimagEffect(startX, startY, endX, endY) {
    
    // 閮?頝臬?
    const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const steps = Math.floor(distance / 20);
    
    for (let i = 0; i < steps; i++) {
      const progress = i / steps;
      const x = startX + (endX - startX) * progress;
      const y = startY + (endY - startY) * progress;
      
      setTimeout(() => {
        // 畾蔣??
        for (let j = 0; j < 5; j++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * 15;
          
          this.particles.push({
            x: x + Math.cos(angle) * radius,
            y: y + Math.sin(angle) * radius,
            vx: Math.cos(angle) * 30,
            vy: Math.sin(angle) * 30,
            size: 2 + Math.random() * 2,
            color: i < steps * 0.3 ? '#FFEB3B' : i < steps * 0.7 ? '#FFF176' : '#E1F5FE',
            life: 400,
            maxLife: 400,
            alpha: 0.7,
            type: 'thunder_afterimage'
          });
        }
        
        // ?餅???
        if (i % 2 === 0) {
          this.particles.push({
            x: x,
            y: y,
            size: 3,
            color: '#FFEB3B',
            life: 300,
            maxLife: 300,
            alpha: 0.9,
            type: 'thunder_chain'
          });
        }
      }, i * 20);
    }
    
  }

  // ???啣?嚗撱箏?ａ????
  createThunderGroundMarkEffect(x, y) {
    
    // ?圈?瑞?
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const length = 25 + Math.random() * 15;
      
      this.particles.push({
        x: x,
        y: y + 25,
        endX: x + Math.cos(angle) * length,
        endY: y + 25 + Math.sin(angle) * (length * 0.3),
        color: '#FFEB3B',
        life: 1500,
        maxLife: 1500,
        width: 2,
        alpha: 0.6,
        type: 'thunder_ground_mark'
      });
    }
    
    // 銝剖???
    this.particles.push({
      x: x,
      y: y + 25,
      radius: 3,
      maxRadius: 20,
      color: '#FFF176',
      life: 300,
      maxLife: 300,
      alpha: 0.8,
      type: 'thunder_center_glow'
    });
    
  }

  createThunderPunchEffect(x, y) {
    
    // ??Phase 1: ?刻澈? ???餃憫?啁?頨恍?
    for (let hand = 0; hand < 2; hand++) {
      const handX = x + (hand === 0 ? -15 : 15);
      
      // 憭惜?餃憫?啁?
      for (let layer = 0; layer < 4; layer++) {
        const radius = 10 + layer * 5;
        const particleCount = 10 + layer * 3;
        for (let i = 0; i < particleCount; i++) {
          const angle = (Math.PI * 2 / particleCount) * i;
          this.particles.push({
            x: handX + Math.cos(angle) * radius,
            y: y + Math.sin(angle) * radius,
            baseX: handX, baseY: y,
            angle: angle, radius: radius,
            size: 1.5 + Math.random() * 2.5,
            color: layer === 0 ? '#FFFFFF' : layer === 1 ? '#FFEB3B' : layer === 2 ? '#FFF176' : '#E1F5FE',
            life: 900, maxLife: 900,
            alpha: 0.95 - layer * 0.15,
            rotationSpeed: 0.1 * (hand === 0 ? 1 : -1) * (1 + layer * 0.3),
            type: 'thunder_fist_orbit'
          });
        }
      }
      
      // ?餅???嚗撖?嚗?
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 25;
        this.particles.push({
          x: handX + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
          vx: Math.cos(angle) * 30,
          vy: Math.sin(angle) * 30,
          size: 1 + Math.random() * 2.5,
          color: '#FFFF88',
          life: 700, maxLife: 700, alpha: 1,
          type: 'thunder_spark_fist'
        });
      }
    }
    
    // ??Phase 2: 蝛箸除銝剝?Ｗ??+ ?圈?餃憫
    for (let i = 0; i < 22; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 35 + Math.random() * 50;
      this.particles.push({
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * 60,
        vy: (Math.random() - 0.5) * 60,
        size: 1 + Math.random() * 2.5,
        color: i < 8 ? '#FFFFFF' : '#E1F5FE',
        life: 600, maxLife: 600, alpha: 0.85,
        type: 'air_static'
      });
    }
    // ?圈?餃憫蝺?
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const length = 50 + Math.random() * 35;
      setTimeout(() => {
        this.particles.push({
          x: x, y: y + 25,
          endX: x + Math.cos(angle) * length,
          endY: y + 25 + Math.sin(angle) * (length * 0.25),
          color: '#FFEB3B',
          life: 450, maxLife: 450, width: 2, alpha: 0.8,
          type: 'thunder_lightning_bolt'
        });
      }, i * 40);
    }
    
    // ??Phase 3: ?????
    for (let ring = 0; ring < 5; ring++) {
      setTimeout(() => {
        this.particles.push({
          x: x, y: y,
          radius: 5,
          maxRadius: 45 + ring * 18,
          color: ring < 2 ? '#FFFFFF' : '#FFEB3B',
          life: 450, maxLife: 450,
          alpha: 0.65 - ring * 0.1,
          type: 'thunder_punch_ring'
        });
      }, ring * 90);
    }
    
  }

  // ???啣?嚗撱箸?唾??郭??
  createThunderPunchImpactEffect(x, y, punchNumber) {
    
    // ? Phase 1: ?賜??銝剖?
    this.particles.push({
      x: x, y: y,
      radius: 5, maxRadius: 60,
      color: '#FFFFFF',
      life: 200, maxLife: 200, alpha: 1,
      type: 'explosion_flash'
    });
    
    // ? Phase 2: ?瑕???嚗之??+ ?質嚗?
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 100;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 35,
        size: 2 + Math.random() * 3.5,
        color: i < 8 ? '#FFFFFF' : i < 18 ? '#FFEB3B' : '#FFF176',
        life: 550, maxLife: 550, alpha: 1,
        type: 'thunder_impact_flash'
      });
    }
    
    // ? Phase 3: 憭惜銵?瘜Ｙ
    for (let ring = 0; ring < 4; ring++) {
      setTimeout(() => {
        this.particles.push({
          x: x, y: y,
          radius: 5,
          maxRadius: 65 + ring * 25,
          color: ring === 0 ? '#FFFFFF' : ring === 1 ? '#FFFF00' : '#FFEB3B',
          life: 400, maxLife: 400,
          alpha: 0.85 - ring * 0.18,
          type: 'thunder_shockwave'
        });
      }, ring * 60);
    }
    
    // ? ?曉???嚗撘抒?嚗?
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 / 16) * i;
      const length = 50 + Math.random() * 40;
      this.particles.push({
        x: x, y: y,
        endX: x + Math.cos(angle) * length,
        endY: y + Math.sin(angle) * length,
        color: i % 3 === 0 ? '#FFFFFF' : '#FFEB3B',
        life: 450, maxLife: 450, width: 2.5, alpha: 0.9,
        type: 'thunder_lightning_bolt'
      });
      // ??
      if (i % 2 === 0) {
        const branchAngle = angle + (Math.random() - 0.5) * 0.6;
        const branchLen = length * 0.6;
        const midX = x + Math.cos(angle) * length * 0.6;
        const midY = y + Math.sin(angle) * length * 0.6;
        this.particles.push({
          x: midX, y: midY,
          endX: midX + Math.cos(branchAngle) * branchLen,
          endY: midY + Math.sin(branchAngle) * branchLen,
          color: '#FFF176',
          life: 380, maxLife: 380, width: 1.5, alpha: 0.7,
          type: 'thunder_lightning_bolt'
        });
      }
    }
    
    // ? ?圈?餃憫畾?
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i + Math.random() * 0.3;
      const len = 30 + Math.random() * 25;
      setTimeout(() => {
        this.particles.push({
          x: x, y: y + 25,
          endX: x + Math.cos(angle) * len,
          endY: y + 25 + Math.sin(angle) * (len * 0.2),
          color: '#FFEB3B',
          life: 800, maxLife: 800, width: 1.5, alpha: 0.6,
          type: 'thunder_ground_rune'
        });
      }, 100 + i * 50);
    }
    
    // ? ??蝚西?
    this.particles.push({
      x: x, y: y - 55,
      text: '??', size: 35,
      color: '#FFEB3B',
      life: 700, maxLife: 700, alpha: 1,
      vx: 0, vy: -35,
      type: 'thunder_symbol'
    });
    
    // ????嚗?單??嚗?
    this.createScreenShake(punchNumber * 7, 300);
    
  }

  // ???啣?嚗撱箇?瘚???
  createThunderStunEffect(x, y) {
    
    // ? 頨恍????餅?嚗?撅斤蝜?
    for (let layer = 0; layer < 3; layer++) {
      const particleCount = 10 + layer * 4;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i;
        const radius = 22 + layer * 10;
        this.particles.push({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
          baseX: x, baseY: y,
          angle: angle, radius: radius,
          size: 1.5 + Math.random() * 2,
          color: layer === 0 ? '#FFFFFF' : layer === 1 ? '#FFEB3B' : '#E1F5FE',
          life: 1100, maxLife: 1100, alpha: 0.75,
          rotationSpeed: 0.06 * (layer % 2 === 0 ? 1 : -1),
          type: 'thunder_stun_orbit'
        });
      }
    }
    
    // ? ?餃憫蝝楝嚗憭?+ ?嚗?
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 / 10) * i;
      const length = 28 + Math.random() * 25;
      setTimeout(() => {
        this.particles.push({
          x: x, y: y,
          endX: x + Math.cos(angle) * length,
          endY: y + Math.sin(angle) * length,
          color: '#FFF176',
          life: 900, maxLife: 900, width: 1.5, alpha: 0.8,
          type: 'thunder_shock_line'
        });
        // ?
        if (i % 2 === 0) {
          const branchAngle = angle + (Math.random() - 0.5) * 0.8;
          const bLen = length * 0.5;
          const mx = x + Math.cos(angle) * length * 0.6;
          const my = y + Math.sin(angle) * length * 0.6;
          this.particles.push({
            x: mx, y: my,
            endX: mx + Math.cos(branchAngle) * bLen,
            endY: my + Math.sin(branchAngle) * bLen,
            color: '#FFEB3B', life: 700, maxLife: 700, width: 1, alpha: 0.6,
            type: 'thunder_shock_line'
          });
        }
      }, i * 80);
    }
    
    // ? ?????怨
    const sparkInterval = setInterval(() => {
      if (this.particles.some(p => p.type === 'thunder_stun_orbit' && p.life > 0)) {
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 18 + Math.random() * 25;
          this.particles.push({
            x: x + Math.cos(angle) * radius,
            y: y + Math.sin(angle) * radius,
            vx: Math.cos(angle) * 40,
            vy: Math.sin(angle) * 40,
            size: 1 + Math.random() * 2.5,
            color: Math.random() > 0.3 ? '#FFFF88' : '#FFFFFF',
            life: 350, maxLife: 350, alpha: 1,
            type: 'thunder_stun_spark'
          });
        }
      } else {
        clearInterval(sparkInterval);
      }
    }, 180);
    
    // ? ?剝??拇???
    this.particles.push({
      x: x, y: y - 45,
      text: '??', size: 22,
      color: '#FFEB3B',
      life: 1100, maxLife: 1100, alpha: 0.9,
      vx: 0, vy: -8,
      type: 'thunder_symbol'
    });
    
  }

  // ? ?啣?嚗?蝟餌??摰撖衣嚗?
  createRockGuardEffect(x, y) {
    
    // ? ?喃??絲撗拍霅瑞
    for (let layer = 0; layer < 3; layer++) {
      const radius = 40 + layer * 10;
      const particleCount = 12 + layer * 4;
      
      setTimeout(() => {
        for (let i = 0; i < particleCount; i++) {
          const angle = (Math.PI * 2 / particleCount) * i;
          this.particles.push({
            x: x + Math.cos(angle) * radius,
            y: y + 20 + Math.sin(angle) * (radius * 0.3),
            vx: 0,
            vy: -40 - Math.random() * 30,
            size: 4 + Math.random() * 6,
            color: layer === 0 ? '#8D6E63' : layer === 1 ? '#A1887F' : '#BCAAA4',
            life: 2000,
            maxLife: 2000,
            alpha: 0.9,
            type: 'rock_shield'
          });
        }
      }, layer * 100);
    }
    
    // ? ?啁?頨恍????憯?
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 / 16) * i;
      const radius = 50;
      
      this.particles.push({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        baseX: x,
        baseY: y,
        angle: angle,
        radius: radius,
        size: 6 + Math.random() * 4,
        color: '#795548',
        life: 2000,
        maxLife: 2000,
        alpha: 0.8,
        rotationSpeed: 0.015,
        type: 'rock_orbit'
      });
    }
    
    // ? ?頂蝚行???
    for (let rune = 0; rune < 6; rune++) {
      const angle = (Math.PI * 2 / 6) * rune;
      const radius = 55;
      
      setTimeout(() => {
        this.particles.push({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
          size: 5,
          color: '#FFD54F',
          life: 2000,
          maxLife: 2000,
          alpha: 0.9,
          type: 'rock_rune'
        });
        
        // 蝚行????
        const nextAngle = angle + (Math.PI * 2 / 6);
        this.particles.push({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
          endX: x + Math.cos(nextAngle) * radius,
          endY: y + Math.sin(nextAngle) * radius,
          color: '#FFD54F',
          life: 2000,
          maxLife: 2000,
          width: 2,
          alpha: 0.5,
          type: 'rock_rune_line'
        });
      }, rune * 100);
    }
    
    // ? ?圈撗拍?
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const length = 30 + Math.random() * 20;
      
      this.particles.push({
        x: x,
        y: y + 25,
        endX: x + Math.cos(angle) * length,
        endY: y + 25 + Math.sin(angle) * (length * 0.3),
        color: '#6D4C41',
        life: 2000,
        maxLife: 2000,
        width: 3,
        alpha: 0.7,
        type: 'rock_ground_mark'
      });
    }
    
  }

  // ? ?啣?嚗痔?曄?鋆??
  createRockShatterEffect(x, y) {
    
    // 蝣憌蕩
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 80;
      
      this.particles.push({
        x: x + (Math.random() - 0.5) * 50,
        y: y + (Math.random() - 0.5) * 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        size: 3 + Math.random() * 5,
        color: Math.random() > 0.5 ? '#8D6E63' : '#A1887F',
        life: 1200,
        maxLife: 1200,
        alpha: 1,
        type: 'rock_debris'
      });
    }
    
    // 憛菟??
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 40;
      
      this.particles.push({
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * 30,
        vy: -20 - Math.random() * 30,
        size: 8 + Math.random() * 12,
        color: 'rgba(141, 110, 99, 0.5)',
        life: 1000,
        maxLife: 1000,
        alpha: 0.6,
        type: 'rock_dust'
      });
    }
    
  }

  // ? ?啣?嚗◤???琿??暹???
  createRockArmorFlashEffect(x, y) {
    // ??
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const radius = 25;
      
      this.particles.push({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        vx: Math.cos(angle) * 20,
        vy: Math.sin(angle) * 20,
        size: 3 + Math.random() * 2,
        color: '#8D6E63',
        life: 300,
        maxLife: 300,
        alpha: 0.8,
        type: 'rock_armor_flash'
      });
    }
    
    // 銝剖???
    this.particles.push({
      x: x,
      y: y,
      radius: 5,
      maxRadius: 35,
      color: '#8D6E63',
      life: 300,
      maxLife: 300,
      alpha: 0.5,
      type: 'rock_armor_glow'
    });
  }

  // ? ?啣?嚗?餌???芣???
  createRockStunEffect(x, y) {
    
    // ?郭??
    for (let ring = 0; ring < 3; ring++) {
      setTimeout(() => {
        this.particles.push({
          x: x,
          y: y,
          radius: 5,
          maxRadius: 40 + ring * 10,
          color: '#8D6E63',
          life: 400,
          maxLife: 400,
          alpha: 0.6 - ring * 0.15,
          type: 'rock_stun_wave'
        });
      }, ring * 80);
    }
    
    // ?拇?蝚西??啁?
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i;
      const radius = 30;
      
      this.particles.push({
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius - 35,
        baseX: x,
        baseY: y - 35,
        angle: angle,
        radius: radius,
        text: '??',
        size: 20,
        color: '#8D6E63',
        life: 1000,
        maxLife: 1000,
        alpha: 1,
        rotationSpeed: 0.1,
        type: 'rock_stun_symbol'
      });
    }
    
  }

  createGroundCrackEffect(x, y) {
    
    // ? Phase 1: ??詨?祇? ??銝剖??賜??
    this.particles.push({
      x: x, y: y + 25,
      radius: 5, maxRadius: 90,
      color: '#FFFFFF',
      life: 250, maxLife: 250, alpha: 1,
      type: 'explosion_flash'
    });
    
    // ? 蝣??嚗?撅?+ ?車憭批?嚗?
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 110 + Math.random() * 140;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100,
        size: 4 + Math.random() * 8,
        color: i < 10 ? '#A1887F' : i < 25 ? '#8D6E63' : i < 38 ? '#6D4C41' : '#4E342E',
        life: 1800, maxLife: 1800, alpha: 1,
        type: 'earthquake_debris'
      });
    }
    
    // ? Phase 2: ?圈鋆?嚗憭?+ ?湧 + ??游?嚗?
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 / 20) * i;
      const length = 90 + Math.random() * 80;
      
      setTimeout(() => {
        // 銝餉???
        this.particles.push({
          x: x, y: y + 25,
          endX: x + Math.cos(angle) * length,
          endY: y + 25 + Math.sin(angle) * (length * 0.3),
          color: '#3E2723',
          life: 3500, maxLife: 3500,
          width: 5 + Math.random() * 3,
          alpha: 0.85,
          type: 'ground_crack'
        });
        
        // 銝餃??航???
        const branchAngle = angle + (Math.random() - 0.5) * 0.5;
        const branchLength = length * 0.65;
        const midX = x + Math.cos(angle) * length * 0.5;
        const midY = y + 25 + Math.sin(angle) * (length * 0.5 * 0.3);
        this.particles.push({
          x: midX, y: midY,
          endX: midX + Math.cos(branchAngle) * branchLength,
          endY: midY + Math.sin(branchAngle) * (branchLength * 0.3),
          color: '#5D4037',
          life: 3500, maxLife: 3500, width: 2.5, alpha: 0.65,
          type: 'ground_crack_branch'
        });
        
        // 憿?敺桀???
        if (i % 2 === 0) {
          const microAngle = angle + (Math.random() - 0.5) * 0.8;
          const microLen = length * 0.35;
          const endPtX = x + Math.cos(angle) * length * 0.75;
          const endPtY = y + 25 + Math.sin(angle) * (length * 0.75 * 0.3);
          this.particles.push({
            x: endPtX, y: endPtY,
            endX: endPtX + Math.cos(microAngle) * microLen,
            endY: endPtY + Math.sin(microAngle) * (microLen * 0.3),
            color: '#6D4C41',
            life: 3000, maxLife: 3000, width: 1.5, alpha: 0.5,
            type: 'ground_crack_branch'
          });
        }
      }, i * 25);
    }
    
    // ? Phase 3: ?郭?湔?堆??游?撅歹?
    for (let ring = 0; ring < 7; ring++) {
      setTimeout(() => {
        this.particles.push({
          x: x, y: y + 25,
          radius: 10,
          maxRadius: 40 + ring * 35,
          color: ring < 2 ? '#A1887F' : ring < 4 ? '#8D6E63' : '#BCAAA4',
          life: 900, maxLife: 900,
          alpha: 0.75 - ring * 0.08,
          type: 'earthquake_wave'
        });
      }, ring * 80);
    }
    
    // ? ?批?蝝?
    this.particles.push({
      x: x, y: y + 25,
      radius: 0, maxRadius: 120,
      color: '#D32F2F',
      life: 1800, maxLife: 1800, alpha: 0.35,
      type: 'earthquake_inner_zone'
    });
    
    // ? ?憌蕩嚗???蝺?
    for (let i = 0; i < 55; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 160;
      this.particles.push({
        x: x + Math.cos(angle) * distance,
        y: y + 25,
        vx: (Math.random() - 0.5) * 120,
        vy: -120 - Math.random() * 180,
        size: 3 + Math.random() * 7,
        color: i < 15 ? '#A1887F' : i < 35 ? '#795548' : '#6D4C41',
        life: 2200, maxLife: 2200, alpha: 1,
        type: 'earthquake_stone'
      });
    }
    
    // ? 憭批?撗拍??
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i + Math.random() * 0.3;
      const speed = 60 + Math.random() * 50;
      this.particles.push({
        x: x + Math.cos(angle) * 20,
        y: y + 15,
        vx: Math.cos(angle) * speed,
        vy: -90 - Math.random() * 80,
        size: 8 + Math.random() * 10,
        color: '#5D4037',
        life: 2000, maxLife: 2000, alpha: 1,
        type: 'earthquake_debris'
      });
    }
    
    // ? 憛菟敶憤嚗?撖?改?
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 140;
      this.particles.push({
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        vx: Math.cos(angle) * 45,
        vy: -35 - Math.random() * 60,
        size: 14 + Math.random() * 22,
        color: `rgba(121, 85, 72, ${0.6 - i * 0.015})`,
        life: 2800, maxLife: 2800, alpha: 0.7,
        type: 'earthquake_dust'
      });
    }
    
    // ? ?圈畾???
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 / 24) * i;
      const distance = 50 + Math.random() * 100;
      this.particles.push({
        x: x + Math.cos(angle) * distance,
        y: y + 25,
        size: 10 + Math.random() * 12,
        color: '#5D4037',
        life: 4500, maxLife: 4500, alpha: 0.55,
        type: 'earthquake_mark'
      });
    }
    
    // ? ?怨憌嚗鋆葆?箇??
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 60,
        y: y + 20,
        vx: (Math.random() - 0.5) * 80,
        vy: -80 - Math.random() * 60,
        size: 1.5 + Math.random() * 2,
        color: i < 5 ? '#FF8C00' : '#FFAA00',
        life: 1000, maxLife: 1000, alpha: 0.9,
        type: 'ember'
      });
    }
    
    this.createScreenShake(25, 1200);
    
  }

  // ? ?啣?嚗????單蕩撠??
  createEarthquakeWallImpactEffect(x, y, direction) {
    
    // ? ????
    this.particles.push({
      x: x, y: y,
      radius: 5, maxRadius: 70,
      color: '#FFFFFF',
      life: 200, maxLife: 200, alpha: 0.9,
      type: 'explosion_flash'
    });
    
    // ? 蝣憌?嚗之??+ 憭嚗?
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 110;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed * direction,
        vy: Math.sin(angle) * speed - 60,
        size: 4 + Math.random() * 8,
        color: i < 10 ? '#A1887F' : i < 22 ? '#8D6E63' : '#6D4C41',
        life: 1700, maxLife: 1700, alpha: 1,
        type: 'earthquake_debris'
      });
    }
    
    // ? 憭批??喲
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI - Math.PI / 2;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * (50 + Math.random() * 40) * direction,
        vy: -80 - Math.random() * 60,
        size: 10 + Math.random() * 10,
        color: '#5D4037',
        life: 1800, maxLife: 1800, alpha: 1,
        type: 'earthquake_debris'
      });
    }
    
    // ? ?圈鋆?
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 / 14) * i;
      const length = 65 + Math.random() * 50;
      setTimeout(() => {
        this.particles.push({
          x: x, y: y + 25,
          endX: x + Math.cos(angle) * length,
          endY: y + 25 + Math.sin(angle) * (length * 0.3),
          color: '#3E2723',
          life: 3000, maxLife: 3000,
          width: 4 + Math.random() * 3, alpha: 0.8,
          type: 'ground_crack'
        });
      }, i * 60);
    }
    
    // ? ?郭?湔??
    for (let ring = 0; ring < 5; ring++) {
      setTimeout(() => {
        this.particles.push({
          x: x, y: y + 25,
          radius: 10,
          maxRadius: 45 + ring * 30,
          color: ring < 2 ? '#A1887F' : '#8D6E63',
          life: 850, maxLife: 850,
          alpha: 0.7 - ring * 0.1,
          type: 'earthquake_wave'
        });
      }, ring * 80);
    }
    
    // ? ?批?蝝
    this.particles.push({
      x: x, y: y + 25,
      radius: 0, maxRadius: 100,
      color: '#D32F2F',
      life: 1500, maxLife: 1500, alpha: 0.3,
      type: 'earthquake_inner_zone'
    });
    
    // ? ???
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 110;
      this.particles.push({
        x: x + Math.cos(angle) * distance,
        y: y + 25,
        vx: (Math.random() - 0.5) * 100,
        vy: -80 - Math.random() * 120,
        size: 3 + Math.random() * 6,
        color: i < 15 ? '#795548' : '#6D4C41',
        life: 2000, maxLife: 2000, alpha: 1,
        type: 'earthquake_stone'
      });
    }
    
    // ? 瞈?憛菟
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 25 + Math.random() * 50;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 55,
        size: 12 + Math.random() * 18,
        color: `rgba(121, 85, 72, ${0.55 - i * 0.015})`,
        life: 1700, maxLife: 1700, alpha: 0.6,
        type: 'earthquake_dust'
      });
    }
    
    // ? ?圈?急?
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + 20,
        vx: (Math.random() - 0.5) * 60,
        vy: -50 - Math.random() * 50,
        size: 1.5 + Math.random() * 2,
        color: '#FF8C00',
        life: 800, maxLife: 800, alpha: 0.85,
        type: 'ember'
      });
    }
    
    // ????
    this.createScreenShake(20, 600);
    
  }

  // ?? ?蔣敹??摰撖衣嚗?
  createShadowStrikeEffect(x, y, facing) {
    
    // ?儭??蔣頠楚
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        this.particles.push({
          x: x - (i * 10 * facing),
          y: y + (Math.random() - 0.5) * 30,
          vx: 0,
          vy: (Math.random() - 0.5) * 20,
          size: 8 + Math.random() * 8,
          color: i % 2 === 0 ? '#1A1A2E' : '#16213E',
          life: 600,
          maxLife: 600,
          alpha: 0.8,
          type: 'shadow_trail'
        });
      }, i * 30);
    }
    
    // ?儭??蔣???摮?
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * 120 * facing,
        vy: Math.sin(angle) * 80,
        size: 6 + Math.random() * 6,
        color: '#8B008B',
        life: 800,
        maxLife: 800,
        alpha: 1,
        type: 'shadow_blade'
      });
    }
    
    // ?儭??蔣銵?瘜?
    for (let ring = 0; ring < 3; ring++) {
      setTimeout(() => {
        this.particles.push({
          x: x,
          y: y,
          radius: 10,
          maxRadius: 40 + ring * 20,
          color: ring === 0 ? '#4B0082' : '#2E0854',
          life: 600,
          maxLife: 600,
          alpha: 0.6,
          type: 'shadow_wave'
        });
      }, ring * 100);
    }
    
    // ?儭??圈?蔣?湔
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      
      this.particles.push({
        x: x,
        y: y + 25,
        endX: x + Math.cos(angle) * 50,
        endY: y + 25,
        color: '#1A1A2E',
        life: 1000,
        maxLife: 1000,
        width: 3,
        alpha: 0.7,
        type: 'shadow_ground'
      });
    }
    
  }

  createShadowCloneEffect(x, y) {
    
    // ? ?澈?箇??敶梁???
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 60;
      
      this.particles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        size: 10 + Math.random() * 15,
        color: i % 2 === 0 ? '#1A1A2E' : '#0F3460',
        life: 1200,
        maxLife: 1200,
        alpha: 0.8,
        type: 'shadow_smoke'
      });
    }
    
    // ? ??? - 蝝怨?賡??啁?
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const radius = 50;
      
      this.particles.push({
        x: x,
        y: y,
        orbitX: x,
        orbitY: y,
        orbitRadius: radius,
        orbitAngle: angle,
        orbitSpeed: 0.003,
        size: 6 + Math.random() * 4,
        color: '#9D4EDD',
        life: 3000,
        maxLife: 3000,
        alpha: 0.9,
        type: 'shadow_counter_aura'
      });
    }
    
    // ? ?蔣蝚行??
    for (let ring = 0; ring < 2; ring++) {
      this.particles.push({
        x: x,
        y: y + 25,
        radius: 40 + ring * 20,
        maxRadius: 40 + ring * 20,
        color: ring === 0 ? '#7B2CBF' : '#5A189A',
        life: 3000,
        maxLife: 3000,
        alpha: 0.5,
        type: 'shadow_rune_circle'
      });
    }
    
    // ? ????
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 40;
        
        this.particles.push({
          x: x + Math.cos(angle) * distance,
          y: y + Math.sin(angle) * distance,
          vx: 0,
          vy: -20,
          size: 4 + Math.random() * 4,
          color: '#E0AAFF',
          life: 800,
          maxLife: 800,
          alpha: 1,
          type: 'shadow_sparkle'
        });
      }, i * 50);
    }
    
  }

  // ? ?????摰撖衣嚗?
  createSpiritBombEffect(x, y, facing) {
    
    // ? Phase 1: ?葉???航? ????箸??嗥葬
    for (let wave = 0; wave < 6; wave++) {
      setTimeout(() => {
        for (let i = 0; i < 12; i++) {
          const angle = (Math.PI * 2 / 12) * i + wave * 0.6;
          const r = 40 - wave * 5;
          this.particles.push({
            x: x + Math.cos(angle) * r,
            y: y + Math.sin(angle) * r,
            vx: -Math.cos(angle) * (70 + wave * 15),
            vy: -Math.sin(angle) * (70 + wave * 15),
            size: 2 + Math.random() * 2.5,
            color: wave > 3 ? '#FFFFFF' : wave > 1 ? '#FFD700' : '#FFA500',
            life: 350, maxLife: 350, alpha: 0.9,
            type: 'spirit_trail'
          });
        }
        // ?詨???
        this.particles.push({
          x: x, y: y, vx: 0, vy: 0,
          size: 5 + wave * 3,
          color: wave > 3 ? '#FFFFFF' : '#FFD700',
          life: 280, maxLife: 280, alpha: 0.85,
          type: 'spirit_burst'
        });
      }, wave * 60);
    }
    
    // ? Phase 2: 蝚血?憌 ??????蝚衣?嚗憭??+ 蝚行?蝎?嚗?
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        // 蝚衣?銝駁?
        this.particles.push({
          x: x + (i * 12 * facing),
          y: y - 10 + Math.sin(i * 0.6) * 8,
          vx: facing * 40,
          vy: -5 + Math.sin(i) * 8,
          size: 9 + Math.random() * 5,
          color: i % 3 === 0 ? '#FFFFFF' : i % 3 === 1 ? '#FFD700' : '#FFA500',
          life: 900, maxLife: 900, alpha: 0.9,
          rotation: i * Math.PI * 0.25,
          type: 'spirit_talisman'
        });
        // 蝚衣?撠曄
        for (let j = 0; j < 3; j++) {
          this.particles.push({
            x: x + (i * 12 * facing) + (Math.random() - 0.5) * 10,
            y: y - 10 + (Math.random() - 0.5) * 15,
            vx: facing * 20 + (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 25,
            size: 2 + Math.random() * 2,
            color: '#FFE5B4',
            life: 500, maxLife: 500, alpha: 0.7,
            type: 'spirit_trail'
          });
        }
      }, i * 45);
    }
    
    // ? 瘛⊿??脤???頝∴??游???
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        this.particles.push({
          x: x + (i * 7 * facing),
          y: y + (Math.random() - 0.5) * 25,
          vx: facing * 30,
          vy: (Math.random() - 0.5) * 35,
          size: 3 + Math.random() * 3.5,
          color: i % 3 === 0 ? '#FFFFFF' : Math.random() > 0.5 ? '#FFE5B4' : '#FFDEAD',
          life: 650, maxLife: 650, alpha: 0.75,
          type: 'spirit_trail'
        });
      }, i * 35);
    }
    
    // ? ??蝎??啁?嚗?撅文???頧?
    for (let layer = 0; layer < 2; layer++) {
      for (let i = 0; i < 14; i++) {
        const angle = (Math.PI * 2 / 14) * i;
        const radius = 14 + layer * 8;
        this.particles.push({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
          baseX: x, baseY: y,
          angle: angle, radius: radius,
          size: 2 + Math.random(),
          color: layer === 0 ? '#FFD700' : '#FFA500',
          life: 900, maxLife: 900, alpha: 0.8,
          rotationSpeed: (layer === 0 ? 0.09 : -0.07),
          type: 'spirit_orbit'
        });
      }
    }
    
    // ? ?澆??
    setTimeout(() => {
      for (let ring = 0; ring < 3; ring++) {
        setTimeout(() => {
          this.particles.push({
            x: x, y: y,
            radius: 5, maxRadius: 40 + ring * 15,
            color: ring === 0 ? '#FFFFFF' : '#FFD700',
            life: 350, maxLife: 350,
            alpha: 0.6 - ring * 0.15,
            type: 'spirit_shockwave'
          });
        }, ring * 60);
      }
    }, 400);
    
  }

  // ? ?啣?嚗??泵?賭葉?寞?
  createSpiritBombHitEffect(x, y) {
    
    // ??Phase 1: 撌典之憭芣扔蝚西?瘚桃
    this.particles.push({
      x: x, y: y - 45,
      text: '??', size: 45,
      color: '#FFD700',
      life: 1200, maxLife: 1200, alpha: 1,
      vx: 0, vy: -30,
      type: 'yin_yang_symbol'
    });
    
    // ? Phase 2: ?賜銝剖???
    this.particles.push({
      x: x, y: y,
      radius: 5, maxRadius: 65,
      color: '#FFFFFF',
      life: 250, maxLife: 250, alpha: 1,
      type: 'explosion_flash'
    });
    
    // ? Phase 3: ??銵?瘜ｇ?憭惜 + ?鈭斗嚗?
    for (let ring = 0; ring < 6; ring++) {
      setTimeout(() => {
        this.particles.push({
          x: x, y: y,
          radius: 5,
          maxRadius: 50 + ring * 22,
          color: ring % 2 === 0 ? '#FFD700' : '#FFFFFF',
          life: 550, maxLife: 550,
          alpha: 0.75 - ring * 0.1,
          type: 'spirit_shockwave'
        });
      }, ring * 70);
    }
    
    // ? Phase 4: 蝚血???蝎?嚗之??+ ?質嚗?
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 100;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 35,
        size: 3 + Math.random() * 5,
        color: i < 10 ? '#FFFFFF' : i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FFA500' : '#FFDAB9',
        life: 900, maxLife: 900, alpha: 1,
        type: 'spirit_burst'
      });
    }
    
    // ? ?怠???嚗?Ｙ泵??
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const length = 60 + Math.random() * 30;
      setTimeout(() => {
        this.particles.push({
          x: x, y: y + 20,
          endX: x + Math.cos(angle) * length,
          endY: y + 20 + Math.sin(angle) * (length * 0.25),
          color: '#FFD700',
          life: 1500, maxLife: 1500, width: 2.5, alpha: 0.7,
          type: 'thunder_ground_rune'
        });
      }, i * 40);
    }
    
    // ? 蝚行??啁憌嚗憭?+ ?澆?嚗?
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 60;
      this.particles.push({
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        vx: Math.cos(angle) * 25,
        vy: -50 - Math.random() * 70,
        size: 2 + Math.random() * 3,
        color: i < 8 ? '#FFE5B4' : '#D3D3D3',
        life: 1400, maxLife: 1400, alpha: 0.65,
        type: 'talisman_ash'
      });
    }
    
    // ? ???瘝予
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        this.particles.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y,
          vx: (Math.random() - 0.5) * 10,
          vy: -150 - Math.random() * 100,
          size: 3 + Math.random() * 3,
          color: i < 3 ? '#FFFFFF' : '#FFD700',
          life: 650, maxLife: 650, alpha: 0.85,
          type: 'spirit_burst'
        });
      }, i * 25);
    }
    
    // ????
    this.createScreenShake(14, 400);
    
  }

  // ?? ?啣?嚗???啁??
  createSpiritHealEffect(x, y, healAmount) {
    
    // ?? 瘛∟???啁?
    for (let layer = 0; layer < 3; layer++) {
      const radius = 35 + layer * 12;
      const particleCount = 12 + layer * 4;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i;
        this.particles.push({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
          baseX: x,
          baseY: y,
          angle: angle,
          radius: radius,
          size: 2 + Math.random() * 2,
          color: layer === 0 ? '#87CEEB' : layer === 1 ? '#ADD8E6' : '#B0E0E6',
          life: 1000,
          maxLife: 1000,
          alpha: 0.7 - layer * 0.15,
          rotationSpeed: -0.05,
          type: 'heal_aura'
        });
      }
    }
    
    // ?? 瘝餌??詨?銝?
    this.particles.push({
      x: x,
      y: y - 30,
      text: `+${healAmount}`,
      size: 25,
      color: '#4CAF50',
      life: 1500,
      maxLife: 1500,
      alpha: 1,
      vx: 0,
      vy: -40,
      type: 'heal_number'
    });
    
    // ?? 瘝餌???銝?
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 30;
        
        this.particles.push({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
          vx: 0,
          vy: -60 - Math.random() * 40,
          size: 2 + Math.random() * 2,
          color: '#90EE90',
          life: 1200,
          maxLife: 1200,
          alpha: 0.9,
          type: 'heal_particle'
        });
      }, i * 80);
    }
    
  }

  // ???予撖拙?寞? - ???挾
  createSpiritJudgmentEffect(x, y) {
    
    // ???喃??瘜撅?
    for (let ring = 0; ring < 5; ring++) {
      setTimeout(() => {
        const radius = ring * 50 + 50;
        const runeCount = 8 + ring * 4;
        
        // 瘜?
        this.particles.push({
          x: x,
          y: y + 25,
          radius: 0,
          maxRadius: radius,
          color: ring % 2 === 0 ? '#FFD700' : '#FFA500',
          life: 2000,
          maxLife: 2000,
          alpha: 0.8 - ring * 0.12,
          type: 'judgment_circle'
        });
        
        // 瘜蝚行?
        for (let i = 0; i < runeCount; i++) {
          const angle = (Math.PI * 2 / runeCount) * i;
          const runeX = x + Math.cos(angle) * radius;
          const runeY = y + 25 + Math.sin(angle) * (radius * 0.3);
          
          this.particles.push({
            x: runeX,
            y: runeY,
            size: 4 + Math.random() * 3,
            color: '#FFD700',
            life: 2000,
            maxLife: 2000,
            alpha: 0.9,
            type: 'judgment_rune'
          });
        }
      }, ring * 300);
    }
    
    // ????銝??喳予蝛?
    for (let i = 0; i < 40; i++) {
      setTimeout(() => {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 200;
        const particleX = x + Math.cos(angle) * distance;
        const particleY = y + 25;
        
        this.particles.push({
          x: particleX,
          y: particleY,
          vx: 0,
          vy: -120 - Math.random() * 80,
          size: 2 + Math.random() * 3,
          color: Math.random() > 0.5 ? '#FFD700' : '#FFF8DC',
          life: 2000,
          maxLife: 2000,
          alpha: 0.8,
          type: 'judgment_particle_rise'
        });
      }, i * 40);
    }
    
    // ??蝛箸除?趙?? - ?瞍?憚
    for (let wave = 0; wave < 6; wave++) {
      setTimeout(() => {
        this.particles.push({
          x: x,
          y: y,
          radius: 10,
          maxRadius: 180 + wave * 30,
          color: '#FFE4B5',
          life: 1500,
          maxLife: 1500,
          alpha: 0.3 - wave * 0.04,
          type: 'judgment_ripple'
        });
      }, wave * 250);
    }
    
    // ??閫?典??除??
    for (let layer = 0; layer < 3; layer++) {
      const radius = 40 + layer * 15;
      const particleCount = 12 + layer * 4;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i;
        this.particles.push({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
          baseX: x,
          baseY: y,
          angle: angle,
          radius: radius,
          size: 3,
          color: layer === 0 ? '#FFD700' : layer === 1 ? '#FFA500' : '#FFE4B5',
          life: 2000,
          maxLife: 2000,
          alpha: 0.7 - layer * 0.15,
          rotationSpeed: 0.06,
          type: 'judgment_aura'
        });
      }
    }
    
  }

  // ???予撖拙 - 憭拚???挾
  createJudgmentExecutionEffect(x, y, range) {
    
    // ??憭拚?鋆???鋆葦
    for (let i = 0; i < 15; i++) {
      const crackX = x + (Math.random() - 0.5) * range;
      const crackY = 0;
      
      this.particles.push({
        x: crackX,
        y: crackY,
        endX: crackX + (Math.random() - 0.5) * 100,
        endY: crackY + 150,
        color: '#FFFFFF',
        life: 1500,
        maxLife: 1500,
        width: 3 + Math.random() * 3,
        alpha: 1,
        type: 'heaven_crack'
      });
    }
    
    // ???撖拙?敺予??
    for (let beam = 0; beam < 30; beam++) {
      const angle = (Math.PI * 2 / 30) * beam;
      const beamX = x + Math.cos(angle) * (range * 0.6);
      const beamY = y + Math.sin(angle) * (range * 0.6);
      
      this.particles.push({
        x: beamX,
        y: 0,
        endX: beamX,
        endY: beamY,
        currentY: 0,
        targetY: beamY,
        color: beam % 3 === 0 ? '#FFD700' : beam % 3 === 1 ? '#FFA500' : '#FFFFE0',
        life: 1500,
        maxLife: 1500,
        width: 4 + Math.random() * 3,
        alpha: 0.9,
        type: 'judgment_beam'
      });
    }
    
    // ??頞之蝭????
    for (let ring = 0; ring < 8; ring++) {
      setTimeout(() => {
        this.particles.push({
          x: x,
          y: y,
          radius: 10,
          maxRadius: range,
          color: ring % 2 === 0 ? '#FFD700' : '#FFA500',
          life: 800,
          maxLife: 800,
          alpha: 0.6 - ring * 0.06,
          type: 'judgment_explosion'
        });
      }, ring * 100);
    }
    
    // ???????
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * range;
      const particleX = x + Math.cos(angle) * distance;
      const particleY = y + Math.sin(angle) * distance;
      
      this.particles.push({
        x: particleX,
        y: particleY,
        vx: Math.cos(angle) * (100 + Math.random() * 100),
        vy: Math.sin(angle) * (100 + Math.random() * 100),
        size: 3 + Math.random() * 5,
        color: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FFFFFF' : '#FFA500',
        life: 1200,
        maxLife: 1200,
        alpha: 1,
        type: 'judgment_radiance'
      });
    }
    
    // ???圈蟡?蝚行?畾?
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 / 20) * i;
      const distance = range * 0.7;
      const runeX = x + Math.cos(angle) * distance;
      const runeY = y + 25;
      
      this.particles.push({
        x: runeX,
        y: runeY,
        size: 8 + Math.random() * 6,
        color: '#FFD700',
        life: 3000,
        maxLife: 3000,
        alpha: 0.7,
        type: 'judgment_mark'
      });
    }
    
    // ????
    this.createScreenShake(15, 800);
    
  }

  // ?? ?啣?嚗祟?文銝剔??
  createJudgmentHitEffect(targetX, targetY, damage) {
    
    // 撖?摮??唳筑??
    this.particles.push({
      x: targetX,
      y: targetY - 60,
      text: '撖?',
      size: 45,
      color: '#FFD700',
      life: 1500,
      maxLife: 1500,
      alpha: 1,
      vx: 0,
      vy: -20,
      type: 'judgment_character'
    });
    
    // ?????格?
    for (let layer = 0; layer < 4; layer++) {
      const radius = 40 + layer * 12;
      const particleCount = 16 + layer * 6;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i;
        this.particles.push({
          x: targetX + Math.cos(angle) * radius,
          y: targetY + Math.sin(angle) * radius,
          vx: -Math.cos(angle) * 50,
          vy: -Math.sin(angle) * 50,
          size: 3 + Math.random() * 3,
          color: layer % 2 === 0 ? '#FFD700' : '#FFFFFF',
          life: 1000,
          maxLife: 1000,
          alpha: 0.9 - layer * 0.15,
          type: 'judgment_envelop'
        });
      }
    }
    
    // 撖拙銵?瘜?
    for (let ring = 0; ring < 5; ring++) {
      setTimeout(() => {
        this.particles.push({
          x: targetX,
          y: targetY,
          radius: 5,
          maxRadius: 80 + ring * 25,
          color: ring % 2 === 0 ? '#FFD700' : '#FFA500',
          life: 600,
          maxLife: 600,
          alpha: 0.8 - ring * 0.14,
          type: 'judgment_impact_wave'
        });
      }, ring * 90);
    }
    
    // ?瑕拿?詨?
    this.particles.push({
      x: targetX,
      y: targetY - 40,
      text: `-${damage}`,
      size: 30,
      color: '#FF4444',
      life: 1500,
      maxLife: 1500,
      alpha: 1,
      vx: 0,
      vy: -35,
      type: 'damage_number'
    });
    
  }

  // ?? ?啣?嚗祟?斗祥???
  createJudgmentHealEffect(x, y, healAmount) {
    
    // ?? ?????賣???
    for (let layer = 0; layer < 5; layer++) {
      const radius = 50 + layer * 18;
      const particleCount = 18 + layer * 8;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i;
        this.particles.push({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
          baseX: x,
          baseY: y,
          angle: angle,
          radius: radius,
          size: 3 + Math.random() * 2,
          color: layer % 2 === 0 ? '#FFD700' : '#90EE90',
          life: 2000,
          maxLife: 2000,
          alpha: 0.8 - layer * 0.12,
          rotationSpeed: -0.04,
          type: 'judgment_heal_aura'
        });
      }
    }
    
    // ?? 瘝餌??詨?瘚桃
    this.particles.push({
      x: x,
      y: y - 50,
      text: `+${healAmount}`,
      size: 35,
      color: '#4CAF50',
      life: 2000,
      maxLife: 2000,
      alpha: 1,
      vx: 0,
      vy: -30,
      type: 'heal_number_large'
    });
    
    // ?? 蝬瘝餌???銝?
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 60;
      
      this.particles.push({
        x: x + Math.cos(angle) * distance,
        y: y + 25,
        vx: 0,
        vy: -80 - Math.random() * 60,
        size: 3 + Math.random() * 3,
        color: i % 2 === 0 ? '#90EE90' : '#98FB98',
        life: 1800,
        maxLife: 1800,
        alpha: 1,
        type: 'judgment_heal_particle'
      });
    }
    
    // ?? ????
    for (let ring = 0; ring < 4; ring++) {
      setTimeout(() => {
        this.particles.push({
          x: x,
          y: y,
          radius: 5,
          maxRadius: 100 + ring * 30,
          color: '#FFD700',
          life: 1000,
          maxLife: 1000,
          alpha: 0.5 - ring * 0.1,
          type: 'judgment_heal_ring'
        });
      }, ring * 200);
    }
    
  }

  // ?? 瘥?賣?寞?
  createVenomDartEffect(x, y, facing) {
    
    // 瘥?游?
    for (let i = 0; i < 15; i++) {
      const angle = (facing > 0 ? 0 : Math.PI) + (Math.random() - 0.5) * 0.8;
      const speed = 150 + Math.random() * 100;
      this.particles.push({
        x: x + facing * 20,
        y: y - 15 + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: i % 3 === 0 ? '#00b894' : i % 3 === 1 ? '#55efc4' : '#2d3436',
        life: 600,
        maxLife: 600,
        alpha: 0.8,
        type: 'poison_mist'
      });
    }
    
    // 瘥雯皛渲
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x + facing * (10 + Math.random() * 30),
        y: y - 20 + Math.random() * 10,
        vx: facing * (20 + Math.random() * 30),
        vy: 50 + Math.random() * 80,
        size: 2 + Math.random() * 2,
        color: '#00b894',
        life: 800,
        maxLife: 800,
        alpha: 1,
        type: 'poison_drip'
      });
    }
    
  }

  // ?? 瘥憌?頠楚?寞?
  createVenomDartTrailEffect(x, y) {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        size: 2 + Math.random() * 2,
        color: Math.random() > 0.5 ? '#00b894' : '#55efc4',
        life: 400,
        maxLife: 400,
        alpha: 0.7,
        type: 'poison_mist'
      });
    }
  }

  // ? ???琿雿蔭?寞?
  createThornTrapEffect(x, y) {
    
    // ?圈鋆???
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      const dist = 20 + Math.random() * 15;
      this.particles.push({
        x: x + Math.cos(angle) * dist,
        y: y + 25,
        vx: Math.cos(angle) * 30,
        vy: -20 - Math.random() * 30,
        size: 2 + Math.random() * 2,
        color: i % 2 === 0 ? '#00b894' : '#6c5ce7',
        life: 800,
        maxLife: 800,
        alpha: 0.9,
        type: 'poison_mist'
      });
    }
    
    // 瘥?湔??
    this.particles.push({
      x: x,
      y: y + 25,
      radius: 5,
      maxRadius: 50,
      color: '#00b894',
      life: 600,
      maxLife: 600,
      alpha: 0.5,
      type: 'poison_ring'
    });
    
  }

  // ?? 瘥?撘??寞?
  createPoisonDetonateEffect(x, y) {
    
    // 憭批?瘥???
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 150;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: i % 3 === 0 ? '#00b894' : i % 3 === 1 ? '#6c5ce7' : '#2d3436',
        life: 1000,
        maxLife: 1000,
        alpha: 1,
        type: 'poison_mist'
      });
    }
    
    // 瘥?銵?瘜?
    for (let ring = 0; ring < 3; ring++) {
      setTimeout(() => {
        this.particles.push({
          x: x,
          y: y,
          radius: 5,
          maxRadius: 80 + ring * 30,
          color: ring % 2 === 0 ? '#00b894' : '#6c5ce7',
          life: 700,
          maxLife: 700,
          alpha: 0.6,
          type: 'poison_ring'
        });
      }, ring * 100);
    }
    
    // ??蝚西?
    this.particles.push({
      x: x,
      y: y - 50,
      text: '??',
      size: 40,
      color: '#00b894',
      life: 1500,
      maxLife: 1500,
      alpha: 1,
      vx: 0,
      vy: -25,
      type: 'poison_symbol'
    });
    
  }

  // ?? 瘥?DoT?瑕拿?寞?
  createPoisonDotEffect(x, y) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        vx: 0,
        vy: -30 - Math.random() * 20,
        size: 2 + Math.random() * 2,
        color: Math.random() > 0.5 ? '#00b894' : '#55efc4',
        life: 600,
        maxLife: 600,
        alpha: 0.8,
        type: 'poison_mist'
      });
    }
  }

  // ? ???琿閫貊?寞?
  createThornTrapTriggerEffect(x, y) {
    
    // ??敺?Ｙ???
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 40;
      this.particles.push({
        x: x + Math.cos(angle) * dist,
        y: y + 25,
        vx: Math.cos(angle) * 20,
        vy: -100 - Math.random() * 80,
        size: 3 + Math.random() * 3,
        color: i % 2 === 0 ? '#00b894' : '#2d3436',
        life: 1200,
        maxLife: 1200,
        alpha: 1,
        type: 'poison_mist'
      });
    }
    
    // 瘥???
    this.particles.push({
      x: x,
      y: y,
      radius: 5,
      maxRadius: 60,
      color: '#00b894',
      life: 800,
      maxLife: 800,
      alpha: 0.7,
      type: 'poison_ring'
    });
    
    this.createScreenShake(6, 400);
  }

  // ? ??誘???
  createSuplexEffect(x, y, facing = 1) {
    // 銵憛萄?
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + Math.random() * 10,
        vx: -facing * (Math.random() * 3 + 1),
        vy: -(Math.random() * 2 + 1),
        size: Math.random() * 4 + 2,
        color: '#D32F2F',
        life: 600,
        maxLife: 600,
        alpha: 0.9,
        type: 'dust'
      });
    }
    // ??銵?瘜?
    this.particles.push({
      x: x,
      y: y,
      radius: 5,
      maxRadius: 50,
      color: '#FF5252',
      life: 500,
      maxLife: 500,
      alpha: 0.8,
      type: 'shockwave'
    });
    this.createScreenShake(5, 300);
  }

  // ? ??誘????啁??
  createSuplexSlamEffect(x, y) {
    // ?圈鋆?
    for (let i = 0; i < 20; i++) {
      const angle = (Math.random() - 0.5) * Math.PI;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * (Math.random() * 5 + 2),
        vy: -(Math.random() * 4 + 1),
        size: Math.random() * 5 + 2,
        color: Math.random() > 0.5 ? '#D32F2F' : '#FF5252',
        life: 800,
        maxLife: 800,
        alpha: 1,
        type: 'dust'
      });
    }
    // ?圈蝣唳???
    this.particles.push({
      x: x,
      y: y,
      radius: 5,
      maxRadius: 80,
      color: '#FF1744',
      life: 600,
      maxLife: 600,
      alpha: 0.9,
      type: 'shockwave'
    });
    this.createScreenShake(10, 500);
  }

  // ?? ????畾箇??
  createRoyalExecutionEffect(x, y) {
    // 蝝甇颱滿?
    for (let i = 0; i < 25; i++) {
      const angle = (i / 25) * Math.PI * 2;
      this.particles.push({
        x: x + Math.cos(angle) * 30,
        y: y + Math.sin(angle) * 30,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        size: Math.random() * 4 + 3,
        color: Math.random() > 0.5 ? '#D32F2F' : '#212121',
        life: 1000,
        maxLife: 1000,
        alpha: 1,
        type: 'spark'
      });
    }
    // ???
    this.particles.push({
      x: x,
      y: y - 50,
      radius: 10,
      maxRadius: 100,
      color: '#FF1744',
      life: 800,
      maxLife: 800,
      alpha: 0.7,
      type: 'shockwave'
    });
    this.createScreenShake(8, 600);
  }

  // ?? ????畾箸瘙箇??
  createExecuteFinisherEffect(x, y) {
    // 銵?脩???
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 6 + 3,
        color: '#B71C1C',
        life: 1200,
        maxLife: 1200,
        alpha: 1,
        type: 'spark'
      });
    }
    this.createScreenShake(15, 800);
  }

  // ? 靽格迤嚗? createScreenShake 蝘餃???瘜?敺?
  createScreenShake(intensity, duration) {
    this.screenShake = {
      intensity: intensity,
      duration: duration,
      startTime: Date.now()
    };
  }

  // ?? ?啣?嚗蝎??萄遣?寞?
  createParticles(x, y, config, direction = 0) {
    const {
      count = 5,
      color = '#FFFFFF',
      speed = 100,
      life = 1000,
      size = 3
    } = config;
    
    for (let i = 0; i < count; i++) {
      const angle = direction + (Math.random() - 0.5) * Math.PI * 0.5;
      const particleSpeed = speed + Math.random() * 50;
      
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * particleSpeed,
        vy: Math.sin(angle) * particleSpeed,
        size: size + Math.random() * 2,
        color: color,
        life: life,
        maxLife: life,
        alpha: 1,
        type: 'generic'
      });
    }
  }

  // ? ?啣?嚗??豢??瘜?
  createExplosionEffect(x, y, options = {}) {
    const {
      color = '#FF4444',
      maxRadius = 50,
      duration = 500
    } = options;
    
    // ?蝎?
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        color: color,
        life: duration,
        maxLife: duration,
        alpha: 1,
        type: 'explosion'
      });
    }
    
    // ??
    this.particles.push({
      x: x,
      y: y,
      radius: 0,
      maxRadius: maxRadius,
      color: color,
      life: duration,
      maxLife: duration,
      alpha: 0.5,
      type: 'explosion_ring'
    });
  }

  update(deltaTime) {
    // 雿輻?憯葬隞? filter()嚗??撟?萄遣?圈??
    let writeIdx = 0;
    for (let readIdx = 0; readIdx < this.particles.length; readIdx++) {
      const particle = this.particles[readIdx];
      particle.life -= deltaTime;
      
      if (particle.life <= 0) continue; // 頝喲?撌脫香鈭∠?蝎?
      
      if (particle.vx !== undefined) particle.x += particle.vx * deltaTime / 1000;
      if (particle.vy !== undefined) {
        particle.y += particle.vy * deltaTime / 1000;
        
        // ? ?怎蝎????蔣??
        if (particle.type === 'fire_spark' || particle.type === 'ember' || 
            particle.type === 'launch_spark' || particle.type === 'explosion_fire') {
          particle.vy += 150 * deltaTime / 1000;
        }
        
        // ?? 瘞渡????蔣??
        if (particle.type === 'water_drop' || particle.type === 'water_splash' || 
            particle.type === 'water_splash_large' || particle.type === 'water_drip') {
          particle.vy += 200 * deltaTime / 1000;
        }
        
        // ?? 瘞?部銝?
        if (particle.type === 'water_bubble') {
          particle.vy -= 50 * deltaTime / 1000;
        }
        
        // ?? 瘞湧?頨恍?瘜Ｗ??
        if ((particle.type === 'dragon_body' || particle.type === 'dragon_head' || particle.type === 'dragon_eye') && particle.wavePhase !== undefined) {
          particle.y += Math.sin(Date.now() * 0.004 + particle.wavePhase) * (particle.waveAmp || 0.3);
        }
        
        // ?? ?蔣蝎???敺桅??蔣??
        if (particle.type === 'shadow_particle' || particle.type === 'shadow_burst' ||
            particle.type === 'clone_particle' || particle.type === 'shadow_fade') {
          particle.vy += 100 * deltaTime / 1000;
        }
      }
      
      // ?脩戌霅瑞?啁?
      if (particle.type === 'defend_shield_orbit') {
        particle.angle += 0.02;
        particle.x = particle.baseX + Math.cos(particle.angle) * particle.radius;
        particle.y = particle.baseY + Math.sin(particle.angle) * particle.radius;
      }
      
      // ?? 瘞游?霅瑞?啁?
      if (particle.type === 'water_shield_orbit' || particle.type === 'water_droplet' || 
          particle.type === 'water_wrap') {
        particle.angle += particle.rotationSpeed || 0.01;
        particle.x = particle.baseX + Math.cos(particle.angle) * particle.radius;
        particle.y = particle.baseY + Math.sin(particle.angle) * particle.radius;
      }
      
      // ???琿?啁???
      if (particle.type === 'thunder_fist_orbit' || particle.type === 'thunder_stun_orbit') {
        particle.angle += particle.rotationSpeed || 0.05;
        particle.x = particle.baseX + Math.cos(particle.angle) * particle.radius;
        particle.y = particle.baseY + Math.sin(particle.angle) * particle.radius;
      }
      
      // ? ?拇????啁?
      if (particle.type === 'stun_star') {
        particle.angle += 0.05;
        particle.x = particle.baseX + Math.cos(particle.angle) * particle.radius;
        particle.y = particle.baseY + Math.sin(particle.angle) * particle.radius;
      }
      
      // ? 撗拍蝣????蔣??
      if (particle.type === 'rock_debris' || particle.type === 'earthquake_debris' ||
          particle.type === 'earthquake_stone' || particle.type === 'wall_rock_splash') {
        particle.vy += 200 * deltaTime / 1000;
      }
      
      // ? 撗拍?啁???
      if (particle.type === 'rock_orbit') {
        particle.angle += particle.rotationSpeed || 0.015;
        particle.x = particle.baseX + Math.cos(particle.angle) * particle.radius;
        particle.y = particle.baseY + Math.sin(particle.angle) * particle.radius;
      }
      
      // ? ?拇?蝚西??啁?
      if (particle.type === 'rock_stun_symbol') {
        particle.angle += particle.rotationSpeed || 0.1;
        particle.x = particle.baseX + Math.cos(particle.angle) * particle.radius;
        particle.y = particle.baseY + Math.sin(particle.angle) * particle.radius;
      }
      
      // ?? ????啁?
      if (particle.type === 'counter_aura') {
        particle.angle += particle.rotationSpeed || 0.05;
        particle.x = particle.baseX + Math.cos(particle.angle) * particle.radius;
        particle.y = particle.baseY + Math.sin(particle.angle) * particle.radius;
      }
      
      // ? ?頂蝎???敺桅??蔣??
      if (particle.type === 'spirit_trail' || particle.type === 'spirit_burst' ||
          particle.type === 'talisman_ash' || particle.type === 'judgment_radiance') {
        particle.vy += 80 * deltaTime / 1000;
      }
      
      // ? 蝚血??啁???
      if (particle.type === 'spirit_orbit' || particle.type === 'heal_aura' ||
          particle.type === 'judgment_aura' || particle.type === 'judgment_heal_aura') {
        particle.angle += particle.rotationSpeed || 0.05;
        particle.x = particle.baseX + Math.cos(particle.angle) * particle.radius;
        particle.y = particle.baseY + Math.sin(particle.angle) * particle.radius;
      }
      
      // ?? 瘥頂蝎?????瘨敶梢
      if (particle.type === 'poison_drip') {
        particle.vy += 150 * deltaTime / 1000;
      }
      
      // ??撖拙?銝??
      if (particle.type === 'judgment_beam' && particle.currentY !== undefined) {
        const progress = 1 - (particle.life / particle.maxLife);
        particle.currentY = particle.targetY * progress;
      }
      
      // ? ????怨??
      if (particle.type === 'combo_spark' && particle.gravity) {
        particle.vy += particle.gravity * deltaTime / 1000;
      }
      
      // ? ?????
      if (particle.gravity && particle.type !== 'combo_spark') {
        particle.vy += particle.gravity * deltaTime / 1000;
      }
      
      // ?湔??摨?
      particle.alpha = particle.life / particle.maxLife;
      
      this.particles[writeIdx++] = particle;
    }
    this.particles.length = writeIdx;
    
    // ? ?湔?啣??寞?蝟餌絞
    this.updateEnvironmentParticles(deltaTime);
    this.updateComboTrail(deltaTime);
    this.updateImpactRings(deltaTime);
    
    if (this.screenShake.duration > 0) {
      this.screenShake.duration -= deltaTime;
      if (this.screenShake.duration <= 0) this.screenShake.intensity = 0;
    }
  }

  render(ctx) {
    if (this.screenShake.intensity > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake.intensity;
      const shakeY = (Math.random() - 0.5) * this.screenShake.intensity;
      ctx.translate(shakeX, shakeY);
    }

    // 粒子可在同一幀被建立、更新與繪製；為避免壽命插值短暫超出 0~1，
    // 所有圓形半徑都在進入 Canvas API 前統一限制在合法範圍。
    const renderProgress = particle => {
      const life = Number(particle.life);
      const maxLife = Number(particle.maxLife);
      if (!Number.isFinite(life) || !Number.isFinite(maxLife) || maxLife <= 0) return 0;
      return Math.max(0, Math.min(1, 1 - life / maxLife));
    };
    const nonNegative = value => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;

    this.particles.forEach(particle => {
      ctx.save();
      if (!Number.isFinite(particle.x) || !Number.isFinite(particle.y)) {
        ctx.restore();
        return;
      }
      if (particle.size !== undefined) particle.size = nonNegative(particle.size);
      if (particle.radius !== undefined) particle.radius = nonNegative(particle.radius);
      if (particle.maxRadius !== undefined) particle.maxRadius = nonNegative(particle.maxRadius);
      ctx.globalAlpha = particle.alpha || 1;
      
      // ? ?怎?寞?皜脫?
      if (particle.type === 'fire_aura' || particle.type === 'fire_trail' || 
          particle.type === 'fire_thrust' || particle.type === 'explosion_fire' ||
          particle.type === 'vortex_fire' || particle.type === 'fireball_trail' ||
          particle.type === 'fire_afterimage') {
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // ?? ?蔣蝟餌?摮葡??
      else if (particle.type === 'shadow_trail' || particle.type === 'shadow_afterimage' ||
          particle.type === 'shadow_particle' || particle.type === 'shadow_burst' ||
          particle.type === 'clone_particle' || particle.type === 'shadow_spiral' ||
          particle.type === 'counter_burst' || particle.type === 'shadow_smoke' ||
          particle.type === 'shadow_blade' || particle.type === 'shadow_sparkle') {
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // ?儭?????璇?
      else if (particle.type === 'blade_slash' || particle.type === 'crit_slash') {
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = particle.width || 3;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = particle.type === 'crit_slash' ? 15 : 10;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.endX, particle.endY);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      // ?? ?蔣????郭
      else if (particle.type === 'shadow_ring' || particle.type === 'shadow_impact_wave' || 
               particle.type === 'counter_wave' || particle.type === 'shadow_wave') {
        const progress = renderProgress(particle);
        particle.radius = particle.maxRadius * progress;
        
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      // ?? ?蔣?圈??
      else if (particle.type === 'shadow_ground' || particle.type === 'shadow_mark') {
        // 瑼Ｘ蝎??臬??size 撅祆改?憒?瘝??蝙?函?璇葡??
        if (particle.size && !isNaN(particle.size) && isFinite(particle.size)) {
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size
          );
          gradient.addColorStop(0, particle.color);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (particle.endX !== undefined && particle.endY !== undefined) {
          // 雿輻蝺?皜脫?嚗?撠? endX, endY ??摮?
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = particle.width || 2;
          ctx.globalAlpha = particle.alpha || 0.7;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.endX, particle.endY);
          ctx.stroke();
        }
      }
      // ? ?湔??
      else if (particle.type === 'crit_burst' || particle.type === 'counter_flash') {
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // ??蝚西?皜脫?嚗 ????
      else if (particle.type === 'shadow_symbol' || particle.type === 'skull_symbol') {
        ctx.font = `${particle.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = particle.type === 'skull_symbol' ? 20 : 15;
        ctx.fillText(particle.text, particle.x, particle.y);
        ctx.shadowBlur = 0;
      }
      // ?? ????啁?
      else if (particle.type === 'counter_aura' || particle.type === 'shadow_counter_aura') {
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size || 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // ???琿蝎?皜脫?
      else if (particle.type === 'thunder_spark' || particle.type === 'static_spark' ||
               particle.type === 'thunder_trail' || particle.type === 'thunder_flicker' ||
               particle.type === 'thunder_afterimage' || particle.type === 'thunder_chain' ||
               particle.type === 'thunder_spark_fist' || particle.type === 'air_static' ||
               particle.type === 'thunder_impact_flash' || particle.type === 'thunder_stun_spark' ||
               particle.type === 'thunder_fist_orbit' || particle.type === 'thunder_stun_orbit' ||
               particle.type === 'thunder_ground_rune') {
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // ?? 瘞湧??剝皜脫?嚗撠撓撅?+ 撘瑞??
      else if (particle.type === 'dragon_head') {
        const s = particle.size;
        const grad = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, s);
        grad.addColorStop(0, '#E1F5FE');
        grad.addColorStop(0.4, particle.color);
        grad.addColorStop(1, 'rgba(2,119,189,0)');
        ctx.shadowColor = '#29B6F6';
        ctx.shadowBlur = 16;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, s, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // ?? 瘞湧?頨恍?皜脫?嚗?撘瑞??+ ?折鈭株嚗?
      else if (particle.type === 'dragon_body') {
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(225,245,254,0.25)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      // ?? 樴皜脫?嚗???+ 憭抒?????
      else if (particle.type === 'dragon_eye') {
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 14;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // ?? 瘞渡頂蝎?皜脫?
      else if (particle.type === 'water_drop' || particle.type === 'water_splash' ||
               particle.type === 'water_trail' || particle.type === 'water_bubble' ||
               particle.type === 'water_burst' || particle.type === 'water_glow' ||
               particle.type === 'water_pillar' || particle.type === 'water_flash' ||
               particle.type === 'water_splash_large') {
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // ?儭?憸函頂蝎?皜脫?
      else if (particle.type === 'wind_aura' || particle.type === 'wind_blade' ||
               particle.type === 'wind_ground_trail' || particle.type === 'wind_afterimage') {
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // ? 撗拍蝎?皜脫?
      else if (particle.type === 'rock_debris' || particle.type === 'earthquake_debris' ||
               particle.type === 'earthquake_stone' || particle.type === 'rock_dust' ||
               particle.type === 'earthquake_dust' || particle.type === 'rock_armor_flash') {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
      // ? 撗拍?
      else if (particle.type === 'rock_orbit') {
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // ???琿/撗拍蝚西?皜脫?
      else if (particle.type === 'thunder_symbol' || particle.type === 'rock_stun_symbol') {
        if (particle.text) {
          ctx.font = `${particle.size}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = particle.color;
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = 15;
          ctx.fillText(particle.text, particle.x, particle.y);
          ctx.shadowBlur = 0;
        }
      }
      // ?? 瘥頂蝎?皜脫?
      else if (particle.type === 'poison_mist' || particle.type === 'poison_drip') {
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // ?? 瘥頂蝚西?皜脫?
      else if (particle.type === 'poison_symbol') {
        ctx.font = `${particle.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 20;
        ctx.fillText(particle.text, particle.x, particle.y);
        ctx.shadowBlur = 0;
      }
      // ?? ??皜脫?
      else if (particle.type.includes('_ring') || particle.type.includes('_wave') || 
               particle.type.includes('_glow') || particle.type.includes('_circle')) {
        if (particle.radius !== undefined && particle.maxRadius !== undefined) {
          const progress = renderProgress(particle);
          particle.radius = particle.maxRadius * progress;
          
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = 2;
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }
      // ?? ?蝺?皜脫?嚗鋆??泵??蝑?
      else if (particle.endX !== undefined && particle.endY !== undefined) {
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = particle.width || 2;
        if (particle.type.includes('lightning') || particle.type.includes('thunder')) {
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = 10;
        }
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.endX, particle.endY);
        ctx.stroke();
        if (ctx.shadowBlur > 0) ctx.shadowBlur = 0;
      }
      // Shamisen note/canon emoji particles
      else if (particle.type === 'shamisen_note_trail' || particle.type === 'shamisen_canon_note') {
        ctx.font = particle.size + 'px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = particle.color || '#FFFFFF';
        ctx.shadowColor = particle.color || '#FFD700';
        ctx.shadowBlur = 10;
        ctx.fillText(particle.text || '♪', particle.x, particle.y);
        ctx.shadowBlur = 0;
      }
      // Shamisen expanding sound wave ring
      else if (particle.type === 'shamisen_wave_ring') {
        const progress = renderProgress(particle);
        const r = particle.radius + progress * (particle.maxRadius - particle.radius);
        const alpha = (particle.alpha || 0.5) * (particle.life / particle.maxLife);
        ctx.strokeStyle = particle.color || '#F5DEB3';
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 2 * (particle.life / particle.maxLife);
        ctx.shadowColor = particle.color || '#F5DEB3';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, Math.max(r, 1), 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
      // Shamisen bright flash circle
      else if (particle.type === 'shamisen_flash') {
        const progress = renderProgress(particle);
        const r = progress * (particle.maxRadius || 40);
        const alpha = (particle.alpha || 0.8) * (1 - progress);
        ctx.fillStyle = particle.color || '#FFFFFF';
        ctx.globalAlpha = alpha;
        ctx.shadowColor = particle.color || '#FFFFFF';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, Math.max(r, 1), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
      // Shamisen musical staff line (fading horizontal line)
      else if (particle.type === 'shamisen_staff_line') {
        const alpha = (particle.alpha || 0.4) * (particle.life / particle.maxLife);
        ctx.strokeStyle = particle.color || '#FFD700';
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 1;
        ctx.shadowColor = particle.color || '#FFD700';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x + (particle.width || 60), particle.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
      // Shamisen staccato burst particles
      else if (particle.type === 'staccato_burst' || particle.type === 'staccato_ring') {
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size || 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }      // ?? ?蝎?皜脫?嚗?摨?
      else {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size || 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    });
    
    // ? 皜脫??啣?蝎?
    this.renderEnvironmentParticles(ctx);
    
    // ? 皜脫????頠楚
    this.renderComboTrail(ctx);
    
    // ? 皜脫?銵?瘜Ｙ
    this.renderImpactRings(ctx);
    
    if (this.screenShake.intensity > 0) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }
  
  // ??========== ?啣?憓撥?寞?蝟餌絞 ========== ??
  
  // ? 閮剔蔭?嗅??啣?嚗?潛憓?摮?
  setCurrentMap(mapId) {
    this.currentMap = mapId;
  }
  
  // ? ?萄遣?啣?蝎?
  createEnvironmentParticles(canvasWidth, canvasHeight) {
    const maxParticles = 30;
    
    // 皜?頞??賊???摮?
    if (this.environmentParticles.length > maxParticles) {
      this.environmentParticles = this.environmentParticles.slice(-maxParticles);
    }
    
    // ?寞??啣?憿?瘛餃?蝎?
    if (Math.random() < 0.15) { // 15% 璈?瘥??Ｙ?
      let particle = null;
      
      switch(this.currentMap) {
        case 'grassland': // ?? - ?渲???
          if (Math.random() < 0.5) {
            // ?渲
            particle = {
              type: 'butterfly',
              x: Math.random() * canvasWidth,
              y: Math.random() * canvasHeight * 0.6,
              vx: (Math.random() - 0.5) * 30,
              vy: Math.sin(Date.now() * 0.003) * 20,
              size: 4 + Math.random() * 3,
              color: ['#FF69B4', '#FFB6C1', '#FFA500'][Math.floor(Math.random() * 3)],
              life: 5000,
              maxLife: 5000,
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 0.1
            };
          } else {
            // ?梁
            particle = {
              type: 'petal',
              x: -20,
              y: Math.random() * canvasHeight * 0.7,
              vx: 30 + Math.random() * 20,
              vy: Math.sin(Date.now() * 0.002) * 10,
              size: 3 + Math.random() * 2,
              color: ['#FFB6C1', '#FFC0CB', '#FFD700'][Math.floor(Math.random() * 3)],
              life: 8000,
              maxLife: 8000,
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 0.15
            };
          }
          break;
          
        case 'forest': // 璉格? - ?質???迫摮?
          if (Math.random() < 0.6) {
            // ?質?
            particle = {
              type: 'leaf',
              x: Math.random() * canvasWidth,
              y: -20,
              vx: (Math.random() - 0.5) * 15,
              vy: 20 + Math.random() * 15,
              size: 4 + Math.random() * 3,
              color: ['#8B4513', '#A0522D', '#CD853F', '#228B22'][Math.floor(Math.random() * 4)],
              life: 10000,
              maxLife: 10000,
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 0.12
            };
          } else {
            // ?Ｗ?摮Ｗ?
            particle = {
              type: 'spore',
              x: Math.random() * canvasWidth,
              y: canvasHeight,
              vx: (Math.random() - 0.5) * 10,
              vy: -25 - Math.random() * 15,
              size: 2 + Math.random() * 2,
              color: '#90EE90',
              life: 6000,
              maxLife: 6000,
              glow: true
            };
          }
          break;
          
        case 'castle': // ? - ?啣△???
          if (Math.random() < 0.7) {
            // ?啣△
            particle = {
              type: 'dust',
              x: Math.random() * canvasWidth,
              y: canvasHeight - 100 + Math.random() * 50,
              vx: (Math.random() - 0.5) * 20,
              vy: -10 - Math.random() * 20,
              size: 1 + Math.random() * 2,
              color: 'rgba(200, 200, 200, 0.5)',
              life: 3000,
              maxLife: 3000
            };
          } else {
            // ?Ｙ
            particle = {
              type: 'ember',
              x: Math.random() * canvasWidth,
              y: canvasHeight,
              vx: (Math.random() - 0.5) * 8,
              vy: -30 - Math.random() * 20,
              size: 2 + Math.random() * 1,
              color: '#FFA500',
              life: 4000,
              maxLife: 4000,
              glow: true
            };
          }
          break;
          
        case 'ship': // ?嫣? - 瘚琿?絲曈亦噬瘥?
          if (Math.random() < 0.5) {
            // 瘚琿
            particle = {
              type: 'mist',
              x: -50,
              y: canvasHeight * 0.6 + Math.random() * canvasHeight * 0.3,
              vx: 40 + Math.random() * 20,
              vy: (Math.random() - 0.5) * 5,
              size: 20 + Math.random() * 30,
              color: 'rgba(200, 220, 240, 0.2)',
              life: 7000,
              maxLife: 7000
            };
          } else {
            // 蝢賣?
            particle = {
              type: 'feather',
              x: Math.random() * canvasWidth,
              y: -20,
              vx: (Math.random() - 0.5) * 10,
              vy: 15 + Math.random() * 10,
              size: 3 + Math.random() * 2,
              color: '#FFFFFF',
              life: 8000,
              maxLife: 8000,
              rotation: Math.random() * Math.PI * 2,
              rotationSpeed: (Math.random() - 0.5) * 0.2
            };
          }
          break;
      }
      
      if (particle) {
        this.environmentParticles.push(particle);
      }
    }
  }
  
  // ? ?湔?啣?蝎?
  updateEnvironmentParticles(deltaTime) {
    const dt = deltaTime / 1000;
    
    this.environmentParticles = this.environmentParticles.filter(particle => {
      particle.life -= deltaTime;
      if (particle.life <= 0) return false;
      
      // ?湔雿蔭
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      
      // ??
      if (particle.rotation !== undefined && particle.rotationSpeed) {
        particle.rotation += particle.rotationSpeed;
      }
      
      // ?寞???
      if (particle.type === 'butterfly') {
        particle.vx += Math.sin(Date.now() * 0.005) * 2;
        particle.vy = Math.sin(Date.now() * 0.003) * 20;
      } else if (particle.type === 'leaf' || particle.type === 'petal' || particle.type === 'feather') {
        particle.vx += Math.sin(Date.now() * 0.004) * 0.5;
      }
      
      return true;
    });
  }
  
  // ? 皜脫??啣?蝎?
  renderEnvironmentParticles(ctx) {
    this.environmentParticles.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.life / particle.maxLife;
      
      if (particle.glow) {
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
      }
      
      ctx.translate(particle.x, particle.y);
      if (particle.rotation !== undefined) {
        ctx.rotate(particle.rotation);
      }
      
      // ?寞?憿?蝜芾ˊ
      if (particle.type === 'butterfly') {
        // ?渲蝧?
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.ellipse(-particle.size/2, 0, particle.size, particle.size*1.5, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(particle.size/2, 0, particle.size, particle.size*1.5, 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (particle.type === 'leaf' || particle.type === 'petal') {
        // ??/?梁
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, particle.size, particle.size * 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (particle.type === 'mist') {
        // ?扳除
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, particle.size, particle.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // ??耦
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    });
  }
  
  // ? ?萄遣憓撥?賭葉?寞?
  createEnhancedHitEffect(x, y, damage, isCritical = false) {
    const particleCount = isCritical ? 30 : 20;
    const baseColor = isCritical ? '#FFD700' : '#FF4500';
    
    // ?怨?
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.2;
      const speed = isCritical ? 150 + Math.random() * 100 : 100 + Math.random() * 80;
      
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        size: isCritical ? 4 + Math.random() * 3 : 3 + Math.random() * 2,
        color: baseColor,
        life: 500 + Math.random() * 300,
        maxLife: 800,
        alpha: 1,
        type: 'spark',
        gravity: 300
      });
    }
    
    // 銵?瘜Ｙ
    this.impactRings.push({
      x: x,
      y: y,
      radius: 10,
      maxRadius: isCritical ? 80 : 60,
      width: isCritical ? 4 : 3,
      color: baseColor,
      life: 400,
      maxLife: 400
    });
    
    // ?湔?憿??寞?
    if (isCritical) {
      // ???
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        this.particles.push({
          x: x,
          y: y,
          endX: x + Math.cos(angle) * 50,
          endY: y + Math.sin(angle) * 50,
          color: '#FFD700',
          life: 300,
          maxLife: 300,
          width: 3,
          type: 'line'
        });
      }
      
      this.createScreenShake(8, 150);
    } else {
      this.createScreenShake(4, 100);
    }
  }
  
  // ? ?萄遣???頠楚?寞?
  createComboTrail(x, y, comboCount) {
    const colors = [
      '#4CAF50', // 1-2 combo - 蝬?
      '#2196F3', // 3-4 combo - ??
      '#9C27B0', // 5-6 combo - 蝝?
      '#FF9800', // 7-8 combo - 璈?
      '#F44336', // 9-10 combo - 蝝?
      '#FFD700'  // 11+ combo - ??
    ];
    
    const colorIndex = Math.min(Math.floor((comboCount - 1) / 2), colors.length - 1);
    const color = colors[colorIndex];
    
    // ?賡?頠楚
    this.comboTrail.push({
      x: x,
      y: y,
      size: 15 + comboCount * 2,
      color: color,
      life: 800,
      maxLife: 800,
      glow: 10 + comboCount
    });
    
    // ????詨??啁?蝎?
    if (comboCount >= 3) {
      for (let i = 0; i < comboCount; i++) {
        const angle = (Math.PI * 2 / comboCount) * i;
        this.particles.push({
          x: x + Math.cos(angle) * 30,
          y: y + Math.sin(angle) * 30,
          vx: Math.cos(angle) * 50,
          vy: Math.sin(angle) * 50 - 30,
          size: 3 + Math.random() * 2,
          color: color,
          life: 600,
          maxLife: 600,
          alpha: 0.8,
          type: 'combo_spark'
        });
      }
    }
  }
  
  // ? ?湔???頠楚
  updateComboTrail(deltaTime) {
    this.comboTrail = this.comboTrail.filter(trail => {
      trail.life -= deltaTime;
      trail.size *= 0.98;
      return trail.life > 0;
    });
  }
  
  // ? 皜脫????頠楚
  renderComboTrail(ctx) {
    this.comboTrail.forEach(trail => {
      ctx.save();
      ctx.globalAlpha = trail.life / trail.maxLife;
      ctx.shadowColor = trail.color;
      ctx.shadowBlur = trail.glow;
      ctx.fillStyle = trail.color;
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
  
  // ? ?湔銵?瘜Ｙ
  updateImpactRings(deltaTime) {
    this.impactRings = this.impactRings.filter(ring => {
      ring.life -= deltaTime;
      ring.radius += (ring.maxRadius - ring.radius) * 0.15;
      return ring.life > 0;
    });
  }
  
  // ? 皜脫?銵?瘜Ｙ
  renderImpactRings(ctx) {
    this.impactRings.forEach(ring => {
      ctx.save();
      ctx.globalAlpha = ring.life / ring.maxLife;
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = ring.width;
      ctx.shadowColor = ring.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }
  
  // ? ?萄遣?圈銵??寞?
  createGroundImpactEffect(x, y, intensity = 1) {
    const groundY = y + 50; // ?圈擃漲
    
    // 銵?憛萄?
    for (let i = 0; i < 20 * intensity; i++) {
      const angle = Math.PI * (0.2 + Math.random() * 0.6);
      const speed = 80 + Math.random() * 120;
      
      this.particles.push({
        x: x,
        y: groundY,
        vx: Math.cos(angle) * speed * (Math.random() < 0.5 ? 1 : -1),
        vy: -Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: '#8B7355',
        life: 800,
        maxLife: 800,
        alpha: 0.7,
        gravity: 200,
        type: 'dust'
      });
    }
    
    // ?圈鋆?蝺?
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI * (0.3 + Math.random() * 0.4) * (i % 2 === 0 ? 1 : -1);
      const length = 40 + Math.random() * 40;
      
      this.particles.push({
        x: x,
        y: groundY,
        endX: x + Math.cos(angle) * length,
        endY: groundY + Math.sin(angle) * length * 0.3,
        color: '#654321',
        life: 1000,
        maxLife: 1000,
        width: 2 + Math.random(),
        type: 'crack_line'
      });
    }
    
    // 銵?瘜?
    this.impactRings.push({
      x: x,
      y: groundY,
      radius: 20,
      maxRadius: 100 * intensity,
      width: 3,
      color: '#A0826D',
      life: 500,
      maxLife: 500
    });
    
    this.createScreenShake(6 * intensity, 200);
  }

  // ? 蝎暸?摰風蝚衣??- 銝?
  createElfTalismanEffect(x, y) {
    const colors = ['#FF4444', '#9C27B0', '#42A5F5'];
    for (let c = 0; c < 3; c++) {
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 / 8) * i + c * 0.3;
        this.particles.push({
          x: x + Math.cos(angle) * 25,
          y: y - 80 + Math.sin(angle) * 15,
          vx: Math.cos(angle) * 30,
          vy: -20 - Math.random() * 30,
          size: 3 + Math.random() * 3,
          color: colors[c],
          life: 800,
          maxLife: 800,
          alpha: 0.9,
          type: 'talisman_glow'
        });
      }
    }
  }

  // ? ?恍銵??- ?梯澈畾蔣
  createStealthDashEffect(x, y, facing) {
    // Afterimage trail
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x - facing * i * 15,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        size: 6 + Math.random() * 4,
        color: '#4CAF50',
        life: 600 + i * 40,
        maxLife: 600 + i * 40,
        alpha: 0.6 - i * 0.03,
        type: 'stealth_trail'
      });
    }
    // Leaves scatter
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 60,
        vy: -30 - Math.random() * 40,
        size: 3 + Math.random() * 3,
        color: i % 2 === 0 ? '#81C784' : '#A5D6A7',
        life: 1000,
        maxLife: 1000,
        alpha: 0.8,
        type: 'leaf'
      });
    }
  }

  // ? ??怠??寞?
  createFearFireZoneEffect(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      this.particles.push({
        x: x + Math.cos(angle) * 15,
        y: y + Math.sin(angle) * 10,
        vx: Math.cos(angle) * 20,
        vy: -30 - Math.random() * 40,
        size: 4 + Math.random() * 4,
        color: i % 2 === 0 ? '#FF4444' : '#FF8800',
        life: 800,
        maxLife: 800,
        alpha: 0.8,
        type: 'fear_fire'
      });
    }
  }

  // ???琿摰風?寞?
  createLightningGuardEffect(x, y) {
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 / 10) * i;
      this.particles.push({
        x: x + Math.cos(angle) * 30,
        y: y + Math.sin(angle) * 30,
        vx: Math.cos(angle) * 40,
        vy: Math.sin(angle) * 40,
        size: 2 + Math.random() * 3,
        color: '#9C27B0',
        life: 500,
        maxLife: 500,
        alpha: 0.9,
        type: 'lightning_guard'
      });
    }
    this.createScreenShake(3, 150);
  }

  // ? ?????寞?
  createEnchantOrbEffect(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      this.particles.push({
        x: x + Math.cos(angle) * 20,
        y: y + Math.sin(angle) * 20,
        vx: Math.cos(angle) * 25,
        vy: Math.sin(angle) * 25,
        size: 4 + Math.random() * 3,
        color: '#42A5F5',
        life: 600,
        maxLife: 600,
        alpha: 0.8,
        type: 'enchant_orb'
      });
    }
  }

  // ? 蝎暸???蝞剔憌??寞?
  createRangerArrowTrailEffect(x, y) {
    this.particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      size: 2 + Math.random() * 2,
      color: Math.random() > 0.5 ? '#4CAF50' : '#FFD700',
      life: 300,
      maxLife: 300,
      alpha: 0.6,
      type: 'arrow_trail'
    });
  }

  // ? 蝎暸???蝞剔?賭葉?寞?
  createRangerArrowHitEffect(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * 60,
        vy: Math.sin(angle) * 60,
        size: 3 + Math.random() * 3,
        color: i % 2 === 0 ? '#4CAF50' : '#FFD700',
        life: 400,
        maxLife: 400,
        alpha: 0.8,
        type: 'arrow_hit'
      });
    }
  }

  // ?弩 擙株??琿???賜??
  createBloodShacklesEffect(x, y, facing) {
    // Blood burst at cast origin
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 / 10) * i;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * 50 + facing * 20,
        vy: Math.sin(angle) * 50,
        size: 3 + Math.random() * 3,
        color: i % 3 === 0 ? '#FF1744' : '#B71C1C',
        life: 500, maxLife: 500, alpha: 0.8,
        type: 'blood_burst'
      });
    }
    // Dripping chain particles
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + facing * (20 + i * 15), y: y - 10 + Math.random() * 20,
        vx: facing * 30, vy: 20 + Math.random() * 30,
        size: 2 + Math.random() * 2,
        color: '#E53935',
        life: 600, maxLife: 600, alpha: 0.7,
        type: 'blood_drip'
      });
    }
  }

  // ?? 銵???祆??賜??
  createBloodDevourEffect(x, y) {
    // Dark red vortex
    for (let layer = 0; layer < 3; layer++) {
      const radius = 30 + layer * 20;
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 / 12) * i + layer * 0.5;
        this.particles.push({
          x: x + Math.cos(angle) * radius,
          y: y + Math.sin(angle) * radius,
          vx: -Math.sin(angle) * 40,
          vy: Math.cos(angle) * 40,
          size: 4 + Math.random() * 3,
          color: layer === 0 ? '#FF1744' : (layer === 1 ? '#B71C1C' : '#4A0000'),
          life: 800, maxLife: 800, alpha: 0.7,
          type: 'blood_vortex'
        });
      }
    }
  }

  // ?弩 銵敶?頝∠??
  createBloodBoltTrailEffect(x, y) {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        size: 2 + Math.random() * 2,
        color: Math.random() > 0.5 ? '#FF1744' : '#B71C1C',
        life: 300, maxLife: 300, alpha: 0.6,
        type: 'blood_trail'
      });
    }
  }

  // ?弩 銵敶銝剔??
  createBloodBoltHitEffect(x, y) {
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 / 10) * i;
      this.particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * 70,
        vy: Math.sin(angle) * 70 - 20,
        size: 3 + Math.random() * 3,
        color: i % 2 === 0 ? '#FF1744' : '#E53935',
        life: 400, maxLife: 400, alpha: 0.8,
        type: 'blood_hit'
      });
    }
  }

  // ???砍蔣?祉??- ??脣???頝?
  createFlashCutEffect(x, y, facing) {
    // Silver slash trail
    for (let i = 0; i < 15; i++) {
      const offset = i * 14 * facing;
      this.particles.push({
        x: x + offset, y: y - 20 + (Math.random() - 0.5) * 20,
        vx: facing * (30 + Math.random() * 40),
        vy: (Math.random() - 0.5) * 30,
        size: 2 + Math.random() * 3,
        color: i % 3 === 0 ? '#ECEFF1' : i % 3 === 1 ? '#CFD8DC' : '#B0BEC5',
        life: 500, maxLife: 500,
        alpha: 0.8,
        type: 'flash_cut_trail'
      });
    }
    // Blade arc sparks
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      this.particles.push({
        x: x, y: y - 20,
        vx: Math.cos(angle) * 60 * facing,
        vy: Math.sin(angle) * 60,
        size: 1.5 + Math.random() * 2,
        color: '#FFFFFF',
        life: 300, maxLife: 300,
        alpha: 0.9,
        type: 'blade_spark'
      });
    }
  }

  // ?? 撅?繚銝???- ?函?Ｘ?蝺?+ ??
  createIaiFlashEffect(x, y) {
    // Central flash burst
    for (let layer = 0; layer < 3; layer++) {
      const radius = 30 + layer * 20;
      const count = 10 + layer * 4;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        this.particles.push({
          x: x + Math.cos(angle) * radius * 0.3,
          y: y - 20 + Math.sin(angle) * radius * 0.3,
          vx: Math.cos(angle) * (80 + layer * 30),
          vy: Math.sin(angle) * (80 + layer * 30),
          size: 2 + Math.random() * 3,
          color: layer === 0 ? '#FFFFFF' : layer === 1 ? '#ECEFF1' : '#B0BEC5',
          life: 600 - layer * 100,
          maxLife: 600,
          alpha: 0.9 - layer * 0.2,
          type: 'iai_flash'
        });
      }
    }
    // Diagonal slash sparks
    for (let i = 0; i < 12; i++) {
      const t = i / 12;
      this.particles.push({
        x: x - 80 + t * 160, y: y - 60 + t * 60,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        size: 2 + Math.random() * 2,
        color: '#FFFFFF',
        life: 700, maxLife: 700,
        alpha: 0.8,
        type: 'iai_slash_spark'
      });
    }
  }

  // Shamisen - Staccato Strike effect (SHM_001) - Enhanced
  createStaccatoStrikeEffect(x, y, facing) {
    const dir = facing === 'right' ? 1 : -1;
    const emojis = ['🎵', '🎶', '🎼'];
    const centerX = x + dir * 60;

    // Directional sound wave cone (3 arcs fanning outward)
    for (let w = 0; w < 4; w++) {
      this.particles.push({
        x: centerX + dir * w * 15,
        y: y,
        radius: 8 + w * 6,
        maxRadius: 20 + w * 12,
        expandSpeed: 50 + w * 10,
        color: w < 2 ? '#FFFFFF' : '#F5DEB3',
        life: 350 + w * 50,
        maxLife: 350 + w * 50,
        alpha: 0.6 - w * 0.1,
        type: 'shamisen_wave_ring'
      });
    }

    // Jagged white burst ring (20 particles)
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 / 20) * i;
      const speed = 90 + Math.random() * 70;
      this.particles.push({
        x: centerX,
        y: y,
        vx: Math.cos(angle) * speed + dir * 40,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: '#FFFFFF',
        life: 500 + Math.random() * 200,
        maxLife: 700,
        alpha: 0.9,
        type: 'staccato_burst'
      });
    }

    // Bright flash circle at impact point
    this.particles.push({
      x: centerX,
      y: y,
      radius: 0,
      maxRadius: 35,
      expandSpeed: 200,
      color: '#FFFFFF',
      life: 200,
      maxLife: 200,
      alpha: 0.9,
      type: 'shamisen_flash'
    });

    // Musical staff lines radiating from impact
    for (let l = 0; l < 5; l++) {
      this.particles.push({
        x: centerX - 40,
        y: y - 20 + l * 8,
        width: 80,
        color: '#FFFFFF',
        life: 400,
        maxLife: 400,
        alpha: 0.4,
        type: 'shamisen_staff_line'
      });
    }

    // Emoji note particles (8, more dramatic spread)
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      this.particles.push({
        x: centerX + dir * (20 + Math.random() * 60),
        y: y - 30 + Math.random() * 60,
        vx: Math.cos(angle) * 40 + dir * 30,
        vy: Math.sin(angle) * 40 - 20,
        size: 16 + Math.random() * 12,
        color: '#FFD700',
        text: emojis[Math.floor(Math.random() * emojis.length)],
        life: 900 + Math.random() * 400,
        maxLife: 1300,
        alpha: 1,
        type: 'shamisen_note_trail'
      });
    }

    // Impact ring (larger)
    this.particles.push({
      x: centerX,
      y: y,
      radius: 0,
      maxRadius: 60,
      color: '#FFFFFF',
      life: 500,
      maxLife: 500,
      alpha: 0.7,
      type: 'staccato_ring'
    });

    // Tiny golden sparkle dust (15 particles)
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: centerX + (Math.random() - 0.5) * 80,
        y: y + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 60,
        vy: -40 - Math.random() * 40,
        size: 1 + Math.random() * 2.5,
        color: '#FFD700',
        life: 500 + Math.random() * 300,
        maxLife: 800,
        alpha: 0.8,
        type: 'spark'
      });
    }
  }

  // Shamisen - Deadly Canon effect (SHM_002) - Enhanced
  createDeadlyCanonEffect(x, y) {
    const emojis = ['🎵', '🎶', '🎼', '♪'];

    // Central bright flash
    this.particles.push({
      x: x, y: y,
      radius: 0,
      maxRadius: 60,
      expandSpeed: 150,
      color: '#C8C8FF',
      life: 300,
      maxLife: 300,
      alpha: 0.8,
      type: 'shamisen_flash'
    });

    // Initial burst of musical notes (16, wide spread)
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 / 16) * i;
      const speed = 30 + Math.random() * 30;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 15,
        size: 20 + Math.random() * 14,
        color: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#C8C8FF' : '#FFFFFF',
        text: emojis[Math.floor(Math.random() * emojis.length)],
        life: 1800 + Math.random() * 700,
        maxLife: 2500,
        alpha: 1,
        type: 'shamisen_canon_note'
      });
    }

    // Golden spark burst (25 particles)
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 100;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: '#FFD700',
        life: 600 + Math.random() * 400,
        maxLife: 1000,
        alpha: 0.9,
        type: 'staccato_burst'
      });
    }

    // Three concentric wave rings (preview of the three waves)
    for (let r = 0; r < 3; r++) {
      this.particles.push({
        x: x, y: y,
        radius: 5,
        maxRadius: 30 + r * 25,
        expandSpeed: 40 + r * 10,
        color: r === 0 ? '#C8C8FF' : r === 1 ? '#9898FF' : '#FFD700',
        life: 500 + r * 150,
        maxLife: 500 + r * 150,
        alpha: 0.6,
        type: 'shamisen_wave_ring'
      });
    }

    // Musical staff lines forming around caster
    for (let l = 0; l < 5; l++) {
      this.particles.push({
        x: x - 50,
        y: y - 30 + l * 8,
        width: 100,
        color: '#C8C8FF',
        life: 800,
        maxLife: 800,
        alpha: 0.5,
        type: 'shamisen_staff_line'
      });
    }

    // Spiraling sparkle dots
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i;
      const dist = 20 + Math.random() * 30;
      this.particles.push({
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        vx: Math.cos(angle + Math.PI / 2) * 25,
        vy: Math.sin(angle + Math.PI / 2) * 25 - 20,
        size: 1.5 + Math.random() * 2,
        color: '#FFD700',
        life: 800 + Math.random() * 400,
        maxLife: 1200,
        alpha: 0.9,
        type: 'spark'
      });
    }
  }
}

const particleSystem = new ParticleSystem();
