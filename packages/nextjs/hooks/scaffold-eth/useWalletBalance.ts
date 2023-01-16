import { useCallback, useEffect, useState } from "react";
import { useBalance } from "wagmi";
import { useAppStore } from "~~/services/store/store";

export function useWalletBalance(address?: string) {
  const [isEthBalance, setIsEthBalance] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const price = useAppStore(state => state.ethPriceSlice.ethPrice);

  const {
    data: fetchedBalanceData,
    isError,
    isLoading,
  } = useBalance({
    addressOrName: address,
    watch: true,
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
