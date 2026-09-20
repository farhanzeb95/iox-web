# IOX Marketplace Requirements Specification

**Product:** IOX
**Document status:** Product and engineering baseline
**Domain:** Pakistan marketplace combining Daraz-style catalog commerce with OLX-style seller listings
**Currency and market:** PKR, Pakistan
**Primary payment methods:** JazzCash, EasyPaisa, Raast, Cash on Delivery (COD)

## 1. Product vision

IOX is a trusted two-sided marketplace where buyers can discover and purchase new, used, and refurbished products from private and business sellers. The product combines:

- **Catalog commerce:** searchable products, cart, checkout, seller-fulfilled orders, delivery tracking, returns, and reviews.
- **Classifieds commerce:** seller-created listings, product condition, seller storefronts, direct seller identity, and trust signals.

The experience must remain usable for low-friction local selling while providing the order, payment, and operational controls expected from an online marketplace.

## 2. Goals and success measures

### 2.1 Goals

1. Let a buyer find a product, assess seller trust, select a supported payment method, and place an order with minimal friction.
2. Let private and business sellers create listings, manage inventory, fulfill orders, and monitor sales.
3. Provide administrators with the controls needed to verify sellers, moderate listings, manage users, monitor payments, and resolve disputes.
4. Make payment and order status unambiguous for both the buyer and the seller.
5. Protect users from fraudulent listings, unauthorized access, duplicate orders, and inconsistent inventory.

### 2.2 Initial success measures

- Product search-to-detail and detail-to-cart conversion can be measured.
- Checkout completion rate by payment method can be measured.
- Payment success, failure, expiry, and reconciliation rates are available by provider.
- Order cancellation, delivery, return, refund, and dispute rates are available.
- Seller approval time and listing moderation time are available.
- No order can be created with unavailable stock or an unapproved seller.
- All privileged actions are attributable to an authenticated administrator.

## 3. Scope

### 3.1 In scope

- Buyer, private seller, business seller, and administrator accounts.
- Seller identity/business verification.
- Product listings for new, used, and refurbished goods.
- Search, filtering, categories, product detail, seller store, reviews, watchlist, and cart.
- Multi-seller checkout that creates one order per seller.
- JazzCash, EasyPaisa, Raast, and COD payments.
- Order fulfillment, tracking, cancellation, returns, refunds, and buyer/seller notifications.
- Admin moderation, seller approval, user management, payment reconciliation, and reporting.
- Responsive web application and authenticated REST API.

### 3.2 Out of scope for the first release

- International shipping or currencies other than PKR.
- Auctions, bidding, or timed listings.
- Wallet balances or peer-to-peer money transfer.
- Subscription plans or paid seller promotion.
- Automated cross-border tax calculation.
- Native mobile applications.

## 4. Actors and permissions

### 4.1 Buyer

A buyer can register, browse, search, save products, manage a cart, place orders, pay, track delivery, cancel eligible orders, request returns/refunds, review purchased products, and manage their profile.

### 4.2 Private seller

A private seller can register with identity documents, maintain a seller profile, create and manage listings, receive orders, provide shipment details, respond to return requests, and view sales information after approval.

### 4.3 Business seller

A business seller can register with business registration and identity information, maintain business details, create and manage listings, receive orders, provide shipment details, respond to returns, and view sales information after approval.

### 4.4 Administrator

An administrator can review and approve/reject seller accounts, moderate products and users, view all orders and payment records, manage status exceptions, process/referee disputes, manage categories and policies, and view operational reports.

Administrator capabilities must be enforced server-side. A hidden frontend route is not an authorization control.

### 4.5 Guest

A guest can browse public products, categories, seller stores, help pages, shipping information, return policy, and payment method information. A guest must authenticate before using cart, checkout, watchlist, orders, returns, reviews, or seller tools.

## 5. Current baseline

The repositories already provide a substantial baseline:

- Vue frontend and Go/Gin backend with JWT authentication.
- Roles: `ADMIN`, `BUYER`, `PRIVATE_SELLER`, and `BUSINESS_SELLER`.
- Product listing, detail, category/search/filter support, seller stores, image upload, cart, watchlist, reviews, dashboards, orders, shipment fields, and returns.
- One order per seller for a multi-seller cart.
- Seller signup documents and seller account statuses (`ACTIVE`, `IN_REVIEW`, `REJECTED`).
- Order payment fields (`paymentMethod`, `paymentStatus`) and payment constants for COD, JazzCash, EasyPaisa, bank transfer, and card.

The following are requirements to complete or harden the product; they must not be assumed to be implemented solely because a field or UI option exists.

