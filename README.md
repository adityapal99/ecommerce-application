# 🛒 Commerce Cart

A full-stack mock e-commerce shopping cart application.

Features:
- React + Vite + Tailwind UI
- Node + Express micro-services
- MongoDB persistence
- JWT authentication (RS256)
- Google OAuth (optional)
- API-Gateway + NGINX
- Docker + Docker Compose

> Focus: clean flows for browsing, auth, cart, and checkout.

---

## 📁 Project Structure

```

commerce-cart
│
├── frontend/        # React + Vite + Tailwind
├── gateway/         # API gateway (JWT verify + routing)
├── nginx/           # Reverse proxy entry
└── services/
├── auth/        # Login, signup, google auth
├── products/    # Mock product catalog
└── cart/        # Cart + checkout

````

---

## ✅ Requirements

- Node 18+
- Docker + Docker Compose

---

## 🔐 Authentication Keys (RS256)

Generate RSA keypair:

```bash
openssl genpkey -algorithm RSA -out jwt_private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -in jwt_private.pem -pubout -out jwt_public.pem
````

Base64-encode public key and place in `.env`:

```
JWT_PUBLIC_KEY_BASE64=<base64_of_public_key>
```

Private key kept in `auth` service.

---

## ⚙️ Environment Setup

Each service has `.env` files.

Example minimal `gateway/.env`:

```
PORT=4000
CORS_ORIGIN=http://localhost:5173

AUTH_SERVICE_URL=http://auth:3001
PRODUCT_SERVICE_URL=http://products:3002
CART_SERVICE_URL=http://cart:3003

JWT_PUBLIC_KEY_BASE64=<YOUR-B64-PUBLIC-KEY>
```

Mongo is handled via compose.

---

## 🚀 Running

From project root:

```bash
docker compose up --build
```

Services:

* Frontend dev: `http://localhost:5173`
* NGINX entry: **[http://localhost:8080](http://localhost:8080)**

Flow:

> Browser → NGINX → Gateway → Microservices

Stop:

```bash
docker compose down
```

---

## 🌐 API Gateway

* Validates JWT from cookie
* Injects `x-forwarded-user-id`
* Proxies to services

### Routing

| Route Prefix    | Target Service |
| --------------- | -------------- |
| `/api/auth`     | auth           |
| `/api/products` | products       |
| `/api/cart`     | cart           |

---

## 🔐 Auth Service

Endpoints:

```
POST  /signup
POST  /login
GET   /google
GET   /google/callback
```

Issues:

* `access_token` (HttpOnly cookie)

Algorithm:

* **RS256**

---

## 📦 Products Service

Return mock products.

```
GET /products
```

---

## 🛒 Cart Service

Needs `x-forwarded-user-id` from gateway.

### API

```
GET    /cart
POST   /cart      {productId, name, price, qty}
DELETE /cart/:id
POST   /checkout
```

Checkout returns mock receipt.

---

## 🎨 Frontend

Stack:

* React + Vite
* Tailwind CSS

Features:

* Browse products
* Add / remove items
* Auto quantity update
* Checkout + receipt
* Redirect on unauthorized cart access
* Google auth ready

Proxy via Vite:

```
/api → http://localhost:8080
```

---

## 🔄 Data Flow

1. User logs in → JWT cookie issued
2. Browser → `/api/...`
3. NGINX → gateway
4. gateway validates JWT
5. gateway forwards → cart/products
6. cart reads `x-forwarded-user-id`

No direct access to services.

---

## 🧱 Docker Services

| Service  | Purpose                  |
| -------- | ------------------------ |
| nginx    | entry proxy              |
| gateway  | JWT validation + routing |
| auth     | sign in / signup         |
| products | product list             |
| cart     | shopping cart + checkout |
| mongo    | DB                       |

---

## 🧪 Development

Frontend only:

```bash
cd frontend
npm i
npm run dev
```

Backend only:

```bash
docker compose up gateway auth cart products
```

---

## 📄 License

Internal / unrestricted.

---

## 📌 Notes

* Gateway must run for auth + cart.
* Cookies require `domain=localhost`.
* Always route API calls through `/api/...`.
* Cart must be accessed by authenticated users.


