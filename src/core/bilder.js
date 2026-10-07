/**
 * Anschauungsmaterial für Klasse 1 als SVG: Zehnerfeld, Zwanzigerfeld, Zahlenhaus.
 * Die Felder haben eine Lücke nach jeweils fünf Plättchen („Kraft der Fünf“), damit Kinder
 * Mengen strukturiert sehen statt einzeln abzuzählen.
 */

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
