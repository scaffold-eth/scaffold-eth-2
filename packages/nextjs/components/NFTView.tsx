import { Box, Button, Image, Text, VStack } from "@chakra-ui/react";

const mint = () => {
  console.log("minting");
};

const decrypt = () => {
  console.log("decrypt");
};

const buttonClassName = "w-full bg-blue-500 hover:bg-blue-700 text-white";

const NFTView = ({ title, description, photoUrl, fileUrl, isDecrypted, addMint }) => (
  <Box borderWidth="1px" borderRadius="lg" overflow="hidden" p="6" style={{ backgroundColor: "white" }}>
    <Image src={photoUrl} alt={title} />
    <VStack align="center" spacing={2}>
      <Text fontWeight="bold">{title}</Text>
      <Text>{description}</Text>
      {isDecrypted && (
        <Button as="a" href={fileUrl} className={buttonClassName} download>
          Download Content
        </Button>
      )}
      {!isDecrypted && (
        <Button className={buttonClassName} onClick={decrypt}>
          Decrypt
        </Button>
      )}
      {addMint && (
        <Button onClick={mint} className={buttonClassName}>
          Mint
        </Button>
      )}
    </VStack>
  </Box>
);
export default NFTView;
