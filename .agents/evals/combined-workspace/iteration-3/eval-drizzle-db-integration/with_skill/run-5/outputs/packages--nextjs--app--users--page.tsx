import { revalidatePath } from "next/cache";
import { createUser, getAllUsers } from "~~/services/database/repositories/users";

export default async function UsersPage() {
  const users = await getAllUsers();

  return (
    <div className="flex flex-col items-center p-8 gap-6">
      <h1 className="text-3xl font-bold">Users</h1>

      <div className="w-full max-w-md space-y-3">
        {users.length === 0 && <p className="text-center text-base-content/60">No users yet. Add one below!</p>}
        {users.map(user => (
          <div key={user.id} className="card bg-base-200 shadow p-4">
            <p className="font-semibold">{user.name}</p>
            {user.address && <p className="text-sm text-base-content/60 font-mono">{user.address}</p>}
          </div>
        ))}
      </div>

      <form
        className="flex flex-col gap-3 w-full max-w-md"
        action={async (formData: FormData) => {
          "use server";
          const name = formData.get("name") as string;
          const address = formData.get("address") as string;
          if (!name) return;
          await createUser({ name, address: address || undefined });
          revalidatePath("/users");
        }}
      >
        <input type="text" name="name" placeholder="Name" className="input input-bordered w-full" required />
        <input type="text" name="address" placeholder="Ethereum Address (optional)" className="input input-bordered w-full" />
        <button type="submit" className="btn btn-primary">
          Add User
        </button>
      </form>
    </div>
  );
}
