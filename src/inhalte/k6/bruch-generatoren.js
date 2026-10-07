/**
 * Aufgaben-Generatoren für die Bruchrechnung (übernommen aus der Bruchwerkstatt).
 * Jeder Generator liefert eine Aufgabe mit vollständigem Lösungsweg.
 */
import { Bruch, F, B, G, op, gl, hl, ergebnisHTML, kreise, balken } from '../../core/bruch.js';
import { bruchAufgabe, auswahlAufgabe, S } from '../../core/aufgabe.js';
import { ggT, kgV, teiler, vielfache, zufall, wahl } from '../../core/util.js';


function kuerzenSchritte(b) {
  const g = ggT(b.z, b.n);
  if (g <= 1 || b.z === 0) return [];
  const k = b.gekuerzt();
  let mathe;
  if (b.z <= 150 && b.n <= 150) {
    const tz = teiler(b.z);
    const tn = teiler(b.n);
    const markiere = (liste, andere) =>
      liste.map((t) => (t === g ? hl(t) : andere.includes(t) ? `<b>${t}</b>` : t)).join(', ');
    mathe =
      `Teiler von ${b.z}: ${markiere(tz, tn)}<br>` +
      `Teiler von ${b.n}: ${markiere(tn, tz)}<br>` +
      `ggT(${b.z}, ${b.n}) = ${g}`;
  } else {
    mathe = `ggT(${b.z}, ${b.n}) = ${g}`;
  }
  return [
    S('Suche den größten gemeinsamen Teiler (ggT) von Zähler und Nenner.', mathe),
    S(`Kürze: Teile Zähler und Nenner durch ${g}.`, gl(F(b.z, b.n), F(`${b.z} : ${g}`, `${b.n} : ${g}`), B(k))),
  ];
}

function ergebnisSchritte(roh) {
  const schritte = kuerzenSchritte(roh);
  const k = roh.gekuerzt();
  if (k.n !== 1 && k.z > k.n) {
    schritte.push(
      S(
        'Das Ergebnis ist ein unechter Bruch. Du kannst es auch als gemischte Zahl schreiben.',
        gl(F(k.z, k.n), `${k.ganze} ${op('+')} ${F(k.rest, k.n)}`, G(k))
      )
    );
  }
  return schritte;
}

/** Operand einer Rechnung: Bruch plus Info, ob er als gemischte Zahl angezeigt wird. */
function opd(b, gemischt) {
  return { b, gemischt: !!gemischt && b.n !== 1 && b.z > b.n };
}

function zeige(o) {
  return o.gemischt ? G(o.b) : B(o.b);
}

function umwandelnSchritte(ops) {
  const s = [];
  const gem = ops.filter((o) => o.gemischt);
  if (gem.length) {
    s.push(
      S(
        gem.length > 1
          ? 'Wandle die gemischten Zahlen in unechte Brüche um: Ganze mal Nenner, plus Zähler.'
          : 'Wandle die gemischte Zahl in einen unechten Bruch um: Ganze mal Nenner, plus Zähler.',
        gem.map((o) => gl(G(o.b), F(`${o.b.ganze} · ${o.b.n} ${op('+')} ${o.b.rest}`, o.b.n), F(o.b.z, o.b.n))).join('<br>')
      )
    );
  }
  const ganz = ops.filter((o) => o.b.n === 1);
  if (ganz.length) {
    s.push(S('Schreibe die ganze Zahl als Bruch mit dem Nenner 1.', ganz.map((o) => gl(o.b.z, F(o.b.z, 1))).join('<br>')));
  }
  return s;
}

function hauptnennerSchritte(a, b) {
  const hn = kgV(a.n, b.n);
  const liste = (n) => {
    const v = vielfache(n, hn);
    const kurz = v.length > 7 ? [...v.slice(0, 4), '…', v[v.length - 1]] : v;
    return kurz.map((x) => (x === hn ? hl(x) : x)).join(', ');
  };
  const ka = hn / a.n;
  const kb = hn / b.n;
  const a2 = new Bruch(a.z * ka, hn);
  const b2 = new Bruch(b.z * kb, hn);
  const erw = (x, k) =>
    k === 1
      ? `${F(x.z, x.n)} hat schon den Nenner ${hn}.`
      : gl(F(x.z, x.n), F(`${x.z} · ${k}`, `${x.n} · ${k}`), F(x.z * k, hn));
  return {
    hn,
    a2,
    b2,
    schritte: [
      S(
        'Finde den Hauptnenner. Das ist das kleinste gemeinsame Vielfache (kgV) der Nenner.',
        `Vielfache von ${a.n}: ${liste(a.n)}<br>Vielfache von ${b.n}: ${liste(b.n)}<br>Hauptnenner: kgV(${a.n}, ${b.n}) = ${hn}`
      ),
      S(`Erweitere beide Brüche auf den Nenner ${hn}.`, erw(a, ka) + '<br>' + erw(b, kb)),
    ],
  };
}

