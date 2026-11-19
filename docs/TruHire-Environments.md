# TruHire — Dev vs Production: Complete Service Reference

---

## 🖥️ Phase 1 — Development (Local)

| Service | What Runs | Host | Status |
|---|---|---|---|
| **Backend API** | `uvicorn backend.main:app --reload` | `localhost:8999` | ✅ Local |
| **Frontend** | `npm run dev` (Vite) | `localhost:5173` | ✅ Local |
| **PostgreSQL** | Native / WSL Postgres | `localhost:5433` | ✅ Local |
| **Redis** | WSL Redis | `localhost:6379` | ✅ Local |
| **OpenSearch** | WSL / native OpenSearch | `localhost:9201` | ✅ Local |
| **Qdrant** | Qdrant Cloud (always cloud) | `...qdrant.io:6333` | ☁️ Cloud |
| **Embeddings** | fastembed in-process | Inside backend | ✅ Local |
| **LLM (vLLM)** | DGX over Tailscale | `100.122.195.84:65432` | 🖥️ DGX |
| **Object Storage** | Local filesystem | `./uploads/` | ✅ Local |

**Start dev:**
```bash
# Terminal 1
uvicorn backend.main:app --host 127.0.0.1 --port 8999 --reload

# Terminal 2
cd frontend && npm run dev
```

---

## ☁️ Phase 2 — Production (Cloud)

| Service | Provider | Endpoint | Status |
|---|---|---|---|
| **Backend API** | Render *(TODO)* | `https://your-app.onrender.com` | ⚠️ Not deployed |
| **Frontend** | Vercel | `tru-hire-demand-tool.vercel.app` | ✅ Live |
| **PostgreSQL** | Neon | `ep-shy-brook-bd1aabkf-pooler...neon.tech` | ✅ Live |
| **Redis** | *(Not set)* | — | ❌ Missing |
| **OpenSearch** | Aiven | `truhire-opensearch...aivencloud.com:22881` | ✅ Live |
| **Qdrant** | Qdrant Cloud | `21444d8c-466f...qdrant.io:6333` | ✅ Live |
| **Embeddings** | fastembed in-process | Inside backend | ✅ Local (no cost) |
| **LLM (primary)** | DGX via Tailscale | `100.122.195.84:65432` | 🖥️ DGX |
| **LLM (fallback 1)** | OpenRouter | API | ✅ Live |
| **LLM (fallback 2)** | Groq | API | ✅ Live |
| **LLM (fallback 3)** | Gemini | API | ✅ Live |
| **Object Storage** | Neon Object Storage | `br-raspy-block...neon.tech` | ✅ Live |

---

## 💸 Free Tier Details — Production Services

| Service | Free Plan | Storage / Compute | Goes Offline When | Cold Start | Workaround |
|---|---|---|---|---|---|
| **Vercel** (Frontend) | Hobby — Free forever | 100 GB bandwidth/mo | Never goes offline (static CDN) | ~200ms (edge) | None needed ✅ |
| **Neon** (Postgres) | Free — 1 project | 1 GB storage, 100 CU-hrs/mo | Auto-suspends after **5 min** of no queries | ~300–500ms on first query | App wakes it on first connection — acceptable |
| **Neon Object Storage** | Included with Neon free | 1 GB (shared with DB) | Same as Neon compute | None (storage stays) | None needed |
| **Qdrant Cloud** (Vectors) | Free forever tier | 1 GB RAM, 4 GB disk, ~1M vectors | **Never goes offline** ✅ | None | None needed ✅ |
| **Aiven** (OpenSearch) | Free sandbox (trial \$50 credits, 30 days) | 4 GB RAM, 20 GB disk | Auto **powers off after 24h** of no queries | Manual restart in Aiven console | Ping it daily OR upgrade to Developer (\$40/mo) |
| **Render** (Backend) | Free web service | 512 MB RAM, shared CPU | Sleeps after **15 min** of no HTTP traffic | **30–60 seconds** ⚠️ | Use UptimeRobot to ping `/api/health` every 10 min |
| **OpenRouter** (LLM fallback) | Free (`:free` models) | 50 req/day (free) → 1,000/day if topped up \$10 | Never offline (API) | None | Fallback only — rarely hit |
| **Groq** (LLM fallback) | Free tier | 30 RPM, ~8K TPM, ~1K RPD | Never offline (API) | None | Fallback only — rarely hit |
| **Gemini** (LLM fallback) | Free tier | 15 RPM, 1M TPD (flash-lite) | Never offline (API) | None | Last resort — rarely hit |

---

## ⚠️ The Two Problems to Fix Now

### 1. 🔴 Render backend sleeps (30–60s cold start)
Every first request after 15 min idle hits users with a 30–60 second freeze.

**Fix — Free option:** Set up [UptimeRobot](https://uptimerobot.com) (free, no card) to ping `https://your-backend.onrender.com/api/health` every **10 minutes**. Keeps it warm 24/7, costs nothing.

**Fix — Paid option:** Render Starter plan \$7/month — always on, no sleep.

### 2. 🟡 Aiven OpenSearch powers off after 24h idle
If no queries hit it for 24 hours the node shuts down. Next search request fails until you manually restart in the Aiven console.

**Fix — Free option:** Same UptimeRobot trick — ping a lightweight OpenSearch endpoint every 12 hours. Or schedule a daily dummy query from your backend.

**Fix — Paid option:** Aiven Developer plan ~\$40/month — always on.

### 3. ❌ Redis not configured for production
Without Redis: rate limiting is per-process only, cache resets on every backend restart, background job queue (`arq`) won't work.

**Fix — Free option:** [Upstash Redis](https://upstash.com) — free tier, 10K commands/day, never sleeps, no credit card needed. Add `REDIS_URL=rediss://...` to `.env.production`.

---

## 📋 Quick "Is It Free Forever?" Summary

| Service | Free Forever? | Catch |
|---|---|---|
| Vercel (frontend) | ✅ Yes | Personal/non-commercial only |
| Neon Postgres | ✅ Yes | 1 GB limit, auto-suspends 5 min |
| Neon Object Storage | ✅ Yes | Shared 1 GB with DB |
| Qdrant Cloud | ✅ Yes | 1 GB RAM, no SLA |
| Aiven OpenSearch | ❌ No | \$50 trial credit, 30 days — then pay or delete |
| Render (backend) | ✅ Yes | Sleeps after 15 min, 750 hrs/month |
| Groq | ✅ Yes | Rate limited (30 RPM, 1K RPD) |
| OpenRouter | ✅ Yes | 50 req/day free, 1K/day after \$10 top-up |
| Gemini API | ✅ Yes | Rate limited (15 RPM) |

> [!CAUTION]
> **Aiven's free OpenSearch is only 30 days on the trial credits.** After that you need to either pay (~\$40/mo) or find an alternative. Best free alternative: **Bonsai** (25 MB free, always-on Elasticsearch/OpenSearch — small but won't sleep).
