import { client, parsers, utils } from "@passwordless-id/webauthn";
import { RegistrationEncoded } from "@passwordless-id/webauthn/dist/esm/types";
import { ECDSASigValue } from "@peculiar/asn1-ecc";
import { AsnParser } from "@peculiar/asn1-schema";
import { Buffer } from "buffer";
import { BigNumber } from "ethers";
import { BytesLike, Hexable, arrayify, defaultAbiCoder } from "ethers/lib/utils";
import { v4 as uuidv4 } from "uuid";

function shouldRemoveLeadingZero(bytes: Uint8Array): boolean {
  return bytes[0] === 0x0 && (bytes[1] & (1 << 7)) !== 0;
}

export const createPasskeyCredential = async (name: string) => {
  const challenge = uuidv4();
  const registration = await client.register(name, challenge, {
    authenticatorType: "both",
    userVerification: "required",
    timeout: 60000,
    attestation: false,
    debug: false,
  });
  return {
    challenge,
    registration,
  };
};

export const authentication = async (credentialId: string, message: BytesLike | Hexable | number): Promise<string> => {
  const challenge = utils.toBase64url(arrayify(message)).replace(/=/g, "");
  const authenticationEncoded = await client.authenticate([credentialId], challenge, {
    userVerification: "required",
    authenticatorType: "both",
  });
  const clientDataJSON = new TextDecoder().decode(utils.parseBase64url(authenticationEncoded.clientData));
  const challengePos = clientDataJSON.indexOf(challenge);
  const challengePrefix = clientDataJSON.substring(0, challengePos);
  const challengeSuffix = clientDataJSON.substring(challengePos + challenge.length);
  const authenticatorData = new Uint8Array(utils.parseBase64url(authenticationEncoded.authenticatorData));
  const signature = getMessageSignature(authenticationEncoded.signature);

  return defaultAbiCoder.encode(
    ["bytes", "bytes", "string", "string"],
    [signature, authenticatorData, challengePrefix, challengeSuffix],
  );
};

export const getPublicKeyFromBytes = async (registration: RegistrationEncoded): Promise<string> => {
  const parsedData = parsers.parseRegistration(registration);
  const cap = {
    name: "ECDSA",
    namedCurve: "P-256",
    hash: "SHA-256",
  };
  const pkeybytes = utils.parseBase64url(parsedData.credential.publicKey);
  const pkey = await crypto.subtle.importKey("spki", pkeybytes, cap, true, ["verify"]);
  const jwk = await crypto.subtle.exportKey("jwk", pkey);
  if (jwk.x && jwk.y) {
    return defaultAbiCoder.encode(
      ["uint256", "uint256"],
      [
        BigNumber.from(Buffer.from(utils.parseBase64url(jwk.x))),
        BigNumber.from(Buffer.from(utils.parseBase64url(jwk.y))),
      ],
    );
  }
  throw new Error("Invalid public key");
};

export const getMessageSignature = (authResponseSignature: string): string => {
  const parsedSignature = AsnParser.parse(utils.parseBase64url(authResponseSignature), ECDSASigValue);

  let rBytes = new Uint8Array(parsedSignature.r);
  let sBytes = new Uint8Array(parsedSignature.s);

  if (shouldRemoveLeadingZero(rBytes)) {
    rBytes = rBytes.slice(1);
  }

  if (shouldRemoveLeadingZero(sBytes)) {
    sBytes = sBytes.slice(1);
  }

  return defaultAbiCoder.encode(["uint256", "uint256"], [BigNumber.from(rBytes), BigNumber.from(sBytes)]);
};
