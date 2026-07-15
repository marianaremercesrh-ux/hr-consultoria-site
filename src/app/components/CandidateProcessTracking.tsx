import { useEffect, useMemo, useState } from "react";
import { adminButtonClass, adminInputClass } from "./AdminUI";
import { getClientInterview, saveAdmission, saveClientInterview } from "../services/candidateTracking";
import { ETAPAS, etapaLabel, type CandidaturaDetalhada, type EtapaProcesso } from "../types/candidates";
import type { InterviewModality, InterviewStatus } from "../types/ats";
import { useEditableRecord } from "../hooks/useEditableRecord";

type InterviewDraft = { status: InterviewStatus; modality: InterviewModality; date: string; time: string; location: string; notes: string };
type AdmissionDraft = { stage: EtapaProcesso; admission: string };
const EMPTY_INTERVIEW: InterviewDraft = { status: "agendada", modality: "presencial", date: "", time: "", location: "", notes: "" };
const STATUSES: Array<[InterviewStatus, string]> = [["solicitada","Solicitada"],["agendada","Agendada"],["confirmada","Confirmada"],["reagendada","Reagendada"],["realizada","Realizada"],["cancelada","Cancelada"],["nao_compareceu","Não compareceu"]];

export default function CandidateProcessTracking({ application, candidateId, onSaved }: { application: CandidaturaDetalhada; candidateId: string; onSaved: () => Promise<void> }) {
  const initialAdmission = useMemo<AdmissionDraft>(() => ({ stage: application.etapa, admission: application.data_admissao ?? "" }), [application.etapa, application.data_admissao]);
  const interview = useEditableRecord<InterviewDraft | null>(null, true, application.id);
  const admission = useEditableRecord<AdmissionDraft>(initialAdmission, !application.data_admissao, application.id);
  const [loadingInterview, setLoadingInterview] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    setLoadingInterview(true);
    void getClientInterview(application.id).then((item) => {
      if (!active) return;
      const confirmed = item ? { status: item.status, modality: item.modalidade ?? "presencial", date: item.data, time: item.horario.slice(0, 5), location: item.local ?? "", notes: item.observacoes_cliente ?? "" } : null;
      interview.confirm(confirmed);
      if (!confirmed) interview.edit();
    }).catch(() => { if (active) setMessage("Não foi possível carregar a entrevista com o cliente."); }).finally(() => { if (active) setLoadingInterview(false); });
    return () => { active = false; };
  }, [application.id]);

  async function persistInterview(nextStatus?: InterviewStatus) {
    if (interview.isSaving || !interview.draftData) return;
    const draft = { ...interview.draftData, status: nextStatus ?? interview.draftData.status };
    if (!application.vaga_id || !application.vaga?.empresa_id || !draft.date || !draft.time) { setMessage("Informe empresa, data e horário da entrevista."); return; }
    interview.setIsSaving(true); setMessage("");
    try {
      const saved = await saveClientInterview({ applicationId: application.id, candidateId, jobId: application.vaga_id, companyId: application.vaga.empresa_id, status: draft.status, modality: draft.modality, date: draft.date, time: draft.time, location: draft.location, notes: draft.notes });
      interview.confirm({ status: saved.status, modality: saved.modalidade ?? "presencial", date: saved.data, time: saved.horario.slice(0, 5), location: saved.local ?? "", notes: saved.observacoes_cliente ?? "" });
      setMessage("Entrevista com o cliente salva com sucesso."); await onSaved();
    } catch { setMessage("Não foi possível salvar a entrevista com o cliente."); } finally { interview.setIsSaving(false); }
  }

  async function persistAdmission() {
    if (admission.isSaving) return;
    admission.setIsSaving(true); setMessage("");
    try {
      const saved = await saveAdmission(application.id, admission.draftData.stage, admission.draftData.admission);
      admission.confirm({ stage: saved.etapa, admission: saved.data_admissao ?? "" });
      setMessage("Dados de admissão salvos com sucesso."); await onSaved();
    } catch { setMessage("Não foi possível salvar os dados de admissão."); } finally { admission.setIsSaving(false); }
  }

  return <div className="mt-5 grid gap-5 border border-gray-200 bg-gray-50 p-5 lg:grid-cols-2">
    <section><h4 className="text-lg font-semibold text-[#052656]">Entrevista com o cliente</h4>
      {loadingInterview ? <p className="mt-3 text-gray-600">Carregando entrevista...</p> : interview.isEditing ? <InterviewForm value={interview.draftData ?? EMPTY_INTERVIEW} set={(value) => interview.setDraftData(value)} saving={interview.isSaving} exists={Boolean(interview.savedData)} save={persistInterview} cancel={interview.savedData ? interview.cancel : undefined}/> : interview.savedData ? <InterviewView value={interview.savedData} edit={interview.edit}/> : null}
    </section>
    <section><h4 className="text-lg font-semibold text-[#052656]">Admissão</h4>
      {admission.isEditing ? <AdmissionForm value={admission.draftData} set={admission.setDraftData} saving={admission.isSaving} exists={Boolean(application.data_admissao)} save={persistAdmission} cancel={application.data_admissao ? admission.cancel : undefined}/> : <div className="mt-3"><p><strong>Status:</strong> {etapaLabel(admission.savedData.stage)}</p><p><strong>Data de admissão:</strong> {admission.savedData.admission ? new Intl.DateTimeFormat("pt-BR").format(new Date(`${admission.savedData.admission}T12:00`)) : "Não informada"}</p><button type="button" onClick={admission.edit} className={`${adminButtonClass("secondary")} mt-3`}>Alterar admissão</button></div>}
    </section>{message && <p role="status" className="font-semibold text-[#052656] lg:col-span-2">{message}</p>}
  </div>;
}

