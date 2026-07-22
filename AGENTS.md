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

## Frontend pages
- **`/`** — Landing page with hero, features, about, FAQ
- **`/login`** — Combined login + register (tab-based, 2-step wizard)
- **`/lupa-password`** — Forgot password
- **`/reset-password`** — Reset password
- **`/blog`** — Blog listing with filter, search, pagination, inline expand
- **`/blog/[slug]`** — Blog detail page (hero, gallery, content, share, related)
- **`/syarat-ketentuan`** — Terms & conditions
- **`/kebijakan-privasi`** — Privacy policy
- **`/admin/*`** — Admin dashboard & CRUD (pekebun, program, lahan, TBS, users, blog, etc.)
- **`/verifikator/*`** — Verifikator dashboard & verifikasi flow
- **`/pekebun/*`** — Pekebun dashboard & self-service (profil, lahan, program, TBS)

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

## Deployment (Docker)

### VPS Info
- **Hostname**: `srv1842937.hstgr.cloud`
- **IP**: `31.97.50.22` (IPv4) / `2a02:4780:59:2338::1` (IPv6)
- **OS**: Ubuntu 24.04 LTS, KVM 1
- **Akses**: `ssh root@31.97.50.22`
- **SSH Public Key**: `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINN9AhWV1B0JS+pW2bu01lgkjaIQqG29S78ICITOlPvh sukmawijaya160208@gmail.com`
- **Root password**: Ada di memory AI (mention aja "pake password VPS")
- **Domain**: `kud-sari-subur.my.id`
- **DNS Managed via**: Hosting panel (bukan di VPS)
- **Nameserver**: `ns1.dns-parking.com` / `ns2.dns-parking.com`
- **VPS Hostname**: `srv1842937.hstgr.cloud`
- **A Record**: `31.97.50.22` → `kud-sari-subur.my.id`

### Docker Containers
| Container | Image | Port | Status | RAM |
|---|---|---|---|---|
| `kud-backend` | Laravel 12 | `8000:8000` | Running | ~52MB |
| `kud-frontend` | Next.js 16 | `3000:3000` | Running | ~32MB |

Semua service jalan via Docker Compose (`docker compose`), bukan langsung di host.

### Deploy commands (Docker)
> **Note**: `docker-compose.yml` ada di VPS (bukan di repo). Cari dulu lokasinya setelah SSH.

```bash
# SSH
ssh root@31.97.50.22

# Cari lokasi compose file
find / -name "docker-compose*" -type f 2>/dev/null

# Pull latest + rebuild
cd /path/ke/compose
git pull origin main
docker compose up -d --build

# Check status
docker compose ps
docker compose logs -f
```

## Matt Pocock Skills (`.opencode/skills/`)

19 engineering skills from [mattpocock/skills](https://github.com/mattpocock/skills) (OpenCode fork). Load via `skill({ name: "..." })`.

| Category | Skills |
|---|---|
| **Planning** | `write-a-prd`, `prd-to-plan`, `prd-to-issues`, `grill-me`, `design-an-interface`, `request-refactor-plan` |
| **Development** | `tdd`, `triage-issue`, `improve-codebase-architecture`, `migrate-to-shoehorn`, `scaffold-exercises` |
| **Tooling** | `setup-pre-commit`, `git-guardrails-claude-code`, `github-triage`, `qa` |
| **Writing** | `write-a-skill`, `edit-article`, `ubiquitous-language`, `obsidian-vault` |

<!-- opencode-mem -->
Gunakan `memory()` tool untuk manage memory secara manual:
- `memory({ mode: "add", content: "..." })` — tambah memory
- `memory({ mode: "search", query: "..." })` — cari memory
- `memory({ mode: "list", limit: 10 })` — lihat memory terbaru
- `memory({ mode: "profile" })` — lihat profil user

Auto-capture + inject memories via opencode-mem plugin.
<!-- /opencode-mem -->

<!-- context-limit -->
## Context Limit Protocol

Jika Anda mulai mendekati batas konteks:

1. **Simpan progress** ke opencode-mem:
   ```js
   memory({ mode: "add", content: "Task X progress: ..." })
   ```

2. **Buat continuation file** di `.opencode/continuations/<task-name>.cont.md`:
   - State saat ini (file yang sudah diubah, yang belum)
   - Daftar task pending + prioritas
   - Konteks penting (stack, branch, env)
   - Hasil command terakhir

3. **Panggil task berikutnya** — continuation file akan di-load otomatis.

4. **Gunakan Superpowers / Matt Pocock skills** untuk task kompleks yang perlu breakdown.
<!-- /context-limit -->

## Superpowers Skills (Plugin)

Available via `skill({ name: "..." })`:

| Skill | Fungsi |
|---|---|---|
| `brainstorm` | Generate ide / solusi untuk masalah |
| `plan` | Breakdown task besar → sub-task kecil |
| `subagent-work` | Delegasi task ke sub-agent paralel |
| `review` | Review hasil kerja sebelum final |

## Git & Secret Management

`opencode.json` contains real secrets (GitHub PAT, Stitch API key).
NEVER commit this file with real values — GitHub Push Protection will block it.

### Workflow
1. **Local development**: `opencode.json` boleh berisi secrets asli (biar MCP jalan)
2. **Before commit**: Ganti secrets jadi placeholder (`YOUR_GITHUB_PAT`, `YOUR_STITCH_API_KEY`)
3. **Push**: Aman karna cuma placeholder yang di-commit
4. **Deploy VPS**: SSH, git pull, lalu langsung inject secrets ke `/var/www/kud/opencode.json`

### Git commands
```bash
# === COMMIT (safe - skip opencode.json) ===
git add AGENTS.md frontend/ backend/ deploy/ docker/ docker-compose.yml
git commit -m "pesan"

# === DEPLOY VPS ===
ssh root@31.97.50.22
cd /var/www/kud
git pull
sed -i 's/YOUR_GITHUB_PAT/real_token/' opencode.json
sed -i 's/YOUR_STITCH_API_KEY/real_key/' opencode.json
systemctl restart kud-frontend kud-backend kud-queue
```

### Current secrets
Real values disimpan di memory AI (opencode-mem). Kalo butuh deploy, tinggal bilang "deploy VPS" — AI tau inject secretnya.
