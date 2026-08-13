import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url === 'your-project-url') {
    // Return a mock client for dev mode without Supabase
    return {
      auth: {
        signInWithPassword: async () => ({ error: { message: 'Supabase not configured. Add credentials to .env.local' }, data: { user: null, session: null } }),
        signOut: async () => {},
        getUser: async () => ({ data: { user: null } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            order: async () => ({ data: [], error: null }),
          }),
          in: () => ({
            single: async () => ({ data: null, error: null }),
            order: async () => ({ data: [], error: null }),
          }),
          order: async () => ({ data: [], error: null }),
        }),
        insert: () => ({
          select: () => ({
            single: async () => ({ data: { id: crypto.randomUUID() }, error: null }),
          }),
        }),
        update: () => ({
          eq: async () => ({ error: null }),
        }),
        delete: () => ({
          eq: async () => ({ error: null }),
        }),
        upsert: () => ({
          select: () => ({
            single: async () => ({ data: { id: crypto.randomUUID() }, error: null }),
          }),
        }),
      }),
    } as any
  }

  client = createBrowserClient(url, key)
  return client
}
