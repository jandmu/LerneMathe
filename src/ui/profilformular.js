/** Formular zum Anlegen und Bearbeiten eines Kinderprofils. */
import { esc, neueId } from '../core/util.js';
import { FARBEN } from './bausteine.js';
import { klassenMitInhalt } from '../inhalte/index.js';

const FARBNAMEN = ['Tomate', 'Ozean', 'Wiese', 'Sonne', 'Flieder', 'Lagune'];

export function profilFormular(p = null, { abbrechen = false, knopf = 'Speichern' } = {}) {
  const klasse = p ? p.klasse : 1;
  const farbe = p ? p.farbe : 0;
  const vorlesen = p ? p.vorlesen : true;
  const spiel = p ? p.werkstatt !== false : true;
  const mitInhalt = klassenMitInhalt();
  return `<form class="profil-form" id="profil-form" autocomplete="off" novalidate data-id="${p ? esc(p.id) : ''}">
    <label class="feld">
      <span class="feld-name">Name</span>
      <input id="pf-name" name="name" type="text" maxlength="20" required value="${p ? esc(p.name) : ''}" placeholder="z. B. Mia">
    </label>
    <fieldset class="feld">
      <legend class="feld-name">Klasse</legend>
      <div class="segment klassen-wahl">
        ${[1, 2, 3, 4, 5, 6]
          .map(
            (k) => `<label class="segment-teil"><input type="radio" name="klasse" value="${k}" ${k === klasse ? 'checked' : ''}><span>${k}</span></label>`
          )
          .join('')}
      </div>
      <span class="feld-hilfe">Inhalte gibt es bisher für Klasse ${mitInhalt.join(' und ')}. Weitere Klassen folgen.</span>
    </fieldset>
    <fieldset class="feld">
      <legend class="feld-name">Farbe</legend>
      <div class="farb-wahl">
        ${FARBEN.map(
          (f, i) =>
            `<label class="farbe f-${f}"><input type="radio" name="farbe" value="${i}" ${i === farbe ? 'checked' : ''}><span class="sr-only">${FARBNAMEN[i]}</span></label>`
        ).join('')}
      </div>
    </fieldset>
    <label class="schalter">
      <input type="checkbox" name="vorlesen" id="pf-vorlesen" ${vorlesen ? 'checked' : ''}>
      <span>Aufgaben vorlesen <span class="feld-hilfe">(empfohlen für Klasse 1 und 2)</span></span>
    </label>
    <label class="schalter">
      <input type="checkbox" name="werkstatt" ${spiel ? 'checked' : ''}>
      <span>Werkstatt mit Belohnungen <span class="feld-hilfe">(für neue Sterne gibt es Teile für ein eigenes Projekt)</span></span>
    </label>
    <p class="formular-fehler" id="pf-fehler" role="alert" hidden></p>
    <div class="knopfreihe">
      <button class="knopf primaer" type="submit">${knopf}</button>
      ${abbrechen ? '<button class="knopf" type="button" data-action="profil-abbrechen">Abbrechen</button>' : ''}
    </div>
  </form>`;
}

/** Liest das Formular. Gibt { profil } oder { fehler } zurück. */
export function profilLesen(form, alt = null) {
  const d = new FormData(form);
  const name = String(d.get('name') || '').trim();
  if (!name) return { fehler: 'Bitte gib einen Namen ein.' };
  return {
    profil: {
      id: alt ? alt.id : neueId(),
      name,
      klasse: Number(d.get('klasse')) || 1,
      farbe: Number(d.get('farbe')) || 0,
      vorlesen: d.get('vorlesen') === 'on',
      werkstatt: d.get('werkstatt') === 'on',
      erstellt: alt ? alt.erstellt : new Date().toISOString(),
    },
  };
}

/** Schaltet „Vorlesen“ passend zur Klasse um, solange niemand den Schalter selbst angefasst hat. */
export function profilFormularBinden(form) {
  const vorlesen = form.querySelector('#pf-vorlesen');
  let beruehrt = false;
  vorlesen.addEventListener('change', () => (beruehrt = true));
  form.addEventListener('change', (ev) => {
    if (ev.target.name === 'klasse' && !beruehrt) vorlesen.checked = Number(ev.target.value) <= 2;
  });
}
