import { useState } from "react";
import type { Product } from "../types";
import { removeFromCart } from "../api/client";

export default function ProductCard({
  p,
  qt,
  onAdd,
  cart,
}: {
  p: Product;
  qt: number;
  onAdd: (p: Product, qty: number) => Promise<void>;
  cart: string;
}) {
  const [qty, setQty] = useState(qt);
  const [phase, setPhase] = useState<"idle"|"tick"|"qty">(qty > 0 ? "qty" : "idle");

  const add = async () => {
    if (phase !== "idle") return;
    await onAdd(p, 1);
    setPhase("tick");
    setTimeout(() => setPhase("qty"), 800);
    setQty(1);
  };

  const inc = async () => {
    await onAdd(p, 1);
    setQty(q => q + 1);
  };

  const dec = async () => {
    if (qty <= 1) {
      await removeFromCart(cart);

      setQty(0);
      setPhase("idle");
      return;
    }
    await onAdd(p, -1);
    setQty(q => q - 1);
  };

  return (
    <div className="rounded-2xl bg-white hover:shadow-md transition p-4 flex flex-col">
      <div className="aspect-video bg-[#f5f5f7] rounded-lg mb-4 flex items-center justify-center">
        {p.image ? (
          <img src={p.image} className="h-full w-full object-cover rounded-lg" />
        ) : (
          <span className="text-gray-400 text-sm">No Image</span>
        )}
      </div>

      <h3 className="text-sm font-medium text-gray-900">{p.name}</h3>
      <p className="text-gray-600 mt-1 text-sm">₹{p.price}</p>

      <div className="mt-4">
        {phase === "idle" && (
          <button
            onClick={add}
            className="w-full text-sm bg-black text-white rounded-lg py-2 transition"
          >
            Add to Cart
          </button>
        )}

        {phase === "tick" && (
          <div className="w-full text-sm bg-green-600 text-white rounded-lg py-2 flex items-center justify-center animate-pulse">
            ✓ Added
          </div>
        )}

        {phase === "qty" && (
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={dec}
              className="flex-1 py-2 rounded-lg border text-gray-700"
            >
              −
            </button>
            <div className="w-10 text-center">{qty}</div>
            <button
              onClick={inc}
              className="flex-1 py-2 rounded-lg border text-gray-700"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
