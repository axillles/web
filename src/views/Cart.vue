<template>
  <div class="cart">
    <h1>Корзина</h1>

    <div v-if="cartStore && cartStore.totalItems > 0" class="cart-content">
      <div class="cart-items">
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
          <img :src="item.image" :alt="item.title" class="item-image" />
          <div class="item-info">
            <h3>{{ item.title }}</h3>
            <p class="item-price">{{ item.price }} руб/час</p>
            <div class="item-params" v-if="hasServiceParams(item)">
              <span v-if="item.workers">{{ item.workers }} грузчика</span>
              <span v-if="item.hours">{{ item.hours }} часа</span>
              <span v-if="item.vehicle_type">{{ getVehicleTypeText(item.vehicle_type) }}</span>
            </div>
          </div>
          <div class="item-quantity">
            <button
              @click="decrementQuantity(item)"
              :disabled="item.quantity <= 1"
              class="quantity-btn"
            >-</button>
            <span class="quantity-display">{{ item.quantity }}</span>
            <button
              @click="incrementQuantity(item)"
              :disabled="item.quantity >= 12"
              class="quantity-btn"
            >+</button>
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
          :service-price="cartStore.totalPrice"
          :service-id="cartStore.items[0]?.id"
          @submit="handleOrderSubmit"
          @close="showOrderForm = false"
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
import { useAuthStore } from '@/stores/auth'
import { useTelegramService } from '@/composables/useTelegramService'

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
        const originalPrice = this.cartStore.totalPrice
        const discount = orderData.service_price - orderData.final_price

        // Преобразуем items в нужный формат
        const cartItems = this.cartStore.items.map(item => ({
          id: item.id,
          title: item.title,
          type: item.type,
          price: item.price,
          quantity: item.quantity,
          hours: item.hours,
          workers: item.workers,
          vehicle_type: item.vehicle_type
        }))

        // Формируем данные заказа
        const orderDetails = {
          ...orderData,
          service_type: 'cart',
          total_price: orderData.final_price,
          original_price: originalPrice,
          discount: discount,
          items: cartItems // Передаем массив товаров
        }

        // Формируем подробное сообщение для Telegram
        const dateTime = new Date(orderData.datetime);
        const formattedDate = dateTime.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        const formattedTime = dateTime.toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit'
        });

        // Собираем информацию о товарах
        let itemsInfo = cartItems.map((item, index) => {
          let itemInfo = `${index + 1}. ${item.title || this.getServiceTypeText(item.type)} - ${item.price} руб × ${item.quantity}`;

          // Добавляем параметры услуги если они есть
          const params = [];
          if (item.workers) params.push(`${item.workers} грузчика`);
          if (item.hours) params.push(`${item.hours} часа`);
          if (item.vehicle_type) {
            const vehicleText = this.getVehicleTypeText(item.vehicle_type);
            params.push(vehicleText);
          }

          if (params.length > 0) {
            itemInfo += ` (${params.join(', ')})`;
          }
          return itemInfo;
        }).join('\n');

        // Форматируем способ оплаты
        const paymentMethod = orderData.payment_method === 'cash' ? 'Наличными' : 'Картой';

        // Формируем сообщение для Telegram
        const telegramMessage = `
🔔 Новый заказ из корзины!

👤 Клиент: ${orderData.contact_name}
📞 Телефон: ${orderData.phone}
🏠 Адрес: ${orderData.address}
🕒 Дата и время: ${formattedDate} в ${formattedTime}
💵 Способ оплаты: ${paymentMethod}

📋 Состав заказа:
${itemsInfo}

${orderData.promo_code ? `🎁 Промокод: ${orderData.promo_code}\n🔽 Скидка: ${discount} руб\n🏷️ Цена без скидки: ${originalPrice} руб\n` : ''}
💰 Итоговая цена: ${orderData.final_price} руб

${orderData.comment ? `💬 Комментарий:\n${orderData.comment}` : ''}
        `;

        // Отправляем сообщение в Telegram
        try {
          const telegramService = useTelegramService();
          await telegramService.sendMessage(telegramMessage);
          console.log('Уведомление успешно отправлено в Telegram');
        } catch (telegramError) {
          console.error('Ошибка отправки в Telegram:', telegramError);
          // При ошибке отправки продолжаем оформление заказа
        }

        console.log('Отправляемые данные заказа:', orderDetails)

        const ordersStore = useOrdersStore()
        await ordersStore.createOrder(orderDetails)

        this.cartStore.clearCart()
        this.showOrderForm = false
        this.showToast('Заказ успешно оформлен!', 'success')
        this.$router.push('/order-success');
      } catch (error) {
        this.showToast(error.message || 'Ошибка при оформлении заказа', 'error')
      }
    },
    handleCheckoutClick() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        // Показываем модальное окно авторизации
        this.$emit('show-auth')
        return
      }
      this.showOrderForm = true
    },
    hasServiceParams(item) {
      return item.workers || item.hours || item.vehicle_type
    },
    getVehicleTypeText(type) {
      const types = {
        gazelle: 'Газель (до 1.5 тонн)',
        truck: 'Грузовик (до 5 тонн)'
      }
      return types[type] || type
    },
    getServiceTypeText(type) {
      const types = {
        'moving': 'Квартирный переезд',
        'office': 'Офисный переезд',
        'loading': 'Погрузка/разгрузка',
        'lifting': 'Подъем на этаж',
        'cart': 'Заказ из корзины'
      };
      return types[type] || type;
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
  color: var(--text-primary);
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  margin-top: 2rem;
}

