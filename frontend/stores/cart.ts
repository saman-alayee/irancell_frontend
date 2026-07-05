import { defineStore } from 'pinia'

export interface CartItem {
  id: string
  type: 'number' | 'product'
  number?: string
  productId?: string
  title: string
  price: number
  quantity: number
  image?: string
  maxQuantity?: number
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    discountCode: '' as string,
    discountAmount: 0 as number,
  }),

  getters: {
    count: (state) => state.items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: (state) => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    total: (state) => Math.max(0, state.items.reduce((sum, i) => sum + i.price * i.quantity, 0) - state.discountAmount),
    isEmpty: (state) => state.items.length === 0,
  },

  actions: {
    loadFromStorage() {
      if (import.meta.client) {
        const saved = localStorage.getItem('cart')
        if (saved) {
          const parsed = JSON.parse(saved)
          this.items = parsed.items || []
          this.discountCode = parsed.discountCode || ''
          this.discountAmount = parsed.discountAmount || 0
        }
      }
    },

    saveToStorage() {
      if (import.meta.client) {
        localStorage.setItem('cart', JSON.stringify({
          items: this.items,
          discountCode: this.discountCode,
          discountAmount: this.discountAmount,
        }))
      }
    },

    addNumber(number: string, price: number) {
      const exists = this.items.find(i => i.type === 'number' && i.number === number)
      if (exists) return false

      this.items.push({
        id: `num-${number}`,
        type: 'number',
        number,
        title: number,
        price,
        quantity: 1,
        maxQuantity: 1,
      })
      this.saveToStorage()
      return true
    },

    addProduct(product: { _id: string; title: string; price: number; image?: string; stock: number }, qty = 1) {
      const existing = this.items.find(i => i.type === 'product' && i.productId === product._id)
      if (existing) {
        existing.quantity = Math.min(existing.quantity + qty, product.stock)
      } else {
        this.items.push({
          id: `prod-${product._id}`,
          type: 'product',
          productId: product._id,
          title: product.title,
          price: product.price,
          quantity: qty,
          image: product.image,
          maxQuantity: product.stock,
        })
      }
      this.saveToStorage()
    },

    removeItem(id: string) {
      this.items = this.items.filter(i => i.id !== id)
      this.saveToStorage()
    },

    updateQuantity(id: string, quantity: number) {
      const item = this.items.find(i => i.id === id)
      if (!item) return
      const max = item.maxQuantity || 99
      item.quantity = Math.max(1, Math.min(quantity, max))
      this.saveToStorage()
    },

    setDiscount(code: string, amount: number) {
      this.discountCode = code
      this.discountAmount = amount
      this.saveToStorage()
    },

    clearDiscount() {
      this.discountCode = ''
      this.discountAmount = 0
      this.saveToStorage()
    },

    clear() {
      this.items = []
      this.discountCode = ''
      this.discountAmount = 0
      this.saveToStorage()
    },

    toApiItems() {
      return this.items.map(i => ({
        type: i.type,
        number: i.number,
        productId: i.productId,
        quantity: i.quantity,
      }))
    },
  },
})
