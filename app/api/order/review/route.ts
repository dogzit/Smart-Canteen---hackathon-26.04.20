import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { studentName, menuItemId, rating, review } = body;

    // 1. ID байгаа эсэхийг шалгах
    if (!menuItemId || isNaN(Number(menuItemId))) {
      return NextResponse.json({ error: "Буруу MenuItem ID" }, { status: 400 });
    }

    // 2. Энэ ID-тай хоол баазад байгаа эсэхийг шалгах
    const itemExists = await prisma.menuItem.findUnique({
      where: { id: Number(menuItemId) },
    });

    if (!itemExists) {
      return NextResponse.json(
        {
          error: `ID: ${menuItemId} бүхий хоол олдсонгүй. Уучлаарай, хуучин захиалга дээр үнэлгээ өгөх боломжгүй.`,
        },
        { status: 404 },
      );
    }

    // 3. Байгаа бол Upsert хийх
    const result = await prisma.review.upsert({
      where: {
        studentName_menuItemId: {
          studentName,
          menuItemId: Number(menuItemId),
        },
      },
      update: {
        rating: Number(rating),
        review: review || "",
      },
      create: {
        studentName,
        rating: Number(rating),
        review: review || "",
        menuItemId: Number(menuItemId),
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Review error:", error);
    return NextResponse.json(
      { error: "Үнэлгээ хадгалахад алдаа гарлаа" },
      { status: 500 },
    );
  }
}
