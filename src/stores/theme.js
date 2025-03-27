import { defineStore } from 'pinia'
import { useColorMode } from '@vueuse/core'

// Создаем экземпляр useColorMode вне хранилища
const colorMode = useColorMode({
  attribute: 'data-theme',
  initialValue: 'dark', // тема по умолчанию
  storageKey: 'nkl-color-scheme', // ключ для localStorage
  modes: {
    dark: 'dark',
    light: 'light'
  }
})

export const useThemeStore = defineStore('theme', {
  state: () => ({
    // Здесь храним только строковое значение темы
    theme: colorMode.value
  }),

  getters: {
    isDarkMode: () => colorMode.value === 'dark',
    currentTheme: () => colorMode.value
  },

  actions: {
    toggleTheme() {
      // Переключение между темной и светлой темой
      colorMode.value = this.isDarkMode ? 'light' : 'dark'
      this.theme = colorMode.value
    },

    setTheme(theme) {
      // Установка конкретной темы
      if (theme === 'dark' || theme === 'light') {
        colorMode.value = theme
        this.theme = theme
      }
    }
  }
})