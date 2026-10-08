/** Wiederverwendbare Bausteine der Oberfläche (reine HTML-Erzeugung). */
import { esc } from '../core/util.js';
import { STATUS_TEXT, SITZT_AB } from '../core/lernplan.js';

export const FARBEN = ['tomate', 'ozean', 'wiese', 'sonne', 'flieder', 'lagune'];

export function avatar(profil, gross = false) {
  const farbe = FARBEN[profil.farbe] ? profil.farbe : 0;
  const buchstabe = esc((profil.name || '?').trim().charAt(0).toUpperCase() || '?');
  return `<span class="avatar f-${FARBEN[farbe]}${gross ? ' gross' : ''}" aria-hidden="true">${buchstabe}</span>`;
}

/** Drei Sterne als Lernstand: 1 = begonnen, 2 = fast sicher, 3 = sitzt. */
export function sterne(fach, label = true) {
  const n = Math.min(3, fach);
  const stern = (voll) =>
    `<svg viewBox="0 0 24 24" class="stern${voll ? ' voll' : ''}" aria-hidden="true"><path d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>`;
  const text = ['noch nicht geübt', 'begonnen', 'fast sicher', 'sitzt'][n];
  return `<span class="sterne"${label ? ` role="img" aria-label="Lernstand: ${text}"` : ''}>${stern(n >= 1)}${stern(n >= 2)}${stern(n >= 3)}</span>`;
}

export function statusPille(st) {
  return `<span class="pille p-${st}">${STATUS_TEXT[st]}</span>`;
}

export function schritteHTML(weg) {
  return `<ol class="schritte">${weg
    .map((s) => `<li><p>${s.text}</p>${s.mathe ? `<div class="mathe">${s.mathe}</div>` : ''}</li>`)
    .join('')}</ol>`;
}

export function ergebnisBox(a) {
  return `<div class="ergebnis"><span class="etikett">Ergebnis</span><div class="ergebnis-mathe">${a.ergebnis}</div></div>`;
}

/** Darstellung der Aufgabe selbst (Text, Term, Bild). */
export function aufgabeHTML(a, { vorlesen = false } = {}) {
  return `
    <div class="auftrag">
      <p class="frage">${a.text}</p>
      ${vorlesen && !a.immerVorlesen ? '<button type="button" class="vorlese-knopf" data-action="vorlesen" aria-label="Aufgabe vorlesen">' + LAUTSPRECHER + '</button>' : ''}
    </div>
    ${
      a.immerVorlesen
        ? `<div class="hoeren"><button type="button" class="hoer-knopf" data-action="vorlesen">${LAUTSPRECHER}<span>Nochmal hören</span></button>
           <details class="wort-hilfe"><summary>Kein Ton? Zahl als Wort zeigen</summary><p>${a.wort || ''}</p></details></div>`
        : ''
    }
    ${a.rechnung ? `<div class="rechnung">${a.rechnung}</div>` : ''}
    ${a.bild ? `<div class="bild">${a.bild}</div>` : ''}`;
}

export const LAUTSPRECHER =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" class="welle"/></svg>';

/** Nur für automatische Browser-Tests: macht die aktuelle Aufgabe für den Test sichtbar. */
export function testAufgabe(a) {
  if (typeof window !== 'undefined' && window.__TEST__) window.__aufgabe = a;
}

export function istGesichert(fach) {
  return fach >= SITZT_AB;
}

/** Text, der vorgelesen wird: eigener Sprechtext oder der Arbeitsauftrag ohne HTML. */
export function vorleseText(a) {
  if (a.sprich) return a.sprich;
  const tmp = String(a.text).replace(/<[^>]*>/g, ' ');
  const rechnung = a.rechnung
    ? String(a.rechnung)
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s*=\s*\?\s*$/, '')
        .replace(/\?/g, '')
    : '';
  return `${tmp} ${rechnung}`.replace(/\s+/g, ' ').trim();
}
