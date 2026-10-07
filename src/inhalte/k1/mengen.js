import { zahlAufgabe, S } from '../../core/aufgabe.js';
import { zehnerfeld, zwanzigerfeld, zellen } from '../../core/bilder.js';
import { zufall } from '../../core/util.js';

function wegZehnerfeld(n) {
  if (n === 5) return [S('Eine volle Reihe. Das sind 5.')];
  if (n < 5) return [S(`Eine volle Reihe wären 5. Hier fehlen ${5 - n}.`), S(`Also sind es ${n}.`)];
  if (n === 10) return [S('Beide Reihen sind voll: 5 und 5.'), S('Das sind 10.')];
  return [S(`Oben ist eine volle Reihe: 5. Unten sind noch ${n - 5}.`), S(`5 und ${n - 5} sind ${n}.`, `5 + ${n - 5} = ${n}`)];
}

function wegZwanzigerfeld(n) {
  if (n <= 10) {
    if (n === 10) return [S('Eine volle Reihe im Zwanzigerfeld. Das sind 10.')];
    if (n <= 5) return wegZehnerfeld(n);
    return [S(`Die ersten 5 sind voll. Dazu kommen noch ${n - 5}.`), S(`5 und ${n - 5} sind ${n}.`, `5 + ${n - 5} = ${n}`)];
  }
  const unten = n - 10;
  return [
    S('Oben ist eine volle Reihe. Das sind 10.'),
    S(`Unten sind noch ${unten}.`),
    S(`10 und ${unten} sind ${n}.`, `10 + ${unten} = ${n}`),
  ];
}

const HINWEIS = 'Zähle nicht einzeln. Suche zuerst volle Fünfer oder eine volle Zehnerreihe. Dann schau, was noch dazukommt.';

export default {
  id: 'k1-mengen',
  klasse: 1,
  bereich: 'Zahlen',
  titel: 'Mengen sehen',
  kurz: 'Wie viele sind es? Ohne Zählen!',
  erklaerung: [
    { text: 'Hier sind 5 Plättchen. Das ist eine volle Reihe. Du musst nicht zählen, du siehst es sofort.', bild: zehnerfeld(zellen(10, ['rot', 5])) },
    { text: 'Eine volle Reihe sind 5. Unten kommen noch 3 dazu. 5 und 3 sind 8.', bild: zehnerfeld(zellen(10, ['rot', 8])) },
    { text: 'Im Zwanzigerfeld hat eine Reihe 10 Plättchen. Oben 10, unten 4. Das sind 14.', bild: zwanzigerfeld(zellen(20, ['rot', 14])) },
  ],
  stufen: [
    {
      id: 'bis5',
      titel: 'Bis 5',
      aufgabe() {
        const n = zufall(1, 5);
        return zahlAufgabe({
          text: 'Wie viele Plättchen sind es?',
          bild: zehnerfeld(zellen(10, ['rot', n])),
          loesung: n,
          hinweis: HINWEIS,
          weg: wegZehnerfeld(n),
          ergebnis: String(n),
        });
      },
    },
    {
      id: 'bis10',
      titel: 'Bis 10',
      aufgabe() {
        const n = zufall(3, 10);
        return zahlAufgabe({
          text: 'Wie viele Plättchen sind es?',
          bild: zehnerfeld(zellen(10, ['rot', n])),
          loesung: n,
          hinweis: HINWEIS,
          weg: wegZehnerfeld(n),
          ergebnis: String(n),
        });
      },
    },
    {
      id: 'bis20',
      titel: 'Bis 20',
      aufgabe() {
        const n = zufall(6, 20);
        return zahlAufgabe({
          text: 'Wie viele Plättchen sind es?',
          bild: zwanzigerfeld(zellen(20, ['rot', n])),
          loesung: n,
          hinweis: HINWEIS,
          fehlbild: (a) =>
            n > 10 && a === n - 10 ? { text: 'Du hast die volle Reihe oben vergessen. Eine volle Reihe sind 10.', fehler: 'zehner-vergessen' } : null,
          weg: wegZwanzigerfeld(n),
          ergebnis: String(n),
        });
      },
    },
  ],
};
