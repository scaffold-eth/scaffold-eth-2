import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "~~/db";
import { users } from "~~/db/schema";

/**
 * GET /api/users - List all users, or fetch a single user by address query param.
 *
 * Query params:
 *   ?address=0x... - optional, returns a single user matching this address
 */
export async function GET(request: NextRequest) {
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
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

/**
 * POST /api/users - Create a new user.
 *
 * Body: { address: string, name?: string, email?: string, bio?: string }
 */
export async function POST(request: NextRequest) {
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
        name: body.name || null,
        email: body.email || null,
        bio: body.bio || null,
        profilePicture: body.profilePicture || null,
      })
      .returning();

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error: unknown) {
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json({ error: "User with this address already exists" }, { status: 409 });
    }
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
