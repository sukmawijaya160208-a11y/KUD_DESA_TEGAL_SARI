<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# KUD Desa Sari Subur

## Stack
- **Frontend**: Next.js 16.2 + React 19.2 + TypeScript (strict) — in `frontend/`
- **Backend**: Laravel 12 + PHP 8.2+ — in `backend/`
- **Database**: SQLite (default), Sanctum API tokens (Bearer in localStorage)
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"`, not `@tailwind`), PostCSS
- **Linting**: ESLint flat config (`frontend/eslint.config.mjs`), NOT `next lint`

## Repo structure
```
frontend/      Next.js app
backend/       Laravel API
```
Not a monorepo — each has its own `package.json`/`composer.json`, no workspaces.

## Commands
```bash
# Frontend (cwd: frontend/)
npm run dev      # dev server at localhost:3000
npm run build    # production build
npm run lint     # ESLint

# Backend (cwd: backend/)
composer run dev     # concurrently: artisan serve + queue + logs + vite
composer run setup   # composer install → .env → key:generate → migrate
composer run test    # PHPUnit via artisan (in-memory SQLite)
```

## Dev workflow
- **Both services must be running**. Frontend proxies `/api/*` → `http://127.0.0.1:8000/api/*` via `next.config.ts` rewrites.
- Backend CORS: set `FRONTEND_URL=http://localhost:3000` in `backend/.env`.
- Backend first-time setup: copy `.env.example` → `.env`, run `composer run setup`.

## Frontend quirks
- **All pages use `.jsx`**, not `.tsx` (despite TypeScript being configured).
- **Auth**: Bearer token stored in `localStorage` (`token`, `user`). The fetch wrapper in `src/lib/api.js` auto-redirects to `/login` on 401.
- **UI language**: Indonesian throughout.
- **Animation libs**: framer-motion, animejs, gsap, three.js, lottie-react.
- **No frontend test framework** present.
- **Roles**: `admin`, `verifikator`, `pekebun` — each with separate route groups in `src/app/`.
- **API client**: Custom `api` object in `@/lib/api` — `.admin.*`, `.verifikator.*`, `.pekebun.*`, `.auth.*`, `.upload()`, `.hargaTbs.*`, `.notifikasi.*`.
- **Tailwind v4**: Uses `@theme inline {}` in `globals.css` for custom tokens (`--color-primary`, `--font-heading`, etc.).

## Backend quirks
- **SQLite** default database (`DB_CONNECTION=sqlite`). No MySQL/PostgreSQL setup.
- **Auth**: Laravel Sanctum with Bearer tokens. Role middleware at `app/Http/Middleware/CheckRole.php`.
- **PHP code style**: Laravel Pint (`vendor/bin/pint`).
- **Tests**: PHPUnit with in-memory SQLite. Test suites: `Unit`, `Feature`.
- **Queue**: database driver (`QUEUE_CONNECTION=database`). Run `php artisan queue:work` to process.
- **Upload endpoints**: KTP, KK, foto pekebun, surat tanah, surat keterangan, logo, etc. — all under `/api/upload/*`.

## Next.js 16 quirks
- **Async Request APIs**: `params`, `searchParams`, `cookies()`, `headers()` must be `await`-ed (no sync access).
- **Turbopack** is default bundler (no `--turbopack` flag needed).
- **Parallel routes** require explicit `default.js`.
- **`use cache`** replaces `unstable_` cache APIs; `cacheLife`/`cacheTag` are stable.
- **Node.js 20.9+** required.

## Deployment

- **Domain**: `kud-sari-subur.my.id` (pointing ke VPS)
- **VPS**: `ssh root@31.97.50.22` — Ubuntu 24.04, KVM 1
- **Nginx config**: `deploy/nginx-kud.conf` → `/etc/nginx/sites-available/kud-sari-subur.my.id`
- **SSL**: Let's Encrypt via Certbot (`/etc/letsencrypt/live/kud-sari-subur.my.id/`)
- **Backend**: Laravel di `/var/www/kud/backend`, serve via PHP-FPM
- **Frontend**: Next.js di `/var/www/kud/frontend`, build → `npm run build`, serve via Nginx reverse proxy
- **Queue**: `php artisan queue:work` via supervisor/systemd
- **Database**: SQLite di `/var/www/kud/backend/database/database.sqlite`

### Deploy commands
```bash
# SSH & pull
ssh root@31.97.50.22
cd /var/www/kud
git pull origin main

# Backend
cd backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Frontend
cd ../frontend
npm ci --omit=dev
npm run build

# Restart services
systemctl reload nginx
systemctl restart kud-queue  # if supervisor/systemd
```

## Matt Pocock Skills (`.opencode/skills/`)

19 engineering skills from [mattpocock/skills](https://github.com/mattpocock/skills) (OpenCode fork). Load via `skill({ name: "..." })`.

| Category | Skills |
|---|---|
| **Planning** | `write-a-prd`, `prd-to-plan`, `prd-to-issues`, `grill-me`, `design-an-interface`, `request-refactor-plan` |
| **Development** | `tdd`, `triage-issue`, `improve-codebase-architecture`, `migrate-to-shoehorn`, `scaffold-exercises` |
| **Tooling** | `setup-pre-commit`, `git-guardrails-claude-code`, `github-triage`, `qa` |
| **Writing** | `write-a-skill`, `edit-article`, `ubiquitous-language`, `obsidian-vault` |
