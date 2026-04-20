import { NextRequest, NextResponse } from "next/server";
import { transporter } from "@/lib/mail";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email as string; // Explicit casting

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email шаардлагатай." },
        { status: 400 },
      );
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60000);

    // 1. Хэрэглэгчийг олох эсвэл үүсгэх
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        pin: "",
      },
    });

    // 2. Хуучин OTP-г устгах ба шинийг үүсгэх (Transaction ашиглавал илүү найдвартай)
    await prisma.$transaction([
      prisma.otp.deleteMany({ where: { userId: user.id } }),
      prisma.otp.create({
        data: {
          code: otpCode,
          userId: user.id,
          expiresAt,
        },
      }),
    ]);

    // 3. Email илгээх
    try {
      await transporter.sendMail({
        from: `"School Hub" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Баталгаажуулах код",
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #333;">Баталгаажуулах код</h2>
            <p>Таны нэвтрэх код:</p>
            <h1 style="color: #2563eb; letter-spacing: 5px;">${otpCode}</h1>
            <p style="color: #666; font-size: 12px;">Энэхүү код нь 5 минутын дараа хүчингүй болно.</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.error("MAIL_ERROR:", mailError);
      return NextResponse.json(
        { success: false, message: "Имэйл илгээхэд алдаа гарлаа." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, message: "OTP илгээгдлээ." });
  } catch (error: unknown) {
    // 'any'-г 'unknown' болгож засав
    console.error("OTP_SEND_ERROR:", error);

    let errorMessage = "Серверт алдаа гарлаа.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        message: "Серверт алдаа гарлаа.",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
