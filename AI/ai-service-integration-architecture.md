# AI Service Integration Architecture

## 1. AI Framework
AI Production Recommendation menggunakan Scikit-Learn sebagai framework untuk pengembangan model.

## 2. Inference Mechanism
Inference dilakukan secara scheduled. AI Service dijalankan secara berkala untuk menghasilkan rekomendasi produksi untuk periode berikutnya.

## 3. Input Data
AI Service memperoleh data input yang dibutuhkan melalui Backend API, bukan mengakses database secara langsung.

Data yang digunakan meliputi:
- `PRODUCTION_RECORD`
- `MENU`
- `SURPLUS_LISTING`

## 4. Output and Data Persistence
AI Service menghasilkan rekomendasi produksi dan mengirimkan hasil tersebut ke Backend API. Backend API kemudian bertanggung jawab untuk menyimpan hasil rekomendasi ke tabel `PRODUCTION_RECOMMENDATION`.

## 5. Integration Flow
Alur integrasi AI Production Recommendation:

1. Cloud Scheduler menjalankan AI Service secara berkala.
2. AI Service meminta data input melalui Backend API.
3. Backend API mengambil data yang dibutuhkan dari Azure SQL Database.
4. AI Service melakukan inference menggunakan model Scikit-Learn.
5. AI Service mengirim hasil rekomendasi ke Backend API.
6. Backend API menyimpan hasil ke `PRODUCTION_RECOMMENDATION`.