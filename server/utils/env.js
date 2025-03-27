/**
 * Утилиты для работы с переменными окружения
 * Решает проблему с линтером для process.env в ESM-модулях
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Настройка для работы с ESM-модулями
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем переменные окружения из корневой директории проекта
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Объект с переменными окружения
 */
export const env = process.env;

/**
 * Получить значение переменной окружения
 * @param {string} key - Ключ переменной окружения
 * @param {*} defaultValue - Значение по умолчанию, если переменная не найдена
 * @returns {string|*} Значение переменной или значение по умолчанию
 */
export function getEnv(key, defaultValue = null) {
  return process.env[key] || defaultValue;
}

/**
 * Проверить, включен ли режим разработки
 * @returns {boolean} true, если NODE_ENV не равен 'production'
 */
export function isDevelopment() {
  return process.env.NODE_ENV !== 'production';
}

/**
 * Проверить, включен ли режим продакшена
 * @returns {boolean} true, если NODE_ENV равен 'production'
 */
export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

export default {
  env,
  getEnv,
  isDevelopment,
  isProduction
};
