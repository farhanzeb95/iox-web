# IOX Portal – Existing Features

This document describes the current functionality of the IOX marketplace (frontend and backend).

---

## 1. Roles and auth

- **Login** – Email + password; JWT stored in `localStorage` as `authToken`.
- **Signup** – First name, last name, email, password, user type, contact, address. Creates user via POST /users.
- **Roles** – `ADMIN`, `BUYER`, `PRIVATE_SELLER`, `BUSINESS_SELLER`. Role is stored in JWT and used for routing and API access.
- **Routing** – Dashboard route shows a different component per role (Admin, Business Seller, Private Seller, Buyer). Auth-required paths: `/dashboard`, `/profile`, `/watchlist`, `/cart`, `/checkout`, `/order-confirmation`.
- **Implementation** – `Login.vue`, `Signup.vue`, `Dashboard.vue` (switches component by `decodeToken(token)?.type`), `router/index.ts` (beforeEach guard).

---

## 2. User and profile

- **Profile page** (`/profile`) – View and edit first name, last name, contact, address (city, state, zip, country). Email and role are read-only.
- **API** – GET `/users/me` (current user, no password), PATCH `/users/:id` (owner only; updates name, contact, address).
- **Header** – Profile avatar (circle): photo if `avatarUrl` set, otherwise initials from current user, or user icon when logged out. Click opens dropdown with My Profile, Watchlist (buyers), theme toggle, Login/Logout.

---

## 3. Products

- **List** (`/products-view`) – Paginated product list with filters: search (text), category (text), condition (new/used/refurbished), min/max price, sort (e.g. created_at desc). Product cards show image, title, price, stock, Add to Cart, Watchlist (buyers).
- **Detail** (`/product-details/:id`) – Full product info, images, price, quantity selector, Add to Cart, Buy Now (add to cart and go to checkout). Reviews section: list and form (buyers only).
- **Sellers** – “My products” via sidebar or dashboard: Add/Edit product in `ProductAddEditSidebar.vue` (title, description, price, quantity, category, SKU, condition, tags, images). Image upload uses POST `/products/upload` (Supabase Storage products bucket). API: GET `/products/my-products`.
- **Backend** – GET `/products` (filters), GET `/products/:id`, GET `/products/seller/:sellerId`, GET `/products/my-products` (auth), POST/PUT/DELETE products and POST `/products/upload`.

---

## 4. Reviews

- **Buyers** – Can submit a rating (1–5) and comment on a product (POST `/products/:id/reviews`). Product page shows aggregate rating and review count plus list of reviews.
- **Backend** – `reviews` table; product `rating` and `review_count` updated when a review is created. GET `/products/:id/reviews`, POST (auth, buyer only).

---

## 5. Watchlist

- **Buyers** – Add/remove products to watchlist (heart icon on cards and product detail). Watchlist page lists saved products; header dropdown links to Watchlist and shows count.
- **Backend** – `watchlist` table (user_id, product_id). API: GET/POST/DELETE watchlist endpoints.

---

## 6. Cart

- **Actions** – Add to cart (product list and detail), update quantity, remove item, clear cart. Cart page shows items with quantity selector and remove.
- **Header** – Cart icon with live item count (event-driven: `emitCartUpdated()` after add/update/remove/checkout).
- **Checkout** – Shipping address (city, state, zip, country), payment method (COD, Bank Transfer, JazzCash, EasyPaisa, Credit/Debit Card). Place order creates one order per seller from cart; cart is cleared on success. Redirect to order confirmation with order IDs.
- **Backend** – `carts`, `cart_items` tables. POST/PATCH/DELETE cart, GET cart (with product details).

---

## 7. Orders

- **Place order** – From checkout; cart is grouped by seller; one order per seller; stock decremented; cart cleared.
- **Order confirmation** – Page shows after place order with order IDs (query param `orders=id1,id2`).
- **My orders** – GET `/orders`: buyer sees orders they placed, seller sees orders for their products. Order detail at `/orders/:id` (GET `/orders/:id`) shows items, shipping, payment; buyer can cancel when PENDING and request return when DELIVERED; seller can update status (Confirm, Shipped, Delivered).
- **Status workflow** – PENDING → CONFIRMED → SHIPPED → DELIVERED; CANCELLED. PATCH `/orders/:id/status`.
- **Backend** – `orders`, `order_lines` tables. POST `/orders`, GET `/orders`, GET `/orders/:id`, PATCH `/orders/:id/status`, POST `/orders/:id/return`.

