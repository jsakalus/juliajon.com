import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabase();

  const [itemsRes, contribRes] = await Promise.all([
    supabase.from('registry_items').select('*').order('display_order'),
    supabase
      .from('registry_contributions')
      .select('registry_item_id, contribution_type, amount'),
  ]);

  if (itemsRes.error) {
    return NextResponse.json({ error: itemsRes.error.message }, { status: 500 });
  }

  const totals = new Map<string, { purchased: number; contributed: number }>();
  for (const c of contribRes.data ?? []) {
    const cur = totals.get(c.registry_item_id) ?? { purchased: 0, contributed: 0 };
    if (c.contribution_type === 'purchased') cur.purchased++;
    else if (c.contribution_type === 'contributed') cur.contributed += Number(c.amount) || 0;
    totals.set(c.registry_item_id, cur);
  }

  const items = (itemsRes.data ?? []).map(item => ({
    ...item,
    purchased_count: totals.get(item.id)?.purchased ?? 0,
    contributed_total: totals.get(item.id)?.contributed ?? 0,
  }));

  return NextResponse.json({ items });
}

const REQUIRED_NEW_FIELDS = ['name', 'type'];
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

export async function POST(req: NextRequest) {
  const body = await req.json();

  for (const f of REQUIRED_NEW_FIELDS) {
    if (!body[f]) {
      return NextResponse.json({ error: `Missing required field: ${f}` }, { status: 400 });
    }
  }

  if (!['item', 'fund'].includes(body.type)) {
    return NextResponse.json({ error: 'type must be "item" or "fund"' }, { status: 400 });
  }

  const insert: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (ALLOWED_FIELDS.has(key)) insert[key] = value;
  }
  if (insert.is_active === undefined) insert.is_active = true;

  // Default display_order to (max + 1)
  if (insert.display_order === undefined || insert.display_order === null) {
    const supabase = getSupabase();
    const { data: maxRow } = await supabase
      .from('registry_items')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    insert.display_order = (maxRow?.display_order ?? 0) + 1;
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('registry_items')
    .insert(insert)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data });
}
