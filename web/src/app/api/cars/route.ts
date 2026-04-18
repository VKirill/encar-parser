import { NextRequest, NextResponse } from "next/server";
import { fetchCars } from "@/lib/encar-api";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const manufacturer = searchParams.get("manufacturer") ?? undefined;
  const limit = Math.min(Number(searchParams.get("limit") ?? 100), 200);

  try {
    const { cars, total } = await fetchCars({ limit, manufacturer });
    return NextResponse.json({ cars, total });
  } catch (error) {
    console.error("Encar API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cars" },
      { status: 500 }
    );
  }
}
