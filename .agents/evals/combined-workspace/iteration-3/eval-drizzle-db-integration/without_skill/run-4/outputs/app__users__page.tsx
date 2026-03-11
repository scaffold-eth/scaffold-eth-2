"use client";

import { useState } from "react";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { PencilIcon, TrashIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from "~~/hooks/useUsers";
import { notification } from "~~/utils/scaffold-eth";

const UsersPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { data: users, isLoading, error } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");

  const handleRegister = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet first");
      return;
    }

    try {
      await createUser.mutateAsync({
        address: connectedAddress,
        username: username || null,
        bio: bio || null,
      });
      setUsername("");
      setBio("");
      notification.success("User registered successfully!");
    } catch (e) {
      notification.error(e instanceof Error ? e.message : "Failed to register user");
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await updateUser.mutateAsync({
        id,
        data: {
          username: editUsername || null,
          bio: editBio || null,
        },
      });
      setEditingId(null);
      notification.success("User updated successfully!");
    } catch (e) {
      notification.error(e instanceof Error ? e.message : "Failed to update user");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser.mutateAsync(id);
      notification.success("User deleted successfully!");
    } catch (e) {
      notification.error(e instanceof Error ? e.message : "Failed to delete user");
    }
  };

  const startEditing = (user: { id: number; username: string | null; bio: string | null }) => {
    setEditingId(user.id);
    setEditUsername(user.username || "");
    setEditBio(user.bio || "");
  };

  return (
    <div className="flex flex-col items-center pt-10 px-5">
      <h1 className="text-4xl font-bold mb-8">User Profiles</h1>

      {/* Registration Form */}
      <div className="card bg-base-100 shadow-xl w-full max-w-lg mb-10">
        <div className="card-body">
          <h2 className="card-title">
            <UserPlusIcon className="h-6 w-6" />
            Register Your Profile
          </h2>

          {connectedAddress ? (
            <p className="text-sm opacity-70">
              Registering as: <span className="font-mono">{connectedAddress}</span>
            </p>
          ) : (
            <p className="text-sm text-warning">Connect your wallet to register</p>
          )}

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Username</span>
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              className="input input-bordered w-full"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          <div className="form-control w-full">
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

          <div className="card-actions justify-end mt-4">
            <button
              className="btn btn-primary"
              onClick={handleRegister}
              disabled={!connectedAddress || createUser.isPending}
            >
              {createUser.isPending ? <span className="loading loading-spinner loading-sm" /> : "Register"}
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-4">Registered Users</h2>

        {isLoading && (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg" />
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <span>Failed to load users. Make sure your database is configured.</span>
          </div>
        )}

        {users && users.length === 0 && (
          <div className="alert alert-info">
            <span>No users registered yet. Be the first!</span>
          </div>
        )}

        <div className="space-y-4">
          {users?.map(user => (
            <div key={user.id} className="card bg-base-100 shadow-md">
              <div className="card-body">
                {editingId === user.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Username</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered input-sm"
                        value={editUsername}
                        onChange={e => setEditUsername(e.target.value)}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Bio</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered textarea-sm"
                        value={editBio}
                        onChange={e => setEditBio(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleUpdate(user.id)}
                        disabled={updateUser.isPending}
                      >
                        {updateUser.isPending ? <span className="loading loading-spinner loading-xs" /> : "Save"}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Address address={user.address} />
                        {user.username && <span className="badge badge-primary">{user.username}</span>}
                      </div>
                      {user.bio && <p className="text-sm opacity-70 mt-2">{user.bio}</p>}
                      <p className="text-xs opacity-50 mt-1">
                        Registered: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={() => startEditing(user)}
                        title="Edit user"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-square text-error"
                        onClick={() => handleDelete(user.id)}
                        disabled={deleteUser.isPending}
                        title="Delete user"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
