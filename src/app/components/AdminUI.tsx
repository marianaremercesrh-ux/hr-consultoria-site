import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export function adminButtonClass(variant: "primary" | "secondary" | "danger" | "success" = "primary") {
  const colors = {
    primary: "bg-[#D4A62A] text-[#052656] hover:bg-[#E0B33A]",
    secondary: "border border-[#052656] bg-white text-[#052656] hover:bg-[#052656] hover:text-white",
    danger: "bg-red-700 text-white hover:bg-red-800",
    success: "bg-green-600 text-white hover:bg-green-700",
  };
  return `inline-flex min-h-10 items-center justify-center gap-2 px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-[#D4A62A]/25 disabled:cursor-not-allowed disabled:opacity-50 ${colors[variant]}`;
}

export function AdminNotice({ children, type = "success" }: { children: React.ReactNode; type?: "success" | "error" }) {
  const Icon = type === "success" ? CheckCircle2 : XCircle;
  return <div role={type === "error" ? "alert" : "status"} className={`mt-6 flex items-start gap-3 border-l-4 p-4 shadow-sm ${type === "success" ? "border-green-600 bg-green-50 text-green-800" : "border-red-700 bg-red-50 text-red-800"}`}><Icon className="mt-0.5 shrink-0" size={20}/><span>{children}</span></div>;
}

export function AdminSkeleton({ rows = 3 }: { rows?: number }) {
  return <div className="animate-pulse space-y-4" aria-label="Carregando conteúdo">{Array.from({ length: rows }, (_, index) => <div key={index} className="h-20 bg-gray-200"/>)}</div>;
}

export function ConfirmDialog({ open, title, description, loading = false, onConfirm, onCancel }: { open: boolean; title: string; description: string; loading?: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}><div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md bg-white p-6 shadow-2xl"><AlertTriangle className="mb-4 text-red-700" size={30}/><h2 id="confirm-title" className="text-2xl font-semibold text-[#052656]">{title}</h2><p className="mt-3 leading-relaxed text-gray-600">{description}</p><div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" onClick={onCancel} disabled={loading} className={adminButtonClass("secondary")}>Cancelar</button><button type="button" onClick={onConfirm} disabled={loading} className={adminButtonClass("danger")}>{loading ? "Excluindo..." : "Confirmar exclusão"}</button></div></div></div>;
}

export const adminTableClass = "w-full text-left";
export const adminTableHeadClass = "sticky top-0 z-10 bg-[#052656] text-white";
export const adminTableRowClass = "border-b border-gray-200 even:bg-gray-50 transition-colors hover:bg-[#D4A62A]/10";
export const adminInputClass = "w-full border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-[#D4A62A] focus:ring-2 focus:ring-[#D4A62A]/15";
