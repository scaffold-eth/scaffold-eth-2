import { withDefaults } from "../../../../../utils.js";

const contents = ({ addressType }) => {
 return `import "abitype";
import "~~/node_modules/viem/node_modules/abitype";

type AddressType = ${addressType[0]};

declare module "abitype" {
  export interface Register {
    AddressType: AddressType;
  }
}

declare module "~~/node_modules/viem/node_modules/abitype" {
  export interface Register {
    AddressType: AddressType;
  }
}`;
};

export default withDefaults(contents, {
  addressType: "string"
});
