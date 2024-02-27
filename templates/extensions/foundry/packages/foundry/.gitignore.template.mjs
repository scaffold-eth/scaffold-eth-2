const contents = () => 
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
`

export default contents