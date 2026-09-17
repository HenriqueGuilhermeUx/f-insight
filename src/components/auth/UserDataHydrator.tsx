import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAppStore } from '@/hooks/useStore';

export default function UserDataHydrator() {
  const { user, loading } = useAuth();
  const hydrateRemoteWatchlist = useAppStore((state) => state.hydrateRemoteWatchlist);

  useEffect(() => {
    if (loading || !user?.id) return;
    void hydrateRemoteWatchlist(user.id);
  }, [loading, user?.id, hydrateRemoteWatchlist]);

  return null;
}
