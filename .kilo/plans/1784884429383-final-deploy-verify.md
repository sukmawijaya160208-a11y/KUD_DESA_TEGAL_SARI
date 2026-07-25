# Plan: Final Verification & Deployment

## Context
Bug fix + redesign sudah selesai di local dan build berhasil. Sekarang butuh deploy ke VPS dan verifikasi.

## Yang Sudah Selesai (Local)
- `frontend/src/app/pekebun/program/page.jsx` — `sudahDaftar` filter diperbaiki (pending/verified only)
- `frontend/src/app/admin/program/page.jsx` — import `formatDateShort` ditambahkan, date format disamakan
- `frontend/src/app/pekebun/program/daftar/[id]/page.jsx` — 3-step wizard di-redesign jadi single-page accordion (lahan, dokumen, surat, ttd + sticky CTA)
- `npm run build` — **berhasil** (0 errors)

## Yang Harus Dilakukan Berikutnya

### 1. Commit & Push ke GitHub
```bash
git add frontend/src/app/admin/program/page.jsx frontend/src/app/pekebun/program/page.jsx frontend/src/app/pekebun/program/daftar/\[id\]/page.jsx
git commit -m "fix: sinkron sudahDaftar, formatDateShort import, redesign accordion daftar program"
git push
```

### 2. Deploy ke VPS
```bash
ssh root@31.97.50.22
cd /var/www/kud
git pull
docker compose up -d --build --force-recreate
docker compose ps
```

### 3. Verifikasi di Browser
- [ ] Admin `/admin/program` — tanggal selesai muncul tanpa error `formatDateShort is not defined`
- [ ] Pekebun `/pekebun/program` — rejected user bisa lihat tombol "Daftar" lagi
- [ ] Pekebun `/pekebun/program/daftar/[id]` — accordion render (lahan, dokumen, surat/ttd), CTA sticky di mobile
- [ ] Hard refresh browser (`Ctrl+Shift+R`) untuk bersihkan stale chunk cache

### 4. Rollback Plan
Jika ada error di VPS:
```bash
cd /var/www/kud
git revert HEAD
docker compose up -d --build --force-recreate
```

## Catatan
- Tidak ada perubahan backend — API endpoint tetap sama
- Tidak ada migration — database tidak diubah
- Backend CORS sudah di-set `FRONTEND_URL=http://localhost:3000`
