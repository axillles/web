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
  color: #ffffff;
}

.success-content {
  background: #282828;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

h1 {
  color: #1db954;
  margin-bottom: 1rem;
}

p {
  margin-bottom: 2rem;
  color: #b3b3b3;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-primary {
  display: inline-block;
  background: #1db954;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background: #1ed760;
}
</style>
