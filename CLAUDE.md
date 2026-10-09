# Hinweise für Claude

Zuerst lesen: @docs/STAND.md (für wen, Entscheidungen, bekannte Fallstricke, nächste Schritte)
und @docs/ARCHITEKTUR.md. Nach größeren Änderungen `docs/STAND.md` aktualisieren.

- Sprache: Code-Bezeichner, Kommentare, Texte und Commit-Nachrichten auf Deutsch.
- Keine Abhängigkeiten, kein Build-Schritt. ES-Module, direkt im Browser lauffähig.
- `src/core/` und `src/inhalte/` dürfen nicht auf DOM zugreifen (werden in Node getestet).
- Neues Thema: Datei in `src/inhalte/k<klasse>/`, in `src/inhalte/index.js` registrieren, `npm test`.
  Jede Aufgabe braucht einen vollständigen Lösungsweg (`weg`) und, wo sinnvoll, ein `fehlbild` für typische Fehler.
- Didaktische Leitlinien stehen in `docs/DIDAKTIK.md` – neue Inhalte daran ausrichten
  (vom Bild zur Zahl, Strategien statt Abzählen, erklärende Rückmeldung, kein Zeitdruck).
- Texte für Klasse 1–2: kurze Sätze, vorlesbar (`sprich`-Feld nutzen, wenn der Text Rechenzeichen enthält).
- Vor dem Commit: `npm run test:alle` (Rechenkern-Tests und Browser-Tests in Handy-Größe, `tests/browser/`).
  Neue Aufgabenarten in `tests/browser/hilfen.js` → `aufgabeLoesen()` ergänzen. GitHub Actions führt beides bei jedem Push aus.
- Bei jeder Veröffentlichung `VERSION` in `src/app.js` (wird im Elternbereich angezeigt) und `VERSION` in `sw.js`
  erhöhen. Der Service Worker fragt jede Datei beim Server nach und lädt die App nach einem Update einmal neu,
  damit nie alte und neue Module gemischt laufen.
