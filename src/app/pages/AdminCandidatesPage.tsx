import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  FilterX,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";
import AdminNav from "../components/AdminNav";
import { EtapaBadge } from "../components/ApplicationStageControl";
import {
  AdminNotice,
  AdminSkeleton,
  ConfirmDialog,
  adminButtonClass,
  adminInputClass,
  adminTableHeadClass,
  adminTableRowClass,
} from "../components/AdminUI";
import { useAdminSession } from "../hooks/useAdminSession";
import {
  listApplicationsForCandidateReport,
  type JobSummaryApplicationRow,
} from "../services/applications";
import {
  deleteCandidate,
  listCandidates,
  listCandidatesForReport,
} from "../services/candidates";
import {
  listJobsForCandidateReport,
  type CandidateReportJob,
} from "../services/jobs";
import {
  downloadCandidatesExcel,
  downloadCandidatesPdf,
  reportStatus,
  type CandidateReportKind,
  type CandidateReportRow,
} from "../services/candidateReports";
import { deleteResume } from "../services/storage";
import UnlinkedCandidatesPanel from "../components/UnlinkedCandidatesPanel";
import {
  ETAPAS,
  etapaLabel,
  type CandidatoComTotal,
  type EtapaProcesso,
} from "../types/candidates";

export default function AdminCandidatesPage() {
  const checkingSession = useAdminSession();
  const [candidates, setCandidates] = useState<CandidatoComTotal[]>([]);
  const [latestStages, setLatestStages] = useState<
    Record<string, EtapaProcesso>
  >({});
  const [applications, setApplications] = useState<JobSummaryApplicationRow[]>(
    [],
  );
  const [jobs, setJobs] = useState<CandidateReportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [processFilter, setProcessFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [candidateToDelete, setCandidateToDelete] =
    useState<CandidatoComTotal | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reportMenuOpen, setReportMenuOpen] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportKind, setReportKind] = useState<CandidateReportKind>("resumido");
  const [includeContact, setIncludeContact] = useState(false);

  async function load() {
    setError("");
    try {
      const [people, applicationRows, jobRows] = await Promise.all([
        listCandidates(),
        listApplicationsForCandidateReport(),
        listJobsForCandidateReport(),
      ]);
      setCandidates(people);
      const latestByCandidate: Record<string, EtapaProcesso> = {};
      applicationRows.forEach((item) => {
        latestByCandidate[item.candidato_id] ??= item.etapa;
      });
      setLatestStages(latestByCandidate);
      setApplications(applicationRows);
      setJobs(jobRows);
    } catch (loadError) {
      if (import.meta.env.DEV) console.error(loadError);
      setError(
        "Não foi possível carregar os candidatos. Confirme a configuração do módulo no Supabase.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (!checkingSession) void load();
  }, [checkingSession]);

  const cities = [
    ...new Set(candidates.map((item) => item.cidade).filter(Boolean)),
  ];
  const companies = [
    ...new Set(
      jobs
        .map((job) => job.empresa)
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const jobsById = useMemo(
    () => new Map(jobs.map((job) => [String(job.id), job])),
    [jobs],
  );
  const selectedApplications = useMemo(
    () =>
      new Map(
        candidates.map((candidate) => [
          candidate.id,
          selectApplication(
            candidate.id,
            applications,
            jobsById,
            companyFilter,
            jobFilter,
            statusFilter,
          ),
        ]),
      ),
    [
      candidates,
      applications,
      jobsById,
      companyFilter,
      jobFilter,
      statusFilter,
    ],
  );
  const candidatesWithApplication=new Set(applications.map(item=>item.candidato_id)).size;
  const sharedApplications=applications.filter(item=>item.portal_liberado).length;
  const filtered = useMemo(
    () =>
      candidates.filter((item) => {
        const matchesQuery = `${item.nome} ${item.telefone ?? ""}`
          .toLocaleLowerCase("pt-BR")
          .includes(query.toLocaleLowerCase("pt-BR"));
        const matchesCity = !city || item.cidade === city;
        const matchesProcess =
          !processFilter ||
          (processFilter === "com"
            ? item.total_processos > 0
            : item.total_processos === 0);
        const selectedApplication = selectedApplications.get(item.id);
        const matchesApplication =
          statusFilter === "sem_processo"
            ? !applications.some(
                (application) => application.candidato_id === item.id,
              )
            : (!companyFilter && !jobFilter && !statusFilter) ||
              Boolean(selectedApplication);
        const createdDate = item.created_at.slice(0, 10);
        return (
          matchesQuery &&
          matchesCity &&
          matchesProcess &&
          matchesApplication &&
          (!periodFrom || createdDate >= periodFrom) &&
          (!periodTo || createdDate <= periodTo)
        );
      }),
    [
      candidates,
      query,
      city,
      processFilter,
      companyFilter,
      jobFilter,
      statusFilter,
      periodFrom,
      periodTo,
      selectedApplications,
      applications,
    ],
  );

  function clearFilters() {
    setQuery("");
    setCity("");
    setProcessFilter("");
    setStatusFilter("");
    setCompanyFilter("");
    setJobFilter("");
    setPeriodFrom("");
    setPeriodTo("");
  }

  async function generateReport(format: "pdf" | "excel") {
    if (generatingReport) return;
    setGeneratingReport(true);
    setReportMenuOpen(false);
    setError("");
    setMessage("");
    try {
      const [freshCandidates, freshApplications, freshJobs] = await Promise.all(
        [
          listCandidatesForReport(includeContact, Boolean(city)),
          listApplicationsForCandidateReport(),
          listJobsForCandidateReport(),
        ],
      );
      const freshJobsById = new Map(
        freshJobs.map((job) => [String(job.id), job]),
      );
      const freshFiltered = freshCandidates.filter((candidate) => {
        const matchesQuery = `${candidate.nome} ${candidate.telefone ?? ""}`
          .toLocaleLowerCase("pt-BR")
          .includes(query.toLocaleLowerCase("pt-BR"));
        const matchesCity = !city || candidate.cidade === city;
        const matchesProcess =
          !processFilter ||
          (processFilter === "com"
            ? candidate.total_processos > 0
            : candidate.total_processos === 0);
        const selectedApplication = selectApplication(
          candidate.id,
          freshApplications,
          freshJobsById,
          companyFilter,
          jobFilter,
          statusFilter,
        );
        const createdDate = candidate.created_at.slice(0, 10);
        const matchesApplication =
          statusFilter === "sem_processo"
            ? !freshApplications.some(
                (application) => application.candidato_id === candidate.id,
              )
            : (!companyFilter && !jobFilter && !statusFilter) ||
              Boolean(selectedApplication);
        return (
          matchesQuery &&
          matchesCity &&
          matchesProcess &&
          matchesApplication &&
          (!periodFrom || createdDate >= periodFrom) &&
          (!periodTo || createdDate <= periodTo)
        );
      });
      if (freshFiltered.length === 0) {
        setError("Nenhum candidato encontrado para gerar o relatório");
        return;
      }
      const rows: CandidateReportRow[] = freshFiltered.map((candidate) => {
        const application = selectApplication(
          candidate.id,
          freshApplications,
          freshJobsById,
          companyFilter,
          jobFilter,
          statusFilter,
        );
        return {
          nome: candidate.nome,
          vaga:
            application?.vaga_id == null
              ? "Sem processo"
              : freshJobsById.get(String(application.vaga_id))?.titulo ||
                "Vaga indisponível",
          status: reportStatus(application?.etapa),
          cadastro: new Intl.DateTimeFormat("pt-BR").format(
            new Date(candidate.created_at),
          ),
          analise:
            candidate.observacoes ||
            application?.observacoes ||
            "Nenhuma análise registrada.",
          ...(includeContact
            ? {
                telefone: candidate.telefone || "Não informado",
                linkedin: candidate.linkedin || "Não informado",
              }
            : {}),
        };
      });
      const filters = [
        query && `Busca: ${query}`,
        city && `Cidade: ${city}`,
        companyFilter && `Empresa: ${companyFilter}`,
        jobFilter &&
          `Vaga: ${freshJobsById.get(jobFilter)?.titulo || jobFilter}`,
        processFilter &&
          `Processos: ${processFilter === "com" ? "Com processo" : "Sem processo"}`,
        statusFilter &&
          `Status: ${statusFilter === "sem_processo" ? "Sem processo" : etapaLabel(statusFilter as EtapaProcesso)}`,
        periodFrom && `Cadastro desde: ${formatDate(periodFrom)}`,
        periodTo && `Cadastro até: ${formatDate(periodTo)}`,
      ].filter(Boolean) as string[];
      if (format === "pdf")
        await downloadCandidatesPdf(rows, filters, reportKind, includeContact);
      else await downloadCandidatesExcel(rows, reportKind, includeContact);
      setMessage(
        `Relatório em ${format === "pdf" ? "PDF" : "Excel"} gerado com sucesso.`,
      );
    } catch (reason) {
      console.error(
        "[Relatório de candidatos] Não foi possível gerar o arquivo",
        reason,
      );
      setError(
        "Não foi possível concluir o download do relatório. Tente novamente.",
      );
    } finally {
      setGeneratingReport(false);
    }
  }

  async function remove() {
    if (!candidateToDelete) return;
    const candidate = candidateToDelete;
    setDeleting(true);
    setError("");
    setMessage("");
    try {
      if (candidate.curriculo_url) await deleteResume(candidate.curriculo_url);
      await deleteCandidate(candidate.id);
      setMessage("Candidato excluído com sucesso.");
      setCandidateToDelete(null);
      await load();
    } catch (removeError) {
      if (import.meta.env.DEV) console.error(removeError);
      setError("Não foi possível excluir o candidato.");
    } finally {
      setDeleting(false);
    }
  }

  if (checkingSession) return <Loading />;
  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <AdminNav />
      <section className="mx-auto max-w-7xl px-5 py-10">
        <a href="/admin" className={`${adminButtonClass("secondary")} mb-6`}>
          <ArrowLeft size={17} aria-hidden="true" />
          Dashboard
        </a>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#052656]">
              Candidatos
            </h1>
            <p className="mt-2 text-gray-600">
              Cadastro e acompanhamento dos profissionais.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <a
              href="/admin/candidatos/novo"
              className={`${adminButtonClass("primary")} w-full sm:w-auto`}
            >
              <UserRound size={17} />
              Novo candidato
            </a>
            <div
              className="relative w-full sm:w-auto"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  setReportMenuOpen(false);
              }}
            >
              <button
                type="button"
                disabled={generatingReport}
                onClick={() => setReportMenuOpen((open) => !open)}
                aria-haspopup="dialog"
                aria-expanded={reportMenuOpen}
                className={`${adminButtonClass("secondary")} w-full sm:w-auto`}
              >
                <Download size={17} />
                {generatingReport ? "Gerando..." : "Baixar relatório"}
                <ChevronDown size={15} />
              </button>
              {reportMenuOpen && !generatingReport && (
                <div
                  role="dialog"
                  aria-label="Opções do relatório"
                  className="absolute right-0 z-30 mt-2 w-[min(92vw,320px)] border border-gray-200 bg-white p-4 shadow-xl"
                >
                  <p className="font-semibold text-[#052656]">
                    {filtered.length}{" "}
                    {filtered.length === 1
                      ? "candidato será incluído"
                      : "candidatos serão incluídos"}
                  </p>
                  <label className="mt-4 block">
                    <span className="mb-2 block text-sm font-semibold text-[#052656]">
                      Tipo do relatório
                    </span>
                    <select
                      value={reportKind}
                      onChange={(event) =>
                        setReportKind(event.target.value as CandidateReportKind)
                      }
                      className={adminInputClass}
                    >
                      <option value="resumido">Relatório resumido</option>
                      <option value="completo">Relatório completo</option>
                    </select>
                  </label>
                  <label className="mt-4 flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={includeContact}
                      onChange={(event) =>
                        setIncludeContact(event.target.checked)
                      }
                      className="mt-1 h-4 w-4 accent-[#052656]"
                    />
                    <span>
                      <strong className="block text-[#052656]">
                        Incluir dados de contato
                      </strong>
                      Telefone e LinkedIn não serão consultados nem exibidos se
                      esta opção estiver desmarcada.
                    </span>
                  </label>
                  <div className="mt-4 grid gap-2">
                    <button
                      type="button"
                      onClick={() => void generateReport("pdf")}
                      className={adminButtonClass("primary")}
                    >
                      <FileText size={18} />
                      Baixar em PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => void generateReport("excel")}
                      className={adminButtonClass("secondary")}
                    >
                      <FileSpreadsheet size={18} />
                      Baixar em Excel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {message && <AdminNotice>{message}</AdminNotice>}
        {error && <AdminNotice type="error">{error}</AdminNotice>}
        {!loading&&<div className="mt-8 grid gap-4 sm:grid-cols-3"><Summary label="Candidatos com candidatura" value={candidatesWithApplication}/><Summary label="Candidatos sem vaga" value={candidates.length-candidatesWithApplication}/><Summary label="Candidaturas compartilhadas" value={sharedApplications}/></div>}
        <div className="mt-8 border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label>
              <span className="mb-2 block font-semibold text-[#052656]">
                Buscar por nome ou telefone
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className={adminInputClass}
              />
            </label>
            <label>
              <span className="mb-2 block font-semibold text-[#052656]">
                Filtrar por cidade
              </span>
              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className={adminInputClass}
              >
                <option value="">Todas as cidades</option>
                {cities.map((value) => (
                  <option key={value ?? ""}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-2 block font-semibold text-[#052656]">
                Empresa ou cliente
              </span>
              <select
                value={companyFilter}
                onChange={(event) => {
                  setCompanyFilter(event.target.value);
                  setJobFilter("");
                }}
                className={adminInputClass}
              >
                <option value="">Todas as empresas</option>
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-2 block font-semibold text-[#052656]">
                Vaga
              </span>
              <select
                value={jobFilter}
                onChange={(event) => setJobFilter(event.target.value)}
                className={adminInputClass}
              >
                <option value="">Todas as vagas</option>
                {jobs
                  .filter(
                    (job) => !companyFilter || job.empresa === companyFilter,
                  )
                  .map((job) => (
                    <option key={job.id} value={String(job.id)}>
                      {job.titulo}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              <span className="mb-2 block font-semibold text-[#052656]">
                Filtrar por processos
              </span>
              <select
                value={processFilter}
                onChange={(event) => setProcessFilter(event.target.value)}
                className={adminInputClass}
              >
                <option value="">Todos</option>
                <option value="com">Com processo</option>
                <option value="sem">Sem processo</option>
              </select>
            </label>
            <label>
              <span className="mb-2 block font-semibold text-[#052656]">
                Filtrar por status
              </span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className={adminInputClass}
              >
                <option value="">Todos os status</option>
                <option value="sem_processo">Sem processo</option>
                {ETAPAS.map((stage) => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-2 block font-semibold text-[#052656]">
                Cadastro a partir de
              </span>
              <input
                type="date"
                value={periodFrom}
                onChange={(event) => setPeriodFrom(event.target.value)}
                className={adminInputClass}
              />
            </label>
            <label>
              <span className="mb-2 block font-semibold text-[#052656]">
                Cadastro até
              </span>
              <input
                type="date"
                value={periodTo}
                onChange={(event) => setPeriodTo(event.target.value)}
                className={adminInputClass}
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className={adminButtonClass("secondary")}
            >
              <FilterX size={17} />
              Limpar filtros
            </button>
          </div>
        </div>
        {!loading&&<UnlinkedCandidatesPanel candidates={candidates} jobs={jobs} onChanged={load}/>}
        {loading ? (
          <div className="mt-8">
            <AdminSkeleton rows={4} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="mt-8 bg-white p-8 text-center text-gray-600">
            Nenhum candidato encontrado.
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[1050px] text-left">
              <thead className={adminTableHeadClass}>
                <tr>
                  {[
                    "Nome",
                    "Telefone",
                    "Cidade",
                    "LinkedIn",
                    "Processos",
                    "Status",
                    "Cadastro",
                    "Ações",
                  ].map((title) => (
                    <th key={title} className="px-4 py-3">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((candidate) => {
                  const stage =
                    selectedApplications.get(candidate.id)?.etapa ??
                    latestStages[candidate.id];
                  return (
                    <tr key={candidate.id} className={adminTableRowClass}>
                      <td className="px-4 py-4 font-semibold text-[#052656]">
                        {candidate.nome}
                      </td>
                      <td className="px-4 py-4">{candidate.telefone || "—"}</td>
                      <td className="px-4 py-4">{candidate.cidade || "—"}</td>
                      <td className="px-4 py-4">
                        {candidate.linkedin ? (
                          <a
                            href={candidate.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#052656] underline"
                          >
                            Abrir
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-4">{candidate.total_processos}</td>
                      <td className="px-4 py-4">
                        {stage ? (
                          <EtapaBadge etapa={stage} />
                        ) : (
                          <span className="text-sm text-gray-500">
                            Sem processo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {new Intl.DateTimeFormat("pt-BR").format(
                          new Date(candidate.created_at),
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={`/admin/candidatos/${candidate.id}`}
                            className={adminButtonClass("secondary")}
                          >
                            <UserRound size={15} />
                            Ver perfil
                          </a>
                          <a
                            href={`/admin/candidatos/${candidate.id}/editar`}
                            className={adminButtonClass("primary")}
                          >
                            <Pencil size={15} />
                            Editar
                          </a>
                          <button
                            type="button"
                            onClick={() => setCandidateToDelete(candidate)}
                            className={adminButtonClass("danger")}
                          >
                            <Trash2 size={15} />
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <ConfirmDialog
        open={Boolean(candidateToDelete)}
        title="Excluir candidato"
        description={`Tem certeza que deseja excluir “${candidateToDelete?.nome ?? ""}”? Os vínculos com processos também serão removidos.`}
        loading={deleting}
        onCancel={() => setCandidateToDelete(null)}
        onConfirm={() => void remove()}
      />
    </main>
  );
}

function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#052656] text-white">
      Verificando acesso...
    </main>
  );
}
function Summary({label,value}:{label:string;value:number}){return <article className="border-l-4 border-[#D4A62A] bg-white p-5 shadow-sm"><strong className="text-3xl text-[#052656]">{value}</strong><p className="text-sm text-gray-600">{label}</p></article>}

function selectApplication(
  candidateId: string,
  applications: JobSummaryApplicationRow[],
  jobsById: Map<string, CandidateReportJob>,
  company: string,
  jobId: string,
  status: string,
) {
  const candidateApplications = applications.filter(
    (application) => application.candidato_id === candidateId,
  );
  if (status === "sem_processo") return undefined;
  return candidateApplications.find((application) => {
    const job =
      application.vaga_id == null
        ? undefined
        : jobsById.get(String(application.vaga_id));
    return (
      (!company || job?.empresa === company) &&
      (!jobId || String(application.vaga_id) === jobId) &&
      (!status || application.etapa === status)
    );
  });
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(`${value}T12:00:00Z`),
  );
}