function addSubWeg(oa, ob, zeichen) {
  const plus = zeichen === '+';
  let s = umwandelnSchritte([oa, ob]);
  let a = oa.b;
  let b = ob.b;
  const gleichnamig = a.n === b.n;
  if (!gleichnamig) {
    const h = hauptnennerSchritte(a, b);
    s = s.concat(h.schritte);
    a = h.a2;
    b = h.b2;
  }
  const z = plus ? a.z + b.z : a.z - b.z;
  const roh = new Bruch(z, a.n);
  s.push(
    S(
      `${gleichnamig ? 'Die Nenner sind gleich.' : 'Jetzt sind die Nenner gleich.'} ${plus ? 'Addiere' : 'Subtrahiere'} die Zähler. Der Nenner bleibt.`,
      gl(`${F(a.z, a.n)}${op(zeichen)}${F(b.z, b.n)}`, F(`${a.z} ${op(zeichen)} ${b.z}`, a.n), F(z, a.n))
    )
  );
  s = s.concat(ergebnisSchritte(roh));
  return { schritte: s, loesung: roh.gekuerzt() };
}

function malWeg(a, b, schritteVorher) {
  const s = schritteVorher || [];
  const roh = new Bruch(a.z * b.z, a.n * b.n);
  s.push(
    S(
      'Multipliziere Zähler mal Zähler und Nenner mal Nenner.',
      gl(`${F(a.z, a.n)}${op('*')}${F(b.z, b.n)}`, F(`${a.z} · ${b.z}`, `${a.n} · ${b.n}`), F(roh.z, roh.n))
    )
  );
  const k1 = ggT(a.z, b.n);
  const k2 = ggT(b.z, a.n);
  if ((k1 > 1 && a.z > 0) || (k2 > 1 && b.z > 0)) {
    const teile = [];
    if (k1 > 1) teile.push(`${a.z} und ${b.n} durch ${k1}`);
    if (k2 > 1) teile.push(`${b.z} und ${a.n} durch ${k2}`);
    s.push(
      S(
        'Tipp: Du hättest schon vor dem Ausrechnen über Kreuz kürzen können. Dann bleiben die Zahlen kleiner.',
        'Über Kreuz kürzen: ' + teile.join(', ')
      )
    );
  }
  return { schritte: s.concat(ergebnisSchritte(roh)), loesung: roh.gekuerzt() };
}

function vergleichWeg(a, b) {
  const c = a.vergleiche(b);
  const zeichen = c < 0 ? '<' : c > 0 ? '>' : '=';
  const s = [];
  if (a.n === b.n) {
    s.push(S('Die Nenner sind gleich. Dann ist der Bruch mit dem größeren Zähler größer.', `${a.z}${op(zeichen)}${b.z}`));
  } else if (a.z === b.z) {
    s.push(
      S(
        'Die Zähler sind gleich. Dann ist der Bruch mit dem kleineren Nenner größer, denn seine Teile sind größer.',
        `Nenner ${a.n} und ${b.n}: ${F(1, a.n)}${op(zeichen)}${F(1, b.n)}`
      )
    );
  } else {
    const h = hauptnennerSchritte(a, b);
    s.push(...h.schritte);
    s.push(S('Beide Brüche haben jetzt denselben Nenner. Vergleiche die Zähler.', `${F(h.a2.z, h.hn)}${op(zeichen)}${F(h.b2.z, h.hn)}`));
  }
  return { schritte: s, loesung: zeichen, ergebnis: `${F(a.z, a.n)}${op(zeichen)}${F(b.z, b.n)}` };
}

// ---------- Aufgaben-Generatoren ----------

const NENNER = {
  leicht: [2, 3, 4, 5, 6, 8, 10],
  mittel: [2, 3, 4, 5, 6, 7, 8, 9, 10, 12],
  schwer: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 20],
};

