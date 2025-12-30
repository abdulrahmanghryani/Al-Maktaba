import { supabase } from "@/lib/supabaseClient"

export async function getSessionUser() {
  const { data } = await supabase.auth.getSession()
  return data.session?.user ?? null
}

export async function getMyRole(): Promise<"admin" | "viewer" | null> {
  const user = await getSessionUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (error) return null
  return (data?.role as "admin" | "viewer") ?? null
}
