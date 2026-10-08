/**
 * Grafiken der Werkstatt-Projekte (einfache SVG-Zeichnungen, später austauschbar).
 * Jedes Projekt hat eine Grundszene und 10 Teile. Ein Teil liegt hinter oder vor dem Grundobjekt.
 * Die Szene hat einen eigenen Hintergrund und sieht deshalb im hellen und dunklen Modus gleich aus.
 */

const DUNKEL = '#1f2937';

function g(inhalt, klasse = '') {
  return `<g${klasse ? ` class="${klasse}"` : ''}>${inhalt}</g>`;
}

// ---------- Sportwagen ----------

const AUTO = {
  id: 'auto',
  name: 'Sportwagen',
  farben: ['#e63946', '#1d4ed8', '#16a34a', '#f59e0b', '#7c3aed', '#0f172a'],
  szene: () => `<rect width="320" height="200" fill="#dbeafe"/><rect y="150" width="320" height="50" fill="#4b5563"/>
    <path d="M0 176h320" stroke="#f9fafb" stroke-width="3" stroke-dasharray="18 14"/>`,
  grund: (c) => `<path d="M298 140 L280 113 Q268 101 242 99 L188 93 Q168 70 138 70 L103 72 Q83 78 70 100 L48 108 Q37 113 40 128 L42 140 Z" fill="${c}" stroke="${DUNKEL}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M178 94 Q162 77 138 77 L107 79 Q94 85 85 97 Z" fill="#bfdbfe" stroke="${DUNKEL}" stroke-width="2.5"/>
    <circle cx="96" cy="145" r="20" fill="#111827"/><circle cx="96" cy="145" r="8" fill="#9ca3af"/>
    <circle cx="250" cy="145" r="20" fill="#111827"/><circle cx="250" cy="145" r="8" fill="#9ca3af"/>`,
  teile: [
    { id: 'felgen', name: 'Sport\u00ADfelgen', vorne: true, svg: () => [96, 250].map((x) => `<circle cx="${x}" cy="145" r="13" fill="#e5e7eb"/>${[0, 72, 144, 216, 288].map((w) => `<line x1="${x}" y1="145" x2="${(x + 12 * Math.cos((w * Math.PI) / 180)).toFixed(1)}" y2="${(145 + 12 * Math.sin((w * Math.PI) / 180)).toFixed(1)}" stroke="#6b7280" stroke-width="3"/>`).join('')}<circle cx="${x}" cy="145" r="4" fill="#374151"/>`).join('') },
    { id: 'spoiler', name: 'Heckspoiler', vorne: true, svg: () => `<rect x="47" y="90" width="4" height="18" fill="${DUNKEL}"/><rect x="62" y="90" width="4" height="13" fill="${DUNKEL}"/><rect x="30" y="83" width="46" height="9" rx="3" fill="${DUNKEL}"/>` },
    { id: 'streifen', name: 'Renn\u00ADstreifen', vorne: true, svg: () => `<path d="M62 120 L292 113" stroke="#ffffff" stroke-width="5"/><path d="M60 129 L294 122" stroke="#ffffff" stroke-width="5"/>` },
    { id: 'scheinwerfer', name: 'Schein\u00ADwerfer', vorne: true, svg: () => `<path d="M296 112 L320 100 L320 136 Z" fill="#fde68a" opacity="0.7"/><ellipse cx="291" cy="116" rx="6" ry="4.5" fill="#fef9c3" stroke="${DUNKEL}" stroke-width="1.5"/>` },
    { id: 'auspuff', name: 'Doppel\u00ADauspuff', vorne: true, svg: () => `<rect x="28" y="130" width="16" height="5" rx="2" fill="#6b7280"/><rect x="28" y="137" width="16" height="5" rx="2" fill="#6b7280"/><path d="M28 131 Q14 128 6 134 Q14 140 28 141 Z" fill="#f97316"/><path d="M28 133 Q20 132 15 135 Q20 138 28 139 Z" fill="#fde047"/>` },
    { id: 'nummer', name: 'Start\u00ADnummer', vorne: true, svg: () => `<circle cx="150" cy="118" r="14" fill="#ffffff" stroke="${DUNKEL}" stroke-width="2"/><text x="150" y="124" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="17" fill="${DUNKEL}">1</text>` },
    { id: 'lufteinlass', name: 'Lufteinlass', vorne: true, svg: () => `<path d="M214 97 L228 89 L242 99 Z" fill="${DUNKEL}"/>` },
    { id: 'neon', name: 'Unterboden\u00ADlicht', vorne: false, svg: () => `<ellipse cx="170" cy="160" rx="132" ry="9" fill="#22d3ee" opacity="0.75"/>` },
    { id: 'flagge', name: 'Zielflagge', vorne: false, svg: () => `<rect x="296" y="24" width="4" height="126" fill="#6b7280"/>${[0, 1, 2, 3].map((r) => [0, 1, 2].map((s) => `<rect x="${300 + s * 6}" y="${24 + r * 6}" width="6" height="6" fill="${(r + s) % 2 ? '#ffffff' : '#111827'}"/>`).join('')).join('')}` },
    { id: 'fahrer', name: 'Rennfahrer', vorne: true, svg: () => `<circle cx="132" cy="88" r="9" fill="#fde68a" stroke="${DUNKEL}" stroke-width="1.5"/><path d="M123 86 A9 9 0 0 1 141 86 Z" fill="#ef4444"/><circle cx="136" cy="89" r="1.5" fill="${DUNKEL}"/>` },
  ],
};

