import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { users } from "~~/server/db/schema";

// GET /api/users — list all users
export async function GET() {
  try {
    const allUsers = await db.select().from(users).orderBy(users.createdAt);
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST /api/users — create or update a user profile
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { address, name, email, bio } = body;

    if (!address || typeof address !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: "Valid Ethereum address is required" }, { status: 400 });
    }

    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.address, address.toLowerCase()));

    if (existing.length > 0) {
      // Update existing user
      const updated = await db
        .update(users)
        .set({
          name: name ?? existing[0].name,
          email: email ?? existing[0].email,
          bio: bio ?? existing[0].bio,
          updatedAt: new Date(),
        })
        .where(eq(users.address, address.toLowerCase()))
        .returning();

      return NextResponse.json(updated[0]);
    }

    // Create new user
    const newUser = await db
      .insert(users)
      .values({
        address: address.toLowerCase(),
        name: name || null,
        email: email || null,
        bio: bio || null,
      })
      .returning();

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create/update user:", error);
    return NextResponse.json({ error: "Failed to create/update user" }, { status: 500 });
  }
}
