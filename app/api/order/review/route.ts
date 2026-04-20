import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { studentName, rating, review, itemName } = body;
    let menuItemId = body.menuItemId;

    // 1. Хэрэв ID байхгүй бол нэрээр нь ID-г шүүж олох
    if (!menuItemId && itemName) {
      const item = await prisma.menuItem.findFirst({
        where: { name: itemName },
      });
      menuItemId = item?.id;
    }

    // 2. Шаардлагатай дата байгаа эсэхийг шалгах
    if (!studentName || !menuItemId || !rating) {
      return NextResponse.json(
        { error: "Хоолны мэдээлэл дутуу байна (ID эсвэл Нэр олдсонгүй)" },
        { status: 400 },
      );
    }

    // 3. Review-г Upsert хийх
    const result = await prisma.review.upsert({
      where: {
        studentName_menuItemId: {
          studentName: studentName,
          menuItemId: Number(menuItemId),
        },
      },
      update: {
        rating: Number(rating),
        review: review || "",
      },
      create: {
        studentName: studentName,
        rating: Number(rating),
        review: review || "",
        menuItem: {
          connect: { id: Number(menuItemId) },
        },
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (e: any) {
    console.error("PATCH Error:", e);
    return NextResponse.json(
      { error: "Алдаа гарлаа", details: e.message },
      { status: 500 },
    );
  }
}
