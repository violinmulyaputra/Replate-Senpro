# Progress issue #65–67 — 9 Oktober 2026

Basis implementasi: `origin/main` commit `0c5e532`. Runtime: Node.js 24, pnpm 10.

## Status dan batas bukti

| Issue | Hasil | Yang masih diperlukan |
| --- | --- | --- |
| #65 — order/pickup dengan database tim | Integrasi SQL Server lokal Docker lulus: order, stok, pickup, persistensi, dan isolasi owner/customer. Dua blocker migration diperbaiki. | Verifikasi Azure SQL tim tetap menyusul; hasil lokal tidak dianggap integrasi cloud. |
| #66 — bukti demo order/pickup | Screenshot dan video end-to-end database lokal tersedia, dari checkout hingga Completed. | Capture Azure bila deliverable akhir mensyaratkan database tim/cloud. |
| #67 — production record/histori | Form, validasi, API/filter histori, persistensi SQL lokal, serta browser QA lulus. | Ulangi deployment/integrasi pada Azure. |

Database lokal disiapkan setelah pengguna memilih pengerjaan lokal terlebih dahulu. Bukti baru di `docs/evidence/local-integration/` memakai SQL Server nyata, bukan fixture. Bukti fixture awal #67 tetap diberi label fixture. Instruksi menjalankan ulang dan berpindah ke Azure ada di `docs/local-database.md`.

## Menjalankan ulang

Konfigurasi `backend/.env` secara lokal; jangan masukkan password, JWT secret, connection string, atau token ke laporan. Frontend memakai `NEXT_PUBLIC_API_URL` dari `frontend/.env.local`.

```sh
pnpm install --frozen-lockfile
pnpm --filter ./backend db:check
pnpm lint
pnpm test
pnpm build
pnpm dev
```

`dev` dan `start` backend sekarang memuat `.env` bila tersedia. Prisma config juga memuat `.env`; environment yang sudah diekspor tetap diutamakan. `db:check` hanya melakukan DNS lookup dan `SELECT 1`, tidak menulis database.

## Matriks pengujian database asli (#65)

Kasus order, stok habis, pickup salah/benar/sudah dipakai, persistensi Completed, dan kepemilikan owner/customer sudah **lulus pada SQL Server lokal**. Kasus ini belum dijalankan pada Azure SQL tim. Gunakan akun/data uji khusus, tanpa mengubah pesanan operasional. Catat ID data uji dan bersihkan hanya data tersebut setelah bukti tersimpan.

| Kasus | Langkah | Ekspektasi dan bukti |
| --- | --- | --- |
| Order berhasil | Customer checkout listing dengan stok tersedia | HTTP 201; stok berkurang sesuai quantity; order Pending dan kode pickup tersedia. Capture stok sebelum/sesudah dan detail order. |
| Stok habis | Checkout listing tanpa stok atau quantity melebihi stok | HTTP 409; tidak ada order baru atau pengurangan stok tambahan. |
| Kode salah | Owner submit 12 karakter hex yang berbeda dari kode asli | HTTP 400; order/pickup tetap Pending dan belum ada verifiedAt. |
| Kode benar | Owner submit kode asli | HTTP 200; order Completed, pickup Verified, verifiedAt tersimpan. |
| Kode sudah dipakai | Submit ulang kode yang sudah berhasil | HTTP 409; tidak ada verifikasi kedua atau perubahan stok. |
| Status tersimpan | Reload owner/customer setelah pickup | Status Selesai bertahan; kode pickup customer disembunyikan. |
| Batas kepemilikan | Owner/customer lain membuka ID order uji | HTTP 404 untuk resource milik akun lain; tanpa token HTTP 401. |

## Urutan capture untuk #66

1. Customer: riwayat order dan detail Pending dengan kode pickup.
2. Owner: daftar order, detail, dan kegagalan kode salah.
3. Owner: verifikasi benar, status Selesai, dan waktu verifikasi.
4. Customer: reload detail, status Selesai, kode disembunyikan.
5. Rekam satu video singkat alur yang sama. Gunakan akun uji; sembunyikan DevTools/header authorization dan konfigurasi environment.

Screenshot dan video database asli **lokal** sekarang tersedia di `docs/evidence/local-integration/`. DNS konfigurasi Azure lama masih merupakan blocker pengujian cloud.

## Kontrak histori produksi (#67)

- `GET /api/owner/restaurants/:restaurantId/production/history`
- Filter opsional: `menuId`, `from`, `to` (tanggal ISO `YYYY-MM-DD`, inklusif).
- Urutan: productionDate terbaru, kemudian productionRecordId terbaru.
- Scope: hanya restoran milik owner terautentikasi; menu restoran lain tidak menghasilkan data.
- Tanggal tidak valid, rentang terbalik, dan menuId tidak valid menghasilkan HTTP 400.
- Halaman `/owner/production/` menyediakan pilihan restoran, menu, rentang tanggal, reset, retry, loading, empty, dan error state.
- Form `/owner/menu/` tetap menyimpan melalui endpoint PUT yang ada. Kuantitas integer tidak negatif dan `soldQuantity + surplusQuantity === producedQuantity`, sesuai `AI/ai-dataset-schema-production-recommendation.md`.
- Field API camelCase dipetakan ke kolom Prisma yang sudah ada; tidak ada migration baru. `recordedAt` tetap timestamp pembuatan record; pembaruan menu/tanggal yang sama memakai upsert.

## Hasil verifikasi lokal

- `pnpm lint`, `pnpm test` (15 backend + 1 frontend), dan `pnpm build` lulus pada Node 24.
- Regression test sebelumnya menghasilkan HTTP 200 untuk data produksi tidak konsisten; setelah perbaikan menghasilkan HTTP 400.
- Test API mencakup filter histori, kepemilikan, token wajib, tanggal tidak valid, rentang terbalik, serta kuantitas tidak negatif dan integer.
- QA Chrome terisolasi pada production build dengan fixture lulus: render histori, filter menu/tanggal/restoran, empty/error/retry, sesi kosong, dan viewport 390 px tanpa overflow halaman atau JavaScript page error.
- Screenshot fixture awal #67 ada di `docs/evidence/issue-67/`. Bukti baru SQL Server lokal mencakup persistensi produksi, filter histori, stok berkurang, order Completed, dan pickup Verified.
- Container lokal healthy, kelima migration berhasil diterapkan, deploy ulang tidak memiliki pending migration, dan `db:check` OK.
- Pengujian browser memakai API asli tanpa route intercept: checkout, riwayat, kode pickup, verifikasi salah/benar, status selesai, histori produksi, dan mobile.
- SQL Server x64 berhasil dijalankan setelah Rosetta Docker diaktifkan; QEMU sebelumnya crash. Metadata migration provider dan kompilasi constraint profil restoran diperbaiki berdasarkan kegagalan nyata.
