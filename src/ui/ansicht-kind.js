/** Startseite des Kindes, Themenseite und Übersicht aller Klassen. */
import { esc } from '../core/util.js';
import { zustand, status, empfehlung, faellige, SITZT_AB } from '../core/lernplan.js';
import { themenFuerKlasse, skillsFuerKlasse, skillInfo, skillId, thema as themaNach, klassenMitInhalt } from '../inhalte/index.js';
import { sterne, statusPille } from './bausteine.js';
import { werkstatt } from '../core/belohnung.js';
import { projektBild } from './werkstatt-grafik.js';

function stufenPunkte(app, t) {
  return `<span class="stufen-punkte" aria-hidden="true">${t.stufen
    .map((s) => `<span class="sp f${Math.min(3, zustand(app.fortschritt, skillId(t, s)).fach)}"></span>`)
    .join('')}</span>`;
}

function themaKarte(app, t) {
  const sitzen = t.stufen.filter((s) => zustand(app.fortschritt, skillId(t, s)).fach >= SITZT_AB).length;
  return `<li><a class="thema-karte" href="#/thema/${t.id}">
    <span class="thema-text">
      <span class="thema-bereich">${esc(t.bereich)}</span>
      <span class="thema-titel">${esc(t.titel)}</span>
      <span class="thema-kurz">${esc(t.kurz)}</span>
    </span>
    <span class="thema-stand">${stufenPunkte(app, t)}<span class="thema-zahl">${sitzen}/${t.stufen.length}</span></span>
  </a></li>`;
}

export function zeigeKind(app) {
  const p = app.profil;
  const f = app.fortschritt;
  const jetzt = app.jetzt();
  const themen = themenFuerKlasse(p.klasse);
  const skills = skillsFuerKlasse(p.klasse);

  if (!themen.length) {
    app.setze(`<section class="kind-start">
      <h1>Hallo, ${esc(p.name)}!</h1>
      <div class="hinweis-karte"><p>Für Klasse ${p.klasse} gibt es noch keine Themen. Sie werden nach und nach ergänzt.</p>
      <a class="knopf primaer" href="#/klassen">Themen anderer Klassen ansehen</a></div>
    </section>`);
    return;
  }

  const emp = empfehlung(skills, f, jetzt);
  const faellig = faellige(f, skills, jetzt);
  const geuebt = skills.some((id) => zustand(f, id).versuche > 0);

  let weiter;
  if (emp) {
    const { thema: t, stufe: s } = skillInfo(emp);
    const themaNeu = t.stufen.every((x) => zustand(f, skillId(t, x)).versuche === 0);
    const stufeNeu = zustand(f, emp).versuche === 0;
    const ziel = themaNeu ? `#/lernen/${t.id}` : stufeNeu ? `#/lernen/${t.id}/${s.id}` : `#/ueben/${t.id}/${s.id}`;
    const knopf = themaNeu ? 'Neues Thema entdecken' : stufeNeu ? 'Zeig mir, wie es geht' : 'Weiter üben';
    weiter = `<a class="weiter-karte" href="${ziel}">
      <span class="etikett">${themaNeu ? 'Neu für dich' : 'Als Nächstes'}</span>
      <span class="weiter-titel">${esc(t.titel)}</span>
      <span class="weiter-stufe">${esc(s.titel)}</span>
      <span class="knopf primaer gross">${knopf} →</span>
    </a>`;
  } else {
    weiter = `<div class="weiter-karte fertig">
      <span class="etikett">Super!</span>
      <span class="weiter-titel">Alles aus Klasse ${p.klasse} sitzt gerade.</span>
      <span class="weiter-stufe">Wiederhole gemischt, damit es so bleibt.</span>
      <a class="knopf primaer gross" href="#/ueben">Gemischt üben →</a>
    </div>`;
  }

  const wiederholen = faellig.length
    ? `<a class="wdh-karte" href="#/ueben"><span class="wdh-zahl">${faellig.length}</span>
        <span><b>Wiederholen</b><br>${faellig.length === 1 ? 'Eine Sache ist' : `${faellig.length} Sachen sind`} heute dran.</span></a>`
    : geuebt
      ? `<a class="wdh-karte leise" href="#/ueben"><span class="wdh-zahl">✓</span><span><b>Gemischt üben</b><br>Heute ist nichts fällig.</span></a>`
      : '';

  app.setze(
    `<section class="kind-start">
      <h1>Hallo, ${esc(p.name)}!</h1>
      <div class="start-karten">${weiter}<div class="start-seite">${wiederholen}${werkstattKarte(app)}</div></div>
      <h2 class="abschnitt">Deine Themen · Klasse ${p.klasse}</h2>
      <ol class="themen">${themen.map((t) => themaKarte(app, t)).join('')}</ol>
      <p class="leise-zeile"><a href="#/klassen">Themen anderer Klassen ansehen</a></p>
    </section>`
  );
}

