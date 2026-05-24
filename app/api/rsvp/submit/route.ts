import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { responses } = await request.json();

  if (!responses || !Array.isArray(responses)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  for (const response of responses) {
    // Don't allow changing a "no" response
    const { data: existing } = await getSupabase()
      .from("rsvp_responses")
      .select("wedding_attending_status")
      .eq("guest_id", response.guest_id)
      .maybeSingle();

    if (existing?.wedding_attending_status === "no") {
      continue;
    }

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
  }

  return NextResponse.json({ success: true });
}
