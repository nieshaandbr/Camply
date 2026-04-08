// shared-services/supabaseClient.js
// Note: This will be imported by both apps.
// Environment variables will be handled by the respective build tools (Vite/Expo)

export const SUPABASE_CONFIG = {
  url: "", // Populated via .env
  anonKey: "" // Populated via .env
};