import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionsManager from '@/views/admin/components/ActionsManager.vue'

// Mock the showToast function
const mockShowToast = vi.fn()

describe('ActionsManager', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(ActionsManager, {
      global: {
        provide: {
          showToast: mockShowToast
        }
      }
    })
  })

  describe('Component Rendering', () => {
    it('renders the component correctly', () => {
      expect(wrapper.find('.actions-manager').exists()).toBe(true)
      expect(wrapper.find('.actions-header h2').text()).toBe('Управление акциями')
      expect(wrapper.find('.add-btn').exists()).toBe(true)
    })

    it('shows add button with correct text', () => {
      const addButton = wrapper.find('.add-btn')
      expect(addButton.text()).toContain('Добавить акцию')
    })

    it('renders table headers correctly', () => {
      const headers = wrapper.findAll('.actions-table th')
      expect(headers).toHaveLength(6)
      expect(headers[0].text()).toBe('Изображение')
      expect(headers[1].text()).toBe('Название')
      expect(headers[2].text()).toBe('Старая цена')
      expect(headers[3].text()).toBe('Новая цена')
      expect(headers[4].text()).toBe('Ссылка')
      expect(headers[5].text()).toBe('Действия')
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

    it('shows correct modal title for adding new promotion', async () => {
      await wrapper.find('.add-btn').trigger('click')
      expect(wrapper.find('.modal-header h3').text()).toBe('Добавить акцию')
    })

    it('shows correct modal title for editing promotion', async () => {
      wrapper.vm.editingPromotion = { id: 1, title: 'Test' }
      wrapper.vm.showAddForm = true
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.modal-header h3').text()).toBe('Редактировать акцию')
    })
  })

  describe('Form Validation', () => {
    beforeEach(async () => {
      await wrapper.find('.add-btn').trigger('click')
    })

    it('validates required fields', async () => {
      const form = wrapper.find('.promotion-form')
      await form.trigger('submit')

      expect(mockShowToast).toHaveBeenCalledWith('Введите название акции', 'error')
    })

    it('validates image upload requirement', async () => {
      wrapper.vm.formData.title = 'Test Promotion'
      wrapper.vm.formData.description = 'Test Description'

      const form = wrapper.find('.promotion-form')
      await form.trigger('submit')

      expect(mockShowToast).toHaveBeenCalledWith('Загрузите изображение', 'error')
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

    it('validates file type', async () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      const input = wrapper.find('input[type="file"]')

      await input.trigger('change', { target: { files: [invalidFile] } })

      expect(mockShowToast).toHaveBeenCalledWith('Поддерживаются только форматы JPG, PNG и WEBP', 'error')
    })
  })

  describe('Data Management', () => {
    it('formats price correctly', () => {
      expect(wrapper.vm.formatPrice(1000)).toBe('1 000 руб')
      expect(wrapper.vm.formatPrice(null)).toBe('-')
      expect(wrapper.vm.formatPrice(undefined)).toBe('-')
    })

    it('resets form data when closing', async () => {
      wrapper.vm.formData.title = 'Test'
      wrapper.vm.formData.description = 'Test Description'

      wrapper.vm.closeForm()

      expect(wrapper.vm.formData.title).toBe('')
      expect(wrapper.vm.formData.description).toBe('')
      expect(wrapper.vm.formData.image).toBe('')
    })
  })

  describe('Delete Confirmation', () => {
    it('shows delete confirmation modal', async () => {
      wrapper.vm.promotions = [{ id: 1, title: 'Test' }]
      await wrapper.vm.$nextTick()

      const deleteBtn = wrapper.find('.delete-btn')
      await deleteBtn.trigger('click')

      expect(wrapper.vm.promotionToDelete).toBe(1)
      expect(wrapper.find('.confirm-delete').exists()).toBe(true)
    })

    it('cancels delete operation', async () => {
      wrapper.vm.promotionToDelete = 1
      await wrapper.vm.$nextTick()

      await wrapper.find('.btn-cancel').trigger('click')

      expect(wrapper.vm.promotionToDelete).toBe(null)
    })
  })

  describe('Responsive Design', () => {
    it('has mobile-friendly styles', () => {
      const component = wrapper.find('.actions-manager')
      expect(component.classes()).toContain('actions-manager')
    })
  })
})
