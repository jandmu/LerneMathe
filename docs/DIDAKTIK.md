# Didaktisches Konzept

Die Mathewerkstatt orientiert sich nicht an einem bestimmten Lehrplan, sondern an gut belegten
Befunden der Lern- und Mathematikdidaktik-Forschung. Jedes Prinzip ist im Code konkret umgesetzt;
die Tabelle zeigt, wo.

| Prinzip | Kernaussage | Umsetzung | Ort im Code |
|---|---|---|---|
| **Vom Konkreten zum Abstrakten** (Bruner 1966; Fyfe u. a. 2014: *concreteness fading*) | Neue Inhalte zuerst handelnd/bildlich, dann symbolisch. Bilder später bewusst weglassen. | Stufen gehen von „mit Bild“ zu „ohne Bild“ (z. B. Zehnerfreunde → Zehnerfreunde ohne Bild). | `src/inhalte/k1/*` |
| **Strukturierte Anschauung statt Abzählen** (Gaidoschik 2010; Krauthausen: „Kraft der Fünf“) | Zählendes Rechnen ist ein Hauptrisiko für Rechenschwäche. Mengen in Fünfer-/Zehnerstruktur sehen, Zerlegungen und Strategien (Verdoppeln, Zehnerübergang) lernen. | Zehner-/Zwanzigerfeld mit Fünferlücke, Zahlenhaus, Lösungswege über Zerlegung statt „zähl weiter“. | `src/core/bilder.js`, `k1/rechnen20.js` |
| **Kognitive Belastung gering halten** (Sweller 1988; Sweller u. a. 2019) | Arbeitsgedächtnis ist knapp. Ein Gedanke pro Bildschirm, nichts Überflüssiges. | Erklärkarten mit je einem Satz-Gedanken; Übungsrunden zeigen nur die eine Aufgabe. | `ansicht-lernen.js` |
| **Modalitätsprinzip** (Mayer 2021) | Bild + gesprochener Text ist besser als Bild + Lesetext – besonders für Leseanfänger. | Vorlesen (Web Speech API), standardmäßig an für Klasse 1–2. | `src/ui/sprache.js` |
| **Lösungsbeispiele und Ausblenden** (Renkl & Atkinson 2003; Atkinson, Renkl & Merrill 2003) | Anfänger lernen mehr aus vorgerechneten Beispielen als aus eigenem Probieren; dann schrittweise selbst übernehmen. | Lernpfad: Verstehen → Zuschauen (Schritt für Schritt) → Mitmachen (halber Weg vorgegeben) → Selbst üben. | `ansicht-lernen.js` |
| **Abrufübung** (Roediger & Karpicke 2006; Dunlosky u. a. 2013) | Aktives Abrufen festigt Wissen stärker als Wiederlesen. | Kurze Übungsrunden (8 bzw. 10 Aufgaben); gezählt wird der erste Versuch. | `ansicht-runde.js` |
| **Erklärende Rückmeldung** (Hattie & Timperley 2007; Shute 2008) | Sofortiges, aufgabenbezogenes Feedback mit Hinweis auf den nächsten Schritt wirkt am stärksten. | Nach einem Fehler: gezielter Tipp + zweiter Versuch; nach dem zweiten Fehler: vollständiger Lösungsweg. | `ansicht-runde.js` |
| **Fehlvorstellungen gezielt ansprechen** (Resnick u. a. 1989; Steinle & Stacey 2004) | Viele Fehler sind systematisch („längere Dezimalzahl ist größer“, „Nenner addieren“, „13 − 5 = 12“). Sie brauchen eigene Erklärungen. | `fehlbild`-Funktionen erkennen typische Fehler, geben passende Rückmeldung und zählen sie für den Elternbereich. | `src/core/aufgabe.js` (`FEHLERBILDER`), Generatoren |
| **Verteiltes Wiederholen** (Cepeda u. a. 2006) | Wiederholung mit wachsenden Abständen schlägt massiertes Üben deutlich. | Lernkartei pro Fertigkeit: Abstände 1, 1, 3, 7, 14, 30 Tage; ab Fach 2 steigt eine Fertigkeit nur, wenn sie fällig war. | `src/core/lernplan.js` |
| **Wiederholtes Neulernen** (Rawson & Dunlosky 2011) | Falsch Gelöstes in derselben Sitzung erneut abrufen. | Falsch gelöste Fertigkeiten kommen in der Runde noch einmal (max. 3 Zusatzaufgaben). | `ansicht-runde.js` |
| **Verschränktes Üben** (Rohrer & Taylor 2007) | Gemischte Aufgabentypen verbessern die Wahl des richtigen Verfahrens. | Fällige Wiederholungen werden in Fokus-Runden eingestreut; Tagesmix mischt bis zu vier Fertigkeiten. Neues wird zuerst geblockt geübt. | `rundePlanen()` |
| **Lernen bis zur Beherrschung** (Bloom 1968; Kulik u. a. 1990) | Erst sichern, dann weiter. | Empfehlung „Als Nächstes“ folgt erst, wenn die vorige Stufe mindestens „fast sicher“ ist. Gesperrt wird nichts. | `empfehlung()` |
| **Prozesslob, kein Druck** (Mueller & Dweck 1998; Ramirez u. a. 2013) | Lob für Fähigkeit („du bist schlau“) kann schaden; Zeitdruck verstärkt Rechenangst. | Keine Zeitlimits, keine Ranglisten; Rückmeldung lobt Anstrengung und Rechenweg. | Texte in `ansicht-runde.js` |

