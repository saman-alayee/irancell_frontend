import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    dark: false as boolean,
  }),

  actions: {
    init() {
      if (!import.meta.client) return
      const saved = localStorage.getItem('theme')
      this.dark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
      this.apply()
    },

    toggle() {
      this.dark = !this.dark
      if (import.meta.client) {
        localStorage.setItem('theme', this.dark ? 'dark' : 'light')
      }
      this.apply()
    },

    apply() {
      if (!import.meta.client) return
      document.documentElement.classList.toggle('dark', this.dark)
    },
  },
})
