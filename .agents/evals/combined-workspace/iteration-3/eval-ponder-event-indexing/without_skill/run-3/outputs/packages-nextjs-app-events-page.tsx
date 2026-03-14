"use client";

import type { NextPage } from "next";
import GreetingEventsTable from "./_components/GreetingEventsTable";
import GreetingSendersTable from "./_components/GreetingSendersTable";

const EventsPage: NextPage = () => {
  return (
    <div className="flex flex-col items-center py-10 px-5 gap-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Indexed Events</h1>
        <p className="text-lg mt-2 opacity-70">
          GreetingChange events indexed by Ponder and served via GraphQL
        </p>
      </div>

      <div className="w-full max-w-5xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Greeting Changes</h2>
            <p className="text-sm opacity-70">
              All GreetingChange events emitted by YourContract, ordered by most recent first.
            </p>
            <GreetingEventsTable />
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Top Greeting Senders</h2>
            <p className="text-sm opacity-70">
              Aggregated stats for each address that has set a greeting.
            </p>
            <GreetingSendersTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
