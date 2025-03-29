<template>
  <div class="not-found">
    <!-- Анимированный фон с элементами -->
    <div class="animated-bg">
      <div v-for="n in 10" :key="n" class="bg-element" :style="`--delay: ${n * 0.2}s`"></div>
    </div>

    <div class="not-found-content">
      <div class="error-container">
        <div class="error-code" data-text="404">404</div>
        <div class="glitch-line"></div>
      </div>

      <h1>Страница не найдена</h1>
      <p>Извините, страница, которую вы ищете, не существует или была перемещена.</p>

      <div class="suggestions">
        <h3>Возможно, вы хотели посетить:</h3>
        <div class="suggestion-links">
          <router-link to="/" class="suggestion-link">
            <span class="icon">🏠</span>
            <span>Главная страница</span>
          </router-link>
          <router-link to="/catalog" class="suggestion-link">
            <span class="icon">🛒</span>
            <span>Каталог услуг</span>
          </router-link>
          <router-link to="/calculator" class="suggestion-link">
            <span class="icon">🧮</span>
            <span>Калькулятор</span>
          </router-link>
          <router-link to="/about" class="suggestion-link">
            <span class="icon">ℹ️</span>
            <span>О нас</span>
          </router-link>
        </div>
      </div>

      <div class="back-section">
        <button @click="goBack" class="back-button">
          <span class="icon">⬅️</span>
          <span>Вернуться назад</span>
        </button>
      </div>

      <div class="help-section">
        <p>Нужна помощь? Свяжитесь с нами:</p>
        <div class="contact-info">
          <a href="tel:+375336052984" class="contact-item">
            <span class="icon">📞</span>
            <span>+375 33 605-29-84</span>
          </a>
          <a href="mailto:nklsupabaseadm@gmail.com" class="contact-item">
            <span class="icon">✉️</span>
            <span>nklsupabaseadm@gmail.com</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  methods: {
    goBack() {
      this.$router.go(-1);
    }
  }
}
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: var(--text-primary);
  position: relative;
  overflow: hidden;
}

/* Анимированный фон */
.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.bg-element {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--accent-primary);
  opacity: 0.05;
  animation: float 15s ease-in-out infinite;
  animation-delay: var(--delay);
}

.bg-element:nth-child(odd) {
  background: var(--accent-secondary);
}

.bg-element:nth-child(1) { top: 10%; left: 10%; width: 120px; height: 120px; }
.bg-element:nth-child(2) { top: 40%; left: 25%; width: 70px; height: 70px; }
.bg-element:nth-child(3) { top: 80%; left: 15%; width: 90px; height: 90px; }
.bg-element:nth-child(4) { top: 20%; left: 75%; width: 110px; height: 110px; }
.bg-element:nth-child(5) { top: 60%; left: 80%; width: 60px; height: 60px; }
.bg-element:nth-child(6) { top: 90%; left: 60%; width: 100px; height: 100px; }
.bg-element:nth-child(7) { top: 50%; left: 50%; width: 130px; height: 130px; }
.bg-element:nth-child(8) { top: 30%; left: 60%; width: 80px; height: 80px; }
.bg-element:nth-child(9) { top: 70%; left: 30%; width: 70px; height: 70px; }
.bg-element:nth-child(10) { top: 10%; left: 90%; width: 100px; height: 100px; }

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-20px) translateX(10px);
  }
  50% {
    transform: translateY(10px) translateX(-15px);
  }
  75% {
    transform: translateY(15px) translateX(5px);
  }
}

