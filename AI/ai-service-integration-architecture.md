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

```text
[ Cloud Scheduler ]
        │
        ▼ (Trigger Scheduled Job)
[ AI Service (Scikit-Learn) ]
        │
        ├──────► 1. Request Input Data ──────► [ Backend API ]
        │                                             │
        │◄───── 2. Return Input Data ─────────────────┤
        │                                             │
        │ (Run Scikit-Learn Inference)                ▼
        │                                     [ Azure SQL Database ]
        │                                             │
        └──────► 3. Send Recommendation ──────► [ Backend API ]
                                                      │
                                                      ▼ (Write Result)
                                            [ PRODUCTION_RECOMMENDATION Table ]