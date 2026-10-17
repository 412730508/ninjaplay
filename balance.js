// NinjaPlay balance tuning lives here so it can be adjusted without touching the combat engine.
// Values are deliberately small and are reviewed as a single balance patch.
const BALANCE_VERSION = '0.3.3';

const BALANCE_PATCH = {
  fujin: {
    attackDamage: 7,
    skills: { normal: { invulnerable: 1000 }, ultimate: { cooldown: 11000 } }
  },
  stephen: { attackDamage: 7 },
  yanghong: {
    skills: { normal: { maxHits: 9 }, ultimate: { cooldown: 10000 } }
  },
  katon: {
    skills: { normal: { cooldown: 8000, distance: 300 }, ultimate: { speed: 600 } }
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
    skills: { normal: { baseHeal: 5, healPercent: 0.6 } }
  },
  raijin: { moveSpeed: 320 },
  doton: { maxHp: 130, hp: 130 },
  kage: {
    skills: { ultimate: { cloneCount: 6, cloneDamage: 2 } }
  },
  rei: {
    skills: { ultimate: { range: 350 } }
  },
  ranger: { attackSpeed: 350, skills: { normal: { cooldown: 9000 } }
  },
  warlock: { maxHp: 95, hp: 95, attackDamage: 4, attackSpeed: 700, attackHeal: 2, skills: { ultimate: { damagePerTick: 12, healPerTick: 7 } } },
  ronin: { attackDamage: 8 },
  beastmaster: {
    skills: {
      normal: { damage: 3 },
      ultimate: {
        minStacksToCast: 5,
        golemShield: 10,
        transformRootRange: 200,
        golemSkillDelay: 300,
        revertCooldown: 3000
      }
    }
  },
  adjudicator: {
    moveSpeed: 240,
    skills: { normal: { cooldown: 8000, parryDuration: 1500, counterDamage: 15 } }
  },
  azure_disciple: {
    skills: { normal: { warningDuration: 200 }, ultimate: { strikeCount: 4 } }
  },
  shamisen: { attackDamage: 5, passive: { perfectWindow: [450, 600] }, skills: { normal: { range: 200 } } },
  scorpion: { passive: { hazardWidth: 130 } },
  puppeteer: { passive: { storedDamageRatio: 0.5 } },
  stephen: { skills: { normal: { unlimitedRange: true, chargeCooldownThreshold: 3000, chargeCooldownReduction: 3000 } } },
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
      } else if (key === 'passive') {
        Object.assign(character.passive, value);
      } else {
        character[key] = value;
      }
    }
  }
}

applyBalancePatch(characters, BALANCE_PATCH);
