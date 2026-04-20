import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
  try {
    const { email, code, name, pin } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json(
        { success: false, message: "Хэрэглэгч олдсонгүй." },
        { status: 404 },
      );

    const latestOtp = await prisma.otp.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (
      !latestOtp ||
      latestOtp.code !== code ||
      new Date() > latestOtp.expiresAt
    ) {
      return NextResponse.json(
        { success: false, message: "Код буруу эсвэл хугацаа дууссан." },
        { status: 400 },
      );
    }

    // 🔥 OTP ЗӨВ БОЛ: Хэрэглэгчийн мэдээллийг гүйцээж хадгалах (Signup)
    await prisma.user.update({
      where: { email },
      data: { name, pin },
    });
    await prisma.otp.deleteMany({ where: { userId: user.id } });

    // JWT үүсгэх
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "smart-canteen-secret",
    );
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(secret);

    const response = NextResponse.json({
      success: true,
      message: "Бүртгэл амжилттай!",
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
