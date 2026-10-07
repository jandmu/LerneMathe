# Architektur

Reine Browser-App aus HTML, CSS und JavaScript-Modulen (ES Modules). Kein Build-Schritt,
keine Abhängigkeiten. Läuft auf GitHub Pages oder jedem statischen Webserver.

```
index.html            Gerüst
css/app.css           Gestaltung (Hell/Dunkel, Klein-Modus für Klasse 1–2)
src/app.js            Einstieg: Zustand, Navigation (Hash-Routen), Datenzugriff
src/core/             Fachlogik ohne DOM – in Node testbar
  util.js             Zufall, ggT/kgV, IDs …
  bruch.js            Bruch-Klasse, HTML/SVG für Brüche
  dezimal.js          exakte Dezimalzahlen (ganzzahlig in Millionsteln)
  bilder.js           Zehner-/Zwanzigerfeld, Zahlenhaus (SVG)
  aufgabe.js          Aufgabenformat, Antwortprüfung, Fehlerbilder
  lernplan.js         Lernkartei, Wiederholungsplan, Empfehlung, Rundenplanung
  speicher.js         Datenbank-Schnittstelle und Backends
src/inhalte/          Lerninhalte
  index.js            Themenregister
  k1/, k6/            Themen je Klasse
src/ui/               Oberfläche (Ansichten, Eingaben, Sprachausgabe)
tests/                node --test
```

## Inhalte erweitern

Ein Thema ist ein Objekt (siehe Kommentar in `src/inhalte/index.js`) mit Stufen. Jede Stufe hat
eine Funktion `aufgabe()`, die eine neue Aufgabe erzeugt. Eine Aufgabe enthält Text, Darstellung,
Lösung, Prüffunktion, Lösungsweg und optional ein `fehlbild` für typische Fehler
(Format: `src/core/aufgabe.js`). Neues Thema anlegen:

1. Datei unter `src/inhalte/k<klasse>/` anlegen, Thema exportieren.
2. In `src/inhalte/index.js` in `THEMEN` eintragen (Reihenfolge = Lehrplan-Reihenfolge).
3. `npm test` – die Tests prüfen automatisch jede Stufe (300 Aufgaben je Stufe).

Die Oberfläche braucht dafür keine Änderung.

## Daten und der Weg zu vielen Nutzern

Die App spricht nur mit der Klasse `Datenbank` (`src/core/speicher.js`). Alle Methoden sind
asynchron. Das Backend ist austauschbar:

- `LokalesBackend` – localStorage (heute; fällt bei gesperrtem Speicher auf Arbeitsspeicher zurück)
- `SpeicherBackend` – Arbeitsspeicher (Tests)
- später z. B. `ServerBackend` – gleiche vier Methoden (`lesen`, `schreiben`, `loeschen`, `schluessel`) gegen eine REST-API

Vorbereitet ist:

- **Profile mit UUID** – eindeutig auch über Geräte hinweg.
- **Ereignisprotokoll** – jede erste Antwort wird als `{ t, s, r, f }` (Zeit, Fertigkeit, richtig, Fehlerbild) gespeichert.
  Das lässt sich später an einen Server übertragen und dort auswerten oder zusammenführen.
- **Schema-Version** und `migrieren()` für spätere Änderungen am Datenmodell.
- **Export/Import** als JSON im Elternbereich – Umzug auf ein anderes Gerät schon heute möglich.

Für einen echten Mehrbenutzerbetrieb (z. B. Schulklasse, mehrere Familien) wären die nächsten Schritte:

1. Anmeldung für Erwachsene (Konto = Familie oder Lehrkraft), Kinderprofile hängen am Konto.
2. `ServerBackend` mit Synchronisation: lokal weiterarbeiten (offline), Ereignisse nachträglich hochladen.
   Weil der Lernstand aus den Ereignissen ableitbar ist, lassen sich Konflikte zwischen Geräten durch Zusammenführen der Ereignisse lösen.
3. Datenschutz: Kinderdaten minimal halten (Vorname/Spitzname, Klasse), Hosting in der EU, Löschfunktion.
