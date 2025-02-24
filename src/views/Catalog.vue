<template>
  <div class="catalog">
    <h1>Каталог услуг</h1>

    <!-- Фильтры и сортировка -->
    <div class="filters-container">
      <div class="filters-content">
        <!-- Поиск -->
        <div class="search-container">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Поиск услуг..."
            class="search-input"
          >
        </div>

        <!-- Категории -->
        <div class="categories">
          <button
            v-for="category in categories"
            :key="category.id"
            :class="{ active: selectedCategory === category.id }"
            @click="selectedCategory = category.id"
            class="category-button"
          >
            {{ category.name }}
          </button>
        </div>

        <!-- Сортировка -->
        <div class="sort-controls">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            :class="{ active: sortBy === option.value }"
            @click="sortBy = option.value"
            class="sort-button"
          >
            {{ option.label }}
          </button>
        </div>

        <!-- Корзина -->
        <div class="cart-summary" v-if="cartStore.totalItems > 0">
          <span class="cart-count">{{ cartStore.totalItems }} услуг</span>
          <span class="cart-total">{{ cartStore.totalPrice }} ₽</span>
          <router-link to="/cart" class="btn-cart">Перейти в корзину</router-link>
        </div>
      </div>
    </div>

    <!-- Список услуг -->
    <div class="services-grid">
      <ServiceCard
        v-for="service in filteredAndSortedServices"
        :key="service.id"
        :service="service"
        @added-to-cart="showAddedToCartMessage"
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
      sortBy: 'price_asc',
      servicesStore: useServicesStore(),
      selectedService: null,
      cartStore: useCartStore(),
      isLoading: true,
      categories: [
        { id: '', name: 'Все услуги' },
        { id: 'loaders', name: 'Грузчики' },
        { id: 'transport', name: 'Транспорт' },
        { id: 'combos', name: 'Готовые комплексы' }
      ],
      sortOptions: [
        { value: 'price_asc', label: '↑ По цене' },
        { value: 'price_desc', label: '↓ По цене' },
        { value: 'name_asc', label: 'А-Я' },
        { value: 'name_desc', label: 'Я-А' }
      ],
      searchQuery: '',
    }
  },
  computed: {
    filteredAndSortedServices() {
      let filtered = [...this.servicesStore.getAllServices]

      // Поиск
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        filtered = filtered.filter(service =>
          service.title.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query)
        )
      }

      // Фильтрация по категории
      if (this.selectedCategory) {
        filtered = filtered.filter((service) => service.category === this.selectedCategory)
      }

      // Сортировка
      filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'price_asc':
            return a.price - b.price
          case 'price_desc':
            return b.price - a.price
          case 'name_asc':
            return a.title.localeCompare(b.title)
          case 'name_desc':
            return b.title.localeCompare(a.title)
          default:
            return 0
        }
      })

      return filtered
    }
  },
  async created() {
    try {
      await this.servicesStore.fetchServices()
    } catch (error) {
      this.showToast('Ошибка при загрузке услуг', 'error')
    } finally {
      this.isLoading = false
    }
  },
  methods: {
    showAddedToCartMessage(service) {
      this.showToast(`Услуга "${service.title}" добавлена в корзину`, 'success')
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
    addToCart(service) {
      // Добавляем базовые параметры для каждого типа услуги
      const serviceParams = {
        moving: { hours: 3, workers: 2, vehicle_type: 'gazelle' },
        office: { hours: 4, workers: 3, vehicle_type: 'truck' },
        loading: { hours: 2, workers: 2 },
        lifting: { hours: 2, workers: 2 }
      }

      const params = serviceParams[service.type] || {}

      this.cartStore.addToCart(service, params)
      this.showToast('Услуга добавлена в корзину', 'success')
    }
  },
  inject: ['showToast'],
}
</script>

<style scoped>
.catalog {
  padding: 2rem;
  min-height: 100vh;
  color: #ffffff;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #ffffff;
}

.filters-container {
  position: sticky;
  top: 0;
  background: #121212;
  padding: 1rem 0;
  margin-bottom: 2rem;
  z-index: 10;
}

.filters-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.search-container {
  width: 100%;
  max-width: 600px;
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  background: #282828;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  background: #404040;
  box-shadow: 0 0 0 2px #1db954;
}

.search-input::placeholder {
  color: #b3b3b3;
}

.categories {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.category-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  background: #282828;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-button:hover {
  background: #404040;
}

.category-button.active {
  background: #1db954;
  color: white;
}

.sort-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.sort-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  background: #282828;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.sort-button:hover {
  background: #404040;
}

.sort-button.active {
  background: #1db954;
  color: white;
}

.cart-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: #282828;
  border-radius: 50px;
}

.cart-count {
  color: #b3b3b3;
}

.cart-total {
  color: #1db954;
  font-weight: bold;
}

.btn-cart {
  background: #1db954;
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  transition: background 0.3s ease;
}

.btn-cart:hover {
  background: #1ed760;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

@media (max-width: 768px) {
  .catalog {
    padding: 1rem;
  }

  .filters-content {
    padding: 0 1rem;
  }

  .categories {
    gap: 0.5rem;
  }

  .category-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .cart-summary {
    flex-direction: column;
    padding: 1rem;
  }

  .sort-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .search-container {
    padding: 0 1rem;
  }

  .search-input {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

/* Удаляем старые стили для select */
.sort-select {
  display: none;
}
</style>
