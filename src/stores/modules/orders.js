import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/auth'

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

        // Проверяем обязательные поля
        if (!orderData.contact_name || !orderData.phone || !orderData.address || !orderData.datetime || !orderData.payment_method) {
          throw new Error('Не заполнены обязательные поля')
        }

        // Формируем данные заказа
        const orderDetails = {
          contact_name: orderData.contact_name.trim(),
          phone: orderData.phone.trim(),
          address: orderData.address.trim(),
          datetime: orderData.datetime,
          payment_method: orderData.payment_method,
          service_type: orderData.service_type || null,
          total_price: Number(orderData.total_price),
          original_price: Number(orderData.original_price),
          discount: Number(orderData.discount),
          promo_code: orderData.promo_code || null,
          status: 'new',
          comment: orderData.comment?.trim() || null,
          user_id: authStore.user?.id || null,
          // Для заказов из корзины сохраняем items как JSON
          items: orderData.items ? JSON.stringify(orderData.items) : null
        }

        console.log('Отправляем заказ:', orderDetails)

        const { data, error } = await supabase
          .from('service_orders')
          .insert([orderDetails])
          .select()
          .single()

        if (error) throw error

        return data
      } catch (error) {
        console.error('Error creating order:', error)
        throw new Error(error.message || 'Ошибка при создании заказа')
      } finally {
        this.loading = false
      }
    },

    async fetchUserOrders() {
      this.loading = true
      this.error = null
      try {
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated || !authStore.user?.id) {
          throw new Error('Необходима авторизация')
        }

        const userId = authStore.user.id
        console.log('Fetching orders for user:', userId)

        // Получаем как подтвержденные, так и неподтвержденные заказы
        const [confirmedOrders, unconfirmedOrders] = await Promise.all([
          supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
          supabase
            .from('unconfirmed_orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
        ])

        console.log('Confirmed orders:', confirmedOrders)
        console.log('Unconfirmed orders:', unconfirmedOrders)

        if (confirmedOrders.error) throw confirmedOrders.error
        if (unconfirmedOrders.error) throw unconfirmedOrders.error

        // Объединяем заказы и сортируем по дате
        const allOrders = [...(confirmedOrders.data || []), ...(unconfirmedOrders.data || [])]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

        console.log('Combined orders:', allOrders)

        this.orders = allOrders
        return allOrders
      } catch (error) {
        console.error('Error fetching orders:', error)
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
