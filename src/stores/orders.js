import { defineStore } from 'pinia'
import { supabase } from '@/config/supabase'
import { useAuthStore } from './auth'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: [],
    loading: false,
    error: null,
  }),

  actions: {
    setError(error) {
      this.error = error?.message || 'Произошла ошибка'
    },

    async createOrder(orderData) {
      this.loading = true
      this.error = null
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          throw new Error('Необходима авторизация')
        }

        if (!orderData.datetime) {
          throw new Error('Дата и время не указаны')
        }

        // Преобразуем дату в правильный формат для PostgreSQL
        const [datePart, timePart] = orderData.datetime.split('T')
        if (!datePart || !timePart) {
          throw new Error('Неверный формат даты')
        }

        const formattedDate = `${datePart} ${timePart}:00+00`

        const { data, error } = await supabase
          .from('orders')
          .insert([
            {
              user_id: authStore.user.id,
              service_id: orderData.serviceId,
              datetime: formattedDate,
              duration: orderData.duration,
              address: orderData.address,
              contact_name: orderData.contactName,
              phone: orderData.phone,
              comment: orderData.comment,
              status: 'pending',
              price: parseFloat(orderData.totalPrice),
            },
          ])
          .select()

        if (error) throw error
        return data
      } catch (error) {
        console.error('Order creation error:', error, orderData)
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUserOrders() {
      this.loading = true
      this.error = null
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) {
          throw new Error('Необходима авторизация')
        }

        const { data, error } = await supabase
          .from('orders')
          .select(
            `
            *,
            services:service_id (
              title,
              price
            )
          `,
          )
          .eq('user_id', authStore.user.id)
          .order('datetime', { ascending: false })

        if (error) throw error

        if (data) {
          this.orders = data
          return data
        }
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async cancelOrder(orderId) {
      this.loading = true
      this.error = null
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId)

        if (error) throw error

        // Обновляем локальное состояние
        const orderIndex = this.orders.findIndex((order) => order.id === orderId)
        if (orderIndex !== -1) {
          this.orders[orderIndex].status = 'cancelled'
        }
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },
  },

  getters: {
    getUserOrders: (state) => state.orders,
    getPendingOrders: (state) => state.orders.filter((order) => order.status === 'pending'),
    getCompletedOrders: (state) => state.orders.filter((order) => order.status === 'completed'),
    getCancelledOrders: (state) => state.orders.filter((order) => order.status === 'cancelled'),
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
  },
})
