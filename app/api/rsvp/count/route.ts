import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const [{ count: responded }, { count: maybeCount }, { count: total }] = await Promise.all([
    getSupabase()
      .from("rsvp_responses")
      .select("*", { count: "exact", head: true })
      .eq("wedding_attending_status", "yes"),
    getSupabase()
      .from("rsvp_responses")
      .select("*", { count: "exact", head: true })
      .eq("wedding_attending_status", "maybe"),
    getSupabase()
      .from("guests")
      .select("*", { count: "exact", head: true })
      .neq("first_name", "Guest"),
  ]);

  return NextResponse.json({ responded: responded ?? 0, maybe: maybeCount ?? 0, total: total ?? 0 });
}
