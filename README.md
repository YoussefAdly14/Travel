# Travelling Website (CSEN503)

A simple Node.js + Express web app with EJS views for exploring travel destinations, user authentication, searching destinations, and managing a personal "Want To Go" list. MongoDB stores user accounts and lists.

## Features
- Authentication: register, login, logout (session-based)
- Protected views: home, categories, destination pages
- Fuzzy search: find destinations with tolerant matching
- Want-To-Go list: add, view, remove, clear
- Health and DB test endpoints for quick checks

## Tech Stack
- Runtime: Node.js (Express)
- Views: EJS
- DB: MongoDB (native driver)
- Auth: `express-session`
- Search: `fuse.js`

## Repository Structure
- backend/: Express app, routes, middleware, DB connection
- views/: EJS templates (pages like `home`, `login`, destinations, etc.)
- public/: Static assets (CSS/JS/images)

## Prerequisites
- Node.js 18+ (LTS recommended)
- A MongoDB connection string

## Environment Variables
Create a `.env` file in `backend/` with:

```
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
SESSION_SECRET=change_me
PORT=4000
```

- `MONGO_URI`: Required for DB-backed features (registration, want-to-go, etc.).
- `SESSION_SECRET`: Secret for session signing.
- `PORT`: Set to 4000 for this project.

Note: The server can start without a DB (it will set `dbReady=false`), but routes requiring the DB will not function.

## Installation & Run (Windows)
Run commands from the `backend` folder (the server lives there):

```powershell
cd "backend"
npm install
npm run dev   # starts with nodemon
# or
npm start     # plain node
```

If you accidentally run from the repo root and see "missing script: dev", switch to `backend/` as above.

App will be available at:
- http://localhost:4000
- Health check: http://localhost:4000/health

## Shared Database Access
For collaborators to run the app without local DB setup, provide a MongoDB connection string. I will insert the actual values once you confirm them.

```
MONGO_URI=mongodb+srv://<YOUR_USER>:<YOUR_PASSWORD>@<YOUR_CLUSTER>/<YOUR_DB>?retryWrites=true&w=majority
```

Please share:
- DB user: <YOUR_USER>
- DB password: <YOUR_PASSWORD>
- Cluster host: <YOUR_CLUSTER> (e.g., cluster0.abcde.mongodb.net)
- Database name: <YOUR_DB> (e.g., myDB)

Security note: Committing real credentials is risky. Prefer a read-only user or temporary credentials. If you still want them embedded, I can place the exact string here per your request.

## Key Endpoints
- Auth
  - GET `/login` → login page
  - POST `/login` → authenticate and set session
  - GET `/register` and `/registration` → registration page
  - POST `/register` and POST `/registration` → create user
  - GET `/logout` → clear session and redirect to login
- Pages (auth required)
  - GET `/home` → home page
  - GET `/category/:category` → renders an EJS view named after `:category`
  - GET `/destination/:dest` → renders an EJS view named after `:dest`
- Search (auth required)
  - ALL `/search` → fuzzy search destinations; accepts `q` or `Search` as query/body
- Want-To-Go (auth required)
  - GET `/wanttogo` → view current user list
  - POST `/destination/:dest/add` → add a destination
  - POST `/wanttogo/remove/:dest` → remove a destination
  - POST `/wanttogo/clear` → clear list
- Utilities (no auth)
  - GET `/health` → `{ ok: true, dbReady: boolean }`
  - GET `/dbtest` → attempts simple collection operations (requires DB)

## Development Notes
- Sessions: Pages are protected globally except `/login`, `/register`, `/logout`, static assets, and `/` redirect logic.
- DB Connection: Established once on startup and stored in `app.locals.db`. Server still starts if DB connect fails; check `/health`.
- Templates: The app passes `username` where relevant; update views accordingly if you add pages.
