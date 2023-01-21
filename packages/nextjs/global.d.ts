// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Config } from "abitype";

declare module "abitype" {
  export interface Config {
    AddressType: string;
  }
}
