import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    admin: null as { id: string; email: string; name: string } | null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
  },

  actions: {
    loadFromStorage() {
      if (import.meta.client) {
        this.token = localStorage.getItem('admin_token')
        const admin = localStorage.getItem('admin_user')
        if (admin) this.admin = JSON.parse(admin)
      }
    },

    async login(email: string, password: string) {
      const { apiFetch } = useApi()
      const res = await apiFetch('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      this.token = res.data.token
      this.admin = res.data.admin
      if (import.meta.client) {
        localStorage.setItem('admin_token', res.data.token)
        localStorage.setItem('admin_user', JSON.stringify(res.data.admin))
      }
    },

    logout() {
      this.token = null
      this.admin = null
      if (import.meta.client) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
      }
    },
  },
})
