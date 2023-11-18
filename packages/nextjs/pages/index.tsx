import { useEffect, useState } from "react";
import { Button } from "@chakra-ui/react";
import type { NextPage } from "next";
import Carousel from "~~/components/Carousel";
import { MetaHeader } from "~~/components/MetaHeader";
import NFTUserView from "~~/components/NFTUserView";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import SubscribeButton from "~~/components/Buttons/SubscribeButton";
import InstallSnapButton from "~~/components/Buttons/InstallSnapButton";


const Home: NextPage = () => {
  const images = ["/slideshow-the-first.jpg", "/slideshow-share-content.jpg", "/slideshow-community.jpg"];
  const loggedIn = false;
  
  // TODO: Get public key from InstallSnapButton
  // const [publicKey, setPublicKey] = useState(true);
  const publicKey = "0x04fcbbf4c8055a8e04271d4e36dec9be5bdfdfe544fc7ccf8b80e71d11b080b09830e1776c66e99ffbe73accfd2d367e9631eac125d5983a6cfa2f4a514eb7c6f5";
  const { data: contract, isLoading: deployedContractLoading } = useDeployedContractInfo("SecretFans");
  console.log({publicKey})
  return (
    <>
      <MetaHeader />
      {
        publicKey && !deployedContractLoading && contract && (
          < SubscribeButton
            smartContract={contract}
            amountETH={BigInt("0x44444444")}
            contentCreatorAddr="0x4838b106fce9647bdf1e7877bf73ce8b0bad5f97"
            publicKey={publicKey}
          />
        )
      }
      {publicKey && (
        <InstallSnapButton />
      )}
      


      {false && !loggedIn && (
        <div className="flex items-center flex-col flex-grow">
          <div className="flex-grow bg-base-300 w-full">
            <div className="flex justify-center items-center gap-2 flex-col sm:flex-row">
              <Carousel images={images} />
            </div>
          </div>
        </div>
      )}
      {loggedIn && (
        <div className="flex items-center flex-col flex-grow">
          <div className="flex-grow bg-base-300 w-full px-8 py-12">
            <div className="flex justify-center items-center gap-2 flex-col sm:flex-row">
              <NFTUserView />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
