"use client";

import { useState } from "react";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useCreateUser, useDeleteUser, useUpdateUser, useUser, useUsers } from "~~/services/database";
import { notification } from "~~/utils/scaffold-eth";

const DatabasePage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const { data: allUsers, isLoading: isLoadingUsers } = useUsers();
  const { data: currentUser } = useUser(connectedAddress);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBio, setEditBio] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleRegister = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet first");
      return;
    }

    try {
      await createUser.mutateAsync({
        address: connectedAddress,
        name: editName || undefined,
        email: editEmail || undefined,
        bio: editBio || undefined,
      });
      notification.success("Profile created successfully!");
      setEditName("");
      setEditEmail("");
      setEditBio("");
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Failed to create profile");
    }
  };

  const handleUpdate = async () => {
    if (!connectedAddress) return;

    try {
      await updateUser.mutateAsync({
        address: connectedAddress,
        data: {
          name: editName || undefined,
          email: editEmail || undefined,
          bio: editBio || undefined,
        },
      });
      notification.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Failed to update profile");
    }
  };

  const handleDelete = async (address: string) => {
    try {
      await deleteUser.mutateAsync(address);
      notification.success("User deleted successfully!");
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Failed to delete user");
    }
  };

  const startEditing = () => {
    if (currentUser) {
      setEditName(currentUser.name || "");
      setEditEmail(currentUser.email || "");
      setEditBio(currentUser.bio || "");
    }
    setIsEditing(true);
  };

  return (
    <div className="flex flex-col items-center grow pt-10 px-5">
      <h1 className="text-center">
        <span className="block text-4xl font-bold">Database</span>
        <span className="block text-lg mt-2">Manage user profiles stored in Neon PostgreSQL</span>
      </h1>

      {/* Profile Section */}
      <div className="card bg-base-100 shadow-xl w-full max-w-2xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Your Profile</h2>

          {!connectedAddress ? (
            <p className="text-center py-4">Connect your wallet to manage your profile.</p>
          ) : currentUser && !isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Address:</span>
                <Address address={connectedAddress} chain={targetNetwork} />
              </div>
              {currentUser.name && (
                <p>
                  <span className="font-semibold">Name:</span> {currentUser.name}
                </p>
              )}
              {currentUser.email && (
                <p>
                  <span className="font-semibold">Email:</span> {currentUser.email}
                </p>
              )}
              {currentUser.bio && (
                <p>
                  <span className="font-semibold">Bio:</span> {currentUser.bio}
                </p>
              )}
              <p>
                <span className="font-semibold">Points:</span> {currentUser.points}
              </p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary btn-sm" onClick={startEditing}>
                  Edit Profile
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="input input-bordered w-full"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="input input-bordered w-full"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Bio</span>
                </label>
                <textarea
                  placeholder="Tell us about yourself..."
                  className="textarea textarea-bordered w-full"
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                />
              </div>
              <div className="card-actions justify-end mt-4">
                {isEditing && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                )}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={isEditing ? handleUpdate : handleRegister}
                  disabled={createUser.isPending || updateUser.isPending}
                >
                  {createUser.isPending || updateUser.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <PlusIcon className="h-4 w-4" />
                  )}
                  {isEditing ? "Save Changes" : "Create Profile"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All Users Section */}
      <div className="card bg-base-100 shadow-xl w-full max-w-2xl mt-8 mb-10">
        <div className="card-body">
          <h2 className="card-title">All Users</h2>

          {isLoadingUsers ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : !allUsers || allUsers.length === 0 ? (
            <p className="text-center py-4">No users registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Name</th>
                    <th>Points</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <Address address={user.address} chain={targetNetwork} />
                      </td>
                      <td>{user.name || "-"}</td>
                      <td>{user.points}</td>
                      <td>
                        {connectedAddress?.toLowerCase() === user.address.toLowerCase() && (
                          <button
                            className="btn btn-error btn-xs"
                            onClick={() => handleDelete(user.address)}
                            disabled={deleteUser.isPending}
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        )}
                      </td>
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
