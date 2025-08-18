const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://SEU_URL_SUPABASE';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'SEU_SERVICE_ROLE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
