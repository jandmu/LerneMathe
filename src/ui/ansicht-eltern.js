/**
 * Elternbereich: Profile verwalten, Lernstand und typische Fehler ansehen, Daten sichern.
 * Eine kleine Rechenaufgabe schützt vor versehentlichem Öffnen durch jüngere Kinder (keine Sicherheitsfunktion).
 */
import { esc, zufall, TAG_MS, tagesbeginn } from '../core/util.js';
import { zustand, status } from '../core/lernplan.js';
import { FEHLERBILDER } from '../core/aufgabe.js';
import { THEMEN, skillId, skillsFuerKlasse } from '../inhalte/index.js';
import { avatar, sterne, statusPille } from './bausteine.js';
import { profilFormular, profilLesen, profilFormularBinden } from './profilformular.js';
import { zeigeWerkstattVorschau } from './ansicht-werkstatt.js';
import { deutscheStimmen, beiStimmenGeladen, einstellen, sprich, kannSprechen, aktuelleStimme, stimmenGesamt, neuLaden } from './sprache.js';

const TEMPI = [
  ['0.8', 'Langsam'],
  ['0.95', 'Normal'],
  ['1.1', 'Zügig'],
];

export async function zeigeEltern(app, unterseite) {
  if (!app.elternOffen) return sperre(app, unterseite);
  if (unterseite === 'werkstatt') return zeigeWerkstattVorschau(app);
  const profile = await app.profileLaden();
  const ansicht = app.elternAnsicht || (app.elternAnsicht = { auswahl: profile[0] ? profile[0].id : null, bearbeiten: null, neu: false, loeschen: null, allesLoeschen: false });
  if (ansicht.auswahl && !profile.some((p) => p.id === ansicht.auswahl)) ansicht.auswahl = profile[0] ? profile[0].id : null;

  const geraet = await app.db.geraet();
  const geraetSichern = async () => {
    await app.db.geraetSpeichern(geraet);
    einstellen(geraet);
  };
  const gewaehlt = profile.find((p) => p.id === ansicht.auswahl);
  const lernstand = gewaehlt ? await lernstandHTML(app, gewaehlt) : '<p class="leise">Noch keine Profile angelegt.</p>';

  app.setze(
    `<h1>Elternbereich</h1>
    <section class="eltern-abschnitt">
      <h2>Kinder</h2>
      <ul class="eltern-profile">
        ${profile.map((p) => profilZeile(p, ansicht)).join('')}
      </ul>
      ${ansicht.neu ? `<div class="karte"><h3>Kind hinzufügen</h3>${profilFormular(null, { abbrechen: true, knopf: 'Anlegen' })}</div>` : '<button type="button" class="knopf" data-action="neu">+ Kind hinzufügen</button>'}
    </section>

    <section class="eltern-abschnitt">
      <h2>Lernstand</h2>
      ${
        profile.length > 1
          ? `<div class="segment" role="group" aria-label="Kind wählen">${profile
              .map((p) => `<button type="button" data-action="auswahl" data-id="${esc(p.id)}" aria-pressed="${p.id === ansicht.auswahl}">${esc(p.name)}</button>`)
              .join('')}</div>`
          : ''
      }
      ${lernstand}
    </section>

    <section class="eltern-abschnitt">
      <h2>Werkstatt</h2>
      <p class="leise">Kinder bekommen Kisten für neue Sterne, die erste Runde am Tag und Wiederholungen. In der Vorschau kannst du alle Projekte und Teile ansehen, ohne den Spielstand zu ändern.</p>
      <div class="knopfreihe"><a class="knopf" href="#/eltern/werkstatt">Werkstatt-Vorschau öffnen</a></div>
    </section>

    <section class="eltern-abschnitt">
      <h2>Vorlesestimme</h2>
      <p class="leise">Die Stimme kommt vom Gerät. Die Auswahl gilt nur für dieses Gerät.</p>
      <div id="stimme-wahl" class="stimme-wahl"></div>
      <details class="anleitung">
        <summary>Natürlichere Stimmen installieren</summary>
        <ul>
          <li><b>iPhone und iPad:</b> Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Deutsch.
            Eine Stimme mit „Premium“ oder „Erweitert“ laden, z. B. Anna oder Helena.</li>
          <li><b>Mac:</b> Systemeinstellungen → Bedienungshilfen → Gesprochene Inhalte → Systemstimme → Stimmen verwalten.</li>
          <li><b>Android:</b> Einstellungen → Sprachen und Eingabe → Sprachausgabe (Text-in-Sprache) → Google-Sprachausgabe →
            Sprachdaten installieren → Deutsch. Die Menüs heißen je nach Gerät etwas anders. Am besten in Chrome öffnen.</li>
          <li><b>Windows:</b> Im Browser Microsoft Edge gibt es sehr natürliche Online-Stimmen, z. B. „Katja Online (Natural)“ oder „Seraphina“.</li>
        </ul>
        <p class="leise">Danach die App neu laden und hier die neue Stimme auswählen.</p>
      </details>
    </section>

    <section class="eltern-abschnitt">
      <h2>Daten</h2>
      <p class="leise">Alle Daten liegen nur in diesem Browser. Mit einer Sicherung kannst du sie auf ein anderes Gerät mitnehmen.</p>
      <div class="knopfreihe">
        <button type="button" class="knopf" data-action="export">Sicherung herunterladen</button>
        <label class="knopf datei-knopf">Sicherung einspielen<input type="file" id="import-datei" accept="application/json,.json" class="sr-only"></label>
        ${ansicht.allesLoeschen ? '' : '<button type="button" class="knopf leise" data-action="alles-frage">Alle Daten löschen</button>'}
      </div>
      ${
        ansicht.allesLoeschen
          ? `<div class="bestaetigen"><p>Wirklich alle Profile und Lernstände löschen? Das lässt sich nicht rückgängig machen.</p>
             <div class="knopfreihe"><button type="button" class="knopf gefahr" data-action="alles-ja">Ja, alles löschen</button>
             <button type="button" class="knopf" data-action="alles-nein">Abbrechen</button></div></div>`
          : ''
      }
      <p class="formular-fehler" id="daten-meldung" role="status" hidden></p>
    </section>

    <section class="eltern-abschnitt">
      <h2>So lernt die App</h2>
      <ul class="prinzipien">
        <li><b>Vom Bild zur Zahl:</b> Neue Inhalte starten mit Plättchen, Zahlenhaus oder Bruchstreifen. Später verschwinden die Bilder.</li>
        <li><b>Vormachen, mitmachen, selbst machen:</b> Erst ein vorgerechnetes Beispiel, dann eins zum Zu-Ende-Rechnen, dann allein.</li>
        <li><b>Abrufen statt Wiederlesen:</b> Kurze Runden mit sofortiger, erklärender Rückmeldung. Gezählt wird der erste Versuch.</li>
        <li><b>Verteilt wiederholen:</b> Was sitzt, kommt nach 3, 7, 14 und 30 Tagen wieder. Ein Stern kommt erst dazu, wenn es auch am nächsten Tag noch klappt.</li>
        <li><b>Gemischt üben:</b> Wiederholungen werden in die Runden eingestreut, damit Kinder lernen, welcher Rechenweg wann passt.</li>
        <li><b>Typische Fehler erkennen:</b> Häufige Fehlvorstellungen bekommen eine eigene Erklärung und erscheinen hier im Lernstand.</li>
        <li><b>Ohne Druck:</b> Keine Zeitlimits, keine Ranglisten. Gelobt werden Anstrengung und Rechenweg.</li>
      </ul>
    </section>
    <p><a class="knopf" href="#/">Zur Profilauswahl</a></p>
    <p class="leise">Version ${esc(app.version || '')}</p>`,
    {
      async tempo(el) {
        geraet.tempo = Number(el.dataset.wert);
        await geraetSichern();
        stimmeZeigen();
        sprich('Wie viel ist acht plus fünf?');
      },
      'stimmen-neu'() {
        neuLaden();
        stimmeZeigen();
      },
      probe() {
        sprich('Hallo! Wie viel ist acht plus fünf? Fülle zuerst bis zur Zehn auf.');
      },
      auswahl(el) {
        ansicht.auswahl = el.dataset.id;
        zeigeEltern(app);
      },
      neu() {
        ansicht.neu = true;
        ansicht.bearbeiten = null;
        zeigeEltern(app);
      },
      bearbeiten(el) {
        ansicht.bearbeiten = el.dataset.id;
        ansicht.neu = false;
        zeigeEltern(app);
      },
      'profil-abbrechen'() {
        ansicht.bearbeiten = null;
        ansicht.neu = false;
        zeigeEltern(app);
      },
      loeschen(el) {
        ansicht.loeschen = el.dataset.id;
        zeigeEltern(app);
      },
      'loeschen-nein'() {
        ansicht.loeschen = null;
        zeigeEltern(app);
      },
      async 'loeschen-ja'(el) {
        await app.db.profilLoeschen(el.dataset.id);
        ansicht.loeschen = null;
        zeigeEltern(app);
      },
      async export() {
        const daten = await app.db.exportieren();
        const blob = new Blob([JSON.stringify(daten, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mathewerkstatt-sicherung-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      'alles-frage'() {
        ansicht.allesLoeschen = true;
        zeigeEltern(app);
      },
      'alles-nein'() {
        ansicht.allesLoeschen = false;
        zeigeEltern(app);
      },
      async 'alles-ja'() {
        for (const p of profile) await app.db.profilLoeschen(p.id);
        app.elternAnsicht = null;
        app.elternOffen = false;
        app.geheZu('');
      },
    }
  );

  function stimmeZeigen() {
    const el = document.getElementById('stimme-wahl');
    if (!el) return;
    if (!kannSprechen()) {
      el.innerHTML = '<p>Dieser Browser kann nicht vorlesen.</p>';
      return;
    }
    const liste = deutscheStimmen();
    const diagnose = `<p class="leise">Der Browser meldet ${liste.length} deutsche ${liste.length === 1 ? 'Stimme' : 'Stimmen'} (${stimmenGesamt()} insgesamt).
      <button type="button" class="knopf klein leise" data-action="stimmen-neu">Neu suchen</button></p>`;
    if (!liste.length) {
      el.innerHTML = '<p>Auf diesem Gerät wurde noch keine deutsche Stimme gefunden. Siehe Anleitung unten.</p>' + diagnose;
      return;
    }
    const aktiv = aktuelleStimme();
    const tempo = String(geraet.tempo || 0.95);
    el.innerHTML = `<label class="feld"><span class="feld-name">Stimme</span>
        <select id="stimme">${liste
          .map((v, i) => `<option value="${esc(v.voiceURI)}" ${aktiv && v.voiceURI === aktiv.voiceURI ? 'selected' : ''}>${esc(v.name)}${v.localService === false ? ' (online)' : ''}${i === 0 ? ' – empfohlen' : ''}</option>`)
          .join('')}</select></label>
      <div class="feld"><span class="feld-name">Sprechtempo</span>
        <div class="segment" role="group" aria-label="Sprechtempo">${TEMPI.map(
          ([w, n]) => `<button type="button" data-action="tempo" data-wert="${w}" aria-pressed="${Number(w) === Number(tempo)}">${n}</button>`
        ).join('')}</div></div>
      <div class="knopfreihe"><button type="button" class="knopf" data-action="probe">Probe hören</button></div>
      ${diagnose}`;
    el.querySelector('#stimme').addEventListener('change', async (ev) => {
      geraet.stimme = ev.target.value;
      await geraetSichern();
      sprich('Hallo! Ich lese dir die Aufgaben vor.');
    });
  }
  stimmeZeigen();
  app.aufraeumen = beiStimmenGeladen(stimmeZeigen);

  const form = document.getElementById('profil-form');
  if (form) {
    profilFormularBinden(form);
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const alt = profile.find((p) => p.id === form.dataset.id) || null;
      const { profil, fehler } = profilLesen(form, alt);
      if (fehler) {
        const f = document.getElementById('pf-fehler');
        f.textContent = fehler;
        f.hidden = false;
        return;
      }
      await app.db.profilSpeichern(profil);
      ansicht.bearbeiten = null;
      ansicht.neu = false;
      if (!ansicht.auswahl) ansicht.auswahl = profil.id;
      zeigeEltern(app);
    });
  }

  const datei = document.getElementById('import-datei');
  datei.addEventListener('change', async () => {
    const meldung = document.getElementById('daten-meldung');
    const file = datei.files && datei.files[0];
    if (!file) return;
    try {
      await app.db.importieren(JSON.parse(await file.text()));
      meldung.textContent = 'Sicherung eingespielt.';
      meldung.hidden = false;
      setTimeout(() => zeigeEltern(app), 800);
    } catch (e) {
      meldung.textContent = 'Die Datei konnte nicht gelesen werden: ' + e.message;
      meldung.hidden = false;
    }
  });
}

function profilZeile(p, ansicht) {
  if (ansicht.bearbeiten === p.id) return `<li class="karte">${profilFormular(p, { abbrechen: true })}</li>`;
  return `<li class="eltern-profil">
    ${avatar(p)}
    <div class="ep-text"><b>${esc(p.name)}</b><span class="leise">Klasse ${p.klasse} · Vorlesen ${p.vorlesen ? 'an' : 'aus'}</span></div>
    ${
      ansicht.loeschen === p.id
        ? `<div class="bestaetigen inline"><span>${esc(p.name)} mit allem Lernstand löschen?</span>
            <button type="button" class="knopf klein gefahr" data-action="loeschen-ja" data-id="${esc(p.id)}">Löschen</button>
            <button type="button" class="knopf klein" data-action="loeschen-nein">Abbrechen</button></div>`
        : `<div class="knopfreihe"><button type="button" class="knopf klein" data-action="bearbeiten" data-id="${esc(p.id)}">Bearbeiten</button>
           <button type="button" class="knopf klein leise" data-action="loeschen" data-id="${esc(p.id)}">Löschen</button></div>`
    }
  </li>`;
}

function datum(t) {
  if (!t) return '–';
  const tage = Math.round((tagesbeginn(Date.now()) - tagesbeginn(t)) / TAG_MS);
  if (tage === 0) return 'heute';
  if (tage === 1) return 'gestern';
  if (tage < 7) return `vor ${tage} Tagen`;
  return new Date(t).toLocaleDateString('de-DE');
}

async function lernstandHTML(app, p) {
  const f = await app.db.fortschritt(p.id);
  const jetzt = Date.now();
  const seit = tagesbeginn(jetzt) - 6 * TAG_MS;
  const woche = f.ereignisse.filter((e) => e.t >= seit);
  const tage = new Set(woche.map((e) => tagesbeginn(e.t))).size;
  const quote = woche.length ? Math.round((woche.filter((e) => e.r).length / woche.length) * 100) + ' %' : '–';
  const eigene = skillsFuerKlasse(p.klasse);
  const faellig = eigene.filter((id) => {
    const z = zustand(f, id);
    return z.fach >= 1 && z.faellig <= jetzt;
  }).length;

  const fehlerSumme = {};
  for (const z of Object.values(f.skills)) for (const [k, v] of Object.entries(z.fehler || {})) fehlerSumme[k] = (fehlerSumme[k] || 0) + v;
  const topFehler = Object.entries(fehlerSumme)
    .filter(([k]) => k !== 'allgemein')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const zeilen = THEMEN.flatMap((t) =>
    t.stufen
      .map((s) => ({ t, s, id: skillId(t, s) }))
      .filter(({ id, t: th }) => th.klasse === p.klasse || zustand(f, id).versuche > 0)
  );

  const tabelle = zeilen
    .map(({ t, s, id }) => {
      const z = zustand(f, id);
      const fehlerTop = Object.entries(z.fehler || {})
        .filter(([k]) => k !== 'allgemein')
        .sort((a, b) => b[1] - a[1])[0];
      return `<tr>
        <td><b>${esc(t.titel)}</b><br><span class="leise">${esc(s.titel)}</span></td>
        <td>${sterne(z.fach)}<br>${statusPille(status(z, jetzt))}</td>
        <td class="zahl">${z.versuche ? `${z.richtig}/${z.versuche}` : '–'}</td>
        <td>${datum(z.zuletzt)}</td>
        <td>${fehlerTop ? `${esc(FEHLERBILDER[fehlerTop[0]] || fehlerTop[0])} (${fehlerTop[1]}×)` : ''}</td>
      </tr>`;
    })
    .join('');

  return `<div class="kacheln">
      <div class="kachel"><span class="kachel-zahl">${tage}</span><span>Übungstage in den letzten 7 Tagen</span></div>
      <div class="kachel"><span class="kachel-zahl">${woche.length}</span><span>Aufgaben in 7 Tagen</span></div>
      <div class="kachel"><span class="kachel-zahl">${quote}</span><span>beim ersten Versuch richtig</span></div>
      <div class="kachel"><span class="kachel-zahl">${faellig}</span><span>Wiederholungen fällig</span></div>
    </div>
    ${
      topFehler.length
        ? `<div class="fehler-karte"><h3>Häufige Fehler bei ${esc(p.name)}</h3><p class="leise">Darüber lohnt sich ein kurzes Gespräch, am besten mit Plättchen oder einer Skizze.</p>
           <ul>${topFehler.map(([k, v]) => `<li>${esc(FEHLERBILDER[k] || k)} <span class="leise">(${v}×)</span></li>`).join('')}</ul></div>`
        : ''
    }
    <div class="tabelle-rahmen"><table class="lernstand">
      <thead><tr><th>Fertigkeit</th><th>Stand</th><th>Richtig</th><th>Zuletzt</th><th>Häufigster Fehler</th></tr></thead>
      <tbody>${tabelle}</tbody>
    </table></div>`;
}

function sperre(app, unterseite) {
  const a = zufall(6, 9);
  const b = zufall(6, 9);
  app.setze(
    `<section class="sperre karte">
      <h1>Elternbereich</h1>
      <p>Bitte löse die Aufgabe, um fortzufahren.</p>
      <form id="sperre" class="antwort" autocomplete="off" novalidate>
        <label for="sperre-zahl" class="rechnung">${a} · ${b} =</label>
        <input id="sperre-zahl" class="ein-zahl" type="text" inputmode="numeric" maxlength="3">
        <button class="knopf primaer" type="submit">Öffnen</button>
      </form>
      <p class="formular-fehler" id="sperre-fehler" role="alert" hidden>Das stimmt leider nicht.</p>
      <p><a href="#/">Zurück</a></p>
    </section>`
  );
  document.getElementById('sperre').addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (Number(document.getElementById('sperre-zahl').value) === a * b) {
      app.elternOffen = true;
      zeigeEltern(app, unterseite);
    } else {
      document.getElementById('sperre-fehler').hidden = false;
    }
  });
}
