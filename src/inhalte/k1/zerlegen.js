import { zahlAufgabe, S } from '../../core/aufgabe.js';
import { zehnerfeld, zahlenhaus, zellen } from '../../core/bilder.js';
import { zufall } from '../../core/util.js';

/** Eine Zerlegungsaufgabe: dach = links + rechts, ein Zimmer ist gesucht. */
function hausAufgabe(dach, mitBild) {
  const bekannt = zufall(1, dach - 1);
  const gesucht = dach - bekannt;
  const linksGesucht = Math.random() < 0.4;
  const haus = linksGesucht ? zahlenhaus(dach, '?', bekannt) : zahlenhaus(dach, bekannt, '?');
  const feld = mitBild ? zehnerfeld(zellen(10, ['rot', bekannt], ['blau', gesucht])) : '';
  return zahlAufgabe({
    text: dach === 10 ? 'Was fehlt bis 10?' : 'Welche Zahl fehlt im Zahlenhaus?',
    sprich: `Im Dach steht ${dach}. In einem Zimmer steht ${bekannt}. Welche Zahl fehlt?`,
    bild: `<div class="bild-reihe">${haus}${feld}</div>`,
    loesung: gesucht,
    hinweis: mitBild
      ? `Schau ins Feld: ${bekannt} Plättchen sind rot. Wie viele sind blau?`
      : `Im Dach steht ${dach}. Was fehlt von ${bekannt} bis ${dach}? Stell dir das Zehnerfeld vor.`,
    fehlbild: (a) => {
      if (a === dach + bekannt) return { text: `Du hast ${dach} und ${bekannt} zusammengezählt. Gesucht ist, was von ${bekannt} bis ${dach} noch fehlt.`, fehler: 'zusammengezaehlt' };
      if (a === dach && bekannt > 0) return { text: `${dach} steht im Dach, das sind alle zusammen. Wie viele fehlen noch zur ${bekannt}?`, fehler: 'allgemein' };
      return null;
    },
    weg: [
      S(`Im Dach steht ${dach}. So viele sind es zusammen.`),
      S(`${bekannt} ${bekannt === 1 ? 'ist' : 'sind'} schon da. ${mitBild ? 'Die blauen Plättchen fehlen noch.' : `Von ${bekannt} bis ${dach} fehlen noch ${gesucht}.`}`),
      S(`${bekannt} und ${gesucht} sind ${dach}.`, `${bekannt} + ${gesucht} = ${dach}`),
    ],
    ergebnis: String(gesucht),
  });
}

export default {
  id: 'k1-zerlegen',
  klasse: 1,
  bereich: 'Zahlen',
  titel: 'Zahlen zerlegen',
  kurz: 'Das Zahlenhaus und die Zehnerfreunde',
  symbol: () => zahlenhaus(7, 4, 3),
  voraussetzungen: ['k1-mengen'],
  erklaerung: [
    { text: 'Das ist ein Zahlenhaus. Im Dach steht 7. In den Zimmern wohnen 4 und 3. Denn 4 und 3 sind zusammen 7.', bild: `<div class="bild-reihe">${zahlenhaus(7, 4, 3)}${zehnerfeld(zellen(10, ['rot', 4], ['blau', 3]))}</div>` },
    { text: '7 kann man auch anders zerlegen: 5 und 2. Oder 6 und 1. Es gibt viele Möglichkeiten.', bild: `<div class="bild-reihe">${zahlenhaus(7, 5, 2)}${zehnerfeld(zellen(10, ['rot', 5], ['blau', 2]))}</div>` },
    { text: 'Ganz wichtig sind die Zehnerfreunde. Zwei Zahlen, die zusammen 10 ergeben. 6 und 4 sind Zehnerfreunde.', bild: `<div class="bild-reihe">${zahlenhaus(10, 6, 4)}${zehnerfeld(zellen(10, ['rot', 6], ['blau', 4]))}</div>` },
  ],
  stufen: [
    { id: 'bis5', titel: 'Bis 5', aufgabe: () => hausAufgabe(zufall(2, 5), true) },
    { id: 'bis10', titel: 'Bis 10', aufgabe: () => hausAufgabe(zufall(6, 9), true) },
    { id: 'zehner', titel: 'Zehnerfreunde', aufgabe: () => hausAufgabe(10, true) },
    { id: 'zehner-ohne', titel: 'Zehnerfreunde ohne Bild', aufgabe: () => hausAufgabe(10, false) },
  ],
};
