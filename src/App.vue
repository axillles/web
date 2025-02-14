<template>
  <div id="app">
    <nav class="navbar">
      <div class="logo">NKL</div>
      <router-link to="/">Главная</router-link>
      <router-link to="/catalog">Каталог</router-link>
      <router-link to="/calculator">Калькулятор</router-link>
      <router-link to="/about">О нас</router-link>
      <div class="auth-buttons">
        <template v-if="authStore.isAuthenticated">
          <router-link v-if="authStore.isAdmin" to="/admin" class="admin-link">
            Админ-панель
          </router-link>
          <router-link to="/profile" class="profile-button">
            <img
              :src="authStore.user?.user_metadata?.avatar_url || '/smallanonim.jpg'"
              alt="Профиль"
              class="profile-avatar"
            />
          </router-link>
        </template>
        <button v-else @click="showAuthModal = true" class="btn-login">Войти</button>
      </div>
    </nav>

    <router-view></router-view>

    <AppFooter />
    <ToastNotification ref="toast" />
    <AuthModal v-if="showAuthModal" @close="handleModalClose" @success="handleAuthSuccess" />
    <CookieConsent @consent-updated="handleCookieConsent" />
  </div>
</template>

<script>
import AppFooter from '@/components/AppFooter.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import AuthModal from '@/components/AuthModal.vue'
import CookieConsent from '@/components/CookieConsent.vue'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'App',
  components: {
    AppFooter,
    ToastNotification,
    AuthModal,
    CookieConsent,
  },
  async created() {
    try {
      await this.authStore.checkAuth()
    } catch (error) {
      this.showToast('Ошибка при проверке авторизации', 'error')
    }
  },
  data() {
    return {
      showAuthModal: false,
      authStore: useAuthStore(),
    }
  },
  computed: {
    userName() {
      return this.authStore.user?.name || ''
    },
  },
  provide() {
    return {
      showToast: this.showToast,
    }
  },
  methods: {
    showToast(message, type) {
      this.$refs.toast.showToast(message, type)
    },
    handleModalClose() {
      this.showAuthModal = false
    },
    handleAuthSuccess() {
      if (this.authStore.isAuthenticated) {
        this.$router.push('/profile')
      }
    },
    handleLogout() {
      this.authStore.logout()
      this.showToast('Вы успешно вышли из системы', 'info')
      this.$router.push('/')
    },
    handleCookieConsent(settings) {
      if (settings.analytics) {
        // Инициализация аналитики
      }
      if (settings.marketing) {
        // Инициализация маркетинговых инструментов
      }
    },
  },
}
</script>

<style>
/* Сброс стилей и общие стили */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #ffffff;
  background: #121212;
}

/* Стили навигации */
.navbar {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #000000;
  box-shadow: 0 1px 3px rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 100;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  margin-right: 2rem;
  color: #1db954;
}

.navbar a {
  display: inline-block;
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #b3b3b3;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.navbar a:hover {
  color: #ffffff;
  background: #282828;
}

.navbar a.router-link-active {
  color: #ffffff;
  background: #282828;
  font-weight: 500;
}

/* Общие стили для контента */
h1 {
  margin-bottom: 1.5rem;
  font-size: 2rem;
}

h2 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

p {
  margin-bottom: 1rem;
}

.auth-buttons {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-login,
.btn-logout {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn-login {
  background: #1db954;
  color: white;
  cursor: pointer;
  position: relative;
}

.btn-login:hover {
  background: #1ed760;
}

.btn-logout {
  background: #282828;
  color: white;
  cursor: pointer;
}

.profile-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #282828;
  color: #333;
  text-decoration: none;
  margin-right: 1rem;
  border: 2px solid #404040;
  overflow: hidden;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.admin-link {
  padding: 0.5rem 1rem;
  background: #282828;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  margin-right: 1rem;
}

.admin-link:hover {
  background: #404040;
}

/* Стили для кнопок карусели */
.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.carousel-nav:hover {
  background: rgba(255, 255, 255, 0.2);
}

.carousel-nav.prev {
  left: 20px;
}

.carousel-nav.next {
  right: 20px;
}

/* Стили для иконок стрелок */
.carousel-nav svg {
  width: 20px;
  height: 20px;
  fill: #ffffff;
  transition: fill 0.3s ease;
}

.carousel-nav:hover svg {
  fill: #1db954;
}
</style>
