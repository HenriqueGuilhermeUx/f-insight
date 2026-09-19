import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import ScheduledUpdates from '@/pages/ScheduledUpdates';
import { loadScheduledUpdatesFromSupabase } from '@/services/updateScheduler';

export default function ScheduledUpdatesHydrated() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadScheduledUpdatesFromSupabase().finally(() => {
      if (mounted) setReady(true);
    });
    return () => { mounted = false; };
  }, []);

  if (!ready) {
    return (
      <Layout>
        <section className="min-h-[45vh] flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-300">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            Carregando rotinas do escritório...
          </div>
        </section>
      </Layout>
    );
  }

  return <ScheduledUpdates />;
}
