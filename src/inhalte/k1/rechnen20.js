import { zahlAufgabe, S } from '../../core/aufgabe.js';
import { zwanzigerfeld, zellen } from '../../core/bilder.js';
import { zufall, wahl } from '../../core/util.js';

// ---------- Plus ----------

function plusOhne(mitBild) {
  const e = zufall(1, 7);
  const a = 10 + e;
  const b = zufall(1, 9 - e);
  const s = a + b;
  return zahlAufgabe({
    text: 'Rechne.',
    sprich: `Wie viel ist ${a} plus ${b}?`,
    rechnung: `${a} + ${b} = ?`,
    bild: mitBild ? zwanzigerfeld(zellen(20, ['rot', a], ['blau', b])) : '',
    loesung: s,
    hinweis: `Rechne nur mit den Einern: ${e} + ${b}. Der Zehner bleibt.`,
    fehlbild: (n) => (n === e + b && e + b !== s ? { text: `Fast: ${e} + ${b} = ${e + b} stimmt. Aber der Zehner fehlt noch!`, fehler: 'zehner-vergessen' } : null),
    weg: [
      S(`${a} ist 10 und ${e}.`),
      S(`Rechne mit den Einern: ${e} + ${b} = ${e + b}.`),
      S(`Der Zehner bleibt: 10 + ${e + b} = ${s}.`, `${a} + ${b} = ${s}`),
    ],
    ergebnis: String(s),
  });
}

function verdoppeln(mitBild) {
  const a = zufall(2, 9);
  const fastDoppel = Math.random() < 0.5;
  const b = fastDoppel ? a + 1 : a;
  const s = a + b;
  const feld = Array(20).fill('leer');
  for (let i = 0; i < a; i++) feld[i] = 'rot';
  for (let i = 0; i < b; i++) feld[10 + i] = 'blau';
  return zahlAufgabe({
    text: fastDoppel ? 'Rechne. Denk ans Verdoppeln!' : 'Verdopple.',
    sprich: `Wie viel ist ${a} plus ${b}?`,
    rechnung: `${a} + ${b} = ?`,
    bild: mitBild ? zwanzigerfeld(feld) : '',
    loesung: s,
    hinweis: fastDoppel ? `${b} ist eins mehr als ${a}. Rechne zuerst ${a} + ${a}, dann eins dazu.` : `Verdoppeln heißt: ${a} und noch einmal ${a}.`,
    weg: fastDoppel
      ? [
          S(`${b} ist eins mehr als ${a}. Rechne zuerst das Doppelte: ${a} + ${a} = ${2 * a}.`),
          S(`Dann noch eins dazu: ${2 * a} + 1 = ${s}.`, `${a} + ${b} = ${s}`),
        ]
      : [S(`Verdoppeln: ${a} und noch einmal ${a}.`), S(`Das sind ${s}.`, `${a} + ${a} = ${s}`)],
    ergebnis: String(s),
  });
}

function plusUeber(mitBild) {
  const a = zufall(3, 9);
  const b = zufall(11 - a, 9);
  const f = 10 - a;
  const r = b - f;
  const s = a + b;
  return zahlAufgabe({
    text: 'Rechne. Fülle zuerst bis zur 10 auf.',
    sprich: `Wie viel ist ${a} plus ${b}?`,
    rechnung: `${a} + ${b} = ?`,
    bild: mitBild ? zwanzigerfeld(zellen(20, ['rot', a], ['blau', b])) : '',
    loesung: s,
    hinweis: `Wie viel fehlt von ${a} bis 10? Das sind ${f}. Zerlege die ${b} in ${f} und den Rest.`,
    fehlbild: (n) => (n === r ? { text: `${r} ist der Rest nach der 10. Die 10 musst du noch dazurechnen!`, fehler: 'zehner-vergessen' } : null),
    weg: [
      S(`Von ${a} bis 10 fehlen ${f}.`),
      S(`Zerlege die ${b}: ${b} ist ${f} und ${r}.`),
      S(`Fülle zuerst auf: ${a} + ${f} = 10.`),
      S(`Dann den Rest dazu: 10 + ${r} = ${s}.`, `${a} + ${b} = ${a} + ${f} + ${r} = ${s}`),
    ],
    ergebnis: String(s),
  });
}

// ---------- Minus ----------

function minusOhne(mitBild) {
  const e = zufall(1, 9);
  const a = 10 + e;
  const zehnerWeg = Math.random() < 0.15;
  const b = zehnerWeg ? 10 : zufall(1, e);
  const d = a - b;
  return zahlAufgabe({
    text: 'Rechne.',
    sprich: `Wie viel ist ${a} minus ${b}?`,
    rechnung: `${a} − ${b} = ?`,
    bild: mitBild ? zwanzigerfeld(zellen(20, ['rot', d], ['weg', b])) : '',
    loesung: d,
    hinweis: zehnerWeg ? 'Wenn der ganze Zehner weggeht, bleiben nur die Einer übrig.' : `Rechne nur mit den Einern: ${e} − ${b}. Der Zehner bleibt.`,
    fehlbild: (n) => {
      if (n === a + b) return { text: 'Du hast plus gerechnet. Minus heißt wegnehmen.', fehler: 'plus-statt-minus' };
      if (!zehnerWeg && n === e - b && n !== d) return { text: `${e} − ${b} = ${e - b} stimmt. Aber der Zehner bleibt doch da!`, fehler: 'zehner-vergessen' };
      return null;
    },
    weg: zehnerWeg
      ? [S(`${a} ist 10 und ${e}.`), S(`Der Zehner geht weg. Übrig bleiben ${e}.`, `${a} − 10 = ${d}`)]
      : [S(`${a} ist 10 und ${e}.`), S(`Rechne mit den Einern: ${e} − ${b} = ${e - b}.`), S(`Der Zehner bleibt: 10 + ${e - b} = ${d}.`, `${a} − ${b} = ${d}`)],
    ergebnis: String(d),
  });
}

