# WorldPulse ULTRA

WorldPulse ULTRA is a glassy, neon multi-timezone dashboard with massive Orbitron clocks, animated aurora lighting, and live weather mood cards.

## Included

- Deep cosmic background with animated aurora mesh
- Frosted glass city cards with per-city neon signatures
- Orbitron hero clock for local time
- Rajdhani labels and HUD-style typography
- Animated weather states: sunny, rain, snow, storm, fog, night
- Default cities: Tokyo, Dubai, Paris, London, New York, Los Angeles, Sydney, São Paulo
- Luxon-powered timezone rendering
- OpenWeatherMap-ready weather integration with graceful demo fallback
- Framer Motion hover lift and pulse behavior
- Tailwind-based UI structure with custom glass utilities

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion
- Luxon
- Lucide React

## Getting started

Install dependencies:

```bash
npm install
```

Optional: enable live OpenWeatherMap data by creating a `.env` file:

```bash
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

Run locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Weather behavior

- If `VITE_OPENWEATHER_API_KEY` is set, cards use live OpenWeatherMap current conditions.
- If the key is missing or the request fails, the UI falls back to a visually coherent demo weather mode so the dashboard still works.
