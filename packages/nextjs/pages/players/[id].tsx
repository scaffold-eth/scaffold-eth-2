//import Link from "next/link";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";

const Project: NextPage = () => {
  return (
    <>
      <MetaHeader />
      <div className="flex flex-row flex-grow pt-10 mx-auto">
        {/* Project Menu List 
        <div className="px-5 w-1/4">
          <ul className="menu bg-base-200 w-56 rounded-box">
            <li className="menu-title">Your Current Projects</li>
            <li><a>Project 1 <div className="badge badge-primary">Active</div></a></li>
            <li><a>Project 2 <div className="badge badge-outline">Eliminated</div></a></li>
            <li><a>Project 3 <div className="badge badge-secondary">Completed</div></a></li>
          </ul>
        </div>*/}

        {/* Project Data */}
        <div className="flex flex-col px-5 w-full">
          {/* Header */}
          <div className="flex flex-row justify-between">
            <h1 className="text-2xl font-black">Project Name</h1>
            <h3 className="text-md pt-2 pl-4">
              <span className="text-slate-400">0x40Ac73fEB67e9d50087cce1FB739B92c99B2fF0E</span>
            </h3>
            <h1 className="text-2xl font-black">
              Round <span className="bg-color-zinc-400"></span>2/8
            </h1>
          </div>

          {/* Project Stats */}
          <div className="stats shadow pt-6">
            <div className="stat place-items-center">
              <div className="stat-title">Round Deadline</div>
              <div className="stat-value text-2xl">Jan 12, 2024</div>
              <div className="stat-desc">18:30:00 UTC</div>
            </div>
            <div className="stat place-items-center">
              <div className="stat-title">Pending Reward</div>
              <div className="stat-value text-2xl">200 USDC</div>
            </div>
            <div className="stat place-items-center">
              <div className="stat-title">Remaining Funds</div>
              <div className="stat-value text-2xl">1200 USDC</div>
              <div className="stat-desc">(80%)</div>
            </div>
          </div>

          {/* Claim Button */}
          <div className="flex flex-row pt-6 justify-center">
            <div className="p-2">Total Pending Rewards: 200 USDC</div>
            <button className="btn btn-primary">Claim Reward</button>
          </div>

          {/* Transactions */}
          <div className="overflow-x-auto pt-6">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th>Round #</th>
                  <th>Tx Hash</th>
                  <th>Amount</th>
                  <th>Claimed</th>
                </tr>
              </thead>
              <tbody>
                {/* row 1 */}
                <tr>
                  <th>1</th>
                  <td>0x8aa01576787c820483620e4e1829cb51cdc145fda52ba40b9a1244cd138c7ded</td>
                  <td>200 USDC</td>
                  <td>
                    <input type="checkbox" checked="checked" className="checkbox" />
                  </td>
                </tr>
                {/* row 2 */}
                <tr>
                  <th>2</th>
                  <td>0x8aa01576787c820483620e4e1829cb51cdc145fda52ba40b9a1244cd138c7ded</td>
                  <td>200 USDC</td>
                  <td>
                    <input type="checkbox" checked="" className="checkbox" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Project;
