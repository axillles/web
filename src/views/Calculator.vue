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
          <span class="number-display">{{ loadersCount }}</span>
          <button @click="incrementLoaders">+</button>
        </div>
      </div>

      <div class="form-group" v-if="needsTime">
        <label>Длительность (часов)</label>
        <div class="number-input">
          <button @click="decrementDuration">-</button>
          <span class="number-display">{{ duration }}</span>
          <button @click="incrementDuration">+</button>
        </div>
      </div>

      <div class="form-group" v-if="needsLevel">
        <label>Этаж</label>
        <div class="number-input">
          <button @click="decrementLevel">-</button>
          <span class="number-display">{{ level }}</span>
          <button @click="incrementLevel">+</button>
        </div>
      </div>

      <div class="form-group" v-if="needsTransport">
        <label>Тип транспорта</label>
        <select v-model="vehicleType">
          <option value="gazelle">Газель (до 15 кубов)</option>
          <option value="truck">Грузовик (до 30 кубов)</option>
        </select>
      </div>

      <div class="result-section">
        <div class="total-price">
          <span class="price-label">Стоимость:</span>
          <span class="price-value">{{ totalPrice }} BYN</span>
        </div>
        <button class="order-button" @click="showOrderForm = true">
          Заказать
        </button>
      </div>
    </div>

    <!-- Модальное окно заказа -->
    <div v-if="showOrderForm" class="modal">
      <div class="modal-content">
        <button class="close-button" @click="showOrderForm = false">&times;</button>
        <OrderForm
          :service-price="totalPrice"
          :service-id="1"
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
      level: 2,
      vehicleType: 'gazelle',
      pricePerHour: {
        loader: 15,
        gazelle: 45,
        truck: 90,
      },
      showOrderForm: false,
      selectedService: {
        id: 1, // ID услуги для квартирного переезда
        price: 15, // Базовая цена за грузчика
      },
      calculatedPrice: 0, // Добавляем поле для хранения рассчитанной цены
      ordersStore: null // Добавляем поле для store
    }
  },
  created() {
    // Инициализируем store при создании компонента
    this.ordersStore = useOrdersStore()
  },
  computed: {
    needsTransport() {
      return ['moving', 'office'].includes(this.serviceType)
    },
    needsTime() {
      return ['moving', 'office', 'loading'].includes(this.serviceType)
    },
    needsLevel(){
    return['lifting'].includes(this.serviceType)
    },
    totalPrice() {
      let price = 0

      // Базовая стоимость в зависимости от типа услуги
      switch (this.serviceType) {
        case 'moving':
          price = 50
          break
        case 'office':
          price = 60
          break
        case 'loading':
          price = 40
          break
        case 'lifting':
          price = 2
          break
      }

      // Умножаем на количество часов
      price *= this.duration

      // Добавляем стоимость за грузчиков
      price += this.loadersCount * this.pricePerHour.loader * this.duration

      // Добавляем стоимость за этажи
      if (this.serviceType === 'lifting') {
        price += this.level * 2
      }

      // Добавляем стоимость за транспорт
      if (this.needsTransport) {
        price += this.pricePerHour[this.vehicleType] * this.duration
      }

      return Math.round(price)
    }
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
    incrementDuration() {
      if (this.duration < 24) {
        this.duration++
      }
    },
    decrementDuration() {
      if (this.duration > 1) {
        this.duration--
      }
    },
    incrementLevel() {
      if (this.level < 50) {
        this.level++
      }
    },
    decrementLevel() {
      if (this.level < 50) {
        this.level--
      }
    },
    async handleOrderSubmit(orderData) {
      try {
        // Сначала вычисляем скидку
        const discount = orderData.service_price - orderData.final_price

        const orderDetails = {
          ...orderData,
          service_type: this.serviceType,
          hours: this.duration,
          workers: this.loadersCount,
          vehicle_type: this.needsTransport ? this.vehicleType : null,
          // Правильно передаем цены
          total_price: orderData.final_price, // Цена со скидкой (4185)
          original_price: orderData.service_price, // Изначальная цена (4650)
          discount: discount, // Размер скидки (465)
          status: 'new'
        }

        console.log('Отправляемые данные:', {
          final_price: orderData.final_price,
          service_price: orderData.service_price,
          discount: discount
        })

        await this.ordersStore.createOrder(orderDetails)
        this.showOrderForm = false
        this.showToast('Заказ успешно оформлен!', 'success')
      } catch (error) {
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
  watch: {
    totalPrice(newPrice) {
      this.calculatedPrice = newPrice
    }
  }
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

.level-input {
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

.number-display {
  min-width: 60px;
  text-align: center;
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 500;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-price {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.price-label {
  font-size: 1.2rem;
  color: #b3b3b3;
}

.price-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1db954;
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
  padding: 1rem;
}

.modal-content {
  background: #282828;
  padding: 1rem;
  border-radius: 8px;
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.close-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #b3b3b3;
  z-index: 1;
}
</style>
