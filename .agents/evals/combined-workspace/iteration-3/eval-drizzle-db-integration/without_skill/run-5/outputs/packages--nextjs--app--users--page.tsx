"use client";

import { useState } from "react";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from "~~/services/database";
import { notification } from "~~/utils/scaffold-eth";

const UsersPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setBio("");
    setEditingId(null);
  };

  const handleRegister = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet first");
      return;
    }

    try {
      await createUser.mutateAsync({
        address: connectedAddress,
        username: username || null,
        email: email || null,
        bio: bio || null,
      });
      notification.success("Profile registered successfully!");
      resetForm();
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Failed to register");
    }
  };

  const handleUpdate = async () => {
    if (editingId === null) return;

    try {
      await updateUser.mutateAsync({
        id: editingId,
        data: { username, email, bio },
      });
      notification.success("Profile updated successfully!");
      resetForm();
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Failed to update");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser.mutateAsync(id);
      notification.success("User deleted successfully!");
      if (editingId === id) resetForm();
    } catch (error) {
      notification.error(error instanceof Error ? error.message : "Failed to delete");
    }
  };

  const startEditing = (user: { id: number; username: string | null; email: string | null; bio: string | null }) => {
    setEditingId(user.id);
    setUsername(user.username || "");
    setEmail(user.email || "");
    setBio(user.bio || "");
  };

  return (
    <div className="flex flex-col items-center grow pt-10 px-4">
      <h1 className="text-center text-4xl font-bold mb-2">User Profiles</h1>
      <p className="text-center text-lg mb-8 text-base-content/70">Off-chain user data stored with Drizzle + Neon</p>

      {/* Registration / Edit Form */}
      <div className="card bg-base-100 shadow-xl w-full max-w-lg mb-10">
        <div className="card-body">
          <h2 className="card-title">{editingId ? "Edit Profile" : "Register Profile"}</h2>

          {!editingId && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Wallet Address</span>
              </label>
              <div className="flex items-center gap-2 p-3 bg-base-200 rounded-lg">
                {connectedAddress ? <Address address={connectedAddress} /> : <span>Connect wallet to register</span>}
              </div>
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text">Username</span>
            </label>
            <input
              type="text"
              placeholder="Enter username"
              className="input input-bordered w-full"
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
              className="input input-bordered w-full"
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
              className="textarea textarea-bordered w-full"
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
          </div>

          <div className="card-actions justify-end mt-4 gap-2">
            {editingId && (
              <button className="btn btn-ghost" onClick={resetForm}>
                Cancel
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={editingId ? handleUpdate : handleRegister}
              disabled={!editingId && !connectedAddress}
            >
              {editingId ? "Update" : "Register"}
              {(createUser.isPending || updateUser.isPending) && <span className="loading loading-spinner loading-sm" />}
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="w-full max-w-3xl mb-10">
        <h2 className="text-2xl font-bold mb-4">Registered Users</h2>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : !users || users.length === 0 ? (
          <div className="text-center p-8 bg-base-200 rounded-2xl">
            <p className="text-base-content/70">No users registered yet. Be the first!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="hover">
                    <td>
                      <Address address={user.address} />
                    </td>
                    <td>{user.username || "-"}</td>
                    <td>{user.email || "-"}</td>
                    <td className="flex gap-2">
                      <button className="btn btn-sm btn-ghost" onClick={() => startEditing(user)}>
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-error btn-outline"
                        onClick={() => handleDelete(user.id)}
                        disabled={deleteUser.isPending}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
