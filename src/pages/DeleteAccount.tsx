import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Mail, ShieldAlert, Trash2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

const steps = [
  'Envie a solicitação pelo e-mail cadastrado na conta do F-Insight.',
  'Informe no assunto: Exclusão de conta F-Insight.',
  'Nossa equipe confirmará a titularidade e processará a exclusão dentro do prazo operacional informado por e-mail.',
  'Após a exclusão, dados de conta, preferências, watchlists e alertas vinculados ao usuário serão removidos ou anonimizados, salvo dados que precisem ser mantidos por obrigação legal, antifraude ou segurança.',
];

export default function DeleteAccount() {
  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/10 via-slate-900 to-slate-950 p-6 lg:p-8">
        <Link to="/" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-red-200 hover:text-red-100">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>
        <div className="mb-4 flex items-center gap-3">
          <Trash2 className="h-8 w-8 text-red-300" />
          <span className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-red-200">
            Exclusão de conta
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white lg:text-5xl">Solicitar exclusão da conta F-Insight</h1>
        <p className="mt-4 max-w-4xl text-slate-300 leading-relaxed">
          Esta página existe para cumprir os requisitos de privacidade e transparência do app. Usuários podem solicitar a exclusão da conta e dos dados associados ao cadastro.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6">
          <h2 className="mb-5 text-2xl font-bold text-white">Como solicitar</h2>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step} className="flex gap-3 rounded-2xl border border-slate-700/40 bg-slate-950/40 p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-400/20 text-sm font-black text-red-200">{index + 1}</span>
                <p className="text-sm leading-relaxed text-slate-300">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Mail className="h-6 w-6 text-cyan-300" />
              <h2 className="text-2xl font-bold text-white">E-mail de solicitação</h2>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-slate-300">
              Envie a solicitação pelo e-mail cadastrado para facilitar a validação.
            </p>
            <a
              href="mailto:contato@f-insight.org?subject=Exclus%C3%A3o%20de%20conta%20F-Insight&body=Ol%C3%A1%2C%20quero%20solicitar%20a%20exclus%C3%A3o%20da%20minha%20conta%20F-Insight.%20Meu%20e-mail%20cadastrado%20%C3%A9%3A%20"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300"
            >
              Enviar solicitação
            </a>
          </div>

          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-amber-300" />
              <h2 className="text-2xl font-bold text-white">O que pode permanecer</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Registros mínimos podem ser preservados quando necessário para obrigações legais, prevenção de fraude, segurança, auditoria ou cumprimento de contratos, sempre pelo prazo necessário.
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-300" />
              <h2 className="text-2xl font-bold text-white">Links úteis</h2>
            </div>
            <div className="flex flex-col gap-3 text-sm font-bold">
              <Link to="/privacidade" className="text-emerald-200 hover:text-emerald-100">Política de Privacidade</Link>
              <Link to="/excluir-dados" className="text-emerald-200 hover:text-emerald-100">Excluir apenas dados pessoais</Link>
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
