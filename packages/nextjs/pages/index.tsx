import Head from "next/head";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Accountability Protocol</title>
        <meta name="description" content="Accountability protocol brings accountability to the crypto fund raising" />
      </Head>

      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Accountability Protocol</span>
          </h1>
          <p className="text-center text-lg">
            Revolutionizing decentralized investments with transparency and accountability
          </p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl h-64">
              <h2 className="font-bold py-2">Flexible Milestone Creation</h2>
              <p>
                Create milestones that align with your goals and negotiate milestones with investors to create a more
                balanced agreement
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl h-64">
              <h2 className="font-bold py-2">Gradual Release of Funds</h2>
              <p>Release funds to your project in a gradual manner over time as milestones are achieved</p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl h-64">
              <h2 className="font-bold py-2">Incentivize Timely Milestone Achievement</h2>
              <p>
                Projects are incentivized to meet milestones in a timely manner through bonuses or other incentives
                offered upon completion of a milestone
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl h-64">
              <h2 className="font-bold py-2">Transparent Milestone Approval</h2>
              <p>
                Investors can approve milestones through a voting system or time-based release or via delegation to an
                Admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
