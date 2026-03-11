import { revalidatePath } from "next/cache";
import { createUser, getAllUsers } from "~~/services/database/repositories/users";

export default async function UsersPage() {
  const users = await getAllUsers();

  return (
    <div className="flex flex-col items-center p-8 gap-6">
      <h1 className="text-3xl font-bold">Users</h1>

      <div className="w-full max-w-md">
        {users.length === 0 ? (
          <p className="text-center text-base-content/60">No users yet. Add one below!</p>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map(user => (
              <div key={user.id} className="card bg-base-200 shadow-sm">
                <div className="card-body p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{user.name}</span>
                    {user.address && (
                      <span className="text-sm font-mono text-base-content/60">
                        {user.address.slice(0, 6)}...{user.address.slice(-4)}
                      </span>
                    )}
                  </div>
                  {user.createdAt && (
                    <span className="text-xs text-base-content/40">
                      Added {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h2 className="card-title text-lg">Add a User</h2>
          <form
            action={async (formData: FormData) => {
              "use server";
              const name = formData.get("name") as string;
              const address = (formData.get("address") as string) || undefined;
              if (!name) return;
              await createUser({ name, address });
              revalidatePath("/users");
            }}
            className="flex flex-col gap-3"
          >
            <input type="text" name="name" placeholder="Name" className="input input-bordered w-full" required />
            <input
              type="text"
              name="address"
              placeholder="Ethereum address (optional)"
              className="input input-bordered w-full"
            />
            <button type="submit" className="btn btn-primary">
              Add User
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