## 6. Functional requirements

### 6.1 Registration, login, and account security

**FR-AUTH-01** The system shall allow registration as buyer, private seller, or business seller.

**FR-AUTH-02** The system shall validate unique email addresses, password strength, required names, valid contact number, and a Pakistan-compatible address.

**FR-AUTH-03** Seller registration shall require:

- Private seller: identity card front and back.
- Business seller: business registration document and required identity/contact information.

**FR-AUTH-04** A seller submitted with required documents shall be `IN_REVIEW` until an administrator approves it. An `IN_REVIEW` or `REJECTED` seller shall not publish listings or accept orders.

**FR-AUTH-05** The system shall support login, logout, expired-token handling, password reset, and account deactivation. Passwords shall never be returned by an API response or logged.

**FR-AUTH-06** The API shall enforce role and resource ownership on every protected endpoint. Buyers may access only their data; sellers may access only their products, orders, returns, and documents; administrators may access administrative data.

**FR-AUTH-07** The system shall rate-limit login and sensitive authentication endpoints and record failed login attempts.

### 6.2 Seller verification and trust

**FR-TRUST-01** Administrators shall see a seller verification queue with seller type, submitted documents, contact details, submission date, and current status.

**FR-TRUST-02** An administrator shall approve or reject a seller with a mandatory reason for rejection. The decision, actor, timestamp, and previous/new status shall be recorded.

**FR-TRUST-03** Seller documents shall be private, access-controlled, encrypted in transit, and unavailable through predictable public URLs.

**FR-TRUST-04** Approved seller storefronts shall show seller type, display name, verification status, rating summary, completed-order count, and response/delivery signals when available.

**FR-TRUST-05** Buyers shall be able to report a product, seller, review, or message. Administrators shall be able to investigate and resolve reports.

**FR-TRUST-06** A private seller shall pay a monthly PKR 500 store fee and a business seller shall pay a monthly PKR 1,000 store fee to keep the store active.

**FR-TRUST-07** Seller store fees shall be payable by JazzCash, EasyPaisa, Raast, or bank transfer. Each submission shall include a payment reference and remain pending until verified by an administrator.

### 6.3 Product listings

**FR-PRODUCT-01** An approved seller shall create a listing with title, description, category, price in PKR, quantity, condition, images, SKU (optional for private sellers and required or configurable for business sellers), and tags.

**FR-PRODUCT-02** The system shall validate non-negative price, positive listing quantity where the listing is available, supported condition values (`NEW`, `USED`, `REFURBISHED`), image type/size/count, and maximum field lengths.

**FR-PRODUCT-03** A seller shall edit, pause, publish, and delete their own listing. Deleting a listing must not remove historical order line data.

**FR-PRODUCT-04** A listing with zero stock shall be marked unavailable and cannot be added to a new order.

**FR-PRODUCT-05** Product images shall have a primary image, stable ordering, alt text where practical, and server-side content validation.

**FR-PRODUCT-06** Administrators shall be able to hide, restore, or remove a listing and record the reason.

**FR-PRODUCT-07** Product price and stock must be re-read and validated transactionally at checkout. The server must not trust cart prices or quantities sent by the client.

### 6.4 Discovery and product evaluation

**FR-DISC-01** Guests and buyers shall browse paginated products by category, condition, price range, availability, seller, rating, and recency.

**FR-DISC-02** Search shall cover title, description, category, tags, SKU where applicable, and seller name, with normalized matching and safe query handling.

**FR-DISC-03** Buyers shall be able to sort by relevance, newest, price low-to-high, price high-to-low, and rating.

**FR-DISC-04** Product detail shall show current price, availability, condition, images, description, seller information, rating, reviews, and relevant delivery/return information.

**FR-DISC-05** Buyers shall add/remove products from a watchlist and see an accurate count.

**FR-DISC-06** Only a buyer associated with a completed/delivered purchase of a product may submit one review per eligible order line. Reviews shall support rating, comment, creation date, and moderation state.

### 6.5 Cart and checkout

**FR-CART-01** Buyers shall add products, change quantities, remove products, and clear the cart.

**FR-CART-02** The cart shall display current product availability, seller, unit price, quantity, line total, subtotal, delivery charges if applicable, discounts if applicable, and final total.

**FR-CART-03** At checkout, the system shall validate address completeness, seller approval, listing availability, stock, current pricing, and payment-method eligibility.

**FR-CART-04** A cart containing multiple sellers shall produce one child order per seller, with clear seller subtotals and separate fulfillment/payment state where the payment provider requires it.

