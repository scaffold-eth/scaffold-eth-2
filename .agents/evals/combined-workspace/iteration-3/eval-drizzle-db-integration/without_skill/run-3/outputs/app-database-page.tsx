"use client";

import { useState } from "react";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useCreateUser, useDeleteUser, useUpdateUser, useUserByAddress, useUsers } from "~~/services/database/queries";
import { notification } from "~~/utils/scaffold-eth";

const DatabasePage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const { data: allUsers, isLoading: isLoadingUsers } = useUsers();
  const { data: currentUser } = useUserByAddress(connectedAddress);

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBio, setEditBio] = useState("");

  const handleCreateProfile = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet first");
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        address: connectedAddress,
        username: username || undefined,
        email: email || undefined,
        bio: bio || undefined,
      });
      notification.success("Profile created successfully!");
      setUsername("");
      setEmail("");
      setBio("");
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Failed to create profile");
    }
  };

  const handleUpdateProfile = async (userId: number) => {
    try {
      await updateUserMutation.mutateAsync({
        id: userId,
        data: {
          username: editUsername || undefined,
          email: editEmail || undefined,
          bio: editBio || undefined,
        },
      });
      notification.success("Profile updated successfully!");
      setEditingUserId(null);
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Failed to update profile");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      notification.success("User deleted successfully!");
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Failed to delete user");
    }
  };

  const startEditing = (user: { id: number; username: string | null; email: string | null; bio: string | null }) => {
    setEditingUserId(user.id);
    setEditUsername(user.username || "");
    setEditEmail(user.email || "");
    setEditBio(user.bio || "");
  };

  return (
    <div className="flex flex-col items-center grow pt-10 px-4">
      <h1 className="text-center">
        <span className="block text-4xl font-bold">Database Manager</span>
        <span className="block text-lg mt-2">Off-chain user data with Drizzle ORM + Neon PostgreSQL</span>
      </h1>

      {/* Create Profile Section */}
      <div className="card bg-base-100 shadow-xl w-full max-w-2xl mt-8">
        <div className="card-body">
          <h2 className="card-title">Create Your Profile</h2>
          {currentUser ? (
            <div className="alert alert-info">
              <span>You already have a profile. Edit it from the table below.</span>
            </div>
          ) : (
            <>
              <p className="text-sm opacity-70">
                Connected as:{" "}
                {connectedAddress ? (
                  <Address address={connectedAddress} chain={targetNetwork} />
                ) : (
                  "Not connected - please connect your wallet"
                )}
              </p>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Username</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter username"
                  className="input input-bordered"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter email"
                  className="input input-bordered"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Bio</span>
                </label>
                <textarea
                  placeholder="Tell us about yourself"
                  className="textarea textarea-bordered"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                />
              </div>
              <div className="card-actions justify-end mt-4">
                <button
                  className="btn btn-primary"
                  onClick={handleCreateProfile}
                  disabled={!connectedAddress || createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Create Profile"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="card bg-base-100 shadow-xl w-full max-w-4xl mt-8 mb-8">
        <div className="card-body">
          <h2 className="card-title">All Users</h2>
          {isLoadingUsers ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : allUsers && allUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Address</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Bio</th>
                    <th>Points</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        <Address address={user.address} chain={targetNetwork} />
                      </td>
                      {editingUserId === user.id ? (
                        <>
                          <td>
                            <input
                              type="text"
                              className="input input-bordered input-sm w-28"
                              value={editUsername}
                              onChange={e => setEditUsername(e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="email"
                              className="input input-bordered input-sm w-32"
                              value={editEmail}
                              onChange={e => setEditEmail(e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="input input-bordered input-sm w-32"
                              value={editBio}
                              onChange={e => setEditBio(e.target.value)}
                            />
                          </td>
                          <td>{user.points}</td>
                          <td className="flex gap-1">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleUpdateProfile(user.id)}
                              disabled={updateUserMutation.isPending}
                            >
                              Save
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditingUserId(null)}>
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{user.username || "-"}</td>
                          <td>{user.email || "-"}</td>
                          <td className="max-w-[200px] truncate">{user.bio || "-"}</td>
                          <td>{user.points}</td>
                          <td className="flex gap-1">
                            <button className="btn btn-primary btn-sm" onClick={() => startEditing(user)}>
                              Edit
                            </button>
                            <button
                              className="btn btn-error btn-sm"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={deleteUserMutation.isPending}
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 opacity-70">No users found. Create your profile to get started!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabasePage;
