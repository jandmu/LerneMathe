/**
 * Gerät und Speicher: Ist die App installiert? Ist der Speicher dauerhaft?
 *
 * Hintergrund: Safari (iPhone/iPad) löscht Daten von Webseiten, die etwa 7 Tage lang nicht
 * geöffnet wurden. Apps, die über „Zum Home-Bildschirm“ installiert wurden, sind davon ausgenommen.
 * Andere Browser löschen Daten bei Speichermangel, außer der Speicher wurde als dauerhaft markiert.
 */

export function istInstalliert() {
  try {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  } catch (e) {
    return false;
  }
}

export function istIOS() {
  const ua = navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function istMobil() {
  return istIOS() || /Android|Mobile/i.test(navigator.userAgent || '');
}

/** Bittet den Browser, die Daten nicht automatisch zu löschen. Gibt true/false/null (unbekannt) zurück. */
export async function speicherSichern() {
  try {
    if (!navigator.storage || !navigator.storage.persist) return null;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch (e) {
    return null;
  }
}

export async function speicherDauerhaft() {
  try {
    if (!navigator.storage || !navigator.storage.persisted) return null;
    return await navigator.storage.persisted();
  } catch (e) {
    return null;
  }
}

/** Anleitung zum Installieren, passend zum Gerät. */
export function installAnleitung() {
  if (istIOS()) {
    return 'In Safari unten auf das Teilen-Symbol (Quadrat mit Pfeil nach oben) tippen, dann „Zum Home-Bildschirm“ wählen. Danach die Mathewerkstatt immer über das neue Symbol öffnen.';
  }
  return 'Im Browser-Menü (⋮ oben rechts) „App installieren“ oder „Zum Startbildschirm hinzufügen“ wählen. Danach die Mathewerkstatt über das neue Symbol öffnen.';
}

/** Hat das Profil schon Lernstand (lohnt sich eine Sicherung)? */
export function hatLernstand(fortschritte) {
  return fortschritte.some((f) => f && f.ereignisse && f.ereignisse.length > 0);
}
