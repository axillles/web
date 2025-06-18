/**
 * Сервис для отправки уведомлений в Telegram
 * Использует переменные окружения для хранения секретных данных
 */

export function useTelegramService() {
  /**
   * Отправить сообщение в Telegram
   * @param {string} message - Текст сообщения для отправки
   * @returns {Promise<Object>} - Результат операции
   */
  async function sendMessage(message) {
    try {
      // Отправка через серверный API (безопасный вариант)
      const response = await fetch('/api/telegram/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      // Проверяем, что ответ не пустой
      const text = await response.text();
      let data;

      try {
        // Пытаемся распарсить JSON, если ответ не пустой
        data = text ? JSON.parse(text) : {};
      } catch (jsonError) {
        console.error('Ошибка парсинга JSON:', jsonError);
        throw new Error(`Некорректный формат ответа от сервера: ${text}`);
      }

      if (response.ok) {
        console.log('Сообщение отправлено через серверный API');
        return data;
      }

      throw new Error(data.error || 'Ошибка API');
    } catch (error) {
      console.error('Ошибка сервиса Telegram:', error);
      throw error;
    }
  }

  return {
    sendMessage
  };
}
