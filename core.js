export const RARITIES = ['EMPTY', 'R', 'SR', 'SSR', 'UR'];
export const RARITY_LABELS = { EMPTY: 'N', R: 'R', SR: 'SR', SSR: 'SSR', UR: 'UR' };
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

function permutationsForCounts(counts) {
  const values = [];
  for (const rarity of RARITIES) for (let i = 0; i < counts[rarity]; i++) values.push(rarity);
  const out = [];
  function visit(prefix, remaining) {
    if (prefix.length === 10) { out.push(prefix); return; }
    for (const rarity of RARITIES) if (remaining[rarity] > 0 && (prefix.length === 0 || prefix[prefix.length - 1] !== rarity || true)) {
      remaining[rarity] -= 1; visit([...prefix, rarity], remaining); remaining[rarity] += 1;
    }
  }
  visit([], { ...counts });
  return out;
}

function isPityValid(sequence, pity, pityRules) {
  const current = { ...pity };
  for (const rarity of sequence) {
    const next = Object.fromEntries(RARITIES.map((r) => [r, (current[r] || 0) + 1]));
    const triggered = (pityRules || []).filter((r) => r.enabled && r.limit > 0 && next[r.rarity] >= r.limit).sort((a, b) => RARITIES.indexOf(b.rarity) - RARITIES.indexOf(a.rarity))[0];
    if (triggered && rarity !== triggered.rarity) return false;
    const rank = RARITIES.indexOf(rarity); for (const r of RARITIES) if (RARITIES.indexOf(r) <= rank) current[r] = 0; else current[r] = next[r];
  }
  return true;
}

export function drawTenConstrained({ probabilities, pityRules = [], pity = {}, random = Math.random, maxLow = 2 }) {
  const countVectors = [];
  for (let sr = 0; sr <= maxLow; sr++) for (let r = 0; r <= maxLow - sr; r++) countVectors.push({ EMPTY: 10 - sr - r, R: r, SR: sr, SSR: 0, UR: 0 });
  countVectors.push({ EMPTY: 9, R: 0, SR: 0, SSR: 1, UR: 0 }, { EMPTY: 9, R: 0, SR: 0, SSR: 0, UR: 1 });
  const candidates = [];
  for (const counts of countVectors) for (const sequence of permutationsForCounts(counts)) if (isPityValid(sequence, pity, pityRules)) {
    const weight = sequence.reduce((total, rarity) => total * ((probabilities[rarity] || 0) / 100), 1);
    if (weight > 0) candidates.push({ sequence, weight });
  }
  if (!candidates.length) throw new Error('当前保底配置与十连约束没有可行结果，请调整配置');
  const total = candidates.reduce((sum, candidate) => sum + candidate.weight, 0); let cursor = random() * total; let chosen = candidates[candidates.length - 1].sequence;
  for (const candidate of candidates) { cursor -= candidate.weight; if (cursor <= 0) { chosen = candidate.sequence; break; } }
  let currentPity = { ...pity }; const results = chosen.map((rarity, index) => { const result = drawOne({ probabilities, pityRules, pity: currentPity, forcedRarity: rarity, mode: 'demo' }); currentPity = result.nextPity; return { ...result, rarity, index }; });
  return results;
}
