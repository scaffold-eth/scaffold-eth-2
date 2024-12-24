.PHONY: build deploy generate-abis verify-keystore account chain compile flatten fork format lint test verify

DEPLOY_SCRIPT ?= script/Deploy.s.sol

# setup wallet for anvil
setup-anvil-wallet:
	shx rm ~/.foundry/keystores/scaffold-eth-default 2>/dev/null; \
	shx rm -rf broadcast/Deploy.s.sol/31337
	cast wallet import --private-key 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6 --unsafe-password 'localhost' scaffold-eth-default

# Start local chain
chain: setup-anvil-wallet
	anvil

# Start a fork
fork: setup-anvil-wallet
	anvil --fork-url ${FORK_URL} --chain-id 31337

# Deploy the contracts
deploy:
	@if [ ! -f "$(DEPLOY_SCRIPT)" ]; then \
		echo "Error: Deploy script '$(DEPLOY_SCRIPT)' not found"; \
		exit 1; \
	fi
	@if [ "$(RPC_URL)" = "localhost" ]; then \
		if [ "$(ETH_KEYSTORE_ACCOUNT)" = "scaffold-eth-default" ]; then \
			forge script $(DEPLOY_SCRIPT) --rpc-url localhost --password localhost --broadcast --legacy --ffi; \
		else \
			forge script $(DEPLOY_SCRIPT) --rpc-url localhost --broadcast --legacy --ffi; \
		fi \
	else \
		forge script $(DEPLOY_SCRIPT) --rpc-url $(RPC_URL) --broadcast --legacy --ffi; \
	fi

# Deploy and generate ABIs
deploy-and-generate-abis: deploy generate-abis

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

# Flatten contracts
flatten:
	forge flatten

# Format code
format:
	forge fmt && prettier --write ./scripts-js/**/*.js

# Lint code
lint:
	forge fmt --check && prettier --check ./script/**/*.js

# Verify contracts
verify:
	forge script script/VerifyAll.s.sol --ffi --rpc-url $(RPC_URL)
