"use client";

import { useState } from "react";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useCreateOrUpdateUser, useDeleteUser, useUserByAddress, useUsers } from "~~/services/database";
import { notification } from "~~/utils/scaffold-eth";

const DatabasePage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  const { data: allUsers, isLoading: usersLoading } = useUsers();
  const { data: currentUser, isLoading: currentUserLoading } = useUserByAddress(connectedAddress);
  const createOrUpdate = useCreateOrUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const handleSaveProfile = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet first");
      return;
    }

    try {
      await createOrUpdate.mutateAsync({
        address: connectedAddress,
        name: name || undefined,
        email: email || undefined,
        bio: bio || undefined,
      });
      notification.success("Profile saved successfully!");
      setName("");
      setEmail("");
      setBio("");
    } catch (error) {
      notification.error(`Failed to save profile: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleDeleteProfile = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet first");
      return;
    }

    try {
      await deleteUserMutation.mutateAsync(connectedAddress);
      notification.success("Profile deleted successfully!");
    } catch (error) {
      notification.error(`Failed to delete profile: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="flex flex-col items-center grow pt-10 px-4">
      <h1 className="text-center">
        <span className="block text-4xl font-bold">User Database</span>
        <span className="block text-lg mt-2">Manage off-chain user profiles with Drizzle ORM + Neon PostgreSQL</span>
      </h1>

      {/* Save Profile Section */}
      <div className="card bg-base-100 shadow-xl w-full max-w-lg mt-8">
        <div className="card-body">
          <h2 className="card-title">Your Profile</h2>

          {!connectedAddress ? (
            <p className="text-base-content/70">Connect your wallet to manage your profile.</p>
          ) : (
            <>
              {currentUserLoading ? (
                <div className="flex justify-center py-4">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              ) : currentUser ? (
                <div className="bg-base-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-base-content/70 mb-1">Current profile:</p>
                  <p>
                    <span className="font-semibold">Name:</span> {currentUser.name || "Not set"}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span> {currentUser.email || "Not set"}
                  </p>
                  <p>
                    <span className="font-semibold">Bio:</span> {currentUser.bio || "Not set"}
                  </p>
                </div>
              ) : (
                <p className="text-base-content/70 mb-2">No profile found. Create one below.</p>
              )}

              <div className="form-control gap-3">
                <input
                  type="text"
                  placeholder="Name"
                  className="input input-bordered w-full"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <textarea
                  placeholder="Bio"
                  className="textarea textarea-bordered w-full"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="card-actions justify-end mt-4 gap-2">
                {currentUser && (
                  <button
                    className="btn btn-error btn-sm"
                    onClick={handleDeleteProfile}
                    disabled={deleteUserMutation.isPending}
                  >
                    {deleteUserMutation.isPending ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      "Delete Profile"
                    )}
                  </button>
                )}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveProfile}
                  disabled={createOrUpdate.isPending}
                >
                  {createOrUpdate.isPending ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : currentUser ? (
                    "Update Profile"
                  ) : (
                    "Create Profile"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* All Users Section */}
      <div className="card bg-base-100 shadow-xl w-full max-w-2xl mt-8 mb-12">
        <div className="card-body">
          <h2 className="card-title">All Users</h2>

          {usersLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : !allUsers || allUsers.length === 0 ? (
            <p className="text-base-content/70 py-4">No users registered yet. Be the first!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <Address address={user.address as `0x${string}`} chain={targetNetwork} />
                      </td>
                      <td>{user.name || "-"}</td>
                      <td>{user.email || "-"}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabasePage;