function echterBruch(nennerListe) {
  const n = wahl(nennerListe);
  let z;
  do {
    z = zufall(1, n - 1);
  } while (ggT(z, n) !== 1);
  return new Bruch(z, n);
}

function gemischteZahl(gMax, nennerListe) {
  const b = echterBruch(nennerListe);
  return Bruch.gemischt(zufall(1, gMax), b.z, b.n);
}

function zweiVerschiedeneNenner(liste) {
  const a = echterBruch(liste);
  let b;
  do {
    b = echterBruch(liste);
  } while (b.n === a.n);
  return [a, b];
}

const HINWEIS_HN = 'Bringe beide Brüche zuerst auf einen gemeinsamen Nenner (Hauptnenner).';

const GEN = {
  grundlagen(stufe) {
    const n = wahl(stufe === 'leicht' ? [2, 3, 4, 5, 6, 8] : [3, 4, 5, 6, 8, 10, 12]);
    let z;
    if (stufe === 'schwer') {
      do {
        z = zufall(1, 2 * n - 1);
      } while (z === n);
    } else {
      z = zufall(1, n - 1);
    }
    const b = new Bruch(z, n);
    const bild = wahl(['kreis', 'balken']) === 'kreis' ? kreise(z, n) : balken(z, n);
    const schritte = [
      S(`Ein Ganzes ist in ${n} gleich große Teile geteilt. Das ist der Nenner.`, F('?', n)),
      S(`${z} ${z === 1 ? 'Teil ist' : 'Teile sind'} gefärbt. Das ist der Zähler.`, F(z, n)),
    ];
    if (z > n) {
      schritte.push(
        S('Es sind mehr Teile gefärbt, als ein Ganzes hat. Der Bruch ist größer als 1 (unechter Bruch).', gl(F(z, n), G(b)))
      );
    }
    return {
      frage: 'Welcher Bruch ist dargestellt?',
      aufgabe: F('?', '?'),
      bild,
      art: 'bruch',
      loesung: b,
      mussGekuerzt: false,
      ohneGanze: true,
      hinweis: 'Zähle zuerst, in wie viele gleiche Teile ein Ganzes geteilt ist (Nenner). Dann zähle die gefärbten Teile (Zähler).',
      schritte,
      ergebnis: F(z, n),
    };
  },

  erweitern(stufe) {
    const b = echterBruch(NENNER[stufe]);
    const k = zufall(2, { leicht: 5, mittel: 9, schwer: 15 }[stufe]);
    const N = b.n * k;
    const l = new Bruch(b.z * k, N);
    return {
      frage: `Erweitere auf den Nenner ${N}.`,
      aufgabe: gl(F(b.z, b.n), F('?', N)),
      art: 'bruch',
      loesung: l,
      nennerFest: N,
      fehlbild: (x) => (x.z === b.z ? { text: `Du hast nur den Nenner verändert. Multipliziere auch den Zähler mit ${k}.`, fehler: 'nur-nenner' } : null),
      hinweis: `Womit musst du ${b.n} multiplizieren, um ${N} zu erhalten? Mit derselben Zahl multiplizierst du den Zähler.`,
      schritte: [
        S('Finde die Erweiterungszahl: Womit wurde der Nenner multipliziert?', `${b.n} · ? = ${N}<br>${N} : ${b.n} = ${hl(k)}`),
        S(`Multipliziere auch den Zähler mit ${k}.`, gl(F(b.z, b.n), F(`${b.z} · ${k}`, `${b.n} · ${k}`), F(l.z, N))),
      ],
      ergebnis: F(l.z, N),
    };
  },

  kuerzen(stufe) {
    const cfg = {
      leicht: { n: [2, 3, 4, 5, 6], k: [2, 3, 4, 5] },
      mittel: { n: [2, 3, 4, 5, 6, 7, 8, 9, 10], k: [2, 3, 4, 5, 6, 7, 8, 9] },
      schwer: { n: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15], k: [6, 8, 9, 10, 12, 14, 15, 16, 18] },
    }[stufe];
    let b = echterBruch(cfg.n);
    if (stufe !== 'leicht' && Math.random() < 0.25) b = new Bruch(b.n, b.z);
    const k = wahl(cfg.k);
    const roh = new Bruch(b.z * k, b.n * k);
    const l = roh.gekuerzt();
    return {
      frage: 'Kürze so weit wie möglich.',
      aufgabe: F(roh.z, roh.n),
      art: 'bruch',
      loesung: l,
      mussGekuerzt: true,
      hinweis: 'Suche eine Zahl, durch die Zähler und Nenner beide teilbar sind. Am schnellsten geht es mit dem größten gemeinsamen Teiler.',
      schritte: ergebnisSchritte(roh),
      ergebnis: ergebnisHTML(l),
    };
  },

  gemischt(stufe) {
    const gMax = { leicht: 3, mittel: 6, schwer: 12 }[stufe];
    const b = gemischteZahl(gMax, NENNER[stufe]);
    if (Math.random() < 0.5) {
      return {
        frage: 'Schreibe als unechten Bruch.',
        aufgabe: gl(G(b), '?'),
        art: 'bruch',
        loesung: b,
        form: 'unecht',
        mussGekuerzt: true,
        ohneGanze: true,
        hinweis: 'Rechne Ganze mal Nenner und addiere den Zähler. Der Nenner bleibt gleich.',
        schritte: [
          S(
            `Rechne Ganze mal Nenner: ${b.ganze} · ${b.n} = ${b.ganze * b.n}. So viele ${b.n}-tel stecken in den ${b.ganze} Ganzen.`,
            ''
          ),
          S(`Addiere den Zähler ${b.rest}. Der Nenner ${b.n} bleibt.`, gl(G(b), F(`${b.ganze} · ${b.n} ${op('+')} ${b.rest}`, b.n), F(b.z, b.n))),
        ],
        ergebnis: F(b.z, b.n),
      };
    }
    return {
      frage: 'Schreibe als gemischte Zahl.',
      aufgabe: gl(F(b.z, b.n), '?'),
      art: 'bruch',
      loesung: b,
      form: 'gemischt',
      mussGekuerzt: true,
      hinweis: 'Teile den Zähler durch den Nenner. Das Ergebnis sind die Ganzen, der Rest ist der neue Zähler.',
      schritte: [
        S(`Teile den Zähler durch den Nenner: Wie oft passt ${b.n} in ${b.z}?`, `${b.z} : ${b.n} = ${b.ganze} Rest ${b.rest}`),
        S(
          `${b.ganze} sind die Ganzen. Der Rest ${b.rest} wird der neue Zähler, der Nenner ${b.n} bleibt.`,
          gl(F(b.z, b.n), G(b))
        ),
      ],
      ergebnis: G(b),
    };
  },

  vergleichen(stufe) {
    let a;
    let b;
    let hinweis = HINWEIS_HN;
    if (stufe === 'leicht') {
      if (Math.random() < 0.5) {
        const n = wahl([5, 6, 7, 8, 9, 10, 12]);
        const z1 = zufall(1, n - 1);
        let z2;
        do {
          z2 = zufall(1, n - 1);
        } while (z2 === z1);
        a = new Bruch(z1, n);
        b = new Bruch(z2, n);
        hinweis = 'Die Nenner sind gleich. Dann entscheidet der Zähler.';
      } else {
        const z = zufall(1, 4);
        const n1 = zufall(z + 1, 12);
        let n2;
        do {
          n2 = zufall(z + 1, 12);
        } while (n2 === n1);
        a = new Bruch(z, n1);
        b = new Bruch(z, n2);
        hinweis = 'Die Zähler sind gleich. Je größer der Nenner, desto kleiner sind die Teile.';
      }
    } else if (stufe === 'mittel') {
      do {
        [a, b] = zweiVerschiedeneNenner(NENNER.mittel);
      } while (a.gleich(b));
    } else if (Math.random() < 0.3) {
      a = echterBruch(NENNER.mittel);
      const k = zufall(2, 5);
      b = new Bruch(a.z * k, a.n * k);
      if (Math.random() < 0.5) [a, b] = [b, a];
    } else {
      do {
        [a, b] = zweiVerschiedeneNenner(NENNER.schwer);
      } while (a.gleich(b));
    }
    const weg = vergleichWeg(a, b);
    return {
      frage: 'Welches Zeichen gehört in die Lücke?',
      aufgabe: `${F(a.z, a.n)}<span class="luecke" aria-label="Lücke">?</span>${F(b.z, b.n)}`,
      art: 'vergleich',
      loesung: weg.loesung,
      werte: [a, b],
      fehlbild: () =>
        a.z === b.z && a.n !== b.n
          ? { text: 'Achtung: Ein größerer Nenner bedeutet kleinere Teile. Ein Fünftel ist kleiner als ein Drittel.', fehler: 'vergleich-falsch' }
          : null,
      hinweis,
      schritte: weg.schritte,
      ergebnis: weg.ergebnis,
    };
  },

  addieren(stufe) {
    return addSubAufgabe(stufe, '+');
  },

  subtrahieren(stufe) {
    return addSubAufgabe(stufe, '-');
  },

  multiplizieren(stufe) {
    let oa;
    let ob;
    if (stufe === 'leicht') {
      oa = opd(echterBruch(NENNER.leicht));
      ob = Math.random() < 0.5 ? opd(new Bruch(zufall(2, 9))) : opd(echterBruch([2, 3, 4, 5, 6]));
    } else if (stufe === 'mittel') {
      oa = opd(echterBruch(NENNER.mittel));
      ob = opd(echterBruch(NENNER.mittel));
    } else {
      const art = zufall(0, 2);
      oa = opd(gemischteZahl(3, [2, 3, 4, 5, 6, 8]), true);
      ob = art === 0 ? opd(echterBruch(NENNER.mittel)) : art === 1 ? opd(gemischteZahl(2, [2, 3, 4, 5]), true) : opd(new Bruch(zufall(2, 12)));
    }
    const weg = malWeg(oa.b, ob.b, umwandelnSchritte([oa, ob]));
    return rechenAufgabe(oa, ob, '*', weg, 'Multipliziere Zähler mit Zähler und Nenner mit Nenner. Gemischte Zahlen vorher umwandeln.');
  },

  dividieren(stufe) {
    let oa;
    let ob;
    if (stufe === 'leicht') {
      oa = opd(echterBruch(NENNER.leicht));
      ob = Math.random() < 0.5 ? opd(new Bruch(zufall(2, 6))) : opd(echterBruch([2, 3, 4, 5]));
    } else if (stufe === 'mittel') {
      oa = opd(echterBruch(NENNER.mittel));
      ob = opd(echterBruch(NENNER.mittel));
    } else {
      const art = zufall(0, 2);
      if (art === 0) {
        oa = opd(gemischteZahl(4, [2, 3, 4, 5, 6, 8]), true);
        ob = opd(echterBruch(NENNER.mittel));
      } else if (art === 1) {
        oa = opd(new Bruch(zufall(2, 9)));
        ob = opd(echterBruch(NENNER.mittel));
      } else {
        oa = opd(gemischteZahl(3, [2, 3, 4, 5, 6]), true);
        ob = opd(gemischteZahl(2, [2, 3, 4, 5]), true);
      }
    }
    const vorher = umwandelnSchritte([oa, ob]);
    const k = ob.b.kehrwert();
    vorher.push(
      S(
        'Teilen durch einen Bruch heißt: mit seinem Kehrwert malnehmen. Für den Kehrwert vertauschst du Zähler und Nenner.',
        gl(`${F(oa.b.z, oa.b.n)}${op(':')}${F(ob.b.z, ob.b.n)}`, `${F(oa.b.z, oa.b.n)}${op('*')}${F(k.z, k.n)}`)
      )
    );
    const weg = malWeg(oa.b, k, vorher);
    return rechenAufgabe(oa, ob, ':', weg, 'Multipliziere mit dem Kehrwert des zweiten Bruchs: Zähler und Nenner vertauschen, aus „:“ wird „·“.');
  },
};

