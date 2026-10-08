/**
 * Mathewerkstatt – Einstieg: Zustand, Datenzugriff, Navigation.
 *
 * Adressen (Hash-Routen):
 *   #/                      Wer rechnet heute? (Profilauswahl, beim ersten Start: Profile anlegen)
 *   #/kind                  Startseite des Kindes
 *   #/thema/<thema>         Thema mit seinen Stufen
 *   #/lernen/<thema>[/<stufe>]   Lernpfad: Erklären → Vormachen → Mitmachen
 *   #/ueben[/<thema>/<stufe>]    Übungsrunde (ohne Angabe: gemischte Wiederholung)
 *   #/klassen               Themen aller Klassen
 *   #/werkstatt             Werkstatt (Belohnungen: Projekt bauen)
 *   #/eltern                Elternbereich
 */
import { Datenbank, LokalesBackend } from './core/speicher.js';
import { sprich, stopp, einstellen } from './ui/sprache.js';
import { avatar } from './ui/bausteine.js';
import { esc } from './core/util.js';
import { zeigeStart } from './ui/ansicht-start.js';
import { zeigeKind, zeigeThema, zeigeKlassen } from './ui/ansicht-kind.js';
import { zeigeLernen } from './ui/ansicht-lernen.js';
import { zeigeRunde } from './ui/ansicht-runde.js';
import { zeigeEltern } from './ui/ansicht-eltern.js';
import { zeigeWerkstatt } from './ui/ansicht-werkstatt.js';

const AKTIVES_PROFIL = 'mathewerkstatt:aktiv';

/** Wird bei jeder Veröffentlichung hochgezählt und im Elternbereich angezeigt. */
export const VERSION = '0.10 · 8.10.2026';

const app = {
  db: new Datenbank(new LokalesBackend()),
  main: document.getElementById('inhalt'),
  kopf: document.getElementById('kopf-profil'),
  profile: [],
  profil: null,
  fortschritt: null,
  aktionen: {},
  aufraeumen: null,

  version: VERSION,
  jetzt: () => Date.now(),

  klein() {
    return !!this.profil && this.profil.klasse <= 2;
  },

  /** Liest vor, wenn das Profil Vorlesen eingeschaltet hat. */
  sprich(text, immer = false) {
    if (immer || (this.profil && this.profil.vorlesen)) sprich(text);
  },

  async profileLaden() {
    this.profile = await this.db.profile();
    return this.profile;
  },

  async profilAktivieren(id) {
    const p = this.profile.find((x) => x.id === id) || (await this.db.profil(id));
    if (!p) return false;
    this.profil = p;
    this.fortschritt = await this.db.fortschritt(p.id);
    try {
      sessionStorage.setItem(AKTIVES_PROFIL, p.id);
    } catch (e) {
      /* ohne Sitzungsspeicher weiter */
    }
    document.documentElement.classList.toggle('klein', this.klein());
    document.documentElement.dataset.kindfarbe = String(p.farbe || 0);
    return true;
  },

  profilAbmelden() {
    this.profil = null;
    this.fortschritt = null;
    try {
      sessionStorage.removeItem(AKTIVES_PROFIL);
    } catch (e) {
      /* ignorieren */
    }
    document.documentElement.classList.remove('klein');
    delete document.documentElement.dataset.kindfarbe;
  },

  async speichern() {
    if (this.profil && this.fortschritt) await this.db.fortschrittSpeichern(this.profil.id, this.fortschritt);
  },

  geheZu(pfad) {
    const ziel = '#/' + pfad.replace(/^#?\/?/, '');
    if (location.hash === ziel) route();
    else location.hash = ziel;
  },

  /** Ersetzt den Seiteninhalt. aktionen: { name: (element, event) => … } für Klicks auf [data-action]. */
  setze(html, aktionen = {}) {
    if (this.aufraeumen) {
      this.aufraeumen();
      this.aufraeumen = null;
    }
    this.main.innerHTML = html;
    this.aktionen = aktionen;
  },
};

app.main.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const f = app.aktionen[el.dataset.action];
  if (f) {
    ev.preventDefault();
    f(el, ev);
  }
});

function kopfZeigen() {
  if (!app.kopf) return;
  if (app.profil) {
    app.kopf.innerHTML = `<a class="profil-chip" href="#/kind">${avatar(app.profil)}<span>${esc(app.profil.name)}</span></a>
      <a class="kopf-link" href="#/">Wechseln</a>`;
  } else {
    app.kopf.innerHTML = `<a class="kopf-link" href="#/eltern">Eltern</a>`;
  }
}

async function route() {
  stopp();
  const teile = (location.hash || '').replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [ort, ...rest] = teile;

  const brauchtProfil = ['kind', 'thema', 'lernen', 'ueben', 'klassen', 'werkstatt'].includes(ort);
  if (brauchtProfil && !app.profil) {
    let gemerkt = null;
    try {
      gemerkt = sessionStorage.getItem(AKTIVES_PROFIL);
    } catch (e) {
      /* ignorieren */
    }
    if (!gemerkt || !(await app.profilAktivieren(gemerkt))) {
      app.geheZu('');
      return;
    }
  }

  if (!ort && app.profil) app.profilAbmelden();
  kopfZeigen();

  try {
    if (ort === 'kind') zeigeKind(app);
    else if (ort === 'thema') zeigeThema(app, rest[0]);
    else if (ort === 'lernen') zeigeLernen(app, rest[0], rest[1]);
    else if (ort === 'ueben') zeigeRunde(app, rest.length >= 2 ? rest[0] + '/' + rest[1] : null);
    else if (ort === 'klassen') zeigeKlassen(app);
    else if (ort === 'eltern') await zeigeEltern(app, rest[0]);
    else if (ort === 'werkstatt') zeigeWerkstatt(app);
    else await zeigeStart(app);
  } catch (fehler) {
    console.error(fehler);
    app.setze(`<div class="hinweis-karte"><h1>Da ist etwas schiefgegangen.</h1>
      <p>${esc(fehler.message || fehler)}</p><a class="knopf primaer" href="#/">Zur Startseite</a></div>`);
  }
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);

(async () => {
  einstellen(await app.db.geraet());
  await app.profileLaden();
  await route();
})();

// Offline-Nutzung, wenn die App über https ausgeliefert wird.
try {
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    // Übernimmt ein neuer Service Worker (neue App-Version), einmal neu laden,
    // damit nur Dateien der neuen Version laufen.
    const hatteSchonEinen = !!navigator.serviceWorker.controller;
    let neuGeladen = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hatteSchonEinen || neuGeladen) return;
      neuGeladen = true;
      location.reload();
    });
    navigator.serviceWorker
      .register('sw.js')
      .then((reg) => reg.update())
      .catch(() => {});
  }
} catch (e) {
  /* nicht unterstützt */
}
