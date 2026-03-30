// ══════════════════════════════════════════════════════════════
//  Local 2-Player Character Select Screen — JavaScript Logic
// ══════════════════════════════════════════════════════════════

// ── CHARACTER DATA (mock, Traditional-Chinese UI text) ──────
const selectCharacters = [
  {
    id: "fujin",
    name: "風影忍者",
    subtitle: "風忍流",
    color: "#00BCD4",
    colorDark: "#00697a",
    icon: "🌪️",
    passive: {
      name: "疾風之體",
      desc: "擁有最敏捷的身法，突進時短暫進入無敵狀態，可穿越攻擊範圍而不受傷。"
    },
    skill1: {
      name: "疾風閃",
      desc: "向前方瞬間閃現，期間完全無敵。若穿過敵人將造成少量傷害。冷卻 6 秒。"
    },
    ultimate: {
      name: "旋風斬",
      desc: "在身周捲起巨大旋風，範圍內多段傷害並猛烈擊飛敵人，可追加二段吸引效果。冷卻 12 秒。"
    }
  },
  {
    id: "katon",
    name: "火焰忍者",
    subtitle: "火忍宗",
    color: "#F44336",
    colorDark: "#8b1a12",
    icon: "🔥",
    passive: {
      name: "烈焰印記",
      desc: "爆炎衝刺命中時在目標留下印記 6 秒，帶印記的敵人被攻擊後持續燃燒 3 秒。"
    },
    skill1: {
      name: "爆炎衝刺",
      desc: "帶著火焰向前猛衝，命中造成傷害與短暫眩暈並施加印記。未命中冷卻延長至 10 秒。"
    },
    ultimate: {
      name: "火球術",
      desc: "施放高速火球，命中後引發大範圍爆炸，對爆炸範圍內敵人造成額外傷害並擊退。冷卻 13 秒。"
    }
  },
  {
    id: "suijin",
    name: "水影忍者",
    subtitle: "水忍門",
    color: "#2196F3",
    colorDark: "#0d4a8a",
    icon: "🌊",
    passive: {
      name: "潮汐護佑",
      desc: "水幕盾結束時回復盾存期間所承受傷害的 60%，是能化守為攻的持久型防禦。"
    },
    skill1: {
      name: "水幕盾",
      desc: "展開水之屏障持續 3 秒，減傷 50% 並提升移速。結束後回復儲存的傷害值。冷卻 8 秒。"
    },
    ultimate: {
      name: "水龍彈",
      desc: "射出水龍形態投射物，命中造成傷害、減速、擊退並附加 1 秒冰凍效果。冷卻 12 秒。"
    }
  },
  {
    id: "raijin",
    name: "雷擊忍者",
    subtitle: "雷忍堂",
    color: "#FFEB3B",
    colorDark: "#8a7c00",
    icon: "⚡",
    passive: {
      name: "雷鳴步伐",
      desc: "全忍者中移速最快，連續移動時蓄積雷能，首次命中附帶額外硬直效果。"
    },
    skill1: {
      name: "閃電步",
      desc: "瞬間消失並在遠處重新出現，位移期間完全無敵。可用於追擊或走位。冷卻 6 秒。"
    },
    ultimate: {
      name: "雷電拳",
      desc: "雙拳齊擊造成連續 2 段高傷害，並施加 1 秒眩暈及後續減速效果。冷卻 8 秒。"
    }
  },
  {
    id: "doton",
    name: "岩甲忍者",
    subtitle: "土忍派",
    color: "#8D6E63",
    colorDark: "#4a3228",
    icon: "🗿",
    passive: {
      name: "岩甲護體",
      desc: "堅硬岩甲減少所有來源傷害 1 點（最低 1 點），普通攻擊附帶 0.3 秒眩暈效果。"
    },
    skill1: {
      name: "岩壁護體",
      desc: "進入格擋姿態 2 秒，完全擋下首次攻擊並反擊 5 點傷害，格擋成功回復 4 HP。冷卻 9 秒。"
    },
    ultimate: {
      name: "地裂震",
      desc: "震撼大地造成雙層範圍攻擊——內圈高傷害加眩暈，外圈擊退加 2 秒沉默。冷卻 15 秒。"
    }
  },
  {
    id: "kage",
    name: "暗影忍者",
    subtitle: "影忍盟",
    color: "#607D8B",
    colorDark: "#263238",
    icon: "🌑",
    passive: {
      name: "暗殺本能",
      desc: "影分身成功反擊敵人後，下次黑刃突襲必定暴擊，造成雙倍傷害。"
    },
    skill1: {
      name: "黑刃突襲",
      desc: "從暗影中飛速突進劈斬，造成高傷害且有暴擊機率，適合突襲收割。冷卻 7 秒。"
    },
    ultimate: {
      name: "影分身術",
      desc: "召喚 5 個暗影分身環繞自身，分身將自動攻擊附近敵人持續 3 秒。冷卻 12 秒。"
    }
  },
  {
    id: "rei",
    name: "靈忍者",
    subtitle: "靈忍社",
    color: "#9C27B0",
    colorDark: "#4a0e59",
    icon: "👻",
    passive: {
      name: "靈魂共鳴",
      desc: "技能命中敵人時回復少量生命值，鼓勵積極進攻來維持續航力。"
    },
    skill1: {
      name: "靈爆符",
      desc: "射出靈力符咒，命中敵人造成傷害同時回復自身 2 HP。冷卻 8 秒。"
    },
    ultimate: {
      name: "靈天審判",
      desc: "蓄力後在目標位置降下審判光柱，大範圍高傷害並治療自身。冷卻 14 秒。"
    }
  },
  {
    id: "adjudicator",
    name: "裁決者",
    subtitle: "制裁廳",
    color: "#B8860B",
    colorDark: "#5a3e00",
    icon: "⚖️",
    passive: {
      name: "肅靜",
      desc: "敵人進入 300px 範圍且朝你接近時，會被裁決威壓減速 15%。"
    },
    skill1: {
      name: "異議駁回",
      desc: "進入 0.8 秒招架窗口。成功時反擊 18 傷害、擊退 150px 並沉默 1.5 秒。冷卻 10 秒。"
    },
    ultimate: {
      name: "最終判決",
      desc: "展開半徑 250px 的裁決領域 6 秒，進入者受 5 傷害，領域內敵方衝刺/瞬移技能無效。冷卻 22 秒。"
    }
  },
  {
    id: "exileblade",
    name: "叛風之刃",
    subtitle: "風忍流（叛逃者）",
    color: "#008B8B",
    colorDark: "#003f3f",
    icon: "🌬️",
    passive: {
      name: "無",
      desc: "沒有被動技能。所有力量都灌注在主動技能與奧義之中。"
    },
    skill1: {
      name: "絕風・裂空突",
      desc: "瞬間水平突進 180px，路徑上的敵人受到 12 點傷害並暈眩 0.5 秒。冷卻 7 秒。"
    },
    ultimate: {
      name: "秘奧義・狂風百裂",
      desc: "投出極速影苦無（射程 400px），命中後瞬移至敵方身旁展開 2 秒處決連斬：4 道黑青交叉風刃形成米字，各造成 5 點傷害，最後本尊現身收刀造成 10 點傷害並擊飛敵人。期間完全無敵。冷卻 18 秒。"
    }
  },
  {
    id: "puppeteer",
    name: "千機傀儡師",
    subtitle: "傀儡座",
    color: "#6A0DAD",
    colorDark: "#3a0660",
    icon: "🎭",
    passive: {
      name: "絲線操控",
      desc: "傀儡存在時，本體普攻同時觸發傀儡攻擊（3點傷害）。傀儡不存在時普攻距離+30px。"
    },
    skill1: {
      name: "傀儡・召喚/收回",
      desc: "召喚傀儡在身前 60px，傀儡自動跟隨移動。再次按下收回。距離超過 300px 自動斷線。冷卻 4 秒。"
    },
    ultimate: {
      name: "秘奧義・幻影交錯",
      desc: "與傀儡交換位置。傀儡原位置產生毒煙霧區（100px/2秒，每0.5秒2傷害+40%減速），本體新位置爆發千本針（120px範圍）8傷害。需要傀儡。冷卻 14 秒。"
    }
  },
  {
    id: "azure_disciple",
    name: "蒼雷之徒",
    subtitle: "禁雷殿",
    color: "#0044AA",
    colorDark: "#001133",
    icon: "⚡",
    passive: {
      name: "禁術・電壓釋放",
      desc: "移動時累積電壓，普攻命中大幅充能。滿100電壓時下一次普攻自動鎖定200px內敵人，造成10傷害+0.8秒暈眩的雷擊。"
    },
    skill1: {
      name: "雷遁・天罰",
      desc: "在敵人腳下生成落雷標記（0.4秒預警），隨後劈下暗藍巨雷（40px寬），命中造成12傷害。冷卻 6 秒。"
    },
    ultimate: {
      name: "秘奧義・萬雷蒼穹斬",
      desc: "瞬移至畫面頂端，全場漆黑閃電。3秒內在敵人附近隨機降下5道落雷，每道10傷害+擊飛。冷卻 19 秒。"
    }
  },
  {
    id: "shamisen",
    name: "雅音忍・弦鳴",
    subtitle: "三味幽庵",
    color: "#8B4513",
    colorDark: "#3E1F00",
    icon: "🎵",
    passive: {
      name: "完美絕對音律",
      desc: "普攻節奏精準（480~520ms間隔）觸發完美音律，傷害翻倍為6、附帶10px擊退，投射物變為金色大號🎶。"
    },
    skill1: {
      name: "撥弦・斷音擊",
      desc: "前方150px處產生一個不可見的弦波衝擊，半徑40px，造成10傷害+0.5秒暈眩。冷卻 7 秒。"
    },
    ultimate: {
      name: "秘奧義・殺陣曲",
      desc: "原地演奏3秒，產生三層擴散音波圈：第一波100px半徑減速70%，第二波200px半徑減速40%，第三波800px半徑造成15傷害+擊飛。冷卻 20 秒。"
    }
  }
];

