<template>
  <div class="slider">
    <div class="slider-container" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
      <div v-for="promotion in promotions" :key="promotion.id" class="slide">
        <div class="promotion-card">
          <img :src="promotion.image" :alt="promotion.title" />
          <div class="promotion-content">
            <h3>{{ promotion.title }}</h3>
            <p>{{ promotion.description }}</p>
            <div class="promotion-price" v-if="promotion.price">
              <span class="old-price">{{ promotion.oldPrice }} ₽</span>
              <span class="new-price">{{ promotion.price }} ₽</span>
            </div>
            <router-link :to="promotion.link" class="btn-details">Подробнее</router-link>
          </div>
        </div>
      </div>
    </div>

    <button class="slider-btn prev" @click="prevSlide" :disabled="currentSlide === 0">&lt;</button>
    <button class="slider-btn next" @click="nextSlide">&gt;</button>

    <div class="slider-dots">
      <button
        v-for="(_, index) in promotions"
        :key="index"
        class="dot"
        :class="{ active: currentSlide === index }"
        @click="goToSlide(index)"
      ></button>
    </div>
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
    }
  },
  methods: {
    prevSlide() {
      this.currentSlide =
        this.currentSlide === 0 ? this.promotions.length - 1 : this.currentSlide - 1
      this.resetTimer()
    },
    nextSlide() {
      this.currentSlide = (this.currentSlide + 1) % this.promotions.length
      this.resetTimer()
    },
    resetTimer() {
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.timer = setInterval(this.nextSlide, 5000)
    },
    goToSlide(index) {
      this.currentSlide = index
    },
    async fetchPromotions() {
      try {
        const { data, error } = await supabase.from('promotions').select('*')
        if (error) throw error
        this.promotions = data
      } catch (error) {
        console.error('Ошибка при загрузке акций:', error)
      }
    },
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  mounted() {
    // Автоматическое переключение слайдов
    this.timer = setInterval(this.nextSlide, 5000)
  },
  async created() {
    try {
      const { data, error } = await supabase.from('promotions').select('*')
      if (error) throw error
      this.promotions = data
    } catch (error) {
      console.error('Ошибка при загрузке акций:', error)
    }
  },
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
}

.slider-container {
  display: flex;
  transition: transform 0.5s ease;
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
  background: #f8f9fa;
}

.promotion-card img {
  width: 50%;
  height: 100%;
  object-fit: cover;
}

.promotion-content {
  padding: 2rem;
  width: 50%;
}

.promotion-content h3 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.promotion-content p {
  color: #666;
  margin-bottom: 1.5rem;
}

.promotion-price {
  margin-bottom: 1.5rem;
}

.old-price {
  text-decoration: line-through;
  color: #999;
  margin-right: 1rem;
}

.new-price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #28a745;
}

.btn-details {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.btn-details:hover {
  background: #0056b3;
}

.slider-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background 0.3s ease;
}

.slider-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
}

.dot.active {
  background: white;
}

@media (max-width: 768px) {
  .promotion-card {
    flex-direction: column;
  }

  .promotion-card img,
  .promotion-content {
    width: 100%;
  }

  .promotion-content {
    padding: 1rem;
  }
}
</style>
