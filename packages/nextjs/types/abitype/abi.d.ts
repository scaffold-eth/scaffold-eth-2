import "abitype";

type AddressType = string;

declare module "viem/node_modules/abitype" {
  export interface Register {
    AddressType: AddressType;
  }
}

declare module "abitype" {
  export interface Register {
    AddressType: AddressType;
  }
}
