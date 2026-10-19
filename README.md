# Al-Jaleel Academy Learning Playground

A playful, mobile-first learning app from Al-Jaleel Academy for Nursery and Primary learners aged 4–12. The app is designed to grow from its existing maths activities into a broader library of written lessons and interactive learning games. Its visual identity uses deep blue (`#001C2C`), golden yellow (`#FBBA00`), and white, with the school motto “Igniting a Brighter Future.”

The app is static and uses local learner profiles rather than online accounts. Each learner has a 4-digit PIN and a parent/teacher recovery code; profiles, points, and activity progress stay in this browser and do not sync between devices. PINs are a convenience lock, not device-level security. Export backups before clearing browser data or changing devices. Other schools can use the same shared app link; school-specific customisation is not part of this version. Each learning module has its own page so learners can move between activities without scrolling through one long page.

## Current MVP

- **Home dashboard:** module navigation, points total, and a quick view of learning activity.
- **Shared module foundation:** reusable module metadata, learning goals, lesson/activity sequence, topic tags, and responsive overview renderer.
- **Written lessons and reusable activities:** a worked fraction lesson, a multiple-choice quick check, and a matching activity with hints, explanations, feedback, and local completion status.
- **Activity rewards:** first-time completion can add points to the existing local progress total without resetting existing progress; detailed activity completion is stored separately on the device.
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
- PIN-protected local learner profiles, parent/teacher PIN recovery, profile switching, rename/delete, and local JSON backup export/import.
- No online account, backend, advertisements, or tracking.

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
- `data/activities.js` — written lesson content and structured activity questions/matching pairs
- `learning-activities.js` and `learning-activities.css` — reusable lesson, quiz, matching renderer, and responsive styles
- `learning-module.js` and `learning-module.css` — reusable module overview renderer and responsive styles
- `catalog.js` and `catalog.css` — reusable catalogue renderer and responsive card styles
- `styles.css` — shared responsive design and page layouts
- `app.js` — activity logic and profile-scoped local progress
- `learner-profiles.js` and `learner-profiles.css` — local profiles, PIN verification, recovery, and backup tools
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

Profiles and progress are stored in browser local storage on the current device and are separated by learner. They do not sync between devices. Export a backup before clearing site data. PIN protection is intended to prevent casual profile switching, not to protect against someone with technical access to the browser storage. This is an early MVP; test navigation, learning activities, and offline behaviour on target phones and browsers before classroom-wide use.
