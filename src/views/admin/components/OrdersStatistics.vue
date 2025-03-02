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
      <div style="position: relative; height: 300px;">
        <canvas ref="ordersChart"></canvas>
      </div>
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
        // Получаем дату начала предыдущего периода
        const startDate = new Date(this.getStartDate())
        switch (this.selectedPeriod) {
          case 'week':
            startDate.setDate(startDate.getDate() - 7)
            break
          case 'month':
            startDate.setMonth(startDate.getMonth() - 1)
            break
          case 'quarter':
            startDate.setMonth(startDate.getMonth() - 3)
            break
          case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1)
            break
        }

        const { data: orders, error } = await supabase
          .from('service_orders')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true })

        if (error) throw error

        this.calculateStatistics(orders || [])
        await this.updateChart(orders || [])
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

    async updateChart(orders) {
      try {
        // Группируем заказы по датам
        const ordersByDate = orders.reduce((acc, order) => {
          const date = new Date(order.created_at).toLocaleDateString('ru-RU')
          if (!acc[date]) {
            acc[date] = {
              count: 0,
              revenue: 0
            }
          }
          acc[date].count += 1
          acc[date].revenue += Number(order.total_price) || 0
          return acc
        }, {})

        const labels = Object.keys(ordersByDate)
        const orderCounts = Object.values(ordersByDate).map(data => data.count)
        const revenues = Object.values(ordersByDate).map(data => data.revenue)

        // Инициализируем новый график с двумя наборами данных
        await this.initChart(labels, orderCounts, revenues)
      } catch (error) {
        console.error('Error updating chart:', error)
      }
    },

    calculateStatistics(orders) {
      // Разделяем заказы на текущий и предыдущий период
      const now = new Date()
      const periodStart = this.getStartDate()
      const previousPeriodStart = new Date(periodStart)

      // Вычисляем начало предыдущего периода
      switch (this.selectedPeriod) {
        case 'week':
          previousPeriodStart.setDate(previousPeriodStart.getDate() - 7)
          break
        case 'month':
          previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1)
          break
        case 'quarter':
          previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 3)
          break
        case 'year':
          previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1)
          break
      }

      // Фильтруем заказы по периодам
      const currentPeriodOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate >= periodStart && orderDate <= now
      })

      const previousPeriodOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate >= previousPeriodStart && orderDate < periodStart
      })

      // Рассчитываем текущие показатели
      const currentStats = {
        totalOrders: currentPeriodOrders.length,
        totalRevenue: currentPeriodOrders.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0),
        averageOrder: currentPeriodOrders.length ?
          Math.round(currentPeriodOrders.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0) / currentPeriodOrders.length) : 0,
        cancelledOrders: currentPeriodOrders.filter(order => order.status === 'cancelled').length
      }

      // Рассчитываем предыдущие показатели
      const previousStats = {
        totalOrders: previousPeriodOrders.length,
        totalRevenue: previousPeriodOrders.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0),
        averageOrder: previousPeriodOrders.length ?
          Math.round(previousPeriodOrders.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0) / previousPeriodOrders.length) : 0,
        cancelledOrders: previousPeriodOrders.filter(order => order.status === 'cancelled').length
      }

      // Обновляем статистику с процентами изменений
      this.stats = {
        ...currentStats,
        ordersChange: this.calculatePercentage(currentStats.totalOrders, previousStats.totalOrders),
        revenueChange: this.calculatePercentage(currentStats.totalRevenue, previousStats.totalRevenue),
        averageOrderChange: this.calculatePercentage(currentStats.averageOrder, previousStats.averageOrder),
        cancelledOrdersChange: this.calculatePercentage(currentStats.cancelledOrders, previousStats.cancelledOrders),
        popularServices: this.getPopularServices(currentPeriodOrders)
      }

      // Обновляем максимальное количество для прогресс-баров
      this.stats.maxServiceCount = Math.max(...this.stats.popularServices.map(service => service.count))
    },

    calculatePercentage(current, previous) {
      if (previous === 0) return current > 0 ? 100 : 0
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
    },

    getPopularServices(orders) {
      const serviceCounts = orders.reduce((acc, order) => {
        const service = this.getServiceTypeText(order.service_type)
        acc[service] = (acc[service] || 0) + 1
        return acc
      }, {})

      return Object.entries(serviceCounts).map(([service, count]) => ({
        title: service,
        count: count,
        id: service.replace(/\s+/g, '-').toLowerCase()
      }))
    },

    async initChart(labels = [], orderCounts = [], revenues = []) {
      try {
        if (this.ordersChart) {
          this.ordersChart.destroy()
        }

        await this.$nextTick()
        const canvas = this.$refs.ordersChart
        if (!canvas) {
          console.error('Canvas element not found')
          return
        }

        const ctx = canvas.getContext('2d')
        this.ordersChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: 'Количество заказов',
                data: orderCounts,
                borderColor: '#1db954',
                backgroundColor: 'rgba(29, 185, 84, 0.1)',
                tension: 0.4,
                fill: true,
                yAxisID: 'y'
              },
              {
                label: 'Выручка',
                data: revenues,
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                tension: 0.4,
                fill: true,
                yAxisID: 'y1'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            plugins: {
              legend: {
                display: true,
                position: 'top',
                labels: {
                  color: '#b3b3b3',
                  usePointStyle: true,
                  padding: 20
                }
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: '#282828',
                titleColor: '#ffffff',
                bodyColor: '#b3b3b3',
                borderColor: '#404040',
                borderWidth: 1,
                callbacks: {
                  label: function(context) {
                    let label = context.dataset.label || ''
                    if (label) {
                      label += ': '
                    }
                    if (context.datasetIndex === 1) {
                      label += new Intl.NumberFormat('ru-RU', {
                        style: 'currency',
                        currency: 'RUB'
                      }).format(context.parsed.y)
                    } else {
                      label += context.parsed.y
                    }
                    return label
                  }
                }
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
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: true,
                grid: {
                  color: '#404040'
                },
                ticks: {
                  color: '#b3b3b3',
                  stepSize: 1
                }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                beginAtZero: true,
                grid: {
                  drawOnChartArea: false
                },
                ticks: {
                  color: '#b3b3b3',
                  callback: function(value) {
                    return new Intl.NumberFormat('ru-RU', {
                      style: 'currency',
                      currency: 'RUB'
                    }).format(value)
                  }
                }
              }
            }
          }
        })
      } catch (error) {
        console.error('Error initializing chart:', error)
      }
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
