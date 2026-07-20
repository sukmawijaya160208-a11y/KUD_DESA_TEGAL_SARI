---
name: upload-manager
description: Handle upload file otomatis untuk KTP, KK, foto, surat tanah
---

# Upload Manager

## Struktur folder penyimpanan
```
storage/app/public/
├── profil/{user_id}.jpg
├── ktp/{pekebun_id}.jpg
├── kk/{pekebun_id}.jpg
├── foto-pekebun/{pekebun_id}.jpg
├── surat-tanah/{lahan_id}.jpg
└── surat-keterangan/{lahan_id}.jpg
```

## Rules
- Format file: jpg, png, pdf (max 2MB)
- Nama file: `{pekebun_id}_{timestamp}.{ext}`
- Simpan path di database, bukan file binary
- Hapus file lama saat update
