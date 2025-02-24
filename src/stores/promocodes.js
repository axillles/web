import { defineStore } from 'pinia'
import { supabase } from '@/config/supabase'

export const usePromocodesStore = defineStore('promocodes', {
  state: () => ({
    loading: false,
    error: null
  }),

  actions: {
    async validatePromocode(code, orderAmount) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from('promocodes')
          .select('*')
          .eq('code', code)
          .single()

        if (error) throw error

        if (!data) {
          throw new Error('Промокод не найден')
        }

        // Проверяем срок действия
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          throw new Error('Срок действия промокода истек')
        }

        // Проверяем количество использований
        if (data.uses_left !== null && data.uses_left <= 0) {
          throw new Error('Промокод больше недоступен')
        }

        // Проверяем минимальную сумму заказа
        if (data.min_order_amount && orderAmount < data.min_order_amount) {
          throw new Error(`Минимальная сумма заказа для промокода: ${data.min_order_amount} ₽`)
        }

        // Рассчитываем скидку
        let discount = Math.floor(orderAmount * (data.discount_percent / 100))

        // Проверяем максимальную скидку
        if (data.max_discount && discount > data.max_discount) {
          discount = data.max_discount
        }

        return {
          isValid: true,
          discount,
          promoData: data
        }
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
