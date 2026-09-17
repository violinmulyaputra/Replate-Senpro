import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <h1>Replate</h1>
      <p>Frontend Next.js berhasil dijalankan.</p>
      <nav aria-label="Route dasar">
        <ul>
          <li><Link href="/login/">Login</Link></li>
          <li><Link href="/register/">Register</Link></li>
        </ul>
      </nav>
    </main>
  )
}
