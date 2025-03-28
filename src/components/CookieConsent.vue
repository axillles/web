<template>
  <div v-if="!accepted" class="cookie-consent" :class="{ show: isVisible }">
    <div class="cookie-content">
      <div class="cookie-text">
        <h3>🍪 Мы используем файлы cookie</h3>
        <p>
          Мы используем файлы cookie для улучшения работы сайта и предоставления вам персонализированного опыта.
          Продолжая использовать этот сайт, вы соглашаетесь с нашей
          <router-link to="/privacy" class="policy-link">политикой конфиденциальности</router-link>.
        </p>
      </div>
      <div class="cookie-actions">
        <button class="btn-accept" @click="acceptCookies">
          Принять все
        </button>
        <button class="btn-settings" @click="showSettings = true">
          Настройки
        </button>
      </div>
    </div>

    <!-- Модальное окно настроек -->
    <div v-if="showSettings" class="cookie-settings-modal">
      <div class="modal-content">
        <button class="close-button" @click="showSettings = false">&times;</button>
        <h2>Настройки файлов cookie</h2>

        <div class="settings-section">
          <div class="cookie-option">
            <div class="option-header">
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="settings.necessary"
                  disabled
                  checked
                >
                <span class="slider"></span>
              </label>
              <h4>Необходимые</h4>
            </div>
            <p>Эти файлы cookie необходимы для работы сайта и не могут быть отключены.</p>
          </div>

          <div class="cookie-option">
            <div class="option-header">
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="settings.analytics"
                >
                <span class="slider"></span>
              </label>
              <h4>Аналитика</h4>
            </div>
            <p>Помогают понять, как посетители взаимодействуют с сайтом.</p>
          </div>

          <div class="cookie-option">
            <div class="option-header">
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="settings.marketing"
                >
                <span class="slider"></span>
              </label>
              <h4>Маркетинг</h4>
            </div>
            <p>Используются для персонализации рекламы.</p>
          </div>
        </div>

        <div class="settings-actions">
          <button class="btn-save" @click="saveSettings">
            Сохранить настройки
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CookieConsent',
  data() {
    return {
      accepted: false,
      isVisible: false,
      showSettings: false,
      settings: {
        necessary: true,
        analytics: true,
        marketing: false
      }
    }
  },
  mounted() {
    // Проверяем, принимал ли пользователь уже cookies
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (cookieConsent) {
      this.accepted = true
      this.settings = JSON.parse(cookieConsent)
    } else {
      // Показываем баннер с небольшой задержкой
      setTimeout(() => {
        this.isVisible = true
      }, 1000)
    }
  },
  methods: {
    acceptCookies() {
      this.settings = {
        necessary: true,
        analytics: true,
        marketing: true
      }
      this.saveCookieSettings()
    },
    saveSettings() {
      this.saveCookieSettings()
      this.showSettings = false
    },
    saveCookieSettings() {
      localStorage.setItem('cookieConsent', JSON.stringify(this.settings))
      this.accepted = true
      this.isVisible = false
      this.$emit('consent-updated', this.settings)
    }
  }
}
</script>

<style scoped>
.cookie-consent {
  position: fixed;
  bottom: -100%;
  left: 0;
  width: 100%;
  background: var(--bg-secondary);
  padding: 1rem;
  box-shadow: var(--card-shadow);
  z-index: 1000;
  transition: bottom 0.3s ease;
}

.cookie-consent.show {
  bottom: 0;
}

.cookie-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.cookie-text h3 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.cookie-text p {
  color: var(--text-secondary);
}

.policy-link {
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 500;
}

.policy-link:hover {
  text-decoration: underline;
}

.cookie-actions {
  display: flex;
  gap: 1rem;
}

.btn-accept {
  background: var(--accent-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-accept:hover {
  background: var(--accent-secondary);
}

.btn-settings {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-settings:hover {
  background: var(--border-color);
}

.cookie-settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.modal-content {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  color: var(--text-primary);
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
  transition: color 0.3s ease;
}

.close-button:hover {
  color: var(--text-primary);
}

.settings-section {
  margin-top: 1.5rem;
}

.cookie-option {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.cookie-option:last-child {
  border-bottom: none;
}

.option-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.option-header h4 {
  margin: 0;
  color: var(--text-primary);
}

.cookie-option p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* Переключатель */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-elevated);
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--accent-primary);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--accent-primary);
}

input:disabled + .slider {
  opacity: 0.5;
  cursor: not-allowed;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-save {
  background: var(--accent-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-save:hover {
  background: var(--accent-secondary);
}

/* Адаптивность */
@media (max-width: 768px) {
  .cookie-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .cookie-actions {
    flex-direction: column;
  }

  .btn-accept,
  .btn-settings {
    width: 100%;
  }
}
</style>
