<template>
  <div class="orders-statistics">
    <h2>Статистика заказов</h2>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>Всего заказов</h3>
        <div class="stat-value">{{ totalOrders }}</div>
      </div>

      <div class="stat-card">
        <h3>Выполнено</h3>
        <div class="stat-value">{{ completedOrders }}</div>
      </div>

      <div class="stat-card">
        <h3>В работе</h3>
        <div class="stat-value">{{ inProgressOrders }}</div>
      </div>

      <div class="stat-card">
        <h3>Отменено</h3>
        <div class="stat-value">{{ cancelledOrders }}</div>
      </div>
    </div>

    <div class="chart-container">
      <h3>Статистика по месяцам</h3>
      <div class="chart-wrapper">
        <canvas ref="ordersChart"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/config/supabase'
import Chart from 'chart.js/auto'

export default {
  name: 'OrdersStatistics',
  data() {
    return {
      orders: [],
      chart: null,
    }
  },
  computed: {
    totalOrders() {
      return this.orders.length
    },
    completedOrders() {
      return this.orders.filter(order => order.status === 'completed').length
    },
    inProgressOrders() {
      return this.orders.filter(order => order.status === 'in_progress').length
    },
    cancelledOrders() {
      return this.orders.filter(order => order.status === 'cancelled').length
    },
    monthlyData() {
      const months = {}
      const revenue = {}

      this.orders.forEach(order => {
        const date = new Date(order.created_at)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

        months[monthKey] = (months[monthKey] || 0) + 1

        // Используем все возможные поля цены
        const orderPrice = Number(order.final_price) ||
                          Number(order.approximate_price) ||
                          Number(order.price) || 0

        revenue[monthKey] = (revenue[monthKey] || 0) + orderPrice
      })

      // Добавим логирование для отладки
      console.log('Данные по месяцам:', {
        months,
        revenue,
        sampleOrders: this.orders.slice(0, 3).map(order => ({
          id: order.id,
          final_price: order.final_price,
          approximate_price: order.approximate_price,
          price: order.price,
          created_at: order.created_at
        }))
      })

      return { months, revenue }
    }
  },
  methods: {
    async fetchOrders() {
      try {
        // Получаем неподтвержденные заказы
        const { data: unconfirmedData, error: unconfirmedError } = await supabase
          .from('unconfirmed_orders')
          .select('*')
          .order('created_at', { ascending: true })

        if (unconfirmedError) throw unconfirmedError

        // Получаем подтвержденные заказы
        const { data: confirmedData, error: confirmedError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: true })

        if (confirmedError) throw confirmedError

        // Объединяем все заказы
        this.orders = [...(unconfirmedData || []), ...(confirmedData || [])]

        console.log('Загруженные заказы:', {
          unconfirmed: unconfirmedData?.length || 0,
          confirmed: confirmedData?.length || 0,
          total: this.orders.length
        })

        this.updateChart()
      } catch (error) {
        console.error('Ошибка при загрузке заказов:', error)
      }
    },
    updateChart() {
      const months = Object.keys(this.monthlyData.months).sort()
      const orderCounts = months.map(month => this.monthlyData.months[month])
      const revenue = months.map(month => this.monthlyData.revenue[month])

      if (this.chart) {
        this.chart.destroy()
      }

      const ctx = this.$refs.ordersChart.getContext('2d')
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months.map(month => {
            const [year, monthNum] = month.split('-')
            const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
            return `${monthNames[Number(monthNum) - 1]} ${year}`
          }),
          datasets: [
            {
              label: 'Количество заказов',
              data: orderCounts,
              backgroundColor: '#1db954',
              borderColor: '#1ed760',
              borderWidth: 1,
              yAxisID: 'y'
            },
            {
              label: 'Сумма заказов (₽)',
              data: revenue,
              backgroundColor: '#2196F3',
              borderColor: '#64B5F6',
              borderWidth: 1,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              type: 'linear',
              position: 'left',
              beginAtZero: true,
              grid: {
                color: '#404040'
              },
              ticks: {
                color: '#ffffff'
              }
            },
            y1: {
              type: 'linear',
              position: 'right',
              beginAtZero: true,
              grid: {
                display: false
              },
              ticks: {
                color: '#ffffff',
                callback: value => `${value.toLocaleString('ru-RU')} ₽`
              }
            },
            x: {
              grid: {
                color: '#404040'
              },
              ticks: {
                color: '#ffffff'
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: '#ffffff'
              }
            },
            tooltip: {
              callbacks: {
                label: context => {
                  const label = context.dataset.label
                  const value = context.raw
                  return label.includes('₽')
                    ? `${label}: ${value.toLocaleString('ru-RU')} ₽`
                    : `${label}: ${value}`
                }
              }
            }
          }
        }
      })
    }
  },
  async mounted() {
    await this.fetchOrders()
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  }
}
</script>

<style scoped>
.orders-statistics {
  padding: 2rem;
  color: #ffffff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.stat-card {
  background: #282828;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  text-align: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.stat-card h3 {
  color: #b3b3b3;
  margin-bottom: 1rem;
  font-size: 1rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #1db954;
}

.chart-container {
  background: #282828;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-top: 2rem;
}

.chart-wrapper {
  height: 400px;
  position: relative;
}

.chart-container h3 {
  margin-bottom: 1.5rem;
  text-align: center;
  color: #ffffff;
}
</style>
