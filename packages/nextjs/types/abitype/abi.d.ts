import "abitype";

declare module ".pnpm/viem@1.9.5_typescript@5.2.2/node_modules/abitype" {
  export interface Config {
    AddressType: string;
  }
}

declare module "abitype" {
  export interface Config {
    AddressType: string;
  }
}
