import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const guestId = request.nextUrl.searchParams.get("guestId");

  const { data: items, error } = await getSupabase()
    .from("registry_items")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: contributions } = await getSupabase()
    .from("registry_contributions")
    .select("registry_item_id, contribution_type, amount, guest_id");

  const enriched = (items ?? []).map((item) => {
    const itemContribs = (contributions ?? []).filter(
      (c) => c.registry_item_id === item.id
    );
    const myContribs = guestId
      ? itemContribs.filter((c) => c.guest_id === guestId)
      : [];
    return {
      ...item,
      purchased:
        item.type === "item" &&
        itemContribs.some((c) => c.contribution_type === "purchased"),
      total_contributed:
        item.type === "fund"
          ? itemContribs.reduce((sum, c) => sum + (c.amount ?? 0), 0)
          : 0,
      my_contribution:
        item.type === "fund"
          ? myContribs.reduce((sum, c) => sum + (c.amount ?? 0), 0)
          : 0,
    };
  });

  return NextResponse.json(enriched);
}
