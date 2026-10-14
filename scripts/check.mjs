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
    ['ranger', 'skills.normal.cooldown', 10000],
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
    ['forgefire', 'skills.ultimate.trailDuration', 3000]
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
  for (const elementalId of ['fujin', 'katon', 'suijin', 'raijin', 'doton', 'kage', 'rei', 'dokusei', 'taijutsu', 'ranger', 'warlock', 'ronin', 'beastmaster', 'scorpion', 'adjudicator', 'exileblade', 'forgefire', 'puppeteer', 'azure_disciple', 'shamisen']) {
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

  const engineContext = vm.createContext({ console, setTimeout: () => 0, clearTimeout: () => {} });
  vm.runInContext(readFileSync(resolve(root, 'characters.js'), 'utf8'), engineContext);
  vm.runInContext(engineSource, engineContext);
  const NinjaGame = vm.runInContext('NinjaGame', engineContext);
  const animatorContext = vm.createContext({ document: { addEventListener() {} }, console });
  vm.runInContext(readFileSync(resolve(root, 'stickmanAnimator.js'), 'utf8'), animatorContext);
  const stephenAnimator = vm.runInContext('new StickmanAnimator()', animatorContext);
  for (const name of ['stephenCharge', 'stephenThrow', 'stephenEat', 'stephenGrill', 'stephenBreath']) {
    if (stephenAnimator.animations[name]?.length !== 12) throw new Error(`Stephen animation is missing: ${name}`);
  }
  for (const elementalId of ['fujin', 'katon', 'suijin', 'raijin', 'doton', 'kage', 'rei', 'dokusei', 'taijutsu', 'ranger', 'warlock', 'ronin', 'beastmaster', 'scorpion', 'adjudicator', 'exileblade', 'forgefire', 'puppeteer', 'azure_disciple', 'shamisen']) {
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

  // Tethers are cleared both when the captured fighter owns the tether and when
  // the captured fighter is the tether's victim.
  {
    const { attacker, target } = startYangCapture('katon', (game, _yang, foe) => {
      foe.effects.bloodCurseTether = null;
      game.players.player1.effects.bloodCurseTether = { target: foe, endsAt: simulatedNow + 3000 };
    });
    if (attacker.effects.bloodCurseTether !== null || target.yangSwallowedBy !== 'player1') throw new Error('Swallow did not break a Blood Devour tether targeting the captured fighter');
  }

  // Special invulnerable/execution states, insufficient funds, and a wind-up
  // that loses range must fail cleanly without spending coins or applying a grab.
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
    if (attacker.yangUltimate !== null || target.yangSwallowedBy || attacker.yangWallet !== 40) throw new Error('Out-of-range wind-up did not resolve as a clean miss');
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
    if (target.effects.stunned <= simulatedNow) throw new Error('Yang Hong spit did not apply its brief landing stun');
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
    attacker.yangWallet = 40;
    target.position.x = 420;
    target.position.y = 400;
    const hpBefore = target.hp;
    game.useSkill('player1', 'normal');
    for (let hit = 1; hit <= attacker.skills.normal.maxHits; hit++) {
      simulatedNow += attacker.skills.normal.tickRate;
      game.updateYangHongSystems();
    }
    if (attacker.yangCoffee || target.hp !== hpBefore - attacker.skills.normal.maxHits * attacker.skills.normal.tickDamage) {
      throw new Error('Coffee Art multi-hit stream did not complete at its configured hit cap');
    }
    if (!emittedYangHongEffects.some(([code]) => code === 'YH_001')) throw new Error('Coffee Art did not dispatch its authored particles in a real skill activation');
    game.useSkill('player1', 'ultimate');
    if (!emittedYangHongEffects.some(([code]) => code === 'YH_002')) throw new Error('Tongue ultimate did not dispatch its authored particles in a real skill activation');
  }
} catch (error) {
  console.error(`Skill integration check failed: ${error.message}`);
  failed = true;
}

if (failed) process.exit(1);
console.log(`Checked ${localAssets.length} local page assets and JavaScript syntax successfully.`);
