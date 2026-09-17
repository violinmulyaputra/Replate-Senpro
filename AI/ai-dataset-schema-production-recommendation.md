# Skema Dataset — AI Production Recommendation (Replate)

Disesuaikan dengan ERD Replate. Dataset training dibentuk dengan menggabungkan tabel `PRODUCTION_RECORD`, `MENU`, dan `SURPLUS_LISTING`, lalu hasil model disimpan kembali ke tabel `PRODUCTION_RECOMMENDATION`.

## 1. Kolom dari `PRODUCTION_RECORD` (sumber utama)

| No | Nama Kolom | Tipe Data | Sumber (tabel ERD) | Keterangan |
|----|-----------|-----------|---------------------|------------|
| 1 | `production_record_id` | int (PK) | PRODUCTION_RECORD | ID unik record produksi |
| 2 | `menu_id` | int (FK) | PRODUCTION_RECORD | Referensi ke MENU |
| 3 | `production_date` | date | PRODUCTION_RECORD | Tanggal produksi |
| 4 | `produced_quantity` | int | PRODUCTION_RECORD | Jumlah diproduksi |
| 5 | `sold_quantity` | int | PRODUCTION_RECORD | Jumlah terjual normal |
| 6 | `surplus_quantity` | int | PRODUCTION_RECORD | Jumlah surplus — **sudah tersedia langsung**, tidak perlu dihitung ulang |
| 7 | `recorded_at` | datetime | PRODUCTION_RECORD | Timestamp pencatatan |

## 2. Kolom dari `MENU` (join via `menu_id`)

| No | Nama Kolom | Tipe Data | Sumber (tabel ERD) | Keterangan |
|----|-----------|-----------|---------------------|------------|
| 8 | `restaurant_id` | int (FK) | MENU | Diperoleh dari join `PRODUCTION_RECORD.menu_id = MENU.menu_id` |
| 9 | `menu_name` | string | MENU | Nama menu (`MENU.name`) |
| 10 | `normal_price` | decimal | MENU | Harga normal menu — fitur konteks nilai ekonomi |
| 11 | `is_active` | boolean | MENU | Filter agar hanya menu aktif yang masuk dataset |

## 3. Kolom dari `SURPLUS_LISTING` (histori surplus, join via `production_record_id`)

| No | Nama Kolom | Tipe Data | Sumber (tabel ERD) | Keterangan |
|----|-----------|-----------|---------------------|------------|
| 12 | `listing_id` | int (PK) | SURPLUS_LISTING | ID listing surplus |
| 13 | `rescue_price` | decimal | SURPLUS_LISTING | Harga jual surplus (diskon) |
| 14 | `initial_quantity` | int | SURPLUS_LISTING | Jumlah surplus yang dilistingkan |
| 15 | `available_quantity` | int | SURPLUS_LISTING | Sisa yang belum laku saat listing berakhir/ditarik |
| 16 | `pickup_start` / `pickup_end` | datetime | SURPLUS_LISTING | Jendela waktu pickup |
| 17 | `status` | string | SURPLUS_LISTING | Status listing (active/sold_out/expired, dll — sesuai enum di sistem) |
| 18 | `sell_through_rate` | float (0–1) | **Derivasi** | `(initial_quantity - available_quantity) / initial_quantity` — seberapa laku surplus tsb |

## 4. Fitur Turunan (Feature Engineering — tidak disimpan di DB transaksional)

| No | Nama Kolom | Tipe Data | Sumber | Keterangan |
|----|-----------|-----------|--------|------------|
| 19 | `day_of_week` | int (0–6) | Derivasi dari `production_date` | Fitur pola mingguan |
| 20 | `is_weekend` | boolean | Derivasi dari `production_date` | Fitur pola mingguan |
| 21 | `surplus_ratio` | float (0–1) | Derivasi | `surplus_quantity / produced_quantity` |

## 5. Kolom Target — ditulis ke tabel `PRODUCTION_RECOMMENDATION`

| No | Nama Kolom | Tipe Data | Sumber (tabel ERD) | Keterangan |
|----|-----------|-----------|---------------------|------------|
| 22 | `recommendation_id` | int (PK) | PRODUCTION_RECOMMENDATION | Dibuat saat inferensi, bukan bagian training set |
| 23 | `menu_id` | int (FK) | PRODUCTION_RECOMMENDATION | Sama dengan join key di atas |
| 24 | `target_date` | date | PRODUCTION_RECOMMENDATION | Tanggal yang direkomendasikan |
| 25 | `predicted_demand` | decimal | PRODUCTION_RECOMMENDATION | Output model — prediksi permintaan |
| 26 | `recommended_quantity` | int | PRODUCTION_RECOMMENDATION | Output model — ini **label/target saat training** (diambil dari histori `sold_quantity` + buffer) |
| 27 | `insight` | string | PRODUCTION_RECOMMENDATION | Penjelasan teks hasil model (opsional, untuk UI) |
| 28 | `model_version` | string | PRODUCTION_RECOMMENDATION | Versi model yang menghasilkan rekomendasi |
| 29 | `generated_at` | datetime | PRODUCTION_RECOMMENDATION | Timestamp inferensi |

## 6. Granularitas & Join Key

- **Grain training data**: satu baris = satu `production_record_id` (yaitu satu kombinasi `menu_id` + `production_date`).
- **Join path**: `PRODUCTION_RECORD.menu_id → MENU.menu_id` (ambil `restaurant_id`, `normal_price`), `SURPLUS_LISTING.production_record_id → PRODUCTION_RECORD.production_record_id` (ambil histori listing surplus, jika ada).
- Tidak semua `production_record` punya `surplus_listing` (surplus = 0 berarti tidak ada listing) — pipeline harus LEFT JOIN, bukan INNER JOIN, agar baris tanpa surplus tidak hilang.

## 7. Catatan Pipeline

- Saat training, `recommended_quantity` bukan diambil dari `PRODUCTION_RECOMMENDATION` (itu tabel output historis dari model versi sebelumnya) — melainkan dihitung ulang dari `sold_quantity` historis + buffer sesuai kebijakan bisnis, supaya label bersih dari bias model lama.
- Validasi: `sold_quantity + surplus_quantity = produced_quantity` harus konsisten di setiap baris `PRODUCTION_RECORD` sebelum dipakai untuk training.
- Data minimal beberapa minggu per `menu_id` agar pola `day_of_week` terlihat.
