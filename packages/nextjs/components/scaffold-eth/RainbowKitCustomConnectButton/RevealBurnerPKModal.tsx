import { ShieldExclamationIcon } from "@heroicons/react/24/outline";
import { useCopyToClipboard } from "~~/hooks/scaffold-eth";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

const BURNER_WALLET_PK_KEY = "burnerWallet.pk";

export const RevealBurnerPKModal = () => {
  const { copyToClipboard, isCopiedToClipboard } = useCopyToClipboard();

  const handleCopyPK = async () => {
    try {
      const burnerPK = localStorage?.getItem(BURNER_WALLET_PK_KEY);
      if (!burnerPK) throw new Error("Burner wallet private key not found");
      await copyToClipboard(burnerPK);
      notification.success("Burner wallet private key copied to clipboard");
    } catch (e) {
      const parsedError = getParsedError(e);
      notification.error(parsedError);
    }
  };

  return (
    <>
      <div>
        <input type="checkbox" id="reveal-burner-pk-modal" className="modal-toggle" />
        <label htmlFor="reveal-burner-pk-modal" className="modal cursor-pointer">
          <label className="modal-box relative">
            {/* dummy input to capture event onclick on modal box */}
            <input className="h-0 w-0 absolute top-0 left-0" />
            <label htmlFor="reveal-burner-pk-modal" className="btn btn-ghost btn-sm btn-circle absolute right-3 top-3">
              ✕
            </label>
            <div>
              <p className="text-lg font-semibold m-0 p-0">Copy Burner Wallet Private Key</p>
              <div role="alert" className="alert alert-warning mt-4">
                <ShieldExclamationIcon className="h-6 w-6" />
                <span className="font-semibold">Warning: Never Share Your Private Key with Anyone!</span>
              </div>
              <p>
                Your Private Key provides <strong>full access</strong> to your entire wallet and funds. This is
                currently stored <strong>temporarily</strong> in your browser.
              </p>
              <p>
                Be sure to securely import your Private Key into a more secure wallet if you have a substantial amount
                of assets.
              </p>
              <button className="btn btn-outline btn-error" onClick={handleCopyPK} disabled={isCopiedToClipboard}>
                Copy Private Key To Clipboard
              </button>
            </div>
          </label>
        </label>
      </div>
    </>
  );
};
