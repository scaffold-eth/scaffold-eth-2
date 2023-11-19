# App for generating a ZKP that proves that the Content Encryption Key(Key) is valid

The prover is the Content Creator (CC)valid who created the NFT.
CEK and NFT metadata is passed into the function privately. 
The publicly available value of the encrypted NFT is compared by running the same encryption function using the NFT and the CEK. This proves that the CEK is valid. 

The hash of the public keys of the subscribers requesting to download the NFT is compared to the Merkle Root Hash. 

