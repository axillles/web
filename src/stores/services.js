import { defineStore } from 'pinia'
import { supabase } from '@/config/supabase'

export const useServicesStore = defineStore('services', {
  state: () => ({
    services: [],
    currentService: null,
    loading: false,
    error: null,
  }),

  actions: {
    setError(error) {
      this.error = error?.message || 'Произошла ошибка'
    },

    async fetchServices() {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase.from('services').select('*').order('id')

        if (error) throw error

        this.services = data
        return data
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchServiceById(id) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from('services')
          .select(
            `
            *,
            pricing:service_pricing (
              type,
              price
            )
          `,
          )
          .eq('id', id)
          .single()

        if (error) throw error

        // Преобразуем массив цен в объект для совместимости
        if (data) {
          data.pricing = data.pricing.reduce((acc, item) => {
            acc[item.type] = item.price
            return acc
          }, {})
        }

        this.currentService = data
        return data
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createService(serviceData) {
      this.loading = true
      this.error = null
      try {
        // Сначала создаем услугу
        const { data: service, error: serviceError } = await supabase
          .from('services')
          .insert([
            {
              title: serviceData.title,
              description: serviceData.description,
              price: serviceData.price,
              image: serviceData.image,
              features: serviceData.features,
              requirements: serviceData.requirements,
              category: serviceData.category,
            },
          ])
          .select()
          .single()

        if (serviceError) throw serviceError

        // Затем добавляем цены
        const pricingData = Object.entries(serviceData.pricing).map(([type, price]) => ({
          service_id: service.id,
          type,
          price,
        }))

        const { error: pricingError } = await supabase.from('service_pricing').insert(pricingData)

        if (pricingError) throw pricingError

        // Обновляем локальное состояние
        this.services.push(service)
        return service
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateService(id, serviceData) {
      this.loading = true
      this.error = null
      try {
        // Обновляем основные данные услуги
        const { data: service, error: serviceError } = await supabase
          .from('services')
          .update({
            title: serviceData.title,
            description: serviceData.description,
            price: serviceData.price,
            image: serviceData.image,
            features: serviceData.features,
            requirements: serviceData.requirements,
            category: serviceData.category,
          })
          .eq('id', id)
          .select()
          .single()

        if (serviceError) throw serviceError

        // Обновляем цены
        const pricingData = Object.entries(serviceData.pricing).map(([type, price]) => ({
          service_id: id,
          type,
          price,
        }))

        // Удаляем старые цены
        const { error: deleteError } = await supabase
          .from('service_pricing')
          .delete()
          .eq('service_id', id)

        if (deleteError) throw deleteError

        // Добавляем новые цены
        const { error: pricingError } = await supabase.from('service_pricing').insert(pricingData)

        if (pricingError) throw pricingError

        // Обновляем локальное состояние
        const index = this.services.findIndex((s) => s.id === id)
        if (index !== -1) {
          this.services[index] = service
        }

        return service
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteService(id) {
      this.loading = true
      this.error = null
      try {
        const { error } = await supabase.from('services').delete().eq('id', id)

        if (error) throw error

        // Обновляем локальное состояние
        this.services = this.services.filter((service) => service.id !== id)
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },
  },

  getters: {
    getAllServices: (state) => state.services,
    getCurrentService: (state) => state.currentService,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
  },
})
