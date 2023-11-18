import { useCallback, useEffect, useState } from "react";
import { useBalance } from "wagmi";
import { useScaffoldConfig } from "~~/context/ScaffoldConfigContext";
import { useGlobalState } from "~~/services/store/store";

// import { getTargetNetwork } from "~~/utils/scaffold-eth";

export function useAccountBalance(address?: string) {
  const [isEthBalance, setIsEthBalance] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const price = useGlobalState(state => state.nativeCurrencyPrice);
  const { configuredNetwork } = useScaffoldConfig();

  const {
    data: fetchedBalanceData,
    isError,
    isLoading,
  } = useBalance({
    address,
    watch: true,
    chainId: configuredNetwork.id,
  });

  const onToggleBalance = useCallback(() => {
    if (price > 0) {
      setIsEthBalance(!isEthBalance);
    }
  }, [isEthBalance, price]);

  useEffect(() => {
    if (fetchedBalanceData?.formatted) {
      setBalance(Number(fetchedBalanceData.formatted));
    }
  }, [fetchedBalanceData, configuredNetwork]);

  return { balance, price, isError, isLoading, onToggleBalance, isEthBalance };
}
