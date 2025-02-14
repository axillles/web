<template>
  <div class="catalog">
    <div class="catalog-header">
      <h1 class="catalog-title">Каталог услуг</h1>
      <div class="catalog-controls">
        <div class="filters">
          <div class="filter-group">
            <label>Категория:</label>
            <select v-model="selectedCategory">
              <option value="">Все категории</option>
              <option value="loaders">Грузчики</option>
              <option value="transport">Транспорт</option>
              <option value="combos">Готовые комплексы</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Сортировка:</label>
            <select v-model="sortBy">
              <option value="price-asc">Цена: по возрастанию</option>
              <option value="price-desc">Цена: по убыванию</option>
              <option value="popular">По популярности</option>
            </select>
          </div>
        </div>
      </div>
      <div class="cart-info" v-if="cartStore.totalItems > 0">
        <router-link to="/cart" class="cart-link">
          Корзина ({{ cartStore.totalItems }})
        </router-link>
      </div>
    </div>

    <div class="services-grid">
      <ServiceCard
        v-for="service in services"
        :key="service.id"
        :service="service"
        @added-to-cart="handleAddedToCart"
        @details="handleDetails"
      />
    </div>

    <!-- Модальное окно заказа -->
    <div v-if="selectedService" class="modal">
      <div class="modal-content">
        <button class="close-button" @click="selectedService = null">&times;</button>
        <h2>Оформление заказа</h2>
        <OrderForm
          :service-price="selectedService.price"
          :service-id="selectedService.id"
          @submit="handleOrderSubmit"
          @close="selectedService = null"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ServiceCard from '@/components/ServiceCard.vue'
import { useServicesStore } from '@/stores/services'
import OrderForm from '@/components/OrderForm.vue'
import { useOrdersStore } from '@/stores/orders'
import { useCartStore } from '@/stores/cart'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Catalog',
  components: {
    ServiceCard,
    OrderForm,
  },
  data() {
    return {
      selectedCategory: '',
      sortBy: 'price-asc',
      servicesStore: useServicesStore(),
      selectedService: null,
      cartStore: useCartStore(),
    }
  },
  computed: {
    services() {
      let filtered = [...this.servicesStore.getAllServices]

      // Фильтрация по категории
      if (this.selectedCategory) {
        filtered = filtered.filter((service) => service.category === this.selectedCategory)
      }

      // Сортировка
      filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'price-asc':
            return a.price - b.price
          case 'price-desc':
            return b.price - a.price
          default:
            return 0
        }
      })

      return filtered
    },
  },
  async created() {
    try {
      await this.servicesStore.fetchServices()
    } catch (error) {
      this.showToast('Ошибка при загрузке услуг', 'error')
    }
  },
  methods: {
    handleAddedToCart(service) {
      this.showToast(`Услуга "${service.title}" добавлена в корзину`, 'success')
    },
    handleDetails(service) {
      this.$router.push({
        name: 'ServiceDetails',
        params: { id: service.id },
      })
    },
    showOrderForm(service) {
      this.selectedService = service
    },
    async handleOrderSubmit(orderData) {
      try {
        const ordersStore = useOrdersStore()
        await ordersStore.createOrder({
          ...orderData,
          serviceId: this.selectedService.id,
        })
        this.selectedService = null
        this.showToast('Заказ успешно оформлен!', 'success')
      } catch (error) {
        console.error('Ошибка при оформлении заказа:', error)
        this.showToast(error.message || 'Ошибка при оформлении заказа', 'error')
      }
    },
  },
  inject: ['showToast'],
}
</script>

<style scoped>
.catalog {
  padding: 2rem;
  background: #121212;
  min-height: 100vh;
}

.catalog-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.catalog-title {
  text-align: center;
  color: #ffffff;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.catalog-controls {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.9rem;
  color: #b3b3b3;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-group select {
  padding: 0.75rem;
  border: 1px solid #404040;
  border-radius: 4px;
  background: #404040;
  color: #ffffff;
  min-width: 200px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-group select:hover {
  border-color: #1db954;
}

.filter-group select:focus {
  outline: none;
  border-color: #1db954;
}

.filter-group select option {
  background: #404040;
  color: #ffffff;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.service-card {
  position: relative;
  padding: 2rem;
  background: #282828;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  background: #404040;
}

.service-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.service-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #ffffff;
}

.service-description {
  color: #b3b3b3;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.service-price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1db954;
  margin-bottom: 1rem;
}

.order-button {
  background: #1db954;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  cursor: pointer;
  width: 100%;
  font-size: 1.1rem;
  transition: background 0.3s ease;
}

.order-button:hover {
  background: #1ed760;
}

/* Стили для модального окна */
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
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
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

.modal-content h2 {
  color: #ffffff;
  margin-bottom: 1.5rem;
}

.cart-info {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.cart-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  background: #1db954;
  color: #ffffff;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cart-link:hover {
  background: #1ed760;
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(29, 185, 84, 0.3);
}
</style>
