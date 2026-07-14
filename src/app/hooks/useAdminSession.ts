import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useAdminSession() {
  const [checkingSession, setCheckingSession] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = "/admin/login";
        return;
      }
      supabase.from("perfis_usuarios").select("perfil").eq("usuario_id", data.session.user.id).maybeSingle().then(({ data: profile }) => {
        if (!profile || !["administrador", "recrutador"].includes(profile.perfil)) { window.location.href = "/cliente"; return; }
        setCheckingSession(false);
      });
    });
  }, []);
  return checkingSession;
}
