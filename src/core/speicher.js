/**
 * Datenhaltung.
 *
 * Die App spricht nur mit `Datenbank`. Wo die Daten liegen, entscheidet das Backend:
 *   - LokalesBackend: localStorage im Browser (heute)
 *   - SpeicherBackend: im Arbeitsspeicher (Tests, private Fenster)
 *   - später z. B. ein ServerBackend mit derselben Schnittstelle (lesen/schreiben/loeschen/schluessel)
 *
 * Alle Methoden sind asynchron, damit ein Server-Backend ohne Umbau der App eingesetzt werden kann.
 *
 * Datenmodell (Schema-Version 1):
 *   profile               → [{ id, name, klasse, farbe, vorlesen, erstellt }]
 *   fortschritt:<id>      → { schema, skills: { <skillId>: Zustand }, ereignisse: [Ereignis] }
 * Ereignisse sind ein Protokoll einzelner Antworten. Sie lassen sich später zu einem Server
 * übertragen und erlauben Auswertungen, ohne dass der verdichtete Zustand neu erfunden werden muss.
 */

export const SCHEMA = 1;
export const MAX_EREIGNISSE = 1500;

export class SpeicherBackend {
  constructor() {
    this.daten = new Map();
  }
  async lesen(schluessel) {
    return this.daten.has(schluessel) ? structuredClone(this.daten.get(schluessel)) : null;
  }
  async schreiben(schluessel, wert) {
    this.daten.set(schluessel, structuredClone(wert));
  }
  async loeschen(schluessel) {
    this.daten.delete(schluessel);
  }
  async schluessel() {
    return [...this.daten.keys()];
  }
}

export class LokalesBackend {
  constructor(praefix = 'mathewerkstatt') {
    this.praefix = praefix + ':';
    this.notfall = new SpeicherBackend();
    this.verfuegbar = LokalesBackend.pruefen();
  }

  static pruefen() {
    try {
      const k = '__test__';
      localStorage.setItem(k, '1');
      localStorage.removeItem(k);
      return true;
    } catch (e) {
      return false;
    }
  }

  async lesen(schluessel) {
    if (!this.verfuegbar) return this.notfall.lesen(schluessel);
    try {
      const roh = localStorage.getItem(this.praefix + schluessel);
      return roh == null ? null : JSON.parse(roh);
    } catch (e) {
      return null;
    }
  }

  async schreiben(schluessel, wert) {
    if (!this.verfuegbar) return this.notfall.schreiben(schluessel, wert);
    try {
      localStorage.setItem(this.praefix + schluessel, JSON.stringify(wert));
    } catch (e) {
      // Speicher voll oder gesperrt: im Arbeitsspeicher weitermachen, damit die App nutzbar bleibt.
      this.verfuegbar = false;
      await this.notfall.schreiben(schluessel, wert);
    }
  }

  async loeschen(schluessel) {
    if (!this.verfuegbar) return this.notfall.loeschen(schluessel);
    try {
      localStorage.removeItem(this.praefix + schluessel);
    } catch (e) {
      /* ignorieren */
    }
  }

  async schluessel() {
    if (!this.verfuegbar) return this.notfall.schluessel();
    const s = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(this.praefix)) s.push(k.slice(this.praefix.length));
    }
    return s;
  }
}

export function leererFortschritt() {
  return { schema: SCHEMA, skills: {}, ereignisse: [] };
}

export class Datenbank {
  constructor(backend) {
    this.backend = backend;
  }

  async profile() {
    return (await this.backend.lesen('profile')) || [];
  }

  async profil(id) {
    return (await this.profile()).find((p) => p.id === id) || null;
  }

  async profilSpeichern(profil) {
    const liste = await this.profile();
    const i = liste.findIndex((p) => p.id === profil.id);
    if (i >= 0) liste[i] = profil;
    else liste.push(profil);
    await this.backend.schreiben('profile', liste);
    return profil;
  }

  async profilLoeschen(id) {
    const liste = (await this.profile()).filter((p) => p.id !== id);
    await this.backend.schreiben('profile', liste);
    await this.backend.loeschen('fortschritt:' + id);
  }

  async fortschritt(id) {
    const f = await this.backend.lesen('fortschritt:' + id);
    return migrieren(f);
  }

  async fortschrittSpeichern(id, f) {
    if (f.ereignisse.length > MAX_EREIGNISSE) f.ereignisse = f.ereignisse.slice(-MAX_EREIGNISSE);
    await this.backend.schreiben('fortschritt:' + id, f);
  }

  /** Alle Daten als ein Objekt, z. B. zum Sichern oder Umziehen auf ein anderes Gerät. */
  async exportieren() {
    const profile = await this.profile();
    const fortschritt = {};
    for (const p of profile) fortschritt[p.id] = await this.fortschritt(p.id);
    return { app: 'mathewerkstatt', schema: SCHEMA, exportiert: new Date().toISOString(), profile, fortschritt };
  }

  async importieren(daten) {
    if (!daten || daten.app !== 'mathewerkstatt' || !Array.isArray(daten.profile)) {
      throw new Error('Die Datei ist keine Sicherung der Mathewerkstatt.');
    }
    for (const p of daten.profile) {
      await this.profilSpeichern(p);
      await this.fortschrittSpeichern(p.id, migrieren(daten.fortschritt && daten.fortschritt[p.id]));
    }
  }
}

/** Bringt ältere Datenstände auf das aktuelle Schema. */
export function migrieren(f) {
  if (!f || typeof f !== 'object') return leererFortschritt();
  if (!f.schema) f.schema = SCHEMA;
  f.skills = f.skills || {};
  f.ereignisse = f.ereignisse || [];
  return f;
}
