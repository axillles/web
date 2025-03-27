<template>
  <div class="review-card">
    <div class="review-header">
      <img :src="review.avatar" :alt="review.name" class="review-avatar" />
      <div class="review-author">
        <h4>{{ review.name }}</h4>
        <div class="review-rating">
          <span v-for="i in 5" :key="i" class="star" :class="{ filled: i <= review.rating }"
            >★</span
          >
        </div>
      </div>
    </div>
    <p class="review-text">{{ review.text }}</p>
    <div class="review-date">{{ formatDate(review.date) }}</div>
  </div>
</template>

<script>
export default {
  name: 'ReviewCard',
  props: {
    review: {
      type: Object,
      required: true,
    },
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    },
  },
}
</script>

<style scoped>
.review-card {
  padding: 2rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  transition: var(--transition-standard);
}

.review-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--card-hover-shadow);
  background: var(--bg-elevated);
}

.review-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.review-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.review-author h4 {
  margin: 0;
  color: var(--text-primary);
}

.review-rating {
  margin-top: 0.25rem;
}

.star {
  color: #ffd700;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  font-size: 1.1rem;
}

.star.filled {
  color: #ffc107;
}

.review-text {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.review-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.review-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}

.action-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: var(--transition-standard);
}

.action-button:hover {
  background: var(--accent-primary);
}

.helpful-count {
  font-size: 0.9rem;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.helpful-count.active {
  color: var(--accent-primary);
}
</style>
