#!/bin/bash

set -e

KEYSTORE_DIR="$HOME/.foundry/keystores"
RPC_URL=$1

# Function to check balance
check_balance() {
    local address=$1
    local rpc_url=$2
    local result=$(curl -s -X POST -H "Content-Type: application/json" --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"$address\", \"latest\"],\"id\":1}" $rpc_url)
    local balance=$(echo $result | sed 's/.*"result":"\(0x[a-fA-F0-9]*\)".*/\1/')
    echo $balance
}

hex_to_decimal() {
    printf '%d\n' "$1"
}

# Function to convert wei to ether (simplified, shows only up to 6 decimal places)
wei_to_ether() {
    awk -v wei="$1" 'BEGIN {printf "%.6f\n", wei / 1000000000000000000}'
}

# Function to display balance
display_balance() {
    local address=$1
    local rpc_url=$2
    local balance_hex=$(check_balance "$address" "$rpc_url")
    local balance_wei=$(hex_to_decimal "$balance_hex")
    local balance_eth=$(wei_to_ether "$balance_wei")
    echo "Current balance: $balance_eth ETH" >&2
}

# Check if the keystore directory exists
if [ ! -d "$KEYSTORE_DIR" ]; then
    echo "No keystores found in $KEYSTORE_DIR, generating a new account..." >&2
    read -p "Enter a name for your new keystore: " keystore_name
    yarn account:generate --name "$keystore_name"
    if [ $? -ne 0 ]; then
        echo "Failed to generate a new account" >&2
        exit 1
    fi
fi

# List all keystores
keystores=($(ls "$KEYSTORE_DIR" | grep -v "scaffold-eth-default"))

if [ ${#keystores[@]} -eq 0 ]; then
    echo "No keystores found in $KEYSTORE_DIR, generating a new account..." >&2
    read -p "Enter a name for your new keystore: " keystore_name
    yarn account:generate --name "$keystore_name"
    if [ $? -ne 0 ]; then
        echo "Failed to generate a new account" >&2
        exit 1
    fi
    keystores=($(ls "$KEYSTORE_DIR"))
fi

echo "You can also create a new keystore with a custom name by running 'yarn account:generate --name <name>'" >&2
echo "Available options/keystores:" >&2
echo "0. Create new keystore" >&2
for i in "${!keystores[@]}"; do
    echo "$((i+1)). ${keystores[$i]}" >&2
done

# Prompt user to select a keystore
read -p "Select a keystore by entering the number (0-${#keystores[@]}): " selection

# Validate selection
if ! [[ "$selection" =~ ^[0-9]+$ ]] || [ "$selection" -lt 0 ] || [ "$selection" -gt "${#keystores[@]}" ]; then
    echo "Invalid selection" >&2
    exit 1
fi

if [ "$selection" -eq 0 ]; then
    read -p "Enter a name for your new keystore: " keystore_name
    echo "Generating a new keystore with the name: $keystore_name" >&2
    output=$(yarn account:generate --name "$keystore_name" 2>&1)
    if [ $? -ne 0 ]; then
        echo "Failed to generate a new account" >&2
        echo "$output" >&2
        exit 1
    fi
    # Extract the address from the output
    address=$(echo "$output" | grep -o '0x[0-9a-fA-F]\{40\}')
    if [ -z "$address" ]; then
        echo "Failed to extract address from output" >&2
        echo "$output" >&2
        exit 1
    fi
    selected_keystore="$keystore_name"
    echo "New keystore '$keystore_name' created and selected." >&2
else
    # Get the selected keystore
    selected_keystore="${keystores[$((selection-1))]}"
fi

# After selecting or creating the keystore
if [ -n "$selected_keystore" ]; then
    # Get the address from the keystore if not already set
    if [ -z "$address" ]; then
        address=$(cast wallet address --account $KEYSTORE_DIR/"$selected_keystore")
    fi
    echo "Selected address: $address" >&2

    while true; do
        display_balance $address $RPC_URL
        
        read -p "Do you want to proceed with deployment? (y/n/c for check balance again): " confirm
        case $confirm in
            [Yy]* ) 
                break
                ;;
            [Nn]* ) 
                echo "Deployment cancelled." >&2
                exit 1
                ;;
            [Cc]* )
                continue
                ;;
            * ) 
                echo "Please answer y (yes), n (no), or c (check balance again)." >&2
                ;;
        esac
    done
fi

# Output only the selected keystore filename
echo "$selected_keystore"
