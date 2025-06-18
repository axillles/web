<template>
  <span class="animated-price" :class="{ decrease: isDecrease && isAnimating, increase: !isDecrease && isAnimating }">
    {{ formattedValue }}
  </span>
</template>

<script>
export default {
  name: 'AnimatedPrice',
  props: {
    value: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      displayValue: 0,
      isDecrease: false,
      isAnimating: false
    }
  },
  computed: {
    formattedValue() {
      return Math.round(this.displayValue).toLocaleString('ru-RU')
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(newValue, oldValue) {
        if (oldValue !== undefined) {
          this.isDecrease = newValue < oldValue
          this.isAnimating = true
          setTimeout(() => {
            this.isAnimating = false
          }, 500) // Длительность анимации
        }
        this.animateValue(oldValue || 0, newValue)
      }
    }
  },
  methods: {
    animateValue(start, end) {
      const duration = 500 // длительность анимации в мс
      const startTime = performance.now()

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Функция плавности (ease-out)
        const easeOut = (t) => 1 - Math.pow(1 - t, 3)

        this.displayValue = start + (end - start) * easeOut(progress)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }
  }
}
</script>

<style scoped>
.animated-price {
  display: inline-block;
  position: relative;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.animated-price::after {
  content: ' руб';
  margin-left: 4px;
}

.animated-price.decrease {
  color: var(--error-color);
  animation: shake 0.5s ease-in-out;
}

.animated-price.increase {
  color: var(--accent-primary);
  animation: bounce 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
</style>
