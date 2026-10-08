import test from 'node:test';
import assert from 'node:assert/strict';
import { sprechbar, bewerten } from '../src/ui/sprache.js';

test('Rechenaufgaben werden als Frage vorgelesen', () => {
  assert.equal(sprechbar('8 + 5 = ?'), 'Wie viel ist 8 plus 5?');
  assert.equal(sprechbar('13 − 5 = ?'), 'Wie viel ist 13 minus 5?');
  assert.equal(sprechbar('Rechne. 8 + 5'), 'Rechne. 8 plus 5');
  assert.equal(sprechbar('3,25 · 10 = 32,5'), '3 Komma 2 5 mal 10 ist gleich 32 Komma 5');
});

test('Natürliche Stimmen werden bevorzugt', () => {
  const st = (name, lang = 'de-DE') => ({ name, lang, voiceURI: name });
  const liste = [st('Anna'), st('Anna (Premium)'), st('Microsoft Katja Online (Natural) - German (Germany)'), st('Google Deutsch'), st('Flo (Deutsch (Deutschland))'), st('Florian (Enhanced)')];
  const sortiert = liste.slice().sort((a, b) => bewerten(b) - bewerten(a)).map((v) => v.name);
  assert.equal(sortiert[0], 'Microsoft Katja Online (Natural) - German (Germany)');
  assert.equal(sortiert[1], 'Anna (Premium)');
  assert.equal(sortiert[sortiert.length - 1], 'Flo (Deutsch (Deutschland))');
  assert.ok(bewerten(st('Florian (Enhanced)')) > bewerten(st('Anna')));
});

test('Zahlwörter', async () => {
  const { zahlwort } = await import('../src/core/ziffern.js');
  assert.equal(zahlwort(0), 'null');
  assert.equal(zahlwort(13), 'dreizehn');
  assert.equal(zahlwort(21), 'einundzwanzig');
  assert.equal(zahlwort(37), 'siebenunddreißig');
  assert.equal(zahlwort(60), 'sechzig');
  assert.equal(zahlwort(99), 'neunundneunzig');
});

test('Brüche werden als Wörter vorgelesen', async () => {
  const { bruchwort, htmlZuSprache } = await import('../src/ui/sprache.js');
  const { F, G, op, gl, Bruch } = await import('../src/core/bruch.js');
  assert.equal(bruchwort(1, 2), 'ein Halb');
  assert.equal(bruchwort(3, 2), 'drei Halbe');
  assert.equal(bruchwort(2, 3), 'zwei Drittel');
  assert.equal(bruchwort(6, 7), 'sechs Siebtel');
  assert.equal(bruchwort(5, 8), 'fünf Achtel');
  assert.equal(bruchwort(1, 12), 'ein Zwölftel');
  assert.equal(bruchwort(3, 20), 'drei Zwanzigstel');
  assert.equal(bruchwort(7, 100), 'sieben Hundertstel');
  assert.equal(bruchwort('?', 9), 'wie viele Neuntel');
  assert.equal(htmlZuSprache(`${F(6, 7)}${op('+')}${F(5, 8)}`), 'sechs Siebtel plus fünf Achtel');
  assert.equal(htmlZuSprache(G(new Bruch(11, 4))), '2 und drei Viertel');
  assert.equal(htmlZuSprache(`${F(3, 4)}${op('<')}${F(5, 6)}`), 'drei Viertel kleiner als fünf Sechstel');
  assert.equal(htmlZuSprache(gl(F(2, 3), F('?', 12))), 'zwei Drittel gleich wie viele Zwölftel');
});

test('Dezimalzahlen: Nachkommastellen einzeln', async () => {
  const { sprechbar } = await import('../src/ui/sprache.js');
  assert.equal(sprechbar('0,45'), '0 Komma 4 5');
  assert.equal(sprechbar('3,25 + 1,5'), '3 Komma 2 5 plus 1 Komma 5');
});
