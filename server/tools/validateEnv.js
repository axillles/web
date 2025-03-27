/**
 * Инструмент для проверки корректности переменных окружения
 */

import { env } from '../utils/env.js';

/**
 * Проверяет наличие и корректность необходимых переменных окружения
 * @returns {boolean} - Результат проверки
 */
export function validateEnv() {
  const requiredEnvVars = [
    {
      name: 'VITE_SUPABASE_URL',
      critical: true,
      validate: (val) => val && val.startsWith('https://'),
      message: 'Должен быть валидным URL, начинающимся с https://'
    },
    {
      name: 'VITE_SUPABASE_ANON_KEY',
      critical: true,
      validate: (val) => val && val.length > 10,
      message: 'Должен быть непустым и содержать как минимум 10 символов'
    },
    {
      name: 'PORT',
      critical: false,
      validate: (val) => !val || (Number(val) >= 1 && Number(val) <= 65535),
      message: 'Должен быть числом между 1 и 65535'
    },
    {
      name: 'NODE_ENV',
      critical: false,
      validate: (val) => !val || ['development', 'production', 'test'].includes(val),
      message: 'Должен быть одним из: development, production, test'
    },
    {
      name: 'TELEGRAM_BOT_TOKEN',
      critical: false,
      validate: (val) => !val || val.length > 10,
      message: 'Должен содержать не менее 10 символов, если указан'
    },
    {
      name: 'TELEGRAM_CHAT_ID',
      critical: false,
      validate: (val) => !val || (!isNaN(val) || val.startsWith('@')),
      message: 'Должен быть числом или начинаться с @ для имен каналов'
    },
    {
      name: 'COOKIE_SECRET',
      critical: true,
      validate: (val) => val && val.length >= 16,
      message: 'Должен содержать не менее 16 символов для надежной защиты'
    },
    {
      name: 'API_KEY',
      critical: false,
      validate: (val) => !val || val.length >= 16,
      message: 'Если указан, должен содержать минимум 16 символов для безопасности'
    }
  ];

  let isValid = true;
  let missingCritical = false;

  // Проверка каждой переменной
  for (const envVar of requiredEnvVars) {
    const value = env[envVar.name];
    const exists = value !== undefined && value !== '';

    if (!exists) {
      if (envVar.critical) {
        console.error(`❌ Отсутствует критически важная переменная окружения: ${envVar.name}`);
        isValid = false;
        missingCritical = true;
      } else {
        console.warn(`⚠️ Отсутствует переменная окружения: ${envVar.name} (опционально)`);
      }
      continue;
    }

    if (!envVar.validate(value)) {
      if (envVar.critical) {
        console.error(`❌ Некорректное значение переменной: ${envVar.name}. ${envVar.message}`);
        isValid = false;
      } else {
        console.warn(`⚠️ Некорректное значение переменной: ${envVar.name}. ${envVar.message}`);
      }
    }
  }

  // Проверка режима работы
  const isDev = env.NODE_ENV === 'development' || !env.NODE_ENV;

  if (isDev) {
    console.log(`🔧 Режим работы: разработка (development)`);
  } else {
    console.log(`🚀 Режим работы: продакшен (production)`);

    // Дополнительные проверки для продакшена
    if (!env.COOKIE_SECRET || env.COOKIE_SECRET === 'default-secret-key-change-in-production') {
      console.error(`❌ В продакшен режиме необходимо задать уникальный COOKIE_SECRET!`);
      isValid = false;
    }
  }

  // Вывод результатов проверки
  if (isValid) {
    console.log('✅ Все переменные окружения корректны');
  } else {
    console.error('❌ Обнаружены проблемы с переменными окружения');

    if (missingCritical) {
      console.error('❌ Отсутствуют критически важные переменные окружения!');
      if (!isDev) {
        console.error('❌ Сервер не может быть запущен в продакшен режиме с отсутствующими переменными');
        // Прекращаем выполнение в продакшен режиме, если отсутствуют критические переменные
        process.exit(1);
      }
    }
  }

  return isValid;
}
