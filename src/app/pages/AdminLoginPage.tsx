import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");

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

    window.location.href = "/admin/login";
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
