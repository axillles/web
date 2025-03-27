import express from 'express';
import axios from 'axios';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { env, isDevelopment } from '../utils/env.js';

const router = express.Router();

// Защита от CSRF и CORS
const corsOptions = {
  origin: env.CLIENT_URL || 'http://localhost:5173',
  methods: ['POST', 'GET'],
  credentials: true,
  optionsSuccessStatus: 204
};

router.use(cors(corsOptions));

// Защита от DoS-атак: ограничиваем количество запросов
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 10, // 10 запросов за 15 минут
  message: 'Слишком много запросов, попробуйте позже'
});

// Проверка настроек окружения
router.get('/check', (req, res) => {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({
      status: 'error',
      error: 'Отсутствуют переменные окружения для Telegram'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Настройки Telegram корректны'
  });
});

// API для отправки уведомлений в Telegram
router.post('/notify',
  limiter,
  [
    // Валидация входных данных
    body('message').isString().notEmpty().trim().escape(),
  ],
  async (req, res) => {
    console.log('Получен запрос на отправку уведомления');

    // Проверяем результат валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Ошибка валидации:', errors.array());
      return res.status(400).json({
        status: 'error',
        error: 'Некорректные данные запроса',
        details: errors.array()
      });
    }

    try {
      // Получаем токен и chat_id из переменных окружения
      const token = env.TELEGRAM_BOT_TOKEN;
      const chatId = env.TELEGRAM_CHAT_ID;

      if (!token || !chatId) {
        console.error('Ошибка: отсутствуют переменные окружения для Telegram');
        return res.status(500).json({
          status: 'error',
          error: 'Ошибка конфигурации сервера'
        });
      }

      console.log('Отправка сообщения в Telegram...');

      // Отправляем сообщение в Telegram
      const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
      console.log('URL запроса:', telegramUrl);

      // Отправляем сообщение без указания режима форматирования
      const response = await axios.post(
        telegramUrl,
        {
          chat_id: chatId,
          text: req.body.message,
          // Убираем HTML-форматирование
          disable_web_page_preview: true
        }
      );

      // Логируем успешную отправку
      console.log('Сообщение успешно отправлено в Telegram');
      console.log('Ответ от Telegram API:', response.data);

      if (response.data && response.data.ok) {
        return res.status(200).json({
          status: 'success',
          message: 'Уведомление успешно отправлено'
        });
      } else {
        throw new Error('Ошибка отправки уведомления в Telegram: ' +
          (response.data ? JSON.stringify(response.data) : 'неизвестная ошибка'));
      }
    } catch (error) {
      console.error('Ошибка при отправке уведомления:', error.message);

      if (error.response) {
        console.error('Данные ответа:', error.response.data);
        console.error('Статус ответа:', error.response.status);
      }

      // Формируем информативный ответ об ошибке
      const errorResponse = {
        status: 'error',
        error: 'Ошибка при отправке уведомления'
      };

      // В режиме разработки добавляем детали ошибки
      if (isDevelopment()) {
        errorResponse.details = error.message;

        // Если есть данные ответа от Telegram API, добавляем их
        if (error.response && error.response.data) {
          errorResponse.telegramApiResponse = error.response.data;
        }
      }

      return res.status(500).json(errorResponse);
    }
  }
);

export default router;
