import { Link } from 'react-router-dom';
import { ArrowLeft, Database, Mail, ShieldCheck, Trash2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

const dataScopes = [
  'Watchlists, alertas, preferências e histórico de uso dentro da plataforma.',
  'Dados de newsletter e comunicações, quando vinculados ao usuário.',
  'Dados de cadastro, quando a solicitação envolver também a exclusão da conta.',
  'Dados técnicos e de segurança, quando puderem ser removidos sem afetar obrigações legais, antifraude ou auditoria.',
];

export default function DeleteData() {
  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 p-6 lg:p-8">
        <Link to="/" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-amber-200 hover:text-amber-100">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>
        <div className="mb-4 flex items-center gap-3">
          <Database className="h-8 w-8 text-amber-300" />
          <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-amber-200">
            Exclusão de dados
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white lg:text-5xl">Solicitar exclusão de dados pessoais</h1>
        <p className="mt-4 max-w-4xl text-slate-300 leading-relaxed">
          Você pode pedir a exclusão de dados pessoais específicos sem necessariamente encerrar sua conta. Também é possível solicitar a exclusão completa pela página de exclusão de conta.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6">
          <h2 className="mb-5 text-2xl font-bold text-white">Quais dados podem ser solicitados</h2>
          <div className="space-y-3">
            {dataScopes.map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl border border-slate-700/40 bg-slate-950/40 p-4">
                <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <p className="text-sm leading-relaxed text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Mail className="h-6 w-6 text-cyan-300" />
              <h2 className="text-2xl font-bold text-white">Enviar pedido</h2>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-slate-300">
              Informe quais dados deseja remover e envie pelo e-mail cadastrado na plataforma.
            </p>
            <a
              href="mailto:contato@f-insight.org?subject=Exclus%C3%A3o%20de%20dados%20F-Insight&body=Ol%C3%A1%2C%20quero%20solicitar%20a%20exclus%C3%A3o%20dos%20seguintes%20dados%20no%20F-Insight%3A%20"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300"
            >
              Solicitar por e-mail
            </a>
          </div>

          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-300" />
              <h2 className="text-2xl font-bold text-white">Transparência</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              A solicitação será analisada e respondida por e-mail. Quando não for possível excluir um dado por obrigação legal, segurança ou prevenção de fraude, explicaremos o motivo.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6">
            <h2 className="mb-3 text-2xl font-bold text-white">Links úteis</h2>
            <div className="flex flex-col gap-3 text-sm font-bold">
              <Link to="/privacidade" className="text-cyan-200 hover:text-cyan-100">Política de Privacidade</Link>
              <Link to="/excluir-conta" className="text-cyan-200 hover:text-cyan-100">Excluir conta completa</Link>
            </div>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
