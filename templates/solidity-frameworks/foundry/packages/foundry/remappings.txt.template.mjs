import { withDefaults } from "../../../../utils.js";

const content = ({
    postContent,
}) => {
  return `@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts
  ${postContent.filter(Boolean).join("\n")}`;
}


export default withDefaults(content, {
  postContent: "",
});

