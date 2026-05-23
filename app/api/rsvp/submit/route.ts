import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { responses } = await request.json();

  if (!responses || !Array.isArray(responses)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  for (const response of responses) {
    const { error } = await supabase.from("rsvp_responses").upsert(
      {
        guest_id: response.guest_id,
        wedding_attending: response.wedding_attending,
        welcome_dinner_attending: response.welcome_dinner_attending,
        dietary_notes: response.dietary_notes ?? "",
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "guest_id" }
    );

    if (error) {
      console.error("RSVP submit error:", error);
      return NextResponse.json({ error: "Failed to save RSVP" }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
