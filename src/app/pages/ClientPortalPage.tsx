import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  UsersRound,
} from "lucide-react";
import ClientLayout from "../components/ClientLayout";
import ClientDocuments from "../components/ClientDocuments";
import { clientPortalSupabase as supabase } from "../lib/clientPortalSupabase";
import {
  getClientContext,
  listClientFeedbacks,
  listPortalApplications,
  listPortalCandidates,
  listPortalInterviews,
  listPortalJobs,
  saveClientFeedback,
  signedPortalResume,
} from "../services/clientPortal";
import { etapaLabel } from "../types/candidates";
import { formatarQuantidadeVagas } from "../lib/formatarQuantidadeVagas";
import type {
  ClientCompany,
  ClientDecision,
  ClientFeedback,
  CompanyUser,
  PortalApplication,
  PortalCandidate,
  PortalInterview,
  PortalJob,
} from "../types/clientPortal";
type Data = {
  links: CompanyUser[];
  companies: ClientCompany[];
  jobs: PortalJob[];
  applications: PortalApplication[];
  candidates: PortalCandidate[];
  interviews: PortalInterview[];
  feedbacks: ClientFeedback[];
};
export default function ClientPortalPage() {
  const [data, setData] = useState<Data | null>(null),
    [companyId, setCompanyId] = useState(
      localStorage.getItem("portal_company") ?? "",
    ),
    [loading, setLoading] = useState(true),
    [refreshing, setRefreshing] = useState(false),
    [error, setError] = useState("");
  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/cliente/login";
        return;
      }
      const { data: profile } = await supabase
        .from("perfis_usuarios")
        .select("perfil")
        .eq("usuario_id", session.user.id)
        .maybeSingle();
      if (profile && ["administrador", "recrutador"].includes(profile.perfil)) {
        window.location.href = "/admin";
        return;
      }
      const context = await getClientContext();
      if (!context.links.length) {
        window.location.href = "/cliente/login?unauthorized=1";
        return;
      }
      const selected = context.companies.some((x) => x.id === companyId)
        ? companyId
        : context.companies[0].id;
      setCompanyId(selected);
      localStorage.setItem("portal_company", selected);
      const jobs = await listPortalJobs(selected);
      const ids = jobs.map((x) => x.id);
      const [applications, interviews] = await Promise.all([
        listPortalApplications(ids),
        listPortalInterviews(ids),
      ]);
      const [candidates, feedbacks] = await Promise.all([
        listPortalCandidates([...new Set(applications.map((x) => x.candidato_id))]),
        listClientFeedbacks(applications.map((x) => x.id)),
      ]);
      setData({
        ...context,
        jobs,
        applications,
        candidates,
        interviews,
        feedbacks,
      });
    } catch (reason) {
      console.error("[Portal do Cliente]", reason);
      setError("Não foi possível carregar as informações. Tente atualizar.");
    } finally {
      if (background) setRefreshing(false); else setLoading(false);
    }
  }, [companyId]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(()=>{const refresh=()=>void load(true);const visible=()=>{if(document.visibilityState==="visible")refresh()};window.addEventListener("focus",refresh);document.addEventListener("visibilitychange",visible);return()=>{window.removeEventListener("focus",refresh);document.removeEventListener("visibilitychange",visible)}},[load]);
  if (loading) return <Loading />;
  if (error || !data)
    return <ErrorPage message={error || "Acesso não encontrado."} onRetry={()=>void load()} />;
  const company =
    data.companies.find((x) => x.id === companyId) ?? data.companies[0];
  function changeCompany(id: string) {
    localStorage.setItem("portal_company", id);
    setCompanyId(id);
  }
  return (
    <ClientLayout
      company={company}
      companies={data.companies}
      onCompany={changeCompany}
    >
      <div className="mx-auto flex max-w-7xl justify-end px-5 pt-5"><button type="button" disabled={refreshing} onClick={()=>void load(true)} className="border border-[#052656] px-4 py-2 font-semibold text-[#052656] disabled:opacity-60">{refreshing?"Atualizando...":"Atualizar informações"}</button></div>
      <RouteContent data={data} company={company} onReload={load} />
    </ClientLayout>
  );
}
function RouteContent({
  data,
  company,
  onReload,
}: {
  data: Data;
  company: ClientCompany;
  onReload: () => Promise<void>;
}) {
  const path = window.location.pathname;
  const jobMatch = path.match(/^\/cliente\/vagas\/([^/]+)$/);
  const candidateMatch = path.match(/^\/cliente\/candidatos\/([^/]+)$/);
  if (path === "/cliente/documentos")
    return <ClientDocuments companyId={company.id} />;
  if (jobMatch)
    return <JobDetail id={decodeURIComponent(jobMatch[1])} data={data} />;
  if (candidateMatch)
    return (
      <CandidateDetail
        id={decodeURIComponent(candidateMatch[1])}
        data={data}
        company={company}
        onReload={onReload}
      />
    );
  if (path === "/cliente/vagas") return <Jobs data={data} />;
  return <Overview data={data} company={company} />;
}
function Overview({ data, company }: { data: Data; company: ClientCompany }) {
  const open = data.jobs.filter((x) => x.status === "publicada"),
    scheduled = data.interviews.filter((x) =>
      ["agendada", "confirmada", "reagendada"].includes(x.status),
    );
  return (
    <section className="mx-auto max-w-7xl px-5 py-10">
      <h1 className="text-3xl font-semibold text-[#052656]">
        Olá, {company.nome}
      </h1>
      <p className="mt-2 text-gray-600">
        Visão geral dos processos compartilhados pela HR Consultoria.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          icon={<BriefcaseBusiness />}
          label="Vagas abertas"
          value={open.length}
        />
        <Metric
          icon={<UsersRound />}
          label="Posições em aberto"
          value={open.reduce((n, x) => n + Number(x.quantidade_vagas || 0), 0)}
        />
        <Metric
          icon={<FileText />}
          label="Candidatos encaminhados"
          value={data.applications.length}
        />
        <Metric
          icon={<CalendarDays />}
          label="Entrevistas agendadas"
          value={scheduled.length}
        />
        <Metric
          icon={<CheckCircle2 />}
          label="Aprovados"
          value={
            data.applications.filter((x) =>
              ["aprovado", "contratado"].includes(x.etapa),
            ).length
          }
        />
      </div>
      <h2 className="mt-10 text-2xl font-semibold text-[#052656]">
        Vagas em andamento
      </h2>
      <JobCards
        jobs={data.jobs.filter((x) => x.status !== "encerrada")}
        applications={data.applications}
      />
      <RecentUpdates data={data} />
    </section>
  );
}
function RecentUpdates({ data }: { data: Data }) {
  const [job, setJob] = useState(""),
    [status, setStatus] = useState(""),
    [all, setAll] = useState(false);
  const items = useMemo(
    () =>
      data.applications
        .filter(
          (x) =>
            (!job || String(x.vaga_id) === job) &&
            (!status || x.etapa === status),
        )
        .sort(
          (a, b) =>
            new Date(latestUpdate(b, data.interviews)).getTime() -
            new Date(latestUpdate(a, data.interviews)).getTime(),
        ),
    [data, job, status],
  );
  return (
    <section>
      <h2 className="mt-10 text-2xl font-semibold text-[#052656]">
        Atualizações recentes
      </h2>
      <div className="mt-4 grid gap-3 bg-white p-4 sm:grid-cols-2">
        <label>
          <span className="text-sm font-semibold">Filtrar por vaga</span>
          <select
            value={job}
            onChange={(e) => setJob(e.target.value)}
            className="mt-1 w-full border p-2"
          >
            <option value="">Todas</option>
            {data.jobs.map((x) => (
              <option key={x.id} value={x.id}>
                {x.titulo}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-sm font-semibold">Filtrar por status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 w-full border p-2"
          >
            <option value="">Todos</option>
            {[...new Set(data.applications.map((x) => x.etapa))].map((x) => (
              <option key={x} value={x}>
                {etapaLabel(x)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {items.slice(0, all ? items.length : 6).map((app) => {
          const candidate = data.candidates.find(
              (x) => x.id === app.candidato_id,
            ),
            vacancy = data.jobs.find(
              (x) => String(x.id) === String(app.vaga_id),
            ),
            interview = data.interviews.find(
              (x) => x.candidatura_id === app.id,
            );
          return (
            <article
              key={app.id}
              className="border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-[#052656]">
                {candidate?.nome ?? "Candidato"}
              </h3>
              <p className="font-medium">
                {vacancy?.titulo ?? "Vaga não encontrada"}
              </p>
              <p className="mt-2">
                Status: <strong>{interviewStatus(interview, app)}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Atualizado em {formatDate(latestUpdate(app, data.interviews))}
              </p>
              {app.resumo_cliente&&<p className="mt-3 text-gray-700"><strong>Resumo:</strong> {app.resumo_cliente}</p>}
              {app.pontos_positivos_cliente&&<p className="mt-2 text-gray-700"><strong>Pontos positivos:</strong> {app.pontos_positivos_cliente}</p>}
              {app.pontos_atencao_cliente&&<p className="mt-2 text-gray-700"><strong>Pontos de atenção:</strong> {app.pontos_atencao_cliente}</p>}
              {interview && (
                <div className="mt-3 bg-[#D4A62A]/15 p-3">
                  <strong>
                    Entrevista com o cliente: {interviewLabel(interview.status)}
                  </strong>
                  <p>
                    {interview.modalidade === "presencial"
                      ? "Presencial"
                      : "Online"}
                    : {formatDate(interview.data)} às{" "}
                    {interview.horario.slice(0, 5)}
                  </p>
                  {interview.local && (
                    <p>
                      {interview.modalidade === "presencial"
                        ? "Local"
                        : "Link/local"}
                      : {interview.local}
                    </p>
                  )}
                </div>
              )}
              {app.data_admissao && (
                <p className="mt-3 font-semibold text-[#052656]">
                  Data de admissão: {formatDate(app.data_admissao)}
                </p>
              )}
              <a
                href={`/cliente/candidatos/${app.candidato_id}?vaga=${app.vaga_id}`}
                className="mt-4 inline-flex bg-[#D4A62A] px-4 py-2 font-semibold text-[#052656]"
              >
                Ver candidato
              </a>
            </article>
          );
        })}
        {!items.length && (
          <Empty text="Nenhum candidato compartilhado corresponde aos filtros." />
        )}
      </div>
      {items.length > 6 && (
        <button
          onClick={() => setAll(!all)}
          className="mt-5 border border-[#052656] px-4 py-2 font-semibold text-[#052656]"
        >
          {all ? "Mostrar menos" : "Ver todas"}
        </button>
      )}
    </section>
  );
}
function latestUpdate(app: PortalApplication, interviews: PortalInterview[]) {
  const interview = interviews.find((x) => x.candidatura_id === app.id);
  return interview && interview.updated_at > app.updated_at
    ? interview.updated_at
    : app.updated_at;
}
function interviewLabel(status: string) {
  return (
    (
      {
        solicitada: "solicitada",
        agendada: "agendada",
        confirmada: "confirmada",
        reagendada: "reagendada",
        realizada: "realizada",
        cancelada: "cancelada",
        nao_compareceu: "não compareceu",
      } as Record<string, string>
    )[status] ?? status
  );
}
function interviewStatus(
  interview: PortalInterview | undefined,
  app: PortalApplication,
) {
  if (
    interview &&
    [
      "solicitada",
      "agendada",
      "confirmada",
      "reagendada",
      "realizada",
      "cancelada",
      "nao_compareceu",
    ].includes(interview.status)
  )
    return `Entrevista com o cliente ${interviewLabel(interview.status)}`;
  return etapaLabel(app.etapa);
}
function Jobs({ data }: { data: Data }) {
  const [query, setQuery] = useState(""),
    [status, setStatus] = useState(""),
    [from, setFrom] = useState("");
  const filtered = data.jobs.filter(
    (x) =>
      (!query || x.titulo.toLowerCase().includes(query.toLowerCase())) &&
      (!status || x.status === status) &&
      (!from || x.created_at.slice(0, 10) >= from),
  );
  return (
    <section className="mx-auto max-w-7xl px-5 py-10">
      <h1 className="text-3xl font-semibold text-[#052656]">Vagas</h1>
      <div className="mt-6 grid gap-4 bg-white p-5 shadow-sm md:grid-cols-3">
        <Field label="Pesquisar">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border p-3"
          />
        </Field>
        <Field label="Status">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border p-3"
          >
            <option value="">Todos</option>
            <option value="publicada">Aberta</option>
            <option value="rascunho">Em preparação</option>
            <option value="encerrada">Encerrada</option>
          </select>
        </Field>
        <Field label="Abertas desde">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full border p-3"
          />
        </Field>
      </div>
      <JobCards jobs={filtered} applications={data.applications} />
    </section>
  );
}
function JobCards({
  jobs,
  applications,
}: {
  jobs: PortalJob[];
  applications: PortalApplication[];
}) {
  return (
    <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => (
        <article
          key={job.id}
          className="border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-xl font-semibold text-[#052656]">{job.titulo}</h3>
          <p className="mt-2 text-gray-600">
            {formatarQuantidadeVagas(job.quantidade_vagas)} ·{" "}
            <span className="capitalize">{job.status}</span>
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Aberta em {formatDate(job.created_at)}
          </p>
          <p className="mt-4 font-semibold text-[#052656]">
            {
              applications.filter((x) => String(x.vaga_id) === String(job.id))
                .length
            }{" "}
            candidatos encaminhados
          </p>
          <a
            href={`/cliente/vagas/${job.id}`}
            className="mt-5 inline-flex bg-[#D4A62A] px-4 py-2 font-semibold text-[#052656]"
          >
            Ver processo
          </a>
        </article>
      ))}
      {!jobs.length && <Empty text="Nenhuma vaga encontrada." />}
    </div>
  );
}
function JobDetail({ id, data }: { id: string; data: Data }) {
  const job = data.jobs.find((x) => String(x.id) === id);
  if (!job) return <NotFound />;
  const applications = data.applications.filter(
    (x) => String(x.vaga_id) === id,
  );
  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <a
        href="/cliente/vagas"
        className="inline-flex items-center gap-2 font-semibold text-[#052656]"
      >
        <ArrowLeft size={17} />
        Vagas
      </a>
      <h1 className="mt-6 text-3xl font-semibold text-[#052656]">
        {job.titulo}
      </h1>
      <p className="mt-2 text-gray-600">
        {formatarQuantidadeVagas(job.quantidade_vagas)} · {job.cidade}/
        {job.estado} · {job.status}
      </p>
      <div className="mt-6 grid gap-5 bg-white p-6 shadow-sm md:grid-cols-2">
        <Info title="Descrição" text={job.descricao} />
        <Info title="Atividades" text={job.atividades} />
        <Info title="Requisitos" text={job.requisitos} />
        <Info title="Benefícios" text={job.beneficios} />
      </div>
      <h2 className="mt-10 text-2xl font-semibold text-[#052656]">
        Candidatos compartilhados
      </h2>
      <div className="mt-5 grid gap-4">
        {applications.map((app) => {
          const candidate = data.candidates.find(
              (x) => x.id === app.candidato_id,
            ),
            interview = data.interviews.find(
              (x) => x.candidatura_id === app.id,
            );
          return (
            <a
              key={app.id}
              href={`/cliente/candidatos/${app.candidato_id}?vaga=${id}`}
              className="border border-gray-200 bg-white p-5 shadow-sm hover:border-[#D4A62A]"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#052656]">
                    {candidate?.nome}
                  </h3>
                  <p className="text-gray-600">{etapaLabel(app.etapa)}</p>
                </div>
                {interview && (
                  <div className="text-right text-sm font-semibold text-[#052656]"><p className="flex items-center gap-2"><Clock3 size={16}/>{formatDate(interview.data)} às {interview.horario.slice(0,5)}</p><p>{interviewLabel(interview.status)} · {interview.modalidade==="presencial"?"Presencial":"Online"}</p>{interview.local&&<p>{interview.local}</p>}</div>
                )}
              </div>
              {app.data_admissao&&<p className="mt-3 font-semibold text-[#052656]">Data de admissão: {formatDate(app.data_admissao)}</p>}
            </a>
          );
        })}
        {!applications.length && (
          <Empty text="Nenhum candidato foi compartilhado para esta vaga." />
        )}
      </div>
    </section>
  );
}
function CandidateDetail({
  id,
  data,
  company,
  onReload,
}: {
  id: string;
  data: Data;
  company: ClientCompany;
  onReload: () => Promise<void>;
}) {
  const jobId = new URLSearchParams(window.location.search).get("vaga");
  const app = data.applications.find(
    (x) => x.candidato_id === id && (!jobId || String(x.vaga_id) === jobId),
  );
  const candidate = data.candidates.find((x) => x.id === id);
  const job = app
    ? data.jobs.find((x) => String(x.id) === String(app.vaga_id))
    : null;
  const feedback = app
    ? data.feedbacks.find((x) => x.candidatura_id === app.id)
    : null;
  const [decision, setDecision] = useState<ClientDecision>(
      feedback?.decisao ?? "quero_entrevistar",
    ),
    [comment, setComment] = useState(feedback?.comentario ?? ""),
    [saving, setSaving] = useState(false),
    [message, setMessage] = useState("");
  if (!app || !candidate || !job) return <NotFound />;
  const authorizedApp = app;
  const authorizedCandidate = candidate;
  const interview = data.interviews.find((x) => x.candidatura_id === app.id);
  async function save() {
    setSaving(true);
    setMessage("");
    try {
      await saveClientFeedback(authorizedApp.id, company.id, decision, comment);
      setMessage("Feedback enviado com sucesso. A HR Consultoria dará continuidade ao processo.");
      await onReload();
    } catch {
      setMessage("Não foi possível enviar o feedback.");
    } finally {
      setSaving(false);
    }
  }
  async function resume() {
    if (!authorizedCandidate.curriculo_url || !authorizedApp.curriculo_liberado) return;
    try {
      window.open(
        await signedPortalResume(authorizedCandidate.curriculo_url),
        "_blank",
        "noopener,noreferrer",
      );
    } catch {
      setMessage("Não foi possível abrir o currículo.");
    }
  }
  return (
    <section className="mx-auto max-w-5xl px-5 py-10">
      <a
        href={`/cliente/vagas/${job.id}`}
        className="inline-flex items-center gap-2 font-semibold text-[#052656]"
      >
        <ArrowLeft size={17} />
        {job.titulo}
      </a>
      <div className="mt-6 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-[#052656]">
          {candidate.nome}
        </h1>
        <p className="mt-2 text-gray-600">
          {job.titulo} · {etapaLabel(app.etapa)}
          {candidate.cidade
            ? ` · ${candidate.cidade}${candidate.estado ? `/${candidate.estado}` : ""}`
            : ""}
        </p>
        <div className="mt-7 grid gap-6 md:grid-cols-2">
          <Info title="Resumo profissional" text={app.resumo_cliente} />
          <Info title="Pontos positivos" text={app.pontos_positivos_cliente} />
          <Info title="Pontos de atenção" text={app.pontos_atencao_cliente} />
        </div>
        <p className="mt-6 text-sm text-gray-500">
          Encaminhado em {formatDate(app.portal_liberado_em ?? app.created_at)}
        </p>
        {interview && (
          <div className="mt-5 bg-[#D4A62A]/15 p-4">
            <strong>
              Entrevista com o cliente: {interviewLabel(interview.status)}
            </strong>
            <p>
              {formatDate(interview.data)} às {interview.horario.slice(0, 5)}
              {interview.local ? ` · ${interview.local}` : ""}
            </p>
          </div>
        )}
        {app.data_admissao && (
          <p className="mt-5 font-semibold text-[#052656]">
            Data de admissão: {formatDate(app.data_admissao)}
          </p>
        )}
        {app.curriculo_liberado && candidate.curriculo_url && (
          <button
            onClick={() => void resume()}
            className="mt-5 inline-flex items-center gap-2 border border-[#052656] px-4 py-2 font-semibold text-[#052656]"
          >
            <FileText size={17} />
            Abrir currículo
          </button>
        )}
      </div>
      <div className="mt-6 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-[#052656]">Seu feedback</h2>
        <Field label="Decisão">
          <select
            value={decision}
            onChange={(e) => setDecision(e.target.value as ClientDecision)}
            className="mt-2 w-full border p-3"
          >
            <option value="quero_entrevistar">Quero entrevistar</option>
            <option value="aprovado_empresa">Aprovado pela empresa</option>
            <option value="nao_aprovado">Não aprovado</option>
            <option value="solicitar_informacoes">
              Solicitar mais informações
            </option>
          </select>
        </Field>
        <Field label="Comentário opcional">
          <textarea
            rows={4}
            maxLength={2000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-2 w-full border p-3"
          />
          <span className="mt-1 block text-right text-xs text-gray-500">{comment.length}/2000</span>
        </Field>
        {message && <p className="mt-3 font-semibold">{message}</p>}
        <button
          disabled={saving}
          onClick={() => void save()}
          className="mt-4 bg-[#D4A62A] px-5 py-3 font-semibold text-[#052656] disabled:opacity-60"
        >
          {saving ? "Enviando..." : "Enviar feedback"}
        </button>
      </div>
    </section>
  );
}
function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <article className="border-l-4 border-[#D4A62A] bg-white p-5 shadow-sm">
      <span className="text-[#D4A62A]">{icon}</span>
      <strong className="mt-3 block text-3xl text-[#052656]">{value}</strong>
      <p className="text-sm text-gray-600">{label}</p>
    </article>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="block font-semibold text-[#052656]">{label}</span>
      {children}
    </label>
  );
}
function Info({
  title,
  text,
}: {
  title: string;
  text: string | null | undefined;
}) {
  return text ? (
    <div>
      <h2 className="font-semibold text-[#052656]">{title}</h2>
      <p className="mt-2 whitespace-pre-line leading-relaxed text-gray-700">
        {text}
      </p>
    </div>
  ) : null;
}
function Empty({ text }: { text: string }) {
  return (
    <p className="border border-dashed border-gray-300 bg-white p-6 text-gray-600">
      {text}
    </p>
  );
}
function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F7FA] text-[#052656]">
      Carregando Portal do Cliente...
    </main>
  );
}
function ErrorPage({ message,onRetry }: { message: string;onRetry:()=>void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F7FA] px-5">
      <div className="max-w-md bg-white p-8 text-center shadow">
        <h1 className="text-2xl font-semibold text-[#052656]">
          Não foi possível abrir o portal
        </h1>
        <p className="mt-3 text-gray-600">{message}</p>
        <button onClick={onRetry} className="mt-5 inline-block bg-[#D4A62A] px-5 py-3 font-semibold text-[#052656]">Tentar novamente</button>
      </div>
    </main>
  );
}
function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 text-center">
      <h1 className="text-3xl font-semibold text-[#052656]">
        Conteúdo não encontrado
      </h1>
      <p className="mt-3 text-gray-600">
        Este conteúdo não está disponível para sua empresa.
      </p>
      <a
        href="/cliente"
        className="mt-6 inline-block bg-[#D4A62A] px-5 py-3 font-semibold text-[#052656]"
      >
        Voltar à visão geral
      </a>
    </section>
  );
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}
