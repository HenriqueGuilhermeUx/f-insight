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
      if (workspaceResult?.status === 'fulfilled' && workspaceResult.value) {
        window.dispatchEvent(new Event('finsight-workspace-hydrated'));
      }
    });
  }, [loading, user?.id, user?.isDemo, hydrateRemoteWatchlist]);

  return null;
}
