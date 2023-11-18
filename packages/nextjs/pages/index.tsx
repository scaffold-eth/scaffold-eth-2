import type { NextPage } from "next";
import Carousel from "~~/components/Carousel";
import { MetaHeader } from "~~/components/MetaHeader";
import NFTUserView from "~~/components/NFTUserView";

const Home: NextPage = () => {
  const images = ["/slideshow-the-first.jpg", "/slideshow-share-content.jpg", "/slideshow-community.jpg"];
  const loggedIn = false;

  return (
    <>
      <MetaHeader />
      {!loggedIn && (
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
