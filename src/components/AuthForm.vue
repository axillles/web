<template>
  <div class="auth-form">
    <!-- Существующая форма -->

    <div class="social-auth">
      <div class="divider">или</div>

      <button class="social-btn google-btn" @click="signInWithGoogle">
        <img src="@/assets/google-icon.svg" alt="Google" />
        Войти через Google
      </button>

      <button class="social-btn apple-btn" @click="signInWithApple">
        <img src="@/assets/apple-icon.svg" alt="Apple" />
        Войти через Apple
      </button>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabaseClient'

export default {
  name: 'AuthForm',
  methods: {
    showError(message) {
      // Используем существующий метод показа ошибок
      this.$emit('error', message)
    },

    async signInWithGoogle() {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent'
            }
          }
        })

        if (error) throw error
      } catch (error) {
        console.error('Error signing in with Google:', error)
        this.showError('Ошибка при входе через Google')
      }
    },

    async signInWithApple() {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            scope: 'name email'
          }
        })

        if (error) throw error
      } catch (error) {
        console.error('Error signing in with Apple:', error)
        this.showError('Ошибка при входе через Apple')
      }
    }
  }
}
</script>

<style scoped>
.social-auth {
  margin-top: 2rem;
}

.divider {
  text-align: center;
  margin: 1rem 0;
  position: relative;
  color: var(--text-secondary);
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background: var(--border-color);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition-standard);
  gap: 0.5rem;
}

.social-btn img {
  width: 24px;
  height: 24px;
}

.google-btn:hover {
  background: #4285f4;
  border-color: #4285f4;
}

.apple-btn:hover {
  background: #000000;
  border-color: #000000;
}
</style>
