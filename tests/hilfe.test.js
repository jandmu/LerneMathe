import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hilfeAktualisieren } from '../src/ui/ansicht-runde.js';
import { aufgabeFuer, hatBildHilfe, THEMEN } from '../src/inhalte/index.js';
import { rundeAuswerten } from '../src/core/lernplan.js';

test('Hilfe kommt nach zwei Fehlern in Folge und geht nach zwei Treffern mit Hilfe', () => {
  const s = { an: false, fehler: 0, treffer: 0 };
  assert.equal(hilfeAktualisieren(s, false, false), null);
  assert.equal(hilfeAktualisieren(s, true, false), null, 'Treffer dazwischen setzt die Fehlerfolge zurück');
  assert.equal(hilfeAktualisieren(s, false, false), null);
  assert.equal(hilfeAktualisieren(s, false, false), 'an');
  assert.equal(hilfeAktualisieren(s, true, true), null);
  assert.equal(hilfeAktualisieren(s, false, true), null, 'Fehler mit Hilfe: Hilfe bleibt');
  assert.equal(hilfeAktualisieren(s, true, true), null);
  assert.equal(hilfeAktualisieren(s, true, true), 'aus');
  assert.equal(s.an, false);
});

test('Stufen ohne Bild bekommen mit Hilfe das Bild zurück', () => {
  for (const id of ['k1-plusminus10/gemischt', 'k1-plus20/ohne-bild', 'k1-minus20/gemischt', 'k1-zerlegen/zehner-ohne']) {
    assert.ok(hatBildHilfe(id), id);
    for (let i = 0; i < 20; i++) {
      assert.doesNotMatch(aufgabeFuer(id).bild, /class="bild-svg feld/, id + ' ohne Hilfe hat ein Feld');
      const a = aufgabeFuer(id, { hilfe: true });
      assert.equal(a.hilfe, 'bild');
      assert.match(a.bild, /class="bild-svg feld/, id + ' mit Hilfe hat kein Feld');
    }
  }
  const z = aufgabeFuer('k1-ziffern/wenig-hilfe', { hilfe: true });
  assert.equal(z.eingabe.hilfe, 'voll');
});

test('Ohne Bild-Variante gibt es den ersten Schritt als Tipp, der die Lösung nicht verrät', () => {
  for (const t of THEMEN) {
    for (const s of t.stufen) {
      const id = `${t.id}/${s.id}`;
      if (hatBildHilfe(id)) continue;
      for (let i = 0; i < 10; i++) {
        const a = aufgabeFuer(id, { hilfe: true });
        assert.equal(a.hilfe, 'tipp');
        if (a.tipp) assert.notEqual(a.tipp, a.weg[a.weg.length - 1], id);
      }
    }
  }
});

test('Richtige Antworten mit Hilfe zählen nicht für den Aufstieg', () => {
  const jetzt = Date.UTC(2026, 9, 8, 10);
  const start = () => ({ skills: { x: { fach: 1, faellig: 0, versuche: 2, richtig: 1, zuletzt: 0, verlauf: [], fehler: {} } }, ereignisse: [] });
  const f = start();
  const [ae] = rundeAuswerten(f, [{ skill: 'x', richtig: true, hilfe: true }, { skill: 'x', richtig: true, hilfe: true }], jetzt);
  assert.equal(ae.nachher, 1, 'nur mit Hilfe gelöst: nicht aufsteigen, aber begonnen');
  const g = start();
  const [b] = rundeAuswerten(g, [{ skill: 'x', richtig: true, hilfe: true }, { skill: 'x', richtig: true }], jetzt);
  assert.equal(b.nachher, 2, 'ohne Hilfe gelöst: steigt');
});
