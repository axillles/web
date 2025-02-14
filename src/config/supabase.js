import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ppwyclmfgwqbhigfivuc.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwd3ljbG1mZ3dxYmhpZ2ZpdnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwNTUzOTQsImV4cCI6MjA1NDYzMTM5NH0.ZIx1cii6J6HkF63f9xMulfVH7ir6Kihj4gPRCjBOTG8'

export const supabase = createClient(supabaseUrl, supabaseKey)
