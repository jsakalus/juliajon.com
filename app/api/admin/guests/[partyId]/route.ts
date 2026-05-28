import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const ALLOWED_FIELDS = new Set([
  'name',
  'list_tier',
  'invited_to_welcome_dinner',
  'invite_mailed',
  'address_line1',
  'address_line2',
  'address_line3',
  'address_city',
  'address_state',
  'address_postal',
  'address_country',
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ partyId: string }> }
) {
  const { partyId } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (ALLOWED_FIELDS.has(key)) updates[key] = value;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  if ('list_tier' in updates && !['A', 'B', 'C'].includes(updates.list_tier as string)) {
    return NextResponse.json({ error: 'list_tier must be A, B, or C' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { error } = await supabase.from('parties').update(updates).eq('id', partyId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
