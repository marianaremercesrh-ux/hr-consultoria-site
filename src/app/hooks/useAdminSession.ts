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
      setCheckingSession(false);
    });
  }, []);
  return checkingSession;
}
