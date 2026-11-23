import { createEthExtensions } from "./create-eth-extensions";
import { challenges } from "./challenges";
import { organizations } from "./organizations";
import { Extension } from "./types";

const extensions: Extension[] = [...createEthExtensions, ...challenges, ...organizations];

export default extensions;
export { Extension, createEthExtensions, challenges, organizations };