function minusUeber(mitBild) {
  const e = zufall(1, 8);
  const a = 10 + e;
  const b = zufall(e + 1, 9);
  const r = b - e;
  const d = a - b;
  return zahlAufgabe({
    text: 'Rechne. Geh zuerst zurück bis zur 10.',
    sprich: `Wie viel ist ${a} minus ${b}?`,
    rechnung: `${a} − ${b} = ?`,
    bild: mitBild ? zwanzigerfeld(zellen(20, ['rot', d], ['weg', b])) : '',
    loesung: d,
    hinweis: `Nimm zuerst die ${e} Einer weg, dann bist du bei 10. Dann fehlen noch ${r}.`,
    fehlbild: (n) => {
      if (n === 10 + (b - e)) {
        return {
          text: `Du hast ${b} − ${e} gerechnet. Das geht hier nicht: Von ${e} kann man nicht ${b} wegnehmen. Geh zuerst zurück bis zur 10.`,
          fehler: 'einer-vertauscht',
        };
      }
      if (n === a + b) return { text: 'Du hast plus gerechnet. Minus heißt wegnehmen.', fehler: 'plus-statt-minus' };
      return null;
    },
    weg: [
      S(`Zerlege die ${b}: ${b} ist ${e} und ${r}.`),
      S(`Geh zuerst zurück bis zur 10: ${a} − ${e} = 10.`),
      S(`Dann noch ${r} weg: 10 − ${r} = ${d}.`, `${a} − ${b} = ${a} − ${e} − ${r} = ${d}`),
    ],
    ergebnis: String(d),
  });
}

export const plus20 = {
  id: 'k1-plus20',
  klasse: 1,
  bereich: 'Rechnen',
  titel: 'Plus bis 20',
  kurz: 'Verdoppeln und über die 10 rechnen',
  voraussetzungen: ['k1-plusminus10'],
  erklaerung: [
    { text: '13 plus 4. Die 10 bleibt einfach stehen. Rechne nur 3 plus 4, das ist 7. Also 17.', rechnung: '13 + 4 = 17', bild: zwanzigerfeld(zellen(20, ['rot', 13], ['blau', 4])) },
    { text: 'Verdoppeln ist leicht: 6 plus 6 sind 12. Und 6 plus 7 ist nur eins mehr, also 13.', rechnung: '6 + 7 = 13', bild: zwanzigerfeld(['rot', 'rot', 'rot', 'rot', 'rot', 'rot', 'leer', 'leer', 'leer', 'leer', 'blau', 'blau', 'blau', 'blau', 'blau', 'blau', 'blau', 'leer', 'leer', 'leer']) },
    { text: '8 plus 5. Fülle zuerst die Reihe bis 10 auf. Dafür brauchst du 2. Von der 5 bleiben dann noch 3. 10 und 3 sind 13.', rechnung: '8 + 5 = 8 + 2 + 3 = 13', bild: zwanzigerfeld(zellen(20, ['rot', 8], ['blau', 5])) },
  ],
  stufen: [
    { id: 'ohne', titel: 'Ohne Zehnerübergang', aufgabe: () => plusOhne(true) },
    { id: 'verdoppeln', titel: 'Verdoppeln', aufgabe: () => verdoppeln(true) },
    { id: 'uebergang', titel: 'Über die 10', aufgabe: () => plusUeber(true) },
    { id: 'ohne-bild', titel: 'Alles ohne Bild', aufgabe: () => wahl([plusOhne, verdoppeln, plusUeber, plusUeber])(false) },
  ],
};

export const minus20 = {
  id: 'k1-minus20',
  klasse: 1,
  bereich: 'Rechnen',
  titel: 'Minus bis 20',
  kurz: 'Zurück über die 10 rechnen',
  voraussetzungen: ['k1-plus20'],
  erklaerung: [
    { text: '17 minus 5. Die 10 bleibt stehen. Rechne nur 7 minus 5, das ist 2. Also 12.', rechnung: '17 − 5 = 12', bild: zwanzigerfeld(zellen(20, ['rot', 12], ['weg', 5])) },
    { text: '13 minus 5. Nimm zuerst die 3 weg, dann bist du bei 10. Von der 5 fehlen noch 2. 10 minus 2 sind 8.', rechnung: '13 − 5 = 13 − 3 − 2 = 8', bild: zwanzigerfeld(zellen(20, ['rot', 8], ['weg', 5])) },
  ],
  stufen: [
    { id: 'ohne', titel: 'Ohne Zehnerübergang', aufgabe: () => minusOhne(true) },
    { id: 'uebergang', titel: 'Zurück über die 10', aufgabe: () => minusUeber(true) },
    { id: 'gemischt', titel: 'Plus und Minus gemischt', aufgabe: () => wahl([plusOhne, plusUeber, verdoppeln, minusOhne, minusUeber, minusUeber])(false) },
  ],
};
