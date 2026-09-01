import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { createAdminPassword, requestAdminLoginCode, verifyAdminLoginCode } from "../services/adminLoginCreation";

export default function AdminLoginPage() {
  const [view, setView] = useState<"login" | "forgot" | "reset" | "request" | "code" | "password" | "success">(
    new URLSearchParams(window.location.search).get("recovery") ? "reset" : "login",
  );
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [verificando, setVerificando] = useState(true);
  const [sessaoCliente, setSessaoCliente] = useState(false);
  const [challengeId, setChallengeId] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [codigo, setCodigo] = useState(["", "", "", ""]);
  const [segundosParaReenviar, setSegundosParaReenviar] = useState(0);

  useEffect(() => {
    if (view === "reset") { setVerificando(false); return; }
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

  useEffect(() => {
    if (segundosParaReenviar <= 0) return;
    const timer = window.setInterval(() => setSegundosParaReenviar(value => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [segundosParaReenviar]);

  function abrirSolicitacao() {
    setMensagem("");
    setEmail("");
    setView("request");
  }

  async function solicitarCodigo(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) { setMensagem("Informe seu e-mail."); return; }
    setCarregando(true); setMensagem("");
    try {
      const result = await requestAdminLoginCode(normalizedEmail);
      setEmail(normalizedEmail);
      if (result.challenge_id) {
        setChallengeId(result.challenge_id);
        setCodigo(["", "", "", ""]);
        setSegundosParaReenviar(60);
        setView("code");
      } else setMensagem(result.message ?? "Se o e-mail estiver autorizado, você receberá um código.");
    } catch (error) {
      setMensagem(error instanceof Error && error.message !== "NETWORK_ERROR" ? error.message : "Não foi possível enviar o código. Tente novamente.");
    } finally { setCarregando(false); }
  }

  function alterarCodigo(index: number, value: string) {
    const digits = value.replace(/\D/g, "").slice(-1);
    setCodigo(current => current.map((item, position) => position === index ? digits : item));
    if (digits && index < 3) document.getElementById(`codigo-${index + 1}`)?.focus();
  }

  function colarCodigo(evento: React.ClipboardEvent<HTMLInputElement>) {
    const digits = evento.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (digits.length !== 4) return;
    evento.preventDefault();
    setCodigo(digits.split(""));
    document.getElementById("codigo-3")?.focus();
  }

  function apagarCodigo(evento: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (evento.key === "Backspace" && !codigo[index] && index > 0) document.getElementById(`codigo-${index - 1}`)?.focus();
  }

  async function validarCodigo(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const value = codigo.join("");
    if (value.length !== 4) { setMensagem("Informe os 4 dígitos do código."); return; }
    setCarregando(true); setMensagem("");
    try {
      const result = await verifyAdminLoginCode(email, challengeId, value);
      setVerificationToken(result.verification_token); setNovaSenha(""); setConfirmacaoSenha(""); setView("password");
    } catch (error) { setMensagem(error instanceof Error && error.message !== "NETWORK_ERROR" ? error.message : "Não foi possível validar o código. Tente novamente."); }
    finally { setCarregando(false); }
  }

  async function reenviarCodigo() {
    if (segundosParaReenviar > 0 || carregando) return;
    setCarregando(true); setMensagem("");
    try { const result = await requestAdminLoginCode(email); if (result.challenge_id) { setChallengeId(result.challenge_id); setCodigo(["", "", "", ""]); setSegundosParaReenviar(60); } }
    catch (error) { setMensagem(error instanceof Error && error.message !== "NETWORK_ERROR" ? error.message : "Não foi possível reenviar o código."); }
    finally { setCarregando(false); }
  }

  async function salvarNovaSenha(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (novaSenha.length < 8 || !/[A-Z]/.test(novaSenha) || !/[a-z]/.test(novaSenha) || !/\d/.test(novaSenha) || !/[^A-Za-z0-9]/.test(novaSenha)) { setMensagem("A senha deve cumprir todos os requisitos."); return; }
    if (novaSenha !== confirmacaoSenha) { setMensagem("As senhas informadas não são iguais."); return; }
    setCarregando(true); setMensagem("");
    try { await createAdminPassword(email, verificationToken, novaSenha); setNovaSenha(""); setConfirmacaoSenha(""); setVerificationToken(""); setView("success"); }
    catch (error) { setMensagem(error instanceof Error && error.message !== "NETWORK_ERROR" ? error.message : "Não foi possível criar o login. Tente novamente."); }
    finally { setCarregando(false); }
  }

  async function solicitarRecuperacao(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setCarregando(true);
    setMensagem("");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/admin/auth/callback?next=recovery`,
    });
    setMensagem(error
      ? "Não foi possível iniciar a recuperação de senha. Tente novamente."
      : "Se o e-mail pertencer a um recrutador cadastrado, as instruções para redefinição foram enviadas.");
    setCarregando(false);
  }

  async function redefinirSenha(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setMensagem("");
    if (novaSenha.length < 8) { setMensagem("A nova senha deve ter pelo menos 8 caracteres."); return; }
    if (novaSenha !== confirmacaoSenha) { setMensagem("As senhas informadas não são iguais."); return; }
    setCarregando(true);
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) { setMensagem("O link de recuperação é inválido ou expirou. Solicite um novo link."); setCarregando(false); return; }
    await supabase.auth.signOut();
    setNovaSenha("");
    setConfirmacaoSenha("");
    setView("login");
    setMensagem("Senha alterada com sucesso. Agora você já pode entrar com a nova senha.");
    setCarregando(false);
  }

  if (verificando) return <main className="flex min-h-screen items-center justify-center bg-[#052656] text-white">Verificando acesso administrativo...</main>;
  if (sessaoCliente) return <AdminClientSessionNotice />;

  if (view === "request") return (
    <AuthShell>
      <h1 className="font-['Playfair_Display',serif] text-3xl font-semibold text-[#052656]">Solicitar criação de login</h1>
      <p className="mt-3 text-base text-gray-600">Informe seu e-mail para receber o código de verificação.</p>
      <form onSubmit={solicitarCodigo} className="mt-8 space-y-5">
        <label className="block"><span className="mb-2 block text-sm font-semibold text-[#052656]">E-mail</span><input type="email" value={email} onChange={evento => setEmail(evento.target.value)} required autoComplete="email" className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#D4A62A]" /></label>
        {mensagem && <p role="alert" className="text-sm font-medium text-red-600">{mensagem}</p>}
        <button type="submit" disabled={carregando} className="w-full bg-[#D4A62A] px-5 py-3 font-semibold text-[#052656] transition hover:bg-[#E0B33A] disabled:cursor-not-allowed disabled:opacity-60">{carregando ? "Enviando..." : "Continuar"}</button>
      </form>
      <button type="button" onClick={() => { setMensagem(""); setView("login"); }} className="mt-5 block w-full font-semibold text-[#052656] underline">Voltar para o login</button>
    </AuthShell>
  );

  if (view === "code") return (
    <AuthShell>
      <h1 className="font-['Playfair_Display',serif] text-3xl font-semibold text-[#052656]">Verifique seu e-mail</h1>
      <p className="mt-3 text-base text-gray-600">Enviamos um código de verificação de 4 dígitos para o e-mail informado.</p>
      <form onSubmit={validarCodigo} className="mt-8 space-y-5">
        <div className="flex justify-center gap-3" onPaste={colarCodigo}>
          {codigo.map((digit, index) => <input key={index} id={`codigo-${index}`} inputMode="numeric" pattern="[0-9]*" maxLength={1} value={digit} onChange={evento => alterarCodigo(index, evento.target.value)} onKeyDown={evento => apagarCodigo(evento, index)} aria-label={`Dígito ${index + 1}`} className="h-14 w-12 border border-gray-300 text-center text-2xl font-semibold text-[#052656] outline-none focus:border-[#D4A62A]" />)}
        </div>
        {mensagem && <p role="alert" className="text-sm font-medium text-red-600">{mensagem}</p>}
        <button type="submit" disabled={carregando} className="w-full bg-[#D4A62A] px-5 py-3 font-semibold text-[#052656] transition hover:bg-[#E0B33A] disabled:cursor-not-allowed disabled:opacity-60">{carregando ? "Verificando..." : "Verificar código"}</button>
      </form>
      <button type="button" disabled={segundosParaReenviar > 0 || carregando} onClick={() => void reenviarCodigo()} className="mt-5 block w-full font-semibold text-[#052656] underline disabled:cursor-not-allowed disabled:opacity-50">{segundosParaReenviar > 0 ? `Reenviar código em ${segundosParaReenviar}s` : "Reenviar código"}</button>
    </AuthShell>
  );

  if (view === "password") return (
    <AuthShell>
      <h1 className="font-['Playfair_Display',serif] text-3xl font-semibold text-[#052656]">Criar senha</h1>
      <p className="mt-3 text-base text-gray-600">Crie uma senha segura para acessar seu painel administrativo.</p>
      <form onSubmit={salvarNovaSenha} className="mt-8 space-y-5">
        <PasswordField label="Nova senha" value={novaSenha} onChange={setNovaSenha} />
        <PasswordField label="Confirmar senha" value={confirmacaoSenha} onChange={setConfirmacaoSenha} />
        <PasswordRequirements password={novaSenha} />
        {mensagem && <p role="alert" className="text-sm font-medium text-red-600">{mensagem}</p>}
        <button type="submit" disabled={carregando} className="w-full bg-[#D4A62A] px-5 py-3 font-semibold text-[#052656] transition hover:bg-[#E0B33A] disabled:cursor-not-allowed disabled:opacity-60">{carregando ? "Salvando..." : "Criar senha"}</button>
      </form>
    </AuthShell>
  );

  if (view === "success") return <AuthShell><h1 className="font-['Playfair_Display',serif] text-3xl font-semibold text-[#052656]">Login criado com sucesso!</h1><p className="mt-4 leading-relaxed text-gray-700">Seu acesso administrativo foi criado. Agora você já pode entrar utilizando seu e-mail e sua nova senha.</p><button type="button" onClick={() => { setEmail(""); setSenha(""); setMensagem(""); setView("login"); }} className="mt-7 w-full bg-[#D4A62A] px-5 py-3 font-semibold text-[#052656] hover:bg-[#E0B33A]">Voltar para o login</button></AuthShell>;

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
      setMensagem("Este usuÃ¡rio nÃ£o possui acesso ao painel administrativo.");
      setCarregando(false);
      return;
    }
    window.location.href = "/admin";
  }

  if (view === "forgot") return (
    <main className="flex min-h-screen items-center justify-center bg-[#052656] px-5 py-12">
      <section className="w-full max-w-md bg-white p-8 text-center shadow-xl">
        <img src="/assets/hr-consultoria-logo.png" alt="HR Solutions" className="mx-auto mb-6 h-auto w-[170px] max-w-full" />
        <h1 className="font-['Playfair_Display',serif] text-3xl font-semibold text-[#052656]">Recuperar senha</h1>
        <p className="mt-3 text-base text-gray-600">Informe o e-mail cadastrado do recrutador para receber um link seguro.</p>
        <form onSubmit={solicitarRecuperacao} className="mt-8 space-y-5 text-left">
          <label className="block text-sm font-semibold text-[#052656]" htmlFor="recuperacao-email">E-mail cadastrado</label>
          <input id="recuperacao-email" type="email" value={email} onChange={(evento) => setEmail(evento.target.value)} required autoComplete="email" className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#D4A62A]" />
          {mensagem && <p role="status" className="text-sm font-medium text-[#052656]">{mensagem}</p>}
          <button type="submit" disabled={carregando} className="w-full bg-[#D4A62A] px-5 py-3 font-semibold text-[#052656] transition hover:bg-[#E0B33A] disabled:cursor-not-allowed disabled:opacity-60">{carregando ? "Enviando..." : "Enviar"}</button>
        </form>
        <button type="button" onClick={() => { setMensagem(""); setView("login"); }} className="mt-5 font-semibold text-[#052656] underline">Voltar para o login</button>
      </section>
    </main>
  );

  if (view === "reset") return (
    <main className="flex min-h-screen items-center justify-center bg-[#052656] px-5 py-12">
      <section className="w-full max-w-md bg-white p-8 text-center shadow-xl">
        <img src="/assets/hr-consultoria-logo.png" alt="HR Solutions" className="mx-auto mb-6 h-auto w-[170px] max-w-full" />
        <h1 className="font-['Playfair_Display',serif] text-3xl font-semibold text-[#052656]">Redefinir senha</h1>
        <p className="mt-3 text-base text-gray-600">Cadastre uma nova senha para acessar o painel do recrutador.</p>
        <form onSubmit={redefinirSenha} className="mt-8 space-y-5 text-left">
          <label className="block"><span className="mb-2 block text-sm font-semibold text-[#052656]">Nova senha</span><input type="password" value={novaSenha} onChange={(evento) => setNovaSenha(evento.target.value)} required minLength={8} autoComplete="new-password" className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#D4A62A]" /></label>
          <label className="block"><span className="mb-2 block text-sm font-semibold text-[#052656]">Confirmar nova senha</span><input type="password" value={confirmacaoSenha} onChange={(evento) => setConfirmacaoSenha(evento.target.value)} required minLength={8} autoComplete="new-password" className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-[#D4A62A]" /></label>
          {mensagem && <p role="alert" className="text-sm font-medium text-red-600">{mensagem}</p>}
          <button type="submit" disabled={carregando} className="w-full bg-[#D4A62A] px-5 py-3 font-semibold text-[#052656] transition hover:bg-[#E0B33A] disabled:cursor-not-allowed disabled:opacity-60">{carregando ? "Salvando..." : "Redefinir senha"}</button>
        </form>
      </section>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#052656] px-5 py-12 flex items-center justify-center">
      <section className="w-full max-w-md bg-white p-8 shadow-xl">
        <img
          src="/assets/hr-consultoria-logo.png"
          alt="HR Solutions"
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

          <button type="button" onClick={() => { setMensagem(""); setView("forgot"); }} className="block text-sm font-semibold text-[#052656] underline">Esqueci minha senha</button>

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

        <div className="mt-7 border-t border-gray-200 pt-6 text-center">
          <p className="text-sm text-gray-600">Ainda não tem login de recrutador?</p>
          <button
            type="button"
            onClick={abrirSolicitacao}
            className="mt-2 inline-block font-semibold text-[#052656] underline decoration-[#D4A62A] decoration-2 underline-offset-4 hover:text-[#0B3470]"
          >
            Solicitar criação de login
          </button>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">A HR Gestão e Soluções fará a liberação do seu acesso administrativo.</p>
        </div>
      </section>
    </main>
  );
}

function AuthShell({ children }: { children: React.ReactNode }) {
  return <main className="flex min-h-screen items-center justify-center bg-[#052656] px-5 py-12"><section className="w-full max-w-md bg-white p-8 text-center shadow-xl"><img src="/assets/hr-consultoria-logo.png" alt="HR Solutions" className="mx-auto mb-6 h-auto w-[170px] max-w-full" />{children}</section></main>;
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [visible, setVisible] = useState(false);
  return <label className="block text-left"><span className="mb-2 block text-sm font-semibold text-[#052656]">{label}</span><span className="relative block"><input type={visible ? "text" : "password"} value={value} onChange={evento => onChange(evento.target.value)} required autoComplete="new-password" className="w-full border border-gray-300 px-4 py-3 pr-20 outline-none focus:border-[#D4A62A]" /><button type="button" onClick={() => setVisible(current => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#052656]">{visible ? "Ocultar" : "Mostrar"}</button></span></label>;
}

function PasswordRequirements({ password }: { password: string }) {
  const requirements = [[password.length >= 8, "8 caracteres ou mais"], [/[A-Z]/.test(password), "Uma letra maiúscula"], [/[a-z]/.test(password), "Uma letra minúscula"], [/\d/.test(password), "Um número"], [/[^A-Za-z0-9]/.test(password), "Um caractere especial"]] as const;
  return <ul className="space-y-1 text-left text-sm text-gray-600">{requirements.map(([valid, text]) => <li key={text} className={valid ? "text-green-700" : ""}>{valid ? "✓" : "○"} {text}</li>)}</ul>;
}

export function AdminClientSessionNotice() {
  const [saindo, setSaindo] = useState(false);
  async function sair() {
    setSaindo(true);
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }
  return <main className="flex min-h-screen items-center justify-center bg-[#052656] px-5 py-12"><section className="w-full max-w-lg bg-white p-8 text-center shadow-xl"><img src="/assets/hr-consultoria-logo.png" alt="HR Solutions" className="mx-auto mb-6 w-[170px] max-w-full"/><h1 className="text-3xl font-semibold text-[#052656]">Ãrea do Recrutador</h1><p role="alert" className="mt-4 leading-relaxed text-gray-700">Este acesso Ã© exclusivo para recrutadores. Saia do Portal do Cliente para entrar com uma conta administrativa.</p><button type="button" disabled={saindo} onClick={()=>void sair()} className="mt-7 w-full bg-[#D4A62A] px-5 py-3 font-semibold text-[#052656] hover:bg-[#E0B33A] disabled:opacity-60">{saindo?"Saindo...":"Sair e acessar Ãrea do Recrutador"}</button><a href="/cliente" className="mt-5 block font-semibold text-[#052656] underline">Voltar ao Portal do Cliente</a></section></main>;
}
