# Maths Playground

A playful, mobile-friendly maths learning app for primary learners (ages 7–12), starting with interactive fractions.

## Current MVP

- **Fraction Fun — Learn:** visual explanation of numerator and denominator, plus a tappable pizza model.
- **Fraction Fun — Practise:** multiple-choice questions, hints, feedback, and points.
- **Fraction Fun — Challenge:** compare fractions using visual fraction bars.
- Local progress saved on the learner's device.
- Responsive layout, keyboard-friendly tabs, accessible feedback, and optional sound effects.
- PWA manifest and service worker for offline app-shell caching.
- No account, backend, advertisements, or tracking.

## Run locally

This is a static app; no build step or package installation is required. Serve the repository directory over HTTP (service workers require localhost or HTTPS), for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

You can also deploy the repository as a static site on GitHub Pages or another static hosting provider. For the best first-load experience, open it online once before trying it offline. Google Fonts are optional and may not load without an internet connection.

## Files

- `index.html` — app structure and learning panels
- `styles.css` — responsive visual design
- `app.js` — activity logic and local progress
- `manifest.webmanifest` — installable app metadata
- `service-worker.js` — offline app-shell caching
- `icon.svg` — app icon

## Planned modules

1. Fraction Fun
2. Number Explorers — numbers and operations
3. Shape Safari — geometry and measurement
4. Brainy Challenges — puzzles and problem-solving

## Notes

Progress is stored in the browser on the current device. It does not sync between devices. This is an early MVP; test the learning activities and offline behaviour on target phones and browsers before classroom-wide use.