// ── MAP DATA ────────────────────────────────────────────────
const selectMaps = [
  { id: "grassland",     name: "預設競技場", desc: "廣闊的青翠草原，陽光照耀下的經典對決場地。" },
  { id: "forest",        name: "幽暗森林",   desc: "古木參天的神秘森林，樹影搖曳增添戰鬥張力。" },
  { id: "castle",        name: "天守閣頂",   desc: "高聳入雲的城堡屋頂，月光下展開生死對決。" },
  { id: "ship",          name: "海上甲板",   desc: "波濤洶湧的海面上，在搖擺的船甲板上決一勝負。" },
  { id: "windNinjaDojo", name: "風忍武道場", desc: "風忍一族的山巔武道場——滅門之夜，烈焰焚噬，殘垣中唯餘死寂。" }
];

// ── CONSTANTS ───────────────────────────────────────────────
const GRID_COLUMNS = 4;

// ── STATE ───────────────────────────────────────────────────
let p1Index    = 0;
let p2Index    = Math.min(1, selectCharacters.length - 1);
let p1Locked   = false;
let p2Locked   = false;
let currentMapIndex = 0;

// ── DOM CACHE ───────────────────────────────────────────────
let dom = {};

// ═══════════════════════════════════════════════════════════
//  INITIALISATION
// ═══════════════════════════════════════════════════════════