.cart-items {
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr auto auto 40px;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s ease;
}

.cart-item:hover {
  background: var(--bg-elevated);
}

.item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.item-price {
  color: var(--accent-primary);
}

.item-total {
  color: var(--accent-primary);
  font-weight: bold;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-btn {
  width: 30px;
  height: 30px;
  border: 1px solid var(--border-color);
  background: var(--bg-elevated);
  color: var(--text-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.quantity-btn:hover:not(:disabled) {
  background: var(--bg-secondary-hover);
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-display {
  min-width: 30px;
  text-align: center;
  font-size: 1.1rem;
}

.remove-button {
  background: none;
  border: none;
  color: var(--error-color);
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.remove-button:hover {
  color: var(--error-color-hover);
}

.cart-summary {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  height: fit-content;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
  color: var(--text-secondary);
}

.total {
  font-size: 1.25rem;
  font-weight: bold;
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
  color: var(--text-primary);
}

.checkout-button {
  width: 100%;
  background: var(--accent-primary);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.checkout-button:hover {
  background: var(--accent-secondary);
}

.clear-button {
  width: 100%;
  background: var(--error-color);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.clear-button:hover {
  background: var(--error-color-hover);
}

.empty-cart {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.empty-cart h2 {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.empty-cart .btn-primary {
  display: inline-block;
  background: var(--accent-primary);
  color: white;
  text-decoration: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.empty-cart .btn-primary:hover {
  background: var(--accent-secondary);
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
  padding: 1rem;
}

.modal-content {
  background: var(--bg-secondary);
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
  color: var(--text-secondary);
  z-index: 1;
}

.item-params {
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  gap: 1rem;
  margin-top: 0.25rem;
}

@media (max-width: 1024px) {
  .cart {
    padding: 1rem;
  }

  .cart-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .cart-items {
    width: 100%;
  }

  .cart-summary {
    position: static;
    width: 100%;
    margin-top: 1rem;
    padding: 1rem;
  }

  .cart-item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.5rem;
    padding: 0.8rem;
    align-items: center;
    position: relative;
  }

  .item-image {
    width: 60px;
    height: 60px;
    grid-row: span 2;
  }

  .item-info {
    padding: 0;
  }

  .item-info h3 {
    font-size: 1rem;
    margin: 0;
  }

  .item-price {
    font-size: 0.9rem;
  }

  .item-quantity {
    display: flex;
    gap: 0.3rem;
    align-items: center;
    grid-column: 2;
  }

  .item-quantity button {
    padding: 0.2rem 0.4rem;
    font-size: 0.9rem;
  }

  .item-quantity span {
    min-width: 1.5rem;
    text-align: center;
  }

  .item-total {
    font-size: 0.9rem;
    grid-column: 3;
    grid-row: span 2;
  }

  .summary-row {
    font-size: 0.9rem;
    padding: 0.8rem 0;
  }

  .checkout-button,
  .clear-button {
    padding: 0.8rem;
    font-size: 0.9rem;
  }

  .remove-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.3rem;
    font-size: 1.2rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    z-index: 1;
  }

  .remove-button:hover {
    color: var(--error-color);
  }
}

@media (max-width: 480px) {
  .cart {
    padding: 0.5rem;
  }

  .cart-item {
    padding: 0.6rem;
  }

  .cart-summary {
    padding: 0.8rem;
  }

  .item-image {
    width: 50px;
    height: 50px;
  }

  .item-info h3 {
    font-size: 0.9rem;
  }

  .item-price,
  .item-total {
    font-size: 0.8rem;
  }

  .item-quantity button {
    padding: 0.15rem 0.3rem;
    font-size: 0.8rem;
  }

  .summary-row {
    font-size: 0.85rem;
    padding: 0.6rem 0;
  }

  .checkout-button,
  .clear-button {
    padding: 0.7rem;
    font-size: 0.85rem;
  }

  .remove-button {
    top: 0.3rem;
    right: 0.3rem;
    padding: 0.2rem;
    font-size: 1.1rem;
  }
}
</style>
