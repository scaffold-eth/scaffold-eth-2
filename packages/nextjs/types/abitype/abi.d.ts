import "abitype";
import scaffoldConfig from "~~/scaffold.config";

type AddressType = typeof scaffoldConfig extends { useStrictAddressType: true } ? `0x${string}` : string;

declare module "viem/node_modules/abitype" {
  export interface Config {
    AddressType: AddressType;
  }
}

declare module "abitype" {
  export interface Config {
    AddressType: AddressType;
  }
}
