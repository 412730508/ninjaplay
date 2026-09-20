import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const htmlPath = resolve(root, 'index.html');
const html = readFileSync(htmlPath, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
const localAssets = [...new Set([
  ...[...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map((match) => match[1]),
  ...[...html.matchAll(/assets\/portraits\/[\w.-]+\.png/g)].map((match) => match[0])
])].filter((asset) => !/^(?:https?:|data:|#)/.test(asset));

let failed = false;
for (const asset of localAssets) {
  const path = resolve(root, asset);
  if (!existsSync(path)) {
    console.error(`Missing local asset: ${asset}`);
    failed = true;
  }
}

const css = readFileSync(resolve(root, 'ninjaStyles.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/'[^']*'|"[^"]*"/g, '');
const openBraces = [...css].filter((character) => character === '{').length;
const closeBraces = [...css].filter((character) => character === '}').length;
if (openBraces !== closeBraces) {
  console.error(`CSS brace check failed: ${openBraces} opening and ${closeBraces} closing braces.`);
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
    ['taijutsu', 'skills.ultimate.damage', 18],
    ['beastmaster', 'skills.ultimate.minStacksToCast', 3],
    ['scorpion', 'skills.ultimate.damage', 4],
    ['shamisen', 'skills.ultimate.cooldown', 18000],
    ['puppeteer', 'skills.normal.puppetFollowDist', 60],
    ['puppeteer', 'skills.ultimate.smokeRadius', 200],
    ['kage', 'skills.ultimate.duration', 3000],
    ['kage', 'skills.ultimate.spawnDelay', 100]
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

if (failed) process.exit(1);
console.log(`Checked ${localAssets.length} local page assets and JavaScript syntax successfully.`);
