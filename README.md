# Mathewerkstatt

Browser-App zum Lernen und Üben von Mathematik für die Klassen 1 bis 6.
Läuft auf Smartphone, Tablet und Rechner – ohne Installation, ohne Konto, ohne Abhängigkeiten.

## Was die App kann

- **Profile für mehrere Kinder** mit eigenem Lernstand (alles lokal auf dem Gerät).
- **Lernpfad pro Thema:** Verstehen (Erklärkarten mit Bildern, vorgelesen) → Zuschauen
  (vorgerechnetes Beispiel Schritt für Schritt) → Mitmachen (halber Weg vorgegeben) → Selbst üben.
- **Übungsrunden** mit immer neu erzeugten Aufgaben, erklärender Rückmeldung, zweitem Versuch und Lösungsweg.
- **Lernkartei mit Wiederholungsplan:** Was sitzt, kommt nach Tagen und Wochen wieder.
- **Erkennung typischer Fehler** (z. B. „Nenner addiert“, „13 − 5 = 12“, „0,45 > 0,5“) mit eigener Erklärung.
- **Elternbereich:** Profile verwalten, Lernstand und häufige Fehler je Kind, Sicherung herunterladen/einspielen.
- **Klasse 1–2:** große Zahlentasten, wenig Text, Vorlesen. Hell- und Dunkelmodus, offline nutzbar.

## Inhalte

| Klasse | Themen |
|---|---|
| 1 | Ziffern schreiben (Nachspuren mit dem Finger) · Mengen sehen (Kraft der Fünf) · Zahlen hören und schreiben (Zahlendiktat bis 100, Zahlendreher) · Zahlen zerlegen (Zahlenhaus, Zehnerfreunde) · Plus und Minus bis 10 · Plus bis 20 (Verdoppeln, Zehnerübergang) · Minus bis 20 |
| 6 | Brüche: Grundlagen, Erweitern, Kürzen, Gemischte Zahlen, Vergleichen, Addieren, Subtrahieren, Multiplizieren, Dividieren · Dezimalzahlen: Verstehen, Vergleichen, Addieren/Subtrahieren, Mal/Geteilt durch 10, 100, 1000 |

Weitere Klassen und Themen lassen sich ohne Änderung der Oberfläche ergänzen (siehe `docs/ARCHITEKTUR.md`).

## Starten

```bash
npm start      # python3 -m http.server 8080 → http://localhost:8080
npm test       # Tests (Node 20+)
```

Die App nutzt ES-Module und muss deshalb über einen Webserver geöffnet werden (nicht per Doppelklick als Datei).

### Veröffentlichen mit GitHub Pages

*Settings → Pages → Deploy from a branch →* Branch `main`, Ordner `/ (root)`.

## Dokumentation

- [Didaktisches Konzept mit Quellen](docs/DIDAKTIK.md)
- [Architektur und Weg zu vielen Nutzern](docs/ARCHITEKTUR.md)
