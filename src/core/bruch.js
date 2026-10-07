/** Bruch-Klasse und Darstellung von Brüchen als HTML und SVG. */
import { ggT } from './util.js';

export class Bruch {
  constructor(z, n = 1) {
    if (!Number.isInteger(z) || !Number.isInteger(n)) throw new TypeError('Zähler und Nenner müssen ganze Zahlen sein');
    if (n === 0) throw new RangeError('Der Nenner darf nicht 0 sein');
    if (n < 0) {
      z = -z;
      n = -n;
    }
    this.z = z;
    this.n = n;
  }

  static gemischt(g, z, n) {
    return new Bruch(g * n + z, n);
  }

  get wert() {
    return this.z / this.n;
  }

  get ganze() {
    return Math.trunc(this.z / this.n);
  }

  get rest() {
    return this.z % this.n;
  }

  gekuerzt() {
    const g = ggT(this.z, this.n) || 1;
    return new Bruch(this.z / g, this.n / g);
  }

  istGekuerzt() {
    return ggT(this.z, this.n) === 1;
  }

  gleich(b) {
    return this.z * b.n === b.z * this.n;
  }

  vergleiche(b) {
    return Math.sign(this.z * b.n - b.z * this.n);
  }

  plus(b) {
    return new Bruch(this.z * b.n + b.z * this.n, this.n * b.n).gekuerzt();
  }

  minus(b) {
    return new Bruch(this.z * b.n - b.z * this.n, this.n * b.n).gekuerzt();
  }

  mal(b) {
    return new Bruch(this.z * b.z, this.n * b.n).gekuerzt();
  }

  durch(b) {
    return new Bruch(this.z * b.n, this.n * b.z).gekuerzt();
  }

  kehrwert() {
    return new Bruch(this.n, this.z);
  }

  toString() {
    return this.n === 1 ? String(this.z) : this.z + '/' + this.n;
  }
}

// ---------- HTML ----------

const ZEICHEN = { '+': '+', '-': '−', '*': '·', ':': ':', '=': '=', '<': '&lt;', '>': '&gt;' };

/** Bruch mit beliebigem Inhalt in Zähler und Nenner, z. B. F('3 · 4', '5 · 4'). */
export function F(z, n) {
  return `<span class="fr"><span class="fr-z">${z}</span><span class="fr-n">${n}</span></span>`;
}

/** Bruch so, wie er ist (ganze Zahlen ohne Nenner 1). */
export function B(b) {
  return b.n === 1 ? String(b.z) : F(b.z, b.n);
}

/** Unechte Brüche als gemischte Zahl. */
export function G(b) {
  if (b.n === 1) return String(b.z);
  const g = b.ganze;
  const r = b.rest;
  if (g === 0) return F(b.z, b.n);
  if (r === 0) return String(g);
  return `<span class="gz">${g}${F(r, b.n)}</span>`;
}

export function op(z) {
  return `<span class="op">${ZEICHEN[z] || z}</span>`;
}

/** Gleichungskette: gl(a, b, c) → a = b = c (bleibt beim Umbruch zusammen). */
export function gl(...teile) {
  return `<span class="kette">${teile.join(op('='))}</span>`;
}

export function hl(x) {
  return `<mark>${x}</mark>`;
}

export function ergebnisHTML(b) {
  return b.n !== 1 && b.z > b.n ? gl(B(b), G(b)) : B(b);
}

// ---------- SVG ----------

function sektor(cx, cy, r, a0, a1) {
  const rad = (w) => ((w - 90) * Math.PI) / 180;
  const p = (w) => `${(cx + r * Math.cos(rad(w))).toFixed(2)} ${(cy + r * Math.sin(rad(w))).toFixed(2)}`;
  return `M${cx} ${cy}L${p(a0)}A${r} ${r} 0 0 1 ${p(a1)}Z`;
}

/** Kreisdiagramme: z gefärbte Teile, jedes Ganze in n Teile geteilt. */
export function kreise(z, n) {
  const anzahl = Math.max(1, Math.ceil(z / n));
  const d = 100;
  const abstand = 14;
  const breite = anzahl * d + (anzahl - 1) * abstand;
  let inhalt = '';
  for (let i = 0; i < anzahl; i++) {
    const cx = i * (d + abstand) + d / 2;
    const voll = Math.max(0, Math.min(n, z - i * n));
    if (n === 1) {
      inhalt += `<circle cx="${cx}" cy="50" r="46" class="${voll ? 't-voll' : 't-leer'}"/>`;
      continue;
    }
    for (let k = 0; k < n; k++) {
      inhalt += `<path d="${sektor(cx, 50, 46, (360 * k) / n, (360 * (k + 1)) / n)}" class="${k < voll ? 't-voll' : 't-leer'}"/>`;
    }
  }
  return `<svg class="bild-svg" viewBox="-2 -2 ${breite + 4} 104" width="${Math.round(breite * 1.25)}" role="img" aria-label="${z} Teile gefärbt, jedes Ganze hat ${n} Teile">${inhalt}</svg>`;
}

/** Bruchstreifen: z gefärbte Teile, jedes Ganze in n Teile geteilt. */
export function balken(z, n) {
  const anzahl = Math.max(1, Math.ceil(z / n));
  const w = 240;
  const h = 34;
  const abstand = 10;
  const hoehe = anzahl * h + (anzahl - 1) * abstand;
  let inhalt = '';
  for (let i = 0; i < anzahl; i++) {
    const voll = Math.max(0, Math.min(n, z - i * n));
    for (let k = 0; k < n; k++) {
      inhalt += `<rect x="${((w * k) / n).toFixed(2)}" y="${i * (h + abstand)}" width="${(w / n).toFixed(2)}" height="${h}" class="${k < voll ? 't-voll' : 't-leer'}"/>`;
    }
  }
  return `<svg class="bild-svg" viewBox="-2 -2 ${w + 4} ${hoehe + 4}" width="${w * 1.2}" role="img" aria-label="Streifen mit ${n} Teilen, ${z} davon gefärbt">${inhalt}</svg>`;
}
