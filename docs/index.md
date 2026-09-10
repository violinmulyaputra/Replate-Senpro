# Replate

## Nama Kelompok
Kelompok 19

## Anggota dan NIM
- Violin Mulya Putra - 24/534192/TK/59201
- Putri Tajudin - 24/535824/TK/59469
- Diaz Amantajati Susilo - 24/545483/TK/60678

## Project Senior Project TI
Departemen Teknologi Elektro dan Teknologi Informasi
Fakultas Teknik, Universitas Gadjah Mada

## Jawaban Modul 1

### Nama Produk
#### Replate
Replate merupakan web application marketplace yang membantu restoran dan usaha kuliner menjual makanan surplus yang masih layak konsumsi dengan harga lebih terjangkau. Selain membantu mengurangi food waste, Replate memanfaatkan AI untuk menganalisis data surplus dan memberikan rekomendasi jumlah produksi agar pelaku usaha dapat mengurangi kerugian serta mencegah kelebihan produksi di masa mendatang. Replate juga menyediakan sistem penilaian risiko keamanan makanan untuk membantu memastikan makanan yang ditawarkan masih layak dikonsumsi dan mengurangi risiko keracunan bagi konsumen.

### Jenis Produk
Web application marketplace

### Latar Belakang & Permasalahan
#### Latar Belakang:
Food loss and waste (FLW) merupakan salah satu permasalahan lingkungan dan ekonomi yang signifikan di Indonesia. Kementerian PPN/Bappenas memperkirakan timbulan FLW di Indonesia pada periode 2000–2019 mencapai 23–48 juta ton per tahun atau 115–184 kg per kapita per tahun. Timbulan tersebut diperkirakan menyebabkan kerugian ekonomi sebesar Rp213–551 triliun per tahun, setara dengan sekitar 4–5% PDB Indonesia, serta menghasilkan emisi gas rumah kaca sebesar 1.702,9 megaton CO₂-ekuivalen selama periode tersebut.
Sektor layanan makanan juga memiliki peran dalam permasalahan food waste. UNEP dalam Food Waste Index Report 2024 memperkirakan bahwa dari 1,05 miliar ton food waste global pada tahun 2022, sekitar 28% berasal dari sektor layanan makanan (food service). Pada usaha seperti restoran, kafe, dan bakery, ketidaksesuaian antara jumlah produksi dan permintaan dapat menghasilkan makanan surplus yang tidak terjual dan berpotensi menjadi limbah.
Oleh karena itu, diperlukan solusi yang tidak hanya membantu menyalurkan makanan surplus yang masih layak konsumsi, tetapi juga membantu pelaku usaha mencegah produksi berlebih. Replate diusulkan sebagai platform food rescue marketplace yang mempertemukan usaha kuliner dengan konsumen untuk menawarkan makanan surplus dengan harga khusus, dilengkapi sistem penilaian risiko keamanan makanan dan rekomendasi produksi berdasarkan data historis.

#### Rumusan Permasalahan:
1.	Bagaimana menyediakan platform yang dapat membantu usaha kuliner menyalurkan makanan surplus yang masih layak konsumsi kepada konsumen?
2.	Bagaimana membantu memastikan makanan surplus yang ditawarkan tetap memenuhi batas kelayakan konsumsi berdasarkan karakteristik makanan, waktu, dan kondisi penyimpanannya?
3.	Bagaimana memanfaatkan data historis produksi dan penjualan untuk memberikan rekomendasi jumlah produksi sehingga potensi makanan surplus dapat dikurangi?

### Ide Solusi
#### Solusi:
Replate diusulkan sebagai web application marketplace yang menghubungkan restoran, kafe, dan usaha kuliner dengan konsumen untuk menyalurkan makanan surplus yang masih layak konsumsi dengan harga lebih terjangkau. Pelaku usaha dapat membuat listing makanan surplus, mengatur jumlah stok, harga, waktu pengambilan, serta informasi terkait kondisi makanan, sedangkan konsumen dapat mencari, memesan, dan mengambil makanan secara langsung di lokasi usaha.
Selain sebagai marketplace, Replate dilengkapi dengan sistem penilaian risiko keamanan makanan berdasarkan karakteristik makanan, waktu, dan kondisi penyimpanan untuk membantu memastikan makanan yang ditawarkan masih layak dikonsumsi. Replate juga memanfaatkan data historis produksi dan penjualan untuk menganalisis pola surplus serta memberikan rekomendasi jumlah produksi sehingga pelaku usaha dapat mengurangi potensi kelebihan produksi dan food waste di masa mendatang.

