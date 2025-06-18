<template>
  <div class="service-card-skeleton">
    <div class="skeleton skeleton-image"></div>
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-text"></div>
    <div class="skeleton skeleton-text short"></div>
    <div class="skeleton skeleton-price"></div>
    <div class="skeleton-actions">
      <div class="skeleton skeleton-button"></div>
      <div class="skeleton skeleton-button"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ServiceCardSkeleton'
}
</script>

<style scoped>
.service-card-skeleton {
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.skeleton {
  background: var(--bg-elevated);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.skeleton::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--bg-secondary), transparent);
  animation: loading 1.5s infinite linear;
}

.skeleton-image {
  width: 100%;
  height: 180px;
  margin-bottom: 1rem;
}

.skeleton-title {
  height: 1.2rem;
  width: 70%;
  margin-bottom: 0.75rem;
}

.skeleton-text {
  height: 0.95rem;
  width: 100%;
  margin-bottom: 0.5rem;
}

.skeleton-text.short {
  width: 80%;
  margin-bottom: 1rem;
}

.skeleton-price {
  height: 1.2rem;
  width: 40%;
  margin: 0.5rem 0;
}

.skeleton-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
}

.skeleton-button {
  flex: 1;
  height: 40px; /* Примерная высота кнопки */
  border-radius: 50px;
}

@keyframes loading {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Адаптация под мобильные */
@media (max-width: 768px) {
  .service-card-skeleton {
    padding: 1.25rem;
  }
  .skeleton-image {
    height: 160px;
  }
  .skeleton-button {
    height: 36px;
  }
}

@media (max-width: 480px) {
  .service-card-skeleton {
    padding: 1rem;
  }
  .skeleton-image {
    height: 140px;
  }
  .skeleton-button {
    height: 32px;
  }
}
</style>
