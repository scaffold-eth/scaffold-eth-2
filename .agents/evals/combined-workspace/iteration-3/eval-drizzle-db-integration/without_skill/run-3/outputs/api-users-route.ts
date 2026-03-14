import { NextResponse } from "next/server";
import { db } from "~~/server/db";
import { users } from "~~/server/db/schema";
import { eq } from "drizzle-orm";

// GET /api/users - List all users or get user by address query param
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (address) {
      const user = await db.select().from(users).where(eq(users.address, address.toLowerCase()));
      if (user.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      return NextResponse.json(user[0]);
    }

    const allUsers = await db.select().from(users);
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

    if (!body.address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(body.address)) {
      return NextResponse.json({ error: "Invalid Ethereum address format" }, { status: 400 });
    }

    const newUser = await db
      .insert(users)
      .values({
        address: body.address.toLowerCase(),
        username: body.username || null,
        email: body.email || null,
        bio: body.bio || null,
        points: body.points || 0,
      })
      .returning();

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error: unknown) {
    console.error("Failed to create user:", error);

    // Handle unique constraint violation (duplicate address)
    if (error instanceof Error && error.message?.includes("unique")) {
      return NextResponse.json({ error: "A user with this address already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
