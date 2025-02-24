<template>
  <div class="statistics">
    <div class="stats-header">
      <h2>Статистика заказов</h2>
      <div class="period-selector">
        <button
          v-for="period in periods"
          :key="period.value"
          :class="['period-btn', { active: selectedPeriod === period.value }]"
          @click="selectedPeriod = period.value"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <!-- Основные показатели -->
      <div class="stat-card">
        <div class="stat-title">Всего заказов</div>
        <div class="stat-value">{{ stats.totalOrders }}</div>
        <div class="stat-change" :class="{ positive: stats.ordersChange > 0 }">
          {{ stats.ordersChange > 0 ? '+' : '' }}{{ stats.ordersChange }}%
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-title">Выручка</div>
        <div class="stat-value">{{ formatPrice(stats.totalRevenue) }}</div>
        <div class="stat-change" :class="{ positive: stats.revenueChange > 0 }">
          {{ stats.revenueChange > 0 ? '+' : '' }}{{ stats.revenueChange }}%
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-title">Средний чек</div>
        <div class="stat-value">{{ formatPrice(stats.averageOrder) }}</div>
        <div class="stat-change" :class="{ positive: stats.averageOrderChange > 0 }">
          {{ stats.averageOrderChange > 0 ? '+' : '' }}{{ stats.averageOrderChange }}%
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-title">Отмененные заказы</div>
        <div class="stat-value">{{ stats.cancelledOrders }}</div>
        <div class="stat-change" :class="{ positive: stats.cancelledOrdersChange <= 0 }">
          {{ stats.cancelledOrdersChange > 0 ? '+' : '' }}{{ stats.cancelledOrdersChange }}%
        </div>
      </div>
    </div>

    <!-- График заказов -->
    <div class="chart-container">
      <h3>Динамика заказов</h3>
      <div class="chart" ref="ordersChart"></div>
    </div>

    <!-- Популярные услуги -->
    <div class="popular-services">
      <h3>Популярные услуги</h3>
      <div class="services-list">
        <div v-for="service in stats.popularServices" :key="service.id" class="service-item">
          <div class="service-info">
            <span class="service-name">{{ service.title }}</span>
            <span class="service-count">{{ service.count }} заказов</span>
          </div>
          <div class="service-progress">
            <div
              class="progress-bar"
              :style="{ width: `${(service.count / stats.maxServiceCount) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabaseClient'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export default {
  name: 'OrdersStatistics',

  data() {
    return {
      selectedPeriod: 'month',
      periods: [
        { value: 'week', label: 'Неделя' },
        { value: 'month', label: 'Месяц' },
        { value: 'quarter', label: 'Квартал' },
        { value: 'year', label: 'Год' }
      ],
      stats: {
        totalOrders: 0,
        ordersChange: 0,
        totalRevenue: 0,
        revenueChange: 0,
        averageOrder: 0,
        averageOrderChange: 0,
        cancelledOrders: 0,
        cancelledOrdersChange: 0,
        popularServices: [],
        maxServiceCount: 0
      },
      ordersChart: null
    }
  },

  watch: {
    selectedPeriod() {
      this.fetchStatistics()
    }
  },

  mounted() {
    this.fetchStatistics()
  },

  methods: {
    async fetchStatistics() {
      try {
        const startDate = this.getStartDate()

        const { data: orders, error } = await supabase
          .from('service_orders')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true })

        if (error) throw error

        this.calculateStatistics(orders)
        this.updateChart(orders)
      } catch (error) {
        console.error('Error fetching statistics:', error)
      }
    },

    getStartDate() {
      const now = new Date()
      switch (this.selectedPeriod) {
        case 'week':
          return new Date(now.setDate(now.getDate() - 7))
        case 'month':
          return new Date(now.setMonth(now.getMonth() - 1))
        case 'quarter':
          return new Date(now.setMonth(now.getMonth() - 3))
        case 'year':
          return new Date(now.setFullYear(now.getFullYear() - 1))
        default:
          return new Date(now.setMonth(now.getMonth() - 1))
      }
    },

    updateChart(orders) {
      // Группируем заказы по датам
      const ordersByDate = orders.reduce((acc, order) => {
        const date = new Date(order.created_at).toLocaleDateString('ru-RU')
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {})

      const labels = Object.keys(ordersByDate)
      const data = Object.values(ordersByDate)

      // Уничтожаем предыдущий график если он существует
      if (this.ordersChart) {
        this.ordersChart.destroy()
      }

      // Создаем новый график
      const ctx = this.$refs.ordersChart.getContext('2d')
      this.ordersChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Количество заказов',
            data,
            borderColor: '#1db954',
            backgroundColor: 'rgba(29, 185, 84, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: '#282828',
              titleColor: '#ffffff',
              bodyColor: '#b3b3b3',
              borderColor: '#404040',
              borderWidth: 1
            }
          },
          scales: {
            x: {
              grid: {
                color: '#404040'
              },
              ticks: {
                color: '#b3b3b3'
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: '#404040'
              },
              ticks: {
                color: '#b3b3b3',
                stepSize: 1
              }
            }
          }
        }
      })
    },

    calculateStatistics(orders) {
      // Разделяем заказы на текущий и предыдущий периоды
      const midPoint = new Date(this.getStartDate().getTime() +
        (new Date() - this.getStartDate().getTime()) / 2)

      const currentPeriodOrders = orders.filter(order =>
        new Date(order.created_at) > midPoint)
      const previousPeriodOrders = orders.filter(order =>
        new Date(order.created_at) <= midPoint)

      // Текущий период
      const currentStats = this.getStatsForOrders(currentPeriodOrders)
      // Предыдущий период
      const previousStats = this.getStatsForOrders(previousPeriodOrders)

      // Рассчитываем изменения
      this.stats = {
        ...currentStats,
        ordersChange: this.calculateChange(previousStats.totalOrders, currentStats.totalOrders),
        revenueChange: this.calculateChange(previousStats.totalRevenue, currentStats.totalRevenue),
        averageOrderChange: this.calculateChange(previousStats.averageOrder, currentStats.averageOrder),
        cancelledOrdersChange: this.calculateChange(previousStats.cancelledOrders, currentStats.cancelledOrders)
      }
    },

    getStatsForOrders(orders) {
      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0)
      const averageOrder = totalOrders ? Math.round(totalRevenue / totalOrders) : 0
      const cancelledOrders = orders.filter(order => order.status === 'cancelled').length

      return {
        totalOrders,
        totalRevenue,
        averageOrder,
        cancelledOrders
      }
    },

    calculateChange(previous, current) {
      if (!previous) return 0
      return Math.round(((current - previous) / previous) * 100)
    },

    getServiceTypeText(type) {
      const types = {
        moving: 'Квартирный переезд',
        office: 'Офисный переезд',
        loading: 'Погрузка/разгрузка',
        lifting: 'Подъем на этаж',
        cart: 'Заказ из корзины'
      }
      return types[type] || type
    },

    formatPrice(price) {
      return `${price.toLocaleString('ru-RU')} ₽`
    }
  }
}
</script>

