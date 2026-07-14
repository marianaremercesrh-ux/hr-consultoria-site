import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [verificando, setVerificando] = useState(true);
  const [sessaoCliente, setSessaoCliente] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { setVerificando(false); return; }
      const { data: profile } = await supabase.from("perfis_usuarios").select("perfil").eq("usuario_id", data.session.user.id).maybeSingle();
      if (profile && ["administrador", "recrutador"].includes(profile.perfil)) {
        window.location.href = "/admin";
        return;
      }
      setSessaoCliente(true);
      setVerificando(false);
    });
  }, []);

  if (verificando) return <main className="flex min-h-screen items-center justify-center bg-[#052656] text-white">Verificando acesso administrativo...</main>;
  if (sessaoCliente) return <AdminClientSessionNotice />;

  async function entrar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setCarregando(true);
    setMensagem("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setMensagem("E-mail ou senha incorretos.");
      setCarregando(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("perfis_usuarios").select("perfil").eq("usuario_id", user?.id ?? "").maybeSingle();
    if (!profile || !["administrador", "recrutador"].includes(profile.perfil)) {
      await supabase.auth.signOut();
      setMensagem("Este usuário não possui acesso ao painel administrativo.");
      setCarregando(false);
      return;
    }
    window.location.href = "/admin";
  }

  return (
    <main className="min-h-screen bg-[#052656] px-5 py-12 flex items-center justify-center">
      <section className="w-full max-w-md bg-white p-8 shadow-xl">
        <img
          src="/assets/hr-consultoria-logo.png"
          alt="HR Consultoria de RH"
          className="mx-auto mb-6 h-auto w-[170px] max-w-full"
        />

        <h1 className="font-['Playfair_Display',serif] text-3xl font-semibold text-[#052656]">
          Acesso administrativo
        </h1>

        <p className="mt-3 text-base text-gray-600">
          Entre com seu e-mail e sua senha para gerenciar as vagas.
        </p>

        <form onSubmit={entrar} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-[#052656]"
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              required
              autoComplete="email"
              className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#D4A62A]"
            />
          </div>

          <div>
            <label
              htmlFor="senha"
              className="mb-2 block text-sm font-semibold text-[#052656]"
            >
              Senha
            </label>

            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#D4A62A]"
            />
          </div>

          {mensagem && (
            <p className="text-sm font-medium text-red-600">{mensagem}</p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-[#D4A62A] px-5 py-3 font-semibold text-[#052656] transition hover:bg-[#E0B33A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}

export function AdminClientSessionNotice() {
  const [saindo, setSaindo] = useState(false);
  async function sair() {
    setSaindo(true);
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }
  return <main className="flex min-h-screen items-center justify-center bg-[#052656] px-5 py-12"><section className="w-full max-w-lg bg-white p-8 text-center shadow-xl"><img src="/assets/hr-consultoria-logo.png" alt="HR Consultoria de RH" className="mx-auto mb-6 w-[170px] max-w-full"/><h1 className="text-3xl font-semibold text-[#052656]">Área do Recrutador</h1><p role="alert" className="mt-4 leading-relaxed text-gray-700">Este acesso é exclusivo para recrutadores. Saia do Portal do Cliente para entrar com uma conta administrativa.</p><button type="button" disabled={saindo} onClick={()=>void sair()} className="mt-7 w-full bg-[#D4A62A] px-5 py-3 font-semibold text-[#052656] hover:bg-[#E0B33A] disabled:opacity-60">{saindo?"Saindo...":"Sair e acessar Área do Recrutador"}</button><a href="/cliente" className="mt-5 block font-semibold text-[#052656] underline">Voltar ao Portal do Cliente</a></section></main>;
}
