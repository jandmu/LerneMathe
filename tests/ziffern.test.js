import test from 'node:test';
import assert from 'node:assert/strict';
import { ZIFFERN, idealStriche, pruefeSpur } from '../src/core/ziffern.js';

/** Realistisches Wackeln: langsame Abweichung quer zur Spur plus leichtes Zittern. */
function wackeln(s, amplitude = 3) {
  const phase = Math.random() * 6;
  const dichte = dicht(s, 1.5);
  return dichte.map(([x, y], i) => {
    const w = Math.sin(i / 12 + phase) * amplitude;
    return [x + w + (Math.random() - 0.5), y + w * 0.6 + (Math.random() - 0.5)];
  });
}

/** Zickzack quer zur Schreibrichtung. */
function zickzack(s, amplitude, periode) {
  const d = dicht(s, 1);
  return d.map(([x, y], i) => {
    const [ax, ay] = d[Math.max(0, i - 1)];
    const [bx, by] = d[Math.min(d.length - 1, i + 1)];
    const w = Math.atan2(by - ay, bx - ax) + Math.PI / 2;
    const t = (i % periode) / periode;
    const off = amplitude * (t < 0.5 ? 4 * t - 1 : 3 - 4 * t);
    return [x + Math.cos(w) * off, y + Math.sin(w) * off];
  });
}

/** Punkte im Abstand von etwa `schritt` Einheiten entlang eines Strichs. */
function dicht(s, schritt) {
  const aus = [s[0]];
  for (let i = 1; i < s.length; i++) {
    const [x1, y1] = s[i - 1];
    const [x2, y2] = s[i];
    const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / schritt));
    for (let k = 1; k <= n; k++) aus.push([x1 + ((x2 - x1) * k) / n, y1 + ((y2 - y1) * k) / n]);
  }
  return aus;
}

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
    for (let i = 0; i < 30; i++) {
      const r = pruefeSpur(d, ideal.map((s) => wackeln(s, 3)));
      assert.equal(r.status, 'richtig', 'leichtes Wackeln muss erlaubt sein: ' + r.text);
    }
    // Zickzack um die Spur – auch innerhalb der grauen Spur – muss auffallen.
    for (const [a, p] of [[5, 6], [6, 10], [10, 14], [4, 4]]) {
      assert.equal(pruefeSpur(d, ideal.map((s) => zickzack(s, a, p))).status, 'falsch', `Zickzack ${a}/${p}`);
    }
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
