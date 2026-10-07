import test from 'node:test';
import assert from 'node:assert/strict';
import { THEMEN, aufgabeFuer, skillId, skillsFuerKlasse, thema } from '../src/inhalte/index.js';
import { Bruch } from '../src/core/bruch.js';
import { zeige } from '../src/core/dezimal.js';

const DURCHLAEUFE = 300;

/** Baut die richtige Eingabe für eine Aufgabe, so wie die Oberfläche sie liefern würde. */
function richtigeEingabe(a) {
  const art = a.eingabe.art;
  if (art === 'zahl') return String(a.loesung);
  if (art === 'auswahl') return a.loesung;
  if (art === 'dezimal') return zeige(a.loesung).replace('−', '-');
  if (art === 'bruch') {
    const l = a.loesung;
    if (a.eingabe.nennerFest) return { z: String(l.z), n: String(a.eingabe.nennerFest) };
    if (a.form === 'gemischt') return { g: String(l.ganze), z: String(l.rest), n: String(l.n) };
    return { z: String(l.z), n: String(l.n) };
  }
  throw new Error('Unbekannte Eingabeart ' + art);
}

test('Themen sind eindeutig und vollständig beschrieben', () => {
  const ids = new Set();
  for (const t of THEMEN) {
    assert.ok(!ids.has(t.id), 'doppelte ID ' + t.id);
    ids.add(t.id);
    assert.ok(t.titel && t.kurz && t.klasse && t.bereich, t.id);
    assert.ok(t.stufen.length > 0, t.id);
    assert.ok((t.erklaerung && t.erklaerung.length) || t.merke, 'Erklärung fehlt: ' + t.id);
    for (const v of t.voraussetzungen || []) assert.ok(thema(v), `${t.id}: unbekannte Voraussetzung ${v}`);
  }
});

for (const t of THEMEN) {
  for (const s of t.stufen) {
    const id = skillId(t, s);
    test(`Aufgaben ${id}: lösbar, Lösungsweg vorhanden, richtige Antwort wird akzeptiert`, () => {
      for (let i = 0; i < DURCHLAEUFE; i++) {
        const a = aufgabeFuer(id);
        assert.equal(a.skill, id);
        assert.ok(a.text, 'Arbeitsauftrag fehlt');
        assert.ok(Array.isArray(a.weg) && a.weg.length > 0, 'Lösungsweg fehlt');
        assert.ok(a.ergebnis !== undefined && a.ergebnis !== '', 'Ergebnis fehlt');
        const alles = [a.text, a.rechnung, a.bild, a.ergebnis, JSON.stringify(a.weg)].join(' ');
        assert.ok(!/undefined|NaN|\[object Object\]/.test(alles), 'kaputte Ausgabe: ' + alles.slice(0, 300));
        if (a.eingabe.art === 'zahl') assert.ok(Number.isInteger(a.loesung) && a.loesung >= 0, 'Lösung ' + a.loesung);
        if (a.eingabe.art === 'dezimal') assert.ok(Number.isInteger(a.loesung) && a.loesung >= 0, 'Dezimallösung ' + a.loesung);
        if (a.eingabe.art === 'bruch') assert.ok(a.loesung instanceof Bruch);
        const r = a.pruefe(richtigeEingabe(a));
        assert.equal(r.status, 'richtig', `${id}: richtige Antwort abgelehnt (${JSON.stringify(richtigeEingabe(a))}) – ${r.text}`);
      }
    });
  }
}

test('Fehlbilder Klasse 1: typische Fehler werden erkannt', () => {
  for (let i = 0; i < 200; i++) {
    const a = aufgabeFuer('k1-minus20/uebergang');
    const m = /(\d+) − (\d+)/.exec(a.rechnung);
    const x = +m[1];
    const y = +m[2];
    const e = x - 10;
    assert.equal(a.pruefe(String(10 + (y - e))).fehler, 'einer-vertauscht');
    assert.equal(a.pruefe(String(x + y)).fehler, 'plus-statt-minus');
  }
  for (let i = 0; i < 100; i++) {
    const a = aufgabeFuer('k1-plus20/uebergang');
    const m = /(\d+) \+ (\d+)/.exec(a.rechnung);
    assert.equal(a.pruefe(String(+m[1] + +m[2] - 10)).fehler, 'zehner-vergessen');
  }
});

test('Fehlbilder Klasse 6: Nenner addiert, längere Dezimalzahl größer', () => {
  let gefunden = 0;
  for (let i = 0; i < 300; i++) {
    const a = aufgabeFuer('k6-bruch-addieren/mittel');
    const m = a.rechnung.match(/fr-z">(\d+)<\/span><span class="fr-n">(\d+)/g);
    if (!m || m.length < 2) continue;
    const [z1, n1] = m[0].match(/\d+/g).map(Number);
    const [z2, n2] = m[1].match(/\d+/g).map(Number);
    const r = a.pruefe({ z: String(z1 + z2), n: String(n1 + n2) });
    if (r.fehler === 'nenner-addiert') gefunden++;
  }
  assert.ok(gefunden > 250, 'Nenner-addiert-Fehler zu selten erkannt: ' + gefunden);

  let laenger = 0;
  for (let i = 0; i < 200; i++) {
    const a = aufgabeFuer('k6-dez-vergleichen/verschieden');
    for (const z of ['<', '>']) {
      const r = a.pruefe(z);
      if (r.fehler === 'laenger-groesser') laenger++;
    }
  }
  assert.ok(laenger > 110, 'Fehlvorstellung „länger = größer“ zu selten erkannt: ' + laenger);
});

test('Skills pro Klasse in Lehrplan-Reihenfolge', () => {
  const k1 = skillsFuerKlasse(1);
  assert.equal(k1[0], 'k1-mengen/bis5');
  assert.ok(k1.length >= 15);
  assert.ok(skillsFuerKlasse(6).includes('k6-bruch-addieren/mittel'));
});
