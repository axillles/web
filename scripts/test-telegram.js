#!/usr/bin/env node

/**
 * Скрипт для тестирования отправки сообщений в Telegram
 * Использует данные из файла .env
 * Запуск: node scripts/test-telegram.js
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Настройка ES modules для получения __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Загружаем переменные окружения
dotenv.config({ path: path.join(rootDir, '.env') });

// Получаем токен и chat_id из переменных окружения
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

// Цвета для консоли
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Функция для вывода цветного текста
function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

async function testTelegramApi() {
  log('=== Тестирование Telegram API ===', 'blue');

  // Проверяем наличие необходимых переменных окружения
  if (!token || !chatId) {
    log('ОШИБКА: Отсутствуют переменные окружения TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID', 'red');
    log('Убедитесь, что файл .env содержит эти переменные без кавычек и лишних пробелов', 'yellow');
    return;
  }

  log(`Используем токен: ${token.substring(0, 10)}...`, 'yellow');
  log(`Используем chat_id: ${chatId}`, 'yellow');

  // Формируем тестовое сообщение
  const message = `Тестовое сообщение от скрипта диагностики
Дата: ${new Date().toLocaleString()}`;

  log('Отправка тестового сообщения...', 'blue');

  try {
    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    log(`URL запроса: ${telegramUrl}`, 'yellow');

    const response = await axios.post(telegramUrl, {
      chat_id: chatId,
      text: message
    });

    if (response.data && response.data.ok) {
      log('УСПЕХ: Сообщение успешно отправлено!', 'green');
      log('Ответ API:', 'green');
      console.log(response.data);

      log('\nПроверьте настройки прокси в vite.config.js:', 'yellow');
      log('- Убедитесь, что target в секции proxy указывает на правильный порт API сервера', 'yellow');
      log('- В server/index.js порт должен быть такой же как в настройках прокси', 'yellow');
    } else {
      log('ОШИБКА: Сервер вернул неожиданный ответ', 'red');
      console.log(response.data);
    }
  } catch (error) {
    log('ОШИБКА при отправке сообщения:', 'red');

    if (error.response) {
      log('Данные ответа:', 'red');
      console.log(error.response.data);
      log('Статус ответа: ' + error.response.status, 'red');

      // Специфические сообщения для распространенных ошибок
      if (error.response.status === 401) {
        log('Ошибка авторизации. Проверьте правильность токена бота.', 'yellow');
      } else if (error.response.status === 400) {
        log('Ошибка в запросе. Проверьте правильность chat_id.', 'yellow');
      }
    } else if (error.request) {
      log('Запрос был отправлен, но ответ не получен', 'red');
      log('Возможно, проблемы с сетью или блокировка API Telegram', 'yellow');
    } else {
      log('Ошибка при настройке запроса: ' + error.message, 'red');
    }
  }
}

// Запускаем тест
testTelegramApi();
