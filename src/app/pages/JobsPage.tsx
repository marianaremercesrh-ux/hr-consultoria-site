import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, BriefcaseBusiness, Building2, Clock3, LockKeyhole, Mail, MapPin, Menu, Search, WalletCards, X } from "lucide-react";
import { CONTACT_EMAIL, Logo, WhatsAppIcon, WHATSAPP_BUTTON_CLASS, whatsappLink } from "../App";
import { formatarQuantidadeVagasDisponiveis as availableJobsLabel, normalizarQuantidadeVagas } from "../lib/formatarQuantidadeVagas";
import { getPublishedJobBySlug, listPublishedJobs } from "../services/jobs";
import type { PublicJobRecord } from "../services/jobs";

type PublicJob = {
  slug: string;
  title: string;
  company?: string;
  city: string;
  contract: string;
  modality: string;
  salary?: string;
  summary: string;
  benefits: string[];
  description: string;
  activities: string[];
  requirements: string[];
  schedule: string;
  quantity: number;
};

const NAV_LINKS = [
  { label: "Início", href: "/#inicio" },
  { label: "Vagas", href: "/vagas" },
  { label: "Sobre", href: "/#sobre" },
  { label: "Serviços", href: "/#servicos" },
  { label: "Processo", href: "/#processo" },
  { label: "Contato", href: "/#contato" },
];

function splitJobText(value: string | null) {
  return (value ?? "").split(/\r?\n|;/).map((item) => item.trim()).filter(Boolean);
}

function toPublicJob(job: PublicJobRecord): PublicJob {
  return {
    slug: job.slug,
    title: job.titulo,
    company: job.empresa || undefined,
    city: [job.cidade, job.estado].filter(Boolean).join(", "),
    contract: job.tipo_contrato || "Não informado",
    modality: job.modalidade || "Não informada",
    salary: job.salario || undefined,
    summary: job.descricao || "Consulte os detalhes desta oportunidade.",
    benefits: splitJobText(job.beneficios),
    description: job.descricao || "",
    activities: splitJobText(job.atividades),
    requirements: splitJobText(job.requisitos),
    schedule: job.horario || "Não informado",
    quantity: normalizarQuantidadeVagas(job.quantidade_vagas),
  };
}

function JobsHeader() {
  const [open, setOpen] = useState(false);
  return <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 h-20 flex items-center justify-between">
      <a href="/#inicio" className="flex items-center" aria-label="Ir para o início"><Logo variant="color" showText={false} className="h-14 sm:h-16 w-auto max-w-[145px] sm:max-w-[180px]" /></a>
      <nav className="hidden xl:flex items-center gap-7" aria-label="Menu principal">{NAV_LINKS.map((link) => <a key={link.href} href={link.href} aria-current={link.href === "/vagas" ? "page" : undefined} className={`text-lg font-medium tracking-wide text-[#052656] transition-colors hover:opacity-70 ${link.href === "/vagas" ? "border-b-2 border-[#D4A62A]" : ""}`}>{link.label}</a>)}</nav>
      <div className="hidden xl:flex items-center gap-3"><a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#25D366] px-6 py-3 text-lg font-medium tracking-wide text-white transition-colors hover:bg-[#1EBE57]"><WhatsAppIcon/> Fale conosco</a></div>
      <button type="button" className="xl:hidden p-2" onClick={() => setOpen(!open)} aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open}>{open ? <X size={22} color="#052656"/> : <Menu size={22} color="#052656"/>}</button>
    </div>
    {open && <div className="xl:hidden bg-white border-t border-border px-6 py-6 flex flex-col gap-5">{NAV_LINKS.map((link) => <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-lg font-medium text-foreground tracking-wide">{link.label}</a>)}</div>}
  </header>;
}

function JobsFooter() {
  return <footer style={{ backgroundColor: "#052656" }} className="py-16"><div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10"><div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14"><div><div className="mb-4"><Logo variant="white" showText={true} className="h-24 md:h-28 w-auto max-w-[220px]" /></div><p className="text-lg leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.52)" }}>A HR Consultoria de RH oferece recrutamento e seleção com processo claro, triagem cuidadosa e comunicação próxima.</p></div><div><p className="text-base font-medium tracking-[0.15em] uppercase text-white/45 mb-5">Navegação</p><ul className="space-y-3" lang="pt-BR" translate="no">{NAV_LINKS.map((link) => <li key={link.href}><a href={link.href} className="text-lg transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.55)" }}>{link.label}</a></li>)}<li><a href="/admin/login" className="group inline-flex items-start gap-2 text-white/55 transition-colors hover:text-[#D4A62A]"><LockKeyhole size={17} className="mt-1" aria-hidden="true"/><span><strong className="block text-lg">Área do Recrutador</strong><span className="block text-sm text-white/40 group-hover:text-white/60">Gestão administrativa e processos seletivos</span></span></a></li><li><a href="/cliente/login" className="group inline-flex items-start gap-2 text-white/55 transition-colors hover:text-[#D4A62A]"><Building2 size={17} className="mt-1" aria-hidden="true"/><span><strong className="block text-lg">Área do Cliente</strong><span className="block text-sm text-white/40 group-hover:text-white/60">Acompanhamento de vagas e candidatos liberados</span></span></a></li></ul></div><div><p className="text-base font-medium tracking-[0.15em] uppercase text-white/45 mb-5">Contato</p><div className="flex flex-col gap-4"><a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-3 bg-[#25D366] px-5 py-3 text-lg font-semibold text-white transition-colors duration-200 hover:bg-[#1EBE57] focus:outline-none focus:ring-4 focus:ring-[#25D366]/25"><WhatsAppIcon size={18} />WhatsApp</a><a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex w-fit items-center gap-3 border border-white/15 bg-white/5 px-5 py-3 text-lg font-semibold text-white transition-colors duration-200 hover:border-[#D4A62A] hover:bg-[#D4A62A]/10 focus:outline-none focus:ring-4 focus:ring-[#D4A62A]/20"><Mail size={18} aria-hidden="true" />{CONTACT_EMAIL}</a></div></div></div><div className="pt-8 border-t text-center text-base leading-relaxed" style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}>© {new Date().getFullYear()} HR Consultoria de RH. Todos os direitos reservados.</div></div></footer>;
}

