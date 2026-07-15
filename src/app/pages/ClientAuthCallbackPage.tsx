import { useEffect, useState } from "react";
import { clientPortalSupabase } from "../lib/clientPortalSupabase";

export default function ClientAuthCallbackPage() {
  const [message, setMessage] = useState("Finalizando sua autenticação...");

  useEffect(() => {
    let active = true;
    void clientPortalSupabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error || !data.session) {
        console.error("[Portal do Cliente] Falha no callback de autenticação", error);
        setMessage("O link é inválido ou expirou. Solicite um novo link.");
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.replace(next === "recovery" ? "/cliente/login?recovery=1" : "/cliente/login?confirmed=1");
    });
    return () => { active = false; };
  }, []);

  return <main className="flex min-h-screen items-center justify-center bg-[#F5F7FA] px-5 text-center text-[#052656]">{message}</main>;
}
