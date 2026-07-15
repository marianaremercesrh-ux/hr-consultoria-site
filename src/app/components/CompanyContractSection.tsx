import { useEffect, useState } from "react";
import { Download, Eye, FileText, Trash2, Upload } from "lucide-react";
import { AdminNotice, adminButtonClass, adminInputClass } from "./AdminUI";
import { deleteContractFile, listCompanyContracts, listContractPortalAudit, saveCompanyContract, saveContractPortalRelease, signedContractUrl, uploadCompanyContract, validateContract } from "../services/companyContracts";
import { CONTRACT_STATUSES, EMPTY_CONTRACT_FORM, type CompanyContract, type ContractPortalAudit, type ContractStatus } from "../types/companyContracts";

export default function CompanyContractSection({ empresaId }: { empresaId: string }) {
  const [contract, setContract] = useState<CompanyContract | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [release, setRelease] = useState(false);
  const [contractStatus, setContractStatus] = useState<ContractStatus>("pendente");
  const [audit, setAudit] = useState<ContractPortalAudit[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const contracts = await listCompanyContracts(empresaId);
    const current = contracts.find((item) => item.caminho_arquivo) ?? contracts[0] ?? null;
    setContract(current);
    setRelease(current?.portal_liberado ?? false);
    setContractStatus(current?.status_contrato ?? "pendente");
    setAudit(current ? await listContractPortalAudit(current.id) : []);
  }

  useEffect(() => {
    void load().catch(() => setError("Não foi possível carregar o contrato da empresa."));
  }, [empresaId]);

  async function upload() {
    if (!file || busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const record = contract ?? await saveCompanyContract(empresaId, EMPTY_CONTRACT_FORM);
      const updated = await uploadCompanyContract(record, file);
      setContract(updated);
      setRelease(false);
      setContractStatus(updated.status_contrato);
      setFile(null);
      setMessage(contract?.caminho_arquivo ? "Contrato substituído com sucesso." : "Contrato anexado com sucesso.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível anexar o contrato.");
    } finally {
      setBusy(false);
    }
  }

  async function open(download: boolean) {
    if (!contract?.caminho_arquivo) return;
    try {
      window.open(await signedContractUrl(contract.caminho_arquivo, download), "_blank", "noopener,noreferrer");
    } catch {
      setError("Não foi possível acessar o contrato.");
    }
  }

  async function remove() {
    if (!contract || !window.confirm("Excluir o contrato anexado desta empresa?")) return;
    setBusy(true);
    setError("");
    try {
      await deleteContractFile(contract);
      setContract({ ...contract, nome_arquivo: null, caminho_arquivo: null, contrato_data_upload: null });
      setRelease(false);
      setContractStatus("pendente");
      setMessage("Contrato excluído com sucesso.");
    } catch {
      setError("Não foi possível excluir o contrato.");
    } finally {
      setBusy(false);
    }
  }

  async function saveRelease() {
    if (!contract?.caminho_arquivo || busy || (release === contract.portal_liberado && contractStatus === contract.status_contrato)) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const updated = await saveContractPortalRelease(contract.id, release, contractStatus);
      setContract(updated);
      setMessage(release ? "Contrato liberado no Portal do Cliente." : "Acesso ao contrato retirado do Portal do Cliente.");
    } catch {
      setRelease(contract.portal_liberado);
      setContractStatus(contract.status_contrato);
      setError("Não foi possível salvar a liberação do contrato.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="mt-8 border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
    <div className="flex items-center gap-3">
      <FileText className="text-[#D4A62A]"/>
      <div><h2 className="text-2xl font-semibold text-[#052656]">Contrato</h2><p className="text-gray-600">Anexe o contrato firmado com a empresa.</p></div>
    </div>
    {message && <AdminNotice>{message}</AdminNotice>}
    {error && <AdminNotice type="error">{error}</AdminNotice>}
    <div className="mt-6">
      <label><span className="mb-2 block font-semibold text-[#052656]">Anexar contrato</span><input type="file" accept=".pdf,.doc,.docx" onChange={(event) => { const selected = event.target.files?.[0] ?? null; try { if (selected) validateContract(selected); setFile(selected); setError(""); } catch (reason) { setFile(null); setError(reason instanceof Error ? reason.message : "Arquivo inválido."); } }} className={adminInputClass}/><small className="mt-2 block text-gray-500">PDF, DOC ou DOCX, até 10 MB. Ao enviar outro arquivo, o contrato atual será substituído.</small></label>
      <button type="button" onClick={() => void upload()} disabled={!file || busy} className={`${adminButtonClass("primary")} mt-4`}><Upload size={17}/>{busy ? "Enviando..." : contract?.caminho_arquivo ? "Substituir contrato" : "Anexar contrato"}</button>
    </div>
    {contract?.caminho_arquivo && <><div className="mt-6 flex flex-wrap items-center gap-3 border border-gray-200 bg-[#F5F7FA] p-4"><FileText className="shrink-0 text-[#D4A62A]"/><div className="min-w-0 flex-1"><strong className="block truncate text-[#052656]">{contract.nome_arquivo}</strong>{contract.contrato_data_upload && <small className="text-gray-500">Enviado em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(contract.contrato_data_upload))}</small>}</div><button type="button" onClick={() => void open(false)} className={adminButtonClass("secondary")}><Eye size={16}/>Ver contrato</button><button type="button" onClick={() => void open(true)} className={adminButtonClass("secondary")}><Download size={16}/>Baixar</button><button type="button" onClick={() => void remove()} disabled={busy} className={adminButtonClass("danger")}><Trash2 size={16}/>Excluir</button></div><div className="mt-4 border border-gray-200 p-4"><label className="block max-w-sm"><span className="mb-2 block font-semibold text-[#052656]">Situação do contrato</span><select value={contractStatus} onChange={(event)=>setContractStatus(event.target.value as ContractStatus)} disabled={busy} className={adminInputClass}>{CONTRACT_STATUSES.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label className="mt-4 flex items-start gap-3"><input type="checkbox" checked={release} onChange={(event)=>setRelease(event.target.checked)} disabled={busy} className="mt-1 h-4 w-4"/><span><strong className="block text-[#052656]">Liberar contrato no Portal do Cliente</strong><small className="text-gray-600">O arquivo permanece privado e será aberto por URL assinada temporária.</small></span></label><button type="button" onClick={()=>void saveRelease()} disabled={busy||(release===contract.portal_liberado&&contractStatus===contract.status_contrato)} className={`${adminButtonClass("primary")} mt-4`}>{busy?"Salvando...":"Salvar liberação"}</button>{contract.portal_liberado_em&&<p className="mt-3 text-sm text-gray-600">Liberado em {new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(contract.portal_liberado_em))} por {contract.portal_liberado_por??"usuário administrativo"}.</p>}</div>{audit.length>0&&<div className="mt-4 border border-gray-200 p-4"><h3 className="font-semibold text-[#052656]">Acessos recentes no Portal</h3><ul className="mt-3 space-y-2 text-sm text-gray-700">{audit.map(item=><li key={item.id}>{item.acao==="download"?"Download":"Visualização"} em {new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(item.created_at))} · usuário {item.usuario_id}</li>)}</ul></div>}</>}
  </section>;
}
