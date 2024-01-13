import { hardhat } from "wagmi/chains";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { ChatBubbleLeftRightIcon, DocumentTextIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet } from "~~/components/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

/**
 * Site footer
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrencyPrice);

  return (
    <div className="min-h-0 p-5 mb-11 lg:mb-0">
      <div>
        <div className="fixed flex justify-between items-center w-full z-10 p-4 bottom-0 left-0 pointer-events-none">
          <div className="flex space-x-2 pointer-events-auto">
            {nativeCurrencyPrice > 0 && (
              <div className="btn btn-primary btn-sm font-normal cursor-auto">
                <CurrencyDollarIcon className="h-4 w-4 mr-0.5" />
                <span>{nativeCurrencyPrice}</span>
              </div>
            )}
            {getTargetNetwork().id === hardhat.id && <Faucet />}
          </div>
          <SwitchTheme className="pointer-events-auto" />
        </div>
      </div>
      <div className="w-full">
        <ul className="menu menu-horizontal w-full">
          <div className="flex justify-center items-center gap-2 text-sm w-full">
            <div>
            <ArrowTopRightOnSquareIcon className="inline-block h-4 w-4" /> {" "}
              <a
                href="https://opensea.io/collection/denota-protocol-beta"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                OpenSea Collection
              </a>
            </div>
            <span>·</span>
            <div>
            <DocumentTextIcon className="inline-block h-4 w-4" /> {" "}
              <a
                href="https://denota.gitbook.io/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                Explore the Gitbook
              </a>
            </div>
            <span>·</span>
            <div>
            <ChatBubbleLeftRightIcon className="inline-block h-4 w-4" /> {" "}
              <a
                href="https://t.me/almarazETH"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                Feedback4Pay
              </a>
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
};
