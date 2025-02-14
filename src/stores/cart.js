import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),

  actions: {
    addToCart(service) {
      const existingItem = this.items.find((item) => item.id === service.id)
      if (existingItem) {
        existingItem.quantity++
      } else {
        this.items.push({
          id: service.id,
          title: service.title,
          price: service.price,
          quantity: 1,
          image: service.image,
        })
      }
    },

    removeFromCart(serviceId) {
      this.items = this.items.filter((item) => item.id !== serviceId)
    },

    updateQuantity(serviceId, quantity) {
      const item = this.items.find((item) => item.id === serviceId)
      if (item) {
        item.quantity = quantity
      }
    },

    clearCart() {
      this.items = []
    },
  },

  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  },
})
