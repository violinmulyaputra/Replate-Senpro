# Database lokal Replate

Database demo memakai SQL Server 2022 Developer di Docker, bukan fixture store atau Azure SQL cloud. Data tersimpan di volume `replate-sql-data`. Port host `14339` hanya terikat ke `127.0.0.1`.

## Menjalankan lingkungan yang sudah dikonfigurasi

```sh
docker compose --env-file .env.docker -f docker-compose.local.yml up -d --wait
pnpm --filter ./backend db:check
pnpm --filter ./backend prisma:migrate
pnpm dev
```

Frontend: `http://localhost:3000`; API: `http://localhost:5052`.

- `.env.docker` menyimpan password container dan diabaikan Git.
- `backend/.env` memakai `ReplateLocal` pada `localhost:14339`.
- Konfigurasi sebelumnya disalin ke `backend/.env.azure-backup` dan `frontend/.env.azure-backup`; semuanya diabaikan Git.
- Password database dan JWT secret tidak perlu dikirim ke chat atau dimasukkan ke laporan.
- Apple Silicon: SQL Server image amd64 memerlukan emulasi. Pada pengujian ini QEMU crash, lalu berhasil setelah Docker Desktop `UseVirtualizationFrameworkRosetta` diaktifkan. Konfigurasi Docker sebelum perubahan dibackup lokal ke `/tmp/replate-docker-settings-before-rosetta.json`.

## Menyiapkan komputer tim dari awal

1. Jalankan Docker Desktop dengan dukungan emulasi amd64. Gunakan Node 24 dan pnpm 10.
2. Buat `.env.docker` berisi `MSSQL_SA_PASSWORD=<password-lokal-kuat>`; gunakan password lokal unik.
3. Jalankan compose. Buat database `ReplateLocal` menggunakan sqlcmd/container atau database client.
4. Isi `backend/.env` berdasarkan `.env.example`, dengan URL SQL Server lokal, database `ReplateLocal`, port host `14339`, user `sa`, password yang sama, `encrypt=true;trustServerCertificate=true`. Trust certificate hanya untuk sertifikat self-signed lokal.
5. Set `PORT=5052`, `FRONTEND_URL=http://localhost:3000`, dan `frontend/.env.local` `NEXT_PUBLIC_API_URL=http://localhost:5052`.
6. Jalankan `pnpm install --frozen-lockfile`, `prisma:migrate`, `db:check`, lalu `pnpm dev`.

## Pengujian integrasi nyata

```sh
pnpm --filter ./backend test:local-integration
```

Runner dibatasi secara eksplisit ke `ReplateLocal` pada `localhost:14339`. Runner membuat akun, restoran, menu, produksi, listing, dan order demo baru melalui API nyata. Hasil dicek langsung lewat Prisma terhadap SQL Server. Tidak ada fixture store. Data demo dipertahankan untuk presentasi; setiap run memakai email unik.

Hasil tanpa kredensial: `docs/evidence/local-integration/api-results.json`. Akun/password demo dan sesi disimpan lokal di `backend/.env.demo-sessions`, diabaikan Git. Jangan bagikan file sesi ini. Runner menyediakan satu order Pending untuk demonstrasi verifikasi pickup di browser; setelah demo direkam, order tersebut menjadi Completed.

## Migration yang diperbaiki

- `migration_lock.toml`: engine Prisma memakai nama internal `mssql` untuk SQL Server, sementara schema tetap memakai `sqlserver`.
- Migration profil restoran: constraint atas kolom Latitude/Longitude dijalankan melalui `sp_executesql` agar SQL Server mengompilasinya setelah kolom ditambahkan.
- Pada database lokal baru, migration sebelumnya gagal sebelum menambahkan kolom profil. Status gagal dipulihkan dengan `migrate resolve --rolled-back`, kemudian deploy ulang berhasil. Tidak ada reset database tim.
- Jika migration profil ini pernah berhasil diterapkan di lingkungan lain, jangan reset atau menjalankan ulang secara buta. Audit history/checksum migration sebelum memperbarui deployment tersebut.

## Pindah ke Azure

1. Siapkan database Azure SQL dan aturan akses jaringan.
2. Ganti `DATABASE_URL` secara lokal dengan server/database/akun Azure sebenarnya; gunakan sertifikat Azure yang terverifikasi (`trustServerCertificate=false`).
3. Jalankan migration project pada database tujuan setelah audit migration history.
4. Buat seed demo ulang bila perlu. Migration schema tidak otomatis memindahkan data lokal.
5. Jalankan ulang order–pickup, produksi, dan capture bukti terhadap Azure. Pengujian lokal tidak dianggap bukti deployment cloud atau database tim.
