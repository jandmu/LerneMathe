/**
 * Vorlesen mit der eingebauten Sprachausgabe des Geräts (Web Speech API).
 *
 * Wie natürlich es klingt, hängt von der Stimme ab. Viele Geräte haben neben einfachen Stimmen
 * auch hochwertige („Natural“, „Neural“, „Premium“, „Enhanced“). Diese werden bevorzugt.
 * Im Elternbereich lässt sich die Stimme pro Gerät fest auswählen.
 */

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

/** Macht Rechenzeichen vorlesbar. */
export function sprechbar(text) {
  return String(text)
    .trim()
    .replace(/^([\d\s+−·:,]+?)\s*=\s*\?$/, 'Wie viel ist $1?')
    .replace(/(\d),(\d)/g, '$1 Komma $2')
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
