export type Session = {
  userId: number
  name: string
  email: string
  role: 'Customer' | 'RestaurantOwner'
  token: string
  expiresAt: string
}

const key = 'replate-session'

export function saveSession(session: Session, remember: boolean) {
  localStorage.removeItem(key)
  sessionStorage.removeItem(key)
  ;(remember ? localStorage : sessionStorage).setItem(
    key,
    JSON.stringify(session),
  )
}

export function readSession(): Session | null {
  const raw = sessionStorage.getItem(key) ?? localStorage.getItem(key)
  if (!raw) return null
  try {
    const session = JSON.parse(raw) as Session
    if (!session.token || new Date(session.expiresAt).getTime() <= Date.now()) {
      clearSession()
      return null
    }
    return session
  } catch {
    clearSession()
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(key)
  sessionStorage.removeItem(key)
}
