/**
 * Themenregister.
 *
 * Ein Thema hat Stufen; jede Stufe ist eine Fertigkeit („Skill“) mit eigener ID „thema/stufe“.
 * Neue Klassen oder Themen werden hier eingetragen – die Oberfläche braucht dafür keine Änderung.
 *
 * Thema = {
 *   id, klasse, bereich, titel, kurz, voraussetzungen: [themaId],
 *   symbol?: () => svg                             // Bild zum Wiedererkennen ohne Lesen (Klasse 1–2)
 *   erklaerung?: [{ text, bild?, rechnung? }]     // Erklärkarten (für jüngere Kinder, werden vorgelesen)
 *   merke?, text?, fehler?: [html]                // Erklärseite (für ältere Kinder)
 *   stufen: [{ id, titel, aufgabe: () => Aufgabe }]
 * }
 */
import mengen from './k1/mengen.js';
import { ziffern, diktat } from './k1/zahlenschreiben.js';
import zerlegen from './k1/zerlegen.js';
import plusminus10 from './k1/plusminus10.js';
import { plus20, minus20 } from './k1/rechnen20.js';
import { bruchThemen } from './k6/brueche.js';
import { dezimalThemen } from './k6/dezimal.js';

export const THEMEN = [ziffern, mengen, diktat, zerlegen, plusminus10, plus20, minus20, ...bruchThemen, ...dezimalThemen];

export const KLASSEN = [1, 2, 3, 4, 5, 6];

const nachId = new Map(THEMEN.map((t) => [t.id, t]));

export function thema(id) {
  return nachId.get(id) || null;
}

export function themenFuerKlasse(klasse) {
  return THEMEN.filter((t) => t.klasse === klasse);
}

export function klassenMitInhalt() {
  return KLASSEN.filter((k) => THEMEN.some((t) => t.klasse === k));
}

export function skillId(t, s) {
  return `${t.id}/${s.id}`;
}

/** Alle Fertigkeiten einer Klasse in Lehrplan-Reihenfolge. */
export function skillsFuerKlasse(klasse) {
  return themenFuerKlasse(klasse).flatMap((t) => t.stufen.map((s) => skillId(t, s)));
}

export function skillInfo(id) {
  const [tid, sid] = String(id).split('/');
  const t = thema(tid);
  const s = t && t.stufen.find((x) => x.id === sid);
  return s ? { thema: t, stufe: s } : null;
}

/** Erzeugt eine neue Aufgabe zu einer Fertigkeit. */
export function aufgabeFuer(id) {
  const info = skillInfo(id);
  if (!info) throw new Error('Unbekannte Fertigkeit: ' + id);
  const a = info.stufe.aufgabe();
  a.skill = id;
  return a;
}

/** Größe einer Übungsrunde nach Klassenstufe (jüngere Kinder: kürzere Runden). */
export function rundenGroesse(klasse) {
  return klasse <= 2 ? 8 : 10;
}
