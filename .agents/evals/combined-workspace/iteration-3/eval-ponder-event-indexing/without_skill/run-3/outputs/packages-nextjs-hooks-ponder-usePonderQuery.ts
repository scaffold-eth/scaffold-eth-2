import { useQuery } from "@tanstack/react-query";

const PONDER_GRAPHQL_URL =
  process.env.NEXT_PUBLIC_PONDER_URL ?? "http://localhost:42069/graphql";

/**
 * Generic hook for querying the Ponder GraphQL API.
 * Wraps @tanstack/react-query with a fetch to the Ponder endpoint.
 */
export const usePonderQuery = <TData = unknown>(
  queryKey: string[],
  query: string,
  variables?: Record<string, unknown>,
) => {
  return useQuery<TData>({
    queryKey,
    queryFn: async () => {
      const response = await fetch(PONDER_GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ponder GraphQL request failed: ${response.statusText}`);
      }

      const json = await response.json();

      if (json.errors) {
        throw new Error(json.errors[0]?.message ?? "GraphQL query error");
      }

      return json.data as TData;
    },
    refetchInterval: 5000,
  });
};
