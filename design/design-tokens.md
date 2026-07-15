# Makita Bush Chopyard — Design Tokens

Reference for whoever builds the Figma file, kept in sync with `tailwind.config.ts`.
Subject: a Ghanaian "chopyard" — an everyday local eatery. The design language
leans on market signage and the order-ticket/receipt as physical objects,
rather than generic food-app cheerfulness.

## Color

| Token      | Hex       | Use                                      |
|------------|-----------|-------------------------------------------|
| `ivory`    | `#FBF6EC` | Page background                           |
| `ink`      | `#2B2118` | Primary text, headings                    |
| `pepper`   | `#C1272D` | Primary CTA, errors, price emphasis       |
| `leaf`     | `#1F6E43` | Success states, "order ready" status      |
| `palmgold` | `#D4A017` | Badges, highlights, active nav            |
| `taupe`    | `#7A6A58` | Secondary text, borders, disabled states  |

## Type

- **Display** — Fraunces (700/900 weight): page titles, menu item names on the customer-facing menu. Chunky serif gives it market-signage weight without being a cliché AI-default serif pairing.
- **Body** — Work Sans (400/500/600): all UI copy, forms, descriptions.
- **Mono** — IBM Plex Mono: prices, order numbers, receipts — anything that should read as data/a ticket stub.

## Layout signature

The recurring motif is the **order ticket**: a card with a perforated/torn top
edge (achievable in CSS with a repeating radial-gradient mask) used for the
cart summary and order confirmation. It ties the checkout flow visually to
the idea of a physical chop-bar receipt, which is the one place this app
should feel tactile rather than purely digital.

Keep everything else — menu grid, admin tables, forms — quiet and functional.
Spend the one visual "risk" on the ticket motif; don't decorate elsewhere.
