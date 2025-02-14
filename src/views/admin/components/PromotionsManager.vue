<template>
  <div class="promotions-manager">
    <div class="header">
      <h2>Управление акциями</h2>
      <button class="btn-primary" @click="showAddForm = true">Добавить акцию</button>
    </div>

    <div class="promotions-list">
      <div v-for="promo in promotions" :key="promo.id" class="promotion-item">
        <img :src="promo.image" :alt="promo.title" class="promo-image" />
        <div class="promo-info">
          <h3>{{ promo.title }}</h3>
          <p>{{ promo.description }}</p>
          <div class="price-info" v-if="promo.price">
            <span>Старая цена: {{ promo.old_price }} ₽</span>
            <span>Новая цена: {{ promo.price }} ₽</span>
          </div>
        </div>
        <div class="actions">
          <button class="btn-edit" @click="editPromotion(promo)">Редактировать</button>
          <button class="btn-delete" @click="confirmDelete(promo)">Удалить</button>
        </div>
      </div>
    </div>

    <!-- Модальное окно добавления/редактирования акции -->
    <div v-if="showAddForm" class="modal">
      <div class="modal-content">
        <button class="close-button" @click="closeForm">&times;</button>
        <h2>{{ editingPromo ? 'Редактировать акцию' : 'Добавить акцию' }}</h2>
        <form @submit.prevent="savePromotion" class="promotion-form">
          <div class="form-group">
            <label>Название акции</label>
            <input v-model="form.title" required />
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="form.description" rows="4" required></textarea>
          </div>

          <div class="form-group">
            <label>Изображение</label>
            <input type="file" @change="handleImageUpload" accept="image/*" required />
          </div>

          <div class="form-group">
            <label>Ссылка</label>
            <input
              v-model="form.link"
              placeholder="Например: /services/1 или /catalog?category=loaders"
            />
            <small class="help-text">
              Укажите ссылку на страницу, куда будет вести акция при клике. Если оставить пустым,
              акция будет просто информационной.
            </small>
          </div>

          <div class="form-group">
            <label>Старая цена (₽)</label>
            <input type="number" v-model.number="form.old_price" min="0" />
          </div>

          <div class="form-group">
            <label>Новая цена (₽)</label>
            <input type="number" v-model.number="form.price" min="0" />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary">
              {{ editingPromo ? 'Сохранить' : 'Добавить' }}
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
        <p>Вы действительно хотите удалить акцию "{{ promoToDelete?.title }}"?</p>
        <div class="confirm-actions">
          <button class="btn-danger" @click="deletePromotion">Удалить</button>
          <button class="btn-secondary" @click="showDeleteConfirm = false">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/config/supabase'

export default {
  name: 'PromotionsManager',
  data() {
    return {
      promotions: [],
      showAddForm: false,
      showDeleteConfirm: false,
      editingPromo: null,
      promoToDelete: null,
      form: {
        title: '',
        description: '',
        image: '',
        link: '',
        old_price: 0,
        price: 0,
      },
    }
  },
  methods: {
    resetForm() {
      this.form = {
        title: '',
        description: '',
        image: '',
        link: '',
        old_price: 0,
        price: 0,
      }
      this.editingPromo = null
    },
    closeForm() {
      this.showAddForm = false
      this.resetForm()
    },
    async handleImageUpload(event) {
      try {
        const file = event.target.files[0]
        if (!file) return

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `promotions/${fileName}`

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
        this.form.image = data.publicUrl
      } catch (error) {
        console.error('Upload error:', error)
        this.showToast(error.message || 'Ошибка при загрузке изображения', 'error')
      }
    },
    async savePromotion() {
      try {
        if (this.editingPromo) {
          const { error } = await supabase
            .from('promotions')
            .update(this.form)
            .eq('id', this.editingPromo.id)

          if (error) throw error
        } else {
          const { error } = await supabase.from('promotions').insert([this.form])
          if (error) throw error
        }

        this.showToast(`Акция успешно ${this.editingPromo ? 'обновлена' : 'добавлена'}`, 'success')
        this.closeForm()
        this.fetchPromotions()
      } catch (error) {
        console.error('Save error:', error)
        this.showToast('Ошибка при сохранении акции', 'error')
      }
    },
    editPromotion(promo) {
      this.editingPromo = promo
      this.form = { ...promo }
      this.showAddForm = true
    },
    confirmDelete(promo) {
      this.promoToDelete = promo
      this.showDeleteConfirm = true
    },
    async deletePromotion() {
      try {
        const { error } = await supabase.from('promotions').delete().eq('id', this.promoToDelete.id)

        if (error) throw error

        this.showToast('Акция успешно удалена', 'success')
        this.showDeleteConfirm = false
        this.promoToDelete = null
        this.fetchPromotions()
      } catch (error) {
        console.error('Delete error:', error)
        this.showToast('Ошибка при удалении акции', 'error')
      }
    },
    async fetchPromotions() {
      try {
        const { data, error } = await supabase.from('promotions').select('*')
        if (error) throw error
        this.promotions = data
      } catch (error) {
        console.error('Ошибка при загрузке акций:', error)
        this.showToast('Ошибка при загрузке акций', 'error')
      }
    },
  },
  async created() {
    await this.fetchPromotions()
  },
  inject: ['showToast'],
}
</script>

<style scoped>
.promotions-manager {
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.promotions-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.promotion-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.promo-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.promo-info {
  padding: 1rem;
}

.price-info {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.actions {
  display: flex;
  padding: 1rem;
  gap: 1rem;
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
  transition: color 0.3s ease;
}

.close-button:hover {
  color: #ffffff;
}

.promotion-form {
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
  color: #ffffff;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  padding: 0.5rem;
  background: #404040;
  border: 1px solid #404040;
  border-radius: 4px;
  color: #ffffff;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1db954;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #b3b3b3;
}

.help-text {
  font-size: 0.875rem;
  color: #b3b3b3;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-primary {
  background: #1db954;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-primary:hover {
  background: #1ed760;
}

.btn-secondary {
  background: #404040;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-secondary:hover {
  background: #505050;
}

/* Стили для скроллбара */
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

/* Стили для input[type="file"] */
.form-group input[type="file"] {
  background: transparent;
  padding: 0;
  border: none;
  color: #b3b3b3;
}

.form-group input[type="file"]::-webkit-file-upload-button {
  background: #404040;
  color: #ffffff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 1rem;
  transition: background 0.3s ease;
}

.form-group input[type="file"]::-webkit-file-upload-button:hover {
  background: #505050;
}

/* Стили для диалога подтверждения */
.confirm-dialog {
  text-align: center;
}

.confirm-dialog p {
  margin: 1rem 0;
  color: #b3b3b3;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-danger {
  background: #e91429;
  color: white;
}

.btn-danger:hover {
  background: #ff1430;
}
</style>
