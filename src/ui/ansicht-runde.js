/**
 * Übungsrunde.
 *   - Gezählt wird nur der erste Versuch (Abrufübung).
 *   - Nach einem Fehler gibt es eine gezielte Rückmeldung und einen zweiten Versuch.
 *   - Nach dem zweiten Fehler wird der Lösungsweg gezeigt (Lösungsbeispiel als Rückmeldung).
 *   - Falsch gelöste Fertigkeiten kommen in derselben Runde noch einmal dran (höchstens 3 Zusatzaufgaben).
 *   - Am Ende wird die Lernkartei aktualisiert.
 */
import { esc, wahl } from '../core/util.js';
import { rundePlanen, antwortEintragen, rundeAuswerten, zustand } from '../core/lernplan.js';
import { skillsFuerKlasse, skillInfo, aufgabeFuer, rundenGroesse } from '../inhalte/index.js';
import { aufgabeHTML, schritteHTML, ergebnisBox, sterne, vorleseText } from './bausteine.js';
import { eingabeHTML, eingabeBinden, eingabeFokus, eingabeWerte, vorfuehren } from './eingabe.js';
import { tagesbeginn, TAG_MS } from '../core/util.js';

const LOB = ['Richtig!', 'Genau!', 'Stimmt!', 'Super gerechnet!', 'Klasse!', 'Prima!'];
const MAX_ZUSATZ = 3;

