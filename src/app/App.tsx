import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, ArrowUp, Check, ChevronDown, Users, Target, Megaphone, Filter, ClipboardList, FileText, Mail, LockKeyhole, Building2, BriefcaseBusiness, MonitorSmartphone, Settings, Crown, Handshake, SearchCheck, BarChart3, BadgeCheck } from "lucide-react";
import { JobsRouter } from "./pages/JobsPage";
import AdminLoginPage, { AdminClientSessionNotice } from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminNewJobPage from "./pages/AdminNewJobPage";
import AdminEditJobPage from "./pages/AdminEditJobPage";
import AdminCandidatesPage from "./pages/AdminCandidatesPage";
import AdminCandidateFormPage from "./pages/AdminCandidateFormPage";
import AdminCandidateProfilePage from "./pages/AdminCandidateProfilePage";
import AdminProcessesPage from "./pages/AdminProcessesPage";
import AdminCompaniesPage from "./pages/AdminCompaniesPage";
import AdminAgendaPage from "./pages/AdminAgendaPage";
import AdminTalentPoolPage from "./pages/AdminTalentPoolPage";
import AdminReportsPage from "./pages/AdminReportsPage";
import AdminFinancialPage from "./pages/AdminFinancialPage";
import CompanyContractSection from "./components/CompanyContractSection";
import PortalAccessSection from "./components/PortalAccessSection";
import ClientLoginPage from "./pages/ClientLoginPage";
import ClientAuthCallbackPage from "./pages/ClientAuthCallbackPage";
import ClientPortalPage from "./pages/ClientPortalPage";
import AdminPortalPreviewPage from "./pages/AdminPortalPreviewPage";
import AdminAccessRequestsPage from "./pages/AdminAccessRequestsPage";
import AdminNotificationsPage from "./pages/AdminNotificationsPage";
import { supabase } from "./lib/supabase";
import { clientPortalSupabase } from "./lib/clientPortalSupabase";

const LOGO_ASSETS = {
  color: {
    mark: "/assets/hr-consultoria-logo-mark.png",
    full: "/assets/hr-consultoria-logo.png",
  },
  white: {
    mark: "/assets/hr-consultoria-logo-mark-white.png",
    full: "/assets/hr-consultoria-logo-white.png",
  },
};

export function Logo({
  variant = "color",
  showText = true,
  className = "",
}: {
  variant?: "color" | "white";
  showText?: boolean;
  className?: string;
}) {
  const src = showText ? LOGO_ASSETS[variant].full : LOGO_ASSETS[variant].mark;

  return (
    <img
      src={src}
      alt="HR Consultoria de RH"
      className={`block object-contain ${className}`}
      draggable={false}
    />
  );
}

const WHATSAPP_NUMBER = "5531994773992";
export const CONTACT_EMAIL = "Marianaremercesrh@gmail.com";
export const WHATSAPP_BUTTON_CLASS = "inline-flex items-center justify-center gap-3 bg-[#25D366] px-8 py-4 text-lg font-semibold tracking-wide text-white transition-colors duration-200 hover:bg-[#1EBE57] focus:outline-none focus:ring-4 focus:ring-[#25D366]/25 whitespace-nowrap";
const WHATSAPP_HEADER_BUTTON_CLASS = "inline-flex items-center justify-center gap-2 bg-[#25D366] px-6 py-3 text-lg font-medium tracking-wide text-white transition-colors duration-200 hover:bg-[#1EBE57] focus:outline-none focus:ring-4 focus:ring-[#25D366]/25 whitespace-nowrap";
const EMAIL_BUTTON_CLASS = "inline-flex items-center justify-center gap-3 border border-[#052656]/20 bg-white px-8 py-4 text-lg font-semibold tracking-wide text-[#052656] transition-colors duration-200 hover:border-[#D4A62A] hover:bg-[#D4A62A]/10 focus:outline-none focus:ring-4 focus:ring-[#D4A62A]/20 whitespace-nowrap";

export function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M16.02 3C8.86 3 3.04 8.8 3.04 15.93c0 2.28.6 4.5 1.74 6.45L3 29l6.82-1.78a12.95 12.95 0 0 0 6.2 1.58h.01C23.18 28.8 29 23 29 15.87 29 8.76 23.18 3 16.02 3Zm0 23.57h-.01c-1.92 0-3.8-.52-5.44-1.5l-.39-.23-4.04 1.05 1.08-3.93-.26-.4a10.6 10.6 0 0 1-1.65-5.63c0-5.9 4.77-10.7 10.64-10.7 2.84 0 5.52 1.11 7.53 3.13a10.57 10.57 0 0 1 3.12 7.51c0 5.9-4.78 10.7-10.58 10.7Zm5.84-8.01c-.32-.16-1.9-.94-2.2-1.05-.3-.1-.52-.16-.74.16-.21.31-.84 1.04-1.03 1.25-.19.21-.38.24-.7.08-.32-.16-1.35-.5-2.57-1.59a9.63 9.63 0 0 1-1.78-2.22c-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.73-1.75-1-2.4-.26-.63-.53-.54-.73-.55h-.63c-.21 0-.56.08-.85.4-.29.32-1.12 1.1-1.12 2.68 0 1.58 1.15 3.11 1.31 3.32.16.21 2.26 3.44 5.48 4.82.77.33 1.36.53 1.83.68.77.24 1.47.2 2.02.12.62-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

export function whatsappLink() {
  return `https://wa.me/${WHATSAPP_NUMBER}`;
}

