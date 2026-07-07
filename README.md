# Anaplan Project Hub

A simple documentation / quick-link page for your Anaplan project. Three sections:
Quick Links, Model Details, and AD Groups.

## How to run

Double-click **`start.bat`**. It launches a small local server and opens the app
at http://localhost:4173 in your browser. Keep the black console window open
while using the app; close it to stop.

> A tiny server is needed because browsers block reading local data files when
> you open `index.html` directly (the `file://` restriction). `start.bat` uses
> Node.js, which is already installed on this machine.

## Updating your content (no coding needed)

All content lives in the **`data/`** folder as plain-text JSON files. Edit them in
Notepad, VS Code, or any editor, then refresh the browser.

### `data/links.json` — Quick Links (left)
```json
[
  { "label": "Anaplan Login", "url": "https://us1a.app.anaplan.com/" }
]
```

### `data/models.json` — Model Details (middle dropdown)
```json
[
  {
    "name": "PROD - Financial Planning",
    "workspaceId": "8a80a...003",
    "modelId": "F1...A03"
  }
]
```

### `data/adgroups.json` — AD Groups (right)
```json
[
  "AD-ANAPLAN-PROD-ADMIN",
  "AD-ANAPLAN-PROD-USER"
]
```

### Editing tips
- Keep the brackets, quotes, and commas exactly as shown.
- Every item except the last needs a trailing comma.
- If the page shows an error, a comma or quote is usually missing — paste the
  file into https://jsonlint.com to find it.

## Files
| File | Purpose |
|------|---------|
| `start.bat` | Double-click to launch |
| `index.html` / `styles.css` / `app.js` | The app (no need to edit) |
| `server.js` | The tiny local web server |
| `data/*.json` | **Your content — edit these** |
