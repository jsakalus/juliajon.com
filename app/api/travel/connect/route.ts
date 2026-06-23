import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendRentalConnect } from "@/lib/emails";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function scopeLabel(scope: string): string {
  switch (scope) {
    case "whole_trip": return "Sharing a car for the whole trip";
    case "airport_only": return "Sharing just the airport ride";
    default: return "Open to either a full-trip or airport-only share";
  }
}

function formatDate(date: string | null): string {
  if (!date) return "";
  // date is "YYYY-MM-DD"; render without timezone shifting
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("en-CA", { month: "long", day: "numeric", timeZone: "UTC" });
}

function travelSummary(p: {
  arrival_airport: string;
  arrival_date: string;
  arrival_time: string | null;
  departure_date: string | null;
  departure_time: string | null;
  share_scope: string;
}): string {
  const arrTime = p.arrival_time ? ` (${p.arrival_time})` : "";
  let s = `Arriving ${formatDate(p.arrival_date)}${arrTime} into ${p.arrival_airport}`;
  if (p.departure_date) {
    const depTime = p.departure_time ? ` (${p.departure_time})` : "";
    s += ` · Leaving ${formatDate(p.departure_date)}${depTime}`;
  }
  s += ` · ${scopeLabel(p.share_scope)}`;
  return s;
}

export async function POST(request: NextRequest) {
  const { fromGuestId, toGuestId } = await request.json();

  if (!UUID_RE.test(fromGuestId ?? "") || !UUID_RE.test(toGuestId ?? "")) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  if (fromGuestId === toGuestId) {
    return NextResponse.json({ error: "Cannot connect with yourself" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Both guests must have an active plan (so only participants can initiate, and
  // the requester has shared an email we can use as the reply-to address).
  const { data: plans } = await supabase
    .from("travel_plans")
    .select(
      "guest_id, arrival_airport, arrival_date, arrival_time, departure_date, departure_time, share_scope, note, guests(first_name, email)"
    )
    .in("guest_id", [fromGuestId, toGuestId])
    .eq("is_visible", true);

  const fromPlan = plans?.find((p) => p.guest_id === fromGuestId);
  const toPlan = plans?.find((p) => p.guest_id === toGuestId);

  if (!fromPlan || !toPlan) {
    return NextResponse.json({ error: "plan_missing" }, { status: 404 });
  }

  const fromGuest = fromPlan.guests as unknown as { first_name: string; email: string | null };
  const toGuest = toPlan.guests as unknown as { first_name: string; email: string | null };

  if (!fromGuest.email) {
    return NextResponse.json({ error: "from_email_missing" }, { status: 400 });
  }
  if (!toGuest.email) {
    return NextResponse.json({ error: "to_unreachable" }, { status: 422 });
  }

  await sendRentalConnect({
    toEmail: toGuest.email,
    toFirstName: toGuest.first_name,
    fromFirstName: fromGuest.first_name,
    fromEmail: fromGuest.email,
    fromNote: fromPlan.note ?? null,
    travelSummary: travelSummary(fromPlan),
  });

  return NextResponse.json({ ok: true });
}
