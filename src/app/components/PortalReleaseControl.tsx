import { useEffect, useState } from "react";
import { adminButtonClass, adminInputClass } from "./AdminUI";
import { savePortalRelease } from "../services/portalAdmin";
import type { CandidaturaDetalhada } from "../types/candidates";
import type { ClientFeedback } from "../types/clientPortal";

export default function PortalReleaseControl({
  application,
  feedback,
  onChanged,
}: {
  application: CandidaturaDetalhada;
  feedback?: ClientFeedback;
  onChanged: () => Promise<void>;
}) {
  const [release, setRelease] = useState(application.portal_liberado),
    [summary, setSummary] = useState(application.resumo_cliente ?? ""),
    [positives, setPositives] = useState(
      application.pontos_positivos_cliente ?? "",
    ),
    [attention, setAttention] = useState(
      application.pontos_atencao_cliente ?? "",
    ),
    [resume, setResume] = useState(application.curriculo_liberado),
    [saving, setSaving] = useState(false),
    [message, setMessage] = useState("");
  useEffect(() => {
    setRelease(application.portal_liberado);
    setSummary(application.resumo_cliente ?? "");
    setPositives(application.pontos_positivos_cliente ?? "");
    setAttention(application.pontos_atencao_cliente ?? "");
    setResume(application.curriculo_liberado);
  }, [application]);
  async function save() {
    if (saving) return;
    if (!application.vaga_id || !application.vaga?.empresa_id) {
      setMessage("Vincule o candidato a uma vaga antes de compartilhar.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await savePortalRelease(application.id, release, {
        resumo: summary,
        positives,
        attention,
        resume: release && resume,
      });
      await onChanged();
      setMessage(
        release
          ? "Candidato compartilhado com o cliente"
          : "Compartilhamento com o cliente desativado",
      );
    } catch (reason) {
      console.error("[Compartilhamento com o cliente]", reason);
      setMessage("Não foi possível salvar o compartilhamento.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className="mt-5 border border-gray-200 bg-white p-5">
      <h3 className="text-xl font-semibold text-[#052656]">
        Compartilhamento com o cliente
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        {application.vaga?.titulo ?? "Sem vaga vinculada"} ·{" "}
        {application.vaga?.empresa_cliente?.nome ?? "Empresa não vinculada"}
      </p>
      <label className="mt-4 block">
        <span className="font-semibold">Liberar candidato para o cliente</span>
        <select
          value={release ? "sim" : "nao"}
          onChange={(e) => setRelease(e.target.value === "sim")}
          className={`${adminInputClass} mt-1`}
        >
          <option value="nao">Não</option>
          <option value="sim">Sim</option>
        </select>
      </label>
      {release && (
        <div className="mt-4 grid gap-4">
          <Text
            label="Resumo para o cliente"
            value={summary}
            set={setSummary}
          />
          <Text label="Pontos positivos" value={positives} set={setPositives} />
          <Text
            label="Pontos de atenção"
            value={attention}
            set={setAttention}
          />
          <label className="flex items-center gap-2 font-semibold">
            <input
              type="checkbox"
              checked={resume}
              onChange={(e) => setResume(e.target.checked)}
            />
            Liberar currículo
          </label>
          <p className="text-xs text-gray-500">
            Observações internas e dados pessoais não são compartilhados.
          </p>
        </div>
      )}
      {message && (
        <p className="mt-4 font-semibold text-[#052656]">{message}</p>
      )}
      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className={`${adminButtonClass("primary")} mt-4`}
      >
        {saving ? "Salvando..." : "Salvar e compartilhar"}
      </button>
      {feedback && (
        <div className="mt-4 border-l-4 border-[#D4A62A] bg-amber-50 p-3 text-sm">
          <strong>Feedback do cliente:</strong>{" "}
          {feedback.decisao.replaceAll("_", " ")}
          <p>{feedback.comentario || "Sem comentário"}</p>
        </div>
      )}
    </section>
  );
}
function Text({
  label,
  value,
  set,
}: {
  label: string;
  value: string;
  set: (value: string) => void;
}) {
  return (
    <label>
      <span className="font-semibold">{label}</span>
      <textarea
        value={value}
        onChange={(e) => set(e.target.value)}
        rows={3}
        className={`${adminInputClass} mt-1`}
      />
    </label>
  );
}
