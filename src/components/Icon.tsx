import { memo } from 'react'

/**
 * Hand-drawn 24px icon set standing in for SF Symbols. Names match the SF Symbol names used by the
 * native app (and the shared content), so data like `symbol: "figure.flexibility"` just works.
 * Markup is static and authored here; `.f` marks filled shapes.
 */

function gearPath(): string {
  const cx = 12, cy = 12, teeth = 8, outer = 9.6, inner = 7.2
  let d = ''
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a0 = (Math.PI * 2 * (i - 0.28)) / (teeth * 2)
    const a1 = (Math.PI * 2 * (i + 0.28)) / (teeth * 2)
    d += `${i === 0 ? 'M' : 'L'}${(cx + r * Math.cos(a0)).toFixed(2)} ${(cy + r * Math.sin(a0)).toFixed(2)}L${(cx + r * Math.cos(a1)).toFixed(2)} ${(cy + r * Math.sin(a1)).toFixed(2)}`
  }
  return d + 'Z'
}

function sealPath(): string {
  const points = 24
  let d = ''
  for (let i = 0; i <= points; i++) {
    const a = (Math.PI * 2 * i) / points
    const r = i % 2 === 0 ? 9.6 : 8.2
    d += `${i === 0 ? 'M' : 'L'}${(12 + r * Math.cos(a)).toFixed(2)} ${(12 + r * Math.sin(a)).toFixed(2)}`
  }
  return d + 'Z'
}

const head = (x: number, y: number, r = 2.1) => `<circle class="f" cx="${x}" cy="${y}" r="${r}"/>`

