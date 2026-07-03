# Smart Antenna

Professional frontend demo site for internal team collaboration and handoffs.

## Overview

- **Project:** Smart Antenna (static frontend demo)
- **Purpose:** Lightweight learning/demo site for authentication and profile UI patterns.
- **Status:** Prototype — static pages, local-only data (localStorage).

## Quick Start (local)

1. Open the project folder in your editor (e.g. VS Code).
2. Serve the site locally to test routing and assets. Two quick options:

- Python (3.x):

  ```bash
  python -m http.server 8000
  ```

- Node (npm):

  ```bash
  npx serve . -l 8000
  ```

3. Open http://localhost:8000 in your browser.

## Files & Structure

- **index.html** — Landing page.
- **login.html** — Sign-in flow.
- **signup.html** — Registration form.
- **profile.html** — User profile/dashboard (reads localStorage).
- **assets/** — CSS, JS, images. Key folders:
  - `assets/css` — stylesheets
  - `assets/js` — client scripts (main.js)
  - `assets/images` — icons and illustrations

## Development Notes

- The site uses no build step; edit HTML/CSS/JS directly.
- User accounts are stored in `localStorage` for demo purposes only. Do not use this for production.
- To change the visible product name, edit the HTML header/footer text in the files above.

## Contribution Guidelines

- Create feature branches: `feature/<short-description>`.
- Keep commits small and descriptive (imperative tense).
- Open a pull request with a short description and testing instructions.
- Run a quick local smoke test (start local server, click through auth flows).

## Team Notes

- Add a `LICENSE` file if you want an explicit license (we recommend MIT for demos).
- Add a `CHANGELOG.md` for larger changes.
- For UI updates, share before/after screenshots in the PR description.

FRONT-END:

BOB / SAEED / ALAA / FADI

FUNCTIONS:
UI/UX -> BOB
CONVERTING DESIGN TO HTML/CSS -> SAEED
RESPONSIVENESS -> SAEED
INTERACTIVITY -> SAEED / ALAA / FADI

BACKEND:
FADI / MONZIR

FUNCTIONS:
AUTHENTICATION & AUTHORAIZATION -> MONZIR
DATABASE -> MONZIR
BASE SERVER -> FADI
CLOUDINARY -> MONZIR
SECURITY -> MONZIR / FADI
COURSE CHAT -> FADI
WEB SOCKETS -> FADI

DEADLINES:
FINALIZING THE PROJECT: 6/5/2026 TO 8/15/2026

[text](../../../../Downloads/WBS.pdf)