export function zeigeRunde(app, fokus) {
  const p = app.profil;
  const f = app.fortschritt;
  const skills = skillsFuerKlasse(p.klasse);
  if (fokus && !skillInfo(fokus)) fokus = null;
  if (!fokus && !skills.length) return app.geheZu('kind');

  const plan = rundePlanen({ skillIds: skills, f, fokus, anzahl: rundenGroesse(p.klasse), jetzt: app.jetzt() });
  const r = { plan, i: 0, ergebnisse: [], zusatz: 0, gesehen: new Set(), c: null };

  function naechsteAufgabe() {
    const skill = r.plan[r.i];
    let a;
    for (let v = 0; v < 12; v++) {
      a = aufgabeFuer(skill);
      if (!r.gesehen.has(a.schluessel)) break;
    }
    r.gesehen.add(a.schluessel);
    // nachueben: Beim Ziffernschreiben darf nach zwei Fehlversuchen ohne Wertung weitergeübt werden.
    r.c = { a, versuche: 0, erster: null, fertig: false, nachueben: false, weg: false, meldung: '', werte: {} };
  }

  function fortschrittsLeiste() {
    return `<div class="runde-leiste" aria-label="Aufgabe ${r.i + 1} von ${r.plan.length}">
      ${r.plan
        .map((_, k) => {
          const e = r.ergebnisse[k];
          const cls = k === r.i ? 'aktiv' : e ? (e.richtig ? 'ok' : 'nein') : '';
          return `<span class="rl ${cls}"></span>`;
        })
        .join('')}
    </div>`;
  }

  function zeichnen() {
    const c = r.c;
    const a = c.a;
    const info = skillInfo(a.skill);
    const spur = a.eingabe.art === 'spur';
    const gesperrt = c.fertig && !c.nachueben;
    const weiterKnopf = '<button type="button" class="knopf primaer gross" data-action="weiter" id="weiter">Weiter →</button>';
    app.setze(
      `<div class="runde-kopf">
        ${fortschrittsLeiste()}
        <button type="button" class="knopf leise klein" data-action="beenden">Runde beenden</button>
      </div>
      <article class="karte aufgabe-karte" id="aufgabe">
        <div class="karte-kopf"><span class="tag">${esc(info.thema.titel)} · ${esc(info.stufe.titel)}</span><span class="nr">${r.i + 1} / ${r.plan.length}</span></div>
        ${aufgabeHTML(a, { vorlesen: true })}
        ${spur ? `<div class="rueckmeldung" role="status" aria-live="polite">${c.meldung}</div>` : ''}
        ${spur && c.fertig ? `<div class="knopfreihe mitte">${weiterKnopf}</div>` : ''}
        ${eingabeHTML(a, { klein: app.klein(), gesperrt, werte: c.werte })}
        ${spur ? '' : `<div class="rueckmeldung" role="status" aria-live="polite">${c.meldung}</div>`}
        <div class="knopfreihe">
          ${c.fertig && !spur ? weiterKnopf : ''}
          ${c.weg ? '' : '<button type="button" class="knopf leise" data-action="weg">Lösungsweg zeigen</button>'}
        </div>
        ${c.weg ? `<div class="loesungsweg"><h2>So geht’s</h2>${schritteHTML(a.weg)}${ergebnisBox(a)}</div>` : ''}
      </article>`,
      {
        vorlesen: () => app.sprich(vorleseText(a), true),
        weiter,
        weg: () => wegZeigen(),
        beenden: () => ende(),
      }
    );
    const karte = document.getElementById('aufgabe');
    const loesen = [];
    if (!gesperrt) {
      loesen.push(eingabeBinden(karte, a, pruefen));
      if (!c.fertig) eingabeFokus(karte);
    }
    if (c.fertig) {
      const enter = (ev) => {
        if (ev.key === 'Enter' && !ev.repeat) {
          ev.preventDefault();
          weiter();
        }
      };
      document.addEventListener('keydown', enter);
      loesen.push(() => document.removeEventListener('keydown', enter));
      const w = document.getElementById('weiter');
      if (w && !c.nachueben && window.matchMedia && window.matchMedia('(pointer: fine)').matches) w.focus();
    }
    app.aufraeumen = () => loesen.forEach((f) => f());
  }

  /** Spielt beim Ziffernschreiben den Schreibweg (erneut) vor. */
  function nochmalVorfuehren() {
    const svg = document.querySelector('#aufgabe .spur-svg');
    if (svg) setTimeout(() => vorfuehren(svg), 300);
  }

  function erstenVersuchWerten(richtig, fehler) {
    const c = r.c;
    if (c.erster !== null) return;
    c.erster = richtig;
    antwortEintragen(f, c.a.skill, { richtig, fehler, jetzt: app.jetzt() });
    r.ergebnisse[r.i] = { skill: c.a.skill, richtig };
    if (!richtig && r.zusatz < MAX_ZUSATZ) {
      r.plan.push(c.a.skill);
      r.zusatz++;
    }
    app.speichern();
  }

  function pruefen(antwort) {
    const c = r.c;
    if (c.fertig && !c.nachueben) return;
    const karte = document.getElementById('aufgabe');
    const erg = c.a.pruefe(antwort);
    c.werte = eingabeWerte(karte, c.a);
    if (erg.status === 'ungueltig') {
      c.meldung = `<div class="meldung info"><p>${erg.text}</p></div>`;
      zeichnen();
      app.sprich(erg.text);
      return;
    }
    c.versuche++;
    erstenVersuchWerten(erg.status === 'richtig', erg.fehler);
    if (c.nachueben) {
      // Weiterüben ohne Wertung (nur beim Ziffernschreiben)
      if (erg.status === 'richtig') {
        c.nachueben = false;
        c.meldung = `<div class="meldung ok"><span class="meldung-titel">Jetzt klappt’s!</span>${c.a.nachRichtig ? `<p><b>${c.a.nachRichtig}</b></p>` : ''}</div>`;
        app.sprich(c.a.nachRichtig ? `Jetzt klappt es! ${c.a.nachRichtig}` : 'Jetzt klappt es!');
      } else {
        c.meldung = `<div class="meldung falsch"><span class="meldung-titel">Noch nicht.</span><p>${erg.text || c.a.hinweis}</p><p class="leise">Schau zu und probier es noch einmal.</p></div>`;
        app.sprich(erg.text || c.a.hinweis);
      }
      zeichnen();
      if (c.nachueben) nochmalVorfuehren();
      return;
    }
    if (erg.status === 'richtig') {
      c.fertig = true;
      const lob = c.versuche === 1 ? wahl(LOB) : 'Jetzt stimmt’s!';
      const zusatz = (c.versuche === 1 ? '' : '<p>Gut, dass du drangeblieben bist.</p>') + (c.a.nachRichtig ? `<p><b>${c.a.nachRichtig}</b></p>` : '');
      c.meldung = `<div class="meldung ok"><span class="meldung-titel">${lob}</span>${zusatz}</div>`;
      app.sprich(c.a.nachRichtig ? `${lob} ${c.a.nachRichtig}` : lob);
    } else if (c.versuche >= 2 && c.a.eingabe.art === 'spur') {
      c.fertig = true;
      c.nachueben = true;
      c.meldung = `<div class="meldung falsch"><span class="meldung-titel">Schau mal, so geht’s.</span><p>${erg.text || ''}</p><p class="leise">Schau zu und probier es noch einmal.</p></div>`;
      app.sprich(`Schau mal, so geht es. ${erg.text || ''}`);
      zeichnen();
      nochmalVorfuehren();
      return;
    } else if (c.versuche >= 2) {
      c.fertig = true;
      c.weg = true;
      c.meldung = `<div class="meldung falsch"><span class="meldung-titel">Schau mal, so geht’s.</span><p>${erg.text || ''} Lies den Lösungsweg in Ruhe durch.</p></div>`;
      app.sprich('Schau mal, so geht es.');
    } else {
      const titel = erg.status === 'fast' ? 'Fast!' : 'Noch nicht.';
      c.meldung = `<div class="meldung ${erg.status === 'fast' ? 'fast' : 'falsch'}"><span class="meldung-titel">${titel}</span><p>${erg.text || c.a.hinweis}</p><p class="leise">Versuch es noch einmal.</p></div>`;
      if (erg.status !== 'fast') c.werte = {};
      app.sprich(`${titel} ${erg.text || c.a.hinweis}`);
    }
    zeichnen();
  }

  function wegZeigen() {
    const c = r.c;
    erstenVersuchWerten(false, null);
    c.weg = true;
    c.fertig = true;
    if (c.a.eingabe.art === 'spur') c.nachueben = true;
    if (!c.meldung || c.versuche === 0) c.meldung = '';
    zeichnen();
    const weg = document.querySelector('.loesungsweg');
    if (weg) weg.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function weiter() {
    r.i++;
    if (r.i >= r.plan.length) return ende();
    naechsteAufgabe();
    zeichnen();
    app.sprich(vorleseText(r.c.a), r.c.a.immerVorlesen);
  }

  async function ende() {
    const jetzt = app.jetzt();
    const ergebnisse = r.ergebnisse.filter(Boolean);
    const aenderungen = rundeAuswerten(f, ergebnisse, jetzt);
    await app.speichern();
    const n = ergebnisse.length;
    const richtig = ergebnisse.filter((e) => e.richtig).length;
    const quote = n ? richtig / n : 0;
    const botschaft = !n
      ? 'Diesmal hast du keine Aufgabe gelöst. Versuch es gleich noch einmal!'
      : quote >= 0.9
        ? 'Das sitzt schon richtig gut.'
        : quote >= 0.6
          ? 'Gute Arbeit! Mit jeder Runde wird es leichter.'
          : 'Das war heute schwer. Genau beim Üben von schweren Aufgaben lernt dein Gehirn am meisten. Schau dir die Beispiele ruhig noch einmal an.';

    const naechsteWdh = (z) => {
      const tage = Math.round((tagesbeginn(z.faellig) - tagesbeginn(jetzt)) / TAG_MS);
      return tage <= 0 ? 'heute noch einmal' : tage === 1 ? 'morgen wieder' : `in ${tage} Tagen wieder`;
    };

    app.setze(
      `<article class="karte runde-ende">
        <h1>Runde geschafft!</h1>
        ${n ? `<p class="ende-zahl"><b>${richtig}</b> von ${n} beim ersten Versuch richtig</p>` : ''}
        <p>${botschaft}</p>
        ${
          aenderungen.length
            ? `<ul class="aenderungen">${aenderungen
                .map((ae) => {
                  const info = skillInfo(ae.skill);
                  const z = zustand(f, ae.skill);
                  const text = ae.nachher > ae.vorher ? 'Neuer Stern!' : ae.nachher < ae.vorher ? 'Üben wir bald wieder' : 'Bleibt gleich';
                  return `<li><div><b>${esc(info.thema.titel)}</b> · ${esc(info.stufe.titel)}<br><span class="leise">${text} · dran ${naechsteWdh(z)}</span></div>${sterne(ae.nachher)}</li>`;
                })
                .join('')}</ul>`
            : ''
        }
        <div class="knopfreihe">
          <button type="button" class="knopf primaer gross" data-action="nochmal">Noch eine Runde</button>
          <a class="knopf" href="#/kind">Zur Startseite</a>
        </div>
      </article>`,
      {
        nochmal: () => zeigeRunde(app, fokus),
      }
    );
    app.sprich(n ? `Runde geschafft! ${richtig} von ${n} richtig.` : 'Runde beendet.');
  }

  naechsteAufgabe();
  zeichnen();
  app.sprich(vorleseText(r.c.a), r.c.a.immerVorlesen);
}
