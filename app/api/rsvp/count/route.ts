import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const [yesRows, maybeRows, { count: total }] = await Promise.all([
    getSupabase()
      .from("rsvp_responses")
      .select("guest_id")
      .eq("wedding_attending_status", "yes")
      .order("submitted_at", { ascending: true }),
    getSupabase()
      .from("rsvp_responses")
      .select("guest_id")
      .eq("wedding_attending_status", "maybe")
      .order("submitted_at", { ascending: true }),
    getSupabase()
      .from("guests")
      .select("*", { count: "exact", head: true })
      .neq("first_name", "Guest"),
  ]);

  const yesGuestIds = (yesRows.data ?? []).map((r) => r.guest_id);
  const maybeGuestIds = (maybeRows.data ?? []).map((r) => r.guest_id);
  const allGuestIds = [...new Set([...yesGuestIds, ...maybeGuestIds])];

  let guestNameMap = new Map<string, string>();
  if (allGuestIds.length > 0) {
    const { data: guestData } = await getSupabase()
      .from("guests")
      .select("id, first_name, last_name")
      .in("id", allGuestIds);
    const toInitials = (first: string, last: string | null) =>
      [first, last].filter(Boolean).map((p) => p![0].toUpperCase() + ".").join("");
    guestNameMap = new Map(
      (guestData ?? []).map((g) => [g.id, toInitials(g.first_name, g.last_name)])
    );
  }

  const yesNames = yesGuestIds.map((id) => guestNameMap.get(id) ?? "").filter(Boolean);
  const maybeNames = maybeGuestIds.map((id) => guestNameMap.get(id) ?? "").filter(Boolean);

  return NextResponse.json({
    responded: yesGuestIds.length,
    maybe: maybeGuestIds.length,
    total: total ?? 0,
    yesNames,
    maybeNames,
  });
}
