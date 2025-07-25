<template>
  <div class="catalog">
    <h1>Каталог услуг</h1>

    <!-- Фильтры и сортировка с анимацией -->
    <transition name="slide-fade">
      <div class="filters-container" v-show="!isFiltersHidden">
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
            <span class="cart-total">{{ cartStore.totalPrice }} руб</span>
            <router-link to="/cart" class="btn-cart">Перейти в корзину</router-link>
          </div>
        </div>
      </div>
    </transition>

    <!-- Кнопка показа фильтров с анимацией -->
    <transition name="fade">
      <button
        v-if="isFiltersHidden"
        @click="toggleFilters"
        class="show-filters-btn"
      >
        <i class="fas fa-filter"></i> Фильтры
      </button>
    </transition>

    <!-- Список услуг -->
    <div class="services-grid" :class="{ 'has-top-margin': isFiltersHidden }">
      <ServiceCard
        v-for="service in filteredAndSortedServices"
        :key="service.id"
        :service="service"
        @added-to-cart="showAddedToCartMessage"
      />
    </div>

    <!-- Плавающая кнопка корзины -->
    <transition name="fade">
      <div v-if="isFiltersHidden && cartStore.totalItems > 0" class="floating-cart" @click="goToCart">
        <div class="cart-icon">
          <i class="fas fa-shopping-cart"></i>
          <span class="cart-badge">{{ cartStore.totalItems }}</span>
        </div>
        <div class="cart-total">{{ cartStore.totalPrice }} руб</div>
      </div>
    </transition>

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
      lastScrollTop: 0,
      isFiltersHidden: false,
      scrollThreshold: 100, // пикселей прокрутки для скрытия фильтров
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
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
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
    handleScroll() {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop

      // Прокрутка вниз
      if (currentScrollTop > this.lastScrollTop && currentScrollTop > this.scrollThreshold) {
        this.isFiltersHidden = true
      }
      // Прокрутка вверх до верха страницы
      else if (currentScrollTop < this.scrollThreshold) {
        this.isFiltersHidden = false
      }

      this.lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop
    },
    toggleFilters() {
      this.isFiltersHidden = !this.isFiltersHidden
    },
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
    },
    goToCart() {
      this.$router.push('/cart');
    },
  },
  inject: ['showToast'],
}
</script>

<style scoped>
.catalog {
  padding: 2rem;
  min-height: 100vh;
  color: var(--text-primary);
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.filters-container {
  position: sticky;
  top: 0;
  background: var(--bg-primary);
  padding: 1rem 0;
  margin-bottom: 2rem;
  z-index: 10;
  width: 100%;
}

/* Анимации для плавного появления/исчезновения */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 500px;
  overflow: hidden;
  opacity: 1;
  margin-bottom: 2rem;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  max-height: 0;
  opacity: 0;
  margin-bottom: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.show-filters-btn {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 100;
  background: var(--accent-primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: var(--card-shadow);
  transition: var(--transition-standard);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.show-filters-btn:hover {
  background: var(--accent-secondary);
  transform: translateY(-2px);
}

.has-top-margin {
  margin-top: 2rem;
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
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  transition: var(--transition-standard);
}

.search-input:focus {
  outline: none;
  background: var(--bg-elevated);
  box-shadow: 0 0 0 2px var(--accent-primary);
}

.search-input::placeholder {
  color: var(--text-secondary);
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
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition-standard);
}

.category-button:hover {
  background: var(--bg-elevated);
}

.category-button.active {
  background: var(--accent-primary);
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
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition-standard);
  font-size: 1rem;
}

.sort-button:hover {
  background: var(--bg-elevated);
}

.sort-button.active {
  background: var(--accent-primary);
  color: white;
}

.cart-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: 50px;
}

.cart-count {
  color: var(--text-secondary);
}

.cart-total {
  color: var(--accent-primary);
  font-weight: bold;
}

.btn-cart {
  background: var(--accent-primary);
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  transition: var(--transition-standard);
}

.btn-cart:hover {
  background: var(--accent-secondary);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  transition: margin-top 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.service-card {
  position: relative;
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  transition: var(--transition-standard);
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--card-hover-shadow);
  background: var(--bg-elevated);
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
  color: var(--text-primary);
}

.service-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.service-price {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--accent-primary);
  margin-bottom: 1rem;
}

.order-button {
  background: var(--accent-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  cursor: pointer;
  width: 100%;
  font-size: 1.1rem;
  transition: var(--transition-standard);
}

.order-button:hover {
  background: var(--accent-secondary);
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
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 8px;
  position: relative;
  width: 90%;
  max-width: 500px;
  box-shadow: var(--card-shadow);
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: var(--transition-standard);
}

.close-button:hover {
  color: var(--text-primary);
}

.modal-content h2 {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

/* Плавающая кнопка корзины */
.floating-cart {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: var(--accent-primary);
  color: black;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 100;
}

.floating-cart:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  background: var(--accent-secondary);
}

.floating-cart:active {
  transform: translateY(-1px);
}

.cart-icon {
  position: relative;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--error-color);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.cart-total {
  font-weight: 600;
  font-size: 1rem;
  color: black;
}

@media (max-width: 768px) {
  .catalog {
    padding: 1rem;
  }

  .filters-content {
    padding: 0.75rem;
    flex-direction: column;
    gap: 0.75rem;
  }

  .search-container {
    width: 100%;
  }

  .search-input {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    width: 100%;
  }

  .categories {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }

  .category-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
    min-width: unset;
    flex: 0 0 auto;
  }

  .sort-controls {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }

  .sort-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
    min-width: unset;
  }

  .services-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .cart-summary {
    flex-direction: column;
    padding: 0.75rem;
    gap: 0.5rem;
    align-items: center;
  }

  .btn-cart {
    width: 100%;
    text-align: center;
  }

  .show-filters-btn {
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  .floating-cart {
    bottom: 1rem;
    right: 1rem;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .catalog h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .services-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .category-button,
  .sort-button {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }

  .services-grid.has-top-margin {
    margin-top: 1.5rem;
  }

  .modal-content {
    padding: 1rem;
    width: 95%;
  }
}

/* Улучшение адаптивности для планшетов */
@media (min-width: 769px) and (max-width: 1024px) {
  .services-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  .filters-content {
    padding: 1rem;
    flex-wrap: wrap;
  }

  .search-container {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}

/* Удаляем старые стили для select */
.sort-select {
  display: none;
}
</style>
