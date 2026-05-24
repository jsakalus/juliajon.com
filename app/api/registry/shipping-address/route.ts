import { NextResponse } from "next/server";

export async function GET() {
  const address = process.env.SHIPPING_ADDRESS ?? null;
  return NextResponse.json({ address });
}
