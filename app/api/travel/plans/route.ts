import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const INTENTS = new Set(["needs_seat", "has_car", "flexible"]);
const SCOPES = new Set(["whole_trip", "airport_only", "either"]);

// GET /api/travel/plans — the board. Returns every visible plan with the guest's
// FIRST NAME ONLY. Never returns email or last name, so the board can't leak
// contact info; connections happen through the double opt-in /connect route.
export async function GET() {
  const { data, error } = await getSupabase()
    .from("travel_plans")
    .select(
      "id, guest_id, arrival_airport, arrival_date, arrival_time, departure_airport, departure_date, departure_time, share_intent, share_scope, note, guests(first_name)"
    )
    .eq("is_visible", true)
    .order("arrival_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const plans = (data ?? []).map((p) => {
    const g = p.guests as unknown as { first_name: string } | null;
    return {
      id: p.id,
      guest_id: p.guest_id,
      first_name: g?.first_name ?? "A guest",
      arrival_airport: p.arrival_airport,
      arrival_date: p.arrival_date,
      arrival_time: p.arrival_time,
      departure_airport: p.departure_airport,
      departure_date: p.departure_date,
      departure_time: p.departure_time,
      share_intent: p.share_intent,
      share_scope: p.share_scope,
      note: p.note,
    };
  });

  return NextResponse.json({ plans });
}

// POST /api/travel/plans — create or update the caller's plan (upsert on guest_id).
// Also saves the guest's email so matches can reach them via the connect route.
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { guestId, email } = body;

  if (!UUID_RE.test(guestId ?? "")) {
    return NextResponse.json({ error: "Invalid guest" }, { status: 400 });
  }
  if (!email?.trim()) {
    return NextResponse.json({ error: "email_required" }, { status: 400 });
  }
  if (!body.arrival_date) {
    return NextResponse.json({ error: "arrival_date_required" }, { status: 400 });
  }
  if (!INTENTS.has(body.share_intent) || !SCOPES.has(body.share_scope)) {
    return NextResponse.json({ error: "Invalid options" }, { status: 400 });
  }

  // Confirm the guest exists before writing anything.
  const { data: guest } = await getSupabase()
    .from("guests")
    .select("id")
    .eq("id", guestId)
    .maybeSingle();

  if (!guest) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // Save the reply-to address on the guest record (needed for double opt-in connect).
  await getSupabase().from("guests").update({ email: email.trim() }).eq("id", guestId);

  const row = {
    guest_id: guestId,
    arrival_airport: (body.arrival_airport || "YYC").trim(),
    arrival_date: body.arrival_date,
    arrival_time: body.arrival_time?.trim() || null,
    departure_airport: (body.departure_airport || "YYC").trim(),
    departure_date: body.departure_date || null,
    departure_time: body.departure_time?.trim() || null,
    share_intent: body.share_intent,
    share_scope: body.share_scope,
    note: body.note?.trim() || null,
    is_visible: true,
    updated_at: new Date().toISOString(),
  };

  const { error } = await getSupabase()
    .from("travel_plans")
    .upsert(row, { onConflict: "guest_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/travel/plans?guestId=… — remove the caller's plan from the board.
export async function DELETE(request: NextRequest) {
  const guestId = request.nextUrl.searchParams.get("guestId");

  if (!UUID_RE.test(guestId ?? "")) {
    return NextResponse.json({ error: "Invalid guest" }, { status: 400 });
  }

  const { error } = await getSupabase()
    .from("travel_plans")
    .delete()
    .eq("guest_id", guestId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
