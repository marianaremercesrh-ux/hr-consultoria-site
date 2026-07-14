import { useEffect, useState } from "react";
import { Download, Eye, Save, Trash2 } from "lucide-react";
import { AdminNotice, adminButtonClass, adminInputClass } from "./AdminUI";
import { deleteContractFile, listCompanyContracts, saveCompanyContract, signedContractUrl, uploadCompanyContract, validateContract } from "../services/companyContracts";
import { EMPTY_CONTRACT_FORM, PAYMENT_STATUSES, type CompanyContract, type CompanyContractForm } from "../types/companyContracts";

const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CompanyContractSection({ empresaId }: { empresaId: string }) {
  const [contracts, setContracts] = useState<CompanyContract[]>([]);
  const [selected, setSelected] = useState<CompanyContract | null>(null);
  const [form, setForm] = useState<CompanyContractForm>(EMPTY_CONTRACT_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function select(item: CompanyContract | null) {
    setSelected(item); setFile(null);
    setForm(item ? { valor_por_vaga: Number(item.valor_por_vaga), moeda: item.moeda, valor_recebido: Number(item.valor_recebido), forma_cobranca: item.forma_cobranca ?? "", status_pagamento: item.status_pagamento, data_vencimento: item.data_vencimento ?? "", observacoes: item.observacoes ?? "" } : { ...EMPTY_CONTRACT_FORM });
  }
  async function load(preferred?: string) { const items = await listCompanyContracts(empresaId); setContracts(items); select(items.find((item) => item.id === preferred) ?? items[0] ?? null); }
  useEffect(() => { void load().catch(() => setError("Não foi possível carregar contratos. Execute o SQL do módulo no Supabase.")); }, [empresaId]);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      if (form.valor_por_vaga < 0 || form.valor_recebido < 0) throw new Error("Os valores não podem ser negativos.");
      let saved = await saveCompanyContract(empresaId, form, selected?.id);
      if (file) saved = await uploadCompanyContract(saved, file);
      setMessage(file ? "Contrato e valores salvos com sucesso." : "Dados comerciais salvos com sucesso."); await load(saved.id);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível salvar o contrato."); } finally { setBusy(false); }
  }
  async function open(download: boolean) { if (!selected?.caminho_arquivo) return; try { window.open(await signedContractUrl(selected.caminho_arquivo, download), "_blank", "noopener,noreferrer"); } catch { setError("Não foi possível acessar o contrato."); } }
  async function remove() { if (!selected || !window.confirm("Excluir o arquivo do contrato? Os dados comerciais serão mantidos.")) return; setBusy(true); try { await deleteContractFile(selected); setMessage("Arquivo excluído com sucesso."); await load(selected.id); } catch { setError("Não foi possível excluir o arquivo."); } finally { setBusy(false); } }
  const balance = Math.max(0, form.valor_por_vaga - form.valor_recebido);

  return <section className="mt-8 border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
    <div className="flex flex-wrap justify-between gap-4"><div><h2 className="text-2xl font-semibold text-[#052656]">Contrato e valores</h2><p className="text-gray-600">Dados comerciais e documentos privados do cliente.</p></div><button type="button" onClick={() => select(null)} className={adminButtonClass("secondary")}>Novo contrato</button></div>
    {message && <AdminNotice>{message}</AdminNotice>}{error && <AdminNotice type="error">{error}</AdminNotice>}
    {contracts.length > 0 && <div className="mt-5 flex gap-2 overflow-x-auto">{contracts.map((item, index) => <button type="button" key={item.id} onClick={() => select(item)} className={`shrink-0 border px-4 py-2 ${selected?.id === item.id ? "border-[#D4A62A] bg-[#D4A62A]/10" : "border-gray-200"}`}>Contrato {contracts.length - index}</button>)}</div>}
    <form onSubmit={submit} className="mt-6 grid gap-5 md:grid-cols-2">
      <MoneyInput label="Valor acordado por vaga" value={form.valor_por_vaga} set={(value) => setForm({ ...form, valor_por_vaga: value })}/>
      <label><Label>Moeda</Label><select value={form.moeda} onChange={(event) => setForm({ ...form, moeda: event.target.value })} className={adminInputClass}><option value="BRL">BRL — Real brasileiro</option></select></label>
      <label><Label>Forma de cobrança</Label><input value={form.forma_cobranca} onChange={(event) => setForm({ ...form, forma_cobranca: event.target.value })} className={adminInputClass}/></label>
      <label><Label>Status do pagamento</Label><select value={form.status_pagamento} onChange={(event) => setForm({ ...form, status_pagamento: event.target.value as CompanyContractForm["status_pagamento"] })} className={adminInputClass}>{PAYMENT_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
      <label><Label>Data de vencimento</Label><input type="date" value={form.data_vencimento} onChange={(event) => setForm({ ...form, data_vencimento: event.target.value })} className={adminInputClass}/></label>
      <MoneyInput label="Valor recebido" value={form.valor_recebido} set={(value) => setForm({ ...form, valor_recebido: value })}/>
      <div className="border-l-4 border-[#D4A62A] bg-[#F5F7FA] p-4"><small>Saldo pendente</small><strong className="block text-xl text-[#052656]">{money(balance)}</strong></div>
      <label className="md:col-span-2"><Label>Observações financeiras</Label><textarea value={form.observacoes} onChange={(event) => setForm({ ...form, observacoes: event.target.value })} rows={4} className={adminInputClass}/></label>
      <label className="md:col-span-2"><Label>Anexar contrato</Label><input type="file" accept=".pdf,.doc,.docx" onChange={(event) => { const chosen = event.target.files?.[0] ?? null; try { if (chosen) validateContract(chosen); setFile(chosen); setError(""); } catch (reason) { setFile(null); setError(reason instanceof Error ? reason.message : "Arquivo inválido."); } }} className={adminInputClass}/><small className="text-gray-500">PDF, DOC ou DOCX, até 10 MB. Um novo arquivo substitui o atual.</small></label>
      {selected?.caminho_arquivo && <div className="md:col-span-2 flex flex-wrap items-center gap-3 bg-gray-50 p-4"><div className="min-w-0 flex-1"><strong className="block truncate">{selected.nome_arquivo}</strong><small>{selected.contrato_data_upload ? new Intl.DateTimeFormat("pt-BR").format(new Date(selected.contrato_data_upload)) : "Data não informada"}</small></div><button type="button" onClick={() => void open(false)} className={adminButtonClass("secondary")}><Eye size={16}/>Ver contrato</button><button type="button" onClick={() => void open(true)} className={adminButtonClass("secondary")}><Download size={16}/>Baixar contrato</button><button type="button" onClick={() => void remove()} className={adminButtonClass("danger")}><Trash2 size={16}/>Excluir</button></div>}
      <button disabled={busy} className={adminButtonClass("primary")}><Save size={17}/>{busy ? "Salvando..." : "Salvar contrato e valores"}</button>
    </form>
  </section>;
}

function Label({ children }: { children: React.ReactNode }) { return <span className="mb-2 block font-semibold text-[#052656]">{children}</span>; }
function MoneyInput({ label, value, set }: { label: string; value: number; set: (value: number) => void }) { const [text, setText] = useState(money(value)); useEffect(() => setText(money(value)), [value]); return <label><Label>{label}</Label><input inputMode="decimal" value={text} onFocus={() => setText(value.toFixed(2).replace(".", ","))} onChange={(event) => setText(event.target.value)} onBlur={() => { const parsed = Number(text.replace(/[^\d,-]/g, "").replace(",", ".")); const safe = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0; set(safe); setText(money(safe)); }} className={adminInputClass}/></label>; }
