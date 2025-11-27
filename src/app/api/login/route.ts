import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const result = await query<UserRow>(
      "SELECT id, name, email, password FROM users WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Credenciales invalidas" },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return NextResponse.json(
        { message: "Credenciales invalidas" },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: user.id,
      name: user.name,
      email: user.email,
    });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ message: "Inicio de sesión exitoso" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}
