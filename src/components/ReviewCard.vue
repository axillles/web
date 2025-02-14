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
  background: #282828;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.review-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  background: #404040;
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
  color: #ffffff;
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
  color: #b3b3b3;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.review-date {
  color: #b3b3b3;
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
  background: #404040;
  color: #ffffff;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: #1db954;
}

.helpful-count {
  font-size: 0.9rem;
  color: #b3b3b3;
  transition: color 0.3s ease;
}

.helpful-count.active {
  color: #1db954;
}
</style>