**FR-CART-05** Stock reservation/decrement and order creation shall be atomic. A failed order must not partially decrement stock or clear the cart.

**FR-CART-06** The buyer shall see a final order review before submission and receive a safe retry experience that does not create duplicate orders when a request is repeated.

### 6.6 Payment requirements

#### Supported methods

**FR-PAY-01** The first release shall support:

- **JazzCash** mobile-wallet payment.
- **EasyPaisa** mobile-wallet payment.
- **Raast** instant payment.
- **Cash on Delivery (COD)**.

Bank transfer and card options shall remain hidden or explicitly marked out of scope until their provider and reconciliation flows are implemented.

#### Common payment behavior

**FR-PAY-02** Each order shall have a payment record with order ID, buyer, amount, currency, method, provider reference, internal transaction reference, status, timestamps, and failure/reconciliation metadata.

**FR-PAY-03** Payment statuses shall be explicit and auditable: `PENDING`, `INITIATED`, `AUTHORIZED`, `PAID`, `FAILED`, `EXPIRED`, `CANCELLED`, `REFUNDED`, `PARTIALLY_REFUNDED`, and `COD_PENDING` where applicable.

**FR-PAY-04** Provider callbacks/webhooks shall be authenticated, idempotent, logged, and validated against amount, currency, order, and merchant configuration. A client redirect alone shall never mark an order as paid.

**FR-PAY-05** Payment secrets, signing keys, wallet credentials, and sensitive provider payloads shall be stored in server-side secrets management and excluded from frontend bundles and logs.

#### JazzCash and EasyPaisa

**FR-PAY-06** The buyer shall select JazzCash or EasyPaisa, see the payable amount and payment instructions/provider redirect, and receive a clear pending state while the provider confirms payment.

**FR-PAY-07** The system shall store provider transaction ID and reconcile asynchronous success/failure/expiry callbacks. Repeated callbacks shall not duplicate payment or order state changes.

**FR-PAY-08** A payment timeout or failure shall leave the order in a recoverable state, allow retry according to provider rules, and release any stock reservation after the configured expiry period.

**FR-PAY-09** The system shall display only masked wallet/contact data where shown to users and shall never expose full payment credentials.

#### Cash on Delivery

**FR-PAY-10** COD checkout shall create an order with `COD_PENDING` payment status and no online payment transaction.

**FR-PAY-11** COD orders shall have configurable eligibility rules, including maximum order amount, serviceable location, seller opt-in, and buyer risk/cancellation history.

**FR-PAY-12** On delivery confirmation, an authorized fulfillment/admin action shall mark COD as collected/paid. Failed delivery shall support a failed-delivery state and inventory/reconciliation handling.

**FR-PAY-13** The buyer shall see the total amount due on delivery, including delivery charges, before placing the COD order.

#### Refunds and reconciliation

**FR-PAY-14** The system shall support full and partial refunds linked to an order, return, cancellation, or dispute, with reason, amount, actor, provider reference, status, and timestamps.

**FR-PAY-15** Administrators shall see unmatched provider transactions, duplicate callbacks, failed settlements, COD collections, and payment records requiring manual review.

### 6.7 Orders and fulfillment

**FR-ORDER-01** Each order shall contain immutable buyer/seller snapshots, order lines with purchase-time title/price/quantity/image, shipping address snapshot, totals, payment details, and audit timestamps.

**FR-ORDER-02** The default fulfillment workflow shall be:

`PENDING_PAYMENT` -> `PENDING` -> `CONFIRMED` -> `SHIPPED` -> `DELIVERED`

with terminal or exception states `CANCELLED`, `FAILED_DELIVERY`, `RETURN_REQUESTED`, `RETURNED`, and `REFUNDED` as applicable.

**FR-ORDER-03** Only authorized actors shall transition an order, and each transition shall validate the current state. The API shall reject invalid transitions.

**FR-ORDER-04** Sellers shall confirm, prepare, and ship their own orders; shipment updates shall include carrier and tracking number where available.

**FR-ORDER-05** Buyers shall view order history and detail, payment status, seller, items, shipping address, tracking information, and status history.

**FR-ORDER-06** Buyers may cancel only eligible orders before seller shipment/confirmation according to policy. Cancellation shall restore stock only when the item has not been shipped.

**FR-ORDER-07** The system shall prevent unauthorized access to order details by guessing an order ID.

**FR-ORDER-08** Buyers, sellers, and administrators shall receive in-app and/or email notifications for order creation, payment result, confirmation, shipment, delivery, cancellation, return decision, and refund result.

### 6.8 Returns, refunds, and disputes

