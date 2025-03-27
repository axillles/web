<template>
  <div class="order-success">
    <div class="success-content">
      <h1>Заказ успешно оформлен!</h1>
      <p>Наш менеджер свяжется с вами в ближайшее время для уточнения деталей.</p>
      <div class="buttons">
        <router-link to="/catalog" class="btn-primary">Вернуться в каталог</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderSuccess'
}
</script>

<style scoped>
.order-success {
  max-width: 600px;
  margin: 3rem auto;
  padding: 2rem;
  text-align: center;
  color: var(--text-primary);
}

.success-content {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: var(--card-shadow);
}

h1 {
  color: var(--accent-primary);
  margin-bottom: 1rem;
}

p {
  margin-bottom: 2rem;
  color: var(--text-secondary);
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-primary {
  display: inline-block;
  background: var(--accent-primary);
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  transition: var(--transition-standard);
}

.btn-primary:hover {
  background: var(--accent-secondary);
}
</style>
