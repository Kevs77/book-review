import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

interface ReviewOwnerRow {
  user_id: number;
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 });
    }

    const result = await query<ReviewOwnerRow>(
      "SELECT user_id FROM reviews WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "No encontrado" }, { status: 404 });
    }

    const review = result.rows[0];

    if (review.user_id !== payload.userId) {
      return NextResponse.json({ message: "Prohibido" }, { status: 403 });
    }

    await query("DELETE FROM reviews WHERE id = $1", [id]);

    return NextResponse.json({ message: "Reseña eliminada" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 });
    }

    // verificar que exista y sea del usuario
    const result = await query<ReviewOwnerRow>(
      "SELECT user_id FROM reviews WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ message: "No encontrado" }, { status: 404 });
    }

    const review = result.rows[0];

    if (review.user_id !== payload.userId) {
      return NextResponse.json({ message: "Prohibido" }, { status: 403 });
    }

    const { book_title, rating, review: reviewText, mood } = await req.json();

    if (!book_title || !rating || !reviewText || !mood) {
      return NextResponse.json(
        { message: "Datos incompletos" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating debe estar entre 1 y 5" },
        { status: 400 }
      );
    }

    await query(
      `UPDATE reviews
       SET book_title = $2,
           rating = $3,
           review = $4,
           mood = $5
       WHERE id = $1`,
      [id, book_title, rating, reviewText, mood]
    );

    return NextResponse.json({ message: "Reseña actualizada" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}
