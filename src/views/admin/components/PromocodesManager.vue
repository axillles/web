<template>
  <div class="promocodes-manager">
    <div class="header">
      <h2>Управление промокодами</h2>
      <button class="btn-primary" @click="showAddForm = true">Добавить промокод</button>
    </div>

    <div class="promocodes-list">
      <div v-for="promo in promocodes" :key="promo.id" class="promocode-item">
        <div class="promo-info">
          <h3>{{ promo.code }}</h3>
          <div class="promo-details">
            <span class="discount">-{{ promo.discount_percent }}%</span>
            <span v-if="promo.max_discount" class="max-discount">
              макс. {{ promo.max_discount }}₽
            </span>
            <span v-if="promo.min_order_amount" class="min-amount">
              мин. заказ {{ promo.min_order_amount }}₽
            </span>
          </div>
          <div class="promo-status">
            <span v-if="promo.uses_left !== null">
              Осталось использований: {{ promo.uses_left }}
            </span>
            <span v-if="promo.expires_at">
              Действует до: {{ formatDate(promo.expires_at) }}
            </span>
          </div>
        </div>
        <div class="actions">
          <button class="btn-edit" @click="editPromocode(promo)">Редактировать</button>
          <button class="btn-delete" @click="confirmDelete(promo)">Удалить</button>
        </div>
      </div>
    </div>

    <!-- Модальное окно добавления/редактирования промокода -->
    <div v-if="showAddForm" class="modal">
      <div class="modal-content">
        <button class="close-button" @click="closeForm">&times;</button>
        <h2>{{ editingPromo ? 'Редактировать промокод' : 'Добавить промокод' }}</h2>
        <form @submit.prevent="savePromocode" class="promocode-form">
          <div class="form-group">
            <label>Код</label>
            <input
              v-model="form.code"
              placeholder="Например: SUMMER2024"
              :disabled="editingPromo"
              required
            />
          </div>

          <div class="form-group">
            <label>Скидка (%)</label>
            <input
              v-model.number="form.discount_percent"
              type="number"
              min="1"
              max="100"
              required
            />
          </div>

          <div class="form-group">
            <label>Максимальная скидка (₽)</label>
            <input
              v-model.number="form.max_discount"
              type="number"
              min="0"
              placeholder="Без ограничений"
            />
          </div>

          <div class="form-group">
            <label>Минимальная сумма заказа (₽)</label>
            <input
              v-model.number="form.min_order_amount"
              type="number"
              min="0"
              placeholder="Без ограничений"
            />
          </div>

          <div class="form-group">
            <label>Количество использований</label>
            <input
              v-model.number="form.uses_left"
              type="number"
              min="1"
              placeholder="Без ограничений"
            />
          </div>

          <div class="form-group">
            <label>Действует до</label>
            <input
              v-model="form.expires_at"
              type="datetime-local"
              :min="minDate"
            />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary">
              {{ editingPromo ? 'Сохранить' : 'Добавить' }}
            </button>
            <button type="button" class="btn-secondary" @click="closeForm">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteConfirm" class="modal">
      <div class="modal-content confirm-dialog">
        <h2>Подтверждение удаления</h2>
        <p>Вы действительно хотите удалить промокод "{{ promoToDelete?.code }}"?</p>
        <div class="confirm-actions">
          <button class="btn-danger" @click="deletePromocode">Удалить</button>
          <button class="btn-secondary" @click="showDeleteConfirm = false">Отмена</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/config/supabase'

export default {
  name: 'PromocodesManager',
  data() {
    return {
      promocodes: [],
      showAddForm: false,
      showDeleteConfirm: false,
      editingPromo: null,
      promoToDelete: null,
      form: {
        code: '',
        discount_percent: 10,
        max_discount: null,
        min_order_amount: null,
        uses_left: null,
        expires_at: null
      }
    }
  },
  computed: {
    minDate() {
      const now = new Date()
      return now.toISOString().slice(0, 16)
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleString()
    },
    resetForm() {
      this.form = {
        code: '',
        discount_percent: 10,
        max_discount: null,
        min_order_amount: null,
        uses_left: null,
        expires_at: null
      }
      this.editingPromo = null
    },
    closeForm() {
      this.showAddForm = false
      this.resetForm()
    },
    editPromocode(promo) {
      this.editingPromo = promo
      this.form = {
        ...promo,
        expires_at: promo.expires_at ? new Date(promo.expires_at).toISOString().slice(0, 16) : null
      }
      this.showAddForm = true
    },
    confirmDelete(promo) {
      this.promoToDelete = promo
      this.showDeleteConfirm = true
    },
    async savePromocode() {
      try {
        const promoData = {
          ...this.form,
          code: this.form.code.toUpperCase()
        }

        if (this.editingPromo) {
          const { error } = await supabase
            .from('promocodes')
            .update(promoData)
            .eq('id', this.editingPromo.id)

          if (error) throw error
          this.showToast('Промокод успешно обновлен', 'success')
        } else {
          const { error } = await supabase
            .from('promocodes')
            .insert([promoData])

          if (error) throw error
          this.showToast('Промокод успешно создан', 'success')
        }

        this.closeForm()
        this.fetchPromocodes()
      } catch (error) {
        console.error('Save error:', error)
        this.showToast(error.message || 'Ошибка при сохранении промокода', 'error')
      }
    },
    async deletePromocode() {
      try {
        const { error } = await supabase
          .from('promocodes')
          .delete()
          .eq('id', this.promoToDelete.id)

        if (error) throw error

        this.showToast('Промокод успешно удален', 'success')
        this.showDeleteConfirm = false
        this.promoToDelete = null
        this.fetchPromocodes()
      } catch (error) {
        console.error('Delete error:', error)
        this.showToast('Ошибка при удалении промокода', 'error')
      }
    },
    async fetchPromocodes() {
      try {
        const { data, error } = await supabase
          .from('promocodes')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        this.promocodes = data
      } catch (error) {
        console.error('Ошибка при загрузке промокодов:', error)
        this.showToast('Ошибка при загрузке промокодов', 'error')
      }
    }
  },
  async created() {
    await this.fetchPromocodes()
  },
  inject: ['showToast']
}
</script>

<style scoped>
.promocodes-manager {
  padding: 2rem;
  color: #ffffff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.promocodes-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.promocode-item {
  background: #282828;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.promocode-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.promo-info {
  padding: 1.5rem;
}

.promo-info h3 {
  color: #1db954;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.promo-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.discount {
  color: #1db954;
  font-weight: bold;
}

.max-discount, .min-amount {
  color: #b3b3b3;
}

.promo-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: #b3b3b3;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  padding: 1rem;
  gap: 1rem;
  background: #323232;
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

.btn-edit {
  flex: 1;
  background: #1db954;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-edit:hover {
  background: #1ed760;
}

.btn-delete {
  flex: 1;
  background: #e91429;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
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
  z-index: 1000;
}

.modal-content {
  background: #282828;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
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

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #404040;
  border-radius: 4px;
  background: #404040;
  color: #ffffff;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #1db954;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.confirm-dialog {
  text-align: center;
  padding: 2rem;
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
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-danger:hover {
  background: #ff1430;
}
</style>
