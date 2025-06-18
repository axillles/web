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

    <!-- Анимация загрузки -->
    <div v-if="isLoading" class="services-grid skeleton-grid">
      <ServiceCardSkeleton v-for="n in 6" :key="n" />
    </div>

    <!-- Список услуг с анимацией появления -->
    <transition name="fade-list">
      <div v-if="!isLoading" class="services-grid" :class="{ 'has-top-margin': isFiltersHidden }">
        <template v-if="filteredAndSortedServices.length > 0">
          <ServiceCard
            v-for="service in filteredAndSortedServices"
            :key="service.id"
            :service="service"
            @added-to-cart="showAddedToCartMessage"
          />
        </template>
        <p v-else class="no-services">По вашему запросу услуги не найдены.</p>
      </div>
    </transition>

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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useServicesStore } from '@/stores/modules/services'
import ServiceCard from '@/components/services/ServiceCard.vue'
import ServiceCardSkeleton from '@/components/ServiceCardSkeleton.vue'
import { useOrdersStore } from '@/stores/orders'
import { useCartStore } from '@/stores/cart'
import OrderForm from '@/components/OrderForm.vue'
import { useToast } from '@/composables/useToast'

export default {
  name: 'CatalogPage',
  components: {
    ServiceCard,
    OrderForm,
    ServiceCardSkeleton,
  },
  setup() {
    const router = useRouter()
    const servicesStore = useServicesStore()
    const { showToast } = useToast()
    const isLoading = ref(true)
    const searchQuery = ref('')
    const selectedCategory = ref('all')
    const cartStore = useCartStore()
    const sortBy = ref('price_asc')
    const isFiltersHidden = ref(false)
    const scrollThreshold = ref(100)
    const lastScrollTop = ref(0)
    const selectedService = ref(null)

    onMounted(async () => {
      try {
        await servicesStore.fetchServices()
      } catch (error) {
        showToast('Ошибка при загрузке услуг', 'error')
      } finally {
        isLoading.value = false
      }
    })

    const filteredServices = computed(() => {
      let services = servicesStore.services

      if (searchQuery.value) {
        services = services.filter(service =>
          service.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          service.description.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      if (selectedCategory.value !== 'all') {
        services = services.filter(service => service.category === selectedCategory.value)
      }

      return services
    })

    const categories = computed(() => {
      const uniqueCategories = new Set(servicesStore.services.map(service => service.category))
      return ['all', ...Array.from(uniqueCategories)]
    })

    const navigateToService = (serviceId) => {
      router.push(`/service/${serviceId}`)
    }

    const handleScroll = () => {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop

      if (currentScrollTop > lastScrollTop.value && currentScrollTop > scrollThreshold.value) {
        isFiltersHidden.value = true
      } else if (currentScrollTop < scrollThreshold.value) {
        isFiltersHidden.value = false
      }

      lastScrollTop.value = currentScrollTop <= 0 ? 0 : currentScrollTop
    }

    const toggleFilters = () => {
      isFiltersHidden.value = !isFiltersHidden.value
    }

    const showAddedToCartMessage = (service) => {
      showToast(`Услуга "${service.name}" добавлена в корзину`, 'success')
    }

    const showOrderForm = (service) => {
      selectedService.value = service
    }

    const handleOrderSubmit = async (orderData) => {
      try {
        const ordersStore = useOrdersStore()
        await ordersStore.createOrder({
          ...orderData,
          serviceId: selectedService.value.id,
        })
        selectedService.value = null
        showToast('Заказ успешно оформлен!', 'success')
      } catch (error) {
        console.error('Ошибка при оформлении заказа:', error)
        showToast(error.message || 'Ошибка при оформлении заказа', 'error')
      }
    }

    const addToCart = (service) => {
      const serviceParams = {
        moving: { hours: 3, workers: 2, vehicle_type: 'gazelle' },
        office: { hours: 4, workers: 3, vehicle_type: 'truck' },
        loading: { hours: 2, workers: 2 },
        lifting: { hours: 2, workers: 2 }
      }

      const params = serviceParams[service.type] || {}

      cartStore.addToCart(service, params)
      showToast('Услуга добавлена в корзину', 'success')
    }

    const goToCart = () => {
      router.push('/cart')
    }

    return {
      isLoading,
      searchQuery,
      selectedCategory,
      filteredServices,
      categories,
      navigateToService,
      handleScroll,
      toggleFilters,
      showAddedToCartMessage,
      showOrderForm,
      handleOrderSubmit,
      addToCart,
      goToCart,
      isFiltersHidden,
      scrollThreshold,
      lastScrollTop,
      selectedService,
      cartStore,
      sortBy,
      sortOptions: [
        { value: 'price_asc', label: '↑ По цене' },
        { value: 'price_desc', label: '↓ По цене' },
        { value: 'name_asc', label: 'А-Я' },
        { value: 'name_desc', label: 'Я-А' }
      ]
    }
  }
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

/* Стили для сетки скелетонов */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Анимация для списка услуг */
.fade-list-enter-active,
.fade-list-leave-active {
  transition: opacity 0.5s ease;
}

.fade-list-enter-from,
.fade-list-leave-to {
  opacity: 0;
}

.no-services {
  grid-column: 1 / -1; /* Растягиваем на всю ширину сетки */
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .skeleton-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .skeleton-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}
</style>
