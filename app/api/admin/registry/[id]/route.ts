import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const ALLOWED_FIELDS = new Set([
  'name',
  'type',
  'description',
  'price',
  'external_url',
  'image_url',
  'display_order',
  'max_quantity',
  'is_active',
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (ALLOWED_FIELDS.has(key)) updates[key] = value;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  if ('type' in updates && !['item', 'fund'].includes(updates.type as string)) {
    return NextResponse.json({ error: 'type must be "item" or "fund"' }, { status: 400 });
  }

  const supabase = getSupabase();
  const { error } = await supabase.from('registry_items').update(updates).eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabase();

  // Block delete if there are contributions/purchases on this item to avoid losing history.
  const { count, error: countErr } = await supabase
    .from('registry_contributions')
    .select('*', { count: 'exact', head: true })
    .eq('registry_item_id', id);

  if (countErr) {
    return NextResponse.json({ error: countErr.message }, { status: 500 });
  }

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete: ${count} contribution${count === 1 ? '' : 's'} reference this item. Hide it instead (toggle Active off).`,
      },
      { status: 400 }
    );
  }

  const { error } = await supabase.from('registry_items').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
