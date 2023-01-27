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
      <h1 className="text-2xl my-5">Last posts from schmidsi.lens</h1>
      {!fetching && (
        <>
          asdf {data?.publications.items.length}
          {data?.publications.items.map((item: any) => (
            <div key={item["id"]} style={{ border: "1px solid black", marginBottom: 20 }}>
              <h2>{item.metadata.name}</h2>
              <div>
                {item.metadata.description}
                {item.metadata.content}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ExampleUI;
