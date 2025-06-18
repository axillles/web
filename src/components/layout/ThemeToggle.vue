<template>
  <button @click="toggleTheme" class="theme-toggle">
    <span v-if="currentTheme === 'dark'" class="icon">☀️</span>
    <span v-else class="icon">🌙</span>
  </button>
</template>

<script>
import { useTheme } from '@/composables/useTheme'

export default {
  name: 'ThemeToggle',
  setup() {
    const { currentTheme, toggleTheme } = useTheme()

    return {
      currentTheme,
      toggleTheme
    }
  }
}
</script>

<style scoped>
.theme-toggle {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  opacity: 0.8;
  transition: opacity 0.3s ease, transform 0.3s ease;
  color: var(--text-primary);
}

.theme-toggle:hover {
  opacity: 1;
  transform: rotate(15deg);
}

.icon {
  display: inline-block;
  transition: transform 0.3s ease;
}
</style>
