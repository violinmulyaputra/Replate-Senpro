import Link from 'next/link'

export default function Register() {
  return (
    <main className="auth-page register-page">
      <section className="auth-intro">
        <p className="eyebrow"><span /> Bergabung dengan gerakan</p>
        <h1>Beri makanan baik kesempatan kedua.</h1>
        <div className="impact-stamp"><strong>1 akun</strong><span>banyak piring terselamatkan</span></div>
      </section>
      <section className="auth-card" aria-labelledby="register-title">
        <p className="auth-index">02 / DAFTAR</p>
        <h2 id="register-title">Buat akun Replate</h2>
        <p>Pilih peran yang paling sesuai dengan kebutuhanmu.</p>
        <form>
          <fieldset>
            <legend>Saya mendaftar sebagai</legend>
            <div className="role-options">
              <label><input name="role" type="radio" value="Customer" defaultChecked /> Customer</label>
              <label><input name="role" type="radio" value="RestaurantOwner" /> Restaurant Owner</label>
            </div>
          </fieldset>
          <label htmlFor="name">Nama lengkap</label>
          <input id="name" name="name" autoComplete="name" placeholder="Nama kamu" />
          <label htmlFor="register-email">Email</label>
          <input id="register-email" name="email" type="email" autoComplete="email" placeholder="nama@email.com" />
          <label htmlFor="register-password">Password</label>
          <input id="register-password" name="password" type="password" autoComplete="new-password" placeholder="Minimal 8 karakter" />
          <button type="button" className="button button-primary">Buat akun <span aria-hidden="true">→</span></button>
        </form>
        <p className="auth-switch">Sudah punya akun? <Link href="/login/">Masuk</Link></p>
      </section>
    </main>
  )
}
