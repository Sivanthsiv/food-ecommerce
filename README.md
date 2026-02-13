# EasyKitchen E-Commerce

## Run locally

1. Install packages:
```bash
npm install
```
2. Configure environment variables in `.env`:
```env
# Option A (recommended): build the connection string from separate credentials
# - `MONGO_URI` is the cluster/host template (no credentials embedded)
# - `MONGO_DB_USER` and `MONGO_DB_PASSWORD` are used by the app to construct
#   the full connection string. If your password contains special characters
#   the app will URL-encode it when building the final URI.
MONGO_URI="mongodb+srv://<your-cluster>.mongodb.net/easykitchen?retryWrites=true&w=majority"
MONGO_DB_USER="easykitchen_user"
MONGO_DB_PASSWORD="your-real-password"

# Option B (manual): provide a full, ready-to-use URI and omit MONGO_DB_USER/PASSWORD
# MONGO_URI="mongodb+srv://<user>:<password>@<your-cluster>.mongodb.net/easykitchen?retryWrites=true&w=majority"

JWT_SECRET="your-strong-secret"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-admin-password"
```
3. Start:
```bash
npm run dev
```

## Database connection check

Open:

- `/api/health`

Expected success:
```json
{ "ok": true, "app": "healthy", "database": "connected" }
```

If it fails, check:

1. Atlas username/password are correct.
2. If you use Option A above the app will URL-encode `MONGO_DB_PASSWORD` for you when it
	builds the full connection string. If you use Option B you must URL-encode any
	special characters in the password yourself.
3. Atlas Network Access: do NOT leave `0.0.0.0/0` open in production. `0.0.0.0/0` allows
	connections from any IP and is insecure — only use it temporarily for initial testing.
	Safer alternatives: whitelist specific client IPs, use CIDR-restricted ranges, VPN/private
	network or VPC peering. Remove any `0.0.0.0/0` rule before deploying to production.
4. Atlas Database User has read/write access.

## Deploy (Vercel/Render)

Set these environment variables in deployment settings:

- `MONGO_URI`
- `MONGO_DB_USER`
- `MONGO_DB_PASSWORD`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `CORS_ORIGIN` (required if frontend/backend are on different domains)

After deploy:

1. Visit `/api/health` on live URL.
2. Test admin login.
3. Test product list and order list APIs from admin dashboard.
