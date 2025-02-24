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
              step="100"
            >
          </div>

          <div class="form-group">
            <label>Максимальная скидка</label>
            <input
              v-model.number="formData.max_discount"
              type="number"
              required
              min="0"
              step="100"
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
        min_order_amount: 1000,
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
        alert('Ошибка при загрузке промокодов')
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
        }

        await this.fetchPromocodes()
        this.closeForm()
      } catch (error) {
        console.error('Error submitting promocode:', error)
        alert(error.message || 'Ошибка при сохранении промокода')
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
      } catch (error) {
        console.error('Error deleting promocode:', error)
        alert('Ошибка при удалении промокода')
      }
    },

    formatPrice(price) {
      if (!price) return '0 ₽'
      return `${Number(price).toLocaleString('ru-RU')} ₽`
    }
  }
}
</script>

<style scoped>
.promotions-manager {
  color: #ffffff;
}

.promotions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #1db954;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background: #1ed760;
}

.promotions-table-container {
  background: #282828;
  border-radius: 8px;
  overflow: auto;
}

.promotions-table {
  width: 100%;
  border-collapse: collapse;
}

.promotions-table th,
.promotions-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #404040;
}

.promotions-table th {
  background: #323232;
  font-weight: 500;
  color: #b3b3b3;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn,
.delete-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #404040;
  color: white;
}

.edit-btn:hover {
  background: #505050;
}

.delete-btn:hover {
  background: #e91429;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #282828;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #404040;
}

.close-btn {
  background: none;
  border: none;
  color: #b3b3b3;
  cursor: pointer;
}

.promo-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #b3b3b3;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  background: #404040;
  border: 1px solid #505050;
  border-radius: 4px;
  color: white;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: #1db954;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background: #1ed760;
}

.confirm-delete {
  padding: 2rem;
  text-align: center;
}

.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-cancel,
.btn-confirm {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel {
  background: #404040;
  color: white;
}

.btn-confirm {
  background: #e91429;
  color: white;
}

@media (max-width: 768px) {
  .promotions-header {
    flex-direction: column;
    gap: 1rem;
  }

  .add-btn {
    width: 100%;
    justify-content: center;
  }

  .promotions-table th,
  .promotions-table td {
    padding: 0.75rem 0.5rem;
  }
}
</style>
