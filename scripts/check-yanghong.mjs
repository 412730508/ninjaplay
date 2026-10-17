import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
let now = 100000;
let timerId = 0;
const intervals = new Map();
const context = vm.createContext({
  console,
  Math: Object.assign(Object.create(Math), { random: () => 0 }),
  Date: class extends Date { static now() { return now; } },
  setTimeout: () => ++timerId,
  clearTimeout: () => {},
  setInterval: callback => { const id = ++timerId; intervals.set(id, callback); return id; },
  clearInterval: id => intervals.delete(id)
});
for (const file of ['characters.js', 'balance.js', 'talents.js', 'gameEngine.js']) {
  vm.runInContext(readFileSync(resolve(root, file), 'utf8'), context, { filename: file });
}
const NinjaGame = vm.runInContext('NinjaGame', context);
const advance = (game, milliseconds) => { now += milliseconds; game.updateYangHongSystems(); };
function duel(targetId = 'katon', distance = 100) {
  const game = new NinjaGame();
  game.selectCharacters('yanghong', targetId);
  for (const method of ['addVisualEffect', 'addDamageNumber', 'addCombatLog', 'spawnCombatFlourish', 'triggerCameraShake']) game[method] = () => {};
  const yang = game.players.player1;
  const target = game.players.player2;
  yang.position = { x: 350, y: 400 };
  yang.facing = 1;
  target.position = { x: 350 + distance, y: 400 };
  return { game, yang, target };
}

