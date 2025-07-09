import { QueryClient } from "@tanstack/react-query";

export const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Disable retries to showcase error handling
      retry: 0,
    },
  },
});