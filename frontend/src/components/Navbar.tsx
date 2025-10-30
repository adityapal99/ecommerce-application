import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useState } from "react";

export default function Navbar() {
  const { isAuthed, doLogout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="backdrop-blur bg-white/80 border-b">
      <div className="mx-auto max-w-7xl px-4 h-12 flex items-center justify-between">
        <Link to="/" className="text-sm font-medium">
          Commerce
        </Link>

        <nav className="hidden md:flex gap-6 text-sm">
          <Item to="/">Store</Item>
          <Item to="/cart">Cart</Item>
        </nav>

        <div className="hidden md:flex items-center gap-4 text-sm">
          {isAuthed ? (
            <button
              onClick={async () => {
                await doLogout();
                nav("/login");
              }}
              className="text-gray-700 hover:text-black"
            >
              Logout
            </button>
          ) : (
            <>
              <Item to="/login">Login</Item>
              <Item to="/signup">Signup</Item>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-1 text-gray-700"
        >
          <span className="text-lg">≡</span>
        </button>
      </div>

      {/* mobile */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="flex flex-col px-4 py-2 text-sm">
            <Item to="/" onClick={() => setOpen(false)}>
              Store
            </Item>
            <Item to="/cart" onClick={() => setOpen(false)}>
              Cart
            </Item>

            {isAuthed ? (
              <button
                className="text-left text-gray-700 py-2"
                onClick={async () => {
                  await doLogout();
                  setOpen(false);
                  nav("/login");
                }}
              >
                Logout
              </button>
            ) : (
              <>
                <Item to="/login" onClick={() => setOpen(false)}>
                  Login
                </Item>
                <Item to="/signup" onClick={() => setOpen(false)}>
                  Signup
                </Item>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function Item({
  to,
  children,
  onClick,
}: {
  to: string;
  children: any;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        isActive
          ? "py-2 text-black"
          : "py-2 text-gray-500 hover:text-black"
      }
    >
      {children}
    </NavLink>
  );
}
