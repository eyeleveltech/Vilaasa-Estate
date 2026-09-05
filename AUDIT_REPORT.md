# Vilaasa Estates — UI/UX & Bug Audit

**Date:** 5 September 2026
**Commit audited:** `18e66e5` (main)
**Live site:** https://www.vilaasaestates.com

## Scope

| Included | Excluded |
| :--- | :--- |
| Public site (all visitor-facing pages) | **The Vault feature** — being dropped, so not audited for UX |
| Admin panel (all 8 sidebar sections) | Backend security (covered in earlier work) |
| Cross-cutting: SEO, accessibility, error handling | Visual/brand design opinions |

Vault appears in exactly one place below — [P3-4](#p3-4-vault-code-still-shipped-to-every-visitor), covering its removal.

## Method

Findings are evidence-based, not speculative. Each cites a file and line, or a
reproducible request against the live site. Several plausible-looking issues
were checked and **found not to be real** — those are listed in
[Verified healthy](#verified-healthy) so nobody re-audits them.

## Summary

| Severity | Count | Meaning |
| :--- | :---: | :--- |
| **P1 — High** | 2 | Users see wrong data, or data becomes unreachable |
| **P2 — Medium** | 7 | Broken interactions, data-loss risk, SEO damage |
| **P3 — Low** | 4 | Cleanup, code quality, third-party noise |

---

# P1 — High

## P1-1: Public site shows fabricated franchise listings when the API fails

**Files:** `frontend/src/hooks/useNewFranchise.ts:247` (dataset), `:780-800` (list), `:749-756` (detail)

The franchise list calls the API inside a `try`, and on **either** a thrown
error **or** an empty result falls through to a hardcoded array:

```ts
} catch {
  // Fallback to curated dataset
}
// Return curated list
return FALLBACK_FRANCHISES.map((f) => ({ ... }));
```

`FALLBACK_FRANCHISES` contains three franchises that do not exist in your
database — `wellness-resorts-kerala`, `carlton-wellness-spa`,
`colton-resort-chennai` — each with invented investment figures (the list even
hardcodes `"₹70,00,000"` and `"24% Annually"` as defaults).

**Impact.** This is the most serious finding. On a real-estate investment site,
a backend outage or an empty franchise table doesn't show an error — it shows
**three fake investment opportunities with fabricated ROI figures**, and each
is clickable through to a detail page that also serves fallback data. If an
admin deletes the last real franchise, the fakes silently reappear. Prospects
could enquire about, and be quoted on, assets that do not exist.

**Fix.** Delete `FALLBACK_FRANCHISES` and its three call sites. Let the query
fail and render the existing error state. An empty list should say "no
opportunities currently listed", never substitute invented ones.

**Effort:** ~30 min.

## P1-2: Inquiries beyond the first 100 are unreachable

**Files:** `frontend/src/admin/pages/AdminInquiriesList.tsx:87`, `backend/src/modules/inquiry/inquiry.schema.ts:44`

```ts
const params: Record<string, string | number> = { limit: 100 };
```

The inquiries page requests 100 records and renders them all. It has **no
pagination controls** — the only admin list without them (Properties,
Franchises, Site Visits and Partners all have them). The backend caps `limit`
at 100, so raising the number won't help.

**Impact.** Once you pass 100 leads, older ones become invisible in the admin
UI with no indication anything is missing. For a lead pipeline this is silent
data loss in practice — the records exist but nobody can reach them. Search and
status filters narrow the same capped window rather than paging through it.

**Fix.** Add pagination matching `AdminPropertiesList.tsx`, which already has
the pattern (page state, `meta.totalPages`, controls).

**Effort:** ~1-2 hours.

---

# P2 — Medium

## P2-1: Admin sub-item deletions have no confirmation

**File:** `frontend/src/admin/pages/AdminPropertyDetail.tsx:210, 244, 269, 300`

Four delete handlers fire the API call immediately on click:

```ts
const handleDeleteNearby = async (placeId: string) => {
  if (!property) return;
  try {
    await api.delete(`/properties/${property.id}/nearby/${placeId}`);
```

This covers unit configurations, amenities, nearby landmarks and financial
metrics. There is no dialog and no undo.

**Impact.** One misclick permanently destroys content that was typed by hand.
Deleting the whole property *is* guarded by a modal
(`AdminPropertiesList.tsx:58`), so the protection is inconsistent — users learn
"delete asks first", which is false on this screen.

**Fix.** Reuse the `AlertDialog` already used on the same page.

**Effort:** ~1 hour for all four.

## P2-2: Newsletter signup is decorative — it does nothing

**File:** `frontend/src/components/Footer.tsx:157-166`

```tsx
<input className="..." placeholder="Email Address" type="email" />
<button className="...">Join</button>
```

No `<form>`, no `onSubmit`, no `onClick`, no state, no API call.

**Impact.** Present in the footer of **every page**. Visitors type an address,
click Join, and get no feedback — the field doesn't even clear. Every signup is
lost, and the visitor believes they subscribed.

**Fix.** Either wire it to a real endpoint, or remove the block until there's
somewhere to send addresses. Removing is honest; leaving it as-is is not.

**Effort:** ~15 min to remove, ~3 hours to implement properly.

## P2-3: Footer contact details contradict the brief

**File:** `frontend/src/components/Footer.tsx:5-35, 63`

| Item | In `Vilaasa_All_Form_Data.txt` | In the code |
| :--- | :--- | :--- |
| Instagram | `instagram.com/vilaasaestate` | `instagram.com/vilaasa_estates/` |
| YouTube | `youtube.com/@vilaasaestate` | `youtube.com/@vilaasa_estates` |
| Facebook | `facebook.com/vilaasaestate` | **missing** |
| WhatsApp | `wa.me/914443570713` | **missing** |
| Phone | `044 4357 0713` | **not displayed at all** |
| Copyright | © 2024 | © 2026 |

The code also has an **X/Twitter** link the brief doesn't mention.

**Impact.** If the code handles are wrong, every social link on the site is
broken. Two channels named in the brief are absent, and the phone number — a
primary conversion path for a luxury property business — appears nowhere in the
footer despite the address being there.

**Note.** I did not "fix" these, because I can't tell which source is correct:
the code says © 2026 and the document says © 2024, which suggests the code is
newer, not stale. **You need to confirm the real handles** before anyone edits.

**Effort:** ~30 min once confirmed.

## P2-4: Every page shares one title and description

Verified live — four different routes, identical `<title>`:

```
/                        -> Vilaasa Estate | Luxury Real Estate & Investments
/home                    -> Vilaasa Estate | Luxury Real Estate & Investments
/domestic/real-estate    -> Vilaasa Estate | Luxury Real Estate & Investments
/property/oxygen-forest  -> Vilaasa Estate | Luxury Real Estate & Investments
```

The app is a client-rendered SPA with static tags in `frontend/index.html` and
no per-route metadata.

**Impact.** Google shows the same title for every indexed page. Sharing a
specific property to WhatsApp or LinkedIn previews the generic site card, not
the property — a direct hit on referral traffic for a business whose listings
are the product. The OG tags at `index.html:14-21` are equally generic.

**Fix.** Add `react-helmet-async` and set title/description/OG per route,
driven by the property or franchise being viewed. Note that crawlers which
don't execute JS still see the static tags; full fidelity needs SSR or
prerendering, which is a much larger change.

**Effort:** ~4 hours for the helmet approach.

## P2-5: `/sitemap.xml` is not a sitemap

Verified live — the URL returns HTTP 200 with HTML:

```
$ curl https://www.vilaasaestates.com/sitemap.xml
<!doctype html>
<html lang="en" class="dark">
```

The nginx SPA fallback serves `index.html` for the path because no sitemap file
exists. `robots.txt` also has **no `Sitemap:` directive**.

**Impact.** Search engines get an HTML page where XML is expected and discover
nothing. Combined with P2-4, property pages are close to invisible in search.

**Fix.** Generate `sitemap.xml` at build time from the property and franchise
slugs, write it into `frontend/public/`, and add `Sitemap: https://www.vilaasaestates.com/sitemap.xml`
to `robots.txt`.

**Effort:** ~2 hours.

## P2-6: Unknown URLs return HTTP 200 (soft 404)

The nginx SPA fallback (`frontend/nginx.conf`) returns `index.html` with status
**200** for any unmatched path. React Router then renders `NotFound`, but the
HTTP status is already a success.

**Impact.** Search engines index typo and stale URLs as real pages. Monitoring
can't distinguish a broken link from a working one.

**Fix.** Have the SPA's `NotFound` route set a `<meta name="robots" content="noindex">`,
or prerender a real 404. A pure-nginx fix isn't possible without knowing the
client-side route table.

**Effort:** ~1 hour for the noindex mitigation.

## P2-7: No unsaved-changes warning on long admin forms

**Files:** `frontend/src/admin/pages/AdminPropertyForm.tsx`, `AdminFranchiseForm.tsx`

Neither form registers a `beforeunload` handler or a router blocker — verified
by searching for `beforeunload`, `useBlocker`, `isDirty` across all admin pages
(no matches).

**Impact.** The property form has **8 sections** and the franchise form **7**,
each with many fields. Closing the tab, hitting back, or clicking a sidebar
link discards everything silently. This compounds with session expiry:
`frontend/src/api/axios.ts:67` responds to any 401 with
`window.location.href = "/admin/login"`, a hard navigation that wipes a
half-completed form with no warning and no draft.

**Fix.** Track dirty state and register `beforeunload`; ideally also autosave a
draft to `localStorage`.

**Effort:** ~2 hours basic, ~5 hours with drafts.

---

# P3 — Low

## P3-1: Hero highlights silently fall back to hardcoded content

**File:** `frontend/src/hooks/useHeroHighlights.ts:14, 45, 58`

Same pattern as P1-1 but lower stakes — the homepage hero shows three
hardcoded highlights if the API fails. At least this one logs a warning
(`console.warn("[HeroHighlights] Using fallback highlights:")`), which P1-1
does not.

**Impact.** Admins editing Hero Highlights may see no change on the live site
and not understand why.

**Effort:** ~30 min.

## P3-2: Three API errors are swallowed entirely

**Files:** `useNewFranchise.ts:749`, `useNewFranchise.ts:780`, `useNewProperties.ts:353`

```ts
} catch {
```

Empty catch with no binding — the error is not logged, reported, or surfaced.

**Impact.** Backend outages are invisible in the browser console, making
production issues hard to diagnose. This is the mechanism behind P1-1.

**Effort:** ~30 min.

## P3-3: 28 `no-explicit-any` lint errors

`npm run lint` fails. Breakdown:

| Location | Count |
| :--- | :---: |
| `vault/hooks/useVaultSections.ts` | 12 |
| `components/vault/VaultConstruction.tsx` | 5 |
| `admin/lib/franchisePageHelpers.ts` | 4 |
| `admin/pages/AdminFranchiseDetail.tsx` | 3 |
| `admin/pages/AdminHeroHighlights.tsx` | 2 |
| `admin/pages/AdminChannelPartners.tsx` | 1 |
| `admin/pages/AdminVaultManagement.tsx` | 1 |

**17 of 28 are in vault files** — deleting vault (P3-4) removes them for free,
leaving 11.

CI currently runs lint as **non-blocking** for exactly this reason. Once the
count is zero, make it blocking.

**Effort:** ~2 hours for the remaining 11.

## P3-4: Vault code still shipped to every visitor

Since the Vault feature is being dropped:

| Path | Size | Status |
| :--- | :--- | :--- |
| `frontend/src/vault/` | 94 KB | routes live at `/vault/*` (`App.tsx:234-251`) |
| `frontend/src/components/vault/` | 120 KB | rendered by the above |
| `frontend/src/admin/pages/AdminVaultManagement.tsx` | 72 KB | **dead code** — lazy-imported at `App.tsx:147`, never rendered |

`AdminVaultManagement` is the clearest case: `/admin/vault` already redirects
to `/admin/channel-partners` (`App.tsx:306`), so the component is imported and
never used.

**Impact.** ~286 KB of source for a feature you don't want, plus 17 of the 28
lint errors, plus a public `/vault/login` page prospects can reach.

**Fix (order matters).** Remove the routes and the lazy imports in `App.tsx`
first, confirm the build passes, then delete the directories. Leave the
**backend** vault modules and database tables alone for now — deleting tables
is destructive and irreversible, and the frontend removal gets you the whole
user-visible benefit.

**Effort:** ~2 hours frontend only.

---

# Verified healthy

Checked and found **not** to be problems — recorded so they don't get
re-audited:

| Checked | Result |
| :--- | :--- |
| Images missing `alt` | **0** — all `<img>` tags have alt (an initial grep suggested 24, but it missed multi-line JSX; a proper parser found none) |
| Icon-only buttons without `aria-label` | 0 |
| Prisma schema drift | **Zero** — `migrate diff` returns an empty migration. The teammate's `iconKey` and `sectionVisibility` both have migrations |
| Frontend typecheck | **Passes** — the 8 errors in `FranchiseDetail`/`PropertyDetail` reported earlier have been fixed |
| Backend typecheck | Passes after `prisma generate` (a stale local client, not a code bug) |
| Double-submit on admin forms | Guarded — buttons disable while saving |
| Property delete | Confirms via modal (`AdminPropertiesList.tsx:58`) |
| Pagination | Present on Properties, Franchises, Site Visits, Partners (Inquiries is the exception — P1-2) |
| Error/loading states | Present on all public list and detail pages except `Index.tsx` |
| `/admin/vault` dead route | Already redirects — handled |
| Static assets | `/vilaasa-icon.svg`, `/vault-icon.png`, `/videos/hero-video.mp4` all 200 |
| `robots.txt` | Serves correctly (but see P2-5 for the missing sitemap directive) |

## Not our bug

**`Uncaught TypeError: Cannot read properties of undefined (reading 'startTime')`**
originates in Google Tag Manager (`GTM-5K5JWXN4`), not this codebase.
`reportAllChanges` is a Google `web-vitals` API — it appears nowhere in
`package.json`, `src/`, or the built bundle. It throws inside Google's own
callback and does not affect the app. Either ignore it, or remove the GTM
snippet from `frontend/index.html` if that container is unused.

## Deployment state

Current as of this audit — all recent fixes are live:

| Check | Value |
| :--- | :--- |
| z-index fix (dropdowns above modals) | deployed |
| Rate limit | 1000/15min (was 100) |
| Content | 3 estates, 2 franchises |

---

# Suggested order

1. **P1-1** — fake franchise data. Highest risk, ~30 min, pure deletion.
2. **P2-2** — remove or wire the newsletter. ~15 min to remove.
3. **P2-1** — delete confirmations. ~1 hour, prevents data loss.
4. **P1-2** — inquiries pagination. Do before you pass 100 leads.
5. **P2-3** — confirm the real social handles, then fix the footer.
6. **P3-4** — strip vault; clears 17 lint errors as a side effect.
7. **P2-4 / P2-5** — SEO. Largest payoff, largest effort.

## Two open questions

- **P2-3:** which social handles are correct — the code or the brief?
- **P2-4:** is SEO a priority? If organic search matters, the SPA is a real
  ceiling and prerendering deserves its own discussion rather than a patch.

## Known content gaps (not bugs)

From the earlier content import, for the record:

- Every pricing row has `areaSqFt = 0` — the source document said
  "Carpet Area in sq.ft" as a placeholder, never an actual number.
- None of the five imported records have images — no hero, gallery, or
  franchise `heroImage`. These need adding through the admin panel.
