import type { CustomerOrder } from './customer-api'

export type OwnerOrder = CustomerOrder & { customerName: string; restaurantName: string; pickupStatus: string | null; verifiedAt: string | null }
export const orderStatus = (status: string) => ({ Pending: 'Menunggu pickup', Completed: 'Selesai', Cancelled: 'Dibatalkan', Preparing: 'Disiapkan', Ready: 'Siap diambil' })[status] ?? status
export const orderCurrency = (value: number) => `Rp ${value.toLocaleString('id-ID')}`
export const orderDate = (value: string) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(new Date(value)) + ' WIB'
export function orderError(cause: unknown) {
  const message = cause instanceof Error ? cause.message : 'Pesanan belum dapat dimuat.'
  const messages: Record<string, string> = {
    'Order not found.': 'Pesanan tidak ditemukan atau tidak dapat diakses.',
    'Pickup code is invalid.': 'Kode pickup salah. Periksa kode dari pelanggan.',
    'Pickup was already verified.': 'Pickup sudah diverifikasi sebelumnya.',
    'Order cannot be verified in its current status.': 'Status pesanan ini tidak dapat diverifikasi.',
    'Unauthorized.': 'Sesi berakhir. Silakan masuk kembali.',
    'An unexpected error occurred.': 'Pesanan belum dapat dimuat. Silakan coba lagi.',
    'Failed to fetch': 'Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.',
  }
  return messages[message] ?? message
}
