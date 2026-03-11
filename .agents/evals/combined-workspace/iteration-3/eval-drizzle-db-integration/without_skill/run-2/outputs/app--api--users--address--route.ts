import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "~~/db";
import { users } from "~~/db/schema";

type RouteParams = { params: Promise<{ address: string }> };

/**
 * GET /api/users/[address] - Get a single user by Ethereum address.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { address } = await params;
    const user = await db.select().from(users).where(eq(users.address, address.toLowerCase()));

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

/**
 * PUT /api/users/[address] - Update a user by Ethereum address.
 *
 * Body: { name?: string, email?: string, bio?: string, profilePicture?: string }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { address } = await params;
    const body = await request.json();

    const updatedUser = await db
      .update(users)
      .set({
        ...(body.name !== undefined && { name: body.name }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(body.profilePicture !== undefined && { profilePicture: body.profilePicture }),
        updatedAt: new Date(),
      })
      .where(eq(users.address, address.toLowerCase()))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

/**
 * DELETE /api/users/[address] - Delete a user by Ethereum address.
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { address } = await params;
    const deletedUser = await db.delete(users).where(eq(users.address, address.toLowerCase())).returning();

    if (deletedUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
