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
      <PromotionSlider />
    </section>

    <section class="business-clients">
      <h2>Для юридических лиц</h2>
      <p>Особые условия для компаний и постоянных клиентов</p>
      <button class="btn-primary" @click="showContactModal = true">Узнать больше</button>
    </section>

    <!-- Модальное окно с контактной информацией -->
    <div v-if="showContactModal" class="modal">
      <div class="modal-content">
        <button class="close-button" @click="showContactModal = false">&times;</button>
        <h2>Контактная информация</h2>
        <div class="contact-info">
          <p class="phone">+375 33 605-29-84</p>
          <p class="business-info">
            Для юридических лиц цены обсуждаются индивидуально по телефону
          </p>
          <div class="contact-actions">
            <a :href="'tel:+375336052984'" class="call-button">Позвонить</a>
            <button class="close-modal" @click="showContactModal = false">Закрыть</button>
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
    }
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
  padding: 2rem;
  border-radius: 8px;
  position: relative;
  width: 90%;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #b3b3b3;
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #ffffff;
}

.modal-content h2 {
  color: #ffffff;
  margin-bottom: 1.5rem;
}

.contact-info {
  margin-top: 1.5rem;
}

.phone {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1db954;
  margin-bottom: 1rem;
}

.business-info {
  color: #b3b3b3;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.contact-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.call-button {
  background: #1db954;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: bold;
  transition: background 0.3s ease;
}

.call-button:hover {
  background: #1ed760;
}

.close-modal {
  background: #404040;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s ease;
}

.close-modal:hover {
  background: #282828;
}
</style>
