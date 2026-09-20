# IOX Free Deployment

This deployment uses Supabase for PostgreSQL/storage, Render for the Go API, and Vercel for the Vue frontend.

## 1. Supabase

Create a Supabase project and run these files in the SQL Editor, in order:

1. `iox-service/migrations/001_schema.sql`
2. `iox-service/migrations/002_order_returns.sql`
3. `iox-service/migrations/003_order_tracking.sql`
4. `iox-service/migrations/004_seller_status_and_documents.sql`
5. `iox-service/migrations/005_seller_store_fees.sql`

Create the `products` and `users` storage buckets. Keep the storage access key and secret private.

## 2. Render backend

Create a Render Web Service from the `iox-service` repository/directory. The included `render.yaml` uses:

- Build: `go build -o app .`
- Start: `./app`
- Health check: `/health`
- Free plan port: `10000`

Set the secret values marked `sync: false` in Render. Also set `CORS_ALLOWED_ORIGINS` to the exact Vercel frontend origin, for example `https://iox-web.vercel.app`. Multiple origins may be comma-separated.

Render will provide a URL such as:

`https://iox-service.onrender.com`

The free service may sleep after inactivity, so the first request can be slow.

## 3. Vercel frontend

Create a Vercel project from the `iox-web` repository/directory. Use:

- Build command: `npm run build`
- Output directory: `dist`

The production build reads `src/config/environment/dev.json`, which points to:

`https://iox-service.onrender.com/api/v1`

Set the Render backend variable `CORS_ALLOWED_ORIGINS` to the exact Vercel site origin, without `/api/v1`, for example `https://iox-web.vercel.app`.

The included `vercel.json` sends Vue Router history URLs back to `index.html`.

## 4. First production checks

1. Open `https://iox-service.onrender.com/health` and confirm `{ "status": "ok" }`.
2. Open the Vercel URL and register a buyer.
3. Register a seller and confirm the store-fee panel loads.
4. Confirm product images upload to the `products` bucket.
5. Confirm seller-fee submissions appear through `GET /api/v1/seller-fees` for an admin.
6. Configure the real frontend URL in backend CORS before handling production traffic.

JazzCash, EasyPaisa, Raast, and bank-transfer seller fees currently use payment-reference submission and manual admin verification. Provider API credentials and webhook URLs are still required for automated payment confirmation.