// ---------- Rakete ----------

const STERNE = [[30, 30], [80, 20], [250, 25], [290, 70], [40, 110], [230, 150], [120, 40], [200, 15], [300, 140], [20, 160]];

const RAKETE = {
  id: 'rakete',
  name: 'Rakete',
  farben: ['#e5e7eb', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7'],
  szene: () => `<rect width="320" height="200" fill="#1e1b4b"/>${STERNE.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#ffffff"/>`).join('')}
    <rect y="182" width="320" height="18" fill="#4b5563"/>`,
  grund: (c) => `<path d="M130 135 L110 172 L132 166 Z" fill="#f87171" stroke="${DUNKEL}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M190 135 L210 172 L188 166 Z" fill="#f87171" stroke="${DUNKEL}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M160 18 Q192 48 192 100 L192 168 L128 168 L128 100 Q128 48 160 18 Z" fill="${c}" stroke="${DUNKEL}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="160" cy="80" r="15" fill="#bfdbfe" stroke="${DUNKEL}" stroke-width="3"/>
    <rect x="144" y="168" width="32" height="10" fill="#6b7280" stroke="${DUNKEL}" stroke-width="2"/>`,
  teile: [
    { id: 'flammen', name: 'Triebwerk', vorne: false, svg: () => `<path d="M144 176 Q160 210 176 176 Z" fill="#f97316"/><path d="M151 176 Q160 198 169 176 Z" fill="#fde047"/>` },
    { id: 'astronaut', name: 'Astronaut', vorne: true, svg: () => `<circle cx="160" cy="82" r="9" fill="#fde68a"/><circle cx="157" cy="80" r="1.5" fill="${DUNKEL}"/><circle cx="163" cy="80" r="1.5" fill="${DUNKEL}"/><path d="M156 85 Q160 88 164 85" stroke="${DUNKEL}" stroke-width="1.5" fill="none"/>` },
    { id: 'flossen', name: 'Große Flossen', vorne: false, svg: () => `<path d="M130 112 L96 176 L130 166 Z" fill="#fbbf24" stroke="${DUNKEL}" stroke-width="2.5" stroke-linejoin="round"/><path d="M190 112 L224 176 L190 166 Z" fill="#fbbf24" stroke="${DUNKEL}" stroke-width="2.5" stroke-linejoin="round"/>` },
    { id: 'streifen', name: 'Streifen', vorne: true, svg: () => `<rect x="129" y="118" width="62" height="8" fill="#ef4444"/><rect x="129" y="130" width="62" height="4" fill="#ef4444"/>` },
    { id: 'antenne', name: 'Antenne', vorne: true, svg: () => `<line x1="160" y1="20" x2="160" y2="5" stroke="${DUNKEL}" stroke-width="2.5"/><line x1="160" y1="20" x2="160" y2="5" stroke="#d1d5db" stroke-width="1.5"/><circle cx="160" cy="5" r="3.5" fill="#ef4444"/>` },
    { id: 'mond', name: 'Mond', vorne: false, svg: () => `<circle cx="60" cy="55" r="24" fill="#fef3c7"/><circle cx="52" cy="48" r="5" fill="#fde68a"/><circle cx="68" cy="62" r="4" fill="#fde68a"/><circle cx="62" cy="45" r="2.5" fill="#fde68a"/>` },
    { id: 'satellit', name: 'Satellit', vorne: false, svg: () => `<rect x="250" y="34" width="20" height="14" fill="#d1d5db" stroke="${DUNKEL}" stroke-width="1.5"/><rect x="228" y="37" width="20" height="8" fill="#3b82f6"/><rect x="272" y="37" width="20" height="8" fill="#3b82f6"/><line x1="260" y1="34" x2="260" y2="26" stroke="#d1d5db" stroke-width="2"/>` },
    { id: 'planet', name: 'Ringplanet', vorne: false, svg: () => `<circle cx="268" cy="125" r="20" fill="#7dd3fc"/><ellipse cx="268" cy="125" rx="34" ry="8" fill="none" stroke="#fcd34d" stroke-width="4"/>` },
    { id: 'booster', name: 'Seiten\u00ADbooster', vorne: false, svg: () => `<rect x="110" y="92" width="16" height="74" rx="8" fill="#f3f4f6" stroke="${DUNKEL}" stroke-width="2"/><rect x="194" y="92" width="16" height="74" rx="8" fill="#f3f4f6" stroke="${DUNKEL}" stroke-width="2"/>` },
    { id: 'komet', name: 'Komet', vorne: false, svg: () => `<path d="M30 150 L80 132" stroke="#93c5fd" stroke-width="6" stroke-linecap="round" opacity="0.6"/><circle cx="84" cy="130" r="7" fill="#e0f2fe"/>` },
  ],
};

// ---------- Baumhaus ----------

const BAUMHAUS = {
  id: 'baumhaus',
  name: 'Baumhaus',
  farben: ['#f59e0b', '#ef4444', '#3b82f6', '#a855f7', '#10b981', '#f472b6'],
  szene: () => `<rect width="320" height="200" fill="#e0f2fe"/><rect y="172" width="320" height="28" fill="#86c26b"/>`,
  grund: (c) => `<circle cx="125" cy="60" r="48" fill="#4caf50"/><circle cx="200" cy="55" r="52" fill="#43a047"/><circle cx="165" cy="35" r="40" fill="#4caf50"/>
    <rect x="152" y="92" width="28" height="82" fill="#8b5a2b"/>
    <rect x="98" y="112" width="136" height="8" fill="#a0522d"/>
    <rect x="112" y="72" width="88" height="40" fill="${c}" stroke="${DUNKEL}" stroke-width="2.5"/>
    <rect x="150" y="86" width="16" height="26" fill="#6d4c41"/>
    <line x1="118" y1="120" x2="118" y2="174" stroke="#8b5a2b" stroke-width="4"/><line x1="134" y1="120" x2="134" y2="174" stroke="#8b5a2b" stroke-width="4"/>
    ${[130, 142, 154, 166].map((y) => `<line x1="118" y1="${y}" x2="134" y2="${y}" stroke="#8b5a2b" stroke-width="3"/>`).join('')}`,
  teile: [
    { id: 'dach', name: 'Dach', vorne: true, svg: () => `<path d="M104 74 L156 40 L208 74 Z" fill="#dc2626" stroke="${DUNKEL}" stroke-width="2.5" stroke-linejoin="round"/>` },
    { id: 'fenster', name: 'Fenster mit Blumen', vorne: true, svg: () => `<rect x="122" y="80" width="20" height="16" fill="#bfdbfe" stroke="${DUNKEL}" stroke-width="2"/><line x1="132" y1="80" x2="132" y2="96" stroke="${DUNKEL}" stroke-width="1.5"/><rect x="120" y="96" width="24" height="5" fill="#8b5a2b"/><circle cx="125" cy="95" r="2.5" fill="#ef4444"/><circle cx="132" cy="94" r="2.5" fill="#f472b6"/><circle cx="139" cy="95" r="2.5" fill="#fbbf24"/>` },
    { id: 'schaukel', name: 'Schaukel', vorne: true, svg: () => `<line x1="236" y1="96" x2="228" y2="150" stroke="#78350f" stroke-width="2"/><line x1="252" y1="96" x2="256" y2="150" stroke="#78350f" stroke-width="2"/><rect x="224" y="149" width="36" height="6" rx="2" fill="#b45309"/>` },
    { id: 'rutsche', name: 'Rutsche', vorne: true, svg: () => `<path d="M232 116 Q262 130 292 172" stroke="#facc15" stroke-width="9" fill="none" stroke-linecap="round"/>` },
    { id: 'fahne', name: 'Fahne', vorne: true, svg: () => `<line x1="156" y1="42" x2="156" y2="14" stroke="${DUNKEL}" stroke-width="2.5"/><path d="M157 14 L180 20 L157 27 Z" fill="#3b82f6"/>` },
    { id: 'lichterkette', name: 'Lichter\u00ADkette', vorne: true, svg: () => `<path d="M100 121 Q166 132 232 121" stroke="${DUNKEL}" stroke-width="1" fill="none"/>${[106, 122, 138, 154, 170, 186, 202, 218].map((x, i) => `<circle cx="${x}" cy="${124 + Math.sin((i / 7) * Math.PI) * 4}" r="3" fill="${['#ef4444', '#fbbf24', '#22c55e', '#3b82f6'][i % 4]}"/>`).join('')}` },
    { id: 'vogelhaus', name: 'Vogelhaus', vorne: true, svg: () => `<rect x="76" y="70" width="18" height="16" fill="#fcd34d" stroke="${DUNKEL}" stroke-width="1.5"/><path d="M73 71 L85 60 L97 71 Z" fill="#b91c1c"/><circle cx="85" cy="78" r="3" fill="${DUNKEL}"/><circle cx="100" cy="64" r="4" fill="#60a5fa"/><path d="M103 63 L107 64 L103 66 Z" fill="#f59e0b"/>` },
    { id: 'fernrohr', name: 'Fernrohr', vorne: true, svg: () => `<line x1="104" y1="112" x2="110" y2="100" stroke="${DUNKEL}" stroke-width="2"/><rect x="96" y="92" width="22" height="7" rx="2" fill="#6b7280" transform="rotate(-25 107 95)"/>` },
    { id: 'sonne', name: 'Sonne', vorne: false, svg: () => `<circle cx="38" cy="38" r="16" fill="#fcd34d"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((w) => { const r = (w * Math.PI) / 180; return `<line x1="${(38 + 20 * Math.cos(r)).toFixed(1)}" y1="${(38 + 20 * Math.sin(r)).toFixed(1)}" x2="${(38 + 28 * Math.cos(r)).toFixed(1)}" y2="${(38 + 28 * Math.sin(r)).toFixed(1)}" stroke="#fcd34d" stroke-width="3" stroke-linecap="round"/>`; }).join('')}` },
    { id: 'blumen', name: 'Blumen\u00ADwiese', vorne: true, svg: () => [20, 48, 76, 205, 300].map((x, i) => `<line x1="${x}" y1="190" x2="${x}" y2="178" stroke="#166534" stroke-width="2"/><circle cx="${x}" cy="176" r="5" fill="${['#f472b6', '#fbbf24', '#ef4444', '#a78bfa', '#fb923c'][i]}"/><circle cx="${x}" cy="176" r="2" fill="#fef3c7"/>`).join('') },
  ],
};

// ---------- Tierpark ----------

const TIERPARK = {
  id: 'tierpark',
  name: 'Tierpark',
  farben: ['#16a34a', '#2563eb', '#dc2626', '#d97706', '#7c3aed', '#0891b2'],
  szene: () => `<rect width="320" height="200" fill="#e0f2fe"/><rect y="120" width="320" height="80" fill="#a3d977"/>`,
  grund: (c) => `<path d="M0 132 H320" stroke="#a16207" stroke-width="3"/><path d="M0 120 H320" stroke="#a16207" stroke-width="3"/>
    ${Array.from({ length: 17 }, (_, i) => `<rect x="${i * 20 + 2}" y="114" width="5" height="24" fill="#a16207"/>`).join('')}
    <rect x="118" y="44" width="6" height="70" fill="#78350f"/><rect x="196" y="44" width="6" height="70" fill="#78350f"/>
    <rect x="104" y="18" width="112" height="34" rx="8" fill="${c}" stroke="${DUNKEL}" stroke-width="2.5"/>
    <text x="160" y="41" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="16" fill="#ffffff">Tierpark</text>`,
  teile: [
    { id: 'giraffe', name: 'Giraffe', vorne: true, svg: () => `<rect x="34" y="150" width="5" height="26" fill="#d97706"/><rect x="56" y="150" width="5" height="26" fill="#d97706"/><ellipse cx="48" cy="148" rx="20" ry="11" fill="#f4a261"/><rect x="56" y="88" width="9" height="56" fill="#f4a261" transform="rotate(10 60 116)"/><ellipse cx="70" cy="86" rx="10" ry="6" fill="#f4a261"/><circle cx="73" cy="84" r="1.5" fill="${DUNKEL}"/><circle cx="42" cy="146" r="3" fill="#8d5524"/><circle cx="52" cy="150" r="3" fill="#8d5524"/><circle cx="61" cy="118" r="2.5" fill="#8d5524"/>` },
    { id: 'elefant', name: 'Elefant', vorne: true, svg: () => `<rect x="226" y="160" width="9" height="18" fill="#9ca3af"/><rect x="254" y="160" width="9" height="18" fill="#9ca3af"/><ellipse cx="246" cy="152" rx="28" ry="18" fill="#9ca3af"/><circle cx="276" cy="144" r="13" fill="#9ca3af"/><ellipse cx="270" cy="144" rx="7" ry="10" fill="#d1d5db"/><path d="M286 148 Q292 162 286 172" stroke="#9ca3af" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="281" cy="140" r="1.5" fill="${DUNKEL}"/>` },
    { id: 'loewe', name: 'Löwe', vorne: true, svg: () => `<ellipse cx="102" cy="172" rx="18" ry="10" fill="#f59e0b"/><circle cx="90" cy="160" r="14" fill="#b45309"/><circle cx="90" cy="160" r="9" fill="#fbbf24"/><circle cx="87" cy="158" r="1.3" fill="${DUNKEL}"/><circle cx="93" cy="158" r="1.3" fill="${DUNKEL}"/><path d="M118 168 Q126 160 124 154" stroke="#f59e0b" stroke-width="2.5" fill="none"/>` },
    { id: 'pinguin', name: 'Pinguin', vorne: true, svg: () => `<ellipse cx="140" cy="166" rx="10" ry="15" fill="#111827"/><ellipse cx="140" cy="169" rx="6" ry="11" fill="#f9fafb"/><circle cx="140" cy="150" r="7" fill="#111827"/><path d="M140 151 L146 153 L140 155 Z" fill="#f59e0b"/><circle cx="142" cy="148" r="1.2" fill="#ffffff"/>` },
    { id: 'affe', name: 'Affe', vorne: true, svg: () => `<path d="M290 96 Q284 104 288 112" stroke="#92400e" stroke-width="3" fill="none"/><ellipse cx="288" cy="120" rx="8" ry="10" fill="#92400e"/><circle cx="288" cy="106" r="7" fill="#92400e"/><circle cx="288" cy="107" r="4.5" fill="#fcd9b6"/><circle cx="286.5" cy="106" r="1" fill="${DUNKEL}"/><circle cx="289.5" cy="106" r="1" fill="${DUNKEL}"/>` },
    { id: 'baum', name: 'Baum', vorne: false, svg: () => `<rect x="292" y="96" width="10" height="44" fill="#78350f"/><circle cx="297" cy="80" r="24" fill="#22c55e"/><path d="M297 96 L282 96" stroke="#78350f" stroke-width="4"/>` },
    { id: 'teich', name: 'Teich', vorne: false, svg: () => `<ellipse cx="190" cy="182" rx="44" ry="11" fill="#38bdf8"/><ellipse cx="180" cy="180" rx="12" ry="2" fill="#bae6fd"/>` },
    { id: 'flamingo', name: 'Flamingo', vorne: true, svg: () => `<line x1="204" y1="160" x2="204" y2="182" stroke="#f472b6" stroke-width="2"/><ellipse cx="204" cy="155" rx="10" ry="6" fill="#f9a8d4"/><path d="M212 153 Q218 140 212 132" stroke="#f9a8d4" stroke-width="3" fill="none"/><circle cx="212" cy="131" r="4" fill="#f9a8d4"/><path d="M215 131 L220 134 L215 134 Z" fill="${DUNKEL}"/>` },
    { id: 'schildkroete', name: 'Schild\u00ADkröte', vorne: true, svg: () => `<ellipse cx="56" cy="188" rx="14" ry="7" fill="#15803d"/><circle cx="72" cy="188" r="4" fill="#84cc16"/><path d="M48 186 L64 186" stroke="#166534" stroke-width="1.5"/>` },
    { id: 'sonne', name: 'Sonne', vorne: false, svg: () => `<circle cx="34" cy="34" r="17" fill="#fcd34d"/><circle cx="34" cy="34" r="24" fill="#fcd34d" opacity="0.3"/>` },
  ],
};

export const PROJEKT_GRAFIK = { auto: AUTO, rakete: RAKETE, baumhaus: BAUMHAUS, tierpark: TIERPARK };

/**
 * Zeichnet ein Projekt mit den eingebauten Teilen.
 * neu: ID eines gerade eingebauten Teils (wird hervorgehoben).
 */
export function projektBild(projekt, { farbe = 0, teile = [], neu = null, vorschau = null, klein = false } = {}) {
  const p = PROJEKT_GRAFIK[projekt];
  if (!p) return '';
  const c = p.farben[farbe] || p.farben[0];
  const sichtbar = vorschau && !teile.includes(vorschau) ? teile.concat(vorschau) : teile;
  const ebene = (vorne) =>
    p.teile
      .filter((t) => t.vorne === vorne && sichtbar.includes(t.id))
      .map((t) => g(t.svg(c), `teil${t.id === neu ? ' neu' : ''}${t.id === vorschau && !teile.includes(t.id) ? ' vorschau' : ''}`))
      .join('');
  const label = `${p.name} mit ${teile.length} von ${p.teile.length} Teilen`;
  return `<svg class="projekt-svg${klein ? ' klein' : ''}" viewBox="0 0 320 200" role="img" aria-label="${label}">
    ${p.szene()}${ebene(false)}${p.grund(c)}${ebene(true)}
  </svg>`;
}
