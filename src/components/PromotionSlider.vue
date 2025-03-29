<template>
  <div class="slider">
    <div v-if="loading" class="slider-loader">
      <div class="loader"></div>
      <p>Загрузка акций...</p>
    </div>

    <div v-else-if="!promotions.length" class="no-promotions">
      <p>Акции отсутствуют</p>
    </div>

    <template v-else>
      <div class="slider-container" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
        <div v-for="promotion in promotions" :key="promotion.id" class="slide">
          <div class="promotion-card">
            <div class="promotion-image">
              <img :src="promotion.image" :alt="promotion.title" />
              <div class="promotion-badge" v-if="promotion.price && promotion.old_price">
                {{ calculateDiscount(promotion.old_price, promotion.price) }}% скидка
              </div>
            </div>
            <div class="promotion-content">
              <h3>{{ promotion.title }}</h3>
              <p>{{ promotion.description }}</p>
              <div class="promotion-price" v-if="promotion.price !== null">
                <span v-if="promotion.old_price" class="old-price">{{ formatPrice(promotion.old_price) }}</span>
                <span class="new-price">{{ formatPrice(promotion.price) }}</span>
              </div>
              <router-link :to="promotion.link" class="btn-details">Подробнее</router-link>
            </div>
          </div>
        </div>
      </div>

      <button
        class="slider-btn prev"
        @click="prevSlide"
        :disabled="currentSlide === 0 || promotions.length <= 1"
        v-if="promotions.length > 1"
      >
        <i class="material-icons">chevron_left</i>
      </button>

      <button
        class="slider-btn next"
        @click="nextSlide"
        :disabled="promotions.length <= 1"
        v-if="promotions.length > 1"
      >
        <i class="material-icons">chevron_right</i>
      </button>

      <div class="slider-dots" v-if="promotions.length > 1">
        <button
          v-for="(_, index) in promotions"
          :key="index"
          class="dot"
          :class="{ active: currentSlide === index }"
          @click="goToSlide(index)"
          :aria-label="`Перейти к слайду ${index + 1}`"
        ></button>
      </div>

      <div class="slider-indicators">
        <span>{{ currentSlide + 1 }} / {{ promotions.length }}</span>
      </div>
    </template>
  </div>
</template>

<script>
import { supabase } from '@/config/supabase'

export default {
  name: 'PromotionSlider',
  data() {
    return {
      currentSlide: 0,
      timer: null,
      promotions: [],
      loading: true,
      error: null
    }
  },
  methods: {
    prevSlide() {
      if (this.promotions.length <= 1) return;
      this.currentSlide =
        this.currentSlide === 0 ? this.promotions.length - 1 : this.currentSlide - 1
      this.resetTimer()
    },

    nextSlide() {
      if (this.promotions.length <= 1) return;
      this.currentSlide = (this.currentSlide + 1) % this.promotions.length
      this.resetTimer()
    },

    resetTimer() {
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.startAutoSlide()
    },

    startAutoSlide() {
      if (this.promotions.length > 1) {
        this.timer = setInterval(this.nextSlide, 5000)
      }
    },

    goToSlide(index) {
      this.currentSlide = index
      this.resetTimer()
    },

    formatPrice(price) {
      if (price === null || price === undefined) return '';
      return `${Number(price).toLocaleString('ru-RU')} руб`
    },

    calculateDiscount(oldPrice, newPrice) {
      if (!oldPrice || !newPrice || oldPrice <= newPrice) return 0;
      const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
      return discount;
    },

    async fetchPromotions() {
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await supabase
          .from('promotions')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error;

        this.promotions = data || [];

        // Если есть хотя бы одна акция, начинаем автоматическое переключение
        if (this.promotions.length > 1) {
          this.startAutoSlide();
        }
      } catch (error) {
        console.error('Ошибка при загрузке акций:', error);
        this.error = error.message;

        // Показываем уведомление об ошибке, если доступно
        if (this.$root.$refs.toast) {
          this.$root.$refs.toast.showToast('Ошибка при загрузке акций', 'error');
        }
      } finally {
        this.loading = false;
      }
    },

    // Обработчик свайпа для мобильных устройств
    handleTouchStart(event) {
      this.touchStartX = event.touches[0].clientX;
    },

    handleTouchEnd(event) {
      const touchEndX = event.changedTouches[0].clientX;
      const diffX = this.touchStartX - touchEndX;

      // Если свайп достаточно длинный, переключаем слайд
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      }
    }
  },

  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }

    // Удаляем обработчики свайпа
    if (this.$el) {
      this.$el.removeEventListener('touchstart', this.handleTouchStart);
      this.$el.removeEventListener('touchend', this.handleTouchEnd);
    }
  },

  mounted() {
    // Добавляем обработчики свайпа для мобильных устройств
    this.$el.addEventListener('touchstart', this.handleTouchStart);
    this.$el.addEventListener('touchend', this.handleTouchEnd);
  },

  async created() {
    await this.fetchPromotions();
  }
}
</script>

<style scoped>
.slider {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 8px;
  margin: 2rem 0;
  background: var(--bg-secondary);
  box-shadow: var(--card-shadow);
}

.slider-loader, .no-promotions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
}

.loader {
  width: 50px;
  height: 50px;
  border: 5px solid var(--bg-elevated);
  border-top: 5px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.slider-container {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
}

.slide {
  min-width: 100%;
  height: 100%;
}

.promotion-card {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
}

.promotion-image {
  position: relative;
  width: 50%;
  height: 100%;
}

.promotion-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.promotion-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--error-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.promotion-content {
  padding: 2rem;
  width: 50%;
  display: flex;
  flex-direction: column;
}

.promotion-content h3 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.promotion-content p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.6;
  flex-grow: 1;
}

.promotion-price {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.old-price {
  text-decoration: line-through;
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.new-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--accent-primary);
}

.btn-details {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: var(--accent-primary);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: var(--transition-standard);
  align-self: flex-start;
}

.btn-details:hover {
  background: var(--accent-secondary);
  transform: translateY(-2px);
}

.slider-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-standard);
  z-index: 10;
}

.slider-btn:hover {
  background: var(--accent-primary);
}

.slider-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.3);
}

.slider-btn.prev {
  left: 1rem;
}

.slider-btn.next {
  right: 1rem;
}

.slider-dots {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 5;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: var(--transition-standard);
}

.dot.active {
  background: var(--accent-primary);
  transform: scale(1.2);
}

.slider-indicators {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

/* Адаптивные стили */
@media (max-width: 768px) {
  .slider {
    height: auto;
    min-height: 500px;
  }

  .promotion-card {
    flex-direction: column;
  }

  .promotion-image,
  .promotion-content {
    width: 100%;
  }

  .promotion-image {
    height: 200px;
  }

  .promotion-content {
    padding: 1.5rem;
    height: auto;
  }

  .promotion-content h3 {
    font-size: 1.5rem;
  }

  .slider-btn {
    width: 36px;
    height: 36px;
  }

  .slider-btn.prev {
    left: 0.5rem;
  }

  .slider-btn.next {
    right: 0.5rem;
  }
}

@media (max-width: 480px) {
  .slider {
    min-height: 450px;
    margin: 1rem 0;
  }

  .promotion-image {
    height: 180px;
  }

  .promotion-content {
    padding: 1rem;
  }

  .promotion-content h3 {
    font-size: 1.3rem;
    margin-bottom: 0.75rem;
  }

  .promotion-content p {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .promotion-price {
    margin-bottom: 1rem;
  }

  .old-price {
    font-size: 0.9rem;
  }

  .new-price {
    font-size: 1.2rem;
  }

  .btn-details {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
}
</style>
