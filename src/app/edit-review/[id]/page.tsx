"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type Review = {
  id: number;
  user_id: number;
  book_title: string;
  rating: number;
  review: string;
  mood: string;
  reviewer_name: string;
  created_at: string;
};

export default function EditReviewPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id;

  const reviewId =
    typeof idParam === "string" ? Number(idParam) : Number(idParam?.[0]);

  const [bookTitle, setBookTitle] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [mood, setMood] = useState("inspirador");
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!reviewId || Number.isNaN(reviewId)) {
      setError("ID de reseña inválido");
      setLoading(false);
      return;
    }

    async function loadReview() {
      try {
        const res = await fetch("/api/reviews", {
          method: "GET",
          credentials: "include",
        });

        if (res.status === 401) {
          router.push("/login");
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.message ?? "Error al cargar la reseña");
          return;
        }

        const data = await res.json();
        const allReviews: Review[] = data.reviews ?? [];

        const found = allReviews.find((r) => r.id === reviewId);

        if (!found) {
          setError("Reseña no encontrada");
          return;
        }

        setBookTitle(found.book_title);
        setRating(found.rating);
        setReview(found.review);
        setMood(found.mood);
      } catch (err) {
        console.error(err);
        setError("Error de red");
      } finally {
        setLoading(false);
      }
    }

    loadReview();
  }, [router, reviewId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!reviewId || Number.isNaN(reviewId)) return;

    setError(null);
    setSaving(true);

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          book_title: bookTitle,
          rating,
          review,
          mood,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? "Error al actualizar la reseña");
      } else {
        router.push("/reviews");
      }
    } catch (err) {
      console.error(err);
      setError("Error de red");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-700">Cargando reseña...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow p-6 max-w-md w-full text-center space-y-3">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => router.push("/reviews")}
            className="mt-2 inline-flex items-center justify-center px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Volver a reseñas
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl text-black font-bold mb-4 text-center">
          Editar reseña
        </h1>

        {error && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-black text-sm font-medium mb-1">
              Título del libro
            </label>
            <input
              type="text"
              className="w-full text-black border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-black text-sm font-medium mb-1">
              Rating
            </label>
            <select
              className="w-full text-black border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} estrella{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-black text-sm font-medium mb-1">
              Mood
            </label>
            <select
              className="w-full text-black border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            >
              <option value="inspirador">Inspirador</option>
              <option value="nostálgico">Nostálgico</option>
              <option value="terror">Terror</option>
              <option value="reflexivo">Reflexivo</option>
              <option value="divertido">Divertido</option>
            </select>
          </div>

          <div>
            <label className="block text-black text-sm font-medium mb-1">
              Reseña (texto)
            </label>
            <textarea
              className="w-full text-black border rounded px-3 py-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 text-white py-2 rounded font-semibold text-sm hover:bg-green-700 disabled:opacity-60"
          >
            {saving ? "Guardando cambios..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </main>
  );
}
