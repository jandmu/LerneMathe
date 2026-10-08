/**
 * Hilfsfunktionen für die Browser-Tests (Playwright).
 * Startet einen kleinen Webserver für das Repository und steuert die App wie ein Kind auf dem Handy.
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const WURZEL = fileURLToPath(new URL('../../', import.meta.url));
const TYPEN = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
};

export async function serverStarten() {
  const server = http.createServer(async (req, res) => {
    const pfad = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    const datei = join(WURZEL, pfad.endsWith('/') ? pfad + 'index.html' : pfad);
    try {
      const inhalt = await readFile(datei);
      res.writeHead(200, { 'content-type': TYPEN[extname(datei)] || 'application/octet-stream' });
      res.end(inhalt);
    } catch (e) {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  return { server, url: `http://127.0.0.1:${server.address().port}/` };
}

export async function browserStarten() {
  const pfad = process.env.CHROMIUM_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  return chromium.launch(pfad ? { executablePath: pfad } : {});
}

/** Neue Seite in Handy-Größe. Sammelt JavaScript-Fehler in seite.fehler. */
export async function neueSeite(browser) {
  const kontext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: false });
  await kontext.addInitScript(() => {
    window.__TEST__ = true;
  });
  // Externe Schriften im Test nicht laden (schneller, kein Netz nötig).
  await kontext.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  const seite = await kontext.newPage();
  seite.fehler = [];
  seite.on('pageerror', (e) => seite.fehler.push(e.message));
  return seite;
}

export const warte = (seite, ms = 150) => seite.waitForTimeout(ms);

/** Legt Profile an (beim ersten Start) und schließt die Einrichtung ab. */
export async function profileAnlegen(seite, url, profile) {
  await seite.goto(url);
  await seite.waitForSelector('#profil-form');
  for (const { name, klasse } of profile) {
    await seite.fill('#pf-name', name);
    await seite.click(`.klassen-wahl input[value="${klasse}"]`, { force: true });
    await seite.click('#profil-form button[type=submit]');
    await warte(seite);
  }
  await seite.click('[data-action=fertig]');
  await seite.waitForSelector('.profil-kachel');
}

export async function profilWaehlen(seite, url, index) {
  await seite.goto(url + '#/');
  await seite.waitForSelector('.profil-kachel');
  await seite.click(`.profil-kachel >> nth=${index}`);
  await seite.waitForSelector('.kind-start');
}

export async function elternOeffnen(seite, url, unterseite = '') {
  await seite.goto(url + '#/eltern' + (unterseite ? '/' + unterseite : ''));
  await seite.waitForSelector('label.rechnung');
  const t = await seite.textContent('label.rechnung');
  const [a, b] = t.match(/\d+/g).map(Number);
  await seite.fill('#sperre-zahl', String(a * b));
  await seite.click('#sperre button');
  await warte(seite, 300);
}

/** Zieht Striche mit der Maus über das Schreibfeld. */
export async function spuren(seite, striche) {
  const feld = seite.locator('.spur-feld .spur-svg');
  await feld.scrollIntoViewIfNeeded();
  const box = await feld.boundingBox();
  const xy = ([x, y]) => [box.x + (x / 100) * box.width, box.y + (y / 140) * box.height];
  for (const s of striche) {
    await seite.mouse.move(...xy(s[0]));
    await seite.mouse.down();
    for (const p of s) await seite.mouse.move(...xy(p), { steps: 2 });
    await seite.mouse.up();
  }
  await warte(seite, 600);
}

/** Löst die aktuell angezeigte Aufgabe – richtig oder absichtlich falsch. */
export async function aufgabeLoesen(seite, { falsch = false } = {}) {
  const a = await seite.evaluate(async () => {
    const x = window.__aufgabe;
    const { zeige } = await import('/src/core/dezimal.js');
    const { idealStriche } = await import('/src/core/ziffern.js');
    const e = x.eingabe;
    const l = x.loesung;
    return {
      art: e.art,
      klein: !!document.querySelector('.tastenfeld'),
      zahl: e.art === 'zahl' ? String(l) : e.art === 'dezimal' ? zeige(l) : null,
      wahl: e.art === 'auswahl' ? String(l) : null,
      andereWahl: e.art === 'auswahl' ? e.optionen.map((o) => o.wert).find((w) => w !== String(l)) : null,
      bruch: e.art === 'bruch' ? (x.form === 'gemischt' ? { g: String(Math.trunc(l.z / l.n)), z: String(l.z % l.n), n: String(l.n) } : { z: String(l.z), n: String(l.n) }) : null,
      nennerFest: e.nennerFest || null,
      striche: e.art === 'spur' ? idealStriche(l) : null,
    };
  });

  if (a.art === 'spur') return spuren(seite, falsch ? a.striche.map((s) => s.slice().reverse()) : a.striche);
  if (a.art === 'auswahl') {
    await seite.click(`[data-wahl="${falsch ? a.andereWahl : a.wahl}"]`);
    return warte(seite);
  }
  if (a.art === 'bruch') {
    const b = !falsch
      ? a.bruch
      : a.bruch.g
        ? { ...a.bruch, g: String(Number(a.bruch.g) + 1) }
        : { z: String(Number(a.bruch.z) + 1), n: a.bruch.n };
    if (b.g && (await seite.$('#ein-g'))) await seite.fill('#ein-g', b.g);
    await seite.fill('#ein-z', b.z);
    if (!a.nennerFest) await seite.fill('#ein-n', b.n);
    await seite.click('#antwort button[type=submit]');
    return warte(seite);
  }
  // Zahl oder Dezimalzahl
  const wert = falsch ? (a.art === 'dezimal' ? '999,9' : String(Number(a.zahl) + 37)) : a.zahl;
  if (a.klein) {
    for (const z of wert) await seite.click(`[data-taste="${z}"]`);
    await seite.click('[data-taste="ok"]');
  } else {
    await seite.fill('#ein-zahl', wert);
    await seite.click('#antwort button[type=submit]');
  }
  return warte(seite);
}

/** Prüft, dass die Seite nicht breiter als das Handy ist. */
export async function keineUeberbreite(seite) {
  return seite.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}
