<template>
  <div class="actions-manager">
    <div class="actions-header">
      <h2>Управление акциями</h2>
      <button class="add-btn" @click="showAddForm = true">
        <span class="material-icons">add</span>
        Добавить акцию
      </button>
    </div>

    <div class="actions-table-container">
      <table class="actions-table">
        <thead>
          <tr>
            <th>Изображение</th>
            <th>Название</th>
            <th>Старая цена</th>
            <th>Новая цена</th>
            <th>Ссылка</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="promotion in promotions" :key="promotion.id">
            <td class="image-cell">
              <img :src="promotion.image" :alt="promotion.title" class="thumb-image" />
            </td>
            <td>{{ promotion.title }}</td>
            <td>{{ formatPrice(promotion.old_price) }}</td>
            <td>{{ formatPrice(promotion.price) }}</td>
            <td class="link-cell">{{ promotion.link }}</td>
            <td class="actions">
              <button class="edit-btn" @click="editPromotion(promotion)">
                <span class="material-icons">edit</span>
              </button>
              <button class="delete-btn" @click="confirmDelete(promotion.id)">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
          <tr v-if="promotions.length === 0">
            <td colspan="6" class="no-data">Нет акций</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно добавления/редактирования -->
    <div v-if="showAddForm || editingPromotion" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingPromotion ? 'Редактировать акцию' : 'Добавить акцию' }}</h3>
          <button class="close-btn" @click="closeForm">
            <span class="material-icons">close</span>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="promotion-form">
          <div class="form-group">
            <label>Название акции</label>
            <input
              v-model="formData.title"
              type="text"
              required
              placeholder="Введите название акции"
            >
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea
              v-model="formData.description"
              required
              placeholder="Введите описание акции"
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label>URL изображения</label>
            <input
              v-model="formData.image"
              type="url"
              required
              placeholder="https://example.com/image.jpg"
            >
          </div>

          <div class="image-preview" v-if="formData.image">
            <img :src="formData.image" alt="Предпросмотр изображения">
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label>Старая цена</label>
              <input
                v-model.number="formData.old_price"
                type="number"
                required
                min="0"
                step="1"
                placeholder="0"
              >
            </div>

            <div class="form-group half">
              <label>Новая цена</label>
              <input
                v-model.number="formData.price"
                type="number"
                required
                min="0"
                step="1"
                placeholder="0"
              >
            </div>
          </div>

          <div class="form-group">
            <label>Ссылка</label>
            <input
              v-model="formData.link"
              type="text"
              required
              placeholder="/service/1 или /catalog"
            >
          </div>

          <button type="submit" class="submit-btn">
            {{ editingPromotion ? 'Сохранить' : 'Добавить' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="promotionToDelete" class="modal">
      <div class="modal-content confirm-delete">
        <h3>Подтверждение удаления</h3>
        <p>Вы действительно хотите удалить эту акцию?</p>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="promotionToDelete = null">Отмена</button>
          <button class="btn-confirm" @click="deletePromotion">Удалить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/config/supabase'

export default {
  name: 'ActionsManager',

  data() {
    return {
      promotions: [],
      showAddForm: false,
      editingPromotion: null,
      promotionToDelete: null,
      formData: {
        title: '',
        description: '',
        image: '',
        old_price: 0,
        price: 0,
        link: '/catalog'
      }
    }
  },

  mounted() {
    this.fetchPromotions()
  },

  methods: {
    async fetchPromotions() {
      try {
        const { data, error } = await supabase
          .from('promotions')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        this.promotions = data || []
      } catch (error) {
        console.error('Error fetching promotions:', error)
        this.showToast('Ошибка при загрузке акций', 'error')
      }
    },

    editPromotion(promotion) {
      this.editingPromotion = promotion
      this.formData = { ...promotion }
      this.showAddForm = true
    },

    closeForm() {
      this.showAddForm = false
      this.editingPromotion = null
      this.formData = {
        title: '',
        description: '',
        image: '',
        old_price: 0,
        price: 0,
        link: '/catalog'
      }
    },

    async handleSubmit() {
      try {
        if (!this.formData.title) {
          throw new Error('Введите название акции')
        }

        if (!this.formData.image.startsWith('http')) {
          throw new Error('URL изображения должен начинаться с http:// или https://')
        }

        const promotionData = {
          title: this.formData.title,
          description: this.formData.description,
          image: this.formData.image,
          old_price: this.formData.old_price || 0,
          price: this.formData.price || 0,
          link: this.formData.link || '/catalog'
        }

        if (this.editingPromotion) {
          const { error } = await supabase
            .from('promotions')
            .update(promotionData)
            .eq('id', this.editingPromotion.id)

          if (error) throw error
          this.showToast('Акция успешно обновлена', 'success')
        } else {
          const { error } = await supabase
            .from('promotions')
            .insert([promotionData])

          if (error) throw error
          this.showToast('Новая акция добавлена', 'success')
        }

        await this.fetchPromotions()
        this.closeForm()
      } catch (error) {
        console.error('Error submitting promotion:', error)
        this.showToast(error.message || 'Ошибка при сохранении акции', 'error')
      }
    },

    confirmDelete(promotionId) {
      this.promotionToDelete = promotionId
    },

    async deletePromotion() {
      try {
        const { error } = await supabase
          .from('promotions')
          .delete()
          .eq('id', this.promotionToDelete)

        if (error) throw error

        this.promotionToDelete = null
        await this.fetchPromotions()
        this.showToast('Акция удалена', 'success')
      } catch (error) {
        console.error('Error deleting promotion:', error)
        this.showToast('Ошибка при удалении акции', 'error')
      }
    },

    formatPrice(price) {
      if (price === null || price === undefined) return '-'
      return `${Number(price).toLocaleString('ru-RU')} руб`
    },

    showToast(message, type) {
      if (this.$root.$refs.toast) {
        this.$root.$refs.toast.showToast(message, type)
      } else {
        alert(message)
      }
    }
  }
}
</script>

<style scoped>
.actions-manager {
  padding: 1.5rem;
  width: 100%;
}

.actions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.actions-header h2 {
  color: var(--text-primary);
  margin: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--accent-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: var(--transition-standard);
}

.add-btn:hover {
  background: var(--accent-secondary);
}

.actions-table-container {
  overflow-x: auto;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
}

.actions-table {
  width: 100%;
  border-collapse: collapse;
}

.actions-table th,
.actions-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.actions-table th {
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-weight: 500;
}

.image-cell {
  width: 80px;
}

.thumb-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.link-cell {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  white-space: nowrap;
}

.edit-btn, .delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: var(--transition-standard);
}

.edit-btn {
  color: var(--info-color);
}

.delete-btn {
  color: var(--error-color);
}

.edit-btn:hover, .delete-btn:hover {
  background: var(--bg-elevated);
}

.no-data {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem !important;
}

/* Модальное окно */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--card-shadow);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1.5rem;
  transition: var(--transition-standard);
}

.close-btn:hover {
  color: var(--text-primary);
}

/* Форма */
.promotion-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group.half {
  flex: 1;
}

.form-group label {
  color: var(--text-primary);
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.image-preview {
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
  object-fit: contain;
}

.submit-btn {
  background: var(--accent-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: var(--transition-standard);
  margin-top: 1rem;
}

.submit-btn:hover {
  background: var(--accent-secondary);
}

/* Подтверждение удаления */
.confirm-delete {
  text-align: center;
  max-width: 400px;
}

.confirm-delete h3 {
  margin-bottom: 1rem;
}

.confirm-delete p {
  margin-bottom: 2rem;
  color: var(--text-secondary);
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-cancel,
.btn-confirm {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: var(--transition-standard);
}

.btn-cancel {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.btn-confirm {
  background: var(--error-color);
  color: white;
}

.btn-cancel:hover {
  background: var(--bg-secondary-hover);
}

.btn-confirm:hover {
  background: var(--error-color-hover);
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 1.5rem;
  }

  .actions-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .modal-content {
    padding: 1.5rem;
    width: 95%;
  }
}
</style>
