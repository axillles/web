import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ServicesManager from '@/views/admin/components/ServicesManager.vue'

const mockShowToast = vi.fn()

describe('ServicesManager', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(ServicesManager, {
      global: {
        provide: {
          showToast: mockShowToast
        }
      }
    })
  })

  describe('Component Rendering', () => {
    it('renders the component correctly', () => {
      expect(wrapper.find('.services-manager').exists()).toBe(true)
      expect(wrapper.find('.services-header h2').text()).toBe('Управление услугами')
      expect(wrapper.find('.add-btn').exists()).toBe(true)
    })

    it('renders filters correctly', () => {
      expect(wrapper.find('.filters-container').exists()).toBe(true)
      expect(wrapper.find('.search-container').exists()).toBe(true)
      expect(wrapper.find('.categories').exists()).toBe(true)
      expect(wrapper.find('.sort-controls').exists()).toBe(true)
    })

    it('shows all category buttons', () => {
      const categoryButtons = wrapper.findAll('.category-button')
      expect(categoryButtons).toHaveLength(4) // Все услуги, Грузчики, Транспорт, Готовые комплексы
    })
  })

  describe('Search and Filtering', () => {
    it('filters services by search query', async () => {
      wrapper.vm.services = [
        { id: 1, title: 'Грузчики', description: 'Услуги грузчиков' },
        { id: 2, title: 'Транспорт', description: 'Услуги транспорта' }
      ]
      wrapper.vm.searchQuery = 'грузчики'
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.filteredAndSortedServices).toHaveLength(1)
      expect(wrapper.vm.filteredAndSortedServices[0].title).toBe('Грузчики')
    })

    it('filters services by category', async () => {
      wrapper.vm.services = [
        { id: 1, title: 'Грузчики', category: 'loaders' },
        { id: 2, title: 'Транспорт', category: 'transport' }
      ]
      wrapper.vm.selectedCategory = 'loaders'
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.filteredAndSortedServices).toHaveLength(1)
      expect(wrapper.vm.filteredAndSortedServices[0].category).toBe('loaders')
    })
  })

  describe('Sorting', () => {
    beforeEach(() => {
      wrapper.vm.services = [
        { id: 1, title: 'Услуга B', price: 200 },
        { id: 2, title: 'Услуга A', price: 100 },
        { id: 3, title: 'Услуга C', price: 300 }
      ]
    })

    it('sorts by price ascending', async () => {
      wrapper.vm.sortBy = 'price_asc'
      await wrapper.vm.$nextTick()

      const sorted = wrapper.vm.filteredAndSortedServices
      expect(sorted[0].price).toBe(100)
      expect(sorted[1].price).toBe(200)
      expect(sorted[2].price).toBe(300)
    })

    it('sorts by price descending', async () => {
      wrapper.vm.sortBy = 'price_desc'
      await wrapper.vm.$nextTick()

      const sorted = wrapper.vm.filteredAndSortedServices
      expect(sorted[0].price).toBe(300)
      expect(sorted[1].price).toBe(200)
      expect(sorted[2].price).toBe(100)
    })

    it('sorts by name ascending', async () => {
      wrapper.vm.sortBy = 'name_asc'
      await wrapper.vm.$nextTick()

      const sorted = wrapper.vm.filteredAndSortedServices
      expect(sorted[0].title).toBe('Услуга A')
      expect(sorted[1].title).toBe('Услуга B')
      expect(sorted[2].title).toBe('Услуга C')
    })
  })

  describe('Modal Functionality', () => {
    it('opens modal when add button is clicked', async () => {
      await wrapper.find('.add-btn').trigger('click')
      expect(wrapper.vm.showAddForm).toBe(true)
      expect(wrapper.find('.modal').exists()).toBe(true)
    })

    it('closes modal when close button is clicked', async () => {
      wrapper.vm.showAddForm = true
      await wrapper.vm.$nextTick()

      await wrapper.find('.close-btn').trigger('click')
      expect(wrapper.vm.showAddForm).toBe(false)
    })
  })

  describe('Form Validation', () => {
    beforeEach(async () => {
      await wrapper.find('.add-btn').trigger('click')
    })

    it('validates required fields', async () => {
      const form = wrapper.find('.service-form')
      await form.trigger('submit')

      expect(mockShowToast).toHaveBeenCalledWith('Введите название услуги', 'error')
    })

    it('validates price field', async () => {
      wrapper.vm.formData.title = 'Test Service'
      wrapper.vm.formData.description = 'Test Description'
      wrapper.vm.formData.price = -1

      const form = wrapper.find('.service-form')
      await form.trigger('submit')

      expect(mockShowToast).toHaveBeenCalledWith('Цена должна быть положительным числом', 'error')
    })
  })

  describe('Image Upload', () => {
    it('handles file upload correctly', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const input = wrapper.find('input[type="file"]')

      await input.trigger('change', { target: { files: [file] } })

      expect(wrapper.vm.isUploading).toBe(true)
    })

    it('validates file size', async () => {
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
      const input = wrapper.find('input[type="file"]')

      await input.trigger('change', { target: { files: [largeFile] } })

      expect(mockShowToast).toHaveBeenCalledWith('Размер файла не должен превышать 5MB', 'error')
    })
  })

  describe('Utility Functions', () => {
    it('truncates description correctly', () => {
      const longDescription = 'A'.repeat(200)
      const truncated = wrapper.vm.truncatedDescription(longDescription)

      expect(truncated.length).toBeLessThanOrEqual(100)
      expect(truncated).toContain('...')
    })

    it('gets category name correctly', () => {
      expect(wrapper.vm.getCategoryName('loaders')).toBe('Грузчики')
      expect(wrapper.vm.getCategoryName('transport')).toBe('Транспорт')
      expect(wrapper.vm.getCategoryName('combos')).toBe('Готовые комплексы')
      expect(wrapper.vm.getCategoryName('unknown')).toBe('Неизвестно')
    })
  })

  describe('Delete Confirmation', () => {
    it('shows delete confirmation modal', async () => {
      wrapper.vm.services = [{ id: 1, title: 'Test Service' }]
      await wrapper.vm.$nextTick()

      const deleteBtn = wrapper.find('.delete-btn')
      await deleteBtn.trigger('click')

      expect(wrapper.vm.serviceToDelete).toBeTruthy()
      expect(wrapper.find('.confirm-delete').exists()).toBe(true)
    })
  })
})
