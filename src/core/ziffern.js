/**
 * Ziffern schreiben: Schreibwege der Ziffern 0–9 und Prüfung nachgespurter Striche.
 *
 * Koordinaten in einem Feld von 100 × 140 (Schreiblinien bei y = 10 und y = 130).
 * Jede Ziffer besteht aus einem oder zwei Strichen in Schreibreihenfolge. Ein Punkt mit 'e'
 * ist eine Ecke; dazwischen wird glatt (Catmull-Rom) interpoliert.
 * Die Schreibwege folgen den in Grundschulen üblichen Bewegungsabläufen.
 */

export const ZIFFERN = {
  0: [[[50, 12], [30, 22], [21, 50], [22, 92], [32, 121], [50, 130], [68, 121], [79, 92], [78, 50], [70, 22], [50, 12]]],
  1: [[[28, 42, 'e'], [62, 12, 'e'], [62, 130, 'e']]],
  2: [[[24, 38], [34, 17], [53, 10], [72, 17], [80, 36], [74, 58], [56, 82], [22, 128, 'e'], [82, 128, 'e']]],
  3: [[[24, 24], [44, 11], [66, 13], [78, 30], [72, 50], [50, 64, 'e'], [72, 74], [81, 98], [72, 121], [50, 131], [26, 122]]],
  4: [
    [[55, 12, 'e'], [20, 88, 'e'], [84, 88, 'e']],
    [[64, 52, 'e'], [64, 130, 'e']],
  ],
  5: [
    [[30, 14, 'e'], [27, 64, 'e'], [48, 56], [70, 64], [80, 90], [72, 118], [50, 130], [26, 122]],
    [[30, 14, 'e'], [78, 14, 'e']],
  ],
  6: [[[72, 14], [50, 28], [33, 52], [24, 84], [30, 114], [50, 130], [70, 120], [78, 96], [68, 76], [48, 72], [30, 84]]],
  7: [
    [[20, 14, 'e'], [80, 14, 'e'], [42, 130, 'e']],
    [[38, 72, 'e'], [74, 72, 'e']],
  ],
  8: [[[70, 26], [52, 12], [32, 18], [28, 40], [44, 60], [66, 78], [76, 104], [64, 126], [42, 130], [24, 112], [30, 86], [52, 66], [70, 46], [70, 26]]],
  9: [[[76, 34], [64, 14], [42, 12], [26, 28], [28, 52], [46, 62], [66, 56], [76, 34, 'e'], [72, 90], [64, 130]]],
};

/** Kurze Beschreibung des Schreibwegs, wird angezeigt und vorgelesen. */
export const SCHREIBWEG = {
  0: ['Fang oben in der Mitte an.', 'Fahre links herum nach unten.', 'Und rechts wieder hoch bis zum Anfang.'],
  1: ['Fang beim grünen Punkt an.', 'Schräg nach oben.', 'Dann gerade nach unten.'],
  2: ['Fang links oben an.', 'Ein Bogen nach oben und rechts herum.', 'Schräg nach links unten.', 'Zum Schluss ein Strich nach rechts.'],
  3: ['Fang links oben an.', 'Ein Bogen nach rechts bis zur Mitte.', 'Noch ein Bogen nach rechts bis nach unten.'],
  4: ['Erster Strich: von oben schräg nach unten, dann nach rechts.', 'Zweiter Strich: von oben gerade nach unten.'],
  5: ['Erster Strich: gerade nach unten, dann ein dicker Bauch nach rechts.', 'Zweiter Strich: das Dach oben nach rechts.'],
  6: ['Fang rechts oben an.', 'Ein großer Bogen nach links bis ganz nach unten.', 'Dann rund herum zu einem kleinen Kreis.'],
  7: ['Erster Strich: oben nach rechts, dann schräg nach unten.', 'Zweiter Strich: der Querstrich in der Mitte.'],
  8: ['Fang rechts oben an.', 'Nach links und schräg durch die Mitte nach rechts unten.', 'Unten herum und wieder hoch durch die Mitte bis zum Anfang.'],
  9: ['Fang rechts oben an.', 'Ein Kreis links herum.', 'Dann gerade nach unten.'],
};

const PRO_SEGMENT = 10;

function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
}

/** Dichte Punktfolge entlang eines Strichs. */
export function abtasten(strich) {
  const pkt = strich;
  const aus = [[pkt[0][0], pkt[0][1]]];
  for (let i = 0; i < pkt.length - 1; i++) {
    const p1 = pkt[i];
    const p2 = pkt[i + 1];
    const p0 = i === 0 || p1[2] === 'e' ? p1 : pkt[i - 1];
    const p3 = i + 2 >= pkt.length || p2[2] === 'e' ? p2 : pkt[i + 2];
    for (let k = 1; k <= PRO_SEGMENT; k++) aus.push(catmull(p0, p1, p2, p3, k / PRO_SEGMENT));
  }
  return aus;
}

/** SVG-Pfad (Polylinie aus den abgetasteten Punkten). */
export function pfad(strich) {
  return abtasten(strich)
    .map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join('');
}

