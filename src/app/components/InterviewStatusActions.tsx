import type { InterviewStatus } from "../types/ats";
import { interviewStatusLabel, normalizeInterviewStatus } from "../lib/interviewStatus";

type ActionStatus = "confirmada" | "realizada" | "nao_compareceu" | "cancelada";
const ACTIONS: Array<{ status: ActionStatus; label: string; selected: string; idle: string }> = [
  { status: "confirmada", label: "Confirmar", selected: "border-[#052656] bg-[#052656] text-white", idle: "border-[#052656] bg-white text-[#052656]" },
  { status: "realizada", label: "Realizada", selected: "border-green-700 bg-green-700 text-white", idle: "border-green-700 bg-white text-green-700" },
  { status: "nao_compareceu", label: "Não compareceu", selected: "border-orange-700 bg-orange-700 text-white", idle: "border-orange-700 bg-white text-orange-700" },
  { status: "cancelada", label: "Cancelar", selected: "border-red-700 bg-red-700 text-white", idle: "border-red-700 bg-white text-red-700" },
];

export default function InterviewStatusActions({ currentStatus, processingStatus, disabled = false, onChange }: { currentStatus: InterviewStatus | string; processingStatus?: InterviewStatus | null; disabled?: boolean; onChange: (status: InterviewStatus) => Promise<void> }) {
  const normalizedStatus = normalizeInterviewStatus(currentStatus);
  const busy = Boolean(processingStatus);
  return <div>
    <p className="mb-2 text-sm font-semibold text-[#052656]" aria-live="polite">Status atual: {interviewStatusLabel(normalizedStatus)}</p>
    <div className="flex flex-wrap gap-2" role="group" aria-label="Alterar status da entrevista" aria-busy={busy}>
      {ACTIONS.map((action) => {
        const selected = normalizedStatus === action.status;
        const processing = processingStatus === action.status;
        return <button key={action.status} type="button" aria-pressed={selected} disabled={disabled || busy || selected} onClick={() => void onChange(action.status)} className={`inline-flex min-h-10 items-center border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-65 ${selected ? action.selected : action.idle}`}>
          {processing ? "Salvando..." : action.label}
        </button>;
      })}
    </div>
  </div>;
}
