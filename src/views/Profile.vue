<template>
  <div class="profile">
    <div class="profile-container">
      <!-- Боковая панель -->
      <div class="profile-sidebar">
        <div class="user-info">
          <div class="avatar">
            <i class="fas fa-user"></i>
          </div>
          <h2 class="username">{{ user?.name || 'Пользователь' }}</h2>
          <p class="email">{{ user?.email }}</p>
        </div>

        <nav class="profile-nav">
          <button
            :class="{ active: activeTab === 'orders' }"
            @click="activeTab = 'orders'"
          >
            Мои заказы
          </button>
          <button
            :class="{ active: activeTab === 'personal' }"
            @click="activeTab = 'personal'"
          >
            Личные данные
          </button>
          <button
            :class="{ active: activeTab === 'security' }"
            @click="activeTab = 'security'"
          >
            Безопасность
          </button>
        </nav>

        <button @click="handleLogout" class="logout-button">
          Выйти из аккаунта
        </button>
      </div>

      <!-- Контент вкладок -->
      <div class="profile-content">
        <!-- Вкладка заказов -->
        <div v-if="activeTab === 'orders'" class="tab-content">
          <h2>Мои заказы</h2>
          <div v-if="orders.length" class="orders-list">
            <div v-for="order in orders" :key="order.id" class="order-card">
              <div class="order-header">
                <span class="order-number">Заказ #{{ order.id }}</span>
                <span :class="['order-status', order.status]">{{ getStatusText(order.status) }}</span>
              </div>
              <div class="order-details">
                <div class="order-info">
                  <p class="order-date">{{ formatDate(order.date) }}</p>
                  <p class="order-price">{{ order.total }} ₽</p>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="fas fa-shopping-bag"></i>
            <p>У вас пока нет заказов</p>
            <router-link to="/catalog" class="btn-primary">Перейти в каталог</router-link>
          </div>
        </div>

        <!-- Вкладка личных данных -->
        <div v-if="activeTab === 'personal'" class="tab-content">
          <h2>Личные данные</h2>
          <form @submit.prevent="updateProfile" class="profile-form">
            <div class="form-group">
              <label>Имя</label>
              <input
                type="text"
                v-model="profileForm.name"
                placeholder="Ваше имя"
              />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input
                type="email"
                v-model="profileForm.email"
                placeholder="example@mail.com"
                disabled
              />
            </div>
            <div class="form-group">
              <label>Телефон</label>
              <input
                type="tel"
                v-model="profileForm.phone"
                placeholder="+375 (XX) XXX-XX-XX"
              />
            </div>
            <button type="submit" class="btn-save">
              Сохранить изменения
            </button>
          </form>
        </div>

        <!-- Вкладка безопасности -->
        <div v-if="activeTab === 'security'" class="tab-content">
          <h2>Безопасность</h2>
          <form @submit.prevent="changePassword" class="profile-form">
            <div class="form-group">
              <label>Текущий пароль</label>
              <input
                type="password"
                v-model="passwordForm.current"
                placeholder="Введите текущий пароль"
                required
              />
            </div>
            <div class="form-group">
              <label>Новый пароль</label>
              <input
                type="password"
                v-model="passwordForm.new"
                placeholder="Введите новый пароль"
                required
              />
            </div>
            <div class="form-group">
              <label>Подтверждение пароля</label>
              <input
                type="password"
                v-model="passwordForm.confirm"
                placeholder="Подтвердите новый пароль"
                required
              />
            </div>
            <button type="submit" class="btn-save">
              Изменить пароль
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'Profile',
  setup() {
    const authStore = useAuthStore()
    const activeTab = ref('orders')
    const orders = ref([]) // Здесь будут храниться заказы пользователя

    const profileForm = ref({
      name: authStore.user?.user_metadata?.name || '',
      email: authStore.user?.email || '',
      phone: authStore.user?.user_metadata?.phone || ''
    })

    const passwordForm = ref({
      current: '',
      new: '',
      confirm: ''
    })

    const user = computed(() => authStore.user)

    const handleLogout = async () => {
      try {
        await authStore.logout()
      } catch (error) {
        console.error('Ошибка при выходе:', error)
      }
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getStatusText = (status) => {
      const statusMap = {
        pending: 'Ожидает',
        processing: 'В обработке',
        completed: 'Выполнен',
        cancelled: 'Отменен'
      }
      return statusMap[status] || status
    }

    const updateProfile = async () => {
      // Здесь будет логика обновления профиля
    }

    const changePassword = async () => {
      // Здесь будет логика изменения пароля
    }

    return {
      user,
      activeTab,
      orders,
      profileForm,
      passwordForm,
      handleLogout,
      formatDate,
      getStatusText,
      updateProfile,
      changePassword
    }
  }
}
</script>

