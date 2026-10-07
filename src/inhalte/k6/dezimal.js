/** Klasse 6: Dezimalzahlen. */
import { dezimalAufgabe, auswahlAufgabe, bruchAufgabe, S } from '../../core/aufgabe.js';
import { SKALA, zeige, stellen, lies } from '../../core/dezimal.js';
import { Bruch, F, gl, op, hl } from '../../core/bruch.js';
import { zufall, wahl } from '../../core/util.js';

const NAME = { 1: 'Zehntel', 2: 'Hundertstel', 3: 'Tausendstel' };
const ZEHNER = { 1: 10, 2: 100, 3: 1000 };

/** Zufällige Dezimalzahl mit genau `st` Nachkommastellen (letzte Ziffer ≠ 0). */
function zufallDez(ganzeMin, ganzeMax, st) {
  let nach;
  do {
    nach = zufall(1, 10 ** st - 1);
  } while (nach % 10 === 0);
  return zufall(ganzeMin, ganzeMax) * SKALA + nach * 10 ** (6 - st);
}

/** Stellenwerttafel für eine Dezimalzahl. */
function stellentafel(wert, st = stellen(wert)) {
  const t = zeige(wert, st);
  const [g, n = ''] = t.split(',');
  const koepfe = ['H', 'Z', 'E'].slice(3 - Math.max(1, g.length)).concat(['z', 'h', 't'].slice(0, Math.max(1, n.length)));
  const ziffern = g.split('').concat(n.padEnd(Math.max(1, n.length), '0').split(''));
  return `<div class="tabelle-rahmen"><table class="stellentafel"><thead><tr>${koepfe
    .map((k, i) => `<th${i === g.length - 1 ? ' class="komma-rechts"' : ''}>${k}</th>`)
    .join('')}</tr></thead><tbody><tr>${ziffern
    .map((z, i) => `<td${i === g.length - 1 ? ' class="komma-rechts"' : ''}>${z}</td>`)
    .join('')}</tr></tbody></table></div>`;
}

/** Schriftliche Darstellung untereinander, Komma unter Komma. */
function untereinander(a, b, zeichen, ergebnis) {
  const m = Math.max(stellen(a), stellen(b), stellen(ergebnis), 1);
  const zeile = (w, z = '') => `<tr><td class="s-op">${z}</td><td>${zeige(w, m)}</td></tr>`;
  return `<table class="schriftlich">${zeile(a)}${zeile(b, zeichen)}<tr class="s-strich"><td></td><td></td></tr>${zeile(ergebnis)}</table>`;
}

// ---------- Dezimalzahlen verstehen ----------

function zehntelAufgabe() {
  if (Math.random() < 0.5) {
    const z = Math.random() < 0.7 ? zufall(1, 9) : zufall(11, 39);
    const w = z * (SKALA / 10);
    return dezimalAufgabe({
      text: 'Schreibe als Dezimalzahl.',
      rechnung: gl(F(z, 10), '?'),
      loesung: w,
      hinweis: 'Zehntel stehen an der ersten Stelle nach dem Komma.',
      weg: [S(`Der Nenner 10 bedeutet: ${z} Zehntel.`), S('Zehntel stehen an der ersten Stelle nach dem Komma.', gl(F(z, 10), zeige(w))), S('In der Stellenwerttafel:', stellentafel(w, 1))],
      ergebnis: zeige(w),
    });
  }
  const z = zufall(1, 9);
  const w = z * (SKALA / 10);
  return bruchAufgabe({
    text: 'Schreibe als Bruch mit dem Nenner 10.',
    rechnung: gl(zeige(w), F('?', 10)),
    loesung: new Bruch(z, 10),
    eingabe: { nennerFest: 10, ohneGanze: true },
    hinweis: 'Die erste Stelle nach dem Komma gibt die Zehntel an.',
    weg: [S(`Die erste Stelle nach dem Komma ist ${z}. Das sind ${z} Zehntel.`, stellentafel(w, 1)), S('Also:', gl(zeige(w), F(z, 10)))],
    ergebnis: F(z, 10),
  });
}

