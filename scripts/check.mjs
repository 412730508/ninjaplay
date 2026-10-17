import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const htmlPath = resolve(root, 'index.html');
const html = readFileSync(htmlPath, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
  const type = match[1].match(/\btype=["']([^"']+)/)?.[1];
  if (type && type !== 'text/javascript') continue;
  if (match[2].trim()) new vm.Script(match[2], { filename: 'index.html inline script' });
}
const localAssets = [...new Set([
  ...[...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map((match) => match[1].split(/[?#]/, 1)[0]),
  ...[...html.matchAll(/assets\/portraits\/[\w.-]+\.png/g)].map((match) => match[0])
])].filter((asset) => !/^(?:https?:|data:|#)/.test(asset));

const retiredRecoveryFiles = [
  'corrupted_lines.txt', 'gameEngine.js.bak', 'replacements.json',
  'fix_from_json.ps1', 'fix_from_json_bom.ps1', 'fix_garbled.ps1',
  'fix_garbled2.ps1', 'fix_garbled_final.ps1', 'styles.css', 'selectScreen.css'
];

let failed = false;
for (const asset of localAssets) {
  const path = resolve(root, asset);
  if (!existsSync(path)) {
    console.error(`Missing local asset: ${asset}`);
    failed = true;
  }
}

const retiredFilesStillPresent = retiredRecoveryFiles.filter((file) => existsSync(resolve(root, file)));
if (retiredFilesStillPresent.length) {
  console.error(`Retired recovery or unused files remain: ${retiredFilesStillPresent.join(', ')}`);
  failed = true;
}

for (const file of readdirSync(root).filter((file) => file.endsWith('.css'))) {
  const css = readFileSync(resolve(root, file), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/'[^']*'|"[^"]*"/g, '');
  const openBraces = [...css].filter((character) => character === '{').length;
  const closeBraces = [...css].filter((character) => character === '}').length;
  if (openBraces !== closeBraces) {
    console.error(`CSS brace check failed in ${file}: ${openBraces} opening and ${closeBraces} closing braces.`);
    failed = true;
  }
}

// Literal DOM IDs are easy to mistype in a script-heavy static page. Dynamic
// template IDs are intentionally ignored here; this verifies every fixed ID.
const declaredIds = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]));
const pageSources = [html, ...readdirSync(root)
  .filter((file) => file.endsWith('.js'))
  .map((file) => readFileSync(resolve(root, file), 'utf8'))];
const requestedIds = pageSources.flatMap((source) =>
  [...source.matchAll(/getElementById\(\s*['"]([^'"]+)['"]\s*\)/g)].map((match) => match[1])
);
const missingIds = [...new Set(requestedIds.filter((id) => !declaredIds.has(id)))];
if (missingIds.length) {
  console.error(`Missing fixed DOM IDs: ${missingIds.join(', ')}`);
  failed = true;
}

const sourceDebugLogs = pageSources.slice(1).flatMap((source) =>
  [...source.matchAll(/\bconsole\.log\s*\(/g)].map((match) => match.index)
);
if (sourceDebugLogs.length) {
  console.error(`Debug console.log calls remain in page source: ${sourceDebugLogs.length}`);
  failed = true;
}

for (const file of readdirSync(root).filter((file) => file.endsWith('.js'))) {
  const result = spawnSync(process.execPath, ['--check', file], {
    cwd: root,
    encoding: 'utf8'
  });
  if (result.status !== 0) {
    console.error(`JavaScript syntax check failed: ${file}`);
    console.error(result.stderr || result.stdout);
    failed = true;
  }
}

// `balance.js` is intentionally a plain browser script. Run it with the roster
// in an isolated context to catch a missing script order or invalid patch path.
try {
  const balanceContext = vm.createContext({ console });
  vm.runInContext(readFileSync(resolve(root, 'characters.js'), 'utf8'), balanceContext);
  vm.runInContext(readFileSync(resolve(root, 'balance.js'), 'utf8'), balanceContext);
  const roster = vm.runInContext('characters', balanceContext);
  const expectedValues = [
    ['katon', 'skills.normal.cooldown', 8000],
    ['dokusei', 'skills.normal.damage', 5],
    ['fujin', 'attackDamage', 7],
    ['fujin', 'skills.ultimate.cooldown', 11000],
    ['suijin', 'skills.normal.baseHeal', 5],
    ['suijin', 'skills.normal.healPercent', 0.8],
    ['doton', 'maxHp', 130],
    ['kage', 'skills.ultimate.cloneCount', 6],
    ['kage', 'skills.ultimate.cloneDamage', 2],
    ['rei', 'skills.ultimate.range', 400],
    ['taijutsu', 'skills.normal.cooldown', 8000],
    ['taijutsu', 'skills.ultimate.damage', 17],
    ['ranger', 'skills.normal.cooldown', 9000],
    ['ranger', 'skills.ultimate.cooldown', 8000],
    ['warlock', 'attackDamage', 4],
    ['warlock', 'attackSpeed', 700],
    ['warlock', 'attackHeal', 2],
    ['beastmaster', 'skills.ultimate.minStacksToCast', 3],
    ['beastmaster', 'skills.ultimate.golemShield', 20],
    ['beastmaster', 'skills.ultimate.transformRootRange', 200],
    ['beastmaster', 'skills.ultimate.golemSkillDelay', 300],
    ['beastmaster', 'skills.ultimate.revertCooldown', 3000],
    ['scorpion', 'skills.ultimate.damage', 4],
    ['adjudicator', 'moveSpeed', 240],
    ['adjudicator', 'skills.normal.cooldown', 8000],
    ['azure_disciple', 'skills.normal.warningDuration', 200],
    ['shamisen', 'attackDamage', 5],
    ['shamisen', 'skills.ultimate.cooldown', 18000],
    ['shamisen', 'passive.attacksNeeded', 4],
    ['shamisen', 'passive.fourthHitDamage', 5],
    ['shamisen', 'passive.fourthHitSlowDuration', 1000],
    ['puppeteer', 'skills.normal.puppetSpeed', 240],
    ['puppeteer', 'skills.normal.puppetSpawnDistance', 150],
    ['puppeteer', 'skills.normal.puppetAdvanceLimit', 150],
    ['puppeteer', 'skills.ultimate.smokeRadius', 200],
    ['kage', 'skills.ultimate.duration', 3000],
    ['kage', 'skills.ultimate.spawnDelay', 100],
    ['forgefire', 'attackDamage', 7],
    ['forgefire', 'maxHp', 110],
    ['forgefire', 'skills.normal.cooldown', 7000],
    ['forgefire', 'skills.normal.stun', 500],
    ['forgefire', 'skills.ultimate.chargeTime', 700],
    ['forgefire', 'skills.ultimate.trailDuration', 3000],
    ['stephen', 'attackDamage', 7],
    ['yanghong', 'passive.hitsPerDrop', 3],
    ['yanghong', 'passive.coinsPerDrop', 7],
    ['yanghong', 'skills.ultimate.cooldown', 10000],
    ['gladiator', 'maxHp', 100],
    ['gladiator', 'attackDamage', 3],
    ['gladiator', 'attackSpeed', 900],
    ['gladiator', 'moveSpeed', 270],
    ['gladiator', 'skills.normal.cooldown', 15000],
    ['gladiator', 'skills.normal.duration', 3000],
    ['gladiator', 'skills.normal.damageReduction', 0.6],
    ['gladiator', 'skills.ultimate.cooldown', 20000],
    ['gladiator', 'skills.ultimate.leapDistance', 150],
    ['gladiator', 'skills.ultimate.leapDuration', 500],
    ['gladiator', 'skills.ultimate.damage', 8],
    ['gladiator', 'skills.ultimate.arenaRadius', 100],
    ['gladiator', 'skills.ultimate.arenaDuration', 4000]
  ];
  for (const [characterId, propertyPath, expected] of expectedValues) {
    const actual = propertyPath.split('.').reduce((value, key) => value?.[key], roster[characterId]);
    if (actual !== expected) {
      throw new Error(`${characterId}.${propertyPath}: expected ${expected}, received ${actual}`);
    }
  }
} catch (error) {
  console.error(`Balance patch check failed: ${error.message}`);
  failed = true;
}

// Every selectable skill must have a complete UI label, a game-engine handler,
// an animation mapping and a particle effect. This catches omissions when a
// new character is added without updating all four systems.
try {
  const rosterContext = vm.createContext({ console });
  vm.runInContext(readFileSync(resolve(root, 'characters.js'), 'utf8'), rosterContext);
  const roster = vm.runInContext('characters', rosterContext);
  const skillCodes = vm.runInContext('SKILL_CODES', rosterContext);
  const engineSource = readFileSync(resolve(root, 'gameEngine.js'), 'utf8');
  const selectableSkills = Object.values(roster)
    .filter(Boolean)
    .flatMap((character) => Object.values(character.skills || {}).filter(Boolean));

  const missingTypes = selectableSkills.filter((skill) => !skill.type).map((skill) => skill.name);
  if (missingTypes.length) {
    throw new Error(`skills missing a display type: ${missingTypes.join(', ')}`);
  }

  const missingHandlers = [];
  const missingAnimations = [];
  for (const [codeName, code] of Object.entries(skillCodes)) {
    if (!engineSource.includes(`case SKILL_CODES.${codeName}:`)) {
      missingHandlers.push(code);
    }
    if (!engineSource.includes(`[SKILL_CODES.${codeName}]:`)) {
      missingAnimations.push(code);
    }
  }
  if (missingHandlers.length || missingAnimations.length) {
    throw new Error([
      missingHandlers.length && `skills missing handlers: ${missingHandlers.join(', ')}`,
      missingAnimations.length && `skills missing animations: ${missingAnimations.join(', ')}`
    ].filter(Boolean).join('; '));
  }

  const particleWarnings = [];
  const particleContext = vm.createContext({
    console: { warn: (...args) => particleWarnings.push(args.join(' ')) },
    setTimeout: () => 0,
    clearTimeout: () => {}
  });
  vm.runInContext(readFileSync(resolve(root, 'particleSystem.js'), 'utf8'), particleContext);
  const ParticleSystem = vm.runInContext('ParticleSystem', particleContext);
  const particleSystem = new ParticleSystem();
  const renderContext = new Proxy({
    arc(_x, _y, radius) {
      if (!Number.isFinite(radius) || radius < 0) {
        throw new Error(`invalid Canvas arc radius: ${radius}`);
      }
    },
    createRadialGradient() { return { addColorStop() {} }; },
    createLinearGradient() { return { addColorStop() {} }; }
  }, {
    get(target, property) {
      return property in target ? target[property] : () => {};
    },
    set() { return true; }
  });

  for (const code of Object.values(skillCodes)) {
    particleSystem.createSkillEffect(code, 320, 280, 1);
  }
  for (const [code, expectedTypes] of [
    ['GLD_001', ['taijutsu_impact_ring', 'impact_fist_line']],
    ['GLD_002', ['taijutsu_impact_ring', 'impact_fist_line']]
  ]) {
    particleSystem.particles = [];
    particleSystem.createSkillEffect(code, 320, 280, 1);
    for (const type of expectedTypes) {
      if (!particleSystem.particles.some(particle => particle.type === type)) {
        throw new Error(`${code} is missing its authored effect component: ${type}`);
      }
    }
    particleSystem.render(renderContext);
  }
  for (const [code, expectedTypes] of [
    ['YH_001', ['coffee_crema_ring', 'coffee_pour_stream', 'coffee_splash']],
    ['YH_002', ['tongue_lash', 'tongue_highlight', 'tongue_impact_ring']]
  ]) {
    particleSystem.particles = [];
    particleSystem.createSkillEffect(code, 320, 280, -1);
    for (const type of expectedTypes) {
      if (!particleSystem.particles.some(particle => particle.type === type)) {
        throw new Error(`${code} is missing its authored effect component: ${type}`);
      }
    }
    particleSystem.render(renderContext);
  }
  for (const elementalId of ['fujin', 'katon', 'suijin', 'raijin', 'doton', 'kage', 'rei', 'dokusei', 'taijutsu', 'ranger', 'warlock', 'ronin', 'beastmaster', 'scorpion', 'adjudicator', 'exileblade', 'forgefire', 'puppeteer', 'azure_disciple', 'shamisen', 'gladiator']) {
    particleSystem.createElementalBasicAttackEffect(elementalId, 320, 280, 1, 80);
    particleSystem.createElementalImpactEffect(elementalId, 400, 280);
  }
  if (particleWarnings.length) {
    throw new Error(`skills missing particle effects: ${particleWarnings.join(' | ')}`);
  }
  particleSystem.update(16);
  particleSystem.render(renderContext);
  particleSystem.particles = Array.from({ length: particleSystem.maxParticles + 120 }, (_, index) => ({
    x: index, y: 0, life: 500, maxLife: 500, alpha: 1, type: 'generic'
  }));
  particleSystem.update(16);
  if (particleSystem.particles.length > particleSystem.maxParticles) {
    throw new Error('particle safety limit did not prune an overloaded frame');
  }

  const engineContext = vm.createContext({ console, Math: Object.create(Math), setTimeout: () => 0, clearTimeout: () => {} });
  vm.runInContext(readFileSync(resolve(root, 'characters.js'), 'utf8'), engineContext);
  vm.runInContext(engineSource, engineContext);
  const NinjaGame = vm.runInContext('NinjaGame', engineContext);
  const animatorContext = vm.createContext({ document: { addEventListener() {} }, console });
  vm.runInContext(readFileSync(resolve(root, 'stickmanAnimator.js'), 'utf8'), animatorContext);
  const stephenAnimator = vm.runInContext('new StickmanAnimator()', animatorContext);
  for (const name of ['stephenCharge', 'stephenThrow', 'stephenEat', 'stephenGrill', 'stephenBreath']) {
    if (stephenAnimator.animations[name]?.length !== 12) throw new Error(`Stephen animation is missing: ${name}`);
  }
  for (const elementalId of ['fujin', 'katon', 'suijin', 'raijin', 'doton', 'kage', 'rei', 'dokusei', 'taijutsu', 'ranger', 'warlock', 'ronin', 'beastmaster', 'scorpion', 'adjudicator', 'exileblade', 'forgefire', 'puppeteer', 'azure_disciple', 'shamisen', 'gladiator']) {
    for (const kind of ['swing', 'impact']) {
      const rendered = NinjaGame.prototype.renderElementalCombatFlourish.call({}, renderContext, {
        element: elementalId, kind, x: 320, y: 250, targetX: 400, targetY: 250,
        facing: 1, power: 1, color: '#00AAFF', shade: '#003366', highlight: '#FFFFFF'
      }, 0.4, 0.6);
      if (!rendered) throw new Error(`elemental flourish did not render: ${elementalId} ${kind}`);
    }
  }

  // Exercise both Stephen forms, including the moving grill and key-release charge.
  let simulatedNow = 100000;
  engineContext.Date = class extends Date { static now() { return simulatedNow; } };

  // Exercise the gladiator's hit-count passive, one-stack-per-attack energy,
  // Will cooldown reduction/mitigation, leap immunity, stomp, and cage bounds.
  const gladiatorGame = new NinjaGame();
  gladiatorGame.selectCharacters('gladiator', 'fujin');
  for (const method of ['addVisualEffect', 'addDamageNumber', 'addCombatLog', 'triggerCameraShake', 'spawnCombatFlourish']) gladiatorGame[method] = () => {};
  const gladiator = gladiatorGame.players.player1;
  const gladiatorTarget = gladiatorGame.players.player2;
  gladiator.position = { x: 300, y: 300 };
  gladiatorTarget.position = { x: 350, y: 300 };
  gladiator.effects.counterAttack = 0;
  for (let hit = 0; hit < 4; hit++) {
    simulatedNow += 901;
    gladiatorGame.attack('player1');
  }
  if (gladiatorTarget.hp !== 82 || gladiator.gladiatorHitCount !== 4 || gladiator.gladiatorEnergy !== 4 || gladiator.attackDamage !== 5 || gladiator.attackSpeed !== 400 || gladiator.gladiatorBerserkUntil !== simulatedNow + 5000) {
    throw new Error('Gladiator passive did not add the second-hit damage and trigger exactly one berserk at four landed attacks');
  }
  simulatedNow += 5000;
  gladiatorGame.updateGladiatorSystems();
  if (gladiator.attackDamage !== 3 || gladiator.attackSpeed !== 900 || gladiator.gladiatorEnergy !== 0) {
    throw new Error('Gladiator berserk did not expire back to base stats and clear energy');
  }

  const bloodFrenzyGame = new NinjaGame();
  bloodFrenzyGame.selectCharacters('gladiator', 'fujin', { player1: { primary: 'gladiator_blood_frenzy' } });
  for (const method of ['addVisualEffect', 'addDamageNumber', 'addCombatLog', 'triggerCameraShake', 'spawnCombatFlourish']) bloodFrenzyGame[method] = () => {};
  bloodFrenzyGame.players.player1.position = { x: 300, y: 300 };
  bloodFrenzyGame.players.player2.position = { x: 350, y: 300 };
  simulatedNow += 901;
  bloodFrenzyGame.attack('player1');
  simulatedNow += 901;
  bloodFrenzyGame.attack('player1');
  if (bloodFrenzyGame.players.player2.hp !== 89) throw new Error('Blood Frenzy did not raise the passive second-hit bonus to five damage');

  const willGame = new NinjaGame();
  willGame.selectCharacters('gladiator', 'katon', { player1: { secondary: 'gladiator_ironheart_stance' } });
  for (const method of ['addVisualEffect', 'addDamageNumber', 'addCombatLog', 'triggerCameraShake', 'spawnCombatFlourish']) willGame[method] = () => {};
  const willUser = willGame.players.player1;
  willGame.players.player2.position.x = willUser.position.x + 40;
  willGame.useSkill('player1', 'normal');
  const willStartX = willUser.position.x;
  willGame.movePlayer('player1', 1);
  if (Math.abs(willUser.position.x - (willStartX + 270 * 1.1 * 0.016)) > 0.01) {
    throw new Error('Gladiator Will did not increase movement speed by ten percent');
  }
  const willCooldownAt = willGame.cooldowns.player1.normal;
  const willHp = willUser.hp;
  const willDamage = willGame.dealDamage(willUser, 10, 'player2');
  if (!willDamage.hit || willUser.hp !== willHp - 4 || willUser.effects.gladiatorWillUntil !== simulatedNow + 3600) {
    throw new Error('Ironheart Stance did not extend Gladiator Will to 3.6 seconds with 60% reduction');
  }
  willGame.attack('player1');
  if (willGame.cooldowns.player1.normal !== willCooldownAt - 500) {
    throw new Error('Gladiator basic-attack hit did not reduce Will cooldown by 0.5 seconds');
  }
  simulatedNow += 3600;
  const expiredWillHp = willUser.hp;
  willGame.dealDamage(willUser, 10, 'player2');
  if (willUser.hp !== expiredWillHp - 10) throw new Error('Gladiator Will damage reduction remained active after its duration');

  const leapGame = new NinjaGame();
  leapGame.selectCharacters('gladiator', 'fujin', { player1: { primary: 'gladiator_caesar_stomp', secondary: 'gladiator_central_binding' } });
  for (const method of ['addVisualEffect', 'addDamageNumber', 'addCombatLog', 'triggerCameraShake', 'spawnCombatFlourish']) leapGame[method] = () => {};
  const leaper = leapGame.players.player1;
  const leapTarget = leapGame.players.player2;
  leaper.position = { x: 300, y: 300 };
  leapTarget.position = { x: 450, y: 300 };
  leapGame.useSkill('player1', 'ultimate');
  if (!leaper.gladiatorLeap || leapGame.dealDamage(leaper, 10, 'player2').immune !== true) {
    throw new Error('Gladiator ultimate did not enter an invulnerable leap');
  }
  simulatedNow += 250;
  leapGame.updateGladiatorSystems();
  if (Math.abs(leaper.position.x - 375) > 0.1 || leaper.position.y >= 300) {
    throw new Error('Gladiator did not travel forward and rise during the front flip');
  }
  simulatedNow += 250;
  leapGame.updateGladiatorSystems();
  if (leaper.gladiatorLeap || leapTarget.hp !== 89 || leapGame.gameState.gladiatorArena?.targetId !== 'player2' || leapGame.gameState.gladiatorArena.expiresAt !== simulatedNow + 4750) {
    throw new Error('Caesar Stomp or Central Binding did not apply the 11-damage hit and 4.75-second arena');
  }
  leaper.effects.gladiatorWillUntil = simulatedNow + 1000;
  const gladiatorDrawCalls = [];
  leapGame.ctx = new Proxy({}, {
    get: (_target, property) => (...args) => gladiatorDrawCalls.push({ property, args }),
    set: () => true
  });
  leapGame.renderGladiatorCombatVfx();
  if (!gladiatorDrawCalls.some(call => call.property === 'ellipse') ||
      !gladiatorDrawCalls.some(call => call.property === 'arc') ||
      !gladiatorDrawCalls.some(call => call.property === 'quadraticCurveTo' &&
        Math.abs(call.args[2] - leapGame.gameState.gladiatorArena.x) < 0.01 &&
        call.args[3] > leapGame.gameState.gladiatorArena.y && call.args[3] < leapGame.gameState.gladiatorArena.y + 40)) {
    throw new Error('Gladiator shield and bound-target chain did not issue their canvas drawing calls');
  }
  leapTarget.position.x = 700;
  leapGame.updateGladiatorSystems();
  if (leapTarget.position.x !== 550) throw new Error('Gladiator arena did not enforce its 100px radius boundary');
  simulatedNow += 4750;
  leapGame.updateGladiatorSystems();
  if (leapGame.gameState.gladiatorArena !== null) throw new Error('Gladiator arena did not expire after four seconds');

  const edgeLeapGame = new NinjaGame();
  edgeLeapGame.selectCharacters('gladiator', 'fujin');
  for (const method of ['addVisualEffect', 'addDamageNumber', 'addCombatLog', 'triggerCameraShake', 'spawnCombatFlourish']) edgeLeapGame[method] = () => {};
  edgeLeapGame.players.player1.position = { x: 300, y: 300 };
  edgeLeapGame.players.player2.position = { x: 600, y: 300 };
  edgeLeapGame.useSkill('player1', 'ultimate');
  simulatedNow += 500;
  edgeLeapGame.updateGladiatorSystems();
  if (edgeLeapGame.players.player2.hp !== 92 || edgeLeapGame.gameState.gladiatorArena?.radius !== 100) {
    throw new Error('Gladiator impact radius did not include a target exactly 150px from the landing point');
  }

  const playerTwoLeapGame = new NinjaGame();
  playerTwoLeapGame.selectCharacters('fujin', 'gladiator');
  for (const method of ['addVisualEffect', 'addDamageNumber', 'addCombatLog', 'triggerCameraShake', 'spawnCombatFlourish']) playerTwoLeapGame[method] = () => {};
  playerTwoLeapGame.players.player2.position = { x: 700, y: 300 };
  playerTwoLeapGame.players.player2.facing = -1;
  playerTwoLeapGame.players.player1.position = { x: 550, y: 300 };
  playerTwoLeapGame.useSkill('player2', 'ultimate');
  simulatedNow += 500;
  playerTwoLeapGame.updateGladiatorSystems();
  if (playerTwoLeapGame.players.player2.position.x !== 550 || playerTwoLeapGame.players.player1.hp !== 92 || playerTwoLeapGame.gameState.gladiatorArena?.ownerId !== 'player2') {
    throw new Error('Gladiator ultimate did not work when played from P2 facing left');
  }

  const missedLeapGame = new NinjaGame();
  missedLeapGame.selectCharacters('gladiator', 'fujin');
  for (const method of ['addVisualEffect', 'addDamageNumber', 'addCombatLog', 'triggerCameraShake', 'spawnCombatFlourish']) missedLeapGame[method] = () => {};
  missedLeapGame.players.player1.position = { x: 300, y: 300 };
  missedLeapGame.players.player2.position = { x: 650, y: 300 };
  missedLeapGame.useSkill('player1', 'ultimate');
  simulatedNow += 500;
  missedLeapGame.updateGladiatorSystems();
  if (missedLeapGame.players.player2.hp !== 100 || missedLeapGame.gameState.gladiatorArena) {
    throw new Error('Gladiator ultimate incorrectly damaged or trapped a target outside its 150px landing radius');
  }

  // Yang Hong's wallet must stay at the top corner on his side, away from the
  // character health label regardless of whether he is P1 or P2.
  for (const [yangSide, leftSide] of [['player1', true], ['player2', false]]) {
    const walletGame = new NinjaGame();
    walletGame.selectCharacters(yangSide === 'player1' ? 'yanghong' : 'katon', yangSide === 'player2' ? 'yanghong' : 'katon');
    walletGame.players[yangSide].yangWallet = 21;
    walletGame.players[yangSide].position = { x: 400, y: 350 };
    walletGame.canvasWidth = 800;
    const walletLabels = [];
    walletGame.ctx = new Proxy(renderContext, {
      get(target, property) {
        if (property === 'fillText') return (...args) => walletLabels.push(args);
        return target[property];
      }
    });
    walletGame.renderYangHongSystems();
    const walletLabel = walletLabels.find(([text]) => text === '¥ 21 / 80');
    const expectedX = leftSide ? 14 + 46 : 800 - 14 - 92 + 46;
    if (!walletLabel || walletLabel[1] !== expectedX || walletLabel[2] !== 28) {
      throw new Error(`Yang Hong wallet HUD was not anchored to the ${leftSide ? 'left' : 'right'} top corner`);
    }
    if (walletLabels.some(([text, , y]) => text === '¥ 21 / 80' && y === 350 - 99)) {
      throw new Error('Yang Hong wallet HUD still overlaps the character health label');
    }
  }

  // Objection Parry still counters discrete hits, while periodic damage keeps
  // ticking without consuming the parry window or triggering a counterattack.
  const parryGame = new NinjaGame();
  parryGame.selectCharacters('adjudicator', 'stephen');
  parryGame.addVisualEffect = () => {};
  parryGame.addDamageNumber = () => {};
  parryGame.addCombatLog = () => {};
  parryGame.triggerCameraShake = () => {};
  parryGame.spawnCombatFlourish = () => {};
  const adjudicator = parryGame.players.player1;
  const poisoner = parryGame.players.player2;
  parryGame.executeObjectionParry(adjudicator, poisoner, adjudicator.skills.normal, 'player1', 'player1');
  const parryUntil = adjudicator.effects.parryActive;
  const adjudicatorHp = adjudicator.hp;
  const poisonTick = parryGame.dealDamage(adjudicator, 3, 'player2', { isDamageOverTime: true });
  if (!poisonTick.hit || poisonTick.blocked || adjudicator.hp !== adjudicatorHp - 3 || adjudicator.effects.parryActive !== parryUntil || poisoner.hp !== poisoner.maxHp) {
    throw new Error('Periodic damage was incorrectly parried or consumed the objection window');
  }
  adjudicator.effects.poisonStacks = 2;
  adjudicator.effects.poisonDotEnd = simulatedNow + 5000;
  adjudicator.effects.poisonTickTime = simulatedNow;
  parryGame.updateEffects();
  if (adjudicator.hp !== adjudicatorHp - 5 || adjudicator.effects.parryActive !== parryUntil) {
    throw new Error('Poison did not keep ticking during Objection Parry');
  }
  const grill = poisoner.skills.ultimate;
  poisoner.position.x = adjudicator.position.x + 80;
  poisoner.position.y = adjudicator.position.y;
  poisoner.stephenUltimate = {
    form: 'steak', skill: grill, nextTick: simulatedNow,
    endsAt: simulatedNow + grill.duration, facing: 1
  };
  parryGame.updateStephenSystems();
  if (adjudicator.hp !== adjudicatorHp - 5 - grill.damagePerTick || adjudicator.effects.parryActive !== parryUntil) {
    throw new Error('A live damage-zone tick was stopped by Objection Parry');
  }
  const directHit = parryGame.dealDamage(adjudicator, 3, 'player2');
  if (!directHit.blocked || adjudicator.hp !== adjudicatorHp - 5 - grill.damagePerTick || poisoner.hp !== poisoner.maxHp - adjudicator.skills.normal.counterDamage) {
    throw new Error('Objection Parry no longer counters a discrete incoming hit');
  }

  const duel = new NinjaGame();
  duel.selectCharacters('stephen', 'katon');
  duel.spawnCombatFlourish = () => {};
  duel.addVisualEffect = () => {};
  duel.addDamageNumber = () => {};
  duel.ctx = renderContext;
  const stephen = duel.players.player1;
  const foe = duel.players.player2;
  stephen.position.x = 400;
  foe.position.x = 700;
  duel.useSkill('player1', 'ultimate');
  duel.renderStephenZones();
  stephen.position.x = 650;
  duel.updateStephenSystems();
  if (foe.hp !== 90) throw new Error('Stephen grill did not follow its owner or deal its first tick');
  simulatedNow += 5000;
  duel.updateStephenSystems();
  if (stephen.stephenForm !== 'smoke' || duel.cooldowns.player1.normal !== 0) throw new Error('Stephen did not switch to smoke with a ready skill');
  duel.useSkill('player1', 'normal');
  duel.renderStephenZones();
  if (stephen.stephenSmokeUntil <= simulatedNow || duel.dealDamage(stephen, 5, 'player2').immune !== true) throw new Error('Stephen smoke did not prevent damage');
  stephen.effects.stunned = simulatedNow + 500;
  duel.updateStephenSystems();
  if (stephen.stephenSmokeUntil !== 0) throw new Error('Control did not cancel Stephen smoke');
  stephen.effects.stunned = 0;
  simulatedNow += 18000;
  foe.position.x = 750;
  foe.facing = -1;
  duel.useSkill('player1', 'ultimate');
  duel.renderStephenZones();
  duel.updateStephenSystems();
  const facingDamage = foe.hp;
  if (facingDamage !== 80) throw new Error('Stephen breath did not damage a facing enemy');
  foe.facing = 1;
  simulatedNow += 1000;
  duel.updateStephenSystems();
  if (foe.hp !== facingDamage) throw new Error('Stephen breath damaged an enemy facing away');
  simulatedNow += 2000;
  duel.updateStephenSystems();
  if (stephen.stephenForm !== 'steak') throw new Error('Stephen did not return to steak form');
  stephen.hp = 100;
  duel.useSkill('player1', 'normal');
  duel.renderStephenCombatCues();
  simulatedNow += 100;
  duel.releaseStephenCharge('player1');
  simulatedNow += 1000;
  duel.updateStephenSystems();
  if (stephen.hp !== 107) throw new Error('Stephen quick-tap steak did not heal');
  simulatedNow += 8000;
  foe.position.x = stephen.position.x + 100;
  duel.useSkill('player1', 'normal');
  duel.renderStephenCombatCues();
  simulatedNow += 4000;
  duel.releaseStephenCharge('player1');
  duel.renderStephenCombatCues();
  if (foe.hp !== facingDamage || duel.gameState.projectiles.filter(projectile => projectile.type === 'stephenSteak').length !== 1) {
    throw new Error('Stephen charged steak did not launch a projectile before dealing damage');
  }
  for (let frame = 0; frame < 30 && duel.gameState.projectiles.length; frame++) duel.updateProjectiles();
  if (foe.hp !== facingDamage - 15 || foe.effects.slowMultiplier > 0.02) throw new Error('Stephen flying steak did not apply full damage and slow on impact');

  // Exercise Yang Hong's complete ultimate lifecycle against live target states.
  const startYangCapture = (targetId, configure = () => {}) => {
    const game = new NinjaGame();
    game.selectCharacters('yanghong', targetId);
    game.addVisualEffect = () => {};
    game.addDamageNumber = () => {};
    game.addCombatLog = () => {};
    const attacker = game.players.player1;
    const target = game.players.player2;
    attacker.position.x = 350;
    attacker.position.y = 400;
    attacker.facing = 1;
    attacker.yangWallet = 40;
    target.position.x = 470;
    target.position.y = 400;
    configure(game, attacker, target);
    game.useSkill('player1', 'ultimate');
    if (attacker.yangUltimate?.phase !== 'windup') throw new Error(`Yang Hong ultimate did not enter wind-up against ${targetId}`);
    simulatedNow += attacker.skills.ultimate.windup;
    game.updateYangHongSystems();
    return { game, attacker, target };
  };

  const interruptChecks = [
    ['forgefire', (game, _attacker, target) => {
      target.flameGodBladeTimer = 77;
      target.effects.casting = simulatedNow + 700;
      game.gameState.hazards.push({ type: 'fire_trail', ownerSide: 'player2' }, { type: 'fire_trail', ownerSide: 'player1' });
    }, (game, _attacker, target) => {
      if (target.flameGodBladeTimer !== null || target.effects.casting !== 0) throw new Error('Swallow did not cancel Flame God Blade charge');
      if (game.gameState.hazards.length !== 1 || game.gameState.hazards[0].ownerSide !== 'player1') throw new Error('Swallow did not remove only the swallowed Forgefire trail');
    }],
    ['ronin', (_game, _attacker, target) => {
      target.iaiFlashTimer = 78;
      target.effects.casting = simulatedNow + 500;
    }, (_game, _attacker, target) => {
      if (target.iaiFlashTimer !== null || target.effects.casting !== 0) throw new Error('Swallow did not cancel Iai Flash charge');
    }],
    ['rei', (game, _attacker, target) => {
      target.spiritChargeStart = simulatedNow - 300;
      target.spiritChargeTimer = 79;
      target.effects.casting = simulatedNow + 900;
      game.gameState.effects.push({ casterKey: 'player2', type: 'judgment_indicator' });
    }, (game, _attacker, target) => {
      if (target.spiritChargeStart !== null || target.spiritChargeTimer !== null || target.effects.casting !== 0) throw new Error('Swallow did not cancel Spirit Judgment charge');
      if (game.gameState.effects.some(effect => effect.casterKey === 'player2' && effect.type === 'judgment_indicator')) throw new Error('Swallow left the Spirit Judgment indicator active');
    }],
    ['shamisen', (game, _attacker, target) => {
      game.gameState.shamisenCanon ||= { player1: {}, player2: {} };
      game.gameState.shamisenCanon.player2 = { active: true, endsAt: simulatedNow + 3000 };
      target.effects.casting = simulatedNow + 3000;
    }, (game, _attacker, target) => {
      if (game.gameState.shamisenCanon.player2.active || target.effects.casting !== 0) throw new Error('Swallow did not stop Deadly Canon');
    }],
    ['stephen', (_game, _attacker, target) => {
      target.stephenForm = 'smoke';
      target.stephenUltimate = { form: 'smoke', endsAt: simulatedNow + 3000 };
      target.effects.casting = simulatedNow + 3000;
    }, (_game, _attacker, target) => {
      if (target.stephenUltimate !== null || target.effects.casting !== 0) throw new Error('Swallow did not stop Stephen smoke ultimate');
    }],
    ['warlock', (_game, _attacker, target) => {
      target.effects.bloodCurseTether = { target: target, endsAt: simulatedNow + 3000 };
    }, (_game, _attacker, target) => {
      if (target.effects.bloodCurseTether !== null) throw new Error('Swallow did not break the Blood Devour tether when its owner was captured');
    }],
    ['adjudicator', (game, attacker, target) => {
      game.gameState.adjudicatorDomain = { ownerId: 'player2', x: 470, radius: 250 };
      target.effects.verdictSlowApplied = true;
      attacker.effects.verdictSlowApplied = true;
    }, (game, attacker, target) => {
      if (game.gameState.adjudicatorDomain !== null || target.effects.verdictSlowApplied || attacker.effects.verdictSlowApplied) throw new Error('Swallow did not remove the captured Adjudicator domain');
    }],
    ['gladiator', (game, _attacker, _target) => {
      game.gameState.gladiatorArena = { ownerId: 'player1', targetId: 'player2', x: 470, y: 400, radius: 100, expiresAt: simulatedNow + 4000 };
    }, (game) => {
      if (game.gameState.gladiatorArena !== null) throw new Error('Swallow did not break the Gladiator cage and its center-bound chains');
    }],
    ['kage', game => {
      game.gameState.shadowClones.player2 = [{ hp: 5 }];
      game.gameState.shadowMimic.player2 = { x: 300, y: 200 };
    }, game => {
      if (game.gameState.shadowClones.player2.length || game.gameState.shadowMimic.player2 !== null) throw new Error('Swallow did not clear Shadow clones and mimic');
    }]
  ];
  for (const [targetId, configure, verify] of interruptChecks) {
    const result = startYangCapture(targetId, configure);
    if (result.attacker.yangUltimate?.phase !== 'swallow' || result.target.yangSwallowedBy !== 'player1') {
      throw new Error(`Yang Hong did not swallow eligible ${targetId}`);
    }
    verify(result.game, result.attacker, result.target);
  }

  // Capturing the gladiator who owns an active cage also cancels that persistent field.
  {
    const { game, target } = startYangCapture('gladiator', (duel, _attacker, gladiator) => {
      duel.gameState.gladiatorArena = { ownerId: 'player2', targetId: 'player1', x: 350, y: 400, radius: 100, expiresAt: simulatedNow + 4000 };
      gladiator.position.x = 470;
    });
    if (target.yangSwallowedBy !== 'player1' || game.gameState.gladiatorArena !== null) {
      throw new Error('Swallowing the Gladiator did not cancel its active arena and chain restraint');
    }
  }

  // Tethers are cleared both when the captured fighter owns the tether and when
  // the captured fighter is the tether's victim.
  {
    const { attacker, target } = startYangCapture('katon', (game, _yang, foe) => {
      foe.effects.bloodCurseTether = null;
      game.players.player1.effects.bloodCurseTether = { target: foe, endsAt: simulatedNow + 3000 };
    });
    if (attacker.effects.bloodCurseTether !== null || target.yangSwallowedBy !== 'player1') throw new Error('Swallow did not break a Blood Devour tether targeting the captured fighter');
  }

  // Special invulnerable/execution states and insufficient funds must fail
  // cleanly without spending coins or applying a grab.
  {
    const { attacker, target } = startYangCapture('azure_disciple', (_game, _yang, foe) => {
      foe.effects.invulnerable = simulatedNow + 5000;
    });
    if (attacker.yangUltimate !== null || target.yangSwallowedBy || attacker.yangWallet !== 40) throw new Error('Yang Hong captured an invulnerable target or spent wallet funds on a rejected grab');
  }
  {
    const game = new NinjaGame();
    game.selectCharacters('yanghong', 'katon');
    game.addCombatLog = () => {};
    const attacker = game.players.player1;
    attacker.yangWallet = 19;
    game.useSkill('player1', 'ultimate');
    if (attacker.yangUltimate || game.cooldowns.player1.ultimate !== 0) throw new Error('Yang Hong started the ultimate without the minimum 20 coins');
  }
  {
    const { attacker, target } = startYangCapture('katon', (_game, _yang, foe) => { foe.position.x = 900; });
    if (attacker.yangUltimate?.phase !== 'swallow' || target.yangSwallowedBy !== 'player1') throw new Error('Tongue did not retain the target captured at cast time');
  }
  {
    const { attacker, target } = startYangCapture('exileblade', (_game, _yang, foe) => { foe.isExecuting = true; });
    if (attacker.yangUltimate !== null || target.yangSwallowedBy) throw new Error('Yang Hong captured a target during the Exile Blade execution phase');
  }

  // The listed exception permits capture only while Exile Blade's kunai is in
  // flight; capture then removes the projectile before its hit callback can land.
  {
    const { game, attacker, target } = startYangCapture('exileblade', (duel, _yang, foe) => {
      foe.effects.invulnerable = simulatedNow + 3000;
      duel.gameState.projectiles.push({ type: 'shadowKunai', owner: foe });
    });
    if (attacker.yangUltimate?.phase !== 'swallow' || game.gameState.projectiles.some(projectile => projectile.type === 'shadowKunai' && projectile.owner === target)) {
      throw new Error('In-flight Exile Blade kunai did not allow and safely cancel the capture');
    }
  }

  // Complete the regular catch -> per-second cost/damage -> spit lifecycle and
  // verify the legacy Coffee cooldown-reset behavior survives the interruption work.
  {
    const { game, attacker, target } = startYangCapture('katon');
    game.cooldowns.player1.normal = simulatedNow + 5000;
    const hpBefore = target.hp;
    simulatedNow += 1000;
    game.updateYangHongSystems();
    if (attacker.yangWallet !== 20 || target.hp !== hpBefore - 7 || target.yangSwallowedBy !== 'player1') throw new Error('Yang Hong swallow tick did not charge 20 coins and deal 7 damage');
    simulatedNow += 1000;
    game.updateYangHongSystems();
    if (attacker.yangUltimate !== null || target.yangSwallowedBy || game.cooldowns.player1.normal !== 0) throw new Error('Yang Hong did not spit the target out and reset Coffee Art cooldown');
    if (target.effects.slowMultiplier !== 0.4 || target.effects.slowed !== simulatedNow + 2000) throw new Error('Yang Hong spit did not apply the two-second 60% slow');
  }

  // P2 must be able to perform the same full interaction while facing left.
  {
    const game = new NinjaGame();
    game.selectCharacters('katon', 'yanghong');
    game.addVisualEffect = () => {};
    game.addDamageNumber = () => {};
    game.addCombatLog = () => {};
    const target = game.players.player1;
    const attacker = game.players.player2;
    target.position.x = 350;
    target.position.y = 400;
    attacker.position.x = 470;
    attacker.position.y = 400;
    attacker.facing = -1;
    attacker.yangWallet = 40;
    game.useSkill('player2', 'ultimate');
    simulatedNow += attacker.skills.ultimate.windup;
    game.updateYangHongSystems();
    if (attacker.yangUltimate?.phase !== 'swallow' || target.yangSwallowedBy !== 'player2') throw new Error('P2 could not capture a target while facing left');
    simulatedNow += 2000;
    game.updateYangHongSystems();
    if (attacker.yangUltimate !== null || target.yangSwallowedBy || game.cooldowns.player2.normal !== 0) throw new Error('P2 swallow did not finish and reset the normal skill');
  }

  // Existing multi-hit Coffee Art remains usable and resolves its full stream.
  {
    const emittedYangHongEffects = [];
    engineContext.particleSystem = { createSkillEffect: (...args) => emittedYangHongEffects.push(args) };
    const game = new NinjaGame();
    game.selectCharacters('yanghong', 'katon');
    game.addVisualEffect = () => {};
    game.addDamageNumber = () => {};
    game.addCombatLog = () => {};
    const attacker = game.players.player1;
    const target = game.players.player2;
    attacker.position.x = 350;
    attacker.position.y = 400;
    attacker.facing = 1;
    target.position.x = 420;
    target.position.y = 400;
    const hpBefore = target.hp;
    const originalRandom = engineContext.Math.random;
    engineContext.Math.random = () => 0.5;
    game.useSkill('player1', 'normal');
    for (let hit = 1; hit <= attacker.skills.normal.maxHits; hit++) {
      simulatedNow += attacker.skills.normal.tickRate;
      game.updateYangHongSystems();
    }
    if (attacker.yangCoffee || target.hp !== hpBefore - attacker.skills.normal.maxHits * attacker.skills.normal.tickDamage) {
      throw new Error('Coffee Art multi-hit stream did not complete at its configured hit cap');
    }
    engineContext.Math.random = originalRandom;
    if (attacker.yangCoinDamageCount !== 1 || game.gameState.yangHongCoins.length !== 21) throw new Error(`Coffee Art damage ticks did not count individually: counter=${attacker.yangCoinDamageCount}, wallet=${attacker.yangWallet}, coins=${game.gameState.yangHongCoins.length}`);
    if (!emittedYangHongEffects.some(([code]) => code === 'YH_001')) throw new Error('Coffee Art did not dispatch its authored particles in a real skill activation');
    attacker.yangWallet = 40;
    game.useSkill('player1', 'ultimate');
    if (!emittedYangHongEffects.some(([code]) => code === 'YH_002')) throw new Error('Tongue ultimate did not dispatch its authored particles in a real skill activation');
  }

  // The passive is deterministic: no drop for the first two successful hits,
  // exactly seven coins on the third, and only the owning Yang Hong can collect.
  {
    const game = new NinjaGame();
    game.selectCharacters('yanghong', 'katon');
    game.addVisualEffect = () => {};
    game.addDamageNumber = () => {};
    game.addCombatLog = () => {};
    const attacker = game.players.player1;
    const target = game.players.player2;
    attacker.position.x = 100;
    attacker.position.y = 100;
    target.position.x = 500;
    target.position.y = 400;
    game.dropYangCoin(attacker, target);
    game.dropYangCoin(attacker, target);
    if (game.gameState.yangHongCoins.length !== 0 || attacker.yangCoinDamageCount !== 2) throw new Error('Yang Hong dropped coins before the third damage instance');
    game.dropYangCoin(attacker, target);
    if (game.gameState.yangHongCoins.length !== 7 || game.gameState.yangHongCoins.some(coin => coin.value !== 1) || attacker.yangCoinDamageCount !== 0) {
      throw new Error('Yang Hong did not drop exactly seven coins on each third damage instance');
    }
    const coin = game.gameState.yangHongCoins[0];
    for (const dropped of game.gameState.yangHongCoins) { dropped.x = target.position.x; dropped.y = target.position.y; }
    game.updateYangHongSystems();
    if (attacker.yangWallet !== 0 || game.gameState.yangHongCoins.length !== 7) throw new Error('Opponent collected a coin that belongs to Yang Hong');
    attacker.position.x = coin.x;
    attacker.position.y = coin.y;
    game.updateYangHongSystems();
    if (attacker.yangWallet !== 7 || game.gameState.yangHongCoins.length !== 0) throw new Error('Yang Hong did not collect the seven-coin drop into his wallet');
    game.dropYangCoin(attacker, target);
    game.dropYangCoin(attacker, target);
    if (game.gameState.yangHongCoins.length !== 0) throw new Error('Yang Hong passive counter did not restart after a drop');
    game.dropYangCoin(attacker, target);
    if (game.gameState.yangHongCoins.length !== 7 || game.gameState.yangHongCoins.some(dropped => dropped.value !== 1)) throw new Error('Yang Hong did not generate the next deterministic drop');

    const talented = new NinjaGame();
    talented.selectCharacters('yanghong', 'katon', { player1: { primary: 'yanghong_tip_bonus' } });
    const talentedAttacker = talented.players.player1;
    const talentedTarget = talented.players.player2;
    if (talentedAttacker.passive.hitsPerDrop !== 2) throw new Error('Yang Hong Quick Change talent no longer adjusts the deterministic drop interval');
    talented.dropYangCoin(talentedAttacker, talentedTarget);
    talented.dropYangCoin(talentedAttacker, talentedTarget);
    if (talented.gameState.yangHongCoins.length !== 7 || talented.gameState.yangHongCoins.some(dropped => dropped.value !== 1)) throw new Error('Yang Hong talent altered the fixed seven-coin drop value');
  }
} catch (error) {
  console.error(`Skill integration check failed: ${error.message}`);
  failed = true;
}

if (failed) process.exit(1);
console.log(`Checked ${localAssets.length} local page assets and JavaScript syntax successfully.`);
