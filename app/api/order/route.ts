import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentName, itemName, quantity, menuItemId } = body;

    // ШАЛГАЛТ: Мэдээлэл дутуу ирж байгаа эсэхийг шалгана
    if (!studentName || !menuItemId) {
      console.error("Missing fields:", { studentName, menuItemId });
      return NextResponse.json(
        { error: "Оюутны нэр эсвэл Хоолны ID дутуу байна." },
        { status: 400 },
      );
    }

    const newOrder = await prisma.order.create({
      data: {
        studentName,
        itemName,
        quantity: Number(quantity) || 1,
        menuItemId: Number(menuItemId), // Энийг заавал Number болгоно
        status: "PENDING",
      },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error("Order Create Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