function hundertstelAufgabe() {
  const z = Math.random() < 0.35 ? zufall(1, 9) : zufall(11, 99);
  const w = z * (SKALA / 100);
  return dezimalAufgabe({
    text: 'Schreibe als Dezimalzahl.',
    rechnung: gl(F(z, 100), '?'),
    loesung: w,
    hinweis: 'Hundertstel stehen an der zweiten Stelle nach dem Komma.',
    fehlbild: (a) =>
      z < 10 && a === z * (SKALA / 10)
        ? { text: `${zeige(a)} wären ${z} Zehntel. Hier sind es aber ${z} Hundertstel: Die Zehntelstelle bleibt 0.`, fehler: 'komma-falsch' }
        : null,
    weg: [
      S(`Der Nenner 100 bedeutet: ${z} Hundertstel.`),
      S(z < 10 ? `Es gibt keine ganzen Zehntel, also steht an der Zehntelstelle eine 0.` : `${z} Hundertstel sind ${Math.floor(z / 10)} Zehntel und ${z % 10} Hundertstel.`, stellentafel(w, 2)),
      S('Also:', gl(F(z, 100), zeige(w))),
    ],
    ergebnis: zeige(w),
  });
}

const GEWOEHNLICHE = [
  [1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 20], [3, 20], [7, 20], [1, 25], [3, 25], [1, 8], [3, 8], [3, 50], [9, 50],
];

function bruchZuDezimal() {
  const [z, n] = wahl(GEWOEHNLICHE);
  const N = [10, 100, 1000].find((x) => x % n === 0);
  const k = N / n;
  const st = String(N).length - 1;
  const w = (z * k * SKALA) / N;
  return dezimalAufgabe({
    text: 'Schreibe als Dezimalzahl.',
    rechnung: gl(F(z, n), '?'),
    loesung: w,
    hinweis: `Erweitere den Bruch so, dass im Nenner 10, 100 oder 1000 steht.`,
    fehlbild: (a) => {
      if (a === lies(`0,${z}${n}`) || a === lies(`${z},${n}`)) {
        return { text: 'Zähler und Nenner hintereinander geschrieben ergibt keine Dezimalzahl. Erweitere zuerst auf 10, 100 oder 1000.', fehler: 'komma-falsch' };
      }
      return null;
    },
    weg: [
      S(`Erweitere auf den Nenner ${N}: ${n} · ${k} = ${N}.`, gl(F(z, n), F(`${z} · ${k}`, `${n} · ${k}`), F(z * k, N))),
      S(`${z * k} ${NAME[st]} schreibt man so:`, gl(F(z * k, N), zeige(w, st))),
    ],
    ergebnis: zeige(w),
  });
}

// ---------- Vergleichen ----------

const VERGLEICH = [
  { wert: '<', html: '&lt;', label: 'kleiner als' },
  { wert: '=', html: '=', label: 'gleich' },
  { wert: '>', html: '&gt;', label: 'größer als' },
];

