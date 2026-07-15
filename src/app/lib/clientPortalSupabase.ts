import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const CLIENT_PORTAL_AUTH_STORAGE_KEY = "hr-consultoria-client-auth";
const isClientRoute = window.location.pathname.startsWith("/cliente");

export const clientPortalSupabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storageKey: CLIENT_PORTAL_AUTH_STORAGE_KEY,
    persistSession: true,
    autoRefreshToken: true,
    // Enabled on the portal and its dedicated callback, never on admin routes.
    detectSessionInUrl: isClientRoute,
  },
});
