// Optional cloud sync: loaded only when /config.js provides a Supabase URL and public key.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/+esm';
const TABLE = 'practice_records';
const toRow = r => ({ id: r.id, provider: r.provider, performance: r.performance ?? null, difficulty: r.difficulty, success: Boolean(r.success), seats: r.seats, elapsed_ms: r.elapsed, seat_time_ms: r.seatTime ?? null, first_click_ms: r.firstClick ?? null, failures: r.failures ?? 0, amount: r.amount ?? 0, practiced_at: r.date });
const fromRow = row => ({ id: row.id, provider: row.provider, performance: row.performance, difficulty: row.difficulty, success: row.success, seats: row.seats, elapsed: row.elapsed_ms, seatTime: row.seat_time_ms, firstClick: row.first_click_ms, failures: row.failures, amount: row.amount, date: row.practiced_at });
const check = ({ data, error }) => { if (error) throw error; return data; };
export function createSync({ url, anonKey }) {
  const client = createClient(url, anonKey);
  return {
    // Fires once with the restored session (or null), then on every sign-in/out.
    onAuth: callback => client.auth.onAuthStateChange((_event, session) => setTimeout(() => callback(session?.user ?? null))),
    signIn: email => client.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin } }).then(check),
    signOut: () => client.auth.signOut().then(check),
    // Uploads local records the account has not seen, then returns the account's latest 30.
    async merge(local) {
      if (local.length) check(await client.from(TABLE).upsert(local.map(toRow), { onConflict: 'id', ignoreDuplicates: true }));
      return check(await client.from(TABLE).select('*').order('practiced_at', { ascending: false }).limit(30)).map(fromRow);
    },
    push: async record => { check(await client.from(TABLE).insert(toRow(record))); },
    clear: async () => { check(await client.from(TABLE).delete().not('id', 'is', null)); },
  };
}
