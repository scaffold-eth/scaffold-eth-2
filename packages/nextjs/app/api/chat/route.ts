import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    // model: "dall-e-2",
    messages,
  });

  return NextResponse.json({
    content: response.choices[0].message.content,
  });
}
