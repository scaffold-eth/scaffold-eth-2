type TokenAmountProps = {
  amount: number;
  precision?: number;
  currencyPosition?: "left" | "right";
  currency?: string;
};

/**
 * Display a token amount with a custom precision.
 */
export const TokenAmount = ({ amount, precision = 4, currencyPosition = "left", currency }: TokenAmountProps) => {
  const displayAmount = parseFloat(amount.toString()).toFixed(precision);
  const currencySymbol = <span className="text-[0.8em] font-bold">{currency}</span>;

  return (
    <div className="flex items-center justify-center">
      {currencyPosition === "left" && (
        <>
          <span>
            {currencySymbol} {displayAmount}
          </span>
        </>
      )}
      {currencyPosition === "right" && (
        <>
          <span>
            {displayAmount} {currencySymbol}
          </span>
        </>
      )}
    </div>
  );
};
