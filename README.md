# Sri Lanka Customs — Dashboard Showcase

Client presentation website built using the provided **Fake Dash** site and **Dashboards AI** screenshots. The supplied logo artwork, existing background assets, Accounting Revenue screenshots, and other dashboard screenshot pixels have been preserved as provided.

## Included content

- **16 dashboard groups** and **69 screenshots** total (4 Accounting Revenue screenshots from the original site plus 65 supplied additional screenshots).
- Missing homepage groups added: **Advanced Warehouse** and **Warehousing**.
- Combined related report versions within the correct group: **FCL Imports Dashboard / FCL Imports Advance Dashboard** and **Valuation Analysis / Advanced Valuation Analysis**.
- Working home links, instant search, dynamic counts, dashboard selector, report section tabs, page tabs, previous/next controls, arrow-key navigation, thumbnail gallery, fullscreen view, screenshot zoom, browser back/forward history and copy page link.
- Responsive layout and keyboard-focus controls.

## Run the website

Extract the ZIP and keep its folders together. For the simplest preview, open `index.html` in a modern browser. For reliable local testing and shareable links, open a terminal in this directory and run:

```bash
python serve.py
```

Then open **http://localhost:8080/**. You can deploy the entire directory as static files to any suitable web server (e.g. Apache, Nginx, Netlify, GitHub Pages). Set the deployment's root to the folder containing `index.html`.

## Important client-facing distinction

This is a **screenshot-based showcase**, not a live embedded Power BI report. Site navigation, image viewing, zoom and fullscreen are interactive, but the filters, slicers and data visuals *inside each screenshot* are not interactive and do not update from a database. Live Power BI functionality requires connecting real reports with appropriate embedding, permissions and refresh configuration.

## Update content later

- `catalog.js` is the page metadata used by the browser; `catalog.json` is an identical, human-readable reference.
- Dashboard screenshots are in `assets/screenshots/<dashboard-id>/` (the original accounting screenshots remain in `assets/`). The catalog records original source file names.
- To change a page screenshot, replace its PNG, preserving the filename, or update the `image` path in `catalog.js`.
- The logos are from the uploaded original website (`assets/customs-logo.png`, `assets/customs-crest-transparent.png`, `assets/cwt-logo.png`).
- `index.html` and `home.js` power the homepage; `dashboard.html`, `revenue.html`, `viewer.css`, `viewer.js`, and `catalog.js` power dashboard pages.

## Notes

All dashboard screenshots supplied in the ZIP are included. Screenshot names are displayed with a few typographical corrections (e.g. `Comodity` → `Commodity`) but image contents are not altered. Date values shown *inside screenshots* are static and were not updated. The hosted fonts are optional: the site falls back to installed system fonts when offline.
