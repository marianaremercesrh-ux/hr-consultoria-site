import { useEffect, useState } from "react";
import { listEntrevistas } from "../services/ats";
import type { Entrevista } from "../types/ats";
import type { Job } from "../types/jobs";

export default function ATSOverview({ jobs: _jobs, candidates: _candidates }: { jobs: Job[]; candidates: number }) {
  const [interviews, setInterviews] = useState<Entrevista[]>([]);

  useEffect(() => {
    void listEntrevistas().then(setInterviews).catch(() => undefined);
  }, []);

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const weekEnd = new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10);
  const todayItems = interviews.filter((item) => item.data === today);
  const weekItems = interviews.filter((item) => item.data >= today && item.data <= weekEnd);
  const nextItems = interviews.filter((item) => item.data >= today).slice(0, 5);

  return <section className="mt-8 border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
    <h2 className="text-2xl font-semibold text-[#052656]">Entrevistas</h2>
    <div className="mt-5 grid gap-4 sm:grid-cols-3">
      <Metric label="Hoje" value={String(todayItems.length)}/>
      <Metric label="Nesta semana" value={String(weekItems.length)}/>
      <Metric label="Próximas" value={String(nextItems.length)}/>
    </div>
    {nextItems.length > 0 && <div className="mt-5 space-y-2">{nextItems.map((item) => <p key={item.id} className="border-t pt-2"><strong>{item.candidato?.nome}</strong> · {new Intl.DateTimeFormat("pt-BR").format(new Date(`${item.data}T12:00`))} às {item.horario.slice(0, 5)}</p>)}</div>}
    <a href="/admin/agenda" className="mt-5 inline-block font-semibold text-[#052656] underline">Abrir agenda</a>
  </section>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="bg-[#F5F7FA] p-5"><p className="text-sm text-gray-500">{label}</p><strong className="mt-2 block text-2xl text-[#052656]">{value}</strong></div>;
}
