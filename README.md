# Into the Cryostat

An interactive guide to quantum computing, written by **Sai Ganesh Chidambaram**.

Quantum processors run at the bottom of a dilution refrigerator, a hundredth of a degree above absolute zero. This guide takes the same route down: five stages from room temperature (300 K) to the mixing chamber (10 mK), followed by six research tracks.

- **39 lessons**, each with key ideas and a ten-question check with explained answers (390 questions in total)
- **61 interactive labs** running live in the browser: Bloch spheres, a 4-qubit circuit simulator, Grover, Shor, BB84, a 2,000-qubit stabilizer simulator, a surface-code decoder, threshold Monte Carlo, tensor-network entanglement, a circuit optimizer, qubit routing and more
- **Part I · The descent:** foundations, building blocks, entanglement and communication, algorithms, real machines
- **Part II · Research tracks:** error correction and fault tolerance (8 lessons), algorithms and complexity, simulation methods, compilers and architecture, chemistry and machine learning, information theory and post-quantum cryptography

Everything is plain HTML, CSS and JavaScript. There is no framework, no build tooling to install and no server code. Progress is stored only in each reader’s browser.

## View it locally

Open `index.html` in any modern browser.

## Publish with GitHub Pages

1. Push this folder to a GitHub repository (public, for free GitHub accounts).
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose the `main` branch and the `/ (root)` folder, and press **Save**.
4. After a minute or two the site is live at `https://<your-username>.github.io/<repository-name>/`.

The empty `.nojekyll` file tells GitHub Pages to serve the files as they are.

## Editing

The page is assembled from the files in `src/`:

| File | Contents |
| --- | --- |
| `head.html` | Title, fonts and all CSS (design tokens at the top) |
| `body.html` | Page shell: sidebar, mobile menu, footer |
| `01-engine.js` | State-vector simulator, Bloch sphere, charts, circuit drawing, UI helpers |
| `02`–`06` | Part I lessons, one file per stage |
| `07-engine-research.js` | Stabilizer tableau, matching decoder, surface-code geometry, eigensolver |
| `08`–`11` | Part II research-track lessons |
| `12`–`13` | Extra quiz questions |
| `14-app.js` | Navigation, routing, home page, quiz interface, glossary |

After editing, rebuild and commit:

```bash
python build.py
git add -A
git commit -m "Update lessons"
git push
```

GitHub Pages redeploys automatically after each push.

## Credits

Written by Sai Ganesh Chidambaram. Fonts: Bricolage Grotesque, STIX Two Text, JetBrains Mono and Noto Sans Math, loaded from Google Fonts.

© 2026 Sai Ganesh Chidambaram
