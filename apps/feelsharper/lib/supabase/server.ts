import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/database";

export async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key: string) => cookieStore.get(key)?.value,
        set: (key: string, value: string, opts: any) => {
          cookieStore.set(key, value, opts);
        },
        remove: (key: string, opts: any) => {
          cookieStore.set(key, "", { ...opts, maxAge: 0 });
        },
      },
    }
  );
}
