// Minimal line-art weather icon set (replaces emoji for a more editorial, consistent look).
// Each icon is a self-contained inline SVG string, styled via currentColor + CSS.

const stroke =
  'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"';

const ICONS = {
  "clear-day": `<circle cx="12" cy="12" r="4.2" ${stroke}/><g ${stroke}><path d="M12 2.5v2.6"/><path d="M12 18.9v2.6"/><path d="M4.6 4.6l1.8 1.8"/><path d="M17.6 17.6l1.8 1.8"/><path d="M2.5 12h2.6"/><path d="M18.9 12h2.6"/><path d="M4.6 19.4l1.8-1.8"/><path d="M17.6 6.4l1.8-1.8"/></g>`,

  "clear-night": `<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z" ${stroke}/>`,

  "partly-cloudy-day": `<circle cx="9" cy="8.5" r="3.4" ${stroke}/><g ${stroke}><path d="M9 2.5v1.8"/><path d="M3.8 5.3l1.3 1.3"/><path d="M2 10.5h1.8"/><path d="M14.2 5.3l-1.3 1.3"/></g><path d="M8 20h9.5a3.7 3.7 0 0 0 .6-7.35A4.8 4.8 0 0 0 9 11.2" ${stroke}/>`,

  "partly-cloudy-night": `<path d="M15.8 10.3a5.2 5.2 0 0 1-6.9-6.9 5.7 5.7 0 1 0 6.9 6.9z" ${stroke}/><path d="M6 20h10.5a3.5 3.5 0 0 0 .5-6.96" ${stroke}/>`,

  cloudy: `<path d="M6.5 19h11a4 4 0 0 0 .7-7.94A5.5 5.5 0 0 0 7.6 9.3 4.2 4.2 0 0 0 6.5 19z" ${stroke}/>`,

  fog: `<g ${stroke}><path d="M4 9h13"/><path d="M4 13h16"/><path d="M4 17h11"/><path d="M20 17h1"/><path d="M18 9h2"/></g>`,

  rain: `<path d="M6.5 14.5h11a4 4 0 0 0 .7-7.94A5.5 5.5 0 0 0 7.6 4.8 4.2 4.2 0 0 0 6.5 14.5z" ${stroke}/><g ${stroke}><path d="M8 18.5l-1 2.4"/><path d="M12.3 18.5l-1 2.4"/><path d="M16.6 18.5l-1 2.4"/></g>`,

  sleet: `<path d="M6.5 13.5h11a4 4 0 0 0 .7-7.94A5.5 5.5 0 0 0 7.6 3.8 4.2 4.2 0 0 0 6.5 13.5z" ${stroke}/><g ${stroke}><path d="M8 17.2l-.9 2.1"/><path d="M12 17.2v2.4"/><path d="M16 17.2l.9 2.1"/></g>`,

  snow: `<path d="M6.5 13.5h11a4 4 0 0 0 .7-7.94A5.5 5.5 0 0 0 7.6 3.8 4.2 4.2 0 0 0 6.5 13.5z" ${stroke}/><g ${stroke}><path d="M8 18v3.2"/><path d="M6.5 19.1l3 2"/><path d="M9.5 19.1l-3 2"/><path d="M16 18v3.2"/><path d="M14.5 19.1l3 2"/><path d="M17.5 19.1l-3 2"/></g>`,

  wind: `<g ${stroke}><path d="M2.5 8.5h12.6a2.6 2.6 0 1 0-2.4-3.6"/><path d="M2.5 13h16.2a2.9 2.9 0 1 1-2.7 4"/><path d="M2.5 17.4h9.3a2 2 0 1 1-1.9 2.8"/></g>`,

  thunder: `<path d="M6.5 12.5h11a4 4 0 0 0 .7-7.94A5.5 5.5 0 0 0 7.6 2.8 4.2 4.2 0 0 0 6.5 12.5z" ${stroke}/><path d="M13.2 12.5l-3 5.2h3l-2 4.5 5.4-6.5h-3.2l1.8-3.2z" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>`,
};

// Maps Visual Crossing's `icon` field to one of the keys above.
export function resolveIconKey(icon) {
  if (!icon) return "cloudy";
  if (icon.startsWith("thunder")) return "thunder";
  if (ICONS[icon]) return icon;
  return "cloudy";
}

export function weatherIconSVG(icon, extraClass = "") {
  const key = resolveIconKey(icon);
  return `<svg viewBox="0 0 24 24" class="wicon ${extraClass}" aria-hidden="true">${ICONS[key]}</svg>`;
}

// Broad category used to drive the animated sky background.
export function skyCategory(icon) {
  const key = resolveIconKey(icon);
  if (key === "clear-day" || key === "clear-night") return "clear";
  if (key === "partly-cloudy-day" || key === "partly-cloudy-night")
    return "partly-cloudy";
  if (key === "cloudy") return "cloudy";
  if (key === "fog") return "fog";
  if (key === "rain" || key === "sleet") return "rain";
  if (key === "snow") return "snow";
  if (key === "thunder") return "storm";
  if (key === "wind") return "wind";
  return "cloudy";
}

export function isNight(icon) {
  return typeof icon === "string" && icon.endsWith("night");
}

// Picks the UI accent hue to match the current sky, so the whole interface
// (icons, active states, sparkline) shifts mood with the weather.
export function accentColor(category, night) {
  switch (category) {
    case "clear":
    case "partly-cloudy":
      return night ? "#a9b8ff" : "#5ec8ff";
    case "cloudy":
      return "#9fb4c7";
    case "fog":
      return "#b9c4cd";
    case "storm":
      return "#b18bff";
    case "snow":
      return "#bfe8ff";
    case "wind":
      return "#9fd6c9";
    case "rain":
    default:
      return "#7dd0ff";
  }
}
