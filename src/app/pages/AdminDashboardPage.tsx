import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function AdminDashboardPage() {
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function verificarLogin() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/admin/login";
        return;
      }

      setCarregando(false);
    }

    verificarLogin();
  }, []);

  async function sair() {
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-[#052656] flex flex-col items-center justify-center px-5">
        <img
          src="/assets/hr-consultoria-logo-white.png"
          alt="HR Consultoria de RH"
          className="mb-6 h-auto w-[170px] max-w-full"
        />
        <p className="text-white text-lg">Carregando painel...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <header className="bg-[#052656] px-5 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <img
            src="/assets/hr-consultoria-logo-white.png"
            alt="HR Consultoria de RH"
            className="h-auto w-[110px] max-w-[35vw] sm:w-[140px]"
          />

          <button
            type="button"
            onClick={sair}
            className="bg-[#D4A62A] px-5 py-2 font-semibold text-[#052656]"
          >
            Sair
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <h2 className="font-['Playfair_Display',serif] text-3xl font-semibold text-[#052656]">
          Bem-vinda ao painel administrativo
        </h2>

        <p className="mt-3 text-lg text-gray-600">
          Aqui você poderá cadastrar, editar, publicar e encerrar as vagas.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <article className="bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Vagas publicadas
            </p>
            <p className="mt-3 text-4xl font-bold text-[#052656]">0</p>
          </article>

          <article className="bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Rascunhos
            </p>
            <p className="mt-3 text-4xl font-bold text-[#052656]">0</p>
          </article>

          <article className="bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Vagas encerradas
            </p>
            <p className="mt-3 text-4xl font-bold text-[#052656]">0</p>
          </article>
        </div>

<a
  href="/admin/nova-vaga"
  className="mt-8 inline-block bg-[#D4A62A] px-6 py-3 font-semibold text-[#052656]"
>
  Nova vaga
</a>
      </section>
    </main>
  );
}
