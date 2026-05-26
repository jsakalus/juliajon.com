import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

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

  let query = getSupabase()
    .from("guests")
    .select("id, first_name, last_name, party_id")
    .ilike("first_name", firstName.trim());

  if (lastName?.trim()) {
    query = query.ilike("last_name", lastName.trim());
  }

  const { data: guests, error } = await query;

  if (error || !guests || guests.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (guests.length > 1 && !lastName?.trim()) {
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