<style scoped>
.profile {
  padding: 2rem;
  min-height: calc(100vh - 64px);
  color: #ffffff;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

.profile-sidebar {
  background: #282828;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.user-info {
  padding: 2rem;
  text-align: center;
  border-bottom: 1px solid #404040;
}

.avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto 1.5rem;
  background: #404040;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar i {
  font-size: 3rem;
  color: #1db954;
}

.username {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #ffffff;
  word-wrap: break-word;
}

.email {
  color: #b3b3b3;
  font-size: 0.9rem;
  word-wrap: break-word;
  padding: 0 1rem;
}

.profile-nav {
  padding: 1rem 0;
}

.profile-nav button {
  width: 100%;
  padding: 1rem 2rem;
  text-align: left;
  background: none;
  border: none;
  color: #b3b3b3;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.profile-nav button:hover {
  background: #323232;
  color: #ffffff;
}

.profile-nav button.active {
  background: #323232;
  color: #1db954;
  border-left-color: #1db954;
}

.logout-button {
  width: 100%;
  padding: 1rem;
  background: #e91429;
  color: #ffffff;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;
}

.logout-button:hover {
  background: #ff1430;
}

.profile-content {
  background: #282828;
  border-radius: 8px;
  padding: 2rem;
  min-height: 500px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Адаптивность */
@media (max-width: 768px) {
  .profile {
    padding: 1rem;
  }

  .profile-container {
    grid-template-columns: 1fr;
  }

  .profile-nav {
    display: flex;
    overflow-x: auto;
    padding: 0.5rem;
  }

  .profile-nav button {
    padding: 0.75rem 1.5rem;
    white-space: nowrap;
    border-left: none;
    border-bottom: 3px solid transparent;
  }

  .profile-nav button.active {
    border-left: none;
    border-bottom-color: #1db954;
  }
}

@media (max-width: 480px) {
  .profile-content {
    padding: 1rem;
  }

  .user-info {
    padding: 1.5rem;
  }

  .avatar {
    width: 100px;
    height: 100px;
  }
}

.tab-content {
  color: #ffffff;
}

.tab-content h2 {
  margin-bottom: 2rem;
  color: #1db954;
}

.orders-list {
  display: grid;
  gap: 1rem;
}

.order-card {
  background: #323232;
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.3s ease;
}

.order-card:hover {
  transform: translateY(-2px);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.order-status.completed { background: #1db954; }
.order-status.pending { background: #ffc107; color: #000; }
.order-status.processing { background: #2196f3; }
.order-status.cancelled { background: #f44336; }

.profile-form {
  max-width: 400px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  background: #404040;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #ffffff;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #1db954;
}

.form-group input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-save {
  background: #1db954;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-save:hover {
  background: #1ed760;
  transform: translateY(-2px);
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #b3b3b3;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #404040;
}

.btn-primary {
  display: inline-block;
  background: #1db954;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #1ed760;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .profile-form {
    max-width: 100%;
  }
}
</style>
