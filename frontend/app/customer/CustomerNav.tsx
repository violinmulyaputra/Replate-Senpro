import Image from 'next/image'
import Link from 'next/link'

export default function CustomerNav({ cartCount, active = 'home' }: { cartCount: number; active?: 'home' | 'cart' | 'orders' }) {
  return (
    <nav className="customer-bottom-nav" aria-label="Navigasi customer">
      <Link className={active === 'home' ? 'selected' : ''} aria-current={active === 'home' ? 'page' : undefined} href="/customer/"><Image src="/orders/home.svg" alt="" width={20} height={22} />Beranda</Link>
      <Link className={active === 'cart' ? 'selected' : ''} aria-current={active === 'cart' ? 'page' : undefined} href="/customer/cart/"><Image src="/orders/cart.svg" alt="" width={24} height={22} />Keranjang{cartCount > 0 && <b>{cartCount}</b>}</Link>
      <Link className={active === 'orders' ? 'selected' : ''} aria-current={active === 'orders' ? 'page' : undefined} href="/customer/orders/"><Image src="/orders/orders.svg" alt="" width={24} height={22} />Pesanan</Link>
    </nav>
  )
}
