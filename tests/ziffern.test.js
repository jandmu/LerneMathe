import test from 'node:test';
import assert from 'node:assert/strict';
import { ZIFFERN, idealStriche, pruefeSpur } from '../src/core/ziffern.js';

const rausch = (s, a) => s.map(([x, y]) => [x + (Math.random() - 0.5) * 2 * a, y + (Math.random() - 0.5) * 2 * a]);

/** Verlängert einen Strich am Ende in Schreibrichtung (bzw. in eine andere Richtung). */
function verlaengern(strich, laenge, drehung = 0) {
  const [x1, y1] = strich[strich.length - 2];
  const [x2, y2] = strich[strich.length - 1];
  const w = Math.atan2(y2 - y1, x2 - x1) + drehung;
  const extra = [];
  for (let k = 1; k <= 10; k++) extra.push([x2 + Math.cos(w) * (laenge * k) / 10, y2 + Math.sin(w) * (laenge * k) / 10]);
  return strich.concat(extra);
}

for (const d of Object.keys(ZIFFERN)) {
  test(`Ziffer ${d}: richtig, verrauscht, rückwärts, verschoben, unvollständig, über das Ende hinaus`, () => {
    const ideal = idealStriche(d);
    assert.equal(pruefeSpur(d, ideal).status, 'richtig');
    for (let i = 0; i < 30; i++) assert.equal(pruefeSpur(d, ideal.map((s) => rausch(s, 4))).status, 'richtig', 'leichtes Zittern muss erlaubt sein');
    assert.equal(pruefeSpur(d, ideal.map((s) => s.slice().reverse())).status, 'falsch');
    assert.equal(pruefeSpur(d, ideal.map((s) => s.map(([x, y]) => [x + 30, y]))).status, 'falsch');
    assert.equal(pruefeSpur(d, ideal.map((s) => s.slice(0, Math.floor(s.length / 2)))).status, 'falsch');
    // Über das Ende weiterschreiben – geradeaus und seitlich abknickend – muss auffallen.
    for (const drehung of [0, Math.PI / 2, -Math.PI / 2]) {
      const zuLang = ideal.map((s, i) => (i === ideal.length - 1 ? verlaengern(s, 35, drehung) : s));
      assert.equal(pruefeSpur(d, zuLang).fehler, 'ziffer-ueber', `Drehung ${drehung}`);
    }
    // Ein kleiner Überschuss (wie beim normalen Absetzen) bleibt erlaubt.
    const knapp = ideal.map((s, i) => (i === ideal.length - 1 ? verlaengern(s, 6) : s));
    assert.equal(pruefeSpur(d, knapp).status, 'richtig');
  });
}

test('Ausreißer mitten im Strich werden erkannt', () => {
  const ideal = idealStriche(1);
  const s = ideal[0].slice();
  const mitte = Math.floor(s.length * 0.6);
  const [x, y] = s[mitte];
  const zacke = [[x + 15, y], [x + 30, y], [x + 40, y], [x + 30, y], [x + 15, y], [x, y]];
  const mitZacke = s.slice(0, mitte + 1).concat(zacke, s.slice(mitte + 1));
  assert.equal(pruefeSpur(1, [mitZacke]).status, 'falsch');
});
