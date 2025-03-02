import { Client } from 'pg';
import axios from 'axios';
const client = new Client({
  connectionString: 'postgresql://postgres:Mini6021988@@db.ppwyclmfgwqbhigfivuc.supabase.co:5432/postgres', // Замените на ваш URL базы данных Supabase
  ssl: { rejectUnauthorized: false }
});

const TELEGRAM_BOT_TOKEN = '8177569844:AAGhRGqyxKkMjz8OmmYB0sxkMw6jyrPnOkQ'; // Замените на токен вашего бота
const TELEGRAM_CHAT_ID = '1031540537'; // Замените на ID вашего чата

client.connect();

// Слушаем канал 'new_order'
client.query('LISTEN new_order');

client.on('notification', async (msg) => {
  const message = msg.payload; // Сообщение из канала

  // Отправляем сообщение в Telegram
  await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    chat_id: TELEGRAM_CHAT_ID,
    text: message
  });

  console.log('Уведомление отправлено в Telegram:', message);
});
