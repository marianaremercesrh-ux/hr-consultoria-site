import { supabase } from "../lib/supabase";

type FunctionError = { error?: string; message?: string };

async function invoke<T>(name: string, body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  const result = data as T & FunctionError;
  if (result?.error) throw new Error(result.error);
  if (error) throw new Error("NETWORK_ERROR");
  return result;
}

export function requestAdminLoginCode(email: string) {
  return invoke<{ challenge_id: string }>("request-admin-login-code", { email });
}

export function verifyAdminLoginCode(email: string, challengeId: string, code: string) {
  return invoke<{ verification_token: string }>("verify-admin-login-code", {
    email,
    challenge_id: challengeId,
    code,
  });
}

export function createAdminPassword(email: string, verificationToken: string, password: string) {
  return invoke<{ ok: true }>("create-admin-password", {
    email,
    verification_token: verificationToken,
    password,
  });
}
