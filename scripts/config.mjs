// Public client config only: the URL and the anon/publishable key are safe to ship to browsers.
// Never read a service-role/secret key here.
export function clientConfig(env = process.env) {
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  return `export const supabaseConfig = ${JSON.stringify(url && anonKey ? { url, anonKey } : null)};\n`;
}