function init() {
  cacheDom();
  buildRoster();
  buildMapList();
  bindKeyboard();
  bindButtons();
  renderAll();
}

function cacheDom() {
  const id = (s) => document.getElementById(s);
  dom = {
    rosterGrid:    id("rosterGrid"),
    // P1
    p1Avatar:      id("p1Avatar"),
    p1CharName:    id("p1CharName"),
    p1PassiveName: id("p1PassiveName"),
    p1PassiveDesc: id("p1PassiveDesc"),
    p1Skill1Name:  id("p1Skill1Name"),
    p1Skill1Desc:  id("p1Skill1Desc"),
    p1UltName:     id("p1UltName"),
    p1UltDesc:     id("p1UltDesc"),
    p1Ready:       id("p1Ready"),
    // P2
    p2Avatar:      id("p2Avatar"),
    p2CharName:    id("p2CharName"),
    p2PassiveName: id("p2PassiveName"),
    p2PassiveDesc: id("p2PassiveDesc"),
    p2Skill1Name:  id("p2Skill1Name"),
    p2Skill1Desc:  id("p2Skill1Desc"),
    p2UltName:     id("p2UltName"),
    p2UltDesc:     id("p2UltDesc"),
    p2Ready:       id("p2Ready"),
    // Bottom bar
    mapDisplay:    id("mapDisplay"),
    btnRandom:     id("btnRandom"),
    btnMap:        id("btnMap"),
    btnStart:      id("btnStart"),
    // Map modal
    mapModal:      id("mapModal"),
    mapList:       id("mapList"),
    btnCloseMap:   id("btnCloseMap")
  };
}

// ═══════════════════════════════════════════════════════════
//  BUILD DOM
// ═══════════════════════════════════════════════════════════

