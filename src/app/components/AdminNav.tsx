import { useEffect, useState } from "react";
import { ArrowUp, BriefcaseBusiness, Building2, CalendarDays, FileBarChart, LayoutDashboard, LogOut, Menu, Search, UserRound, UsersRound, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import AdminGlobalSearch from "./AdminGlobalSearch";

const links = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Vagas", href: "/admin#vagas", icon: BriefcaseBusiness },
  { label: "Candidatos", href: "/admin/candidatos", icon: UserRound },
  { label: "Processos seletivos", href: "/admin/processos", icon: UsersRound },
  { label: "Empresas", href: "/admin/empresas", icon: Building2 },
  { label: "Agenda", href: "/admin/agenda", icon: CalendarDays },
  { label: "Talentos", href: "/admin/talentos", icon: Search },
  { label: "Relatórios", href: "/admin/relatorios", icon: FileBarChart },
];

export default function AdminNav() {
  const [open, setOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const path = window.location.pathname;
  const hash = window.location.hash;
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 240);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  function active(href: string) {
    if (href === "/admin") return path === "/admin" && hash !== "#vagas";
    if (href === "/admin#vagas") return path === "/admin" && hash === "#vagas";
    return path.startsWith(href);
  }
  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/vagas";
  }
  return <><header className="bg-[#052656] px-5 py-5">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
      <img src="/assets/hr-consultoria-logo-white.png" alt="HR Consultoria de RH" className="h-auto w-[110px] max-w-[35vw] sm:w-[140px]"/>
      <nav className="hidden items-center gap-2 lg:flex" aria-label="Navegação administrativa">{links.map((link) => { const Icon = link.icon; return <a key={link.label} href={link.href} aria-current={active(link.href) ? "page" : undefined} className={`inline-flex items-center gap-2 px-3 py-2 font-semibold transition ${active(link.href) ? "bg-white/10 text-[#D4A62A]" : "text-white hover:bg-white/5 hover:text-[#D4A62A]"}`}><Icon size={18}/>{link.label}</a>; })}<button type="button" onClick={logout} className="ml-2 inline-flex items-center gap-2 bg-[#D4A62A] px-5 py-2 font-semibold text-[#052656] transition hover:bg-[#E0B33A]"><LogOut size={18}/>Sair</button></nav>
      <button type="button" onClick={() => setOpen(!open)} className="p-2 text-white lg:hidden" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open}>{open ? <X/> : <Menu/>}</button>
    </div>
    {open && <nav className="mx-auto mt-5 flex max-w-7xl flex-col gap-2 border-t border-white/20 pt-5 lg:hidden" aria-label="Navegação administrativa móvel">{links.map((link) => { const Icon = link.icon; return <a key={link.label} href={link.href} aria-current={active(link.href) ? "page" : undefined} className={`inline-flex items-center gap-3 px-3 py-3 font-semibold ${active(link.href) ? "bg-white/10 text-[#D4A62A]" : "text-white"}`}><Icon size={19}/>{link.label}</a>; })}<button type="button" onClick={logout} className="mt-2 inline-flex w-fit items-center gap-2 bg-[#D4A62A] px-5 py-2 font-semibold text-[#052656]"><LogOut size={18}/>Sair</button></nav>}
    <AdminGlobalSearch/>
  </header><button
    type="button"
    aria-label="Voltar ao topo"
    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#D4A62A] text-[#052656] shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#E0B33A] focus:outline-none focus:ring-4 focus:ring-[#D4A62A]/30 sm:bottom-7 sm:right-7 sm:h-14 sm:w-14 ${showBackToTop ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
  ><ArrowUp size={22} strokeWidth={2.4} aria-hidden="true" /></button></>;
}
