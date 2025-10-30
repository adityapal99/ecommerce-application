import { useEffect, useState } from "react";
import { checkout, fetchCart, removeFromCart, addToCart } from "../api/client";
import type { Cart } from "../types";
import CartItemRow from "../components/CartItemRow";
import ReceiptModal from "../components/ReceiptModal";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const { isAuthed } = useAuth();
  const nav = useNavigate();

  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [receipt, setReceipt] = useState<{
    total: number;
    timestamp: number;
  } | null>(null);

  const load = () =>
    fetchCart()
      .then((r) => setCart(r.data))
      .catch(() => setCart({ items: [], total: 0 }));

  useEffect(() => {
    if (!isAuthed) {
      nav("/login");
      return;
    }
    load();
  }, [isAuthed]);

  const onRemove = async (id: string) => {
    await removeFromCart(id);
    await load();
  };

  const onInc = async (productId: string) => {
    const it = cart.items.find((i) => i.productId === productId);
    if (!it) return;
    await addToCart({
      productId,
      name: it.name,
      price: it.price,
      qty: 1,
    });
    await load();
  };

  const onDec = async (productId: string) => {
    const it = cart.items.find((i) => i.productId === productId);
    if (!it) return;

    // if last item → remove line
    if (it.qty <= 1) {
      await removeFromCart(it._id);
      await load();
      return;
    }

    // else send qty = -1
    await addToCart({
      productId,
      name: it.name,
      price: it.price,
      qty: -1,
    });
    await load();
  };

  const doCheckout = async () => {
    const r = await checkout(cart.items);
    setReceipt(r.data);
    await load();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900">Your Cart</h1>

      <div className="bg-white rounded-2xl border p-6 shadow-sm">
        {cart.items.length === 0 && (
          <div className="text-gray-500 text-sm">Your cart is empty.</div>
        )}

        {cart.items.map((it) => (
          <CartItemRow
            key={it._id}
            it={it}
            onRemove={onRemove}
            onInc={onInc}
            onDec={onDec}
          />
        ))}

        <div className="flex items-center justify-between pt-6 mt-4">
          <div className="text-lg font-semibold text-gray-900">
            Total: ₹{cart.total}
          </div>

          <button
            className="text-sm bg-black text-white rounded-lg px-5 py-2 hover:opacity-90 disabled:opacity-40"
            disabled={cart.items.length === 0}
            onClick={doCheckout}
          >
            Checkout
          </button>
        </div>
      </div>

      <ReceiptModal
        open={!!receipt}
        onClose={() => setReceipt(null)}
        total={receipt?.total || 0}
        time={receipt?.timestamp || 0}
      />
    </div>
  );
}
