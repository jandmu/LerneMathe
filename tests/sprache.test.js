import test from 'node:test';
import assert from 'node:assert/strict';
import { sprechbar, bewerten } from '../src/ui/sprache.js';

test('Rechenaufgaben werden als Frage vorgelesen', () => {
  assert.equal(sprechbar('8 + 5 = ?'), 'Wie viel ist 8 plus 5?');
  assert.equal(sprechbar('13 − 5 = ?'), 'Wie viel ist 13 minus 5?');
  assert.equal(sprechbar('Rechne. 8 + 5'), 'Rechne. 8 plus 5');
  assert.equal(sprechbar('3,25 · 10 = 32,5'), '3 Komma 25 mal 10 ist gleich 32 Komma 5');
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
