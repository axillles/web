<template>
  <div class="order-form">
    <h3>Оформление заказа</h3>

    <form @submit.prevent="submitOrder">
      <div class="form-group">
        <label>Ваше имя*</label>
        <input
          type="text"
          v-model="formData.contact_name"
          required
          class="form-control"
          placeholder="Как к вам обращаться"
          @input="validateName"
        />
        <small class="error-message" v-if="errors.contact_name">{{ errors.contact_name }}</small>
      </div>

      <div class="form-group">
        <label>Телефон*</label>
        <input
          type="tel"
          v-model="formData.phone"
          required
          class="form-control"
          placeholder="+375 XX XXX-XX-XX"
          @input="formatPhone"
        />
        <small>Наш менеджер перезвонит для уточнения деталей</small>
        <small class="error-message" v-if="errors.phone">{{ errors.phone }}</small>
      </div>

      <div class="form-group">
        <label>Адрес*</label>
        <input
          type="text"
          v-model="formData.address"
          required
          class="form-control"
          placeholder="Укажите адрес"
        />
        <small class="error-message" v-if="errors.address">{{ errors.address }}</small>
      </div>

      <div class="form-group">
        <label>Дата и время*</label>
        <input
          type="datetime-local"
          v-model="formData.datetime"
          required
          class="form-control"
          :min="minDateTime"
        />
        <small>Выберите желаемую дату и время</small>
        <small class="error-message" v-if="errors.datetime">{{ errors.datetime }}</small>
      </div>

      <div class="form-group">
        <label>Способ оплаты*</label>
        <div class="payment-buttons">
          <button
            type="button"
            class="payment-button"
            :class="{ active: formData.payment_method === 'cash' }"
            @click="formData.payment_method = 'cash'"
          >
            Наличными
          </button>
          <button
            type="button"
            class="payment-button"
            :class="{ active: formData.payment_method === 'card' }"
            @click="formData.payment_method = 'card'"
          >
            Картой
          </button>
        </div>
      </div>

      <div class="form-group">
        <label>Промокод</label>
        <div class="promo-input">
          <input
            type="text"
            v-model="formData.promo_code"
            class="form-control"
            placeholder="Если есть промокод"
            :disabled="promoApplied"
          />
          <button
            type="button"
            class="btn-apply-promo"
            :disabled="!formData.promo_code || promoApplied"
            @click="validatePromocode"
          >
            {{ promoApplied ? 'Применен' : 'Применить' }}
          </button>
        </div>
        <small class="error-message" v-if="errors.promo_code">{{ errors.promo_code }}</small>
        <div v-if="promoApplied" class="promo-info">
          <span class="discount-amount">Скидка: {{ discount }} ₽</span>
          <button class="btn-remove-promo" @click="removePromo">×</button>
        </div>
      </div>

      <div class="form-group">
        <label>Комментарий</label>
        <textarea
          v-model="formData.comment"
          class="form-control"
          rows="3"
          placeholder="Дополнительная информация"
        ></textarea>
      </div>

      <div class="total-amount">
        <div v-if="promoApplied" class="original-price">
          <s>{{ servicePrice }} ₽</s>
        </div>
        <div class="final-price">
          Итого: {{ finalPrice }} ₽
        </div>
      </div>

      <button
        type="submit"
        class="btn-primary"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? 'Отправка...' : 'Оформить заказ' }}
      </button>
    </form>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { usePromocodesStore } from '@/stores/promocodes'

