import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { sendGuestConfirmation, sendAdminNotification } from "@/lib/emails";
import type { GuestInfo, GuestWithResponse, RsvpStats } from "@/lib/emails";

export async function POST(request: NextRequest) {
  const { responses } = await request.json();

  if (!responses || !Array.isArray(responses)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const guestIds: string[] = responses.map((r: any) => r.guest_id);

  // Batch-fetch all existing responses upfront for change detection + "no" lock
  const { data: existingRows } = await getSupabase()
    .from("rsvp_responses")
    .select("guest_id, wedding_attending_status")
    .in("guest_id", guestIds);

  const previousStatusMap = new Map<string, string>(
    (existingRows ?? []).map((r) => [r.guest_id, r.wedding_attending_status])
  );

  const processedGuestIds: string[] = [];

  for (const response of responses) {
    const previousStatus = previousStatusMap.get(response.guest_id) ?? null;

    // Locked: once a guest declines, no further changes allowed
    if (previousStatus === "no") continue;

    const status = response.wedding_attending_status as "yes" | "no" | "maybe" | null;

    const { error } = await getSupabase().from("rsvp_responses").upsert(
      {
        guest_id: response.guest_id,
        wedding_attending_status: status,
        wedding_attending: status === "yes" ? true : status === "no" ? false : null,
        welcome_dinner_status: response.welcome_dinner_status ?? null,
        welcome_dinner_attending:
          response.welcome_dinner_status === "yes"
            ? true
            : response.welcome_dinner_status === "no"
            ? false
            : null,
        maybe_reason: response.maybe_reason ?? null,
        dietary_notes: response.dietary_notes ?? "",
        travel_mode: response.travel_mode ?? null,
        staying_late: response.staying_late ?? null,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "guest_id" }
    );

    if (error) {
      console.error("RSVP submit error:", error);
      return NextResponse.json({ error: "Failed to save RSVP" }, { status: 500 });
    }

    // Update email / phone on the guest record if provided
    const guestUpdates: Record<string, string> = {};
    if (response.email?.trim()) guestUpdates.email = response.email.trim();
    if (response.cell?.trim()) guestUpdates.phone = response.cell.trim();

    if (Object.keys(guestUpdates).length > 0) {
      await getSupabase().from("guests").update(guestUpdates).eq("id", response.guest_id);
    }

    processedGuestIds.push(response.guest_id);
  }

  // Send emails after all upserts succeed. Errors are logged but never fail the RSVP.
  if (processedGuestIds.length > 0) {
    sendRsvpEmails(responses, processedGuestIds, previousStatusMap).catch((err) =>
      console.error("Email send failed:", err)
    );
  }

  return NextResponse.json({ success: true });
}

async function sendRsvpEmails(
  allResponses: any[],
  processedGuestIds: string[],
  previousStatusMap: Map<string, string>
) {
  // Fetch guest details (name + email)
  const { data: guests } = await getSupabase()
    .from("guests")
    .select("id, first_name, last_name, email, party_id")
    .in("id", processedGuestIds);

  if (!guests?.length) return;

  // Fetch party details (name + welcome dinner flag)
  const partyId = guests[0].party_id;
  const { data: party } = await getSupabase()
    .from("parties")
    .select("name, invited_to_welcome_dinner")
    .eq("id", partyId)
    .single();

  if (!party) return;

  // Fetch stats scoped to invite_mailed parties only
  const { data: mailedParties } = await getSupabase()
    .from("parties")
    .select("id")
    .eq("invite_mailed", true);

  const mailedPartyIds = (mailedParties ?? []).map((p) => p.id);

  const { data: mailedGuests } = await getSupabase()
    .from("guests")
    .select("id")
    .in("party_id", mailedPartyIds);

  const mailedGuestIds = (mailedGuests ?? []).map((g) => g.id);

  let allMailedResponses: { wedding_attending_status: string | null; welcome_dinner_status: string | null; staying_late: boolean | null }[] = [];
  if (mailedGuestIds.length > 0) {
    const { data: mailedResponses } = await getSupabase()
      .from("rsvp_responses")
      .select("wedding_attending_status, welcome_dinner_status, staying_late")
      .in("guest_id", mailedGuestIds);
    allMailedResponses = mailedResponses ?? [];
  }

  // When no invites have been mailed yet, fall back to this submission's data
  // so the tally reflects what was just submitted rather than showing all zeros.
  const tallySource = mailedGuestIds.length > 0
    ? allMailedResponses
    : allResponses.filter((r) => processedGuestIds.includes(r.guest_id));

  const stats: RsvpStats = {
    totalMailedCount:     mailedGuestIds.length,
    respondedMailedCount: mailedGuestIds.length > 0 ? allMailedResponses.length : tallySource.length,
    yesWedding:   tallySource.filter((r) => r.wedding_attending_status === "yes").length,
    maybeWedding: tallySource.filter((r) => r.wedding_attending_status === "maybe").length,
    noWedding:    tallySource.filter((r) => r.wedding_attending_status === "no").length,
    yesDinner:    tallySource.filter((r) => r.welcome_dinner_status === "yes").length,
    yesParty:     tallySource.filter((r) => r.staying_late === true).length,
  };

  const responseMap = new Map<string, any>(allResponses.map((r) => [r.guest_id, r]));
  const guestMap    = new Map(guests.map((g) => [g.id, g]));

  const guestsWithResponses: GuestWithResponse[] = processedGuestIds
    .map((guestId) => {
      const g        = guestMap.get(guestId);
      const response = responseMap.get(guestId);
      if (!g || !response) return null;
      const guest: GuestInfo = {
        first_name: g.first_name,
        last_name:  g.last_name ?? null,
        email:      g.email ?? null,
      };
      return { guest, response, previousStatus: previousStatusMap.get(guestId) ?? null };
    })
    .filter((x): x is GuestWithResponse => x !== null);

  // One confirmation email per guest who has an email address on file
  await Promise.allSettled(
    guestsWithResponses.map(({ guest, response }) =>
      sendGuestConfirmation(guest, response, party.invited_to_welcome_dinner ?? false)
    )
  );

  // One admin notification for the whole party submission
  await sendAdminNotification(
    party.name,
    guestsWithResponses,
    party.invited_to_welcome_dinner ?? false,
    stats
  );
}
