import { useEffect, useState } from "react";
import { reportSupabaseError } from "../lib/supabaseError";
import { addNota, listHistorico, listNotas } from "../services/ats";
import type { HistoricoCandidato, ObservacaoInterna } from "../types/ats";
import { AdminNotice, adminButtonClass, adminInputClass } from "./AdminUI";

export default function CandidateHistoryPanel({ candidateId }: { candidateId: string }) {
  const [history, setHistory] = useState<HistoricoCandidato[]>([]);
  const [notes, setNotes] = useState<ObservacaoInterna[]>([]);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [events, savedNotes] = await Promise.all([
      listHistorico(candidateId),
      listNotas(candidateId),
    ]);
    setHistory(events);
    setNotes(savedNotes);
  }

  useEffect(() => {
    setError("");
    void load().catch((reason) => {
      const details = reportSupabaseError("Falha ao carregar observações internas", reason);
      setError(formatError(details));
    });
  }, [candidateId]);

  async function save() {
    if (saving) return;
    if (!text.trim()) {
      setMessage("");
      setError("Digite uma observação antes de salvar.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");
    try {
      const saved = await addNota(candidateId, text);
      setNotes((current) => [saved, ...current]);
      setText("");
      setMessage("Observação adicionada com sucesso.");
    } catch (reason) {
      const details = reportSupabaseError("Falha ao inserir public.observacoes_internas", reason);
      setError(formatError(details));
    } finally {
      setSaving(false);
    }
  }

  const date = (value: string) => new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <section className="bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-[#052656]">Histórico do candidato</h2>
        <ol className="mt-5 space-y-4 border-l-2 border-[#D4A62A] pl-5">
          {history.map((item) => <li key={item.id}><time className="text-sm text-gray-500">{date(item.created_at)}</time><h3 className="font-semibold text-[#052656]">{item.evento}</h3>{item.observacao && <p className="whitespace-pre-wrap text-gray-600">{item.observacao}</p>}</li>)}
          {!history.length && <li className="text-gray-500">Nenhum evento registrado.</li>}
        </ol>
      </section>
      <section className="bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-[#052656]">Observações internas</h2>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={4}
          placeholder="Nova observação privada"
          className={`${adminInputClass} mt-5`}
          disabled={saving}
        />
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className={`${adminButtonClass("primary")} mt-3`}
        >
          {saving ? "Salvando..." : "Adicionar observação"}
        </button>
        {message && <AdminNotice>{message}</AdminNotice>}
        {error && <AdminNotice type="error">{error}</AdminNotice>}
        <div className="mt-5 space-y-3">
          {notes.map((item) => <article key={item.id} className="border-l-4 border-gray-200 bg-gray-50 p-4"><time className="text-xs text-gray-500">{date(item.created_at)}</time><p className="mt-1 whitespace-pre-wrap">{item.texto}</p></article>)}
          {!notes.length && <p className="text-gray-500">Nenhuma observação interna registrada.</p>}
        </div>
      </section>
    </div>
  );
}

function formatError(details: { message: string; details: string | null; hint: string | null; code: string | null }) {
  return [
    details.message,
    details.details && `Detalhes: ${details.details}`,
    details.hint && `Sugestão: ${details.hint}`,
    details.code && `Código: ${details.code}`,
  ].filter(Boolean).join(" — ");
}
