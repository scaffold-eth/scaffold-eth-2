import { useCallback, useEffect, useState } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import { Address, formatUnits } from "viem";
import { useBalance, useBlockNumber } from "wagmi";
import { queryClient } from "~~/components/ScaffoldEthAppWithProviders";
import { useGlobalState } from "~~/services/store/store";

export function useAccountBalance(address?: Address) {
  const [isEthBalance, setIsEthBalance] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const price = useGlobalState(state => state.nativeCurrencyPrice);
  const { targetNetwork } = useTargetNetwork();

  const { data: blockNumber } = useBlockNumber({ watch: true, chainId: targetNetwork.id });
  const {
    data: fetchedBalanceData,
    isError,
    isLoading,
    queryKey,
  } = useBalance({
    address,
    chainId: targetNetwork.id,
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [blockNumber, queryKey]);

  const onToggleBalance = useCallback(() => {
    if (price > 0) {
      setIsEthBalance(!isEthBalance);
    }
  }, [isEthBalance, price]);

  useEffect(() => {
    if (fetchedBalanceData?.value !== undefined && fetchedBalanceData?.decimals) {
      setBalance(Number(formatUnits(fetchedBalanceData.value, fetchedBalanceData.decimals)));
    }
  }, [fetchedBalanceData, targetNetwork]);

  return { balance, price, isError, isLoading, onToggleBalance, isEthBalance };
}
