<template>
  <div id="app">
    <nav class="navbar">
      <div class="navbar-top">
        <div class="logo">NKL</div>

        <!-- Навигационные ссылки в одну строку -->
        <div class="nav-links">
          <router-link to="/">Главная</router-link>
          <router-link to="/catalog">Каталог</router-link>
          <router-link to="/calculator">Калькулятор</router-link>
          <router-link to="/about">О нас</router-link>
        </div>

        <!-- Контакты и профиль (на десктопе в одной строке, на телефоне - во второй) -->
        <div class="navbar-end">
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
        </div>
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
    const showAuthModal = ref(false)
    const isAuthenticating = ref(false)
    const toastRef = ref(null)

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

    const handleModalClose = () => {
      showAuthModal.value = false
    }

    const handleAuthSuccess = () => {
      showAuthModal.value = false
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

    const handleCookieConsent = () => {
      // Обработка события согласия с cookie
    }

    return {
      currentTheme,
      toggleTheme,
      showAuthModal,
      handleModalClose,
      handleAuthSuccess,
      isAuthenticating,
      toastRef,
      authStore,
      handleLogout,
      handleCookieConsent
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
  background: var(--bg-secondary);
}

.navbar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  flex-wrap: nowrap;
}

.navbar-end {
  display: flex;
  align-items: center;
  gap: 2rem;  /* Увеличенный промежуток для десктопов */
}

/* Навигационные ссылки */
.nav-links {
  display: flex;
  align-items: center;
  gap: 1rem;  /* Увеличенный промежуток для десктопов */
  margin: 0 2rem;  /* Увеличенный промежуток для десктопов */
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--accent-primary);
  flex-shrink: 0;
  margin-right: 1rem;
}

.navbar a {
  display: inline-block;
  padding: 0.5rem 1rem;  /* Увеличенный padding для десктопов */
  text-decoration: none;
  color: var(--text-secondary);
  border-radius: 4px;
  transition: all 0.3s ease;
  white-space: nowrap;
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

.contact-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;  /* Увеличенный промежуток для десктопов */
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
  gap: 0.75rem;  /* Увеличенный промежуток для десктопов */
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
  gap: 0.75rem;  /* Увеличенный промежуток для десктопов */
}

.btn-login,
.btn-logout {
  padding: 0.5rem 1rem;  /* Увеличенный padding для десктопов */
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  white-space: nowrap;
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

/* Адаптивные стили */
@media (max-width: 1024px) {
  .navbar-top {
    padding: 0.65rem 0.85rem;
  }

  .logo {
    font-size: 1.3rem;
  }

  .navbar a {
    padding: 0.45rem 0.85rem;
    font-size: 0.95rem;
  }

  .nav-links {
    gap: 0.75rem;
    margin: 0 1.5rem;
  }

  .navbar-end {
    gap: 1.5rem;
  }

  .phone-number {
    font-size: 0.9rem;
  }

  .btn-login {
    padding: 0.45rem 0.85rem;
    font-size: 0.85rem;
  }

  .admin-link {
    padding: 0.35rem 0.6rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  /* На мобильных устройствах делаем навигацию двухстрочной */
  .navbar-top {
    flex-wrap: wrap;
    padding: 0.5rem;
  }

  .navbar-end {
    width: 100%;
    justify-content: center;
    margin-top: 0.5rem;
    order: 2;
    gap: 1rem;
  }

  .logo {
    font-size: 1.2rem;
    margin-right: 0.5rem;
  }

  .nav-links {
    flex: 1;
    justify-content: center;
    gap: 0.5rem;
    margin: 0;
  }

  .navbar a {
    padding: 0.35rem 0.65rem;
    font-size: 0.9rem;
  }

  .phone-number {
    font-size: 0.85rem;
  }

  .messenger-links {
    gap: 0.5rem;
  }

  .messenger-icon {
    width: 20px;
    height: 20px;
  }

  .btn-login {
    padding: 0.35rem 0.65rem;
    font-size: 0.8rem;
  }

  .admin-link {
    padding: 0.35rem 0.55rem;
    font-size: 0.8rem;
  }

  .profile-avatar {
    width: 28px;
    height: 28px;
  }

  .auth-buttons {
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .navbar-top {
    padding: 0.45rem 0.4rem 0.3rem 0.4rem;
  }

  .navbar-end {
    margin-top: 0.35rem;
    gap: 0.65rem;
  }

  .logo {
    font-size: 1.1rem;
    margin-right: 0.25rem;
  }

  .navbar a {
    padding: 0.3rem 0.45rem;
    font-size: 0.8rem;
  }

  .nav-links {
    gap: 0.25rem;
  }

  .admin-link {
    padding: 0.25rem 0.4rem;
    font-size: 0.75rem;
  }

  .auth-buttons {
    gap: 0.35rem;
  }

  .messenger-icon {
    width: 18px;
    height: 18px;
  }

  .messenger-links {
    gap: 0.25rem;
  }

  .btn-login {
    padding: 0.3rem 0.5rem;
    font-size: 0.75rem;
  }
}
</style>

