---
name: log-skills
description: bersikah log yang sudah dikerjakan
license: MIT
compatibility: opencode
metadata:
  audience: maintainers
---

## What I do

- tambahkan log yang sudah dikerjakan di file progress.txt

## When to use me

setelah selesai mengerjakan suatu tugas, gunakan skill ini untuk menambahkan log di file progress.txt agar dapat memantau progres pekerjaan yang sudah dilakukan.

- setiap kali ada tugas yang selesai dikerjakan, jalankan skill ini untuk menambahkan log di file progress.txt

## HOW I DO IT

1. read 'progress.txt' file, untuk melihat log terakhir
2. append entry baru ke 'progress.txt' bagian bawah
3. grub berdasarkan tanggal, gunakan bullet point 
4. format : aksi (modifikasi, penambahan, penghapusan,fied) - nama file - tanggal - deskripsi singkat

## LOG FORMAT

## 2026-07-17

###
### Kategori Task
- Modified `components/TodoList.tsx` - Tambah font size text-lg
- Created `components/Header.tsx` - Komponen header baru
- Fixed bug di `app/page.tsx` - Perbaiki hydration error
- Fixed `ModuleNotFoundError` in `Task 2.1` - Medium - 8 min

PENTING: Selalu append, jangan overwrite file yang sudah ada
