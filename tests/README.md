# Тестирование

Этот раздел содержит информацию о unit тестах проекта.

## 🧪 Запуск тестов

### Основные команды

```bash
# Запуск всех тестов в watch режиме
npm test

# Запуск тестов с UI интерфейсом
npm run test:ui

# Запуск тестов один раз
npm run test:run

# Запуск тестов с покрытием
npm run test:coverage
```

### Конфигурация

Тесты настроены с помощью Vitest в файле `vitest.config.js`:

- **Среда**: jsdom для тестирования DOM
- **Покрытие**: v8 provider
- **Алиасы**: поддержка `@/` для импортов
- **Моки**: автоматические моки для Supabase, Vue Router, Pinia

## 📁 Структура тестов

```
tests/
├── setup.js                    # Глобальная настройка тестов
├── components/                 # Тесты Vue компонентов
│   ├── ActionsManager.test.js  # Тесты управления акциями
│   └── ServicesManager.test.js # Тесты управления услугами
└── utils/                      # Тесты утилит
    └── validation.test.js      # Тесты валидации
```

## 🎯 Покрытие тестами

### Компоненты

#### ActionsManager
- ✅ Рендеринг компонента
- ✅ Открытие/закрытие модальных окон
- ✅ Валидация форм
- ✅ Загрузка изображений
- ✅ Удаление записей
- ✅ Форматирование цен

#### ServicesManager
- ✅ Рендеринг компонента
- ✅ Фильтрация и поиск
- ✅ Сортировка данных
- ✅ Модальные окна
- ✅ Валидация форм
- ✅ Загрузка файлов

### Утилиты

#### Validation
- ✅ Валидация email
- ✅ Валидация телефонов (Беларусь)
- ✅ Валидация паролей
- ✅ Валидация файлов (размер, тип)

## 🔧 Настройка тестов

### Глобальные моки

В `tests/setup.js` настроены моки для:

- **Supabase**: Моки для базы данных и storage
- **Vue Router**: Моки для навигации
- **Pinia**: Моки для управления состоянием
- **Console**: Моки для логов

### Тестирование компонентов

```javascript
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(MyComponent, {
      global: {
        provide: {
          showToast: vi.fn()
        }
      }
    })
  })

  it('renders correctly', () => {
    expect(wrapper.find('.my-component').exists()).toBe(true)
  })
})
```

### Тестирование асинхронных операций

```javascript
it('handles async operations', async () => {
  await wrapper.find('.submit-btn').trigger('click')
  await wrapper.vm.$nextTick()
  
  expect(mockFunction).toHaveBeenCalled()
})
```

## 📊 Отчеты о покрытии

После запуска `npm run test:coverage` генерируются отчеты:

- **Консоль**: Краткий отчет в терминале
- **HTML**: Детальный отчет в `coverage/` папке
- **JSON**: Машиночитаемый отчет

### Интерпретация покрытия

- **Statements**: Покрытие строк кода
- **Branches**: Покрытие условных веток
- **Functions**: Покрытие функций
- **Lines**: Покрытие строк

## 🚀 Добавление новых тестов

### Для компонентов

1. Создайте файл `tests/components/ComponentName.test.js`
2. Импортируйте компонент и Vue Test Utils
3. Настройте моки для зависимостей
4. Напишите тесты для всех методов и событий

### Для утилит

1. Создайте файл `tests/utils/utilityName.test.js`
2. Импортируйте тестируемые функции
3. Напишите тесты для всех сценариев использования

### Пример нового теста

```javascript
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NewComponent from '@/components/NewComponent.vue'

describe('NewComponent', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(NewComponent)
  })

  describe('Rendering', () => {
    it('renders the component', () => {
      expect(wrapper.find('.new-component').exists()).toBe(true)
    })
  })

  describe('Functionality', () => {
    it('handles user interactions', async () => {
      await wrapper.find('.button').trigger('click')
      expect(wrapper.vm.someData).toBe(expectedValue)
    })
  })
})
```

## 🔍 Отладка тестов

### UI интерфейс

```bash
npm run test:ui
```

Открывает веб-интерфейс для:
- Просмотра результатов тестов
- Отладки падающих тестов
- Анализа покрытия

### Консольная отладка

```bash
# Запуск конкретного теста
npm test -- --run tests/components/SpecificTest.test.js

# Запуск с подробным выводом
npm test -- --reporter=verbose
```

## 📝 Лучшие практики

### Организация тестов

- Группируйте связанные тесты в `describe` блоки
- Используйте описательные названия тестов
- Тестируйте как успешные, так и неуспешные сценарии
- Изолируйте тесты друг от друга

### Моки и стабы

- Мокайте внешние зависимости
- Используйте реалистичные данные
- Очищайте моки между тестами
- Документируйте сложные моки

### Асинхронное тестирование

- Используйте `async/await` для асинхронных операций
- Ждите обновления DOM с `$nextTick()`
- Тестируйте состояния загрузки и ошибок

## 🐛 Решение проблем

### Частые ошибки

1. **Моки не работают**: Проверьте `tests/setup.js`
2. **Компонент не рендерится**: Проверьте зависимости и моки
3. **Асинхронные тесты падают**: Добавьте `await` и `$nextTick()`

### Отладка

```javascript
// Временный вывод для отладки
console.log(wrapper.html())
console.log(wrapper.vm.$data)
```

## 📚 Дополнительные ресурсы

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Vue Components](https://vuejs.org/guide/scaling-up/testing.html) 