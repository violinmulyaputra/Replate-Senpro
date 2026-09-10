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
#### Kompetitor 1: 

| **Nama** | Surplus |
|---|---|
| **Jenis Kompetitor** | Direct Competitor |
| **Jenis Produk** | Marketplace B2C untuk makanan dan barang berlebih |
| **Target Customer** | UMKM F&B (restoran, hotel, supermarket) |

**Kelebihan & Kekurangan**

| Kelebihan | Kekurangan |
|---|---|
| - Sudah beroperasi di pasar Indonesia sejak tahun 2020, lebih paham perilaku pasar lokal<br>- Terintegrasi e-wallet dan layanan GoSend<br>- Kolaborasi aktif dengan komunitas peduli lingkungan | - Jangkauan mitra masih terbatas di kota-kota besar Jawa, Bali dan Sulawesi Selatan<br>- Strateginya menjadi horizontal ke banyak kategori barang, sehingga kedalaman fitur khusus F&B jadi bukan prioritas utama<br>- Fitur belum dilengkapi kecerdasan buatan |

**Key Competitive Advantage & Unique Value**

Surplus Indonesia masih sebatas marketplace reaktif tanpa analisis data operasional. Replate unggul karena memadukan marketplace dengan sistem analisis historis untuk merekomendasikan porsi produksi keesokan harinya, sekaligus menyediakan sistem penilaian risiko keamanan makanan demi menjaga kualitas dan kepercayaan konsumen.

#### Kompetitor 2: 

| **Nama** | Too Good To Go |
|---|---|
| **Jenis Kompetitor** | Direct Competitor |
| **Jenis Produk** | Marketplace B2C *Surplus Food Bag* |
| **Target Customer** | Restoran, Konsumen Hemat |

**Kelebihan & Kekurangan**

| Kelebihan | Kekurangan |
|---|---|
| - Skala terbesar di dunia dengan lebih dari 120 juta pengguna dan 180.000 mitra bisnis di 21 negara<br>- Model bisnis berupa *Surplus Bag* yang simpel bagi penjual | - Model "Surprise bag" yang tidak transparan membuat pembeli tidak bisa memilih menu dan beresiko tinggi bagi penderita alergi<br>- Belum hadir di pasar Indonesia |

**Key Competitive Advantage & Unique Value**

Berbeda dari model *Surprise Bag* yang acak dan tidak transparan, Replate menyediakan itemized listing sehingga pembeli tahu persis apa yang mereka beli. Selain itu, Replate dilengkapi sistem penilai risiko keamanan makanan berbasis waktu dan kondisi penyimpanan untuk menjamin kelayakan konsumsi, serta siap melayani pasar Indonesia yang belum dijangkau Too Good To Go.

#### Kompetitor 3: 

| **Nama** | Garda Pangan |
|---|---|
| **Jenis Kompetitor** | Indirect Competitor |
| **Jenis Produk** | Layanan penyaluran makanan sisa |
| **Target Customer** | Masyarakat pra-sejahtera sebagai penerima, restoran/hotel sebagai donatur |

**Kelebihan & Kekurangan**

| Kelebihan | Kekurangan |
|---|---|
| - Dampak sosial sangat kuat<br>- Ada proses uji kelayakan yang ketat sebelum disalurkan<br>- Bebas biaya bagi donatur | - Bukan bisnis komersial, tidak menghasilkan pendapatan bagi donatur<br>- Skala operasional terbatas karena bergantung pada ketersediaan relawan fisik dan donasi operasional |

**Key Competitive Advantage & Unique Value**

Garda Pangan berfokus murni pada redistribusi makanan berbasis donasi/non-profit. Replate memberikan nilai tambah ekonomis bagi pelaku usaha kuliner dengan memungkinkan makanan surplus yang masih layak konsumsi untuk dijual dan menghasilkan pendapatan.

## Jawaban Modul 2

### Metodologi SDLC

Metodologi SDLC yang digunakan dalam pengembangan Replate adalah **Agile**, dengan pendekatan iteratif berbasis sprint. Pengembangan dilakukan dalam beberapa siklus dengan durasi sekitar 1–2 minggu yang disesuaikan dengan jadwal praktikum Senior Project selama satu semester.

Pemilihan Agile didasarkan pada beberapa pertimbangan berikut:

1. **Kebutuhan Replate masih dapat berubah**  
   Replate memiliki beberapa bagian, yaitu networking, cloud computing, dan artificial intelligence (AI). Karena sistem masih dalam tahap pengembangan, beberapa kebutuhan teknis dan fitur dapat berubah setelah dilakukan pengujian. Agile memungkinkan tim untuk menyesuaikan kebutuhan tersebut secara lebih fleksibel dibandingkan metode Waterfall.