export function JobsRouter() {
  const [showTop, setShowTop] = useState(false);
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [job, setJob] = useState<PublicJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const slug = decodeURIComponent(window.location.pathname.replace(/^\/vagas\/?/, ""));

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (slug) {
          const found = await getPublishedJobBySlug(slug);
          if (active) setJob(found ? toPublicJob(found) : null);
        } else {
          const published = await listPublishedJobs();
          if (active) setJobs(published.map(toPublicJob));
        }
      } catch {
        if (active) setError("Não foi possível carregar as vagas.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [slug]);

  return <div id="vagas-topo" className="min-h-screen bg-background text-foreground font-['Inter',sans-serif] antialiased">
    <JobsHeader/>
    {loading ? <main className="pt-20 min-h-[70vh] flex items-center justify-center"><p className="text-lg">Carregando vagas...</p></main> : error ? <main className="pt-20 min-h-[70vh] flex items-center justify-center"><p className="text-lg">{error}</p></main> : slug ? <JobDetails job={job}/> : <JobsList jobs={jobs}/>} 
    <JobsFooter/>
    <button type="button" aria-label="Voltar ao topo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className={`fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#D4A62A] text-[#052656] shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#E0B33A] focus:outline-none focus:ring-4 focus:ring-[#D4A62A]/30 ${showTop ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}><ArrowUp size={22} strokeWidth={2.4} aria-hidden="true" /></button>
  </div>;
}

function JobsList({ jobs }: { jobs: PublicJob[] }) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [contract, setContract] = useState("");
  const cities = [...new Set(jobs.map((job) => job.city))];
  const contracts = [...new Set(jobs.map((job) => job.contract))];
  const results = useMemo(() => jobs.filter((job) => (job.title + job.city + job.summary).toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")) && (!city || job.city === city) && (!contract || job.contract === contract)), [jobs, query, city, contract]);

  return <main className="pt-20"><section className="py-20 md:py-24" style={{backgroundColor:"#052656"}}><div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10"><span className="inline-block text-base font-medium tracking-[0.18em] uppercase mb-5 text-[#D4A62A]">Oportunidades</span><h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white mb-5">Vagas disponíveis</h1><p className="text-lg md:text-xl leading-relaxed text-white/65 max-w-2xl">Consulte as oportunidades divulgadas pela HR Consultoria de RH.</p></div></section><section className="py-16 md:py-20"><div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10"><div className="grid grid-cols-1 lg:grid-cols-[1fr_230px_230px] gap-4 mb-10"><label><span className="block text-base font-medium mb-2">Buscar vaga</span><span className="relative block"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#052656]/45" size={20}/><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full pl-12 pr-4 py-4 text-lg border border-border bg-card focus:outline-none focus:border-[#D4A62A]" placeholder="Digite cargo, cidade ou palavra-chave"/></span></label><label><span className="block text-base font-medium mb-2">Cidade</span><select value={city} onChange={(event) => setCity(event.target.value)} className="w-full px-4 py-4 text-lg border border-border bg-card focus:outline-none focus:border-[#D4A62A]"><option value="">Todas as cidades</option>{cities.map((value) => <option key={value}>{value}</option>)}</select></label><label><span className="block text-base font-medium mb-2">Tipo de contrato</span><select value={contract} onChange={(event) => setContract(event.target.value)} className="w-full px-4 py-4 text-lg border border-border bg-card focus:outline-none focus:border-[#D4A62A]"><option value="">Todos os tipos</option>{contracts.map((value) => <option key={value}>{value}</option>)}</select></label></div><p className="mb-6 text-muted-foreground" aria-live="polite">{results.length} {results.length === 1 ? "vaga encontrada" : "vagas encontradas"}</p>{results.length ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{results.map((item) => <article key={item.slug} className="border border-border bg-card p-7 md:p-8 transition-shadow hover:shadow-lg"><h2 className="text-2xl md:text-3xl font-semibold text-[#052656] mb-5">{item.title}</h2><div className="flex flex-wrap gap-x-5 gap-y-3 text-base text-muted-foreground mb-5"><span className="inline-flex items-center gap-2"><MapPin size={18}/>{item.city}</span><span className="inline-flex items-center gap-2"><BriefcaseBusiness size={18}/>{item.contract}</span><span className="inline-flex items-center gap-2"><Clock3 size={18}/>{item.modality}</span>{item.salary && <span className="inline-flex items-center gap-2"><WalletCards size={18}/>{item.salary}</span>}<span className="inline-flex w-full items-center gap-2 font-semibold text-[#052656]"><BriefcaseBusiness size={18} aria-hidden="true"/>{availableJobsLabel(item.quantity)}</span></div><p className="text-lg leading-relaxed mb-7">{item.summary}</p><a href={`/vagas/${item.slug}`} className="inline-flex items-center justify-center gap-2 border border-[#D4A62A] bg-[#D4A62A] px-6 py-3 text-lg font-semibold text-[#052656] transition-colors hover:bg-[#E0B33A]">Ver detalhes <ArrowRight size={17}/></a></article>)}</div> : <div className="border border-border bg-card px-6 py-16 text-center"><Search className="mx-auto mb-5 text-[#D4A62A]" size={42}/><h2 className="text-2xl font-semibold text-[#052656] mb-3">Nenhuma vaga encontrada</h2><p className="text-lg text-muted-foreground">Altere os termos da busca ou os filtros para tentar novamente.</p></div>}</div></section></main>;
}

function JobDetails({ job }: { job: PublicJob | null }) {
  if (!job) return <main className="pt-20 min-h-[70vh] flex items-center"><div className="max-w-3xl mx-auto px-5 text-center"><h1 className="text-4xl font-semibold text-[#052656] mb-8">Vaga não encontrada ou não está mais disponível.</h1><a href="/vagas" className="inline-flex items-center gap-2 text-[#052656] font-semibold"><ArrowLeft/> Voltar para vagas</a></div></main>;
  const apply = `${whatsappLink()}?text=${encodeURIComponent(`Olá, gostaria de me candidatar à vaga de ${job.title}.`)}`;
  return <main className="pt-20"><section className="py-16 md:py-20" style={{backgroundColor:"#052656"}}><div className="max-w-5xl mx-auto px-5 sm:px-6"><a href="/vagas" className="inline-flex items-center gap-2 text-white/65 hover:text-white mb-8"><ArrowLeft size={18}/> Voltar para vagas</a><h1 className="text-4xl sm:text-5xl font-semibold text-white mb-6">{job.title}</h1><div className="flex flex-wrap gap-5 text-white/70">{job.company && <span>{job.company}</span>}<span>{job.city}</span><span>{job.modality}</span><span>{job.contract}</span>{job.salary && <span>{job.salary}</span>}</div></div></section><section className="py-16 md:py-20"><div className="max-w-5xl mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-12"><article className="space-y-10"><section className="border-l-4 border-[#D4A62A] bg-[#F5F7FA] p-5 sm:p-6"><h2 className="text-lg font-semibold text-[#052656] mb-2">Quantidade de vagas</h2><p className="text-xl font-semibold text-[#052656]">{availableJobsLabel(job.quantity)}</p></section><section><h2 className="text-3xl font-semibold text-[#052656] mb-4">Descrição</h2><p className="text-lg leading-relaxed">{job.description}</p></section><InfoList title="Atividades" items={job.activities}/><InfoList title="Requisitos" items={job.requirements}/><InfoList title="Benefícios" items={job.benefits}/><section><h2 className="text-3xl font-semibold text-[#052656] mb-4">Horário</h2><p className="text-lg">{job.schedule}</p></section></article><aside className="border-t-4 border-[#D4A62A] bg-[#052656] p-7 h-fit lg:sticky lg:top-28"><h2 className="text-2xl font-semibold text-white mb-4">Interessado nesta vaga?</h2><p className="text-white/65 mb-6">Entre em contato pelo canal oficial da HR Consultoria.</p><a href={apply} target="_blank" rel="noopener noreferrer" className={`${WHATSAPP_BUTTON_CLASS} w-full px-5 text-base`}><WhatsAppIcon/> Candidatar-se</a></aside></div></section></main>;
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return <section><h2 className="text-3xl font-semibold text-[#052656] mb-4">{title}</h2>{items.length ? <ul className="space-y-3">{items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-3 text-lg leading-relaxed"><span className="text-[#D4A62A]">✓</span>{item}</li>)}</ul> : <p className="text-lg text-muted-foreground">Não informado.</p>}</section>;
}
