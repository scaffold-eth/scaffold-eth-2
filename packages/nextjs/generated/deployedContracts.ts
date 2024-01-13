const contracts = {
  31337: [
    {
      name: "default_network",
      chainId: "31337",
      contracts: {
        NotaRegistrar: {
          address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
          abi: [
            {
              type: "constructor",
              inputs: [
                {
                  name: "newOwner",
                  type: "address",
                  internalType: "address",
                },
              ],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "approve",
              inputs: [
                {
                  name: "to",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "balanceOf",
              inputs: [
                {
                  name: "owner",
                  type: "address",
                  internalType: "address",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "cash",
              inputs: [
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "amount",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "to",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "moduleBytes",
                  type: "bytes",
                  internalType: "bytes",
                },
              ],
              outputs: [],
              stateMutability: "payable",
            },
            {
              type: "function",
              name: "contractURI",
              inputs: [],
              outputs: [
                {
                  name: "",
                  type: "string",
                  internalType: "string",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "fund",
              inputs: [
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "amount",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "instant",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "moduleBytes",
                  type: "bytes",
                  internalType: "bytes",
                },
              ],
              outputs: [],
              stateMutability: "payable",
            },
            {
              type: "function",
              name: "getApproved",
              inputs: [
                {
                  name: "tokenId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "address",
                  internalType: "address",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "isApprovedForAll",
              inputs: [
                {
                  name: "owner",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "operator",
                  type: "address",
                  internalType: "address",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "bool",
                  internalType: "bool",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "metadataUpdate",
              inputs: [
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "moduleRevenue",
              inputs: [
                {
                  name: "module",
                  type: "address",
                  internalType: "contract INotaModule",
                },
                {
                  name: "currency",
                  type: "address",
                  internalType: "address",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "moduleWhitelisted",
              inputs: [
                {
                  name: "module",
                  type: "address",
                  internalType: "contract INotaModule",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "bool",
                  internalType: "bool",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "moduleWithdraw",
              inputs: [
                {
                  name: "token",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "amount",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "to",
                  type: "address",
                  internalType: "address",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "name",
              inputs: [],
              outputs: [
                {
                  name: "",
                  type: "string",
                  internalType: "string",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "notaCurrency",
              inputs: [
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "address",
                  internalType: "address",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "notaEscrowed",
              inputs: [
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "notaInfo",
              inputs: [
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "tuple",
                  internalType: "struct Nota",
                  components: [
                    {
                      name: "escrowed",
                      type: "uint256",
                      internalType: "uint256",
                    },
                    {
                      name: "currency",
                      type: "address",
                      internalType: "address",
                    },
                    {
                      name: "module",
                      type: "address",
                      internalType: "contract INotaModule",
                    },
                  ],
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "notaModule",
              inputs: [
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "address",
                  internalType: "contract INotaModule",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "owner",
              inputs: [],
              outputs: [
                {
                  name: "",
                  type: "address",
                  internalType: "address",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "ownerOf",
              inputs: [
                {
                  name: "tokenId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "address",
                  internalType: "address",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "renounceOwnership",
              inputs: [],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "safeTransferFrom",
              inputs: [
                {
                  name: "from",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "to",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "tokenId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "safeTransferFrom",
              inputs: [
                {
                  name: "from",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "to",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "moduleBytes",
                  type: "bytes",
                  internalType: "bytes",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "setApprovalForAll",
              inputs: [
                {
                  name: "operator",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "approved",
                  type: "bool",
                  internalType: "bool",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "setContractURI",
              inputs: [
                {
                  name: "uri",
                  type: "string",
                  internalType: "string",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "supportsInterface",
              inputs: [
                {
                  name: "interfaceId",
                  type: "bytes4",
                  internalType: "bytes4",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "bool",
                  internalType: "bool",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "symbol",
              inputs: [],
              outputs: [
                {
                  name: "",
                  type: "string",
                  internalType: "string",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "tokenURI",
              inputs: [
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "string",
                  internalType: "string",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "tokenWhitelisted",
              inputs: [
                {
                  name: "token",
                  type: "address",
                  internalType: "address",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "bool",
                  internalType: "bool",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "totalSupply",
              inputs: [],
              outputs: [
                {
                  name: "",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "transferFrom",
              inputs: [
                {
                  name: "from",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "to",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "transferOwnership",
              inputs: [
                {
                  name: "newOwner",
                  type: "address",
                  internalType: "address",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "validWrite",
              inputs: [
                {
                  name: "module",
                  type: "address",
                  internalType: "contract INotaModule",
                },
                {
                  name: "token",
                  type: "address",
                  internalType: "address",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "bool",
                  internalType: "bool",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "whitelistModule",
              inputs: [
                {
                  name: "module",
                  type: "address",
                  internalType: "contract INotaModule",
                },
                {
                  name: "isWhitelisted",
                  type: "bool",
                  internalType: "bool",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "whitelistToken",
              inputs: [
                {
                  name: "token",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "isWhitelisted",
                  type: "bool",
                  internalType: "bool",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "write",
              inputs: [
                {
                  name: "currency",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "escrowed",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "instant",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "owner",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "module",
                  type: "address",
                  internalType: "contract INotaModule",
                },
                {
                  name: "moduleBytes",
                  type: "bytes",
                  internalType: "bytes",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              stateMutability: "payable",
            },
            {
              type: "event",
              name: "Approval",
              inputs: [
                {
                  name: "owner",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "approved",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "tokenId",
                  type: "uint256",
                  indexed: true,
                  internalType: "uint256",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "ApprovalForAll",
              inputs: [
                {
                  name: "owner",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "operator",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "approved",
                  type: "bool",
                  indexed: false,
                  internalType: "bool",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "BatchMetadataUpdate",
              inputs: [
                {
                  name: "_fromTokenId",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "_toTokenId",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "Cashed",
              inputs: [
                {
                  name: "casher",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "notaId",
                  type: "uint256",
                  indexed: true,
                  internalType: "uint256",
                },
                {
                  name: "to",
                  type: "address",
                  indexed: false,
                  internalType: "address",
                },
                {
                  name: "amount",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "cashData",
                  type: "bytes",
                  indexed: true,
                  internalType: "bytes",
                },
                {
                  name: "moduleFee",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "timestamp",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "ContractURIUpdated",
              inputs: [],
              anonymous: false,
            },
            {
              type: "event",
              name: "Funded",
              inputs: [
                {
                  name: "funder",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "notaId",
                  type: "uint256",
                  indexed: true,
                  internalType: "uint256",
                },
                {
                  name: "amount",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "instant",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "fundData",
                  type: "bytes",
                  indexed: true,
                  internalType: "bytes",
                },
                {
                  name: "moduleFee",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "timestamp",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "MetadataUpdate",
              inputs: [
                {
                  name: "_tokenId",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "ModuleWhitelisted",
              inputs: [
                {
                  name: "user",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "module",
                  type: "address",
                  indexed: true,
                  internalType: "contract INotaModule",
                },
                {
                  name: "isAccepted",
                  type: "bool",
                  indexed: false,
                  internalType: "bool",
                },
                {
                  name: "timestamp",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "OwnershipTransferred",
              inputs: [
                {
                  name: "previousOwner",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "newOwner",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "TokenWhitelisted",
              inputs: [
                {
                  name: "caller",
                  type: "address",
                  indexed: false,
                  internalType: "address",
                },
                {
                  name: "token",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "accepted",
                  type: "bool",
                  indexed: true,
                  internalType: "bool",
                },
                {
                  name: "timestamp",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "Transfer",
              inputs: [
                {
                  name: "from",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "to",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "tokenId",
                  type: "uint256",
                  indexed: true,
                  internalType: "uint256",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "Transferred",
              inputs: [
                {
                  name: "tokenId",
                  type: "uint256",
                  indexed: true,
                  internalType: "uint256",
                },
                {
                  name: "from",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "to",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "moduleFee",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "fundData",
                  type: "bytes",
                  indexed: false,
                  internalType: "bytes",
                },
                {
                  name: "timestamp",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "Written",
              inputs: [
                {
                  name: "caller",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "notaId",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "owner",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "instant",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "currency",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "escrowed",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "timestamp",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "moduleFee",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "module",
                  type: "address",
                  indexed: false,
                  internalType: "contract INotaModule",
                },
                {
                  name: "moduleData",
                  type: "bytes",
                  indexed: false,
                  internalType: "bytes",
                },
              ],
              anonymous: false,
            },
            {
              type: "error",
              name: "InsufficientEscrow",
              inputs: [
                {
                  name: "",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
            },
            {
              type: "error",
              name: "InsufficientValue",
              inputs: [
                {
                  name: "",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
            },
            {
              type: "error",
              name: "InvalidWrite",
              inputs: [
                {
                  name: "",
                  type: "address",
                  internalType: "contract INotaModule",
                },
                {
                  name: "",
                  type: "address",
                  internalType: "address",
                },
              ],
            },
            {
              type: "error",
              name: "NonExistent",
              inputs: [],
            },
            {
              type: "error",
              name: "SelfApproval",
              inputs: [],
            },
            {
              type: "error",
              name: "SendFailed",
              inputs: [],
            },
          ],
        },
      },
    },
  ],
  137: [
    {
      name: "polygon",
      chainId: "137",
      contracts: {
        NotaRegistrar: {
          address: "0x000000003C9C54B98C17F5A8B05ADca5B3B041eD",
          abi: [
            {
              type: "constructor",
              inputs: [
                {
                  name: "newOwner",
                  type: "address",
                  internalType: "address",
                },
              ],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "approve",
              inputs: [
                {
                  name: "to",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "balanceOf",
              inputs: [
                {
                  name: "owner",
                  type: "address",
                  internalType: "address",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "cash",
              inputs: [
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "amount",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "to",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "moduleBytes",
                  type: "bytes",
                  internalType: "bytes",
                },
              ],
              outputs: [],
              stateMutability: "payable",
            },
            {
              type: "function",
              name: "contractURI",
              inputs: [],
              outputs: [
                {
                  name: "",
                  type: "string",
                  internalType: "string",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "fund",
              inputs: [
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "amount",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "instant",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "moduleBytes",
                  type: "bytes",
                  internalType: "bytes",
                },
              ],
              outputs: [],
              stateMutability: "payable",
            },
            {
              type: "function",
              name: "getApproved",
              inputs: [
                {
                  name: "tokenId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "address",
                  internalType: "address",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "isApprovedForAll",
              inputs: [
                {
                  name: "owner",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "operator",
                  type: "address",
                  internalType: "address",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "bool",
                  internalType: "bool",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "metadataUpdate",
              inputs: [
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "moduleRevenue",
              inputs: [
                {
                  name: "module",
                  type: "address",
                  internalType: "contract INotaModule",
                },
                {
                  name: "currency",
                  type: "address",
                  internalType: "address",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "moduleWhitelisted",
              inputs: [
                {
                  name: "module",
                  type: "address",
                  internalType: "contract INotaModule",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "bool",
                  internalType: "bool",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "moduleWithdraw",
              inputs: [
                {
                  name: "token",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "amount",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "to",
                  type: "address",
                  internalType: "address",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "name",
              inputs: [],
              outputs: [
                {
                  name: "",
                  type: "string",
                  internalType: "string",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "notaCurrency",
              inputs: [
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "address",
                  internalType: "address",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "notaEscrowed",
              inputs: [
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "notaInfo",
              inputs: [
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "tuple",
                  internalType: "struct Nota",
                  components: [
                    {
                      name: "escrowed",
                      type: "uint256",
                      internalType: "uint256",
                    },
                    {
                      name: "currency",
                      type: "address",
                      internalType: "address",
                    },
                    {
                      name: "module",
                      type: "address",
                      internalType: "contract INotaModule",
                    },
                  ],
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "notaModule",
              inputs: [
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "address",
                  internalType: "contract INotaModule",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "owner",
              inputs: [],
              outputs: [
                {
                  name: "",
                  type: "address",
                  internalType: "address",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "ownerOf",
              inputs: [
                {
                  name: "tokenId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "address",
                  internalType: "address",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "renounceOwnership",
              inputs: [],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "safeTransferFrom",
              inputs: [
                {
                  name: "from",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "to",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "tokenId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "safeTransferFrom",
              inputs: [
                {
                  name: "from",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "to",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "moduleBytes",
                  type: "bytes",
                  internalType: "bytes",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "setApprovalForAll",
              inputs: [
                {
                  name: "operator",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "approved",
                  type: "bool",
                  internalType: "bool",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "setContractURI",
              inputs: [
                {
                  name: "uri",
                  type: "string",
                  internalType: "string",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "supportsInterface",
              inputs: [
                {
                  name: "interfaceId",
                  type: "bytes4",
                  internalType: "bytes4",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "bool",
                  internalType: "bool",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "symbol",
              inputs: [],
              outputs: [
                {
                  name: "",
                  type: "string",
                  internalType: "string",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "tokenURI",
              inputs: [
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "string",
                  internalType: "string",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "tokenWhitelisted",
              inputs: [
                {
                  name: "token",
                  type: "address",
                  internalType: "address",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "bool",
                  internalType: "bool",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "totalSupply",
              inputs: [],
              outputs: [
                {
                  name: "",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "transferFrom",
              inputs: [
                {
                  name: "from",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "to",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "notaId",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "transferOwnership",
              inputs: [
                {
                  name: "newOwner",
                  type: "address",
                  internalType: "address",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "validWrite",
              inputs: [
                {
                  name: "module",
                  type: "address",
                  internalType: "contract INotaModule",
                },
                {
                  name: "token",
                  type: "address",
                  internalType: "address",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "bool",
                  internalType: "bool",
                },
              ],
              stateMutability: "view",
            },
            {
              type: "function",
              name: "whitelistModule",
              inputs: [
                {
                  name: "module",
                  type: "address",
                  internalType: "contract INotaModule",
                },
                {
                  name: "isWhitelisted",
                  type: "bool",
                  internalType: "bool",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "whitelistToken",
              inputs: [
                {
                  name: "token",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "isWhitelisted",
                  type: "bool",
                  internalType: "bool",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
            {
              type: "function",
              name: "write",
              inputs: [
                {
                  name: "currency",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "escrowed",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "instant",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "owner",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "module",
                  type: "address",
                  internalType: "contract INotaModule",
                },
                {
                  name: "moduleBytes",
                  type: "bytes",
                  internalType: "bytes",
                },
              ],
              outputs: [
                {
                  name: "",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
              stateMutability: "payable",
            },
            {
              type: "event",
              name: "Approval",
              inputs: [
                {
                  name: "owner",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "approved",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "tokenId",
                  type: "uint256",
                  indexed: true,
                  internalType: "uint256",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "ApprovalForAll",
              inputs: [
                {
                  name: "owner",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "operator",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "approved",
                  type: "bool",
                  indexed: false,
                  internalType: "bool",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "BatchMetadataUpdate",
              inputs: [
                {
                  name: "_fromTokenId",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "_toTokenId",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "Cashed",
              inputs: [
                {
                  name: "casher",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "notaId",
                  type: "uint256",
                  indexed: true,
                  internalType: "uint256",
                },
                {
                  name: "to",
                  type: "address",
                  indexed: false,
                  internalType: "address",
                },
                {
                  name: "amount",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "cashData",
                  type: "bytes",
                  indexed: true,
                  internalType: "bytes",
                },
                {
                  name: "moduleFee",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "timestamp",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "ContractURIUpdated",
              inputs: [],
              anonymous: false,
            },
            {
              type: "event",
              name: "Funded",
              inputs: [
                {
                  name: "funder",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "notaId",
                  type: "uint256",
                  indexed: true,
                  internalType: "uint256",
                },
                {
                  name: "amount",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "instant",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "fundData",
                  type: "bytes",
                  indexed: true,
                  internalType: "bytes",
                },
                {
                  name: "moduleFee",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "timestamp",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "MetadataUpdate",
              inputs: [
                {
                  name: "_tokenId",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "ModuleWhitelisted",
              inputs: [
                {
                  name: "user",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "module",
                  type: "address",
                  indexed: true,
                  internalType: "contract INotaModule",
                },
                {
                  name: "isAccepted",
                  type: "bool",
                  indexed: false,
                  internalType: "bool",
                },
                {
                  name: "timestamp",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "OwnershipTransferred",
              inputs: [
                {
                  name: "previousOwner",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "newOwner",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "TokenWhitelisted",
              inputs: [
                {
                  name: "caller",
                  type: "address",
                  indexed: false,
                  internalType: "address",
                },
                {
                  name: "token",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "accepted",
                  type: "bool",
                  indexed: true,
                  internalType: "bool",
                },
                {
                  name: "timestamp",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "Transfer",
              inputs: [
                {
                  name: "from",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "to",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "tokenId",
                  type: "uint256",
                  indexed: true,
                  internalType: "uint256",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "Transferred",
              inputs: [
                {
                  name: "tokenId",
                  type: "uint256",
                  indexed: true,
                  internalType: "uint256",
                },
                {
                  name: "from",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "to",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "moduleFee",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "fundData",
                  type: "bytes",
                  indexed: false,
                  internalType: "bytes",
                },
                {
                  name: "timestamp",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
              ],
              anonymous: false,
            },
            {
              type: "event",
              name: "Written",
              inputs: [
                {
                  name: "caller",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "notaId",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "owner",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "instant",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "currency",
                  type: "address",
                  indexed: true,
                  internalType: "address",
                },
                {
                  name: "escrowed",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "timestamp",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "moduleFee",
                  type: "uint256",
                  indexed: false,
                  internalType: "uint256",
                },
                {
                  name: "module",
                  type: "address",
                  indexed: false,
                  internalType: "contract INotaModule",
                },
                {
                  name: "moduleData",
                  type: "bytes",
                  indexed: false,
                  internalType: "bytes",
                },
              ],
              anonymous: false,
            },
            {
              type: "error",
              name: "InsufficientEscrow",
              inputs: [
                {
                  name: "",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
            },
            {
              type: "error",
              name: "InsufficientValue",
              inputs: [
                {
                  name: "",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
            },
            {
              type: "error",
              name: "InvalidWrite",
              inputs: [
                {
                  name: "",
                  type: "address",
                  internalType: "contract INotaModule",
                },
                {
                  name: "",
                  type: "address",
                  internalType: "address",
                },
              ],
            },
            {
              type: "error",
              name: "NonExistent",
              inputs: [],
            },
            {
              type: "error",
              name: "SelfApproval",
              inputs: [],
            },
            {
              type: "error",
              name: "SendFailed",
              inputs: [],
            },
          ],
        },
      },
    },
  ],
} as const;

export default contracts;
