import { Download, Eye, FileText, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { listPortalContracts, signedPortalContract } from "../services/clientPortal";
import { CONTRACT_STATUSES, type PortalContract } from "../types/companyContracts";

export default function ClientDocuments({ companyId }: { companyId: string }) {
  const [documents, setDocuments] = useState<PortalContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [opening, setOpening] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      setDocuments(await listPortalContracts(companyId));
    } catch (reason) {
      console.error("[Documentos do Portal]", reason);
      setError("Não foi possível consultar os documentos liberados. Tente novamente.");
    } finally {
      if (background) setRefreshing(false); else setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const focus = () => void load(true);
    const visible = () => { if (document.visibilityState === "visible") focus(); };
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [load]);

  async function open(document: PortalContract, download: boolean) {
    if (opening) return;
    setOpening(`${document.id}:${download ? "download" : "view"}`);
    setError("");
    try {
      const url = await signedPortalContract(document, download);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (reason) {
      console.error("[Acesso ao contrato]", reason);
      setError("Não foi possível gerar o acesso seguro ao contrato. Tente novamente.");
    } finally {
      setOpening(null);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#052656]">Documentos</h1>
          <p className="mt-2 text-gray-600">Contratos disponibilizados pela HR Consultoria.</p>
        </div>
        <button
          type="button"
          onClick={() => void load(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 border border-[#052656] px-4 py-2 font-semibold text-[#052656] disabled:opacity-60"
        >
          <RefreshCw size={17} />{refreshing ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {error && <p className="mt-6 border-l-4 border-red-600 bg-red-50 p-4 font-semibold text-red-800">{error}</p>}
      {loading ? (
        <div className="mt-7 grid gap-4 sm:grid-cols-2"><Skeleton /><Skeleton /></div>
      ) : documents.length ? (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {documents.map((document) => {
            const busy = opening?.startsWith(`${document.id}:`) ?? false;
            return <article key={document.id} className="flex flex-col border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <FileText className="text-[#D4A62A]" size={30} />
              <h2 className="mt-4 break-words text-xl font-semibold text-[#052656]">{document.nome}</h2>
              <dl className="mt-4 grid gap-2 text-sm">
                <Row label="Status" value={statusLabel(document.status)} />
                <Row label="Enviado em" value={formatDate(document.data_envio)} />
                {document.data_validade && <Row label="Validade" value={formatDate(document.data_validade)} />}
              </dl>
              <div className="mt-auto grid gap-2 pt-6 sm:grid-cols-2">
                <button type="button" disabled={busy} onClick={() => void open(document, false)} className="inline-flex items-center justify-center gap-2 border border-[#052656] px-3 py-2 font-semibold text-[#052656] disabled:opacity-60"><Eye size={16} />Visualizar contrato</button>
                <button type="button" disabled={busy} onClick={() => void open(document, true)} className="inline-flex items-center justify-center gap-2 bg-[#D4A62A] px-3 py-2 font-semibold text-[#052656] disabled:opacity-60"><Download size={16} />Baixar PDF</button>
              </div>
            </article>;
          })}
        </div>
      ) : (
        <div className="mt-7 border border-gray-200 bg-white px-6 py-14 text-center">
          <FileText className="mx-auto text-[#D4A62A]" size={38} />
          <h2 className="mt-4 text-xl font-semibold text-[#052656]">Nenhum documento disponível</h2>
          <p className="mt-2 text-gray-600">Quando um contrato for liberado pela recrutadora, ele aparecerá aqui.</p>
        </div>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3"><dt className="text-gray-500">{label}</dt><dd className="text-right font-semibold text-[#052656]">{value}</dd></div>;
}
function Skeleton() { return <div className="h-64 animate-pulse bg-white shadow-sm" />; }
function formatDate(value: string) { return new Intl.DateTimeFormat("pt-BR").format(new Date(`${value.length === 10 ? `${value}T12:00:00` : value}`)); }
function statusLabel(value: PortalContract["status"]) { return CONTRACT_STATUSES.find((item) => item.value === value)?.label ?? value; }
