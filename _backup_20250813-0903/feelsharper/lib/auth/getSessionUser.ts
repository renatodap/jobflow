import { createSupabaseServer } from "@/lib/supabase/server";

export async function getSessionUser() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user; // null if not logged in
}
