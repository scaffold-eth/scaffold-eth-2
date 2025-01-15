import { ButtonHTMLAttributes } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

interface ConnectWalletButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  connectText?: string;
  disabled?: boolean;
}

export const ConnectWalletButton = ({
  children,
  connectText = "Connect Wallet",
  disabled = false,
  onClick,
  className,
  ...props
}: ConnectWalletButtonProps) => {
  const { isConnected } = useAccount();
  const { openConnectModal, connectModalOpen } = useConnectModal();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (isConnected) {
      onClick?.(e);
    } else {
      openConnectModal?.();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      disabled={disabled || (!isConnected && !openConnectModal) || connectModalOpen}
      {...props}
    >
      {isConnected ? (
        children
      ) : connectModalOpen ? (
        <>
          <div className="loading" />
          Connecting...
        </>
      ) : (
        connectText
      )}
    </button>
  );
};