function vergleichAufgabe(art) {
  let a;
  let b;
  let nullen = false;
  if (art === 'gleich') {
    const st = zufall(1, 2);
    const g = zufall(0, 9);
    do {
      a = zufallDez(g, g, st);
      b = zufallDez(g, g, st);
    } while (a === b);
  } else if (art === 'verschieden') {
    // Die Fehlvorstellung „mehr Ziffern = größer“ gezielt aufgreifen: meist ist die kürzere Zahl größer.
    const g = zufall(0, 5);
    const d = zufall(1, 9);
    a = g * SKALA + d * 10 ** 5;
    const kuerzerGroesser = Math.random() < 0.7;
    let x;
    do {
      x = kuerzerGroesser ? zufall(1, d * 10 - 1) : zufall(d * 10 + 1, 99);
    } while (x % 10 === 0);
    b = g * SKALA + x * 10 ** 4;
    if (Math.random() < 0.5) [a, b] = [b, a];
  } else {
    const st = zufall(1, 2);
    a = zufallDez(0, 3, st);
    if (Math.random() < 0.35) {
      b = a;
      nullen = true;
    }
    else b = zufallDez(Math.floor(a / SKALA), Math.floor(a / SKALA), 3);
    if (Math.random() < 0.5) [a, b] = [b, a];
  }
  const zeichen = a < b ? '<' : a > b ? '>' : '=';
  const za = zeige(a);
  const zb = nullen ? zeige(b, stellen(b) + 1) : zeige(b);
  const m = Math.max(stellen(a), stellen(b), 1);
  const ga = Math.floor(a / SKALA);
  const gb = Math.floor(b / SKALA);
  const weg = [];
  if (ga !== gb) {
    weg.push(S(`Vergleiche zuerst die Ganzen: ${ga} und ${gb}.`, `${ga}${op(zeichen)}${gb}`));
  } else {
    weg.push(S(`Die Ganzen sind gleich (${ga}). Fülle mit Nullen auf, bis beide gleich viele Stellen nach dem Komma haben.`, `${zeige(a, m)} und ${zeige(b, m)}`));
    const ia = Math.round((a % SKALA) / 10 ** (6 - m));
    const ib = Math.round((b % SKALA) / 10 ** (6 - m));
    weg.push(S(`Jetzt vergleichst du ${ia} ${NAME[m]} mit ${ib} ${NAME[m]}.`, `${ia}${op(zeichen)}${ib}`));
  }
  const la = za.length;
  const lb = zb.length;
  const laenger = la > lb ? '>' : la < lb ? '<' : null;
  return auswahlAufgabe({
    text: 'Welches Zeichen gehört in die Lücke?',
    rechnung: `${za}<span class="luecke" aria-label="Lücke">?</span>${zb}`,
    eingabe: { art: 'auswahl', optionen: VERGLEICH, gross: true },
    loesung: zeichen,
    hinweis: 'Fülle mit Nullen auf, bis beide Zahlen gleich viele Nachkommastellen haben. Dann vergleiche.',
    fehlerArt: 'vergleich-falsch',
    fehlbild: (antwort) =>
      laenger && antwort === laenger
        ? { text: 'Mehr Ziffern heißt nicht größer! Fülle mit Nullen auf: Dann siehst du, welche Zahl wirklich größer ist.', fehler: 'laenger-groesser' }
        : null,
    weg: weg.concat(S('Ergebnis:', `${za}${op(zeichen)}${zb}`)),
    ergebnis: `${za}${op(zeichen)}${zb}`,
  });
}

// ---------- Addieren und Subtrahieren ----------

function plusMinusAufgabe(art) {
  const plus = Math.random() < 0.5;
  let a;
  let b;
  if (art === 'gleich') {
    const st = zufall(1, 2);
    a = zufallDez(0, 9, st);
    b = zufallDez(0, 9, st);
  } else if (art === 'verschieden') {
    a = zufallDez(0, 9, 1);
    b = zufallDez(0, 9, 2);
    if (Math.random() < 0.5) [a, b] = [b, a];
  } else {
    a = Math.random() < 0.4 ? zufall(2, 20) * SKALA : zufallDez(1, 30, zufall(1, 2));
    b = zufallDez(0, 9, zufall(1, 3));
  }
  if (!plus && b > a) [a, b] = [b, a];
  const r = plus ? a + b : a - b;
  const zeichen = plus ? '+' : '−';
  const sa = stellen(a);
  const sb = stellen(b);
  const m = Math.max(sa, sb);
  const falschAusgerichtet = (() => {
    if (sa === sb) return null;
    const ia = a / 10 ** (6 - Math.max(sa, 0));
    const ib = b / 10 ** (6 - Math.max(sb, 0));
    const x = plus ? ia + ib : ia - ib;
    return x >= 0 ? x * 10 ** (6 - m) : null;
  })();
  return dezimalAufgabe({
    text: plus ? 'Addiere.' : 'Subtrahiere.',
    rechnung: `${zeige(a)} ${op(plus ? '+' : '-')} ${zeige(b)} = ?`,
    loesung: r,
    hinweis: 'Schreibe die Zahlen untereinander: Komma unter Komma. Fehlende Stellen füllst du mit Nullen auf.',
    fehlbild: (w) =>
      falschAusgerichtet !== null && w === falschAusgerichtet && w !== r
        ? { text: 'Die Zahlen standen nicht Komma unter Komma. Zehntel müssen unter Zehnteln stehen, Hundertstel unter Hundertsteln.', fehler: 'komma-falsch' }
        : null,
    weg: [
      S(`Schreibe die Zahlen untereinander: Komma unter Komma.${sa !== sb || m === 0 ? ' Fülle fehlende Stellen mit Nullen auf.' : ''}`, untereinander(a, b, zeichen, r)),
      S('Rechne wie mit ganzen Zahlen und setze das Komma im Ergebnis an dieselbe Stelle.', `${zeige(a)} ${op(plus ? '+' : '-')} ${zeige(b)} = ${zeige(r)}`),
    ],
    ergebnis: zeige(r),
  });
}

// ---------- Mal und geteilt durch 10, 100, 1000 ----------

