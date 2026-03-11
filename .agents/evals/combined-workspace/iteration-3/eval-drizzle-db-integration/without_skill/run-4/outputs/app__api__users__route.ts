import { NextResponse } from "next/server";
import { db } from "~~/server/db";
import { users } from "~~/server/db/schema";

// GET /api/users - List all users
export async function GET() {
  try {
    const allUsers = await db.select().from(users).orderBy(users.createdAt);
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST /api/users - Create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, username, bio } = body;

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: "Invalid Ethereum address format" }, { status: 400 });
    }

    const [newUser] = await db
      .insert(users)
      .values({
        address: address.toLowerCase(),
        username: username || null,
        bio: bio || null,
      })
      .returning();

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: unknown) {
    console.error("Failed to create user:", error);

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json({ error: "A user with this address already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
