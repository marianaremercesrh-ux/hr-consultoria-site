import { useMemo } from "react";
import { ETAPAS, etapaPermiteMotivo, type CandidaturaDetalhada, type EtapaProcesso } from "../types/candidates";
import { adminButtonClass, adminInputClass } from "./AdminUI";
import { useEditableRecord } from "../hooks/useEditableRecord";

export function EtapaBadge({ etapa }: { etapa: EtapaProcesso }) {
  const item = ETAPAS.find((option) => option.value === etapa);
  const colors = { positive: "border-green-200 bg-green-50 text-green-800", info: "border-blue-200 bg-blue-50 text-blue-800", warning: "border-amber-300 bg-amber-50 text-amber-900", neutral: "border-gray-300 bg-gray-100 text-gray-700" };
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${colors[item?.tone ?? "neutral"]}`}>{item?.label ?? etapa}</span>;
}

type StageDraft = { stage: EtapaProcesso; reason: string };
export default function ApplicationStageControl({ application, onSave, ariaLabel }: { application: Pick<CandidaturaDetalhada, "id" | "etapa" | "observacoes">; onSave: (id: string, etapa: EtapaProcesso, motivo?: string | null) => Promise<{ etapa: EtapaProcesso; observacoes: string | null }>; ariaLabel: string }) {
  const initial = useMemo<StageDraft>(() => ({ stage: application.etapa, reason: application.observacoes ?? "" }), [application.etapa, application.observacoes]);
  const editor = useEditableRecord(initial, false, application.id);
  async function save() {
    if (editor.isSaving) return;
    editor.setIsSaving(true);
    try {
      const saved = await onSave(application.id, editor.draftData.stage, etapaPermiteMotivo(editor.draftData.stage) ? editor.draftData.reason : undefined);
      editor.confirm({ stage: saved.etapa, reason: saved.observacoes ?? "" });
    } catch {
      // A tela responsável já apresenta o erro; o rascunho permanece aberto.
    } finally { editor.setIsSaving(false); }
  }
  if (!editor.isEditing) return <div className="min-w-[220px] space-y-2"><EtapaBadge etapa={editor.savedData.stage}/>{editor.savedData.reason && <p className="max-w-xs text-sm text-gray-600">{editor.savedData.reason}</p>}<button type="button" onClick={editor.edit} className={adminButtonClass("secondary")}>Alterar etapa</button></div>;
  return <div className="min-w-[220px] space-y-2"><select value={editor.draftData.stage} onChange={event=>editor.setDraftData({...editor.draftData,stage:event.target.value as EtapaProcesso})} disabled={editor.isSaving} className={adminInputClass} aria-label={ariaLabel}>{ETAPAS.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select>{etapaPermiteMotivo(editor.draftData.stage)&&<label className="block"><span className="mb-1 block text-sm font-semibold text-[#052656]">Motivo (opcional)</span><textarea value={editor.draftData.reason} onChange={event=>editor.setDraftData({...editor.draftData,reason:event.target.value})} rows={3} className={`${adminInputClass} resize-y`}/></label>}<div className="flex flex-wrap gap-2"><button type="button" onClick={()=>void save()} disabled={editor.isSaving} className={adminButtonClass("primary")}>{editor.isSaving?"Salvando...":"Salvar alterações"}</button><button type="button" onClick={editor.cancel} disabled={editor.isSaving} className={adminButtonClass("secondary")}>Cancelar</button></div></div>;
}
