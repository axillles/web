#!/usr/bin/env node

/**
 * Скрипт настройки проекта
 * Создает .env файл с необходимыми переменными окружения
 * и выполняет начальную настройку проекта
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';
import crypto from 'crypto';
import chalk from 'chalk';

// Для поддержки ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Настройка интерфейса readline для ввода данных
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Генерация случайного секретного ключа
 * @param {number} length - Длина ключа
 * @returns {string} - Сгенерированный ключ
 */
function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Запрос данных у пользователя с подстановкой значения по умолчанию
 */
async function prompt(question, defaultValue = '') {
  return new Promise((resolve) => {
    const displayQuestion = defaultValue
      ? `${question} (по умолчанию: "${defaultValue}"): `
      : `${question}: `;

    rl.question(displayQuestion, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

/**
 * Основная функция настройки
 */
async function setupProject() {
  console.log(chalk.green.bold('\n=== НАСТРОЙКА ПРОЕКТА ===\n'));
  console.log('Этот скрипт поможет настроить переменные окружения и базовые параметры проекта.\n');

  try {
    // Проверка наличия .env
    let envExists = true;
    let currentEnv = '';

    try {
      currentEnv = await fs.readFile(path.join(rootDir, '.env'), 'utf8');
    } catch (error) {
      envExists = false;
    }

    if (envExists) {
      console.log(chalk.yellow('Файл .env уже существует. Вы можете обновить его или создать новый.'));
      const action = await prompt('Обновить существующий файл? (да/нет)', 'да');

      if (action.toLowerCase() !== 'да' && action.toLowerCase() !== 'yes') {
        console.log(chalk.yellow('Настройка отменена. Текущий .env файл оставлен без изменений.'));
        rl.close();
        return;
      }
    }

    // Базовая конфигурация Supabase
    console.log(chalk.blue('\n--- Настройка Supabase ---'));

    const supabaseUrl = await prompt(
      'URL вашей Supabase базы данных (VITE_SUPABASE_URL)',
      process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
    );

    const supabaseAnonKey = await prompt(
      'Анонимный ключ Supabase (VITE_SUPABASE_ANON_KEY)',
      process.env.VITE_SUPABASE_ANON_KEY || ''
    );

    // Настройка Telegram для уведомлений
    console.log(chalk.blue('\n--- Настройка уведомлений Telegram ---'));

    const telegramToken = await prompt(
      'Токен Telegram-бота (TELEGRAM_BOT_TOKEN)',
      process.env.TELEGRAM_BOT_TOKEN || ''
    );

    const telegramChatId = await prompt(
      'ID чата или канала Telegram (TELEGRAM_CHAT_ID)',
      process.env.TELEGRAM_CHAT_ID || ''
    );

    // Настройка сервера
    console.log(chalk.blue('\n--- Настройка Сервера ---'));

    const port = await prompt(
      'Порт сервера (PORT)',
      process.env.PORT || '3002'
    );

    // Настройка безопасности
    console.log(chalk.blue('\n--- Настройка безопасности ---'));

    const mode = await prompt(
      'Режим работы (development/production)',
      process.env.NODE_ENV || 'development'
    );

    // Генерируем секретные ключи для безопасности
    const cookieSecret = await prompt(
      'Секретный ключ для подписи cookie (COOKIE_SECRET)',
      process.env.COOKIE_SECRET || generateSecret(24)
    );

    const apiKey = await prompt(
      'API ключ для админ-маршрутов (API_KEY)',
      process.env.API_KEY || generateSecret(24)
    );

    // Формируем содержимое .env файла
    const envContent = `# Конфигурация проекта
# Создано автоматически: ${new Date().toISOString()}

# === Режим работы ===
NODE_ENV=${mode}

# === Настройки сервера ===
PORT=${port}

# === Supabase настройки ===
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}

# === Настройки Telegram уведомлений ===
TELEGRAM_BOT_TOKEN=${telegramToken}
TELEGRAM_CHAT_ID=${telegramChatId}

# === Настройки безопасности ===
COOKIE_SECRET=${cookieSecret}
API_KEY=${apiKey}

# === Прочие настройки ===
# CLIENT_URL для CORS (в production)
CLIENT_URL=${mode === 'production' ? await prompt('URL вашего клиентского приложения (CLIENT_URL)', 'https://your-domain.com') : 'http://localhost:5173'}
`;

    // Записываем .env файл
    await fs.writeFile(path.join(rootDir, '.env'), envContent);

    console.log(chalk.green('\n✅ Файл .env успешно создан!'));

    // Проверка и установка зависимостей
    console.log(chalk.blue('\n--- Проверка зависимостей ---'));
    console.log('Рекомендуется установить все необходимые зависимости...');

    const installDeps = await prompt('Установить/обновить зависимости сейчас? (да/нет)', 'да');

    if (installDeps.toLowerCase() === 'да' || installDeps.toLowerCase() === 'yes') {
      console.log(chalk.yellow('\nУстановка зависимостей, пожалуйста подождите...'));

      const { exec } = await import('child_process');

      // Выполняем установку зависимостей
      exec('npm install', { cwd: rootDir }, (error, stdout, stderr) => {
        if (error) {
          console.error(chalk.red(`\n❌ Ошибка установки зависимостей: ${error.message}`));
          console.error(chalk.red('Попробуйте выполнить npm install вручную'));
        } else {
          console.log(chalk.green('\n✅ Зависимости успешно установлены!'));
        }

        console.log(chalk.green.bold('\n=== НАСТРОЙКА ЗАВЕРШЕНА ==='));
        console.log('Ваше приложение готово к запуску!');
        console.log(`\nКоманды для запуска:`);
        console.log(`- Режим разработки: ${chalk.blue('npm run dev')}`);
        console.log(`- Режим production: ${chalk.blue('npm run build && npm start')}`);
        console.log(`- Проверка безопасности: ${chalk.blue('npm run security:check')}\n`);

        rl.close();
      });
    } else {
      console.log(chalk.green.bold('\n=== НАСТРОЙКА ЗАВЕРШЕНА ==='));
      console.log('Не забудьте установить зависимости вручную с помощью npm install\n');
      rl.close();
    }
  } catch (error) {
    console.error(chalk.red(`\n❌ Ошибка при настройке проекта: ${error.message}`));
    rl.close();
    process.exit(1);
  }
}

// Запуск процесса настройки
setupProject();
