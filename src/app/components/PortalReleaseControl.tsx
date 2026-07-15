import { useMemo, useState } from "react";
import { adminButtonClass, adminInputClass } from "./AdminUI";
import { savePortalRelease } from "../services/portalAdmin";
import type { CandidaturaDetalhada } from "../types/candidates";
import type { ClientFeedback } from "../types/clientPortal";
import { useEditableRecord } from "../hooks/useEditableRecord";

type ReleaseDraft = { release: boolean; summary: string; positives: string; attention: string; resume: boolean };

export default function PortalReleaseControl({ application, feedback, onChanged }: { application: CandidaturaDetalhada; feedback?: ClientFeedback; onChanged: () => Promise<void> }) {
  const initial = useMemo<ReleaseDraft>(() => ({ release: application.portal_liberado, summary: application.resumo_cliente ?? "", positives: application.pontos_positivos_cliente ?? "", attention: application.pontos_atencao_cliente ?? "", resume: application.curriculo_liberado }), [application]);
  const editor = useEditableRecord(initial, !application.portal_liberado, application.id);
  const [message, setMessage] = useState("");
  async function save() {
    if (editor.isSaving) return;
    if (!application.vaga_id || !application.vaga?.empresa_id) { setMessage("Vincule o candidato a uma vaga antes de compartilhar."); return; }
    editor.setIsSaving(true); setMessage("");
    try {
      const saved = await savePortalRelease(application.id, editor.draftData.release, { resumo: editor.draftData.summary, positives: editor.draftData.positives, attention: editor.draftData.attention, resume: editor.draftData.release && editor.draftData.resume });
      editor.confirm({ release: saved.portal_liberado, summary: saved.resumo_cliente ?? "", positives: saved.pontos_positivos_cliente ?? "", attention: saved.pontos_atencao_cliente ?? "", resume: saved.curriculo_liberado });
      setMessage(saved.portal_liberado ? "Candidato compartilhado com o cliente." : "Compartilhamento com o cliente desativado.");
      await onChanged();
    } catch (reason) { console.error("[Compartilhamento com o cliente]", reason); setMessage("Não foi possível salvar o compartilhamento."); } finally { editor.setIsSaving(false); }
  }
  return <section className="mt-5 border border-gray-200 bg-white p-5">
    <h3 className="text-xl font-semibold text-[#052656]">Compartilhamento com o cliente</h3>
    <p className="mt-1 text-sm text-gray-600">{application.vaga?.titulo ?? "Sem vaga vinculada"} · {application.vaga?.empresa_cliente?.nome ?? "Empresa não vinculada"}</p>
    {editor.isEditing ? <div className="mt-4">
      <label className="block"><span className="font-semibold">Liberar candidato para o cliente</span><select value={editor.draftData.release ? "sim" : "nao"} onChange={e=>editor.setDraftData({...editor.draftData,release:e.target.value === "sim"})} className={`${adminInputClass} mt-1`}><option value="nao">Não</option><option value="sim">Sim</option></select></label>
      {editor.draftData.release && <div className="mt-4 grid gap-4"><Text label="Resumo para o cliente" value={editor.draftData.summary} set={summary=>editor.setDraftData({...editor.draftData,summary})}/><Text label="Pontos positivos" value={editor.draftData.positives} set={positives=>editor.setDraftData({...editor.draftData,positives})}/><Text label="Pontos de atenção" value={editor.draftData.attention} set={attention=>editor.setDraftData({...editor.draftData,attention})}/><label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={editor.draftData.resume} onChange={e=>editor.setDraftData({...editor.draftData,resume:e.target.checked})}/>Liberar currículo</label><p className="text-xs text-gray-500">Observações internas e dados pessoais não são compartilhados.</p></div>}
      <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={()=>void save()} disabled={editor.isSaving} className={adminButtonClass("primary")}>{editor.isSaving ? "Salvando..." : application.portal_liberado ? "Salvar alterações" : "Salvar e compartilhar"}</button>{application.portal_liberado && <button type="button" onClick={editor.cancel} disabled={editor.isSaving} className={adminButtonClass("secondary")}>Cancelar</button>}</div>
    </div> : <div className="mt-4 space-y-2"><p><strong>Situação:</strong> {editor.savedData.release ? "Compartilhado" : "Não compartilhado"}</p>{editor.savedData.release && <><Info label="Resumo para o cliente" value={editor.savedData.summary}/><Info label="Pontos positivos" value={editor.savedData.positives}/><Info label="Pontos de atenção" value={editor.savedData.attention}/><p><strong>Currículo:</strong> {editor.savedData.resume ? "Liberado" : "Não liberado"}</p></>}<button type="button" onClick={editor.edit} className={adminButtonClass("secondary")}>Alterar compartilhamento</button></div>}
    {message && <p role="status" className="mt-4 font-semibold text-[#052656]">{message}</p>}
    {feedback && <div className="mt-4 border-l-4 border-[#D4A62A] bg-amber-50 p-3 text-sm"><strong>Feedback do cliente:</strong> {feedback.decisao.replaceAll("_", " ")}<p>{feedback.comentario || "Sem comentário"}</p></div>}
  </section>;
}
function Text({label,value,set}:{label:string;value:string;set:(value:string)=>void}){return <label><span className="font-semibold">{label}</span><textarea value={value} onChange={e=>set(e.target.value)} rows={3} className={`${adminInputClass} mt-1`}/></label>}
function Info({label,value}:{label:string;value:string}){return <p><strong>{label}:</strong> {value || "Não informado"}</p>}
