import { useEffect, useState } from "react";
import { fetchProducts, addToCart, fetchCart } from "../api/client";
import type { Product } from "../types";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Products() {
  const [items, setItems] = useState<Product[]>([]);
  const [cartMap, setCartMap] = useState<Record<string, any>>({});
  const { isAuthed } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    fetchProducts().then((r) => setItems(r.data));
    if (isAuthed) {
      fetchCart().then(r => {
        const map: Record<string, any> = {};
        r.data.items.forEach((i: any) => {
          map[i.productId] = {
            qty: i.qty,
            cartId: i._id,
          };
        });
        setCartMap(map);
      });
    }
  }, []);

  const onAdd = async (p: Product, qty: number) => {
    if (!isAuthed) {
      nav("/login");
      return;
    }
    try {
      await addToCart({ productId: p._id, name: p.name, price: p.price, qty: qty });
    } catch {}
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900">Store</h1>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard 
            key={p._id} 
            p={p} 
            qt={cartMap[p._id]?.qty ?? 0}
            cart={cartMap[p._id]?.cartId ?? undefined}
            onAdd={onAdd} 
          />
        ))}
      </div>
    </div>
  );
}
