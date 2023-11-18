import type { NextPage } from "next";
import { useAccount } from "wagmi";
import Carousel from "~~/components/Carousel";
import { MetaHeader } from "~~/components/MetaHeader";
import NFTUpload from "~~/components/NFTUpload";
import TopContentCreators from "~~/components/TopContentCreators";



const Home: NextPage = () => {
  const images = ["/slideshow-the-first.jpg", "/slideshow-share-content.jpg", "/slideshow-community.jpg"];
  
  // TODO: Get public key from InstallSnapButton
  // const [publicKey, setPublicKey] = useState(true);
  // const publicKey = "0x04fcbbf4c8055a8e04271d4e36dec9be5bdfdfe544fc7ccf8b80e71d11b080b09830e1776c66e99ffbe73accfd2d367e9631eac125d5983a6cfa2f4a514eb7c6f5";
  const { isConnecting, isDisconnected } = useAccount();

  const landingPage = isConnecting || isDisconnected;
  return (
    <>
      <MetaHeader />
        {landingPage && (<div className="flex items-center flex-col flex-grow">
          <div className="flex-grow bg-base-300 w-full">
            <div className="flex justify-center items-center gap-2 flex-col sm:flex-row">
              <Carousel images={images} />
            </div>
          </div>
        </div>
      )}
      {!landingPage && (
        <div className="flex items-center flex-col flex-grow">
          <div className="flex-grow bg-base-300 w-full px-8 py-12">
            <div className="flex justify-center items-center gap-2 flex-col sm:flex-row">
              <TopContentCreators />
              <NFTUpload />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