## Quellen

- Atkinson, R. K., Renkl, A., & Merrill, M. M. (2003). Transitioning from studying examples to solving problems. *Journal of Educational Psychology, 95*(4), 774–783.
- Bloom, B. S. (1968). Learning for mastery. *Evaluation Comment, 1*(2).
- Bruner, J. S. (1966). *Toward a Theory of Instruction*. Harvard University Press.
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin, 132*(3), 354–380.
- Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest, 14*(1), 4–58.
- Fyfe, E. R., McNeil, N. M., Son, J. Y., & Goldstone, R. L. (2014). Concreteness fading in mathematics and science instruction: A systematic review. *Educational Psychology Review, 26*(1), 9–25.
- Gaidoschik, M. (2010). *Wie Kinder rechnen lernen – oder auch nicht*. Peter Lang.
- Hattie, J., & Timperley, H. (2007). The power of feedback. *Review of Educational Research, 77*(1), 81–112.
- Kulik, C.-L. C., Kulik, J. A., & Bangert-Drowns, R. L. (1990). Effectiveness of mastery learning programs: A meta-analysis. *Review of Educational Research, 60*(2), 265–299.
- Mayer, R. E. (2021). *Multimedia Learning* (3. Aufl.). Cambridge University Press.
- Mueller, C. M., & Dweck, C. S. (1998). Praise for intelligence can undermine children's motivation and performance. *Journal of Personality and Social Psychology, 75*(1), 33–52.
- Ramirez, G., Gunderson, E. A., Levine, S. C., & Beilock, S. L. (2013). Math anxiety, working memory, and math achievement in early elementary school. *Journal of Cognition and Development, 14*(2), 187–202.
- Rawson, K. A., & Dunlosky, J. (2011). Optimizing schedules of retrieval practice for durable and efficient learning. *Journal of Experimental Psychology: General, 140*(3), 283–302.
- Renkl, A., & Atkinson, R. K. (2003). Structuring the transition from example study to problem solving in cognitive skill acquisition. *Educational Psychologist, 38*(1), 15–22.
- Resnick, L. B., Nesher, P., Leonard, F., Magone, M., Omanson, S., & Peled, I. (1989). Conceptual bases of arithmetic errors: The case of decimal fractions. *Journal for Research in Mathematics Education, 20*(1), 8–27.
- Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning. *Psychological Science, 17*(3), 249–255.
- Rohrer, D., & Taylor, K. (2007). The shuffling of mathematics problems improves learning. *Instructional Science, 35*(6), 481–498.
- Shute, V. J. (2008). Focus on formative feedback. *Review of Educational Research, 78*(1), 153–189.
- Steinle, V., & Stacey, K. (2004). Persistence of decimal misconceptions and readiness to move to expertise. *Proceedings of PME 28*, Vol. 4, 225–232.
- Sweller, J. (1988). Cognitive load during problem solving. *Cognitive Science, 12*(2), 257–285.
- Sweller, J., van Merriënboer, J. J. G., & Paas, F. (2019). Cognitive architecture and instructional design: 20 years later. *Educational Psychology Review, 31*(2), 261–292.
