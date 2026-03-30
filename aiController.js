class AIController {
  constructor(game, options = {}) {
    this.game = game;
    this.aiPlayerId = options.aiPlayerId || 'player2';
    this.targetPlayerId = options.targetPlayerId || 'player1';
    this.enabled = options.enabled !== false;
    this.frameAccumulator = 0;
    this.nextThinkFrames = this.getRandomThinkFrames();
    this.currentMoveDirection = 0;
    this.longRange = options.longRange || 200;
    this.meleeRange = options.meleeRange || 80;
    this.backstepRange = options.backstepRange || 170;
    this.defaultSkillRange = options.defaultSkillRange || 200;
    this.defaultUltimateRange = options.defaultUltimateRange || 220;
    this.guardChance = options.guardChance || 0.7;
    this.guardTapChance = options.guardTapChance || 0.35;
    this.guardTapMinMs = options.guardTapMinMs || 180;
    this.guardTapMaxMs = options.guardTapMaxMs || 320;
    this.highDamageThreshold = options.highDamageThreshold || 16;
    this.aiCharacter = null;
    this.targetCharacter = null;
    this.guardUntil = 0;
    this.punishUntil = 0;
    this.pendingPunish = false;
    this.activeThreat = null;
    this.lastObservedTargetCooldowns = {
      attack: 0,
      normal: 0,
      ultimate: 0
    };
    this.syncCharacters();
  }

  getRandomThinkFrames() {
    return 15 + Math.floor(Math.random() * 16);
  }

  syncCharacters() {
    this.aiCharacter = this.game?.players?.[this.aiPlayerId] || null;
    this.targetCharacter = this.game?.players?.[this.targetPlayerId] || null;
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (!this.enabled) {
      this.stopMoving();
    }
  }

  destroy() {
    this.releaseGuard();
    this.stopMoving();
    this.enabled = false;
    this.game = null;
    this.aiCharacter = null;
    this.targetCharacter = null;
  }

  update(deltaTime) {
    this.syncCharacters();

    if (!this.canUpdate()) {
      this.releaseGuard();
      this.stopMoving();
      return;
    }

    const now = Date.now();

    this.observeTargetIntent(now);
    this.updateGuardDirection();

    if (this.shouldEmergencyGuard(now)) {
      this.stopMoving();
      this.holdGuardUntil(this.getBurstThreatEndTime(now));
    }

    if (this.activeThreat) {
      if (this.didThreatConnect()) {
        this.pendingPunish = false;
        this.activeThreat = null;
      } else if (this.didThreatWhiff(now)) {
        this.activeThreat = null;
        this.pendingPunish = true;
        this.punishUntil = now + 220;
        this.releaseGuard();
      }
    }

    if (this.pendingPunish && now <= this.punishUntil) {
      this.stopMoving();
      this.executePunish();
    } else if (this.pendingPunish && now > this.punishUntil) {
      this.pendingPunish = false;
    }

    if (this.isGuarding() && now >= this.guardUntil && !this.shouldEmergencyGuard(now)) {
      this.releaseGuard();
    }

    this.frameAccumulator += deltaTime / (1000 / 60);

    if (this.frameAccumulator >= this.nextThinkFrames) {
      this.frameAccumulator = 0;
      this.nextThinkFrames = this.getRandomThinkFrames();
      this.makeDecision();
    }

    if (this.currentMoveDirection !== 0 && this.canMove() && !this.isGuarding()) {
      if (this.currentMoveDirection < 0) {
        this.moveLeft();
      } else {
        this.moveRight();
      }
    }
  }

  canUpdate() {
    return Boolean(
      this.enabled &&
      this.game &&
      this.aiCharacter &&
      this.targetCharacter &&
      !this.game.gameState?.paused &&
      !this.game.gameState?.winner &&
      this.aiCharacter.hp > 0 &&
      this.targetCharacter.hp > 0
    );
  }

  canMove() {
    const now = Date.now();
    return Boolean(
      this.aiCharacter &&
      this.aiCharacter.effects &&
      this.aiCharacter.effects.stunned <= now &&
      this.aiCharacter.effects.casting <= now &&
      this.aiCharacter.effects.rooted <= now &&
      !this.isGuarding()
    );
  }

  canUseSkills() {
    const now = Date.now();
    return Boolean(
      this.aiCharacter &&
      this.aiCharacter.effects &&
      this.aiCharacter.effects.stunned <= now &&
      this.aiCharacter.effects.casting <= now &&
      this.aiCharacter.effects.silenced <= now &&
      !this.isGuarding()
    );
  }

  makeDecision() {
    if (!this.aiCharacter || !this.targetCharacter) {
      return;
    }

    const dx = this.targetCharacter.position.x - this.aiCharacter.position.x;
    const absDistance = Math.abs(dx);
    const now = Date.now();

    if (!this.canMove() && !this.canUseSkills()) {
      this.stopMoving();
      return;
    }

    if (this.shouldEmergencyGuard(now)) {
      this.stopMoving();
      return;
    }

    if (this.arePrimarySkillsCoolingDown()) {
      this.executeBackstepPlan(dx, absDistance, now);
      return;
    }

    if (this.shouldUseUltimate(absDistance)) {
      this.releaseGuard();
      this.stopMoving();
      this.useUltimate();
      return;
    }

    if (absDistance > this.longRange) {
      this.walkTowardTarget(dx);
      return;
    }

    if (absDistance >= this.meleeRange) {
      if (this.isSkillReady('normal')) {
        this.releaseGuard();
        this.stopMoving();
        this.useSkill1();
      } else {
        this.walkTowardTarget(dx);
      }
      return;
    }

    this.releaseGuard();
    this.stopMoving();
    this.attack();
  }

  observeTargetIntent(now) {
    const targetCooldowns = this.game?.cooldowns?.[this.targetPlayerId];
    if (!targetCooldowns || !this.targetCharacter) {
      return;
    }

    ['attack', 'normal', 'ultimate'].forEach(actionType => {
      const currentTimestamp = targetCooldowns[actionType] || 0;
      const previousTimestamp = this.lastObservedTargetCooldowns[actionType] || 0;

      if (currentTimestamp > previousTimestamp) {
        this.registerThreat(actionType, currentTimestamp, now);
      }

      this.lastObservedTargetCooldowns[actionType] = currentTimestamp;
    });
  }

  registerThreat(actionType, timestamp, now) {
    const dx = this.targetCharacter.position.x - this.aiCharacter.position.x;
    const absDistance = Math.abs(dx);
    const threatRange = this.getThreatRange(actionType);
    const threatDuration = this.getThreatDuration(actionType);
    const isBurst = actionType === 'ultimate' && this.isHighDamageUltimate(this.targetCharacter.skills?.ultimate);

    this.activeThreat = {
      type: actionType,
      timestamp,
      inRange: absDistance <= threatRange,
      aiHpAtStart: this.aiCharacter.hp,
      expectedEndTime: timestamp + threatDuration,
      burst: isBurst,
      animationName: this.targetCharacter.animation?.current || 'idle'
    };

    if (!this.activeThreat.inRange) {
      return;
    }

    if (isBurst || Math.random() < this.guardChance) {
      this.stopMoving();
      this.holdGuardUntil(this.activeThreat.expectedEndTime);
    }
  }

  didThreatConnect() {
    return Boolean(this.activeThreat && this.aiCharacter.hp < this.activeThreat.aiHpAtStart);
  }

  didThreatWhiff(now) {
    if (!this.activeThreat) {
      return false;
    }

    if (this.didThreatConnect()) {
      return false;
    }

    const targetCasting = this.targetCharacter.effects?.casting || 0;
    const currentAnimation = this.targetCharacter.animation?.current || 'idle';
    const animationSettled = currentAnimation === 'idle' || currentAnimation === 'defend';

    return now >= this.activeThreat.expectedEndTime && targetCasting <= now && animationSettled;
  }

  shouldEmergencyGuard(now) {
    if (!this.targetCharacter?.skills?.ultimate) {
      return false;
    }

    if (!this.isHighDamageUltimate(this.targetCharacter.skills.ultimate)) {
      return false;
    }

    const targetCasting = this.targetCharacter.effects?.casting || 0;
    if (targetCasting > now) {
      return true;
    }

    return Boolean(this.activeThreat?.burst && now <= this.activeThreat.expectedEndTime);
  }

  getBurstThreatEndTime(now) {
    const castingEnd = this.targetCharacter?.effects?.casting || 0;
    const trackedEnd = this.activeThreat?.burst ? this.activeThreat.expectedEndTime : 0;
    return Math.max(now + 120, castingEnd, trackedEnd);
  }

  executePunish() {
    if (!this.aiCharacter || !this.targetCharacter) {
      return;
    }

    const distance = Math.abs(this.targetCharacter.position.x - this.aiCharacter.position.x);
    if (distance > Math.max(this.getEffectiveSkillRange(this.aiCharacter.skills?.normal, this.defaultSkillRange), 140)) {
      this.pendingPunish = false;
      return;
    }

    if (this.isSkillReady('normal') && this.canUseSkills()) {
      this.useSkill1();
      this.pendingPunish = false;
      return;
    }

    if (this.isAttackReady()) {
      this.attack();
      this.pendingPunish = false;
    }
  }

  executeBackstepPlan(dx, absDistance, now) {
    if (absDistance < this.backstepRange) {
      this.walkAwayFromTarget(dx);
    } else {
      this.stopMoving();
    }

    if (!this.isGuarding() && this.canStartGuard(now) && Math.random() < this.guardTapChance) {
      this.holdGuardUntil(now + this.getRandomGuardTapDuration());
    }
  }

  walkTowardTarget(dx) {
    if (dx < 0) {
      this.currentMoveDirection = -1;
    } else if (dx > 0) {
      this.currentMoveDirection = 1;
    } else {
      this.currentMoveDirection = 0;
    }
  }

  walkAwayFromTarget(dx) {
    if (dx < 0) {
      this.currentMoveDirection = 1;
    } else if (dx > 0) {
      this.currentMoveDirection = -1;
    } else {
      this.currentMoveDirection = this.aiCharacter.facing > 0 ? -1 : 1;
    }
  }

  stopMoving() {
    this.currentMoveDirection = 0;
  }

  holdGuardUntil(endTime) {
    const now = Date.now();
    if (!this.canStartGuard(now) && !this.isGuarding()) {
      return;
    }

    this.faceTarget();
    this.guardUntil = Math.max(this.guardUntil, endTime);

    if (!this.isGuarding()) {
      this.game.startDefend(this.aiPlayerId);
    }

    this.updateGuardDirection();
  }

  releaseGuard() {
    if (!this.game || !this.isGuarding()) {
      this.guardUntil = 0;
      return;
    }

    this.game.endDefend(this.aiPlayerId);
    this.guardUntil = 0;
  }

  isGuarding() {
    return Boolean(this.game?.isPlayerDefending(this.aiPlayerId));
  }

  canStartGuard(now = Date.now()) {
    const defendState = this.game?.gameState?.defending?.[this.aiPlayerId];
    if (!defendState) {
      return false;
    }

    return Boolean(
      this.aiCharacter &&
      this.aiCharacter.effects &&
      this.aiCharacter.effects.stunned <= now &&
      this.aiCharacter.effects.casting <= now &&
      (defendState.cooldownUntil || 0) <= now
    );
  }

  updateGuardDirection() {
    if (!this.isGuarding()) {
      return;
    }

    this.faceTarget();
    this.game.updateDefendDirection(this.aiPlayerId);
  }

  faceTarget() {
    if (!this.aiCharacter || !this.targetCharacter) {
      return;
    }

    const dx = this.targetCharacter.position.x - this.aiCharacter.position.x;
    if (dx !== 0) {
      this.aiCharacter.facing = dx > 0 ? 1 : -1;
    }
  }

  moveLeft() {
    this.game.movePlayer(this.aiPlayerId, -1);
  }

  moveRight() {
    this.game.movePlayer(this.aiPlayerId, 1);
  }

  attack() {
    if (!this.isAttackReady()) {
      return;
    }

    this.releaseGuard();
    this.game.attack(this.aiPlayerId);
  }

  useSkill1() {
    if (!this.canUseSkills() || !this.isSkillReady('normal')) {
      return;
    }

    this.releaseGuard();
    this.game.useSkill(this.aiPlayerId, 'normal');
  }

  useUltimate() {
    if (!this.canUseSkills() || !this.isSkillReady('ultimate')) {
      return;
    }

    this.releaseGuard();
    this.game.useSkill(this.aiPlayerId, 'ultimate');
  }

  arePrimarySkillsCoolingDown() {
    return !this.isSkillReady('normal') && !this.isSkillReady('ultimate');
  }

  isAttackReady() {
    if (!this.aiCharacter || !this.canUseSkills()) {
      return false;
    }

    return Date.now() - (this.game.cooldowns?.[this.aiPlayerId]?.attack || 0) >= (this.aiCharacter.attackSpeed || 800);
  }

  isSkillReady(skillType) {
    const skill = this.aiCharacter?.skills?.[skillType];
    if (!skill) {
      return false;
    }

    const lastUseTime = this.game.cooldowns?.[this.aiPlayerId]?.[skillType] || 0;
    return Date.now() - lastUseTime >= (skill.cooldown || 0);
  }

  shouldUseUltimate(absDistance) {
    if (!this.isSkillReady('ultimate')) {
      return false;
    }

    return absDistance <= this.getEffectiveSkillRange(this.aiCharacter?.skills?.ultimate, this.defaultUltimateRange);
  }

  isHighDamageUltimate(skill) {
    if (!skill) {
      return false;
    }

    if ((skill.damage || 0) >= this.highDamageThreshold) {
      return true;
    }

    if ((skill.damagePercent || 0) > 0) {
      return true;
    }

    if ((skill.castTime || 0) >= 450 || (skill.channelTime || 0) >= 450) {
      return true;
    }

    return false;
  }

  getThreatRange(actionType) {
    if (!this.targetCharacter) {
      return this.defaultSkillRange;
    }

    if (actionType === 'attack') {
      return this.targetCharacter.isRanged ? 280 : 95;
    }

    const skillType = actionType === 'normal' ? 'normal' : 'ultimate';
    const skill = this.targetCharacter.skills?.[skillType];
    const fallback = actionType === 'ultimate' ? this.defaultUltimateRange : this.defaultSkillRange;
    return this.getEffectiveSkillRange(skill, fallback);
  }

  getThreatDuration(actionType) {
    if (!this.targetCharacter) {
      return 500;
    }

    if (actionType === 'attack') {
      const attackSpeed = this.targetCharacter.attackSpeed || 800;
      return Math.min(650, Math.max(220, attackSpeed * 0.55));
    }

    const skillType = actionType === 'normal' ? 'normal' : 'ultimate';
    const skill = this.targetCharacter.skills?.[skillType];
    if (!skill) {
      return actionType === 'ultimate' ? 900 : 550;
    }

    return Math.max(
      actionType === 'ultimate' ? 900 : 500,
      skill.castTime || 0,
      skill.channelTime || 0,
      skill.duration || 0,
      skill.pullDuration || 0,
      skill.recastWindow ? Math.min(skill.recastWindow, 1200) : 0
    );
  }

  getRandomGuardTapDuration() {
    return this.guardTapMinMs + Math.floor(Math.random() * (this.guardTapMaxMs - this.guardTapMinMs + 1));
  }

  getEffectiveSkillRange(skill, fallbackRange) {
    if (!skill) {
      return fallbackRange;
    }

    const directRange = skill.range || skill.distance || skill.pullRange || skill.aoe || skill.radius;
    if (typeof directRange === 'number' && directRange > 0) {
      return directRange;
    }

    if (this.aiCharacter?.isRanged) {
      return Math.max(fallbackRange, 320);
    }

    if (typeof skill.type === 'string') {
      const loweredType = skill.type.toLowerCase();
      if (loweredType.includes('projectile') || loweredType.includes('ranged')) {
        return Math.max(fallbackRange, 300);
      }
    }

    return fallbackRange;
  }
}

function setupCpuOpponent(game, options = {}) {
  if (!game) {
    return null;
  }

  const controller = new AIController(game, options);

  if (typeof game.setAIController === 'function') {
    game.setAIController(controller);
  } else {
    game.aiController = controller;
  }

  return controller;
}

function detachCpuOpponent(game) {
  if (!game) {
    return;
  }

  if (typeof game.setAIController === 'function') {
    game.setAIController(null);
    return;
  }

  if (game.aiController && typeof game.aiController.destroy === 'function') {
    game.aiController.destroy();
  }

  game.aiController = null;
}

window.AIController = AIController;
window.setupCpuOpponent = setupCpuOpponent;
window.detachCpuOpponent = detachCpuOpponent;