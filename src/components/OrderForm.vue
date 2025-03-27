<template>
  <div class="order-form">
    <h3>Оформление заказа</h3>

    <form @submit.prevent="submitOrder">
      <div class="form-group">
        <label>Ваше имя*</label>
        <input
          type="text"
          v-model="formData.contact_name"
          required
          class="form-control"
          placeholder="Как к вам обращаться"
          @input="validateName"
        />
        <small class="error-message" v-if="errors.contact_name">{{ errors.contact_name }}</small>
      </div>

      <div class="form-group">
        <label>Телефон*</label>
        <input
          type="tel"
          v-model="formData.phone"
          required
          class="form-control"
          placeholder="+375 XX XXX-XX-XX"
          @input="formatPhone"
        />
        <!-- <small>Наш менеджер перезвонит для уточнения деталей</small> -->
        <small class="error-message" v-if="errors.phone">{{ errors.phone }}</small>
      </div>

      <div class="form-group">
        <label>Адрес*</label>
        <input
          type="text"
          v-model="formData.address"
          required
          class="form-control"
          placeholder="Укажите адрес"
        />
        <small class="error-message" v-if="errors.address">{{ errors.address }}</small>
      </div>

      <div class="form-group">
        <label>Дата и время*</label>
        <input
          type="datetime-local"
          v-model="formData.datetime"
          required
          class="form-control"
          :min="minDateTime"
        />
        <small>Выберите желаемую дату и время</small>
        <small class="error-message" v-if="errors.datetime">{{ errors.datetime }}</small>
      </div>

      <div class="form-group">
        <label>Способ оплаты*</label>
        <div class="payment-buttons">
          <button
            type="button"
            class="payment-button"
            :class="{ active: formData.payment_method === 'cash' }"
            @click="formData.payment_method = 'cash'"
          >
            Наличными
          </button>
          <button
            type="button"
            class="payment-button"
            :class="{ active: formData.payment_method === 'card' }"
            @click="formData.payment_method = 'card'"
          >
            Картой
          </button>
        </div>
      </div>

      <div class="form-group">
        <label>Промокод</label>
        <div class="promo-input">
          <input
            type="text"
            v-model="formData.promo_code"
            class="form-control"
            placeholder="Если есть промокод"
            :disabled="promoApplied"
          />
          <button
            type="button"
            class="btn-apply-promo"
            :disabled="!formData.promo_code || promoApplied"
            @click="validatePromocode"
          >
            {{ promoApplied ? 'Применен' : 'Применить' }}
          </button>
        </div>
        <small class="error-message" v-if="errors.promo_code">{{ errors.promo_code }}</small>
        <div v-if="promoApplied" class="promo-info">
          <span class="discount-amount">Скидка: {{ discount }} руб</span>
          <button class="btn-remove-promo" @click="removePromo">×</button>
        </div>
      </div>

      <div class="form-group">
        <label>Комментарий</label>
        <textarea
          v-model="formData.comment"
          class="form-control"
          rows="3"
          placeholder="Дополнительная информация"
        ></textarea>
      </div>

      <div class="total-amount">
        <div v-if="promoApplied" class="original-price">
          <s>{{ servicePrice }} руб</s>
        </div>
        <div class="final-price">
          Итого: {{ finalPrice }} руб
        </div>
      </div>

      <button
        type="submit"
        class="btn-primary"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? 'Отправка...' : 'Оформить заказ' }}
      </button>
    </form>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { usePromocodesStore } from '@/stores/promocodes'
import { useTelegramService } from '@/composables/useTelegramService'
import { useCartStore } from '@/stores/cart'

