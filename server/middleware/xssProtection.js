import xss from 'xss';

/**
 * Middleware для защиты от XSS-атак
 * Чистит все параметры запроса от потенциально опасных скриптов
 */
function xssProtection(req, res, next) {
  // Функция очистки строк от XSS
  const sanitizeString = (str) => {
    if (typeof str === 'string') {
      return xss(str, {
        whiteList: {}, // Разрешаем только текст без тегов
        stripIgnoreTag: true, // Удаляем игнорируемые теги
        stripIgnoreTagBody: ['script', 'style', 'iframe', 'object'] // Удаляем содержимое определенных тегов
      });
    }
    return str;
  };

  // Функция рекурсивной очистки объекта
  const sanitizeObject = (obj) => {
    if (!obj) return obj;

    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    }

    if (typeof obj === 'object') {
      const sanitizedObj = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitizedObj[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitizedObj;
    }

    return obj;
  };

  // Очищаем все параметры запроса
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
}

export default xssProtection;
