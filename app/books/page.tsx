"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { getMyRole } from "@/lib/auth"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Book = {
  id: number
  title: string
  author: string | null
  category: string | null
  condition: string | null
  created_at: string
}

export default function BooksPage() {
  const router = useRouter()

  const [role, setRole] = useState<"admin" | "viewer" | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  const [q, setQ] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [condition, setCondition] = useState<string>("all")

  const [openId, setOpenId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // auth guard
  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.replace("/login")
        return
      }
      const r = await getMyRole()
      setRole(r ?? "viewer")
      setAuthLoading(false)
    })()
  }, [router])

  const logout = async () => {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  const loadBooks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false })

    setLoading(false)

    if (error) {
      console.error(error)
      return
    }

    setBooks((data ?? []) as Book[])
  }

  useEffect(() => {
    if (!authLoading) loadBooks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading])

  const categories = useMemo(() => {
    const set = new Set<string>()
    books.forEach((b) => b.category && set.add(b.category))
    return ["all", ...Array.from(set).sort()]
  }, [books])

  const conditions = ["all", "new", "good", "worn", "damaged"]

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return books.filter((b) => {
      const text = `${b.title} ${b.author ?? ""}`.toLowerCase()
      const matchQ = query ? text.includes(query) : true
      const matchCat = category === "all" ? true : b.category === category
      const matchCond = condition === "all" ? true : b.condition === condition
      return matchQ && matchCat && matchCond
    })
  }, [books, q, category, condition])

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString()
    } catch {
      return iso
    }
  }

  const deleteBook = async (id: number) => {
    if (role !== "admin") return
    const ok = confirm("Delete this book?")
    if (!ok) return

    setDeletingId(id)

    const { error } = await supabase.from("books").delete().eq("id", id)

    setDeletingId(null)

    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    setBooks((prev) => prev.filter((b) => b.id !== id))
    if (openId === id) setOpenId(null)
  }

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" })

    const headerTitle = "Al-Maktaba — Books Catalog"
    const printedAt = new Date().toLocaleString()

    doc.setFontSize(16)
    doc.text(headerTitle, 14, 16)
    doc.setFontSize(10)
    doc.text(`Printed: ${printedAt}`, 14, 22)

    const groups = new Map<string, Book[]>()
    for (const b of filtered) {
      const key = (b.category || "Uncategorized").trim() || "Uncategorized"
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(b)
    }

    const sortedGroupNames = Array.from(groups.keys()).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    )

    let y = 28

    for (const groupName of sortedGroupNames) {
      const groupBooks = groups.get(groupName) ?? []

      doc.setFontSize(12)
      doc.text(groupName, 14, y)
      y += 4

      autoTable(doc, {
        startY: y,
        head: [["#", "Title", "Author", "Condition"]],
        body: groupBooks.map((b, i) => [
          String(i + 1),
          b.title,
          b.author || "",
          b.condition || "",
        ]),
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 85 },
          2: { cellWidth: 55 },
          3: { cellWidth: 30 },
        },
        margin: { left: 14, right: 14 },
      })

      const lastY = (doc as any).lastAutoTable?.finalY
      y = (typeof lastY === "number" ? lastY : y) + 10

      if (y > 270) {
        doc.addPage()
        y = 16
      }
    }

    const totalPages = doc.getNumberOfPages()
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p)
      const pageSize = doc.internal.pageSize
      doc.setFontSize(9)
      doc.text(
        `Page ${p} / ${totalPages}`,
        pageSize.getWidth() - 14,
        pageSize.getHeight() - 10,
        { align: "right" }
      )
    }

    doc.save("al-maktaba-books.pdf")
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-6">
        <div className="text-sm text-stone-500">Loading…</div>
      </div>
    )
  }

  return (
    <div className="flex items-start justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-3xl space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Books</h1>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${filtered.length} shown • ${books.length} total`} • Role:{" "}
              <span className="font-semibold">{role ?? "viewer"}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadBooks} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </Button>

            <Button
              variant="outline"
              onClick={exportPdf}
              disabled={loading || filtered.length === 0}
            >
              Export PDF
            </Button>

            <Button asChild>
              <Link href="/">Add Book</Link>
            </Button>

            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Filter</CardTitle>
            <CardDescription>Search and filter your catalog.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Title or author..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c === "all" ? "All" : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Condition</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="All conditions" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c === "all" ? "All" : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Catalog</CardTitle>
            <CardDescription>Click a book title to view details.</CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">No books found.</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((b) => {
                  const open = openId === b.id
                  const isDeleting = deletingId === b.id

                  return (
                    <div key={b.id} className="rounded-lg border bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggle(b.id)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 focus:outline-none"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium leading-tight">{b.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {open ? "Hide" : "Details"}
                          </div>
                        </div>
                      </button>

                      {open && (
                        <div className="px-4 pb-4 pt-2 border-t bg-slate-50/40">
                          <div className="grid gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Author: </span>
                              <span>{b.author || "—"}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Category: </span>
                              <span>{b.category || "—"}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Condition: </span>
                              <span>{b.condition || "—"}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Added: </span>
                              <span>{formatDate(b.created_at)}</span>
                            </div>

                            {role === "admin" && (
                              <div className="pt-2">
                                <Button
                                  variant="destructive"
                                  onClick={() => deleteBook(b.id)}
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? "Deleting..." : "Delete Book"}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
