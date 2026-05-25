import { getResend } from "./resend";

const FROM = process.env.FROM_EMAIL ?? "Julia & Jon <wedding@juliajon.com>";
const ADMIN_EMAILS = [process.env.ADMIN_EMAIL_JULIA, process.env.ADMIN_EMAIL_JON].filter(
  (e): e is string => !!e
);

// ---- types ----

export interface GuestInfo {
  first_name: string;
  last_name: string | null;
  email: string | null;
}

export interface RsvpEntry {
  guest_id: string;
  wedding_attending_status: "yes" | "no" | "maybe" | null;
  welcome_dinner_status: "yes" | "no" | "maybe" | null;
  dietary_notes: string | null;
  travel_mode: "flying_booked" | "flying_not_booked" | "driving" | null;
  staying_late: boolean | null;
  maybe_reason: string | null;
}

export interface GuestWithResponse {
  guest: GuestInfo;
  response: RsvpEntry;
  previousStatus: string | null;
}

export interface RsvpStats {
  respondedMailedCount: number;
  totalMailedCount: number;
  yesWedding: number;
  maybeWedding: number;
  noWedding: number;
  yesDinner: number;
  yesParty: number;
}

// ---- helpers ----

function esc(str: string | null | undefined): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statusLabel(status: string | null): string {
  switch (status) {
    case "yes":   return "Attending";
    case "no":    return "Not attending";
    case "maybe": return "Maybe";
    default:      return "No answer";
  }
}

function travelLabel(mode: string | null): string {
  switch (mode) {
    case "flying_booked":     return "Flying (flights booked)";
    case "flying_not_booked": return "Flying (flights not yet booked)";
    case "driving":           return "Driving";
    default:                  return "No answer";
  }
}

// ---- guest confirmation email ----

