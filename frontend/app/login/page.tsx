import Link from 'next/link'

export default function Login() {
  return (
    <main className="auth-page">
      <section className="auth-intro">
        <p className="eyebrow"><span /> Selamat datang kembali</p>
        <h1>Satu langkah lebih dekat ke makanan yang terselamatkan.</h1>
        <blockquote>“Makanan terbaik adalah makanan yang tidak jadi terbuang.”</blockquote>
      </section>
      <section className="auth-card" aria-labelledby="login-title">
        <p className="auth-index">01 / MASUK</p>
        <h2 id="login-title">Masuk ke Replate</h2>
        <p>Gunakan akun Customer atau Restaurant Owner milikmu.</p>
        <form>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="nama@email.com" />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Minimal 8 karakter" />
          <button type="button" className="button button-primary">Masuk <span aria-hidden="true">→</span></button>
        </form>
        <p className="auth-switch">Belum punya akun? <Link href="/register/">Daftar sekarang</Link></p>
      </section>
    </main>
  )
}
