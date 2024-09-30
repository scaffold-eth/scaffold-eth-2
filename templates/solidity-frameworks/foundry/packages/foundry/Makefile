.PHONY: build deploy generate-abis verify-keystore account chain compile deploy-verify flatten fork format lint test verify

# setup wallet for anvil
setup-anvil-wallet:
	shx rm ~/.foundry/keystores/scaffold-eth-default 2>/dev/null; \
	cast wallet import --private-key 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6 --unsafe-password 'localhost' scaffold-eth-default

# Start local chain
chain: setup-anvil-wallet
	anvil

# Start a fork
fork: setup-anvil-wallet
	anvil --fork-url ${FORK_URL} --chain-id 31337

# Build the project
build:
	forge build --build-info --build-info-path out/build-info/

# Deploy the project
deploy:
	@if [ "$(RPC_URL)" = "localhost" ]; then \
		forge script script/Deploy.s.sol --rpc-url localhost --password localhost --broadcast --legacy --ffi; \
	else \
		forge script script/Deploy.s.sol --rpc-url $(RPC_URL) --broadcast --legacy --ffi; \
	fi

# Build and deploy target
build-and-deploy: build deploy generate-abis

# Generate TypeScript ABIs
generate-abis:
	node scripts-js/generateTsAbis.js

verify-keystore:
	if grep -q "scaffold-eth-default" .env; then \
		cast wallet address --password localhost; \
  else \
		cast wallet address; \
  fi

# List account
account:
	@node scripts-js/ListAccount.js $$(make verify-keystore)

# Generate a new account
account-generate:
	@cast wallet import $(ACCOUNT_NAME) --private-key $$(cast wallet new | grep 'Private key:' | awk '{print $$3}')
	@echo "Please update .env file with ETH_KEYSTORE_ACCOUNT=$(ACCOUNT_NAME)"

# Import an existing account
account-import:
	@cast wallet import ${ACCOUNT_NAME} --interactive

# Compile contracts
compile:
	forge compile

# Deploy and verify
deploy-verify:
	@if [ "$(RPC_URL)" = "localhost" ]; then \
		forge script script/Deploy.s.sol --rpc-url localhost --password localhost --broadcast --legacy --ffi --verify; \
	else \
		forge script script/Deploy.s.sol --rpc-url $(RPC_URL) --broadcast --legacy --ffi --verify; \
	fi
	node scripts-js/generateTsAbis.js

# Flatten contracts
flatten:
	forge flatten

# Format code
format:
	forge fmt && prettier --write ./scripts-js/**/*.js

# Lint code
lint:
	forge fmt --check && prettier --check ./script/**/*.js

# Run tests
test:
	forge test

# Verify contracts
verify:
	forge script script/VerifyAll.s.sol --ffi --rpc-url $(RPC_URL)

build-and-verify: build verify

