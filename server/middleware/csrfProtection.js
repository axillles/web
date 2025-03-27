/**
* Middleware для защиты от CSRF-атак
 */

import crypto from 'crypto';
import { env } from '../utils/env.js';

// Секрет для подписи токенов
const CSRF_SECRET = env.CSRF_SECRET || crypto.randomBytes(16).toString('hex');

/**
 * Создание и проверка CSRF-токенов
 */
class CSRFProtection {
  /**
   * Создает CSRF-токен на основе идентификатора сессии и времени
   * @param {string} sessionId - Идентификатор сессии или пользователя
   * @returns {string} CSRF-токен
   */
  generateToken(sessionId) {
    const timestamp = Date.now().toString();
    const payload = `${sessionId}:${timestamp}`;
    const hash = crypto
      .createHmac('sha256', CSRF_SECRET)
      .update(payload)
      .digest('hex');

    return `${hash}:${timestamp}`;
  }

  /**
   * Проверяет валидность CSRF-токена
   * @param {string} token - CSRF-токен для проверки
   * @param {string} sessionId - Идентификатор сессии или пользователя
   * @returns {boolean} Результат проверки
   */
  verifyToken(token, sessionId) {
    if (!token || !sessionId) return false;

    const [hash, timestamp] = token.split(':');
    if (!hash || !timestamp) return false;

    // Проверяем срок действия токена (24 часа)
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 24 * 60 * 60 * 1000) return false;

    // Пересоздаем хэш для проверки
    const payload = `${sessionId}:${timestamp}`;
    const expectedHash = crypto
      .createHmac('sha256', CSRF_SECRET)
      .update(payload)
      .digest('hex');

    return hash === expectedHash;
  }

  /**
   * Middleware для генерации CSRF-токена и добавления его в ответ
   * Используется для GET-запросов, которые возвращают формы
   */
  generateMiddleware(req, res, next) {
    // Используем ID сессии или ID пользователя в качестве основы для токена
    const sessionId = req.session?.id || req.user?.id || 'anonymous';
    const csrfToken = this.generateToken(sessionId);

    // Сохраняем в запросе и добавляем в ответ
    req.csrfToken = csrfToken;
    res.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false, // Должен быть доступен для JavaScript
      secure: !env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 часа
    });

    next();
  }

  /**
   * Middleware для проверки CSRF-токена
   * Используется для защиты состояние-изменяющих запросов (POST, PUT, DELETE)
   */
  protectionMiddleware(req, res, next) {
    // Не проверяем для GET-запросов и OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Получаем токен из заголовка или cookie
    const token = req.headers['x-xsrf-token'] || req.cookies['XSRF-TOKEN'];
    const sessionId = req.session?.id || req.user?.id || 'anonymous';

    if (!this.verifyToken(token, sessionId)) {
      return res.status(403).json({
        status: 'error',
        error: 'Недействительный CSRF-токен'
      });
    }

    next();
  }
}

// Создаем и экспортируем экземпляр
const csrfProtection = new CSRFProtection();

export default {
  /**
   * Middleware для генерации CSRF-токена
   */
  generate: (req, res, next) => csrfProtection.generateMiddleware(req, res, next),

  /**
   * Middleware для проверки CSRF-токена
   */
  verify: (req, res, next) => csrfProtection.protectionMiddleware(req, res, next)
};
