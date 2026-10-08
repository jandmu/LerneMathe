/**
 * Anschauungsmaterial für Klasse 1 als SVG: Zehnerfeld, Zwanzigerfeld, Zahlenhaus.
 * Die Felder haben eine Lücke nach jeweils fünf Plättchen („Kraft der Fünf“), damit Kinder
 * Mengen strukturiert sehen statt einzeln abzuzählen.
 */
import { ZIFFERN, abtasten, pfad } from './ziffern.js';

/** Baut eine Liste von Zellen: zellen(10, ['rot', 4], ['blau', 3]) → 4 rot, 3 blau, 3 leer */
export function zellen(groesse, ...gruppen) {
  const z = [];
  for (const [art, anzahl] of gruppen) for (let i = 0; i < anzahl; i++) z.push(art);
  while (z.length < groesse) z.push('leer');
  return z.slice(0, groesse);
}

const BESCHRIFTUNG = { rot: 'rot', blau: 'blau', weg: 'weggenommen', ziel: 'fehlt' };

function beschreibung(liste) {
  const zaehl = {};
  liste.forEach((a) => (zaehl[a] = (zaehl[a] || 0) + 1));
  const teile = Object.keys(BESCHRIFTUNG)
    .filter((a) => zaehl[a])
    .map((a) => `${zaehl[a]} ${BESCHRIFTUNG[a]}`);
  return teile.length ? 'Plättchen: ' + teile.join(', ') : 'leeres Feld';
}

function feld(liste, spalten) {
  const reihen = Math.ceil(liste.length / spalten);
  const zelle = 36;
  const luecke = 14;
  const rand = 6;
  const breite = spalten * zelle + (spalten > 5 ? luecke : 0) + 2 * rand;
  const hoehe = reihen * zelle + 2 * rand;
  let inhalt = `<rect class="feld-rahmen" x="1" y="1" width="${breite - 2}" height="${hoehe - 2}" rx="8"/>`;
  if (spalten > 5) {
    const x = rand + 5 * zelle + luecke / 2;
    inhalt += `<line class="feld-trenner" x1="${x}" y1="6" x2="${x}" y2="${hoehe - 6}"/>`;
  }
  liste.forEach((art, i) => {
    const r = Math.floor(i / spalten);
    const s = i % spalten;
    const cx = rand + s * zelle + zelle / 2 + (s >= 5 ? luecke : 0);
    const cy = rand + r * zelle + zelle / 2;
    if (art === 'weg') {
      inhalt += `<circle class="p-weg" cx="${cx}" cy="${cy}" r="13"/><path class="p-kreuz" d="M${cx - 9} ${cy - 9}L${cx + 9} ${cy + 9}M${cx + 9} ${cy - 9}L${cx - 9} ${cy + 9}"/>`;
    } else {
      inhalt += `<circle class="p-${art}" cx="${cx}" cy="${cy}" r="13"/>`;
    }
  });
  return `<svg class="bild-svg feld" viewBox="0 0 ${breite} ${hoehe}" width="${breite * 1.3}" role="img" aria-label="${beschreibung(liste)}">${inhalt}</svg>`;
}

/** Zehnerfeld: 2 Reihen mit je 5 Plättchen. */
export function zehnerfeld(liste) {
  return feld(liste, 5);
}

/** Zwanzigerfeld: 2 Reihen mit je 10 Plättchen, Lücke nach dem fünften. */
export function zwanzigerfeld(liste) {
  return feld(liste, 10);
}

/** Zahlenhaus: Dach = Gesamtzahl, zwei Zimmer = Zerlegung. Ein Wert '?' wird als Lücke gezeigt. */
export function zahlenhaus(dach, links, rechts) {
  const zahl = (wert, x, y) =>
    wert === '?'
      ? `<rect class="haus-luecke" x="${x - 22}" y="${y - 24}" width="44" height="40" rx="6"/><text class="haus-text frage" x="${x}" y="${y + 8}">?</text>`
      : `<text class="haus-text" x="${x}" y="${y + 8}">${wert}</text>`;
  return `<svg class="bild-svg haus" viewBox="0 0 200 190" width="200" role="img" aria-label="Zahlenhaus: Dach ${dach}, Zimmer ${links} und ${rechts}">
    <path class="haus-dach" d="M10 78 L100 8 L190 78 Z"/>
    <rect class="haus-wand" x="20" y="78" width="160" height="104"/>
    <line class="haus-linie" x1="100" y1="78" x2="100" y2="182"/>
    ${zahl(dach, 100, 54)}${zahl(links, 60, 132)}${zahl(rechts, 140, 132)}
  </svg>`;
}

// ---------- Ziffern nachspuren ----------


function pfeil(S, anteil) {
  const k = Math.min(S.length - 2, Math.max(1, Math.round((S.length - 1) * anteil)));
  const [x, y] = S[k];
  const [x2, y2] = S[k + 1];
  const w = Math.atan2(y2 - y, x2 - x);
  const c = Math.cos(w);
  const s = Math.sin(w);
  const p = (a, b) => `${(x + a * c - b * s).toFixed(1)} ${(y + a * s + b * c).toFixed(1)}`;
  return `<path class="spur-pfeil" d="M${p(5, 0)}L${p(-3, 4)}L${p(-3, -4)}Z"/>`;
}

/**
 * Schreibfeld mit Spur einer Ziffer.
 * hilfe: 'voll' (Spur, Pfeile, Startpunkte) oder 'wenig' (blasse Spur, nur Startpunkte).
 */
export function spurBild(ziffer, hilfe = 'voll', { id = '', interaktiv = false } = {}) {
  const striche = ZIFFERN[ziffer];
  let fuehrung = '';
  let marken = '';
  striche.forEach((strich, i) => {
    const S = abtasten(strich);
    fuehrung += `<path class="spur-fuehrung ${hilfe}" d="${pfad(strich)}"/>`;
    if (hilfe === 'voll') marken += pfeil(S, 0.3) + pfeil(S, 0.68);
    const [x, y] = S[0];
    marken += `<circle class="spur-start" cx="${x}" cy="${y}" r="6.5"/>`;
    if (striche.length > 1) marken += `<text class="spur-nr" x="${x}" y="${y + 3}">${i + 1}</text>`;
  });
  return `<svg class="spur-svg${interaktiv ? ' interaktiv' : ''}" ${id ? `id="${id}"` : ''} viewBox="0 0 100 140" role="img" aria-label="Schreibspur der Ziffer ${ziffer}">
    <line class="spur-linie" x1="0" y1="10" x2="100" y2="10"/>
    <line class="spur-linie mitte" x1="0" y1="70" x2="100" y2="70"/>
    <line class="spur-linie" x1="0" y1="130" x2="100" y2="130"/>
    ${fuehrung}<g class="spur-vorfuehrung"></g>${marken}<g class="spur-kind"></g>
  </svg>`;
}

/** Symbol für „Zahlen hören“: Lautsprecher mit Zahl. */
export function hoerSymbol(zahl) {
  return `<svg class="bild-svg hoer-symbol" viewBox="0 0 120 70" role="img" aria-label="Lautsprecher und Zahl ${zahl}">
    <rect class="feld-rahmen" x="2" y="2" width="116" height="66" rx="10"/>
    <path class="hoer-lautsprecher" d="M14 27h10l13-11v38L24 43H14z"/>
    <path class="hoer-welle" d="M44 25a14 14 0 0 1 0 20M50 19a22 22 0 0 1 0 32"/>
    <text class="haus-text" x="88" y="47">${zahl}</text>
  </svg>`;
}
