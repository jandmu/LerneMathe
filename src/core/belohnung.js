/**
 * Werkstatt: Belohnungen für Lernfortschritt.
 *
 * Grundsätze (siehe docs/DIDAKTIK.md):
 *   - Kisten gibt es für Können und Gewohnheit, nicht für Tempo oder einzelne richtige Antworten:
 *     neuer Stern (Fertigkeit steigt in der Lernkartei auf), erste Runde am Tag,
 *     erledigte Wiederholung, gelegentlich eine Überraschung.
 *   - Nichts kann verloren gehen. Keine Serien, die abreißen.
 *   - Das Kind entscheidet selbst, welches Teil es einbaut (Autonomie).
 */
import { tagesbeginn } from './util.js';

export const MAX_PRO_RUNDE = 3;
export const MIN_AUFGABEN = 5;
export const PROJEKTE = ['auto', 'rakete', 'baumhaus', 'tierpark'];

export const GRUND_TEXT = {
  stern: 'Neuer Stern',
  tag: 'Erste Runde heute',
  wiederholt: 'Wiederholung geschafft',
  ueberraschung: 'Überraschung, weil du drangeblieben bist',
};

export function werkstatt(f) {
  if (!f.werkstatt) {
    f.werkstatt = { projekt: null, farbe: 0, kisten: 0, teile: {}, tagesKiste: 0, wdhKiste: 0, ueberraschung: 0, verlauf: [] };
  }
  return f.werkstatt;
}

/**
 * Vergibt Kisten am Ende einer Runde.
 *   aenderungen:     Ergebnis von rundeAuswerten() – [{ skill, vorher, nachher }]
 *   faelligAmStart:  Fertigkeiten, die zu Beginn der Runde zur Wiederholung fällig waren
 *   ergebnisse:      erste Versuche der Runde – [{ skill, richtig }]
 * Gibt die Gründe zurück: [{ grund, skill? }]
 */
export function belohnen(f, { aenderungen = [], faelligAmStart = [], ergebnisse = [], jetzt, zufall = Math.random }) {
  const w = werkstatt(f);
  const heute = tagesbeginn(jetzt);
  const gruende = [];

  for (const a of aenderungen) {
    if (a.nachher > a.vorher) gruende.push({ grund: 'stern', skill: a.skill });
  }
  const genug = ergebnisse.length >= MIN_AUFGABEN;
  if (genug && w.tagesKiste !== heute) {
    gruende.push({ grund: 'tag' });
    w.tagesKiste = heute;
  }
  const wiederholt = faelligAmStart.some((id) => ergebnisse.some((e) => e.skill === id));
  if (wiederholt && w.wdhKiste !== heute) {
    gruende.push({ grund: 'wiederholt' });
    w.wdhKiste = heute;
  }
  if (genug && w.ueberraschung !== heute && zufall() < 0.2) {
    gruende.push({ grund: 'ueberraschung' });
    w.ueberraschung = heute;
  }

  const vergeben = gruende.slice(0, MAX_PRO_RUNDE);
  w.kisten += vergeben.length;
  if (vergeben.length) {
    w.verlauf.push({ t: jetzt, n: vergeben.length, g: vergeben.map((x) => x.grund) });
    if (w.verlauf.length > 100) w.verlauf = w.verlauf.slice(-100);
  }
  return vergeben;
}

export function projektWaehlen(f, projekt) {
  if (!PROJEKTE.includes(projekt)) return false;
  const w = werkstatt(f);
  w.projekt = projekt;
  if (!w.teile[projekt]) w.teile[projekt] = [];
  return true;
}

export function eingebaut(f, projekt = werkstatt(f).projekt) {
  const w = werkstatt(f);
  return (projekt && w.teile[projekt]) || [];
}

/** Baut ein Teil ein, wenn eine Kiste da ist. */
export function teilEinbauen(f, teil) {
  const w = werkstatt(f);
  if (!w.projekt || w.kisten < 1) return false;
  const liste = w.teile[w.projekt] || (w.teile[w.projekt] = []);
  if (liste.includes(teil)) return false;
  liste.push(teil);
  w.kisten--;
  return true;
}

export function farbeWaehlen(f, farbe) {
  werkstatt(f).farbe = farbe;
}
