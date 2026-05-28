import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

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
    .select("id, first_name, last_name, party_id")
    .ilike("first_name", firstRaw);

  if (lastRaw) query = query.ilike("last_name", lastRaw);

  let { data: guests, error } = await query;

  if (error || !guests || guests.length === 0) {
    const { data: allGuests } = await getSupabase()
      .from("guests")
      .select("id, first_name, last_name, party_id");

    if (allGuests) {
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

  const [{ data: party }, { data: members }] = await Promise.all([
    getSupabase()
      .from("parties")
      .select("id, name, address_line1, address_line2, address_line3, address_city, address_state, address_postal, address_country")
      .eq("id", guest.party_id)
      .single(),
    getSupabase()
      .from("guests")
      .select("first_name")
      .eq("party_id", guest.party_id)
      .neq("first_name", "Guest"),
  ]);

  if (!party) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    partyId: party.id,
    memberNames: (members ?? []).map((m) => m.first_name),
    address: {
      address_line1: party.address_line1,
      address_line2: party.address_line2,
      address_line3: party.address_line3,
      address_city: party.address_city,
      address_state: party.address_state,
      address_postal: party.address_postal,
      address_country: party.address_country,
    },
  });
}
