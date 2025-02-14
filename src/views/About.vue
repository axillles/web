<template>
  <div class="about">
    <div id="about" class="about-header">
      <h1>О нас</h1>
      <img src="https://via.placeholder.com/800x400" alt="Наша команда" />
    </div>

    <section id="services" class="company-info">
      <h2>О компании</h2>
      <p>
        Мы - команда профессиональных грузчиков с многолетним опытом работы. Наша цель -
        предоставить качественные услуги по перевозке и погрузке грузов любой сложности.
      </p>
    </section>

    <section id="transport" class="team">
      <h2>Наша команда</h2>
      <div class="team-grid">
        <div class="team-member">
          <img src="https://via.placeholder.com/200x200" alt="Фото сотрудника" />
          <h3>Иван Петров</h3>
          <p>Руководитель отдела логистики</p>
        </div>
        <!-- Другие члены команды будут добавлены позже -->
      </div>
    </section>

    <section id="combos" class="reviews">
      <h2>Отзывы клиентов</h2>
      <div class="reviews-grid">
        <ReviewCard v-for="review in reviews" :key="review.id" :review="review" />
      </div>
    </section>

    <section id="contacts" class="contact-section">
      <h2>Контакты</h2>
      <div class="contact-info">
        <div class="contact-item">
          <i class="fas fa-phone"></i>
          <p>+375 33 605-29-84</p>
        </div>
        <div class="contact-item">
          <i class="fas fa-envelope"></i>
          <p>nklsupabaseadm@gmail.com</p>
        </div>
        <div class="contact-item">
          <i class="fas fa-map-marker-alt"></i>
          <p>г. Минск, ул. Примерная, 123</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ReviewCard from '@/components/ReviewCard.vue'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'About',
  components: {
    ReviewCard,
  },
  data() {
    return {
      reviews: [
        {
          id: 1,
          name: 'Аня Титова',
          rating: 5,
          text: 'Отличный сервис! Грузчики пришли вовремя, были вежливы и аккуратны. Всё перевезли быстро и без повреждений!)',
          date: '2025-02-15',
          avatar: 'https://via.placeholder.com/50x50?text=АИ',
        },
        {
          id: 2,
          name: 'Петр Сидоров',
          rating: 5,
          text: 'Хороший сервис, разумные цены. Единственное - хотелось бы более точного определения времени приезда.',
          date: '2025-02-10',
          avatar: 'https://via.placeholder.com/50x50?text=ПС',
        },
      ],
    }
  },
}
</script>

<style scoped>
.about {
  padding: 2rem;
  background: #121212;
  min-height: 100vh;
  color: #ffffff;
}

.hero-section {
  text-align: center;
  padding: 4rem 2rem;
  background: #000000;
  margin-bottom: 3rem;
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #ffffff;
}

.hero-section p {
  font-size: 1.2rem;
  color: #b3b3b3;
  max-width: 800px;
  margin: 0 auto;
}

.content-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
  background: #181818;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.content-section h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #ffffff;
}

.content-section p {
  color: #b3b3b3;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.value-card {
  padding: 2rem;
  background: #282828;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  text-align: center;
  transition: all 0.3s ease;
}

.value-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  background: #404040;
}

.value-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #1db954;
}

.value-card p {
  color: #b3b3b3;
}

.contacts-section {
  text-align: center;
  padding: 3rem 2rem;
  background: #181818;
  border-radius: 8px;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 3rem auto;
}

.contact-item {
  padding: 2rem;
  background: #282828;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.contact-item:hover {
  transform: translateY(-5px);
  background: #404040;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.contact-item h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #1db954;
}

.contact-item p,
.contact-item a {
  color: #b3b3b3;
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-item a:hover {
  color: #1db954;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.team-member {
  text-align: center;
}

.team-member img {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}
</style>
