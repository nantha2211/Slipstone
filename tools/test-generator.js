// Headless check: every generated level is solvable, lands near its par band, and is deterministic.
// Usage: node tools/test-generator.js
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const src = html.match(/\/\/ =+ ENGINE START =+\n([\s\S]*?)\/\/ =+ ENGINE END/)[1];
const E = new Function(src + '\nreturn {genLevel, solve, parseLevel, TUTORIAL, hashStr, difficulty};')();
let fail = 0;
E.TUTORIAL.forEach((t, i) => { const L = E.parseLevel(t.rows); if (!L.par) { fail++; console.log('tutorial', i + 1, 'unsolvable'); } });
for (let d = 1; d <= 25; d++) {
  const P = E.difficulty(d); let inBand = 0; const n = 100;
  for (let k = 0; k < n; k++) {
    const L = E.genLevel((k * 2654435761 + d) >>> 0, d);
    const s = E.solve(L, L.start);
    if (!s || s.par !== L.par) { fail++; console.log('bad level', d, k); }
    if (L.par >= P.minPar && L.par <= P.maxPar) inBand++;
  }
  console.log(`end ${String(d).padStart(2)}  grid ${P.size}x${P.size}  par band ${P.minPar}-${P.maxPar}  in band ${inBand}%`);
}
const a = E.genLevel(E.hashStr('daily'), 6), b = E.genLevel(E.hashStr('daily'), 6);
if (a.grid.join() !== b.grid.join()) { fail++; console.log('non-deterministic'); }
console.log(fail ? `FAILED (${fail})` : 'All checks passed');
process.exit(fail ? 1 : 0);
