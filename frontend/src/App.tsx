import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Products from "./pages/Products";
import CartPage from "./pages/Cart";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Callback from "./pages/auth/Callback";

export default function App() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-gray-900">
      <Navbar />

      {/* page container */}
      <main className="mx-auto max-w-7xl w-full px-4 py-8">
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<Callback />} />
        </Routes>
      </main>
    </div>
  );
}
