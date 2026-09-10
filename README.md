# Replate-Senpro
Replate adalah aplikasi marketplace yang membantu restoran menjual makanan surplus yang masih layak konsumsi dengan harga lebih terjangkau. Selain membantu mengurangi food waste, Replate juga menyediakan analisis surplus dan rekomendasi jumlah produksi agar restoran dapat mengurangi kerugian serta mencegah kelebihan produksi di masa mendatang.

## Struktur Project

```text
Replate-Senpro/
├── frontend/        # Aplikasi web customer dan restaurant owner
├── backend/         # REST API .NET dan integrasi database
├── diagram/         # ERD dan use case diagram
└── .github/         # Workflow CI GitHub Actions
```

Simpan kode frontend di `frontend/` dan kode API, business logic, serta migration database di `backend/`. Dokumentasi dan aset diagram disimpan di root atau `diagram/`.

## Menjalankan Backend

```bash
export Jwt__Key="<secret minimal 32 karakter>"
dotnet run --project backend/Replate.Api --urls http://localhost:5000
```

Health check tersedia di `GET http://localhost:5000/api/health`. Atur koneksi SQL Server atau Azure SQL melalui environment variable `ConnectionStrings__DefaultConnection` sebelum menggunakan database.

### Authentication

- `POST /api/auth/register` menerima `name`, `email`, `password`, dan `role` (`Customer` atau `RestaurantOwner`).
- `POST /api/auth/login` menerima `email` dan `password` lalu mengembalikan JWT.

JWT berlaku selama 60 menit secara default. Ubah durasinya melalui `Jwt__ExpiresMinutes`.

### Database Migration

```bash
export ConnectionStrings__DefaultConnection="<SQL Server atau Azure SQL connection string>"
dotnet tool restore
dotnet ef database update --project backend/Replate.Api --startup-project backend/Replate.Api
```

Migration awal membuat tabel dan relasi sesuai ERD Replate.

## Use Case Diagram

![Use Case Diagram Replate](diagram/Replate_Use_Case_Diagram.drawio.png)

## Entity Relationship Diagram

![Entity Relationship Diagram Replate](diagram/Raplate_ERD.png)

## Customer Low-Fidelity Wireframe

![Customer Low-Fidelity Wireframe Replate](diagram/Customer_Wireframe.png)

## Restaurant Owner Low-Fidelity Wireframe

![Restaurant Owner Low-Fidelity Wireframe Replate](diagram/Restaurant_Owner_Wireframe.png)

Kelompok 19

Ketua Kelompok: Violin Mulya Putra - 24/534192/TK/59201

Anggota 1: Putri Tajudin - 24/535824/TK/59469

Anggota 2: Diaz Amantajati Susilo - 24/545483/TK/60678
