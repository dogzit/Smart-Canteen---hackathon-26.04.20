import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

type ApiError = { error: string };

interface CreateOrderRequest {
  studentName: string;
  itemName: string;
  quantity: number;
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" } satisfies ApiError, {
        status: 400,
      });
    }

    const { studentName, itemName, quantity } = body as CreateOrderRequest;

    // Төрөл бүрийг нарийн шалгах
    if (typeof studentName !== "string" || studentName.trim().length === 0) {
      return NextResponse.json(
        { error: "studentName is required" } satisfies ApiError,
        { status: 400 },
      );
    }
    if (typeof itemName !== "string" || itemName.trim().length === 0) {
      return NextResponse.json(
        { error: "itemName is required" } satisfies ApiError,
        { status: 400 },
      );
    }
    if (typeof quantity !== "number" || quantity <= 0) {
      return NextResponse.json(
        { error: "valid quantity is required" } satisfies ApiError,
        { status: 400 },
      );
    }

    const newOrder = await prisma.order.create({
      data: {
        studentName: studentName.trim(),
        itemName: itemName.trim(),
        quantity: quantity,
      },
    });

    return NextResponse.json({ ok: true, order: newOrder }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" } satisfies ApiError, {
      status: 500,
    });
  }
}
