/**
 * Browser-Tests: Die App wird wie von einem Kind auf dem Handy bedient (390 × 844).
 * Start: npm run test:browser
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { THEMEN } from '../../src/inhalte/index.js';
import {
  serverStarten,
  browserStarten,
  neueSeite,
  profileAnlegen,
  profilWaehlen,
  elternOeffnen,
  aufgabeLoesen,
  keineUeberbreite,
  warte,
  IPHONE_UA,
} from './hilfen.js';

let server;
let url;
let browser;

before(async () => {
  ({ server, url } = await serverStarten());
  browser = await browserStarten();
});

after(async () => {
  await browser.close();
  server.close();
});

/** Seite mit zwei Profilen: 0 = Klasse 1, 1 = Klasse 6. */
async function seiteMitProfilen() {
  const seite = await neueSeite(browser);
  await profileAnlegen(seite, url, [
    { name: 'Mia', klasse: 1 },
    { name: 'Lena', klasse: 6 },
  ]);
  return seite;
}

async function fertig(seite) {
  assert.deepEqual(seite.fehler, [], 'JavaScript-Fehler');
  assert.ok(await keineUeberbreite(seite), 'Seite ist breiter als der Bildschirm');
  await seite.context().close();
}

test('Einrichtung, Profilauswahl und Startseite', async () => {
  const seite = await seiteMitProfilen();
  assert.equal(await seite.locator('.profil-kachel').count(), 2);
  await profilWaehlen(seite, url, 0);
  assert.match(await seite.textContent('h1'), /Hallo, Mia/);
  assert.ok(await seite.locator('.weiter-karte').count());
  await fertig(seite);
});

for (const thema of THEMEN) {
  test(`Lernpfad ${thema.id}: Verstehen → Zuschauen → Mitmachen → Selbst üben`, async () => {
    const seite = await seiteMitProfilen();
    await profilWaehlen(seite, url, thema.klasse === 1 ? 0 : 1);
    await seite.goto(url + '#/lernen/' + thema.id);
    await warte(seite, 300);

    // Verstehen: Erklärkarten durchblättern bzw. Erklärseite
    for (let i = 0; i < 10 && !(await seite.$('[data-action="schritt"]')); i++) {
      await seite.click('[data-action=weiter]');
      await warte(seite);
    }
    // Zuschauen: alle Schritte aufdecken
    while (await seite.$('[data-action=schritt]')) {
      await seite.click('[data-action=schritt]');
      await warte(seite, 50);
    }
    assert.ok(await seite.locator('.ergebnis').count(), 'Ergebnis im Beispiel fehlt');
    await seite.click('[data-action="jetzt-du"]');
    await warte(seite, 400);

    // Mitmachen: erst falsch, dann richtig
    await aufgabeLoesen(seite, { falsch: true });
    assert.ok(await seite.locator('.meldung.falsch, .meldung.fast').count(), 'Keine Rückmeldung bei falscher Antwort');
    await aufgabeLoesen(seite);
    assert.ok(await seite.locator('.meldung.ok').count(), 'Richtige Antwort im Mitmachen nicht angenommen');
    await seite.click('[data-action=selbst]');
    await warte(seite);
    assert.ok(await seite.locator('a[href^="#/ueben/"]').count(), 'Weiter zur Übungsrunde fehlt');
    await fertig(seite);
  });
}

for (const thema of THEMEN) {
  test(`Übungsrunden ${thema.id}: jede Stufe richtig lösbar`, async () => {
    const seite = await seiteMitProfilen();
    await profilWaehlen(seite, url, thema.klasse === 1 ? 0 : 1);
    for (const stufe of thema.stufen) {
      await seite.goto(`${url}#/ueben/${thema.id}/${stufe.id}`);
      await warte(seite, 250);
      for (let i = 0; i < 3; i++) {
        await aufgabeLoesen(seite);
        assert.ok(await seite.locator('.meldung.ok').count(), `${stufe.id}: richtige Antwort nicht angenommen`);
        await seite.click('#weiter');
        await warte(seite);
      }
      await seite.click('[data-action=beenden]');
      await seite.waitForSelector('.runde-ende');
      assert.match(await seite.textContent('.ende-zahl'), /3\s*von 3/);
    }
    await fertig(seite);
  });
}