function emailLink(
  body = "Olá, gostaria de solicitar um orçamento.",
  subject = "Solicitação de orçamento - HR Consultoria",
) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function HomeApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    empresa: "",
    telefone: "",
    vaga: "",
    mensagem: "",
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Início", href: "#inicio" },
    { label: "Vagas", href: "/vagas" },
    { label: "Sobre", href: "#sobre" },
    { label: "Serviços", href: "#servicos" },
    { label: "Processo", href: "#processo" },
    { label: "Contato", href: "#contato" },
  ];

  const services = [
    {
      icon: <Users size={22} />,
      title: "Recrutamento e Seleção",
      desc: "Condução do processo seletivo desde a abertura da vaga até a apresentação dos profissionais mais aderentes.",
    },
    {
      icon: <Target size={22} />,
      title: "Alinhamento de Perfil",
      desc: "Mapeamento da vaga, rotina, requisitos técnicos, comportamento esperado e contexto real da empresa.",
    },
    {
      icon: <Megaphone size={22} />,
      title: "Divulgação de Vagas",
      desc: "Publicação em canais adequados para atrair candidatos compatíveis com o perfil buscado.",
    },
    {
      icon: <Filter size={22} />,
      title: "Triagem de Candidatos",
      desc: "Análise cuidadosa dos currículos e contatos iniciais para reduzir ruídos antes das entrevistas.",
    },
    {
      icon: <ClipboardList size={22} />,
      title: "Entrevistas",
      desc: "Conversas estruturadas para avaliar experiência, postura, disponibilidade e aderência ao desafio.",
    },
    {
      icon: <FileText size={22} />,
      title: "Apresentação de Candidatos",
      desc: "Envio de perfis finalistas com informações objetivas para apoiar a decisão da empresa.",
    },
  ];

  const steps = [
    { num: "01", title: "Briefing da vaga", desc: "Entendemos a posição, o perfil desejado, a rotina da função e os pontos que não podem ser negociados." },
    { num: "02", title: "Busca e divulgação", desc: "Divulgamos a oportunidade e ativamos canais compatíveis com o tipo de profissional procurado." },
    { num: "03", title: "Triagem inicial", desc: "Filtramos currículos e conversamos com candidatos para confirmar informações importantes antes de avançar." },
    { num: "04", title: "Entrevistas", desc: "Avaliamos experiência, comportamento, comunicação e aderência ao perfil definido com a empresa." },
    { num: "05", title: "Envio dos finalistas", desc: "Apresentamos candidatos selecionados com um resumo claro para facilitar a comparação entre perfis." },
    { num: "06", title: "Apoio ao fechamento", desc: "Acompanhamos as etapas finais e mantemos a comunicação organizada até a contratação." },
  ];

  const diferenciais = [
    "Atendimento próximo, com clareza em cada etapa",
    "Triagem feita com critério, não apenas por palavras-chave",
    "Comunicação objetiva durante todo o processo",
    "Foco em candidatos compatíveis com a vaga e com a rotina da empresa",
    "Apoio pensado para pequenas e médias empresas",
    "Processo conduzido com organização, cuidado e transparência",
  ];

  const areasAtendidas = [
    "Operacional e produção",
    "Administrativo",
    "Comercial e atendimento",
    "Tecnologia",
    "Liderança e supervisão",
    "Serviços gerais e apoio",
    "Vagas técnicas",
    "Recrutamento para pequenos negócios",
  ];

  const businessSolutions = [
    {
      icon: <Users size={24} />,
      title: "Consultoria de RH",
      items: [
        "Recrutamento e Seleção",
        "Hunting de profissionais",
        "Entrevistas por competência",
        "Implantação de RH",
        "Estruturação de cargos e salários",
        "Descrição de cargos",
        "Integração de colaboradores",
        "Pesquisa de Clima Organizacional",
        "Avaliação de Desempenho",
        "Treinamentos para líderes",
        "Diagnóstico de RH",
      ],
    },
    {
      icon: <BriefcaseBusiness size={24} />,
      title: "Departamento Pessoal",
      items: [
        "Gestão de admissões",
        "Gestão de demissões",
        "Agendamento de exames admissionais e periódicos",
        "Organização documental",
        "Interface com a contabilidade",
        "Controle de documentos dos colaboradores",
      ],
    },
    {
      icon: <MonitorSmartphone size={24} />,
      title: "Presença Digital",
      items: [
        "Criação de Sites Institucionais",
        "Landing Pages",
        "Identidade Visual",
        "Criação de Logotipos",
        "Google Meu Negócio",
        "SEO Local",
        "Gestão de LinkedIn Empresarial",
        "Artes para Redes Sociais",
      ],
    },
    {
      icon: <Settings size={24} />,
      title: "Gestão Empresarial",
      items: [
        "Organização de Processos",
        "Padronização de Documentos",
        "Manual do Colaborador",
        "Indicadores de RH",
        "Banco de Talentos",
        "Estruturação de Processos de Recrutamento",
      ],
    },
    {
      icon: <Crown size={24} />,
      title: "Soluções Premium",
      items: [
        "Employer Branding",
        "Redução de Turnover",
        "Plano de Retenção de Talentos",
        "Mapeamento Comportamental",
        "Consultoria Estratégica de Pessoas",
        "Acompanhamento Pós-Contratação",
      ],
    },
  ];

  const businessPackages = [
    {
      icon: <SearchCheck size={24} />,
      name: "Start",
      description: "Ideal para empresas que precisam contratar rapidamente.",
      features: [
        "Divulgação da vaga",
        "Triagem de currículos",
        "Entrevistas",
        "Envio dos candidatos aprovados",
      ],
    },
    {
      icon: <Handshake size={24} />,
      name: "Growth",
      description: "Tudo do Start, com acompanhamento mais completo da contratação.",
      featured: true,
      features: [
        "Relatório completo",
        "Acompanhamento da contratação",
        "Garantia de reposição",
        "Suporte durante o processo",
      ],
    },
    {
      icon: <BarChart3 size={24} />,
      name: "Premium",
      description: "Tudo do Growth, com consultoria estratégica para estruturar o RH.",
      features: [
        "Diagnóstico de RH",
        "Estruturação de processos",
        "Indicadores",
        "Consultoria estratégica",
        "Reuniões periódicas",
        "Plano de melhoria contínua",
      ],
    },
  ];

  const marketingBenefits = [
    "Recrutamento e Seleção",
    "Criação de Site Profissional",
    "Google Meu Negócio",
    "LinkedIn Empresarial",
    "Identidade Visual",
    "Página Trabalhe Conosco",
    "Banco de Talentos",
    "Estratégias para atrair candidatos qualificados",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWhatsAppSubmit = () => {
    const nome = formData.nome.trim();
    const empresa = formData.empresa.trim();
    const telefone = formData.telefone.trim();
    const vaga = formData.vaga.trim();
    const mensagem = formData.mensagem.trim();

    if (!nome || !empresa || !telefone || !vaga) {
      alert("Preencha os campos obrigatórios antes de enviar.");
      return;
    }

    const texto = `Olá, tenho interesse em solicitar uma proposta para recrutamento e seleção.

Nome: ${nome}
Empresa: ${empresa}
Telefone/WhatsApp: ${telefone}
Vaga que preciso contratar: ${vaga}
Mensagem: ${mensagem || "Não informado"}`;

    const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(texto)}`;

    window.location.href = url;
  };

  const handleEmailSubmit = () => {
    const nome = formData.nome.trim();
    const empresa = formData.empresa.trim();
    const telefone = formData.telefone.trim();
    const vaga = formData.vaga.trim();
    const mensagem = formData.mensagem.trim();

    if (!nome || !empresa || !telefone || !vaga) {
      alert("Preencha os campos obrigatórios antes de enviar.");
      return;
    }

    const subject = "Solicitação de proposta - HR Consultoria de RH";

    const body = `Olá, tenho interesse em solicitar uma proposta para recrutamento e seleção.

Nome: ${nome}
Empresa: ${empresa}
Telefone/WhatsApp: ${telefone}
Vaga que preciso contratar: ${vaga}
Mensagem: ${mensagem || "Não informado"}`;

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="bg-background text-foreground font-['Inter',sans-serif] antialiased overflow-x-hidden">

      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-sm border-b border-border shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 h-20 flex items-center justify-between">
          {/* Logo */}
          <a href="#inicio" className="flex items-center" aria-label="Ir para o início">
            <Logo
              variant={scrolled ? "color" : "white"}
              showText={false}
              className="h-14 sm:h-16 w-auto max-w-[145px] sm:max-w-[180px]"
            />
          </a>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center gap-7" aria-label="Menu principal" lang="pt-BR" translate="no">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-lg font-medium tracking-wide transition-colors hover:opacity-70"
                style={{ color: scrolled ? "#052656" : "#fff" }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden xl:flex items-center gap-3">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className={WHATSAPP_HEADER_BUTTON_CLASS}
            >
              <WhatsAppIcon size={18} />
              Fale conosco
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="xl:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen
              ? <X size={22} style={{ color: scrolled ? "#052656" : "#fff" }} />
              : <Menu size={22} style={{ color: scrolled ? "#052656" : "#fff" }} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="xl:hidden bg-white border-t border-border px-6 py-6 flex flex-col gap-5" lang="pt-BR" translate="no">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="text-lg font-medium text-foreground tracking-wide"
              >
                {l.label}
              </a>
            ))}
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className={`${WHATSAPP_HEADER_BUTTON_CLASS} w-full`}
            >
              <WhatsAppIcon size={18} />
              Fale conosco
            </a>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="inicio" className="relative min-h-screen flex items-center">
        <div
          className="home-hero-background absolute inset-0"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1758518731706-be5d5230e5a5?w=1800&h=1000&fit=crop&auto=format)`,
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, rgba(5,38,86,0.84) 0%, rgba(5,38,86,0.58) 60%, rgba(5,38,86,0.28) 100%)" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 pt-32 pb-24 w-full">
          <div className="max-w-3xl">
            <span
              className="inline-block text-base font-medium tracking-[0.18em] uppercase mb-8"
              style={{ color: "#D4A62A" }}
            >
              Consultoria de RH para empresas
            </span>
            <h1
              className="font-['Playfair_Display',serif] text-4xl sm:text-5xl lg:text-6xl leading-[1.08] font-semibold text-white mb-7"
            >
              HR Consultoria de RH: recrutamento e seleção
            </h1>
            <p className="text-xl md:text-2xl text-white/80 leading-relaxed mb-10 max-w-2xl font-light">
              Consultoria de RH em Belo Horizonte com atendimento para empresas em todo o Brasil, conduzindo recrutamento e seleção para encontrar profissionais alinhados a cada negócio.
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-3 bg-[#D4A62A] px-8 py-4 text-lg font-semibold tracking-wide text-[#052656] transition-colors duration-200 hover:bg-[#B98E20] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4A62A]/35 motion-reduce:transition-none sm:w-auto whitespace-nowrap"
              >
                <WhatsAppIcon size={20} />
                Solicitar proposta
                <ArrowRight size={15} />
              </a>
              <a
                href="#servicos"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 border border-[#D4A62A] bg-transparent px-8 py-4 text-lg font-semibold tracking-wide text-[#D4A62A] transition-colors duration-200 hover:bg-[#D4A62A]/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4A62A]/30 motion-reduce:transition-none whitespace-nowrap"
              >
                Conhecer serviços
              </a>
            </div>
          </div>
        </div>

        <a href="#sobre" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-white/80 transition-colors motion-safe:animate-bounce motion-reduce:transition-none" aria-label="Ir para a seção Sobre">
          <ChevronDown size={24} />
        </a>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center">
          <div>
            <span className="inline-block text-base font-medium tracking-[0.18em] uppercase mb-6" style={{ color: "#D4A62A" }}>
              Quem somos
            </span>
            <h2 className="font-['Playfair_Display',serif] text-4xl md:text-5xl font-semibold leading-tight text-foreground mb-6">
              Sobre a HR Consultoria de RH
            </h2>
            <div className="w-12 h-px mb-8" style={{ backgroundColor: "#D4A62A" }} />
            <p className="text-lg leading-[1.75] text-muted-foreground mb-6">
              A HR Consultoria de RH atua com recrutamento e seleção para empresas que precisam contratar com mais segurança, mas não querem perder tempo com processos confusos ou triagens superficiais.
            </p>
            <p className="text-lg leading-[1.75] text-muted-foreground">
              Antes de divulgar uma vaga, entendemos o que a empresa realmente precisa: rotina da função, perfil técnico, comportamento esperado e contexto da equipe. A partir disso, conduzimos a busca com critério e comunicação próxima.
            </p>
          </div>

          <div className="relative">
            <div
              className="aspect-[4/5] bg-gray-200 overflow-hidden"
              style={{ borderRadius: 0 }}
            >
              <img
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=700&h=875&fit=crop&auto=format"
                alt="Profissionais em reunião de contratação"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative frame */}
            <div
              className="absolute -bottom-5 -right-5 w-3/4 h-3/4 border pointer-events-none"
              style={{ borderColor: "#D4A62A", opacity: 0.35 }}
            />
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section id="servicos" className="py-20 md:py-28" style={{ backgroundColor: "#052656" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10">
          <div className="mb-16">
            <span className="inline-block text-base font-medium tracking-[0.18em] uppercase mb-6" style={{ color: "#D4A62A" }}>
              O que fazemos
            </span>
            <h2 className="font-['Playfair_Display',serif] text-4xl md:text-5xl font-semibold text-white leading-tight max-w-2xl">
              Apoio completo para encontrar o profissional certo
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-[1.7]" style={{ color: "rgba(255,255,255,0.72)" }}>
              A HR Consultoria de RH oferece suporte completo para empresas que desejam contratar com mais segurança, clareza e agilidade.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
            {services.map((s, i) => (
              <article
                key={i}
                className="group bg-[#052656] p-8 md:p-9 hover:bg-[#08346F] transition-colors duration-200"
              >
                <div className="mb-5" style={{ color: "#D4A62A" }}>{s.icon}</div>
                <h3 className="font-['Playfair_Display',serif] text-2xl font-semibold text-white mb-4 leading-tight">
                  {s.title}
                </h3>
                <p className="text-lg leading-[1.65]" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {s.desc}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUÇÕES EMPRESARIAIS */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10">
          <div className="mb-16 max-w-3xl">
            <span className="inline-block text-base font-medium tracking-[0.18em] uppercase mb-6" style={{ color: "#D4A62A" }}>
              Soluções Empresariais
            </span>
            <h2 className="font-['Playfair_Display',serif] text-4xl md:text-5xl font-semibold text-foreground leading-tight">
              Consultoria completa para empresas que querem crescer com estrutura
            </h2>
            <p className="mt-6 text-lg leading-[1.75] text-muted-foreground">
              Integramos RH, departamento pessoal, presença digital e gestão para apoiar empresas em diferentes momentos: contratação, organização interna, fortalecimento da marca empregadora e melhoria contínua.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {businessSolutions.map((solution) => (
              <article
                key={solution.title}
                className="group border border-border bg-white p-7 md:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D4A62A]/50 hover:shadow-xl hover:shadow-[#052656]/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center bg-[#052656] text-[#D4A62A] transition-colors duration-300 group-hover:bg-[#D4A62A] group-hover:text-[#052656] motion-reduce:transition-none">
                  {solution.icon}
                </div>
                <h3 className="font-['Playfair_Display',serif] text-2xl font-semibold leading-tight text-foreground mb-5">
                  {solution.title}
                </h3>
                <ul className="space-y-3">
                  {solution.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-base leading-[1.55] text-muted-foreground">
                      <Check size={16} className="mt-1 shrink-0 text-[#D4A62A]" strokeWidth={2.6} aria-hidden="true" />
                      <span className="min-w-0 flex-1">{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PACOTES EMPRESARIAIS */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10">
          <div className="mb-16 text-center">
            <span className="inline-block text-base font-medium tracking-[0.18em] uppercase mb-6" style={{ color: "#D4A62A" }}>
              Pacotes Empresariais
            </span>
            <h2 className="font-['Playfair_Display',serif] text-4xl md:text-5xl font-semibold text-foreground leading-tight">
              Escolha o nível de apoio ideal para sua empresa
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {businessPackages.map((pack) => (
              <article
                key={pack.name}
                className={`group relative flex h-full flex-col border p-7 md:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#052656]/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
                  pack.featured
                    ? "border-[#D4A62A] bg-[#052656] text-white"
                    : "border-border bg-white text-foreground"
                }`}
              >
                {pack.featured && (
                  <span className="absolute right-6 top-6 bg-[#D4A62A] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#052656]">
                    Mais completo
                  </span>
                )}
                <div className={`mb-6 flex h-12 w-12 items-center justify-center ${pack.featured ? "bg-white/10 text-[#D4A62A]" : "bg-[#052656] text-[#D4A62A]"}`}>
                  {pack.icon}
                </div>
                <h3 className="font-['Playfair_Display',serif] text-3xl font-semibold uppercase leading-tight mb-4">
                  {pack.name}
                </h3>
                <p className={`text-lg leading-[1.65] mb-7 ${pack.featured ? "text-white/70" : "text-muted-foreground"}`}>
                  {pack.description}
                </p>
                <ul className="mt-auto space-y-3">
                  {pack.features.map((feature) => (
                    <li key={feature} className={`flex items-start gap-3 text-base leading-[1.55] ${pack.featured ? "text-white/82" : "text-foreground"}`}>
                      <Check size={16} className="mt-1 shrink-0 text-[#D4A62A]" strokeWidth={2.6} aria-hidden="true" />
                      <span className="min-w-0 flex-1">{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* RH + MARKETING */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#052656" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20 items-center">
          <div>
            <span className="inline-block text-base font-medium tracking-[0.18em] uppercase mb-6" style={{ color: "#D4A62A" }}>
              RH + Marketing
            </span>
            <h2 className="font-['Playfair_Display',serif] text-4xl md:text-5xl font-semibold text-white leading-tight mb-6">
              Contratamos os profissionais certos e fortalecemos a imagem da sua empresa.
            </h2>
            <p className="text-lg leading-[1.75]" style={{ color: "rgba(255,255,255,0.70)" }}>
              Uma combinação estratégica para atrair melhores candidatos, melhorar a percepção da marca e transformar recrutamento em vantagem competitiva.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/10">
            {marketingBenefits.map((benefit) => (
              <article key={benefit} className="group bg-[#052656] p-6 transition-colors duration-200 hover:bg-[#08346F] motion-reduce:transition-none">
                <div className="mb-4 flex h-9 w-9 items-center justify-center bg-[#D4A62A] text-[#052656]">
                  <BadgeCheck size={18} strokeWidth={2.5} aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold leading-snug text-white">
                  {benefit}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA EMPRESARIAL */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-10 text-center">
          <span className="inline-block text-base font-medium tracking-[0.18em] uppercase mb-6" style={{ color: "#D4A62A" }}>
            Crescimento empresarial
          </span>
          <h2 className="font-['Playfair_Display',serif] text-4xl md:text-5xl font-semibold text-foreground leading-tight mb-6">
            Tudo o que sua empresa precisa para crescer, em um só lugar.
          </h2>
          <p className="text-xl leading-[1.7] text-muted-foreground mb-10">
            Da contratação ao fortalecimento da sua marca, oferecemos soluções completas para impulsionar o crescimento do seu negócio.
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4">
            <a
              href={emailLink("Olá, gostaria de solicitar uma proposta para soluções empresariais.", "Solicitação de proposta - Soluções Empresariais")}
              className={`${EMAIL_BUTTON_CLASS} w-full sm:w-auto`}
            >
              <Mail size={20} aria-hidden="true" />
              Solicitar Proposta
            </a>
            <a
              href={`${whatsappLink()}?text=${encodeURIComponent("Olá, gostaria de falar sobre as soluções empresariais da HR Consultoria de RH.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${WHATSAPP_BUTTON_CLASS} w-full sm:w-auto`}
            >
              <WhatsAppIcon size={20} />
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ÁREAS ATENDIDAS */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-20 items-start">
            <div>
              <span className="inline-block text-base font-medium tracking-[0.18em] uppercase mb-6" style={{ color: "#D4A62A" }}>
                Áreas que atendemos
              </span>
              <h2 className="font-['Playfair_Display',serif] text-4xl md:text-5xl font-semibold text-foreground leading-tight mb-6">
                Recrutamento para diferentes níveis e áreas
              </h2>
              <div className="w-12 h-px mb-8" style={{ backgroundColor: "#D4A62A" }} />
              <p className="text-lg leading-[1.75] text-muted-foreground">
                A HR Consultoria de RH atua no recrutamento e seleção para diferentes áreas e níveis de contratação. Atendemos desde vagas operacionais até posições administrativas, comerciais, técnicas e de tecnologia, sempre buscando entender a necessidade da empresa e o perfil ideal para cada função.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
              {areasAtendidas.map((area) => (
                <article key={area} className="bg-white p-6 md:p-7">
                  <div className="mb-4 flex h-9 w-9 items-center justify-center" style={{ backgroundColor: "rgba(212,166,42,0.14)", color: "#D4A62A" }}>
                    <Check size={17} strokeWidth={2.6} aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold leading-snug text-foreground">
                    {area}
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="processo" className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10">
          <div className="mb-16">
            <span className="inline-block text-base font-medium tracking-[0.18em] uppercase mb-6" style={{ color: "#D4A62A" }}>
              Como trabalhamos
            </span>
            <h2 className="font-['Playfair_Display',serif] text-4xl md:text-5xl font-semibold text-foreground leading-tight">
              Um processo claro do briefing à contratação
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-[1.75] text-muted-foreground">
              A HR Consultoria de RH organiza cada etapa com clareza, acompanhamento próximo e foco em uma contratação mais assertiva.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            {steps.map((s, i) => (
              <article key={i} className="relative p-8 border-b md:border-r border-border group">
                {/* Step number */}
                <span
                  className="block font-['Playfair_Display',serif] text-5xl sm:text-6xl font-semibold mb-6 leading-none"
                  style={{ color: "#D4A62A", opacity: 0.55 }}
                >
                  {s.num}
                </span>
                <h3 className="text-xl font-semibold text-foreground mb-3 leading-snug">{s.title}</h3>
                <p className="text-lg leading-[1.65] text-muted-foreground">{s.desc}</p>
                <div
                  className="absolute bottom-0 left-8 w-8 h-px transition-all duration-300 group-hover:w-16"
                  style={{ backgroundColor: "#D4A62A" }}
                />
              </article>
            ))}
          </div>

          <div className="mt-12 border-l-4 bg-white p-7 md:p-8" style={{ borderColor: "#D4A62A" }}>
            <h3 className="text-2xl font-semibold leading-snug text-foreground mb-3">
              Atendimento remoto para todo o Brasil
            </h3>
            <p className="text-lg leading-[1.7] text-muted-foreground">
              A HR Consultoria de RH atende empresas em todo o Brasil, conduzindo processos seletivos de forma remota, com alinhamentos por WhatsApp, e-mail ou videochamada. Quando necessário, também realizamos atendimentos presenciais conforme a demanda da empresa em Belo Horizonte.
            </p>
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center">
          <div>
            <span className="inline-block text-base font-medium tracking-[0.18em] uppercase mb-6" style={{ color: "#D4A62A" }}>
              Nossos diferenciais
            </span>
            <h2 className="font-['Playfair_Display',serif] text-4xl md:text-5xl font-semibold text-foreground leading-tight mb-4">
              Por que escolher a HR Consultoria de RH?
            </h2>
            <div className="w-12 h-px mb-10" style={{ backgroundColor: "#D4A62A" }} />
            <ul className="space-y-4">
              {diferenciais.map((d, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center"
                    style={{ backgroundColor: "#D4A62A" }}
                  >
                    <Check size={11} color="#052656" strokeWidth={3} />
                  </span>
                  <span className="block min-w-0 flex-1 text-lg leading-[1.6] text-foreground">{d}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="aspect-square overflow-hidden bg-gray-300">
              <img
                src="https://images.unsplash.com/photo-1758518730083-4c12527b6742?w=700&h=700&fit=crop&auto=format"
                alt="Equipe de profissionais em reunião corporativa"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="absolute -top-5 -left-5 w-3/4 h-3/4 border pointer-events-none"
              style={{ borderColor: "#D4A62A", opacity: 0.30 }}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#052656" }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-10 text-center">
          <span className="inline-block text-base font-medium tracking-[0.18em] uppercase mb-6" style={{ color: "#D4A62A" }}>
            Vamos conversar
          </span>
          <h2 className="font-['Playfair_Display',serif] text-4xl md:text-5xl font-semibold text-white leading-tight mb-6">
            Precisa preencher uma vaga com mais segurança?
          </h2>
          <p className="text-xl leading-[1.7] mb-10" style={{ color: "rgba(255,255,255,0.68)" }}>
            Conte qual vaga sua empresa precisa preencher. Vamos entender o perfil, orientar os próximos passos e iniciar uma busca mais organizada.
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className={`${WHATSAPP_BUTTON_CLASS} w-full sm:w-auto`}
            >
              <WhatsAppIcon size={20} />
              Quero contratar melhor
              <ArrowRight size={15} />
            </a>
            <a
              href={emailLink()}
              className={`${EMAIL_BUTTON_CLASS} w-full sm:w-auto`}
            >
              <Mail size={20} aria-hidden="true" />
              Solicitar orçamento por e-mail
            </a>
          </div>
        </div>
      </section>

      {/* CONTATO */}
      <section id="contato" className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24">
          {/* Info */}
          <div>
            <span className="inline-block text-base font-medium tracking-[0.18em] uppercase mb-6" style={{ color: "#D4A62A" }}>
              Fale conosco
            </span>
            <h2 className="font-['Playfair_Display',serif] text-4xl md:text-5xl font-semibold text-foreground leading-tight mb-4">
              Entre em contato
            </h2>
            <div className="w-12 h-px mb-8" style={{ backgroundColor: "#D4A62A" }} />
            <p className="text-lg text-muted-foreground leading-[1.75] mb-10">
              Fale com a HR Consultoria de RH e conte qual contratação sua empresa precisa realizar. Preencha o formulário para receber um retorno sobre os próximos passos.
            </p>
            <div className="rounded-2xl border border-[#D4A62A]/20 bg-[#D4A62A]/8 p-5 mb-8">
              <p className="text-base font-medium tracking-[0.18em] uppercase mb-2" style={{ color: "#D4A62A" }}>
                Atendimento remoto para todo o Brasil
              </p>
              <p className="text-lg leading-[1.7] text-muted-foreground">
                A HR Consultoria de RH atende empresas em todo o Brasil, conduzindo processos seletivos de forma remota, com alinhamentos por WhatsApp, e-mail ou videochamada. Quando necessário, também realizamos atendimentos presenciais conforme a demanda da empresa em Belo Horizonte.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
              <button
                type="button"
                onClick={handleWhatsAppSubmit}
                className={`${WHATSAPP_BUTTON_CLASS} w-full sm:w-auto`}
              >
                <WhatsAppIcon size={20} />
                Conversar pelo WhatsApp
              </button>
              <button
                type="button"
                onClick={handleEmailSubmit}
                className={`${EMAIL_BUTTON_CLASS} w-full sm:w-auto`}
              >
                <Mail size={20} aria-hidden="true" />
                Solicitar orçamento por e-mail
              </button>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            id="formulario-contato"
            className="flex flex-col gap-5"
          >
            {[
              { field: "nome", label: "Nome", placeholder: "Seu nome completo" },
              { field: "empresa", label: "Empresa", placeholder: "Nome da sua empresa" },
              { field: "telefone", label: "Telefone / WhatsApp", placeholder: "(31) 99999-9999" },
              { field: "vaga", label: "Vaga que precisa contratar", placeholder: "Ex: Assistente Administrativo" },
            ].map(({ field, label, placeholder }) => (
              <div key={field}>
                <label htmlFor={field} className="block text-base font-medium tracking-wide uppercase mb-2 text-foreground">
                  {label}
                </label>
                <input
                  id={field}
                  name={field}
                  type="text"
                  required
                  placeholder={placeholder}
                  value={formData[field as keyof typeof formData]}
                  onChange={handleChange}
                  className="w-full px-5 py-4 text-lg leading-relaxed border border-border bg-card focus:outline-none focus:border-[#D4A62A] transition-colors"
                />
              </div>
            ))}

            <div>
              <label htmlFor="mensagem" className="block text-base font-medium tracking-wide uppercase mb-2 text-foreground">
                Mensagem
              </label>
              <textarea
                id="mensagem"
                name="mensagem"
                rows={4}
                placeholder="Fale um pouco sobre o perfil que você busca..."
                value={formData.mensagem}
                onChange={handleChange}
                className="w-full px-5 py-4 text-lg leading-relaxed border border-border bg-card focus:outline-none focus:border-[#D4A62A] transition-colors resize-none"
              />
            </div>

            <button
              type="button"
              onClick={handleWhatsAppSubmit}
              className={`${WHATSAPP_BUTTON_CLASS} mt-2 w-full`}
            >
              <WhatsAppIcon size={20} />
              Enviar solicitação
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={handleEmailSubmit}
              className={`${EMAIL_BUTTON_CLASS} w-full`}
            >
              <Mail size={20} aria-hidden="true" />
              Solicitar orçamento por e-mail
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: "#052656" }} className="py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14">
            {/* Brand */}
            <div>
              <div className="mb-4">
                <Logo variant="white" showText={true} className="h-24 md:h-28 w-auto max-w-[220px]" />
              </div>
              <p className="text-lg leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.52)" }}>
                A HR Consultoria de RH oferece recrutamento e seleção com processo claro, triagem cuidadosa e comunicação próxima.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="text-base font-medium tracking-[0.15em] uppercase text-white/45 mb-5">Navegação</p>
              <ul className="space-y-3" lang="pt-BR" translate="no">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="text-lg transition-colors hover:text-white"
                      style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a href="/admin/login" className="group inline-flex items-start gap-2 text-white/55 transition-colors hover:text-[#D4A62A]">
                    <LockKeyhole size={17} className="mt-1" aria-hidden="true" />
                    <span><strong className="block text-lg">Área do Recrutador</strong><span className="block text-sm text-white/40 group-hover:text-white/60">Gestão administrativa e processos seletivos</span></span>
                  </a>
                </li>
                <li>
                  <a href="/cliente/login" className="group inline-flex items-start gap-2 text-white/55 transition-colors hover:text-[#D4A62A]">
                    <Building2 size={17} className="mt-1" aria-hidden="true" />
                    <span><strong className="block text-lg">Área do Cliente</strong><span className="block text-sm text-white/40 group-hover:text-white/60">Acompanhamento de vagas e candidatos liberados</span></span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <p className="text-base font-medium tracking-[0.15em] uppercase text-white/45 mb-5">Contato</p>
              <div className="flex flex-col gap-4">
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-3 bg-[#25D366] px-5 py-3 text-lg font-semibold text-white transition-colors duration-200 hover:bg-[#1EBE57] focus:outline-none focus:ring-4 focus:ring-[#25D366]/25"
                >
                  <WhatsAppIcon size={18} />
                  WhatsApp
                </a>
                <a
                  href={emailLink()}
                  className="inline-flex w-fit items-center gap-3 border border-white/15 bg-white/5 px-5 py-3 text-lg font-semibold text-white transition-colors duration-200 hover:border-[#D4A62A] hover:bg-[#D4A62A]/10 focus:outline-none focus:ring-4 focus:ring-[#D4A62A]/20"
                >
                  <Mail size={18} aria-hidden="true" />
                  {CONTACT_EMAIL}
                </a>
              </div>
            </div>
          </div>

          <div
            className="pt-8 border-t text-center text-base leading-relaxed"
            style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}
          >
            © HR Consultoria de RH. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      <button
        type="button"
        aria-label="Voltar ao topo"
        onClick={() => document.getElementById("inicio")?.scrollIntoView({ behavior: "smooth", block: "start" })}
        className={`fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#D4A62A] text-[#052656] shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#E0B33A] focus:outline-none focus:ring-4 focus:ring-[#D4A62A]/30 ${
          scrolled ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <ArrowUp size={22} strokeWidth={2.4} aria-hidden="true" />
      </button>
    </div>
  );
}

export default function App() {
  const caminho = window.location.pathname;

  useEffect(() => {
    const isJobsPage = caminho === "/vagas" || caminho === "/vagas/";
    const isPublicPage = caminho === "/" || caminho.startsWith("/vagas");
    const title = isJobsPage
      ? "Vagas de emprego em Belo Horizonte | HR Consultoria de RH"
      : "HR Consultoria de RH | Recrutamento e Seleção";
    const description = isJobsPage
      ? "Confira vagas de emprego divulgadas pela HR Consultoria de RH e candidate-se às oportunidades disponíveis."
      : "Consultoria empresarial de RH com recrutamento e seleção, departamento pessoal, presença digital, gestão de processos e soluções estratégicas para empresas.";
    const canonical = caminho.startsWith("/vagas/")
      ? `https://www.hrconsultoriaderh.com.br${caminho.replace(/\/$/, "")}`
      : isJobsPage
        ? "https://www.hrconsultoriaderh.com.br/vagas"
        : "https://www.hrconsultoriaderh.com.br/";

    document.title = title;
    document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.setAttribute("content", isPublicPage ? "index, follow" : "noindex, nofollow");
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute("content", title);
    document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute("content", description);
    document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute("content", canonical);
    document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute("content", title);
    document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute("content", description);
    document.querySelector<HTMLMetaElement>('meta[name="twitter:url"]')?.setAttribute("content", canonical);
    const canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (isPublicPage) canonicalLink?.setAttribute("href", canonical);
    else canonicalLink?.remove();
  }, [caminho]);

  if (caminho === "/cliente/auth/callback") return <ClientAuthCallbackPage />;
  if (caminho === "/cliente/login") return <ClientLoginPage />;
  if (caminho === "/cliente" || caminho.startsWith("/cliente/")) return <ClientAccessGate><ClientPortalPage /></ClientAccessGate>;

  if (caminho === "/admin/login") {
    return <AdminLoginPage />;
  }

  if (caminho === "/admin/nova-vaga") {
    return <AdminAccessGate><AdminNewJobPage /></AdminAccessGate>;
  }

  if (caminho === "/admin/candidatos") {
    return <AdminAccessGate><AdminCandidatesPage /></AdminAccessGate>;
  }

  if (caminho === "/admin/candidatos/novo") {
    return <AdminAccessGate><AdminCandidateFormPage /></AdminAccessGate>;
  }

  const editarCandidato = caminho.match(/^\/admin\/candidatos\/([^/]+)\/editar$/);
  if (editarCandidato) {
    return <AdminAccessGate><AdminCandidateFormPage id={decodeURIComponent(editarCandidato[1])} /></AdminAccessGate>;
  }

  const perfilCandidato = caminho.match(/^\/admin\/candidatos\/([^/]+)$/);
  if (perfilCandidato) {
    return <AdminAccessGate><AdminCandidateProfilePage id={decodeURIComponent(perfilCandidato[1])} /></AdminAccessGate>;
  }

  if (caminho === "/admin/processos") {
    return <AdminAccessGate><AdminProcessesPage /></AdminAccessGate>;
  }

  if (caminho === "/admin/empresas") return <AdminAccessGate><AdminCompaniesPage /></AdminAccessGate>;
  if (caminho === "/admin/solicitacoes-acesso") return <AdminAccessGate><AdminAccessRequestsPage /></AdminAccessGate>;
  if (caminho === "/admin/notificacoes") return <AdminAccessGate><AdminNotificationsPage /></AdminAccessGate>;
  if (caminho === "/admin/empresas/nova") return <AdminAccessGate><AdminCompaniesPage newCompany /></AdminAccessGate>;
  const portalPreview = caminho.match(/^\/admin\/empresas\/([^/]+)\/portal-preview$/);
  if (portalPreview) { const empresaId=decodeURIComponent(portalPreview[1]); return <AdminAccessGate><AdminPortalPreviewPage empresaId={empresaId}/></AdminAccessGate>; }
  const empresa = caminho.match(/^\/admin\/empresas\/([^/]+)$/);
  if (empresa) { const empresaId = decodeURIComponent(empresa[1]); return <AdminAccessGate><><AdminCompaniesPage id={empresaId}/><div className="bg-[#F5F7FA] px-5 pb-10"><div className="mx-auto max-w-5xl space-y-8"><PortalAccessSection empresaId={empresaId}/><CompanyContractSection empresaId={empresaId}/></div></div></></AdminAccessGate>; }
  if (caminho === "/admin/agenda") return <AdminAccessGate><AdminAgendaPage /></AdminAccessGate>;
  if (caminho === "/admin/financeiro") return <AdminAccessGate><AdminFinancialPage /></AdminAccessGate>;
  if (caminho === "/admin/talentos") return <AdminAccessGate><AdminTalentPoolPage /></AdminAccessGate>;
  if (caminho === "/admin/relatorios") return <AdminAccessGate><AdminReportsPage /></AdminAccessGate>;

  const editarVaga = caminho.match(/^\/admin\/vagas\/([^/]+)\/editar$/);
  if (editarVaga) {
    return <AdminAccessGate><AdminEditJobPage id={decodeURIComponent(editarVaga[1])} /></AdminAccessGate>;
  }

  if (caminho === "/admin") {
    return <AdminAccessGate><AdminDashboardPage /></AdminAccessGate>;
  }

  if (caminho.startsWith("/vagas")) {
    return <JobsRouter />;
  }

  return <HomeApp />;
}

function AdminAccessGate({children}:{children:React.ReactNode}){const[access,setAccess]=useState<"checking"|"allowed"|"client">("checking");useEffect(()=>{void supabase.auth.getSession().then(async({data})=>{if(!data.session){window.location.href="/admin/login";return}const{data:profile}=await supabase.from("perfis_usuarios").select("perfil").eq("usuario_id",data.session.user.id).maybeSingle();setAccess(profile&&["administrador","recrutador"].includes(profile.perfil)?"allowed":"client")})},[]);if(access==="client")return <AdminClientSessionNotice/>;return access==="allowed"?children:<main className="flex min-h-screen items-center justify-center bg-[#F5F7FA] text-[#052656]">Verificando acesso administrativo...</main>}

function ClientAccessGate({children}:{children:React.ReactNode}){const[access,setAccess]=useState<"checking"|"client"|"admin"|"anonymous">("checking");useEffect(()=>{void clientPortalSupabase.auth.getSession().then(async({data})=>{if(!data.session){setAccess("anonymous");return}const{data:profile}=await clientPortalSupabase.from("perfis_usuarios").select("perfil").eq("usuario_id",data.session.user.id).maybeSingle();setAccess(profile&&["administrador","recrutador"].includes(profile.perfil)?"admin":"client")})},[]);useEffect(()=>{if(access==="admin"||access==="anonymous")window.location.replace("/cliente/login")},[access]);return access==="client"?children:<main className="flex min-h-screen items-center justify-center bg-[#F5F7FA] text-[#052656]">Verificando acesso ao portal...</main>}
