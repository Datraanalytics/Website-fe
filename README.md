# Datra Analytics — Frontend (Website-fe)

Static website and analytics dashboard for the Datra Analytics real-estate
intelligence platform. Built with plain HTML, CSS, and vanilla JavaScript
(ES6+), served by nginx in production.

> Backend API lives in a separate repo: **Website-be**.

## Tech Stack

- **HTML5 / CSS3 / JavaScript (ES6+)** — no framework, no build step
- **Chart.js** — data visualisation
- **nginx** — static serving + reverse proxy to the backend (`/api`)

## Project Structure

```
.
├── index.html               # Dashboard / home
├── city-analytics.html
├── locality-analytics.html
├── developer-analytics.html
├── rental-analytics.html
├── about.html / services.html / pricing.html / blog.html / contact.html
├── demo-request.html
├── css/
│   └── style.css            # All styles
├── js/
│   ├── api.js               # API base URL + fetch helpers
│   ├── common.js            # Shared UI helpers
│   ├── main.js              # Dashboard logic
│   ├── city-analytics.js
│   ├── locality-analytics.js
│   ├── developer-analytics.js
│   └── rental-analytics.js
├── images/  favicon.svg  robots.txt  sitemap.xml
├── nginx.conf               # nginx config (serves site + proxies /api)
└── Dockerfile
```

## Backend Connection

`js/api.js` chooses the API base URL automatically:

- **Local dev** (`localhost:3000`) → `http://localhost:8000` (the local backend)
- **Production** → `window.location.origin` — i.e. same origin, with nginx
  proxying `/api/*` to the backend service (see `nginx.conf`).

No secrets are stored in the frontend. If you need a different API host,
adjust `API_BASE_URL` in `js/api.js` or the proxy target in `nginx.conf`.

## Local Development

Any static file server works. For example:

```bash
# Serve on http://localhost:3000 (matches the api.js local-dev rule)
python3 -m http.server 3000
```

Run the **Website-be** backend separately on port 8000 so the dashboard
pages can load data.

## Docker

```bash
docker build -t datra-frontend .
docker run -p 80:80 datra-frontend
```

The nginx container serves the static files and proxies `/api` to the backend.
Update the `proxy_pass` upstream in `nginx.conf` to point at your backend host.

## Security Notes

- Frontend contains **no credentials or secrets** — all data comes from the
  backend API.
- `.env`, `*.pem`, `*.key` are git-ignored as a safeguard.
