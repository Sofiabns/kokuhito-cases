// Configuração direta do Supabase - Painel Kokuhito
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Suas credenciais do Supabase
const SUPABASE_URL = 'https://wwlyiyvkonywkgxcuive.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_6wbEqOrMS4MA9DXJc7cT-A_mAMH4HPg';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});