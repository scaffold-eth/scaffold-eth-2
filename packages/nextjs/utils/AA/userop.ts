import { authentication, getPublicKeyFromBytes } from "./webauthn";
import { RegistrationEncoded } from "@passwordless-id/webauthn/dist/esm/types";
import { BytesLike } from "ethers";
import { Signer } from "smart-accounts";

export class WebauthnSigner implements Signer {
  private registration: RegistrationEncoded;
  private validatorAddr: string;

  constructor(registration: RegistrationEncoded, address: string) {
    this.registration = registration;
    this.validatorAddr = address;
  }

  signatureLength(): number {
    return 1280;
  }

  address(): string {
    return this.validatorAddr;
  }

  async data(): Promise<BytesLike> {
    return await getPublicKeyFromBytes(this.registration);
  }

  async sign(opHash: string): Promise<string> {
    return await authentication(this.registration.credential.id, opHash);
  }
}
