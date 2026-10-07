/**
 * Antwort-Eingaben: Zahlenfeld (große Tasten für Klasse 1–2), Textfeld für Zahlen und Dezimalzahlen,
 * Bruch-Eingabe und Auswahl-Knöpfe.
 */

const TASTEN = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'loeschen', '0', 'ok'];

function tastenfeld(gesperrt) {
  return `<div class="tastenfeld" role="group" aria-label="Zahlentasten">${TASTEN.map((t) => {
    if (t === 'loeschen') return `<button type="button" class="taste taste-neben" data-taste="loeschen" aria-label="Löschen" ${gesperrt}>⌫</button>`;
    if (t === 'ok') return `<button type="button" class="taste taste-ok" data-taste="ok" aria-label="Prüfen" ${gesperrt}>✓</button>`;
    return `<button type="button" class="taste" data-taste="${t}" ${gesperrt}>${t}</button>`;
  }).join('')}</div>`;
}

/**
 * HTML für die Eingabe einer Aufgabe.
 * optionen: { klein: große Tasten statt Tastatur, gesperrt: bool, werte: bisherige Eingabe }
 */
export function eingabeHTML(a, { klein = false, gesperrt = false, werte = {} } = {}) {
  const aus = gesperrt ? 'disabled' : '';
  const e = a.eingabe;

  if (e.art === 'auswahl') {
    return `<div class="auswahl${e.gross ? ' gross' : ''}" role="group" aria-label="Antwort wählen">${e.optionen
      .map((o) => `<button type="button" class="knopf auswahl-knopf" data-wahl="${o.wert}" aria-label="${o.label || o.wert}" ${aus}>${o.html}</button>`)
      .join('')}</div>`;
  }

  if (e.art === 'zahl' && klein) {
    return `<div class="zahl-eingabe klein">
      <output class="anzeige" id="anzeige" aria-live="polite" aria-label="Deine Antwort">${werte.zahl || ''}</output>
      ${tastenfeld(aus)}
    </div>`;
  }

  if (e.art === 'zahl' || e.art === 'dezimal') {
    return `<form class="antwort" id="antwort" autocomplete="off" novalidate>
      <label class="sr-only" for="ein-zahl">Deine Antwort</label>
      <input id="ein-zahl" class="ein-zahl" type="text" inputmode="${e.art === 'dezimal' ? 'decimal' : 'numeric'}" maxlength="12" value="${werte.zahl || ''}" ${aus}>
      <button class="knopf primaer" type="submit" ${aus}>Prüfen</button>
    </form>
    ${e.art === 'dezimal' ? '<p class="eingabe-hilfe">Schreibe Dezimalzahlen mit Komma, z. B. 3,25.</p>' : ''}`;
  }

  if (e.art === 'bruch') {
    const fest = e.nennerFest;
    return `<form class="antwort" id="antwort" autocomplete="off" novalidate>
      <div class="bruch-eingabe">
        ${e.ohneGanze ? '' : `<label class="ganze-feld"><input id="ein-g" type="text" inputmode="numeric" maxlength="4" value="${werte.g || ''}" ${aus}><span>Ganze</span></label>`}
        <span class="ein-bruch">
          <input id="ein-z" type="text" inputmode="numeric" maxlength="5" aria-label="Zähler" value="${werte.z || ''}" ${aus}>
          <span class="strich" aria-hidden="true"></span>
          <input id="ein-n" type="text" inputmode="numeric" maxlength="5" aria-label="Nenner" value="${fest ? fest : werte.n || ''}" ${fest ? 'readonly tabindex="-1"' : ''} ${aus}>
        </span>
      </div>
      <button class="knopf primaer" type="submit" ${aus}>Prüfen</button>
    </form>
    <p class="eingabe-hilfe">${
      fest
        ? 'Der Nenner ist vorgegeben. Trage nur den Zähler ein.'
        : a.form === 'gemischt'
          ? 'Trage die Ganzen links ein und den Bruch rechts.'
          : a.form === 'unecht'
            ? 'Gib einen unechten Bruch ein, also ohne Ganze.'
            : e.ohneGanze
              ? 'Trage Zähler und Nenner ein.'
              : 'Kürze so weit wie möglich. „Ganze“ brauchst du nur für gemischte Zahlen.'
    }</p>`;
  }
  return '';
}