function werkstattKarte(app) {
  if (app.profil.werkstatt === false) return '';
  const w = werkstatt(app.fortschritt);
  const kisten = w.kisten ? `<span class="kisten-zahl">${w.kisten} ${w.kisten === 1 ? 'Kiste' : 'Kisten'}</span>` : '';
  return `<a class="werkstatt-karte" href="#/werkstatt">
    ${w.projekt ? projektBild(w.projekt, { farbe: w.farbe, teile: w.teile[w.projekt] || [], klein: true }) : ''}
    <span class="werkstatt-zeile"><b>Deine Werkstatt</b>${kisten}</span>
    ${w.projekt ? '' : '<span class="leise">Wähle dein Projekt!</span>'}
  </a>`;
}

export function zeigeThema(app, id) {
  const t = themaNach(id);
  if (!t) return app.geheZu('kind');
  const f = app.fortschritt;
  const jetzt = app.jetzt();
  const ids = t.stufen.map((s) => skillId(t, s));
  const emp = empfehlung(ids, f, jetzt);

  app.setze(
    `<a class="zurueck" href="#/kind">← Zurück</a>
    <header class="thema-kopf">
      <span class="thema-bereich">${esc(t.bereich)} · Klasse ${t.klasse}</span>
      <h1>${esc(t.titel)}</h1>
      <p class="lead">${esc(t.kurz)}</p>
      <div class="knopfreihe"><a class="knopf" href="#/lernen/${t.id}">Erklärung ansehen</a></div>
    </header>
    <ol class="stufen-liste">
      ${t.stufen
        .map((s) => {
          const sid = skillId(t, s);
          const z = zustand(f, sid);
          const st = status(z, jetzt);
          const naechstes = sid === emp;
          return `<li class="stufe${naechstes ? ' naechstes' : ''}">
            <div class="stufe-info">
              <span class="stufe-titel">${esc(s.titel)}${naechstes ? ' <span class="pille p-naechstes">Als Nächstes</span>' : ''}</span>
              <span class="stufe-stand">${sterne(z.fach)}${statusPille(st)}</span>
            </div>
            <div class="stufe-knoepfe">
              <a class="knopf klein" href="#/lernen/${t.id}/${s.id}">Beispiel</a>
              <a class="knopf klein primaer" href="#/ueben/${t.id}/${s.id}">Üben</a>
            </div>
          </li>`;
        })
        .join('')}
    </ol>`
  );
}

export function zeigeKlassen(app) {
  app.setze(
    `<a class="zurueck" href="#/kind">← Zurück</a>
    <h1>Alle Themen</h1>
    <p class="lead">Hier findest du die Themen aller Klassen, für die es schon Inhalte gibt.</p>
    ${klassenMitInhalt()
      .map((k) => `<h2 class="abschnitt">Klasse ${k}</h2><ol class="themen">${themenFuerKlasse(k).map((t) => themaKarte(app, t)).join('')}</ol>`)
      .join('')}`
  );
}
