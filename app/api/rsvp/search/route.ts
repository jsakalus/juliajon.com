import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

function normalizeName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")   // strip diacritics
    .replace(/[-\s]+/g, " ")   // collapse hyphens and spaces
    .toLowerCase()
    .trim();
}

export async function GET(request: NextRequest) {
  const guestId = request.nextUrl.searchParams.get("guestId");
  if (!guestId) return NextResponse.json({ error: "guestId required" }, { status: 400 });

  const { data: guest } = await getSupabase()
    .from("guests")
    .select("id, first_name, last_name, party_id")
    .eq("id", guestId)
    .single();

  if (!guest) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { data: party } = await getSupabase()
    .from("parties")
    .select("id, name, invited_to_welcome_dinner")
    .eq("id", guest.party_id)
    .single();

  const { data: members } = await getSupabase()
    .from("guests")
    .select("id, first_name, last_name, email, phone")
    .eq("party_id", guest.party_id)
    .neq("first_name", "Guest");

  const sorted = [...(members ?? [])].sort((a, b) => {
    if (a.id === guest.id) return -1;
    if (b.id === guest.id) return 1;
    return 0;
  });

  const memberIds = sorted.map((m) => m.id);
  const { data: existingResponses } = await getSupabase()
    .from("rsvp_responses")
    .select("*")
    .in("guest_id", memberIds);

  return NextResponse.json({ party, members: sorted, existingResponses });
}

export async function POST(request: NextRequest) {
  const { firstName, lastName } = await request.json();

  if (!firstName?.trim()) {
    return NextResponse.json({ error: "First name is required" }, { status: 400 });
  }

  const firstRaw = firstName.trim();
  const lastRaw = lastName?.trim() ?? "";

  // Pass 1: exact case-insensitive match (existing behavior)
  let query = getSupabase()
    .from("guests")
    .select("id, first_name, last_name, party_id")
    .ilike("first_name", firstRaw);

  if (lastRaw) query = query.ilike("last_name", lastRaw);

  let { data: guests, error } = await query;

  // Pass 2 & 3: normalized fallback when exact match fails
  if (error || !guests || guests.length === 0) {
    const { data: allGuests } = await getSupabase()
      .from("guests")
      .select("id, first_name, last_name, party_id");

    if (allGuests && allGuests.length > 0) {
      const normFirst = normalizeName(firstRaw);
      const normLast = normalizeName(lastRaw);

      // Pass 2: normalize both sides — strips accents, collapses hyphens/spaces
      let matches = allGuests.filter((g) => {
        const gFirst = normalizeName(g.first_name ?? "");
        const gLast = normalizeName(g.last_name ?? "");
        if (gFirst !== normFirst) return false;
        if (normLast) return gLast === normLast;
        return true;
      });

      // Pass 3: prefix match for hyphenated names (e.g. "Marie" → "Marie-Claire")
      // Only used when Pass 2 found nothing and no last name was supplied
      if (matches.length === 0 && !normLast) {
        matches = allGuests.filter((g) => {
          const firstSegment = normalizeName((g.first_name ?? "").split("-")[0]);
          return firstSegment === normFirst;
        });
      }

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

  const { data: party } = await getSupabase()
    .from("parties")
    .select("id, name, invited_to_welcome_dinner")
    .eq("id", guest.party_id)
    .single();

  const { data: members } = await getSupabase()
    .from("guests")
    .select("id, first_name, last_name, email, phone")
    .eq("party_id", guest.party_id)
    .neq("first_name", "Guest");

  // Searched guest appears first, rest follow in DB order
  const sorted = [...(members ?? [])].sort((a, b) => {
    if (a.id === guest.id) return -1;
    if (b.id === guest.id) return 1;
    return 0;
  });

  const memberIds = sorted.map((m) => m.id);
  const { data: existingResponses } = await getSupabase()
    .from("rsvp_responses")
    .select("*")
    .in("guest_id", memberIds);

  return NextResponse.json({ party, members: sorted, existingResponses });
}
