# Weather Report

A weather forecast app built for [The Odin Project](https://www.theodinproject.com/)'s JavaScript curriculum. Search any city and get the current conditions, an hour-by-hour breakdown with a temperature curve, and an 8-day outlook, all set against a real photo of the city and a sky that animates to match the weather.

**[Live demo](https://andreagarzoglio.github.io/Weather-Report/)**

## Features

- **Search any city**, powered by the [Visual Crossing Timeline Weather API](https://www.visualcrossing.com/weather-api).
- **Hour-by-hour forecast**: pick a day, then scrub through its 24 hours; a sparkline traces the temperature curve for the selected day.
- **A real photo of the searched city**, pulled live from Wikipedia, no API key or sign-up required.
- **A sky that reacts to the weather**, built entirely from CSS/JS, no video or image assets: drifting clouds, falling rain, snowfall, fog rising from the ground, lightning during storms, and a day/night gradient with visible stars at night.
- **An accent color that shifts with the forecast** (azure for clear skies, violet for storms, icy cyan for snow...), tying the whole interface to the current conditions.
- **Full detail grid**: feels-like, humidity, wind + gusts, precipitation chance, pressure, cloud cover, visibility, sunrise and sunset.
- **°C/°F toggle**, responsive down to mobile.

## How it works

**City photography.** The app queries Wikipedia's public REST summary endpoint (`/api/rest_v1/page/summary/{city}`) for a thumbnail image: free, keyless, and CORS-enabled. Ambiguous names (Wikipedia returns `type: "disambiguation"`, e.g. searching "New York" alone can match the state, the city, a magazine...) are retried once with "City" appended, which resolves most real-world city names.

**Animated sky.** Instead of video loops or stock GIFs, each weather condition is rendered as a handful of DOM elements driven by CSS keyframes: rain and snow are individually-generated particles falling at randomized speed/size/delay; clouds are soft blurred gradients drifting back and forth; sun rays are a single blurred `conic-gradient` fanning from a fixed point; fog is a gradient rising gently from the bottom of the viewport. A day/night gradient wash sits underneath all of it, independent of the weather category.

**Weather icons.** A small hand-drawn set of line-art SVG icons ([src/icons.js](src/icons.js)) replaces emoji, mapped from Visual Crossing's `icon` field.

## Tech stack

Vanilla JavaScript (ES modules), CSS, Webpack. No frameworks, no UI libraries.

## Getting started

```bash
npm install
npm start       # dev server with hot reload, http://localhost:8080
npm run build   # production build, output to docs/
```

## Project structure

```
src/
  index.html    entry markup
  index.js      app state, rendering, weather + photo fetching
  icons.js      SVG weather icon set + sky/accent-color mapping
  styles.css    design tokens, glass UI, sky animations
```

## Notes

- The Visual Crossing API key in `src/index.js` is a free-tier demo key with limited daily requests. This is a client-side portfolio project, not a production service.
- Deployed automatically to GitHub Pages from `docs/` on every push to `main` (see [.github/workflows/deploy.yml](.github/workflows/deploy.yml)).