export default {
  name: 'OrderForm',
  props: {
    serviceId: {
      type: Number,
      required: true
    },
    servicePrice: {
      type: Number,
      required: true
    }
  },
  data() {
    const authStore = useAuthStore()
    const userData = authStore.user?.user_metadata || {}

    return {
      formData: {
        contact_name: userData.name || '',
        phone: userData.phone || '',
        address: '',
        datetime: '',
        payment_method: '',
        promo_code: '',
        comment: ''
      },
      isSubmitting: false,
      errors: {
        contact_name: '',
        phone: '',
        address: '',
        datetime: '',
        promo_code: ''
      },
      promocodesStore: usePromocodesStore(),
      promoApplied: false,
      discount: 0
    }
  },
  computed: {
    finalPrice() {
      const price = Number(this.servicePrice) || 0
      const discount = Number(this.discount) || 0
      return Math.max(0, price - discount)
    },
    minDateTime() {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(8, 0, 0, 0)
      return tomorrow.toISOString().slice(0, 16)
    }
  },
  methods: {
    validateName() {
      const nameRegex = /^[а-яА-ЯёЁa-zA-Z\s-]+$/
      if (!nameRegex.test(this.formData.contact_name)) {
        this.errors.contact_name = 'Имя должно содержать только буквы'
        return false
      }
      this.errors.contact_name = ''
      return true
    },

    formatPhone() {
      const phoneRegex = /^\+375\s\d{2}\s\d{3}-\d{2}-\d{2}$/
      if (phoneRegex.test(this.formData.phone)) {
        this.errors.phone = ''
        return true
      }

      let phone = this.formData.phone.replace(/\D/g, '')

      if (phone.startsWith('375')) {
        phone = '+' + phone
      } else if (phone.startsWith('80')) {
        phone = '+375' + phone.slice(2)
      }

      if (phone.length >= 13) {
        phone = phone.slice(0, 13)
        this.formData.phone = phone.replace(/(\+375)(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3-$4-$5')
      }

      if (!phoneRegex.test(this.formData.phone)) {
        this.errors.phone = 'Введите корректный номер телефона'
        return false
      }
      this.errors.phone = ''
      return true
    },

    async validatePromocode() {
      if (!this.formData.promo_code) return true

      try {
        const result = await this.promocodesStore.validatePromocode(
          this.formData.promo_code,
          this.servicePrice
        )

        if (result.isValid) {
          this.promoApplied = true
          this.discount = result.discount
          this.errors.promo_code = ''
          this.$emit('message', {
            text: `Промокод применен! Скидка: ${result.discount} ₽`,
            type: 'success'
          })
        }
        return true
      } catch (error) {
        this.errors.promo_code = error.message
        this.$emit('message', {
          text: error.message,
          type: 'error'
        })
        return false
      }
    },

    removePromo() {
      this.promoApplied = false
      this.discount = 0
      this.formData.promo_code = ''
      this.errors.promo_code = ''
    },

    validateForm() {
      let isValid = true
      this.errors = {}

      if (!this.formData.contact_name) {
        this.errors.contact_name = 'Введите ваше имя'
        isValid = false
      }

      if (!this.formData.phone) {
        this.errors.phone = 'Введите номер телефона'
        isValid = false
      }

      if (!this.formData.address) {
        this.errors.address = 'Укажите адрес'
        isValid = false
      }

      if (!this.formData.datetime) {
        this.errors.datetime = 'Выберите дату и время'
        isValid = false
      }

      if (!this.formData.payment_method) {
        this.errors.payment_method = 'Выберите способ оплаты'
        isValid = false
      }

      return isValid && this.validateName() && this.formatPhone()
    },

    async submitOrder() {
      if (!this.validateForm()) {
        return
      }

      this.isSubmitting = true

      const orderData = {
        contact_name: this.formData.contact_name.trim(),
        phone: this.formData.phone,
        address: this.formData.address.trim(),
        datetime: this.formData.datetime,
        payment_method: this.formData.payment_method,
        promo_code: this.promoApplied ? this.formData.promo_code : null,
        service_price: this.servicePrice,
        final_price: this.finalPrice,
        comment: this.formData.comment || null
      }

      console.log('Отправляемые данные из формы:', {
        service_price: this.servicePrice,
        final_price: this.finalPrice,
        discount: this.discount
      })

      this.$emit('submit', orderData)
      this.isSubmitting = false
    }
  }
}
</script>

<style scoped>
.order-form {
  max-width: 500px;
  margin: 0 auto;
  background: #2a2a2a;
  padding: 1.5rem;
  border-radius: 8px;
  max-height: calc(90vh - 4rem); /* Высота с учетом отступов */
  overflow-y: auto; /* Добавляем прокрутку */
}

/* Стилизуем скроллбар */
.order-form::-webkit-scrollbar {
  width: 8px;
}

.order-form::-webkit-scrollbar-track {
  background: #2a2a2a;
}

.order-form::-webkit-scrollbar-thumb {
  background: #404040;
  border-radius: 4px;
}

.order-form::-webkit-scrollbar-thumb:hover {
  background: #505050;
}

h3 {
  margin-top: 0;
  margin-bottom: 1rem; /* Уменьшаем отступ */
  text-align: center;
}

.form-group {
  margin-bottom: 1rem; /* Уменьшаем отступ */
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem; /* Уменьшаем отступ */
  font-size: 0.9rem; /* Уменьшаем размер шрифта */
}

.form-control {
  width: 100%;
  padding: 0.5rem 0.75rem; /* Уменьшаем padding */
  background: #404040;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #ffffff;
}

textarea.form-control {
  resize: vertical;
  min-height: 60px; /* Уменьшаем минимальную высоту */
}

.btn-primary {
  width: 100%;
  background: #1db954;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

small {
  font-size: 0.8rem; /* Уменьшаем размер шрифта */
  margin-top: 0.25rem;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
}

.payment-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.payment-button {
  flex: 1;
  padding: 0.5rem 1rem; /* Уменьшаем padding */
  border: 2px solid #404040;
  border-radius: 4px;
  background: #282828;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem; /* Уменьшаем размер шрифта */
}

.payment-button:hover {
  background: #404040;
  border-color: #1db954;
}

.payment-button.active {
  background: #1db954;
  border-color: #1db954;
  color: white;
}

.error-message {
  display: block;
  color: #ff4444;
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.promo-input {
  display: flex;
  gap: 0.5rem;
}

.btn-apply-promo {
  padding: 0.75rem 1rem;
  background: #1db954;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-apply-promo:disabled {
  background: #404040;
  cursor: not-allowed;
}

.promo-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: #1db954;
}

.btn-remove-promo {
  background: none;
  border: none;
  color: #ff4444;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
}

.total-amount {
  margin: 0.75rem 0;
}

.original-price {
  color: #b3b3b3;
  font-size: 0.9rem;
}

.final-price {
  color: #1db954;
  font-size: 1.2rem;
  font-weight: bold;
}

input[type="datetime-local"] {
  width: 100%;
  padding: 0.75rem;
  background: #404040;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #ffffff;
}

input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}
</style>
