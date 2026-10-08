/**
 * Bausteine für Aufgaben.
 *
 * Eine Aufgabe ist ein einfaches Objekt:
 *   text      – Arbeitsauftrag (HTML erlaubt), wird angezeigt und ggf. vorgelesen
 *   sprich    – optional: was vorgelesen wird (sonst der Text ohne HTML)
 *   rechnung  – optional: groß dargestellter Term, z. B. „8 + 5 = ?“
 *   bild      – optional: SVG/HTML-Darstellung (Plättchen, Zahlenhaus, Bruchstreifen …)
 *   eingabe   – { art: 'zahl' | 'dezimal' | 'bruch' | 'auswahl', … }
 *   loesung   – erwartete Antwort
 *   pruefe(antwort) → { status: 'richtig' | 'fast' | 'falsch' | 'ungueltig', text, fehler }
 *   weg       – Lösungsweg als Liste von Schritten { text, mathe }
 *   ergebnis  – Ergebnis als HTML
 *   hinweis   – allgemeiner Tipp bei falscher Antwort
 *   lob       – optional: eigene Lobsätze (sonst allgemeine, z. B. „Super gerechnet!“)
 *   schluessel – zum Erkennen von Wiederholungen innerhalb einer Runde
 */
import { Bruch } from './bruch.js';
import { lies } from './dezimal.js';
import { ggT } from './util.js';

/** Typische Fehler, die die App erkennt. Die Bezeichnungen erscheinen im Elternbereich. */
export const FEHLERBILDER = {
  allgemein: 'Sonstiger Fehler',
  'um-eins': 'Um 1 daneben (verzählt)',
  zahlendreher: 'Zahlendreher (z. B. 31 statt 13)',
  'ziffer-richtung': 'Ziffer in falscher Richtung geschrieben',
  'ziffer-start': 'Ziffer am falschen Punkt begonnen',
  'ziffer-ungenau': 'Ziffer ungenau nachgespurt',
  'ziffer-ueber': 'Über das Ende der Ziffer hinaus geschrieben',
  'plus-statt-minus': 'Plus statt Minus gerechnet',
  'minus-statt-plus': 'Minus statt Plus gerechnet',
  'zusammengezaehlt': 'Zerlegung: Zahlen zusammengezählt statt ergänzt',
  'einer-vertauscht': 'Einer vertauscht (z. B. 13 − 5 = 12)',
  'zehner-vergessen': 'Zehner vergessen',
  'nicht-gekuerzt': 'Ergebnis nicht vollständig gekürzt',
  'nenner-addiert': 'Nenner addiert oder subtrahiert',
  'nur-nenner': 'Nur den Nenner verändert',
  'kehrwert-falsch': 'Kehrwert vom falschen Bruch gebildet',
  'laenger-groesser': 'Längere Dezimalzahl für größer gehalten',
  'komma-richtung': 'Komma in die falsche Richtung verschoben',
  'komma-falsch': 'Komma an falscher Stelle',
  'vergleich-falsch': 'Größer/kleiner verwechselt',
  'form': 'Richtiger Wert, falsche Schreibweise',
};

export const RICHTIG = Object.freeze({ status: 'richtig', text: '' });

export function ungueltig(text) {
  return { status: 'ungueltig', text };
}

export function falsch(text, fehler = 'allgemein') {
  return { status: 'falsch', text, fehler };
}

export function fast(text, fehler = 'form') {
  return { status: 'fast', text, fehler };
}

function mitPruefung(aufgabe, pruefe) {
  return Object.assign(aufgabe, { pruefe, schluessel: aufgabe.schluessel || (aufgabe.rechnung || '') + (aufgabe.text || '') + (aufgabe.bild || '') });
}

/**
 * Aufgabe mit einer ganzen Zahl als Antwort.
 * fehlbild(antwort) kann eine gezielte Rückmeldung { text, fehler } für typische Fehler liefern.
 */
export function zahlAufgabe(a) {
  a.eingabe = a.eingabe || { art: 'zahl' };
  return mitPruefung(a, (antwort) => {
    const t = String(antwort ?? '').trim();
    if (t === '') return ungueltig('Tippe zuerst eine Zahl ein.');
    if (!/^\d+$/.test(t)) return ungueltig('Bitte nur eine Zahl eingeben.');
    const n = parseInt(t, 10);
    if (n === a.loesung) return RICHTIG;
    const f = a.fehlbild && a.fehlbild(n);
    if (f) return falsch(f.text, f.fehler);
    if (Math.abs(n - a.loesung) === 1) return falsch('Ganz knapp daneben, nur um 1. Schau noch einmal genau hin.', 'um-eins');
    return falsch(a.hinweis);
  });
}

