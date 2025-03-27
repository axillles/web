<template>
  <div id="app">
    <nav class="navbar">
      <div class="logo">NKL</div>
      <router-link to="/">Главная</router-link>
      <router-link to="/catalog">Каталог</router-link>
      <router-link to="/calculator">Калькулятор</router-link>
      <router-link to="/about">О нас</router-link>

      <div class="contact-info">
        <a href="tel:+375336052984" class="phone-number">+375 33 605-29-84</a>
        <div class="messenger-links">
          <a href="viber://chat?number=%2B375336052984" target="_blank">
            <img src="/Icons/viber.png" alt="Viber" class="messenger-icon" />
          </a>
          <a href="https://wa.me/375336052984" target="_blank">
            <img src="/Icons/whatsapp.png" alt="WhatsApp" class="messenger-icon" />
          </a>
        </div>
      </div>

      <div class="auth-buttons">
        <ThemeToggle />
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

    <router-view @show-auth="showAuthModal = true"></router-view>

    <AppFooter />
    <ToastNotification ref="toast" />
    <AuthModal v-if="showAuthModal" @close="handleModalClose" @success="handleAuthSuccess" />
    <CookieConsent @consent-updated="handleCookieConsent" />
  </div>
</template>

<script>
import AppFooter from '@/components/AppFooter.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import ToastNotification from '@/components/ToastNotification.vue'
import AuthModal from '@/components/AuthModal.vue'
import CookieConsent from '@/components/CookieConsent.vue'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref, provide } from 'vue'

export default {
  name: 'App',
  components: {
    AppFooter,
    ThemeToggle,
    ToastNotification,
    AuthModal,
    CookieConsent
  },
  setup() {
    const { currentTheme, toggleTheme } = useTheme()
    const authStore = useAuthStore()
    const showAuth = ref(false)
    const isAuthenticating = ref(false)
    const toastRef = ref(null)
    const isNavOpen = ref(false)

    // Предоставляем метод для дочерних компонентов
    provide('showToast', (message, type = 'info') => {
      if (toastRef.value) {
        toastRef.value.showToast(message, type)
      }
    })

    onMounted(async () => {
      // Проверяем аутентификацию при загрузке
      try {
        isAuthenticating.value = true
        await authStore.checkAuth()
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        isAuthenticating.value = false
      }
    })

    const handleShowAuth = () => {
      showAuth.value = true
    }

    const handleCloseAuth = () => {
      showAuth.value = false
    }

    const handleAuthSuccess = () => {
      showAuth.value = false
      if (toastRef.value) {
        toastRef.value.showToast('Вы успешно вошли!', 'success')
      }
    }

    const handleLogout = async () => {
      try {
        await authStore.logout()
        if (toastRef.value) {
          toastRef.value.showToast('Вы вышли из аккаунта', 'info')
        }
      } catch (error) {
        if (toastRef.value) {
          toastRef.value.showToast(error.message || 'Ошибка при выходе', 'error')
        }
      }
    }

    const toggleNav = () => {
      isNavOpen.value = !isNavOpen.value
    }

    return {
      currentTheme,
      toggleTheme,
      showAuth,
      handleShowAuth,
      handleCloseAuth,
      handleAuthSuccess,
      isAuthenticating,
      toastRef,
      authStore,
      handleLogout,
      isNavOpen,
      toggleNav
    }
  }
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
}

/* Стили навигации */
.navbar {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  margin-right: 2rem;
  color: var(--accent-primary);
}

.navbar a {
  display: inline-block;
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: var(--text-secondary);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.navbar a:hover {
  color: var(--text-primary);
  background: var(--bg-elevated);
}

.navbar a.router-link-active {
  color: var(--text-primary);
  background: var(--bg-elevated);
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

.contact-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  margin-right: 1rem;
  white-space: nowrap;
}

.phone-number {
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  transition: color 0.3s ease;
  white-space: nowrap;
}

.phone-number:hover {
  color: var(--accent-primary);
}

.messenger-links {
  display: flex;
  gap: 0.5rem;
}

.messenger-icon {
  width: 24px;
  height: 24px;
  transition: transform 0.3s ease;
}

.messenger-icon:hover {
  transform: translateY(-2px);
}

.auth-buttons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
  background: var(--accent-primary);
  color: white;
  cursor: pointer;
  position: relative;
}

.btn-login:hover {
  background: var(--accent-secondary);
}

.btn-logout {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.profile-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
}

.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.profile-avatar:hover {
  transform: scale(1.1);
}

.admin-link {
  padding: 0.4rem 0.8rem;
  background: var(--bg-elevated);
  color: var(--accent-primary) !important;
  border-radius: 4px;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.admin-link:hover {
  background: var(--accent-primary);
  color: white !important;
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

@media (max-width: 1024px) {
  .navbar {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.75rem 0.5rem;
  }

  .logo {
    margin-right: 1rem;
  }

  .navbar a {
    margin-right: 0.5rem;
    padding: 0.4rem 0.75rem;
    font-size: 0.9rem;
  }

  .contact-info {
    margin: 0.5rem auto;
    order: 2;
    flex-direction: column;
    align-items: center;
  }

  .phone-number {
    font-size: 0.9rem;
  }

  .auth-buttons {
    order: 3;
    margin: 0 auto;
  }

  .admin-link {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
  }

  .btn-login {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0.5rem 0.25rem;
    gap: 0.5rem;
  }

  .logo {
    font-size: 1.2rem;
    margin-right: 0.5rem;
  }

  .navbar a {
    font-size: 0.8rem;
    padding: 0.3rem 0.5rem;
  }
}
</style>
