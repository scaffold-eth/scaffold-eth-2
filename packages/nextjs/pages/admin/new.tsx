//import Link from "next/link";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";

const Home: NextPage = () => {
  return (
    <>
      <MetaHeader />
      <div className="flex flex-col flex-grow pt-10 mx-auto">
        <h1 className="font-black text-2xl">New Grant </h1>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Project Name</span>
          </div>
          <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs" />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Maximum Participants (Rounds)</span>
          </div>
          <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs" />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Prize Pool (USDC)</span>
          </div>
          <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs" />
        </label>
        <div className="flex flex-row">
          <button className="btn btn-primary m-6 w-24">Create</button>
          <button className="btn btn-secondary my-6 w-24">Pay</button>
        </div>
        <p>You will be able to add participants and judges in your dashboard after creating and funding a grant.</p>
      </div>
    </>
  );
};

export default Home;
