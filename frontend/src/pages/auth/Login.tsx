import { useState } from "react";
import { googleStart, login } from "../../api/client";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthed } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
    setAuthed(true);
    nav("/");
  };

  return (
    <div className="mx-auto max-w-sm p-4">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="w-full border rounded px-3 py-2" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full border rounded px-3 py-2" type="submit">Login</button>
      </form>
      <div className="mt-4">
        <button className="w-full border rounded px-3 py-2" onClick={googleStart}>Continue with Google</button>
      </div>
    </div>
  );
}
