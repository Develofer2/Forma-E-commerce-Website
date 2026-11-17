# Forma — Good things. For everyday.

A considered e-commerce portfolio demo built with React 19, Next.js App Router,
TypeScript, Tailwind CSS v4, and the Figma-managed Payload backend.

## Try it

1. Browse the collection, use categories, search, price/rating filters, and sorting.
2. Open an object, save it, or add it to your bag.
3. Create an email/password account to synchronize the bag and wishlist.
4. Check out using **4242 4242 4242 4242**, a future expiry, and a 3-digit CVC.
5. Review the mock order in your account.

No real payments are processed. Card form values are never transmitted or stored.
No products are shipped. Shipping is $8, complimentary at $100.

## Pages and rendering

| Route | Contract |
| --- | --- |
| `/` | Cached public catalog, categories, and store story |
| `/products/[slug]` | Statically generated product pages with tagged cache reads |
| `/wishlist` | Static shell with cached catalog; browser/user-specific selections |
| `/about` | Cached public store story |
| `/account` | Static shell; private session/order data loaded from noncached endpoints |
| `/checkout` | Static shell; browser bag and network-only mock-order submission |
| `/admin` | Existing Figma/Payload CMS editor interface |

Catalog reads use `unstable_cache`, tagged `catalog` and `product:<slug>`.
Products, Categories, Store Stories, and Media invalidate the catalog, affected
pages, and old/current product slugs on write/delete. CMS changes are intended
to appear on subsequent visits without rebuilding the entire store.

## Data and privacy

- `products`: names, native slugs, media upload relationship, category, price,
  stock, materials, color, display rating, and merchandising badge.
- `categories`: reusable, ordered taxonomy.
- `store-stories`: CMS-managed hero and editorial photography.
- `users`: app-only Payload email/password accounts, separate from CMS admins;
  user-owned cart and wishlist.
- `orders`: private, owner-scoped mock orders. Collection hooks derive the owner,
  reference, item snapshots, and total from authoritative product records.
- `reviews`: authenticated ratings/comments with server-owned attribution.
- `media`: public uploads served through the existing Figma image loader.

User-facing Local API operations run with `overrideAccess: false`.
An isolated HTTP-only `app-session` cookie contains the Payload-issued app token.
CMS sessions are not read, changed, or reused by app authentication.
Payload handles password hashing and login-attempt locking.

## Offline and installation

Dexie/IndexedDB stores the bag, wishlist, recently viewed objects, cached catalog,
and a minimal pending-order outbox. The service worker:

- keeps bounded versioned app-shell, static-asset, catalog, and image caches;
- uses fresh HTML when online and cached pages when offline;
- retains previously viewed full product pages as well as Next route state;
- never caches private account APIs or checkout submissions;
- retries queued orders with Background Sync where supported;
- falls back to foreground sync when the app reconnects.

An offline order is explicitly **queued**, not confirmed. It must sync under
the same app account and is repriced/validated on the server. Queued orders can
be cancelled in the account view. No payment details enter the outbox.
Browser support and storage eviction vary. Installation requires HTTPS and a
supporting browser. The footer offers an install control and browser guidance.

### Manual reliability checklist

- Load the homepage and a product online, and add two items to the bag.
- Reload and verify the saved bag and wishlist.
- In browser DevTools, switch to offline.
- Reload the already-loaded pages; change quantities and save an object.
- Complete a mock checkout under an existing account and observe “saved” status.
- Reconnect and confirm one order appears, without duplicate submissions.
- Verify account data is inaccessible while signed out and from another account.
- Check 320px, tablet, and desktop widths; keyboard navigation and focus.
- Install from a supporting browser and reopen in standalone mode.

## Commands

The Make development server is supervised; do not launch another instance.

```sh
pnpm install
pnpm exec tsc --noEmit
node --experimental-strip-types --test tests/*.test.mjs
pnpm format src tests README.md
figma make verify-deploy
```

Use `pnpm build` (`payload build`) for a local production build when the managed
backend environment is available. Content operations and starter media are
managed with the installed Payload CLI, not an application seed endpoint.

## Notes

Starter scores are demo merchandising data until a product receives a real
review. Review create/update/delete hooks then recalculate its actual average
and count, and product-write hooks invalidate the catalog and detail caches.
Photography is from Unsplash, ingested
into Payload Media. Typefaces are locally served Google Fonts (DM Sans and
DM Serif Display), so they are cacheable offline. The small analytics dashboard
and third-party payment/email integrations are not included in this demo.

## Verification record

- `pnpm exec tsc --noEmit`: passed.
- Six pricing/shipping unit tests: passed.
- `figma make verify-deploy`: passed. `/`, `/about`, `/account`, `/checkout`,
  and `/wishlist` are static; all eight product paths are SSG. Account APIs and
  CMS routes remain request-time.
- All 13 public pages were visited on the production server; content images
  decoded with nonzero dimensions.
- Browser checks covered search, category filtering, sorting, wishlist, bag
  persistence and quantities, signup/login/logout, checkout, order history,
  signed-out protection, and duplicate-order prevention.
- Offline app reload, saved product reload, bag changes, order queuing, and
  reconnect sync passed. Viewports of 320, 390, 768, and 1440px had no horizontal
  page overflow.
- A new production review recalculated its product rating. Fresh catalog,
  product-detail, and wishlist requests showed the changed score/count without
  a rebuild, exercising the same product-write invalidation hooks used by Admin.
- Physical-device installation and Lighthouse scores were not measured.
