use dep::aes;
use dep::std;


fn main(cek: [u8; 16],                      //content encryption key
        nft: [u8; 16],                      //nft as a byte array
        enft:pub [u8; 16],                  //nft encrypted with the cek
        pubKeys: [Field; 4],                   //the list of public keys of the subscribers
        merkleRoot: Field                //the merkle root hash of all the public keys of the subscribers of the content creator
        )
{
    assert(aes::aes_128_enc(cek, nft) == enft); //to prove that the cek is indeed the valid cek for the content encrypted on the bl ockchain 
    assert(std::hash::hash_to_field(pubKeys) == merkleRoot); // to prove that the list of public keys to which the 

}
