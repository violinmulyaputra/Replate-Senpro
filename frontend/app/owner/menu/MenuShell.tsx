'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

export default function MenuShell({
  restaurant,
  children,
}: {
  restaurant: string
  children: ReactNode
}) {
  const router = useRouter()
  return (
    <div className="menu-layout">
      <aside className="menu-sidebar">
        <div className="menu-brand">
          <span>♻</span>
          <strong>Replate</strong>
        </div>
        <div className="menu-store">
          <span>{restaurant.slice(0, 2).toUpperCase() || 'RP'}</span>
          <div>
            <strong>{restaurant || 'Restoran Baru'}</strong>
            <small>Restaurant Owner</small>
          </div>
        </div>
        <nav aria-label="Navigasi owner">
          <Link href="/owner/">▦　Dashboard</Link>
          <Link className="active" href="/owner/menu/">
            ▣　Menu & Produksi
          </Link>
          <span>⊕　Buat Listing</span>
          <span>▤　Pesanan</span>
          <span>ϟ　Insight AI</span>
          <Link href="/owner/settings/">⚙　Pengaturan</Link>
        </nav>
        <div className="menu-bottom">
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem('replate-session')
              localStorage.removeItem('replate-session')
              router.push('/login/')
            }}
          >
            ↪　Keluar Akun
          </button>
        </div>
      </aside>
      <main className="menu-main">{children}</main>
    </div>
  )
}
