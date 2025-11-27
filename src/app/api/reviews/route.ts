import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ message: "Token invalido" }, { status: 401 });
    }

    const result = await query(
      `SELECT r.id, r.book_title, r.rating, r.review, r.mood, r.user_id,
              u.name as reviewer_name, r.created_at
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at ASC`
    );

    return NextResponse.json({
      reviews: result.rows,
      currentUserId: payload.userId,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ message: "Token inválido" }, { status: 401 });
    }

    const { book_title, rating, review, mood } = await req.json();

    if (!book_title || !rating || !review || !mood) {
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
      `INSERT INTO reviews (user_id, book_title, rating, review, mood, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [payload.userId, book_title, rating, review, mood]
    );

    return NextResponse.json({ message: "Reseña creada" }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}
