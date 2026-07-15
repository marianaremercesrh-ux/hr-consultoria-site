import { useState } from "react";
import { adminButtonClass } from "./AdminUI";
import { shareExistingApplications } from "../services/portalAdmin";
import { etapaLabel, type CandidaturaDetalhada } from "../types/candidates";

export default function BulkPortalShare({
  applications,
  onChanged,
}: {
  applications: CandidaturaDetalhada[];
  onChanged: () => Promise<void>;
}) {
  const [selected, setSelected] = useState<string[]>([]),
    [saving, setSaving] = useState(false),
    [message, setMessage] = useState("");
  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }
  async function share() {
    if (!selected.length || saving) return;
    setSaving(true);
    setMessage("");
    try {
      await shareExistingApplications(selected);
      setSelected([]);
      setMessage("Candidatos selecionados compartilhados com o cliente.");
      await onChanged();
    } catch (reason) {
      console.error("[Compartilhamento em lote]", reason);
      setMessage("Não foi possível compartilhar os candidatos selecionados.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className="mt-5 border border-gray-200 bg-gray-50 p-4">
      <h3 className="font-semibold text-[#052656]">
        Compartilhar candidatos existentes
      </h3>
      <div className="mt-3 grid gap-2">
        {applications.map((app) => (
          <label
            key={app.id}
            className="grid grid-cols-[auto_1fr] gap-x-3 border bg-white p-3"
          >
            <input
              type="checkbox"
              disabled={app.portal_liberado}
              checked={app.portal_liberado || selected.includes(app.id)}
              onChange={() => toggle(app.id)}
              className="mt-1"
            />
            <span>
              <strong>{app.candidato.nome}</strong>
              <span className="block text-sm text-gray-600">
                {app.vaga?.titulo ?? "Sem vaga vinculada"} ·{" "}
                {etapaLabel(app.etapa)} ·{" "}
                {app.portal_liberado ? "Compartilhado" : "Não compartilhado"}
              </span>
            </span>
          </label>
        ))}
      </div>
      {message && (
        <p className="mt-3 font-semibold text-[#052656]">{message}</p>
      )}
      <button
        type="button"
        disabled={!selected.length || saving}
        onClick={() => void share()}
        className={`${adminButtonClass("primary")} mt-4`}
      >
        {saving
          ? "Compartilhando..."
          : "Compartilhar selecionados com o cliente"}
      </button>
    </section>
  );
}
