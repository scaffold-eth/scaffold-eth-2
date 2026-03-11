import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { users } from "~~/server/db/schema";

// GET /api/users/[address] — fetch a single user by Ethereum address
export async function GET(_request: Request, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: "Valid Ethereum address is required" }, { status: 400 });
    }

    const user = await db.select().from(users).where(eq(users.address, address.toLowerCase()));

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user[0]);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// PUT /api/users/[address] — update a user by Ethereum address
export async function PUT(request: Request, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: "Valid Ethereum address is required" }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, bio } = body;

    const existing = await db.select().from(users).where(eq(users.address, address.toLowerCase()));

    if (existing.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await db
      .update(users)
      .set({
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(bio !== undefined && { bio }),
        updatedAt: new Date(),
      })
      .where(eq(users.address, address.toLowerCase()))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/users/[address] — delete a user by Ethereum address
export async function DELETE(_request: Request, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: "Valid Ethereum address is required" }, { status: 400 });
    }

    const deleted = await db.delete(users).where(eq(users.address, address.toLowerCase())).returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
