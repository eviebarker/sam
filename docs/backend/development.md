# Development workflow

## Setup and run
1. Create a virtualenv and install runtime deps:
   - `python -m venv .venv && source .venv/bin/activate`
   - `pip install -r backend/requirements.txt`
2. Run the API:
   - `uvicorn backend.app.main:app --reload`
3. Optional: load environment from `.env` at the repo root.

## Documentation stack
- Sphinx with the Read the Docs theme for a RTD-style site.
- MyST so pages can be written in Markdown.
- AutoAPI generates code reference pages directly from `backend/app` on each build (no manual stubs).

## Building docs locally
1. Install doc tooling: `pip install -r docs/requirements.txt`
2. Build HTML: `make -C docs html`
3. Open `_build/html/index.html` to view the site.

The `reference` section is regenerated on each build; do not commit `_build/` or `_autoapi/`.

## Keeping docs fresh
- Add/refresh docstrings in services, routes, and DB helpers so AutoAPI renders useful summaries.
- When new endpoints or background jobs land, add a short high-level note under `docs/backend/` (architecture or a new page).
- If APIs change, re-run the docs build so CI catches missing imports or broken references.

## Automation (CI/CD)
- Add a CI job that installs `docs/requirements.txt` and runs `sphinx-build -b html docs docs/_build/html` (fails the build if docs break).
- Optional: publish `_build/html` to GitHub Pages or point Read the Docs at the repo (it reads `docs/conf.py` automatically).
- For API schema snapshots, you can export OpenAPI from FastAPI (`python -m backend.app.main` + `app.openapi()`) and link it into the docs later.
