"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddReviewPage() {
  const router = useRouter();
  const [bookTitle, setBookTitle] = useState("");
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [mood, setMood] = useState("inspirador");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/reviews", { credentials: "include" });
      if (res.status === 401) {
        router.push("/login");
      }
    }
    checkAuth();
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
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
        setError(data?.message ?? "Error al crear reseña");
      } else {
        router.push("/reviews");
      }
    } catch (err) {
      console.error(err);
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl text-black font-bold mb-4 text-center">
          Añadir nueva reseña
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
              <option value="nostalgico">Nostálgico</option>
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
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded font-semibold text-sm hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar reseña"}
          </button>
        </form>
      </div>
    </main>
  );
}