/** Liest die aktuelle Eingabe aus dem Container. */
export function eingabeLesen(container, a) {
  const wert = (id) => {
    const el = container.querySelector('#' + id);
    return el ? el.value.trim() : '';
  };
  const art = a.eingabe.art;
  if (art === 'zahl') {
    const anzeige = container.querySelector('#anzeige');
    return anzeige ? anzeige.textContent.trim() : wert('ein-zahl');
  }
  if (art === 'dezimal') return wert('ein-zahl');
  if (art === 'bruch') return { g: wert('ein-g'), z: wert('ein-z'), n: wert('ein-n') };
  return null;
}

/** Werte, die beim Neuzeichnen erhalten bleiben sollen. */
export function eingabeWerte(container, a) {
  const art = a.eingabe.art;
  const e = eingabeLesen(container, a);
  if (art === 'bruch') return e;
  return { zahl: e || '' };
}

/**
 * Bindet Tasten und Formulare. abschicken(antwort) wird beim Prüfen aufgerufen.
 * Gibt eine Funktion zum Lösen der Bindungen zurück.
 */
export function eingabeBinden(container, a, abschicken) {
  const art = a.eingabe.art;
  const anzeige = container.querySelector('#anzeige');

  const tippen = (t) => {
    if (!anzeige) return;
    if (t === 'loeschen') anzeige.textContent = anzeige.textContent.slice(0, -1);
    else if (t === 'ok') abschicken(eingabeLesen(container, a));
    else if (anzeige.textContent.length < 3) anzeige.textContent += t;
  };

  const klick = (ev) => {
    const taste = ev.target.closest('[data-taste]');
    if (taste && !taste.disabled) {
      tippen(taste.dataset.taste);
      return;
    }
    const wahl = ev.target.closest('[data-wahl]');
    if (wahl && !wahl.disabled) abschicken(wahl.dataset.wahl);
  };

  const absenden = (ev) => {
    if (ev.target.id !== 'antwort') return;
    ev.preventDefault();
    abschicken(eingabeLesen(container, a));
  };

  const tastatur = (ev) => {
    if (!anzeige || ev.altKey || ev.ctrlKey || ev.metaKey) return;
    if (container.querySelector('.taste:disabled')) return;
    if (/^\d$/.test(ev.key)) tippen(ev.key);
    else if (ev.key === 'Backspace') tippen('loeschen');
    else if (ev.key === 'Enter') tippen('ok');
    else return;
    ev.preventDefault();
  };

  const nurZiffern = (ev) => {
    const el = ev.target;
    if (!el.id || !el.id.startsWith('ein-')) return;
    const erlaubt = art === 'dezimal' ? /[^\d,.]/g : /\D/g;
    const sauber = el.value.replace(erlaubt, '');
    if (sauber !== el.value) el.value = sauber;
  };

  container.addEventListener('click', klick);
  container.addEventListener('submit', absenden);
  container.addEventListener('input', nurZiffern);
  document.addEventListener('keydown', tastatur);
  return () => {
    container.removeEventListener('click', klick);
    container.removeEventListener('submit', absenden);
    container.removeEventListener('input', nurZiffern);
    document.removeEventListener('keydown', tastatur);
  };
}

/** Setzt den Fokus auf das erste Eingabefeld (nur mit Maus/Tastatur, damit auf dem Handy keine Tastatur aufspringt). */
export function eingabeFokus(container) {
  if (!(window.matchMedia && window.matchMedia('(pointer: fine)').matches)) return;
  const el = container.querySelector('#ein-zahl, #ein-g, #ein-z');
  if (el && !el.disabled) {
    el.focus();
    if (el.select) el.select();
  }
}
