import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// 1. БҮХ ХООЛЫГ ТАТАХ (GET)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const whereClause =
      category && category !== "All" ? { category: category } : {};

    const menus = await prisma.menuItem.findMany({
      where: whereClause,
      orderBy: { id: "desc" }, // Сүүлд нэмэгдсэн нь эхэндээ харагдана
    });

    return NextResponse.json(menus);
  } catch (e) {
    console.error("GET ALL Error:", e);
    return NextResponse.json(
      { error: "Дата татахад алдаа гарлаа" },
      { status: 500 },
    );
  }
}

// 2. ШИНЭ ХООЛ НЭМЭХ (POST)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, price, image, category } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: "Мэдээлэл дутуу байна" },
        { status: 400 },
      );
    }

    const newItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image,
        category,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (e) {
    console.error("POST Error:", e);
    return NextResponse.json(
      { error: "Хоол нэмэхэд алдаа гарлаа" },
      { status: 500 },
    );
  }
}
