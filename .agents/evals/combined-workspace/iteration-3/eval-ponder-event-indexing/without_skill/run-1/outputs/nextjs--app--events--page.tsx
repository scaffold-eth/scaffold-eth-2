import { EventsDisplay } from "./_components/EventsDisplay";
import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Greeting Events",
  description: "View indexed GreetingChange events from YourContract via Ponder",
});

const EventsPage: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">Greeting Events</span>
          </h1>
          <p className="text-center text-lg">
            Indexed <code className="italic bg-base-300 text-base font-bold px-1">GreetingChange</code> events from
            YourContract, powered by Ponder
          </p>
        </div>
        <div className="w-full max-w-4xl mt-8 px-4">
          <EventsDisplay />
        </div>
      </div>
    </>
  );
};

export default EventsPage;
