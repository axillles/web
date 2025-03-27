import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import compression from 'compression';
import xss from 'xss-clean';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { validateEnv } from './tools/validateEnv.js';
import { env, isDevelopment } from './utils/env.js';
import apiSecurity from './middleware/apiSecurity.js';
import csrfProtection from './middleware/csrfProtection.js';

// Для получения __dirname в ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загрузка переменных окружения
dotenv.config();

// Импорт маршрутов
import telegramRouter from './api/telegram.js';

// Проверка переменных окружения
validateEnv();

const app = express();
const PORT = env.PORT || 3002;

// Настройка безопасных заголовков с помощью helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", env.VITE_SUPABASE_URL, 'https://api.telegram.org'],
      imgSrc: ["'self'", 'data:', 'blob:'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Защита от XSS атак
app.use(xss());

// Добавляем дополнительные заголовки безопасности
app.use(apiSecurity.securityHeaders);

// Ограничение запросов для защиты от DoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // 100 запросов с одного IP за 15 минут
  message: 'Слишком много запросов с вашего IP, попробуйте позже',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Парсинг cookie и подписанных cookie
app.use(cookieParser(env.COOKIE_SECRET || 'default-secret-key-change-in-production'));

// Парсинг JSON и URL-encoded данных с ограничением размера
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Генерация CSRF-токенов для API запросов
app.use('/api', csrfProtection.generate);

// Проверка CSRF-токенов для изменяющих запросов
app.use('/api', csrfProtection.verify);

// Проверка Content-Type для API запросов
app.use('/api/', apiSecurity.validateContentType);

// Добавляем задержку для запросов аутентификации и других чувствительных операций
app.use(['/api/auth', '/api/admin'], apiSecurity.requestDelay);

// Проверка API ключа для админ-маршрутов
app.use('/api/admin', apiSecurity.apiKeyAuth);

// Сжатие ответов
app.use(compression());

// CORS настройка
app.use(cors({
  origin: isDevelopment()
    ? 'http://localhost:5173'
    : env.CLIENT_URL || 'https://your-production-domain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key', 'X-XSRF-TOKEN']
}));

// API маршруты
app.use('/api/telegram', telegramRouter);

// Маршрут для проверки состояния API-сервера
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API-сервер работает нормально',
    env: isDevelopment() ? 'development' : 'production',
    timestamp: new Date().toISOString()
  });
});

// В режиме production, сервируем статические файлы фронтенда
if (!isDevelopment()) {
  // Путь к собранным файлам фронтенда
  app.use(express.static(path.join(__dirname, '../dist'), {
    // Добавляем безопасные HTTP-заголовки для статических файлов
    setHeaders: (res, path) => {
      res.set('X-Content-Type-Options', 'nosniff');

      // Устанавливаем более длительное кэширование для статических ресурсов
      if (path.endsWith('.js') || path.endsWith('.css') || path.match(/\.(png|jpg|jpeg|gif|ico|svg)$/)) {
        res.set('Cache-Control', 'public, max-age=31536000');
      } else {
        res.set('Cache-Control', 'no-cache');
      }
    }
  }));

  // Любые неизвестные запросы направляем на index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);

  // В режиме разработки включаем информацию об ошибке
  const errorResponse = {
    status: 'error',
    message: isDevelopment() ? err.message : 'Произошла внутренняя ошибка сервера'
  };

  // В режиме разработки добавляем стек ошибки
  if (isDevelopment()) {
    errorResponse.stack = err.stack;
  }

  res.status(err.status || 500).json(errorResponse);
});

// Обработка запросов, не прошедших через другие обработчики
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: 'Запрашиваемый ресурс не найден'
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`\x1b[32m%s\x1b[0m`, `✅ Сервер запущен на порту ${PORT}`);

  if (isDevelopment()) {
    console.log(`\x1b[33m%s\x1b[0m`, `⚠️ Режим: Разработка`);
    console.log(`\x1b[33m%s\x1b[0m`, `⚠️ API доступен по адресу: http://localhost:${PORT}/api`);
  } else {
    console.log(`\x1b[32m%s\x1b[0m`, `✅ Режим: Продакшен`);
  }
});

export default app;
