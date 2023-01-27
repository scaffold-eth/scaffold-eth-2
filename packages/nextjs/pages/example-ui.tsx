import type { NextPage } from "next";
import { useQuery } from "urql";

import { PublicationsDocument } from "@se-2/graph-client";

const ExampleUI: NextPage = () => {
  const [{ data, fetching, error }] = useQuery({
    query: PublicationsDocument,
  });

  console.log({ data, fetching, error });

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl my-5">Example UI</h1>
    </div>
  );
};

export default ExampleUI;
