import { usePonderQuery } from "./usePonderQuery";

type GreetingSender = {
  address: `0x${string}`;
  greetingCount: number;
  lastGreeting: string;
  lastTimestamp: string;
  totalValue: string;
};

const GREETING_SENDERS_QUERY = `
  query GreetingSenders {
    greetingSenders(
      orderBy: "greetingCount",
      orderDirection: "desc",
      limit: 20
    ) {
      items {
        address
        greetingCount
        lastGreeting
        lastTimestamp
        totalValue
      }
    }
  }
`;

export const useGreetingSenders = () => {
  return usePonderQuery<{ greetingSenders: { items: GreetingSender[] } }>(
    ["greetingSenders"],
    GREETING_SENDERS_QUERY,
  );
};
