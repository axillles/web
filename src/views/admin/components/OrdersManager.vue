<template>
 <div class="orders-manager">
    <h2>Управление заказами</h2>

    <div class="filters">
      <select v-model="statusFilter" class="filter-select">
        <option value="">Все статусы</option>
        <option value="new">Новые</option>
        <option value="confirmed">Подтвержденные</option>
        <option value="completed">Выполненные</option>
        <option value="cancelled">Отмененные</option>
      </select>
    </div>

    <div class="table-container" v-if="!loading">
      <table class="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя клиента</th>
            <th>Телефон</th>
            <th>Услуга</th>
            <th>Адрес</th>
            <th>Дата</th>
            <th>Стоимость</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.contact_name }}</td>
            <td>{{ order.phone }}</td>
            <td>{{ getServiceDisplay(order) }}</td>
            <td>{{ order.address }}</td>
            <td>{{ formatDateTime(order.datetime) }}</td>
            <td>
              <div v-if="order.discount > 0" class="price-with-discount">
                <s class="original-price">{{ order.original_price }} ₽</s>
                <span class="final-price">{{ order.total_price }} ₽</span>
              </div>
              <span v-else>{{ order.total_price }} ₽</span>
            </td>
            <td class="actions">
              <button class="details-btn" @click="showOrderDetails(order)">
                <span class="material-icons">info</span>
              </button>
              <button class="delete-btn" @click="confirmDelete(order.id)">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно с подробной информацией -->
    <div v-if="selectedOrder" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Заказ #{{ selectedOrder.id }}</h3>
          <button class="close-btn" @click="selectedOrder = null">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="modal-body">
          <div class="order-details">
            <div class="detail-group">
              <h4>Основная информация</h4>
              <div class="detail-row">
                <span class="label">Статус:</span>
                <select
                  v-model="selectedOrder.status"
                  class="status-select"
                  @change="updateOrderStatus(selectedOrder.id, selectedOrder.status)"
                >
                  <option value="new">Новый</option>
                  <option value="confirmed">Подтвержден</option>
                  <option value="completed">Выполнен</option>
                  <option value="cancelled">Отменен</option>
                </select>
              </div>
              <div class="detail-row">
                <span class="label">Клиент:</span>
                <span>{{ selectedOrder.contact_name }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Телефон:</span>
                <span>{{ selectedOrder.phone }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Адрес:</span>
                <span>{{ selectedOrder.address }}</span>
              </div>
              <div class="detail-row">
                <span class="label">Дата и время:</span>
                <span>{{ formatDateTime(selectedOrder.datetime) }}</span>
              </div>
            </div>

            <div class="detail-group">
              <h4>Детали услуги</h4>
              <template v-if="selectedOrder.service_type !== 'cart'">
                <div class="detail-row">
                  <span class="label">Тип услуги:</span>
                  <span>{{ getServiceTypeText(selectedOrder.service_type) }}</span>
                </div>
                <div class="detail-row" v-if="selectedOrder.workers">
                  <span class="label">Грузчиков:</span>
                  <span>{{ selectedOrder.workers }}</span>
                </div>
                <div class="detail-row" v-if="selectedOrder.hours">
                  <span class="label">Часов:</span>
                  <span>{{ selectedOrder.hours }}</span>
                </div>
                <div class="detail-row" v-if="selectedOrder.vehicle_type">
                  <span class="label">Транспорт:</span>
                  <span>{{ getVehicleTypeText(selectedOrder.vehicle_type) }}</span>
                </div>
              </template>
              <template v-else>
                <div class="cart-items-list" v-if="selectedOrder.items && selectedOrder.items.length">
                  <div v-for="item in selectedOrder.items" :key="item.id" class="cart-item-row">
                    <div class="cart-item-info">
                      <div class="item-main">
                        <span class="item-title">{{ item.title || getServiceTypeText(item.type) }}</span>
                        <div class="item-params" v-if="hasServiceParams(item)">
                          <span v-if="item.workers">{{ item.workers }} грузчика</span>
                          <span v-if="item.hours">{{ item.hours }} часа</span>
                          <span v-if="item.vehicle_type">{{ getVehicleTypeText(item.vehicle_type) }}</span>
                        </div>
                      </div>
                      <div class="item-price-info">
                        <span class="item-price">{{ item.price }} ₽</span>
                        <span class="item-quantity">× {{ item.quantity }}</span>
                        <span class="item-total">= {{ item.price * item.quantity }} ₽</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="no-items">
                  Нет данных о товарах в заказе
                </div>
              </template>
            </div>

            <div class="detail-group">
              <h4>Оплата</h4>
              <div class="detail-row">
                <span class="label">Способ оплаты:</span>
                <span>{{ getPaymentMethodText(selectedOrder.payment_method) }}</span>
              </div>
              <div class="detail-row" v-if="selectedOrder.discount > 0">
                <span class="label">Сумма без скидки:</span>
                <span>{{ selectedOrder.original_price }} руб</span>
              </div>
              <div class="detail-row" v-if="selectedOrder.promo_code">
                <span class="label">Промокод:</span>
                <span class="promo-info">
                  {{ selectedOrder.promo_code }}
                  <span class="discount-badge">-{{ selectedOrder.discount }} руб</span>
                </span>
              </div>
              <div class="detail-row">
                <span class="label">Итоговая сумма:</span>
                <span class="total-price">{{ selectedOrder.total_price }} руб</span>
              </div>
            </div>

            <div class="detail-group">
              <h4>Комментарий</h4>
              <textarea
                v-model="selectedOrder.comment"
                class="comment-input"
                placeholder="Добавить комментарий"
                @change="updateOrderComment(selectedOrder.id, selectedOrder.comment)"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Добавляем модальное окно подтверждения удаления -->
    <div v-if="orderToDelete" class="modal">
      <div class="modal-content confirm-delete">
        <h3>Подтверждение удаления</h3>
        <p>Вы действительно хотите удалить заказ #{{ orderToDelete }}?</p>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="orderToDelete = null">Отмена</button>
          <button class="btn-confirm" @click="deleteOrder">Удалить</button>
        </div>
      </div>
    </div>

    <div v-else class="loading">
      Загрузка заказов...
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { supabase } from '@/lib/supabaseClient'

export default defineComponent({
  name: 'OrdersManager',

  data() {
    return {
      orders: [],
      loading: true,
      statusFilter: '',
      selectedOrder: null,
      orderToDelete: null,
    }
  },

  computed: {
    filteredOrders() {
      if (!this.statusFilter) return this.orders
      return this.orders.filter(order => order.status === this.statusFilter)
    }
  },

  methods: {
    async fetchOrders() {
      try {
        const { data, error } = await supabase
          .from('service_orders')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        console.log('Полученные заказы:', data)
        this.orders = data
      } catch (error) {
        console.error('Error fetching orders:', error)
        this.$emit('show-toast', {
          message: 'Ошибка при загрузке заказов',
          type: 'error'
        })
      } finally {
        this.loading = false
      }
    },

    async updateOrderStatus(orderId, status) {
      try {
        const { error } = await supabase
          .from('service_orders')
          .update({ status })
          .eq('id', orderId)

        if (error) throw error

        await this.fetchOrders()
        this.$emit('show-toast', {
          message: 'Статус заказа обновлен',
          type: 'success'
        })
      } catch (error) {
        console.error('Error updating order:', error)
        this.$emit('show-toast', {
          message: 'Ошибка при обновлении статуса',
          type: 'error'
        })
      }
    },

    confirmOrder(orderId) {
      this.updateOrderStatus(orderId, 'confirmed')
    },

    completeOrder(orderId) {
      this.updateOrderStatus(orderId, 'completed')
    },

    cancelOrder(orderId) {
      this.updateOrderStatus(orderId, 'cancelled')
    },

    formatDateTime(datetime) {
      return new Date(datetime).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    getStatusText(status) {
      const statusMap = {
        new: 'Новый',
        confirmed: 'Подтвержден',
        completed: 'Выполнен',
        cancelled: 'Отменен'
      }
      return statusMap[status] || status
    },

    getServiceDisplay(order) {
      if (!order) return ''

      // Для обычных заказов
      if (order.service_type !== 'cart') {
        return this.getServiceTypeText(order.service_type)
      }

      // Для заказов из корзины
      try {
        if (!order.items) return 'Заказ из корзины'

        let items = order.items
        if (typeof items === 'string') {
          items = JSON.parse(items)
        }

        if (Array.isArray(items) && items.length > 0) {
          const firstItem = items[0]
          const remainingCount = items.length - 1
          return remainingCount > 0
            ? `${firstItem.title || this.getServiceTypeText(firstItem.type)} +${remainingCount} услуг`
            : firstItem.title || this.getServiceTypeText(firstItem.type)
        }
      } catch (error) {
        console.error('Ошибка при парсинге items:', error)
      }

      return 'Заказ из корзины'
    },

    getServiceTypeText(type) {
      if (!type) return 'Неизвестная услуга'

      const types = {
        moving: 'Квартирный переезд',
        office: 'Офисный переезд',
        loading: 'Погрузка/разгрузка',
        lifting: 'Подъем на этаж',
        cart: 'Заказ из корзины'
      }
      return types[type] || type
    },

    getVehicleTypeText(type) {
      const typeMap = {
        gazelle: 'Газель (до 1.5 тонн)',
        truck: 'Грузовик (до 5 тонн)'
      }
      return typeMap[type] || type
    },

    getPaymentMethodText(method) {
      const methodMap = {
        cash: 'Наличными',
        card: 'Картой'
      }
      return methodMap[method] || method
    },

    showOrderDetails(order) {
      console.log('Детали заказа:', order)
      console.log('Тип услуги:', order.service_type)
      console.log('Товары в заказе (сырые):', order.items)

      // Для обычных заказов
      if (order.service_type !== 'cart') {
        this.selectedOrder = {
          ...order,
          type: order.service_type
        }
        return
      }

      // Для заказов из корзины
      try {
        let parsedItems = order.items

        // Если items это строка, пробуем распарсить
        if (typeof order.items === 'string') {
          console.log('Парсим строку items:', order.items)
          parsedItems = JSON.parse(order.items)
        }

        console.log('Распарсенные items:', parsedItems)

        this.selectedOrder = {
          ...order,
          items: Array.isArray(parsedItems) ? parsedItems : []
        }

        console.log('Установленный selectedOrder:', this.selectedOrder)
      } catch (error) {
        console.error('Ошибка при парсинге items:', error)
        this.selectedOrder = order
      }
    },

    async updateOrderComment(orderId, comment) {
      try {
        const { error } = await supabase
          .from('service_orders')
          .update({ comment })
          .eq('id', orderId)

        if (error) throw error

        this.$emit('show-toast', {
          message: 'Комментарий обновлен',
          type: 'success'
        })
      } catch (error) {
        console.error('Error updating comment:', error)
        this.$emit('show-toast', {
          message: 'Ошибка при обновлении комментария',
          type: 'error'
        })
      }
    },

    confirmDelete(orderId) {
      this.orderToDelete = orderId
    },

    async deleteOrder() {
      try {
        const { error } = await supabase
          .from('service_orders')
          .delete()
          .eq('id', this.orderToDelete)

        if (error) throw error

        await this.fetchOrders()
        this.$emit('show-toast', {
          message: 'Заказ успешно удален',
          type: 'success'
        })
        this.orderToDelete = null
      } catch (error) {
        console.error('Error deleting order:', error)
        this.$emit('show-toast', {
          message: 'Ошибка при удалении заказа',
          type: 'error'
        })
      }
    },

    getOriginalPrice(order) {
      return order.original_price || order.total_price
    },

    isPercentageDiscount(promoCode) {
      return !promoCode.endsWith('%') && /\d+$/.test(promoCode)
    },

    getDiscountPercentage(promoCode) {
      if (!this.isPercentageDiscount(promoCode)) return 0
      const match = promoCode.match(/(\d+)$/)
      return match ? Number(match[1]) : 0
    },

    hasServiceParams(item) {
      if (!item) {
        console.log('Item is null or undefined')
        return false
      }
      console.log('Проверка параметров для:', item)
      return Boolean(item.workers || item.hours || item.vehicle_type)
    }
  },

  created() {
    this.fetchOrders()
  }
})
</script>

<style scoped>
.orders-manager {
  padding: 1rem;
}

.filters {
  margin-bottom: 1rem;
}

.filter-select {
  padding: 0.5rem;
  border-radius: 4px;
  background: var(--bg-elevated);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.table-container {
  overflow-x: auto;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.orders-table th,
.orders-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.orders-table th {
  background: var(--bg-elevated);
  font-weight: 500;
  text-transform: uppercase;
  font-size: 0.9rem;
}

.status-select {
  padding: 0.25rem;
  border-radius: 4px;
  background: var(--bg-elevated);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  width: 100%;
}

.comment-input {
  width: 100%;
  padding: 0.25rem;
  border-radius: 4px;
  background: var(--bg-elevated);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn,
.delete-btn {
  padding: 0.25rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.edit-btn:hover,
.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

.edit-btn {
  background: var(--info-color);
  color: white;
}

.delete-btn {
  background: var(--error-color);
  color: white;
}

.material-icons {
  font-size: 1.2rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.orders-table td {
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.orders-table td:nth-child(5),
.orders-table td:nth-child(9) {
  white-space: normal;
  min-width: 150px;
}

.orders-table th:nth-child(1),
.orders-table td:nth-child(1) {
  width: 50px;
}

.orders-table th:nth-child(7),
.orders-table td:nth-child(7) {
  width: 100px;
}

.orders-table th:nth-child(8),
.orders-table td:nth-child(8) {
  width: 120px;
}

.orders-table th:nth-child(10),
.orders-table td:nth-child(10) {
  width: 100px;
}

.orders-table td:nth-child(6) {
  width: 150px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--modal-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-elevated);
  border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.modal-body {
  padding: 1rem;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1.2rem;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--text-primary);
}

.detail-group {
  margin-bottom: 1.5rem;
  background: var(--bg-elevated);
  padding: 1rem;
  border-radius: var(--border-radius);
}

.detail-group h4 {
  margin-bottom: 1rem;
  color: var(--accent-primary);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.detail-row {
  display: flex;
  margin-bottom: 0.5rem;
}

.label {
  min-width: 150px;
  color: var(--text-secondary);
}

.comment-input {
  width: 100%;
  min-height: 100px;
  padding: 0.5rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  resize: vertical;
}

.comment-input:focus {
  border-color: var(--accent-primary);
  outline: none;
  box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.25);
}

.details-btn {
  background: var(--accent-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.details-btn:hover {
  background: var(--accent-secondary);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.confirm-delete {
  max-width: 400px !important;
  padding: 2rem;
  text-align: center;
  border-radius: var(--border-radius);
  background: var(--bg-secondary);
}

.confirm-delete h3 {
  margin-bottom: 1rem;
  color: var(--error-color);
}

.confirm-delete p {
  margin-bottom: 2rem;
  color: var(--text-secondary);
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-cancel,
.btn-confirm {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-cancel {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.btn-confirm {
  background: var(--error-color);
  color: white;
}

.btn-cancel:hover,
.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-confirm:hover {
  background: var(--error-color-hover);
}

.promo-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.discount-badge {
  background: var(--accent-primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.total-price {
  color: var(--accent-primary);
  font-weight: bold;
}

.price-with-discount {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.original-price {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-decoration: line-through;
}

.final-price {
  color: var(--accent-primary);
  font-weight: bold;
}

.cart-items-list {
  background: var(--bg-elevated);
  border-radius: var(--border-radius);
  padding: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) inset;
}

.cart-item-row {
  padding: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s;
}

.cart-item-row:hover {
  background-color: var(--bg-secondary-hover);
}

.cart-item-row:last-child {
  border-bottom: none;
}

.cart-item-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.item-main {
  flex: 1;
}

.item-title {
  font-weight: 500;
  color: var(--accent-primary);
}

.item-params {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.item-price {
  color: var(--accent-primary);
  font-weight: 500;
}

.no-items {
  padding: 1rem;
  text-align: center;
  color: var(--text-secondary);
  background: var(--bg-elevated);
  border-radius: var(--border-radius);
  border: 1px dashed var(--border-color);
}
</style>