const BASE: Record<string, string> = {
  // Navigation & actions
  house: '<path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>',
  'house.fill': '<path class="f" d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  'plus.circle.fill': '<circle class="f" cx="12" cy="12" r="10"/><path class="knock" d="M12 7.5v9M7.5 12h9"/>',
  xmark: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  'xmark.circle.fill': '<circle class="f" cx="12" cy="12" r="10"/><path class="knock" d="M8.8 8.8l6.4 6.4M15.2 8.8l-6.4 6.4"/>',
  'chevron.left': '<path d="M15 5l-7 7 7 7"/>',
  'chevron.right': '<path d="M9 5l7 7-7 7"/>',
  'chevron.up': '<path d="M5 15l7-7 7 7"/>',
  'chevron.down': '<path d="M5 9l7 7 7-7"/>',
  'chevron.up.chevron.down': '<path d="M8 9.5l4-4 4 4M8 14.5l4 4 4-4"/>',
  'arrow.up': '<path d="M12 20V4M5 11l7-7 7 7"/>',
  'arrow.down': '<path d="M12 4v16M5 13l7 7 7-7"/>',
  'play.fill': '<path class="f" d="M7.5 4.8v14.4a1 1 0 0 0 1.5.86l12-7.2a1 1 0 0 0 0-1.72L9 3.94a1 1 0 0 0-1.5.86z"/>',
  'pause.fill': '<rect class="f" x="5.5" y="4" width="4.5" height="16" rx="1.4"/><rect class="f" x="14" y="4" width="4.5" height="16" rx="1.4"/>',
  'stop.fill': '<rect class="f" x="5.5" y="5.5" width="13" height="13" rx="2.5"/>',
  'backward.end.fill': '<path d="M5.5 5v14"/><path class="f" d="M19.5 5.7v12.6a1 1 0 0 1-1.6.8L9.2 12.8a1 1 0 0 1 0-1.6l8.7-6.3a1 1 0 0 1 1.6.8z"/>',
  'forward.end.fill': '<path d="M18.5 5v14"/><path class="f" d="M4.5 5.7v12.6a1 1 0 0 0 1.6.8l8.7-6.3a1 1 0 0 0 0-1.6L6.1 4.9a1 1 0 0 0-1.6.8z"/>',
  magnifyingglass: '<circle cx="11" cy="11" r="6.8"/><path d="M20 20l-4.2-4.2"/>',
  ellipsis: '<circle class="f" cx="5.5" cy="12" r="1.8"/><circle class="f" cx="12" cy="12" r="1.8"/><circle class="f" cx="18.5" cy="12" r="1.8"/>',
  checkmark: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  'checkmark.circle': '<circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.7 2.7L16 9.5"/>',
  'checkmark.circle.fill': '<circle class="f" cx="12" cy="12" r="10"/><path class="knock" d="M7.8 12.3l2.9 2.9 5.6-5.9"/>',
  circle: '<circle cx="12" cy="12" r="9"/>',
  'circle.circle': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>',
  'info.circle': '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8v.01"/>',
  questionmark: '<path d="M8.8 8.8a3.3 3.3 0 1 1 4.9 2.9c-1.1.6-1.7 1.3-1.7 2.6M12 18.2v.01"/>',
  'questionmark.circle.fill': '<circle class="f" cx="12" cy="12" r="10"/><path class="knock" d="M9.4 9.4a2.7 2.7 0 1 1 4 2.4c-.9.5-1.4 1.1-1.4 2.1M12 17.3v.01"/>',
  'exclamationmark.circle': '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.4v.01"/>',
  pencil: '<path d="M4 20l1.2-4.4L16.4 4.4a2.1 2.1 0 0 1 3 3L8.3 18.8z"/><path d="M14.4 6.4l3.2 3.2"/>',
  trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5"/>',
  'plus.square.on.square': '<rect x="8" y="8" width="12.5" height="12.5" rx="2.5"/><path d="M16 8V5.5A2 2 0 0 0 14 3.5H5.5a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2H8M14.25 11.5v5.5M11.5 14.25H17"/>',
  'slider.horizontal.3': '<path d="M4 6.5h8M16 6.5h4M4 12h3M11 12h9M4 17.5h10M18 17.5h2"/><circle cx="14" cy="6.5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="16" cy="17.5" r="2"/>',
  'square.and.arrow.down': '<path d="M12 3.5v11M7.8 10.5 12 14.7l4.2-4.2M5 14v5a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-5"/>',
  'square.and.arrow.up': '<path d="M12 15.5v-11M16.2 8.5 12 4.3l-4.2 4.2M5 14v5a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-5"/>',
  'arrow.clockwise': '<path d="M20.5 8A9 9 0 1 0 21 12M21 4.5V8.5H17"/>',
  'arrow.up.right': '<path d="M7 17 17 7M9 7h8v8"/>',
  'arrow.left.and.right': '<path d="M3.5 12h17M7.5 8l-4 4 4 4M16.5 8l4 4-4 4"/>',
  'arrow.left.arrow.right': '<path d="M4 8h15M15 4l4 4-4 4M20 16H5M9 12l-4 4 4 4"/>',
  'arrow.triangle.2.circlepath': '<path d="M19.5 10.5a7.8 7.8 0 0 0-13.8-3.8M4.5 13.5a7.8 7.8 0 0 0 13.8 3.8M5.2 3.5v3.7h3.7M18.8 20.5v-3.7h-3.7"/>',
  'dice.fill': '<rect class="f" x="3.5" y="3.5" width="17" height="17" rx="4"/><circle class="knock-fill" cx="8" cy="8" r="1.3"/><circle class="knock-fill" cx="16" cy="8" r="1.3"/><circle class="knock-fill" cx="12" cy="12" r="1.3"/><circle class="knock-fill" cx="8" cy="16" r="1.3"/><circle class="knock-fill" cx="16" cy="16" r="1.3"/>',
  'rectangle.portrait.and.arrow.right': '<path d="M13.5 4H6a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 6 20h7.5M10.5 12H21M17.5 8.5 21 12l-3.5 3.5"/>',
  // Tabs
  'figure.martial.arts': `${head(8.2, 4.3)}<path d="M8.8 7.4 10.4 14M9.1 9.6l4.3-1.4 1.4-2.8M9.1 9.6 5.4 11.4M10.4 14l-2.2 7M10.4 14l5.2-2.2 5.2-3.3"/>`,
  'chart.bar.xaxis': '<path d="M4 20.5h16M7 16.5v-5M12 16.5v-10M17 16.5V9"/>',
  'books.vertical.fill': '<rect class="f" x="3.5" y="4" width="4.2" height="16.5" rx="1"/><rect class="f" x="9" y="6.5" width="4.2" height="14" rx="1"/><path class="f" d="M14.6 6.7l3.4-.9 3.6 13.6-3.4.9z"/>',
  'gearshape.fill': `<path class="f" d="${gearPath()}"/><circle class="knock-fill" cx="12" cy="12" r="3"/>`,
  // Symbols
  flame: '<path d="M12 21.5c3.9 0 6.8-2.7 6.8-6.6 0-3.5-2.5-5.8-3.9-8-.6 1.7-1.6 2.7-2.7 3.1.4-3.3-1-6.4-3.6-8 .3 2.9-1.4 5-2.9 7-1.1 1.4-2.5 3.4-2.5 5.9 0 3.9 2.9 6.6 6.8 6.6z"/>',
  'flame.fill': '<path class="f" d="M12 21.5c3.9 0 6.8-2.7 6.8-6.6 0-3.5-2.5-5.8-3.9-8-.6 1.7-1.6 2.7-2.7 3.1.4-3.3-1-6.4-3.6-8 .3 2.9-1.4 5-2.9 7-1.1 1.4-2.5 3.4-2.5 5.9 0 3.9 2.9 6.6 6.8 6.6z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
  'clock.fill': '<circle class="f" cx="12" cy="12" r="10"/><path class="knock" d="M12 7v5l3.2 2"/>',
  timer: '<circle cx="12" cy="13.2" r="7.8"/><path d="M12 9.2v4l2.6 2.4M9.5 2.8h5"/>',
  'list.bullet': '<path d="M9 6h11M9 12h11M9 18h11"/><circle class="f" cx="4.6" cy="6" r="1.4"/><circle class="f" cx="4.6" cy="12" r="1.4"/><circle class="f" cx="4.6" cy="18" r="1.4"/>',
  'square.stack.3d.up.fill': '<rect class="f" x="5.5" y="3" width="13" height="8" rx="2"/><rect class="f" opacity="0.55" x="3.5" y="12.2" width="17" height="3.4" rx="1.7"/><rect class="f" opacity="0.3" x="3.5" y="17.4" width="17" height="3.4" rx="1.7"/>',
  sparkles: '<path class="f" d="M11 3.5l1.7 4.8 4.8 1.7-4.8 1.7L11 16.5l-1.7-4.8L4.5 10l4.8-1.7z"/><path class="f" d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
  'seal.fill': `<path class="f" d="${sealPath()}"/>`,
  'checkmark.seal': `<path d="${sealPath()}"/><path d="M8.4 12.2l2.5 2.5 4.8-5"/>`,
  'checkmark.seal.fill': `<path class="f" d="${sealPath()}"/><path class="knock" d="M8.4 12.2l2.5 2.5 4.8-5"/>`,
  'crown.fill': '<path class="f" d="M3.5 8.2 8 12l4-6.5 4 6.5 4.5-3.8L19 18.5H5z"/><rect class="f" x="5" y="19.3" width="14" height="1.9" rx=".9"/>',
  'trophy.fill': '<path class="f" d="M7.5 3.5h9v5.2a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 5.5H4.8a3.2 3.2 0 0 0 3.4 4.2M16.5 5.5h2.7a3.2 3.2 0 0 1-3.4 4.2M12 13.2v3.8M8.8 20.5h6.4M10 17h4"/>',
  'heart.fill': '<path class="f" d="M12 20.5s-8.2-4.9-8.2-10.7A4.6 4.6 0 0 1 12 7.1a4.6 4.6 0 0 1 8.2 2.7c0 5.8-8.2 10.7-8.2 10.7z"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  'pause.circle': '<circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>',
  'pause.circle.fill': '<circle class="f" cx="12" cy="12" r="10"/><path class="knock" d="M10 8.8v6.4M14 8.8v6.4"/>',
  'leaf.fill': '<path class="f" d="M4.5 19.5C4.5 11 9.8 4.7 20.5 3.5 19.5 14 13 19.5 4.5 19.5z"/><path class="knock" d="M5.5 18.5l8-8"/>',
  'bolt.fill': '<path class="f" d="M13.4 2.5 4.8 13.6h6.1l-1 7.9 8.6-11.1h-6.1z"/>',
  wind: '<path d="M3 8.5h10.5a2.8 2.8 0 1 0-2.8-2.8M3 12.5h15a3 3 0 1 1-3 3M3 16.5h7"/>',
  'sunrise.fill': '<path class="f" d="M5.5 17.5a6.5 6.5 0 0 1 13 0z"/><path d="M3 17.5h18M12 3.5v3.5M4.6 9.6l2 2M19.4 9.6l-2 2M8 21h8"/>',
  'moon.stars.fill': '<path class="f" d="M19.5 14.8A8 8 0 1 1 9.2 4.5a6.3 6.3 0 0 0 10.3 10.3z"/><path class="f" d="M17 3.5l.6 1.6 1.6.6-1.6.6L17 7.9l-.6-1.6-1.6-.6 1.6-.6z"/>',
  'moon.zzz.fill': '<path class="f" d="M17.5 15.5A7.5 7.5 0 1 1 8 5.5a6 6 0 0 0 9.5 10z"/><path d="M14.5 3.5h4l-4 4h4"/>',
  'hand.raised': '<path d="M8 13V5.8a1.5 1.5 0 0 1 3 0V11M11 11V4.3a1.5 1.5 0 0 1 3 0V11M14 11V5.8a1.5 1.5 0 0 1 3 0V14c0 4-2.6 7-6.5 7-2.8 0-4.3-1.3-5.8-3.8L3 14.2c-.6-1 .6-2.2 1.6-1.5L8 15"/>',
  'hand.raised.fill': '<path class="f" d="M8 13V5.8a1.5 1.5 0 0 1 3 0V4.3a1.5 1.5 0 0 1 3 0v1.5a1.5 1.5 0 0 1 3 0V14c0 4-2.6 7-6.5 7-2.8 0-4.3-1.3-5.8-3.8L3 14.2c-.6-1 .6-2.2 1.6-1.5L8 15z"/>',
  'hand.tap.fill': '<path d="M5.8 6.2a4.3 4.3 0 0 1 8.4 0"/><path class="f" d="M8.5 11.5V6.3a1.5 1.5 0 0 1 3 0v5l4.8 1c1.3.3 2.2 1.4 2.2 2.7V17c0 2.6-2 4.5-4.6 4.5h-2c-1.6 0-2.8-.7-3.7-1.9l-3.3-4.4c-.7-1 .4-2.3 1.6-1.6l1.9 1z"/>',
  'hand.thumbsup': '<path d="M7 11v9.5H4V11zM7 11l4-7.5c1.5 0 2.5 1 2.5 2.5V9.5h5a2 2 0 0 1 2 2.3l-1.2 6.8a2 2 0 0 1-2 1.9H7"/>',
  'person.2': '<circle cx="9" cy="8" r="3.4"/><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0"/><circle cx="17" cy="9" r="2.7"/><path d="M16.3 13.9a5.2 5.2 0 0 1 5 5.6"/>',
  'person.2.fill': '<circle class="f" cx="9" cy="8" r="3.6"/><path class="f" d="M2.5 20.5a6.5 6.5 0 0 1 13 0z"/><circle class="f" cx="17.2" cy="9" r="2.9"/><path class="f" d="M16.8 13.6a5.5 5.5 0 0 1 4.9 6.9h-4.6a8 8 0 0 0-2.4-6.2z"/>',
  'person.bust': '<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
  'photo.fill': '<rect class="f" x="3" y="4.5" width="18" height="15" rx="2.5"/><circle class="knock-fill" cx="8.5" cy="9.5" r="1.7"/><path class="knock" d="M21 15.5l-5-4.8-9.5 8.8"/>',
  'envelope.fill': '<rect class="f" x="3" y="5" width="18" height="14" rx="2.5"/><path class="knock" d="M3.8 6.5 12 12.8l8.2-6.3"/>',
  hourglass: '<path d="M6.5 3.5h11M6.5 20.5h11M7.5 3.5c0 5 4.5 5.6 4.5 8.5s-4.5 3.5-4.5 8.5M16.5 3.5c0 5-4.5 5.6-4.5 8.5s4.5 3.5 4.5 8.5"/>',
  'eye.slash.fill': '<path d="M3.5 3.5l17 17M10.6 5.2A9.6 9.6 0 0 1 12 5c5 0 8.7 4.4 9.6 7-.4 1-1.3 2.4-2.6 3.6M6.7 6.7C4.4 8 2.9 10.1 2.4 12c1 2.6 4.6 7 9.6 7 1.8 0 3.4-.5 4.8-1.3M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  iphone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.6"/><path d="M10.5 5h3"/>',
  'iphone.radiowaves.left.and.right': '<rect x="8.3" y="3" width="7.4" height="18" rx="2"/><path d="M5 8.5a6 6 0 0 0 0 7M19 8.5a6 6 0 0 1 0 7M2.5 6.5a9.5 9.5 0 0 0 0 11M21.5 6.5a9.5 9.5 0 0 1 0 11"/>',
  'gauge.with.needle.fill': '<path class="f" d="M2.5 16.5a9.5 9.5 0 0 1 19 0v1.5h-19z"/><path class="knock" d="M12 16.5l4-5"/><circle class="knock-fill" cx="12" cy="16.5" r="1.6"/>',
  'lightbulb.fill': '<path class="f" d="M12 2.8a6.3 6.3 0 0 0-3.7 11.4c.8.6 1.5 1.5 1.5 2.5h4.4c0-1 .7-1.9 1.5-2.5A6.3 6.3 0 0 0 12 2.8z"/><path d="M9.5 19h5M10.5 21.5h3"/>',
  'bell.fill': '<path class="f" d="M5.6 16.5V11a6.4 6.4 0 1 1 12.8 0v5.5l1.6 2H4z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  bell: '<path d="M5.6 16.5V11a6.4 6.4 0 1 1 12.8 0v5.5l1.6 2H4z"/><path d="M10 20.8a2 2 0 0 0 4 0"/>',
  'bell.badge.fill': '<path class="f" d="M5.6 16.5V11a6.4 6.4 0 0 1 9.3-5.7A4 4 0 0 0 18.4 11v5.5l1.6 2H4z"/><circle class="f" cx="18.5" cy="5.5" r="2.6"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.6 3.7 5.6 3.7 9s-1.3 6.4-3.7 9c-2.4-2.6-3.7-5.6-3.7-9S9.6 5.6 12 3z"/>',
  'speaker.wave.2.fill': '<path class="f" d="M3.5 9.2h3.8L12 5.2v13.6l-4.7-4H3.5z"/><path d="M15.3 9a4.2 4.2 0 0 1 0 6M18 6.4a8 8 0 0 1 0 11.2"/>',
  'music.note': '<path d="M9 18V5.5l10-2V16"/><circle class="f" cx="6.5" cy="18" r="2.6"/><circle class="f" cx="16.5" cy="16" r="2.6"/>',
  waveform: '<path d="M3 12h1.5M7 8.5v7M10.5 5v14M14 8v8M17.5 6v12M21 11v2"/>',
  'circle.lefthalf.filled': '<circle cx="12" cy="12" r="9"/><path class="f" d="M12 3a9 9 0 0 0 0 18z"/>',
  'lock.shield.fill': '<path class="f" d="M12 2.8l7.5 3.1v5.7c0 4.6-3.1 8.6-7.5 9.9-4.4-1.3-7.5-5.3-7.5-9.9V5.9z"/><rect class="knock-fill" x="9" y="11" width="6" height="4.6" rx="1"/><path class="knock" d="M10 11V9.8a2 2 0 0 1 4 0V11"/>',
  'lifepreserver.fill': '<circle cx="12" cy="12" r="8.2" stroke-width="3.6"/><circle class="knock-fill" cx="12" cy="12" r="3"/><path class="knock" d="M6.2 6.2l3 3M14.8 14.8l3 3M17.8 6.2l-3 3M9.2 14.8l-3 3"/>',
  'ladybug.fill': '<path class="f" d="M12 6.5a6 6 0 0 1 6 6v1.8a6 6 0 0 1-12 0v-1.8a6 6 0 0 1 6-6z"/><path d="M9 4l1.5 2.2M15 4l-1.5 2.2M6 13H3M21 13h-3M6.6 17.5 4.2 19M17.4 17.5l2.4 1.5"/><path class="knock" d="M12 7v13"/>',
  'camera.fill': '<path class="f" d="M4.5 7.5h2.8l1.6-2.5h6.2l1.6 2.5h2.8A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5V9a1.5 1.5 0 0 1 1.5-1.5z"/><circle class="knock-fill" cx="12" cy="13.2" r="3.4"/>',
  'star.fill': '<path class="f" d="M12 3.2l2.7 5.5 6 .9-4.35 4.2 1 6-5.35-2.8-5.35 2.8 1-6L3.3 9.6l6-.9z"/>',
  star: '<path d="M12 3.2l2.7 5.5 6 .9-4.35 4.2 1 6-5.35-2.8-5.35 2.8 1-6L3.3 9.6l6-.9z"/>',
  'chart.line.uptrend.xyaxis': '<path d="M3.5 3.5v17h17M7 15l4-4.5 3 3L20 7M15.5 7H20v4.5"/>',
  'flag.checkered': '<path d="M5 21.5V3.5M5 4h13.5l-2.3 4.5 2.3 4.5H5"/>',
  shippingbox: '<path d="M3.5 7.5 12 3.2l8.5 4.3v9L12 20.8l-8.5-4.3zM3.5 7.5 12 11.8l8.5-4.3M12 11.8v9"/>',
  cube: '<path d="M12 3 20 7.3v9.4L12 21l-8-4.3V7.3zM4 7.3l8 4.4 8-4.4M12 11.7V21"/>',
  cylinder: '<ellipse cx="12" cy="6.2" rx="7" ry="2.7"/><path d="M5 6.2v11.6c0 1.5 3.1 2.7 7 2.7s7-1.2 7-2.7V6.2"/>',
  chair: '<path d="M7.5 3.5v9h9v-9M6 12.5h12V15H6zM7.5 15v6M16.5 15v6"/>',
  lasso: '<ellipse cx="12.5" cy="8.8" rx="8" ry="4.8"/><path d="M8.5 13c-1.2 2.2.3 3.6 2.3 3.4M10.8 16.4c.2 2.1-1 3.6-3.3 4.6"/>',
  'rectangle.portrait': '<rect x="6" y="3" width="12" height="18" rx="2.5"/>',
  'square.split.bottomrightquarter': '<rect x="4" y="4" width="16" height="16" rx="2.5"/><path d="M12 12h8M12 12v8"/>',
  // Figures (pictograms)
  'figure.stand': `${head(12, 4)}<path d="M12 7.2v7.3M7.6 11.8 12 9.2l4.4 2.6M12 14.5 9.3 21M12 14.5l2.7 6.5"/>`,
  'figure.kickboxing': `${head(6.8, 4.4)}<path d="M7.4 7.6 9.4 13.4M8 9.8l3.6-1.6 1.2-2.4M8 9.8 5 12.2M9.4 13.4 7.8 21M9.4 13.4l4.8-3.3 6.8-1.8"/>`,
  'figure.boxing': `${head(9.6, 4.4)}<path d="M10.2 7.6 11 14M10.4 9.8h8M10.4 9.8l-3 2.6 2.3-3.4M11 14l-2.6 7M11 14l3.4 7"/>${head(19.5, 9.8, 1.6)}`,
  'figure.wrestling': `${head(6.4, 6.4)}<path d="M8.2 8.2 15.2 9.2M15.2 9.2l2.4 5.4-1.2 5.9M15.2 9.2l-3 6 1.1 5.3M9.4 9l-1.6 6M11.6 9.3l.8 5.6"/>`,
  'figure.flexibility': `${head(7.5, 5, 2)}<path d="M8.5 7.5l2 6.5M10.5 14l-2.5 7M10.5 14l4.5-4.5 5.5-4.5M9 10.5l4-1.5M9 10.5l-3 3"/>`,
  'figure.yoga': `${head(12, 3.8)}<path d="M12 6.8v7.7M12 8.8 8.2 4.4M12 8.8l3.8-4.4M12 14.5V21.5M12 14.5l4 1.6-3.6 2.6"/>`,
  'figure.mind.and.body': `${head(12, 4.2, 2)}<path d="M12 6.8v6.8M12 9.5l-4.5 2.8 1.5 2.2M12 9.5l4.5 2.8-1.5 2.2M7 19.5c0-2.5 2.5-4 5-4s5 1.5 5 4z"/>`,
  'figure.cooldown': `${head(16.2, 14.2)}<path d="M8.8 7.8l5.8 5.2M8.8 7.8 7.6 21M8.8 7.8l3.3 13.2M13.4 12.4l.8 5.8"/>`,
  'figure.cross.training': `${head(12, 3.8)}<path d="M12 6.8v6.7M12 13.5l5 1.1v6.4M12 13.5l-4.4 3.6-3.6 3.4M7.8 9.6h8.4"/>`,
  'figure.core.training': `${head(5, 9.5, 2)}<path d="M6.5 11l4.8 5.5 7.2-7.5M11.3 16.5l5.2-1.5M8 13.5l5 1.5"/>`,
  'figure.strengthtraining.functional': `${head(12, 4)}<path d="M12 7v5.5M12 12.5l-4.6 2.4 1 6.1M12 12.5l4.6 2.4-1 6.1M12 8.8h7M12 8.8H5"/>`,
  'figure.gymnastics': `${head(12, 4)}<path d="M12 7v8.2M12 15.2 2.5 19.8M12 15.2l9.5 4.6M12 9.2 6.2 5.8M12 9.2l5.8-3.4"/>`,
  'figure.pilates': `${head(4.6, 15.8)}<path d="M6.6 16.4h8.2M14.8 16.4 20 8.2M8.4 16.4 7.4 11.8"/>`,
  'figure.step.training': `${head(11, 4)}<path d="M11.3 7.1 12.2 14M12.2 14l-4 7M12.2 14l5.3 5.5M11.5 9.2 7.8 12M11.5 9.2l4.1 2.6"/>`,
  'figure.taichi': `${head(10, 4)}<path d="M10 7.1V14M10 9.6c2-1 5-.8 7.4 1.2M10 9.6c-2 1.4-3.4 3-4 5M10 14l-3.6 7M10 14l4.6 3 2 4.3"/>`,
  'figure.mixed.cardio': `${head(12, 3.8)}<path d="M12 6.8v7.4M12 8.8 6.2 3.8M12 8.8l5.8-5M12 14.2 6.6 21M12 14.2l5.4 6.8"/>`,
  'figure.highintensity.intervaltraining': `${head(15.4, 4.2)}<path d="M14.4 7.2 10.3 13M13.2 9 9 8.3 7 10.8M13.2 9l4.2 3M10.3 13l5 3 1 5M10.3 13l-5 1.2-2 4.3"/>`,
  'figure.arms.open': `${head(12, 4)}<path d="M12 7.2v7.3M3.2 8.6l8.8 1 8.8-1M12 14.5 9.5 21M12 14.5l2.5 6.5"/>`,
  'figure.lunge': `${head(10, 4.5, 2)}<path d="M10 7v6M7.5 10.5l5-1.5M10 13l-4.5 1.5-1 6.5M10 13l5 1.5 4 4.5"/>`,
  'figure.split': `${head(12, 4.8, 2)}<path d="M12 7.2v6.2M9 10.5h6M12 13.4l-8.5 5.6M12 13.4l8.5 5.6"/>`,
  'figure.forward.fold': `${head(8.8, 16.2, 2)}<path d="M16 19.5V7.5c0-2-1.5-3.5-3.5-3.5C10 4 8.5 6.2 8.5 8.5L8.8 14M16 12l-5 4"/>`,
  'figure.balance': `${head(6.5, 7.5, 2)}<path d="M8 8.8l5 1.8M10 9.8l2 10.2M13 10.6l7.5-3.2M10 10.2l-3-2.5M12 13l4-2"/>`,
  'figure.childs.pose': `${head(6.5, 14.5, 2)}<path d="M19.5 18c0-3.5-2.5-6-6-6-2.5 0-4.5 1.5-5.5 3.5M19.5 18h-4.5l-3-2M8 15.5l-3.5 2.5"/>`,
  'figure.butterfly': `${head(12, 5, 2)}<path d="M12 7.5v6.5M9.2 10.5h5.6M12 14c-3.2 0-6.2 1.6-6.2 4 0 1.2 1.8 1.8 3.2 1.8l3-1.8 3 1.8c1.4 0 3.2-.6 3.2-1.8 0-2.4-3-4-6.2-4z"/>`,
  'figure.pigeon': `${head(8.5, 5.5, 2)}<path d="M8.5 8v6M6 11l4.5 1M8.5 14c-1.5 1.5-4 2.5-4 4.5h7M8.5 14l5.5 1.5 6 3"/>`,
  'figure.neck': `${head(10.5, 6, 2.2)}<path d="M12 9.2v9M7 13.5h10M12 18.2l-2.5 3M12 18.2l2.5 3M10.5 3.8c1.5-1 4-0.5 4.5 1.5"/>`,
  brain: '<path d="M9.5 4.5C7.5 4.5 6 6 6 8c0 .8.3 1.5.8 2.1C5.7 10.8 5 12 5 13.5c0 1.9 1.2 3.5 3 4 .3 1.2 1.3 2 2.5 2h.5V4.6c-.5-.1-1-.1-1.5-.1zM14.5 4.5c2 0 3.5 1.5 3.5 3.5 0 .8-.3 1.5-.8 2.1 1.1.7 1.8 1.9 1.8 3.4 0 1.9-1.2 3.5-3 4-.3 1.2-1.3 2-2.5 2h-.5V4.6c.5-.1 1-.1 1.5-.1z"/>',
  'text.book.closed.fill': '<path class="f" d="M6 3.5h11a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H6A2.5 2.5 0 0 1 3.5 18V6A2.5 2.5 0 0 1 6 3.5z"/><path class="knock" d="M6 3.5v17"/>',
  'chart.bar.fill': '<path class="f" d="M4 19.5h16v1.5H4zM6 14h3v5H6zM10.5 9h3v10h-3zM15 4h3v15h-3z"/>',
  'shield.checkered': '<path d="M12 2.5 4 5.5v6.2c0 5 3.5 9.2 8 10.3 4.5-1.1 8-5.3 8-10.3V5.5z"/><path class="knock" d="M12 3v18M4 12h16"/>',
}

const ALIASES: Record<string, string> = {
  'house.circle': 'house',
  gear: 'gearshape.fill',
  'books.vertical': 'books.vertical.fill',
}

/** Kiai's ensō mark (logo). */
export const ENSO_PATH = 'M16.9 5.1 A8.4 8.4 0 1 0 19.4 9.6'

export interface IconProps {
  name: string
  size?: number
  strokeWidth?: number
  className?: string
  style?: React.CSSProperties
  title?: string
}

export const Icon = memo(function Icon({ name, size = 20, strokeWidth = 2, className, style, title }: IconProps) {
  const markup = BASE[name] ?? BASE[ALIASES[name] ?? ''] ?? BASE[name.replace(/\.fill$/, '')] ?? BASE['circle']
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      style={style}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
})
