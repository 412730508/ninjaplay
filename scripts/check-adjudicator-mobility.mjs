import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
let now = 100000;
const timeouts = [];
const intervals = [];
const context = vm.createContext({
  console,
  Date: class extends Date { static now() { return now; } },
  setTimeout: callback => { timeouts.push(callback); return timeouts.length; },
  clearTimeout: () => {},
  setInterval: callback => { intervals.push(callback); return intervals.length; },
  clearInterval: () => {}
});
for (const file of ['characters.js', 'gameEngine.js']) {
  vm.runInContext(readFileSync(resolve(root, file), 'utf8'), context);
}
const NinjaGame = vm.runInContext('NinjaGame', context);
const codes = vm.runInContext('SKILL_CODES', context);

function makeGame(id, x = 450) {
  const game = new NinjaGame();
  game.selectCharacters('adjudicator', id);
  for (const method of ['addVisualEffect', 'addDamageNumber', 'addCombatLog', 'triggerCameraShake', 'spawnCombatFlourish']) game[method] = () => {};
  game.players.player1.position = { x: 400, y: 300 };
  game.players.player2.position = { x, y: 300 };
  game.players.player2.facing = -1;
  game.gameState.adjudicatorDomain = { ownerId: 'player1', x: 400, radius: 250, expiresAt: now + 6000 };
  return game;
}

const mobility = [
  ['fujin', 'normal', codes.WIND_DASH],
  ['katon', 'normal', codes.FIRE_RUSH],
  ['forgefire', 'normal', codes.FORGE_FIRE_SPIN],
  ['raijin', 'normal', codes.THUNDER_STEP],
  ['kage', 'normal', codes.SHADOW_STRIKE],
  ['taijutsu', 'normal', codes.SAVAGE_SUPLEX],
  ['ranger', 'ultimate', codes.STEALTH_DASH],
  ['ronin', 'normal', codes.FLASH_CUT],
  ['ronin', 'ultimate', codes.IAI_FLASH],
  ['exileblade', 'normal', codes.EXILE_GALE_DASH],
  ['exileblade', 'ultimate', codes.STORM_EXECUTION],
  ['puppeteer', 'ultimate', codes.PHANTOM_SWAP],
  ['azure_disciple', 'ultimate', codes.GRAND_THUNDER_SLASH],
  ['gladiator', 'ultimate', codes.GLADIATOR_CAESAR]
];
for (const [id, slot, code] of mobility) {
  const game = makeGame(id);
  assert.equal(game.players.player2.skills[slot].code, code);
  const oldCooldown = game.cooldowns.player2[slot];
  const oldX = game.players.player2.position.x;
  assert.equal(game.isSelfDisplacementSkill(game.players.player2.skills[slot]), true, `${id} ${slot} must be classified as mobility`);
  game.useSkill('player2', slot);
  assert.equal(game.players.player2.position.x, oldX, `${id} ${slot} moved within court`);
  assert.equal(game.cooldowns.player2[slot], oldCooldown, `${id} ${slot} consumed cooldown within court`);
}

// Thunder Punch only becomes a mobility skill with its pre-dash talent.
const thunder = makeGame('raijin');
assert.equal(thunder.isSelfDisplacementSkill(thunder.players.player2.skills.ultimate), false);
thunder.players.player2.skills.ultimate.preDash = 50;
assert.equal(thunder.isSelfDisplacementSkill(thunder.players.player2.skills.ultimate), true);
const thunderCooldown = thunder.cooldowns.player2.ultimate;
thunder.useSkill('player2', 'ultimate');
assert.equal(thunder.players.player2.position.x, 450);
assert.equal(thunder.cooldowns.player2.ultimate, thunderCooldown);

// The bound includes the boundary, but expires on time and follows the owner.
const boundary = makeGame('fujin', 650);
assert.equal(boundary.isAdjudicatorMobilityLocked('player2'), true);
boundary.players.player1.position.x = 350;
assert.equal(boundary.isAdjudicatorMobilityLocked('player2'), false);
boundary.players.player1.position.x = 400;
now = boundary.gameState.adjudicatorDomain.expiresAt;
assert.equal(boundary.isAdjudicatorMobilityLocked('player2'), false);
boundary.useSkill('player2', 'normal');
assert.ok(boundary.players.player2.position.x < 650, 'mobility must work after domain expiry');

// A regular attack remains usable, but its automatic dash cannot bypass court.
now += 20000;
const ronin = makeGame('ronin');
ronin.players.player2.effects.roninLastAttackTime = now - 3000;
ronin.attack('player2');
assert.equal(ronin.players.player2.position.x, 450, 'Ronin sheathed attack bypassed court');
const petals = makeGame('fujin');
petals.players.player2.talentFallingPetals = true;
petals.attack('player2');
assert.equal(petals.players.player2.position.x, 450, 'Falling Petals bypassed court');

// A skill started outside may resolve after its caster enters the court.
const iai = makeGame('ronin', 700);
iai.useSkill('player2', 'ultimate');
assert.ok(timeouts.length > 0);
iai.players.player2.position.x = 600;
now += 500;
timeouts.at(-1)();
assert.equal(iai.players.player2.position.x, 600, 'delayed Iai teleport bypassed court');
assert.equal(iai.players.player2.effects.casting, 0);

const exile = makeGame('exileblade', 700);
exile.useSkill('player2', 'ultimate');
assert.ok(exile.gameState.projectiles.some(projectile => projectile.type === 'shadowKunai'));
exile.players.player2.position.x = 600;
const adjudicatorHp = exile.players.player1.hp;
exile.triggerStormExecution(exile.players.player2, exile.players.player1,
  exile.players.player2.skills.ultimate, 'player2', 'player2');
assert.equal(exile.players.player2.position.x, 600, 'kunai execution teleport bypassed court');
assert.equal(exile.players.player2.isExecuting || false, false);
assert.equal(exile.players.player1.hp, adjudicatorHp - 2, 'kunai hit should still deal its non-mobility damage');

const shadowReturn = makeGame('kage');
shadowReturn.gameState.shadowMimic.player2 = { x: 700, y: 300, expiresAt: now + 3000 };
shadowReturn.useSkill('player2', 'normal');
assert.equal(shadowReturn.players.player2.position.x, 450, 'Shadow Strike recast bypassed court');
assert.ok(shadowReturn.gameState.shadowMimic.player2, 'blocked recast must retain the shadow');

const suplex = makeGame('taijutsu', 660);
suplex.players.player2.skills.normal.dashDistance = 210;
suplex.players.player2.skills.normal.landingPursuit = 30;
suplex.useSkill('player2', 'normal');
assert.ok(intervals.length > 0, 'Suplex should start outside the domain');
const suplexX = suplex.players.player2.position.x;
now += 500;
intervals.at(-1)();
assert.equal(suplex.players.player2.position.x, suplexX, 'delayed landing pursuit bypassed court');

console.log(`Adjudicator court blocked ${mobility.length + 1} active mobility variants, two passive dashes, recasts and delayed teleports: OK`);
