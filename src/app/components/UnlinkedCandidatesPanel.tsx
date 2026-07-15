import { useState } from "react";
import { adminButtonClass, adminInputClass } from "./AdminUI";
import { ensureCandidateApplication } from "../services/applications";
import type { CandidatoComTotal } from "../types/candidates";
import type { CandidateReportJob } from "../services/jobs";

export default function UnlinkedCandidatesPanel({
  candidates,
  jobs,
  onChanged,
}: {
  candidates: CandidatoComTotal[];
  jobs: CandidateReportJob[];
  onChanged: () => Promise<void>;
}) {
  const [choices, setChoices] = useState<Record<string, string>>({}),
    [saving, setSaving] = useState(""),
    [message, setMessage] = useState("");
  const unlinked = candidates.filter((x) => x.total_processos === 0);
  async function link(candidateId: string) {
    const jobId = choices[candidateId];
    if (!jobId || saving) return;
    setSaving(candidateId);
    setMessage("");
    try {
      const result = await ensureCandidateApplication(candidateId, jobId);
      setMessage(
        result.created
          ? "Candidatura vinculada à vaga. Agora revise e compartilhe com o cliente."
          : "Este candidato já estava vinculado a esta vaga.",
      );
      await onChanged();
    } catch (reason) {
      console.error("[Vincular candidato existente]", reason);
      setMessage("Não foi possível vincular o candidato à vaga.");
    } finally {
      setSaving("");
    }
  }
  if (!unlinked.length) return null;
  return (
    <section className="mt-8 border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-semibold text-[#052656]">
        Candidatos sem vaga vinculada
      </h2>
      <p className="mt-1 text-gray-600">
        Selecione uma vaga para criar somente a candidatura necessária. O
        cadastro do candidato será preservado.
      </p>
      <div className="mt-4 grid gap-3">
        {unlinked.map((candidate) => (
          <div
            key={candidate.id}
            className="grid gap-3 border p-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
          >
            <div>
              <strong className="text-[#052656]">{candidate.nome}</strong>
              <p className="text-sm text-gray-500">Sem vaga vinculada</p>
            </div>
            <label>
              <span className="text-sm font-semibold">Vaga da empresa</span>
              <select
                value={choices[candidate.id] ?? ""}
                onChange={(e) =>
                  setChoices({ ...choices, [candidate.id]: e.target.value })
                }
                className={`${adminInputClass} mt-1`}
              >
                <option value="">Selecione</option>
                {jobs
                  .filter((x) => x.status !== "excluida")
                  .map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.titulo} · {job.empresa || "Empresa não informada"}
                    </option>
                  ))}
              </select>
            </label>
            <button
              disabled={!choices[candidate.id] || Boolean(saving)}
              onClick={() => void link(candidate.id)}
              className={adminButtonClass("primary")}
            >
              {saving === candidate.id ? "Vinculando..." : "Vincular à vaga"}
            </button>
          </div>
        ))}
      </div>
      {message && (
        <p className="mt-4 font-semibold text-[#052656]">{message}</p>
      )}
    </section>
  );
}
