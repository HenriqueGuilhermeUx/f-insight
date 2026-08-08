import { Link } from 'react-router-dom';
import { ArrowLeft, Database, LockKeyhole, Mail, ShieldCheck, Trash2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

const dataItems = [
  'Dados de cadastro: nome, e-mail e senha criptografada, quando o usuário cria uma conta.',
  'Dados de uso: ativos acompanhados, preferências, watchlists, alertas e interações dentro da plataforma.',
  'Dados técnicos: logs de acesso, dispositivo, navegador, versão do app e informações necessárias para segurança e diagnóstico.',
  'Dados de pagamento: quando houver assinatura Premium, a cobrança é processada por provedores de pagamento externos. O F-Insight não armazena dados completos de cartão.',
];

const purposes = [
  'Entregar cotações, notícias, indicadores macroeconômicos, análises educativas e ferramentas financeiras.',
  'Manter conta, autenticação, preferências, watchlist, alertas e recursos Premium.',
  'Melhorar segurança, estabilidade, prevenção a abuso e qualidade do serviço.',
  'Enviar comunicações transacionais, relatórios, novidades e conteúdos educativos quando o usuário consentir.',
];

export default function PrivacyPolicy() {
  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-slate-900 to-slate-950 p-6 lg:p-8">
        <Link to="/" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-300 hover:text-cyan-200">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="h-8 w-8 text-cyan-300" />
          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-200">
            Privacidade
          </span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white lg:text-5xl">Política de Privacidade do F-Insight</h1>
        <p className="mt-4 max-w-4xl text-slate-300 leading-relaxed">
          Esta política explica como o F-Insight coleta, usa, protege e permite a exclusão de dados pessoais. O F-Insight é uma plataforma informativa e educacional de inteligência financeira; não presta consultoria individualizada de investimento nem executa ordens financeiras.
        </p>
        <p className="mt-3 text-sm text-slate-500">Última atualização: 08/08/2026</p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Database className="h-6 w-6 text-cyan-300" />
              <h2 className="text-2xl font-bold text-white">Dados que podemos coletar</h2>
            </div>
            <div className="space-y-3">
              {dataItems.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-700/40 bg-slate-950/40 p-4 text-sm leading-relaxed text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6">
            <h2 className="mb-4 text-2xl font-bold text-white">Como usamos os dados</h2>
            <div className="space-y-3">
              {purposes.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-700/40 bg-slate-950/40 p-4 text-sm leading-relaxed text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <LockKeyhole className="h-6 w-6 text-emerald-300" />
              <h2 className="text-2xl font-bold text-white">Segurança</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Usamos controles técnicos e organizacionais para proteger dados contra acesso não autorizado, perda, alteração ou divulgação indevida. Mesmo assim, nenhum sistema digital é totalmente imune a riscos.
            </p>
          </div>

          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Trash2 className="h-6 w-6 text-amber-300" />
              <h2 className="text-2xl font-bold text-white">Exclusão de dados e conta</h2>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-slate-300">
              O usuário pode solicitar exclusão de conta, exclusão de dados pessoais ou cópia das informações mantidas pela plataforma.
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/excluir-conta" className="rounded-xl bg-amber-400 px-4 py-3 text-center text-sm font-black text-slate-950 hover:bg-amber-300">
                Solicitar exclusão de conta
              </Link>
              <Link to="/excluir-dados" className="rounded-xl border border-amber-400/40 px-4 py-3 text-center text-sm font-bold text-amber-200 hover:bg-amber-400/10">
                Solicitar exclusão de dados
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Mail className="h-6 w-6 text-cyan-300" />
              <h2 className="text-2xl font-bold text-white">Contato</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Para dúvidas de privacidade, exclusão ou suporte, envie e-mail para <a className="font-bold text-cyan-300 hover:text-cyan-200" href="mailto:contato@f-insight.org">contato@f-insight.org</a>.
            </p>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
