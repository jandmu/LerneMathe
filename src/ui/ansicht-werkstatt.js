/** Werkstatt: Projekt wählen, Teile einbauen, Farbe wählen. */
import { esc } from '../core/util.js';
import { werkstatt, projektWaehlen, teilEinbauen, farbeWaehlen, PROJEKTE } from '../core/belohnung.js';
import { PROJEKT_GRAFIK, projektBild } from './werkstatt-grafik.js';

const KISTE =
  '<svg viewBox="0 0 32 32" class="kiste-icon" aria-hidden="true"><rect x="4" y="12" width="24" height="16" rx="2" fill="#d97706" stroke="#1f2937" stroke-width="2"/><rect x="2" y="7" width="28" height="7" rx="2" fill="#f59e0b" stroke="#1f2937" stroke-width="2"/><rect x="14" y="7" width="4" height="21" fill="#fde68a"/></svg>';

const VORSCHAU = { auto: ['felgen', 'spoiler', 'streifen'], rakete: ['flammen', 'astronaut', 'mond'], baumhaus: ['dach', 'schaukel', 'sonne'], tierpark: ['giraffe', 'pinguin', 'teich'] };

export function zeigeWerkstatt(app, { wahl = false, neu = null, vorschau = null } = {}) {
  if (app.profil.werkstatt === false) return app.geheZu('kind');
  const f = app.fortschritt;
  const w = werkstatt(f);

  if (!w.projekt || wahl) {
    app.setze(
      `<a class="zurueck" href="#/kind">← Zurück</a>
      <h1>${w.projekt ? 'Anderes Projekt wählen' : 'Was möchtest du bauen?'}</h1>
      <p class="lead">Für neue Sterne, die erste Runde am Tag und Wiederholungen bekommst du Kisten. In jeder Kiste ist ein Teil für dein Projekt.</p>
      <ul class="projekt-wahl">
        ${PROJEKTE.map((id) => {
          const teile = w.teile[id] && w.teile[id].length ? w.teile[id] : VORSCHAU[id];
          return `<li><button type="button" class="projekt-karte${id === w.projekt ? ' aktiv' : ''}" data-action="projekt" data-projekt="${id}">
            ${projektBild(id, { teile, farbe: id === w.projekt ? w.farbe : 0 })}
            <span class="projekt-name">${PROJEKT_GRAFIK[id].name}</span>
            ${w.teile[id] && w.teile[id].length ? `<span class="leise">${w.teile[id].length} von 10 Teilen</span>` : ''}
          </button></li>`;
        }).join('')}
      </ul>
      ${w.projekt ? '<p class="leise">Deine eingebauten Teile bleiben erhalten, wenn du das Projekt wechselst.</p>' : ''}`,
      {
        async projekt(el) {
          if (projektWaehlen(f, el.dataset.projekt)) {
            await app.speichern();
            app.sprich(`Super, du baust ${artikel(el.dataset.projekt)}!`);
            zeigeWerkstatt(app);
          }
        },
      }
    );
    return;
  }

  const p = PROJEKT_GRAFIK[w.projekt];
  const drin = w.teile[w.projekt] || [];
  const fertig = drin.length >= p.teile.length;
  const hinweis = fertig
    ? 'Dein Projekt ist fertig! Du kannst ein neues Projekt anfangen.'
    : w.kisten
      ? 'Tippe auf ein Teil, um es einzubauen.'
      : 'Neue Kisten bekommst du für neue Sterne, die erste Runde am Tag und Wiederholungen.';

  app.setze(
    `<a class="zurueck" href="#/kind">← Zurück</a>
    <h1>Dein ${esc(p.name)}</h1>
    <div class="werkstatt-buehne">${projektBild(w.projekt, { farbe: w.farbe, teile: drin, neu, vorschau })}</div>
    <div class="kisten-leiste${w.kisten ? ' voll' : ''}">
      ${KISTE}<span><b>${w.kisten} ${w.kisten === 1 ? 'Kiste' : 'Kisten'}</b><br><span class="leise">${hinweis}</span></span>
    </div>
    <h2>Teile <span class="leise">${drin.length} von ${p.teile.length}</span></h2>
    <ul class="teile-liste">
      ${p.teile
        .map((t) => {
          const ist = drin.includes(t.id);
          const geht = !ist && w.kisten > 0;
          const gewaehlt = vorschau === t.id && !ist;
          const status = ist ? '✓ eingebaut' : gewaehlt ? (geht ? 'Nochmal tippen: einbauen' : 'Dafür brauchst du eine Kiste') : geht ? 'Ansehen' : 'Ansehen · Kiste nötig';
          return `<li><button type="button" class="teil-knopf${ist ? ' eingebaut' : geht ? ' bereit' : ''}${gewaehlt ? ' gewaehlt' : ''}" data-action="teil" data-teil="${t.id}" ${ist ? 'disabled' : ''} aria-pressed="${gewaehlt}">
            <span class="teil-name">${esc(t.name)}</span>
            <span class="teil-status">${status}</span>
          </button></li>`;
        })
        .join('')}
    </ul>
    <h2>Farbe</h2>
    <div class="farb-wahl werkstatt-farben" role="group" aria-label="Farbe wählen">
      ${p.farben
        .map(
          (c, i) =>
            `<button type="button" class="farb-knopf" data-action="farbe" data-farbe="${i}" style="background:${c}" aria-label="Farbe ${i + 1}" aria-pressed="${i === w.farbe}"></button>`
        )
        .join('')}
    </div>
    <div class="knopfreihe"><button type="button" class="knopf" data-action="wechseln">${fertig ? 'Neues Projekt anfangen' : 'Anderes Projekt wählen'}</button></div>`,
    {
      async teil(el) {
        const t = p.teile.find((x) => x.id === el.dataset.teil);
        if (!t) return;
        const name = t.name.replace(/\u00AD/g, '');
        // Erstes Tippen: Vorschau im Bild und Name vorlesen. Zweites Tippen: einbauen (wenn eine Kiste da ist).
        if (vorschau !== t.id || w.kisten < 1) {
          zeigeWerkstatt(app, { vorschau: t.id });
          app.sprich(w.kisten > 0 ? `${name}. Tippe nochmal, dann baue ich es ein.` : `${name}. Dafür brauchst du eine Kiste.`, true);
          const buehne = document.querySelector('.werkstatt-buehne');
          if (buehne) buehne.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          return;
        }
        if (teilEinbauen(f, t.id)) {
          await app.speichern();
          zeigeWerkstatt(app, { neu: t.id });
          app.sprich(`Super! ${name} ist eingebaut.`, true);
          const buehne = document.querySelector('.werkstatt-buehne');
          if (buehne) buehne.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      },
      async farbe(el) {
        farbeWaehlen(f, Number(el.dataset.farbe));
        await app.speichern();
        zeigeWerkstatt(app);
      },
      wechseln() {
        zeigeWerkstatt(app, { wahl: true });
      },
    }
  );
}

function artikel(projekt) {
  return { auto: 'einen Sportwagen', rakete: 'eine Rakete', baumhaus: 'ein Baumhaus', tierpark: 'einen Tierpark' }[projekt] || 'etwas Tolles';
}

/**
 * Vorschau für Eltern: alle Projekte, Farben und Teile frei ein- und ausschalten.
 * Reine Ansicht – der Spielstand der Kinder bleibt unverändert.
 */
export function zeigeWerkstattVorschau(app) {
  const v = app.werkstattVorschau || (app.werkstattVorschau = { projekt: 'auto', farbe: 0, teile: [], neu: null });
  const p = PROJEKT_GRAFIK[v.projekt];
  app.setze(
    `<a class="zurueck" href="#/eltern">← Elternbereich</a>
    <h1>Werkstatt-Vorschau</h1>
    <p class="lead">Hier kannst du alle Projekte und Teile ausprobieren. Der Spielstand der Kinder ändert sich dabei nicht.</p>
    <div class="segment" role="group" aria-label="Projekt">${PROJEKTE.map(
      (id) => `<button type="button" data-action="projekt" data-projekt="${id}" aria-pressed="${id === v.projekt}">${PROJEKT_GRAFIK[id].name}</button>`
    ).join('')}</div>
    <div class="werkstatt-buehne">${projektBild(v.projekt, { farbe: v.farbe, teile: v.teile, neu: v.neu })}</div>
    <div class="knopfreihe">
      <button type="button" class="knopf klein" data-action="alle">Alle Teile</button>
      <button type="button" class="knopf klein" data-action="keine">Keine Teile</button>
    </div>
    <ul class="teile-liste">
      ${p.teile
        .map((t) => {
          const an = v.teile.includes(t.id);
          return `<li><button type="button" class="teil-knopf${an ? ' eingebaut' : ''}" data-action="teil" data-teil="${t.id}" aria-pressed="${an}">
            <span class="teil-name">${esc(t.name)}</span><span class="teil-status">${an ? '✓ an' : 'aus'}</span>
          </button></li>`;
        })
        .join('')}
    </ul>
    <div class="farb-wahl werkstatt-farben" role="group" aria-label="Farbe wählen">
      ${p.farben
        .map((c, i) => `<button type="button" class="farb-knopf" data-action="farbe" data-farbe="${i}" style="background:${c}" aria-label="Farbe ${i + 1}" aria-pressed="${i === v.farbe}"></button>`)
        .join('')}
    </div>`,
    {
      projekt(el) {
        v.projekt = el.dataset.projekt;
        v.teile = [];
        v.neu = null;
        v.farbe = 0;
        zeigeWerkstattVorschau(app);
      },
      teil(el) {
        const id = el.dataset.teil;
        v.neu = v.teile.includes(id) ? null : id;
        v.teile = v.teile.includes(id) ? v.teile.filter((x) => x !== id) : v.teile.concat(id);
        zeigeWerkstattVorschau(app);
      },
      alle() {
        v.teile = p.teile.map((t) => t.id);
        v.neu = null;
        zeigeWerkstattVorschau(app);
      },
      keine() {
        v.teile = [];
        v.neu = null;
        zeigeWerkstattVorschau(app);
      },
      farbe(el) {
        v.farbe = Number(el.dataset.farbe);
        v.neu = null;
        zeigeWerkstattVorschau(app);
      },
    }
  );
}
