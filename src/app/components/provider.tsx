"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, getFetch, loggerLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "@/trpc";

export default function Procider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 5000, retry: false } },
      })
  );

  // const url = "http://localhost:3000/api/trpc";

  const url = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
    ? process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
    : "http://localhost:3000/api/trpc";

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url,
          fetch: async (input, init?) => {
            const fetch = getFetch();
            return fetch(input, {
              ...init,
              headers: {
                ...init?.headers,
                Authorization: localStorage.getItem("chess_jwt_token") || "",
              },
              credentials: "include",
            });
          },
        }),
      ],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
