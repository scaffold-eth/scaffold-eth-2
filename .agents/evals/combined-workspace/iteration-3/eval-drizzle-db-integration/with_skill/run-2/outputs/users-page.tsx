import { revalidatePath } from "next/cache";
import { createUser, getAllUsers } from "~~/services/database/repositories/users";

export default async function UsersPage() {
  const users = await getAllUsers();

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-semibold mb-4">Users</h1>

      <div className="flex flex-col gap-2 mb-6 w-full max-w-md">
        {users.length === 0 && <p className="text-center text-base-content/60">No users yet. Add one below.</p>}
        {users.map(user => (
          <div key={user.id} className="p-3 bg-base-200 rounded">
            {user.name}
          </div>
        ))}
      </div>

      <form
        action={async (formData: FormData) => {
          "use server";
          const name = formData.get("name") as string;
          if (!name) return;
          await createUser({ name });
          revalidatePath("/users");
        }}
        className="flex gap-2"
      >
        <input type="text" name="name" placeholder="Enter name" className="input input-bordered" required />
        <button type="submit" className="btn btn-primary">
          Add User
        </button>
      </form>
    </div>
  );
}
