import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@shared/trpc";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return import.meta.env.VITE_API_BASE ?? "";
  }
  const port = process.env.PORT ?? "4173";
  return process.env.VITE_API_BASE ?? `http://localhost:${port}`;
};

export const createTrpcClient = () =>
  trpc.createClient({
    links: [
      httpBatchLink({
        transformer: superjson,
        url: `${getBaseUrl()}/trpc`,
      }),
    ],
  });