test('Zwei Fehlversuche: Lösungsweg und Weiter sind erreichbar', async () => {
  const seite = await seiteMitProfilen();
  await profilWaehlen(seite, url, 0);
  await seite.goto(url + '#/ueben/k1-plus20/uebergang');
  await warte(seite, 250);
  await aufgabeLoesen(seite, { falsch: true });
  await aufgabeLoesen(seite, { falsch: true });
  assert.ok(await seite.locator('.loesungsweg').count(), 'Lösungsweg fehlt');
  await seite.click('#weiter');
  await warte(seite);
  assert.match(await seite.textContent('.karte-kopf .nr'), /^2 \//);
  await fertig(seite);
});

test('Ziffern schreiben: nach zwei Fehlversuchen weiterüben, Weiter im Bild', async () => {
  const seite = await seiteMitProfilen();
  await profilWaehlen(seite, url, 0);
  await seite.goto(url + '#/ueben/k1-ziffern/gerade');
  await warte(seite, 300);
  await aufgabeLoesen(seite, { falsch: true });
  await aufgabeLoesen(seite, { falsch: true });
  assert.equal(await seite.locator('.spur-feld .spur-svg.interaktiv').count(), 1, 'Schreibfeld gesperrt');
  const imBild = await seite.evaluate(() => {
    const r = document.getElementById('weiter').getBoundingClientRect();
    return r.top >= 0 && r.bottom <= innerHeight;
  });
  assert.ok(imBild, 'Weiter liegt außerhalb des Bildschirms');
  await aufgabeLoesen(seite);
  assert.ok(await seite.locator('.meldung.ok').count());
  await fertig(seite);
});

test('Runde mit Belohnung, Projekt wählen, Teil einbauen', async () => {
  const seite = await seiteMitProfilen();
  await profilWaehlen(seite, url, 0);
  await seite.goto(url + '#/ueben/k1-mengen/bis5');
  await warte(seite, 250);
  for (let i = 0; i < 20 && !(await seite.$('.runde-ende')); i++) {
    await aufgabeLoesen(seite);
    await seite.click('#weiter');
    await warte(seite);
  }
  assert.ok(await seite.locator('.kisten-gewinn').count(), 'Keine Kisten am Rundenende');
  await seite.click('.kisten-gewinn a');
  await seite.click('[data-projekt=rakete]');
  await warte(seite);
  await seite.click('.teil-knopf.bereit >> nth=0');
  await warte(seite, 300);
  assert.equal(await seite.locator('.teil.vorschau').count(), 1, 'Erstes Tippen zeigt keine Vorschau');
  assert.equal(await seite.locator('.teil-knopf.eingebaut').count(), 0, 'Erstes Tippen darf noch nicht einbauen');
  await seite.click('.teil-knopf.gewaehlt');
  await warte(seite, 300);
  assert.equal(await seite.locator('.teil-knopf.eingebaut').count(), 1);
  await fertig(seite);
});

test('Elternbereich: Lernstand, Vorlesestimme, Werkstatt-Vorschau ohne Änderung des Spielstands', async () => {
  const seite = await seiteMitProfilen();
  const vorher = await seite.evaluate(() => JSON.stringify(Object.entries(localStorage).filter(([k]) => k.includes('fortschritt'))));
  await elternOeffnen(seite, url);
  assert.match(await seite.textContent('main'), /Lernstand/);
  await seite.click('text=Werkstatt-Vorschau öffnen');
  await warte(seite, 300);
  assert.match(await seite.textContent('h1'), /Werkstatt-Vorschau/);
  await seite.click('[data-action=alle]');
  await seite.click('[data-projekt=tierpark]');
  await seite.click('[data-teil=giraffe]');
  const nachher = await seite.evaluate(() => JSON.stringify(Object.entries(localStorage).filter(([k]) => k.includes('fortschritt'))));
  assert.equal(nachher, vorher);
  await fertig(seite);
});

test('Datensicherheit: Install-Tipp auf dem iPhone, Sicherungs-Erinnerung im Elternbereich', async () => {
  const seite = await neueSeite(browser, { userAgent: IPHONE_UA });
  await profileAnlegen(seite, url, [{ name: 'Mia', klasse: 1 }]);
  assert.equal(await seite.locator('#install-hinweis').count(), 1, 'Install-Tipp fehlt');
  await seite.click('[data-action="hinweis-weg"]');
  await warte(seite);
  await seite.reload();
  await seite.waitForSelector('.profil-kachel');
  assert.equal(await seite.locator('#install-hinweis').count(), 0, 'Tipp kommt nach „Später“ sofort wieder');

  await elternOeffnen(seite, url);
  assert.match(await seite.textContent('.daten-status'), /Letzte Sicherung:\s*noch nie – eine Sicherung wird empfohlen/);
  const [download] = await Promise.all([seite.waitForEvent('download'), seite.click('[data-action=export]')]);
  assert.match(download.suggestedFilename(), /^mathewerkstatt-sicherung-\d{4}-\d{2}-\d{2}\.json$/);
  await warte(seite, 300);
  assert.match(await seite.textContent('.daten-status'), /Letzte Sicherung:\s*heute/);
  await fertig(seite);
});

test('Klasse 1: Themen mit Bild, Vorlese-Knöpfe auf Start- und Themenseite', async () => {
  const seite = await seiteMitProfilen();
  await profilWaehlen(seite, url, 0);
  const k1 = THEMEN.filter((t) => t.klasse === 1).length;
  assert.equal(await seite.locator('.thema-symbol svg').count(), k1, 'Nicht jedes Thema hat ein Bild');
  assert.equal(await seite.locator('.thema-vorlesen').count(), k1, 'Nicht jedes Thema hat einen Vorlese-Knopf');
  assert.equal(await seite.locator('.kopf-mit-ton .vorlese-knopf').count(), 1, 'Begrüßung ohne Vorlese-Knopf');
  await seite.click('.thema-karte >> nth=1');
  await warte(seite);
  assert.equal(await seite.locator('.kopf-mit-ton .vorlese-knopf').count(), 1, 'Themenseite ohne Vorlese-Knopf');
  await fertig(seite);
});
