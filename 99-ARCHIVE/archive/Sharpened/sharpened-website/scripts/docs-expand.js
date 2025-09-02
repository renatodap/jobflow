#!/usr/bin/env node
/*
  docs-expand.js (self-contained)
  - Scans docs/brand/*.md (and subfolders) to:
    • Generate: _index.md, _open_questions.md, _decisions.md
    • Validate Decision Blocks (Options + Pros/Cons + STATUS)
    • Write a Brand Diff under _diffs/<timestamp>.md (based on file hash + headings)
    • Update root TRACKER.md
    • Build a review bundle under docs/reviews/v0/ (and attempt to zip)

  No external deps. Node >=16.
*/
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cp = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DOCS = path.join(ROOT, 'docs', 'brand');
const DIFFS = path.join(DOCS, '_diffs');
const STATE = path.join(DOCS, '.docs-expand-state.json');
const REVIEWS_DIR = path.join(ROOT, 'docs', 'reviews', 'v0');

main().catch(err => { console.error(err); process.exit(1); });

async function main() {
  ensureDir(DOCS); ensureDir(DIFFS); ensureDir(REVIEWS_DIR);

  const mdFiles = walk(DOCS)
    .filter(f => f.endsWith('.md'))
    .filter(f => !path.basename(f).startsWith('_'))
    .filter(f => !f.includes(`${path.sep}_diffs${path.sep}`));

  const parsed = mdFiles.map(parseMarkdown);

  writeIndex(parsed);
  writeOpenQuestions(parsed);
  writeDecisions(parsed);
  writeDiff(parsed);
  updateTracker(parsed);
  packageReview(parsed);

  console.log('\nDone: docs:expand');
}

// ---------- FS helpers ----------
function ensureDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }
function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, text) { ensureDir(path.dirname(file)); fs.writeFileSync(file, text); }
function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const s = fs.statSync(p);
    if (s.isDirectory()) out.push(...walk(p)); else out.push(p);
  }
  return out;
}
function sha1(text) { return crypto.createHash('sha1').update(text).digest('hex'); }
function slug(text) { return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-'); }

// ---------- Markdown parsing ----------
function parseFrontMatter(content) {
  if (content.startsWith('---')) {
    const end = content.indexOf('\n---', 3);
    if (end !== -1) {
      const raw = content.slice(3, end).trim();
      const body = content.slice(end + 4);
      const fm = {};
      for (const line of raw.split(/\r?\n/)) {
        const m = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
        if (m) fm[m[1]] = m[2];
      }
      return { fm, body };
    }
  }
  return { fm: {}, body: content };
}

function parseMarkdown(file) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const raw = read(file);
  const hash = sha1(raw);
  const { fm, body } = parseFrontMatter(raw);
  const lines = body.split(/\r?\n/);
  const headings = [];
  const checkboxes = [];
  const decisions = [];

  let currentDecision = null; let currentDecisionLevel = 0;

  lines.forEach((line, i) => {
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length; const text = h[2].trim();
      headings.push({ level, text, id: slug(text), line: i + 1 });
      // close decision section if heading level bumps out
      if (currentDecision && level <= currentDecisionLevel) {
        decisions.push(currentDecision); currentDecision = null; currentDecisionLevel = 0;
      }
      if (/^\[Decision\]/i.test(text)) {
        currentDecision = {
          title: text.replace(/^\[Decision\]\s*/i, ''),
          status: null, recommendation: null, owner: null, due: null,
          hasOptions: false, hasProsCons: false,
          file: rel, anchor: '#' + slug(text)
        };
        currentDecisionLevel = level;
      }
      return;
    }

    const cb = line.match(/^-\s*\[( |x|X)\]\s*(.*)$/);
    if (cb) checkboxes.push({ checked: cb[1].toLowerCase() === 'x', text: cb[2], line: i + 1 });

    if (currentDecision) {
      if (/^\s*-\s*Options\s*:/i.test(line)) currentDecision.hasOptions = true;
      if (/Pros\s*\/\s*Cons|Pros\s*:|Cons\s*:/i.test(line)) currentDecision.hasProsCons = true;
      const s = line.match(/STATUS:\s*(.*)/i); if (s) currentDecision.status = s[1].trim();
      const r = line.match(/Recommendation:\s*(.*)/i); if (r) currentDecision.recommendation = r[1].trim();
      const o = line.match(/Owner:\s*(.*)/i); if (o) currentDecision.owner = o[1].trim();
      const d = line.match(/Due:\s*(.*)/i); if (d) currentDecision.due = d[1].trim();
    }
  });
  if (currentDecision) decisions.push(currentDecision);

  return { file, rel, hash, fm, headings, checkboxes, decisions };
}

