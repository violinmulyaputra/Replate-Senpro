import Link from 'next/link'

export default function CustomerNav({ cartCount }: { cartCount: number }) {
  return (
    <nav className="customer-bottom-nav" aria-label="Navigasi customer">
      <Link className="selected" href="/customer/"><span aria-hidden="true">⌂</span>Beranda</Link>
      <Link href="/customer/cart/"><span aria-hidden="true">▱</span>Keranjang{cartCount > 0 && <b>{cartCount}</b>}</Link>
    </nav>
  )
}
