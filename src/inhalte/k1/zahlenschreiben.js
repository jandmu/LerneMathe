/** Klasse 1: Ziffern schreiben (nachspuren) und Zahlen hören und schreiben (Zahlendiktat). */
import { zahlAufgabe, S } from '../../core/aufgabe.js';
import { zehnerfeld, zwanzigerfeld, zellen, spurBild, hoerSymbol } from '../../core/bilder.js';
import { pruefeSpur, SCHREIBWEG, zahlwort } from '../../core/ziffern.js';
import { zufall, wahl } from '../../core/util.js';

// ---------- Ziffern schreiben ----------

function zifferAufgabe(ziffern, hilfe) {
  const d = wahl(ziffern);
  const wort = zahlwort(d);
  return {
    text: `Schreib die ${d}. Fang beim grünen Punkt an.`,
    sprich: `Schreib die ${wort}. Fang beim grünen Punkt an.`,
    eingabe: { art: 'spur', ziffer: d, hilfe },
    loesung: d,
    pruefe: (striche) => pruefeSpur(d, striche),
    hinweis: SCHREIBWEG[d].join(' '),
    nachRichtig: `Schreib die ${d} jetzt noch dreimal in dein Heft.`,
    lob: ['Schön geschrieben!', 'Genau so!', 'Toll nachgespurt!', 'Super geschrieben!', 'Prima!'],
    weg: SCHREIBWEG[d].map((t, i) => S(t, i === 0 ? `<div class="spur-klein">${spurBild(d, 'voll')}</div>` : '')),
    ergebnis: `<span class="ziffer-gross">${d}</span>`,
    schluessel: `ziffer-${d}-${hilfe}`,
  };
}

export const ziffern = {
  id: 'k1-ziffern',
  klasse: 1,
  bereich: 'Zahlen',
  titel: 'Ziffern schreiben',
  kurz: 'Mit dem Finger nachspuren, dann ins Heft',
  symbol: () => spurBild(7, 'voll'),
  erklaerung: [
    { text: 'Jede Ziffer hat einen Anfang. Der grüne Punkt zeigt dir, wo du mit dem Finger anfängst.', bild: `<div class="spur-klein">${spurBild(1, 'voll')}</div>` },
    { text: 'Die Pfeile zeigen dir, in welche Richtung du schreibst. Manche Ziffern haben zwei Striche. Dann steht 1 und 2 an den Punkten.', bild: `<div class="spur-klein">${spurBild(7, 'voll')}</div>` },
    { text: 'Danach schreibst du die Ziffer noch in dein Heft. So lernt deine Hand sie am besten.' },
  ],
  stufen: [
    { id: 'gerade', titel: '1, 4 und 7', aufgabe: () => zifferAufgabe([1, 4, 7], 'voll') },
    { id: 'rund', titel: '0, 6 und 9', aufgabe: () => zifferAufgabe([0, 6, 9], 'voll') },
    { id: 'kurven', titel: '2, 3, 5 und 8', aufgabe: () => zifferAufgabe([2, 3, 5, 8], 'voll') },
    { id: 'wenig-hilfe', titel: 'Alle Ziffern mit wenig Hilfe', aufgabe: () => zifferAufgabe([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 'wenig') },
  ],
};

// ---------- Zahlen hören und schreiben ----------

function diktatAufgabe(min, max) {
  const n = zufall(min, max);
  const wort = zahlwort(n);
  const z = Math.floor(n / 10);
  const e = n % 10;
  const gedreht = e * 10 + z;
  const bild = n <= 10 ? zehnerfeld(zellen(10, ['rot', n])) : n <= 20 ? zwanzigerfeld(zellen(20, ['rot', n])) : '';
  const weg =
    n < 10
      ? [S(`Du hast „${wort}“ gehört.`), S(`So schreibt man ${wort}:`, `<span class="ziffer-gross">${n}</span>`)]
      : n === 10 || e === 0
        ? [S(`„${wort}“ – das sind ${z} Zehner und keine Einer.`, bild), S('Für die Einer schreibst du eine 0.', `<span class="ziffer-gross">${n}</span>`)]
        : [
            S(`„${wort}“ – das sind ${z} Zehner und ${e} Einer.`, bild),
            S(`Beim Sprechen hörst du zuerst die ${e}. Geschrieben wird aber zuerst der Zehner, dann die Einer.`, `<span class="stellen"><b>${z}</b> Zehner · <b>${e}</b> Einer → <span class="ziffer-gross">${n}</span></span>`),
          ];
  return zahlAufgabe({
    text: 'Hör gut zu und tippe die Zahl.',
    sprich: wort,
    immerVorlesen: true,
    wort,
    loesung: n,
    hinweis: n >= 10 ? 'Schreib zuerst die Zehner, dann die Einer. Hör noch einmal genau hin.' : 'Hör noch einmal genau hin.',
    fehlbild: (a) =>
      n > 10 && e !== 0 && e !== z && a === gedreht
        ? {
            text: `Zahlendreher! Bei „${wort}“ hörst du zuerst die ${e}. Geschrieben wird aber zuerst der Zehner: ${z}, dann die Einer: ${e}.`,
            fehler: 'zahlendreher',
          }
        : null,
    weg,
    ergebnis: `<span class="ziffer-gross">${n}</span>`,
    schluessel: `diktat-${n}`,
  });
}

export const diktat = {
  id: 'k1-diktat',
  klasse: 1,
  bereich: 'Zahlen',
  titel: 'Zahlen hören und schreiben',
  kurz: 'Zahlendiktat: Erst die Zehner, dann die Einer',
  symbol: () => hoerSymbol(13),
  voraussetzungen: ['k1-mengen'],
  erklaerung: [
    { text: 'Ich sage dir eine Zahl. Du tippst sie ein. Mit dem Lautsprecher kannst du sie noch einmal hören.' },
    {
      text: 'Bei dreizehn hörst du zuerst die drei. Aber du schreibst zuerst den Zehner, die 1. Dann die Einer, die 3. Also 13.',
      rechnung: '13',
      bild: zwanzigerfeld(zellen(20, ['rot', 13])),
    },
    { text: 'Bei vierundzwanzig ist es genauso: zuerst 2 Zehner, dann 4 Einer. Also 24.', rechnung: '24' },
  ],
  stufen: [
    { id: 'bis10', titel: 'Bis 10', aufgabe: () => diktatAufgabe(0, 10) },
    { id: 'bis20', titel: 'Bis 20', aufgabe: () => diktatAufgabe(11, 20) },
    { id: 'bis100', titel: 'Bis 100', aufgabe: () => diktatAufgabe(21, 99) },
  ],
};