// ---------- Generators ----------
function writeIndex(parsed) {
  const target = path.join(DOCS, '_index.md');
  const items = parsed
    .filter(p => p.rel.startsWith('docs/brand/'))
    .filter(p => !path.basename(p.rel).startsWith('_'))
    .sort((a,b)=>a.rel.localeCompare(b.rel))
    .map(p => `- [${path.basename(p.rel)}](${p.rel.replace('docs/brand/', '')})`)
    .join('\n');
  write(target, `# Brand Docs Index\n\n${items}\n`);
  console.log('• _index.md updated');
}

function writeOpenQuestions(parsed) {
  const target = path.join(DOCS, '_open_questions.md');
  const items = [];
  for (const p of parsed) for (const cb of p.checkboxes) if (!cb.checked) items.push({ p, cb });
  const lines = ['# Open Questions', '', ...items.map(({p,cb}) => `- [ ] ${cb.text} — (${path.basename(p.rel)}:${cb.line})`)];
  write(target, lines.join('\n') + '\n');
  console.log(`• _open_questions.md (${items.length})`);
}

function writeDecisions(parsed) {
  const target = path.join(DOCS, '_decisions.md');
  const all = parsed.flatMap(p => p.decisions);
  const header = '| Decision | Doc | Status | Recommendation | Owner | Due | Valid |\n|---|---|---|---|---|---|---|';
  const rows = all.map(d => {
    const valid = d.hasOptions && d.hasProsCons ? 'Yes' : 'Needs Fix';
    return `| ${escapePipes(d.title)} | ${path.basename(d.file)}${d.anchor} | ${d.status||''} | ${escapePipes(d.recommendation||'')} | ${d.owner||''} | ${d.due||''} | ${valid} |`;
  });
  write(target, ['# Decisions', '', header, ...rows, ''].join('\n'));
  console.log(`• _decisions.md (${all.length})`);
}

function escapePipes(s){return String(s).replace(/\|/g,'\\|')}

function readState(){ try { return JSON.parse(read(STATE)); } catch { return { files: {} }; } }
function writeState(state){ write(STATE, JSON.stringify(state, null, 2)); }

function writeDiff(parsed){
  const prev = readState();
  const now = { files: {} };
  for (const p of parsed) now.files[p.rel] = { hash: p.hash, headings: p.headings.map(h=>h.text) };

  const added = Object.keys(now.files).filter(k => !prev.files[k]);
  const removed = Object.keys(prev.files).filter(k => !now.files[k]);
  const changed = Object.keys(now.files).filter(k => prev.files[k] && prev.files[k].hash !== now.files[k].hash);

  const ts = new Date().toISOString().replace(/[:]/g, '-');
  const out = path.join(DIFFS, `${ts}.md`);
  const lines = ['# Brand Diff', '', `When: ${new Date().toISOString()}`, ''];
  if (added.length){ lines.push('## Added', ...added.map(a=>`- ${a}`), ''); }
  if (removed.length){ lines.push('## Removed', ...removed.map(a=>`- ${a}`), ''); }
  if (changed.length){
    lines.push('## Changed');
    for (const k of changed){
      const before = prev.files[k]?.headings || [];
      const after = now.files[k]?.headings || [];
      const headAdded = after.filter(h => !before.includes(h));
      const headRemoved = before.filter(h => !after.includes(h));
      lines.push(`- ${k}`);
      if (headAdded.length) lines.push(`  - Headings added: ${headAdded.join('; ')}`);
      if (headRemoved.length) lines.push(`  - Headings removed: ${headRemoved.join('; ')}`);
    }
    lines.push('');
  }
  write(out, lines.join('\n') + '\n');
  writeState(now);
  console.log(`• Diff written: ${path.basename(out)}`);
}

