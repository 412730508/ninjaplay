// NinjaPlay balance tuning lives here so it can be adjusted without touching the combat engine.
// Values are deliberately small and are reviewed as a single balance patch.
const BALANCE_VERSION = '0.3.0';

const BALANCE_PATCH = {
  fujin: {
    attackDamage: 7,
    skills: { ultimate: { cooldown: 11000 } }
  },
  katon: {
    skills: { normal: { cooldown: 8000 } }
  },
  dokusei: {
    skills: {
      normal: { damage: 5 },
      ultimate: { cooldown: 14000 }
    }
  },
  taijutsu: {
    skills: {
      normal: { damage: 8, cooldown: 8000 },
      ultimate: { cooldown: 16000, damage: 17 }
    }
  },
  suijin: {
    skills: { normal: { baseHeal: 5, healPercent: 0.8 } }
  },
  doton: { maxHp: 130, hp: 130 },
  kage: {
    skills: { ultimate: { cloneCount: 6, cloneDamage: 2 } }
  },
  rei: {
    skills: { ultimate: { range: 400 } }
  },
  ranger: {
    skills: { normal: { cooldown: 10000 } }
  },
  warlock: { attackDamage: 4, attackSpeed: 700, attackHeal: 2 },
  beastmaster: {
    skills: {
      normal: { damage: 3 },
      ultimate: {
        minStacksToCast: 3,
        golemShield: 20,
        transformRootRange: 200,
        golemSkillDelay: 300,
        revertCooldown: 3000
      }
    }
  },
  adjudicator: {
    moveSpeed: 240,
    skills: { normal: { cooldown: 8000 } }
  },
  azure_disciple: {
    skills: { normal: { warningDuration: 200 } }
  },
  shamisen: { attackDamage: 5 },
  forgefire: {
    maxHp: 110,
    hp: 110,
    skills: { normal: { stun: 500 } }
  },
  // Character-specific designs are kept in characters.js. Add only measured
  // balance adjustments here after play testing.
};

function applyBalancePatch(roster, patch) {
  for (const [characterId, changes] of Object.entries(patch)) {
    const character = roster[characterId];
    if (!character) {
      console.warn(`[balance] Unknown character: ${characterId}`);
      continue;
    }

    for (const [key, value] of Object.entries(changes)) {
      if (key === 'skills') {
        for (const [skillName, skillChanges] of Object.entries(value)) {
          Object.assign(character.skills[skillName], skillChanges);
        }
      } else {
        character[key] = value;
      }
    }
  }
}

applyBalancePatch(characters, BALANCE_PATCH);
