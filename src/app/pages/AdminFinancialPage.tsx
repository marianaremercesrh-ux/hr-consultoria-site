import { useEffect, useMemo, useState } from "react";
import { Download, Eye, FileText, Landmark, Pencil, Plus, Trash2, Upload, WalletCards, X } from "lucide-react";
import AdminNav from "../components/AdminNav";
import { AdminNotice, AdminSkeleton, ConfirmDialog, adminButtonClass, adminInputClass, adminTableHeadClass, adminTableRowClass } from "../components/AdminUI";
import { listEmpresas } from "../services/ats";
import { listSelectableJobs } from "../services/jobs";
import { deleteFinancialAttachment, deleteFinancialTransaction, financialAttachmentUrl, listFinancialTransactions, saveFinancialTransaction, uploadFinancialAttachment, validateFinancialAttachment } from "../services/financial";
import { readableSupabaseError, reportSupabaseError } from "../lib/supabaseError";
import type { Empresa } from "../types/ats";
import type { SelectableJob } from "../services/jobs";
import type { FinancialForm, FinancialStatus, FinancialTransaction, FinancialType } from "../types/financial";

const EMPTY: FinancialForm = { tipo: "entrada", descricao: "", contraparte: "", empresa_id: null, vaga_servico: null, categoria: "", valor: 0, data_vencimento: "", data_pagamento: null, forma_pagamento: null, status: "pendente", observacoes: null };
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const date = (value: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));

