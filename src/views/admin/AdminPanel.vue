<template>
  <div class="admin-panel">
    <div class="admin-header">
      <h1>Панель управления</h1>
      <div class="admin-tabs">
        <button :class="{ active: activeTab === 'services' }" @click="activeTab = 'services'">
          Услуги
        </button>
        <button :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">
          Заказы
        </button>
        <button :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">
          Пользователи
        </button>
        <button :class="{ active: activeTab === 'promotions' }" @click="activeTab = 'promotions'">
          Акции
        </button>
        <button :class="{ active: activeTab === 'promocodes' }" @click="activeTab = 'promocodes'">
          Промокоды
        </button>
        <button :class="{ active: activeTab === 'statistics' }" @click="activeTab = 'statistics'">
          Статистика
        </button>
      </div>
    </div>

    <div class="admin-content">
      <!-- Управление услугами -->
      <div v-if="activeTab === 'services'" class="services-management">
        <div class="header-actions">
          <h2>Управление услугами</h2>
          <button class="btn-primary" @click="showAddServiceForm = true">Добавить услугу</button>
        </div>
        <div class="services-list">
          <div v-for="service in services" :key="service.id" class="service-item">
            <img :src="service.image" :alt="service.title" />
            <div class="service-info">
              <h3>{{ service.title }}</h3>
              <p class="price">{{ service.price }} ₽/час</p>
            </div>
            <div class="actions">
              <button class="btn-edit" @click="editService(service)">Редактировать</button>
              <button class="btn-delete" @click="deleteService(service.id)">Удалить</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Управление заказами -->
      <div v-if="activeTab === 'orders'" class="orders-management">
        <h2>Управление заказами</h2>
        <div class="orders-filters">
          <select v-model="orderStatus">
            <option value="">Все статусы</option>
            <option value="pending">Ожидает</option>
            <option value="in_progress">В работе</option>
            <option value="completed">Выполнен</option>
            <option value="cancelled">Отменен</option>
          </select>
        </div>
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
                  <th>Дополнительно</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in filteredOrders" :key="order.id">
                  <td>{{ order.id }}</td>
                  <td>{{ order.contact_name }}</td>
                  <td>{{ order.phone }}</td>
                  <td>{{ order.service_title }}</td>
                  <td>{{ order.approximate_price }} ₽</td>
                  <td>
                    <select
                      v-model="order.status"
                      @change="updateOrderStatus(order.id, order.status)"
                    >
                      <option value="new">Новый</option>
                      <option value="confirmed">Подтвержден</option>
                      <option value="in_progress">В работе</option>
                      <option value="completed">Выполнен</option>
                      <option value="cancelled">Отменен</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      v-model="order.admin_comment"
                      placeholder="Комментарий"
                      @change="updateOrderComment(order.id, order.admin_comment)"
                    >
                  </td>
                  <td class="actions">
                    <button
                      class="btn-edit"
                      @click="editOrder(order)"
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button
                      class="btn-delete"
                      @click="deleteOrder(order.id)"
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Управление пользователями -->
      <div v-if="activeTab === 'users'" class="users-management">
        <h2>Управление пользователями</h2>
        <div class="users-list">
          <div v-for="user in users" :key="user.id" class="user-item">
            <div class="user-info">
              <h3>{{ user.name || 'Без имени' }}</h3>
              <p>{{ user.email }}</p>
              <p>{{ user.phone || 'Нет телефона' }}</p>
            </div>
            <div class="actions">
              <button
                class="btn-toggle"
                :class="{ active: user.user_metadata?.is_admin }"
                @click="toggleAdminStatus(user)"
              >
                {{ user.user_metadata?.is_admin ? 'Убрать админа' : 'Сделать админом' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Управление акциями -->
      <PromotionsManager v-if="activeTab === 'promotions'" />

      <!-- Статистика -->
      <OrdersStatistics v-if="activeTab === 'statistics'" />

      <!-- Промокоды -->
      <PromocodesManager v-if="activeTab === 'promocodes'" />
    </div>

    <!-- Модальное окно добавления/редактирования услуги -->
    <div v-if="showAddServiceForm || editingService" class="modal">
      <div class="modal-content">
        <button class="close-button" @click="closeForm">&times;</button>
        <h2>{{ editingService ? 'Редактирование' : 'Добавление' }} услуги</h2>

        <form @submit.prevent="handleSubmit" class="service-form">
          <div class="form-group">
            <label>Название</label>
            <input v-model="form.title" required />
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="form.description" rows="4" required></textarea>
          </div>

          <div class="form-group">
            <label>Базовая цена (₽/час)</label>
            <input type="number" v-model.number="form.price" required min="0" />
          </div>

          <div class="form-group">
            <label>Категория</label>
            <select v-model="form.category" required>
              <option value="loaders">Грузчики</option>
              <option value="transport">Транспорт</option>
              <option value="combos">Готовые комплексы</option>
            </select>
          </div>

          <div class="form-group">
            <label>Изображение</label>
            <input type="file" @change="handleImageUpload" accept="image/*" required />
          </div>

          <div class="form-group">
            <label>Особенности (по одной на строку)</label>
            <textarea
              v-model="featuresText"
              rows="4"
              placeholder="Каждая особенность с новой строки"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Требования (по одному на строку)</label>
            <textarea
              v-model="requirementsText"
              rows="4"
              placeholder="Каждое требование с новой строки"
            ></textarea>
          </div>

          <div class="pricing-section">
            <h3>Цены для разного времени</h3>
            <div class="form-group" v-for="(type, index) in priceTypes" :key="index">
              <label>{{ type }}</label>
              <input type="number" v-model.number="form.pricing[type]" required min="0" />
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary">
              {{ editingService ? 'Сохранить' : 'Добавить' }}
            </button>
            <button type="button" class="btn-secondary" @click="closeForm">Отмена</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteConfirm" class="modal">
      <div class="modal-content confirm-dialog">
        <h2>Подтверждение удаления</h2>
        <p>Вы действительно хотите удалить услугу "{{ serviceToDelete?.title }}"?</p>
        <div class="confirm-actions">
          <button class="btn-danger" @click="deleteService">Удалить</button>
          <button class="btn-secondary" @click="showDeleteConfirm = false">Отмена</button>
        </div>
      </div>
    </div>

    <!-- Добавим модальное окно для редактирования заказа -->
    <div v-if="editingOrder" class="modal">
      <div class="modal-content">
        <button class="close-button" @click="closeOrderEdit">&times;</button>
        <h2>Редактирование заказа #{{ editingOrder.id }}</h2>

        <form @submit.prevent="saveOrder" class="order-form">
          <div class="form-group">
            <label>Имя клиента</label>
            <input v-model="editingOrder.contact_name" required>
          </div>

          <div class="form-group">
            <label>Телефон</label>
            <input v-model="editingOrder.phone" required>
          </div>

          <div class="form-group">
            <label>Услуга</label>
            <input v-model="editingOrder.service_title" required>
          </div>

          <div class="form-group">
            <label>Стоимость</label>
            <input type="number" v-model.number="editingOrder.approximate_price" required>
          </div>

          <div class="form-group">
            <label>Статус</label>
            <select v-model="editingOrder.status" required>
              <option value="new">Новый</option>
              <option value="confirmed">Подтвержден</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Выполнен</option>
              <option value="cancelled">Отменен</option>
            </select>
          </div>

          <div class="form-group">
            <label>Дата и время</label>
            <input
              type="text"
              v-model="editingOrder.scheduled_time"
              placeholder="дд.мм.гггг, чч:мм"
              required
            >
          </div>

          <div class="form-group">
            <label>Комментарий</label>
            <textarea
              v-model="editingOrder.admin_comment"
              rows="3"
              placeholder="Комментарий администратора"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary">Сохранить</button>
            <button type="button" class="btn-secondary" @click="closeOrderEdit">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabaseClient'
import PromotionsManager from './components/PromotionsManager.vue'
import OrdersStatistics from './components/OrdersStatistics.vue'
import PromocodesManager from './components/PromocodesManager.vue'

export default {
  name: 'AdminPanel',
  components: {
    PromotionsManager,
    OrdersStatistics,
    PromocodesManager,
  },
  data() {
    return {
      activeTab: 'services',
      orderStatus: '',
      services: [],
      orders: [],
      users: [],
      showAddServiceForm: false,
      showDeleteConfirm: false,
      editingService: null,
      serviceToDelete: null,
      form: {
        title: '',
        description: '',
        price: 0,
        category: 'loaders',
        image: '',
        features: [],
        requirements: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active',
        pricing: {
          'Стандартное время': 0,
          'Вечернее время': 0,
          'Выходные дни': 0,
        },
      },
      priceTypes: ['Стандартное время', 'Вечернее время', 'Выходные дни'],
      tabs: [
        { id: 'services', name: 'Услуги' },
        { id: 'orders', name: 'Заказы' },
        { id: 'promotions', name: 'Акции' },
      ],
      loading: true,
      editingOrder: null,
    }
  },
  computed: {
    filteredOrders() {
      if (!this.orderStatus) return this.orders
      return this.orders.filter((order) => order.status === this.orderStatus)
    },
    featuresText: {
      get() {
        return this.form.features.join('\n')
      },
      set(value) {
        this.form.features = value.split('\n').filter((line) => line.trim())
      },
    },
    requirementsText: {
      get() {
        return this.form.requirements.join('\n')
      },
      set(value) {
        this.form.requirements = value.split('\n').filter((line) => line.trim())
      },
    },
  },
  methods: {
    async handleImageUpload(event) {
      try {
        const file = event.target.files[0]
        if (!file) return

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `services/${fileName}`

        // Проверяем размер файла (не более 2MB)
        if (file.size > 2 * 1024 * 1024) {
          throw new Error('Файл слишком большой. Максимальный размер 2MB')
        }

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('images').getPublicUrl(filePath)

        console.log('Uploaded image URL:', data.publicUrl)
        this.form.image = data.publicUrl
      } catch (error) {
        console.error('Upload error:', error)
        this.showToast(error.message || 'Ошибка при загрузке изображения', 'error')
      }
    },
    resetForm() {
      this.form = {
        title: '',
        description: '',
        price: 0,
        category: 'loaders',
        image: '',
        features: [],
        requirements: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active',
        pricing: {
          'Стандартное время': 0,
          'Вечернее время': 0,
          'Выходные дни': 0,
        },
      }
    },
    closeForm() {
      this.showAddServiceForm = false
      this.editingService = null
      this.resetForm()
    },
    editService(service) {
      this.editingService = service
      this.form = {
        ...service,
        pricing: { ...service.pricing },
        features: [...service.features],
        requirements: [...service.requirements],
      }
    },
    confirmDelete(service) {
      this.serviceToDelete = service
      this.showDeleteConfirm = true
    },
    async deleteService() {
      try {
        const { error } = await supabase.from('services').delete().eq('id', this.serviceToDelete.id)

        if (error) throw error
        await this.fetchServices()
        this.showToast('Услуга успешно удалена', 'success')
      } catch (error) {
        console.error('Ошибка при удалении услуги:', error)
        this.showToast('Ошибка при удалении услуги', 'error')
      } finally {
        this.showDeleteConfirm = false
        this.serviceToDelete = null
      }
    },
    async handleSubmit() {
      try {
        const now = new Date().toISOString()
        const serviceData = {
          ...this.form,
          features: this.form.features.filter((f) => f.trim()),
          requirements: this.form.requirements.filter((r) => r.trim()),
          price: parseInt(this.form.price),
          pricing: {
            'Стандартное время': parseInt(this.form.pricing['Стандартное время']),
            'Вечернее время': parseInt(this.form.pricing['Вечернее время']),
            'Выходные дни': parseInt(this.form.pricing['Выходные дни']),
          },
          status: 'active',
          updated_at: now,
        }

        if (!this.editingService) {
          serviceData.created_at = now
        }

        if (this.editingService) {
          const { error } = await supabase
            .from('services')
            .update(serviceData)
            .eq('id', this.editingService.id)

          if (error) throw error
          await this.fetchServices()
          this.showToast('Услуга успешно обновлена', 'success')
        } else {
          const { error } = await supabase.from('services').insert([serviceData])

          if (error) throw error
          await this.fetchServices()
          this.showToast('Услуга успешно добавлена', 'success')
        }
        this.closeForm()
      } catch (error) {
        console.error('Ошибка при сохранении услуги:', error)
        this.showToast('Ошибка при сохранении услуги', 'error')
      }
    },
    async fetchServices() {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Ошибка при загрузке услуг:', error)
          throw error
        }

        console.log('Загруженные услуги:', data)
        this.services = data || []
      } catch (error) {
        console.error('Ошибка при загрузке услуг:', error)
        this.showToast('Ошибка при загрузке услуг', 'error')
      }
    },
    async fetchOrders() {
      try {
        const { data, error } = await supabase
          .from('unconfirmed_orders')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Ошибка при загрузке заказов:', error)
          throw error
        }

        console.log('Загруженные заказы:', data)
        this.orders = data || []
        this.loading = false
      } catch (error) {
        console.error('Ошибка при загрузке заказов:', error)
        this.showToast('Ошибка при загрузке заказов', 'error')
      }
    },
    async fetchUsers() {
      try {
        const { data, error } = await supabase
          .rpc('get_users')

        if (error) {
          console.error('Ошибка при загрузке пользователей:', error)
          throw error
        }

        console.log('Загруженные пользователи:', data)
        this.users = data || []
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error)
        this.showToast('Ошибка при загрузке пользователей', 'error')
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString()
    },
    getStatusText(status) {
      const statusMap = {
        pending: 'Ожидает',
        in_progress: 'В работе',
        completed: 'Выполнен',
        cancelled: 'Отменен',
      }
      return statusMap[status] || status
    },
    async updateOrderStatus(orderId, newStatus) {
      try {
        const order = this.orders.find(o => o.id === orderId)
        if (!order) throw new Error('Заказ не найден')

        const tableName = order.source === 'confirmed' ? 'orders' : 'unconfirmed_orders'

        const { error } = await supabase
          .from(tableName)
          .update({ status: newStatus })
          .eq('id', orderId)

        if (error) throw error

        this.showToast('Статус заказа обновлен', 'success')
        await this.fetchOrders()
      } catch (error) {
        console.error('Ошибка при обновлении статуса:', error)
        this.showToast('Ошибка при обновлении статуса', 'error')
      }
    },
    async updateOrderTime(orderId, newTime) {
      try {
        // Проверяем формат времени
        if (!newTime.match(/^\d{2}\.\d{2}\.\d{4},\s\d{2}:\d{2}$/)) {
          throw new Error('Неверный формат времени. Используйте формат "дд.мм.гггг, чч:мм"')
        }

        const { error } = await supabase
          .from('unconfirmed_orders')
          .update({ scheduled_time: newTime })
          .eq('id', orderId)

        if (error) throw error

        this.showToast('Время заказа обновлено', 'success')
        await this.fetchOrders()
      } catch (error) {
        console.error('Ошибка при обновлении времени:', error)
        this.showToast('Ошибка при обновлении времени', 'error')
      }
    },
    async deleteOrder(orderId) {
      if (!confirm('Вы уверены, что хотите удалить этот заказ?')) return

      try {
        const { error } = await supabase
          .from('unconfirmed_orders')
          .delete()
          .eq('id', orderId)

        if (error) throw error
        this.showToast('Заказ успешно удален', 'success')
        await this.fetchOrders() // Обновляем список заказов
      } catch (error) {
        console.error('Ошибка при удалении заказа:', error)
        this.showToast('Ошибка при удалении заказа', 'error')
      }
    },
    async toggleAdminStatus(user) {
      // Implementation of toggleAdminStatus method
    },
    editOrder(order) {
      this.editingOrder = { ...order }
    },
    closeOrderEdit() {
      this.editingOrder = null
    },
    async saveOrder() {
      try {
        const { error } = await supabase
          .from('unconfirmed_orders')
          .update({
            ...this.editingOrder,
            status: this.editingOrder.status,
            scheduled_time: this.editingOrder.scheduled_time,
            admin_comment: this.editingOrder.admin_comment,
          })
          .eq('id', this.editingOrder.id)

        if (error) throw error
        await this.fetchOrders()
        this.showToast('Заказ успешно обновлен', 'success')
        this.closeOrderEdit()
      } catch (error) {
        console.error('Ошибка при сохранении заказа:', error)
        this.showToast('Ошибка при сохранении заказа', 'error')
      }
    },
    async updateOrderComment(orderId, newComment) {
      try {
        console.log('Обновление комментария:', { orderId, newComment }) // для отладки

        const { error } = await supabase
          .from('unconfirmed_orders')
          .update({
            admin_comment: newComment || null // используем null если комментарий пустой
          })
          .eq('id', orderId)

        if (error) {
          console.error('Ошибка при обновлении:', error) // для отладки
          throw error
        }

        this.showToast('Комментарий обновлен', 'success')
        await this.fetchOrders()
      } catch (error) {
        console.error('Ошибка при обновлении комментария:', error)
        this.showToast('Ошибка при обновлении комментария', 'error')
      }
    },
  },
  async created() {
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Текущая сессия:', session)

    if (!session) {
      console.log('Нет сессии, перенаправление на логин')
      this.$router.push('/login')
      return
    }

    try {
      this.loading = true
      await Promise.all([
        this.fetchServices(),
        this.fetchOrders(),
        this.fetchUsers()
      ])
    } catch (error) {
      console.error('Ошибка при инициализации:', error)
      this.showToast('Ошибка при загрузке данных', 'error')
    } finally {
      this.loading = false
    }
  },
  inject: ['showToast'],
}
</script>

