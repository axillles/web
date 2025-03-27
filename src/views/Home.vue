<template>
  <div class="home">
    <header class="hero">
      <h1>Грузчики и переезды</h1>
      <p class="subtitle">Профессиональные услуги грузчиков и организация переездов</p>
      <router-link to="/calculator" class="cta-button">Рассчитать стоимость</router-link>
    </header>

    <section class="services">
      <h2>Наши услуги</h2>
      <div class="services-grid">
        <div class="service-card">
          <h3>Грузчики</h3>
          <p>Профессиональные грузчики для любых задач</p>
        </div>
        <div class="service-card">
          <h3>Переезды</h3>
          <p>Комплексная организация переездов под ключ</p>
        </div>
        <div class="service-card">
          <h3>Транспорт</h3>
          <p>Грузовые автомобили различной вместимости</p>
        </div>
      </div>
    </section>

    <section class="promotions">
      <h2>Акции и спецпредложения</h2>
      <div v-if="isLoading" class="loader"></div>
      <PromotionSlider v-else />
    </section>

    <section class="business-clients">
      <h2>Для юридических лиц</h2>
      <p>Особые условия для компаний и постоянных клиентов</p>
      <button class="business-button" @click="showContactModal = true">
        <span class="button-icon">🏢</span>
        <span>Специальные условия</span>
      </button>
    </section>

    <!-- Модальное окно с контактной информацией -->
    <div v-if="showContactModal" class="modal">
      <div class="modal-content business-modal">
        <button class="close-button" @click="showContactModal = false">×</button>
        <h3 class="modal-title">Для юридических лиц</h3>
        <div class="contact-info">
          <div class="phone-container">
            <p class="phone-label">Свяжитесь с нами по телефону:</p>
            <div class="phone-numbers">
              <span class="phone-part">+375</span>
              <span class="phone-part accent">33 605-29-84</span>
            </div>
          </div>
          <div class="business-info">
            <p class="business-text">
              Для юридических лиц цены обсуждаются<br>
              индивидуально по телефону.<br><br>
              Мы предлагаем гибкие условия<br>
              сотрудничества и специальные тарифы.
            </p>
          </div>
          <div class="action-buttons">
            <a href="tel:+375336052984" class="call-button">Позвонить</a>
            <a href="mailto:nklsupabaseadm@gmail.com" class="email-button">
              Отправить запрос
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PromotionSlider from '@/components/PromotionSlider.vue'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Home',
  components: {
    PromotionSlider,
  },
  data() {
    return {
      showContactModal: false,
      isLoading: true
    }
  },
  mounted() {
    // Имитация загрузки данных
    setTimeout(() => {
      this.isLoading = false
    }, 1000)
  },
  methods: {},
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--navbar-bg);
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2rem;
  background: var(--accent-primary);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: bold;
  transition: var(--transition-standard);
}

.cta-button:hover {
  background: var(--accent-secondary);
}

.services {
  padding: 3rem 2rem;
  background: var(--bg-primary);
}

.services h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.service-card {
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  text-align: center;
  transition: var(--transition-standard);
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--card-hover-shadow);
  background: var(--bg-elevated);
}

.service-card h3 {
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.service-card p {
  color: var(--text-secondary);
}

.business-clients {
  text-align: center;
  padding: 3rem 2rem;
  background: var(--bg-primary);
}

.business-clients h2 {
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.business-clients p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

/* Улучшенная кнопка для юридических лиц */
.business-button {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 2px solid var(--accent-primary);
  padding: 0.9rem 1.8rem;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 500;
  transition: var(--transition-standard);
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  box-shadow: var(--card-shadow);
}

.business-button:hover {
  background: var(--accent-primary);
  color: white;
  transform: translateY(-3px);
  box-shadow: var(--card-hover-shadow);
}

.button-icon {
  font-size: 1.2rem;
}

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

/* Улучшенное модальное окно */
.modal-content {
  background: var(--bg-secondary);
  padding: 2.5rem 2rem 2rem;
  border-radius: 12px;
  position: relative;
  width: 94%;
  max-width: 550px;
  margin: 1rem;
  box-shadow: var(--card-shadow);
}

.business-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-title {
  color: var(--accent-primary);
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
  width: 100%;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-standard);
}

.close-button:hover {
  color: var(--text-primary);
  transform: scale(1.1);
}

.contact-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.8rem;
  width: 100%;
}

.phone-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.phone-label {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}

.phone-numbers {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  width: 100%;
}

.phone-part {
  font-size: 1.6rem;
  font-weight: bold;
  color: var(--text-secondary);
}

.phone-part.accent {
  color: var(--accent-primary);
}

.business-info {
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  padding: 1.5rem 0;
  width: 100%;
  margin: 0 auto;
}

.business-text {
  color: var(--text-secondary);
  font-size: 1.05rem;
  text-align: center;
  line-height: 1.6;
  margin: 0;
  width: 100%;
  word-wrap: break-word;
  hyphens: auto;
  padding: 0 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.call-button, .email-button {
  flex: 1;
  min-width: 140px;
  background: var(--accent-primary);
  color: white;
  text-decoration: none;
  padding: 0.8rem 1rem;
  border-radius: 50px;
  font-weight: 500;
  font-size: 1rem;
  transition: var(--transition-standard);
  text-align: center;
  white-space: nowrap;
}

.email-button {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.call-button:hover {
  background: var(--accent-secondary);
  transform: translateY(-2px);
}

.email-button:hover {
  background: var(--accent-primary);
  color: white;
  transform: translateY(-2px);
}

@media (max-width: 480px) {
  .modal-content {
    padding: 2.5rem 1.5rem 1.5rem;
    width: 95%;
  }

  .phone-numbers {
    gap: 4px;
  }

  .phone-part {
    font-size: 1.4rem;
  }

  .business-text {
    font-size: 0.95rem;
    padding: 0 0.5rem;
  }

  .action-buttons {
    flex-direction: column;
    width: 95%;
  }

  .call-button, .email-button {
    width: 100%;
  }
}

.loader {
  width: 50px;
  height: 50px;
  border: 5px solid var(--bg-secondary);
  border-top: 5px solid var(--accent-primary);
  border-radius: 50%;
  margin: 20px auto;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
