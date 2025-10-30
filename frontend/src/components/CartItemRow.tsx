import type { CartItem } from "../types";

export default function CartItemRow({
  it,
  onRemove,
  onInc,
  onDec,
}: {
  it: CartItem;
  onRemove: (id: string) => void;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-4 border-b">
      {/* left: name + price */}
      <div className="flex flex-col">
        <div className="font-medium text-gray-900">{it.name}</div>
        <div className="text-sm text-gray-600">₹{it.price}</div>
      </div>

      {/* qty controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onDec(it.productId)}
          className="h-8 w-8 rounded-md border flex items-center justify-center text-gray-800 hover:bg-gray-100"
        >
          −
        </button>

        <span className="text-sm w-6 text-center">{it.qty}</span>

        <button
          onClick={() => onInc(it.productId)}
          className="h-8 w-8 rounded-md border flex items-center justify-center text-gray-800 hover:bg-gray-100"
        >
          +
        </button>
      </div>

      {/* remove */}
      <button
        className="text-sm text-gray-400 hover:text-gray-900 text-right"
        onClick={() => onRemove(it._id)}
      >
        Remove
      </button>
    </div>
  );
}