2. **Pengembangan AI membutuhkan proses berulang**  
   Pengembangan AI tidak dapat langsung selesai dalam satu tahap. Prosesnya meliputi penyiapan data, penentuan fitur, pelatihan model, evaluasi hasil, dan perbaikan model. Jika hasil model belum sesuai, proses tersebut perlu dilakukan kembali. Pendekatan iteratif pada Agile mendukung proses pengembangan tersebut.

3. **Antar-komponen saling bergantung**  
   Setiap bagian dalam Replate saling berhubungan. Frontend membutuhkan REST API, Backend membutuhkan Database, sedangkan fitur AI membutuhkan data dari sistem. Dengan pengembangan secara bertahap, setiap komponen dapat diuji lebih awal sehingga masalah integrasi dapat ditemukan dan diperbaiki lebih cepat.

4. **Pembagian tugas dalam tim mendukung Agile**  
   Tim terdiri dari beberapa role, yaitu Project Manager, Software Engineer, UI/UX Engineer, AI Engineer, dan Cloud Engineer. Agile memungkinkan anggota tim mengerjakan tugas masing-masing secara bersamaan dalam satu sprint, kemudian mengintegrasikan dan menguji hasil pekerjaan secara bersama-sama.

5. **Sesuai dengan sistem praktikum yang dilakukan setiap minggu**  
   Praktikum Senior Project memiliki pembagian tugas dan deliverable setiap minggu. Hal tersebut sesuai dengan konsep sprint pada Agile karena perkembangan proyek dapat dilakukan dan dipantau secara bertahap.

### Tujuan Produk

Replate merupakan marketplace makanan surplus yang mempertemukan pelaku usaha kuliner dengan konsumen untuk menjual makanan yang masih layak dikonsumsi dengan harga terjangkau. Selain membantu mengurangi kerugian finansial akibat food waste, Replate juga berperan dalam mencegah terjadinya kelebihan produksi. Dengan memanfaatkan data historis penjualan, Replate dapat memberikan rekomendasi jumlah produksi yang lebih sesuai dengan kebutuhan sehingga restoran dan UMKM F&B dapat mengelola produksi secara lebih efisien.

Tujuan utama Replate meliputi:

1. **Bagi Restoran/UMKM Kuliner:** Memulihkan pendapatan dari makanan surplus yang layak jual, sekaligus menyediakan dashboard analisis untuk memprediksi porsi produksi dan memantau batas aman konsumsi produk.

2. **Bagi Konsumen:** Menyediakan akses ke makanan berkualitas dengan harga terjangkau secara transparan, aman, dan mudah dijangkau.

3. **Bagi Lingkungan:** Memangkas akumulasi food waste dari industri kuliner secara langsung melalui pendekatan pencegahan dan penyaluran kembali.

### Pengguna Potensial & Kebutuhan

#### Restaurant Owner / Merchant

**Profil:** Restoran, kafe, bakery, hotel, dan UMKM kuliner yang memiliki surplus makanan harian dan siap menggunakan platform digital.

**Kebutuhan Pengguna:**

1. Menjual makanan surplus dengan cepat dan praktis melalui marketplace.
2. Kemudahan dalam mendaftarkan menu melalui fitur Manage Menu dan membuat listing makanan surplus melalui Create Surplus Food Listing.
3. Sistem pemantauan stok otomatis melalui Automatic Stock Management agar makanan yang habis tidak terus dipesan.
4. Fitur untuk memverifikasi kode pickup pesanan konsumen melalui Verify Pickup.
5. Dashboard analitik untuk melihat riwayat surplus, performa keuangan melalui Financial Dashboard, serta rekomendasi porsi produksi melalui View Production Recommendation.

#### Customer / Pembeli

**Profil:** Mahasiswa, pekerja, masyarakat hemat, dan konsumen yang peduli terhadap lingkungan (eco-conscious).

**Kebutuhan Pengguna:**

1. Cara mudah menemukan makanan surplus di sekitar dengan harga diskon.
2. Kemudahan mencari dan memfilter makanan berdasarkan lokasi, harga, dan jenis melalui Search and Filter Food.
3. Transparansi informasi menu, perkiraan waktu pickup, dan status kelayakan makanan melalui View Food Details.
4. Fitur pemesanan online, reservasi, dan keranjang belanja melalui Checkout and Confirm Reservation.
5. Akses informasi status dan riwayat pesanan untuk mengetahui perkembangan pesanan setelah melakukan reservasi.
6. Akses cepat ke kode pickup unik melalui View Pickup Code untuk ditunjukkan kepada restoran saat mengambil pesanan secara mandiri.

