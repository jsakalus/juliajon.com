import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// Same name-matching approach as the RSVP search: exact case-insensitive first,
// then a normalized (accent/hyphen/partial-aware) fallback.
function normalizeName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .replace(/[-\s]+/g, " ")
    .toLowerCase()
    .trim();
}

function segmentMatch(input: string, stored: string): boolean {
  if (input === stored) return true;
  return stored.split(" ").includes(input);
}

export async function POST(request: NextRequest) {
  const { firstName, lastName } = await request.json();

  if (!firstName?.trim()) {
    return NextResponse.json({ error: "First name is required" }, { status: 400 });
  }

  const firstRaw = firstName.trim();
  const lastRaw = lastName?.trim() ?? "";

  let query = getSupabase()
    .from("guests")
    .select("id, first_name, last_name, email")
    .ilike("first_name", firstRaw);

  if (lastRaw) query = query.ilike("last_name", lastRaw);

  let { data: guests, error } = await query;

  if (error || !guests || guests.length === 0) {
    const { data: allGuests } = await getSupabase()
      .from("guests")
      .select("id, first_name, last_name, email");

    if (allGuests && allGuests.length > 0) {
      const normFirst = normalizeName(firstRaw);
      const normLast = normalizeName(lastRaw);

      const matches = allGuests.filter((g) => {
        const gFirst = normalizeName(g.first_name ?? "");
        const gLast = normalizeName(g.last_name ?? "");
        if (!segmentMatch(normFirst, gFirst)) return false;
        if (normLast) return segmentMatch(normLast, gLast);
        return true;
      });

      guests = matches.length > 0 ? matches : null;
      error = null;
    }
  }

  if (error || !guests || guests.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (guests.length > 1 && !lastRaw) {
    return NextResponse.json({ error: "needs_last_name" }, { status: 409 });
  }

  const guest = guests[0];

  // Pull any plan they've already submitted so the form can pre-fill for editing.
  const { data: plan } = await getSupabase()
    .from("travel_plans")
    .select("*")
    .eq("guest_id", guest.id)
    .maybeSingle();

  return NextResponse.json({
    guest: {
      id: guest.id,
      first_name: guest.first_name,
      last_name: guest.last_name,
      email: guest.email,
    },
    plan: plan ?? null,
  });
}
