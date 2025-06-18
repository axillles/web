<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>О компании</h3>
        <ul>
          <li>
            <router-link to="/about" @click="scrollToSection($event, '#about')">О нас</router-link>
          </li>
          <li>
            <router-link to="/about" @click="scrollToSection($event, '#contacts')"
              >Контакты</router-link
            >
          </li>
          <li><a href="#" @click.prevent="showVacancyModal = true">Вакансии</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h3>Услуги</h3>
        <ul>
          <li><router-link to="/catalog?category=loaders">Грузчики</router-link></li>
          <li><router-link to="/catalog?category=transport">Транспорт</router-link></li>
          <li><router-link to="/catalog?category=combos">Комплексные решения</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h3>Контакты</h3>
        <ul>
          <li>
            <strong>Телефон : </strong>
            <a href="tel:+37533333333">+375-29-123-45-67</a>
          </li>
          <li>
            <strong>Email : </strong>
            <a href="mailto:nklsupabaseadm@gmail.com">nklsupabaseadm@gmail.com</a>
          </li>
          <li>
            <strong>Адрес : </strong>
            г. Минск, ул. Подводная, д. 123
          </li>
        </ul>
      </div>

      <div class="footer-section">
        <h3>Мы в соцсетях</h3>
        <div class="social-links">
          <a
            href="https://vk.com/audios362927201?section=all&z=audio_playlist200656193_83"
            class="social-link"
            target="_blank"
            >VK</a
          >
          <a href="https://t.me/axillles1" class="social-link" target="_blank">Telegram</a>
          <a
            href="https://denttime.ru/upload/delight.webpconverter/upload/iblock/0ee/un3l3isi1zxzd7fw1p9zrhqjx5x0q0ub.jpeg.webp?169392449076218"
            class="social-link"
            target="_blank"
            >WhatsApp</a
          >
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ currentYear }} NKL. Все права защищены.</p>
    </div>

    <!-- Модальное окно для вакансий -->
    <div v-if="showVacancyModal" class="modal">
      <div class="modal-content">
        <button class="close-button" @click="showVacancyModal = false">&times;</button>
        <h2>Вакансии</h2>
        <div class="vacancy-info">
          <p>Для получения информации о вакансиях звоните:</p>
          <a href="tel:+375336052984" class="phone-number">+375 33 605-29-84</a>
          <button class="close-modal" @click="showVacancyModal = false">Закрыть</button>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  data() {
    return {
      showVacancyModal: false,
    }
  },
  methods: {
    scrollToSection(event, hash) {
      // Если мы уже на странице About, делаем плавную прокрутку
      if (this.$route.name === 'About') {
        event.preventDefault()
        const element = document.querySelector(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }
    },
  },
  computed: {
    currentYear() {
      return new Date().getFullYear()
    },
  },
}
</script>

<style scoped>
.footer {
  background: var(--navbar-bg);
  padding: 2rem;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.footer-links {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a {
  text-decoration: none;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: var(--accent-primary);
}

.footer-section a {
  text-decoration: none;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.footer-section a:hover {
  color: var(--accent-primary);
}

.social-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.social-link {
  min-width: 120px;
  height: 40px;
  background: var(--bg-secondary);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 0 1rem;
}

.social-link:hover {
  background: var(--accent-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(29, 185, 84, 0.3);
}

.contact-info {
  color: var(--text-secondary);
  line-height: 1.6;
}

.contact-info a {
  color: var(--accent-primary);
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-info a:hover {
  color: var(--accent-secondary);
  text-decoration: none;
}

.footer-bottom {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--bg-secondary);
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
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
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 8px;
  position: relative;
  width: 90%;
  max-width: 400px;
  text-align: center;
  color: var(--text-primary);
  box-shadow: var(--card-shadow);
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

.vacancy-info {
  margin-top: 1.5rem;
  color: var(--text-secondary);
}

.phone-number {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--accent-primary);
  text-decoration: none;
  margin: 1rem 0;
  transition: color 0.3s ease;
}

.phone-number:hover {
  color: var(--accent-secondary);
  text-decoration: none;
}

.close-modal {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 1rem;
  transition: background 0.3s ease;
}

.close-modal:hover {
  background: var(--bg-secondary);
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .footer-section h3 {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
  }

  .social-link {
    min-width: 100px;
    height: 36px;
    font-size: 0.9rem;
  }

  .footer {
    padding: 1.5rem 1rem;
  }
}

@media (max-width: 480px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    text-align: center;
  }

  .footer-section h3 {
    font-size: 1rem;
  }

  .social-links {
    justify-content: center;
  }

  .footer {
    padding: 1rem;
  }

  .footer-bottom {
    margin-top: 1.5rem;
    font-size: 0.8rem;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .phone-number {
    font-size: 1.2rem;
  }
}
</style>
