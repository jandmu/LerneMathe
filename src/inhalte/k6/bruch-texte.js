/** Erklärtexte, Merksätze und typische Fehler zur Bruchrechnung (aus der Bruchwerkstatt). */
import { Bruch, F, G, op, gl, kreise, balken } from '../../core/bruch.js';

const P = op('+');
const M = op('-');
const X = op('*');
const D = op(':');

export const BRUCH_TEXTE = {
  grundlagen: {
    titel: 'Was ist ein Bruch?',
    kurz: 'Zähler, Nenner und was sie bedeuten',
    chip: 'Grundlagen',
    regel: `
      <p>Der <b>Nenner</b> (unten) sagt, in wie viele gleich große Teile ein Ganzes geteilt ist.
      Der <b>Zähler</b> (oben) sagt, wie viele dieser Teile gemeint sind.</p>
      <div class="regel-bsp">${kreise(3, 4)}<span class="regel-gross">${F(3, 4)}</span><span>„drei Viertel“</span></div>`,
    text: `
      <p>Eine Pizza wird in 8 gleich große Stücke geschnitten. Du isst 3 davon.
      Dann hast du ${F(3, 8)} der Pizza gegessen, gesprochen „drei Achtel“.</p>
      <p>Der Bruchstrich bedeutet dasselbe wie „geteilt durch“: ${F(3, 4)} = 3 : 4 = 0,75.</p>
      <h3>Arten von Brüchen</h3>
      <ul>
        <li><b>Echter Bruch:</b> Der Zähler ist kleiner als der Nenner, z. B. ${F(2, 5)}. Er ist kleiner als 1.</li>
        <li><b>Unechter Bruch:</b> Der Zähler ist größer als der Nenner, z. B. ${F(7, 4)}. Er ist größer als 1.</li>
        <li><b>Stammbruch:</b> Der Zähler ist 1, z. B. ${F(1, 3)}.</li>
        <li><b>Scheinbruch:</b> Er ist in Wahrheit eine ganze Zahl, z. B. ${F(6, 3)} = 2.</li>
      </ul>`,
    fehler: [
      'Zähler und Nenner vertauschen. Der Nenner steht unten und nennt die Anzahl der Teile eines Ganzen.',
      'Ungleich große Teile zählen. Ein Bruch funktioniert nur, wenn alle Teile gleich groß sind.',
      `Bei mehreren Ganzen alle Teile in den Nenner zählen. Bei ${F(5, 4)} hat jedes Ganze 4 Teile, der Nenner bleibt 4.`,
    ],
  },

  erweitern: {
    titel: 'Erweitern',
    kurz: 'Zähler und Nenner mit derselben Zahl malnehmen',
    chip: 'Erweitern',
    regel: `
      <p>Multipliziere Zähler <b>und</b> Nenner mit derselben Zahl. Der Wert des Bruchs ändert sich dabei nicht.</p>
      <p class="regel-gross">${gl(F(2, 3), F('2 · 4', '3 · 4'), F(8, 12))}</p>`,
    text: `
      <p>Beide Streifen sind gleich weit gefärbt. Beim Erweitern werden die Teile nur feiner geschnitten:
      aus jedem Drittel werden vier Zwölftel.</p>
      <div class="bild-paar"><figure>${balken(2, 3)}<figcaption>${F(2, 3)}</figcaption></figure><figure>${balken(8, 12)}<figcaption>${F(8, 12)}</figcaption></figure></div>
      <p>Erweitern brauchst du vor allem, um Brüche auf einen gemeinsamen Nenner zu bringen, etwa beim Vergleichen und Addieren.</p>
      <h3>Auf einen bestimmten Nenner erweitern</h3>
      <p>Teile den gewünschten Nenner durch den alten Nenner. So erhältst du die Erweiterungszahl.
      Beispiel: ${F(3, 4)} auf den Nenner 20. Es gilt 20 : 4 = 5, also ${gl(F(3, 4), F('3 · 5', '4 · 5'), F(15, 20))}.</p>`,
    fehler: [
      `Nur den Nenner multiplizieren: ${F(2, 3)} ist nicht dasselbe wie ${F(2, 12)}. Zähler und Nenner gehören immer zusammen.`,
      `Addieren statt multiplizieren: ${F('2 + 1', '3 + 1')} = ${F(3, 4)} hat einen anderen Wert als ${F(2, 3)}.`,
    ],
  },

  kuerzen: {
    titel: 'Kürzen',
    kurz: 'Zähler und Nenner durch dieselbe Zahl teilen',
    chip: 'Kürzen',
    regel: `
      <p>Teile Zähler <b>und</b> Nenner durch dieselbe Zahl. Vollständig gekürzt ist ein Bruch,
      wenn Zähler und Nenner keinen gemeinsamen Teiler außer 1 mehr haben.</p>
      <p class="regel-gross">${gl(F(12, 18), F('12 : 6', '18 : 6'), F(2, 3))}</p>`,
    text: `
      <p>Kürzen ist das Gegenteil von Erweitern. Die Teile werden größer, der Wert bleibt gleich.</p>
      <div class="bild-paar"><figure>${balken(6, 8)}<figcaption>${F(6, 8)}</figcaption></figure><figure>${balken(3, 4)}<figcaption>${F(3, 4)}</figcaption></figure></div>
      <p>Am schnellsten kürzt du mit dem <b>größten gemeinsamen Teiler</b> (ggT). Du kannst aber auch in mehreren
      kleinen Schritten kürzen: ${gl(F(12, 18), F(6, 9), F(2, 3))}.</p>
      <h3>Teilbarkeitsregeln helfen</h3>
      <ul>
        <li><b>durch 2:</b> Die letzte Ziffer ist gerade.</li>
        <li><b>durch 3:</b> Die Quersumme ist durch 3 teilbar (bei 51: 5 + 1 = 6).</li>
        <li><b>durch 5:</b> Die letzte Ziffer ist 0 oder 5.</li>
        <li><b>durch 10:</b> Die letzte Ziffer ist 0.</li>
      </ul>`,
    fehler: [
      'Nur den Zähler oder nur den Nenner teilen.',
      'Zähler und Nenner durch verschiedene Zahlen teilen.',
      `Aus Summen kürzen: In ${F('2 + 3', '2 + 5')} darfst du die 2 nicht einfach streichen.`,
      `Zu früh aufhören: ${F(6, 9)} lässt sich noch durch 3 kürzen.`,
    ],
  },

  gemischt: {
    titel: 'Gemischte Zahlen',
    kurz: 'Ganze und Bruch in einer Zahl',
    chip: 'Gemischte Zahlen',
    regel: `
      <p>Eine gemischte Zahl besteht aus Ganzen und einem echten Bruch.
      ${G(new Bruch(11, 4))} bedeutet 2 ${P} ${F(3, 4)}.</p>
      <div class="regel-bsp">${kreise(11, 4)}</div>`,
    text: `
      <h3>Gemischte Zahl → unechter Bruch</h3>
      <p>Rechne Ganze mal Nenner und addiere den Zähler. Der Nenner bleibt.</p>
      <p class="mathe-zeile">${gl(G(new Bruch(11, 4)), F(`2 · 4 ${P} 3`, 4), F(11, 4))}</p>
      <h3>Unechter Bruch → gemischte Zahl</h3>
      <p>Teile den Zähler durch den Nenner. Das Ergebnis sind die Ganzen, der Rest ist der neue Zähler.</p>
      <p class="mathe-zeile">17 : 5 = 3 Rest 2, also ${gl(F(17, 5), G(new Bruch(17, 5)))}</p>`,
    fehler: [
      `Ganze und Zähler einfach addieren: ${G(new Bruch(11, 4))} ist nicht ${F(5, 4)}.`,
      'Den Nenner verändern. Beim Umwandeln bleibt der Nenner gleich.',
    ],
  },

  vergleichen: {
    titel: 'Brüche vergleichen',
    kurz: 'Welcher Bruch ist größer?',
    chip: 'Vergleichen',
    regel: `
      <p>Bringe die Brüche auf einen gemeinsamen Nenner. Dann ist der Bruch mit dem größeren Zähler größer.</p>
      <p class="regel-gross">${F(3, 4)}${op('<')}${F(5, 6)}, denn ${F(9, 12)}${op('<')}${F(10, 12)}</p>`,
    text: `
      <h3>Gleiche Nenner</h3>
      <p>${F(5, 8)}${op('>')}${F(3, 8)}, weil 5 Achtel mehr sind als 3 Achtel.</p>
      <h3>Gleiche Zähler</h3>
      <p>${F(1, 3)}${op('>')}${F(1, 5)}. Je größer der Nenner, desto kleiner sind die Teile.</p>
      <div class="bild-paar"><figure>${kreise(1, 3)}<figcaption>${F(1, 3)}</figcaption></figure><figure>${kreise(1, 5)}<figcaption>${F(1, 5)}</figcaption></figure></div>
      <h3>Verschiedene Nenner und Zähler</h3>
      <p>Suche den Hauptnenner. Das ist das kleinste gemeinsame Vielfache (kgV) der Nenner.
      Erweitere beide Brüche darauf und vergleiche dann die Zähler.</p>
      <p class="tipp"><b>Profi-Trick:</b> Über Kreuz multiplizieren. Bei ${F(3, 4)} und ${F(5, 6)} vergleichst du
      3 · 6 = 18 mit 5 · 4 = 20. Weil 18 kleiner als 20 ist, gilt ${F(3, 4)}${op('<')}${F(5, 6)}.</p>`,
    fehler: [
      `Nur auf den Nenner schauen: ${F(1, 8)} ist kleiner als ${F(1, 4)}, obwohl 8 größer ist als 4.`,
      'Die Zähler vergleichen, obwohl die Nenner verschieden sind.',
    ],
  },

  addieren: {
    titel: 'Addieren',
    kurz: 'Brüche zusammenzählen',
    chip: 'Addieren',
    regel: `
      <p>Gleichnamige Brüche (gleicher Nenner) addierst du direkt: Zähler plus Zähler, der Nenner bleibt.</p>
      <p class="regel-gross">${gl(`${F(2, 7)}${P}${F(3, 7)}`, F(`2 ${P} 3`, 7), F(5, 7))}</p>`,
    text: `
      <h3>Ungleichnamige Brüche</h3>
      <p>Haben die Brüche verschiedene Nenner, machst du sie zuerst gleichnamig:
      Hauptnenner suchen, beide Brüche erweitern, dann addieren.</p>
      <p class="mathe-zeile">${gl(`${F(1, 4)}${P}${F(1, 6)}`, `${F(3, 12)}${P}${F(2, 12)}`, F(5, 12))}</p>
      <h3>Gemischte Zahlen</h3>
      <p>Wandle gemischte Zahlen vorher in unechte Brüche um. Zum Schluss kürzt du das Ergebnis
      und schreibst es bei Bedarf wieder als gemischte Zahl.</p>
      <p class="mathe-zeile">${gl(`${G(new Bruch(3, 2))}${P}${F(3, 4)}`, `${F(6, 4)}${P}${F(3, 4)}`, F(9, 4), G(new Bruch(9, 4)))}</p>`,
    fehler: [
      `Nenner addieren: ${F(1, 2)} ${P} ${F(1, 3)} ist nicht ${F(2, 5)}. Das wäre sogar kleiner als ${F(1, 2)} allein.`,
      'Nur einen Bruch erweitern und den anderen vergessen.',
      'Beim Erweitern nur den Nenner ändern.',
    ],
  },

  subtrahieren: {
    titel: 'Subtrahieren',
    kurz: 'Brüche voneinander abziehen',
    chip: 'Subtrahieren',
    regel: `
      <p>Gleichnamige Brüche subtrahierst du direkt: Zähler minus Zähler, der Nenner bleibt.</p>
      <p class="regel-gross">${gl(`${F(5, 9)}${M}${F(2, 9)}`, F(`5 ${M} 2`, 9), F(3, 9), F(1, 3))}</p>`,
    text: `
      <h3>Verschiedene Nenner</h3>
      <p>Wie beim Addieren machst du die Brüche zuerst gleichnamig.</p>
      <p class="mathe-zeile">${gl(`${F(3, 4)}${M}${F(1, 6)}`, `${F(9, 12)}${M}${F(2, 12)}`, F(7, 12))}</p>
      <h3>Gemischte Zahlen</h3>
      <p>Am sichersten wandelst du in unechte Brüche um. Dann gibt es kein Problem,
      wenn der zweite Bruchteil größer ist als der erste.</p>
      <p class="mathe-zeile">${gl(`${G(new Bruch(13, 4))}${M}${G(new Bruch(3, 2))}`, `${F(13, 4)}${M}${F(6, 4)}`, F(7, 4), G(new Bruch(7, 4)))}</p>`,
    fehler: [
      `Nenner subtrahieren: ${F(5, 6)} ${M} ${F(1, 3)} ist nicht ${F(4, 3)}.`,
      'Bei gemischten Zahlen nur die Brüche abziehen und die Ganzen vergessen.',
    ],
  },

  multiplizieren: {
    titel: 'Multiplizieren',
    kurz: 'Brüche malnehmen',
    chip: 'Multiplizieren',
    regel: `
      <p>Zähler mal Zähler, Nenner mal Nenner. Einen gemeinsamen Nenner brauchst du hier nicht.</p>
      <p class="regel-gross">${gl(`${F(2, 3)}${X}${F(4, 5)}`, F('2 · 4', '3 · 5'), F(8, 15))}</p>`,
    text: `
      <h3>Bruch mal ganze Zahl</h3>
      <p>Schreibe die ganze Zahl als Bruch mit dem Nenner 1. Dann wird nur der Zähler multipliziert:</p>
      <p class="mathe-zeile">${gl(`${F(3, 8)}${X}2`, `${F(3, 8)}${X}${F(2, 1)}`, F(6, 8), F(3, 4))}</p>
      <h3>Vorher kürzen spart Arbeit</h3>
      <p>Vor dem Ausrechnen darfst du jeden Zähler mit jedem Nenner kürzen, auch über Kreuz.
      Bei ${F(4, 9)}${X}${F(3, 8)} kürzt du 4 und 8 durch 4 und 3 und 9 durch 3:</p>
      <p class="mathe-zeile">${gl(`${F(4, 9)}${X}${F(3, 8)}`, `${F(1, 3)}${X}${F(1, 2)}`, F(1, 6))}</p>
      <h3>„von“ heißt „mal“</h3>
      <p>${F(2, 3)} von 12 € = ${F(2, 3)}${X}12 = ${F(24, 3)} = 8 €.</p>
      <p>Gemischte Zahlen wandelst du vorher in unechte Brüche um.</p>`,
    fehler: [
      'Einen gemeinsamen Nenner bilden. Beim Malnehmen ist das unnötig und macht die Zahlen nur größer.',
      `Bei Bruch mal ganzer Zahl auch den Nenner multiplizieren: ${F(3, 8)}${X}2 ist nicht ${F(6, 16)}.`,
      `Gemischte Zahlen Teil für Teil multiplizieren: ${G(new Bruch(5, 2))}${X}${G(new Bruch(5, 2))} ist nicht ${G(new Bruch(17, 4))}, sondern ${G(new Bruch(25, 4))}.`,
    ],
  },

  dividieren: {
    titel: 'Dividieren',
    kurz: 'Mit dem Kehrwert malnehmen',
    chip: 'Dividieren',
    regel: `
      <p>Teilen durch einen Bruch heißt: mit dem <b>Kehrwert</b> malnehmen.
      Den Kehrwert bekommst du, indem du Zähler und Nenner vertauschst.</p>
      <p class="regel-gross">${gl(`${F(2, 3)}${D}${F(4, 5)}`, `${F(2, 3)}${X}${F(5, 4)}`, F(10, 12), F(5, 6))}</p>`,
    text: `
      <h3>Warum klappt das?</h3>
      <p>Wie oft passt ${F(1, 2)} in 3? Genau sechsmal, denn jedes Ganze enthält zwei Halbe:
      3 ${D} ${F(1, 2)} = 3 ${X} 2 = 6. Durch ein Halb teilen ist dasselbe wie mal 2 nehmen.</p>
      <h3>Bruch geteilt durch ganze Zahl</h3>
      <p>Die ganze Zahl 4 hat den Kehrwert ${F(1, 4)}:</p>
      <p class="mathe-zeile">${gl(`${F(2, 3)}${D}4`, `${F(2, 3)}${X}${F(1, 4)}`, F(2, 12), F(1, 6))}</p>
      <p>Gemischte Zahlen wandelst du zuerst in unechte Brüche um.</p>`,
    fehler: [
      'Den Kehrwert vom ersten Bruch bilden. Nur der Bruch hinter dem Geteilt-Zeichen wird umgedreht.',
      'Den Kehrwert bilden und trotzdem weiter teilen. Aus „:“ wird „·“.',
      'Durch 0 teilen. Die 0 hat keinen Kehrwert.',
    ],
  },
};
