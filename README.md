# Md. Din Islam — Portfolio

Personal portfolio site, served with GitHub Pages:
https://md-dinislam.github.io/md-din-islam/

Plain HTML, CSS and JavaScript — no build step.

## Structure

```
.
├── index.html     # All page content and sections
├── styles.css     # Design tokens (light/dark), layout, components
├── script.js      # Nav, theme toggle, scroll effects, animations
├── images/        # Profile photos and logos
└── CV/
    └── resume_mddinislam.pdf
```

## Editing

- **Content:** edit `index.html`. Each section is a `<section id="...">` matching the nav links.
- **Colors and fonts:** change the tokens at the top of `styles.css`
  (`:root[data-theme="dark"]` and `:root[data-theme="light"]`).
- **Resume:** replace `CV/resume_mddinislam.pdf`, keeping the same file name so existing links keep working.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```
