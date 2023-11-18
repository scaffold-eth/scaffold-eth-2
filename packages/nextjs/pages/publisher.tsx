import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import PublisherView from "~~/components/PublisherView";

const PublisherDashboard: NextPage = () => {
  const publisherProps = {
    subscribers: 3,
    totalValueLocked: 100,
    totalShares: 10,
    pricePerShare: 10,
    minPriceToSubscribe: 5,
    nfts: ["nft1", "nft2"],
  };

  return (
    <>
      <MetaHeader />
      <PublisherView {...publisherProps} />
    </>
  );
};

export default PublisherDashboard;