### Use Case Diagram

![Use Case Diagram](Replate_Use_Case_Diagram.drawio.png)

### Functional Requirements

Functional requirements Replate disusun berdasarkan use case yang telah dirancang dan dikelompokkan berdasarkan modul sistem.

| **Modul** | **FR** | **Deskripsi** |
|---|---|---|
| User Management & Authentication | FR-01 | Sistem harus memungkinkan Customer dan Restaurant Owner melakukan registrasi akun dan login sesuai peran (role) masing-masing. |
| | FR-02 | Sistem harus memungkinkan Restaurant Owner untuk mengelola informasi profil restoran (Manage Restaurant), seperti nama, alamat, dan nomor telepon. |
| Customer Marketplace & Exploration | FR-03 | Sistem harus dapat menampilkan katalog makanan surplus dari berbagai restoran (Browse Marketplace). |
| | FR-04 | Sistem harus menyediakan fitur pencarian dan penyaringan (Search and Filter Food) berdasarkan kata kunci, kategori, lokasi, atau harga. |
| | FR-05 | Sistem harus menampilkan rincian informasi makanan (View Food Details), termasuk harga, jumlah tersedia, informasi kelayakan makanan, dan estimasi waktu pickup. |
| | FR-06 | Sistem harus memungkinkan Customer untuk menambahkan dan mengelola item di dalam keranjang belanja (Manage Shopping Cart). |
| | FR-07 | Sistem harus memungkinkan Customer untuk melakukan pemesanan dan konfirmasi reservasi (Checkout and Confirm Reservation). |
| | FR-08 | Sistem harus memungkinkan Customer memantau pembaruan status pesanan (View Order Status) yang sedang berlangsung secara real-time. |
| | FR-09 | Sistem harus membuat dan menampilkan kode pickup unik (View Pickup Code) bagi Customer setelah pesanan dikonfirmasi. |
| | FR-10 | Sistem harus memungkinkan Customer melihat riwayat seluruh pesanan yang pernah dilakukan sebelumnya (View Order History). |
| Merchant Operation & Surplus Management | FR-11 | Sistem harus memungkinkan Restaurant Owner untuk menambahkan, mengubah, dan menghapus daftar menu harian (Manage Menu). |
| | FR-12 | Sistem harus memungkinkan Restaurant Owner untuk mencatat data produksi harian (Input Production Record), meliputi jumlah makanan yang diproduksi, terjual, dan menjadi surplus. |
| | FR-13 | Sistem harus memungkinkan Restaurant Owner untuk membuat daftar makanan surplus (Create Surplus Food Listing) lengkap dengan harga diskon (rescue price), jumlah porsi, dan rentang waktu pickup. |
| | FR-14 | Sistem harus dapat memperbarui stok makanan surplus secara otomatis (Automatic Stock Management) setiap kali terjadi transaksi pemesanan. |
| | FR-15 | Sistem harus memungkinkan Restaurant Owner untuk mengatur stok makanan surplus secara manual jika terdapat penyesuaian (Manage Surplus Stock). |
| | FR-16 | Sistem harus memungkinkan Restaurant Owner melihat dan mengelola status pesanan yang masuk (Manage Orders) dari Customer. |
| | FR-17 | Sistem harus memungkinkan Restaurant Owner mengatur estimasi rentang waktu pengambilan makanan surplus (Set Pickup Estimation). |
| | FR-18 | Sistem harus memungkinkan Restaurant Owner memverifikasi kode pickup milik Customer (Verify Pickup) untuk mengonfirmasi penyerahan makanan di lokasi. |
| B2B Analytics & AI Engine | FR-19 | Sistem harus menganalisis data historis produksi dan surplus untuk mengidentifikasi pola atau tren surplus (Analyze Production and Surplus Data). |
| | FR-20 | Sistem harus dapat menghasilkan dan menampilkan rekomendasi jumlah produksi menggunakan model AI (Generate & View Production Recommendation) untuk periode berikutnya. |
| | FR-21 | Sistem harus menampilkan dashboard analitik visual yang menyajikan grafik tren kerugian porsi dan akumulasi makanan yang terselamatkan (View Surplus Dashboard). |
| | FR-22 | Sistem harus menampilkan dashboard keuangan yang memperlihatkan total pendapatan pemulihan (revenue recovery) hasil penjualan makanan surplus (View Financial Dashboard). |

### Entity Relationship Diagram
   
![Entity Relationship Diagram](Raplate_ERD.png)
   
### Low-Fidelity Wireframe
   
![Customer Wireframe](Customer_Wireframe.png)

![Restaurant Owner Wireframe](Restaurant_Owner_Wireframe.png)
