import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const [{ count: responded }, { count: total }] = await Promise.all([
    getSupabase()
      .from("rsvp_responses")
      .select("*", { count: "exact", head: true })
      .eq("wedding_attending_status", "yes"),
    getSupabase()
      .from("guests")
      .select("*", { count: "exact", head: true })
      .neq("first_name", "Guest"),
  ]);

  return NextResponse.json({ responded: responded ?? 0, total: total ?? 0 });
}