---

## 8. Dashboards

- **Admin** – Stats: total users, total sellers, “Orders today” (placeholder). Users table with real data from GET `/users` (id, name, email, role).
- **Seller (Business / Private)** – Stats from API: today’s sales, new orders (last 7 days), pending orders, listed items count. Tables: listed products (click to edit in sidebar), orders (seller’s orders).
- **Buyer** – Stats: Active Orders, Delivered, Wishlist count (all from API). Recent orders table from GET `/orders`; rows link to order detail. “Browse Products”, “My returns” buttons.

---

## 9. Backend (iox-service)

- **Stack** – Go, Gin, Supabase PostgreSQL (pgx), JWT auth, role middleware. CORS enabled.
- **Routes** – Users (POST, GET list, GET /me, PATCH /:id, GET /:id, POST /login), Products (GET list, GET by id, GET by seller, GET my-products, POST, PUT, DELETE, POST upload), Reviews (GET by product, POST), Watchlist, Cart (POST, PATCH, DELETE, GET), Orders (POST, GET).
- **Storage** – Supabase S3 (products bucket); optional users bucket. Image upload returns public URLs.
- **Schema** – See `iox-service/migrations/001_schema.sql`: users, products, reviews, watchlist, carts, cart_items, orders, order_lines.

---

## 10. Header and footer

- **Header** – Logo (IOX), cart icon with count (buyers), profile avatar dropdown (My Profile, Watchlist, theme, Login/Logout). Fixed top; hides on scroll down, shows on scroll up.
- **Footer** – Columns: Help (Help Center, How to buy), Shipping & delivery, Payment methods, Returns & refunds, Sell on IOX. Bottom: Powered by IOX, copyright. Fixed bottom.

---

## How to run

- **Backend** – From `iox-service`: copy `.env.example` to `.env`, set `SUPABASE_DATABASE_URL` (and optional storage keys). Run `go run .`. Default port 9001.
- **Frontend** – From `iox-web`: `npm install`, `npm run dev`. Set `VITE_API_BASE_URL` if backend is not at `http://localhost:9001/api/v1`.
- **Database** – Run `migrations/001_schema.sql` and `migrations/002_order_returns.sql` in Supabase SQL editor (or your Postgres) once.

---

## Improvements (Phases 1–6)

- **Phase 1** – Buyer dashboard uses real data (active/delivered counts from GET /orders). Order detail page at `/orders/:id` (GET /orders/:id) with items, shipping, payment. Recent orders rows link to order detail.
- **Phase 2** – Homepage at `/` with hero, “Shop by category” (predefined categories), featured products (rating sort). Products page category filter is a dropdown using the same category list. Query `?category=...` supported.
- **Phase 3** – Order status workflow: PENDING → CONFIRMED → SHIPPED → DELIVERED, and CANCELLED. PATCH /orders/:id/status. Seller: Mark Ready to Ship (CONFIRMED), Mark Shipped (SHIPPED), Mark Delivered (DELIVERED). Buyer: Cancel order when PENDING. Seller dashboards show Recent Orders with links to order detail.
- **Phase 4** – Footer expanded with columns: Help (Help Center, How to buy), Shipping & delivery, Payment methods, Returns & refunds, Sell on IOX. Static pages: /help, /shipping, /returns, /payment-methods, /seller-info.
- **Phase 5** – Seller store page at `/seller/:sellerId` listing that seller’s products. Product detail page: seller name links to seller store.
- **Phase 6** – Returns: `order_returns` table. POST /orders/:id/return (buyer, delivered orders), GET /returns (buyer: their returns; seller: returns for their orders), PATCH /returns/:id/status (seller: APPROVED/REJECTED). “Request return” on order detail when DELIVERED; “My returns” / “Return requests” page at /returns; seller can approve/reject.
