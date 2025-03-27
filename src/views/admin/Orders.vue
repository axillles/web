<template>
  <div class="orders-admin">
    <h1>Управление заказами</h1>

    <div class="orders-list">
      <div v-if="loading" class="loading">
        Загрузка заказов...
      </div>

      <div v-else-if="orders.length === 0" class="no-orders">
        Заказов пока нет
      </div>

      <div v-else class="orders-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя клиента</th>
              <th>Телефон</th>
              <th>Услуга</th>
              <th>Стоимость</th>
              <th>Статус</th>
              <th>Дата создания</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>{{ order.id }}</td>
              <td>{{ order.contact_name }}</td>
              <td>{{ order.phone }}</td>
              <td>{{ order.service_title }}</td>
              <td>{{ order.approximate_price }} ₽</td>
              <td>{{ order.status }}</td>
              <td>{{ new Date(order.created_at).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabaseClient'

export default {
  name: 'OrdersAdmin',
  data() {
    return {
      orders: [],
      loading: true
    }
  },
  async created() {
    await this.loadOrders()
  },
  methods: {
    async loadOrders() {
      try {
        const { data, error } = await supabase
          .from('unconfirmed_orders')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        this.orders = data
      } catch (error) {
        console.error('Ошибка при загрузке заказов:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.orders-admin {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: var(--text-primary);
}

.orders-table {
  margin-top: 2rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

th {
  background: var(--bg-elevated);
  color: var(--accent-primary);
}

tr:hover {
  background: var(--bg-elevated);
}

.loading, .no-orders {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}
</style>