function zehnerAufgabe(art) {
  const mal = art === 'mal' ? true : art === 'geteilt' ? false : Math.random() < 0.5;
  const k = zufall(1, 3);
  const f = 10 ** k;
  const a = zufallDez(0, mal ? 50 : 900, zufall(1, 3));
  const r = mal ? a * f : a / f;
  const andersrum = mal ? a / f : a * f;
  const richtung = mal ? 'nach rechts' : 'nach links';
  return dezimalAufgabe({
    text: 'Rechne im Kopf.',
    rechnung: `${zeige(a)} ${op(mal ? '*' : ':')} ${f.toLocaleString('de-DE')} = ?`,
    loesung: r,
    hinweis: `Bei ${mal ? 'mal' : 'geteilt durch'} ${f} rückt das Komma ${k} ${k === 1 ? 'Stelle' : 'Stellen'} ${richtung}.`,
    fehlbild: (w) => {
      if (Number.isInteger(andersrum) && w === andersrum) return { text: `Das Komma ist in die falsche Richtung gewandert. ${mal ? 'Mal' : 'Geteilt durch'} ${f} heißt: ${richtung}.`, fehler: 'komma-richtung' };
      if (w === a) return { text: 'Bei Dezimalzahlen ändert eine angehängte Null nichts am Wert. Verschiebe das Komma.', fehler: 'komma-falsch' };
      return null;
    },
    weg: [
      S(
        `${mal ? 'Mal' : 'Geteilt durch'} ${f}: Jede Ziffer wird ${mal ? `${f}-mal so groß` : `${f}-mal so klein`}. Das Komma rückt ${hl(k + (k === 1 ? ' Stelle' : ' Stellen'))} ${richtung}.`
      ),
      S(`Fehlende Stellen füllst du mit Nullen auf.`, `${zeige(a)} ${op(mal ? '*' : ':')} ${f.toLocaleString('de-DE')} = ${zeige(r)}`),
    ],
    ergebnis: zeige(r),
  });
}

// ---------- Themen ----------