<style scoped>
.statistics {
  color: #ffffff;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.period-selector {
  display: flex;
  gap: 0.5rem;
  background: #282828;
  padding: 0.25rem;
  border-radius: 4px;
}

.period-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: #b3b3b3;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.period-btn:hover {
  color: #ffffff;
}

.period-btn.active {
  background: #1db954;
  color: #ffffff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #282828;
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-title {
  color: #b3b3b3;
  font-size: 0.9rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
}

.stat-change {
  color: #ff4444;
  font-size: 0.9rem;
}

.stat-change.positive {
  color: #1db954;
}

.popular-services {
  background: #282828;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 2rem;
}

.popular-services h3 {
  margin-bottom: 1rem;
}

.service-item {
  margin-bottom: 1rem;
}

.service-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.service-name {
  color: #ffffff;
}

.service-count {
  color: #b3b3b3;
}

.service-progress {
  background: #404040;
  height: 4px;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  background: #1db954;
  height: 100%;
  transition: width 0.3s ease;
}

@media (max-width: 768px) {
  .stats-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .period-selector {
    flex-wrap: wrap;
  }

  .period-btn {
    flex: 1;
    text-align: center;
  }

  .stat-card {
    padding: 1rem;
  }
}

/* Добавим стили для графика */
.chart-container {
  background: #282828;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 2rem 0;
}

.chart-container h3 {
  margin-bottom: 1rem;
}

.chart {
  height: 300px;
  width: 100%;
}
</style>
