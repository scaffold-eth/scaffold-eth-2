import "abitype";
import "viem";
import "wagmi";

type AddressType = string;

declare module "abitype" {
  export interface Register {
    AddressType: AddressType;
  }
}

declare module "viem/node_modules/abitype" {
  export interface Register {
    AddressType: AddressType;
  }
}

declare module "wagmi/node_modules/abitype" {
  export interface Register {
    AddressType: AddressType;
  }
}
