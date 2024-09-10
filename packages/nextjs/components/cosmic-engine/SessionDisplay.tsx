import { Session } from "next-auth";

interface SessionDisplayProps {
  session: Session;
}

export const SessionDisplay = async ({ session }: SessionDisplayProps) => {
  return (
    <div className="flex flex-col rounded-md bg-gray-100">
      <div className="rounded-t-md bg-gray-200 p-4 font-bold">Current Session</div>
      <pre className="whitespace-pre-wrap break-all px-4 py-6">{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
};
