<template>
  <div class="services-manager">
    <div class="services-header">
      <h2>Управление услугами</h2>
      <button class="add-btn" @click="showAddForm = true">
        <span class="material-icons">add</span>
        Добавить услугу
      </button>
    </div>

    <!-- Фильтры и сортировка (по аналогии с каталогом) -->
    <div class="filters-container">
      <div class="filters-content">
        <!-- Поиск -->
        <div class="search-container">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Поиск услуг..."
            class="search-input"
          >
        </div>

        <!-- Категории -->
        <div class="categories">
          <button
            v-for="category in categories"
            :key="category.id"
            :class="{ active: selectedCategory === category.id }"
            @click="selectedCategory = category.id"
            class="category-button"
          >
            {{ category.name }}
          </button>
        </div>

        <!-- Сортировка -->
        <div class="sort-controls">
          <button
            v-for="option in sortOptions"
            :key="option.value"
            :class="{ active: sortBy === option.value }"
            @click="sortBy = option.value"
            class="sort-button"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="services-grid">
      <div v-for="service in filteredAndSortedServices" :key="service.id" class="service-card">
        <img :src="service.image" :alt="service.title" class="service-image" />
        <div class="service-content">
          <h3>{{ service.title }}</h3>
          <p class="service-description">{{ truncatedDescription(service.description) }}</p>
          <div class="service-category">{{ getCategoryName(service.category) }}</div>
          <div class="service-price">{{ service.price }} руб/час</div>

          <div v-if="service.features?.length" class="service-features">
            <h4>Особенности:</h4>
            <ul>
              <li v-for="feature in service.features" :key="feature">{{ feature }}</li>
            </ul>
          </div>

          <div v-if="service.requirements?.length" class="service-requirements">
            <h4>Требования:</h4>
            <ul>
              <li v-for="req in service.requirements" :key="req">{{ req }}</li>
            </ul>
          </div>

          <div class="service-actions">
            <button class="edit-btn" @click="editService(service)">
              <span class="material-icons">edit</span>
            </button>
            <button class="delete-btn" @click="confirmDelete(service)">
              <span class="material-icons">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно добавления/редактирования -->
    <div v-if="showAddForm || editingService" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingService ? 'Редактировать услугу' : 'Добавить услугу' }}</h3>
          <button class="close-btn" @click="closeForm">
            <span class="material-icons">close</span>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="service-form">
          <div class="form-group">
            <label>Название услуги</label>
            <input
              v-model="formData.title"
              type="text"
              required
              placeholder="Введите название услуги"
            >
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea
              v-model="formData.description"
              required
              placeholder="Введите описание услуги"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Цена (руб/час)</label>
            <input
              v-model.number="formData.price"
              type="number"
              required
              min="0"
              step="1"
            >
          </div>

          <div class="form-group">
            <label>Категория услуги</label>
            <select v-model="formData.category" required>
              <option value="loaders">Грузчики</option>
              <option value="transport">Транспорт</option>
              <option value="combos">Готовые комплексы</option>
            </select>
          </div>

          <div class="form-group">
            <label>Изображение</label>
            <div class="image-upload">
              <input
                type="file"
                @change="handleImageUpload"
                accept="image/*"
                :required="!editingService && !formData.image"
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

          <button type="submit" class="submit-btn">
            {{ editingService ? 'Сохранить' : 'Добавить' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="serviceToDelete" class="modal">
      <div class="modal-content confirm-delete">
        <h3>Подтверждение удаления</h3>
        <p>Вы действительно хотите удалить эту услугу?</p>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="serviceToDelete = null">Отмена</button>
          <button class="btn-confirm" @click="deleteService">Удалить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabaseClient'

export default {
  name: 'ServicesManager',

  data() {
    return {
      services: [],
      showAddForm: false,
      editingService: null,
      serviceToDelete: null,
      formData: {
        title: '',
        description: '',
        price: 0,
        category: 'loaders',
        image: null,
        features: [],
        requirements: [],
        pricing: {}
      },
      imagePreview: null,
      searchQuery: '',
      selectedCategory: '',
      sortBy: 'price_asc',
      categories: [
        { id: '', name: 'Все услуги' },
        { id: 'loaders', name: 'Грузчики' },
        { id: 'transport', name: 'Транспорт' },
        { id: 'combos', name: 'Готовые комплексы' }
      ],
      sortOptions: [
        { value: 'price_asc', label: '↑ По цене' },
        { value: 'price_desc', label: '↓ По цене' },
        { value: 'name_asc', label: 'А-Я' },
        { value: 'name_desc', label: 'Я-А' }
      ]
    }
  },

  computed: {
    filteredAndSortedServices() {
      let filtered = [...this.services]

      // Поиск
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        filtered = filtered.filter(service =>
          service.title.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query)
        )
      }

      // Фильтрация по категории
      if (this.selectedCategory) {
        filtered = filtered.filter((service) => service.category === this.selectedCategory)
      }

      // Сортировка
      filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'price_asc':
            return a.price - b.price
          case 'price_desc':
            return b.price - a.price
          case 'name_asc':
            return a.title.localeCompare(b.title)
          case 'name_desc':
            return b.title.localeCompare(a.title)
          default:
            return 0
        }
      })

      return filtered
    }
  },

  mounted() {
    this.fetchServices()
  },

  methods: {
    truncatedDescription(description) {
      const words = description.split(' ');
      if (words.length > 10) {
        return words.slice(0, 10).join(' ') + '...';
      }
      return description;
    },

    getCategoryName(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId);
      return category ? category.name : categoryId;
    },

    async fetchServices() {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        this.services = data
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    },

    editService(service) {
      this.editingService = service
      this.formData = {
        title: service.title,
        description: service.description,
        price: service.price,
        category: service.category,
        image: service.image,
        features: service.features || [],
        requirements: service.requirements || [],
        pricing: service.pricing || {}
      }
      this.showAddForm = true
    },

    closeForm() {
      this.showAddForm = false
      this.editingService = null
      this.formData = {
        title: '',
        description: '',
        price: 0,
        category: 'loaders',
        image: null,
        features: [],
        requirements: [],
        pricing: {}
      }
    },

    async handleImageUpload(event) {
      try {
        const file = event.target.files[0]
        if (!file) return

        // Проверяем размер файла (не более 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Размер файла не должен превышать 5MB')
          event.target.value = ''
          return
        }

        // Проверяем тип файла
        if (!file.type.startsWith('image/')) {
          alert('Пожалуйста, загрузите изображение')
          event.target.value = ''
          return
        }

        // Создаем уникальное имя файла
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${fileName}`

        // Загружаем файл
        const { error: uploadError } = await supabase.storage
          .from('services')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Получаем публичную ссылку
        const { data: { publicUrl } } = supabase.storage
          .from('services')
          .getPublicUrl(filePath)

        this.formData.image = publicUrl
        this.imagePreview = publicUrl
      } catch (error) {
        console.error('Error uploading image:', error)
        alert('Ошибка при загрузке изображения')
      }
    },

    async handleSubmit() {
      try {
        if (!this.formData.image && !this.editingService) {
          throw new Error('Пожалуйста, загрузите изображение')
        }

        const serviceData = {
          title: this.formData.title,
          description: this.formData.description,
          price: this.formData.price,
          category: this.formData.category,
          image: this.formData.image,
          features: this.formData.features || [],
          requirements: this.formData.requirements || [],
          status: 'active',
          updated_at: new Date().toISOString()
        }

        if (this.editingService) {
          const { error } = await supabase
            .from('services')
            .update(serviceData)
            .eq('id', this.editingService.id)

          if (error) throw error
        } else {
          const { error } = await supabase
            .from('services')
            .insert([serviceData])

          if (error) throw error
        }

        await this.fetchServices()
        this.closeForm()
      } catch (error) {
        console.error('Error submitting service:', error)
        alert(error.message || 'Ошибка при сохранении услуги')
      }
    },

    confirmDelete(service) {
      this.serviceToDelete = service
    },

    async deleteService() {
      try {
        // Если есть изображение, удаляем его из storage
        if (this.serviceToDelete.image) {
          const imagePath = this.serviceToDelete.image.split('/').pop()
          const { error: deleteImageError } = await supabase.storage
            .from('services')
            .remove([imagePath])

          if (deleteImageError) throw deleteImageError
        }

        const { error } = await supabase
          .from('services')
          .delete()
          .eq('id', this.serviceToDelete.id)

        if (error) throw error

        this.serviceToDelete = null
        await this.fetchServices()
      } catch (error) {
        console.error('Error deleting service:', error)
        alert('Ошибка при удалении услуги')
      }
    },

    removeImage() {
      this.formData.image = null
      this.imagePreview = null
    }
  }
}
</script>

<style scoped>
.services-manager {
  color: #ffffff;
  padding: 2rem;
}

.services-header {
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

/* Добавленные стили фильтрации (по аналогии с каталогом) */
.filters-container {
  margin-bottom: 2rem;
  background: #121212;
  padding: 1rem;
  border-radius: 8px;
}

.filters-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.search-container {
  width: 100%;
  max-width: 600px;
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  background: #282828;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.categories {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.category-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  background: #282828;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-button:hover {
  background: #404040;
}

.category-button.active {
  background: #1db954;
  color: white;
}

.sort-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.sort-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 50px;
  background: #282828;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.sort-button:hover {
  background: #404040;
}

.sort-button.active {
  background: #1db954;
  color: white;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.service-card {
  background: #282828;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.service-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}

.service-content {
  padding: 1.5rem;
}

.service-description {
  color: #b3b3b3;
  margin: 1rem 0;
}

.service-category {
  color: #b3b3b3;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  text-transform: capitalize;
}

.service-price {
  color: #1db954;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.service-features,
.service-requirements {
  margin-top: 1rem;
}

.service-features h4,
.service-requirements h4 {
  color: #b3b3b3;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.service-features ul,
.service-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.service-features li,
.service-requirements li {
  color: #ffffff;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.service-actions {
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
}

.edit-btn {
  background: #404040;
  color: white;
}

.delete-btn {
  background: #e91429;
  color: white;
}

.edit-btn:hover {
  background: #505050;
}

.delete-btn:hover {
  background: #ff1430;
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

.service-form {
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

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  background: #404040;
  border: 1px solid #505050;
  border-radius: 4px;
  color: white;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
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

.image-upload {
  margin-bottom: 1rem;
}

.image-preview {
  position: relative;
  margin-top: 1rem;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.remove-image {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-image:hover {
  background: rgba(233, 20, 41, 0.8);
}

@media (max-width: 768px) {
  .services-header {
    flex-direction: column;
    gap: 1rem;
  }

  .add-btn {
    width: 100%;
    justify-content: center;
  }

  .services-grid {
    grid-template-columns: 1fr;
  }

  .category-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .sort-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
