<template>
  <div class="calculator">
    <h1>Калькулятор стоимости</h1>

    <div class="calculator-form">
      <div class="form-group">
        <label>Тип услуги</label>
        <select v-model="serviceType">
          <option value="moving">Квартирный переезд</option>
          <option value="office">Офисный переезд</option>
          <option value="loading">Погрузка/разгрузка</option>
          <option value="lifting">Подъем на этаж</option>
        </select>
      </div>

      <div class="form-group">
        <label>Количество грузчиков</label>
        <div class="number-input">
          <button @click="decrementLoaders">-</button>
          <input type="number" v-model="loadersCount" min="1" max="10" />
          <button @click="incrementLoaders">+</button>
        </div>
      </div>

      <div class="form-group">
        <label>Длительность (часов)</label>
        <input type="number" v-model="duration" min="1" />
      </div>

      <div class="form-group" v-if="needsTransport">
        <label>Тип транспорта</label>
        <select v-model="vehicleType">
          <option value="gazelle">Газель (до 1.5 тонн)</option>
          <option value="truck">Грузовик (до 5 тонн)</option>
        </select>
      </div>

      <div class="total-section">
        <h2>Итоговая стоимость</h2>
        <div class="price">{{ calculateTotal }} BYN</div>
        <button class="order-button" @click="showOrder">Заказать</button>
      </div>
    </div>

    <!-- Модальное окно заказа -->
    <div v-if="showOrderForm" class="modal">
      <div class="modal-content">
        <button class="close-button" @click="showOrderForm = false">&times;</button>
        <h2>Оформление заказа</h2>
        <OrderForm
          :service-price="calculateTotal / duration"
          :service-id="1"
          :initial-duration="duration"
          @submit="handleOrderSubmit"
          @close="showOrderForm = false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import OrderForm from '@/components/OrderForm.vue'
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Calculator',
  components: {
    OrderForm,
  },
  data() {
    return {
      serviceType: 'moving',
      loadersCount: 2,
      duration: 3,
      vehicleType: 'gazelle',
      pricePerHour: {
        loader: 350,
        gazelle: 800,
        truck: 1200,
      },
      showOrderForm: false,
      selectedService: {
        id: 1, // ID услуги для квартирного переезда
        price: 350, // Базовая цена за грузчика
      },
    }
  },
  computed: {
    needsTransport() {
      return ['moving', 'office'].includes(this.serviceType)
    },
    calculateTotal() {
      let total = this.loadersCount * this.pricePerHour.loader * this.duration

      if (this.needsTransport) {
        total += this.pricePerHour[this.vehicleType] * this.duration
      }

      return total
    },
  },
  methods: {
    incrementLoaders() {
      if (this.loadersCount < 10) {
        this.loadersCount++
      }
    },
    decrementLoaders() {
      if (this.loadersCount > 1) {
        this.loadersCount--
      }
    },
    async handleOrderSubmit(orderData) {
      try {
        const ordersStore = useOrdersStore()

        // Проверяем наличие обязательных полей
        if (!orderData.contact_name || !orderData.phone || !orderData.payment_method) {
          throw new Error('Заполните все обязательные поля')
        }

        // Формируем название услуги
        const serviceTypes = {
          moving: 'Квартирный переезд',
          office: 'Офисный переезд',
          loading: 'Погрузка/разгрузка',
          lifting: 'Подъем на этаж'
        }

        // Логируем входящие данные
        console.log('Входящие данные заказа:', orderData)

        const orderDetails = {
          contact_name: orderData.contact_name.trim(),
          phone: orderData.phone,
          payment_method: orderData.payment_method,
          service_title: serviceTypes[this.serviceType],
          approximate_price: this.calculateTotal,
          status: 'new'
        }

        // Логируем подготовленные данные
        console.log('Подготовленные данные заказа:', orderDetails)

        await ordersStore.createOrder(orderDetails)
        this.showOrderForm = false
        this.showToast('Заявка принята! Наш менеджер свяжется с вами в ближайшее время.', 'success')

      } catch (error) {
        console.error('Ошибка при оформлении заказа:', error)
        this.showToast(error.message || 'Ошибка при оформлении заказа', 'error')
      }
    },
    showOrder() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        // Показываем модальное окно авторизации
        this.$emit('show-auth')
        return
      }
      this.showOrderForm = true
    }
  },
  inject: ['showToast'],
}
</script>

<style scoped>
.calculator {
  padding: 2rem;
  background: #121212;
  min-height: 100vh;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.calculator h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #ffffff;
}

.calculator-form {
  max-width: 800px;
  width: 100%;
  padding: 2rem;
  background: #282828;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #ffffff;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #404040;
  border-radius: 4px;
  font-size: 1rem;
  background: #404040;
  color: #ffffff;
  transition: all 0.3s ease;
  height: 48px;
}

.number-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #404040;
  border-radius: 4px;
  padding: 0.25rem;
  border: 1px solid #404040;
}

.number-input button {
  width: 36px;
  height: 36px;
  border: none;
  background: #282828;
  color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.number-input button:hover {
  background: #1db954;
}

.number-input input {
  width: 60px;
  text-align: center;
  border: none;
  background: transparent;
  color: #ffffff;
  font-size: 1.1rem;
  padding: 0;
  height: 36px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #1db954;
}

.form-group select option {
  background: #404040;
  color: #ffffff;
}

.result-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #404040;
  text-align: center;
}

.result-section h2 {
  color: #b3b3b3;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.total-price {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  color: #1db954;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 20px rgba(29, 185, 84, 0.3);
}

.order-button {
  background: #1db954;
  color: white;
  border: none;
  padding: 1rem 3rem;
  border-radius: 50px;
  font-size: 1.1rem;
  cursor: pointer;
  min-width: 200px;
  font-weight: 500;
  transition: background 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.order-button:hover {
  background: #1ed760;
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(29, 185, 84, 0.3);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #282828;
  padding: 2rem;
  border-radius: 8px;
  position: relative;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #b3b3b3;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #ffffff;
}
</style>
