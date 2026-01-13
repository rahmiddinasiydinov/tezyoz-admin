"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";
import { Plus, Trash2, Moon, Sun, Type, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import type { Text, Language, TextsResponse } from "@/lib/types";

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "UZBEK", label: "O'zbek" },
  { value: "RUSSIAN", label: "Русский" },
  { value: "ENGLISH", label: "English" },
  { value: "KRILL", label: "Ўзбек (Кирилл)" },
];

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch");
  }
  return res.json();
};

export default function AdminPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [newText, setNewText] = useState({ language: "" as Language | "", content: "" });

  const { data, error, isLoading } = useSWR<TextsResponse>("/api/texts?limit=50", fetcher);

  const handleCreate = async () => {
    if (!newText.language || !newText.content.trim()) {
      toast.error("Til va matn kiritilishi shart");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/texts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          language: newText.language,
          content: newText.content.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Yaratishda xatolik");
      }

      toast.success("Matn muvaffaqiyatli yaratildi");
      setNewText({ language: "", content: "" });
      setIsCreateOpen(false);
      mutate("/api/texts?limit=50");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/texts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "O'chirishda xatolik");
      }

      toast.success("Matn o'chirildi");
      mutate("/api/texts?limit=50");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateText = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Type className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold">TezYoz Admin</h1>
              <p className="text-sm text-muted-foreground">Matnlarni boshqarish</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Mavzuni almashtirish</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                setIsLoggingOut(true);
                try {
                  await fetch("/api/auth/logout", { method: "POST" });
                  router.push("/login");
                  router.refresh();
                } catch {
                  toast.error("Chiqishda xatolik");
                } finally {
                  setIsLoggingOut(false);
                }
              }}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? "Chiqilmoqda..." : "Chiqish"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-card rounded-xl border shadow-sm">
          {/* Toolbar */}
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold">Yozish matnlari</h2>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Yangi matn
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Yangi matn qo&apos;shish</DialogTitle>
                  <DialogDescription>
                    Yozish testi uchun yangi matn yarating
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="language">Til</Label>
                    <Select
                      value={newText.language}
                      onValueChange={(value: Language) =>
                        setNewText({ ...newText, language: value })
                      }
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Tilni tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="content">Matn</Label>
                    <Textarea
                      id="content"
                      value={newText.content}
                      onChange={(e) =>
                        setNewText({ ...newText, content: e.target.value })
                      }
                      placeholder="Yozish uchun matn kiriting..."
                      className="min-h-[150px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      {newText.content.length} / 10000 belgi
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Bekor qilish
                  </Button>
                  <Button onClick={handleCreate} disabled={isCreating}>
                    {isCreating ? "Yaratilmoqda..." : "Yaratish"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Table */}
          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Yuklanmoqda...
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">
                Xatolik: {error.message}
              </div>
            ) : !data?.data?.length ? (
              <div className="text-center py-12 text-muted-foreground">
                Hali matnlar yo&apos;q. Birinchi matningizni qo&apos;shing!
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Til</TableHead>
                    <TableHead>Matn</TableHead>
                    <TableHead className="w-[120px]">Sana</TableHead>
                    <TableHead className="w-[80px] text-right">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((text: Text) => (
                    <TableRow key={text.id}>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground">
                          {LANGUAGES.find((l) => l.value === text.language)?.label || text.language}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm truncate" title={text.content}>
                          {truncateText(text.content)}
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(text.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              disabled={deletingId === text.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Matnni o&apos;chirishni tasdiqlang
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Bu amal qaytarib bo&apos;lmaydi. Matn butunlay o&apos;chiriladi.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(text.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                O&apos;chirish
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Footer with count */}
          {data?.meta && (
            <div className="p-4 border-t text-sm text-muted-foreground">
              Jami: {data.meta.total} ta matn
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