function updateTracker(parsed){
  const tracker = path.join(ROOT, 'TRACKER.md');
  const all = parsed.flatMap(p => p.decisions);
  const header = '# Decision Tracker\n\n| ID | Decision | Doc | Status | Owner | Due |\n|----|----------|-----|--------|-------|-----|';
  const rows = all.map((d,i)=>`| ${String(i+1).padStart(4,'0')} | ${escapePipes(d.title)} | ${path.basename(d.file)}${d.anchor} | ${d.status||''} | ${d.owner||''} | ${d.due||''} |`);
  write(tracker, [header, ...rows, '', 'Notes:', '- STATUS: Proposed | Approved | Rejected | Revisit', ''].join('\n'));
  console.log(`• TRACKER.md updated (${all.length})`);
}

function packageReview(parsed){
  const include = [
    path.join(DOCS, '00_overview.md'),
    path.join(DOCS, '00_audit_and_gaps.md'),
    path.join(DOCS, '01_positioning.md'),
    path.join(DOCS, '02_architecture.md'),
    path.join(DOCS, '03_audience_personas.md'),
    path.join(DOCS, '04_messaging_matrix.md'),
    path.join(DOCS, '05_voice_tone.md'),
    path.join(DOCS, '06_visual_identity.md'),
    path.join(DOCS, '_open_questions.md'),
    path.join(DOCS, '_decisions.md'),
    path.join(DOCS, 'REVIEW_CHECKLIST.md'),
    path.join(ROOT, 'TRACKER.md')
  ].filter(fs.existsSync);

  // copy files
  for (const f of include) {
    const dest = path.join(REVIEWS_DIR, path.basename(f));
    write(dest, read(f));
  }

  // write index + how to review
  const index = ['# Review Pack v0', '', 'Included:', ...include.map(f => `- ${path.basename(f)}`), '', 'Open in this folder and review top-to-bottom.'].join('\n');
  write(path.join(REVIEWS_DIR, 'index.md'), index + '\n');
  const howto = [
    '# HOW_TO_REVIEW (30 min)',
    '',
    '1) Read 00_overview.md (2m)',
    '2) Read 01_positioning.md and 02_architecture.md (10m)',
    '3) Skim 03–06 (8m)',
    '4) Open _decisions.md and mark statuses (8m)',
    '5) Check _open_questions.md and leave comments (2m)',
  ].join('\n');
  write(path.join(REVIEWS_DIR, 'HOW_TO_REVIEW.md'), howto + '\n');

  // attempt to zip (best-effort)
  tryZipReview();
  console.log('• Review pack updated');
}

function tryZipReview(){
  const zipPath = path.join(path.dirname(REVIEWS_DIR), 'v0.zip');
  try {
    if (process.platform === 'win32') {
      cp.spawnSync('powershell', ['-NoProfile','-Command', `Compress-Archive -Path "${REVIEWS_DIR}" -DestinationPath "${zipPath}" -Force`], { stdio: 'ignore' });
    } else {
      // try zip CLI if available
      const hasZip = cp.spawnSync('bash', ['-lc', 'command -v zip >/dev/null 2>&1']).status === 0;
      if (hasZip) cp.spawnSync('bash', ['-lc', `cd "${path.dirname(REVIEWS_DIR)}" && zip -r "${zipPath}" "v0"`], { stdio: 'ignore' });
    }
  } catch {}
}
