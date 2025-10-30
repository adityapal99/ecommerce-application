# Commerce-Cart Backend

Monorepo backend built with Node + TypeScript + MongoDB.  
Microservice style with:
- **NGINX** (entry)
- **Gateway**
- **Auth Service**
- **Product Service**
- **Cart Service**
- **MongoDB**

JWT (RS256) + Google OAuth + Cookie-based auth.

---

## Topology

```
client → nginx:8080 → gateway → {auth, product, cart} → mongo

Services communicate over internal network `appnet`.
```
---

## Services

### 1) NGINX
Reverse proxy → Gateway.

- Port exposed (local): `8080 → 80 container`
- No business logic.

---

### 2) Gateway (API Router)

- Receives all requests from NGINX
- Verifies JWT access tokens
- Forwards user identity to services via `x-forwarded-user-id`
- Proxies:
  - `/api/auth` → auth
  - `/api/products` → product
  - `/api/cart` → cart
- Blocks unauthorized routes

Endpoints:
```
GET /health
```
---

### 3) Auth Service

Handles authentication + identity.

Features:
- Email/password
- Google OAuth2
- JWT Access + Refresh (RS256)
- Token rotation
- HttpOnly cookie storage

Env example:
```
PORT=3001
MONGODB_URI=mongodb://root:rootpass@mongo:27017/auth?authSource=admin
JWT_PRIVATE_KEY_BASE64=
JWT_PUBLIC_KEY_BASE64=
ACCESS_TOKEN_TTL=900
REFRESH_TOKEN_TTL=2592000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
```

Endpoints:
```
POST /signup
POST /login
GET /google
GET /google/callback
POST /refresh
POST /logout
POST /logout-all
GET /health
```

---

### 4) Product Service

Provides product inventory.

Env:
```
PORT=3002
MONGODB_URI=mongodb://root:rootpass@mongo:27017/product?authSource=admin
```

Endpoints:
```
POST /seed → create mock products
GET / → list products
GET /health
```

---

### 5) Cart Service

Per-user cart.

Env:
```
PORT=3003
MONGODB_URI=mongodb://root:rootpass@mongo:27017/cart?authSource=admin
```

User identity passed via:
```
x-forwarded-user-id
```

Endpoints:
```
GET / → get cart
POST / → add/update
DELETE /:itemId → remove
POST /checkout → mock checkout
GET /health
```

---

## Data Models

### User
```
email: string unique
name: string
passwordHash: string|null
provider: local|google
googleId: string|null
tokenVersion: number
```

### Product
```
name: string
price: number
sku: string
image?: string
```


### Cart
```
userId: string
items: [
    {
        productId: string
        name: string
        price: number
        qty: number
    }
]
```

---

## JWT

Algorithm: **RS256**  
- Access token short TTL
- Refresh token long TTL
- Token rotation
- `tokenVersion` invalidates old tokens (logout-all)

Env keys are **base64 PEM**:
```
JWT_PRIVATE_KEY_BASE64
JWT_PUBLIC_KEY_BASE64
```

Generate:
```
openssl genpkey -algorithm RSA -out jwt_private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -in jwt_private.pem -pubout -out jwt_public.pem
base64 -w0 jwt_private.pem > jwt_private.b64
base64 -w0 jwt_public.pem > jwt_public.b64
```
---

## Running (Docker)

Build & start
```
docker compose build
docker compose up -d
```

Seed products
```
curl -X POST http://localhost:8080/api/products/seed
```

Health checks
```
GET http://localhost:8080/health
GET http://localhost:8080/api/auth/health
GET http://localhost:8080/api/products/health
GET http://localhost:8080/api/cart/health
```


---

## Auth Flow

1) user → `/signup` or `/login`
2) auth sets HttpOnly cookies → `access_token` + `refresh_token`
3) client sends requests via gateway
4) gateway validates access token
5) gateway forwards cart requests + `x-forwarded-user-id`

If access token expired:
- client calls `/api/auth/refresh`
- new tokens returned
- old rotated

---

## Google OAuth Flow

1) Client opens `/api/auth/google`
2) Google → callback `/api/auth/google/callback`
3) Auth service:
   - create/find user
   - issues JWT
   - sets cookies
4) redirect to frontend

---

## Security

- RS256 asymmetric signatures
- HttpOnly cookies
- Helmet on all services
- Global rate limits
- Token rotation
- Never expose private key
- Nginx public entrypoint only

---

## Folder Layout

```
/nginx
/gateway
/services
    /auth
    /product
    /cart
mongo (container)
```

---

## Notes

- Gateway enforces JWT auth
- Services trust gateway only
- Product service stateless
- Cart service stores per-user cart
- Auth service manages identity + token

---

## Future Improvements

- Multi-tenant DB
- Queues for events
- Webhooks
- OpenAPI schemas
- Observability (Prometheus/Grafana)
- Unit + Integration tests