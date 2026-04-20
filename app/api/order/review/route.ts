import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const { studentName, itemName, rating, review } = await req.json();

    // Тухайн оюутны тухайн хоолон дээрх хамгийн сүүлийн захиалгыг олох
    const lastOrder = await prisma.order.findFirst({
      where: { studentName, itemName },
      orderBy: { createdAt: "desc" },
    });

    if (!lastOrder) {
      return NextResponse.json(
        { error: "Захиалга олдсонгүй" },
        { status: 404 },
      );
    }

    // Зөвхөн тэр сүүлийн захиалга дээр үнэлгээг шинэчлэх
    const updatedOrder = await prisma.order.update({
      where: { id: lastOrder.id },
      data: { rating, review },
    });

    return NextResponse.json(updatedOrder);
  } catch (e) {
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
