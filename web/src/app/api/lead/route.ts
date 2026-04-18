import { NextRequest, NextResponse } from "next/server";
import { appendFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const LEADS_DIR = join(process.cwd(), "data");
const LEADS_FILE = join(LEADS_DIR, "leads.jsonl");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, phone, comment, carId, carTitle, carYear, carPrice, carMileage } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    const lead = {
      name,
      phone,
      comment: comment ?? "",
      carId: carId ?? null,
      carTitle: carTitle ?? null,
      carYear: carYear ?? null,
      carPrice: carPrice ?? null,
      carMileage: carMileage ?? null,
      ip: request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for") ?? "",
      createdAt: new Date().toISOString(),
    };

    // Сохраняем в JSONL файл
    if (!existsSync(LEADS_DIR)) {
      mkdirSync(LEADS_DIR, { recursive: true });
    }
    appendFileSync(LEADS_FILE, JSON.stringify(lead) + "\n", "utf-8");

    console.log(`[LEAD] ${name} / ${phone} / ${carTitle ?? "общая заявка"}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Lead save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
