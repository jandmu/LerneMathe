/** Kleine Helfer ohne Abhängigkeiten. Alles hier ist frei von DOM-Zugriffen und in Node testbar. */

export function zufall(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function wahl(liste) {
  return liste[zufall(0, liste.length - 1)];
}

export function mischen(liste) {
  const a = liste.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = zufall(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ggT(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function kgV(a, b) {
  return (a / ggT(a, b)) * b;
}

export function teiler(n) {
  const t = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) t.push(i);
  return t;
}

export function vielfache(n, bis) {
  const v = [];
  for (let x = n; x <= bis; x += n) v.push(x);
  return v;
}

/** Eindeutige ID für Profile (später auch serverseitig verwendbar). */
export function neueId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

export function esc(text) {
  return String(text).replace(/[&<>"']/g, (z) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[z]);
}

/** Entfernt HTML-Tags, z. B. um einen Text vorzulesen. */
export function ohneHtml(html) {
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export const TAG_MS = 24 * 60 * 60 * 1000;

/** Beginn des Kalendertags (lokale Zeit) als Zeitstempel. */
export function tagesbeginn(zeit) {
  const d = new Date(zeit);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
