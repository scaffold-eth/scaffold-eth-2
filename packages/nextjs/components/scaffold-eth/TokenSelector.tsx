import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { useAccount } from "wagmi";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { InputBase } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { Token, useToken } from "~~/hooks/scaffold-eth/useToken";

type TokenSelectorProps = {
  chainId?: number | undefined;
  suggestedTokens?: string[] | undefined;
  button?: ((selectedToken: Token | undefined) => React.ReactNode) | undefined;
  onChange?: ((token: Token) => void) | undefined;
};

const TokenListing = ({
  token,
  isChosen,
  onClick,
  importStatus = "not-imported",
}: {
  token: Token;
  isChosen: boolean;
  onClick: (token: Token) => void;
  importStatus: "to-import" | "imported" | "not-imported";
}) => {
  return (
    <button
      className={`group flex items-center gap-x-2 px-6 py-2 transition-colors duration-75 ${
        isChosen ? "brightness-75 cursor-default" : "hover:bg-base-300"
      }`}
      onClick={() => onClick(token)}
    >
      {token.logoURI ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={token.logoURI} alt={token.name} className="h-6 w-6 rounded-full" />
      ) : (
        <div className="avatar placeholder">
          <div className="bg-neutral text-neutral-content rounded-full w-6">
            <span className="text-xl">?</span>
          </div>
        </div>
      )}
      <div className="flex flex-col items-start">
        <span className="font-bold">{token.symbol}</span>
        <span className="text-slate-400">
          {importStatus === "imported" && "Imported • "}
          {token.name}
        </span>
      </div>

      {importStatus === "to-import" ? (
        <button className="btn btn-primary ml-auto">Import</button>
      ) : (
        <ArrowRightIcon
          className={`ml-auto h-6 w-6 transition-transform ${!isChosen && "group-hover:translate-x-2"}`}
        />
      )}
    </button>
  );
};

export const TokenList = ({
  isLoadingTokens,
  tokens,
  importedToken,
  onClick,
  onImportClick,
}: {
  isLoadingTokens: boolean;
  tokens: Token[];
  importedToken: { data: Token | null; isLoading: boolean };
  onClick: (token: Token) => void;
  onImportClick: (token: Token) => void;
}) => {
  if (isLoadingTokens || importedToken.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-300">Loading tokens...</p>
      </div>
    );
  }

  if (tokens.length === 0 && !importedToken.data) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-300">No tokens found</p>
      </div>
    );
  }

  return (
    <>
      {importedToken.data && (
        <TokenListing token={importedToken.data} isChosen={false} onClick={onImportClick} importStatus="imported" />
      )}

      {tokens.map(token => (
        <TokenListing
          key={token.address}
          token={token}
          isChosen={false}
          onClick={onClick}
          importStatus="not-imported"
        />
      ))}
    </>
  );
};

export const TokenSelector = ({
  chainId: chainIdOverride,
  suggestedTokens: suggestedTokenAddresses = [],
  button,
  onChange,
}: TokenSelectorProps) => {
  const { chain: accountChain } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  // use provided chainId, default to currently connected chain, with fallback to targetNetwork
  const chainId = chainIdOverride ?? accountChain?.id ?? targetNetwork.id;

  const modalCheckbox = useRef<HTMLInputElement>(null);

  const [selectedToken, setSelectedToken] = useState<Token | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const [allTokens, setAllTokens] = useState<Token[]>([]);
  const [importedTokens, setImportedTokens] = useLocalStorage<(Token & { imported: true })[]>(
    "scaffold-eth.importedTokens",
    [],
  );

  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    setTokens(
      [...importedTokens, ...allTokens].filter(token => {
        if (token.chainId !== chainId) return false;

        const processedSearchQuery = searchQuery.trim();

        if (!processedSearchQuery) return true;

        // either the token name includes the search input or the address matches the search inputs
        if (token.name.toLowerCase().includes(processedSearchQuery.toLowerCase())) return true;
        return token.address.toLowerCase() === processedSearchQuery.toLowerCase();
      }),
    );
  }, [allTokens, importedTokens, chainId, searchQuery]);

  const suggestedTokens = useMemo(
    () =>
      suggestedTokenAddresses
        .map(address => tokens.find(token => token.address === address))
        .filter(Boolean) as Token[],
    [suggestedTokenAddresses, tokens],
  );

  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  useEffect(() => {
    const fetchTokens = async () => {
      setIsLoadingTokens(true);
      const res = await fetch("https://tokens.uniswap.org");

      const data = await res.json();

      setAllTokens(data.tokens);
      setIsLoadingTokens(false);
    };

    fetchTokens();
  }, []);

  const selectToken = (newSelectedToken: Token) => {
    if (newSelectedToken.address === selectedToken?.address) {
      return;
    }
    setSelectedToken(newSelectedToken);
    if (modalCheckbox.current) {
      modalCheckbox.current.checked = false;
    }
    onChange?.(newSelectedToken);
  };

  console.log(tokens);

  const importedToken = useToken({
    address: searchQuery,
    enabled: tokens.length === 0,
    chainId,
  });

  return (
    <div>
      <label htmlFor="token-modal" className="btn btn-primary gap-1 font-normal">
        {button?.(selectedToken) ?? "Select a Token"}
      </label>
      <input type="checkbox" id="token-modal" className="modal-toggle" ref={modalCheckbox} />
      <label htmlFor="token-modal" className="modal cursor-pointer">
        <label className="modal-box relative px-0">
          <input className="absolute left-0 top-0 h-0 w-0" />

          <div className="mb-4 px-6">
            <h3 className="mb-3 text-xl font-bold">Select a Token</h3>
            <label htmlFor="token-modal" className="btn btn-circle btn-ghost btn-sm absolute right-3 top-3">
              {" "}
              ✕{" "}
            </label>

            <div className="divider" />

            <InputBase
              value={searchQuery}
              onChange={query => setSearchQuery(query)}
              placeholder="Search name or paste address"
            />

            <div className="mt-2 flex gap-2">
              {suggestedTokens.map(token => (
                <button
                  key={token.address}
                  className="flex gap-x-2 rounded-lg border border-primary p-1.5 transition-colors duration-75 hover:bg-primary"
                  onClick={() => selectToken(token)}
                >
                  {token.logoURI ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={token.logoURI} alt={token.name} className="h-6 w-6 rounded-full" />
                  ) : (
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-6">
                        <span className="text-xl">?</span>
                      </div>
                    </div>
                  )}

                  <span>{token.symbol}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="scrollbar flex h-[50vh] flex-col overflow-x-auto">
            <TokenList
              isLoadingTokens={isLoadingTokens}
              tokens={tokens}
              importedToken={importedToken}
              onClick={selectToken}
              onImportClick={token => {
                setImportedTokens([...importedTokens, { ...token, imported: true }]);
                selectToken(token);
              }}
            />
          </div>
        </label>
      </label>
    </div>
  );
};
