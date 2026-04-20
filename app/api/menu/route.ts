import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client"; // Prisma-ийн төрлийг импортлох

const DEFAULT_IMAGE =
  "https://res.cloudinary.com/dr26hcsf0/image/upload/v1775213396/hwork/tc2v8kcuggikaqlvfdgq.jpg";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    // Төрлийг нь Prisma-ийн стандартаар зааж өгснөөр алдаа арилна
    const whereClause: Prisma.MenuWhereInput =
      category && category !== "All" ? { category: category } : {};

    const menus = await prisma.menu.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(menus);
  } catch (e) {
    console.error("GET Error:", e);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, price, description, image, category } = body;

    if (!name || price === undefined || !category) {
      return NextResponse.json(
        { error: "Мэдээлэл дутуу байна" },
        { status: 400 },
      );
    }

    const menu = await prisma.menu.create({
      data: {
        name: name.trim(),
        price: Number(price),
        category: category,
        description: description?.trim() || null,
        image: image || DEFAULT_IMAGE,
      },
    });

    return NextResponse.json(menu, { status: 201 });
  } catch (e) {
    console.error("POST Error:", e);
    return NextResponse.json({ error: "Серверийн алдаа" }, { status: 500 });
  }
}
