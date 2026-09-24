'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { customerRequest, customerToken, readCart, type MarketplaceListing } from '../../lib/customer-api'
import { mediaUrl } from '../../lib/menu-api'
import CustomerNav from './CustomerNav'

const currency = (amount: number) => `Rp ${Math.round(amount).toLocaleString('id-ID')}`
const time = (value: string) => new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(new Date(value))
const imageFor = (listing: MarketplaceListing) => listing.photos[0] ? mediaUrl(listing.photos[0]) : '/menu/veggie.jpg'
const group = (category: string) => /bakery|pastry|roti|kue/i.test(category) ? 'Bakery' : /lainnya|other/i.test(category) ? 'Others' : 'Meals'

export default function Marketplace() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    void (async () => {
      const value = customerToken()
      if (!value) { router.replace('/login/'); return }
      setToken(value)
      setCartCount(readCart().length)
    })()
  }, [router])

  useEffect(() => {
    if (!token) return
    let cancelled = false
    const timer = window.setTimeout(() => {
      setLoading(true)
      customerRequest<MarketplaceListing[]>(`/api/marketplace/listings${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`, token)
        .then((items) => { if (!cancelled) { setListings(items); setError('') } })
        .catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : 'Marketplace belum dapat dimuat.') })
        .finally(() => { if (!cancelled) setLoading(false) })
    }, 200)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [search, token])

  const visible = useMemo(() => listings.filter((item) => category === 'All' || group(item.category) === category), [category, listings])
  const categories = ['All', 'Meals', 'Bakery', 'Others']

  return (
    <main className="customer-app" id="top">
      <header className="customer-header"><Link href="/customer/" className="customer-brand"><Image src="/Replate-logo.png" alt="" width={34} height={34} unoptimized /><strong>Replate</strong></Link><span>Makanan baik, lebih sedikit terbuang</span></header>
      <section className="marketplace-page" aria-labelledby="marketplace-title">
        <div className="customer-title-row"><div><small>Temukan makanan surplus</small><h1 id="marketplace-title">Marketplace</h1></div><span className="customer-location"><span aria-hidden="true">⌖</span> Sekitar saya</span></div>
        <div className="marketplace-search-row"><label className="marketplace-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari menu atau restoran..." aria-label="Cari menu atau restoran" /><button type="button" onClick={() => setSearch('')} aria-label="Hapus pencarian" disabled={!search}>×</button></label><button className={`marketplace-filter-button${showFilters ? ' active' : ''}`} type="button" onClick={() => setShowFilters((value) => !value)} aria-expanded={showFilters} aria-label="Tampilkan filter kategori"><span aria-hidden="true">☷</span></button></div>
        <div className={`marketplace-categories${showFilters ? ' expanded' : ''}`} role="group" aria-label="Filter kategori">
          {categories.map((item) => <button key={item} type="button" className={category === item ? 'selected' : ''} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        <div className="marketplace-list-heading"><div><h2>{search || category !== 'All' ? 'Hasil pencarian' : 'Dekat denganmu'}</h2><p>{visible.length} makanan tersedia untuk diselamatkan</p></div><span>Pickup hari ini</span></div>
        {error && <p className="customer-alert" role="alert">{error}</p>}
        {loading ? <div className="customer-empty" role="status">Mencari makanan surplus…</div> : visible.length === 0 ? <div className="customer-empty"><span aria-hidden="true">♧</span><h2>Belum ada makanan tersedia</h2><p>Coba ubah pencarian atau cek lagi nanti.</p></div> : (
          <div className="marketplace-grid">{visible.map((item) => <Link className="marketplace-card" href={`/customer/listing/?id=${item.surplusListingId}`} key={item.surplusListingId}>
            <div className="marketplace-card-photo"><Image src={imageFor(item)} alt={item.menuName} fill sizes="(max-width: 600px) 120px, 220px" unoptimized /><span className="marketplace-discount">-{item.discountPercent}%</span><span className="marketplace-stock">{item.availableQuantity} tersisa</span></div>
            <div className="marketplace-card-content"><strong className="marketplace-restaurant">{item.restaurant.name}</strong><h3>{item.menuName}</h3><p className="marketplace-description">{item.description}</p><div className="marketplace-card-price"><span><strong>{currency(item.rescuePrice)}</strong><del>{currency(item.normalPrice)}</del></span><small>{time(item.pickupStart)}–{time(item.pickupEnd)} WIB</small></div></div>
          </Link>)}</div>
        )}
      </section>
      <CustomerNav cartCount={cartCount} />
    </main>
  )
}
