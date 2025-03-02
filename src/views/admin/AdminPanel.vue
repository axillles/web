<template>
  <div class="admin-panel">
    <div class="admin-header">
      <h1>Панель администратора</h1>
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-button', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>

    <div class="tab-content">
      <OrdersManager v-if="currentTab === 'orders'" />
      <OrdersStatistics v-if="currentTab === 'statistics'" />
      <PromotionsManager v-if="currentTab === 'promotions'" />
      <ServicesManager v-if="currentTab === 'services'" />
      <UsersManager v-if="currentTab === 'users'" />
    </div>
  </div>
</template>

<script>
import OrdersManager from './components/OrdersManager.vue'
import OrdersStatistics from './components/OrdersStatistics.vue'
import PromotionsManager from './components/PromotionsManager.vue'
import ServicesManager from './components/ServicesManager.vue'
import UsersManager from './components/UsersManager.vue'

export default {
  name: 'AdminPanel',
  components: {
    OrdersManager,
    OrdersStatistics,
    PromotionsManager,
    ServicesManager,
    UsersManager
  },
  data() {
    return {
      currentTab: 'orders',
      tabs: [
        { id: 'orders', name: 'Заказы' },
        { id: 'statistics', name: 'Статистика' },
        { id: 'promotions', name: 'Акции' },
        { id: 'services', name: 'Услуги' },
        { id: 'users', name: 'Пользователи' }
      ]
    }
  }
}
</script>

<style scoped>
.admin-panel {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.admin-header {
  margin-bottom: 2rem;
}

.admin-header h1 {
  color: #ffffff;
  margin-bottom: 1.5rem;
}

.tabs {
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid #404040;
  padding-bottom: 1px;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  color: #b3b3b3;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.tab-button:hover {
  color: #ffffff;
}

.tab-button.active {
  color: #1db954;
  border-bottom-color: #1db954;
}

.tab-content {
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .admin-panel {
  padding: 1rem;
  }

  .tabs {
    flex-wrap: wrap;
  gap: 0.5rem;
}

  .tab-button {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}
}
</style>
