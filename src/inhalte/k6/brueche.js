/** Klasse 6: Bruchrechnung als Themen im gemeinsamen Format. */
import { BRUCH_THEMEN, bruchAufgabeErzeugen } from './bruch-generatoren.js';
import { BRUCH_TEXTE } from './bruch-texte.js';

const STUFEN = [
  { id: 'leicht', titel: 'Einstieg' },
  { id: 'mittel', titel: 'Standard' },
  { id: 'schwer', titel: 'Profi' },
];

export const bruchThemen = BRUCH_THEMEN.map((t, i) => {
  const text = BRUCH_TEXTE[t];
  return {
    id: 'k6-bruch-' + t,
    klasse: 6,
    bereich: 'Brüche',
    titel: text.titel,
    kurz: text.kurz,
    merke: text.regel,
    text: text.text,
    fehler: text.fehler,
    labor: t === 'grundlagen' ? 'bruch' : null,
    voraussetzungen: i ? ['k6-bruch-' + BRUCH_THEMEN[i - 1]] : [],
    stufen: STUFEN.map((s) => ({ id: s.id, titel: s.titel, aufgabe: () => bruchAufgabeErzeugen(t, s.id) })),
  };
});
