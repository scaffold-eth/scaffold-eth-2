"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BellIcon, HomeIcon, UsersIcon, DocumentTextIcon, TrophyIcon, PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

interface DAOAccount {
  name: string;
  description: string;
  needs: string[];
}

const defaultAccount: DAOAccount = {
  name: "",
  description: "", 
  needs: []
};

const mockDAOs = [
  { id: 1, name: "ClimateDAO", description: "Funding climate projects", members: 342, proposals: 8, match: 92 },
  { id: 2, name: "EduDAO", description: "Improving educational access", members: 189, proposals: 5, match: 85 },
  { id: 3, name: "DevDAO", description: "Supporting open source developers", members: 567, proposals: 12, match: 78 },
];

const mockProposals = [
  { id: 1, title: "Joint Climate Hackathon", dao: "ClimateDAO", status: "Active", votes: 78, created: "2d ago" },
  { id: 2, title: "Educational Resource Sharing", dao: "EduDAO", status: "Draft", votes: 0, created: "5h ago" }
];

const Account: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to your</span>
            <span className="block text-4xl font-bold">Account Dashboard 🌸</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row mt-4">
            <p className="my-2 font-medium">Connected as:</p>
            <Address address={connectedAddress} />
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8 gap-4">
            {[
              {id: 'dashboard', icon: HomeIcon, label: 'Dashboard'},
              {id: 'myDAOs', icon: UsersIcon, label: 'My DAOs'},
              {id: 'proposals', icon: DocumentTextIcon, label: 'Proposals'},
              {id: 'matches', icon: TrophyIcon, label: 'Matches'}
            ].map(tab => (
              <button 
                key={tab.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  activeTab === tab.id ? 'bg-secondary text-primary-content' : 'bg-base-100'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Matches */}
            <div className="bg-base-100 rounded-3xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Top Matches</h3>
                <button className="btn btn-sm btn-secondary">View All</button>
              </div>
              <div className="space-y-4">
                {mockDAOs.map(dao => (
                  <div key={dao.id} className="flex items-center justify-between p-4 bg-base-200 rounded-xl">
                    <div>
                      <h4 className="font-bold">{dao.name}</h4>
                      <p className="text-sm opacity-70">{dao.description}</p>
                    </div>
                    <div className="badge badge-secondary">{dao.match}% Match</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Proposals */}
            <div className="bg-base-100 rounded-3xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Recent Proposals</h3>
                <button className="btn btn-sm btn-secondary">View All</button>
              </div>
              <div className="space-y-4">
                {mockProposals.map(proposal => (
                  <div key={proposal.id} className="p-4 bg-base-200 rounded-xl">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-bold">{proposal.title}</h4>
                      <span className={`badge ${proposal.status === 'Active' ? 'badge-primary' : 'badge-ghost'}`}>
                        {proposal.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm opacity-70">
                      <span>{proposal.dao}</span>
                      <span>{proposal.created}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Account;
