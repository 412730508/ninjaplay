class MapSystem {
  constructor() {
    this.maps = {
      grassland: {
        id: 'grassland',
        name: '青翠草原',
        description: '微風輕拂的廣闊草原，最適合忍者對決的經典場地',
        icon: '🌿',
        background: this.renderGrasslandVista,
        groundColor: '#8FBC8F',
        skyColor: '#87CEEB'
      },
      forest: {
        id: 'forest',
        name: '幽暗森林',
        description: '古木參天的神秘森林，樹影搖曳增添戰鬥張力',
        icon: '🌲',
        background: this.renderForestSanctum,
        groundColor: '#654321',
        skyColor: '#2F4F4F'
      },
      castle: {
        id: 'castle',
        name: '天守閣頂',
        description: '高聳入雲的城堡屋頂，在月光下展開生死對決',
        icon: '🏯',
        background: this.renderCastleMoonrise,
        groundColor: '#696969',
        skyColor: '#191970'
      },
      ship: {
        id: 'ship',
        name: '海上甲板',
        description: '波濤洶湧的海面上，在搖擺的船甲板上決一勝負',
        icon: '⛵',
        background: this.renderCrimsonDeck,
        groundColor: '#8B4513',
        skyColor: '#4682B4'
      },
      windNinjaDojo: {
        id: 'windNinjaDojo',
        name: '風忍武道場',
        description: '風忍一族的山巔武道場——滅門之夜，烈焰焚噬，殘垣斷壁中唯餘死寂',
        icon: '🔥',
        background: this.renderWindNinjaDojo,
        groundColor: '#2c3539',
        skyColor: '#0a0f18'
      }
    };
    
    this.currentMap = 'grassland';
  }

  stableNoise(index, seed = 0) {
    const value = Math.sin(index * 127.1 + seed * 311.7) * 43758.5453123;
    return value - Math.floor(value);
  }

  stableRange(index, seed, min, max) {
    return min + this.stableNoise(index, seed) * (max - min);
  }

  stableCentered(index, seed, amplitude) {
    return (this.stableNoise(index, seed) - 0.5) * amplitude * 2;
  }

  drawTerrainRibbon(ctx, width, baseY, amplitude, frequency, color, seed = 0, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let x = 0; x <= width; x += 24) {
      const noise = Math.sin(x * frequency + seed) * amplitude;
      const detail = Math.sin(x * frequency * 2.3 + seed * 1.7) * amplitude * 0.26;
      ctx.lineTo(x, baseY + noise + detail);
    }
    ctx.lineTo(width, 8000);
    ctx.lineTo(0, 8000);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  renderGrasslandVista(ctx, width, height) {
    const time = Date.now() * 0.001;

    // ═══════════════════════════════════════════
    //  第一層：黃金時刻天空（10色漸層）
    // ═══════════════════════════════════════════
    const sky = ctx.createLinearGradient(0, 0, 0, height * 0.82);
    sky.addColorStop(0, '#0a1628');
    sky.addColorStop(0.08, '#122248');
    sky.addColorStop(0.18, '#1d3a6e');
    sky.addColorStop(0.3, '#3872a4');
    sky.addColorStop(0.42, '#68afc8');
    sky.addColorStop(0.54, '#a4d4dc');
    sky.addColorStop(0.66, '#dde8be');
    sky.addColorStop(0.76, '#f0d28a');
    sky.addColorStop(0.88, '#eba46a');
    sky.addColorStop(1, '#d8664e');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // 大氣暈染：地平線處的暖霧
    const horizonHaze = ctx.createLinearGradient(0, height * 0.38, 0, height * 0.82);
    horizonHaze.addColorStop(0, 'rgba(255,255,255,0)');
    horizonHaze.addColorStop(0.3, 'rgba(255,244,210,0.08)');
    horizonHaze.addColorStop(0.6, 'rgba(255,226,180,0.15)');
    horizonHaze.addColorStop(1, 'rgba(240,170,110,0.22)');
    ctx.fillStyle = horizonHaze;
    ctx.fillRect(0, height * 0.3, width, height * 0.55);

    // ═══════════════════════════════════════════
    //  第二層：太陽系統（多層光暈＋神光＋鏡頭光斑）
    // ═══════════════════════════════════════════
    const sunX = width * 0.76;
    const sunY = height * 0.22;

    // 最外圈大氣散射
    const scatter = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 300);
    scatter.addColorStop(0, 'rgba(255,248,220,0.16)');
    scatter.addColorStop(0.25, 'rgba(255,220,160,0.1)');
    scatter.addColorStop(0.6, 'rgba(255,195,130,0.04)');
    scatter.addColorStop(1, 'rgba(255,195,130,0)');
    ctx.fillStyle = scatter;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 300, 0, Math.PI * 2);
    ctx.fill();

    // 中層暖光暈
    const warmGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 160);
    warmGlow.addColorStop(0, 'rgba(255,252,230,0.94)');
    warmGlow.addColorStop(0.25, 'rgba(255,230,160,0.5)');
    warmGlow.addColorStop(0.55, 'rgba(255,200,115,0.18)');
    warmGlow.addColorStop(1, 'rgba(255,200,115,0)');
    ctx.fillStyle = warmGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 160, 0, Math.PI * 2);
    ctx.fill();

    // 太陽本體
    ctx.fillStyle = '#fff8e1';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 38, 0, Math.PI * 2);
    ctx.fill();

    // 太陽內圈高光
    const coreHL = ctx.createRadialGradient(sunX - 8, sunY - 8, 0, sunX, sunY, 38);
    coreHL.addColorStop(0, 'rgba(255,255,255,0.65)');
    coreHL.addColorStop(0.4, 'rgba(255,255,240,0.2)');
    coreHL.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = coreHL;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 38, 0, Math.PI * 2);
    ctx.fill();

    // 神光（God Rays）— 8束扇形光柱，帶微動
    ctx.save();
    for (let i = 0; i < 8; i++) {
      const spread = 44 + i * 28;
      const drift = Math.sin(time * 0.12 + i * 0.95) * 16;
      const alphaBase = 0.13 - i * 0.01;
      const rayGrad = ctx.createLinearGradient(sunX, sunY, sunX - 160 + i * 66 + drift, height * 0.82);
      rayGrad.addColorStop(0, `rgba(255,242,190,${Math.max(alphaBase, 0.02)})`);
      rayGrad.addColorStop(0.4, `rgba(255,220,150,${Math.max(alphaBase * 0.45, 0.01)})`);
      rayGrad.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(sunX - spread * 0.25, sunY + 30);
      ctx.lineTo(sunX + spread * 0.25, sunY + 30);
      ctx.lineTo(sunX + spread * 1.8 + drift, height * 0.82);
      ctx.lineTo(sunX - spread * 1.3 + drift, height * 0.82);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Lens Flare 光斑鏈（太陽對角方向）
    ctx.save();
    const flareLine = [
      { t: 0.12, r: 16, a: 0.07, c: '255,240,200' },
      { t: 0.22, r: 9, a: 0.11, c: '255,220,170' },
      { t: 0.34, r: 22, a: 0.05, c: '200,220,255' },
      { t: 0.44, r: 7, a: 0.13, c: '255,200,150' },
      { t: 0.58, r: 30, a: 0.035, c: '180,210,255' },
      { t: 0.72, r: 12, a: 0.08, c: '255,230,180' }
    ];
    const flareEndX = width * 0.24;
    const flareEndY = height * 0.78;
    flareLine.forEach(fp => {
      const fx = sunX + (flareEndX - sunX) * fp.t;
      const fy = sunY + (flareEndY - sunY) * fp.t;
      const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, fp.r);
      fg.addColorStop(0, `rgba(${fp.c},${fp.a})`);
      fg.addColorStop(0.6, `rgba(${fp.c},${fp.a * 0.3})`);
      fg.addColorStop(1, `rgba(${fp.c},0)`);
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(fx, fy, fp.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第三層：淡彩虹（雨後殘留）
    // ═══════════════════════════════════════════
    ctx.save();
    const rbCx = width * 0.2;
    const rbCy = height * 0.58;
    const rbR = width * 0.48;
    const rainbowColors = [
      'rgba(255,80,80,0.045)',
      'rgba(255,160,50,0.04)',
      'rgba(255,230,60,0.038)',
      'rgba(80,200,80,0.04)',
      'rgba(60,150,255,0.042)',
      'rgba(100,80,220,0.038)',
      'rgba(180,60,200,0.035)'
    ];
    for (let i = 0; i < rainbowColors.length; i++) {
      ctx.strokeStyle = rainbowColors[i];
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(rbCx, rbCy, rbR - i * 15, -Math.PI * 0.82, -Math.PI * 0.12);
      ctx.stroke();
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第四層：體積感雲彩系統
    // ═══════════════════════════════════════════
    ctx.save();
    // 遠景高空卷雲
    for (let i = 0; i < 6; i++) {
      const cx = width * (0.02 + i * 0.19) + Math.sin(time * 0.05 + i * 1.3) * 36;
      const cy = height * (0.06 + (i % 2) * 0.05);
      ctx.fillStyle = `rgba(255, 248, 230, ${0.03 + (i % 3) * 0.006})`;
      this.drawEnhancedCloud(ctx, cx, cy, 2.0 + (i % 3) * 0.4);
    }
    // 中景積雲（三層堆疊：底陰→主體→頂部高光）
    for (let i = 0; i < 5; i++) {
      const cx = width * (0.06 + i * 0.22) + Math.sin(time * 0.08 + i * 0.8) * 22;
      const cy = height * (0.14 + (i % 2) * 0.065);
      const cs = 1.4 + (i % 2) * 0.35;
      // 雲底陰影（暖色偏移）
      ctx.fillStyle = `rgba(160, 140, 120, ${0.035 + i * 0.004})`;
      this.drawEnhancedCloud(ctx, cx + 3, cy + 8, cs);
      // 雲主體
      ctx.fillStyle = `rgba(252, 246, 232, ${0.06 + (i % 2) * 0.012})`;
      this.drawEnhancedCloud(ctx, cx, cy, cs);
      // 雲頂高光（太陽側更亮）
      const sunSide = cx < sunX ? 1 : -1;
      ctx.fillStyle = `rgba(255, 255, 248, ${0.025 + (i % 2) * 0.008})`;
      this.drawEnhancedCloud(ctx, cx + sunSide * 12, cy - 5, cs * 0.65);
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第五層：遠山剪影（5層深度＋山谷霧＋雪頂）
    // ═══════════════════════════════════════════
    // 最遠山脈（藍紫朦朧）
    this.drawTerrainRibbon(ctx, width, height * 0.5, 18, 0.0025, '#4a6580', 1.2, 0.32);
    // 遠山雪頂提示
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#e0e8f0';
    ctx.beginPath();
    for (let x = 0; x <= width; x += 60) {
      const baseNoise = Math.sin(x * 0.0025 + 1.2) * 18;
      const detail = Math.sin(x * 0.0025 * 2.3 + 1.2 * 1.7) * 18 * 0.26;
      const peakY = height * 0.5 + baseNoise + detail;
      ctx.moveTo(x - 8, peakY + 6);
      ctx.lineTo(x, peakY - 2);
      ctx.lineTo(x + 8, peakY + 6);
    }
    ctx.fill();
    ctx.restore();

    // 遠山霧氣
    ctx.save();
    const mistFar = ctx.createLinearGradient(0, height * 0.48, 0, height * 0.58);
    mistFar.addColorStop(0, 'rgba(200,216,228,0)');
    mistFar.addColorStop(0.5, 'rgba(215,225,228,0.14)');
    mistFar.addColorStop(1, 'rgba(200,216,228,0)');
    ctx.fillStyle = mistFar;
    ctx.fillRect(0, height * 0.48, width, height * 0.1);
    ctx.restore();

    // 中遠山（灰綠）
    this.drawTerrainRibbon(ctx, width, height * 0.56, 26, 0.0042, '#547260', 2.5, 0.48);
    // 中景山（暖綠）
    this.drawTerrainRibbon(ctx, width, height * 0.62, 34, 0.0065, '#628b4a', 0.8, 0.7);
    // 近景丘陵帶一（亮綠）
    this.drawTerrainRibbon(ctx, width, height * 0.67, 22, 0.008, '#76a048', 1.4, 0.85);
    // 近景丘陵帶二（最近）
    this.drawTerrainRibbon(ctx, width, height * 0.71, 16, 0.011, '#84ac42', 2.8, 0.95);

    // 山谷間晨霧飄帶
    ctx.save();
    for (let i = 0; i < 7; i++) {
      const mx = width * (0.05 + i * 0.15) + Math.sin(time * 0.1 + i * 1.6) * 50;
      const my = height * (0.54 + (i % 3) * 0.04);
      ctx.fillStyle = `rgba(228, 236, 228, ${0.05 + (i % 3) * 0.012})`;
      ctx.beginPath();
      ctx.ellipse(mx, my, 200 + i * 18, 14 + i * 2.5, 0.04 * i, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第六層：遠景大樹（有枝幹剪影，非圓形）
    // ═══════════════════════════════════════════
    ctx.save();
    for (let i = 0; i < 22; i++) {
      const tx = i * (width / 21) + this.stableCentered(i, 91, 16);
      const ty = height * 0.695 + this.stableCentered(i, 92, 8);
      const s = 0.35 + this.stableNoise(i, 93) * 0.3;
      const shade = 0.5 + this.stableNoise(i, 94) * 0.25;

      ctx.save();
      ctx.translate(tx, ty);
      ctx.scale(s, s);
      // 樹幹
      ctx.fillStyle = `rgba(52, 42, 32, ${shade})`;
      ctx.fillRect(-4, -46, 8, 46);
      // 分枝
      ctx.strokeStyle = `rgba(52, 42, 32, ${shade * 0.8})`;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.quadraticCurveTo(-18, -48, -28, -56);
      ctx.moveTo(0, -36);
      ctx.quadraticCurveTo(16, -52, 24, -62);
      ctx.moveTo(0, -42);
      ctx.quadraticCurveTo(-8, -58, -14, -70);
      ctx.stroke();
      // 樹冠團簇
      ctx.fillStyle = `rgba(58, 88, 42, ${shade})`;
      const canopy = [[-20, -54, 16], [0, -64, 18], [18, -56, 15], [-10, -70, 13], [8, -68, 12]];
      canopy.forEach(c => {
        ctx.beginPath();
        ctx.arc(c[0], c[1], c[2], 0, Math.PI * 2);
        ctx.fill();
      });
      // 樹冠高光面
      ctx.fillStyle = `rgba(90, 130, 60, ${shade * 0.5})`;
      canopy.forEach(c => {
        ctx.beginPath();
        ctx.arc(c[0] + 3, c[1] - 3, c[2] * 0.55, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }
    ctx.restore();

    // 遠方飛鳥（V字形剪影群）
    ctx.save();
    ctx.strokeStyle = 'rgba(45, 55, 65, 0.24)';
    ctx.lineWidth = 1.3;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const bx = width * (0.12 + i * 0.1) + Math.sin(time * 0.25 + i * 1.8) * 18 + time * 4;
      const by = height * (0.24 + (i % 3) * 0.055) + Math.sin(time * 0.7 + i * 1.2) * 7;
      const bxMod = ((bx % (width + 120)) + width + 120) % (width + 120) - 60;
      const wing = Math.sin(time * 4.5 + i * 1.9) * 3.5;
      const bSize = 0.7 + (i % 3) * 0.2;
      ctx.beginPath();
      ctx.moveTo(bxMod - 7 * bSize, by + wing);
      ctx.quadraticCurveTo(bxMod, by - 2.5 * bSize, bxMod + 7 * bSize, by + wing);
      ctx.stroke();
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第七層：草原地面（漸層＋微紋理）
    // ═══════════════════════════════════════════
    const meadow = ctx.createLinearGradient(0, height * 0.72, 0, height);
    meadow.addColorStop(0, '#a6ca58');
    meadow.addColorStop(0.15, '#92b844');
    meadow.addColorStop(0.35, '#74a036');
    meadow.addColorStop(0.55, '#5c8828');
    meadow.addColorStop(0.75, '#44701e');
    meadow.addColorStop(1, '#285414');
    ctx.fillStyle = meadow;
    ctx.fillRect(0, height * 0.72, width, height * 0.28);

    // 草地微紋理（隨機暗斑模擬起伏）
    ctx.save();
    for (let i = 0; i < 24; i++) {
      const px = this.stableNoise(i, 700) * width;
      const py = height * 0.74 + this.stableNoise(i, 701) * height * 0.22;
      const pr = this.stableRange(i, 702, 18, 52);
      ctx.fillStyle = `rgba(30, 50, 15, ${this.stableRange(i, 703, 0.03, 0.08)})`;
      ctx.beginPath();
      ctx.ellipse(px, py, pr, pr * 0.4, this.stableNoise(i, 704) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 草原太陽方向反射
    ctx.save();
    const grassShine = ctx.createRadialGradient(sunX, height * 0.76, 0, sunX, height * 0.76, width * 0.55);
    grassShine.addColorStop(0, 'rgba(255,242,185,0.14)');
    grassShine.addColorStop(0.35, 'rgba(255,232,165,0.06)');
    grassShine.addColorStop(1, 'rgba(255,232,165,0)');
    ctx.fillStyle = grassShine;
    ctx.fillRect(0, height * 0.72, width, height * 0.28);
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第八層：蜿蜒小溪（雙岸＋倒影＋跳石）
    // ═══════════════════════════════════════════
    ctx.save();
    // 溪岸泥土邊
    ctx.strokeStyle = 'rgba(110, 85, 50, 0.18)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(width * 0.15, height * 0.73);
    ctx.bezierCurveTo(width * 0.22, height * 0.78, width * 0.28, height * 0.76, width * 0.35, height * 0.82);
    ctx.bezierCurveTo(width * 0.42, height * 0.88, width * 0.48, height * 0.84, width * 0.56, height * 0.91);
    ctx.bezierCurveTo(width * 0.62, height * 0.96, width * 0.68, height * 0.93, width * 0.78, height);
    ctx.stroke();

    // 溪水主體
    const creekGrad = ctx.createLinearGradient(width * 0.15, height * 0.73, width * 0.78, height);
    creekGrad.addColorStop(0, 'rgba(120, 185, 215, 0.38)');
    creekGrad.addColorStop(0.5, 'rgba(100, 170, 200, 0.32)');
    creekGrad.addColorStop(1, 'rgba(80, 155, 190, 0.26)');
    ctx.strokeStyle = creekGrad;
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(width * 0.15, height * 0.73);
    ctx.bezierCurveTo(width * 0.22, height * 0.78, width * 0.28, height * 0.76, width * 0.35, height * 0.82);
    ctx.bezierCurveTo(width * 0.42, height * 0.88, width * 0.48, height * 0.84, width * 0.56, height * 0.91);
    ctx.bezierCurveTo(width * 0.62, height * 0.96, width * 0.68, height * 0.93, width * 0.78, height);
    ctx.stroke();

    // 溪水高光
    ctx.strokeStyle = 'rgba(210, 238, 255, 0.2)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width * 0.16, height * 0.733);
    ctx.bezierCurveTo(width * 0.23, height * 0.783, width * 0.29, height * 0.763, width * 0.36, height * 0.823);
    ctx.bezierCurveTo(width * 0.43, height * 0.883, width * 0.49, height * 0.843, width * 0.57, height * 0.913);
    ctx.stroke();

    // 天空倒影帶
    ctx.strokeStyle = 'rgba(180, 210, 240, 0.08)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(width * 0.155, height * 0.732);
    ctx.bezierCurveTo(width * 0.225, height * 0.782, width * 0.285, height * 0.762, width * 0.355, height * 0.822);
    ctx.bezierCurveTo(width * 0.425, height * 0.882, width * 0.485, height * 0.842, width * 0.565, height * 0.912);
    ctx.stroke();

    // 跳石
    const steppingStones = [
      { t: 0.22, sz: 6 }, { t: 0.38, sz: 5 }, { t: 0.55, sz: 7 }, { t: 0.68, sz: 5 }
    ];
    steppingStones.forEach(st => {
      const stx = width * (0.15 + st.t * 0.63);
      const sty = height * (0.73 + st.t * 0.27);
      // 石影
      ctx.fillStyle = 'rgba(50, 60, 40, 0.15)';
      ctx.beginPath();
      ctx.ellipse(stx + 1, sty + 1.5, st.sz + 1, st.sz * 0.45, 0.15, 0, Math.PI * 2);
      ctx.fill();
      // 石體
      ctx.fillStyle = '#8a8272';
      ctx.beginPath();
      ctx.ellipse(stx, sty, st.sz, st.sz * 0.5, 0.15, 0, Math.PI * 2);
      ctx.fill();
      // 石頂光
      ctx.fillStyle = 'rgba(210, 205, 195, 0.3)';
      ctx.beginPath();
      ctx.ellipse(stx - 1, sty - 1, st.sz * 0.5, st.sz * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // 波光粼粼
    for (let i = 0; i < 14; i++) {
      const sparkleT = 0.04 + i * 0.07;
      const sx = width * (0.15 + sparkleT * 0.63) + this.stableCentered(i, 300, 7);
      const sy = height * (0.73 + sparkleT * 0.27) + Math.sin(time * 3.5 + i * 2.2) * 2;
      const sparkleA = 0.18 + Math.sin(time * 4.5 + i * 1.5) * 0.12;
      ctx.fillStyle = `rgba(255, 255, 255, ${sparkleA})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 2.5, 1, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 溪邊蜻蜓
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const dt = 0.2 + i * 0.25;
      const dBaseX = width * (0.15 + dt * 0.63);
      const dBaseY = height * (0.73 + dt * 0.27) - 18;
      const dfx = dBaseX + Math.sin(time * 1.2 + i * 3) * 24;
      const dfy = dBaseY + Math.sin(time * 1.8 + i * 2.2) * 12 + Math.cos(time * 0.6 + i) * 6;
      const dAngle = Math.sin(time * 0.9 + i) * 0.4;
      const dWing = Math.sin(time * 12 + i * 3);

      ctx.save();
      ctx.translate(dfx, dfy);
      ctx.rotate(dAngle);
      ctx.globalAlpha = 0.55;

      // 身體
      ctx.fillStyle = i === 0 ? '#2288aa' : i === 1 ? '#44aa44' : '#cc6644';
      ctx.fillRect(-1, -6, 2, 12);

      // 翅膀
      ctx.fillStyle = 'rgba(200, 230, 255, 0.4)';
      ctx.save();
      ctx.scale(1, 0.3 + dWing * 0.7);
      ctx.beginPath();
      ctx.ellipse(-5, -2, 8, 3, -0.2, 0, Math.PI * 2);
      ctx.ellipse(5, -2, 8, 3, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.scale(1, 0.3 - dWing * 0.3);
      ctx.beginPath();
      ctx.ellipse(-4, 2, 6, 2.5, -0.15, 0, Math.PI * 2);
      ctx.ellipse(4, 2, 6, 2.5, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第九層：古橡樹（場景焦點）
    // ═══════════════════════════════════════════
    ctx.save();
    const oakX = width * 0.22;
    const oakBase = height * 0.72;

    // 樹影
    ctx.fillStyle = 'rgba(20, 30, 10, 0.12)';
    ctx.beginPath();
    ctx.ellipse(oakX + 30, oakBase + 4, 72, 12, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // 主幹
    const trunkGrad = ctx.createLinearGradient(oakX - 14, oakBase, oakX + 14, oakBase);
    trunkGrad.addColorStop(0, '#3e2e1e');
    trunkGrad.addColorStop(0.3, '#5c4832');
    trunkGrad.addColorStop(0.7, '#4a3826');
    trunkGrad.addColorStop(1, '#352818');
    ctx.fillStyle = trunkGrad;
    ctx.beginPath();
    ctx.moveTo(oakX - 14, oakBase);
    ctx.quadraticCurveTo(oakX - 16, oakBase - 50, oakX - 10, oakBase - 90);
    ctx.quadraticCurveTo(oakX - 6, oakBase - 110, oakX, oakBase - 120);
    ctx.quadraticCurveTo(oakX + 6, oakBase - 110, oakX + 10, oakBase - 90);
    ctx.quadraticCurveTo(oakX + 16, oakBase - 50, oakX + 14, oakBase);
    ctx.closePath();
    ctx.fill();

    // 樹幹紋理
    ctx.strokeStyle = 'rgba(30, 20, 10, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const ty = oakBase - 15 - i * 16;
      ctx.beginPath();
      ctx.moveTo(oakX - 10 + i * 0.5, ty);
      ctx.quadraticCurveTo(oakX + (i % 2 ? 3 : -3), ty - 8, oakX + 10 - i * 0.5, ty - 3);
      ctx.stroke();
    }

    // 主枝（5條大枝）
    ctx.strokeStyle = '#4a3826';
    ctx.lineCap = 'round';
    const branches = [
      { sx: 0, sy: -110, ex: -55, ey: -155, lw: 7 },
      { sx: -3, sy: -105, ex: -80, ey: -128, lw: 6 },
      { sx: 2, sy: -108, ex: 60, ey: -158, lw: 6.5 },
      { sx: 4, sy: -100, ex: 82, ey: -130, lw: 5.5 },
      { sx: 0, sy: -118, ex: 8, ey: -168, lw: 5 }
    ];
    branches.forEach(b => {
      ctx.lineWidth = b.lw;
      ctx.beginPath();
      ctx.moveTo(oakX + b.sx, oakBase + b.sy);
      ctx.quadraticCurveTo(
        oakX + (b.sx + b.ex) * 0.5 + (b.ex > 0 ? 8 : -8),
        oakBase + (b.sy + b.ey) * 0.5 - 10,
        oakX + b.ex, oakBase + b.ey
      );
      ctx.stroke();
    });

    // 樹冠（多層團簇，有光暗面）
    const crownClusters = [
      { x: -60, y: -142, r: 28 }, { x: -38, y: -158, r: 32 }, { x: -12, y: -168, r: 30 },
      { x: 15, y: -165, r: 34 }, { x: 42, y: -155, r: 30 }, { x: 62, y: -140, r: 26 },
      { x: -72, y: -122, r: 24 }, { x: 78, y: -124, r: 22 },
      { x: -28, y: -172, r: 22 }, { x: 28, y: -174, r: 24 }, { x: 0, y: -178, r: 20 },
      { x: -50, y: -160, r: 20 }, { x: 55, y: -162, r: 18 }
    ];
    // 樹冠陰影面
    crownClusters.forEach(c => {
      ctx.fillStyle = 'rgba(32, 58, 22, 0.85)';
      ctx.beginPath();
      ctx.arc(oakX + c.x, oakBase + c.y + 3, c.r, 0, Math.PI * 2);
      ctx.fill();
    });
    // 樹冠主體
    crownClusters.forEach(c => {
      const leafGrad = ctx.createRadialGradient(
        oakX + c.x + 4, oakBase + c.y - 4, 0,
        oakX + c.x, oakBase + c.y, c.r
      );
      leafGrad.addColorStop(0, '#6aaa38');
      leafGrad.addColorStop(0.5, '#4e8a28');
      leafGrad.addColorStop(1, '#3a6e1e');
      ctx.fillStyle = leafGrad;
      ctx.beginPath();
      ctx.arc(oakX + c.x, oakBase + c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    });
    // 樹冠太陽側高光
    crownClusters.forEach(c => {
      ctx.fillStyle = 'rgba(140, 200, 70, 0.28)';
      ctx.beginPath();
      ctx.arc(oakX + c.x + 5, oakBase + c.y - 5, c.r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    });
    // 樹冠邊緣亮光碎點（陽光透過樹葉）
    for (let i = 0; i < 16; i++) {
      const lx = oakX + this.stableCentered(i, 800, 70);
      const ly = oakBase - 125 - this.stableNoise(i, 801) * 58;
      const lr = this.stableRange(i, 802, 2, 5);
      const la = 0.15 + Math.sin(time * 2.8 + i * 1.4) * 0.08;
      ctx.fillStyle = `rgba(180, 230, 90, ${la})`;
      ctx.beginPath();
      ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      ctx.fill();
    }

    // 樹根
    ctx.fillStyle = '#3e2e1e';
    const roots = [[-22, 0, -38, 6], [-16, 2, -28, 8], [14, 0, 30, 6], [18, 2, 36, 8]];
    roots.forEach(r => {
      ctx.beginPath();
      ctx.moveTo(oakX + r[0], oakBase + r[1]);
      ctx.quadraticCurveTo(oakX + (r[0] + r[2]) * 0.5, oakBase + r[1] + 3, oakX + r[2], oakBase + r[3]);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#3e2e1e';
      ctx.stroke();
    });
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十層：步道
    // ═══════════════════════════════════════════
    ctx.save();
    const pathGrad = ctx.createLinearGradient(width * 0.48, height * 0.72, width * 0.54, height);
    pathGrad.addColorStop(0, 'rgba(195, 172, 115, 0.12)');
    pathGrad.addColorStop(0.5, 'rgba(162, 135, 76, 0.2)');
    pathGrad.addColorStop(1, 'rgba(118, 86, 38, 0.26)');
    ctx.fillStyle = pathGrad;
    ctx.beginPath();
    ctx.moveTo(width * 0.47, height * 0.72);
    ctx.quadraticCurveTo(width * 0.51, height * 0.78, width * 0.53, height * 0.84);
    ctx.quadraticCurveTo(width * 0.56, height * 0.92, width * 0.58, height);
    ctx.lineTo(width * 0.42, height);
    ctx.quadraticCurveTo(width * 0.44, height * 0.91, width * 0.45, height * 0.84);
    ctx.quadraticCurveTo(width * 0.44, height * 0.78, width * 0.47, height * 0.72);
    ctx.closePath();
    ctx.fill();
    // 步道碎石斑點
    for (let i = 0; i < 10; i++) {
      const psx = width * (0.44 + this.stableNoise(i, 710) * 0.12);
      const psy = height * (0.75 + this.stableNoise(i, 711) * 0.22);
      ctx.fillStyle = `rgba(140, 120, 80, ${this.stableRange(i, 712, 0.06, 0.14)})`;
      ctx.beginPath();
      ctx.arc(psx, psy, this.stableRange(i, 713, 1.5, 3.5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十一層：散落石頭
    // ═══════════════════════════════════════════
    ctx.save();
    for (let i = 0; i < 10; i++) {
      const rx = width * (0.05 + this.stableNoise(i, 400) * 0.88);
      const ry = height - 92 + this.stableCentered(i, 401, 12);
      const rw = this.stableRange(i, 402, 5, 16);
      const rh = this.stableRange(i, 403, 3, 9);

      ctx.fillStyle = `rgba(35, 45, 25, ${this.stableRange(i, 404, 0.1, 0.18)})`;
      ctx.beginPath();
      ctx.ellipse(rx + 2, ry + 2, rw + 1, rh * 0.5, 0.1, 0, Math.PI * 2);
      ctx.fill();

      const stG = ctx.createLinearGradient(rx - rw, ry - rh, rx + rw, ry + rh);
      stG.addColorStop(0, '#a09888');
      stG.addColorStop(0.4, '#847c6e');
      stG.addColorStop(1, '#625a4e');
      ctx.fillStyle = stG;
      ctx.beginPath();
      ctx.ellipse(rx, ry, rw, rh, 0.12 * i, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(225, 220, 205, 0.2)';
      ctx.beginPath();
      ctx.ellipse(rx - rw * 0.2, ry - rh * 0.3, rw * 0.35, rh * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十二層：三層搖曳草叢（曲線葉片＋風波協調）
    // ═══════════════════════════════════════════
    // 風波函數：所有草的搖擺有統一的波浪方向感
    const windWave = (x, t) => Math.sin(x * 0.008 + t * 1.6) * 0.5 + Math.sin(x * 0.003 + t * 0.8) * 0.5;

    // 深色底層草
    for (let i = 0; i < 110; i++) {
      const x = i * (width / 109) + this.stableCentered(i, 94, 10);
      const h = this.stableRange(i, 95, 20, 42);
      const w = this.stableRange(i, 96, 1.5, 3.5);
      const sway = windWave(x, time) * 0.14 + Math.sin(time * 1.8 + i * 0.45) * 0.04;
      ctx.save();
      ctx.translate(x, height - 98);
      ctx.rotate(sway);
      const gB = ctx.createLinearGradient(0, -h, 0, 0);
      gB.addColorStop(0, '#90c84c');
      gB.addColorStop(0.6, '#5a8a28');
      gB.addColorStop(1, '#3e6818');
      ctx.fillStyle = gB;
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.quadraticCurveTo(-w * 0.35, -h * 0.55, 0, -h);
      ctx.quadraticCurveTo(w * 0.35, -h * 0.55, w / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 中層草
    for (let i = 0; i < 80; i++) {
      const x = i * (width / 79) + this.stableCentered(i, 104, 13);
      const h = this.stableRange(i, 105, 14, 32);
      const w = this.stableRange(i, 106, 1.1, 2.6);
      const sway = windWave(x, time) * 0.18 + Math.sin(time * 2.1 + i * 0.6) * 0.05;
      ctx.save();
      ctx.translate(x, height - 98);
      ctx.rotate(sway);
      ctx.fillStyle = i % 3 === 0 ? '#a2d850' : i % 3 === 1 ? '#78b834' : '#60a028';
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.quadraticCurveTo(-w * 0.2, -h * 0.5, 0, -h);
      ctx.quadraticCurveTo(w * 0.2, -h * 0.5, w / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 前景亮草（太陽側高亮＋露珠偶爾閃爍）
    for (let i = 0; i < 55; i++) {
      const x = i * (width / 54) + this.stableCentered(i, 114, 15);
      const h = this.stableRange(i, 115, 10, 26);
      const w = this.stableRange(i, 116, 0.9, 2);
      const sway = windWave(x, time) * 0.22 + Math.sin(time * 2.5 + i * 0.75) * 0.06;
      const sunProx = Math.max(0, 1 - Math.abs(x - sunX) / (width * 0.5));
      ctx.save();
      ctx.translate(x, height - 98);
      ctx.rotate(sway);
      ctx.fillStyle = sunProx > 0.25 ? '#ccea70' : '#b4d85c';
      ctx.beginPath();
      ctx.moveTo(-w / 2, 0);
      ctx.quadraticCurveTo(0, -h * 0.5, 0, -h);
      ctx.quadraticCurveTo(0, -h * 0.5, w / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 露珠（部分草尖）
      if (i % 7 === 0) {
        const dewX = x + Math.sin(sway) * h * 0.1;
        const dewY = height - 98 - h + 2;
        const dewAlpha = 0.2 + Math.sin(time * 3 + i * 2) * 0.15;
        ctx.fillStyle = `rgba(220, 245, 255, ${dewAlpha})`;
        ctx.beginPath();
        ctx.arc(dewX, dewY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 風的視覺痕跡（淡白色弧線掠過草面）
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const wsx = ((time * 80 + i * width * 0.35) % (width * 1.4)) - width * 0.2;
      const wsy = height - 92 + i * 8;
      ctx.beginPath();
      ctx.moveTo(wsx, wsy);
      ctx.quadraticCurveTo(wsx + 60, wsy - 6 - i * 2, wsx + 140, wsy + 2);
      ctx.stroke();
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十三層：野花群落（含花莖＋光暈＋旋轉花瓣）
    // ═══════════════════════════════════════════
    const bloomPalette = [
      { petals: '#ffda6b', center: '#e6a820', glow: 'rgba(255,218,107,0.2)' },
      { petals: '#f49cc8', center: '#d14f82', glow: 'rgba(244,156,200,0.18)' },
      { petals: '#c4aaff', center: '#7b5ec2', glow: 'rgba(196,170,255,0.16)' },
      { petals: '#ffb06b', center: '#d27020', glow: 'rgba(255,176,107,0.18)' },
      { petals: '#ff8a8a', center: '#c23c3c', glow: 'rgba(255,138,138,0.16)' },
      { petals: '#88ddff', center: '#3898c8', glow: 'rgba(136,221,255,0.14)' },
      { petals: '#ffe066', center: '#cc9900', glow: 'rgba(255,224,102,0.18)' }
    ];
    for (let i = 0; i < 38; i++) {
      const fx = width * (0.03 + this.stableNoise(i, 97) * 0.94);
      const fy = height - 88 + this.stableCentered(i, 98, 9);
      const bloom = bloomPalette[i % bloomPalette.length];
      const fSway = Math.sin(time * 1.4 + i * 0.85) * windWave(fx, time) * 3;

      // 花莖
      ctx.strokeStyle = '#4e7a26';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(fx, fy + 10);
      ctx.quadraticCurveTo(fx + fSway * 0.6, fy + 4, fx + fSway * 0.4, fy);
      ctx.stroke();

      // 葉子（部分花有）
      if (i % 4 === 0) {
        ctx.fillStyle = '#5a8a22';
        ctx.beginPath();
        ctx.ellipse(fx + fSway * 0.3 + 3, fy + 5, 3, 1.5, 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // 花瓣光暈
      ctx.fillStyle = bloom.glow;
      ctx.beginPath();
      ctx.arc(fx + fSway * 0.4, fy, 7, 0, Math.PI * 2);
      ctx.fill();

      // 花瓣
      const petalCount = 4 + (i % 3);
      ctx.fillStyle = bloom.petals;
      for (let j = 0; j < petalCount; j++) {
        const angle = (Math.PI * 2 * j) / petalCount + time * 0.06;
        ctx.beginPath();
        ctx.ellipse(
          fx + fSway * 0.4 + Math.cos(angle) * 3.4,
          fy + Math.sin(angle) * 3.4,
          3, 1.8, angle * 0.45, 0, Math.PI * 2
        );
        ctx.fill();
      }

      // 花蕊
      ctx.fillStyle = bloom.center;
      ctx.beginPath();
      ctx.arc(fx + fSway * 0.4, fy, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // ═══════════════════════════════════════════
    //  第十四層：飄散蒲公英絮＋花瓣碎片
    // ═══════════════════════════════════════════
    ctx.save();
    // 蒲公英
    for (let i = 0; i < 16; i++) {
      const phase = this.stableNoise(i, 500) * Math.PI * 2;
      const bx = this.stableNoise(i, 501) * width;
      const by = height * (0.3 + this.stableNoise(i, 502) * 0.38);
      const dx = bx + Math.sin(time * 0.35 + phase) * 55 + time * (7 + i * 1.2);
      const dy = by + Math.sin(time * 0.65 + phase) * 22 + Math.cos(time * 0.28 + i) * 10;
      const dxM = ((dx % (width + 130)) + width + 130) % (width + 130) - 65;
      const sA = 0.32 + Math.sin(time * 1.1 + i) * 0.12;

      ctx.fillStyle = `rgba(255, 252, 242, ${sA})`;
      ctx.beginPath();
      ctx.arc(dxM, dy, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 250, 238, ${sA * 0.55})`;
      ctx.lineWidth = 0.4;
      for (let j = 0; j < 7; j++) {
        const fa = (Math.PI * 2 * j) / 7 + time * 0.18 + i;
        ctx.beginPath();
        ctx.moveTo(dxM, dy);
        ctx.lineTo(dxM + Math.cos(fa) * 5.5, dy + Math.sin(fa) * 5.5);
        ctx.stroke();
      }
    }

    // 飄散花瓣
    const petalColors = ['rgba(255, 200, 210, 0.4)', 'rgba(255, 230, 160, 0.35)', 'rgba(220, 200, 255, 0.35)'];
    for (let i = 0; i < 10; i++) {
      const px = ((this.stableNoise(i, 520) * width + time * (14 + i * 2.2)) % (width + 100)) - 50;
      const py = height * (0.45 + this.stableNoise(i, 521) * 0.28) + Math.sin(time * 0.8 + i * 2) * 20;
      const pRot = time * 1.2 + i * 1.5;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(pRot);
      ctx.fillStyle = petalColors[i % petalColors.length];
      ctx.beginPath();
      ctx.ellipse(0, 0, 4, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十五層：蝴蝶（帶花紋翅膀＋拍動軌跡）
    // ═══════════════════════════════════════════
    ctx.save();
    const bfColors = [
      { wing: '#f47cc6', inner: '#ff9ed8', spot: '#d4508a' },
      { wing: '#ffb84d', inner: '#ffd080', spot: '#e0882a' },
      { wing: '#78ccee', inner: '#a8e0ff', spot: '#4a9ccc' },
      { wing: '#c49aff', inner: '#dcc0ff', spot: '#9060d0' },
      { wing: '#ff8866', inner: '#ffaa88', spot: '#dd5533' }
    ];
    for (let i = 0; i < 5; i++) {
      const bx = width * (0.1 + i * 0.18) + Math.sin(time * 0.55 + i * 2.2) * 75;
      const by = height * (0.5 + (i % 2) * 0.14) + Math.sin(time * 0.85 + i * 1.7) * 38;
      const wFlap = Math.sin(time * 5.5 + i * 2.3);
      const bAngle = Math.sin(time * 0.75 + i) * 0.28;
      const bc = bfColors[i];

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(bAngle);
      ctx.globalAlpha = 0.62;

      // 拍動軌跡（殘影）
      if (Math.abs(wFlap) > 0.7) {
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = bc.wing;
        ctx.save();
        ctx.scale(1, 0.4 + wFlap * 0.3);
        ctx.beginPath();
        ctx.ellipse(-4.5, 0, 7, 10, -0.25, 0, Math.PI * 2);
        ctx.ellipse(4.5, 0, 7, 10, 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.globalAlpha = 0.62;
      }

      // 左翅
      ctx.fillStyle = bc.wing;
      ctx.save();
      ctx.scale(1, 0.35 + wFlap * 0.65);
      ctx.beginPath();
      ctx.ellipse(-4, 0, 7, 10, -0.25, 0, Math.PI * 2);
      ctx.fill();
      // 翅膀內斑
      ctx.fillStyle = bc.inner;
      ctx.beginPath();
      ctx.ellipse(-5, -1, 3.5, 5, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = bc.spot;
      ctx.beginPath();
      ctx.arc(-3, 3, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 右翅
      ctx.fillStyle = bc.wing;
      ctx.save();
      ctx.scale(1, 0.35 + wFlap * 0.65);
      ctx.beginPath();
      ctx.ellipse(4, 0, 7, 10, 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = bc.inner;
      ctx.beginPath();
      ctx.ellipse(5, -1, 3.5, 5, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = bc.spot;
      ctx.beginPath();
      ctx.arc(3, 3, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 翅膀亮點
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.save();
      ctx.scale(1, 0.35 + wFlap * 0.65);
      ctx.beginPath();
      ctx.arc(-3, -3, 1.8, 0, Math.PI * 2);
      ctx.arc(3, -3, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 身體＋觸鬚
      ctx.fillStyle = 'rgba(50, 35, 25, 0.65)';
      ctx.fillRect(-0.7, -5, 1.4, 10);
      ctx.strokeStyle = 'rgba(50, 35, 25, 0.45)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.quadraticCurveTo(-3, -9, -5, -10);
      ctx.moveTo(0, -5);
      ctx.quadraticCurveTo(3, -9, 5, -10);
      ctx.stroke();

      ctx.restore();
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十六層：夕陽螢光微粒＋光塵
    // ═══════════════════════════════════════════
    ctx.save();
    for (let i = 0; i < 24; i++) {
      const gx = this.stableNoise(i, 600) * width;
      const gy = height * (0.55 + this.stableNoise(i, 601) * 0.32);
      const pulse = 0.1 + Math.sin(time * 2.2 + i * 1.2) * 0.08;
      const drift = Math.sin(time * 0.5 + i * 1.8) * 14;
      const rise = Math.sin(time * 0.3 + i * 0.9) * 6;
      const glowR = 3.5 + Math.sin(time * 1.6 + i) * 2;

      const pg = ctx.createRadialGradient(gx + drift, gy + rise, 0, gx + drift, gy + rise, glowR);
      pg.addColorStop(0, `rgba(255, 232, 165, ${pulse})`);
      pg.addColorStop(0.5, `rgba(255, 215, 130, ${pulse * 0.4})`);
      pg.addColorStop(1, 'rgba(255, 215, 130, 0)');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(gx + drift, gy + rise, glowR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十七層：古橡樹下的地面光斑（樹蔭透光）
    // ═══════════════════════════════════════════
    ctx.save();
    for (let i = 0; i < 12; i++) {
      const lx = oakX + this.stableCentered(i, 850, 65);
      const ly = oakBase + 2 + this.stableNoise(i, 851) * 16;
      const lr = this.stableRange(i, 852, 4, 12);
      const la = 0.06 + Math.sin(time * 1.5 + i * 1.8) * 0.03;
      ctx.fillStyle = `rgba(255, 245, 180, ${la})`;
      ctx.beginPath();
      ctx.ellipse(lx, ly, lr, lr * 0.5, this.stableNoise(i, 853), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十八層：色差效果（Chromatic Aberration 邊緣）
    // ═══════════════════════════════════════════
    ctx.save();
    // 螢幕邊緣微暖色偏移
    const caTop = ctx.createLinearGradient(0, 0, 0, height * 0.06);
    caTop.addColorStop(0, 'rgba(255, 200, 150, 0.04)');
    caTop.addColorStop(1, 'rgba(255, 200, 150, 0)');
    ctx.fillStyle = caTop;
    ctx.fillRect(0, 0, width, height * 0.06);
    const caBot = ctx.createLinearGradient(0, height * 0.94, 0, height);
    caBot.addColorStop(0, 'rgba(255, 200, 150, 0)');
    caBot.addColorStop(1, 'rgba(255, 180, 120, 0.06)');
    ctx.fillStyle = caBot;
    ctx.fillRect(0, height * 0.94, width, height * 0.06);
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十九層：氛圍暈映 (Cinematic Vignette)
    // ═══════════════════════════════════════════
    ctx.save();
    const vignette = ctx.createRadialGradient(
      width * 0.52, height * 0.54, width * 0.16,
      width * 0.52, height * 0.54, width * 0.92
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.65, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.85, 'rgba(6, 10, 3, 0.18)');
    vignette.addColorStop(1, 'rgba(6, 10, 3, 0.42)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  renderForestSanctum(ctx, width, height) {
    const time = Date.now() * 0.001;

    // ═══════════════════════════════════════════
    //  第一層：深夜森林天空（8色漸層）
    // ═══════════════════════════════════════════
    const sky = ctx.createLinearGradient(0, 0, 0, height * 0.78);
    sky.addColorStop(0, '#020810');
    sky.addColorStop(0.1, '#051220');
    sky.addColorStop(0.22, '#081a2e');
    sky.addColorStop(0.36, '#0a2438');
    sky.addColorStop(0.5, '#0c2e3a');
    sky.addColorStop(0.64, '#0e3434');
    sky.addColorStop(0.8, '#12382a');
    sky.addColorStop(1, '#163822');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // 天空微光暈染（月光散射）
    const skyHaze = ctx.createRadialGradient(width * 0.68, height * 0.1, 0, width * 0.68, height * 0.18, width * 0.7);
    skyHaze.addColorStop(0, 'rgba(70, 110, 140, 0.08)');
    skyHaze.addColorStop(0.3, 'rgba(50, 90, 110, 0.04)');
    skyHaze.addColorStop(1, 'rgba(50, 90, 110, 0)');
    ctx.fillStyle = skyHaze;
    ctx.fillRect(0, 0, width, height * 0.7);

    // 極光暗示（遠方森林上空微弱極光帶）
    ctx.save();
    ctx.globalAlpha = 0.04;
    for (let i = 0; i < 3; i++) {
      const auroraX = width * (0.12 + i * 0.32);
      const auroraY = height * 0.07;
      const aWave = Math.sin(time * 0.1 + i * 2.2) * 45;
      const aH = height * 0.04 + Math.sin(time * 0.18 + i * 1.5) * 8;
      const aGrad = ctx.createRadialGradient(auroraX + aWave, auroraY, 0, auroraX + aWave, auroraY, width * 0.2);
      const aColors = [
        ['rgba(60, 220, 140, 0.7)', 'rgba(60, 220, 140, 0.12)'],
        ['rgba(50, 140, 210, 0.6)', 'rgba(50, 140, 210, 0.1)'],
        ['rgba(130, 70, 200, 0.5)', 'rgba(130, 70, 200, 0.08)']
      ];
      aGrad.addColorStop(0, aColors[i][0]);
      aGrad.addColorStop(0.5, aColors[i][1]);
      aGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = aGrad;
      ctx.beginPath();
      ctx.ellipse(auroraX + aWave, auroraY, width * 0.18, aH, 0.12 * i, 0, Math.PI * 2);
      ctx.fill();
    }
    // 極光垂直光簾
    for (let i = 0; i < 5; i++) {
      const curtainX = width * (0.15 + i * 0.18) + Math.sin(time * 0.08 + i * 1.8) * 30;
      const curtainGrad = ctx.createLinearGradient(curtainX, 0, curtainX, height * 0.18);
      const cHue = i % 2 === 0 ? '80, 200, 150' : '60, 130, 200';
      curtainGrad.addColorStop(0, `rgba(${cHue}, 0.5)`);
      curtainGrad.addColorStop(0.5, `rgba(${cHue}, 0.15)`);
      curtainGrad.addColorStop(1, `rgba(${cHue}, 0)`);
      ctx.fillStyle = curtainGrad;
      ctx.fillRect(curtainX - 4, 0, 8 + Math.sin(time * 0.3 + i) * 2, height * 0.18);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第二層：月亮系統（月暈＋月面坑紋＋月光柱）
    // ═══════════════════════════════════════════
    const moonX = width * 0.72;
    const moonY = height * 0.15;

    // 最外層月暈
    const outerHalo = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 220);
    outerHalo.addColorStop(0, 'rgba(180, 210, 240, 0.12)');
    outerHalo.addColorStop(0.3, 'rgba(140, 180, 210, 0.06)');
    outerHalo.addColorStop(0.6, 'rgba(100, 150, 180, 0.02)');
    outerHalo.addColorStop(1, 'rgba(100, 150, 180, 0)');
    ctx.fillStyle = outerHalo;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 220, 0, Math.PI * 2);
    ctx.fill();

    // 中層月暈
    const innerHalo = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 110);
    innerHalo.addColorStop(0, 'rgba(220, 240, 255, 0.85)');
    innerHalo.addColorStop(0.35, 'rgba(180, 210, 235, 0.3)');
    innerHalo.addColorStop(0.7, 'rgba(140, 180, 210, 0.08)');
    innerHalo.addColorStop(1, 'rgba(140, 180, 210, 0)');
    ctx.fillStyle = innerHalo;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 110, 0, Math.PI * 2);
    ctx.fill();

    // 月球本體
    const moonGrad = ctx.createRadialGradient(moonX - 8, moonY - 8, 0, moonX, moonY, 36);
    moonGrad.addColorStop(0, '#f0f5ff');
    moonGrad.addColorStop(0.5, '#dce8f5');
    moonGrad.addColorStop(1, '#c8d8ea');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 36, 0, Math.PI * 2);
    ctx.fill();

    // 月面坑紋
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(180, 195, 210, 0.3)';
    const craters = [
      { dx: -8, dy: -4, r: 6 }, { dx: 6, dy: -10, r: 4 }, { dx: 10, dy: 4, r: 5 },
      { dx: -4, dy: 8, r: 7 }, { dx: 14, dy: -2, r: 3 }, { dx: -12, dy: 2, r: 4 }
    ];
    craters.forEach(c => {
      ctx.beginPath();
      ctx.arc(moonX + c.dx, moonY + c.dy, c.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();

    // 月光柱（從月亮向下投射）
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const drift = Math.sin(time * 0.08 + i * 1.2) * 14;
      const spread = 30 + i * 22;
      const a = 0.035 - i * 0.004;
      const rayG = ctx.createLinearGradient(moonX, moonY + 36, moonX + drift + i * 15 - 30, height * 0.78);
      rayG.addColorStop(0, `rgba(160, 200, 230, ${Math.max(a, 0.008)})`);
      rayG.addColorStop(0.4, `rgba(130, 180, 210, ${Math.max(a * 0.4, 0.003)})`);
      rayG.addColorStop(1, 'rgba(130, 180, 210, 0)');
      ctx.fillStyle = rayG;
      ctx.beginPath();
      ctx.moveTo(moonX - spread * 0.15, moonY + 36);
      ctx.lineTo(moonX + spread * 0.15, moonY + 36);
      ctx.lineTo(moonX + spread * 1.5 + drift, height * 0.78);
      ctx.lineTo(moonX - spread * 1.2 + drift, height * 0.78);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第三層：星空（閃爍＋大小分層＋星雲帶）
    // ═══════════════════════════════════════════
    // 淡星雲帶
    ctx.save();
    const nebula = ctx.createRadialGradient(width * 0.3, height * 0.1, 20, width * 0.35, height * 0.12, 200);
    nebula.addColorStop(0, 'rgba(60, 40, 90, 0.04)');
    nebula.addColorStop(0.5, 'rgba(40, 60, 80, 0.025)');
    nebula.addColorStop(1, 'rgba(40, 60, 80, 0)');
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, width, height * 0.35);
    ctx.restore();

    // 星星
    for (let i = 0; i < 50; i++) {
      const sx = this.stableNoise(i, 101) * width;
      const sy = this.stableNoise(i, 102) * height * 0.45;
      const distToMoon = Math.sqrt((sx - moonX) ** 2 + (sy - moonY) ** 2);
      if (distToMoon < 100) continue;
      const sPulse = 0.3 + Math.sin(time * (1.0 + (i % 5) * 0.2) + i * 1.3) * 0.2;
      const sSize = this.stableRange(i, 103, 0.8, 2.2);
      // 星芒
      ctx.fillStyle = `rgba(200, 220, 240, ${sPulse * 0.2})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sSize * 3, 0, Math.PI * 2);
      ctx.fill();
      // 星體
      ctx.fillStyle = `rgba(220, 235, 255, ${sPulse})`;
      this.drawStar(ctx, sx, sy, sSize);
    }

    // ═══════════════════════════════════════════
    //  第四層：遠景山脈剪影（4層＋山谷夜霧）
    // ═══════════════════════════════════════════
    this.drawTerrainRibbon(ctx, width, height * 0.52, 18, 0.003, '#081e18', 1.3, 0.5);
    this.drawTerrainRibbon(ctx, width, height * 0.58, 22, 0.0045, '#0c2820', 0.5, 0.7);
    this.drawTerrainRibbon(ctx, width, height * 0.64, 28, 0.006, '#10322a', 1.8, 0.85);
    this.drawTerrainRibbon(ctx, width, height * 0.70, 20, 0.008, '#143a2e', 2.6, 0.95);

    // 山谷夜霧
    ctx.save();
    for (let i = 0; i < 6; i++) {
      const mx = width * (0.06 + i * 0.18) + Math.sin(time * 0.12 + i * 1.5) * 55;
      const my = height * (0.54 + (i % 3) * 0.06);
      ctx.fillStyle = `rgba(80, 120, 110, ${0.04 + (i % 3) * 0.01})`;
      ctx.beginPath();
      ctx.ellipse(mx, my, 220 + i * 15, 20 + i * 3, 0.04 * i, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第五層：遠景樹林剪影（三層深度）
    // ═══════════════════════════════════════════
    ctx.save();
    // 最遠層
    for (let i = 0; i < 16; i++) {
      const tx = i * (width / 15) + this.stableCentered(i, 200, 22);
      const th = this.stableRange(i, 201, 120, 200);
      const tw = this.stableRange(i, 202, 20, 38);
      ctx.fillStyle = `rgba(8, 22, 16, ${0.5 + this.stableNoise(i, 203) * 0.2})`;
      this.drawEnhancedTree(ctx, tx, height * 0.72, th, tw);
    }
    // 中遠層
    for (let i = 0; i < 14; i++) {
      const tx = i * (width / 13) + this.stableCentered(i, 210, 20);
      const th = this.stableRange(i, 211, 180, 280);
      const tw = this.stableRange(i, 212, 26, 44);
      ctx.fillStyle = `rgba(10, 28, 18, ${0.65 + this.stableNoise(i, 213) * 0.2})`;
      this.drawEnhancedTree(ctx, tx, height * 0.78, th, tw);
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第六層：鳥居（神社入口標誌）
    // ═══════════════════════════════════════════
    ctx.save();
    const gateX = width * 0.5;
    const gateBase = height * 0.78;

    // 鳥居陰影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(gateX - 46, gateBase - 108, 18, 112);
    ctx.fillRect(gateX + 30, gateBase - 108, 18, 112);

    // 鳥居柱子
    const pillarGrad = ctx.createLinearGradient(gateX - 48, gateBase, gateX + 48, gateBase);
    pillarGrad.addColorStop(0, '#4a1a14');
    pillarGrad.addColorStop(0.3, '#7a2e22');
    pillarGrad.addColorStop(0.5, '#8c3628');
    pillarGrad.addColorStop(0.7, '#7a2e22');
    pillarGrad.addColorStop(1, '#4a1a14');
    ctx.fillStyle = pillarGrad;
    ctx.fillRect(gateX - 46, gateBase - 114, 16, 118);
    ctx.fillRect(gateX + 30, gateBase - 114, 16, 118);

    // 柱子紋理
    ctx.strokeStyle = 'rgba(30, 10, 8, 0.15)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 8; i++) {
      const py = gateBase - 110 + i * 14;
      ctx.beginPath();
      ctx.moveTo(gateX - 44, py);
      ctx.lineTo(gateX - 32, py + 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(gateX + 32, py);
      ctx.lineTo(gateX + 44, py + 2);
      ctx.stroke();
    }

    // 上樑（笠木）— 上翹造型
    ctx.fillStyle = '#7a2e22';
    ctx.beginPath();
    ctx.moveTo(gateX - 78, gateBase - 118);
    ctx.quadraticCurveTo(gateX - 60, gateBase - 126, gateX, gateBase - 130);
    ctx.quadraticCurveTo(gateX + 60, gateBase - 126, gateX + 78, gateBase - 118);
    ctx.lineTo(gateX + 74, gateBase - 110);
    ctx.quadraticCurveTo(gateX, gateBase - 122, gateX - 74, gateBase - 110);
    ctx.closePath();
    ctx.fill();

    // 下樑（貫）
    ctx.fillStyle = '#6e2820';
    ctx.fillRect(gateX - 60, gateBase - 96, 120, 8);

    // 額束（中央匾額暗示）
    ctx.fillStyle = '#5a2018';
    ctx.fillRect(gateX - 14, gateBase - 108, 28, 16);
    ctx.strokeStyle = 'rgba(200, 160, 100, 0.2)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(gateX - 12, gateBase - 106, 24, 12);

    // 鳥居月光高光
    ctx.fillStyle = 'rgba(160, 190, 210, 0.08)';
    ctx.fillRect(gateX - 44, gateBase - 114, 4, 118);
    ctx.fillRect(gateX + 40, gateBase - 114, 4, 118);

    // 鳥居底部石基
    ctx.fillStyle = '#3a3832';
    ctx.fillRect(gateX - 50, gateBase, 24, 6);
    ctx.fillRect(gateX + 26, gateBase, 24, 6);
    ctx.fillStyle = 'rgba(180, 175, 160, 0.15)';
    ctx.fillRect(gateX - 50, gateBase, 24, 2);
    ctx.fillRect(gateX + 26, gateBase, 24, 2);
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第六B層：注連繩＋紙垂＋石灯籠
    // ═══════════════════════════════════════════
    ctx.save();
    // 注連繩（shimenawa）
    const shimeY = gateBase - 102;
    ctx.strokeStyle = '#4a3a28';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(gateX - 42, shimeY);
    ctx.quadraticCurveTo(gateX, shimeY + 9, gateX + 42, shimeY);
    ctx.stroke();
    // 繩紋理
    ctx.strokeStyle = 'rgba(85, 70, 45, 0.45)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      const sx = gateX - 38 + i * 12;
      ctx.beginPath();
      ctx.moveTo(sx, shimeY - 2);
      ctx.lineTo(sx + 4, shimeY + 5);
      ctx.stroke();
    }
    // 紙垂（shide）
    const shidePositions = [gateX - 28, gateX - 10, gateX + 10, gateX + 28];
    shidePositions.forEach((sx, i) => {
      const sway = Math.sin(time * 0.8 + i * 1.5) * 2.5;
      ctx.fillStyle = 'rgba(235, 230, 220, 0.7)';
      ctx.save();
      ctx.translate(sx + sway, shimeY + 5);
      ctx.rotate(sway * 0.02);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(6, 0);
      ctx.lineTo(6, 9);
      ctx.lineTo(9, 9);
      ctx.lineTo(9, 18);
      ctx.lineTo(3, 18);
      ctx.lineTo(3, 9);
      ctx.lineTo(0, 9);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // 石灯籠（左）
    const lanternLX = gateX - 78;
    const lanternY = gateBase;
    ctx.fillStyle = '#3a3832';
    ctx.fillRect(lanternLX - 9, lanternY - 6, 18, 6);
    ctx.fillStyle = '#4a4a42';
    ctx.fillRect(lanternLX - 4, lanternY - 30, 8, 24);
    ctx.fillStyle = '#3e3e36';
    ctx.fillRect(lanternLX - 11, lanternY - 40, 22, 10);
    const lanGlowL = ctx.createRadialGradient(lanternLX, lanternY - 35, 0, lanternLX, lanternY - 35, 40);
    lanGlowL.addColorStop(0, `rgba(255, 175, 70, ${0.22 + Math.sin(time * 1.5) * 0.07})`);
    lanGlowL.addColorStop(0.35, `rgba(255, 145, 45, ${0.08 + Math.sin(time * 1.5) * 0.03})`);
    lanGlowL.addColorStop(1, 'rgba(255, 145, 45, 0)');
    ctx.fillStyle = lanGlowL;
    ctx.beginPath();
    ctx.arc(lanternLX, lanternY - 35, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 200, 100, ${0.55 + Math.sin(time * 1.5) * 0.15})`;
    ctx.fillRect(lanternLX - 7, lanternY - 38, 14, 6);
    ctx.fillStyle = '#2e2e28';
    ctx.beginPath();
    ctx.moveTo(lanternLX, lanternY - 50);
    ctx.lineTo(lanternLX + 15, lanternY - 40);
    ctx.lineTo(lanternLX - 15, lanternY - 40);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#4a4a42';
    ctx.beginPath();
    ctx.arc(lanternLX, lanternY - 52, 3, 0, Math.PI * 2);
    ctx.fill();

    // 石灯籠（右）
    const lanternRX = gateX + 78;
    ctx.fillStyle = '#3a3832';
    ctx.fillRect(lanternRX - 9, lanternY - 6, 18, 6);
    ctx.fillStyle = '#4a4a42';
    ctx.fillRect(lanternRX - 4, lanternY - 30, 8, 24);
    ctx.fillStyle = '#3e3e36';
    ctx.fillRect(lanternRX - 11, lanternY - 40, 22, 10);
    const lanGlowR = ctx.createRadialGradient(lanternRX, lanternY - 35, 0, lanternRX, lanternY - 35, 40);
    lanGlowR.addColorStop(0, `rgba(255, 175, 70, ${0.22 + Math.sin(time * 1.5 + 0.5) * 0.07})`);
    lanGlowR.addColorStop(0.35, `rgba(255, 145, 45, ${0.08 + Math.sin(time * 1.5 + 0.5) * 0.03})`);
    lanGlowR.addColorStop(1, 'rgba(255, 145, 45, 0)');
    ctx.fillStyle = lanGlowR;
    ctx.beginPath();
    ctx.arc(lanternRX, lanternY - 35, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 200, 100, ${0.55 + Math.sin(time * 1.5 + 0.5) * 0.15})`;
    ctx.fillRect(lanternRX - 7, lanternY - 38, 14, 6);
    ctx.fillStyle = '#2e2e28';
    ctx.beginPath();
    ctx.moveTo(lanternRX, lanternY - 50);
    ctx.lineTo(lanternRX + 15, lanternY - 40);
    ctx.lineTo(lanternRX - 15, lanternY - 40);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#4a4a42';
    ctx.beginPath();
    ctx.arc(lanternRX, lanternY - 52, 3, 0, Math.PI * 2);
    ctx.fill();

    // 灯光灑落地面
    const lanFloorL = ctx.createRadialGradient(lanternLX, lanternY, 0, lanternLX, lanternY + 5, 30);
    lanFloorL.addColorStop(0, `rgba(255, 180, 80, ${0.06 + Math.sin(time * 1.5) * 0.02})`);
    lanFloorL.addColorStop(1, 'rgba(255, 180, 80, 0)');
    ctx.fillStyle = lanFloorL;
    ctx.beginPath();
    ctx.ellipse(lanternLX, lanternY + 2, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    const lanFloorR = ctx.createRadialGradient(lanternRX, lanternY, 0, lanternRX, lanternY + 5, 30);
    lanFloorR.addColorStop(0, `rgba(255, 180, 80, ${0.06 + Math.sin(time * 1.5 + 0.5) * 0.02})`);
    lanFloorR.addColorStop(1, 'rgba(255, 180, 80, 0)');
    ctx.fillStyle = lanFloorR;
    ctx.beginPath();
    ctx.ellipse(lanternRX, lanternY + 2, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第七層：前景巨木（寫實枝幹＋樹根＋月光面）
    // ═══════════════════════════════════════════
    ctx.save();
    // 左側巨樹
    const ltX = width * 0.08;
    const ltBase = height * 0.78;

    // 樹幹
    const ltGrad = ctx.createLinearGradient(ltX - 24, ltBase, ltX + 24, ltBase);
    ltGrad.addColorStop(0, '#0a0e08');
    ltGrad.addColorStop(0.3, '#1a2418');
    ltGrad.addColorStop(0.6, '#141e12');
    ltGrad.addColorStop(1, '#080c06');
    ctx.fillStyle = ltGrad;
    ctx.beginPath();
    ctx.moveTo(ltX - 24, ltBase + 20);
    ctx.quadraticCurveTo(ltX - 20, ltBase - 80, ltX - 14, ltBase - 180);
    ctx.quadraticCurveTo(ltX - 6, ltBase - 240, ltX, ltBase - 280);
    ctx.quadraticCurveTo(ltX + 6, ltBase - 240, ltX + 14, ltBase - 180);
    ctx.quadraticCurveTo(ltX + 20, ltBase - 80, ltX + 24, ltBase + 20);
    ctx.closePath();
    ctx.fill();

    // 左樹大枝
    ctx.strokeStyle = '#121a10';
    ctx.lineCap = 'round';
    const ltBranches = [
      { sx: -8, sy: -200, ex: -80, ey: -260, lw: 10 },
      { sx: -4, sy: -170, ex: -100, ey: -190, lw: 8 },
      { sx: 6, sy: -220, ex: 60, ey: -300, lw: 8 },
      { sx: 8, sy: -160, ex: 90, ey: -195, lw: 7 },
      { sx: 0, sy: -260, ex: -30, ey: -320, lw: 6 },
      { sx: 2, sy: -250, ex: 40, ey: -330, lw: 5 }
    ];
    ltBranches.forEach(b => {
      ctx.lineWidth = b.lw;
      ctx.beginPath();
      ctx.moveTo(ltX + b.sx, ltBase + b.sy);
      ctx.quadraticCurveTo(
        ltX + (b.sx + b.ex) * 0.5 + (b.ex > 0 ? 12 : -12),
        ltBase + (b.sy + b.ey) * 0.5 - 15,
        ltX + b.ex, ltBase + b.ey
      );
      ctx.stroke();
    });

    // 左樹樹冠團簇
    const ltCrowns = [
      { x: -70, y: -250, r: 38 }, { x: -40, y: -275, r: 42 }, { x: -10, y: -295, r: 36 },
      { x: 30, y: -290, r: 40 }, { x: 55, y: -270, r: 34 }, { x: -90, y: -220, r: 32 },
      { x: 70, y: -250, r: 28 }, { x: -25, y: -310, r: 28 }, { x: 20, y: -320, r: 26 },
      { x: -55, y: -270, r: 30 }, { x: 45, y: -305, r: 24 }
    ];
    ltCrowns.forEach(c => {
      ctx.fillStyle = 'rgba(8, 16, 8, 0.9)';
      ctx.beginPath();
      ctx.arc(ltX + c.x, ltBase + c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    });
    // 月光面
    ltCrowns.forEach(c => {
      ctx.fillStyle = 'rgba(30, 55, 35, 0.35)';
      ctx.beginPath();
      ctx.arc(ltX + c.x + 5, ltBase + c.y - 4, c.r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 左樹根
    ctx.strokeStyle = '#0e1a0c';
    ctx.lineWidth = 6;
    const ltRoots = [
      [-30, 10, -60, 20], [-24, 8, -48, 16], [22, 10, 50, 18], [28, 8, 56, 16]
    ];
    ltRoots.forEach(r => {
      ctx.beginPath();
      ctx.moveTo(ltX + r[0], ltBase + r[1]);
      ctx.quadraticCurveTo(ltX + (r[0] + r[2]) * 0.5, ltBase + r[1] + 5, ltX + r[2], ltBase + r[3]);
      ctx.stroke();
    });

    // 右側巨樹
    const rtX = width * 0.92;
    ctx.fillStyle = ltGrad;
    ctx.beginPath();
    ctx.moveTo(rtX - 20, ltBase + 20);
    ctx.quadraticCurveTo(rtX - 16, ltBase - 60, rtX - 10, ltBase - 160);
    ctx.quadraticCurveTo(rtX - 4, ltBase - 220, rtX, ltBase - 260);
    ctx.quadraticCurveTo(rtX + 4, ltBase - 220, rtX + 10, ltBase - 160);
    ctx.quadraticCurveTo(rtX + 16, ltBase - 60, rtX + 20, ltBase + 20);
    ctx.closePath();
    ctx.fill();

    // 右樹枝
    const rtBranches = [
      { sx: -6, sy: -180, ex: -70, ey: -240, lw: 8 },
      { sx: -4, sy: -150, ex: -85, ey: -175, lw: 7 },
      { sx: 4, sy: -200, ex: 50, ey: -275, lw: 7 },
      { sx: 0, sy: -240, ex: -20, ey: -300, lw: 5 }
    ];
    rtBranches.forEach(b => {
      ctx.lineWidth = b.lw;
      ctx.beginPath();
      ctx.moveTo(rtX + b.sx, ltBase + b.sy);
      ctx.quadraticCurveTo(
        rtX + (b.sx + b.ex) * 0.5 + (b.ex > 0 ? 10 : -10),
        ltBase + (b.sy + b.ey) * 0.5 - 12,
        rtX + b.ex, ltBase + b.ey
      );
      ctx.stroke();
    });

    // 右樹冠
    const rtCrowns = [
      { x: -60, y: -230, r: 34 }, { x: -30, y: -255, r: 38 }, { x: 0, y: -268, r: 32 },
      { x: 30, y: -260, r: 36 }, { x: -75, y: -200, r: 28 }, { x: -15, y: -280, r: 24 },
      { x: 40, y: -275, r: 26 }, { x: 20, y: -290, r: 22 }
    ];
    rtCrowns.forEach(c => {
      ctx.fillStyle = 'rgba(8, 16, 8, 0.9)';
      ctx.beginPath();
      ctx.arc(rtX + c.x, ltBase + c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    });
    rtCrowns.forEach(c => {
      ctx.fillStyle = 'rgba(30, 55, 35, 0.3)';
      ctx.beginPath();
      ctx.arc(rtX + c.x + 4, ltBase + c.y - 3, c.r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第七B層：樹皮紋理＋生物發光根脈
    // ═══════════════════════════════════════════
    ctx.save();
    // 左樹皮紋理
    ctx.strokeStyle = 'rgba(15, 28, 10, 0.3)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 14; i++) {
      const barkY = ltBase - 25 - i * 18;
      const barkW = Math.sin(i * 0.7) * 5;
      ctx.beginPath();
      ctx.moveTo(ltX - 14 + barkW, barkY);
      ctx.quadraticCurveTo(ltX + barkW * 0.5, barkY - 8, ltX + 14 + barkW, barkY - 4);
      ctx.stroke();
    }
    // 樹疤/樹瘤
    ctx.fillStyle = 'rgba(20, 32, 15, 0.25)';
    ctx.beginPath();
    ctx.ellipse(ltX - 5, ltBase - 120, 6, 9, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(ltX + 8, ltBase - 70, 5, 7, -0.15, 0, Math.PI * 2);
    ctx.fill();
    // 右樹皮紋理
    for (let i = 0; i < 11; i++) {
      const barkY = ltBase - 20 - i * 20;
      const barkW = Math.sin(i * 0.8) * 4;
      ctx.beginPath();
      ctx.moveTo(rtX - 11 + barkW, barkY);
      ctx.quadraticCurveTo(rtX + barkW * 0.5, barkY - 10, rtX + 11 + barkW, barkY - 3);
      ctx.stroke();
    }

    // 生物發光根脈（左樹）
    const rootVeins = [
      { x1: ltX - 28, y1: ltBase + 10, x2: ltX - 68, y2: ltBase + 28, cx: ltX - 50, cy: ltBase + 12 },
      { x1: ltX + 20, y1: ltBase + 10, x2: ltX + 55, y2: ltBase + 24, cx: ltX + 40, cy: ltBase + 8 },
      { x1: ltX - 22, y1: ltBase + 8, x2: ltX - 48, y2: ltBase + 22, cx: ltX - 38, cy: ltBase + 20 },
      { x1: ltX + 10, y1: ltBase + 6, x2: ltX + 42, y2: ltBase + 16, cx: ltX + 28, cy: ltBase + 14 }
    ];
    rootVeins.forEach((rv, i) => {
      const veinGlow = 0.3 + Math.sin(time * 0.7 + i * 2.1) * 0.18;
      // 外層光暈線
      ctx.strokeStyle = `rgba(60, 200, 130, ${veinGlow * 0.35})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rv.x1, rv.y1);
      ctx.quadraticCurveTo(rv.cx, rv.cy, rv.x2, rv.y2);
      ctx.stroke();
      // 核心亮線
      ctx.strokeStyle = `rgba(110, 255, 170, ${veinGlow * 0.22})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rv.x1, rv.y1);
      ctx.quadraticCurveTo(rv.cx, rv.cy, rv.x2, rv.y2);
      ctx.stroke();
      // 端點發光
      const glowG = ctx.createRadialGradient(rv.x2, rv.y2, 0, rv.x2, rv.y2, 14);
      glowG.addColorStop(0, `rgba(70, 220, 140, ${veinGlow * 0.18})`);
      glowG.addColorStop(1, 'rgba(70, 220, 140, 0)');
      ctx.fillStyle = glowG;
      ctx.beginPath();
      ctx.arc(rv.x2, rv.y2, 14, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第八層：懸掛藤蔓
    // ═══════════════════════════════════════════
    ctx.save();
    ctx.strokeStyle = 'rgba(20, 45, 22, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    const vines = [
      { x: ltX - 55, y: ltBase - 230, len: 80 },
      { x: ltX - 80, y: ltBase - 195, len: 60 },
      { x: ltX + 50, y: ltBase - 265, len: 90 },
      { x: ltX + 75, y: ltBase - 200, len: 55 },
      { x: rtX - 65, y: ltBase - 240, len: 75 },
      { x: rtX - 40, y: ltBase - 255, len: 85 },
      { x: rtX + 30, y: ltBase - 260, len: 65 },
      { x: width * 0.35, y: height * 0.05, len: 50 },
      { x: width * 0.55, y: height * 0.03, len: 55 }
    ];
    vines.forEach((v, i) => {
      const vSway = Math.sin(time * 0.4 + i * 1.8) * 6;
      ctx.beginPath();
      ctx.moveTo(v.x, v.y);
      ctx.quadraticCurveTo(v.x + vSway, v.y + v.len * 0.5, v.x + vSway * 1.4, v.y + v.len);
      ctx.stroke();
      // 藤蔓尖端小葉
      if (i % 2 === 0) {
        ctx.fillStyle = 'rgba(25, 55, 25, 0.5)';
        ctx.beginPath();
        ctx.ellipse(v.x + vSway * 1.4 - 3, v.y + v.len + 3, 4, 2, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(v.x + vSway * 1.4 + 3, v.y + v.len + 5, 4, 2, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第九層：林間地面
    // ═══════════════════════════════════════════
    const ground = ctx.createLinearGradient(0, height * 0.78, 0, height);
    ground.addColorStop(0, '#243828');
    ground.addColorStop(0.2, '#1c2e20');
    ground.addColorStop(0.5, '#152418');
    ground.addColorStop(0.8, '#0e1a10');
    ground.addColorStop(1, '#08100a');
    ctx.fillStyle = ground;
    ctx.fillRect(0, height * 0.78, width, height * 0.22);

    // 地面微紋理
    ctx.save();
    for (let i = 0; i < 20; i++) {
      const px = this.stableNoise(i, 300) * width;
      const py = height * 0.8 + this.stableNoise(i, 301) * height * 0.18;
      const pr = this.stableRange(i, 302, 16, 45);
      ctx.fillStyle = `rgba(8, 14, 6, ${this.stableRange(i, 303, 0.05, 0.12)})`;
      ctx.beginPath();
      ctx.ellipse(px, py, pr, pr * 0.35, this.stableNoise(i, 304) * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 月光照射地面區域
    ctx.save();
    const groundMoonlight = ctx.createRadialGradient(moonX, height * 0.82, 0, moonX, height * 0.82, width * 0.3);
    groundMoonlight.addColorStop(0, 'rgba(140, 180, 170, 0.06)');
    groundMoonlight.addColorStop(0.5, 'rgba(100, 150, 140, 0.025)');
    groundMoonlight.addColorStop(1, 'rgba(100, 150, 140, 0)');
    ctx.fillStyle = groundMoonlight;
    ctx.fillRect(0, height * 0.78, width, height * 0.22);
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十層：苔蘚覆蓋的石頭路
    // ═══════════════════════════════════════════
    ctx.save();
    // 路徑
    const pathGrad = ctx.createLinearGradient(width * 0.46, height * 0.78, width * 0.54, height);
    pathGrad.addColorStop(0, 'rgba(60, 72, 48, 0.12)');
    pathGrad.addColorStop(0.5, 'rgba(45, 55, 35, 0.18)');
    pathGrad.addColorStop(1, 'rgba(32, 40, 24, 0.22)');
    ctx.fillStyle = pathGrad;
    ctx.beginPath();
    ctx.moveTo(width * 0.46, height * 0.78);
    ctx.quadraticCurveTo(width * 0.50, height * 0.83, width * 0.52, height * 0.88);
    ctx.quadraticCurveTo(width * 0.55, height * 0.94, width * 0.57, height);
    ctx.lineTo(width * 0.38, height);
    ctx.quadraticCurveTo(width * 0.40, height * 0.93, width * 0.42, height * 0.88);
    ctx.quadraticCurveTo(width * 0.43, height * 0.83, width * 0.46, height * 0.78);
    ctx.closePath();
    ctx.fill();

    // 路上石板
    for (let i = 0; i < 8; i++) {
      const sx = width * (0.42 + this.stableNoise(i, 310) * 0.13);
      const sy = height * (0.8 + this.stableNoise(i, 311) * 0.17);
      const sw = this.stableRange(i, 312, 8, 18);
      const sh = this.stableRange(i, 313, 5, 10);
      ctx.fillStyle = `rgba(55, 65, 48, ${this.stableRange(i, 314, 0.15, 0.25)})`;
      ctx.beginPath();
      ctx.ellipse(sx, sy, sw, sh, this.stableNoise(i, 315) * 0.5, 0, Math.PI * 2);
      ctx.fill();
      // 苔蘚
      ctx.fillStyle = `rgba(50, 90, 40, ${this.stableRange(i, 316, 0.08, 0.18)})`;
      ctx.beginPath();
      ctx.ellipse(sx - sw * 0.2, sy - sh * 0.1, sw * 0.4, sh * 0.35, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十A層：聖池（月光倒影＋水面漣漪）
    // ═══════════════════════════════════════════
    ctx.save();
    const pondX = width * 0.30;
    const pondY = height * 0.87;
    const pondW = 60;
    const pondH = 16;
    // 池水主體
    const pondGrad = ctx.createRadialGradient(pondX, pondY, 0, pondX, pondY, pondW);
    pondGrad.addColorStop(0, 'rgba(18, 48, 62, 0.72)');
    pondGrad.addColorStop(0.6, 'rgba(12, 32, 48, 0.55)');
    pondGrad.addColorStop(1, 'rgba(8, 22, 32, 0.25)');
    ctx.fillStyle = pondGrad;
    ctx.beginPath();
    ctx.ellipse(pondX, pondY, pondW, pondH, 0.04, 0, Math.PI * 2);
    ctx.fill();
    // 池邊苔石
    ctx.fillStyle = '#28282220';
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const psx = pondX + Math.cos(angle) * (pondW + 2 + this.stableNoise(i, 600) * 4);
      const psy = pondY + Math.sin(angle) * (pondH + 1 + this.stableNoise(i, 601) * 2);
      ctx.fillStyle = `rgba(38, 38, 32, ${this.stableRange(i, 602, 0.3, 0.55)})`;
      ctx.beginPath();
      ctx.ellipse(psx, psy, 4 + this.stableNoise(i, 603) * 3, 2.5 + this.stableNoise(i, 604) * 1.5, angle * 0.5, 0, Math.PI * 2);
      ctx.fill();
      // 苔蘚
      ctx.fillStyle = `rgba(40, 80, 35, ${this.stableRange(i, 605, 0.15, 0.3)})`;
      ctx.beginPath();
      ctx.ellipse(psx, psy - 1, 2.5, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // 月亮倒影
    const moonRefX = pondX + 8;
    const moonRefY = pondY - 1;
    const refPulse = 0.14 + Math.sin(time * 0.55) * 0.05;
    const moonRefGrad = ctx.createRadialGradient(moonRefX, moonRefY, 0, moonRefX, moonRefY, 22);
    moonRefGrad.addColorStop(0, `rgba(175, 210, 230, ${refPulse})`);
    moonRefGrad.addColorStop(0.4, `rgba(130, 175, 200, ${refPulse * 0.45})`);
    moonRefGrad.addColorStop(1, 'rgba(130, 175, 200, 0)');
    ctx.fillStyle = moonRefGrad;
    ctx.beginPath();
    ctx.ellipse(moonRefX, moonRefY, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    // 水面漣漪
    ctx.strokeStyle = `rgba(115, 165, 190, ${0.055 + Math.sin(time * 0.75) * 0.02})`;
    ctx.lineWidth = 0.4;
    for (let i = 0; i < 3; i++) {
      const rippleR = 7 + i * 11 + Math.sin(time * 0.45 + i * 1.2) * 3;
      ctx.beginPath();
      ctx.ellipse(moonRefX, moonRefY, rippleR, rippleR * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // 水面螢火蟲倒影
    for (let i = 0; i < 3; i++) {
      const frx = pondX - 20 + i * 22 + Math.sin(time * 0.85 + i * 2.8) * 10;
      const fry = pondY + Math.sin(time * 0.4 + i * 1.5) * 3;
      ctx.fillStyle = `rgba(200, 240, 100, ${0.065 + Math.sin(time * 2.2 + i * 2) * 0.035})`;
      ctx.beginPath();
      ctx.arc(frx, fry, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    // 水面微光帶
    ctx.fillStyle = `rgba(100, 160, 180, ${0.03 + Math.sin(time * 0.35) * 0.01})`;
    ctx.beginPath();
    ctx.ellipse(pondX - 10, pondY - 3, pondW * 0.5, 2, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十一層：發光蘑菇群落
    // ═══════════════════════════════════════════
    ctx.save();
    const mushColors = [
      { cap: '#2a6888', glow: 'rgba(60, 160, 200, 0.25)', stem: '#384838' },
      { cap: '#7a3488', glow: 'rgba(160, 80, 200, 0.22)', stem: '#3a3840' },
      { cap: '#2a8858', glow: 'rgba(60, 200, 130, 0.2)', stem: '#2e4032' },
      { cap: '#886830', glow: 'rgba(200, 160, 80, 0.18)', stem: '#3e3828' },
      { cap: '#884040', glow: 'rgba(200, 90, 90, 0.2)', stem: '#3a3230' }
    ];
    for (let i = 0; i < 22; i++) {
      const mx = width * (0.05 + this.stableNoise(i, 107) * 0.9);
      const my = height - 100 + this.stableCentered(i, 108, 14);
      const mSize = this.stableRange(i, 109, 5, 14);
      const mc = mushColors[i % mushColors.length];
      const glowPulse = 0.7 + Math.sin(time * 1.6 + i * 1.3) * 0.3;

      // 菇光暈
      const mg = ctx.createRadialGradient(mx, my - mSize * 0.4, 0, mx, my - mSize * 0.4, mSize * 3);
      mg.addColorStop(0, mc.glow.replace(/[\d.]+\)$/, `${0.18 * glowPulse})`));
      mg.addColorStop(0.5, mc.glow.replace(/[\d.]+\)$/, `${0.06 * glowPulse})`));
      mg.addColorStop(1, mc.glow.replace(/[\d.]+\)$/, '0)'));
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(mx, my - mSize * 0.4, mSize * 3, 0, Math.PI * 2);
      ctx.fill();

      // 菇柄
      ctx.fillStyle = mc.stem;
      ctx.fillRect(mx - mSize * 0.12, my - mSize * 0.2, mSize * 0.24, mSize * 0.65);

      // 菇傘
      ctx.fillStyle = mc.cap;
      ctx.beginPath();
      ctx.ellipse(mx, my - mSize * 0.35, mSize * 0.7, mSize * 0.42, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      // 菇傘高光
      ctx.fillStyle = `rgba(255, 255, 255, ${0.12 * glowPulse})`;
      ctx.beginPath();
      ctx.ellipse(mx - mSize * 0.15, my - mSize * 0.55, mSize * 0.22, mSize * 0.15, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // 菇傘斑點
      if (mSize > 8) {
        ctx.fillStyle = `rgba(255, 255, 240, ${0.25 * glowPulse})`;
        for (let j = 0; j < 3; j++) {
          const sx = mx + this.stableCentered(i * 10 + j, 110, mSize * 0.35);
          const sy = my - mSize * 0.4 + this.stableCentered(i * 10 + j, 111, mSize * 0.12);
          ctx.beginPath();
          ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十二層：枯木倒木＋苔蘚石頭
    // ═══════════════════════════════════════════
    ctx.save();
    // 倒木
    ctx.strokeStyle = '#1e2a16';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(width * 0.62, height - 90);
    ctx.quadraticCurveTo(width * 0.68, height - 94, width * 0.75, height - 88);
    ctx.stroke();
    // 倒木苔蘚
    ctx.strokeStyle = 'rgba(40, 80, 35, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width * 0.63, height - 93);
    ctx.quadraticCurveTo(width * 0.68, height - 97, width * 0.73, height - 92);
    ctx.stroke();

    // 苔蘚石
    for (let i = 0; i < 8; i++) {
      const rx = width * (0.08 + this.stableNoise(i, 400) * 0.84);
      const ry = height - 94 + this.stableCentered(i, 401, 10);
      const rw = this.stableRange(i, 402, 6, 16);
      const rh = this.stableRange(i, 403, 4, 9);

      // 石影
      ctx.fillStyle = `rgba(4, 8, 4, ${this.stableRange(i, 404, 0.12, 0.22)})`;
      ctx.beginPath();
      ctx.ellipse(rx + 2, ry + 2, rw + 1, rh * 0.5, 0.1, 0, Math.PI * 2);
      ctx.fill();
      // 石體
      const stGrad = ctx.createLinearGradient(rx - rw, ry - rh, rx + rw, ry + rh);
      stGrad.addColorStop(0, '#4a4a3e');
      stGrad.addColorStop(0.5, '#3a3a30');
      stGrad.addColorStop(1, '#2a2a22');
      ctx.fillStyle = stGrad;
      ctx.beginPath();
      ctx.ellipse(rx, ry, rw, rh, 0.12 * i, 0, Math.PI * 2);
      ctx.fill();
      // 苔蘚
      ctx.fillStyle = `rgba(35, 75, 30, ${this.stableRange(i, 405, 0.15, 0.3)})`;
      ctx.beginPath();
      ctx.ellipse(rx - rw * 0.15, ry - rh * 0.25, rw * 0.5, rh * 0.3, -0.1, 0, Math.PI * 2);
      ctx.fill();
      // 月光高光
      ctx.fillStyle = 'rgba(150, 180, 170, 0.1)';
      ctx.beginPath();
      ctx.ellipse(rx + rw * 0.15, ry - rh * 0.35, rw * 0.25, rh * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十二B層：蜘蛛網（捕捉月光絲線）
    // ═══════════════════════════════════════════
    ctx.save();
    const webCX = width * 0.80;
    const webCY = height * 0.40;
    const webR = 30;
    const webAlpha = 0.07 + Math.sin(time * 0.25) * 0.02;
    ctx.strokeStyle = `rgba(180, 200, 225, ${webAlpha})`;
    ctx.lineWidth = 0.35;
    // 放射骨架線（8條）
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 - 0.2;
      ctx.beginPath();
      ctx.moveTo(webCX, webCY);
      ctx.lineTo(webCX + Math.cos(angle) * webR, webCY + Math.sin(angle) * webR);
      ctx.stroke();
    }
    // 同心螺旋環（5圈）
    for (let ring = 1; ring <= 5; ring++) {
      const r = webR * (ring / 5.5);
      ctx.beginPath();
      for (let i = 0; i <= 32; i++) {
        const angle = (i / 32) * Math.PI * 2 - 0.2;
        const wobble = Math.sin(angle * 4 + ring * 0.8) * 1.2;
        const px = webCX + Math.cos(angle) * (r + wobble);
        const py = webCY + Math.sin(angle) * (r + wobble);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    // 露珠（月光閃爍）
    const dewPositions = [
      { x: webCX + 8, y: webCY - 10 }, { x: webCX - 12, y: webCY + 6 },
      { x: webCX + 16, y: webCY + 4 }, { x: webCX - 5, y: webCY - 16 },
      { x: webCX + 2, y: webCY + 14 }
    ];
    dewPositions.forEach((d, i) => {
      const dewGlint = 0.2 + Math.sin(time * 2.8 + i * 1.7) * 0.15;
      ctx.fillStyle = `rgba(210, 230, 255, ${dewGlint})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 0.9, 0, Math.PI * 2);
      ctx.fill();
      // 露珠光暈
      ctx.fillStyle = `rgba(180, 210, 240, ${dewGlint * 0.3})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十三層：地面蕨類＋暗色草
    // ═══════════════════════════════════════════
    // 蕨類（捲曲的葉片）
    ctx.save();
    for (let i = 0; i < 18; i++) {
      const fx = width * (0.03 + this.stableNoise(i, 450) * 0.94);
      const fy = height - 96 + this.stableCentered(i, 451, 8);
      const fSize = this.stableRange(i, 452, 12, 28);
      const fDir = this.stableNoise(i, 453) > 0.5 ? 1 : -1;
      const fSway = Math.sin(time * 0.6 + i * 1.4) * 0.06;

      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(fSway);
      ctx.strokeStyle = `rgba(28, 60, 24, ${this.stableRange(i, 454, 0.4, 0.7)})`;
      ctx.lineWidth = 1.2;
      // 主莖
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(fDir * fSize * 0.3, -fSize * 0.5, fDir * fSize * 0.15, -fSize);
      ctx.stroke();
      // 小葉片
      for (let j = 1; j <= 4; j++) {
        const t = j / 5;
        const lx = fDir * fSize * 0.3 * t * 0.5;
        const ly = -fSize * t;
        ctx.fillStyle = `rgba(22, 52, 20, ${0.3 + j * 0.05})`;
        ctx.beginPath();
        ctx.ellipse(lx + fDir * 5, ly, 4, 1.8, fDir * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(lx - fDir * 3, ly - 2, 3.5, 1.5, -fDir * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();

    // 暗色草叢
    for (let i = 0; i < 80; i++) {
      const gx = i * (width / 79) + this.stableCentered(i, 460, 12);
      const gh = this.stableRange(i, 461, 12, 34);
      const gw = this.stableRange(i, 462, 1, 2.5);
      const gSway = Math.sin(time * 0.8 + gx * 0.005 + i * 0.3) * 0.08;
      ctx.save();
      ctx.translate(gx, height - 98);
      ctx.rotate(gSway);
      const gGrad = ctx.createLinearGradient(0, -gh, 0, 0);
      gGrad.addColorStop(0, '#3a5a2a');
      gGrad.addColorStop(0.6, '#1e3816');
      gGrad.addColorStop(1, '#12260e');
      ctx.fillStyle = gGrad;
      ctx.beginPath();
      ctx.moveTo(-gw / 2, 0);
      ctx.quadraticCurveTo(-gw * 0.3, -gh * 0.5, 0, -gh);
      ctx.quadraticCurveTo(gw * 0.3, -gh * 0.5, gw / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // ═══════════════════════════════════════════
    //  第十四層：螢火蟲（雙層光暈＋飄動軌跡）
    // ═══════════════════════════════════════════
    ctx.save();
    for (let i = 0; i < 28; i++) {
      const baseX = width * (0.08 + this.stableNoise(i, 112) * 0.84);
      const baseY = height * (0.3 + this.stableNoise(i, 113) * 0.48);
      const fx = baseX + Math.sin(time * 0.7 + i * 1.7) * 22 + Math.cos(time * 0.3 + i * 0.8) * 10;
      const fy = baseY + Math.cos(time * 0.55 + i * 1.3) * 16 + Math.sin(time * 0.2 + i) * 8;
      const pulse = 0.35 + Math.sin(time * 2.8 + i * 1.5) * 0.25;

      // 外層光暈
      const fGlow = ctx.createRadialGradient(fx, fy, 0, fx, fy, 12);
      fGlow.addColorStop(0, `rgba(200, 240, 100, ${pulse * 0.35})`);
      fGlow.addColorStop(0.4, `rgba(180, 230, 80, ${pulse * 0.12})`);
      fGlow.addColorStop(1, 'rgba(180, 230, 80, 0)');
      ctx.fillStyle = fGlow;
      ctx.beginPath();
      ctx.arc(fx, fy, 12, 0, Math.PI * 2);
      ctx.fill();

      // 核心
      ctx.fillStyle = `rgba(230, 255, 140, ${pulse})`;
      ctx.beginPath();
      ctx.arc(fx, fy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十四B層：黑暗中的神秘眼睛
    // ═══════════════════════════════════════════
    ctx.save();
    const eyePairs = [
      { x: width * 0.16, y: height * 0.54, size: 2.5, color: '220, 195, 55' },
      { x: width * 0.84, y: height * 0.46, size: 2, color: '170, 255, 175' },
      { x: width * 0.60, y: height * 0.36, size: 1.6, color: '195, 155, 255' }
    ];
    eyePairs.forEach((ep, i) => {
      const blink = Math.sin(time * 0.25 + i * 4.2);
      if (blink > -0.88) {
        const eyeA = 0.45 + Math.sin(time * 1.4 + i * 2.5) * 0.15;
        const gap = ep.size * 3.8;
        // 左眼
        const eyeGL = ctx.createRadialGradient(ep.x - gap, ep.y, 0, ep.x - gap, ep.y, ep.size * 6);
        eyeGL.addColorStop(0, `rgba(${ep.color}, ${eyeA * 0.12})`);
        eyeGL.addColorStop(1, `rgba(${ep.color}, 0)`);
        ctx.fillStyle = eyeGL;
        ctx.beginPath();
        ctx.arc(ep.x - gap, ep.y, ep.size * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${ep.color}, ${eyeA})`;
        ctx.beginPath();
        ctx.ellipse(ep.x - gap, ep.y, ep.size, ep.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        // 右眼
        const eyeGR = ctx.createRadialGradient(ep.x + gap, ep.y, 0, ep.x + gap, ep.y, ep.size * 6);
        eyeGR.addColorStop(0, `rgba(${ep.color}, ${eyeA * 0.12})`);
        eyeGR.addColorStop(1, `rgba(${ep.color}, 0)`);
        ctx.fillStyle = eyeGR;
        ctx.beginPath();
        ctx.arc(ep.x + gap, ep.y, ep.size * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${ep.color}, ${eyeA})`;
        ctx.beginPath();
        ctx.ellipse(ep.x + gap, ep.y, ep.size, ep.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十五層：精靈光球（大型漂浮光體）
    // ═══════════════════════════════════════════
    ctx.save();
    const spiritColors = [
      { core: '180, 220, 255', outer: '120, 180, 240' },
      { core: '200, 255, 200', outer: '120, 220, 140' },
      { core: '255, 220, 180', outer: '220, 180, 120' }
    ];
    for (let i = 0; i < 3; i++) {
      const sc = spiritColors[i];
      const spx = width * (0.25 + i * 0.25) + Math.sin(time * 0.35 + i * 2.5) * 40;
      const spy = height * (0.42 + (i % 2) * 0.12) + Math.sin(time * 0.5 + i * 1.8) * 25;
      const spPulse = 0.5 + Math.sin(time * 1.2 + i * 2) * 0.15;
      const spR = 20 + Math.sin(time * 0.8 + i) * 4;

      // 外層光暈
      const spOuter = ctx.createRadialGradient(spx, spy, 0, spx, spy, spR * 2);
      spOuter.addColorStop(0, `rgba(${sc.outer}, ${spPulse * 0.12})`);
      spOuter.addColorStop(0.5, `rgba(${sc.outer}, ${spPulse * 0.04})`);
      spOuter.addColorStop(1, `rgba(${sc.outer}, 0)`);
      ctx.fillStyle = spOuter;
      ctx.beginPath();
      ctx.arc(spx, spy, spR * 2, 0, Math.PI * 2);
      ctx.fill();

      // 核心光
      const spCore = ctx.createRadialGradient(spx, spy, 0, spx, spy, spR * 0.6);
      spCore.addColorStop(0, `rgba(${sc.core}, ${spPulse * 0.4})`);
      spCore.addColorStop(0.6, `rgba(${sc.core}, ${spPulse * 0.12})`);
      spCore.addColorStop(1, `rgba(${sc.core}, 0)`);
      ctx.fillStyle = spCore;
      ctx.beginPath();
      ctx.arc(spx, spy, spR * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // 核心點
      ctx.fillStyle = `rgba(${sc.core}, ${spPulse * 0.6})`;
      ctx.beginPath();
      ctx.arc(spx, spy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十六層：飄散孢子
    // ═══════════════════════════════════════════
    ctx.save();
    for (let i = 0; i < 20; i++) {
      const phase = this.stableNoise(i, 500) * Math.PI * 2;
      const bx = this.stableNoise(i, 501) * width;
      const by = height * (0.35 + this.stableNoise(i, 502) * 0.4);
      const sx = bx + Math.sin(time * 0.25 + phase) * 40;
      const sy = by + Math.cos(time * 0.35 + phase) * 20 - time * (2 + i * 0.4);
      const syMod = ((sy % (height * 0.8)) + height * 0.8) % (height * 0.8) + height * 0.1;
      const sA = 0.2 + Math.sin(time * 1.5 + i * 1.2) * 0.1;

      ctx.fillStyle = `rgba(180, 210, 160, ${sA})`;
      ctx.beginPath();
      ctx.arc(sx, syMod, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(180, 210, 160, ${sA * 0.25})`;
      ctx.beginPath();
      ctx.arc(sx, syMod, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十六B層：飄落樹葉＋貓頭鷹剪影
    // ═══════════════════════════════════════════
    ctx.save();
    // 飄落樹葉（暗色枯葉飄落）
    for (let i = 0; i < 15; i++) {
      const leafBaseX = this.stableNoise(i, 700) * width;
      const leafBaseY = this.stableNoise(i, 701) * height * 0.25;
      const leafPhase = (time * 0.06 + this.stableNoise(i, 702) * 6.28) % 6.28;
      const leafT = leafPhase / 6.28;
      const leafX = leafBaseX + Math.sin(time * 0.35 + i * 1.5) * 55 + leafT * 35;
      const leafY = leafBaseY + leafT * height * 0.72;
      const leafRot = time * 0.45 + i * 1.2 + Math.sin(time * 0.7 + i) * 1.8;
      const leafA = 0.28 - leafT * 0.18;
      if (leafA > 0.02) {
        ctx.save();
        ctx.translate(leafX % width, leafY);
        ctx.rotate(leafRot);
        // 葉身
        const leafColors = ['rgba(35, 50, 20,', 'rgba(50, 40, 18,', 'rgba(28, 42, 22,'];
        ctx.fillStyle = `${leafColors[i % 3]} ${leafA})`;
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.quadraticCurveTo(-2, -3, 0, -3.5);
        ctx.quadraticCurveTo(2, -3, 5, 0);
        ctx.quadraticCurveTo(2, 2.5, 0, 3);
        ctx.quadraticCurveTo(-2, 2.5, -5, 0);
        ctx.closePath();
        ctx.fill();
        // 葉脈
        ctx.strokeStyle = `rgba(25, 38, 16, ${leafA * 0.4})`;
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(4, 0);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 貓頭鷹剪影（棲息在右巨樹枝上）
    const owlX = rtX - 58;
    const owlY = ltBase - 210;
    ctx.fillStyle = 'rgba(5, 10, 5, 0.88)';
    // 身體
    ctx.beginPath();
    ctx.ellipse(owlX, owlY, 9, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // 頭部
    ctx.beginPath();
    ctx.arc(owlX, owlY - 13, 8, 0, Math.PI * 2);
    ctx.fill();
    // 耳羽
    ctx.beginPath();
    ctx.moveTo(owlX - 5, owlY - 18);
    ctx.lineTo(owlX - 8, owlY - 25);
    ctx.lineTo(owlX - 2, owlY - 19);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(owlX + 5, owlY - 18);
    ctx.lineTo(owlX + 8, owlY - 25);
    ctx.lineTo(owlX + 2, owlY - 19);
    ctx.closePath();
    ctx.fill();
    // 翅膀輪廓
    ctx.beginPath();
    ctx.ellipse(owlX - 7, owlY + 2, 4, 10, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(owlX + 7, owlY + 2, 4, 10, -0.15, 0, Math.PI * 2);
    ctx.fill();
    // 眼睛（偶爾眨眼的金色大眼）
    const owlBlink = Math.sin(time * 0.18);
    if (owlBlink > -0.93) {
      const owlEyeA = 0.65 + Math.sin(time * 1.1) * 0.12;
      // 眼光暈
      const owlGlow = ctx.createRadialGradient(owlX, owlY - 13, 0, owlX, owlY - 13, 18);
      owlGlow.addColorStop(0, `rgba(255, 195, 55, ${owlEyeA * 0.1})`);
      owlGlow.addColorStop(1, 'rgba(255, 195, 55, 0)');
      ctx.fillStyle = owlGlow;
      ctx.beginPath();
      ctx.arc(owlX, owlY - 13, 18, 0, Math.PI * 2);
      ctx.fill();
      // 左眼
      ctx.fillStyle = `rgba(255, 200, 55, ${owlEyeA})`;
      ctx.beginPath();
      ctx.arc(owlX - 3.5, owlY - 13, 2, 0, Math.PI * 2);
      ctx.fill();
      // 瞳孔
      ctx.fillStyle = `rgba(10, 10, 5, ${owlEyeA})`;
      ctx.beginPath();
      ctx.arc(owlX - 3.5, owlY - 13, 0.8, 0, Math.PI * 2);
      ctx.fill();
      // 右眼
      ctx.fillStyle = `rgba(255, 200, 55, ${owlEyeA})`;
      ctx.beginPath();
      ctx.arc(owlX + 3.5, owlY - 13, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(10, 10, 5, ${owlEyeA})`;
      ctx.beginPath();
      ctx.arc(owlX + 3.5, owlY - 13, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    // 爪子（抓住樹枝）
    ctx.strokeStyle = 'rgba(5, 10, 5, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(owlX - 3, owlY + 11);
    ctx.lineTo(owlX - 5, owlY + 14);
    ctx.moveTo(owlX - 3, owlY + 11);
    ctx.lineTo(owlX - 1, owlY + 14);
    ctx.moveTo(owlX + 3, owlY + 11);
    ctx.lineTo(owlX + 1, owlY + 14);
    ctx.moveTo(owlX + 3, owlY + 11);
    ctx.lineTo(owlX + 5, owlY + 14);
    ctx.stroke();
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十七層：濃霧層（多層深度）
    // ═══════════════════════════════════════════
    ctx.save();
    // 低層地面霧
    for (let i = 0; i < 8; i++) {
      const fogX = width * (0.02 + i * 0.14) + Math.sin(time * 0.15 + i * 1.4) * 60;
      const fogY = height * (0.76 + (i % 3) * 0.04);
      const fogA = 0.035 + Math.sin(time * 0.2 + i * 0.9) * 0.012;
      ctx.fillStyle = `rgba(140, 170, 150, ${fogA})`;
      ctx.beginPath();
      ctx.ellipse(fogX, fogY, 240 + i * 20, 30 + i * 4, 0.03 * i, 0, Math.PI * 2);
      ctx.fill();
    }
    // 中層飄霧
    for (let i = 0; i < 5; i++) {
      const fogX = width * (0.1 + i * 0.22) + Math.sin(time * 0.1 + i * 2) * 80 + time * 3;
      const fogXmod = ((fogX % (width + 400)) + width + 400) % (width + 400) - 200;
      const fogY = height * (0.58 + (i % 2) * 0.1);
      ctx.fillStyle = `rgba(100, 140, 130, ${0.025 + (i % 2) * 0.008})`;
      ctx.beginPath();
      ctx.ellipse(fogXmod, fogY, 280, 40, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十八層：樹冠天蓬框架（上方暗幕）
    // ═══════════════════════════════════════════
    ctx.save();
    // 上方樹冠暗幕
    const canopyDark = ctx.createLinearGradient(0, 0, 0, height * 0.2);
    canopyDark.addColorStop(0, 'rgba(4, 10, 4, 0.7)');
    canopyDark.addColorStop(0.5, 'rgba(6, 14, 6, 0.35)');
    canopyDark.addColorStop(1, 'rgba(8, 18, 8, 0)');
    ctx.fillStyle = canopyDark;
    ctx.fillRect(0, 0, width, height * 0.2);

    // 不規則樹冠邊緣
    ctx.fillStyle = 'rgba(6, 12, 6, 0.55)';
    for (let i = 0; i < 12; i++) {
      const cx = i * (width / 11) + this.stableCentered(i, 550, 30);
      const cr = this.stableRange(i, 551, 40, 90);
      ctx.beginPath();
      ctx.arc(cx, 0, cr, 0, Math.PI);
      ctx.fill();
    }

    // 月光在樹冠間的縫隙（光束）
    for (let i = 0; i < 4; i++) {
      const beamX = width * (0.25 + i * 0.18) + this.stableCentered(i, 560, 20);
      const beamW = this.stableRange(i, 561, 12, 28);
      const beamDrift = Math.sin(time * 0.06 + i * 1.5) * 5;
      const beamGrad = ctx.createLinearGradient(beamX + beamDrift, 0, beamX + beamDrift + beamW * 0.8, height * 0.75);
      beamGrad.addColorStop(0, `rgba(140, 180, 200, ${0.04 + (i % 2) * 0.01})`);
      beamGrad.addColorStop(0.3, `rgba(120, 170, 190, ${0.025 + (i % 2) * 0.005})`);
      beamGrad.addColorStop(1, 'rgba(120, 170, 190, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(beamX + beamDrift - beamW * 0.3, 0);
      ctx.lineTo(beamX + beamDrift + beamW * 0.3, 0);
      ctx.lineTo(beamX + beamDrift + beamW * 1.8, height * 0.75);
      ctx.lineTo(beamX + beamDrift - beamW * 0.5, height * 0.75);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 光束中的塵埃微粒
    ctx.save();
    for (let i = 0; i < 30; i++) {
      const dx = width * (0.2 + this.stableNoise(i, 570) * 0.6);
      const dy = height * (0.05 + this.stableNoise(i, 571) * 0.6);
      const dDrift = Math.sin(time * 0.4 + i * 1.2) * 8;
      const dFall = Math.sin(time * 0.2 + i * 0.7) * 4;
      const dA = 0.08 + Math.sin(time * 2 + i * 1.6) * 0.05;
      ctx.fillStyle = `rgba(180, 200, 210, ${dA})`;
      ctx.beginPath();
      ctx.arc(dx + dDrift, dy + dFall, 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ═══════════════════════════════════════════
    //  第十九層：電影暈映 (Vignette)
    // ═══════════════════════════════════════════
    ctx.save();
    const vignette = ctx.createRadialGradient(
      width * 0.5, height * 0.5, width * 0.12,
      width * 0.5, height * 0.5, width * 0.85
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.75, 'rgba(2, 6, 2, 0.25)');
    vignette.addColorStop(1, 'rgba(2, 6, 2, 0.55)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  renderCastleMoonrise(ctx, width, height) {
    const time = Date.now() * 0.001;

    const drawRoofTier = (centerX, baseY, roofWidth, roofHeight, colorTop, colorBottom, trimColor) => {
      const tipLift = roofHeight * 0.28;
      const wing = roofWidth * 0.08;
      const roofGradient = ctx.createLinearGradient(centerX, baseY - roofHeight, centerX, baseY + 14);
      roofGradient.addColorStop(0, colorTop);
      roofGradient.addColorStop(1, colorBottom);
      ctx.fillStyle = roofGradient;
      ctx.beginPath();
      ctx.moveTo(centerX - roofWidth / 2 - wing, baseY + 4);
      ctx.quadraticCurveTo(centerX - roofWidth * 0.36, baseY - roofHeight * 0.1, centerX - roofWidth * 0.28, baseY - roofHeight * 0.78);
      ctx.lineTo(centerX, baseY - roofHeight);
      ctx.lineTo(centerX + roofWidth * 0.28, baseY - roofHeight * 0.78);
      ctx.quadraticCurveTo(centerX + roofWidth * 0.36, baseY - roofHeight * 0.1, centerX + roofWidth / 2 + wing, baseY + 4);
      ctx.lineTo(centerX + roofWidth / 2, baseY + roofHeight * 0.16);
      ctx.lineTo(centerX - roofWidth / 2, baseY + roofHeight * 0.16);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = trimColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - roofWidth / 2 - wing, baseY + 4);
      ctx.lineTo(centerX, baseY - roofHeight + tipLift * 0.12);
      ctx.lineTo(centerX + roofWidth / 2 + wing, baseY + 4);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(36, 16, 22, 0.55)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 7; i++) {
        const x = centerX - roofWidth / 2 + (roofWidth / 6) * i;
        ctx.beginPath();
        ctx.moveTo(x, baseY + roofHeight * 0.1);
        ctx.lineTo(centerX, baseY - roofHeight * 0.82);
        ctx.stroke();
      }
    };

    const drawLantern = (x, y, sway, scale = 1) => {
      ctx.save();
      ctx.translate(x, y + sway);
      ctx.strokeStyle = '#7b7267';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -42 * scale);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.fillStyle = '#2c2118';
      ctx.fillRect(-10 * scale, 0, 20 * scale, 5 * scale);
      ctx.fillStyle = '#ffc96e';
      ctx.shadowColor = '#ffc96e';
      ctx.shadowBlur = 18;
      ctx.fillRect(-9 * scale, 5 * scale, 18 * scale, 24 * scale);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#7b5a36';
      ctx.strokeRect(-9 * scale, 5 * scale, 18 * scale, 24 * scale);
      ctx.restore();
    };

    const drawWindowLattice = (
      x,
      y,
      w,
      h,
      glowAlpha = 0.7,
      frameColor = 'rgba(92, 56, 34, 0.72)',
      glowColor = 'rgba(246, 201, 111, 0.95)',
      coreColor = 'rgba(255, 244, 202, 0.95)'
    ) => {
      ctx.save();
      ctx.globalAlpha = glowAlpha;
      ctx.fillStyle = glowColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 24;
      ctx.fillRect(x, y, w, h);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = Math.min(1, glowAlpha + 0.14);
      ctx.fillStyle = coreColor;
      ctx.fillRect(x + 2, y + 2, Math.max(2, w - 4), Math.max(2, h - 4));
      ctx.globalAlpha = glowAlpha * 0.44;
      ctx.fillStyle = 'rgba(94, 54, 88, 0.78)';
      ctx.fillRect(x + 1, y + h * 0.58, Math.max(2, w - 2), Math.max(2, h * 0.42 - 1));
      ctx.globalAlpha = 1;
      ctx.strokeStyle = frameColor;
      ctx.lineWidth = 1.4;
      ctx.strokeRect(x, y, w, h);
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w / 2, y + h);
      ctx.moveTo(x, y + h / 2);
      ctx.lineTo(x + w, y + h / 2);
      ctx.stroke();
      ctx.restore();
    };

    const drawRoofOrnament = (x, y, scale = 1) => {
      ctx.save();
      ctx.translate(x, y);
      const goldGrad = ctx.createLinearGradient(0, -12 * scale, 0, 18 * scale);
      goldGrad.addColorStop(0, '#fff0b1');
      goldGrad.addColorStop(0.45, '#e2b85b');
      goldGrad.addColorStop(1, '#8f6425');
      ctx.fillStyle = goldGrad;
      ctx.shadowColor = 'rgba(255, 224, 150, 0.45)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, -18 * scale);
      ctx.quadraticCurveTo(10 * scale, -12 * scale, 9 * scale, 2 * scale);
      ctx.quadraticCurveTo(8 * scale, 12 * scale, 0, 16 * scale);
      ctx.quadraticCurveTo(-8 * scale, 12 * scale, -9 * scale, 2 * scale);
      ctx.quadraticCurveTo(-10 * scale, -12 * scale, 0, -18 * scale);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(112, 73, 20, 0.65)';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-6 * scale, 12 * scale);
      ctx.quadraticCurveTo(0, 6 * scale, 6 * scale, 12 * scale);
      ctx.stroke();
      ctx.restore();
    };

    const drawSakuraBranch = (startX, startY, direction = 1, scale = 1) => {
      ctx.save();
      ctx.translate(startX, startY);
      ctx.strokeStyle = 'rgba(40, 18, 28, 0.92)';
      ctx.lineCap = 'round';
      ctx.lineWidth = 9 * scale;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(80 * direction * scale, -30 * scale, 130 * direction * scale, -100 * scale, 170 * direction * scale, -150 * scale);
      ctx.stroke();

      const twigs = [
        { x: 36, y: -18, len: 34, bend: -26 },
        { x: 78, y: -56, len: 40, bend: -18 },
        { x: 120, y: -96, len: 34, bend: 8 },
        { x: 148, y: -128, len: 26, bend: 16 }
      ];

      twigs.forEach((twig, index) => {
        ctx.lineWidth = 4.5 * scale;
        ctx.beginPath();
        ctx.moveTo(twig.x * direction * scale, twig.y * scale);
        ctx.quadraticCurveTo(
          (twig.x + twig.len * 0.55) * direction * scale,
          (twig.y + twig.bend) * scale,
          (twig.x + twig.len) * direction * scale,
          (twig.y + twig.bend * 1.4) * scale
        );
        ctx.stroke();

        for (let bloom = 0; bloom < 3; bloom++) {
          const px = (twig.x + twig.len * (0.45 + bloom * 0.16)) * direction * scale;
          const py = (twig.y + twig.bend * (0.8 + bloom * 0.18)) * scale;
          const hue = bloom % 2 === 0 ? 'rgba(255, 211, 230, 0.92)' : 'rgba(255, 185, 214, 0.88)';
          ctx.fillStyle = hue;
          for (let petal = 0; petal < 5; petal++) {
            const angle = (Math.PI * 2 * petal) / 5;
            ctx.beginPath();
            ctx.ellipse(px + Math.cos(angle) * 5 * scale, py + Math.sin(angle) * 5 * scale, 4.2 * scale, 2.8 * scale, angle * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = 'rgba(255, 246, 201, 0.95)';
          ctx.beginPath();
          ctx.arc(px, py, 2 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();
    };

    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#050611');
    sky.addColorStop(0.22, '#11183f');
    sky.addColorStop(0.48, '#3a2f73');
    sky.addColorStop(0.76, '#8e4f85');
    sky.addColorStop(1, '#d37d91');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const auroraMist = ctx.createLinearGradient(0, height * 0.12, 0, height * 0.78);
    auroraMist.addColorStop(0, 'rgba(173, 157, 238, 0.16)');
    auroraMist.addColorStop(0.42, 'rgba(255, 198, 227, 0.14)');
    auroraMist.addColorStop(0.72, 'rgba(255, 228, 241, 0.08)');
    auroraMist.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = auroraMist;
    ctx.fillRect(0, 0, width, height);

    const moonX = width * 0.77;
    const moonY = height * 0.2;
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 170);
    moonGlow.addColorStop(0, 'rgba(248, 250, 255, 0.95)');
    moonGlow.addColorStop(0.18, 'rgba(241, 226, 255, 0.42)');
    moonGlow.addColorStop(0.34, 'rgba(214, 225, 255, 0.36)');
    moonGlow.addColorStop(1, 'rgba(214, 225, 255, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 170, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fbfdff';
    ctx.beginPath();
    ctx.arc(moonX, moonY, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(196, 203, 226, 0.34)';
    ctx.beginPath();
    ctx.arc(moonX - 14, moonY - 8, 8, 0, Math.PI * 2);
    ctx.arc(moonX + 11, moonY + 10, 6, 0, Math.PI * 2);
    ctx.arc(moonX - 4, moonY + 16, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    for (let i = 0; i < 4; i++) {
      const beamWidth = 40 + i * 20;
      const beam = ctx.createLinearGradient(moonX, moonY, moonX - 200 + i * 60, height * 0.88);
      beam.addColorStop(0, 'rgba(244, 236, 255, 0.16)');
      beam.addColorStop(0.4, 'rgba(244, 236, 255, 0.06)');
      beam.addColorStop(1, 'rgba(244, 236, 255, 0)');
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(moonX - beamWidth, moonY + 26);
      ctx.lineTo(moonX + beamWidth, moonY + 26);
      ctx.lineTo(moonX + beamWidth * 2.4, height * 0.88);
      ctx.lineTo(moonX - beamWidth * 1.6, height * 0.88);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    for (let i = 0; i < 48; i++) {
      const x = this.stableNoise(i, 201) * width;
      const y = this.stableNoise(i, 202) * height * 0.68;
      const alpha = 0.3 + Math.sin(time * (0.9 + (i % 5) * 0.04) + i) * 0.18;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      this.drawStar(ctx, x, y, this.stableRange(i, 203, 1.1, 2.7));
    }

    ctx.save();
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i < 2 ? `rgba(246, 223, 244, ${0.16 - i * 0.03})` : `rgba(220, 228, 255, ${0.1 - i * 0.015})`;
      this.drawEnhancedCloud(
        ctx,
        width * (0.08 + i * 0.2) + Math.sin(time * 0.12 + i) * 34,
        height * (0.18 + i * 0.06),
        1.65 + i * 0.22
      );
    }
    ctx.restore();

    this.drawTerrainRibbon(ctx, width, height * 0.66, 14, 0.0035, '#12172c', 1.1, 0.45);
    this.drawTerrainRibbon(ctx, width, height * 0.72, 22, 0.0048, '#181d34', 2.7, 0.68);
    this.drawTerrainRibbon(ctx, width, height * 0.77, 18, 0.007, '#202138', 0.6, 0.9);

    ctx.save();
    ctx.fillStyle = 'rgba(255, 223, 240, 0.1)';
    for (let i = 0; i < 5; i++) {
      const x = width * (0.1 + i * 0.19) + Math.sin(time * 0.15 + i) * 28;
      const y = height * (0.63 + (i % 2) * 0.04);
      ctx.beginPath();
      ctx.ellipse(x, y, 220, 36, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    const centerX = width * 0.5;
    const baseY = height - 92;

    const towerPalette = {
      base: '#171a2b',
      mid: '#22263c',
      upper: '#2d314c',
      core: '#383e5f',
      edge: 'rgba(236, 214, 183, 0.16)',
      shadow: 'rgba(8, 10, 17, 0.28)'
    };

    ctx.fillStyle = towerPalette.base;
    ctx.fillRect(centerX - 218, baseY - 286, 436, 286);
    ctx.fillStyle = towerPalette.mid;
    ctx.fillRect(centerX - 150, baseY - 442, 300, 442);
    ctx.fillStyle = towerPalette.upper;
    ctx.fillRect(centerX - 100, baseY - 578, 200, 578);
    ctx.fillStyle = towerPalette.core;
    ctx.fillRect(centerX - 62, baseY - 688, 124, 688);

    ctx.save();
    ctx.fillStyle = towerPalette.edge;
    ctx.fillRect(centerX + 14, baseY - 688, 48, 688);
    ctx.fillRect(centerX + 34, baseY - 578, 66, 578);
    ctx.fillRect(centerX + 48, baseY - 442, 102, 442);
    ctx.fillRect(centerX + 62, baseY - 286, 156, 286);
    ctx.fillStyle = towerPalette.shadow;
    ctx.fillRect(centerX - 218, baseY - 286, 92, 286);
    ctx.fillRect(centerX - 150, baseY - 442, 68, 442);
    ctx.fillRect(centerX - 100, baseY - 578, 48, 578);
    ctx.fillRect(centerX - 62, baseY - 688, 28, 688);
    ctx.restore();

    drawRoofTier(centerX, baseY - 624, 198, 72, '#7b2533', '#50131d', '#e0b5b0');
    drawRoofTier(centerX, baseY - 492, 284, 60, '#7e2738', '#581722', '#ddb5ac');
    drawRoofTier(centerX, baseY - 354, 376, 52, '#7a2837', '#5a1a24', '#d6b1a8');
    drawRoofTier(centerX, baseY - 202, 474, 46, '#6f2330', '#52161f', '#c9a59d');

    drawRoofOrnament(centerX, baseY - 672, 1.12);
    drawRoofOrnament(centerX - 78, baseY - 614, 0.82);
    drawRoofOrnament(centerX + 78, baseY - 614, 0.82);
    drawRoofOrnament(centerX - 114, baseY - 483, 0.76);
    drawRoofOrnament(centerX + 114, baseY - 483, 0.76);
    drawRoofOrnament(centerX - 150, baseY - 345, 0.72);
    drawRoofOrnament(centerX + 150, baseY - 345, 0.72);

    ctx.save();
    const castleGlow = ctx.createLinearGradient(centerX, baseY - 690, centerX, baseY - 70);
    castleGlow.addColorStop(0, 'rgba(255, 222, 246, 0.18)');
    castleGlow.addColorStop(0.28, 'rgba(203, 214, 255, 0.12)');
    castleGlow.addColorStop(0.62, 'rgba(255, 196, 152, 0.06)');
    castleGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = castleGlow;
    ctx.fillRect(centerX - 210, baseY - 694, 420, 598);
    const halo = ctx.createRadialGradient(centerX, baseY - 470, 0, centerX, baseY - 470, 288);
    halo.addColorStop(0, 'rgba(255, 226, 244, 0.16)');
    halo.addColorStop(0.32, 'rgba(184, 202, 255, 0.11)');
    halo.addColorStop(0.6, 'rgba(255, 187, 143, 0.05)');
    halo.addColorStop(1, 'rgba(177, 196, 255, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(centerX, baseY - 470, 288, 0, Math.PI * 2);
    ctx.fill();
    const verticalBloom = ctx.createLinearGradient(centerX, baseY - 706, centerX, baseY - 100);
    verticalBloom.addColorStop(0, 'rgba(237, 244, 255, 0.12)');
    verticalBloom.addColorStop(0.4, 'rgba(248, 203, 223, 0.08)');
    verticalBloom.addColorStop(1, 'rgba(248, 203, 223, 0)');
    ctx.fillStyle = verticalBloom;
    ctx.fillRect(centerX - 90, baseY - 706, 180, 610);
    ctx.restore();

    ctx.save();
    const posterShadow = ctx.createLinearGradient(0, 0, width, 0);
    posterShadow.addColorStop(0, 'rgba(8, 7, 18, 0.44)');
    posterShadow.addColorStop(0.18, 'rgba(8, 7, 18, 0.12)');
    posterShadow.addColorStop(0.82, 'rgba(8, 7, 18, 0.12)');
    posterShadow.addColorStop(1, 'rgba(8, 7, 18, 0.44)');
    ctx.fillStyle = posterShadow;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    ctx.fillStyle = '#191c2d';
    ctx.fillRect(84, baseY - 210, 92, 210);
    ctx.fillRect(width - 176, baseY - 210, 92, 210);
    drawRoofTier(130, baseY - 206, 118, 42, '#712131', '#4f131d', '#cfada6');
    drawRoofTier(width - 130, baseY - 206, 118, 42, '#712131', '#4f131d', '#cfada6');
    drawRoofOrnament(130, baseY - 238, 0.58);
    drawRoofOrnament(width - 130, baseY - 238, 0.58);

    ctx.save();
    ctx.strokeStyle = 'rgba(228, 206, 171, 0.18)';
    ctx.lineWidth = 1;
    [
      { x: centerX - 218, y: baseY - 286, w: 436, h: 286, rows: 3, cols: 7 },
      { x: centerX - 150, y: baseY - 442, w: 300, h: 442, rows: 5, cols: 5 },
      { x: centerX - 100, y: baseY - 578, w: 200, h: 578, rows: 6, cols: 4 },
      { x: centerX - 62, y: baseY - 688, w: 124, h: 688, rows: 8, cols: 3 }
    ].forEach(section => {
      for (let row = 1; row < section.rows; row++) {
        const y = section.y + (section.h / section.rows) * row;
        ctx.beginPath();
        ctx.moveTo(section.x, y);
        ctx.lineTo(section.x + section.w, y);
        ctx.stroke();
      }
      for (let col = 1; col < section.cols; col++) {
        const x = section.x + (section.w / section.cols) * col;
        ctx.beginPath();
        ctx.moveTo(x, section.y);
        ctx.lineTo(x, section.y + section.h);
        ctx.stroke();
      }
    });
    ctx.restore();

    const windowRows = [
      {
        y: baseY - 646,
        count: 2,
        spacing: 38,
        width: 18,
        height: 28,
        offset: 28,
        glowColor: 'rgba(163, 214, 255, 0.94)',
        coreColor: 'rgba(243, 251, 255, 0.96)',
        frameColor: 'rgba(88, 109, 132, 0.72)'
      },
      {
        y: baseY - 586,
        count: 2,
        spacing: 38,
        width: 18,
        height: 28,
        offset: 28,
        glowColor: 'rgba(202, 183, 255, 0.92)',
        coreColor: 'rgba(249, 238, 255, 0.95)',
        frameColor: 'rgba(102, 82, 130, 0.72)'
      },
      {
        y: baseY - 518,
        count: 3,
        spacing: 36,
        width: 18,
        height: 28,
        offset: 38,
        glowColor: 'rgba(255, 205, 170, 0.92)',
        coreColor: 'rgba(255, 244, 208, 0.96)',
        frameColor: 'rgba(124, 85, 58, 0.72)'
      },
      {
        y: baseY - 454,
        count: 3,
        spacing: 36,
        width: 18,
        height: 28,
        offset: 38,
        glowColor: 'rgba(255, 183, 128, 0.94)',
        coreColor: 'rgba(255, 230, 182, 0.94)',
        frameColor: 'rgba(132, 78, 45, 0.76)'
      },
      {
        y: baseY - 384,
        count: 4,
        spacing: 38,
        width: 20,
        height: 30,
        offset: 60,
        glowColor: 'rgba(255, 151, 110, 0.94)',
        coreColor: 'rgba(255, 214, 158, 0.94)',
        frameColor: 'rgba(142, 72, 42, 0.78)'
      },
      {
        y: baseY - 312,
        count: 4,
        spacing: 40,
        width: 20,
        height: 30,
        offset: 62,
        glowColor: 'rgba(255, 135, 124, 0.96)',
        coreColor: 'rgba(255, 208, 181, 0.92)',
        frameColor: 'rgba(148, 68, 56, 0.78)'
      },
      {
        y: baseY - 236,
        count: 5,
        spacing: 42,
        width: 22,
        height: 32,
        offset: 96,
        glowColor: 'rgba(255, 111, 120, 0.98)',
        coreColor: 'rgba(255, 203, 188, 0.92)',
        frameColor: 'rgba(153, 60, 63, 0.82)'
      }
    ];
    windowRows.forEach((row, rowIndex) => {
      for (let col = 0; col < row.count; col++) {
        const x = centerX - row.offset + col * row.spacing;
        const alpha = 0.58 + Math.sin(time * 1.8 + rowIndex * 0.8 + col) * 0.18;
        drawWindowLattice(x, row.y, row.width, row.height, alpha, row.frameColor, row.glowColor, row.coreColor);
      }
    });

    const sideTowerWindows = [
      { x: 108, y: baseY - 188 },
      { x: 132, y: baseY - 188 },
      { x: width - 152, y: baseY - 188 },
      { x: width - 128, y: baseY - 188 }
    ];
    sideTowerWindows.forEach((window, index) => {
      drawWindowLattice(
        window.x,
        window.y,
        16,
        24,
        0.5 + Math.sin(time * 1.6 + index) * 0.14,
        'rgba(130, 75, 48, 0.72)',
        'rgba(255, 168, 112, 0.88)',
        'rgba(255, 228, 194, 0.9)'
      );
    });

    ctx.save();
    ctx.fillStyle = 'rgba(255, 228, 168, 0.18)';
    [
      { x: centerX, y: baseY - 658, w: 20, h: 10 },
      { x: centerX, y: baseY - 526, w: 22, h: 10 },
      { x: centerX, y: baseY - 388, w: 24, h: 10 },
      { x: centerX, y: baseY - 236, w: 26, h: 12 }
    ].forEach(detail => {
      const grad = ctx.createLinearGradient(detail.x, detail.y, detail.x, detail.y + detail.h);
      grad.addColorStop(0, '#fff0b6');
      grad.addColorStop(0.5, '#d8a548');
      grad.addColorStop(1, '#7c5420');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(detail.x - detail.w / 2, detail.y);
      ctx.lineTo(detail.x + detail.w / 2, detail.y);
      ctx.lineTo(detail.x + detail.w / 2 - 4, detail.y + detail.h);
      ctx.lineTo(detail.x - detail.w / 2 + 4, detail.y + detail.h);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = 'rgba(240, 210, 175, 0.16)';
    ctx.lineWidth = 1;
    [
      { y: baseY - 619, width: 176 },
      { y: baseY - 488, width: 262 },
      { y: baseY - 350, width: 352 },
      { y: baseY - 198, width: 446 }
    ].forEach((tier, index) => {
      for (let i = 0; i < 10 + index * 2; i++) {
        const x = centerX - tier.width / 2 + (tier.width / (9 + index * 2)) * i;
        ctx.beginPath();
        ctx.moveTo(x, tier.y + 2);
        ctx.lineTo(x + 8, tier.y + 24 + index * 2);
        ctx.stroke();
      }
    });
    ctx.restore();

    ctx.fillStyle = '#0f111b';
    ctx.beginPath();
    ctx.moveTo(centerX - 54, baseY - 100);
    ctx.lineTo(centerX, baseY - 140);
    ctx.lineTo(centerX + 54, baseY - 100);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(centerX - 26, baseY - 100, 52, 100);
    ctx.strokeStyle = 'rgba(146, 124, 96, 0.55)';
    ctx.strokeRect(centerX - 26, baseY - 100, 52, 100);

    for (let i = 0; i < 8; i++) {
      const x = centerX - 230 + i * 66;
      drawLantern(x, baseY - 160, Math.sin(time * 2 + i) * 4, 1);
    }

    const roofGround = ctx.createLinearGradient(0, baseY, 0, height);
    roofGround.addColorStop(0, '#69707c');
    roofGround.addColorStop(0.45, '#424851');
    roofGround.addColorStop(1, '#272b31');
    ctx.fillStyle = roofGround;
    ctx.fillRect(0, baseY, width, 100);

    ctx.strokeStyle = 'rgba(27, 30, 38, 0.78)';
    ctx.lineWidth = 1.8;
    for (let x = -20; x < width + 40; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x + 34, height);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(99, 106, 116, 0.32)';
    for (let y = baseY + 12; y < height; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(244, 225, 236, 0.72)';
    for (let i = 0; i < 18; i++) {
      const driftX = (this.stableNoise(i, 204) * width + time * (12 + i * 0.8)) % (width + 80) - 40;
      const driftY = height * 0.14 + this.stableNoise(i, 205) * height * 0.52 + Math.sin(time * 0.9 + i) * 16;
      ctx.save();
      ctx.translate(driftX, driftY);
      ctx.rotate(time * 0.55 + i * 0.8);
      ctx.beginPath();
      ctx.ellipse(0, 0, 4.6, 2.2, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    drawSakuraBranch(0, height * 0.18, 1, 1.08);
    drawSakuraBranch(width, height * 0.1, -1, 1.18);
    ctx.restore();

    ctx.save();
    for (let i = 0; i < 12; i++) {
      const glowX = width * (0.12 + this.stableNoise(i, 206) * 0.76);
      const glowY = baseY - 90 + this.stableCentered(i, 207, 18);
      ctx.fillStyle = 'rgba(255, 198, 222, 0.18)';
      ctx.beginPath();
      ctx.arc(glowX, glowY, 18 + this.stableNoise(i, 208) * 14, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  renderCrimsonDeck(ctx, width, height) {
    const time = Date.now() * 0.001;
    const stormCycle = time % 25;
    const lightningWindow = stormCycle < 0.9 ? Math.sin((stormCycle / 0.9) * Math.PI) : 0;

    const drawWaveBand = (baseY, amplitude, color, alpha, speed, detail = 0.013) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, baseY);
      for (let x = 0; x <= width; x += 12) {
        const swell = Math.sin(x * detail + time * speed) * amplitude;
        const chop = Math.sin(x * detail * 2.2 + time * (speed * 1.6) + 1.4) * amplitude * 0.32;
        ctx.lineTo(x, baseY + swell + chop);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawSprayCluster = (originX, originY, spreadX, spreadY, count, color) => {
      ctx.save();
      ctx.fillStyle = color;
      for (let i = 0; i < count; i++) {
        const px = originX + this.stableCentered(i, originX * 0.1 + spreadX, spreadX);
        const py = originY + this.stableCentered(i, originY * 0.1 + spreadY, spreadY);
        const size = this.stableRange(i, spreadX + spreadY, 1.6, 5.2);
        ctx.beginPath();
        ctx.ellipse(px, py, size, size * 0.44, -0.38, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const sky = ctx.createLinearGradient(0, 0, 0, height * 0.78);
    sky.addColorStop(0, '#0d1024');
    sky.addColorStop(0.18, '#40204c');
    sky.addColorStop(0.4, '#8d3150');
    sky.addColorStop(0.62, '#db6448');
    sky.addColorStop(0.82, '#f4b16b');
    sky.addColorStop(1, '#f2d8ae');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const stormVeil = ctx.createLinearGradient(0, 0, width, height * 0.7);
    stormVeil.addColorStop(0, 'rgba(18, 22, 45, 0.46)');
    stormVeil.addColorStop(0.35, 'rgba(110, 29, 63, 0.08)');
    stormVeil.addColorStop(1, 'rgba(255, 188, 114, 0.04)');
    ctx.fillStyle = stormVeil;
    ctx.fillRect(0, 0, width, height);

    const sunX = width * 0.76;
    const sunY = height * 0.48;
    const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 180);
    glow.addColorStop(0, 'rgba(255, 244, 205, 0.96)');
    glow.addColorStop(0.22, 'rgba(255, 207, 130, 0.52)');
    glow.addColorStop(0.56, 'rgba(255, 121, 80, 0.18)');
    glow.addColorStop(1, 'rgba(255, 121, 80, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 180, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffe2a0';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 46, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i < 2 ? 'rgba(43, 28, 53, 0.46)' : i < 4 ? 'rgba(118, 50, 70, 0.25)' : 'rgba(255, 206, 162, 0.18)';
      this.drawEnhancedCloud(
        ctx,
        width * (0.04 + i * 0.17) + Math.sin(time * 0.08 + i) * 18,
        height * (0.12 + i * 0.055),
        1.25 + i * 0.16
      );
    }
    ctx.restore();

    ctx.save();
    for (let i = 0; i < 5; i++) {
      const beamWidth = 42 + i * 24;
      const beam = ctx.createLinearGradient(sunX, sunY, sunX - 260 + i * 36, height);
      beam.addColorStop(0, 'rgba(255, 223, 176, 0.14)');
      beam.addColorStop(0.42, 'rgba(255, 183, 133, 0.08)');
      beam.addColorStop(1, 'rgba(255, 183, 133, 0)');
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(sunX - beamWidth, sunY + 28);
      ctx.lineTo(sunX + beamWidth, sunY + 28);
      ctx.lineTo(sunX + beamWidth * 1.7, height);
      ctx.lineTo(sunX - beamWidth * 2.3, height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 🏝️ 遠方岩島剪影
    ctx.save();
    ctx.fillStyle = 'rgba(18, 22, 38, 0.72)';
    ctx.beginPath();
    ctx.moveTo(width * 0.02, height * 0.56);
    ctx.quadraticCurveTo(width * 0.06, height * 0.42, width * 0.1, height * 0.52);
    ctx.quadraticCurveTo(width * 0.12, height * 0.48, width * 0.15, height * 0.54);
    ctx.lineTo(width * 0.17, height * 0.58);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(14, 18, 32, 0.55)';
    ctx.beginPath();
    ctx.moveTo(width * 0.88, height * 0.50);
    ctx.quadraticCurveTo(width * 0.91, height * 0.43, width * 0.94, height * 0.48);
    ctx.lineTo(width * 0.96, height * 0.54);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 🐦 海鷗群
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 240, 232, 0.82)';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    const gulls = [
      { bx: 0.15, by: 0.14, s: 1.0 },
      { bx: 0.20, by: 0.11, s: 0.8 },
      { bx: 0.24, by: 0.16, s: 0.65 },
      { bx: 0.60, by: 0.09, s: 0.7 },
      { bx: 0.55, by: 0.13, s: 0.9 },
      { bx: 0.42, by: 0.22, s: 1.1 }
    ];
    gulls.forEach((g, i) => {
      const gx = width * g.bx + Math.sin(time * 0.6 + i * 2.1) * 18;
      const gy = height * g.by + Math.sin(time * 1.2 + i * 1.7) * 6;
      const wingFlap = Math.sin(time * 4.5 + i * 2.4) * 8 * g.s;
      ctx.beginPath();
      ctx.moveTo(gx - 12 * g.s, gy + wingFlap);
      ctx.quadraticCurveTo(gx - 4 * g.s, gy - 4 * g.s, gx, gy);
      ctx.quadraticCurveTo(gx + 4 * g.s, gy - 4 * g.s, gx + 12 * g.s, gy + wingFlap);
      ctx.stroke();
    });
    ctx.restore();

    if (lightningWindow > 0) {
      ctx.save();
      const boltCore = `rgba(255, 120, 96, ${0.58 * lightningWindow})`;
      const boltGlow = `rgba(255, 68, 68, ${0.22 * lightningWindow})`;
      const slash = new Path2D();
      slash.moveTo(width * 0.14, -20);
      slash.lineTo(width * 0.24, 0);
      slash.lineTo(width * 0.54, height * 0.46);
      slash.lineTo(width * 0.7, height * 0.44);
      slash.lineTo(width * 0.48, height * 0.78);
      slash.lineTo(width * 0.58, height * 0.76);
      slash.lineTo(width * 0.34, height + 40);
      slash.lineTo(width * 0.22, height);
      slash.lineTo(width * 0.42, height * 0.64);
      slash.lineTo(width * 0.28, height * 0.66);
      slash.closePath();

      ctx.fillStyle = boltGlow;
      ctx.shadowColor = `rgba(255, 78, 78, ${0.5 * lightningWindow})`;
      ctx.shadowBlur = 36;
      ctx.fill(slash);

      ctx.shadowBlur = 0;
      ctx.fillStyle = boltCore;
      ctx.fill(slash);

      ctx.strokeStyle = `rgba(255, 242, 218, ${0.85 * lightningWindow})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(width * 0.18, 0);
      ctx.lineTo(width * 0.49, height * 0.45);
      ctx.lineTo(width * 0.53, height * 0.46);
      ctx.lineTo(width * 0.37, height);
      ctx.stroke();

      const flashWash = ctx.createLinearGradient(width * 0.1, 0, width * 0.62, height);
      flashWash.addColorStop(0, `rgba(255, 110, 92, ${0.16 * lightningWindow})`);
      flashWash.addColorStop(0.45, `rgba(255, 166, 118, ${0.09 * lightningWindow})`);
      flashWash.addColorStop(1, 'rgba(255, 166, 118, 0)');
      ctx.fillStyle = flashWash;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    drawWaveBand(height * 0.58, 14, '#233452', 0.9, 0.7, 0.01);
    drawWaveBand(height * 0.64, 20, '#1c3152', 0.94, 1.05, 0.012);
    drawWaveBand(height * 0.72, 30, '#142945', 0.98, 1.3, 0.014);
    drawWaveBand(height * 0.81, 42, '#0d1e35', 1, 1.7, 0.016);

    // 🌊 浪花白沫 (whitecaps)
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
    for (let i = 0; i < 14; i++) {
      const foamX = this.stableNoise(i, 311) * width;
      const foamBaseY = height * (0.58 + this.stableNoise(i, 312) * 0.24);
      const foamY = foamBaseY + Math.sin(time * (1.2 + i * 0.15) + i * 1.8) * (6 + i * 1.2);
      const foamW = 18 + this.stableNoise(i, 313) * 28;
      const foamAlpha = 0.16 + Math.sin(time * 2.0 + i * 0.9) * 0.12;
      ctx.globalAlpha = foamAlpha;
      ctx.beginPath();
      ctx.ellipse(foamX, foamY, foamW, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    // 🌊 波峰泡沫線
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.4;
    for (let band = 0; band < 3; band++) {
      const bandY = height * (0.59 + band * 0.08);
      ctx.beginPath();
      for (let x = 0; x <= width; x += 8) {
        const y = bandY + Math.sin(x * 0.018 + time * (1.8 - band * 0.2) + band) * (3 + band * 1.5);
        const noise = Math.sin(x * 0.06 + time * 3.2 + band * 2) * 1.5;
        if (x === 0) ctx.moveTo(x, y + noise);
        else ctx.lineTo(x, y + noise);
      }
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(255, 196, 134, 0.18)';
    ctx.beginPath();
    ctx.moveTo(sunX - 32, height * 0.57);
    ctx.lineTo(sunX + 32, height * 0.57);
    ctx.lineTo(sunX + 110, height - 108);
    ctx.lineTo(sunX - 150, height - 108);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    for (let band = 0; band < 7; band++) {
      ctx.strokeStyle = `rgba(255, ${220 - band * 8}, ${180 - band * 10}, ${0.06 + band * 0.02})`;
      ctx.lineWidth = 1.6 + band * 0.35;
      ctx.beginPath();
      for (let x = 0; x <= width; x += 12) {
        const y = height * (0.61 + band * 0.045) + Math.sin(x * 0.015 + time * (1.6 - band * 0.1) + band * 0.8) * (4 + band * 2.2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 🌊 右側大浪（自然波浪，非巨獸造型）
    ctx.save();
    const bigWave1 = ctx.createLinearGradient(width * 0.65, height * 0.58, width, height * 0.82);
    bigWave1.addColorStop(0, 'rgba(28, 52, 78, 0.35)');
    bigWave1.addColorStop(0.5, 'rgba(18, 36, 58, 0.6)');
    bigWave1.addColorStop(1, 'rgba(10, 18, 32, 0.75)');
    ctx.fillStyle = bigWave1;
    ctx.beginPath();
    ctx.moveTo(width * 0.6, height * 0.76);
    ctx.quadraticCurveTo(width * 0.72, height * 0.62, width * 0.82, height * 0.64);
    ctx.quadraticCurveTo(width * 0.92, height * 0.66, width * 1.02, height * 0.72);
    ctx.lineTo(width * 1.02, height * 0.84);
    ctx.quadraticCurveTo(width * 0.88, height * 0.8, width * 0.74, height * 0.82);
    ctx.quadraticCurveTo(width * 0.66, height * 0.82, width * 0.6, height * 0.76);
    ctx.closePath();
    ctx.fill();
    // 浪峰白線
    ctx.strokeStyle = 'rgba(220, 240, 255, 0.3)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.62, height * 0.74);
    ctx.quadraticCurveTo(width * 0.72, height * 0.63, width * 0.83, height * 0.65);
    ctx.quadraticCurveTo(width * 0.93, height * 0.67, width * 1.0, height * 0.72);
    ctx.stroke();
    ctx.restore();

    // 🌊 左側遠浪
    ctx.save();
    const bigWave2 = ctx.createLinearGradient(0, height * 0.6, width * 0.4, height * 0.82);
    bigWave2.addColorStop(0, 'rgba(22, 42, 66, 0.4)');
    bigWave2.addColorStop(0.6, 'rgba(14, 28, 48, 0.55)');
    bigWave2.addColorStop(1, 'rgba(8, 16, 30, 0.65)');
    ctx.fillStyle = bigWave2;
    ctx.beginPath();
    ctx.moveTo(-10, height * 0.74);
    ctx.quadraticCurveTo(width * 0.08, height * 0.66, width * 0.18, height * 0.68);
    ctx.quadraticCurveTo(width * 0.28, height * 0.7, width * 0.38, height * 0.76);
    ctx.lineTo(width * 0.38, height * 0.84);
    ctx.lineTo(-10, height * 0.84);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(210, 235, 255, 0.22)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, height * 0.73);
    ctx.quadraticCurveTo(width * 0.08, height * 0.66, width * 0.18, height * 0.68);
    ctx.quadraticCurveTo(width * 0.28, height * 0.7, width * 0.36, height * 0.75);
    ctx.stroke();
    ctx.restore();

    drawSprayCluster(width * 0.78, height * 0.66, 60, 28, 18, 'rgba(230, 244, 255, 0.32)');
    drawSprayCluster(width * 0.14, height * 0.7, 50, 22, 14, 'rgba(220, 240, 255, 0.24)');

    const deckTop = height - 126;
    const deck = ctx.createLinearGradient(0, deckTop, 0, height);
    deck.addColorStop(0, '#8b5e3e');
    deck.addColorStop(0.4, '#5d3923');
    deck.addColorStop(1, '#2f1a11');
    ctx.fillStyle = deck;
    ctx.beginPath();
    ctx.moveTo(0, deckTop + 34);
    ctx.lineTo(width, deckTop - 18);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    const wetGlow = ctx.createLinearGradient(0, deckTop, width, height);
    wetGlow.addColorStop(0, 'rgba(255, 188, 132, 0.08)');
    wetGlow.addColorStop(0.42, 'rgba(255, 221, 180, 0.16)');
    wetGlow.addColorStop(1, 'rgba(23, 31, 48, 0.05)');
    ctx.fillStyle = wetGlow;
    ctx.beginPath();
    ctx.moveTo(0, deckTop + 34);
    ctx.lineTo(width, deckTop - 18);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = 'rgba(59, 31, 17, 0.62)';
    ctx.lineWidth = 3;
    for (let x = -20; x <= width + 40; x += 42) {
      ctx.beginPath();
      ctx.moveTo(x, deckTop + 36);
      ctx.lineTo(x + 10, height);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(113, 74, 43, 0.84)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, deckTop + 24);
    ctx.lineTo(width, deckTop - 24);
    ctx.stroke();

    for (let i = 0; i < Math.floor(width / 62) + 2; i++) {
      ctx.fillStyle = '#5e3922';
      ctx.fillRect(i * 62, deckTop + 4 - i * 0.22, 7, 18);
    }

    ctx.save();
    ctx.strokeStyle = 'rgba(34, 20, 12, 0.86)';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(width * 0.04, deckTop + 30);
    ctx.bezierCurveTo(width * 0.12, deckTop - 8, width * 0.2, deckTop + 58, width * 0.28, deckTop + 10);
    ctx.moveTo(width * 0.18, deckTop + 6);
    ctx.bezierCurveTo(width * 0.24, deckTop - 24, width * 0.31, deckTop + 12, width * 0.37, deckTop - 32);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(128, 93, 68, 0.72)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(width * 0.12, deckTop + 18);
    ctx.lineTo(width * 0.142, deckTop + 6);
    ctx.moveTo(width * 0.146, deckTop + 28);
    ctx.lineTo(width * 0.164, deckTop + 12);
    ctx.moveTo(width * 0.284, deckTop + 14);
    ctx.lineTo(width * 0.306, deckTop + 2);
    ctx.moveTo(width * 0.346, deckTop - 4);
    ctx.lineTo(width * 0.362, deckTop - 16);
    ctx.stroke();
    ctx.restore();

    const rearMastX = width * 0.8;
    const rearMastTop = height * 0.16;
    const rearMastGrad = ctx.createLinearGradient(rearMastX - 8, 0, rearMastX + 8, 0);
    rearMastGrad.addColorStop(0, '#3f2a1c');
    rearMastGrad.addColorStop(0.5, '#755035');
    rearMastGrad.addColorStop(1, '#3f2a1c');
    ctx.fillStyle = rearMastGrad;
    ctx.fillRect(rearMastX - 8, rearMastTop, 16, deckTop - rearMastTop + 24);
    ctx.strokeStyle = 'rgba(80, 56, 37, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rearMastX, rearMastTop + 8);
    ctx.lineTo(rearMastX - 132, deckTop - 122);
    ctx.moveTo(rearMastX, rearMastTop + 10);
    ctx.lineTo(rearMastX + 84, deckTop - 136);
    ctx.stroke();

    const mastX = width * 0.27;
    const mastTop = height * 0.03;
    const mastBottom = deckTop + 30;
    const mastGrad = ctx.createLinearGradient(mastX - 10, 0, mastX + 10, 0);
    mastGrad.addColorStop(0, '#341f16');
    mastGrad.addColorStop(0.5, '#7d5438');
    mastGrad.addColorStop(1, '#341f16');
    ctx.fillStyle = mastGrad;
    ctx.fillRect(mastX - 10, mastTop, 20, mastBottom - mastTop);

    ctx.save();
    ctx.fillStyle = 'rgba(22, 16, 21, 0.92)';
    const billow = Math.sin(time * 1.2) * 18;
    ctx.beginPath();
    ctx.moveTo(mastX + 14, mastTop + 24);
    ctx.quadraticCurveTo(mastX + 188 + billow, mastTop + 20, mastX + 278, mastTop + 128);
    ctx.lineTo(mastX + 236, mastTop + 386);
    ctx.lineTo(mastX + 184, mastTop + 340);
    ctx.lineTo(mastX + 166, mastTop + 392);
    ctx.lineTo(mastX + 126, mastTop + 314);
    ctx.quadraticCurveTo(mastX + 86 - billow * 0.55, mastTop + 306, mastX + 8, mastTop + 286);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    const sailRim = ctx.createLinearGradient(mastX + 8, mastTop + 18, mastX + 252, mastTop + 340);
    sailRim.addColorStop(0, 'rgba(255, 231, 188, 0.28)');
    sailRim.addColorStop(0.38, 'rgba(255, 157, 118, 0.1)');
    sailRim.addColorStop(1, 'rgba(255, 157, 118, 0)');
    ctx.strokeStyle = sailRim;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(mastX + 14, mastTop + 24);
    ctx.quadraticCurveTo(mastX + 188 + billow, mastTop + 20, mastX + 278, mastTop + 128);
    ctx.lineTo(mastX + 236, mastTop + 386);
    ctx.lineTo(mastX + 184, mastTop + 340);
    ctx.lineTo(mastX + 166, mastTop + 392);
    ctx.lineTo(mastX + 126, mastTop + 314);
    ctx.quadraticCurveTo(mastX + 86 - billow * 0.55, mastTop + 306, mastX + 8, mastTop + 286);
    ctx.stroke();
    ctx.restore();

    // 🚩 桅杆戰旗
    ctx.save();
    const flagX = mastX + 4;
    const flagY = mastTop - 4;
    const flagW = 58;
    const flagH = 36;
    const flagWave = Math.sin(time * 3.0) * 6;
    const flagWave2 = Math.sin(time * 4.2 + 1.2) * 3;
    const flagGrad = ctx.createLinearGradient(flagX, flagY, flagX + flagW, flagY + flagH);
    flagGrad.addColorStop(0, '#8b1a1a');
    flagGrad.addColorStop(0.5, '#c42020');
    flagGrad.addColorStop(1, '#6b1010');
    ctx.fillStyle = flagGrad;
    ctx.beginPath();
    ctx.moveTo(flagX, flagY);
    ctx.quadraticCurveTo(flagX + flagW * 0.35, flagY - flagWave, flagX + flagW * 0.7, flagY + flagWave2);
    ctx.lineTo(flagX + flagW + flagWave * 0.6, flagY + flagH * 0.5 + flagWave2);
    ctx.quadraticCurveTo(flagX + flagW * 0.65, flagY + flagH + flagWave, flagX + flagW * 0.3, flagY + flagH - flagWave2);
    ctx.lineTo(flagX, flagY + flagH);
    ctx.closePath();
    ctx.fill();
    // 旗上骷髏紋
    ctx.fillStyle = 'rgba(255, 240, 210, 0.82)';
    const skullX = flagX + flagW * 0.4 + flagWave * 0.2;
    const skullY = flagY + flagH * 0.45 + flagWave2 * 0.3;
    ctx.beginPath();
    ctx.arc(skullX, skullY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8b1a1a';
    ctx.beginPath();
    ctx.arc(skullX - 2.5, skullY - 1, 1.5, 0, Math.PI * 2);
    ctx.arc(skullX + 2.5, skullY - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // 旗幟陰影
    ctx.strokeStyle = 'rgba(40, 8, 8, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(flagX, flagY);
    ctx.quadraticCurveTo(flagX + flagW * 0.35, flagY - flagWave, flagX + flagW * 0.7, flagY + flagWave2);
    ctx.lineTo(flagX + flagW + flagWave * 0.6, flagY + flagH * 0.5 + flagWave2);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = 'rgba(104, 73, 48, 0.95)';
    ctx.lineWidth = 2.2;
    for (let line = 1; line < 6; line++) {
      const y = mastTop + 34 + line * 50;
      ctx.beginPath();
      ctx.moveTo(mastX + 14, y);
      ctx.lineTo(mastX + 246 - line * 8, y + 20);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(mastX, mastTop);
    ctx.lineTo(mastX - 144, deckTop - 128);
    ctx.moveTo(mastX, mastTop + 10);
    ctx.lineTo(mastX + 176, deckTop - 150);
    ctx.moveTo(mastX, mastTop + 72);
    ctx.lineTo(rearMastX, rearMastTop + 54);
    ctx.stroke();

    drawSprayCluster(width * 0.12, deckTop + 38, 80, 26, 20, 'rgba(255, 247, 229, 0.24)');
    drawSprayCluster(width * 0.36, deckTop + 8, 90, 22, 16, 'rgba(255, 220, 186, 0.16)');

    ctx.save();
    for (let i = 0; i < 12; i++) {
      const debrisX = width * 0.08 + i * width * 0.035 + Math.sin(time * 1.4 + i) * 6;
      const debrisY = deckTop + 18 - i * 4 + Math.cos(time * 1.8 + i * 1.2) * 5;
      const debrisW = 8 + (i % 3) * 5;
      const debrisH = 3 + (i % 2) * 2;
      ctx.save();
      ctx.translate(debrisX, debrisY);
      ctx.rotate(-0.5 + i * 0.12 + Math.sin(time * 1.2 + i) * 0.08);
      const debrisGrad = ctx.createLinearGradient(-debrisW / 2, 0, debrisW / 2, 0);
      debrisGrad.addColorStop(0, '#6c452d');
      debrisGrad.addColorStop(0.5, '#9c6a44');
      debrisGrad.addColorStop(1, '#4d2d1b');
      ctx.fillStyle = debrisGrad;
      ctx.fillRect(-debrisW / 2, -debrisH / 2, debrisW, debrisH);
      ctx.restore();
    }
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#2d1b14';
    ctx.beginPath();
    ctx.moveTo(width * 0.08, deckTop + 34);
    ctx.lineTo(width * 0.21, deckTop + 10);
    ctx.lineTo(width * 0.27, deckTop + 58);
    ctx.lineTo(width * 0.14, deckTop + 82);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 🛢️ 木桶 (增強)
    ctx.fillStyle = '#71472d';
    ctx.beginPath();
    ctx.arc(width * 0.1, height - 66, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4e2f1f';
    ctx.lineWidth = 3;
    ctx.stroke();
    // 桶箍
    ctx.strokeStyle = '#3a2214';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(width * 0.1, height - 74, 22, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(width * 0.1, height - 58, 22, 6, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 🧭 第二個木桶 + 疊放小桶
    ctx.fillStyle = '#664028';
    ctx.beginPath();
    ctx.arc(width * 0.14, height - 60, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a2214';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = '#2d1810';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(width * 0.14, height - 68, 16, 5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // ⚓ 繩索護欄
    ctx.save();
    ctx.strokeStyle = 'rgba(142, 106, 72, 0.9)';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    // 後方護欄柱
    const railPosts = [0.35, 0.45, 0.55, 0.65, 0.74];
    railPosts.forEach((px, i) => {
      const postX = width * px;
      const postBase = deckTop + 14 - (px - 0.35) * 30;
      ctx.fillStyle = '#5a3a22';
      ctx.fillRect(postX - 3, postBase - 42, 6, 42);
      // 柱頂圓球
      ctx.fillStyle = '#7a5234';
      ctx.beginPath();
      ctx.arc(postX, postBase - 44, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    // 繩索連線 (微弧)
    ctx.strokeStyle = 'rgba(168, 128, 88, 0.78)';
    ctx.lineWidth = 2.5;
    for (let r = 0; r < 2; r++) {
      const ropeY = -18 - r * 16;
      ctx.beginPath();
      for (let i = 0; i < railPosts.length; i++) {
        const postX = width * railPosts[i];
        const postBase = deckTop + 14 - (railPosts[i] - 0.35) * 30;
        const sag = Math.sin(time * 1.6 + i * 1.2 + r) * 2.5;
        if (i === 0) ctx.moveTo(postX, postBase + ropeY + sag);
        else {
          const prevX = width * railPosts[i - 1];
          const midX = (prevX + postX) / 2;
          ctx.quadraticCurveTo(midX, postBase + ropeY + 8 + sag, postX, postBase + ropeY + sag);
        }
      }
      ctx.stroke();
    }
    ctx.restore();

    // 🏮 搖擺提燈
    ctx.save();
    const lanternPositions = [
      { x: width * 0.38, y: deckTop - 24 },
      { x: width * 0.58, y: deckTop - 32 },
      { x: width * 0.72, y: deckTop - 36 }
    ];
    lanternPositions.forEach((lp, i) => {
      const sway = Math.sin(time * 2.2 + i * 2.0) * 5;
      const lx = lp.x + sway;
      const ly = lp.y;
      // 吊繩
      ctx.strokeStyle = '#6b5238';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(lp.x, ly - 20);
      ctx.quadraticCurveTo(lx, ly - 10, lx, ly);
      ctx.stroke();
      // 燈籠框
      ctx.fillStyle = '#2c1e14';
      ctx.fillRect(lx - 7, ly, 14, 4);
      // 燈籠體（暖光）
      ctx.fillStyle = '#ffc96e';
      ctx.shadowColor = '#ffc96e';
      ctx.shadowBlur = 16;
      ctx.fillRect(lx - 6, ly + 4, 12, 18);
      ctx.shadowBlur = 0;
      // 燈籠格紋
      ctx.strokeStyle = '#8b6232';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(lx - 6, ly + 4, 12, 18);
      ctx.beginPath();
      ctx.moveTo(lx, ly + 4);
      ctx.lineTo(lx, ly + 22);
      ctx.moveTo(lx - 6, ly + 13);
      ctx.lineTo(lx + 6, ly + 13);
      ctx.stroke();
      // 底
      ctx.fillStyle = '#2c1e14';
      ctx.fillRect(lx - 7, ly + 22, 14, 3);
      // 地面暖光環
      ctx.save();
      const lanternGlow = ctx.createRadialGradient(lx, ly + 14, 0, lx, ly + 14, 60);
      lanternGlow.addColorStop(0, 'rgba(255, 201, 110, 0.14)');
      lanternGlow.addColorStop(0.5, 'rgba(255, 180, 80, 0.06)');
      lanternGlow.addColorStop(1, 'rgba(255, 180, 80, 0)');
      ctx.fillStyle = lanternGlow;
      ctx.beginPath();
      ctx.arc(lx, ly + 14, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.restore();

    // 🪢 繩圈
    ctx.save();
    ctx.strokeStyle = 'rgba(148, 112, 72, 0.85)';
    ctx.lineWidth = 3;
    const ropeCoilX = width * 0.88;
    const ropeCoilY = height - 56;
    for (let ring = 0; ring < 4; ring++) {
      ctx.beginPath();
      ctx.ellipse(ropeCoilX, ropeCoilY - ring * 5, 16 - ring, 8 - ring * 0.5, 0.15, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 💧 甲板水漬/水坑
    ctx.save();
    const puddles = [
      { x: width * 0.32, y: deckTop + 52, w: 36, h: 8 },
      { x: width * 0.56, y: deckTop + 38, w: 28, h: 6 },
      { x: width * 0.78, y: deckTop + 26, w: 32, h: 7 },
      { x: width * 0.44, y: deckTop + 70, w: 22, h: 5 }
    ];
    puddles.forEach((p, i) => {
      const puddleGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.w);
      const shimmer = 0.18 + Math.sin(time * 2.0 + i * 1.4) * 0.06;
      puddleGrad.addColorStop(0, `rgba(140, 180, 220, ${shimmer})`);
      puddleGrad.addColorStop(0.6, `rgba(100, 150, 200, ${shimmer * 0.6})`);
      puddleGrad.addColorStop(1, 'rgba(100, 150, 200, 0)');
      ctx.fillStyle = puddleGrad;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.w, p.h, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 💦 甲板邊緣浪花飛濺
    ctx.save();
    for (let i = 0; i < 8; i++) {
      const splashPhase = (time * 1.8 + i * 1.5) % 4;
      if (splashPhase < 1.2) {
        const progress = splashPhase / 1.2;
        const splashX = width * (0.3 + i * 0.08) + this.stableCentered(i, 401, 20);
        const splashBaseY = deckTop + 10 - i * 3;
        const splashAlpha = (1 - progress) * 0.5;
        ctx.fillStyle = `rgba(220, 240, 255, ${splashAlpha})`;
        for (let d = 0; d < 5; d++) {
          const angle = -Math.PI * 0.3 - d * 0.3;
          const dist = 12 + progress * 25 + d * 4;
          const dx = splashX + Math.cos(angle) * dist;
          const dy = splashBaseY + Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.arc(dx, dy, 2.5 - progress * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();

    // ✨ 海面光斑
    for (let i = 0; i < 20; i++) {
      const x = this.stableRange(i, 131, 50, width * 0.9);
      const y = this.stableRange(i, 132, height * 0.64, height * 0.94);
      const alpha = 0.26 + Math.sin(time * 2.4 + i) * 0.12;
      ctx.fillStyle = `rgba(255, 233, 194, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(x, y, this.stableRange(i, 133, 4, 10), 1.8, -0.16, 0, Math.PI * 2);
      ctx.fill();
    }

    // 🌫️ 海面水霧
    ctx.save();
    const mistY = deckTop - 12;
    for (let i = 0; i < 6; i++) {
      const mx = (width * (0.05 + i * 0.18) + time * (8 + i * 2)) % (width + 200) - 100;
      const my = mistY + Math.sin(time * 0.7 + i) * 8;
      const mistAlpha = 0.06 + Math.sin(time * 0.9 + i * 1.3) * 0.03;
      const mistGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 80);
      mistGrad.addColorStop(0, `rgba(200, 220, 240, ${mistAlpha})`);
      mistGrad.addColorStop(1, 'rgba(200, 220, 240, 0)');
      ctx.fillStyle = mistGrad;
      ctx.beginPath();
      ctx.ellipse(mx, my, 80, 20, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 🌧️ 風雨效果
    ctx.save();

    // 雨滴 — 帶有風向的斜雨（從左上往右下）
    const windAngle = 0.35; // 風偏斜角度 (rad)
    const rainSpeed = 4800;
    const rainCount = 120;
    ctx.lineCap = 'round';
    for (let i = 0; i < rainCount; i++) {
      // 用 stableNoise 產生穩定初始位置，搭配 time 做動畫
      const seed1 = this.stableNoise(i, 501);
      const seed2 = this.stableNoise(i, 502);
      const len = 24 + seed1 * 30;          // 雨滴長度 24~54px
      const thick = 0.8 + seed2 * 1.2;     // 粗細 0.8~2px
      const speed = rainSpeed * (0.7 + seed1 * 0.6);
      const phase = seed2 * 1000;

      // 循環下落位置
      const cycle = ((time * speed * 0.01 + phase) % (height + 120));
      const rx = (seed1 * (width + 200) - 60 + cycle * Math.tan(windAngle)) % (width + 100) - 50;
      const ry = cycle - 80;

      // 根據距離做透明度（越遠越淡）
      const depthFactor = 0.3 + seed2 * 0.7;
      const alpha = 0.15 + depthFactor * 0.25;

      ctx.strokeStyle = `rgba(180, 200, 220, ${alpha})`;
      ctx.lineWidth = thick * depthFactor;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx + Math.sin(windAngle) * len, ry + Math.cos(windAngle) * len);
      ctx.stroke();
    }

    // 💨 風痕 — 橫向的半透明拉絲線
    ctx.globalAlpha = 1;
    for (let i = 0; i < 8; i++) {
      const windY = height * (0.08 + this.stableNoise(i, 510) * 0.82);
      const windX = ((time * (60 + i * 18) + this.stableNoise(i, 511) * width * 2) % (width + 400)) - 200;
      const windLen = 80 + this.stableNoise(i, 512) * 160;
      const windAlpha = 0.04 + Math.sin(time * 1.5 + i * 2.1) * 0.02;

      const windGrad = ctx.createLinearGradient(windX, windY, windX + windLen, windY);
      windGrad.addColorStop(0, `rgba(200, 215, 235, 0)`);
      windGrad.addColorStop(0.3, `rgba(200, 215, 235, ${windAlpha})`);
      windGrad.addColorStop(0.7, `rgba(200, 215, 235, ${windAlpha})`);
      windGrad.addColorStop(1, `rgba(200, 215, 235, 0)`);
      ctx.strokeStyle = windGrad;
      ctx.lineWidth = 1.2 + this.stableNoise(i, 513) * 1.5;
      ctx.beginPath();
      ctx.moveTo(windX, windY);
      ctx.lineTo(windX + windLen, windY + Math.sin(time * 2 + i) * 3);
      ctx.stroke();
    }

    // 🌊 甲板上的雨水濺花
    for (let i = 0; i < 16; i++) {
      const splashCycle = (time * 2.6 + i * 0.75) % 1.2;
      if (splashCycle < 0.4) {
        const progress = splashCycle / 0.4;
        const sx = width * (0.05 + this.stableNoise(i, 520) * 0.9);
        const sy = height - 126 + 20 + this.stableNoise(i, 521) * 80;
        const radius = 2 + progress * 8;
        const splashAlpha = (1 - progress) * 0.22;
        ctx.strokeStyle = `rgba(200, 220, 240, ${splashAlpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.stroke();
        // 小水珠彈起
        if (progress < 0.6) {
          ctx.fillStyle = `rgba(210, 230, 250, ${splashAlpha * 1.5})`;
          for (let d = 0; d < 3; d++) {
            const angle = -Math.PI * 0.5 + (d - 1) * 0.6;
            const dist = progress * 10;
            ctx.beginPath();
            ctx.arc(sx + Math.cos(angle) * dist, sy + Math.sin(angle) * dist, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // 🌫️ 雨霧薄紗 — 整體覆蓋一層灰藍
    const rainHaze = ctx.createLinearGradient(0, 0, 0, height);
    rainHaze.addColorStop(0, 'rgba(140, 160, 185, 0.06)');
    rainHaze.addColorStop(0.5, 'rgba(130, 155, 180, 0.04)');
    rainHaze.addColorStop(1, 'rgba(120, 145, 170, 0.08)');
    ctx.fillStyle = rainHaze;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();

    ctx.save();
    const vignette = ctx.createRadialGradient(width * 0.5, height * 0.58, width * 0.14, width * 0.5, height * 0.58, width * 0.86);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(6, 8, 16, 0.52)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
  
  // 草原背景 - 大幅增強版
  createGrasslandBackground(ctx, width, height) {
    const time = Date.now() * 0.001;
    
    // 🌅 天空漸層 - 更豐富的色彩
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.7);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(0.3, '#B0E0E6');
    skyGradient.addColorStop(0.7, '#98FB98');
    skyGradient.addColorStop(1, '#90EE90');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height * 0.7);
    
    // ☁️ 雲朵層 - 多層次雲
    ctx.save();
    // 遠景雲
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 6; i++) {
      const x = (i * width / 5) + Math.sin(time * 0.2 + i) * 30;
      const y = 40 + Math.sin(time * 0.3 + i * 0.5) * 15;
      this.drawCloud(ctx, x, y);
    }
    
    // 近景雲
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 4; i++) {
      const x = (i * width / 3) + Math.sin(time * 0.15 + i) * 40;
      const y = 80 + Math.sin(time * 0.25 + i * 0.7) * 20;
      this.drawEnhancedCloud(ctx, x, y, 1.2);
    }
    ctx.restore();
    
    // 🌞 太陽 - 帶光暈效果
    ctx.save();
    const sunX = width - 120;
    const sunY = 100;
    
    // 光暈
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 80);
    sunGlow.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
    sunGlow.addColorStop(0.5, 'rgba(255, 215, 0, 0.1)');
    sunGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 80, 0, Math.PI * 2);
    ctx.fill();
    
    // 太陽本體
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FFA500';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 35, 0, Math.PI * 2);
    ctx.fill();

    // 日光束 - 穩定分佈，避免抖動感
    for (let i = 0; i < 5; i++) {
      const spread = 90 + i * 26;
      const rayGradient = ctx.createLinearGradient(sunX, sunY, sunX - 260 + i * 120, height * 0.72);
      rayGradient.addColorStop(0, 'rgba(255, 236, 150, 0.14)');
      rayGradient.addColorStop(0.5, 'rgba(255, 236, 150, 0.05)');
      rayGradient.addColorStop(1, 'rgba(255, 236, 150, 0)');
      ctx.fillStyle = rayGradient;
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      ctx.lineTo(sunX - spread, height * 0.72);
      ctx.lineTo(sunX - spread - 60, height * 0.72);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    
    // 🏔️ 遠山層次 - 多層山脈
    // 最遠的山
    ctx.fillStyle = '#7CB342';
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.65);
    for (let i = 0; i <= width; i += 40) {
      const hillHeight = Math.sin(i * 0.008) * 60 + height * 0.65;
      ctx.lineTo(i, hillHeight);
    }
    ctx.lineTo(width, height - 100);
    ctx.lineTo(0, height - 100);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // 中景山
    ctx.fillStyle = '#8BC34A';
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.68);
    for (let i = 0; i <= width; i += 35) {
      const hillHeight = Math.sin(i * 0.012 + 1) * 70 + height * 0.68;
      ctx.lineTo(i, hillHeight);
    }
    ctx.lineTo(width, height - 100);
    ctx.lineTo(0, height - 100);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // 近景山
    ctx.fillStyle = '#9ACD32';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.7);
    for (let i = 0; i <= width; i += 30) {
      const hillHeight = Math.sin(i * 0.015 + 2) * 80 + height * 0.7;
      ctx.lineTo(i, hillHeight);
    }
    ctx.lineTo(width, height - 100);
    ctx.lineTo(0, height - 100);
    ctx.closePath();
    ctx.fill();
    
    // 🌳 遠景樹木
    ctx.fillStyle = '#558B2F';
    for (let i = 0; i < 12; i++) {
      const x = i * (width / 11) + Math.sin(i) * 20;
      const y = height * 0.7 + Math.sin(i * 0.8) * 30;
      this.drawSimpleTree(ctx, x, y, 0.6);
    }
    
    // 🌾 草地基礎
    const groundGradient = ctx.createLinearGradient(0, height - 100, 0, height);
    groundGradient.addColorStop(0, '#7CB342');
    groundGradient.addColorStop(0.5, '#8BC34A');
    groundGradient.addColorStop(1, '#689F38');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, height - 100, width, 100);
    
    // 🌿 草叢層次 - 多層草
    // 深色草叢背景
    ctx.fillStyle = '#558B2F';
    for (let i = 0; i < 40; i++) {
      const x = (i * width / 40) + this.stableRange(i, 11, 0, 15);
      const grassHeight = this.stableRange(i, 12, 15, 35);
      const grassWidth = this.stableRange(i, 13, 4, 7);
      const sway = Math.sin(time * 2 + i * 0.5) * 2;
      
      ctx.save();
      ctx.translate(x, height - 100);
      ctx.rotate(sway * 0.05);
      ctx.fillRect(-grassWidth/2, -grassHeight, grassWidth, grassHeight);
      ctx.restore();
    }
    
    // 中層草
    ctx.fillStyle = '#689F38';
    for (let i = 0; i < 35; i++) {
      const x = (i * width / 35) + this.stableRange(i, 21, 0, 20);
      const grassHeight = this.stableRange(i, 22, 12, 27);
      const grassWidth = this.stableRange(i, 23, 3, 5);
      const sway = Math.sin(time * 2.5 + i * 0.7) * 3;
      
      ctx.save();
      ctx.translate(x, height - 100);
      ctx.rotate(sway * 0.06);
      ctx.fillRect(-grassWidth/2, -grassHeight, grassWidth, grassHeight);
      ctx.restore();
    }
    
    // 前景亮色草
    ctx.fillStyle = '#9ACD32';
    for (let i = 0; i < 30; i++) {
      const x = (i * width / 30) + this.stableRange(i, 31, 0, 25);
      const grassHeight = this.stableRange(i, 32, 10, 22);
      const grassWidth = this.stableRange(i, 33, 2, 4);
      const sway = Math.sin(time * 3 + i * 0.9) * 4;
      
      ctx.save();
      ctx.translate(x, height - 100);
      ctx.rotate(sway * 0.07);
      ctx.fillRect(-grassWidth/2, -grassHeight, grassWidth, grassHeight);
      ctx.restore();
    }
    
    // 🌸 野花點綴
    const flowers = [
      { color: '#FFB6C1', x: 0.15, y: height - 95 },
      { color: '#FFD700', x: 0.35, y: height - 92 },
      { color: '#FF69B4', x: 0.55, y: height - 90 },
      { color: '#FFA500', x: 0.75, y: height - 93 },
      { color: '#DA70D6', x: 0.90, y: height - 88 }
    ];
    
    flowers.forEach((flower, i) => {
      const x = flower.x * width + Math.sin(time + i) * 5;
      const y = flower.y + Math.sin(time * 2 + i) * 3;
      
      ctx.fillStyle = flower.color;
      ctx.beginPath();
      for (let j = 0; j < 5; j++) {
        const angle = (Math.PI * 2 / 5) * j;
        const petalX = x + Math.cos(angle) * 4;
        const petalY = y + Math.sin(angle) * 4;
        ctx.arc(petalX, petalY, 3, 0, Math.PI * 2);
      }
      ctx.fill();
      
      // 花心
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // 前景步道 - 增加視覺焦點與地面層次
    const meadowPath = ctx.createLinearGradient(width * 0.48, height - 100, width * 0.55, height);
    meadowPath.addColorStop(0, 'rgba(204, 180, 120, 0.18)');
    meadowPath.addColorStop(1, 'rgba(126, 92, 40, 0.32)');
    ctx.fillStyle = meadowPath;
    ctx.beginPath();
    ctx.moveTo(width * 0.46, height - 100);
    ctx.quadraticCurveTo(width * 0.52, height - 70, width * 0.56, height);
    ctx.lineTo(width * 0.42, height);
    ctx.quadraticCurveTo(width * 0.44, height - 72, width * 0.46, height - 100);
    ctx.closePath();
    ctx.fill();
    
    // 🦋 蝴蝶效果
    for (let i = 0; i < 3; i++) {
      const butterflyX = (width * 0.2 * i) + 200 + Math.sin(time * 0.5 + i * 2) * 100;
      const butterflyY = height * 0.5 + Math.sin(time * 0.7 + i * 1.5) * 80;
      
      ctx.save();
      ctx.translate(butterflyX, butterflyY);
      ctx.rotate(Math.sin(time * 2 + i) * 0.3);
      
      // 蝴蝶翅膀
      ctx.fillStyle = '#FF69B4';
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.ellipse(-3, 0, 5, 8, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(3, 0, 5, 8, 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  }
  
  // 森林背景 - 大幅增強版
  createForestBackground(ctx, width, height) {
    const time = Date.now() * 0.001;
    
    // 🌃 昏暗天空 - 更豐富的夜空色彩
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, '#1a1a2e');
    skyGradient.addColorStop(0.4, '#16213e');
    skyGradient.addColorStop(0.7, '#0f3460');
    skyGradient.addColorStop(1, '#533483');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);
    
    // 🌙 大月亮 - 營造神秘氛圍
    ctx.save();
    const moonX = width * 0.8;
    const moonY = height * 0.2;
    
    // 月暈
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 100);
    moonGlow.addColorStop(0, 'rgba(240, 248, 255, 0.15)');
    moonGlow.addColorStop(0.5, 'rgba(173, 216, 230, 0.08)');
    moonGlow.addColorStop(1, 'rgba(173, 216, 230, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 100, 0, Math.PI * 2);
    ctx.fill();
    
    // 月亮本體
    ctx.fillStyle = '#F0F8FF';
    ctx.shadowColor = '#ADD8E6';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // 🌲 多層樹林 - 5層深度
    // 第1層:最遠樹林(幾乎黑色剪影)
    ctx.fillStyle = '#0a0a0a';
    ctx.globalAlpha = 0.8;
    for (let i = 0; i < 10; i++) {
      const x = i * (width / 9) + Math.sin(i * 0.3) * 30;
      const treeHeight = 300 + Math.sin(i * 0.5) * 60;
      const treeWidth = 30 + Math.sin(i * 0.4) * 12;
      this.drawEnhancedTree(ctx, x, height * 0.65, treeHeight, treeWidth);
    }
    ctx.globalAlpha = 1;
    
    // 第2層:遠景樹林
    ctx.fillStyle = '#1a1a1a';
    ctx.globalAlpha = 0.85;
    for (let i = 0; i < 8; i++) {
      const x = i * (width / 7) + (width / 14) + Math.sin(i * 0.6) * 40;
      const treeHeight = 280 + Math.sin(i * 0.7) * 50;
      const treeWidth = 28 + Math.sin(i * 0.5) * 10;
      this.drawEnhancedTree(ctx, x, height * 0.68, treeHeight, treeWidth);
    }
    ctx.globalAlpha = 1;
    
    // 第3層:中景樹林
    ctx.fillStyle = '#2C2C2C';
    ctx.globalAlpha = 0.9;
    for (let i = 0; i < 6; i++) {
      const x = i * (width / 5) + (width / 10) + 30;
      const treeHeight = 220 + Math.sin(i * 0.8) * 40;
      const treeWidth = 24 + Math.sin(i * 0.6) * 8;
      this.drawEnhancedTree(ctx, x, height * 0.72, treeHeight, treeWidth);
    }
    ctx.globalAlpha = 1;
    
    // 第4層:近景樹林
    ctx.fillStyle = '#3a3a3a';
    for (let i = 0; i < 5; i++) {
      const x = i * (width / 4) + (width / 8) + 50;
      const treeHeight = 180 + Math.sin(i * 1.2) * 30;
      const treeWidth = 20 + Math.sin(i * 0.8) * 6;
      this.drawEnhancedTree(ctx, x, height * 0.76, treeHeight, treeWidth);
    }
    
    // 🌿 森林地面 - 多層次
    const groundGradient = ctx.createLinearGradient(0, height - 150, 0, height);
    groundGradient.addColorStop(0, '#2d3a2a');
    groundGradient.addColorStop(0.5, '#3d4a3d');
    groundGradient.addColorStop(1, '#1a2a1a');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, height - 100, width, 100);
    
    // 🍄 蘑菇群落
    const mushrooms = [
      { x: 100, size: 8, cap: '#8B4513', stem: '#D2691E' },
      { x: 130, size: 6, cap: '#A0522D', stem: '#DEB887' },
      { x: 150, size: 10, cap: '#8B0000', stem: '#F5DEB3' },
      { x: 400, size: 7, cap: '#CD853F', stem: '#F4A460' },
      { x: 700, size: 9, cap: '#8B4513', stem: '#D2691E' },
      { x: 900, size: 6, cap: '#A0522D', stem: '#DEB887' },
      { x: 1050, size: 8, cap: '#8B0000', stem: '#F5DEB3' }
    ];
    
    mushrooms.forEach(mushroom => {
      // 蘑菇莖
      ctx.fillStyle = mushroom.stem;
      ctx.fillRect(mushroom.x - mushroom.size/3, height - 100 - mushroom.size * 2, mushroom.size/1.5, mushroom.size * 2);
      
      // 蘑菇傘
      ctx.fillStyle = mushroom.cap;
      ctx.beginPath();
      ctx.ellipse(mushroom.x, height - 100 - mushroom.size * 2, mushroom.size, mushroom.size/1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // 蘑菇點點
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      for (let i = 0; i < 3; i++) {
        const noiseIndex = mushroom.x + i * 17;
        const dotX = mushroom.x + this.stableCentered(noiseIndex, 41, mushroom.size * 0.5);
        const dotY = height - 100 - mushroom.size * 2 + this.stableCentered(noiseIndex, 42, mushroom.size * 0.5);
        ctx.beginPath();
        ctx.arc(dotX, dotY, mushroom.size/6, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // � 地面植被 - 多層次草叢
    // 深色背景草
    ctx.fillStyle = '#1a3a1a';
    for (let i = 0; i < 45; i++) {
      const x = (i * width / 45) + this.stableRange(i, 51, 0, 20);
      const grassHeight = this.stableRange(i, 52, 12, 30);
      const grassWidth = this.stableRange(i, 53, 3, 5);
      const sway = Math.sin(time * 1.5 + i * 0.4) * 1.5;
      
      ctx.save();
      ctx.translate(x, height - 100);
      ctx.rotate(sway * 0.04);
      ctx.fillRect(-grassWidth/2, -grassHeight, grassWidth, grassHeight);
      ctx.restore();
    }
    
    // 中層草
    ctx.fillStyle = '#2d4a2d';
    for (let i = 0; i < 35; i++) {
      const x = (i * width / 35) + this.stableRange(i, 61, 0, 25);
      const grassHeight = this.stableRange(i, 62, 10, 24);
      const grassWidth = this.stableRange(i, 63, 2, 3.5);
      const sway = Math.sin(time * 1.8 + i * 0.6) * 2;
      
      ctx.save();
      ctx.translate(x, height - 100);
      ctx.rotate(sway * 0.05);
      ctx.fillRect(-grassWidth/2, -grassHeight, grassWidth, grassHeight);
      ctx.restore();
    }
    
    // 🌫️ 神秘霧氣 - 多層霧
    ctx.save();
    // 底層霧
    ctx.fillStyle = 'rgba(200, 200, 220, 0.08)';
    for (let i = 0; i < 4; i++) {
      const x = i * (width / 3) + Math.sin(time * 0.3 + i) * 40;
      const y = height * 0.65 + Math.sin(time * 0.4 + i * 1.5) * 30;
      ctx.globalAlpha = 0.15 + Math.sin(time * 0.2 + i) * 0.08;
      ctx.beginPath();
      ctx.ellipse(x, y, 180, 50, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 中層霧
    ctx.fillStyle = 'rgba(220, 220, 240, 0.1)';
    for (let i = 0; i < 3; i++) {
      const x = i * (width / 2) + width/4 + Math.sin(time * 0.25 + i * 1.2) * 50;
      const y = height * 0.5 + Math.sin(time * 0.35 + i * 1.8) * 40;
      ctx.globalAlpha = 0.12 + Math.sin(time * 0.18 + i * 1.3) * 0.06;
      ctx.beginPath();
      ctx.ellipse(x, y, 150, 45, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    
    // ✨ 螢火蟲群 - 更自然的飛行軌跡
    ctx.save();
    for (let i = 0; i < 12; i++) {
      const baseX = (i % 4) * (width / 3) + width / 6;
      const baseY = height * 0.3 + (Math.floor(i / 4) * height * 0.15);
      
      // 復雜的飛行軌跡
      const x = baseX + Math.sin(time * 0.8 + i * 2.5) * 80 + Math.cos(time * 1.2 + i * 1.8) * 40;
      const y = baseY + Math.cos(time * 0.6 + i * 2.2) * 60 + Math.sin(time * 0.9 + i * 1.5) * 30;
      
      // 閃爍效果
      const flicker = Math.sin(time * 3 + i * 4) * 0.4 + 0.6;
      const size = 1.8 + Math.sin(time * 1.5 + i * 2) * 0.8;
      
      ctx.fillStyle = '#FFFF88';
      ctx.globalAlpha = flicker * 0.9;
      ctx.shadowColor = '#FFFF66';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // 光暈
      ctx.shadowBlur = 20;
      ctx.globalAlpha = flicker * 0.3;
      ctx.beginPath();
      ctx.arc(x, y, size * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    
    // 🌙 月光束 - 穿透樹林的光線
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const x = i * (width / 4) + width / 8;
      const lightGradient = ctx.createLinearGradient(x, 0, x, height * 0.75);
      lightGradient.addColorStop(0, 'rgba(240, 248, 255, 0)');
      lightGradient.addColorStop(0.3, 'rgba(240, 248, 255, 0.06)');
      lightGradient.addColorStop(0.7, 'rgba(240, 248, 255, 0.04)');
      lightGradient.addColorStop(1, 'rgba(240, 248, 255, 0)');
      
      ctx.fillStyle = lightGradient;
      ctx.globalAlpha = 0.5 + Math.sin(time * 0.5 + i) * 0.2;
      ctx.beginPath();
      ctx.moveTo(x - 25, 0);
      ctx.lineTo(x + 25, 0);
      ctx.lineTo(x + 40, height * 0.75);
      ctx.lineTo(x - 40, height * 0.75);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  
  // 天守閣背景 - 大幅增強版
  createCastleBackground(ctx, width, height) {
    const time = Date.now() * 0.001;
    
    // 🌌 深邃夜空 - 更豐富的星空漸層
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, '#0a0a1e');
    skyGradient.addColorStop(0.3, '#191970');
    skyGradient.addColorStop(0.6, '#483D8B');
    skyGradient.addColorStop(1, '#6A5ACD');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);
    
    // 🌙 巨大滿月 - 營造詩意氛圍
    ctx.save();
    const moonX = width * 0.75;
    const moonY = height * 0.25;
    
    // 外層光暈
    const moonGlow1 = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 120);
    moonGlow1.addColorStop(0, 'rgba(240, 248, 255, 0.2)');
    moonGlow1.addColorStop(0.4, 'rgba(173, 216, 230, 0.12)');
    moonGlow1.addColorStop(0.7, 'rgba(135, 206, 235, 0.06)');
    moonGlow1.addColorStop(1, 'rgba(135, 206, 235, 0)');
    ctx.fillStyle = moonGlow1;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 120, 0, Math.PI * 2);
    ctx.fill();
    
    // 內層光暈
    const moonGlow2 = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 70);
    moonGlow2.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    moonGlow2.addColorStop(0.6, 'rgba(240, 248, 255, 0.2)');
    moonGlow2.addColorStop(1, 'rgba(240, 248, 255, 0)');
    ctx.fillStyle = moonGlow2;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 70, 0, Math.PI * 2);
    ctx.fill();
    
    // 月亮本體
    ctx.fillStyle = '#F0F8FF';
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // 月球環形山紋理
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(200, 200, 220, 0.3)';
    ctx.beginPath();
    ctx.arc(moonX - 15, moonY - 10, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(moonX + 12, moonY + 8, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(moonX - 8, moonY + 15, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // ⭐ 多層次星空
    ctx.save();
    // 小星星(遠景)
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 50; i++) {
      const x = (i * 137.5 % width); // 黃金角度分布
      const y = (i * 73.2 % (height * 0.7));
      const twinkle = Math.sin(time * 2 + i * 2.5) * 0.4 + 0.6;
      const size = this.stableRange(i, 71, 1, 1.5);
      
      ctx.globalAlpha = twinkle * 0.7;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 中等星星
    ctx.fillStyle = '#F0F8FF';
    for (let i = 0; i < 25; i++) {
      const x = (i * 217.3 % width);
      const y = (i * 89.7 % (height * 0.7));
      const twinkle = Math.sin(time * 1.5 + i * 3.2) * 0.5 + 0.5;
      const size = this.stableRange(i, 72, 1.5, 2.3);
      
      ctx.globalAlpha = twinkle;
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 閃亮大星
    for (let i = 0; i < 8; i++) {
      const x = (i * 287.5 % width);
      const y = (i * 113.2 % (height * 0.6));
      const twinkle = Math.sin(time + i * 4) * 0.6 + 0.4;
      
      ctx.globalAlpha = twinkle;
      ctx.shadowBlur = 10;
      this.drawStar(ctx, x, y, 3);
    }
    ctx.restore();
    
    // 🏯 遠景城堡剪影
    ctx.fillStyle = '#1a1a2e';
    ctx.globalAlpha = 0.6;
    // 遠處塔樓群
    for (let i = 0; i < 5; i++) {
      const x = i * (width / 4) - 50;
      const towerHeight = 180 + Math.sin(i * 0.8) * 40;
      const towerWidth = 40 + Math.sin(i * 0.5) * 15;
      ctx.fillRect(x, height * 0.7 - towerHeight, towerWidth, towerHeight);
      // 塔尖
      ctx.beginPath();
      ctx.moveTo(x, height * 0.7 - towerHeight);
      ctx.lineTo(x + towerWidth/2, height * 0.7 - towerHeight - 30);
      ctx.lineTo(x + towerWidth, height * 0.7 - towerHeight);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    // 🏯 主城堡建築群 - 多層次
    ctx.fillStyle = '#2F2F2F';
    
    // 左側塔樓
    const leftTower = { x: 50, y: height - 320, width: 90, height: 220 };
    ctx.fillRect(leftTower.x, leftTower.y, leftTower.width, leftTower.height);
    ctx.fillStyle = '#1F1F1F';
    ctx.fillRect(leftTower.x, leftTower.y, leftTower.width, 25); // 屋簷
    // 塔尖
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.moveTo(leftTower.x - 10, leftTower.y);
    ctx.lineTo(leftTower.x + leftTower.width/2, leftTower.y - 40);
    ctx.lineTo(leftTower.x + leftTower.width + 10, leftTower.y);
    ctx.closePath();
    ctx.fill();
    
    // 右側塔樓
    const rightTower = { x: width - 140, y: height - 300, width: 90, height: 200 };
    ctx.fillStyle = '#2F2F2F';
    ctx.fillRect(rightTower.x, rightTower.y, rightTower.width, rightTower.height);
    ctx.fillStyle = '#1F1F1F';
    ctx.fillRect(rightTower.x, rightTower.y, rightTower.width, 25);
    // 塔尖
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.moveTo(rightTower.x - 10, rightTower.y);
    ctx.lineTo(rightTower.x + rightTower.width/2, rightTower.y - 45);
    ctx.lineTo(rightTower.x + rightTower.width + 10, rightTower.y);
    ctx.closePath();
    ctx.fill();
    
    // 中央天守主樓
    const mainTower = { x: width/2 - 110, y: height - 450, width: 220, height: 350 };
    ctx.fillStyle = '#3F3F3F';
    ctx.fillRect(mainTower.x, mainTower.y, mainTower.width, mainTower.height);
    // 多層屋簷
    ctx.fillStyle = '#1F1F1F';
    for (let i = 0; i < 3; i++) {
      const eaveY = mainTower.y + i * 110;
      const eaveExtend = 15 - i * 3;
      ctx.fillRect(mainTower.x - eaveExtend, eaveY, mainTower.width + eaveExtend * 2, 20);
    }
    // 主塔尖
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.moveTo(mainTower.x - 20, mainTower.y);
    ctx.lineTo(mainTower.x + mainTower.width/2, mainTower.y - 60);
    ctx.lineTo(mainTower.x + mainTower.width + 20, mainTower.y);
    ctx.closePath();
    ctx.fill();
    
    // 🏮 窗戶燈光 - 更豐富的光源
    const windowGlow = time => Math.sin(time * 1.5) * 0.2 + 0.8;
    ctx.fillStyle = '#FFD700';
    
    // 左塔窗戶
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.globalAlpha = windowGlow(time + i * 0.5);
      ctx.fillRect(leftTower.x + 20, leftTower.y + 40 + i * 45, 15, 22);
      ctx.fillRect(leftTower.x + 55, leftTower.y + 40 + i * 45, 15, 22);
      ctx.restore();
    }
    
    // 右塔窗戶
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.globalAlpha = windowGlow(time + i * 0.7);
      ctx.fillRect(rightTower.x + 20, rightTower.y + 35 + i * 43, 15, 22);
      ctx.fillRect(rightTower.x + 55, rightTower.y + 35 + i * 43, 15, 22);
      ctx.restore();
    }
    
    // 主樓窗戶(多排)
    for (let floor = 0; floor < 6; floor++) {
      for (let col = 0; col < 4; col++) {
        ctx.save();
        ctx.globalAlpha = windowGlow(time + floor * 0.3 + col * 0.2);
        const winX = mainTower.x + 25 + col * 50;
        const winY = mainTower.y + 50 + floor * 55;
        ctx.fillRect(winX, winY, 18, 25);
        // 光暈
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 15;
        ctx.globalAlpha = windowGlow(time + floor * 0.3 + col * 0.2) * 0.5;
        ctx.fillRect(winX, winY, 18, 25);
        ctx.restore();
      }
    }
    
    // 🚩 飄揚旗幟
    ctx.save();
    const flag1X = leftTower.x + leftTower.width / 2;
    const flag1Y = leftTower.y - 40;
    const flagWave = Math.sin(time * 3) * 5;
    
    // 旗杆
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(flag1X, flag1Y);
    ctx.lineTo(flag1X, flag1Y + 60);
    ctx.stroke();
    
    // 旗布
    ctx.fillStyle = '#DC143C';
    ctx.beginPath();
    ctx.moveTo(flag1X, flag1Y + 5);
    ctx.quadraticCurveTo(flag1X + 25 + flagWave, flag1Y + 15, flag1X + 40, flag1Y + 10);
    ctx.lineTo(flag1X + 40, flag1Y + 30);
    ctx.quadraticCurveTo(flag1X + 25 - flagWave, flag1Y + 35, flag1X, flag1Y + 25);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // 🏛️ 屋頂瓦片 - 更細緻的質感
    const roofGradient = ctx.createLinearGradient(0, height - 100, 0, height);
    roofGradient.addColorStop(0, '#4a4a4a');
    roofGradient.addColorStop(0.5, '#696969');
    roofGradient.addColorStop(1, '#3a3a3a');
    ctx.fillStyle = roofGradient;
    ctx.fillRect(0, height - 100, width, 100);
    
    // 瓦片紋理
    ctx.strokeStyle = '#2F2F2F';
    ctx.lineWidth = 2;
    for (let i = 0; i < width; i += 25) {
      ctx.beginPath();
      ctx.moveTo(i, height - 100);
      ctx.lineTo(i, height);
      ctx.stroke();
      
      // 橫向紋理
      for (let j = height - 100; j < height; j += 15) {
        ctx.beginPath();
        ctx.moveTo(i, j);
        ctx.lineTo(i + 25, j);
        ctx.stroke();
      }
    }
    
    // ☁️ 飄過的雲朵
    ctx.save();
    ctx.fillStyle = 'rgba(100, 100, 120, 0.3)';
    const cloudX = (time * 20) % (width + 200) - 200;
    this.drawCloud(ctx, cloudX, height * 0.35);
    this.drawCloud(ctx, cloudX + 300, height * 0.42);
    ctx.restore();

    // 細雪般的月下花瓣 - 增加動感但保持穩定分布
    ctx.save();
    ctx.fillStyle = 'rgba(245, 226, 235, 0.7)';
    for (let i = 0; i < 14; i++) {
      const driftX = (this.stableNoise(i, 73) * width + time * (10 + i)) % (width + 60) - 30;
      const driftY = (this.stableNoise(i, 74) * (height * 0.5)) + Math.sin(time * 0.8 + i) * 14 + 40;
      ctx.save();
      ctx.translate(driftX, driftY);
      ctx.rotate(time * 0.4 + i);
      ctx.beginPath();
      ctx.ellipse(0, 0, 4, 2, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
  
  // 船上背景 - 大幅增強版
  createShipBackground(ctx, width, height) {
    const time = Date.now() * 0.001;
    
    // 🌅 海天漸變 - 更豐富的色彩(黃昏時刻)
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
    skyGradient.addColorStop(0, '#FF6B6B');
    skyGradient.addColorStop(0.25, '#FF8E53');
    skyGradient.addColorStop(0.5, '#FEE140');
    skyGradient.addColorStop(0.75, '#4FACFE');
    skyGradient.addColorStop(1, '#00F2FE');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height * 0.6);
    
    // ☀️ 夕陽 - 壯觀的落日
    ctx.save();
    const sunX = width * 0.2;
    const sunY = height * 0.35;
    
    // 外層光暈
    const sunGlow1 = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 120);
    sunGlow1.addColorStop(0, 'rgba(255, 140, 0, 0.4)');
    sunGlow1.addColorStop(0.4, 'rgba(255, 69, 0, 0.25)');
    sunGlow1.addColorStop(0.7, 'rgba(255, 99, 71, 0.12)');
    sunGlow1.addColorStop(1, 'rgba(255, 99, 71, 0)');
    ctx.fillStyle = sunGlow1;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 120, 0, Math.PI * 2);
    ctx.fill();
    
    // 內層光暈
    const sunGlow2 = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 60);
    sunGlow2.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
    sunGlow2.addColorStop(0.6, 'rgba(255, 165, 0, 0.4)');
    sunGlow2.addColorStop(1, 'rgba(255, 140, 0, 0)');
    ctx.fillStyle = sunGlow2;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 60, 0, Math.PI * 2);
    ctx.fill();
    
    // 太陽本體
    ctx.fillStyle = '#FFA500';
    ctx.shadowColor = '#FF4500';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 海面夕照反射
    ctx.save();
    const reflectionGradient = ctx.createLinearGradient(sunX, height * 0.58, sunX, height - 100);
    reflectionGradient.addColorStop(0, 'rgba(255, 220, 140, 0.28)');
    reflectionGradient.addColorStop(0.45, 'rgba(255, 190, 120, 0.16)');
    reflectionGradient.addColorStop(1, 'rgba(255, 160, 90, 0)');
    ctx.fillStyle = reflectionGradient;
    ctx.beginPath();
    ctx.moveTo(sunX - 42, height * 0.6);
    ctx.lineTo(sunX + 42, height * 0.6);
    ctx.lineTo(sunX + 120, height - 100);
    ctx.lineTo(sunX - 120, height - 100);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // ☁️ 彩霞 - 被夕陽染紅的雲
    ctx.save();
    for (let i = 0; i < 6; i++) {
      const x = i * (width / 5) + Math.sin(time * 0.2 + i) * 30;
      const y = height * 0.15 + Math.sin(time * 0.25 + i * 0.8) * 25;
      const cloudColor = i < 3 ? 'rgba(255, 140, 100, 0.6)' : 'rgba(255, 180, 140, 0.5)';
      
      ctx.fillStyle = cloudColor;
      this.drawEnhancedCloud(ctx, x, y, 1.3);
    }
    ctx.restore();
    
    // 🌊 多層次海洋 - 深度感
    // 遠海
    const farSeaGradient = ctx.createLinearGradient(0, height * 0.6, 0, height * 0.75);
    farSeaGradient.addColorStop(0, '#1e90ff');
    farSeaGradient.addColorStop(1, '#4169E1');
    ctx.fillStyle = farSeaGradient;
    ctx.fillRect(0, height * 0.6, width, height * 0.15);
    
    // 中海
    const midSeaGradient = ctx.createLinearGradient(0, height * 0.75, 0, height * 0.85);
    midSeaGradient.addColorStop(0, '#4169E1');
    midSeaGradient.addColorStop(1, '#0047AB');
    ctx.fillStyle = midSeaGradient;
    ctx.fillRect(0, height * 0.75, width, height * 0.1);
    
    // 近海
    const nearSeaGradient = ctx.createLinearGradient(0, height * 0.85, 0, height - 100);
    nearSeaGradient.addColorStop(0, '#0047AB');
    nearSeaGradient.addColorStop(1, '#003580');
    ctx.fillStyle = nearSeaGradient;
    ctx.fillRect(0, height * 0.85, width, height * 0.15 - 100);
    
    // 🌊 動態海浪 - 多層海浪效果
    ctx.save();
    // 遠景小波浪
    ctx.strokeStyle = 'rgba(135, 206, 250, 0.4)';
    ctx.lineWidth = 2;
    for (let wave = 0; wave < 3; wave++) {
      ctx.beginPath();
      for (let x = 0; x <= width; x += 8) {
        const y = height * 0.62 + wave * 15 + Math.sin(x * 0.03 + time * 2 + wave) * 5;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    
    // 中景波浪
    ctx.strokeStyle = 'rgba(100, 149, 237, 0.5)';
    ctx.lineWidth = 2.5;
    for (let wave = 0; wave < 4; wave++) {
      ctx.beginPath();
      for (let x = 0; x <= width; x += 10) {
        const y = height * 0.77 + wave * 18 + Math.sin(x * 0.025 + time * 1.8 + wave * 1.5) * 7;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    
    // 近景大波浪
    ctx.strokeStyle = 'rgba(70, 130, 180, 0.7)';
    ctx.lineWidth = 3;
    for (let wave = 0; wave < 3; wave++) {
      ctx.beginPath();
      for (let x = 0; x <= width; x += 12) {
        const y = height * 0.88 + wave * 22 + Math.sin(x * 0.02 + time * 1.5 + wave * 2) * 10;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    
    // 浪花效果
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 12; i++) {
      const x = (i * width / 11) + Math.sin(time * 2 + i) * 20;
      const y = height * 0.92 + Math.sin(time * 3 + i * 1.5) * 5;
      const foam = Math.sin(time * 4 + i * 2) * 0.3 + 0.7;
      
      ctx.globalAlpha = foam * 0.7;
      ctx.beginPath();
      ctx.ellipse(x, y, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    
    // 🚢 船體細節 - 更真實的船身
    // 船欄杆
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, height - 110);
    ctx.lineTo(width, height - 110);
    ctx.stroke();
    
    // 欄杆柱子
    ctx.fillStyle = '#654321';
    for (let i = 0; i < width / 60; i++) {
      ctx.fillRect(i * 60, height - 110, 5, 10);
    }
    
    // 🪵 船甲板 - 立體感木板
    const deckGradient = ctx.createLinearGradient(0, height - 100, 0, height);
    deckGradient.addColorStop(0, '#A0826D');
    deckGradient.addColorStop(0.5, '#8B4513');
    deckGradient.addColorStop(1, '#654321');
    ctx.fillStyle = deckGradient;
    ctx.fillRect(0, height - 100, width, 100);
    
    // 木板紋理 - 垂直方向
    ctx.strokeStyle = '#5C3317';
    ctx.lineWidth = 3;
    for (let i = 0; i < width; i += 40) {
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(i, height - 100);
      ctx.lineTo(i, height);
      ctx.stroke();
      
      // 木板釘子
      ctx.fillStyle = '#2F2F2F';
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(i + 20, height - 90, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(i + 20, height - 50, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(i + 20, height - 10, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    // ⛵ 桅杆系統 - 更壯觀
    const drawMast = (x, mastHeight) => {
      // 桅杆主體
      const mastGradient = ctx.createLinearGradient(x - 10, 0, x + 10, 0);
      mastGradient.addColorStop(0, '#6B5A3D');
      mastGradient.addColorStop(0.5, '#8B7355');
      mastGradient.addColorStop(1, '#6B5A3D');
      ctx.fillStyle = mastGradient;
      ctx.fillRect(x - 10, height - mastHeight, 20, mastHeight - 100);
      
      // 桅杆頂端
      ctx.fillStyle = '#5C4B37';
      ctx.beginPath();
      ctx.moveTo(x - 10, height - mastHeight);
      ctx.lineTo(x, height - mastHeight - 20);
      ctx.lineTo(x + 10, height - mastHeight);
      ctx.closePath();
      ctx.fill();
      
      // 橫桁
      ctx.fillRect(x - 80, height - mastHeight + 50, 160, 8);
      ctx.fillRect(x - 70, height - mastHeight + 150, 140, 8);
    };
    
    drawMast(200, 520);
    drawMast(width - 200, 480);
    
    // ⛵ 帆布 - 風中飄揚的帆
    const drawSail = (mastX, mastY, sailWidth, sailHeight) => {
      const windSway = Math.sin(time * 1.5) * 8;
      
      ctx.save();
      ctx.fillStyle = 'rgba(250, 248, 240, 0.9)';
      ctx.beginPath();
      ctx.moveTo(mastX + 12, mastY);
      ctx.quadraticCurveTo(mastX + sailWidth/2 + windSway, mastY + 20, mastX + sailWidth, mastY + 10);
      ctx.lineTo(mastX + sailWidth, mastY + sailHeight);
      ctx.quadraticCurveTo(mastX + sailWidth/2 - windSway, mastY + sailHeight - 20, mastX + 12, mastY + sailHeight - 10);
      ctx.closePath();
      ctx.fill();
      
      // 帆布紋理線
      ctx.strokeStyle = 'rgba(220, 220, 210, 0.6)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        const lineY = mastY + (sailHeight / 6) * i;
        ctx.moveTo(mastX + 12, lineY);
        ctx.lineTo(mastX + sailWidth, lineY);
        ctx.stroke();
      }
      ctx.restore();
    };
    
    drawSail(200, height - 470, 150, 180);
    drawSail(200, height - 270, 130, 150);
    drawSail(width - 200, height - 430, 140, 170);
    drawSail(width - 200, height - 240, 120, 140);
    
    // 🪢 繩索系統
    ctx.save();
    ctx.strokeStyle = '#6B5A3D';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    // 左桅繩索
    ctx.beginPath();
    ctx.moveTo(200, height - 520);
    ctx.lineTo(50, height - 250);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(200, height - 520);
    ctx.lineTo(350, height - 250);
    ctx.stroke();
    
    // 右桅繩索
    ctx.beginPath();
    ctx.moveTo(width - 200, height - 480);
    ctx.lineTo(width - 350, height - 250);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width - 200, height - 480);
    ctx.lineTo(width - 50, height - 250);
    ctx.stroke();
    
    ctx.setLineDash([]);
    ctx.restore();
    
    // 🦅 海鷗群 - 更自然的飛行
    ctx.save();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 3;
    
    for (let i = 0; i < 8; i++) {
      const birdX = ((time * 30 + i * 150) % (width + 200)) - 100;
      const birdY = 60 + Math.sin(time + i * 2) * 40 + (i % 3) * 30;
      const wingFlap = Math.sin(time * 5 + i) * 12;
      
      ctx.beginPath();
      ctx.moveTo(birdX - 12, birdY);
      ctx.quadraticCurveTo(birdX - 6, birdY - 6 + wingFlap, birdX, birdY - 2);
      ctx.quadraticCurveTo(birdX + 6, birdY - 6 + wingFlap, birdX + 12, birdY);
      ctx.stroke();
    }
    ctx.restore();
    
    // 🏝️ 遠方島嶼 - 多個島嶼營造深度
    ctx.save();
    // 最遠的島
    ctx.fillStyle = 'rgba(47, 79, 79, 0.4)';
    ctx.beginPath();
    ctx.moveTo(width * 0.55, height * 0.68);
    ctx.quadraticCurveTo(width * 0.62, height * 0.64, width * 0.69, height * 0.68);
    ctx.lineTo(width * 0.69, height * 0.72);
    ctx.lineTo(width * 0.55, height * 0.72);
    ctx.closePath();
    ctx.fill();
    
    // 中距離島嶼
    ctx.fillStyle = 'rgba(60, 90, 90, 0.6)';
    ctx.beginPath();
    ctx.moveTo(width * 0.72, height * 0.66);
    ctx.quadraticCurveTo(width * 0.82, height * 0.61, width * 0.92, height * 0.66);
    ctx.lineTo(width * 0.92, height * 0.73);
    ctx.lineTo(width * 0.72, height * 0.73);
    ctx.closePath();
    ctx.fill();
    
    // 島上棕櫚樹
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(width * 0.81, height * 0.64, 4, 20);
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i;
      ctx.beginPath();
      ctx.moveTo(width * 0.83, height * 0.64);
      ctx.lineTo(width * 0.83 + Math.cos(angle) * 15, height * 0.64 + Math.sin(angle) * 12);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#228B22';
      ctx.stroke();
    }
    ctx.restore();
    
    // ✨ 陽光反射 - 海面波光粼粼
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 200, 0.4)';
    for (let i = 0; i < 25; i++) {
      const x = this.stableRange(i, 81, 50, width * 0.4 + 50);
      const y = this.stableRange(i, 82, height * 0.7, height * 0.95);
      const sparkle = Math.sin(time * 3 + i * 2) * 0.5 + 0.5;
      const size = this.stableRange(i, 83, 2, 5);
      
      ctx.globalAlpha = sparkle * 0.8;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  
  // 輔助方法：繪製雲朵
  drawCloud(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 輔助方法：繪製增強版雲朵
  drawEnhancedCloud(ctx, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.arc(-30, 0, 25, 0, Math.PI * 2);
    ctx.arc(-10, -8, 30, 0, Math.PI * 2);
    ctx.arc(15, -5, 28, 0, Math.PI * 2);
    ctx.arc(35, 2, 24, 0, Math.PI * 2);
    ctx.arc(20, 8, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  // 輔助方法：繪製簡單樹木
  drawSimpleTree(ctx, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    // 樹幹
    ctx.fillStyle = '#6B5A3D';
    ctx.fillRect(-5, -50, 10, 50);
    
    // 樹冠
    ctx.fillStyle = '#558B2F';
    ctx.beginPath();
    ctx.arc(0, -60, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-12, -50, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(12, -50, 15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // 輔助方法：繪製增強版樹木
  drawEnhancedTree(ctx, x, y, treeHeight, treeWidth) {
    ctx.save();
    
    // 樹幹
    const trunkWidth = treeWidth * 0.15;
    ctx.fillRect(x - trunkWidth/2, y - treeHeight, trunkWidth, treeHeight);
    
    // 樹冠 - 多層
    ctx.beginPath();
    ctx.arc(x, y - treeHeight + treeWidth * 0.4, treeWidth, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(x - treeWidth * 0.5, y - treeHeight + treeWidth * 0.2, treeWidth * 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(x + treeWidth * 0.5, y - treeHeight + treeWidth * 0.2, treeWidth * 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(x, y - treeHeight - treeWidth * 0.1, treeWidth * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // 輔助方法：繪製星星
  drawStar(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.3, y - size * 0.3);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x + size * 0.3, y + size * 0.3);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size * 0.3, y + size * 0.3);
    ctx.lineTo(x - size, y);
    ctx.lineTo(x - size * 0.3, y - size * 0.3);
    ctx.closePath();
    ctx.fill();
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  //  風忍武道場 — Wind Ninja Clan Martial Arts Platform
  //  滅門之夜：山巔道場燃燒中，屍橫遍地，餘燼飄揚
  // ═══════════════════════════════════════════════════════════════════════════
  renderWindNinjaDojo(ctx, width, height) {
    drawWindNinjaDojo(ctx, { width, height }, Date.now() * 0.001);
  }
  
  // 設置當前地圖
  setCurrentMap(mapId) {
    if (this.maps[mapId]) {
      this.currentMap = mapId;
      return true;
    }
    return false;
  }
  
  // 獲取當前地圖
  getCurrentMap() {
    return this.maps[this.currentMap];
  }
  
  // 渲染當前地圖背景
  renderBackground(ctx, width, height) {
    const currentMap = this.getCurrentMap();
    if (currentMap && currentMap.background) {
      currentMap.background.call(this, ctx, width, height);
    } else {
      // 備用背景
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, width, height);
    }
  }
  
  // 🌋 新增：創建地面裂痕特效
  createGroundCrackEffect(x, y, config) {
    // 主要地裂線 - 從中心向外擴散
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 / 12) * i + Math.random() * 0.4;
      const length = config.range * (0.6 + Math.random() * 0.4);
      
      // 創建主裂痕
      if (typeof particleSystem !== 'undefined' && particleSystem) {
        particleSystem.particles.push({
          x: x,
          y: y,
          endX: x + Math.cos(angle) * length,
          endY: y + Math.sin(angle) * length,
          color: config.color,
          life: config.duration,
          maxLife: config.duration,
          width: 4 + Math.random() * 3,
          type: 'ground_crack'
        });
      }
    }
    
    // 地面震動碎石效果
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * config.range;
      const stoneX = x + Math.cos(angle) * distance;  
      const stoneY = y + Math.sin(angle) * distance;
      
      if (typeof particleSystem !== 'undefined' && particleSystem) {
        particleSystem.particles.push({
          x: stoneX,
          y: stoneY,
          vx: (Math.random() - 0.5) * 100,
          vy: -50 - Math.random() * 100,
          size: 2 + Math.random() * 4,
          color: '#A1887F',
          life: config.duration * 0.6,
          maxLife: config.duration * 0.6,
          alpha: 1,
          type: 'debris'
        });
      }
    }
  }
  
  // 新增：生成地圖預覽Canvas
  generateMapPreview(mapId, width = 150, height = 100) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    const map = this.maps[mapId];
    if (map && map.background) {
      // 縮小版本的地圖渲染
      ctx.save();
      ctx.scale(width/1200, height/600);
      map.background.call(this, ctx, 1200, 600);
      ctx.restore();
    }
    
    return canvas;
  }
}

// 全局地圖系統實例
let mapSystem;
document.addEventListener('DOMContentLoaded', () => {
  mapSystem = new MapSystem();
});


// ═══════════════════════════════════════════════════════════════════════════════
//  drawWindNinjaDojo(ctx, canvas, time)
//  ─────────────────────────────────────
//  「風忍一族」山巔武道場 — 滅門之夜（Cinema-Grade Version）
//  純 Canvas 2D API 繪製，無外部圖片
//
//  ctx    : CanvasRenderingContext2D
//  canvas : { width, height }
//  time   : 持續遞增的時間值
// ═══════════════════════════════════════════════════════════════════════════════

function drawWindNinjaDojo(ctx, canvas, time) {
  const W = canvas.width;
  const H = canvas.height;
  const t = time > 100000 ? time * 0.001 : time;

  // 穩定偽亂數（同 frame 同 seed 得到同值）
  function noise(i, s) {
    const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
    return v - Math.floor(v);
  }

  ctx.save();

  // ═══════════════════════════════════════════════════════════
  //  Layer 0：全景底色 — 多段夜空 + 煙霧漸層（8 色）
  // ═══════════════════════════════════════════════════════════
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0.00, '#050a14');   // 漆黑天頂
  sky.addColorStop(0.12, '#0a1020');   // 深藍
  sky.addColorStop(0.28, '#12101e');   // 煙紫過渡
  sky.addColorStop(0.42, '#1e1220');   // 暗紫煙
  sky.addColorStop(0.55, '#2a1418');   // 血霧
  sky.addColorStop(0.70, '#3a1210');   // 暗紅
  sky.addColorStop(0.85, '#4a1008');   // 燃燒映照
  sky.addColorStop(1.00, '#2a0604');   // 最底暗焰
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // 大氣火光暈染：從下方向上的火焰反射
  const fireReflect = ctx.createLinearGradient(0, H * 0.5, 0, H);
  fireReflect.addColorStop(0, 'rgba(255,80,20,0)');
  fireReflect.addColorStop(0.5, 'rgba(255,60,10,0.06)');
  fireReflect.addColorStop(0.8, 'rgba(255,40,0,0.12)');
  fireReflect.addColorStop(1, 'rgba(200,30,0,0.18)');
  ctx.fillStyle = fireReflect;
  ctx.fillRect(0, H * 0.4, W, H * 0.6);

  // 脈動火光映照（整個天空劇烈跳動 — 大火吞天）
  const firePulse = 0.06 + 0.04 * Math.sin(t * 3.2) + 0.03 * Math.sin(t * 5.7) + 0.02 * Math.sin(t * 8.3);
  ctx.fillStyle = `rgba(255,60,10,${firePulse})`;
  ctx.fillRect(0, 0, W, H);

  // 天空底部的烈焰紅潮（大宗門焚毀的沖天火光）
  const infernoGrad = ctx.createLinearGradient(0, H * 0.35, 0, H * 0.75);
  infernoGrad.addColorStop(0, 'rgba(255,40,0,0)');
  infernoGrad.addColorStop(0.4, `rgba(255,80,20,${0.06 + 0.04 * Math.sin(t * 2.8)})`);
  infernoGrad.addColorStop(0.7, `rgba(255,50,5,${0.10 + 0.06 * Math.sin(t * 3.5)})`);
  infernoGrad.addColorStop(1, `rgba(200,30,0,${0.14 + 0.05 * Math.sin(t * 4.2)})`);
  ctx.fillStyle = infernoGrad;
  ctx.fillRect(0, H * 0.3, W, H * 0.5);

  // ═══════════════════════════════════════════════════════════
  //  Layer 0.5：星空 — 稀疏的星星被煙霧遮蔽
  // ═══════════════════════════════════════════════════════════
  for (let i = 0; i < 35; i++) {
    const sx = noise(i, 100) * W;
    const sy = noise(i, 101) * H * 0.45;
    const sa = (0.15 + noise(i, 102) * 0.35) * (0.7 + 0.3 * Math.sin(t * (0.8 + noise(i, 103) * 0.5) + i));
    const sr = 0.5 + noise(i, 104) * 1.2;
    ctx.fillStyle = `rgba(200,200,220,${sa})`;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // ═══════════════════════════════════════════════════════════
  //  Layer 0.7：血月 — 被煙霧遮蔽的猩紅月亮
  // ═══════════════════════════════════════════════════════════
  const moonX = W * 0.82;
  const moonY = H * 0.15;

  // 月暈（巨大暗紅光暈）
  const moonHalo = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 180);
  moonHalo.addColorStop(0, 'rgba(180,40,30,0.15)');
  moonHalo.addColorStop(0.3, 'rgba(120,20,15,0.08)');
  moonHalo.addColorStop(0.7, 'rgba(80,10,10,0.03)');
  moonHalo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = moonHalo;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 180, 0, Math.PI * 2);
  ctx.fill();

  // 月暈中層
  const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 75);
  moonGlow.addColorStop(0, 'rgba(220,80,50,0.55)');
  moonGlow.addColorStop(0.4, 'rgba(180,50,30,0.25)');
  moonGlow.addColorStop(1, 'rgba(120,20,10,0)');
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 75, 0, Math.PI * 2);
  ctx.fill();

  // 月球本體
  const moonBody = ctx.createRadialGradient(moonX - 5, moonY - 5, 0, moonX, moonY, 32);
  moonBody.addColorStop(0, '#e8a090');
  moonBody.addColorStop(0.5, '#c06050');
  moonBody.addColorStop(1, '#8a3828');
  ctx.fillStyle = moonBody;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 32, 0, Math.PI * 2);
  ctx.fill();

  // 月面紋理
  ctx.fillStyle = 'rgba(60,20,15,0.3)';
  ctx.beginPath();
  ctx.arc(moonX - 10, moonY - 6, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(moonX + 8, moonY + 8, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(moonX - 3, moonY + 12, 4, 0, Math.PI * 2);
  ctx.fill();

  // 月光煙霧遮蔽（飄動的煙雲掠過月亮）
  ctx.save();
  ctx.globalAlpha = 0.25 + 0.1 * Math.sin(t * 0.3);
  ctx.fillStyle = 'rgba(20,10,15,0.6)';
  const smokeOffset = Math.sin(t * 0.2) * 40;
  ctx.beginPath();
  ctx.ellipse(moonX + smokeOffset + 20, moonY - 5, 70, 20, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ═══════════════════════════════════════════════════════════
  //  Layer 1：遠景山脈 — 三層深度，帶震顫
  // ═══════════════════════════════════════════════════════════
  const tremble = Math.sin(t * 5) * 1.5;
  const tremble2 = Math.cos(t * 5.3) * 1.0;

  // 最遠山層（朦朧）
  ctx.fillStyle = '#0c0a14';
  ctx.beginPath();
  ctx.moveTo(-10, H * 0.55);
  const farPeaks = [0.06, 0.14, 0.22, 0.32, 0.40, 0.50, 0.58, 0.66, 0.76, 0.84, 0.92, 1.02];
  const farHeights = [0.38, 0.42, 0.32, 0.37, 0.28, 0.35, 0.30, 0.38, 0.26, 0.33, 0.29, 0.36];
  for (let i = 0; i < farPeaks.length; i++) {
    ctx.lineTo(W * farPeaks[i] + tremble * 0.5, H * farHeights[i] + tremble2 * 0.5);
  }
  ctx.lineTo(W + 10, H * 0.42);
  ctx.lineTo(W + 10, H);
  ctx.lineTo(-10, H);
  ctx.closePath();
  ctx.fill();

  // 遠山薄霧
  const mistGrad = ctx.createLinearGradient(0, H * 0.32, 0, H * 0.58);
  mistGrad.addColorStop(0, 'rgba(15,10,20,0)');
  mistGrad.addColorStop(0.5, 'rgba(25,15,20,0.3)');
  mistGrad.addColorStop(1, 'rgba(30,15,15,0.5)');
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, H * 0.32, W, H * 0.26);

  // 近景山層（較清晰、較高）
  ctx.fillStyle = '#0d0b10';
  ctx.beginPath();
  ctx.moveTo(-10, H * 0.65);
  const nearPeaks = [0.05, 0.12, 0.20, 0.28, 0.36, 0.48, 0.55, 0.64, 0.72, 0.80, 0.90, 1.02];
  const nearHeights = [0.48, 0.42, 0.50, 0.40, 0.46, 0.36, 0.44, 0.38, 0.48, 0.42, 0.44, 0.50];
  for (let i = 0; i < nearPeaks.length; i++) {
    ctx.lineTo(W * nearPeaks[i] + tremble, H * nearHeights[i] + tremble2);
  }
  ctx.lineTo(W + 10, H * 0.52);
  ctx.lineTo(W + 10, H);
  ctx.lineTo(-10, H);
  ctx.closePath();
  ctx.fill();

  // ═══════════════════════════════════════════════════════════
  //  Layer 1.5：遠處的火光天際線 — 道場群遠景燃燒
  // ═══════════════════════════════════════════════════════════
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 9; i++) {
    const fx = W * (0.05 + i * 0.11) + noise(i, 50) * W * 0.06;
    const fy = H * 0.40 + noise(i, 51) * 25;
    const fr = 40 + noise(i, 52) * 55;
    const pulse = 0.22 + 0.14 * Math.sin(t * (2.5 + i * 0.6) + i * 1.5);
    const distFireGlow = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
    distFireGlow.addColorStop(0, `rgba(255,140,40,${pulse})`);
    distFireGlow.addColorStop(0.3, `rgba(255,80,15,${pulse * 0.5})`);
    distFireGlow.addColorStop(0.6, `rgba(255,40,5,${pulse * 0.2})`);
    distFireGlow.addColorStop(1, 'rgba(255,20,0,0)');
    ctx.fillStyle = distFireGlow;
    ctx.beginPath();
    ctx.arc(fx, fy, fr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // ═══════════════════════════════════════════════════════════
  //  Layer 2：煙柱 — 3根濃煙向上升騰
  // ═══════════════════════════════════════════════════════════
  function drawSmokeColumn(baseX, baseY, width, maxH, drift) {
    ctx.save();
    for (let j = 0; j < 8; j++) {
      const yOff = j * maxH * 0.12;
      const spread = width * (1 + j * 0.35);
      const xDrift = Math.sin(t * 0.4 + j * 0.6 + drift) * (15 + j * 8);
      const alpha = 0.12 - j * 0.013;
      if (alpha <= 0) continue;
      ctx.fillStyle = `rgba(20,15,18,${alpha})`;
      ctx.beginPath();
      ctx.ellipse(
        baseX + xDrift, baseY - yOff,
        spread, spread * 0.5,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }
    ctx.restore();
  }

  drawSmokeColumn(W * 0.12, H * 0.52, 50, 260, 0);
  drawSmokeColumn(W * 0.35, H * 0.48, 55, 280, 0.8);
  drawSmokeColumn(W * 0.52, H * 0.47, 60, 290, 1.5);
  drawSmokeColumn(W * 0.70, H * 0.50, 50, 250, 2.3);
  drawSmokeColumn(W * 0.85, H * 0.51, 45, 240, 3.0);

  // ═══════════════════════════════════════════════════════════
  //  Layer 3：⛩️ 碎裂的鳥居（門框）— 左側前景
  // ═══════════════════════════════════════════════════════════
  const platY = H - 150; // 平台頂部 Y

  function drawBrokenTorii(tx, ty, scale) {
    ctx.save();
    ctx.translate(tx, ty);
    const s = scale;

    // 左柱（完整但傾斜）
    ctx.fillStyle = '#2a1418';
    ctx.save();
    ctx.rotate(-0.06);
    ctx.fillRect(-6 * s, -140 * s, 12 * s, 140 * s);
    ctx.restore();

    // 右柱（斷裂，只剩下半段）
    ctx.fillStyle = '#2a1418';
    ctx.save();
    ctx.rotate(0.04);
    ctx.translate(70 * s, 0);
    ctx.fillRect(-6 * s, -60 * s, 12 * s, 60 * s);
    // 斷裂鋸齒頂端
    ctx.fillStyle = '#3a1c20';
    ctx.beginPath();
    ctx.moveTo(-7 * s, -60 * s);
    ctx.lineTo(-2 * s, -70 * s);
    ctx.lineTo(3 * s, -62 * s);
    ctx.lineTo(8 * s, -68 * s);
    ctx.lineTo(8 * s, -60 * s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 橫樑（笠木）— 斷裂傾斜
    ctx.fillStyle = '#301820';
    ctx.save();
    ctx.rotate(-0.08);
    ctx.fillRect(-15 * s, -130 * s, 100 * s, 10 * s);
    // 上方弧形裝飾
    ctx.beginPath();
    ctx.moveTo(-20 * s, -130 * s);
    ctx.quadraticCurveTo(35 * s, -150 * s, 90 * s, -130 * s);
    ctx.lineTo(85 * s, -126 * s);
    ctx.quadraticCurveTo(35 * s, -144 * s, -15 * s, -126 * s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 鳥居上的火光
    ctx.globalCompositeOperation = 'lighter';
    const toriiGlow = ctx.createRadialGradient(30 * s, -80 * s, 0, 30 * s, -80 * s, 50 * s);
    toriiGlow.addColorStop(0, `rgba(255,100,30,${0.08 + 0.04 * Math.sin(t * 4)})`);
    toriiGlow.addColorStop(1, 'rgba(255,50,10,0)');
    ctx.fillStyle = toriiGlow;
    ctx.beginPath();
    ctx.arc(30 * s, -80 * s, 50 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    ctx.restore();
  }

  drawBrokenTorii(W * 0.04, platY, 1.1);
  drawBrokenTorii(W * 0.88, platY, 0.8);

  // ═══════════════════════════════════════════════════════════
  //  Layer 4：🏯 燃燒中的道場建築群（超細節版）
  // ═══════════════════════════════════════════════════════════

  // --- 繪製精緻道場 ---
  function drawDojo(x, baseY, bW, bH, roofOH, collapsed, detail) {
    const cx = x + bW * 0.5;

    // 建築底座基石
    ctx.fillStyle = '#18161e';
    ctx.fillRect(x - 5, baseY - 8, bW + 10, 12);

    // 主體牆壁（漸層）
    const wallGrad = ctx.createLinearGradient(x, baseY - bH, x, baseY);
    wallGrad.addColorStop(0, '#1c1a26');
    wallGrad.addColorStop(0.5, '#18161e');
    wallGrad.addColorStop(1, '#141218');
    ctx.fillStyle = wallGrad;

    if (collapsed) {
      // 崩塌建築 — 傾斜變形
      ctx.save();
      ctx.transform(1, 0, -0.08, 1, x + bW * 0.08, 0);
      ctx.fillRect(0, baseY - bH * 0.7, bW * 0.85, bH * 0.7);
      ctx.restore();
    } else {
      ctx.fillRect(x, baseY - bH, bW, bH);
    }

    // 柱子
    const pillarCount = Math.max(2, Math.floor(bW / 40));
    ctx.fillStyle = '#1a1422';
    for (let p = 0; p < pillarCount; p++) {
      const px = x + (bW / (pillarCount - 1)) * p - 3;
      const pH = collapsed ? bH * 0.7 : bH;
      ctx.fillRect(px, baseY - pH, 6, pH);
    }

    // 窗戶格子（內部燃燒的火光）
    if (detail) {
      const winCount = Math.floor(bW / 55);
      for (let w = 0; w < winCount; w++) {
        const wx = x + 20 + w * 55;
        const wy = baseY - bH * 0.6;
        const ww = 30;
        const wh = bH * 0.3;

        // 窗內火光
        const winFlicker = 0.4 + 0.3 * Math.sin(t * (5 + w) + w * 2.1);
        ctx.fillStyle = `rgba(255,140,40,${winFlicker * 0.7})`;
        ctx.shadowColor = 'rgba(255,100,20,0.6)';
        ctx.shadowBlur = 12;
        ctx.fillRect(wx + 2, wy + 2, ww - 4, wh - 4);
        ctx.shadowBlur = 0;

        // 窗框
        ctx.strokeStyle = '#0e0c14';
        ctx.lineWidth = 2;
        ctx.strokeRect(wx, wy, ww, wh);
        // 十字格
        ctx.beginPath();
        ctx.moveTo(wx + ww * 0.5, wy);
        ctx.lineTo(wx + ww * 0.5, wy + wh);
        ctx.moveTo(wx, wy + wh * 0.5);
        ctx.lineTo(wx + ww, wy + wh * 0.5);
        ctx.stroke();
      }
    }

    // ── 屋頂（精緻弧形瓦片層）──
    function drawRoof(rx, ry, rW, rH, overhang) {
      const rl = rx - overhang;
      const rr = rx + rW + overhang;
      const wingTip = rH * 0.28;
      const rmid = rx + rW * 0.5;

      // 屋頂漸層
      const roofGrad = ctx.createLinearGradient(rmid, ry - rH, rmid, ry + 8);
      roofGrad.addColorStop(0, '#2c2232');
      roofGrad.addColorStop(0.5, '#201828');
      roofGrad.addColorStop(1, '#181420');
      ctx.fillStyle = roofGrad;

      ctx.beginPath();
      ctx.moveTo(rl, ry + 4);
      ctx.quadraticCurveTo(rl + (rmid - rl) * 0.3, ry - rH * 0.2, rmid, ry - rH);
      ctx.quadraticCurveTo(rr - (rr - rmid) * 0.3, ry - rH * 0.2, rr, ry + 4);
      // 底邊
      ctx.lineTo(rr - 4, ry + 10);
      ctx.quadraticCurveTo(rmid, ry - rH + 12, rl + 4, ry + 10);
      ctx.closePath();
      ctx.fill();

      // 翹角（鴟尾）
      ctx.fillStyle = '#2a2030';
      ctx.beginPath();
      ctx.moveTo(rl, ry + 4);
      ctx.quadraticCurveTo(rl - 8, ry - 6, rl - 12, ry - wingTip);
      ctx.lineTo(rl + 6, ry + 2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(rr, ry + 4);
      ctx.quadraticCurveTo(rr + 8, ry - 6, rr + 12, ry - wingTip);
      ctx.lineTo(rr - 6, ry + 2);
      ctx.closePath();
      ctx.fill();

      // 瓦片紋理線
      ctx.strokeStyle = 'rgba(10,8,15,0.5)';
      ctx.lineWidth = 0.8;
      for (let i = 1; i <= 5; i++) {
        const frac = i / 6;
        const lyy = ry + 6 - (rH + 6) * frac;
        const lspan = (overhang + rW * 0.5) * (1 - frac * 0.6);
        ctx.beginPath();
        ctx.moveTo(rmid - lspan, lyy + rH * frac * 0.15);
        ctx.quadraticCurveTo(rmid, lyy - 3, rmid + lspan, lyy + rH * frac * 0.15);
        ctx.stroke();
      }

      // 屋脊裝飾
      ctx.fillStyle = '#3a2838';
      ctx.beginPath();
      ctx.moveTo(rmid - 3, ry - rH - 8);
      ctx.lineTo(rmid + 3, ry - rH - 8);
      ctx.lineTo(rmid + 2, ry - rH + 2);
      ctx.lineTo(rmid - 2, ry - rH + 2);
      ctx.closePath();
      ctx.fill();
    }

    // 主屋頂
    const roofY = collapsed ? baseY - bH * 0.65 : baseY - bH;
    drawRoof(x, roofY, bW, bH * 0.3, roofOH);

    // 雙重屋頂（上層小閣）
    if (!collapsed && bH > 80) {
      const t2W = bW * 0.55;
      const t2X = x + (bW - t2W) * 0.5;
      const t2H = bH * 0.4;
      ctx.fillStyle = '#1a1620';
      ctx.fillRect(t2X, roofY - t2H, t2W, t2H);
      // 上層柱子
      ctx.fillStyle = '#161220';
      ctx.fillRect(t2X + 2, roofY - t2H, 5, t2H);
      ctx.fillRect(t2X + t2W - 7, roofY - t2H, 5, t2H);
      // 上層屋頂
      drawRoof(t2X, roofY - t2H, t2W, t2H * 0.3, roofOH * 0.6);
    }

    // ── 建築底座火光反射 ──
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const baseGlow = ctx.createLinearGradient(x, baseY - 20, x, baseY + 5);
    baseGlow.addColorStop(0, 'rgba(255,80,20,0)');
    baseGlow.addColorStop(1, `rgba(255,100,30,${0.08 + 0.04 * Math.sin(t * 3.5)})`);
    ctx.fillStyle = baseGlow;
    ctx.fillRect(x - 5, baseY - 20, bW + 10, 25);
    ctx.restore();
  }

  // --- 地獄級火焰系統（大宗門滅門之火）---
  function drawFireComplex(cx, baseY, maxH, spread, intensity) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // 巨大底部光暈（映照地面）
    const baseGlow = ctx.createRadialGradient(cx, baseY, 0, cx, baseY, spread * 3.5);
    baseGlow.addColorStop(0, `rgba(255,150,40,${0.22 * intensity})`);
    baseGlow.addColorStop(0.3, `rgba(255,80,15,${0.12 * intensity})`);
    baseGlow.addColorStop(0.6, `rgba(255,40,5,${0.05 * intensity})`);
    baseGlow.addColorStop(1, 'rgba(255,20,0,0)');
    ctx.fillStyle = baseGlow;
    ctx.beginPath();
    ctx.arc(cx, baseY, spread * 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 沖天火柱光暈（脈動式向上延伸）
    const pillarPulse = 0.7 + 0.3 * Math.sin(t * 6 + cx * 0.01);
    const pillarH = maxH * 1.8 * pillarPulse;
    const pillarGrad = ctx.createLinearGradient(cx, baseY, cx, baseY - pillarH);
    const pAlpha = intensity * (0.08 + 0.06 * Math.sin(t * 4.5 + cx * 0.02));
    pillarGrad.addColorStop(0, `rgba(255,100,20,${pAlpha * 1.2})`);
    pillarGrad.addColorStop(0.4, `rgba(255,60,10,${0.05 * intensity})`);
    pillarGrad.addColorStop(1, 'rgba(255,30,0,0)');
    ctx.fillStyle = pillarGrad;
    ctx.fillRect(cx - spread * 0.8, baseY - pillarH, spread * 1.6, pillarH);

    // 多層火舌（12 根 — 狂暴速度 + 大幅擺動）
    for (let i = 0; i < 12; i++) {
      const phase = t * (12 + i * 2.2) + i * 1.3;
      const flicker = 0.35 + 0.65 * Math.sin(phase);
      const secondWave = 0.7 + 0.3 * Math.sin(phase * 0.8 + i * 0.6 + t * 3);
      const h = Math.max(1, maxH * flicker * secondWave);
      const offX = Math.sin(phase * 0.6 + i * 0.5) * spread * 0.7
                 + Math.sin(t * 5 + i * 2.1) * spread * 0.15;
      const r = Math.max(4, spread * (0.28 + 0.32 * Math.sin(phase * 1.1 + t * 2)));

      // 外焰（層次更多的漸層）
      const gradR = Math.max(1, r + h * 0.5);
      const outerGrad = ctx.createRadialGradient(cx + offX, baseY, 0, cx + offX, baseY - h * 0.35, gradR);
      outerGrad.addColorStop(0, `rgba(255,220,80,${0.8 * intensity})`);
      outerGrad.addColorStop(0.15, `rgba(255,180,30,${0.6 * intensity})`);
      outerGrad.addColorStop(0.35, `rgba(255,100,0,${0.4 * intensity})`);
      outerGrad.addColorStop(0.6, `rgba(220,40,0,${0.18 * intensity})`);
      outerGrad.addColorStop(0.85, `rgba(150,15,0,${0.06 * intensity})`);
      outerGrad.addColorStop(1, 'rgba(100,5,0,0)');
      ctx.fillStyle = outerGrad;

      ctx.beginPath();
      ctx.moveTo(cx + offX - r, baseY);
      const tipJitter = (noise(i, 30) - 0.5) * r * 0.6;
      ctx.bezierCurveTo(
        cx + offX - r * 0.8, baseY - h * 0.35,
        cx + offX - r * 0.35, baseY - h * 0.8,
        cx + offX + tipJitter, baseY - h
      );
      ctx.bezierCurveTo(
        cx + offX + r * 0.35, baseY - h * 0.8,
        cx + offX + r * 0.8, baseY - h * 0.35,
        cx + offX + r, baseY
      );
      ctx.closePath();
      ctx.fill();

      // 內焰核心（刺眼亮白黃）
      if (i < 5) {
        const coreH = h * 0.45;
        const coreR = r * 0.35;
        ctx.fillStyle = `rgba(255,245,210,${0.35 * flicker * intensity})`;
        ctx.beginPath();
        ctx.moveTo(cx + offX - coreR, baseY);
        ctx.quadraticCurveTo(cx + offX, baseY - coreH, cx + offX + coreR, baseY);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 火星飛濺（爆裂式向外射出）
    for (let s = 0; s < 10; s++) {
      const sp = t * 20 + s * 1.9 + noise(s, 35) * 4;
      const sparkAngle = sp * 0.8 + s * 0.6;
      const sparkDist = spread * (0.3 + 0.7 * Math.abs(Math.sin(sp * 0.5)));
      const sx = cx + Math.sin(sparkAngle) * sparkDist;
      const sy = baseY - maxH * 0.15 - Math.abs(Math.sin(sp * 0.5)) * maxH * 0.9;
      const sparkSize = 1.2 + noise(s, 36) * 2.5;
      const sparkAlpha = 0.8 + 0.2 * Math.sin(sp * 3);
      ctx.fillStyle = s % 2 === 0
        ? `rgba(255,240,140,${sparkAlpha * intensity})`
        : `rgba(255,180,60,${sparkAlpha * intensity})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sparkSize, 0, Math.PI * 2);
      ctx.fill();

      // 火星拖尾
      ctx.strokeStyle = `rgba(255,200,80,${sparkAlpha * intensity * 0.4})`;
      ctx.lineWidth = sparkSize * 0.4;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx - Math.sin(sparkAngle) * 6, sy + 5);
      ctx.stroke();
    }

    ctx.restore();
  }

  // 道場群配置
  const dojoConfigs = [
    { x: W * 0.02,  baseY: platY - 18, w: W * 0.24, h: 130, roof: 35, collapsed: false, detail: true },
    { x: W * 0.36,  baseY: platY - 8,  w: W * 0.20, h: 110, roof: 28, collapsed: true,  detail: true },
    { x: W * 0.66,  baseY: platY - 3,  w: W * 0.16, h: 90,  roof: 22, collapsed: false, detail: true },
    { x: W * 0.85,  baseY: platY - 10, w: W * 0.12, h: 70,  roof: 18, collapsed: true,  detail: false },
  ];

  dojoConfigs.forEach(d => {
    drawDojo(d.x, d.baseY, d.w, d.h, d.roof, d.collapsed, d.detail);
  });

  // ── 滅門大火：火海地獄 ──
  // 主殿（左）— 三組烈焰吞噬
  drawFireComplex(W * 0.14, platY - 18, 160, 70, 1.0);
  drawFireComplex(W * 0.06, platY - 10, 120, 50, 0.9);
  drawFireComplex(W * 0.22, platY - 15, 130, 55, 0.85);
  drawFireComplex(W * 0.18, platY - 30, 100, 40, 0.7);
  // 中殿 — 崩塌中的猛烈燃燒
  drawFireComplex(W * 0.46, platY - 8,  155, 65, 1.0);
  drawFireComplex(W * 0.40, platY,      110, 45, 0.85);
  drawFireComplex(W * 0.52, platY - 12, 120, 50, 0.9);
  drawFireComplex(W * 0.44, platY - 25, 90,  35, 0.7);
  // 右殿 — 偏殿燃燒
  drawFireComplex(W * 0.74, platY - 3,  140, 55, 0.95);
  drawFireComplex(W * 0.70, platY,      100, 40, 0.8);
  drawFireComplex(W * 0.80, platY - 8,  90,  35, 0.75);
  // 最右小殿
  drawFireComplex(W * 0.92, platY - 5,  120, 45, 0.85);
  drawFireComplex(W * 0.88, platY,      80,  30, 0.7);
  // 建築之間的蔓延火焰（填補間隙）
  drawFireComplex(W * 0.30, platY - 5,  90,  40, 0.6);
  drawFireComplex(W * 0.60, platY,      80,  35, 0.55);

  // ── 沖天火牆（建築群後方的巨大動態火牆）──
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let fw = 0; fw < 24; fw++) {
    const fwx = W * (fw / 24) + noise(fw, 60) * W * 0.04;
    const fwy = platY - 20;
    const fwBaseH = 90 + noise(fw, 61) * 130;
    const fwW = 30 + noise(fw, 62) * 55;
    const fwSpeed = 4 + noise(fw, 63) * 6;
    const fwPhase = t * fwSpeed + fw * 0.9;
    // 火牆高度動態變化（劇烈搖擺）
    const fwH = fwBaseH * (0.5 + 0.5 * Math.sin(fwPhase)) * (0.7 + 0.3 * Math.sin(fwPhase * 1.7 + fw));
    const fwAlpha = 0.08 + 0.06 * Math.sin(fwPhase);
    const fwDriftX = Math.sin(t * 1.5 + fw * 0.7) * 8;

    const fwGrad = ctx.createLinearGradient(fwx + fwDriftX, fwy, fwx + fwDriftX, fwy - fwH);
    fwGrad.addColorStop(0, `rgba(255,130,25,${fwAlpha})`);
    fwGrad.addColorStop(0.25, `rgba(255,80,12,${fwAlpha * 0.7})`);
    fwGrad.addColorStop(0.55, `rgba(255,40,5,${fwAlpha * 0.3})`);
    fwGrad.addColorStop(1, 'rgba(200,15,0,0)');
    ctx.fillStyle = fwGrad;
    ctx.fillRect(fwx + fwDriftX - fwW * 0.5, fwy - fwH, fwW, fwH);
  }
  ctx.restore();

  // ═══════════════════════════════════════════════════════════
  //  Layer 5：🪨 武道石台（超精細版）
  // ═══════════════════════════════════════════════════════════

  // 石台漸層底色
  const platGrad = ctx.createLinearGradient(0, platY, 0, H);
  platGrad.addColorStop(0, '#343c42');
  platGrad.addColorStop(0.1, '#2c3539');
  platGrad.addColorStop(0.5, '#222a2e');
  platGrad.addColorStop(1, '#181e22');
  ctx.fillStyle = platGrad;

  ctx.beginPath();
  // 左側崖壁碎裂
  ctx.moveTo(-5, platY + 12);
  ctx.lineTo(15, platY + 2);
  ctx.lineTo(28, platY + 18);
  ctx.lineTo(45, platY - 3);
  ctx.lineTo(60, platY + 10);
  ctx.lineTo(78, platY - 5);
  ctx.lineTo(95, platY + 3);
  // 平台上緣（微起伏）
  for (let i = 0; i <= 20; i++) {
    const px = 95 + (W - 190) * (i / 20);
    const py = platY + Math.sin(i * 1.3 + 0.5) * 3;
    ctx.lineTo(px, py);
  }
  // 右側崖壁碎裂
  ctx.lineTo(W - 95, platY + 3);
  ctx.lineTo(W - 78, platY - 5);
  ctx.lineTo(W - 60, platY + 10);
  ctx.lineTo(W - 45, platY - 3);
  ctx.lineTo(W - 28, platY + 18);
  ctx.lineTo(W - 15, platY + 2);
  ctx.lineTo(W + 5, platY + 12);
  ctx.lineTo(W + 5, H + 5);
  ctx.lineTo(-5, H + 5);
  ctx.closePath();
  ctx.fill();

  // 石台火光反射頂線
  ctx.save();
  const edgeGlow = 0.5 + 0.3 * Math.sin(t * 3.5);
  ctx.strokeStyle = `rgba(120,60,25,${edgeGlow})`;
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(255,100,30,0.4)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(95, platY + 3);
  for (let i = 0; i <= 20; i++) {
    const px = 95 + (W - 190) * (i / 20);
    const py = platY + Math.sin(i * 1.3 + 0.5) * 3;
    ctx.lineTo(px, py);
  }
  ctx.lineTo(W - 95, platY + 3);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore();

  // 石面紋理
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 12; i++) {
    const sx = W * 0.08 + noise(i, 200) * W * 0.84;
    const sy = platY + 12 + noise(i, 201) * (H - platY - 30);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    const segs = 2 + Math.floor(noise(i, 202) * 3);
    let lx = sx, ly = sy;
    for (let j = 0; j < segs; j++) {
      lx += (noise(i + j, 203) - 0.5) * 40;
      ly += 8 + noise(i + j, 204) * 20;
      ctx.lineTo(lx, ly);
    }
    ctx.stroke();
  }

  // 石板接縫（水平）
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 0.5;
  for (let row = 0; row < 4; row++) {
    const ry = platY + 25 + row * 30;
    ctx.beginPath();
    ctx.moveTo(60, ry + noise(row, 210) * 4);
    for (let px = 60; px < W - 60; px += 30) {
      ctx.lineTo(px, ry + (noise(px + row, 211) - 0.5) * 5);
    }
    ctx.stroke();
  }

  // ═══════════════════════════════════════════════════════════
  //  Layer 5.5：散落的武器
  // ═══════════════════════════════════════════════════════════
  function drawBrokenWeapon(wx, wy, angle, type) {
    ctx.save();
    ctx.translate(wx, wy);
    ctx.rotate(angle);
    ctx.strokeStyle = '#3a3840';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    if (type === 0) {
      // 斷刀
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(14, 0);
      ctx.stroke();
      // 刀柄
      ctx.strokeStyle = '#2a2228';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(-28, 2);
      ctx.stroke();
      // 護手
      ctx.strokeStyle = '#4a3830';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-18, -5);
      ctx.lineTo(-18, 5);
      ctx.stroke();
    } else if (type === 1) {
      // 手裏劍
      ctx.strokeStyle = '#3a3640';
      ctx.lineWidth = 2;
      for (let b = 0; b < 4; b++) {
        const ba = (Math.PI * 2 / 4) * b;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(ba) * 10, Math.sin(ba) * 10);
        ctx.stroke();
      }
    } else {
      // 碎裂的槍/棍
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(20, -1);
      ctx.stroke();
      // 碎裂端
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(20, -1);
      ctx.lineTo(24, -4);
      ctx.moveTo(20, -1);
      ctx.lineTo(23, 3);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawBrokenWeapon(W * 0.15, platY + 25, -0.3, 0);
  drawBrokenWeapon(W * 0.35, platY + 50, 0.8,  1);
  drawBrokenWeapon(W * 0.55, platY + 20, -1.2, 2);
  drawBrokenWeapon(W * 0.72, platY + 45, 0.4,  0);
  drawBrokenWeapon(W * 0.88, platY + 30, -0.7, 1);

  // ═══════════════════════════════════════════════════════════
  //  Layer 6：☠️ 屠殺後的門徒（倒斃的火柴人 — 精細版）
  // ═══════════════════════════════════════════════════════════

  function drawCorpse(x, y, poseIndex) {
    // 血池（不規則擴散 + 邊緣漸隱）
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, 0.3);
    const bloodGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 25 + poseIndex * 4);
    bloodGrad.addColorStop(0, 'rgba(80,0,0,0.8)');
    bloodGrad.addColorStop(0.6, 'rgba(60,0,0,0.5)');
    bloodGrad.addColorStop(1, 'rgba(40,0,0,0)');
    ctx.fillStyle = bloodGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 25 + poseIndex * 4, 0, Math.PI * 2);
    ctx.fill();
    // 二次血跡（偏移）
    ctx.fillStyle = 'rgba(70,0,0,0.4)';
    ctx.beginPath();
    ctx.arc(8, 5, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 屍體本體
    ctx.strokeStyle = '#2b3a42';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (poseIndex) {
      case 0: {
        // 俯臥、雙腿折斷、身穿忍裝
        ctx.beginPath();
        ctx.moveTo(x - 20, y - 5); ctx.lineTo(x + 20, y - 8);
        ctx.stroke();
        // 頭（脫落偏斜）
        ctx.beginPath();
        ctx.moveTo(x - 20, y - 5); ctx.lineTo(x - 28, y - 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x - 33, y - 13, 5, 0, Math.PI * 2);
        ctx.stroke();
        // 血跡延伸線
        ctx.strokeStyle = 'rgba(80,0,0,0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - 33, y - 8); ctx.lineTo(x - 38, y + 2);
        ctx.stroke();
        ctx.strokeStyle = '#2b3a42'; ctx.lineWidth = 3.5;
        // 左腿扭曲
        ctx.beginPath();
        ctx.moveTo(x + 20, y - 8); ctx.lineTo(x + 30, y + 5); ctx.lineTo(x + 22, y + 15);
        ctx.stroke();
        // 右腿
        ctx.beginPath();
        ctx.moveTo(x + 18, y - 6); ctx.lineTo(x + 35, y - 2); ctx.lineTo(x + 40, y + 10);
        ctx.stroke();
        // 手臂
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 6); ctx.lineTo(x - 12, y + 10);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 5, y - 7); ctx.lineTo(x + 10, y + 8);
        ctx.stroke();
        break;
      }
      case 1: {
        // 仰躺、手腳攤開、大字形
        ctx.beginPath();
        ctx.moveTo(x - 18, y - 4); ctx.lineTo(x + 18, y - 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x - 24, y - 4, 5, 0, Math.PI * 2);
        ctx.stroke();
        // 雙臂外攤
        ctx.beginPath();
        ctx.moveTo(x - 8, y - 5); ctx.lineTo(x - 22, y - 18);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 8, y - 5); ctx.lineTo(x + 24, y - 20);
        ctx.stroke();
        // 雙腿
        ctx.beginPath();
        ctx.moveTo(x + 18, y - 6); ctx.lineTo(x + 30, y + 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 16, y - 5); ctx.lineTo(x + 34, y + 2);
        ctx.stroke();
        break;
      }
      case 2: {
        // 跪姿前倒、面朝地
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 2); ctx.lineTo(x + 5, y - 12); ctx.lineTo(x + 15, y - 18);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + 20, y - 20, 5, 0, Math.PI * 2);
        ctx.stroke();
        // 背部弓起
        ctx.beginPath();
        ctx.moveTo(x - 5, y - 2); ctx.lineTo(x - 15, y + 5);
        ctx.stroke();
        // 蜷曲雙腿
        ctx.beginPath();
        ctx.moveTo(x - 15, y + 5); ctx.lineTo(x - 8, y + 15); ctx.lineTo(x + 2, y + 12);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 13, y + 4); ctx.lineTo(x - 20, y + 14);
        ctx.stroke();
        // 手臂前伸
        ctx.beginPath();
        ctx.moveTo(x + 8, y - 15); ctx.lineTo(x + 30, y - 10);
        ctx.stroke();
        break;
      }
      case 3: {
        // 靠牆半坐（背靠空氣，頭垂下）
        ctx.beginPath();
        ctx.moveTo(x, y + 5); ctx.lineTo(x + 3, y - 12);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + 5, y - 17, 5, 0, Math.PI * 2);
        ctx.stroke();
        // 頭部低垂線
        ctx.strokeStyle = 'rgba(80,0,0,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 5, y - 12); ctx.lineTo(x + 7, y - 5);
        ctx.stroke();
        ctx.strokeStyle = '#2b3a42'; ctx.lineWidth = 3.5;
        // 雙腿前伸
        ctx.beginPath();
        ctx.moveTo(x, y + 5); ctx.lineTo(x - 20, y + 12);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y + 4); ctx.lineTo(x - 22, y + 8); ctx.lineTo(x - 28, y + 15);
        ctx.stroke();
        // 手臂垂落
        ctx.beginPath();
        ctx.moveTo(x + 2, y - 5); ctx.lineTo(x + 15, y + 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + 1, y - 6); ctx.lineTo(x - 10, y + 3);
        ctx.stroke();
        break;
      }
    }
  }

  drawCorpse(W * 0.18, platY + 38, 0);
  drawCorpse(W * 0.38, platY + 55, 1);
  drawCorpse(W * 0.58, platY + 32, 2);
  drawCorpse(W * 0.78, platY + 48, 3);

  // ═══════════════════════════════════════════════════════════
  //  Layer 7：🔥 飄落的火星餘燼（進階粒子系統）
  // ═══════════════════════════════════════════════════════════
  ctx.save();
  const EMBER_COUNT = 80;
  for (let i = 0; i < EMBER_COUNT; i++) {
    const n1 = noise(i, 300);
    const n2 = noise(i, 301);
    const n3 = noise(i, 302);
    const n4 = noise(i, 303);

    const baseX = n1 * W;
    const speed = 25 + n2 * 55;
    const cycle = ((t * speed + i * 73.1) % (H + 120));
    const ex = baseX + Math.sin(t * (1.2 + n3 * 0.8) + i * 0.7) * (30 + n4 * 30);
    const ey = H - cycle;

    // 漸隱
    const fadeIn  = Math.min(1, cycle / 80);
    const fadeOut = Math.min(1, (H + 120 - cycle) / 120);
    const alpha = fadeIn * fadeOut * (0.5 + 0.5 * Math.sin(t * (6 + n3 * 4) + i));

    if (alpha < 0.05) continue;

    // 三種顏色交替
    const colors = ['#ffa500', '#ffcc33', '#ff6600'];
    ctx.fillStyle = colors[i % 3];
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#ff2200';
    ctx.globalAlpha = alpha;

    const size = 1 + n2 * 2.5;
    if (i % 3 === 0) {
      // 圓形
      ctx.beginPath();
      ctx.arc(ex, ey, size, 0, Math.PI * 2);
      ctx.fill();
    } else if (i % 3 === 1) {
      // 方形（微旋轉）
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(t * 2 + i);
      ctx.fillRect(-size * 0.5, -size * 0.5, size, size);
      ctx.restore();
    } else {
      // 拖尾線段
      const tailLen = 3 + n4 * 5;
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = size * 0.5;
      ctx.globalAlpha = alpha * 0.8;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - Math.sin(t + i) * tailLen, ey + tailLen);
      ctx.stroke();
    }
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.restore();

  // ═══════════════════════════════════════════════════════════
  //  Layer 8：飄浮灰燼 + 煙塵微粒（大顆、緩慢）
  // ═══════════════════════════════════════════════════════════
  ctx.save();
  for (let i = 0; i < 15; i++) {
    const n1 = noise(i, 400);
    const n2 = noise(i, 401);
    const drift = t * (3 + n1 * 5) + i * 50;
    const ax = (noise(i, 402) * W + Math.sin(drift * 0.02) * 80) % W;
    const ay = (H * 0.2 + n2 * H * 0.5 + Math.sin(drift * 0.015 + i) * 30);
    const aSize = 3 + n1 * 8;
    const aAlpha = 0.04 + 0.03 * Math.sin(t * 0.5 + i * 1.3);

    ctx.fillStyle = `rgba(40,30,28,${aAlpha})`;
    ctx.beginPath();
    ctx.ellipse(ax, ay, aSize, aSize * 0.6, noise(i, 403) * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // ═══════════════════════════════════════════════════════════
  //  Layer 9：熱浪扭曲效果（地面大範圍熱氣蒸騰）
  // ═══════════════════════════════════════════════════════════
  ctx.save();
  const heatGrad = ctx.createLinearGradient(0, platY - 120, 0, platY + 10);
  heatGrad.addColorStop(0, 'rgba(255,100,30,0)');
  heatGrad.addColorStop(0.3, `rgba(255,80,20,${0.04 + 0.03 * Math.sin(t * 4)})`);
  heatGrad.addColorStop(0.6, `rgba(255,60,10,${0.06 + 0.04 * Math.sin(t * 3.2)})`);
  heatGrad.addColorStop(1, 'rgba(255,40,5,0)');
  ctx.fillStyle = heatGrad;
  ctx.fillRect(0, platY - 120, W, 130);
  ctx.restore();

  // 石台表面的火光映射（地面被火照亮）
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const groundFireGrad = ctx.createLinearGradient(0, platY, 0, platY + 40);
  groundFireGrad.addColorStop(0, `rgba(255,80,20,${0.06 + 0.03 * Math.sin(t * 3.8)})`);
  groundFireGrad.addColorStop(1, 'rgba(255,40,10,0)');
  ctx.fillStyle = groundFireGrad;
  ctx.fillRect(0, platY, W, 40);
  ctx.restore();

  // ═══════════════════════════════════════════════════════════
  //  Layer 10：暗角（Vignette）— 聚焦戰鬥區域
  // ═══════════════════════════════════════════════════════════
  ctx.save();
  const vigX = W * 0.5;
  const vigY = H * 0.5;
  const vigR = Math.max(W, H) * 0.75;
  const vignette = ctx.createRadialGradient(vigX, vigY, vigR * 0.3, vigX, vigY, vigR);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.5, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.75, 'rgba(0,0,0,0.25)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  ctx.restore();
}
