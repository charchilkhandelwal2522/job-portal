# Job Portal

React job board with **Redux Toolkit**, **React Router**, **Context** (toasts), and a **REST API** via [json-server](https://github.com/typicode/json-server) (`db.json`).

## Features

- Login / register (stored in API)
- Job listing with search, filters, and pagination
- Apply to jobs; **My applications** dashboard
- Admin: manage jobs and view applications

## Run locally

```bash
npm install
cp .env.example .env
npm run dev:full
```

- App: [http://localhost:5173](http://localhost:5173)  
- API: [http://localhost:3001](http://localhost:3001) (from `.env` → `VITE_API_URL`)

Demo users (see `db.json`): `user@demo.com` / `user123`, `admin@demo.com` / `admin123`.

## Scripts

| Command        | Description                          |
|----------------|--------------------------------------|
| `npm run dev`  | Vite dev server only                 |
| `npm run api`  | json-server only                     |
| `npm run dev:full` | Vite + json-server (concurrently) |
| `npm run build`| Production build                     |

## Stack

React 19, Vite, Redux Toolkit, React Router, Axios, json-server.
