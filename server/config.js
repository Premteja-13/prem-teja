const dotenv = require('dotenv');
const path = require('path');

// Ensure local SSL bypass in developmental/campus networks if needed
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const config = {
  port: process.env.PORT || 3000,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  allowedOrigin: process.env.ALLOWED_ORIGIN || '*',
  isProduction: process.env.NODE_ENV === 'production',
  hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5),
  hasSupabase: Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY))
};

module.exports = config;
