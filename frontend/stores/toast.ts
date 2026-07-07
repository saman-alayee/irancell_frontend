export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

let nextId = 0

export const useToastStore = defineStore('toast', {
  state: () => ({
    items: [] as ToastItem[],
  }),

  actions: {
    show(message: string, type: ToastType = 'info', durationMs = 4500) {
      const id = ++nextId
      this.items.push({ id, message, type })
      if (import.meta.client) {
        setTimeout(() => this.remove(id), durationMs)
      }
    },

    success(message: string) {
      this.show(message, 'success')
    },

    error(message: string) {
      this.show(message, 'error', 6000)
    },

    info(message: string) {
      this.show(message, 'info')
    },

    warning(message: string) {
      this.show(message, 'warning', 5500)
    },

    remove(id: number) {
      this.items = this.items.filter((t) => t.id !== id)
    },
  },
})