export default function AdminFinancialPage() {
  const [items, setItems] = useState<FinancialTransaction[]>([]);
  const [companies, setCompanies] = useState<Empresa[]>([]);
  const [jobs, setJobs] = useState<SelectableJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialTransaction | null>(null);
  const [form, setForm] = useState<FinancialForm>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [deleting, setDeleting] = useState<FinancialTransaction | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ from: "", to: "", client: "", type: "", status: "" });

  async function load() {
    setLoading(true); setError("");
    try {
      const [transactions, companyRows, jobRows] = await Promise.all([listFinancialTransactions(), listEmpresas(), listSelectableJobs()]);
      setItems(transactions); setCompanies(companyRows); setJobs(jobRows);
    } catch (reason) {
      reportSupabaseError("carregar gestão financeira", reason);
      setError(`Não foi possível carregar o financeiro: ${readableSupabaseError(reason)}`);
    } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  const totals = useMemo(() => {
    const paid = items.filter((item) => item.status === "pago");
    const entries = paid.filter((item) => item.tipo === "entrada").reduce((sum, item) => sum + Number(item.valor), 0);
    const exits = paid.filter((item) => item.tipo === "saida").reduce((sum, item) => sum + Number(item.valor), 0);
    const pending = items.filter((item) => item.status !== "pago").reduce((sum, item) => sum + Number(item.valor), 0);
    return { entries, exits, balance: entries - exits, pending };
  }, [items]);
  const filtered = useMemo(() => items.filter((item) => (!filters.from || item.data_vencimento >= filters.from) && (!filters.to || item.data_vencimento <= filters.to) && (!filters.client || item.empresa_id === filters.client) && (!filters.type || item.tipo === filters.type) && (!filters.status || item.status === filters.status)), [items, filters]);

  function openNew() { setEditing(null); setForm(EMPTY); setFile(null); setError(""); setFormOpen(true); }
  function openEdit(item: FinancialTransaction) { setEditing(item); setForm({ tipo:item.tipo,descricao:item.descricao,contraparte:item.contraparte,empresa_id:item.empresa_id,vaga_servico:item.vaga_servico,categoria:item.categoria,valor:Number(item.valor),data_vencimento:item.data_vencimento,data_pagamento:item.data_pagamento,forma_pagamento:item.forma_pagamento,status:item.status,observacoes:item.observacoes }); setFile(null); setError(""); setFormOpen(true); }
  function selectFile(selected: File | null) { try { if (selected) validateFinancialAttachment(selected); setFile(selected); setError(""); } catch (reason) { setFile(null); setError(reason instanceof Error ? reason.message : "Anexo inválido."); } }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (saving) return; setSaving(true); setError(""); setMessage("");
    try {
      let saved = await saveFinancialTransaction(form, editing?.id);
      if (file) saved = await uploadFinancialAttachment(saved, file);
      setItems((current) => editing ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]);
      setMessage(editing ? "Movimentação atualizada com sucesso." : "Movimentação registrada com sucesso."); setFormOpen(false); setEditing(null); setFile(null);
    } catch (reason) { reportSupabaseError("salvar movimentação financeira", reason); setError(`Não foi possível salvar: ${readableSupabaseError(reason)}`); }
    finally { setSaving(false); }
  }
  async function openAttachment(item: FinancialTransaction, download: boolean) { if (!item.anexo_caminho) return; try { const url=await financialAttachmentUrl(item.anexo_caminho, download); const link=document.createElement("a");link.href=url;link.target="_blank";link.rel="noopener noreferrer";if(download)link.download=item.anexo_nome??"anexo";document.body.appendChild(link);link.click();link.remove(); } catch(reason){reportSupabaseError("abrir anexo financeiro",reason);setError(`Não foi possível abrir o anexo: ${readableSupabaseError(reason)}`);} }
  async function removeAttachment() { if (!editing) return; setSaving(true); try { await deleteFinancialAttachment(editing); const updated={...editing,anexo_nome:null,anexo_caminho:null,anexo_tipo:null};setEditing(updated);setItems(current=>current.map(item=>item.id===updated.id?updated:item));setMessage("Anexo excluído."); } catch(reason){reportSupabaseError("excluir anexo financeiro",reason);setError(`Não foi possível excluir o anexo: ${readableSupabaseError(reason)}`);} finally{setSaving(false);} }
  async function confirmDelete() { if(!deleting)return;setSaving(true);try{await deleteFinancialTransaction(deleting);setItems(current=>current.filter(item=>item.id!==deleting.id));setDeleting(null);setMessage("Movimentação excluída.");}catch(reason){reportSupabaseError("excluir movimentação financeira",reason);setError(`Não foi possível excluir: ${readableSupabaseError(reason)}`);}finally{setSaving(false);} }

  return <main className="min-h-screen bg-[#F5F7FA]"><AdminNav/><section className="mx-auto max-w-7xl px-5 py-10">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="flex items-center gap-3 text-3xl font-semibold text-[#052656]"><Landmark className="text-[#D4A62A]"/>Financeiro</h1><p className="mt-2 text-gray-600">Controle entradas, saídas, pagamentos e comprovantes.</p></div><button type="button" onClick={openNew} className={adminButtonClass("primary")}><Plus size={18}/>Nova movimentação</button></div>
    {error&&<AdminNotice type="error">{error}</AdminNotice>}{message&&<AdminNotice>{message}</AdminNotice>}
    {loading?<div className="mt-8"><AdminSkeleton rows={6}/></div>:<>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Total title="Total de entradas" value={totals.entries} tone="green"/><Total title="Total de saídas" value={totals.exits} tone="red"/><Total title="Saldo atual" value={totals.balance} tone={totals.balance>=0?"blue":"red"}/><Total title="Pagamentos pendentes" value={totals.pending} tone="yellow"/></div>
      <div className="mt-8 grid gap-4 border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-2 xl:grid-cols-5"><Field label="Período inicial"><input type="date" value={filters.from} onChange={e=>setFilters({...filters,from:e.target.value})} className={adminInputClass}/></Field><Field label="Período final"><input type="date" value={filters.to} onChange={e=>setFilters({...filters,to:e.target.value})} className={adminInputClass}/></Field><Field label="Cliente"><select value={filters.client} onChange={e=>setFilters({...filters,client:e.target.value})} className={adminInputClass}><option value="">Todos</option>{companies.map(x=><option key={x.id} value={x.id}>{x.nome}</option>)}</select></Field><Field label="Tipo"><select value={filters.type} onChange={e=>setFilters({...filters,type:e.target.value})} className={adminInputClass}><option value="">Todos</option><option value="entrada">Entrada</option><option value="saida">Saída</option></select></Field><Field label="Status"><select value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})} className={adminInputClass}><option value="">Todos</option><option value="pago">Pago</option><option value="pendente">Pendente</option><option value="atrasado">Atrasado</option></select></Field></div>
      <div className="mt-8 overflow-x-auto border border-gray-200 bg-white shadow-sm">{filtered.length===0?<p className="p-10 text-center text-gray-600">Nenhuma movimentação encontrada.</p>:<table className="w-full min-w-[1400px] text-left"><thead className={adminTableHeadClass}><tr>{["Data","Tipo","Descrição","Cliente ou fornecedor","Vaga ou serviço","Forma de pagamento","Valor","Status","Anexo","Ações"].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{filtered.map(item=><tr key={item.id} className={adminTableRowClass}><td className="p-3">{date(item.data_vencimento)}</td><td className={`p-3 font-semibold ${item.tipo==="entrada"?"text-green-700":"text-red-700"}`}>{item.tipo==="entrada"?"Entrada":"Saída"}</td><td className="max-w-64 p-3 font-semibold text-[#052656]">{item.descricao}</td><td className="p-3">{item.contraparte}</td><td className="p-3">{item.vaga_servico||"—"}</td><td className="p-3">{item.forma_pagamento||"—"}</td><td className={`p-3 font-bold ${item.tipo==="entrada"?"text-green-700":"text-red-700"}`}>{money.format(Number(item.valor))}</td><td className="p-3"><Status value={item.status}/></td><td className="p-3">{item.anexo_caminho?<div className="flex gap-1"><button title="Visualizar" onClick={()=>void openAttachment(item,false)} className="p-2 text-[#052656]"><Eye size={17}/></button><button title="Baixar" onClick={()=>void openAttachment(item,true)} className="p-2 text-[#052656]"><Download size={17}/></button></div>:"—"}</td><td className="p-3"><div className="flex gap-2"><button onClick={()=>openEdit(item)} className={adminButtonClass("secondary")}><Pencil size={15}/>Editar</button><button onClick={()=>setDeleting(item)} className={adminButtonClass("danger")}><Trash2 size={15}/>Excluir</button></div></td></tr>)}</tbody></table>}</div>
    </>}
  </section>
  {formOpen&&<div className="fixed inset-0 z-[90] overflow-y-auto bg-black/55 px-4 py-8" onMouseDown={e=>{if(e.target===e.currentTarget&&!saving)setFormOpen(false)}}><div className="mx-auto w-full max-w-5xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-2xl font-semibold text-[#052656]">{editing?"Editar movimentação":"Nova movimentação"}</h2><button type="button" onClick={()=>setFormOpen(false)} aria-label="Fechar"><X/></button></div><form onSubmit={submit} className="mt-6 grid gap-5 md:grid-cols-2">
    <Select label="Tipo da movimentação" value={form.tipo} onChange={value=>setForm({...form,tipo:value as FinancialType})}><option value="entrada">Entrada</option><option value="saida">Saída</option></Select><Input label="Descrição" required value={form.descricao} onChange={value=>setForm({...form,descricao:value})}/>
    <Input label="Cliente ou fornecedor" required value={form.contraparte} list="counterparties" onChange={value=>{const company=companies.find(x=>x.nome===value);setForm({...form,contraparte:value,empresa_id:company?.id??null})}}/><datalist id="counterparties">{companies.map(x=><option key={x.id} value={x.nome}/>)}</datalist>
    <Field label="Vaga ou serviço relacionado"><input value={form.vaga_servico??""} list="financial-jobs" onChange={e=>setForm({...form,vaga_servico:e.target.value})} className={adminInputClass}/><datalist id="financial-jobs">{jobs.map(x=><option key={x.id} value={x.titulo}/>)}</datalist></Field>
    <Input label="Categoria" required value={form.categoria} onChange={value=>setForm({...form,categoria:value})}/><Input label="Valor" required type="number" min="0.01" step="0.01" value={String(form.valor||"")} onChange={value=>setForm({...form,valor:Number(value)})}/><Input label="Data de vencimento" required type="date" value={form.data_vencimento} onChange={value=>setForm({...form,data_vencimento:value})}/><Input label="Data de pagamento" type="date" value={form.data_pagamento??""} onChange={value=>setForm({...form,data_pagamento:value||null})}/><Input label="Forma de pagamento" value={form.forma_pagamento??""} onChange={value=>setForm({...form,forma_pagamento:value})}/><Select label="Status" value={form.status} onChange={value=>setForm({...form,status:value as FinancialStatus})}><option value="pago">Pago</option><option value="pendente">Pendente</option><option value="atrasado">Atrasado</option></Select>
    <Field label="Observações" className="md:col-span-2"><textarea rows={4} value={form.observacoes??""} onChange={e=>setForm({...form,observacoes:e.target.value})} className={adminInputClass}/></Field><Field label="Anexo" className="md:col-span-2"><input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={e=>selectFile(e.target.files?.[0]??null)} className={adminInputClass}/><small className="mt-2 block text-gray-500">Nota fiscal, recibo, comprovante bancário ou print em PDF, JPG, JPEG ou PNG, até 10 MB.</small>{editing?.anexo_caminho&&<div className="mt-3 flex flex-wrap items-center gap-2"><FileText size={18}/><span>{editing.anexo_nome}</span><button type="button" onClick={()=>void openAttachment(editing,false)} className={adminButtonClass("secondary")}><Eye size={15}/>Visualizar</button><button type="button" onClick={()=>void openAttachment(editing,true)} className={adminButtonClass("secondary")}><Download size={15}/>Baixar</button><button type="button" onClick={()=>void removeAttachment()} className={adminButtonClass("danger")}><Trash2 size={15}/>Excluir anexo</button></div>}{file&&<p className="mt-2 font-semibold text-green-700"><Upload className="mr-1 inline" size={16}/>{file.name} será enviado ao salvar.</p>}</Field>
    <div className="flex flex-wrap gap-3 md:col-span-2"><button disabled={saving} className={adminButtonClass("primary")}><WalletCards size={17}/>{saving?"Salvando...":"Salvar movimentação"}</button><button type="button" disabled={saving} onClick={()=>setFormOpen(false)} className={adminButtonClass("secondary")}>Cancelar</button></div>
  </form></div></div>}
  <ConfirmDialog open={Boolean(deleting)} title="Excluir movimentação" description={`Excluir “${deleting?.descricao??""}” e seu anexo? Esta ação não pode ser desfeita.`} loading={saving} onCancel={()=>setDeleting(null)} onConfirm={()=>void confirmDelete()}/></main>;
}

