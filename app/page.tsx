"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddBookForm() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    condition: "",
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    const { error } = await supabase.from("books").insert({
      title: formData.title,
      author: formData.author || null,
      category: formData.category || null,
      condition: formData.condition || null,
    });

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setFormData({
      title: "",
      author: "",
      category: "",
      condition: "",
    });

    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-xl">Add New Book</CardTitle>
            <CardDescription>
              Add a book to your personal library.
            </CardDescription>
          </div>

          {/* 👉 View Books button */}
          <Button asChild variant="outline" size="sm">
            <Link href="/books">View Books</Link>
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Riyad as-Saliheen"
              />
            </div>

            <div className="space-y-2">
              <Label>Author</Label>
              <Input
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                placeholder="Imam an-Nawawi"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) =>
                  setFormData({ ...formData, category: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="fiqh">Fiqh</SelectItem>
                  <SelectItem value="hadith">Hadith</SelectItem>
                  <SelectItem value="literature">Literature</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Condition</Label>
              <Select
                value={formData.condition}
                onValueChange={(v) =>
                  setFormData({ ...formData, condition: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="worn">Worn</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Add Book"}
            </Button>

            {success && (
              <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-1 text-center">
                Book added successfully ✓
              </div>
            )}

            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-1 text-center">
                {error}
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
