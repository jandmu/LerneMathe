import { zahlAufgabe, S } from '../../core/aufgabe.js';
import { zehnerfeld, zellen } from '../../core/bilder.js';
import { zufall } from '../../core/util.js';

export function plus10(mitBild) {
  const a = zufall(1, 8);
  const b = zufall(1, 10 - a);
  const s = a + b;
  const weg = mitBild
    ? [S(`${a} rote Plättchen. ${b} blaue kommen dazu.`), S(`Zusammen sind es ${s}.`, `${a} + ${b} = ${s}`)]
    : [S(`Stell dir ${a} Plättchen im Zehnerfeld vor. ${b} kommen dazu.`), S(`Zusammen sind es ${s}.`, `${a} + ${b} = ${s}`)];
  if (a < b) weg.unshift(S(`Tipp: Fang mit der größeren Zahl an. ${b} + ${a} ergibt dasselbe und geht schneller.`));
  return zahlAufgabe({
    text: 'Rechne.',
    sprich: `Wie viel ist ${a} plus ${b}?`,
    rechnung: `${a} + ${b} = ?`,
    bild: mitBild ? zehnerfeld(zellen(10, ['rot', a], ['blau', b])) : '',
    loesung: s,
    hinweis: mitBild ? 'Wie viele Plättchen sind es zusammen? Denk an die volle Fünferreihe.' : 'Plus heißt: Es kommt etwas dazu. Stell dir das Zehnerfeld vor.',
    fehlbild: (n) => (a > b && n === a - b ? { text: 'Du hast minus gerechnet. Plus heißt: Es kommt etwas dazu.', fehler: 'minus-statt-plus' } : null),
    weg,
    ergebnis: String(s),
  });
}

export function minus10(mitBild) {
  const a = zufall(3, 10);
  const b = zufall(1, a - 1);
  const d = a - b;
  return zahlAufgabe({
    text: 'Rechne.',
    sprich: `Wie viel ist ${a} minus ${b}?`,
    rechnung: `${a} − ${b} = ?`,
    bild: mitBild ? zehnerfeld(zellen(10, ['rot', d], ['weg', b])) : '',
    loesung: d,
    hinweis: mitBild ? 'Wie viele Plättchen sind nicht durchgestrichen?' : `Minus heißt: Es wird etwas weggenommen. Von ${a} gehen ${b} weg.`,
    fehlbild: (n) => (n === a + b ? { text: 'Du hast plus gerechnet. Minus heißt: Es wird etwas weggenommen.', fehler: 'plus-statt-minus' } : null),
    weg: [
      S(`Es sind ${a} Plättchen. ${b} ${b === 1 ? 'wird' : 'werden'} weggenommen.`),
      S(`Übrig bleiben ${d}.`, `${a} − ${b} = ${d}`),
    ],
    ergebnis: String(d),
  });
}

export default {
  id: 'k1-plusminus10',
  klasse: 1,
  bereich: 'Rechnen',
  titel: 'Plus und Minus bis 10',
  kurz: 'Dazutun und Wegnehmen',
  symbol: () => zehnerfeld(zellen(10, ['rot', 4], ['blau', 3])),
  voraussetzungen: ['k1-zerlegen'],
  erklaerung: [
    { text: 'Plus heißt: Es kommt etwas dazu. 4 rote Plättchen, 3 blaue kommen dazu. Zusammen sind es 7.', rechnung: '4 + 3 = 7', bild: zehnerfeld(zellen(10, ['rot', 4], ['blau', 3])) },
    { text: 'Minus heißt: Es wird etwas weggenommen. Von 8 Plättchen nehmen wir 3 weg. Übrig bleiben 5.', rechnung: '8 − 3 = 5', bild: zehnerfeld(zellen(10, ['rot', 5], ['weg', 3])) },
    { text: 'Ein Trick: Bei Plus darfst du die Zahlen tauschen. 2 + 6 ist dasselbe wie 6 + 2. Fang mit der größeren Zahl an.', rechnung: '2 + 6 = 6 + 2' },
  ],
  stufen: [
    { id: 'plus-bild', titel: 'Plus mit Bild', aufgabe: () => plus10(true) },
    { id: 'minus-bild', titel: 'Minus mit Bild', aufgabe: () => minus10(true) },
    { id: 'gemischt', titel: 'Plus und Minus ohne Bild', aufgabe: () => (Math.random() < 0.5 ? plus10(false) : minus10(false)) },
  ],
};
