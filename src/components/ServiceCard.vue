<template>
  <div class="service-card">
    <img :src="service.image" :alt="service.title" class="service-image" />
    <div class="service-content">
      <h3>{{ service.title }}</h3>
      <p class="service-description">{{ truncatedDescription }}</p>
      <div class="service-price">от {{ service.price }} руб/час</div>
      <div class="service-actions">
        <button class="btn-add-to-cart" @click="addToCart(service)">В корзину</button>
        <router-link :to="`/service/${service.id}`" class="btn-details">Подробнее</router-link>
      </div>
    </div>
  </div>
  <OrderForm
    v-if="showOrderModal"
    :service-price="service.price"
    :service-id="service.id"
    @submit="handleOrderSubmit"
    @close="closeModal"
  />
</template>

<script>
import { useCartStore } from '@/stores/cart'

export default {
  name: 'ServiceCard',
  props: {
    service: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showOrderModal: false,
    }
  },
  computed: {
    truncatedDescription() {
      const words = this.service.description.split(' ');
      if (words.length > 10) {
        return words.slice(0, 10).join(' ') + '...';
      }
      return this.service.description;
    }
  },
  mounted() {
    document.addEventListener('keydown', this.handleEscKey)
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.handleEscKey)
  },
  methods: {
    addToCart(service) {
      const cartStore = useCartStore()
      // Добавляем базовые параметры для каждого типа услуги
      const serviceParams = {
        moving: { hours: 3, workers: 2, vehicle_type: 'gazelle' },
        office: { hours: 4, workers: 3, vehicle_type: 'truck' },
        loading: { hours: 2, workers: 2 },
        lifting: { hours: 2, workers: 2 }
      }

      const params = serviceParams[this.service.type] || {}

      cartStore.addToCart({
        ...this.service,
        type: this.service.type // Добавляем тип услуги
      }, params)

      this.$emit('added-to-cart', this.service)
    },
    closeModal() {
      this.showOrderModal = false
    },
    handleEscKey(event) {
      if (event.key === 'Escape' && this.showOrderModal) {
        this.closeModal()
      }
    },
  },
}
</script>

<style scoped>
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
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.service-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.service-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #ffffff;
}

.service-description {
  color: #b3b3b3;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.service-price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1db954;
  margin-bottom: 1.5rem;
}

.service-actions {
  display: flex;
  gap: 1rem;
}

.btn-add-to-cart,
.btn-details {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: center;
  text-decoration: none;
}

.btn-add-to-cart {
  background: #1db954;
  color: white;
}

.btn-add-to-cart:hover {
  background: #1ed760;
}

.btn-details {
  background: #404040;
  color: #ffffff;
}

.btn-details:hover {
  background: #505050;
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
  z-index: 1001;
}

.close-button:hover {
  color: #ffffff;
}
</style>
