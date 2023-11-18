import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import PublisherView from "~~/components/PublisherView";
import { useAccount, useContractRead } from "wagmi";
import { useDeployedContractInfo, useNetworkColor } from "~~/hooks/scaffold-eth";
import { Abi } from "abitype";
import { formatEther } from "viem";

const PublisherDashboard: NextPage = () => {

  const { address } = useAccount();
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo("SecretFans");
  const [tournamentInfo, setTournamentInfo] = useState<any>({});

  const { isFetching, refetch: refetchChannels } = useContractRead({
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
  refetchChannels()

  console.log("??????????",tournamentInfo.nsub)
  const publisherProps = {
    subscribers: Number(tournamentInfo.nsub),
    totalValueLocked:formatEther((tournamentInfo.totalETH)),
    totalShares: formatEther(tournamentInfo.totalShares),
    pricePerShare: Number(tournamentInfo.totalETH)/Number(tournamentInfo.totalShares),
    minPriceToSubscribe: formatEther(tournamentInfo.minsubfee),
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
