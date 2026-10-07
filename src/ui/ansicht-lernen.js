/**
 * Lernpfad zu einem Thema, nach dem Prinzip „ausgeblendete Lösungsbeispiele“:
 *   1. Erklären   – Erklärkarten (vorgelesen) bzw. Merksatz und Erklärtext
 *   2. Vormachen  – ein vollständig vorgerechnetes Beispiel, Schritt für Schritt
 *   3. Mitmachen  – ein Beispiel, bei dem die ersten Schritte schon gemacht sind; das Kind rechnet zu Ende
 *   4. Selbst üben – weiter zur Übungsrunde
 */
import { esc } from '../core/util.js';
import { zustand, SITZT_AB } from '../core/lernplan.js';
import { thema as themaNach, skillId, aufgabeFuer } from '../inhalte/index.js';
import { aufgabeHTML, schritteHTML, ergebnisBox, LAUTSPRECHER, vorleseText } from './bausteine.js';
import { eingabeHTML, eingabeBinden, eingabeFokus, eingabeWerte } from './eingabe.js';
import { F, kreise } from '../core/bruch.js';

export function zeigeLernen(app, themaId, stufeId) {
  const t = themaNach(themaId);
  if (!t) return app.geheZu('kind');
  const f = app.fortschritt;
  const stufe =
    t.stufen.find((s) => s.id === stufeId) || t.stufen.find((s) => zustand(f, skillId(t, s)).fach < SITZT_AB) || t.stufen[0];
  const sid = skillId(t, stufe);

  const z = {
    phase: stufeId ? 'vormachen' : 'erklaeren',
    karte: 0,
    beispiel: null,
    sichtbar: 0,
    mit: null,
    labor: { z: 3, n: 4 },
  };

  const kopf = () => `<a class="zurueck" href="#/thema/${t.id}">← ${esc(t.titel)}</a>
    <ol class="pfad" aria-label="Lernpfad">
      ${[
        ['erklaeren', 'Verstehen'],
        ['vormachen', 'Zuschauen'],
        ['mitmachen', 'Mitmachen'],
        ['ueben', 'Selbst üben'],
      ]
        .map(([p, name], i) => {
          const reihenfolge = ['erklaeren', 'vormachen', 'mitmachen', 'ueben'];
          const zustandP = reihenfolge.indexOf(z.phase) > i ? 'erledigt' : p === z.phase ? 'aktiv' : '';
          return `<li class="${zustandP}"${p === z.phase ? ' aria-current="step"' : ''}><span>${i + 1}</span>${name}</li>`;
        })
        .join('')}
    </ol>`;

  function zeichnen() {
    if (z.phase === 'erklaeren') return t.erklaerung ? erklaerkarte() : erklaerseite();
    if (z.phase === 'vormachen') return vormachen();
    if (z.phase === 'mitmachen') return mitmachen();
    return abschluss();
  }

  // ---------- 1. Erklären ----------

  function erklaerkarte() {
    const k = t.erklaerung[z.karte];
    const letzte = z.karte === t.erklaerung.length - 1;
    app.setze(
      `${kopf()}
      <article class="erklaerkarte">
        <div class="karten-zaehler">${z.karte + 1} / ${t.erklaerung.length}</div>
        ${k.bild ? `<div class="bild">${k.bild}</div>` : ''}
        ${k.rechnung ? `<div class="rechnung">${k.rechnung}</div>` : ''}
        <p class="erklaer-text">${k.text}</p>
        <div class="knopfreihe mitte">
          <button type="button" class="knopf rund" data-action="vorlesen" aria-label="Noch einmal vorlesen">${LAUTSPRECHER}</button>
          ${z.karte > 0 ? '<button type="button" class="knopf" data-action="zurueck">Zurück</button>' : ''}
          <button type="button" class="knopf primaer gross" data-action="weiter">${letzte ? 'Zeig mir ein Beispiel' : 'Weiter'}</button>
        </div>
      </article>`,
      {
        vorlesen: () => app.sprich(k.text, true),
        zurueck() {
          z.karte--;
          zeichnen();
        },
        weiter() {
          if (letzte) z.phase = 'vormachen';
          else z.karte++;
          zeichnen();
        },
      }
    );
    app.sprich(k.text);
  }

  function erklaerseite() {
    app.setze(
      `${kopf()}
      <div class="merke"><span class="etikett">Merke</span>${t.merke}</div>
      <div class="fliesstext">${t.text || ''}</div>
      ${t.labor === 'bruch' ? '<section class="labor" id="labor"></section>' : ''}
      ${
        t.fehler && t.fehler.length
          ? `<section class="fehler-karte"><h2>Typische Fehler</h2><ul>${t.fehler.map((x) => `<li>${x}</li>`).join('')}</ul></section>`
          : ''
      }
      <div class="knopfreihe"><button type="button" class="knopf primaer gross" data-action="weiter">Zeig mir ein Beispiel →</button></div>`,
      {
        weiter() {
          z.phase = 'vormachen';
          zeichnen();
        },
        labor(el) {
          const l = z.labor;
          const d = Number(el.dataset.delta);
          if (el.dataset.feld === 'n') l.n = Math.min(12, Math.max(1, l.n + d));
          else l.z += d;
          l.z = Math.min(3 * l.n, Math.max(0, l.z));
          bruchLabor();
        },
      }
    );
    if (t.labor === 'bruch') bruchLabor();
  }

  function bruchLabor() {
    const el = document.getElementById('labor');
    if (!el) return;
    const { z: zz, n } = z.labor;
    const art =
      zz === 0 ? 'Null Teile: Der Bruch hat den Wert 0' : zz % n === 0 ? `Scheinbruch, er ist gleich ${zz / n}` : zz < n ? 'Echter Bruch, kleiner als 1' : 'Unechter Bruch, größer als 1';
    const regler = (feld, name, wert) => `<div class="regler"><span class="regler-name">${name}</span>
      <button type="button" data-action="labor" data-feld="${feld}" data-delta="-1" aria-label="${name} verkleinern">−</button>
      <output>${wert}</output>
      <button type="button" data-action="labor" data-feld="${feld}" data-delta="1" aria-label="${name} vergrößern">+</button></div>`;
    el.innerHTML = `<h2>Bruch-Labor</h2><p>Verändere Zähler und Nenner und beobachte das Bild.</p>
      <div class="labor-flaeche"><div class="labor-regler">${regler('z', 'Zähler', zz)}${regler('n', 'Nenner', n)}</div>
      <div class="labor-bruch">${F(zz, n)}</div><div class="bild">${kreise(zz, n)}</div></div>
      <p class="leise">${zz} von je ${n} gleich großen Teilen · ${art}</p>`;
  }

  // ---------- 2. Vormachen ----------

  function vormachen() {
    if (!z.beispiel) {
      z.beispiel = aufgabeFuer(sid);
      z.sichtbar = 0;
    }
    const a = z.beispiel;
    const alle = z.sichtbar >= a.weg.length;
    app.setze(
      `${kopf()}
      <article class="karte beispiel">
        <div class="karte-kopf"><span class="tag">Beispiel · ${esc(stufe.titel)}</span></div>
        ${aufgabeHTML(a)}
        ${z.sichtbar ? schritteHTML(a.weg.slice(0, z.sichtbar)) : '<p class="leise">Schau zu, wie man die Aufgabe löst.</p>'}
        ${alle ? ergebnisBox(a) : ''}
        <div class="knopfreihe">
          ${
            alle
              ? '<button type="button" class="knopf primaer gross" data-action="jetzt-du">Jetzt rechnest du mit →</button>'
              : `<button type="button" class="knopf primaer gross" data-action="schritt">${z.sichtbar ? 'Nächster Schritt' : 'Ersten Schritt zeigen'}</button>`
          }
          <button type="button" class="knopf" data-action="anderes">Anderes Beispiel</button>
        </div>
      </article>`,
      {
        schritt() {
          z.sichtbar++;
          zeichnen();
          const s = a.weg[z.sichtbar - 1];
          app.sprich(s.text);
        },
        anderes() {
          z.beispiel = null;
          zeichnen();
        },
        vorlesen: () => app.sprich(vorleseText(a), true),
        'jetzt-du'() {
          z.phase = 'mitmachen';
          z.mit = null;
          zeichnen();
        },
      }
    );
    if (!z.sichtbar) app.sprich(vorleseText(a), a.immerVorlesen);
  }

  // ---------- 3. Mitmachen ----------

  function mitmachen() {
    if (!z.mit) {
      const a = aufgabeFuer(sid);
      z.mit = { a, gezeigt: Math.max(1, Math.floor(a.weg.length / 2)), versuche: 0, fertig: false, meldung: null, werte: {} };
    }
    const m = z.mit;
    const a = m.a;
    app.setze(
      `${kopf()}
      <article class="karte mitmachen" id="mit">
        <div class="karte-kopf"><span class="tag">Mitmachen · ${esc(stufe.titel)}</span></div>
        ${aufgabeHTML(a, { vorlesen: app.klein() })}
        <p class="leise">${m.fertig ? 'So geht der ganze Weg:' : 'Die ersten Schritte sind schon gemacht. Rechne zu Ende!'}</p>
        ${schritteHTML(m.fertig ? a.weg : a.weg.slice(0, m.gezeigt))}
        ${m.fertig ? ergebnisBox(a) : eingabeHTML(a, { klein: app.klein(), werte: m.werte })}
        <div class="rueckmeldung" role="status" aria-live="polite">${m.meldung || ''}</div>
        <div class="knopfreihe">
          ${m.fertig ? '<button type="button" class="knopf primaer gross" data-action="selbst">Jetzt übe ich allein →</button>' : ''}
          ${m.fertig ? '<button type="button" class="knopf" data-action="nochmal">Noch ein Beispiel</button>' : ''}
        </div>
      </article>`,
      {
        vorlesen: () => app.sprich(vorleseText(a), true),
        selbst() {
          z.phase = 'ueben';
          zeichnen();
        },
        nochmal() {
          z.mit = null;
          zeichnen();
        },
      }
    );
    const karte = document.getElementById('mit');
    if (!m.fertig) {
      app.aufraeumen = eingabeBinden(karte, a, (antwort) => {
        const r = a.pruefe(antwort);
        if (r.status === 'ungueltig') {
          m.meldung = `<div class="meldung info"><p>${r.text}</p></div>`;
        } else if (r.status === 'richtig') {
          m.fertig = true;
          m.meldung = `<div class="meldung ok"><span class="meldung-titel">Richtig!</span><p>Du hast den Weg zu Ende gerechnet.</p></div>`;
          app.sprich('Richtig!');
        } else {
          m.versuche++;
          m.werte = eingabeWerte(karte, a);
          if (m.versuche >= 2) {
            m.fertig = true;
            m.meldung = `<div class="meldung falsch"><span class="meldung-titel">Schau mal.</span><p>Hier ist der ganze Weg. Lies ihn in Ruhe durch.</p></div>`;
          } else {
            m.meldung = `<div class="meldung falsch"><span class="meldung-titel">Noch nicht.</span><p>${r.text || a.hinweis}</p></div>`;
            app.sprich(r.text || a.hinweis);
          }
        }
        mitmachen();
      });
      if (!m.meldung) app.sprich(vorleseText(a), a.immerVorlesen);
      eingabeFokus(karte);
    }
  }

  // ---------- 4. Abschluss ----------

  function abschluss() {
    app.setze(
      `${kopf()}
      <article class="karte abschluss">
        <h2>Prima, jetzt bist du dran!</h2>
        <p>In der Übungsrunde rechnest du allein. Wenn etwas nicht klappt, bekommst du einen Tipp.</p>
        <div class="knopfreihe">
          <a class="knopf primaer gross" href="#/ueben/${t.id}/${stufe.id}">Übungsrunde starten →</a>
          <a class="knopf" href="#/thema/${t.id}">Zur Themenseite</a>
        </div>
      </article>`
    );
    app.sprich('Prima, jetzt bist du dran!');
  }

  zeichnen();
}
