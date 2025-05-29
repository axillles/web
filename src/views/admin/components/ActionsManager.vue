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
            <label>Изображение</label>
            <div class="image-upload">
              <input
                type="file"
                @change="handleImageUpload"
                accept="image/*"
                :required="!editingPromotion && !formData.image"
                ref="fileInput"
              >
              <small class="help-text">Максимальный размер: 5MB</small>
            </div>
            <div v-if="formData.image" class="image-preview">
              <img :src="formData.image" :alt="formData.title">
              <button type="button" class="remove-image" @click="removeImage">
                <span class="material-icons">close</span>
              </button>
            </div>
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

          <button type="submit" class="submit-btn" :disabled="isUploading">
            {{ isUploading ? 'Загрузка...' : (editingPromotion ? 'Сохранить' : 'Добавить') }}
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
      },
      isUploading: false
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

    async handleImageUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      // Проверка размера файла (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('Размер файла не должен превышать 5MB', 'error')
        // Очищаем input
        event.target.value = null;
        return
      }

      // Проверка типа файла
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        this.showToast('Поддерживаются только форматы JPG, PNG и WEBP', 'error')
         // Очищаем input
        event.target.value = null;
        return
      }

      try {
        this.isUploading = true
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `promotions/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('images').getPublicUrl(filePath)
        this.formData.image = data.publicUrl
      } catch (error) {
        console.error('Error uploading image:', error)
        this.showToast('Ошибка при загрузке изображения', 'error')
        this.removeImage()
      } finally {
        this.isUploading = false
      }
    },
    removeImage() {
      this.formData.image = ''
      // Очищаем input type="file"
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },
    async handleSubmit() {
      try {
        if (!this.formData.title) {
          throw new Error('Введите название акции')
        }
        if (!this.formData.image) {
          throw new Error('Загрузите изображение')
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
  color: #333333;
}

.actions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.actions-header h2 {
  color: #1db954;
  margin: 0;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #1db954;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background: #1ed760;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.actions-table-container {
  overflow-x: auto;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e0e0;
}

.actions-table {
  width: 100%;
  border-collapse: collapse;
}

.actions-table th,
.actions-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.actions-table th {
  background: #f5f5f5;
  color: #333333;
  font-weight: 500;
}

.actions-table td {
    color: #333333;
}

.image-cell {
  width: 80px;
}

.thumb-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.edit-btn {
  color: #1db954;
}

.delete-btn {
  color: #ff4444;
}

.edit-btn:hover, .delete-btn:hover {
  background: #e0e0e0;
}

.no-data {
  text-align: center;
  color: #666666;
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
  background: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  margin: 0;
  color: #333333;
}

.close-btn {
  background: none;
  border: none;
  color: #666666;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333333;
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
  color: #333333;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  color: #333333;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1db954;
  box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.1);
}

.image-upload input[type="file"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #f9f9f9;
  color: #333333;
}

.help-text {
  display: block;
  margin-top: 0.5rem;
  color: #666666;
  font-size: 0.8rem;
}

.image-preview {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ff4444;
  transition: all 0.3s ease;
}

.remove-image:hover {
  background: #ff4444;
  color: white;
}

.submit-btn {
  background: #1db954;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.submit-btn:hover {
  background: #1ed760;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.submit-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Подтверждение удаления */
.confirm-delete {
  text-align: center;
  max-width: 400px;
}

.confirm-delete h3 {
  margin-bottom: 1rem;
  color: #333333;
}

.confirm-delete p {
  margin-bottom: 2rem;
  color: #666666;
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
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666666;
}

.btn-confirm {
  background: #ff4444;
  color: white;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-confirm:hover {
  background: #ff6666;
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

  .actions-table th,
  .actions-table td {
    padding: 0.75rem;
  }

  .image-cell {
    width: 60px;
  }

  .thumb-image {
    width: 50px;
    height: 50px;
  }
}
</style>
