import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const revalidate = 60;

export async function GET() {
  const [responsesResult, { count: total }] = await Promise.all([
    getSupabase()
      .from("rsvp_responses")
      .select("guest_id, wedding_attending_status, guests(first_name, last_name)")
      .in("wedding_attending_status", ["yes", "maybe"])
      .order("submitted_at", { ascending: true }),
    getSupabase()
      .from("guests")
      .select("*", { count: "exact", head: true })
      .neq("first_name", "Guest"),
  ]);

  const toInitials = (first: string, last: string | null) =>
    [first, last].filter(Boolean).map((p) => p![0].toUpperCase() + ".").join("");

  const rows = responsesResult.data ?? [];
  const yesRows = rows.filter((r) => r.wedding_attending_status === "yes");
  const maybeRows = rows.filter((r) => r.wedding_attending_status === "maybe");

  const yesNames = yesRows.map((r) => {
    const g = r.guests as unknown as { first_name: string; last_name: string | null } | null;
    return g ? toInitials(g.first_name, g.last_name) : "";
  }).filter(Boolean);

  const maybeNames = maybeRows.map((r) => {
    const g = r.guests as unknown as { first_name: string; last_name: string | null } | null;
    return g ? toInitials(g.first_name, g.last_name) : "";
  }).filter(Boolean);

  return NextResponse.json({
    responded: yesRows.length,
    maybe: maybeRows.length,
    total: total ?? 0,
    yesNames,
    maybeNames,
  });
}
