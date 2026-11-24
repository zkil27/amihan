# AMIHAN: Entity Relationship Diagram

Render it in VS Code (Markdown Preview with a Mermaid extension) or paste the block into https://mermaid.live and export a PNG for the slides.

- **PK** marks the primary key, and **FK** marks a foreign key.
- Crow's-foot notation:
  - `||` exactly one
  - `o|` zero or one
  - `|{` one or many
  - `o{` zero or many

```mermaid
erDiagram
    USERS ||--o{ ADDRESSES : "saves"
    USERS ||--o{ ORDERS : "places"
    USERS |o--o{ CARTS : "owns"
    USERS ||--o{ RETURN_REQUESTS : "files"
    USERS |o--o{ SHIPMENTS : "delivers (courier)"
    USERS |o--o{ ORDER_STATUS_HISTORIES : "changes"
    USERS |o--o{ INVENTORY_MOVEMENTS : "records"
    USERS |o--o{ REFUNDS : "processes"

    CATEGORIES |o--o{ CATEGORIES : "parent of"
    CATEGORIES ||--o{ PRODUCTS : "groups"
    PRODUCTS ||--|{ PRODUCT_VARIANTS : "sold as"
    PRODUCTS ||--o{ PRODUCT_IMAGES : "shown in"

    CARTS ||--o{ CART_ITEMS : "holds"
    PRODUCT_VARIANTS ||--o{ CART_ITEMS : "added as"
    COUPONS |o--o{ CARTS : "applied to"
    COUPONS |o--o{ ORDERS : "discounts"

    ORDERS ||--|{ ORDER_ITEMS : "contains"
    PRODUCT_VARIANTS |o--o{ ORDER_ITEMS : "purchased as"
    ORDERS ||--|{ ORDER_STATUS_HISTORIES : "logs"
    ORDERS ||--|{ PAYMENTS : "paid by"
    ORDERS ||--o| SHIPMENTS : "shipped in"
    ORDERS ||--o{ RETURN_REQUESTS : "has"
    RETURN_REQUESTS ||--o| REFUNDS : "results in"
    PAYMENTS ||--o{ REFUNDS : "refunded by"
    PRODUCT_VARIANTS ||--o{ INVENTORY_MOVEMENTS : "tracked by"
    ORDERS |o--o{ INVENTORY_MOVEMENTS : "causes"

    USERS {
        bigint id PK
        string name
        string email UK
        string phone
        enum role "customer|admin|staff|fulfillment|courier"
        string password "bcrypt hash"
        timestamp email_verified_at
    }
    ADDRESSES {
        bigint id PK
        bigint user_id FK
        string label
        string recipient
        string phone
        string line1
        string barangay
        string city
        string province
        string postal_code
        bool is_default
    }
    CATEGORIES {
        bigint id PK
        bigint parent_id FK
        string name
        string slug UK
        int sort
        bool is_archived
    }
    PRODUCTS {
        bigint id PK
        bigint category_id FK
        string name
        string slug UK
        string origin
        int elevation_masl
        string process
        string tasting_notes
        text story
        enum status "draft|active|archived"
        bool is_featured
        timestamp deleted_at "soft delete"
    }
    PRODUCT_VARIANTS {
        bigint id PK
        bigint product_id FK
        string sku UK
        string name
        decimal price
        int stock_qty
        int low_stock_threshold
        bool is_active
    }
    PRODUCT_IMAGES {
        bigint id PK
        bigint product_id FK
        string path
        string alt
        int sort
    }
    CARTS {
        bigint id PK
        bigint user_id FK
        string session_id
        bigint coupon_id FK
        enum status "active|converted|abandoned"
    }
    CART_ITEMS {
        bigint id PK
        bigint cart_id FK
        bigint product_variant_id FK
        int qty
    }
    COUPONS {
        bigint id PK
        string code UK
        enum type "percent|fixed"
        decimal value
        decimal min_subtotal
        timestamp expires_at
        bool is_active
    }
    ORDERS {
        bigint id PK
        string order_no UK
        bigint user_id FK
        bigint coupon_id FK
        enum status "pending|confirmed|packed|shipped|delivered|cancelled|returned"
        decimal subtotal
        decimal discount
        decimal delivery_fee
        decimal total
        string delivery_window
        string billing_name_email_phone "snapshot"
        string shipping_address "snapshot"
        timestamp placed_at
    }
    ORDER_ITEMS {
        bigint id PK
        bigint order_id FK
        bigint product_variant_id FK
        string product_name "snapshot"
        string variant_name "snapshot"
        decimal unit_price
        int qty
        decimal line_total
    }
    ORDER_STATUS_HISTORIES {
        bigint id PK
        bigint order_id FK
        string status
        string note
        bigint changed_by FK
    }
    PAYMENTS {
        bigint id PK
        bigint order_id FK
        enum method "card|gcash|cod"
        decimal amount
        enum status "pending|paid|failed|refunded"
        string gateway_ref
        string card_last4
    }
    SHIPMENTS {
        bigint id PK
        bigint order_id FK "unique"
        bigint courier_id FK
        string tracking_no UK
        enum status "assigned|in_transit|delivered"
        timestamp shipped_at
        timestamp delivered_at
    }
    RETURN_REQUESTS {
        bigint id PK
        bigint order_id FK
        bigint user_id FK
        enum type "cancellation|return"
        string reason
        enum status "requested|approved|rejected|completed"
        string admin_note
        bigint handled_by FK
    }
    REFUNDS {
        bigint id PK
        bigint return_request_id FK
        bigint payment_id FK
        decimal amount
        string gateway_ref
        bigint processed_by FK
    }
    INVENTORY_MOVEMENTS {
        bigint id PK
        bigint product_variant_id FK
        int change "+restock / -sale"
        enum reason "sale|restock|return|cancellation|adjustment"
        bigint order_id FK
        bigint user_id FK
        string note
    }
```

## Talking points

- **Price and stock live on the variant, not the product.** "Atok Highland" is sold as 250 g and as 500 g, and each size has its own price, stock and SKU.
- **Orders snapshot names, prices and addresses.** If a price changes or a customer moves, past orders still show exactly what was bought.
- **The cart is a table, not just session data.** That is how it survives page changes and merges into the account at login. It also lets the admin reports measure conversion (carts that became orders) and abandonment (carts left idle).
- **`inventory_movements` is a ledger.** Every sale, restock, return and manual adjustment is a row, so stock levels can always be explained.
- **Return requests and refunds are separate tables.** A request can be approved or declined. Only an approved request that had a paid payment produces a refund row.
- **Roles live on `users.role`.** The `EnsureRole` middleware and Laravel Gates read it to decide what each person can see and do.
