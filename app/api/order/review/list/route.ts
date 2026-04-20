import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentName = searchParams.get("studentName");

  if (!studentName) {
    return NextResponse.json({ error: "Нэр байхгүй байна" }, { status: 400 });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { studentName: studentName },
    });
    return NextResponse.json(reviews);
  } catch (e) {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
