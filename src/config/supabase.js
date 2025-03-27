import { createClient } from '@supabase/supabase-js'

// Получаем URL и ключи из переменных окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Проверяем наличие переменных окружения
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Отсутствуют переменные окружения для Supabase. Проверьте файл .env')
}

// Создаем клиент с правильными настройками
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
})
