<template>
  <div class="about">
    <!-- Hero Section -->
    <div id="about" class="about-header">
      <h1>О нас</h1>
      <img src="https://via.placeholder.com/800x400" alt="Профессиональные грузчики в Минске" />
    </div>

    <!-- About Company -->
    <section id="services" class="company-info">
      <h2>О компании</h2>
      <p>
        Мы — команда профессиональных грузчиков в Минске с многолетним опытом работы.
        Предоставляем услуги по перевозке, погрузке и разгрузке грузов любой сложности.
        Наша цель — сделать ваш переезд или транспортировку максимально быстрой, безопасной и комфортной.
      </p>
      <p>
        <strong>Почему выбирают нас:</strong><br>
        ✔ Профессиональные грузчики с опытом от 5 лет<br>
        ✔ Гарантия сохранности вашего имущества<br>
        ✔ Быстрая и аккуратная работа<br>
        ✔ Доступные цены без скрытых комиссий<br>
        ✔ Работаем 24/7 — всегда готовы помочь!
      </p>
      <p>
        Мы специализируемся на: квартирных переездах, офисных переездах, доставке мебели,
        грузоперевозках по Минску и всей Беларуси. Обращайтесь к нам, если вам нужны надежные грузчики!
      </p>
    </section>

    <!-- Our Team -->
    <section id="transport" class="team">
      <h2>Наша команда</h2>
      <div class="team-grid">
        <div class="team-member">
          <img src="https://via.placeholder.com/200x200" alt="Иван Петров - Руководитель отдела логистики" />
          <h3>Иван Петров</h3>
          <p>Руководитель отдела логистики</p>
        </div>
        <div class="team-member">
          <img src="https://via.placeholder.com/200x200" alt="Мария Сидорова - Менеджер по работе с клиентами" />
          <h3>Мария Сидорова</h3>
          <p>Менеджер по работе с клиентами</p>
        </div>
        <div class="team-member">
          <img src="https://via.placeholder.com/200x200" alt="Алексей Кузнецов - Мастер-профессионал" />
          <h3>Алексей Кузнецов</h3>
          <p>Мастер-профессионал</p>
        </div>
      </div>
    </section>

    <!-- Reviews -->
    <section id="combos" class="reviews">
      <h2>Отзывы клиентов</h2>
      <div class="reviews-grid">
        <ReviewCard v-for="review in reviews" :key="review.id" :review="review" />
      </div>
    </section>

    <!-- Contacts -->
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
import ReviewCard from '@/components/ReviewCard.vue';

export default {
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
          text: 'Отличный сервис! Грузчики пришли вовремя, были вежливы и аккуратны. Всё перевезли быстро и без повреждений!',
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
    };
  },
};
</script>

<style scoped>
.about {
  padding: 2rem;
  background: var(--bg-primary);
  min-height: 100vh;
  color: var(--text-primary);
}
.hero-section {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--navbar-bg);
  margin-bottom: 3rem;
}
.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}
.hero-section p {
  font-size: 1.2rem;
  color: var(--text-secondary);
  max-width: 800px;
  margin: 0 auto;
}
.content-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin-bottom: 2rem;
}
.content-section h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: var(--text-primary);
}
.content-section p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
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
.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 3rem auto;
}
.contact-item {
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  transition: var(--transition-standard);
}
.contact-item:hover {
  transform: translateY(-5px);
  background: var(--bg-elevated);
  box-shadow: var(--card-hover-shadow);
}
.contact-item i {
  font-size: 2rem;
  color: var(--accent-primary);
  margin-right: 1rem;
}
.contact-item p {
  color: var(--text-secondary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }
  .hero-section p {
    font-size: 1rem;
  }
  .content-section {
    padding: 2rem;
  }
}
</style>
