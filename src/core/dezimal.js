/**
 * Exakte Dezimalzahlen: intern als ganze Zahl in Millionsteln, damit 0,1 + 0,2 genau 0,3 ergibt.
 */
export const SKALA = 1_000_000;

/** Aus Ganzen und Nachkommaziffern, z. B. dez(3, '45') = 3,45. */
export function dez(ganze, nachkomma = '') {
  const n = String(nachkomma).padEnd(6, '0').slice(0, 6);
  return ganze * SKALA + parseInt(n, 10);
}

/** Liest eine Eingabe wie „3,45“ oder „3.45“. Gibt NaN zurück, wenn sie ungültig ist. */
export function lies(text) {
  const t = String(text).trim().replace(/\s/g, '');
  const m = /^(\d*)(?:[.,](\d{1,6}))?$/.exec(t);
  if (!m || (m[1] === '' && !m[2])) return NaN;
  return dez(m[1] === '' ? 0 : parseInt(m[1], 10), m[2] || '');
}

/** Formatiert mit Komma und ohne überflüssige Nullen, z. B. 3450000 → „3,45“. */
export function zeige(wert, mindestStellen = 0) {
  const minus = wert < 0 ? '−' : '';
  const a = Math.abs(wert);
  const g = Math.floor(a / SKALA);
  let r = String(a % SKALA).padStart(6, '0').replace(/0+$/, '');
  if (r.length < mindestStellen) r = r.padEnd(mindestStellen, '0');
  return minus + g + (r ? ',' + r : '');
}

/** Anzahl der Nachkommastellen. */
export function stellen(wert) {
  const r = String(Math.abs(wert) % SKALA).padStart(6, '0').replace(/0+$/, '');
  return r.length;
}

/** Multiplizieren bzw. Teilen durch eine Zehnerpotenz (10, 100, 1000). */
export function malZehner(wert, faktor) {
  return wert * faktor;
}

export function durchZehner(wert, faktor) {
  return wert / faktor;
}
