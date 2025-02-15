<template>
  <div class="cart">
    <h1>Корзина</h1>

    <div v-if="cartStore && cartStore.totalItems > 0" class="cart-content">
      <div class="cart-items">
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
          <img :src="item.image" :alt="item.title" class="item-image" />
          <div class="item-info">
            <h3>{{ item.title }}</h3>
            <p class="item-price">{{ item.price }} ₽/час</p>
          </div>
          <div class="item-quantity">
            <button @click="decrementQuantity(item)" :disabled="item.quantity <= 1">-</button>
            <span>{{ item.quantity }}</span>
            <button @click="incrementQuantity(item)" :disabled="item.quantity >= 12">+</button>
          </div>
          <div class="item-total">
            <AnimatedPrice :value="item.price * item.quantity" />
          </div>
          <button class="remove-button" @click="removeItem(item.id)">&times;</button>
        </div>
      </div>

      <div class="cart-summary">
        <h3>Итого</h3>
        <div class="summary-row">
          <span>Количество услуг:</span>
          <span>{{ cartStore.totalItems }}</span>
        </div>
        <div class="summary-row total">
          <span>К оплате:</span>
          <AnimatedPrice :value="cartStore.totalPrice" />
        </div>
        <button class="checkout-button" @click="handleCheckoutClick">Оформить заказ</button>
        <button class="clear-button" @click="clearCart">Очистить корзину</button>
      </div>
    </div>

    <div v-else class="empty-cart">
      <h2>Корзина пуста</h2>
      <p>Добавьте услуги из каталога</p>
      <router-link to="/catalog" class="btn-primary">Перейти в каталог</router-link>
    </div>

    <!-- Модальное окно оформления заказа -->
    <div v-if="showOrderForm && cartStore.items.length > 0" class="modal">
      <div class="modal-content">
        <button class="close-button" @click="showOrderForm = false">&times;</button>
        <h2>Оформление заказа</h2>
        <OrderForm
          :service-id="cartStore.items[0]?.id"
          @submit="handleOrderSubmit"
          @close="showOrderForm = false"
          @message="handleMessage"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'
import OrderForm from '@/components/OrderForm.vue'
import AnimatedPrice from '@/components/AnimatedPrice.vue'
import { supabase } from '../lib/supabaseClient'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'ShoppingCart',
  components: {
    OrderForm,
    AnimatedPrice,
  },
  data() {
    return {
      cartStore: null,
      showOrderForm: false,
    }
  },
  created() {
    // Инициализируем store в хуке created
    this.cartStore = useCartStore()
  },
  methods: {
    incrementQuantity(item) {
      if (item.quantity < 12) {
        this.cartStore.updateQuantity(item.id, item.quantity + 1)
      }
    },
    decrementQuantity(item) {
      if (item.quantity > 1) {
        this.cartStore.updateQuantity(item.id, item.quantity - 1)
      }
    },
    removeItem(itemId) {
      this.cartStore.removeFromCart(itemId)
      this.showToast('Услуга удалена из корзины', 'info')
    },
    clearCart() {
      this.cartStore.clearCart()
      this.showToast('Корзина очищена', 'info')
    },
    async handleOrderSubmit(orderData) {
      try {
        if (!this.cartStore || !this.cartStore.items.length) {
          throw new Error('Корзина пуста')
        }

        // Проверяем обязательные поля
        if (!orderData.contact_name || !orderData.phone || !orderData.payment_method) {
          throw new Error('Заполните все обязательные поля')
        }

        // Формируем данные заказа с проверкой на null
        const orderDetails = {
          contact_name: orderData.contact_name || '',
          phone: orderData.phone || '',
          payment_method: orderData.payment_method || '',
          service_title: this.cartStore.items[0].title || '',
          approximate_price: this.cartStore.totalPrice || 0,
          status: 'new'
        }

        // Проверяем, что все обязательные поля заполнены
        for (const [key, value] of Object.entries(orderDetails)) {
          if (!value && value !== 0) {
            throw new Error(`Поле ${key} обязательно для заполнения`)
          }
        }

        console.log('Отправляемые данные:', orderDetails)

        const { data, error } = await supabase
          .from('unconfirmed_orders')
          .insert([orderDetails])

        if (error) {
          console.error('Детали ошибки:', error)
          throw new Error(error.message)
        }

        this.cartStore.clearCart()
        this.showOrderForm = false
        this.showToast('Заявка принята! Наш менеджер свяжется с вами в ближайшее время.', 'success')
        this.$router.push('/order-success')

      } catch (error) {
        console.error('Ошибка:', error)
        this.showToast(error.message || 'Ошибка при отправке заявки', 'error')
      }
    },
    handleMessage({ text, type }) {
      this.showToast(text, type)
    },
    handleCheckoutClick() {
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
.cart {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: #ffffff;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  margin-top: 2rem;
}

.cart-items {
  background: #282828;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr auto auto 40px;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #404040;
  transition: background-color 0.3s ease;
}

.cart-item:hover {
  background: #323232;
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info h3 {
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.item-price {
  color: #1db954;
}

.item-total {
  color: #1db954;
  font-weight: bold;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-quantity button {
  width: 30px;
  height: 30px;
  border: 1px solid #404040;
  background: #404040;
  color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.item-quantity button:hover:not(:disabled) {
  background: #505050;
}

.item-quantity button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-quantity span {
  color: #ffffff;
  min-width: 20px;
  text-align: center;
}

.remove-button {
  background: none;
  border: none;
  color: #e91429;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.remove-button:hover {
  color: #ff1430;
}

.cart-summary {
  background: #282828;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  height: fit-content;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
  color: #b3b3b3;
}

.total {
  font-size: 1.25rem;
  font-weight: bold;
  border-top: 1px solid #404040;
  padding-top: 1rem;
  color: #ffffff;
}

.checkout-button {
  width: 100%;
  background: #1db954;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.checkout-button:hover {
  background: #1ed760;
}

.clear-button {
  width: 100%;
  background: #e91429;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.clear-button:hover {
  background: #ff1430;
}

.empty-cart {
  text-align: center;
  padding: 3rem;
  color: #b3b3b3;
}

.empty-cart h2 {
  color: #ffffff;
  margin-bottom: 1rem;
}

.empty-cart .btn-primary {
  display: inline-block;
  background: #1db954;
  color: white;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.empty-cart .btn-primary:hover {
  background: #1ed760;
  transform: translateY(-2px);
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
  color: #ffffff;
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
</style>
