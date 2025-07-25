<template>
  <div class="promotions-manager">
    <div class="promotions-header">
      <h2>Управление промокодами</h2>
      <button class="add-btn" @click="showAddForm = true">
        <span class="material-icons">add</span>
        Добавить промокод
      </button>
    </div>

    <div class="promotions-table-container">
      <table class="promotions-table">
        <thead>
          <tr>
            <th>Код</th>
            <th>Скидка</th>
            <th>Мин. сумма</th>
            <th>Макс. скидка</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="promo in promocodes" :key="promo.id">
            <td>{{ promo.code }}</td>
            <td>{{ promo.discount_percent }}%</td>
            <td>{{ formatPrice(promo.min_order_amount) }}</td>
            <td>{{ formatPrice(promo.max_discount) }}</td>
            <td class="actions">
              <button class="edit-btn" @click="editPromo(promo)">
                <span class="material-icons">edit</span>
              </button>
              <button class="delete-btn" @click="confirmDelete(promo.id)">
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
          <tr v-if="promocodes.length === 0">
            <td colspan="5" class="no-data">Нет промокодов</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно добавления/редактирования -->
    <div v-if="showAddForm || editingPromo" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingPromo ? 'Редактировать промокод' : 'Добавить промокод' }}</h3>
          <button class="close-btn" @click="closeForm">
            <span class="material-icons">close</span>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="promo-form">
          <div class="form-group">
            <label>Промокод</label>
            <input
              v-model="formData.code"
              type="text"
              required
              placeholder="Введите код"
              pattern="[A-Za-z0-9]+"
              title="Только буквы и цифры"
              :maxlength="10"
              style="text-transform: uppercase"
            >
          </div>

          <div class="form-group">
            <label>Процент скидки</label>
            <input
              v-model.number="formData.discount_percent"
              type="number"
              required
              min="1"
              max="100"
              step="1"
            >
          </div>

          <div class="form-group">
            <label>Минимальная сумма заказа</label>
            <input
              v-model.number="formData.min_order_amount"
              type="number"
              required
              min="0"
              step="1"
            >
          </div>

          <div class="form-group">
            <label>Максимальная скидка</label>
            <input
              v-model.number="formData.max_discount"
              type="number"
              required
              min="0"
              step="1"
            >
          </div>

          <button type="submit" class="submit-btn">
            {{ editingPromo ? 'Сохранить' : 'Добавить' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="promoToDelete" class="modal">
      <div class="modal-content confirm-delete">
        <h3>Подтверждение удаления</h3>
        <p>Вы действительно хотите удалить этот промокод?</p>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="promoToDelete = null">Отмена</button>
          <button class="btn-confirm" @click="deletePromo">Удалить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabaseClient'

export default {
  name: 'PromotionsManager',

  data() {
    return {
      promocodes: [],
      showAddForm: false,
      editingPromo: null,
      promoToDelete: null,
      formData: {
        code: '',
        discount_percent: 10,
        min_order_amount: 1,
        max_discount: 5000
      }
    }
  },

  mounted() {
    this.fetchPromocodes()
  },

  methods: {
    async fetchPromocodes() {
      try {
        const { data, error } = await supabase
          .from('promocodes')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        this.promocodes = data || []
      } catch (error) {
        console.error('Error fetching promocodes:', error)
        this.showToast('Ошибка при загрузке промокодов', 'error')
      }
    },

    editPromo(promo) {
      this.editingPromo = promo
      this.formData = { ...promo }
      this.showAddForm = true
    },

    closeForm() {
      this.showAddForm = false
      this.editingPromo = null
      this.formData = {
        code: '',
        discount_percent: 10,
        min_order_amount: 1000,
        max_discount: 5000
      }
    },

    async handleSubmit() {
      try {
        if (!this.formData.code) {
          throw new Error('Введите код промокода')
        }

        const promoData = {
          code: this.formData.code.toUpperCase(),
          discount_percent: this.formData.discount_percent || 0,
          min_order_amount: this.formData.min_order_amount || 0,
          max_discount: this.formData.max_discount || 0
        }

        if (this.editingPromo) {
          const { error } = await supabase
            .from('promocodes')
            .update(promoData)
            .eq('id', this.editingPromo.id)

          if (error) throw error
          this.showToast('Промокод успешно обновлен', 'success')
        } else {
          // Проверяем, не существует ли уже такой код
          const { data: existingPromo } = await supabase
            .from('promocodes')
            .select('id')
            .eq('code', promoData.code)
            .single()

          if (existingPromo) {
            throw new Error('Такой промокод уже существует')
          }

          const { error } = await supabase
            .from('promocodes')
            .insert([promoData])

          if (error) throw error
          this.showToast('Новый промокод добавлен', 'success')
        }

        await this.fetchPromocodes()
        this.closeForm()
      } catch (error) {
        console.error('Error submitting promocode:', error)
        this.showToast(error.message || 'Ошибка при сохранении промокода', 'error')
      }
    },

    confirmDelete(promoId) {
      this.promoToDelete = promoId
    },

    async deletePromo() {
      try {
        const { error } = await supabase
          .from('promocodes')
          .delete()
          .eq('id', this.promoToDelete)

        if (error) throw error

        this.promoToDelete = null
        await this.fetchPromocodes()
        this.showToast('Промокод удален', 'success')
      } catch (error) {
        console.error('Error deleting promocode:', error)
        this.showToast('Ошибка при удалении промокода', 'error')
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
.promotions-manager {
  padding: 1.5rem;
  width: 100%;
}

.promotions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.promotions-header h2 {
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

.promotions-table-container {
  overflow-x: auto;
  background: var(--bg-secondary);
  border-radius: 8px;
  box-shadow: var(--card-shadow);
}

.promotions-table {
  width: 100%;
  border-collapse: collapse;
}

.promotions-table th,
.promotions-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.promotions-table th {
  background: var(--bg-elevated);
  color: var(--text-primary);
  font-weight: 500;
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
.promo-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--text-primary);
  font-weight: 500;
}

.form-group input {
  padding: 0.75rem;
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-primary);
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
  .promotions-header {
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
