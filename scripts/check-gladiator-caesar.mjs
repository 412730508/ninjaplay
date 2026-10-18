import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
let now = 100000;
const context = vm.createContext({
  console,
  Date: class extends Date { static now() { return now; } },
  setTimeout: () => 0,
  clearTimeout: () => {}
});
for (const file of ['characters.js', 'gameEngine.js']) {
  vm.runInContext(readFileSync(resolve(root, file), 'utf8'), context);
}
const NinjaGame = vm.runInContext('NinjaGame', context);
const animatorContext = vm.createContext({ document: { addEventListener() {} }, console });
vm.runInContext(readFileSync(resolve(root, 'stickmanAnimator.js'), 'utf8'), animatorContext);
const animator = vm.runInContext('new StickmanAnimator()', animatorContext);

function makeGame(targetX = 450) {
  const game = new NinjaGame();
  game.selectCharacters('gladiator', 'fujin');
  for (const method of ['addVisualEffect', 'addDamageNumber', 'addCombatLog', 'triggerCameraShake', 'spawnCombatFlourish']) game[method] = () => {};
  const gladiator = game.players.player1;
  const target = game.players.player2;
  gladiator.position = { x: 300, y: 300 };
  gladiator.hp = 60;
  target.position = { x: targetX, y: 300 };
  target.maxHp = 150;
  target.hp = 150;
  return { game, gladiator, target };
}

assert.equal(vm.runInContext('characters.gladiator.skills.ultimate.cooldown', context), 15000);
const { game, gladiator, target } = makeGame();
game.useSkill('player1', 'ultimate');
assert.ok(gladiator.gladiatorLeap);
const leap = gladiator.gladiatorLeap;
let previousX = leap.startX;
for (const [elapsed, phase] of [[0, 'step'], [30, 'step'], [120, 'flip'], [250, 'flip'], [390, 'hover'], [460, 'stomp']]) {
  now = leap.startedAt + elapsed;
  const motion = game.getGladiatorLeapMotion(leap, now);
  assert.equal(motion.phase, phase);
  game.updateGladiatorSystems();
  assert.ok(gladiator.position.x >= previousX, 'forward motion must not jump backward');
  assert.ok(gladiator.position.y <= 300, 'fighter must remain above the ground before impact');
  previousX = gladiator.position.x;
  const frame = animator.getGladiatorCaesarFrame(motion.phase, motion.phaseProgress);
  assert.ok(frame.head && frame.leftLeg && frame.rightLeg);
}
assert.ok(animator.getGladiatorCaesarFrame('hover').rightLeg.upperRotation < -50, 'hover must show a raised leg');
assert.ok(animator.getGladiatorCaesarFrame('stomp').leftLeg.upperRotation === 0, 'stomp leg must point downward');
const canvas = new Proxy({
  createLinearGradient: () => ({ addColorStop() {} }),
  createRadialGradient: () => ({ addColorStop() {} })
}, { get(target, key) { return key in target ? target[key] : () => {}; }, set() { return true; } });
for (const phase of ['step', 'flip', 'hover', 'stomp', 'impact', 'recover']) {
  animator.drawStickman(canvas, 0, 0, animator.getGladiatorCaesarFrame(phase, 0.5), 'gladiator', 1);
  animator.drawStickman(canvas, 0, 0, animator.getGladiatorCaesarFrame(phase, 0.5), 'gladiator', -1);
}
assert.ok(Math.abs(game.getGladiatorLeapMotion(leap, leap.startedAt + 0.76 * 500).x -
  game.getGladiatorLeapMotion(leap, leap.startedAt + 0.76 * 500 - 0.001).x) < 0.01,
  'flip-to-hover transition must be continuous');

