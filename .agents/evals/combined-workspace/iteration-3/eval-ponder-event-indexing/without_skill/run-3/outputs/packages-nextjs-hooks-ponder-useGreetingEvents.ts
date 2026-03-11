import { usePonderQuery } from "./usePonderQuery";

type GreetingChangeEvent = {
  id: string;
  greetingSetter: `0x${string}`;
  newGreeting: string;
  premium: boolean;
  value: string;
  blockNumber: string;
  timestamp: string;
  transactionHash: `0x${string}`;
};

type GreetingChangesResponse = {
  greetingChanges: GreetingChangeEvent[];
};

const GREETING_EVENTS_QUERY = `
  query GreetingEvents($limit: Int!, $offset: Int!) {
    greetingChanges(
      limit: $limit,
      offset: $offset,
      orderBy: "timestamp",
      orderDirection: "desc"
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

type UseGreetingEventsParams = {
  limit?: number;
  offset?: number;
};

export const useGreetingEvents = ({
  limit = 10,
  offset = 0,
}: UseGreetingEventsParams = {}) => {
  return usePonderQuery<{ greetingChanges: { items: GreetingChangeEvent[] } }>(
    ["greetingEvents", String(limit), String(offset)],
    GREETING_EVENTS_QUERY,
    { limit, offset },
  );
};
