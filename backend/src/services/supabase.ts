import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/Database';



// Create a single supabase client for interacting with your database
const supabase = process.env.SUPABASE_PROJECT_URL &&  
process.env.SUPABASE_PROJECT_KEY && 
createClient<Database>(process.env.SUPABASE_PROJECT_URL, process.env.SUPABASE_PROJECT_KEY,{
  auth: {
    persistSession: false
  }
})

export default supabase;