now = leap.endsAt;
game.updateGladiatorSystems();
assert.equal(gladiator.gladiatorLeap, null);
assert.equal(gladiator.position.x, 450);
assert.equal(gladiator.position.y, 300);
assert.equal(gladiator.animation.current, 'idle');
assert.equal(target.hp, 142, 'impact damage must remain 8');
assert.equal(game.gameState.gladiatorArena.radius, 100);
assert.equal(game.gameState.gladiatorArena.expiresAt, now + 4000);
assert.equal(gladiator.maxHp, 130);
assert.equal(gladiator.hp, 90);
assert.equal(gladiator.gladiatorArenaMoveSpeedMultiplier, 1.2);
assert.equal(gladiator.gladiatorArenaAttackSpeedMultiplier, 0.8);
const startX = gladiator.position.x;
game.movePlayer('player1', 1);
assert.ok(Math.abs(gladiator.position.x - startX - 270 * 1.2 * 0.016) < 0.01);
game.cooldowns.player1.attack = now;
now += 719;
game.attack('player1');
assert.notEqual(game.cooldowns.player1.attack, now, 'attack interval should still be cooling down at 719 ms');
now++;
game.attack('player1');
assert.equal(game.cooldowns.player1.attack, now, 'attack interval should be 720 ms');
gladiator.hp = 130;
now = leap.endsAt + 4000;
game.updateGladiatorSystems();
assert.equal(game.gameState.gladiatorArena, null);
assert.equal(gladiator.maxHp, 100);
assert.equal(gladiator.hp, 100, 'current HP must be capped when temporary max HP expires');
assert.equal(gladiator.gladiatorArenaBuffUntil, 0);
assert.equal(gladiator.gladiatorArenaMoveSpeedMultiplier, 1);
assert.equal(gladiator.gladiatorArenaAttackSpeedMultiplier, 1);

now += 15000;
gladiator.position = { x: 300, y: 300 };
target.position = { x: 450, y: 300 };
game.useSkill('player1', 'ultimate');
assert.ok(gladiator.gladiatorLeap, 'ultimate should be usable again after its 15 second cooldown');
now += 500;
game.updateGladiatorSystems();
assert.equal(gladiator.maxHp, 130, 'second cast must not stack old temporary HP');
assert.equal(gladiator.gladiatorArenaBaseMaxHp, 100);

now += 20000;
const missed = makeGame(650);
missed.game.useSkill('player1', 'ultimate');
now += 500;
missed.game.updateGladiatorSystems();
assert.equal(missed.target.hp, 150);
assert.equal(missed.game.gameState.gladiatorArena, null);
assert.equal(missed.gladiator.maxHp, 100);
assert.equal(missed.gladiator.gladiatorArenaBuffUntil || 0, 0);

now += 20000;
const interrupted = makeGame();
interrupted.game.useSkill('player1', 'ultimate');
interrupted.gladiator.effects.stunned = now + 1000;
now += 250;
interrupted.game.updateGladiatorSystems();
assert.equal(interrupted.gladiator.gladiatorLeap, null);
assert.equal(interrupted.gladiator.position.y, 300);
assert.equal(interrupted.gladiator.animation.current, 'idle');
assert.equal(interrupted.game.gameState.gladiatorArena, null);

now += 20000;
const broken = makeGame();
broken.game.useSkill('player1', 'ultimate');
now += 500;
broken.game.updateGladiatorSystems();
broken.game.interruptYangHongTarget(broken.target, 'player2');
assert.equal(broken.game.gameState.gladiatorArena, null);
assert.equal(broken.gladiator.maxHp, 100);
assert.equal(broken.gladiator.hp, 90);

now += 20000;
const dead = makeGame();
dead.game.useSkill('player1', 'ultimate');
now += 500;
dead.game.updateGladiatorSystems();
dead.gladiator.hp = 0;
dead.game.updateGladiatorSystems();
assert.equal(dead.gladiator.maxHp, 100);
assert.equal(dead.game.gameState.gladiatorArena, null);

now += 20000;
const left = new NinjaGame();
left.selectCharacters('fujin', 'gladiator');
for (const method of ['addVisualEffect', 'addDamageNumber', 'addCombatLog', 'triggerCameraShake', 'spawnCombatFlourish']) left[method] = () => {};
left.players.player2.position = { x: 700, y: 300 };
left.players.player2.facing = -1;
left.players.player1.position = { x: 550, y: 300 };
left.useSkill('player2', 'ultimate');
now += 250;
left.updateGladiatorSystems();
assert.ok(left.players.player2.position.x < 700, 'left-facing flip must travel left');
now += 250;
left.updateGladiatorSystems();
assert.equal(left.players.player2.position.x, 550);
assert.equal(left.gameState.gladiatorArena?.ownerId, 'player2');

console.log('Gladiator Caesar phases, impact, buffs, expiry, miss, interruption and death: OK');
