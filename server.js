import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_PROBABILITIES, RARITIES, drawOne, drawTenConstrained, validateProbabilities } from './core.js';

const root = path.dirname(fileURLToPath(import.meta.url)); const dataDir = path.join(root, 'data'); fs.mkdirSync(dataDir, { recursive: true });
const dataFile = path.join(dataDir, 'gacha.json');
const emptyDb = () => ({ settings: { probabilities: { ...DEFAULT_PROBABILITIES }, pityRules: [], tenPullMode: 'random', constraintEnabled: true, maxLow: 2, revealMode: 'sequence' }, participants: [], records: [], eventSeq: 0, lastEvent: null });
let db = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : emptyDb();
function save() { const temp = `${dataFile}.tmp`; fs.writeFileSync(temp, JSON.stringify(db, null, 2)); fs.renameSync(temp, dataFile); }
const now = () => new Date().toISOString(); const sendJson = (res, status, value) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }); res.end(JSON.stringify(value)); };
const readBody = async (req) => { let raw = ''; for await (const chunk of req) raw += chunk; return raw ? JSON.parse(raw) : {}; };
const participant = (p) => ({ ...p, pity: { ...p.pity } }); const findParticipant = (id) => db.participants.find((p) => p.id === Number(id));
function page(res, filename) { const file = path.join(root, 'public', filename); res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(fs.readFileSync(file)); }

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost'); const parts = url.pathname.split('/');
    if (req.method === 'GET' && url.pathname === '/') return res.writeHead(302, { Location: '/control' }).end();
    if (req.method === 'GET' && url.pathname === '/control') return page(res, 'control.html');
    if (req.method === 'GET' && url.pathname === '/overlay') return page(res, 'overlay.html');
    if (req.method === 'GET' && url.pathname === '/api/settings') return sendJson(res, 200, db.settings);
    if (req.method === 'GET' && url.pathname === '/api/participants') return sendJson(res, 200, db.participants.map(participant));
    if (req.method === 'GET' && url.pathname === '/api/events') return sendJson(res, 200, db.eventSeq > Number(url.searchParams.get('after') || 0) ? { seq: db.eventSeq, event: db.lastEvent } : { seq: db.eventSeq, event: null });
    if (req.method === 'GET' && parts[1] === 'api' && parts[2] === 'participants' && parts[3]) { const p = findParticipant(parts[3]); return p ? sendJson(res, 200, participant(p)) : sendJson(res, 404, { error: '观众不存在' }); }
    if (req.method === 'POST' && url.pathname === '/api/settings') { const input = await readBody(req); const checked = validateProbabilities(input.probabilities || {}); if (!checked.valid) return sendJson(res, 400, { error: checked.error }); db.settings = { probabilities: checked.values, pityRules: (input.pityRules || []).map((r) => ({ rarity: r.rarity, limit: Number(r.limit), enabled: Boolean(r.enabled) })).filter((r) => RARITIES.includes(r.rarity) && Number.isInteger(r.limit) && r.limit > 0), tenPullMode: input.tenPullMode === 'constrained' ? 'constrained' : 'random', constraintEnabled: input.constraintEnabled !== false, maxLow: Math.max(0, Math.min(10, Number(input.maxLow ?? 2))), revealMode: input.revealMode === 'instant' ? 'instant' : 'sequence' }; save(); return sendJson(res, 200, { ...db.settings, usedDefault: checked.usedDefault }); }
    if (req.method === 'POST' && url.pathname === '/api/participants') { const name = String((await readBody(req)).name || '').trim(); if (!name) return sendJson(res, 400, { error: '请输入观众姓名' }); if (db.participants.some((p) => p.name === name)) return sendJson(res, 409, { error: '观众姓名已存在' }); const p = { id: Date.now(), name, totalDraws: 0, pity: Object.fromEntries(RARITIES.map((r) => [r, 0])), createdAt: now(), updatedAt: now() }; db.participants.push(p); save(); return sendJson(res, 201, participant(p)); }
    if (req.method === 'POST' && parts[1] === 'api' && parts[2] === 'participants' && parts[4] === 'reset') { const p = findParticipant(parts[3]); if (!p) return sendJson(res, 404, { error: '观众不存在' }); p.totalDraws = 0; p.pity = Object.fromEntries(RARITIES.map((r) => [r, 0])); p.updatedAt = now(); db.records = db.records.filter((r) => r.participantId !== p.id); save(); return sendJson(res, 200, { ok: true }); }
    if (req.method === 'POST' && url.pathname === '/api/reset') { db.participants = []; db.records = []; db.eventSeq += 1; db.lastEvent = null; save(); return sendJson(res, 200, { ok: true }); }
    if (req.method === 'DELETE' && parts[1] === 'api' && parts[2] === 'participants' && parts[3]) { const id = Number(parts[3]); const before = db.participants.length; db.participants = db.participants.filter((p) => p.id !== id); db.records = db.records.filter((r) => r.participantId !== id); if (db.participants.length === before) return sendJson(res, 404, { error: '观众不存在' }); save(); return sendJson(res, 200, { ok: true }); }
    if (req.method === 'POST' && parts[1] === 'api' && parts[2] === 'participants' && parts[4] === 'draw') {
      const p = findParticipant(parts[3]); if (!p) return sendJson(res, 404, { error: '观众不存在' }); const input = await readBody(req); const count = input.count === 10 ? 10 : 1; const mode = input.mode === 'demo' ? 'demo' : 'fair'; const batchId = `${Date.now()}-${Math.random().toString(36).slice(2)}`; let pity = { ...p.pity }; const results = [];
      if (count === 10 && mode !== 'demo' && db.settings.constraintEnabled && db.settings.tenPullMode === 'constrained') { results.push(...drawTenConstrained({ probabilities: db.settings.probabilities, pityRules: db.settings.pityRules, pity, maxLow: db.settings.maxLow })); pity = results.at(-1).nextPity; }
      else for (let i = 0; i < count; i++) { const result = drawOne({ probabilities: db.settings.probabilities, pityRules: db.settings.pityRules, pity, mode, forcedRarity: i === 0 ? input.forcedRarity : undefined }); pity = result.nextPity; results.push({ ...result, index: i }); }
      if (mode === 'demo' && input.forcedRarity && RARITIES.includes(input.forcedRarity)) {
        const targetRank = RARITIES.indexOf(input.forcedRarity);
        if (input.forceMode === 'atLeast') results[0] = { ...results[0], rarity: input.forcedRarity, isPity: false };
        if (input.forceMode === 'maxRarity') results.forEach((r, i) => { if (RARITIES.indexOf(r.rarity) > targetRank) results[i] = { ...r, rarity: 'EMPTY', isPity: false }; });
      }
      const countDemo = mode === 'demo' && input.countDemo !== true; if (!countDemo) { p.totalDraws += count; p.pity = pity; p.updatedAt = now(); results.forEach((r) => db.records.push({ id: Date.now() + r.index, participantId: p.id, batchId, index: r.index, rarity: r.rarity, isPity: r.isPity, mode, createdAt: now() })); save(); }
      db.eventSeq += 1; db.lastEvent = { type: 'draw', participant: participant(p), results, batchId, revealMode: db.settings.revealMode }; save(); return sendJson(res, 200, db.lastEvent);
    }
    if (req.method === 'GET' && url.pathname === '/api/export') return sendJson(res, 200, db);
    return sendJson(res, 404, { error: '接口不存在' });
  } catch (error) { console.error(error); return sendJson(res, 500, { error: error.message }); }
});
const port = Number(process.env.PORT || 3000); server.listen(port, '127.0.0.1', () => console.log(`Control: http://127.0.0.1:${port}/control\nOverlay: http://127.0.0.1:${port}/overlay`));
