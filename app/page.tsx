"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { getMyRole } from "@/lib/auth"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { CheckCircle2, BookOpen, LogOut } from "lucide-react"

export default function AddBookPage() {
  const router = useRouter()

  const [role, setRole] = useState<"admin" | "viewer" | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    condition: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace("/login")
        return
      }

      const r = await getMyRole()
      setRole(r)
      setAuthLoading(false)
    })()
  }, [router])

  const logout = async () => {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (role !== "admin") return

    setIsSubmitting(true)
    setError(null)
    setShowSuccess(false)

    const { error } = await supabase.from("books").insert({
      title: formData.title,
      author: formData.author || null,
      category: formData.category || null,
      condition: formData.condition || null,
    })

    setIsSubmitting(false)

    if (error) {
      setError(error.message)
      return
    }

    setFormData({ title: "", author: "", category: "", condition: "" })
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2500)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-6">
        <div className="text-sm text-stone-500">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-6 font-sans">
      <Card className="max-w-lg w-full bg-white border-stone-200 shadow-sm rounded-none border-t-4 border-t-stone-400">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xs uppercase tracking-[0.2em] text-stone-500 font-semibold">
                New Accession Entry
              </CardTitle>
              <BookOpen className="h-4 w-4 text-stone-300" />
            </div>

            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="rounded-none">
                <Link href="/books">View Books</Link>
              </Button>

              <Button variant="outline" size="sm" className="rounded-none" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-serif italic text-stone-800">Library Registration</h1>
            <div className="text-[10px] uppercase tracking-wider text-stone-400">
              Role: <span className="text-stone-700 font-semibold">{role ?? "viewer"}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {role !== "admin" && (
            <div className="mb-4 text-xs text-amber-900 bg-amber-50 border border-amber-200 px-3 py-2 rounded-none">
              Viewer mode: you can browse books, but you can’t add or delete.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase tracking-wider text-stone-400">
                  Full Work Title
                </Label>
                <Input
                  placeholder="Enter title..."
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border-0 border-b border-stone-200 rounded-none focus-visible:ring-0 focus-visible:border-stone-800 px-0 text-lg placeholder:text-stone-300 transition-colors"
                />
              </div>

              <div className="space-y-1.5 pt-2">
                <Label className="text-[10px] uppercase tracking-wider text-stone-400">
                  Primary Author
                </Label>
                <Input
                  placeholder="Surname, First Name"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="border-0 border-b border-stone-200 rounded-none focus-visible:ring-0 focus-visible:border-stone-800 px-0 placeholder:text-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-8 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-stone-400">
                    Classification
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger className="border-0 border-b border-stone-200 rounded-none focus:ring-0 px-0 h-9">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="islamic">Islamic</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="literature">Literature</SelectItem>
                      <SelectItem value="novels">Novels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-stone-400">
                    Physical Condition
                  </Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(v) => setFormData({ ...formData, condition: v })}
                  >
                    <SelectTrigger className="border-0 border-b border-stone-200 rounded-none focus:ring-0 px-0 h-9">
                      <SelectValue placeholder="Select Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">As New</SelectItem>
                      <SelectItem value="good">Fine / Good</SelectItem>
                      <SelectItem value="worn">Worn / Aged</SelectItem>
                      <SelectItem value="damaged">Archival / Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            <div className="pt-4 flex flex-col items-center gap-4">
              <Button
                type="submit"
                disabled={isSubmitting || role !== "admin"}
                className="w-full bg-stone-800 hover:bg-stone-900 text-stone-100 rounded-none h-12 tracking-widest uppercase text-xs font-medium"
              >
                {role !== "admin"
                  ? "Viewer — Cannot Add"
                  : isSubmitting
                  ? "Processing..."
                  : "Commit to Archive"}
              </Button>

              {error && (
                <div className="w-full text-center text-xs text-red-700 bg-red-50 border border-red-200 rounded-none px-3 py-2">
                  {error}
                </div>
              )}

              {showSuccess && !error && (
                <div className="flex items-center gap-2 text-emerald-700 animate-in fade-in slide-in-from-bottom-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase tracking-tighter">
                    Entry successfully registered
                  </span>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
