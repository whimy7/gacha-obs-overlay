export const RARITIES = ['EMPTY', 'R', 'SR', 'SSR', 'UR'];
export const RARITY_LABELS = { EMPTY: '空', R: 'R', SR: 'SR', SSR: 'SSR', UR: 'UR' };
export const DEFAULT_PROBABILITIES = { EMPTY: 70, R: 20, SR: 8, SSR: 1.8, UR: 0.2 };

export function validateProbabilities(input) {
  const hasBlank = RARITIES.some((r) => input?.[r] === '' || input?.[r] === null || input?.[r] === undefined);
  if (hasBlank) return { valid: true, values: { ...DEFAULT_PROBABILITIES }, usedDefault: true };
  const values = Object.fromEntries(RARITIES.map((r) => [r, Number(input[r])]));
  if (RARITIES.some((r) => !Number.isFinite(values[r]) || values[r] < 0)) return { valid: false, error: '概率必须是非负数字' };
  const total = RARITIES.reduce((sum, r) => sum + values[r], 0);
  if (Math.abs(total - 100) > 0.000001) return { valid: false, error: `概率总和必须为100%，当前为${total}%` };
  return { valid: true, values, usedDefault: false };
}

function weightedRarity(probabilities, random = Math.random()) {
  let cursor = random * 100;
  for (const rarity of RARITIES) { cursor -= probabilities[rarity]; if (cursor < 0) return rarity; }
  return 'EMPTY';
}

export function drawOne({ probabilities, pityRules, pity = {}, mode = 'fair', forcedRarity, random = Math.random }) {
  const nextPity = Object.fromEntries(RARITIES.map((r) => [r, (pity[r] || 0) + 1]));
  let rarity; let isPity = false;
  if (mode === 'demo' && RARITIES.includes(forcedRarity)) rarity = forcedRarity;
  else {
    const triggered = (pityRules || []).filter((r) => r.enabled && r.limit > 0 && nextPity[r.rarity] >= r.limit).sort((a, b) => b.limit - a.limit)[0];
    if (triggered) { rarity = triggered.rarity; isPity = true; } else rarity = weightedRarity(probabilities, random());
  }
  const rank = RARITIES.indexOf(rarity);
  for (const r of RARITIES) if (RARITIES.indexOf(r) <= rank) nextPity[r] = 0;
  return { rarity, isPity, nextPity };
}
