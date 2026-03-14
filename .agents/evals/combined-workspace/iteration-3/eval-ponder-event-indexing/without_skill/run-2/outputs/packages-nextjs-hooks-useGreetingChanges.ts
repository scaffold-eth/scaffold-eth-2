import { useEffect, useState, useCallback } from "react";

const PONDER_GRAPHQL_URL =
  process.env.NEXT_PUBLIC_PONDER_URL ?? "http://localhost:42069/graphql";

type GreetingChangeEvent = {
  id: string;
  greetingSetter: string;
  newGreeting: string;
  premium: boolean;
  value: string;
  blockNumber: string;
  timestamp: string;
  transactionHash: string;
};

type UseGreetingChangesOptions = {
  greetingSetter?: string;
  first?: number;
  orderDirection?: "asc" | "desc";
};

type UseGreetingChangesResult = {
  data: GreetingChangeEvent[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
};

export const useGreetingChanges = (
  options: UseGreetingChangesOptions = {},
): UseGreetingChangesResult => {
  const { greetingSetter, first = 50, orderDirection = "desc" } = options;
  const [data, setData] = useState<GreetingChangeEvent[] | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const refetch = useCallback(() => {
    setRefetchKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);

      // Build where clause for filtering
      const whereClause = greetingSetter
        ? `, where: { greetingSetter: "${greetingSetter.toLowerCase()}" }`
        : "";

      const query = `
        query GreetingChanges {
          greetingChanges(
            first: ${first},
            orderBy: "timestamp",
            orderDirection: "${orderDirection}"
            ${whereClause}
          ) {
            items {
              id
              greetingSetter
              newGreeting
              premium
              value
              blockNumber
              timestamp
              transactionHash
            }
          }
        }
      `;

      try {
        const response = await fetch(PONDER_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error(`Ponder API responded with status ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
          throw new Error(result.errors[0]?.message ?? "GraphQL error");
        }

        setData(result.data?.greetingChanges?.items ?? []);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch events"),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();

    // Poll every 4 seconds for new events
    const interval = setInterval(fetchEvents, 4000);
    return () => clearInterval(interval);
  }, [greetingSetter, first, orderDirection, refetchKey]);

  return { data, isLoading, error, refetch };
};
