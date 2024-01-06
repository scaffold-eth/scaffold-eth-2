//import Link from "next/link";
import React, { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";

const Home: NextPage = () => {
  const [activeTab, setActiveTab] = useState("yourProjects");
  return (
    <>
      <MetaHeader />
      <div className="flex flex-col flex-grow p-10 mx-auto">
        <div role="tablist" className="tabs tabs-bordered">
          <a
            role="tab"
            className={`tab ${activeTab === "yourProjects" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("yourProjects")}
          >
            Your Projects
          </a>
          <a
            role="tab"
            className={`tab ${activeTab === "availableProjects" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("availableProjects")}
          >
            Available Projects
          </a>
          <a
            role="tab"
            className={`tab ${activeTab === "completedProjects" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("completedProjects")}
          >
            Completed Projects
          </a>
        </div>
        <h1 className="p-10 font-black text-xl">Your Projects</h1>

        <div className="overflow-x-auto">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th>Project Info</th>
                <th>Available Spots</th>
                <th>Total Spots/Rounds</th>
                <th>Address</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {/* row 1 */}
              <tr>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-squircle w-12 h-12">
                        <img src="/usdc.png" alt="Avatar Tailwind CSS Component" />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">Make Ethereum Secure</div>
                      <div className="text-sm opacity-50">Ethereum Foundation</div>
                    </div>
                  </div>
                </td>
                <td>4</td>
                <td>12</td>
                <th>0x34842c43e655779a86e890e2b56D09Bc477a1CE3</th>
                <th>
                  <Link href="/players/1">
                    <button className="btn btn-xs">details</button>
                  </Link>
                </th>
              </tr>
              {/* row 2 */}
              <tr>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-squircle w-12 h-12">
                        <img src="/usdc.png" alt="Avatar Tailwind CSS Component" />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">Make Ethereum Secure</div>
                      <div className="text-sm opacity-50">Ethereum Foundation</div>
                    </div>
                  </div>
                </td>
                <td>4</td>
                <td>12</td>
                <th>0x34842c43e655779a86e890e2b56D09Bc477a1CE3</th>
                <th>
                  <Link href="/players/2">
                    <button className="btn btn-xs">details</button>
                  </Link>
                </th>
              </tr>
              {/* row 3 */}
              <tr>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-squircle w-12 h-12">
                        <img src="/usdc.png" alt="Avatar Tailwind CSS Component" />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">Make Ethereum Secure</div>
                      <div className="text-sm opacity-50">Ethereum Foundation</div>
                    </div>
                  </div>
                </td>
                <td>4</td>
                <td>12</td>
                <th>0x34842c43e655779a86e890e2b56D09Bc477a1CE3</th>
                <th>
                  <Link href="/players/3">
                    <button className="btn btn-xs">details</button>
                  </Link>
                </th>
              </tr>
              {/* row 4 */}
              <tr>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="mask mask-squircle w-12 h-12">
                        <img src="/usdc.png" alt="Avatar Tailwind CSS Component" />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">Make Ethereum Secure</div>
                      <div className="text-sm opacity-50">Ethereum Foundation</div>
                    </div>
                  </div>
                </td>
                <td>4</td>
                <td>12</td>
                <th>0x34842c43e655779a86e890e2b56D09Bc477a1CE3</th>
                <th>
                  <Link href="/players/4">
                    <button className="btn btn-xs">details</button>
                  </Link>
                </th>
              </tr>
            </tbody>
            {/* foot */}
            <tfoot>
              <tr>
                <th>Project Info</th>
                <th>Available Spots</th>
                <th>Total Spots/Rounds</th>
                <th>Address</th>
                <th></th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
};

export default Home;