function buildRoster() {
  dom.rosterGrid.innerHTML = "";

  selectCharacters.forEach(function (char, i) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "roster-cell";
    btn.dataset.index = i;
    btn.setAttribute("role", "gridcell");
    btn.setAttribute("aria-label", char.name);

    var avatar = document.createElement("div");
    avatar.className = "cell-avatar";
    avatar.style.setProperty("--char-color", char.color);
    avatar.style.setProperty("--char-dark", char.colorDark);
    avatar.textContent = char.icon;

    var name = document.createElement("span");
    name.className = "cell-name";
    name.textContent = char.name;

    btn.appendChild(avatar);
    btn.appendChild(name);
    btn.addEventListener("click", function () { handleCellClick(i); });
    dom.rosterGrid.appendChild(btn);
  });
}

function buildMapList() {
  dom.mapList.innerHTML = "";

  selectMaps.forEach(function (map, i) {
    // 🔥 風忍武道場僅在 叛風之刃 vs 風影忍者 時顯示
    if (map.id === 'windNinjaDojo') {
      var picks = typeof gameState !== 'undefined' ? gameState.selectedCharacters : null;
      if (!picks) return;
      var sorted = [picks.player1, picks.player2].sort();
      if (!(sorted[0] === 'exileblade' && sorted[1] === 'fujin')) return;
    }

    var card = document.createElement("button");
    card.type = "button";
    card.className = "map-card";
    card.dataset.index = i;

    var cardName = document.createElement("span");
    cardName.className = "map-card-name";
    cardName.textContent = map.name;

    var cardDesc = document.createElement("span");
    cardDesc.className = "map-card-desc";
    cardDesc.textContent = map.desc;

    card.appendChild(cardName);
    card.appendChild(cardDesc);
    card.addEventListener("click", function () { pickMap(i); });
    dom.mapList.appendChild(card);
  });
}

// ═══════════════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════════════

function renderAll() {
  renderCursors();
  renderPanel("p1");
  renderPanel("p2");
  renderReadyBadges();
  renderMapDisplay();
  renderStartButton();
}

function renderCursors() {
  var cells = dom.rosterGrid.querySelectorAll(".roster-cell");
  cells.forEach(function (cell, i) {
    cell.classList.remove(
      "cursor-p1", "cursor-p2", "cursor-both",
      "locked-p1", "locked-p2"
    );

    var isP1 = (i === p1Index);
    var isP2 = (i === p2Index);

    if (isP1 && isP2) {
      cell.classList.add("cursor-both");
    } else {
      if (isP1) cell.classList.add("cursor-p1");
      if (isP2) cell.classList.add("cursor-p2");
    }

    if (p1Locked && isP1) cell.classList.add("locked-p1");
    if (p2Locked && isP2) cell.classList.add("locked-p2");
  });
}

function renderPanel(player) {
  var index = (player === "p1") ? p1Index : p2Index;
  var char  = selectCharacters[index];
  var p     = player; // shorthand prefix

  dom[p + "Avatar"].textContent = char.icon;
  dom[p + "Avatar"].style.background =
    "linear-gradient(135deg, " + char.color + "55, " + char.colorDark + "aa)";

  dom[p + "CharName"].textContent    = char.name;
  dom[p + "PassiveName"].textContent = char.passive.name;
  dom[p + "PassiveDesc"].textContent = char.passive.desc;
  dom[p + "Skill1Name"].textContent  = char.skill1.name;
  dom[p + "Skill1Desc"].textContent  = char.skill1.desc;
  dom[p + "UltName"].textContent     = char.ultimate.name;
  dom[p + "UltDesc"].textContent     = char.ultimate.desc;
}

function renderReadyBadges() {
  dom.p1Ready.classList.toggle("visible", p1Locked);
  dom.p2Ready.classList.toggle("visible", p2Locked);
}

function renderMapDisplay() {
  dom.mapDisplay.textContent = "目前地圖：" + selectMaps[currentMapIndex].name;

  var cards = dom.mapList.querySelectorAll(".map-card");
  cards.forEach(function (c, i) {
    c.classList.toggle("active", i === currentMapIndex);
  });
}

function renderStartButton() {
  dom.btnStart.disabled = !(p1Locked && p2Locked);
}

// ═══════════════════════════════════════════════════════════
//  NAVIGATION
// ═══════════════════════════════════════════════════════════

function movePlayer(player, direction) {
  if (player === "p1" && p1Locked) return;
  if (player === "p2" && p2Locked) return;

  var idx   = (player === "p1") ? p1Index : p2Index;
  var total = selectCharacters.length;
  var cols  = GRID_COLUMNS;
  var rows  = Math.ceil(total / cols);
  var row   = Math.floor(idx / cols);
  var col   = idx % cols;

  switch (direction) {
    case "up":    row = (row - 1 + rows) % rows; break;
    case "down":  row = (row + 1) % rows; break;
    case "left":  col = (col - 1 + cols) % cols; break;
    case "right": col = (col + 1) % cols; break;
  }

  var newIdx = row * cols + col;

  // Clamp into valid range when landing beyond the last character
  while (newIdx >= total && newIdx > 0) {
    newIdx--;
  }

  if (player === "p1") p1Index = newIdx;
  else                  p2Index = newIdx;

  renderAll();
}

