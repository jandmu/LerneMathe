/** Vorlesen mit der eingebauten Sprachausgabe des Browsers (Web Speech API). */

let stimme = null;

function stimmeWaehlen() {
  try {
    const stimmen = window.speechSynthesis.getVoices();
    const deutsch = stimmen.filter((v) => /^de(-|_|$)/i.test(v.lang));
    stimme =
      deutsch.find((v) => /google|anna|helena|katja|petra|markus|yannick/i.test(v.name) && /de-DE/i.test(v.lang)) ||
      deutsch.find((v) => /de-DE/i.test(v.lang)) ||
      deutsch[0] ||
      null;
  } catch (e) {
    stimme = null;
  }
}

export function kannSprechen() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

if (kannSprechen()) {
  stimmeWaehlen();
  try {
    window.speechSynthesis.addEventListener('voiceschanged', stimmeWaehlen);
  } catch (e) {
    /* ältere Browser */
  }
}

/** Macht Rechenzeichen vorlesbar. */
export function sprechbar(text) {
  return String(text)
    .replace(/(\d),(\d)/g, '$1 Komma $2')
    .replace(/\s*−\s*/g, ' minus ')
    .replace(/\s*\+\s*/g, ' plus ')
    .replace(/\s*·\s*/g, ' mal ')
    .replace(/(\d)\s*:\s*(\d)/g, '$1 geteilt durch $2')
    .replace(/\s*=\s*\?/g, ' ist gleich?')
    .replace(/\s*=\s*/g, ' ist gleich ')
    .replace(/\?\s*\+/g, 'wie viel plus')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sprich(text) {
  if (!kannSprechen() || !text) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(sprechbar(text));
    u.lang = 'de-DE';
    u.rate = 0.9;
    u.pitch = 1.05;
    if (stimme) u.voice = stimme;
    window.speechSynthesis.speak(u);
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