const abstand = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Gleichmäßig verteilte Punkte entlang einer Linie (nach Weglänge). */
function gleichmaessig(punkte, anzahl = 40) {
  if (punkte.length < 2) return punkte.slice();
  const laengen = [0];
  for (let i = 1; i < punkte.length; i++) laengen.push(laengen[i - 1] + abstand(punkte[i - 1], punkte[i]));
  const gesamt = laengen[laengen.length - 1];
  if (gesamt === 0) return [punkte[0]];
  const aus = [];
  let j = 0;
  for (let k = 0; k < anzahl; k++) {
    const ziel = (gesamt * k) / (anzahl - 1);
    while (j < laengen.length - 2 && laengen[j + 1] < ziel) j++;
    const seg = laengen[j + 1] - laengen[j] || 1;
    const t = (ziel - laengen[j]) / seg;
    aus.push([punkte[j][0] + (punkte[j + 1][0] - punkte[j][0]) * t, punkte[j][1] + (punkte[j + 1][1] - punkte[j][1]) * t]);
  }
  return aus;
}

function naechster(p, liste) {
  let best = Infinity;
  let index = 0;
  liste.forEach((q, i) => {
    const d = abstand(p, q);
    if (d < best) {
      best = d;
      index = i;
    }
  });
  return { d: best, index };
}

export const TOLERANZ = { start: 24, nah: 17, mittel: 13, abdeckung: 0.75, richtung: 0.7 };

/**
 * Prüft nachgespurte Striche gegen den Schreibweg einer Ziffer.
 * striche: [[[x, y], …], …] in Feldkoordinaten.
 * Ergebnis: { status, text, fehler }
 */
export function pruefeSpur(ziffer, striche) {
  const soll = ZIFFERN[ziffer];
  const gueltig = (striche || []).filter((s) => s && s.length >= 2);
  if (gueltig.length < soll.length) {
    return { status: 'ungueltig', text: soll.length > 1 ? `Die ${ziffer} hat ${soll.length} Striche. Es fehlt noch einer.` : 'Fahre die Spur mit dem Finger nach.' };
  }
  for (let i = 0; i < soll.length; i++) {
    const S = abtasten(soll[i]);
    const U = gleichmaessig(gueltig[i], 40);
    const geschlossen = abstand(S[0], S[S.length - 1]) < 5;
    const nr = soll.length > 1 ? (i === 0 ? 'Beim ersten Strich: ' : 'Beim zweiten Strich: ') : '';

    // Richtung: Wandert der Finger entlang der Spur vorwärts?
    const kern = U.slice(Math.floor(U.length * 0.12), Math.ceil(U.length * 0.88));
    const idx = kern.map((p) => naechster(p, S).index);
    let vor = 0;
    let zurueck = 0;
    for (let k = 1; k < idx.length; k++) {
      if (idx[k] > idx[k - 1]) vor++;
      else if (idx[k] < idx[k - 1]) zurueck++;
    }
    const anteilVor = vor + zurueck ? vor / (vor + zurueck) : 1;

    const startD = abstand(U[0], S[0]);
    const endeAmStart = abstand(U[U.length - 1], S[0]);
    const startAmEnde = abstand(U[0], S[S.length - 1]);
    if (!geschlossen && startAmEnde < TOLERANZ.start && endeAmStart < TOLERANZ.start && startD > TOLERANZ.start) {
      return { status: 'falsch', text: `${nr}Du hast andersherum geschrieben. Fang beim grünen Punkt an und folge den Pfeilen.`, fehler: 'ziffer-richtung' };
    }
    if (startD > TOLERANZ.start) {
      return { status: 'falsch', text: `${nr}Fang beim grünen Punkt an.`, fehler: 'ziffer-start' };
    }
    if (anteilVor < TOLERANZ.richtung) {
      return { status: 'falsch', text: `${nr}Folge den Pfeilen. Du bist in die andere Richtung gefahren.`, fehler: 'ziffer-richtung' };
    }
    const abdeckung = S.filter((p) => naechster(p, U).d <= TOLERANZ.nah).length / S.length;
    const mittel = U.reduce((s, p) => s + naechster(p, S).d, 0) / U.length;
    if (abdeckung < TOLERANZ.abdeckung) {
      return { status: 'falsch', text: `${nr}Fahre die ganze Spur nach, bis zum Ende.`, fehler: 'ziffer-ungenau' };
    }
    if (mittel > TOLERANZ.mittel) {
      return { status: 'falsch', text: `${nr}Bleib näher an der Spur.`, fehler: 'ziffer-ungenau' };
    }
  }
  return { status: 'richtig', text: '' };
}

/** Ideale Striche einer Ziffer (für Tests und die Vorführung). */
export function idealStriche(ziffer) {
  return ZIFFERN[ziffer].map((s) => abtasten(s));
}

// ---------- Zahlwörter ----------

const EINER = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'];
const ZEHN_BIS_19 = ['zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
const ZEHNER = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];

/** Zahlwort für 0 bis 100, z. B. 24 → „vierundzwanzig“. */
export function zahlwort(n) {
  if (n < 10) return EINER[n];
  if (n < 20) return ZEHN_BIS_19[n - 10];
  if (n === 100) return 'hundert';
  const z = Math.floor(n / 10);
  const e = n % 10;
  if (!e) return ZEHNER[z];
  return (e === 1 ? 'ein' : EINER[e]) + 'und' + ZEHNER[z];
}
