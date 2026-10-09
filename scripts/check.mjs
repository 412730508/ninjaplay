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
  const stephen = duel.players.player1;
  const foe = duel.players.player2;
  stephen.position.x = 400;
  foe.position.x = 700;
  duel.useSkill('player1', 'ultimate');
  stephen.position.x = 650;
  duel.updateStephenSystems();
  if (foe.hp !== 90) throw new Error('Stephen grill did not follow its owner or deal its first tick');
  simulatedNow += 5000;
  duel.updateStephenSystems();
  if (stephen.stephenForm !== 'smoke' || duel.cooldowns.player1.normal !== 0) throw new Error('Stephen did not switch to smoke with a ready skill');
  duel.useSkill('player1', 'normal');
  if (stephen.stephenSmokeUntil <= simulatedNow || duel.dealDamage(stephen, 5, 'player2').immune !== true) throw new Error('Stephen smoke did not prevent damage');
  stephen.effects.stunned = simulatedNow + 500;
  duel.updateStephenSystems();
  if (stephen.stephenSmokeUntil !== 0) throw new Error('Control did not cancel Stephen smoke');
  stephen.effects.stunned = 0;
  simulatedNow += 18000;
  foe.position.x = 750;
  foe.facing = -1;
  duel.useSkill('player1', 'ultimate');
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
  simulatedNow += 100;
  duel.releaseStephenCharge('player1');
  simulatedNow += 1000;
  duel.updateStephenSystems();
  if (stephen.hp !== 107) throw new Error('Stephen quick-tap steak did not heal');
  simulatedNow += 8000;
  foe.position.x = stephen.position.x + 100;
  duel.useSkill('player1', 'normal');
  simulatedNow += 4000;
  duel.releaseStephenCharge('player1');
  if (foe.hp !== facingDamage - 15 || foe.effects.slowMultiplier > 0.02) throw new Error('Stephen charged steak did not apply full damage and slow');
} catch (error) {
  console.error(`Skill integration check failed: ${error.message}`);
  failed = true;
}

if (failed) process.exit(1);
console.log(`Checked ${localAssets.length} local page assets and JavaScript syntax successfully.`);
