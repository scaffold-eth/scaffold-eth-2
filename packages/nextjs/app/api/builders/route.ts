import { NextResponse } from "next/server";
import { recoverTypedDataAddress } from "viem";
import { getBuilderById, updateBuilder } from "~~/services/database/repositories/builders";
import { BuilderInsert } from "~~/services/database/repositories/builders";
import { EIP_712_DOMAIN, EIP_712_TYPES__SUBMISSION } from "~~/utils/eip712";

export type UpdateBuilderBody = BuilderInsert & { signature: `0x${string}` };

export async function POST(req: Request) {
  try {
    const { id, github, telegram, email, signature } = (await req.json()) as UpdateBuilderBody;

    if (!id || !github || !telegram || !email || !signature) {
      return NextResponse.json({ error: "Invalid form details submitted" }, { status: 400 });
    }

    const recoveredAddress = await recoverTypedDataAddress({
      domain: EIP_712_DOMAIN,
      types: EIP_712_TYPES__SUBMISSION,
      primaryType: "Message",
      message: {
        github: github || "",
        telegram: telegram || "",
        email: email || "",
      },
      signature: signature,
    });

    if (recoveredAddress !== id) {
      return NextResponse.json({ error: "Recovered address did not match builder" }, { status: 401 });
    }

    const builder = await getBuilderById(id);

    if (!builder) {
      return NextResponse.json({ error: "Builder not found" }, { status: 404 });
    }

    const updatedBuilder = await updateBuilder({
      id: builder.id,
      role: builder.role,
      github,
      telegram,
      email,
    });

    return NextResponse.json({ updatedBuilder }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error processing form" }, { status: 500 });
  }
}
