# Uji status pesanan dan pickup (#52)

Gunakan Node.js 24. Dari root repo jalankan `pnpm lint`, `pnpm test`, dan `pnpm build`.

Untuk uji integrasi, konfigurasi env backend/database sesuai README, lalu jalankan `pnpm dev`. Frontend harus menunjuk ke API melalui `NEXT_PUBLIC_API_URL`.

1. Login customer, checkout listing yang tersedia. Tombol **Lihat Status Pesanan** membuka detail dengan status **Menunggu pickup**, estimasi waktu, dan kode pickup. Riwayat tersedia pada navigasi **Pesanan**.
2. Login owner restoran tersebut. Buka **Pesanan**, coba filter restoran/status, lalu **Lihat**. Kode kosong atau selain 12 karakter heksadesimal ditolak form.
3. Masukkan kode 12 karakter yang salah: pesan kesalahan muncul dan pesanan tetap menunggu pickup.
4. Masukkan kode customer yang benar: feedback sukses muncul, tabel dan detail langsung menjadi **Selesai**, form verifikasi menghilang. Buka ulang detail: waktu verifikasi tetap ada.
5. Customer memperbarui status atau kembali ke tab aplikasi: status menjadi **Selesai** dan kode pickup disembunyikan.
6. Akun tanpa pesanan menampilkan empty state. Matikan API lalu perbarui: pesan error tampil, hidupkan API dan coba lagi. Buka detail dengan `?id=invalid`: tautan tidak valid ditolak.
7. Tanpa sesi, halaman pesanan mengarah ke login. Akun customer/owner lain tidak boleh mengakses order tersebut; kontrol akses tetap ditegakkan API.

## Bukti pemeriksaan implementasi

- Lint dan build lulus; 15 tes backend dan 1 tes frontend lulus pada Node.js 24.
- Alur browser diuji dengan API Express lokal dan store fixture: riwayat/detail customer, loading, empty state kedua role, error owner, kode salah, verifikasi sukses, status tabel langsung berubah, status customer selesai/kode tersembunyi, dan tautan tidak valid.
- Layout customer diuji pada viewport 390 px: tidak ada overflow horizontal; gambar dan ikon berhasil dimuat.
- Pengujian browser memakai fixture, bukan Azure SQL. Ulangi langkah integrasi di atas dengan database dan akun tim sebelum demo/deployment.
