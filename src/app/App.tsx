import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, ArrowUp, Check, ChevronDown, Users, Target, Megaphone, Mail, LockKeyhole, Building2, BriefcaseBusiness, MonitorSmartphone, Handshake, SearchCheck, BarChart3, BadgeCheck, Instagram, Palette } from "lucide-react";
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
import AdminAuthCallbackPage from "./pages/AdminAuthCallbackPage";
import ClientPortalPage from "./pages/ClientPortalPage";
import AdminPortalPreviewPage from "./pages/AdminPortalPreviewPage";
import AdminAccessRequestsPage from "./pages/AdminAccessRequestsPage";
import AdminNotificationsPage from "./pages/AdminNotificationsPage";
import { supabase } from "./lib/supabase";
import { clientPortalSupabase } from "./lib/clientPortalSupabase";

const LOGO_ASSETS = {
  color: {
    mark: "/assets/hr-solutions-logo-transparent.png",
    full: "/assets/hr-solutions-logo-transparent.png",
  },
  white: {
    mark: "/assets/hr-solutions-footer-cropped.png",
    full: "/assets/hr-solutions-footer-cropped.png",
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
  const src = LOGO_ASSETS[variant].mark;
  const textColor = variant === "white" ? "text-white" : "text-[#052656]";

  if (showText) {
    return (
      <div className={`flex items-center gap-3 ${className}`} aria-label="HR Gestão e Soluções">
        <img
          src={src}
          alt=""
          className="block h-full w-auto object-contain"
          draggable={false}
        />
        <span className={`font-['Poppins',sans-serif] text-2xl font-semibold leading-none ${textColor}`}>
          HR Gestão e Soluções
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="HR Gestão e Soluções"
      className={`block object-contain ${className}`}
      draggable={false}
    />
  );
}

const WHATSAPP_NUMBER = "5531994773992";
export const INSTAGRAM_URL = "https://www.instagram.com/hrgestaoesolucoes/";
export const CONTACT_EMAIL = "hrconsultoriarecrutamento@gmail.com";
export const WHATSAPP_BUTTON_CLASS = "inline-flex items-center justify-center gap-3 rounded-md bg-[#25D366] px-8 py-4 text-base font-semibold tracking-wide text-white shadow-lg shadow-[#25D366]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1EBE57] hover:shadow-xl hover:shadow-[#25D366]/25 focus:outline-none focus:ring-4 focus:ring-[#25D366]/25 motion-reduce:hover:translate-y-0 whitespace-nowrap";
const WHATSAPP_HEADER_BUTTON_CLASS = "inline-flex items-center justify-center gap-2 rounded-md bg-[#25D366] px-5 py-3 text-sm font-semibold tracking-wide text-white shadow-sm shadow-[#25D366]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1EBE57] hover:shadow-md hover:shadow-[#25D366]/25 focus:outline-none focus:ring-4 focus:ring-[#25D366]/25 motion-reduce:hover:translate-y-0 whitespace-nowrap";
export const INSTAGRAM_BUTTON_CLASS = "inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] px-5 py-3 text-lg font-medium tracking-wide text-white shadow-sm shadow-[#E1306C]/20 transition-all duration-200 hover:scale-[1.03] hover:shadow-md hover:shadow-[#E1306C]/30 focus:outline-none focus:ring-4 focus:ring-[#E1306C]/25 motion-reduce:transform-none whitespace-nowrap";
const EMAIL_BUTTON_CLASS = "inline-flex items-center justify-center gap-3 rounded-md border border-[#052656]/20 bg-white px-8 py-4 text-base font-semibold tracking-wide text-[#052656] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D4A62A] hover:bg-[#D4A62A]/10 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#D4A62A]/20 motion-reduce:hover:translate-y-0 whitespace-nowrap";

const MAIN_NAV_LINKS = [
  { label: "Início", href: "#inicio", sectionId: "inicio" },
  { label: "Serviços", href: "#solucoes", sectionId: "solucoes" },
  { label: "Sobre", href: "#sobre", sectionId: "sobre" },
  { label: "Contato", href: "#contato", sectionId: "contato" },
];

const PUBLIC_SOLUTION_LINKS = [
  { label: "Recrutamento e Seleção", href: "/solucoes/recrutamento-selecao" },
  { label: "Design & Marketing", href: "/solucoes/design-marca" },
  { label: "Sites", href: "/solucoes/criacao-de-sites" },
];

const PUBLIC_HEADER_LINKS = [
  { label: "Início", href: "/" },
  { label: "Serviços", href: "/#solucoes" },
  { label: "Sobre", href: "/#sobre" },
  { label: "Contato", href: "/#contato" },
];

const SOLUTION_CARDS = [
  {
    icon: <Users size={26} />,
    title: "Pessoas & Gestão",
    desc: "Para empresas que precisam contratar melhor, organizar processos de RH e fortalecer equipes.",
    items: ["Recrutamento e Seleção", "Consultoria de RH", "Soluções para equipes"],
    button: "Conhecer Recrutamento",
    href: "/solucoes/recrutamento-selecao",
  },
  {
    icon: <Palette size={26} />,
    title: "Marca & Comunicação",
    desc: "Para negócios que querem uma marca mais profissional, coerente e preparada para vender.",
    items: ["Identidade visual", "Design para empresas", "Materiais digitais"],
    button: "Conhecer Design",
    href: "/solucoes/design-marca",
  },
  {
    icon: <MonitorSmartphone size={26} />,
    title: "Presença Digital",
    desc: "Para empresas que precisam de sites, landing pages e canais digitais com mais confiança.",
    items: ["Criação de sites", "Landing pages", "Soluções online"],
    button: "Conhecer Sites",
    href: "/solucoes/criacao-de-sites",
  },
];

const PORTFOLIO_ITEMS = [
  {
    title: "Processos seletivos",
    desc: "Estruturação de vagas, triagem, entrevistas e apresentação de profissionais para empresas em crescimento.",
  },
  {
    title: "Identidade e materiais",
    desc: "Direção visual, apresentações, peças digitais e comunicação empresarial com acabamento profissional.",
  },
  {
    title: "Sites e páginas",
    desc: "Sites institucionais, landing pages e presença online integrada ao WhatsApp para gerar contatos.",
  },
];

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
  subject = "Solicitação de orçamento - HR Gestão e Soluções",
) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function FloatingBackToTop({ targetId = "inicio" }: { targetId?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    const target = document.getElementById(targetId);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      aria-label="Voltar ao topo"
      onClick={handleClick}
      className={`fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#D4A62A] text-[#052656] shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#E0B33A] focus:outline-none focus:ring-4 focus:ring-[#D4A62A]/30 sm:bottom-7 sm:right-7 sm:h-14 sm:w-14 ${
        visible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <ArrowUp size={22} strokeWidth={2.4} aria-hidden="true" />
    </button>
  );
}

function HomeApp() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [contactForm, setContactForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    necessidade: "",
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = MAIN_NAV_LINKS.map((link) => link.sectionId ? document.getElementById(link.sectionId) : null).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-30% 0px -45% 0px", threshold: [0.15, 0.35, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const solutions = [
    {
      icon: <Users size={28} aria-hidden="true" />,
      title: "Recrutamento & Seleção",
      desc: "Encontramos talentos alinhados ao propósito e às necessidades da sua empresa.",
      href: "/solucoes/recrutamento-selecao",
      sectionId: "recrutamento-selecao",
    },
    {
      icon: <Palette size={28} aria-hidden="true" />,
      title: "Design & Marca",
      desc: "Criamos identidades visuais e materiais que fortalecem sua comunicação.",
      href: "/solucoes/design-marca",
      sectionId: "design-marca",
    },
    {
      icon: <MonitorSmartphone size={28} aria-hidden="true" />,
      title: "Sites & Soluções Digitais",
      desc: "Desenvolvemos experiências digitais para empresas modernas.",
      href: "/solucoes/criacao-de-sites",
      sectionId: "sites",
    },
  ];

  const differentials = [
    { icon: <Target size={24} aria-hidden="true" />, title: "Estratégia personalizada" },
    { icon: <BriefcaseBusiness size={24} aria-hidden="true" />, title: "Soluções completas" },
    { icon: <BarChart3 size={24} aria-hidden="true" />, title: "Visão de negócio" },
    { icon: <BadgeCheck size={24} aria-hidden="true" />, title: "Criatividade e tecnologia" },
  ];

  const niches = ["Empresas em crescimento", "Pequenos negócios", "Indústria e comércio", "Serviços profissionais", "Projetos digitais", "Marcas em reposicionamento"];

  const handleContactChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setContactForm((current) => ({ ...current, [name]: value }));
    if (formError) setFormError("");
  };

  const handleContactSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nome = contactForm.nome.trim();
    const email = contactForm.email.trim();
    const telefone = contactForm.telefone.trim();
    const necessidade = contactForm.necessidade.trim();

    if (!nome || !email || !telefone || !necessidade) {
      setFormError("Preencha todos os campos para continuar.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Informe um e-mail válido.");
      return;
    }

    const body = `Olá, gostaria de entrar em contato com a HR Gestão e Soluções.

Nome: ${nome}
E-mail: ${email}
Telefone: ${telefone}
Descrição da necessidade: ${necessidade}`;

    window.location.href = emailLink(body, "Contato pelo site - HR Gestão e Soluções");
  };

  const navLinkClass = (sectionId: string) =>
    `relative text-sm font-semibold tracking-wide transition-colors after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:bg-[#D4A62A] after:transition-all ${
      activeSection === sectionId
        ? "text-[#D4A62A] after:w-full"
        : `${scrolled ? "text-[#052656]" : "text-white"} hover:text-[#D4A62A] after:w-0 hover:after:w-full`
    }`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8F8F6] font-['Inter',sans-serif] text-[#052656] antialiased">
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${scrolled ? "border-[#052656]/10 bg-white/95 shadow-xl shadow-[#052656]/8 backdrop-blur" : "border-white/15 bg-[#052656]/90 shadow-2xl shadow-[#052656]/20 backdrop-blur-md"}`}
      >
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-5 py-0 sm:px-6 lg:gap-6 lg:px-10">
          <a href="#inicio" aria-label="Ir para o início" className="flex items-center">
            <Logo variant={scrolled ? "color" : "white"} showText={false} className="h-14 min-h-14 max-h-14 w-auto max-w-none flex-none sm:h-[80px] sm:min-h-[80px] sm:max-h-[80px]" />
          </a>

          <nav className="hidden flex-1 items-center justify-center gap-6 xl:flex 2xl:gap-10" aria-label="Menu principal">
            {MAIN_NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => link.sectionId && setActiveSection(link.sectionId)}
                className={link.sectionId ? navLinkClass(link.sectionId) : `relative text-sm font-semibold tracking-wide transition-colors ${scrolled ? "text-[#052656]" : "text-white"} hover:text-[#D4A62A]`}
                aria-current={link.sectionId && activeSection === link.sectionId ? "page" : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            <a href="/cliente/login" className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${scrolled ? "border-[#052656]/15 text-[#052656] hover:border-[#D4A62A]" : "border-white/20 text-white hover:border-[#D4A62A]"}`}>
              <Building2 size={15} aria-hidden="true" /> Cliente
            </a>
            <a href="/admin/login" className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${scrolled ? "border-[#052656]/15 text-[#052656] hover:border-[#D4A62A]" : "border-white/20 text-white hover:border-[#D4A62A]"}`}>
              <LockKeyhole size={15} aria-hidden="true" /> Recrutador
            </a>
            <a
              href={`${whatsappLink()}?text=${encodeURIComponent("Olá, gostaria de falar com um especialista da HR Gestão e Soluções.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 ${scrolled ? "bg-[#052656] text-white shadow-[#052656]/15 hover:bg-[#0B3470]" : "bg-[#D4A62A] text-[#052656] shadow-[#D4A62A]/20 hover:bg-[#E0B33A]"}`}
            >
              <WhatsAppIcon size={18} />
              Falar com especialista
            </a>
          </div>

          <button
            type="button"
            className={`rounded-xl p-2 xl:hidden ${scrolled ? "text-[#052656]" : "text-white"}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="mx-auto max-w-7xl border-t border-[#052656]/10 bg-white px-5 py-6 shadow-xl sm:px-6 xl:hidden">
            <div className="flex flex-col gap-5">
              {MAIN_NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    if (link.sectionId) setActiveSection(link.sectionId);
                    setMenuOpen(false);
                  }}
                  className={`text-lg font-semibold transition-colors ${link.sectionId && activeSection === link.sectionId ? "text-[#D4A62A]" : "text-[#052656]"}`}
                  aria-current={link.sectionId && activeSection === link.sectionId ? "page" : undefined}
                >
                  {link.label}
                </a>
              ))}
              <div className="grid grid-cols-2 gap-3 border-t border-[#052656]/10 pt-5">
                <a href="/cliente/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#052656]/15 px-3 py-3 text-sm font-semibold text-[#052656]"><Building2 size={16} aria-hidden="true" /> Cliente</a>
                <a href="/admin/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#052656]/15 px-3 py-3 text-sm font-semibold text-[#052656]"><LockKeyhole size={16} aria-hidden="true" /> Recrutador</a>
              </div>
              <a
                href={`${whatsappLink()}?text=${encodeURIComponent("Olá, gostaria de falar com um especialista da HR Gestão e Soluções.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${WHATSAPP_HEADER_BUTTON_CLASS} w-full`}
              >
                <WhatsAppIcon size={18} />
                Falar com especialista
              </a>
            </div>
          </div>
        )}
      </header>

      <main>
        <section id="inicio" className="relative overflow-hidden bg-[#052656] pt-36 sm:pt-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_12%,rgba(212,166,42,0.23),transparent_25%),linear-gradient(135deg,#052656_0%,#092f65_58%,#031b3d_100%)]" />
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:72px_72px]" />
          <div className="relative mx-auto grid min-h-[720px] max-w-7xl grid-cols-1 items-center gap-14 px-5 pb-20 sm:px-6 lg:grid-cols-[1.12fr_0.88fr] lg:px-10 lg:pb-28">
            <div className="max-w-3xl motion-safe:animate-[fadeInUp_700ms_ease-out_both]">
              <span className="mb-7 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-[#F0C95C]"><span className="h-px w-8 bg-[#D4A62A]" /> Consultoria estratégica</span>
              <h1 className="font-['Poppins',sans-serif] text-4xl font-semibold leading-[1.04] tracking-[-0.03em] text-white sm:text-6xl lg:text-[5.15rem]">
                O próximo nível do seu negócio começa pelas pessoas.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-[1.8] text-white/70 sm:text-xl">
                A HR Gestão e Soluções conecta estratégia, criatividade e inovação para ajudar empresas a crescerem.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a href="#solucoes" className="brand-focus inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#D4A62A] px-8 py-4 text-base font-bold text-[#052656] shadow-xl shadow-[#D4A62A]/20 transition-all hover:-translate-y-1 hover:bg-[#E0B33A] sm:w-auto">
                  Conheça nossas soluções <ArrowRight size={18} aria-hidden="true" />
                </a>
                <a href={`${whatsappLink()}?text=${encodeURIComponent("Olá, gostaria de falar com um especialista da HR Gestão e Soluções.")}`} target="_blank" rel="noopener noreferrer" className="brand-focus inline-flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur transition-all hover:-translate-y-1 hover:border-white/45 hover:bg-white/10 sm:w-auto">
                  <WhatsAppIcon size={20} /> Falar com especialista
                </a>
              </div>
              <div className="mt-14 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-6 text-sm text-white/55">
                <span className="inline-flex items-center gap-2"><BadgeCheck size={17} className="text-[#D4A62A]" /> Visão integrada</span>
                <span className="inline-flex items-center gap-2"><Handshake size={17} className="text-[#D4A62A]" /> Atendimento próximo</span>
                <span className="inline-flex items-center gap-2"><BarChart3 size={17} className="text-[#D4A62A]" /> Foco em resultado</span>
              </div>
            </div>
            <div className="flex min-h-[clamp(360px,58vw,620px)] items-center justify-center lg:justify-end motion-safe:animate-[avatarFloat_7s_ease-in-out_infinite]">
              <img
                src="/assets/home-avatar-transparent.png"
                alt="Dois profissionais da HR Gestão e Soluções"
                className="h-auto max-h-[clamp(360px,68vh,560px)] w-[min(94vw,520px)] max-w-none object-contain motion-safe:animate-[avatarBreath_5s_ease-in-out_infinite] lg:w-[clamp(360px,32vw,440px)]"
                draggable={false}
              />
            </div>
          </div>
        </section>

        <section id="nichos" className="relative bg-[#F8F8F6] py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
              <div>
                <span className="brand-kicker">Para quem fazemos</span>
                <h2 className="mt-5 font-['Poppins',sans-serif] text-3xl font-semibold leading-tight tracking-[-0.02em] text-[#052656] md:text-5xl">
                  Soluções para diferentes momentos de negócio.
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {niches.map((niche) => (
                  <div key={niche} className="group flex min-h-20 items-end border-b border-[#052656]/20 bg-white p-5 text-base font-semibold text-[#052656] transition-all duration-300 hover:-translate-y-1 hover:border-[#D4A62A] hover:shadow-xl hover:shadow-[#052656]/8">
                    <span className="transition-colors group-hover:text-[#8C6A10]">{niche}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="solucoes" className="bg-white py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
            <div className="mx-auto mb-14 max-w-3xl text-center motion-safe:animate-[fadeInUp_700ms_ease-out_both]">
              <span className="brand-kicker">Nossas soluções</span>
              <h2 className="mt-5 font-['Poppins',sans-serif] text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-[#052656] md:text-5xl">
                Escolha o caminho certo para o momento da sua empresa.
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {solutions.map((solution) => (
                <a
                  key={solution.title}
                  id={solution.sectionId}
                  href={solution.href}
                  className="brand-focus group relative flex min-h-[360px] flex-col overflow-hidden border border-[#052656]/12 border-t-4 border-t-transparent bg-[#F8F8F6] p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#052656]/20 hover:border-t-[#D4A62A] hover:bg-white hover:shadow-2xl hover:shadow-[#052656]/12 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <span className="absolute right-7 top-7 text-xs font-bold tracking-[0.18em] text-[#052656]/30">0{solutions.indexOf(solution) + 1}</span>
                  <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#052656] text-[#D4A62A] transition-colors group-hover:bg-[#D4A62A] group-hover:text-[#052656]">
                    {solution.icon}
                  </div>
                  <h3 className="max-w-[15rem] font-['Poppins',sans-serif] text-2xl font-semibold leading-tight text-[#052656]">{solution.title}</h3>
                  <p className="mt-5 text-lg leading-[1.7] text-[#4B4B4B]">{solution.desc}</p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-8 text-base font-semibold text-[#052656] transition-colors group-hover:text-[#D4A62A]"><span>
                    Conhecer solução
                    </span><ArrowRight size={17} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="sobre" className="bg-[#F8F8F6] py-24 md:py-32">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:px-10">
            <div>
              <span className="brand-kicker">Diferenciais</span>
              <h2 className="mt-5 font-['Poppins',sans-serif] text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-[#052656] md:text-5xl">
                Uma visão integrada para transformar intenção em resultado.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-[1.75] text-[#4B4B4B]">
                A HR Gestão e Soluções combina análise, criação e execução digital para apoiar empresas com soluções bem direcionadas, sem excesso de complexidade.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {differentials.map((item) => (
                <article key={item.title} className="group border-t border-[#052656]/20 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-t-[#D4A62A] hover:shadow-xl hover:shadow-[#052656]/8 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D4A62A]/16 text-[#8C6A10] transition-colors group-hover:bg-[#D4A62A] group-hover:text-[#052656]">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-semibold leading-tight text-[#052656]">{item.title}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contato" className="relative overflow-hidden bg-[#052656] py-24 md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(212,166,42,0.16),transparent_28%)]" />
          <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
            <div>
              <span className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-[#F0C95C]"><span className="h-px w-8 bg-[#D4A62A]" /> Próximo passo</span>
              <h2 className="mt-5 font-['Poppins',sans-serif] text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-white md:text-5xl">
                Vamos transformar sua ideia em resultado?
              </h2>
              <p className="mt-6 max-w-2xl text-xl leading-[1.7] text-white/70">
                Conte o que sua empresa precisa e direcionamos a melhor solução dentro dos pilares da HR Gestão e Soluções.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <a
                  href={`${whatsappLink()}?text=${encodeURIComponent("Olá, gostaria de entrar em contato com a HR Gestão e Soluções.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${WHATSAPP_BUTTON_CLASS} w-full sm:w-auto`}
                >
                  <WhatsAppIcon size={20} />
                  Entrar em contato
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir Instagram oficial da HR Gestão e Soluções em nova aba"
                  className={`${INSTAGRAM_BUTTON_CLASS} w-full sm:w-auto`}
                >
                  <Instagram size={20} aria-hidden="true" />
                  Instagram
                </a>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="border border-white/10 bg-white p-6 shadow-2xl shadow-black/30 ring-8 ring-white/5 sm:p-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="nome" className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[#052656]">
                    Nome
                  </label>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    value={contactForm.nome}
                    onChange={handleContactChange}
                    className="w-full rounded-md border border-[#052656]/14 bg-[#F8F8F6] px-4 py-3 text-base text-[#052656] outline-none transition-colors focus:border-[#D4A62A] focus:bg-white focus:ring-4 focus:ring-[#D4A62A]/10"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[#052656]">
                    E-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    className="w-full rounded-md border border-[#052656]/14 bg-[#F8F8F6] px-4 py-3 text-base text-[#052656] outline-none transition-colors focus:border-[#D4A62A] focus:bg-white focus:ring-4 focus:ring-[#D4A62A]/10"
                    placeholder="voce@empresa.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="telefone" className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[#052656]">
                    Telefone
                  </label>
                  <input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    value={contactForm.telefone}
                    onChange={handleContactChange}
                    className="w-full rounded-md border border-[#052656]/14 bg-[#F8F8F6] px-4 py-3 text-base text-[#052656] outline-none transition-colors focus:border-[#D4A62A] focus:bg-white focus:ring-4 focus:ring-[#D4A62A]/10"
                    placeholder="(31) 99999-9999"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="necessidade" className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-[#052656]">
                    Descrição da necessidade
                  </label>
                  <textarea
                    id="necessidade"
                    name="necessidade"
                    rows={5}
                    value={contactForm.necessidade}
                    onChange={handleContactChange}
                    className="w-full resize-none rounded-md border border-[#052656]/14 bg-[#F8F8F6] px-4 py-3 text-base text-[#052656] outline-none transition-colors focus:border-[#D4A62A] focus:bg-white focus:ring-4 focus:ring-[#D4A62A]/10"
                    placeholder="Fale sobre o desafio, projeto ou solução que sua empresa precisa."
                  />
                </div>
              </div>

              {formError && (
                <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-base font-medium text-red-700">
                  {formError}
                </p>
              )}

              <button type="submit" className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-md bg-[#D4A62A] px-8 py-4 text-base font-bold text-[#052656] shadow-lg shadow-[#D4A62A]/20 transition-all hover:-translate-y-0.5 hover:bg-[#E0B33A] hover:shadow-xl hover:shadow-[#D4A62A]/25">
                <Mail size={20} aria-hidden="true" />
                Entrar em contato
              </button>
            </form>
          </div>
        </section>
      </main>

      <PublicFooter />
      <FloatingBackToTop targetId="inicio" />
    </div>
  );
}

function LegacyHomeApp() {
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

  const navLinks = MAIN_NAV_LINKS;

  const services = [
    {
      icon: <Users size={22} />,
      title: "Pessoas & Gestão",
      desc: "Recrutamento e seleção, consultoria de RH e soluções para equipes.",
    },
    {
      icon: <Target size={22} />,
      title: "Design & Marca",
      desc: "Identidade visual, materiais digitais e comunicação empresarial.",
    },
    {
      icon: <MonitorSmartphone size={22} />,
      title: "Soluções Digitais",
      desc: "Criação de sites, landing pages e presença online.",
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
      title: "Pessoas & Gestão",
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
      icon: <Palette size={24} />,
      title: "Design & Marca",
      items: [
        "Identidade visual",
        "Criação de logotipos",
        "Materiais digitais",
        "Artes para redes sociais",
        "Comunicação empresarial",
        "Apresentações comerciais",
      ],
    },
    {
      icon: <MonitorSmartphone size={24} />,
      title: "Soluções Digitais",
      items: [
        "Criação de Sites Institucionais",
        "Landing Pages",
        "Presença online",
        "Google Meu Negócio",
        "SEO Local",
        "Gestão de LinkedIn Empresarial",
        "Materiais para presença digital",
      ],
    },
  ];

  const businessPackages = [
    {
      icon: <SearchCheck size={24} />,
      name: "Essencial",
      description: "Ideal para empresas que precisam resolver uma necessidade pontual com direcionamento claro.",
      features: [
        "Alinhamento inicial",
        "Escopo objetivo",
        "Entrega direcionada",
        "Canal de contato próximo",
      ],
    },
    {
      icon: <Handshake size={24} />,
      name: "Estratégico",
      description: "Para empresas que precisam combinar diagnóstico, execução e acompanhamento.",
      featured: true,
      features: [
        "Diagnóstico da necessidade",
        "Plano de ação",
        "Acompanhamento do projeto",
        "Suporte durante a execução",
      ],
    },
    {
      icon: <BarChart3 size={24} />,
      name: "Premium",
      description: "Para empresas que buscam evolução contínua em pessoas, marca ou presença digital.",
      features: [
        "Consultoria estratégica",
        "Estruturação de processos",
        "Indicadores",
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

    const texto = `Olá, tenho interesse em solicitar uma proposta da HR Gestão e Soluções.

Nome: ${nome}
Empresa: ${empresa}
Telefone/WhatsApp: ${telefone}
Solução de interesse: ${vaga}
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

    const subject = "Solicitação de proposta - HR Gestão e Soluções";

    const body = `Olá, tenho interesse em solicitar uma proposta da HR Gestão e Soluções.

Nome: ${nome}
Empresa: ${empresa}
Telefone/WhatsApp: ${telefone}
Solução de interesse: ${vaga}
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
        <div className="mx-auto flex min-h-[128px] max-w-7xl items-center justify-between gap-8 px-5 py-5 sm:px-6 lg:px-10">
          {/* Logo */}
          <a href="#inicio" className="flex items-center" aria-label="Ir para o início">
            <Logo
              variant={scrolled ? "color" : "white"}
              showText={false}
              className="h-auto w-[220px] max-w-none shrink-0 sm:w-[250px]"
            />
          </a>

          {/* Desktop nav */}
          <nav className="hidden xl:flex items-center gap-7" aria-label="Menu principal" lang="pt-BR" translate="no">
            <a href="#inicio" className="text-lg font-medium tracking-wide transition-colors hover:opacity-70" style={{ color: scrolled ? "#052656" : "#fff" }}>Início</a>
            <div className="group relative">
              <button type="button" className="inline-flex items-center gap-1 text-lg font-medium tracking-wide transition-colors hover:opacity-70" style={{ color: scrolled ? "#052656" : "#fff" }}>
                Soluções
                <ChevronDown size={16} aria-hidden="true" />
              </button>
              <div className="invisible absolute left-0 top-full min-w-[260px] translate-y-3 border border-border bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-2 group-hover:opacity-100">
                {MAIN_NAV_LINKS.slice(1, 5).map((link) => (
                  <a key={link.href} href={link.href} className="block px-4 py-3 text-base font-semibold text-[#052656] transition-colors hover:bg-[#F5F7FA] hover:text-[#D4A62A]">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <a href="#sobre" className="text-lg font-medium tracking-wide transition-colors hover:opacity-70" style={{ color: scrolled ? "#052656" : "#fff" }}>Sobre</a>
            <a href="#portfolio" className="text-lg font-medium tracking-wide transition-colors hover:opacity-70" style={{ color: scrolled ? "#052656" : "#fff" }}>Portfólio</a>
            <a href="#contato" className="text-lg font-medium tracking-wide transition-colors hover:opacity-70" style={{ color: scrolled ? "#052656" : "#fff" }}>Contato</a>
          </nav>

          {/* CTA */}
          <div className="hidden xl:flex items-center gap-3">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir Instagram oficial da HR Gestão e Soluções em nova aba"
              className={INSTAGRAM_BUTTON_CLASS}
            >
              <Instagram size={18} aria-hidden="true" />
              Instagram
            </a>
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
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir Instagram oficial da HR Gestão e Soluções em nova aba"
              className={`${INSTAGRAM_BUTTON_CLASS} w-full`}
            >
              <Instagram size={18} aria-hidden="true" />
              Instagram
            </a>
          </div>
        )}
      </header>

      {/* HERO */}
      <section id="inicio" className="relative min-h-[88vh] flex items-center">
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
              Soluções estratégicas para empresas
            </span>
            <h1
              className="font-['Playfair_Display',serif] text-4xl sm:text-5xl lg:text-6xl leading-[1.08] font-semibold text-white mb-7"
            >
              Pessoas, marcas e tecnologia para transformar negócios.
            </h1>
            <p className="text-xl md:text-2xl text-white/80 leading-relaxed mb-10 max-w-2xl font-light">
              Ajudamos empresas a crescerem através de soluções em gestão de pessoas, design estratégico e presença digital.
            </p>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-3 bg-[#D4A62A] px-8 py-4 text-lg font-semibold tracking-wide text-[#052656] transition-colors duration-200 hover:bg-[#B98E20] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4A62A]/35 motion-reduce:transition-none sm:w-auto whitespace-nowrap"
              >
                <WhatsAppIcon size={20} />
                Escolher solução
                <ArrowRight size={15} />
              </a>
              <a
                href="#solucoes"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 border border-[#D4A62A] bg-transparent px-8 py-4 text-lg font-semibold tracking-wide text-[#D4A62A] transition-colors duration-200 hover:bg-[#D4A62A]/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D4A62A]/30 motion-reduce:transition-none whitespace-nowrap"
              >
                Ver caminhos
              </a>
            </div>
          </div>
        </div>

        <a href="#solucoes" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 hover:text-white/80 transition-colors motion-safe:animate-bounce motion-reduce:transition-none" aria-label="Ir para soluções">
          <ChevronDown size={24} />
        </a>
      </section>

      {/* CAMINHOS */}
      <section id="solucoes" className="py-20 md:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10">
          <div className="mb-12 max-w-3xl">
            <span className="inline-block text-base font-medium tracking-[0.18em] uppercase mb-5" style={{ color: "#D4A62A" }}>
              Decisão rápida
            </span>
            <h2 className="font-['Playfair_Display',serif] text-4xl md:text-5xl font-semibold leading-tight text-foreground mb-5">
              Qual solução sua empresa precisa?
            </h2>
            <p className="text-lg leading-[1.75] text-muted-foreground">
              Escolha o caminho mais alinhado ao momento do seu negócio e conheça a solução ideal para contratar, comunicar ou crescer online.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {SOLUTION_CARDS.map((card) => (
              <article key={card.title} className="group flex min-h-[380px] flex-col border border-border bg-white p-7 md:p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D4A62A]/60 hover:shadow-xl hover:shadow-[#052656]/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <div className="mb-7 flex h-12 w-12 items-center justify-center bg-[#052656] text-[#D4A62A] transition-colors duration-300 group-hover:bg-[#D4A62A] group-hover:text-[#052656]">
                  {card.icon}
                </div>
                <h3 className="font-['Playfair_Display',serif] text-3xl font-semibold leading-tight text-foreground mb-4">
                  {card.title}
                </h3>
                <p className="text-lg leading-[1.65] text-muted-foreground mb-8">
                  {card.desc}
                </p>
                <ul className="mb-8 space-y-3">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-base font-medium leading-snug text-foreground">
                      <Check size={16} className="mt-0.5 shrink-0 text-[#D4A62A]" strokeWidth={2.8} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <a href={card.href} className="mt-auto inline-flex w-full items-center justify-center gap-2 border border-[#D4A62A] bg-[#D4A62A] px-5 py-3 text-base font-semibold text-[#052656] transition-colors hover:bg-[#E0B33A]">
                  {card.button}
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO */}
      <section id="portfolio" className="py-20 md:py-28" style={{ backgroundColor: "#F5F7FA" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10">
          <div className="mb-14 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-16 items-end">
            <div>
              <span className="inline-block text-base font-medium tracking-[0.18em] uppercase mb-5" style={{ color: "#D4A62A" }}>
                Portfólio
              </span>
              <h2 className="font-['Playfair_Display',serif] text-4xl md:text-5xl font-semibold leading-tight text-foreground">
                Entregas para diferentes momentos do negócio.
              </h2>
            </div>
            <p className="text-lg leading-[1.75] text-muted-foreground">
              A HR Gestão e Soluções combina a autoridade construída em Recursos Humanos com novas frentes de marca e tecnologia para resolver necessidades reais de empresas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PORTFOLIO_ITEMS.map((item) => (
              <article key={item.title} className="border border-border bg-white p-7 md:p-8 shadow-sm">
                <h3 className="font-['Playfair_Display',serif] text-2xl font-semibold text-foreground mb-4">{item.title}</h3>
                <p className="text-lg leading-[1.65] text-muted-foreground">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center">
          <div>
            <span className="inline-block text-base font-medium tracking-[0.18em] uppercase mb-6" style={{ color: "#D4A62A" }}>
              Quem somos
            </span>
            <h2 className="font-['Playfair_Display',serif] text-4xl md:text-5xl font-semibold leading-tight text-foreground mb-6">
              Sobre a HR Gestão e Soluções
            </h2>
            <div className="w-12 h-px mb-8" style={{ backgroundColor: "#D4A62A" }} />
            <p className="text-lg leading-[1.75] text-muted-foreground mb-6">
              A HR Gestão e Soluções une pessoas, criatividade e tecnologia para ajudar empresas a crescerem com mais clareza, presença e estratégia.
            </p>
            <p className="text-lg leading-[1.75] text-muted-foreground">
              Atuamos em Recursos Humanos, Design e Soluções Digitais, conectando gestão, marca e presença online em uma experiência consultiva e próxima.
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
              Soluções estratégicas para empresas
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-[1.7]" style={{ color: "rgba(255,255,255,0.72)" }}>
              Organizamos soluções em três frentes para apoiar empresas que querem crescer com estrutura, comunicação e presença digital.
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
      <section id="consultoria-rh" className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10">
          <div className="mb-16 max-w-3xl">
            <span className="inline-block text-base font-medium tracking-[0.18em] uppercase mb-6" style={{ color: "#D4A62A" }}>
              Soluções Empresariais
            </span>
            <h2 className="font-['Playfair_Display',serif] text-4xl md:text-5xl font-semibold text-foreground leading-tight">
              Pessoas, marca e tecnologia trabalhando juntas
            </h2>
            <p className="mt-6 text-lg leading-[1.75] text-muted-foreground">
              Combinamos gestão de pessoas, design e soluções digitais para apoiar empresas em diferentes momentos: contratação, organização interna, fortalecimento de marca e presença online.
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
              Formatos de contratação
            </span>
            <h2 className="font-['Playfair_Display',serif] text-4xl md:text-5xl font-semibold text-foreground leading-tight">
              Escolha o apoio ideal para sua empresa
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
              Pessoas + Design + Digital
            </span>
            <h2 className="font-['Playfair_Display',serif] text-4xl md:text-5xl font-semibold text-white leading-tight mb-6">
              Fortalecemos equipes, marcas e canais digitais com uma visão estratégica.
            </h2>
            <p className="text-lg leading-[1.75]" style={{ color: "rgba(255,255,255,0.70)" }}>
              Uma combinação estratégica para melhorar gestão, comunicação e presença digital sem perder o cuidado humano em cada entrega.
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
            Da gestão de pessoas ao fortalecimento da marca e presença digital, oferecemos soluções para impulsionar o crescimento do seu negócio.
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
              href={`${whatsappLink()}?text=${encodeURIComponent("Olá, gostaria de falar sobre as soluções empresariais da HR Gestão e Soluções.")}`}
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
                A HR Gestão e Soluções atua com soluções para empresas em diferentes áreas: gestão de pessoas, comunicação visual e presença digital. Em Recursos Humanos, seguimos apoiando contratações de diferentes níveis com análise cuidadosa do perfil ideal para cada função.
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
              A HR Gestão e Soluções organiza cada etapa com clareza, acompanhamento próximo e foco em soluções mais assertivas para a realidade de cada empresa.
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
              A HR Gestão e Soluções atende empresas em todo o Brasil, conduzindo projetos e alinhamentos de forma remota, por WhatsApp, e-mail ou videochamada. Quando necessário, também realizamos atendimentos presenciais conforme a demanda da empresa em Belo Horizonte.
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
              Por que escolher a HR Gestão e Soluções?
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
            Pronto para transformar o próximo passo da sua empresa?
          </h2>
          <p className="text-xl leading-[1.7] mb-10" style={{ color: "rgba(255,255,255,0.68)" }}>
            Conte se sua empresa precisa contratar melhor, fortalecer a marca ou criar presença digital. Vamos entender o cenário e indicar o caminho mais estratégico.
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-4">
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className={`${WHATSAPP_BUTTON_CLASS} w-full sm:w-auto`}
            >
              <WhatsAppIcon size={20} />
              Falar com a HR Gestão e Soluções
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
              Fale com a HR Gestão e Soluções e conte qual solução sua empresa precisa. Preencha o formulário para receber um retorno sobre os próximos passos.
            </p>
            <div className="rounded-2xl border border-[#D4A62A]/20 bg-[#D4A62A]/8 p-5 mb-8">
              <p className="text-base font-medium tracking-[0.18em] uppercase mb-2" style={{ color: "#D4A62A" }}>
                Atendimento remoto para todo o Brasil
              </p>
              <p className="text-lg leading-[1.7] text-muted-foreground">
                A HR Gestão e Soluções atende empresas em todo o Brasil, conduzindo projetos e alinhamentos de forma remota, por WhatsApp, e-mail ou videochamada. Quando necessário, também realizamos atendimentos presenciais conforme a demanda da empresa em Belo Horizonte.
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
              { field: "vaga", label: "Solução de interesse", placeholder: "Ex: Recrutamento, identidade visual ou site" },
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
                placeholder="Fale um pouco sobre o que sua empresa precisa..."
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
                A HR Gestão e Soluções une Recursos Humanos, Design e Soluções Digitais para ajudar empresas a crescerem com estratégia, criatividade e presença.
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
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir Instagram oficial da HR Gestão e Soluções em nova aba"
                  className={`${INSTAGRAM_BUTTON_CLASS} w-fit`}
                >
                  <Instagram size={18} aria-hidden="true" />
                  Instagram
                </a>
              </div>
            </div>
          </div>

          <div
            className="pt-8 border-t text-center text-base leading-relaxed"
            style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}
          >
            © HR Gestão e Soluções. Todos os direitos reservados.
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

type SolutionPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  items: string[];
  benefits: string[];
  examples: string[];
  cta: string;
  message: string;
};

function PublicHeader({ active }: { active?: string }) {
  const [open, setOpen] = useState(false);
  const headerLinks = PUBLIC_HEADER_LINKS;

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-5">
        <div className="mx-auto flex min-h-[84px] max-w-7xl items-center justify-between gap-6 rounded-2xl border border-[#052656]/10 bg-white/95 px-4 py-3 shadow-xl shadow-[#052656]/8 backdrop-blur sm:px-6 lg:px-8">
        <a href="/" className="flex items-center" aria-label="Ir para o início">
          <Logo variant="color" showText={false} className="h-[64px] w-auto max-w-none shrink-0 sm:h-[65px]" />
        </a>
        <nav className="hidden xl:flex flex-1 items-center justify-center gap-14" aria-label="Menu principal">
          {headerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`relative text-[17px] font-semibold tracking-wide transition-colors after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:bg-[#D4A62A] after:transition-all ${
                active === link.href ? "text-[#D4A62A] after:w-full" : "text-[#052656] hover:text-[#D4A62A] after:w-0 hover:after:w-full"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>
          <div className="hidden xl:flex shrink-0 items-center gap-2">
            <a href="/cliente/login" className="inline-flex items-center gap-2 rounded-xl border border-[#052656]/15 px-3 py-2 text-xs font-semibold text-[#052656] transition-colors hover:border-[#D4A62A]"><Building2 size={15} aria-hidden="true" /> Cliente</a>
            <a href="/admin/login" className="inline-flex items-center gap-2 rounded-xl border border-[#052656]/15 px-3 py-2 text-xs font-semibold text-[#052656] transition-colors hover:border-[#D4A62A]"><LockKeyhole size={15} aria-hidden="true" /> Recrutador</a>
            <a href={`${whatsappLink()}?text=${encodeURIComponent("Olá, gostaria de falar com um especialista da HR Gestão e Soluções.")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#052656] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#052656]/15 transition-all hover:-translate-y-0.5 hover:bg-[#0B3470] hover:shadow-xl hover:shadow-[#052656]/20">
            <WhatsAppIcon size={18} />
            Falar com especialista
          </a>
        </div>
        <button type="button" className="xl:hidden p-2" onClick={() => setOpen(!open)} aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open}>
          {open ? <X size={22} color="#052656" /> : <Menu size={22} color="#052656" />}
        </button>
      </div>
      {open && (
        <div className="xl:hidden bg-white border-t border-border px-6 py-6 flex flex-col gap-5">
          {headerLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-lg font-medium text-foreground tracking-wide">
              {link.label}
            </a>
          ))}
          <div className="grid grid-cols-2 gap-3 border-t border-[#052656]/10 pt-5">
            <a href="/cliente/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#052656]/15 px-3 py-3 text-sm font-semibold text-[#052656]"><Building2 size={16} aria-hidden="true" /> Cliente</a>
            <a href="/admin/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#052656]/15 px-3 py-3 text-sm font-semibold text-[#052656]"><LockKeyhole size={16} aria-hidden="true" /> Recrutador</a>
          </div>
          <a href={`${whatsappLink()}?text=${encodeURIComponent("Olá, gostaria de falar com um especialista da HR Gestão e Soluções.")}`} target="_blank" rel="noopener noreferrer" className={`${WHATSAPP_HEADER_BUTTON_CLASS} w-full`}>
            <WhatsAppIcon size={18} />
            Falar com especialista
          </a>
        </div>
      )}
    </header>
  );
}

function PublicFooter() {
  const footerNavLinks = [
    { label: "Início", href: "/" },
    { label: "Serviços", href: "/#solucoes" },
    { label: "Sobre", href: "/#sobre" },
    { label: "Contato", href: "/#contato" },
  ];

  return (
    <footer style={{ backgroundColor: "#052656" }} className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_1fr_1.15fr] lg:gap-16 xl:gap-20 mb-16">
          <div className="text-center md:text-left">
            <div className="mb-8 flex justify-center md:justify-start">
              <div className="inline-flex flex-col items-center" aria-label="HR Gestão e Soluções">
                <Logo variant="white" showText={false} className="h-20 w-auto max-w-[280px] sm:h-24 sm:max-w-[340px] lg:h-[104px] lg:max-w-[380px]" />
              </div>
            </div>
            <p className="mx-auto max-w-sm text-base leading-[1.75] md:mx-0" style={{ color: "rgba(255,255,255,0.58)" }}>
              Pessoas, marcas e tecnologia para transformar negócios.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-[#D4A62A] mb-6">Navegação</p>
            <ul className="space-y-4">
              {footerNavLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-base font-medium transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.66)" }}>
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="/admin/login" className="group inline-flex items-start gap-2 text-white/55 transition-colors hover:text-[#D4A62A]">
                  <LockKeyhole size={17} className="mt-1" aria-hidden="true" />
                  <span>
                    <strong className="block text-lg">Área do Recrutador</strong>
                    <span className="block text-sm text-white/40 group-hover:text-white/60">Gestão administrativa e processos seletivos</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="/cliente/login" className="group inline-flex items-start gap-2 text-white/55 transition-colors hover:text-[#D4A62A]">
                  <Building2 size={17} className="mt-1" aria-hidden="true" />
                  <span>
                    <strong className="block text-lg">Área do Cliente</strong>
                    <span className="block text-sm text-white/40 group-hover:text-white/60">Acompanhamento de vagas e candidatos liberados</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-[#D4A62A] mb-6">Serviços</p>
            <ul className="space-y-4">
              {PUBLIC_SOLUTION_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-base font-medium leading-relaxed transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.66)" }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-[#D4A62A] mb-6">Contato</p>
            <div className="flex flex-col items-center gap-4 md:items-start">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-[#25D366] px-5 py-3 text-base font-semibold text-white shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1EBE57] sm:w-fit">
                <WhatsAppIcon size={18} />
                WhatsApp
              </a>
              <a href={emailLink()} className="inline-flex w-full items-center justify-center gap-3 rounded-md border border-white/15 bg-white/5 px-5 py-3 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D4A62A] hover:bg-[#D4A62A]/10 sm:w-fit">
                <Mail size={18} aria-hidden="true" />
                {CONTACT_EMAIL}
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir Instagram oficial da HR Gestão e Soluções em nova aba"
                className={`${INSTAGRAM_BUTTON_CLASS} w-full justify-center text-base sm:w-fit`}
              >
                <Instagram size={18} aria-hidden="true" />
                Instagram
              </a>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t text-center text-sm leading-relaxed" style={{ borderColor: "rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.38)" }}>
          © HR Gestão e Soluções. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

function SolutionPage({ eyebrow, title, intro, items, benefits, examples, cta, message }: SolutionPageProps) {
  const active = window.location.pathname;
  return (
    <div className="min-h-screen bg-background text-foreground font-['Inter',sans-serif] antialiased">
      <PublicHeader active={active} />
      <main className="pt-28">
        <section id="inicio" className="relative overflow-hidden bg-[#052656] py-28 md:py-36">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_16%,rgba(212,166,42,0.20),transparent_28%),linear-gradient(135deg,#052656_0%,#092f65_100%)]" />
          <div className="absolute right-[-8rem] top-[-8rem] h-80 w-80 rounded-full border border-[#D4A62A]/20" />
          <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 sm:px-6 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:px-10">
            <div>
            <span className="mb-6 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-[#F0C95C]"><span className="h-px w-8 bg-[#D4A62A]" /> {eyebrow}</span>
            <h1 className="max-w-4xl font-['Poppins',sans-serif] text-4xl font-semibold leading-[1.05] tracking-[-0.025em] text-white sm:text-5xl md:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-[1.75] text-white/72">
              {intro}
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a href={`${whatsappLink()}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className={`${WHATSAPP_BUTTON_CLASS} w-full sm:w-auto`}>
                <WhatsAppIcon size={20} />
                {cta}
              </a>
              <a href="/#solucoes" className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-[#D4A62A] bg-transparent px-8 py-4 text-base font-semibold tracking-wide text-[#D4A62A] transition-all hover:-translate-y-0.5 hover:bg-[#D4A62A]/15">
                Ver outras soluções
              </a>
            </div>
            </div>
            <div className="hidden border-l border-white/20 pl-8 lg:block">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F0C95C]">Uma solução com direção</p>
              <p className="mt-4 text-lg leading-relaxed text-white/65">Clareza para decidir, proximidade para executar e visão para evoluir.</p>
            </div>
          </div>
        </section>
        <section className="py-24 md:py-28 bg-background">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-20">
            <div>
              <span className="brand-kicker">O que entregamos</span>
              <h2 className="font-['Poppins',sans-serif] text-3xl md:text-5xl font-semibold leading-tight text-foreground">
                Uma solução clara para o momento da sua empresa.
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {items.map((item) => (
                <article key={item} className="group border-b border-[#052656]/20 bg-white p-6 transition-all hover:-translate-y-1 hover:border-b-[#D4A62A] hover:shadow-xl hover:shadow-[#052656]/8 md:p-7">
                  <div className="mb-4 flex h-9 w-9 items-center justify-center bg-[#D4A62A] text-[#052656] transition-transform group-hover:rotate-6">
                    <Check size={17} strokeWidth={2.8} aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold leading-snug text-foreground">{item}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="py-24 md:py-28" style={{ backgroundColor: "#F5F7FA" }}>
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div>
              <span className="brand-kicker">Benefícios</span>
              <h2 className="font-['Poppins',sans-serif] text-3xl md:text-5xl font-semibold leading-tight text-foreground mb-8">
                Por que contratar esta solução?
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-lg leading-[1.6] text-foreground">
                    <Check size={18} className="mt-1 shrink-0 text-[#D4A62A]" strokeWidth={2.8} aria-hidden="true" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t-4 border-[#D4A62A] bg-white p-7 shadow-xl shadow-[#052656]/8 md:p-8">
              <span className="brand-kicker">Exemplos</span>
              <div className="space-y-5">
                {examples.map((example) => (
                  <article key={example} className="border-l-4 pl-5" style={{ borderColor: "#D4A62A" }}>
                    <p className="text-lg leading-[1.65] text-muted-foreground">{example}</p>
                  </article>
                ))}
              </div>
              <a href={`${whatsappLink()}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className={`${WHATSAPP_BUTTON_CLASS} mt-8 w-full`}>
                <WhatsAppIcon size={20} />
                {cta}
              </a>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
      <FloatingBackToTop targetId="inicio" />
    </div>
  );
}

export default function App() {
  const caminho = window.location.pathname;

  useEffect(() => {
    const isJobsPage = caminho === "/vagas" || caminho === "/vagas/";
    const isSolutionsPage = caminho.startsWith("/solucoes");
    const isPublicPage = caminho === "/" || caminho.startsWith("/vagas") || isSolutionsPage;
    const pageMeta: Record<string, { title: string; description: string }> = {
      "/solucoes/recrutamento-selecao": {
        title: "Recrutamento & Seleção Estratégico | HR Gestão e Soluções",
        description: "Recrutamento e seleção estratégico com entendimento da vaga, divulgação, triagem, entrevistas, apresentação de profissionais e acompanhamento.",
      },
      "/solucoes/design-marca": {
        title: "Design & Marca | HR Gestão e Soluções",
        description: "Identidade visual, criação de artes, materiais empresariais, apresentações profissionais e conteúdo visual para redes sociais.",
      },
      "/solucoes/criacao-de-sites": {
        title: "Criação de Sites e Soluções Digitais | HR Gestão e Soluções",
        description: "Sites institucionais, landing pages, sites para profissionais e imobiliárias, integração com WhatsApp e SEO básico.",
      },
    };
    const title = pageMeta[caminho]?.title ?? (isJobsPage
      ? "Vagas de emprego em Belo Horizonte | HR Gestão e Soluções"
      : "HR Gestão e Soluções | Soluções estratégicas para empresas");
    const description = pageMeta[caminho]?.description ?? (isJobsPage
      ? "Confira vagas de emprego divulgadas pela HR Gestão e Soluções e candidate-se às oportunidades disponíveis."
      : "Pessoas, marcas e tecnologia para transformar negócios. Soluções estratégicas em recrutamento, design, marca, sites e experiências digitais.");
    const canonical = caminho.startsWith("/vagas/")
      ? `https://www.hrconsultoriaderh.com.br${caminho.replace(/\/$/, "")}`
      : isJobsPage
        ? "https://www.hrconsultoriaderh.com.br/vagas"
        : isSolutionsPage
          ? `https://www.hrconsultoriaderh.com.br${caminho.replace(/\/$/, "")}`
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
  if (caminho === "/admin/auth/callback") return <AdminAuthCallbackPage />;
  if (caminho === "/cliente/login") return <ClientLoginPage />;
  if (caminho === "/cliente" || caminho.startsWith("/cliente/")) return <ClientAccessGate><ClientPortalPage /></ClientAccessGate>;

  if (caminho === "/solucoes/recrutamento-selecao") {
    return (
      <SolutionPage
        eyebrow="Pessoas"
        title="Recrutamento & Seleção Estratégico"
        intro="Conduzimos processos seletivos com clareza, critério e acompanhamento próximo para encontrar profissionais alinhados ao perfil e às necessidades da sua empresa."
        items={[
          "Entendimento da vaga",
          "Divulgação",
          "Triagem de candidatos",
          "Entrevistas",
          "Apresentação dos profissionais",
          "Acompanhamento pós contratação",
        ]}
        benefits={[
          "Reduz tempo da empresa com triagens desalinhadas.",
          "Aumenta a clareza sobre o perfil ideal antes de divulgar a vaga.",
          "Entrega candidatos com contexto para apoiar uma decisão mais segura.",
          "Mantém comunicação próxima durante as etapas do processo.",
        ]}
        examples={[
          "Contratação para posições administrativas, comerciais, operacionais e técnicas.",
          "Apoio para empresas que não possuem RH interno estruturado.",
          "Reposição e organização de processos seletivos com mais previsibilidade.",
        ]}
        cta="Solicitar recrutamento"
        message="Olá, gostaria de solicitar uma proposta de recrutamento e seleção com a HR Gestão e Soluções."
      />
    );
  }

  if (caminho === "/solucoes/design-marca") {
    return (
      <SolutionPage
        eyebrow="Marcas"
        title="Design & Marca"
        intro="Criamos identidades e materiais visuais que tornam sua empresa mais profissional, reconhecível e preparada para se comunicar melhor com clientes, equipes e parceiros."
        items={[
          "Identidade visual",
          "Criação de artes",
          "Materiais empresariais",
          "Apresentações profissionais",
          "Conteúdo visual para redes sociais",
        ]}
        benefits={[
          "Torna a comunicação da empresa mais profissional e consistente.",
          "Melhora a percepção de valor antes mesmo da primeira conversa comercial.",
          "Facilita a criação de materiais digitais alinhados à identidade da marca.",
          "Ajuda equipes, clientes e parceiros a reconhecerem a empresa com mais clareza.",
        ]}
        examples={[
          "Identidade visual para negócios em fase de reposicionamento.",
          "Apresentações comerciais, propostas e materiais institucionais.",
          "Artes e conteúdos visuais para redes sociais e campanhas digitais.",
        ]}
        cta="Solicitar design"
        message="Olá, gostaria de solicitar uma proposta de Design & Marca com a HR Gestão e Soluções."
      />
    );
  }

  if (caminho === "/solucoes/criacao-de-sites") {
    return (
      <SolutionPage
        eyebrow="Tecnologia"
        title="Sites & Soluções Digitais"
        intro="Desenvolvemos presença digital para empresas que precisam vender melhor, transmitir confiança e facilitar o contato com clientes no ambiente online."
        items={[
          "Sites institucionais",
          "Landing pages",
          "Sites para profissionais autônomos",
          "Sites para imobiliárias",
          "Integração com WhatsApp",
          "SEO básico",
        ]}
        benefits={[
          "Cria uma presença online profissional para gerar confiança.",
          "Facilita o contato de clientes por WhatsApp e canais digitais.",
          "Organiza informações importantes em páginas claras e objetivas.",
          "Prepara a empresa para campanhas, divulgação e captação de oportunidades.",
        ]}
        examples={[
          "Site institucional para empresas que precisam apresentar serviços.",
          "Landing page para campanhas, lançamentos ou captação de contatos.",
          "Sites para profissionais autônomos, imobiliárias e negócios locais.",
        ]}
        cta="Solicitar site"
        message="Olá, gostaria de solicitar uma proposta de site ou solução digital com a HR Gestão e Soluções."
      />
    );
  }

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
