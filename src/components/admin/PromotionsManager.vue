<template>
  <div class="promotions-manager">
    <div class="header">
      <h2>Управление акциями</h2>
      <button class="btn-add" @click="showAddForm = true">Добавить акцию</button>
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
          <button class="btn-edit" @click="editPromotion(promo)">Редактировать</button>
          <button class="btn-delete" @click="deletePromotion(promo.id)">Удалить</button>
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
            <input v-model="promoForm.title" type="text" required />
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="promoForm.description" required></textarea>
          </div>

          <div class="form-group">
            <label>Изображение</label>
            <input type="file" @change="handleImageUpload" accept="image/*" />
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

      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `promotions/${fileName}`

        const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file)

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('images').getPublicUrl(filePath)
        this.promoForm.image = data.publicUrl
      } catch (error) {
        this.showToast('Ошибка при загрузке изображения', 'error')
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
  color: #ffffff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-add {
  background: #1db954;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-add:hover {
  background: #1ed760;
}

.promotion-item {
  display: grid;
  grid-template-columns: 200px 1fr auto;
  gap: 1rem;
  padding: 1rem;
  background: #282828;
  border: 1px solid #404040;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: transform 0.3s ease;
}

.promotion-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.promo-image {
  width: 200px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.promo-info {
  color: #ffffff;
}

.promo-info h3 {
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.promo-info p {
  color: #b3b3b3;
}

.price-info {
  margin-top: 0.5rem;
  color: #1db954;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
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
}

.modal-content {
  background: #282828;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-save {
  background: #1db954;
  color: white;
}

.btn-save:hover {
  background: #1ed760;
}

.btn-cancel {
  background: #404040;
  color: white;
}

.btn-cancel:hover {
  background: #505050;
}

.btn-save,
.btn-cancel {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
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
</style>
