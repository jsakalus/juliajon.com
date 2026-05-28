import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

function csvField(val: string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '';
  const str = String(val);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const supabase = getSupabase();

  const [partiesRes, guestsRes] = await Promise.all([
    supabase.from('parties').select('*').order('name'),
    supabase.from('guests').select('*'),
  ]);

  if (partiesRes.error || guestsRes.error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }

  type GuestRow = NonNullable<typeof guestsRes.data>[number];

  const guestsByParty = new Map<string, GuestRow[]>();
  for (const g of guestsRes.data ?? []) {
    const list = guestsByParty.get(g.party_id) ?? [];
    list.push(g);
    guestsByParty.set(g.party_id, list);
  }

  const headers = [
    'Full Name',
    'Country',
    'Company',
    'Address 1',
    'Address 2 (e.g. Unit #)',
    'Address 3',
    'City',
    'State',
    'Zip Code',
    'Phone Number',
    'Email',
  ];

  const lines = [headers.join(',')];

  for (const p of partiesRes.data ?? []) {
    const guests = guestsByParty.get(p.id) ?? [];
    const phone = guests.find(g => g.phone)?.phone ?? '';
    const email = guests.find(g => g.email)?.email ?? '';

    const row = [
      csvField(p.name),
      csvField(p.address_country),
      '',
      csvField(p.address_line1),
      csvField(p.address_line2),
      csvField(p.address_line3),
      csvField(p.address_city),
      csvField(p.address_state),
      csvField(p.address_postal),
      csvField(phone),
      csvField(email),
    ];
    lines.push(row.join(','));
  }

  const csv = lines.join('\r\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="wedding-guests-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
