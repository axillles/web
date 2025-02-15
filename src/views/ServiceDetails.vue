<template>
  <div class="service-details">
    <div class="navigation">
      <button class="back-button" @click="$router.back()">
        <span class="arrow">←</span> Назад
      </button>
    </div>

    <div class="service-header">
      <img :src="service.image" :alt="service.title" class="service-image" />
      <div class="service-info">
        <h1>{{ service.title }}</h1>
        <div class="service-price">от {{ service.price }} ₽/час</div>
        <button class="btn-primary" @click="addToCart">В корзину</button>
      </div>
    </div>

    <div class="service-content">
      <section class="description">
        <h2>Описание услуги</h2>
        <p>{{ service.description }}</p>
        <ul class="features">
          <li v-for="feature in service.features" :key="feature">{{ feature }}</li>
        </ul>
      </section>

      <section class="requirements">
        <h2>Требования и условия</h2>
        <ul>
          <li v-for="req in service.requirements" :key="req">{{ req }}</li>
        </ul>
      </section>

      <section class="pricing">
        <h2>Стоимость</h2>
        <div class="pricing-table">
          <div v-for="(price, type) in service.pricing" :key="type" class="price-item">
            <div class="price-type">{{ type }}</div>
            <div class="price-value">{{ price }} ₽/час</div>
          </div>
        </div>
      </section>
    </div>

    <!-- Модальное окно заказа -->
    <div v-if="showOrderForm" class="modal">
      <div class="modal-content">
        <button class="close-button" @click="showOrderForm = false">&times;</button>
        <h2>Оформление заказа</h2>
        <OrderForm
          :service-price="service.price"
          :service-id="service.id"
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
import { useServicesStore } from '@/stores/services'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'ServiceDetails',
  components: {
    OrderForm,
  },
  inject: ['showToast'],
  data() {
    return {
      showOrderForm: false,
      ordersStore: useOrdersStore(),
      servicesStore: useServicesStore(),
      cartStore: useCartStore(),
    }
  },
  computed: {
    service() {
      return this.servicesStore.getCurrentService
    },
    getCurrentPrice() {
      const now = new Date()
      const hour = now.getHours()
      const isWeekend = now.getDay() === 0 || now.getDay() === 6

      if (isWeekend) {
        return this.service?.pricing['Выходные дни']
      }
      if (hour >= 18 || hour < 9) {
        return this.service?.pricing['Вечернее время']
      }
      return this.service?.pricing['Стандартное время']
    },
  },
  methods: {
    async fetchServiceDetails() {
      try {
        const id = this.$route.params.id
        await this.servicesStore.fetchServiceById(id)
        if (!this.service) {
          throw new Error('Услуга не найдена')
        }
      } catch (error) {
        this.showToast(error.message, 'error')
        this.$router.push('/catalog')
      }
    },
    async handleOrderSubmit(orderData) {
      try {
        await this.ordersStore.createOrder({
          ...orderData,
        })

        this.showOrderForm = false
        this.showToast('Заказ успешно оформлен!', 'success')
      } catch (error) {
        console.error('Ошибка при оформлении заказа:', error)
        this.showToast(error.message || 'Ошибка при оформлении заказа', 'error')
      }
    },
    addToCart() {
      this.cartStore.addToCart(this.service)
      this.showToast('Услуга добавлена в корзину', 'success')
    },
  },
  created() {
    this.fetchServiceDetails()
  },
}
</script>

<style scoped>
.navigation {
  margin-bottom: 1rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #404040;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: #505050;
  transform: translateX(-5px);
}

.service-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.service-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.service-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
}

.service-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.service-price {
  font-size: 2rem;
  color: #007bff;
  margin: 1rem 0;
}

.service-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.description {
  grid-column: 1 / -1;
}

.features {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.features li {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.features li::before {
  content: '✓';
  color: #28a745;
  position: absolute;
  left: 0;
}

.pricing-table {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.price-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.price-value {
  font-weight: bold;
  color: #007bff;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  position: relative;
  width: 90%;
  max-width: 600px;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.btn-primary {
  background: #1db954;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-primary:hover {
  background: #1ed760;
}

.arrow {
  font-size: 1.2rem;
  line-height: 1;
}

@media (max-width: 768px) {
  .service-header {
    grid-template-columns: 1fr;
  }

  .service-content {
    grid-template-columns: 1fr;
  }

  .service-details {
    padding: 1rem;
  }
}
</style>