function addSubAufgabe(stufe, zeichen) {
  let oa;
  let ob;
  do {
    if (stufe === 'leicht') {
      const n = wahl(NENNER.leicht);
      oa = opd(new Bruch(zufall(1, n - 1), n));
      ob = opd(new Bruch(zufall(1, n - 1), n));
    } else if (stufe === 'mittel') {
      const [a, b] = zweiVerschiedeneNenner(NENNER.mittel);
      oa = opd(a);
      ob = opd(b);
    } else if (Math.random() < 0.5) {
      oa = opd(gemischteZahl(4, [2, 3, 4, 5, 6, 8, 10, 12]), true);
      ob = Math.random() < 0.5 ? opd(gemischteZahl(2, [2, 3, 4, 5, 6, 8]), true) : opd(echterBruch(NENNER.mittel));
    } else {
      const [a, b] = zweiVerschiedeneNenner(NENNER.schwer);
      oa = opd(a);
      ob = opd(b);
    }
    if (zeichen === '-' && oa.b.vergleiche(ob.b) < 0) [oa, ob] = [ob, oa];
  } while (zeichen === '-' && oa.b.gleich(ob.b));
  const weg = addSubWeg(oa, ob, zeichen);
  const hinweis =
    oa.b.n === ob.b.n && !oa.gemischt && !ob.gemischt
      ? `Die Nenner sind gleich: ${zeichen === '+' ? 'Addiere' : 'Subtrahiere'} nur die Zähler und kürze am Ende.`
      : HINWEIS_HN + ' Gemischte Zahlen vorher in unechte Brüche umwandeln.';
  return rechenAufgabe(oa, ob, zeichen, weg, hinweis);
}

