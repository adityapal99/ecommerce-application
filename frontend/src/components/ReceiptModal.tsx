export default function ReceiptModal({
    open, onClose, total, time,
  }: { open: boolean; onClose: () => void; total: number; time: number }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-sm">
          <h2 className="text-lg font-semibold mb-2">Receipt</h2>
          <p className="text-sm text-gray-700">Total: ₹{total}</p>
          <p className="text-sm text-gray-700">Time: {new Date(time).toLocaleString()}</p>
          <button className="mt-4 border rounded px-3 py-2" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }
  