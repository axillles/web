<template>
  <div class="service-card">
    <img :src="service.image" :alt="service.title" class="service-image" />
    <div class="service-content">
      <h3>{{ service.title }}</h3>
      <p class="service-description">{{ truncatedDescription }}</p>
      <div class="service-price">от {{ service.price }} руб/час</div>
      <div class="service-actions">
        <div v-if="itemInCart" class="quantity-controls">
          <button class="quantity-btn" @click="decrementQuantity">-</button>
          <span class="quantity-display">{{ itemInCart.quantity }}</span>
          <button class="quantity-btn" @click="incrementQuantity">+</button>
        </div>
        <button v-else class="btn-add-to-cart" @click="addToCart(service)">В корзину</button>
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
    },
    itemInCart() {
      const cartStore = useCartStore();
      return cartStore.items.find(item => item.id === this.service.id);
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
    incrementQuantity() {
      const cartStore = useCartStore();
      const item = this.itemInCart;
      if (item) {
        cartStore.updateQuantity(item.id, item.quantity + 1);
      }
    },
    decrementQuantity() {
      const cartStore = useCartStore();
      const item = this.itemInCart;
      if (item) {
        if (item.quantity > 1) {
          cartStore.updateQuantity(item.id, item.quantity - 1);
        } else {
          cartStore.removeFromCart(item.id);
        }
      }
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
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  transition: var(--transition-standard);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--card-hover-shadow);
  background: var(--bg-elevated);
}

.service-image {
  width: 100%;
  height: 180px;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.service-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.service-content h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.service-description {
  color: var(--text-secondary);
  line-height: 1.5;
  flex: 1;
  font-size: 0.95rem;
}

.service-price {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--accent-primary);
  margin: 0.5rem 0;
}

.service-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
}

.btn-add-to-cart,
.btn-details {
  flex: 1;
  padding: 0.75rem 0.5rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition-standard);
  text-align: center;
  text-decoration: none;
  font-size: 0.95rem;
}

.btn-add-to-cart {
  background: var(--accent-primary);
  color: white;
}

.btn-add-to-cart:hover {
  background: var(--accent-secondary);
}

.btn-details {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.btn-details:hover {
  background: var(--bg-elevated);
  opacity: 0.9;
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
  color: var(--text-secondary);
  transition: color 0.3s ease;
  z-index: 1001;
}

.close-button:hover {
  color: var(--text-primary);
}

/* Стили для управления количеством */
.quantity-controls {
  display: flex;
  align-items: center;
  background-color: var(--accent-primary);
  border-radius: 50px;
  padding: 0.25rem;
  flex: 1;
}

.quantity-btn {
  width: 28px;
  height: 28px;
  border: none;
  background-color: var(--accent-secondary);
  color: white;
  font-size: 1rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.quantity-btn:hover {
  background-color: var(--accent-primary-dark, #0056b3);
  transform: scale(1.05);
}

.quantity-btn:active {
  transform: scale(0.95);
}

.quantity-display {
  padding: 0 0.5rem;
  font-weight: bold;
  flex: 1;
  text-align: center;
  color: white;
}

@media (max-width: 768px) {
  .service-card {
    padding: 1.25rem;
  }

  .service-image {
    height: 160px;
  }

  .service-content {
    gap: 0.5rem;
  }

  .service-content h3 {
    font-size: 1.1rem;
  }

  .service-description {
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .service-price {
    font-size: 1.1rem;
  }

  .service-actions {
    gap: 0.5rem;
  }

  .btn-add-to-cart,
  .btn-details {
    padding: 0.6rem 0.4rem;
    font-size: 0.9rem;
  }

  .quantity-controls {
    padding: 0.2rem;
  }

  .quantity-btn {
    width: 24px;
    height: 24px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .service-card {
    padding: 1rem;
  }

  .service-image {
    height: 140px;
  }

  .service-content h3 {
    font-size: 1rem;
  }

  .service-description {
    font-size: 0.85rem;
  }

  .service-price {
    font-size: 1rem;
    margin: 0.25rem 0;
  }

  .btn-add-to-cart,
  .btn-details {
    padding: 0.5rem 0.3rem;
    font-size: 0.8rem;
  }
}
</style>
