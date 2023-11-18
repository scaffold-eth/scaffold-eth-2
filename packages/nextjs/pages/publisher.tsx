import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import PublisherView from "~~/components/PublisherView";
import { useAccount, useContractRead } from "wagmi";
import { useDeployedContractInfo, useNetworkColor } from "~~/hooks/scaffold-eth";
import { Abi } from "abitype";

const PublisherDashboard: NextPage = () => {

  const { address } = useAccount();
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo("SecretFans");
  const [tournamentInfo, setTournamentInfo] = useState<any>({});

  const { isFetching, refetch } = useContractRead({
    address: deployedContractData?.address,
    functionName: "Channels",
    abi: deployedContractData?.abi as Abi,
    enabled: false,
    args: [address],
    onSuccess: (data: any) => {
      console.log("!!!!!!",data);
      const tournament = {
        nsub: data[0],
        minsubfee: data[1],
        totalETH: data[2],
        totalShares: data[3],
      };
      console.log("asaber torunamentbox, read"); // TODO no està loggegan aixo
      setTournamentInfo(tournament);
    },
  });
  refetch()

  console.log("??????????",tournamentInfo.nsub)
  const publisherProps = {
    subscribers: Number(tournamentInfo.nsub),
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
