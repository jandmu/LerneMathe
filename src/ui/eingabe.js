/**
 * Antwort-Eingaben: Zahlenfeld (große Tasten für Klasse 1–2), Textfeld für Zahlen und Dezimalzahlen,
 * Bruch-Eingabe und Auswahl-Knöpfe.
 */

import { spurBild } from '../core/bilder.js';
import { ZIFFERN } from '../core/ziffern.js';

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

  if (e.art === 'spur') {
    return `<div class="spur-eingabe">
      <div class="spur-feld" data-striche="${ZIFFERN[e.ziffer].length}">${spurBild(e.ziffer, e.hilfe, { interaktiv: !gesperrt })}</div>
      <div class="knopfreihe mitte">
        <button type="button" class="knopf" data-spur="zeigen">Zeig mir, wie es geht</button>
        <button type="button" class="knopf leise" data-spur="loeschen" ${aus}>Nochmal von vorn</button>
      </div>
    </div>`;
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
  if (art === 'spur') return {};
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

  const spur = art === 'spur' ? spurBinden(container, abschicken, a.eingabe.hilfe === 'voll') : null;

  container.addEventListener('click', klick);
  container.addEventListener('submit', absenden);
  container.addEventListener('input', nurZiffern);
  document.addEventListener('keydown', tastatur);
  return () => {
    container.removeEventListener('click', klick);
    container.removeEventListener('submit', absenden);
    container.removeEventListener('input', nurZiffern);
    document.removeEventListener('keydown', tastatur);
    if (spur) spur();
  };
}

/** Führt den Schreibweg als Animation vor. */
export function vorfuehren(svg) {
  const ziel = svg && svg.querySelector('.spur-vorfuehrung');
  if (!ziel) return;
  ziel.innerHTML = '';
  const ruhig = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  [...svg.querySelectorAll('.spur-fuehrung')].forEach((f, i) => {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', f.getAttribute('d'));
    p.setAttribute('class', 'spur-demo');
    ziel.appendChild(p);
    if (ruhig || !p.getTotalLength || !p.animate) return;
    const l = p.getTotalLength();
    p.style.strokeDasharray = `${l}`;
    p.style.strokeDashoffset = `${l}`;
    p.animate([{ strokeDashoffset: l }, { strokeDashoffset: 0 }], { duration: 1300, delay: i * 1500, fill: 'forwards', easing: 'ease-in-out' });
  });
  if (!ruhig) setTimeout(() => (ziel.innerHTML = ''), 1500 * svg.querySelectorAll('.spur-fuehrung').length + 900);
}

/** Fingereingabe auf dem Schreibfeld. Ruft abschicken(striche) auf, sobald alle Striche gezogen sind. */
function spurBinden(container, abschicken, vorfuehrungStarten) {
  const feld = container.querySelector('.spur-feld');
  const svg = feld && feld.querySelector('.spur-svg');
  if (!feld || !svg) return null;
  const gruppe = svg.querySelector('.spur-kind');
  const soll = Number(feld.dataset.striche) || 1;
  let striche = [];
  let aktuell = null;
  let linie = null;
  let timer = null;

  const punkt = (ev) => {
    const r = svg.getBoundingClientRect();
    return [((ev.clientX - r.left) / r.width) * 100, ((ev.clientY - r.top) / r.height) * 140];
  };
  const leeren = () => {
    striche = [];
    gruppe.innerHTML = '';
  };

  const runter = (ev) => {
    if (!svg.classList.contains('interaktiv')) return;
    ev.preventDefault();
    if (striche.length >= soll) leeren();
    try {
      svg.setPointerCapture(ev.pointerId);
    } catch (e) {
      /* ignorieren */
    }
    aktuell = [punkt(ev)];
    linie = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    linie.setAttribute('class', 'spur-strich');
    gruppe.appendChild(linie);
  };
  const ziehen = (ev) => {
    if (!aktuell) return;
    ev.preventDefault();
    aktuell.push(punkt(ev));
    linie.setAttribute('points', aktuell.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' '));
  };
  const hoch = () => {
    if (!aktuell) return;
    if (aktuell.length >= 3) striche.push(aktuell);
    else linie.remove();
    aktuell = null;
    if (striche.length === soll) {
      const fertig = striche.slice();
      timer = setTimeout(() => abschicken(fertig), 350);
    }
  };
  const knopf = (ev) => {
    const k = ev.target.closest('[data-spur]');
    if (!k) return;
    if (k.dataset.spur === 'loeschen') leeren();
    if (k.dataset.spur === 'zeigen') vorfuehren(svg);
  };

  svg.addEventListener('pointerdown', runter);
  svg.addEventListener('pointermove', ziehen);
  svg.addEventListener('pointerup', hoch);
  svg.addEventListener('pointercancel', hoch);
  container.addEventListener('click', knopf);
  const start = vorfuehrungStarten ? setTimeout(() => vorfuehren(svg), 500) : null;
  return () => {
    clearTimeout(timer);
    clearTimeout(start);
    container.removeEventListener('click', knopf);
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
