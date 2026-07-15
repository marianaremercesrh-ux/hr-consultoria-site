import { useState } from "react";
import type { AdminClientFeedback } from "../types/clientPortal";
import { adminButtonClass } from "./AdminUI";

export type AdminFeedbackAction = "lida" | "em_andamento" | "concluido";

export default function AdminFeedbackActions({
  item,
  onAction,
  compact = false,
}: {
  item: AdminClientFeedback;
  onAction: (item: AdminClientFeedback, action: AdminFeedbackAction) => Promise<void>;
  compact?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const buttonClass = compact
    ? "text-sm font-semibold underline disabled:cursor-wait disabled:opacity-50"
    : adminButtonClass("secondary");

  async function run(action: AdminFeedbackAction) {
    if (busy) return;
    if (action === "lida" && item.lido_em) return;
    if (action === "em_andamento" && item.status_atendimento !== "pendente") return;
    if (action === "concluido" && item.status_atendimento === "concluido") return;
    setBusy(true);
    try {
      await onAction(item, action);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`/admin/candidatos/${item.candidatura?.candidato_id}?candidatura=${item.candidatura_id}&from=notificacoes#candidatura-${item.candidatura_id}`}
        className={compact ? "text-sm font-semibold underline" : adminButtonClass("primary")}
      >
        Abrir candidato
      </a>
      {!item.lido_em && (
        <button disabled={busy} onClick={() => void run("lida")} className={buttonClass}>
          Marcar como lida
        </button>
      )}
      {item.status_atendimento === "pendente" && (
        <button disabled={busy} onClick={() => void run("em_andamento")} className={buttonClass}>
          Iniciar atendimento
        </button>
      )}
      {item.status_atendimento !== "concluido" && (
        <button
          disabled={busy}
          onClick={() => void run("concluido")}
          className={compact ? buttonClass : adminButtonClass("success")}
        >
          Concluir
        </button>
      )}
      {item.status_atendimento === "concluido" && (
        <span className="inline-flex items-center bg-green-100 px-3 py-2 text-sm font-semibold text-green-800">
          Atendimento concluído
        </span>
      )}
    </div>
  );
}