function rechenAufgabe(oa, ob, zeichen, weg, hinweis) {
  const frage = {
    '+': 'Addiere und kürze das Ergebnis.',
    '-': 'Subtrahiere und kürze das Ergebnis.',
    '*': 'Multipliziere und kürze das Ergebnis.',
    ':': 'Dividiere und kürze das Ergebnis.',
  }[zeichen];
  return {
    frage,
    aufgabe: `${zeige(oa)}${op(zeichen)}${zeige(ob)}`,
    art: 'bruch',
    loesung: weg.loesung,
    mussGekuerzt: true,
    rechnung: { a: oa.b, b: ob.b, zeichen },
    fehlbild: rechenFehlbild(oa.b, ob.b, zeichen),
    hinweis,
    schritte: weg.schritte,
    ergebnis: ergebnisHTML(weg.loesung),
  };
}


/** Erkennt typische Fehlvorstellungen bei Rechenaufgaben. */
function rechenFehlbild(a, b, zeichen) {
  return (x) => {
    if ((zeichen === '+' || zeichen === '-') && a.n !== b.n) {
      const zz = zeichen === '+' ? a.z + b.z : a.z - b.z;
      const nn = zeichen === '+' ? a.n + b.n : a.n - b.n;
      if (nn > 0 && zz >= 0 && x.gleich(new Bruch(zz, nn))) {
        return { text: 'Du hast die Nenner miteinander verrechnet. Die Nenner müssen zuerst gleich gemacht werden; dann rechnest du nur mit den Zählern.', fehler: 'nenner-addiert' };
      }
    }
    if (zeichen === ':' && x.gleich(a.kehrwert().mal(b))) {
      return { text: 'Du hast den Kehrwert vom ersten Bruch gebildet. Umgedreht wird nur der Bruch hinter dem Geteilt-Zeichen.', fehler: 'kehrwert-falsch' };
    }
    return null;
  };
}

