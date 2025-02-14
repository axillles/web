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
        />
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
      </div>

      <div class="form-group">
        <label>Способ оплаты*</label>
        <select
          v-model="formData.payment_method"
          required
          class="form-control"
        >
          <option value="">Выберите способ оплаты</option>
          <option value="cash">Наличными</option>
          <option value="card">Картой</option>
        </select>
      </div>

      <div class="form-group">
        <label>Промокод</label>
        <input
          type="text"
          v-model="formData.promo_code"
          class="form-control"
          placeholder="Если есть промокод"
        />
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
      isSubmitting: false
    }
  },
  methods: {
    formatPhone() {
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
    },

    submitOrder() {
      if (!this.formData.contact_name || !this.formData.phone || !this.formData.payment_method) {
        this.$emit('message', {
          text: 'Заполните все обязательные поля',
          type: 'error'
        })
        return
      }

      // Передаем только необходимые данные
      const orderData = {
        contact_name: this.formData.contact_name,
        phone: this.formData.phone,
        payment_method: this.formData.payment_method
      }

      this.$emit('submit', orderData)
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
</style>
