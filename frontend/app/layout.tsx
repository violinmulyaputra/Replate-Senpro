import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Replate — Good food, less waste',
  description: 'Marketplace makanan surplus yang masih layak, dekat, dan lebih terjangkau.',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <header className="site-header">
          <Link className="brand" href="/" aria-label="Replate — beranda">
            <span className="brand-mark" aria-hidden="true">R</span>
            <span>Replate</span>
          </Link>
          <nav aria-label="Navigasi utama">
            <Link href="/">Beranda</Link>
            <Link href="/login/">Masuk</Link>
            <Link className="nav-cta" href="/register/">Daftar</Link>
          </nav>
        </header>
        {children}
        <footer>
          <p>Replate</p>
          <p>Good food. Less waste.</p>
        </footer>
      </body>
    </html>
  )
}