export function guestConfirmationHtml(
  guest: GuestInfo,
  response: RsvpEntry,
  partyInvitedToWelcomeDinner: boolean
): string {
  const status = response.wedding_attending_status;
  const isYes   = status === "yes";
  const isMaybe = status === "maybe";
  const isNo    = status === "no";
  const showEventDetails = isYes || isMaybe;

  const statusBg   = isYes ? "#578C6C" : isNo ? "#6B5848" : "#E89410";
  const statusText = isYes
    ? "✿ We will see you in Canmore! ✿"
    : isNo
    ? "We are so sorry you cannot make it."
    : "We have got your maybe. We will keep your spot open for now.";

  const welcomeDinnerRow =
    partyInvitedToWelcomeDinner && response.welcome_dinner_status
      ? `<tr>
          <td style="padding:14px 0 0;border-top:1px solid #EBE2CE;">
            <p style="margin:0 0 3px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;">Welcome Dinner</p>
            <p style="margin:0;font-size:15px;color:#2C2018;font-family:Arial,Helvetica,sans-serif;">Friday, May 28, 2027</p>
            <p style="margin:2px 0 0;font-size:13px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;">Your answer: ${statusLabel(response.welcome_dinner_status)}</p>
          </td>
        </tr>`
      : "";

  const eventBlock = showEventDetails
    ? `<tr>
        <td style="padding:20px 0 0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="border:1px solid #EBE2CE;border-radius:6px;">
            <tr>
              <td style="padding:16px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                  <tr>
                    <td style="padding:0 0 14px;">
                      <p style="margin:0 0 3px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;">Ceremony</p>
                      <p style="margin:0;font-size:15px;color:#2C2018;font-family:Arial,Helvetica,sans-serif;">Saturday, May 29, 2027 at 4:00 PM</p>
                      <p style="margin:4px 0 0;font-size:13px;font-family:Arial,Helvetica,sans-serif;"><a href="https://maps.google.com/?q=Riverside+Park+Canmore+Alberta" style="color:#578C6C;text-decoration:none;">Riverside Park, Canmore, AB</a></p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:14px 0 0;border-top:1px solid #EBE2CE;">
                      <p style="margin:0 0 3px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;">Reception</p>
                      <p style="margin:0;font-size:15px;color:#2C2018;font-family:Arial,Helvetica,sans-serif;">5:00 PM onwards</p>
                      <p style="margin:4px 0 0;font-size:13px;font-family:Arial,Helvetica,sans-serif;"><a href="https://maps.google.com/?q=Bear+and+Bison+Inn+Canmore+Alberta" style="color:#578C6C;text-decoration:none;">A Bear and Bison Inn, Canmore, AB</a></p>
                    </td>
                  </tr>
                  ${welcomeDinnerRow}
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  const dietaryRow = response.dietary_notes
    ? `<tr>
        <td style="padding:16px 0 0;">
          <p style="margin:0 0 3px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;">Dietary Notes</p>
          <p style="margin:0;font-size:15px;color:#2C2018;font-family:Arial,Helvetica,sans-serif;">${esc(response.dietary_notes)}</p>
        </td>
      </tr>`
    : "";

  const travelRow = response.travel_mode
    ? `<tr>
        <td style="padding:16px 0 0;">
          <p style="margin:0 0 3px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;">Getting There</p>
          <p style="margin:0;font-size:15px;color:#2C2018;font-family:Arial,Helvetica,sans-serif;">${travelLabel(response.travel_mode)}</p>
        </td>
      </tr>`
    : "";

  const maybeReasonRow = isMaybe && response.maybe_reason
    ? `<tr>
        <td style="padding:16px 0 0;">
          <p style="margin:0 0 3px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;">Your Note</p>
          <p style="margin:0;font-size:15px;color:#2C2018;font-family:Arial,Helvetica,sans-serif;">${esc(response.maybe_reason)}</p>
        </td>
      </tr>`
    : "";

  const extraDetailsBlock =
    response.dietary_notes || response.travel_mode || (isMaybe && response.maybe_reason)
      ? `<tr>
          <td style="padding:20px 0 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
              ${dietaryRow}
              ${travelRow}
              ${maybeReasonRow}
            </table>
          </td>
        </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Your RSVP for Julia &amp; Jonathan's Wedding</title>
</head>
<body style="margin:0;padding:0;background-color:#F8F4EC;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#F8F4EC;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td style="background-color:#578C6C;border-radius:8px 8px 0 0;padding:28px 24px 20px;text-align:center;">
              <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:2.5px;color:rgba(255,255,255,0.65);font-family:Arial,Helvetica,sans-serif;">Julia &amp; Jonathan</p>
              <p style="margin:10px 0 0;font-size:28px;color:#ffffff;font-family:Georgia,'Times New Roman',serif;">✿ &nbsp; May 29, 2027 &nbsp; ✿</p>
              ${!isMaybe ? `<p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.75);font-family:Arial,Helvetica,sans-serif;">are getting married in Canmore, Alberta</p>` : ""}
              <p style="margin:18px auto 0;border-top:1px solid rgba(255,255,255,0.25);width:80%;font-size:0;line-height:0;">&nbsp;</p>
              <p style="margin:14px 0 0;font-size:14px;font-style:italic;color:#ffffff;font-family:Georgia,'Times New Roman',serif;">${statusText}</p>
            </td>
          </tr>
          <!-- Paintbrush wave — sage to white -->
          <tr>
            <td style="background-color:#578C6C;padding:0;line-height:0;font-size:0;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 30" width="520" height="30" style="display:block;width:100%;" preserveAspectRatio="none">
                <path d="M0,22 C80,10 160,28 240,16 C310,6 390,24 460,14 L520,10 L520,30 L0,30 Z" fill="#ffffff"/>
              </svg>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:28px 24px;border-radius:0 0 8px 8px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">

                <!-- Greeting -->
                <tr>
                  <td>
                    <p style="margin:0;font-size:16px;color:#2C2018;font-family:Arial,Helvetica,sans-serif;">Hi ${esc(guest.first_name)},</p>
                    <p style="margin:8px 0 0;font-size:15px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;">${
                      isYes
                        ? "We are SO thrilled you can make it! Here is what we have on file for you."
                        : isMaybe
                        ? "Fingers crossed you can make it work!"
                        : "Here is a confirmation of your RSVP. You will be dearly missed."
                    }</p>
                  </td>
                </tr>

                <!-- Event details (attending or maybe only) -->
                ${eventBlock}

                <!-- Extra details (dietary, travel, maybe reason) -->
                ${extraDetailsBlock}

                <!-- Spacer + divider + FAQ (not shown for no-RSVPs) -->
                ${!isNo ? `
                <tr><td style="padding-top:24px;"></td></tr>
                <tr><td style="border-top:1px solid #EBE2CE;"></td></tr>
                <tr>
                  <td style="padding-top:16px;">
                    <p style="margin:0;font-size:14px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;">Have questions? Visit <a href="https://juliajon.com" style="color:#578C6C;text-decoration:none;">juliajon.com</a> for the full schedule, travel tips, and where to stay.</p>
                  </td>
                </tr>` : `
                <tr><td style="padding-top:24px;"></td></tr>
                <tr><td style="border-top:1px solid #EBE2CE;"></td></tr>`}

                <!-- Closing -->
                <tr>
                  <td style="padding-top:20px;">
                    <p style="margin:0;font-size:15px;color:#2C2018;font-family:Georgia,'Times New Roman',serif;">${
                      isYes
                        ? "We cannot wait to hug you in person."
                        : isMaybe
                        ? "We hope the stars align and we get to see you there."
                        : "Thank you for letting us know."
                    }</p>
                    ${isMaybe
                      ? `<p style="margin:12px 0 0;font-size:15px;color:#2C2018;font-family:Georgia,'Times New Roman',serif;">Julia &amp; Jonathan</p>`
                      : `<p style="margin:6px 0 0;font-size:15px;color:#2C2018;font-family:Georgia,'Times New Roman',serif;">With love, Julia and Jonathan</p>`
                    }
                    ${isYes ? `<p style="margin:16px 0 0;font-size:13px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;">P.S. Peanut has been informed and is equally excited.</p>` : ""}
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;">This was sent because you RSVPed at <a href="https://juliajon.com" style="color:#578C6C;text-decoration:none;">juliajon.com</a>.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---- admin notification email ----

export function adminNotificationHtml(
  partyName: string,
  guestsWithResponses: GuestWithResponse[],
  partyInvitedToWelcomeDinner: boolean,
  stats: RsvpStats
): string {
  const { respondedMailedCount, totalMailedCount, yesWedding, maybeWedding, noWedding, yesDinner, yesParty } = stats;
  const displayName = guestsWithResponses.length > 0
    ? guestsWithResponses.map(({ guest }) => esc(guest.first_name)).join(" & ")
    : esc(partyName);
  const anyChanged = guestsWithResponses.some(
    ({ response, previousStatus }) =>
      previousStatus !== null && previousStatus !== response.wedding_attending_status
  );

  const guestRows = guestsWithResponses
    .map(({ guest, response, previousStatus }) => {
      const statusChanged =
        previousStatus !== null && previousStatus !== response.wedding_attending_status;

      const changeNote = statusChanged
        ? `&nbsp;<span style="color:#D85E28;font-size:12px;font-family:Arial,Helvetica,sans-serif;">(was: ${statusLabel(previousStatus)})</span>`
        : "";

      const detailRows = [
        `<tr>
          <td style="padding:2px 0;font-size:13px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;width:130px;vertical-align:top;">Wedding</td>
          <td style="padding:2px 0;font-size:13px;color:#2C2018;font-family:Arial,Helvetica,sans-serif;">${statusLabel(response.wedding_attending_status)}${changeNote}</td>
        </tr>`,
        partyInvitedToWelcomeDinner
          ? `<tr>
              <td style="padding:2px 0;font-size:13px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;">Welcome Dinner</td>
              <td style="padding:2px 0;font-size:13px;color:#2C2018;font-family:Arial,Helvetica,sans-serif;">${statusLabel(response.welcome_dinner_status)}</td>
            </tr>`
          : "",
        response.travel_mode
          ? `<tr>
              <td style="padding:2px 0;font-size:13px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;">Travel</td>
              <td style="padding:2px 0;font-size:13px;color:#2C2018;font-family:Arial,Helvetica,sans-serif;">${travelLabel(response.travel_mode)}</td>
            </tr>`
          : "",
        response.staying_late !== null
          ? `<tr>
              <td style="padding:2px 0;font-size:13px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;">Staying late</td>
              <td style="padding:2px 0;font-size:13px;color:#2C2018;font-family:Arial,Helvetica,sans-serif;">${response.staying_late ? "Yes" : "No"}</td>
            </tr>`
          : "",
        response.dietary_notes
          ? `<tr>
              <td style="padding:2px 0;font-size:13px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;vertical-align:top;">Dietary notes</td>
              <td style="padding:2px 0;font-size:13px;color:#2C2018;font-family:Arial,Helvetica,sans-serif;">${esc(response.dietary_notes)}</td>
            </tr>`
          : "",
        response.maybe_reason
          ? `<tr>
              <td style="padding:2px 0;font-size:13px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;vertical-align:top;">Their note</td>
              <td style="padding:2px 0;font-size:13px;color:#2C2018;font-family:Arial,Helvetica,sans-serif;">${esc(response.maybe_reason)}</td>
            </tr>`
          : "",
      ]
        .filter(Boolean)
        .join("");

      return `<tr>
        <td style="padding:16px;border-bottom:1px solid #EBE2CE;">
          <p style="margin:0 0 8px;font-size:15px;font-weight:bold;color:#2C2018;font-family:Arial,Helvetica,sans-serif;">${esc(guest.first_name)}${guest.last_name ? " " + esc(guest.last_name) : ""}</p>
          <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="width:100%;">${detailRows}</table>
        </td>
      </tr>`;
    })
    .join("");

  const pending = Math.max(0, totalMailedCount - respondedMailedCount);
  const headerLabel = anyChanged ? "RSVP Changed" : "New RSVP";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>RSVP Notification</title>
</head>
<body style="margin:0;padding:0;background-color:#F8F4EC;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background-color:#F8F4EC;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td style="background-color:#578C6C;border-radius:8px 8px 0 0;padding:22px 24px 18px;text-align:center;">
              <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.65);font-family:Arial,Helvetica,sans-serif;">${headerLabel}</p>
              <p style="margin:6px 0 0;font-size:22px;color:#ffffff;font-family:Georgia,'Times New Roman',serif;">${displayName}</p>
            </td>
          </tr>
          <!-- Paintbrush wave — sage to white -->
          <tr>
            <td style="background-color:#578C6C;padding:0;line-height:0;font-size:0;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 30" width="520" height="30" style="display:block;width:100%;" preserveAspectRatio="none">
                <path d="M0,22 C80,10 160,28 240,16 C310,6 390,24 460,14 L520,10 L520,30 L0,30 Z" fill="#ffffff"/>
              </svg>
            </td>
          </tr>

          <!-- Guest response rows -->
          <tr>
            <td style="background-color:#ffffff;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                ${guestRows}
              </table>
            </td>
          </tr>

          <!-- Tally -->
          <tr>
            <td style="background-color:#F8F4EC;border-top:2px solid #EBE2CE;padding:16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
                <tr>
                  <td style="text-align:center;width:20%;padding:4px 0;">
                    <p style="margin:0;font-size:20px;font-weight:bold;color:#578C6C;font-family:Arial,Helvetica,sans-serif;">${yesWedding}</p>
                    <p style="margin:3px 0 0;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;">Yes, wedding</p>
                  </td>
                  <td style="text-align:center;width:20%;padding:4px 0;border-left:1px solid #EBE2CE;border-right:1px solid #EBE2CE;">
                    <p style="margin:0;font-size:20px;font-weight:bold;color:#2C2018;font-family:Arial,Helvetica,sans-serif;">${yesDinner}</p>
                    <p style="margin:3px 0 0;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;">Yes, dinner</p>
                  </td>
                  <td style="text-align:center;width:20%;padding:4px 0;border-right:1px solid #EBE2CE;">
                    <p style="margin:0;font-size:20px;font-weight:bold;color:#D43D6A;font-family:Arial,Helvetica,sans-serif;">${yesParty}</p>
                    <p style="margin:3px 0 0;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;">Yes, party</p>
                  </td>
                  <td style="text-align:center;width:20%;padding:4px 0;border-right:1px solid #EBE2CE;">
                    <p style="margin:0;font-size:20px;font-weight:bold;color:#E89410;font-family:Arial,Helvetica,sans-serif;">${maybeWedding}</p>
                    <p style="margin:3px 0 0;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;">Maybe</p>
                  </td>
                  <td style="text-align:center;width:20%;padding:4px 0;">
                    <p style="margin:0;font-size:20px;font-weight:bold;color:#D85E28;font-family:Arial,Helvetica,sans-serif;">${noWedding}</p>
                    <p style="margin:3px 0 0;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;">No</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pending count -->
          <tr>
            <td style="background-color:#ffffff;padding:12px 16px;border-radius:0 0 8px 8px;">
              <p style="margin:0;font-size:13px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;">${
                totalMailedCount > 0
                  ? `${respondedMailedCount} of ${totalMailedCount} invited guests have responded. ${pending} still pending.`
                  : `No invitations have been mailed yet.`
              }</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:14px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#6B5848;font-family:Arial,Helvetica,sans-serif;"><a href="https://supabase.com" style="color:#578C6C;text-decoration:none;">View all responses in Supabase</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---- exported send functions ----

export async function sendGuestConfirmation(
  guest: GuestInfo,
  response: RsvpEntry,
  partyInvitedToWelcomeDinner: boolean
): Promise<void> {
  if (!guest.email) return;

  const statusSuffix =
    response.wedding_attending_status === "yes"
      ? "See you in Canmore!"
      : response.wedding_attending_status === "no"
      ? "We will miss you"
      : "We have got your maybe";

  await getResend().emails.send({
    from: FROM,
    to: guest.email,
    subject: `Your RSVP for Julia & Jonathan's Wedding: ${statusSuffix}`,
    html: guestConfirmationHtml(guest, response, partyInvitedToWelcomeDinner),
  });
}

export async function sendAdminNotification(
  partyName: string,
  guestsWithResponses: GuestWithResponse[],
  partyInvitedToWelcomeDinner: boolean,
  stats: RsvpStats
): Promise<void> {
  if (ADMIN_EMAILS.length === 0) return;

  const anyChanged = guestsWithResponses.some(
    ({ response, previousStatus }) =>
      previousStatus !== null && previousStatus !== response.wedding_attending_status
  );

  const fullName = (guest: GuestInfo) =>
    [guest.first_name, guest.last_name].filter(Boolean).join(" ");

  const changedSummary = guestsWithResponses
    .filter(({ response, previousStatus }) =>
      previousStatus !== null && previousStatus !== response.wedding_attending_status
    )
    .map(
      ({ guest, response, previousStatus }) =>
        `${fullName(guest)} (${previousStatus} -> ${response.wedding_attending_status})`
    )
    .join(", ");

  const guestDisplayName = guestsWithResponses.length > 0
    ? guestsWithResponses.map(({ guest }) => fullName(guest)).join(" & ")
    : partyName;

  const subject = anyChanged
    ? `RSVP Changed: ${changedSummary}`
    : `New RSVP: ${guestDisplayName}`;

  await getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAILS,
    subject,
    html: adminNotificationHtml(partyName, guestsWithResponses, partyInvitedToWelcomeDinner, stats),
  });
}