.not-found-content {
  max-width: 800px;
  background: var(--bg-secondary);
  padding: 3rem;
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  text-align: center;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Контейнер для эффекта glitch */
.error-container {
  position: relative;
  margin-bottom: 2rem;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  line-height: 1;
  color: var(--accent-primary);
  position: relative;
  animation: glitch 2s infinite;
  text-shadow: 3px 3px 0 var(--accent-secondary);
}

.error-code::before,
.error-code::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.error-code::before {
  left: 2px;
  text-shadow: -2px 0 var(--accent-primary);
  clip: rect(24px, 550px, 90px, 0);
  animation: glitch-anim 3s infinite linear alternate-reverse;
}

.error-code::after {
  left: -2px;
  text-shadow: -2px 0 var(--accent-secondary);
  clip: rect(85px, 550px, 140px, 0);
  animation: glitch-anim2 2.5s infinite linear alternate-reverse;
}

.glitch-line {
  position: absolute;
  top: 50%;
  width: 100%;
  height: 1px;
  background: var(--accent-primary);
  opacity: 0.3;
  animation: glitch-line 2s infinite;
}

@keyframes glitch {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  7% {
    transform: scale(1.05) skew(0.5deg, 0.5deg);
    opacity: 0.9;
  }
  10% {
    transform: scale(1) skew(-0.5deg, -0.5deg);
    opacity: 1;
  }
  12%, 20% {
    transform: scale(1);
    opacity: 1;
  }
  35% {
    transform: scale(1.05) skew(0.5deg, 0.5deg);
    opacity: 0.9;
  }
  40%, 100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes glitch-anim {
  0% {
    clip: rect(78px, 9999px, 72px, 0);
  }
  10% {
    clip: rect(50px, 9999px, 102px, 0);
  }
  20% {
    clip: rect(12px, 9999px, 30px, 0);
  }
  30% {
    clip: rect(95px, 9999px, 39px, 0);
  }
  40% {
    clip: rect(9px, 9999px, 24px, 0);
  }
  50% {
    clip: rect(50px, 9999px, 87px, 0);
  }
  60% {
    clip: rect(13px, 9999px, 76px, 0);
  }
  70% {
    clip: rect(59px, 9999px, 97px, 0);
  }
  80% {
    clip: rect(81px, 9999px, 37px, 0);
  }
  90% {
    clip: rect(16px, 9999px, 85px, 0);
  }
  100% {
    clip: rect(91px, 9999px, 42px, 0);
  }
}

@keyframes glitch-anim2 {
  0% {
    clip: rect(16px, 9999px, 91px, 0);
  }
  10% {
    clip: rect(37px, 9999px, 31px, 0);
  }
  20% {
    clip: rect(89px, 9999px, 15px, 0);
  }
  30% {
    clip: rect(42px, 9999px, 88px, 0);
  }
  40% {
    clip: rect(14px, 9999px, 59px, 0);
  }
  50% {
    clip: rect(23px, 9999px, 82px, 0);
  }
  60% {
    clip: rect(81px, 9999px, 32px, 0);
  }
  70% {
    clip: rect(35px, 9999px, 56px, 0);
  }
  80% {
    clip: rect(63px, 9999px, 92px, 0);
  }
  90% {
    clip: rect(31px, 9999px, 70px, 0);
  }
  100% {
    clip: rect(52px, 9999px, 20px, 0);
  }
}

@keyframes glitch-line {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: var(--accent-primary);
  animation: slideDown 0.6s ease-out 0.2s both;
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  animation: slideDown 0.6s ease-out 0.3s both;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestions {
  margin: 2rem 0;
  animation: slideDown 0.6s ease-out 0.4s both;
}

.suggestions h3 {
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.suggestion-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.suggestion-link, .contact-item, .back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-primary);
  background: var(--bg-elevated);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.suggestion-link::before,
.contact-item::before,
.back-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: var(--accent-primary);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: all 0.5s ease;
  z-index: -1;
}

.suggestion-link:hover::before,
.contact-item:hover::before,
.back-button:hover::before {
  width: 300px;
  height: 300px;
  opacity: 1;
}

.suggestion-link:hover, .contact-item:hover, .back-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  color: white;
}

.icon {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.suggestion-link:hover .icon,
.contact-item:hover .icon,
.back-button:hover .icon {
  transform: scale(1.2);
}

.back-section {
  margin: 2rem 0;
  animation: slideDown 0.6s ease-out 0.5s both;
}

.back-button {
  margin: 0 auto;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  width: auto;
  display: inline-flex;
}

.help-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
  animation: slideDown 0.6s ease-out 0.6s both;
}

.help-section p {
  margin-bottom: 1rem;
}

.contact-info {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.contact-item {
  flex: 1;
  min-width: 220px;
}

@media (max-width: 768px) {
  .not-found-content {
    padding: 2rem;
  }

  .error-code {
    font-size: 6rem;
  }

  h1 {
    font-size: 2rem;
  }

  .contact-info {
    flex-direction: column;
  }

  .error-container {
    height: 100px;
  }
}
</style>
