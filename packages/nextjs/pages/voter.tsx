//import Link from "next/link";
import Link from "next/link";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";

const Home: NextPage = () => {
  return (
    <>
      <MetaHeader />
      <div className="flex flex-row flex-grow pt-10 mx-auto">
        {/* Project Menu List */}
        <div className="px-5 w-1/4">
          <ul className="menu bg-base-200 w-56 rounded-box">
            <li className="menu-title">Your Votes</li>
            <li>
              <a>
                Project 1 <div className="badge badge-primary">Active</div>
              </a>
            </li>
            <li>
              <a>
                Project 2 <div className="badge badge-primary">Active</div>
              </a>
            </li>
            <li>
              <a>
                Project 3 <div className="badge badge-secondary">Completed</div>
              </a>
            </li>
          </ul>
        </div>

        {/* Project Data */}
        <div className="flex flex-col px-5 w-full">
          {/* Header */}
          <div className="flex flex-row justify-between">
            <h1 className="text-2xl font-black">Project Name</h1>
            <h3 className="text-md pt-2 pl-4">
              <span className="text-slate-400">0x40Ac73fEB67e9d50087cce1FB739B92c99B2fF0E</span>
            </h3>
            <h1 className="text-2xl font-black">
              Round <span className="bg-color-zinc-400"></span>4/8
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
              <div className="stat-title">Dispensed Rewards</div>
              <div className="stat-value text-2xl">800 USDC</div>
            </div>
            <div className="stat place-items-center">
              <div className="stat-title">Remaining Funds</div>
              <div className="stat-value text-2xl">800 USDC</div>
              <div className="stat-desc">(50%)</div>
            </div>
          </div>

          {/* Open the modal using document.getElementById('ID').showModal() method */}
          <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Please Confirm</h3>
              <p className="py-4">Are you sure you want to vote for -player name and address-</p>
              <div className="modal-action">
                <form method="dialog">
                  {/* if there is a button in form, it will close the modal */}
                  <button className="btn btn-primary">Confirm</button>
                  <button className="btn">Cancel</button>
                </form>
              </div>
            </div>
          </dialog>

          {/* Player List */}
          <div className="overflow-x-auto pt-6">
            <h1 className="font-black text-xl">Players</h1>
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th>id</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Active</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>1</th>
                  <td>Judge Judy</td>
                  <td>0x8aa01576787c820483620e4e1829cb51cdc145fda52ba40b9a1244cd138c7ded</td>
                  <td>
                    <input type="checkbox" checked="checked" className="checkbox" />
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => document.getElementById("my_modal_5").showModal()}
                    >
                      Vote
                    </button>
                  </td>
                </tr>
                <tr>
                  <th>2</th>
                  <td>Judge Judy</td>
                  <td>0x8aa01576787c820483620e4e1829cb51cdc145fda52ba40b9a1244cd138c7ded</td>
                  <td>
                    <input type="checkbox" checked="checked" className="checkbox" />
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => document.getElementById("my_modal_5").showModal()}
                    >
                      Vote
                    </button>
                  </td>
                </tr>
                <tr>
                  <th>3</th>
                  <td>Judge Judy</td>
                  <td>0x8aa01576787c820483620e4e1829cb51cdc145fda52ba40b9a1244cd138c7ded</td>
                  <td>
                    <input type="checkbox" checked="checked" className="checkbox" />
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => document.getElementById("my_modal_5").showModal()}
                    >
                      Vote
                    </button>
                  </td>
                </tr>
                <tr>
                  <th>4</th>
                  <td>Judge Judy</td>
                  <td>0x8aa01576787c820483620e4e1829cb51cdc145fda52ba40b9a1244cd138c7ded</td>
                  <td>
                    <input type="checkbox" checked="checked" className="checkbox" />
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => document.getElementById("my_modal_5").showModal()}
                    >
                      Vote
                    </button>
                  </td>
                </tr>
                <tr>
                  <th>5</th>
                  <td>Judge Judy</td>
                  <td>0x8aa01576787c820483620e4e1829cb51cdc145fda52ba40b9a1244cd138c7ded</td>
                  <td>
                    <input type="checkbox" checked="" className="checkbox" />
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      disabled="true"
                      onClick={() => document.getElementById("my_modal_5").showModal()}
                    >
                      Vote
                    </button>
                  </td>
                </tr>
                <tr>
                  <th>6</th>
                  <td>Judge Judy</td>
                  <td>0x8aa01576787c820483620e4e1829cb51cdc145fda52ba40b9a1244cd138c7ded</td>
                  <td>
                    <input type="checkbox" checked="" className="checkbox" />
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      disabled="true"
                      onClick={() => document.getElementById("my_modal_5").showModal()}
                    >
                      Vote
                    </button>
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

export default Home;
