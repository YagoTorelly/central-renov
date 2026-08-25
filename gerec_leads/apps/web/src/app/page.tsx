import { checkSupabaseHealth } from "@/lib/health/check-supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const health = await checkSupabaseHealth();

  return (
    <main className="foundation-shell">
      <section className="foundation-card" aria-labelledby="product-title">
        <p className="foundation-kicker">WTG • ambiente de desenvolvimento</p>
        <h1 id="product-title">Gerenciador de Leads WTG</h1>
        <p>
          Esqueleto local preparado. As regras comerciais começam somente após a aprovação da
          próxima etapa.
        </p>
        <div className="health-line" data-status={health.status} role="status">
          <span aria-hidden="true" />
          {health.message}
        </div>
      </section>
    </main>
  );
}
