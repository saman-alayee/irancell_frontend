export const useApi = () => {
  const config = useRuntimeConfig()

  const getApiBase = (): string => {
    const base = config.public.apiBase || 'http://127.0.0.1:3001/api'
    if (base.startsWith('/')) {
      if (import.meta.server) return `http://127.0.0.1:3001${base}`
      return `${window.location.origin}${base}`
    }
    return base.replace(/\/$/, '')
  }

  const getUploadsBase = (): string => {
    const apiBase = getApiBase()
    return apiBase.replace(/\/api$/, '')
  }

  const getAuthToken = (url: string): string | null => {
    if (!import.meta.client) return null
    if (url.startsWith('/admin')) return localStorage.getItem('admin_token')
    if (url.startsWith('/auth/me')) return localStorage.getItem('user_token')
    return null
  }

  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }
    const token = getAuthToken(url)
    if (token) headers.Authorization = `Bearer ${token}`

    const path = url.startsWith('/') ? url : `/${url}`
    const response = await fetch(`${getApiBase()}${path}`, { ...options, headers })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'خطایی رخ داده است')
    return data
  }

  const apiUpload = async (url: string, formData: FormData) => {
    const headers: Record<string, string> = {}
    const token = getAuthToken(url)
    if (token) headers.Authorization = `Bearer ${token}`

    const path = url.startsWith('/') ? url : `/${url}`
    const response = await fetch(`${getApiBase()}${path}`, { method: 'POST', headers, body: formData })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'خطایی رخ داده است')
    return data
  }

  const apiUploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await apiUpload('/admin/upload/product-image', formData)
    return res.data.url
  }

  const resolveImageUrl = (url?: string) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return `${getUploadsBase()}${url}`
  }

  return {
    apiFetch, apiUpload, apiUploadImage, getApiBase, getUploadsBase, resolveImageUrl,
    formatPrice, formatNumber, statusLabel, statusColor,
  }
}

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('fa-IR').format(price) + ' تومان'

export const formatNumber = (num: string) => {
  if (num.length === 11) return `${num.slice(0, 4)} ${num.slice(4, 7)} ${num.slice(7)}`
  return num
}

export const statusLabel: Record<string, string> = {
  available: 'موجود', reserved: 'رزرو شده', sold: 'فروخته شده',
  pending: 'در انتظار پرداخت', paid: 'پرداخت شده', processing: 'در حال پردازش',
  completed: 'تکمیل شده', cancelled: 'لغو شده',
}

export const statusColor: Record<string, string> = {
  available: 'badge-green', reserved: 'badge-yellow',
  sold: 'badge-red', pending: 'badge-yellow',
  paid: 'badge-green', processing: 'badge-blue',
  completed: 'badge-green', cancelled: 'badge-gray',
}