/** Auswahl aus festen Möglichkeiten, z. B. <, = oder >. */
export function auswahlAufgabe(a) {
  return mitPruefung(a, (antwort) => {
    if (antwort == null || antwort === '') return ungueltig('Wähle eine Antwort.');
    if (String(antwort) === String(a.loesung)) return RICHTIG;
    const f = a.fehlbild && a.fehlbild(antwort);
    if (f) return falsch(f.text, f.fehler);
    return falsch(a.hinweis, a.fehlerArt || 'allgemein');
  });
}

/** Aufgabe mit einer Dezimalzahl als Antwort (loesung in Millionsteln, siehe dezimal.js). */
export function dezimalAufgabe(a) {
  a.eingabe = a.eingabe || { art: 'dezimal' };
  return mitPruefung(a, (antwort) => {
    const t = String(antwort ?? '').trim();
    if (t === '') return ungueltig('Gib zuerst eine Zahl ein.');
    const w = lies(t);
    if (Number.isNaN(w)) return ungueltig('Schreibe die Zahl mit Komma, z. B. 3,25.');
    if (w === a.loesung) return RICHTIG;
    const f = a.fehlbild && a.fehlbild(w);
    if (f) return falsch(f.text, f.fehler);
    return falsch(a.hinweis);
  });
}

/**
 * Aufgabe mit einem Bruch als Antwort. Eingabe { g, z, n } als Texte (Ganze optional).
 * Optionen: mussGekuerzt, form ('gemischt' | 'unecht'), eingabe.nennerFest, fehlbild(bruch)
 */
export function bruchAufgabe(a) {
  a.eingabe = Object.assign({ art: 'bruch' }, a.eingabe);
  return mitPruefung(a, (eingabe) => {
    const leer = (s) => s == null || String(s).trim() === '';
    const zahl = (s) => (/^\d+$/.test(String(s).trim()) ? parseInt(String(s).trim(), 10) : NaN);
    const e = eingabe || {};
    const fest = a.eingabe.nennerFest;
    const nS = fest ? String(fest) : e.n;

    if (leer(e.g) && leer(e.z)) return ungueltig('Gib zuerst eine Antwort ein.');
    if (!leer(e.g) && leer(e.z) && !leer(nS) && !fest) return ungueltig('Der Zähler fehlt noch.');

    const g = leer(e.g) ? 0 : zahl(e.g);
    const z = leer(e.z) ? 0 : zahl(e.z);
    const n = leer(nS) ? 1 : zahl(nS);
    if ([g, z, n].some(Number.isNaN)) return ungueltig('Bitte nur natürliche Zahlen eingeben, ohne Komma und Minus.');
    if (n === 0) return ungueltig('Der Nenner darf nicht 0 sein.');
    if (g > 0 && !leer(e.z) && n !== 1 && z >= n) {
      return ungueltig('Bei einer gemischten Zahl muss der Bruch hinter den Ganzen kleiner als 1 sein.');
    }

    if (fest) {
      if (z === a.loesung.z) return RICHTIG;
      const f = a.fehlbild && a.fehlbild(new Bruch(z, n));
      return f ? falsch(f.text, f.fehler) : falsch(a.hinweis);
    }

    const wert = new Bruch(g * n + z, n);
    if (!wert.gleich(a.loesung)) {
      const f = a.fehlbild && a.fehlbild(wert);
      return f ? falsch(f.text, f.fehler) : falsch(a.hinweis);
    }
    if (a.form === 'gemischt' && !(g > 0 && z > 0 && z < n)) {
      return fast('Der Wert stimmt. Schreibe ihn aber als gemischte Zahl: Ganze links, Bruch rechts.');
    }
    if (a.form === 'unecht' && g > 0) return fast('Der Wert stimmt. Gesucht ist aber ein unechter Bruch ohne Ganze.');
    if (a.mussGekuerzt && n !== 1 && z !== 0 && ggT(z, n) !== 1) {
      return fast('Der Wert stimmt. Du kannst das Ergebnis aber noch kürzen.', 'nicht-gekuerzt');
    }
    return RICHTIG;
  });
}

/** Schritt eines Lösungswegs. */
export function S(text, mathe = '') {
  return { text, mathe };
}
