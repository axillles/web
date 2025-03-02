<template>
  <div class="auth-callback">
    <div class="loader">Выполняется вход...</div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabaseClient'

export default {
  name: 'AuthCallback',
  async mounted() {
    try {
      const { error } = await supabase.auth.getSession()
      if (error) throw error

      // Перенаправляем на главную страницу после успешной авторизации
      this.$router.push('/')
    } catch (error) {
      console.error('Error in auth callback:', error)
      this.$router.push('/auth')
    }
  }
}
</script>

<style scoped>
.auth-callback {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.loader {
  color: #ffffff;
}
</style>
