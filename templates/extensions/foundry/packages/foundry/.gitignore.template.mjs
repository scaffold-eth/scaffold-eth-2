const contents = () =>
  `# Compiler files
cache/
out/

# Ignores development broadcast logs

/broadcast/*/31337/
/broadcast/**/dry-run/

# Ignore 31337 deployments
/deployments/31337.json

# Docs
docs/

# Dotenv file
.env
localhost.json
`;

export default contents;

