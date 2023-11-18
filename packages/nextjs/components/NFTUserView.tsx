import { Button, Text } from "@chakra-ui/react";

export default function NFTUserView() {
  const nfts = ["NFT 1", "NFT 2"];
  return (
    <>
      {nfts.map((nft, index) => (
        <div key={index} className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-xl">
          <p>
            <Text mb={4} fontSize="lg" fontWeight="bold">
              {nft}
            </Text>
            <Button
              mb={2} // Margin bottom to create space between buttons
              className="btn-primary"
              size="md" // Choose your desired button size
              width="100%" // Make the button take full width
            >
              Mint
            </Button>
            <Button
              className="btn-primary"
              size="md" // Choose your desired button size
              width="100%" // Make the button take full width
            >
              Decrypt
            </Button>
          </p>
        </div>
      ))}
    </>
  );
}
