---
name: kud-desa-tegal-sari
description: Panduan pengembangan sistem KUD Desa Tegal Sari — full stack
---

# KUD Desa Tegal Sari

## Stack
- **Frontend**: Next.js 16 + React + JavaScript + Tailwind CSS v4
- **Backend**: Laravel 12 + PHP
- **Database**: MySQL
- **API**: REST

## Role
1. **Admin** — Full access (CRUD semua data, pengaturan, laporan)
2. **Verifikator** — Verifikasi data (terima/tolak/perbaiki), tanpa edit/hapus/tambah
3. **Pekebun** — Isi profil, lahan, daftar program, input TBS

## Struktur utama
- `frontend/` — Next.js app
- `backend/` — Laravel app
- `database/` — SQL schema

## Upload files
Semua upload tersimpan di `backend/storage/app/public/`:
- `profil/` — foto profil semua role
- `ktp/`, `kk/`, `foto-pekebun/` — data pekebun
- `surat-tanah/`, `surat-keterangan/` — data lahan

## Aturan coding
- JavaScript, bukan TypeScript
- Tailwind CSS v4 (`@import "tailwindcss"`)
- REST API, bukan GraphQL
- Semua response JSON
