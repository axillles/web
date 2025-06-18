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
            <button type="submit" class="btn-save" :disabled="isLoading">
              {{ isLoading ? 'Сохранение...' : 'Сохранить изменения' }}
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
            <button type="submit" class="btn-save" :disabled="isLoading">
              {{ isLoading ? 'Сохранение...' : 'Изменить пароль' }}
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
import { useToast } from '@/composables/useToast'

export default {
  name: 'UserProfile',
  setup() {
    const authStore = useAuthStore()
    const { showToast } = useToast()
    const activeTab = ref('personal')
    const user = computed(() => authStore.user)
    const isLoading = ref(false)

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

    const handleLogout = async () => {
      try {
        await authStore.logout()
      } catch {
        showToast('Ошибка при выходе из аккаунта', 'error')
      }
    }

    const updateProfile = async () => {
      try {
        isLoading.value = true

        // Проверяем валидность телефона
        const phoneRegex = /^\+375\s?\d{2}\s?\d{3}-?\d{2}-?\d{2}$/
        if (!phoneRegex.test(profileForm.value.phone)) {
          throw new Error('Неверный формат телефона')
        }

        // Используем правильный метод updateProfile вместо updateUserMetadata
        await authStore.updateProfile({
          name: profileForm.value.name,
          phone: profileForm.value.phone
        })

        showToast('Профиль успешно обновлен', 'success')
      } catch (error) {
        showToast(error.message || 'Ошибка при обновлении профиля', 'error')
      } finally {
        isLoading.value = false
      }
    }

    const changePassword = async () => {
      try {
        isLoading.value = true

        // Проверяем совпадение паролей
        if (passwordForm.value.new !== passwordForm.value.confirm) {
          throw new Error('Пароли не совпадают')
        }

        // Проверяем сложность пароля
        if (passwordForm.value.new.length < 8) {
          throw new Error('Пароль должен содержать минимум 8 символов')
        }

        await authStore.updatePassword(
          passwordForm.value.current,
          passwordForm.value.new
        )

        // Очищаем форму
        passwordForm.value = {
          current: '',
          new: '',
          confirm: ''
        }

        showToast('Пароль успешно изменен', 'success')
      } catch (error) {
        showToast(error.message || 'Ошибка при изменении пароля', 'error')
      } finally {
        isLoading.value = false
      }
    }

    return {
      user,
      activeTab,
      profileForm,
      passwordForm,
      handleLogout,
      updateProfile,
      changePassword,
      isLoading
    }
  }
}
</script>

<style>
.profile {
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.profile-container {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  margin-top: 1rem;
}

.profile-sidebar {
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  overflow: hidden;
}

.user-info {
  padding: 2rem 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.avatar {
  width: 120px;
  height: 120px;
  background: var(--bg-elevated);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.avatar i {
  font-size: 3rem;
  color: var(--accent-primary);
}

.username {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  word-wrap: break-word;
}

.email {
  color: var(--text-secondary);
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
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.profile-nav button:hover {
  background: var(--bg-secondary-hover);
  color: var(--text-primary);
}

.profile-nav button.active {
  background: var(--bg-secondary-hover);
  color: var(--accent-primary);
  border-left-color: var(--accent-primary);
}

.logout-button {
  width: 100%;
  padding: 1rem;
  background: var(--error-color);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;
}

.logout-button:hover {
  background: var(--error-color-hover);
}

.profile-content {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  padding: 2rem;
  min-height: 500px;
  box-shadow: var(--card-shadow);
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
    border-bottom-color: var(--accent-primary);
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
  color: var(--text-primary);
}

.tab-content h2 {
  margin-bottom: 2rem;
  color: var(--accent-primary);
}

.profile-form {
  max-width: 400px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.25);
}

.form-group input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-save {
  background: var(--accent-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-save:hover {
  background: var(--accent-secondary);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-save:disabled {
  background: var(--bg-elevated);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-save:disabled:hover {
  background: var(--bg-elevated);
  transform: none;
  box-shadow: none;
}
</style>
