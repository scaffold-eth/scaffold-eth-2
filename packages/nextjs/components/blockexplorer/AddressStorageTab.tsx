import { useEffect, useState } from "react";
import { ethers } from "ethers";

type AddressStorageTabProps = {
  address: string;
  provider: ethers.providers.Provider;
};

export const AddressStorageTab = ({ address, provider }: AddressStorageTabProps) => {
  const [storage, setStorage] = useState<string[]>([]);

  useEffect(() => {
    const fetchStorage = async () => {
      try {
        const storageData = [];
        let idx = 0;

        while (true) {
          const storageAtPosition = await provider.getStorageAt(address, idx);

          if (storageAtPosition === "0x" + "0".repeat(64)) break;

          storageData.push(storageAtPosition);
          console.log(storageAtPosition);
          idx++;
        }
        setStorage(storageData);
      } catch (error) {
        console.error("Failed to fetch storage:", error);
      }
    };

    fetchStorage();
  }, [address, provider]);

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="mockup-code overflow-auto max-h-[500px]">
        <pre className="px-5 whitespace-pre-wrap break-words">
          {storage.map((data, i) => (
            <div key={i}>
              <strong>Storage Slot {i}:</strong> {data}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};
