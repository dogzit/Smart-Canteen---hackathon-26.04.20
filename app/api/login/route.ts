import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
  try {
    const { email, pin } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.pin !== pin) {
      return NextResponse.json(
        { success: false, message: "Имэйл эсвэл ПИН буруу байна." },
        { status: 401 },
      );
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "smart-canteen-secret",
    );

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(secret);

    // Хариунд хэрэглэгчийн нэр болон имэйлийг фронтенд руу буцааж байна
    const response = NextResponse.json({
      success: true,
      message: "Амжилттай нэвтэрлээ!",
      name: user.name,
      email: user.email,
    });

    response.cookies.set("auth-token", token, { httpOnly: true, path: "/" });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Алдаа гарлаа." },
      { status: 500 },
    );
  }
}