const VERGLEICH_OPTIONEN = [
  { wert: '<', html: '&lt;', label: 'kleiner als' },
  { wert: '=', html: '=', label: 'gleich' },
  { wert: '>', html: '&gt;', label: 'größer als' },
];

/** Wandelt eine Aufgabe aus dem alten Format in das gemeinsame Aufgabenformat um. */
function umwandeln(alt) {
  const basis = {
    text: alt.frage,
    rechnung: alt.aufgabe,
    bild: alt.bild || '',
    loesung: alt.loesung,
    hinweis: alt.hinweis,
    fehlbild: alt.fehlbild,
    weg: alt.schritte,
    ergebnis: alt.ergebnis,
  };
  if (alt.art === 'vergleich') {
    return auswahlAufgabe({ ...basis, eingabe: { art: 'auswahl', optionen: VERGLEICH_OPTIONEN, gross: true }, fehlerArt: 'vergleich-falsch' });
  }
  return bruchAufgabe({
    ...basis,
    mussGekuerzt: alt.mussGekuerzt,
    form: alt.form,
    eingabe: { ohneGanze: !!(alt.ohneGanze || alt.nennerFest), nennerFest: alt.nennerFest },
  });
}

export const BRUCH_THEMEN = Object.keys(GEN);

/** Erzeugt eine Bruchaufgabe zu einem Thema und einer Stufe ('leicht' | 'mittel' | 'schwer'). */
export function bruchAufgabeErzeugen(thema, stufe) {
  return umwandeln(GEN[thema](stufe));
}
