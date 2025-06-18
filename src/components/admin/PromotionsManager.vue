<template>
  <div class="promotions-manager">
    <div class="header">
      <h2>Управление акциями</h2>
      <button class="btn-add" @click="showAddForm = true">
        <span class="material-icons">add</span>
        Добавить акцию
      </button>
    </div>

    <div class="promotions-list">
      <div v-for="promo in promotions" :key="promo.id" class="promotion-item">
        <img :src="promo.image" :alt="promo.title" class="promo-image" />
        <div class="promo-info">
          <h3>{{ promo.title }}</h3>
          <p>{{ promo.description }}</p>
          <div class="price-info" v-if="promo.price">
            <span>Старая цена: {{ promo.oldPrice }} ₽</span>
            <span>Новая цена: {{ promo.price }} ₽</span>
          </div>
        </div>
        <div class="actions">
          <button class="btn-edit" @click="editPromotion(promo)">
            <span class="material-icons">edit</span>
          </button>
          <button class="btn-delete" @click="deletePromotion(promo.id)">
            <span class="material-icons">delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно добавления/редактирования акции -->
    <div v-if="showAddForm" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ editingPromo ? 'Редактировать акцию' : 'Добавить акцию' }}</h2>
          <button class="close-button" @click="closeForm">
            <span class="material-icons">close</span>
          </button>
        </div>
        <form @submit.prevent="savePromotion" class="promotion-form">
          <div class="form-group">
            <label>Название акции</label>
            <input v-model="promoForm.title" type="text" required />
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="promoForm.description" required></textarea>
          </div>

          <div class="form-group">
            <label>Изображение</label>
            <div class="image-upload">
              <input
                type="file"
                @change="handleImageUpload"
                accept="image/*"
                :required="!editingPromo && !promoForm.image"
              >
              <small class="help-text">Максимальный размер: 5MB</small>
            </div>
            <div v-if="promoForm.image" class="image-preview">
              <img :src="promoForm.image" :alt="promoForm.title">
              <button type="button" class="remove-image" @click="removeImage">
                <span class="material-icons">close</span>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Старая цена (необязательно)</label>
            <input v-model.number="promoForm.oldPrice" type="number" min="0" />
          </div>

          <div class="form-group">
            <label>Новая цена (необязательно)</label>
            <input v-model.number="promoForm.price" type="number" min="0" />
          </div>

          <div class="form-group">
            <label>Ссылка</label>
            <input v-model="promoForm.link" type="text" required />
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeForm">Отмена</button>
            <button type="submit" class="btn-save">Сохранить</button>
          </div>
        </form>
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
      editingPromo: null,
      promoForm: {
        title: '',
        description: '',
        image: '',
        oldPrice: null,
        price: null,
        link: '',
      },
    }
  },
  methods: {
    async fetchPromotions() {
      try {
        const { data, error } = await supabase.from('promotions').select('*')
        if (error) throw error
        this.promotions = data
      } catch (error) {
        this.showToast('Ошибка при загрузке акций', 'error')
      }
    },

    async savePromotion() {
      try {
        const promoData = { ...this.promoForm }

        if (this.editingPromo) {
          const { error } = await supabase
            .from('promotions')
            .update(promoData)
            .eq('id', this.editingPromo.id)
          if (error) throw error
        } else {
          const { error } = await supabase.from('promotions').insert([promoData])
          if (error) throw error
        }

        this.showToast(`Акция успешно ${this.editingPromo ? 'обновлена' : 'добавлена'}`, 'success')
        this.closeForm()
        this.fetchPromotions()
      } catch (error) {
        this.showToast('Ошибка при сохранении акции', 'error')
      }
    },

    async deletePromotion(id) {
      if (!confirm('Вы уверены, что хотите удалить эту акцию?')) return

      try {
        const { error } = await supabase.from('promotions').delete().eq('id', id)
        if (error) throw error
        this.showToast('Акция успешно удалена', 'success')
        this.fetchPromotions()
      } catch (error) {
        this.showToast('Ошибка при удалении акции', 'error')
      }
    },

    async handleImageUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      // Проверка размера файла (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('Размер файла не должен превышать 5MB', 'error')
        return
      }

      // Проверка типа файла
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        this.showToast('Поддерживаются только форматы JPG, PNG и WEBP', 'error')
        return
      }

      try {
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
        this.promoForm.image = data.publicUrl
      } catch (error) {
        this.showToast('Ошибка при загрузке изображения', 'error')
        this.removeImage()
      }
    },

    removeImage() {
      this.promoForm.image = ''
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },

    editPromotion(promo) {
      this.editingPromo = promo
      this.promoForm = { ...promo }
      this.showAddForm = true
    },

    closeForm() {
      this.showAddForm = false
      this.editingPromo = null
      this.promoForm = {
        title: '',
        description: '',
        image: '',
        oldPrice: null,
        price: null,
        link: '',
      }
    },
  },
  created() {
    this.fetchPromotions()
  },
  inject: ['showToast'],
}
</script>

<style scoped>
.promotions-manager {
  padding: 1rem;
  color: #333333;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #1db954;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add:hover {
  background: #1ed760;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.promotion-item {
  display: grid;
  grid-template-columns: 200px 1fr auto;
  gap: 1rem;
  padding: 1rem;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.promotion-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.promo-image {
  width: 200px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.promo-info {
  color: #333333;
}

.promo-info h3 {
  color: #1db954;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.promo-info p {
  color: #666666;
  line-height: 1.5;
}

.price-info {
  margin-top: 0.5rem;
  display: flex;
  gap: 1rem;
  color: #666666;
}

.price-info span {
  font-size: 0.9rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-edit, .btn-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit {
  background: #1db954;
  color: white;
}

.btn-edit:hover {
  background: #1ed760;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-delete {
  background: #ff4444;
  color: white;
}

.btn-delete:hover {
  background: #ff6666;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666666;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: #f5f5f5;
  color: #333333;
}

.promotion-form {
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333333;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #ffffff;
  color: #333333;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1db954;
  box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.1);
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  background: #f5f5f5;
  color: #666666;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-save {
  padding: 0.75rem 1.5rem;
  background: #1db954;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-save:hover {
  background: #1ed760;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-upload {
  margin-top: 0.5rem;
}

.image-upload input[type="file"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #ffffff;
}

.help-text {
  display: block;
  margin-top: 0.5rem;
  color: #666666;
  font-size: 0.8rem;
}

.image-preview {
  position: relative;
  margin-top: 1rem;
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

@media (max-width: 768px) {
  .promotion-item {
    grid-template-columns: 1fr;
  }

  .promo-image {
    width: 100%;
    height: 200px;
  }

  .actions {
    flex-direction: row;
    justify-content: flex-end;
  }
}
</style>
