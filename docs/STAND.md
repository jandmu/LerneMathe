# Projektstand und Übergabe

Dieses Dokument hält fest, was nicht im Code steht: für wen die App ist, warum Entscheidungen so
gefallen sind, welche Fehler schon aufgetreten sind und was als Nächstes kommt.
**Bei jeder größeren Änderung mitpflegen** (Abschnitte „Verlauf“ und „Nächste Schritte“).

## Für wen

- Drei Kinder einer Familie: Zwillinge in Klasse 1, ein Kind in Klasse 6. Genutzt vor allem auf dem
  iPhone/iPad (Safari, als Home-Bildschirm-App).
- Später soll die App auf viele Nutzer erweiterbar sein (Profile mit UUID, Datenbank-Schicht mit
  austauschbarem Backend, Ereignis-Protokoll – siehe `docs/ARCHITEKTUR.md`).
- Kein Lehrplan eines Bundeslands. Maßstab sind Befunde der Lern- und Mathematikdidaktik
  (`docs/DIDAKTIK.md`, mit Quellen). Neue Inhalte daran ausrichten und dort eintragen.
- Live: https://jandmu.github.io/LerneMathe/ (GitHub Pages aus `main`, Repo jandmu/LerneMathe).
  Das Repo muss öffentlich bleiben, solange Pages im kostenlosen Konto genutzt wird.

## Wichtige Entscheidungen

- **Kein Build, keine Laufzeit-Abhängigkeiten.** Playwright ist nur Dev-Abhängigkeit für Tests.
- **Lernkartei pro Fertigkeit** (`thema/stufe`), Abstände 0, 1, 1, 3, 7, 14, 30 Tage. Ab Fach 2 steigt
  eine Fertigkeit nur, wenn sie fällig war. Gezählt wird nur der erste Versuch.
- **Werkstatt (Spielelement):** vier Projekte (Sportwagen, Rakete, Baumhaus, Tierpark) mit je 10 Teilen.
  Kisten gibt es für neue Sterne, erste Runde am Tag, Wiederholungen und gelegentliche Überraschungen,
  höchstens 3 pro Runde – bewusst nicht für jede richtige Antwort (Korrumpierungseffekt vermeiden).
  Abschaltbar pro Profil. Grafik ist absichtlich einfach (SVG), soll später schöner werden.
- **Vorlesen** über die Web Speech API. iOS gibt installierte Premium-Stimmen offenbar nicht an Webseiten
  weiter; die Stimmenauswahl im Elternbereich zeigt, was das Gerät anbietet. Mögliche spätere Lösung:
  vorab aufgenommene Audiodateien oder ein Cloud-TTS.
- **Klasse 1 ohne Lesen:** Jedes Thema hat ein Bild (`symbol`) und Vorlese-Knöpfe; Werkstatt-Teile werden
  beim ersten Tippen gezeigt und benannt, beim zweiten eingebaut.
- **Anpassende Hilfe:** Zwei Fehler in Folge → nächste Aufgaben mit Hilfe (Bild über `mitHilfe` der Stufe,
  sonst erster Schritt als Tipp). Zwei Treffer mit Hilfe → wieder ohne. Treffer mit Hilfe zählen nicht für
  den Aufstieg.
- **Datensicherheit:** Lernstand liegt nur im `localStorage` des Geräts. Safari löscht Daten nicht
  installierter Webseiten nach ca. 7 Tagen ohne Besuch → Install-Tipp, `navigator.storage.persist()`,
  Sicherungs-Erinnerung und Export/Import im Elternbereich.

## Gelernt aus Fehlern (nicht wiederholen)

- **Safari mischte alte und neue Module** nach einem Update (Werkstatt-Vorschau öffnete nicht). Lösung:
  Service Worker holt eigene Dateien mit `cache: 'no-cache'` und lädt bei `controllerchange` neu.
  Deshalb bei jeder Veröffentlichung beide `VERSION`s erhöhen.
- **Ziffern schreiben:** Die Prüfung (`src/core/ziffern.js`, `TOLERANZ`) muss Weiterschreiben über das
  Ende, Ausreißer und Zickzack ablehnen. Bei Änderungen die Tests in `tests/ziffern.test.js` beachten.
- **DOM-Abfragen immer eingrenzen:** Im Mitmachen-Schritt griff die Schreibeingabe das erste `.spur-svg`
  der Seite (ein kleines Bild im Lösungsweg) statt das Schreibfeld.
- **Eingabe nach Fehler leeren**, sonst hängen Kinder neue Ziffern an die falsche Zahl an.
- **Lob passend zur Aufgabe** (`lob`-Feld): „Super gerechnet“ passt nicht zum Ziffernschreiben.
- **Grafik prüfen:** Der Heckspoiler saß zuerst vorne. Neue Grafiken per Screenshot in Handygröße ansehen.
- **Lange deutsche Wörter** brechen auf schmalen Knöpfen schlecht um → weiche Trennstriche (`&shy;`).

## Verlauf

| Version | Inhalt |
|---|---|
| 0.1–0.6 | Fundament, Klasse 1 und 6, Stimmenauswahl, Versionsanzeige |
| 0.7–0.9 | Ziffern schreiben (Nachspuren) und Zahlendiktat, genauere Prüfung |
| 0.10–0.12 | Werkstatt mit vier Projekten, Eltern-Vorschau, Update-Fix für Safari |
| 0.13 | Browser-Tests + GitHub Actions, Schutz vor Datenverlust, Vorlesen Klasse 6 |
| 0.14 | Klasse 1 ohne Lesen bedienbar |
| 0.15 | Anpassende Hilfe in Übungsrunden |

## Nächste Schritte (Ideen, noch nicht beauftragt)

- Klasse 1: Zahlen bis 100, Geld, Formen und Muster, Uhrzeit.
- Klasse 2–5 auffüllen (Einmaleins, schriftliche Verfahren, Größen, Geometrie).
- Klasse 6: Prozent, Teilbarkeit, negative Zahlen.
- Schönere Werkstatt-Grafiken.
- Natürlichere Stimme (Audiodateien oder Cloud-TTS).
- Später: Server-Backend mit Konten für viele Nutzer (Datenbank-Schnittstelle ist dafür vorbereitet).

## Arbeitsweise

- Änderungen klein halten, nach jedem Schritt `npm run test:alle`, dann Commit und Push auf `main`.
- Für Bildschirm-Prüfungen: `tests/browser/hilfen.js` bietet `serverStarten`, `browserStarten`,
  `profileAnlegen` usw.; damit lassen sich Screenshots in 390 × 844 erzeugen.
- Rückmeldungen der Familie kommen meist als Fehlerbericht vom iPhone – erst nachstellen
  (am besten als Browser-Test), dann beheben.