<style scoped>
/* Обновляем стили контейнера админ-панели */
.admin-panel {
  padding: 2rem;
  width: 100vw; /* Используем viewport width */
  min-height: 100vh;
  background: #121212;
  color: #ffffff;
  box-sizing: border-box; /* Учитываем padding в общей ширине */
}

.admin-header {
  margin-bottom: 2rem;
}

.admin-tabs {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  border-bottom: 1px solid #404040;
}

.admin-tabs button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  border-bottom: 2px solid transparent;
  color: #b3b3b3;
  transition: all 0.3s ease;
}

.admin-tabs button:hover {
  color: #ffffff;
  background: #282828;
}

.admin-tabs button.active {
  border-bottom-color: #1db954;
  color: #1db954;
}

.admin-content {
  margin-top: 2rem;
  width: 100%;
  max-width: none; /* Убираем ограничение максимальной ширины */
}

.services-management {
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.services-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.service-item {
  background: #282828;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.service-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.service-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.service-info {
  padding: 1rem;
  color: #ffffff;
}

.actions {
  display: flex;
  padding: 1rem;
  gap: 1rem;
}

.orders-management {
  width: 100%;
  margin: 0; /* Убираем отступы */
}

.orders-filters {
  margin-bottom: 2rem;
}

.orders-list {
  width: 100%;
  display: block; /* Убираем grid */
}

.order-item {
  background: #282828;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.order-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.order-info {
  padding: 1rem;
  color: #ffffff;
}

.users-management {
  margin-bottom: 2rem;
}

.users-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.user-item {
  background: #282828;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.user-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.user-info {
  padding: 1rem;
  color: #ffffff;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #282828;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #b3b3b3;
}

.close-button:hover {
  color: #ffffff;
}

.service-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
  color: #ffffff;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.5rem;
  border: 1px solid #404040;
  border-radius: 4px;
  font-size: 1rem;
  background: #404040;
  color: #ffffff;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #1db954;
  outline: none;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #b3b3b3;
}

