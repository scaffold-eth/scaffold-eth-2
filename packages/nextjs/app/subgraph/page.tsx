"use client";

import React from "react";
import Link from "next/link";
import { gql, useQuery } from "@apollo/client";
import type { NextPage } from "next";
import { MagnifyingGlassIcon, PlusIcon, PowerIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";

const Home: NextPage = () => {
  const GREETINGS_GRAPHQL = `
{
  greetings(first: 25, orderBy: createdAt, orderDirection: desc) {
    id
    greeting
    premium
    value
    createdAt
    sender {
      address
      greetingCount
    }
  }
}
`;

  const GREETINGS_GQL = gql(GREETINGS_GRAPHQL);
  const greetingsData = useQuery(GREETINGS_GQL, { pollInterval: 1000 });

  console.log("greetingsData: ", greetingsData);
  return (
    <>
      <div>
        <div className="flex items-center flex-col flex-grow pt-10">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to your</span>
            <span className="block text-4xl font-bold">Subgraph</span>
          </h1>
          <p className="text-center text-lg">
            Look at the subgraph manifest defined in{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/subgraph/subgraph.yaml
            </code>
          </p>
          <p className="text-center text-lg">
            Examine the entities in{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              schema.graphql
            </code>{" "}
            located in{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/subgraph/src
            </code>
          </p>
          <p className="text-center text-lg">
            Data is processed using AssemblyScript Mappings in{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/subgraph/src/mapping.ts
            </code>
          </p>
        </div>
        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <PowerIcon className="h-8 w-8 fill-secondary" />
              <p className="text-center text-lg">
                Start your subgraph environment using{" "}
                <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
                  yarn run-node
                </code>
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <PlusIcon className="h-8 w-8 fill-secondary" />
              <p className="text-center text-lg">
                Create your subgraph on graph-node with{" "}
                <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
                  yarn local-create
                </code>
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <RocketLaunchIcon className="h-8 w-8 fill-secondary" />
              <p className="text-center text-lg">
                Deploy your subgraph configuration with{" "}
                <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
                  yarn local-ship
                </code>
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p className="mb-0">Explore data in your local graph-node using the built in </p>
              <Link
                href="http://localhost:8000/subgraphs/name/scaffold-eth/your-contract/graphql"
                passHref
                className="link"
                target="_blank"
                rel="noopener noreferrer"
              >
                GraphiQL tool.
              </Link>{" "}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
