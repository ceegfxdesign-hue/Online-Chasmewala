# Database ER Diagram

MongoDB (document) model. Relationships are expressed via `ObjectId` references. The diagram below
uses Mermaid; it renders on GitHub and in most Markdown viewers.

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ REVIEW : writes
    USER ||--o{ ADDRESS : has
    USER ||--o| CART : owns
    USER ||--o| WISHLIST : owns
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ RETURN : requests
    USER ||--o{ RECENTLYVIEWED : tracks

    CATEGORY ||--o{ PRODUCT : groups
    BRAND ||--o{ PRODUCT : manufactures
    PRODUCT ||--o{ REVIEW : has
    PRODUCT ||--o| INVENTORY : "stock tracked by"

    ORDER ||--o{ ORDERITEM : contains
    ORDER ||--o| RETURN : "may have"
    PRODUCT ||--o{ ORDERITEM : "referenced in"

    COUPON ||--o{ ORDER : "applied to"
    OFFER }o--o{ PRODUCT : targets
    BANNER }o--|| CATEGORY : "links to"

    CART ||--o{ CARTITEM : contains
    WISHLIST }o--o{ PRODUCT : lists
```

## Collections

| Collection       | Purpose                                                       |
| ---------------- | ------------------------------------------------------------- |
| `users`          | Accounts, roles, saved cards (tokenized), auth material.      |
| `products`       | Catalog items with full eyewear attributes and flags.         |
| `categories`     | Product categories (eyeglasses, sunglasses, computer, kids…). |
| `brands`         | Brands / house labels.                                        |
| `orders`         | Orders with embedded order items and status timeline.         |
| `reviews`        | Ratings, text, images, likes; moderated.                      |
| `coupons`        | Discount codes and rules.                                     |
| `offers`         | Automatic offer engine rules / seasonal collections.          |
| `addresses`      | User shipping/billing addresses.                              |
| `carts`          | Per-user cart with embedded items.                            |
| `wishlists`      | Per-user wishlist product references.                         |
| `notifications`  | Per-user notifications.                                       |
| `banners`        | Home/marketing banners managed by admin.                      |
| `returns`        | Return/exchange requests + refund status.                     |
| `inventory`      | Stock ledger + low-stock thresholds.                          |
| `recentlyviewed` | Per-user recently viewed products.                            |
| `settings`       | Global store settings.                                        |

> Field-level schemas are documented alongside the Mongoose models in Phase 3.
