# Frontend Documentation

React + Vite + Tailwind  
Primary responsibility: product UI, authentication flows, cart UI, checkout display.

---

## Stack

- React (latest)
- Vite
- TypeScript
- Axios (API client)
- React Router
- TailwindCSS

---

## Structure

```

frontend/
│
├── src/
│   ├── api/          # axios wrappers
│   ├── components/   # UI components
│   ├── context/      # auth context
│   ├── pages/        # page routes
│   ├── types/        # shared models
│   └── App.tsx
│
├── index.html
├── vite.config.ts
└── tailwind.config.js

```

---

## Start

```

cd frontend
npm i
npm run dev

```

Runs on:  
```

[http://localhost:5173](http://localhost:5173)

```

Proxy → `/api/**` → http://localhost:8080

---

## Build

```

npm run build

```

Output → `dist/`

---

## Routing

Handled by `react-router-dom`.

```

/
│
├── /login
├── /signup
├── /cart
└── /auth/callback   # Google OAuth

```

`/cart` auto-redirects to `/login` if user not authenticated.

---

## Auth Flow

- Login/Signup → `/api/auth/...`
- JWT returned via HttpOnly cookie
- Gateway validates cookies
- UI checks context state; if missing → redirect to `/login`

Stored state:
- `isAuthed`
- minimal profile

No token stored in client storage.

---

## API Client

`src/api/client.ts`

- Base URL = `/api`
- `withCredentials: true`
- Endpoints:
  - `fetchProducts()`
  - `fetchCart()`
  - `addToCart()`
  - `removeFromCart()`
  - `checkout()`
  - `login()`
  - `signup()`

---

## Context

`src/context/AuthProvider.tsx`

- Manages auth state
- Exports:
  - `isAuthed`
  - `doLogin()`
  - `doLogout()`

---

## UI

### Navbar

- Top fixed
- Responsive
- Shows login/logout

### Products Page

- Grid of product cards
- Add-to-cart → animated state

### Cart Page

- Shows product name + price
- + / − quantity updates
- Remove deletes line
- Checkout triggers modal receipt

---

## Styling

- TailwindCSS
- Utility-first

Common classes:
- `max-w-7xl mx-auto`
- `rounded-xl`
- `text-gray-900`

---

## Data Types

`src/types/index.ts`

```

Product {
_id: string
name: string
price: number
image?: string
}

CartItem {
_id: string
productId: string
name: string
price: number
qty: number
}

Cart {
items: CartItem[]
total: number
}

```

---

## Error Handling

401:
- auto redirect to `/login`

Other:
- ignore or show minimal UI message

---

## Notes

- All data flows through API Gateway
- No direct requests to services
- Cookies must include credentials
- SSR not required

