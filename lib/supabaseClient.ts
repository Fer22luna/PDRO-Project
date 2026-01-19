import { createClient, SupabaseClient } from '@supabase/supabase-js';

function assertEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let browserClient: SupabaseClient | null = null;
let serverClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(
      assertEnv('NEXT_PUBLIC_SUPABASE_URL', supabaseUrl),
      assertEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', supabaseAnonKey)
    );
  }
  return browserClient;
}

export function getSupabaseServerClient(): SupabaseClient {
  if (!serverClient) {
    serverClient = createClient(
      assertEnv('NEXT_PUBLIC_SUPABASE_URL', supabaseUrl),
      assertEnv('SUPABASE_SERVICE_ROLE_KEY', supabaseServiceRoleKey),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return serverClient;
}