export const dezimalThemen = [
  {
    id: 'k6-dez-verstehen',
    klasse: 6,
    bereich: 'Dezimalzahlen',
    titel: 'Dezimalzahlen verstehen',
    kurz: 'Zehntel, Hundertstel und die Stellenwerttafel',
    voraussetzungen: ['k6-bruch-erweitern'],
    merke: `<p>Die Stellen nach dem Komma sind <b>Zehntel</b>, <b>Hundertstel</b> und <b>Tausendstel</b>.</p>
      <p class="regel-gross">${gl(F(3, 10), '0,3')} &nbsp; ${gl(F(25, 100), '0,25')} &nbsp; ${gl(F(7, 1000), '0,007')}</p>`,
    text: `<p>Eine Dezimalzahl ist eine andere Schreibweise für einen Bruch mit dem Nenner 10, 100 oder 1000.
      In der Stellenwerttafel steht rechts vom Komma die Zehntelstelle (z), dann die Hundertstelstelle (h) und die Tausendstelstelle (t).</p>
      ${stellentafel(3250000, 2)}
      <p>3,25 bedeutet: 3 Ganze, 2 Zehntel und 5 Hundertstel.</p>
      <h3>Brüche umwandeln</h3>
      <p>Erweitere den Bruch so, dass im Nenner 10, 100 oder 1000 steht: ${gl(F(3, 4), F(75, 100), '0,75')}.</p>`,
    fehler: [
      `Zähler und Nenner hintereinander schreiben: ${F(1, 4)} ist nicht 1,4 und nicht 0,14, sondern 0,25.`,
      `Die Null vergessen: ${F(5, 100)} ist 0,05 und nicht 0,5.`,
    ],
    stufen: [
      { id: 'zehntel', titel: 'Zehntel', aufgabe: zehntelAufgabe },
      { id: 'hundertstel', titel: 'Hundertstel', aufgabe: hundertstelAufgabe },
      { id: 'brueche', titel: 'Brüche umwandeln', aufgabe: bruchZuDezimal },
    ],
  },
  {
    id: 'k6-dez-vergleichen',
    klasse: 6,
    bereich: 'Dezimalzahlen',
    titel: 'Dezimalzahlen vergleichen',
    kurz: 'Ist 0,5 größer als 0,45?',
    voraussetzungen: ['k6-dez-verstehen'],
    merke: `<p>Vergleiche zuerst die Ganzen. Sind sie gleich, fülle mit Nullen auf und vergleiche Stelle für Stelle von links.</p>
      <p class="regel-gross">0,5 = 0,50 ${op('>')} 0,45</p>`,
    text: `<p>Viele denken: Je mehr Ziffern, desto größer. Bei Dezimalzahlen stimmt das nicht!
      0,5 sind 5 Zehntel, also 50 Hundertstel. 0,45 sind nur 45 Hundertstel.</p>
      <p>Angehängte Nullen ändern den Wert nicht: 0,5 = 0,50 = 0,500.</p>`,
    fehler: ['Die Zahl mit mehr Nachkommastellen für größer halten.', 'Nur die letzte Ziffer vergleichen.'],
    stufen: [
      { id: 'gleich', titel: 'Gleich viele Stellen', aufgabe: () => vergleichAufgabe('gleich') },
      { id: 'verschieden', titel: 'Verschieden viele Stellen', aufgabe: () => vergleichAufgabe('verschieden') },
      { id: 'profi', titel: 'Profi', aufgabe: () => vergleichAufgabe('profi') },
    ],
  },
  {
    id: 'k6-dez-plusminus',
    klasse: 6,
    bereich: 'Dezimalzahlen',
    titel: 'Addieren und Subtrahieren',
    kurz: 'Komma unter Komma',
    voraussetzungen: ['k6-dez-vergleichen'],
    merke: `<p>Schreibe die Zahlen so untereinander, dass <b>Komma unter Komma</b> steht. Fülle fehlende Stellen mit Nullen auf.
      Dann rechnest du wie mit ganzen Zahlen.</p>
      ${untereinander(2500000, 1250000, '+', 3750000)}`,
    text: `<p>Warum Komma unter Komma? Nur so stehen Zehntel unter Zehnteln und Hundertstel unter Hundertsteln.
      Du addierst ja auch Einer zu Einern und Zehner zu Zehnern.</p>
      <p>Bei ganzen Zahlen wie 5 steht das Komma hinter der letzten Ziffer: 5 = 5,00.</p>`,
    fehler: ['Die Zahlen rechtsbündig statt Komma unter Komma schreiben.', 'Beim Subtrahieren von einer ganzen Zahl die Nullen nach dem Komma vergessen.'],
    stufen: [
      { id: 'gleich', titel: 'Gleich viele Stellen', aufgabe: () => plusMinusAufgabe('gleich') },
      { id: 'verschieden', titel: 'Verschieden viele Stellen', aufgabe: () => plusMinusAufgabe('verschieden') },
      { id: 'profi', titel: 'Profi', aufgabe: () => plusMinusAufgabe('profi') },
    ],
  },
  {
    id: 'k6-dez-zehner',
    klasse: 6,
    bereich: 'Dezimalzahlen',
    titel: 'Mal und geteilt durch 10, 100, 1000',
    kurz: 'Das Komma wandert',
    voraussetzungen: ['k6-dez-verstehen'],
    merke: `<p>Bei <b>mal</b> 10, 100, 1000 rückt das Komma 1, 2 oder 3 Stellen nach <b>rechts</b>.
      Bei <b>geteilt durch</b> rückt es nach <b>links</b>.</p>
      <p class="regel-gross">3,45 ${op('*')} 100 = 345 &nbsp; 3,45 ${op(':')} 100 = 0,0345</p>`,
    text: `<p>Mal 10 heißt: Jede Ziffer wird zehnmal so viel wert. Aus Zehnteln werden Einer, aus Einern Zehner.
      Deshalb rückt jede Ziffer eine Stelle nach links, oder anders gesagt: das Komma eine Stelle nach rechts.</p>
      <p>Fehlende Stellen füllst du mit Nullen: 0,7 · 100 = 70.</p>`,
    fehler: ['Bei Dezimalzahlen einfach eine Null anhängen: 3,5 · 10 ist nicht 3,50, sondern 35.', 'Das Komma in die falsche Richtung schieben.'],
    stufen: [
      { id: 'mal', titel: 'Mal', aufgabe: () => zehnerAufgabe('mal') },
      { id: 'geteilt', titel: 'Geteilt', aufgabe: () => zehnerAufgabe('geteilt') },
      { id: 'gemischt', titel: 'Gemischt', aufgabe: () => zehnerAufgabe('gemischt') },
    ],
  },
];