function Total({title,value,tone}:{title:string;value:number;tone:"green"|"red"|"blue"|"yellow"}){const tones={green:"border-green-600 text-green-700",red:"border-red-600 text-red-700",blue:"border-[#052656] text-[#052656]",yellow:"border-[#D4A62A] text-amber-700"};return <article className={`border-l-4 bg-white p-6 shadow-sm ${tones[tone]}`}><p className="font-semibold text-gray-600">{title}</p><strong className="mt-3 block text-3xl">{money.format(value)}</strong></article>}
function Status({value}:{value:FinancialStatus}){const styles={pago:"bg-green-100 text-green-800",pendente:"bg-amber-100 text-amber-800",atrasado:"bg-red-100 text-red-800"};return <span className={`inline-flex px-3 py-1 text-sm font-semibold ${styles[value]}`}>{value==="pago"?"Pago":value==="pendente"?"Pendente":"Atrasado"}</span>}
function Field({label,children,className=""}:{label:string;children:React.ReactNode;className?:string}){return <label className={className}><span className="mb-2 block font-semibold text-[#052656]">{label}</span>{children}</label>}
function Input({label,value,onChange,...props}:{label:string;value:string;onChange:(value:string)=>void}&Omit<React.InputHTMLAttributes<HTMLInputElement>,"value"|"onChange">){return <Field label={label}><input value={value} onChange={e=>onChange(e.target.value)} className={adminInputClass} {...props}/></Field>}
function Select({label,value,onChange,children}:{label:string;value:string;onChange:(value:string)=>void;children:React.ReactNode}){return <Field label={label}><select value={value} onChange={e=>onChange(e.target.value)} className={adminInputClass}>{children}</select></Field>}
