import "abitype";

declare module "viem/node_modules/abitype" {
  export interface Config {
    AddressType: string;
  }
}

declare module "abitype" {
  export interface Config {
    AddressType: string;
  }
}
