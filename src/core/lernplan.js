/**
 * Lernplan: Wann sitzt eine Fertigkeit, wann wird sie wiederholt, was kommt als Nächstes?
 *
 * Grundlage ist eine Lernkartei (Leitner-System) pro Fertigkeit („Skill“):
 *   Fach 0 = neu, 1 = begonnen, 2 = fast sicher, ab 3 = sitzt.
 * Nach jeder Übungsrunde steigt eine Fertigkeit ein Fach auf (gut gelöst) oder ab (oft falsch).
 * Ab Fach 2 steigt sie nur, wenn sie fällig war. So entsteht verteiltes Wiederholen
 * mit wachsenden Abständen (1, 3, 7, 14, 30 Tage), statt alles an einem Tag „durchzuziehen“.
 */
import { TAG_MS, tagesbeginn, mischen } from './util.js';

export const INTERVALLE = [0, 1, 1, 3, 7, 14, 30];
export const MAX_FACH = INTERVALLE.length - 1;
export const SITZT_AB = 3;

export const STATUS_TEXT = {
  neu: 'Neu',
  uebt: 'Am Üben',
  fast: 'Fast sicher',
  sitzt: 'Sitzt',
  wiederholen: 'Wiederholen',
};

export function zustand(f, id) {
  return f.skills[id] || { fach: 0, faellig: 0, versuche: 0, richtig: 0, zuletzt: 0, verlauf: [], fehler: {} };
}

export function status(z, jetzt) {
  if (z.fach === 0 && !z.versuche) return 'neu';
  if (z.fach >= 2 && z.faellig <= jetzt) return 'wiederholen';
  if (z.fach >= SITZT_AB) return 'sitzt';
  if (z.fach === 2) return 'fast';
  return 'uebt';
}

/** Trägt eine einzelne (erste) Antwort ein. */
export function antwortEintragen(f, id, { richtig, fehler, jetzt }) {
  const alt = zustand(f, id);
  const z = { ...alt, verlauf: [...alt.verlauf, richtig ? 1 : 0].slice(-12), fehler: { ...alt.fehler } };
  z.versuche++;
  if (richtig) z.richtig++;
  else if (fehler) z.fehler[fehler] = (z.fehler[fehler] || 0) + 1;
  z.zuletzt = jetzt;
  f.skills[id] = z;
  const ereignis = { t: jetzt, s: id, r: richtig ? 1 : 0 };
  if (!richtig && fehler) ereignis.f = fehler;
  f.ereignisse.push(ereignis);
}

/**
 * Wertet eine Runde aus und verschiebt die Fertigkeiten in der Lernkartei.
 * ergebnisse: [{ skill, richtig }] – nur die ersten Versuche.
 * Gibt die Änderungen zurück: [{ skill, vorher, nachher }]
 */
export function rundeAuswerten(f, ergebnisse, jetzt) {
  const gruppen = new Map();
  for (const e of ergebnisse) {
    const g = gruppen.get(e.skill) || { n: 0, r: 0 };
    g.n++;
    if (e.richtig) g.r++;
    gruppen.set(e.skill, g);
  }
  const aenderungen = [];
  for (const [id, { n, r }] of gruppen) {
    const z = { ...zustand(f, id) };
    const vorher = z.fach;
    const gut = n >= 3 ? r / n >= 0.8 : r === n;
    const schlecht = n >= 3 ? r / n < 0.6 : r < n;
    if (gut) {
      const darfSteigen = z.fach < 2 || jetzt >= z.faellig;
      if (darfSteigen) z.fach = Math.min(MAX_FACH, z.fach + 1);
    } else if (schlecht) {
      z.fach = Math.max(1, z.fach - 1);
    } else {
      z.fach = Math.max(1, z.fach);
    }
    if (z.fach !== vorher || z.faellig <= jetzt) {
      z.faellig = tagesbeginn(jetzt) + INTERVALLE[z.fach] * TAG_MS;
    }
    f.skills[id] = z;
    aenderungen.push({ skill: id, vorher, nachher: z.fach });
  }
  return aenderungen;
}

