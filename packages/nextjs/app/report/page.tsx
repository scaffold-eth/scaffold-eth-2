"use client";

import { useAccount } from "wagmi";

const Report = () => {
  const { isConnected } = useAccount();
  return (
    <div className="flex items-center justify-center h-dvh ">
      <div className="card glass w-1/3 h-3/4">
        {/* <figure>
                <img
                    src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
                    alt="car!" />
            </figure>
            <div className="card-body">
                <h2 className="card-title">Life hack</h2>
                <p>How to park your car at your garage?</p>
                <div className="card-actions justify-end">
                    <button className="btn btn-primary">Learn now!</button>
                </div>
            </div> */}
        <div className="card-body h-full flex space-between">
          <h2 className="card-title justify-center">Report Hate Speech!</h2>
          <div className="flex-1">
            <label className="form-control">
              <div className="label">
                <span className="label-text text-base">Please input the hate speech faced</span>
              </div>
              <textarea
                className="textarea textarea-accent rounded-md min-h-24 w-auto textarea-lg"
                placeholder="Report the hate speech you encountered"
              ></textarea>
            </label>
            <label className="form-control w-auto">
              <div className="label">
                <span className="label-text">What is your in game name?</span>
              </div>
              <input type="text" placeholder="Type here" className="input input-bordered rounded-md w-full" />
            </label>
            <label className="form-control w-auto">
              <div className="label">
                <span className="label-text">What is the in game name of the offender?</span>
              </div>
              <input type="text" placeholder="Type here" className="input input-bordered rounded-md w-full" />
            </label>
            <label className="form-control w-auto">
              <div className="label">
                <span className="label-text">Name of the game</span>
              </div>
              <input type="text" placeholder="Type here" className="input input-bordered rounded-md w-full" />
            </label>
          </div>
          <div className="card-actions justify-center items p-2">
            <button className="btn dark:btn-primary btn-accent" disabled={!isConnected}>
              {isConnected ? "Report now!" : "Connect your wallet to report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
