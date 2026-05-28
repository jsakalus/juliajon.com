# Registry Page (`/registry`)

**Status**: 🟡 Mostly complete

## What's built
- ✅ `registry_items` and `registry_contributions` tables created in Supabase
- ✅ Page layout: funds section first, then items. Completed items/funds float to the bottom of their section automatically.
- ✅ **Fund cards**: name, description, "Contribute →" button (gold), progress bar (if goal set), total contributed, per-guest contribution ("You've contributed $X ♡") for identified guests. Unlimited funds (no goal) show total contributed as text only. When goal is reached, button changes to "Goal reached ✓" and contributions are disabled.
- ✅ **Item cards**: name, description, price, "View →" button (opens external URL), "Mark as purchased" underline link. Images displayed at top of card if `image_url` is set.
- ✅ **Quantity limits** via `max_quantity`: null = unlimited (never grays out), 1 = one buyer, N = N buyers. Sold-out items dim to 60% opacity, image goes greyscale, "Mark as purchased" hidden. Purchaser names never shown publicly.
- ✅ Multiple purchases supported: no unique constraint on `registry_contributions`.
- ✅ **"Contribute →" modal**: Step 1 payment info (Venmo/PayPal/e-transfer). Step 2 name search (if not identified) + amount input.
- ✅ **"Mark as purchased" modal**: shows who the purchase will be attributed to + confirm/cancel.
- ✅ **Click tracking**: "View →" saves `{ item_id, item_name, item_type, timestamp }` to `registry_pending_click` localStorage, opens URL in new tab.
- ✅ **Return popup**: on page load, checks localStorage for click within 2 hours → "Did you purchase [name]?" or "How much did you contribute?" modal.
- ✅ Guest name is **required** for all contributions (client + server validated).
- ✅ API routes: `GET /api/registry/items?guestId=xxx`, `POST /api/registry/contribute`, `GET /api/registry/shipping-address`.
- ✅ Shipping address section: shows "View address →" button until guest is identified, then reveals address from `SHIPPING_ADDRESS` env var.
- ✅ Page re-fetches items after any contribution to update UI live.
- ✅ Modal UX: item modal `max-w-md` (object-contain image), fund modal `max-w-lg` (side-by-side image + form on desktop), backdrop click closes, availability counter "X/N purchased" on tiles and modals.
- ✅ "View →" tile button stays on tiles for items with external URL (stopPropagation). Rest of card opens detail modal.
- ✅ Description scroll animation only triggers when text actually overflows (JS overflow detection). Applies to both fund and item descriptions.
- ✅ Fund progress bar: no "/" prefix on goal total (was "/$3,000", now "$3,000").
- ✅ Fund card name font bumped to `text-base`, description to `text-sm`.
- ✅ Tile cards have visible `border-beige-dark` + `shadow-sm` (previously invisible against beige background).
- ✅ External URLs added for all registry items and funds.
- ✅ Skydiving Fund goal set to $3,000.

## Still to do
- [ ] Content review with Julia & Jon to finalize items, descriptions
- [ ] Minor UX tweaks
- [ ] Build admin management UI (see [admin.md](../admin.md) Phase 5)

## Registry Flow

**Explicit contribution/purchase:**
1. Guest clicks "Contribute →" on a fund card → modal opens with payment info
2. If not identified: name search runs first; once identified, amount input appears
3. Guest enters amount → confirm → `POST /api/registry/contribute` → UI updates

**Explicit mark as purchased:**
1. Guest clicks "Mark as purchased" on an item card → modal opens
2. If not identified: name search runs first
3. Modal shows "Marking as purchased by [Name]" → confirm → `POST /api/registry/contribute` → item moves to "Already taken"

**Return-visit popup (after clicking "View →"):**
1. "View →" click saves click info to localStorage, opens URL in new tab
2. Guest returns to registry page within 2 hours → popup appears automatically
3. Item popup: "Did you purchase [name]?" → Yes / Just browsing
4. Fund popup: "How much did you contribute?" → dollar input + confirm
5. On confirm → `POST /api/registry/contribute` → UI updates

**Attribution (all flows):**
- If `rsvp_guest_name` is in localStorage → identity already known, skip name search
- Otherwise → name search modal (same first/last name lookup as RSVP)
- `guest_name` is required for all contributions: blocked client-side and validated server-side

**Shipping address:**
- "Shipping a gift?" section at bottom of page
- Not identified: shows "View address →" button → triggers name search → reveals address after identification
- Already identified: address shown immediately on page load

## Initial SQL (already run)

```sql
insert into registry_items (name, type, price, external_url, display_order) values
  ('East Fork Dinner Set',            'item', null,  null,                                                                   1),
  ('Honeymoon Fund',                  'fund', null,  null,                                                                   2),
  ('Boleslawiec Dinnerware',          'item', null,  null,                                                                   3),
  ('Handmade Blown Glass Glasses',    'item', null,  null,                                                                   4),
  ('House Fund',                      'fund', null,  null,                                                                   5),
  ('Skydiving Fund',                  'fund', null,  null,                                                                   6),
  ('Pottery Classes Fund',            'fund', 1000,  null,                                                                   7),
  ('Peanut''s Dog Feeder',            'item', null,  'https://www.houndsy.com/products/houndsy-kibble-dispenser',           8),
  ('Bed Frame',                       'item', null,  'https://www.nectarsleep.com/bed-frames/japanese-joinery-bamboo-bed',  9),
  ('Bike Fund',                       'fund', 3000,  null,                                                                   10),
  ('Sunrise Alarm Clock',             'item', null,  'https://risecentered.com/products/the-original-sunrise-alarm-clock',  11),
  ('Nebulizing Diffuser',             'item', null,  'https://moodandmoss.com/products/nebulizing-wood-glass-diffuser',     12);
```
