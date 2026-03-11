import { NextRequest, NextResponse } from "next/server";
import { createUser, getAllUsers } from "~~/services/database/repositories/users";

export async function GET() {
  const users = await getAllUsers();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const { name } = await request.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const user = await createUser({ name });
  return NextResponse.json(user);
}
