# Ananthu S — Portfolio

Personal portfolio for **Ananthu S**, Product Designer specializing in AI-driven cybersecurity experiences.

---

## Local Development

### Recommended — `live-server` (hot reload)

```bash
npx live-server
```

Opens at `http://127.0.0.1:8080` with instant hot reload on file save.
No install needed — `npx` pulls it on first run.

### Alternative — Python

```bash
# Python 3
python -m http.server 8080
```

Then open `http://localhost:8080`.

### VS Code

Install the **Live Server** extension → right-click `index.html` → **Open with Live Server**.

> **Note:** Must be served over HTTP (not opened as a `file://` URL) due to font loading and scroll APIs.

---

## Deploy to GitHub Pages

1. Push the repo to GitHub
2. Go to **Settings → Pages**
3. **Source:** Deploy from branch → `main` → `/ (root)`
4. Click **Save**

Live at: `https://<username>.github.io/<repo-name>`

No build step needed — purely static.

---

## File Structure

```
/
├── index.html          Single page — all sections
├── css/
│   └── style.css       All styles + CSS custom properties
├── js/
│   └── main.js         Cursor, animations, scroll, parallax
└── README.md
```

---

## Features

| Feature | Implementation |
|---|---|
| Custom cursor | Dual ring + dot, ring lerps behind mouse |
| Hero text reveal | CSS `translateY` + `opacity` triggered by `body.loaded` class |
| Parallax orbs | `mousemove` → per-orb strength offset |
| Scroll reveals | `IntersectionObserver` adds `.in-view` class |
| Section count-up | `IntersectionObserver` + `requestAnimationFrame` counter |
| Marquee strip | CSS `@keyframes` infinite scroll, pauses on hover |
| Frosted nav | `backdrop-filter: blur` toggled on scroll threshold |
| Card parallax | Scroll position → `translateY` on mockup wrapper |
| Email hover | Character-level stagger via inline `transition-delay` |
| Dashboard mockup | Pure CSS + SVG — no images |
| AI chat mockup | Pure CSS + SVG — no images |

---

## Stack

- Vanilla HTML5, CSS3, JavaScript (ES6+)
- No frameworks, no bundler, no dependencies
- Fonts: [DM Serif Display + DM Sans](https://fonts.google.com/) via Google Fonts
