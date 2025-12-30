"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/")
    })
  }, [router])

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErr(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setErr(error.message)
      return
    }

    router.replace("/")
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-6">
      <Card className="max-w-md w-full rounded-none border-stone-200 border-t-4 border-t-stone-400 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-serif italic text-stone-800">
            Al-Maktaba Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
            </div>

            {err && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-none">
                {err}
              </div>
            )}

            <Button type="submit" className="w-full rounded-none" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
