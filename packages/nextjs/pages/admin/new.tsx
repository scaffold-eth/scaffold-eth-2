//import Link from "next/link";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";

const Home: NextPage = () => {

  const [projectName, setProjectName] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [prizePool, setPrizePool] = useState("");
  const [roundStarts, setRoundStarts] = useState("");
  const [roundDuration, setRoundDuration] = useState("");

  const handleCreateGrant = async () => {
    console.log("Create Grant");
    console.log("Project Name:", projectName);
    console.log("Max Participants:", maxParticipants);
    console.log("Prize Pool:", prizePool);
    console.log("Round Starts:", roundStarts);
    console.log("Round Duration:", roundDuration);
  };

  return (
    <>
      <MetaHeader />
      <div className="flex flex-col flex-grow pt-10 mx-auto">
        <h1 className="font-black text-2xl">New Grant </h1>
        <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">Project Name</span>
        </div>
        <input
          type="text"
          placeholder="Type here"
          className="input input-bordered w-full max-w-xs"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Maximum Participants (Rounds)</span>
          </div>
          <input 
            type="text" 
            placeholder="Type here" 
            className="input input-bordered w-full max-w-xs"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)} 
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Prize Pool (USDC)</span>
          </div>
          <input 
            type="text" 
            placeholder="Type here" 
            className="input input-bordered w-full max-w-xs"
            value={prizePool}
            onChange={(e) => setPrizePool(e.target.value)} 
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">First Round Starts (MM/DD/YYYY hh:mm:ss)</span>
          </div>
          <input 
            type="text" 
            placeholder="Type here" 
            className="input input-bordered w-full max-w-xs" 
            value={roundStarts}
            onChange={(e) => setRoundStarts(e.target.value)} 
          />
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Round Duration (Days)</span>
          </div>
          <input 
            type="text" 
            placeholder="Type here" 
            className="input input-bordered w-full max-w-xs"
            value={roundDuration}
            onChange={(e) => setRoundDuration(e.target.value)} 
             />
        </label>
        <div className="flex flex-row">
          <button 
            className="btn btn-primary m-6 w-24" 
            onClick={handleCreateGrant}>Create
          </button>
          <button className="btn btn-secondary my-6 w-24">Pay</button>
        </div>
        <p>You will be able to add participants and judges in your dashboard after creating and funding a grant.</p>
      </div>
    </>
  );
};

export default Home;
