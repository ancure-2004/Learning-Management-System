import { QueryClient } from '@tanstack/react-query';

// Shared React Query client. Sensible defaults for an admin/data app:
// cache for 30s, retry once, don't refetch on every window focus.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default queryClient;
