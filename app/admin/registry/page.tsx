import { getSupabase } from '@/lib/supabase';
import RegistryClient, { RegistryItem } from './RegistryClient';

export const dynamic = 'force-dynamic';

async function getItems(): Promise<RegistryItem[]> {
  const supabase = getSupabase();

  const [itemsRes, contribRes] = await Promise.all([
    supabase.from('registry_items').select('*').order('display_order'),
    supabase
      .from('registry_contributions')
      .select('registry_item_id, contribution_type, amount'),
  ]);

  if (itemsRes.error) throw new Error(itemsRes.error.message);
  if (contribRes.error) throw new Error(contribRes.error.message);

  const totals = new Map<string, { purchased: number; contributed: number }>();
  for (const c of contribRes.data ?? []) {
    const cur = totals.get(c.registry_item_id) ?? { purchased: 0, contributed: 0 };
    if (c.contribution_type === 'purchased') cur.purchased++;
    else if (c.contribution_type === 'contributed') cur.contributed += Number(c.amount) || 0;
    totals.set(c.registry_item_id, cur);
  }

  return (itemsRes.data ?? []).map(item => ({
    ...item,
    purchased_count: totals.get(item.id)?.purchased ?? 0,
    contributed_total: totals.get(item.id)?.contributed ?? 0,
  })) as RegistryItem[];
}

export default async function RegistryAdminPage() {
  const items = await getItems();
  return <RegistryClient initialItems={items} />;
}
