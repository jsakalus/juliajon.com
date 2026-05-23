import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { firstName, lastName } = await request.json();

  if (!firstName?.trim()) {
    return NextResponse.json({ error: "First name is required" }, { status: 400 });
  }

  // Search by first name (case-insensitive)
  let query = supabase
    .from("guests")
    .select("id, first_name, last_name, party_id")
    .ilike("first_name", firstName.trim());

  // Also filter by last name if provided
  if (lastName?.trim()) {
    query = query.ilike("last_name", lastName.trim());
  }

  const { data: guests, error } = await query;

  if (error || !guests || guests.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // If multiple matches and no last name provided, ask for last name
  if (guests.length > 1 && !lastName?.trim()) {
    return NextResponse.json({ error: "needs_last_name" }, { status: 409 });
  }

  const guest = guests[0];

  // Get party info
  const { data: party } = await supabase
    .from("parties")
    .select("id, name, invited_to_welcome_dinner")
    .eq("id", guest.party_id)
    .single();

  // Get all party members (excluding unnamed placeholders)
  const { data: members } = await supabase
    .from("guests")
    .select("id, first_name, last_name")
    .eq("party_id", guest.party_id)
    .neq("first_name", "Guest");

  // Get any existing RSVP responses
  const memberIds = (members ?? []).map((m) => m.id);
  const { data: existingResponses } = await supabase
    .from("rsvp_responses")
    .select("*")
    .in("guest_id", memberIds);

  return NextResponse.json({ party, members, existingResponses });
}
