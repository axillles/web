<template>
  <div class="users-manager">
    <div class="users-header">
      <h2>Управление пользователями</h2>
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Поиск по имени или телефону"
          class="search-input"
        >
      </div>
    </div>

    <div class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя</th>
            <th>Телефон</th>
            <th>Статус</th>
            <th>Дата регистрации</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.contact_name }}</td>
            <td>{{ user.phone }}</td>
            <td>
              <span :class="['status-badge', user.status]">
                {{ getStatusText(user.status) }}
              </span>
            </td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td class="actions">
              <button class="view-btn" @click="viewUserDetails(user)">
                <span class="material-icons">visibility</span>
              </button>
              <button
                class="block-btn"
                @click="toggleUserStatus(user)"
                :title="user.status === 'active' ? 'Заблокировать' : 'Разблокировать'"
              >
                <span class="material-icons">
                  {{ user.status === 'active' ? 'block' : 'check_circle' }}
                </span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно с деталями пользователя -->
    <div v-if="selectedUser" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Информация о пользователе</h3>
          <button class="close-btn" @click="selectedUser = null">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="user-details">
          <div class="detail-group">
            <h4>Основная информация</h4>
            <div class="detail-row">
              <span class="label">Имя:</span>
              <span>{{ selectedUser.contact_name }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Телефон:</span>
              <span>{{ selectedUser.phone }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Статус:</span>
              <span>{{ getStatusText(selectedUser.status) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Дата регистрации:</span>
              <span>{{ formatDate(selectedUser.created_at) }}</span>
            </div>
          </div>

          <div class="detail-group">
            <h4>Статистика заказов</h4>
            <div class="detail-row">
              <span class="label">Всего заказов:</span>
              <span>{{ userStats.totalOrders }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Сумма заказов:</span>
              <span>{{ formatPrice(userStats.totalSpent) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Средний чек:</span>
              <span>{{ formatPrice(userStats.averageOrder) }}</span>
            </div>
          </div>

          <div class="detail-group">
            <h4>История заказов</h4>
            <div class="orders-list">
              <div v-for="order in userStats.recentOrders" :key="order.id" class="order-item">
                <div class="order-header">
                  <span class="order-id">Заказ #{{ order.id }}</span>
                  <span class="order-date">{{ formatDate(order.datetime) }}</span>
                </div>
                <div class="order-details">
                  <div>{{ order.service_type === 'cart' ? 'Заказ из корзины' : getServiceTypeText(order.service_type) }}</div>
                  <div class="order-price">{{ formatPrice(order.total_price) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabaseClient'

export default {
  name: 'UsersManager',

  data() {
    return {
      users: [],
      searchQuery: '',
      selectedUser: null,
      userStats: {
        totalOrders: 0,
        totalSpent: 0,
        averageOrder: 0,
        recentOrders: []
      }
    }
  },

  computed: {
    filteredUsers() {
      if (!this.searchQuery) return this.users

      const query = this.searchQuery.toLowerCase()
      return this.users.filter(user =>
        user.contact_name?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query)
      )
    }
  },

  mounted() {
    this.fetchUsers()
  },

  methods: {
    async fetchUsers() {
      try {
        // Получаем уникальных пользователей из таблицы заказов
        const { data: users, error } = await supabase
          .from('service_orders')
          .select('id, contact_name, phone, created_at, status')
          .order('created_at', { ascending: false })

        if (error) throw error

        // Удаляем дубликаты по телефону
        const uniqueUsers = users.filter((user, index, self) =>
          index === self.findIndex((u) => u.phone === user.phone)
        )

        this.users = uniqueUsers
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    },

    async toggleUserStatus(user) {
      const newStatus = user.status === 'active' ? 'blocked' : 'active'
      try {
        const { error } = await supabase
          .from('service_orders')
          .update({ status: newStatus })
          .eq('phone', user.phone)

        if (error) throw error

        user.status = newStatus
      } catch (error) {
        console.error('Error updating user status:', error)
      }
    },

    async viewUserDetails(user) {
      this.selectedUser = user
      await this.fetchUserStats(user.phone)
    },

    async fetchUserStats(phone) {
      try {
        const { data: orders, error } = await supabase
          .from('service_orders')
          .select('*')
          .eq('phone', phone)
          .order('created_at', { ascending: false })

        if (error) throw error

        const totalOrders = orders.length
        const totalSpent = orders.reduce((sum, order) => sum + order.total_price, 0)

        this.userStats = {
          totalOrders,
          totalSpent,
          averageOrder: totalOrders ? Math.round(totalSpent / totalOrders) : 0,
          recentOrders: orders.slice(0, 5) // Последние 5 заказов
        }
      } catch (error) {
        console.error('Error fetching user stats:', error)
      }
    },

    getServiceTypeText(type) {
      const types = {
        moving: 'Квартирный переезд',
        office: 'Офисный переезд',
        loading: 'Погрузка/разгрузка',
        lifting: 'Подъем на этаж',
        cart: 'Заказ из корзины'
      }
      return types[type] || type
    },

    getStatusText(status) {
      const statuses = {
        active: 'Активен',
        blocked: 'Заблокирован',
        new: 'Новый',
        confirmed: 'Подтвержден',
        completed: 'Выполнен',
        cancelled: 'Отменен'
      }
      return statuses[status] || status
    },

    formatDate(date) {
      return new Date(date).toLocaleString('ru-RU')
    },

    formatPrice(price) {
      return `${price.toLocaleString('ru-RU')} ₽`
    }
  }
}
</script>

<style scoped>
.users-manager {
  color: #ffffff;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.search-input {
  padding: 0.75rem;
  background: #404040;
  border: 1px solid #505050;
  border-radius: 4px;
  color: white;
  width: 300px;
}

.users-table-container {
  background: #282828;
  border-radius: 8px;
  overflow: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #404040;
}

.users-table th {
  background: #323232;
  font-weight: 500;
  color: #b3b3b3;
}

.role-select {
  padding: 0.5rem;
  background: #404040;
  border: 1px solid #505050;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}

.role-select.admin {
  color: #1db954;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.status-badge.active {
  background: #1db954;
  color: white;
}

.status-badge.blocked {
  background: #e91429;
  color: white;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.view-btn,
.block-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #404040;
  color: white;
}

.view-btn:hover {
  background: #505050;
}

.block-btn:hover {
  background: #e91429;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #282828;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #404040;
}

.close-btn {
  background: none;
  border: none;
  color: #b3b3b3;
  cursor: pointer;
}

.user-details {
  padding: 1.5rem;
}

.detail-group {
  margin-bottom: 2rem;
}

.detail-group h4 {
  color: #1db954;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  margin-bottom: 0.5rem;
}

.detail-row .label {
  min-width: 150px;
  color: #b3b3b3;
}

@media (max-width: 1024px) {
  .users-header {
    flex-direction: column;
    gap: 1rem;
  }

  .search-input {
    width: 100%;
  }

  .users-table th,
  .users-table td {
    padding: 0.75rem 0.5rem;
  }

  .role-select {
    max-width: 120px;
  }
}

/* Добавляем стили для списка заказов */
.orders-list {
  margin-top: 1rem;
}

.order-item {
  background: #323232;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 0.5rem;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.order-id {
  font-weight: 500;
}

.order-date {
  color: #b3b3b3;
  font-size: 0.9rem;
}

.order-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-price {
  color: #1db954;
  font-weight: 500;
}
</style>
