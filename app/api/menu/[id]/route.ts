import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }, // Params-ийг Promise гэж тодорхойлно
) {
  try {
    // 1. params-ийг await хийж задлах (Next.js 15+ дүрэм)
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // 2. ID-г тоо руу хөрвүүлж шалгах
    const menuItemId = parseInt(id);

    if (isNaN(menuItemId)) {
      return NextResponse.json({ error: "Буруу ID формат" }, { status: 400 });
    }

    // 3. Prisma query
    const menuItem = await prisma.menuItem.findUnique({
      where: {
        id: menuItemId,
      },
      include: {
        reviews: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!menuItem) {
      return NextResponse.json({ error: "Хоол олдсонгүй" }, { status: 404 });
    }

    return NextResponse.json(menuItem);
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