**FR-RETURN-01** The return policy shall define eligible categories, return window, acceptable reasons, condition/evidence requirements, shipping responsibility, and refund method.

**FR-RETURN-02** A buyer shall request a return against an eligible delivered order or line item, including reason, description, and optional evidence images.

**FR-RETURN-03** A return shall have an auditable state workflow such as `REQUESTED`, `APPROVED`, `REJECTED`, `IN_TRANSIT`, `RECEIVED`, `REFUND_PENDING`, `REFUNDED`, and `CLOSED`.

**FR-RETURN-04** Sellers may respond to return requests within the policy window. Administrators shall be able to intervene and resolve disputes.

**FR-RETURN-05** A refund shall not be marked complete until the refund action has a recorded amount, method, reference, actor/system source, and timestamp.

### 6.9 Dashboards and administration

**FR-ADMIN-01** The admin dashboard shall show users, sellers by verification status, listings by moderation status, orders by status, payments by status/method, returns, disputes, and operational alerts. Metrics shall come from real backend data.

**FR-ADMIN-02** Admin user management shall support search, role/status filters, account suspension/reactivation, and view-only profile details. Destructive actions require confirmation and audit logging.

**FR-ADMIN-03** Admins shall manage categories, condition values, delivery zones/fees, COD limits, payment availability, return policy configuration, and moderation rules.

**FR-ADMIN-04** Seller dashboards shall show listing inventory, pending orders, sales totals, payment state, shipment state, returns, and actionable exceptions.

**FR-ADMIN-05** Buyer dashboards shall show active orders, delivered orders, returns, watchlist count, payment issues, and recent orders.

**FR-ADMIN-06** Reports shall support date range, seller, payment method, status, category, and export to a controlled format such as CSV.

### 6.10 Help, policy, and content

**FR-CONTENT-01** Public help content shall explain how to buy, how to sell, shipping, payments, COD, JazzCash, EasyPaisa, returns, refunds, prohibited products, and dispute escalation.

**FR-CONTENT-02** Payment instructions shall state that a payment is not complete until IOX confirms it and shall provide support contact and reference information.

**FR-CONTENT-03** Legal/policy pages shall show a version/effective date and be maintainable without code deployment where practical.

## 7. Data and API requirements

### 7.1 Required core entities

The platform shall maintain at least these entities:

- User, role, seller verification submission, and audit event.
- Product, product image, category, inventory record, and moderation record.
- Cart and cart item.
- Order, order line, order status event, shipment, and delivery attempt.
- Payment, payment event, refund, and reconciliation exception.
- Return request, return evidence, dispute, and resolution.
- Watchlist, review, notification, report, and support request.

The existing `orders.payment_method` and `orders.payment_status` fields are useful compatibility fields, but payment history should be normalized into separate payment/event records before production provider integration.

### 7.2 API standards

- JSON request/response format with consistent lower camel case or a documented convention.
- Consistent error envelope containing machine-readable code, user-safe message, and optional field errors.
- UUID identifiers and server-generated timestamps.
- Pagination metadata for list endpoints.
- Request correlation ID in logs and error responses where safe.
- Idempotency key for order creation, payment initiation, provider callbacks, and refund requests.
- Optimistic concurrency or current-state checks for inventory and order updates.
- API versioning under `/api/v1` with documented deprecation policy.

### 7.3 Minimum API areas

- Authentication and profile.
- Seller verification and document review.
- Products, images, categories, moderation, and inventory.
- Search and discovery.
- Watchlist and cart.
- Checkout, payment initiation, callbacks, payment status, refunds, and reconciliation.
- Orders, shipment tracking, status history, cancellation, and delivery attempts.
- Returns, disputes, and reviews.
- Notifications, reports, admin metrics, audit logs, and support.

## 8. Non-functional requirements

### 8.1 Security and privacy

- TLS for all production traffic.
- Password hashing using a modern password hashing function such as Argon2id or bcrypt with an appropriate cost.
- JWT expiry, refresh/revocation strategy, and secure token storage policy.
- Server-side authorization checks for every protected resource.
- Input validation, output encoding, parameterized SQL, upload MIME/content checks, and malware scanning where available.
- Rate limiting for login, signup, uploads, checkout, payment callbacks, reviews, and reports.
- No sensitive payment data, passwords, identity documents, or full provider payloads in application logs.
- Privacy retention and deletion rules for identity documents, order history, and support data.
- Regular dependency, secret, and vulnerability scanning.

### 8.2 Reliability and consistency

