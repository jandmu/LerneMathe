/** Startseite: Wer rechnet heute? Beim ersten Start werden die Kinderprofile angelegt. */
import { esc } from '../core/util.js';
import { avatar } from './bausteine.js';
import { profilFormular, profilLesen, profilFormularBinden } from './profilformular.js';

export async function zeigeStart(app) {
  const profile = await app.profileLaden();
  if (!profile.length || app.einrichtung) return zeigeEinrichtung(app);

  app.setze(
    `<section class="start">
      <h1>Wer rechnet heute?</h1>
      <ul class="profil-liste">
        ${profile
          .map(
            (p) => `<li><button type="button" class="profil-kachel" data-action="waehlen" data-id="${esc(p.id)}">
              ${avatar(p, true)}
              <span class="profil-name">${esc(p.name)}</span>
              <span class="profil-klasse">Klasse ${p.klasse}</span>
            </button></li>`
          )
          .join('')}
      </ul>
      <p class="leise-zeile">Ein weiteres Kind anlegen oder den Lernstand ansehen: <a href="#/eltern">Elternbereich</a></p>
    </section>`,
    {
      async waehlen(el) {
        if (await app.profilAktivieren(el.dataset.id)) app.geheZu('kind');
      },
    }
  );
}

function zeigeEinrichtung(app) {
  const profile = app.profile;
  app.einrichtung = true;
  app.setze(
    `<section class="einrichtung">
      <h1>Willkommen in der Mathewerkstatt</h1>
      <p class="lead">Lege für jedes Kind ein eigenes Profil an. So merkt sich die App für jedes Kind,
      was schon sitzt und was wiederholt werden sollte. Alles bleibt auf diesem Gerät.</p>
      ${
        profile.length
          ? `<div class="angelegt"><h2>Schon angelegt</h2><ul class="mini-profile">${profile
              .map((p) => `<li>${avatar(p)}<span>${esc(p.name)} · Klasse ${p.klasse}</span></li>`)
              .join('')}</ul></div>`
          : ''
      }
      <div class="karte">
        <h2>${profile.length ? 'Noch ein Kind anlegen' : 'Erstes Kind anlegen'}</h2>
        ${profilFormular(null, { knopf: 'Profil anlegen' })}
      </div>
      ${profile.length ? '<div class="knopfreihe"><button type="button" class="knopf primaer gross" data-action="fertig">Fertig, los geht’s</button></div>' : ''}
    </section>`,
    {
      fertig() {
        app.einrichtung = false;
        app.geheZu('');
      },
    }
  );
  const form = document.getElementById('profil-form');
  profilFormularBinden(form);
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const { profil, fehler } = profilLesen(form);
    const f = document.getElementById('pf-fehler');
    if (fehler) {
      f.textContent = fehler;
      f.hidden = false;
      return;
    }
    await app.db.profilSpeichern(profil);
    await app.profileLaden();
    zeigeEinrichtung(app);
  });
}
