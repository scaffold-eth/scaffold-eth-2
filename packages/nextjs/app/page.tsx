"use client";

import { ReactElement, useEffect, useState } from "react";
import type { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";
import { useClient } from "~~/hooks/scaffold-eth/useClient";

const Home: NextPage = () => {
  const { address, client } = useClient();
  const [nfts, setNfts] = useState(new Array<ReactElement>());

  useEffect(() => {
    console.log({
      clientExists: !!client,
    });
    if (!client || !address || !!nfts?.length) return;
    setNfts([<></>]);

    main(client, address).then(xs => setNfts(xs));
  }, [address]);

  // Get all the image urls for all the NFTs an address owns.
  async function main(client: Client, address: string) {
    const items = [];
    for await (const { image } of client.nft.getNftsForOwnerIterator(address, { pageSize: 5 })) {
      console.log({ image });
      if (!(!!image.cachedUrl && image.contentType?.includes("image"))) continue;
      items.push(
        <>
          testing
          <img src={image.cachedUrl} key={image.pngUrl} />
        </>,
      );
      if (items.length === 4) break;
    }
    return items;
  }

  if (!client) return <div>Loading...</div>;
  type Client = typeof client;

  return (
    <div className="flex justify-center items-center">
      <div>
        <p className="my-2 font-medium">Connected Address:</p>
        <Address address={address} />
        <>{...nfts}</>
      </div>
    </div>
  );
};

export default Home;
