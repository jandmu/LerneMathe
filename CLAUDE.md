# Hinweise für Claude

- Sprache: Code-Bezeichner, Kommentare, Texte und Commit-Nachrichten auf Deutsch.
- Keine Abhängigkeiten, kein Build-Schritt. ES-Module, direkt im Browser lauffähig.
- `src/core/` und `src/inhalte/` dürfen nicht auf DOM zugreifen (werden in Node getestet).
- Neues Thema: Datei in `src/inhalte/k<klasse>/`, in `src/inhalte/index.js` registrieren, `npm test`.
  Jede Aufgabe braucht einen vollständigen Lösungsweg (`weg`) und, wo sinnvoll, ein `fehlbild` für typische Fehler.
- Didaktische Leitlinien stehen in `docs/DIDAKTIK.md` – neue Inhalte daran ausrichten
  (vom Bild zur Zahl, Strategien statt Abzählen, erklärende Rückmeldung, kein Zeitdruck).
- Texte für Klasse 1–2: kurze Sätze, vorlesbar (`sprich`-Feld nutzen, wenn der Text Rechenzeichen enthält).
- Vor dem Commit: `npm test`.
