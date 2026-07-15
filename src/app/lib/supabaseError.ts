type SupabaseErrorDetails = {
  message: string;
  details: string | null;
  hint: string | null;
  code: string | null;
};

function stringProperty(value: unknown, property: string): string | null {
  if (typeof value !== "object" || value === null || !(property in value)) return null;
  const propertyValue = (value as Record<string, unknown>)[property];
  return typeof propertyValue === "string" ? propertyValue : propertyValue == null ? null : String(propertyValue);
}

export function supabaseErrorDetails(error: unknown): SupabaseErrorDetails {
  return {
    message: stringProperty(error, "message") ?? "Erro desconhecido retornado pelo Supabase.",
    details: stringProperty(error, "details"),
    hint: stringProperty(error, "hint"),
    code: stringProperty(error, "code") ?? stringProperty(error, "statusCode"),
  };
}

export function reportSupabaseError(context: string, error: unknown) {
  const details = supabaseErrorDetails(error);
  console.error(`[Supabase] ${context}`, details);
  return details;
}

export function readableSupabaseError(error: unknown) {
  const { message, code } = supabaseErrorDetails(error);
  return code ? `${message} (código ${code})` : message;
}
