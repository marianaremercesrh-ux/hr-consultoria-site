import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminAuthCallbackPage() {
  const [message, setMessage] = useState("Finalizando sua autenticação...");

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error || !data.session) {
        setMessage("O link de recuperação é inválido ou expirou. Solicite um novo link.");
        return;
      }
      window.location.replace("/admin/login?recovery=1");
    });
    return () => { active = false; };
  }, []);

  return <main className="flex min-h-screen items-center justify-center bg-[#052656] px-5 text-center text-white">{message}</main>;
}