/** Fällige Wiederholungen, die am längsten überfälligen zuerst. */
export function faellige(f, skillIds, jetzt) {
  return skillIds
    .filter((id) => {
      const z = zustand(f, id);
      return z.fach >= 1 && z.faellig <= jetzt;
    })
    .sort((a, b) => zustand(f, a).faellig - zustand(f, b).faellig);
}

/**
 * Empfiehlt die nächste Fertigkeit in Lehrplan-Reihenfolge.
 * Gesperrt wird nichts; die Empfehlung folgt dem Prinzip „erst sichern, dann weiter“.
 */
export function empfehlung(skillIds, f, jetzt) {
  for (let i = 0; i < skillIds.length; i++) {
    const z = zustand(f, skillIds[i]);
    const offen = z.fach < 2 || (z.fach < SITZT_AB && z.faellig <= jetzt);
    const vorher = i === 0 ? null : zustand(f, skillIds[i - 1]);
    if (offen && (!vorher || vorher.fach >= 2)) return skillIds[i];
  }
  return null;
}

/**
 * Stellt eine Übungsrunde zusammen.
 * Mit Fokus: überwiegend diese Fertigkeit, dazu einige fällige Wiederholungen (verschränktes Üben).
 * Ohne Fokus („Tagesmix“): fällige Wiederholungen und Fertigkeiten in Arbeit gemischt.
 */
export function rundePlanen({ skillIds, f, fokus = null, anzahl = 8, jetzt }) {
  const faellig = faellige(f, skillIds, jetzt).filter((id) => id !== fokus);
  let plan;
  if (fokus) {
    const neu = zustand(f, fokus).fach === 0;
    const nW = Math.min(faellig.length, Math.round(anzahl * (neu ? 0.2 : 0.3)));
    plan = Array(anzahl - nW).fill(fokus).concat(faellig.slice(0, nW));
    const kopf = plan.slice(0, 2);
    return kopf.concat(verschraenken(plan.slice(2)));
  }
  let pool = faellig.slice(0, 4);
  if (pool.length < 3) {
    const inArbeit = skillIds
      .filter((id) => !pool.includes(id))
      .filter((id) => {
        const z = zustand(f, id);
        return z.fach >= 1 && z.fach < SITZT_AB;
      })
      .sort((a, b) => zustand(f, b).zuletzt - zustand(f, a).zuletzt);
    pool = pool.concat(inArbeit.slice(0, 3 - pool.length));
  }
  if (!pool.length) {
    const e = empfehlung(skillIds, f, jetzt);
    if (e) pool = [e];
  }
  if (!pool.length) pool = mischen(skillIds.filter((id) => zustand(f, id).fach >= 1)).slice(0, 4);
  if (!pool.length) pool = [skillIds[0]];
  plan = Array.from({ length: anzahl }, (_, i) => pool[i % pool.length]);
  return verschraenken(plan);
}

/** Mischt so, dass möglichst nie dieselbe Fertigkeit dreimal hintereinander kommt. */
export function verschraenken(plan) {
  const rest = new Map();
  for (const id of mischen(plan)) rest.set(id, (rest.get(id) || 0) + 1);
  const aus = [];
  while (aus.length < plan.length) {
    const n = aus.length;
    const gesperrt = n >= 2 && aus[n - 1] === aus[n - 2] ? aus[n - 1] : null;
    const kandidaten = [...rest.entries()].filter(([id, k]) => k > 0 && id !== gesperrt);
    const auswahl = kandidaten.length ? kandidaten : [...rest.entries()].filter(([, k]) => k > 0);
    // Die häufigste verbleibende Fertigkeit zuerst, damit am Ende keine lange Serie übrig bleibt.
    const max = Math.max(...auswahl.map(([, k]) => k));
    const beste = auswahl.filter(([, k]) => k === max);
    const [id] = beste[Math.floor(Math.random() * beste.length)];
    aus.push(id);
    rest.set(id, rest.get(id) - 1);
  }
  return aus;
}
