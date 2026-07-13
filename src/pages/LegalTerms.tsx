import { AlertTriangle, FileText, Lock, ShieldCheck } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

const sections = [
  {
    title: 'Natureza educacional',
    text: 'O F-Insight organiza informações de mercado, relatórios, conteúdos e mensagens com finalidade educacional, informativa e de apoio ao relacionamento entre escritório, assessor e cliente final.',
  },
  {
    title: 'Não é carteira, custódia ou extrato',
    text: 'A plataforma não substitui corretora, custodiante, extrato oficial, conta de investimento, consultoria personalizada ou serviço de gestão de recursos.',
  },
  {
    title: 'Não há recomendação automática',
    text: 'Sinais, rankings, textos sugeridos e resumos não representam recomendação individual automática. Decisões devem respeitar perfil, adequação, suitability e processo do escritório responsável.',
  },
  {
    title: 'Responsabilidade do escritório',
    text: 'O escritório é responsável pela curadoria, revisão, aprovação e envio dos materiais, bem como pelo relacionamento com seus clientes e cumprimento de regras aplicáveis.',
  },
];

export default function LegalTerms() {
  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
          <FileText className="w-3.5 h-3.5" />
          Termos e aviso educacional
        </span>
        <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Uso seguro e orientativo da plataforma.</h1>
        <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
          Estes termos deixam claro o posicionamento do F-Insight como plataforma educacional, white-label e de relacionamento digital para escritórios de investimento.
        </p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {sections.map((section) => (
          <div key={section.title} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-4" />
            <h2 className="text-xl font-bold text-white mb-3">{section.title}</h2>
            <p className="text-slate-400 leading-relaxed">{section.text}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-6 lg:p-8 mb-8">
        <div className="flex gap-4">
          <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0 mt-1" />
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">Aviso para o cliente final</h2>
            <p className="text-amber-100/80 leading-relaxed">
              Conteúdos, relatórios e mensagens exibidos no portal são informativos e educativos. Eles não representam ordem, promessa de rentabilidade, garantia de resultado, recomendação personalizada automática ou substituição de orientação profissional.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6 lg:p-8">
        <Lock className="w-7 h-7 text-primary mb-4" />
        <h2 className="text-2xl font-bold text-white mb-3">Privacidade e dados</h2>
        <p className="text-slate-400 leading-relaxed">
          O MVP não exige integração com patrimônio, saldo, custódia, extrato real ou carteira do cliente. Em futuras integrações, qualquer tratamento de dados deverá seguir consentimento, finalidade clara, segurança e políticas específicas do escritório contratante.
        </p>
      </section>
    </Layout>
  );
}
