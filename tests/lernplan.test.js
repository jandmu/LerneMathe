import test from 'node:test';
import assert from 'node:assert/strict';
import { zustand, antwortEintragen, rundeAuswerten, faellige, empfehlung, rundePlanen, status, SITZT_AB } from '../src/core/lernplan.js';
import { leererFortschritt, Datenbank, SpeicherBackend } from '../src/core/speicher.js';
import { TAG_MS } from '../src/core/util.js';
import { lies, zeige } from '../src/core/dezimal.js';

const T0 = new Date(2026, 9, 7, 15, 0).getTime();

function runde(f, skill, richtig, falsch, jetzt) {
  const erg = [];
  for (let i = 0; i < richtig; i++) erg.push({ skill, richtig: true });
  for (let i = 0; i < falsch; i++) erg.push({ skill, richtig: false });
  for (const e of erg) antwortEintragen(f, skill, { richtig: e.richtig, fehler: e.richtig ? null : 'um-eins', jetzt });
  return rundeAuswerten(f, erg, jetzt);
}

test('Lernkartei: an einem Tag höchstens bis „fast sicher“, „sitzt“ erst nach Wiederholung am nächsten Tag', () => {
  const f = leererFortschritt();
  runde(f, 'a/1', 8, 0, T0);
  assert.equal(zustand(f, 'a/1').fach, 1);
  runde(f, 'a/1', 8, 0, T0 + 1000);
  assert.equal(zustand(f, 'a/1').fach, 2);
  runde(f, 'a/1', 8, 0, T0 + 2000);
  assert.equal(zustand(f, 'a/1').fach, 2, 'darf am selben Tag nicht weiter steigen');
  assert.equal(status(zustand(f, 'a/1'), T0 + 3000), 'fast');
  runde(f, 'a/1', 8, 0, T0 + TAG_MS);
  assert.equal(zustand(f, 'a/1').fach, SITZT_AB);
  assert.equal(status(zustand(f, 'a/1'), T0 + TAG_MS + 1000), 'sitzt');
});

test('Lernkartei: viele Fehler lassen eine Fertigkeit absteigen, aber nie unter Fach 1', () => {
  const f = leererFortschritt();
  f.skills['a/1'] = { ...zustand(f, 'a/1'), fach: 4, faellig: T0 };
  runde(f, 'a/1', 2, 6, T0);
  assert.equal(zustand(f, 'a/1').fach, 3);
  runde(f, 'a/1', 0, 5, T0);
  runde(f, 'a/1', 0, 5, T0);
  runde(f, 'a/1', 0, 5, T0);
  assert.equal(zustand(f, 'a/1').fach, 1);
  assert.equal(zustand(f, 'a/1').fehler['um-eins'], 21);
});

test('Fällige Wiederholungen und Empfehlung', () => {
  const f = leererFortschritt();
  const ids = ['a/1', 'a/2', 'b/1'];
  assert.equal(empfehlung(ids, f, T0), 'a/1');
  runde(f, 'a/1', 8, 0, T0);
  runde(f, 'a/1', 8, 0, T0);
  assert.equal(empfehlung(ids, f, T0), 'a/2', 'nach „fast sicher“ geht es weiter');
  assert.deepEqual(faellige(f, ids, T0), []);
  assert.deepEqual(faellige(f, ids, T0 + 2 * TAG_MS), ['a/1']);
});

test('Rundenplanung: Fokus plus eingestreute Wiederholungen', () => {
  const f = leererFortschritt();
  for (const id of ['a/1', 'a/2', 'b/1']) {
    runde(f, id, 8, 0, T0);
  }
  const plan = rundePlanen({ skillIds: ['a/1', 'a/2', 'b/1', 'c/1'], f, fokus: 'c/1', anzahl: 10, jetzt: T0 + 3 * TAG_MS });
  assert.equal(plan.length, 10);
  assert.equal(plan.filter((x) => x === 'c/1').length, 8);
  assert.deepEqual(plan.slice(0, 2), ['c/1', 'c/1']);
  const mix = rundePlanen({ skillIds: ['a/1', 'a/2', 'b/1', 'c/1'], f, anzahl: 9, jetzt: T0 + 3 * TAG_MS });
  assert.equal(mix.length, 9);
  assert.equal(new Set(mix).size, 3, 'gemischte Runde nutzt alle fälligen Fertigkeiten');
  for (let i = 2; i < mix.length; i++) assert.ok(!(mix[i] === mix[i - 1] && mix[i] === mix[i - 2]), 'nicht dreimal hintereinander');
});

test('Rundenplanung ohne Fortschritt startet mit der ersten Fertigkeit', () => {
  const plan = rundePlanen({ skillIds: ['a/1', 'a/2'], f: leererFortschritt(), anzahl: 8, jetzt: T0 });
  assert.deepEqual([...new Set(plan)], ['a/1']);
});

test('Datenbank: Profile, Fortschritt, Export und Import', async () => {
  const db = new Datenbank(new SpeicherBackend());
  await db.profilSpeichern({ id: 'p1', name: 'Mia', klasse: 1, farbe: 0, vorlesen: true });
  await db.profilSpeichern({ id: 'p2', name: 'Ben', klasse: 1, farbe: 1, vorlesen: true });
  await db.profilSpeichern({ id: 'p1', name: 'Mia', klasse: 2, farbe: 0, vorlesen: true });
  assert.equal((await db.profile()).length, 2);
  assert.equal((await db.profil('p1')).klasse, 2);

  const f = await db.fortschritt('p1');
  antwortEintragen(f, 'x/1', { richtig: true, jetzt: T0 });
  await db.fortschrittSpeichern('p1', f);
  assert.equal((await db.fortschritt('p1')).ereignisse.length, 1);

  const sicherung = await db.exportieren();
  const db2 = new Datenbank(new SpeicherBackend());
  await db2.importieren(JSON.parse(JSON.stringify(sicherung)));
  assert.equal((await db2.profile()).length, 2);
  assert.equal((await db2.fortschritt('p1')).skills['x/1'].richtig, 1);

  await db.profilLoeschen('p1');
  assert.equal((await db.profile()).length, 1);
  assert.equal((await db.fortschritt('p1')).ereignisse.length, 0);
  await assert.rejects(db.importieren({ foo: 1 }));
});

test('Dezimalzahlen: lesen und anzeigen exakt', () => {
  assert.equal(lies('3,25'), 3250000);
  assert.equal(lies('3.25'), 3250000);
  assert.equal(lies(',5'), 500000);
  assert.ok(Number.isNaN(lies('3,2,5')));
  assert.ok(Number.isNaN(lies('')));
  assert.equal(zeige(lies('0,1') + lies('0,2')), '0,3');
  assert.equal(zeige(3500000, 2), '3,50');
  assert.equal(zeige(7000000), '7');
});