#### Rancangan Fitur Solusi:
| Fitur | Keterangan |
|---|---|
| Authentication & Role Management | Registrasi, login, dan pembagian hak akses antara Customer dan Restaurant Owner. |
| Restaurant Management | Restaurant Owner mengelola profil restoran, lokasi, dan informasi usaha. |
| Listing Makanan Surplus | Restoran membuat listing makanan surplus beserta harga, stok, waktu produksi, dan batas pengambilan. |
| Marketplace & Search | Customer melihat, mencari, dan memfilter makanan surplus yang tersedia. |
| Shopping Cart & Checkout | Customer menyimpan makanan ke keranjang dan melakukan reservasi. |
| Automatic Stock Management | Stok diperbarui otomatis setelah reservasi dan listing ditutup jika stok habis. |
| Pickup Code & Verification | Sistem memberikan kode pickup yang diverifikasi saat makanan diambil. |
| AI Food Safety Risk Classifier | Menganalisis risiko keamanan makanan berdasarkan karakteristik makanan, waktu, dan kondisi penyimpanan. |
| Production Record | Menyimpan data produksi, penjualan, dan surplus sebagai data historis restoran. |
| AI Surplus Analytics & Production Recommender | Menganalisis pola surplus dan memberikan rekomendasi jumlah produksi. |
| Dashboard Analitik Restoran | Menampilkan data penjualan, surplus, performa listing, dan rekomendasi produksi. |
| Notifikasi & Status Real-Time | Memberikan pembaruan status pesanan dan stok secara real-time. |

### Analisis Kompetitor
#### Kompetitor 1: Surplus

| | |
|---|---|
| **Nama** | Surplus |
| **Jenis Kompetitor** | Direct Competitor |
| **Jenis Produk** | Marketplace B2C untuk makanan dan barang berlebih |
| **Target Customer** | UMKM F&B (restoran, hotel, supermarket) |

| Kelebihan | Kekurangan |
|---|---|
| - Sudah beroperasi di pasar Indonesia sejak tahun 2020, lebih paham perilaku pasar lokal<br>- Terintegrasi e-wallet dan layanan GoSend<br>- Kolaborasi aktif dengan komunitas peduli lingkungan | - Jangkauan mitra masih terbatas di kota-kota besar Jawa, Bali dan Sulawesi Selatan<br>- Strateginya menjadi horizontal ke banyak kategori barang, sehingga kedalaman fitur khusus F&B jadi bukan prioritas utama<br>- Fitur belum dilengkapi kecerdasan buatan |

**Key Competitive Advantage & Unique Value**

Surplus Indonesia masih sebatas marketplace reaktif tanpa analisis data operasional. Replate unggul karena memadukan marketplace dengan sistem analisis historis untuk merekomendasikan porsi produksi keesokan harinya, sekaligus menyediakan sistem penilaian risiko keamanan makanan demi menjaga kualitas dan kepercayaan konsumen.

#### Kompetitor 2: Too Good To Go

| | |
|---|---|
| **Nama** | Too Good To Go |
| **Jenis Kompetitor** | Direct Competitor |
| **Jenis Produk** | Marketplace B2C *Surplus Food Bag* |
| **Target Customer** | Restoran, Konsumen Hemat |

| Kelebihan | Kekurangan |
|---|---|
| - Skala terbesar di dunia dengan lebih dari 120 juta pengguna dan 180.000 mitra bisnis di 21 negara<br>- Model bisnis berupa *Surplus Bag* yang simpel bagi penjual | - Model "Surprise bag" yang tidak transparan membuat pembeli tidak bisa memilih menu dan beresiko tinggi bagi penderita alergi<br>- Belum hadir di pasar Indonesia |

**Key Competitive Advantage & Unique Value**

Berbeda dari model *Surprise Bag* yang acak dan tidak transparan, Replate menyediakan itemized listing sehingga pembeli tahu persis apa yang mereka beli. Selain itu, Replate dilengkapi sistem penilai risiko keamanan makanan berbasis waktu dan kondisi penyimpanan untuk menjamin kelayakan konsumsi, serta siap melayani pasar Indonesia yang belum dijangkau Too Good To Go.

#### Kompetitor 3: Garda Pangan

| | |
|---|---|
| **Nama** | Garda Pangan |
| **Jenis Kompetitor** | Indirect Competitor |
| **Jenis Produk** | Layanan penyaluran makanan sisa |
| **Target Customer** | Masyarakat pra-sejahtera sebagai penerima, restoran/hotel sebagai donatur |

| Kelebihan | Kekurangan |
|---|---|
| - Dampak sosial sangat kuat<br>- Ada proses uji kelayakan yang ketat sebelum disalurkan<br>- Bebas biaya bagi donatur | - Bukan bisnis komersial, tidak menghasilkan pendapatan bagi donatur<br>- Skala operasional terbatas karena bergantung pada ketersediaan relawan fisik dan donasi operasional |

**Key Competitive Advantage & Unique Value**

Garda Pangan berfokus murni pada redistribusi makanan berbasis donasi/non-profit. Replate memberikan nilai tambah ekonomis bagi pelaku usaha kuliner dengan memungkinkan makanan surplus yang masih layak konsumsi untuk dijual dan menghasilkan pendapatan.
