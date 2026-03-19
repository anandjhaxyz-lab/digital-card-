import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kudgbvakavxihdjcgynb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1ZGdidmFrYXZ4aWhkamNneW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MDg0MDMsImV4cCI6MjA4OTQ4NDQwM30.JrZjMZlKrF_rIJ3cvu3xKemejo5j45naa4WRFv9jzws'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
