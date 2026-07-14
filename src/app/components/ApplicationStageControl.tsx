import { useEffect, useState } from "react";
import { ETAPAS, etapaPermiteMotivo, type CandidaturaDetalhada, type EtapaProcesso } from "../types/candidates";
import { adminButtonClass, adminInputClass } from "./AdminUI";

export function EtapaBadge({ etapa }: { etapa: EtapaProcesso }) {
  const item = ETAPAS.find((option) => option.value === etapa);
  const colors = {
    positive: "border-green-200 bg-green-50 text-green-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
    warning: "border-amber-300 bg-amber-50 text-amber-900",
    neutral: "border-gray-300 bg-gray-100 text-gray-700",
  };
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${colors[item?.tone ?? "neutral"]}`}>{item?.label ?? etapa}</span>;
}

export default function ApplicationStageControl({ application, onSave, ariaLabel }: {
  application: Pick<CandidaturaDetalhada, "id" | "etapa" | "observacoes">;
  onSave: (id: string, etapa: EtapaProcesso, motivo?: string | null) => Promise<void>;
  ariaLabel: string;
}) {
  const [stage, setStage] = useState(application.etapa);
  const [reason, setReason] = useState(application.observacoes ?? "");
  const [saving, setSaving] = useState(false);
  useEffect(() => { setStage(application.etapa); setReason(application.observacoes ?? ""); }, [application.etapa, application.observacoes]);
  const showReason = etapaPermiteMotivo(stage);

  async function selectStage(value: EtapaProcesso) {
    setStage(value);
    if (etapaPermiteMotivo(value)) return;
    setSaving(true);
    try { await onSave(application.id, value); } finally { setSaving(false); }
  }

  async function saveReason() {
    setSaving(true);
    try { await onSave(application.id, stage, reason); } finally { setSaving(false); }
  }

  return <div className="min-w-[220px] space-y-2">
    <select value={stage} onChange={(event) => void selectStage(event.target.value as EtapaProcesso)} disabled={saving} className={adminInputClass} aria-label={ariaLabel}>{ETAPAS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
    <EtapaBadge etapa={stage}/>
    {showReason && <div className="space-y-2"><label className="block"><span className="mb-1 block text-sm font-semibold text-[#052656]">Motivo (opcional)</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className={`${adminInputClass} resize-y`} placeholder="Adicione uma observação, se necessário."/></label><button type="button" onClick={() => void saveReason()} disabled={saving} className={adminButtonClass("secondary")}>{saving ? "Salvando..." : "Salvar etapa"}</button></div>}
  </div>;
}
