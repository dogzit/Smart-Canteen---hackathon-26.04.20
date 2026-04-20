import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentName = searchParams.get("studentName") || "Zolo Student";

    const orders = await prisma.order.findMany({
      where: { studentName },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (e) {
    return NextResponse.json(
      { error: "Дата татахад алдаа гарлаа" },
      { status: 500 },
    );
  }
}
