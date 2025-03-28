<template>
  <div class="modal" @mousedown.self="$emit('close')">
    <div class="modal-content">
      <button class="close-button" @click="$emit('close')">&times;</button>
      <div class="auth-tabs">
        <button :class="{ active: activeTab === 'login' }" @click="activeTab = 'login'">
          Вход
        </button>
        <button :class="{ active: activeTab === 'register' }" @click="activeTab = 'register'">
          Регистрация
        </button>
      </div>

      <!-- Форма входа -->
      <form v-if="isLoginMode" @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="form.email" required placeholder="example@mail.com" />
        </div>
        <div class="form-group">
          <label>Пароль</label>
          <input type="password" v-model="form.password" required placeholder="Введите пароль" />
        </div>
        <button type="submit" class="btn-primary">Войти</button>
        <div class="form-footer">
          <a href="#" @click.prevent="forgotPassword">Забыли пароль?</a>
        </div>
      </form>

      <!-- Форма регистрации -->
      <form v-else @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label>Имя</label>
          <input type="text" v-model="form.name" required placeholder="Ваше имя" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="form.email" required placeholder="example@mail.com" />
        </div>
        <div class="form-group">
          <label>Телефон</label>
          <input type="tel" v-model="form.phone" required placeholder="+375 (__) ___-__-__" />
        </div>
        <div class="form-group">
          <label>Пароль</label>
          <input
            type="password"
            v-model="form.password"
            required
            placeholder="Минимум 6 символов"
          />
        </div>
        <button type="submit" class="btn-primary">Зарегистрироваться</button>
      </form>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'AuthModal',
  data() {
    return {
      activeTab: 'login',
      form: {
        email: '',
        password: '',
        name: '',
        phone: '',
      },
    }
  },
  computed: {
    isLoginMode() {
      return this.activeTab === 'login'
    },
  },
  methods: {
    forgotPassword() {
      this.showToast('Функция восстановления пароля в разработке', 'info')
    },
    async handleSubmit() {
      const authStore = useAuthStore()
      try {
        this.showToast(`Выполняется ${this.isLoginMode ? 'вход' : 'регистрация'}...`, 'info')
        if (this.isLoginMode) {
          await authStore.login(this.form.email, this.form.password)
        } else {
          await authStore.register({
            email: this.form.email,
            password: this.form.password,
            name: this.form.name,
            phone: this.form.phone,
          })
        }

        this.showToast(`Вы успешно ${this.isLoginMode ? 'вошли' : 'зарегистрировались'}`, 'success')
        this.$emit('success')
        this.$emit('close')
      } catch (error) {
        console.error('Auth error:', error)
        this.showToast(
          error.message || 'Ошибка при авторизации. Проверьте введенные данные.',
          'error',
        )
      }
    },
  },
  inject: ['showToast'],
}
</script>

<style scoped>
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
  max-width: 400px;
  box-shadow: var(--card-shadow);
}

.modal-content * {
  pointer-events: auto;
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

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
}

.modal-header h2 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.auth-tabs {
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.auth-tabs button {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  color: var(--text-secondary);
  transition: var(--transition-standard);
}

.auth-tabs button.active {
  border-bottom-color: var(--accent-primary);
  color: var(--accent-primary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.form-group input {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  background: var(--bg-elevated);
  color: var(--text-primary);
  transition: var(--transition-standard);
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.form-group input::placeholder {
  color: var(--text-secondary);
}

.form-footer {
  text-align: center;
  margin-top: 1rem;
}

.form-footer a {
  color: var(--accent-primary);
  text-decoration: none;
  transition: var(--transition-standard);
}

.form-footer a:hover {
  color: var(--accent-secondary);
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition-standard);
}

.btn-primary:hover {
  background: var(--accent-secondary);
}
</style>
