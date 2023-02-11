import { useCallback, useEffect, useState } from "react";
import { useBalance } from "wagmi";
import { useAppStore } from "~~/services/store/store";
import { getConfiguredChainFromENV } from "~~/utils/scaffold-eth";

export function useAccountBalance(address?: string) {
  const [isEthBalance, setIsEthBalance] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const price = useAppStore(state => state.ethPrice);
  const configuredChain = getConfiguredChainFromENV();

  const {
    data: fetchedBalanceData,
    isError,
    isLoading,
  } = useBalance({
    address,
    watch: true,
    chainId: configuredChain.id,
  });

  const onToggleBalance = useCallback(() => {
    setIsEthBalance(!isEthBalance);
  }, [isEthBalance]);

  useEffect(() => {
    if (fetchedBalanceData?.formatted) {
      setBalance(Number(fetchedBalanceData.formatted));
    }
  }, [fetchedBalanceData]);

  return { balance, price, isError, isLoading, onToggleBalance, isEthBalance };
}
