import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { registry_item_id, guest_id, guest_name, contribution_type, amount } = body;

  if (!registry_item_id || !contribution_type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!guest_name?.trim()) {
    return NextResponse.json({ error: "Guest name is required" }, { status: 400 });
  }

  if (!["purchased", "contributed"].includes(contribution_type)) {
    return NextResponse.json({ error: "Invalid contribution_type" }, { status: 400 });
  }

  const { error } = await getSupabase().from("registry_contributions").insert({
    registry_item_id,
    guest_id: guest_id ?? null,
    guest_name: guest_name ?? null,
    contribution_type,
    amount: amount ?? null,
  });

  if (error) {
    console.error("Registry contribute error:", error);
    return NextResponse.json({ error: "Failed to save contribution" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
