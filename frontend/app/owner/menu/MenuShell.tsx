'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

export default function MenuShell({
  restaurant,
  active = 'menu',
  children,
}: {
  restaurant: string
  active?: 'menu' | 'listing'
  children: ReactNode
}) {
  const router = useRouter()
  return (
    <div className="menu-layout">
      <aside className="menu-sidebar">
        <div className="menu-brand">
          <Image src="/listing/brand.svg" alt="" width={40} height={40} />
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
          <Link href="/owner/"><Image src="/listing/dashboard.svg" alt="" width={20} height={20} />Dashboard</Link>
          <Link className={active === 'menu' ? 'active' : ''} href="/owner/menu/">
            <Image src="/listing/menu.svg" alt="" width={20} height={20} />Menu & Produksi
          </Link>
          <Link className={active === 'listing' ? 'active' : ''} href="/owner/listings/">
            <Image src="/listing/listing.svg" alt="" width={20} height={20} />Buat Listing
          </Link>
          <span><Image src="/listing/orders.svg" alt="" width={20} height={20} />Pesanan</span>
          <span><Image src="/listing/production.svg" alt="" width={20} height={20} />Catatan Produksi</span>
          <span><Image src="/listing/ai.svg" alt="" width={20} height={20} />Insight AI</span>
          <Link href="/owner/settings/"><Image src="/listing/settings.svg" alt="" width={20} height={20} />Pengaturan</Link>
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
            <Image src="/listing/logout.svg" alt="" width={18} height={18} />Keluar Akun
          </button>
        </div>
      </aside>
      <main className="menu-main">{children}</main>
    </div>
  )
}
