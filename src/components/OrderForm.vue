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
        <input
          type="text"
          v-model="formData.promo_code"
          class="form-control"
          placeholder="Если есть промокод"
          @input="validatePromoCode"
        />
        <small class="error-message" v-if="errors.promo_code">{{ errors.promo_code }}</small>
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
export default {
  name: 'OrderForm',
  props: {
    serviceId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      formData: {
        contact_name: '',
        phone: '',
        payment_method: '',
        promo_code: '',
        comment: ''
      },
      isSubmitting: false,
      errors: {
        contact_name: '',
        phone: '',
        promo_code: ''
      }
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

    validatePromoCode() {
      if (this.formData.promo_code) {
        const promoRegex = /^[a-zA-Z0-9]+$/
        if (!promoRegex.test(this.formData.promo_code)) {
          this.errors.promo_code = 'Промокод должен содержать только английские буквы и цифры'
          return false
        }
      }
      this.errors.promo_code = ''
      return true
    },

    submitOrder() {
      // Проверяем все поля перед отправкой
      const isNameValid = this.validateName()
      const isPhoneValid = this.formatPhone()
      const isPromoValid = this.validatePromoCode()

      if (!isNameValid || !isPhoneValid || !isPromoValid) {
        return
      }

      if (!this.formData.contact_name || !this.formData.phone || !this.formData.payment_method) {
        this.$emit('message', {
          text: 'Заполните все обязательные поля',
          type: 'error'
        })
        return
      }

      this.isSubmitting = true
      console.log('Данные формы перед отправкой:', this.formData)

      const orderData = {
        contact_name: this.formData.contact_name.trim(),
        phone: this.formData.phone,
        payment_method: this.formData.payment_method,
        promo_code: this.formData.promo_code || null,
        comment: this.formData.comment || null
      }

      console.log('Отправляемые данные заказа:', orderData)
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
  padding: 20px;
  border-radius: 8px;
}

h3 {
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  background: #404040;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #ffffff;
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
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
  display: block;
  margin-top: 0.5rem;
  color: #808080;
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
  gap: 1rem;
  margin-top: 0.5rem;
}

.payment-button {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: 2px solid #404040;
  border-radius: 4px;
  background: #282828;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
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
</style>
