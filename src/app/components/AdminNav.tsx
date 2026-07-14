import { useState } from "react";
import { BriefcaseBusiness, LayoutDashboard, LogOut, Menu, UserRound, UsersRound, X } from "lucide-react";
import { supabase } from "../lib/supabase";

const links = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Vagas", href: "/admin#vagas", icon: BriefcaseBusiness },
  { label: "Candidatos", href: "/admin/candidatos", icon: UserRound },
  { label: "Processos seletivos", href: "/admin/processos", icon: UsersRound },
];

export default function AdminNav() {
  const [open, setOpen] = useState(false);
  const path = window.location.pathname;
  const hash = window.location.hash;
  function active(href: string) {
    if (href === "/admin") return path === "/admin" && hash !== "#vagas";
    if (href === "/admin#vagas") return path === "/admin" && hash === "#vagas";
    return path.startsWith(href);
  }
  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/vagas";
  }
  return <header className="bg-[#052656] px-5 py-5">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-5">
      <img src="/assets/hr-consultoria-logo-white.png" alt="HR Consultoria de RH" className="h-auto w-[110px] max-w-[35vw] sm:w-[140px]"/>
      <nav className="hidden items-center gap-2 lg:flex" aria-label="Navegação administrativa">{links.map((link) => { const Icon = link.icon; return <a key={link.label} href={link.href} aria-current={active(link.href) ? "page" : undefined} className={`inline-flex items-center gap-2 px-3 py-2 font-semibold transition ${active(link.href) ? "bg-white/10 text-[#D4A62A]" : "text-white hover:bg-white/5 hover:text-[#D4A62A]"}`}><Icon size={18}/>{link.label}</a>; })}<button type="button" onClick={logout} className="ml-2 inline-flex items-center gap-2 bg-[#D4A62A] px-5 py-2 font-semibold text-[#052656] transition hover:bg-[#E0B33A]"><LogOut size={18}/>Sair</button></nav>
      <button type="button" onClick={() => setOpen(!open)} className="p-2 text-white lg:hidden" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open}>{open ? <X/> : <Menu/>}</button>
    </div>
    {open && <nav className="mx-auto mt-5 flex max-w-7xl flex-col gap-2 border-t border-white/20 pt-5 lg:hidden" aria-label="Navegação administrativa móvel">{links.map((link) => { const Icon = link.icon; return <a key={link.label} href={link.href} aria-current={active(link.href) ? "page" : undefined} className={`inline-flex items-center gap-3 px-3 py-3 font-semibold ${active(link.href) ? "bg-white/10 text-[#D4A62A]" : "text-white"}`}><Icon size={19}/>{link.label}</a>; })}<button type="button" onClick={logout} className="mt-2 inline-flex w-fit items-center gap-2 bg-[#D4A62A] px-5 py-2 font-semibold text-[#052656]"><LogOut size={18}/>Sair</button></nav>}
  </header>;
}
