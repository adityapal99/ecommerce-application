import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// auto-refresh on 401
let refreshing = false;
let queue: { resolve: () => void; reject: () => void }[] = [];

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!refreshing) {
        refreshing = true;
        try {
          await api.post("/auth/refresh");
          queue.forEach((p) => p.resolve());
        } catch {
          queue.forEach((p) => p.reject());
        } finally {
          queue = [];
          refreshing = false;
        }
      }
      await new Promise<void>((resolve, reject) =>
        queue.push({ resolve, reject })
      );
      return api(original);
    }
    return Promise.reject(error);
  }
);

// auth
export const login = (data: { email: string; password: string }) =>
  api.post("/auth/login", data);
export const signup = (data: {
  name?: string;
  email: string;
  password: string;
}) => api.post("/auth/signup", data);
export const logout = () => api.post("/auth/logout");
export const googleStart = () => {
  window.location.href = "/api/auth/google";
};

// products
export const fetchProducts = () => api.get("/products");

// cart
export const fetchCart = () => api.get("/cart");
export const addToCart = (payload: {
  productId: string;
  name: string;
  price: number;
  qty: number;
}) => api.post("/cart", payload);
export const removeFromCart = (itemId: string) => api.delete(`/cart/${itemId}`);
export const checkout = (cartItems: any[]) =>
  api.post("/cart/checkout", { cartItems });
