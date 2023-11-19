import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import PublisherView from "~~/components/PublisherView";
import { useAccount, useContractRead } from "wagmi";
import { useDeployedContractInfo, useNetworkColor } from "~~/hooks/scaffold-eth";
import { Abi } from "abitype";
import { formatEther } from "viem";
import Verification from "~~/components/Verification";
import { Box, Text, Heading } from "@chakra-ui/react";
import CheckIcon from "@heroicons/react/20/solid/CheckIcon";

const PublisherDashboard: NextPage = () => {

  const { address } = useAccount();
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo("SecretFans");
  const [tournamentInfo, setTournamentInfo] = useState<any>({});

  const [isVerified, setIsVerified] = useState(false);

  const { isFetching, refetch: refetchChannels } = useContractRead({
    address: deployedContractData?.address,
    functionName: "Channels",
    abi: deployedContractData?.abi as Abi,
    enabled: false,
    args: [address],
    onSuccess: (data: any) => {
      // console.log("!!!!!!",data);
      const tournament = {
        nsub: data[0],
        minsubfee: data[1],
        totalETH: data[2],
        totalShares: data[3],
      };
      // console.log("asaber torunamentbox, read"); // TODO no està loggegan aixo
      setTournamentInfo(tournament);
    },
  });
  refetchChannels()

  // console.log("??????????",tournamentInfo.nsub)
  const publisherProps = {
    subscribers: Number(tournamentInfo.nsub),
    totalValueLocked:formatEther((tournamentInfo.totalETH ?? 0)),
    totalShares: formatEther(tournamentInfo.totalShares ?? 0),
    pricePerShare: Number(tournamentInfo.totalETH)/Number(tournamentInfo.totalShares),
    minPriceToSubscribe: formatEther(tournamentInfo.minsubfee ?? 0),
    nfts: ["nft1", "nft2"],
  };

  return (
    <>
      <MetaHeader />
      { !isVerified &&
      <Verification setIsVerified={setIsVerified}/> }
        { isVerified && <Box mt={4} style={{display: "flex", justifyContent: "center"}}>
          <CheckIcon fill="green" style={{width: "60px", fontWeight: "bold"}} color="green.500" />
          <Heading mt={2.5}>WorldID Verified</Heading>
          </Box> }
      <PublisherView {...publisherProps} />
    </>
  );
};

export default PublisherDashboard;
