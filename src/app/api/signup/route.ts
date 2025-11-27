import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

interface ExistingUserRow {
  id: number;
}

interface NewUserRow {
  id: number;
  name: string;
  email: string;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Datos incompletos" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    //Verificar si ya existe el email
    const existing = await query<ExistingUserRow>(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    const existingCount = existing.rowCount ?? 0;

    if (existingCount > 0) {
      return NextResponse.json(
        { message: "Email ya registrado" },
        { status: 409 }
      );
    }

    const result = await query<NewUserRow>(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashed]
    );

    const user = result.rows[0];

    const token = signToken({
      userId: user.id,
      name: user.name,
      email: user.email,
    });

    const res = NextResponse.json({ user });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}
