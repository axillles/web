import { defineStore } from 'pinia'
import { supabase } from '@/config/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    loading: false,
    error: null,
  }),

  actions: {
    setError(error) {
      this.error = error?.message || 'Произошла ошибка'
    },

    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data?.user) {
          this.user = data.user
          this.isAuthenticated = true
          console.log('Login successful:', {
            user: data.user,
            metadata: data.user.user_metadata,
          })
          return true
        }
      } catch (error) {
        console.error('Login error:', error)
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null
      try {
        // Проверяем формат телефона
        const phoneRegex = /^\+375\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/
        if (!phoneRegex.test(userData.phone)) {
          throw new Error('Неверный формат телефона. Используйте формат: +375 XX XXX-XX-XX')
        }

        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.name,
              phone: userData.phone,
            },
          },
        })

        if (error) throw error

        if (data?.user) {
          this.user = data.user
          this.isAuthenticated = true
          return true
        }
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      this.error = null
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error

        this.user = null
        this.isAuthenticated = false
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProfile(profileData) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase.auth.updateUser({
          data: {
            name: profileData.name,
            phone: profileData.phone,
          },
        })

        if (error) throw error

        if (data?.user) {
          this.user = data.user
          return true
        }
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async checkAuth() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) throw error

        if (session?.user) {
          this.user = session.user
          this.isAuthenticated = true
          this.isAdmin = session.user.user_metadata?.is_admin || false
        }
      } catch (error) {
        this.setError(error)
        throw error
      }
    },
  },

  getters: {
    userProfile: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    isUserAdmin: (state) => state.isAdmin,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
  },
})