// Ten scheduled 200 ms hits; each group of three successful hits drops seven
// independent one-yuan coins. Late frames cannot create extra hits.
{
  const { game, yang, target } = duel();
  assert.equal(yang.skills.normal.tickRate, 200);
  assert.equal(yang.skills.normal.tickDamage, 2);
  assert.equal(yang.skills.normal.maxDuration, 2000);
  assert.equal(yang.skills.normal.maxHits, 10);
  const hp = target.hp;
  game.useSkill('player1', 'normal');
  advance(game, 1000);
  assert.equal(target.hp, hp - 10);
  advance(game, 1000);
  assert.equal(target.hp, hp - 20);
  assert.equal(yang.yangCoffee, null);
  assert.equal(yang.yangCoinDamageCount, 1);
  assert.equal(game.gameState.yangHongCoins.length, 21);
  assert.ok(game.gameState.yangHongCoins.every(coin => coin.value === 1 && coin.ownerSide === 'player1'));
  advance(game, 5000);
  assert.equal(target.hp, hp - 20);
}
{
  const { game, yang, target } = duel();
  game.useSkill('player1', 'normal');
  advance(game, 600);
  const hp = target.hp;
  game.releaseYangCoffee('player1');
  assert.equal(yang.yangCoffee, null);
  advance(game, 1600);
  assert.equal(target.hp, hp);
}
{
  const { game, yang, target } = duel();
  game.useSkill('player1', 'normal');
  advance(game, 400);
  const hp = target.hp;
  yang.effects.stunned = now + 500;
  advance(game, 100);
  assert.equal(yang.yangCoffee, null);
  advance(game, 2000);
  assert.equal(target.hp, hp);
}
{
  const { game, yang, target } = duel();
  yang.yangWallet = 79;
  for (let i = 0; i < 3; i++) game.dealDamage(target, 1, 'player1');
  assert.equal(game.gameState.yangHongCoins.length, 7);
  for (const coin of game.gameState.yangHongCoins) { coin.x = yang.position.x; coin.y = yang.position.y; }
  game.updateYangHongSystems();
  assert.equal(yang.yangWallet, 80);
  assert.equal(game.gameState.yangHongCoins.length, 0);
}
{
  const { game, yang, target } = duel();
  for (let i = 0; i < 3; i++) game.dealDamage(target, 1, 'player1');
  assert.equal(game.gameState.yangHongCoins.length, 7);
  for (const coin of game.gameState.yangHongCoins) { coin.x = target.position.x; coin.y = target.position.y; }
  game.updateYangHongSystems();
  assert.equal(yang.yangWallet, 0);
  assert.equal(game.gameState.yangHongCoins.length, 7);
  yang.position.x = target.position.x;
  game.updateYangHongSystems();
  assert.equal(yang.yangWallet, 7);
}
{
  const { game, yang, target } = duel('katon', 200);
  yang.yangWallet = 40;
  game.useSkill('player1', 'ultimate');
  assert.equal(yang.yangUltimate.phase, 'windup');
  assert.equal(yang.yangUltimate.target, target);
  const tongueRings = [];
  game.ctx = new Proxy({}, {
    get: (_object, property) => property === 'ellipse'
      ? (...args) => tongueRings.push(args)
      : () => {},
    set: () => true
  });
  game.renderYangHongSystems();
  assert.ok(tongueRings.some(([x, , radius]) => x > 0 && radius > 0));
  advance(game, 299);
  assert.equal(yang.yangUltimate.phase, 'windup');
  advance(game, 1);
  assert.equal(yang.yangUltimate.phase, 'swallow');
  const hp = target.hp;
  advance(game, 1500);
  assert.equal(yang.yangWallet, 20);
  assert.equal(target.hp, hp - 7);
  assert.equal(target.yangSwallowedBy, 'player1');
  advance(game, 500);
  assert.equal(yang.yangWallet, 0);
  assert.equal(target.hp, hp - 14);
  assert.equal(yang.yangUltimate, null);
  assert.equal(target.yangSwallowedBy, null);
  assert.equal(target.position.x, 750);
  assert.equal(target.effects.slowMultiplier, 0.4);
  assert.equal(target.effects.slowed, now + 2000);
  assert.equal(yang.effects.yangHongShield, 10);
  assert.equal(yang.effects.yangHongShieldUntil, now + 3000);
  assert.equal(game.cooldowns.player1.normal, 0);
  yang.hp = yang.maxHp - 20;
  game.dealDamage(yang, 4, 'player2');
  assert.equal(yang.effects.yangHongShield, 6);
  assert.equal(yang.hp, yang.maxHp - 20);
  now += 3000;
  game.updateEffects();
  game.updateYangHongSystems();
  assert.equal(yang.effects.yangHongShield, 0);
  assert.equal(yang.hp, yang.maxHp - 14);
  advance(game, 3000);
  assert.equal(yang.hp, yang.maxHp - 14);
  game.useSkill('player1', 'normal');
  assert.ok(yang.yangCoffee);
  game.releaseYangCoffee('player1');
  yang.yangWallet = 40;
  target.position.x = yang.position.x + 100;
  target.position.y = yang.position.y;
  advance(game, 10000);
  game.useSkill('player1', 'ultimate');
  assert.equal(yang.yangUltimate?.phase, 'windup');
  advance(game, 300);
  assert.equal(yang.yangUltimate?.phase, 'swallow');
  advance(game, 2000);
  assert.equal(yang.yangUltimate, null);
  assert.equal(target.yangSwallowedBy, null);
  assert.equal(yang.yangCoffee, null);
  assert.equal(yang.effects.yangHongShield, 10);
}
{
  const { game, yang } = duel('katon', 201);
  yang.yangWallet = 40;
  game.useSkill('player1', 'ultimate');
  advance(game, 300);
  assert.equal(yang.yangUltimate, null);
  assert.equal(yang.yangWallet, 40);
}
{
  const { game, yang } = duel();
  yang.hp = yang.maxHp - 4;
  yang.effects.yangHongShield = 10;
  yang.effects.yangHongShieldUntil = now + 3000;
  now += 3000;
  game.updateEffects();
  game.updateYangHongSystems();
  assert.equal(yang.hp, yang.maxHp);
  assert.equal(yang.effects.yangHongShield, 0);
}
{
  const { game, yang, target } = duel('stephen');
  yang.yangWallet = 40;
  target.stephenChargeStart = now - 100;
  target.stephenSmokeUntil = now + 2000;
  target.stephenSmokeNextTick = now + 200;
  target.stephenUltimate = { form: 'smoke', endsAt: now + 2000 };
  target.effects.casting = now + 2000;
  game.useSkill('player1', 'ultimate');
  assert.equal(target.stephenChargeStart, 0);
  assert.equal(target.stephenSmokeUntil, 0);
  assert.equal(target.stephenUltimate, null);
  assert.equal(target.effects.casting, 0);
  assert.equal(game.skillPressed.player2.normal, true);
  const hp = yang.hp;
  advance(game, 300);
  game.updateStephenSystems();
  assert.equal(yang.hp, hp);
  advance(game, 2000);
  assert.equal(target.yangSwallowedBy, null);
  assert.equal(game.skillPressed.player2.normal, true);
}
{
  const { game, yang, target } = duel('raijin');
  yang.yangWallet = 40;
  const fakeTimer = context.setInterval(() => {}, 300);
  target.thunderPunchInterval = fakeTimer;
  game.useSkill('player1', 'ultimate');
  assert.equal(target.thunderPunchInterval, null);
  assert.equal(intervals.has(fakeTimer), false);
  advance(game, 300);
  const hp = yang.hp;
  assert.equal(game.dealDamage(yang, 3, 'player2').immune, true);
  assert.equal(yang.hp, hp);
}
{
  const game = new NinjaGame();
  game.selectCharacters('yanghong', 'yanghong');
  for (const method of ['addVisualEffect', 'addDamageNumber', 'addCombatLog', 'spawnCombatFlourish']) game[method] = () => {};
  const caster = game.players.player1;
  const victim = game.players.player2;
  caster.position = { x: 350, y: 400 };
  victim.position = { x: 450, y: 400 };
  caster.facing = 1;
  victim.facing = -1;
  caster.yangWallet = 40;
  game.useSkill('player2', 'normal');
  assert.ok(victim.yangCoffee);
  game.useSkill('player1', 'ultimate');
  assert.equal(victim.yangCoffee, null);
  now += 300;
  game.updateYangHongSystems();
  const hp = caster.hp;
  now += 2000;
  game.updateYangHongSystems();
  assert.equal(caster.hp, hp);
  assert.equal(victim.yangSwallowedBy, null);
  assert.equal(victim.yangCoffee, null);
}
{
  const { game, yang, target } = duel('forgefire');
  yang.yangWallet = 40;
  target.flameGodBladeTimer = context.setTimeout(() => {}, 700);
  target.effects.casting = now + 700;
  game.gameState.hazards.push({ type: 'fire_trail', ownerSide: 'player2' });
  game.useSkill('player1', 'ultimate');
  assert.equal(target.flameGodBladeTimer, null);
  assert.equal(target.effects.casting, 0);
  assert.equal(game.gameState.hazards.length, 0);
}
{
  const { game, yang, target } = duel('shamisen');
  yang.yangWallet = 40;
  game.gameState.shamisenCanon ||= { player1: {}, player2: {} };
  game.gameState.shamisenCanon.player2 = { active: true, endsAt: now + 3000 };
  game.useSkill('player1', 'ultimate');
  assert.equal(game.gameState.shamisenCanon.player2.active, false);
  assert.equal(target.effects.casting, 0);
}
for (const [id, prepare, verify] of [
  ['ronin', (game, target) => {
    target.iaiFlashTimer = context.setTimeout(() => {}, 700);
    target.effects.casting = now + 700;
  }, (_game, target) => {
    assert.equal(target.iaiFlashTimer, null);
    assert.equal(target.effects.casting, 0);
  }],
  ['rei', (game, target) => {
    target.spiritChargeStart = now - 100;
    target.spiritChargeTimer = context.setTimeout(() => {}, 700);
    game.gameState.effects.push({ casterKey: 'player2', type: 'judgment_indicator' });
  }, (game, target) => {
    assert.equal(target.spiritChargeStart, null);
    assert.equal(target.spiritChargeTimer, null);
    assert.ok(!game.gameState.effects.some(effect => effect.casterKey === 'player2' && effect.type === 'judgment_indicator'));
  }],
  ['warlock', (game, target) => {
    target.effects.bloodCurseTether = { target: game.players.player1, endsAt: now + 2000 };
  }, (_game, target) => assert.equal(target.effects.bloodCurseTether, null)],
  ['adjudicator', (game, target) => {
    game.gameState.adjudicatorDomain = { ownerId: 'player2', x: target.position.x, radius: 250 };
    target.effects.verdictSlowApplied = true;
  }, (game, target) => {
    assert.equal(game.gameState.adjudicatorDomain, null);
    assert.equal(target.effects.verdictSlowApplied, false);
  }],
  ['gladiator', (game, target) => {
    game.gameState.gladiatorArena = { ownerId: 'player2', targetId: 'player1', x: target.position.x, y: target.position.y, radius: 100, expiresAt: now + 4000 };
  }, game => assert.equal(game.gameState.gladiatorArena, null)],
  ['kage', (game, target) => {
    game.gameState.shadowClones.player2 = [{ hp: 5 }];
    game.gameState.shadowMimic.player2 = { x: target.position.x, y: target.position.y };
  }, game => {
    assert.equal(game.gameState.shadowClones.player2.length, 0);
    assert.equal(game.gameState.shadowMimic.player2, null);
  }],
  ['exileblade', (game, target) => {
    target.effects.invulnerable = now + 2000;
    game.gameState.projectiles.push({ type: 'shadowKunai', owner: target });
  }, (game, target) => assert.ok(!game.gameState.projectiles.some(projectile => projectile.type === 'shadowKunai' && projectile.owner === target))]
]) {
  const { game, yang, target } = duel(id);
  yang.yangWallet = 40;
  prepare(game, target);
  game.useSkill('player1', 'ultimate');
  assert.equal(yang.yangUltimate?.target, target, `${id} should be captured`);
  verify(game, target);
  advance(game, 300);
  assert.equal(target.yangSwallowedBy, 'player1');
  advance(game, 2000);
  assert.equal(target.yangSwallowedBy, null);
}

console.log('Yang Hong skill integration checks passed.');
