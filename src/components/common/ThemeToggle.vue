<template>
  <button class="theme-toggle" @click="toggleTheme" :title="currentTheme === 'dark' ? 'Светлая тема' : 'Темная тема'">
    <svg v-if="currentTheme === 'dark'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  </button>
</template>

<script>
import { useTheme } from '@/utils/useTheme'

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
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: var(--bg-elevated);
  transform: scale(1.1);
}

.theme-toggle svg {
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .theme-toggle {
    padding: 0.4rem;
  }

  .theme-toggle svg {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 480px) {
  .theme-toggle {
    padding: 0.3rem;
  }

  .theme-toggle svg {
    width: 16px;
    height: 16px;
  }
}
</style>
