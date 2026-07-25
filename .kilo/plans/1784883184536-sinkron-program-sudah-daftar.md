# Plan: Fix `sudahDaftar` + Redesign Flow Daftar Program Pekebun

## 1. Bug Fix: Sinkronisasi `sudahDaftar`

### File: `frontend/src/app/pekebun/program/page.jsx`

**Baris 103** — ubah:
```javascript
const sudahDaftar = programSaya.some((s) => s.program_kud_id === p.id);
```
menjadi:
```javascript
const sudahDaftar = programSaya.some((s) => s.program_kud_id === p.id && ['pending', 'verified'].includes(s.status));
```

**Baris 308** — ubah:
```javascript
sudahDaftar={detailProgram ? programSaya.some((s) => s.program_kud_id === detailProgram.id) : false}
```
menjadi:
```javascript
sudahDaftar={detailProgram ? programSaya.some((s) => s.program_kud_id === detailProgram.id && ['pending', 'verified'].includes(s.status)) : false}
```

**Catatan**: `daftar/[id]/page.jsx` sudah konsisten dengan backend. Tidak diubah.

---

## 2. Redesign: `pekebun/program/daftar/[id]/page.jsx`

### Ubah dari 3-step wizard menjadi single-page accordion flow.

### Struktur baru (top to bottom):

```
Header Program (nama, jenis, kuota, tanggal)
Status Banner (sudah daftar / belum)

[Section 1: Pilih Lahan]  ← accordion, always open
  - Visual cards instead of radio list
  - Show alamat, luas, jenis surat, nomor surat
  - Selection state: border primary + check icon
  - Empty state: link ke /pekebun/lahan

[Section 2: Dokumen Persyaratan]  ← accordion, always open
  - Cards per dokumen dengan icon, label, status
  - Source badge: "Dari Profil" / "Dari Lahan" / "Upload Manual"
  - Actions: [Lihat] [Ganti/Upload]
  - Progress bar: X/Y lengkap
  - Success banner jika semua lengkap

[Section 3: Surat Pernyataan]  ← accordion, collapsible
  - Hanya tampil jika program.aktifkan_surat === true
  - Setiap surat dalam expandable card
  - Preview surat di dalam card (pakai DocumentViewer)
  - Checkbox persetujuan per surat
  - Badge status: ✓ Disetujui / Belum

[Section 4: Tanda Tangan Digital]  ← accordion, collapsible
  - Hanya tampil jika program.aktifkan_surat === true
  - SignaturePad dengan clear button
  - Label: "Tanda tangani di sini untuk mengonfirmasi"

[Sticky Bottom CTA]
  - Desktop: inline di bawah form
  - Mobile: fixed bottom bar
  - Button disabled jika !canSubmit
  - Show validation summary tooltip
```

### Perubahan teknis di `daftar/[id]/page.jsx`:

1. **Hapus state `step`** dan semua `step === N` conditional rendering.
2. **Ganti jadi state `openSections`** (object dengan keys `lahan`, `dokumen`, `surat`, `ttd`).
3. **Buat komponen section helpers**:
   - `SectionHeader({ title, icon, isOpen, onToggle, badge })`
   - `LahanCard({ lahan, selected, onSelect })`
   - `DokumenCard({ jenis, label, status, sumber, url, onView, onUpload, uploading })`
   - `SuratCard({ judul, isi, checked, onToggle, index })`
4. **Validasi real-time**:
   - `canSubmit` tetap sama (sudah ada di baris 106)
   - Tambah mini validation indicator per section
   - CTA button disabled state dengan tooltip
5. **Styling**:
   - Gunakan Tailwind v4 classes yang sudah ada di projek
   - Konsisten dengan design system `ProgramDetail.jsx`
   - Mobile-first, max-width container

### Data flow tetap sama:
- `useEffect` load data dari 4 endpoint (program, profil, lahan, pengaturan)
- `handleSubmit` tetap sama (collect dokumen + submit)
- `docData` useMemo tetap sama

---

## 3. Validasi

### Bug Fix
- `npm run lint` di `frontend/`
- Manual test: rejected → tombol "Daftar" muncul kembali

### Redesign
- Visual regression: desktop + mobile
- Flow test: daftar program baru end-to-end
- Edge case: program tanpa persyaratan, tanpa surat, lahan kosong
- `npm run lint` + `npm run build` di `frontend/`

---

## 4. Catatan

- **Tidak mengubah backend** — semua API endpoint tetap sama
- **Tidak mengubah model/route** — URL tetap `/pekebun/program/daftar/[id]`
- **Breaking change**: struktur JSX di `daftar/[id]/page.jsx` di-restructure total
- **Dependencies**: tetap pakai komponen yang sudah ada (`Button`, `SignaturePad`, `DocumentViewer`, `ToastProvider`)
