import { ref, watch, onMounted, nextTick } from 'vue'

/**
 * Композабл для управления темой приложения
 * @returns {Object} - Методы и состояние для работы с темой
 */
export function useTheme() {
  const currentTheme = ref('light')

  /**
   * Применяет текущую тему к документу
   * @param {string} theme - Название темы (dark/light)
   */
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
    currentTheme.value = theme

    // Настройка для календаря и селектов
    const invertValue = theme === 'light' ? '0' : '1'
    document.documentElement.style.setProperty('--invert-value', invertValue)

    // Обновляем стили SVG в динамически созданных элементах
    nextTick(() => {
      updateSvgColors()
    })
  }

  /**
   * Переключает между темной и светлой темой
   */
  const toggleTheme = () => {
    const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark'
    applyTheme(newTheme)
  }

  /**
   * Обновляет цвета SVG в динамических элементах
   */
  const updateSvgColors = () => {
    // Обновляем стрелки в селектах и календарях
    const selects = document.querySelectorAll('select')
    const datePickers = document.querySelectorAll('input[type="date"], input[type="datetime-local"]')

    // Применяем инвертирование к элементам форм в зависимости от темы
    const elements = [...selects, ...datePickers]
    elements.forEach(el => {
      if (currentTheme.value === 'light') {
        el.style.filter = ''
      } else {
        // Для тёмной темы инвертируем цвета индикаторов
        el.style.filter = 'invert(1)'
      }
    })
  }

  /**
   * Наблюдает за изменениями темы в других вкладках
   */
  const setupStorageListener = () => {
    window.addEventListener('storage', (event) => {
      if (event.key === 'theme' && event.newValue !== currentTheme.value) {
        applyTheme(event.newValue)
      }
    })
  }

  // При монтировании компонента загружаем тему из localStorage
  onMounted(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    applyTheme(savedTheme)
    setupStorageListener()

    // Наблюдаем за динамическими изменениями DOM для обновления SVG
    if (window.MutationObserver) {
      const observer = new MutationObserver(() => {
        updateSvgColors()
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })
    }
  })

  return {
    currentTheme,
    toggleTheme,
    applyTheme
  }
}
