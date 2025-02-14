import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Проверяем наличие переменных окружения
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Отсутствуют переменные окружения для Supabase')
}

// Создаем клиент с правильными настройками
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Клиент с сервисной ролью для админ-панели
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
