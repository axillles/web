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
      <button class="btn-primary" @click="showContactModal = true">Узнать больше</button>
    </section>

    <!-- Модальное окно с контактной информацией -->
    <div v-if="showContactModal" class="modal">
      <div class="modal-content">
        <button class="close-button" @click="showContactModal = false">×</button>
        <div class="contact-info">
          <div class="phone-numbers">
            <div class="phone-part">+375</div>
            <div class="phone-part">33</div>
            <div class="phone-part">605-</div>
            <div class="phone-part">29-</div>
            <div class="phone-part">84</div>
          </div>
          <p class="business-text">
            Для юридических лиц цены обсуждаются индивидуально по телефону
          </p>
          <a :href="'tel:+375336052984'" class="call-button">Позвонить</a>
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
  background: #121212;
  color: #ffffff;
}

.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: #000000;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ffffff;
}

.subtitle {
  font-size: 1.2rem;
  color: #b3b3b3;
  margin-bottom: 2rem;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2rem;
  background: #1db954;
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.cta-button:hover {
  background: #1ed760;
}

.services {
  padding: 3rem 2rem;
  background: #181818;
}

.services h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #ffffff;
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
  background: #282828;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  text-align: center;
  transition: transform 0.3s ease;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  background: #404040;
}

.service-card h3 {
  color: #ffffff;
  margin-bottom: 1rem;
}

.service-card p {
  color: #b3b3b3;
}

.business-clients {
  text-align: center;
  padding: 3rem 2rem;
  background: #181818;
}

.business-clients h2 {
  margin-bottom: 1rem;
  color: #ffffff;
}

.business-clients p {
  color: #b3b3b3;
  margin-bottom: 2rem;
}

.btn-primary {
  background: #1db954;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background 0.3s ease;
}

.btn-primary:hover {
  background: #1ed760;
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

.modal-content {
  background: #282828;
  padding: 3rem 2rem 2rem;
  border-radius: 12px;
  position: relative;
  width: 90%;
  max-width: 400px;
  margin: 1rem;
  display: flex;
  justify-content: center;
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
  color: #b3b3b3;
  padding: 0.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-button:hover {
  color: #ffffff;
  transform: scale(1.1);
}

.contact-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  width: 100%;
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
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: bold;
  color: #1db954;
}

.phone-part:first-child {
  color: #b3b3b3;
}

.business-text {
  color: #b3b3b3;
  font-size: clamp(1rem, 3vw, 1.2rem);
  text-align: center;
  line-height: 1.5;
  margin: 0;
  width: 100%;
  max-width: 300px;
}

.call-button {
  background: #1db954;
  color: white;
  text-decoration: none;
  padding: 1rem 3rem;
  border-radius: 50px;
  font-weight: bold;
  font-size: clamp(1rem, 3vw, 1.2rem);
  transition: all 0.3s ease;
  width: 100%;
  max-width: 200px;
  text-align: center;
}

.call-button:hover {
  background: #1ed760;
  transform: scale(1.05);
}

@media (max-width: 480px) {
  .modal-content {
    padding: 3rem 1rem 1.5rem;
  }

  .phone-numbers {
    gap: 4px;
  }
}

.loader {
  width: 50px;
  height: 50px;
  border: 5px solid #282828;
  border-top: 5px solid #1db954;
  border-radius: 50%;
  margin: 20px auto;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
