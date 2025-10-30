import { useState } from "react";
import { signup } from "../../api/client";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthed } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup({ name, email, password });
    // optional auto-login flow could call login; for now, redirect to login
    nav("/login");
  };

  return (
    <div className="mx-auto max-w-sm p-4">
      <h1 className="text-xl font-semibold mb-4">Signup</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="w-full border rounded px-3 py-2" placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full border rounded px-3 py-2" type="submit">Create account</button>
      </form>
    </div>
  );
}
