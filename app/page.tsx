"use client"

import React, { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

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

import { CheckCircle2, BookOpen } from "lucide-react"

export default function AddBookPage() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    condition: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

    setFormData({
      title: "",
      author: "",
      category: "",
      condition: "",
    })

    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-6 font-sans">
      <Card className="max-w-lg w-full bg-white border-stone-200 shadow-sm rounded-none border-t-4 border-t-stone-400">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xs uppercase tracking-[0.2em] text-stone-500 font-semibold">
                New Accession Entry
              </CardTitle>
              <BookOpen className="h-4 w-4 text-stone-300" />
            </div>

            <Button asChild variant="outline" size="sm" className="rounded-none">
              <Link href="/books">View Books</Link>
            </Button>
          </div>

          <h1 className="text-2xl font-serif italic text-stone-800">
            Library Registration
          </h1>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="title"
                  className="text-[10px] uppercase tracking-wider text-stone-400"
                >
                  Full Work Title
                </Label>
                <Input
                  id="title"
                  placeholder="Enter title..."
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="border-0 border-b border-stone-200 rounded-none focus-visible:ring-0 focus-visible:border-stone-800 px-0 text-lg placeholder:text-stone-300 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 pt-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="author"
                    className="text-[10px] uppercase tracking-wider text-stone-400"
                  >
                    Primary Author
                  </Label>
                  <Input
                    id="author"
                    placeholder="Surname, First Name"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    className="border-0 border-b border-stone-200 rounded-none focus-visible:ring-0 focus-visible:border-stone-800 px-0 placeholder:text-stone-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-stone-400">
                    Classification
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
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
                    onValueChange={(value) =>
                      setFormData({ ...formData, condition: value })
                    }
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
                disabled={isSubmitting}
                className="w-full bg-stone-800 hover:bg-stone-900 text-stone-100 rounded-none h-12 tracking-widest uppercase text-xs font-medium"
              >
                {isSubmitting ? "Processing..." : "Commit to Archive"}
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