.pricing-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #404040;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background: #1db954;
  color: white;
  transition: background 0.3s ease;
}

.btn-primary:hover {
  background: #1ed760;
}

.btn-secondary {
  background: #404040;
  color: white;
}

.btn-secondary:hover {
  background: #505050;
}

.btn-danger {
  background: #e91429;
  color: white;
}

.btn-danger:hover {
  background: #ff1430;
}

.btn-edit {
  background: #1db954;
  color: white;
}

.btn-edit:hover {
  background: #1ed760;
}

.btn-delete {
  background: #e91429;
  color: white;
}

.btn-delete:hover {
  background: #ff1430;
}

.confirm-dialog {
  text-align: center;
  color: #ffffff;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.loading, .no-orders {
  text-align: center;
  padding: 2rem;
  color: #b3b3b3;
}

/* Статусы заказов */
.status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.status.pending {
  background: #ffc107;
  color: #000000;
}

.status.in_progress {
  background: #2196f3;
  color: #ffffff;
}

.status.completed {
  background: #1db954;
  color: #ffffff;
}

.status.cancelled {
  background: #e91429;
  color: #ffffff;
}

/* Скроллбар */
.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-track {
  background: #282828;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #404040;
  border-radius: 3px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #1db954;
}

/* Обновляем стили таблицы */
.orders-table {
  width: 100%;
  margin: 0;
  background: #282828;
  border-radius: 8px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* Фиксированная разметка таблицы */
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #404040;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

th:nth-child(1), td:nth-child(1) { width: 5%; }
th:nth-child(2), td:nth-child(2) { width: 15%; }
th:nth-child(3), td:nth-child(3) { width: 13%; }
th:nth-child(4), td:nth-child(4) { width: 17%; }
th:nth-child(5), td:nth-child(5) { width: 10%; }
th:nth-child(6), td:nth-child(6) { width: 15%; }
th:nth-child(7), td:nth-child(7) { width: 15%; }
th:nth-child(8), td:nth-child(8) { width: 10%; }

td select, td input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #404040;
  border-radius: 4px;
  background: #323232;
  color: #ffffff;
}

td select:focus, td input:focus {
  border-color: #1db954;
  outline: none;
}

td.actions {
  min-width: 100px;
  padding: 0.5rem;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  white-space: nowrap;
}

td.actions button {
  width: 32px;
  height: 32px;
  padding: 4px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #323232;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

td.actions button:hover {
  background: #404040;
  transform: scale(1.1);
}

/* Добавим стили для текста в ячейках */
td {
  max-width: 0; /* Это нужно для работы text-overflow */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Стили для колонки действий */
td.actions {
  min-width: 80px; /* Минимальная ширина для кнопок */
  white-space: nowrap;
}

/* Обновляем стили для поля комментария */
td input[type="text"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #404040;
  border-radius: 4px;
  background: #323232;
  color: #ffffff;
  font-family: inherit;
  min-height: 36px;
  resize: vertical;
}

td input[type="text"]::placeholder {
  color: #666;
}

td input[type="text"]:focus {
  border-color: #1db954;
  outline: none;
}
</style>
