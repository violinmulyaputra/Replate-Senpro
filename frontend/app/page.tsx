import Link from 'next/link'

const steps = [
  ['01', 'Temukan', 'Cari makanan surplus dari restoran di dekatmu.'],
  ['02', 'Selamatkan', 'Reservasi dengan harga lebih ringan sebelum habis.'],
  ['03', 'Ambil', 'Tunjukkan kode pickup dan bawa pulang makananmu.'],
]

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Food rescue marketplace</p>
          <h1>Makanan baik<br />layak mendapat<br /><em>kesempatan kedua.</em></h1>
          <p className="hero-lead">
            Replate mempertemukan makanan surplus dari dapur lokal dengan orang yang siap menikmatinya—lebih hemat, lebih sedikit terbuang.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/register/">Mulai selamatkan makanan <span aria-hidden="true">↗</span></Link>
            <Link className="text-link" href="/login/">Sudah punya akun? Masuk</Link>
          </div>
        </div>
        <div className="hero-art" aria-label="Ilustrasi tas Replate berisi makanan segar" role="img">
          <div className="sun" />
          <div className="leaf leaf-one" />
          <div className="leaf leaf-two" />
          <div className="bread">🥖</div>
          <div className="greens">🥬</div>
          <div className="bag"><span>Rescue<br />today.</span></div>
          <p className="art-note">Surplus hari ini.<br />Santapan malam ini.</p>
        </div>
      </section>

      <section className="manifesto" aria-labelledby="manifesto-title">
        <p className="section-label">Cara kerja</p>
        <h2 id="manifesto-title">Tiga langkah kecil.<br />Dampak yang terasa.</h2>
        <div className="steps">
          {steps.map(([number, title, copy]) => (
            <article key={number}>
              <p className="step-number">{number}</p>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="owner-callout">
        <div>
          <p className="section-label">Untuk bisnis F&amp;B</p>
          <h2>Surplus bukan akhir cerita.</h2>
        </div>
        <p>Ubah stok tersisa menjadi pendapatan, catat pola produksi, dan siapkan dapur yang lebih efisien.</p>
        <Link className="button button-dark" href="/register/">Daftarkan restoran</Link>
      </section>
    </main>
  )
}
