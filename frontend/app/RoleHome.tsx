'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { clearSession, readSession, type Session } from '../lib/session'

export default function RoleHome({ role }: { role: Session['role'] }) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    const current = readSession()
    if (!current) router.replace('/login/')
    else if (current.role !== role)
      router.replace(current.role === 'Customer' ? '/customer/' : '/owner/')
    else queueMicrotask(() => setSession(current))
  }, [role, router])

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-logo">
          <Image
            src="/Replate-logo.png"
            alt="Replate"
            width={50}
            height={50}
            unoptimized
          />
        </div>
        <h1>{session ? `Halo, ${session.name}` : 'Memuat...'}</h1>
        {session && (
          <>
            <p>
              {role === 'Customer'
                ? 'Akun customer Anda sudah aktif.'
                : 'Siapkan profil restoran, lalu kelola menu dan produksi.'}
            </p>
            {role === 'RestaurantOwner' && (
              <nav
                className="auth-owner-links"
                aria-label="Akses pemilik restoran"
              >
                <Link href="/owner/settings/">
                  Buat / Atur Profil Restoran →
                </Link>
                <Link href="/owner/menu/">Menu & Produksi →</Link>
              </nav>
            )}
            <button
              className="auth-submit"
              onClick={() => {
                clearSession()
                router.push('/login/')
              }}
            >
              Keluar Akun
            </button>
          </>
        )}
      </div>
    </main>
  )
}
