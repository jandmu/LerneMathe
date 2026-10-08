import test from 'node:test';
import assert from 'node:assert/strict';
import { belohnen, werkstatt, projektWaehlen, teilEinbauen, MAX_PRO_RUNDE } from '../src/core/belohnung.js';
import { leererFortschritt } from '../src/core/speicher.js';
import { TAG_MS } from '../src/core/util.js';
import { PROJEKT_GRAFIK, projektBild } from '../src/ui/werkstatt-grafik.js';

const T0 = new Date(2026, 9, 8, 15, 0).getTime();
const nie = () => 0.99; // keine Überraschung
const runde = (n, skill = 'a/1') => Array.from({ length: n }, () => ({ skill, richtig: true }));

test('Erste Runde am Tag gibt eine Kiste, die zweite nicht', () => {
  const f = leererFortschritt();
  assert.deepEqual(belohnen(f, { ergebnisse: runde(8), jetzt: T0, zufall: nie }).map((g) => g.grund), ['tag']);
  assert.equal(belohnen(f, { ergebnisse: runde(8), jetzt: T0 + 1000, zufall: nie }).length, 0);
  assert.equal(belohnen(f, { ergebnisse: runde(8), jetzt: T0 + TAG_MS, zufall: nie }).length, 1);
  assert.equal(werkstatt(f).kisten, 2);
});

test('Abgebrochene kurze Runden geben keine Tageskiste', () => {
  const f = leererFortschritt();
  assert.equal(belohnen(f, { ergebnisse: runde(3), jetzt: T0, zufall: nie }).length, 0);
});

test('Neue Sterne und Wiederholungen geben Kisten, höchstens drei pro Runde', () => {
  const f = leererFortschritt();
  const aenderungen = [
    { skill: 'a/1', vorher: 1, nachher: 2 },
    { skill: 'b/1', vorher: 2, nachher: 3 },
    { skill: 'c/1', vorher: 2, nachher: 2 },
  ];
  const ergebnisse = runde(4, 'a/1').concat(runde(4, 'b/1'));
  const g = belohnen(f, { aenderungen, faelligAmStart: ['b/1'], ergebnisse, jetzt: T0, zufall: () => 0 });
  assert.equal(g.length, MAX_PRO_RUNDE);
  assert.deepEqual(g.map((x) => x.grund).slice(0, 2), ['stern', 'stern']);
  assert.equal(werkstatt(f).kisten, MAX_PRO_RUNDE);
});

test('Für Abstieg oder gleichbleibende Fertigkeiten gibt es keine Sterne-Kiste', () => {
  const f = leererFortschritt();
  const g = belohnen(f, { aenderungen: [{ skill: 'a/1', vorher: 3, nachher: 2 }], ergebnisse: runde(2), jetzt: T0, zufall: nie });
  assert.equal(g.length, 0);
});

test('Teile einbauen kostet je eine Kiste, doppelt geht nicht', () => {
  const f = leererFortschritt();
  assert.equal(teilEinbauen(f, 'spoiler'), false, 'ohne Projekt');
  assert.ok(projektWaehlen(f, 'auto'));
  assert.equal(teilEinbauen(f, 'spoiler'), false, 'ohne Kiste');
  werkstatt(f).kisten = 2;
  assert.ok(teilEinbauen(f, 'spoiler'));
  assert.equal(teilEinbauen(f, 'spoiler'), false);
  assert.ok(teilEinbauen(f, 'felgen'));
  assert.equal(werkstatt(f).kisten, 0);
  assert.ok(projektWaehlen(f, 'rakete'));
  assert.ok(projektWaehlen(f, 'auto'));
  assert.deepEqual(werkstatt(f).teile.auto, ['spoiler', 'felgen'], 'Teile bleiben beim Wechsel erhalten');
  assert.equal(projektWaehlen(f, 'ufo'), false);
});

test('Grafiken: jedes Projekt hat 10 Teile und zeichnet sich fehlerfrei', () => {
  for (const [id, p] of Object.entries(PROJEKT_GRAFIK)) {
    assert.equal(p.teile.length, 10, id);
    assert.equal(new Set(p.teile.map((t) => t.id)).size, 10, id + ': doppelte Teil-IDs');
    for (let farbe = 0; farbe < p.farben.length; farbe++) {
      const svg = projektBild(id, { farbe, teile: p.teile.map((t) => t.id), neu: p.teile[0].id });
      assert.ok(svg.startsWith('<svg') && !/undefined|NaN/.test(svg), id);
      assert.equal((svg.match(/class="teil/g) || []).length, 10);
    }
  }
});
