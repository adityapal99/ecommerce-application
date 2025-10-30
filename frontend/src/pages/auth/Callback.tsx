import { useEffect } from "react";
import { useAuth } from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Callback() {
  const { setAuthed } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    // cookies set by backend after Google callback
    setAuthed(true);
    nav("/");
  }, []);

  return <div className="p-4">Completing sign-in…</div>;
}
