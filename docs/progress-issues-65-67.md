# Progress issue #65–67 — 9 Oktober 2026

Basis implementasi: `origin/main` commit `0c5e532`. Runtime: Node.js 24, pnpm 10.

## Status dan batas bukti

| Issue | Hasil | Yang masih diperlukan |
| --- | --- | --- |
| #65 — order/pickup dengan database tim | Diagnostic read-only dijalankan. Prisma gagal `ESOCKET`; DNS server SQL gagal `ENOTFOUND`. Script `db:check` mengonfirmasi blocker yang sama. | Konfigurasi server Azure SQL tim yang aktif dan dapat di-resolve, lalu pengujian end-to-end asli. |
| #66 — bukti demo order/pickup | Matriks uji dan urutan capture siap di bawah. | Screenshot dan video dari pengujian database asli setelah #65 berhasil. |
| #67 — production record/histori | Form lama digunakan ulang, validasi jumlah konsisten, API dan halaman histori baru. | Pengujian persistensi pada Azure SQL tim setelah koneksi tersedia. |

Issue #65 dan #66 belum selesai. Bukti QA berlabel fixture untuk #67 tidak membuktikan integrasi database asli dan tidak boleh dipakai sebagai demo asli order/pickup.

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

Semua kasus berikut berstatus **belum dijalankan pada database tim**. Gunakan akun/data uji khusus, tanpa mengubah pesanan operasional. Catat ID data uji dan bersihkan hanya data tersebut setelah bukti tersimpan.

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

Belum ada screenshot atau video order/pickup database asli pada pengerjaan ini, karena DNS database menghalangi koneksi.

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
- Screenshot fixture #67 ada di `docs/evidence/issue-67/`; tidak ada bukti persistensi database asli.
