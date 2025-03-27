/**
 * Промежуточное ПО для улучшения безопасности API
 */

import { env } from '../utils/env.js';

/**
 * Добавляет дополнительные заголовки безопасности к ответам API
 */
export function securityHeaders(req, res, next) {
  // Запрещаем кэширование ответов API
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');

  // Защита от Clickjacking
  res.set('X-Frame-Options', 'DENY');

  // Защита от MIME-снифинга в IE
  res.set('X-Content-Type-Options', 'nosniff');

  // Включаем защиту XSS в старых браузерах
  res.set('X-XSS-Protection', '1; mode=block');

  // Запрещаем отображать в iframe с других доменов
  res.set('Content-Security-Policy', "frame-ancestors 'none'");

  // Убираем информацию о сервере
  res.set('X-Powered-By', 'Magic');

  next();
}

/**
 * Проверяет API-ключ для защищенных эндпоинтов
 * Используется для маршрутов, которые требуют дополнительной защиты
 */
export function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const expectedApiKey = env.API_KEY;

  // Если API_KEY не установлен, пропускаем проверку (для разработки)
  if (!expectedApiKey) {
    console.warn('ПРЕДУПРЕЖДЕНИЕ: Переменная окружения API_KEY не установлена!');
    return next();
  }

  if (!apiKey || apiKey !== expectedApiKey) {
    return res.status(401).json({
      status: 'error',
      error: 'Недействительный API-ключ'
    });
  }

  next();
}

/**
 * Добавляет задержку для всех запросов
 * Замедляет брутфорс-атаки
 */
export function requestDelay(req, res, next) {
  const delayMs = 100; // 100ms задержки

  setTimeout(next, delayMs);
}

/**
 * Валидирует входящие Content-Type
 * Защищает от атак с неправильным Content-Type
 */
export function validateContentType(req, res, next) {
  const contentType = req.headers['content-type'];

  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        status: 'error',
        error: 'Неподдерживаемый Content-Type. Используйте application/json'
      });
    }
  }

  next();
}

export default {
  securityHeaders,
  apiKeyAuth,
  requestDelay,
  validateContentType
};