// ═══════════════════════════════════════════════════════════
//  LOCK / UNLOCK
// ═══════════════════════════════════════════════════════════

function toggleLock(player) {
  if (player === "p1") p1Locked = !p1Locked;
  else                  p2Locked = !p2Locked;
  renderAll();
}

// ═══════════════════════════════════════════════════════════
//  CELL CLICK
// ═══════════════════════════════════════════════════════════

function handleCellClick(index) {
  // Assign click to the first unlocked player; prefer P1.
  if (!p1Locked) {
    p1Index = index;
  } else if (!p2Locked) {
    p2Index = index;
  }
  renderAll();
}

// ═══════════════════════════════════════════════════════════
//  RANDOM SELECT
// ═══════════════════════════════════════════════════════════

function randomSelect() {
  var total = selectCharacters.length;

  if (!p1Locked) {
    p1Index = Math.floor(Math.random() * total);
  }

  if (!p2Locked) {
    var r;
    do {
      r = Math.floor(Math.random() * total);
    } while (r === p1Index && total > 1);
    p2Index = r;
  }

  renderAll();
}

// ═══════════════════════════════════════════════════════════
//  MAP SELECTION
// ═══════════════════════════════════════════════════════════

function openMapModal() {
  dom.mapModal.hidden = false;
  renderMapDisplay();
}

function closeMapModal() {
  dom.mapModal.hidden = true;
}

function pickMap(index) {
  currentMapIndex = index;
  renderMapDisplay();
  closeMapModal();
}

// ═══════════════════════════════════════════════════════════
//  START GAME
// ═══════════════════════════════════════════════════════════

function startGame() {
  if (!p1Locked || !p2Locked) return;

  var p1Char = selectCharacters[p1Index];
  var p2Char = selectCharacters[p2Index];
  var map    = selectMaps[currentMapIndex];

  // Mockup: display result. In production this would launch the game engine.
  alert(
    "對戰即將開始！\n\n" +
    "玩家一：" + p1Char.name + "\n" +
    "玩家二：" + p2Char.name + "\n" +
    "地圖：" + map.name
  );
}

// ═══════════════════════════════════════════════════════════
//  KEYBOARD INPUT
// ═══════════════════════════════════════════════════════════

function bindKeyboard() {
  document.addEventListener("keydown", function (e) {
    // If map modal is open, only allow Escape
    if (!dom.mapModal.hidden) {
      if (e.key === "Escape") closeMapModal();
      return;
    }

    var key = e.key;

    // ── Player 1: WASD + F ──
    switch (key.toLowerCase()) {
      case "w": e.preventDefault(); movePlayer("p1", "up");    return;
      case "s": e.preventDefault(); movePlayer("p1", "down");  return;
      case "a": e.preventDefault(); movePlayer("p1", "left");  return;
      case "d": e.preventDefault(); movePlayer("p1", "right"); return;
      case "f": e.preventDefault(); toggleLock("p1");           return;
    }

    // ── Player 2: Arrow keys + Enter ──
    switch (key) {
      case "ArrowUp":    e.preventDefault(); movePlayer("p2", "up");    return;
      case "ArrowDown":  e.preventDefault(); movePlayer("p2", "down");  return;
      case "ArrowLeft":  e.preventDefault(); movePlayer("p2", "left");  return;
      case "ArrowRight": e.preventDefault(); movePlayer("p2", "right"); return;
      case "Enter":      e.preventDefault(); toggleLock("p2");           return;
    }
  });
}

// ═══════════════════════════════════════════════════════════
//  BUTTON HANDLERS
// ═══════════════════════════════════════════════════════════

function bindButtons() {
  dom.btnRandom.addEventListener("click", randomSelect);
  dom.btnMap.addEventListener("click", openMapModal);
  dom.btnStart.addEventListener("click", startGame);
  dom.btnCloseMap.addEventListener("click", closeMapModal);

  // Click the scrim (backdrop) to close modal
  dom.mapModal.addEventListener("click", function (e) {
    if (e.target === dom.mapModal) closeMapModal();
  });
}

// ═══════════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", init);
