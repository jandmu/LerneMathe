/**
 * Vorlesen mit der eingebauten Sprachausgabe des Geräts (Web Speech API).
 *
 * Wie natürlich es klingt, hängt von der Stimme ab. Viele Geräte haben neben einfachen Stimmen
 * auch hochwertige („Natural“, „Neural“, „Premium“, „Enhanced“). Diese werden bevorzugt.
 * Im Elternbereich lässt sich die Stimme pro Gerät fest auswählen.
 */

import { zahlwort } from '../core/ziffern.js';

let alleStimmen = [];
let anzahlGesamt = 0;
let gewuenscht = null; // voiceURI aus den Geräte-Einstellungen
let tempo = 0.95;
const beobachter = new Set();

/** Bewertet eine Stimme: höher = natürlicher. */
export function bewerten(v) {
  const name = `${v.name} ${v.voiceURI || ''}`;
  let p = 0;
  if (/de-DE/i.test(v.lang)) p += 5;
  if (/natural|neural/i.test(name)) p += 50;
  if (/premium/i.test(name)) p += 45;
  if (/enhanced|erweitert|verbessert/i.test(name)) p += 35;
  if (/online/i.test(name)) p += 20;
  if (/google/i.test(name)) p += 15;
  if (/anna|helena|petra|katja|amala|seraphina|conrad|florian|killian|markus|yannick|marlene|vicki/i.test(name)) p += 3;
  if (/compact|espeak|eloquence|novelty|\b(grandma|grandpa|rocko|shelley|flo|reed|sandy|eddy)\b/i.test(name)) p -= 40;
  return p;
}

function lesen() {
  try {
    const alle = window.speechSynthesis.getVoices();
    anzahlGesamt = alle.length;
    alleStimmen = alle.filter((v) => /^de(-|_|$)/i.test(v.lang));
  } catch (e) {
    alleStimmen = [];
  }
}

function laden() {
  lesen();
  beobachter.forEach((f) => f());
}

export function kannSprechen() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

if (kannSprechen()) {
  laden();
  try {
    window.speechSynthesis.addEventListener('voiceschanged', laden);
  } catch (e) {
    window.speechSynthesis.onvoiceschanged = laden;
  }
  // Nach dem Installieren einer Stimme in den Einstellungen kommt man meist per App-Wechsel zurück.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') laden();
  });
}

/** Deutsche Stimmen, die natürlichsten zuerst. */
export function deutscheStimmen() {
  if (kannSprechen()) lesen();
  return alleStimmen.slice().sort((a, b) => bewerten(b) - bewerten(a));
}

/** Für die Diagnose im Elternbereich: wie viele Stimmen meldet der Browser insgesamt? */
export function stimmenGesamt() {
  return anzahlGesamt;
}

/** Liest die Stimmen neu ein (z. B. nach dem Installieren einer Stimme). */
export function neuLaden() {
  if (kannSprechen()) laden();
}

/** Meldet sich, wenn der Browser seine Stimmen (nach)geladen hat. Gibt eine Abmeldefunktion zurück. */
export function beiStimmenGeladen(f) {
  beobachter.add(f);
  return () => beobachter.delete(f);
}

export function einstellen({ stimme, tempo: t } = {}) {
  if (stimme !== undefined) gewuenscht = stimme || null;
  if (t) tempo = t;
}

export function aktuelleStimme() {
  const liste = deutscheStimmen();
  return liste.find((v) => v.voiceURI === gewuenscht) || liste[0] || null;
}

const NENNER_WORT = { 2: 'Halbe', 3: 'Drittel', 7: 'Siebtel', 8: 'Achtel' };

/** Bruch als Wort: bruchwort(3, 4) → „drei Viertel“, bruchwort(1, 2) → „ein Halb“. */
export function bruchwort(z, n) {
  const zz = Number(z);
  const nn = Number(n);
  if (!/^\d+$/.test(String(n).trim()) || nn < 2 || nn > 1000) return `${z} durch ${n}`;
  let nenner = NENNER_WORT[nn] || (nn < 20 ? zahlwort(nn) + 'tel' : nn === 1000 ? 'Tausendstel' : zahlwort(nn) + 'stel');
  nenner = nenner.charAt(0).toUpperCase() + nenner.slice(1);
  if (String(z).trim() === '?') return `wie viele ${nenner}`;
  if (!/^\d+$/.test(String(z).trim())) return `${z} durch ${n}`;
  if (zz === 1) return nn === 2 ? 'ein Halb' : `ein ${nenner}`;
  return `${zz <= 100 ? zahlwort(zz) : zz} ${nenner}`;
}

const ZEICHEN_WORT = { '+': 'plus', '−': 'minus', '·': 'mal', ':': 'geteilt durch', '=': 'gleich', '&lt;': 'kleiner als', '&gt;': 'größer als', '<': 'kleiner als', '>': 'größer als' };

/** Macht dargestellte Mathematik (Brüche, gemischte Zahlen, Rechenzeichen, Lücken) vorlesbar. */
export function htmlZuSprache(html) {
  const F = '<span class="fr"><span class="fr-z">([^<]*)</span><span class="fr-n">([^<]*)</span></span>';
  return String(html)
    .replace(/<span class="luecke"[^>]*>[^<]*<\/span>/g, ' Lücke ')
    .replace(new RegExp(`<span class="gz">(\\d+)${F}</span>`, 'g'), (_, g, z, n) => ` ${g} und ${bruchwort(z, n)} `)
    .replace(new RegExp(F, 'g'), (_, z, n) => ` ${bruchwort(z, n)} `)
    .replace(/<span class="op">([^<]*)<\/span>/g, (_, z) => ` ${ZEICHEN_WORT[z] || z} `)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Ziffern nach dem Komma einzeln sprechen, wie in der Schule: 0,45 → „0 Komma 4 5“. */
function kommaZiffern(_, ganz, nach) {
  return `${ganz} Komma ${nach.split('').join(' ')}`;
}

/** Macht Rechenzeichen vorlesbar. */
export function sprechbar(text) {
  return String(text)
    .trim()
    .replace(/^([\d\s+−·:,]+?)\s*=\s*\?$/, 'Wie viel ist $1?')
    .replace(/(\d+),(\d+)/g, kommaZiffern)
    .replace(/\s*−\s*/g, ' minus ')
    .replace(/\s*\+\s*/g, ' plus ')
    .replace(/\s*·\s*/g, ' mal ')
    .replace(/(\d)\s*:\s*(\d)/g, '$1 geteilt durch $2')
    .replace(/\s*=\s*/g, ' ist gleich ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sprich(text) {
  if (!kannSprechen() || !text) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(sprechbar(text));
    const v = aktuelleStimme();
    if (v) {
      u.voice = v;
      u.lang = v.lang;
    } else {
      u.lang = 'de-DE';
    }
    u.rate = tempo;
    u.pitch = 1;
    // Manche Browser verschlucken den Anfang, wenn direkt nach cancel() gesprochen wird.
    setTimeout(() => synth.speak(u), 60);
  } catch (e) {
    /* Sprachausgabe nicht möglich */
  }
}

export function stopp() {
  if (!kannSprechen()) return;
  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    /* ignorieren */
  }
}
