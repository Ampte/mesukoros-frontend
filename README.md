# Frontend (MesuKoros)

React + Vite app for MesuKoros. This folder is fully standalone and can be pushed to its own GitHub repository.

## Local run

```bash
npm install
npm run dev
```

By default this app calls `/api`.
For separate backend hosting set `VITE_API_URL`.

## Environment
Copy `.env.example` to `.env` and set:

- `VITE_API_URL=https://your-backend-domain.com/api`

## Build

```bash
npm run build
npm run preview
```

## Push frontend as separate repo

```bash
cd frontend
git init
git add .
git commit -m "Frontend initial"
git branch -M main
git remote add origin https://github.com/<your-user>/<frontend-repo>.git
git push -u origin main
```