export default {
  name: 'OrderForm',
  props: {
    serviceId: {
      type: Number,
      required: true
    },
    servicePrice: {
      type: Number,
      required: true
    }
  },
  setup() {
    // Используем сервис для работы с Telegram уведомлениями
    const telegramService = useTelegramService();
    return { telegramService };
  },
  data() {
    const authStore = useAuthStore()
    const userData = authStore.user?.user_metadata || {}

    return {
      formData: {
        contact_name: userData.name || '',
        phone: userData.phone || '',
        address: '',
        datetime: '',
        payment_method: '',
        promo_code: '',
        comment: ''
      },
      isSubmitting: false,
      errors: {
        contact_name: '',
        phone: '',
        address: '',
        datetime: '',
        promo_code: ''
      },
      promocodesStore: usePromocodesStore(),
      promoApplied: false,
      discount: 0
    }
  },
  computed: {
    finalPrice() {
      const price = Number(this.servicePrice) || 0
      const discount = Number(this.discount) || 0
      return Math.max(0, price - discount)
    },
    minDateTime() {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(8, 0, 0, 0)
      return tomorrow.toISOString().slice(0, 16)
    }
  },
  methods: {
    async sendTelegramMessage(message) {
      try {
        console.log('Отправка уведомления в Telegram...');
        await this.telegramService.sendMessage(message);
        console.log('Уведомление успешно отправлено');
        return true;
      } catch (error) {
        console.error('Ошибка отправки сообщения в Telegram:', error);
        // При ошибке отправки в Telegram не блокируем процесс оформления заказа
        // Просто логируем ошибку и продолжаем
        return false;
      }
    },
    validateName() {
      const nameRegex = /^[а-яА-ЯёЁa-zA-Z\s-]+$/
      if (!nameRegex.test(this.formData.contact_name)) {
        this.errors.contact_name = 'Имя должно содержать только буквы'
        return false
      }
      this.errors.contact_name = ''
      return true
    },

    formatPhone() {
      const phoneRegex = /^\+375\s\d{2}\s\d{3}-\d{2}-\d{2}$/
      if (phoneRegex.test(this.formData.phone)) {
        this.errors.phone = ''
        return true
      }

      let phone = this.formData.phone.replace(/\D/g, '')

      if (phone.startsWith('375')) {
        phone = '+' + phone
      } else if (phone.startsWith('80')) {
        phone = '+375' + phone.slice(2)
      }

      if (phone.length >= 13) {
        phone = phone.slice(0, 13)
        this.formData.phone = phone.replace(/(\+375)(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3-$4-$5')
      }

      if (!phoneRegex.test(this.formData.phone)) {
        this.errors.phone = 'Введите корректный номер телефона'
        return false
      }
      this.errors.phone = ''
      return true
    },

    async validatePromocode() {
      if (!this.formData.promo_code) return true

      try {
        const result = await this.promocodesStore.validatePromocode(
          this.formData.promo_code,
          this.servicePrice
        )

        if (result.isValid) {
          this.promoApplied = true
          this.discount = result.discount
          this.errors.promo_code = ''
          this.$emit('message', {
            text: `Промокод применен! Скидка: ${result.discount} руб`,
            type: 'success'
          })
        }
        return true
      } catch (error) {
        this.errors.promo_code = error.message
        this.$emit('message', {
          text: error.message,
          type: 'error'
        })
        return false
      }
    },

    removePromo() {
      this.promoApplied = false
      this.discount = 0
      this.formData.promo_code = ''
      this.errors.promo_code = ''
    },

    validateForm() {
      let isValid = true
      this.errors = {}

      if (!this.formData.contact_name) {
        this.errors.contact_name = 'Введите ваше имя'
        isValid = false
      }

      if (!this.formData.phone) {
        this.errors.phone = 'Введите номер телефона'
        isValid = false
      }

      if (!this.formData.address) {
        this.errors.address = 'Укажите адрес'
        isValid = false
      }

      if (!this.formData.datetime) {
        this.errors.datetime = 'Выберите дату и время'
        isValid = false
      }

      if (!this.formData.payment_method) {
        this.errors.payment_method = 'Выберите способ оплаты'
        isValid = false
      }

      return isValid && this.validateName() && this.formatPhone()
    },

    async submitOrder() {
      if (!this.validateForm()) {
        return
      }

      try {
        this.isSubmitting = true;

        // Формируем данные заказа для отправки в API
        const orderData = {
          contact_name: this.formData.contact_name.trim(),
          phone: this.formData.phone,
          address: this.formData.address.trim(),
          datetime: this.formData.datetime,
          payment_method: this.formData.payment_method,
          promo_code: this.promoApplied ? this.formData.promo_code : null,
          service_id: this.serviceId,
          service_price: this.servicePrice,
          final_price: this.finalPrice,
          discount: this.discount,
          comment: this.formData.comment || null
        };

        // Проверяем, не оформляется ли заказ из корзины
        const isFromCart = this.$route.path.includes('/cart');

        // Если заказ не из корзины, формируем Telegram уведомление
        if (!isFromCart) {
          let serviceInfo = '';
          let serviceType = '';
          let cartStore = null;

          // Определяем тип заказа и формируем информацию
          // Одиночная услуга
          switch (this.serviceId) {
            case 1:
              serviceType = 'Квартирный переезд';
              break;
            case 2:
              serviceType = 'Офисный переезд';
              break;
            case 3:
              serviceType = 'Погрузка/разгрузка';
              break;
            case 4:
              serviceType = 'Подъем на этаж';
              break;
            default:
              serviceType = `Услуга #${this.serviceId}`;
          }

          serviceInfo = `\n\n📋 Детали услуги:`;
          const params = [];
          if (this.serviceId === 1 || this.serviceId === 2) {
            params.push('Включает транспорт и грузчиков');
          }
          if (params.length > 0) {
            serviceInfo += `\n${params.join('\n')}`;
          }

          // Форматируем дату и время
          const dateTime = new Date(this.formData.datetime);
          const formattedDate = dateTime.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          const formattedTime = dateTime.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          });

          // Форматируем способ оплаты
          const paymentMethod = this.formData.payment_method === 'cash' ? 'Наличными' : 'Картой';

          // Формируем сообщение Telegram с эмодзи и форматированием
          const telegramMessage = `
🔔 Новый заказ!

👤 Клиент: ${this.formData.contact_name}
📞 Телефон: ${this.formData.phone}
🏠 Адрес: ${this.formData.address}
🕒 Дата и время: ${formattedDate} в ${formattedTime}
💵 Способ оплаты: ${paymentMethod}

🛒 Тип заказа: ${serviceType}${serviceInfo}

${this.promoApplied ? `🎁 Промокод: ${this.formData.promo_code}\n🔽 Скидка: ${this.discount} руб\n🏷️ Цена без скидки: ${this.servicePrice} руб\n` : ''}
💰 Итоговая цена: ${this.finalPrice} руб

${this.formData.comment ? `💬 Комментарий:\n${this.formData.comment}` : ''}
          `;

          // Пытаемся отправить сообщение в Telegram, но продолжаем процесс оформления
          // даже если возникла ошибка с Telegram
          try {
            await this.sendTelegramMessage(telegramMessage);
          } catch (telegramError) {
            console.error('Не удалось отправить уведомление, но заказ будет оформлен', telegramError);
          }
        }

        // Отправляем заказ в систему
        // TODO: Заменить на реальный код сохранения заказа
        console.log('Отправка заказа:', orderData);

        // Очищаем корзину если заказ из корзины
        if (isFromCart) {
          const cartStore = useCartStore();
          if (cartStore) {
            cartStore.clearCart();
            console.log('Корзина очищена после оформления заказа');
          }
        }

        // Сообщаем об успешном оформлении заказа
        this.$emit('submit', orderData);

        // Переходим на страницу успешного оформления
        this.$router.push('/order-success');
      } catch (error) {
        console.error('Ошибка оформления заказа:', error);
        this.error = 'Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте позже.';
      } finally {
        this.isSubmitting = false;
      }
    }
  }
}
</script>

