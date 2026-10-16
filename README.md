# Al-Jaleel Academy Learning Playground

A playful, mobile-first learning app from Al-Jaleel Academy for Nursery and Primary learners aged 4–12. The app is designed to grow from its existing maths activities into a broader library of written lessons and interactive learning games. Its visual identity uses deep blue (`#001C2C`), golden yellow (`#FBBA00`), and white, with the school motto “Igniting a Brighter Future.”

The app is static and account-free: learners can open the shared link without creating an account. Progress is stored locally on each device and does not sync between devices. Other schools can use the same shared app link; school-specific customisation is not part of this version. Each learning module has its own page so learners can move between activities without scrolling through one long page.

## Current MVP

- **Home dashboard:** module navigation, points total, and a quick view of learning activity.
- **Shared module foundation:** reusable module metadata, learning goals, lesson/activity sequence, topic tags, and responsive overview renderer.
- **Fraction Fun module overview:** learning goals and linked Learn, Practise, and Challenge activities before the existing interactive workspace.
- **Fraction Fun — Learn:** visual explanation of numerator and denominator, plus a tappable pizza model.
- **Fraction Fun — Practise:** multiple-choice questions, hints, feedback, and points.
- **Fraction Fun — Challenge:** compare fractions using visual fraction bars.
- **Subject directory:** Mathematics, English, Science & Discovery, Arabic, Creative Arts, and Logic & Thinking.
- **Mathematics directory:** Fraction Fun, Number Explorers, and Shape Safari are listed in a shared catalogue.
- **Logic & Thinking directory:** Brainy Challenges is listed as a planned module.
- **Coming-soon module pages:** Number Explorers, Shape Safari, and Brainy Challenges have their own routes and can be built independently.
- Local progress saved on the learner's device and shared between pages on the same site.
- Responsive layout, keyboard-friendly tabs, accessible feedback, and optional sound effects on the home page.
- PWA manifest and service worker for offline app-shell caching.
- No account, backend, advertisements, or tracking.

## Run locally

This is a static app; no build step or package installation is required. Serve the repository directory over HTTP (service workers require localhost or HTTPS), for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

You can also deploy the repository as a static site on GitHub Pages or another static hosting provider. For the best first-load experience, open it online once before trying it offline. Google Fonts are optional and may not load without an internet connection.

## Structure

- `index.html` — short home dashboard and module directory
- `modules/fractions/index.html` — Fraction Fun learning, practice, and challenge workspace
- `modules/numbers/index.html` — Number Explorers coming-soon page
- `modules/geometry/index.html` — Shape Safari coming-soon page
- `modules/challenges/index.html` — Brainy Challenges coming-soon page
- `subjects/index.html` — subject directory
- `subjects/mathematics/index.html` — mathematics module directory
- `subjects/logic/index.html` — logic and thinking directory
- `data/learning-catalog.js` — shared subject, module, age-stage, and curriculum-tag metadata
- `data/module-content.js` — detailed module content schema (overview, goals, lesson sequence, topics, progress policy)
- `learning-module.js` and `learning-module.css` — reusable module overview renderer and responsive styles
- `catalog.js` and `catalog.css` — reusable catalogue renderer and responsive card styles
- `styles.css` — shared responsive design and page layouts
- `app.js` — activity logic and shared local progress
- `manifest.webmanifest` — installable app metadata
- `service-worker.js` — offline app-shell caching

## Learning stages

The catalogue defines three flexible learning stages: Early Years (ages 4–5), Lower Primary (ages 6–8), and Upper Primary (ages 9–12). These are planning labels, not a claim of alignment to one country's curriculum. Module age ranges and curriculum tags are stored as metadata so content can be expanded and reviewed later.

## Planned modules

1. Fraction Fun
2. Number Explorers — numbers and operations
3. Shape Safari — geometry and measurement
4. Brainy Challenges — puzzles and problem-solving

## Notes

Progress is stored in browser local storage on the current device and is shared by the app's pages on the same origin. It does not sync between devices. This is an early MVP; test navigation, learning activities, and offline behaviour on target phones and browsers before classroom-wide use.
