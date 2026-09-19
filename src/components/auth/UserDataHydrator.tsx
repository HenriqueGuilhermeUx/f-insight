import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAppStore } from '@/hooks/useStore';
import { hydrateWorkspaceFromSupabase } from '@/services/workspace';

export default function UserDataHydrator() {
  const { user, loading } = useAuth();
  const hydrateRemoteWatchlist = useAppStore((state) => state.hydrateRemoteWatchlist);

  useEffect(() => {
    if (loading || !user?.id || user.isDemo) return;

    void Promise.allSettled([
      hydrateRemoteWatchlist(user.id),
      hydrateWorkspaceFromSupabase(),
    ]).then((results) => {
      const workspaceResult = results[1];
      if (workspaceResult?.status !== 'fulfilled' || !workspaceResult.value) return;

      window.dispatchEvent(new Event('finsight-workspace-hydrated'));

      const path = window.location.pathname;
      const institutionalPath = path.startsWith('/admin') || path.startsWith('/assessor') || path.startsWith('/cliente') || path === '/white-label';
      const refreshKey = `finsight-workspace-hydrated:${user.id}`;
      if (institutionalPath && sessionStorage.getItem(refreshKey) !== '1') {
        sessionStorage.setItem(refreshKey, '1');
        window.location.reload();
      }
    });
  }, [loading, user?.id, user?.isDemo, hydrateRemoteWatchlist]);

  return null;
}
