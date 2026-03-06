# API Proxy Setup

This proxy allows the frontend (HTTPS on Vercel) to communicate with an HTTP backend VPS without mixed content security issues.

## How It Works

1. Frontend makes requests to `/api/proxy/*` (same-origin HTTPS)
2. Next.js server-side proxy forwards requests to HTTP VPS backend
3. Response is sent back to the frontend

This bypasses browser mixed content restrictions since the frontend only makes HTTPS requests to itself.

## Setup Instructions

### 1. Configure Environment Variables

#### Vercel Environment Variables:
```bash
# Use the proxy endpoint (same origin)
NEXT_PUBLIC_API_URL=/api/proxy

# Backend VPS URL (server-side only)
BACKEND_URL=http://62.171.183.44:8000
```

#### Local Development (.env.local):
```bash
# For local dev, you can use the backend directly
NEXT_PUBLIC_API_URL=http://localhost:8000

# Or use the proxy for testing
# NEXT_PUBLIC_API_URL=/api/proxy
# BACKEND_URL=http://localhost:8000
```

### 2. Deploy to Vercel

1. Set environment variables in Vercel dashboard:
   - Go to your project → Settings → Environment Variables
   - Add `NEXT_PUBLIC_API_URL` = `/api/proxy`
   - Add `BACKEND_URL` = `http://62.171.183.44:8000`

2. Redeploy the application

### 3. Verify

The proxy will forward requests like this:
- Frontend request: `https://yourapp.vercel.app/api/proxy/api/auth/telegram`
- Proxied to: `http://62.171.183.44:8000/api/auth/telegram`
- Response returned to frontend over HTTPS

## How to Use

No code changes needed! Just set `NEXT_PUBLIC_API_URL=/api/proxy` and the existing API client will automatically use the proxy.

```typescript
// This will now use the proxy
const response = await authApi.telegram({ init_data: initData });
// Actual request: https://yourapp.vercel.app/api/proxy/api/auth/telegram
// Proxied to: http://62.171.183.44:8000/api/auth/telegram
```

## Advantages

✅ **Security**: No mixed content warnings (frontend always uses HTTPS)
✅ **Simple**: No code changes needed, just env vars
✅ **Flexible**: Can switch between direct and proxied easily
✅ **Compatible**: Works with existing authentication and API client

## Troubleshooting

### Check proxy is working:
```bash
curl https://yourapp.vercel.app/api/proxy/health
```

### Check Vercel logs:
Look for `[Proxy]` prefix in server-side logs

### Backend not responding:
Ensure `BACKEND_URL` is correctly set and backend is running
