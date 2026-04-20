import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type ApiError = { error: string };

// Cloudinary-ийн үндсэн зураг
const DEFAULT_IMAGE =
  "https://res.cloudinary.com/dr26hcsf0/image/upload/v1775213396/hwork/tc2v8kcuggikaqlvfdgq.jpg";

interface MenuBody {
  name: string;
  price: number;
  description?: string;
  image?: string;
}

export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(menus);
  } catch (e) {
    return NextResponse.json(
      { error: "Мэдээлэл авахад алдаа гарлаа" } satisfies ApiError,
      { status: 500 },
    );
  }
}

// POST: Шинэ цэс нэмэх
export async function POST(req: Request) {
  try {
    const rawBody: unknown = await req.json().catch(() => null);

    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json(
        { error: "Буруу хүсэлт илгээсэн байна" } satisfies ApiError,
        {
          status: 400,
        },
      );
    }

    const { name, price, description, image } = rawBody as MenuBody;

    // Мэдээллийн бүрэн бүтэн байдлыг шалгах
    if (!name || price === undefined || price === null) {
      return NextResponse.json(
        { error: "Хоолны нэр болон үнэ заавал байх ёстой" } satisfies ApiError,
        { status: 400 },
      );
    }

    const menu = await prisma.menu.create({
      data: {
        name: name.trim(),
        price: Number(price),
        description: description?.trim() || null,
        // Хэрэв image ирээгүй бол Cloudinary URL-ыг хадгална
        image: image || DEFAULT_IMAGE,
      },
    });

    return NextResponse.json(menu, { status: 201 });
  } catch (e) {
    console.error("Prisma Error:", e);
    return NextResponse.json(
      { error: "Серверийн алдаа гарлаа" } satisfies ApiError,
      {
        status: 500,
      },
    );
  }
}
