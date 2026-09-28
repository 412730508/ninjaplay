# NinjaPlay project baseline

## What to edit

The live game uses these files directly in the browser:

- `index.html` — screen layout and selection-flow code
- `characters.js` — character definitions and skill data
- `balance.js` — the current balance patch; start here for number changes
- `gameEngine.js` — combat state and rules
- `mapSystem.js` — maps and map rendering
- `particleSystem.js` — effects
- `stickmanAnimator.js` — fighter animation
- `aiController.js` and `audioSystem.js` — CPU and sound
- `ninjaStyles.css` — styling

`gameEngine.js` is the current source of truth. The repository history is the recovery mechanism; only the files listed above are needed for normal development.

## Run locally

This is a static, dependency-free site. From this folder, start a local server:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`. A local server avoids browser restrictions that can affect audio, storage, and future PWA features.

## Before changing gameplay

Run:

```powershell
npm run check
```

It checks that the page's local files exist and that every top-level JavaScript file has valid syntax. It needs no package installation.

## Safe next milestones

1. Test and document one complete match for every character.
2. Tune only `balance.js` until the roster has a stable baseline.
3. Move character-specific skill behaviour out of `gameEngine.js`, one character at a time.
4. Add small, focused commits after each working change.