<style>
.order-form {
  max-height: 90vh;
  overflow-y: auto;
  padding: 1rem;
  width: 100%;
}

h3 {
  color: var(--text-primary);
  margin-top: 0;
  margin-bottom: 1rem; /* Уменьшаем отступ */
  text-align: center;
}

.form-group {
  margin-bottom: 1rem; /* Уменьшаем отступ */
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem; /* Уменьшаем отступ */
  font-size: 0.9rem; /* Уменьшаем размер шрифта */
  color: var(--text-primary);
}

.form-control {
  width: 100%;
  padding: 0.5rem 0.75rem; /* Уменьшаем padding */
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
}

textarea.form-control {
  resize: vertical;
  min-height: 60px; /* Уменьшаем минимальную высоту */
}

.btn-primary {
  width: 100%;
  background: var(--accent-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: var(--transition-standard);
}

.btn-primary:hover {
  background: var(--accent-secondary);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

small {
  font-size: 0.8rem; /* Уменьшаем размер шрифта */
  margin-top: 0.25rem;
  color: var(--text-secondary);
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
}

.payment-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.payment-button {
  flex: 1;
  padding: 0.5rem 1rem; /* Уменьшаем padding */
  border: 2px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition-standard);
  font-size: 0.9rem; /* Уменьшаем размер шрифта */
}

.payment-button:hover {
  background: var(--bg-elevated);
  border-color: var(--accent-primary);
}

.payment-button.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
}

.error-message {
  display: block;
  color: var(--error-color);
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.promo-input {
  display: flex;
  gap: 0.5rem;
}

.btn-apply-promo {
  padding: 0.75rem 1rem;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: var(--transition-standard);
}

.btn-apply-promo:hover {
  background: var(--accent-secondary);
}

.btn-apply-promo:disabled {
  background: var(--bg-elevated);
  cursor: not-allowed;
}

.promo-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: var(--accent-primary);
}

.btn-remove-promo {
  background: none;
  border: none;
  color: var(--error-color);
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
}

.total-amount {
  margin: 0.75rem 0;
}

.original-price {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.final-price {
  color: var(--accent-primary);
  font-size: 1.2rem;
  font-weight: bold;
}

input[type="datetime-local"] {
  width: 100%;
  padding: 0.75rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
}

input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--modal-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: var(--border-radius);
  position: relative;
  width: 95%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--card-shadow);
}
</style>