- Order creation, inventory changes, and cart clearing must be transactional.
- Payment callbacks and status updates must be idempotent.
- Background jobs must retry safely and use a dead-letter/manual-review path after repeated failure.
- Backups and tested restore procedures shall exist for the production database.
- Provider downtime shall degrade to a clear pending/unavailable state rather than falsely confirming payment.

### 8.3 Performance

- Public product browsing should return the first useful page within 2 seconds under agreed baseline load.
- Search and filtered listing endpoints should be indexed and paginated.
- Images should be resized/compressed for web delivery and served from storage/CDN where available.
- Checkout and payment initiation should provide a response or explicit pending state within 3 seconds excluding provider processing time.

### 8.4 Accessibility and compatibility

- Responsive layouts for current desktop and mobile browser sizes.
- Keyboard-operable forms and controls, visible focus state, semantic labels, accessible error messages, and adequate contrast.
- Support for current versions of Safari, Chrome, Edge, and Firefox.
- All money values displayed in PKR with consistent decimal/rounding rules.

### 8.5 Observability

- Structured logs with correlation IDs.
- Metrics for API errors/latency, checkout, payment, order transitions, stock failures, callbacks, refunds, and background jobs.
- Alerts for payment callback failures, reconciliation mismatches, stock inconsistencies, elevated failed deliveries, and database/storage failures.
- Admin audit trail for authentication-sensitive, financial, moderation, and status-changing actions.

## 9. Business rules

1. Only approved active sellers may publish listings or receive new orders.
2. A buyer may not review a product without an eligible delivered purchase.
3. Product price at order creation is immutable on the order line even if the listing later changes.
4. Stock must never become negative.
5. An order total is the sum of immutable order lines plus applicable delivery charges minus valid discounts.
6. Payment status and fulfillment status are separate state machines.
7. A provider callback cannot change an order belonging to another merchant/order or with a mismatched amount.
8. COD availability is subject to configured eligibility rules.
9. Return/refund decisions must follow the published policy and remain auditable.
10. Admin overrides require a reason and are visible in audit history.

## 10. Acceptance criteria for the first production release

- A buyer can register/login, search products, assess seller trust, add products from multiple sellers, and place a COD order.
- A buyer can initiate a JazzCash or EasyPaisa payment and see reliable pending, success, failure, and retry behavior using the approved provider integration or sandbox.
- A duplicate checkout submission creates no duplicate order or duplicate charge.
- An approved seller can list a product, receive an order, confirm it, add tracking, and mark it delivered.
- A buyer can see the full order/payment timeline and request an eligible return.
- A seller cannot access another seller's product/order/customer data.
- An administrator can approve/reject sellers, moderate listings, inspect payment/order exceptions, and audit overrides.
- Inventory remains correct under concurrent checkout attempts and failed payment flows.
- Passwords, payment secrets, and identity documents are protected from API and log exposure.
- Core API, payment callback, order transition, permission, inventory, and return flows have automated tests.

## 11. Recommended delivery phases

### Phase 1: Foundation and production safety

Harden authorization, validation, transactions, idempotency, error handling, audit logging, seller approval enforcement, and inventory consistency. Hide unsupported bank/card methods from checkout.

### Phase 2: Core marketplace completion

Complete product moderation, seller verification queue, admin controls, delivery fees/zones, order status history, notifications, and buyer/seller operational dashboards.

### Phase 3: Payment integration

Integrate JazzCash and EasyPaisa sandbox then production flows, signed callbacks, payment records/events, retry/expiry behavior, refund workflows, reconciliation, and operational alerts. Implement COD eligibility and collection states.

### Phase 4: Trust and after-sales

Implement review eligibility, reports, return evidence, dispute resolution, refund state machine, seller/buyer risk signals, and policy/content management.

### Phase 5: Scale and optimization

Improve search, image delivery, caching, reporting, background jobs, observability, load testing, backup/restore drills, and accessibility conformance.

## 12. Open decisions before implementation

- Which JazzCash and EasyPaisa merchant products/API contracts will be used: redirect, mobile-number push, or another supported flow?
- Will payment be collected once for the whole checkout or separately for each seller-created child order?
- Which logistics providers and delivery zones will IOX support initially?
- What are COD amount, location, seller, and buyer-risk limits?
- Who pays return shipping for each return reason?
- What are the exact return windows and non-returnable categories?
- Are private sellers allowed to sell all categories, or are some categories business-seller-only?
- What seller commission, delivery fee, settlement schedule, and cancellation fee rules apply?
- Which notifications are email, SMS, WhatsApp, push, or in-app?
- What data retention period and deletion process applies to CNIC/identity documents and order records?
- What admin roles are needed beyond a single full administrator?
