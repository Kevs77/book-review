"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Fecha desconocida";

  return d.toLocaleString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  useEffect(() => {
    async function loadReviews() {
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
          setError(data?.message ?? "Error al cargar reseñas");
        } else {
          const data = await res.json();
          setReviews(data.reviews);
          setCurrentUserId(data.currentUserId ?? null);
          setCurrentPage(1);
        }
      } catch (err) {
        console.error(err);
        setError("Error de red");
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, [router]);

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar esta reseña?")) return;

    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.message ?? "No se pudo eliminar");
        return;
      }

      setReviews((prev) => {
        const updated = prev.filter((r) => r.id !== id);
        // paginacion
        const totalPages = Math.max(1, Math.ceil(updated.length / pageSize));
        if (currentPage > totalPages) {
          setCurrentPage(totalPages);
        }
        return updated;
      });
    } catch (err) {
      console.error(err);
      alert("Error de red");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Cargando reseñas...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  const totalPages = Math.max(1, Math.ceil(reviews.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedReviews = reviews.slice(startIndex, startIndex + pageSize);

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-white shadow mb-6">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl text-black font-bold">📙Reseñas de libros</h1>

          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={() => router.push("/add-review")}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Añadir reseña
            </button>

            <button
              onClick={() => router.push("/login")}
              className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Cambiar usuario
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 pb-8">
        {reviews.length === 0 ? (
          <p className="text-sm text-black text-gray-600">
            Aún no hay reseñas. Sé el primero en{" "}
            <button
              onClick={() => router.push("/add-review")}
              className="text-blue-600 underline"
            >
              añadir una
            </button>
            .
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedReviews.map((r) => (
                <article
                  key={r.id}
                  className="bg-white rounded-lg shadow p-4 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h2 className="font-semibold text-black text-lg">
                        {r.book_title}
                      </h2>
                      <p className="text-xs text-gray-500">
                        Por {r.reviewer_name} · Mood:{" "}
                        <span className="font-medium">{r.mood}</span>
                      </p>
                    </div>
                    <div className="text-yellow-500 text-sm font-semibold">
                      {"⭐".repeat(r.rating)}
                    </div>
                  </div>

                  <p className="text-sm text-gray-800">{r.review}</p>

                  <p className="text-xs text-gray-500">
                    Fecha de creación: {formatDateTime(r.created_at)}
                  </p>

                  {currentUserId != null && r.user_id === currentUserId && (
                    <div className="mt-2 flex gap-3 text-xs">
                      <button
                        onClick={() => router.push(`/edit-review/${r.id}`)}
                        className="text-blue-600 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* paginacion */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === 1
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 border hover:bg-blue-700"
                  }`}
                >
                  Anterior
                </button>

                <span className="text-sm text-gray-700">
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === totalPages
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 border hover:bg-blue-700"
                  }`}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
