import { withDefaults } from "../../../../utils.js";

const contents = ({ postContent }) =>
  `# Compiler files
cache/
out/

# Ignores development broadcast logs
/broadcast/*/31337/
/broadcast/**/dry-run/

# Docs
docs/

# Dotenv file
.env
localhost.json
${postContent[0] || ''}`;

export default withDefaults(contents, {
  postContent: ''
})