function InterviewView({ value, edit }: { value: InterviewDraft; edit: () => void }) { return <div className="mt-3 space-y-1"><p><strong>Status:</strong> {STATUSES.find(([status]) => status === value.status)?.[1]}</p><p><strong>Modalidade:</strong> {value.modality === "presencial" ? "Presencial" : "Online"}</p><p><strong>Data e horário:</strong> {new Intl.DateTimeFormat("pt-BR").format(new Date(`${value.date}T12:00`))} às {value.time}</p><p><strong>Local:</strong> {value.location || "Não informado"}</p>{value.notes && <p><strong>Observações compartilháveis:</strong> {value.notes}</p>}<button type="button" onClick={edit} className={`${adminButtonClass("secondary")} mt-3`}>Editar entrevista</button></div> }
function InterviewForm({ value, set, saving, exists, save, cancel }: { value: InterviewDraft; set: (value: InterviewDraft) => void; saving: boolean; exists: boolean; save: (status?: InterviewStatus) => Promise<void>; cancel?: () => void }) { return <div className="mt-3 grid gap-3 sm:grid-cols-2"><Select label="Status" value={value.status} set={v => set({...value,status:v as InterviewStatus})} options={STATUSES}/><Select label="Modalidade" value={value.modality} set={v => set({...value,modality:v as InterviewModality})} options={[["presencial","Presencial"],["online","Online"]]}/><Field label="Data" type="date" value={value.date} set={v=>set({...value,date:v})}/><Field label="Horário" type="time" value={value.time} set={v=>set({...value,time:v})}/><Field label={value.modality === "presencial" ? "Local" : "Link/local"} value={value.location} set={v=>set({...value,location:v})}/><label className="sm:col-span-2"><span className="font-semibold">Observações compartilháveis</span><textarea value={value.notes} onChange={e=>set({...value,notes:e.target.value})} rows={3} className={`${adminInputClass} mt-1`}/></label><div className="flex flex-wrap gap-2 sm:col-span-2"><button type="button" disabled={saving} onClick={()=>void save()} className={adminButtonClass("primary")}>{saving ? "Salvando..." : exists ? "Salvar alterações" : "Salvar"}</button>{cancel && <button type="button" disabled={saving} onClick={cancel} className={adminButtonClass("secondary")}>Cancelar</button>}</div></div> }
function AdmissionForm({ value, set, saving, exists, save, cancel }: { value: AdmissionDraft; set: (value: AdmissionDraft) => void; saving: boolean; exists: boolean; save: () => Promise<void>; cancel?: () => void }) { return <div className="mt-3 grid gap-3"><Select label="Status do processo" value={value.stage} set={v=>set({...value,stage:v as EtapaProcesso})} options={ETAPAS.map(x=>[x.value,x.label])}/><Field label="Data de admissão" type="date" value={value.admission} set={v=>set({...value,admission:v})}/>{value.admission && value.stage !== "contratado" && <p className="bg-amber-50 p-3 text-sm text-amber-900">Há uma data de admissão, mas o status ainda não é Contratado. A data será preservada.</p>}<div className="flex flex-wrap gap-2"><button type="button" disabled={saving} onClick={()=>void save()} className={adminButtonClass("primary")}>{saving ? "Salvando..." : exists ? "Salvar alterações" : "Salvar admissão"}</button>{cancel && <button type="button" disabled={saving} onClick={cancel} className={adminButtonClass("secondary")}>Cancelar</button>}</div></div> }
function Field({label,value,set,type="text"}:{label:string;value:string;set:(v:string)=>void;type?:string}){return <label><span className="font-semibold">{label}</span><input type={type} value={value} onChange={e=>set(e.target.value)} className={`${adminInputClass} mt-1`}/></label>}
function Select({label,value,set,options}:{label:string;value:string;set:(v:string)=>void;options:Array<readonly[string,string]>}){return <label><span className="font-semibold">{label}</span><select value={value} onChange={e=>set(e.target.value)} className={`${adminInputClass} mt-1`}>{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>}
