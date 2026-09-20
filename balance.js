// NinjaPlay balance tuning lives here so it can be adjusted without touching the combat engine.
// Values are deliberately small and are reviewed as a single balance patch.
const BALANCE_VERSION = '0.2.0';

const BALANCE_PATCH = {
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
      normal: { damage: 8 },
      ultimate: { cooldown: 16000, damage: 18 }
    }
  },
  beastmaster: {
    skills: {
      normal: { damage: 3 },
      ultimate: { minStacksToCast: 3 }
    }
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
